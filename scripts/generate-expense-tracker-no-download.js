const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Expense Tracker No Download | WhatsApp Receipt Management',
  META_DESCRIPTION: 'Expense tracking without app downloads. Manage receipts through WhatsApp, get Excel reports instantly. No installation, no setup, no complexity. Try free.',
  KEYWORDS: 'expense tracker no download, no download expense management, WhatsApp expense tracking, receipt tracker without app, app-free expense tracking',

  // Open Graph Tags
  OG_TITLE: 'Expense Tracker No Download | WhatsApp Receipt Management',
  OG_DESCRIPTION: 'Expense tracking without app downloads. Manage receipts through WhatsApp, get Excel reports instantly. No installation, no setup.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Expense Tracker No Download | TextExpense',
  TWITTER_DESCRIPTION: 'Expense tracking without app downloads. Manage receipts through WhatsApp instantly.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/expense-tracker-no-download',

  // Schema.org Data
  SCHEMA_TYPE: 'WebPage',
  SCHEMA_NAME: 'Expense Tracker No Download',
  SCHEMA_DESCRIPTION: 'Expense tracking without app downloads. Manage receipts through WhatsApp, get Excel reports instantly.',

  // Hero Section
  HERO_TITLE: 'Finally, An Expense Tracker That Doesn\'t Require An App',
  HERO_SUBTITLE: 'Professional expense management through WhatsApp. Tired of downloading apps that clutter your phone and complicate your life? TextExpense works entirely through WhatsApp – the messaging app you already use daily.',

  // Content Header
  SECTION_TITLE: 'The No-Download Advantage',
  SECTION_SUBTITLE: 'When you remove the barrier of app downloads, something magical happens: people actually use it.',

  // CTA
  CTA_TEXT: 'Start Free on WhatsApp',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Ready to ditch the app downloads?',
  FOOTER_CTA_SUBTITLE: 'Try TextExpense free right now. Open WhatsApp, text us a receipt, and get your first Excel report in under a minute. No download. No account. No complexity.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The App Download Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Let's be honest about expense tracking apps:</p>
      <p style="color: var(--gray); margin-bottom: 15px;">You download them during a motivated moment. You create an account. Set a password. Grant permissions. Configure categories. Link your bank account. Set up notifications. Watch the tutorial video.</p>
      <p style="color: var(--gray); margin-bottom: 15px;"><strong>Two weeks later, you've completely forgotten it exists.</strong></p>
      <p style="color: var(--gray);">The average person has 80 apps on their phone. How many do they actually use? About 9. Expense trackers almost never make the cut – not because people don't need expense tracking, but because <em>needing another app</em> is exhausting.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">The No-Download Advantage</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Zero friction to start</h3>
          <p style="color: var(--gray);">No App Store, no download, no waiting</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Nothing to remember</h3>
          <p style="color: var(--gray);">WhatsApp is already on your phone</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Instant access</h3>
          <p style="color: var(--gray);">Text a receipt right now, get results in 60 seconds</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Works for everyone</h3>
          <p style="color: var(--gray);">3+ billion people already use WhatsApp</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; font-size: 1.1rem; color: var(--gray);">When you remove the barrier of app downloads, something magical happens: people actually use it.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How It Actually Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Open WhatsApp</h3>
          <p style="color: var(--gray);">You know, that app you check 50 times a day anyway.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Text Receipt Photo</h3>
          <p style="color: var(--gray);">We extract all the expense data automatically. Choose the category that fits your needs.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Get Excel Reports</h3>
          <p style="color: var(--gray);">Get professional Excel reports whenever you need them.</p>
        </div>
      </div>

      <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; text-align: center;">
        <p style="font-size: 1.2rem; color: var(--gray);">No account setup. No password to forget. No tutorial to watch. Just pure functionality through an app you already understand.</p>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Perfect For</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">People drowning in physical receipts who never seem to organize them.<br>
      Small business owners who need expense reports but hate complexity.<br>
      Anyone who's downloaded expense apps before and never actually used them.<br>
      Freelancers and consultants tracking expenses for taxes or client billing.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-top: 20px;"><strong>Basically,</strong> if you've ever thought "there should be a simpler way to do this" – you're right. This is it.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Simple Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>First Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>See it work before paying anything</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>Light Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>6 receipts (Light Plan)</p>
        </div>

        <div class="card">
          <h3>Pro Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>25 receipts (Pro Plan)</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Compare that to traditional expense software at $5-18/month that requires app downloads and training.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Why is "no download" such a big deal?</h3>
          <p style="color: var(--gray);">Because friction kills habits. When you need to download, install, and learn a new app, you probably won't stick with it. TextExpense works through WhatsApp which you already have and use daily – so you'll actually keep using it.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I need to give you access to my bank accounts?</h3>
          <p style="color: var(--gray);">No. You just send us receipt photos. We never connect to your bank, never see your account numbers, and never access your financial accounts. We only see what's on the receipts you choose to send.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I access my expense data from multiple devices?</h3>
          <p style="color: var(--gray);">Yes. Since everything works through WhatsApp, you can access it from any device where you have WhatsApp installed – your phone, tablet, or computer.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if I need to organize expenses from last month?</h3>
          <p style="color: var(--gray);">Your Excel reports include all expenses from whatever time period you choose (1 month, 2 months, or 3 months). Each expense has its original receipt image available for download, so you have complete records.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Is there a limit to how many receipts I can store?</h3>
          <p style="color: var(--gray);">Your monthly plan determines how many new receipts you can add each month. All previously saved receipts remain accessible in your reports regardless of your current plan.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/expense-tracker-no-download.html');

console.log('✅ Generated: expense-tracker-no-download.html');
