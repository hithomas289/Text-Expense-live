const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Best Expense Tracker for Freelancers | WhatsApp-Based Solution',
  META_DESCRIPTION: 'Simple expense tracking via WhatsApp. No app downloads, no abandoned subscriptions. Text receipts, get reports. Try free.',
  KEYWORDS: 'best expense tracker for freelancers, expense tracker freelancers, top expense tracker freelancers, simple expense tracking, freelance expense app',

  // Open Graph Tags
  OG_TITLE: 'Best Expense Tracker for Freelancers | WhatsApp-Based Solution',
  OG_DESCRIPTION: 'Simple expense tracking via WhatsApp. No app downloads, no abandoned subscriptions. Text receipts, get reports.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Best Expense Tracker for Freelancers | TextExpense',
  TWITTER_DESCRIPTION: 'The expense tracker freelancers actually use. Works through WhatsApp. No app downloads.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/best-expense-tracker-for-freelancers',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Best Expense Tracker for Freelancers',
  SCHEMA_DESCRIPTION: 'Simple expense tracking via WhatsApp. No app downloads, no abandoned subscriptions. The expense tracker you\'ll actually use consistently.',

  // Hero Section
  HERO_TITLE: 'Best Expense Tracker for Freelancers',
  HERO_SUBTITLE: 'The one you\'ll actually use. Text receipt photos via WhatsApp, get organized Excel reports. No app to download and forget about. No accounting software to learn. Just tracking that actually happens.',

  // Content Header
  SECTION_TITLE: 'How This Works',
  SECTION_SUBTITLE: 'WhatsApp integration. Automatic processing. Excel output. Minimal effort.',

  // CTA
  CTA_TEXT: 'Try First Receipt Free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Try It',
  FOOTER_CTA_SUBTITLE: 'Process one receipt. Free, no credit card, no commitment. See if the workflow makes sense for how you actually work.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">Why Most Tracking Fails</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">You've probably tried tracking expenses before. Maybe you're trying right now.</p>
      <p style="color: var(--gray); margin-bottom: 10px;">Downloaded an app full of features you don't need? Still on your phone, unopened since week two.</p>
      <p style="color: var(--gray); margin-bottom: 10px;">Started entering receipts manually? Gave up when client work got busy.</p>
      <p style="color: var(--gray); margin-bottom: 15px;">Promised yourself you'd organize everything quarterly? Currently scrambling because tax season is here.</p>
      <p style="color: var(--gray);"><strong>The pattern is always the same:</strong> good intentions, initial effort, eventual abandonment. Not because you're lazy or disorganized, but because the friction is too high for the value you see immediately.</p>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">What Actually Matters</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>You need to use it daily</strong> – If the system requires opening an app you don't use for anything else, you won't. It needs to live where you already are.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>It needs to be effortless</strong> – More than 30 seconds per receipt and you'll stop doing it. The easier it is, the more likely it gets done.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Results have to be useful</strong> – If the output is formatted for someone else's workflow, you won't see the point. It needs to match how you actually work.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>It can't cost more than it saves</strong> – $15-20/month subscriptions for basic receipt tracking? You'll cancel after tax season when the panic fades.</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">The best system is the one you actually use consistently. Everything else is theory.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How This Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">WhatsApp Integration</h3>
          <p style="color: var(--gray);">You already use WhatsApp daily. Text receipt photos the same way you'd message anyone. No separate app to remember, no context switching.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Automatic Processing</h3>
          <p style="color: var(--gray);">OCR reads merchant names, dates, amounts in about 30 seconds. You confirm the category, we organize everything else.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Excel Output</h3>
          <p style="color: var(--gray);">Generate reports anytime. Standard format that works with whatever system you're using - import it, send it to your accountant, or just keep it.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Minimal Effort</h3>
          <p style="color: var(--gray);">Text photo, pick category, done. That's the entire workflow. Everything else happens automatically.</p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Why This Actually Gets Used</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">No app means nothing to download and abandon. Working through WhatsApp means you're already there when receipts happen.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Processing takes 30 seconds, not minutes. You can do it while walking out of the restaurant or waiting for your coffee.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Categories are simple: business meal, travel, equipment, software, supplies. Not accounting terminology that requires googling.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Reports are on-demand. Generate them when you need them, not when the software thinks you should.</p>
      <p style="color: var(--gray); font-style: italic;">You're not learning new systems or maintaining complicated setups. You're just texting photos and getting organized files back.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">What Makes This Different</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Zero installation</strong> – Works through WhatsApp you already have</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Instant value</strong> – First receipt gets processed and organized immediately, not after you complete setup</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Simple interface</strong> – Text photos, get reports. That's the entire feature set.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Low cost</strong> – $2.99-4.99/month instead of premium accounting software prices</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>No abandonment</strong> – Hard to abandon something you don't have to remember to open</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">The goal isn't to be the most feature-rich system. It's to be the one you actually use when you're busy.</p>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">Who This Helps</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Freelancers who tried apps and stopped</strong> – You know tracking matters but past systems didn't stick</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>People drowning in receipts</strong> – You have them, they're just not organized anywhere useful</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Anyone overpaying taxes</strong> – Missing deductions because you can't prove expenses</p>
      <p style="font-size: 1.1rem; color: var(--gray);"><strong>Self-employed professionals</strong> – Need organized records without learning accounting software</p>
      <p style="color: var(--gray); margin-top: 20px; font-style: italic;">If you've ever thought "I should really track this" while stuffing a receipt in your wallet, this is for you.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>First Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Process one to see how it works</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">LIGHT USE</div>
          <h3>Light</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>6 receipts monthly</p>
        </div>

        <div class="card">
          <h3>Pro</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>25 receipts monthly</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Simple pricing for simple tracking.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Common Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Why is this better than other systems?</h3>
          <p style="color: var(--gray);">It's not "better" in features - it has fewer. It's better in usage. You'll actually do it because it's so low-friction. The best system is the one that gets used.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I use this with my existing accounting setup?</h3>
          <p style="color: var(--gray);">Yes. This generates standard Excel files. Import them wherever you're doing your actual accounting. It's not trying to replace your whole system.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if I need more features?</h3>
          <p style="color: var(--gray);">Then you probably need actual accounting software with invoicing, time tracking, project management. This solves one specific problem: making sure receipts don't get lost.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Do I have to use WhatsApp?</h3>
          <p style="color: var(--gray);">Yes. That's the whole point - it works where you already are. If you don't use WhatsApp, this isn't for you.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How is this different from just taking photos?</h3>
          <p style="color: var(--gray);">Photos in your camera roll aren't organized, categorized, or formatted for taxes. They're just photos. This extracts data and organizes it properly.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Will I actually use this?</h3>
          <p style="color: var(--gray);">Better question than feature comparisons. Try it for a month. If you're still texting receipts after 30 days, it works for you. If not, it doesn't.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/best-expense-tracker-for-freelancers.html');

console.log('✅ Generated: best-expense-tracker-for-freelancers.html');
