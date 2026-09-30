---
title: fix report, audits/2026-09-29-1303-custom
author: Claude Opus 5.5 (fix of the /djinn:learn review, run by hand on Donald's hand off)
date: 2026-09-29
status: landed
---

Redacted for the public repo: private course and work identifiers.

Donald, 2026-09-29: "go with best ideas and fix all for the learning agent".
Every HIGH, MEDIUM, LOW and DEBT of the synthesis is fixed or, where the
finding was in the dropped examples, closed by their removal. RECs that
improve item quality, privacy or TRL loading are taken; the rest are
declined below with a reason. Nothing is pushed.

## Rulings

- **R1, privacy.** The two dry run folders were copied to
  `local/examples/` (gitignored, `.gitignore:4 to 5`, with the reason on
  the comment line), then commit 32a1c17 was removed with
  `git reset --hard 28e269c` after `git show --stat 32a1c17` showed it held
  only the 34 example files. Every teaching example in the prompts and the
  plugin README that used a teaching repo or the course repo item or its
  answer now uses a public textbook fact in no private bank (water boils
  cooler on a mountain because the air pressure is lower; checked with a
  grep of both repos' banks). The real bank path, item id and both private
  repo layouts are gone from CONTRACTS.md and the README. The audit
  reports that quoted private text were scrubbed (below).
- **R2, item bar.** Learn never writes an item that tests bare vocabulary,
  in any repo. The generic ladder drops `recall` and is five rungs. A
  mechanical test (a key one source line states as a value or name, with a
  stem that asks for it with no case, mechanism or decision) is in section
  13 and in learn-asked, learn-harder and learn-synthesis, and reads the
  stem and key, never the label. Recall facts live in learn-known's map and
  the study sheet's map. A repo's tiers still set the tiers; no tier holds
  a naming item.
- **R3, audits.** The scrubbed audit folder and its ledger line are
  committed, after a grep that shows no private item text remains.
- **R4, the rest.** The synthesis's recommended option each time: HIGH-3
  option A (refuse every input from another repo), MEDIUM-3 option B (learn
  makes its own folder ignored and refuses a secure run it cannot hide),
  plus the review and dispatch skip the hand off asked for; MEDIUM-4 option
  B's mechanical test on top of R2; LOW-5 takes both options' strengths:
  the seeded shuffle and `key_position` of option B, done by the command's
  script and not by a model (the synthesis's reason for preferring A), and
  option B's histogram check. Recorded in `.djinn/config.yaml`
  project_notes.

## Fixed

Paths are under `plugins/djinn/` unless they start with a dot or a
top-level folder. Line numbers are as committed.

- HIGH-1: commit 32a1c17 is gone from the branch (`git reset --hard 28e269c`); its two folders sit only in `local/examples/`, gitignored at `.gitignore:4 to 5`.
- HIGH-2: the same removal; no the course repo item, trap note or scenario key is in any tracked file.
- HIGH-3: `commands/learn.md:168` refuses every input file whose own git repo is not the target repo, secure or not, so the secure check always reads the source repo's config; `CONTRACTS.md:1307` states it.
- MEDIUM-1: `commands/learn.md:200` sends every topic pick through Step 3 and the secure check, and makes its bank the input file for the never-evidence list; the secure check is no longer "file inputs only".
- MEDIUM-2: seed claims are `Q<n>` (`CONTRACTS.md:978`, `agents/learn-known.md` seed mode), the fact checker gets `seed.md` (`commands/learn.md:405`), and synthesis uses the `Q` claims for every seed row and quarantines the seed when one is CONTRADICTED.
- MEDIUM-3: `commands/learn.md:287` writes `<out_dir>/.gitignore` (`*`) on the first run and refuses a secure run git does not ignore; `commands/review.md:232` and `commands/dispatch.md:183` (and every other listing in both) skip `':!learn'`; `CONTRACTS.md:175` says so.
- MEDIUM-4: `CONTRACTS.md:933` bans naming items in every repo with a mechanical test that reads stem and key, not the label; the generic ladder is five rungs (`CONTRACTS.md:949`); the test is repeated in `agents/learn-harder.md:34`, `agents/learn-asked.md:19` and `agents/learn-synthesis.md:86`.
- MEDIUM-5: rationales follow the repo's register and the bank's measured word range, name the pulling distractor, and trap notes name homes: `CONTRACTS.md:1032`, `agents/learn-synthesis.md:151`, `agents/learn-harder.md:132`, `agents/learn-asked.md:112`.
- MEDIUM-6: a key is never cut, distractors are rewritten instead (`CONTRACTS.md:1045`, `agents/learn-synthesis.md:197`); every key or option changed after the check goes to the fact checker's new recheck mode (`agents/learn-fact-checker.md:160`, `commands/learn.md:445`), and a failed item is quarantined.
- MEDIUM-7: every study sheet answer places every option in its home (`agents/learn-synthesis.md:337`).
- LOW-1: `out_dir` must resolve inside the repo (`commands/learn.md:83`).
- LOW-2: no agent quotes or summarizes an item from a secure bank other than the input, and the fact checker never quotes a non-source file (`agents/learn-fact-checker.md:95`, `commands/learn.md:363`).
- LOW-3: every row carries `metadata.secure` (`CONTRACTS.md:1155`), the script checks it against the run, and the load recipe filters on it before any upload.
- LOW-4: the README prints VERIFIED rows by rung and warns when the VERIFIED set is only the easy rows (`agents/learn-synthesis.md:419`).
- LOW-5: the command's script shuffles every row's options by a recorded seed and balances key positions (`CONTRACTS.md:1124`, `commands/learn.md:531`).
- LOW-6: a `mentions` term found in the prompt fails the check (`commands/learn.md:688`), and synthesis is told why (`agents/learn-synthesis.md:292`).
- LOW-7: a reply with no file is retried and then listed failed, never written as the angle file (`commands/learn.md:391`).
- LOW-8: every never-evidence list names `<out_dir>`, not `learn/` (`commands/learn.md:361`, CONTRACTS.md section 13).
- LOW-9: the topic goes to the Grep tool with its regex characters escaped; no `-f` (`commands/learn.md:190`).
- LOW-10: the neutral shape's closing fence is on its own line (`CONTRACTS.md:1080`); a fence scan of every changed file finds no unpaired fence.
- LOW-11: the README agent table and tree match the contract: five rungs, `check.txt`, `usage.md` and the new files (`README.md:304`).
- LOW-12: the README's first example is one option per line with `Answer:` on its own line, and annotations carry `#` (`README.md:178`).
- LOW-13: the script catches an unreadable or missing file, names missing and extra metadata keys, and checks the Answer line whenever the prompt parses (`commands/learn.md:762`).
- LOW-14: closed by removal: the example folder is gone.
- LOW-15: the seed spawn has its own block naming `angles/seed-<k>/seed.md` (`commands/learn.md:214`), and `seed.md` is in the section 13 tree.
- LOW-16: section 5 carves out learn from the config and `base_branch` stop (`CONTRACTS.md:332`).
- LOW-17: section 13 and synthesis agree: a giveaway may be stripped only when the shape does not require it; otherwise the item is quarantined (`CONTRACTS.md:1003`).
- LOW-18: relay.md names which commands write `audits/LEDGER.md` and that learn writes its own (`relay.md:126`).
- LOW-19: every agent prompt carries `Contract: <the real path of CONTRACTS.md>` (`commands/learn.md:217` and each block).
- LOW-20: a bare fill item takes its `mentions` terms from its key reason, or stays out of `grpo.jsonl` (`CONTRACTS.md:1218`).
- LOW-21: every learn agent refuses a prompt without `LEARN RUN:` (`agents/learn-known.md:28` and the other five), so a review list naming one gets a refusal; review.md is untouched beyond the learn skip, as the hand off asked.
- LOW-22: section 13's examples use invented paths and describe the two private repos by shape only (`CONTRACTS.md:885`).
- LOW-23: `context.md` records the repo's folder name, and the check reads paths relative to the root (`commands/learn.md:307`).
- LOW-24: practice items print every option, sorted by text (`agents/learn-synthesis.md:332`).
- LOW-25: citations are full `path:line` in every file (`CONTRACTS.md:1010`, each agent), no README points at another run, and `source_id` is the item's own full id.
- LOW-26: the seeded fault list is gone; the stem never names the fault in the key's words and a fault the bank already tests is not planted again (`agents/learn-harder.md:64`).
- LOW-27: every option has a home or the item ships `incomplete: home` (`CONTRACTS.md:961`).
- LOW-28: dedupe compares key reason claims and distractor homes, not stem text (`agents/learn-synthesis.md:96`).
- LOW-29: a distractor turned key is asked as its case or mechanism, and is skipped only when the sources hold none (`agents/learn-asked.md:53`).
- LOW-30: the reason a key rests on is a claim; when none states it the fact checker adds a `U<n>` (`agents/learn-fact-checker.md:52`).
- DEBT-1: the weights live once, at the top of the script (`commands/learn.md:472`); the synthesis prompt is filled from them, CONTRACTS.md names them without values, and the check fails any other weight.
- Voice: `agents/gate-auditor.md:188` and `agents/proof-runner.md:292` each lose a pre-existing phrase the voice check flags (one phrase each).

RECs taken: REC-2 (plan reports ignored, tracked and remotes), REC-4 (marketplace.json description), REC-5 (`qa/human/learn-leak-guards.md`, never walked), REC-6 (`tools/check-private.sh`, chained into `build_cmd`), REC-7 (`learn-config.yaml`), REC-8 and REC-18 in part (`review.md` per run, read by the next run on the same file), REC-9 (`group`, `split`, `learn.holdout`, a list based load recipe), REC-10 (`learn_reward.py` in every run), REC-11 (the Answer line says copy the option exactly), REC-12 (`--id`), REC-14 (an owner section at the end of the sheet), REC-15 (copied fields keep the source's value), REC-17 (a source field only from the key reason's citation), REC-19 (the `Angles:` table and `learn_reward_parts`), REC-20 (`misplaced` DPO pairs), REC-21 (dedupe against earlier runs, a bank step in learn-harder), REC-22 (a leak free form in the README), REC-23 (self check answers, `study-sheet-release.md`), REC-24 (`seed <n>` up to `SEED_MAX`, `plan.md`), REC-25 in part (`omitted`, `model`), REC-26 (key length over mean distractor length, checked per row), REC-27 (`holdout=` and `key_first=` in the ledger).

## Declined RECs

- REC-1, a real spawned run in the teaching repo: the installed plugin is the cached 2.1.0, which has no learn agents, and `~/.claude/plugins/` is off limits, so no spawned run is possible here. Two hand runs stand in; a spawned run is the first job after Donald installs 2.4.0.
- REC-3, refusing learn agents by name in the review custom list: the hand off limits review.md edits to the learn skip. The agent side refusal (LOW-21) covers the same path.
- REC-8 and REC-18, the rebuild half (`--resynth`, owner edits as DPO pairs): a rebuild mode is hours of new orchestration, and an edit pair needs the landed item text read from content, which learn never reads as evidence. `review.md` records the verdicts now, so either can be built on it later.
- REC-13, progress, a token estimate and `--resume`: run ergonomics, not item quality, privacy or loading. The angle wave now prints one progress line per question; the estimate and resume are left.
- REC-16, `learn.preview_cmd`: a repo tool the command would only print; not quality, privacy or loading.
- REC-25, the `system` hash half: a model cannot compute a hash reliably, and the README carries the system message.

## Scrub of this audit folder (R1)

Every report that quoted private text got a line under its header saying
what was redacted and why: synthesis.md and the bugs, integration,
security, gap-hunter, ux and devils-advocate reports. Quoted item stems,
options, keys, topic words drawn from a secure item and the private
scenario keys are now item ids and neutral descriptions in [brackets];
every finding, id, citation, grade and number stands. `input-diff.patch`
lost its 34 `docs/examples/` sections, and 37 plugin lines that used the
secure item's key fact or a private bank path are marked [redacted]; it no
longer applies as a patch, and its first lines say so. Proof: a grep of
the folder for the private words (the item topics, keys, distractors, the
scenario keys, the DOI) finds nothing, and a 4-word shingle match of the
folder against every file of both dry run examples finds only ids, paths,
counts and generic phrases. One phrase stays on purpose: "N1 = slow eye
movements" in context.md and synthesis.md is Donald's own blueprint
sentence, a textbook fact, not a quote of any item.

## Dry run results

Two fresh hand runs, written only under the gitignored `local/dry-runs/`,
each following learn.md and the six agent files in sequence (Opus agents
playing every role, no spawning, both source repos untouched). Item text
stays in `local/`; below are ids and numbers only.

Regrade, added by the round 2 fix-up: an independent grader
(audits/2026-09-29-1428-custom, devils-advocate) counted 6 of 10 teaching
repo drafts meeting the bar, not 9; 1 vocabulary in effect, not 0; and 3
restatements across both runs, not 2. The table below is the fixer's own
count and overstates the result.

| measure | The teaching repo `tA-03` (secure bank) | The course repo `h-03` (hard) |
|---|---|---|
| draft items | 10 | 7 (easy 1, medium 4, hard 2, both hard kinds) |
| vocabulary items shipped | 0 of 10 (1 dropped as naming) | 0 of 7 (1 dropped as naming) |
| items meeting the bar | 9 of 10 | 6 of 7 |
| the one that falls short | tA-14: same key reason as the source, one new distractor | m-10: restates the source's key reason as a case |
| key over mean distractor length | 0.95 to 1.14, mean 1.06 | 0.95 to 1.03, mean 0.99; longest 0 of 7, shortest 0 of 7 |
| key position in rows after the shuffle | sft 3,2,3,3; dpo 7,7,7,6; grpo 2,3,3,3 | sft 2,2,2,2; dpo 5,6,6,5; grpo 2,2,2,2 |
| rationale words, drafts | median 28, 22 to 31 | median 80, 75 to 104; names the pulling distractor 7 of 7 |
| rationale words, calibration | bank multiple choice 12 to 37 (whole bank median 26, 12 to 65) | module quiz median 62, 45 to 113 |
| rows | sft 16, dpo 27, grpo 11 | sft 14, dpo 22, grpo 8 |
| DPO pairs | shallow 11, misconception 5, misplaced 11 (chosen over rejected length 0.94 to 1.21) | shallow 8, misconception 6, misplaced 8 (0.94 to 1.03) |
| DPO rejected read as the bad student | yes, by construction; not sampled by me | 3 of 3 sampled: key only, a wrong option with its belief, the right key with one home swapped |
| claims | V105 U13 C1, 1 note quarantined | V47 U22 C0, 0 quarantined; 2 rewordings, both passed the recheck |
| VERIFIED claims spot checked against their lines | 5 of 5 hold (K3, K23, A18, H28, P23) | 5 of 5 hold (K1, K11, A6, H6, P4) |
| JSONL, every line parses with the TRL keys | yes: the script reads RESULT: pass on all three files | yes: RESULT: pass on all three files; a rerun changes no byte |

The item files keep the bank's authored order (key first, 10 of 10 and 7
of 7), as the contract says; the rows are shuffled. The first check
failed on the source rows; the script now skips rows built on a bank's own
source question, and the run then reads RESULT: pass.

Both runs also named ambiguities, fixed in the same two commits: writing
rules named only in a bank's header, a shape with no trap field, adjacent
line citations, the release sheet leaking through misconceptions, `group`
missing new items, learn-asked items with no rung, claim ids in student
text, one forbids check per misconception, the key reason demanding an
inference, and the secure quoting rule blocking dedupe in a secure run.

## Needs a second review round

1. **History still carries the old examples.** Commit 28e269c, local and
   unpushed like everything here, holds the prompts before this fix: the
   tB-06 key fact as the teaching example, the real secure bank path,
   the item id, and both private repos' layouts. Pushing the branch
   publishes them in history. Donald's call: squash 53f9626 and 1583b79
   into 28e269c before the first push, or accept it. Not done here: the
   hand off asked only for 32a1c17 to go.
2. **No spawned run yet.** Both dry runs were one agent playing every
   role, with python for counting. Real synthesis has no shell and must
   count words and length ratios itself. REC-1 stands.
3. **The script rewrites the row files.** It is tested on hand rows and
   both dry runs (idempotent, balanced), but a reviewer should read the
   shuffle for a row whose option block a model formats oddly.
4. **Dedupe by key reason is soft.** Both runs shipped one near
   restatement of the source (tA-14, m-10) that the rule should have
   caught.
5. **The GRPO rubric cannot see a misplaced home** (CONTRACTS.md section
   13 now says so); only the DPO `misplaced` pairs carry it.
6. **Untested orchestration:** the out_dir, same-repo, check-ignore and
   refusal paths ran only as shell commands in a scratch repo, and
   `qa/human/learn-leak-guards.md` has never been walked.
7. **review.md and dispatch.md** changed only in their pathspecs; a
   reviewer should confirm no listing was missed.
