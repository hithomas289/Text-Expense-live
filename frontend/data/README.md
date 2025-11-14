# Frontend Data Directory

This directory contains the **V2 data-driven page generation system**.

## Structure

```
frontend/data/
├── README.md                      # This file
├── pages-registry.json            # Central manifest of all pages
└── pages/                         # Page data files
    ├── example-new-page.json      # Example template
    ├── freelance-tax-deduction-tracker.json
    └── [more-pages].json
```

## How It Works

### 1. Pages Registry (`pages-registry.json`)

**Single source of truth** for all pages on the site.

Tracks:
- Total page count
- Pages by category
- Metadata: slug, title, URL, dates, template version, status, keywords, audience

**Auto-updated** when you run `node scripts/generate-page.js [slug]`

### 2. Page Data Files (`pages/*.json`)

Each page has a JSON file containing all content and metadata.

**Structure:**
- Metadata fields (slug, category, targetAudience, templateVersion, status)
- SEO fields (TITLE, META_DESCRIPTION, KEYWORDS, canonical URLs)
- Social fields (Open Graph, Twitter Cards)
- Content fields (HERO_TITLE, HERO_SUBTITLE, MAIN_CONTENT)
- CTA fields (CTA_URL, CTA_TEXT, FOOTER_CTA_*)

**See `example-new-page.json` for a template.**

## Usage

### Create a New Page

```bash
# 1. Copy example template
cp frontend/data/pages/example-new-page.json frontend/data/pages/my-new-page.json

# 2. Edit the JSON with your content

# 3. Generate the page
node scripts/generate-page.js my-new-page

# Result:
# - HTML generated in frontend/pages/my-new-page.html
# - Registry updated automatically
```

### Update an Existing Page

```bash
# 1. Edit the JSON file
# 2. Regenerate
node scripts/generate-page.js my-existing-page
```

## V2 Benefits

**Before (V1):**
- 27+ separate generator scripts
- ~3,000 lines of duplicate code
- Agent reads all scripts to understand system
- High context usage

**After (V2):**
- 1 universal generator
- JSON data files (clean, structured)
- Central registry for discovery
- **95% context reduction**

## Categories

Pages are organized into these categories:
- `freelancer` - Freelance/self-employed users
- `receipt-scanner` - Receipt scanning focus
- `receipt-management` - Receipt organization
- `text-sms` - Text/SMS messaging focus
- `consultant` - Consultants/contractors
- `general` - Uncategorized

## Registry Queries

```bash
# See all pages
cat frontend/data/pages-registry.json | jq '.pages'

# Count by category
cat frontend/data/pages-registry.json | jq '.categories'

# Find freelancer pages
cat frontend/data/pages-registry.json | jq '.pages[] | select(.category=="freelancer")'

# Pages added this month
cat frontend/data/pages-registry.json | jq '.pages[] | select(.createdDate | startswith("2025-11"))'
```

## Documentation

**Full Guide:** `docs/FRONTEND_GUIDE.md`
**Quick Reference:** `docs/reference/QUICK_RULES.md`

## V1 vs V2

**V1 pages** (existing 27 pages):
- Generated with individual scripts
- Continue to work as-is
- Not migrated to V2 (no need)

**V2 pages** (new pages):
- Use universal generator
- JSON data files
- Tracked in registry

Both systems coexist peacefully!

---

**Version:** 2.0
**Created:** 2025-11-14
