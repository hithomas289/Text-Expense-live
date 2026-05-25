# TextExpense — Architecture

> How the system works end-to-end. Companion to [`PROJECT.md`](./PROJECT.md) (what it is) and [`../codebase-map.yaml`](../codebase-map.yaml) (file index).
> Generated from a 5-agent codebase audit, **2026-05-25**.

---

## 1. High-level flow

```
WhatsApp user
    │  (image / pdf / text / button tap)
    ▼
Meta WhatsApp Cloud API  ──webhook POST──▶  server.js  /webhook
                                               │
                                               ▼
                                   WebhookController.handleIncomingMessage
                                     • parse webhook (WhatsAppService.parseWebhookMessage)
                                     • dedup (in-mem processedMessages, 5min TTL)
                                     • multi-image guard (in-mem imageUploads, 5s window)
                                               │
                                               ▼
                                   MessageRouterV3.routeMessage
                                     • load session (DatabaseSessionManager)
                                     • classify: image / document / interactive / text
                                     • parseCommand → handleDescriptiveCommand (switch)
                                     • OR handleStateSpecificInput (state machine)
                                               │
                ┌──────────────┬───────────────┼───────────────┬─────────────────┐
                ▼              ▼               ▼               ▼                 ▼
        DocumentProcessing  Confirmation   EditDetails      SaveReceipt        MenuHandler
           Handler           Handler        Handler          Handler         (god-object:
        (OCR/AI pipeline)  (display+save) (field edits)   (vault save)       menu/subs/report)
                │              │                                │                 │
                ▼              ▼                                ▼                 ▼
   OCRService → AIService   ExpenseV2 (expenses)        SavedReceipt        ExcelReportService
   MediaService → S3        UnifiedUsageService          + S3Service         StripeService
   SafeUsageWrapper         (quota)                                          UnifiedUsageService
                │
                ▼
          PostgreSQL  +  AWS S3
                │
                ▼
        WhatsAppService.sendMessage / sendInteractiveButtons / sendDocument  ──▶  user
```

The controller always returns `200 EVENT_RECEIVED` to Meta regardless of downstream success (prevents Meta retry storms — but also means downstream failures are invisible to the platform).

## 2. Layered design

| Layer | Modules | Responsibility |
|-------|---------|----------------|
| **Entry** | `server.js` | Express bootstrap, middleware (Helmet/CORS/rate-limit), route mounting, static file + report serving, lifecycle/shutdown, interval jobs |
| **Controllers** | `WebhookController`, `MessageRouterV3` | HTTP webhook handling, dedup, message classification + routing |
| **Handlers** | `handlers/*` | Conversational flow logic per domain (upload, confirm, edit, save, menu) |
| **Services** | `services/*` | Reusable capabilities: WhatsApp I/O, OCR, AI, S3, media, sessions, usage, currency, reports |
| **Payments** | `payments/*` | Stripe checkout + webhook event handling |
| **Models** | `models/database/*` | Sequelize models + associations + query helpers |
| **Jobs** | `jobs/*` | `CleanupPaymentFlags` (interval) |
| **Config/Utils** | `config/*`, `utils/*` | Env config, DB instance, command maps, file/price helpers |

## 3. The conversation state machine

State lives in **one `sessions` row per user** (`userId` is unique). The `Session` model defines 13 `USER_STATES`:

`IDLE`, `WAITING_FOR_IMAGE`*, `PROCESSING_IMAGE`*, `WAITING_FOR_CATEGORY`, `WAITING_FOR_CONFIRMATION`, `WAITING_FOR_MERCHANT_NAME`, `EDITING_DETAILS`, `GENERATING_REPORT`*, `WAITING_FOR_CURRENCY_SELECTION`*, `SAVING_RECEIPT`*, `WAITING_FOR_SAVE_CATEGORY`, `WAITING_FOR_CUSTOM_SAVE_CATEGORY`, `WAITING_FOR_RECEIPT_DESCRIPTION`

(*) = declared but never transitioned to by live code (dead states).

**How routing uses state:**
- `MessageRouterV3.getContextFromState(state, metadata)` maps `(state + metadata flags)` → a context key.
- That key indexes `NUMERIC_TO_COMMAND_MAPPING` in `config/commands.js`, translating a numeric reply ("2") into a descriptive command (`PROCESS_EXPENSE`).
- Descriptive commands avoid race conditions where a user taps an old button — interactive replies carry a `context.messageId` checked against the session's stored `latestMessageId` (`isOldButtonClick`).

**State is written via** `DatabaseSessionManager.updateUserState()` / `Session.updateState()`, with `currentReceipt` (JSONB) holding the in-progress receipt and a mirrored backup in `metadata.currentReceipt`.

> ⚠️ Metadata is sometimes double-nested (`metadata.metadata.X`), and `getContextFromState` reads both — a fragility source. See tech-debt register.

## 4. The receipt processing pipeline

Implemented in `DocumentProcessingHandler.processReceiptForExpenseTracking`:

1. **Upload** — immediate ack → `SafeUsageWrapper.validateCanProcess` (quota pre-check) → conflict check → `MediaService.downloadAndSaveMedia` (local temp file, 60-min cleanup scheduled). **No OCR yet** — user first chooses *"Scan Expense"* vs *"Save It"*.
2. **OCR** (on "Scan Expense") — `OCRService.processReceiptImage`:
   - PDF → `pdf-parse`; if <10 chars → `pdf2pic` @300dpi → image OCR.
   - Image → Google Vision (`textDetection`) → Tesseract fallback → mock text fallback.
3. **AI extraction** — `AIService.extractReceiptData`: OCR text → `buildExtractionPrompt` → OpenAI `gpt-4o-mini` → `parseAIResponse` → fixed JSON schema (`invoiceNumber, date, merchant, subtotal, tax, miscellaneous, totalAmount, confidence, currency`). Falls back to regex `basicExtraction` on parse error.
4. **Compress** — `MediaService.compressImageAfterOCR` (Sharp, resize ≤1920px, JPEG q75). Runs *after* OCR.
5. **Duplicate check** — `checkForDuplicateInvoice` queries `ExpenseV2` by `userId + invoiceNumber`.
6. **S3 upload** — `S3Service.uploadReceiptFile` (best-effort; errors swallowed).
7. **Categorize** — AI category → `WAITING_FOR_CONFIRMATION`; else `WAITING_FOR_CATEGORY` (`CategoryHandler`).
8. **Confirm + persist** — `ConfirmationHandler.saveExpense` writes to `expenses` (via `ExpenseV2`) and increments usage in one transaction.

**Confidence note:** Google Vision confidence is *hardcoded* (0.85/0.9); `overallConfidence = max(ocr, ai)`, so it's almost always ≥0.9 and does not reflect real quality.

## 5. Sessions & concurrency

Three live session artifacts (and two dead ones — see drift):

| Component | Role |
|-----------|------|
| `Session` model (`sessions` table) | **Authoritative** conversation state (1 row/user) |
| `DatabaseSessionManager` | The live manager — reads/writes the row inside Sequelize transactions with `LOCK.UPDATE` |
| `SessionLockManager` | In-process advisory mutex keyed `session_<phone>` (polls 100ms ×100, then force-releases) |

**Two locking layers:** app-level in-memory mutex + DB row-level `SELECT … FOR UPDATE`.

> ⚠️ The in-memory lock is **per-process only** — no protection across multiple Railway replicas. *(Deployment is verified single-instance — `numReplicas: 1`, region europe-west4, as of 2026-05-25 — so this is currently safe but becomes a hard bug the moment replicas scale.)* And `DatabaseSessionManager` passes `{ transaction }` to `User.getOrCreate(phoneNumber)`, which takes one arg, so the User side runs outside the transaction. See tech-debt register.

## 6. Data model (ERD)

All FKs → `users.id` (UUID), `onDelete: CASCADE`. Columns are camelCase → must be double-quoted in raw SQL.

```
users (UUID PK)
  ├─ phoneNumber (uniq), planType ENUM(trial/free/lite/pro), stripeCustomerId,
  │  referralCode, referredBy→users.id, usage counters, billingCycle*, metadata JSONB
  ├──1:1── sessions (userId uniq) ── state, currentReceipt JSONB, metadata JSONB
  ├──1:N── expenses (ExpenseV2) ── merchant, amounts, category, s3 fields, invoiceNumber, planType
  ├──1:N── saved_receipts (INTEGER PK, paranoid) ── category, s3Key, isActive, planType
  ├──1:N── usage_limits (UsageLimitV2) ── totalReceipts, receiptsLimit, bonus fields
  └──1:N── generated_reports ── reportType, date range, fileUrl, expiresAt (7d)
```

**Legacy/dead tables** (referenced only by dead `index.js`): `Expense`, `usage_tracking`, `document_uploads`, `referrals`, `subscription_history`, `subscriptions` (SubscriptionV2).

> ⚠️ `Expense` and `ExpenseV2` **map to the same `expenses` table** with conflicting status ENUMs (`draft/confirmed/deleted` vs `draft`) and `expenseDate` types (`DATEONLY` vs `STRING(50)`). `ExpenseV2` is current.

**Model loading:** one shared `Sequelize` instance (`config/database.js`); models self-register on require; `indexV2.js` is the live association map (`index.js` is dead *and throws* on require). Schema is `sequelize.sync({ force:false, alter:false })` (create-only) + a boot-time self-healing migration (`migrate-expensedate.js`). **No formal migration framework.**

## 7. Billing & usage

**Plans:** `trial` (env `TRIAL_RECEIPT_LIMIT`, default 5, all-time), `free` (hardcoded 0), `lite` (env, ~6), `pro` (env, default 25), plus transient `canceling`. Env vars are the **single source of truth** for limits; `PlanConfig` table values are overridden by env in every getter (display-only).

**Quota engine:** `UnifiedUsageService.canProcessReceipt` is the live gate — it **counts actual rows** in `expenses` + `saved_receipts` within the billing cycle rather than trusting counters. The `users.receiptsUsed*` and `usage_limits` counters are written but **not read** for decisions (denormalized caches).

**Why so many usage modules:** `UnifiedUsageService` (live, row-counting) ← `SafeUsageWrapper` (atomic tx wrapper — *atomic methods are dead, only `validateCanProcess` is used*) ← `UsageSyncMonitor` (drift auditor — *entirely dead, never scheduled*). Plus the dead `UsageTracking` model. Net: **one decision-maker, three redundant bookkeeping systems**.

**Stripe:** `StripeService.createCheckoutSession` (dynamic USD `price_data`, subscription mode, 3DS forced, cancels old sub on plan switch) → `PaymentController.handleWebhook` (signature-verified) dispatches `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_succeeded` (the real activation gate), `invoice.payment_failed`. Plan state is stored on the `users` row. `CleanupPaymentFlags` job clears stuck `paymentInProgress` flags every 15 min.

> ⚠️ Webhook handlers have **no idempotency/replay protection** beyond one row-lock, and the dispatcher swallows per-event errors then returns 200 — a failed activation during a payment event is silently lost. Quota check is **non-atomic (TOCTOU)** — concurrent uploads can exceed quota. See tech-debt register.

## 8. Reporting

`MenuHandler` → `ExcelReportService.generateReceiptReport(receipts, phone, period)` → multi-sheet `.xlsx` (Summary, processed expenses, vault, monthly + category breakdowns) with S3 proxy-URL hyperlinks to receipt images → written to `./reports/<file>` → delivered as `${BASE_URL}/reports/<file>` via `WhatsAppService.sendDocument`. **Excel is the only live format;** `CSVReportService` is dead.

## 9. Background jobs (interval-based, started in `server.js`)

| Job | Interval | Purpose |
|-----|----------|---------|
| `FileCleanupManager` | 4h | Reap orphaned/old files in `uploads/` |
| `DatabaseSessionManager` cleanup | 10min | Session notifications, expired-session + 24h-receipt cleanup |
| `CleanupPaymentFlags` | 15min | Clear stuck `paymentInProgress` flags |
| per-file `scheduleFileCleanup` | 60min | Delete orphaned uploaded file |

> ⚠️ `DatabaseSessionManager`'s 24h and 30-min cleanups call a non-existent `updateUserState` method / write a non-existent `userState` column — sessions are not actually reset to idle on expiry. See tech-debt register.

## 10. Security posture

- ✅ Stripe webhook signature verified (`constructEvent` on raw buffer).
- ✅ S3: private ACL, AES256, path-traversal filename checks, 10MB cap.
- ✅ Helmet + CORS + rate-limit on `/webhook`.
- ❌ **No WhatsApp webhook signature verification** (no `X-Hub-Signature-256` HMAC) — POST `/webhook` trusts any caller.
- ❌ **Open, unauthenticated debug/admin endpoints** in `server.js` (`/debug/env`, `/debug/database`, `/fix-plantypes`, `POST /debug/fix-counts`, `/receipt-download/:encodedKey` IDOR).
- ❌ OCR text concatenated raw into AI prompt (prompt-injection surface, bounded by JSON schema).
- ❌ PII (receipt contents, phone numbers) logged to console and stored in S3 object metadata.

See [`tech-debt-register.md`](./tech-debt-register.md) §Security for severity and remediation notes.
