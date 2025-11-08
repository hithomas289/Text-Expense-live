# Template Evolution Guide

**Purpose:** Document how and when to update templates based on learnings from generated content.

**Philosophy:** Templates should evolve gradually based on real-world usage, not theoretical improvements.

---

## 🎯 Core Principles

### 1. **Evidence-Based Updates Only**
- Don't change templates based on assumptions
- Wait for 3+ similar content pieces to reveal a pattern
- Document the problem before creating the solution

### 2. **Backward Compatibility**
- Existing content should still work with updated templates
- If breaking changes are needed, version templates (v1 → v2)
- Keep old templates available for reference

### 3. **Incremental Improvements**
- Small, focused updates are better than big rewrites
- One improvement per update cycle
- Test thoroughly after each change

### 4. **Document Everything**
- Why the change was made
- What content revealed the need
- How it improves the system
- Version number bump

---

## 📊 When to Update Templates

### ✅ GOOD REASONS to Update:

1. **Pattern Recognition** (3+ instances)
   - Example: 3 blog posts all need custom image galleries
   - Action: Add image gallery placeholder to template

2. **Validation Failures** (consistent)
   - Example: SEO validation consistently flags missing OG type
   - Action: Add missing meta tag to template

3. **Mobile Responsiveness Issues** (repeated)
   - Example: Multiple pages have broken layouts on mobile
   - Action: Fix responsive CSS in template

4. **New SEO Best Practices**
   - Example: Google announces new structured data requirement
   - Action: Add new Schema.org markup to template

5. **Performance Optimization** (measurable)
   - Example: Pages consistently load slowly
   - Action: Optimize CSS, remove unused styles

### ❌ BAD REASONS to Update:

1. **One-off Custom Content**
   - Example: Single page needs video embed
   - Action: Use MAIN_CONTENT custom HTML, don't update template

2. **Theoretical Improvements**
   - Example: "This might be useful someday"
   - Action: Wait for actual use case

3. **Personal Preference**
   - Example: "I like this font better"
   - Action: Stick to brand consistency unless data shows issue

4. **Over-Engineering**
   - Example: Adding 50 new placeholders "just in case"
   - Action: Keep templates simple and focused

---

## 🔄 Template Update Process

### Step 1: Identify the Need
```
Problem: [Describe what's not working]
Evidence: [Link to 3+ content pieces showing the issue]
Impact: [How it affects users/SEO/performance]
```

### Step 2: Plan the Change
```
Proposed Solution: [What will you change]
Placeholders Affected: [List any new/modified placeholders]
Breaking Changes: [Yes/No - if yes, need new version]
Testing Plan: [How will you verify it works]
```

### Step 3: Document Before Changing
```
Template: [landing-template.html or blog-template.html]
Current Version: [e.g., 1.0]
New Version: [e.g., 1.1 or 2.0]
Change Type: [Enhancement / Bug Fix / Breaking Change]
```

### Step 4: Update Template
- Make the changes
- Test with existing content
- Verify validation still passes
- Check mobile responsiveness

### Step 5: Update Documentation
- Update `AGENT_GUIDE.md` with new placeholders
- Update `AGENT_CHANGELOG.md` with version bump
- Update this file with learnings

### Step 6: Regenerate Test Content
- Regenerate 2-3 existing pages with new template
- Compare before/after
- Ensure no regressions

---

## 📝 Template Version Log

### Landing Template

#### v1.0 (Baseline - 2025-01-15)
**Placeholders:** 25
**Features:**
- SEO meta tags (title, description, keywords, OG, Twitter)
- Schema.org structured data
- Hero section
- Main content area (flexible HTML)
- CTA buttons
- Footer
- Mobile responsive
- GA4 tracking

**Content Generated:**
- text-message-expense-tracker (22KB)

**Observations:**
- Works well for conversational copy
- Inline styles in MAIN_CONTENT provide flexibility
- No issues encountered

**Next Review:** After 5 total landing pages

---

### Blog Template

#### v1.0 (Baseline - 2025-01-15)
**Placeholders:** 35
**Features:**
- Article Schema.org markup
- Author bio with avatar
- Reading time calculation
- Breadcrumbs navigation
- Social sharing (Twitter, LinkedIn, Facebook)
- Tags system
- Related posts
- In-article CTA
- Code block styling
- Blockquote styling
- Mobile responsive
- GA4 tracking

**Content Generated:**
- receipt-management-tips-small-business (24KB)

**Observations:**
- Handles long-form content well
- Author section looks professional
- Related posts need manual HTML (could be improved)

**Potential Future Improvements:**
- Auto-generate related posts from frontmatter
- Add table of contents for long articles
- Enhanced code syntax highlighting

**Next Review:** After 5 total blog posts

---

## 🧪 Testing Protocol for Template Changes

### Before Updating:
1. [ ] Document current version number
2. [ ] Save copy of current template as `template-name-v1.0.html`
3. [ ] List all content using current version

### During Update:
1. [ ] Make changes in small increments
2. [ ] Test after each change
3. [ ] Keep git history clean (meaningful commits)

### After Update:
1. [ ] Regenerate 2-3 existing pages
2. [ ] Run validation: `node scripts/test-content.js [file]`
3. [ ] Check mobile responsiveness (375px, 768px, 1024px)
4. [ ] Compare old vs new visually
5. [ ] Update version number in template comments
6. [ ] Update all documentation

### Validation Checklist:
- [ ] HTML validates (DOCTYPE, structure)
- [ ] All SEO tags present
- [ ] No broken placeholders (`{{` remaining)
- [ ] Mobile viewport working
- [ ] All images have alt text
- [ ] Links work correctly
- [ ] CTAs point to correct URLs
- [ ] GA4 tracking code present

---

## 📈 Success Metrics

### Track These After Updates:

1. **Validation Pass Rate**
   - Goal: 100%
   - Track: Percentage of pages passing all checks

2. **Average Page Size**
   - Goal: < 50KB
   - Track: KB per page

3. **Time to Generate**
   - Goal: < 10 seconds
   - Track: Seconds from run to completion

4. **Template Reusability**
   - Goal: 80%+ of content uses template as-is
   - Track: Percentage needing custom modifications

5. **Mobile Responsiveness**
   - Goal: 100% mobile-friendly
   - Track: Pages with layout issues on mobile

---

## 🎓 Lessons Learned Log

### After Each Content Generation:

**Date:** [YYYY-MM-DD]
**Content:** [Page/post slug]
**Template Used:** [landing/blog v1.0]

**What Worked Well:**
- [List positives]

**What Could Be Better:**
- [List issues encountered]

**Template Changes Needed?**
- [ ] Yes - document in "Update Candidates" below
- [ ] No - template works as-is

---

## 🔮 Update Candidates

### Ideas to Consider (After Sufficient Evidence)

#### Landing Template:
- [ ] Add testimonials section placeholder
- [ ] Add image gallery placeholder
- [ ] Add pricing table with more customization
- [ ] Add FAQ accordion component
- [ ] Add comparison table placeholder

**Evidence Needed:** 3+ pages requiring each feature

#### Blog Template:
- [ ] Auto-generate table of contents
- [ ] Add code syntax highlighting (language-specific)
- [ ] Add image caption styling
- [ ] Add pull quotes/callout boxes
- [ ] Add author bio expansion (multiple authors)

**Evidence Needed:** 3+ posts requiring each feature

---

## 🚦 Quick Decision Matrix

| Situation | Action |
|-----------|--------|
| One page needs custom element | Use MAIN_CONTENT custom HTML |
| 2 pages need same element | Note for future review |
| 3+ pages need same element | **Consider template update** |
| Validation fails consistently | **Update template immediately** |
| SEO best practice changes | **Update template after verification** |
| Personal preference | Do not update template |
| Performance issue (measurable) | **Update template with optimization** |
| Breaking change needed | Create new template version (v2.0) |

---

## 📞 Next Steps

### After Generating 5 Landing Pages:
1. Review all 5 pages
2. Identify common patterns
3. List template improvements
4. Prioritize based on impact
5. Update template if warranted

### After Generating 10 Blog Posts:
1. Review all 10 posts
2. Analyze what worked/didn't work
3. Consider template v1.1 or v2.0
4. Document evolution in changelog

### After Generating 20 Total Pages:
1. Major template review
2. Consider creating component library
3. Analyze performance metrics
4. Plan template v2.0 if needed

---

**Remember:** Templates should be stable foundations, not constantly changing targets. Only update when evidence clearly supports the change.

---

**Last Updated:** 2025-01-15
**Current Template Versions:** Landing v1.0, Blog v1.0
**Total Content Generated:** 2 pages
