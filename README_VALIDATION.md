# V2 System - Validation & Testing

**Quick reference for rules, validation, and testing**

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **RULES.md** | Complete rules & guardrails (what to touch, what not to touch, the 7 commandments) |
| **TESTING_CHECKLIST.md** | Step-by-step testing checklist before every commit |
| **docs/FRONTEND_GUIDE.md** | Complete V2 system guide |
| **docs/reference/QUICK_RULES.md** | 1-page quick reference |

---

## 🚀 Quick Validation Workflow

### For Landing Pages:

```bash
# 1. Validate JSON before generation
node scripts/validate-json.js page your-slug

# 2. Generate page
node scripts/generate-page.js your-slug

# 3. Validate generated HTML
node scripts/validate-content.js page your-slug

# 4. Browser test (mobile: 375px, 768px, 1024px)

# 5. Commit if all tests pass
git add frontend/data/pages/your-slug.json frontend/pages/your-slug.html frontend/data/pages-registry.json
git commit -m "Add new page: your-slug"
git push
```

### For Blog Posts:

```bash
# 1. Validate JSON before generation
node scripts/validate-json.js blog your-slug

# 2. Generate blog post
node scripts/generate-blog.js your-slug

# 3. Validate generated HTML
node scripts/validate-content.js blog your-slug

# 4. Browser test (mobile: 375px, 768px, 1024px)

# 5. Commit if all tests pass
git add frontend/data/blog/your-slug.json frontend/blog/your-slug.html frontend/data/blog-registry.json
git commit -m "Add blog post: your-slug"
git push
```

---

## ✅ What Gets Validated

### Pre-Generation (`validate-json.js`):
- ✅ Required fields present
- ✅ CTA URL correct (`https://wa.me/17654792054?text=hi`)
- ✅ Category valid
- ✅ No hardcoded colors in content
- ✅ No em units in content
- ✅ No nested sections in content
- ✅ Slug matches filename

### Post-Generation (`validate-content.js`):
- ✅ No unreplaced placeholders (`{{VARIABLE}}`)
- ✅ No hardcoded colors (outside style block)
- ✅ No em units
- ✅ All CTA URLs correct
- ✅ No nested sections
- ✅ File size reasonable
- ✅ Required meta tags present

### Manual Testing:
- ✅ Visual check in browser
- ✅ Mobile responsive (375px, 768px, 1024px)
- ✅ CTA buttons work (open WhatsApp)
- ✅ No console errors
- ✅ Registry updated

---

## 🚨 The 7 Commandments

1. ❌ No nested `<section>` tags - Use `<div>`
2. ✅ CSS variables only - `var(--primary)` not `#25D366`
3. ✅ Rem units - `2rem` not `2em` or `32px`
4. ✅ WhatsApp CTA - `https://wa.me/17654792054?text=hi`
5. ✅ Template classes - `.cards-grid`, `.card`
6. ✅ Mobile-first - Test 375px, 768px, 1024px
7. ✅ Self-contained - No external CSS/JS

---

## 🛡️ Protected Files (NEVER TOUCH)

```
❌ server.js
❌ src/
❌ package.json
❌ frontend/index.html
❌ frontend/privacy.html
❌ frontend/terms.html
❌ frontend/te-logo.png
```

---

## ✅ Safe to Modify

```
✅ frontend/data/pages/*.json
✅ frontend/data/blog/*.json
✅ frontend/pages/*.html (can regenerate)
✅ frontend/blog/*.html (can regenerate)
✅ docs/
✅ scripts/generate-*.js
```

---

## 📱 Mobile Testing (Critical!)

**In Chrome DevTools (F12 → Device Toolbar):**

### 375px (Mobile):
- [ ] Hero visible (not cut off)
- [ ] Text readable
- [ ] Cards stack (1 column)
- [ ] No horizontal scroll

### 768px (Tablet):
- [ ] 2-column grids
- [ ] Layout adjusts

### 1024px+ (Desktop):
- [ ] 3-column grids
- [ ] Content centered

---

## 🔗 CTA Button Test

Every button must:
- [ ] Open WhatsApp Web/app
- [ ] Pre-fill "hi" message
- [ ] Show number: +1 765-479-2054

---

## 📊 Success Criteria

**Ready to commit if:**

✅ `validate-json.js` passed (no errors)
✅ `validate-content.js` passed (no errors)
✅ Browser visual check passed
✅ Mobile responsive at all breakpoints
✅ All CTAs work correctly
✅ Registry updated
✅ No console errors

---

## 🆘 Quick Fixes

### Validation Fails:
1. Read error messages
2. Fix in JSON file
3. Regenerate
4. Validate again

### Mobile Broken:
1. Check for hardcoded widths
2. No `max-width` in inline styles
3. Compare with working example

### CTA Doesn't Work:
1. Verify exact URL: `https://wa.me/17654792054?text=hi`
2. Check for encoding issues
3. Test in different browsers

---

## 📖 Full Documentation

- **Complete rules:** `RULES.md`
- **Testing checklist:** `TESTING_CHECKLIST.md`
- **System guide:** `docs/FRONTEND_GUIDE.md`
- **Quick reference:** `docs/reference/QUICK_RULES.md`

---

**Remember: Test before commit. Quality over speed!** 🚀
