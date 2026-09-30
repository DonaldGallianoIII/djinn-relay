---
title: synthesis, audits/2026-09-29-1428-custom (round 2 of audits/2026-09-29-1303-custom)
author: Claude Opus 5.5 (synthesis)
date: 2026-09-29
status: agent output, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

This file is written for a public repo. It names no private item text, no
option property, no bank file name and no workplace name. "The teaching
repo" is the private repo with the secure exam banks; "the course repo" is
the whole-repo-private course. A course repo item is named by the last part
of its id (h-03, m-10), because the full id names a field of work. A dry run
path is written `local/dry-runs/<teaching>/<run>/` or
`local/dry-runs/<course>/<run>/`. `~` is the home folder.

# For Donald, in plain words

**Verdict: FIX THEN SHIP.** One HIGH and six MEDIUM block. Two of them,
HIGH-1 and MEDIUM-1, block any push of this public repo, and both sit in
audit files outside the fence.

**What round 2 confirms fixed.** All 3 HIGH and all 7 MEDIUM of round 1,
each read in the file at HEAD. None regressed. All 30 round 1 LOWs were
checked too, and none is still open. The examples are gone from the branch,
a cross-repo input is refused, topic picks and seeds get the secure check
and the fact check, `learn/` is ignored and skipped by review and dispatch,
naming items are banned by a test on stem and key, rationales follow the
bank's register, keys are never cut, and every study sheet answer places
every option. One caution: round 1's HIGH-1 was a secure item's answer in a
public commit. This round's HIGH-1 is the same harm on a different item,
and it came in through the fix report that closed round 1.

## (a) Privacy of this public repo

1. **HIGH-1, an answer tell in the round 1 fix report.**
   - What. Developer version:
     `audits/2026-09-29-1303-custom/fixes/fix-report.md:154 to 155`, with
     the ratio at `:151`, states a property of secure item tA-03's key
     that stays true however the options are shuffled. The file is tracked
     in 1e45eb5. `tools/check-private.sh:29` skips `audits/`, so the build
     passed it. Plain version: the report tells a reader how to spot the
     right answer without knowing the material.
   - How it plays out. A student finds the public repo and reads the line.
     On the quiz the options come in a new order, but the property travels
     with the option, so the student picks it on sight.
   - Why it matters. The teaching repo keeps its secure banks off every
     public path because an item is worthless once students know its
     answer. The same fix report says its scrub came back clean
     (`:116 to 122`).
   - Suggestion. Move `:151` and `:154 to 155` into `local/`, and scrub
     this round's `agents/bugs-reviewer.md:38`, which repeats the ratio.
     Then do the history rewrite below.

2. **MEDIUM-1, workplace and private repo identifiers across the unpushed
   range.**
   - What. Developer version: the round 1 folder keeps the line that links
     the course repo to your workplace
     (`audits/2026-09-29-1303-custom/agents/security-reviewer.md:20`) and
     that repo's track layout (`:21`). The 2026-09-27 audits in 153ad84 name
     your work repo's folder and quote its config by line (for example
     `audits/2026-09-27-1655-ideas/agents/gap-hunter.md:16`). The shipped
     prompt `plugins/djinn/agents/data-contract-reviewer.md:209` names the
     work repo too. `.claude-plugin/marketplace.json:5` carries your full
     name. Plain version: one push puts your employer, the course's field
     and your work project next to your name.
   - How it plays out. Someone browsing the repo opens a 2026-09-27
     gap-hunter report and reads your work repo's folder name beside quoted
     lines of its config.
   - Why it matters. No key or credential is exposed, which is why this is
     MEDIUM and not HIGH. But the course repo's own rules say it stays
     private because of that link, and 6587f87 was already a scrub for
     exactly this kind of line.
   - Suggestion. Replace each with "a private course repo", "a work repo" or
     "a module quiz" and drop the quoted line, as security-reviewer lists.
     Then do the history rewrite below.

3. **This round's own folder repeats the slip** (synthesis noticed, listed
   under Coverage, not in the Fix List). `agents/integration-reviewer.md:81`
   names a secure bank file, `agents/bugs-reviewer.md:38` repeats HIGH-1's
   ratio, and several reports use full course item ids and both private
   repo names. Do not commit this folder's `agents/` as it stands.

**The history rewrite of 6587f87..HEAD. Recommendation: squash, not
rebase.**

1. Nothing above 6587f87 is public: the origin ref reads 6587f87
   (`.git/refs/remotes/origin/Claude-Development-djinn-relay:1`). Seven
   commits sit above it (75c51dc, b826549, 7e4c8cd, 47fabe5, 153ad84,
   a4ee7dc, 1e45eb5, `.git/logs/HEAD:8 to 22`). Rewriting them changes
   nothing anyone has pulled.
2. Scrub the working tree first: HIGH-1's lines, MEDIUM-1's list, LOW-6,
   LOW-7, and LOW-5 if you want home paths out of the config. Put the
   private words (both repo names, the course code, the work folder name,
   `/home/`) in `local/private-patterns.txt`, which `.gitignore:5` already
   ignores, and run `git grep -l -F -f local/private-patterns.txt`. It
   should list nothing.
3. `git reset --soft 6587f87`, then one commit. A soft reset keeps the
   scrubbed tree and drops all seven old commits, so no pre-scrub copy of
   any file stays reachable from the branch. Security-reviewer's option (an
   amend of 1e45eb5 plus an interactive rebase of 153ad84) works too, but
   each edited commit has to be checked on its own, and the 2026-09-25
   audits sit in earlier commits of the same range (LOW-7).
4. Prove it before pushing (REC-1):
   `git log -p 6587f87..HEAD | grep -c -F -f local/private-patterns.txt`
   reads 0, and `git diff --stat 1e45eb5 HEAD -- . ':!audits'` shows only
   the prompt line you scrubbed.
5. Push the one branch by name, `git push origin
   Claude-Development-djinn-relay`. Never `--all` or `--mirror` while the
   backup branch exists, and no `--tags` until the tag check below.

**The backup branch `backup-learn-before-squash`. Recommendation: bundle it
outside the repo, then delete it.** It points at cb325aa
(`.git/refs/heads/backup-learn-before-squash:1`), whose history holds
28e269c: round 1's secure item's key fact as a prompt example, the secure
bank path and both private repos' layouts (fix-report.md:166 to 169). A
plain push of the current branch never sends it (`.git/config:9 to 11`),
but `git push --all` or `--mirror` would. After step 4 passes, run `git
bundle create ~/backups/djinn-relay-before-squash.bundle
backup-learn-before-squash` if you want a copy, then `git branch -D
backup-learn-before-squash`. The branch exists only to undo the squash, and
step 4 is the proof you no longer need to. The reflog still reaches the old
commits on this machine; no push sends the reflog, so that needs nothing.
One thing synthesis could not resolve: the tag `djinn--v2.1.0` points at
ad1fa28. Run `git merge-base --is-ancestor djinn--v2.1.0 6587f87`; exit 0
means the tag sits inside the public range and is safe to push.

## (b) Item quality, regraded

devils-advocate regraded both fresh dry runs itself and did not use the fix
report's counts.

- Teaching repo run, tA-03, 10 drafts: 6 meet the bar (the fix report
  said 9), 1 is near, 3 fall short. Vocabulary in effect: 1 (tA-15; the
  fix report said 0). Restatements of the source: 2 (tA-13, tA-14; the
  fix report counted 1).
- Course repo run, h-03, 7 drafts: 6 meet the bar (matches the fix report),
  0 vocabulary, 1 restatement (m-10).
- Across both: 1 of 17 is vocabulary by your bar and 0 of 17 by the
  contract's mechanical test. Round 1 was 9 of 19.
- Rationales: every draft inside its calibration range (teaching 22 to 31
  words against the bank's 12 to 37; course 75 to 104 against 45 to 113).
  Stems run long: median 35 words against 19, and 50 against 31.5 (LOW-33).
- DPO: all 49 rejected answers read as the bad student, 0 as nonsense. One
  misplaced answer invents a home (course `dpo.jsonl:14`).
- Key positions balance after the shuffle in all six row files. 11 VERIFIED
  claims spot checked, all hold.
- Caveat: both runs were one agent playing every role, and their angle and
  verification files predate commit 1583b79. No spawned run exists yet
  (REC-8).

4. **MEDIUM-5, a restatement ships when one distractor changes.**
   - What. Developer version: `plugins/djinn/agents/learn-synthesis.md:100
     to 102` drops an item as a restatement only when it shares the
     source's key reason AND all its homes. Plain version: the part a
     student carries over is the key reason; the homes are the cheap part
     to change, so changing one lets a copy through.
   - How it plays out. Course m-10 asks the source's key reason as a case
     with one new distractor. The run README itself says it shares the key
     reason, not the homes, "so it ships"
     (`local/dry-runs/<course>/<run>/README.md:80`).
   - Why it matters. 3 of 17 drafts are the source question in new words. A
     student who answered the source learns nothing from them.
   - Suggestion. devils-advocate's test: each item's comment answers "new
     fact beyond the source's key reason: <claim id> or none", and `none`
     drops the item.

5. **MEDIUM-6, a double keyed item ships VERIFIED.**
   - What. Developer version: only an item reworded after the fact check is
     asked whether a distractor also satisfies the key
     (`plugins/djinn/CONTRACTS.md:1049 to 1054`), and the key reason no
     longer covers why the other options are wrong (`:981 to 985`). Plain
     version: each sentence is checked on its own, so two sources that
     disagree on one step never meet in one check.
   - How it plays out. tA-20's own note says one distractor is defensible
     under a second lecture passage. The fact check marked the claim
     VERIFIED because "the lines do not disagree". All four of its rows ship
     VERIFIED in `train`, and the GRPO row pays 0.0 for the defensible
     option.
   - Why it matters. VERIFIED is the filter the load recipe keeps. A model
     trained on those rows is punished for a defensible answer.
   - Suggestion. Ask the double key question of every item, reworded or not,
     and ship an item with a defensible distractor as UNVERIFIED with a
     claim naming both lines.

## (c) The rest

6. **MEDIUM-2, the release sheet keeps the lines the contract strips.**
   - What. Developer version: `learn-synthesis.md:352 to 354` builds
     `study-sheet-release.md` by dropping only the source map and the
     practice items that leak with the source. `CONTRACTS.md:1331 to 1335`
     also drops every misconception, analogy, plan step and self check
     answer that states the source key or its reason. Plain version: the
     agent's recipe is shorter than the rule it is meant to follow.
   - How it plays out. In the course repo dry run the release sheet keeps
     the "What gets people" table. Its fix column (`:14`, `:17`) and self
     check answer 1 (`:81`) each state the rule that makes h-03's key
     right. A student handed that file answers h-03 without studying.
   - Why it matters. This is the one file you are told you may hand to
     students.
   - Suggestion. Copy the contract's full list into learn-synthesis.md:353,
     and keep it in one place after that (REC-9).

7. **MEDIUM-3, leak lines point the wrong way for the release rule.**
   - What. Developer version: a `leaks with` line names the items that give
     this item away (`learn-asked.md:77 to 80`), never the items this item
     gives away, and learn-harder has the field (`:188`) but no step that
     fills it. The release rule keys on that line. Plain version: the sheet
     asks "who gives this item away" when it needs "what does this item give
     away".
   - How it plays out. The same course release sheet keeps practice items
     2, 3 and 4, and each carries h-03's key in its own stem or options.
     Their leak lines name only sibling items.
   - Why it matters. Same file, same harm as MEDIUM-2, by a second road. The
     teaching repo's release sheet happened to be clean.
   - Suggestion. Define both directions in learn-asked step 7, add the step
     to learn-harder, and have synthesis grep each kept practice item for
     the source key's content words before it writes the release sheet.

8. **MEDIUM-4, the seed block has no secure paths.**
   - What. Developer version: the seed spawn block (`learn.md:212 to 230`)
     has no `Secure paths:` line and no never-quote sentence, which the
     angle block has (`:363 to 365`). learn-known in seed mode opens the
     item shape bank to copy its form and is told never to guess a value
     the block does not give. Plain version: the one agent that writes a
     new source question is not told which banks are secret.
   - How it plays out. In the teaching repo, `/djinn:learn --topic <word>`
     and answer `seed`. learn-known opens the secure bank named as the item
     shape and may write a seed close to a same-topic secure item. The run
     is `secure=no`, every row says `secure: no`, and the load recipe keeps
     those rows for upload.
   - Why it matters. A secure item's content can reach a dataset marked
     safe to publish. The gap in the block is certain; the leak needs the
     model to echo what it read.
   - Suggestion. Add `Secure paths: <list or none>` and the angle block's
     never-quote sentence to the seed block.

9. **The private check and its QA script (LOW, not blocking).**
   `tools/check-private.sh` catches a whole run folder but not a partial copy
   (LOW-1), skips `audits/`, where both of this round's leaks sit (LOW-2),
   and reads a git error as clean, though the build's own git call guards
   that path (LOW-3, LOW-4). `qa/human/learn-leak-guards.md` has never been
   walked, and steps 1, 5 and 6 cannot reach what they are named for as
   written (LOW-19 to LOW-21).

---

scope: custom (round 2)
agents expected: known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
agents received: known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
agents missing: none
changed files in fence: 21

## Round 1 status (round 2 and later only)

No `fixes/<id>.diff` files exist for round 1; the fix landed as squashed
commit a4ee7dc with `fixes/fix-report.md` beside it. Each row was verified
against the file at HEAD 1e45eb5 and the reflog, not the fix report.

| Prior id | Status | evidence file:line |
|----------|--------|--------------------|
| HIGH-1 | RESOLVED | `.git/logs/HEAD:15` resets past 32a1c17, `:19 to 21` rebuild the work as a4ee7dc on 153ad84; a Glob of `docs/**` finds only `docs/session-log-2026-09-12.md` and `docs/carried-findings.md`. The same harm on another item is R2 HIGH-1. |
| HIGH-2 | RESOLVED | same removal; no course repo item, trap note or scenario key is in a fenced file. The workplace link left in the round 1 audit is R2 MEDIUM-1. |
| HIGH-3 | RESOLVED | `plugins/djinn/commands/learn.md:168 to 178` finds the input's own repo and stops with `ABORTED step 3b: input outside this repo`, secure or not. |
| MEDIUM-1 | RESOLVED | `plugins/djinn/commands/learn.md:165 to 166` runs the secure check on each picked bank; `:200 to 203` routes every pick through Step 3 and 3b. |
| MEDIUM-2 | RESOLVED | `plugins/djinn/commands/learn.md:405` hands `seed.md` to the fact checker; `:235 to 237` and `plugins/djinn/agents/learn-known.md:102 to 108` give seeds the `Q` series. The seed block's missing secure paths is R2 MEDIUM-4. |
| MEDIUM-3 | RESOLVED | `plugins/djinn/commands/learn.md:287 to 295` writes `<out_dir>/.gitignore` and stops a secure run git does not ignore; `':!learn'` sits on 7 listings in `commands/review.md` and 3 in `commands/dispatch.md` (grep count). |
| MEDIUM-4 | RESOLVED | `plugins/djinn/CONTRACTS.md:933 to 959` bans naming items by stem and key, five rungs, no `recall`; regrade finds 0 of 17 by that test. The test's width is R2 LOW-31. |
| MEDIUM-5 | RESOLVED | `plugins/djinn/CONTRACTS.md:1032 to 1043`, `plugins/djinn/agents/learn-synthesis.md:151 to 165`; every draft rationale sits inside its calibration range. |
| MEDIUM-6 | RESOLVED | `plugins/djinn/CONTRACTS.md:1045 to 1054`, `plugins/djinn/agents/learn-synthesis.md:197 to 209`, `plugins/djinn/agents/learn-fact-checker.md:160 to 182`; the course run reworded two distractors, never a key, and both passed the recheck (`local/dry-runs/<course>/<run>/README.md:86 to 87`). |
| MEDIUM-7 | RESOLVED | `plugins/djinn/agents/learn-synthesis.md:337 to 342`; 17 of 17 dry run answers place every option. |

## Fix List

### HIGH
HIGH-1. `audits/2026-09-29-1303-custom/fixes/fix-report.md:154` (blast radius, outside the fence) Lines 154 to 155, with the ratio at :151, state a property of secure item tA-03's key that survives any option shuffle, so a reader of this public repo can pick that key on sight; the file is tracked in 1e45eb5, not pushed, and `tools/check-private.sh:29` excludes `audits/`, so the build cannot see it. Source: security-reviewer (Blast radius HIGH-1 (SECURE CONTENT)). Report: agents/security-reviewer.md

### MEDIUM
MEDIUM-1. `audits/2026-09-29-1303-custom/agents/security-reviewer.md:20` (blast radius, outside the fence) Tracked audit files across the unpushed range 6587f87..HEAD keep the link between a private course repo and Donald's workplace (:20) and that repo's track layout (:21), the 2026-09-27 audits in 153ad84 name the work repo's folder and quote its config by line (for example `audits/2026-09-27-1655-ideas/agents/gap-hunter.md:16`, `:19`, `:27`), and the shipped prompt `plugins/djinn/agents/data-contract-reviewer.md:209` names the work repo, all beside Donald's full name at `.claude-plugin/marketplace.json:5`. Source: security-reviewer (Blast radius MEDIUM-1 (PERSONAL, WORK)). Report: agents/security-reviewer.md
MEDIUM-2. `plugins/djinn/agents/learn-synthesis.md:352` The release sheet the agent writes drops only the source question's map and the practice items whose `leaks with` names the source, while CONTRACTS.md:1331 to 1335 also drops every misconception, analogy, plan step and self check answer that states the source key or its reason; learn-prepare writes those against the source question (learn-prepare.md:44 to 48, :56 to 62), so `study-sheet-release.md` in a secure run still teaches the key, as the course repo dry run's release sheet shows at :14, :17 and :81. Source: bugs-reviewer (MEDIUM-1), confirmed by integration-reviewer (MEDIUM-1). Report: agents/bugs-reviewer.md
MEDIUM-3. `plugins/djinn/agents/learn-harder.md:188` A `leaks with` line names the items that give this item's answer away (learn-asked.md:77 to 80), never the items this item gives away, and learn-harder has the field but no method step that fills it (:82 to :107); the release rule keys on that line, so a practice item whose own stem or options state the source key stays in `study-sheet-release.md`, as practice items 2, 3 and 4 of the course repo dry run's release sheet do (:35, :41 to :45, :49). Source: devils-advocate (MEDIUM-1). Report: agents/devils-advocate.md
MEDIUM-4. `plugins/djinn/commands/learn.md:212` The seed spawn block carries no `Secure paths:` line and no never-quote sentence, which the angle block has (:363 to :365); learn-known in seed mode reads the item shape bank to copy its form (learn-known.md:92 to 95), never guesses a value the block does not give (:39 to :40), and its never-quote rule (:121 to :123) needs the secure paths, so in a seed run that is `secure=no` a seed that restates a secure bank item ships in rows marked `secure: no`, which the load recipe keeps (CONTRACTS.md:1187). Source: integration-reviewer (MEDIUM-2), confirmed by bugs-reviewer (LOW-7). Report: agents/integration-reviewer.md
MEDIUM-5. `plugins/djinn/agents/learn-synthesis.md:100` The restatement test drops an item only when it shares the source's key reason AND all its homes (also learn-asked.md:47 to 50, learn-harder.md:88 to 89), so one changed distractor lets a restatement ship: 3 of 17 dry run drafts restate the source (tA-13, tA-14, course m-10), and the course run's README:80 says m-10 ships for exactly that reason. Source: devils-advocate (MEDIUM-2). Report: agents/devils-advocate.md
MEDIUM-6. `plugins/djinn/CONTRACTS.md:1049` Only an item reworded after the fact check is asked whether a distractor also satisfies the key (also learn-fact-checker.md:172 to 176), and the key reason no longer covers why the other options are wrong (CONTRACTS.md:981 to 985), so a double keyed item ships VERIFIED: tA-20's own note (items-DRAFT.yaml:259 to 263) calls one distractor defensible under a second lecture passage, the check marked the claim VERIFIED as "the lines do not disagree" (verification/tA-03.md:106), and its four rows ship VERIFIED in `train`, the GRPO row paying 0.0 for the defensible option. Source: devils-advocate (MEDIUM-3). Report: agents/devils-advocate.md

### LOW
LOW-1. `tools/check-private.sh:17` The two content patterns match only a secure README's first line and a `.jsonl` row, so a partial copy of a run folder (`input.md`, which holds the source item verbatim, a study sheet, or `items-DRAFT.*`) outside `learn/` and `local/` passes as clean; every learn file carries `learn draft, not yet reviewed`, which the check does not search. Source: security-reviewer (LOW-1), confirmed by bugs-reviewer (LOW-13), integration-reviewer (REC-2, partial copy half). Report: agents/security-reviewer.md
LOW-2. `tools/check-private.sh:29` The content grep excludes `audits/` and checks neither `/home/` nor `content/secure/`, so this round's two privacy leaks (HIGH-1, MEDIUM-1) pass the build; round 1 REC-6 asked for all three shapes and only the first was built. Source: security-reviewer (LOW-2). Report: agents/security-reviewer.md
LOW-3. `tools/check-private.sh:29` `git grep` stderr goes to /dev/null and its exit status is dropped, so a git error reads as `private check: clean`. Source: known-bugchecker (MEDIUM-1, any/tests-and-checks/check-passes-by-not-checking), confirmed by security-reviewer and integration-reviewer (Checked and Clean). Report: agents/known-bugchecker.md
LOW-4. `tools/check-private.sh:21` The pipeline's pipefail status is never read, so a failed `git ls-files` reads as no `learn/` or `local/` files. Source: known-bugchecker (MEDIUM-2, same entry), confirmed by security-reviewer and integration-reviewer (Checked and Clean). Report: agents/known-bugchecker.md
LOW-5. `.djinn/config.yaml:22` Tracked config added in the unpushed b826549 carries absolute home paths (:22, :25, :29, :30), against the scrub rule of 6587f87. Source: security-reviewer (LOW-3). Report: agents/security-reviewer.md
LOW-6. `audits/2026-09-29-1303-custom/synthesis.md:317` (blast radius, outside the fence) The scrubbed round 1 folder still gives item ids with bank file names, the course code, where items sit in their banks, and short quotes of a private secure README (also `agents/security-reviewer.md:15`, `agents/integration-reviewer.md:15`); no key is revealed. Source: security-reviewer (Blast radius LOW-1). Report: agents/security-reviewer.md
LOW-7. `audits/2026-09-27-1655-ideas/agents/gap-hunter.md:194` (blast radius, outside the fence) The 2026-09-25 and 2026-09-27 audits in the unpushed range cite absolute home paths that list Donald's other private project folders. Source: security-reviewer (Blast radius LOW-2). Report: agents/security-reviewer.md
LOW-8. `plugins/djinn/commands/learn.md:513` `option_block` returns on the first `options:` line anywhere in the user message, so a spot-the-mistake excerpt holding an `options:` key fails its row's check. Source: bugs-reviewer (LOW-1). Report: agents/bugs-reviewer.md
LOW-9. `plugins/djinn/commands/learn.md:779` The key position share check fails every file whose keyed rows all have two options and number an odd count of 9 or more, and the rewrite cannot fix it. Source: bugs-reviewer (LOW-2). Report: agents/bugs-reviewer.md
LOW-10. `plugins/djinn/commands/learn.md:649` The 0.8 to 1.25 key length band lives only in the script (:476 to :477); no prompt gives synthesis the bound and the rewrite pass may not reword options, so a short key's rows are dropped while the item stays in `items-DRAFT`. Source: bugs-reviewer (LOW-3). Report: agents/bugs-reviewer.md
LOW-11. `plugins/djinn/commands/learn.md:649` Nothing checks the key-is-the-longest-option trigger of learn-synthesis.md:197; the teaching repo run read the band as the whole rule and skipped it. Source: devils-advocate (LOW-2). Report: agents/devils-advocate.md
LOW-12. `plugins/djinn/commands/learn.md:646` A seed question's rows match `item` equal to `source_id` and skip the key length check, though a seed's options are model drafted. Source: bugs-reviewer (LOW-4). Report: agents/bugs-reviewer.md
LOW-13. `plugins/djinn/agents/learn-synthesis.md:260` Misconception pairs on new items are labeled `<source id>-m<n>` (5 of 11 in the dry runs), so the script's source row skip at learn.md:646 exempts them and a per-item eval files them under the source. Source: devils-advocate (LOW-5). Report: agents/devils-advocate.md
LOW-14. `plugins/djinn/commands/learn.md:445` The recheck spawn has no retry or missing file rule, and a missing or failed recheck fails no item, so reworded items keep their first pass status. Source: bugs-reviewer (LOW-5). Report: agents/bugs-reviewer.md
LOW-15. `plugins/djinn/agents/learn-synthesis.md:465` The rewrite pass says to quarantine a failed item and then to change nothing else, with no file list, so a recheck-failed item can stay in `items-DRAFT.*`, both study sheets and the README counts (also learn.md:810 to 813). Source: bugs-reviewer (LOW-6), confirmed by integration-reviewer (LOW-5). Report: agents/bugs-reviewer.md
LOW-16. `plugins/djinn/commands/learn.md:287` Step 6 writes `<out_dir>/.gitignore` holding `*` into any folder that lacks one, a tracked folder or the repo root included, with no stop; the plan's tracked count (:246) is never read. Source: bugs-reviewer (LOW-8). Report: agents/bugs-reviewer.md
LOW-17. `plugins/djinn/commands/review.md:232` `':!learn'` is fixed text, so a repo whose tracked top-level `learn/` holds its own code or content drops it from every review and dispatch fence with no line saying so. Source: bugs-reviewer (LOW-9). Report: agents/bugs-reviewer.md
LOW-18. `plugins/djinn/CONTRACTS.md:838` The promise that a review naming a learn agent gets a refusal and no report is false: review.md:556 to 557 writes the returned refusal to the report path, and qa/human/learn-leak-guards.md:46 to 47 expects no report. Source: bugs-reviewer (LOW-10), confirmed by integration-reviewer (LOW-1). Report: agents/bugs-reviewer.md
LOW-19. `qa/human/learn-leak-guards.md:23` Step 1's repo a has no sources, so the run stops at `ABORTED step 3b: no sources` (learn.md:159 to 163) before the same repo guard the step is named for. Source: bugs-reviewer (LOW-11), confirmed by integration-reviewer (LOW-3). Report: agents/bugs-reviewer.md
LOW-20. `qa/human/learn-leak-guards.md:40` Step 5 passes with or without `':!learn'` in review.md, because step 4 already made `learn/` ignored. Source: bugs-reviewer (LOW-12). Report: agents/bugs-reviewer.md
LOW-21. `qa/human/learn-leak-guards.md:42` Steps 5 and 6 pass `--base HEAD~1`, which fails review.md's ref pattern at :222 to :228, so both stop at step 3. Source: integration-reviewer (LOW-2). Report: agents/integration-reviewer.md
LOW-22. `plugins/djinn/commands/learn.md:791` The script run, `realpath` at :169 and the probe and run paths at :242 and :289 resolve root-relative paths from the shell's working folder, and no step moves to the root. Source: bugs-reviewer (LOW-14). Report: agents/bugs-reviewer.md
LOW-23. `plugins/djinn/commands/learn.md:244` Four new git calls (:244, :246, :247, :290) lack parts of the section 9 read prefix the Rules require. Source: bugs-reviewer (LOW-15). Report: agents/bugs-reviewer.md
LOW-24. `plugins/djinn/commands/learn.md:254` The plan's Opus run total leaves out the up to `SEED_MAX` seed spawns. Source: bugs-reviewer (LOW-16), confirmed by integration-reviewer (LOW-7). Report: agents/bugs-reviewer.md
LOW-25. `plugins/djinn/README.md:254` The run tree leaves out `study-sheet-release.md`, `plan.md` and `verification/rephrased.md`, and :263 says `rephrased.md` holds the recheck, which lives in `verification/rephrased.md`. Source: bugs-reviewer (LOW-17), confirmed by integration-reviewer (LOW-8). Report: agents/bugs-reviewer.md
LOW-26. `plugins/djinn/commands/learn.md:612` The script reports but never corrects a row's wrong `metadata.secure`, so after a second failed check the mislabeled rows stay and the load recipe keeps them as not secure. Source: bugs-reviewer (LOW-18). Report: agents/bugs-reviewer.md
LOW-27. `plugins/djinn/commands/review.md:357` The tree facts listing `git ls-files -ci --exclude-standard` carries no `':!audits' ':!learn'`, so tracked learn files that later become ignored are written into `tree-facts.md`, paths only. Source: integration-reviewer (LOW-4). Report: agents/integration-reviewer.md
LOW-28. `plugins/djinn/commands/learn.md:159` The Step 3b aborts and `DECLINED at plan` append to `<out_dir>/LEDGER.md` before Step 6 writes `<out_dir>/.gitignore`, so a first run that stops early leaves an unignored ledger. Source: integration-reviewer (LOW-6). Report: agents/integration-reviewer.md
LOW-29. `plugins/djinn/relay.md:247` The learn row of the command table leaves out `--id` and `--secure`. Source: integration-reviewer (LOW-9). Report: agents/integration-reviewer.md
LOW-30. `plugins/djinn/agents/legibility-reviewer.md:110` (blast radius, outside the fence) Says `tree.txt` leaves out only `audits/`; it now leaves out `learn/` too. Source: integration-reviewer (Blast radius LOW). Report: agents/integration-reviewer.md
LOW-31. `plugins/djinn/CONTRACTS.md:934` The naming test covers a key that is a value or a name, so a key that paraphrases one source bullet, set among its neighbor bullets, passes (tA-15). Source: devils-advocate (LOW-1). Report: agents/devils-advocate.md
LOW-32. `plugins/djinn/agents/learn-harder.md:115` The item rules assume the key is the one true option; a spot-the-mistake item keys the planted line, and no rule makes that line match the sound lines in form, so tA-19 carries a test-wise cue. Source: devils-advocate (LOW-3). Report: agents/devils-advocate.md
LOW-33. `plugins/djinn/CONTRACTS.md:1032` Only rationales are measured against the bank's register; stems run 1.6 to 1.8 times the calibration median, and two course items pass the calibration's longest stem. Source: devils-advocate (LOW-4). Report: agents/devils-advocate.md
LOW-34. `audits/2026-09-29-1303-custom/fixes/fix-report.md:135` (blast radius, outside the fence) The fix report's item results do not hold on a regrade: 6 of 10 teaching repo drafts meet the bar (not 9), 1 is vocabulary in effect (not 0), and 3 drafts across both runs restate the source (not 2). Source: devils-advocate (Blast radius LOW-6). Report: agents/devils-advocate.md

### DEBT
DEBT-1. `.djinn/config.yaml:77` Ruling R3, commit every scrubbed audit folder, makes every review that reads a private repo a publication step guarded only by a model's hand scrub, which missed HIGH-1 and MEDIUM-1 this time. Source: security-reviewer (DEBT-1)
DEBT-2. `tools/check-private.sh:17` The banner the check greps is the exact wording of learn-synthesis.md:392, while section 13 fixes only `SECURE SOURCE`; a reword turns off half the check with no error. Source: integration-reviewer (DEBT-1)

### REC
REC-1. security-reviewer: run the three history checks this round could not: a deleted-file listing of 6587f87..HEAD, a stat diff of a4ee7dc against 1e45eb5 outside `audits/`, and a count of private pattern hits in `git log -p 6587f87..HEAD` using a gitignored pattern file.
REC-2. security-reviewer: delete the `backup-learn-before-squash` branch (cb325aa, whose history holds 28e269c with round 1's secure item key fact as a prompt example, the secure bank path and both private repos' layouts) once the squash is confirmed; `git push --all` or `--mirror` would send it.
REC-3. security-reviewer: `tools/check-private.sh` as a `pre-push` hook in this repo, so a hand push is checked too.
REC-4. security-reviewer: `qa/human/learn-leak-guards.md` gains a step that commits a fake run folder under `docs/` in a scratch clone and expects the private check to exit 1 naming both files.
REC-5. security-reviewer: `plugins/djinn/commands/learn.md:86` should say the resolved `out_dir` must equal the root or start with the root plus `/`, so a sibling folder is refused.
REC-6. integration-reviewer: `qa/human/learn-leak-guards.md` walked for the first time after LOW-19 and LOW-21, with a step that reads `study-sheet-release.md` for the source key (MEDIUM-2, MEDIUM-3) and a seed-only topic run over a secure bank (MEDIUM-4).
REC-7. integration-reviewer: `tools/check-private.sh:21` and `:29` exempt all of `plugins/`; exempt only the named prompt files, so a run folder added under `plugins/djinn/` is caught.
REC-8. integration-reviewer: no learn handoff has run as a spawned agent; round 1 REC-1 stands.
REC-9. bugs-reviewer: state the release sheet rule, the key length bound and the recheck failure rule once each in CONTRACTS.md section 13, and have learn.md and learn-synthesis.md point there.

## Conflicts Resolved
- LOW-3 and LOW-4: known-bugchecker filed both MEDIUM, unverified. bugs-reviewer said no erroring input reaches them on the gate path; security-reviewer and integration-reviewer said the mechanism is real and the reach is narrow. The file shows `tools/check-private.sh:29` sends git grep's stderr to /dev/null and drops its status, and `:21`'s pipefail status is never read, so the mechanism is real. It also shows `.djinn/config.yaml:22` runs `cd "$(git rev-parse --show-toplevel)"` and a `git ls-files` under pipefail in the same shell before the script, so a broken git fails the build first. Kept: real, at LOW (see Re-tiered).
- MEDIUM-4: integration-reviewer said MEDIUM, bugs-reviewer said LOW, same mechanism. The file shows the seed block at `plugins/djinn/commands/learn.md:212 to 230` has no `Secure paths:` line while the angle block at `:363 to 365` does, and `plugins/djinn/agents/learn-known.md:39 to 40`, `:94` and `:121 to 123` make the gap reachable in the documented teaching repo shape. Kept: MEDIUM, because it breaks the section 13 promise (`CONTRACTS.md:1338 to 1340`) on a path that ends in rows marked safe to upload.
- MEDIUM-2 and MEDIUM-3: devils-advocate said bugs-reviewer and integration-reviewer missed the practice item path. Not a contradiction. Synthesis read `local/dry-runs/<course>/<run>/study-sheet-release.md`: the misconception table and self check answer 1 carry the source key's reason (MEDIUM-2's mechanism), and practice items 2 to 4 carry the key itself (MEDIUM-3's). Kept: both, as two findings, because the fixes land in different files.
- LOW-34: the fix report counts 9 of 10 teaching drafts meeting the bar and 0 vocabulary; devils-advocate's regrade counts 6 and 1. Grading is judgment, which code cannot settle, but the regrade's two checkable claims hold in the files: the course run README:80 ships m-10 as a key reason restatement, and tA-20's note sits at `items-DRAFT.yaml:259 to 263`. Kept: devils-advocate's numbers, as the independent grader.

## Fix disagreements (human decides)
- HIGH-1 and MEDIUM-1, the history: option A (security-reviewer): amend 1e45eb5 for the round 1 folder and interactively rebase 153ad84 for the 2026-09-27 audits. Option B: scrub the tree, then `git reset --soft 6587f87` and one new commit. Recommendation: B, because all seven commits above 6587f87 are unpushed, and B leaves no pre-scrub blob reachable from the branch without checking each edited commit, including the 2026-09-25 audits in earlier commits (LOW-7).
- MEDIUM-1 going forward: option A (ruling R3 as is, plus LOW-2's pattern pass over `audits/` from a gitignored pattern file). Option B (security-reviewer DEBT-1): for a review whose agents read outside this repo, commit only `synthesis.md`, `findings.json` and the ledger line, and keep `agents/` and `input-diff.patch` under `local/`. Recommendation: B plus A's pattern pass as the backstop, because this round's own reports show a scrub misses lines (Coverage, synthesis noticed).
- LOW-1: option A (security-reviewer, bugs-reviewer): add `learn draft, not yet reviewed` as a third pattern. Option B (integration-reviewer REC-2): add the draft file's `# SECURE SOURCE` and the study sheet's not-for-students line, and exempt only the named prompt files. Recommendation: A, because every learn file carries that one status line; take B's narrower exemption too (REC-7).
- LOW-18: option A: correct CONTRACTS.md:837 to 839 and the qa expectation to say the refusal is recorded as the report. Option B: refuse `learn-` names in review.md's custom list beside proof-runner and fixer. Recommendation: B, which round 1 REC-3 asked for and the fix declined only because the handoff limited review.md edits.
- LOW-9: option A: compare the top share with the best share the option counts allow. Option B: skip the check when any keyed row has two options. Recommendation: A, because it still catches a real imbalance in a file of two-option rows.

## Re-tiered
- LOW-3 was known-bugchecker MEDIUM (floor MEDIUM from the entry's Tier when hit, `~/Conventions/code/known-bugs/any-language/tests-and-checks.md:27`): now LOW because this instance is milder than the entry's: `.djinn/config.yaml:22` changes to the repo root and runs a `git ls-files` under pipefail in the same shell before `tools/check-private.sh`, so a git failure fails the build before the script can misread it, and the check still fails on every pattern hit.
- LOW-4 was known-bugchecker MEDIUM (same entry and floor): now LOW for the same guard at `.djinn/config.yaml:22`.
- MEDIUM-4 includes bugs-reviewer LOW-7: merged into integration-reviewer's MEDIUM after reading `plugins/djinn/commands/learn.md:212 to 230` and `:363 to 365`, and `plugins/djinn/agents/learn-known.md:39 to 40`, `:92 to 95`, `:121 to 123`.
- LOW-1 includes integration-reviewer REC-2 (partial copy half): merged at the defect's tier. The `plugins/` exemption half stays REC-7.

## Dismissed by synthesis
none

## Coverage
- `.claude-plugin/marketplace.json`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `.djinn/config.yaml`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `.gitignore`: covered by known-bugchecker, bugs-reviewer, security-reviewer
- `plugins/djinn/.claude-plugin/plugin.json`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `plugins/djinn/CONTRACTS.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/README.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer
- `plugins/djinn/agents/gate-auditor.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer
- `plugins/djinn/agents/learn-asked.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/agents/learn-fact-checker.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/agents/learn-harder.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/agents/learn-known.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `plugins/djinn/agents/learn-prepare.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `plugins/djinn/agents/learn-synthesis.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/agents/proof-runner.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer
- `plugins/djinn/commands/dispatch.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `plugins/djinn/commands/learn.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/commands/review.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `plugins/djinn/relay.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer
- `plugins/djinn/templates/config.yaml`: covered by known-bugchecker, bugs-reviewer, integration-reviewer
- `qa/human/learn-leak-guards.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `tools/check-private.sh`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- Agents missing: none
- Round 1 has no `findings.json`: open list rebuilt from prose.
- Round 1 LOWs, checked in this round after their fix landed: all 30 RESOLVED, none carried open. LOW-14, LOW-25 and the example half of LOW-28 closed with the example folders; the rest at the lines the fix report names, read by synthesis or confirmed in a reviewer's Checked and Clean (LOW-6 at `plugins/djinn/commands/learn.md:682 to 688`, LOW-7 at `:388 to 392`, LOW-8 at `:221`, `:361`, `:407`, `:455`, LOW-23 at `:307`, LOW-24 at `plugins/djinn/agents/learn-synthesis.md:332 to 334`, LOW-29 at `plugins/djinn/agents/learn-asked.md:53 to 59`). LOW-11's rung count, `check.txt` and `usage.md` are fixed; the three files the fix added are missing from the same tree, which is R2 LOW-25. LOW-21's harm is closed by the agent side refusal; the contract sentence about it is R2 LOW-18. LOW-28's dedupe rule now exists and is too narrow, which is R2 MEDIUM-5.
- Synthesis noticed, unreviewed: this round's own reports carry private items and need the same scrub before this folder is committed: `audits/2026-09-29-1428-custom/agents/integration-reviewer.md:81` names a secure bank file; `agents/bugs-reviewer.md:38` repeats HIGH-1's ratio; `agents/devils-advocate.md:33 to 43` and other reports use full course item ids whose prefix names the field of work; `agents/integration-reviewer.md:65 to 66` and `:77 to 83`, `agents/security-reviewer.md:51` and `:111 to 113`, and `agents/devils-advocate.md:14` and `:193 to 194` name both private repos. Also `audits/2026-09-29-1303-custom/fixes/fix-report.md:131` carries a full course item id, which MEDIUM-1's list does not name.
- Synthesis noticed, unreviewed: the tag `djinn--v2.1.0` points at ad1fa28 (`.git/refs/tags/djinn--v2.1.0:1`), which the reflog does not show; whether it sits inside the pushed range was not checked.
- Synthesis noticed, unreviewed: this round's `input-diff.patch` was not read by synthesis.

## Fence
- Files synthesis read: `audits/2026-09-29-1428-custom/fence.txt`, `audits/2026-09-29-1428-custom/context.md`, the five reports in `audits/2026-09-29-1428-custom/agents/`, `plugins/djinn/CONTRACTS.md`, `plugins/djinn/agents/learn-synthesis.md`, `plugins/djinn/agents/learn-known.md` (lines 20 to 129), `plugins/djinn/agents/learn-prepare.md` (lines 35 to 69), `plugins/djinn/agents/learn-harder.md` (lines 30 to 199), `plugins/djinn/agents/learn-asked.md` (lines 15 to 124), `plugins/djinn/agents/learn-fact-checker.md` (lines 155 to 184), `plugins/djinn/commands/learn.md` (lines 150 to 819), `plugins/djinn/commands/review.md` (lines 550 to 559), `plugins/djinn/commands/review.md` and `plugins/djinn/commands/dispatch.md` (grep count of `':!learn'`), `plugins/djinn/README.md` (grep), `tools/check-private.sh`, `.djinn/config.yaml`, `.gitignore`, `.claude-plugin/marketplace.json`. Outside the fence, each cited by a reviewer: `audits/2026-09-29-1303-custom/synthesis.md`, `audits/2026-09-29-1303-custom/fixes/fix-report.md`, `audits/2026-09-29-1303-custom/agents/security-reviewer.md` (lines 1 to 30), `audits/2026-09-27-1655-ideas/agents/gap-hunter.md` (lines 1 to 30), `plugins/djinn/agents/data-contract-reviewer.md` (lines 205 to 212), `.git/logs/HEAD`, `.git/refs/heads/backup-learn-before-squash`, `.git/refs/remotes/origin/Claude-Development-djinn-relay`, `.git/refs/tags/djinn--v2.1.0`, `.git/config`, a Glob of `.git/refs/` and `.git/packed-refs`, a Glob of `docs/`, a Glob of `local/dry-runs/`, `local/dry-runs/<course>/<run>/input.md`, `local/dry-runs/<course>/<run>/study-sheet-release.md`, `local/dry-runs/<course>/<run>/README.md` (lines 70 to 89), `local/dry-runs/<teaching>/<run>/items-DRAFT.yaml` (lines 255 to 266), `local/dry-runs/<teaching>/<run>/verification/tA-03.md` (lines 104 to 107), and the known-bugs detail file `~/Conventions/code/known-bugs/any-language/tests-and-checks.md` (grep of its Tier when hit lines).
- Reviewer reads outside the fence:
  - known-bugchecker: fifteen known-bugs detail files under `~/Conventions/code/known-bugs/` (index detail file)
  - bugs-reviewer: none reported
  - integration-reviewer: `plugins/djinn/commands/brief.md` (ledger and fence reads)
  - integration-reviewer: `plugins/djinn/commands/status.md` (ledger read only)
  - integration-reviewer: `plugins/djinn/agents/legibility-reviewer.md` (tree.txt description)
  - integration-reviewer: the teaching repo's `.djinn/config.yaml`, `tests/quiz-yaml.test.mjs`, `package.json`, `tools/check_voice.py` (target repo checks)
  - integration-reviewer: one secure bank of the teaching repo, grep only (bank shape; its file name is withheld here)
  - integration-reviewer: the course repo's `content/schema/quiz.md` and `tests/content.test.mjs` (real quiz schema)
  - security-reviewer: `audits/2026-09-29-1303-custom/` (unpushed range, dispatch asked)
  - security-reviewer: `audits/2026-09-25-*` and `audits/2026-09-27-*`, grep and three reads (privacy sweep)
  - security-reviewer: `docs/` grep (privacy sweep)
  - security-reviewer: `.git/logs/HEAD`, `.git/refs/remotes/origin/Claude-Development-djinn-relay`, `.git/refs/heads/backup-learn-before-squash`, `.git/config`, `.git/index` grep (pushed and tracked state)
  - security-reviewer: `plugins/djinn/agents/data-contract-reviewer.md` grep (prompt names work repo)
  - security-reviewer: two secure banks of the teaching repo, line ranges, and a count-only grep of its secure folder (verify residue and the fix report sentence; file names withheld)
  - devils-advocate: every file of both dry runs under `local/dry-runs/` (regrade)
  - devils-advocate: `audits/2026-09-29-1303-custom/fixes/fix-report.md` and `audits/2026-09-29-1303-custom/agents/devils-advocate.md` (claims under regrade, round 1 grades)
  - devils-advocate: the teaching repo's secure bank and the course repo's calibration quiz (calibration sets)
  - devils-advocate: four lecture files and `docs/ITEM-WRITING.md` of the teaching repo, one sources file of the course repo (spot checks, writing rules)
  - devils-advocate: `~/Conventions/voice/ITEM-WRITING.md` (writing rule grep)
  - devils-advocate: `git log backup-learn-before-squash` (when the rules changed)

## Counts
HIGH 1, MEDIUM 6, LOW 34, DEBT 2, REC 9

## Verdict: FIX THEN SHIP
Blocking: HIGH-1, MEDIUM-1, MEDIUM-2, MEDIUM-3, MEDIUM-4, MEDIUM-5, MEDIUM-6. HIGH-1 and MEDIUM-1 sit outside the fence in tracked audit files and block any push of this public repo until the unpushed range 6587f87..HEAD is scrubbed and rewritten.
