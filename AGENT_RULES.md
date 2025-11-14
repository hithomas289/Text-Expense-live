# Agent Content System - Critical Rules

**Last Updated:** 2025-11-14

> **READ THIS FILE COMPLETELY BEFORE EVERY SESSION**

---

## 📋 CRITICAL RULES (READ EVERY SESSION)

### 🚫 NEVER TOUCH THESE FILES:
- ❌ `server.js` - Backend server (untouched since project start)
- ❌ `frontend/index.html` - Main landing page (existing)
- ❌ `frontend/privacy.html` - Privacy policy (existing)
- ❌ `frontend/terms.html` - Terms & Conditions (existing)
- ❌ `frontend/te-logo.png` - Logo file (existing)
- ❌ Anything in `/src/` directory - Backend code
- ❌ `package.json` - Dependencies
- ❌ Any existing configuration files

### ✅ ALLOWED TO MODIFY:
- ✅ Files in `/frontend/blog/` (new content)
- ✅ Files in `/frontend/pages/` (new content)
- ✅ Files in `/frontend/templates/` (templates)
- ✅ Files in `/scripts/` (automation scripts)
- ✅ `frontend/sitemap.xml` (generated)
- ✅ Documentation files (AGENT_*.md)

### 🔍 PRE-FLIGHT CHECKLIST (Every Task):
1. [ ] Read AGENT_RULES.md completely (this file)
2. [ ] Read AGENT_CHANGELOG.md to understand project state
3. [ ] Understand what files exist and their purpose
4. [ ] Plan changes in writing before coding
5. [ ] Verify no existing files will be modified
6. [ ] Run validation after generation
7. [ ] Update AGENT_CURRENT_SESSION.md with work done
8. [ ] Commit with descriptive message

---

## 🎯 TEMPLATE COMPLIANCE RULES

### MAIN_CONTENT Structure Rules:

**CRITICAL:** The landing-template.html already wraps your MAIN_CONTENT in `<section class="content-section">`. Therefore:

1. **NEVER use `<section>` tags inside MAIN_CONTENT**
   - Use `<div>` tags instead
   - Nested sections break CSS specificity and layout

2. **ALWAYS use CSS variables for colors**
   - `var(--dark)` instead of `#1a1a1a`
   - `var(--gray)` instead of `#333`
   - `var(--primary)` instead of hardcoded blues
   - See CONTENT_GENERATION_RULES.md for full list

3. **ALWAYS use rem units for font sizes**
   - `2rem` instead of `2em`
   - `1.1rem` instead of `1.1em`
   - Rem = relative to root, Em = relative to parent

4. **ALWAYS use template classes when available**
   - Use `class="card"` for pricing/feature cards
   - Use `class="cards-grid"` for card containers
   - See template for available classes

5. **ALWAYS use correct CTA URL**
   - Correct: `https://wa.me/17654792054?text=hi`
   - Wrong: `https://wa.me/14155238886?text=Hi`
   - Wrong: `#cta`

### Validation Requirements:

Before considering any page complete:

1. ✅ Verify 0 nested `<section>` tags: `grep -c "<section style=" [file].html` must return 0
2. ✅ Verify CSS variables used: Check for `var(--` in styles
3. ✅ Verify rem units: Check font-size uses `rem` not `em`
4. ✅ Verify CTA URLs: All WhatsApp links point to `17654792054`
5. ✅ Verify template classes: Pricing cards use `.card` class

---

## 📚 Reference Documentation

For detailed implementation guidance, see:

- **CONTENT_GENERATION_RULES.md** - Comprehensive patterns and examples
- **CONTENT_GENERATION_CHECKLIST.md** - Quick verification checklist
- **AGENT_TEMPLATE_GUIDE.md** - Template design philosophy and evolution
- **AGENT_WORKFLOW.md** - Step-by-step generation workflows

---

## 🐛 KNOWN ISSUES & GOTCHAS

### Issues
- None currently

### Gotchas
1. **Apostrophes in JavaScript strings:** Must escape (`you'll` → `you\'ll`)
2. **Empty placeholders:** Leave as empty string `''`, not undefined
3. **URL encoding:** Use `encodeURIComponent()` for sharing URLs
4. **Related posts:** Must manually create HTML for each related post
5. **Blog links need .html extension:** All links to static HTML files must include `.html` (e.g., `/blog/post.html`)
6. **Mobile responsiveness requires CSS overrides:** Inline styles in MAIN_CONTENT need !important overrides in mobile breakpoints

---

## 🔍 LESSONS LEARNED

### Critical Lessons:

1. **Template flexibility is key** - Inline styles in MAIN_CONTENT allow maximum customization
2. **Validation saves time** - Automated checks catch issues before deployment
3. **Escaping matters** - JavaScript string apostrophes must be escaped
4. **HTML validation ≠ deployment testing** - Must test actual routing and visual responsiveness
5. **Express static requires .html extension** - Links must include `.html` for Express middleware
6. **Mobile CSS needs inline style overrides** - Inline styles need !important mobile breakpoints
7. **Template updates are critical** - Fix templates immediately when bugs found
8. **Never nest sections** - Template already wraps MAIN_CONTENT in section tags
9. **CSS variables ensure consistency** - Hardcoded colors break theme
10. **Documentation prevents repeating mistakes** - Rules files are essential

---

*For current session work, see AGENT_CURRENT_SESSION.md*
*For session history, see AGENT_SESSION_HISTORY.md*
*For project overview, see AGENT_CHANGELOG.md*
