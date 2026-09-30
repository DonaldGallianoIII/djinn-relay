---
title: Prompt review of perf-reviewer.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `plugins/djinn/agents/perf-reviewer.md` (77 lines).
Read alongside: `relay.md`, `commands/review.md`, `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`, `~/Conventions/code/DOCBLOCKS.md`, and the sibling agents for overlap only.

**1. Severity is defined on growth shape, not on impact, so it does not mean the same thing as HIGH in the other agents** (line 55 to 59)
Current: "HIGH: Per-frame allocation or cost that scales with scene complexity ... MEDIUM: One-time cost that could be avoided ... LOW: Micro-optimization that's technically correct but worth noting for the pattern index."
Proposed:
```
# Severity

Severity is impact, not pattern. A HIGH blocks shipping (synthesis.md), so it
has to be a cost the user would notice.

- **HIGH:** The cost is unbounded or grows with the working set on a hot path,
  and a realistic session (state the length: a 10-minute editing session, 1000
  requests, one training epoch) would breach the budget the project config
  names, or memory would climb without a ceiling.
- **MEDIUM:** A bounded, repeated cost on a hot path, or a one-time cost that
  is avoidable and visible (a stall on a mode switch, an unthrottled upload).
  Does not get worse over time.
- **LOW:** Correct and cheap today; worth naming because the pattern would be
  expensive if copied into a hot path. Never blocks.

State the frequency and the arithmetic that put a finding in its tier.
```
Why: bugs-reviewer line 30 and integration-reviewer line 38 tie HIGH to what happens under realistic conditions; synthesis line 25 makes any HIGH a ship blocker. Under the current wording a single 24-byte object allocated at 60 Hz is HIGH and blocks ship, which is not what the owner means (relay.md line 81: LOW never blocks; REVIEW.md line 45 ranks performance last). "Worth noting for the pattern index" also contradicts consolidator.md line 18, which indexes only HIGH and MEDIUM.

**2. The verification clause covers allocations only and never has to show its work** (line 12, and line 66 to 69)
Current: "Before flagging an allocation, confirm it actually runs per-frame by tracing the call path from the render observer or pointer handler to the flagged code."
Proposed (replace line 12):
```
**Skeptical verification:** Before flagging anything, trace the path from a
hot-path entry point (render callback, request handler, input handler,
training step, whatever the project config names) to the flagged line, and
put that path in the finding, one file:line per hop. State how often the
entry point fires. An allocation, a recompute, or an upload in setup code is
fine; the same line reached from a hot entry point is a finding. If you
cannot show the path, it is not a finding; put it under Checked and Clean
with the reason. Count, do not clock: derive cost as (calls per unit) x (cost
per call) from the source and label it "estimated from source". Never
present a number as measured.
```
And add two fields to the finding template (line 66 to 69):
```
**Path:** entry point file:line -> ... -> flagged file:line, with the trigger frequency
**Cost:** calls per frame/request x cost per call, estimated from source
```
Why: the current clause names allocations only, so the GPU and data-structure sections (line 28 to 40) carry no verification rule at all. Line 52 asks for "estimated allocations/sec, ms/frame, VRAM" with no method, which invites invented numbers that synthesis cannot check; a written path and a count are checkable by the two developers deliberating in Phase 2. This is the same rule as DOCBLOCKS.md "count ops, do not time it".

**3. Lines 18 to 46 are a Babylon.js and V8 checklist; they belong in the per-project config, with a generic scope left behind** (line 18 to 46)
Current: four subsections naming `Vector3`, `ToRef`, `freezeWorldMatrix`, `updateVerticesData`, `scene.pick()`, `getActiveMeshes()`, thin instances, V8 interning.
Proposed:
```
# Scope

Read the project config's performance section first. It names the hot-path
entry points, the frame or latency budget, and the project's known expensive
patterns. Those patterns are in scope and take priority. Without a config,
apply only the generic list below and say in the report that no project
list was found.

Generic, any language:
- Allocation inside a hot path that could be hoisted, pooled, or reused
- Work recomputed per call whose inputs did not change (missing cache, missing
  dirty flag, missing freeze)
- Collections that grow on a hot path and are never cleared or bounded
- Full re-upload, re-serialize, or re-render where a partial update exists
- Unthrottled IO or sync points on a hot path (uploads, disk, network,
  device-to-host copies)
- Nested iteration whose bounds are not what the doc block claims
- Blocking calls in async or per-request paths
```
Move line 20 to 46 verbatim into the engine repo project config as its perf pattern list. Delete line 43 outright: "do they allocate or return cached?" is a question the agent cannot answer without reading library source outside the fence. Put the answer in the config or drop it.
Why: decision 2. Line 22 and line 38 also duplicate each other (template-literal strings and template-literal Map keys are one pattern). The relay is about to run on Python and JAX projects (devils-advocate line 37, test-strategist line 31) and on the voice-call service, where "per-frame" means nothing and "per-request" and "per-step" mean everything.

**4. Call-graph following is scope creep unless the fence and the out-of-fence reads are reported** (line 10)
Current: "Read every changed file in full, then follow the call graph into any method called from a render loop or pointer handler."
Proposed:
```
Read every file in the changed-file list pasted into your dispatch, in full.
To trace a path you may read a caller or callee outside that list, and you
must list each such file under "Read outside the fence" at the end of your
report, with one line saying why. Do not report findings in files outside
the list; if you see one, name the file under "Read outside the fence" as
"possible finding, out of scope" and stop.
```
Why: decision 1 makes the changed-file list a hard fence and has synthesis report out-of-fence reads; the prompt currently has no hook for either. Tracing callers is the right behavior for a perf reviewer, so allow it and make it visible rather than ban it.

**5. Hardcoded memory index and the "36+ anti-patterns" claim** (line 10)
Current: "Read the bugs_to_avoid index at the project's Claude memory directory ... it contains 36+ known performance anti-patterns specific to this engine."
Proposed: delete the sentence; the config reference in suggestion 3 replaces it. Add instead: "If known-bugchecker already flagged a line, cite its finding and do not re-derive it."
Why: decision 2 moves the memory path and the count into config. review.md line 67 already tells every agent to focus on what known-bugchecker missed; the prompt should say what to do when it did not miss. Also "Claude memory directory" is a Claude-only concept (decision 6).

**6. Three other agents already own pieces of this scope; say who reports what** (line 20 to 26 and line 39)
Current: per-frame allocations and unbounded growth are listed here, in bugs-reviewer line 20 and 24, in known-bugchecker line 19, and in breaker line 28 (DEGRADE).
Proposed: add under Role:
```
Division of labor: bugs-reviewer owns leaks that cause wrong behavior.
known-bugchecker owns patterns already in the project index. breaker owns
growth an attacker can force. You own cost: what a normal session pays. If
a growth bug is both a leak and a cost, report the cost and add "also a
leak; expect bugs-reviewer" in one line so synthesis can merge.
```
And flag for the bugs-reviewer review: its line 24 ("Per-frame allocations") should probably go, since perf-reviewer runs in every scope bugs-reviewer does except `quick`.
Why: in `standard` scope the same allocation can arrive as KNOWN-HIGH, HIGH (bugs), and HIGH (perf); in `perf` scope an unbounded Map arrives as perf HIGH and breaker DEGRADE, which synthesis maps to MEDIUM (synthesis.md line 28), so synthesis must arbitrate a tier conflict every time. Naming the owner cuts the triple-report at the source.

**7. The report has no attribution header, which AGENTS.md makes mandatory** (line 61 to 77)
Current: the output starts at "## Findings".
Proposed: prepend to the output template:
```
---
title: perf-reviewer report, <audit folder name>
author: <model name as dispatched> (perf-reviewer)
date: <date>
status: audit finding, not yet deliberated
---
```
Why: AGENTS.md line 10: "Any file an agent writes into a repo carries an attribution header naming the model that produced it." Audit reports land in `audits/` inside the repo. None of the agent prompts do this; fix it here and flag it for the others, or put it in the shared dispatch prefix once.

**8. Add a doc-block tag check; it is the one perf check nobody else does** (new, after Scope)
Current: nothing.
Proposed:
```
# Doc block tags

If the project uses `@alloc` and `@complexity` tags (see the project config),
compare each tag on a changed hot-path function to the code. A tag that
claims "zero per tick" over a function that allocates is a MEDIUM finding
titled "stale @alloc", regardless of the allocation's own severity. A
`@complexity` bound the code can exceed is likewise MEDIUM.
```
Why: DOCBLOCKS.md line 47: "A wrong @alloc is actively misleading. Someone will trust it and skip the check." The lint proves presence, not truth (line 60 to 62); a reviewer who has already traced the path is the only thing that checks truth. No other agent reads these tags.

**9. Delete "How to report"; it duplicates the output format** (line 48 to 53)
Current: "For each finding, explain: What ... Why it's bad ... How to fix ..."
Proposed: delete.
Why: line 66 to 69 say the same three things with the same names. Two copies drift.

**10. The description undersells when the agent runs and is engine-specific** (line 3)
Current: "Invoke on any change to code that runs during render loops, pointer handlers, or per-frame observers."
Proposed: "Cost auditor. Finds code that is correct but expensive on a hot path: allocation, recompute, unbounded growth, unthrottled IO. Runs in standard, full, and perf scopes; the project config names the hot paths."
Why: relay.md line 96 puts perf-reviewer in `standard`, so it runs on most work, not only render code. The current wording could make a custom-scope dispatcher (review.md line 21) skip it on a request handler change.

**11. Severity anecdote and V8 claim are project lore** (line 57 and line 22)
Current: "These are the bugs that cause 'low hardware util but tanked FPS.'" and "(NOT interned by V8)".
Proposed: delete both, or move the FPS line to the engine repo config as the symptom description for its HIGH tier.
Why: a reviewer on the voice-call service has no FPS. The V8 note is a runtime detail that belongs with the pattern it explains, in config.

**12. Mark the Claude-only surface for the Codex adapter** (line 1 to 6 and line 10)
Current: `tools: Read, Grep, Glob`, `model: opus`, "the project's Claude memory directory".
Proposed: keep the frontmatter, add one HTML comment under it: `<!-- Claude Code agent frontmatter. tools and model are Claude-only; an adapter maps them. -->`. The memory-directory reference goes with suggestion 5.
Why: decision 6. The frontmatter is the whole Claude-specific surface of this file once the memory path is gone; one comment tells the adapter author where to look.

**13. Round 2 has no mode in this prompt** (new)
Current: nothing. relay.md line 69 says Round 2 agents "verify each Round 1 HIGH/MEDIUM is resolved".
Proposed:
```
# Round 2

If the dispatch says Round 2, begin the report with a "Round 1 status"
section: each Round 1 finding assigned to you, marked RESOLVED, NOT
RESOLVED, or REGRESSED, with the file:line that proves it. Then review the
fix diff and its callers as a normal run.
```
Why: without this, Round 2 output has the same shape as Round 1 and synthesis has to diff two reports by hand to see what closed. Cross-agent; the same block fits every reviewer, or once in the dispatch prefix.

**14. Make Why readable by someone who has never opened a profiler** (line 68)
Current: "**Why:** Estimated impact (allocs/sec, ms/frame, VRAM growth)"
Proposed: "**Why:** What the user sees (stutter every N seconds, memory climbs until the tab dies, request latency doubles at N items), then the cost arithmetic from the Cost field."
Why: the two developers deliberating in Phase 2 have never used a pull request; "GC pressure" and "VRAM growth" will not tell them whether to write a brief. A symptom will.

**15. Em dashes throughout** (lines 10, 16, 43, 51, 52, 53, 66, 67, 71, 73)
Current: em dashes as separators, including in the output template at line 66.
Proposed: replace with colon or period; the template line becomes `### [HIGH] file:line: description`, or keep a plain hyphen there if synthesis greps for the separator.
Why: the owner's voice rule applies to all writing. The template matters most, because every report copies it. Check that synthesis.md and brief.md do not parse on the em dash before changing it.

**Keep**

- Frontmatter tools and model (line 4 to 5): Opus, read-only. Matches decision 3 and REVIEW.md hardware budget.
- Role (line 14 to 16): "correct but expensive" is the right one-line charter. Trim the em dash and keep.
- Finding header shape `### [HIGH] file:line` and "Checked and Clean" (line 66, 75 to 76): identical to bugs-reviewer and integration-reviewer, so synthesis can consume it mechanically. Keep, and add the Path and Cost fields from suggestion 2 and the "Read outside the fence" section from suggestion 4.
- The constructor-versus-hot-path example at line 12: keep the shape, drop the Babylon names (folded into suggestion 2).

**Summary**

Keep 4 / change 10 / delete 3 (How to report, line 43, the FPS anecdote and V8 note).
Most important change: suggestion 1 with suggestion 2 together. Redefine HIGH as impact under a realistic session and require every finding to show its traced path and its count-based cost, so a perf HIGH means the same thing as a bugs HIGH when synthesis decides whether to block the ship.
