---
title: integration-reviewer report, audits/2026-09-27-1931-custom
author: Claude Opus 5.5 (integration-reviewer)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Note on this section: the dispatch for this round asked for it. CONTRACTS.md:134 to :137 and dispatch.md:357 to :362 now say no reviewer writes a Round status section and synthesis alone owns it. Read these lines as input for synthesis, not as the status table (see REC-3).

## Round 1 status
- MEDIUM-1 (synthesis MEDIUM-1): RESOLVED. CONTRACTS.md:134 to :139 names synthesis the only owner. synthesis.md:170 to :185 holds the three domain RESOLVED rules. dispatch.md:357 to :362 tells reviewers not to write a status section. Every agent Round section now says the same: gate-auditor.md:305 to :307, live-system-reviewer.md:342 to :344, data-contract-reviewer.md:274 to :276, perf-reviewer.md:145 to :147, bugs-reviewer.md:106 to :108, security-reviewer.md:140 to :142, integration-reviewer.md:207 to :210, known-bugchecker.md:128 to :130, legibility-reviewer.md:315 to :317. A grep for `re-check`, `recheck`, `STILL OPEN` and `STILL PRESENT` under plugins/djinn finds only the "do not write" sentences. gate-auditor.md no longer asks for a prior synthesis path (grep, no hit).
- MEDIUM-2 (synthesis MEDIUM-2): RESOLVED. synthesis.md:46 to :49 merges proof-runner's Findings. dispatch.md:288 to :293 halts on `TREE CHANGED` and routes other stops to the ledger. dispatch.md:383 to :384 tells synthesis to merge. dispatch.md:422 and CONTRACTS.md:417 to :421 carry `STOPPED` in `proof=`. review.md:612 to :616 carries it in the prove line. One gap remains in the same area, LOW-8.
- MEDIUM-3 (synthesis MEDIUM-3): RESOLVED for the traced path. The round 1 example was a Python CLI printing through `\033[32m`. review.md:106 now matches `\\033\[` and the library imports, and `.py` is in the content-grep list at review.md:88. synthesis.md:90 to :95 turns a ux REC naming accessibility-reviewer into a Coverage line. The same file-list narrowing leaves shell scripts out, LOW-3.
- MEDIUM-4 (synthesis, confirmed by me in round 1): RESOLVED. dispatch.md:43 to :46 always reads `proof`. dispatch.md:163 to :166 pastes `heap_mb` and `timeout_s` to the fixer. fixer.md:95 to :105 runs no test with `heap_mb` none.
- MEDIUM-6 (synthesis, confirmed by me in round 1): RESOLVED. proof-runner.md:210 to :217 greps the fixed files and every chosen test file, on any line, and stops before any run.

## Findings

### HIGH
none

### MEDIUM
none

### LOW
LOW-1. `plugins/djinn/agents/pipe-connector.md:136` The report template still opens with `Threshold: <n> lines.`. The section 9 table (:159 to :162) still gives each candidate file's size (`280`, `260`) in a `Lines` column. Both survived the size-rule removal.
Mechanism: pipe-connector.md:23 to :24 now says "There is no size threshold", and the 500-line default is gone (patch lines 1217 to 1220). So the header asks for a number that no input supplies. An agent fills it by inventing one, which format-reviewer.md:37 and the owner's rule forbid, or it writes a placeholder. Nothing reads that header line: /djinn:brief and fixer read `## 10. Map summary` and `## Blast radius` (pipe-connector.md:189 to :192). So the damage is a size figure written into every report, against LEGIBILITY.md:15 to :17 ("not in a review finding").
Traced: patch hunk at pipe-connector.md :20 and :81 (threshold removed) to pipe-connector.md:136 and :159 to :162 (template unchanged) to pipe-connector.md:189 to :192 (the consumers, which do not read it).
Fix: drop `Threshold: <n> lines.` from :136. Drop the `Lines` column from the section 9 table, or turn it into a line range the way section 8's table (:155 to :157) uses one.

LOW-2. `plugins/djinn/agents/gate-auditor.md:3` Four conditional agents still describe their scope as every scope but `live` and `ideas`. `map` now excludes them too.
Mechanism: the legibility wiring added `map` to the no-conditional-agent scopes at review.md:82, relay.md:150 and README.md:129. It did not touch the self-descriptions: gate-auditor.md:3 ("any scope except live and ideas"), data-contract-reviewer.md:3 (same words), cost-complexity-reviewer.md:3 ("any scope but ideas and live") and accessibility-reviewer.md:3 ("except ideas and live"). The orchestrator follows review.md, so no wrong spawn follows from this. But the description drives automatic subagent selection (breaker.md:189 to :191), and "says the same thing about itself" fails for four agents.
Traced: review.md:82 and :71 ("No conditional agent joins this scope") against the four description lines, found by grep.
Fix: add `map` to each of the four lines, or point them at review.md Step 2 (DEBT-1).

LOW-3. `plugins/djinn/commands/review.md:87` The content-grep file list has no shell extension. A `.sh` script that colors PASS and FAIL with `\x1b[` or `\033[` no longer fires the accessibility trigger. Before the fix pass, `\x1b[` in any fenced file fired it.
Mechanism: LOW-23's fix limits every content grep to `.js .mjs .cjs .ts .tsx .jsx .vue .svelte .py .html`, plus `ui_paths` and `live.systems[].code` (review.md:86 to :92). MEDIUM-3's fix widened the regex (review.md:106), and round 1 named shell as one of the two usual homes of `\033[`. The same list also leaves out `.rb`, `.go`, `.rs` and `.ps1` CLIs. What remains: ux-reviewer fires on a CLI entry point (review.md:96 to :97) and files a REC (ux-reviewer.md:116 to :119), and synthesis turns that into a Coverage line (synthesis.md:90 to :95). The owner is told, but nothing blocks the verdict. That is why this is LOW and not a reopened MEDIUM.
Traced: review.md:86 to :92 (extension list) to review.md:98 to :107 (accessibility trigger, "any fenced code file") to ux-reviewer.md:116 to :119 to synthesis.md:90 to :95.
Fix: add `.sh`, `.bash`, `.zsh` and `.ps1` to the list, at least for the accessibility regex, or state that a shell CLI needs `ui_paths` or `+a11y`.

LOW-4. `plugins/djinn/commands/review.md:411` review.md pastes `integration-reviewer: running | not running` to legibility-reviewer and says what the agent does with it. The agent file never reads that input.
Mechanism: review.md:411 to :413 says "the agent files every false map line itself when integration is not running". dispatch.md:352 to :353 pastes the same flag in rounds. legibility-reviewer.md:87 to :112 (Inputs) does not list it. The Division of labor at :30 to :37 branches on the mode instead: in diff mode the agent always files the false line with "also a false claim, expect integration-reviewer", and in map mode it owns every false line. So the behavior matches review.md's comment only by accident, and a later edit to either side will drift. This is a wrong claim about a consumer.
Traced: review.md:407 to :415 and dispatch.md:350 to :354 (the paste) to legibility-reviewer.md:87 to :112 and :26 to :37 (the consumer, which never reads it).
Fix: add the flag to the agent's Inputs, with "when not running, drop the 'expect integration-reviewer' line", or stop pasting it.

LOW-5. `plugins/djinn/agents/legibility-reviewer.md:285` A file missing from a map gets REC from legibility-reviewer and LOW from pipe-connector. That LOW names legibility as owner. Nothing tells synthesis which tier wins.
Mechanism: legibility-reviewer.md:285 to :286 puts "a map line worth adding where nothing is false" at REC. pipe-connector.md:116 to :119 files the same fact as LOW with `Owner: legibility-reviewer`, and :121 to :122 says "synthesis keeps theirs". The rule book says the omission "is a finding" (LEGIBILITY.md:119 to :121). The agent's own calibration example cites LOW-35 for that shape (legibility-reviewer.md:347 to :351). synthesis.md:125 to :129 keeps the highest tier "only if the code supports it", so the tier depends on which agents ran. When legibility is not triggered, pipe-connector's LOW stands alone. When it is, synthesis keeps legibility's REC.
Traced: pipe-connector.md:116 to :122 to legibility-reviewer.md:285 to :302 to synthesis.md:125 to :129.
Fix: say in both files that a missing map line is REC (or LOW), and have pipe-connector file it at that tier.

LOW-6. `plugins/djinn/agents/synthesis.md:59` The map-mode coverage rule names `tree.txt`. Neither synthesis prompt passes that path, and synthesis may read only the fence and cited files (synthesis.md:109 to :110).
Mechanism: review.md:492 to :497 passes the fence, tree facts, scope and agent lists, but not `tree.txt`. In the map scope, `tree.txt` equals the fence (review.md:263), so synthesis can reach the same list through `fence.txt` if it knows to. As written, it is told to use a file it was not handed.
Traced: synthesis.md:58 to :61 to review.md:492 to :497 and review.md:261 to :264.
Fix: write `fence.txt (the same list as tree.txt in the map scope)` at synthesis.md:60.

LOW-7. `plugins/djinn/CONTRACTS.md:319` The trigger, the contract, the agent and the template give three different lists of what counts as an entry doc or map by default.
Mechanism: review.md:153 to :156 fires on `CONTRIBUTING.md` and on `index`, `map`, `layout` or `contents` names ending `.md`. CONTRACTS.md:319 to :321 and templates/config.yaml:41 to :43 leave out `CONTRIBUTING.md`. legibility-reviewer.md:114 to :118 leaves it out too, and says "any doc" where the others say `.md`. relay.md:165 to :166 includes CONTRIBUTING. So the agent can be spawned by a CONTRIBUTING.md edit and then find nothing in its own defaults saying that file is a map.
Traced: review.md:153 to :158 (trigger) to legibility-reviewer.md:114 to :118 (the consumer's defaults) against CONTRACTS.md:319 to :321.
Fix: one list, in CONTRACTS.md section 5, that the other three quote.

LOW-8. `plugins/djinn/agents/proof-runner.md:289` proof-runner's Severity gives no tier to a hand-mutant stop. synthesis.md:46 to :48 says proof-runner's "mutant findings keep their tiers".
Mechanism: a mutant hit stops the whole invocation before any run (proof-runner.md:213 to :217 and :279) and marks every finding NOT RUN. The Severity list at :289 to :302 tiers only FAIL, CAPPED, TIMEOUT, tree changed and NO TEST. Dispatch does not halt on MUTANT (dispatch.md:291). So the stop reaches the ledger and the Coverage `Stopped:` line, but no Fix List entry and no verdict. A mutant in a fixed source file is also in the round's tree facts (review.md:313 to :317), which exclude test files. A mutant in the test file about to run is surfaced only by that Coverage line.
Traced: proof-runner.md:210 to :217 to :289 to :302 to synthesis.md:43 to :49 to dispatch.md:288 to :293.
Fix: tier a mutant stop in proof-runner's Severity. MEDIUM fits: a fix landed with a hand mutation left in.

LOW-9. `.djinn/config.yaml:21` This repo's own config lists no LEGIBILITY.md in `conventions_files`, yet this round's dispatch pasted it. `project_notes` (:48 to :52) still says 2.3.0 "wires six agents", with no legibility-reviewer and no `map` scope.
Mechanism: a `/djinn:review map` or a legibility trigger on this repo would, per legibility-reviewer.md:122 to :125, report "rule book not supplied" and mark every finding so. Every agent reads the stale project_notes as architecture context. The legibility wiring report names this gap for the game repo only (LEGIBILITY-WIRING.md:143 to :146).
Traced: .djinn/config.yaml:21 to :23 to review.md:355 (pasted verbatim) to legibility-reviewer.md:122 to :125.
Fix: add `~/Conventions/code/LEGIBILITY.md` to `conventions_files`, and bring project_notes up to seven agents and the `map` scope.

LOW-10. `plugins/djinn/relay.md:21` Stale prose the fix pass made false. relay.md:21 to :23 and README.md:172 list the tree facts without the secret-shaped-names section that D1 added (review.md:330 to :334, CONTRACTS.md:204 to :206). relay.md:96 to :98 says a round runs on "the union of the landed work sets", while dispatch.md:297 to :300 now adds the whole tool in a `live` audit.

LOW-11. `plugins/djinn/agents/legibility-reviewer.md:56` says "known-bugchecker already ran the index" with no exception. In the `map` scope it does not run (review.md:69 to :71, :431 to :432). The dispatch sentence corrects it at run time. The agent file should say "when it ran".

### DEBT
DEBT-1. `plugins/djinn/agents/gate-auditor.md:3` The list of scopes that take no conditional agents is copied into review.md:82, relay.md:150, README.md:129 and five agent descriptions. The second writer updated three of those copies and missed four (LOW-2). Each new scope repeats the hunt. Have the descriptions say "in every scope that takes conditional agents (commands/review.md Step 2)", so one line owns the list.

### REC
REC-1. integration-reviewer: proof-runner.md:158 "Run at most 3 importers for one finding" is a run cap written as a bare 3, beside three named constants (:60 to :64). It is a safety count, not a size rule, and it is not among the four caps the fix writer flagged for Donald. Name it (for example `MAX_IMPORTERS_PER_FINDING`) and add it to that list.
REC-2. integration-reviewer: count caps outside the four flagged ones, for Donald's call. None of these was added by this diff. ux-reviewer.md:197 "At most three lines here" (unchanged line). gap-hunter.md:85 "Max 4 items" (outside the fence, unchanged). The "five words or fewer" outside-fence reason in CONTRACTS.md:121 and :154 to :155 and most agents, which LEGIBILITY-WIRING.md:152 to :154 already flagged. `MAX_UNTRACKED` 200 (review.md:203 to :204), a safety stop Donald approved under D9, not a structure rule. LEGIBILITY.md:16 bans "caps on how many entries a list or a doc may hold", so the first two may fall under the rule.
REC-3. integration-reviewer: this round's orchestrator was hand-run. It asked reviewers for a Round 1 status section, which CONTRACTS.md:134 to :137 now forbids. By review.md:150 to :158 it should also have triggered legibility-reviewer: the fence adds `agents/legibility-reviewer.md` and touches `README.md` and `CONTRACTS.md`, which is in `conventions_files`. It did not, and context.md has no `triggers:` line. So legibility-reviewer has not reviewed its own wiring. Run the next round from the 2.3.0 command text, or list legibility-reviewer as not run.
REC-4. integration-reviewer: repeat of round 1 REC-2. Script one dry run of review, then dispatch round 2, on a fixture repo, and assert that every agent prompt carries each key its Inputs section names. LOW-4 and LOW-6 are both an input pasted with no reader, or read with no paste.

## Blast radius
none

## Checked and Clean
Legibility lane, handoff sentences on both sides:
- integration-reviewer: legibility-reviewer.md:26 to :37 quotes integration-reviewer.md:84 to :88 word for word. integration-reviewer.md:90 to :94 hands the missing-file, buried-map, two-values and two-ideas cases back. Split agrees: a false line is integration's, completeness is legibility's, and map mode gives legibility both.
- format-reviewer: legibility-reviewer.md:38 to :43 quotes format-reviewer.md:61 to :62 and :3. format-reviewer.md:118 to :121 hands the whole-tree view to legibility and keeps one concern inside a changed file. Agrees.
- pipe-connector: legibility-reviewer.md:44 to :48 quotes pipe-connector.md:3 and :83 to :84 and hands split prep over. pipe-connector.md:119 names legibility-reviewer as owner of unmapped files. Both sides present. The tier mismatch is LOW-5.
- ux-reviewer: legibility-reviewer.md:49 to :55 quotes ux-reviewer.md:3. ux-reviewer.md:148 to :150 hands navigation docs back with the same split-by-paragraph rule. review.md:163 to :164 says the same. Agrees.
- review.md map scope (:64 to :71), Step 3 item 4b (:226 to :230), item 5 (:231 to :233), item 7 (:242 to :245), Step 4 tree lists (:258 to :274), the `SCOPE: map` line (:382 to :385), the per-agent block (:407 to :415) and Step 5 (:431 to :432) match what legibility-reviewer.md expects: mode from the dispatch (:134), `tree.txt` and `tree-changes.txt` (:105 to :112), `maps` and `data.generated` (:96 to :102), the rule book through `conventions_files` (:92 to :95), and the read-only wave (:437 to :438, against review.md:436 to :440, which does not exclude it).
- dispatch.md round wiring for it (:315 to :325, :335 to :343, :350 to :354): diff mode in every round, round tree files, no `SCOPE: map` line. Agrees with legibility-reviewer.md:311 to :317.
- synthesis.md Coverage rule (:50 to :63): Mode and Tree give one line, Reader and Misroutes stay with the finding, size-only evidence is dismissed, a `not read:` folder is not covered, and the integration merge line is handled. Inputs missing lists legibility-reviewer (:33). Agrees with legibility-reviewer.md:357 to :427, apart from LOW-6.
- CONTRACTS.md section 1 (:61 to :67) matches the agent's Severity (:281 to :309): REC and DEBT by default, LOW for a false map, MEDIUM only for a misroute with three citations, never HIGH, no size evidence. The agent's extra LOWs (a generated file hand-edited, a written size rule) sit inside section 1's general LOW bar. Its reading that the "hard constraint" sets no MEDIUM floor matches the literal CONTRACTS.md:26 ("calls a hard rule"). Conventions/CLAUDE.md:75 to :77 does not call it one.
- CONTRACTS.md section 4 (:186 to :198, :210 to :212) and section 5 (:238 to :239, :318 to :324) agree with review.md and the agent on the map fence, the tree lists and `maps`.
Relay as one system:
- `plugins/djinn/agents/` holds 24 files. Every agent named in review.md scopes and triggers, dispatch.md, relay.md:139 to :201, README.md:188 to :213 and CONTRACTS.md has a file, and README lists all 24.
- Descriptions against scopes: every description now matches review.md except the four in LOW-2. devils-advocate.md:3, perf-reviewer.md:3, breaker.md:3, multiuser-reviewer.md:3, legibility-reviewer.md:3 and proof-runner.md:3 agree. live-system-reviewer.md:84 "any scope but ideas" is harmless in `live` (round 1 note) and now also wrong for `map`, part of the same drift.
- Config keys: every key an agent reads is in CONTRACTS.md:225 to :299 and templates/config.yaml, and is pasted. `maps` and `data.generated` go through review.md:407 to :415 and dispatch.md:350 to :353. `ui_paths` goes through review.md:399 to :400. `data.invariants` goes through review.md:397 to :398. `proof.*`, `lane_timeout_s` and `harness_timeout_max_s` go through dispatch.md:43 to :49, :163 to :166, :271 to :278 and review.md:597 to :604. `cost` and `proof.heap_mb` go through review.md:391 to :393. `live` and `cost.paid_apis` go through review.md:403 to :405. Step 1 reads them all at review.md:18 to :25 and dispatch.md:39 to :49. The one unread paste is LOW-4.
- Round ownership: no agent file asks for a status section (grep), and consolidator.md:49 to :50 reads synthesis's table. That is consistent.
- README.md:173 and CONTRACTS.md:211 to :212 carry the two tree files. review.md:631 to :632 now allows `mv`, which closes the wiring writer's second "seen" note.
Size rules:
- The four flagged caps stand as written and none is a structure rule: `MAX_FILES_CEILING` (proof-runner.md:60, CONTRACTS.md:347), the 16 KB and 4 KB cut (proof-runner.md:224, :238), `large_file_kb` (review.md:318 to :320, which lists and blocks nothing), and `tokens=` (CONTRACTS.md:433).
- The only size rule found in a fenced file is LOW-1. format-reviewer.md:61 to :63 and pipe-connector.md:23 to :24 and :83 to :84 are clean. The template's 40-line `project_notes` rule is gone (templates/config.yaml:142 to :146). proof-runner's 20-line failure cut is now a content cut (:359 to :362). Round 1 REC-12 (80 columns) was not applied (relay.md:143 is unchanged).
- The known-bugs index has no cap: consolidator.md:100 to :102 ("There is no cap on entries"). known-bugchecker.md:44 to :55 reads the language and bug-type layout with no count.
- Other numbers the grep found are process or safety counts, not size rules, and predate this diff: dispatch.md:95 and :466 (4 fixers), :238 (3 rounds), fixer.md:88 (3 attempts), security-reviewer.md:64 and proof-runner.md:366 (secret-shape heuristics), multiuser-reviewer.md:131 to :134 (consumer counts). The new ones are REC-1 and REC-2.

## Files read outside the fence
- `plugins/djinn/agents/gap-hunter.md` (grep only: count caps)
- `plugins/djinn/commands/status.md` (grep hit only: RESOLVED)
