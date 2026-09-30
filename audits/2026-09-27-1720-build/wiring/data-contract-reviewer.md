---
title: wiring note for data-contract-reviewer (candidate C6, gap-hunter REC-7)
author: Claude Opus 5.5 (phase 1 drafter, data-contract-reviewer)
date: 2026-09-27
status: agent output, not yet reviewed
---

Redacted for the public repo: private course and work identifiers.

Agent file: `plugins/djinn/agents/data-contract-reviewer.md`. Read only
(`Read, Grep, Glob, Write`), `model: opus`, runs in the parallel read-only
wave. It runs nothing, so it needs no place in the serial wave.

## 1. Scope membership

- **full**: add it to the first wave list in `commands/review.md` Step 2,
  beside integration-reviewer.
- **Conditional**, in every scope except ideas: add a bullet to the
  "Conditional agents" list in `commands/review.md` Step 2 (today at about
  `:44` to `:49`), text below.
- Not in quick, standard or perf by default; the trigger adds it there.
- Custom list works as is once the file exists.

Mirror the scope lines in `relay.md` and `README.md` wherever they list the
full scope's agents and the conditional agents.

## 2. Conditional trigger (exact text for review.md)

```
- **data-contract-reviewer** runs when the fence contains any of:
  - a path matching a glob in the config's `data.paths`, or a file named as
    a key or a value in `data.generated`;
  - a SQL file (`*.sql`), or any file under a directory named `migrations`,
    `migrate`, `alembic`, `db` or `schema`;
  - a file whose basename contains `schema`, `model`, `entity`,
    `serializ`, `validat`, `migration` or `fixture`, or ends in
    `.prisma`, `.proto` or `.schema.json`;
  - a path that `project_notes` names as a persisted format or a data
    folder (the orchestrator greps `project_notes` for each fenced path's
    top folder, for example `content/` or `db/`).
```

What it catches in the two known projects: the game repo's `src/sim/schema.js`
(basename `schema`), `content/**` (via `data.paths` or `project_notes`), and
`tools/build-registry.mjs` (via `data.generated`); the work repo's `db/**` (folder
`db`) and any `*.sql`.

## 3. What the dispatch pastes

The standard fence block from `review.md` Step 4, plus two additions to its
"Project config" lines:

```
  goal_doc: <path or none>
  data: <the config's data block verbatim, or none>
```

`project_notes` is already pasted and is where the stated invariants live
for the work repo, so nothing else is needed. (REC-9 of the gap-hunter report
already asks for `goal_doc` in the paste; this agent reads it too.)

## 4. New config keys (CONTRACTS.md section 5, optional block)

```yaml
data:                        # optional. Where data shapes live and what rules they keep.
  paths:                     # globs holding schemas, migrations, content, fixtures, saves
    - src/sim/schema.js
    - content/**
  invariants:                # stated rules about stored data, one per line
    - Every table carries tenant_id.
    - Money is integer cents.
  generated:                 # committed file: the tool that writes it
    content/registry.json: tools/build-registry.mjs
    content/bundle.json: tools/build-bundle.mjs
```

Meaning: `paths` feeds the trigger and the agent's search for stored
instances; `invariants` has the same standing as a rule stated in
`project_notes`; `generated` names the generator and its output so the agent
checks hand-kept keys and the trigger fires on either side. All three are
optional; the agent says `data block absent` under Inputs missing and works
from `project_notes`.

## 5. CONTRACTS.md changes it depends on

Section 5, add the block above after `deps:`, with the sentence:

> `data` is optional. data-contract-reviewer reads it; the review command
> reads `data.paths` and `data.generated` for that agent's trigger.

Section 4, add after "Going further requires a reason on the outside-fence
line.":

> data-contract-reviewer and multiuser-reviewer may count search hits
> anywhere in the repo without opening the files. data-contract-reviewer may
> open any file that writes, reads, validates, resolves or migrates a data
> shape the diff touches, with that role as its outside-fence reason.

Section 1, add to the Rules list:

> A data invariant stated in `project_notes`, `data.invariants` or a
> conventions file, broken by the diff, is a defect tiered on its impact
> (MEDIUM or HIGH), never DEBT. The same gap with no stated rule stays
> multiuser-reviewer's DEBT.

Section 9 needs no change: the agent uses the standard review agent tools.

## 6. Neighbor lines to change, so lanes do not overlap

Line numbers read on 2026-09-27; another drafter may have shifted them, so
each edit is anchored on quoted text.

- `plugins/djinn/agents/integration-reviewer.md:63` to `:66`, the
  "Serialization and restore paths" bullet. Append one sentence:
  "Whether the writer, the reader, the validator and the resolver agree on
  what that state means is data-contract-reviewer's; you check it is
  carried."
- `plugins/djinn/agents/multiuser-reviewer.md:103` to `:107`, "# NOT your
  job". Add a bullet:
  "- A data rule the project has stated (in `project_notes` or
  `data.invariants`, such as every table carrying tenant_id) that the diff
  breaks: data-contract-reviewer, as a defect. Yours is the DEBT where no
  such rule is stated."
- `plugins/djinn/agents/bugs-reviewer.md:66` to `:71`, "# Not your job". Add
  a bullet:
  "- A validator, resolver, setter, save path or load path that disagrees
  with another about what a stored or shipped data shape allows:
  data-contract-reviewer. You keep in-memory desync on one code path."
- `plugins/djinn/agents/breaker.md:69` to `:73`, "# Not your job". Add to
  the first paragraph's list: "or data-contract-reviewer (a validator and a
  resolver that disagree on input a normal writer already produces)".
- `plugins/djinn/agents/synthesis.md`: if it keeps a list of agents and
  their lanes for merging, add "data-contract-reviewer: disagreement between
  two sites that handle one data shape, and stated data invariants".
- `plugins/djinn/agents/known-bugchecker.md`: no change. It already runs the
  index, and the three shared entries this lane grew from stay there.

## 7. Not done here

No edit to CONTRACTS.md, `commands/*`, `relay.md`, `README.md`, or any other
agent. Nothing was run. The trigger globs are drafted from the two known
projects and have not been checked against a real fence.
