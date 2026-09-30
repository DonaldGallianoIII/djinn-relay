---
title: ux-reviewer report, audits/2026-09-25-1902-custom
author: Claude Opus 5.5 (ux-reviewer)
date: 2026-09-25
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Findings

### HIGH
none

### MEDIUM
none

### LOW
LOW-1. `plugins/djinn/README.md:30` The install section still lists only three commands, so a new user reading top to bottom learns `/djinn:status` exists only on line 76.
Mechanism: the diff added `/djinn:status` to Daily use (README:73 to 84) and to the file map (README:169) but left the sentence that tells a fresh install what it now has.
Traced: README.md:30 to 31 "The commands `/djinn:review`, `/djinn:brief`, and `/djinn:dispatch` now exist in every project." against README.md:169 "commands/ review, brief, dispatch, status" and relay.md:188.

LOW-2. `plugins/djinn/commands/status.md:19` Bare `/djinn:status` right after an ideas-scope or aborted review picks that folder, prints a wrong cause, and stops, when the audit the user wants is the one before it.
Mechanism: Step 1 takes the newest folder by name, then stops on "no synthesis.md in <folder>, has the review finished?". An ideas run never writes synthesis (review.md:171 "Synthesis (skip for ideas scope)"), and an aborted run leaves a folder too (review.md:219 `ABORTED step <k>`). The review did finish; the question misleads, and the fix (pass the older folder by hand) is not suggested. No `audits/` folder at all is also unhandled.
Traced: README.md:76 documents the bare form `/djinn:status` as the usage; README.md:114 documents `ideas` scope; status.md:19 to 23. Proposed: take the newest folder that has a `synthesis.md`, and when skipping one, say `skipped <folder> (ideas scope, no synthesis)`. With no `audits/`, say `no audits/ here; run /djinn:review first`.

LOW-3. `plugins/djinn/commands/status.md:35` The missing-file message always blames "reviewed before djinn 2.2.0", but a 2.2.0 run can legitimately end with no `findings.json`.
Mechanism: review.md:190 to 191 and dispatch.md:221 to 222 retry once and then accept a missing `findings.json` ("say so in the Step 10 report; do not write it yourself"). Status then tells the user their fresh audit is from an old version. The user is sent to the wrong explanation and has no next step.
Traced: status.md:34 to 38 message text; review.md:188 to 191; dispatch.md:221 to 222. Proposed wording: `<audit> has no findings.json. Audits before djinn 2.2.0 have none; a 2.2.0 run whose synthesis failed to write one says so in its review report. Findings are in <path>.`

### DEBT
none

### REC
REC-1. `plugins/djinn/commands/status.md:51` Against the round 3 fixture the listing is 32 rows of wrapped paragraphs, and the short `name` field built for people is never printed.
Friction: `the arena repo/fixtures/audit-three-rounds/round-3/findings.json` has 32 `open` entries (HIGH 1, MEDIUM 2, LOW 29). Titles run to roughly 450 characters (lines 444, 455, 466). Each row wraps three to five times in a 120-column terminal, and the wrapped text lands under the tier column, so scanning the left edge for `HIGH` hits title fragments. The `[not resolved]` and `[regressed]` tags sit after the title (status.md:55 to 56), so they end up at the ragged end of the last wrapped line. Meanwhile every entry carries a `name` ("Round Heading Mismatch", "Strict Status Table") that CONTRACTS.md:311 to 313 defines as "two to four plain words a person could call the bug by", and status.md never uses it.
Proposed: one short row per finding with the status tag before the text, and the full title on an indented line under it (or behind an argument such as `/djinn:status <folder> full`):
```
  HIGH    R3 HIGH-1    [open]          src/extract-findings.js:174   Round Heading Mismatch
          From round 3 on, `statusRows` requires ...
```
Tell the command to print inside a fenced code block so the columns survive markdown rendering (UNVERIFIED whether Claude Code's renderer collapses runs of spaces outside a fence). A tag on every row, `[open]` included, gives each state a label in a fixed position, which reads the same in greyscale.
Effort to adopt (estimate): minutes, prompt text only.
Downside: rows without a `name` (optional per CONTRACTS.md:312) need a fallback, such as the first 60 characters of the title.

REC-2. `plugins/djinn/commands/status.md:58` The line that answers "can I merge?" prints last, after every open row.
Friction: with the fixture, `blocking: R3 HIGH-1, R3 MEDIUM-1, R3 MEDIUM-2` comes after 29 LOW rows. Those rows block nothing (README.md:103). The reader scrolls past about 100 wrapped lines to reach the answer.
Proposed: print `blocking:` second, right under the header line, and keep the per-row listing below it. Same data, reordered.
Effort to adopt (estimate): minutes.
Downside: none found.

REC-3. `plugins/djinn/commands/status.md:65` The `R2 HIGH-1` form status prints is not accepted by the next command, and status never says which folder to pass to `/djinn:brief`.
Friction: brief takes `<audit-folder> <TIER>-<n>` (brief.md:17 to 22) and asks the user when the id is ambiguous. Pasting `R3 MEDIUM-1` fails that check. The user then has to work out that round 3 findings live under `round-3/` and that carried-forward round 1 LOWs live in the audit root.
Proposed: print one next-step line per blocking entry, built from `round`: `next: /djinn:brief audits/<audit>/round-3 MEDIUM-1`, with round 1 mapped to the audit folder itself. Alternatively, let brief accept the `R<n>` prefix. That change is outside this fence.
Effort to adopt (estimate): minutes for the status line.
Downside: longer output. Could print only for blocking entries.

REC-4. `plugins/djinn/CONTRACTS.md:329` An open list that synthesis rebuilt from prose looks exactly like a native one to `/djinn:status`.
Friction: someone upgrading mid-audit (round 1 written by 2.1.0, round 2 by 2.2.0) gets a round-2 `findings.json` whose `open` list was reconstructed from `synthesis.md`. The only marker is a Coverage line in the prose (CONTRACTS.md:331 to 332). Status never reads that line (status.md:12, 95). So status prints a reconstruction as authoritative, the case status.md:40 to 41 calls "worse than no status".
Proposed: add an optional top-level field, for example `"openRebuiltFromProse": true`, and have status print `note: round 1 open list was rebuilt from synthesis.md prose; check it against <path>`. Whether an added optional field bumps `schemaVersion` is for the author (CONTRACTS.md:288).
Effort to adopt (estimate): minutes, in two prompts and the contract.
Downside: one more field for synthesis to get right.

REC-5. `plugins/djinn/commands/status.md:86` Two status messages tell the user to re-run synthesis, and no command does that.
Friction: the self-check note says "re-run the round's synthesis". Every 2.1.0 audit also stays without `findings.json` forever. The retry prompt already exists inside review.md:189 to 190 ("Write only `<AUDIT_DIR>/findings.json` from it"), but no user-facing command runs it.
Proposed: a small write command, for example `/djinn:backfill <audit-folder>`, that runs that exact retry prompt per round and writes a ledger line. Then point both status messages at it. Status stays read only.
Effort to adopt (estimate): an hour, one new command file.
Downside: another command to document. Backfill of a 2.1.0 round 2 has to use the prose-rebuild path, so REC-4's flag matters.

REC-6. `plugins/djinn/README.md:14` The README says nothing to someone already on 2.1.0 about getting 2.2.0.
Friction: the owner's installed copy is a cached 2.1.0 (project_notes). Until it updates, `/djinn:status` does not exist in their session. Search results say a third-party marketplace defaults to auto-update off, and updating is a two-step marketplace refresh plus plugin update, compared on the `plugin.json` version string.
Proposed: an "Upgrade" paragraph: `claude plugin marketplace update djinn-relay`, then `claude plugin update djinn@djinn-relay`, then `/reload-plugins` or a restart. Add one sentence: audits made before 2.2.0 keep working, and `/djinn:status` on them points at `synthesis.md`. Sources: https://code.claude.com/docs/en/discover-plugins, https://github.com/anthropics/claude-code/issues/86700. Exact command spelling is UNVERIFIED; I did not fetch the docs page.
Effort to adopt (estimate): minutes.
Downside: CLI syntax can drift between Claude Code releases.

REC-7. `plugins/djinn/commands/dispatch.md:270` The new "Open across rounds" line has no fallback for a missing `findings.json`, and dispatch never points at `/djinn:status`.
Friction: review.md:232 to 233 reports "written, or missing after one retry" and names `/djinn:status <AUDIT_DIR>`. Dispatch's report reads counts "from round-<n>/findings.json" with no instruction when the file is absent. It also skips the pointer, even though dispatch is where rounds 2 and 3 happen.
Proposed: copy review.md's two lines into dispatch.md Step 9.
Effort to adopt (estimate): minutes.
Downside: none found.

REC-8. devils-advocate: `plugins/djinn/README.md:151` "Every command writes a ledger line, even when it stops early" is now false for `/djinn:status` (CONTRACTS.md:158 to 160).

REC-9. `plugins/djinn/commands/status.md:49` The sort, the column layout and the prefix rule are executed by the model, row by row, on up to 32 or more entries.
Friction: "Print exactly this shape" gives no column widths, and the example pads by eye. Sorting "by the number in the id" across 29 LOWs is the kind of step a model can get wrong silently. The data is already structured JSON.
Proposed: ship a script inside the plugin, called through Bash from the command. With `jq` it is roughly `jq -r '.open | sort_by(.tier_rank, .round, (.id|split("-")[1]|tonumber)) | .[] | ...'`. A 40-line Node or Python script also works. Output becomes deterministic and testable against the fixture.
Effort to adopt (estimate): hours.
Downside: breaks "markdown only, no code" (project_notes), adds a runtime dependency (`jq`, UNVERIFIED as installed; no deps manifest exists to check), and `allowed-tools` would need Bash. The author may reasonably keep it pure prompt.

## Blast radius
none

## Checked and Clean
- `plugins/djinn/commands/status.md`: no color anywhere. Tier is a spelled word in its own column, `not resolved` and `regressed` are bracketed text labels, and the verdict prints as its word. It reads fully in greyscale.
- `plugins/djinn/commands/status.md`: the `R<round>` prefix does its job on the fixture. `resolved this round: R2 LOW-7` and the still-open round 1 `LOW-7` stay distinguishable.
- `plugins/djinn/commands/status.md`: refusing to rebuild from prose, and naming the synthesis.md path instead, is the right call for a 2.1.0 audit.
- `plugins/djinn/commands/review.md`: the Step 10 additions (findings.json written or missing, pointer to `/djinn:status`) give the user the next command at the moment they need it.
- `plugins/djinn/relay.md`: new table row matches the command's usage string and description.
- `plugins/djinn/CONTRACTS.md`: section 12 field order and two-space rule make round-to-round diffs readable. Sections 6 and 9 edits are consistent with status.md.
- `plugins/djinn/agents/synthesis.md`, `consolidator.md`, `perf-reviewer.md`: heading rename to `## Round <n-1> status` is consistent across all three and dispatch.md:217. No user-facing surface beyond that.
- `plugins/djinn/.claude-plugin/plugin.json`: version bump only. The description does not mention status, which is fine for a marketplace blurb.
- `.djinn/config.yaml`: all keys from CONTRACTS.md section 5 present. `hot_paths: []` and `manifests: []` read clearly as empty.

## Files read outside the fence
- `plugins/djinn/commands/brief.md` (id format status feeds)
- `<arena repo>/fixtures/audit-three-rounds/round-3/findings.json` (real output to picture)
