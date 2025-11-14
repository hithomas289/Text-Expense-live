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
  CTA_URL: 'https://wa.me/17654792054?text=hi',
  SECTION_TITLE: 'Free Expense Tracker Trial',
  SECTION_SUBTITLE: 'Try first receipt completely free',
  FOOTER_CTA_TITLE: 'Start Free Trial',
  FOOTER_CTA_SUBTITLE: 'Text one receipt via WhatsApp. Completely free, see how automatic processing works. No credit card, no commitment.',
  GA_MEASUREMENT_ID: 'G-5F3EMPRHFP',
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid var(--danger); padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Free Expense Tracker Search</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        You're looking for free expense tracking. Understandable - why pay for something before knowing if it works?
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        The problem with "free" expense trackers: they're free for a reason. Limited features, annoying ads, data selling, or they're loss leaders for expensive upgrades.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        Or they're actually free but terrible. Manual entry, no automation, essentially fancy spreadsheets you still have to maintain yourself.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray);">
        Here's different thinking: try it genuinely free with your first 3 receipts. If the output is useful and tracking actually happens, $2.99 monthly is reasonable. If it's not useful, you paid nothing.
      </p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Free Trial Works</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">First Receipt: Completely Free</h3>
          <p style="color: var(--gray);">
            Text any receipt photo. We process it, extract data, show you how categorization works. No credit card, no commitment, no catch.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">See Actual Output</h3>
          <p style="color: var(--gray);">
            You get real results - extracted receipt data, category assignment, Excel format preview. Not a demo - actual processing.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Decide If Worth Continuing</h3>
          <p style="color: var(--gray);">
            Processing work? Output useful? Then $2.99 monthly for 6 more receipts or $4.99 for 25 receipts. Not useful? Stop there, paid nothing.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">No Tricks</h3>
          <p style="color: var(--gray);">
            We don't auto-charge. No credit card capture during free trial. No "free but limited to 3 fields" restrictions. Genuine free first receipt.
          </p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">What Free Trial Includes</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Full OCR processing</h3>
          <p style="color: var(--gray);">Complete text extraction from receipt photo</p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Data structuring</h3>
          <p style="color: var(--gray);">Merchant name, date, amount, tax automatically organized</p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Category selection</h3>
          <p style="color: var(--gray);">Choose expense type, see how organization works</p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Excel preview</h3>
          <p style="color: var(--gray);">View how expense appears in professional report format</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Receipt backup</h3>
          <p style="color: var(--gray);">Original image stored in document vault</p>
        </div>
      </div>
      <p style="font-size: 1.1rem; color: var(--gray); text-align: center; margin-top: 30px;">
        Everything the paid version does - for 3 receipts. See actual functionality, not limited demo.
      </p>
    </div>

    <div style="background: white; padding: 60px 30px; border-radius: 20px; box-shadow: var(--shadow); margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">After Free Trial</h2>
      <p style="font-size: 1.1rem; color: var(--gray); text-align: center; margin-bottom: 40px;">
        If useful, continued tracking costs:
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; max-width: 700px; margin: 0 auto 40px auto;">
        <div style="background: linear-gradient(135deg, var(--success) 0%, #059669 100%); color: white; padding: 30px; border-radius: 15px; text-align: center;">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px;">$2.99/month</h3>
          <p style="font-size: 1.1rem;">Process 6 additional receipts monthly</p>
        </div>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center;">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px;">$4.99/month</h3>
          <p style="font-size: 1.1rem;">Process 25 additional receipts monthly</p>
        </div>
      </div>
      <p style="font-size: 1.1rem; color: var(--gray); text-align: center;">
        That's $0.50-0.20 per receipt for automatic processing, categorization, Excel generation, backup storage.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center; margin-top: 20px;">
        Compare: Your time manually entering receipts, organizing by category, creating spreadsheets. How much is your time worth?
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px; text-align: center; color: var(--dark);">Why Not Permanently Free?</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          Real answer: Processing costs money. OCR isn't free. AI categorization isn't free. Cloud storage isn't free. Server time isn't free.
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          "Free" expense trackers either:
        </p>
        <ul style="margin-left: 30px; margin-bottom: 15px;">
          <li style="font-size: 1.1rem; color: var(--gray); margin-bottom: 10px;">Limit features severely (defeats the purpose)</li>
          <li style="font-size: 1.1rem; color: var(--gray); margin-bottom: 10px;">Sell your data (not happening here)</li>
          <li style="font-size: 1.1rem; color: var(--gray); margin-bottom: 10px;">Show annoying ads (also not happening)</li>
          <li style="font-size: 1.1rem; color: var(--gray); margin-bottom: 10px;">Are terrible and you abandon them anyway</li>
        </ul>
        <p style="font-size: 1.1rem; color: var(--gray);">
          $2.99-4.99 monthly enables professional functionality without compromises. First receipt free lets you verify it's actually worth that before paying anything.
        </p>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Who This Helps</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; max-width: 800px; margin: 0 auto;">
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Budget-conscious users</h3>
          <p style="color: var(--gray);">Need professional tracking affordably</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Value shoppers</h3>
          <p style="color: var(--gray);">Will pay if functionality justifies cost</p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Pricing</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; max-width: 900px; margin: 0 auto;">
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); text-align: center;">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">First receipt: FREE</h3>
          <p style="color: var(--gray);">Process one completely free, no card needed</p>
        </div>
        <div class="card">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">Light: $2.99/month</h3>
          <p style="color: var(--gray);">Continue with 6 receipts monthly</p>
        </div>
        <div class="card">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">Pro: $4.99/month</h3>
          <p style="color: var(--gray);">Continue with 25 receipts monthly</p>
        </div>
      </div>
      <p style="font-size: 1.1rem; color: var(--gray); text-align: center; font-style: italic; margin-top: 30px;">
        Try free, pay only if valuable enough to continue.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Common Questions</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Is the free receipt actually free?</h3>
          <p style="color: var(--gray);">
            Yes. No credit card required, no automatic billing, no hidden charges. Process one receipt to see how it works. If you don't continue, you paid nothing.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">What happens after the free receipt?</h3>
          <p style="color: var(--gray);">
            Nothing automatic. To process more receipts, you choose a paid plan. We don't auto-charge or require payment upfront.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Why offer free trial if product is good?</h3>
          <p style="color: var(--gray);">
            Because "good" is subjective. Maybe you find manual tracking easier. Maybe you need different features. Free trial lets you decide if this specific solution works for you.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Is this truly complete, not just a limited free plan?</h3>
          <p style="color: var(--gray);">
            The free receipt gets full processing - OCR, categorization, Excel formatting, vault storage. Same quality as paid version. Just limited to one receipt to test functionality.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Can I track both business and personal receipts?</h3>
          <p style="color: var(--gray);">
            Yes! Text all receipts - work and personal. Tag during confirmation. Business expenses get organized for taxes, personal receipts stay in your searchable document vault for warranties, returns, or whatever you need.
          </p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">What if I only process 2-3 receipts monthly?</h3>
          <p style="color: var(--gray);">
            $2.99 for 6 receipts means $0.50 per receipt if you use all 6. Even using just 3 receipts, that's $1 per receipt for automatic processing versus manual entry time.
          </p>
        </div>
      </div>
    </div>
  `
};

const generator = new ContentGenerator();
generator.generate('landing', data, 'frontend/pages/best-free-expense-tracker.html');

console.log('✅ Best free expense tracker page generated successfully!');
console.log('📄 File: frontend/pages/best-free-expense-tracker.html');
console.log('🔗 URL: /pages/best-free-expense-tracker');
