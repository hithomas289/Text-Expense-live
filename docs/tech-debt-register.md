# TextExpense — Tech-Debt & Risk Register

> Consolidated findings from a 5-agent read-only codebase audit, **2026-05-25**.
> Nothing here has been fixed — this is a diagnosis. Core-code changes need explicit "touch core code" approval.
> Severity: 🔴 Critical (correctness/money/security) · 🟠 High · 🟡 Medium · ⚪ Low/cleanup.
> Each item cites the file; line numbers were accurate at audit time — re-verify before acting.

---

## ⚖️ Production reality check (verified against prod DB, 2026-05-25)

Severity below is rated *in principle*. Practical priority is different given current scale:

- **60 users, 0 paid** (58 trial, 2 free), **23% activation**, **~1 expense in the last 30 days** — the product is near-dormant.
- Therefore **all billing bugs (B1–B7) have never fired in anger** — no one has subscribed. They are theoretical until the first real paid user.
- **D2 (broken session expiry):** all 60 sessions are `idle`, 0 stuck — never bites at this volume.
- **B1 (quota race):** max receipts for any trial user = 3 (limit 5) — never reached, let alone raced.
- **D7 (multi-instance):** single replica confirmed — dormant landmine.
- **Deploy note (clarified 2026-05-25):** the FAILED deploy (commit "d", Divya0600) is on the **stale `TextExpense` service**, which deploys from a different fork (`Divya0600/TextExpense`) — NOT the live site. The live production service is **`awake-renewal`** (custom domain `textexpense.com`, deploys from `hithomas289/Text-Expense-live`); it deploys cleanly and is healthy (HTTP 200, verified after pushing the docs). The stale `TextExpense` service can be deleted/ignored — confirm with user first. `planType` enum has no `premium` (the ops-runbook monetization query references `'premium'` — harmless at 0 paid, but would error in an enum-cast context).
- **D3 confirmed live (corrected):** a `status='failed'` query threw *"invalid input value for enum enum_expenses_status"*. The table is actually bound to the **legacy `{draft, confirmed, deleted}`** enum, and **all 38 rows are `confirmed`** — i.e. the *legacy* `Expense` definition won the table, and the current `ExpenseV2` model's `draft`-only enum is the one that does NOT match reality. (The collision is real either way; ExpenseV2 writes `draft` rows fine since `draft` is in both.)

**What this means for triage:** the bug is the *business* (activation/monetization), not the code. Act now only on items that bite regardless of traffic — i.e. **Security S1/S2/S3** (real user financial data exposed). Fix **B3** before the first monetization push. Everything else: fix-before-scale / opportunistic cleanup.

---

## Security

| # | Sev | Issue | Location | Notes |
|---|-----|-------|----------|-------|
| S1 | 🔴 | **No WhatsApp webhook signature verification.** POST `/webhook` trusts any caller — no `X-Hub-Signature-256` HMAC against the Meta app secret. Anyone with the URL can inject fake messages, drive state, and burn OCR/AI/S3 spend. | `WebhookController.handleIncomingMessage` | GET verify-token exists; POST is unauthenticated. |
| S2 | 🔴 | **Open unauthenticated debug/admin endpoints.** `/debug/env` leaks which secrets are set + DB URL prefix; `/debug/database`, `/debug/:phone`, `/debug-count` expose user data; `/fix-plantypes`, `POST /debug/fix-counts` **mutate** data — all no-auth. | `server.js` | Remove or auth-gate before any growth push. |
| S3 | 🟠 | **IDOR on receipt download.** `/receipt-download/:encodedKey` (server.js:145) base64-decodes an arbitrary S3 key and streams it with no ownership check. S3 keys are `receipts/<phone>/…` (predictable), so knowing a phone number enables enumeration. **Amplified:** it sets `Cache-Control: public, max-age=31536000` (server.js:187) — a shared/CDN cache could retain another user's private receipt for a year under a guessable URL. | server.js:145, :187 | |
| S4 | 🟡 | **Prompt-injection surface.** Raw OCR text is concatenated into the AI prompt unescaped; a crafted receipt can influence extracted fields. Bounded by the constrained JSON schema + normalization. | `AIService.js:~175` | Delimit/escape untrusted OCR text. |
| S5 | 🟡 | **PII in logs + S3 metadata.** Raw AI response `console.log`'d (`AIService.js:52`); phone number stored in S3 object metadata (`S3Service.js:171`). *(Correction: `OCRService.js` has zero console.log; the raw-OCR-text logging is in the **dead** `AIService_new.js:22-23` — not on the live path. Delete that file to remove the latent risk.)* | AIService.js:52, S3Service.js:171 | (Anshin bans console.log; TextExpense is full of it.) |
| S6 | ⚪ | Prod SSL uses `rejectUnauthorized:false` (MITM-permissive, Railway-typical). | `config/database.js:10` | |
| S7 | ⚪ | Hardcoded personal phone `+919603216152` in several debug routes. | `server.js` | |

## Billing & money

| # | Sev | Issue | Location | Notes |
|---|-----|-------|----------|-------|
| B1 | 🔴 | **TOCTOU quota race.** Live path = `validateCanProcess` (read, no lock) → later create+increment. Concurrent uploads can each pass the check before any increment lands → quota bypass. `SafeUsageWrapper`'s atomic methods were built to fix this but are **dead/unused**. | DocumentProcessingHandler + SafeUsageWrapper | |
| B2 | 🔴 | **No Stripe webhook idempotency/replay protection.** Only `checkout.session.completed` has a row-lock dedupe. Stripe's at-least-once delivery means `subscription.updated` (resets usage), `payment_succeeded` (WhatsApp msg), `invoice.paid` (history row) can run multiple times. No processed-events ledger. | `PaymentController.handleWebhook` | |
| B3 | 🔴 | **Lost activations.** Webhook dispatcher swallows per-event errors and returns `200 received:true`. A DB failure during `invoice.payment_succeeded` means the user paid but is never activated, and Stripe won't retry (we 200'd). | `PaymentController:~206-215` | |
| B4 | 🟠 | **Cross-plan upgrade double-charge window.** Old sub cancelled `at_period_end`, new sub bills immediately → user pays for new plan while still inside the paid old period. Quota compensates (Lite-carryover); billing doesn't. | `StripeService.createCheckoutSession:~66` | |
| B5 | 🟠 | `cancelSubscription` nulls `stripeCustomerId` → loses ability to reconcile future Stripe webhooks for that customer. | `User.js:~446` | Self-doubting comment already in code. |
| B6 | 🟡 | `invoice.paid` hardcodes `planType:'pro'` → wrong audit data for Lite users. | `PaymentController:~645` | |
| B7 | 🟡 | `handlePaymentFailed` (PaymentController.js:680) logs `user.planType` which can be `free` (set by `cancelSubscription`), but `SubscriptionHistory.planType` ENUM is `(trial,lite,pro)` — lacks `free` → invalid-enum insert throws, swallowed at PaymentController.js:715 (silent failure). *(`canceling` is a subscriptionStatus, not a planType — `free` is the actual trigger.)* | PaymentController.js:680, SubscriptionHistory.js:22 | |

## Data layer & correctness

| # | Sev | Issue | Location | Notes |
|---|-----|-------|----------|-------|
| D1 | 🔴 | **Dropped transaction context.** `DatabaseSessionManager` passes `{transaction}` to `User.getOrCreate(phoneNumber)`, which takes **one arg** — silently ignored. User lookup/creation (with its own auto-commits) runs outside the surrounding `LOCK.UPDATE` transaction. Repeats in `updateUserState`, `addReceipt`, `setCurrentReceipt`. **Also:** `Session.getOrCreateByUserId(userId)` (Session.js:188) likewise takes one arg but is called with `{transaction}` — so even the session row the lock is meant to protect can be created/fetched outside the tx. | DatabaseSessionManager + User.js:529 + Session.js:188 | Weakens the locking the design relies on. |
| D2 | 🔴 | **Broken session expiry/cleanup.** `cleanup24HourOldReceipts` calls non-existent `session.updateUserState` (it's `updateState`) → throws. `send30MinuteExpiry` writes `userState` (column is `state`) → silently ignored. **Sessions are not reset to idle on expiry** — users can get stuck mid-flow. | DatabaseSessionManager:~297,~423 | Check prod `sessions.state` distribution. |
| D3 | 🟠 | **Expense schema collision.** `Expense` and `ExpenseV2` map to the **same `expenses` table** with conflicting status ENUMs (`draft/confirmed/deleted` vs `draft`) and `expenseDate` types (`DATEONLY` vs `STRING(50)`). Migration/integrity hazard; Sequelize sync from the two would disagree. **Verified in prod:** the table carries the legacy `{draft,confirmed,deleted}` enum (all rows `confirmed`), so the live DB matches the legacy `Expense`, not `ExpenseV2`. | Expense.js / ExpenseV2.js | Code treats ExpenseV2 as current but the table is on the legacy enum — reconcile before any sync/alter. |
| D4 | 🟠 | **No formal migration framework.** Relies on `sequelize.sync({alter:false})` (create-only) + one boot-time self-healing migration. Column adds/renames on existing tables don't propagate → prod/code schema drift. | `config/database.js` | CLAUDE.md references `run-migration.js`/`migrate-normalize-database.js` that **don't exist** in the repo. |
| D5 | 🟠 | **Connection pool `acquire: 2000ms`** (mis-mapped from `connectionTimeoutMillis`) — too low; expect `ConnectionAcquireTimeoutError` under load. | `config/database.js:~25` | |
| D6 | 🟡 | `addReceipt` commits its read transaction before the write transaction → `FOR UPDATE` lock released before writes; atomicity weaker than comments claim. | DatabaseSessionManager:~95 | |
| D7 | 🟡 | **In-memory state breaks on multi-instance.** `SessionLockManager` (mutex), `processedMessages`/`imageUploads` (dedup/multi-image) are per-process. >1 Railway replica → duplicate processing, double OCR/limit charges. Lock also force-releases on timeout. | SessionLockManager, WebhookController | ✅ **Verified single-instance** (Railway `numReplicas: 1`, region europe-west4, as of 2026-05-25) — so this does NOT currently bite. Latent: becomes a 🔴 the moment replicas are scaled. Needs Redis-backed locks/dedup before any horizontal scaling. |
| D8 | 🟡 | **Soft-delete inconsistency.** Only `SavedReceipt` is `paranoid`, and it *also* has an `isActive` flag its queries filter on instead of `deletedAt` — two competing deletion notions. Others hard-delete; `GeneratedReport` cleanup leaks S3 files (TODO). | SavedReceipt, GeneratedReport | |
| D9 | 🟡 | **Missing indexes.** `users.referredBy`, `users.stripeCustomerId`, `users.stripeSubscriptionId` unindexed → webhook lookups do full scans. | User.js | |
| D10 | ⚪ | `SavedReceipt` uses INTEGER PK while everything else is UUID. | SavedReceipt.js | |

## Reliability / bugs

| # | Sev | Issue | Location | Notes |
|---|-----|-------|----------|-------|
| R1 | 🟠 | **Missing methods called.** Router calls `SaveReceiptHandler.handlePostSaveVaultChoice` (never defined) for `ADD_ANOTHER_RECEIPT`/`DOWNLOAD_EXCEL_NOW` → TypeError → user sees generic error. Post-save vault buttons broken. | MessageRouterV3:~347, SaveReceiptHandler | |
| R2 | 🟠 | `showSaveSuccessMessage` references undefined `totalLimit` in Pro-limit-reached branch → ReferenceError when a Pro user hits 0 remaining on a vault save. | SaveReceiptHandler:~787 | |
| R3 | 🟠 | **Orphan-file cleanup silently no-ops.** `isFileOrphaned` uses Mongo-style `$or`/`$like` in Sequelize `where` for ExpenseV2/SavedReceipt (should be `[Op.or]`/`[Op.like]`). Queries don't match; catch returns false → only the 24h time sweep reaps files. | FileCleanupManager:~105-128 | |
| R4 | 🟡 | **Fictional confidence scores.** Google Vision confidence hardcoded (0.85/0.9); `overallConfidence = max(ocr, ai)` → almost always ≥0.9. Any confidence-gating is misleading. | OCRService | |
| R5 | 🟡 | **Mock OCR fallback fabricates data.** On Tesseract failure, `fallbackOCR` returns fake "RECEIPT / TOTAL: $XX.XX" (conf 0.3) → fed to OpenAI → plausible-but-bogus expense instead of a clean failure. | OCRService.fallbackOCR | |
| R6 | 🟡 | Swallowed S3 upload + compression errors (empty catch) → receipt proceeds with no stored file, user not told. | DocumentProcessingHandler | Comment claims S3 only on Save, but it fires during Process. |
| R7 | ⚪ | `new Date(session.currentReceipt.date)` can yield Invalid Date from freeform OCR/edited dates. | EditDetailsHandler:~412 | |
| R8 | ⚪ | Metadata sometimes double-nested (`metadata.metadata.X`); `getContextFromState` reads both — fragile context detection. | MessageRouterV3 | |

## Market / config mismatch

| # | Sev | Issue | Location |
|---|-----|-------|----------|
| M1 | 🟡 | **INR default despite US target market.** `CurrencyService`, `CountryService`, `CurrencyConversionService`, `PhoneNumberService` all fall back to INR/₹. Only `priceFormatter.js` is USD-correct. Any non-mapped country gets mis-tagged INR. | currency/locale services |
| M2 | ⚪ | Pricing env vars (`LITE_PLAN_PRICE`/`PRO_PLAN_PRICE`) still commented "in paise" (India artifact); live `getStripePricing` actually charges USD. | CurrencyConversionService, StripeService |
| M3 | ⚪ | `ShareService` hardcodes `wa.me/17654792054` and ignores `WHATSAPP_BOT_NUMBER`. Verify the number is current. | ShareService.js:~20 |

## Dead code (removal candidates — confirm with grep + user first)

| File | LOC | Why dead |
|------|-----|----------|
| `src/models/database/index.js` | ~256 | Never required; *throws* on require (missing model arg, orphan belongsTo). |
| `src/services/SessionManager.js` | ~475 | Never instantiated; references removed SubscriptionV2. |
| `src/models/UserSession.js` | ~197 | Only used by dead SessionManager; stale categories. |
| `src/services/AIService_new.js` | ~349 | Zero references. |
| `src/services/UsageSyncMonitor.js` | ~286 | Never scheduled/required; alert fn is a stub. |
| `src/models/database/UsageTracking.js` | ~148 | Superseded by UsageLimitV2. |
| `src/services/CSVReportService.js` | ~287 | No callers; Excel is the only live report path. |
| `src/services/CountryService.js` | ~182 | No callers found. |
| `src/models/database/SubscriptionV2.js` | ~163 | Read only by dead SessionManager. |
| `src/models/database/Referral.js` | ~129 | Schema only; referral flow never built. |
| `src/services/MenuHandler.js` | ~193 | Orphan duplicate of `handlers/MenuHandler.js`. |
| (partial) dead regex extractors in `OCRService.js`, `buildLegacyPrompt`/`extractRestaurantReceipt` in `AIService.js`, INR conversion machinery in `CurrencyConversionService.js`, `SafeUsageWrapper` atomic methods | — | Bypassed by live paths. |

**Total dead/orphaned: ~2,900+ LOC of whole files, plus large in-file dead sections.**

## Architectural debt (no quick fix)

- **God-objects:** `handlers/MenuHandler.js` (2,579 LOC) and `DocumentProcessingHandler.js` (1,153 LOC) mix routing, business logic, DB, Stripe, and copy.
- **Circular-dependency smell:** pervasive lazy `require()` inside methods to break handler↔handler cycles; handlers re-`new` each other per call instead of reusing singletons.
- **Three sources of truth for usage** (row counts / `usage_limits` / `users` counters) and **three for subscription state** (`users` / `subscriptions` / `subscription_history`) → divergence surface.
- **Duplicated limit/upgrade copy** across 3+ handlers.
- **No automated tests** (`npm test` = `exit 1`).

## Suggested triage order (if/when you decide to act)

1. 🔴 Security S1, S2, S3 — close the unauthenticated surface before any traffic growth.
2. 🔴 Billing B2, B3 — Stripe idempotency + don't 200 on failed activation (money correctness).
3. 🔴 Data D1, D2 — fix dropped-transaction + broken session expiry (silent prod breakage).
4. 🔴 Billing B1 — make the quota check atomic (re-wire the dead SafeUsageWrapper).
5. 🟠 D3 — converge on ExpenseV2, retire the Expense model + the dead `index.js`.
6. ⚪ Sweep dead code once the above are stable (one PR per cluster, grep-verified).

---

*Open questions the audit could not resolve from code alone are tracked at the end of each domain in the agent reports. Resolved since: **deployment is single-instance** (Railway `numReplicas: 1`, region europe-west4, verified 2026-05-25). Still open: Is the referral system planned or abandoned? Are the absent migration scripts (`run-migration.js`, `migrate-normalize-database.js`) removed or renamed? Why is a US-targeted product hosted in europe-west4?*
