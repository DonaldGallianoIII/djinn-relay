# Djinn Review Relay — Methodology

Three-phase workflow: **audit → deliberate → dispatch**. Audit agents find issues, the orchestrator (main Claude + user) deliberates what to fix, then fixer agents execute each brief in isolation. Round 2 audits run automatically after fixes land.

## Phase 1 — Audit (`/djinn:review [scope]`)

Spawn review agents in parallel. Each reads the changed files and reports findings with severity ratings. They share a common prefix context (CLAUDE.md, project conventions, file list) for cache efficiency — only the per-agent system prompt varies.

When all agents return, synthesis merges reports, deduplicates, and produces a ranked fix list with a ship verdict.

**Output:** timestamped folder at `audits/YYYY-MM-DD-HHmm-<scope>/`:

```
audits/
  2026-04-20-1530-standard/
    agents/
      known-bugchecker.md
      format-reviewer.md
      bugs-reviewer.md
      integration-reviewer.md
      security-reviewer.md
      perf-reviewer.md
    synthesis.md
    input-diff.patch
```

**The audit phase ENDS here.** No code is modified. No fixes are spawned. You get reports.

## Phase 2 — Deliberate (human + orchestrator)

You (the user) and the main Claude Code conversation open the audit folder, read the synthesis, and decide for each finding:

- **fix** — worth doing now → generate a brief
- **defer** — real issue but not now → leave in synthesis as a note
- **dismiss** — not actually a problem → explain why in the conversation (and possibly in `bugs_to_avoid.md` so future audits don't re-flag)

For each "fix" decision, run `/djinn:brief <audit-folder> <finding-id>`. This generates a skeleton brief at `audits/<run>/fixes/<id>-<slug>.md` pre-filled from the finding.

You and the orchestrator fill in:

- **WHY** — the deliberation context, root-cause insight, why THIS fix and not a variant. This is the field that stops the fixer from fixing the symptom and missing the cause.
- **work_set** — exact files, exact symbols, exact scope boundary. Verified via `pipe-connector` analysis where available. This is the hard fence the fixer won't cross.

## Phase 3 — Dispatch (`/djinn:dispatch <brief>...`)

Dispatch takes one or more briefs and executes them.

**Dependency DAG.** Dispatch inspects each brief's `depends_on` plus implicit collisions:
- Symbol rename in A consumed in B → A → B
- File overlap between A and B → later depends on earlier
- Cycles → halt, ask user to resolve

**Batched execution.** Same-batch briefs have disjoint work-sets and no dependency edges — they run in parallel. Next batch waits for the prior to land.

**Fresh Opus per fix.** Each fixer is a fresh subagent at max effort. It gets: the brief, the referenced audit excerpts, and the current file state. No conversation baggage, no shared memory with other fixers.

**Work-set guard.** The brief's `work_set.files` is binding. If the fixer needs to touch a file outside it, it STOPS and reports `BLOCKED_SCOPE` with a proposed amended brief. The orchestrator decides whether to amend, skip, or abort — the fixer never silently expands.

**Diffs saved.** Each fix's diff is saved to `audits/<run>/fixes/<id>.diff`. The fixer's full report is saved to `audits/<run>/fixes/<id>-report.md`. The brief's `status` flips `pending → landed` (or `blocked-*`).

**Build gate.** After each batch, `npm run build` must pass before the next batch spawns. Build failure halts dispatch.

## Round 2 — Automatic audit on combined diff

After all briefs in a dispatch run land successfully, Round 2 fires automatically — no gate.

- Same agents as the original scope (read from audit folder name or synthesis)
- Scoped to the changed files only
- Instructions: verify each Round 1 HIGH/MEDIUM is resolved, catch new issues from the fixes, check blast radius for upstream/downstream impact

Reports land in `audits/<run>/round-2/agents/`. A fresh synthesis produces the Round 2 verdict at `audits/<run>/round-2/synthesis.md`.

Round 2 does **not** auto-fix. If it flags new issues, you decide: another `/djinn:brief` + `/djinn:dispatch` cycle, or ship with notes.

## Ship Criteria

- **SHIP** — Zero HIGH/MEDIUM/CRASH/CORRUPT in Round 2 synthesis
- **FIX THEN SHIP** — Blocking findings remain, run another brief + dispatch cycle
- **ESCALATE** — Findings ambiguous, or agents disagree — requires user judgment

**LOW items** — logged, never block shipping.
**FUTURE-HIGH/MEDIUM** — reported, never block shipping. Tracked as architectural debt in `bugs_to_avoid.md`.
**Max 3 rounds.** After round 3, stop and ask the user.

## Post-relay

Spawn `consolidator` (read-only) to analyze all findings across the run and propose additions to `bugs_to_avoid.md` for any new generalizable patterns. This is the learning loop — each relay should make future relays smarter.

## Agent Selection Guide

Not every change needs every agent. Use `/djinn:review [scope]`:

| Scope | Agents | When |
|-------|--------|------|
| `quick` | known-bugchecker, bugs, integration, synthesis | Small fixes, low-risk changes |
| `standard` | known-bugchecker, format, bugs, integration, security, perf, synthesis | Default for most work |
| `full` | known-bugchecker + all 9 review agents + consolidator | New features, critical systems, pre-release |
| `perf` | known-bugchecker, perf, breaker, synthesis | Hot-path changes, render loop, per-frame code |
| `ideas` | gap-hunter (standalone, no synthesis needed) | After a debugging session, new system design, feature spec |

**known-bugchecker** runs first in ALL scopes (fast Sonnet pass) against `bugs_to_avoid.md`. If it flags something, the heavier agents skip re-discovering it.

**pipe-connector** is invoked explicitly when a refactor is in play — before splitting a file > 500 lines, or when a rename would cascade across files. Not part of the default scopes — add it manually when needed: `/djinn:review full` includes it, or spawn standalone.

### Per change type:

| Change Type | Scope |
|------------|-------|
| New feature | standard or full |
| Bug fix | quick |
| Refactor / file split | full (use pipe-connector) |
| Critical system (save/load, auth, state) | full |
| UI-only change | quick |
| Pre-release | full |
| Render loop / per-frame code | perf |
| Post-debugging retrospective | ideas (gap-hunter) |

## Fix brief anatomy

```yaml
---
id: 01-rename-madeup
source: audits/.../agents/bugs-reviewer.md
severity: HIGH
status: pending | landed | blocked-scope | blocked-build | blocked-other
created: 2026-04-20
work_set:
  files:
    - src/terrain/HeightMap.ts
    - src/ui/Toolbar.ts
  symbols_renamed:
    - madeup → made
  symbols_touched:
    - HeightMap.applyStroke
depends_on: []
---

# WHAT
Rename `madeup()` → `made()` in HeightMap.ts and update all callers.

# WHY
From bugs-reviewer: "name shadows Babylon built-in, causes ambiguous autocomplete."
**Deliberation:** short form preferred over `madeValue` because neighbors `applied`/`committed` follow past-tense verb pattern.

# SUCCESS CRITERIA
- [ ] Zero `madeup` references in repo (grep)
- [ ] `npm run build` passes
- [ ] Callers in Toolbar.ts use `made()`

# REFERENCES
...
```

The `work_set` is the binding contract. Fixers treat it as fence, not suggestion.

## Commands reference

| Command | Phase | Purpose |
|---------|-------|---------|
| `/djinn:review [scope]` | 1 | Run audit, produce `audits/<run>/` folder, stop |
| `/djinn:brief <audit-folder> <finding-id>` | 2 | Generate skeleton fix brief from a finding |
| `/djinn:dispatch <brief> [<brief>...]` | 3 | Execute briefs in batches, auto-run Round 2 |

Orchestration (DAG building, batching, diff saving, Round 2 triggering) happens inside `/djinn:dispatch` — you don't manage it.

## Why this flow

The old flow ran audit → fix → verify in one shot. That worked for small cleanups but blurred two different kinds of work:

- **Audit** is cartographic and ideation-heavy. Many agents, many perspectives, best run fresh with no commitments.
- **Fix** is focused and execution-heavy. One agent, one scope, strict boundary, clean output.

Mixing them meant the main Claude carried audit context into fix work, which either slowed it down (too much noise) or caused scope creep (fixing things not in the brief). Splitting them:

- Gives each phase its own fresh-context opus
- Adds a human deliberation pause between find-and-fix (which is where cause-vs-symptom decisions happen)
- Makes scope enforcement a structural property of the fixer, not a plea in the prompt
- Saves every phase's artifacts as forensic files you can re-read weeks later

The cost is more ceremony. For typo-tier fixes, that's overhead. For anything else, the structure pays for itself.
