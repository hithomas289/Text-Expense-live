# Agent Content System - Template Guide

**Last Updated:** 2025-11-14

---

## 🎓 TEMPLATE DESIGN PHILOSOPHY

### Core Principles:

1. **Self-contained** - No external CSS/JS dependencies
2. **SEO-first** - All meta tags, Schema.org, OG, Twitter
3. **Mobile-responsive** - Test at 375px, 768px, 1024px
4. **Performance** - Inline CSS, optimized images, minimal JS
5. **Accessibility** - Alt text, ARIA labels, semantic HTML
6. **Flexibility** - Main content accepts any HTML structure

### When to Update Templates:

- ✅ After 3+ similar content pieces reveal a pattern
- ✅ When validation consistently fails on specific element
- ✅ When mobile responsiveness breaks
- ✅ When new SEO best practice emerges

### When NOT to Update Templates:

- ❌ For one-off custom content
- ❌ Before testing pattern across multiple pieces
- ❌ Without documenting reason and version bump

---

## 🎨 TEMPLATE EVOLUTION TRACKER

### Purpose

Track template changes over time to understand what patterns work best for different content types.

### Landing Template Evolution

#### Version 1.0 (Baseline - 2025-01-15)

**Current Status:** ✅ Production (27 pages generated)

**Specifications:**
- **Placeholders:** 30+ (expanded from original 25)
- **File:** `frontend/templates/landing-template.html`
- **Size:** ~1,570 lines
- **Content Generated:** 27 landing pages

**Observations:**
- Works well for conversational, problem-solution-pricing structure
- Main content area is flexible with inline styles
- Mobile responsive out of the box (after Session 2 fixes)
- CSS variables system works perfectly for theme consistency
- Gradient backgrounds add visual appeal

**Key Features:**
- CSS variable system (--dark, --gray, --primary, etc.)
- Mobile breakpoints at 768px and 375px
- Card component system for pricing/features
- Gradient backgrounds for sections
- WhatsApp CTA integration
- SEO optimized with Schema.org markup

**Session 3 Enhancement (Mobile Fixes):**
- Added comprehensive mobile CSS overrides
- Fixed header/navigation for mobile devices
- Improved hero section responsiveness
- Still considered v1.0 (non-breaking enhancement)

**Potential Improvements (Future):**
- Consider adding more section types (testimonials, features grid)
- May need image gallery placeholder
- Could benefit from video embed placeholder
- Add dark mode support
- Animation/transition patterns

### Blog Template Evolution

#### Version 1.0 (Baseline - 2025-01-15)

**Current Status:** ✅ Production (1 blog post generated)

**Specifications:**
- **Placeholders:** 35+
- **File:** `frontend/templates/blog-template.html`
- **Content Generated:** 1 post
- **Size:** Not extensively used yet

**Observations:**
- Handles long-form articles well
- Author section works nicely
- Social sharing buttons integrated
- Related posts section functional

**Potential Improvements (Future):**
- May need code syntax highlighting enhancement
- Could add table of contents for long posts
- Image caption styling might be useful
- Author bio expansion
- Reading progress indicator

### Evolution Rules

1. **Don't change templates until 3+ pieces of similar content reveal pattern**
2. **Document reason for every template change**
3. **Keep backward compatibility where possible**
4. **Test all existing content after template updates**
5. **Version templates (1.0 → 1.1 → 2.0)**
   - Major version (2.0): Breaking changes requiring all pages to regenerate
   - Minor version (1.1): New features, backward compatible
   - Patch: Bug fixes only

---

## 📝 CONTENT INVENTORY

### Landing Pages (27 Total)

**Session 1-3 (Basic Pages):**
1. text-message-expense-tracker
2. sms-expense-tracker
3. no-download-expense-tracker

**Session 5-6 (Scanner Pages):**
4. receipt-scanner-app-free
5. free-receipt-scanner
6. phone-receipt-scanner
7. photo-receipt-scanner
8. receipt-scanner-software
9. small-business-receipt-scanner

**Session 7-8 (Storage/Management Pages):**
10. digital-receipt-vault
11. receipt-management-software
12. receipt-organization-app
13. receipt-storage-app

**Session 9-11 (Freelancer Pages):**
14. freelance-expense-tracker
15. expense-tracking-for-freelancers
16. best-expense-tracker-for-freelancers
17. freelance-tax-deduction-tracker
18. 1099-expense-tracker
19. independent-contractor-expense-tracking
20. self-employed-expense-tracker

**Session 12-14 (Self-Employed/Consultant Pages):**
21. self-employed-receipt-management *(Fixed in Session 17)*
22. expense-tracking-for-consultants *(Fixed in Session 17)*
23. solopreneur-expense-tracking *(Fixed in Session 17)*

**Session 15 (Mobile Workers):**
24. expense-tracker-for-gig-workers *(Fixed in Session 17)*
25. expense-tracking-for-field-workers *(Fixed in Session 17)*

**Session 16 (Pricing Focus):**
26. affordable-expense-tracking-software *(Fixed in Session 17)*
27. best-free-expense-tracker *(Fixed in Session 17)*

### Blog Posts (1 Total)

1. receipt-management-tips-small-business (Author: Sarah Chen)

### Index Pages

1. Blog Index (`/blog/`)

---

## 🎨 COMMON DESIGN PATTERNS

### Pattern 1: Hero Section with Gradient

```javascript
MAIN_CONTENT: `
  <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 60px 30px; border-radius: 20px; margin-bottom: 60px; text-align: center;">
    <h2 style="font-size: 2.5rem; margin-bottom: 20px; color: var(--dark);">Main Headline</h2>
    <p style="font-size: 1.2rem; color: var(--gray); max-width: 800px; margin: 0 auto;">
      Supporting text that explains the value proposition...
    </p>
  </div>
`
```

### Pattern 2: Feature Grid (3 columns)

```javascript
MAIN_CONTENT: `
  <div style="margin-bottom: 60px;">
    <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Features</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">
      <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
        <h3 style="font-size: 1.3rem; margin-bottom: 15px; color: var(--dark);">Feature 1</h3>
        <p style="color: var(--gray);">Description...</p>
      </div>
      <!-- Repeat for more features -->
    </div>
  </div>
`
```

### Pattern 3: Highlighted Alert/Warning Box

```javascript
MAIN_CONTENT: `
  <div style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border-left: 4px solid var(--danger); padding: 30px; border-radius: 15px; margin-bottom: 60px;">
    <h2 style="font-size: 2rem; margin-bottom: 15px; color: var(--dark);">The Problem</h2>
    <p style="font-size: 1.1rem; color: var(--gray);">
      Description of the pain point...
    </p>
  </div>
`
```

### Pattern 4: Pricing Cards

```javascript
MAIN_CONTENT: `
  <div style="margin-bottom: 60px;">
    <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">Pricing</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px; max-width: 900px; margin: 0 auto;">
      <div class="card">
        <h3 style="font-size: 1.3rem; margin-bottom: 10px; color: var(--dark);">Plan Name</h3>
        <p style="color: var(--gray);">Plan description</p>
        <p style="font-size: 1.8rem; font-weight: bold; margin: 20px 0; color: var(--primary);">$0</p>
      </div>
    </div>
  </div>
`
```

### Pattern 5: FAQ Section

```javascript
MAIN_CONTENT: `
  <div style="margin-bottom: 60px;">
    <h2 style="font-size: 2rem; margin-bottom: 30px; text-align: center; color: var(--dark);">FAQ</h2>
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="background: white; padding: 30px; border-radius: 15px; margin-bottom: 20px; box-shadow: var(--shadow); border: 1px solid var(--border);">
        <h3 style="font-size: 1.2rem; margin-bottom: 10px; color: var(--dark);">Question?</h3>
        <p style="color: var(--gray);">Answer...</p>
      </div>
    </div>
  </div>
`
```

---

## 🎨 CSS VARIABLE REFERENCE

**Available in landing-template.html:**

```css
--primary: #4f46e5;     /* Primary brand color (indigo) */
--dark: #1a1a1a;        /* Main text color (almost black) */
--gray: #666;           /* Secondary text color */
--light-gray: #f8f9fa;  /* Light backgrounds */
--success: #10b981;     /* Success/positive color (green) */
--warning: #f59e0b;     /* Warning color (orange) */
--danger: #ef4444;      /* Error/alert color (red) */
--border: #e5e7eb;      /* Border color (light gray) */
--shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
```

**Usage Examples:**
- Headings: `color: var(--dark);`
- Body text: `color: var(--gray);`
- CTA buttons: `background: var(--primary);`
- Alert boxes: `border-left: 4px solid var(--danger);`
- Success messages: `color: var(--success);`

---

## 📐 RESPONSIVE BREAKPOINTS

### Mobile-First Approach

**Desktop (default):**
- Font size: 16px base
- Padding: 60px
- Grid columns: 3-4 columns

**Tablet (768px and below):**
```css
@media (max-width: 768px) {
  /* Reduce font sizes */
  font-size: 1.5rem; /* was 2rem */

  /* Reduce padding */
  padding: 40px 20px; /* was 60px 30px */

  /* Single column grids */
  grid-template-columns: 1fr;
}
```

**Mobile (375px and below):**
```css
@media (max-width: 375px) {
  /* Further reduce font sizes */
  font-size: 1.3rem; /* was 1.5rem */

  /* Minimal padding */
  padding: 30px 15px; /* was 40px 20px */
}
```

---

## 📊 TEMPLATE STATISTICS

### Landing Template v1.0 Performance

- **Pages Generated:** 27
- **Success Rate:** 100% (after Session 17 fixes)
- **Average Page Size:** ~25 KB
- **Average Generation Time:** <10 seconds
- **Template Compliance:** 100% (all pages follow structure)

### Known Patterns That Work

1. ✅ Gradient backgrounds for visual interest
2. ✅ Card-based layouts for features/pricing
3. ✅ CSS variables for consistent theming
4. ✅ Rem units for scalable typography
5. ✅ Grid layouts for responsive design
6. ✅ Border-left accent on alert boxes

---

*For generation workflows, see AGENT_WORKFLOW.md*
*For critical rules, see AGENT_RULES.md*
*For content generation patterns, see CONTENT_GENERATION_RULES.md*
