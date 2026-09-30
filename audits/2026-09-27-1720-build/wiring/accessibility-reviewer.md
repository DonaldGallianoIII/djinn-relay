---
title: wiring note for accessibility-reviewer (candidate C1, gap-hunter REC-2)
author: Claude Opus 5.5 (phase 1 drafter, accessibility-reviewer)
date: 2026-09-27
status: agent output, not yet reviewed
---

Redacted for the public repo: private course and work identifiers.

Agent file: `plugins/djinn/agents/accessibility-reviewer.md`. Read only
(`Read, Grep, Glob, Write`), `model: opus`, runs in the parallel read-only
wave. No Bash, no web.

## 1. Scope membership

A conditional agent, like ux-reviewer: added to every scope except `ideas`
when its trigger fires. Not a fixed member of any scope, because a fence
with no UI file gives it nothing to read.

Optional flag, suggested, for the writer to take or drop: `+a11y` forces it
on, the way `+ux` forces ux-reviewer.

## 2. Trigger (for `commands/review.md` conditional block, lines 44 to 49)

New bullet, text to paste:

```
- **accessibility-reviewer** runs when the user passes `+a11y`, or when the
  fence contains a UI file: any path ending `.css`, `.scss`, `.less`,
  `.html`, `.htm`, `.svg`, `.vue`, `.svelte`, `.jsx` or `.tsx`; any path
  under an entry of the config's `ui_paths`; or any fenced file that
  `git grep -l -E '<UI_PATTERN>' -- <fenced files>` lists.
```

`<UI_PATTERN>`, one extended regex, for files that build DOM or draw:

```
createElement\(|getContext\(|WebGLRenderer|from ['"]three['"]|\.innerHTML|\.textContent|classList\.|addEventListener\(['"](click|pointer|mouse|wheel|key)|\\x1b\[|\\u001b\[
```

The orchestrator already holds Bash for git in Step 3, so this grep runs
there, once, over the fence. Record which trigger fired in `context.md` as
`accessibility-reviewer: triggered by <rule>` so a missing run is
explainable. The same trigger belongs in `commands/dispatch.md` wherever
the round after a dispatch rebuilds its agent list.

## 3. What the dispatch pastes

The standard fence block (`review.md` "The fence block") plus these config
lines, which the current block does not all carry:

```
  conventions_files: <list>. Read these before reviewing.
  known_bugs_index: <path or none>
  ui_paths: <list or none>
  project_notes: <text or none>
  goal_doc: <path or none>
  hot_paths: <list or none>
  build_cmd: <value or none>
  test_cmd: <value or none>
UI trigger: <which rule fired, and for which fenced files>
```

`ui_paths` and `goal_doc` are the two additions over today's block (gap-hunter
REC-9 already asks for `goal_doc`).

## 4. New config key

Add to `CONTRACTS.md` section 5, after `hot_paths`:

```yaml
ui_paths:                    # optional. Directories or globs that are UI,
  - src/viewer/              # whatever the file extension. accessibility-
  - src/studio/              # reviewer treats every fenced file under one
                             # as a UI file, and the trigger fires on them.
```

Meaning: paths whose files render something a person reads or operates,
beyond what the extension list and the grep catch (a JS module that only
returns mark data for a renderer, for example `src/viewer/unit-marks.js` in
The game repo, has no DOM call and no canvas call). Absent means none.

## 5. CONTRACTS.md changes it depends on

Section 1, Rules list, new bullet after "Code quality, formatting, comment
tone, and naming cap at LOW.", exact sentence:

```
- A breach of a rule that a file in `conventions_files` calls a hard rule
  is at least MEDIUM, and it still needs a mechanism and a traced path.
  Synthesis does not re-tier such a finding below MEDIUM unless it cites,
  by file:line, the code that satisfies the rule (for the colorblind rule,
  the label, glyph, shape, position, weight or pattern it found on the same
  code path as the color).
```

Section 9 needs no change: the agent uses the default review tool set.

## 6. Neighbor lines to change

**`plugins/djinn/agents/synthesis.md:37` to `:40`** (Normalize), append one
sentence after "Never move a finding up without reading the cited code.":

```
   A finding that cites a hard rule from `conventions_files` never moves
   below MEDIUM unless you cite, by file:line, the code that satisfies that
   rule; list the citation in "Re-tiered".
```

**`plugins/djinn/agents/ux-reviewer.md:105` to `:110`**, replace the
paragraph that starts "**Meaning carried by color alone** belongs here"
with:

```
**Meaning carried by color alone** is accessibility-reviewer's, in terminal
output as much as on a page: status, pass or fail, severity or category
signaled by color with no label, glyph, position or weight. If you see one,
file one REC line with the file:line naming accessibility-reviewer, and do
not tier it yourself.
```

**`plugins/djinn/agents/test-strategist.md`**, "Not your job" list (around
`:175` to `:180`), new bullet:

```
- Inspecting the UI for color-only meaning, a canvas with no text
  equivalent, or a control with no keyboard path. accessibility-reviewer
  owns that. You write the "Greyscale pass" and "Keyboard-only pass" steps,
  and you turn the checks in its UNVERIFIED list into protocol steps.
```

**`plugins/djinn/agents/breaker.md:71` to `:74`** ("Not your job"), add to
the list of owners in the first sentence: "accessibility-reviewer (a mark
list that runs out under schema-valid content)". Breaker keeps the same
defect when only a hand-built or schema-refused input reaches it.

**Docs that list agents or conditional triggers:** `plugins/djinn/relay.md`
around `:138` (the line naming ux-reviewer's trigger) and the README's
agent list gain one line each for accessibility-reviewer and its trigger.

## 7. Known-bugs hook

`~/Conventions/code/KNOWN-BUGS.md:399`, "The non-color encoding runs out",
has no owning lane today. Once this agent lands, its owner is
accessibility-reviewer. Its Detection strings (`?? SHAPES.at(-1)`,
`% SHAPES.length`, with ICONS, GLYPHS, PATTERNS, MARKS) are already the
agent's first greps through `known_bugs_index`; nothing in the relay needs
to paste them.

## 8. Not verified

Nothing was run. The trigger regex has not been run against any repo; the
writer should dry-run it on the game repo's fence and confirm it lists the
viewer and studio modules and not `src/sim/`.
