# Content Generation Rules - CRITICAL REFERENCE

**Last Updated:** 2025-11-14
**Purpose:** Prevent broken UI/theme and incorrect CTAs in generated landing pages

---

## ⚠️ CRITICAL RULES - READ BEFORE GENERATING ANY PAGE

### 1. MAIN_CONTENT Structure

**❌ WRONG - DO NOT DO THIS:**
```javascript
MAIN_CONTENT: `
  <section style="padding: 60px 20px; background: #f8f9fa;">
    <div style="max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 2.5em;">...</h2>
    </div>
  </section>
`
```

**✅ CORRECT - DO THIS:**
```javascript
MAIN_CONTENT: `
  <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
    <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">Section Title</h2>
    <p style="font-size: 1.1rem; color: var(--gray);">Content...</p>
  </div>
`
```

**Why:**
- Template already wraps MAIN_CONTENT in `<section class="content-section">`
- Nested `<section>` tags break the layout and theme
- Use `<div>` containers instead

---

### 2. CSS Variables (Use Template Variables)

**✅ USE THESE CSS VARIABLES:**
```css
var(--primary)       /* #25D366 - WhatsApp green */
var(--primary-dark)  /* #128C7E - Dark green */
var(--secondary)     /* #075E54 - Secondary color */
var(--dark)          /* #1a1a1a - Dark text */
var(--light)         /* #f8f9fa - Light background */
var(--gray)          /* #6c757d - Gray text */
var(--border)        /* #e0e0e0 - Border color */
var(--shadow)        /* 0 10px 40px rgba(0,0,0,0.08) - Shadow */
var(--success)       /* #10B981 - Success green */
var(--warning)       /* #F59E0B - Warning */
var(--danger)        /* #EF4444 - Danger red */
```

**❌ DON'T use hardcoded colors:**
```css
/* WRONG */
color: #1a1a1a;
background: #10b981;

/* CORRECT */
color: var(--dark);
background: var(--success);
```

---

### 3. CSS Classes (Use Template Classes)

**✅ USE THESE TEMPLATE CLASSES:**
- `.cards-grid` - Grid layout for cards
- `.card` - Individual card component
- `.cta-button` - Call-to-action button

**Example:**
```html
<div class="cards-grid">
  <div class="card">
    <h3>Card Title</h3>
    <p>Card content...</p>
  </div>
</div>
```

---

### 4. CTA URL (WhatsApp Link)

**✅ CORRECT CTA URL:**
```javascript
CTA_URL: 'https://wa.me/17654792054?text=hi'
```

**❌ WRONG - DO NOT USE:**
```javascript
CTA_URL: 'https://textexpense.com/#cta'  // WRONG!
CTA_URL: 'https://wa.me/14155238886?text=Hi'  // WRONG NUMBER!
```

**All CTAs must use:**
- Number: `17654792054`
- Text parameter: `text=hi` (lowercase)

---

### 5. Font Sizes (Use rem, not em)

**✅ CORRECT:**
```css
font-size: 2rem;    /* For h2 */
font-size: 1.3rem;  /* For h3 */
font-size: 1.1rem;  /* For large text */
```

**❌ WRONG:**
```css
font-size: 2.5em;   /* Don't use em */
font-size: 48px;    /* Don't use px for text */
```

---

### 6. Standard Data Structure

**Every generation script MUST include:**

```javascript
const data = {
  // SEO Meta Tags
  TITLE: 'Page Title | Brand Message',
  META_DESCRIPTION: 'Description under 160 characters',
  KEYWORDS: 'keyword1, keyword2, keyword3',

  // Open Graph Tags
  OG_TITLE: 'OG Title',
  OG_DESCRIPTION: 'OG Description',
  OG_IMAGE: 'https://textexpense.com/te-logo.png',

  // Twitter Card Tags
  TWITTER_TITLE: 'Twitter Title',
  TWITTER_DESCRIPTION: 'Twitter Description',
  TWITTER_IMAGE: 'https://textexpense.com/te-logo.png',

  // Canonical URL
  CANONICAL_URL: 'https://textexpense.com/pages/page-slug',

  // Schema.org Data
  SCHEMA_TYPE: 'SoftwareApplication',  // or 'WebPage'
  SCHEMA_NAME: 'Product/Page Name',
  SCHEMA_DESCRIPTION: 'Schema description',

  // Hero Section
  HERO_TITLE: 'Main Headline',
  HERO_SUBTITLE: 'Supporting text/value proposition',

  // Content Header
  SECTION_TITLE: 'Section Title',
  SECTION_SUBTITLE: 'Section subtitle',

  // CTA
  CTA_TEXT: 'Call to Action Text',
  CTA_URL: 'https://wa.me/17654792054?text=hi',  // ← CRITICAL!

  // Footer CTA
  FOOTER_CTA_TITLE: 'Footer CTA Title',
  FOOTER_CTA_SUBTITLE: 'Footer CTA description',

  // Google Analytics
  GA_MEASUREMENT_ID: 'G-5F3EMPRHFP',

  // Main Content
  MAIN_CONTENT: `
    <!-- Content here - NO <section> tags! -->
  `
};
```

---

### 7. Validation Checklist

**BEFORE regenerating a page:**

- [ ] Read this document
- [ ] Verify CTA_URL is `https://wa.me/17654792054?text=hi`
- [ ] Verify MAIN_CONTENT uses `<div>` not `<section>`
- [ ] Verify using CSS variables (var(--primary), etc.)
- [ ] Verify using template classes (.cards-grid, .card)
- [ ] Verify font sizes use rem not em
- [ ] Run validation: `node scripts/test-content.js frontend/pages/[page-name].html`
- [ ] **Manually check the page visually** - validation script doesn't catch UI issues!

---

### 8. Common MAIN_CONTENT Patterns

**Pattern 1: Feature Grid**
```html
<div style="margin-bottom: 60px;">
  <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Features</h2>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
    <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
      <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Feature Title</h3>
      <p style="color: var(--gray);">Feature description...</p>
    </div>
  </div>
</div>
```

**Pattern 2: Highlighted Section**
```html
<div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid var(--danger); padding: 30px; border-radius: 15px; margin-bottom: 60px;">
  <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">Important Section</h2>
  <p style="font-size: 1.1rem; color: var(--gray);">Content...</p>
</div>
```

**Pattern 3: Pricing Cards**
```html
<div style="margin-bottom: 60px;">
  <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Pricing</h2>
  <div class="cards-grid">
    <div class="card">
      <h3>Plan Name</h3>
      <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$2.99</div>
      <p>Plan details...</p>
    </div>
  </div>
</div>
```

**Pattern 4: FAQ**
```html
<div style="margin-bottom: 60px;">
  <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">FAQ</h2>

  <div style="background: white; border: 2px solid var(--border); padding: 30px; border-radius: 20px; margin-bottom: 20px;">
    <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Question?</h3>
    <p style="color: var(--gray);">Answer...</p>
  </div>
</div>
```

---

### 9. Pages That Need Fixing (As of 2025-11-14)

**Broken pages (nested sections, wrong CTAs):**
1. self-employed-expense-tracker.html
2. self-employed-receipt-management.html
3. expense-tracking-for-consultants.html
4. solopreneur-expense-tracking.html
5. expense-tracker-for-gig-workers.html
6. expense-tracking-for-field-workers.html
7. affordable-expense-tracking-software.html
8. best-free-expense-tracker.html

**What's broken:**
- Nested `<section>` tags in MAIN_CONTENT
- Wrong CTA URLs (some use `#cta` or wrong WhatsApp number)
- Hardcoded colors instead of CSS variables
- Using `em` instead of `rem` for font sizes

**Fix required:**
- Regenerate all 8 pages following these rules
- Test each page visually (not just validation script)
- Commit with clear message about UI fix

---

## Reference: Working Example

See `scripts/generate-photo-receipt-scanner.js` for a perfect example of correct MAIN_CONTENT structure.

---

## Questions?

If unsure:
1. Read this document again
2. Look at `scripts/generate-photo-receipt-scanner.js`
3. Check `frontend/templates/landing-template.html` to see template structure
4. ASK before regenerating if uncertain

**Never assume - always verify!**
