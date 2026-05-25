# Resume Protocol — text-expense

> **Read this file first when starting any session in this repo.**
>
> One section per active workstream ("thread"). Threads are independent —
> different goals, no shared assumptions. Most recently touched thread sits at the top.
>
> **End-of-session ritual:** the `managing-resume-protocol` skill handles
> updates. Triggers on "closing the session" / "wrap up" / "stopping here"
> via the global `~/.claude/hooks/closing-session.sh` (fires only in repos
> that have this file), or via `/managing-resume-protocol`, or proactively
> after a logical chunk commits. The skill enforces the 12 invariants and
> 18-question self-quiz below.
>
> **Don't duplicate doc content here** — point to it. This file is the
> router; `docs/` is the library.

---

**Always-true session context (don't repeat per thread):**
- **Read first:** `CLAUDE.md` (core-code protection rule) + `docs/PROJECT.md` (overview) + `docs/ops-runbook.md` (prod access/metrics). For any code change, also `docs/architecture.md` + `codebase-map.yaml` + `docs/tech-debt-register.md`.
- **Identity:** `git config user.email` must be `himathew206@gmail.com` (hithomas289 personal account). Remote: `hithomas289/Text-Expense-live`.
- **Branch model:** trunk-based on **`main`** (project override of the global "always dev" rule — see CLAUDE.md / memory). No feature branches; all threads share `main`. ⚠️ **INV-6 (thread slug = branch name) is waived by design** — trunk-based, so threads are named by workstream, not branch.
- **Push policy:** `main` auto-deploys to Railway (`triumphant-victory`). Commit freely; **push only on explicit "push"/"ship" instruction** — a push triggers a build/deploy. ⚠️ The most recent deploy (commit "d" by Divya) **FAILED**; prod is served by an earlier successful deploy — a push could surface that breakage.
- **CORE CODE is OFF LIMITS** unless the user says "touch core code". Safe to edit: `docs/*.md`, blog JSON in `frontend/data/blog/`, generated HTML, root `.md`/`.yaml`. `scripts/verify-safety.js` is a pre-commit gate that blocks protected files.
- **Prod DB:** Railway Postgres via public proxy (see `docs/ops-runbook.md` for connection + metric queries). Node+Sequelize only (no psql). SELECT-only unless approved.
- **Sister repos:** none.

---

## Invariants (the file MUST satisfy all of these — hard rules, not guidelines)

Every end-of-session update must leave the file in a state where ALL of
the following hold. If even one is false, the file is broken and the
next session's resume will be unreliable.

1. **Top thread = most recently touched.** Threads ordered by `Last touched` descending. No exceptions.
2. **Every thread has all 8 required fields:** Status · Last touched (ISO `YYYY-MM-DD`) · Branch (with local-only/pushed flag) · Last commit (full hash + subject) · Where it lives (route or inline) · What's done · What's next · Sanity checks.
3. **`Last commit` is the actual top of its branch.** Verify with `git log --oneline -1 <branch>` before declaring the update done. Stale hashes are the #1 way this file rots.
4. **`What's next` is ONE concrete chunk, not a list of intentions.** "Implement Step 7" is too vague. "Create `lib/.../foo.ex` with first failing test asserting X" is concrete. Zero ambiguity about the immediate action.
5. **Sanity checks are runnable as-is** — no `<placeholder>` syntax. If a check would fail today, the thread isn't done; update the expected output first.
6. **Thread slug = branch name.** ⚠️ **Waived in this repo** (trunk-based on `main`). Thread slug = workstream name instead. No ghost threads.
7. **`Where it lives` is non-empty.** Route to a folder (preferred when one exists) or list inline pointers. Never both.
8. **Finished threads move to Archived within the same session that finished them.** Don't leave a "done ✅" thread at the top.
9. **One archived line per finished thread.** Format: `YYYY-MM-DD <slug> — <one-line summary> · landed in <commit-hash>`. Keep 90 days max.
10. **No prose dumps.** If a thread needs more than ~30 lines, the excess belongs in a `docs/` file, not here.
11. **Open questions for the user are explicit.** Under a `**Open questions / decisions owed by user:**` heading on the thread.
12. **Project-rule status is current.** If a thread operates under invariants, each status line reflects today's reality.

---

## Self-quiz (a fresh agent should answer all of these in <60s using only this file + the routed docs)

If you cannot answer ANY of these without reading commit messages,
grepping code, or asking the user, the file has a gap. Fix the gap
before declaring the end-of-session update done.

**About the repo (always-true context above the threads):**
1. What does this repo do, in one sentence?
2. What's the branch model? Where do I cut feature branches from?
3. Whose git identity should I use, and how do I verify it?
4. Is this branch local-only or pushed? What's the push policy?
5. Are there sister repos I need to know about?

**About the active thread I'm resuming:**
6. Which thread is in-flight right now? What problem is it solving?
7. What's the next single concrete action? (file paths + commands)
8. What invariants must hold while I work (core-code rule, push policy, scope discipline)?
9. Are there open questions Ashish needs to answer BEFORE I touch code? If so, what?
10. Where does the full context live? What's the reading order?

**About state verification (before I write any code):**
11. What sanity-check commands should pass right now? What's the expected output for each?
12. What's the top commit on `main` — does it match `Last commit` in this file?
13. Is the working tree clean, or are there uncommitted/unpushed changes?
14. Is the current deploy healthy, and is local `main` ahead of the remote?

**About process / gotchas:**
15. What audits have happened? What did they find? What's still deferred?
16. What patterns am I supposed to follow / avoid in this repo specifically?
17. What's the commit-message style? (Co-authored-by footer allowed?)
18. What's the merge / deploy process when work completes?

---

## Active threads

### ▶ Thread: `codebase-documentation` — Anshin-style understanding docs from the multi-agent audit

**Status:** paused (audit complete + committed; awaiting push decision)
**Last touched:** 2026-05-25
**Branch:** `main` (local-only — committed, **NOT pushed**)
**Last commit:** `a48ab91 docs: add codebase understanding docs from multi-agent audit`

**Where it lives:**
- Docs: `docs/PROJECT.md`, `docs/architecture.md`, `codebase-map.yaml`, `docs/tech-debt-register.md`, `docs/ops-runbook.md`
- Memory: `~/.claude/.../memory/textexpense-codebase-docs.md` (summary + reality check)

**What's done:**
- Full read-only audit (5 domain agents) + adversarial verification (4 agents cross-checked vs source, Railway, prod DB). Docs written and 3 verifier-caught errors fixed (D3 enum was inverted, S5 mis-cited, index.js throw reason). Committed locally as `a48ab91`.

**What's next:**
- Decide whether to push `a48ab91` to `main` (triggers a Railway build — see push-policy warning; prior deploy "d" failed). If yes: `git push origin main` then watch the deploy. If no: leave local.

**Sanity checks before resuming:**
```
git branch --show-current
# expected: main

git log --oneline -1 a48ab91
# expected: a48ab91 docs: add codebase understanding docs from multi-agent audit
# (this thread's work; the resume-protocol wiring commit sits on top of it)

git status -s
# expected: only "?? docs/growth-strategy-2026-03-15.md" (pre-existing, intentionally uncommitted)

git rev-list --count origin/main..main
# expected: >=1 (local main ahead of remote — docs commit not pushed)
```

**Open questions / decisions owed by user:**
- **Push the docs commit to `main`?** (deploy-triggering — default is to hold per push policy)
- **Security fix (S1/S2/S3 in `docs/tech-debt-register.md`):** open unauthenticated debug endpoints + receipt-download IDOR + no WhatsApp webhook signature. This is the only act-now item regardless of traffic. Touching it needs an explicit **"touch core code"** go-ahead (it's `server.js`/`src/`). Not started.
- **Failed deploy:** investigate what commit "d" (Divya) contained and why its deploy failed? Prod currently runs an earlier deploy. Not started.

---

## Archived threads (last 90 days)

_(none yet)_

---

## Template for adding a new thread

```
### ▶ Thread: `<workstream-slug>` — <one-line description>

**Status:** <in-progress | paused | blocked-on-<who>>
**Last touched:** <YYYY-MM-DD>
**Branch:** `main` (<local-only | pushed>)
**Last commit:** `<short-hash> <subject>`

**Where it lives:**
- Code/Docs: <paths>   (or route to a dev/active/<slug>/ folder if one exists)

**What's done:** <1-3 sentences>

**What's next:** <the single concrete next chunk; file paths + commands>

**Sanity checks before resuming:**
\`\`\`
<2-5 commands that verify state matches this file>
\`\`\`

**Open questions / decisions owed by user:** <bullets if any>
```
