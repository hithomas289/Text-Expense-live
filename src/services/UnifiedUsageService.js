const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

/*
 * UnifiedUsageService - Single Source of Truth for Usage Tracking
 *
 * This service consolidates all usage tracking into one reliable system.
 * It replaces the fragmented tracking across multiple tables and counters.
 */
class UnifiedUsageService {

  /*
   * Get current month's actual usage from database (most accurate)
   * Returns breakdown by planType for transparent reporting
   */
  static async getActualUsage(userId) {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

    try {
      // Get user's plan info
      const [userInfo] = await sequelize.query(`
        SELECT "planType", "planUpgradedAt", "createdAt"
        FROM users
        WHERE id = :userId
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      if (userInfo.planType === 'trial') {
        // Trial users - count ALL TIME usage (trial is one-time total, not monthly)
        console.log(`🔍 TRIAL USER: Counting all-time usage (no date filter)`);

        const [expenseResult] = await sequelize.query(`
          SELECT COUNT(*) as count FROM expenses WHERE "userId" = :userId
        `, {
          replacements: { userId },
          type: sequelize.QueryTypes.SELECT
        });

        const [savedResult] = await sequelize.query(`
          SELECT COUNT(*) as count FROM saved_receipts
          WHERE "userId" = :userId AND "isActive" = true
        `, {
          replacements: { userId },
          type: sequelize.QueryTypes.SELECT
        });

        const expenses = parseInt(expenseResult.count) || 0;
        const saved = parseInt(savedResult.count) || 0;
        const total = expenses + saved;

        console.log(`📊 Trial usage: ${expenses} expenses + ${saved} saved = ${total} total (all-time)`);

        return {
          expenses,
          saved,
          total,
          monthStart,
          byPlan: {
            trial: { expenses, saved, total }
          },
          currentPlanTotal: total
        };
      } else if (userInfo.planType === 'free') {
        // FREE plan users - 0 receipts allowed, but show their historical data
        console.log(`🆓 FREE PLAN USER: No receipts allowed (limit = 0)`);

        return {
          expenses: 0,
          saved: 0,
          total: 0,
          monthStart,
          byPlan: {
            free: { expenses: 0, saved: 0, total: 0 }
          },
          currentPlanTotal: 0  // Always 0 for FREE plan
        };
      } else {
        // Paid plans (lite/pro) - count THIS MONTH with breakdown by planType
        console.log(`📅 Paid user (${userInfo.planType}) - counting receipts THIS MONTH with breakdown`);

        // Get breakdown by planType for expenses
        const expensesByPlan = await sequelize.query(`
          SELECT "planType", COUNT(*) as count
          FROM expenses
          WHERE "userId" = :userId
          AND "createdAt" >= :monthStart
          AND "createdAt" <= :monthEnd
          GROUP BY "planType"
        `, {
          replacements: { userId, monthStart, monthEnd },
          type: sequelize.QueryTypes.SELECT
        });

        // Get breakdown by planType for saved receipts
        const savedByPlan = await sequelize.query(`
          SELECT "planType", COUNT(*) as count
          FROM saved_receipts
          WHERE "userId" = :userId
          AND "createdAt" >= :monthStart
          AND "createdAt" <= :monthEnd
          AND "isActive" = true
          GROUP BY "planType"
        `, {
          replacements: { userId, monthStart, monthEnd },
          type: sequelize.QueryTypes.SELECT
        });

        // Build breakdown object
        const byPlan = {};
        let totalExpenses = 0;
        let totalSaved = 0;

        // Process expenses by plan
        expensesByPlan.forEach(row => {
          const plan = row.planType || 'unknown';
          if (!byPlan[plan]) byPlan[plan] = { expenses: 0, saved: 0, total: 0 };
          byPlan[plan].expenses = parseInt(row.count) || 0;
          totalExpenses += byPlan[plan].expenses;
        });

        // Process saved receipts by plan
        savedByPlan.forEach(row => {
          const plan = row.planType || 'unknown';
          if (!byPlan[plan]) byPlan[plan] = { expenses: 0, saved: 0, total: 0 };
          byPlan[plan].saved = parseInt(row.count) || 0;
          totalSaved += byPlan[plan].saved;
        });

        // Calculate totals for each plan
        Object.keys(byPlan).forEach(plan => {
          byPlan[plan].total = byPlan[plan].expenses + byPlan[plan].saved;
        });

        const grandTotal = totalExpenses + totalSaved;

        console.log(`📊 Usage calculation THIS MONTH: ${totalExpenses} expenses + ${totalSaved} saved = ${grandTotal} total`);
        console.log(`📊 Breakdown by plan:`, JSON.stringify(byPlan));

        // For "remaining" calculation, count ONLY current plan's receipts
        // DO NOT count 'unknown' (null planType) receipts - they are legacy/trial receipts
        const currentPlanUsage = byPlan[userInfo.planType] || { expenses: 0, saved: 0, total: 0 };
        const unknownUsage = byPlan['unknown'] || { expenses: 0, saved: 0, total: 0 };

        // ONLY count receipts that match current plan type
        const totalCurrentPlanUsage = currentPlanUsage.total;

        if (unknownUsage.total > 0) {
          console.warn(`⚠️ Found ${unknownUsage.total} receipts with NULL planType - these are NOT counted toward limit`);
        }

        console.log(`📊 Current plan (${userInfo.planType}) usage: ${currentPlanUsage.total}, unknown (not counted): ${unknownUsage.total}, total for limit: ${totalCurrentPlanUsage}`);

        return {
          expenses: totalExpenses,
          saved: totalSaved,
          total: grandTotal,
          monthStart,
          byPlan,
          currentPlanTotal: totalCurrentPlanUsage  // Includes unknown receipts
        };
      }
    } catch (error) {
      console.error('Error getting actual usage:', error);
      throw new Error(`Failed to get actual usage for user ${userId}`);
    }
  }

  /*
   * Determine which plan quota should be consumed for a new receipt
   * For Lite → Pro upgrades: consume Lite first, then Pro
   */
  static async getPlanTypeToConsume(userId) {
    try {
      const [userResult] = await sequelize.query(`
        SELECT "planType", metadata, "billingCycleEnd" FROM users WHERE id = :userId
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      if (!userResult) {
        console.warn('⚠️ User not found, defaulting to trial');
        return 'trial'; // Fallback
      }

      // STRICT: planType must NEVER be null/undefined - default to 'trial'
      const currentPlan = userResult.planType || 'trial';

      if (!userResult.planType) {
        console.warn(`⚠️ User ${userId} has NULL planType, defaulting to 'trial'`);
      }

      // If not Pro, use current plan
      if (currentPlan !== 'pro') {
        return currentPlan;
      }

      // Check for Lite → Pro upgrade scenario
      if (userResult.metadata && userResult.metadata.liteProUpgrade) {
        const upgrade = userResult.metadata.liteProUpgrade;
        const now = new Date();
        const liteCycleEnd = new Date(upgrade.liteBillingCycleEnd);

        // If Lite billing cycle is still valid
        if (now < liteCycleEnd) {
          const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;

          // CRITICAL FIX: Query actual database for Lite receipt count instead of unreliable metadata counter
          // Count ONLY receipts with planType='lite' created during the current month
          const currentMonth = new Date();
          const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

          const [liteCountResult] = await sequelize.query(`
            SELECT
              (SELECT COUNT(*) FROM expenses WHERE "userId" = :userId AND "planType" = 'lite' AND "createdAt" >= :monthStart AND "createdAt" <= :monthEnd) +
              (SELECT COUNT(*) FROM saved_receipts WHERE "userId" = :userId AND "planType" = 'lite' AND "createdAt" >= :monthStart AND "createdAt" <= :monthEnd AND "isActive" = true) as count
          `, {
            replacements: { userId, monthStart, monthEnd },
            type: sequelize.QueryTypes.SELECT
          });

          const liteUsed = parseInt(liteCountResult.count) || 0;

          // If Lite quota not exhausted, consume Lite first
          if (liteUsed < liteLimit) {
            console.log(`📊 Consuming from Lite quota: ${liteUsed}/${liteLimit} used (queried from database)`);
            return 'lite';
          } else {
            console.log(`📊 Lite quota exhausted: ${liteUsed}/${liteLimit} used, switching to Pro`);
          }
        } else {
          console.log(`📅 Lite billing cycle expired on ${liteCycleEnd.toISOString()}, using Pro`);
        }
      }

      // Default to current plan (Pro)
      return currentPlan;
    } catch (error) {
      console.error('❌ getPlanTypeToConsume ERROR:', error);
      return 'trial'; // Fallback
    }
  }

  /*
   * Get user's plan limits from environment variables (single source)
   */
  static async getPlanLimits(userId) {
    try {
      console.log(`🔍 getPlanLimits called for userId: ${userId}`);
      // Get user's plan type
      const [userResult] = await sequelize.query(`
        SELECT "planType" FROM users WHERE id = :userId
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      if (!userResult) {
        console.error(`❌ User ${userId} not found in getPlanLimits`);
        throw new Error(`User ${userId} not found`);
      }

      const planType = userResult.planType;
      let limit;

      // Environment variables are single source of truth for limits
      switch (planType) {
        case 'trial':
          limit = parseInt(process.env.TRIAL_RECEIPT_LIMIT) || 5;
          break;
        case 'free':
          limit = 0; // FREE plan = 0 receipts, must upgrade
          break;
        case 'lite':
          limit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;
          break;
        case 'pro':
          limit = parseInt(process.env.PRO_RECEIPT_LIMIT) || 25;
          break;
        default:
          limit = 0; // Unknown plan types default to 0
      }

      console.log(`✅ getPlanLimits result: planType=${planType}, limit=${limit}`);
      return { planType, limit };
    } catch (error) {
      console.error('❌ getPlanLimits ERROR:', error);
      throw new Error(`Failed to get plan limits for user ${userId}`);
    }
  }

  /*
   * Check if user can process more receipts (authoritative check)
   * Uses currentPlanTotal for limit checking (only counts current plan receipts)
   * Special handling for Lite → Pro upgrades: carries over unused Lite receipts
   */
  static async canProcessReceipt(userId) {
    try {
      console.log(`🔍 UnifiedUsageService.canProcessReceipt called for userId: ${userId}`);
      const [actualUsage, planLimits] = await Promise.all([
        this.getActualUsage(userId),
        this.getPlanLimits(userId)
      ]);

      // Use currentPlanTotal for limit check (only current plan's receipts count)
      // Use !== undefined to handle 0 correctly (0 is valid, shouldn't fallback to total)
      let usedForLimit = actualUsage.currentPlanTotal !== undefined ? actualUsage.currentPlanTotal : actualUsage.total;
      let effectiveLimit = planLimits.limit;

      // Check for Lite → Pro upgrade scenario
      const [userResult] = await sequelize.query(`
        SELECT metadata, "billingCycleEnd" FROM users WHERE id = :userId
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      });

      if (userResult && userResult.metadata && userResult.metadata.liteProUpgrade) {
        const upgrade = userResult.metadata.liteProUpgrade;
        const now = new Date();
        const liteCycleEnd = new Date(upgrade.liteBillingCycleEnd);

        // If Lite billing cycle hasn't ended yet, add remaining Lite receipts to Pro limit
        if (now < liteCycleEnd) {
          const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;

          // CRITICAL FIX: Query actual database for Lite receipt count instead of unreliable metadata counter
          const currentMonth = new Date();
          const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

          const [liteCountResult] = await sequelize.query(`
            SELECT
              (SELECT COUNT(*) FROM expenses WHERE "userId" = :userId AND "planType" = 'lite' AND "createdAt" >= :monthStart AND "createdAt" <= :monthEnd) +
              (SELECT COUNT(*) FROM saved_receipts WHERE "userId" = :userId AND "planType" = 'lite' AND "createdAt" >= :monthStart AND "createdAt" <= :monthEnd AND "isActive" = true) as count
          `, {
            replacements: { userId, monthStart, monthEnd },
            type: sequelize.QueryTypes.SELECT
          });

          const liteUsed = parseInt(liteCountResult.count) || 0;
          const liteRemaining = Math.max(0, liteLimit - liteUsed);

          console.log(`🔄 Lite → Pro upgrade detected: ${liteRemaining} Lite receipts remaining until ${liteCycleEnd.toISOString()} (${liteUsed}/${liteLimit} used from database)`);

          // Effective limit = Pro limit + remaining Lite receipts
          effectiveLimit = planLimits.limit + liteRemaining;
          console.log(`📊 Extended limit: ${planLimits.limit} (Pro) + ${liteRemaining} (Lite remaining) = ${effectiveLimit}`);
        } else {
          console.log(`📅 Lite billing cycle expired on ${liteCycleEnd.toISOString()}, using Pro limit only`);
        }
      }

      console.log(`📊 UnifiedUsageService: currentPlanUsage=${usedForLimit}, effectiveLimit=${effectiveLimit}, planType=${planLimits.planType}`);

      const canProcess = usedForLimit < effectiveLimit;
      const remaining = Math.max(0, effectiveLimit - usedForLimit);

      console.log(`✅ UnifiedUsageService result: canProcess=${canProcess}, remaining=${remaining}, used=${usedForLimit}`);

      return {
        canProcess,
        remaining,
        used: usedForLimit,  // For "X remaining" messages
        limit: effectiveLimit,  // Use effective limit (may include Lite carryover)
        planType: planLimits.planType,
        breakdown: {
          expenses: actualUsage.expenses,
          saved: actualUsage.saved,
          byPlan: actualUsage.byPlan || {}  // Include breakdown for summary display
        }
      };
    } catch (error) {
      console.error('❌ UnifiedUsageService.canProcessReceipt ERROR:', error);
      // Fail safe - deny processing if we can't determine usage
      return {
        canProcess: false,
        remaining: 0,
        used: 0,
        limit: 0,
        planType: 'unknown',
        error: error.message
      };
    }
  }

  /*
   * Atomically increment usage after successful receipt processing
   */
  static async incrementUsage(userId, type = 'expense', transaction = null) {
    const t = transaction || await sequelize.transaction();
    const isExternalTransaction = !!transaction;

    try {
      console.log(`📊 Incrementing ${type} usage for user ${userId}`);

      // Get current month
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [planLimits, actualUsage] = await Promise.all([
        this.getPlanLimits(userId),
        this.getActualUsage(userId)
      ]);

      // Build plan_breakdown JSON from actualUsage
      const planBreakdownJson = JSON.stringify(
        Object.keys(actualUsage.byPlan || {}).reduce((acc, plan) => {
          const planData = actualUsage.byPlan[plan];
          acc[plan] = {
            receipts: planData.total,
            expenses: planData.expenses,
            saved: planData.saved
          };
          return acc;
        }, {})
      );

      // Ensure usage_limits record exists and is accurate (including plan_breakdown)
      await sequelize.query(`
        INSERT INTO usage_limits (
          user_id, month_year, expenses_processed, receipts_saved,
          total_receipts, receipts_limit, plan_breakdown, created_at, updated_at
        )
        VALUES (
          :userId, :monthStart, :expenses, :saved,
          :total, :limit, :planBreakdown::jsonb, NOW(), NOW()
        )
        ON CONFLICT (user_id, month_year)
        DO UPDATE SET
          expenses_processed = :expenses,
          receipts_saved = :saved,
          total_receipts = :total,
          receipts_limit = :limit,
          plan_breakdown = :planBreakdown::jsonb,
          updated_at = NOW()
      `, {
        replacements: {
          userId,
          monthStart,
          expenses: actualUsage.expenses + (type === 'expense' ? 1 : 0),
          saved: actualUsage.saved + (type === 'saved' ? 1 : 0),
          total: actualUsage.total + 1,
          limit: planLimits.limit,
          planBreakdown: planBreakdownJson
        },
        transaction: t
      });

      // Update user table for backward compatibility
      await sequelize.query(`
        UPDATE users
        SET
          "receiptsUsedThisMonth" = :total,
          "receiptsUsedTotal" = "receiptsUsedTotal" + 1,
          "savedReceiptsUsedThisMonth" = :saved,
          "updatedAt" = NOW()
        WHERE id = :userId
      `, {
        replacements: {
          userId,
          total: actualUsage.total + 1,
          saved: actualUsage.saved + (type === 'saved' ? 1 : 0)
        },
        transaction: t
      });

      if (!isExternalTransaction) {
        await t.commit();
      }

      console.log(`✅ Usage incremented: ${actualUsage.total + 1}/${planLimits.limit} for user ${userId}`);

      return {
        success: true,
        newTotal: actualUsage.total + 1,
        limit: planLimits.limit,
        remaining: Math.max(0, planLimits.limit - (actualUsage.total + 1))
      };

    } catch (error) {
      if (!isExternalTransaction) {
        await t.rollback();
      }
      console.error('Error incrementing usage:', error);
      throw new Error(`Failed to increment usage for user ${userId}: ${error.message}`);
    }
  }

  /*
   * Validate and fix sync issues for a user
   */
  static async validateAndFixSync(userId) {
    const transaction = await sequelize.transaction();

    try {
      const [actualUsage, planLimits] = await Promise.all([
        this.getActualUsage(userId),
        this.getPlanLimits(userId)
      ]);

      // Get current tracking data
      const [trackingResult] = await sequelize.query(`
        SELECT u."receiptsUsedThisMonth", u."receiptsUsedTotal", u."savedReceiptsUsedThisMonth",
               ul.total_receipts, ul.expenses_processed, ul.receipts_saved
        FROM users u
        LEFT JOIN usage_limits ul ON u.id = ul.user_id
          AND ul.month_year = DATE_TRUNC('month', CURRENT_DATE)
        WHERE u.id = :userId
      `, {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT,
        transaction
      });

      const tracking = trackingResult || {};
      const issues = [];

      // Check for discrepancies
      if (!tracking.total_receipts || tracking.total_receipts !== actualUsage.total) {
        issues.push(`total_receipts: ${tracking.total_receipts || 0} → ${actualUsage.total}`);
      }

      if (!tracking.receiptsUsedThisMonth || tracking.receiptsUsedThisMonth !== actualUsage.total) {
        issues.push(`receiptsUsedThisMonth: ${tracking.receiptsUsedThisMonth || 0} → ${actualUsage.total}`);
      }

      if (!tracking.savedReceiptsUsedThisMonth || tracking.savedReceiptsUsedThisMonth !== actualUsage.saved) {
        issues.push(`savedReceiptsUsedThisMonth: ${tracking.savedReceiptsUsedThisMonth || 0} → ${actualUsage.saved}`);
      }

      if (issues.length > 0) {
        console.log(`🔧 Fixing sync issues for user ${userId}: ${issues.join(', ')}`);

        // Fix usage_limits table
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        // Build plan_breakdown JSON
        const planBreakdownJson = JSON.stringify(
          Object.keys(actualUsage.byPlan || {}).reduce((acc, plan) => {
            const planData = actualUsage.byPlan[plan];
            acc[plan] = {
              receipts: planData.total,
              expenses: planData.expenses,
              saved: planData.saved
            };
            return acc;
          }, {})
        );

        await sequelize.query(`
          INSERT INTO usage_limits (
            id, user_id, month_year, expenses_processed, receipts_saved,
            total_receipts, receipts_limit, plan_breakdown, created_at, updated_at
          )
          VALUES (
            gen_random_uuid(), :userId, :monthStart, :expenses, :saved,
            :total, :limit, :planBreakdown::jsonb, NOW(), NOW()
          )
          ON CONFLICT (user_id, month_year)
          DO UPDATE SET
            expenses_processed = :expenses,
            receipts_saved = :saved,
            total_receipts = :total,
            receipts_limit = :limit,
            plan_breakdown = :planBreakdown::jsonb,
            updated_at = NOW()
        `, {
          replacements: {
            userId,
            monthStart,
            expenses: actualUsage.expenses,
            saved: actualUsage.saved,
            total: actualUsage.total,
            limit: planLimits.limit,
            planBreakdown: planBreakdownJson
          },
          transaction
        });

        // Fix user table
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
        return { fixed: true, issues, actualUsage, planLimits };
      } else {
        await transaction.rollback();
        return { fixed: false, issues: [], actualUsage, planLimits };
      }

    } catch (error) {
      await transaction.rollback();
      console.error('Error validating/fixing sync:', error);
      throw new Error(`Failed to validate/fix sync for user ${userId}: ${error.message}`);
    }
  }

  /*
   * Audit all users for sync issues
   */
  static async auditAllUsers() {
    try {
      // Get all users
      const [users] = await sequelize.query(`
        SELECT id, "planType" FROM users ORDER BY "createdAt" ASC
      `);

      const results = {
        total: users.length,
        synced: 0,
        fixed: 0,
        errors: 0,
        details: []
      };

      console.log(`🔍 Auditing ${users.length} users for sync issues...`);

      for (const user of users) {
        try {
          const result = await this.validateAndFixSync(user.id);

          if (result.fixed) {
            results.fixed++;
            results.details.push({
              userId: user.id,
              planType: user.planType,
              status: 'fixed',
              issues: result.issues,
              usage: result.actualUsage
            });
          } else {
            results.synced++;
          }
        } catch (error) {
          results.errors++;
          results.details.push({
            userId: user.id,
            planType: user.planType,
            status: 'error',
            error: error.message
          });
        }
      }

      console.log(`✅ Audit complete: ${results.synced} synced, ${results.fixed} fixed, ${results.errors} errors`);
      return results;

    } catch (error) {
      console.error('Error auditing users:', error);
      throw new Error(`Failed to audit users: ${error.message}`);
    }
  }
}

module.exports = UnifiedUsageService;