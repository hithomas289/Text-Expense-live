const ContentGenerator = require('./generate-content');

const generator = new ContentGenerator();

const data = {
  TITLE: 'Solopreneur Expense Tracking | Track Solo Business Costs',
  META_DESCRIPTION: 'Track solopreneur expenses via WhatsApp. You\'re doing everything yourself - make tracking automatic. Text receipts, get reports. Try free.',
  KEYWORDS: 'solopreneur expense tracking, expense tracking solopreneurs, track solopreneur expenses',
  OG_TITLE: 'Solopreneur Expense Tracking | Track Solo Business Costs',
  OG_DESCRIPTION: 'Track solopreneur expenses via WhatsApp. You\'re doing everything yourself - make tracking automatic. Text receipts, get reports. Try free.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',
  OG_URL: 'https://textexpense.com/pages/solopreneur-expense-tracking.html',
  TWITTER_TITLE: 'Solopreneur Expense Tracking | Track Solo Business Costs',
  TWITTER_DESCRIPTION: 'Track solopreneur expenses via WhatsApp. You\'re doing everything yourself - make tracking automatic. Text receipts, get reports. Try free.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',
  CANONICAL_URL: 'https://textexpense.com/pages/solopreneur-expense-tracking.html',
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Solopreneur Expense Tracking',
  SCHEMA_DESCRIPTION: 'Track solopreneur expenses via WhatsApp. Running everything solo - make expense tracking automatic. Text receipts, get organized reports.',
  HERO_TITLE: 'Solopreneur Expense Tracking',
  HERO_SUBTITLE: 'Running everything solo - let this run automatically. Text receipt photos via WhatsApp, get organized reports. When you\'re the CEO, CFO, and janitor rolled into one, tracking expenses shouldn\'t add to the pile. Just send receipts, we handle the rest.',
  CTA_TEXT: 'Track first expense free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',
  SECTION_TITLE: 'Solopreneur Tracking',
  SECTION_SUBTITLE: 'Built for people doing everything themselves',
  FOOTER_CTA_TITLE: 'Start Tracking',
  FOOTER_CTA_SUBTITLE: 'Try it with one expense. Text a receipt photo via WhatsApp, see how automatic processing works. Free, no credit card needed.',
  GA_MEASUREMENT_ID: 'G-X7MTLE4KSY',
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid var(--danger); padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Solopreneur Reality</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        You're running an entire business by yourself. Customer service, product delivery, marketing, sales, bookkeeping, tax preparation - all you.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        There's no accounting department to handle expenses. No admin staff to organize receipts. No bookkeeper to maintain records. Just you, doing everything, trying to keep the business running.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        Meanwhile, expenses pile up. That domain renewal. The coworking membership. The software subscriptions. The client lunch. The conference ticket. The equipment upgrade.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        You know you should track these. They're legitimate business costs that reduce your tax bill. But tracking feels like one more task on an already impossible list.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray);">
        So receipts accumulate. Some in your wallet, some in emails, some in your car, some lost entirely. Tax season arrives and you're scrambling, guessing, leaving money on the table.
      </p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Solo Tracking Works</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">No Extra Systems</h3>
          <p style="color: var(--gray);">
            Text receipt photos via WhatsApp you already use. No new app to download, no software to learn, no system to maintain.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Instant Processing</h3>
          <p style="color: var(--gray);">
            OCR reads merchant names, dates, amounts in about 30 seconds. You confirm the category - software, supplies, travel, meals, equipment.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Organized Automatically</h3>
          <p style="color: var(--gray);">
            Everything sorted by month and category. Excel reports generated on demand. Original receipts backed up with download links.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Zero Maintenance</h3>
          <p style="color: var(--gray);">
            No spreadsheets to update, no files to organize, no systems to maintain. Text receipts, get reports. That's the entire workflow.
          </p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Solo Business Expenses</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Software and tools</strong> - Every subscription enabling business operations
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Marketing</strong> - Website hosting, email service, ads, business cards
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Office setup</strong> - Desk, chair, monitor, supplies for workspace
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Equipment</strong> - Computer, phone, camera, tools for delivering service
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Professional development</strong> - Courses, books, conferences improving skills
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Business meals</strong> - Client meetings, networking events (50% deductible)
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Travel costs</strong> - Transportation, hotels, meals during business trips
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Contract help</strong> - Freelancers hired for tasks you can't do solo
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Insurance</strong> - Liability coverage, professional insurance for business
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 30px;">
          <strong>Home office</strong> - Portion of rent, utilities, internet for dedicated space
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center;">
          Solo businesses typically have $10,000-20,000 in annual expenses. That's $3,000-8,000 in tax savings when documented properly.
        </p>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Why Solopreneurs Don't Track</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Too many hats</h3>
          <p style="color: var(--gray);">
            You're doing ten jobs. Adding expense tracking feels impossible when you're already overwhelmed.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">No dedicated time</h3>
          <p style="color: var(--gray);">
            Employees have tasks. Solopreneurs have everything. Expense tracking gets perpetually postponed.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">System overwhelm</h3>
          <p style="color: var(--gray);">
            Most accounting software is built for companies with staff. You don't need payroll, invoicing, inventory - just expense organization.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Unclear ROI</h3>
          <p style="color: var(--gray);">
            Until tax time, tracking feels like busywork. Then you realize you can't claim $8,000 in expenses because documentation is missing.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Energy depletion</h3>
          <p style="color: var(--gray);">
            After a day of client work, product delivery, and marketing, you have nothing left for admin. Receipts pile up.
          </p>
        </div>
      </div>
      <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center; margin-top: 30px;">
        The problem isn't that you're disorganized. It's that tracking requires effort when you're already maxed out.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">What Makes This Work</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Fits existing workflow</h3>
          <p style="color: var(--gray);">
            Lives in WhatsApp you already check constantly. No context switching, no remembering to open apps, no new habits.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Minimal time investment</h3>
          <p style="color: var(--gray);">
            10 seconds per expense. Text photo, confirm category, done. Faster than filing physical receipts.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Works from anywhere</h3>
          <p style="color: var(--gray);">
            On site with client, text receipt. Working from coffee shop, text receipt. Buying equipment online, screenshot and text.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">No system maintenance</h3>
          <p style="color: var(--gray);">
            Nothing to update, nothing to organize, nothing to maintain. The system runs automatically.
          </p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Accountant-ready output</h3>
          <p style="color: var(--gray);">
            Standard Excel files. Your accountant gets clean data instead of chaos or "I think I spent around..."
          </p>
        </div>
      </div>
    </div>

    <div style="background: white; padding: 60px 30px; border-radius: 20px; box-shadow: var(--shadow); margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px; text-align: center;">Who This Helps</h2>
      <div style="max-width: 700px; margin: 0 auto;">
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Solo business owners</strong> - Running everything without employees or admin support
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Solo consultants</strong> - One-person professional services businesses
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Solo creators</strong> - Content creators, designers, writers operating independently
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 30px;">
          <strong>Solo technical specialists</strong> - Developers, engineers, analysts working alone
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center;">
          If you're the entire company and drowning in responsibilities, proper tracking shouldn't add to the burden.
        </p>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; max-width: 900px; margin: 0 auto;">
        <div class="card">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">First expense free</h3>
          <p style="color: var(--gray);">
            Try with one receipt to see workflow
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
        Invest $60-120 per year, save $3,000-8,000 in taxes through better documentation.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Common Questions</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Is this enough for my business?</h3>
          <p style="color: var(--gray);">
            Yes as a solopreneur, who is focussed on deductibles and taxes, this is all you need.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">What about expenses I already paid?</h3>
          <p style="color: var(--gray);">
            Text old receipt photos anytime. If you have physical receipts from earlier in the year, photograph and text them. Better documented late than never.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Can I track both business and personal?</h3>
          <p style="color: var(--gray);">
            Absolutely, just tag them for you to identify them later.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">How does categorization work?</h3>
          <p style="color: var(--gray);">
            We read receipt details automatically. You confirm what the expense was for - supplies, software, meals, travel, etc. Takes 10 seconds.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">What if I forget to track something?</h3>
          <p style="color: var(--gray);">
            Text it when you remember. Even receipts from months ago can be processed and added to your records.
          </p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Will my accountant understand the reports?</h3>
          <p style="color: var(--gray);">
            Yes. Standard Excel format with expenses organized by month and category. Most accountants prefer this over scattered receipts or photo dumps.
          </p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/solopreneur-expense-tracking.html');

console.log('✅ Solopreneur expense tracking page generated successfully!');
console.log('📄 File: frontend/pages/solopreneur-expense-tracking.html');
console.log('🔗 URL: /pages/solopreneur-expense-tracking.html');
