---
title: security-reviewer report, audits/2026-09-29-1428-custom
author: Claude opus (security-reviewer)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

This report is written into a public repo. It cites ids and paths only. It
does not repeat any private course text, any key or key property, any
workplace name, or any bank file name that round 1 did not already name.
`~` stands for the home directory.

No `## Round 1 status` section: CONTRACTS.md section 3 keeps prior-finding
status for synthesis, and CONTRACTS.md wins over the agent prompt. The four
round 1 safeguard holes the dispatch asked about are confirmed under Checked
and Clean, each with its line.

Tool limit, said plainly: this agent has Read, Grep, Glob and Write, and no
Bash. I did not run `git log -p 6587f87..HEAD`. The unpushed range was
checked through the working tree (HEAD 1e45eb5 plus untracked files), the
index (`.git/index`, for tracked or not) and the reflog (`.git/logs/HEAD`).
A file added in one unpushed commit and deleted in a later one would not be
seen that way. REC-1 gives the git commands that close this.

## Findings

### HIGH
none

### MEDIUM
none

### LOW
LOW-1. `tools/check-private.sh:17` The banner pattern matches only the run README, so a run folder copied in without its `.jsonl` files and README passes the check. That includes `input.md`, which holds the source item verbatim.
Mechanism: `BANNER` is `SECURE SOURCE. Derived from`, which only the secure README's first line carries (`plugins/djinn/agents/learn-synthesis.md:392`). The draft items carry `# SECURE SOURCE` with no "Derived from" (`learn-synthesis.md:144`). `input.md`, `context.md`, the study sheet, the angle files and the verification files carry no secure mark at all. `ROW_KEY` catches only the three `.jsonl` files. So in a partial copy (say, `input.md` and `items-DRAFT.yaml` pasted under `docs/` as a worked example, which is how 32a1c17 began), neither pattern fires. Line 21 checks only `learn/` and `local/` paths.
Traced: `learn.md:297 to 299` writes `context.md`, `input.md`, `learn-config.yaml` and `learn_reward.py`, each with the section 7 header and `status: learn draft, not yet reviewed`. `CONTRACTS.md:535 to 538` gives every learn-written file that status. A grep for that status string over every file outside `plugins/` and `local/` finds it only in the two `input-diff.patch` files under `audits/`, which line 29 already excludes. So it can be added as a third pattern with no false hit today.
Fix: add `learn draft, not yet reviewed` to the loop at `:28`, beside `BANNER` and `ROW_KEY`. It marks every learn file that is not JSONL, secure or not.

LOW-2. `tools/check-private.sh:29` The content grep skips `audits/` and checks neither `/home/` nor `content/secure/`. The two leaks this round found (Blast radius HIGH-1 and MEDIUM-1) both sit in `audits/`, where the build passes them.
Mechanism: `':!audits'` is there for a sound reason: audit reports discuss the banner and `source_ref` by name. But `audits/` is also where a review's agents write what they read in private repos, and Donald's rule is that audits get committed (`.djinn/config.yaml:77 to 78`, R3). Round 1 REC-6 (`audits/2026-09-29-1303-custom/synthesis.md:214`) asked for `SECURE SOURCE`, `content/secure/` and `/home/` in tracked files outside `plugins/`. Only the first shape was built. So a scrub that misses a line, as the round 1 scrub did (`audits/2026-09-29-1303-custom/fixes/fix-report.md:116 to 122` reports a clean grep while its own `:154` leaks), goes through the gate.
Traced: `tools/check-private.sh:29` pathspecs, then `.gitignore:1 to 5` (audits not ignored), then `.git/index` (it lists `audits/2026-09-29-1303-custom/fixes/fix-report.md` and `audits/2026-09-27-1655-ideas/agents/gap-hunter.md`).
Fix: add a second pass that includes `audits/` and reads its patterns from a gitignored file, `local/private-patterns.txt` (`git grep -l -F -f`), holding the private repo names, the course code, the work folder name and `/home/`. The private words then never enter the public repo. When that file is missing, print a loud `private patterns: not checked` line rather than passing quietly, per the section 9 rule that an empty pattern file is refused.

LOW-3. `.djinn/config.yaml:22` Tracked config in the unpushed range carries absolute home paths (`:22`, `:25`, `:29`, `:30`).
Mechanism: the config was added in b826549 (`.git/logs/HEAD:9`), which is after `origin` at 6587f87 (`.git/refs/remotes/origin/Claude-Development-djinn-relay:1`). Commit 6587f87 is itself "Scrub home-directory paths from two review reports before publishing" (`.git/logs/HEAD:7`), so the owner's standing practice is to keep these out. The harm is small: the user name matches the public handle in `plugins/djinn/.claude-plugin/plugin.json:7`.
Traced: Grep of `.djinn/config.yaml` for the home prefix, four hits.
Fix: write the Conventions paths as `~/Conventions/...` where the reader expands `~` (the shell in `build_cmd` does). Or accept it and say so in `project_notes`. Donald's call.

### DEBT
DEBT-1. `.djinn/config.yaml:77` "The scrubbed audit folder and its ledger line are committed" (R3) makes every review that reads a private repo a publication step, with a hand scrub as the only guard.
Mechanism: round 1's agents read `<teaching repo>` secure banks and `<course repo>`, and their reports hold ids, bank names, line numbers, short quotes of private READMEs and a workplace link. The scrub is one careful pass by a model, and it missed at least two items (Blast radius HIGH-1, MEDIUM-1). Each future `/djinn:learn` review will read private repos again, because learn's whole input is private course content.
Fix: for a review whose agents read outside this repo, commit `synthesis.md`, `findings.json` and the ledger line, and keep `agents/` and `input-diff.patch` under `local/`. Or make LOW-2's pattern pass the gate the scrub has to clear.

### REC
REC-1. Close the history check this agent could not run. Run `git log --diff-filter=D --name-only 6587f87..HEAD` (expect no file added and then deleted inside the range), `git diff --stat a4ee7dc 1e45eb5 -- . ':!audits'` (expect empty, so the squash tree matches HEAD outside `audits/`), and `git log -p 6587f87..HEAD | grep -c -F -f local/private-patterns.txt` with LOW-2's pattern file.
REC-2. `backup-learn-before-squash` points at cb325aa (`.git/refs/heads/backup-learn-before-squash:1`), whose history holds 28e269c. Per `audits/2026-09-29-1303-custom/fixes/fix-report.md:166 to 169`, 28e269c carries the old prompts with the tB-06 key fact, the secure bank path and both private repos' layouts. A plain `git push` sends only the current branch (`.git/config:9 to 11`). `git push --all` or `--mirror` would send the backup too. Delete the branch once the squash is confirmed.
REC-3. `tools/check-private.sh` runs only inside `build_cmd`, which only a review or dispatch runs. Add it as a `pre-push` hook in this repo, so a push made by hand is checked too.
REC-4. `qa/human/learn-leak-guards.md` walks the learn guards but not the repo gate. Add a step: in a scratch clone, commit a fake run folder under `docs/` (one `input.md` with the learn header, one `.jsonl` row with `source_ref`) and confirm `bash tools/check-private.sh` exits 1 naming both files.
REC-5. `plugins/djinn/commands/learn.md:86` says to "compare the result with the root". Say how: the resolved path must equal the root or start with the root plus `/`. A bare string prefix accepts a sibling folder such as `<root>-site`. Step 6 backstops secure runs (see Checked and Clean), but a run that is not secure would write there.

## Blast radius

HIGH-1 (SECURE CONTENT). `audits/2026-09-29-1303-custom/fixes/fix-report.md:154` One sentence gives away how to answer secure item tA-03 without knowing the material, and names a detail of one of its options. `:151` adds a number that says the same thing.
Mechanism: the teaching repo builds exam forms by shuffling options (`audits/2026-09-29-1303-custom/agents/gap-hunter.md:30`), so an option's position leaks nothing. The property stated at `:154` is not a position, so it survives any shuffle. A student who reads this public file can pick tA-03's key on sight. This is the harm round 1 HIGH-1 was about, on a second item, and it came in through the fix report's own dry run table. The same section claims a clean scrub (`:116 to 122`).
Traced: the sentence at `fix-report.md:154 to 155` and the ratio at `:151`, checked against the item in its secure bank under `<teaching repo>/content/secure/` (bank file name left out here on purpose). The sentence is accurate. Tracked: yes. `.git/index` lists the file, it came in with 1e45eb5 (`.git/logs/HEAD:22`), and `.gitignore:1 to 5` does not ignore `audits/`. Not pushed: `origin` is at 6587f87. The build gate cannot see it (`tools/check-private.sh:29` excludes `audits/`).
Fix: remove `:154 to 155` and the ratio in `:151` (move them to `local/`), then amend 1e45eb5 before any push. Nothing public changes, because none of it is public yet.

MEDIUM-1 (PERSONAL, WORK). `audits/2026-09-29-1303-custom/agents/security-reviewer.md:20` The scrubbed audit keeps the two things round 1 HIGH-2 called the exposure: the link between the course repo and Donald's workplace, and the private repo's layout. Audits from the 2.3.0 build add a home folder whose name marks it as Donald's work, and they quote that work repo's config by line.
Mechanism: `security-reviewer.md:20` quotes the private the course repo `CLAUDE.md` line that ties its source names to Donald's workplace. The same folder spells out the track and module folder names, which say what field the work is in (`security-reviewer.md:21`, `:28`, `:93`; `context.md:33 to 34`; `bugs-reviewer.md:16`; `devils-advocate.md:38 to 43`, `:177`, `:181`; `ux-reviewer.md:46`). The 2026-09-27 audits, in the unpushed 153ad84, name the work folder and quote its repo's rules, file layout and design by `config.yaml` line: `audits/2026-09-27-1655-ideas/agents/gap-hunter.md:16`, `:19`, `:27`, `:51`, `:56`, `:59`, `:204`; `audits/2026-09-27-1559-custom/synthesis.md:124`; `audits/2026-09-27-1559-custom/agents/gap-hunter.md:51`, `:52`, `:89`; `audits/2026-09-27-1628-custom/round-1-synthesis.md:124`; `audits/2026-09-27-1806-custom/synthesis.md:201`; `audits/2026-09-27-1806-custom/agents/devils-advocate.md:103`; `audits/2026-09-27-1806-custom/agents/ux-reviewer.md:79`; `audits/2026-09-27-1931-custom/round-1-synthesis.md:201`; `audits/2026-09-27-1720-build/wiring/data-contract-reviewer.md:43`, `:57`. The shipped prompt `plugins/djinn/agents/data-contract-reviewer.md:209` names the work repo too, although `audits/2026-09-27-1806-custom/synthesis.md:94` (REC-13) asked for that sentence to go. All of it sits beside Donald's full name (`.claude-plugin/marketplace.json:5`, `plugins/djinn/.claude-plugin/plugin.json:5`). No key and no credential is involved, so this is not HIGH. It is a personal and employer identifier that one push makes public.
Traced: Grep of the working tree outside `local/` for the private repo names, the work folder name and the track name. Each file above is in `.git/index`. Every commit that added them is after 6587f87 (`.git/logs/HEAD:8 to 22`).
Fix: replace them with "a private course repo", "a work repo" and "a module quiz", and drop the quoted `CLAUDE.md` line. For the 1e45eb5 files, amend. For the 153ad84 files, an interactive rebase of the unpushed range. Donald decides whether the rewrite is worth it.

LOW-1. `audits/2026-09-29-1303-custom/synthesis.md:317` Answer to the dispatch's question: yes, the item ids and bank file names in the scrubbed audit are a disclosure Donald should know about. They reveal no key.
Mechanism: together they give a reader the course code, two secure quiz titles, item numbers, and where each item sits in its bank (`synthesis.md:160`, `:317`; `agents/security-reviewer.md:16`, `:38`, `:49`, `:88 to 89`; `agents/devils-advocate.md:12`, `:178`; `agents/gap-hunter.md:114`; `agents/ux-reviewer.md:133`). Short quotes of the private `content/secure/README.md` sit at `agents/security-reviewer.md:15` and `agents/integration-reviewer.md:15`. `a: 0` (`agents/security-reviewer.md:16`, `agents/integration-reviewer.md:14`) gives the key's authored index. The forms shuffle, so that one leaks nothing. Round 1 LOW-22 took these same names out of the public prompts because a course code, a quiz title and a private repo map should not ship. The audit puts them back.
Traced: Grep of `audits/2026-09-29-1303-custom/` for the course code, `content/secure` and `a: 0`.
Fix: keep item ids if Donald accepts them. Replace each bank file name with `<secure bank>`, and each quote of a private README with its path and line.

LOW-2. `audits/2026-09-27-1655-ideas/agents/gap-hunter.md:194` The 2026-09-25 and 2026-09-27 audits, all in the unpushed range, cite absolute home paths that list Donald's other private project folders.
Mechanism: this cuts against 6587f87's scrub rule (`.git/logs/HEAD:7`). Beyond the work folder in MEDIUM-1, the harm is small.
Traced: Grep for the home prefix under `audits/`, for example `audits/2026-09-27-1655-ideas/agents/gap-hunter.md:194 to 209`, `audits/2026-09-27-1806-custom/agents/devils-advocate.md:89 to 103`, `audits/2026-09-27-1806-custom/synthesis.md:180 to 201`, `audits/2026-09-27-1931-custom/synthesis.md:202 to 209`.
Fix: rewrite them as `~/...` in the same rebase as MEDIUM-1.

## Checked and Clean
- Round 1 HIGH-3 (the secure check read the wrong repo): closed in the text. `plugins/djinn/commands/learn.md:168 to 178` resolves the input's real path, finds its repo with `git -C`, and stops with `ABORTED step 3b: input outside this repo` for any input outside the target repo, secure or not. `CONTRACTS.md:1307 to 1314` says the same.
- Round 1 MEDIUM-1 (topic mode): closed in the text. `learn.md:165 to 166` runs the secure check on "each bank a picked item came from, after Step 4". `learn.md:200 to 203` puts every picked item through Step 3 and the Step 3b check against its own bank, and names that bank as never evidence. A topic run always waits for `go` (`learn.md:269 to 270`).
- Round 1 LOW-1 (out_dir): closed in the text. `learn.md:83 to 90` resolves `out_dir` with `realpath -m` through a list file and stops with `ABORTED step 1: out_dir outside this repo`. Backstop for a secure run: `learn.md:289 to 295` stops unless `git check-ignore` exits 0 for the run folder. A path outside the repo is not reported as ignored, so a sibling-folder slip (REC-5) still stops a secure run. (This is git behavior as I know it. I did not run it.)
- Round 1 LOW-3 (rows without a secure flag): closed. `secure` is in `META` (`learn.md:482 to 484`). The script refuses a value other than yes or no, and a row that disagrees with the run (`learn.md:609 to 612`). It fails when the list file's first line gives no mark (`learn.md:782 to 784`, `:789`). The loading recipe filters on it first (`CONTRACTS.md:1187`).
- Would `tools/check-private.sh` catch the round 1 leak if it came back as a whole folder? Yes. The old rows carried a `"source_ref"` key (`audits/2026-09-29-1303-custom/agents/ux-reviewer.md:46`), which `:18` and `:29` match in every `.jsonl` file of a run, and the secure README's first line matches `:17`. It would not catch a partial copy (LOW-1) or anything under `audits/` (LOW-2). Line 21 matches only the `learn/` and `local/` paths, so the old `docs/examples/` paths would reach it only through line 29.
- known-bugchecker's MEDIUM-1 and MEDIUM-2 at `tools/check-private.sh:29` and `:21`: not false positives in mechanism. Both discard git's exit status (`2>/dev/null` at `:29`, the unread pipefail status at `:21`), so a git error reads as clean. The reach is narrow: `.djinn/config.yaml:22` runs `git ls-files` under `pipefail` just before the script, so a broken git fails the build first. One more note, unverified because I have no shell: the `|| exit 1` at `:15` may not fire outside a repo, because bash does not treat an empty `cd` argument as an error. gate-auditor owns the tier.
- tB-06's key and rationale are not in the tree: a Grep of the working tree outside `local/` for four distinctive phrases of its key, its rationale and two options finds nothing. The `N1`, `N2` and `N3` left in `audits/2026-09-29-1303-custom/input-diff.patch:1124`, `:1262` and `:1539` are generic terms of the subject, and I checked them against the item's lines: none is its key. The patch's 34 example sections are gone (`input-diff.patch:1 to 5`).
- "N1 = slow eye movements" (`audits/2026-09-29-1303-custom/context.md:29`, `synthesis.md:126`): a textbook fact that the audit ties to no item id, kept on purpose (`fixes/fix-report.md:120 to 122`). Cleared. Donald may still prefer a public example there, as the prompts now use.
- Fenced prompts, config and scripts carry no private names: a Grep over `plugins/`, `.djinn/`, `tools/`, `qa/` and `.claude-plugin/` for the two private repo names, the course code, the item ids, the track name and the work repo finds none. `L04:12` at `CONTRACTS.md:1011` and `learn-fact-checker.md:119` is a generic shorthand example. `CONTRACTS.md:885 to 895` describes the two repos by shape only.
- Secret grep over the fence (`API_KEY`, `SECRET`, `TOKEN`, `password`, `Bearer`, `private_key`, `BEGIN PRIVATE KEY`, and runs of 40 or more alphanumerics): only `MESHY_API_KEY` at `CONTRACTS.md:296`, an env var name as section 5 requires, and the pattern lists inside `agents/security-reviewer.md` and `agents/proof-runner.md`.
- `.gitignore:5` ignores `local/`, and `.git/index` holds no `local/` path, so the fresh dry runs are untracked.
- `plugins/djinn/commands/review.md:232`, `:234`, `:258`, `:268`, `:301`, `:306`, `:377` and `plugins/djinn/commands/dispatch.md:183`, `:317`, `:409` carry `':!learn'` beside `':!audits'` on every listing. A learn run folder never reaches a fence or a patch.
- Every learn agent refuses without `LEARN RUN:` (`learn-known.md:28`, `learn-asked.md:27`, `learn-harder.md:19`, `learn-prepare.md:20`, `learn-fact-checker.md:24`, `learn-synthesis.md:22`), so a review cannot make one write into `audits/`.
- `learn.md:266` withholds the key from the plan in a secure run, and `learn.md:835 to 837` keeps keys and stems out of the ledger.
- `qa/human/learn-leak-guards.md`: scratch repos under `/tmp`, public textbook facts, no private path or item.
- `.claude-plugin/marketplace.json`, `plugins/djinn/.claude-plugin/plugin.json`: public name and repo URL only.

## Files read outside the fence
- `audits/2026-09-29-1303-custom/` (unpushed range, dispatch asked)
- `audits/2026-09-2[57]-*/` grep and three reads (unpushed range privacy sweep)
- `docs/` grep (unpushed range privacy sweep)
- `.git/logs/HEAD` (unpushed commit list)
- `.git/refs/remotes/origin/Claude-Development-djinn-relay` (what is pushed)
- `.git/refs/heads/backup-learn-before-squash` (backup branch tip)
- `.git/config` (push target and upstream)
- `.git/index` grep (is it tracked)
- `plugins/djinn/agents/data-contract-reviewer.md` grep (unpushed prompt names work repo)
- `<teaching repo>/content/secure/` tB-06 bank, lines 203 to 218 (verify residue is not key)
- `<teaching repo>/content/secure/` tA-03 bank, lines 275 to 286, name withheld (verify fix report sentence)
- `<teaching repo>/content/secure/` grep, counts only (is a phrase in banks)

## Counts
Findings: HIGH 0, MEDIUM 0, LOW 3, DEBT 1, REC 5. Blast radius: HIGH 1, MEDIUM 1, LOW 2.
