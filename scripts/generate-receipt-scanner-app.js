const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Receipt Scanner App | Scan Receipts for Warranties Via WhatsApp',
  META_DESCRIPTION: 'Receipt scanner app that works through WhatsApp. Scan receipts for warranties, returns & taxes. No download. AI extracts all details. Try free.',
  KEYWORDS: 'receipt scanner app, scan receipts app, receipt scanning software, digital receipt scanner, OCR receipt app',

  // Open Graph Tags
  OG_TITLE: 'Receipt Scanner App | Scan Receipts for Warranties Via WhatsApp',
  OG_DESCRIPTION: 'Receipt scanner app that works through WhatsApp. Scan receipts for warranties, returns & taxes. No download. AI extracts all details.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Receipt Scanner App | TextExpense',
  TWITTER_DESCRIPTION: 'Receipt scanner app via WhatsApp. Scan receipts for warranties, returns & taxes. AI extracts all details.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/receipt-scanner-app',

  // Schema.org Data
  SCHEMA_TYPE: 'WebPage',
  SCHEMA_NAME: 'Receipt Scanner App',
  SCHEMA_DESCRIPTION: 'Receipt scanner app that works through WhatsApp. Scan receipts for warranties, returns & taxes. No download. AI extracts all details.',

  // Hero Section
  HERO_TITLE: 'Receipt Scanner App Via WhatsApp',
  HERO_SUBTITLE: 'Scan receipts instantly for warranties, returns, and tax records. TextExpense works entirely through WhatsApp. Text a receipt photo, our AI scans and extracts every detail, you get organized Excel reports.',

  // Content Header
  SECTION_TITLE: 'Receipt Scanner App That You\'ll Actually Use',
  SECTION_SUBTITLE: 'No download required. Works through WhatsApp. Actual AI scanning. Organized for real life.',

  // CTA
  CTA_TEXT: 'Start Free on WhatsApp',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start scanning receipts',
  FOOTER_CTA_SUBTITLE: 'Try TextExpense free – scan your first receipt via WhatsApp right now. No app download. No credit card. Just instant receipt scanning that actually works when you need it.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Receipt Scanner Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Traditional receipt scanner apps have the same issue: you need to download them, remember they exist, and actually open them every time you get a receipt.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Reality? Most downloaded receipt scanner apps get used once, then forgotten. Three months later when you need that laptop receipt for the warranty claim, you're digging through your wallet or camera roll hoping the receipt survived.</p>
      <p style="color: var(--gray);">Receipt scanner apps should make life simpler, not add another app to manage.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Receipt Scanner App That You'll Actually Use</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ No download required</h3>
          <p style="color: var(--gray);">Works through WhatsApp. You already have it. You already use it daily. No new app to download or remember.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Actual AI scanning</h3>
          <p style="color: var(--gray);">Our receipt scanner reads merchant names, dates, amounts, tax details – all automatically extracted. You just confirm and categorize.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Organized for real life</h3>
          <p style="color: var(--gray);">Scan receipts and organize by category: warranty items, returns, business expenses, personal purchases, insurance claims. Find any receipt instantly when you need it.</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Our Receipt Scanner App Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Text Receipt Photo</h3>
          <p style="color: var(--gray);">Take a picture, send via WhatsApp. Your receipt is now in the scanner.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">AI Scans & Extracts Data</h3>
          <p style="color: var(--gray);">Our receipt scanner reads everything: merchant, date, amount, tax, item details. Usually under 60 seconds.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">You Choose Category</h3>
          <p style="color: var(--gray);">Label it: warranty item, returnable purchase, business expense, medical receipt, personal – whatever makes sense for your tracking.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Download Excel Reports</h3>
          <p style="color: var(--gray);">Get professionally formatted spreadsheets with all scanned receipts organized by month and category. Each receipt has a link to download the original scanned image.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Why People Use This Receipt Scanner</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Warranty claims</strong> – Scan receipts for electronics, appliances, furniture. Never lose purchase proof when products break.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Product returns</strong> – Keep scanned receipts for return windows. Have purchase date and amount ready when you need refunds.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Insurance reimbursements</strong> – Scan medical, dental, prescription receipts. Organized for easy claim submissions.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Tax preparation</strong> – Scan business expenses throughout the year. No scrambling at tax time to find receipts.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Moving expenses</strong> – Scan every receipt during moves. Many are tax-deductible or reimbursable.</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>General organization</strong> – Stop storing paper receipts that fade and get lost. Digital scans last forever.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Honest Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>First Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Scan one receipt free to see how it works</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">OCCASIONAL USE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Scan 6 receipts monthly – good for occasional use</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Scan 25 receipts monthly – best for regular tracking</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">No contracts. Cancel anytime. Cheaper than missing one warranty claim or return.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How accurate is the receipt scanner?</h3>
          <p style="color: var(--gray);">Our AI receipt scanner achieves high accuracy on clear receipt photos. If anything looks wrong, you can edit it before saving. For best results, photograph receipts in good lighting on a flat surface.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I scan receipts for warranty tracking?</h3>
          <p style="color: var(--gray);">Yes – that's a primary use case. Scan receipts when you buy electronics, appliances, or anything with warranties. When it breaks 8 months later, you'll have the scanned receipt with purchase date and proof of purchase.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I need to scan receipts one at a time?</h3>
          <p style="color: var(--gray);">Yes, we process one receipt per message for accuracy. But it only takes 10 seconds per receipt – much faster than manual entry into spreadsheets or other receipt scanner apps.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What happens to my scanned receipts?</h3>
          <p style="color: var(--gray);">They're stored securely in the cloud with bank-level encryption. You get Excel reports with download links to each scanned image. Receipts stay accessible forever (or until you delete them).</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Will this receipt scanner app work on faded receipts?</h3>
          <p style="color: var(--gray);">We process receipts at full quality for best scanning results. If a receipt is too faded for our AI to read, we'll ask you to manually enter key details or retake the photo.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/receipt-scanner-app.html');

console.log('✅ Generated: receipt-scanner-app.html');
