const { sequelize } = require('../config/database');

/*
 * Cleanup Job: Reset stuck paymentInProgress flags
 *
 * Runs periodically to clear payment flags that are stuck for > 1 hour
 * This handles cases where:
 * - User cancels payment on Stripe page
 * - Payment fails
 * - User closes browser without completing
 */
class CleanupPaymentFlags {
  constructor() {
    this.TIMEOUT_MINUTES = 60; // Clear flags older than 1 hour
  }

  /*
   * Clean up stuck payment flags
   */
  async cleanup() {
    try {
      console.log('🧹 Running payment flag cleanup job...');

      const timeoutDate = new Date(Date.now() - this.TIMEOUT_MINUTES * 60 * 1000);

      // Reset paymentInProgress for sessions where:
      // 1. paymentInProgress = true
      // 2. paymentStartTime is older than TIMEOUT_MINUTES OR is invalid
      const [results] = await sequelize.query(`
        UPDATE sessions
        SET metadata = jsonb_set(
          COALESCE(metadata, '{}'::jsonb),
          '{paymentInProgress}',
          'false'::jsonb
        )
        WHERE metadata->>'paymentInProgress' = 'true'
          AND (
            metadata->>'paymentStartTime' IS NULL
            OR metadata->>'paymentStartTime' = '{}'
            OR metadata->>'paymentStartTime' = ''
            OR (
              metadata->>'paymentStartTime' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}'
              AND (metadata->>'paymentStartTime')::timestamp < :timeoutDate
            )
          )
        RETURNING "userId",
                  metadata->>'paymentStartTime' as payment_started,
                  metadata->>'paymentInProgress' as new_value;
      `, {
        replacements: { timeoutDate: timeoutDate.toISOString() }
      });

      if (results.length > 0) {
        console.log(`✅ Cleaned up ${results.length} stuck payment flags`);
        results.forEach(r => {
          console.log(`   - User ${r.userId}: started ${r.payment_started}`);
        });
      } else {
        console.log('✨ No stuck payment flags found');
      }

      return {
        success: true,
        cleaned: results.length,
        sessions: results
      };

    } catch (error) {
      console.error('❌ Error cleaning up payment flags:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /*
   * Start the cleanup job on an interval
   * @param {number} intervalMinutes - How often to run (default: 15 minutes)
   */
  start(intervalMinutes = 15) {
    console.log(`🚀 Starting payment flag cleanup job (runs every ${intervalMinutes} minutes)`);

    // Run immediately on start
    this.cleanup();

    // Then run on interval
    this.interval = setInterval(() => {
      this.cleanup();
    }, intervalMinutes * 60 * 1000);

    return this.interval;
  }

  /*
   * Stop the cleanup job
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      console.log('🛑 Stopped payment flag cleanup job');
    }
  }
}

module.exports = CleanupPaymentFlags;
