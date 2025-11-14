const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Receipt Management Software | WhatsApp-Based Solution',
  META_DESCRIPTION: 'Receipt management software via WhatsApp. Manage receipts, generate Excel reports, no app download. AI extracts data automatically. Try free.',
  KEYWORDS: 'receipt management software, receipt management system, digital receipt management, receipt manager, receipt management app',

  // Open Graph Tags
  OG_TITLE: 'Receipt Management Software | WhatsApp-Based Solution',
  OG_DESCRIPTION: 'Receipt management software via WhatsApp. Manage receipts, generate Excel reports, no app download. AI extracts data automatically.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Receipt Management Software | TextExpense',
  TWITTER_DESCRIPTION: 'Receipt management software via WhatsApp. Manage receipts, generate Excel reports automatically.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/receipt-management-software',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Receipt Management Software',
  SCHEMA_DESCRIPTION: 'Receipt management software via WhatsApp. Manage receipts, generate Excel reports, no app download. AI extracts data automatically.',

  // Hero Section
  HERO_TITLE: 'Receipt Management Software',
  HERO_SUBTITLE: 'Manage receipts without managing software. TextExpense is receipt management software that works through WhatsApp. No installation, no IT setup, no user training. Just text receipts, we handle the management.',

  // Content Header
  SECTION_TITLE: 'Receipt Management Software That Actually Manages',
  SECTION_SUBTITLE: 'Zero installation. Automatic organization. Excel-based management. Instant access.',

  // CTA
  CTA_TEXT: 'Start Free on WhatsApp',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Try receipt management software',
  FOOTER_CTA_SUBTITLE: 'Start managing receipts without managing software. Text your first receipt via WhatsApp - completely free, no installation required.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Receipt Management Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Traditional receipt management software requires: software installation, user accounts, employee training, database management, IT support, ongoing maintenance.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Reality? Most receipt management software gets implemented, used for two weeks, then abandoned because it's too complicated for the actual problem: organizing receipts.</p>
      <p style="color: var(--gray);">75% of employees still spend over 15 minutes per expense report. Receipt management software should make this faster, not create more work.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Receipt Management Software That Actually Manages</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Zero installation</h3>
          <p style="color: var(--gray);">This receipt management software lives in WhatsApp. No software to download, install, or maintain. No IT department needed.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Automatic organization</h3>
          <p style="color: var(--gray);">Receipt management software extracts data from photos automatically. Merchant, date, amount, tax - all organized without manual entry.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Excel-based management</h3>
          <p style="color: var(--gray);">Generate receipt management reports in Excel format. Everything organized by month, category, merchant. Original receipt images linked.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Instant access</h3>
          <p style="color: var(--gray);">Receipt management software accessible from any device. Text from phone, access reports from computer. Nothing locked in proprietary systems.</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Receipt Management Software Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Receipt Capture</h3>
          <p style="color: var(--gray);">Employees text receipt photos. Receipt management software processes them instantly - OCR technology extracts all data in under 60 seconds.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Data Management</h3>
          <p style="color: var(--gray);">Receipt management software organizes each receipt: merchant name, date, amount, tax, category. Everything searchable and filterable.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Report Generation</h3>
          <p style="color: var(--gray);">Receipt management software creates Excel files: monthly summaries, category breakdowns, merchant totals. Professional formatting automatically.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Long-term Storage</h3>
          <p style="color: var(--gray);">Receipt management software keeps original images accessible. Download links in every Excel report. Nothing gets lost or deleted accidentally.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Receipt Management Software Features</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>OCR data extraction</strong> - Automated text recognition from receipts</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Category management</strong> - Organize receipts by type and purpose</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Excel report generation</strong> - Professional formatting, no manual work</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Receipt image storage</strong> - Original photos linked in every report</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Search and filter</strong> - Find specific receipts instantly</p>
      <p style="font-size: 1.1rem; color: var(--gray);">Unlike enterprise receipt management software, this doesn't require database management or IT expertise.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Who Needs Receipt Management Software</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Small businesses</strong> - Manage business receipts without expensive software subscriptions or IT overhead</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Accountants</strong> - Receive organized receipt management data from clients in standard Excel format</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Freelancers</strong> - Simple receipt management software for tax preparation and deductions</p>
      <p style="font-size: 1.1rem; color: var(--gray);">If traditional receipt management software feels like overkill for your actual needs, this is the alternative.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>Free Trial</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Try receipt management software with one receipt</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Receipt management software for 6 receipts monthly</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Receipt management software for 25 receipts monthly</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">No per-user fees. No enterprise licensing. Total cost.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Is this real receipt management software or just a scanner?</h3>
          <p style="color: var(--gray);">It's complete receipt management software: capture, OCR processing, data extraction, organization, Excel report generation, long-term storage. Just delivered through WhatsApp instead of installed software.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can receipt management software handle high volumes?</h3>
          <p style="color: var(--gray);">Current plans support up to 25 receipts monthly per user. For higher volumes, traditional receipt management software with database backends might be better suited.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Does this receipt management software integrate with accounting systems?</h3>
          <p style="color: var(--gray);">The receipt management software generates standard Excel files that import into any accounting system. No proprietary format lock-in.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What about receipt management software security?</h3>
          <p style="color: var(--gray);">Data processes through WhatsApp's encrypted messaging, stores with bank-level encryption. The receipt management software never requires bank account access or sensitive credentials.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How is this different from Expensify or Shoeboxed receipt management software?</h3>
          <p style="color: var(--gray);">Those are comprehensive platforms with extensive features. This receipt management software focuses on core functionality: organize receipts, extract data, generate Excel reports. Through WhatsApp, not downloaded software.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/receipt-management-software.html');

console.log('✅ Generated: receipt-management-software.html');
