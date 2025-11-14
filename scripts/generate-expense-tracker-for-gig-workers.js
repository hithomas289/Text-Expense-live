const ContentGenerator = require('./generate-content');

const generator = new ContentGenerator();

const data = {
  TITLE: 'Expense Tracker for Gig Workers | Track Uber, DoorDash Expenses',
  META_DESCRIPTION: 'Track gig worker expenses via WhatsApp. Uber, DoorDash, Lyft costs organized automatically. Text receipts, reduce taxes. Try free.',
  KEYWORDS: 'expense tracker for gig workers, gig worker expense tracking, track gig economy expenses',
  OG_TITLE: 'Expense Tracker for Gig Workers | Track Uber, DoorDash Expenses',
  OG_DESCRIPTION: 'Track gig worker expenses via WhatsApp. Uber, DoorDash, Lyft costs organized automatically. Text receipts, reduce taxes. Try free.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',
  OG_URL: 'https://textexpense.com/pages/expense-tracker-for-gig-workers.html',
  TWITTER_TITLE: 'Expense Tracker for Gig Workers | Track Uber, DoorDash Expenses',
  TWITTER_DESCRIPTION: 'Track gig worker expenses via WhatsApp. Uber, DoorDash, Lyft costs organized automatically. Text receipts, reduce taxes. Try free.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',
  CANONICAL_URL: 'https://textexpense.com/pages/expense-tracker-for-gig-workers.html',
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Expense Tracker for Gig Workers',
  SCHEMA_DESCRIPTION: 'Track gig worker expenses via WhatsApp. Uber, DoorDash, Lyft, Instacart costs organized automatically across all platforms.',
  HERO_TITLE: 'Expense Tracker for Gig Workers',
  HERO_SUBTITLE: 'Track expenses across all your platforms. Text receipt photos via WhatsApp, expenses get organized automatically. Driving for Uber, delivering for DoorDash, working TaskRabbit - all costs documented. Every platform, one tracking system.',
  CTA_TEXT: 'Track first expense free',
  CTA_URL: 'https://wa.me/14155238886?text=Hi',
  SECTION_TITLE: 'Gig Worker Tracking',
  SECTION_SUBTITLE: 'One system for all your platforms',
  FOOTER_CTA_TITLE: 'Start Tracking',
  FOOTER_CTA_SUBTITLE: 'Try it with one gig expense. Text a receipt photo via WhatsApp, see how organization works. Completely free, no credit card.',
  GA_MEASUREMENT_ID: 'G-X7MTLE4KSY',
  MAIN_CONTENT: `
    <section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 2em; margin-bottom: 20px; color: #1a1a1a;">The Gig Worker Problem</h2>
      <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
        You're working three platforms. Uber some mornings, DoorDash at lunch, Instacart on weekends. Income comes from everywhere. So do expenses.
      </p>
      <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
        Car maintenance. Gas. Phone bill. Snacks and water for passengers. Insulated bags for deliveries. Parking. Tolls. Car washes. Oil changes.
      </p>
      <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
        Each expense reduces your tax bill. But tracking across multiple gigs? That feels impossible when you're just trying to maximize hours worked.
      </p>
      <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
        Tax season arrives. You remember some expenses. Most are scattered across bank statements, faded receipts, and vague memories. You pay taxes on more income than you actually kept.
      </p>
    </section>

    <section style="padding: 60px 20px; background: #f8f9fa;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2em; margin-bottom: 40px; color: #1a1a1a; text-align: center;">How Gig Tracking Works</h2>

        <div style="margin-bottom: 40px;">
          <h3 style="font-size: 1.5em; color: #2c3e50; margin-bottom: 15px;">Text Everything</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Buy gas, text the receipt. Pay for oil change, text receipt. Parking fee, text screenshot. Every expense documented immediately.
          </p>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="font-size: 1.5em; color: #2c3e50; margin-bottom: 15px;">Automatic Organization</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            OCR reads receipts and extracts details. You confirm the category - vehicle maintenance, supplies, phone, meals, equipment.
          </p>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="font-size: 1.5em; color: #2c3e50; margin-bottom: 15px;">Cross-Platform Totals</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            All expenses aggregate regardless of which platform generated the income. See total business costs, not per-platform guessing.
          </p>
        </div>

        <div>
          <h3 style="font-size: 1.5em; color: #2c3e50; margin-bottom: 15px;">Tax-Ready Reports</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Generate Excel files showing expenses by category. Mileage, vehicle costs, supplies, phone - everything organized for Schedule C.
          </p>
        </div>
      </div>
    </section>

    <section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 2em; margin-bottom: 30px; color: #1a1a1a; text-align: center;">Gig Worker Expenses Tracked</h2>

      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Vehicle maintenance</strong> - Oil changes, repairs, tire rotations, car washes
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Gas and fuel</strong> - Every fill-up documented for actual expense method
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Car insurance</strong> - Business portion of premiums (can be significant)
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Phone and data</strong> - Business percentage of monthly bills
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Delivery supplies</strong> - Insulated bags, phone mounts, chargers
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Snacks and water</strong> - For passengers or personal consumption during shifts
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Parking and tolls</strong> - Business-related parking fees and toll charges
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Equipment</strong> - Dash cams, phone upgrades, iPad for navigation
        </p>
      </div>
      <div style="margin-bottom: 15px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Safety items</strong> - Masks, sanitizer, cleaning supplies for vehicle
        </p>
      </div>
      <div style="margin-bottom: 30px;">
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          <strong>Food during shifts</strong> - Meals while working long days
        </p>
      </div>

      <p style="font-size: 1.1em; line-height: 1.8; color: #333; font-style: italic; text-align: center;">
        Most gig workers have $3,000-8,000 in annual expenses. That's $900-3,200 in tax savings at 30-40% combined rate.
      </p>
    </section>

    <section style="padding: 60px 20px; background: #f8f9fa;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2em; margin-bottom: 30px; color: #1a1a1a;">Why Gig Workers Don't Track</h2>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Working across platforms</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            You're not organizing one business - you're tracking costs across Uber, DoorDash, Instacart, TaskRabbit. Feels overwhelming.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Variable schedules</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Some days you work 12 hours, some days zero. Tracking adds admin work when you're already exhausted.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Small frequent charges</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            $15 gas fill-up. $4 toll. $8 car wash. Small amounts feel not worth tracking. But 200 gas fill-ups is $3,000.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">No clear system</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Employee jobs track everything automatically. Gig work? You're responsible for documentation. Most workers don't have systems.
          </p>
        </div>

        <p style="font-size: 1.1em; line-height: 1.8; color: #333; font-style: italic;">
          Without tracking, gig workers typically miss $2,000-5,000 in legitimate deductions annually.
        </p>
      </div>
    </section>

    <section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 2em; margin-bottom: 30px; color: #1a1a1a; text-align: center;">What Makes This Work</h2>

      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Captures everything</h3>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          Doesn't matter which platform generated the expense. All costs tracked together for complete tax picture.
        </p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">10-second per expense</h3>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          Text photo, confirm category, done. Faster than stuffing receipts in your car.
        </p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Works from anywhere</h3>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          Gas station, text receipt. Mechanic shop, text invoice. Parking lot, text screenshot. No desk required.
        </p>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Document vault</h3>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          Every receipt backed up in searchable vault. Need that car repair receipt for warranty claim? It's there.
        </p>
      </div>

      <div>
        <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Personal expenses too</h3>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
          Text all receipts - business and personal. Tag them during confirmation. Business goes to tax reports, personal stays in your vault for warranty claims or returns.
        </p>
      </div>
    </section>

    <section style="padding: 60px 20px; background: #f8f9fa;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2em; margin-bottom: 20px; color: #1a1a1a; text-align: center;">Who This Helps</h2>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
          <strong>Rideshare drivers</strong> - Uber, Lyft drivers with vehicle expenses
        </p>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
          <strong>Delivery workers</strong> - DoorDash, Instacart, Grubhub contractors
        </p>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 15px;">
          <strong>Multi-platform gig workers</strong> - Working several platforms simultaneously
        </p>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333; margin-bottom: 30px;">
          <strong>Part-time gig workers</strong> - Side income from gig economy platforms
        </p>
        <p style="font-size: 1.1em; line-height: 1.8; color: #333; font-style: italic; text-align: center;">
          If you're earning 1099 income from gig platforms, proper tracking isn't optional. It's how you keep money you earned.
        </p>
      </div>
    </section>

    <section style="padding: 60px 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 2em; margin-bottom: 30px; color: #1a1a1a; text-align: center;">Pricing</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
        <div style="padding: 20px; background: #fff; border: 2px solid #e0e0e0; border-radius: 8px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">First expense free</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Process one to see the system
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
        Invest $60-120 yearly, save $1,000-3,000 in taxes through better documentation.
      </p>
    </section>

    <section style="padding: 60px 20px; background: #f8f9fa;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2em; margin-bottom: 30px; color: #1a1a1a; text-align: center;">Common Questions</h2>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Can I track expenses from multiple gig platforms?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Yes! TextExpense organizes all your business costs regardless of income source. Uber, DoorDash, Instacart, TaskRabbit - all expenses get tracked together for complete tax documentation.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">What about mileage tracking?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            For business mileage, you can manually enter miles driven. Many gig workers use the standard mileage rate (70 cents per mile in 2025) which simplifies deductions versus tracking actual vehicle expenses.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Can I track both business and personal receipts?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Absolutely! Text all receipts - business and personal. Just tag them during confirmation. Business expenses get organized for taxes, personal receipts stay accessible in your document vault for warranty claims or returns.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">How do I prove expenses in an audit?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Every receipt gets backed up with original images linked in your Excel reports. IRS questions something? You have digital proof accessible anytime.
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">What if I forget to track expenses?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            Text them when you remember. Even receipts from earlier in the tax year can be processed and added. Better documented late than never.
          </p>
        </div>

        <div>
          <h3 style="font-size: 1.3em; color: #2c3e50; margin-bottom: 10px;">Does this replace mileage tracking apps?</h3>
          <p style="font-size: 1.1em; line-height: 1.8; color: #333;">
            No - this handles receipt organization. For automatic mileage tracking, you'll still want dedicated mileage apps. But this captures all other business expenses across platforms.
          </p>
        </div>
      </div>
    </section>

    <section style="padding: 80px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h2 style="font-size: 2.2em; margin-bottom: 20px; color: white;">Start Tracking</h2>
        <p style="font-size: 1.2em; line-height: 1.8; margin-bottom: 30px; color: white;">
          Try it with one gig expense. Text a receipt photo via WhatsApp, see how organization works. Completely free, no credit card.
        </p>
        <a href="https://wa.me/14155238886?text=Hi"
           style="display: inline-block; background: white; color: #667eea; padding: 18px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 1.1em; transition: transform 0.3s ease;">
          Track Expense Free →
        </a>
        <p style="font-size: 1em; margin-top: 30px; color: rgba(255,255,255,0.9);">
          Simple tracking for gig workers juggling multiple platforms.
        </p>
      </div>
    </section>
  `
};

generator.generate('landing', data, 'frontend/pages/expense-tracker-for-gig-workers.html');

console.log('✅ Gig worker expense tracker page generated successfully!');
console.log('📄 File: frontend/pages/expense-tracker-for-gig-workers.html');
console.log('🔗 URL: /pages/expense-tracker-for-gig-workers.html');
