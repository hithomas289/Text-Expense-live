// Determine which Stripe keys to use based on test mode
const isTestMode = process.env.STRIPE_TEST_MODE === 'true';
const stripeSecretKey = isTestMode
  ? process.env.STRIPE_TEST_SECRET_KEY
  : process.env.STRIPE_PROD_SECRET_KEY;

const stripeWebhookSecret = isTestMode
  ? process.env.STRIPE_TEST_WEBHOOK_SECRET
  : process.env.STRIPE_PROD_WEBHOOK_SECRET;

// Validate critical configuration
if (!stripeSecretKey) {
  console.error(`❌ CRITICAL: ${isTestMode ? 'STRIPE_TEST_SECRET_KEY' : 'STRIPE_PROD_SECRET_KEY'} is not set!`);
  throw new Error('Stripe secret key not configured');
}

if (!stripeWebhookSecret) {
  console.error(`❌ CRITICAL: ${isTestMode ? 'STRIPE_TEST_WEBHOOK_SECRET' : 'STRIPE_PROD_WEBHOOK_SECRET'} is not set!`);
  console.warn('⚠️  Webhook signature verification will FAIL without webhook secret');
}

// Initialize Stripe with the appropriate key
const stripe = require('stripe')(stripeSecretKey);

console.log(`🔵 Stripe initialized in ${isTestMode ? 'TEST' : 'PRODUCTION'} mode`);
console.log(`🔑 Using secret key: ${stripeSecretKey.substring(0, 10)}...`);
console.log(`🔐 Webhook secret configured: ${stripeWebhookSecret ? 'YES (starts with ' + stripeWebhookSecret.substring(0, 8) + '...)' : 'NO - WEBHOOKS WILL FAIL'}`);

class StripeService {
  constructor() {
    this.stripe = stripe;
    this.webhookSecret = stripeWebhookSecret;
    this.isTestMode = isTestMode;
  }

  /*
   * Create Stripe Checkout Session for Plan upgrade - DYNAMIC CURRENCY
   * Supports both lite and pro plans
   * IMPORTANT: Cancels existing subscription if upgrading between plans
   */
  async createCheckoutSession(phoneNumber, planType = 'lite') {
    try {
      console.log(`🔵 Starting Stripe checkout session creation for ${phoneNumber}, plan: ${planType}`);
      const baseUrl = process.env.BASE_URL || 'https://web-production-0178dc.up.railway.app';

      // Validate plan type
      if (!['lite', 'pro'].includes(planType)) {
        throw new Error(`Invalid plan type: ${planType}. Must be 'lite' or 'pro'`);
      }

      // CRITICAL: Cancel existing subscription to prevent double billing
      // Check if user already has an active subscription
      const User = require('../../models/database/User');
      const user = await User.findByPhoneNumber(phoneNumber);

      if (user && user.stripeSubscriptionId) {
        const currentPlan = user.planType;
        const isUpgrading = (currentPlan === 'lite' && planType === 'pro') ||
                           (currentPlan === 'pro' && planType === 'lite');

        if (isUpgrading) {
          console.log(`🔄 User upgrading from ${currentPlan} to ${planType}, canceling old subscription ${user.stripeSubscriptionId}`);

          try {
            // Cancel the old subscription at period end to avoid double billing
            await this.stripe.subscriptions.update(user.stripeSubscriptionId, {
              cancel_at_period_end: true,
              metadata: {
                cancellation_reason: 'upgrade',
                new_plan: planType,
                canceled_at: new Date().toISOString()
              }
            });
            console.log(`✅ Old ${currentPlan} subscription marked for cancellation at period end`);
          } catch (cancelError) {
            console.error(`⚠️ Failed to cancel old subscription ${user.stripeSubscriptionId}:`, cancelError.message);
            // Continue with checkout creation even if cancellation fails
          }
        }
      }

      // Use dynamic currency conversion based on user's phone number and plan type
      const CurrencyConversionService = require('../../services/CurrencyConversionService');
      const currencyService = new CurrencyConversionService();
      console.log(`🔵 Getting Stripe pricing...`);
      const stripePricing = currencyService.getStripePricing(phoneNumber, planType);
      console.log(`🔵 Stripe pricing:`, stripePricing);

      const planNames = {
        lite: process.env.LITE_PLAN_NAME || 'TextExpense Lite',
        pro: process.env.PRO_PLAN_NAME || 'TextExpense PRO'
      };

      const plan = {
        name: planNames[planType],
        description: `${stripePricing.country} - Monthly subscription`,
        price: stripePricing.amount,
        currency: stripePricing.currency,
        displayAmount: stripePricing.displayAmount
      };

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: stripePricing.priceData,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&phone=${phoneNumber}`,
        cancel_url: `${baseUrl}/payment/cancel?phone=${phoneNumber}`,
        client_reference_id: phoneNumber,
        metadata: {
          phone_number: phoneNumber,
          plan_type: planType,
          currency: stripePricing.currency,
          country: stripePricing.country,
          display_amount: stripePricing.displayAmount,
          plan_name: plan.name
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        // CRITICAL: Enforce 3D Secure (OTP) for all card payments - RBI requirement
        payment_method_options: {
          card: {
            request_three_d_secure: 'any' // 'any' = always request 3DS authentication (OTP)
          }
        },
        subscription_data: {
          metadata: {
            phone_number: phoneNumber,
            plan_type: planType
          }
        }
      });

      return {
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url,
        sessionData: {
          id: session.id,
          url: session.url,
          amount: plan.price,
          currency: plan.currency,
          planType: planType
        }
      };

    } catch (error) {
      console.error('❌ Error creating Stripe checkout session:', error);
      console.error('❌ Full error stack:', error.stack);
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        phoneNumber,
        planType
      });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /*
   * Verify webhook signature and parse event
   * PRODUCTION READY: Full signature verification with proper error handling
   */
  verifyWebhookSignature(payload, signature) {
    try {
      // Validate inputs
      if (!signature) {
        return { success: false, error: 'No signatures found matching the expected signature' };
      }

      if (!this.webhookSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
        return { success: false, error: 'Webhook secret not configured' };
      }

      // Debug logging
      console.log('🔍 Webhook verification attempt:', {
        payloadType: Buffer.isBuffer(payload) ? 'Buffer' : typeof payload,
        payloadLength: payload?.length,
        webhookSecretPreview: this.webhookSecret.substring(0, 12) + '...',
        signaturePreview: signature.substring(0, 20) + '...',
        testMode: this.isTestMode
      });

      // Stripe requires raw buffer for signature verification
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      console.log('✅ Webhook signature verified successfully!', {
        eventType: event.type,
        eventId: event.id
      });

      return { success: true, event };

    } catch (error) {
      console.error('❌ Webhook signature verification failed:', {
        error: error.message,
        payloadType: Buffer.isBuffer(payload) ? 'Buffer' : typeof payload,
        webhookSecretSet: !!this.webhookSecret,
        webhookSecretPreview: this.webhookSecret ? this.webhookSecret.substring(0, 12) + '...' : 'NOT SET'
      });

      return { success: false, error: error.message };
    }
  }

  /*
   * Handle successful payment completion
   */
  async handlePaymentSuccess(session) {
    try {
      const phoneNumber = session.client_reference_id || session.metadata?.phone_number;
      const planType = session.metadata?.plan_type || 'lite'; // Default to lite for new users
      
      return {
        success: true,
        phoneNumber,
        planType,
        customerId: session.customer,
        subscriptionId: session.subscription,
        sessionId: session.id,
        amountTotal: session.amount_total
      };
    } catch (error) {
      console.error('Error handling payment success:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /*
   * Create customer portal session for subscription management
   */
  async createPortalSession(customerId, returnUrl) {
    try {
      const portalSession = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return {
        success: true,
        portalUrl: portalSession.url
      };
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /*
   * Get subscription status
   */
  async getSubscriptionStatus(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      return {
        success: true,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /*
   * Cancel subscription in Stripe
   * Options: 'at_period_end' (default) or 'immediately'
   */
  async cancelSubscription(subscriptionId, cancelTiming = 'at_period_end') {
    try {
      console.log(`🔵 Canceling subscription ${subscriptionId} (${cancelTiming})`);

      if (cancelTiming === 'immediately') {
        // Cancel immediately and prorate
        const subscription = await this.stripe.subscriptions.cancel(subscriptionId, {
          prorate: true
        });
        console.log(`✅ Subscription ${subscriptionId} canceled immediately`);
        return {
          success: true,
          status: subscription.status,
          canceledAt: new Date(subscription.canceled_at * 1000)
        };
      } else {
        // Cancel at period end (user keeps access until billing cycle ends)
        const subscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
        console.log(`✅ Subscription ${subscriptionId} will cancel at period end: ${new Date(subscription.current_period_end * 1000).toISOString()}`);
        return {
          success: true,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          periodEnd: new Date(subscription.current_period_end * 1000)
        };
      }
    } catch (error) {
      console.error(`❌ Error canceling subscription ${subscriptionId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = StripeService;