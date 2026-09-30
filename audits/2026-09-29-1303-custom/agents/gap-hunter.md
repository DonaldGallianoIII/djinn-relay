---
title: gap-hunter report, audits/2026-09-29-1303-custom
author: Claude Opus 5.5 (gap-hunter)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Redacted 2026-09-29, before this folder was committed: quoted exam item text, answer keys, topic words drawn from a secure item, and private scenario names from two private course repos are replaced by item ids and neutral descriptions in [brackets], because this repo is public. Every finding, id, line citation and number is unchanged.

Anchor: Donald's words in the dispatch. A bad student learns "N1 = slow eye movements" and moves on; the pipeline exists to teach that every other option belongs to its own group and why, to view a question as what should I have known, what could have been asked, how could it get harder, and how do I prepare, and to turn that into SFT, DPO and GRPO rows and class exams. The known-bugs index has no entry on training data, quizzes, rewards or leaks, so the two dry run folders in the fence are the retrospective.

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

REC-1 (high). `plugins/djinn/agents/learn-synthesis.md:176` Key position balance in every training prompt.
What: shuffle the options in each row's prompt with a permutation seeded from the item id, record where the key landed, and have the check fail a file where one position holds most keys.
Why: every training row the dry runs made puts the key first. That is 14 of 14 GRPO rows in `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/grpo.jsonl` and 7 of 7 in the course repo run, the same in the SFT and DPO prompts, and `a: 0` on all 13 items of that run's `items-DRAFT.yaml`. The angle agents write the key first by habit, and line 176 says a prompt lists options "in authored order". The exams are safe: the teaching repo builds forms with `--shuffle choices` and the course repo shuffles by seed. The training rows are not. A model trained on these rows learns "pick the first line", which is the anchor's bad student in its purest form: a shortcut that clears the key and learns none of the map. GRPO rewards that shortcut at 0.5 per row.
How: in learn-synthesis's `sft.jsonl, dpo.jsonl, grpo.jsonl` section, replace "in authored order" with a seeded order, the seed taken from `metadata.item` so a rerun gives the same order. Add `key_position` (a string, "1" to "n") to the metadata keys in CONTRACTS.md section 13 and to `META` in `commands/learn.md` Step 9. In the check script, print a per file histogram of `key_position`, and fail when one position holds more than `KEY_POSITION_MAX_SHARE` (a named constant, 0.5 until Donald sets it) of a file with at least 8 rows. Leave `items-DRAFT` in authored order: the banks shuffle at build.

REC-2 (high). `plugins/djinn/agents/learn-synthesis.md:213` GRPO rubric terms that the prompt already says.
What: refuse a `mentions` term that appears in the row's own stem or option text, and have the check find one mechanically.
Why: the `homes` check is meant to pay only for an answer that places the other options in their homes. A term the prompt already carries pays for echoing the question. In the tB-06 run, row 14 (`tB-06-h6`) has homes terms [two words], both in the stem, so a reply that states the key, repeats those two stem words and ends on the Answer line scores the full 1.0 while placing no option at all. Rows 7 and 13 of that file, and rows 3, 6 and 7 of the course repo file ([one term] in the stem, [two terms] in an option), leak one term each. That is 6 of 21 GRPO rows where parroting the prompt earns reward, which is the gap between knowing the words and knowing the map. learn-synthesis.md:222 already guards `forbids` terms against option text; nothing guards `mentions`.
How: add to learn-synthesis line 213's rule "never a term the stem or an option already says; read each against the user message with the reward's own found rule". In the check script's `rubric(row)` in `commands/learn.md` Step 9, lowercase the user message and flag every `mentions` term found there with the same no-letter-or-digit boundary `_found` uses in CONTRACTS.md section 13, printing `rubric: mentions term in prompt: <check id>`.

REC-3 (high). `plugins/djinn/commands/learn.md:485` A record of what Donald kept, edited and dropped, read by the next run.
What: a per item verdict file that the owner fills after reading a run, and that the next run's angle block and synthesis read.
Why: Step 11 tells the owner to "move an item there by hand" and records nothing about it. The ledger carries counts only. So the pipeline never learns that, say, a course repo item was dropped because it tested a bare fact, and the next run makes the same kind. The review relay has exactly this loop (`plugins/djinn/relay.md:132`, the consolidator feeding the known-bugs index); learn has none. An edited item is also the one piece of data here written in Donald's own voice: the edit against the draft is a DPO pair with a human chosen side, which no model drafted.
How: add `<out_dir>/VERDICTS.md` to the section 13 run folder layout, one line per item: `| date | run | item id | kept, edited or dropped | reason | landed at path:line or none |`. Step 11 prints the item ids as an empty table for the owner to fill. Step 7's angle block gains "Past verdicts on this bank: <dropped and edited lines whose item came from the same input file>", read as writing rules and never as evidence (section 13's never-evidence rule excludes `learn/`, so the carve out is written there). learn-synthesis emits `owner.dpo.jsonl` from `edited` lines: chosen the landed text, rejected the draft, `metadata.pair` `owner-edit`.

REC-4 (high). `plugins/djinn/CONTRACTS.md:993` A split and a leak group in the row metadata.
What: a `group` key naming the fact set a row came from and a `split` key, `train` or `eval`, set from a held out list in config.
Why: one question fans out into 52 rows in the tB-06 run (19 SFT, 19 DPO, 14 GRPO), all from one fact set, and the README's loader reads every file as `split="train"`. Any row level split an owner does by hand puts [that item's] facts on both sides, and the eval score then measures memory of the train rows. Grouping by `source_id` alone is not enough: `tB-06-a1` "leaks with" `tB-05`, another bank item, so a later run on tB-05 must land on the same side. The leak data already exists (learn-synthesis.md:79); it never reaches the rows.
How: add `learn.holdout: []` (source ids) to the section 13 config block and `templates/config.yaml`. learn-synthesis sets `metadata.group` to the sorted union of the source id and every bank id in the item's `leaks with` line, and `metadata.split` to `eval` when any id in `group` is held out. Add both keys to section 13's metadata list and to `META` in the check script. Step 5's plan prints `holdout: <n> of these questions are eval` so a run on a held out item is seen before it spends anything.

REC-5 (medium). `plugins/djinn/agents/learn-synthesis.md:279` Per angle quality numbers, and the reward split into its parts.
What: a table in the run README of each angle's claims by status and its items written, merged, dropped, quarantined and shipped as rows; and a `learn_reward_parts` beside `learn_reward` that returns the answer, homes and forbids scores apart.
Why: the only numbers are run totals. The course repo run reads `claims=V8 U19`, and which angle drove the 19 is left for a reader to count from the UNVERIFIED list by letter. With verdicts (REC-3) the same table gives an accept rate per angle, which answers whether learn-harder earns its Opus run. The Kaggle project scores "why the other options are wrong" on its own; here that slice exists only inside the summed reward, and the dry run measured the parts by hand (`docs/examples/learn-dry-run/2026-09-29-1237-tB-06/README.md:85`).
How: in learn-synthesis's README section, add `Angles:` after the Counts line, one row per angle letter K, A, H, P (and U, S), from the verification tables and Step 2's merge list; the command does not parse it. In CONTRACTS.md section 13, next to `learn_reward`, add `learn_reward_parts` with the same signature that returns one dict per completion, `{"answer": ..., "homes": ..., "forbids": ...}`, so an eval can log the homes score as its own metric.

REC-6 (medium). `plugins/djinn/agents/learn-synthesis.md:191` A DPO pair that length cannot separate.
What: a third pair kind, `misplaced`, where `rejected` is the full length discriminating answer with the right key and one distractor put in a wrong but real home.
Why: in the tB-06 run all 19 `rejected` answers are under 120 characters and 13 `chosen` answers are over 300. Both pair kinds teach "longer and more options named wins", which a model can learn without placing anything right. The anchor's failure is a student who names groups wrongly as much as one who names none. A pair where both sides are equally long and differ only in one home is the one pair that measures the "these others belong to these groups" skill on its own.
How: in learn-synthesis's dpo.jsonl rules, add `pair: misplaced`, one per source question and per item with options. Build `rejected` from learn-known's option table by swapping one distractor's home for another row's home in the same table, never an invented home. Add `misplaced` to the allowed `pair` values in section 13 and in the check script's `metadata()`.

REC-7 (medium). `plugins/djinn/agents/learn-synthesis.md:118` Dedupe and id collisions across runs, and a bank check for learn-harder.
What: synthesis also reads earlier run folders' `items-DRAFT.*` for ids and stems, and learn-harder lists what the bank already asks, as learn-asked does.
Why: synthesis Greps "the item shape banks and the input file" for ids, and section 13 puts every learn run folder off limits. A second run on tB-06 writes `tB-06-a1` again; a second course repo run takes "numbers past the highest in use" and writes `e-09` again, so two drafts moved into content by hand collide. Rows from two runs on one question are near copies that double that question's weight in a concatenated set. learn-asked checks the bank (learn-asked.md:29); learn-harder's Method (learn-harder.md:66) never does, and its recall rung `tB-06-h1` is a near restatement of the source that survived.
How: in learn-synthesis's Ids bullet, add `<out_dir>/*/items-DRAFT.*` to the Grep for ids (ids only, never read as evidence) and take numbers past those too; list any stem that matches an earlier run's stem under Merged and dropped with the run name. Add a step 0 to learn-harder's Method that copies learn-asked's step 1, and an `## Already in the bank` section to its output format.

REC-8 (medium). `plugins/djinn/agents/learn-synthesis.md:156` A proposed exam form from the pool.
What: a list in the README of one non-leaking set that covers every tier, for building a class exam from the draft.
Why: "for when I'm making student exams in class". The pool is 13 items whose `leaks with` lines form a graph (a6 leaks with a3, h3, h5; h1 with a4), and synthesis says "a pool, not a quiz" and stops. Picking a leak free subset by hand across 13 comment lines is where a leak slips onto a form, the worse of ITEM-WRITING's two leak kinds.
How: in learn-synthesis's items section, after "A draft is a pool", add: list under `## A form from this pool` a largest set of items with no `leaks with` edge between any two of them and at least one per tier or rung, each by id, and the items left out with the leak that excluded them.

REC-9 (medium). `plugins/djinn/agents/learn-synthesis.md:240` A study sheet a student can finish alone.
What: answers for the study plan's self checks, the options printed for every practice item, and for a secure source a released variant that leaves out the source item and every item leaking with it.
Why: the self checks ([a which-three question], study-sheet.md:68) have no answer anywhere in the run, so a student cannot tell whether they passed step 1. Practice items 6, 9, 11 and 12 print no options ("see items-DRAFT.yaml", study-sheet.md:54), which points a student at a draft YAML. For a secure item the sheet says it is not for students until released, and no version exists that could be released.
How: in learn-synthesis's study-sheet list, item 3 prints every option of every practice item; item 4 adds each self check's answer with its claim ids to the Answers section; and for a secure source write `study-sheet-release.md` without the source question's map row and without any item whose `leaks with` names the source id.

REC-10 (medium). `plugins/djinn/commands/learn.md:148` Topic and plan input beyond one seed question.
What: a run level plan across all the questions of a run, and a topic run that seeds more than one question.
Why: "drafts plans on stuff". A topic run either picks existing bank items or has learn-known draft exactly one seed, so `--topic "[a topic]"` with no bank match yields one question's worth of material. A quiz file of N questions gets N separate plans (learn-synthesis.md:242, "per question"), and a misconception shared by four questions is taught four times with no order across them.
How: in Step 4, let `seed` take a count (`seed 3`, capped by a named constant) and have learn-known write `seed-1` to `seed-n`, each on a different fact the sources state. In learn-synthesis, when the run holds more than one question, write `plan.md`: misconceptions merged across questions, ordered by how many items each would fix, then the plan steps in that order with their self checks.

REC-11 (low). `plugins/djinn/CONTRACTS.md:993` Add `omitted` to metadata: the UNVERIFIED sentence ids a row left out to ship VERIFIED (learn-synthesis.md:61).
REC-12 (low). `plugins/djinn/agents/learn-synthesis.md:170` Add `system` to metadata as a short hash of the system message, since each run writes its own and concatenated runs mix them.
REC-13 (low). `plugins/djinn/CONTRACTS.md:993` Add `model` to metadata, copied from context.md, so rows drafted by different models can be filtered.
REC-14 (low). `plugins/djinn/commands/learn.md:368` Print each GRPO row's key length over its mean distractor length in the check output; the dry runs measured it by hand.
REC-15 (low). `plugins/djinn/agents/learn-synthesis.md:259` Give quarantine.md a ruling column the owner fills, so a settled contradiction feeds REC-3's verdicts.
REC-16 (low). `plugins/djinn/commands/learn.md:477` Add `holdout=<n>` and `key_first=<n of grpo>` to the learn ledger counts.

## Blast radius
none

## Already present
- `plugins/djinn/agents/learn-asked.md:29` Dedupe of new items against the existing bank, for the asked angle only (REC-7 covers the harder angle and earlier runs).
- `plugins/djinn/agents/learn-synthesis.md:79` Leak marking between items, carried into the draft; REC-4 and REC-8 only route it further.
- `plugins/djinn/agents/learn-synthesis.md:222` The forbids term guard against option text; REC-2 is the mirror rule for mentions.
- `plugins/djinn/agents/learn-synthesis.md:145` Key length and absolute qualifier balance, through rephrasing when the shape states the rule.
- `plugins/djinn/commands/learn.md:148` Topic mode as an input; REC-10 says why one seed is not enough.
- `plugins/djinn/commands/learn.md:465` Tokens per agent in usage.md; REC-5 adds output quality per angle, not cost.

## The One Question
For each row of both `grpo.jsonl` files, score the completion `<the user message>\nAnswer: <answer>` with `learn_reward` from CONTRACTS.md section 13 and count the rows above 0.5: every such row pays a policy for echoing the question.

## Checked and Clean
- `plugins/djinn/commands/learn.md`: looked for a key shuffle, an owner verdict record, a split, and a run level plan; none present, filed as REC-1, 3, 4, 10.
- `plugins/djinn/CONTRACTS.md`: section 13 metadata keys, reward and pair kinds read for split, group, parts and hard negatives; filed as REC-4, 5, 6.
- `plugins/djinn/agents/learn-synthesis.md`: prompt option order, mentions rule, id Grep scope, pool wording and study sheet list read; filed as REC-1, 2, 7, 8, 9.
- `plugins/djinn/agents/learn-known.md`: option table and bad student's answer present; they supply REC-6's material.
- `plugins/djinn/agents/learn-asked.md`: bank listing and leak marking present.
- `plugins/djinn/agents/learn-harder.md`: ladder present; no bank listing, filed as REC-7.
- `plugins/djinn/agents/learn-prepare.md`: misconceptions and self checks present; self check answers missing downstream, filed as REC-9.
- `plugins/djinn/agents/learn-fact-checker.md`: claim statuses per angle letter present; REC-5 only tallies them.
- `plugins/djinn/templates/config.yaml`: learn block present; no holdout key, filed as REC-4.
- `plugins/djinn/README.md`, `plugins/djinn/relay.md`: learn described; relay.md:132 is the loop learn lacks, cited in REC-3.
- `plugins/djinn/.claude-plugin/plugin.json`, `.djinn/config.yaml`: nothing learn gap shaped in either.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/` and `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/` (README, items-DRAFT, grpo, dpo, study sheet, both LEDGER.md): the evidence for REC-1, 2, 6, 7, 9; the remaining files (angles, verification, context, input, sft, quarantine, check, usage) were not opened line by line past what the READMEs report.

## Files read outside the fence
- `<teaching repo>/content/secure/<secure bank>` (bank option order setting)
- `<teaching repo>/docs/ITEM-WRITING.md` (form shuffle rule)
- `<course repo>/content/schema/quiz.md` (form shuffle seed)
