---
title: wiring note for live-system-reviewer (candidate C5, gap-hunter REC-6)
author: Claude Opus 5.5 (phase 1 drafter, live-system-reviewer)
date: 2026-09-27
status: agent output, not yet reviewed
---

Agent file: `plugins/djinn/agents/live-system-reviewer.md`. Read only
(`Read, Grep, Glob, Write`), no Bash, no web. It runs in the parallel
read-only wave (review.md Step 6) with the others. Nothing below has been
applied.

## 1. Scope membership

- Not in quick, standard, full or perf by default. It joins them only
  through the conditional trigger in section 2.
- New scope `live`, on demand, in `commands/review.md` Step 2 scopes list:

  ```
  - **live**: known-bugchecker, live-system-reviewer, synthesis. The blind
    review before a first live run (`workflow/REVIEW.md`). The fence is the
    whole tool (see Step 3), not a diff.
  ```

- Update the `description:` line of `commands/review.md` to list `live`
  among the scope words.
- `relay.md` and `README.md` scope tables gain the `live` row with the same
  text.

## 2. Conditional trigger

Add to the "Conditional agents, added to every scope except ideas" list in
`commands/review.md` Step 2:

```
- **live-system-reviewer** runs when the fence contains any of:
  a content script (a path listed under `content_scripts` in a
  `manifest.json`, or a file under a directory named `content` or
  `content-scripts` beside a `manifest.json`); a file outside `qa/` and
  `tests/` that imports or requires `playwright`, `@playwright/test`,
  `puppeteer`, `selenium`, `selenium-webdriver`, `webdriverio`, or calls
  `chrome.scripting`, `webContents.executeJavaScript`, or
  `executeScript(`; a file that names a `cost.paid_apis` entry's `key`
  env var or `name`; a file under any `live.systems[].code` path; or a file
  containing any `live.systems[].match` string. The orchestrator checks
  the import and name patterns with `git grep -l` over the fence only.
```

`git grep -l -e <pattern> -- <fence files>` is read-only and is already in
the Bash the orchestrator holds for git queries.

## 3. The `live` scope's fence (Step 3)

Add to Step 3 of `commands/review.md`:

```
For the `live` scope, the fence is every tracked file under the paths in
`live.systems[].code` (`git ls-files -- <paths>`), plus the diff fence
computed above. If the config has no `live` block, stop, append the ledger
line with outcome `ABORTED step 3: live scope needs live.systems`, and tell
the user to add it.
```

## 4. What the dispatch pastes

Into the fence block's "Project config" list, for this agent (and harmless
for the rest):

```
  live: <the config's live block verbatim, or none>
  cost.paid_apis: <names and key env var names only, or none>
```

For the `live` scope only, the dispatch:

- adds the line `SCOPE: live. Blind review before a first live run.`,
- does NOT paste `goal_doc`, `--goal`, plans, or any summary of the
  author's intent. `workflow/REVIEW.md:5` to `:7`: "a fresh agent with no
  conversation context reads the code cold, with environment facts but
  none of the author's reasoning". The agent is told to ignore one if
  pasted, but the orchestrator should not paste it.

## 5. New config keys

Add to `CONTRACTS.md` section 5 and `templates/config.yaml`:

```yaml
live:                          # optional. Real systems the code acts on.
  systems:
    - name: pantry portal      # what the owner calls it
      kind: portal             # portal | api | database | machine
      writes: true             # true if the tool creates or changes records there
      code: [desktop/src/main/automation.ts]   # files or dirs that act on it
      match: [portal.example.org]              # hostnames, URL prefixes or client
                                               # names that mark a file as touching it
      dry_run: --dry-run       # how the tool runs without writing, or none
      kill_switch: STOP file in the run folder # how a run is stopped, or none
      first_live_run: none     # date of the first live run, or none
      dom_map: docs/dom-map.md # dated capture map selectors come from, or none
  review_copy: _FromClaude     # optional. Where the live scope report is also copied
```

Meaning of `review_copy`: `workflow/REVIEW.md:8` puts the blind review at
`_FromClaude/<name>-review-<date>.md`. When set, review.md Step 10 for the
`live` scope copies `<AUDIT_DIR>/agents/live-system-reviewer.md` there as
`<review_copy>/<system name, lowercase with hyphens>-review-<YYYY-MM-DD>.md`.
The agent still writes exactly one file (CONTRACTS.md section 9); the copy
is the orchestrator's.

It reads `cost.paid_apis` (`name`, `key`), which REC-1's wiring for
cost-complexity-reviewer adds to CONTRACTS.md section 5. If that lands under
another shape, the trigger in section 2 follows it. Without it, the trigger
still works from `live.systems` and the import patterns.

## 6. CONTRACTS.md changes it depends on

- Section 4, after "The dependency walk is bounded ...", add: "In the
  `live` scope the fence is every tracked file under `live.systems[].code`
  plus the diff, because a blind review reads the whole tool; pre-existing
  problems in those files are findings in that scope."
- Section 5: the `live` block above.
- Section 1 rules list, no change needed. The agent's `MEDIUM (BLIND FIRST
  RUN)` for a missing dry run and kill switch in the `live` scope names a
  traced path (entry point to write call), so it meets the existing bar.

## 7. Neighbor lines to change so lanes do not overlap

- `plugins/djinn/agents/cost-complexity-reviewer.md`, Division of labor
  list after line 42 (the security-reviewer bullet), add:
  "- live-system-reviewer owns whether a record exists, exactly once, after
  a retry or resume against a live system. You own what the re-buy costs.
  A line that is both is filed once: the bill here, with "also a duplicate
  record, expect live-system-reviewer"."
  (The live agent files the record half with "also a bill, expect
  cost-complexity-reviewer"; synthesis merges on the file:line.)
- `plugins/djinn/agents/breaker.md:71` to `:74`, "Not your job", append to
  the paragraph: "Ordinary use of a page or API the project does not own (a
  lagging page, a re-render, a refused save, a crash between a provider's
  answer and the save) belongs to live-system-reviewer when it runs."
- `plugins/djinn/agents/ux-reviewer.md:92`, replace the last sentence with:
  "No dry run or validate mode on a command that mutates state. Whether the
  dry run actually stops every write to a live system is
  live-system-reviewer's."
- `plugins/djinn/agents/security-reviewer.md`, "NOT your job" list (after
  line 97, the Breaker bullet), add: "- Waits, anchors, save proof, caps,
  buffers and resume against a third-party page or live API:
  live-system-reviewer. Wildcard CORS on a loopback server stays yours; it
  hands that off to you."
- `plugins/djinn/agents/synthesis.md`: no change, provided its expected
  agent list comes from the dispatch prompt.

## 8. Not wired, for the owner to decide

- Whether `live` should also run breaker. The blind review in
  `REVIEW.md:3` is one fresh reader, so this draft keeps the scope to one
  agent plus known-bugchecker and synthesis.
- known-bugchecker already matches the twelve "Driving a third-party page"
  entries when the project's index links `code/KNOWN-BUGS.md`; this agent
  cites those ids rather than re-deriving them.
