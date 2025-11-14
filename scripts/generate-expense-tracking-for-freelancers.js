const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Expense Tracking for Freelancers | Maximize Tax Deductions',
  META_DESCRIPTION: 'Track business expenses via WhatsApp. Stop missing tax deductions. Text receipts, get organized reports. Try free.',
  KEYWORDS: 'expense tracking for freelancers, track expenses freelancers, freelancer expense tracking, freelance tax deductions, track business expenses',

  // Open Graph Tags
  OG_TITLE: 'Expense Tracking for Freelancers | Maximize Tax Deductions',
  OG_DESCRIPTION: 'Track business expenses via WhatsApp. Stop missing tax deductions. Text receipts, get organized reports.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Expense Tracking for Freelancers | TextExpense',
  TWITTER_DESCRIPTION: 'Track business expenses via WhatsApp. Stop missing tax deductions and overpaying taxes.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/expense-tracking-for-freelancers',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Expense Tracking for Freelancers',
  SCHEMA_DESCRIPTION: 'Track business expenses via WhatsApp. Stop missing tax deductions. Text receipts, get organized reports for tax filing.',

  // Hero Section
  HERO_TITLE: 'Expense Tracking for Freelancers',
  HERO_SUBTITLE: 'Stop overpaying taxes because you lost receipts. Send receipt photos via WhatsApp, get Excel reports organized by tax category. Average users save $5,600 annually just by documenting what they actually spent.',

  // Content Header
  SECTION_TITLE: 'How Tracking Actually Works',
  SECTION_SUBTITLE: 'Capture expenses, categorize automatically, get tax-ready reports, maximize deductions.',

  // CTA
  CTA_TEXT: 'Process First Receipt Free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start Tracking',
  FOOTER_CTA_SUBTITLE: 'Process one receipt for free. See how the system works, check if the output helps, decide if it\'s worth using. No credit card, no commitment.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Tax Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">You earned $80,000 last year. You probably spent $15,000-20,000 on legitimate business costs: equipment, software, travel, meals, supplies.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Can you prove it? Do you have receipts for everything? Organized by category? Ready for your accountant?</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Most freelancers can't. Receipts fade, get lost, or never get tracked in the first place. So they pay taxes on $80,000 instead of $60,000. That's roughly $6,000 in unnecessary taxes.</p>
      <p style="color: var(--gray);"><strong>The IRS is fine with deductions - they just need documentation.</strong> But documentation requires systems that actually work when you're busy with client work.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Tracking Actually Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Capture Expenses Immediately</h3>
          <p style="color: var(--gray);">Coffee meeting with a client? Text the receipt photo right then. Don't wait, don't file it, don't put it somewhere "safe." Just text it.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Automatic Categorization</h3>
          <p style="color: var(--gray);">We read the receipt details and you assign the category: business meal, travel, equipment, whatever fits. Takes 10 seconds. Everything's organized automatically.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Tax-Ready Reports</h3>
          <p style="color: var(--gray);">Generate Excel files by month with all expenses sorted by category. Original receipts linked. Your accountant gets exactly what they need.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Deduction Maximization</h3>
          <p style="color: var(--gray);">When you track consistently, you catch everything: that $4 coffee, that $15 domain renewal, that $200 conference ticket. Small amounts add up to thousands in deductions.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">What You Can Deduct</h2>
      <p style="color: var(--gray); margin-bottom: 20px; font-style: italic;">This isn't tax advice - talk to your accountant about your specific situation. But commonly deductible freelance expenses include:</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Business meals</strong> – Coffee meetings, client dinners, working lunches (typically 50% deductible)</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Home office costs</strong> – Portion of rent, utilities, internet for dedicated workspace</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Equipment</strong> – Computers, phones, cameras, tools you need for work</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Software</strong> – All the subscriptions and services you use to deliver client work</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Professional development</strong> – Courses, books, conferences that improve your skills</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Travel</strong> – Transportation, lodging, meals for business trips</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 20px;"><strong>Marketing</strong> – Website hosting, advertising, business cards</p>
      <p style="color: var(--gray); font-style: italic;">The IRS rule is "ordinary and necessary" for your business. If you wouldn't buy it without the business, it's probably deductible.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Why Tracking Matters</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Audit protection</strong> – The IRS questions your deductions? You have receipts, not vague memories.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Cash flow visibility</strong> – You can't manage what you don't measure. Tracking shows where money actually goes.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Quarterly tax accuracy</strong> – Better expense records mean more accurate estimated tax payments.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Profitability clarity</strong> – Is that client actually profitable after expenses? You can't tell without tracking.</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">Most freelancers don't track because it feels like administrative busywork. But missing $5,000+ in deductions is expensive busywork to skip.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Who Needs This</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Self-employed professionals filing Schedule C</strong> – Track deductible expenses properly without complicated accounting software</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Freelancers with messy records</strong> – Stop scrambling at tax time trying to remember what you spent</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>People overpaying taxes</strong> – Claim legitimate deductions you're missing due to lost receipts</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Anyone with an accountant</strong> – Give them organized data instead of chaos</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">If you're paying someone to do your taxes but giving them incomplete information, you're wasting money twice.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>One Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>See how it works with no commitment</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">LIGHT USE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>6 receipts monthly - good for light tracking</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>25 receipts monthly - better for regular use</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Spend $60-120 per year to save $5,000+. That's the math.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Common Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How much can I actually save?</h3>
          <p style="color: var(--gray);">Depends on what you're currently missing. If you're tracking zero expenses, probably $3,000-8,000 in missed deductions. If you're tracking some but losing receipts, maybe $1,000-3,000. Average users report around $5,600 in additional deductions.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Is this enough for tax filing?</h3>
          <p style="color: var(--gray);">This handles receipt organization and expense tracking. You still need accounting software or an accountant for actual tax filing. Think of this as feeding them good data instead of garbage.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if I forget to track something?</h3>
          <p style="color: var(--gray);">Text it later. Even old receipts can be processed and added to your records. Better late than never.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I need separate business accounts?</h3>
          <p style="color: var(--gray);">No, but it helps. This tracks business expenses regardless of which card you used. You just need to identify which transactions are business-related.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I track non-receipt expenses?</h3>
          <p style="color: var(--gray);">For things without receipts - like mileage or home office calculations - you can manually enter them. The system handles both receipt photos and manual entries.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How long does tracking take daily?</h3>
          <p style="color: var(--gray);">Literally 10 seconds per receipt. Text photo, confirm category. That's it. You spend more time finding receipts in your wallet than actually tracking them.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/expense-tracking-for-freelancers.html');

console.log('✅ Generated: expense-tracking-for-freelancers.html');
