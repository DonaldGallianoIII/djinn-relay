---
title: wiring note, devils-advocate hunt item 6 (gap-hunter W2, REC-13)
author: Claude Opus 5.5 (phase 1 drafter)
date: 2026-09-27
status: pending
---

## What changed in the agent

`plugins/djinn/agents/devils-advocate.md` gains hunt item 6, "Changes outside
the task": every diff hunk no goal line accounts for, one finding per file,
each hunk with its line range and a one-line reason. LOW by default, MEDIUM
only when it changes behavior a user relies on and neither the goal nor any
commit message mentions it. With no goal statement it writes
`- Changes outside the task: skipped, no goal statement.` under Checked and
Clean. It also gains an Inputs bullet naming `input-diff.patch`, and the LOW
tier line names item 6.

## Scope membership and trigger

No change. The agent keeps its scopes (`full`, `perf`, the `project_notes`
unproven trigger, and custom lists that name it).

## What the dispatch must paste

Nothing new. `commands/review.md:121` already pastes
`Full patch: <AUDIT_DIR>/input-diff.patch` into every prompt, and
`commands/review.md:162` to `:166` already pass the goal statement. The agent
reads commit messages with `git log`, which its Runtime notes already allow.

## Config keys

None.

## CONTRACTS.md

No change needed. LOW default and a MEDIUM that names a mechanism and a traced
path both sit on the section 1 ladder as written.

## Neighbor lines

None required. Two notes for the phase 2 writer:

- `commands/review.md:164` to `:165`: the fallback text "no goal document;
  review the diff's own stated intent" is fine, but the item treats a goal
  inferred from the diff as no goal statement. If the writer wants the
  wording to match, change it to "no goal document; use the commit messages
  in the range as the goal statement".
- `commands/dispatch.md:195` to `:199`: the fixer scope leak check is per
  file. Item 6 is per hunk and names it as a separate lane, so no edit there.
  Open question, not a wiring item: when devils-advocate runs in a dispatch
  round, is its goal statement the landed briefs? Nothing passes them today,
  so item 6 there falls back to the commit messages.
