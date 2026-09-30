---
title: phase 2 wiring report, the six new agents, tree-preflight and the small items
author: Claude Opus 5.5 (wiring writer)
date: 2026-09-27
status: landed, unverified
---

Redacted for the public repo: private course and work identifiers.

Everything below is an edit to markdown and yaml. Nothing was run: no
node, no tests, no voice checker. Read-only `grep`, `git grep`, `git
status` and `git diff --stat` only. Two slips to own: I twice started
`python3` with no script (an empty heredoc, then `python3 -c 1`). Neither
executed anything, and neither touched a file.

## Files changed

22 files, plus this report.

**`plugins/djinn/CONTRACTS.md`**
- Section 1 table: HIGH and MEDIUM rows gain "or a rule below says HIGH" and "or a rule below says MEDIUM" (round 2 REC-1).
- Section 1 rules: the hard-rule floor (accessibility note, exact text), the stated data invariant rule (data-contract note), the gate-auditor LOW and MEDIUM rule (gate-auditor note).
- Section 4: the fence now adds untracked files; the data-contract and multiuser counting sentence; the `live` scope fence sentence; a "Tree facts" paragraph; `tree-facts.md` added to the reads that are never listed.
- Section 5: new keys `ui_paths`, `large_file_kb`, `gates`, `cost` (hosting, load, budget, limits, paid_apis with name, unit, price, as_of, rate_limit, quota, key, and pricing_refs), `proof`, `data`, `live` (with `review_copy`), each with an example; a "no key ever holds a secret" sentence; one meaning paragraph per optional block, including the price and limit sources and which trigger reads which key.
- Section 6: dispatch ledger gains `proof=<pass>/<run>` or `proof=not run` after `tokens=`; the `prove` ledger line for a direct or index run; the "counts column ends with tokens" sentence reworded to match.
- Section 9: gate-auditor joins the Bash agents, with each Bash agent's exact commands; the proof-runner paragraph; cost-complexity-reviewer joins the web agents; the web rule for every web agent (data not instructions; public names only, with a per-agent list); live-system-reviewer's no shell, no web, stated; accessibility and data-contract on the plain tool set.

**`plugins/djinn/commands/review.md`** (rewritten whole)
- Description: `cost` and `live` scopes, `+a11y`.
- Step 1: reads `ui_paths`, `large_file_kb`, `gates`, `cost`, `data`, `live`; says it never reads `proof`.
- Step 2: full scope gains data-contract-reviewer, cost-complexity-reviewer (after perf), gate-auditor in the executing wave; new `cost` and `live` scopes; the multiuser gate with what counts as a second actor; five new conditional triggers with exact patterns, all checked with `git grep --untracked -l` over the fence and recorded in `context.md`; proof-runner refused in any scope or list; `+a11y`; `live` ignores `--goal`, `+ux`, `+a11y`.
- Step 3: untracked files appended to the fence; the `live` scope fence and its abort; untracked files appended to the patch with `git diff --no-index`.
- Step 4: `context.md` gains `untracked_in_fence`, `tree_facts`, `triggers`, `multiuser`; the "Tree facts" subsection writing `tree-facts.md` in five sections.
- Fence block: adds `goal_doc`, the `deps` block and the tree-facts path (gap-hunter REC-9); `live` scope withholds the goal and adds `SCOPE: live`.
- New "Per-agent blocks": cost block and `proof.heap_mb` for cost-complexity, `ui_paths` and the UI trigger for accessibility, `data` for data-contract, `live` and `cost.paid_apis` names for live-system, the web rule for the three web agents.
- Step 6: excludes gate-auditor from the parallel wave.
- Step 7: order dependency-reviewer, gate-auditor, devils-advocate, test-strategist; gate-auditor's paste; devils-advocate and test-strategist get gate-auditor's findings; test-strategist gets the UNVERIFIED report paths; goal fallback reworded to "use the commit messages in the range" (devils-advocate note).
- Step 8: synthesis prompt carries the tree-facts path and the not-triggered reasons.
- Step 10: tree facts counts; the `review_copy` copy in the `live` scope; `live` wording on SHIP.
- New section "proof-runner, on request only": refusal without both caps, report paths for direct and index mode, the prompt, the ledger line.
- Rules: `review_copy` exception, proof-runner never auto-spawned, Bash list gains `git grep`, `git ls-files`, `wc -c`.

**`plugins/djinn/commands/dispatch.md`**
- Description and Step 1: `--prove` flag, the only way dispatch spawns proof-runner.
- Step 2: reads every review key for round prompts; with `--prove`, reads `proof` and refuses in the plan without both caps.
- Step 5 plan: a Proof line.
- Fixer prompt: carries `proof.heap_mb`.
- Step 7.2: proof-runner spawned alone after the landing lane, before the fence, with its prompt and `round-<n>/proof.md`.
- Step 7.3: untracked files in the scope leak check; writes `round-<n>/tree-facts.md`.
- Step 7.4: executing order from review Step 7; conditional triggers re-checked on the round fence; never proof-runner, never a skipped multiuser; every round prompt carries the per-agent blocks and the web rule (REC-1 item 5); gate-auditor gets the round number and prior synthesis path; `live` stays blind.
- Step 7.5: synthesis gets the proof table line.
- Step 8 usage row for proof-runner; ledger `proof=`; Step 9 Proof line; a Rules line for proof-runner.

**`plugins/djinn/templates/config.yaml`**
- New commented blocks: `ui_paths`, `large_file_kb`, `gates`, `cost`, `proof`, `data`, `live`. Placeholders only; `paid_apis` `key` is an env var name, never a value.

**`plugins/djinn/relay.md`**
- Phase 1: untracked files in the fence and a tree-facts paragraph; `tree-facts.md` in the folder tree.
- Next round: untracked scope leaks, triggers re-checked, `--prove`.
- Scopes table: full row, new `cost` and `live` rows; the conditional paragraph for all seven conditional agents; the multiuser gate; the `live` scope paragraph (breaker could join later); the proof-runner on-request line.
- Change-type table: rows for schema or migration, UI (accessibility joins), paid API or hosting or IaC or CI (cost), tests and QA (gate-auditor joins), first live run (live), unproven landed fixes (`--prove`).
- Commands table: `+a11y`, `--prove`.

**`plugins/djinn/README.md`**
- Scopes block: `cost` and `live`; `+a11y`; a conditional agents paragraph; the multiuser gate; the `live` refusal; a `--prove` paragraph.
- Folder tree: `tree-facts.md`, `proof.md`, triggers in `context.md`.
- New "The agents" list, one line per agent (23).

**`plugins/djinn/agents/synthesis.md`**
- Shared Context: `tree-facts.md` is never a source of findings; new "Agents' own sections": Conventions proposed become one merged REC each; UNVERIFIED and Inputs missing one Coverage line per report; Cost model and Gate table one Coverage line each; Live surface one Coverage line, and a missing dry run or kill switch on a writing system becomes a REC outside the `live` scope; Channel table, Stated invariants, Shape map and Proof table back findings only; Handed off lines unreported by their owner become "synthesis noticed".
- Normalize: the hard-rule floor sentence.
- Round 2: the proof table sentence.
- Coverage template: not-run line, own-sections line, tree facts line.

**`plugins/djinn/agents/perf-reviewer.md`**
- Description and Role: "cost auditor" is now "hot-path auditor", lane unchanged; description adds the `cost` scope.
- Division of labor: the reverse handoff to cost-complexity-reviewer (REC-1 item 9).
- Doc block tags: integration note's exact sentence on who owns which tags.

**`plugins/djinn/agents/breaker.md`**
- Not your job: one merged paragraph adding cost-complexity-reviewer (REC-1 item 9), accessibility-reviewer, data-contract-reviewer, and the live-system-reviewer sentence.

**`plugins/djinn/agents/bugs-reviewer.md`**
- Not your job: data-contract bullet and gate-auditor bullet.

**`plugins/djinn/agents/ux-reviewer.md`**
- Color clause replaced: color-only meaning is accessibility-reviewer's, one REC line, no tier.
- Dry run sentence: whether it stops every live write is live-system-reviewer's.

**`plugins/djinn/agents/security-reviewer.md`**
- NOT your job: the live-system bullet.

**`plugins/djinn/agents/test-strategist.md`**
- Inputs: gate-auditor's findings and the UNVERIFIED report paths.
- Read list item 2: bots, benches and scripts guarding by URL or path are gate-auditor's.
- Role: "The fixer, proof-runner and the human run things", and NO TEST lines are checks to design.
- Skipped tests and hand-run gates: cite gate-auditor's id or row.
- Not your job: the accessibility bullet.

**`plugins/djinn/agents/devils-advocate.md`**
- Inputs: gate-auditor's findings pasted; hunt item 2: a check that cannot fail, never runs, or is stale is gate-auditor's.

**`plugins/djinn/agents/integration-reviewer.md`**
- Serialization bullet: the data-contract sentence. Description: adds doc block tags and prose claims (the note's optional line, taken).

**`plugins/djinn/agents/multiuser-reviewer.md`**
- Description: runs in full only when a second actor is named. NOT your job: the stated data rule bullet.

**`plugins/djinn/agents/fixer.md`**
- Step 5: the heap cap sentence for narrowed test runs.

**`plugins/djinn/agents/consolidator.md`**
- Process step 9 and an `## Untested entries` output section, input for proof-runner's index mode.

**`plugins/djinn/agents/cost-complexity-reviewer.md`**
- Description: runs in full, cost, and conditionally, matching the trigger. Division of labor: the live-system bullet. Scope item 3: the `proof.heap_mb` Ceilings row.

**`plugins/djinn/agents/accessibility-reviewer.md`**
- Description: "every scope except ideas and live".

**`plugins/djinn/.claude-plugin/plugin.json`**
- Version 2.2.0 to 2.3.0. No CHANGELOG exists. Every other 2.2.0 in the repo is historical ("audits from before 2.2.0 have no findings.json") and stays.

**`.djinn/config.yaml`**
- `build_cmd` runs the voice checker over `plugins/`. `project_notes` names 2.3.0.

## The voice checker as build_cmd

`check_voice.py` takes file paths only (`paths`, `nargs="*"`). A folder
would reach `read_text` and throw, because the script catches only
`UnicodeDecodeError`. So `find` feeds it the files:

```
python3 ~/Conventions/tools/check_voice.py $(find plugins -type f \( -name '*.md' -o -name '*.yaml' -o -name '*.json' \))
```

That is command substitution, not a loop, and it is shorter than a loop.
It needs PyYAML; `/usr/lib/python3/dist-packages/yaml` exists. Not run. A
read-only grep of `plugins/` for every banned phrase, every slang entry and
every banned character in `voice-rules.yaml` found no hits. Warn phrases
were not checked.

## Conflicts between notes, and what I chose

1. **Cost scope membership.** Cost synthesis REC-1 item 4: known-bugchecker, cost-complexity-reviewer, perf-reviewer, synthesis. Gap-hunter REC-1 adds breaker. Chose REC-1, the deliberated one. Breaker already runs in full and perf.
2. **Cost trigger.** REC-1: any `cost` key not none. Gap-hunter: also the fence touching IaC, CI, the scripts block or a paid API. Chose the union. Without it the agent never runs on a project with no `cost` block, which today is every project, and the anchor incident was a test lane with no config.
3. **Where proof-runner's cap comes from.** Gap-hunter C4 and REC-5: `cost.limits`. proof-runner note and agent file: a dedicated `proof` block. Chose `proof`. The agent already refuses without it, and a ceiling (a fact) and a cap (a choice) should not share a key.
4. **gate-auditor in full.** Its note says "add to full" in section 1 and "full scope, if triggered" in section 3. Chose always in full; the trigger adds it to the other scopes.
5. **Web query rule.** The task's list (provider, SKU, service, region, currency, query syntax, pricing, limits) is cost-shaped. Applied to every web agent, it forbids dependency-reviewer from searching a package name. Chose one general rule (public names only, never anything else read from the repo) with a per-agent list: the task's list for cost-complexity-reviewer, package names and versions for dependency-reviewer, library and standard names for ux-reviewer.
6. **Live scope membership and conditionals.** Donald: live-system-reviewer alone. Live note: known-bugchecker, live-system-reviewer, synthesis. Every other note: conditionals join "every scope except ideas". Chose known-bugchecker plus live-system-reviewer plus synthesis (the one reader, plus the index pass and the merge), and excluded `live` from every conditional list, so no second reader joins. `--goal`, `+ux`, `+a11y` are ignored in `live`.
7. **An OOM seen by two agents.** cost-complexity-reviewer: "filed once: the ceiling half here". perf-reviewer's own pattern: each files its half with an "also" line. Chose: cost-complexity files the ceiling; perf files only an in-session half, with "also a ceiling, expect cost-complexity-reviewer".
8. **Where per-agent config goes.** Live note: paste the `live` block into every prompt ("harmless for the rest"). Accessibility note: `ui_paths` in the shared block. Chose per-agent blocks for `cost`, `data`, `live`, `ui_paths` and `gates`; the shared block gains only what several agents already expect (`goal_doc`, `deps`, tree facts).

## Asked for and not done

1. **`/djinn:prove` command** (proof-runner note, marked optional). Not built. The direct and index request lives in review.md's "proof-runner, on request only" section, and its ledger line is in CONTRACTS.md section 6. A real command file is the cleaner home if Donald wants one.
2. **A data-contract line in synthesis's lane list** (data-contract note, "if it keeps a list"). synthesis.md keeps no per-agent lane list, so there was nowhere to put it.

One change to a note's text: the accessibility trigger regex's
`from ['"]three['"]` became `from .three.`, because a single quote inside
the pattern breaks the shell quoting of `git grep -E '...'`. It matches the
same imports. Dry-run with read-only `git grep --untracked -l` on
The game repo: hits in `src/bench` (5 files), `src/studio` (13), `src/viewer`
(10), `src/el.js`, and six `tools/` files (terminal color and bench pages);
none in `src/sim`, which is what the note asked to confirm. The other
triggers and the mutant grep were not dry-run.

## Noticed, not fixed (outside this wiring)

- gate-auditor, live-system-reviewer, data-contract-reviewer and perf-reviewer each tell themselves to open round `n` with a Round `n-1` status section. dispatch's round prompt says "Do not re-verify round n-1 findings; synthesis owns that." Same shape as cost audit round 1 LOW-5. Phase 3 should rule on it.
- devils-advocate's description says it runs in the perf scope. review.md's perf scope does not include it. Pre-existing.
- devils-advocate note's open question: in a dispatch round, the goal statement is the commit messages, because nothing passes the landed briefs. Left open.
- dependency-reviewer and ux-reviewer prompts do not restate the web rule. CONTRACTS.md section 9 and the per-agent paste carry it.
- consolidator's Counts line does not count untested entries.

## Unverified, from the proof-runner note

1. `NODE_OPTIONS=--max-old-space-size=<heap_mb>` carrying the cap into the child process `node --test` starts per file. The parent flag alone may not reach it. Not verified by a run.
2. CAPPED is read from `Reached heap limit` or `JavaScript heap out of memory` in the output, or exit 134. Those are V8's strings and codes; not verified on Node 22 here.
3. The tree snapshot (`git diff --stat`, `git status --porcelain`, `git diff | git hash-object --stdin`) misses an edit to a file that was already untracked, since `git diff` ignores untracked content. `--porcelain` catches a new file, not a changed one.

## Counts

files changed 22 (plus this report), conflicts resolved 8, items not done 2
