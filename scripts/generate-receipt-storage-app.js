const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Receipt Storage App | Store Receipts Securely Via WhatsApp',
  META_DESCRIPTION: 'Receipt storage app via WhatsApp. Store receipts digitally with secure cloud backup. No app download. Access receipts anytime. Try free.',
  KEYWORDS: 'receipt storage app, digital receipt storage, receipt storage solution, store receipts digitally, receipt backup app',

  // Open Graph Tags
  OG_TITLE: 'Receipt Storage App | Store Receipts Securely Via WhatsApp',
  OG_DESCRIPTION: 'Receipt storage app via WhatsApp. Store receipts digitally with secure cloud backup. No app download. Access receipts anytime.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Receipt Storage App | TextExpense',
  TWITTER_DESCRIPTION: 'Receipt storage app via WhatsApp. Store receipts digitally with secure cloud backup. Access receipts anytime.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/receipt-storage-app',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Receipt Storage App',
  SCHEMA_DESCRIPTION: 'Receipt storage app that works through WhatsApp. Store receipts digitally with secure cloud backup and multi-device access.',

  // Hero Section
  HERO_TITLE: 'Receipt Storage App',
  HERO_SUBTITLE: 'Store receipts securely without downloading storage apps. TextExpense is a receipt storage app that works through WhatsApp. Text receipt photos, they store securely in the cloud. Access stored receipts anytime through Excel reports with download links.',

  // Content Header
  SECTION_TITLE: 'Receipt Storage App That Actually Stores',
  SECTION_SUBTITLE: 'Secure cloud storage. Never fading. Multi-device access. Automatic backup.',

  // CTA
  CTA_TEXT: 'Store Receipt Free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start storing receipts',
  FOOTER_CTA_SUBTITLE: 'Try receipt storage app that actually stores receipts safely. Text your first receipt via WhatsApp - completely free, see how secure storage works.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Receipt Storage Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Physical receipts fade, tear, get lost. Thermal paper receipts become unreadable within 2 years. That's not storage - that's hope.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Taking photos helps, but your camera roll isn't receipt storage. It's just... photos. No organization, no backup, no way to access from other devices.</p>
      <p style="color: var(--gray);">Receipt storage apps exist to solve this, but most require downloading another app that clutters your phone and gets forgotten after initial enthusiasm.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Receipt Storage App That Actually Stores</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Secure cloud storage</h3>
          <p style="color: var(--gray);">This receipt storage app stores receipts with bank-level encryption. Not in your phone storage - in secure cloud storage accessible from anywhere.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Never fading</h3>
          <p style="color: var(--gray);">Receipt storage app keeps digital copies that never fade like thermal paper. Store receipts permanently, not temporarily.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Multi-device access</h3>
          <p style="color: var(--gray);">Receipt storage app isn't locked to one phone. Access stored receipts from phone, computer, tablet - wherever you need them.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Automatic backup</h3>
          <p style="color: var(--gray);">Receipt storage app backs up automatically. Lose your phone? Stored receipts stay accessible. No manual backup required.</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Receipt Storage App Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Send Receipt Photos</h3>
          <p style="color: var(--gray);">Text receipt photos via WhatsApp. Receipt storage app receives and processes them immediately.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">AI Extracts Data</h3>
          <p style="color: var(--gray);">Receipt storage app reads: merchant, date, amount, tax. Stores both the data and the original image.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Secure Cloud Storage</h3>
          <p style="color: var(--gray);">Receipt storage app compresses images (85% smaller) and stores securely. Original quality maintained for important details.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Access Anytime</h3>
          <p style="color: var(--gray);">Receipt storage app generates Excel files with download links to every stored receipt. Access from any device with internet.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">What Receipt Storage App Stores</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Original receipt images</strong> – High-quality photos of every receipt</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Extracted data</strong> – Merchant, date, amount, tax, category</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Excel reports</strong> – Organized summaries with links to stored receipts</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Backup copies</strong> – Everything stored in secure cloud, not just your phone</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Long-term storage</strong> – Receipts stay stored indefinitely (or until you delete them)</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">Unlike phone photos or physical receipts, receipt storage app actually stores receipts safely.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Perfect Receipt Storage App For</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Anyone with fading receipts</strong> – Thermal paper receipts become unreadable - store them digitally first</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>People switching phones</strong> – Receipt storage app keeps receipts accessible when upgrading devices</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Business expense tracking</strong> – Store business receipts for tax deductions and audits</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Warranty tracking</strong> – Store purchase receipts for future warranty claims or returns</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">If you've ever needed a receipt and couldn't find it (or it was too faded to read), receipt storage app prevents that.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>One Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Try receipt storage app with zero commitment</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">LIGHT USE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Receipt storage app for 6 receipts monthly</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Receipt storage app for 25 receipts monthly</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Pay for active receipt storage, not per-device or per-user.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How secure is receipt storage app cloud storage?</h3>
          <p style="color: var(--gray);">Receipt storage app uses bank-level encryption for stored receipts. Data encrypted in transit (WhatsApp) and at rest (cloud storage). We never access your stored receipts.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if receipt storage app company goes out of business?</h3>
          <p style="color: var(--gray);">You can download all stored receipts anytime via Excel reports. Each receipt has a direct download link. You control your stored receipt data.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How long does receipt storage app keep receipts?</h3>
          <p style="color: var(--gray);">Receipt storage app stores receipts indefinitely. They stay accessible unless you manually delete them. No automatic deletion or expiration.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I access stored receipts offline?</h3>
          <p style="color: var(--gray);">Receipt storage app requires internet to access stored receipts since they're in cloud storage. But you can download specific receipts to your device for offline access.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What happens to my phone storage with receipt storage app?</h3>
          <p style="color: var(--gray);">Receipt storage app compresses images after processing (85% size reduction) and stores in cloud, not your phone. Saves phone storage space significantly.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/receipt-storage-app.html');

console.log('✅ Generated: receipt-storage-app.html');
