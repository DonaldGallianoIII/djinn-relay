---
title: gap-hunter report, audits/2026-09-27-1655-ideas
author: Claude Opus 5.5 (gap-hunter)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Anchor: 2026-09-27. The relay had no lane for what code costs to run, and the same day a test's `assert.deepEqual` over two PNG buffers ran node to 30 GB and took WSL down twice (the second time through a hand mutant, `if (false)`, left in `qa/bot/viewer-shots.mjs:52`). Recorded in `~/Conventions/code/KNOWN-BUGS.md:331` and `:350`. cost-complexity-reviewer was written to close it. Question asked: what else should have existed.

## Candidate agents

Ranked by evidence strength. Set diff first: the plugin has 18 agent files. The engine repo/ReviewRelay has 17 (the plugin minus cost-complexity-reviewer), the extension repo/ReviewRelay has the same 17, the automation repo/ReviewRelay has 9, all a subset. No agent exists in any copy that failed to reach the plugin. Every gap below is new, not lost.

### C1. accessibility-reviewer
Lane: meaning carried by color alone, canvas with no text equivalent, and interactive UI with no keyboard path, on every UI file in the fence.
- Evidence: the colorblind rule is the one "hard rule" in `~/Conventions/CLAUDE.md:11` and `code/ACCESSIBILITY.md:3`. In the game repo's full audit it was caught by breaker, by luck, as a MEDIUM, and synthesis re-tiered it to LOW (`the game repo/audits/2026-09-27-1258-full/synthesis.md:38`, LOW-9, `src/viewer/unit-marks.js:196`). ux-reviewer ran in that same audit and missed it. The shared index entry "The non-color encoding runs out" (`KNOWN-BUGS.md:399`) has no owning lane. The work repo's config tiers a color-only distinction as a defect (its `.djinn/config.yaml`), while the relay says new color-only output is a REC (`ux-reviewer.md:109`). The project and the relay disagree on the tier.
- Why no one covers it: ux-reviewer's lane is "CLIs, configs, APIs, output, and docs" (`ux-reviewer.md:3`), and it triggers only on "a CLI entry point, a config schema, or a README" (`commands/review.md:48`). A diff to `.css`, `.html`, a canvas scene or an SVG mark does not trigger it. test-strategist asks for a "Greyscale pass: yes, or not applicable" (`test-strategist.md:155`) inside a protocol it writes, but it does not read the UI. breaker found LOW-9 through an off-by-one, not through the rule. The canvas rule (`ACCESSIBILITY.md:67` to `:75`) and the keyboard rule (`FEATURE-WORKFLOW.md:35`) have no reader at all.
- When: every scope except ideas, conditional on the fence touching `*.css`, `*.html`, a file that builds DOM or draws to a canvas, or any file under a path the config names as UI. Read only (Read, Grep, Glob, Write). It never judges taste or palette beauty, and it never reasons about hex values as proof. It cites a label, glyph, shape, position or weight, or says one is missing.
- First run in the game repo: `src/viewer/stand-in.js:208` still carries `?? TEAM_SHAPES.at(-1)`, the exact detection string from `KNOWN-BUGS.md:405`, after the LOW-9 fix removed it from `unit-marks.js`. The cap at `src/sim/schema.js:844` guards content, so the likely outcome is Checked and Clean citing that line, or a LOW for a hand-built trace that skips the schema. It would also read the 22 color references in `src/viewer/effects.js` against a second channel each. In the work repo: its config says its two themes differ only in tokens, so every status token needs a non-color twin in both.
- Cost: one more read-only agent in the parallel wave, triggered only by UI files. It pairs with one contract line: a breach of a conventions hard rule is at least MEDIUM and synthesis may not re-tier it below that, so LOW-9 could not happen twice.

### C2. gate-auditor
Lane: the checks themselves. Does each test, bot, bench and CLI gate fail when it should, run where it claims, and has each out-of-gate check passed since the paths it guards changed.
- Evidence: three index entries with no owner. "A check that passes by not checking" (`KNOWN-BUGS.md:362`: LOW-3, LOW-23), "A CLI accepts what it cannot use" (`the game repo/docs/known-bugs/INDEX.md:21`: LOW-5, LOW-17, LOW-51), "An out-of-gate check tests the fallback" (`INDEX.md:45`: LOW-6, LOW-7, LOW-8). LOW-8 says phase 10's drawing "landed with no passing visual check" because every viewer canvas shot had failed since task 5.10 (`synthesis.md:37`), found by devils-advocate and re-tiered. The anchor's second crash ran through a gate: the mutant `if (false)` sat in `qa/bot/viewer-shots.mjs:52`, a check forced to pass (`KNOWN-BUGS.md:350`). The game repo's CLAUDE.md carries four deviations that each say "run it beside the gate" (qa:bot, qa:studio, qa:viewer, bench-viewer) and nothing checks that anyone did. `FEATURE-WORKFLOW.md:77`: "All required QA artifacts exist and pass."
- Why no one covers it: test-strategist "Designs the test surface for a change" (`test-strategist.md:3`), reads only "Test files that reference a changed module by import or by name" (`:18`), and emits REC only. A Playwright bot guards `src/viewer/` by URL, not by import, so it falls outside that read. devils-advocate owns a weak check "Only when the weak check is the success signal for THIS change's stated goal" (`devils-advocate.md:48`). bugs-reviewer found LOW-3 as a wrong result, not as a gate property. No agent asks "when did this bot last pass".
- When: full scope and any fence touching `tests/`, `qa/`, `tools/check*`, `tools/bench*`, the package scripts block, or CI files. Serial executing wave, Bash read-only: `git log -1 --format=%cd -- <reference dir>` against `git log -1 -- <guarded paths>`, and a grep for `if (false)`, `|| true`, `MUTANT`, `catch { return }`. It never runs a test, a bot or a bench, and never regenerates a reference.
- First run in the game repo: LOW-8 again, since the index says the viewer references "still show capsules and wait on a clean `npm run qa:viewer`" (`INDEX.md:56` to `:58`), plus a table of the four out-of-gate checks with the date each last passed against the date its guarded paths last changed. In the work repo: whether `qa/run-bots.sh` fails or skips when the chromium libraries named in the landmine are missing (its config says that failure is not a code failure).
- Cost: one more serial agent in full scope. Better as its own agent than a widened test-strategist, because it must be able to emit LOW and MEDIUM on a dead gate, and test-strategist is REC by contract (`CONTRACTS.md:42` to `:45`).

### C3. tree-preflight (an orchestrator step, not an agent)
Lane: facts about the working tree that every reviewer needs and none can see: untracked files the fence misses, tracked files that are ignored, hand mutants, large binaries, and imports of untracked modules.
- Evidence: the relay's own fence missed two files in the game repo's full audit: "219 (217 from git diff plus 2 untracked added by hand: qa/bot/viewer-shots.mjs, tests/qa-viewer-update.test.mjs)" (`synthesis.md:12`). Those two are the anchor's files. `commands/review.md:63` computes the fence with `git diff --name-only <merge-base>`, which never lists an untracked file, and `dispatch.md:195` repeats it. Index entry "Git tracking disagrees with the code" (`INDEX.md:116`: LOW-12, LOW-47) and "Hand mutation left in the source" (`KNOWN-BUGS.md:350`), whose own Detection is "`git diff` after any crash before the next run".
- Why no one covers it: reviewers have no Bash (`CONTRACTS.md:232`). security-reviewer reads `.gitignore` only "when you are testing whether a secret is tracked" (`security-reviewer.md:23`). LOW-12 and LOW-47 were found by security, format and pipe-connector each noticing on the way past.
- When: every scope, inside `review.md` Step 3 and `dispatch.md` Step 7.3, where the orchestrator already holds Bash for git. Add `git ls-files -o --exclude-standard` to the fence; write `tree-facts.md` with `git ls-files -ci --exclude-standard`, the mutant grep, files over a size named in config, and untracked names grepped in tracked imports; paste it into every prompt beside the Flagged block. Never stages, never removes, never fixes.
- First run in the game repo: the uncommitted tree in today's git status (about 80 modified files) would be listed with anything untracked that a tracked file imports.
- Cost: no agent. A few git commands and one file per run.

### C4. proof-runner
Lane: run the narrowest test that proves a landed fix, one file at a time under a heap cap and a timeout, and record the result against the finding.
- Evidence: the game repo's dispatch line reads "landed 8 groups unverified ... edit only, owner said run nothing | round-2=not run" (`the game repo/audits/LEDGER.md:10`). Fourteen index entries end "Fixed by hand the same day, untested" (`KNOWN-BUGS.md:147`, `:158`, `:348`, `:360`, `:370`, `:385`, `:394`, `:407`, and every Status line in `INDEX.md`). The owner said run nothing because running the suite had just crashed the machine. `REVIEW.md:57` names an iteration lane, "a static selector over the diff", that nothing in the relay implements.
- Why no one covers it: fixer runs `build_cmd` and may run `test_cmd` "when you can narrow it to the tests covering `work_set.files`" (`fixer.md:95` to `:99`), inside dispatch only. dispatch's landing lane runs the full `test_cmd` once (`dispatch.md:189`). synthesis verifies "by reading the diff and the file" (`synthesis.md:78`). A hand fix, or a dispatch where the owner forbids the full suite, gets no proof at all.
- When: after dispatch or on its own against an index's "untested" lines, serial, Bash limited to `node --max-old-space-size=<cost.limits value> --test <one file>` with a timeout, one file per call. Needs the heap figure from config; without it, it refuses to run and says so. Never runs the full suite, never runs in parallel, never edits.
- First run in the game repo: the three files behind MEDIUM-2 and LOW-1 and LOW-2 (`tests/viewer-trace.test.mjs`, `tests/viewer-clock.test.mjs`, `tests/trace.test.mjs`) under a 4 GB cap, which turns "untested" into pass or fail for the fix of the anchor itself.
- Cost: one serial agent, only when invoked. It is the one candidate that executes code, so it answers to the hardware budget (`REVIEW.md:66`).

### C5. live-system-reviewer
Lane: code that drives a page it does not own or writes to a real external system: signal waits, save proven by re-query, label anchoring, retry and resume that re-buys, dry run and kill switch before the first live run.
- Evidence: "Driving a third-party page" is the largest section of the shared index, 12 entries (`KNOWN-BUGS.md:263` to `:327`), from the automation repo and a private project, plus "Paid call before the intent is saved" (`:387`, the game repo LOW-18, `tools/meshy.mjs:291`). `REVIEW.md:3` demands a blind review "Before a tool touches anything real (a live portal, a client's machine, a production database)", and no scope or agent carries it. `code/AUTOMATION.md` exists as its rule book.
- Why no one covers it: ux-reviewer asks for "No dry run or validate mode on a command that mutates state" (`ux-reviewer.md:93`) on CLI surfaces only. breaker's "Timing attacks" (`breaker.md:57`) are about teardown and awaits, not a lagging third-party DOM. cost-complexity owns the re-buy's bill (`cost-complexity-reviewer.md:177` to `:181`), not whether the record exists afterward.
- When: conditional on the fence touching a content script, a Playwright or Selenium driver outside `qa/`, or a file naming a `cost.paid_apis` endpoint, and on demand as a `live` scope before a first live run. Read only; web fetch not needed. Never contacts the live system.
- First run: the game repo's `tools/meshy.mjs` resume path, checking that a task id adopted on resume is re-queried rather than trusted. The work repo today has only `tools/capture.py`, a read-only capture rig, so the likely result there is Checked and Clean until a writer lands. The extension repo and the automation repo are where it earns its keep.
- Cost: one conditional read-only agent. Could fold into breaker as a seventh vector, but the index entries are about ordinary happy-path use of a hostile page, which breaker's lane excludes (`breaker.md:71`).

### C6. data-contract-reviewer
Lane: every place data is validated, resolved, defaulted, persisted or migrated, checked for agreement: validator against resolver against editor setter, save shape against load shape, and the project's stated column invariants.
- Evidence: "Legality predicate duplicated between mask and apply" was "three instances found by luck" (`KNOWN-BUGS.md:127` to `:135`). "Validator skips what the resolver defaults" was the game repo MEDIUM-3, found by breaker alone (`synthesis.md:27`). "Regeneration drops hand-kept keys" was MEDIUM-1 (`synthesis.md:23`). The work repo states column and write invariants in its config that no agent reads as rules, with a data model doc in its conventions.
- Why no one covers it: integration-reviewer asks whether save and load "carry the new state" (`integration-reviewer.md:63`), not whether the validator and the resolver agree on what the state means. multiuser-reviewer sees tenant ids only as DEBT (`multiuser-reviewer.md:117`). No agent reads a SQL migration.
- When: conditional on the fence touching a schema, a validator, a migration folder, a model file or a persisted format named in `project_notes`. Read only. Never connects to a database.
- First run in the work repo: each migration in `db/` checked for `tenant_id` and an actor column and money stored as integer cents. In the game repo: `src/sim/schema.js` against `src/sim/presentation.js` and the studio setters, the same cross product MEDIUM-3 found by accident.
- Cost: one conditional read-only agent. Two of its three index entries were MEDIUMs found by the wrong agent, which is the argument for a lane.

### Widen, do not add
- W1. integration-reviewer owns the truth of `@interacts` and `@deps` on every changed module, and prose claims about other code. Evidence: "Stale doc block tags" (`INDEX.md:145`: LOW-11, LOW-32, LOW-42, LOW-48) and "A prose claim goes stale" (`INDEX.md:158`: six LOWs). LOW-11 was already found by integration-reviewer (`synthesis.md:40`), because it is the agent that reads importers. perf-reviewer checks only `@alloc` and `@complexity`, only on hot paths (`perf-reviewer.md:90` to `:98`), and the work repo has `hot_paths: []`, so there no tag is read at all. `REVIEW.md:53`: "the doc block tags match the code". Cost: one scope bullet.
- W2. devils-advocate names every diff hunk no line of the goal accounts for. `REVIEW.md:51` asks "no change outside the task"; `devils-advocate.md:21` to `:23` is goal against execution only. Cost: one hunt item.

### Overlaps
- perf-reviewer and cost-complexity-reviewer both call themselves the cost auditor (`perf-reviewer.md:3`, `:10`; `cost-complexity-reviewer.md:8`). The division at `cost-complexity-reviewer.md:32` to `:37` is sound; rename perf to the hot-path auditor so synthesis and a human read two lanes, not one.
- pipe-connector and integration-reviewer both walk importers; pipe-connector already hands its anomalies to integration (`pipe-connector.md:118`). Keep both: brief reads the map.
- multiuser-reviewer spends a full run on a single-player project to write `none` (`multiuser-reviewer.md:37`). Gate the spawn on `project_notes`, not the agent's first step.
- No two agents should merge.

### Conventions no agent enforces
- Colorblind hard rule: partial (ux-reviewer on CLI output only). C1.
- Canvas text equivalent and keyboard pass: none. C1.
- Voice: no agent, and none needed where `check_voice.py` is in the gate (the game repo's `npm run voice`). djinn-relay itself has `build_cmd: none`, so CONTRACTS section 11 is never checked mechanically on the prompts.
- Doc blocks: presence by `check_docblocks.mjs`; truth of `@alloc` and `@complexity` by perf on hot paths only; `@interacts`, `@deps`, `@rng` by nobody. W1.
- Feature workflow QA artifacts: specified by test-strategist, existence and freshness checked by nobody. C2.
- Git "what not to commit" (`GIT.md:69` to `:74`): secrets by security, binaries by cost-complexity scope 7, tracking by nobody. C3.

### Speculative
- determinism-reviewer: seeded RNG, no wall clock, byte-identical logs (`Conventions/CLAUDE.md:65`). The game repo's determinism bugs (the slot symmetry stack key, the proc draws) were caught by existing reviews, so no evidence of a miss.
- asset-provenance-reviewer: license and source of committed GLBs and atlases (commit 0c89df3). dependency-reviewer covers packages only. No incident.
- session-log keeper for `REVIEW.md:81`. A process, not an agent.

## Findings

### HIGH
none

### MEDIUM
none

### LOW
none

### DEBT
none

### REC
REC-1 (high). `plugins/djinn/commands/review.md:34` The anchor's agent is never spawned.
What: wire cost-complexity-reviewer into the scopes, its trigger and its inputs.
Why: the anchor. Its description says "Runs in full and cost scopes, and whenever the config carries a cost block" (`cost-complexity-reviewer.md:3`), and no command, scope table or doc names it: the full list at `review.md:37` to `:40` omits it, there is no `cost` scope at `:32` to `:42`, the conditional list at `:44` to `:49` has no cost trigger, Step 1 at `:18` to `:20` does not read `cost`, and the fence block at `:113` to `:119` pastes no `cost` block. It runs only in a custom list, where it reports "`cost` block absent" every time. The deep-equal that took WSL down would be caught by its scope 3 (`:185` to `:190`) only if it ran.
How: in `review.md` Step 2 add it to full, add `cost: known-bugchecker, perf-reviewer, cost-complexity-reviewer, breaker, synthesis`, add a conditional trigger (config has `cost`, or the fence touches the scripts block, a test runner config, CI, IaC, or a file naming a `cost.paid_apis` entry); Step 1 reads `cost`; the fence block pastes it verbatim. Then `CONTRACTS.md:145` to `:166` gains the `cost` keys, `CONTRACTS.md:243` lists it among web agents, `relay.md:129` to `:135` and `README.md:110` to `:116` gain the scope.

REC-2 (high). `plugins/djinn/commands/review.md:44` accessibility-reviewer, triggered by UI files.
What: add C1 as `agents/accessibility-reviewer.md` and a conditional trigger on UI files.
Why: KNOWN-BUGS "The non-color encoding runs out" (`KNOWN-BUGS.md:399`), caught by breaker by chance and re-tiered to LOW (`synthesis.md:38`).
How: conditional block at `review.md:44` to `:49`: fence touches `*.css`, `*.html`, or a DOM or canvas builder. In `CONTRACTS.md:21` to `:52` add: a breach of a hard rule in `conventions_files` is at least MEDIUM, and synthesis does not re-tier it below MEDIUM without citing the non-color channel it found.

REC-3 (high). `plugins/djinn/commands/review.md:156` gate-auditor in the serial wave.
What: add C2 to Step 7 for full scope and for fences touching `tests/`, `qa/`, `tools/check*`, `tools/bench*`, the scripts block or CI.
Why: KNOWN-BUGS "Hand mutation left in the source" (`KNOWN-BUGS.md:350`), the anchor's second crash, and "A check that passes by not checking" (`:362`).
How: a Step 7 entry with the read-only Bash list in C2; its report carries a table of gate, guarded paths, last pass, last change to guarded paths.

REC-4 (high). `plugins/djinn/commands/review.md:63` The fence omits untracked files.
What: C3, the tree preflight: add untracked files to the fence and write `tree-facts.md` for every agent.
Why: the anchor's two files were outside the game repo's fence and had to be added by hand (`synthesis.md:12`); KNOWN-BUGS "Hand mutation left in the source" (`KNOWN-BUGS.md:350`) and the game repo "Git tracking disagrees with the code" (`INDEX.md:116`).
How: `review.md` Step 3 appends `git ls-files -o --exclude-standard -- . ':!audits'` to the fence and runs the four tree queries in C3 into `<AUDIT_DIR>/tree-facts.md`; the fence block pastes its path. Same change at `dispatch.md:195`.

REC-5 (medium). `plugins/djinn/commands/dispatch.md:189` proof-runner for untested landings.
What: C4, run the narrowest covering test per landed fix under a heap cap and a timeout, serially.
Why: the game repo `audits/LEDGER.md:10` landed eight groups unverified, and fourteen index entries read "untested".
How: a new agent spawned in `dispatch.md` Step 7 before the round, and callable alone on an index's "untested" Status lines; Bash limited to one `node --max-old-space-size=<cost.limits> --test <file>` per call.

REC-6 (medium). `plugins/djinn/commands/review.md:44` live-system-reviewer.
What: C5, conditional on page drivers and paid or live endpoints, plus a `live` scope for the blind review `REVIEW.md:3` demands.
Why: twelve index entries under "Driving a third-party page" with no owner (`KNOWN-BUGS.md:263`).
How: conditional block at `review.md:44` to `:49`, and a scope line at `:32` to `:42`.

REC-7 (medium). `plugins/djinn/commands/review.md:44` data-contract-reviewer.
What: C6, conditional on schemas, validators, migrations and persisted formats.
Why: the game repo MEDIUM-1 and MEDIUM-3 were found by bugs and breaker outside their lanes; the legality entry was "found by luck" (`KNOWN-BUGS.md:134`).
How: conditional block at `review.md:44` to `:49`; the agent reads `project_notes` for stated column invariants (the work repo config).

REC-8 (medium). `plugins/djinn/agents/integration-reviewer.md:47` Doc block truth for `@interacts` and `@deps`.
What: W1, one scope bullet giving integration-reviewer the truth of `@interacts` and `@deps` on changed modules and their importers.
Why: ten game repo LOWs in two index entries (`INDEX.md:145`, `:158`); LOW-11 already came from this agent.
How: a bullet under Scope beside "Serialization and restore paths", and a matching line in `perf-reviewer.md:88` saying the other three tags belong to integration.

REC-9 (low). `plugins/djinn/commands/review.md:113` The fence block pastes no `goal_doc` and no `deps.*`, which `bugs-reviewer.md:15` and `multiuser-reviewer.md:12` expect.
REC-10 (low). `plugins/djinn/agents/perf-reviewer.md:3` Rename "Cost auditor" to hot-path auditor now that cost-complexity-reviewer exists.
REC-11 (low). `plugins/djinn/commands/review.md:37` Spawn multiuser-reviewer only when `project_notes` names a second actor.
REC-12 (low). `plugins/djinn/agents/ux-reviewer.md:105` Point the color clause at accessibility-reviewer once C1 lands.
REC-13 (low). `plugins/djinn/agents/devils-advocate.md:37` W2: list diff hunks no goal line accounts for (`REVIEW.md:51`).
REC-14 (low). `plugins/djinn/agents/consolidator.md:74` List index entries whose Status says "untested", as input for C4.
REC-15 (low). `plugins/djinn/agents/test-strategist.md:18` Hand bots that guard a page by URL to gate-auditor.
REC-16 (low). `plugins/djinn/CONTRACTS.md:260` Section 11 is unchecked on the plugin's own prompts: djinn-relay's `build_cmd: none` could run `check_voice.py` over `plugins/`.

## Blast radius
none

## Already present
- `plugins/djinn/agents/cost-complexity-reviewer.md:185` Heap caps on test lanes and "an assertion or a log call that prints a large value": the anchor's mechanism is in scope, once REC-1 makes it run.
- `plugins/djinn/agents/ux-reviewer.md:105` Color-only output clause: insufficient because its trigger at `review.md:48` excludes UI files and it tiers new color-only output as REC.
- `plugins/djinn/agents/test-strategist.md:155` Greyscale and keyboard lines on manual protocols: specifies, never inspects the UI.
- `plugins/djinn/agents/perf-reviewer.md:88` `@alloc` and `@complexity` truth: hot paths only, so the other three tags go unread.
- `plugins/djinn/agents/devils-advocate.md:58` "A test for existing behavior stopped running": goal-bound, so a bot rotting across phases is out of lane.
- `plugins/djinn/commands/dispatch.md:189` Landing lane runs `test_cmd` once: all or nothing, no heap cap, skipped when the owner forbids runs.
- `plugins/djinn/commands/dispatch.md:196` Scope leak detection for fixers: covers fixes only, and uses the same untracked-blind `git diff`.
- `plugins/djinn/agents/integration-reviewer.md:63` Serialization and restore paths: carries the state, does not check validator against resolver.
- Other ReviewRelay copies: no agent there that the plugin lacks.

## The One Question
`grep -rn "cost-complexity" ~/djinn-relay/plugins/djinn/commands ~/djinn-relay/plugins/djinn/relay.md ~/djinn-relay/plugins/djinn/README.md` returns nothing, which says whether the agent written for today's incident can run in any scope today.

## Checked and Clean
- `plugins/djinn/CONTRACTS.md`: severity ladder, cost reading, fence and tools; no `cost` config key, no hard-rule tier (REC-1, REC-2).
- `plugins/djinn/README.md`: scopes and verdicts; no cost scope (REC-1).
- `plugins/djinn/relay.md`: scope table and learning loop; no cost scope, no iteration lane (REC-1, REC-5).
- `plugins/djinn/agents/breaker.md`: six vectors; the colorblind catch was incidental to an off-by-one (C1).
- `plugins/djinn/agents/bugs-reviewer.md`: lane is traced defects; gate and tree properties outside it.
- `plugins/djinn/agents/consolidator.md`: promotion rules sound; does not surface "untested" statuses (REC-14).
- `plugins/djinn/agents/cost-complexity-reviewer.md`: covers the anchor's mechanism and division of labor; unwired (REC-1).
- `plugins/djinn/agents/dependency-reviewer.md`: packages only; asset provenance speculative.
- `plugins/djinn/agents/devils-advocate.md`: goal against execution; out-of-task hunks absent (REC-13).
- `plugins/djinn/agents/fixer.md`: narrowed test run exists inside dispatch only (C4).
- `plugins/djinn/agents/format-reviewer.md`: mechanical lane, no doc block truth (W1 goes to integration instead).
- `plugins/djinn/agents/gap-hunter.md`: this lane; no change needed.
- `plugins/djinn/agents/integration-reviewer.md`: importer walk present, tag truth absent (REC-8).
- `plugins/djinn/agents/known-bugchecker.md`: pattern matcher; no Bash, so tree detections in the index cannot run (C3).
- `plugins/djinn/agents/multiuser-reviewer.md`: self-gating wastes a spawn on single-actor projects (REC-11).
- `plugins/djinn/agents/perf-reviewer.md`: hot-path lane sound; name collides with cost (REC-10).
- `plugins/djinn/agents/pipe-connector.md`: map and anomaly handoff sound.
- `plugins/djinn/agents/security-reviewer.md`: secrets and sinks; `.gitignore` read only for secrets (C3).
- `plugins/djinn/agents/synthesis.md`: re-tier rule has no hard-rule floor (REC-2).
- `plugins/djinn/agents/test-strategist.md`: REC-only, import-bound test selection (C2, REC-15).
- `plugins/djinn/agents/ux-reviewer.md`: color clause present, trigger too narrow (REC-12).
- `plugins/djinn/commands/brief.md`: work-set build and citation check sound.
- `plugins/djinn/commands/dispatch.md`: landing lane and scope leak present; untracked-blind diff at `:195` (REC-4).
- `plugins/djinn/commands/review.md`: scopes, triggers and fence block; cost unwired, untracked files missed (REC-1, REC-4).
- `plugins/djinn/commands/status.md`: read-only open list; nothing missing for this question.

## Files read outside the fence
- `~/Conventions/code/ACCESSIBILITY.md` (colorblind rule detail)
- `~/Conventions/workflow/FEATURE-WORKFLOW.md` (QA artifact rule)
- `~/Conventions/workflow/GIT.md` (what not to commit)
- `~/Conventions/workflow/REVIEW.md` (lanes, blind review, budget)
- `~/Conventions/` file list (conventions inventory)
- `<game repo>/.djinn/config.yaml` (project evidence)
- `<game repo>/audits/LEDGER.md` (unverified landing evidence)
- `<game repo>/docs/known-bugs/INDEX.md` (unowned pattern evidence)
- `<game repo>/audits/2026-09-27-1258-full/synthesis.md` (finding sources, lines 1 to 31, grep)
- `<game repo>/src/` grep only (first-run examples)
- `<work repo>/.djinn/config.yaml` (second project evidence)
- `~/djinn-relay/audits/LEDGER.md` (relay history)
- `~/djinn-relay/docs/carried-findings.md` (relay history)
- `<engine repo>/ReviewRelay/agents/` listing (agent set diff)
- `<automation repo>/ReviewRelay/` listing and `relay.md` grep (agent set diff)
- `<extension repo>/ReviewRelay/` listing and `relay.md` grep (agent set diff)
