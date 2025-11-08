# TextExpense Agent Content System - Complete Guide

## 📋 Overview

This is a **self-contained, template-based content system** for generating SEO-optimized HTML pages without touching any backend code or existing functionality.

## 🎯 System Architecture

```
frontend/
├── index.html                    (UNTOUCHED - main landing page)
├── privacy.html                  (UNTOUCHED)
├── terms.html                    (UNTOUCHED)
├── te-logo.png                   (UNTOUCHED)
│
├── templates/                    (NEW - Agent reference only)
│   ├── landing-template.html    (Template for landing pages)
│   ├── blog-template.html       (Template for blog posts)
│   └── AGENT_GUIDE.md          (This file)
│
├── blog/                         (NEW - Agent writes here)
│   ├── index.html               (Blog listing page)
│   ├── post-slug.html           (Individual blog posts)
│   └── ...
│
├── pages/                        (NEW - Agent writes here)
│   ├── small-business.html      (Landing pages)
│   └── ...
│
└── sitemap.xml                   (NEW - Auto-maintained)
```

## 🔧 Template System

### **landing-template.html** - For Marketing/Landing Pages

#### Available Placeholders:
```html
{{TITLE}}                    - Page title (50-60 chars for SEO)
{{META_DESCRIPTION}}         - Meta description (150-160 chars)
{{KEYWORDS}}                 - SEO keywords (comma-separated)
{{OG_TITLE}}                 - Open Graph title
{{OG_DESCRIPTION}}           - Open Graph description
{{OG_IMAGE}}                 - Open Graph image URL
{{CANONICAL_URL}}            - Full canonical URL
{{TWITTER_TITLE}}            - Twitter Card title
{{TWITTER_DESCRIPTION}}      - Twitter Card description
{{TWITTER_IMAGE}}            - Twitter Card image URL
{{SCHEMA_TYPE}}              - Schema.org type (e.g., "WebPage", "Product")
{{SCHEMA_NAME}}              - Schema.org name
{{SCHEMA_DESCRIPTION}}       - Schema.org description
{{GA_MEASUREMENT_ID}}        - Google Analytics ID (e.g., G-HMSDHWE3BS)
{{HERO_TITLE}}               - Main hero headline
{{HERO_SUBTITLE}}            - Hero subtitle/description
{{SECTION_TITLE}}            - Content section title
{{SECTION_SUBTITLE}}         - Content section subtitle
{{MAIN_CONTENT}}             - Main HTML content block
{{FOOTER_CTA_TITLE}}         - Footer CTA headline
{{FOOTER_CTA_SUBTITLE}}      - Footer CTA description
{{CTA_URL}}                  - Call-to-action URL
{{CTA_TEXT}}                 - Call-to-action button text
```

#### Example Usage:
```javascript
const landingPageData = {
  TITLE: "Receipt Management for Small Business Owners | TextExpense",
  META_DESCRIPTION: "Simplify expense tracking for your small business. Save time, maximize tax deductions, and stay organized with TextExpense.",
  KEYWORDS: "small business receipts, expense tracking, tax deductions, business accounting",
  CANONICAL_URL: "https://textexpense.com/pages/small-business",
  HERO_TITLE: "Small Business Owners: Stop Drowning in Receipts",
  HERO_SUBTITLE: "Track every business expense effortlessly via WhatsApp. Maximize tax deductions and simplify bookkeeping.",
  CTA_URL: "https://wa.me/17654792054?text=hi",
  CTA_TEXT: "Start Free Trial",
  MAIN_CONTENT: `
    <div class="cards-grid">
      <div class="card">
        <div class="card-icon">💰</div>
        <h3>Maximize Tax Deductions</h3>
        <p>Never miss a deductible expense again...</p>
      </div>
      <!-- More cards here -->
    </div>
  `
};
```

---

### **blog-template.html** - For Blog Posts/Articles

#### Available Placeholders:
```html
{{TITLE}}                    - Article title
{{META_DESCRIPTION}}         - Meta description
{{KEYWORDS}}                 - SEO keywords
{{AUTHOR_NAME}}              - Author full name
{{AUTHOR_INITIALS}}          - Author initials (for avatar)
{{OG_TITLE}}                 - Open Graph title
{{OG_DESCRIPTION}}           - Open Graph description
{{OG_IMAGE}}                 - Featured image URL
{{CANONICAL_URL}}            - Full article URL
{{CANONICAL_URL_ENCODED}}    - URL-encoded for sharing
{{TWITTER_TITLE}}            - Twitter Card title
{{TWITTER_DESCRIPTION}}      - Twitter Card description
{{TWITTER_IMAGE}}            - Twitter Card image
{{TWITTER_SHARE_TEXT}}       - Pre-filled tweet text (URL-encoded)
{{PUBLISH_DATE_ISO}}         - ISO 8601 date (2025-01-15T10:00:00Z)
{{MODIFIED_DATE_ISO}}        - ISO 8601 date
{{PUBLISH_DATE}}             - Human-readable date (January 15, 2025)
{{GA_MEASUREMENT_ID}}        - Google Analytics ID
{{CATEGORY}}                 - Article category
{{ARTICLE_TITLE}}            - Article H1 title
{{READING_TIME}}             - Estimated reading time (minutes)
{{FEATURED_IMAGE}}           - HTML for featured image (or empty string)
{{ARTICLE_CONTENT}}          - Main article HTML content
{{TAGS}}                     - HTML for tag links
{{RELATED_POSTS}}            - HTML for related post cards
{{CTA_TITLE}}                - In-article CTA title
{{CTA_DESCRIPTION}}          - In-article CTA description
{{CTA_URL}}                  - In-article CTA URL
{{CTA_TEXT}}                 - In-article CTA button text
{{FOOTER_CTA_TITLE}}         - Footer CTA title
{{FOOTER_CTA_DESCRIPTION}}   - Footer CTA description
{{FOOTER_CTA_URL}}           - Footer CTA URL
{{FOOTER_CTA_TEXT}}          - Footer CTA button text
```

#### Example Usage:
```javascript
const blogPostData = {
  TITLE: "10 Tax Deductions Small Business Owners Always Miss | TextExpense",
  META_DESCRIPTION: "Discover the most commonly overlooked tax deductions for small businesses and learn how to track them effortlessly.",
  KEYWORDS: "tax deductions, small business tax tips, business expenses, receipt tracking",
  AUTHOR_NAME: "Sarah Johnson",
  AUTHOR_INITIALS: "SJ",
  CANONICAL_URL: "https://textexpense.com/blog/tax-deductions-small-business",
  CANONICAL_URL_ENCODED: "https%3A%2F%2Ftextexpense.com%2Fblog%2Ftax-deductions-small-business",
  PUBLISH_DATE_ISO: "2025-01-15T10:00:00Z",
  PUBLISH_DATE: "January 15, 2025",
  CATEGORY: "Tax Tips",
  ARTICLE_TITLE: "10 Tax Deductions Small Business Owners Always Miss",
  READING_TIME: "7",
  GA_MEASUREMENT_ID: "G-HMSDHWE3BS",
  FEATURED_IMAGE: '<img src="/images/blog/tax-deductions.jpg" alt="Tax deductions" class="featured-image">',
  ARTICLE_CONTENT: `
    <p>Tax season is approaching, and small business owners are scrambling...</p>
    <h2>1. Home Office Deductions</h2>
    <p>If you work from home...</p>
    <!-- More content -->
  `,
  TAGS: `
    <a href="/blog/tag/tax-tips" class="tag">Tax Tips</a>
    <a href="/blog/tag/small-business" class="tag">Small Business</a>
  `,
  RELATED_POSTS: `
    <a href="/blog/receipt-organization-tips" class="related-card">
      <img src="/images/blog/organization.jpg" alt="Receipt Organization">
      <div class="related-card-content">
        <h4>5 Receipt Organization Tips for Busy Entrepreneurs</h4>
        <p>Never lose a receipt again with these simple strategies.</p>
      </div>
    </a>
    <!-- More related posts -->
  `,
  CTA_TITLE: "Ready to Track Every Deduction?",
  CTA_DESCRIPTION: "Start using TextExpense today and never miss a tax deduction again.",
  CTA_URL: "https://wa.me/17654792054?text=hi",
  CTA_TEXT: "Start Free Trial"
};
```

---

## 🚀 Content Generation Workflow

### Step 1: Load Template
```javascript
const fs = require('fs');
const template = fs.readFileSync('frontend/templates/blog-template.html', 'utf8');
```

### Step 2: Replace Placeholders
```javascript
function generateHTML(template, data) {
  let html = template;

  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`;
    html = html.replace(new RegExp(placeholder, 'g'), value);
  }

  return html;
}

const finalHTML = generateHTML(template, blogPostData);
```

### Step 3: Write to Destination
```javascript
const outputPath = 'frontend/blog/tax-deductions-small-business.html';
fs.writeFileSync(outputPath, finalHTML, 'utf8');
```

### Step 4: Update Sitemap
```javascript
// Add new URL to sitemap.xml
updateSitemap([
  {
    url: 'https://textexpense.com/blog/tax-deductions-small-business',
    lastmod: '2025-01-15',
    changefreq: 'monthly',
    priority: 0.8
  }
]);
```

---

## ✅ Pre-Deployment Validation Checklist

Before deploying any generated page, run these checks:

### 1. **HTML Validation**
- [ ] Valid HTML5 (no unclosed tags)
- [ ] All placeholders replaced (no `{{` remaining)
- [ ] Proper DOCTYPE declaration

### 2. **SEO Validation**
- [ ] Title tag present (50-60 characters)
- [ ] Meta description present (150-160 characters)
- [ ] H1 tag present and unique
- [ ] Heading hierarchy correct (H1 → H2 → H3)
- [ ] Canonical URL correct
- [ ] Open Graph tags complete
- [ ] Twitter Card tags complete
- [ ] Structured data (JSON-LD) valid

### 3. **Content Validation**
- [ ] No broken links (all hrefs resolve)
- [ ] All images have alt text
- [ ] CTA buttons have correct URLs with UTM parameters
- [ ] Internal links point to valid pages
- [ ] No placeholder text visible

### 4. **Mobile Validation**
- [ ] Viewport meta tag present
- [ ] Text readable at 375px width
- [ ] Buttons/CTAs are tappable
- [ ] No horizontal scroll
- [ ] Images scale properly

### 5. **Performance**
- [ ] No external CSS dependencies
- [ ] Inline CSS optimized
- [ ] Images optimized (< 200KB)
- [ ] No render-blocking scripts

---

## 🧪 Testing Framework (To Be Implemented)

### Automated Tests
```javascript
// Example test structure
describe('Blog Post Generation', () => {
  it('should replace all placeholders', () => {
    const html = generateHTML(template, data);
    expect(html).not.toContain('{{');
  });

  it('should have valid SEO meta tags', () => {
    const dom = parseHTML(html);
    expect(dom.querySelector('title')).toBeTruthy();
    expect(dom.querySelector('meta[name="description"]')).toBeTruthy();
  });

  it('should have correct heading hierarchy', () => {
    const h1Count = (html.match(/<h1/g) || []).length;
    expect(h1Count).toBe(1);
  });

  it('should have all images with alt text', () => {
    const imagesWithoutAlt = html.match(/<img(?![^>]*alt=)/g);
    expect(imagesWithoutAlt).toBeNull();
  });
});
```

---

## 📊 Sitemap Generation

### Sitemap Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://textexpense.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://textexpense.com/blog/post-slug</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 🔒 Safety Rules

### NEVER:
- ❌ Modify `server.js`
- ❌ Touch existing `index.html`, `privacy.html`, `terms.html`
- ❌ Modify any `/src/` files
- ❌ Change existing routes or APIs
- ❌ Deploy without validation

### ALWAYS:
- ✅ Create NEW files only in `/frontend/blog/` or `/frontend/pages/`
- ✅ Validate HTML before deployment
- ✅ Check all links work
- ✅ Update sitemap.xml
- ✅ Test mobile responsiveness
- ✅ Verify SEO tags complete

---

## 🎨 Design System Reference

### Colors (CSS Variables)
```css
--primary: #25D366         /* WhatsApp Green */
--primary-dark: #128C7E    /* Darker Green */
--secondary: #075E54       /* Dark Teal */
--dark: #1a1a1a           /* Text */
--light: #f8f9fa          /* Background */
--gray: #6c757d           /* Secondary Text */
--border: #e0e0e0         /* Borders */
--shadow: 0 10px 40px rgba(0,0,0,0.08)
```

### Typography
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
line-height: 1.6 (body), 1.8 (articles)
```

### Spacing
- Sections: 80-100px padding
- Cards: 40px padding
- Container: max-width 1200px (landing), 800px (blog)

---

## 📝 Example: Complete Blog Post Generation

```javascript
const generateBlogPost = (postData) => {
  // 1. Load template
  const template = fs.readFileSync('frontend/templates/blog-template.html', 'utf8');

  // 2. Prepare data
  const data = {
    TITLE: `${postData.title} | TextExpense Blog`,
    META_DESCRIPTION: postData.excerpt,
    KEYWORDS: postData.keywords.join(', '),
    AUTHOR_NAME: postData.author,
    AUTHOR_INITIALS: postData.author.split(' ').map(n => n[0]).join(''),
    CANONICAL_URL: `https://textexpense.com/blog/${postData.slug}`,
    CANONICAL_URL_ENCODED: encodeURIComponent(`https://textexpense.com/blog/${postData.slug}`),
    PUBLISH_DATE_ISO: new Date(postData.publishDate).toISOString(),
    PUBLISH_DATE: new Date(postData.publishDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),
    CATEGORY: postData.category,
    ARTICLE_TITLE: postData.title,
    READING_TIME: Math.ceil(postData.content.split(' ').length / 200),
    GA_MEASUREMENT_ID: 'G-HMSDHWE3BS',
    ARTICLE_CONTENT: postData.content,
    TAGS: postData.tags.map(tag =>
      `<a href="/blog/tag/${tag.toLowerCase()}" class="tag">${tag}</a>`
    ).join('\n'),
    CTA_URL: 'https://wa.me/17654792054?text=hi',
    CTA_TEXT: 'Start Free Trial',
    // ... more fields
  };

  // 3. Generate HTML
  const html = generateHTML(template, data);

  // 4. Validate
  validateHTML(html);

  // 5. Write file
  const outputPath = `frontend/blog/${postData.slug}.html`;
  fs.writeFileSync(outputPath, html, 'utf8');

  // 6. Update sitemap
  updateSitemap({
    url: `https://textexpense.com/blog/${postData.slug}`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.8
  });

  console.log(`✅ Blog post generated: ${outputPath}`);
  console.log(`🌐 Live URL: https://textexpense.com/blog/${postData.slug}`);
};
```

---

## 🚀 Deployment Flow

```
Agent creates HTML → Validation → Git commit → Git push → Railway auto-deploy → Live URL
```

**Deployment time:** 1-2 minutes after push

---

## 📞 Support

For questions or issues with the agent system, contact the development team or refer to the main project documentation.

---

**Last Updated:** 2025-01-15
**Version:** 1.0.0
