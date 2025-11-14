const ContentGenerator = require('./generate-content');

const data = {
  TITLE: 'Best Free Expense Tracker | Try First Receipt Free Via WhatsApp',
  META_DESCRIPTION: 'Try expense tracking free. Text first receipt via WhatsApp, see how it works. Then $2.99/month for continued tracking. Start free.',
  KEYWORDS: 'best free expense tracker, free expense tracking, expense tracker free trial, free receipt tracker, no cost expense tracking',
  OG_TITLE: 'Best Free Expense Tracker | Try First Receipt Free',
  OG_DESCRIPTION: 'Try it free, then decide if it\'s worth $2.99. Text your first receipt via WhatsApp completely free.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',
  OG_URL: 'https://textexpense.com/pages/best-free-expense-tracker',
  TWITTER_CARD: 'summary_large_image',
  TWITTER_TITLE: 'Best Free Expense Tracker | Try First Receipt Free',
  TWITTER_DESCRIPTION: 'Try expense tracking free. Text first receipt via WhatsApp, see how it works. Then $2.99/month.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',
  CANONICAL_URL: 'https://textexpense.com/pages/best-free-expense-tracker',
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Best Free Expense Tracker',
  SCHEMA_DESCRIPTION: 'Free expense tracking trial. Text first receipt via WhatsApp completely free, see how automatic processing works. Then $2.99-4.99/month if you continue.',
  HERO_TITLE: 'Best Free Expense Tracker',
  HERO_SUBTITLE: 'Try it free, then decide if it\'s worth $2.99',
  HERO_TEXT: 'Text your first 3 receipts via WhatsApp completely free. See how automatic processing works, check if the output helps. Then $2.99/month if you want to keep using it.',
  CTA_TEXT: 'Process first receipt free',
  CTA_URL: 'https://textexpense.com/#cta',
  SECTION_TITLE: 'Free Expense Tracker Trial',
  SECTION_SUBTITLE: 'Try first receipt completely free',
  FOOTER_CTA_TITLE: 'Start Free Trial',
  FOOTER_CTA_SUBTITLE: 'Text one receipt via WhatsApp. Completely free, see how automatic processing works. No credit card, no commitment.',
  GA_MEASUREMENT_ID: 'G-5F3EMPRHFP',
  MAIN_CONTENT: `
    <!-- Free Tracker Search Section -->
    <section style="padding: 60px 20px; background: linear-gradient(to bottom, #f8f9fa, #ffffff);">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 30px; text-align: center; color: #1a1a1a;">The Free Expense Tracker Search</h2>

        <div style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 20px;">
          <p style="margin-bottom: 20px;">You're looking for free expense tracking. Understandable - why pay for something before knowing if it works?</p>

          <p style="margin-bottom: 20px;">The problem with "free" expense trackers: they're free for a reason. Limited features, annoying ads, data selling, or they're loss leaders for expensive upgrades.</p>

          <p style="margin-bottom: 20px;">Or they're actually free but terrible. Manual entry, no automation, essentially fancy spreadsheets you still have to maintain yourself.</p>

          <p style="margin-bottom: 20px;">Here's different thinking: try it genuinely free with your first 3 receipts. If the output is useful and tracking actually happens, $2.99 monthly is reasonable. If it's not useful, you paid nothing.</p>
        </div>
      </div>
    </section>

    <!-- How Free Trial Works Section -->
    <section style="padding: 60px 20px; background: #ffffff;">
      <div style="max-width: 1000px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 50px; text-align: center; color: #1a1a1a;">How Free Trial Works</h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #10b981;">
            <h3 style="font-size: 1.4em; margin-bottom: 15px; color: #1a1a1a;">First Receipt: Completely Free</h3>
            <p style="line-height: 1.7; color: #555;">Text any receipt photo. We process it, extract data, show you how categorization works. No credit card, no commitment, no catch.</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #10b981;">
            <h3 style="font-size: 1.4em; margin-bottom: 15px; color: #1a1a1a;">See Actual Output</h3>
            <p style="line-height: 1.7; color: #555;">You get real results - extracted receipt data, category assignment, Excel format preview. Not a demo - actual processing.</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #10b981;">
            <h3 style="font-size: 1.4em; margin-bottom: 15px; color: #1a1a1a;">Decide If Worth Continuing</h3>
            <p style="line-height: 1.7; color: #555;">Processing work? Output useful? Then $2.99 monthly for 6 more receipts or $4.99 for 25 receipts. Not useful? Stop there, paid nothing.</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #10b981;">
            <h3 style="font-size: 1.4em; margin-bottom: 15px; color: #1a1a1a;">No Tricks</h3>
            <p style="line-height: 1.7; color: #555;">We don't auto-charge. No credit card capture during free trial. No "free but limited to 3 fields" restrictions. Genuine free first receipt.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What Free Trial Includes Section -->
    <section style="padding: 60px 20px; background: linear-gradient(to bottom, #f8f9fa, #ffffff);">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 40px; text-align: center; color: #1a1a1a;">What Free Trial Includes</h2>

        <div style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <div style="margin-bottom: 25px; padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 10px; color: #10b981;">Full OCR processing</h3>
            <p>Complete text extraction from receipt photo</p>
          </div>

          <div style="margin-bottom: 25px; padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 10px; color: #10b981;">Data structuring</h3>
            <p>Merchant name, date, amount, tax automatically organized</p>
          </div>

          <div style="margin-bottom: 25px; padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 10px; color: #10b981;">Category selection</h3>
            <p>Choose expense type, see how organization works</p>
          </div>

          <div style="margin-bottom: 25px; padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 10px; color: #10b981;">Excel preview</h3>
            <p>View how expense appears in professional report format</p>
          </div>

          <div style="margin-bottom: 0; padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 10px; color: #10b981;">Receipt backup</h3>
            <p>Original image stored in document vault</p>
          </div>
        </div>

        <p style="font-size: 1.1em; line-height: 1.7; color: #555; text-align: center; margin-top: 40px;">
          Everything the paid version does -for 3 receipts. See actual functionality, not limited demo.
        </p>
      </div>
    </section>

    <!-- After Free Trial Section -->
    <section style="padding: 60px 20px; background: #ffffff;">
      <div style="max-width: 700px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 40px; text-align: center; color: #1a1a1a;">After Free Trial</h2>

        <p style="font-size: 1.2em; line-height: 1.7; color: #555; text-align: center; margin-bottom: 40px;">
          If useful, continued tracking costs:
        </p>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
          <h3 style="font-size: 1.5em; margin-bottom: 10px;">$2.99/month</h3>
          <p style="font-size: 1.1em;">Process 6 additional receipts monthly</p>
        </div>

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 40px; text-align: center;">
          <h3 style="font-size: 1.5em; margin-bottom: 10px;">$4.99/month</h3>
          <p style="font-size: 1.1em;">Process 25 additional receipts monthly</p>
        </div>

        <p style="font-size: 1.1em; line-height: 1.7; color: #555; text-align: center;">
          That's $0.50-0.20 per receipt for automatic processing, categorization, Excel generation, backup storage.
        </p>

        <p style="font-size: 1.1em; line-height: 1.7; color: #555; text-align: center; margin-top: 30px; font-style: italic;">
          Compare: Your time manually entering receipts, organizing by category, creating spreadsheets. How much is your time worth?
        </p>
      </div>
    </section>

    <!-- Why Not Permanently Free Section -->
    <section style="padding: 60px 20px; background: linear-gradient(to bottom, #f8f9fa, #ffffff);">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 30px; text-align: center; color: #1a1a1a;">Why Not Permanently Free?</h2>

        <div style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 30px;">
          <p style="margin-bottom: 20px;">Real answer: Processing costs money. OCR isn't free. AI categorization isn't free. Cloud storage isn't free. Server time isn't free.</p>

          <p style="margin-bottom: 20px;">"Free" expense trackers either:</p>
          <ul style="margin-left: 30px; margin-bottom: 20px;">
            <li style="margin-bottom: 10px;">Limit features severely (defeats the purpose)</li>
            <li style="margin-bottom: 10px;">Sell your data (not happening here)</li>
            <li style="margin-bottom: 10px;">Show annoying ads (also not happening)</li>
            <li style="margin-bottom: 10px;">Are terrible and you abandon them anyway</li>
          </ul>

          <p style="margin-bottom: 20px;">$2.99-4.99 monthly enables professional functionality without compromises. First receipt free lets you verify it's actually worth that before paying anything.</p>
        </div>
      </div>
    </section>

    <!-- Target Audience Section -->
    <section style="padding: 60px 20px; background: #ffffff;">
      <div style="max-width: 900px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 40px; text-align: center; color: #1a1a1a;">Who This Helps</h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px;">
            <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #10b981;">Budget-conscious users</h3>
            <p style="line-height: 1.7; color: #555;">Need professional tracking affordably</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px;">
            <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #10b981;">Value shoppers</h3>
            <p style="line-height: 1.7; color: #555;">Will pay if functionality justifies cost</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section style="padding: 60px 20px; background: linear-gradient(to bottom, #f8f9fa, #ffffff);">
      <div style="max-width: 700px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 2.5em; margin-bottom: 50px; color: #1a1a1a;">Pricing</h2>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 25px;">
          <h3 style="font-size: 1.6em; margin-bottom: 10px;">First receipt: FREE</h3>
          <p style="font-size: 1.1em;">Process one completely free, no card needed</p>
        </div>

        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); margin-bottom: 25px;">
          <h3 style="font-size: 1.4em; margin-bottom: 10px; color: #1a1a1a;">Light: $2.99/month</h3>
          <p style="color: #666; font-size: 1.05em;">Continue with 6 receipts monthly</p>
        </div>

        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          <h3 style="font-size: 1.4em; margin-bottom: 10px; color: #1a1a1a;">Pro: $4.99/month</h3>
          <p style="color: #666; font-size: 1.05em;">Continue with 25 receipts monthly</p>
        </div>

        <p style="font-size: 1.1em; line-height: 1.7; color: #555; margin-top: 40px;">
          Try free, pay only if valuable enough to continue.
        </p>
      </div>
    </section>

    <!-- FAQ Section -->
    <section style="padding: 60px 20px; background: #ffffff;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 50px; text-align: center; color: #1a1a1a;">Common Questions</h2>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">Is the free receipt actually free?</h3>
          <p style="line-height: 1.7; color: #555;">Yes. No credit card required, no automatic billing, no hidden charges. Process one receipt to see how it works. If you don't continue, you paid nothing.</p>
        </div>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">What happens after the free receipt?</h3>
          <p style="line-height: 1.7; color: #555;">Nothing automatic. To process more receipts, you choose a paid plan. We don't auto-charge or require payment upfront.</p>
        </div>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">Why offer free trial if product is good?</h3>
          <p style="line-height: 1.7; color: #555;">Because "good" is subjective. Maybe you find manual tracking easier. Maybe you need different features. Free trial lets you decide if this specific solution works for you.</p>
        </div>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">Is this truly complete, not just a limited free plan?</h3>
          <p style="line-height: 1.7; color: #555;">The free receipt gets full processing - OCR, categorization, Excel formatting, vault storage. Same quality as paid version. Just limited to one receipt to test functionality.</p>
        </div>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">Can I track both business and personal receipts?</h3>
          <p style="line-height: 1.7; color: #555;">Yes! Text all receipts - work and personal. Tag during confirmation. Business expenses get organized for taxes, personal receipts stay in your searchable document vault for warranties, returns, or whatever you need.</p>
        </div>

        <div style="margin-bottom: 0;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">What if I only process 2-3 receipts monthly?</h3>
          <p style="line-height: 1.7; color: #555;">$2.99 for 6 receipts means $0.50 per receipt if you use all 6. Even using just 3 receipts, that's $1 per receipt for automatic processing versus manual entry time.</p>
        </div>
      </div>
    </section>
  `
};

const generator = new ContentGenerator();
generator.generate('landing', data, 'frontend/pages/best-free-expense-tracker.html');

console.log('✅ Best free expense tracker page generated successfully!');
console.log('📄 File: frontend/pages/best-free-expense-tracker.html');
console.log('🔗 URL: /pages/best-free-expense-tracker');
