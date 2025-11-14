const ContentGenerator = require('./generate-content');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Self Employed Expense Tracker | Track Business Costs Via WhatsApp',
  META_DESCRIPTION: 'Track self employed expenses via WhatsApp. Text receipts, organize business costs, maximize deductions. No software to learn. Try free.',
  KEYWORDS: 'self employed expense tracker, expense tracker self employed, track self employed expenses',

  // Open Graph Tags
  OG_TITLE: 'Self Employed Expense Tracker | Track Business Costs Via WhatsApp',
  OG_DESCRIPTION: 'Track self employed expenses via WhatsApp. Text receipts, organize business costs, maximize deductions. No software to learn. Try free.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',
  OG_URL: 'https://textexpense.com/pages/self-employed-expense-tracker',

  // Twitter Card Tags
  TWITTER_TITLE: 'Self Employed Expense Tracker | Track Business Costs Via WhatsApp',
  TWITTER_DESCRIPTION: 'Track self employed expenses via WhatsApp. Text receipts, organize business costs, maximize deductions. No software to learn. Try free.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/self-employed-expense-tracker',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Self Employed Expense Tracker',
  SCHEMA_DESCRIPTION: 'Track self employed expenses via WhatsApp. Text receipts, organize business costs automatically. No software to learn.',

  // Hero Section
  HERO_TITLE: 'Self Employed Expense Tracker',
  HERO_SUBTITLE: 'You wear all the hats - let this one be automatic. Text receipt photos via WhatsApp, get organized Excel reports. When you\'re your own boss, accountant, and admin, tracking expenses shouldn\'t take hours. Just send receipts, everything else happens automatically.',

  // Content Header
  SECTION_TITLE: 'Simple Tracking for Self-Employed',
  SECTION_SUBTITLE: 'When you\'re juggling everything, expense tracking should be the easiest part',

  // CTA
  CTA_TEXT: 'Track first expense free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start Tracking',
  FOOTER_CTA_SUBTITLE: 'Try it with one business expense. Text a receipt photo via WhatsApp, see how processing works. Completely free, no credit card needed.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-5F3EMPRHFP',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid var(--danger); padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Self-Employment Reality</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        You started a business to do work you're good at. Now you spend evenings trying to remember what you spent three months ago.
      </p>
      <p style="color: var(--gray); margin-bottom: 15px;">
        That laptop you bought? Definitely deductible. The coffee shop meetings? Probably deductible. The software subscriptions? Definitely. The home office setup? Deductible if you track it right.
      </p>
      <p style="color: var(--gray); margin-bottom: 15px;">
        But tracking feels like unpaid admin work. You're busy delivering services, finding clients, doing actual billable work. Maintaining spreadsheets or learning accounting software? That's time you're not earning money.
      </p>
      <p style="color: var(--gray);">
        Meanwhile, April arrives. You scramble for receipts. Half are missing, half are faded, all are unorganized. You pay taxes on income you didn't actually keep because you can't prove what you spent.
      </p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Self-Employed Tracking Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Text as You Spend</h3>
          <p style="color: var(--gray);">Buy something for the business, text the receipt photo immediately. No logging into software, no saving for later, no filing systems.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Automatic Reading</h3>
          <p style="color: var(--gray);">OCR extracts merchant names, dates, amounts in about 30 seconds. You confirm the category - office supplies, software, travel, meals, equipment.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Organized Reports</h3>
          <p style="color: var(--gray);">Request Excel files anytime. Expenses sorted by month and category, original receipts linked. Send to your accountant or import into tax software.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Nothing Forgotten</h3>
          <p style="color: var(--gray);">Every expense documented immediately means nothing falls through cracks. Small charges add up - $15 subscriptions, $4 coffees, $25 domains.</p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Business Costs Worth Tracking</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--success);">✓ Office and supplies</h3>
          <p style="color: var(--gray); font-size: 0.95rem;">Everything you need to actually do the work</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--success);">✓ Software and tools</h3>
          <p style="color: var(--gray); font-size: 0.95rem;">Subscriptions that enable your business</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--success);">✓ Equipment</h3>
          <p style="color: var(--gray); font-size: 0.95rem;">Computers, phones, cameras, tools for client work</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--success);">✓ Home office</h3>
          <p style="color: var(--gray); font-size: 0.95rem;">Portion of rent, utilities, internet for dedicated space</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--success);">✓ Professional development</h3>
          <p style="color: var(--gray); font-size: 0.95rem;">Courses, books, certifications improving skills</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--success);">✓ Marketing</h3>
          <p style="color: var(--gray); font-size: 0.95rem;">Website hosting, business cards, ads, promotion</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--success);">✓ Business meals</h3>
          <p style="color: var(--gray); font-size: 0.95rem;">Client meetings, networking lunches (50% deductible)</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--success);">✓ Travel</h3>
          <p style="color: var(--gray); font-size: 0.95rem;">Transportation, hotels, meals during business trips</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--success);">✓ Contract labor</h3>
          <p style="color: var(--gray); font-size: 0.95rem;">Other self-employed people you hire for help</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 5px; color: var(--success);">✓ Insurance</h3>
          <p style="color: var(--gray); font-size: 0.95rem;">Liability coverage, professional insurance for your work</p>
        </div>
      </div>

      <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center; margin-top: 30px;">
        When you're self-employed, every dollar counts. Missing $10,000 in documented expenses? That's roughly $3,000-4,000 in unnecessary taxes paid.
      </p>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Why Self-Employed People Don't Track</h2>

      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Time scarcity</h3>
        <p style="color: var(--gray);">You're doing client work, finding new clients, handling admin, managing books. Adding expense tracking feels impossible.</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Software overwhelm</h3>
        <p style="color: var(--gray);">Most accounting software is built for companies with bookkeepers. You don't need invoicing, payroll, project management - just expense organization.</p>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Spreadsheet maintenance</h3>
        <p style="color: var(--gray);">Manual entry requires discipline you don't have when juggling everything. Spreadsheets get abandoned by March.</p>
      </div>

      <div>
        <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Unclear benefits</h3>
        <p style="color: var(--gray);">Until tax time hits, tracking feels like busywork. Then you realize you can't claim $8,000 in legitimate expenses because you have no documentation.</p>
      </div>

      <p style="color: var(--gray); font-style: italic; margin-top: 25px;">
        The problem isn't that you're bad at tracking. It's that every system adds friction when you're already doing ten jobs.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">What Makes This Work</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 10px; color: var(--success);">✓ Zero context switching</h3>
          <p style="color: var(--gray);">Lives in WhatsApp you already use daily. No separate app to remember, no software to open, no passwords to manage.</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 10px; color: var(--success);">✓ 10-second per expense</h3>
          <p style="color: var(--gray);">Text photo, confirm category, done. That's the entire workflow. Not minutes of data entry per receipt.</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 10px; color: var(--success);">✓ Works from anywhere</h3>
          <p style="color: var(--gray);">Meeting ends, text receipt from your phone. Working from coffee shop, text receipt. Buy equipment online, screenshot and text.</p>
        </div>
        <div>
          <h3 style="font-size: 1.1rem; margin-bottom: 10px; color: var(--success);">✓ Accountant-friendly output</h3>
          <p style="color: var(--gray);">Generates standard Excel files. Your accountant gets clean, organized data instead of shoeboxes or photo folders.</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px; text-align: center;">Who This Helps</h2>
      <div style="background: white; border: 2px solid var(--border); padding: 30px; border-radius: 20px;">
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Solo business owners</strong> - Running everything yourself without admin support</p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Service professionals</strong> - Consultants, coaches, freelancers doing client work</p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Creative professionals</strong> - Designers, writers, photographers with business costs</p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 20px;"><strong>Technical specialists</strong> - Developers, engineers, analysts working independently</p>
        <p style="font-size: 1.1rem; color: var(--gray); font-style: italic;">If you're self-employed and doing your own bookkeeping, proper tracking isn't optional. It's how you keep money you earned.</p>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>First expense free</h3>
          <p>Try with one receipt to see how it works</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>$2.99/month</h3>
          <p>6 expenses monthly</p>
        </div>

        <div class="card">
          <h3>$4.99/month</h3>
          <p>25 expenses monthly</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray); font-style: italic;">Invest $60-120 annually, save $2,000-5,000 in taxes through better documentation.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Common Questions</h2>

      <div style="background: white; border: 2px solid var(--border); padding: 30px; border-radius: 20px; margin-bottom: 20px;">
        <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Is this enough for my bookkeeping?</h3>
        <p style="color: var(--gray);">This handles expense capture and organization which is what is needed for your accountant. If you need full accounting with invoicing, time tracking, or payroll, you need comprehensive software.</p>
      </div>

      <div style="background: white; border: 2px solid var(--border); padding: 30px; border-radius: 20px; margin-bottom: 20px;">
        <h3 style="font-size: 1.3rem; margin-bottom: 15px;">What about expenses without receipts?</h3>
        <p style="color: var(--gray);">Things like mileage or home office calculations can be manually entered. But most deductions require documentation - IRS wants proof, not estimates.</p>
      </div>

      <div style="background: white; border: 2px solid var(--border); padding: 30px; border-radius: 20px; margin-bottom: 20px;">
        <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Can I track both personal and business?</h3>
        <p style="color: var(--gray);">Yes, you can, just make sure to tag them for you to organise it later.</p>
      </div>

      <div style="background: white; border: 2px solid var(--border); padding: 30px; border-radius: 20px; margin-bottom: 20px;">
        <h3 style="font-size: 1.3rem; margin-bottom: 15px;">How does categorization work?</h3>
        <p style="color: var(--gray);">We read receipt details automatically. You confirm what the expense was for - supplies, software, meals, travel, etc. Takes 10 seconds, ensures proper tax categorization.</p>
      </div>

      <div style="background: white; border: 2px solid var(--border); padding: 30px; border-radius: 20px; margin-bottom: 20px;">
        <h3 style="font-size: 1.3rem; margin-bottom: 15px;">What if I forget to track something?</h3>
        <p style="color: var(--gray);">Text it later. Even receipts from earlier in the year can be processed and added. Better documented late than not at all.</p>
      </div>

      <div style="background: white; border: 2px solid var(--border); padding: 30px; border-radius: 20px;">
        <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Will my accountant understand the reports?</h3>
        <p style="color: var(--gray);">Yes. Standard Excel format with expenses by month and category. Most accountants prefer this over physical receipts or unorganized photos.</p>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/self-employed-expense-tracker.html');

console.log('✅ Self-employed expense tracker page generated successfully!');
console.log('📄 File: frontend/pages/self-employed-expense-tracker.html');
console.log('🔗 URL: /pages/self-employed-expense-tracker');
