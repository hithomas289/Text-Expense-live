const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: '1099 Expense Tracker | Track Contractor Expenses Via WhatsApp',
  META_DESCRIPTION: 'Track 1099 contractor expenses via WhatsApp. Organize Schedule C deductions automatically. Text receipts, get tax-ready reports. Try free.',
  KEYWORDS: '1099 expense tracker, track 1099 expenses, expense tracker 1099 contractors, Schedule C expense tracker, contractor expense tracking',

  // Open Graph Tags
  OG_TITLE: '1099 Expense Tracker | Track Contractor Expenses Via WhatsApp',
  OG_DESCRIPTION: 'Track 1099 contractor expenses via WhatsApp. Organize Schedule C deductions automatically. Text receipts, get tax-ready reports.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: '1099 Expense Tracker | TextExpense',
  TWITTER_DESCRIPTION: 'Track 1099 contractor expenses via WhatsApp. Organized by Schedule C categories automatically.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/1099-expense-tracker',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: '1099 Expense Tracker',
  SCHEMA_DESCRIPTION: 'Track 1099 contractor expenses via WhatsApp. Organize Schedule C deductions automatically by line item for tax filing.',

  // Hero Section
  HERO_TITLE: '1099 Expense Tracker',
  HERO_SUBTITLE: 'Organize Schedule C expenses without accounting software. Text receipt photos via WhatsApp, get Excel reports organized by Schedule C categories. No accounting software to learn, no spreadsheets to maintain. Just documented expenses ready for tax filing.',

  // Content Header
  SECTION_TITLE: 'How 1099 Tracking Works',
  SECTION_SUBTITLE: 'Document everything. Schedule C categories. Deduction calculations. Tax-ready reports.',

  // CTA
  CTA_TEXT: 'Track First Expense Free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start Tracking',
  FOOTER_CTA_SUBTITLE: 'Try it with one expense. Text a receipt photo via WhatsApp, see how Schedule C categorization works. Free, no credit card needed.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The 1099 Filing Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">You got your 1099-NEC forms. They show what clients paid you. Box 1 has the total - that's your gross income reported to the IRS.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">But you didn't actually make that much. You spent thousands on equipment, software, travel, supplies. Legitimate business expenses that should reduce your taxable income on Schedule C.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Problem: Can you prove what you spent? Do you have receipts organized by tax category? Numbers ready for Line 10, Line 11, Line 24a?</p>
      <p style="color: var(--gray);"><strong>Most 1099 contractors can't.</strong> So they pay taxes on gross income instead of net profit. That's expensive.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How 1099 Tracking Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Document Everything</h3>
          <p style="color: var(--gray);">Every business expense gets texted as a receipt photo. Coffee meetings, software purchases, equipment, travel - all documented immediately.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Schedule C Categories</h3>
          <p style="color: var(--gray);">We organize expenses by actual Schedule C line items: advertising, car and truck, commissions, contract labor, office expenses, supplies, travel, meals.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Deduction Calculations</h3>
          <p style="color: var(--gray);">Business meals automatically flagged as 50% deductible. Equipment tracked for depreciation. Everything calculated correctly for filing.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Tax-Ready Reports</h3>
          <p style="color: var(--gray);">Generate Excel files showing total expenses by Schedule C category. Your accountant gets exactly what they need to complete your return.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Schedule C Expenses Tracked</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Line 8: Advertising</strong> – Website costs, business cards, ads, promotional materials</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Line 9: Car and truck</strong> – Business mileage, parking, tolls (standard mileage rate or actual expenses)</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Line 10: Commissions and fees</strong> – Payments to sales reps, marketplace fees (Amazon, Etsy, eBay)</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Line 11: Contract labor</strong> – Other freelancers you hired (over $600 requires 1099-NEC)</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Line 18: Office expense</strong> – Supplies, equipment, furniture for business use</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Line 21: Repairs and maintenance</strong> – Computer repairs, equipment maintenance, space renovations</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Line 22: Supplies</strong> – Materials and supplies used in business operations</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Line 24a: Travel</strong> – Transportation, lodging, 50% of meals during business trips</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Line 24b: Meals</strong> – Business meals and entertainment (50% deductible)</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Line 27a: Other expenses</strong> – Professional development, insurance, licenses, subscriptions</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">Everything organized exactly how Schedule C expects it. Not generic expense categories - actual line item numbers.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Why 1099 Contractors Need This</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Self-employment tax is 15.3%</strong> – You're paying both employer and employee portions of Social Security and Medicare. Every dollar in deductions saves roughly 30-40 cents in combined taxes.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Quarterly estimated payments</strong> – Accurate expense tracking helps calculate what you actually owe quarterly. Underpay and face penalties. Overpay and lose cash flow.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Audit protection</strong> – IRS audits 1099 contractors more than W2 employees. Having organized receipts and proper documentation protects you.</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Understanding profitability</strong> – Without tracking expenses, you don't know if client work is actually profitable. Some clients might be costing more than they're worth.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">What Gets Missed Without Tracking</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Small recurring charges</strong> – $15/month subscriptions add up to $180 annually. Miss 5 subscriptions, that's $900 in deductions.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Coffee and meal receipts</strong> – Those $4-8 expenses feel minor but 100+ client meetings is $400-800 in deductions.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Equipment depreciation</strong> – That $2,000 laptop isn't just an expense - it's depreciable over multiple years if tracked properly.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Home office costs</strong> – Portion of rent, utilities, internet based on dedicated workspace percentage.</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Mileage</strong> – Business driving at $0.67/mile (2024 rate). 5,000 business miles = $3,350 deduction.</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">Average 1099 contractors miss $3,000-8,000 in legitimate deductions annually just from poor documentation.</p>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Who This Helps</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Independent contractors filing Schedule C</strong> – Organize business expenses properly for tax returns</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>1099-NEC recipients</strong> – Track deductible costs against reported income</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Gig economy workers</strong> – Uber, DoorDash, Upwork contractors with business expenses</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Consultants and freelancers</strong> – Anyone receiving 1099s instead of W2s</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">If you're responsible for your own quarterly taxes and Schedule C filing, you need organized expense tracking.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>First Expense</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Process one receipt to see how it works</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>6 expenses monthly</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>25 expenses monthly</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Spend $60-120 yearly to save $3,000+ in taxes through better deduction capture.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Common Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What's the difference between 1099-NEC and 1099-MISC?</h3>
          <p style="color: var(--gray);">1099-NEC reports nonemployee compensation (what most contractors receive). 1099-MISC is for other payment types. Both require filing Schedule C to report business income and deductions.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I need receipts for everything?</h3>
          <p style="color: var(--gray);">IRS requires documentation for expenses. Receipts, invoices, bank statements - proof that costs were business-related. Without documentation, deductions get denied in audits.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I deduct expenses from before I started tracking?</h3>
          <p style="color: var(--gray);">Yes. You can text old receipt photos from earlier in the tax year. Better to document late than never. But prospective tracking captures more consistently.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How does this work with quarterly estimated taxes?</h3>
          <p style="color: var(--gray);">Organized expense records help calculate actual quarterly tax liability. You can see year-to-date income vs expenses to estimate what you'll owe.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if I pay contractors myself?</h3>
          <p style="color: var(--gray);">Track those payments as contract labor (Schedule C Line 11). Remember: pay someone $600+ in a year, you must file 1099-NEC for them.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Does this handle multiple 1099s from different clients?</h3>
          <p style="color: var(--gray);">Yes. This tracks your business expenses regardless of how many clients you have. All expenses aggregate for your single Schedule C filing.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/1099-expense-tracker.html');

console.log('✅ Generated: 1099-expense-tracker.html');
