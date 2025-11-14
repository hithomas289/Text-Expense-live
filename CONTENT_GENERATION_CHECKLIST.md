# Content Generation Checklist

**⚠️ READ BEFORE AND AFTER EVERY PAGE GENERATION ⚠️**

## Pre-Generation Checklist

Before writing ANY generation script:

- [ ] Read `CONTENT_GENERATION_RULES.md` completely
- [ ] Verify CTA_URL will be: `https://wa.me/17654792054?text=hi`
- [ ] Confirm MAIN_CONTENT will use `<div>` NOT `<section>`
- [ ] Confirm will use CSS variables: `var(--primary)`, `var(--dark)`, etc.
- [ ] Confirm will use template classes: `.card`, `.cards-grid`
- [ ] Confirm font sizes will use `rem` NOT `em`

## Post-Generation Checklist

After generating a page:

- [ ] Run validation: `node scripts/test-content.js frontend/pages/[page-name].html`
- [ ] Open generated HTML file and verify:
  - [ ] No `<section>` tags inside MAIN_CONTENT (search for `<section`)
  - [ ] CTA_URL is `https://wa.me/17654792054?text=hi` (search for `wa.me`)
  - [ ] Using CSS variables (search for `var(--`)
  - [ ] Using `rem` not `em` (search for `em;`)
  - [ ] No hardcoded colors like `#1a1a1a` or `#10b981`
- [ ] **MANUALLY view the page in browser** (validation script doesn't catch UI!)

## Common Mistakes to Avoid

❌ **WRONG:**
```html
<section style="padding: 60px 20px;">
  <div style="color: #1a1a1a; font-size: 2em;">
```

✅ **CORRECT:**
```html
<div style="padding: 40px; border-radius: 20px;">
  <h2 style="color: var(--dark); font-size: 2rem;">
```

## Quick Reference

**CTA URL:** `https://wa.me/17654792054?text=hi`

**CSS Variables:**
- `var(--primary)` - WhatsApp green
- `var(--dark)` - Dark text
- `var(--gray)` - Gray text
- `var(--success)` - Success green
- `var(--border)` - Border color
- `var(--shadow)` - Box shadow

**Classes:**
- `.cards-grid` - Grid container
- `.card` - Card component

**Font Sizes:**
- `2rem` for h2
- `1.3rem` for h3
- `1.1rem` for large text

---

**If unsure → Re-read CONTENT_GENERATION_RULES.md**
