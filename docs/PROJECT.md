# TextExpense — Project Overview

> Single source of truth for *what TextExpense is* and *how the codebase is organized*.
> Companion docs: [`architecture.md`](./architecture.md) (how it works), [`../codebase-map.yaml`](../codebase-map.yaml) (file-by-file index), [`tech-debt-register.md`](./tech-debt-register.md) (known issues), [`ops-runbook.md`](./ops-runbook.md) (running it in prod).
> Generated from a 5-agent codebase audit on **2026-05-25**. Re-audit when the structure changes materially.

---

## What it is

WhatsApp expense-tracking bot. A user sends a **receipt photo or PDF** over WhatsApp; the bot runs **OCR** (Google Vision → Tesseract fallback) then **AI extraction** (OpenAI `gpt-4o-mini`) to pull structured fields (merchant, date, amount, tax, category), confirms with the user, and stores it. Users can also **save receipts to a "vault"** (store-only, no OCR), **generate Excel reports**, and **upgrade to paid plans** via Stripe.

- **Target market:** US freelancers / gig workers / 1099 contractors. *(Note: much of the currency/locale code still defaults to INR — an artifact of the India-origin build. See tech-debt register.)*
- **Core loop:** WhatsApp message → webhook → router → handler → service → Postgres / S3 → WhatsApp reply.

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Node.js ≥18 (CommonJS, no TypeScript) |
| HTTP | Express 4 + Helmet + CORS + express-rate-limit |
| Messaging | WhatsApp Cloud API (Meta Graph API `v18.0`) via axios |
| OCR | Google Cloud Vision (primary) → Tesseract.js (fallback) → mock |
| PDF | pdf-parse (text PDFs) → pdf2pic (image-only PDFs → 300dpi PNG → OCR) |
| AI extraction | OpenAI `gpt-4o-mini` (chat completions, temp 0.1, max 1000 tokens) |
| Image processing | Sharp (post-OCR compression) |
| DB | PostgreSQL via Sequelize 6 |
| Object storage | AWS S3 (`aws-sdk` v2) — receipt images, server-side AES256, private ACL, 90d→Glacier lifecycle |
| Billing | Stripe (`stripe` v18) — dynamic `price_data`, subscription mode |
| Reports | xlsx-js-style (Excel — the live format) |

## Deployment & ops

- **Railway** project `triumphant-victory` — services `TextExpense` (app) + `Postgres` (DB). Deployed via Docker. **Single instance** (`numReplicas: 1`), region **europe-west4** (Netherlands — note: US-target product hosted in EU).
- **GitHub:** `hithomas289/Text-Expense-live`
- **Git branch:** `main` (project override — *not* `dev`)
- Entry point: `server.js` → `npm start` → `node server.js`
- Prod DB access + metric queries: see [`ops-runbook.md`](./ops-runbook.md)

## Repo layout

```
text-expense/
├── server.js                  # Express bootstrap, routes, lifecycle (~1100 LOC)
├── src/
│   ├── config/                # config, database (Sequelize), commands, mockData
│   ├── controllers/           # WebhookController, MessageRouterV3
│   ├── handlers/              # conversational flow handlers (Document, Confirmation, Edit, Save, Menu)
│   ├── services/              # WhatsApp, OCR, AI, S3, Media, Session, Usage, Currency, Reports, …
│   ├── payments/              # PaymentController + stripe/StripeService
│   ├── models/database/       # Sequelize models (User, Session, ExpenseV2, SavedReceipt, …)
│   ├── jobs/                  # CleanupPaymentFlags (interval job)
│   ├── migrations/            # migrate-expensedate (boot-time self-healing migration)
│   └── utils/                 # fileUtils, priceFormatter
├── scripts/                    # SEO/blog/landing content generators + content validation (NOT app logic)
├── frontend/                   # marketing site: blog JSON + generated HTML + landing pages
└── docs/                       # this folder
```

~23.5k LOC of application source. `scripts/` and `frontend/` are the **content/marketing** surface (safe to edit); `src/` + `server.js` are **core code** (off-limits without explicit "touch core code" instruction).

## The CORE CODE rule (read before editing anything)

Per [`../CLAUDE.md`](../CLAUDE.md): **never modify core code unless the user explicitly says "touch core code".**

- ❌ **Core (off-limits):** `server.js`, all of `src/**`, `scripts/**`, `package.json`, configs, Dockerfile, frontend `.js/.jsx/.ts`.
- ✅ **Content (safe):** blog JSON in `frontend/data/blog/`, landing-page *content*, `.md` docs, static assets.
- A pre-commit gate (`scripts/verify-safety.js`) mechanically blocks commits that touch protected files and `process.exit(1)`s on violation.

## Maturity snapshot (from the audit)

**Works in production:** the full upload→OCR→AI→confirm→save loop, vault saves, Excel reports, Stripe checkout + webhooks, session locking, file cleanup.

**Carries notable debt** (see [`tech-debt-register.md`](./tech-debt-register.md) for the full register):
- **Version drift** — `index.js`/`indexV2.js`, `Expense`/`ExpenseV2` (same table, conflicting schema), `AIService`/`AIService_new`, two `MenuHandler.js`, `MessageRouterV3` (no V1/V2 present).
- **Dead subsystems** — in-memory `SessionManager`/`UserSession` (~670 LOC), `UsageSyncMonitor`, `UsageTracking` model, `SafeUsageWrapper`'s atomic methods, `Referral` system (schema only, never wired), `CSVReportService`, `CountryService`.
- **Real bugs** — dropped transaction context in `User.getOrCreate`, broken 24h/30min session-reset cleanup (wrong method/column names), TOCTOU quota race, no WhatsApp webhook signature verification, open unauthenticated debug endpoints, invalid Sequelize operators in orphan-file cleanup.
- **Market mismatch** — INR defaults throughout currency/locale code despite US targeting.
