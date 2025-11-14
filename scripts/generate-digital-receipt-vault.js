const ContentGenerator = require('./generate-content.js');

const generator = new ContentGenerator();

const data = {
  // SEO Meta Tags
  TITLE: 'Digital Receipt Vault | Save Receipts for Warranties Via WhatsApp',
  META_DESCRIPTION: 'Digital receipt vault via WhatsApp. Save receipts for warranties, returns, insurance claims. Add description & category. No app download. Try free.',
  KEYWORDS: 'digital receipt vault, receipt vault, save receipts, receipt archive, warranty receipt storage',

  // Open Graph Tags
  OG_TITLE: 'Digital Receipt Vault | Save Receipts for Warranties Via WhatsApp',
  OG_DESCRIPTION: 'Digital receipt vault via WhatsApp. Save receipts for warranties, returns, insurance claims. Add description & category. No app download.',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Digital Receipt Vault | TextExpense',
  TWITTER_DESCRIPTION: 'Digital receipt vault via WhatsApp. Save receipts for warranties, returns, insurance claims.',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/digital-receipt-vault',

  // Schema.org Data
  SCHEMA_TYPE: 'WebPage',
  SCHEMA_NAME: 'Digital Receipt Vault',
  SCHEMA_DESCRIPTION: 'Digital receipt vault via WhatsApp. Save receipts for warranties, returns, insurance claims. Add description & category. No app download.',

  // Hero Section
  HERO_TITLE: 'Digital Receipt Vault',
  HERO_SUBTITLE: 'Finally, a simple way to save receipts you\'ll actually need later. TextExpense is a digital receipt vault that works through WhatsApp. Buy something you\'ll need the receipt for later? Text the photo, add a description, save it.',

  // Content Header
  SECTION_TITLE: 'How Digital Receipt Vault Works',
  SECTION_SUBTITLE: 'Send receipt photo. Choose to track as expense OR just save it. Add description & category. Find it when you need it.',

  // CTA
  CTA_TEXT: 'Start Free on WhatsApp',
  CTA_URL: 'https://wa.me/17654792054?text=hi',

  // Footer CTA
  FOOTER_CTA_TITLE: 'Start saving receipts',
  FOOTER_CTA_SUBTITLE: 'Try the digital receipt vault that finally makes sense. Text your first receipt via WhatsApp - completely free, see how simple saving actually works.',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',

  // Main Content
  MAIN_CONTENT: `
    <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Problem This Digital Receipt Vault Solves</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">You buy a TV. You know you should keep the receipt for the warranty. Where does it go?</p>
      <p style="color: var(--gray); margin-bottom: 15px;"><strong>Wallet?</strong> It's thermal paper - unreadable in 6 months.<br>
      <strong>Take a photo?</strong> Buried in 3,000 camera roll photos when the TV breaks.<br>
      <strong>Folder at home?</strong> Good luck finding it in 2 years.</p>
      <p style="color: var(--gray);">There's never been a simple digital receipt vault for receipts you just want to save - not track as expenses, just save for later when you might need them.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">How Digital Receipt Vault Works</h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Send Receipt Photo</h3>
          <p style="color: var(--gray);">Buy something with a warranty, return window, or insurance? Text the receipt photo via WhatsApp.</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">2</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Choose What To Do</h3>
          <p style="color: var(--gray);">Digital receipt vault gives you 2 options:<br><br>
          <strong>• Track as expense</strong> - Extract all the data (merchant, date, amount) for expense tracking<br>
          <strong>• Just save it</strong> - Skip the expense tracking, just save the receipt for later</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">3</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Add Description & Category</h3>
          <p style="color: var(--gray);">If you're just saving it: add a description ("Living room TV" or "Kitchen appliance") and category ("Warranties" or "Returns" or whatever makes sense).</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
          <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">4</div>
          <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Find It When You Need It</h3>
          <p style="color: var(--gray);">Browse your saved receipts anytime. Filter by category. Search by description. See the date you uploaded it. Download the original receipt image.</p>
        </div>
      </div>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">What People Use Digital Receipt Vault For</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Warranty claims</strong> - Save receipts when buying electronics, appliances, furniture. When it breaks 14 months later, the receipt is there.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Return windows</strong> - Save receipts for things you might return. 30-day return period? Your receipt is saved and findable.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Insurance claims</strong> - Medical expenses, home repairs, valuable purchases. Save receipts for insurance reimbursement claims.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Large purchases</strong> - Bought a mattress, couch, or expensive item? Save the receipt. You'll probably need it eventually.</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>Home improvement</strong> - Paint, materials, contractor work. Save receipts for records, resale value, or warranty claims.</p>
      <p style="font-size: 1.1rem; color: var(--gray);">The digital receipt vault is for receipts you just want saved and findable - not necessarily tracked as expenses.</p>
    </div>

    <div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Why This Digital Receipt Vault Is Different</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Two options</h3>
          <p style="color: var(--gray);">Track as expense OR just save it. Most tools force you to track everything as expenses.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Simple saving</h3>
          <p style="color: var(--gray);">Just add description and category. No merchant extraction, no amount fields - unless you want them.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Actually findable</h3>
          <p style="color: var(--gray);">Browse saved receipts by category. Search by description. Not buried in photos.</p>
        </div>
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ No expense bloat</h3>
          <p style="color: var(--gray);">Saving a TV warranty receipt doesn't clutter your expense reports. It's just... saved.</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; font-size: 1.1rem; color: var(--gray);">Until now, there wasn't an elegant solution for this. You either tracked every receipt as an expense (overkill) or took photos that got lost (useless). Digital receipt vault solves it.</p>
    </div>

    <div style="background: white; border: 2px solid var(--border); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 20px;">How It's Organized</h2>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">When you browse your digital receipt vault:</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>• Date uploaded</strong> - See when you saved each receipt</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>• Description</strong> - "Sony TV living room" or "Kitchen fridge warranty"</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;"><strong>• Category</strong> - "Warranties", "Returns", "Insurance", "Home", whatever you choose</p>
      <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 30px;"><strong>• Original receipt</strong> - Download the actual receipt image anytime</p>
      <p style="font-size: 1.1rem; color: var(--gray);">Generate reports to see all receipts in a category. Or browse chronologically. Or search for specific descriptions. Your vault, organized however makes sense to you.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
      <div class="cards-grid">
        <div class="card">
          <h3>One Receipt</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
          <p>Try digital receipt vault with zero commitment</p>
        </div>

        <div class="card" style="border: 2px solid var(--primary);">
          <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
          <h3>Light Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Save 6 receipts monthly in your digital receipt vault</p>
        </div>

        <div class="card">
          <h3>Pro Plan</h3>
          <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
          <p>Save 25 receipts monthly in your digital receipt vault</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px; color: var(--gray);">Once saved, receipts stay in your vault. Access them anytime.</p>
    </div>

    <div style="margin-bottom: 60px;">
      <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Frequently Asked Questions</h2>

      <div style="max-width: 800px; margin: 0 auto;">
        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What's the difference between "track as expense" and "just save it" in the digital receipt vault?</h3>
          <p style="color: var(--gray);">Track as expense: AI extracts merchant, date, amount, tax - for expense tracking. Just save it: Skip all that, just add your own description and category - for receipts you want saved but not tracked as expenses.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Can I change my mind after saving a receipt in the digital receipt vault?</h3>
          <p style="color: var(--gray);">Yes. You can edit descriptions and categories anytime. Or delete receipts you no longer need.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">How do I find specific receipts in my digital receipt vault later?</h3>
          <p style="color: var(--gray);">Browse by category, search by description, or generate reports showing all saved receipts by date. Each receipt shows when uploaded, description, category, and links to original image.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">What if I lose my phone - do my saved receipts in the digital receipt vault disappear?</h3>
          <p style="color: var(--gray);">No. Digital receipt vault saves everything in the cloud. Access from any device with WhatsApp. Your saved receipts aren't stuck on one phone.</p>
        </div>

        <div style="background: white; border: 1px solid var(--border); border-radius: 15px; padding: 25px;">
          <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Why not just take photos of receipts instead of using a digital receipt vault?</h3>
          <p style="color: var(--gray);">Camera roll: 3,000 photos, no organization, no descriptions, no categories. Good luck finding that warranty receipt 18 months later. Digital receipt vault: organized, searchable, actually findable.</p>
        </div>
      </div>
    </div>
  `
};

generator.generate('landing', data, 'frontend/pages/digital-receipt-vault.html');

console.log('✅ Generated: digital-receipt-vault.html');
