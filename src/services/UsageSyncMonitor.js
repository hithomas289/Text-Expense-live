const UnifiedUsageService = require('./UnifiedUsageService');
const { sequelize } = require('../config/database');

/*
 * UsageSyncMonitor - Automated Sync Monitoring and Alerting
 *
 * This service continuously monitors for sync issues and provides
 * automated fixes and alerts when discrepancies are detected.
 */
class UsageSyncMonitor {

  /*
   * Run comprehensive sync audit and auto-fix minor issues
   */
  static async runSyncAudit(autoFix = true) {
    try {
      console.log('🔍 Starting comprehensive usage sync audit...');
      const startTime = Date.now();

      const auditResults = await UnifiedUsageService.auditAllUsers();

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      const summary = {
        timestamp: new Date().toISOString(),
        duration: `${duration}s`,
        users: {
          total: auditResults.total,
          synced: auditResults.synced,
          fixed: auditResults.fixed,
          errors: auditResults.errors
        },
        details: auditResults.details,
        autoFixEnabled: autoFix
      };

      // Log summary
      console.log(`\n📊 USAGE SYNC AUDIT COMPLETE`);
      console.log(`Duration: ${duration}s`);
      console.log(`Users: ${auditResults.total} total, ${auditResults.synced} synced, ${auditResults.fixed} fixed, ${auditResults.errors} errors`);

      // Alert on errors
      if (auditResults.errors > 0) {
        console.error(`❌ ${auditResults.errors} users had sync errors - manual review required`);
        await this.sendSyncAlert('ERRORS_DETECTED', summary);
      }

      // Alert on many fixes
      if (auditResults.fixed > auditResults.total * 0.1) { // More than 10% needed fixes
        console.warn(`⚠️ High sync fix rate: ${auditResults.fixed}/${auditResults.total} users needed fixes`);
        await this.sendSyncAlert('HIGH_FIX_RATE', summary);
      }

      return summary;

    } catch (error) {
      console.error('❌ Sync audit failed:', error);
      await this.sendSyncAlert('AUDIT_FAILED', { error: error.message });
      throw error;
    }
  }

  /*
   * Check specific user for sync issues (real-time validation)
   */
  static async checkUserSync(userId) {
    try {
      const result = await UnifiedUsageService.validateAndFixSync(userId);

      if (result.fixed) {
        console.log(`🔧 Auto-fixed sync issues for user ${userId}: ${result.issues.join(', ')}`);
      }

      return {
        userId,
        synced: !result.fixed,
        issues: result.issues,
        actualUsage: result.actualUsage,
        planLimits: result.planLimits,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Sync check failed for user ${userId}:`, error);
      return {
        userId,
        synced: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /*
   * Monitor usage patterns for anomalies
   */
  static async detectUsageAnomalies() {
    try {
      console.log('🔍 Detecting usage anomalies...');

      // Find users with suspicious patterns
      const [anomalies] = await sequelize.query(`
        WITH user_stats AS (
          SELECT
            u.id,
            u."planType",
            u."receiptsUsedThisMonth",
            u."receiptsUsedTotal",
            ul.total_receipts,
            ul.receipts_limit,
            (
              SELECT COUNT(*) FROM expenses e
              WHERE e."userId" = u.id
              AND EXTRACT(MONTH FROM e."createdAt") = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM e."createdAt") = EXTRACT(YEAR FROM CURRENT_DATE)
            ) as actual_expenses,
            (
              SELECT COUNT(*) FROM saved_receipts sr
              WHERE sr."userId" = u.id
              AND EXTRACT(MONTH FROM sr."createdAt") = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM sr."createdAt") = EXTRACT(YEAR FROM CURRENT_DATE)
            ) as actual_saved
          FROM users u
          LEFT JOIN usage_limits ul ON u.id = ul.user_id
            AND ul.month_year = DATE_TRUNC('month', CURRENT_DATE)
          WHERE u."receiptsUsedThisMonth" > 0 OR ul.total_receipts > 0
        )
        SELECT
          id,
          "planType",
          "receiptsUsedThisMonth",
          total_receipts,
          receipts_limit,
          actual_expenses,
          actual_saved,
          (actual_expenses + actual_saved) as actual_total,
          CASE
            WHEN "receiptsUsedThisMonth" != (actual_expenses + actual_saved) THEN 'USER_TABLE_MISMATCH'
            WHEN total_receipts != (actual_expenses + actual_saved) THEN 'USAGE_LIMITS_MISMATCH'
            WHEN (actual_expenses + actual_saved) > receipts_limit THEN 'LIMIT_EXCEEDED'
            WHEN total_receipts IS NULL THEN 'MISSING_USAGE_RECORD'
            ELSE 'OK'
          END as anomaly_type
        FROM user_stats
        WHERE
          "receiptsUsedThisMonth" != (actual_expenses + actual_saved)
          OR total_receipts != (actual_expenses + actual_saved)
          OR (actual_expenses + actual_saved) > receipts_limit
          OR total_receipts IS NULL
        ORDER BY actual_total DESC
      `);

      if (anomalies.length > 0) {
        console.log(`⚠️ Found ${anomalies.length} usage anomalies:`);
        anomalies.forEach(anomaly => {
          console.log(`- User ${anomaly.id} (${anomaly.planType}): ${anomaly.anomaly_type}`);
        });

        await this.sendSyncAlert('ANOMALIES_DETECTED', { count: anomalies.length, anomalies });
      } else {
        console.log('✅ No usage anomalies detected');
      }

      return anomalies;

    } catch (error) {
      console.error('❌ Anomaly detection failed:', error);
      await this.sendSyncAlert('ANOMALY_DETECTION_FAILED', { error: error.message });
      return [];
    }
  }

  /*
   * Generate usage health report
   */
  static async generateHealthReport() {
    try {
      console.log('📋 Generating usage health report...');

      const [healthStats] = await sequelize.query(`
        WITH health_stats AS (
          SELECT
            u."planType",
            COUNT(*) as total_users,
            COUNT(ul.id) as users_with_tracking,
            AVG(ul.total_receipts) as avg_usage,
            SUM(CASE WHEN ul.total_receipts >= ul.receipts_limit THEN 1 ELSE 0 END) as users_at_limit,
            COUNT(CASE WHEN u."receiptsUsedThisMonth" != ul.total_receipts THEN 1 END) as sync_issues
          FROM users u
          LEFT JOIN usage_limits ul ON u.id = ul.user_id
            AND ul.month_year = DATE_TRUNC('month', CURRENT_DATE)
          GROUP BY u."planType"
        )
        SELECT
          "planType",
          total_users,
          users_with_tracking,
          ROUND(avg_usage, 2) as avg_usage,
          users_at_limit,
          sync_issues,
          ROUND(100.0 * users_with_tracking / total_users, 1) as tracking_coverage_pct,
          ROUND(100.0 * sync_issues / total_users, 1) as sync_issue_rate_pct
        FROM health_stats
        ORDER BY total_users DESC
      `);

      const report = {
        timestamp: new Date().toISOString(),
        planStats: healthStats,
        summary: {
          totalUsers: healthStats.reduce((sum, stat) => sum + stat.total_users, 0),
          totalSyncIssues: healthStats.reduce((sum, stat) => sum + stat.sync_issues, 0),
          avgTrackingCoverage: healthStats.reduce((sum, stat) => sum + stat.tracking_coverage_pct, 0) / healthStats.length
        }
      };

      console.log('\n📊 USAGE HEALTH REPORT');
      console.table(healthStats);

      // Alert on poor health
      if (report.summary.totalSyncIssues > report.summary.totalUsers * 0.05) { // More than 5% sync issues
        await this.sendSyncAlert('POOR_HEALTH', report);
      }

      return report;

    } catch (error) {
      console.error('❌ Health report generation failed:', error);
      await this.sendSyncAlert('HEALTH_REPORT_FAILED', { error: error.message });
      throw error;
    }
  }

  /*
   * Send sync alerts (placeholder for notification system)
   */
  static async sendSyncAlert(alertType, data) {
    const alert = {
      type: alertType,
      timestamp: new Date().toISOString(),
      data
    };

    // Log alert for now (integrate with notification system later)
    console.log(`🚨 SYNC ALERT [${alertType}]:`, JSON.stringify(data, null, 2));

    // TODO: Integrate with your notification system (email, Slack, etc.)
    // await notificationService.send(alert);

    return alert;
  }

  /*
   * Schedule monitoring tasks (call this from cron job)
   */
  static async runScheduledMonitoring() {
    try {
      console.log('⏰ Running scheduled usage monitoring...');

      const tasks = await Promise.allSettled([
        this.runSyncAudit(true),
        this.detectUsageAnomalies(),
        this.generateHealthReport()
      ]);

      const results = {
        timestamp: new Date().toISOString(),
        tasks: {
          syncAudit: tasks[0].status === 'fulfilled' ? tasks[0].value : { error: tasks[0].reason?.message },
          anomalyDetection: tasks[1].status === 'fulfilled' ? tasks[1].value : { error: tasks[1].reason?.message },
          healthReport: tasks[2].status === 'fulfilled' ? tasks[2].value : { error: tasks[2].reason?.message }
        }
      };

      console.log('✅ Scheduled monitoring completed');
      return results;

    } catch (error) {
      console.error('❌ Scheduled monitoring failed:', error);
      await this.sendSyncAlert('MONITORING_FAILED', { error: error.message });
      throw error;
    }
  }
}

module.exports = UsageSyncMonitor;