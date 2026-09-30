---
title: wiring note for integration-reviewer (W1, gap-hunter REC-8)
author: Claude Opus 5.5 (phase 1 drafter)
date: 2026-09-27
status: pending
---

Redacted for the public repo: private course and work identifiers.

## What changed in the agent

`plugins/djinn/agents/integration-reviewer.md` gained:

- A Scope bullet, "Doc block tags and prose claims", after "Serialization and
  restore paths": truth of `@interacts`, `@deps` and `@rng` on every changed
  module and on the importers it already walks, and truth of prose claims
  about other code or repo state. Detection hints from the game repo's
  `docs/known-bugs/INDEX.md` entries "Stale doc block tags" (line 145) and "A
  prose claim goes stale" (line 158). A wrong tag or claim is LOW; it rises
  only when a decision in the diff relies on it, with the relying line cited.
  A tag in an unchanged file that the diff made false goes under Blast radius.
- An Ownership split bullet naming perf-reviewer (`@alloc`, `@complexity`),
  format-reviewer (mechanical, comment tone to security-reviewer) and
  known-bugchecker (cite its id, do not re-derive).
- The Severity LOW line now lists a stale `@interacts`, `@deps` or `@rng` tag
  and a false prose claim.

No frontmatter, tools, fence, output format or round 2 text changed.

## Scope membership and trigger

Unchanged. integration-reviewer already runs in every scope that spawns it.
No new trigger, no new fence pattern.

## What the dispatch must paste

Nothing new. The bullet reads `conventions_files` (whether the project uses
the tags, and whether its tags name importers) and the conventions file's
layout block, both already pasted.

## New config keys

None.

## CONTRACTS.md change

None required. Section 1's LOW bar already covers "a wrong comment".

## Neighbor edit: perf-reviewer.md

`plugins/djinn/agents/perf-reviewer.md:95` to `:98` currently reads:

> ... will trust the tag and skip the check. No other agent reads these tags.
> You have already traced the path, so you are the only thing that checks
> whether the tag is true.

Replace the two sentences after "skip the check." with this exact text:

> No other agent reads `@alloc` or `@complexity`: you have already traced the
> path, so you are the only thing that checks whether they are true. The other
> doc block tags, `@interacts`, `@deps` and `@rng`, belong to
> integration-reviewer, on every changed module whether or not it is on a hot
> path, so do not report them.

## Optional

- `integration-reviewer.md:3` description could append "and whether doc
  block tags and prose claims about other code are still true" so a human
  reading the agent list sees the lane. Left alone per the brief.
- gap-hunter's report line 76 ("`@interacts`, `@deps`, `@rng` by nobody") is
  closed by this change; the phase 2 writer need not edit the report.
