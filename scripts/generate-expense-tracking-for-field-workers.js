const ContentGenerator = require('./generate-content');

const generator = new ContentGenerator();

const data = {
  TITLE: 'Expense Tracking for Field Workers | Track Costs From Job Sites',
  META_DESCRIPTION: 'Track field worker expenses via WhatsApp. On-site, in vehicles, between locations - document costs anywhere. Text receipts. Try free.',
  KEYWORDS: 'expense tracking for field workers, field worker expense tracking, track field work expenses',
  OG_TITLE: 'Expense Tracking for Field Workers | Track Costs From Job Sites',
  OG_DESCRIPTION: 'Track field worker expenses via WhatsApp. On-site, in vehicles, between locations - document costs anywhere. Text receipts. Try free.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',
  OG_URL: 'https://textexpense.com/pages/expense-tracking-for-field-workers.html',
  TWITTER_TITLE: 'Expense Tracking for Field Workers | Track Costs From Job Sites',
  TWITTER_DESCRIPTION: 'Track field worker expenses via WhatsApp. On-site, in vehicles, between locations - document costs anywhere. Text receipts. Try free.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',
  CANONICAL_URL: 'https://textexpense.com/pages/expense-tracking-for-field-workers.html',
  SCHEMA_TYPE: 'SoftwareApplication',
  SCHEMA_NAME: 'Expense Tracking for Field Workers',
  SCHEMA_DESCRIPTION: 'Track field worker expenses via WhatsApp. On-site, in vehicles, between locations - document costs anywhere without needing office access.',
  HERO_TITLE: 'Expense Tracking for Field Workers',
  HERO_SUBTITLE: 'Track expenses from anywhere you\'re working. Text receipt photos via WhatsApp, expenses get organized automatically. Construction sites, client locations, service calls, between jobs - document costs wherever work happens. No office required.',
  CTA_TEXT: 'Track first expense free',
  CTA_URL: 'https://wa.me/17654792054?text=hi',
  SECTION_TITLE: 'Field Worker Tracking',
  SECTION_SUBTITLE: 'Built for workers who never see an office',
  FOOTER_CTA_TITLE: 'Start Tracking',
  FOOTER_CTA_SUBTITLE: 'Try it with one field expense. Text a receipt photo from your truck, job site, or wherever you are. Free, no credit card.',
  GA_MEASUREMENT_ID: 'G-X7MTLE4KSY',
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid var(--danger); padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Field Worker Reality</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        You're not in an office. You're on job sites, in your truck, at client locations, between service calls.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        Equipment breaks, you buy parts. Stop for gas between jobs. Grab supplies at hardware store. Pay for parking near job site. Client meeting over lunch. Tolls on the highway.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        Every expense is legitimate business cost. But tracking from the field? That's the problem.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
        You can't file receipts at a desk you don't have. You can't log into expense software on computers you don't use. Receipts stay in your truck, pockets, or toolbox until they're lost or illegible.
      </p>
      <p style="font-size: 1.1rem; color: var(--gray);">
        Tax season arrives. You remember spending thousands on tools, supplies, fuel, meals. But without documentation, you can't prove any of it. You overpay taxes because you couldn't track from the field.
      </p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Field Tracking Works</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Text From Anywhere</h3>
          <p style="color: var(--gray);">
            Buy supplies at hardware store, text receipt from parking lot. Fill gas tank, text from pump. Grab lunch between jobs, text from truck. Works wherever you have phone signal.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Instant Processing</h3>
          <p style="color: var(--gray);">
            OCR reads merchant, date, amount in 30 seconds. You confirm category - tools, supplies, fuel, meals, equipment, vehicle maintenance.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">No Office Needed</h3>
          <p style="color: var(--gray);">
            Everything happens through WhatsApp. No logging into systems, no desktop required, no going to office to file receipts.
          </p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Organized Automatically</h3>
          <p style="color: var(--gray);">
            All expenses sorted by category. Generate Excel reports anytime showing tools, fuel, meals, supplies - everything categorized for taxes.
          </p>
        </div>
      </div>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Field Work Expenses Tracked</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Tools and equipment</strong> - Power tools, hand tools, safety gear purchased for jobs
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Supplies and materials</strong> - Hardware, lumber, parts, materials for projects
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Vehicle costs</strong> - Gas, oil changes, repairs, maintenance for work vehicles
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Mileage</strong> - Business driving between job sites, client locations, supply stores
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Parking and tolls</strong> - Job site parking, highway tolls during work travel
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Meals</strong> - Lunches during long job days, client meals (typically 50% deductible)
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Safety equipment</strong> - Boots, gloves, hard hats, safety glasses, protective gear
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Phone and communication</strong> - Business portion of mobile phone bills
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>License and permits</strong> - Professional licenses, certifications, permits for work
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 30px;">
          <strong>Uniforms and work clothes</strong> - Required clothing and uniforms for job sites
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center;">
          Average field worker has $5,000-12,000 in annual expenses. That's $1,500-4,800 in tax savings with proper documentation.
        </p>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Why Field Workers Don't Track</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px;">
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Always moving</h3>
          <p style="color: var(--gray);">
            You're driving between locations, working on sites, meeting clients. No desk time for admin work.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">No office access</h3>
          <p style="color: var(--gray);">
            Can't log into desktop software between jobs. Can't file physical receipts when you're in the field.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Tools aren't field-friendly</h3>
          <p style="color: var(--gray);">
            Most expense systems assume office access. Field workers need mobile-first solutions that work from job sites.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Time pressure</h3>
          <p style="color: var(--gray);">
            Between finishing one job and starting the next, stopping to track expenses feels impossible.
          </p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: var(--shadow); border-left: 4px solid var(--warning);">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Dirty hands</h3>
          <p style="color: var(--gray);">
            Literally. After working on site, pulling out phone to take receipt photos isn't natural.
          </p>
        </div>
      </div>
      <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center; margin-top: 30px;">
        Without field-friendly tracking, workers typically miss $3,000-7,000 in legitimate deductions annually.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">What Makes This Work For Field Workers</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Mobile-native</h3>
          <p style="color: var(--gray);">
            Built for phones, not desktops. Works in truck cabs, job site trailers, parking lots, wherever you are.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">WhatsApp-based</h3>
          <p style="color: var(--gray);">
            Already on your phone, already know how to use it. No new apps to learn, no passwords to remember.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Works offline temporarily</h3>
          <p style="color: var(--gray);">
            Limited signal on job site? Text receipts when signal returns. System processes them automatically.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Fast processing</h3>
          <p style="color: var(--gray);">
            10 seconds per expense. Text photo, confirm category, done. Fast enough to do between jobs.
          </p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Document vault</h3>
          <p style="color: var(--gray);">
            Every receipt backed up automatically. Need that tool receipt for warranty? It's in your vault, searchable anytime.
          </p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Personal and business</h3>
          <p style="color: var(--gray);">
            Text all receipts - work and personal. Tag during confirmation. Business goes to tax reports, personal stays accessible for warranty claims or returns.
          </p>
        </div>
      </div>
    </div>

    <div style="background: white; padding: 60px 30px; border-radius: 20px; box-shadow: var(--shadow); margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px; text-align: center;">Who This Helps</h2>
      <div style="max-width: 700px; margin: 0 auto;">
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Construction workers</strong> - Track tools, materials, equipment costs from job sites
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Service technicians</strong> - Document parts, supplies, vehicle costs between service calls
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">
          <strong>Home repair professionals</strong> - Organize material purchases, tool costs for tax filing
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 30px;">
          <strong>Field sales reps</strong> - Track mileage, client meals, travel expenses from the road
        </p>
        <p style="font-size: 1.1rem; color: var(--gray); font-style: italic; text-align: center;">
          If you're working from trucks, job sites, or client locations instead of offices, desktop expense systems don't work for your reality.
        </p>
      </div>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; max-width: 900px; margin: 0 auto;">
        <div class="card">
          <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">First expense free</h3>
          <p style="color: var(--gray);">
            Process one from the field
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
        Invest $60-120 yearly, save $2,000-5,000 in taxes through field documentation.
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Common Questions</h2>
      <div style="max-width: 800px; margin: 0 auto;">
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Can I track expenses without internet access?</h3>
          <p style="color: var(--gray);">
            You need signal to send WhatsApp messages, but if you're temporarily offline, just text receipts when you get signal back. Everything gets processed automatically.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">What if my hands are dirty from work?</h3>
          <p style="color: var(--gray);">
            Take receipt photos at the end of the day or during breaks. Even same-day documentation is better than losing receipts. Or have someone else (partner, assistant) text them for you.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Can I track both work and personal receipts?</h3>
          <p style="color: var(--gray);">
            Yes! Text all receipts - work and personal. Just tag them when confirming. Work expenses get tax-organized, personal receipts stay in your document vault for warranties or returns.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">What about mileage between job sites?</h3>
          <p style="color: var(--gray);">
            For business mileage, manually enter miles driven. Many field workers use standard mileage rate (70 cents per mile in 2025) which is simpler than tracking actual vehicle costs.
          </p>
        </div>
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">How do I access reports from the field?</h3>
          <p style="color: var(--gray);">
            TextExpense generates Excel files you can download on your phone or any device. View expenses between jobs, forward to accountant, or save for tax time.
          </p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">What if I lose receipts before photographing them?</h3>
          <p style="color: var(--gray);">
            That's why immediate texting works better for field workers. Buy supplies, text receipt before leaving parking lot. Reduces lost receipt problems significantly.
          </p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/expense-tracking-for-field-workers.html');

console.log('✅ Field worker expense tracking page generated successfully!');
console.log('📄 File: frontend/pages/expense-tracking-for-field-workers.html');
console.log('🔗 URL: /pages/expense-tracking-for-field-workers.html');
