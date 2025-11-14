# Testing Checklist - V2 Frontend System

**Use this checklist before EVERY commit of generated content.**

---

## 📋 Quick Validation Commands

Run these after generation:

```bash
# 1. Validate JSON (before generation)
node scripts/validate-json.js page your-slug
node scripts/validate-json.js blog your-slug

# 2. Generate content
node scripts/generate-page.js your-slug
node scripts/generate-blog.js your-slug

# 3. Validate generated HTML (after generation)
node scripts/validate-content.js page your-slug
node scripts/validate-content.js blog your-slug

# 4. Make scripts executable (first time only)
chmod +x scripts/validate-*.js scripts/generate-*.js
```

---

## ✅ Pre-Generation Checklist

**Before running the generator:**

### JSON File Validation
- [ ] JSON file exists in correct directory
- [ ] File named correctly: `[slug].json`
- [ ] JSON syntax is valid (no trailing commas, proper quotes)
- [ ] `slug` field matches filename
- [ ] All required fields present (see RULES.md)
- [ ] `CTA_URL` is exactly: `https://wa.me/17654792054?text=hi`
- [ ] Category is valid (for pages)
- [ ] Author name set (for blogs)

### Content Quality Check
- [ ] No nested `<section>` tags in MAIN_CONTENT/ARTICLE_CONTENT
- [ ] All colors use CSS variables: `var(--primary)`, `var(--dark)`, etc.
- [ ] All font sizes use `rem` units (not `em` or `px`)
- [ ] Content is well-structured (headings, paragraphs, lists)
- [ ] No typos in content

### Run Automated Validation
```bash
node scripts/validate-json.js page your-slug
# OR
node scripts/validate-json.js blog your-slug
```
- [ ] All checks pass (green checkmarks)
- [ ] No errors (red ❌)
- [ ] Warnings reviewed and acceptable

---

## 🔄 Generation Process

### Run Generator
```bash
node scripts/generate-page.js your-slug
# OR
node scripts/generate-blog.js your-slug
```

### Review Terminal Output
- [ ] No errors during generation
- [ ] All placeholders replaced (30+ for pages, 45+ for blogs)
- [ ] File size reasonable (20-30 KB)
- [ ] Registry updated successfully
- [ ] No "unreplaced placeholders" warning

---

## ✅ Post-Generation Checklist

**After generation completes:**

### Run Automated Validation
```bash
node scripts/validate-content.js page your-slug
# OR
node scripts/validate-content.js blog your-slug
```
- [ ] All checks pass (green checkmarks)
- [ ] No errors (red ❌)
- [ ] Warnings reviewed and acceptable

### Manual File Inspection (Quick)
```bash
# Check for issues
grep -E "#[0-9A-Fa-f]{6}" frontend/pages/your-slug.html | grep -v "<style>"
# Should return nothing

grep "{{" frontend/pages/your-slug.html
# Should return nothing
```
- [ ] No hardcoded colors outside `<style>` block
- [ ] No unreplaced placeholders (`{{VARIABLE}}`)

---

## 🌐 Browser Testing

### Desktop Testing

**Open in Chrome:**
```
file:///home/user/Text-Expense-live/frontend/pages/your-slug.html
# OR
http://localhost:3000/pages/your-slug (if server running)
```

**Visual Check:**
- [ ] Page loads without errors
- [ ] All text is readable
- [ ] All sections visible
- [ ] Images load (if any)
- [ ] Layout looks correct
- [ ] WhatsApp green color scheme intact

**Console Check (F12):**
- [ ] No JavaScript errors in console
- [ ] No 404 errors for resources
- [ ] No CSS warnings

**SEO Check (View Source - Ctrl+U):**
- [ ] `<title>` tag correct
- [ ] `<meta name="description">` present
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Canonical URL correct
- [ ] Structured data (JSON-LD) present

---

## 📱 Mobile Responsiveness Testing

### Chrome DevTools (F12 → Toggle Device Toolbar)

**Test at 375px (Mobile - iPhone SE):**
- [ ] Open DevTools (F12)
- [ ] Click "Toggle Device Toolbar" (Ctrl+Shift+M)
- [ ] Select "iPhone SE" or set to 375px width

**Check:**
- [ ] Hero section fully visible (not cut off by header)
- [ ] Text is readable (not too small)
- [ ] No horizontal scroll
- [ ] Cards stack vertically (1 column)
- [ ] Padding looks good (not cramped)
- [ ] CTA buttons are large enough to tap
- [ ] Navigation menu works

**Test at 768px (Tablet - iPad):**
- [ ] Select "iPad" or set to 768px width

**Check:**
- [ ] Layout adjusts properly
- [ ] Grids show 2 columns (where appropriate)
- [ ] Text sizing appropriate
- [ ] Navigation visible
- [ ] All content fits

**Test at 1024px+ (Desktop):**
- [ ] Set to 1024px or larger

**Check:**
- [ ] Full 3-column grids
- [ ] Content centered (max-width 1200px)
- [ ] All features visible
- [ ] Desktop navigation shown

---

## 🔗 CTA Button Testing

### All CTA Buttons
- [ ] Click "Start Free on WhatsApp" in hero
- [ ] Click "Start Free on WhatsApp" in content (if any)
- [ ] Click "Start Free on WhatsApp" in footer

**For Each Button:**
- [ ] Opens WhatsApp Web or WhatsApp app
- [ ] Pre-fills message with "hi"
- [ ] Shows number: +1 765-479-2054
- [ ] No errors or broken links

---

## 📊 Registry Verification

### Pages Registry
```bash
cat frontend/data/pages-registry.json | jq '.pages[] | select(.slug=="your-slug")'
```

**Check:**
- [ ] Entry exists in registry
- [ ] Slug correct
- [ ] Title correct
- [ ] Category correct
- [ ] URL correct (`/pages/your-slug`)
- [ ] Dates set (createdDate, lastModified)
- [ ] Template version correct (v2)
- [ ] Status correct (published/draft)

### Blog Registry
```bash
cat frontend/data/blog-registry.json | jq '.posts[] | select(.slug=="your-slug")'
```

**Check:**
- [ ] Entry exists in registry
- [ ] Slug correct
- [ ] Title correct
- [ ] Author correct
- [ ] Category correct
- [ ] URL correct (`/blog/your-slug`)
- [ ] Dates set (publishDate, lastModified)
- [ ] Reading time set
- [ ] Tags present
- [ ] Status correct (published/draft)

---

## 🧪 Optional: Real Device Testing

**If possible, test on actual devices:**

### Mobile Phone (iPhone/Android)
- [ ] Open page on real phone
- [ ] All content loads
- [ ] Touch targets large enough
- [ ] Text readable without zooming
- [ ] No horizontal scroll
- [ ] CTAs work (opens WhatsApp)

### Tablet (iPad/Android Tablet)
- [ ] Open page on tablet
- [ ] Layout appropriate for screen size
- [ ] All features accessible
- [ ] Touch interactions work

---

## 🔍 Git Review

### Before Committing

**View Changes:**
```bash
git status
git diff frontend/pages/your-slug.html
# OR
git diff frontend/blog/your-slug.html
```

**Review:**
- [ ] Only expected files changed
- [ ] No unintended modifications
- [ ] JSON, HTML, and registry files staged
- [ ] No sensitive data in files

**Files to Commit:**
- [ ] `frontend/data/pages/your-slug.json` (or blog)
- [ ] `frontend/pages/your-slug.html` (or blog)
- [ ] `frontend/data/pages-registry.json` (or blog-registry)

---

## ✅ Final Pre-Commit Checklist

**ALL must be checked before committing:**

### Automated Validation
- [ ] `validate-json.js` passed (no errors)
- [ ] `validate-content.js` passed (no errors)

### Browser Testing
- [ ] Opened in desktop browser (Chrome)
- [ ] No console errors
- [ ] All sections visible
- [ ] SEO meta tags verified

### Mobile Testing
- [ ] Tested at 375px (mobile)
- [ ] Tested at 768px (tablet)
- [ ] Tested at 1024px+ (desktop)
- [ ] No layout issues at any breakpoint

### CTA Testing
- [ ] All CTA buttons tested
- [ ] All open WhatsApp correctly
- [ ] All pre-fill "hi" message

### Registry
- [ ] Entry exists in registry
- [ ] Metadata correct

### Git
- [ ] Only expected files changed
- [ ] Diff reviewed
- [ ] No sensitive data

---

## 🚀 Commit & Push

### Commit Message Format
```bash
git add frontend/data/pages/your-slug.json
git add frontend/pages/your-slug.html
git add frontend/data/pages-registry.json

git commit -m "Add new page: your-slug"
# OR
git commit -m "Add blog post: your-slug"
# OR
git commit -m "Regenerate page: your-slug (fix mobile layout)"

git push
```

### Post-Commit
- [ ] Push successful
- [ ] No errors from remote
- [ ] CI/CD passes (if applicable)

---

## 🆘 If Tests Fail

### Automated Validation Fails
1. Read error messages carefully
2. Fix issues in JSON file
3. Regenerate content
4. Run validation again

### Browser Errors
1. Check console (F12) for error details
2. Verify all required fields in JSON
3. Check for syntax errors in content
4. Regenerate from scratch if needed

### Mobile Layout Broken
1. Check for hardcoded widths
2. Verify no `max-width` in inline styles
3. Test with different content lengths
4. Compare with working example

### CTA Buttons Don't Work
1. Verify URL exactly: `https://wa.me/17654792054?text=hi`
2. Check for URL encoding issues
3. Test in different browsers
4. Clear browser cache

### Registry Not Updated
1. Check file permissions
2. Run update script manually
3. Verify JSON syntax
4. Check for errors in generator output

---

## 📈 Success Criteria

**Your content is production-ready if:**

✅ All automated validations pass (no errors)
✅ No console errors in browser
✅ Mobile responsive at all breakpoints
✅ All CTAs open WhatsApp correctly
✅ Registry updated with correct metadata
✅ File size 20-30 KB
✅ No unreplaced placeholders
✅ SEO meta tags complete
✅ Visual review passed

---

## 🎯 Quick Reference

```bash
# Full validation workflow:

# 1. Pre-generation
node scripts/validate-json.js page your-slug

# 2. Generate
node scripts/generate-page.js your-slug

# 3. Post-generation
node scripts/validate-content.js page your-slug

# 4. Browser test
# Open in Chrome, test mobile views (375px, 768px, 1024px)

# 5. Commit
git add frontend/data/pages/your-slug.json frontend/pages/your-slug.html frontend/data/pages-registry.json
git commit -m "Add new page: your-slug"
git push
```

**Remember: Quality over speed. Better to catch bugs before commit!**

---

**Version:** 2.0
**Last Updated:** 2025-11-14
