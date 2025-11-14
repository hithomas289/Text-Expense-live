#!/usr/bin/env node

/**
 * Generate Text Message Expense Tracker Landing Page
 */

const ContentGenerator = require('./generate-content');

const generator = new ContentGenerator();

const landingPageData = {
  // SEO Meta Tags
  TITLE: 'Text Message Expense Tracker | Turn Receipts Into Excel Reports',
  META_DESCRIPTION: 'Track expenses by text message. Send receipt photos via WhatsApp, get Excel reports instantly. No app download required. Try your first receipt free.',
  KEYWORDS: 'text message expense tracker, SMS expense tracking, WhatsApp expense management, receipt tracking by text, no app expense tracker',

  // Open Graph Tags
  OG_TITLE: 'Text Message Expense Tracker | Turn Receipts Into Excel Reports',
  OG_DESCRIPTION: 'Track expenses by text message. Send receipt photos via WhatsApp, get Excel reports instantly. No app download required.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Text Message Expense Tracker | TextExpense',
  TWITTER_DESCRIPTION: 'Track expenses by text message. Send receipt photos via WhatsApp, get Excel reports instantly.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/text-message-expense-tracker',

  // Schema.org Data
  SCHEMA_TYPE: 'WebPage',
  SCHEMA_NAME: 'Text Message Expense Tracker',
  SCHEMA_DESCRIPTION: 'Track expenses by text message. Send receipt photos via WhatsApp, get Excel reports instantly.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Hero Section
  HERO_TITLE: 'Text Your Receipts, Get Excel Reports',
  HERO_SUBTITLE: 'The expense tracker that lives in your pocket – literally. Stop downloading apps you\'ll never open. TextExpense turns any receipt into an organized Excel file through simple text messages.',

  // Section Content
  SECTION_TITLE: 'Why Text Messages Beat Apps',
  SECTION_SUBTITLE: 'You already use WhatsApp every day. Why add another app to your already-cluttered phone?',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Remember that expense app you downloaded last month? Neither do we.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Here's the thing about traditional expense trackers: they require you to download something new, create yet another account, remember another password, and actually <em>use</em> it consistently.</p>
      <p style="color: var(--gray); margin-bottom: 15px;"><strong>Reality check:</strong> 75% of people spend over an hour monthly on manual expense tracking. That's 12+ hours a year doing something that should take seconds.</p>
      <p style="color: var(--gray);"><strong>And those receipts stuffed in your wallet?</strong> 49% of them will be lost by tax season.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How It Works (Simple 3-Step)</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Text Your Receipt</h3>
          <p style="color: var(--gray);">Take a photo and send it via WhatsApp. That's it. No app download required.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">We Extract Everything</h3>
          <p style="color: var(--gray);">Our AI reads your receipt and pulls out merchant name, date, amount, tax – all the details you need. You choose the category that makes sense for your tracking.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Get Your Excel File</h3>
          <p style="color: var(--gray);">Request a report anytime and download a professional Excel spreadsheet with all your expenses organized by month and category. Filter by specific categories whenever you need them.</p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Why Text Messages Beat Apps</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Zero friction</h3>
          <p style="color: var(--gray);">No downloads, no accounts, no tutorials</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Instant processing</h3>
          <p style="color: var(--gray);">Receipt to Excel in under 60 seconds</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Works everywhere</h3>
          <p style="color: var(--gray);">3+ billion people already have WhatsApp</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Actually simple</h3>
          <p style="color: var(--gray);">If you can text, you can track expenses</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; font-size: 1.1rem; color: var(--gray);">Think about it: when was the last time you actually <em>enjoyed</em> using an expense tracker? Probably never, because you were too busy figuring out how to use it.</p>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Real Talk</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">This isn't for everyone. If you love complex expense management systems with 47 features you'll never touch, this probably isn't your thing.</p>
      <p style="font-size: 1.1rem; color: var(--gray);">But if you're a freelancer who just needs receipts organized for taxes... or a small business owner tracking your own expenses... or literally anyone who's ever lost a receipt and thought "there has to be a better way" – this is exactly what you need.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing (Simple & Honest)</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>First Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>See how it works with zero commitment</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>Light Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>6 receipts monthly – perfect for light users</p>
        </div>

        <div class="card">
          <h3>Pro Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>25 receipts monthly – best value for regular tracking</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">No hidden fees. No surprise charges. Cancel anytime.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Is this secure? How do I know my receipt data is safe?</h3>
          <p style="color: var(--gray);">We use bank-level encryption and secure cloud storage. Your receipts are processed through WhatsApp's encrypted messaging, then stored on secure servers. We never share your data with third parties, and you can delete your data anytime.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What happens if the receipt is unclear or damaged?</h3>
          <p style="color: var(--gray);">If our AI can't read your receipt clearly, we'll ask you to retake the photo or manually enter the key details. You stay in control of what gets saved.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I edit the information after it's been extracted?</h3>
          <p style="color: var(--gray);">Absolutely. You can edit any field – merchant name, amount, date, or category – right in the conversation. Just tell us what needs to be changed.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What format are the Excel reports in?</h3>
          <p style="color: var(--gray);">We generate standard .xlsx files that work with Excel, Google Sheets, and any spreadsheet software. Each report includes summary sheets and monthly breakdowns with links to download original receipt images.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I need to send receipts one at a time?</h3>
          <p style="color: var(--gray);">Yes, we process one receipt per message to ensure accuracy. This takes just seconds per receipt and helps us extract the details correctly every time.</p>
        </div>
      </div>
    </div>
  `,

  // CTAs
  CTA_URL: 'https://wa.me/17654792054?text=hi',
  CTA_TEXT: 'Start Free on WhatsApp',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Ready to stop losing receipts?',
  FOOTER_CTA_SUBTITLE: 'Text your first receipt free – no credit card required. You\'ll see your Excel report in under a minute, and you can decide if it\'s worth $3/month to never manually track expenses again.',
};

// Generate the page
const result = generator.generateLandingPage('text-message-expense-tracker', landingPageData);

if (result.success) {
  console.log('\n✅ Landing page generated successfully!');
  console.log(`📊 File size: ${(result.size / 1024).toFixed(2)} KB`);
  console.log(`🔗 Live URL: https://textexpense.com/pages/text-message-expense-tracker`);
} else {
  console.error('\n❌ Failed to generate landing page');
  process.exit(1);
}
