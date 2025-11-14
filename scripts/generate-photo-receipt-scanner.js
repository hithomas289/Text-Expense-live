const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Photo Receipt Scanner | Snap Photos, Get Excel Reports',
  META_DESCRIPTION: 'Photo receipt scanner via WhatsApp. Take receipt photos, AI extracts all data automatically. No app download. First photo free.',
  KEYWORDS: 'photo receipt scanner, receipt photo scanning, take photo of receipt, photograph receipt scanner, snap receipt photo',

  // Open Graph Tags
  OG_TITLE: 'Photo Receipt Scanner | Snap Photos, Get Excel Reports',
  OG_DESCRIPTION: 'Photo receipt scanner via WhatsApp. Take receipt photos, AI extracts all data automatically. No app download.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Photo Receipt Scanner | TextExpense',
  TWITTER_DESCRIPTION: 'Photo receipt scanner via WhatsApp. Take receipt photos, AI extracts all data automatically.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/photo-receipt-scanner',

  // Schema.org Data
  SCHEMA_TYPE: 'WebPage',
  SCHEMA_NAME: 'Photo Receipt Scanner',
  SCHEMA_DESCRIPTION: 'Photo receipt scanner via WhatsApp. Take receipt photos, AI extracts all data automatically. No app download.',

  // Hero Section
  HERO_TITLE: 'Photo Receipt Scanner',
  HERO_SUBTITLE: 'Take a photo, get organized expenses. TextExpense is a photo receipt scanner that works through WhatsApp. Take receipt photos with your camera, send them via text, get Excel reports with everything organized.',

  // Content Header
  SECTION_TITLE: 'Better Than Camera Roll',
  SECTION_SUBTITLE: 'Actually organized. Searchable data. Original photos saved. Accessible everywhere.',

  // CTA
  CTA_TEXT: 'Start Free on WhatsApp',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start using photo receipt scanner',
  FOOTER_CTA_SUBTITLE: 'Take a receipt photo right now, send it via WhatsApp, see how the photo receipt scanner turns it into organized data in under a minute. Completely free to try.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">Why Photo Receipt Scanner</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">You're probably already taking photos of receipts. The problem? Those photos sit buried in your camera roll, completely unorganized, impossible to find when you actually need them.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">A photo receipt scanner solves this. Take the photo like you normally would, but instead of letting it disappear into your camera roll, send it somewhere that actually organizes it.</p>
      <p style="color: var(--gray);">That's what TextExpense does - turns receipt photos into organized, searchable Excel reports without requiring you to download another app or manually type anything.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Photo Receipt Scanner Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Take Receipt Photo</h3>
          <p style="color: var(--gray);">Use your phone camera like normal. Good lighting, flat surface - same as any photo.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Send Photo Via WhatsApp</h3>
          <p style="color: var(--gray);">Text the receipt photo to us. The photo receipt scanner activates automatically.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">AI Reads The Photo</h3>
          <p style="color: var(--gray);">Our photo receipt scanner extracts: merchant, date, amount, tax, all details. Under 60 seconds usually.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">You Choose Category</h3>
          <p style="color: var(--gray);">Confirm what the photo receipt scanner found, pick a category (business, personal, travel, etc.), save it.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">5</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Download Excel Reports</h3>
          <p style="color: var(--gray);">Get professionally formatted Excel files with all your receipt photos organized. Each entry links to the original photo.</p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Better Than Camera Roll</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Actually organized</h3>
          <p style="color: var(--gray);">Receipt photos sorted by date and category in Excel, not buried in thousands of random photos.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Searchable data</h3>
          <p style="color: var(--gray);">Photo receipt scanner extracts text, so you can find "Starbucks" or "March expenses" instantly.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Original photos saved</h3>
          <p style="color: var(--gray);">Every Excel entry links to the original receipt photo. Nothing gets lost.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Accessible everywhere</h3>
          <p style="color: var(--gray);">Download Excel reports to any device. Your receipt photos aren't trapped in one phone.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Use Photo Receipt Scanner For</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Business expenses</strong> - Take receipt photos after every purchase for tax deductions</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Reimbursements</strong> - Receipt photos ready when you need to submit expense reports</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Personal budgeting</strong> - Photo every receipt to track where money goes</p>
      <p style="font-size: 1.1rem; color: var(--gray);">If you take receipt photos on your phone (and who doesn't?), this actually organizes them.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>One Photo</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Try photo receipt scanner with zero commitment</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>Light Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Process 6 receipt photos monthly</p>
        </div>

        <div class="card">
          <h3>Pro Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Process 25 receipt photos monthly</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">No app download required.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What makes this better than just taking photos?</h3>
          <p style="color: var(--gray);">Regular photos sit disorganized in your camera roll. This photo receipt scanner extracts the data, organizes everything in Excel, and keeps original photos accessible with download links.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Does the photo quality matter?</h3>
          <p style="color: var(--gray);">Yes. The photo receipt scanner needs clear text to extract data accurately. Take photos in good lighting, keep receipt flat, fill the frame. We'll tell you if a photo is too unclear.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I take photos of multiple receipts at once?</h3>
          <p style="color: var(--gray);">No, one receipt per photo for accuracy. But taking/sending individual receipt photos only takes seconds each.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What happens to my receipt photos?</h3>
          <p style="color: var(--gray);">After the photo receipt scanner processes them, we compress the images (saves 85% storage space) and store them securely. You can download originals anytime from Excel reports.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I need the WhatsApp app to use this photo receipt scanner?</h3>
          <p style="color: var(--gray);">Yes, that's how you send receipt photos to us. But you probably already have WhatsApp - 3 billion people do.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/photo-receipt-scanner.html');

console.log('✅ Generated: photo-receipt-scanner.html');
