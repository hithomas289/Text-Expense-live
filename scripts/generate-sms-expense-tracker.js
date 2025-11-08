const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'SMS Expense Tracker | Track Expenses by Text Message',
  META_DESCRIPTION: 'Professional expense tracking via SMS. Text receipts through WhatsApp, get organized Excel reports. No app downloads, no setup. Start free today.',
  KEYWORDS: 'SMS expense tracker, text message receipt tracking, expense management by SMS, WhatsApp expense tracker, SMS receipt scanner',

  // Open Graph Tags
  OG_TITLE: 'SMS Expense Tracker | Track Expenses by Text Message',
  OG_DESCRIPTION: 'Professional expense tracking via SMS. Text receipts through WhatsApp, get organized Excel reports. No app downloads, no setup.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'SMS Expense Tracker | TextExpense',
  TWITTER_DESCRIPTION: 'Professional expense tracking via SMS. Text receipts, get Excel reports instantly.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/sms-expense-tracker',

  // Schema.org Data
  SCHEMA_TYPE: 'WebPage',
  SCHEMA_NAME: 'SMS Expense Tracker',
  SCHEMA_DESCRIPTION: 'Professional expense tracking via SMS. Text receipts through WhatsApp, get organized Excel reports.',

  // Hero Section
  HERO_TITLE: 'Track Expenses By Text Message',
  HERO_SUBTITLE: 'Professional expense reports without downloading a single app. Your phone already has everything you need: a camera and text messages.',

  // Content Header
  SECTION_TITLE: 'Why SMS Changes Everything',
  SECTION_SUBTITLE: 'Because expense tracking shouldn\'t require learning a new system. It should work with tools you already use every single day.',

  // CTA
  CTA_TEXT: 'Start Free on WhatsApp',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Stop downloading apps you won\'t use',
  FOOTER_CTA_SUBTITLE: 'Text your first receipt free and see your expense report in 60 seconds. No account creation. No credit card. Just instant results that might actually make you excited about expense tracking.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Frustration</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">You know what nobody talks about? The apps on your phone you downloaded once and never opened again.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Expense trackers are the worst offenders. You download them with good intentions, spend 20 minutes setting up categories and budgets, then... crickets. Three months later you're back to shoving receipts in your wallet.</p>
      <p style="color: var(--gray);">The problem isn't you. It's that expense tracking shouldn't require learning a new system. It should work with tools you already use every single day.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Why SMS Changes Everything</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ No app fatigue</h3>
          <p style="color: var(--gray);">Use the messaging app already on your phone</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Instant adoption</h3>
          <p style="color: var(--gray);">If you can text, you can track expenses</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Zero training</h3>
          <p style="color: var(--gray);">Literally send a photo and you're done</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Actually gets used</h3>
          <p style="color: var(--gray);">Because there's nothing new to remember</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; font-size: 1.1rem; color: var(--gray);">SMS-based expense tracking isn't just simpler – it's the only method that actually sticks. When expense tracking takes as much effort as texting a friend, you'll actually do it.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px; text-align: center;">How TextExpense Works</h2>
      <div style="background: white; border: 2px solid var(--primary); padding: 40px; border-radius: 20px; text-align: center; margin-bottom: 30px;">
        <h3 style="font-size: 1.5rem; margin-bottom: 15px; color: var(--primary);">Send Receipt → Get Excel</h3>
        <p style="font-size: 1.1rem; color: var(--gray);">That's genuinely the whole process. Our AI extracts merchant names, amounts, dates, and tax details from your receipt photos. You select the category that fits. When you need a report, just request it and download your professionally formatted Excel file.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px;">
        <div style="background: white; padding: 30px; border-radius: 15px; border: 1px solid var(--border);">
          <h4 style="font-size: 1.1rem; margin-bottom: 10px; color: var(--dark);">Missing receipts?</h4>
          <p style="color: var(--gray);">Impossible – they're all stored digitally with download links in your Excel reports.</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; border: 1px solid var(--border);">
          <h4 style="font-size: 1.1rem; margin-bottom: 10px; color: var(--dark);">Monthly reports?</h4>
          <p style="color: var(--gray);">Generated on-demand in seconds.</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; border: 1px solid var(--border);">
          <h4 style="font-size: 1.1rem; margin-bottom: 10px; color: var(--dark);">Need specific expenses?</h4>
          <p style="color: var(--gray);">Filter by category in your spreadsheet.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Built For Real People</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Freelancers tracking business expenses for taxes.<br>
      Small business owners managing their own spending.<br>
      Consultants submitting expense reports to clients.<br>
      Anyone who's ever thought "I'll organize these receipts later" (and never did).</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-top: 20px;"><strong>The common thread?</strong> People who need expense tracking but don't want it to become a second job.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Honest Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>First Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Try before committing</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">LIGHT USERS</div>
          <h3>Light Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>6 receipts for light users</p>
        </div>

        <div class="card">
          <h3>Pro Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>25 receipts for regular tracking</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">We keep it simple because expense tracking should be simple.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How does SMS expense tracking work exactly?</h3>
          <p style="color: var(--gray);">You send us a receipt photo via WhatsApp (which works like SMS). Our AI extracts all the expense details, you confirm and select a category, and everything gets saved. Request an Excel report anytime with all your organized expenses.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Is my financial information secure through text messages?</h3>
          <p style="color: var(--gray);">Yes. We use WhatsApp which has end-to-end encryption. Your receipt data is processed securely and stored with bank-level encryption. We never access your bank accounts or share your information.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I use this for both personal and business expenses?</h3>
          <p style="color: var(--gray);">Absolutely. You can categorize each receipt as personal or business (or any custom category you want). Your Excel reports let you filter by category so you can separate them easily.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if I make a mistake entering a receipt?</h3>
          <p style="color: var(--gray);">No problem. You can edit any detail after it's saved – merchant name, amount, date, or category. Just tell us what needs to be corrected and we'll update it.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How long does it take to process a receipt?</h3>
          <p style="color: var(--gray);">Usually under 60 seconds from when you send the photo to when it's saved and ready. If the image is unclear, we'll ask you to retake it or manually confirm details.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/sms-expense-tracker.html');

console.log('✅ Generated: sms-expense-tracker.html');
