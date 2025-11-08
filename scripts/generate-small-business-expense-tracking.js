const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Small Business Expense Tracking | Simple WhatsApp Solution',
  META_DESCRIPTION: 'Small business expense tracking via WhatsApp. No app download, no training, no IT setup. Track expenses, get Excel reports. Try free.',
  KEYWORDS: 'small business expense tracking, SMB expense management, small business expense tracker, expense tracking for small business, business expense tracking',

  // Open Graph Tags
  OG_TITLE: 'Small Business Expense Tracking | Simple WhatsApp Solution',
  OG_DESCRIPTION: 'Small business expense tracking via WhatsApp. No app download, no training, no IT setup. Track expenses, get Excel reports.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Small Business Expense Tracking | TextExpense',
  TWITTER_DESCRIPTION: 'Small business expense tracking via WhatsApp. No app download, no training, no IT setup.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/small-business-expense-tracking',

  // Schema.org Data
  SCHEMA_TYPE: 'WebPage',
  SCHEMA_NAME: 'Small Business Expense Tracking',
  SCHEMA_DESCRIPTION: 'Small business expense tracking via WhatsApp. No app download, no training, no IT setup. Track expenses, get Excel reports.',

  // Hero Section
  HERO_TITLE: 'Small Business Expense Tracking',
  HERO_SUBTITLE: 'Track business expenses without the business software headache. TextExpense handles small business expense tracking through WhatsApp. No software to install. No employees to train. No IT department needed.',

  // Content Header
  SECTION_TITLE: 'Small Business Expense Tracking That Actually Works',
  SECTION_SUBTITLE: 'Zero training required. No IT setup. Actual cost savings. Gets used consistently.',

  // CTA
  CTA_TEXT: 'Start Free on WhatsApp',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start small business expense tracking',
  FOOTER_CTA_SUBTITLE: 'Try small business expense tracking that your team will actually use. Text one receipt via WhatsApp - completely free, zero setup required.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Small Business Expense Tracking Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">You know you should track business expenses properly. The IRS expects it. Your accountant begs for it. Tax deductions depend on it.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">But traditional small business expense tracking software? Expensive ($5-18/month per user). Complicated (weeks of training). Requires IT setup. Demands behavior change nobody sticks to.</p>
      <p style="color: var(--gray);">Result: 64% of small businesses report expense leakage. Receipts get lost. Deductions get missed. Tax time becomes chaos.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Small Business Expense Tracking That Actually Works</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Zero training required</h3>
          <p style="color: var(--gray);">Your team already uses WhatsApp. They already know how to text photos. That's the entire learning curve for this small business expense tracking solution.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ No IT setup</h3>
          <p style="color: var(--gray);">Traditional small business expense tracking software needs: installation, account creation, permissions, integrations. This needs: a WhatsApp message. Done.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Actual cost savings</h3>
          <p style="color: var(--gray);">Small business expense tracking at $2.99-4.99/month total vs $5-18/month per user. For a 5-person team, save $200-900 annually.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Gets used consistently</h3>
          <p style="color: var(--gray);">Small business expense tracking fails when nobody uses it. This works because it requires zero behavior change - just text receipts like you'd text anything else.</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Small Business Expense Tracking Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Employees Text Receipts</h3>
          <p style="color: var(--gray);">After any business purchase, text the receipt photo. Takes 10 seconds. That's their entire role in small business expense tracking.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">AI Processes Everything</h3>
          <p style="color: var(--gray);">Small business expense tracking software extracts: merchant, date, amount, tax. Employees confirm details and choose category. Under 60 seconds.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Owner Gets Excel Reports</h3>
          <p style="color: var(--gray);">Generate small business expense tracking reports whenever needed. All expenses organized by month, category, employee. Original receipts linked.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Accountant Gets Clean Data</h3>
          <p style="color: var(--gray);">Hand your accountant Excel files instead of shoeboxes of receipts. Small business expense tracking that actually prepares you for tax time.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Small Business Expense Tracking Benefits</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Stop losing receipts</strong> - 49% of receipts get lost. Digital small business expense tracking prevents that entirely.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Maximize tax deductions</strong> - Proper small business expense tracking captures every deductible expense. IRS gets receipts if audited.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Save admin time</strong> - No more chasing employees for receipts or manually entering data. Small business expense tracking automation saves hours weekly.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Better financial visibility</strong> - See what your small business actually spends. Category breakdowns show where money goes.</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Accountant-ready records</strong> - Small business expense tracking that generates reports your accountant can actually use. No more spreadsheet chaos.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Perfect Small Business Expense Tracking For</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Restaurants</strong> - Track food costs, supplies, equipment purchases</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Contractors</strong> - Job expenses, materials, tools, vehicle costs</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Consulting firms</strong> - Client expenses, travel, office costs</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Retail stores</strong> - Inventory, supplies, operational expenses</p>
      <p style="font-size: 1.1rem; color: var(--gray);">Any small business tired of spreadsheets and shoeboxes of receipts.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing (Total, Not Per User)</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>Free Trial</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Try small business expense tracking with one receipt</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Small business expense tracking for 6 receipts monthly</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Small business expense tracking for 25 receipts monthly</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Not per user. Total cost. Way cheaper than traditional small business expense tracking software.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How is this different from Expensify or QuickBooks for small business expense tracking?</h3>
          <p style="color: var(--gray);">Those are comprehensive platforms with tons of features small businesses don't need. This focuses on core small business expense tracking: capture receipts, extract data, generate Excel reports. Through WhatsApp, not downloaded software.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can multiple employees use this for small business expense tracking?</h3>
          <p style="color: var(--gray);">Currently each person tracks through their own WhatsApp. For small business expense tracking consolidation, each person can send you their Excel reports to combine.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Does this small business expense tracking work for tax deductions?</h3>
          <p style="color: var(--gray);">Yes. The small business expense tracking generates IRS-acceptable records: receipt images, extracted data, organized by date and category. Everything needed for tax preparation.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if employees forget to submit receipts in small business expense tracking?</h3>
          <p style="color: var(--gray);">That's a behavior problem, not a software problem. But this small business expense tracking solution has the lowest friction possible - just text a photo. If employees can't do that, no software will help.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can accountants work with data from this small business expense tracking system?</h3>
          <p style="color: var(--gray);">Absolutely. Small business expense tracking generates standard Excel files. Any accountant can work with them. Import into accounting software or use directly.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/small-business-expense-tracking.html');

console.log('✅ Generated: small-business-expense-tracking.html');
