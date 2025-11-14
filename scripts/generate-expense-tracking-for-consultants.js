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
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid var(--danger); padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Consultant Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        You're billing $150-300 per hour. You just spent 45 minutes trying to recreate last quarter's expenses from memory and random receipts.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        That's $112-225 in lost billable time spent on admin work. And you're probably missing expenses anyway.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        Client dinner in Chicago? Receipt's somewhere. Flight to Boston for project kickoff? You think it was $380. Hotel near client site? Definitely paid for it. Software for client deliverable? Maybe deducted it, maybe didn't.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray);">
        You're a consultant. Your time is expensive. Spending it on expense reconstruction is expensive too.
      </p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Consultant Tracking Works</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Capture at Transaction</h3>
          <p style="color: var(--gray);">
            Client dinner ends, text receipt photo. Buy software for project, text confirmation email. Travel expense happens, text documentation.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Automatic Organization</h3>
          <p style="color: var(--gray);">
            We extract details: merchant, date, amount, purpose. You confirm if it's client-related, project-specific, or general business cost.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Client-Level Reporting</h3>
          <p style="color: var(--gray);">
            Generate reports by client, by project, or by time period. See exactly what each engagement cost you in expenses.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Billable Identification</h3>
          <p style="color: var(--gray);">
            Tag which expenses are billable to clients. Track what you need to invoice separately from general business costs.
          </p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Consulting Expenses Tracked</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Client meetings</strong> - Meals, coffee, entertainment during client discussions (typically 50% deductible)
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Travel to client sites</strong> - Flights, trains, rideshares, mileage to meetings
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Accommodations</strong> - Hotels near client locations for multi-day engagements
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Project-specific tools</strong> - Software, platforms, resources purchased for client deliverables
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Professional development</strong> - Courses, certifications that improve consulting capabilities
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Marketing</strong> - Website, business cards, conference attendance for client acquisition
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Home office</strong> - Portion of space costs for client work from home
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Communication</strong> - Phone, internet, video conferencing tools for client interactions
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Contract labor</strong> - Specialists hired for specific client projects
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 30px;">
          <strong>Professional services</strong> - Accountant, lawyer, insurance for consulting practice
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center;">
          Average consultant has $12,000-25,000 in annual expenses. That's $3,600-10,000 in tax savings with proper documentation.
        </p>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Why Consultants Need Better Tracking</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--primary);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">High opportunity cost</h3>
          <p style="color: var(--gray);">
            Your time is valuable. Every hour on expense admin is an hour not billing clients. Quick tracking saves expensive time.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--primary);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Project profitability visibility</h3>
          <p style="color: var(--gray);">
            Without expense tracking, you don't know if clients are actually profitable. Some engagements might cost more than they're worth.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--primary);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Billable expense recovery</h3>
          <p style="color: var(--gray);">
            Many consulting agreements allow billing travel, tools, or other costs. Missing those reimbursements reduces project revenue.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--primary);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Tax deduction maximization</h3>
          <p style="color: var(--gray);">
            Self-employment tax is 15.3% plus federal income tax. Every documented expense saves 30-40% in combined taxes.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--primary);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Professional appearance</h3>
          <p style="color: var(--gray);">
            Organized records signal competence. Scrambling for receipts signals disorganization. Matters for client relationships.
          </p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">What Consultants Miss</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Small client meeting costs</h3>
          <p style="color: var(--gray);">
            $8 coffee meetings feel minor. But 50 client coffees is $400 in deductions - $120-160 in tax savings.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Software and subscriptions</h3>
          <p style="color: var(--gray);">
            That $29/month tool for client presentations? $348 annually, $104-139 in tax savings. Multiply by 5-10 subscriptions.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Travel-related meals</h3>
          <p style="color: var(--gray);">
            50% of meal costs during business travel are deductible. Consultants traveling frequently miss hundreds in deductions.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Home office calculations</h3>
          <p style="color: var(--gray);">
            Most consultants work from home between client visits. Portion of rent, utilities, internet is deductible if tracked properly.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Professional development</h3>
          <p style="color: var(--gray);">
            Books, courses, conferences that improve consulting skills. Fully deductible but often undocumented.
          </p>
        </div>
        <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center; margin-top: 20px;">
          Without consistent tracking, consultants typically miss $4,000-8,000 in legitimate annual deductions.
        </p>
      </div>
    </div>

    <div style="background: white; padding: 60px 30px; border-radius: 20px; box-shadow: var(--shadow); margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px; text-align: center;">Who This Helps</h2>
      <div style="max-width: 700px; margin: 0 auto;">
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Independent consultants</strong> - Solo practitioners billing clients directly
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Fractional executives</strong> - Part-time leadership roles across multiple companies
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Strategy consultants</strong> - Client engagements requiring travel and on-site work
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 30px;">
          <strong>Specialized advisors</strong> - Technical, financial, or industry-specific consulting
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center;">
          If you're billing hourly or project-based and tracking expenses manually, you're wasting expensive time.
        </p>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; max-width: 900px; margin: 0 auto;">
        <div class="card">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">First expense free</h3>
          <p style="color: var(--gray);">
            Process one to see the workflow
          </p>
        </div>
        <div class="card">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">$2.99/month</h3>
          <p style="color: var(--gray);">
            6 expenses monthly
          </p>
        </div>
        <div class="card">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">$4.99/month</h3>
          <p style="color: var(--gray);">
            25 expenses monthly
          </p>
        </div>
      </div>
      <p style="font-size: 1.1rem; color: var(--gray); text-align: center; font-style: italic; margin-top: 30px;">
        Invest $60-120 yearly, save thousands in taxes and billable hours.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Common Questions</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Can I track expenses by client or project?</h3>
          <p style="color: var(--gray);">
            Yes. When confirming category, you can note which client or engagement. Reports can filter by client to see project-specific costs.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">How do I identify billable expenses?</h3>
          <p style="color: var(--gray);">
            Tag expenses as billable during confirmation. When generating reports, you can filter for billable items to include in client invoices.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">What about mileage tracking?</h3>
          <p style="color: var(--gray);">
            For driving to client sites, you can manually enter mileage. Standard IRS rate ($0.67/mile in 2024) applies to business driving.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Can my accountant use these reports?</h3>
          <p style="color: var(--gray);">
            Yes. Standard Excel format with expenses by category. Most accountants prefer organized digital records over physical receipts.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">What if I have both W2 and consulting income?</h3>
          <p style="color: var(--gray);">
            Track consulting expenses only. W2 employment doesn't generate business deductions. But consulting costs are fully deductible on Schedule C.
          </p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">How does this work with quarterly taxes?</h3>
          <p style="color: var(--gray);">
            Organized expense records help calculate actual quarterly tax liability. You can see year-to-date expenses to estimate what you'll owe.
          </p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/expense-tracking-for-consultants.html');

console.log('✅ Expense tracking for consultants page generated successfully!');
console.log('📄 File: frontend/pages/expense-tracking-for-consultants.html');
console.log('🔗 URL: /pages/expense-tracking-for-consultants.html');
