---
title: synthesis, audits/2026-09-29-1654-custom (round 3 of audits/2026-09-29-1303-custom)
author: Claude Opus 5.5 (synthesis)
date: 2026-09-29
status: agent output, not yet deliberated
---

This file is written for a public repo. It quotes no private item text, no
option property, no bank file name, no private repo or workplace name and
no private project name. The two round 3 dry run folders are written
`local/dry-runs/round-3/<teaching>/<run>/` and
`local/dry-runs/round-3/<course>/<run>/`, because their real names carry
private words. Teaching drafts are T1 to T7 and course drafts C1 to C5, as
devils-advocate numbers them. `~` is the home folder.

# For Donald, in plain words

**Verdict: FIX THEN SHIP.** No HIGH. Ten MEDIUM block the merge. One of
them, MEDIUM-1, also blocks the push of this public repo.

**Round 2, checked in the files at HEAD 9298889.** The round 2 HIGH and all
six round 2 MEDIUM are fixed as written: I read each fix in its file, not
in the fix report. None regressed. Of the 34 round 2 LOWs, 33 are fixed.
One is not: LOW-6, the scrubbed round 1 audit folder still carries private
course pointers (a bare practice quiz number, and two lecture paths whose
names give the course's field). The caution: three harms came back after
their text fix landed, all through the same door. The release sheet still
leaked in the one secure run after the fix, spot-the-mistake items still
carry a cue, and one restatement slipped through. Each fix was a new
sentence that the agent who writes an item then checks against its own
item. That is part (b).

## (a) What still blocks a push

1. **MEDIUM-1, three private project names in the collapsed commit.**
   - What. Developer version:
     `audits/2026-09-27-1931-custom/fixes/CALIBRATION-REPORT.md:208 to 209`
     names three private project folders from your home folder, and
     `audits/2026-09-27-1655-ideas/agents/gap-hunter.md:50` repeats one of
     them. None is on `local/private-patterns.txt`, so
     `tools/check-private.sh` reads clean. I confirmed the four
     occurrences on those three lines and nowhere else in the tree. Plain
     version: the scrub list missed three of your project names, so the
     check that trusts the list cannot see them.
   - How it plays out. Someone opens the 09-27 calibration report on
     GitHub, reads two project names that state your professional field,
     and reads your full name in `.claude-plugin/marketplace.json:5`.
   - Why it matters. Both files are new in this push: both audits are
     dated after 6587f87, the last public commit. You ruled this class
     never ships; it is the list's "other private project folders" group.
     No key and no credential, so MEDIUM and not HIGH.
   - Suggestion, the exact fix, in this order:
     1. Replace the four occurrences with "a private project", the
        placeholder style the same line already uses for the others.
     2. Add the three names to `local/private-patterns.txt` (REC-8).
     3. Before you commit this audit folder, move
        `audits/2026-09-29-1654-custom/input-diff.patch` to `local/`, or
        replace its removed side with a one line redaction marker as the
        1303 patch did (LOW-22). It holds the 26 already public hit lines
        of 6587f87, and while it sits unignored the pre-push hook refuses
        every push, this one included.
     4. Same pass, cheap, not blocking: reword
        `audits/2026-09-29-1303-custom/fixes/fix-report.md:158 to 161` to
        "the first check failed on the source rows; the script now skips
        rows built on a bank's own source question" (LOW-21), and scrub the
        round 1 folder's bare quiz number, lecture paths and two word
        subject (round 2 LOW-6, listed in security-reviewer's Blast radius
        LOW-1).
     5. Amend 9298889, which is unpushed. Run `bash tools/check-private.sh`
        and the log check in its header over `6587f87..HEAD`; both must
        read 0 hits. Run the checks in REC-6, then push the branch by name
        only.

   Not verified by any reviewer or by me this round: that the working tree
   equals 9298889 (nobody ran `git status`), and where the tag
   `djinn--v2.1.0` points. REC-6 gives the commands.

   MEDIUM-2 and MEDIUM-3 do not block this push: the pattern list exists
   in this clone, and the range is one commit whose tree is the tree the
   hook checks. They are the guard for every later push; see (c).

## (b) Item quality

devils-advocate regraded both round 3 dry runs with its own reads and
recounts, not the fix report's. Across 12 drafts: 5 meet the bar, 4 are
near, 3 fall short. The fix report said 9 of 12. Vocabulary in effect: 0
of 12. Restatements: 1 (T7).

| round | meet the bar (independent regrade) | fix report said | vocabulary | restatements | DPO bad student | release sheet |
|-------|-------------------------------------|-----------------|------------|--------------|-----------------|---------------|
| 1 | 6 of 19 | 9 of 10 on one run | 9 of 19 | 2 | 28 of 28 | none built |
| 2 | 12 of 17 | 9 of 10, 6 of 7 | 1 of 17 | 3 of 17 | 49 of 49 | course leaks |
| 3 | 5 of 12 (4 near) | 9 of 12 | 0 of 12 | 1 of 12 | 29 of 38 | teaching leaks, course empty |

devils-advocate says round 3's drop from round 2 is partly its stricter
read: round 2 did not open sibling banks or look for planted line cues.
Read round 2's way, round 3 is 6 or 7 of 12, about half.

**The diagnosis.** What a script or a required field enforces converges.
Vocabulary went 9, 1, 0 once the naming test and the rung rules landed.
Length tells are gone on all 12 drafts, because the script fails them.
Misconception labels hold, 10 of 10. What the authoring agent reads in its
own output does not converge:

- The planted line rule was added after round 2 found a cue on 1 of 2
  spot-the-mistake items. Round 3 finds one on 2 of 2 (MEDIUM-10; I
  checked the teaching instance).
- The release sheet went from leaking to leaking or empty (MEDIUM-5,
  DEBT-2).
- Misplaced DPO pairs regressed, from 49 of 49 reading as the bad student
  to 29 of 38 overall, with 3 pairs whose rejected answer is correct
  (MEDIUM-9).
- The fix report's own grade runs 3 or 4 items high, every round (LOW-24).

Each rule added in rounds 2 and 3 is a sentence the same agent that wrote
the item then reads against the item.

**devils-advocate's one recommended change: a blind reader.** After
synthesis, a separate fact checker run gets each item's stem and shuffled
options with no key, no notes and no sources. It names the option a
test-wise reader would pick, the cue that picks it, and whether the stem
alone makes two options right. Then it gets only the release sheet and the
source question without its key, and tries to answer the source. An item
the blind read keys by a named cue, or calls two keyed, fails like a
failed recheck, and so does every release item the blind answer leans on.

**DESIGN DECISION for you.**

- **Option A, the blind reader as a new step.** By devils-advocate's hand
  application it catches T6, T7, C3, C4 and the teaching release leak:
  4 of the 7 items below the bar, plus the leak, plus round 2's tA-19.
  Cost: one more Opus run per learn run, in the recheck slot that already
  exists. Limit: it only sees what it is handed, so it cannot catch an item
  that copies a bank nobody read (T1, T5, C2). It is the same model with a
  different instruction and none of the author's notes: independent in
  what it knows, not in how it reasons.
- **Option B, the blind reader plus a sibling bank read.** A, plus the
  dedupe and leak step reading every bank in the input's folder and its
  sibling modules, or every bank sharing the input item's topic tag
  (MEDIUM-8). That adds T1, T5 and C2, so all 7 items below the bar are
  caught by one of the two. Cost: more reading per angle, a change to the
  `item_shape` discovery rule, and in a repo with secure banks the agents
  open more secure files, which needs DEBT-1 settled first (any agent that
  opens a secure file makes the run secure).
- **Option C, keep adding rules.** Cheapest per change, no new step. Three
  rounds of data say it does not hold: every rule the author checks
  against itself has slipped at least once after it landed.

**Recommendation: B, built A first.** A is the single change that catches
the most, and it gives the pipeline a grader that is not the author, which
also answers LOW-24's over-grading. The sibling read then closes the three
items A cannot see by construction. Whatever you pick, rerun a secure dry
run before 2.4.0 is published (REC-1): the paraphrase test (d) has never
run.

## (c) The rest

2. **MEDIUM-2 and MEDIUM-3, the push guard checks less than it says.**
   - What. Developer version: with `local/private-patterns.txt` missing,
     `tools/check-private.sh:128 to 130` warns on stderr and still ends
     `private check: clean` with exit 0 (MEDIUM-2).
     `tools/pre-push.sh:13` reads none of the refs git hands a pre-push
     hook and checks the working tree, not the commits being pushed
     (MEDIUM-3). Plain version: on a second machine the check says clean
     without checking your private words, and on this machine it checks
     your folder, not what you are about to publish.
   - How it plays out. Round 2 was exactly the second case: 1204 private
     hits in the history and 0 in the tree. Without the collapse, a plain
     `git push` would have passed the hook.
   - Why it matters. It is the one automatic gate between a hand scrub and
     the public remote.
   - Suggestion. Fail on a missing list unless an opt out variable is set.
     Have the hook read its stdin and grep the added lines and commit
     messages of `<remote sha>..<local sha>`, plus the tree passes at the
     pushed sha.
3. **MEDIUM-4, a learn run that stops early writes into a folder git may
   track.**
   - What. Developer version: the ledger rule (`learn.md:928 to 934`)
     writes `<out_dir>/.gitignore` holding `*` and a ledger line on every
     early stop, and every stop except Step 5's comes before Step 5's
     tracked files check. Step 1's stop writes `learn/LEDGER.md` by name.
     Plain version: a typo in an item id, in a repo whose own `learn/`
     folder holds code, drops a file there that hides every new file from
     git and switches off review of that folder.
   - How it plays out. `/djinn:learn content/quizzes/week-3.yaml` with an
     id the file lacks. The run stops at Step 2. `learn/.gitignore` now
     reads `*`; your next new lesson file under `learn/` never reaches
     `git add -A`, and every later `/djinn:review` leaves `learn/` out of
     its fence.
   - Why it matters. It breaks two written promises
     (`CONTRACTS.md:1407 to 1411`, and section 4's fence rule), silently.
   - Suggestion. Move the tracked files probe to Step 1; any stop before
     it prints its ledger line instead of writing. QA step 1, which
     expects the `.gitignore`, changes with it (REC-3).
4. **MEDIUM-6, the release sheet drops the VERIFIED or UNVERIFIED word.**
   The allow list (`CONTRACTS.md:1436 to 1441`) names the stem, options and
   answer, not the status word, and says anything unnamed stays out. So
   the one file you may hand to students carries unchecked facts
   unmarked. Suggestion: name the status word in the allow list and in
   `learn-synthesis.md:394 to 395`.
5. **MEDIUM-7, the double key rule fires on a word.** A note that calls a
   distractor "also right" makes the item double keyed whatever the check
   finds (`learn-fact-checker.md:120 to 122`), but every home note says
   where the option IS right, and every spot-the-mistake distractor is a
   line that is in fact fine. T6 was held back from VERIFIED and from
   `grpo.jsonl` for a word. Suggestion: fire only when the note says the
   option answers this stem; homes are written "right for <other
   question>".
6. **MEDIUM-9, misplaced DPO pairs have nothing to draw from.** The pair
   must move a distractor into another option's home "from learn-known's
   table", and that table covers only the source question. On new items
   synthesis improvised: 5 of 14 pairs are nonsense and in 3 the rejected
   answer is correct, all in `train`. A model trained on them learns to
   reject a right answer. Suggestion: take the home from a named
   misconception or the item's pull line, skip the pair when there is
   none, and have the script check that the one changed clause is another
   option's home clause, byte for byte.
7. **Not blocking.** 24 LOW, 2 DEBT, 9 REC. Two need you: DEBT-2 (a
   secure run's release sheet is empty or one item by construction; a new
   rung drawn from the distractors' homes, or say plainly that a secure
   source yields no release sheet) and REC-5 (6587f87 is already public
   with 26 lines naming private projects and the employer's industry; a
   force-push alone does not remove them from GitHub). My recommendation on
   REC-5 is under Fix disagreements.

---

scope: custom (round 3)
agents expected: known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
agents received: known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
agents missing: none
changed files in fence: 39

## Round 2 status

No `fixes/<id>.diff` files exist for round 2: the fixes landed as commits
2f17d2d, 625811b and 58ec848, later collapsed with the rest of the range
into 9298889, with `audits/2026-09-29-1428-custom/fixes/fix-report.md`
beside them. Each row was verified by reading the file at HEAD, not the fix
report. A row is RESOLVED when the mechanism the finding named is gone
from the file; where the same harm came back through a different mechanism,
the row says so and names the round 3 finding that carries it.

| Prior id | Status | evidence file:line |
|----------|--------|--------------------|
| HIGH-1 | RESOLVED | `audits/2026-09-29-1303-custom/fixes/fix-report.md:148 to 161`: the ratio row and the property sentence are gone. A residue at `:158 to 161` is R3 LOW-21. |
| MEDIUM-1 | RESOLVED | `audits/2026-09-29-1303-custom/agents/security-reviewer.md:16 to 23` and `audits/2026-09-27-1655-ideas/agents/gap-hunter.md:14 to 28` use placeholders; `plugins/djinn/agents/data-contract-reviewer.md:207 to 213` describes the example by kind; security-reviewer's 43 pattern sweep reads 0 hits in the tree, and synthesis's grep of this round's reports reads 0. `.claude-plugin/marketplace.json:5` keeps the full name by choice (fix report "Needs round 3" item 7). Three names the list never held are R3 MEDIUM-1, a different mechanism. |
| MEDIUM-2 | RESOLVED | `plugins/djinn/agents/learn-synthesis.md:389 to 415` builds from an empty file and bars maps, misconceptions, analogies, plan steps, self checks and owner notes; `plugins/djinn/CONTRACTS.md:1431 to 1461`. The missing status word is R3 MEDIUM-6. |
| MEDIUM-3 | RESOLVED | `plugins/djinn/agents/learn-asked.md:87 to 95`, `plugins/djinn/agents/learn-harder.md:119 to 126` define both directions and always weigh the source; `plugins/djinn/agents/learn-synthesis.md:122 to 129` makes edges symmetric and adds missed ones. The harm recurred in the one run after the fix, through the author not applying the rule: T4's comment reads `leaks with: none` (`local/dry-runs/round-3/<teaching>/<run>/items-DRAFT.yaml:91`) and T6's omits the source (`:127`). That is R3 MEDIUM-5. |
| MEDIUM-4 | RESOLVED | `plugins/djinn/commands/learn.md:231 to 236` gives the seed block the secure paths and the never quote sentence; `:247 to 252` flips the run secure on `secure: yes` or no line and reruns the ignore check. The folder name gap is R3 LOW-7. |
| MEDIUM-5 | RESOLVED | `plugins/djinn/CONTRACTS.md:957 to 969`; `plugins/djinn/agents/learn-synthesis.md:97 to 104` ("Distractors and homes never enter this test"). A restatement that passed by naming a same-fact claim id is R3 LOW-19. |
| MEDIUM-6 | RESOLVED | `plugins/djinn/agents/learn-fact-checker.md:108 to 122` asks every item; `plugins/djinn/commands/learn.md:439 to 440` puts it in the spawn prompt; it caught T1. Over-firing on a note's wording is R3 MEDIUM-7. |
| LOW-1 | RESOLVED | `tools/check-private.sh:44` and `:99` grep the draft status. The shape attribution case is R3 LOW-11. |
| LOW-2 | RESOLVED | `tools/check-private.sh:112` (home paths, `audits/` included) and `:138` (pattern list over `.`); the pattern list holds the secure bank file names (read by synthesis, not named here). Pass 2's `audits/` exclusion is R3 LOW-14. |
| LOW-3 | RESOLVED | `tools/check-private.sh:69 to 79`, every caller sets `failed` on 2 (`:102`, `:114`, `:140`). |
| LOW-4 | RESOLVED | `tools/check-private.sh:82 to 86`. |
| LOW-5 | RESOLVED | `.djinn/config.yaml:25`, `:28`, `:32 to 33` write `~`; synthesis's grep for a home path finds none outside `local/`. |
| LOW-6 | NOT RESOLVED | The scrubbed round 1 folder still names a practice quiz by its bare number and gives lecture paths whose names state the course's field: `audits/2026-09-29-1303-custom/agents/devils-advocate.md:184 to 186` (read by synthesis), and the lines security-reviewer lists in its Blast radius LOW-1. Same folder, same mechanism; carried here rather than filed again. |
| LOW-7 | RESOLVED | No home path in the tree (synthesis grep, `local/` excluded). The bare project names left behind are R3 MEDIUM-1. |
| LOW-8 | RESOLVED | `plugins/djinn/commands/learn.md:550 to 553` takes the last `Options:` line. |
| LOW-9 | RESOLVED | `plugins/djinn/commands/learn.md:867`. |
| LOW-10 | RESOLVED | `plugins/djinn/commands/learn.md:469 to 470`; `plugins/djinn/agents/learn-synthesis.md:221 to 233`. |
| LOW-11 | RESOLVED | `plugins/djinn/commands/learn.md:699 to 700`. |
| LOW-12 | RESOLVED | `plugins/djinn/commands/learn.md:693 to 694`. The prompt row contract mismatch is R3 LOW-1. |
| LOW-13 | RESOLVED | `plugins/djinn/commands/learn.md:852 to 857`; `plugins/djinn/agents/learn-synthesis.md:292 to 296`; devils-advocate reads 10 of 10. |
| LOW-14 | RESOLVED | `plugins/djinn/commands/learn.md:492 to 496`. |
| LOW-15 | RESOLVED | `plugins/djinn/commands/learn.md:906 to 913`; `plugins/djinn/agents/learn-synthesis.md:531 to 540`. |
| LOW-16 | RESOLVED | `plugins/djinn/commands/learn.md:269 to 275` stops a tracked `out_dir` before Step 6. The early stops that still write there are R3 MEDIUM-4. |
| LOW-17 | RESOLVED | `plugins/djinn/commands/review.md:221 to 226`. The common marker file is R3 LOW-13. |
| LOW-18 | RESOLVED | `plugins/djinn/commands/review.md:179 to 184`. The valid name list is R3 LOW-16. |
| LOW-19 | RESOLVED | `qa/human/learn-leak-guards.md:18 to 19`. |
| LOW-20 | RESOLVED | `qa/human/learn-leak-guards.md:66 to 68`. |
| LOW-21 | RESOLVED | `qa/human/learn-leak-guards.md:70 to 72`. The missing `base_branch` is R3 LOW-9. |
| LOW-22 | RESOLVED | `plugins/djinn/commands/learn.md:144 to 152`, `:879 to 883`. |
| LOW-23 | RESOLVED | `plugins/djinn/commands/learn.md:148`, `:150`, `:264 to 266`, `:319` carry the full prefix. |
| LOW-24 | RESOLVED | `plugins/djinn/commands/learn.md:282`. |
| LOW-25 | RESOLVED | `plugins/djinn/README.md:270 to 276`. |
| LOW-26 | RESOLVED | `plugins/djinn/commands/learn.md:792 to 799`, `:833 to 839`. |
| LOW-27 | RESOLVED | `plugins/djinn/commands/review.md:370`. |
| LOW-28 | RESOLVED | `plugins/djinn/commands/learn.md:928 to 931` writes the `.gitignore` before the ledger. Writing it on every early stop feeds R3 MEDIUM-4. |
| LOW-29 | RESOLVED | `plugins/djinn/relay.md:247`. |
| LOW-30 | RESOLVED | `plugins/djinn/agents/legibility-reviewer.md:109 to 113`. |
| LOW-31 | RESOLVED | `plugins/djinn/CONTRACTS.md:941 to 950`; devils-advocate reads 0 of 12 vocabulary. |
| LOW-32 | RESOLVED | `plugins/djinn/CONTRACTS.md:991 to 996`, `plugins/djinn/agents/learn-harder.md:73 to 76` now state the rule. Nothing checks it, and the cue recurred on 2 of 2: R3 MEDIUM-10. |
| LOW-33 | RESOLVED | `plugins/djinn/agents/learn-synthesis.md:173 to 178`; devils-advocate finds every over-long stem says why. |
| LOW-34 | RESOLVED | The round 1 fix report carries the regrade (round 2 fix report LOW-34). The round 2 report over-grades again: R3 LOW-24. |

## Fix List

### HIGH
none

### MEDIUM
MEDIUM-1. `audits/2026-09-27-1931-custom/fixes/CALIBRATION-REPORT.md:208` (blast radius, outside the fence) Three private project folder names that `local/private-patterns.txt` does not list ship in the collapsed commit 9298889: two at :208 to :209 and one, repeated, at `audits/2026-09-27-1655-ideas/agents/gap-hunter.md:50`; two of them state Donald's professional field, beside his full name at `.claude-plugin/marketplace.json:5`, and `tools/check-private.sh` passes them because the list lacks them. Source: security-reviewer (Blast radius MEDIUM-1 (PERSONAL)). Report: agents/security-reviewer.md
MEDIUM-2. `tools/check-private.sh:128` With `local/private-patterns.txt` missing (any other clone, or after `git clean -X`), pass 4 is skipped with a warning on stderr (:129 to :130), `failed` stays 0, and the script prints `private check: clean` and exits 0 (:152 to :156), so `build_cmd` (`.djinn/config.yaml:25`) and the pre-push hook (`tools/pre-push.sh:13`), which both act on the exit status alone, pass a tree carrying every private word. Source: security-reviewer (MEDIUM-1), confirmed by bugs-reviewer (LOW-9) and integration-reviewer (LOW-1). Report: agents/security-reviewer.md
MEDIUM-3. `tools/pre-push.sh:13` The pre-push hook reads none of the ref lines git writes to its stdin and execs a check whose every pass greps the working tree (`tools/check-private.sh:71`), so a push whose commits carry a private word that a later scrub commit removed from the tree passes, the state round 2 actually reached (1204 hit lines in `git log -p`, 0 in the tree, `audits/2026-09-29-1428-custom/fixes/fix-report.md:110` to `:112` and `:147` to `:148`). Source: bugs-reviewer (MEDIUM-2), confirmed by security-reviewer (LOW-1). Report: agents/bugs-reviewer.md
MEDIUM-4. `plugins/djinn/commands/learn.md:928` The ledger rule writes `<out_dir>/.gitignore` holding `*` and appends `<out_dir>/LEDGER.md` on every early stop except Step 5's, so an unknown item id (:112 to :114), a missing `--sources` path (:120 to :122), `ABORTED step 3b: no sources` (:167 to :169) or `input outside this repo` (:181 to :184) writes into an `out_dir` the Step 5 tracked files check (:269 to :275) would refuse, and Step 1's abort appends to `learn/LEDGER.md` by name (:91 to :94) against the Rules line (:966 to :968); in a repo whose tracked `learn/` holds its own files the `*` hides every new file there from `git add`, and the marker turns on the review and dispatch learn skip (`plugins/djinn/commands/review.md:221` to `:226`), breaking `plugins/djinn/CONTRACTS.md:1407` to `:1411`. Source: integration-reviewer (MEDIUM-1), confirmed by bugs-reviewer (MEDIUM-3). Report: agents/integration-reviewer.md
MEDIUM-5. `plugins/djinn/agents/learn-synthesis.md:405` Release test (d), the paraphrase read, is one reading by the agent that wrote the items, with no second reader and no mechanical check, and it has never run: the only secure dry run after the round 2 fixes (written at 625811b, before 58ec848 added (d)) kept three practice items on its release sheet from which a student can infer the source key (`local/dry-runs/round-3/<teaching>/<run>/study-sheet-release.md:37`, `:49`, `:53`), and the QA step greps key terms only (`qa/human/learn-leak-guards.md:51` to `:52`). Source: security-reviewer (MEDIUM-2), confirmed by devils-advocate (Release sheets, three items). Report: agents/security-reviewer.md
MEDIUM-6. `plugins/djinn/CONTRACTS.md:1436` The release sheet's allow list (:1436 to :1441, with "anything not named here stays out" at :1433 to :1434) and `plugins/djinn/agents/learn-synthesis.md:391` to `:395` do not name the item's status word, which the study sheet's answer carries (learn-synthesis.md:374 to :375), so an UNVERIFIED practice item reaches the one student-facing file unmarked, against CONTRACTS.md:1053 to :1055 and learn-synthesis.md:83. Source: bugs-reviewer (MEDIUM-1). Report: agents/bugs-reviewer.md
MEDIUM-7. `plugins/djinn/agents/learn-fact-checker.md:120` An item whose own note calls a distractor "defensible, arguable or also right" is double keyed whatever the check finds (also CONTRACTS.md:1014 to :1016, learn-synthesis.md:131 to :135), while learn-harder has every spot-the-mistake distractor name a line that is in fact fine (learn-harder.md:110 to :111) and every home note name the question the option IS right for (:136 to :137), so a sound item ships UNVERIFIED and leaves `grpo.jsonl`: the round 3 teaching run's spot-the-mistake draft, T6, was held back by a word in its own note. Source: bugs-reviewer (MEDIUM-4), confirmed by devils-advocate (T6). Report: agents/bugs-reviewer.md
MEDIUM-8. `plugins/djinn/CONTRACTS.md:915` Discovery sets `item_shape` to the input file plus schema docs and tests (:915 to :918), so "every question bank the item shape names" in the dedupe and leak step (learn-asked.md:47 to :56, learn-harder.md:91 to :98) is one file and a sibling bank on the same fact set is never read: the course run wrote again a sibling module's item on the same key reason and two of its three homes, with `leaks with: none` (C2), and the teaching run wrote beside a second secure bank holding at least five items on the source's key reason, one whose key takes the side of T1's defensible distractor. Source: devils-advocate (MEDIUM-1). Report: agents/devils-advocate.md
MEDIUM-9. `plugins/djinn/agents/learn-synthesis.md:297` A `misplaced` DPO pair must move a distractor into another option's home "from learn-known's table" (also CONTRACTS.md:1182 to :1184), but that table places only the source question's options (learn-known.md:163), so a new item has no table to draw from: in the round 3 runs 12 of 14 misplaced pairs had none, 5 of the 14 are nonsense and in 3 the rejected answer is correct, all split `train`, so a trainer learns to reject a correct answer. Source: devils-advocate (MEDIUM-2). Report: agents/devils-advocate.md
MEDIUM-10. `plugins/djinn/CONTRACTS.md:994` A planted line must match the sound lines "in length, form, specificity and qualifiers" (:994 to :996, learn-harder.md:73 to :76), but the only check anyone runs on it is the length band (learn-synthesis.md:232 to :233 writes `longest: no, ratio`), and 2 of 2 round 3 spot-the-mistake drafts carry a surface cue a test-wise reader uses without the fact (property withheld; synthesis confirmed the teaching instance). Source: devils-advocate (MEDIUM-3). Report: agents/devils-advocate.md

### LOW
LOW-1. `plugins/djinn/CONTRACTS.md:1114` The contract exempts from the key length rule only a source row whose `source_ref` is a `path:line`, while the script (`plugins/djinn/commands/learn.md:693` to `:694`) and its prose (:891 to :894) exempt any `source_ref` other than `seed`, so a pasted question's own row passes the script and fails the contract; the contract line is the stale side. Source: bugs-reviewer (LOW-1), confirmed by integration-reviewer (LOW-4). Report: agents/bugs-reviewer.md
LOW-2. `plugins/djinn/agents/learn-fact-checker.md:116` The ambiguous stem rule makes the stem "the second citation", but the stem lives in an angle file inside the run folder, which is on the never list, and :130 forbids citing one. Source: bugs-reviewer (LOW-2). Report: agents/bugs-reviewer.md
LOW-3. `plugins/djinn/agents/learn-fact-checker.md:192` Recheck question 2 reads every option only against the key's new wording, never against the stem or the cited key reason and home lines that step 6 reads, so a distractor lengthened for the length rule can become right under the stem's case and pass. Source: bugs-reviewer (LOW-3). Report: agents/bugs-reviewer.md
LOW-4. `plugins/djinn/CONTRACTS.md:1119` The recheck covers a changed key or option only, while synthesis rewrites stems into the stem range after the fact check (learn-synthesis.md:176 to :178), so a rewritten stem never meets the double key read that now reads stems. Source: devils-advocate (LOW-2). Report: agents/devils-advocate.md
LOW-5. `plugins/djinn/agents/learn-synthesis.md:405` The release sentence read checks a practice item against "the claim the source key rests on", singular (also CONTRACTS.md:1446 to :1449), though step 1 collects terms for every source question in the run (:398 to :399), so in a whole-bank secure run an item can paraphrase another source question's key reason and stay on the sheet. Source: bugs-reviewer (LOW-4). Report: agents/bugs-reviewer.md
LOW-6. `plugins/djinn/CONTRACTS.md:1452` Source key terms are words of four letters or more, so a key made of a number with its unit or a short acronym yields no term and test (b) checks nothing for that source. Source: bugs-reviewer (LOW-5). Report: agents/bugs-reviewer.md
LOW-7. `plugins/djinn/commands/learn.md:231` The seed, angle and fact checker blocks paste only `learn.secure_paths` (:231, :392, :437), while Step 3b and CONTRACTS.md:1384 to :1385 also count any folder named `secure`, and the command never applies that test to `item_shape` files, so a seed that reads a secure item shape bank decides the run's secure mark by its own `secure:` line alone (learn-known.md:103 to :110, learn.md:247 to :252). Source: bugs-reviewer (LOW-6), confirmed by integration-reviewer (LOW-3) and security-reviewer (LOW-3). Report: agents/bugs-reviewer.md
LOW-8. `plugins/djinn/agents/learn-synthesis.md:377` The study sheet's last section is headed "For the owner, remove before release" and says the sheet "is released by cutting this section", with no secure run exception, while CONTRACTS.md:1431 to :1432 says the release form is never made by cutting the study sheet. Source: bugs-reviewer (LOW-7). Report: agents/bugs-reviewer.md
LOW-9. `qa/human/learn-leak-guards.md:17` The setup gives repo b a config holding only a `learn` block, and `/djinn:review` stops at `ABORTED step 1: no config` without `base_branch` (review.md:33 to :36), so steps 8 and 9 never reach the fence or the step 2 refusal they test. Source: bugs-reviewer (LOW-8). Report: agents/bugs-reviewer.md
LOW-10. `tools/check-private.sh:4` The header says the check stops round 2's secure item answer tell, but a tell written under a pseudonymous id carries no private word and no home path, and pass 2 exempts `audits/` (:97), so no pass can match one. Source: bugs-reviewer (LOW-10). Report: agents/bugs-reviewer.md
LOW-11. `plugins/djinn/CONTRACTS.md:541` Section 7 says every learn file carries `learn draft, not yet reviewed`, but section 13 has `items-DRAFT.*` use the shape's own status word when the shape has an attribution block (:1079 to :1082, learn-synthesis.md:159 to :164), so that file can carry none of the three marks `tools/check-private.sh:42` to `:44` greps. Source: bugs-reviewer (LOW-11). Report: agents/bugs-reviewer.md
LOW-12. `plugins/djinn/README.md:235` The README sums the release test up as no leak with the source and none of the source key's words, leaving out (c) the new fact and (d) the sentence read (CONTRACTS.md:1442 to :1456), which is the part the owner relies on when deciding what to hand out. Source: bugs-reviewer (LOW-12), confirmed by integration-reviewer (LOW-7) and security-reviewer (LOW-5). Report: agents/bugs-reviewer.md
LOW-13. `plugins/djinn/commands/review.md:221` The learn skip marker includes `learn/.gitignore`, a file many code folders track, so a repo whose tracked `learn/` holds code and its own `.gitignore` still gets `':!learn'` on every listing (also dispatch.md:184, CONTRACTS.md:180). Source: integration-reviewer (LOW-2). Report: agents/integration-reviewer.md
LOW-14. `.djinn/config.yaml:93` project_notes says the check greps `audits/` for the learn marks outside the files that define them, but pass 2 excludes `audits/` (`tools/check-private.sh:97`), as the script's own header says (:11 to :13). Source: integration-reviewer (LOW-5). Report: agents/integration-reviewer.md
LOW-15. `.djinn/config.yaml:25` `build_cmd` is a plain YAML scalar holding a colon and a space, so any YAML parser rejects the file; no command parses it today. Source: integration-reviewer (LOW-6). Report: agents/integration-reviewer.md
LOW-16. `plugins/djinn/commands/review.md:186` On an unknown custom list name the command lists every file in `agents/` as valid, the six learn agents included, which :179 to :184 refuse at the same step. Source: integration-reviewer (LOW-8). Report: agents/integration-reviewer.md
LOW-17. `tools/check-private.sh:60` The home path pattern matches only `/home/<lowercase user>/`, not a WSL Windows profile path, a macOS `/Users/<name>/` or a capitalized user name; nothing leaks today. Source: security-reviewer (LOW-2). Report: agents/security-reviewer.md
LOW-18. `plugins/djinn/commands/learn.md:281` In a secure run the plan withholds the key but still prints the first words of the secure stem (:294 withholds only the key), to a terminal the same step calls possibly shared. Source: security-reviewer (LOW-4). Report: agents/security-reviewer.md
LOW-19. `plugins/djinn/agents/learn-synthesis.md:97` The restatement test runs as a presence check on the `new fact` id: T7's new fact is the source key's own claim cited from a second line under another id, and it passed. Source: devils-advocate (LOW-1). Report: agents/devils-advocate.md
LOW-20. `audits/2026-09-29-1428-custom/fixes/fix-report.md:25` (blast radius, outside the fence) The round 2 fix report says the private check now makes "the next tell of this kind" fail the build; no pass matches a prose tell under a pseudonymous id (LOW-10). Source: bugs-reviewer (Blast radius LOW). Report: agents/bugs-reviewer.md
LOW-21. `audits/2026-09-29-1303-custom/fixes/fix-report.md:158` (blast radius, outside the fence) The paragraph round 2 left at :156 to :161 still says why the teaching source's own rows failed the first check, which, read beside `audits/2026-09-29-1428-custom/synthesis.md:39` to `:41`, narrows the property round 2 HIGH-1 removed; the alias maps to no real item on any public line, so the harm needs a second leak. Source: security-reviewer (Blast radius LOW-2). Report: agents/security-reviewer.md
LOW-22. `audits/2026-09-29-1654-custom/input-diff.patch:142` (blast radius, outside the fence) This round's untracked patch holds all 26 pattern-hit lines of the already public 6587f87 on its removed side, so committing this folder as it stands (ruling R3) republishes them in the next push, and while it sits unignored the pre-push hook fails every push. Source: security-reviewer (Blast radius LOW-3). Report: agents/security-reviewer.md
LOW-23. `local/dry-runs/round-3/` (blast radius, outside the fence) Both round 3 dry runs, with their secure source items, keys and derived rows, and the round 1 runs under `local/examples/`, sit inside this public repo's working tree, held back by `.gitignore:5` alone. Source: security-reviewer (Blast radius LOW-4). Report: agents/security-reviewer.md
LOW-24. `audits/2026-09-29-1428-custom/fixes/fix-report.md:137` (blast radius, outside the fence) The round 2 fix report over-grades the round 3 dry runs for the third round running: 9 of 12 meet the bar against an independent regrade of 5 of 12 (4 near), 0 restatements against 1, and two leaking release items against three. Source: devils-advocate (Blast radius LOW-3). Report: agents/devils-advocate.md

### DEBT
DEBT-1. `plugins/djinn/commands/learn.md:392` Two rules govern one exposure: in a run that is not secure, angle agents read secure item shape banks under a never quote rule and write rows marked `secure: no`, while a seed that reads the same bank flips the run secure (:247 to :252); section 13 should state one rule. Source: security-reviewer (DEBT-1)
DEBT-2. `plugins/djinn/CONTRACTS.md:1442` The release sheet is built only from items written on the source's fact set, and the release test excludes items on the source's fact set, so a secure run's sheet is empty or one item by construction (course run 0 of 5 kept on rule (b) alone; teaching run 1 of 4 survives (d) applied by hand); a new rung drawn from the distractors' homes, or a plain statement that a secure source yields no release sheet, is Donald's scope call. Source: devils-advocate (DEBT-1)

### REC
REC-1. bugs-reviewer: have each secure run's README print passed and kept-off counts per release test, and rerun a secure dry run after 58ec848 before 2.4.0 is published (round 2 "Needs round 3" item 2).
REC-2. integration-reviewer: add a "Working on this repo" part to `plugins/djinn/README.md` (or a root CONTRIBUTING.md): make `local/private-patterns.txt`, link `tools/pre-push.sh` as the hook, and say what `PRIVATE WORDS NOT CHECKED` means; a committed `core.hooksPath` instruction makes the hook one command per clone.
REC-3. integration-reviewer: `qa/human/learn-leak-guards.md` gains a step for MEDIUM-4 (a scratch repo with a tracked `learn/` code folder, a run with an id the bank lacks, nothing written under `learn/`, then `/djinn:review` records `learn_skip: none` and fences a change under `learn/`), and step 1's expectation of a `learn/.gitignore` changes with the fix.
REC-4. integration-reviewer: the recheck prompt (`plugins/djinn/commands/learn.md:480` to `:490`) carries no `Secure paths:` line where Step 8's does; add it for parity.
REC-5. security-reviewer: 6587f87, already public, holds 26 lines naming private project folders, one Claude Code project folder that spells the home user name, and two that name the employer's industry beside the workplace product; a force-push alone does not remove them, because GitHub keeps old commits fetchable by SHA, so if the employer must not be guessable the choices are to delete and recreate the GitHub repository with a scrubbed history, or to force-push and file a GitHub Support purge request.
REC-6. security-reviewer: before the push, run what no reviewer could: `git status --porcelain` (expect only this round's untracked folder), `git log -p --format=%B 6587f87..HEAD` through the filtered pattern file on added and message lines (expect 0), `git merge-base --is-ancestor djinn--v2.1.0 6587f87` and `git ls-remote --tags origin` for the tag, and `ls -l tools/pre-push.sh`; push the branch by name only; once the backup bundles are verified, expire the reflog, delete ORIG_HEAD and prune.
REC-7. security-reviewer: grep a pasted stem against every bank under a secure path and mark the run secure on a match, as topic mode already greps banks (`plugins/djinn/commands/learn.md:124` to `:125`, `:196` to `:200`).
REC-8. security-reviewer: add MEDIUM-1's three names and a bare practice quiz number form to `local/private-patterns.txt`, and diff a listing of the home folder against the list now and then.
REC-9. devils-advocate: add a blind read to the recheck slot (`plugins/djinn/CONTRACTS.md:1119`), run by the fact checker after synthesis: the stem and shuffled options with no key, notes or sources, naming the option a test-wise reader picks, its cue, and whether the stem makes two options right; then the release sheet and the source question without its key, answered cold. In round 3 it catches T6, T7, C3, C4 and the teaching release leak. This is the design decision in part (b) of the summary.

## Conflicts Resolved
- MEDIUM-2: security-reviewer said MEDIUM; bugs-reviewer (LOW-9) and integration-reviewer (LOW-1) said LOW because the skip prints a reason in capitals, the known-bugs entry's own prevention. The file shows the warning goes to stderr only (`tools/check-private.sh:129 to 130`), `failed` is never set, and the last line is `private check: clean` with exit 0 (`:152 to 156`); `.djinn/config.yaml:25` runs it last under `&&` and `tools/pre-push.sh:13` execs it, so both callers decide on the exit status. Kept: MEDIUM, the entry's Tier when hit (`~/Conventions/code/known-bugs/any-language/tests-and-checks.md:27`), because the prevention is "fails or skips with a reason" and this skip reports `clean` to every caller that decides.
- MEDIUM-3: bugs-reviewer said MEDIUM at the same entry's floor; security-reviewer said LOW because the header documents the tree-only scope (`tools/pre-push.sh:5 to 6`). The file shows no stdin read (`:12 to 13`) and a tree-only grep (`tools/check-private.sh:71`); the round 2 fix report shows the state it misses did occur (`audits/2026-09-29-1428-custom/fixes/fix-report.md:110 to 112` against `:147 to 148`). A documented gap is still a gap on the one automatic gate before a public push. Kept: MEDIUM.
- MEDIUM-5: security-reviewer said test (d) has never run and the only secure run leaked; devils-advocate said (d) applied by hand drops all three leaking items. Not a contradiction: both are true. The file shows (d) at `plugins/djinn/agents/learn-synthesis.md:405 to 408` as a reading by the same agent, with no second reader. Kept: MEDIUM, with devils-advocate's count of three leaking lines (the fix report counted two).
- Item grades: the round 2 fix report says 9 of 12 drafts meet the bar; devils-advocate says 5 of 12. Grading is judgment, but the regrade's checkable claims hold in the files: T4's comment reads `leaks with: none` (`local/dry-runs/round-3/<teaching>/<run>/items-DRAFT.yaml:91`), T6's leak line omits the source (`:127`), and T6's planted line differs from the sound lines in one surface property (`:133`, property withheld). Kept: devils-advocate's numbers, as the independent grader (LOW-24).

## Fix disagreements (human decides)
- MEDIUM-2: option A (security-reviewer): set `failed=1` on a missing list unless the caller sets `PRIVATE_CHECK_ALLOW_MISSING=1`, and print `clean` only when all four passes ran. Option B (bugs-reviewer, integration-reviewer): fail only under the hook, and in the build end with `clean except private words NOT CHECKED`. Recommendation: A, because every caller acts on the exit status and a word on a line no gate reads changes nothing.
- MEDIUM-3: option A (bugs-reviewer): read the stdin refs, grep the added lines of `git log -p` over each range, and run the tree passes against the pushed sha. Option B (security-reviewer): grep the added lines and the commit messages over each range, and keep the working tree check beside it. Recommendation: B with A's pushed sha tree pass, because a commit message can carry a word too and the working tree is not what a push sends.
- MEDIUM-5: option A (security-reviewer): drop any practice item whose claims cite a line the source key reason cites, then a `MODE: release` pass by the fact checker. Option B (devils-advocate, REC-9): the blind read, answering the source cold from the release sheet. Recommendation: B, with A's shared citation drop as the mechanical part, because the blind answer is the one test that does not depend on the author's reading; this is the part (b) decision.
- MEDIUM-10: option A (devils-advocate): a script check that fails a planted line that alone carries a word from a fixed cue list (negation, absolute, hedge, justification clause). Option B: the blind read (REC-9). Recommendation: B, with A as a cheap backstop, because a fixed word list misses a cue it does not name.
- DEBT-1: option A: any agent that opens a file under a secure path makes the run secure. Option B: `item_shape` may not name a secure bank in a run that is not secure; the command substitutes the schema doc and the test. Recommendation: A, because it is the rule seeds already follow, and option B of part (b) needs it.
- DEBT-2: option A: release items drawn from the distractors' homes, written as their own rung. Option B: a secure source yields no release sheet, and the plan says so. Recommendation: B until the blind read exists, because the one release sheet built with practice items leaked.
- REC-5, the public history of 6587f87: option A: delete and recreate the GitHub repository and push a scrubbed history, after checking for forks and stars. Option B: force-push and file a GitHub Support request to purge cached views and dangling commits. Option C: leave it. Recommendation: A, if the employer must not be guessable: the branch has one pushed tip and a 17 day history, and the industry lines narrow the employer.

## Re-tiered
- MEDIUM-2 includes bugs-reviewer LOW-9 and integration-reviewer LOW-1: merged up to MEDIUM after reading `tools/check-private.sh:128 to 156`, `.djinn/config.yaml:25` and `tools/pre-push.sh:13`. Not moved below the known-bugs floor (MEDIUM): the capitals warning at `:129 to 130` is on stderr and both callers act on the exit status, so this instance is not milder than the entry's.
- MEDIUM-3 includes security-reviewer LOW-1: merged up to MEDIUM after reading `tools/pre-push.sh:12 to 13` and `tools/check-private.sh:71`, at the floor bugs-reviewer cited.
- MEDIUM-4 includes bugs-reviewer MEDIUM-3: same file, same mechanism, integration-reviewer's text kept for its fuller trace.
- LOW-1 includes integration-reviewer LOW-4; LOW-7 includes integration-reviewer LOW-3 and security-reviewer LOW-3; LOW-12 includes integration-reviewer LOW-7 and security-reviewer LOW-5: merged at the same tier.
- security-reviewer Blast radius LOW-1 is recorded as the evidence that round 2 LOW-6 is NOT RESOLVED, not as a new finding: same folder, same mechanism.

## Dismissed by synthesis
none

## Coverage
- `.claude-plugin/marketplace.json`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `.djinn/config.yaml`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `.gitignore`: covered by known-bugchecker, integration-reviewer, security-reviewer
- `_FromClaude/APPLY-BRIEF.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/PROMPT-REVIEW-BRIEF.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-breaker.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-bugs-reviewer.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-cmd-brief.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-cmd-review.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-dependency-reviewer.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-integration-reviewer.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-known-bugchecker.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-multiuser-reviewer.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-perf-reviewer.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-pipe-connector.md`: covered by known-bugchecker, security-reviewer
- `_FromClaude/prompt-review-security-reviewer.md`: covered by known-bugchecker, security-reviewer
- `docs/carried-findings.md`: covered by known-bugchecker, security-reviewer
- `docs/session-log-2026-09-12.md`: covered by known-bugchecker, security-reviewer
- `plugins/djinn/.claude-plugin/plugin.json`: covered by known-bugchecker, integration-reviewer, security-reviewer
- `plugins/djinn/CONTRACTS.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/README.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `plugins/djinn/agents/data-contract-reviewer.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `plugins/djinn/agents/gate-auditor.md`: covered by known-bugchecker, integration-reviewer, security-reviewer
- `plugins/djinn/agents/learn-asked.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/agents/learn-fact-checker.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/agents/learn-harder.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/agents/learn-known.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `plugins/djinn/agents/learn-prepare.md`: covered by known-bugchecker, integration-reviewer, security-reviewer
- `plugins/djinn/agents/learn-synthesis.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/agents/legibility-reviewer.md`: covered by known-bugchecker, integration-reviewer, security-reviewer
- `plugins/djinn/agents/proof-runner.md`: covered by known-bugchecker, integration-reviewer, security-reviewer
- `plugins/djinn/commands/dispatch.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `plugins/djinn/commands/learn.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate
- `plugins/djinn/commands/review.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `plugins/djinn/relay.md`: covered by known-bugchecker, integration-reviewer, security-reviewer
- `plugins/djinn/templates/config.yaml`: covered by known-bugchecker, integration-reviewer, security-reviewer
- `qa/human/learn-leak-guards.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `tools/check-private.sh`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- `tools/pre-push.sh`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer
- Agents missing: none
- The prior round has a `findings.json`, so the open list is carried, not rebuilt. Every round 2 LOW was checked this round, since every round 2 fix landed.
- Synthesis noticed, unreviewed: `qa/human/learn-leak-guards.md:27 to 29` (step 1) expects the cross-repo abort to write `learn/.gitignore`, which is MEDIUM-4's behavior written down as correct; the QA step must change with the fix (REC-3).
- Synthesis noticed, unreviewed: a grep of this round's folder against `local/private-patterns.txt` finds hits only in `input-diff.patch` (26 lines, LOW-22); the five reports read clean. MEDIUM-1's three names are not on the list, and a separate grep finds them in no report of this round.
- Synthesis noticed, unreviewed: whether the working tree equals 9298889, and where the tag `djinn--v2.1.0` points, were checked by nobody this round (security-reviewer had no Bash). REC-6.

## Fence
- Files synthesis read: `audits/2026-09-29-1654-custom/fence.txt`, `audits/2026-09-29-1654-custom/context.md`, the five reports in `audits/2026-09-29-1654-custom/agents/`, `plugins/djinn/CONTRACTS.md`, `plugins/djinn/commands/learn.md`, `plugins/djinn/agents/learn-synthesis.md`, `plugins/djinn/agents/learn-fact-checker.md` (lines 85 to 209), `plugins/djinn/agents/learn-harder.md` (lines 60 to 219), `plugins/djinn/agents/learn-asked.md` (lines 44 to 98), `plugins/djinn/agents/learn-known.md` (grep), `plugins/djinn/agents/legibility-reviewer.md` (lines 108 to 114), `plugins/djinn/agents/data-contract-reviewer.md` (lines 203 to 214), `plugins/djinn/commands/review.md` (lines 14 to 38, 175 to 229, and a grep of the learn skip listings), `plugins/djinn/relay.md` (grep), `plugins/djinn/README.md` (lines 228 to 277), `qa/human/learn-leak-guards.md`, `tools/check-private.sh`, `tools/pre-push.sh`, `.djinn/config.yaml`. Outside the fence, each cited by a reviewer: `audits/2026-09-29-1428-custom/synthesis.md`, `audits/2026-09-29-1428-custom/findings.json`, `audits/2026-09-29-1428-custom/fixes/fix-report.md`, `audits/2026-09-29-1303-custom/fixes/fix-report.md` (lines 148 to 163), `audits/2026-09-29-1303-custom/agents/security-reviewer.md` (lines 12 to 25), `audits/2026-09-29-1303-custom/synthesis.md` (lines 312 to 337), `audits/2026-09-29-1303-custom/agents/devils-advocate.md` (lines 182 to 186), `audits/2026-09-27-1655-ideas/agents/gap-hunter.md` (lines 12 to 29 and 47 to 52), `audits/2026-09-27-1931-custom/fixes/CALIBRATION-REPORT.md` (lines 204 to 211), `local/private-patterns.txt`, a Glob of `local/dry-runs/round-3/`, `local/dry-runs/round-3/<teaching>/<run>/items-DRAFT.yaml` (lines 86 to 147), `~/Conventions/code/known-bugs/any-language/tests-and-checks.md` (grep of the entry and its tier); a repo-wide grep for a home path (`local/` excluded), a repo-wide grep for MEDIUM-1's three names (`local/` excluded), and a grep of this audit folder against the pattern list.
- Reviewer reads outside the fence:
  - known-bugchecker: fifteen known-bugs detail files under `~/Conventions/code/known-bugs/` (index detail file)
  - known-bugchecker: `audits/2026-09-29-1428-custom/agents/known-bugchecker.md` (prior round's id scheme)
  - known-bugchecker: repo-wide grep lines from unfenced agent and `_FromClaude/` files and `tools/render_html.py`, discarded, files not opened
  - bugs-reviewer: `audits/2026-09-29-1303-custom/fixes/fix-report.md` (confirm round 2 HIGH-1 scrub)
  - bugs-reviewer: `~/Conventions/code/known-bugs/any-language/tests-and-checks.md` (entry tier, grep only)
  - bugs-reviewer: `local/` (Glob only, ignore behavior)
  - bugs-reviewer: cites `audits/2026-09-29-1428-custom/fixes/fix-report.md` and `plugins/djinn/commands/brief.md` without listing them as outside reads
  - integration-reviewer: `plugins/djinn/commands/status.md` (grep, learn skip reach)
  - integration-reviewer: `plugins/djinn/commands/brief.md` (grep, config and git reads)
  - integration-reviewer: `.git/hooks/pre-push` (is the hook installed)
  - integration-reviewer: `~/Conventions/code/known-bugs/any-language/tests-and-checks.md` (entry tier)
  - integration-reviewer: `audits/2026-09-29-1428-custom/synthesis.md`, `fixes/fix-report.md`, `input-diff.patch` (round 2 findings, fix claims, scrub comparison)
  - integration-reviewer: Globs of the repo root and `**/README*` (no file under `local/` opened)
  - security-reviewer: `.git/refs/`, `.git/packed-refs`, `.git/HEAD`, `.git/logs/HEAD` and two ref reflogs, `.git/ORIG_HEAD`, `.git/COMMIT_EDITMSG`, `.git/config`, `.git/config.worktree`, `.git/info/exclude`, `.git/hooks/pre-push`, a Glob of `.git/hooks/` and `.git/objects/` (what a push can send)
  - security-reviewer: `~/.gitconfig`, `~/.config/git/ignore` (followTags, hook path)
  - security-reviewer: `local/private-patterns.txt` (the pattern list)
  - security-reviewer: both round 3 dry run folders under `local/dry-runs/round-3/` and the round 1 teaching run's `input.md` under `local/examples/` (release sheet judgment, residue check)
  - security-reviewer: `audits/LEDGER.md` and every folder under `audits/` except this round's, grep plus reads (push content sweep)
  - security-reviewer: a Glob of `~` for `CLAUDE.md` and `.git/HEAD` (private folder names to grep)
  - security-reviewer: `~/Conventions/code/AUTOMATION.md` and two known-bugs detail files, grep only (confirm a project name)
  - devils-advocate: every file of both round 3 dry runs (regrade)
  - devils-advocate: `audits/2026-09-29-1428-custom/fixes/fix-report.md`, `audits/2026-09-29-1428-custom/agents/devils-advocate.md`, `audits/2026-09-29-1303-custom/agents/devils-advocate.md` (claims under regrade, prior grades)
  - devils-advocate: the teaching repo's input secure bank, a second secure bank and two lecture files (calibration, sibling overlap, claim spot checks)
  - devils-advocate: the course repo's calibration quiz, input module quiz, three sibling module quizzes and its one source doc (calibration, dedupe, sibling overlap, claim spot checks)

## Counts
HIGH 0, MEDIUM 10, LOW 24, DEBT 2, REC 9
Open across rounds: HIGH 0, MEDIUM 10, LOW 25 (round 2 LOW-6, not resolved, plus this round's 24).

## Verdict: FIX THEN SHIP
Blocking: MEDIUM-1 to MEDIUM-10. MEDIUM-1 sits outside the fence in two tracked audit files new to the collapsed commit 9298889 and blocks any push of this public repo until the names are replaced and the commit amended; LOW-22 (this round's patch) must be moved or redacted before this folder is committed, or the pre-push hook refuses the push.
