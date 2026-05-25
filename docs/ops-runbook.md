# TextExpense Ops Runbook

Operational playbook for running, measuring, and debugging TextExpense in production.
First stop for any "how do I…" question.

---

## Environment

- **Railway project:** `triumphant-victory`
- **Services:** `TextExpense` (app), `Postgres` (DB)
- **GitHub:** `hithomas289/Text-Expense-live`
- **Git branch:** `main` (project override — NOT `dev`)
- **Target market:** US freelancers/gig workers

## Production DB Access

Railway Postgres, reachable via public proxy:

- Host: `tramway.proxy.rlwy.net`
- Port: `35966`
- DB: `railway`, User: `postgres`
- Password: pull live from `railway variables --service Postgres --kv | grep PGPASSWORD`
- SSL required: `{ ssl: { rejectUnauthorized: false } }`

**Method:** Node + Sequelize from `/Users/ashish/text-expense/` (node_modules already installed).
No `psql` on this machine. Skip Railway MCP for simple queries.

**Boilerplate:**
```js
const {Sequelize} = require('sequelize');
const s = new Sequelize('railway','postgres','<PGPASSWORD>',{
  host:'tramway.proxy.rlwy.net', port:35966,
  dialect:'postgres', logging:false,
  dialectOptions:{ ssl:{ rejectUnauthorized:false }}
});
```

## Schema (public)

| Table | Purpose |
|-------|---------|
| `users` | phoneNumber, planType, createdAt, isActive, referralCode, billing fields |
| `expenses` | Processed receipts (OCR'd). userId, totalAmount, ocrConfidenceScore, processingTimeSeconds, isDuplicate, status |
| `saved_receipts` | Stored-only uploads (no OCR). Soft-deleted via `deletedAt` |
| `usage_limits` | Per-user plan quotas |
| `generated_reports` | User-exported reports |
| `sessions` | Auth/session state |
| `subscription_history` | Plan change log |

Column names are **camelCase** and must be quoted in SQL: `"createdAt"`, `"userId"`, `"planType"`, `"deletedAt"`, `"isActive"`.

---

## Metrics That Matter

Run these on request. If user asks "how are we doing", run the **Activation Dashboard** first.

### 1. Activation (PRIMARY — the bleeding wound)

```sql
-- Signup → first receipt upload rate
SELECT
  COUNT(DISTINCT u.id)::int AS total_users,
  COUNT(DISTINCT e."userId")::int AS users_with_expense,
  ROUND(100.0 * COUNT(DISTINCT e."userId") / NULLIF(COUNT(DISTINCT u.id),0), 1) AS activation_pct
FROM users u
LEFT JOIN expenses e ON e."userId" = u.id;

-- Distribution of upload counts
SELECT bucket, COUNT(*)::int AS users FROM (
  SELECT u.id, COUNT(e.id) AS c,
    CASE WHEN COUNT(e.id)=0 THEN '0'
         WHEN COUNT(e.id)=1 THEN '1'
         WHEN COUNT(e.id)<=5 THEN '2-5'
         WHEN COUNT(e.id)<=20 THEN '6-20'
         ELSE '20+' END AS bucket
  FROM users u LEFT JOIN expenses e ON e."userId"=u.id
  GROUP BY u.id
) x GROUP BY bucket ORDER BY bucket;

-- Time-to-first-receipt (median hours)
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (first - u."createdAt"))/3600) AS median_hours
FROM users u
JOIN (SELECT "userId", MIN("createdAt") AS first FROM expenses GROUP BY "userId") e ON e."userId"=u.id;
```

### 2. User totals + plan mix

```sql
SELECT
  COUNT(*)::int AS total,
  COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '7 days')::int AS last_7d,
  COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '30 days')::int AS last_30d,
  COUNT(*) FILTER (WHERE "isActive" = true)::int AS active
FROM users;

SELECT "planType", COUNT(*)::int AS n FROM users GROUP BY "planType";
```

### 3. Retention (D1 / D7 / D30)

```sql
-- % of signups who uploaded a receipt on day N after signup
WITH cohort AS (
  SELECT u.id, u."createdAt"::date AS signup_date FROM users u
)
SELECT
  COUNT(DISTINCT c.id) FILTER (WHERE e."createdAt"::date = c.signup_date)::int AS d0,
  COUNT(DISTINCT c.id) FILTER (WHERE e."createdAt"::date = c.signup_date + 1)::int AS d1,
  COUNT(DISTINCT c.id) FILTER (WHERE e."createdAt"::date BETWEEN c.signup_date + 1 AND c.signup_date + 7)::int AS w1,
  COUNT(DISTINCT c.id) FILTER (WHERE e."createdAt"::date BETWEEN c.signup_date + 8 AND c.signup_date + 30)::int AS w2_4
FROM cohort c LEFT JOIN expenses e ON e."userId" = c.id;

-- WAU
SELECT COUNT(DISTINCT "userId")::int AS wau
FROM expenses WHERE "createdAt" > NOW() - INTERVAL '7 days';
```

### 4. Monetization

```sql
-- Trial → paid conversion
SELECT
  COUNT(*) FILTER (WHERE "planType" = 'trial')::int AS trials,
  COUNT(*) FILTER (WHERE "planType" IN ('pro','premium'))::int AS paid,
  ROUND(100.0 * COUNT(*) FILTER (WHERE "planType" IN ('pro','premium'))
        / NULLIF(COUNT(*) FILTER (WHERE "planType" != 'free'),0), 2) AS conversion_pct
FROM users;

-- Paid users detail
SELECT "phoneNumber", "planType", "subscriptionStatus", "planUpgradedAt", "billingCycleEnd"
FROM users WHERE "planType" NOT IN ('free','trial') OR "planType" IS NULL;
```

### 5. Product quality

```sql
-- OCR confidence distribution
SELECT
  ROUND(AVG("ocrConfidenceScore")::numeric, 3) AS avg_conf,
  COUNT(*) FILTER (WHERE "ocrConfidenceScore" < 0.7)::int AS low_conf,
  COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
  COUNT(*) FILTER (WHERE "isDuplicate" = true)::int AS dupes,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "processingTimeSeconds") AS p50_sec,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "processingTimeSeconds") AS p95_sec
FROM expenses;

-- Manual correction rate (users editing AI extractions)
SELECT COUNT(*) FILTER (WHERE "manualCorrections" IS NOT NULL AND "manualCorrections"::text != '{}')::int AS corrected,
       COUNT(*)::int AS total
FROM expenses;
```

### 6. Growth & geography

```sql
-- Geographic breakdown (confirm US traction vs random global)
SELECT "countryCode", "countryName", COUNT(*)::int AS users
FROM users GROUP BY "countryCode","countryName" ORDER BY users DESC;

-- Referrals
SELECT COUNT(*) FILTER (WHERE "referredBy" IS NOT NULL)::int AS referred,
       COUNT(DISTINCT "referredBy")::int AS referrers
FROM users;

-- Signups per day last 30d
SELECT "createdAt"::date AS day, COUNT(*)::int AS signups
FROM users WHERE "createdAt" > NOW() - INTERVAL '30 days'
GROUP BY day ORDER BY day;
```

### 7. Receipts uploaded (composite)

```sql
SELECT
  (SELECT COUNT(*) FROM expenses)::int AS expenses_total,
  (SELECT COUNT(DISTINCT "userId") FROM expenses)::int AS expense_uploaders,
  (SELECT COUNT(*) FROM expenses WHERE "createdAt" > NOW() - INTERVAL '7 days')::int AS expenses_7d,
  (SELECT COUNT(*) FROM expenses WHERE "createdAt" > NOW() - INTERVAL '30 days')::int AS expenses_30d,
  (SELECT COUNT(*) FROM saved_receipts WHERE "deletedAt" IS NULL)::int AS saved_total,
  (SELECT COUNT(DISTINCT "userId") FROM saved_receipts WHERE "deletedAt" IS NULL)::int AS saved_uploaders;
```

---

## Standard Dashboard ("how are we doing")

When user asks for a status check, run this set in order and report:

1. **User totals + plan mix** (section 2)
2. **Activation rate + distribution** (section 1)
3. **Receipts uploaded composite** (section 7)
4. **Geography** (section 6) — confirm US vs global
5. **Trial → paid conversion** (section 4)
6. Flag any anomaly (0 uploads in 7d, crashed trial conversion, etc.)

---

## Rules & Guardrails

- **Core code is OFF LIMITS** unless user says "touch core code". Safe to edit: JSON data files + generated HTML only.
- Git branch is `main` — NOT `dev` (project override of global rule).
- Never run destructive SQL (`DELETE`, `TRUNCATE`, `DROP`) without explicit approval. Bash hook blocks the obvious cases; still sanity-check every write query.
- See `CLAUDE.md` and `RULES.md` in project root for the full rule set.

## Related Files

- Project rules → `/Users/ashish/text-expense/CLAUDE.md`
- **Codebase understanding (audit 2026-05-25):**
  - Project overview → `/Users/ashish/text-expense/docs/PROJECT.md`
  - Architecture → `/Users/ashish/text-expense/docs/architecture.md`
  - File-by-file map → `/Users/ashish/text-expense/codebase-map.yaml`
  - Tech-debt & risk register → `/Users/ashish/text-expense/docs/tech-debt-register.md`
- Growth strategy → `/Users/ashish/text-expense/docs/growth-strategy-2026-03-15.md`
- Content system → `/Users/ashish/text-expense/docs/FRONTEND_GUIDE.md`
- Quick rules → `/Users/ashish/text-expense/docs/reference/QUICK_RULES.md`
