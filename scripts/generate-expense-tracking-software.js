const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Expense Tracking Software | WhatsApp-Based Solution',
  META_DESCRIPTION: 'Expense tracking software via WhatsApp. AI extracts receipt data, generates Excel reports, no app download. Free trial available.',
  KEYWORDS: 'expense tracking software, expense management software, expense tracker, automated expense tracking, receipt expense software',

  // Open Graph Tags
  OG_TITLE: 'Expense Tracking Software | WhatsApp-Based Solution',
  OG_DESCRIPTION: 'Expense tracking software via WhatsApp. AI extracts receipt data, generates Excel reports, no app download.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Expense Tracking Software | TextExpense',
  TWITTER_DESCRIPTION: 'Expense tracking software via WhatsApp. AI extracts receipt data, generates Excel reports.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/expense-tracking-software',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Expense Tracking Software',
  SCHEMA_DESCRIPTION: 'Expense tracking software via WhatsApp. AI extracts receipt data, generates Excel reports, no app download.',

  // Hero Section
  HERO_TITLE: 'Expense Tracking Software',
  HERO_SUBTITLE: 'Track expenses without downloading software. TextExpense is expense tracking software that works entirely through WhatsApp. No installation, no desktop program, no mobile app required.',

  // Content Header
  SECTION_TITLE: 'Expense Tracking Software That Actually Gets Used',
  SECTION_SUBTITLE: 'No download required. AI automates data entry. Excel reports on-demand. Works immediately.',

  // CTA
  CTA_TEXT: 'Start Free on WhatsApp',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Try expense tracking software',
  FOOTER_CTA_SUBTITLE: 'Start using expense tracking software that actually gets used. Text your first receipt via WhatsApp right now - completely free, no download required.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Expense Tracking Software Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Traditional expense tracking software requires: downloading programs, creating accounts, learning interfaces, training employees, dealing with IT departments.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Result? 75% of people spend over 15 minutes per expense report. Manual data entry. Chasing receipts. Hours wasted on administrative work.</p>
      <p style="color: var(--gray);">The average business wastes 12+ hours annually per employee on expense tracking. That's time not spent on actual business.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Expense Tracking Software That Actually Gets Used</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ No download required</h3>
          <p style="color: var(--gray);">This expense tracking software lives in WhatsApp. Your team already has it. They already use it daily. Zero adoption friction.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ AI automates data entry</h3>
          <p style="color: var(--gray);">Expense tracking software extracts merchant, date, amount, tax from receipts automatically. No manual typing.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Excel reports on-demand</h3>
          <p style="color: var(--gray);">Generate professionally formatted expense reports whenever needed. Organized by month, category, employee.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Works immediately</h3>
          <p style="color: var(--gray);">No setup, no IT department, no training sessions. Text a receipt, start tracking expenses. That's the entire onboarding.</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How This Expense Tracking Software Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Receipt Processing</h3>
          <p style="color: var(--gray);">Employees text receipt photos. Expense tracking software processes them automatically - OCR + AI extraction in under 60 seconds.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Data Organization</h3>
          <p style="color: var(--gray);">Each expense saves with: merchant name, date, amount, tax, category. All the data expense tracking software needs for reports.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Excel Generation</h3>
          <p style="color: var(--gray);">Expense tracking software creates Excel files with: monthly summaries, category breakdowns, original receipt download links.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Report Access</h3>
          <p style="color: var(--gray);">Download expense reports anytime, anywhere. The expense tracking software syncs everything to Excel for easy sharing.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Expense Tracking Software Features</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Automated OCR scanning</strong> - No manual data entry</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Category organization</strong> - Group expenses by type</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Monthly Excel reports</strong> - Professional formatting</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Receipt image storage</strong> - Original photos linked in reports</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Multi-currency support</strong> - Process expenses in any currency</p>
      <p style="font-size: 1.1rem; color: var(--gray);">Unlike complex enterprise expense tracking software, this actually gets used because it requires zero behavior change.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Who Uses This Expense Tracking Software</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Small businesses</strong> - Track expenses without IT overhead or expensive software subscriptions</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Freelancers</strong> - Simple expense tracking software for tax preparation</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Consultants</strong> - Quick expense reports for client billing</p>
      <p style="font-size: 1.1rem; color: var(--gray);">If traditional expense tracking software feels like overkill, this is the alternative.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>Free Trial</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Try expense tracking software with one receipt free</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Expense tracking software for 6 receipts monthly</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Expense tracking software for 25 receipts monthly</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Compare that to traditional expense tracking software at $5-18/month per user.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Is this real expense tracking software or just a receipt scanner?</h3>
          <p style="color: var(--gray);">It's complete expense tracking software - receipt capture, OCR processing, data extraction, categorization, Excel report generation. Just delivered through WhatsApp instead of a downloaded app.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can expense tracking software work for teams?</h3>
          <p style="color: var(--gray);">Currently TextExpense is designed for individual use. Each person tracks their own expenses through their WhatsApp, then consolidates reports as needed.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Does this expense tracking software integrate with accounting systems?</h3>
          <p style="color: var(--gray);">The expense tracking software generates Excel files that work with any accounting system. Import the Excel data into QuickBooks, Xero, or whatever you use.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if we need advanced features typical expense tracking software has?</h3>
          <p style="color: var(--gray);">This expense tracking software focuses on core functionality: receipt capture, data extraction, Excel reports. If you need approval workflows, corporate card integration, or advanced features, traditional software might fit better.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How secure is this expense tracking software?</h3>
          <p style="color: var(--gray);">Expense data processes through WhatsApp's encrypted messaging, then stores with bank-level encryption. The expense tracking software never accesses your bank accounts or requires sensitive credentials.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/expense-tracking-software.html');

console.log('✅ Generated: expense-tracking-software.html');
