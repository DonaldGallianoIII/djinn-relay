---
title: devils-advocate report, audits/2026-09-29-1303-custom
author: Claude Opus 5.5 (devils-advocate)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Redacted 2026-09-29, before this folder was committed: quoted exam item text, answer keys, topic words drawn from a secure item, and private scenario names from two private course repos are replaced by item ids and neutral descriptions in [brackets], because this repo is public. Every finding, id, line citation, grade and number is unchanged.

## Item grades

The bar is the orchestrator's GOAL block, and the calibration sets are the ones it names. One caveat on those sets: the course repo quiz is itself a reviewed model draft (`quiz.yaml:2` to `:4`, "module agent 01", status reviewed), so it is the bar Donald approved, not his dictation. The teaching repo bank's multiple choice items are recall items (tB-05 to tB-08, `<secure bank>:192` to `:245`).

### the teaching repo dry run, tB-06 (13 items)

| item | rung | key / mean distractor | verdict |
|------|------|-----------------------|---------|
| tB-06-a1 | distractor turned key | 0.93 | Vocabulary. The stem is [one waveform's] row of L04:474 read back, and the task is to name it. |
| tB-06-a2 | distractor turned key | 1.32 | Vocabulary with a light threshold check [one amplitude against a stated floor]. The stem restates the L04:480 row. |
| tB-06-a3 | distractor turned key | 0.96 | Vocabulary [which stages a waveform sits in]. The notes on two of its options are UNVERIFIED (U2, U3). |
| tB-06-a4 | reverse | 1.14 | Vocabulary: definition to name. It also leaks the source item's key. |
| tB-06-a5 | sibling | 0.88 | Vocabulary (single attribute recall). [One region option] has no true home in the fact set. |
| tB-06-a6 | sibling | 0.76 | Meets the bar: a scoring call on a rule, and every distractor is a plausible wrong rule. |
| tB-06-a7 | sibling | 1.14 | Vocabulary (what comes before what). |
| tB-06-h1 | recall | 0.84 | Vocabulary by design. The home note on [one frequency option] was quarantined, so that option ships with no home. |
| tB-06-h2 | discrimination | 0.96 | Meets the bar: each distractor is a real neighbor's morphology. |
| tB-06-h3 | application | 0.60 (letters) | Meets the bar. The ratio is between one and two character stage letters, so it gives no length tell. |
| tB-06-h4 | multi-step | 0.97 | Meets the bar: each distractor comes from one named wrong step. |
| tB-06-h5 | spot-the-mistake | 1.01 | Meets the bar. This is the best item in either run. |
| tB-06-h6 | edge-case | 1.50 (letters) | Meets the bar. The exception comes from L04:1000 to 1002. |

Result: 6 of 13 meet the bar and 7 of 13 are vocabulary. The 7 vocabulary items match the register of the teaching repo bank and fail the stated "never vocabulary" bar.

### the course repo dry run, e-01 (6 items)

| item | tier | key / mean distractor | verdict |
|------|------|-----------------------|---------|
| e-09 | easy | 1.01 | Recall of an empirical ordering, with no mechanism asked. Two traps give no home [they restate the wrong ordering instead of placing it]. |
| e-10 | easy | 1.01 | Restates source e-01: the same mechanism is keyed and the same three distractor homes are used. It should have been dropped. |
| m-09 | medium | 0.86 | Near the bar: a job scenario in a second setting. The key was cut and lost [a two word qualifier], the phrase that separates it from [one distractor]. It has no source. |
| m-10 | medium | 1.04 | Vocabulary (a number read off a table), labeled "application". This breaks `content/schema/quiz.md:10` to `:11`. [One time value option] has no true home. |
| h-09 | hard | 0.93 | Hard in label only. The fault is written in the stem's own words, it is the instruction's example fault, and it is the module's recurring fault. Two distractors have no pull. |
| h-10 | hard | 0.87 | Fails. After the key rephrase, [the option whose value is zero] also satisfies [the new key's upper limit]. |

Result: 0 of 6 fully meet the bar and 1 of 6 comes near it. The rationales run at a third of the calibration's length.

### Measurements (read only, python3 over the YAML and JSONL)

- **Option length.** Key over mean distractor length:
  - tB: 0.60 to 1.50, mean 1.00. The key is strictly longest on 1 of 13 (a7, 1.14).
  - the course repo drafts: 0.86 to 1.04, mean 0.95. The key is strictly longest on 0 of 6 and strictly shortest on 3 of 6.
  - the course repo calibration: 0.91 to 1.06, mean 0.98. Longest on 0 of 24, shortest on 4 of 24.
  - the teaching repo bank: 0.93 to 1.20, mean 1.02.
  - Across both runs no key is noticeably longer than its distractors. The course repo drafts moved the tell to the shortest option (MEDIUM-3).
- **Key position.** The key is the first option on 19 of 19 drafts. It is also first on 24 of 24 the course repo calibration items and 8 of 8 the teaching repo multiple choice items, so first position is the bank convention, and both builds shuffle. Wave 1 already covers the training rows (ux LOW-1, gap-hunter REC-1).
- **Rung share.**
  - tB: 7 from learn-asked (3 distractors turned into keys, 1 reverse, 3 siblings) and 6 from learn-harder (one per generic rung).
  - the course repo: 2 easy, 2 medium, 2 hard.
  - Recall or vocabulary items: 7 of 13 and 2 of 6, which is 9 of 19 combined.
- **Rationale depth (the course repo).**
  - Rationale length: median 21.5 words (16 to 26), against the calibration's 62 (45 to 113).
  - Names the pulling distractor: 0 of 6, against at least 8 of 24 by a keyword count ("tempting", "seductive", "pulling", "distractor", "wrong answer").
  - Trap notes: median 7 words, against 14.
  - the teaching repo drafts: median 19 words, against the bank's 23.5. That is the bank's register, so it is fine.
- **Stem to key word overlap.** The key shares the most stem words on 0 of 19 drafts (3 of 24 in the calibration). There is no lexical clang tell.
- **DPO.**
  - 28 rows in all. 21 are `shallow` pairs whose rejected answer is the bare key, which is the bad student as the goal defines him.
  - 7 are `misconception` pairs whose rejected answer is a wrong option plus a plausible belief.
  - Nonsense rejected answers: 0 of 28.
  - Chosen runs 5 to 186 times the length of rejected (gap-hunter REC-6 covers this).
- **VERIFIED rows.**
  - tB: sft 16 of 19, dpo 17 of 19, grpo 14 of 14.
  - the course repo: sft 1 of 9, dpo 1 of 9, grpo 1 of 7. In all three files it is the same item, m-10.
- **Fact check spot check.** All 7 VERIFIED claims checked hold:
  - K4 (L04:1004 to 1005)
  - H13 (L02:465)
  - H16 (L04:1002)
  - A15 (L04:128)
  - A10 (L04:1254)
  - H12 (AP02:146)
  - the course repo H1 (sources.md:97; the numbers sit on line 98, and the note says 97 to 99)
  - The checker did not inflate: the course repo reads V8 U19, and the README names the missing mechanism source. Its gap is scope, not honesty (LOW-5).

## Findings

### HIGH
HIGH-1 (SPEC PRODUCES THE DEFECT). `plugins/djinn/CONTRACTS.md:921` The pipeline writes vocabulary items by specification: 9 of 19 dry run items test recall, against a goal that says "never vocabulary".
Claim: `CONTRACTS.md:921` to `:924` and `learn-harder.md:33` to `:34` say "where the repo calls vocabulary recall a defect, no recall item is written". Otherwise the generic ladder opens on `recall` (`learn-harder.md:40`, "state the fact").
Mechanism: The instructions treat "never vocabulary" as a repo option, but the goal treats it as a bar. With no ban, every run writes a recall rung, a reverse question (`learn-asked.md:42` to `:45`, [the prompt's own example, which names a value and asks for the waveform]) and attribute siblings (`learn-asked.md:46` to `:49`, "location, amplitude, stage, timing"), and all of these are recall by construction. Where a ban exists, the agent labels its own rung, so the ban does not hold: learn-harder wrote "No recall item: quiz.md:11 calls a bare definition a defect" and then wrote a table lookup and labeled it application.
Traced: The tB drafts a1, a2, a3, a4, a5, a7 and h1 are recall (`docs/examples/learn-dry-run/2026-09-29-1237-tB-06/items-DRAFT.yaml:36` to `:168`). The course repo `angles/e-01/learn-harder.md:9` says no recall item and then writes `:41` to `:47` [a question asking for one time value, keyed to a table number]. That becomes `items-DRAFT.yaml:97` to `:121` (m-10, "rung: medium (application)"), against `the course repo/content/schema/quiz.md:10` to `:11` ("A vocabulary question is a defect at any tier"). e-09 (`items-DRAFT.yaml:19` to `:43`) asks for a measured order with no mechanism.
Why other reviewers miss it: Wave 1 read the prompts for wiring, security and contract drift. Nobody graded the items against the bar.
What would catch it: Put a mechanical recall test in learn-harder and learn-asked, and repeat it in synthesis: "an item whose key is a value or a name that one source line states, and whose stem names the thing asked about, is recall, whatever its rung label". Change the generic ladder's first rung from `recall` to "tell the fact from its neighbors on a case", or make "no recall item" the default that a repo turns off. Note for Donald: his the teaching repo bank is recall at this register, so he rules whether the teaching repo drafts are held to that bank or to this goal.

### MEDIUM
MEDIUM-1. `plugins/djinn/agents/learn-synthesis.md:293` The recommended VERIFIED filter keeps only the recall row on a mechanism repo.
Claim: `learn-synthesis.md:293` gives the load recipe `checked = ds.filter(lambda r: r["metadata"]["verification"] == "VERIFIED")`, and the run READMEs repeat it.
Mechanism: Research notes state numbers and findings, while mechanisms live in teaching content that discovery rightly leaves out of the sources (`CONTRACTS.md:889` to `:894`). So every mechanism claim is UNVERIFIED and every number claim is VERIFIED, and the VERIFIED filter selects exactly the items that fail the goal. The README names the missing source (`README.md:34` to `:48`) and still does not warn that the filtered set is the recall subset.
Traced: `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/verification/e-01.md:17` to `:20` (K2, K3, K4 mechanism UNVERIFIED, from DECK:137 to 138), then `README.md:30` to `:32` (V8 U19; "sft 1 VERIFIED and 8 UNVERIFIED"), then the one VERIFIED row in `sft.jsonl`, `dpo.jsonl` and `grpo.jsonl`, which is `m-10` in all three.
Why other reviewers miss it: Each piece is correct on its own: the checker is honest and the filter is sensible. The bias only shows when the VERIFIED rows are counted by rung.
What would catch it: Have the README print VERIFIED rows by rung. When the VERIFIED subset has no item above the first rung or tier, have it say so under the load recipe ("the VERIFIED subset is recall only; the mechanism rows are UNVERIFIED because <source gap>"). Add `rung` counts per status to the learn check output.

MEDIUM-2. `plugins/djinn/agents/learn-harder.md:108` The angles cap every rationale at "the rule and the fact", so a repo that allows model rationales gets placeholder rationales.
Claim: `learn-harder.md:108` to `:110` and `learn-asked.md:91` to `:92` say "The rationale is the rule and the fact, one to three sentences". `learn-synthesis.md:116` to `:117` says "When they allow model written rationales, write them in the register those rules give". `learn-synthesis.md:311` to `:312` says "you may not add content".
Mechanism: The angles write a 20 word, key only rationale. Synthesis is told to write in the repo's register and is also barred from adding the content that register needs. The course repo run named `~/Conventions/voice/EXPLAINING.md` as a writing rule (`context.md:37` of that run). Move 4 of that file ("Name the distractor that pulls, and say why it is seductive", `EXPLAINING.md:47` to `:48`) is met on 0 of 6 drafts. The teaching repo is not hit, because its answer key voice asks for exactly "rule and fact".
Traced: `angles/e-01/learn-harder.md:26`, `:48`, `:70` and `:92` (rationales of 1 or 2 sentences), carried unchanged to `items-DRAFT.yaml:34` to `:36`, `:61` to `:62`, `:89` to `:90`, `:112` to `:114`, `:142` to `:144` and `:171` to `:173`. Median 21.5 words against 62 in `quiz.yaml:27` to `:32` and its neighbors. Traps median 7 words against 14.
Why other reviewers miss it: Every draft passes the repo's field presence test. The shortfall only shows against the calibration file.
What would catch it: Change the angle rule to "the rationale follows the writing rules' register; where they allow model rationales, it names the distractor that pulls and why, and each trap names that option's true home". Add a synthesis check that fails a draft whose rationale names no distractor when the writing rules include EXPLAINING.md.

MEDIUM-3. `plugins/djinn/agents/learn-synthesis.md:145` Synthesis fixes a longest key by cutting the key, after the fact check. In the dry run this changed what 2 of 3 keys say and made one item double keyed.
Claim: `learn-synthesis.md:145` to `:148` lets synthesis "reword a key or an option ... to meet ... a key that must not be the longest option ... never to change what it says". The course repo's own house rules say the fix is to rewrite the distractors, never to pad them.
Mechanism: All three original keys were inside the schema's 0.8 to 1.25 ratio (1.07, 1.12 and 1.03 by measurement) but were the longest option, and synthesis cut the key rather than rewrite the distractors. m-09 lost [a two word qualifier], the phrase that separated it from [one distractor]. Its trap still names that qualifier, about a key that no longer says it. h-10 went from [a key stating a relative limit] to [a key stating an upper limit in seconds]. A zero value is below any upper limit, so [the option whose value is zero] now satisfies the key's own wording. The key is strictly shortest on 3 of 6 drafts against 4 of 24 in the calibration, which trades one length tell for the other. The rephrase happens in Step 9, after the fact checker in Step 8 (`commands/learn.md:274` to `:296`), and nothing re-reads a reworded item.
Traced: `angles/e-01/learn-asked.md:165` and `angles/e-01/learn-harder.md:65` and `:87` (the original keys), then `items-DRAFT.yaml:72`, `:81`, `:124`, `:134`, `:155` and `:163` (the rephrase comments and the new keys), then `README.md:70`.
Why other reviewers miss it: The README reports the rephrase as a rule met ("measured on the file"), and the ratio test passes.
What would catch it: Change the synthesis rule to "a key that is the longest option is fixed by making the distractors equally specific (the repo rule), never by cutting the key; a key may be reworded only for an absolute or a short form". Add a post rephrase pass: read every reworded key against every option and fail the item when any distractor satisfies the key's wording.

MEDIUM-4. `plugins/djinn/agents/learn-synthesis.md:250` The study sheet's answers explain the key only, so the student file drops the "these others belong to these groups" half of the blueprint.
Claim: `commands/learn.md:15` to `:17` says "Every option, the right one and each wrong one, placed in its true home". `learn-synthesis.md:250` to `:251` says "Answers: the practice keys at the end, each with its rationale and status".
Mechanism: The rationale is key only by `learn-harder.md:108`, so each practice answer says why the key is right and nothing about the other three options. The homes exist: the SFT rows carry them (`learn-synthesis.md:184` to `:186`). The student sheet uses them only for the source question's map.
Traced: `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/study-sheet.md:75` to `:87`. 10 of 13 answers place no other option, and answers 4, 5 and 7 are the bare key plus "VERIFIED", which is the bad student's answer printed as the model answer. In the course repo `study-sheet.md` Answers 1 to 6, 0 of 6 place a distractor.
Why other reviewers miss it: gap-hunter REC-9 and ux LOW-2 read the sheet for missing options and self check answers. Neither graded what an answer teaches.
What would catch it: Change `learn-synthesis.md:250` to "each practice answer: the key, why, and every other option's home in one clause each, from the item's pull line and learn-known's table". Add a check that each answer names as many homes as the item has distractors.

### LOW
LOW-1. `plugins/djinn/agents/learn-harder.md:51` The spot the mistake example list seeds the fault, and the course repo h-09 copied it into an item whose stem states the fault.
Claim: `learn-harder.md:50` to `:53` and `CONTRACTS.md:925` to `:927` give [a population mismatch between the data a threshold came from and the patients it is used on] as an example of a good fault.
Mechanism: The agent planted exactly that fault, which the module already tests twice (`quiz.yaml:234` m-01 and h-05). It also wrote it into the stem in plain terms [the stem states the population mismatch outright], so a student finds it by pattern, not by reasoning. Two distractors have no pull [one names a timing detail that is fine]. The calibration's h-01 hides its fault behind a timing inference.
Traced: `angles/e-01/learn-harder.md:63` to `:72`, then `items-DRAFT.yaml:125` to `:145`.
Why other reviewers miss it: The item has the shape of the calibration's hard tier.
What would catch it: A learn-harder rule: "the stem never states the fault in the words the key uses; an example fault from this file is used only when the bank does not already test it (grep the bank)".

LOW-2. `plugins/djinn/agents/learn-harder.md:94` Three shipped distractors have no true home.
Claim: `learn-harder.md:94` says "Every distractor a specific wrong answer". The goal says every option's true home is explained.
Mechanism: No angle rule refuses an invented distractor in a new item, and synthesis ships an option whose home note was quarantined.
Traced: the course repo `items-DRAFT.yaml:110` to `:111` (m-10 [a time value option], trap [says only that no group is that fast]); tB `items-DRAFT.yaml:108` (a5 [a region option], home [says only that it is not a region the fact set uses] in the sft row); tB `items-DRAFT.yaml:153` to `:164` (h1 [a frequency option], note quarantined, no home).
Why other reviewers miss it: The distractor count and the trap presence checks both pass.
What would catch it: A synthesis rule that an option with no verified or UNVERIFIED home is rewritten from learn-known's table or the item is marked `incomplete: home`.

LOW-3. `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/items-DRAFT.yaml:46` e-10 restates the source item.
Claim: `learn-synthesis.md:76` says "An item that only restates the source question is dropped".
Mechanism: e-10 moves the stem from a pair of ages to a gradient and keeps the key mechanism and all three distractor homes of e-01. It is the "what could have been asked" slot filled with the same question.
Traced: `input.md:15` to `:18`, then `angles/e-01/learn-harder.md:19` to `:25`, then `items-DRAFT.yaml:46` to `:67`.
Why other reviewers miss it: The stems do not match lexically.
What would catch it: A merge rule that compares the key's claim ids and the distractor homes with the source item's, not the stem text.

LOW-4. `plugins/djinn/agents/learn-asked.md:37` learn-asked skipped every distractor turned key on the course repo, so that angle produced one restatement and one sibling.
Claim: `learn-asked.md:37` to `:41` skips only "a distractor with no true home".
Mechanism: The agent read the vocabulary ban (`learn-asked.md:83` to `:84`) as a ban on keying any distractor. It skipped two distractors [each a real mechanism with its own home], both of which have mechanism questions. The file does not say that a distractor turned key is written at the mechanism level when recall is banned.
Traced: `angles/e-01/learn-asked.md:132` and `:182`, then `README.md:69`.
Why other reviewers miss it: The skip is documented, so it reads as a correct application of a rule.
What would catch it: One line in step 3: "where recall is a defect, the item asks the mechanism or the case in which this distractor is the right answer; skip only when the sources hold no such mechanism".

LOW-5. `plugins/djinn/agents/learn-fact-checker.md:46` The fact check certifies atomized claims, not the inference a key rests on, so h-10 reads "VERIFIED for the numbers" over an unchecked design premise.
Claim: `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/study-sheet.md` Answers item 6 says "VERIFIED for the numbers (H1 H5)".
Mechanism: The premise the key needs [a design inference linking a window length to the warning time] has no claim id and no U id. H5 is only [a comparison of two numbers] (`verification/e-01.md:30`). The item's UNVERIFIED mark comes from [one option's] note (H7), not from the premise. `learn-synthesis.md:67` to `:69` says to name such a fact `S<n>`, and the README lists none.
Traced: `angles/e-01/learn-harder.md:92` and `:110`, then `verification/e-01.md:30` to `:31` and `:41` to `:43`, then `README.md:50` to `:61`.
Why other reviewers miss it: Every claim that exists was checked correctly.
What would catch it: Have the fact checker add a `U<n>` for "the reason the key is right", per item, when no claim states it.

### DEBT
none

### REC
none

## Checked and Clean

- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/verification/tB-06.md`: 6 VERIFIED claims spot checked against L04, L02 and AP02 lines. All hold. The two CONTRADICTED calls (H4, U4) are correct on the source text.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/verification/e-01.md`: H1 against sources.md:97 to 99 holds. V8 U19 is honest, and deck.yaml is correctly not evidence.
- `dpo.jsonl` in both runs: 28 rejected answers, 0 nonsense. The shallow rows are the bare key and the misconception rows are a real wrong option with a plausible belief, which meets the "bad student" bar.
- `items-DRAFT.yaml` in both runs: no key noticeably longer than its distractors (the one longest key is a7 at 1.14), and no key sharing the most stem words.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/items-DRAFT.yaml`: h2, h3, h4, h5, h6 and a6 meet the bar. h5 is a clean spot the mistake at the calibration level.
- `plugins/djinn/agents/learn-known.md`: the "every option in its true home" method (`:48` to `:63`) produced full homes in the source question's map and the SFT rows. The gap is downstream (MEDIUM-4).
- `plugins/djinn/agents/learn-synthesis.md:190` to `:195`: the shallow pair definition produces the goal's bad student and not nonsense.

## Files read outside the fence

- `<course repo>/<module quiz>` (calibration set, named by orchestrator)
- `<teaching repo>/content/secure/<secure bank>` (calibration set, source item bank)
- `<course repo>/content/schema/quiz.md` (repo tiers and vocabulary rule)
- `<course repo>/CLAUDE.md` (key never longest rule)
- `<course repo>/<module sources file>` (spot check a citation)
- `<teaching repo>/<lecture>` (spot check citations)
- `<teaching repo>/<lecture>` (spot check a citation)
- `<teaching repo>/<lecture>` (spot check a citation)
- `<teaching repo>/docs/ITEM-WRITING.md` (grep for a vocabulary rule)
- `~/Conventions/voice/ITEM-WRITING.md` (the run's named writing rule)
- `~/Conventions/voice/EXPLAINING.md` (the run's named writing rule)
