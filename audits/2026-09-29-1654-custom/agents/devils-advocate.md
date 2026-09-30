---
title: devils-advocate report, audits/2026-09-29-1654-custom
author: Claude Opus 5.5 (devils-advocate)
date: 2026-09-29
status: audit finding, not yet deliberated
---

This report is written into a public repo. It quotes no stem, option, key, rationale or topic word of a private item, names no bank file, private repo, course track or workplace, and writes `~` for the home folder. `<teaching>` and `<course>` are the two folders under `local/dry-runs/round-3/`, and `<run>` is the run folder inside each, whose name carries a bank name. Teaching drafts are T1 to T7 and course drafts C1 to C5, in file order. Per-item length ratios, key positions and longest or shortest counts are withheld, because each points at keys. Where a finding turns on a property of a planted line or an option set, the property is withheld for the same reason.

Goal (from the dispatch, unchanged): items at the level of Donald's own quizzes; mechanism and job scenarios, never bare vocabulary; distractors that are plausible wrong mechanisms of one length and shape; a hard tier that spots a mistake in a spec or makes a call; every option's true home explained in the items and the study sheet; DPO rejected answers that read as the bad student; claims cited or UNVERIFIED; for a secure source, a release sheet that does not let a student pick the source item's key.

## Item grades

Every number below was recounted with python3 over the YAML and JSONL, read only. The fix report's numbers were not used. Calibration: the teaching input bank's 5 single choice items, and the course repo calibration quiz's 24 items, the same sets as rounds 1 and 2. The course input module's own quiz is measured beside it.

### Teaching run, one secure single choice source (7 drafts)

| draft | rung | verdict | the single reason it might fail |
|-------|------|---------|---------------------------------|
| T1 | discrimination | Falls short | Double keyed, and caught: it ships UNVERIFIED and out of `grpo.jsonl`. A second secure bank in the same repo holds an item whose key takes the side of T1's defensible distractor, so the owner's own bank disagrees with T1's key. No angle read that bank (MEDIUM-1). |
| T2 | application | Meets | Close to an input bank item's arithmetic, through a related control. |
| T3 | application | Meets | One recalled range value alone rules out one distractor. |
| T4 | application | Meets | Its answer states a fact from which the source key follows, and its leak line reads `none` (`items-DRAFT.yaml:91`). A strong job scenario otherwise. |
| T5 | multi-step | Near | Its key turns on the source's key reason plus a criterion the input bank tests twice and the second secure bank tests in the same shape. A student who answered those needs nothing new. Its `new fact` is legitimate by the contract's letter. |
| T6 | spot-the-mistake | Near | The planted line differs from the sound lines in one surface property (MEDIUM-3). One stem clause states the source's key reason, and its leak line omits the source (`items-DRAFT.yaml:127`). Its double key flag is the false positive bugs MEDIUM-4 reports. |
| T7 | edge-case | Falls short | Two competent readers pick different options: the study sheet's own answer calls the other reading "the exception the stem names". Its `new fact` is the source key's own claim cited from a second line (LOW-1). |

Result: 3 of 7 meet, 2 near, 2 fall short. The fix report says 5 of 7. Vocabulary in effect: 0 of 7. Restatements: 1 (T7), with T5 at the edge.

### Course run, one medium source, run secure (5 drafts)

| draft | tier | verdict | the single reason it might fail |
|-------|------|---------|---------------------------------|
| C1 | easy | Meets | One distractor carries a number the stem gives no basis for, so it pulls no one who holds its belief. |
| C2 | medium | Falls short | It is a sibling module's easy item: the same key reason and 2 of its 3 distractor homes. Its leak line reads `none`, and its rationale states the source's key reason (MEDIUM-1). |
| C3 | medium | Near | The option set carries a test-wise cue; the fix report names it too. |
| C4 | hard, spot the mistake | Near | Two distractors are weak enough that elimination finds the key, and the planted line carries the cue of MEDIUM-3. |
| C5 | hard, make the call | Meets | It rests on a behavior the source doc itself says differs across engines (`one-read.md:499 to 500`), and the stem names no engine. |

Result: 2 of 5 meet, 2 near, 1 falls short. The fix report says 4 of 5 and 1 near. Vocabulary in effect: 0 of 5. Restatements: 0.

Across both runs: 5 of 12 meet, 4 near, 3 fall short. The fix report says 9 of 12.

### Measurements

- **Key over mean distractor length.** T drafts 0.92 to 1.01; C drafts 0.94 to 1.04; the calibration quiz 0.91 to 1.06. Every draft sits inside the 0.8 to 1.25 band, and the script's longest key rule holds on all 12.
- **Rationale words.** T 12 to 21, median 15, against the input bank's 10 to 26, median 14. C 66 to 70, median 66, against the calibration quiz's 45 to 113, median 62, and the input module's 49 to 70, median 58.5. Trap notes: C median 13 against 14 and 9. Every draft is inside its range.
- **Stem words.** T 25 to 74, median 29, against 10 to 30, median 24; T6 runs 2.5 times the bank's longest and says why. C 23 to 54, median 35, against the calibration quiz's 23 to 56, median 31.5.
- **Study sheet homes.** Every option of all 12 drafts is placed in its home in the answers section, read by hand: 28 of 28 and 20 of 20.
- **DPO, 38 pairs read in full.** 14 shallow and 10 misconception pairs read as the bad student. Of 14 misplaced pairs, 5 read as the bad student, 1 is borderline, 5 are nonsense, and in 3 the rejected answer is correct (MEDIUM-2). So 29 of 38 read as the bad student, against 49 of 49 in round 2.
- **Misconception labels.** 10 of 10 carry the id of the item their prompt asks; round 2 LOW-5 holds.
- **VERIFIED spot checks.** T: K3, A11, H12, H14, H20. C: K1, K6, K10, H10, H13. All 10 hold against their lines. Also read and holding: T A2, H5, H15, H21; C A6, H11, H12.
- **Counts.** T claims V59 U3 C0 plus 6 uncited (3 V, 3 U); C V25 U28 C0 plus 2 uncited. Both `check.txt` end `RESULT: pass`. Both match the READMEs.

### Release sheets

- **Teaching: 4 practice items kept. A student can pick the source key.** Three of the four give it: one practice answer (`study-sheet-release.md:49`), one practice answer (`:53`), and one quoted stem line (`:37`) each state a fact from which the source key follows. The fix report counts two. The fourth (`:51`) points toward a distractor, not the key. Security MEDIUM-2 already files the leak; this regrade adds the count.
- **Teaching, the sentence read (d) applied by hand:** it drops all three hits and keeps one item. It would have caught what I find, at the cost of three quarters of the sheet.
- **Teaching, the ambiguous stem rule applied by hand:** it touches nothing on the release sheet. On the pool it catches T7, whose stem defines a term one way while the key reads it another, the rule's own example at `learn-fact-checker.md:117 to 119`. T7 would then ship UNVERIFIED and leave `grpo.jsonl`, where it now sits VERIFIED. In the run, the fact checker had read the same stem and written that it "settles" the reading (`verification/<id>.md:91`), so the rule leans on the judgment that passed T7.
- **Course: 0 practice items.** The term rule alone excluded all five, because the source key's words are the module's own topic nouns. By hand, the sentence read would also drop C2. A student can pick nothing from an empty sheet, and can learn nothing from it either (DEBT-1).

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/CONTRACTS.md:915` The bank the angles dedupe and leak-check against is the input file alone, so a sibling bank on the same fact set is never read. The course run wrote a sibling module's item again (C2), and the teaching run wrote over a second secure bank it never opened.
Claim: `learn-asked.md:47` to `:55` and `learn-harder.md:91` to `:97`: "Read the whole input file and every question bank the item shape names ... A new item whose key rests on the same key reason as one of these ... is not written."
Mechanism: `CONTRACTS.md:915` to `:918` discovers `item_shape` as "the input file itself when it is a quiz bank" plus schema docs and tests. So "every question bank the item shape names" is one file. A distractor turned key lands, by design, on a neighbor topic's key, which is where sibling modules and sibling quizzes live.
Traced: `<course>/<run>/context.md` item_shape names one bank. `angles/<id>/learn-asked.md:10` to `:15` lists only that bank's items. C2 (`items-DRAFT.yaml:45` to `:69`) matches a sibling module quiz item (`<sibling module>/quiz.yaml:145` to `:166`) on key reason and 2 of 3 homes, and its leak line reads `none`. `<teaching>/<run>/learn-config.yaml` item_shape names one bank, while a second secure bank in the same `content/secure/` folder holds at least five items on the source's key reason, one in T5's shape, and one whose key takes the side of T1's defensible distractor.
Why other reviewers miss it: the angles' "Already in the bank" lists are complete for the file they were given, and every wave 1 reviewer read the prompts, not the target repos.
What would catch it: a `dedupe` read over every bank in the input's folder and its sibling module folders, or every bank sharing the input item's topic tag, listed under "Already in the bank". A QA step: grep the source item's topic tag across the repo's banks, and confirm every hit is listed.

MEDIUM-2. `plugins/djinn/agents/learn-synthesis.md:297` The misplaced DPO pair has no table to draw from on a new item, so 8 of 14 misplaced rejected answers are nonsense or correct.
Claim: `learn-synthesis.md:297` to `:300` and `CONTRACTS.md:1182` to `:1184`: rejected "puts one distractor in another option's home from learn-known's table. Never an invented home", and `:287` "never like nonsense".
Mechanism: learn-known's option table covers the source question only (`angles/<id>/learn-known.md:31` to `:37`). For 12 of 14 pairs synthesis had no table. The teaching run swapped two options' homes, and where a home is a computation on the option's own value, the swap is a false statement about the stem's own numbers. The course run wrote "its true home is X, not Y", and in 3 pairs X is the option's own true home, so rejected says what chosen says.
Traced: `<teaching>/<run>/dpo.jsonl:6`, `:8`, `:12`, `:14`, `:16` (nonsense), `:2` (borderline). `<course>/<run>/dpo.jsonl:6`, `:8`, `:10` (rejected correct). All are split `train`. A trainer on these rows learns to reject a correct answer in 3 pairs.
Why other reviewers miss it: the pair has the right shape, the right length and the right key, and the script checks all three.
What would catch it: in the script, assert that the one clause where rejected differs from chosen is byte-equal to another option's home clause in chosen. In the prompt, move the distractor to the home a named misconception or the item's pull line gives it, and write no misplaced pair where there is none.

MEDIUM-3. `plugins/djinn/CONTRACTS.md:994` The rule that a planted line matches the sound lines "in length, form, specificity and qualifiers" is checked for length only, and 2 of 2 spot-the-mistake drafts break it.
Claim: `CONTRACTS.md:994` to `:996` and `learn-harder.md:73` to `:76`, "carries no word the others lack, so only the fact finds it", added for round 2 LOW-3.
Mechanism: The only check anyone runs on a planted line is the length band. Synthesis writes `longest: no, ratio 1.00` and the course item file lists "rules met by counting", none of them form. In both drafts the planted line differs from every sound line in one surface property a test-wise reader uses without the fact. The property is withheld because it points at both keys.
Traced: `<teaching>/<run>/items-DRAFT.yaml:128` and `:133`. `<course>/<run>/items-DRAFT.yaml:11` to `:12` and `:105` to `:110`. Round 2 found the same class on 1 of 2 (its LOW-3); round 3 is 2 of 2, after the rule landed.
Why other reviewers miss it: the rule reads as enforced, and the item comments report a ratio that passes.
What would catch it: a script check that compares each planted line with the sound lines for a fixed list of cue words (negation, absolute, hedge, justification clause) and fails a planted line that alone carries one. Or the blind read in Convergence below.

### LOW
LOW-1. `plugins/djinn/agents/learn-synthesis.md:97` The restatement test is run as a presence check on the `new fact` id. T7's new fact is the source key's own claim, cited from a second line, and it passed.
Claim: `learn-synthesis.md:97` to `:101` drops an item "whose named claim is the source's key reason in other words".
Mechanism: The fact checker checks each claim alone, so two claims stating one fact from two lines are both VERIFIED under different ids. Synthesis compared ids, not facts.
Traced: `<teaching>/<run>/angles/<id>/learn-known.md:34` (the key rests on K4 and K3). `verification/<id>.md:16` (K3) against `:57` (H20), the same fact four lines apart. `items-DRAFT.yaml:145` names H20. `README.md:51` "None reads none" is the whole record of the test.
Why other reviewers miss it: every item carries a `new fact` line with a real claim id, which is what the rule's wording asks for.
What would catch it: the fact checker adds a column per claim, `same fact as: <claim id> or none`, and synthesis drops an item whose new fact names a source key claim there.

LOW-2. `plugins/djinn/CONTRACTS.md:1119` The recheck covers a changed key or option only, while the stem range rule tells synthesis to rewrite stems after the fact check. A rewritten stem never meets the double key read that now reads stems.
Claim: `CONTRACTS.md:1119` "every item whose key or any option changed"; `learn-synthesis.md:176` "Write ... every stem inside the stem range"; `CONTRACTS.md:1011` to `:1013` reads the stem for a second defensible key.
Mechanism: Two round 2 fixes meet here. The stem rule creates stem edits after the check, and the stem double key read runs only before them.
Traced: `<teaching>/<run>/rephrased.md:8` to `:9` records T5's stem shortened by synthesis and no recheck. The edit is harmless here. Bugs LOW-3 covers a reworded distractor, not a stem.
Why other reviewers miss it: `rephrased.md` says what changed, and the contract says only keys and options go back.
What would catch it: add "or its stem" to `CONTRACTS.md:1119` and to recheck question 2.

### DEBT
DEBT-1. `plugins/djinn/CONTRACTS.md:1442` The release sheet is built only from items written on the source's fact set, and the release test excludes items on the source's fact set. So a secure run's sheet is empty or one item, by construction.
Claim: `CONTRACTS.md:1431` to `:1441` defines the sheet as the practice items that pass the release test.
Mechanism: Every draft is built from learn-known's map of the source question. Rule (b) drops any item carrying the source key's words, which on a module quiz are the module's own topic nouns. Rule (d) drops any sentence "from which a reader could infer the source's key", which most sentences on that map are.
Traced: `<course>/<run>/study-sheet-release.md:10`, 0 of 5 kept on rule (b) alone. `<teaching>/<run>/study-sheet-release.md`, 4 kept, 1 survives rule (d) by hand. Both runs therefore land at 0 or 1 once the added rule runs.
Why other reviewers miss it: security MEDIUM-2 is about the sheet leaking; this is about the sheet being useless once it stops leaking.
What would catch it: count kept items per secure run in the README and flag a sheet under two. The fix is a scope call for Donald: release items drawn from the distractors' homes (the neighbor fact sets), written as their own rung, or accept that a secure source yields no release sheet and say so in the plan.

### REC
none

## Blast radius

LOW-3. `audits/2026-09-29-1428-custom/fixes/fix-report.md:137` The round 2 fix report over-grades the round 3 dry runs for the third round in a row.
Claim: `:137` "5 meet the bar, 2 fall short"; the course table says 4 meet and 1 near; `:147` and `:180` count 0 restatements; the release sheet paragraph counts two leaking items.
Mechanism: The grader is the agent that wrote the prompts and ran the drafts, and it applied the same readings that let the gaps through: an id present, a ratio in band, a leak line as written.
Traced: this report's Item grades: 5 of 12 meet, not 9; 1 restatement, not 0; three leaking release items, not two. Round 1's fix report said 9 of 10 against a regrade of 6 of 10; round 2's regrade found the same direction.
Why other reviewers miss it: the fix report is outside the fence, and its row counts and claim counts all check out.
What would catch it: the next fix report's item table cites an independent grader's file by path, and says so where it disagrees.

## Convergence

| round | meet the bar (independent regrade) | fix report said | vocabulary | restatements | DPO bad student | release sheet |
|-------|-------------------------------------|-----------------|------------|--------------|-----------------|---------------|
| 1 | 6 of 19 | 9 of 10 on one run | 9 of 19 | 2 | 28 of 28 | none built |
| 2 | 12 of 17 | 9 of 10, 6 of 7 | 1 of 17 | 3 of 17 | 49 of 49 | course leaks |
| 3 | 5 of 12 (4 near) | 9 of 12 | 0 of 12 | 1 of 12 | 29 of 38 | teaching leaks, course empty |

Round 3's drop from round 2 is partly my stricter read: round 2 did not open sibling banks or look for planted line cues. Read round 2's way, round 3 is 6 or 7 of 12, about half.

Converging: what a script or a required field enforces. Vocabulary went 9, 1, 0 once the naming test and the rung rules landed. Length tells are gone on all 12, because the script fails them. Misconception labels hold.

Not converging: what the authoring agent reads in its own output. Planted line cues went from 1 of 2 to 2 of 2 after a rule was added. The release sheet went from leaking to leaking or empty. Restatement moved from homes to a claim id and slipped once. Misplaced DPO pairs regressed. The fix report's own grade overstates by 3 or 4 items every round. Each rule added in rounds 2 and 3 is a sentence the same agent that wrote the item then reads against the item.

The single instruction change that would move it most: **add a blind read to the recheck slot (`CONTRACTS.md:1119`), run by the fact checker after synthesis.** For each item, the checker gets the stem and shuffled options with no key, no notes and no sources, and writes the option a test-wise reader picks without the fact, the cue that picks it, and whether the stem alone makes two options right. Then it gets only `study-sheet-release.md` and the source question without its key, and answers the source. An item whose key the blind read picks by a named cue, or that it calls two keyed, fails like a failed recheck, and so does every release item the blind answer leans on. In round 3 that catches T6, T7, C3, C4 and the teaching release sheet, which is 4 of the 7 items below the bar plus the leak, and it covers round 2's tA-19. It is a second reader with a different instruction, not a sentence the author checks against itself. MEDIUM-1's wider bank read is second: it catches T1, T5 and C2.

## Checked and Clean

- `plugins/djinn/CONTRACTS.md:940`: the naming test holds on all 12 drafts; 0 vocabulary in effect, and each angle's drop is listed in its README.
- `plugins/djinn/CONTRACTS.md:1004`: the double key read caught T1 from two source lines, and T1 and T6 are out of both `grpo.jsonl` files.
- `plugins/djinn/commands/learn.md`: the script's length band and longest key rule hold on all 12 drafts; key positions spread across all four slots in all six row files; both `check.txt` read `RESULT: pass`.
- `plugins/djinn/agents/learn-synthesis.md:173`: every rationale sits inside its calibration range in both runs, and each over-long stem says why.
- `plugins/djinn/agents/learn-synthesis.md:371`: the study sheets place every option of every draft in its home, 48 of 48, so round 1 MEDIUM-4 stays fixed.
- `plugins/djinn/agents/learn-synthesis.md:293`: all 10 misconception pairs read as the bad student and carry the id of the item their prompt asks.
- `plugins/djinn/agents/learn-fact-checker.md`: 10 VERIFIED claims spot checked, 5 per run, all hold; the course run marks every claim resting on its unchecked source doc as the doc's own header asks.
- `plugins/djinn/CONTRACTS.md:1103`: no key was cut in either run, and neither `rephrased.md` lists a key or option change.

## Files read outside the fence

- `local/dry-runs/round-3/<teaching>/<run>/`, every file (dry run under regrade)
- `local/dry-runs/round-3/<course>/<run>/`, every file (dry run under regrade)
- `audits/2026-09-29-1428-custom/fixes/fix-report.md` (claims under regrade)
- `audits/2026-09-29-1428-custom/agents/devils-advocate.md` (round 2 grades)
- `audits/2026-09-29-1303-custom/agents/devils-advocate.md` (round 1 grades)
- the teaching repo's input secure bank (calibration set)
- a second secure bank, teaching repo (sibling overlap check)
- two teaching repo lecture files (spot check claims)
- the course repo calibration quiz (calibration set)
- the course repo's input module quiz (calibration and dedupe)
- three sibling module quizzes, course repo (sibling overlap check)
- the course repo's one source doc (spot check claims)
