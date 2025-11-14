# Frontend Guide - V2 System

**Last Updated:** 2025-11-14
**Version:** 2.0
**Purpose:** Universal page generation with data-driven JSON files

---

## Quick Start

### To Create a New Page:

```bash
# 1. Create JSON data file
cp frontend/data/pages/example-new-page.json frontend/data/pages/your-page-slug.json

# 2. Edit the JSON with your content
# 3. Generate the page
node scripts/generate-page.js your-page-slug

# 4. Verify and commit
git add frontend/data/pages/your-page-slug.json
git add frontend/pages/your-page-slug.html
git add frontend/data/pages-registry.json
git commit -m "Add new page: your-page-slug"
git push -u origin claude/code-review-understanding-01NUxrVG2VwfufnKfbAk2cR5
```

**That's it!** The generator handles everything:
- ✅ Loads your JSON data
- ✅ Replaces all template placeholders
- ✅ Generates self-contained HTML (with embedded CSS)
- ✅ Auto-updates the pages registry
- ✅ Reports file size and stats

### To Create a New Blog Post:

```bash
# 1. Create JSON data file
cp frontend/data/blog/example-blog-post.json frontend/data/blog/your-post-slug.json

# 2. Edit the JSON with your content
#    - Set ARTICLE_TITLE, ARTICLE_CONTENT, AUTHOR_NAME
#    - Add TAGS, READING_TIME, PUBLISH_DATE
#    - Ensure CTA_URL is https://wa.me/17654792054?text=hi

# 3. Generate the blog post
node scripts/generate-blog.js your-post-slug

# 4. Verify and commit
git add frontend/data/blog/your-post-slug.json
git add frontend/blog/your-post-slug.html
git add frontend/data/blog-registry.json
git commit -m "Add new blog post: your-post-slug"
git push
```

**Blog system works the same way:**
- ✅ One universal generator for all blog posts
- ✅ JSON data files for content
- ✅ Separate blog registry (`blog-registry.json`)
- ✅ Auto-updates on generation

---

## The 7 Critical Rules

These rules are **non-negotiable**. Follow them every time:

### 1. ❌ No Nested Sections in MAIN_CONTENT
```html
<!-- ❌ WRONG -->
<section class="my-section">
  <h2>Title</h2>
</section>

<!-- ✅ CORRECT -->
<div style="...">
  <h2>Title</h2>
</div>
```
**Why:** The template already wraps MAIN_CONTENT in a `<section class="content-section">`. Nested sections break semantic HTML.

### 2. ✅ CSS Variables Only (No Hardcoded Colors)
```css
/* ❌ WRONG */
color: #25D366;
background: #1a1a1a;

/* ✅ CORRECT */
color: var(--primary);
background: var(--dark);
```

**Available CSS Variables:**
```css
--primary: #25D366         /* WhatsApp Green */
--primary-dark: #128C7E    /* Darker Green */
--secondary: #075E54       /* Dark Teal */
--dark: #1a1a1a           /* Main Text */
--light: #f8f9fa          /* Light Background */
--gray: #6c757d           /* Secondary Text */
--border: #e0e0e0         /* Borders */
--shadow: 0 10px 40px rgba(0,0,0,0.08)
--success: #10B981        /* Success Green */
--warning: #F59E0B        /* Warning Orange */
--danger: #EF4444         /* Error Red */
```

### 3. ✅ Rem Units for Font Sizes (Not em or px)
```css
/* ❌ WRONG */
font-size: 2em;
font-size: 32px;

/* ✅ CORRECT */
font-size: 2rem;
font-size: 1.5rem;
```

### 4. ✅ WhatsApp CTA URL Format
```
https://wa.me/17654792054?text=hi
```
**Never use:** Different numbers, missing parameters, or alternative formats.

### 5. ✅ Use Template Classes for Cards/Grids
```html
<!-- For pricing cards or feature grids -->
<div class="cards-grid">
  <div class="card">
    <h3>Feature Title</h3>
    <p>Feature description</p>
  </div>
</div>
```

### 6. ✅ Mobile-First Responsive Design
Test at these breakpoints:
- **375px** (Mobile)
- **768px** (Tablet)
- **1024px** (Desktop)

### 7. ✅ Validate Before Deploying
Run these checks:
```bash
# Check for hardcoded colors
grep -r "#[0-9A-Fa-f]\{6\}" frontend/pages/your-page.html

# Check for em units
grep -r "font-size:.*em" frontend/pages/your-page.html

# Check CTA URLs
grep -r "wa.me" frontend/pages/your-page.html
```

---

## JSON Data File Structure

Every page needs a JSON file in `frontend/data/pages/[slug].json` with these fields:

### Required Fields (Will cause errors if missing):
- `TITLE` - Full page title with pipe separator
- `META_DESCRIPTION` - SEO description (150-160 chars)
- `HERO_TITLE` - Main headline
- `MAIN_CONTENT` - Page content (HTML string)
- `CTA_URL` - Call-to-action URL (WhatsApp link)

### Recommended Fields:
- `slug` - Page slug (must match filename)
- `category` - freelancer | receipt-scanner | receipt-management | text-sms | consultant | general
- `targetAudience` - Who this page is for
- `templateVersion` - v1 or v2
- `status` - published | draft
- `KEYWORDS` - Comma-separated SEO keywords
- `CANONICAL_URL` - Full page URL
- `OG_TITLE`, `OG_DESCRIPTION`, `OG_IMAGE` - Open Graph tags
- `TWITTER_TITLE`, `TWITTER_DESCRIPTION`, `TWITTER_IMAGE` - Twitter Card tags
- `SCHEMA_TYPE`, `SCHEMA_NAME`, `SCHEMA_DESCRIPTION` - Schema.org markup
- `CTA_TEXT` - Button text (default: "Start Free on WhatsApp")
- `HERO_SUBTITLE` - Hero section subtitle
- `SECTION_TITLE`, `SECTION_SUBTITLE` - Content section headers
- `FOOTER_CTA_TITLE`, `FOOTER_CTA_SUBTITLE` - Footer CTA content
- `GA_MEASUREMENT_ID` - Google Analytics ID

### Example JSON Structure:
```json
{
  "slug": "example-page",
  "category": "freelancer",
  "targetAudience": "freelancers",
  "templateVersion": "v2",
  "status": "published",
  "TITLE": "Example Page Title | TextExpense",
  "META_DESCRIPTION": "Brief description for SEO",
  "KEYWORDS": "keyword1, keyword2, keyword3",
  "CANONICAL_URL": "https://textexpense.com/pages/example-page",
  "CTA_URL": "https://wa.me/17654792054?text=hi",
  "CTA_TEXT": "Start Free on WhatsApp",
  "HERO_TITLE": "Main Headline",
  "HERO_SUBTITLE": "Supporting text",
  "MAIN_CONTENT": "<div>Your content here</div>",
  "FOOTER_CTA_TITLE": "Ready to start?",
  "FOOTER_CTA_SUBTITLE": "Join thousands of users",
  "GA_MEASUREMENT_ID": "G-XXXXXXXXXX"
}
```

---

## Common MAIN_CONTENT Patterns

Use these proven patterns for consistent, mobile-responsive design:

### Pattern 1: Alert/Warning Box
```html
<div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
  <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Problem</h2>
  <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 15px;">Problem description...</p>
</div>
```

### Pattern 2: Feature Grid with Numbered Steps
```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 40px;">
  <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
    <div style="background: var(--primary); color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem; margin-bottom: 20px;">1</div>
    <h3 style="font-size: 1.3rem; margin-bottom: 15px;">Step Title</h3>
    <p style="color: var(--gray);">Step description...</p>
  </div>
</div>
```

### Pattern 3: Checkmark List
```html
<div style="background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%); padding: 40px; border-radius: 20px; margin-bottom: 60px;">
  <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center;">Benefits</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
    <div>
      <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--primary);">✓ Benefit Title</h3>
      <p style="color: var(--gray);">Benefit description</p>
    </div>
  </div>
</div>
```

### Pattern 4: Pricing Cards (Use Template Classes)
```html
<div class="cards-grid">
  <div class="card">
    <h3>Free Plan</h3>
    <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">FREE</div>
    <p>Perfect for trying</p>
  </div>

  <div class="card" style="border: 2px solid var(--primary);">
    <div style="background: var(--primary); color: white; padding: 6px 15px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 15px;">BEST VALUE</div>
    <h3>Pro Plan</h3>
    <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99<span style="font-size: 1rem; color: var(--gray); font-weight: 500;">/month</span></div>
    <p>For power users</p>
  </div>
</div>
```

---

## Pages Registry

The registry (`frontend/data/pages-registry.json`) is your single source of truth for all pages.

### What It Tracks:
- Total page count
- Pages by category
- Metadata for each page (slug, title, URL, dates, template version, status, keywords, audience)

### How It's Updated:
**Automatically** when you run `node scripts/generate-page.js [slug]`

### Manual Updates:
```bash
node scripts/update-registry.js your-page-slug
```

### Query Examples:

**See all pages:**
```bash
cat frontend/data/pages-registry.json | jq '.pages'
```

**Count by category:**
```bash
cat frontend/data/pages-registry.json | jq '.categories'
```

**Find freelancer pages:**
```bash
cat frontend/data/pages-registry.json | jq '.pages[] | select(.category=="freelancer")'
```

**Pages added this month:**
```bash
cat frontend/data/pages-registry.json | jq '.pages[] | select(.createdDate | startswith("2025-11"))'
```

---

## Generation Workflow

### Standard Process:

```
1. Create JSON data file
   └─> frontend/data/pages/[slug].json

2. Run generator
   └─> node scripts/generate-page.js [slug]

3. Automatic results:
   ├─> HTML generated in frontend/pages/[slug].html
   ├─> Registry updated with metadata
   └─> Stats displayed (size, replacements, etc.)

4. Validate
   ├─> Visual check in browser
   ├─> Mobile responsiveness (375px, 768px)
   ├─> CTA links work
   └─> No console errors

5. Commit & Deploy
   ├─> git add frontend/data/pages/[slug].json
   ├─> git add frontend/pages/[slug].html
   ├─> git add frontend/data/pages-registry.json
   ├─> git commit -m "Add new page: [slug]"
   └─> git push
```

### Regenerating an Existing Page:

Just run the generator again with the same slug. It will:
- Overwrite the HTML file
- Update the `lastModified` date in registry
- Keep the original `createdDate`

---

## Pre-Generation Checklist

Before running the generator, verify:

- [ ] JSON file exists in `frontend/data/pages/`
- [ ] `slug` field matches filename (without .json)
- [ ] All required fields present (TITLE, META_DESCRIPTION, HERO_TITLE, MAIN_CONTENT, CTA_URL)
- [ ] `CTA_URL` is `https://wa.me/17654792054?text=hi`
- [ ] MAIN_CONTENT uses `<div>`, not `<section>`
- [ ] MAIN_CONTENT uses CSS variables, not hardcoded colors
- [ ] MAIN_CONTENT uses `rem`, not `em` or `px`
- [ ] `category` is one of: freelancer, receipt-scanner, receipt-management, text-sms, consultant, general

---

## Post-Generation Checklist

After generation completes:

- [ ] Check terminal output for warnings about unreplaced placeholders
- [ ] Open HTML file in browser
- [ ] Verify all content renders correctly
- [ ] Test mobile view (browser dev tools → device toolbar)
- [ ] Click all CTA buttons (should open WhatsApp)
- [ ] Check browser console for errors
- [ ] Compare file size to expected (~25-30 KB)
- [ ] Verify registry was updated (check `frontend/data/pages-registry.json`)

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Nested Sections
```html
<!-- DON'T DO THIS -->
<section><h2>Title</h2></section>
```
**Fix:** Use `<div>` instead

### ❌ Mistake 2: Hardcoded Colors
```html
<!-- DON'T DO THIS -->
<div style="color: #25D366;">
```
**Fix:** `<div style="color: var(--primary);">`

### ❌ Mistake 3: Wrong Font Units
```html
<!-- DON'T DO THIS -->
<h2 style="font-size: 2em;">
```
**Fix:** `<h2 style="font-size: 2rem;">`

### ❌ Mistake 4: Wrong CTA URL
```html
<!-- DON'T DO THIS -->
href="https://wa.me/17654792054"
```
**Fix:** `href="https://wa.me/17654792054?text=hi"`

### ❌ Mistake 5: Missing Category
```json
{
  "slug": "my-page"
  // Missing "category" field
}
```
**Fix:** Always include `"category": "freelancer"` (or appropriate category)

---

## File Locations Reference

```
Project Root
├── scripts/
│   ├── generate-page.js           ⭐ Universal generator
│   └── update-registry.js         ⭐ Registry updater
│
├── frontend/
│   ├── templates/
│   │   └── landing-template.html  📄 V1 template (self-contained CSS)
│   │
│   ├── data/
│   │   ├── pages-registry.json    📋 Central manifest
│   │   └── pages/
│   │       ├── example-new-page.json           📝 Example template
│   │       └── freelance-tax-deduction-tracker.json  📝 Real example
│   │
│   └── pages/
│       └── [generated-pages].html  📄 Output directory
│
└── docs/
    ├── FRONTEND_GUIDE.md           📚 This file (YOU ARE HERE)
    ├── reference/
    │   └── QUICK_RULES.md         🎯 1-page quick reference
    └── archive/
        └── [old session logs]      📦 Historical context
```

---

## V1 vs V2 System Comparison

| Feature | V1 (Old) | V2 (New) |
|---------|----------|----------|
| **Generator Scripts** | 27+ separate scripts | 1 universal script |
| **Data Storage** | Embedded in scripts | JSON files |
| **Context Usage** | ~3,000 lines of code | ~50 lines + JSON |
| **Registry** | None | Central manifest |
| **To Add Page** | Copy 200-line script | Create JSON file |
| **Maintenance** | Update 27+ scripts | Update 1 script |
| **Discoverability** | Read 27 HTML files | Read 1 JSON registry |

**Existing V1 pages remain unchanged.** They continue to work as-is.

**New pages use V2 system** for efficiency and scalability.

---

## Troubleshooting

### Problem: "Data file not found"
**Solution:** Check filename matches slug exactly: `frontend/data/pages/[slug].json`

### Problem: "Missing required fields"
**Solution:** Ensure JSON has: TITLE, META_DESCRIPTION, HERO_TITLE, MAIN_CONTENT, CTA_URL

### Problem: "Unreplaced placeholders" warning
**Solution:** Add missing fields to JSON or update template to remove unused placeholders

### Problem: Registry not updated
**Solution:** Run manually: `node scripts/update-registry.js [slug]`

### Problem: Page looks broken
**Solution:** Check MAIN_CONTENT doesn't have:
- Nested `<section>` tags
- Hardcoded colors
- `em` units instead of `rem`

---

## Quick Reference Card

```
📋 CTA URL:        https://wa.me/17654792054?text=hi

🎨 Colors:         var(--primary), var(--dark), var(--gray)
📏 Font Sizes:     2rem, 1.5rem, 1.1rem (not em or px)
📱 Breakpoints:    375px, 768px, 1024px

🏷️ Categories:     freelancer, receipt-scanner, receipt-management,
                   text-sms, consultant, general

📦 Template Classes: .cards-grid, .card, .cta-button

✅ Use <div> in MAIN_CONTENT, NOT <section>
```

---

## Support & Questions

**For template issues:** Check `frontend/templates/landing-template.html`
**For examples:** See `frontend/data/pages/freelance-tax-deduction-tracker.json`
**For quick rules:** See `docs/reference/QUICK_RULES.md`
**For history:** See `docs/archive/`

---

## Version History

### V2.0 (2025-11-14)
- ✅ Universal generator system
- ✅ Data-driven JSON architecture
- ✅ Central pages registry
- ✅ Auto-update on generation
- ✅ Consolidated documentation

### V1.0 (2025-01-10 - 2025-01-15)
- 27 pages with individual scripts
- Self-contained template with embedded CSS
- Manual sitemap updates

---

**Last Updated:** 2025-11-14
**Maintained By:** AI Agent
**Version:** 2.0
