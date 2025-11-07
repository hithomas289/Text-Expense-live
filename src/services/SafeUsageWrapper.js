const UnifiedUsageService = require('./UnifiedUsageService');
const { sequelize } = require('../config/database');

/*
 * SafeUsageWrapper - Atomic Usage Operations
 *
 * This wrapper ensures all receipt processing operations are atomic
 * and usage tracking is consistent even if operations fail.
 */
class SafeUsageWrapper {

  /*
   * Safely process expense with atomic usage tracking
   */
  static async processExpenseWithUsage(userId, expenseData, processingFunction) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Check limits BEFORE processing
      const usageCheck = await UnifiedUsageService.canProcessReceipt(userId);

      if (!usageCheck.canProcess) {
        throw new Error(`Receipt limit reached: ${usageCheck.used}/${usageCheck.limit} for ${usageCheck.planType} plan`);
      }

      console.log(`🔒 Processing expense for user ${userId} (${usageCheck.used + 1}/${usageCheck.limit})`);

      // 2. Execute the actual processing function within transaction
      const result = await processingFunction(expenseData, transaction);

      // 3. Increment usage ONLY after successful processing
      await UnifiedUsageService.incrementUsage(userId, 'expense', transaction);

      // 4. Commit everything together
      await transaction.commit();

      console.log(`✅ Expense processed and usage incremented atomically for user ${userId}`);

      return {
        success: true,
        result,
        usage: await UnifiedUsageService.canProcessReceipt(userId) // Get updated usage
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Expense processing failed:', error);

      return {
        success: false,
        error: error.message,
        usage: await UnifiedUsageService.canProcessReceipt(userId) // Get current usage
      };
    }
  }

  /*
   * Safely save receipt with atomic usage tracking
   */
  static async saveReceiptWithUsage(userId, receiptData, savingFunction) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Check limits BEFORE saving
      const usageCheck = await UnifiedUsageService.canProcessReceipt(userId);

      if (!usageCheck.canProcess) {
        throw new Error(`Receipt limit reached: ${usageCheck.used}/${usageCheck.limit} for ${usageCheck.planType} plan`);
      }

      console.log(`🔒 Saving receipt for user ${userId} (${usageCheck.used + 1}/${usageCheck.limit})`);

      // 2. Execute the actual saving function within transaction
      const result = await savingFunction(receiptData, transaction);

      // 3. Increment usage ONLY after successful saving
      await UnifiedUsageService.incrementUsage(userId, 'saved', transaction);

      // 4. Commit everything together
      await transaction.commit();

      console.log(`✅ Receipt saved and usage incremented atomically for user ${userId}`);

      return {
        success: true,
        result,
        usage: await UnifiedUsageService.canProcessReceipt(userId) // Get updated usage
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Receipt saving failed:', error);

      return {
        success: false,
        error: error.message,
        usage: await UnifiedUsageService.canProcessReceipt(userId) // Get current usage
      };
    }
  }

  /*
   * Pre-validate user can process receipt (for early checks)
   */
  static async validateCanProcess(userId) {
    try {
      const usageCheck = await UnifiedUsageService.canProcessReceipt(userId);

      if (!usageCheck.canProcess) {
        return {
          allowed: false,
          reason: `Receipt limit reached: ${usageCheck.used}/${usageCheck.limit} for ${usageCheck.planType} plan`,
          usage: usageCheck
        };
      }

      return {
        allowed: true,
        reason: `${usageCheck.remaining} receipts remaining`,
        usage: usageCheck
      };

    } catch (error) {
      console.error('Error validating processing eligibility:', error);
      return {
        allowed: false,
        reason: 'Unable to verify usage limits',
        error: error.message
      };
    }
  }

  /*
   * Get user's current usage status (for display)
   */
  static async getUserUsageStatus(userId) {
    try {
      const usage = await UnifiedUsageService.canProcessReceipt(userId);

      return {
        success: true,
        planType: usage.planType,
        used: usage.used,
        limit: usage.limit,
        remaining: usage.remaining,
        canProcess: usage.canProcess,
        breakdown: usage.breakdown,
        message: usage.remaining > 0
          ? `${usage.used}/${usage.limit} receipts used this month (${usage.remaining} remaining)`
          : `${usage.used}/${usage.limit} receipts used this month`
      };

    } catch (error) {
      console.error('Error getting usage status:', error);
      return {
        success: false,
        error: error.message,
        message: 'Unable to check usage status'
      };
    }
  }

  /*
   * Handle usage for file upload (before OCR processing)
   */
  static async reserveUsageSlot(userId) {
    try {
      // Pre-validate but don't increment yet
      const validation = await this.validateCanProcess(userId);

      if (!validation.allowed) {
        return {
          reserved: false,
          reason: validation.reason,
          usage: validation.usage
        };
      }

      // Return reservation token (can be used to increment later)
      return {
        reserved: true,
        token: `${userId}_${Date.now()}`,
        usage: validation.usage,
        message: 'Upload slot reserved - processing can proceed'
      };

    } catch (error) {
      console.error('Error reserving usage slot:', error);
      return {
        reserved: false,
        reason: 'Unable to verify usage limits',
        error: error.message
      };
    }
  }

  /*
   * Emergency rollback for failed operations
   */
  static async rollbackUsage(userId, type = 'expense') {
    const transaction = await sequelize.transaction();

    try {
      console.log(`🔄 Rolling back ${type} usage for user ${userId}`);

      const actualUsage = await UnifiedUsageService.getActualUsage(userId);
      const planLimits = await UnifiedUsageService.getPlanLimits(userId);

      // Update tracking tables to match actual database
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      await sequelize.query(`
        INSERT INTO usage_limits (user_id, month_year, expenses_processed, receipts_saved, total_receipts, receipts_limit, created_at, updated_at)
        VALUES (:userId, :monthStart, :expenses, :saved, :total, :limit, NOW(), NOW())
        ON CONFLICT (user_id, month_year)
        DO UPDATE SET
          expenses_processed = :expenses,
          receipts_saved = :saved,
          total_receipts = :total,
          receipts_limit = :limit,
          updated_at = NOW()
      `, {
        replacements: {
          userId,
          monthStart,
          expenses: actualUsage.expenses,
          saved: actualUsage.saved,
          total: actualUsage.total,
          limit: planLimits.limit
        },
        transaction
      });

      await sequelize.query(`
        UPDATE users
        SET
          "receiptsUsedThisMonth" = :total,
          "savedReceiptsUsedThisMonth" = :saved,
          "updatedAt" = NOW()
        WHERE id = :userId
      `, {
        replacements: {
          userId,
          total: actualUsage.total,
          saved: actualUsage.saved
        },
        transaction
      });

      await transaction.commit();

      console.log(`✅ Usage rollback completed for user ${userId}`);
      return { success: true, actualUsage, planLimits };

    } catch (error) {
      await transaction.rollback();
      console.error('Error rolling back usage:', error);
      throw new Error(`Failed to rollback usage for user ${userId}: ${error.message}`);
    }
  }
}

module.exports = SafeUsageWrapper;