const ContentGenerator = require('./generate-content');

const generator = new ContentGenerator();

const data = {
  TITLE: 'Expense Tracking for Consultants | Track Client Costs Via WhatsApp',
  META_DESCRIPTION: 'Track consulting expenses via WhatsApp. Client meetings, travel, project costs organized automatically. Text receipts, get reports. Try free.',
  KEYWORDS: 'expense tracking for consultants, consultant expense tracking, track consulting expenses',
  OG_TITLE: 'Expense Tracking for Consultants | Track Client Costs Via WhatsApp',
  OG_DESCRIPTION: 'Track consulting expenses via WhatsApp. Client meetings, travel, project costs organized automatically. Text receipts, get reports. Try free.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',
  OG_URL: 'https://textexpense.com/pages/expense-tracking-for-consultants.html',
  TWITTER_TITLE: 'Expense Tracking for Consultants | Track Client Costs Via WhatsApp',
  TWITTER_DESCRIPTION: 'Track consulting expenses via WhatsApp. Client meetings, travel, project costs organized automatically. Text receipts, get reports. Try free.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',
  CANONICAL_URL: 'https://textexpense.com/pages/expense-tracking-for-consultants.html',
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Expense Tracking for Consultants',
  SCHEMA_DESCRIPTION: 'Track consulting expenses via WhatsApp. Client meetings, travel, project costs organized automatically by client and project.',
  HERO_TITLE: 'Expense Tracking for Consultants',
  HERO_SUBTITLE: 'Track client costs without tracking software. Text receipt photos via WhatsApp, expenses get organized automatically. Client dinners, travel to meetings, project tools - everything documented and categorized. Excel reports ready when you need them.',
  CTA_TEXT: 'Track first expense free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',
  SECTION_TITLE: 'Consulting Expense Tracking',
  SECTION_SUBTITLE: 'Save expensive billable hours on admin work',
  FOOTER_CTA_TITLE: 'Start Tracking',
  FOOTER_CTA_SUBTITLE: 'Try it with one consulting expense. Text a receipt photo via WhatsApp, see how organization works. Completely free, no commitment.',
  GA_MEASUREMENT_ID: 'G-X7MTLE4KSY',
  MAIN_CONTENT: `
    <section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 2em; margin-bottom: 20px; color: #1a1a1a;">The Consultant Problem</h2>
      <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
        You're billing $150-300 per hour. You just spent 45 minutes trying to recreate last quarter's expenses from memory and random receipts.
      </p>
      <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
        That's $112-225 in lost billable time spent on admin work. And you're probably missing expenses anyway.
      </p>
      <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
        Client dinner in Chicago? Receipt's somewhere. Flight to Boston for project kickoff? You think it was $380. Hotel near client site? Definitely paid for it. Software for client deliverable? Maybe deducted it, maybe didn't.
      </p>
      <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
        You're a consultant. Your time is expensive. Spending it on expense reconstruction is expensive too.
      </p>
    </section>

    <section style="padding: 60px 20px; background: #f8f9fa;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2em; margin-bottom: 40px; color: #1a1a1a; text-align: center;">How Consultant Tracking Works</h2>

        <div style="margin-bottom: 40px;">
          <h3 style="font-size: 1.5em; color: #2c3e50; margin-bottom: 15px;">Capture at Transaction</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Client dinner ends, text receipt photo. Buy software for project, text confirmation email. Travel expense happens, text documentation.
          </p>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="font-size: 1.5em; color: #2c3e50; margin-bottom: 15px;">Automatic Organization</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            We extract details: merchant, date, amount, purpose. You confirm if it's client-related, project-specific, or general business cost.
          </p>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="font-size: 1.5em; color: #2c3e50; margin-bottom: 15px;">Client-Level Reporting</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Generate reports by client, by project, or by time period. See exactly what each engagement cost you in expenses.
          </p>
        </div>

        <div>
          <h3 style="font-size: 1.5em; color: #2c3e50; margin-bottom: 15px;">Billable Identification</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Tag which expenses are billable to clients. Track what you need to invoice separately from general business costs.
          </p>
        </div>
      </div>
    </section>

    <section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 2em; margin-bottom: 30px; color: #1a1a1a; text-align: center;">Consulting Expenses Tracked</h2>

      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Client meetings</strong> - Meals, coffee, entertainment during client discussions (typically 50% deductible)
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Travel to client sites</strong> - Flights, trains, rideshares, mileage to meetings
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Accommodations</strong> - Hotels near client locations for multi-day engagements
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Project-specific tools</strong> - Software, platforms, resources purchased for client deliverables
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Professional development</strong> - Courses, certifications that improve consulting capabilities
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Marketing</strong> - Website, business cards, conference attendance for client acquisition
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Home office</strong> - Portion of space costs for client work from home
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Communication</strong> - Phone, internet, video conferencing tools for client interactions
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Contract labor</strong> - Specialists hired for specific client projects
        </p>
      </div>
      <div style="margin-bottom: 30px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Professional services</strong> - Accountant, lawyer, insurance for consulting practice
        </p>
      </div>

      <p style="font-size: 1.1em; line-height: 1.8; color: #333; font-style: italic; text-align: center;">
        Average consultant has $12,000-25,000 in annual expenses. That's $3,600-10,000 in tax savings with proper documentation.
      </p>
    </section>

    <section style="padding: 60px 20px; background: #f8f9fa;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2em; margin-bottom: 30px; color: #1a1a1a;">Why Consultants Need Better Tracking</h2>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">High opportunity cost</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Your time is valuable. Every hour on expense admin is an hour not billing clients. Quick tracking saves expensive time.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Project profitability visibility</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Without expense tracking, you don't know if clients are actually profitable. Some engagements might cost more than they're worth.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Billable expense recovery</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Many consulting agreements allow billing travel, tools, or other costs. Missing those reimbursements reduces project revenue.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Tax deduction maximization</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Self-employment tax is 15.3% plus federal income tax. Every documented expense saves 30-40% in combined taxes.
          </p>
        </div>

        <div>
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Professional appearance</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Organized records signal competence. Scrambling for receipts signals disorganization. Matters for client relationships.
          </p>
        </div>
      </div>
    </section>

    <section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 2em; margin-bottom: 30px; color: #1a1a1a; text-align: center;">What Consultants Miss</h2>

      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Small client meeting costs</h3>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          $8 coffee meetings feel minor. But 50 client coffees is $400 in deductions - $120-160 in tax savings.
        </p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Software and subscriptions</h3>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          That $29/month tool for client presentations? $348 annually, $104-139 in tax savings. Multiply by 5-10 subscriptions.
        </p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Travel-related meals</h3>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          50% of meal costs during business travel are deductible. Consultants traveling frequently miss hundreds in deductions.
        </p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Home office calculations</h3>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          Most consultants work from home between client visits. Portion of rent, utilities, internet is deductible if tracked properly.
        </p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Professional development</h3>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          Books, courses, conferences that improve consulting skills. Fully deductible but often undocumented.
        </p>
      </div>

      <p style="font-size: 1.1em; line-height: 1.8; color: #333; font-style: italic; text-align: center;">
        Without consistent tracking, consultants typically miss $4,000-8,000 in legitimate annual deductions.
      </p>
    </section>

    <section style="padding: 60px 20px; background: #f8f9fa;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2em; margin-bottom: 20px; color: #1a1a1a; text-align: center;">Who This Helps</h2>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
          <strong>Independent consultants</strong> - Solo practitioners billing clients directly
        </p>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
          <strong>Fractional executives</strong> - Part-time leadership roles across multiple companies
        </p>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
          <strong>Strategy consultants</strong> - Client engagements requiring travel and on-site work
        </p>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 30px;">
          <strong>Specialized advisors</strong> - Technical, financial, or industry-specific consulting
        </p>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333; font-style: italic; text-align: center;">
          If you're billing hourly or project-based and tracking expenses manually, you're wasting expensive time.
        </p>
      </div>
    </section>

    <section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 2em; margin-bottom: 30px; color: #1a1a1a; text-align: center;">Pricing</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div style="padding: 20px; background: #fff; border: 2px solid #e0e0e0; border-radius: 8px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">First expense free</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Process one to see the workflow
          </p>
        </div>

        <div style="padding: 20px; background: #fff; border: 2px solid #e0e0e0; border-radius: 8px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">$2.99/month</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            6 expenses monthly
          </p>
        </div>

        <div style="padding: 20px; background: #fff; border: 2px solid #e0e0e0; border-radius: 8px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">$4.99/month</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            25 expenses monthly
          </p>
        </div>
      </div>

      <p style="font-size: 1.1em; line-height: 1.8; color: #333; text-align: center; font-style: italic;">
        Invest $60-120 yearly, save thousands in taxes and billable hours.
      </p>
    </section>

    <section style="padding: 60px 20px; background: #f8f9fa;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2em; margin-bottom: 30px; color: #1a1a1a; text-align: center;">Common Questions</h2>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Can I track expenses by client or project?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Yes. When confirming category, you can note which client or engagement. Reports can filter by client to see project-specific costs.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">How do I identify billable expenses?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Tag expenses as billable during confirmation. When generating reports, you can filter for billable items to include in client invoices.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">What about mileage tracking?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            For driving to client sites, you can manually enter mileage. Standard IRS rate ($0.67/mile in 2024) applies to business driving.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Can my accountant use these reports?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Yes. Standard Excel format with expenses by category. Most accountants prefer organized digital records over physical receipts.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">What if I have both W2 and consulting income?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Track consulting expenses only. W2 employment doesn't generate business deductions. But consulting costs are fully deductible on Schedule C.
          </p>
        </div>

        <div>
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">How does this work with quarterly taxes?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Organized expense records help calculate actual quarterly tax liability. You can see year-to-date expenses to estimate what you'll owe.
          </p>
        </div>
      </div>
    </section>

    <section style="padding: 80px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 2.2em; margin-bottom: 20px; color: white;">Start Tracking</h2>
        <p style="font-size: 1.2em; line-height: 1.8; margin-bottom: 30px; color: white;">
          Try it with one consulting expense. Text a receipt photo via WhatsApp, see how organization works. Completely free, no commitment.
        </p>
        <a href="https://wa.me/14155238886?text=Hi"
           style="display: inline-block; background: white; color: #667eea; padding: 18px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 1.1em; transition: transform 0.3s ease;">
          Track Expense Free →
        </a>
        <p style="font-size: 1em; margin-top: 30px; color: rgba(255,255,255,0.9);">
          Track consulting costs without wasting consulting rates on admin work.
        </p>
      </div>
    </section>
  `
};

generator.generate('landing', data, 'frontend/pages/expense-tracking-for-consultants.html');

console.log('✅ Expense tracking for consultants page generated successfully!');
console.log('📄 File: frontend/pages/expense-tracking-for-consultants.html');
console.log('🔗 URL: /pages/expense-tracking-for-consultants.html');
