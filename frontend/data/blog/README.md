# Blog Data Directory

This directory contains **V2 data-driven blog post generation system**.

## Structure

```
frontend/data/blog/
├── README.md                                        # This file
├── example-blog-post.json                           # Example template
└── receipt-management-tips-small-business.json      # Real example
```

## How It Works

### Blog Registry (`frontend/data/blog-registry.json`)

**Single source of truth** for all blog posts.

Tracks:
- Total post count
- Posts by category
- Metadata: slug, title, author, URL, dates, reading time, excerpt, tags, status

**Auto-updated** when you run `node scripts/generate-blog.js [slug]`

### Blog Data Files (`*.json`)

Each blog post has a JSON file containing all content and metadata.

**Structure:**
- Metadata fields (slug, category, status, templateVersion, publishDate)
- SEO fields (TITLE, META_DESCRIPTION, KEYWORDS, canonical URLs)
- Social fields (Open Graph, Twitter Cards)
- Author fields (AUTHOR_NAME, AUTHOR_INITIALS)
- Article fields (ARTICLE_TITLE, ARTICLE_CONTENT, READING_TIME)
- CTA fields (CTA_URL, CTA_TEXT, FOOTER_CTA_*)
- Tags and related posts

**See `example-blog-post.json` for a template.**

## Usage

### Create a New Blog Post

```bash
# 1. Copy example template
cp frontend/data/blog/example-blog-post.json frontend/data/blog/my-new-post.json

# 2. Edit the JSON with your content
#    - Update ARTICLE_TITLE, ARTICLE_CONTENT
#    - Set AUTHOR_NAME, PUBLISH_DATE
#    - Add TAGS, related posts
#    - Ensure CTA_URL is https://wa.me/17654792054?text=hi

# 3. Generate the blog post
node scripts/generate-blog.js my-new-post

# Result:
# - HTML generated in frontend/blog/my-new-post.html
# - Blog registry updated automatically
```

### Update an Existing Post

```bash
# 1. Edit the JSON file
# 2. Regenerate
node scripts/generate-blog.js existing-post
```

## Required Fields

These fields are **required** in your JSON:
- `TITLE` - Full page title
- `META_DESCRIPTION` - SEO description
- `ARTICLE_TITLE` - Blog post headline
- `ARTICLE_CONTENT` - Main article HTML
- `AUTHOR_NAME` - Author's name
- `PUBLISH_DATE` - Human-readable date
- `CTA_URL` - Call-to-action URL

## Recommended Fields

- `slug` - Post slug (must match filename)
- `category` - Post category
- `status` - published | draft
- `templateVersion` - v1 or v2
- `publishDate` - ISO date (YYYY-MM-DD)
- `AUTHOR_INITIALS` - For avatar display
- `READING_TIME` - Reading time in minutes
- `KEYWORDS` - Comma-separated SEO keywords
- `TAGS` - HTML tags display
- `RELATED_POSTS` - HTML related posts section
- `FEATURED_IMAGE` - Image URL (optional)

## Article Content Guidelines

### Use Semantic HTML

```html
<!-- Good structure -->
<p>Introduction paragraph...</p>

<h2>Major Section Title</h2>
<p>Section content...</p>

<h3>Subsection Title</h3>
<p>Subsection content...</p>

<ul>
  <li>Bullet point</li>
  <li>Another point</li>
</ul>

<blockquote>
  Important quote or tip
</blockquote>

<ol>
  <li>Step 1</li>
  <li>Step 2</li>
</ol>
```

### Content Best Practices

1. **Use clear headings** - h2 for major sections, h3 for subsections
2. **Keep paragraphs short** - 2-4 sentences max
3. **Use lists** - Break up text with bullet points and numbered lists
4. **Add blockquotes** - Highlight key insights
5. **Bold important points** - Use `<strong>` for emphasis
6. **Include examples** - Make content actionable

## Blog Registry Queries

```bash
# See all posts
cat frontend/data/blog-registry.json | jq '.posts'

# Count by category
cat frontend/data/blog-registry.json | jq '.categories'

# Find posts by author
cat frontend/data/blog-registry.json | jq '.posts[] | select(.author=="Sarah Chen")'

# Published posts only
cat frontend/data/blog-registry.json | jq '.posts[] | select(.status=="published")'

# Posts from this month
cat frontend/data/blog-registry.json | jq '.posts[] | select(.publishDate | startswith("2025-11"))'
```

## V2 Benefits

**Before (V1):**
- Each blog post requires a separate generator script
- Content embedded in JavaScript
- High context usage

**After (V2):**
- 1 universal generator handles all posts
- Clean JSON data files
- Central registry for discovery
- **95% context reduction**

## Documentation

**Full Guide:** `docs/FRONTEND_GUIDE.md` (includes blog section)
**Quick Reference:** `docs/reference/QUICK_RULES.md`

---

**Version:** 2.0
**Created:** 2025-11-14
