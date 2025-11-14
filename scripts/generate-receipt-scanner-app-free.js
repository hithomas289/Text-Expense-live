const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Receipt Scanner App Free | Try WhatsApp Receipt Scanning Today',
  META_DESCRIPTION: 'Free receipt scanner app via WhatsApp. Scan your first receipt free, no credit card needed. Perfect for warranties, returns & taxes. Try now.',
  KEYWORDS: 'receipt scanner app free, free receipt scanning, receipt scanner no cost, free OCR receipt app, scan receipts free',

  // Open Graph Tags
  OG_TITLE: 'Receipt Scanner App Free | Try WhatsApp Receipt Scanning Today',
  OG_DESCRIPTION: 'Free receipt scanner app via WhatsApp. Scan your first receipt free, no credit card needed. Perfect for warranties, returns & taxes.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Receipt Scanner App Free | TextExpense',
  TWITTER_DESCRIPTION: 'Free receipt scanner app via WhatsApp. Scan your first receipt free, no credit card needed.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/receipt-scanner-app-free',

  // Schema.org Data
  SCHEMA_TYPE: 'WebPage',
  SCHEMA_NAME: 'Receipt Scanner App Free',
  SCHEMA_DESCRIPTION: 'Free receipt scanner app via WhatsApp. Scan your first receipt free, no credit card needed. Perfect for warranties, returns & taxes.',

  // Hero Section
  HERO_TITLE: 'Free Receipt Scanner App',
  HERO_SUBTITLE: 'Scan receipts through WhatsApp – first receipt completely free. Try with zero commitment. Scan your first receipt via WhatsApp, see how AI extracts all the details, get an organized Excel report.',

  // Content Header
  SECTION_TITLE: 'What You Get Free',
  SECTION_SUBTITLE: 'One complete receipt scan. Full feature access. Zero commitment. See if it works for you.',

  // CTA
  CTA_TEXT: 'Start Free on WhatsApp',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Try free receipt scanner now',
  FOOTER_CTA_SUBTITLE: 'Text your first receipt to us via WhatsApp right now. Completely free. No download. No credit card. See how receipt scanning actually works before deciding if it\'s worth $3/month.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">Why "Free Receipt Scanner" Matters</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Most receipt scanner apps lock features behind paywalls, require credit cards for "free trials," or limit free scanning so severely it's basically useless.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">We do the opposite: scan your first receipt completely free. No credit card. No trial expiration countdown. Just actual free receipt scanning so you can see if this works for your needs.</p>
      <p style="color: var(--gray);">Try it free, decide later if organizing receipts for warranties, returns, and taxes is worth $3-5/month.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">What You Get Free</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ One complete receipt scan</h3>
          <p style="color: var(--gray);">Send us a receipt photo via WhatsApp. We scan it, extract all data, save it to your account.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Full feature access</h3>
          <p style="color: var(--gray);">The free receipt scanner includes the same AI scanning, data extraction, and Excel export as paid plans.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Zero commitment</h3>
          <p style="color: var(--gray);">No credit card required. No trial period that auto-converts. Just free receipt scanning to try the service.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ See if it works for you</h3>
          <p style="color: var(--gray);">If you like it and want to scan more receipts for warranties, returns, or expenses, upgrade to $2.99-4.99/month. If not, no harm done.</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Free Receipt Scanner Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Text Receipt Photo</h3>
          <p style="color: var(--gray);">Open WhatsApp, send us a receipt photo. That's your free scan.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">AI Scans Automatically</h3>
          <p style="color: var(--gray);">Our free receipt scanner reads merchant name, date, amount, tax. Takes under 60 seconds.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Choose Category</h3>
          <p style="color: var(--gray);">Label it: warranty item, returnable purchase, business expense, medical – whatever helps you stay organized.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Get Excel Report</h3>
          <p style="color: var(--gray);">Download your free Excel file with the scanned receipt organized and original image linked.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">What People Use Free Receipt Scanner For</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Test before committing</strong> – See if receipt scanning actually helps your organization before paying</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>One-off expensive purchases</strong> – Scan that $2,000 laptop receipt for warranty tracking without needing a subscription</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Try the warranty tracking</strong> – Scan a receipt for an expensive item, see how easy it is to find later</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Check the accuracy</strong> – See if our AI receipt scanner reads your receipts correctly</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Medical expense</strong> – Scan one medical receipt to see if this works for insurance claim organization</p>
      <p style="font-size: 1.1rem; color: var(--gray);">Basically, use the free receipt scanner to decide if going from chaos to organization is worth $3/month.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing After Free Scan</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>First Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>No catch. No credit card.</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>Light Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Scan 6 receipts monthly – perfect for warranty items and occasional tracking</p>
        </div>

        <div class="card">
          <h3>Pro Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Scan 25 receipts monthly – best for regular expense and receipt tracking</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Only pay if you actually want to keep scanning receipts. Cancel anytime.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Is the free receipt scanner actually free?</h3>
          <p style="color: var(--gray);">Yes. Scan one receipt with zero cost and no credit card required. If you like it and want to scan more receipts, then you'd upgrade to a paid plan.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What's the difference between free and paid receipt scanning?</h3>
          <p style="color: var(--gray);">Features are identical – same AI scanning accuracy, same data extraction, same Excel reports. Paid plans just let you scan more receipts (6 or 25 per month instead of 1 free).</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I use the free scan for warranty tracking?</h3>
          <p style="color: var(--gray);">Absolutely. Use your free scan on an expensive purchase you want to track for warranty purposes. You'll have the receipt saved with all details and the original image accessible.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I need to enter credit card info for the free scan?</h3>
          <p style="color: var(--gray);">No. The free receipt scanner requires zero payment information. Just send us a receipt via WhatsApp and we'll scan it.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if I want to scan more than one receipt free?</h3>
          <p style="color: var(--gray);">The free plan is one receipt total. After that, upgrade to Light ($2.99 for 6/month) or Pro ($4.99 for 25/month) to keep scanning.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/receipt-scanner-app-free.html');

console.log('✅ Generated: receipt-scanner-app-free.html');
