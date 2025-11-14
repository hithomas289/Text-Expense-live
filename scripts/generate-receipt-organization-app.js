const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Receipt Organization App | Organize Receipts Via WhatsApp',
  META_DESCRIPTION: 'Receipt organization app via WhatsApp. Stop receipt chaos - organize receipts digitally with AI. No app download. First receipt free.',
  KEYWORDS: 'receipt organization app, organize receipts app, receipt organizer app, digital receipt organization, receipt filing app',

  // Open Graph Tags
  OG_TITLE: 'Receipt Organization App | Organize Receipts Via WhatsApp',
  OG_DESCRIPTION: 'Receipt organization app via WhatsApp. Stop receipt chaos - organize receipts digitally with AI. No app download.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Receipt Organization App | TextExpense',
  TWITTER_DESCRIPTION: 'Receipt organization app via WhatsApp. Stop receipt chaos - organize receipts digitally with AI.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/receipt-organization-app',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Receipt Organization App',
  SCHEMA_DESCRIPTION: 'Receipt organization app that works through WhatsApp. Organize receipts digitally with automatic AI categorization and Excel reports.',

  // Hero Section
  HERO_TITLE: 'Receipt Organization App',
  HERO_SUBTITLE: 'Finally organize receipts without downloading an app. TextExpense is a receipt organization app that works through WhatsApp. No app download, no complicated filing systems. Just text receipt photos, everything organizes automatically into Excel files.',

  // Content Header
  SECTION_TITLE: 'Receipt Organization App That Actually Organizes',
  SECTION_SUBTITLE: 'Automatic organization. Actually findable. No app clutter. Original receipts accessible.',

  // CTA
  CTA_TEXT: 'Start Organizing Free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Stop receipt chaos',
  FOOTER_CTA_SUBTITLE: 'Try the receipt organization app that organizes receipts automatically. Text your first receipt via WhatsApp - completely free, see how organization actually works.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Receipt Organization Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">You know you should organize receipts. You've probably tried:</p>
      <p style="color: var(--gray); margin-bottom: 10px;">Shoebox in the drawer (overflowing).</p>
      <p style="color: var(--gray); margin-bottom: 10px;">Envelope labeled "receipts" (can't find anything).</p>
      <p style="color: var(--gray); margin-bottom: 10px;">Taking photos (buried in camera roll).</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Downloaded apps (used once, forgotten).</p>
      <p style="color: var(--gray);"><strong>The problem isn't you.</strong> It's that receipt organization requires consistent effort, and most receipt organization apps add complexity instead of removing it.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Receipt Organization App That Actually Organizes</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Automatic organization</h3>
          <p style="color: var(--gray);">This receipt organization app sorts receipts by date, category, merchant. No manual filing. AI handles everything.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Actually findable</h3>
          <p style="color: var(--gray);">Receipt organization app creates Excel files you can search. Find "Starbucks" or "March expenses" in seconds, not sifting through photos.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ No app clutter</h3>
          <p style="color: var(--gray);">Receipt organization app works through WhatsApp. You already have it. No new app to download, remember to use, or clutter your phone.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Original receipts accessible</h3>
          <p style="color: var(--gray);">Receipt organization app links to original photos in every Excel entry. Nothing gets lost in the organization process.</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Receipt Organization App Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Text Receipt Photos</h3>
          <p style="color: var(--gray);">After any purchase, text the receipt photo. Takes 10 seconds. That's your entire effort in the receipt organization app.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">AI Organizes Everything</h3>
          <p style="color: var(--gray);">Receipt organization app extracts data automatically: merchant, date, amount, tax. You confirm and choose category.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Everything Files Automatically</h3>
          <p style="color: var(--gray);">Receipt organization app sorts into Excel reports by: month, category, merchant. Professional organization with zero manual filing.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Find Anything Instantly</h3>
          <p style="color: var(--gray);">Receipt organization app makes receipts searchable. Need that Target receipt from March? Search the Excel file. Found in 3 seconds.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">What Receipt Organization App Organizes</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>By date</strong> – Every receipt sorted chronologically by month</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>By category</strong> – Business, personal, travel, medical - you choose categories</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>By merchant</strong> – All Starbucks receipts together, all Target receipts together</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>By amount</strong> – Sort from high to low to find specific purchases</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Original images</strong> – Every organized entry links to the actual receipt photo</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">Unlike physical filing or photos in camera roll, receipt organization app makes everything actually findable.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Perfect Receipt Organization App For</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>People drowning in receipt chaos</strong> – Shoebox overflow? Wallet stuffed? This receipt organization app fixes it</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Tax preparation</strong> – Organize receipts all year, not scrambling in April</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Anyone who takes receipt photos</strong> – Stop letting them disappear in camera roll - organize them instead</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Small business owners</strong> – Simple receipt organization app for business expenses</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">If you're bad at organizing receipts, this receipt organization app compensates by organizing automatically.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>One Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Try receipt organization app with zero commitment</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">LIGHT USE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Receipt organization app for 6 receipts monthly</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Receipt organization app for 25 receipts monthly</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Way cheaper than the time spent searching through unorganized receipts.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">I'm terrible at organization. Will this receipt organization app actually help?</h3>
          <p style="color: var(--gray);">Yes, because you don't do the organizing. Text a photo, the receipt organization app does everything else automatically. Your only job: text photos.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if I have months of unorganized receipts already?</h3>
          <p style="color: var(--gray);">Start fresh now. Text new receipts to the receipt organization app as you get them. Old receipts? Process them when needed (tax time, returns, etc.).</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can the receipt organization app handle different receipt types?</h3>
          <p style="color: var(--gray);">Yes. Business, personal, medical, travel - receipt organization app categorizes however you want. Everything organizes into separate sections in Excel.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What happens to my receipt photos after the receipt organization app processes them?</h3>
          <p style="color: var(--gray);">Receipt organization app stores compressed images securely. Original photos link in Excel reports so you can access them anytime.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How is this receipt organization app different from just keeping receipts in folders?</h3>
          <p style="color: var(--gray);">Physical receipts fade, get lost, and are impossible to search. Receipt organization app makes receipts searchable, backed up, and actually findable when you need them.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/receipt-organization-app.html');

console.log('✅ Generated: receipt-organization-app.html');
