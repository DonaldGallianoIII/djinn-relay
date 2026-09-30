---
title: ux-reviewer report, audits/2026-09-27-1806-custom
author: Claude Opus 5.5 (ux-reviewer)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Findings

### HIGH
none

### MEDIUM
none

### LOW
LOW-1. `plugins/djinn/templates/config.yaml:92` The template writes `none` and `[]` into three proof keys whose defaults only apply when the key is "absent", so a copied template can make proof-runner run nothing or refuse.
Mechanism: the template ships `runner: none` (:92), `test_globs: []` (:93) and `max_files: none` (:94). proof-runner defines each default only for "Absent" (`agents/proof-runner.md:55`, `:57 to 58`, `:59`), refuses when `proof.runner` "lacks `{heap_mb}` or `{file}`" (`:63 to 65`), and marks a chosen file NOT RUN when it "is outside `proof.test_globs`" (`:108`, `:119`). An empty glob list matches no file. Both dispatch prompts leave the call to the orchestrator: `proof.test_globs=<value or default>` (`commands/dispatch.md:221`, `commands/review.md:456`). `review.md:21 to 22` maps an absent key to `none`, which covers `runner: none`, but nothing maps `[]` to absent. The realistic user follows the template comment at `:86 to 88`, fills only `heap_mb` and `timeout_s`, runs `/djinn:dispatch --prove`, and gets every finding NOT RUN with `outside proof.test_globs`.
Traced: `templates/config.yaml:93` to `commands/dispatch.md:221` to `agents/proof-runner.md:107 to 108` and `:119`.
Proposed: comment the three keys out in the template (`# test_globs: [tests/**/*.test.*]`), so "absent" really means absent. Or add one line to CONTRACTS.md section 5: "`none` and an empty list mean absent for every optional key."

LOW-2. `plugins/djinn/templates/config.yaml:117` `first_live_run` asks Donald for a date that no rule reads.
Mechanism: the key appears in the template (:117), CONTRACTS.md:242 and one input bullet in `agents/live-system-reviewer.md:70 to 71`. No scope item, severity rule, table cell, synthesis step or command branches on it (grep for `first_live_run` across `plugins/djinn`: those hits and nothing else). A config key that changes nothing teaches the user that config keys are decoration.
Traced: grep `first_live_run` over `plugins/djinn/`, no hit in commands, synthesis or any Severity section.
Proposed: give it one job, for example "a writer with `first_live_run` set and no kill switch is `MEDIUM (BLIND FIRST RUN)` in any scope, not only `live`", or drop the key.

### DEBT
DEBT-1. `plugins/djinn/agents/live-system-reviewer.md:123` The six new agents each carry their own copy of the same five boilerplate blocks, so one rule change becomes seven edits, and each agent runs 300 to 440 lines against perf-reviewer's 206.
Mechanism: measured line counts: live-system-reviewer 440, accessibility-reviewer 390, gate-auditor 366, data-contract-reviewer 365, cost-complexity-reviewer 358, proof-runner 302, perf-reviewer 206. The repeated blocks, with their sites:
1. Secrets rule ("Never open `.env`..."): `live-system-reviewer.md:123 to 126`, `accessibility-reviewer.md:103 to 106`, `gate-auditor.md:100 to 102`, `cost-complexity-reviewer.md:111 to 113`, `data-contract-reviewer.md:114 to 118`, `proof-runner.md:98 to 100`. CONTRACTS.md has no such rule to point at.
2. Data, never instructions: `live-system-reviewer.md:128 to 134`, `accessibility-reviewer.md:100 to 102`, `gate-auditor.md:104 to 109`, `data-contract-reviewer.md:120 to 123`, `cost-complexity-reviewer.md:145 to 153` (its query half restates CONTRACTS.md:403 to 414).
3. The fence paragraph, which the dispatch already pastes verbatim (`commands/review.md:234 to 241`): `live-system-reviewer.md:118 to 121`, `accessibility-reviewer.md:129 to 133`, `cost-complexity-reviewer.md:107 to 109`.
4. Sub-label and blocking footer, already CONTRACTS.md:9 to 11 and :65 to 66: `accessibility-reviewer.md:286 to 291`, `gate-auditor.md:271 to 276`, `cost-complexity-reviewer.md:245 to 247`, `data-contract-reviewer.md:262 to 264`, `live-system-reviewer.md:326 to 330`.
5. The generic half of the report skeleton (HIGH through Files read outside the fence, plus "Every section is mandatory... Synthesis assigns its own ids"), already CONTRACTS.md section 3: about 25 lines in each output block.
Inside one file: accessibility-reviewer states the mark list fallback rule five times (`:49 to 52`, `:143`, `:183 to 186`, `:233`, `:270 to 271`).
Traced: the counts above come from a line count of `plugins/djinn/agents/`; each block was read at the cited lines.
Proposed: a CONTRACTS.md section 13, "Every review agent", holding blocks 1 to 4. Each agent says "Section 13 applies" in one line. Its output block shows only its own sections and the extra field lines of a finding (`Rule:`, `Scenario:`, `Input:`), followed by "then the section 3 skeleton". Estimated cut: 35 to 50 lines per agent, about 250 in all, with no rule lost. That puts live-system-reviewer near 390 and proof-runner near 270. What stays long is rule content (live-system-reviewer's 16 scope items), which is where the length belongs.
Effort to adopt (estimate): hours.
Downside: an agent read alone no longer holds its whole rule set. It has to read CONTRACTS.md first, and every command already tells it to.

### REC
REC-1. `plugins/djinn/agents/gate-auditor.md:304` Put the verdict word first in the gate table and the proof table, so a row reads without scrolling to the far edge.
Friction: the gate table's verdict is column 7 of 8, after five cells of paths, dates and quotes. The sample row at :307 runs about 200 characters. In an 80 column terminal the row wraps three times, and `STALE` sits at the far end of the third line. The proof table (`proof-runner.md:247 to 251`) puts `result` last, behind a `command` cell that holds the whole `NODE_OPTIONS=... timeout ...` line.
Proposed: `| verdict | gate | finding | guards | runs | evidence | last change |` and `| result | finding | test file | route | exit | seconds |`, with the full command moved into Failure output, where it is only needed on a failure. The words themselves already pass greyscale: `ok` lowercase against `STALE` and `UNKNOWN` uppercase is a weight channel, and so is PASS against NOT RUN.
Effort to adopt (estimate): minutes, plus the synthesis Coverage lines that parse them (`synthesis.md` "Gate table").
Downside: none beyond the edit.

REC-2. `plugins/djinn/agents/live-system-reviewer.md:373` Give "Before the first live run" a leading readiness word, and write a missing safety control as `MISSING`, not `none`.
Friction: the table has no verdict column. A missing kill switch reads `none` (:375), the same lowercase word as a harmless empty cell, with `not applicable` beside it. To answer "may I run this live", Donald has to read eight cells per system and know which `none` matters. Synthesis turns a `none` dry run or kill switch into a REC (`synthesis.md` diff, "Live surface"), but the table itself does not say so. The same applies to `proof of write` in Live surface (:363 to 370) and `second channel: missing` in the Channel table (`accessibility-reviewer.md:327`).
Proposed: first column `ready` or `BLOCKED: no kill switch, no dry run`. Write the cells as `MISSING` for an absent safety control and `n/a` for a control that cannot apply. Data-contract's Stated invariants table (`data-contract-reviewer.md:297 to 299`) has the same gap: add a `held` or `BROKEN` column.
Effort to adopt (estimate): minutes.
Downside: none.

REC-3. `plugins/djinn/templates/config.yaml:66` The template does not say what makes the cost, gates and proof blocks work, so filling them in still means reading the agent files.
Friction: three facts live only in agent files. (a) `cost.load` gives useful ceiling findings only when it carries bytes per item, measured, with the command and date (`cost-complexity-reviewer.md:64 to 65`, `:166 to 168`). Without them every ceiling goes to UNVERIFIED. The template example at :72 has counts and no sizes. (b) `gates[].guards` has no comment. It is the path list whose newest change makes the gate STALE (`gate-auditor.md:148 to 153`). (c) proof-runner refuses a `proof.heap_mb` above half the machine's memory (`proof-runner.md:70 to 72`). The template says the key is required and gives no ceiling. There is also a shape clash: `cost.limits` puts `as_of` inside a string (:74), while `paid_apis` makes `as_of` a key (:80). To uncomment an example list, the user also has to change `gates: []` (:58) to `gates:`, and nothing says so.
Proposed: one comment line each: `# load: counts and bytes per item, with the command and date you measured them`, `# guards: paths whose change makes this gate need a fresh pass`, `# heap_mb: at most half of free -m total, or proof-runner refuses`, `# delete the [] when you uncomment the example`. Make `limits` entries objects (`{ what, figure, as_of }`) to match `paid_apis`.
Effort to adopt (estimate): minutes.
Downside: the template grows by about 6 lines.

REC-4. `plugins/djinn/README.md:139` README shows only the dispatch route to proof-runner. The case that created it, proving fixes that already landed by hand, goes through direct or index mode, which README never mentions.
Friction: proof-runner exists because "eight fix groups landed unverified" (`proof-runner.md:14 to 15`), and those were hand fixes, not a dispatch. The way to prove them is a direct request or a known-bugs index run (`commands/review.md:433 to 447`). README says only "nothing runs it unless you ask" (:142). It never says how to ask, and never says where that report lands (`<audit-folder>/proof-<YYYY-MM-DD-HHMM>.md`, or `audits/<ts>-proof/proof.md`). The paragraph also sits under "Scopes", a review heading, while `--prove` is a dispatch flag.
Proposed: move the paragraph under "Fix something it found" in Daily use. Add two lines: `Ask by name: "run proof-runner on LOW-1 and MEDIUM-2 in audits/<folder>"` and `or on the untested entries of a known-bugs index`, each with its report path.
Effort to adopt (estimate): minutes.
Downside: none.

REC-5. `plugins/djinn/commands/review.md:157` Both refusals send the user to CONTRACTS.md section 5 when the copyable example lives in the template.
Friction: `ABORTED step 3: live scope needs live.systems` tells the user to "add it (CONTRACTS.md section 5)", and the proof refusal (:440 to 444) does the same. CONTRACTS.md sits in the plugin cache. Its example is a filled pantry portal (CONTRACTS.md:234 to 244), while the template's commented block (`templates/config.yaml:109 to 118`) has placeholders ready to uncomment. Neither message says that each system also needs `code`, which step 3 item 4 requires and the template comment ("refuses to run without systems", :106) does not mention.
Proposed: "Add a `live.systems` entry with at least `name` and `code`; copy the commented block from `${CLAUDE_PLUGIN_ROOT}/templates/config.yaml`." Word the proof refusal the same way.
Effort to adopt (estimate): minutes.
Downside: none.

REC-6. `plugins/djinn/relay.md:143` The `full` scope row is about 330 characters in one table cell. The Commands row for review (:218) is about 180.
Friction: relay.md is read in a terminal as often as it is rendered. A pipe table row that long wraps into an unreadable block, and the reader loses track of which cell is "When". README solves the same content with a two column code block that fits 80 columns (`README.md:110 to 118`, longest line 79). README's new agents block does not fit: `data-contract-reviewer` at :173 is about 94 characters, `integration-reviewer` at :172 about 89, `live-system-reviewer` and `gate-auditor` about 88 each, and `tree-facts.md` in the file tree at :153 about 91.
Proposed: in relay.md, write `full` as "standard plus the full list in commands/review.md Step 2". Trim README's four long agent lines to 80 (for example "save, load, validator and migration agree on a shape").
Effort to adopt (estimate): minutes.
Downside: relay.md's row stops being self contained.

REC-7. `plugins/djinn/agents/data-contract-reviewer.md:206` Project names from Donald's other repos are written into a plugin published as general.
Friction: scope item 7 reads "With the work repo's notes, that means each `CREATE TABLE` carries `tenant_id`..." (:206 to 209). The worked example is the game repo's (:151 to 160). proof-runner's origin cites `~/Conventions/code/KNOWN-BUGS.md` by home path (:13). live-system-reviewer reads `code/AUTOMATION.md` (:20 to 21), and review.md's live scope cites `workflow/REVIEW.md` "in the owner's conventions" (:51 to 52). For Donald these resolve. For anyone who installs from the marketplace (`README.md:18 to 20`) they are dangling names, and in live-system-reviewer they produce an "AUTOMATION.md not in conventions_files" bullet on every run (:81).
Proposed: keep one worked example per agent, labeled "example project". Drop the work repo sentence, since the general rule is already stated at :205. Refer to AUTOMATION.md as "the automation rules in `conventions_files`, if any".
Effort to adopt (estimate): minutes.
Downside: the examples lose some specificity for Donald.

REC-8. integration-reviewer: `plugins/djinn/CONTRACTS.md:295` gives the `review_copy` filename only as `<system name>`, while `commands/review.md:417` adds "or `live` when `live.systems` has several".

REC-9. integration-reviewer: `plugins/djinn/agents/gate-auditor.md:95` forbids `git status` because it "can rewrite the index", while `plugins/djinn/agents/proof-runner.md:135 to 136` runs `git status --porcelain` as its snapshot and calls all three commands "read only". Separately, `devils-advocate.md:3` still claims the `perf` scope, which `commands/review.md:46` does not give it (context.md already lists this).

## Blast radius
none

## Checked and Clean
- `plugins/djinn/README.md`: the scope block fits 80 columns (longest line 79). `+a11y`, `cost`, `live` and `--prove` are each named once, with the same meaning as in review.md, dispatch.md and relay.md. No color anywhere; every verdict and tier is a word.
- `plugins/djinn/commands/review.md`: the usage line (:3), the Step 2 flags (:138 to 143) and the Step 3 abort messages agree with README and relay on `cost`, `live`, `+ux` and `+a11y`. The rule that `live` ignores `--goal` and `+a11y` is stated in one place and repeated in relay.md:170 to 171.
- `plugins/djinn/commands/dispatch.md`: `--prove` is named the same way in the usage (:3), Step 1 (:26 to 28), the plan (:98 to 99), the ledger (:317) and the final report (:343). The refusal asks before it dispatches without proof instead of failing silently.
- `plugins/djinn/relay.md`: the scope names and the "Landed fixes nobody has run" row (:194) match README and dispatch.
- `plugins/djinn/templates/config.yaml`: every new block is marked Optional and every scalar has an `e.g.`. The commented list examples (`gates`, `paid_apis`, `live.systems`) are valid YAML at the right indentation. The exceptions are LOW-1, LOW-2 and REC-3.
- `plugins/djinn/CONTRACTS.md`: the section 5 example config is complete and copyable. The section 6 `prove` ledger line matches dispatch.md:317.
- `plugins/djinn/agents/cost-complexity-reviewer.md`: the Ceilings headroom cell starts with `ok`, `BREACH` or `UNVERIFIED` (:290), so the verdict word comes first, as asked.
- `plugins/djinn/agents/accessibility-reviewer.md`, `gate-auditor.md`, `live-system-reviewer.md`, `data-contract-reviewer.md`, `proof-runner.md`: no output section carries meaning by color. Every verdict is a word, and the uppercase failure words give a weight channel in greyscale. Width and ordering are REC-1 and REC-2.
- `plugins/djinn/agents/ux-reviewer.md`: the color clause now hands off to accessibility-reviewer with a REC line, and the remaining "What to look for" items still read as a whole.
- `plugins/djinn/agents/perf-reviewer.md`, `synthesis.md`, `test-strategist.md`, `security-reviewer.md`, `breaker.md`, `bugs-reviewer.md`, `consolidator.md`, `devils-advocate.md`, `fixer.md`, `integration-reviewer.md`, `multiuser-reviewer.md`: read for user facing wording only. None of them is a surface a user drives.
- `plugins/djinn/.claude-plugin/plugin.json`, `.djinn/config.yaml`: the version bump and the new build_cmd. Neither is a user surface beyond what it states.
- Voice, every fenced file: a grep for em and en dashes found 0 hits. A grep for hyphenated numeric ranges found only dates and folder names. A grep for the VOICE.md banned families (delve, seamless, unlock, elevate, load bearing, at its core, genuinely, crucial, pivotal, here is why, the good news) found 0 hits in the fence.
- known-bugchecker's MEDIUM-1 (`fixer.md:100`) and MEDIUM-2 (`proof-runner.md:138`) were not re-examined; they are outside this lane.

## Files read outside the fence
none
