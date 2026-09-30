---
title: devils-advocate report, audits/2026-09-29-1428-custom
author: Claude Opus 5.5 (devils-advocate)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Goal (from the dispatch, unchanged from round 1): items at the level of Donald's own quizzes; mechanism and job scenarios, never bare vocabulary; plausible wrong mechanisms of one length and shape as distractors; a hard tier that spots a mistake in a spec or makes a call; every option's home explained in the items and the study sheet; DPO rejected answers that read as the bad student; claims cited or UNVERIFIED; repo agnostic.

Privacy: this report names item ids and numbers only. No stem, option, key, rationale or topic word of a private item appears. Per-item length ratios and longest or shortest key counts are withheld, because each one points at keys. Both dry run folders are written `<run>`, because the folder names carry a bank file name.

## Item grades

Calibration: the secure bank's 10 multiple choice items (the teaching repo) and the course repo calibration quiz's 24 items, the same sets as round 1. Every number below was recounted with python3 over the YAML and JSONL, read only. The fix report's numbers were not used.

### the teaching repo dry run, tA-03 (10 items)

| item | rung | verdict |
|------|------|---------|
| tA-11 | application | Meets the bar. A mechanism applied to a case. Two of the three distractors are the source's own fixes, and the stem rules them out plainly. Key reason A4 is UNVERIFIED. |
| tA-12 | application | Meets the bar, at the easy end. One threshold read on a case; each distractor is a real neighbor. |
| tA-13 | discrimination (reverse) | Falls short. It asks the source's key reason backward, so a reader who answered tA-03 needs no new fact. Only the homes changed, so the dedupe rule let it through (MEDIUM-2). Key reason A15 is UNVERIFIED. |
| tA-14 | application | Falls short. Same key reason as the source, with 2 of 3 homes shared. The fix report counts this one. |
| tA-15 | discrimination | Falls short. It is vocabulary in effect: the key restates one lecture passage (A27, A28), and two of the three distractors are neighboring bullets of the same lecture (A29, A31). It passes the naming test only because its key is a sentence, not a value or a name (LOW-1). |
| tA-16 | discrimination | Meets the bar. The reader recognizes the case, then applies a scoring rule. Each distractor is a real scoring rule used on the wrong signal. |
| tA-17 | application | Meets the bar. A localization call on a case; each distractor is the fix for a different fault. |
| tA-18 | multi-step | Meets the bar. Two facts chained, and each distractor comes from one named wrong step. It has the same key reason as tA-19 and lists it as a leak. |
| tA-19 | spot-the-mistake | Near the bar. The excerpt is quoted, the fault is not pointed at, and the bank does not already plant it. One surface cue lets a test-wise reader find the planted line without knowing the fact. Its kind is withheld, because naming it points at the key (LOW-3). |
| tA-20 | edge-case | Meets the bar as the repo defines it. It makes a call, and a note says one distractor is defensible under a second source passage, which the repo's own writing rules allow when a note says so. All four rows ship VERIFIED with no trace of that note (MEDIUM-3). |

Result: 6 of 10 meet the bar (the fix report says 9 of 10), 1 is near, and 3 fall short. Vocabulary in effect: 1 of 10 (the fix report says 0). Restatements of the source: 2, tA-13 and tA-14 (the fix report counts 1).

### the course repo dry run, h-03 (7 items)

| item | tier | verdict |
|------|------|---------|
| e-09 | easy | Meets the bar. What happens and why, on a case. One distractor reaches the right conclusion by the wrong route, which is the shape the calibration favors. Its leak line leaves out the source, and the source's stem gives this item's answer (MEDIUM-1). |
| m-09 | medium | Meets the bar. A booking decision; each distractor is a real rule from the wrong list. |
| m-10 | medium | Falls short. It asks the source's key reason as a case, and its own comment says its stem states the source item's key. Only 1 of 3 homes is shared, so the dedupe rule let it through, and the run README says so in as many words (MEDIUM-2). |
| m-11 | medium (edge-case) | Meets the bar. A boundary case, traced. Its stem states the source item's key, and its leak line leaves out the source (MEDIUM-1). |
| m-12 | medium | Meets the bar. A decision checked against the cases the stem gives. Its options state the source item's key, and its leak line leaves out the source (MEDIUM-1). |
| h-09 | hard, spot the mistake | Meets the bar. The excerpt is quoted, the fault is not pointed at, and it is a fault the bank does not plant. Its stem states the source item's key, and its leak line leaves out the source (MEDIUM-1). |
| h-10 | hard, make the call | Meets the bar as an item. Key reason H10 is UNVERIFIED, and the item is marked `incomplete: source`, as the rule asks. |

Result: 6 of 7 meet the bar, which matches the fix report. 0 are vocabulary and 1 restates the source. The whole pool rests on one four-line source passage.

### Measurements

- **Key over mean distractor length.**
  - the teaching repo drafts: 0.95 to 1.14, mean 1.05. The course repo drafts: 0.95 to 1.03, mean 0.99. Calibration: 0.91 to 1.06, mean 0.98.
  - In the teaching repo run, the "key is the longest option" trigger of `learn-synthesis.md:197` fired and nothing was done about it (LOW-2).
- **Key position after the shuffle**, recounted from `metadata.key_position`:
  - the teaching repo: sft 3, 2, 3, 3 (5 rows none); dpo 7, 7, 7, 6; grpo 2, 3, 3, 3.
  - the course repo: sft 2, 2, 2, 2 (6 rows none); dpo 5, 6, 6, 5; grpo 2, 2, 2, 2.
  - Both match the fix report. The item files keep the key first on 17 of 17 drafts, which is the bank convention.
- **Vocabulary share.** 1 of 17 by the goal's bar (tA-15). 0 of 17 by the contract's mechanical test. Round 1 had 9 of 19.
- **Rationale words.**
  - the teaching repo: drafts 22 to 31, median 28. The bank's multiple choice items run 12 to 37, median 17.5.
  - the course repo: drafts 75 to 104, median 80, against the calibration's 45 to 113, median 62. Trap notes: median 22 against 14.
  - Every draft sits inside its calibration range.
- **Stem words.** The teaching repo median 35 against 19. The course repo median 50 against 31.5, and two items are longer than the calibration's longest stem (LOW-4).
- **DPO.** All 49 rejected answers were read.
  - 19 are shallow (the bare key), 11 misconception (a real wrong option plus a belief), 19 misplaced (the right key with one home moved). 0 are nonsense. All 49 read as the bad student.
  - One misplaced answer invents a home instead of moving a distractor to another option's home: the course repo `dpo.jsonl:14`, against `learn-synthesis.md:266` to `:267`.
  - Misplaced chosen over rejected length: 0.94 to 1.21 and 0.94 to 1.03.
- **Study sheet answers.** Every option is placed in its home on 10 of 10 and 7 of 7 answers.
- **VERIFIED spot checks**, chosen apart from the fix report's ten:
  - the teaching repo: K13, A3, A27, H6, H15 to H16. All 5 hold against their lines.
  - the course repo: K8, K10, H1, H5, H9, A4. All 6 hold.
- **Counts.** Rows, pair kinds and claims (V105 U13 C1; V47 U22 C0) match the fix report.

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/agents/learn-harder.md:188` Leak lines point one way, and learn-harder has no step that writes them. So the secure the course repo run's `study-sheet-release.md` gives students the source item's key through its practice items.
Claim: `learn-synthesis.md:352` to `:354` and `CONTRACTS.md:1331` to `:1333` drop from the release sheet "every practice item whose `leaks with` names the source id".
Mechanism: `learn-asked.md:77` to `:80` defines a leak as another item "whose text gives its answer away": other text reveals this item. The release rule needs the reverse: this item's text reveals the source. learn-harder has the `leaks with:` output field (`:188`) and no method step for it (`:82` to `:107`). So an item whose own stem or options state the source key names nothing about the source, and it stays in the release sheet.
Traced:
- The course repo learn-harder angle's four leak lines name siblings only. learn-asked's m-11 line names a sibling only.
- `items-DRAFT.yaml:19`, `:128`, `:162`, `:199` and `:237` carry those lines unchanged.
- `study-sheet-release.md` keeps 5 practice items. Practice 2, 3 and 4 (`:35`, `:43` to `:45`, `:49`) state the source item's key in their stem or options.
- Only m-09 and m-10 (`items-DRAFT.yaml:57`, `:92`) name the source. m-10's mark is the reverse direction of learn-asked's own rule.
- The teaching repo release sheet is clean: its 3 practice items state no source key.
Why other reviewers miss it: bugs MEDIUM-1 and integration MEDIUM-1 checked the misconception, plan step and self check lines against the contract. This path runs through the practice items the contract rule does drop, fed by leak lines that nothing checks.
What would catch it:
- Define both directions in learn-asked step 7, and add the same step to learn-harder's method.
- Before synthesis writes the release sheet, grep each kept practice item's stem and options for the source key's content words, and drop every hit.
- Add a step to `qa/human/learn-leak-guards.md` that runs the same grep over `study-sheet-release.md`.

MEDIUM-2. `plugins/djinn/agents/learn-synthesis.md:100` The restatement test needs the same key reason AND the same homes, so changing distractors lets a restatement ship. 3 of 17 drafts restate the source, not the 2 the fix report counts.
Claim: `learn-synthesis.md:100` to `:102` says "An item that tests the same key reason and the same homes as the source question only restates it". The same conjunction is at `learn-asked.md:47` to `:50` and `learn-harder.md:88` to `:89`.
Mechanism: The key reason is what a student carries over from the source. The homes are the cheap part to change. Requiring both lets through any item with one new distractor. The reverse step (`learn-asked.md:60` to `:64`) produces the source's key reason run backward by construction, so it always passes a homes test.
Traced:
- The course repo `README.md:80`: m-10 "shares the source item's key reason ... but not its homes, so it ships". Its own comment, `items-DRAFT.yaml:94`, says the stem states the source item's key.
- The teaching repo tA-14 (`items-DRAFT.yaml:118` to `:141`) keys the source's key reason and shares 2 of 3 homes.
- tA-13 (`:96` to `:117`) is the reverse item: key reason A13 to A15 against the source's K27, with 0 homes shared.
Why other reviewers miss it: the rule reads as strict, and each README reports it applied.
What would catch it: replace the test with one question synthesis answers in each item's comment: `new fact beyond the source's key reason: <claim id> or none`. None means the item is dropped. A grep of `items-DRAFT` for `none` on that line then finds every restatement. Keep a reverse item only when it needs such a fact.

MEDIUM-3. `plugins/djinn/CONTRACTS.md:1049` Only reworded items get the check "does a distractor also satisfy the key". Commit 1583b79 took "why every other option is wrong" out of the key reason. Now an item whose own note calls a distractor defensible ships VERIFIED in every row.
Claim:
- `CONTRACTS.md:981` to `:985`: "Why each other option is wrong is not part of it: each distractor's home is a claim of its own, so one key reason can be VERIFIED from one source line".
- `CONTRACTS.md:1049` to `:1054` and `learn-fact-checker.md:172` to `:176` read every option against the key in recheck mode only.
Mechanism: Each claim is checked on its own. When two sources order a step differently, they never meet in one check: the key reason is VERIFIED from one line and the distractor's home from the other. Unless synthesis reworded the item, nothing asks whether it has one defensible key. VERIFIED then means only that every sentence has a source, and the README load recipe's VERIFIED filter keeps the item.
Traced:
- The teaching repo `items-DRAFT.yaml:259` to `:263`: tA-20's note says one distractor is defensible under a second source passage.
- `verification/tA-03.md:106`: H27 is VERIFIED, with the note "the lines do not disagree".
- `rephrased.md:8` reads none, so no recheck ran.
- `sft.jsonl:11`, `dpo.jsonl:21` and `:22`, and `grpo.jsonl:11` are all VERIFIED and split `train`. The GRPO row pays 0.0 for the defensible option.
- No run has exercised the 1583b79 change. Both runs' angles and verification files were written 14:02 to 14:12, the commit is at 14:25, and its message says the runs found the gap. The teaching repo table still words A15 as an elimination (`verification/tA-03.md:63`).
Why other reviewers miss it: every claim in the table is correct, and the note sits in an owner comment that the rows never carry.
What would catch it:
- Ask the recheck's double-key question (`learn-fact-checker.md:172`) of every item, reworded or not, reading each distractor against every line cited for the key reason and the homes.
- An item with a defensible distractor ships UNVERIFIED, with a claim that names both lines.
- Then run one fresh dry run after 1583b79.

### LOW
LOW-1. `plugins/djinn/CONTRACTS.md:934` The naming test covers only a key that is "a value or a name". A key that restates one source sentence, set among distractors that are its neighboring sentences, passes it: tA-15.
Claim: `CONTRACTS.md:934` to `:937` lists "which X goes with Y" as a naming item. The same wording is at `learn-harder.md:35` to `:38`, `learn-asked.md:20` to `:22` and `learn-synthesis.md:86` to `:89`.
Mechanism: The test's first clause limits the key to a value or a name. A key that is one bullet paraphrased is the same recall with a longer key.
Traced: the teaching repo `items-DRAFT.yaml:142` to `:167`. The key rests on A27 and A28, adjacent bullets of one passage. Two of the three distractors come from the same lecture's neighboring bullets (A29, A31). The stem names the thing asked about.
Why other reviewers miss it: the item has a case sentence, so it reads as discrimination.
What would catch it: widen the test to "a key that one source passage states, as a value, a name or a sentence, where the stem already names what that passage is about". Synthesis then checks each key's citation against the stem's subject.

LOW-2. `plugins/djinn/commands/learn.md:649` The script checks only the 0.8 to 1.25 band. So nothing checks the "key is the longest option" trigger of `learn-synthesis.md:197`, and the teaching repo run skipped it.
Claim: `learn-synthesis.md:197` to `:202` says "When the key is the longest option ... rewrite the distractors". The teaching repo `rephrased.md:8` to `:12` says "none", because every key "sat inside 0.8 to 1.25 as written".
Mechanism: Synthesis read the band as the whole rule. A longest key passes the band, and the script (`learn.md:646` to `:650`) checks the band only.
Traced: measured on the teaching repo `items-DRAFT.yaml`, the trigger holds on part of the pool. The count and ids are withheld, because either points at keys. The fix report prints a longest count for the course repo and none for the teaching repo (`fix-report.md:137`).
Why other reviewers miss it: the band passes and `rephrased.md` reports that it was followed.
What would catch it: in the script, fail a row whose key is strictly longer than every distractor, beside the band at `learn.md:649`. Synthesis also writes a `longest: yes or no` line per item in `rephrased.md`.

LOW-3. `plugins/djinn/agents/learn-harder.md:115` The item rules assume a stem whose key is the one true option. A spot-the-mistake stem keys the one false option, and no rule is restated for that case, so tA-19's planted line carries a test-wise cue.
Claim: the rule 1583b79 added, `CONTRACTS.md:957` to `:959` and `learn-harder.md:65` to `:67`: the stem "may quote the excerpt, but it never points at the faulty line or says what is wrong with it".
Mechanism: The new rule controls the stem. It says nothing about the planted line's own wording, which can set it apart from the sound lines. The kind of cue is withheld here.
Traced: the teaching repo `items-DRAFT.yaml:231` to `:255`, read against the repo's own item writing rules, which name this class of cue. As written, the new rule holds on both runs: both spot-the-mistake items quote their excerpt, and neither points at the fault. The course repo h-09 (`items-DRAFT.yaml:198` to `:235`) is clean.
Why other reviewers miss it: the item meets every rule in the list at `learn-harder.md:115` to `:122`, read with the true option as the key.
What would catch it: add one line under `learn-harder.md:67`: "in a which-is-wrong item, apply every item rule with the planted line as the key: it matches the sound lines in form, so only the fact finds it".

LOW-4. `plugins/djinn/CONTRACTS.md:1032` The repo's register is measured for rationales only. Stems run 1.6 to 1.8 times the calibration median, and nothing measures them.
Claim: `CONTRACTS.md:1032` to `:1035` measures the bank's rationale lengths and writes inside the range. Stems have no such rule.
Mechanism: Angles build case stems with every elimination clause spelled out, and nothing compares a stem with the bank.
Traced: the teaching repo stems have a median of 35 words against 19 for the bank's multiple choice items. The course repo stems have a median of 50 against 31.5, and m-11 (59 words) and h-09 (72) are longer than the calibration's longest stem (56).
Why other reviewers miss it: the only length check anyone runs is on options and rationales.
What would catch it: add stem word count to synthesis's register measure (median, lowest, highest). Write each stem inside the range, or say in the item's comment why it runs longer.

LOW-5. `plugins/djinn/agents/learn-synthesis.md:260` Misconception pairs on new items carry the source's id as `item`, and the widened script skip (`learn.md:646`) trusts that label.
Claim: `CONTRACTS.md:1143` to `:1145`: `item` is "`<item id>-m<n>` for a misconception on that item (the source's or a new one's)".
Mechanism: `learn-synthesis.md:260` to `:262` defines the pair, and `:310` to `:318` lists the metadata, without the naming form. So both runs named every misconception `<source id>-m<n>`. The script's source row skip (`learn.md:646`, described at `:797` to `:799`) trusts the label and exempts those rows from the key length check. A per-item eval or dedupe then files a new item's prompt under the source.
Traced:
- The teaching repo `dpo.jsonl:26` and `:27` are labeled tA-03-m4 and -m5, but their prompts are tA-16 and tA-20.
- The course repo `dpo.jsonl:19` to `:21` are labeled h-03-m3 to -m5, but their prompts are e-09, m-12 and h-10.
- That is 5 of 11 misconception pairs. The teaching repo README's "three misconception pairs on tA-03" (`README.md:76`) counts only the rows the length band caught.
Why other reviewers miss it: the script passes, and the label has the right shape.
What would catch it: state the `item` form in `learn-synthesis.md:261`. In the script, fail a `<source_id>-m<n>` row whose user message is not the source row's, byte for byte.

### DEBT
none

### REC
none

## Blast radius

LOW-6. `audits/2026-09-29-1303-custom/fixes/fix-report.md:135` The round 1 fix report's item results do not hold on a regrade.
Claim: `:134` says 0 of 10 vocabulary, `:135` says 9 of 10 meet the bar, and `:179` to `:181` says "Both runs shipped one near restatement".
Mechanism: The regrade gives 6 of 10 meeting the bar, 1 of 10 vocabulary in effect, and 3 restatements across the two runs. The report's counts come from the same instructions that produced the gaps (MEDIUM-2, LOW-1).
Traced: the Item grades section above, against the drafts in `local/dry-runs/<teaching>/<run>/items-DRAFT.yaml`.
Why other reviewers miss it: the fix report is outside the fence, and its row counts and claim counts all check out.
What would catch it: have the next fix report's item table cite an independent grader's file, not the fixer's own count.

## Checked and Clean

- `plugins/djinn/commands/learn.md`: the shuffle balances key positions in all six row files (recounted above). The fix report's positions match.
- `plugins/djinn/agents/learn-synthesis.md`: all 49 DPO rejected answers read as the bad student, and 0 read as nonsense. Every study sheet answer places every option (17 of 17), so round 1 MEDIUM-4 stays fixed.
- `plugins/djinn/agents/learn-fact-checker.md`: 11 VERIFIED claims spot checked across both runs, and all hold. The counts V105 U13 C1 and V47 U22 C0 match the tables.
- `plugins/djinn/CONTRACTS.md:957`: both spot-the-mistake items quote their excerpt, and neither points at the fault.
- `plugins/djinn/CONTRACTS.md:1045`: on the course repo, a key is never cut. e-09 and m-09 reworded one distractor each, the keys were untouched, and the recheck passed 2 of 2, so round 1 MEDIUM-3 stays fixed.
- `plugins/djinn/CONTRACTS.md:1032`: every draft rationale sits inside its calibration range in both runs.
- `plugins/djinn/CONTRACTS.md:933`: the mechanical naming test dropped one item in each run, and the dropped items are listed.
- The teaching repo `study-sheet-release.md`: its 3 practice items state no source key.

## Files read outside the fence

- `local/dry-runs/<teaching>/<run>/`, every file (dry run under regrade)
- `local/dry-runs/<course>/<run>/`, every file (dry run under regrade)
- `audits/2026-09-29-1303-custom/fixes/fix-report.md` (claims under regrade)
- `audits/2026-09-29-1303-custom/agents/devils-advocate.md` (round 1 grades)
- the secure bank, the teaching repo (calibration set)
- The course repo calibration quiz (calibration set)
- `<teaching repo>/content/lectures/`, four files (spot check claims)
- `<course repo>/research/`, one sources file (spot check claims)
- `<teaching repo>/docs/ITEM-WRITING.md` (repo item writing rules)
- `~/Conventions/voice/ITEM-WRITING.md` (writing rule grep)
- `git log backup-learn-before-squash` (when the rules changed)
