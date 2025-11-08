const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Scan Receipts With Phone | Use Your Camera via WhatsApp',
  META_DESCRIPTION: 'Scan receipts with phone camera through WhatsApp. No app download - AI extracts all details instantly. Try scanning your first receipt free.',
  KEYWORDS: 'scan receipts with phone, phone receipt scanner, scan receipts with camera, mobile receipt scanning, scan receipts WhatsApp',

  // Open Graph Tags
  OG_TITLE: 'Scan Receipts With Phone | Use Your Camera via WhatsApp',
  OG_DESCRIPTION: 'Scan receipts with phone camera through WhatsApp. No app download - AI extracts all details instantly.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Scan Receipts With Phone | TextExpense',
  TWITTER_DESCRIPTION: 'Scan receipts with phone camera through WhatsApp. No app download - AI extracts all details.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/scan-receipts-with-phone',

  // Schema.org Data
  SCHEMA_TYPE: 'WebPage',
  SCHEMA_NAME: 'Scan Receipts With Phone',
  SCHEMA_DESCRIPTION: 'Scan receipts with phone camera through WhatsApp. No app download - AI extracts all details instantly.',

  // Hero Section
  HERO_TITLE: 'Scan Receipts With Phone',
  HERO_SUBTITLE: 'Your phone camera + WhatsApp = instant receipt scanning. You already have everything you need to scan receipts: your phone\'s camera and WhatsApp. No app download, no complicated setup.',

  // Content Header
  SECTION_TITLE: 'How To Scan Receipts With Phone',
  SECTION_SUBTITLE: 'Simple 5-step process from phone camera to organized Excel reports.',

  // CTA
  CTA_TEXT: 'Start Free on WhatsApp',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start scanning receipts with phone',
  FOOTER_CTA_SUBTITLE: 'Try it free right now. Use your phone camera to photograph a receipt, send it via WhatsApp, and see how simple receipt scanning actually is.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">Why Scan Receipts With Phone</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Your phone camera is good enough to scan receipts. Actually, it's perfect for it.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">The problem with traditional receipt scanners? They require downloading yet another app that clutters your phone and gets forgotten after one use. You download it with good intentions, scan maybe three receipts, then never open it again.</p>
      <p style="color: var(--gray);">When you can scan receipts with phone through WhatsApp instead, you'll actually use it. Because WhatsApp is already on your phone. You already check it multiple times daily. No new habit to form.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How To Scan Receipts With Phone</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Take Photo With Phone Camera</h3>
          <p style="color: var(--gray);">Use your regular camera app or WhatsApp camera - doesn't matter which. Just photograph the receipt like you normally would.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Send Via WhatsApp</h3>
          <p style="color: var(--gray);">Text us the receipt photo. That's the entire scanning process on your end. Takes 10 seconds.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">AI Scans Everything</h3>
          <p style="color: var(--gray);">Our system extracts merchant name, date, amount, tax - all the details from your phone-scanned receipt. Usually under 60 seconds.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Choose Category & Save</h3>
          <p style="color: var(--gray);">Confirm the extracted details, pick a category, done. Your phone-scanned receipt is now organized and saved.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">5</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Get Excel Reports</h3>
          <p style="color: var(--gray);">Request reports anytime. Download Excel files with all your receipts organized by month and category. Each receipt links to the original phone-scanned image.</p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Why This Beats Receipt Scanner Apps</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Uses phone you already have</h3>
          <p style="color: var(--gray);">Your phone camera is already excellent. Why download another app to access it?</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Works through WhatsApp</h3>
          <p style="color: var(--gray);">You already use WhatsApp daily. Scan receipts with phone through an app you actually open.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ No storage issues</h3>
          <p style="color: var(--gray);">Phone-scanned receipt images compress after processing. Your phone storage stays clear.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Actually simple</h3>
          <p style="color: var(--gray);">Scan receipts with phone camera, send via WhatsApp, done. No tutorials, no account setup, no complexity.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Perfect For</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Business expenses</strong> - Scan receipts with phone after every business purchase</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Tax preparation</strong> - Keep all deductible receipts scanned throughout the year</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Reimbursements</strong> - Scan receipts with phone immediately, never lose proof</p>
      <p style="font-size: 1.1rem; color: var(--gray);">Basically, if you have a phone and get receipts, you can use this.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Simple Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>First Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Scan one receipt with phone to try it</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Scan 6 receipts monthly with phone</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Scan 25 receipts monthly with phone</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">No app download. No hidden fees.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I need a special camera to scan receipts with phone?</h3>
          <p style="color: var(--gray);">No. Your regular phone camera works perfectly. Any smartphone from the last 5 years has a camera good enough to scan receipts clearly.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if my phone-scanned receipt photo is blurry?</h3>
          <p style="color: var(--gray);">We'll let you know if the scan quality is too low and ask you to retake it. For best results: good lighting, flat surface, hold phone steady.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I scan receipts with phone offline?</h3>
          <p style="color: var(--gray);">You need internet to send the photo via WhatsApp and for our AI to process it. But the actual photo-taking works offline.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Does this work on both iPhone and Android?</h3>
          <p style="color: var(--gray);">Yes. As long as you have WhatsApp on your phone, you can scan receipts with phone camera through our service.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How long does it take to scan receipts with phone?</h3>
          <p style="color: var(--gray);">Taking photo: 5 seconds. Sending via WhatsApp: 5 seconds. AI processing: under 60 seconds. Total time to scan receipts with phone and save them: about 70 seconds.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/scan-receipts-with-phone.html');

console.log('✅ Generated: scan-receipts-with-phone.html');
