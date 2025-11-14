# V2 System Rules & Guardrails

**Purpose:** Enforce quality, prevent bugs, protect critical files

---

## 🚨 CRITICAL: Protected Files (NEVER TOUCH)

These files are **off-limits**. Modifying them can break the entire application:

### **Backend (Complete No-Touch Zone)**
```
server.js
src/
package.json
package-lock.json
.env
.gitignore
Dockerfile
railway.toml
```

### **Core Frontend (Never Modify)**
```
frontend/index.html         # Main landing page
frontend/privacy.html       # Privacy policy
frontend/terms.html         # Terms & Conditions
frontend/te-logo.png        # Brand logo
```

### **Templates (Only modify with extreme care)**
```
frontend/templates/landing-template.html
frontend/templates/blog-template.html
```
**⚠️ Warning:** Changes to templates affect ALL generated pages/posts. Test extensively.

---

## ✅ Safe to Modify/Create

### **Always Safe:**
```
frontend/data/pages/*.json           # Page data files
frontend/data/blog/*.json            # Blog data files
frontend/pages/*.html                # Generated pages (can regenerate)
frontend/blog/*.html                 # Generated blog posts (can regenerate)
docs/                                # Documentation
scripts/generate-*.js                # Generator scripts
```

### **Auto-Updated (Don't manually edit):**
```
frontend/data/pages-registry.json    # Updated by generator
frontend/data/blog-registry.json     # Updated by generator
frontend/sitemap.xml                 # Updated by sitemap script
```

---

## 📋 The 7 Commandments (Non-Negotiable)

### **1. No Nested `<section>` Tags in Content**
```html
<!-- ❌ WRONG - Breaks semantic HTML -->
<section class="my-section">
  <h2>Title</h2>
</section>

<!-- ✅ CORRECT - Use div with inline styles -->
<div style="background: var(--light); padding: 40px;">
  <h2>Title</h2>
</div>
```
**Why:** Templates already wrap content in `<section>`. Nesting breaks structure.

### **2. CSS Variables Only (No Hardcoded Colors)**
```css
/* ❌ WRONG */
color: #25D366;
background: #1a1a1a;

/* ✅ CORRECT */
color: var(--primary);
background: var(--dark);
```
**Available variables:**
- `--primary` (#25D366)
- `--primary-dark` (#128C7E)
- `--secondary` (#075E54)
- `--dark` (#1a1a1a)
- `--light` (#f8f9fa)
- `--gray` (#6c757d)
- `--border` (#e0e0e0)
- `--shadow` (box shadow)
- `--success` (#10B981)
- `--warning` (#F59E0B)
- `--danger` (#EF4444)

### **3. Rem Units for Font Sizes (Not em or px)**
```css
/* ❌ WRONG */
font-size: 2em;
font-size: 32px;

/* ✅ CORRECT */
font-size: 2rem;
font-size: 1.5rem;
```

### **4. WhatsApp CTA URL Format**
```
✅ CORRECT: https://wa.me/17654792054?text=hi
❌ WRONG:   https://wa.me/17654792054
❌ WRONG:   https://wa.me/+17654792054?text=hi
```
**Must include:** `?text=hi` parameter

### **5. Use Template Classes for Cards/Grids**
```html
<!-- ✅ CORRECT -->
<div class="cards-grid">
  <div class="card">
    <h3>Title</h3>
    <p>Description</p>
  </div>
</div>

<!-- ❌ WRONG - Don't recreate grid styles inline -->
<div style="display: grid; grid-template-columns: repeat(3, 1fr);">
```

### **6. Mobile Responsive (Required Breakpoints)**
- **375px** - Mobile (iPhone SE)
- **768px** - Tablet (iPad)
- **1024px** - Desktop

**All inline styles must be mobile-friendly by default.**

### **7. No External Dependencies**
- ❌ No external CSS files (self-contained only)
- ❌ No external JavaScript libraries
- ❌ No CDN links
- ✅ Self-contained HTML with embedded CSS

---

## 🔍 Pre-Generation Validation Checklist

**Before running the generator:**

### **For All Content (Pages + Blogs):**
- [ ] JSON file exists in correct directory
- [ ] `slug` field matches filename (without .json)
- [ ] All required fields present (see below)
- [ ] `CTA_URL` is exactly: `https://wa.me/17654792054?text=hi`
- [ ] No nested `<section>` tags in content
- [ ] All colors use CSS variables (no `#RRGGBB`)
- [ ] All font sizes use `rem` units (no `em` or `px`)
- [ ] Category is valid (see categories list)

### **Required Fields - Pages:**
- `TITLE`
- `META_DESCRIPTION`
- `HERO_TITLE`
- `MAIN_CONTENT`
- `CTA_URL`

### **Required Fields - Blogs:**
- `TITLE`
- `META_DESCRIPTION`
- `ARTICLE_TITLE`
- `ARTICLE_CONTENT`
- `AUTHOR_NAME`
- `PUBLISH_DATE`
- `CTA_URL`

### **Valid Categories:**

**Pages:**
- `freelancer`
- `receipt-scanner`
- `receipt-management`
- `text-sms`
- `consultant`
- `general`

**Blogs:**
- Any string (free-form, e.g., "Small Business Tips")

---

## ✅ Post-Generation Validation Checklist

**After generation completes:**

### **1. Terminal Output Check:**
- [ ] No unreplaced placeholders warning
- [ ] File size is reasonable (20-30 KB for pages, 20-25 KB for blogs)
- [ ] Registry updated successfully
- [ ] No errors in console

### **2. Manual File Inspection:**
```bash
# Check for hardcoded colors
grep -E "#[0-9A-Fa-f]{6}" frontend/pages/your-page.html
# Should return ONLY CSS variable definitions in <style> block

# Check for em units
grep -E "font-size:.*em[^d]" frontend/pages/your-page.html
# Should return nothing (except "rem")

# Check CTA URLs
grep "wa.me" frontend/pages/your-page.html
# Should all be: https://wa.me/17654792054?text=hi
```

### **3. Browser Visual Check:**
- [ ] Open page in browser (Chrome recommended)
- [ ] All content renders correctly
- [ ] No console errors (F12 → Console tab)
- [ ] All images load
- [ ] All sections visible

### **4. Mobile Responsiveness Test:**
```
In Chrome DevTools (F12 → Toggle Device Toolbar):
1. Test at 375px width (iPhone SE)
   - [ ] Hero section visible (not cut off by header)
   - [ ] Text readable (not too small)
   - [ ] Cards stack vertically
   - [ ] No horizontal scroll
   - [ ] Padding looks good

2. Test at 768px width (iPad)
   - [ ] Layout adjusts properly
   - [ ] Grid becomes 2 columns where appropriate
   - [ ] Navigation works

3. Test at 1024px+ (Desktop)
   - [ ] Full 3-column grids
   - [ ] Max-width container (1200px)
   - [ ] Content centered
```

### **5. CTA Button Test:**
- [ ] Click all "Start Free on WhatsApp" buttons
- [ ] Should open WhatsApp Web or app
- [ ] Should pre-fill "hi" message
- [ ] Number should be +1 765 479 2054

### **6. SEO Meta Check:**
```bash
# View source (Ctrl+U in browser)
# Verify these exist and are correct:
- [ ] <title> tag
- [ ] <meta name="description">
- [ ] <meta property="og:title">
- [ ] <meta property="og:description">
- [ ] <meta property="og:image">
- [ ] <link rel="canonical">
- [ ] JSON-LD structured data
```

---

## 🧪 Pre-Commit Testing Protocol

**Before committing ANY generated content:**

### **Step 1: Visual Regression**
```bash
# Open both old and new versions side-by-side
# Compare:
- Color scheme (WhatsApp green)
- Font sizes
- Spacing
- Mobile layout
```

### **Step 2: Automated Validation**
```bash
# Run validation script (if exists)
node scripts/validate-page.js your-page-slug

# Or manual checks:
grep -c "{{" frontend/pages/your-page.html
# Should be 0 (no unreplaced placeholders)
```

### **Step 3: Git Diff Review**
```bash
git diff frontend/pages/your-page.html
# Review all changes
# Ensure no unexpected modifications
```

### **Step 4: Test on Mobile Device**
If possible:
- [ ] Test on real iPhone/Android
- [ ] Test in mobile Safari/Chrome
- [ ] Verify touch targets are large enough
- [ ] Verify no text size issues

---

## 🚫 Common Mistakes (Never Do These)

### **❌ Mistake 1: Nested Sections**
```html
<!-- NEVER DO THIS -->
<section>
  <h2>Title</h2>
  <section>Nested section</section>
</section>
```

### **❌ Mistake 2: Hardcoded Colors**
```html
<!-- NEVER DO THIS -->
<div style="color: #25D366; background: #1a1a1a;">
```

### **❌ Mistake 3: Em Units**
```html
<!-- NEVER DO THIS -->
<h2 style="font-size: 2em;">
```

### **❌ Mistake 4: Wrong CTA URL**
```html
<!-- NEVER DO THIS -->
<a href="https://wa.me/17654792054">
```

### **❌ Mistake 5: Missing ?text=hi**
```html
<!-- NEVER DO THIS -->
<a href="https://wa.me/17654792054?text=hello">
```

### **❌ Mistake 6: External CSS**
```html
<!-- NEVER DO THIS -->
<link rel="stylesheet" href="/styles/main.css">
```

### **❌ Mistake 7: Modifying Protected Files**
```bash
# NEVER DO THIS
vim frontend/index.html
vim server.js
vim src/controllers/WebhookController.js
```

---

## 🛡️ Automated Guardrails

The generators include these automatic checks:

### **Generator Checks:**
1. ✅ Validates slug format (lowercase, hyphens only)
2. ✅ Checks JSON file exists
3. ✅ Validates required fields present
4. ✅ Reports unreplaced placeholders
5. ✅ Auto-updates registry
6. ✅ Reports file size

### **What Generators DON'T Check (Manual Review Required):**
- Hardcoded colors in content
- Em units in content
- Nested sections
- Mobile responsiveness
- Visual quality

**That's why manual validation is critical!**

---

## 📝 Commit Message Format

When committing generated content:

```bash
# Good commit messages:
git commit -m "Add new page: freelance-tax-deduction-tracker"
git commit -m "Add blog post: receipt-management-tips"
git commit -m "Regenerate page: sms-expense-tracker (fix mobile layout)"

# Bad commit messages:
git commit -m "update"
git commit -m "changes"
git commit -m "fix stuff"
```

**Format:**
- `Add new page: [slug]` - New page
- `Add blog post: [slug]` - New blog
- `Regenerate page: [slug] (reason)` - Regenerate existing
- `Update registry: [description]` - Registry changes

---

## 🔄 Regeneration Best Practices

When regenerating an existing page:

1. **Backup first:**
   ```bash
   cp frontend/pages/your-page.html frontend/pages/your-page.html.backup
   ```

2. **Run generator:**
   ```bash
   node scripts/generate-page.js your-page
   ```

3. **Compare:**
   ```bash
   diff frontend/pages/your-page.html.backup frontend/pages/your-page.html
   ```

4. **Validate all checks above**

5. **Remove backup:**
   ```bash
   rm frontend/pages/your-page.html.backup
   ```

---

## 🆘 If Something Breaks

### **Generated Page Looks Wrong:**
1. Check browser console for errors
2. Validate JSON against checklist
3. Regenerate from scratch
4. Compare with working example (e.g., `freelance-tax-deduction-tracker`)

### **Mobile Layout Broken:**
1. Check for hardcoded widths in inline styles
2. Ensure using `min-width` in media queries
3. Test at all 3 breakpoints (375px, 768px, 1024px)
4. Compare with working page

### **CTA Buttons Don't Work:**
1. Verify URL is exactly: `https://wa.me/17654792054?text=hi`
2. Check for URL encoding issues
3. Test in different browsers

### **Registry Not Updating:**
1. Check file permissions
2. Run update script manually: `node scripts/update-registry.js [slug]`
3. Verify JSON syntax is valid

---

## 📊 Success Metrics

Your generated content is good if:

- ✅ **No console errors** in browser
- ✅ **File size 20-30 KB** for pages, 20-25 KB for blogs
- ✅ **Mobile responsive** at all 3 breakpoints
- ✅ **All CTAs work** (open WhatsApp correctly)
- ✅ **No unreplaced placeholders** (no `{{VARIABLE}}` visible)
- ✅ **SEO meta tags complete** (title, description, OG tags)
- ✅ **Registry updated** with correct metadata
- ✅ **Passes all validation checks** above

---

## 🎯 Quick Reference Card

```
PROTECTED FILES:
❌ server.js, src/, frontend/index.html, frontend/privacy.html, frontend/terms.html

ALWAYS CHECK:
✅ No nested <section>
✅ CSS variables only
✅ rem units only
✅ CTA: https://wa.me/17654792054?text=hi
✅ Mobile test: 375px, 768px, 1024px
✅ No console errors
✅ Registry updated

BEFORE COMMIT:
✅ Visual check in browser
✅ Mobile responsiveness test
✅ CTA buttons work
✅ No unreplaced placeholders
✅ Git diff review
```

---

**Version:** 2.0
**Last Updated:** 2025-11-14
**Enforcement:** Manual validation + generator checks
