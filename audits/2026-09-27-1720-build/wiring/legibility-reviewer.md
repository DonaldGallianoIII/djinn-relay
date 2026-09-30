---
title: wiring note for legibility-reviewer, phase 2 writer input
author: Claude Opus 5.5 (phase 1 drafter, legibility-reviewer)
date: 2026-09-27
status: agent output, not yet reviewed
---

Redacted for the public repo: private course and work identifiers.

Agent file: `plugins/djinn/agents/legibility-reviewer.md`. Not a gap-hunter
candidate: Donald asked for it on 2026-09-27, with its rule book
`~/Conventions/code/LEGIBILITY.md` written the same day. Its hard constraint
(no line, length or token counts, no split for size) comes from that file and
from `feedback-no-line-or-token-limits.md` in the game repo memory.

Line numbers below were read while another writer was editing
`commands/review.md`, so each edit also names its anchor text. Place by the
anchor if the number has moved.

## 1. Scope membership

- **New scope `map`**: legibility-reviewer, then synthesis. No
  known-bugchecker (its patterns are about code, and a whole-tree pass would
  run every pattern against every file for nothing), no consolidator.
- **Conditional (diff mode)**: added to every scope except `ideas`, `live`
  and `map`, by the trigger in section 3. That includes `full`, which gets it
  only when triggered.
- **Custom list**: valid by name, like any agent file, and runs in diff mode.
- **Round 2 and later** (`commands/dispatch.md`, wherever it runs the next
  round's agents): spawn it, in diff mode, when the trigger fires on the
  combined fix diffs, whatever the first round's scope was. A `map` scope's
  fixes are renames, moves and doc edits, so the trigger nearly always fires.

### The `map` scope line

In `commands/review.md`, after the `ideas` line (now `:63`, anchor
"- **ideas**: gap-hunter only, no synthesis"), add:

```
- **map**: legibility-reviewer, then synthesis. A whole-tree pass on how
  easy the repo is to find your way around, cold, for a person or an agent:
  maps, entry docs, folder READMEs, names across folders. The fence is the
  whole tree (Step 3), not a diff, and pre-existing problems are findings.
  Run it when the owner asks, for example at the end of a phase.
```

Add `"map"` to the scope words in the frontmatter `description` and usage
line (`commands/review.md:3`). Folder suffix `map`.

**Why with synthesis, not the `ideas` style of none.** `ideas` skips
synthesis because gap-hunter files only RECs and there is no verdict to
reach. legibility-reviewer can file LOW, and MEDIUM when an entry doc
misroutes work, and a MEDIUM is the one finding synthesis must re-read by
its citation before it blocks anything (CONTRACTS.md section 1, "Synthesis
never moves a finding up without reading the cited code", and the HIGH and
MEDIUM citation check). Synthesis also writes `findings.json`, which
`/djinn:brief` and `/djinn:status` read, so a map pass's fixes can be
briefed and dispatched like any other. The cost is one synthesis over one
report, which is small. The verdict reads as usual: SHIP, or FIX THEN SHIP
only when a MEDIUM stands.

## 2. Step 3 for the `map` scope, and the two tree files

In `commands/review.md` Step 3, after item 4 (anchor "**live scope only.**"),
add:

```
4b. **map scope only.** The fence is every tracked file,
   `git --no-optional-locks -c core.fsmonitor=false ls-files -- . ':!audits'`,
   plus the untracked list from item 3, not only the changed files. The
   untracked stop in item 3 still applies. The patch in item 6 is still the
   diff against the merge base, and may be empty; agents read the tree
   whole.
```

Item 5 ("If the fence is empty") does not fire in `map` scope unless the
tree itself is empty.

Whenever legibility-reviewer runs (scope, trigger or list), the orchestrator
also writes, in Step 4 beside `fence.txt`:

- `<AUDIT_DIR>/tree.txt`: the tracked files plus the untracked list from item
  3, `audits/` left out, one per line. In `map` scope it equals the fence.
  The agent needs it because its Glob would also walk ignored folders such
  as `node_modules/`.
- `<AUDIT_DIR>/tree-changes.txt` (diff mode only):
  `git --no-optional-locks -c core.fsmonitor=false diff --name-status -M <merge-base> -- . ':!audits'`,
  keeping only lines whose status starts `A`, `D`, `R` or `C`, then one
  line `A<TAB><path>` per untracked fenced file.

## 3. Diff-mode trigger

Add to the conditional list in `commands/review.md` (anchor "Conditional
agents, added to every scope except ideas and live", now `:74`; that
sentence becomes "except ideas, live and map"):

```
- **legibility-reviewer** runs, in diff mode, when any of:
  - `tree-changes.txt` holds any line (the diff adds, deletes, renames or
    copies a file), or the fence holds an untracked file;
  - a fenced path's basename is `CLAUDE.md`, `AGENTS.md`,
    `CONTRIBUTING.md`, or starts with `README` (any case);
  - a fenced path's basename contains `index`, `map`, `layout` or
    `contents` and ends in `.md`;
  - a fenced path is named in `conventions_files` or in the config's `maps`.
```

A new folder is caught by the first rule, since a folder only enters git
with a file in it.

Overlap with ux-reviewer's trigger ("a CLI entry point, a config schema, or
a README", now `:88` to `:89`) is intended: both may run on a README, and
the division in section 7 splits it by paragraph.

## 4. What the dispatch must paste

After the fence block, add to the per-agent list in `commands/review.md`
(anchor "After the fence block, these agents also get, in every scope and
round:", now `:331`):

```
- **legibility-reviewer**: `Mode: map` in the map scope, else `Mode: diff`;
  the paths of `<AUDIT_DIR>/tree.txt` and, in diff mode,
  `<AUDIT_DIR>/tree-changes.txt`; `maps: <list or none>`; the config's
  `data.generated` verbatim, or `data.generated: none`; and
  `integration-reviewer: running` when this run spawns it, else
  `integration-reviewer: not running` (the agent files every false map line
  itself when integration is not running).
```

The agent also needs `conventions_files` to include the owner's
`code/LEGIBILITY.md`. It does not stop without it: it says so first under
Inputs missing, reviews from the seven checks in its own prompt, and marks
every finding "rule book not supplied". Nothing for the command to do beyond
pasting `conventions_files` as it already does. `templates/config.yaml`
should carry the path as a commented example under `conventions_files`:

```yaml
conventions_files:
  - CLAUDE.md
  # - ~/Conventions/code/LEGIBILITY.md   # legibility-reviewer's rule book
```

**For Donald, not the phase 2 writer:** The game repo's `.djinn/config.yaml`
`conventions_files` (`:21` to `:25`) does not list
`~/Conventions/code/LEGIBILITY.md` today, so a first run
there would report it under Inputs missing. Add it before the first run.
Not edited here: that repo is outside this build.

## 5. New config key: `maps` (optional)

Meaning: files, or sections of files, that the owner calls maps or entry
docs, beyond the defaults (every `CLAUDE.md`, `AGENTS.md` and `README*`, the
files in `conventions_files` that list files, and any `.md` whose name
contains `index`, `map`, `layout` or `contents`). Feeds the trigger and the
agent's list of maps to walk. Absent means the defaults only.

Add to `templates/config.yaml`:

```yaml
# Maps and entry docs beyond the defaults, for legibility-reviewer. Optional.
# A path, or a path and a heading. The defaults are every CLAUDE.md,
# AGENTS.md and README*, and any .md named like an index, map or layout.
maps: []
# e.g.
#  - docs/INDEX.md
#  - CLAUDE.md#Layout
```

## 6. CONTRACTS.md changes this agent depends on

Section 1, after the bullet that begins "gate-auditor files LOW and MEDIUM
on checks that exist", add:

"- legibility-reviewer emits REC and DEBT by default, and LOW for a map or
  entry doc that states something false about the tree. It emits MEDIUM
  only when a map or entry doc an agent reads every session is false in a
  way that sends work to the wrong file, citing the misrouting line, the
  file the work would land in, and the file it belongs in. It never emits
  HIGH, and never cites a line count, a file length, a line length or a
  token count as evidence."

Section 4, after the paragraph that begins "In the `live` scope the fence
is", add:

"In the `map` scope the fence is every tracked file plus every untracked
file git does not ignore, `audits/` excluded, because a whole-tree
legibility pass reads the tree; pre-existing problems in those files are
findings in that scope."

Section 4, "Not counted as outside-fence reads": add `tree.txt` and
`tree-changes.txt` to the audit folder files listed there ("`fence.txt`,
`input-diff.patch`, `tree-facts.md`, other reports").

Section 5: the `maps` key as in section 5 above, in the keys block after
`goal_doc`, and one bullet in "What the optional blocks mean":

"- `maps`: files or sections the owner calls maps or entry docs, beyond the
  defaults legibility-reviewer uses. It feeds that agent's trigger and its
  list of maps to walk. Absent means the defaults only."

## 7. Neighbor lines to change so lanes do not overlap

- `plugins/djinn/agents/integration-reviewer.md:84` to `:90`, the "Prose
  claims about other code or repo state" sub-bullet. Replace the last
  sentence, "Useful searches: `is empty`, `not committed`, `nothing
  changed`, `carries`, and each new file's name in the conventions file's
  layout block.", with:

  > Useful searches: `is empty`, `not committed`, `nothing changed`,
  > `carries`, and each moved or deleted file's old path in the conventions
  > file's layout block. A layout line that names a file that does not
  > exist, or says a file does what its code does not, is yours. A needed
  > file missing from a map, a map buried where no reader looks, one fact
  > given several values in one doc, and a name that means two things in two
  > folders are legibility-reviewer's.

- `plugins/djinn/agents/format-reviewer.md`, "NOT your job" list, after the
  bullet at `:116` to `:117` ("Code quality, architecture, naming clarity,
  comment tone"), add:

  > - The whole-tree view: where a kind of thing lives across folders, a
  >   name that means two things in two folders, maps, entry docs and folder
  >   READMEs. legibility-reviewer. One concern per file inside a changed
  >   file stays yours.

- `plugins/djinn/agents/pipe-connector.md:117` to `:118`, the Owner list.
  New text:

  > fact, and an `Owner:` line naming the reviewer who rates it,
  > `integration-reviewer` for release chains and event wiring,
  > `bugs-reviewer` for listeners never removed, `legibility-reviewer` for a
  > mapped file that no layout block or index names.

- `plugins/djinn/agents/ux-reviewer.md`, "Not your job" list, after the
  bullet at `:134` to `:135` ("Whether a doc claim is true"), add:

  > - **The repo's own navigation docs.** legibility-reviewer owns the entry
  >   doc read at session start, layout blocks, indexes and folder READMEs
  >   that say what lives where. You own docs for the users of a command
  >   line or an API. A README that is both is split by paragraph.

- `plugins/djinn/agents/synthesis.md`: no text change needed if it already
  takes its expected agents from the dispatch. If it lists agents by name
  anywhere, add legibility-reviewer beside the conditional agents.

## 8. relay.md and README.md

- `relay.md:147` scope table: add a row after `ideas`:
  `| \`map\` | legibility-reviewer, then synthesis; the fence is the whole tree | End of a phase, before onboarding a new agent or person |`.
- `relay.md:149` "Conditional, in every scope but `ideas` and `live`":
  becomes "but `ideas`, `live` and `map`", and add legibility-reviewer's
  trigger in one line to that list.
- `relay.md:195` situation table: add
  `| End of a phase, or the repo is hard to find your way around | map |`.
- `README.md:117` usage block: add
  `/djinn:review map        whole tree: maps, entry docs, names, folder READMEs`.
- `README.md:125` "any scope but `ideas` and `live`": add `map`, and add
  legibility-reviewer wherever README lists the conditional agents.
- `commands/review.md` Step 9 final message (anchor "- **ideas**:
  \"gap-hunter output at", now `:499`): no new branch needed; `map` uses
  the normal SHIP and FIX THEN SHIP wording.

## 9. Not done here

No edits outside `plugins/djinn/agents/legibility-reviewer.md` and this
note. Nothing was run. The game repo was read, never written.
