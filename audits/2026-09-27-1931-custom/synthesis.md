---
title: synthesis, round 2 of audits/2026-09-27-1806-custom (folder audits/2026-09-27-1931-custom)
author: Claude Opus 5.5 (synthesis)
date: 2026-09-27
status: agent output, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

scope: custom, narrow (round 2 of audits/2026-09-27-1806-custom)
agents expected: breaker, security-reviewer, integration-reviewer
agents received: breaker, security-reviewer, integration-reviewer
agents missing: none
changed files in fence: 31

## Round 1 status

Verified by reading the current files against round 1's findings and fixes/FIX-REPORT.md. The fix pass was applied by hand, so no `fixes/<id>.diff` exists; the fix report was read for where to look, never as evidence. The three reviewers' own round 1 sections were read as input only. DEFERRED means no round 2 reviewer covered the finding and synthesis did not verify it either; it stays open unchanged. Four rows no reviewer covered (MEDIUM-13, LOW-13, LOW-15, LOW-31) were verified by synthesis directly and carry a status.

| Round | Prior id | Status | Evidence |
|---|---|---|---|
| 1 | HIGH-1 | RESOLVED | review.md:234 to 239 writes `untracked: <path> (<bytes> bytes)` only; CONTRACTS.md:164 to 167 agrees. Staged secrets are a different path, R2 LOW-7 |
| 1 | HIGH-2 | RESOLVED | CONTRACTS.md:490 to 496; review.md:86 to 92, :200, :321 to 329; proof-runner.md:167 to 169 refuses unsafe names before :219 quotes. Config and ref values still typed: R2 LOW-2. The canonical form lacks `-r`: R2 MEDIUM-1 |
| 1 | HIGH-3 | RESOLVED | proof-runner.md:96 requires `memory_wrapper`, :110 to 112 counts the resident cap, :224 puts the wrapper first, :233 bounds the whole tree. Whether the wrapper works is unproven: R2 MEDIUM-2 |
| 1 | MEDIUM-1 | RESOLVED | CONTRACTS.md:134 to 139; synthesis.md:170 to 185 holds the three domain rules; dispatch.md:357 to 362 |
| 1 | MEDIUM-2 | RESOLVED | synthesis.md:43 to 49; dispatch.md:288 to 293, :383 to 384; CONTRACTS.md:417 to 421. A mutant stop has no tier: R2 LOW-26 |
| 1 | MEDIUM-3 | RESOLVED | review.md:106 matches `\\033\[`, `\\e\[` and six libraries; `.py` at :88; synthesis.md:90 to 95. Shell scripts left out of the grep list: R2 LOW-21 |
| 1 | MEDIUM-4 | RESOLVED | dispatch.md:43 to 46 always reads `proof`, :163 to 166 pastes it; fixer.md:95 to 97 runs no test with `heap_mb` none. What the capped run still lacks: R2 MEDIUM-7 |
| 1 | MEDIUM-5 | NOT RESOLVED | dispatch.md:254 adds `NODE_OPTIONS` and `timeout` but no resident cap and no memory check, and the plan at :110 and ledger at :422 now say `capped` (breaker HIGH-1, lane half) |
| 1 | MEDIUM-6 | RESOLVED | proof-runner.md:210 to 214 greps fixed files and every chosen test file, any line. The widening stops on comments: R2 MEDIUM-3 |
| 1 | MEDIUM-7 | RESOLVED | proof-runner.md:19 to 22 disclosure, :163 to 178 one-hop screen, :221 to 224 paid key vars emptied. Screen gaps: R2 LOW-9, LOW-10 |
| 1 | MEDIUM-8 | NOT RESOLVED | proof-runner.md:100 to 102 refuses `&&`, `\|\|`, `;`, `\|`, backtick, `$(`, `>`, `<`, but not a newline, a lone `&` or `#`, so a runner still runs a second command outside `timeout` and the wrapper (breaker MEDIUM-3, security LOW-1) |
| 1 | MEDIUM-9 | RESOLVED | review.md:203 to 217 stops above `MAX_UNTRACKED` or on a vendor segment. Side effects: R2 LOW-3, LOW-4 |
| 1 | MEDIUM-10 | RESOLVED | proof-runner.md:196 to 197 hashes and counts only; :241 to 243 `diff -q` |
| 1 | MEDIUM-11 | RESOLVED | dispatch.md:243 to 247 listing before the lane; :306 to 308 `written by test runs`, never into FENCE. Ambiguity left: R2 LOW-12 |
| 1 | MEDIUM-12 | RESOLVED | gate-auditor.md:102 to 104 reads `%b`; :178 and :187 count a body as a record |
| 1 | MEDIUM-13 | RESOLVED | review.md:394 to 396 pastes the running flag; perf-reviewer.md:24 to 26 files the OOM when not running. Verified by synthesis; no round 2 reviewer covered it |
| 1 | MEDIUM-14 | RESOLVED | live-system-reviewer.md:141 to 146; CONTRACTS.md:388 to 391 |
| 1 | LOW-1 | RESOLVED | proof-runner.md:227 to 231 sets the tool timeout; :103 to 105 refuses against `harness_timeout_max_s` when set |
| 1 | LOW-2 | RESOLVED | proof-runner.md:199 to 207 (`--binary`, untracked hashes, ignored listing, `find -newer`) |
| 1 | LOW-3 | DEFERRED | no round 2 reader |
| 1 | LOW-4 | RESOLVED | review.md:21 to 22 and :392 |
| 1 | LOW-5 | RESOLVED | devils-advocate.md:3 names full scope and a custom list only |
| 1 | LOW-6 | DEFERRED | no round 2 reader |
| 1 | LOW-7 | DEFERRED | no round 2 reader |
| 1 | LOW-8 | RESOLVED | synthesis.md:27 to 65 lists UI files, Replacement verdicts, proof-runner's sections and gap-hunter's |
| 1 | LOW-9 | RESOLVED | dispatch.md:167 (fixer), :279 (proof-runner), :373 to 379 (synthesis), :402 (consolidator) |
| 1 | LOW-10 | DEFERRED | no round 2 reader |
| 1 | LOW-11 | DEFERRED | no round 2 reader |
| 1 | LOW-12 | RESOLVED | CONTRACTS.md:304 to 305; proof-runner.md:66 to 67 |
| 1 | LOW-13 | RESOLVED | gate-auditor.md:40 cites `:19`. Verified by synthesis |
| 1 | LOW-14 | RESOLVED | gate-auditor.md:94, :108; CONTRACTS.md:497 to 500 |
| 1 | LOW-15 | RESOLVED | CONTRACTS.md:56 to 59 gives gate-auditor its HIGH. Verified by synthesis |
| 1 | LOW-16 | RESOLVED | dispatch.md:297 to 300 |
| 1 | LOW-17 | RESOLVED | review.md:166 to 183 |
| 1 | LOW-18 | RESOLVED | review.md:397 to 398 |
| 1 | LOW-19 | RESOLVED | dispatch.md:366 to 371 |
| 1 | LOW-20 | RESOLVED | CONTRACTS.md:410 to 411; README.md:139; gate-auditor.md:3 and data-contract-reviewer.md:3 carry `live` |
| 1 | LOW-21 | RESOLVED | gate-auditor.md:109 to 112; CONTRACTS.md:501 to 504. Pattern list gaps: R2 LOW-14 |
| 1 | LOW-22 | NOT RESOLVED | review.md:321 to 329 uses fixed strings, so `el` no longer matches inside words, but `/index'` still matches every folder's `index` (breaker LOW-7) |
| 1 | LOW-23 | RESOLVED | review.md:86 to 92 greps code extensions only; :145 to 146 excludes `tools/bench*`. The empty-list route is a new mechanism: R2 MEDIUM-1 |
| 1 | LOW-24 | RESOLVED | .djinn/config.yaml:16. Quoted names: R2 LOW-1 |
| 1 | LOW-25 | RESOLVED | proof-runner.md:60, :97 |
| 1 | LOW-26 | RESOLVED | proof-runner.md:363 to 368 |
| 1 | LOW-27 | RESOLVED | review.md:27 to 31; CONTRACTS.md:308 to 309 |
| 1 | LOW-28 | NOT RESOLVED | review.md:553 to 557 sanitizes the name and checks the folder by text; a symlink inside home that points outside passes, and the Bash list at :630 to 635 holds no `realpath` (security LOW-10) |
| 1 | LOW-29 | RESOLVED | CONTRACTS.md:540 to 543; dependency-reviewer.md:59 |
| 1 | LOW-30 | RESOLVED | ux-reviewer.md:55 to 61; dependency-reviewer.md:55 to 60 |
| 1 | LOW-31 | RESOLVED | `first_live_run` has no hit anywhere under plugins/djinn. Verified by synthesis |
| 1 | LOW-32 | DEFERRED | no round 2 reader |
| 1 | LOW-33 | DEFERRED | no plugin edit possible; FIX-REPORT.md marks it NOT DONE |
| 1 | LOW-34 | DEFERRED | no round 2 reader |
| 1 | LOW-35 | DEFERRED | no round 2 reader |

## Fix List

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/CONTRACTS.md:492` The canonical path form `tr '\n' '\0' < <file> | xargs -0 <cmd> --` has no `-r`, so an empty list (a docs-only or test-only fence) runs `<cmd> --` once with no path and `git grep` searches the whole tree: triggers fire on unfenced files (review.md:86 to 92, :106, :125 to 127), tree-facts item 3 lists repo-wide mutant hits, and gate-auditor.md:97 reads the repo's last commit as a gate's last change. Source: breaker (MEDIUM). Report: agents/breaker.md
MEDIUM-2. `plugins/djinn/agents/proof-runner.md:96` The wrapper check is only that `{mem_mb}` appears, so a wrapper that fails to start (the template's own `systemd-run --user` example with no user bus) exits non-zero, reads as FAIL at :260 and becomes a HIGH at :289 against a correct fix, and a wrapper whose `{mem_mb}` caps nothing passes while Limits (:333) reports a resident cap. Source: breaker (MEDIUM), confirmed by breaker (REC-1). Report: agents/breaker.md
MEDIUM-3. `plugins/djinn/agents/proof-runner.md:210` The widened mutant grep stops the whole invocation on a hit on any line, comments included, so the game repo's regression test tests/qa-viewer-update.test.mjs:13, which quotes `if (false)` in its header comment, stops every proof that picks it, and a default such as `opts.x || true` does the same. Source: breaker (MEDIUM). Report: agents/breaker.md
MEDIUM-4. `plugins/djinn/commands/dispatch.md:140` Every temp list has a fixed name under `$TMPDIR` (dispatch.md:140, :244 to 246; proof-runner.md:198 to 206; review.md:199), so two runs at once overwrite each other's lists and stamp, giving false scope leaks, a wrong round fence and a false or missed tree change, and an unset `TMPDIR` writes to `/`. Source: breaker (MEDIUM), confirmed by security-reviewer (REC-1). Report: agents/breaker.md
MEDIUM-5. `plugins/djinn/commands/dispatch.md:196` Untracked work-set files go to `git diff --no-index /dev/null` through `xargs -0`, which passes every file in one call, so two or more files give git's usage error instead of a diff; and since Step 2 rejects a work-set file that does not exist (:65), the "fixer's own new files" rationale is false and a single file's diff is the whole file, not the fix. Source: breaker (MEDIUM). Report: agents/breaker.md
MEDIUM-6. `plugins/djinn/commands/dispatch.md:254` `test_cmd` is spliced after `timeout` with no check, so a chained `test_cmd` (`npm run build && npm test`) runs everything after its first command with no heap cap and no clock while the plan and ledger say `capped`, and a `cd x && ...` form fails inside `timeout` and skips the tests. Source: breaker (MEDIUM). Report: agents/breaker.md
MEDIUM-7. `plugins/djinn/agents/fixer.md:99` The fixer's own test run, new with round 1's MEDIUM-4 fix, carries only `NODE_OPTIONS` and `timeout`: no memory wrapper, no pre-run screen and no emptied paid key env vars (the fixer prompt at dispatch.md:163 to 168 carries no `cost.paid_apis`), and CONTRACTS.md:550 to 551 still says the fixer's Bash runs `build_cmd` and `test_cmd` only. Source: breaker (HIGH-1, fixer half, re-tiered), security-reviewer (LOW-7). Report: agents/breaker.md

### LOW
LOW-1. `plugins/djinn/commands/review.md:207` Path lists come from git without `-z` or `-c core.quotePath=false`, so a name with a non-ASCII byte, a `"` or a `\` enters fence.txt C-quoted, as a path that does not exist (also dispatch.md:139, :245 and the .djinn/config.yaml:16 build_cmd). Source: breaker (LOW-1). Report: agents/breaker.md
LOW-2. `plugins/djinn/commands/review.md:206` Config and ref values are still typed into command lines with no format check (`<base_branch>` and `--base` at review.md:206, `<merge_base>` at dispatch.md:245, `<heap_mb>` and the lane timeout at dispatch.md:254), and CONTRACTS.md:490's "never type a config value" names no exception for the keys that are commands by design. Source: security-reviewer (LOW-3), confirmed by breaker (LOW-2, and its Handed off line on CONTRACTS.md:490). Report: agents/security-reviewer.md
LOW-3. `plugins/djinn/commands/review.md:211` The segment stop fires on real new source under a `build/`, `dist/` or `vendor/` folder, and the only way past it, `--untracked none`, drops every untracked file. Source: breaker (LOW-3). Report: agents/breaker.md
LOW-4. `plugins/djinn/commands/review.md:226` The map scope pastes every tracked path into the prompt (:343) with no cap, the flood the untracked stop was built to prevent. Source: breaker (LOW-4). Report: agents/breaker.md
LOW-5. `plugins/djinn/commands/dispatch.md:320` A round's `tree-changes.txt` writes `A<TAB><path>` for every untracked file in the round fence, including files that existed before the dispatch, so legibility-reviewer's first trigger fires every round. Source: breaker (LOW-5). Report: agents/breaker.md
LOW-6. `plugins/djinn/commands/dispatch.md:253` The lane timeout applies only when `heap_mb` is also set, is never checked against `harness_timeout_max_s`, and the lane's `timeout` has no `--kill-after`. Source: breaker (LOW-6). Report: agents/breaker.md
LOW-7. `plugins/djinn/commands/review.md:234` A staged or intent-to-add secret-shaped file still enters `input-diff.patch` whole, since item 6's `git diff <merge-base>` carries no secret pathspecs. Source: breaker (LOW-8). Report: agents/breaker.md
LOW-8. `plugins/djinn/agents/proof-runner.md:199` `git diff` follows the owner's `diff.external` and textconv drivers, so `input-diff.patch` and the `--binary` snapshot may not be patches; section 9's read rule lacks `--no-ext-diff --no-textconv`. Source: breaker (LOW-9). Report: agents/breaker.md
LOW-9. `plugins/djinn/agents/proof-runner.md:163` The one-hop screen reads relative imports only, so a `#` subpath import, a workspace package or a second hop passes unscreened. Source: breaker (LOW-10). Report: agents/breaker.md
LOW-10. `plugins/djinn/agents/proof-runner.md:98` A runner template can preload code the screen never reads (`--import`, `--require`, `-r`, `--loader`, `--env-file=.env`, a runner config's setup files), and the screen's env and process list is JavaScript only (`import 'dotenv/config'`, `os.environ`, `load_dotenv`, `subprocess` pass). Source: security-reviewer (LOW-2). Report: agents/security-reviewer.md
LOW-11. `plugins/djinn/agents/proof-runner.md:205` The `find -newer` part blames the test for any write in the repo during its run (an editor swap file, another session), and dispatch.md:288 to 290 halts the round on it. Source: breaker (LOW-11). Report: agents/breaker.md
LOW-12. `plugins/djinn/commands/dispatch.md:308` It is unclear which untracked list the round's `MAX_UNTRACKED` stop reads, so a lane that writes a `coverage/` or `build/` tree may halt the round. Source: breaker (LOW-12). Report: agents/breaker.md
LOW-13. `plugins/djinn/agents/proof-runner.md:219` The fill wraps `{file}` in single quotes, so a runner template that already writes `"{file}"` passes the checks and runs a path with literal quotes, a FAIL that :289 makes a HIGH. Source: breaker (LOW-13). Report: agents/breaker.md
LOW-14. `plugins/djinn/CONTRACTS.md:501` The search rule excludes three of tree facts' seven secret-shaped patterns (not `id_*`, `.npmrc`, `credentials*`, `*secret*`), lets plain `grep -r` read `.git/config`, and is not applied to tree-facts items 3 and 5 (review.md:313, :325), so item 3 writes hit lines from untracked files into the committed tree-facts.md. Source: security-reviewer (LOW-4). Report: agents/security-reviewer.md
LOW-15. `plugins/djinn/agents/legibility-reviewer.md:197` The never-open rule names secret files by kind and "Every repo-wide search excludes those files" names none, while map mode opens a header in every file of the tree. Blast radius: legibility-reviewer.md is not in fence.txt. Source: security-reviewer (LOW-5). Report: agents/security-reviewer.md
LOW-16. `plugins/djinn/commands/review.md:199` No file says where a `-f` pattern file lives, and Step 3's lists are moved into the committed audit folder, so a pattern file built from `live.systems[].match` (which may hold client names) or `cost.paid_apis` can land in `audits/`. Source: security-reviewer (LOW-6). Report: agents/security-reviewer.md
LOW-17. `plugins/djinn/agents/devils-advocate.md:193` devils-advocate and test-strategist (test-strategist.md:44) carry Bash, but neither file states the section 9 rules and their Step 7 prompts do not paste them. Source: security-reviewer (LOW-8). Report: agents/security-reviewer.md
LOW-18. `plugins/djinn/CONTRACTS.md:526` The link-following rule in ux-reviewer.md:60 and dependency-reviewer.md:60 is missing from the contract's web rule, from cost-complexity-reviewer.md and from the paste at review.md:416 to 420. Source: security-reviewer (LOW-9). Report: agents/security-reviewer.md
LOW-19. `plugins/djinn/agents/pipe-connector.md:136` The report template still opens with `Threshold: <n> lines.` and the section 9 table keeps a `Lines` column of sizes (:159 to 162), both left over from the size-rule removal. Source: integration-reviewer (LOW-1). Report: agents/integration-reviewer.md
LOW-20. `plugins/djinn/agents/gate-auditor.md:3` The gate-auditor, data-contract-reviewer, cost-complexity-reviewer and accessibility-reviewer descriptions leave `map` out of the scopes that take no conditional agent. Source: integration-reviewer (LOW-2). Report: agents/integration-reviewer.md
LOW-21. `plugins/djinn/commands/review.md:87` The content-grep extension list has no shell extension (`.sh`, `.bash`, `.zsh`, `.ps1`), so a shell script that colors PASS and FAIL with `\033[` no longer fires the accessibility trigger. Source: integration-reviewer (LOW-3). Report: agents/integration-reviewer.md
LOW-22. `plugins/djinn/commands/review.md:411` review.md and dispatch.md:352 to 353 paste `integration-reviewer: running | not running` to legibility-reviewer and say what it does with it, and legibility-reviewer.md's Inputs (:87 to 112) never read it. Source: integration-reviewer (LOW-4). Report: agents/integration-reviewer.md
LOW-23. `plugins/djinn/agents/legibility-reviewer.md:285` A file missing from a map is REC from legibility-reviewer and LOW from pipe-connector (pipe-connector.md:116 to 122), so its tier depends on which agents ran. Blast radius: legibility-reviewer.md is not in fence.txt. Source: integration-reviewer (LOW-5). Report: agents/integration-reviewer.md
LOW-24. `plugins/djinn/agents/synthesis.md:59` The map-mode coverage rule names `tree.txt`, which neither synthesis prompt passes. Source: integration-reviewer (LOW-6). Report: agents/integration-reviewer.md
LOW-25. `plugins/djinn/CONTRACTS.md:319` The trigger (review.md:153 to 156), the contract, the agent (legibility-reviewer.md:114 to 118) and the template give different default map lists; only the trigger and relay.md name `CONTRIBUTING.md`. Source: integration-reviewer (LOW-7). Report: agents/integration-reviewer.md
LOW-26. `plugins/djinn/agents/proof-runner.md:289` The Severity list gives no tier to a hand-mutant stop, while :311 to 312 and synthesis.md:46 to 48 say a mutant finding keeps its tier. Source: integration-reviewer (LOW-8). Report: agents/integration-reviewer.md
LOW-27. `.djinn/config.yaml:21` This repo's `conventions_files` lacks LEGIBILITY.md, and `project_notes` (:48 to 52) still says 2.3.0 wires six agents, with no legibility-reviewer and no `map` scope. Source: integration-reviewer (LOW-9). Report: agents/integration-reviewer.md
LOW-28. `plugins/djinn/relay.md:21` Stale prose: relay.md:21 to 23 and README.md:172 list tree facts without the secret-shaped-names section, and relay.md:96 to 98 says a round runs on the union of work sets, without the `live` whole-tool rule. Source: integration-reviewer (LOW-10). Report: agents/integration-reviewer.md
LOW-29. `plugins/djinn/agents/legibility-reviewer.md:56` The file says known-bugchecker already ran the index with no exception, and it does not run in the `map` scope. Blast radius: legibility-reviewer.md is not in fence.txt. Source: integration-reviewer (LOW-11). Report: agents/integration-reviewer.md

### DEBT
DEBT-1. `plugins/djinn/CONTRACTS.md:307` Round 1 DEBT-4 is unchanged: every config-to-command path (`proof.runner`, `proof.memory_wrapper`, `lane_timeout_s`, `base_branch`, `build_cmd`, `test_cmd`, `deps.list_cmd`) runs what a reviewed branch's `.djinn/config.yaml` says. Source: security-reviewer (DEBT)
DEBT-2. `plugins/djinn/agents/gate-auditor.md:3` The list of scopes that take no conditional agent is copied into review.md:82, relay.md:150, README.md:129 and five descriptions, so each new scope repeats the hunt. Source: integration-reviewer (DEBT)

### REC
REC-1. breaker: a wrapper fixture: the template's systemd-run example with no user bus, a wrapper with an inert {mem_mb}, and a probe that allocates past mem_mb, each ending in a refusal, never PASS or FAIL.
REC-2. breaker: a preflight fixture for the -f pattern files, one with a blank line and a paid_apis entry named none; grep -F -f treats an empty pattern as matching every line (git grep unverified), so write no blank pattern and refuse an empty one.
REC-3. breaker: list untracked symlinks (find -type l) in tree facts and never size or read them: one to /dev/zero hangs wc -c in Step 3, one to a key outside the repo is read under a harmless name.
REC-4. breaker: a fixture for MEDIUM-1, a docs-only fence and a test-only fence, asserting context.md names no trigger on an unfenced file and tree-facts.md lists no hit outside the fence.
REC-5. security-reviewer: extend round 1 REC-6's relay security test with a tracked a$(touch PWNED).md, an untracked b'x.mjs, an untracked .npmrc holding MUTANT and a proof.runner ending in & touch PWNED2; it passes when neither marker exists and tree-facts.md holds no .npmrc text.
REC-6. security-reviewer, integration-reviewer, breaker: this round was hand-run from the installed 2.1.0 orchestrator, which asked every reviewer for a Round 1 status section (CONTRACTS.md:134 to 139 now forbids it) and did not trigger legibility-reviewer on its own wiring; run the next review from the 2.3.0 command text.
REC-7. integration-reviewer: name proof-runner.md:158's bare 3 importers as a constant such as MAX_IMPORTERS_PER_FINDING.
REC-8. integration-reviewer: count caps for Donald's call, none added by this diff: ux-reviewer.md:197 "At most three lines here" (a line limit under the standing ruling), gap-hunter.md:85 "Max 4 items", and the "five words or fewer" reason; MAX_UNTRACKED is a D9 safety stop, not a structure rule.
REC-9. integration-reviewer: repeat of round 1 REC-2, a scripted dry run of review then dispatch round 2 on a fixture repo, asserting every prompt carries each key its Inputs section names (LOW-22 and LOW-24 are this shape).

## Conflicts Resolved
- Round 1 MEDIUM-8: breaker said NOT RESOLVED, security-reviewer said RESOLVED with its LOW-1 as a gap. proof-runner.md:100 to 102 refuses every chain round 1 named, but a newline, a lone `&` or a `#` still lets a runner run a second command outside `timeout`, the wrapper and the emptied keys. A partial fix is NOT RESOLVED. Kept: NOT RESOLVED, tier MEDIUM, with breaker MEDIUM-3 and security LOW-1 as its evidence, not as a new id, so the open list does not count one defect twice.
- Round 1 MEDIUM-5 and breaker HIGH-1: breaker filed the lane's missing resident cap as a new HIGH. dispatch.md:254 is the same line and the same gap round 1 filed as MEDIUM-5 ("no memory check"), so it is that finding, NOT RESOLVED, not a new one. The fixer half (fixer.md:99 to 101) is a different file and is new: MEDIUM-7. Tier: see Re-tiered.
- Round 1 LOW-23 against R2 MEDIUM-1: breaker said the fix reached LOW-23's behavior another way. review.md:86 to 92 does keep markdown out, which was LOW-23's mechanism. The repo-wide grep on an empty list comes from the missing `-r` at CONTRACTS.md:492, a different mechanism. Kept: LOW-23 RESOLVED, MEDIUM-1 new.
- Round 1 MEDIUM-3: integration-reviewer said RESOLVED for the traced path and filed the shell gap as LOW. review.md:87 to 88 confirms both. Kept: RESOLVED plus R2 LOW-21.
- breaker MEDIUM-5 against security-reviewer REC-1 (fixed temp names): same lines, same mechanism. dispatch.md:140 and proof-runner.md:198 to 206 use fixed names; two runs at once collide. Kept: MEDIUM-4.
- The three reviewers wrote round 1 status sections because the hand-run prompt asked for them. Read as input only; the table above is synthesis's.

## Fix disagreements (human decides)
- D1, round 1 MEDIUM-5 and R2 MEDIUM-7 (resident cap on the lane and on the fixer's run): option A puts `memory_wrapper` in front of the lane and each fixer test run whenever it is set, with the lane's `{mem_mb}` from a new optional `proof.lane_mem_mb`; with no wrapper or no lane figure, the plan and ledger read `heap cap only, resident memory unbounded`, never `capped`. Option B uses half of the `free -m` total, read at run time, as the lane's figure. Recommendation: A. proof-runner.md:107 to 108 says the owner sets the caps and nothing picks one.
- D2, R2 MEDIUM-2 (prove the wrapper): option A runs a probe once per invocation, `<wrapper> node -e` allocating Buffers to `mem_mb` plus 256 MB, and refuses unless the wrapper kills it; any other exit refuses with `memory wrapper did not start`. Option B only checks that `<wrapper> true` exits 0 and reads a wrapper error line as a stop, not a FAIL. Recommendation: A. B catches the WSL no-bus case but not an inert `{mem_mb}`, which is the case where Limits claims a cap that does not exist; A's allocation is already bounded by the half-of-total check.
- D3, round 1 MEDIUM-8 (runner and wrapper filter): option A, breaker's, is an allowlist: every character of `runner` and `memory_wrapper` in `A-Z a-z 0-9 space . _ / - = : , @ + { }`. Option B, security-reviewer's, adds `&`, `#`, newline and carriage return to the present denylist. Recommendation: A. It fails closed on whatever the next missed character is, and it refuses a quoted `"{file}"`, which closes LOW-13 too.
- D4, R2 MEDIUM-6 (chained `test_cmd`): option A runs the lane as `<wrapper> env NODE_OPTIONS=... timeout ... bash -c "$(cat <file>)"` with `test_cmd` written to a file, so the whole string sits under the caps. Option B applies D3's allowlist to `test_cmd` and prints `uncapped: test_cmd chains commands` in the plan when it fails. Recommendation: A. `npm run build && npm test` is a common, legitimate shape and A keeps it capped.

## Re-tiered
- breaker HIGH-1 was breaker HIGH: the lane half merges into round 1 MEDIUM-5 (MEDIUM, NOT RESOLVED) and the fixer half is now MEDIUM-7, because round 1 tiered this exact exposure (heap cap only, Buffer growth unbounded, on an automatic lane) MEDIUM, the word `capped` is accurate for the heap cap CONTRACTS.md:349 to 350 describes, and the anchor incident's own record (the game repo tests/qa-viewer-update.test.mjs:16 to 19) blames a failed deepEqual printing and diffing buffers, heap memory the V8 cap bounds. round 1 HIGH-3 stays a HIGH precedent only for proof-runner, whose stated purpose was to protect the machine.
- security-reviewer LOW-7 was LOW: merged into MEDIUM-7 after reading fixer.md:95 to 105, which shows the missing screen and emptied keys on the same run as breaker's heap-only finding.
- security-reviewer LOW-1 was LOW: folded into round 1 MEDIUM-8 (MEDIUM) after reading proof-runner.md:100 to 102 and :224, which confirm the second line runs outside every cap.
- security-reviewer REC-1 was REC: merged into MEDIUM-4 after reading dispatch.md:140 and proof-runner.md:198 to 206.
- breaker LOW-7 was LOW: folded into round 1 LOW-22 (NOT RESOLVED), same mechanism at review.md:321 to 329.
- security-reviewer LOW-10 was LOW: folded into round 1 LOW-28 (NOT RESOLVED), same mechanism at review.md:553 to 557.
- breaker LOW-2 was LOW: merged into LOW-2 (security-reviewer LOW-3), same line review.md:206, same mechanism.

## Dismissed by synthesis
none

## Coverage
- `.djinn/config.yaml`: covered by breaker, security-reviewer, integration-reviewer
- `plugins/djinn/.claude-plugin/plugin.json`: covered by breaker (Checked and Clean, no vector)
- `plugins/djinn/CONTRACTS.md`: covered by breaker, security-reviewer, integration-reviewer
- `plugins/djinn/README.md`: covered by breaker, integration-reviewer
- `plugins/djinn/agents/accessibility-reviewer.md`: covered by integration-reviewer (description), security-reviewer (tools line)
- `plugins/djinn/agents/breaker.md`: covered by integration-reviewer (description), security-reviewer (tools line)
- `plugins/djinn/agents/bugs-reviewer.md`: covered by integration-reviewer (round section)
- `plugins/djinn/agents/consolidator.md`: covered by integration-reviewer (no cap, status table reader)
- `plugins/djinn/agents/cost-complexity-reviewer.md`: covered by integration-reviewer, security-reviewer
- `plugins/djinn/agents/data-contract-reviewer.md`: covered by integration-reviewer
- `plugins/djinn/agents/dependency-reviewer.md`: covered by security-reviewer (web rule)
- `plugins/djinn/agents/devils-advocate.md`: covered by security-reviewer, integration-reviewer (description)
- `plugins/djinn/agents/fixer.md`: covered by breaker, security-reviewer
- `plugins/djinn/agents/format-reviewer.md`: covered by integration-reviewer (size rules, legibility handoff)
- `plugins/djinn/agents/gate-auditor.md`: covered by breaker, security-reviewer, integration-reviewer
- `plugins/djinn/agents/integration-reviewer.md`: covered by integration-reviewer (handoff, round section)
- `plugins/djinn/agents/known-bugchecker.md`: covered by integration-reviewer (round section, index layout)
- `plugins/djinn/agents/live-system-reviewer.md`: covered by security-reviewer, integration-reviewer
- `plugins/djinn/agents/multiuser-reviewer.md`: covered by integration-reviewer (description)
- `plugins/djinn/agents/perf-reviewer.md`: covered by integration-reviewer (round section, description)
- `plugins/djinn/agents/pipe-connector.md`: covered by integration-reviewer
- `plugins/djinn/agents/proof-runner.md`: covered by breaker, security-reviewer, integration-reviewer
- `plugins/djinn/agents/security-reviewer.md`: covered by integration-reviewer (round section), security-reviewer (tools line)
- `plugins/djinn/agents/synthesis.md`: covered by integration-reviewer
- `plugins/djinn/agents/test-strategist.md`: covered by security-reviewer
- `plugins/djinn/agents/ux-reviewer.md`: covered by security-reviewer, integration-reviewer
- `plugins/djinn/commands/dispatch.md`: covered by breaker, security-reviewer, integration-reviewer
- `plugins/djinn/commands/review.md`: covered by breaker, security-reviewer, integration-reviewer
- `plugins/djinn/relay.md`: covered by breaker (no vector), integration-reviewer
- `plugins/djinn/templates/config.yaml`: covered by breaker, integration-reviewer
- Agents missing: none
- Not run in this round, by Donald's plan: known-bugchecker (round 1 found its two MEDIUMs), devils-advocate, ux-reviewer, and every other agent. No agent owned plain wrong-behavior or style lanes this round.
- Fence gap: `plugins/djinn/agents/legibility-reviewer.md` is not in fence.txt, though context.md:22 puts it in this round's scope and all three reviewers treated it as fenced. security-reviewer and integration-reviewer filed on it and neither listed it as an outside read. Its three findings (LOW-15, LOW-23, LOW-29) are kept as blast radius LOWs; LOW-22 cites it as a consumer.
- Breaker coverage gap, from its own report: it did not read the non-executing agent prompts in full this round.
- breaker Blast radius: `plugins/djinn/agents/gate-auditor.md:97` copies the section 9 form without `-r`; merged into MEDIUM-1.
- breaker Handed off, three lines: CONTRACTS.md:490 against the command-valued keys is merged into LOW-2; the Round 1 status prompt is merged into REC-6; the third went unfiled by its owner, integration-reviewer, which ran. Synthesis noticed, unreviewed: `plugins/djinn/commands/dispatch.md:418` lists "halted on the untracked stop" as an exit, and the ledger outcome form at `plugins/djinn/commands/dispatch.md:422` gives it no wording.
- Round 1 status: no `fixes/<id>.diff` exists for the hand-applied fix pass. Statuses were verified against the current files; synthesis did not read input-diff.patch. Nine round 1 LOWs are DEFERRED (LOW-3, 6, 7, 10, 11, 32, 33, 34, 35). A DEFERRED row is not a `prior` record in findings.json (section 12 allows three words only); those entries keep their `open` status.
- Open list built from audits/2026-09-27-1806-custom/findings.json, not rebuilt from prose.
- Tree facts: none written for this round. No tree-facts.md exists in this folder.
- Standing rulings: no fix in this list writes a dollar figure, spawns proof-runner by default, adds a reader to the `live` scope, or adds a line limit, a file length cap, a line length rule or a token count. LOW-19 removes a line-count remnant. The four safety caps (MAX_FILES_CEILING, the 16 KB and 4 KB cut, large_file_kb, tokens=) are untouched.

## Fence
- Files synthesis read: `audits/2026-09-27-1931-custom/fence.txt`, `audits/2026-09-27-1931-custom/context.md`, `audits/2026-09-27-1931-custom/round-1-synthesis.md`, the three reports in `audits/2026-09-27-1931-custom/agents/`, `audits/2026-09-27-1806-custom/findings.json`, `audits/2026-09-27-1806-custom/fixes/FIX-REPORT.md`, `plugins/djinn/CONTRACTS.md`, `plugins/djinn/commands/review.md`, `plugins/djinn/commands/dispatch.md`, `plugins/djinn/agents/proof-runner.md`, `plugins/djinn/agents/synthesis.md`, `plugins/djinn/agents/fixer.md` (:80 to 119), `plugins/djinn/agents/gate-auditor.md` (:36 to 43, :85 to 119, grep), `plugins/djinn/agents/pipe-connector.md` (:15 to 194), `plugins/djinn/agents/perf-reviewer.md` (:17 to 30), `plugins/djinn/agents/ux-reviewer.md` (:194 to 198, grep), `plugins/djinn/relay.md` (:15 to 104), `plugins/djinn/templates/config.yaml` (:94 to 118), `.djinn/config.yaml`, greps over `plugins/djinn/README.md`, `plugins/djinn/agents/live-system-reviewer.md`, `plugins/djinn/agents/devils-advocate.md`, `plugins/djinn/agents/test-strategist.md`, `plugins/djinn/agents/dependency-reviewer.md` and every agent's description line; cited outside the fence: `plugins/djinn/agents/legibility-reviewer.md` (:192 to 203, grep) and `<game repo>/tests/qa-viewer-update.test.mjs` (:1 to 30)
- Reviewer reads outside the fence:
- breaker: `<game repo>/.djinn/config.yaml` (lane test_cmd value)
- breaker: `<game repo>/package.json` (test concurrency, per-child cap)
- breaker: `<game repo>/tests/qa-viewer-update.test.mjs` (mutant grep false stop)
- breaker: `<game repo>/qa/bot/png.mjs` (one-hop screen check)
- breaker: `<game repo>/qa/bot/viewer-shots.mjs` (one-hop screen check)
- breaker: `<game repo>/` tests, src, tools and qa (grep: mutant strings)
- integration-reviewer: `plugins/djinn/agents/gap-hunter.md` (grep only: count caps)
- integration-reviewer: `plugins/djinn/commands/status.md` (grep hit only: RESOLVED)
- integration-reviewer and security-reviewer: `plugins/djinn/agents/legibility-reviewer.md`, read and filed on, not listed by either (see Coverage)
- security-reviewer: none reported

## Counts
HIGH 0, MEDIUM 7, LOW 29, DEBT 2, REC 9
Open across rounds: HIGH 0, MEDIUM 9, LOW 40

## Verdict: FIX THEN SHIP
Blocking: MEDIUM-1 to MEDIUM-7, R1 MEDIUM-5, R1 MEDIUM-8. All three round 1 HIGHs are RESOLVED. No fact dispute is open.

## Rewrite plan

Every edit the HIGH, MEDIUM and LOW findings add up to, grouped by file, shared files first. `[as written]` means apply the reviewer's fix as stated. `[Dn]` means it waits on that Fix disagreement, and the text shown is the recommended option. DEBT, REC and the nine DEFERRED round 1 LOWs are left out. Nothing in this plan was run, and Donald's plan has no third round to check it, so the voice check and one dry run (REC-9) are the only verification left.

### 1. plugins/djinn/CONTRACTS.md
- C1. Section 9 path rule (:490 to 496): write the form `tr '\n' '\0' < <file> | xargs -0 -r <cmd> --` and add "An empty list runs nothing; the step's result is `none`." MEDIUM-1. [as written]
- C2. Section 9, new temp rule: "Each command or agent run makes one folder with `RUN_TMP=$(mktemp -d)`, keeps every temporary file in it, and removes it at the end. Pattern files stay there, are never moved into `AUDIT_DIR`, and context.md's `triggers:` line names the rule and the files, never the matched string." Every `$TMPDIR` in the plugin becomes `$RUN_TMP`. MEDIUM-4, LOW-16. [as written]
- C3. Section 9 git reads (:497 to 500): the prefix gains `-c core.quotePath=false`, lists are built with `-z` where git offers it, a name holding a newline goes to tree facts as `refused: newline in path`, and every `git diff` carries `--no-ext-diff --no-textconv`. LOW-1, LOW-8. [as written]
- C4. Section 9, under the no-typed-values rule: "Four values are typed only after a check, and the command stops on a mismatch: `base_branch` and `--base` match `^[A-Za-z0-9][A-Za-z0-9._/-]*$` and are passed after `--end-of-options`; `merge_base` matches `^[0-9a-f]{40}$`; `heap_mb`, `timeout_s`, `lane_timeout_s` and `lane_mem_mb` are positive whole numbers. `build_cmd`, `test_cmd`, `deps.list_cmd`, `deps.check_cmd`, `proof.runner` and `proof.memory_wrapper` are commands by design and are the only config values run as shell." LOW-2. [as written]
- C5. Section 9 search (:501 to 504): the pathspecs `':!.env*' ':!*.pem' ':!*.key' ':!**/id_*' ':!**/.npmrc' ':!**/credentials*' ':!**/*secret*'` (or the matching `--exclude` and `-g` forms), plain `grep -r` also carries `--exclude-dir=.git`, the tree-facts greps carry them too, and a hand-mutant hit is written as `path:line`, never the line's text. LOW-14. [as written]
- C6. Section 9 web rule (after :543): "Follow a link from a fetched page only to a host you could have queried directly under this rule, and only with a URL that carries no value read from the repo." LOW-18. [as written]
- C7. Section 9 fixer line (:550 to 551): "Bash runs `build_cmd`, `test_cmd`, and single test files under Step 5's caps and screen, and nothing else that changes state." MEDIUM-7. [as written]
- C8. Section 5 `proof` (:341 to 372): `memory_wrapper` also bounds the landing lane and the fixer's test run when set; add optional `lane_mem_mb`, the lane's resident figure; with no wrapper or no `lane_mem_mb` the lane is `heap cap only, resident memory unbounded`. `lane_timeout_s` (or `timeout_s`) applies whenever set, with `--kill-after`, and is checked against `harness_timeout_max_s`. proof-runner proves the wrapper with a probe before the first run. `runner` and `memory_wrapper` hold only the D3 characters. Round 1 MEDIUM-5 [D1], MEDIUM-7 [D1], MEDIUM-2 [D2], round 1 MEDIUM-8 [D3], LOW-6 [as written].
- C9. Section 5 `maps` (:318 to 324): one default list that includes `CONTRIBUTING.md`, which review.md, legibility-reviewer.md, templates/config.yaml and relay.md quote instead of restating. LOW-25. [as written]

### 2. plugins/djinn/commands/review.md
- R1. Step 2 content greps (:86 to 92): add `.sh`, `.bash`, `.zsh` and `.ps1` to the code extensions. The greps use C1's `-r` form. LOW-21, MEDIUM-1. [as written]
- R2. Step 3 preamble (:197 to 201): `RUN_TMP`, the `-r` form, pattern files stay in `RUN_TMP`. MEDIUM-1, MEDIUM-4, LOW-16. [as written]
- R3. Step 3 item 1 (:206): write the ref to a file, check it with C4's regex and `git check-ref-format --branch`, then `git merge-base --end-of-options "$(cat <file>)" HEAD`. LOW-2. [as written]
- R4. Step 3 item 3 (:209 to 219): add `--untracked <path-list-file>` to fence a named subset past the segment stop; `-z` lists. LOW-3, LOW-1. [as written, breaker's second option, which needs no new count]
- R5. Step 3 item 4b and the fence block (:226 to 230, :343): in the map scope paste `FENCE: <AUDIT_DIR>/fence.txt, <n> paths. Read it.` in place of the contents. LOW-4. [as written]
- R6. Step 3 item 6 (:234 to 241): the section 9 secret pathspecs on the `git diff`, and one `withheld: <path> (secret-shaped name)` line per withheld path. LOW-7. [as written]
- R7. Tree facts items 3 and 5 (:313 to 329): C5's pathspecs, mutant hits as `path:line`; item 5's patterns include the parent folder (`/<parent>/<name>'` and the other three forms), and a hit is listed only when the import resolves to the untracked path. LOW-14 [as written], round 1 LOW-22 [as written].
- R8. Per-agent blocks (:407 to 420): the web rule paste gains C6's link sentence; devils-advocate and test-strategist get the section 9 sentence from G4 in Step 7 (:463 to 469). LOW-18, LOW-17. [as written]
- R9. Step 10 `review_copy` (:553 to 559) and Rules (:630 to 635): resolve the folder with `realpath -e` fed from a file through `xargs -0`; the resolved path starts with the owner's resolved home plus `/`, and no `live.systems[].code` path resolves inside it; add `realpath -e` to the Bash list. Round 1 LOW-28. [as written]

### 3. plugins/djinn/commands/dispatch.md
- X1. Step 5 plan (:110 to 115): `Landing lane: capped heap <heap_mb> MB, resident <lane_mem_mb> MB, <t> s | heap cap only, resident memory unbounded, <t> s | uncapped, test_cmd as configured | skipped (--no-tests)`, and the same for `Fixer test runs`. Round 1 MEDIUM-5, MEDIUM-7. [D1]
- X2. Step 6 Snapshot (:138 to 142): `RUN_TMP`; copy each untracked work-set file into `$RUN_TMP/pre/<same path>` before spawning. MEDIUM-4, MEDIUM-5. [as written]
- X3. Step 6 fixer prompt (:163 to 168): paste `proof.memory_wrapper` and `cost.paid_apis=<each entry's name and key env var name only, or none>`. MEDIUM-7. [D1 for the wrapper, as written for the keys]
- X4. Step 6 Collect item 3 (:194 to 199): diff each untracked work-set file one at a time (`xargs -0 -r -n 1`) as `git diff --no-index $RUN_TMP/pre/<path> <path>`, and replace the "fixer's own new files" sentence with the true one: these files existed before the fixer. MEDIUM-5. [as written]
- X5. Step 7.2 landing lane (:243 to 259): `RUN_TMP` lists; the lane runs as `<memory_wrapper with lane_mem_mb> env NODE_OPTIONS=--max-old-space-size=<heap_mb> timeout --kill-after=<KILL_MARGIN_S>s <lane timeout> bash -c "$(cat $RUN_TMP/test-cmd)"`; the lane timeout applies whenever set and is checked against `harness_timeout_max_s`; `<merge_base>` passes C4's check before use. Round 1 MEDIUM-5 [D1], MEDIUM-6 [D4], LOW-6 [as written], LOW-2 [as written].
- X6. Step 7.2 proof halt (:288 to 290): the halt line reads `the tree changed during <file>'s run (any writer)`. LOW-11. [as written]
- X7. Step 7.3 (:306 to 321): "Apply the stop to files in `untracked-landed.txt` and not in `untracked-before.txt`; files on `written by test runs` never count toward it"; write `A<TAB><path>` only for those same new files; `-z` lists. LOW-12, LOW-5, LOW-1. [as written]
- X8. Step 8 ledger (:422): `lane=` reads `capped`, `heap only`, `uncapped`, `skipped` or `not run`. Round 1 MEDIUM-5. [D1]

### 4. plugins/djinn/agents/proof-runner.md
- P1. Inputs (:69 to 85): `proof.memory_wrapper` input says it is probed before use. MEDIUM-2. [D2]
- P2. Refuse (:94 to 105): the D3 character allowlist on `runner` and `memory_wrapper` replaces the operator list at :100 to 102; `runner` names no module or file besides `{file}` (`--import`, `--require`, `-r`, `--loader`, `--experimental-loader`, `--env-file`, `-c`, `-e`, `--eval`), and setup code is refused until the owner lists it under `proof.setup_files`, each screened like a test file; any `cost.paid_apis` key name not matching `^[A-Z_][A-Z0-9_]*$`; the wrapper probe: refuse unless it kills a Buffer allocation past `mem_mb`, `memory wrapper did not start` on any other exit. Round 1 MEDIUM-8 [D3], LOW-13 [D3], LOW-10 [as written], MEDIUM-2 [D2].
- P3. Choosing the file (:163 to 178): screen every import that resolves inside the repo (relative, `#` subpath, workspace); add `dotenv`, `load_dotenv`, `os.environ`, `os.getenv`, `subprocess` and `os.system` to the list; a file name starting with `-` is NOT RUN; Limits says deeper hops are not screened. LOW-9, LOW-10. [as written]
- P4. Bash item 2 (:195 to 209): `$RUN_TMP` for every snapshot file and the stamp; `--no-ext-diff --no-textconv` on the `git diff`. MEDIUM-4, LOW-8. [as written]
- P5. Bash item 3 (:210 to 217): stop only on a hit on a line the landed diff added (`+` lines of `fixes/<id>.diff`), or on a line of a fixed or test file that differs from the merge base; skip whole-line comments (`//`, `#`, ` * `); list every other hit under REC with its file:line. MEDIUM-3. [as written]
- P6. Run line (:218 to 224): the fill follows D3, so `{file}` is quoted once and a quoted template is refused. LOW-13. [D3]
- P7. Reading a run (:253 to 260): a wrapper's own start error is a stop (`memory wrapper failed`), never a FAIL. MEDIUM-2. [D2]
- P8. Stop rules (:273 to 278): "the tree changed during <file>'s run (any writer)", with the newer paths given by count from the saved file. LOW-11. [as written]
- P9. Severity (:289 to 302): a hand-mutant stop is MEDIUM, "a fix landed with a hand mutation left in". LOW-26. [as written]

### 5. plugins/djinn/agents/fixer.md
- F1. Step 5 (:95 to 105): before running a test file, apply proof-runner's pre-run screen and skip any file it would mark NOT RUN (TESTS: NOT-RUN with that reason); feed the file name through `xargs -0`; set every `cost.paid_apis` key env var empty; put `memory_wrapper` in front when set, else report `heap cap only`. MEDIUM-7. [D1 for the wrapper, as written for the rest]

### 6. plugins/djinn/agents/gate-auditor.md
- G1. Description (:3): add `map` to the excluded scopes. LOW-20. [as written]
- G2. Bash (:96 to 97): the `-r` form. MEDIUM-1. [as written]
- G3. Bash search (:109 to 112): C5's pathspecs and `--exclude-dir=.git`. LOW-14. [as written]
- G4. The section 9 sentence, reused in devils-advocate.md and test-strategist.md: "Every Bash call follows CONTRACTS.md section 9: no file name or config value typed into a command line (paths through `xargs -0 -r`, patterns through `-f`), every git read prefixed, no `rg --pre`, `--pre-glob` or `--search-zip`, plain `grep -r` with `--exclude-dir=.git`, and the secret pathspecs on every repo-wide search. Never open `.env`, key or credential files." LOW-17. [as written]

### 7. plugins/djinn/agents/synthesis.md
- S1. Map-mode coverage (:59 to 61): "`fence.txt` (the same list as `tree.txt` in the map scope)". LOW-24. [as written]

### 8. plugins/djinn/agents/legibility-reviewer.md (outside fence.txt)
- LG1. :56: "known-bugchecker already ran the index, when it ran". LOW-29. [as written]
- LG2. Inputs (:87 to 112): add `integration-reviewer: running | not running`, and "when not running, drop the 'expect integration-reviewer' line". LOW-22. [as written]
- LG3. :197 to 201: never open, and exclude from every search, any path tree-facts.md lists under secret-shaped names, any path matching C5's pathspecs, `.netrc`, `*.p12`, `*.pfx`, `*.jks`, or a name holding `token` or `credential`; judge them by path alone. LOW-15. [as written]
- LG4. :285 to 286 with pipe-connector.md:116 to 122: a missing map line is REC in both files, and pipe-connector files it at REC. LOW-23. [as written; REC matches legibility's own default in CONTRACTS.md:61]

### 9. plugins/djinn/agents/pipe-connector.md
- PC1. :136: drop `Threshold: <n> lines.`; :159 to 162: drop the `Lines` column or turn it into a line range as section 8's table does. LOW-19. [as written]
- PC2. :116 to 122: file a missing map line at REC (LG4). LOW-23. [as written]

### 10. Other agent files
- devils-advocate.md (:193) and test-strategist.md (:44): the G4 sentence. LOW-17. [as written]
- cost-complexity-reviewer.md: description (:3) adds `map` (LOW-20); after :157, C6's link sentence (LOW-18). [as written]
- accessibility-reviewer.md (:3) and data-contract-reviewer.md (:3): add `map`. LOW-20. [as written]

### 11. plugins/djinn/templates/config.yaml
- T1. `proof` block (:96 to 116): add `lane_mem_mb: none`, the comment that the wrapper also bounds the lane and the fixer's run when set, the allowed characters for `runner` and `memory_wrapper`, and that proof-runner probes the wrapper before use. Round 1 MEDIUM-5 [D1], round 1 MEDIUM-8 [D3], MEDIUM-2 [D2].
- T2. `maps` comment: quote C9's default list. LOW-25. [as written]

### 12. plugins/djinn/relay.md and plugins/djinn/README.md
- M1. relay.md:21 to 23 and README.md:172: add the secret-shaped-names section to the tree facts list. relay.md:96 to 98: add that a `live` audit's round also reads every tracked file under `live.systems[].code`. LOW-28. [as written]
- M2. relay.md:165 to 166: quote C9's default map list. LOW-25. [as written]

### 13. .djinn/config.yaml
- Y1. `conventions_files` (:21 to 23): add `~/Conventions/code/LEGIBILITY.md`. `project_notes` (:48 to 52): seven agents, legibility-reviewer and the `map` scope. LOW-27. [as written]
- Y2. `build_cmd` (:16): `git -c core.quotePath=false ls-files -z ...` feeding `xargs -0` directly. LOW-1. [as written]

### 14. No plugin edit
- The unfiled handed-off line (dispatch.md:418 against :422) is not in this plan; it has no finding. One outcome word, `HALTED round: untracked stop`, would close it if Donald wants it.
- Deferred round 1 LOWs (3, 6, 7, 10, 11, 32, 33, 34, 35): FIX-REPORT.md says eight of them landed and LOW-33 needs other repos. With no third round, a reader spot-checking the eight cited lines is the only way they leave the open list.
