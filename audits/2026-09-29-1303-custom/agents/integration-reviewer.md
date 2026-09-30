---
title: integration-reviewer report, audits/2026-09-29-1303-custom
author: Claude Opus 5.5 (integration-reviewer)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Redacted 2026-09-29, before this folder was committed: quoted exam item text, answer keys, topic words drawn from a secure item, and private scenario names from two private course repos are replaced by item ids and neutral descriptions in [brackets], because this repo is public. Every finding, id, line citation and number is unchanged.

## Findings

### HIGH
HIGH-1. `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/input.md:10` A live secure exam item from the teaching repo, with its key, plus 13 derived items and 52 training rows, sits in a branch of a repo its own README calls public. The course repo folder does the same for a repo whose CLAUDE.md says it stays private.
Mechanism: the example folders carry tB-06 verbatim (stem, four options, `a: 0`, rationale) in `input.md:12` to `:22` and again in every `sft.jsonl`, `dpo.jsonl` and `grpo.jsonl` row (`grpo.jsonl:1` holds the stem, the options and the `answer` column, [the item's key, verbatim]). Merging this branch and pushing publishes a teaching repo item whose whole value depends on students never seeing it. This is the exact leak section 13's secure source rule exists to stop, and the example README says so itself (`docs/examples/learn-dry-run/2026-09-29-1237-tB-06/README.md:11` to `:12`: "This folder sits in djinn-relay, which is public on GitHub. Pushing the commit that adds it publishes the item.").
Traced: `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/input.md:10` to `:22` matches the source at `<teaching repo>/content/secure/<secure bank>:205` to `:218` byte for byte. The consumer contract is the teaching repo's secure bank README, which says its items go to students on paper and are never published, and that a probe is spoiled once items are public. The plugin's own rule is at `plugins/djinn/CONTRACTS.md:1115` to `:1119`. The repository is `plugins/djinn/.claude-plugin/plugin.json:7`. The second folder: `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/README.md:8` to `:12` against the course repo's own house rules, which keep that repo private. Suggestion: drop both folders from the branch, or replace them with runs on a made-up item that comes from no secure path and no private repo.

### MEDIUM
MEDIUM-1. `plugins/djinn/commands/learn.md:138` The secure check runs on file inputs only, before topic mode picks its items, so a topic run that picks an item from a secure bank is marked `secure=no` all the way through.
Mechanism: Step 3b runs the secure check "(file inputs only)" before Step 4. Step 4 then searches "every `learn.item_shape` file that is a question bank" and runs whichever match the owner picks. Section 13's own teaching repo example sets `item_shape` to a `content/secure/` bank, so `/djinn:learn --topic "[the item's topic word]"` in the teaching repo finds tB-06 there, and nothing re-runs Step 3b for it. The Step 7 block says `Secure source: no`, the Step 9 prompt says `Secure source: no`, and the run README leaves out the `SECURE SOURCE` banner. The study sheet also leaves out its "not for students until the owner releases it" line, and the ledger writes `secure=no`. A study sheet built on a live probe's key then reads as safe to hand out.
Traced: `plugins/djinn/commands/learn.md:138` to `:146` (check, file inputs only), then `:150` to `:155` (topic search over item_shape banks, no secure re-check), then `:240` and `:305` (the flag handed on), then consumers `plugins/djinn/agents/learn-synthesis.md:255` to `:257` (study sheet warning gated on the flag) and `:270` to `:273` (README banner gated on the flag). The example config that makes this the default path is `plugins/djinn/CONTRACTS.md:874` and `:877`.

MEDIUM-2. `plugins/djinn/commands/learn.md:62` Learn writes its run folders into the target repo at `learn/` by default and never says to ignore them. `/djinn:review` and `/djinn:dispatch` fence every untracked file except `audits/`, so learn output floods the next review's fence and, after about a dozen runs, aborts it.
Mechanism: each run folder holds about 17 files (the fence of this very audit counts 17 per example run). In a repo that uses both pipelines (the teaching repo has a review config at `<teaching repo>/.djinn/config.yaml:3` and ignores no `learn/`), every learn file is untracked and not ignored. The next review adds every one of them to FENCE. Every reviewer then reads draft items and secure derived rows as code under review, and after 12 runs the count passes `MAX_UNTRACKED` (200), so the review stops at step 3 with "fix .gitignore". Section 5 says the learn block is "never read by a review", but its output is. If the owner commits `learn/` instead, the files enter the fence through `git diff` just the same.
Traced: `plugins/djinn/commands/learn.md:62` (`out_dir` absent means `learn/`) and `plugins/djinn/templates/config.yaml:179`, then consumers `plugins/djinn/commands/review.md:234` (`git ls-files -z -o --exclude-standard -- . ':!audits'`, which excludes `audits/` only) and `:239` to `:247` (the 200 path stop), and `plugins/djinn/commands/dispatch.md:183` (the same listing for `untracked-before.txt`). `<teaching repo>/.gitignore:1` to `:29` has no `learn/` line.

### LOW
LOW-1. `plugins/djinn/commands/learn.md:159` The seed spawn gets the Step 7 angle block, and that block says "Write exactly one file: `<RUN_DIR>/angles/<qid>/<your-name>.md`". Step 4 and learn-known's seed mode say `angles/seed-1/seed.md`. An agent that obeys the block writes `learn-known.md`, which the full run on `seed-1` overwrites a minute later, and the orchestrator's "Read it back" finds no `seed.md`. There is no retry or missing-file rule for that spawn. `seed.md` is also missing from section 13's run folder tree (`plugins/djinn/CONTRACTS.md:1123` to `:1141`) and from the Step 8 fact checker's file list (`learn.md:282` to `:283`). Yet Step 9's `angles/<qid>/*.md` glob (`learn.md:302`) hands it to synthesis, with claim ids whose letter is unstated and can collide with learn-known's `K` ids.

LOW-2. `plugins/djinn/commands/learn.md:62` `out_dir` is taken from config with no check that it resolves inside the target repo. The secure rule is enforced only on the input side (`learn.md:141` to `:146`), so `out_dir: ../other-repo/` writes a secure run outside the repo. `CONTRACTS.md:1115` to `:1116` promises that never happens. The `--sources` flag has an "exists under the target repo" check (`learn.md:92` to `:94`); `out_dir` needs the same one.

LOW-3. `plugins/djinn/README.md:2791` (patch line; README "The agents" block) says learn-harder builds "a five rung difficulty ladder". The contract and the agent both have six rungs: `plugins/djinn/CONTRACTS.md:923` to `:928`, `plugins/djinn/agents/learn-harder.md:37` to `:56`.

LOW-4. `plugins/djinn/README.md:2732` (patch line; the first usage example) puts the options and `Answer: R` on one line. Step 2 recognizes a key only on "a line starting `Answer:` or `Key:`" and options only on lines starting `A.` and the like (`plugins/djinn/commands/learn.md:78` to `:81`). So the documented first example makes the command stop and ask for the key.

LOW-5. `plugins/djinn/CONTRACTS.md:324` still says "If `config.yaml` or `base_branch` is missing, the command stops and asks" with no carve out. Section 13 (`CONTRACTS.md:846` to `:847`) and `learn.md:63` to `:64` say learn needs neither. The section 5 edit added a `learn` bullet at `:336` but left the blanket rule alone.

LOW-6. `plugins/djinn/CONTRACTS.md:1110` closes the neutral shape's YAML block with "``` The file lives in the run folder...", a fence with text after it, which CommonMark does not accept as a close. The code block runs on to `:1123`, and from there every fence pairs with the wrong partner. So "Secure sources", the run folder tree and "The command's one interpreter call" render as swapped code and prose on GitHub. Raw readers are unaffected.

LOW-7. `plugins/djinn/agents/learn-synthesis.md:50` lets a CONTRADICTED claim sitting in "a pull, a trap, a giveaway or an extend line" be stripped while the item ships. Section 13 lists only "a pull, a trap, an extend line" (`CONTRACTS.md:958` to `:959`), and section 13 wins. Where synthesis follows its own text, a stripped `giveaway` leaves a course repo item failing its schema (`<course repo>/content/schema/quiz.md:65`: "`rationale`, `giveaway`, and `source` present on every item"). The only-trap guard at `learn-synthesis.md:52` to `:54` does not cover a required giveaway, and the item is not marked `incomplete`.

LOW-8. `plugins/djinn/commands/learn.md:151` to `:153` says to run the topic search with "Grep ... passed with `-f`". The Grep tool takes no pattern file, and Bash grep is not on the command's allowed Bash list (`learn.md:507` to `:512`). As written, the step cannot run. The Grep tool is not a shell, so typing the pattern there carries no injection risk; the instruction should say so.

LOW-9. `plugins/djinn/relay.md:126` still reads "`audits/LEDGER.md` gets one line per command run". Since this change, `/djinn:learn` writes its line to `<out_dir>/LEDGER.md` instead (`CONTRACTS.md:462` to `:464`). relay.md is fenced and was edited in this diff, but not this line.

LOW-10. `plugins/djinn/commands/learn.md:296` to `:312` The synthesis prompt gives no path to CONTRACTS.md, and learn-synthesis leans on section 13 for two things it does not restate: the neutral item shape (`learn-synthesis.md:159` to `:161`) and the four TRL URLs and date (`:299` to `:301`). The subagent runs in the target repo, where no CONTRACTS.md exists. The review relay shares this pattern, but both dry runs were done by hand with no agent spawned (`docs/examples/learn-dry-run/2026-09-29-1237-tB-06/context.md:34` to `:37`), so this handoff has never run. Untested, not proven broken.

LOW-11. `plugins/djinn/CONTRACTS.md:990` allows "a fill in item with a short fixed answer" in `grpo.jsonl`, and `:1011` requires the `answer` and `mentions` weights to add to 1.0. The `mentions` terms are "the homes the full answer names for the distractors" (`learn-synthesis.md:213` to `:215`). A fill item with no distractor homes therefore gets either an empty `mentions` check (refused by the check at `learn.md:379` to `:381`) or none at all (a sum of 0.5, refused at `:387` to `:388`). The result is a forced rewrite and then `PARTIAL`. learn-known's rule of treating common wrong answers as options (`learn-known.md:50` to `:53`) usually supplies homes, so this needs a bare fill item to bite.

### DEBT
DEBT-1. `plugins/djinn/commands/learn.md:309` The synthesis prompt template hard codes `ANSWER_WEIGHT: 0.5   FORBIDS_PENALTY: 0.15` instead of naming the constants from `learn.md:46` to `:49`. The same two values are also stated as defaults in `CONTRACTS.md:1011` to `:1013`. When Donald changes one, there are three places to keep in step, and the check script enforces neither value.

### REC
REC-1. Run one real, spawned `/djinn:learn` from inside the teaching repo (output to its own `learn/`) before publishing 2.4.0. Every Agent handoff (the Step 7 block, the Step 8 prompt, the Step 9 prompt, the Counts line parse, the rewrite loop) has been followed by hand only.
REC-2. Have the learn command check once that `out_dir` is ignored (`git check-ignore`, a read) and say so in the plan, or have section 13 tell the owner to add it to `.gitignore`. That also closes MEDIUM-2.
REC-3. Add the learn- agents to the review command's custom list refusal (see Blast radius), next to proof-runner and fixer.
REC-4. `.claude-plugin/marketplace.json:9` still describes only the review relay. plugin.json's description was updated, so the two now read differently.

## Blast radius
- LOW `plugins/djinn/commands/review.md:181` The custom list accepts any name that matches a file in `agents/`, which now includes the six learn- agents. `review.md:171` to `:179` refuses proof-runner and fixer by name, but nothing refuses `learn-fact-checker` and the rest. A list naming one spawns it with the fence block and has it write into `audits/`, breaking section 13's "never touch `audits/`" (`plugins/djinn/CONTRACTS.md:827`). Synthesis then gets a report in no section 3 shape. Traced from `plugins/djinn/CONTRACTS.md:822` to `:827`.

## Checked and Clean
- `plugins/djinn/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`: neither lists commands or agents, so `commands/learn.md` and the six `agents/learn-*.md` are picked up by folder discovery. Each agent's frontmatter `name` matches the `subagent_type` strings in `learn.md:232` to `:233`, `:276` and `:296`, and all carry `model: opus` (section 8).
- Handoff, angle agents to fact checker: claim id letters K, A, H, P (`CONTRACTS.md:939` to `:942`) match each agent's Claims table. The fact checker's `claim | status | citation | note` table and its `U<n>` uncited rows are what `learn-synthesis.md:39` to `:42` reads, qualified as `<qid>.<id>`.
- Handoff, synthesis to command: the README Counts line (`learn-synthesis.md:280`) carries exactly the fields the ledger line takes (`learn.md:477`) and section 13's example (`CONTRACTS.md:1149`). The rewrite prompt (`learn.md:459` to `:461`) matches the agent's rewrite section (`learn-synthesis.md:321` to `:324`).
- Step 9 check script against section 13: the META set equals the nine metadata keys, `pair` is DPO only, the last-message roles fit the conversational shapes, the rubric has one answer check first with its first term equal to the `answer` column, forbids weights above 0, and answer plus mentions add to 1.0. The `--` from xargs is filtered, and kind comes from the basename. `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/check.txt:25` to `:27` shows it passing real rows.
- Run folder names: `angles/<qid>/<agent>.md`, `verification/<qid>.md`, `items-DRAFT.*`, the three `.jsonl` files, `study-sheet.md`, `quarantine.md`, `README.md`, `check.txt` and `usage.md` agree across `CONTRACTS.md:1123` to `:1141`, learn.md Steps 6 to 10, learn-synthesis Step 3 and the README tree (apart from the README tree leaving out `check.txt` and `usage.md`, which is harmless).
- `plugins/djinn/templates/config.yaml:163` to `:179`: the learn block's keys match section 13's block (`CONTRACTS.md:850` to `:870`) key for key. No review, brief or dispatch step reads `learn`; `review.md:18` to `:22` lists its keys and learn is not among them, and no trigger reads it.
- `/djinn:brief`, `/djinn:dispatch`, `/djinn:status` against the edits to sections 5, 6 and 7: brief (`brief.md:125` to `:126`) and dispatch (`dispatch.md:511` to `:512`) name `audits/LEDGER.md` outright and take the section 6 header, which is unchanged. Status appends nothing (`status.md:103` to `:104`). The only status word parsed anywhere is `status: pending` in fix briefs (`dispatch.md:20`, `:282`), so the new section 7 status value changes no parse. The section 5 rule that `none` means absent is unchanged.
- The secure check for a file input whose real path lies outside the target repo (`learn.md:141` to `:146`) is sound for that case. The gaps are MEDIUM-1 and LOW-2.
- The teaching repo: `tests/quiz-yaml.test.mjs:34` to `:38` reads only `content/secure/*.yaml`, so a draft under `learn/` never reaches its checks, and the secure bank README says the site build globs an allowlist, so `learn/` is never published by the site build. The section 13 example paths exist (`docs/ANSWER-KEY-VOICE.md`, `docs/ITEM-WRITING.md`, `docs/TEXTBOOKS.md`, `content/lectures/`, `content/reference/`, `docs/research/`). The bank keys by index (`<secure bank>:215`), and synthesis maps that to the option text for `grpo`.
- The course repo: `content/schema/quiz.md:8` to `:17` are the three tiers section 13 quotes; its house rules state that scenarios rotate and back `secure_paths: [.]`. There is no `.djinn/config.yaml`, and learn runs without one (`learn.md:63` to `:64`).
- `.djinn/config.yaml` (fenced): only `project_notes` changed; build_cmd still globs `plugins/*.md`, so the seven new prompt files fall under the voice check.
- Example LEDGER.md files: both lines follow section 13's shape, with a note in the input column. Only the header's outcome separator is one dash short, which is cosmetic.
- Not opened, beyond the grep above: the example `sft.jsonl`, `dpo.jsonl`, `study-sheet.md`, `quarantine.md`, `usage.md`, the verification files and the angle files. They are inputs to HIGH-1, not integration seams.

## Files read outside the fence
- `plugins/djinn/commands/review.md` (fence, ledger, custom list)
- `plugins/djinn/commands/dispatch.md` (untracked listing, ledger)
- `plugins/djinn/commands/brief.md` (ledger and section reads)
- `plugins/djinn/commands/status.md` (ledger read only)
- `plugins/djinn/agents/synthesis.md` (how CONTRACTS is referenced)
- `.claude-plugin/marketplace.json` (plugin registration)
- `<teaching repo>/.djinn/config.yaml` (target repo config)
- `<teaching repo>/.gitignore` (is learn/ ignored)
- `<teaching repo>/content/secure/README.md` (secure contract)
- `<teaching repo>/content/secure/<secure bank>` (real quiz shape, HIGH-1)
- `<teaching repo>/tests/quiz-yaml.test.mjs` (real item test)
- `<course repo>/content/schema/quiz.md` (real quiz schema)
- `<course repo>/CLAUDE.md` (private, scenarios)
- `<course repo>/tests/content.test.mjs` (real item test)
- `<course repo>/.gitignore` (is learn/ ignored)
