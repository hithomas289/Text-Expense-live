# CLAUDE.md - AI Assistant Rules & Guidelines

**Last Updated:** December 27, 2025
**Project:** TextExpense - WhatsApp Expense Tracking Bot

---

## CRITICAL RULE: CORE CODE PROTECTION

**NEVER modify core code unless EXPLICITLY instructed by the user.**

---

## What is CORE CODE?

Core code is ANY code that handles the application's functionality, business logic, or infrastructure. If it makes the application work, it's core code.

### CORE CODE - DO NOT TOUCH (unless explicitly told):

#### 1. Backend Server & API
- `server.js` - Main Express server
- `src/**/*` - All source code
  - API routes
  - Controllers
  - Services
  - Middleware
  - Utilities
  - Models
  - Database logic
  - WhatsApp bot logic
  - Authentication
  - Payment processing
  - Business logic

#### 2. Database & Migrations
- `scripts/run-migration.js`
- `scripts/migrate-normalize-database.js`
- `scripts/reset-pro-usage.js`
- Any database schema files
- Any migration files

#### 3. Configuration Files
- `package.json` - Dependencies and scripts
- `package-lock.json` - Dependency lock file
- `Dockerfile` - Docker configuration
- `railway.toml` - Railway deployment config
- `.gitignore` - Git ignore rules
- Any `.env` or config files

#### 4. Frontend Application Code
- `frontend/**/*.js` - JavaScript files
- `frontend/**/*.jsx` - React components (if any)
- `frontend/**/*.ts` - TypeScript files
- `frontend/**/*.tsx` - TypeScript React components
- Any frontend build/bundling scripts

#### 5. Core Scripts
- `scripts/**/*` - Utility and operational scripts
  - EXCEPT content generation scripts (see below)

#### 6. Templates (if they contain logic)
- `frontend/templates/blog-template.html` - If it contains JavaScript or processing logic
- Any template with embedded functionality

---

## What is CONTENT (Safe to Modify)?

Content is marketing material, documentation, and data that doesn't affect application functionality.

### CONTENT - SAFE TO MODIFY:

#### 1. Blog Posts (Data Only)
- `frontend/data/blog/*.json` - Blog post content
  - You CAN modify the `ARTICLE_CONTENT` field
  - You CAN modify metadata like titles, descriptions
  - You CAN add new blog posts
- `frontend/blog/*.html` - Generated blog HTML files
  - Only if regenerating from JSON

#### 2. Landing Pages
- `frontend/landing/*.html` - Marketing landing pages
  - ONLY the content sections
  - NOT the structure, scripts, or core HTML

#### 3. Documentation Files
- `*.md` files - Markdown documentation
  - `README.md`
  - `AGENT_RULES.md`
  - `CONTENT_GENERATION_RULES.md`
  - `LANDING_PAGES_AND_BLOG_DOCUMENTATION.md`
  - `RULES.md`
  - `TESTING_CHECKLIST.md`
  - `V2_SYSTEM_OVERVIEW.md`
  - etc.

#### 4. Blog Registry (with caution)
- `frontend/data/blog-registry.json`
  - CAN be updated when adding new blog posts
  - Use existing scripts to update it properly

#### 5. Static Assets
- Images (`qrcode.png`, logos, etc.)
- Marketing materials
- Non-functional assets

---

## When in Doubt

**ASK THE USER** before modifying ANY file if you're unsure whether it's core code or content.

### Red Flags (likely core code):
- Contains JavaScript functions or logic
- Handles data processing
- Contains API endpoints
- Manages user authentication
- Processes payments
- Interacts with database
- Contains business rules
- Has dependencies on npm packages
- Exports modules or functions

### Green Flags (likely content):
- Pure HTML content
- JSON data files for blog posts
- Markdown documentation
- Static text or images
- Marketing copy

---

## Examples of Allowed Operations

### ✅ ALLOWED (Content modifications):
1. Adding content to blog post JSON files
2. Creating new blog posts using existing templates
3. Updating blog post metadata
4. Modifying landing page content (text only)
5. Updating documentation files
6. Adding images or static assets
7. Updating marketing copy

### ❌ NOT ALLOWED (Core code):
1. Modifying server.js
2. Changing API routes
3. Updating database logic
4. Modifying WhatsApp bot functionality
5. Changing authentication flow
6. Updating payment processing
7. Modifying any business logic
8. Changing package.json dependencies
9. Updating configuration files
10. Modifying build scripts

---

## How to Add Blog Content (APPROVED WORKFLOW)

**This is the ONLY way to modify blog content:**

1. ✅ Read existing blog post JSON file
2. ✅ Modify the `ARTICLE_CONTENT` field only
3. ✅ Optionally update metadata (title, description, etc.)
4. ✅ Use Edit or Write tool to save changes
5. ✅ DO NOT touch any .js, .jsx, .ts, .tsx files
6. ✅ DO NOT modify server.js or src/ directory
7. ✅ DO NOT change any scripts

---

## Emergency Override

If the user says **"touch core code"** or **"modify core code"**, then and ONLY then, you may proceed with core code modifications.

Otherwise, **ALWAYS assume it's off-limits.**

---

## Verification Checklist

Before modifying ANY file, ask yourself:

- [ ] Is this a .json file in `frontend/data/blog/`? → Safe
- [ ] Is this a .md documentation file? → Safe
- [ ] Is this a .html file with pure content? → Safe
- [ ] Does this contain JavaScript logic? → STOP - Ask user
- [ ] Is this in src/ directory? → STOP - Ask user
- [ ] Is this server.js? → STOP - Ask user
- [ ] Is this a script file? → STOP - Ask user
- [ ] Does this affect functionality? → STOP - Ask user

---

## Summary

**CORE CODE = Application functionality**
**CONTENT = Marketing materials and data**

**When adding blog content:**
- ✅ Modify JSON files in `frontend/data/blog/`
- ✅ Only edit the content fields
- ❌ NEVER touch server.js, src/, scripts/, or any .js files

**When in doubt → ASK THE USER**

---

**This file serves as a permanent reminder and must be respected at all times.**
