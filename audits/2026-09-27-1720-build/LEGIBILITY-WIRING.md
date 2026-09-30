---
title: legibility-reviewer wiring, applied from wiring/legibility-reviewer.md
author: Claude Opus 5.5 (wiring writer)
date: 2026-09-27
status: landed, unverified
---

Redacted for the public repo: private course and work identifiers.

# legibility-reviewer wiring

Source: `wiring/legibility-reviewer.md` in this folder, applied on top of the
fix pass in `audits/2026-09-27-1806-custom/fixes/FIX-REPORT.md`. Every spot
was found by its anchor text, not the note's line numbers. Paths are
relative to `plugins/djinn/`.

Nothing was run. Every edit went through the Edit or Write tool. No voice
check, no review round. Unverified until someone runs both.

## Changes by file

### commands/review.md
- Frontmatter usage: `"map"` added to the scope words.
- Step 1: `maps` added to the config keys read.
- Step 2: the `map` scope line after `ideas`, with why it has no
  known-bugchecker or consolidator, and that no conditional agent joins it.
- Step 2: the conditional sentence now reads "except ideas, live and map".
  The legibility-reviewer trigger added after live-system-reviewer's, with
  the four rules from the note. The checks read `fence.txt` and
  `tree-changes.txt` with Read; no path goes into a command line (D2). The
  README overlap with ux-reviewer is stated.
- Step 2: a custom list naming legibility-reviewer runs it in diff mode.
- Step 2 flags: `+ux` and `+a11y` are ignored in the `map` scope, and
  context.md says so.
- Step 3: item 4b for the `map` scope. The fence is `git ls-files` written
  to a file plus item 3's untracked list; the untracked stop still applies;
  the patch is still the merge-base diff. Item 5 fires in `map` only on an
  empty tree. Item 7 skips triggers in `ideas`, `live` and `map`, and builds
  `tree-changes.txt` in `$TMPDIR` before the trigger check.
- Step 4: `tree.txt` and `tree-changes.txt`, built from git's output and the
  list files only, paths and status letters only, no untracked content (D1).
  `tree-changes.txt` uses `git diff --name-status -M -C --diff-filter=ADRC`
  so git itself keeps only A, D, R and C lines, and untracked fenced files
  are appended as `A<TAB><path>` with Write. context.md gains a
  `tree_files:` line.
- Fence block: in the `map` scope a `SCOPE: map` line says pre-existing
  problems are findings, in place of the block's "do not report" sentence.
- Per-agent blocks: legibility-reviewer's paste (mode, tree file paths,
  `maps`, `data.generated`, integration-reviewer running or not, rule book
  through `conventions_files`).
- Step 5: skipped in the `map` scope, and Step 6's known-bugchecker sentence
  says so.
- Step 10: `map` verdict line wording; no new next-step branch.

### commands/dispatch.md
- Step 2: `maps` added to the keys read. `proof.lane_timeout_s` read for the
  landing lane; absent, the lane uses `timeout_s` and the plan says so.
- Step 5 plan: the Landing lane line names which timeout caps the suite, and
  the round line says triggered agents, legibility-reviewer among them, can
  join.
- Step 6 Snapshot: the first batch's `PRE` kept as `PRE_DISPATCH`.
- Step 7 item 2: the lane runs `timeout <lane timeout>`, the Bash tool
  timeout set above it.
- Step 7 item 3: the round's `tree.txt` and `tree-changes.txt`, the latter
  from `git diff --name-status -M -C --diff-filter=ADRC $PRE_DISPATCH` with
  the round fence fed through `xargs -0`. A `map` audit's rounds are diff
  mode on the landed work sets, never the whole tree.
- Step 7 item 4: legibility-reviewer joins a round when its trigger fires,
  whatever the first scope; in a `map` audit it always runs, in diff mode.
  Round prompts carry its block with `Mode: diff` and the round's tree
  files, and never the `SCOPE: map` line.
- Step 9 report: the Landing lane line names the timeout used.

### CONTRACTS.md
- Section 1: the legibility-reviewer tier bullet, after gate-auditor's.
  Checked against the current text: it agrees with "naming caps at LOW" and
  with the hard rule floor, which the agent says its no-numbers constraint
  does not trigger.
- Section 4: the `map` scope fence paragraph after the `live` one, plus that
  the untracked stop applies and untracked content stays out of the patch.
  A "Tree lists" paragraph for `tree.txt` and `tree-changes.txt`. Both added
  to the "not counted as outside-fence reads" list.
- Section 5: `maps` in the keys block after `goal_doc`, and its bullet in
  "What the optional blocks mean". `proof.lane_timeout_s` in the keys block
  (example value `none`, no figure invented) and a paragraph in the `proof`
  bullet: whole-suite lane timeout, absent means `timeout_s` and the plan
  says so, not a proof-runner key.

### templates/config.yaml
- `conventions_files`: the commented LEGIBILITY.md example.
- `maps: []` with its comment and examples, after `goal_doc`.
- `proof.lane_timeout_s: none` with its comment; the block comment now says
  which keys cap the landing lane.

### agents/integration-reviewer.md
- The "Prose claims" sub-bullet's last sentence replaced with the note's
  text: old paths of moved or deleted files, and the split with
  legibility-reviewer.

### agents/format-reviewer.md
- "NOT your job": the whole-tree view bullet. No size threshold added.

### agents/pipe-connector.md
- Owner list: `legibility-reviewer` for a mapped file that no layout block
  or index names. No size threshold added; the description still reads
  "unrelated concerns".

### agents/ux-reviewer.md
- "Not your job": the repo's own navigation docs bullet.

### agents/synthesis.md
- Inputs missing: legibility-reviewer added to its agent list.
- New "Mode and Tree" rule: one Coverage line; `Reader:` and `Misroutes:`
  kept with the finding; how to verify a legibility MEDIUM; size-only
  evidence dismissed; per-folder coverage in map mode, `not read:` folders
  not covered; the "expect integration-reviewer" merge.

### relay.md
- Scope table: `map` row. Conditional sentence: "but `ideas`, `live` and
  `map`", and legibility-reviewer's trigger in one line. Situation table:
  the `map` row.

### README.md
- Scopes block: `/djinn:review map`. Conditional paragraph: `map` added to
  the excluded scopes, legibility-reviewer to the list. A short `map`
  paragraph telling the owner to list LEGIBILITY.md and `maps`. The proof
  paragraph names `lane_timeout_s`. "What gets written where" gains the two
  tree files. The agents list gains legibility-reviewer.

## Choices the note did not settle

- `-C` beside `-M` in both `git diff --name-status` calls: without it git
  never prints a C line, and the note's rule names copies.
- `+ux` and `+a11y` are ignored in `map`, since the note says no
  conditional agent joins that scope.
- A `map` audit's dispatch rounds check the other conditional triggers like
  any round, because a rename can touch code, and skip known-bugchecker as
  round 1 did.
- `lane_timeout_s` shows `none` in the CONTRACTS example, not a figure: a
  made-up number there could pass the harness's maximum Bash timeout, the
  same reason no harness figure is written.

## Not done

- The game repo's `.djinn/config.yaml` does not list
  `~/Conventions/code/LEGIBILITY.md`. Outside this repo, and the note marks
  it for Donald. Until it is added, a first run there reports it under
  Inputs missing and marks every finding "rule book not supplied".
- Verification of any kind: no voice check, no review round over this
  wiring.

## Seen, not changed

- "a reason of five words or fewer" on outside-fence lines, in CONTRACTS.md
  section 3 and 4, review.md's fence block and most agents. A word count on
  a reason, pre-existing, not a line, file or token rule. Donald's call.
- review.md says `$TMPDIR` lists are moved into `AUDIT_DIR`, but its Rules
  Bash list has no `mv`. Pre-existing; the tree files inherit it.

## Sweep

Every touched file was grepped for em dashes and en dashes: none. For line,
length, token and size-rule wording: the only hits are the new "never cites
a line count" sentences, format-reviewer and pipe-connector's existing
"no line count" rules, and the five-words reason above.
