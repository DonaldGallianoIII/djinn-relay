---
title: security-reviewer report, audits/2026-09-29-1654-custom
author: Claude Opus 5.5 (security-reviewer)
date: 2026-09-29
status: audit finding, not yet deliberated
---

This report is written into a public repo. It cites files and lines only.
It quotes no private course text, no key or key property, no bank or quiz
title, no private project or workplace name, and no home path. `~` is the
home folder. `<teaching>` and `<course>` stand for the two dry run folders
under `local/dry-runs/round-3/`, and `<run>` for a run folder, because
those folder names carry private words.

No `## Round 2 status` section: CONTRACTS.md section 3 gives prior-finding
status to synthesis alone, and CONTRACTS.md wins over the agent prompt.

Tool limit, said plainly: this agent has Read, Grep, Glob and Write, and no
Bash. I did not run `git log -p 6587f87..HEAD`, `git branch -a`,
`git tag -l` or `git stash list`. I read the same facts from `.git/`
directly (refs, packed-refs, reflogs, ORIG_HEAD, COMMIT_EDITMSG, config,
the hook) and swept the working tree, which at HEAD 9298889 is the whole
added side of `6587f87..HEAD` because the range is one commit. Two things
that sweep cannot see are listed in REC-2 with the command that closes
each: an uncommitted edit that makes the tree differ from 9298889, and the
target of the tag.

## The answers to the four questions

1. **The would-be push.** Every tracked or unignored file, hidden folders
   included, was grepped with all 43 patterns (case-insensitive) and then
   by hand for what the list misses. The pattern list finds 0 hits in the
   tree 9298889 carries. Its only hits are in this round's own untracked
   `input-diff.patch` (Blast radius LOW-3), which the collapsed commit does
   not hold. The commit message (`.git/COMMIT_EDITMSG:1 to 26`) is clean.
   Judgment beyond the list found three private project names (Blast
   radius MEDIUM-1), a bare quiz number and a private lecture layout (Blast
   radius LOW-1), and one qualitative residue of round 2's key tell (Blast
   radius LOW-2). No secure item text, no key, no credential and no home
   path is in the push. Nothing rises to HIGH.
2. **Refs and objects.** One local branch
   (`.git/refs/heads/Claude-Development-djinn-relay:1`, 9298889), one
   remote-tracking ref (`.git/refs/remotes/origin/Claude-Development-djinn-relay:1`,
   6587f87), one tag (`.git/refs/tags/djinn--v2.1.0:1`, ad1fa28), an empty
   `.git/packed-refs`, no `refs/stash` and no stash reflog, no worktrees,
   and the backup branch is gone (no ref, no reflog). 9298889's parent is
   6587f87 (`.git/logs/HEAD:27 to 28`), so the push is a fast-forward. A
   plain `git push origin Claude-Development-djinn-relay` sends the branch
   ref and the objects reachable from 9298889 that are not reachable from
   6587f87. The pre-collapse commits are reachable only from the reflogs
   and `ORIG_HEAD` (`.git/ORIG_HEAD:1`, ef199bd, the old tip); neither is
   a ref a push sends, so they stay local. No tag goes with it: neither
   `.git/config` nor `~/.gitconfig` sets `push.followTags`. ad1fa28 exists
   as a loose object and appears in no reflog, so it is most likely an
   annotated tag object; its target was not verified (REC-2).
3. **The learn safeguards.** The source repo check, `out_dir` inside the
   repo, the secure flag on rows and the seed block's secure paths hold as
   written (Checked and Clean). Two gaps: `tools/check-private.sh` passes,
   and says `clean`, when the pattern list is missing (MEDIUM-1), and the
   release sheet's paraphrase test has never run while the one secure dry
   run's release sheet lets a student infer the source key (MEDIUM-2). The
   round 3 dry runs wrote into djinn-relay's `local/`, so none of the
   out_dir, same-repo or ignore guards was exercised by them.
4. **6587f87.** Covered in REC-1: 26 already public lines name private
   projects, a Claude Code project folder carrying the home user name, and
   the employer's industry beside the workplace project. A history rewrite
   is worth it only as a delete-and-recreate of the repository or with a
   GitHub purge, not as a plain force-push.

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `tools/check-private.sh:128` With `local/private-patterns.txt` missing, pass 4 is skipped, the script still prints `private check: clean` and exits 0, so the build gate and the pre-push hook both pass a tree carrying every private word.
Mechanism: the list is gitignored (`.gitignore:5`), so it is missing on every other clone (the owner's second machine, a fresh clone after a repository rebuild) and after any `git clean -X` here, which deletes ignored files. The skip writes two lines to stderr and never sets `failed`. Nothing downstream reads stderr: `build_cmd` and git's hook runner read only the exit status. Known-bugs entry "A check that passes by not checking" (any-language tests-and-checks), Tier when hit MEDIUM; the entry allows a skip with a reason for a missing fixture, but this script turns the skip into the word `clean` and a zero exit on the one gate that stands between a hand scrub and a public push (project_notes, round 2 fix-up: the pattern pass is "the gate a scrub must clear").
Traced: `tools/check-private.sh:123 to 127` (list lookup, main worktree fallback), `:128 to 130` (stderr only, `failed` untouched), `:152` (`failed` is 0), `:156` (`private check: clean`, exit 0). Callers: `.djinn/config.yaml:25` (`bash tools/check-private.sh` last in `build_cmd`, which gates every dispatch batch) and `tools/pre-push.sh:13` (`exec`, so its status is the hook's). `qa/human/learn-leak-guards.md:79 to 88` always copies the list into the scratch clone, so no step exercises the missing case.
Fix: at `:128`, set `failed=1` and print `private check: FAIL, <list> missing` unless the caller sets `PRIVATE_CHECK_ALLOW_MISSING=1`, and print `clean` only when all four passes ran. Add a step to `qa/human/learn-leak-guards.md` that runs the check in a scratch clone with no list and expects exit 1.

MEDIUM-2. `plugins/djinn/agents/learn-synthesis.md:405` The release sheet's paraphrase test is one prose reading by the agent that wrote the items; it has never run, and the only secure dry run's release sheet lets a student answer the source item.
Mechanism: `study-sheet-release.md` is the one file the owner is told he may hand to students. Test (d) (`CONTRACTS.md:1446 to 1452`, `learn-synthesis.md:405 to 408`) asks synthesis to read every sentence of every kept item against the source key reason. Nothing checks that reading: no second agent, no claim or citation rule, and the QA step greps only the key terms (`qa/human/learn-leak-guards.md:51 to 52`), which a paraphrase does not carry by definition. The round 3 teaching run (written against 625811b, before 58ec848 added (d)) kept four practice items; a quoted log line in one stem gives the source's key reason as a stated fact and its answer never disputes it, and two answers state the same fact from the other side. A student who reads the sheet can pick the secure item's key. The fixer's own report records the failure and that (d) was not rerun (`audits/2026-09-29-1428-custom/fixes/fix-report.md:266 to 269`).
Traced: source key reason in `local/dry-runs/round-3/<teaching>/<run>/input.md:26`; the leaking lines at `local/dry-runs/round-3/<teaching>/<run>/study-sheet-release.md:37`, `:49` and `:53`; the README's term list at `README.md:90` holds none of them, so the term test passed (`README.md:58`). `plugins/djinn/README.md:235 to 237` still describes the release test as leak edges plus key words only. The course run's sheet is empty (`local/dry-runs/round-3/<course>/<run>/study-sheet-release.md:10`), which is safe.
Fix: make the release test mechanical where it can be and independent where it cannot. In synthesis, drop any practice item whose claims cite a source line that the source key reason's claim cites (the same `path:line`, or an overlapping `a to b` span). Then send the kept items to learn-fact-checker in a `MODE: release` pass that reads each sentence against the source's key and key reason and fails any it could infer them from; the release sheet holds only items that pass both.

### LOW
LOW-1. `tools/pre-push.sh:13` The hook checks the working tree, never the commits being pushed.
Mechanism: git hands a pre-push hook `<local ref> <local sha> <remote ref> <remote sha>` on stdin; the hook reads none of it. A private line scrubbed in the tree but not amended into the commit pushes clean. The reverse also bites: an untracked, unignored file that is not being pushed fails the push, as this round's own `input-diff.patch` will today (Blast radius LOW-3). The header documents the tree-only scope (`:5 to 6`), so this is a coverage gap, not a false claim.
Traced: `tools/pre-push.sh:12 to 13` execs the tree check; `tools/check-private.sh:71` greps `--untracked` over the tree. The hook is installed: `.git/hooks/pre-push` resolves to this file's text.
Fix: in the hook, for each stdin line, grep the added lines and the messages of `<remote sha>..<local sha>` (`git log -p --format=%B`, lines starting `+` plus the message lines) with the same filtered pattern file, and fail on a hit or a missing list; keep the tree check beside it.

LOW-2. `tools/check-private.sh:60` The home path pattern matches only `/home/<lowercase user>/`.
Mechanism: this owner works in WSL, where a Windows profile path (`/mnt/c/Users/<name>/`, `C:\Users\<name>\`) is the likeliest home path to leak, and a macOS `/Users/<name>/` or a capitalized user name also passes.
Traced: Grep of the tree for those forms finds only a generic hypothetical at `audits/2026-09-27-1931-custom/agents/security-reviewer.md:72`, so nothing leaks today; the pattern at `:60` cannot see one.
Fix: widen `HOME_PATH` to `(/home/[^/[:space:]]+/|/Users/[^/[:space:]]+/|/mnt/[a-z]/Users/[^/[:space:]]+/|[A-Za-z]:\\\\Users\\\\)`, case-insensitive.

LOW-3. `plugins/djinn/commands/learn.md:247` A seed run's secure mark rests only on the seed agent's own `secure:` line, though the command already holds the fact that decides it.
Mechanism: the item shape list the seed block hands over (`:237`) is the file the seed agent is told it may open for form (`plugins/djinn/agents/learn-known.md:106 to 110`). In the documented teaching repo shape that file is a bank under a secure path (`CONTRACTS.md:896 to 898`). An agent that opens it and writes `secure: no` leaves the run `secure=no`, and every row carries `secure: no`, which the load recipe keeps for upload (`CONTRACTS.md:1270`). The gap needs the model to misreport, so it is not rated higher.
Traced: `learn.md:231 to 236` (the self-report instruction), `:247 to 252` (the only flip), `:187 to 192` (the Step 3b test, never applied to item shape paths).
Fix: in Step 4, before any seed is spawned, apply Step 3b's secure test to every `item_shape` path; any hit marks the run secure with the reason `item shape <path> is secure`.

LOW-4. `plugins/djinn/commands/learn.md:281` A secure run's plan withholds the key but prints the first words of the secure stem to a terminal the same step calls possibly shared (`:294 to 295`).
Mechanism: a secure item's stem is part of the item; the round 3 teaching plan printed its opening words (`local/dry-runs/round-3/<teaching>/<run>/context.md:56`).
Traced: `learn.md:281` (the line format), `:294` (only the key is withheld).
Fix: in a secure run print `stem: withheld (secure)` beside `key: withheld (secure)`.

LOW-5. `plugins/djinn/README.md:235` The README tells the owner the release test is "no leak with the source in either direction and none of the source key's words", leaving out the paraphrase clause the contract adds.
Mechanism: the owner decides what to hand to students from this paragraph; a reader who trusts it runs the term search (as the QA step does) and hands out a sheet like the one in MEDIUM-2.
Traced: `README.md:235 to 237` against `CONTRACTS.md:1442 to 1452`.
Fix: add "and no sentence from which the source's key or key reason can be inferred" and point at section 13.

### DEBT
DEBT-1. `plugins/djinn/commands/learn.md:392` Two rules govern one exposure. In a run that is not secure, angle agents read secure item shape banks (for form and to dedupe) and write items and rows marked `secure: no`, guarded only by "never quote or summarize"; a seed that reads the same bank flips the run secure (`:247 to 252`). An item written after reading a secure neighbor can sit close to it and ship as uploadable.
Fix: pick one rule and state it in section 13: either any agent opening a file under a secure path makes the run secure, or `item_shape` may not name a secure bank in a run that is not secure (the command substitutes the schema doc and the test).

### REC
REC-1. 6587f87, already public since the push logged at `.git/logs/refs/remotes/origin/Claude-Development-djinn-relay:1`. The 26 lines are the removed side of this round's `input-diff.patch` (`:142` to `:481`, 26 lines). Kinds, without quoting: 25 name private project folders (mostly the engine repo; one line lists four); 1 carries Claude Code's dashed project folder, which spells the home user name (the same as the public GitHub owner, so small); 2 name the employer's industry beside the workplace's product (`:278`, `:351` of the patch). Unchanged, unmatched lines of the same public commit add the product's stage and team size, for example `_FromClaude/prompt-review-security-reviewer.md:114` and `_FromClaude/prompt-review-perf-reviewer.md:80`. Kind of exposure: indirect employer identification (industry plus product plus a two person team) beside the owner's full name at `.claude-plugin/marketplace.json:5`, and a partial map of private repos. No course content, no key, no credential. Is a rewrite worth it: yes if the employer must not be guessable, because the industry lines narrow it. But a force-push alone does not remove it: GitHub keeps the old commits fetchable by SHA and in cached views until its own purge, and any fork or clone keeps them. Recommendation: since the branch has one pushed tip, no `main` and a 17 day history, delete and recreate the GitHub repository and push a scrubbed history (a scrubbed root plus 9298889's tree), after checking for forks and stars; or force-push and file a GitHub Support request to purge cached views and dangling commits. If he does it, also drop the workplace descriptors the fenced `_FromClaude/` files still carry as unchanged or rewritten lines (patch `:230`, `:243`, `:279`, `:352`, and the two lines above).

REC-2. Before the push, run the checks this agent could not: `git status --porcelain` (expect only this round's untracked audit folder, so the tree equals 9298889); `git log -p --format=%B 6587f87..HEAD` through the filtered pattern file, keeping `+` lines and message lines (expect 0); `git cat-file -t djinn--v2.1.0` and `git merge-base --is-ancestor djinn--v2.1.0 6587f87` (exit 0 means the tag's target is already public); `git ls-remote --tags origin` (whether the tag is already there); `ls -l tools/pre-push.sh` (git skips a hook that is not executable). Push the branch by name only: no `--tags`, `--follow-tags`, `--all` or `--mirror`. After the bundles in `~/djinn-relay-backups/` are verified, `git reflog expire --expire=now --all`, delete `ORIG_HEAD`, and `git gc --prune=now`, so no local command can reach the pre-collapse objects by accident.

REC-3. A pasted question from a secure bank is secure only with `--secure` (`plugins/djinn/commands/learn.md:124 to 125`). The orchestrator already greps banks in topic mode (`:196 to 200`); do the same for a pasted stem against every bank under a secure path, and mark the run secure on a match.

REC-4. Add to `local/private-patterns.txt` the three project names of Blast radius MEDIUM-1 and a bare quiz number form (the teaching id prefix without its item suffix, `\b[pc]q[0-9]+\b`), so the list catches what this round found by hand. A hand-kept list will keep missing names; a periodic `ls ~` diff against the list is cheap.

## Blast radius

MEDIUM-1 (PERSONAL). `audits/2026-09-27-1931-custom/fixes/CALIBRATION-REPORT.md:208` Three private project folder names that the pattern list does not carry ship in the push: two at `:208 to 209` and one repeated at `audits/2026-09-27-1655-ideas/agents/gap-hunter.md:50`.
Mechanism: each is a folder under the owner's home (confirmed by a Glob of `~`), the same class as the list's "Other private project folders" group, which `tools/check-private.sh` enforces because the owner ruled they never ship. Two of the names state the owner's professional field, which beside the full name at `.claude-plugin/marketplace.json:5` narrows who employs him. No key and no credential, so not HIGH. These files are new in the push: both audits are dated after 6587f87.
Traced: Grep of every tracked and unignored file for each home folder name; hits only at those three lines. Tracked: yes (in 9298889's tree; `.gitignore:1 to 5` ignores no `audits/`).
Fix: replace each with "a private project" (or "the automation repo" style placeholders already used in the same line), add the names to `local/private-patterns.txt` (REC-4), and amend 9298889 before the push.

LOW-1. `audits/2026-09-29-1303-custom/agents/devils-advocate.md:184` The scrubbed round 1 folder still names a teaching practice quiz by its bare number and gives two private lecture paths whose file names state the course's domain.
Mechanism: the bare quiz number escapes the list's id pattern, which needs an item suffix. It sits at `devils-advocate.md:52`, `:59`, `:74`, `:136`; `ux-reviewer.md:34`, `:53`, `:58`, `:62`, `:69`, `:71`, `:76`, `:80`, `:117`, `:125`; `synthesis.md:181`, `:199`, `:202`, `:258`, `:259`. It ties the alias `tB-06` to a real quiz, and `synthesis.md:329` to `:336` and `ux-reviewer.md:98` name that quiz's subject in two words. The lecture paths are at `devils-advocate.md:184` and `:185`. No key is revealed; round 2 LOW-6 rated the same class LOW.
Traced: Grep of the tree for the bare prefix and for lecture paths; each file is tracked in 9298889.
Fix: replace the bare number with `tB`, each lecture path with `<teaching repo>/<lecture>`, and the two-word subject with "the secure bank".

LOW-2. `audits/2026-09-29-1303-custom/fixes/fix-report.md:158` The paragraph round 2 left in place still says why the teaching source's own rows failed the first check, a one-clause form of the property round 2 HIGH-1 removed.
Mechanism: with `audits/2026-09-29-1428-custom/synthesis.md:39 to 41` and `findings.json:8`, which say a property of that source's key survives any shuffle, a reader learns what kind of property it is. The source is named only by the alias `tA-03`, and I found no public line that maps the alias to a quiz, so the harm needs a second leak to land.
Traced: `fix-report.md:156 to 161`; Grep of the tree for the alias (all hits in the 1303 and 1428 folders).
Fix: reword `:158 to 161` to "the first check failed on the source rows; the script now skips rows built on a bank's own source question".

LOW-3. `audits/2026-09-29-1654-custom/input-diff.patch:142` This round's patch, untracked today, holds all 26 pattern-hit lines of 6587f87 on its removed side (the first at `:142`).
Mechanism: ruling R3 commits scrubbed audit folders, so committing this folder as it stands republishes them (already public, so the harm is small) and puts them in the added lines of the next push. `tools/check-private.sh` would fail on it, which is the gate working; it also means the pre-push hook refuses every push, this one included, while the file sits unignored in the tree (LOW-1).
Traced: Grep of the patch with the 43 patterns: 28 matches on 26 lines, every one on a `-` line.
Fix: before any push, move this `input-diff.patch` to `local/` or replace its removed side with a one-line redaction marker, as the 1303 patch did (`audits/2026-09-29-1303-custom/input-diff.patch:1 to 5`).

LOW-4. `local/dry-runs/round-3/<teaching>/<run>/input.md:12` Both repos' secure items, their keys and every derived row sit inside the public repo's working tree, held back only by `.gitignore:5`.
Mechanism: the dry runs set `out_dir` inside djinn-relay on purpose (`local/dry-runs/round-3/<course>/<run>/context.md:27`), the step the command refuses (`plugins/djinn/commands/learn.md:85 to 95`). Any `git add -f`, an archive or sync of the folder, or a tool that ignores `.gitignore` publishes them. `local/examples/` holds the round 1 runs the same way.
Traced: `.gitignore:5` ignores `local/`; Glob lists 45 run files under `local/dry-runs/round-3/` and the round 1 folders under `local/examples/`.
Fix: move `local/dry-runs/` and `local/examples/` to a folder outside any repository, and keep only `private-patterns.txt` in `local/`.

## Checked and Clean
- Push content: all 43 patterns, case-insensitive, over every tracked and unignored file, hidden `.djinn/` and `.claude-plugin/` included: 0 hits outside this round's untracked patch. `.git/COMMIT_EDITMSG:1 to 26`, the 9298889 message: no private word, no path.
- Secrets over the fence and the tree (`API_KEY`, `SECRET`, `TOKEN`, `password`, `Bearer`, `private_key`, `BEGIN PRIVATE KEY`, key prefixes, runs of 40 or more): only `MESHY_API_KEY` as an env var name at `plugins/djinn/CONTRACTS.md:302`, pattern lists at `plugins/djinn/agents/security-reviewer.md:62 to 63` and `plugins/djinn/agents/proof-runner.md:483 to 484`, and two private repo commit SHA prefixes at `audits/2026-09-29-1303-custom/agents/security-reviewer.md:82`, which are not secrets.
- Home paths: none in the tree; `.djinn/config.yaml:25`, `:28`, `:31 to 33` write `~`.
- Workplace descriptors on the added side of the push (patch `:230`, `:243`, `:279`, `:352`): each rewrites a line already public in 6587f87 and removes the industry; they add nothing the public commit lacks.
- `audits/2026-09-29-1303-custom/input-diff.patch:1124`, `:1262`, `:1539`: checked against the round 1 source item in `local/examples/`; none states or points at its key.
- `audits/2026-09-29-1303-custom/context.md:31` and `fixes/fix-report.md:122`: the kept blueprint phrase is not the key of any source item used in this review's dry runs (checked against `local/examples/.../input.md:15 to 22` and the round 3 inputs).
- Refs and objects: `.git/refs/` holds one head, one remote ref and one tag; `.git/packed-refs` is empty; no stash ref; no worktree; the backup branch and its reflog are gone; `.git/config:6 to 11` and `~/.gitconfig` set no `push.followTags`, `push.default` or hook path, so a plain branch push sends no tag and no other branch.
- `.git/hooks/pre-push`: installed, its text is `tools/pre-push.sh`.
- `plugins/djinn/commands/learn.md:85 to 95`: `out_dir` resolved with `realpath -m` through a list file and compared as root plus `/` plus a path; the root, a sibling prefix, an absolute path elsewhere and a climbing `..` all stop.
- `plugins/djinn/commands/learn.md:176 to 186`: the source repo is the input's real path's own `rev-parse --show-toplevel`, and any other repo stops, secure or not; a symlink into another repo resolves out and stops.
- `plugins/djinn/commands/learn.md:316 to 324`: a secure run whose folder `check-ignore` does not report ignored stops; exit 1 and exit 128 both stop, so it fails closed.
- `plugins/djinn/commands/learn.md:792 to 799` and `:872 to 874`: the script sets every row's `metadata.secure` to the run's mark and fails when no mark is given; round 3 teaching `sft.jsonl` carries `yes` on 12 of 12 rows.
- `plugins/djinn/commands/learn.md:231 to 236`, `:247 to 252`: the seed block carries the secure paths and the never-quote sentence, and a `secure: yes` or missing line flips the run and reruns the ignore check (see LOW-3 for the self-report).
- `plugins/djinn/commands/learn.md:940 to 944`: no key, stem or answer reaches the ledger.
- Round 3 course release sheet: holds no item, so it cannot leak.
- `tools/check-private.sh:69 to 79`, `:82 to 94`: every git status is read, a git error fails the check; passes 1 to 3 do not depend on the missing list.
- `.claude-plugin/marketplace.json`, `plugins/djinn/.claude-plugin/plugin.json`: public name and repository URL only.
- `_FromClaude/` fenced files, `docs/carried-findings.md`, `docs/session-log-2026-09-12.md`: every added line checked against the list and by hand; the placeholders ("the engine repo", "the arena repo") name no real folder.
- The other fenced prompt files (`plugins/djinn/agents/*.md`, `commands/*.md`, `relay.md`, `templates/config.yaml`, `CONTRACTS.md`): Grep for private names, work terms and home paths finds none; examples use the public boiling point fact and invented paths.

## Files read outside the fence
- `.git/refs/`, `.git/packed-refs`, `.git/HEAD` (what a push can send)
- `.git/logs/HEAD` and the two ref reflogs (collapse and parent)
- `.git/ORIG_HEAD`, `.git/COMMIT_EDITMSG` (old tip, pushed message)
- `.git/config`, `.git/config.worktree`, `.git/info/exclude` (push target, excludes)
- `.git/hooks/pre-push` and a Glob of `.git/hooks/` (hook installed)
- `.git/objects/` Glob (tag object exists)
- `~/.gitconfig`, `~/.config/git/ignore` (followTags, hook path)
- `local/private-patterns.txt` (the pattern list, task named)
- `local/dry-runs/round-3/<teaching>/<run>/` input, context, README, both sheets, sft (release sheet judgment)
- `local/dry-runs/round-3/<course>/<run>/` input, context, README, release sheet (release sheet judgment)
- `local/examples/.../input.md` of the round 1 teaching run (verify residue is not key)
- `audits/LEDGER.md` and every folder under `audits/` except this round's, grep plus reads of the 1303 and 1428 reports, fix reports, synthesis, the 1655 gap-hunter and the 1931 calibration report (push content sweep)
- a Glob of `~` for `CLAUDE.md` and `.git/HEAD` (private folder names to grep)
- `~/Conventions/code/AUTOMATION.md` and two known-bugs detail files, grep only (confirm a project name)
- `~/Conventions/code/known-bugs/any-language/tests-and-checks.md` (entry tier for MEDIUM-1)

## Counts
Findings: HIGH 0, MEDIUM 2, LOW 5, DEBT 1, REC 4. Blast radius: MEDIUM 1, LOW 4.
