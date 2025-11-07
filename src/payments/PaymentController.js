const express = require('express');
const StripeService = require('./stripe/StripeService');
const WhatsAppService = require('../services/WhatsAppService');
const DatabaseSessionManager = require('../services/DatabaseSessionManager');
const User = require('../models/database/User');
const SubscriptionHistory = require('../models/database/SubscriptionHistory');
const { sequelize } = require('../config/database');

class PaymentController {
  constructor() {
    this.stripeService = new StripeService();
    this.whatsAppService = new WhatsAppService();
    this.sessionManager = new DatabaseSessionManager();
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Create checkout session endpoint
    this.router.post('/create-checkout-session', this.createCheckoutSession.bind(this));

    // Pricing endpoint for frontend
    this.router.get('/pricing', this.getPricing.bind(this));

    // Stripe webhook endpoint
    this.router.post('/webhook', this.handleWebhook.bind(this));

    // Payment success page
    this.router.get('/success', this.handlePaymentSuccess.bind(this));

    // Payment cancel page
    this.router.get('/cancel', this.handlePaymentCancel.bind(this));

    // Customer portal
    this.router.post('/create-portal-session', this.createPortalSession.bind(this));
  }

  /*
   * Get pricing information from Railway environment variables
   */
  async getPricing(req, res) {
    try {
      const pricing = {
        trial: {
          name: 'Trial',
          price: 0,
          receipts: parseInt(process.env.TRIAL_RECEIPT_LIMIT),
          description: 'Try it first'
        },
        lite: {
          name: 'Lite',
          price: parseInt(process.env.LITE_PLAN_PRICE), // in paise
          receipts: parseInt(process.env.LITE_RECEIPT_LIMIT),
          description: 'Perfect for light use'
        },
        pro: {
          name: 'Pro',
          price: parseInt(process.env.PRO_PLAN_PRICE), // in paise
          receipts: parseInt(process.env.PRO_RECEIPT_LIMIT),
          description: 'Everything you need'
        }
      };

      res.json({
        success: true,
        pricing: pricing
      });
    } catch (error) {
      console.error('Error getting pricing:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /*
   * Create Stripe checkout session
   */
  async createCheckoutSession(req, res) {
    try {
      const { phoneNumber, planType } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required'
        });
      }

      const result = await this.stripeService.createCheckoutSession(phoneNumber, planType);

      if (result.success) {
        res.json({
          success: true,
          sessionId: result.sessionId,
          checkoutUrl: result.checkoutUrl
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in createCheckoutSession:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /*
   * Handle Stripe webhook events
   */
  async handleWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const startTime = Date.now();

    console.log('🔔 Stripe webhook received!', {
      hasSignature: !!sig,
      signaturePreview: sig ? sig.substring(0, 20) + '...' : 'none',
      hasBody: !!req.body,
      bodyType: req.body ? (Buffer.isBuffer(req.body) ? 'Buffer' : typeof req.body) : 'none',
      bodyLength: req.body?.length,
      isTestMode: process.env.STRIPE_TEST_MODE === 'true',
      timestamp: new Date().toISOString()
    });

    if (!sig) {
      console.error('❌ No stripe-signature header found');
      return res.status(400).send('Webhook Error: No signature header');
    }

    if (!req.body) {
      console.error('❌ No request body found');
      return res.status(400).send('Webhook Error: No request body');
    }

    try {
      const verification = this.stripeService.verifyWebhookSignature(req.body, sig);

      if (!verification.success) {
        console.error('❌ Webhook signature verification failed:', verification.error);
        return res.status(400).send(`Webhook Error: ${verification.error}`);
      }

      const event = verification.event;

      console.log(`✅ Webhook verified! Event type: ${event.type}, ID: ${event.id}`);

      // Handle different event types with individual error handling
      try {
        switch (event.type) {
          case 'checkout.session.completed':
            console.log(`🎉 Processing checkout.session.completed for session ${event.data.object.id}`);
            await this.handleCheckoutCompleted(event.data.object);
            console.log(`✅ Checkout completion handled successfully`);
            break;

          case 'customer.subscription.created':
            await this.handleSubscriptionCreated(event.data.object);
            break;

          case 'customer.subscription.updated':
            await this.handleSubscriptionUpdated(event.data.object);
            break;

          case 'customer.subscription.deleted':
            await this.handleSubscriptionCanceled(event.data.object);
            break;

          case 'invoice.payment_succeeded':
            await this.handlePaymentSucceeded(event.data.object);
            break;

          case 'invoice.payment_failed':
            await this.handlePaymentFailed(event.data.object);
            break;

          case 'invoice.paid':
            await this.handleInvoicePaid(event.data.object);
            break;

          case 'invoice_payment.paid':
            await this.handleInvoicePaymentPaid(event.data.object);
            break;

          // Handle payment intent events (currently configured in Stripe)
          case 'payment_intent.succeeded':
            await this.handlePaymentIntentSucceeded(event.data.object);
            break;

          case 'payment_intent.payment_failed':
            await this.handlePaymentIntentFailed(event.data.object);
            break;

          case 'payment_intent.canceled':
          case 'payment_intent.processing':
          case 'payment_intent.requires_action':
            break;

          default:
        }
      } catch (eventHandlingError) {
        // Log specific event handling errors but don't fail the entire webhook
        console.error(`⚠️  Error handling event ${event.type} (ID: ${event.id}):`, {
          error: eventHandlingError.message,
          stack: eventHandlingError.stack,
          eventType: event.type,
          eventId: event.id
        });
        // Continue processing - don't fail the webhook for individual event errors
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Error handling webhook:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }

  /*
   * Handle successful checkout completion
   * IMPORTANT: This fires when checkout form is submitted, NOT when payment succeeds
   * We set status to 'pending' here and wait for invoice.payment_succeeded to activate
   */
  async handleCheckoutCompleted(session) {
    console.log(`🔵 handleCheckoutCompleted called for session:`, {
      sessionId: session.id,
      customerId: session.customer,
      subscriptionId: session.subscription,
      phoneNumber: session.client_reference_id || session.metadata?.phone_number,
      mode: session.mode,
      paymentStatus: session.payment_status, // 'paid' or 'unpaid'
      created: session.created
    });

    const transaction = await sequelize.transaction();

    try {
      const result = await this.stripeService.handlePaymentSuccess(session);

      if (!result.success) {
        await transaction.rollback();
        console.error('Payment processing failed:', result.error);
        return;
      }

      const { phoneNumber, planType, customerId, subscriptionId } = result;

      // ATOMIC: Check and create subscription within transaction to prevent race conditions
      const existingUser = await User.findOne({
        where: { stripeSubscriptionId: subscriptionId },
        transaction,
        lock: true // Use row-level locking to prevent concurrent access
      });

      if (existingUser) {
        await transaction.rollback();
        console.log(`⚠️  User already has this subscription ${subscriptionId}, skipping duplicate`);
        return;
      }

      // CRITICAL FIX: Check if payment is actually completed
      // For subscriptions, payment_status can be 'paid' (immediate) or 'unpaid' (pending)
      const isPaymentConfirmed = session.payment_status === 'paid';
      const subscriptionStatus = isPaymentConfirmed ? 'active' : 'pending';

      console.log(`💳 Payment status: ${session.payment_status}, setting subscription to: ${subscriptionStatus}`);

      // Update user's subscription status in database
      // If payment is pending, we'll activate it when invoice.payment_succeeded fires
      await this.updateUserSubscription(phoneNumber, {
        planType: planType,
        customerId: customerId,
        subscriptionId: subscriptionId,
        status: subscriptionStatus,
        startDate: new Date(),
        amount: result.amountTotal
      }, transaction);

      await transaction.commit();

      // Only send confirmation if payment is confirmed
      if (isPaymentConfirmed) {
        // Send WhatsApp confirmation message (outside transaction)
        try {
          await this.sendPaymentConfirmation(phoneNumber, planType, session.id);
        } catch (notificationError) {
          console.error(`❌ Failed to send payment confirmation to ${phoneNumber}:`, notificationError.message);
          // Don't fail the entire process for notification issues
        }
      } else {
        console.log(`⏳ Payment pending for ${phoneNumber}, waiting for invoice.payment_succeeded before sending confirmation`);
      }
    } catch (error) {
      await transaction.rollback();
      console.error('Error handling checkout completion:', error);
    }
  }

  /*
   * Handle subscription creation
   */
  async handleSubscriptionCreated(subscription) {
    try {
      const user = await User.findOne({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (user) {
        // Store billing cycle dates from Stripe
        const cycleStart = subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000)
          : null;
        const cycleEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null;

        if (cycleStart && !isNaN(cycleStart.getTime()) && cycleEnd && !isNaN(cycleEnd.getTime())) {
          await user.update({
            billingCycleStart: cycleStart,
            billingCycleEnd: cycleEnd
          });
          console.log(`✅ Stored billing cycle for ${user.phoneNumber}: ${cycleStart.toISOString()} to ${cycleEnd.toISOString()}`);
        } else {
          console.warn(`⚠️ Invalid billing cycle dates for subscription ${subscription.id}, skipping update`);
        }
      }
    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  /*
   * Handle subscription updates
   */
  async handleSubscriptionUpdated(subscription) {
    try {
      const user = await User.findOne({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (user) {
        // Update billing cycle dates on renewal or changes
        const cycleStart = subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000)
          : null;
        const cycleEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null;

        // Determine subscription status based on Stripe data
        let subscriptionStatus = subscription.status;

        // If subscription is set to cancel at period end, mark as 'canceling'
        // but keep the plan active until the period ends
        if (subscription.cancel_at_period_end && subscription.status === 'active') {
          subscriptionStatus = 'canceling';
          console.log(`🔄 Subscription ${subscription.id} set to cancel at period end for user ${user.phoneNumber}`);
        }

        // Check if this is a downgrade taking effect (scheduled plan change)
        // This happens when the billing cycle renews and Stripe applies the new price
        const scheduledDowngrade = subscription.metadata?.scheduled_downgrade;
        const isNewBillingPeriod = user.billingCycleEnd && new Date(user.billingCycleEnd) < cycleStart;

        if (scheduledDowngrade && user.planType === 'pro' && scheduledDowngrade === 'lite' && isNewBillingPeriod) {
          console.log(`⬇️ Downgrade to Lite taking effect for user ${user.phoneNumber} at new billing cycle`);

          // NOW update user plan to Lite since the new billing cycle started
          await user.update({
            planType: 'lite',
            billingCycleStart: cycleStart,
            billingCycleEnd: cycleEnd,
            subscriptionStatus: subscriptionStatus,
            metadata: {
              ...user.metadata,
              scheduledDowngrade: null, // Clear the scheduled downgrade
              downgradedAt: new Date(),
              previousPlan: 'pro'
            }
          });

          // Send notification
          const currencySymbol = process.env.CURRENCY_SYMBOL || '₹';
          const litePrice = (parseInt(process.env.LITE_PLAN_PRICE) / 100).toFixed(2);
          const liteLimit = parseInt(process.env.LITE_RECEIPT_LIMIT) || 6;

          await this.whatsAppService.sendMessage(user.phoneNumber,
            `✅ *PLAN UPDATED*

Your plan has been changed to Lite.

*NEW PLAN DETAILS:*
• Plan: Lite (${currencySymbol}${litePrice}/month)
• Receipts: ${liteLimit} per month
• History: 1 month

Your quota will reset at the start of your next billing cycle.`);

          console.log(`✅ User ${user.phoneNumber} downgraded to Lite plan`);
          return; // Exit early since we handled the downgrade
        }

        // Only update if dates are valid
        if (cycleStart && !isNaN(cycleStart.getTime()) && cycleEnd && !isNaN(cycleEnd.getTime())) {
          await user.update({
            billingCycleStart: cycleStart,
            billingCycleEnd: cycleEnd,
            subscriptionStatus: subscriptionStatus
          });
          console.log(`✅ Updated billing cycle for ${user.phoneNumber}: ${cycleStart.toISOString()} to ${cycleEnd.toISOString()}, status: ${subscriptionStatus}`);

          // If the billing cycle has renewed (new period started), reset usage
          if (user.shouldResetMonthlyUsage()) {
            await user.resetMonthlyUsage();
            console.log(`🔄 Reset monthly usage for ${user.phoneNumber} due to billing cycle renewal`);
          }
        } else {
          console.warn(`⚠️ Invalid billing cycle dates for subscription ${subscription.id}, skipping update`);
        }
      }
    } catch (error) {
      console.error('Error handling subscription updated:', error);
    }
  }

  /*
   * Handle subscription cancellation
   */
  async handleSubscriptionCanceled(subscription) {

    // Start database transaction
    const transaction = await sequelize.transaction();

    try {
      // Find user by subscription ID
      const user = await User.findOne({
        where: { stripeSubscriptionId: subscription.id }
      }, { transaction });

      if (user) {
        // Get plan name BEFORE canceling (cancelSubscription changes planType to 'free')
        const previousPlanType = user.planType;
        const planName = previousPlanType === 'pro' ? 'PRO' : previousPlanType === 'lite' ? 'Lite' : 'Unknown';

        // Cancel subscription using User model method (changes planType to 'free')
        await user.cancelSubscription();

        // Commit transaction
        await transaction.commit();

        // Send WhatsApp notification with buttons
        const upgradePath = previousPlanType === 'pro' ? 'PRO or Lite' : 'Lite or PRO';

        await this.whatsAppService.sendMessage(user.phoneNumber,
          `📋 *SUBSCRIPTION ENDED*

Your TextExpense ${planName} subscription has ended (billing period finished).

*WHAT HAPPENS NOW:*
• You're now on FREE plan (0 receipts/month)
• Your existing data is safe and accessible
• To process new receipts, upgrade to ${upgradePath}

Thanks for using TextExpense ${planName}! 🙏`);

        // Send action buttons
        const endedOptions = [
          { id: 'upgrade_account', text: 'Upgrade Plan' },
          { id: 'process_document', text: 'Process New Expense' },
          { id: 'main_menu', text: 'Main Menu' }
        ];

        await this.whatsAppService.sendInteractiveButtons(
          user.phoneNumber,
          'What would you like to do next?',
          endedOptions,
          'subscription_ended'
        );

      }
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
    }
  }

  /*
   * Handle successful payment - CRITICAL for activating subscriptions
   * This fires AFTER payment is confirmed (card charged successfully)
   */
  async handlePaymentSucceeded(invoice) {
    console.log(`💳 Payment succeeded for invoice ${invoice.id} - amount: $${invoice.amount_paid / 100}`);

    try {
      // Only handle subscription payments
      if (!invoice.subscription) {
        console.log(`   Skipping non-subscription invoice ${invoice.id}`);
        return;
      }

      const customerId = invoice.customer;
      const user = await User.findOne({
        where: { stripeCustomerId: customerId }
      });

      if (!user) {
        console.log(`   User not found for customer ${customerId}`);
        return;
      }

      // Retrieve subscription details to check if this is initial or renewal payment
      const subscription = await this.stripeService.stripe.subscriptions.retrieve(invoice.subscription);

      // CRITICAL FIX: If user subscription status is 'pending', activate it now
      // This handles the case where checkout.session.completed set status to 'pending'
      // because payment wasn't immediately confirmed
      if (user.subscriptionStatus === 'pending' || user.subscriptionStatus === 'trialing') {
        console.log(`✅ Activating pending subscription for ${user.phoneNumber} after payment confirmation`);

        await user.update({
          subscriptionStatus: 'active',
          planUpgradedAt: new Date()
        });

        // Send WhatsApp confirmation for initial payment
        try {
          const planName = user.planType === 'pro' ? 'PRO' : 'Lite';
          await this.sendPaymentConfirmation(user.phoneNumber, user.planType, invoice.id);
          console.log(`✅ Sent payment confirmation to ${user.phoneNumber} for initial ${planName} payment`);
        } catch (notificationError) {
          console.error(`❌ Failed to send confirmation:`, notificationError.message);
        }
      } else if (user.subscriptionStatus === 'active') {
        // This is a renewal payment
        console.log(`   Renewal payment detected for ${user.phoneNumber} - subscription already active`);

        // DISABLED: No notification sent on renewal as per business requirement
        // User should not receive notifications after renewal is done
      } else {
        console.log(`   Unexpected subscription status: ${user.subscriptionStatus} for ${user.phoneNumber}`);
      }
    } catch (error) {
      console.error('Error handling payment success:', error);
      // Don't fail the webhook for invoice sending issues
    }
  }

  /*
   * Handle successful payment intent
   */
  async handlePaymentIntentSucceeded(paymentIntent) {
    try {
      // Check if this payment intent is associated with a subscription
      if (paymentIntent.invoice) {
        // This will be handled by invoice.payment_succeeded event
        return;
      }

      // For one-time payments, check if metadata contains phone number
      if (paymentIntent.metadata && paymentIntent.metadata.phone_number) {
        const phoneNumber = paymentIntent.metadata.phone_number;
        const amount = paymentIntent.amount / 100; // Convert cents to dollars

        // Send WhatsApp confirmation for one-time payments
        await this.whatsAppService.sendMessage(phoneNumber,
          `✅ *PAYMENT CONFIRMED*

💳 Your payment of $${amount} has been processed successfully.

Payment ID: ${paymentIntent.id}
Status: Completed

Thank you for your payment! 🙏`);
      }

    } catch (error) {
      console.error('Error handling payment intent success:', error);
    }
  }

  /*
   * Handle failed payment intent
   */
  async handlePaymentIntentFailed(paymentIntent) {
    try {
      // Check if metadata contains phone number for notification
      if (paymentIntent.metadata && paymentIntent.metadata.phone_number) {
        const phoneNumber = paymentIntent.metadata.phone_number;
        const amount = paymentIntent.amount / 100;

        // Send WhatsApp notification for failed payment
        await this.whatsAppService.sendMessage(phoneNumber,
          `❌ *PAYMENT FAILED*

💳 Your payment of $${amount} could not be processed.

Payment ID: ${paymentIntent.id}
Status: Failed

Please check your payment method and try again.
If you need help, contact support.`);
      }

    } catch (error) {
      console.error('Error handling payment intent failure:', error);
    }
  }

  /*
   * Handle invoice_payment.paid event - DISABLED to prevent duplicate messages
   */
  async handleInvoicePaymentPaid(invoicePayment) {
    // DISABLED: This event creates duplicate messages with checkout.session.completed
    // Only log the event for debugging, don't send WhatsApp messages
    console.log(`💳 Invoice payment paid: ${invoicePayment.id} - amount: $${invoicePayment.amount_paid / 100}`);
    console.log(`   Event disabled to prevent duplicate WhatsApp messages`);
  }

  /*
   * Handle invoice paid event (alternative to invoice.payment_succeeded)
   */
  async handleInvoicePaid(invoice) {
    console.log('📄 Invoice paid:', invoice.id);

    try {
      // This is often a duplicate of invoice.payment_succeeded
      // but we'll handle it for completeness
      const customerId = invoice.customer;
      const user = await User.findOne({
        where: { stripeCustomerId: customerId }
      });

      if (user && invoice.subscription) {
        console.log(`   Invoice paid for user: ${user.phoneNumber}`);
        console.log(`   Subscription: ${invoice.subscription}`);
        console.log(`   Amount: $${invoice.amount_paid / 100}`);

        // Log this payment event
        await SubscriptionHistory.logEvent(user.id, {
          planType: 'pro',
          stripeSubscriptionId: invoice.subscription,
          eventType: 'invoice_paid',
          amountPaid: invoice.amount_paid / 100,
          currency: invoice.currency,
          billingPeriodStart: new Date(invoice.period_start * 1000),
          billingPeriodEnd: new Date(invoice.period_end * 1000)
        });

        console.log(`✅ Logged invoice paid event for ${user.phoneNumber}`);
      }
    } catch (error) {
      console.error('Error handling invoice paid:', error);
    }
  }

  /*
   * Handle failed payment
   */
  async handlePaymentFailed(invoice) {
    console.log('Payment failed for invoice:', invoice.id);
    
    try {
      const customerId = invoice.customer;
      const user = await User.findOne({
        where: { stripeCustomerId: customerId }
      });

      if (user) {
        // Update subscription status to past_due
        await user.update({
          subscriptionStatus: 'past_due'
        });

        // Log failed payment event
        await SubscriptionHistory.logEvent(user.id, {
          planType: user.planType,
          stripeSubscriptionId: invoice.subscription,
          eventType: 'payment_failed',
          amountPaid: 0,
          currency: invoice.currency
        });

        // Get plan name for the message
        const planName = user.planType === 'pro' ? 'PRO' : user.planType === 'lite' ? 'Lite' : 'subscription';

        // Send WhatsApp notification with updated message
        await this.whatsAppService.sendMessage(user.phoneNumber,
          `⚠️ *Payment Failed*

We couldn't process your payment for TextExpense ${planName}.

*Action Required:*
Your ${planName} features will be paused until payment is completed.`);

        // Send action buttons
        const failedPaymentOptions = [
          { id: 'upgrade_lite', text: 'Upgrade to Lite' },
          { id: 'upgrade_pro', text: 'Upgrade to Pro' },
          { id: 'main_menu', text: 'Main Menu' }
        ];

        await this.whatsAppService.sendInteractiveButtons(
          user.phoneNumber,
          'Choose an option:',
          failedPaymentOptions,
          'payment_failed'
        );

        console.log(`⚠️ Payment failed for ${user.phoneNumber}, marked as past_due`);
      }
    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  /*
   * Update user subscription in database
   */
  async updateUserSubscription(phoneNumber, subscriptionData, transaction = null) {
    const isExternalTransaction = !!transaction;
    const tx = transaction || await sequelize.transaction();

    try {
      // Get or create user in database
      const { user } = await User.getOrCreate(phoneNumber, { transaction: tx });

      // Fetch full subscription details from Stripe to get billing cycle dates
      let billingCycleDates = null;
      if (subscriptionData.subscriptionId) {
        try {
          console.log(`🔍 Fetching subscription ${subscriptionData.subscriptionId} from Stripe...`);
          const subscription = await this.stripeService.stripe.subscriptions.retrieve(subscriptionData.subscriptionId);
          console.log(`📦 Subscription retrieved:`, {
            id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end
          });

          // Validate that period dates exist before creating Date objects
          if (subscription.current_period_start && subscription.current_period_end) {
            billingCycleDates = {
              start: new Date(subscription.current_period_start * 1000),
              end: new Date(subscription.current_period_end * 1000)
            };
            console.log(`📅 Retrieved billing cycle: ${billingCycleDates.start.toISOString()} to ${billingCycleDates.end.toISOString()}`);
          } else {
            console.warn(`⚠️ Subscription ${subscriptionData.subscriptionId} missing period dates, using calculated dates`);
            // Fallback: Calculate billing cycle (start now, end in 30 days)
            const now = new Date();
            billingCycleDates = {
              start: now,
              end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            };
            console.log(`📅 Using calculated billing cycle: ${billingCycleDates.start.toISOString()} to ${billingCycleDates.end.toISOString()}`);
          }
        } catch (stripeError) {
          console.error('Failed to fetch subscription billing cycle from Stripe:', stripeError.message);
          // Fallback: Use current time for start, +30 days for end
          const now = new Date();
          billingCycleDates = {
            start: now,
            end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          };
          console.log(`📅 Using fallback billing cycle: ${billingCycleDates.start.toISOString()} to ${billingCycleDates.end.toISOString()}`);
        }
      }

      // Use User model method to upgrade to specified plan with billing cycle
      await user.upgradeToPlan(
        subscriptionData.planType,
        subscriptionData.customerId,
        subscriptionData.subscriptionId,
        billingCycleDates
      );

      console.log(`✅ Updated user subscription for ${phoneNumber} to ${subscriptionData.planType.toUpperCase()} plan`);

      // Only commit if we created the transaction
      if (!isExternalTransaction) {
        await tx.commit();
      }

      // Refresh session to load updated subscription data from database (outside transaction)
      try {
        await this.sessionManager.refreshUserSubscription(phoneNumber);
      } catch (sessionError) {
        console.error('Failed to refresh user session:', sessionError);
        // Don't fail the entire process for session refresh issues
      }

    } catch (error) {
      if (!isExternalTransaction) {
        await tx.rollback();
      }
      console.error('Error updating user subscription:', error);
      throw error;
    }
  }

  /*
   * Send payment confirmation via WhatsApp
   */
  async sendPaymentConfirmation(phoneNumber, planType, sessionId = null) {
    try {
      console.log(`📱 Preparing payment confirmation for ${phoneNumber}, plan: ${planType}`);

      // Get dynamic pricing and limits from environment variables based on plan type
      const currencySymbol = process.env.CURRENCY_SYMBOL;
      const currencyCode = process.env.CURRENCY_CODE;
      let price, receiptLimit, planName, benefits;

      if (planType === 'pro') {
        price = parseInt(process.env.PRO_PLAN_PRICE);
        receiptLimit = parseInt(process.env.PRO_RECEIPT_LIMIT);
        planName = 'PRO';
        benefits = `• ${receiptLimit} receipts per month
• 3-months expense history
• Priority processing
• Email support`;
      } else if (planType === 'lite') {
        price = parseInt(process.env.LITE_PLAN_PRICE);
        receiptLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
        planName = 'Lite';
        benefits = `• ${receiptLimit} receipts per month
• 1-month expense history
• Standard processing
• WhatsApp support`;
      } else {
        // Default to lite for unknown plan types
        price = parseInt(process.env.LITE_PLAN_PRICE);
        receiptLimit = parseInt(process.env.LITE_RECEIPT_LIMIT);
        planName = 'Lite';
        benefits = `• ${receiptLimit} receipts per month
• 1-month expense history
• Standard processing
• WhatsApp support`;
      }

      const { formatPrice } = require('../utils/priceFormatter');
      const formattedPrice = formatPrice(price, currencySymbol);

      console.log(`💰 Price details: ${price} cents = ${formattedPrice}, limit: ${receiptLimit}`);

      const confirmationMessage = `✅ *PAYMENT SUCCESSFUL!*

🎉 *Welcome to TextExpense ${planName}!*

*YOUR ${planName.toUpperCase()} BENEFITS:*
${benefits}

*SUBSCRIPTION DETAILS:*
• Plan: ${planName} (${formattedPrice}/month)
• Billing: Monthly recurring

Thank you for upgrading! 🚀`;

      console.log(`📤 Sending payment confirmation message to ${phoneNumber}`);
      console.log(`📝 Message content: ${confirmationMessage.substring(0, 100)}...`);

      await this.whatsAppService.sendMessage(phoneNumber, confirmationMessage);
      console.log(`✅ WhatsApp payment confirmation sent successfully to ${phoneNumber}`);

      // Send invoice PDF if sessionId is provided
      if (sessionId) {
        try {
          console.log(`📄 Retrieving invoice for session ${sessionId}`);
          const session = await this.stripeService.stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['invoice']
          });

          if (session.invoice && typeof session.invoice === 'object' && session.invoice.invoice_pdf) {
            const invoicePdfUrl = session.invoice.invoice_pdf;
            const invoiceNumber = session.invoice.number || 'invoice';
            const filename = `TextExpense_${invoiceNumber}.pdf`;

            console.log(`📤 Sending invoice PDF to ${phoneNumber}: ${filename}`);
            await this.whatsAppService.sendDocument(
              phoneNumber,
              invoicePdfUrl,
              filename,
              `📄 Your payment receipt for TextExpense ${planName}`
            );
            console.log(`✅ Invoice PDF sent successfully to ${phoneNumber}`);
          } else {
            console.log(`⚠️  No invoice PDF available for session ${sessionId}`);
          }
        } catch (invoiceError) {
          console.error(`❌ Failed to send invoice PDF to ${phoneNumber}:`, invoiceError.message);
          // Don't fail the entire process for invoice issues
        }
      }

      // Send better options for what user can do next
      const nextActionOptions = [
        { name: 'Process New Expense', id: 'process_document' },
        { name: 'Main Menu', id: 'main_menu' },
        { name: 'How It Works', id: 'how_it_works' }
      ];

      console.log(`🔘 Scheduling next action options for ${phoneNumber} in 2 seconds`);
      setTimeout(async () => {
        try {
          await this.whatsAppService.sendOptions(phoneNumber, `Ready to start using TextExpense ${planName}?`, nextActionOptions, 'post_payment');
          console.log(`✅ Next action options sent successfully to ${phoneNumber}`);
        } catch (buttonError) {
          console.error(`❌ Failed to send next action options to ${phoneNumber}:`, buttonError);
        }
      }, 2000);

    } catch (error) {
      console.error(`❌ Error sending payment confirmation to ${phoneNumber}:`, {
        error: error.message,
        stack: error.stack,
        phoneNumber,
        planType
      });
      throw error; // Re-throw so the calling function can handle it
    }
  }

  /*
   * Handle payment success page
   */
  async handlePaymentSuccess(req, res) {
    const { session_id, phone } = req.query;
    const whatsappBotNumber = process.env.WHATSAPP_BOT_NUMBER ;

    res.send(`
      <html>
        <head>
          <title>Payment Successful - TextExpense</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script>
            // Auto redirect to WhatsApp after 3 seconds without sending a message
            setTimeout(function() {
              window.location.href = 'https://wa.me/${whatsappBotNumber}';
            }, 3000);
          </script>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
            <h1 style="color: #28a745; margin-bottom: 20px;">Payment Successful!</h1>
            <p style="font-size: 18px; color: #333; margin-bottom: 15px;">Thank you for upgrading to TextExpense PRO!</p>
            <p style="color: #666; margin-bottom: 20px;">A confirmation has been sent to your WhatsApp.</p>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #155724;">🚀 Redirecting you back to WhatsApp in 3 seconds...</p>
            </div>
            
            <div style="margin-top: 30px;">
              <a href="https://wa.me/${whatsappBotNumber}" style="
                background: #25D366;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
              ">Return to WhatsApp Now</a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 20px;">You can close this tab after returning to WhatsApp</p>
          </div>
        </body>
      </html>
    `);
  }

  /*
   * Handle payment cancellation page
   */
  async handlePaymentCancel(req, res) {
    const { phone } = req.query;
    const whatsappBotNumber = process.env.WHATSAPP_BOT_NUMBER ;
    
    res.send(`
      <html>
        <head>
          <title>Payment Cancelled - TextExpense</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script>
            // Auto redirect to WhatsApp after 3 seconds
            setTimeout(function() {
              window.location.href = 'https://wa.me/${whatsappBotNumber}?text=Payment%20was%20cancelled';
            }, 3000);
          </script>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="font-size: 60px; margin-bottom: 20px;">❌</div>
            <h1 style="color: #dc3545; margin-bottom: 20px;">Payment Cancelled</h1>
            <p style="font-size: 18px; color: #333; margin-bottom: 15px;">Your payment was cancelled.</p>
            <p style="color: #666; margin-bottom: 20px;">No charges were made to your account.</p>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">🚀 Redirecting you back to WhatsApp in 3 seconds...</p>
            </div>
            
            <div style="margin-top: 30px;">
              <a href="https://wa.me/${whatsappBotNumber}?text=Payment%20was%20cancelled" style="
                background: #25D366; 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
              ">🔙 Return to WhatsApp</a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 20px;">You can try upgrading again anytime from the WhatsApp menu</p>
          </div>
        </body>
      </html>
    `);
  }

  /*
   * Create customer portal session
   */
  async createPortalSession(req, res) {
    try {
      const { customerId, returnUrl } = req.body;
      
      const result = await this.stripeService.createPortalSession(
        customerId, 
        returnUrl || `${process.env.BASE_URL || 'https://web-production-0178dc.up.railway.app'}`
      );

      res.json(result);
    } catch (error) {
      console.error('Error creating portal session:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  getRouter() {
    return this.router;
  }
}

module.exports = PaymentController;