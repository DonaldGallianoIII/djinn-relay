---
title: ux-reviewer report, audits/2026-09-29-1303-custom
author: Claude Opus 5.5 (ux-reviewer)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Redacted 2026-09-29, before this folder was committed: quoted exam item text, answer keys, topic words drawn from a secure item, and private scenario names from two private course repos are replaced by item ids and neutral descriptions in [brackets], because this repo is public. Every finding, id, line citation and number is unchanged.

## Findings

### HIGH
none

### MEDIUM
none

### LOW
LOW-1. `plugins/djinn/agents/learn-synthesis.md:176` The key is the first option in every practice item and every training prompt, so both the study sheet and the GRPO data give the answer away by position.
Mechanism: the angle agents write the key first (all 13 the teaching repo drafts carry `a: 0`, all 6 the course repo drafts put `key: true` on the first option). Synthesis then copies "authored order" into the prompts (learn-synthesis.md:176 to 178) and into the study sheet's Practice section. Nothing reorders them. A student working the sheet on paper sees the answer first 9 times out of 9. A GRPO policy that copies the first bullet scores `ANSWER_WEIGHT`, 0.5, on every row, which is the exact shortcut the rubric exists to push down. Donald has hit this before: `the teaching repo/tools/build_exam.py:870 to 873` says a probe "printed the correct answer at A on 49 of 49 items", and his own study page defaults to Shuffled (`tools/study_html.py:303 to 304`). The banks are fine, because his build shuffles choices. The learn outputs never pass through that build.
Traced: `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/study-sheet.md:46 to 64`: items 1 to 5, 7, 8, 10 and 13 each list the key first. `grpo.jsonl` rows 1 to 14 in the same folder: 14 of 14 prompts put the `answer` value on the first `- ` line. `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/grpo.jsonl` rows 1 to 7: 7 of 7.
Proposed: add one synthesis rule: "in a prompt or on the study sheet, row i puts the key at position i mod option count". A model can follow that rule every time, and a seed is not needed. Then add one check to `learn-check.py` so the rule cannot drift:
```python
opts = [l[2:] for l in row["prompt"][-1]["content"].splitlines() if l.startswith("- ")]
first_key += opts[:1] == [row["answer"]]; grpo_rows += 1
# after the file: fail when grpo_rows > 1 and first_key == grpo_rows
```
Effort to adopt (estimate): an hour. Downside: none. The item files keep the bank's authored order.

LOW-2. `plugins/djinn/agents/learn-synthesis.md:248` The rule "Practice: the new items, grouped by rung, questions only" can be read two ways, and both examples leave a student with items they cannot answer.
Mechanism: the teaching repo sheet read the rule as "no key" and printed options for most items. It still dropped them for four single choice items. The course repo sheet read it as "stem only" and printed no options at all. A multiple choice item with no options cannot be worked, and the Answers section then talks about options the student never saw.
Traced: tB `study-sheet.md:54` "(four reasoned options; see items-DRAFT.yaml)", a file a student never gets. `:60`, `:62` and `:63` give only the stems for h2, h4 and h5, while `items-DRAFT.yaml:171 to 231` gives each of them `t: single` with four options. The course repo `study-sheet.md:32 to 37`: six practice stems, no options. `:53` answers "the notes on the other options are UNVERIFIED" about options that never appeared.
Proposed: reword the line as "Practice: each new item's stem and every option (in the LOW-1 order), no key, grouped by rung". Effort: minutes.

LOW-3. `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/README.md:44` The example outputs cite things their reader does not have, against the prompts that produced them.
Mechanism: the fact checker's `L04` shorthand is defined only in `verification/tB-06.md:11`. It leaks into the run README (`README.md:44` "L04:425 to 427") and into the student sheet (`study-sheet.md:80` "L04:830 to 833"). learn-fact-checker.md:97 to 98 requires the path "exactly as Read showed it", so an editor cannot open `L04:425`. The course repo README gives no loading snippet: it says "As the teaching repo run's README" (`README.md:83`), which learn-synthesis.md:288 to 301 does not allow, and that README sits in another repo's `learn/`. The course repo question id is `e-01` (`context.md:14`), while learn.md:87 says the id is "the item's own `id`". Its claims therefore read `e-01.K2` (`grpo.jsonl` row 1 metadata) and collide with module 02's e-01 once runs are combined. These folders are the reference Donald will hold real runs against.
Traced: as cited. Every item above is a departure from the prompt in the example, not in the prompt itself.

LOW-4. `plugins/djinn/README.md:273` The plugin README gives learn-harder a "five rung difficulty ladder". learn-harder.md:37 to 38 and CONTRACTS.md:924 to 925 both say six. The README's `learn/` tree (`README.md:230 to 240`) also leaves out `check.txt` and `usage.md`, which CONTRACTS.md:1139 to 1140 list in every run folder.
Mechanism: a reader counting rungs in a real run finds six, and looks for a check result the tree never mentioned.
Traced: README.md:273, learn-harder.md:37, CONTRACTS.md:924, README.md:230 to 240 against CONTRACTS.md:1123 to 1141.

### DEBT
DEBT-1. `plugins/djinn/commands/learn.md:323` No training row says whether it came from a secure source, and the exact-key check turns adding that field later into a schema split.
Mechanism: `META` (learn.md:323 to 324) is a closed set with no `secure` key, and `metadata()` refuses any other set (learn.md:350 to 351). The secure mark lives only in README prose and the ledger's `secure=yes`. The teaching repo rows happen to carry `content/secure/` in `source_ref`. The course repo rows do not: its secure path is the whole repo, so its `source_ref` reads `content/tracks/...` (<course> `grpo.jsonl` row 1). Donald's likely training step is to glob `learn/*/sft.jsonl` across runs and then push a dataset. At that point no row filter can drop the secure rows. Adding the key after runs pile up means old runs fail the new check, and old and new files load with different schemas.
Traced: learn.md:323 to 324 and :350 to 351. CONTRACTS.md:993 to 998 lists the metadata keys. <course> `grpo.jsonl:1`, `"source_ref": "<module quiz path>"`.
Proposed: add `secure` (`"yes"` or `"no"`) to `META`, the section 13 key list and the synthesis metadata paragraph now, while only two example runs exist. The README filter then reads `ds.filter(lambda r: r["metadata"]["secure"] == "no")` before any push. Effort: an hour. Downside: one more contract key. security-reviewer should see this too.

### REC
REC-1. `plugins/djinn/commands/learn.md:122` Discovery runs fresh on every run and leaves nothing Donald can paste.
Friction: neither the teaching repo nor the course repo has a `learn` block (both `context.md` provenance lines), so every run re-derives sources, shape, tiers and scenarios by LLM reading. Two runs on one repo can check claims against different source lists. `context.md` records the provenance as prose (tB `context.md:21 to 30`), not as YAML.
Proposed: after `go`, write the confirmed values to `<RUN_DIR>/learn-config.yaml` as a ready `learn:` block. This stays inside RUN_DIR, which learn.md:500 allows. Step 11 then adds one line: "Paste learn-config.yaml into .djinn/config.yaml to skip discovery next time."
Effort to adopt (estimate): an hour. Downside: none.

REC-2. `plugins/djinn/agents/learn-synthesis.md:21` Donald is asked to "rule on" each UNVERIFIED claim and each quarantined note, and nothing gives him a place to write the ruling or a way to rebuild from it.
Friction: tB `README.md:37 to 39` says "For Donald to rule on", and Step 11 lists claims "so the owner can rule on each" (learn.md:491). The synthesis inputs (learn-synthesis.md:21 to 30) take no rulings. Accepting U1 today means hand-editing `verification`, `unverified_claims`, study sheet lines and item comments across three JSONL files.
Proposed: a `rulings.md` table in the run folder (`claim | accept or reject | citation or reason`), plus `/djinn:learn --resynth <RUN_DIR>`. That reruns synthesis alone with an `OWNER` status beside VERIFIED, so provenance survives. Effort: hours. Downside: a fourth status in the contract.

REC-3. `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/README.md:76` The loading snippet covers one file from one run. Combining runs, which is the common training step, can fail, and a random split leaks.
Friction: tB `grpo.jsonl` has `unverified_claims: []` on all 14 rows. huggingface/datasets issue #7092 (open, read 2026-09-29, https://github.com/huggingface/datasets/issues/7092) says `load_dataset("json", ...)` over several JSONL files fails when one file has a column with no values in it. The README also says items "answer each other" (`README.md:93`). A row-level `train_test_split` therefore puts siblings of one fact set on both sides of the eval.
Proposed: put this in every run README:
```python
ds = load_dataset("json", data_files="learn/*/grpo.jsonl", split="train", features=LEARN_FEATURES)
held = set(sorted({r["source_id"] for r in ds["metadata"]})[::5])
train, test = ds.filter(lambda r: r["metadata"]["source_id"] not in held), ds.filter(lambda r: r["metadata"]["source_id"] in held)
```
`LEARN_FEATURES` would be written once, in section 13. UNVERIFIED: that passing `features=` avoids #7092 (the issue offers only `Dataset.from_list`). Effort: an hour. Downside: a features block to keep in step with `META`. bugs-reviewer: the tB GRPO file on its own is the empty-column case.

REC-4. `plugins/djinn/CONTRACTS.md:1034` The reference reward exists only as a code block inside the plugin's CONTRACTS.md, and the run README points there (tB `README.md:85`).
Friction: to train, Donald digs the plugin's install folder for a markdown file and copies 30 lines out of it. A custom reward is the right call: the TRL rewards page lists only math-verify accuracy, format, length and repetition rewards, and nothing that matches option text (https://huggingface.co/docs/trl/rewards, v1.14.1, read 2026-09-29).
Proposed: the command writes the section 13 block verbatim to `<RUN_DIR>/learn_reward.py`, the way it already writes the check script. The file carries a comment header, and the README says `from learn_reward import learn_reward`. Effort: minutes. Downside: one more file per run.

REC-5. `plugins/djinn/CONTRACTS.md:991` The GRPO instruction `Answer: <your answer>` never says the answer must be the option's exact text. Normalizing only folds case, spacing and a trailing period (CONTRACTS.md:1022 to 1025).
Friction: tB `grpo.jsonl` row 7's key is [a stage name followed by a one clause reason]. A correct policy that ends `Answer: [the stage name alone]` scores 0.0, so correct answers get no reward.
Proposed: "End your reply with one line: Answer: <the option, copied exactly>". The checker matches on the prefix only (`LAST_LINE`, learn.md:330 and :418), so no check changes. Effort: minutes, a section 13 edit. Downside: existing example rows keep the old wording.

REC-6. `plugins/djinn/commands/learn.md:351` The check's messages make its one allowed rewrite harder than it needs to be.
Friction: the rewrite is allowed once (learn.md:459 to 463). Three things stack against it. (a) The metadata message prints all ten expected keys and not the one that is missing (tB `check.txt:15`: the missing key was `pair`). (b) `if not errs:` (learn.md:416) hides a bad Answer line until the other errors are fixed, so the rewrite pass finds a new failure and ends `PARTIAL`. (c) A missing file raises a Python traceback at `open()` (learn.md:430), and the files after it go unchecked.
Proposed:
```python
return ["metadata: missing " + ", ".join(sorted(want - set(value))) + "; extra " + ", ".join(sorted(set(value) - want))]
if not os.path.exists(path): print(path + ": missing"); failed = True; continue
# run the Answer line check whenever messages(row["prompt"], ...) returned []
```
Effort: minutes. Downside: none.

REC-7. `plugins/djinn/commands/learn.md:81` Every prompt question gets the id `q1`, so every prompt run gets the slug `q1` and `source_id: "q1"`.
Friction: `learn/` fills with `...-1430-q1` and `...-0910-q1`, and the ledger says only `input=prompt`. Once runs are combined, unrelated questions share one `source_id`, which breaks the grouped split in REC-3.
Proposed: `--id <name>` for prompt input. Without it, use `prompt-<timestamp>`. Effort: minutes.

REC-8. `plugins/djinn/commands/learn.md:55` The target repo is the current working directory's repo, not the input file's.
Friction: learn.md:84 allows an absolute path. Run `/djinn:learn <course repo>/.../quiz.yaml <id>` from inside the teaching repo, and it checks the course repo's claims against the teaching repo's lectures (everything comes back UNVERIFIED) and writes into the teaching repo's `learn/`.
Proposed: resolve the root from the input file's folder through the existing list-file pattern (`xargs -0 -r git -C`), and show both roots in the plan when they differ. Effort: an hour. security-reviewer: in that same case the secure check (learn.md:138 to 146) reads the current repo's `secure_paths`, so a course repo item (secure by its own CLAUDE.md, no `secure` folder) runs as not secure.

REC-9. `plugins/djinn/commands/learn.md:174` A whole-file run is a documented form (`README.md:181`) and runs long with no progress, no estimate and no resume.
Friction: the 17-item secure bank comes to 68 angle runs, 17 fact checkers and one synthesis, 86 Opus runs, run one question at a time (learn.md:234). The plan prints the run count and no token figure. Nothing prints between waves. A crash at question 12 leaves a folder that a rerun never reuses, because learn.md:197 never overwrites.
Proposed: print one line per question (`3 of 17: angles done, fact check running`). Show a token estimate in the plan from earlier ledger `tokens=` values per question when any exist. Add `--resume <RUN_DIR>`, which skips questions whose four angle files and verification file already exist. Effort: hours. perf-reviewer and cost-complexity-reviewer: one synthesis agent writes every output for all 17 questions (learn.md:296).

REC-10. `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/study-sheet.md:80` The student sheet carries notes meant only for Donald.
Friction: "Note for Donald" (`:80`), "see quarantine.md" (`:82`) and claim ids that "point to verification/tB-06.md" (`:12`) all have to be cut by hand before release. The Map repeats [one option's] row with an empty "why it is wrong here" cell (`:24`).
Proposed: end the sheet with a section headed `For Donald, remove before release`, and keep claim ids there, one line per answer. Put a band fact like U1 in the "where it belongs" cell of the one row it belongs to. Effort: minutes in learn-synthesis.md:242 to 257.

REC-11. `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/items-DRAFT.yaml:37` `sec:` holds learn's own grouping ("1. Distractors turned into keys", "3. The ladder"). The source item's section was "2. Multiple choice" (`input.md:12`).
Friction: an item moved into the real bank by hand carries a meaningless section, and unlike `b` and `s` nothing marks it for editing.
Proposed: copy `sec` from the source item, marked `# copied from tB-06` like `b` and `s`, and keep the angle grouping in the per-item comment. Effort: minutes.

REC-12. `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/README.md:89` To see the draft the way a student will, Donald has to leave the tool.
Friction: the teaching repo already renders a bank as a shuffled study page. `tools/build_exam.py:858 to 860` takes `--bank-file PATH` "for generated banks", and it also takes `--shuffle choices` and `--study`. The draft passed the bank's six YAML checks (`README.md:91`).
Proposed: an optional `learn.preview_cmd` with `{items}` that the run README prints, never runs, for example `python3 tools/build_exam.py --bank-file {items} --shuffle choices --study --format html`. UNVERIFIED: that build_exam.py accepts this draft file as is. Effort: an hour. Downside: one more optional key.

REC-13. `plugins/djinn/README.md:178` Two of the README's invocation lines do not do what they appear to do if typed as shown.
Friction: `:178` puts the options and `Answer: R` on one line, while learn.md:78 to 80 parses "lines starting `A.`" and "a line starting `Answer:`". Read strictly, the command asks for the key. `:181` puts an annotation after the path with no comment marker, and a copy of it passes "every item, after a plan you approve" as item ids.
Proposed: show the prompt form over several lines, and write `:181` as `/djinn:learn <quiz file>   # every item, after a plan you approve`. Effort: minutes.

REC-14. security-reviewer: `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/README.md:11` and `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/README.md:11` each say that pushing the commit publishes secure-derived material, and `study-sheet.md:16` of the tB run states tB-06's key.

REC-15. devils-advocate: `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/items-DRAFT.yaml:66` gives item e-10 a `source:` DOI [the paper behind the private item], while its key rests on H2, which the run README (`README.md:58`) marks as stating the effect and not its cause. A reviewer sees a DOI under a key no source backs.

## Checked and Clean
- `plugins/djinn/commands/learn.md`: the plan (Step 5) shows every value with where it came from and waits for `go` on anything discovered. That is the dry-run gate for a command that spends money.
- `plugins/djinn/commands/learn.md`: Step 11 names the next action and says plainly that nothing is in the repo's content. The ledger never carries a stem or a key.
- `plugins/djinn/commands/learn.md`: the check script uses the Python standard library only. A `jsonschema` or `pydantic` swap would need an install on the owner's machine, so the hand-written check is the right trade here.
- `plugins/djinn/agents/learn-*.md` and both example folders: status is always the word VERIFIED, UNVERIFIED or CONTRADICTED, never a color or glyph. The figure spec labels its traces rather than coloring them (tB `items-DRAFT.yaml:187 to 189`). The colorblind rule holds.
- `plugins/djinn/templates/config.yaml`: the learn block comments every key with an example, and empty means discovery, as CONTRACTS.md section 5 says.
- `plugins/djinn/relay.md`, `plugins/djinn/.claude-plugin/plugin.json`, `.djinn/config.yaml`: the command row, description and project notes match the command.
- `docs/examples/*/LEDGER.md`, `check.txt`, `usage.md`: the ledger shape matches CONTRACTS.md section 13, and usage writes `?` as specified.
- `plugins/djinn/agents/learn-known.md`, `learn-asked.md`, `learn-prepare.md`, `learn-fact-checker.md`: the output templates are complete, and the "none found" and `none` rules keep the files easy to scan.

## Files read outside the fence
- `<teaching repo>/tools/build_exam.py` (does the bank shuffle options)
- `<teaching repo>/tools/study_html.py` (existing student study page)
- `<teaching repo>/tools/check_scramble_safety.py` (grep only, forms shuffle)
- `<teaching repo>/content/secure/<secure bank>` (item count only, no content)
- `<teaching repo>` repo-wide grep for "shuffle", `content/secure/` excluded (where shuffling lives)
