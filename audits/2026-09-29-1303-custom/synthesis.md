---
title: synthesis, audits/2026-09-29-1303-custom
author: Claude Opus 5.5 (synthesis)
date: 2026-09-29
status: agent output, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Redacted 2026-09-29, before this folder was committed: quoted exam item text, answer keys, topic words drawn from a secure item, and private scenario names from two private course repos are replaced by item ids and neutral descriptions in [brackets], because this repo is public. Every finding, id, line citation and number is unchanged.

# For Donald, in plain words

**Verdict: FIX THEN SHIP.** Three HIGH and seven MEDIUM block accepting
/djinn:learn as it stands. The two biggest are about privacy, not code: the
branch already holds a commit that would publish a live secure exam item and
a private repo's quiz the moment it is pushed. Nothing is pushed yet (origin
sits at 6587f87, four commits back from the 2.4.0 build), so that is still
cheap to undo.

A caution before anything else: this audit folder is inside djinn-relay,
which is public. Two agent reports here (integration-reviewer, devils-advocate)
quote the secure item's key and the private quiz's text. This synthesis
does not. Do not commit `agents/` as it stands.

## 1. Privacy of the examples (HIGH-1, HIGH-2)

- **What.** Developer version: commit 32a1c17 adds two dry run folders under
  `docs/examples/`. One copies the teaching repo item tB-06 word for word, key
  included, into input.md and into every sft, dpo and grpo row. The other
  copies a course repo quiz item, its trap notes and the scenario keys tied
  to a private setting. Plain version: the worked examples are a live exam
  question with its answer, and a private repo's content, sitting in a public
  repo's branch.
- **How it plays out.** You push `Claude-Development-djinn-relay`, which the
  marketplace installs from. A student searches the stem and finds the answer
  in `input.md` line 15. The item is a placement probe, and the teaching repo'
  own secure README says a probe is worthless once students have seen it.
- **Why it matters.** The example README says so itself (line 11: pushing
  publishes the item). A later commit that deletes the folders is not enough,
  because the blobs stay in history.
- **Suggestion.** Drop 32a1c17 before any push (reset the branch to 28e269c).
  No public history changes, because none of it is public yet. If you want a
  worked example, run the pipeline on a made-up question. See "Fix
  disagreements" for the other option.
- **Also noticed, not reviewed.** The 2.4.0 build commit itself (28e269c,
  not 32a1c17) uses the tB-06 fact as the teaching example in the prompts
  (`commands/learn.md:9`, `agents/learn-known.md:10`, `README.md:178`) and
  names the secure bank's path (`README.md:181`, `CONTRACTS.md:856`).
  Dropping 32a1c17 does not remove those. It is a textbook fact, not the item
  text, but you should rule on it.

## 2. The secure safeguards (HIGH-3, MEDIUM-1, LOW-2, LOW-3)

- **What.** Developer version: the secure check only knows the repo the
  command runs in. A file is secure if a folder in its path is named
  `secure`, or it sits under that repo's `secure_paths`. A whole-repo-private
  file from another repo matches neither, so it runs as `secure=no`, is not
  refused, and gets no SECURE banner. Topic mode is worse: the check is
  labeled "file inputs only" and runs before topic mode picks an item, so a
  secure item picked by topic is never checked. Plain version: the lock is
  on the front door only. Come in through the side (another repo, or a topic
  search) and nothing stops you or even marks what you carried in.
- **How it plays out.** From djinn-relay, run `/djinn:learn` on the
  the course repo quiz file. djinn-relay has no `secure_paths`, the path has no
  `secure` folder, so the plan says `secure=no` and the run writes the item
  and its key into `djinn-relay/learn/`, which is not gitignored. That is the
  same leak as section 1, reached through the command. Second case: in
  the teaching repo, `/djinn:learn --topic "[the item's topic word]"`, pick tB-06 from the
  list. The study sheet carries the key with no "not for students" line.
- **Why it matters.** CONTRACTS.md:1115 to 1116 promises "the command refuses
  an input path from a secure source in another repo", and both example
  READMEs repeat it. For a whole-repo-private source it does not.
- **Suggestion.** Refuse any file input whose real path is outside the
  target repo, secure or not. Run the secure check on every item topic mode
  picks. Add a `secure` key to row metadata now, while only two example runs
  exist (LOW-3), so a combined dataset can still filter out secure rows.

## 3. Where run folders land (MEDIUM-3, LOW-1, LOW-8)

- **What.** Developer version: output defaults to `learn/` inside the target
  repo, and nothing says to ignore it. `/djinn:review` fences every
  untracked file except `audits/`. Plain version: every learn run you do in
  a repo becomes "code to review" the next time you run a review there.
- **How it plays out.** The teaching repo has a djinn config and no `learn/` in
  `.gitignore`. After one learn run, the next review hands its 17 draft
  files, secure rows included, to every reviewer, and their reports quote
  them into `audits/`. After about 12 runs the untracked count passes 200 and
  the review stops at step 3 with "fix .gitignore".
- **Why it matters.** Section 5 says the learn block is "never read by a
  review". Its output is. And quoting secure rows into audit reports is the
  same leak again.
- **Suggestion.** Have the learn plan check that `out_dir` is ignored and
  refuse a secure run when it is not. Also check `out_dir` resolves inside
  the repo (LOW-1).

## 4. Item quality against your bar (MEDIUM-4 to MEDIUM-7)

devils-advocate graded every draft against your goal and the two
calibration sets. The teaching repo: 6 of 13 meet the bar. The course repo: 0 of
6 fully meet it. The fact checking itself was honest (7 of 7 spot checks
held).

- **MEDIUM-4, recall by design.** The generic ladder's first rung is
  `recall`, and learn-asked's reverse question and siblings are recall by
  construction. So 7 of 13 the teaching repo drafts are vocabulary. Where a repo
  bans recall, the agent labels its own rung and gets past the ban.
  Worked example: the course repo m-10 asks [a single time value for one age
  group], answer read off a table, labeled "application", against the
  schema's "a vocabulary question is a defect at any tier"
  (quiz.md:10 to 11). Your call: your the teaching repo bank is itself recall at
  this register.
- **MEDIUM-5, rationales capped.** The angle prompts say "the rationale is
  the rule and the fact, one to three sentences". Synthesis is told to write
  in the repo's register but "may not add content". On the course repo, whose
  writing rules include EXPLAINING.md ("name the distractor that pulls"),
  0 of 6 rationales name one. Median 21.5 words against the calibration's 62.
- **MEDIUM-6, keys cut after the fact check.** To stop a key being the
  longest option, synthesis shortened three keys after the fact checker had
  run, and nothing re-read them. Worked example: h-10's key became [a
  shortened key stating an upper limit], and one distractor [the option
  whose value is zero] now satisfies it too. m-09 lost [a two word
  qualifier], the one phrase separating it from its distractor. The course repo's
  rule is to rewrite the distractors, never to cut the key.
- **MEDIUM-7, the student sheet teaches the bad student.** Practice answers
  are "the key, its rationale and status". 10 of 13 the teaching repo answers
  place no other option. Answers 4, 5 and 7 are the bare key plus "VERIFIED",
  which is the "N1 = slow eye movements" student printed as the model answer.

## 5. Training data shape (MEDIUM-2, LOW-3 to LOW-6)

- **MEDIUM-2, seed questions are never fact checked.** In topic mode with no
  bank match, learn-known drafts a seed question. The fact checker gets only
  the four angle files, never `seed.md`, and the seed's claim ids reuse K1,
  K2, so they collide with learn-known's. A model-written stem becomes "the
  source question" of VERIFIED rows.
- **LOW-5, the key is always first.** 14 of 14 and 7 of 7 GRPO prompts list
  the key as the first option. A policy that copies the first bullet earns
  0.5 on every row.
- **LOW-6, echoing the stem pays.** GRPO row 14's "homes" terms are
  [two words], both in its own stem. A reply that parrots
  the question scores 1.0 while placing no option.
- **LOW-4, the VERIFIED filter can select only the recall rows.** On
  the course repo the one VERIFIED row is m-10, the recall item, because the
  sources hold the numbers and not the mechanism. The README recipe does not
  warn about this.
- What held up: the JSONL shapes, the check script, the rubric math and the
  DPO rejected answers (0 of 28 are nonsense; they read like the bad
  student).

---

scope: custom
agents expected: known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter, devils-advocate
agents received: known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter, devils-advocate
agents missing: none
changed files in fence: 47

## Fix List

### HIGH
HIGH-1. `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/input.md:10` A live the teaching repo secure item, tB-06, with its key and rationale (lines 12 to 22 match the source bank's lines 205 to 218 exactly), plus 13 derived items and 52 training rows, is committed in 32a1c17 to a repo whose plugin.json:7 names a public GitHub URL. Source: integration-reviewer (HIGH-1), confirmed by security-reviewer (HIGH-1 (SECURE CONTENT)); ux-reviewer REC-14 points to it. Report: agents/integration-reviewer.md
HIGH-2. `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/context.md:20` A course repo quiz item with trap notes, the private scenario keys and the private repo's layout are committed in the same commit, against the course repo's own house rules, which keep that repo private. Source: security-reviewer (HIGH-2 (PRIVATE REPO CONTENT)), confirmed by integration-reviewer (HIGH-1, second folder). Report: agents/security-reviewer.md
HIGH-3. `plugins/djinn/commands/learn.md:140` The secure check reads only the working repo's `secure_paths` and a `secure` folder name, so a whole-repo-private input from another repo runs as `secure=no`, is never refused, and lands in the working repo's `learn/` with no SECURE banner, against CONTRACTS.md:1115 to 1116 and the claims at the course repo example README.md:94 to 96 and context.md:25. Source: bugs-reviewer (HIGH-1 (SECURITY)), confirmed by security-reviewer (MEDIUM-1), ux-reviewer (REC-8). Report: agents/bugs-reviewer.md

### MEDIUM
MEDIUM-1. `plugins/djinn/commands/learn.md:138` The secure check is "file inputs only" and runs before Step 4, so an item topic mode picks from a secure `item_shape` bank (the section 13 example config, CONTRACTS.md:856) runs as `secure=no`: no README banner, no study sheet warning, `secure=no` in the ledger, and its bank never named as the input file for the never-evidence list. Source: bugs-reviewer (MEDIUM-1), confirmed by integration-reviewer (MEDIUM-1), security-reviewer (MEDIUM-3, topic half). Report: agents/bugs-reviewer.md
MEDIUM-2. `plugins/djinn/commands/learn.md:282` The seed question's `seed.md` is never handed to the fact checker (the prompt lists four angle files; learn-fact-checker.md:27 and :37 read only those), its claim ids use learn-known's `K` series and collide with learn-known's normal-mode K ids, and Step 9's `angles/<qid>/*.md` glob (learn.md:302) hands it to synthesis, so a model-drafted stem becomes the source question of rows that can read VERIFIED. Source: bugs-reviewer (MEDIUM-2), confirmed by integration-reviewer (LOW-1, checker half). Report: agents/bugs-reviewer.md
MEDIUM-3. `plugins/djinn/commands/learn.md:62` Learn writes to `learn/` inside the target repo by default and never checks or says it is ignored; review.md:234 fences every untracked file except `audits/`, so every learn run's files, secure rows included, enter the next review's fence, and about 12 runs pass `MAX_UNTRACKED` (review.md:218, 239) and stop the review. The teaching repo has a `.djinn/config.yaml` and no `learn` line in its `.gitignore`. Source: integration-reviewer (MEDIUM-2). Report: agents/integration-reviewer.md
MEDIUM-4. `plugins/djinn/CONTRACTS.md:921` The generic ladder opens on `recall` (learn-harder.md:40) and learn-asked's reverse and sibling items are recall by construction (learn-asked.md:42 to 49), so 7 of 13 the teaching repo drafts are vocabulary (a4, a5, a7 and h1 read in items-DRAFT.yaml:84 to 168); where a repo bans recall the agent labels its own rung and gets past the ban, as the course repo m-10 does (items-DRAFT.yaml:96 to 121, a table read labeled "application", against the course repo quiz.md:10 to 11). Source: devils-advocate (HIGH-1 (SPEC PRODUCES THE DEFECT)). Report: agents/devils-advocate.md
MEDIUM-5. `plugins/djinn/agents/learn-harder.md:108` The angles cap every rationale at "the rule and the fact, one to three sentences" (also learn-asked.md:91 to 92), while learn-synthesis.md:116 to 117 asks for the repo's register and :311 to 312 forbids adding content, so a repo whose writing rules want the pulling distractor named (EXPLAINING.md:49 to 51) gets placeholder rationales: 0 of 6 the course repo drafts name one. Source: devils-advocate (MEDIUM-2). Report: agents/devils-advocate.md
MEDIUM-6. `plugins/djinn/agents/learn-synthesis.md:145` Synthesis may reword a key to stop it being the longest option, after the fact check and with no re-read; in the course repo run this changed what two of three keys say: m-09 lost [a two word qualifier] (items-DRAFT.yaml:72, :81) and h-10's new key (:163) is also satisfied by [the option whose value is zero] (:167). Source: devils-advocate (MEDIUM-3). Report: agents/devils-advocate.md
MEDIUM-7. `plugins/djinn/agents/learn-synthesis.md:250` The study sheet's Answers are "the practice keys, each with its rationale and status", so the student file drops every distractor's home: 10 of 13 the teaching repo answers place no other option, and answers 4, 5 and 7 (study-sheet.md:78, :79, :81) are the bare key plus VERIFIED. Source: devils-advocate (MEDIUM-4). Report: agents/devils-advocate.md

### LOW
LOW-1. `plugins/djinn/commands/learn.md:197` `out_dir` is never checked to resolve inside the target repo, so a config value such as `../other-repo/` sends a secure run's output outside it, and CONTRACTS.md:1115 and README.md:206 promise more than the command enforces. Source: security-reviewer (MEDIUM-2), confirmed by integration-reviewer (LOW-2). Report: agents/security-reviewer.md
LOW-2. `plugins/djinn/agents/learn-fact-checker.md:74` In a `secure=no` run, learn-asked reads every `item_shape` bank (learn-asked.md:29 to 34) and the fact checker may name or quote a non-source bank line, so secure bank text can reach an unmarked run folder; the dry run's verification/tB-06.md:80 quotes a second secure bank. Source: security-reviewer (MEDIUM-3, bank-quote half). Report: agents/security-reviewer.md
LOW-3. `plugins/djinn/agents/learn-synthesis.md:229` Row metadata has no secure field, the Step 9 check refuses any extra key (learn.md:323, :350), and the README recipe drops `metadata` (learn-synthesis.md:294), so rows combined across runs cannot be filtered for secure origin; the course repo rows' `source_ref` does not show it. Source: security-reviewer (MEDIUM-4), confirmed by ux-reviewer (DEBT-1). Report: agents/security-reviewer.md
LOW-4. `plugins/djinn/agents/learn-synthesis.md:293` The recommended VERIFIED filter selects only the recall row when the sources hold numbers and not mechanism (the course repo: the one VERIFIED row in all three files is m-10), and the README says nothing about it. Source: devils-advocate (MEDIUM-1). Report: agents/devils-advocate.md
LOW-5. `plugins/djinn/agents/learn-synthesis.md:176` Prompts list options "in authored order", and every angle writes the key first, so 14 of 14 and 7 of 7 GRPO prompts put the key on the first line and a first-bullet policy scores `ANSWER_WEIGHT` on every row. Source: ux-reviewer (LOW-1), confirmed by gap-hunter (REC-1), devils-advocate (measurement). Report: agents/ux-reviewer.md
LOW-6. `plugins/djinn/agents/learn-synthesis.md:213` Nothing keeps a `mentions` term out of the prompt's own text, so echoing the stem earns reward: tB grpo.jsonl row 14's homes terms are [two words], both in its stem. Source: gap-hunter (REC-2). Report: agents/gap-hunter.md
LOW-7. `plugins/djinn/commands/learn.md:272` An angle agent that replies but writes no file has its two-line reply written as the angle file, is never listed as failed, and the run can end COMPLETE. Source: bugs-reviewer (LOW-1). Report: agents/bugs-reviewer.md
LOW-8. `plugins/djinn/commands/learn.md:215` The never-evidence lists name the literal `learn/`, not `<out_dir>` (also :249, :285, CONTRACTS.md:854 and :894), so a custom `out_dir` inside a source folder lets earlier runs be cited as evidence. Source: bugs-reviewer (LOW-2). Report: agents/bugs-reviewer.md
LOW-9. `plugins/djinn/commands/learn.md:152` Step 4 says to pass the topic through a pattern file with `-f`; the Grep tool takes no pattern file and the Rules' Bash list (:507 to 512) allows no grep, so the topic goes in as a regex. Source: bugs-reviewer (LOW-3), confirmed by integration-reviewer (LOW-8). Report: agents/bugs-reviewer.md
LOW-10. `plugins/djinn/CONTRACTS.md:1110` A closing code fence with text after it does not close in CommonMark, so every later fence in section 13 pairs with the wrong partner when rendered. Source: bugs-reviewer (LOW-4), confirmed by integration-reviewer (LOW-6). Report: agents/bugs-reviewer.md
LOW-11. `plugins/djinn/README.md:273` The agent table says learn-harder builds "a five rung difficulty ladder"; the contract and the agent say six; the README's run tree also leaves out `check.txt` and `usage.md`. Source: bugs-reviewer (LOW-5), confirmed by integration-reviewer (LOW-3), ux-reviewer (LOW-4). Report: agents/bugs-reviewer.md
LOW-12. `plugins/djinn/README.md:178` The first usage example puts options and `Answer:` on one line, which Step 2 (learn.md:77 to 81) does not parse, and :181 carries an annotation with no comment marker. Source: bugs-reviewer (LOW-6), confirmed by integration-reviewer (LOW-4), ux-reviewer (REC-13). Report: agents/bugs-reviewer.md
LOW-13. `plugins/djinn/commands/learn.md:430` The check script has no guard on `open`, so a missing or unreadable file ends the script and the files after it go unchecked; its metadata message also does not name the missing key, and `if not errs:` (:416) hides the Answer line check. Source: bugs-reviewer (LOW-7), confirmed by ux-reviewer (REC-6). Report: agents/bugs-reviewer.md
LOW-14. `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/study-sheet.md:8` The course repo example is a secure run but its study sheet lacks the secure line learn-synthesis.md:255 to 257 requires. Source: bugs-reviewer (LOW-8). Report: agents/bugs-reviewer.md
LOW-15. `plugins/djinn/commands/learn.md:159` The seed spawn gets the Step 7 angle block, which says to write `angles/<qid>/<your-name>.md`, while Step 4 and learn-known seed mode say `angles/seed-1/seed.md`; `seed.md` is also missing from the section 13 run tree. Source: integration-reviewer (LOW-1, path half). Report: agents/integration-reviewer.md
LOW-16. `plugins/djinn/CONTRACTS.md:324` Section 5 still says a missing config or `base_branch` stops every command, with no carve out for learn. Source: integration-reviewer (LOW-5). Report: agents/integration-reviewer.md
LOW-17. `plugins/djinn/agents/learn-synthesis.md:50` Adds "a giveaway" to the notes a CONTRADICTED claim may be stripped from; section 13 does not list it, and the course repo requires `giveaway` on every item. Source: integration-reviewer (LOW-7). Report: agents/integration-reviewer.md
LOW-18. `plugins/djinn/relay.md:126` Still says `audits/LEDGER.md` gets one line per command run; learn writes to `<out_dir>/LEDGER.md`. Source: integration-reviewer (LOW-9). Report: agents/integration-reviewer.md
LOW-19. `plugins/djinn/commands/learn.md:296` The synthesis prompt gives no path to CONTRACTS.md, which learn-synthesis needs for the neutral shape and the TRL URLs; untested, since both dry runs spawned no agent. Source: integration-reviewer (LOW-10). Report: agents/integration-reviewer.md
LOW-20. `plugins/djinn/CONTRACTS.md:990` A bare fill item in `grpo.jsonl` has no distractor homes for `mentions`, so it fails the weight sum or the empty-terms check, forcing a rewrite and then PARTIAL. Source: integration-reviewer (LOW-11). Report: agents/integration-reviewer.md
LOW-21. `plugins/djinn/commands/review.md:181` (blast radius, outside the fence) The review custom list accepts any file in `agents/`, now including the six learn agents, which would then write into `audits/`. Source: integration-reviewer (Blast radius LOW). Report: agents/integration-reviewer.md
LOW-22. `plugins/djinn/CONTRACTS.md:856` The public contract and README name a real secure bank path, a real item id and two private repos' layouts as examples (also :872 to 883, :1149, README.md:179 to 181). Source: security-reviewer (LOW-1). Report: agents/security-reviewer.md
LOW-23. `plugins/djinn/commands/learn.md:209` `context.md` writes `target_repo` as an absolute home path and `check.txt` carries absolute paths. Source: security-reviewer (LOW-2). Report: agents/security-reviewer.md
LOW-24. `plugins/djinn/agents/learn-synthesis.md:248` "Practice: the new items, questions only" is read two ways, and both examples print multiple choice items with no options (tB study-sheet.md:54, :60, :62, :63; the course repo sheet prints none). Source: ux-reviewer (LOW-2), confirmed by gap-hunter (REC-9, options part). Report: agents/ux-reviewer.md
LOW-25. `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/README.md:44` The example outputs cite an `L04` shorthand defined only in the verification file, the course repo README points at another run's README for its load recipe, and the course repo question id `e-01` collides across modules. Source: ux-reviewer (LOW-3). Report: agents/ux-reviewer.md
LOW-26. `plugins/djinn/agents/learn-harder.md:51` The spot-the-mistake example list seeds the fault, and the course repo h-09 copied it and stated it in the stem's own words. Source: devils-advocate (LOW-1). Report: agents/devils-advocate.md
LOW-27. `plugins/djinn/agents/learn-harder.md:94` Three shipped distractors have no true home (the course repo m-10 [a time value no group has], tB a5 [a region name no rule of the fact set uses], tB h1's quarantined option). Source: devils-advocate (LOW-2). Report: agents/devils-advocate.md
LOW-28. `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/items-DRAFT.yaml:46` e-10 restates the source item's mechanism and all three distractor homes, against learn-synthesis.md:76's drop rule. Source: devils-advocate (LOW-3). Report: agents/devils-advocate.md
LOW-29. `plugins/djinn/agents/learn-asked.md:37` learn-asked read the recall ban as a ban on keying any distractor and skipped every distractor-turned-key on the course repo. Source: devils-advocate (LOW-4). Report: agents/devils-advocate.md
LOW-30. `plugins/djinn/agents/learn-fact-checker.md:46` The fact check certifies atomized claims, not the inference a key rests on, so the course repo h-10 reads "VERIFIED for the numbers" over an unchecked design premise. Source: devils-advocate (LOW-5). Report: agents/devils-advocate.md

### DEBT
DEBT-1. `plugins/djinn/commands/learn.md:309` The synthesis prompt hard codes `ANSWER_WEIGHT: 0.5   FORBIDS_PENALTY: 0.15` instead of the named constants at :46 to 49, and CONTRACTS.md:1011 to 1013 states them too: three places to keep in step, none enforced by the check. Source: integration-reviewer (DEBT)

### REC
REC-1. integration-reviewer: run one real, spawned `/djinn:learn` from inside the teaching repo before publishing 2.4.0; every agent handoff has only been followed by hand.
REC-2. integration-reviewer, security-reviewer: have the plan report whether `out_dir` is ignored, tracked, and whether the repo has a remote, before `go`.
REC-3. integration-reviewer: refuse the learn- agents by name in the review custom list, beside proof-runner and fixer (pairs with LOW-21).
REC-4. integration-reviewer: `.claude-plugin/marketplace.json:9` still describes only the review relay.
REC-5. security-reviewer: a `qa/human` script that walks the leak guards: a cross-repo input, an `out_dir` outside the repo, and a topic run over a secure bank.
REC-6. security-reviewer: a pre-push check in djinn-relay that fails on `SECURE SOURCE`, `content/secure/` or `/home/` in tracked files outside `plugins/`.
REC-7. ux-reviewer: after `go`, write the confirmed discovery values to `<RUN_DIR>/learn-config.yaml` as a paste-ready `learn:` block.
REC-8. ux-reviewer, gap-hunter: give the owner a place to rule on UNVERIFIED and quarantined claims (a `rulings.md`, a ruling column in quarantine.md) and a way to rebuild from it.
REC-9. ux-reviewer, gap-hunter: a loading recipe across runs with a grouped train and eval split, and `group` and `split` metadata keys from the `leaks with` data, so sibling rows never straddle the split.
REC-10. ux-reviewer: write the reference reward to `<RUN_DIR>/learn_reward.py` instead of pointing into the plugin's CONTRACTS.md.
REC-11. ux-reviewer: say in the GRPO instruction that the answer is the option copied exactly; a correct short form scores 0.0 today.
REC-12. ux-reviewer: `--id` for prompt input; every prompt run is `q1` today.
REC-13. ux-reviewer: per-question progress, a token estimate in the plan, and `--resume` for whole-file runs.
REC-14. ux-reviewer: put notes meant for Donald at the end of the study sheet under a "remove before release" heading.
REC-15. ux-reviewer: copy `sec` from the source item instead of learn's own grouping.
REC-16. ux-reviewer: an optional `learn.preview_cmd` the README prints, never runs, for viewing the draft as a student would.
REC-17. ux-reviewer: the course repo e-10 carries a DOI under a key no source backs (see LOW-28 and devils-advocate's measurements).
REC-18. gap-hunter: a per-item verdict file (kept, edited, dropped) the next run reads, and owner edits as DPO pairs.
REC-19. gap-hunter: per-angle quality numbers in the README, and a `learn_reward_parts` that returns answer, homes and forbids apart.
REC-20. gap-hunter: a `misplaced` DPO pair whose rejected side is full length with one wrong home, so length alone cannot separate the pair.
REC-21. gap-hunter: dedupe ids and stems against earlier runs, and a bank check step in learn-harder.
REC-22. gap-hunter: propose one leak-free form from the pool in the README.
REC-23. gap-hunter: answers for the study plan's self checks, and a releasable sheet variant for secure sources.
REC-24. gap-hunter: topic runs that seed more than one question, and a run-level plan across questions.
REC-25. gap-hunter: `omitted`, `system` and `model` in row metadata.
REC-26. gap-hunter: print each GRPO row's key-to-distractor length ratio in the check output.
REC-27. gap-hunter: `holdout=` and `key_first=` in the learn ledger counts.

## Conflicts Resolved
- HIGH-3: bugs-reviewer said HIGH, security-reviewer said MEDIUM for the same mechanism, and integration-reviewer's Checked and Clean said the out-of-repo refusal at learn.md:141 to 146 "is sound for that case". The file shows detection at learn.md:140 to 141 uses only a `secure` folder name or the target repo's `secure_paths` (read at :60 to 64 and discovered from the target's CLAUDE.md at :122 to 127), so integration's clean line holds only for an input under a `secure` folder. For a whole-repo-private input the refusal never fires. Kept: bugs-reviewer's mechanism, at HIGH, because it breaks a stated contract guarantee (CONTRACTS.md:1115 to 1116) on a path to exposure.
- LOW-9: security-reviewer's Checked and Clean said the topic "reaches Grep through a pattern file with `-f`". bugs-reviewer and integration-reviewer said that instruction cannot be followed. The file shows learn.md:152 to 153 asks for `-f`, and the Rules' Bash list at :507 to 512 names no grep; the Grep tool takes the pattern as an argument. Kept: bugs-reviewer and integration-reviewer.
- LOW-11 and LOW-12: integration-reviewer cited `README.md:2791` and `:2732`, which are patch lines. The file lines are README.md:273 and :178, as bugs-reviewer cited; read and confirmed.
- LOW-3: security-reviewer said MEDIUM, ux-reviewer said DEBT for the same missing field. Merged at LOW (see Re-tiered).

## Fix disagreements (human decides)
- HIGH-1 and HIGH-2: option A (integration-reviewer): drop the two folders from the branch, or replace them with runs on a made-up item. Option B (security-reviewer): remove commit 32a1c17 from history (reset to 28e269c) before any push; a later delete commit still ships the blobs. Recommendation: B, because origin sits at 6587f87 (`.git/refs/remotes/origin/Claude-Development-djinn-relay`) and 32a1c17 holds only the examples, so the drop rewrites nothing public. Build any replacement example from an invented question. The prompt examples in 28e269c are a separate call (Coverage, synthesis noticed).
- HIGH-3: option A (bugs-reviewer, security-reviewer): refuse every file input whose real path is outside the target repo, secure or not. Option B (ux-reviewer REC-8): resolve the target repo from the input file's folder and show both roots in the plan. Recommendation: A, because it fails closed with one check, and `--sources` must already live in the target repo (learn.md:92 to 94), so a cross-repo input has nothing to cite anyway.
- MEDIUM-3: option A: review excludes `learn.out_dir` from its fence the way it excludes `audits/`. Option B (integration-reviewer REC-2): learn checks `git check-ignore` on `out_dir`, says so in the plan, and refuses a secure run when it is not ignored. Recommendation: B, because it also keeps secure rows out of an accidental commit, which A does not.
- MEDIUM-4: option A (devils-advocate): make "no recall item" the generic default that a repo turns off, and change the first rung to "tell the fact from its neighbors on a case". Option B (devils-advocate): keep the repo-driven ban, and add a mechanical recall test to learn-asked, learn-harder and synthesis ("a key that one source line states as a value or name, with a stem that names the thing asked about, is recall, whatever its label"). Recommendation: B's mechanical test in either case, since the course repo's ban was present and still passed by self labeling. Whether the teaching repo drafts are held to its recall-register bank or to the goal is Donald's call.
- LOW-5: option A (ux-reviewer): a synthesis rule that row i puts the key at position i mod option count, plus a check that fails when every GRPO row keys first. Option B (gap-hunter): a permutation seeded from the item id, a `key_position` metadata key, and a histogram check with `KEY_POSITION_MAX_SHARE`. Recommendation: A, because a model can follow a mod rule exactly and cannot compute a seeded permutation reliably; take B's check either way.

## Re-tiered
- MEDIUM-4 was devils-advocate HIGH: now MEDIUM because no crash, loss or exposure is involved, and the generic ladder writing recall is what CONTRACTS.md:921 to 928 specifies; the broken claim is one mislabeled item under the repo's ban, which is incorrect output under realistic use.
- HIGH-3 includes security-reviewer MEDIUM-1: merged up into bugs-reviewer's HIGH after reading learn.md:138 to 146 and CONTRACTS.md:1115 to 1116.
- LOW-1 was security-reviewer MEDIUM-2: now LOW because the path needs the owner to write an out-of-repo `out_dir` into their own config; no realistic use reaches it by default.
- LOW-2 was security-reviewer MEDIUM-3 (bank-quote half): now LOW because the traced path keeps the text inside the private repo's run folder, and the one quoted instance was inside a secure run; the topic half stays MEDIUM in MEDIUM-1.
- LOW-3 was security-reviewer MEDIUM-4: now LOW because each run's README and ledger carry the secure mark today; the leak needs a later cross-run merge and push that nothing in the diff performs.
- LOW-4 was devils-advocate MEDIUM-1: now LOW because the filter does what it says, and in the tB run the VERIFIED set holds the six items that meet the bar (a6, h2 to h6); the missing README warning is the defect.
- LOW-6 was gap-hunter REC-2: moved up to LOW after reading tB grpo.jsonl row 14 and learn-synthesis.md:213 to 215; the echo reward is a real defect in shipped rows.
- LOW-5 includes gap-hunter REC-1: merged at ux-reviewer's LOW.
- LOW-12 includes ux-reviewer REC-13; LOW-13 includes ux-reviewer REC-6; LOW-24 includes gap-hunter REC-9 (options part): each merged at the defect's tier.

## Dismissed by synthesis
none

## Coverage
- `.djinn/config.yaml`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/README.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter, devils-advocate
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/angles/e-01/learn-asked.md`: covered by known-bugchecker, devils-advocate
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/angles/e-01/learn-harder.md`: covered by known-bugchecker, security-reviewer, devils-advocate
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/angles/e-01/learn-known.md`: covered by known-bugchecker only (pattern scan; no content reviewer opened it)
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/angles/e-01/learn-prepare.md`: covered by known-bugchecker only (pattern scan)
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/check.txt`: covered by known-bugchecker, security-reviewer
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/context.md`: covered by known-bugchecker, bugs-reviewer, security-reviewer, ux-reviewer, devils-advocate
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/dpo.jsonl`: covered by known-bugchecker, gap-hunter, devils-advocate
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/grpo.jsonl`: covered by known-bugchecker, bugs-reviewer, ux-reviewer, gap-hunter, devils-advocate
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/input.md`: covered by known-bugchecker, security-reviewer, devils-advocate
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/items-DRAFT.yaml`: covered by known-bugchecker, security-reviewer, ux-reviewer, gap-hunter, devils-advocate
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/quarantine.md`: covered by known-bugchecker, security-reviewer
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/sft.jsonl`: covered by known-bugchecker, devils-advocate
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/study-sheet.md`: covered by known-bugchecker, bugs-reviewer, security-reviewer, ux-reviewer, devils-advocate
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/usage.md`: covered by known-bugchecker, security-reviewer, ux-reviewer
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/verification/e-01.md`: covered by known-bugchecker, devils-advocate
- `docs/examples/learn-dry-run-<course>/LEDGER.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/README.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter, devils-advocate
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/angles/tB-06/learn-asked.md`: covered by known-bugchecker, security-reviewer
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/angles/tB-06/learn-harder.md`: covered by known-bugchecker only (pattern scan)
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/angles/tB-06/learn-known.md`: covered by known-bugchecker, security-reviewer
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/angles/tB-06/learn-prepare.md`: covered by known-bugchecker only (pattern scan)
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/check.txt`: covered by known-bugchecker, integration-reviewer, security-reviewer, ux-reviewer
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/context.md`: covered by known-bugchecker, integration-reviewer, security-reviewer, ux-reviewer
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/dpo.jsonl`: covered by known-bugchecker, security-reviewer, gap-hunter, devils-advocate
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/grpo.jsonl`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer, gap-hunter, devils-advocate
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/input.md`: covered by known-bugchecker, integration-reviewer, security-reviewer
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/items-DRAFT.yaml`: covered by known-bugchecker, ux-reviewer, gap-hunter, devils-advocate
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/quarantine.md`: covered by known-bugchecker, security-reviewer
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/sft.jsonl`: covered by known-bugchecker, security-reviewer, devils-advocate
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/study-sheet.md`: covered by known-bugchecker, security-reviewer, ux-reviewer, gap-hunter, devils-advocate
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/usage.md`: covered by known-bugchecker, ux-reviewer
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/verification/tB-06.md`: covered by known-bugchecker, security-reviewer, devils-advocate
- `docs/examples/learn-dry-run/LEDGER.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter
- `plugins/djinn/.claude-plugin/plugin.json`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter
- `plugins/djinn/CONTRACTS.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter, devils-advocate
- `plugins/djinn/README.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter
- `plugins/djinn/agents/learn-asked.md`: covered by known-bugchecker, bugs-reviewer, security-reviewer, gap-hunter, devils-advocate
- `plugins/djinn/agents/learn-fact-checker.md`: covered by known-bugchecker, bugs-reviewer, security-reviewer, gap-hunter, devils-advocate
- `plugins/djinn/agents/learn-harder.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, gap-hunter, devils-advocate
- `plugins/djinn/agents/learn-known.md`: covered by known-bugchecker, bugs-reviewer, gap-hunter, devils-advocate
- `plugins/djinn/agents/learn-prepare.md`: covered by known-bugchecker, bugs-reviewer, security-reviewer, gap-hunter
- `plugins/djinn/agents/learn-synthesis.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter, devils-advocate
- `plugins/djinn/commands/learn.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter, devils-advocate
- `plugins/djinn/relay.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter
- `plugins/djinn/templates/config.yaml`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter
- Agents missing: none
- Synthesis noticed, unreviewed: `plugins/djinn/commands/learn.md:9`, `plugins/djinn/agents/learn-known.md:10` and `plugins/djinn/README.md:178` use the tB-06 fact, the answer to that secure item, as the teaching example, and they live in the 2.4.0 build commit 28e269c, which dropping 32a1c17 does not touch. security-reviewer's LOW-1 covers the bank path and item id, not this.
- Synthesis noticed, unreviewed: `audits/2026-09-29-1303-custom/agents/integration-reviewer.md:12` quotes the tB-06 answer from grpo.jsonl, and `agents/devils-advocate.md` quotes the course repo item text. The audit folder is committed to this public repo by habit; these two reports need a scrub or must stay uncommitted.

## Fence
- Files synthesis read: `audits/2026-09-29-1303-custom/context.md`, `audits/2026-09-29-1303-custom/fence.txt`, the seven reports in `audits/2026-09-29-1303-custom/agents/`, `plugins/djinn/CONTRACTS.md`, `plugins/djinn/commands/learn.md`, `plugins/djinn/agents/learn-synthesis.md`, `plugins/djinn/agents/learn-known.md`, `plugins/djinn/agents/learn-fact-checker.md`, `plugins/djinn/agents/learn-harder.md`, `plugins/djinn/agents/learn-asked.md`, `plugins/djinn/.claude-plugin/plugin.json`, `plugins/djinn/README.md` (grep), `plugins/djinn/` (grep count for the example fact), `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/input.md`, `.../README.md`, `.../items-DRAFT.yaml` (lines 1 to 170), `.../study-sheet.md`, `.../verification/tB-06.md` (lines 76 to 83), `.../grpo.jsonl` (grep of the homes checks), `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/README.md`, `.../context.md`, `.../items-DRAFT.yaml`, `.../angles/e-01/learn-harder.md`. Outside the fence, each cited by a reviewer: `plugins/djinn/commands/review.md` (grep and lines 214 to 253), `.gitignore`, `.git/logs/HEAD`, `.git/refs/remotes/origin/Claude-Development-djinn-relay`, `<teaching repo>/content/secure/<secure bank>` (lines 203 to 218), `<teaching repo>/content/secure/README.md` (lines 1 to 36), `<teaching repo>/.gitignore` (grep), `<teaching repo>/.djinn/config.yaml` (existence only), `<course repo>/CLAUDE.md` (lines 236 to 305), `<course repo>/content/schema/quiz.md` (lines 1 to 30), `~/Conventions/voice/EXPLAINING.md` (lines 40 to 53).
- Reviewer reads outside the fence:
  - known-bugchecker: fifteen known-bugs detail files under `~/Conventions/code/known-bugs/` (index detail file)
  - bugs-reviewer: none reported
  - integration-reviewer: `plugins/djinn/commands/review.md` (fence, ledger, custom list)
  - integration-reviewer: `plugins/djinn/commands/dispatch.md` (untracked listing, ledger)
  - integration-reviewer: `plugins/djinn/commands/brief.md` (ledger and section reads)
  - integration-reviewer: `plugins/djinn/commands/status.md` (ledger read only)
  - integration-reviewer: `plugins/djinn/agents/synthesis.md` (how CONTRACTS is referenced)
  - integration-reviewer: `.claude-plugin/marketplace.json` (plugin registration)
  - integration-reviewer: the teaching repo `.djinn/config.yaml`, `.gitignore`, `content/secure/README.md`, the secure bank, `tests/quiz-yaml.test.mjs` (target repo checks)
  - integration-reviewer: the course repo `content/schema/quiz.md`, `CLAUDE.md`, `tests/content.test.mjs`, `.gitignore` (target repo checks)
  - security-reviewer: `.gitignore`, `.git/logs/HEAD`, `.git/refs/remotes/origin/Claude-Development-djinn-relay` (tracked and pushed state)
  - security-reviewer: the teaching repo secure bank, `<second secure bank>`, `content/secure/README.md`, `.gitignore` (verify copies)
  - security-reviewer: the course repo `CLAUDE.md`, the module `quiz.yaml` (verify copies)
  - ux-reviewer: the teaching repo `tools/build_exam.py`, `tools/study_html.py`, `tools/check_scramble_safety.py` (grep), the secure bank (item count only), a repo-wide grep for "shuffle" with `content/secure/` excluded
  - gap-hunter: the teaching repo secure bank (option order), `docs/ITEM-WRITING.md`; the course repo `content/schema/quiz.md`
  - devils-advocate: the course repo module `quiz.yaml`, `content/schema/quiz.md`, `CLAUDE.md`, the module `sources.md`; the teaching repo secure bank, three lecture files, `docs/ITEM-WRITING.md`; `~/Conventions/voice/ITEM-WRITING.md`, `~/Conventions/voice/EXPLAINING.md`

## Counts
HIGH 3, MEDIUM 7, LOW 30, DEBT 1, REC 27

## Verdict: FIX THEN SHIP
Blocking: HIGH-1, HIGH-2, HIGH-3, MEDIUM-1, MEDIUM-2, MEDIUM-3, MEDIUM-4, MEDIUM-5, MEDIUM-6, MEDIUM-7.
