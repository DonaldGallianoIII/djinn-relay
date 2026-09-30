---
title: synthesis, audits/2026-09-27-1806-custom
author: Claude Opus 5.5 (synthesis)
date: 2026-09-27
status: agent output, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

scope: custom
agents expected: known-bugchecker, integration-reviewer, breaker, security-reviewer, ux-reviewer, devils-advocate
agents received: known-bugchecker, integration-reviewer, breaker, security-reviewer, ux-reviewer, devils-advocate
agents missing: none
changed files in fence: 26

## Fix List

### HIGH
HIGH-1. `plugins/djinn/commands/review.md:162` Step 3 item 6 appends `git diff --no-index /dev/null <file>` for every untracked, unignored fenced file, so an unignored `.env` or key file is written whole into `input-diff.patch`, which is committed and handed to every agent. Source: breaker (HIGH). Report: agents/breaker.md
HIGH-2. `plugins/djinn/commands/review.md:222` File names and config strings are typed raw into Bash command lines (review.md:71, :104, :155, :164, :212, :217, :222; dispatch.md:160 to 162, :242; gate-auditor.md:90 to 92; proof-runner.md:147 `{file}`), so a name holding `'`, `$(` or a space breaks the command or runs as shell. Source: security-reviewer (HIGH), confirmed by breaker (LOW-6), security-reviewer (REC-3). Report: agents/security-reviewer.md
HIGH-3. `plugins/djinn/agents/proof-runner.md:147` The only memory limit on a proof run is `--max-old-space-size`, which bounds the V8 heap and not Buffer or ArrayBuffer memory, and the half-of-total check at :70 to 72 counts one cap for a file that may start several node children, so the agent's claim to protect the machine does not hold. Source: breaker (HIGH). Report: agents/breaker.md

### MEDIUM
MEDIUM-1. `plugins/djinn/agents/gate-auditor.md:280` gate-auditor, data-contract-reviewer (:268) and live-system-reviewer (:334) write their own `## Round <n-1> status` and hold the only RESOLVED rules for their domains, while dispatch.md:264 to 266 tells them not to re-verify and synthesis.md:111 to 131 builds the one status table without those rules; five older agents and known-bugchecker.md:117 (blast radius) use three other words for the same job. Source: integration-reviewer (MEDIUM). Report: agents/integration-reviewer.md
MEDIUM-2. `plugins/djinn/agents/proof-runner.md:199` proof-runner's HIGH and MEDIUM findings (CAPPED, TIMEOUT, tree changed) reach no consumer: synthesis.md:52 to 55 reads the Proof table only, dispatch.md:280 to 282 hands proof.md over as "not a status", dispatch Step 7 has no branch on `Stopped:`, and the dispatch ledger line carries no STOPPED word. Source: integration-reviewer (MEDIUM). Report: agents/integration-reviewer.md
MEDIUM-3. `plugins/djinn/commands/review.md:84` The accessibility trigger regex matches only `\x1b[` and `\u001b[`, missing `\033[`, `\e[` and color libraries, while ux-reviewer.md:106 to 109 now files color-only meaning as an untiered REC to accessibility-reviewer, so the colorblind hard rule on terminal output can no longer reach a blocking tier. Source: integration-reviewer (MEDIUM). Report: agents/integration-reviewer.md
MEDIUM-4. `plugins/djinn/agents/fixer.md:100` The fixer's own narrowed test run carries a heap cap only when dispatch pastes `proof.heap_mb`, and dispatch.md:39 reads `proof` only under `--prove`, so on every plain dispatch dispatch.md:136 pastes `none` and the fixer runs tests with no cap. Source: known-bugchecker (MEDIUM, unverified), confirmed by integration-reviewer (checked), breaker (checked). Report: agents/known-bugchecker.md
MEDIUM-5. `plugins/djinn/commands/dispatch.md:206` The landing lane runs `test_cmd` automatically after "go" with no heap cap, no timeout and no memory check, while CONTRACTS.md:222 and templates/config.yaml:90 describe `proof.heap_mb` as the cap for every test process. Source: devils-advocate (HIGH (SABOTAGES THE GOAL)). Report: agents/devils-advocate.md
MEDIUM-6. `plugins/djinn/agents/proof-runner.md:138` The hand-mutant grep covers only the fixed files and stops only on a changed line, so a mutant already committed in a fixed file, or one in the test file about to run, is run and can read as PASS. Source: known-bugchecker (MEDIUM, unverified), confirmed by integration-reviewer (checked). Report: agents/known-bugchecker.md
MEDIUM-7. `plugins/djinn/agents/proof-runner.md:116` The pre-run screen reads only the chosen file and refuses only browser drivers and `npm`, `npx`, `git`, installer or build spawns, so a one-hop helper that starts a browser, a node child with its own `--max-old-space-size` or its own `env`, a non-node child, a network or billed API call (the game repo tools/meshy.mjs), or a `.env` read runs as the owner, and neither the dispatch plan (dispatch.md:98 to 99) nor the prompt says a file runs with the owner's environment. Source: breaker (MEDIUM-1), breaker (MEDIUM-2), security-reviewer (MEDIUM-1). Report: agents/breaker.md
MEDIUM-8. `plugins/djinn/agents/proof-runner.md:63` The runner check asks only that `{heap_mb}` and `{file}` appear, so a template with `cd x && node ...`, `npm run build && ...` or an inert `{heap_mb}` passes, runs outside `timeout` or the cap, and :152 then drops `NODE_OPTIONS` for a non-node runner. Source: breaker (MEDIUM-7), confirmed by security-reviewer (MEDIUM-1). Report: agents/breaker.md
MEDIUM-9. `plugins/djinn/commands/review.md:150` Untracked files enter the fence with no count or size limit, so an unignored `node_modules/` or `.venv/` puts thousands of paths into every agent prompt and every file's source into the patch, fires most conditional triggers, and can pass ARG_MAX on the pathspec greps. Source: breaker (MEDIUM). Report: agents/breaker.md
MEDIUM-10. `plugins/djinn/agents/proof-runner.md:135` The tree snapshot reads raw `git status --porcelain=v1 --untracked-files=all` into context before the first run and after every run, and the stop rule pastes both outputs, so a repo with many untracked files floods the agent before it writes the report. Source: breaker (MEDIUM). Report: agents/breaker.md
MEDIUM-11. `plugins/djinn/commands/dispatch.md:236` The scope-leak listing is taken after the landing lane and proof-runner run, so files those test runs write are named fixer scope leaks and added to the round fence. Source: breaker (MEDIUM). Report: agents/breaker.md
MEDIUM-12. `plugins/djinn/agents/gate-auditor.md:90` gate-auditor's allowlist reads commit subjects only, so a failure recorded in a commit body (the game repo 2008cdc, bbdbd03) is invisible and a check recorded as failing files as LOW (STALE) instead of the MEDIUM that gate-auditor.md:257 to 259 gives it. Source: devils-advocate (MEDIUM). Report: agents/devils-advocate.md
MEDIUM-13. `plugins/djinn/commands/review.md:96` The cost trigger never fires on a test file, and perf-reviewer.md:19 to 23 now hands every OOM to cost-complexity-reviewer, so in a standard scope an OOM in a test lane (the anchor incident's shape) has no agent that tiers it. Source: devils-advocate (MEDIUM). Report: agents/devils-advocate.md
MEDIUM-14. `plugins/djinn/agents/live-system-reviewer.md:141` The live reviewer reads captures and run logs of a third-party system and writes concrete Scenario lines, but its never-write rule covers only secrets, URLs, hostnames and keys, so a client's name, address or case number can land in the committed report and in the `review_copy` outside the repo. Source: security-reviewer (MEDIUM). Report: agents/security-reviewer.md

### LOW
LOW-1. `plugins/djinn/agents/proof-runner.md:147` The run call never sets the Bash tool's own timeout, so a harness timeout at or before `proof.timeout_s` can cut the call before the `EXIT=` line and turn a TIMEOUT into a Bash-failure stop. Source: breaker (MEDIUM-3). Report: agents/breaker.md
LOW-2. `plugins/djinn/agents/proof-runner.md:135` The tree snapshot cannot see writes to ignored files, content changes to untracked files, or a same-size rewrite of an already modified binary (`git diff` without `--binary`). Source: breaker (MEDIUM-4). Report: agents/breaker.md
LOW-3. `plugins/djinn/agents/accessibility-reviewer.md:43` The new agents carry the gap-hunter's cited game repo evidence as worked examples (also data-contract-reviewer.md:151, proof-runner.md:249, CONTRACTS.md:120), so replaying them on that evidence measures recall of the prompt, and no replay on an unseen incident exists. Source: devils-advocate (MEDIUM-3). Report: agents/devils-advocate.md
LOW-4. `plugins/djinn/commands/review.md:22` "Do not read `proof` here" leaves the cost-complexity-reviewer block's `proof.heap_mb` (review.md:276) as `none` in every review and every plain dispatch round. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-5. `plugins/djinn/agents/devils-advocate.md:3` The description claims the `perf` scope and an "unproven" trigger that review.md:46 and :330 do not give it. Source: integration-reviewer (LOW), confirmed by ux-reviewer (REC-9). Report: agents/integration-reviewer.md
LOW-6. `plugins/djinn/agents/integration-reviewer.md:125` integration-reviewer, devils-advocate (:68 to 73) and security-reviewer (:85 to 86) each claim doc and comment truth with no handoff, and ux-reviewer.md:119 and :134 point only at devils-advocate. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-7. `plugins/djinn/agents/cost-complexity-reviewer.md:225` Two lane pairs share a line with no handoff sentence: bugs-reviewer and cost-complexity-reviewer on unbounded memory, data-contract-reviewer and gate-auditor on a drift check that compares only generated keys. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-8. `plugins/djinn/agents/synthesis.md:19` The own-sections list misses accessibility-reviewer's UI files, dependency-reviewer's Inputs missing, UNVERIFIED and Replacement verdicts (dependency-reviewer.md:159, blast radius), proof-runner's Limits, Tree and Failure output, and gap-hunter's sections. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-9. `plugins/djinn/commands/dispatch.md:274` The round synthesis prompt carries no scope, expected agents, not-run list or tree-facts path, and the tree-facts path is also missing from the fixer, proof-runner and consolidator prompts. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-10. `plugins/djinn/agents/proof-runner.md:81` Index mode keys on a Status line the configured index does not have, and consolidator's `## Untested entries` (consolidator.md:175) has no consumer. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-11. `plugins/djinn/agents/proof-runner.md:81` Index mode never checks that an entry belongs to this repo, and its audit-id keys collide across audits. Source: breaker (LOW). Report: agents/breaker.md
LOW-12. `plugins/djinn/templates/config.yaml:92` The template writes `none` and `[]` into `proof.runner`, `test_globs` and `max_files`, whose defaults apply only when absent, so a template copy with only the two caps set marks every file NOT RUN. Source: integration-reviewer (LOW), confirmed by ux-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-13. `plugins/djinn/agents/gate-auditor.md:40` Cites `test-strategist.md:18` for a line that now sits at :19. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-14. `plugins/djinn/agents/gate-auditor.md:95` gate-auditor bans `git status` for rewriting the index while CONTRACTS.md:394 and proof-runner.md:135 call it read only, and gate-auditor's allowed `git diff --name-only HEAD` (:92) refreshes the index the same way. Source: integration-reviewer (LOW), confirmed by breaker (LOW-1), ux-reviewer (REC-9). Report: agents/integration-reviewer.md
LOW-15. `plugins/djinn/CONTRACTS.md:56` Section 1 gives gate-auditor LOW and MEDIUM only, while gate-auditor.md:251 to 254 defines a HIGH, which synthesis would move down every time. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-16. `plugins/djinn/commands/dispatch.md:235` A `live` scope round's fence is the union of work sets, not the whole tool that CONTRACTS.md:154 to 156 names, while the agent is still told its fence is the whole tool. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-17. `plugins/djinn/commands/review.md:126` The custom-list guard stops proof-runner but not fixer, and a custom list naming dependency-reviewer or consolidator skips them with no not-run line. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-18. `plugins/djinn/agents/multiuser-reviewer.md:108` The new handoff reads `data.invariants`, which review.md:271 to 285 pastes only to data-contract-reviewer. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-19. `plugins/djinn/commands/dispatch.md:256` The round prompt gives devils-advocate no goal statement and no round patch, so hunk item 6 re-walks round 1's patch. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-20. `plugins/djinn/CONTRACTS.md:312` Stale prose: the dispatch ledger examples lack `tokens=` and `proof=`, README.md:132 leaves `goal_doc` out of the multiuser gate, and gate-auditor.md:3 and data-contract-reviewer.md:3 omit the `live` exclusion. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md
LOW-21. `plugins/djinn/agents/gate-auditor.md:93` "`grep` or `rg` over the repo" allows `rg --pre` and `--search-zip`, which run programs, and a `grep -r` that reads an unignored `.env`. Source: breaker (LOW-2), confirmed by security-reviewer (REC-1). Report: agents/breaker.md
LOW-22. `plugins/djinn/commands/review.md:220` Tree-facts item 5 builds a regex from a raw base name, so `el`, `index` or `test` flood false import facts and a `(` breaks the grep. Source: breaker (LOW-3). Report: agents/breaker.md
LOW-23. `plugins/djinn/commands/review.md:84` The content triggers grep every fenced file including markdown, so they match their own definitions and prose, and the live trigger fires on a project's own Playwright benches (the game repo tools/bench-*.mjs). Source: breaker (LOW-4), confirmed by integration-reviewer (REC-2). Report: agents/breaker.md
LOW-24. `.djinn/config.yaml:14` The voice `build_cmd` checks the Conventions repo when `find` returns nothing and crashes on a path with a space. Source: breaker (LOW-5). Report: agents/breaker.md
LOW-25. `plugins/djinn/agents/proof-runner.md:59` `proof.max_files` has no ceiling, and each run can put about 20 KB of output into context. Source: breaker (LOW-8). Report: agents/breaker.md
LOW-26. `plugins/djinn/agents/proof-runner.md:258` Failure output is copied verbatim into a committed report with no redaction of secrets a test prints. Source: security-reviewer (LOW-1). Report: agents/security-reviewer.md
LOW-27. `plugins/djinn/commands/review.md:275` Nothing checks that `cost.paid_apis[].key` holds an env var name before it is pasted into prompts and a `git grep -F` line. Source: security-reviewer (LOW-2). Report: agents/security-reviewer.md
LOW-28. `plugins/djinn/commands/review.md:415` The `review_copy` path is built from `live.systems[].name` and `live.review_copy` with no sanitizing, so `/` or `..` writes outside the folder. Source: security-reviewer (LOW-3). Report: agents/security-reviewer.md
LOW-29. `plugins/djinn/CONTRACTS.md:410` The web rule lets dependency-reviewer search "public package names" with no test for telling a private or git dependency apart. Source: security-reviewer (LOW-4). Report: agents/security-reviewer.md
LOW-30. `plugins/djinn/agents/ux-reviewer.md:48` ux-reviewer and dependency-reviewer (dependency-reviewer.md:111, blast radius) hold web tools with no data-not-instructions or query-content rule in their own files. Source: security-reviewer (LOW-5). Report: agents/security-reviewer.md
LOW-31. `plugins/djinn/templates/config.yaml:117` `first_live_run` is asked for and no rule reads it. Source: ux-reviewer (LOW-2). Report: agents/ux-reviewer.md
LOW-32. `plugins/djinn/agents/accessibility-reviewer.md:110` With no `ui_paths`, a mark-data module such as the game repo src/viewer/unit-marks.js is sorted "not UI", and nothing asks the owner to set the key. Source: devils-advocate (LOW-1). Report: agents/devils-advocate.md
LOW-33. `plugins/djinn/agents/live-system-reviewer.md:3` The projects holding the third-party-page evidence (the automation repo, the extension repo) have no `.djinn/config.yaml`, so the agent's first real run will not be on that evidence. Source: devils-advocate (LOW-2). Report: agents/devils-advocate.md
LOW-34. `plugins/djinn/agents/devils-advocate.md:86` Hunk item 6 takes a static `goal_doc` as the goal, so a stale one (the game repo's amendment-kit-bench.md) flags every hunk and an empty commit range skips the item. Source: devils-advocate (LOW-3). Report: agents/devils-advocate.md
LOW-35. `plugins/djinn/commands/review.md:414` The `review_copy` write outside `audits/`, and the softened "never anywhere else" rule at :473 to 475, trace to no goal line. Source: devils-advocate (LOW-4). Report: agents/devils-advocate.md

### DEBT
DEBT-1. `plugins/djinn/agents/synthesis.md:19` Every agent that adds an own section needs a hand edit to synthesis's list; a CONTRACTS.md section 3 rule would scale with agent count. Source: integration-reviewer (DEBT)
DEBT-2. `plugins/djinn/agents/gate-auditor.md:185` The hand-mutant grep lives in four places with four patterns and scopes (review.md:212, gate-auditor.md:185, proof-runner.md:138, the known-bugs entry). Source: integration-reviewer (DEBT)
DEBT-3. `plugins/djinn/commands/review.md:66` A config-free project no longer reviews as it did in 2.2.0 (untracked fence, four content triggers), and no file says so. Source: breaker (DEBT)
DEBT-4. `plugins/djinn/CONTRACTS.md:388` Every executing command comes from `.djinn/config.yaml`, which a reviewed branch can change. Source: security-reviewer (DEBT)
DEBT-5. `plugins/djinn/agents/live-system-reviewer.md:123` The six new agents each copy the same five boilerplate blocks; a CONTRACTS.md "every review agent" section would cut about 250 lines. Source: ux-reviewer (DEBT)

### REC
REC-1. integration-reviewer: add a CONTRACTS.md section on round n ownership: who writes status, who reports domain RESOLVED rules, which paths each agent gets.
REC-2. integration-reviewer: a scripted dry run of review then dispatch round 2 on a fixture repo, asserting every prompt carries each key its Inputs section names.
REC-3. breaker: a proof-runner fixture repo (Buffer growth past heap_mb, a hang past timeout_s, an ignored-file write, a node spawn with an empty env, a name with a space), each ending in its named verdict.
REC-4. breaker: a preflight fixture repo (an unignored .env, 5,000 untracked files, a 200 MB untracked JSON, a file named with a space), asserting the patch holds no .env content and the run stops at step 3.
REC-5. security-reviewer: in CONTRACTS.md section 9, allow following a link from a fetched page only to a host the agent could have queried directly.
REC-6. security-reviewer: a relay security test, a tracked file named with a command substitution and an untracked one with a quote, run through a quick review, passing when no marker file exists afterward.
REC-7. ux-reviewer: put the verdict word first in the gate table (gate-auditor.md:304) and the proof table (proof-runner.md:247).
REC-8. ux-reviewer: give "Before the first live run" a leading readiness word and write an absent safety control as MISSING (live-system-reviewer.md:373), and add a held or BROKEN column to data-contract-reviewer's Stated invariants.
REC-9. ux-reviewer: one comment line each in templates/config.yaml for cost.load bytes, gates guards, the heap_mb ceiling and the empty list to delete when uncommenting; make cost.limits entries objects.
REC-10. ux-reviewer: move README.md:139's proof-runner paragraph under "Fix something it found" and show the direct and index routes with their report paths.
REC-11. ux-reviewer: point both refusals (review.md:157, :440) at the commented template block and say each system needs name and code.
REC-12. ux-reviewer: shorten relay.md:143's full row and README's four agent lines over 80 columns.
REC-13. ux-reviewer: label project-specific examples as "example project", drop the work repo sentence (data-contract-reviewer.md:206), and refer to AUTOMATION.md generically.
REC-14. ux-reviewer: CONTRACTS.md:295 gives the review_copy name as the system name only; review.md:417 adds live when there are several.

## Conflicts Resolved
- HIGH-2: security-reviewer said HIGH, breaker said LOW-6 for the same unquoted `{file}` splice. The file shows proof-runner.md:147 splicing the filled runner template with no quoting, and review.md:222 putting `<name>` inside a single-quoted regex, so a `'` in a name ends the string whatever the orchestrator does. The mechanism is agreed. The tier follows the security bar: the plugin is published (README install) and `/djinn:review` is the command someone runs on a checked-out branch. Kept: HIGH. One caveat for Donald: security-reviewer's own DEBT-4 treats a contributor's branch as future use. If the plugin stays single-owner, this falls to MEDIUM on the accidental-name path (an apostrophe or a space) alone.
- MEDIUM-4 and MEDIUM-6: known-bugchecker filed both as unverified. integration-reviewer and breaker confirmed MEDIUM-4, integration-reviewer confirmed MEDIUM-6, and synthesis read fixer.md:100 to 103 and proof-runner.md:138 to 142. Both are real. Kept.
- MEDIUM-5: devils-advocate said breaker missed the landing lane. breaker's MEDIUM-11 is a different mechanism on the same lane (file side effects, not the cap). Both kept.
- LOW-4: integration-reviewer called it the same root as MEDIUM-4. The consumers differ (cost-complexity-reviewer in review against the fixer in dispatch), so the two stay separate findings. They share one edit in the Rewrite plan.
- LOW-14: gate-auditor.md:95 says `git status` rewrites the index, CONTRACTS.md:394 says it is read only, and breaker says `git diff` does the same. That is git internals, which no file here can settle, and breaker marked its own claim unverified. The fix (`--no-optional-locks` and `core.fsmonitor=false` on every allowed git read) makes the question moot. It stays LOW and blocks nothing, so this is not an escalation.

## Fix disagreements (human decides)
- D1, HIGH-1 and MEDIUM-9: option A, breaker's name blocklist (`.env*`, `*.pem`, `*.key`, `id_*`, `.npmrc`, `credentials*`, `*secret*`) withholds only those files, plus size-only lines for large or binary files. Option B, no untracked file's content enters the patch at all: the patch lists path and size, agents Read untracked files under their own secret rules, and the blocklist becomes a tree-facts section for security-reviewer. Recommendation: B. No list to keep current, and it closes MEDIUM-9's whole-file-in-patch half in the same sentence.
- D2, HIGH-2: option A refuses unsafe names (tree-facts `refused: shell characters in path`) and leaves them out of every command. Option B keeps every name in the fence, feeds every path list through `tr '\n' '\0' < fence.txt | xargs -0 <cmd> --`, passes every pattern built from a name or config value with `-f <file>`, and lets only proof-runner refuse an unsafe name (NOT RUN, unsafe name). Recommendation: B. Dropping `notes draft.md` from review is worse than the rare hostile name, and B needs no refusal.
- D3, HIGH-3: option A wraps each run in `systemd-run --user --scope -p MemoryMax=<heap_mb*2>M -p MemorySwapMax=0` and refuses when that is unavailable. Option B adds a `proof.memory_wrapper` key the owner fills, with A as its documented example, and refuses without it. Option C documents the Buffer hole and keeps the heap-only cap. Recommendation: B. No file establishes whether `systemd-run --user` works under this WSL, and refusing without a resident cap matches the standing ruling that proof-runner refuses without its caps. CONTRACTS.md section 9's proof-runner Bash list has to name the wrapper too.
- D4, MEDIUM-1: option A moves the three domain RESOLVED rules into synthesis.md's Round 2 section and rewrites every reviewer's round section in the accessibility-reviewer shape (review the fix diffs, file new findings, no status). Option B keeps the agents' status sections as named own sections that synthesis reads. Recommendation: A. dispatch.md:264 already tells reviewers not to re-verify, and one table is what the verdict reads.
- D5, MEDIUM-3: option A widens the review.md:84 regex (`\\033\[`, `\\e\[`, chalk, kleur, picocolors, colorama, rich, termcolor). Option B gives accessibility-reviewer ux-reviewer's "CLI entry point" trigger. Recommendation: A. It is narrower, and B spawns accessibility-reviewer on every CLI change. Pair it with the synthesis handoff edit (S3) either way.
- D6, MEDIUM-4, MEDIUM-5 and LOW-4: option A makes dispatch always read `proof`. The fixer then runs no test of its own when `heap_mb` is none. The landing lane runs under `NODE_OPTIONS` and `timeout` when both caps are set, and the plan prints `landing lane: uncapped, test_cmd as configured` when they are not. A `--no-tests` flag skips the lane. Option B, devils-advocate's: skip the landing lane entirely without both caps. Recommendation: A. B silently turns off the lane for every project with no `proof` block, the game repo's `test_cmd` already caps each child, and the plan line puts the choice in front of the "go". Neither option spawns proof-runner, so the standing ruling holds.
- D7, MEDIUM-7: option A, security-reviewer's: run each file under `env -i PATH="$PATH" HOME="$(mktemp -d)"`, and refuse any test file the landed diffs added or changed. Option B discloses "runs as your user, with your environment, files and network" in the Role, the plan and the template. It widens the screen one import hop and marks NOT RUN any file whose text or one-hop imports hold `child_process`, a `--max-old-space-size`, an `env:` on a spawn, `fetch(`, `http`, `https`, `net`, a `.env` or `process.env` read, or a `cost.paid_apis` key name. It also runs with each paid key env var set empty. Recommendation: B. A refuses the regression test a fixer writes, which is the proof most worth having. B needs dispatch and review to paste `cost.paid_apis` names to proof-runner.
- D8, MEDIUM-8: option A, breaker's: refuse a runner holding `&&`, `||`, `;`, `|`, a backtick, `$(`, `>` or `<`, refuse one where `{heap_mb}` is not inside `--max-old-space-size=` or a named cap flag, and require the D3 wrapper for a non-node runner. Option B adds security-reviewer's rule on top: the first word must be `node`, `python3` or `pytest`. Recommendation: A. B refuses vitest and jest runners for no gain A lacks.
- D9, MEDIUM-9: option A aborts step 3 above `MAX_UNTRACKED` (200) or on any `node_modules/`, `.venv/`, `venv/`, `vendor/`, `dist/`, `build/` or `__pycache__/` segment, with a `--untracked none` flag. Option B fences the first `MAX_UNTRACKED` and lists the rest in tree-facts. Recommendation: A, loud over partial. The number 200 is Donald's to set.
- D10, MEDIUM-13: option A adds `tests/`, `test/`, `*.test.*`, `*.spec.*` and the runner configs to the cost trigger. Option B has the orchestrator paste `cost-complexity-reviewer: running | not running` into perf-reviewer's block, and perf-reviewer files an OOM itself when it is not running. Recommendation: B. A spawns a web agent on nearly every game repo change.
- D11, LOW-14: option A allows `git status` everywhere and prefixes every allowed git read with `git --no-optional-locks -c core.fsmonitor=false`, dropping gate-auditor's exclusion. Option B forbids `git status` everywhere. Recommendation: A. proof-runner's snapshot needs a status read.
- D12, LOW-12: option A comments the three proof keys out in the template. Option B adds one CONTRACTS.md section 5 sentence: `none` and an empty list mean absent for every optional key. Recommendation: B. It covers every optional key and every future one.
- D13, LOW-31: option A gives `first_live_run` a rule (a writer with it unset and no kill switch is `MEDIUM (BLIND FIRST RUN)` in any scope). Option B drops the key from the template, CONTRACTS.md:242 and live-system-reviewer.md:70. Recommendation: B. A new MEDIUM rule is new scope in a fix pass.
- D14, LOW-35: option A keeps `review_copy` (opt-in, default none) with LOW-28's sanitizing. Option B removes the key and restores "never anywhere else". Recommendation: A. It is opt-in, and LOW-28 closes the real risk.
- D15, LOW-3 and REC-13: option A scrubs game repo worked examples from the new prompts. Option B keeps them labeled "example project" and records, in the build's status, that no agent has been replayed on an incident its prompt does not name. Recommendation: B. The examples teach the pattern. The claim to fix is the success claim, not the prompt.

## Re-tiered
- MEDIUM-5 was devils-advocate HIGH (SABOTAGES THE GOAL): now MEDIUM because the traced arithmetic (4 children at 4096 MB, 16 GB on a 31 GB machine) does not reach a crash. A crash needs HIGH-3's Buffer hole or a `test_cmd` with no cap of its own. What is left, an uncapped automatic run that contradicts the config's stated scope under realistic use, meets MEDIUM.
- LOW-1 was breaker MEDIUM-3: now LOW because the tier rests on a harness Bash default of 120 s and a maximum of 600 s, both stated from memory with no URL or date. Under CONTRACTS.md section 1, an uncited limit is a variable. The missing tool-timeout instruction is real at proof-runner.md:143 to 148. A cited figure restores MEDIUM.
- LOW-2 was breaker MEDIUM-4: now LOW because no traced test reaches the gap. The named writers are bots, which proof-runner.md:119 to 121 marks NOT RUN, and "save tests" with no file cited.
- LOW-3 was devils-advocate MEDIUM-3: now LOW because it is about how the build's success was measured, not behavior a user hits.
- HIGH-2 absorbs breaker LOW-6: moved up on reading proof-runner.md:147 and review.md:212, :217 and :222, which carry the same unquoted splice security-reviewer traced.
- Merged without a tier change: security-reviewer REC-3 into HIGH-2; security-reviewer REC-4 into MEDIUM-7 (the disclosure sentence); security-reviewer REC-1 into LOW-21; integration-reviewer REC-2 into LOW-23; ux-reviewer REC-9 into LOW-5 and LOW-14; breaker's Handed off line (CONTRACTS.md:394 against proof-runner.md:135) into LOW-14; integration-reviewer's blast radius on known-bugchecker.md:117 into MEDIUM-1 and on dependency-reviewer.md:159 into LOW-8; security-reviewer's blast radius on dependency-reviewer.md:111 into LOW-30.

## Dismissed by synthesis
none

## Coverage
- `.djinn/config.yaml`: covered by known-bugchecker (patterns), integration-reviewer, breaker, security-reviewer, ux-reviewer
- `plugins/djinn/.claude-plugin/plugin.json`: covered by known-bugchecker (patterns), integration-reviewer, breaker, security-reviewer, ux-reviewer
- `plugins/djinn/CONTRACTS.md`: covered by known-bugchecker (patterns), integration-reviewer, breaker (sections 4, 5, 6, 7, 9, 11 and the proof block only), security-reviewer, ux-reviewer, devils-advocate
- `plugins/djinn/README.md`: covered by known-bugchecker (patterns), integration-reviewer, breaker, security-reviewer, ux-reviewer, devils-advocate
- `plugins/djinn/agents/accessibility-reviewer.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer, devils-advocate; breaker partial (only :117)
- `plugins/djinn/agents/breaker.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer (wording only); breaker partial
- `plugins/djinn/agents/bugs-reviewer.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer (wording only); breaker partial
- `plugins/djinn/agents/consolidator.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer (wording only); breaker partial
- `plugins/djinn/agents/cost-complexity-reviewer.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer, ux-reviewer; breaker partial
- `plugins/djinn/agents/data-contract-reviewer.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer, ux-reviewer, devils-advocate; breaker partial
- `plugins/djinn/agents/devils-advocate.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer (wording only); breaker partial
- `plugins/djinn/agents/fixer.md`: covered by known-bugchecker (patterns), integration-reviewer, breaker (:100 to 102 only), security-reviewer, ux-reviewer (wording only)
- `plugins/djinn/agents/gate-auditor.md`: covered by known-bugchecker (patterns), integration-reviewer, breaker, security-reviewer, ux-reviewer, devils-advocate
- `plugins/djinn/agents/integration-reviewer.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer (wording only); breaker partial
- `plugins/djinn/agents/live-system-reviewer.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer, ux-reviewer, devils-advocate; breaker partial
- `plugins/djinn/agents/multiuser-reviewer.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer (wording only); breaker partial
- `plugins/djinn/agents/perf-reviewer.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer (wording only), devils-advocate; breaker partial
- `plugins/djinn/agents/proof-runner.md`: covered by known-bugchecker (patterns), integration-reviewer, breaker, security-reviewer, ux-reviewer, devils-advocate
- `plugins/djinn/agents/security-reviewer.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer (wording only); breaker partial
- `plugins/djinn/agents/synthesis.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer (wording only); breaker partial
- `plugins/djinn/agents/test-strategist.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer (tools line), ux-reviewer (wording only); breaker partial
- `plugins/djinn/agents/ux-reviewer.md`: covered by known-bugchecker (patterns), integration-reviewer, security-reviewer, ux-reviewer; breaker partial
- `plugins/djinn/commands/dispatch.md`: covered by known-bugchecker (patterns), integration-reviewer, breaker, security-reviewer (HIGH-2 and REC-3 cites), ux-reviewer, devils-advocate
- `plugins/djinn/commands/review.md`: covered by known-bugchecker (patterns), integration-reviewer, breaker, security-reviewer, ux-reviewer, devils-advocate
- `plugins/djinn/relay.md`: covered by known-bugchecker (patterns), integration-reviewer, breaker, security-reviewer, ux-reviewer
- `plugins/djinn/templates/config.yaml`: covered by known-bugchecker (patterns), integration-reviewer, breaker, security-reviewer, ux-reviewer
- Breaker coverage gap, stated in its own report: it did not read the non-executing agent prompts in full. It says "fourteen" and names sixteen: accessibility, breaker, bugs, consolidator, cost-complexity, data-contract, devils-advocate, fixer, integration, live-system, multiuser, perf, security, synthesis, test-strategist, ux. Every one of those sixteen was read by at least integration-reviewer and security-reviewer, so none is uncovered. No attacker lane walked them.
- known-bugchecker checked 22 of 46 index patterns. The other 24 have no Detection line and were not checked.
- Reviewer definitions: every reviewer ran as the installed, cached 2.1.0 definition (context.md:39 to 40), so integration-reviewer ran without this build's doc-truth widening, and devils-advocate without hunk item 6 as written here. devils-advocate walked the hunks anyway from the goal document.
- Agents missing: none
- Not run in this scope: format-reviewer, bugs-reviewer, perf-reviewer, multiuser-reviewer, pipe-connector, gap-hunter, dependency-reviewer, test-strategist, consolidator, and the six new agents (not installed yet: cost-complexity-reviewer, accessibility-reviewer, gate-auditor, proof-runner, live-system-reviewer, data-contract-reviewer). With bugs-reviewer and format-reviewer absent, no agent owned plain wrong-behavior or style lanes over the 26 files apart from what integration-reviewer and breaker filed.
- known-bugchecker Index and Flagged: 2 flags (fixer.md:100, proof-runner.md:138), both confirmed and kept as MEDIUM-4 and MEDIUM-6.
- breaker Handed off: one line (CONTRACTS.md:394 against proof-runner.md:135). The owner, integration-reviewer, ran and filed it (LOW-14 of this list).
- No agent wrote an UNVERIFIED, Inputs missing, Cost model, Gate table, Live surface or Proof table section in this round.
- Tree facts: none written for this run. The installed 2.1.0 orchestrator has no tree-facts step, and the untracked files were added to fence.txt by hand (context.md:14).
- Synthesis noticed, unreviewed: none

## Fence
- Files synthesis read: `audits/2026-09-27-1806-custom/fence.txt`, `audits/2026-09-27-1806-custom/context.md`, the six reports in `audits/2026-09-27-1806-custom/agents/`, `plugins/djinn/CONTRACTS.md`, `plugins/djinn/commands/review.md`, `plugins/djinn/commands/dispatch.md`, `plugins/djinn/agents/proof-runner.md`, `plugins/djinn/agents/fixer.md`, `plugins/djinn/agents/synthesis.md`, `plugins/djinn/agents/gate-auditor.md`, `plugins/djinn/agents/perf-reviewer.md` (:1 to 40), `plugins/djinn/agents/ux-reviewer.md` (:85 to 144), `plugins/djinn/agents/live-system-reviewer.md` (:60 to 169, :325 to 344, and a grep), `plugins/djinn/agents/data-contract-reviewer.md` (grep of the Round section), `plugins/djinn/templates/config.yaml`
- Reviewer reads outside the fence:
- integration-reviewer: `plugins/djinn/agents/known-bugchecker.md` (round section, lane pairs)
- integration-reviewer: `plugins/djinn/agents/dependency-reviewer.md` (own sections, lane pairs)
- integration-reviewer: `plugins/djinn/agents/gap-hunter.md` (lane pairs)
- integration-reviewer: `plugins/djinn/agents/format-reviewer.md` (lane pairs)
- integration-reviewer: `plugins/djinn/agents/pipe-connector.md` (lane pairs, first 60 lines)
- integration-reviewer: `plugins/djinn/commands/status.md` (consumer of audit folders)
- integration-reviewer: `audits/2026-09-27-1720-build/WIRING-REPORT.md` (writer's conflicts and notes)
- integration-reviewer: `~/Conventions/workflow/REVIEW.md` (devils-advocate citation check, grep)
- integration-reviewer: `<game repo>/tools/` (REC-2 grep count only)
- breaker: `~/Conventions/tools/check_voice.py` (build_cmd's callee)
- breaker: `/usr/lib/python3/dist-packages/yaml/__init__.py` (checker import exists, glob only)
- breaker: `<game repo>/tests/` (grep: child spawns, helper imports)
- breaker: `<game repo>/tools/serve.mjs` (grep: spawned child inherits env)
- breaker: `<game repo>/tools/meshy.mjs` (grep: fetch and .env read)
- security-reviewer: `plugins/djinn/agents/dependency-reviewer.md` (web agent, checking rule carriage)
- devils-advocate: `audits/2026-09-27-1655-ideas/agents/gap-hunter.md` (goal document)
- devils-advocate: `audits/2026-09-27-1720-build/WIRING-REPORT.md` (writer's choices and notices)
- devils-advocate: `audits/2026-09-27-1720-build/BRIEF.md` (build brief)
- devils-advocate: `audits/LEDGER.md` (diff hunk check)
- devils-advocate: `<game repo>/.djinn/config.yaml` (first real run config)
- devils-advocate: `<game repo>/audits/LEDGER.md` (unverified landing evidence)
- devils-advocate: `<game repo>/audits/2026-09-27-1258-full/synthesis.md` (cited evidence lines)
- devils-advocate: `<game repo>/src/viewer/unit-marks.js` (LOW-9 site, trigger tokens)
- devils-advocate: `<game repo>/src/sim/schema.js` (team cap)
- devils-advocate: `<game repo>/package.json` (landing lane command)
- devils-advocate: `<game repo>/qa/bot/viewer.mjs` (update refusal, grep)
- devils-advocate: the game repo `git log` of `2008cdc`, `bbdbd03`, `qa/bot/reference/viewer`, `src/viewer` (failure record, dates)
- devils-advocate: `<automation repo>/`, `<extension repo>/` listings (plugin reach)
- devils-advocate: `<work repo>/.djinn/config.yaml` (grep, optional keys)
- known-bugchecker, ux-reviewer: none reported

## Counts
HIGH 3, MEDIUM 14, LOW 35, DEBT 5, REC 14
Open across rounds: HIGH 3, MEDIUM 14, LOW 35

## Verdict: FIX THEN SHIP
Blocking: HIGH-1, HIGH-2, HIGH-3, MEDIUM-1 to MEDIUM-14. No fact dispute is open, so no escalation.

## Rewrite plan

Every edit the HIGH, MEDIUM and LOW findings add up to, grouped by file, merged where they touch the same sentences. Shared files come first. `[as written]` means apply the reviewer's fix as stated. `[Dn]` means it waits on that Fix disagreement above, and the edit shown is the recommended option. DEBT and REC are left out. None of these edits spawns proof-runner by default, puts a figure in from memory, or adds a second reader to the `live` scope, so the three standing rulings hold.

### 1. plugins/djinn/CONTRACTS.md
- C1. Section 1, gate-auditor bullet (:56): add "HIGH only when this diff made the main gate unable to fail for every input", matching gate-auditor.md:251 to 254. LOW-15. [as written]
- C2. Section 3 or a new short section: "Synthesis alone owns prior-finding status. Reviewers in round n review the fix diffs and file new findings; the domain RESOLVED rules live in synthesis.md." Also: "proof-runner's Findings are merged by synthesis like any report." MEDIUM-1, MEDIUM-2. [D4]
- C3. Section 4, fence and tree facts: untracked files are listed by path and size and never pasted into the patch, and secret-shaped names get their own tree-facts section. Untracked count cap `MAX_UNTRACKED` and the `--untracked none` flag. HIGH-1, MEDIUM-9. [D1, D9]
- C4. Section 5, one sentence: `none` and an empty list mean absent for every optional key. LOW-12. [D12]
- C5. Section 5, `proof`: add `memory_wrapper`, and "each file runs as your user, with your environment, files and network; the caps bound memory and time, nothing else". Change the example comment at :222 so it no longer claims "every test process" beyond what D6 wires. HIGH-3, MEDIUM-7, MEDIUM-5. [D3, D7, D6]
- C6. Section 5, `live`: the personal-data sentence from MEDIUM-14; the `review_copy` name keeps only `a` to `z`, `0` to `9` and `-`, the folder resolves inside the owner's home and outside every `live.systems[].code` path, and the file name is `live` when there are several systems. Drop `first_live_run` from the example (:242). MEDIUM-14 [as written], LOW-28 [as written], LOW-35 [D14], LOW-31 [D13].
- C7. Section 6: fix the dispatch example ledger lines (:314 to 315) to carry `tokens=` and `proof=`; the dispatch `proof=` field reads `<pass>/<run>` or `STOPPED <file>: <reason>`. LOW-20, MEDIUM-2. [as written]
- C8. Section 9, new shell rule: "Never type a file name or a config value into a command line. Feed paths from a file with `xargs -0`, pass patterns built from a name or config value with `-f`." HIGH-2. [D2]
- C9. Section 9, git reads: every allowed git read is prefixed `git --no-optional-locks -c core.fsmonitor=false`, and `git status --porcelain` stays allowed. gate-auditor's `git log` may carry `%b`. LOW-14 [D11], MEDIUM-12 [as written].
- C10. Section 9, proof-runner Bash list: add the resident memory wrapper, the Bash tool timeout set on every run call, and the hashed snapshot commands from P6. HIGH-3 [D3], LOW-1, MEDIUM-10, LOW-2 [as written]. The harness maximum used for the refusal must be cited with URL and date, never written from memory.
- C11. Section 9, grep: `git grep --untracked` or `rg` without `--pre`, `--pre-glob`, `--search-zip`, `-L` or `--no-ignore`, with `':!.env*' ':!*.pem' ':!*.key'` pathspecs. LOW-21. [as written]
- C12. Section 9, web rule (:410 to 413): "A package is public only when the lockfile resolves it from the ecosystem's default public registry; a git URL, file path, other registry or remapped scope is never searched." LOW-29. [as written]

### 2. plugins/djinn/commands/review.md
- R1. Step 1 (:18 to 23): read `proof.heap_mb` for the cost block and keep "this command never spawns proof-runner". Check each `cost.paid_apis[].key` against `^[A-Z_][A-Z0-9_]*$`, and on a mismatch stop and paste `key: withheld, not an env var name`. LOW-4 [D6], LOW-27 [as written].
- R2. Step 2 triggers: widen the accessibility regex at :84 (MEDIUM-3, [D5]). Run the content greps only over code extensions (`.js .mjs .cjs .ts .tsx .jsx .vue .svelte .py .html`), with `ui_paths` and `live.systems[].code` opting a path back in. The live trigger needs a `live.systems[].match` hit or excludes `tools/bench*` (LOW-23, [as written]). The cost trigger is unchanged under D10's option B (MEDIUM-13).
- R3. Custom list (:126 to 136): refuse `fixer` with the proof-runner sentence. A list naming dependency-reviewer or consolidator runs it, or lists it under not run with the reason. LOW-17. [as written]
- R4. Step 3 item 3 (:150): the untracked cap and abort line. Item 6 (:162 to 164): no untracked content in the patch, path and size only. Items 3, 4 and 6 read paths from a NUL-separated file. HIGH-1 [D1], MEDIUM-9 [D9], HIGH-2 [D2].
- R5. Tree facts (:208 to 223): items 3, 4 and 5 read paths from the fence file. Item 5 becomes a fixed-string grep for the import path forms (`/<name>.<ext>'`, `/<name>'` and the double-quoted pair) on import and require lines. Add the secret-shaped-names section. HIGH-2 [D2], LOW-22 [as written], HIGH-1 [D1].
- R6. Per-agent blocks (:271 to 290): multiuser-reviewer gets `data.invariants` (LOW-18, [as written]). perf-reviewer gets `cost-complexity-reviewer: running | not running` (MEDIUM-13, [D10]). consolidator's prompt (:373) gets the tree-facts path (LOW-9, [as written]).
- R7. Step 10 (:414 to 419): sanitize the `review_copy` name and folder as in C6. LOW-28 [as written], LOW-35 [D14].
- R8. proof-runner on request (:440 to 466): the prompt gains `cost.paid_apis` names and key env var names, the tree-facts path and `proof.memory_wrapper`. The `prove` ledger line carries the Stopped reason. MEDIUM-7 [D7], HIGH-3 [D3], LOW-9, MEDIUM-2 [as written].

### 3. plugins/djinn/commands/dispatch.md
- X1. Step 2 (:36 to 43): always read `proof`. Only proof-runner's refusal stays tied to `--prove`. MEDIUM-4, MEDIUM-5, LOW-4. [D6]
- X2. Step 5 plan (:96 to 99): add `Landing lane: capped <heap_mb> MB, <timeout_s> s | uncapped, test_cmd as configured | skipped (--no-tests)`, and add "runs as your user, with your environment, files and network" to the Proof line. Add the `--no-tests` flag to the usage line and Step 1. MEDIUM-5 [D6], MEDIUM-7 [D7].
- X3. Step 6 fixer prompt (:136 to 137): `proof.heap_mb` is always pasted, and with `none` the fixer runs no test of its own. Add the tree-facts path. MEDIUM-4 [D6], LOW-9 [as written].
- X4. Step 6 Collect item 3 (:160 to 162): read the untracked work-set paths from a file. The fixer's own new files keep their content in `<id>.diff`. HIGH-2. [D2]
- X5. Step 7.2 (:206 to 231): the landing lane runs under `NODE_OPTIONS=--max-old-space-size=<heap_mb>` and `timeout <timeout_s>` when both are set. The proof-runner prompt gains `cost.paid_apis` names, the tree-facts path and `proof.memory_wrapper`. After proof-runner returns, a `Stopped:` line naming a tree change halts the round and reports it. MEDIUM-5 [D6], MEDIUM-7 [D7], HIGH-3 [D3], MEDIUM-2 [as written].
- X6. Step 7.3 (:233 to 243): take the untracked listing once before Step 6 and again after the batches land. A leak is a file new in the second listing. Files that appear only after the landing lane or proof go on their own line, `written by test runs`, and never into FENCE. Apply the untracked cap. In a `live` audit the round fence is every tracked file under `live.systems[].code` plus the diff. Tree facts read paths from a file. MEDIUM-11 [as written], MEDIUM-9 [D9], LOW-16 [as written], HIGH-2 [D2].
- X7. Step 7.4 (:256 to 272): the round prompt drops the per-agent status role, and gate-auditor no longer gets the prior synthesis path for a status table. devils-advocate gets the goal statement and a round patch built from the landed diffs. MEDIUM-1 [D4], LOW-19 [as written].
- X8. Step 7.5 (:274 to 292): the synthesis prompt gains scope, agents expected, not run, the tree-facts path, and "merge proof-runner's Findings like any report". LOW-9, MEDIUM-2. [as written]
- X9. Step 8 ledger (:317) and Step 9 (:343): the proof field reads `<pass>/<run>` or `STOPPED <file>: <reason>`, and the landing lane line says capped, uncapped or skipped. MEDIUM-2 [as written], MEDIUM-5 [D6].

### 4. plugins/djinn/agents/synthesis.md
- S1. Round 2 section (:111 to 131): add the three domain RESOLVED rules. A STALE gate is RESOLVED only with pass evidence newer than the last change to its guarded paths. A live write fix is RESOLVED only with a re-query line cited. A data pair fix is RESOLVED only when one input agrees at both sites. MEDIUM-1. [D4]
- S2. Own sections (:19 to 59): add accessibility-reviewer's UI files, dependency-reviewer's Inputs missing, UNVERIFIED and Replacement verdicts, proof-runner's Limits, Tree and Failure output (and state that its Findings merge like any report), and gap-hunter's Already present and The One Question. MEDIUM-2, LOW-8. [as written]
- S3. Handed off (:56 to 59): a ux-reviewer REC naming accessibility-reviewer, when accessibility-reviewer did not run, becomes a Coverage line "synthesis noticed, unreviewed" with a note that the hard rule floor applies. MEDIUM-3. [as written]

### 5. plugins/djinn/agents/proof-runner.md
- P1. Inputs (:47 to 61): add `proof.memory_wrapper` and `cost.paid_apis` names with key env var names. `none` and `[]` read as absent (C4). `max_files` above `MAX_FILES_CEILING` (20) is refused. HIGH-3 [D3], MEDIUM-7 [D7], LOW-12 [D12], LOW-25 [as written].
- P2. Refuse (:63 to 72): the runner operator and cap-flag checks, and a non-node runner needs the wrapper. The half-of-total check counts the resident cap. Refuse when `timeout_s` plus the kill margin passes the cited harness maximum. MEDIUM-8 [D8], HIGH-3 [D3], LOW-1 [as written, figure cited].
- P3. Role (:8 to 16): replace "the safe way back" with the runs-as-your-user sentence. MEDIUM-7. [D7]
- P4. Index mode (:81 to 83): match the configured index's actual wording ("untested" in the Source prose) or read consolidator's `## Untested entries` report. Skip entries whose Source names another project, as NOT RUN (other project). The id is `<audit folder>/<id>`, or the bold title when an entry cites several ids. LOW-10, LOW-11. [as written]
- P5. Choosing the file and the screen (:102 to 128): read each relative import one hop out, and apply the widened NOT RUN list from D7. A file name outside `[A-Za-z0-9._/@+-]` is NOT RUN (unsafe file name). MEDIUM-7 [D7], HIGH-2 [D2].
- P6. Bash (:130 to 161): the snapshot becomes `git --no-optional-locks status --porcelain=v1 --untracked-files=all | tee >(wc -l >&2) | git hash-object --stdin`, plus `git diff --binary HEAD | git hash-object --stdin`, a hash over untracked file contents, an ignored-file count, and a `find -newer` stamp check. The agent reads hashes and counts only (MEDIUM-10, LOW-2, [as written]). The mutant grep covers the fixed files and every chosen test file, on any line (MEDIUM-6, [as written]). The run line uses the wrapper, the quoted `'{file}'`, empty paid key vars and the Bash tool timeout (HIGH-3 [D3], HIGH-2 [D2], MEDIUM-7 [D7], LOW-1 [as written]).
- P7. Stop rules (:179 to 187): on a snapshot mismatch, paste the first 50 lines of a diff between two files saved in `$TMPDIR`, never both full outputs. MEDIUM-10. [as written]
- P8. Limits section (:233 to 240): "heap cap (V8 only)" and a separate resident cap line. HIGH-3. [D3]
- P9. Failure output (:256 to 260): redact tokens over 20 mixed characters, `Bearer ` values and `KEY=`, `TOKEN=` and `SECRET=` values, and count them. LOW-26. [as written]
- P10. Round 2 (:213 to 217): unchanged, except to say its Findings are merged by synthesis. MEDIUM-2. [as written]

### 6. plugins/djinn/agents/gate-auditor.md
- G1. Description (:3): add the `live` exclusion. LOW-20. [as written]
- G2. Division of labor (:40): cite `test-strategist.md:19`. Add the "also a drift check, expect data-contract-reviewer" line. LOW-13, LOW-7. [as written]
- G3. Bash (:88 to 98): `git log --format='%cI %h %s%n%b' -n <k> -- <paths>` allowed; every git read carries C9's prefix and `git status --porcelain` is allowed; grep per C11; paths from a file. MEDIUM-12 [as written], LOW-14 [D11], LOW-21 [as written], HIGH-2 [D2].
- G4. Round 2 (:278 to 287): rewrite in the accessibility-reviewer shape. The STALE rule moves to S1. MEDIUM-1. [D4]

### 7. plugins/djinn/agents/fixer.md
- F1. Step 5 (:95 to 103): "With no `proof.heap_mb`, run no test yourself: TESTS: NOT-RUN, reason no heap cap. With one, prefix `NODE_OPTIONS=--max-old-space-size=<heap_mb>`, run one file at a time, under `timeout`." MEDIUM-4. [D6]

### 8. plugins/djinn/templates/config.yaml
- T1. `proof` block (:86 to 94): drop the `none` and `[]` values or rely on C4. Add `memory_wrapper`, a heap ceiling comment (at most half of `free -m` total) and the runs-as-your-user line. LOW-12 [D12], HIGH-3 [D3], MEDIUM-7 [D7].
- T2. `live` example (:117): drop `first_live_run`. LOW-31. [D13]

### 9. plugins/djinn/agents/live-system-reviewer.md
- L1. After :141: "A value from a capture, run log, fixture or `match` entry that names or identifies a person or a client (name, address, phone, date of birth, case or account number) is never written. Cite it by file:line as `personal value redacted`, and write Scenario lines with placeholders such as `<client A>`." MEDIUM-14. [as written]
- L2. Round 2 (:332 to 339): rewrite in the accessibility-reviewer shape. The re-query rule moves to S1. MEDIUM-1. [D4]
- L3. Inputs (:70 to 71): drop `first_live_run`. LOW-31. [D13]

### 10. plugins/djinn/agents/data-contract-reviewer.md
- DC1. Description (:3): add the `live` exclusion. LOW-20. [as written]
- DC2. The drift-check line (:188): "also a gate that passes by not checking, expect gate-auditor". LOW-7. [as written]
- DC3. Round 2 (:266 to 274): rewrite in the accessibility-reviewer shape. The both-sites rule moves to S1. MEDIUM-1. [D4]

### 11. Lane sentences and round sections in the older agents
- perf-reviewer.md (:19 to 23): "When your dispatch says cost-complexity-reviewer is not running, file an OOM or platform ceiling yourself." MEDIUM-13 [D10]. Round section (:141): accessibility shape. MEDIUM-1 [D4].
- bugs-reviewer.md: an "also a ceiling, expect cost-complexity-reviewer" line beside :59 (LOW-7, [as written]). Round section (:105): accessibility shape (MEDIUM-1, [D4]).
- cost-complexity-reviewer.md (:227): an "also a leak, expect bugs-reviewer" line. LOW-7. [as written]
- security-reviewer.md: at :85 to 86, doc truth about other code is integration-reviewer's (LOW-6, [as written]). Round section (:136): accessibility shape (MEDIUM-1, [D4]).
- integration-reviewer.md (:125): name devils-advocate as owner of claims about the change's own goal (LOW-6, [as written]). Round section (:206): accessibility shape (MEDIUM-1, [D4]).
- devils-advocate.md: description (:3) drops `perf` and "unproven" (LOW-5). Item 4 (:68 to 73) points claims about other code at integration-reviewer (LOW-6). Item 6 (:86): "When `goal_doc` names no line that touches the fence, treat the goal as absent and say so" (LOW-34). All [as written].
- ux-reviewer.md: add the web rule block under "Web tools" (:48) (LOW-30). Point doc truth (:119, :134) at integration-reviewer for claims about other code (LOW-6). Both [as written].
- accessibility-reviewer.md (:97 to 124): "When `ui_paths` is absent and a fenced file supplies marks, palettes or labels to a UI file, read it as UI and file one REC to set `ui_paths`." LOW-32 [as written]. Worked examples labeled "example project". LOW-3 [D15].
- multiuser-reviewer.md: no edit. R6 feeds it `data.invariants`. LOW-18.
- consolidator.md (:175 to 177): keep `## Untested entries` only if P4 reads it; otherwise drop it. LOW-10. [as written, follows P4]

### 12. plugins/djinn/README.md
- M1. Multiuser gate (:132 to 133): add `goal_doc`. LOW-20. [as written]

### 13. .djinn/config.yaml
- Y1. `build_cmd` (:14): breaker's `cd "$(git rev-parse --show-toplevel)" && git ls-files -z ... | xargs -0 sh -c '...'` form, failing loudly on no files. LOW-24. [as written]

### 14. Outside the fence, same edits
- known-bugchecker.md (:117): its round section goes to the accessibility shape (MEDIUM-1, [D4]).
- dependency-reviewer.md (:111): the web rule block, plus C12's public-package sentence (LOW-30, LOW-29, [as written]). Its own sections are covered by S2 (LOW-8).

### 15. No plugin edit
- LOW-33: the automation repo and the extension repo need their own `.djinn/config.yaml`, outside this build. Record it in the build's status.
- LOW-3: beyond the D15 labels, record in the build's status that no agent was replayed on an incident its prompt does not name.
