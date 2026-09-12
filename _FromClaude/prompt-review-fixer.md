---
title: Prompt review of fixer.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/fixer.md` (131 lines).
Cross-read: `relay.md`, `commands/dispatch.md`, `commands/brief.md`,
`templates/fix-brief.md`, `agents/pipe-connector.md` (headings only),
`agents/synthesis.md`, `~/Conventions/workflow/REVIEW.md`,
`~/Conventions/workflow/AGENTS.md`, `~/Conventions/code/DOCBLOCKS.md`.

The prompt is in good shape structurally. The work-set guard is the right
idea and the status vocabulary matches what `dispatch.md` parses. The gaps
are all in verification: the fixer never confirms the defect exists, never
takes a build baseline, and claims doc-block silence. Suggestions below,
highest impact first.

**1. The fixer never checks that the defect is actually there** (line 38 to 41, Step 2)
Current: "Read every file in `work_set.files` in full. Read the audit references listed in REFERENCES"
Proposed: add a third bullet and a stop condition:
"- Locate the defect WHY describes in the current file state. Quote the line
  in your report. If it is not there (a `depends_on` brief already fixed it,
  or the reviewer misread), STOP and return BLOCKED_OTHER with what you
  found instead. Never apply a fix to code that does not have the problem."
Why: reviewers are sometimes wrong, and `depends_on` briefs can have already
changed the line. Right now the fixer edits on the reviewer's word. This is
the skeptical-verification clause REVIEW.md line 21 to 23 requires, and the
prompt has none.

**2. "Pre-existing" build errors are an unverified claim** (line 56 to 62, Step 5)
Current: "If build fails with pre-existing errors unrelated to your edits, note them in your report, do NOT fix them. Mark status PASSING-BUT-PRE-EXISTING."
Proposed: add a baseline step before any edit, at the end of Step 2:
"- Run the project's verify command once BEFORE editing. Save the error
  list. This is your baseline. An error is pre-existing only if it appears
  in the baseline verbatim (same file, same line, same message)."
Then in Step 5 replace the three branches with:
"- New errors, all inside work_set.files: fix, re-run. Three attempts
  maximum, then BLOCKED_BUILD.
- New errors in any file outside work_set.files: BLOCKED_SCOPE.
- Only baseline errors remain: FAILING-PRE-EXISTING, proceed to Step 6."
Why: without a baseline the fixer cannot tell a cascade from an old error,
so line 61 and line 62 are the same observation with opposite verdicts.
BLOCKED_BUILD appears in the status list (line 95) but nothing in the
prompt says when to return it; the retry cap gives it a trigger.

**3. PASSING-BUT-PRE-EXISTING is a contradiction and dispatch will halt on it** (line 62, line 105)
Current: "PASSING-BUT-PRE-EXISTING"
Proposed: "FAILING-PRE-EXISTING". Add one line under Build Status:
"FAILING-PRE-EXISTING means the verify command exits non-zero and every
error is in the baseline. Dispatch's build gate will still halt; say so in
Scope Notes so the orchestrator is not surprised."
Why: the build is not passing. `dispatch.md` line 119 runs the build after
the batch and halts on failure, so a fix reported as "PASSING" then stops
the run. Two developers who have never used this flow will read "PASSING"
and assume the gate is clear.

**4. `npm run build` is hardcoded** (line 57, line 3 of dispatch prompt block, template line 30 and 44)
Current: "Run `npm run build` via Bash. Capture output."
Proposed: "Run the project's verify command as given in the per-project
config (field name to match whatever the config settles on, e.g.
`verify`). If the config names no verify command, do not invent one: set
Build Status to NOT-RUN and say so in Scope Notes."
Why: decision 2. The same string is in `dispatch.md` line 85 and 119 and
`fix-brief.md` line 30 and 44; all four need the same hook or the brief and
the fixer will disagree about what "build passes" means.

**5. Tests never run** (Step 5, line 56 to 62)
Current: only the build is run.
Proposed: after the verify command passes, add:
"Run the project's iteration-lane test command from the config (tests that
reference the files in work_set.files). Report the count run and the count
failed. If the config has no test command, report TESTS: NOT-RUN. If a test
fails that passed in the baseline, treat it exactly like a new build
error (rule 2)."
Why: REVIEW.md line 57 to 60 defines the iteration lane as "while editing,
run only the tests that reference the changed modules". A type-check that
passes proves the code compiles, not that it does what WHAT says. Take the
test baseline in the same pre-edit step as the build baseline.

**6. "Do NOT add explanatory comments" will be read as "do not touch doc blocks"** (line 54)
Current: "Do NOT refactor neighboring code. Do NOT add explanatory comments. Do NOT improve unrelated style."
Proposed: keep the line, then add:
"Exception, and it is mandatory: if your edit changes what a function
reads or writes, its complexity, or its allocation, update that function's
`@interacts`, `@deps`, `@complexity`, `@alloc`, or `@rng` tag in the same
edit. A stale tag is a defect you introduced."
Why: DOCBLOCKS.md line 45 to 51: stale tags are worse than none and are
updated in the same commit. As written, a careful fixer will obey line 54
and leave a tag that now lies. REVIEW.md line 51 to 53 lists "the doc block
tags match the code" as a required check on agent-written code.

**7. Three different rules for signature changes** (line 24, line 47, line 78)
Current: line 24 "symbols whose implementations you may alter"; line 47 "Every signature change must be for a symbol in `work_set.symbols_touched`"; line 78 "Change a function signature whose callers extend outside work-set" (STOP).
Proposed: one rule at line 24, delete line 47 and line 78:
"`work_set.symbols_touched`: you may change the body freely. You may
change the signature only if every caller is in `work_set.files`; grep to
confirm before editing. Any caller outside, STOP (BLOCKED_SCOPE)."
Why: the three lines are reconcilable but a reader has to merge them.
Stating it once, where the field is defined, removes the ambiguity.

**8. Reads outside the fence are allowed but invisible** (line 87)
Current: "Exception: reading files outside work-set is always fine (you need context). Editing is what's guarded."
Proposed: "Reading outside `work_set.files` is allowed; you need callers
and imports. Every such file goes in the report under `## Files Read
Outside Work-Set` with one phrase on why. Editing is what is guarded."
Add the section to the Output format after Files Changed.
Why: decision 1 wants every out-of-fence read reported to synthesis. The
fixer is the one agent that must read outside; making the reads visible is
the hook, and it costs three lines.

**9. Lingering-reference grep has no verdict attached** (line 69)
Current: "Always grep for removed/renamed symbols one more time to confirm no lingering references."
Proposed: "Grep the whole repository, not just work_set, for every removed
or renamed symbol. A hit in a file outside `work_set.files` is
BLOCKED_SCOPE, not a note. A hit inside is an unfinished edit; fix it."
Why: as written the grep produces information with no instruction on what
to do with it. The work-set guard on line 75 to 78 implies the answer, but
the fixer is at Step 6 by then and has already marked itself done.

**10. Report needs an attribution header and a parseable status line** (line 91 to 118)
Current: the report starts at "# Fix Report: <brief id>".
Proposed: put YAML frontmatter above the heading:
```
---
title: Fix report <brief id>
author: <model name as given in your dispatch>
date: <YYYY-MM-DD>
status: COMPLETED | BLOCKED_SCOPE | BLOCKED_BUILD | BLOCKED_OTHER
build: PASSING | FAILING | FAILING-PRE-EXISTING | NOT-RUN
tests: <run>/<failed> | NOT-RUN
---
```
Why: `dispatch.md` line 105 saves the report verbatim into the repo at
`fixes/<id>-report.md`. AGENTS.md line 10 says any file an agent writes
into a repo carries an attribution header naming the model. Frontmatter
also lets dispatch read status by key instead of by scanning prose, and
gives decision 5's ledger line a field to copy.

**11. Shared Context hardcodes a Claude memory path and a Claude mechanism** (line 8 to 10)
Current: "Read the bugs_to_avoid index at the project's Claude memory directory"
Proposed: "Read the context files the per-project config lists (typically
the project's CLAUDE.md or equivalent and its known-bugs index). If the
config lists none, skip this step and say so in Scope Notes. Check the
known-bugs index before writing code that could mirror a listed pattern."
Why: decision 2 (project-specific paths to config) and decision 6 (the
memory directory is a Claude Code mechanism; Codex has no such place).
`known-bugchecker.md` line 10 has the same problem with a literal path;
flagging so the config field can serve both.

**12. Name the Claude-only mechanisms once so an adapter can find them** (line 4 to 5, line 52, line 129 to 131)
Current: frontmatter `tools:` and `model:`; "Use Edit/Write to apply the changes"; "You are running at max effort on Opus."
Proposed: change line 52 to "Apply the changes with your file editing
tool." Add one line under the Role heading: "Adapter note: the `tools`
and `model` frontmatter, the tool names, and the effort setting are Claude
Code specifics. A non-Claude runner supplies its own equivalents."
Why: decision 6. The prompt does not depend on anything Claude-only in its
logic, so one sentence is enough for the Codex port.

**13. Effort section** (line 129 to 131)
Current: "You are running at max effort on Opus. Take the time to read carefully, plan precisely, and verify thoroughly."
Proposed: delete the section. Keep the last sentence as the final line
of Role: "A correct fix in one pass is cheaper than three retries with
drift."
Why: the model is set on line 5 and named again on line 3. The section
adds a third mention and nothing operational. The one good sentence
survives.

**14. `Write` and `Bash` are wider than the fence** (line 4)
Current: "tools: Read, Grep, Glob, Edit, Write, Bash"
Proposed: keep the list; add under Work-set guard:
"`Write` is for creating a file that `work_set.files` names and that does
not exist yet. Nothing else. `Bash` is for the verify command, the test
command, and `grep`. No package installs, no `watch` modes, no scripts
that touch files."
Why: a Write to a new path is an edit outside the fence unless the brief
listed it. Bash with no stated limit is how a fixer ends up running
`npm install` to make a build pass.

**15. "No git operations" blocks the +/- counts the format asks for** (line 98 to 99, line 124)
Current: "path/to/file1.ts (+12 -4)" and "You do NOT commit, push, or run git operations."
Proposed: change line 124 to "You do NOT commit, push, stash, checkout,
reset, or run any git command that changes state. Read-only `git diff`
and `git status` are fine and are how you fill in the +/- counts."
Why: a literal reader of line 124 has no way to produce line 98. Dispatch
itself runs `git diff` (dispatch.md line 102), so the read-only case is
already assumed.

**16. Summary section should stand alone** (line 101 to 102)
Current: "2-4 sentence description of the actual change. What was done, not why"
Proposed: "Two to four sentences a colleague can read weeks later without
the brief: name the file, the symbol, and the change in plain words. What
was done, not why; WHY was input."
Why: decision 5 makes this the written summary of record for every landed
fix. The two developers at the workplace will read `fixes/<id>-report.md`
before they read the brief, if they read the brief at all.

**17. Line 41 names a pipe-connector section that does not exist** (line 41)
Current: "If a `pipe-connector` analysis is referenced, read its blast-radius section so you know what NOT to touch"
Proposed: "If a `pipe-connector` analysis is referenced, read its section
1 (Exports, with importers per symbol) and the 'Do not break' list under
its split plan. Those are your callers and your no-touch anchors."
Why: `pipe-connector.md` has no heading containing "blast"; the only
agent with a blast-radius section is `integration-reviewer.md` line 29.
A fixer told to find a missing section will either skip it or guess.

**18. Parallel fixers each running a build conflicts with the hardware budget** (Step 5, and dispatch.md line 51)
Current: fixer runs the verify command; dispatch runs up to 4 fixers in parallel.
Proposed: no edit in `fixer.md`. Add to Step 5: "Run the verify command
once per attempt, foreground, never in watch mode." The parallelism cap
belongs in `dispatch.md` and the per-project config.
Why: REVIEW.md line 69 to 71: "run anything that executes code serially."
Four concurrent builds on one machine is the case that rule was written
for. Flagging here so the fixer at least does not multiply it.

**19. Em dashes throughout** (line 3, 10, 14, 22 to 31, 36, 40, 49, 59 to 62, 66, 102, 109 to 111)
Current: em dashes as separators in most bullets.
Proposed: replace with colon, comma, or period across the file.
Why: the voice rule in `~/.claude/CLAUDE.md` covers all writing. Agents
copy the register of their prompt, and this report format is saved into
the repo verbatim, so the dashes propagate into `fixes/*-report.md`.

**20. Keep: Role, Work-set guard, What you do NOT do** (line 12 to 16, 71 to 85, 120 to 127)
Verdict: keep. The Role framing ("your output is code") is the clearest
sentence in the plugin. The guard's three-part BLOCKED_SCOPE report (what,
why, proposed amended brief) is exactly what `dispatch.md` line 111 to 114
consumes. "What you do NOT do" duplicates Step 4 in places but the
repetition is on the one rule that matters most.

**21. Overlap check**
No other agent produces a fixer's output, so there is no duplicate-finding
risk. `devils-advocate.md` line 72 ("the boundary of a work-set is drawn
right through the real problem") is the only other prompt that reasons
about work-sets; it is a reviewer-side complement, not overlap. The
BLOCKED_SCOPE report and a devils-advocate finding could name the same
gap from two sides, which is fine.

---

Summary: keep 3 sections (Role, Work-set guard, What you do NOT do), change 16 items, delete 1 section (Effort).
Most important change: item 1 plus item 2 together, the fixer must confirm the defect exists and take a pre-edit build baseline, or "pre-existing" and "blocked by scope" are guesses.
Second: item 6, the "no comments" rule as written makes the fixer leave stale doc-block tags, which the owner's conventions call a defect.
