const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Independent Contractor Expense Tracking | Track Business Costs',
  META_DESCRIPTION: 'Track independent contractor expenses via WhatsApp. Reduce self-employment tax, organize business costs. Text receipts, get reports. Try free.',
  KEYWORDS: 'independent contractor expense tracking, track contractor expenses, expense tracking independent contractors, self employed expense tracker, contractor tax tracking',

  // Open Graph Tags
  OG_TITLE: 'Independent Contractor Expense Tracking | Track Business Costs',
  OG_DESCRIPTION: 'Track independent contractor expenses via WhatsApp. Reduce self-employment tax through better documentation.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Independent Contractor Expense Tracking | TextExpense',
  TWITTER_DESCRIPTION: 'Track contractor expenses via WhatsApp. Lower self-employment tax through documentation.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/independent-contractor-expense-tracking',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Independent Contractor Expense Tracking',
  SCHEMA_DESCRIPTION: 'Track independent contractor expenses via WhatsApp. Reduce self-employment tax, organize business costs for Schedule C filing.',

  // Hero Section
  HERO_TITLE: 'Independent Contractor Expense Tracking',
  HERO_SUBTITLE: 'Lower self-employment tax through better documentation. Text receipt photos via WhatsApp, organize business expenses automatically. Self-employment tax is 15.3% - every deduction saves 30-40% in combined federal and SE taxes. Stop overpaying.',

  // Content Header
  SECTION_TITLE: 'How Contractor Tracking Works',
  SECTION_SUBTITLE: 'Capture business costs. Automatic organization. Calculate savings. Generate reports.',

  // CTA
  CTA_TEXT: 'Track First Expense Free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start Tracking',
  FOOTER_CTA_SUBTITLE: 'Try it with one business expense. Text a receipt photo via WhatsApp, see how categorization works. Completely free, no credit card.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Self-Employment Tax Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">You made $75,000 as an independent contractor. Congratulations - you're self-employed.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Bad news: You're paying 15.3% self-employment tax on net earnings. That's Social Security and Medicare taxes - both employer and employee portions.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Worse news: You're also paying federal income tax on top of that. Combined rate? 30-40% depending on your bracket.</p>
      <p style="color: var(--gray);"><strong>But here's what changes everything:</strong> You only pay taxes on NET profit, not gross income. Every dollar in business expenses reduces your taxable income by a dollar. Every $1,000 in deductions saves $300-400 in taxes. The catch? You need documentation. The IRS doesn't accept "I definitely spent money on my business" as proof.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Contractor Tracking Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Capture Business Costs</h3>
          <p style="color: var(--gray);">Every business expense gets documented. Text receipt photos as costs happen - equipment, software, supplies, meals, travel, everything.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Automatic Organization</h3>
          <p style="color: var(--gray);">We read receipt details and you categorize by expense type. Everything organized by tax deduction category automatically.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Calculate Savings</h3>
          <p style="color: var(--gray);">See exactly how expenses reduce tax liability. $5,000 in documented costs = $1,500-2,000 in tax savings. Real numbers, not estimates.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Generate Reports</h3>
          <p style="color: var(--gray);">Create Excel files organized by month and category. Original receipts linked. Everything your accountant needs for tax filing.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Business Expenses Contractors Track</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Equipment and tools</strong> – Computers, phones, cameras, machinery needed for contract work</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Software and subscriptions</strong> – Every platform, tool, and service you pay monthly for business</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Office expenses</strong> – Supplies, furniture, equipment for dedicated workspace</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Business meals</strong> – Client meetings, networking lunches, working coffee shops (50% deductible)</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Travel costs</strong> – Transportation, hotels, 50% of meals during business trips</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Vehicle expenses</strong> – Business mileage at standard rate or actual costs (gas, maintenance, insurance)</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Marketing</strong> – Website hosting, business cards, ads, promotional materials</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Professional development</strong> – Courses, certifications, books that improve business skills</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Contract labor</strong> – Other contractors you hire for project help</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Business insurance</strong> – Liability coverage, professional insurance for contract work</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Home office</strong> – Portion of rent, utilities, internet for dedicated business space</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">The average independent contractor has $12,000-20,000 in legitimate business expenses annually. That's $3,600-8,000 in tax savings with proper documentation.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Why Documentation Matters</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Self-employment tax is unavoidable</strong> – 15.3% on all net earnings. Can't get around it. But you can reduce the amount it applies to through legitimate business deductions.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Combined tax rates are high</strong> – Federal income tax plus self-employment tax means 30-40% total rate for most contractors. Every deduction works against both taxes.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Quarterly estimates require accuracy</strong> – Underpay quarterly taxes and face penalties. Overpay and lose cash flow. Accurate expense tracking helps calculate actual liability.</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>IRS audits contractors more</strong> – Independent contractors get audited at higher rates than W2 employees. Having organized documentation protects you.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">What Contractors Miss</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Home office deduction</strong> – Most contractors work from home but don't calculate the deduction properly. Could be $2,000-4,000 annually.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Vehicle expenses</strong> – Business mileage adds up fast. 10,000 business miles at $0.67/mile = $6,700 deduction.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Small purchases</strong> – $15 monthly subscriptions seem minor. But 10 subscriptions is $1,800 annually - $540-720 in tax savings.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Meals and coffee</strong> – Client meetings at coffee shops or restaurants. 100 meetings at $5-15 each is $500-1,500 in deductions (50%).</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Professional development</strong> – Books, courses, conferences. If it improves business skills, it's deductible.</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">Without consistent tracking, contractors typically miss $4,000-10,000 in legitimate deductions. That's $1,200-4,000 in unnecessary taxes paid.</p>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Who Needs This</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>W9 contractors</strong> – Anyone providing services as independent contractor vs employee</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Self-employed professionals</strong> – Consultants, freelancers, specialists working contract to contract</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Gig workers</strong> – Uber, DoorDash, Upwork, Fiverr contractors with business expenses</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Anyone filing Schedule C</strong> – If you're reporting business income and expenses, you need tracking</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">If clients send you 1099s instead of W2s, proper expense tracking isn't optional. It's how you keep money you earned.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>One Expense</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Track one receipt to see the system</p>
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
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Invest $60-120 per year to save $2,000-5,000 in taxes. Clear ROI.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Common Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What qualifies as a business expense?</h3>
          <p style="color: var(--gray);">IRS standard: ordinary and necessary for your contracting work. Equipment, supplies, software, travel, meals with clients, professional development - common deductions. When in doubt, document it and ask your accountant.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I deduct my home office?</h3>
          <p style="color: var(--gray);">Yes, if you have dedicated space used regularly and exclusively for business. Calculate square footage percentage or use simplified method ($5 per square foot up to 300 sq ft).</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How do vehicle expenses work?</h3>
          <p style="color: var(--gray);">Two methods: standard mileage rate ($0.67/mile in 2024) or actual expenses (gas, maintenance, insurance, depreciation). Track business vs personal mileage percentage.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What about health insurance?</h3>
          <p style="color: var(--gray);">Self-employed health insurance premiums are deductible above-the-line, reducing both income tax and self-employment tax. This is a major deduction many contractors miss.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I need receipts for everything?</h3>
          <p style="color: var(--gray);">IRS requires documentation. For expenses under $75, canceled checks or credit card statements might suffice. Over $75, you need actual receipts. Always better to have documentation.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if I forget to track something?</h3>
          <p style="color: var(--gray);">Text old receipts when you remember them. Better to document late than never. But real-time tracking captures more consistently.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/independent-contractor-expense-tracking.html');

console.log('✅ Generated: independent-contractor-expense-tracking.html');
