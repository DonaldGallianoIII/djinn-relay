---
title: bugs-reviewer report, audits/2026-09-29-1428-custom
author: Claude Opus 5.5 (bugs-reviewer)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Round 2. The dispatch asked me to confirm each round 1 HIGH and MEDIUM in the text. CONTRACTS.md section 3 (`:149` to `:154`) says no reviewer writes a prior-round status section or marks a prior finding RESOLVED, and CONTRACTS.md wins over my agent file, so there is no `## Round 1 re-check` section. What I checked for each round 1 HIGH and MEDIUM is under Checked and Clean as a plain check with its file:line, for synthesis to rule on. Where a fix left a gap, the gap is a new finding below.

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/agents/learn-synthesis.md:353` The release sheet rule in the agent drops only the source map and the leaking practice items, while CONTRACTS.md:1331 to 1335 also drops every misconception, analogy, plan step and self check answer that states the source item's key, so `study-sheet-release.md` for a secure run carries the secure key.
Mechanism: learn-synthesis.md:353 to 354 defines the release sheet as "the same sheet without the source question's map and without every practice item whose `leaks with` names the source id". The sheet's "What gets people" section (learn-synthesis.md:330 to 331) prints each misconception's belief, how it shows up, fix and giveaway, and learn-prepare writes "Shows up as: the exact wrong option it picks on the source question" and "Fix: the one contrast that separates the belief from the truth" (learn-prepare.md:44 to 48), which names the source key. The study plan's self check answers (learn-synthesis.md:336, :342; learn-prepare.md:56 to 62) do the same. The contract removes these lines; the agent file never mentions them.
Traced: learn.md:431 (synthesis told `Secure source: yes`) to learn-synthesis.md:350 to 354 (release sheet built from the agent's two exclusions) to learn-synthesis.md:330 to 331 and :342 (misconception fix and self check answers kept) to learn-prepare.md:44 to 48 (the fix is written against the source question's options). CONTRACTS.md:1331 to 1335 is the rule the agent file contradicts. The agent is told at learn-synthesis.md:40 to 43 that section 13 wins, so the outcome depends on which text the model follows; the agent's own list is the concrete one at the point of writing.
Trigger: in a repo with `secure_paths: [content/secure/]`, run `/djinn:learn content/secure/<bank>.yaml <id>`. Open `study-sheet-release.md`: its "What gets people" section still names the source question's wrong options and the contrast that makes the key right, and the plan's self check answers state the key reason. This is the file the owner is told he may release to students.
Fix: replace learn-synthesis.md:353 to 354 with the contract's full list: leave out the source question's map, every practice item (and its answer) whose `leaks with` names the source id, every misconception, analogy, plan step or self check answer that states the source item's key or why it is right, and section 6 ("For the owner").

### LOW
LOW-1. `plugins/djinn/commands/learn.md:513` `option_block` takes the first line that reads `options:` anywhere in the user message, so a spot-the-mistake stem quoting a config or spec with an `options:` line breaks the row.
Mechanism: the loop at :512 to :517 returns on the first match. A stem excerpt line `options:` followed by indented `  - x` lines gives `b == a`; shuffle_rows skips the row (:540) and options_check then demands `key_position` and `shuffle_seed` be `none` (:627 to :629), which synthesis set to `1` and `none` (learn-synthesis.md:237), so the row fails. An unindented `- x` list is shuffled as if it were the options.
Traced: CONTRACTS.md:955 to 957 and learn-harder.md:61 to 67 (spot-the-mistake quotes "a spec, an order, a protocol, a scoring note or a config") to learn-synthesis.md:239 to 240 (only warns about `- ` lines, not an `Options:` line) to learn.md:513 (first match) to :628 (FAIL). The rewrite pass may not reword options (:812 to :814), so the rows are dropped.
Trigger: a spot-the-mistake item whose excerpt is a YAML config holding an `options:` key. check.txt reads `metadata: key_position and shuffle_seed must be none with no options` on every row built from it.
Fix: take the last line equal to `options:` (the block synthesis writes always follows the stem), in `option_block`.

LOW-2. `plugins/djinn/commands/learn.md:779` The key position share check fails every file whose keyed rows all have two options and number an odd count of 9 or more.
Mechanism: with two options, the least-used rule at :553 to :556 alternates positions, so counts differ by one. With 9 keyed rows, one position holds 5, and `5 > 0.5 * 9` fails at :779. The rewrite pass cannot change the shuffle, so the second run fails the same way and the outcome is `PARTIAL`.
Traced: learn.md:550 to 556 (placement) to :776 to :781 (share check) to :815 to :816 (second failure is PARTIAL).
Trigger: a quiz file of two-option items (true or false written as single choice), run whole, giving 9 keyed rows in `grpo.jsonl`.
Fix: compare the top share with the best share the option counts allow (for example, allow `ceil(keyed / count)` when every keyed row has `count` options), or skip the check when any keyed row has two options.

LOW-3. `plugins/djinn/commands/learn.md:649` The script fails any row whose key is under 0.8 or over 1.25 of the mean distractor length, a bound no prompt gives synthesis, and the rewrite pass may not fix it.
Mechanism: `KEY_LENGTH_MIN` and `KEY_LENGTH_MAX` live only in the script (:476 to :477). Synthesis rewrites distractors only when the key is the longest or outside "the length ratio the shape or the writing rules state" (learn-synthesis.md:197 to 199), and CONTRACTS.md:1045 to 1047 gives no number. A short key in a repo with no stated ratio passes synthesis and fails the script. The rewrite pass forbids rewording any option (learn.md:812 to 814, learn-synthesis.md:466 to 468), so those rows are dropped while the item stays in `items-DRAFT`.
Traced: learn-synthesis.md:197 to 202 to learn.md:646 to 650 (FAIL) to learn.md:812 to 814 (row dropped).
Trigger: a new item whose key is noticeably shorter than its distractors, all options 12 characters or more.
Fix: state the bound in CONTRACTS.md section 13 and in learn-synthesis.md's "A key is never cut" rule, with the script as the one place the numbers live, and have synthesis rewrite distractors when the key falls outside it.

LOW-4. `plugins/djinn/commands/learn.md:646` A seed question's rows skip the key length check, though a seed's options are model drafted.
Mechanism: the exemption matches `item` equal to `source_id` (:646), justified as "its options are the bank's, verbatim" (:799 to :801). A seed is run as question `seed-<k>` with its own id as `source_id` (:235 to :236), so its rows are exempt, and synthesis keeps the seed's options as the source's. Nothing checks a seed key's length.
Traced: learn.md:205 to 237 (seed becomes the source question) to :646 to :647 (exempt).
Trigger: `/djinn:learn --topic "<topic>"`, answer `seed`, and learn-known drafts a seed whose key is the longest option. Every seed row passes with the length tell.
Fix: exempt only rows whose `source_ref` is a `path:line` or `prompt`, never `seed`.

LOW-5. `plugins/djinn/commands/learn.md:445` The recheck spawn has no retry or missing file rule, and a failed recheck fails no item, so reworded keys ship with the first pass's status.
Mechanism: Step 8 applies Step 7's retry rule to the fact checker (:414); the recheck at :445 to :458 states none. The one rewrite runs only when `verification/rephrased.md` "fails any item" (:804 to :805). A missing file, or one reading `FAILED TO RETURN`, fails no item, so no quarantine happens and every item in `rephrased.md` keeps the VERIFIED status its old wording earned.
Traced: learn-synthesis.md:203 to 209 (reworded items listed) to learn.md:445 to 458 (recheck, no failure rule) to :804 to :805 (rewrite trigger reads failed items only).
Trigger: the recheck agent errors twice. The double-keyed case round 1 MEDIUM-6 described then ships as VERIFIED.
Fix: give the recheck the Step 7 retry rule, and treat a missing or `FAILED TO RETURN` recheck as failing every item in `rephrased.md`.

LOW-6. `plugins/djinn/agents/learn-synthesis.md:465` The rewrite pass says to quarantine a failed item "with every row and sheet line built on it" and to "rewrite only the files that name a failure", which leaves the item in `items-DRAFT`.
Mechanism: `verification/rephrased.md` names items, not files, and `check.txt` names `.jsonl` lines. Neither names `items-DRAFT.*`. Quarantine means "written to quarantine.md only" (CONTRACTS.md:1000), but the pass enumerates rows and sheet lines and then says "change nothing else" (learn.md:811 to 812 repeats it).
Traced: learn.md:808 to 814 to learn-synthesis.md:462 to 470; CONTRACTS.md:999 to 1001.
Trigger: a rephrased item whose new key is double keyed. After the rewrite, `quarantine.md` lists it and `items-DRAFT.yaml` still holds it with its comment's status, and that is the file the owner moves into a bank by hand.
Fix: name the files in the rewrite prompt: remove each failed item from `items-DRAFT.*`, both study sheets, `review.md`'s item rows and the README counts, and add it to `quarantine.md`.

LOW-7. `plugins/djinn/commands/learn.md:212` The seed block carries no secure paths and no never-quote rule, so seed mode cannot apply learn-known's secure rule.
Mechanism: learn-known.md:121 to 123 forbids quoting or summarizing a secure bank item in a run that is not secure, which needs the secure paths. The angle block gives them (:363 to :365); the seed block (:212 to :230) does not. In seed mode learn-known reads the item shape files to write options "in the item shape's form" (learn-known.md:94), and CONTRACTS.md:887 to 888 shows the item shape as a bank under `content/secure/`.
Traced: learn.md:205 to 211 (seed on `seed` or no match) to :212 to :230 (block) to learn-known.md:92 to 100 (reads the shape, picks the plainest fact) to learn.md:233 to 237 (the seed becomes a question of a run that is `secure=no` unless `.` or `--secure`).
Trigger: in a repo whose `item_shape` is a secure bank and whose `secure_paths` is not `.`, run `--topic` and answer `seed` when the list shows secure items. The seed may restate a secure item, and its rows carry `secure: no`.
Fix: add `Secure paths: <list or none>` and the angle block's never-quote sentence to the seed block.

LOW-8. `plugins/djinn/commands/learn.md:287` Step 6 writes `<out_dir>/.gitignore` holding `*` into any folder that lacks one, including a folder the repo tracks, with no stop.
Mechanism: the plan counts tracked files under `out_dir` (:246, :263) but no step reads the count, and none of the wait conditions (:269 to :275) is "tracked files above 0". With a default `learn/` in a repo that already tracks its own `learn/` folder, or an `out_dir` of `docs/` or `.`, the written `*` makes git ignore every new file the owner later adds there. With `out_dir: .` and no root `.gitignore`, the file written is the repo's own `.gitignore`, against learn.md:858 to 860 and CONTRACTS.md:1316 to 1318.
Traced: learn.md:83 to 90 (only checks the path is inside the root) to :242 to :247 (count read) to :287 to :288 (write).
Trigger: a repo with a tracked top-level `learn/` and no `learn/.gitignore`, one question, every value from config. The run goes on without waiting and writes `learn/.gitignore`; the next new file under `learn/` never shows in `git status`.
Fix: when tracked files under `out_dir` is above 0, or `out_dir` resolves to the root, stop with `ABORTED step 5: out_dir holds tracked files` and ask for a dedicated folder.

LOW-9. `plugins/djinn/commands/review.md:232` The `':!learn'` pathspec is fixed text, so a repo whose own tracked top-level `learn/` holds code or content drops it from every review and dispatch fence with no line saying so.
Mechanism: the pathspec is on every listing (review.md:232, :234, :258, :268, :301, :306, :377; dispatch.md:183, :317, :409), whatever the repo's `learn.out_dir` is and whether `learn/` holds learn runs at all. context.md's fields (review.md:316 to :336) record nothing about it.
Traced: CONTRACTS.md:175 to 180 (the rule) to review.md:232 (changed files) and :258 (map scope fence).
Trigger: a repo with `learn/lesson-1.md` tracked; change it and run `/djinn:review quick`. The fence is empty for it and the review ends `NO-CHANGES` if nothing else changed.
Fix: exclude `learn/` only when `learn/.gitignore` holds `*` or `learn/LEDGER.md` exists, or read `learn.out_dir`, and write the excluded path into context.md.

LOW-10. `plugins/djinn/CONTRACTS.md:838` "A review that names one in a custom agent list gets a refusal and no report" is false: review.md:556 writes the agent's reply to its report path.
Mechanism: the learn agents refuse and write nothing (learn-known.md:28 to 30, and the other five). review.md:556 to 557 then says "If any agent replied but its file is missing, write its returned text to the path yourself", so `audits/<folder>/agents/learn-fact-checker.md` exists, holding the refusal, and synthesis reads it.
Traced: review.md:181 (custom list accepts any file in agents/) to learn-fact-checker.md:24 to 25 (refusal) to review.md:556 to 557 (report written). qa/human/learn-leak-guards.md:59 to 62 expects "write no report".
Trigger: qa step 6, `/djinn:review learn-fact-checker --base HEAD~1`.
Fix: say in CONTRACTS.md:837 to 839 and learn-known.md:29 to 30 that the review records the refusal as the report, and fix the qa expectation; or refuse learn- names in review.md's custom list beside proof-runner and fixer.

LOW-11. `qa/human/learn-leak-guards.md:23` Step 1 cannot reach the cross-repo guard: repo a has no sources, so the run stops at `ABORTED step 3b: no sources` first.
Mechanism: repo a has no config, no `CLAUDE.md` and no README, and `docs/facts.md` matches none of the discovery names (CONTRACTS.md:901 to 906). learn.md:159 to 163 stops on no sources before the secure check at :165.
Traced: qa setup :14 to :21 to learn.md:148 to 163 (discovery, then the no sources stop) to :168 (the same repo check, never reached).
Trigger: walk step 1 as written.
Fix: give repo a `sources` too (a `.djinn/config.yaml` with `learn.sources: [docs/]`), or pass `--sources docs/`.

LOW-12. `qa/human/learn-leak-guards.md:40` Step 5 passes whether or not review.md carries `':!learn'`, because step 4 already made `learn/` ignored.
Mechanism: after step 3, `learn/.gitignore` holds `*`, so `git ls-files -o --exclude-standard` never lists a learn file and `git diff` never lists an untracked one. The fence names no `learn/` path with or without the pathspec. Known-bugs entry "A check that passes by not checking".
Traced: qa :33 to :35 (step 4 confirms the ignore) to :37 to :39 (step 5) to review.md:232 and :234.
Trigger: delete `':!learn'` from review.md and walk step 5; it still passes.
Fix: before step 5, remove `learn/.gitignore` (or `git add -f` one learn file and commit it), then run the review.

LOW-13. `tools/check-private.sh:17` The two content signatures catch only a secure README and the `.jsonl` rows, so a run's `input.md`, `study-sheet.md` or `items-DRAFT.*` copied outside `learn/` passes as clean.
Mechanism: `BANNER` is only in a secure README (learn-synthesis.md:392) and `ROW_KEY` only in rows. `input.md` holds each question verbatim with its key (learn.md:325 to 326) and carries neither. Every learn file does carry the section 7 status `learn draft, not yet reviewed` (CONTRACTS.md:531, :535), which the script does not search. .djinn/config.yaml:24 to 27 claims it fails on "anything shaped like" a run folder.
Traced: tools/check-private.sh:17 to 18 and :28 to :35 against learn.md:297 to 326.
Trigger: copy a secure run's `input.md` and `study-sheet.md` to `docs/examples/x/` and run `bash tools/check-private.sh`: `private check: clean`.
Fix: add `status: learn draft, not yet reviewed` (and the yaml comment form `# status: learn draft, not yet reviewed`) to the patterns, since every learn file carries it and no tracked file outside `plugins/` and `audits/` does.

LOW-14. `plugins/djinn/commands/learn.md:791` The command says to run the script "from the root" with root-relative paths, but its Bash list has no `cd`, and the path checks in Steps 3b, 5 and 6 also resolve against the shell's working folder.
Mechanism: Step 1 finds the root with `rev-parse --show-toplevel` (:64 to :65) because the shell may start below it. `$RUN_TMP/input-path` holds the path as given, relative to the root (:107, :139), and `realpath -e` (:169) resolves it from the working folder. The probe (:242) and run path (:289) are written as `<out_dir>/...`, relative. The Rules allow no `cd` (:867 to :873, "Nothing else").
Traced: learn.md:169 (realpath fails, `xargs -r` runs nothing, the source repo is empty) to :173 to :176 (abort as `input outside this repo`); :289 to :291 (check-ignore on the wrong path; a secure run stops as `out_dir not ignored`); :789 to :792 (the script cannot open the files, check fails, PARTIAL).
Trigger: start Claude Code in `content/` of the target repo and run `/djinn:learn content/quizzes/week-3.yaml q7`.
Fix: write absolute paths (`<root>/...`) into every list file, and have the script print paths relative to the root by stripping the root prefix, so no step depends on the working folder.

LOW-15. `plugins/djinn/commands/learn.md:244` Four new git calls lack the section 9 read prefix the Rules require.
Mechanism: :244 and :290 (`check-ignore`) and :247 (`remote`) carry only `--no-optional-locks`; :246 (`ls-files`) lacks `-c core.fsmonitor=false`. learn.md:867 to 869 says each git call carries the CONTRACTS.md section 9 prefix, which CONTRACTS.md:616 to 619 defines as `--no-optional-locks -c core.fsmonitor=false -c core.quotePath=false`.
Traced: learn.md:242 to 247, :289 to 290 against :867 to 869.
Trigger: a target repo with `core.fsmonitor` set; the plan step starts the monitor the prefix exists to keep off.
Fix: add the full prefix to each of the four commands.

LOW-16. `plugins/djinn/commands/learn.md:254` The plan's Opus run total leaves out the seed spawns.
Mechanism: the count line is `<4 x n> angle, <n> fact checker, 1 synthesis, up to 1 recheck and 1 rewrite`; a topic run with `seed <k>` spawns learn-known `k` more times (:208 to :210) before the angle wave.
Traced: learn.md:205 to 211 to :254.
Trigger: `/djinn:learn --topic "<topic>"`, answer `seed 3`: the plan under-counts by 3 runs on the screen the owner says `go` to.
Fix: add `<k> seed` to the count line.

LOW-17. `plugins/djinn/README.md:254` The README's run tree leaves out `study-sheet-release.md`, `plan.md` and `verification/rephrased.md`, and :263 describes `rephrased.md` as holding "their recheck", which is the separate `verification/rephrased.md`.
Mechanism: CONTRACTS.md:1356 to 1383 lists all three; the map at README.md:254 to 271 does not. Round 1 LOW-11 was this tree.
Traced: README.md:254 to 271 against CONTRACTS.md:1370 to 1377.
Trigger: a reader of a secure run looks up `study-sheet-release.md` in the README map and finds no entry.
Fix: add the three lines, and describe `rephrased.md` as synthesis's list of reworded items.

LOW-18. `plugins/djinn/commands/learn.md:612` In a secure run, rows synthesis mislabels `secure: no` stay in the file after a second failed check, and the load recipe keeps them as not secure.
Mechanism: the script reports the mismatch (:611 to :612) but never corrects the field, though it already rewrites the file (:757 to :760). After the one rewrite a second failure is `PARTIAL` and the rows stay on disk (:815 to :816). The recipe globs every run's `sft.jsonl` and keeps `secure == "no"` (CONTRACTS.md:1185 to 1187), with no look at the run's check result.
Traced: learn.md:789 to 792 to :611 to :612 to :815 to :816 to CONTRACTS.md:1185 to 1187.
Trigger: synthesis writes `"secure": "no"` on some rows of a secure run in both passes. The ledger reads PARTIAL; a later load across `learn/*/` uploads those rows.
Fix: have the script set `metadata.secure` to the run's value on every parsed row before it writes, and say in the recipe to skip runs whose `check.txt` does not end `RESULT: pass`.

### DEBT
none

### REC
REC-1. Put the release sheet rule, the key length bound and the recheck failure rule in one place each (CONTRACTS.md section 13) and have learn.md and learn-synthesis.md point there. Three of the findings above are a prompt restating a contract rule narrower than the contract.

## Blast radius
none

## Checked and Clean
- `plugins/djinn/commands/learn.md`: round 1 HIGH-3. :168 to :178 resolves the input's real path, finds its git top level with `-C`, and stops on any repo other than the target, secure or not; the ordering gap is LOW-11's qa step, not the guard.
- `plugins/djinn/commands/learn.md`: round 1 MEDIUM-1. :165 to :166 runs the secure check on each bank a topic pick came from, and :200 to :203 routes every pick through Step 3 and the check, and makes its bank the input file; :197 to :198 keeps secure stems off the pick list in a run that is not secure.
- `plugins/djinn/commands/learn.md`: round 1 MEDIUM-2. :405 hands `seed.md` to the fact checker, :428 to synthesis, and :235 to :236 names the `Q` series; learn-known.md:102 to 108, learn-fact-checker.md:30 to 31 and :42 to 43, learn-synthesis.md:50 to 53 and CONTRACTS.md:977 to 979 agree on `Q`, and the synthesis glob `learn-*.md` (:427) no longer picks up `seed.md`.
- `plugins/djinn/commands/learn.md`: round 1 MEDIUM-3. :287 to :295 writes `<out_dir>/.gitignore` and stops a secure run git does not ignore; review.md and dispatch.md carry `':!learn'` on every listing CONTRACTS.md:175 to 180 names (review.md:232, :234, :258, :268, :301, :306, :377; dispatch.md:183, :317, :409; dispatch.md:314 to :316 and :395 reuse the :183 listing). LOW-8 and LOW-9 are side effects, not a missed listing.
- `plugins/djinn/commands/learn.md`: the script. `read_rows` (:723 to :739) keeps a bad line as raw text and reports it; the rewrite at :758 writes every row back; shuffle_rows sorts distractors before shuffling (:551 to :552), so a rerun on its own output gives the same bytes; the length ratio divides only after `min(len(o)) >= 12` (:647), so no zero division; `secure=` is read before the files because the list file puts it first (:789 to :790), and a missing one fails at :782.
- `plugins/djinn/commands/learn.md`: Step 1 (:83 to :90) resolves `out_dir` with `realpath -m` from a list file and refuses a path outside the root, so a symlinked `learn` pointing out of the repo is refused too.
- `plugins/djinn/CONTRACTS.md`: round 1 MEDIUM-4. :933 to :944 bans naming items by stem and key, not label, and :949 to :959 is five rungs with no `recall`; learn-harder.md:34 to 40, learn-asked.md:19 to 25 and learn-synthesis.md:86 to 91 repeat the same test.
- `plugins/djinn/CONTRACTS.md`: round 1 MEDIUM-5. :1032 to :1043 measures the bank's rationales and, where model rationales are allowed, names the pulling distractor; learn-synthesis.md:151 to 165, learn-asked.md:112 to 118 and learn-harder.md:132 to 138 agree.
- `plugins/djinn/CONTRACTS.md`: round 1 MEDIUM-6. :1045 to :1054 forbids cutting a key and sends every changed key or option to the recheck; learn-fact-checker.md:160 to 182 checks both wording and double keying, and learn.md:812 to 814 bans rewording in the rewrite pass. LOW-5 and LOW-6 are the failure paths around it.
- `plugins/djinn/CONTRACTS.md`: section 5 (:331 to :334) carves learn out of the config and `base_branch` stop, matching learn.md:69 to :74; section 6 (:471 to :473) matches learn.md:826 to :827.
- `plugins/djinn/agents/learn-synthesis.md`: round 1 MEDIUM-7. :337 to :342 requires every practice answer to place every option and forbids the key-only answer.
- `plugins/djinn/agents/learn-fact-checker.md`: :52 to :61 adds a `U<n>` for an unstated key reason and :95 to :96 never quotes a non-source file, matching CONTRACTS.md:1005 to 1006 and :991.
- `plugins/djinn/agents/learn-known.md`, `learn-asked.md`, `learn-harder.md`, `learn-prepare.md`: each refuses a prompt without `LEARN RUN:` (learn-known.md:28, learn-asked.md:27, learn-harder.md:19, learn-prepare.md:20), and each Step 7 and Step 9 prompt in learn.md opens with that line (:213, :348, :400, :423, :449, :806).
- Round 1 HIGH-1 and HIGH-2: no `docs/examples/` exists in the tree (Glob of `docs/**` finds two unrelated files), and a search of the repo outside `audits/` and the gitignored `local/` for the two private repo names and the item id prefixes finds nothing.
- `tools/check-private.sh`: known-bugchecker's MEDIUM-1 (:29) and MEDIUM-2 (:21) have no erroring input on the gate path. .djinn/config.yaml:22 runs `cd "$(git rev-parse --show-toplevel)"` and a successful `git ls-files` in the same shell before `bash tools/check-private.sh`, so the git calls at :21 and :29 run in a known good repo root; the status at :21 is dropped because `grep -E` exits 1 on no match, which is the clean case. The coverage gap is LOW-13, a different mechanism.
- `.djinn/config.yaml`: build_cmd chains `&& bash tools/check-private.sh` after the voice step, so a failed private check fails the command.
- `.gitignore`: `local/` (no leading slash) ignores a `local/` folder at any depth, which is where the dry runs live.
- `.claude-plugin/marketplace.json`, `plugins/djinn/.claude-plugin/plugin.json`: descriptions and version 2.4.0 only; valid JSON by reading.
- `plugins/djinn/relay.md`: :126 to :129 names which commands write `audits/LEDGER.md` and that learn writes `<out_dir>/LEDGER.md`, matching CONTRACTS.md:469 to 473.
- `plugins/djinn/templates/config.yaml`: the `learn` block keys match CONTRACTS.md:862 to 883, and empty lists mean absent (CONTRACTS.md:336 to 337), so a copied template still runs discovery.
- `plugins/djinn/agents/gate-auditor.md`, `plugins/djinn/agents/proof-runner.md`: one phrase each, meaning kept (`as well as subjects`; `the test or anything else`).
- `plugins/djinn/commands/dispatch.md`: the three changed listings match review.md's, and the untracked listings at :314 to :316 and :395 are "the untracked listing" of :183, so they carry the same pathspec.

## Files read outside the fence
none
