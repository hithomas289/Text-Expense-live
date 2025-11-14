# Agent Content System - Workflows & Procedures

**Last Updated:** 2025-11-14

---

## 🔄 CONTENT GENERATION WORKFLOWS

### Generating New Landing Page

```bash
# 1. Create generation script (or modify existing)
# Edit: scripts/generate-[page-slug].js

# 2. Define content data (all placeholders)
const landingPageData = {
  TITLE: '...',
  META_DESCRIPTION: '...',
  H1_HEADING: '...',
  MAIN_CONTENT: `
    <div style="...">
      <!-- Remember: Use DIV not SECTION -->
      <!-- Use CSS variables: var(--dark), var(--gray) -->
      <!-- Use rem units for font sizes -->
    </div>
  `,
  CTA_URL: 'https://wa.me/17654792054?text=hi',
  // ... 25+ more fields
};

# 3. Generate
node scripts/generate-[page-slug].js

# 4. Validate manually (automated validation script not available)
# Check for:
grep -c "<section style=" frontend/pages/[page-slug].html  # Must return 0
grep "var(--" frontend/pages/[page-slug].html              # Should see CSS variables
grep "17654792054" frontend/pages/[page-slug].html         # Verify correct CTA URL

# 5. Update sitemap
node scripts/update-sitemap.js

# 6. Update AGENT_CURRENT_SESSION.md with what you did

# 7. Commit and push
git add .
git commit -m "Add landing page: [page-slug]"
git push -u origin [branch-name]
```

### Generating New Blog Post

```bash
# 1. Create/modify blog generation script
# Edit: scripts/generate-[blog-slug].js

# 2. Define blog data (35+ placeholders)
const blogPostData = {
  TITLE: '...',
  ARTICLE_CONTENT: '...',
  AUTHOR_NAME: '...',
  AUTHOR_TITLE: '...',
  READING_TIME: '...',
  PUBLISH_DATE: '...',
  // ... 35+ more fields
};

# 3. Generate
node scripts/generate-[blog-slug].js

# 4. Validate manually
node scripts/test-content.js frontend/blog/[blog-slug].html

# 5. Update blog index manually (frontend/blog/index.html)
# Add new blog post card to the grid

# 6. Update sitemap
node scripts/update-sitemap.js

# 7. Update AGENT_CURRENT_SESSION.md

# 8. Commit and push
git add .
git commit -m "Add blog post: [blog-slug]"
git push -u origin [branch-name]
```

---

## 📞 DEPLOYMENT NOTES

### Railway Auto-Deploy

- **Trigger:** Push to any branch
- **Static Files:** Served from `frontend/` directory
- **URLs automatically available:**
  - `/` → `frontend/index.html`
  - `/pages/slug` → `frontend/pages/slug.html`
  - `/blog/slug` → `frontend/blog/slug.html`
  - `/blog/` → `frontend/blog/index.html`
  - `/privacy` → `frontend/privacy.html`
  - `/terms` → `frontend/terms.html`

### Post-Deployment Checklist

After pushing changes:

- [ ] Verify pages load at correct URLs
- [ ] Check mobile responsiveness (test at 375px, 768px, 1024px)
- [ ] Test all CTAs link to WhatsApp correctly
- [ ] Validate sitemap accessible at `/sitemap.xml`
- [ ] Submit sitemap to Google Search Console (if new pages added)
- [ ] Check browser console for errors
- [ ] Verify proper rendering in Chrome, Safari, Firefox

### Common Deployment Issues

1. **404 errors:**
   - Ensure `.html` extension in all internal links
   - Verify file is in correct directory (frontend/pages/ or frontend/blog/)

2. **Broken mobile layout:**
   - Check mobile CSS overrides are present
   - Test at various viewport sizes

3. **WhatsApp CTA not working:**
   - Verify URL is `https://wa.me/17654792054?text=hi`
   - Check URL encoding if message text is complex

---

## 🎯 NEXT SESSION PREP

### Before Starting Next Task:

1. [ ] Read **AGENT_RULES.md** completely
2. [ ] Read **AGENT_CHANGELOG.md** to understand project state
3. [ ] Review **AGENT_TEMPLATE_GUIDE.md** for template patterns
4. [ ] Check **AGENT_CURRENT_SESSION.md** for latest work
5. [ ] Verify git status is clean (`git status`)
6. [ ] Plan changes in writing before coding
7. [ ] Review **CONTENT_GENERATION_RULES.md** for patterns
8. [ ] Check **CONTENT_GENERATION_CHECKLIST.md** before/after generation

### Ideas for Future Content:

**Landing Page Ideas:**
- Different audiences (freelancers, travelers, homeowners, landlords)
- Different use cases (tax deductions, warranty tracking, donation tracking)
- Different benefits (time-saving, stress reduction, peace of mind)
- More blog posts (tax tips, productivity hacks, comparisons)
- Case studies / success stories
- How-to guides

**Blog Post Ideas:**
- "10 Tax Deductions Self-Employed Workers Miss"
- "How to Organize Receipts for Tax Season"
- "Freelancer's Guide to Expense Tracking"
- "Digital vs Physical Receipt Storage: Pros and Cons"
- "Receipt Management for Remote Workers"

### Template Updates to Consider (After 10+ Pages):

- Add more flexible layout options
- Create component library for common elements
- Optimize for Core Web Vitals
- Add more Schema.org types
- Consider dark mode support
- Add animation/transition patterns

---

## 📈 SUCCESS METRICS

### How to Measure Success:

**Generation Metrics:**
- Pages generated per session
- Validation pass rate (target: 100%)
- Average generation time (target: <10 seconds)
- Average page size (target: <50 KB)

**Quality Metrics:**
- Template compliance (0 nested sections)
- CSS variable usage (100% for colors)
- CTA correctness (100%)
- Mobile responsiveness (test on real devices)

**SEO Metrics (post-deployment):**
- Lighthouse SEO score (target: 90+)
- Page load time (target: <2 seconds)
- Mobile usability score (target: 100)
- Core Web Vitals scores

### Current Stats (as of Session 17):

- **Total Pages Generated:** 27 landing pages
- **Total Blog Posts:** 1
- **Template Version:** 1.0 (stable)
- **Lines of Code:** ~17,000+
- **Validation Pass Rate:** 100% (after Session 17 fixes)
- **Files Created:** 63 total

---

## 🔄 GIT WORKFLOW

### Branch Strategy

- **Main Branch:** (production if exists)
- **Feature Branches:** `claude/session-[N]-[description]-[session-id]`
- **Current Branch:** `claude/session-8-receipt-pages-completion-01FiGzJYV6qCZ55QeNXJVnGj`

### Commit Message Format

```
[Type]: [Brief description]

[Optional detailed description]

Files changed:
- path/to/file1
- path/to/file2

[Optional: Why this change was needed]
```

**Types:**
- `Add:` New content/features
- `Fix:` Bug fixes
- `Update:` Modifications to existing content
- `Docs:` Documentation changes
- `Refactor:` Code restructuring without behavior change

### Push Protocol

```bash
# Always use -u flag for first push on new branch
git push -u origin claude/session-[N]-[description]-[session-id]

# Retry with exponential backoff if network fails:
# Try 1: immediate
# Try 2: wait 2s
# Try 3: wait 4s
# Try 4: wait 8s
# Try 5: wait 16s
```

---

*For rules and requirements, see AGENT_RULES.md*
*For template guidance, see AGENT_TEMPLATE_GUIDE.md*
*For session history, see AGENT_SESSION_HISTORY.md*
