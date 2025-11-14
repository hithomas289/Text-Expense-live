# Quick Rules Reference

**1-page cheat sheet for generating pages**

---

## The 7 Commandments

1. ❌ **No Nested `<section>` in MAIN_CONTENT** - Use `<div>` only
2. ✅ **CSS Variables Only** - `var(--primary)` not `#25D366`
3. ✅ **Rem Units** - `2rem` not `2em` or `48px`
4. ✅ **WhatsApp CTA** - `https://wa.me/17654792054?text=hi`
5. ✅ **Template Classes** - `.cards-grid`, `.card`, `.cta-button`
6. ✅ **Mobile-First** - Test 375px, 768px, 1024px
7. ✅ **Validate Before Deploy** - grep checks, visual review, mobile test

---

## CSS Variables

```css
--primary: #25D366         /* WhatsApp Green */
--primary-dark: #128C7E    /* Darker Green */
--secondary: #075E54       /* Dark Teal */
--dark: #1a1a1a           /* Main Text */
--light: #f8f9fa          /* Light Background */
--gray: #6c757d           /* Secondary Text */
--border: #e0e0e0         /* Borders */
--shadow: 0 10px 40px rgba(0,0,0,0.08)
--success: #10B981        /* Success */
--warning: #F59E0B        /* Warning */
--danger: #EF4444         /* Danger */
```

---

## Generation Command

```bash
node scripts/generate-page.js [slug]
```

---

## Required JSON Fields

- `TITLE`
- `META_DESCRIPTION`
- `HERO_TITLE`
- `MAIN_CONTENT`
- `CTA_URL`

---

## Categories

- `freelancer`
- `receipt-scanner`
- `receipt-management`
- `text-sms`
- `consultant`
- `general`

---

## Pre-Generation Checklist

- [ ] JSON file in `frontend/data/pages/`
- [ ] Slug matches filename
- [ ] CTA URL: `https://wa.me/17654792054?text=hi`
- [ ] MAIN_CONTENT uses `<div>`, not `<section>`
- [ ] CSS variables, not hardcoded colors
- [ ] `rem` units, not `em` or `px`
- [ ] Category specified

---

## Post-Generation Checklist

- [ ] No unreplaced placeholders warning
- [ ] Visual check in browser
- [ ] Mobile responsive (375px, 768px)
- [ ] CTA buttons work (open WhatsApp)
- [ ] No console errors
- [ ] Registry updated

---

## Common Patterns

### Alert Box
```html
<div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid #EF4444; padding: 30px; border-radius: 15px; margin-bottom: 60px;">
  <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">Title</h2>
  <p style="color: var(--gray);">Content</p>
</div>
```

### Pricing Cards
```html
<div class="cards-grid">
  <div class="card">
    <h3>Plan Name</h3>
    <div style="font-size: 3rem; font-weight: 800; color: var(--primary); margin: 20px 0;">$4.99</div>
    <p>Description</p>
  </div>
</div>
```

---

**For full guide:** See `docs/FRONTEND_GUIDE.md`
