const ContentGenerator = require('./generate-content');

const data = {
  TITLE: 'Affordable Expense Tracking Software | $2.99/Month Via WhatsApp',
  META_DESCRIPTION: 'Affordable expense tracking at $2.99/month. Text receipts via WhatsApp, get Excel reports. No per-user fees. Try free.',
  KEYWORDS: 'affordable expense tracking software, cheap expense tracking, low cost expense tracker, inexpensive expense tracker, budget expense software',
  OG_TITLE: 'Affordable Expense Tracking Software | $2.99/Month',
  OG_DESCRIPTION: 'Professional expense tracking without professional pricing. Text receipts via WhatsApp, get Excel reports. $2.99-4.99/month total cost.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',
  OG_URL: 'https://textexpense.com/pages/affordable-expense-tracking-software',
  TWITTER_CARD: 'summary_large_image',
  TWITTER_TITLE: 'Affordable Expense Tracking Software | $2.99/Month',
  TWITTER_DESCRIPTION: 'Professional tracking without professional pricing. Text receipts via WhatsApp. $2.99-4.99/month total.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',
  CANONICAL_URL: 'https://textexpense.com/pages/affordable-expense-tracking-software',
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Affordable Expense Tracking Software',
  SCHEMA_DESCRIPTION: 'Affordable expense tracking at $2.99-4.99/month. Text receipts via WhatsApp, get Excel reports. No per-user fees, no enterprise pricing.',
  HERO_TITLE: 'Affordable Expense Tracking Software',
  HERO_SUBTITLE: 'Professional tracking without professional pricing',
  HERO_TEXT: 'Text receipt photos via WhatsApp, get organized Excel reports. $2.99-4.99/month total cost. No per-user fees, no enterprise pricing, no hidden charges. Just simple, affordable tracking.',
  CTA_TEXT: 'Track first receipt free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',
  SECTION_TITLE: 'Affordable Expense Tracking',
  SECTION_SUBTITLE: 'Professional features at budget-friendly prices',
  FOOTER_CTA_TITLE: 'Start Tracking',
  FOOTER_CTA_SUBTITLE: 'Try affordable expense tracking. Text one receipt via WhatsApp, see the system. Free, no credit card needed.',
  GA_MEASUREMENT_ID: 'G-5F3EMPRHFP',
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid var(--danger); padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Pricing Problem</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        You checked expense software prices. Most want $5-15 per user monthly. You have 3 employees. That's $180-540 annually for basic receipt organization.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        Or they hide pricing behind "contact sales." Translation: expensive enough they won't tell you upfront.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        Or they bundle tracking with invoicing, time tracking, project management you don't need. Pay for full accounting suite to get simple expense capture.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray);">
        Meanwhile, you just need receipts organized for tax time. Professional system, affordable price. That option barely exists.
      </p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Affordable Tracking Works</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Simple Pricing</h3>
          <p style="color: var(--gray);">
            $2.99 or $4.99 monthly. Not per user - total cost. Three employees? Still $2.99-4.99. No scaling fees, no surprise charges.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Text-Based System</h3>
          <p style="color: var(--gray);">
            Works through WhatsApp everyone already has. No software licenses to buy, no accounts to create, no subscriptions per person.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Professional Output</h3>
          <p style="color: var(--gray);">
            Excel reports with expenses organized by month and category. Original receipts linked. Same quality output as expensive systems.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Complete Solution</h3>
          <p style="color: var(--gray);">
            OCR extraction, automatic categorization, searchable vault, Excel generation. Not limited features at low price - complete system affordably priced.
          </p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">What Makes This Affordable</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">No per-user licensing</h3>
          <p style="color: var(--gray);">
            Traditional software charges per person. TextExpense charges per account. $4.99 for 25 receipts whether one person or five use it.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">No infrastructure costs</h3>
          <p style="color: var(--gray);">
            Runs on WhatsApp infrastructure you're already using. No servers to maintain, no apps to update, no hosting fees passed to you.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">No bundled complexity</h3>
          <p style="color: var(--gray);">
            Just expense tracking. No forced invoicing, payroll, inventory, project management. Pay for what you need, not unwanted features.
          </p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Minimal overhead</h3>
          <p style="color: var(--gray);">
            Automated processing reduces operational costs. Savings passed to users through lower pricing.
          </p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Affordable vs Expensive Features</h2>
      <p style="font-size: 1.1rem; color: var(--gray); text-align: center; margin-bottom: 40px;">
        TextExpense provides professional capabilities affordably:
      </p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; max-width: 1000px; margin: 0 auto;">
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Receipt OCR</h3>
          <p style="color: var(--gray);">Automatic text extraction from photos</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Smart categorization</h3>
          <p style="color: var(--gray);">AI-powered expense sorting</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Excel reports</h3>
          <p style="color: var(--gray);">Professional formatting, monthly organization</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Receipt backup</h3>
          <p style="color: var(--gray);">Cloud storage with download links</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Search functionality</h3>
          <p style="color: var(--gray);">Find specific expenses instantly</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Multi-device access</h3>
          <p style="color: var(--gray);">Phone, computer, tablet compatible</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Document vault</h3>
          <p style="color: var(--gray);">Secure storage for all receipts</p>
        </div>
      </div>
      <p style="font-size: 1.1rem; color: var(--gray); text-align: center; margin-top: 40px;">
        Same core features expensive systems offer. Different delivery model, different price.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Who Needs Affordable Tracking</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; max-width: 900px; margin: 0 auto;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Small businesses</h3>
          <p style="color: var(--gray);">Limited budgets, need professional expense organization</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Solo entrepreneurs</h3>
          <p style="color: var(--gray);">Can't justify $15-20/month for basic receipt capture</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Startups</h3>
          <p style="color: var(--gray);">Every dollar counts, need affordable infrastructure</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Side businesses</h3>
          <p style="color: var(--gray);">Part-time income doesn't support expensive subscriptions</p>
        </div>
      </div>
      <p style="font-size: 1.1rem; color: var(--gray); text-align: center; margin-top: 30px;">
        If you know expense tracking matters but premium pricing feels excessive for your actual needs, affordable solutions exist.
      </p>
    </div>

    <div style="background: white; padding: 60px 30px; border-radius: 20px; box-shadow: var(--shadow); margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Cost Comparison</h2>
      <div style="max-width: 700px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); color: white; padding: 30px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Traditional Software:</h3>
          <p style="font-size: 1.1rem; margin-bottom: 10px;">$5-15 per user monthly = $60-180 per user yearly</p>
          <p style="font-size: 1.2rem; font-weight: 600;">= $180-900 for 3-person team</p>
        </div>
        <div style="background: linear-gradient(135deg, var(--success) 0%, #059669 100%); color: white; padding: 30px; border-radius: 15px;">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">TextExpense:</h3>
          <p style="font-size: 1.1rem; margin-bottom: 10px;">$2.99-4.99 monthly total = $36-60 yearly regardless of users</p>
          <p style="font-size: 1.2rem; font-weight: 600;">= $36-60 for entire team</p>
        </div>
        <p style="font-size: 1.2rem; font-weight: 600; color: var(--success); text-align: center; margin-top: 30px;">
          Save $144-840 annually while getting professional expense organization.
        </p>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; max-width: 900px; margin: 0 auto;">
        <div class="card">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">First receipt free</h3>
          <p style="color: var(--gray);">Try without commitment</p>
        </div>
        <div class="card">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">$2.99/month</h3>
          <p style="color: var(--gray);">6 receipts monthly total (not per user)</p>
        </div>
        <div class="card">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">$4.99/month</h3>
          <p style="color: var(--gray);">25 receipts monthly total (not per user)</p>
        </div>
      </div>
      <p style="font-size: 1.1rem; color: var(--gray); text-align: center; font-style: italic; margin-top: 30px;">
        Simple, transparent, affordable pricing. No contracts, cancel anytime.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Common Questions</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Is this really enough for my business?</h3>
          <p style="color: var(--gray);">
            TextExpense handles receipt capture, OCR processing, categorization, Excel report generation, and secure storage. Every receipt gets backed up in your searchable document vault with original images linked in reports. If you need expense organization, this provides complete functionality affordably.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Why is this cheaper than other software?</h3>
          <p style="color: var(--gray);">
            No per-user licensing, uses WhatsApp infrastructure, focused on expense tracking instead of bundled features. Different business model enables affordable pricing.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Can multiple people use one account?</h3>
          <p style="color: var(--gray);">
            Yes. Team members can text receipts to the same WhatsApp number. Category confirmation can happen collaboratively. Pricing doesn't scale per user.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Can I track both business and personal receipts?</h3>
          <p style="color: var(--gray);">
            Absolutely! Text all receipts - work and personal. Tag them during confirmation. Business expenses get organized for taxes, personal receipts stay accessible in your document vault for whatever you need.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">What if I need more than 25 receipts monthly?</h3>
          <p style="color: var(--gray);">
            Most small businesses process under 25 expenses monthly. If you need more volume, you're likely big enough to afford enterprise solutions anyway.
          </p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Are there hidden fees or upgrade requirements?</h3>
          <p style="color: var(--gray);">
            No. $2.99 or $4.99 monthly is total cost. No per-user fees, no surprise charges, no forced upgrades.
          </p>
        </div>
      </div>
    </div>
  `
};

const generator = new ContentGenerator();
generator.generate('landing', data, 'frontend/pages/affordable-expense-tracking-software.html');

console.log('✅ Affordable expense tracking software page generated successfully!');
console.log('📄 File: frontend/pages/affordable-expense-tracking-software.html');
console.log('🔗 URL: /pages/affordable-expense-tracking-software');
