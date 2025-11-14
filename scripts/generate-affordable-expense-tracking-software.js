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
    <!-- Pricing Problem Section -->
    <section style="padding: 60px 20px; background: linear-gradient(to bottom, #f8f9fa, #ffffff);">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 30px; text-align: center; color: #1a1a1a;">The Pricing Problem</h2>

        <div style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 20px;">
          <p style="margin-bottom: 20px;">You checked expense software prices. Most want $5-15 per user monthly. You have 3 employees. That's $180-540 annually for basic receipt organization.</p>

          <p style="margin-bottom: 20px;">Or they hide pricing behind "contact sales." Translation: expensive enough they won't tell you upfront.</p>

          <p style="margin-bottom: 20px;">Or they bundle tracking with invoicing, time tracking, project management you don't need. Pay for full accounting suite to get simple expense capture.</p>

          <p style="margin-bottom: 20px;">Meanwhile, you just need receipts organized for tax time. Professional system, affordable price. That option barely exists.</p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section style="padding: 60px 20px; background: #ffffff;">
      <div style="max-width: 1000px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 50px; text-align: center; color: #1a1a1a;">How Affordable Tracking Works</h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #10b981;">
            <h3 style="font-size: 1.4em; margin-bottom: 15px; color: #1a1a1a;">Simple Pricing</h3>
            <p style="line-height: 1.7; color: #555;">$2.99 or $4.99 monthly. Not per user - total cost. Three employees? Still $2.99-4.99. No scaling fees, no surprise charges.</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #10b981;">
            <h3 style="font-size: 1.4em; margin-bottom: 15px; color: #1a1a1a;">Text-Based System</h3>
            <p style="line-height: 1.7; color: #555;">Works through WhatsApp everyone already has. No software licenses to buy, no accounts to create, no subscriptions per person.</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #10b981;">
            <h3 style="font-size: 1.4em; margin-bottom: 15px; color: #1a1a1a;">Professional Output</h3>
            <p style="line-height: 1.7; color: #555;">Excel reports with expenses organized by month and category. Original receipts linked. Same quality output as expensive systems.</p>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; border-left: 4px solid #10b981;">
            <h3 style="font-size: 1.4em; margin-bottom: 15px; color: #1a1a1a;">Complete Solution</h3>
            <p style="line-height: 1.7; color: #555;">OCR extraction, automatic categorization, searchable vault, Excel generation. Not limited features at low price - complete system affordably priced.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What Makes It Affordable Section -->
    <section style="padding: 60px 20px; background: linear-gradient(to bottom, #f8f9fa, #ffffff);">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 40px; text-align: center; color: #1a1a1a;">What Makes This Affordable</h2>

        <div style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <div style="margin-bottom: 30px; padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 10px; color: #10b981;">No per-user licensing</h3>
            <p>Traditional software charges per person. TextExpense charges per account. $4.99 for 25 receipts whether one person or five use it.</p>
          </div>

          <div style="margin-bottom: 30px; padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 10px; color: #10b981;">No infrastructure costs</h3>
            <p>Runs on WhatsApp infrastructure you're already using. No servers to maintain, no apps to update, no hosting fees passed to you.</p>
          </div>

          <div style="margin-bottom: 30px; padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 10px; color: #10b981;">No bundled complexity</h3>
            <p>Just expense tracking. No forced invoicing, payroll, inventory, project management. Pay for what you need, not unwanted features.</p>
          </div>

          <div style="margin-bottom: 0; padding: 25px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 10px; color: #10b981;">Minimal overhead</h3>
            <p>Automated processing reduces operational costs. Savings passed to users through lower pricing.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section style="padding: 60px 20px; background: #ffffff;">
      <div style="max-width: 900px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 30px; text-align: center; color: #1a1a1a;">Affordable vs Expensive Features</h2>

        <p style="font-size: 1.2em; line-height: 1.7; color: #555; text-align: center; margin-bottom: 40px;">
          TextExpense provides professional capabilities affordably:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
          <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="font-size: 1.2em; margin-bottom: 10px; color: #1a1a1a;">Receipt OCR</h3>
            <p style="color: #666; line-height: 1.6;">Automatic text extraction from photos</p>
          </div>

          <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="font-size: 1.2em; margin-bottom: 10px; color: #1a1a1a;">Smart categorization</h3>
            <p style="color: #666; line-height: 1.6;">AI-powered expense sorting</p>
          </div>

          <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="font-size: 1.2em; margin-bottom: 10px; color: #1a1a1a;">Excel reports</h3>
            <p style="color: #666; line-height: 1.6;">Professional formatting, monthly organization</p>
          </div>

          <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="font-size: 1.2em; margin-bottom: 10px; color: #1a1a1a;">Receipt backup</h3>
            <p style="color: #666; line-height: 1.6;">Cloud storage with download links</p>
          </div>

          <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="font-size: 1.2em; margin-bottom: 10px; color: #1a1a1a;">Search functionality</h3>
            <p style="color: #666; line-height: 1.6;">Find specific expenses instantly</p>
          </div>

          <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="font-size: 1.2em; margin-bottom: 10px; color: #1a1a1a;">Multi-device access</h3>
            <p style="color: #666; line-height: 1.6;">Phone, computer, tablet compatible</p>
          </div>

          <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="font-size: 1.2em; margin-bottom: 10px; color: #1a1a1a;">Document vault</h3>
            <p style="color: #666; line-height: 1.6;">Secure storage for all receipts</p>
          </div>
        </div>

        <p style="font-size: 1.1em; line-height: 1.7; color: #555; text-align: center; margin-top: 40px;">
          Same core features expensive systems offer. Different delivery model, different price.
        </p>
      </div>
    </section>

    <!-- Target Audience Section -->
    <section style="padding: 60px 20px; background: linear-gradient(to bottom, #f8f9fa, #ffffff);">
      <div style="max-width: 900px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 40px; text-align: center; color: #1a1a1a;">Who Needs Affordable Tracking</h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #10b981;">Small businesses</h3>
            <p style="line-height: 1.7; color: #555;">Limited budgets, need professional expense organization</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #10b981;">Solo entrepreneurs</h3>
            <p style="line-height: 1.7; color: #555;">Can't justify $15-20/month for basic receipt capture</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #10b981;">Startups</h3>
            <p style="line-height: 1.7; color: #555;">Every dollar counts, need affordable infrastructure</p>
          </div>

          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #10b981;">Side businesses</h3>
            <p style="line-height: 1.7; color: #555;">Part-time income doesn't support expensive subscriptions</p>
          </div>
        </div>

        <p style="font-size: 1.1em; line-height: 1.7; color: #555; text-align: center; margin-top: 40px;">
          If you know expense tracking matters but premium pricing feels excessive for your actual needs, affordable solutions exist.
        </p>
      </div>
    </section>

    <!-- Cost Comparison Section -->
    <section style="padding: 60px 20px; background: #ffffff;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 40px; text-align: center; color: #1a1a1a;">Cost Comparison</h2>

        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 16px; margin-bottom: 30px;">
          <h3 style="font-size: 1.5em; margin-bottom: 20px;">Traditional Software:</h3>
          <p style="font-size: 1.1em; line-height: 1.8; margin-bottom: 10px;">$5-15 per user monthly = $60-180 per user yearly</p>
          <p style="font-size: 1.3em; font-weight: 600; margin-top: 15px;">= $180-900 for 3-person team</p>
        </div>

        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; border-radius: 16px;">
          <h3 style="font-size: 1.5em; margin-bottom: 20px;">TextExpense:</h3>
          <p style="font-size: 1.1em; line-height: 1.8; margin-bottom: 10px;">$2.99-4.99 monthly total = $36-60 yearly regardless of users</p>
          <p style="font-size: 1.3em; font-weight: 600; margin-top: 15px;">= $36-60 for entire team</p>
        </div>

        <p style="font-size: 1.3em; font-weight: 600; color: #10b981; text-align: center; margin-top: 40px;">
          Save $144-840 annually while getting professional expense organization.
        </p>
      </div>
    </section>

    <!-- Pricing Section -->
    <section style="padding: 60px 20px; background: linear-gradient(to bottom, #f8f9fa, #ffffff);">
      <div style="max-width: 700px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 2.5em; margin-bottom: 50px; color: #1a1a1a;">Pricing</h2>

        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); margin-bottom: 25px;">
          <h3 style="font-size: 1.4em; margin-bottom: 10px; color: #1a1a1a;">First receipt free</h3>
          <p style="color: #666; font-size: 1.05em;">Try without commitment</p>
        </div>

        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); margin-bottom: 25px;">
          <h3 style="font-size: 1.4em; margin-bottom: 10px; color: #1a1a1a;">$2.99/month</h3>
          <p style="color: #666; font-size: 1.05em;">6 receipts monthly total (not per user)</p>
        </div>

        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          <h3 style="font-size: 1.4em; margin-bottom: 10px; color: #1a1a1a;">$4.99/month</h3>
          <p style="color: #666; font-size: 1.05em;">25 receipts monthly total (not per user)</p>
        </div>

        <p style="font-size: 1.1em; line-height: 1.7; color: #555; margin-top: 40px;">
          Simple, transparent, affordable pricing. No contracts, cancel anytime.
        </p>
      </div>
    </section>

    <!-- FAQ Section -->
    <section style="padding: 60px 20px; background: #ffffff;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5em; margin-bottom: 50px; text-align: center; color: #1a1a1a;">Common Questions</h2>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">Is this really enough for my business?</h3>
          <p style="line-height: 1.7; color: #555;">TextExpense handles receipt capture, OCR processing, categorization, Excel report generation, and secure storage. Every receipt gets backed up in your searchable document vault with original images linked in reports. If you need expense organization, this provides complete functionality affordably.</p>
        </div>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">Why is this cheaper than other software?</h3>
          <p style="line-height: 1.7; color: #555;">No per-user licensing, uses WhatsApp infrastructure, focused on expense tracking instead of bundled features. Different business model enables affordable pricing.</p>
        </div>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">Can multiple people use one account?</h3>
          <p style="line-height: 1.7; color: #555;">Yes. Team members can text receipts to the same WhatsApp number. Category confirmation can happen collaboratively. Pricing doesn't scale per user.</p>
        </div>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">Can I track both business and personal receipts?</h3>
          <p style="line-height: 1.7; color: #555;">Absolutely! Text all receipts - work and personal. Tag them during confirmation. Business expenses get organized for taxes, personal receipts stay accessible in your document vault for whatever you need.</p>
        </div>

        <div style="margin-bottom: 35px;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">What if I need more than 25 receipts monthly?</h3>
          <p style="line-height: 1.7; color: #555;">Most small businesses process under 25 expenses monthly. If you need more volume, you're likely big enough to afford enterprise solutions anyway.</p>
        </div>

        <div style="margin-bottom: 0;">
          <h3 style="font-size: 1.3em; margin-bottom: 15px; color: #1a1a1a;">Are there hidden fees or upgrade requirements?</h3>
          <p style="line-height: 1.7; color: #555;">No. $2.99 or $4.99 monthly is total cost. No per-user fees, no surprise charges, no forced upgrades.</p>
        </div>
      </div>
    </section>
  `
};

const generator = new ContentGenerator();
generator.generate('landing', data, 'frontend/pages/affordable-expense-tracking-software.html');

console.log('✅ Affordable expense tracking software page generated successfully!');
console.log('📄 File: frontend/pages/affordable-expense-tracking-software.html');
console.log('🔗 URL: /pages/affordable-expense-tracking-software');
