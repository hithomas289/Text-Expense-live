const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Freelance Expense Tracker | Track Business Expenses Via WhatsApp',
  META_DESCRIPTION: 'Track freelance expenses via WhatsApp. Text receipts, get Excel reports. No app download needed. Try your first receipt free.',
  KEYWORDS: 'freelance expense tracker, track freelance expenses, expense tracker freelance, freelancer expense tracking, self employed expense tracker',

  // Open Graph Tags
  OG_TITLE: 'Freelance Expense Tracker | Track Business Expenses Via WhatsApp',
  OG_DESCRIPTION: 'Track freelance expenses via WhatsApp. Text receipts, get Excel reports. No app download needed.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Freelance Expense Tracker | TextExpense',
  TWITTER_DESCRIPTION: 'Track freelance expenses via WhatsApp. Text receipts, get Excel reports automatically.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/freelance-expense-tracker',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Freelance Expense Tracker',
  SCHEMA_DESCRIPTION: 'Track freelance expenses via WhatsApp. Text receipts, get Excel reports. Simple expense tracking for freelancers and self-employed professionals.',

  // Hero Section
  HERO_TITLE: 'Freelance Expense Tracker',
  HERO_SUBTITLE: 'Track expenses without tracking software. Text receipt photos via WhatsApp, get organized Excel reports. No app to download, no spreadsheets to maintain. Just send receipts, everything else happens automatically.',

  // Content Header
  SECTION_TITLE: 'How This Actually Works',
  SECTION_SUBTITLE: 'Send receipts. Get reports. That\'s it.',

  // CTA
  CTA_TEXT: 'Try First Receipt Free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start Tracking',
  FOOTER_CTA_SUBTITLE: 'Try it with one receipt. Text a photo via WhatsApp, see how the processing works, check if the output is useful. Completely free, no credit card needed.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">You're Losing Money Right Now</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Those receipts in your wallet? They'll fade before tax season. That client dinner from last Tuesday? You meant to write it down. The software you renewed last month? Probably deductible, but you can't remember what it cost.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">You know you should track business expenses. You've tried. Maybe you downloaded an app that's still on your phone somewhere, unused. Maybe you started a spreadsheet that hasn't been updated since February.</p>
      <p style="color: var(--gray);"><strong>Here's the problem:</strong> every receipt you lose is money you can't deduct. Every expense you forget is cash you overpay the IRS. You're not bad at this - the systems are just too complicated for how busy you actually are.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How This Actually Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Send Receipt Photos</h3>
          <p style="color: var(--gray);">Text receipt pictures through WhatsApp. That's it. No logging into another app, no opening software, no remembering passwords.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">AI Reads Everything</h3>
          <p style="color: var(--gray);">Our system extracts merchant names, dates, amounts, tax automatically. Takes about 30 seconds per receipt.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Get Excel Reports</h3>
          <p style="color: var(--gray);">Request a report anytime. We generate an Excel file organized by month and category, with links to download original receipts.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Use It Anywhere</h3>
          <p style="color: var(--gray);">The Excel file works with whatever you're using for taxes. Import it, send it to your accountant, or just keep it for your records.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">What Gets Tracked</h2>
      <p style="color: var(--gray); margin-bottom: 20px;">We extract the details that matter for taxes:</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Merchant name</strong> – Who you paid</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Purchase date</strong> – When the expense occurred</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Total amount</strong> – What you spent</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Tax charged</strong> – Sales tax breakdown</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 20px;"><strong>Receipt image backup</strong> – Original photo stored securely</p>
      <p style="color: var(--gray); font-style: italic;">Then you choose the category: business meal, travel, equipment, software, office supplies, or whatever makes sense. That's the only manual step.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Why This Works When Apps Don't</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Apps fail because they add friction. Download, create account, learn interface, remember to open it. That's too many steps when you're juggling client work and deadlines.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">This lives in WhatsApp. You already text daily. Send a receipt photo the same way you'd send a message. No context switching, no app to forget about.</p>
      <p style="font-size: 1.1rem; color: var(--gray);">The work happens on our end - OCR processing, data extraction, file generation. Your part is just texting photos. That's sustainable.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Who This Helps</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Freelancers doing their own taxes</strong> – Get organized records without maintaining complicated systems</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>People with accountants</strong> – Send clean Excel files instead of shoebox receipts or random screenshots</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Anyone who tried tracking and stopped</strong> – Low friction means you'll actually keep doing it</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Self-employed professionals</strong> – Writers, designers, consultants, developers who need to track business costs</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">If you've ever scrambled in March trying to remember what you spent all year, this prevents that.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>First Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Process one receipt to see how it works</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">LIGHT USE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>6 receipts monthly</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>25 receipts monthly</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">That's it. No per-user fees, no enterprise pricing, no hidden costs.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Common Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I need to download an app?</h3>
          <p style="color: var(--gray);">No. Everything happens through WhatsApp messaging. You already have WhatsApp, you don't need anything else.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How accurate is the receipt reading?</h3>
          <p style="color: var(--gray);">OCR catches most details automatically. If something's unclear or wrong, you can correct it before saving. Takes 10 seconds.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Where do my receipts go?</h3>
          <p style="color: var(--gray);">Stored securely in cloud backup. Each Excel report includes download links to original receipt images. You control when things get deleted.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can my accountant use these reports?</h3>
          <p style="color: var(--gray);">Yes. It's a standard Excel file with expenses organized by month and category. Most accountants prefer this over physical receipts or photo folders.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if I lose my phone?</h3>
          <p style="color: var(--gray);">Everything's backed up. Log into WhatsApp on a new device and request your reports. Nothing's stored only on your phone.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Does this do invoicing or time tracking?</h3>
          <p style="color: var(--gray);">No. This solves one problem: making sure receipts don't get lost and expenses don't go untracked. If you need full accounting software, this isn't it.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/freelance-expense-tracker.html');

console.log('✅ Generated: freelance-expense-tracker.html');
