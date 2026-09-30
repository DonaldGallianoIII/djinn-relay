---
title: devils-advocate report, audits/2026-09-27-1806-custom
author: Claude Opus 5.5 (devils-advocate)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Findings

### HIGH
HIGH-1 (SABOTAGES THE GOAL). `plugins/djinn/commands/dispatch.md:206` The one full-suite run the relay still makes has no heap cap, no timeout and no memory check, while the new config text says the cap covers every test process.
Claim: `plugins/djinn/CONTRACTS.md:222` and `plugins/djinn/templates/config.yaml:90` both say `heap_mb` is the "heap cap in MB for every test process". The goal's constraint is that the relay never takes the machine down again.
Mechanism: the landing lane runs raw `test_cmd` automatically after "go" (`dispatch.md:191` "automatic, no gate", `:206` to `:208`). No `proof.heap_mb`, no `NODE_OPTIONS`, no `timeout` and no `free -m` check reach it. The build caps the fixer (`fixer.md:100` to `:102`) and proof-runner, and leaves this run uncapped. That is the run the owner had to forbid.
Traced: the game repo `test_cmd: npm test` (its `.djinn/config.yaml`) runs `node --max-old-space-size=4096 --test --test-concurrency=4 tests/*.test.mjs` (`package.json:10`). That is four child processes. The build says the parent flag "may not reach" them (`proof-runner.md:150` to `:151`). Even if it does, 4 x 4096 = 16384 MB, which breaks proof-runner's own rule "refuse if heap_mb is more than half of total memory" (`proof-runner.md:70` to `:72`) on the 31 GB machine that `CONTRACTS.md:126` names. It has no wall clock, and it includes the unverified deepEqual fixes (the game repo `audits/LEDGER.md:10`).
Why other reviewers miss it: breaker filed the landing lane's side effects on files (MEDIUM-8) and the cap's Buffer hole (HIGH-2), but not that this lane never gets the cap at all. Integration read the prose, not what the run does.
What would catch it: `grep -n "test_cmd" plugins/djinn/commands/dispatch.md` shows no `heap_mb` or `timeout` on the Step 7.2 line. Fix wording: run the landing lane only when `proof.heap_mb` and `proof.timeout_s` are set, under `NODE_OPTIONS` and `timeout`, and otherwise print `landing lane skipped: no proof caps` in the plan. Add a `--no-tests` flag so "owner said run nothing" does not mean editing config.

### MEDIUM
MEDIUM-1. `plugins/djinn/agents/gate-auditor.md:90` The failure record behind "viewer references failing for a phase" cannot be read with gate-auditor's allowed Bash, so the case files as a non-blocking LOW, the same tier synthesis gave LOW-8.
Claim: `gate-auditor.md:257` to `:259` says a check "recorded as failing" while the fence changes its guarded paths is MEDIUM. `CONTRACTS.md:50` to `:53` gives gate-auditor MEDIUM on dead gates.
Mechanism: the only record of the red bot is in commit bodies. The game repo `2008cdc` says "qa:viewer: every shot comparison fails on size now that the canvas is wider; references not regenerated", and `bbdbd03` says the same kind of thing. The allowlist permits only `--format='%cI %h'` and `--format='%cI %h %s'` (subjects), with no `%b` and no `git show` (`gate-auditor.md:90` to `:95`, "Nothing else"). The row therefore falls back to reference evidence: `qa/bot/reference/viewer` at 2026-09-22 `2d46d46` against `src/viewer` at 2026-09-27 `72ef6c1`. That is STALE, which `:263` tiers LOW (STALE). A row the auditor cannot date is UNKNOWN, and UNKNOWN is not one of the finding routes at `:126` to `:129`, so it never becomes a finding at all.
Traced: `gate-auditor.md:90` to `:95` to `:155` to `:166` to `:170` to `:173` to `:263`. The game repo INDEX line "wait on a clean run" that `:165` would count exists only because devils-advocate found LOW-8 by luck.
Why other reviewers miss it: breaker and security read the Bash allowlist for danger (LOW-1, LOW-2), not for the evidence the verdict needs.
What would catch it: run gate-auditor on the game repo at `df5baea..72ef6c1` with the 1258 INDEX and check whether the qa:viewer row reaches MEDIUM. Fix wording: allow `git log --format='%cI %h %s%n%b' -n <k> -- <guarded paths>`, and grep the output for `fail`.

MEDIUM-2. `plugins/djinn/commands/review.md:96` The cost trigger does not fire on a test file, and the build moved OOM ownership to the cost agent. So the anchor's own shape (a deepEqual in a test) now has no tiering owner outside the full and cost scopes.
Claim: WIRING-REPORT conflict 2 says it chose the union "because ... the anchor incident was a test lane with no config". Gap-hunter REC-1 (`gap-hunter.md:103`) asks for a trigger on "a test runner config".
Mechanism: the trigger at `review.md:96` to `:104` fires on `cost` keys, IaC, CI, `deps.manifests` and `paid_apis` names. It has no `tests/`, no `*.test.*` and no runner config. In a standard scope with no `cost` block (every project today), a fence of test files spawns gate-auditor (`:105` to `:106`), which hands "a gate that takes the machine down" to cost-complexity (`gate-auditor.md:54` to `:56`). perf-reviewer now says "An OOM or another platform ceiling is its to file" (`perf-reviewer.md:18` to `:23`). Before this diff, perf-reviewer filed the anchor's sibling itself: the game repo synthesis MEDIUM-2 came from perf-reviewer, HIGH (OOM). synthesis turns an unfiled handoff into a Coverage line only "If the owning agent ran" (`synthesis.md:56` to `:59`).
Traced: `review.md:96` to `:104`, then `gate-auditor.md:54`, `perf-reviewer.md:20`, `synthesis.md:56`. That leaves known-bugchecker's untiered "unverified" hit (wave 1 known-bugchecker MEDIUM-1) as the only net.
Why other reviewers miss it: integration LOW-4 found overlapping lanes. This is the opposite problem, a lane that nobody runs, and it only shows when the trigger is read next to the handoffs.
What would catch it: dry-run the Step 3 triggers on a fence of `tests/viewer-trace.test.mjs` alone with the game repo's config. `cost-complexity-reviewer: not triggered` is the failure. Fix wording: add `*.test.*`, `*.spec.*`, `tests/`, `test/` and the runner configs listed at `:109` to `:111` to the cost trigger.

MEDIUM-3. `plugins/djinn/agents/accessibility-reviewer.md:43` The success check "would catch the cited evidence on its first real run" is contaminated, because the evidence is written into the prompts as worked examples.
Claim: the goal is that each agent would catch the gap-hunter's cited evidence. Gap-hunter's "First run in the game repo" lines (`gap-hunter.md:19`, `:27`, `:43`, `:59`) are the success criterion.
Mechanism: `accessibility-reviewer.md:43` to `:52` describes the game repo's circle, diamond and triangle rings and the `?? SHAPES.at(-1)` fallback. `data-contract-reviewer.md:151` to `:158` and `:301` to `:307` give MEDIUM-3's three file:lines verbatim. `proof-runner.md:249` shows MEDIUM-2 on `tests/viewer-trace.test.mjs` passing. `CONTRACTS.md:120` to `:124` puts `qa:viewer` and its reference folder in as the `gates` example. Replaying on the cited evidence now measures recall of the prompt, not the lane. Nothing was run anyway: the only dry run was the accessibility regex (WIRING-REPORT, "Nothing was run").
Traced: `gap-hunter.md:59` ("the same cross product MEDIUM-3 found by accident") to `data-contract-reviewer.md:151`. `gap-hunter.md:19` to `accessibility-reviewer.md:50`.
Why other reviewers miss it: ux REC-7 saw the project names as a publishing issue. No lane asks whether the success test can fail.
What would catch it: replay each new agent on an incident that no prompt names. For example, the work repo `db/` for data-contract (tenant_id and cents), or a color-only case outside the game repo. Record the result against the goal. No such replay exists today.

### LOW
LOW-1. `plugins/djinn/agents/accessibility-reviewer.md:110` The LOW-9 file itself, `src/viewer/unit-marks.js`, gets sorted "not UI" in the game repo, because the one key that would include it is absent there and nothing asks for it.
Claim: `accessibility-reviewer.md:122` to `:123` says "Every other fenced file gets one line in Checked and Clean: `not UI`." `CONTRACTS.md:258` to `:260` says `ui_paths` exists for "a module that only returns mark data for a renderer".
Mechanism: the game repo's `unit-marks.js:3` says "No DOM and no three", and a grep for every token at `review.md:84` and `accessibility-reviewer.md:113` to `:120` finds nothing in it. The game repo's config has no `ui_paths`, and no agent files a REC to add one. The catch still lands on `stand-in.js:208`, which carries the same fallback and imports three, but only if the agent chooses to open a fenced file it has just classed as not UI.
Traced: `accessibility-reviewer.md:110` to `:124`, to the game repo `.djinn/config.yaml` (no `ui_paths`), to `unit-marks.js:1` to `:7`.
Why other reviewers miss it: integration MEDIUM-3 covers the trigger's terminal-color gap, not the agent's own file sort.
What would catch it: fix wording at `:97`: "When `ui_paths` is absent and a fenced file supplies marks, palettes or labels to a UI file, read it as UI and file one REC to set `ui_paths`."

LOW-2. `plugins/djinn/agents/live-system-reviewer.md:3` The third-party-page evidence lives in the automation repo and the extension repo, and neither project can run this plugin, so live-system-reviewer's first real run will not be on that evidence.
Claim: gap-hunter says "the extension repo and the automation repo are where it earns its keep" (`gap-hunter.md:51`), and the goal counts the third-party-page index entries.
Mechanism: neither `the automation repo/.djinn` nor `the extension repo/.djinn` exists. Both run vendored `ReviewRelay/` copies, and `review.md:25` to `:28` aborts without a config. In the game repo, `tools/meshy.mjs` triggers only through `cost.paid_apis` (`review.md:122`), which the game repo lacks, while its Playwright benches do trigger (integration REC-2).
Traced: `review.md:18` to `:28`, then `:115` to `:124`, then the directory listings.
Why other reviewers miss it: the audit is fenced to the plugin repo, and the gap is where the plugin is installed.
What would catch it: `ls <automation repo>/.djinn <extension repo>/.djinn`. The fix is a config (or a port) in those repos, outside this build. Say so in the build's status.

LOW-3. `plugins/djinn/agents/devils-advocate.md:86` Hunk item 6 reads its goal from a static `goal_doc`, so it either floods or goes silent in both projects that run the plugin.
Claim: `:86` says the goal is `--goal` or `goal_doc`, else the commit messages in the range.
Mechanism: the game repo's `goal_doc` is `docs/design/amendment-kit-bench.md`, an amendment closed at K.8. Every phase 10 hunk would count as "outside the task", with one LOW per file (`:89`) across a 219-file fence. djinn-relay has `goal_doc: none` and works uncommitted (context.md: `merge_base` equals `head`), so the commit range is empty and `:87` skips the item. In a dispatch round there is no goal either (integration LOW-15).
Traced: `review.md:338` to `devils-advocate.md:86` to `:89`. The game repo `.djinn/config.yaml` `goal_doc`. context.md `merge_base`, `head`.
Why other reviewers miss it: integration LOW-15 covers the missing round prompt, not a stale `goal_doc` in round 1.
What would catch it: fix wording: "When `goal_doc` names no line that touches the fence, treat the goal as absent and say so." Also a check in review Step 1 that warns when `goal_doc` has not changed since `merge_base`.

LOW-4. `plugins/djinn/commands/review.md:414` Hunks outside the task: the `review_copy` write, and the rule change that allows it.
Claim: the goal (gap-hunter REC-6, `gap-hunter.md:125` to `:128`) asks for a `live` trigger and a scope line. No goal line asks for a copy outside `audits/`.
Mechanism: an unasked hunk lets the relay write outside the audit folder, and it softens the old "never anywhere else" rule.
Traced:
- `review.md:414` to `:419`: copies the live report to `<review_copy>/...`, a folder named in config.
- `review.md:473` to `:475`: "never anywhere else" gains an exception for that copy.
- `CONTRACTS.md:163` and `:211` to `:213`: the key and its meaning.
Why other reviewers miss it: security LOW-3 filed the path sanitizing, which is the defect. Whether the hunk was asked for is a separate question.
What would catch it: none in the gate. This list is the check. Opt-in, default `none`, so LOW.

### DEBT
none

### REC
none

## Checked and Clean
- The two wiring-writer notices were already filed in wave 1 and are not re-filed here. The round-status clash is integration MEDIUM-1 (`gate-auditor.md:280`). devils-advocate's perf-scope claim is integration LOW-2 (`devils-advocate.md:3`, against `review.md:46`).
- `plugins/djinn/commands/review.md:150`: fence missing two untracked files. Holds: `git ls-files -o --exclude-standard` is appended to the fence, and `dispatch.md:237` repeats it for rounds. The game repo's `qa/bot/viewer-shots.mjs` and `tests/qa-viewer-update.test.mjs` are not ignored, so both would be listed.
- `plugins/djinn/commands/review.md:212`: the hand-mutant grep matches `if (false)` in `qa/bot/`, which is not excluded as a test path, so the anchor's second crash site is covered. gate-auditor repeats the grep (`gate-auditor.md:182` to `:194`).
- `plugins/djinn/agents/accessibility-reviewer.md:264`: LOW-9 at the time it was found. `assertEncounter` set no team maximum (the game repo synthesis LOW-9), so valid content reached the fallback, which the MEDIUM floor covers. Synthesis may not drop it below MEDIUM (`CONTRACTS.md:26` to `:31`, `synthesis.md:84`). The trigger fires on `stand-in.js` (three).
- `plugins/djinn/commands/review.md:87`: the data trigger fires on `src/sim/schema.js` (basename `schema`). The agent's method item 1 (`data-contract-reviewer.md:168` to `:173`) names the early return plus resolver default pattern. See MEDIUM-3 on why this proves less than it looks.
- `plugins/djinn/commands/review.md:40` to `:48`: cost-complexity-reviewer is in full and cost, and `plugin.json` auto-discovers agents, with no explicit list to miss. It can be spawned once 2.3.0 is published (the installed copy is 2.1.0, per context.md). See MEDIUM-2 for the standard scope.
- `plugins/djinn/agents/proof-runner.md:63` to `:72`: refuses without both caps, with no fallback. `review.md:126` to `:131` and `dispatch.md:26` to `:28` never auto-spawn it. On the game repo's config as it stands it refuses (no `proof` block). That matches the owner's constraint, and "eight fix groups" stay unproven until he sets the caps. Direct mode's cited route (`:108` to `:110`) picks `tests/viewer-trace.test.mjs` for MEDIUM-2.
- `plugins/djinn/agents/live-system-reviewer.md`: the hunt items at `:198` to `:279` map one to one onto the twelve "Driving a third-party page" entries (sleeps, always-true signal, bare button, click as save, per-render ids, reactive reads, focus, caps per load, buffers, synthetic events, auto-fill), plus the paid-call resume. Reach is LOW-2.
- Hunk item 6 over the rest of the patch: the other hunks trace to gap-hunter C1 to C6, W1, W2, REC-1 to REC-16, or to the cost audit that REC-1 wires (the `CONTRACTS.md` cost ladder, the web rule, "or a rule below says HIGH"). `README.md`'s agent list and `.djinn/config.yaml`'s notes describe the change.

## Files read outside the fence
- `~/djinn-relay/audits/2026-09-27-1655-ideas/agents/gap-hunter.md` (goal document)
- `~/djinn-relay/audits/2026-09-27-1720-build/WIRING-REPORT.md` (writer's choices and notices)
- `~/djinn-relay/audits/2026-09-27-1720-build/BRIEF.md` (build brief)
- `~/djinn-relay/audits/LEDGER.md` (diff hunk check)
- `<game repo>/.djinn/config.yaml` (first real run config)
- `<game repo>/audits/LEDGER.md` (unverified landing evidence)
- `<game repo>/audits/2026-09-27-1258-full/synthesis.md` (cited evidence lines)
- `<game repo>/src/viewer/unit-marks.js` (LOW-9 site, trigger tokens)
- `<game repo>/src/sim/schema.js` (team cap)
- `<game repo>/package.json` (landing lane command)
- `<game repo>/qa/bot/viewer.mjs` (update refusal, grep)
- The game repo `git log` of `2008cdc`, `bbdbd03`, `qa/bot/reference/viewer`, `src/viewer` (failure record, dates)
- `<automation repo>/`, `<extension repo>/` listings (plugin reach)
- `<work repo>/.djinn/config.yaml` (grep, optional keys)
