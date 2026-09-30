---
title: severity calibration and secret glob fix, audits/2026-09-27-1931-custom
author: Claude Opus 5.5 (calibration writer)
date: 2026-09-27
status: landed, unverified
---

Redacted for the public repo: private course and work identifiers.

# Severity calibration and secret glob fix

Why: the blind replay of the new djinn agents showed detection works and
tiering drifts, because known-bugs entries carried no tier. This pass gives
every entry a floor, wires the floor into the relay, adds the no-interpreter
rule, and makes the secret pathspecs match at any depth.

Edits only, with Edit and Write. Nothing was run: no test, no interpreter,
no gate. The one probe was a read-only `git ls-files` with exclude pathspecs
in the game repo, to confirm how glob magic matches (see "Glob changes").

## Files changed

### Conventions (`~/Conventions`)

- `code/KNOWN-BUGS.md`: "The mechanism" now lists six parts, the sixth
  `Tier when hit:`, and a new "Tier floor" paragraph with the floor rule and
  the four floors.
- `code/known-bugs/any-language/accessibility.md` (1 entry)
- `code/known-bugs/any-language/arithmetic.md` (1)
- `code/known-bugs/any-language/async-and-lifecycle.md` (3)
- `code/known-bugs/any-language/driving-a-third-party-page.md` (11)
- `code/known-bugs/any-language/hot-paths.md` (2)
- `code/known-bugs/any-language/local-servers-and-tools.md` (1)
- `code/known-bugs/any-language/state-and-persistence.md` (8)
- `code/known-bugs/any-language/tests-and-checks.md` (2)
- `code/known-bugs/javascript/async-and-lifecycle.md` (3)
- `code/known-bugs/javascript/driving-a-third-party-page.md` (1)
- `code/known-bugs/javascript/gpu-and-canvas.md` (5)
- `code/known-bugs/javascript/hot-paths.md` (3)
- `code/known-bugs/javascript/local-servers-and-tools.md` (1)
- `code/known-bugs/javascript/tests-and-checks.md` (1)
- `code/known-bugs/typescript/types.md` (3)

46 entries. Each got one `Tier when hit:` line after its Source; entry text
is otherwise unchanged.

### the game repo (`<game repo>`)

- `docs/known-bugs/INDEX.md`: 12 entries, one `Tier when hit:` line each.

### djinn relay (`~/djinn-relay`)

- `plugins/djinn/CONTRACTS.md`: section 1, the known-bugchecker line is now
  the known-bugs floor rule, and the synthesis re-tier rule holds a match at
  the entry's floor unless it cites why this instance is milder. Section 9
  opens with the no-interpreter sentence for every agent, and its Search
  rule defines the secret pathspecs once in the new form.
- `plugins/djinn/agents/known-bugchecker.md`: reads and copies the entry's
  `Tier when hit`; an entry with none is filed LOW with
  `(index entry has no tier)`. It used MEDIUM before.
- `plugins/djinn/agents/synthesis.md`: the same floor in its Normalize step.
- `plugins/djinn/agents/consolidator.md`: every proposed entry carries
  `Tier when hit` with its reason, set by the floors; a confirmed entry with
  no tier gets one proposed.
- `plugins/djinn/agents/cost-complexity-reviewer.md`: source 4 includes the
  known-bugs index and its linked files; a recorded crash of the owner's
  machine meets the MEDIUM bar without a cost block. The MEDIUM bullet
  points at it.
- `plugins/djinn/commands/review.md`: the full-patch command references the
  section 9 list instead of repeating the old one; tree facts section 6 also
  lists files under a secret-named folder; "seven secret pathspecs" reworded.
- `plugins/djinn/agents/gate-auditor.md`: references the section 9 list
  instead of repeating the old one.
- `plugins/djinn/agents/legibility-reviewer.md`: its never-open list names
  the any-depth and folder forms.

## Every tier set

Shared index, any-language:

- The non-color encoding runs out: MEDIUM
- A fencepost derived from a float division, tested at one scale: MEDIUM
- Guard flag not reset on exception: MEDIUM
- Dispose during pending async: HIGH
- Undo stack mutated before the async apply: HIGH
- Fixed sleeps instead of signals: LOW
- A signal that is true the whole time: MEDIUM
- A bare button as the signal: MEDIUM
- Trusting the click as the save: MEDIUM
- Selecting by id on a framework-rendered form: LOW
- Reading a reactive form synchronously after setting it: MEDIUM
- Focus armed on a stray keystroke: MEDIUM
- Caps counted per page load: MEDIUM
- Buffer cleared on a failed send: MEDIUM
- Synthetic events recorded as human input: MEDIUM
- The generic auto-fill that "fixed" everything: MEDIUM
- Splice inside a loop: MEDIUM
- Unbatched uploads in an interpolation loop: LOW
- Paid call before the intent is saved: MEDIUM
- Restore or init appends without clearing: HIGH
- Silent data truncation on restore: HIGH (caught as M6; raised by the
  unbounded data-loss floor)
- Transient runtime data in a persisted buffer: MEDIUM
- UI not synced after bulk state restore: LOW
- Async restore without an input guard: MEDIUM
- Legality predicate duplicated between mask and apply: MEDIUM
- Validator skips what the resolver defaults: MEDIUM
- Regeneration drops hand-kept keys: HIGH
- Hand mutation left in the source: MEDIUM
- A check that passes by not checking: MEDIUM

Shared index, javascript:

- Async reentrant void call: HIGH
- Unmanaged observers, listeners, and timers: MEDIUM
- No render pause on blur, or when nothing can change: LOW
- Wildcard CORS on a loopback server: HIGH
- GPU resources are never garbage collected: MEDIUM
- preserveDrawingBuffer on a WebGL canvas: HIGH
- Command buffer accumulation: MEDIUM
- A bare canvas in a CSS grid: LOW
- Large export canvases retained: MEDIUM
- Allocation per frame: LOW
- String-keyed Map in a hot path: LOW
- getComputedStyle or a forced layout read in a hot path: LOW
- Loopback dev server serves the whole root: HIGH
- Deep equality over a large value: HIGH

Shared index, typescript:

- Accepted parameter silently ignored: MEDIUM
- Duplicate type definitions: MEDIUM
- `as any` where the type is known: LOW

The game repo index:

- Convention drift in new files: LOW
- Write-only data: LOW
- Dead or colliding exports: LOW
- Stale doc block tags: LOW
- A prose claim goes stale: LOW
- Unclamped numeric input: LOW
- A CLI accepts what it cannot use: LOW
- MIME table misses a served type: LOW
- Git tracking disagrees with the code: LOW
- An out-of-gate check tests the fallback: MEDIUM (caught as LOW; raised by
  the cannot-fail-check floor)
- Prototype key lookup: LOW
- The frame loop redoes unchanged work: LOW

Totals: 46 shared plus 12 the game repo, 58 entries. 10 HIGH, 27 MEDIUM, 21
LOW. Where a source named a relay tier (H1, M2, LOW-39), the entry kept it
unless a floor raised it; the two raises are marked above.

## Glob changes

Old list, in CONTRACTS.md section 9, `commands/review.md` step 6 and
`agents/gate-auditor.md`:

```
':!.env*' ':!*.pem' ':!*.key' ':!**/id_*' ':!**/.npmrc' ':!**/credentials*' ':!**/*secret*'
```

New list, defined once in CONTRACTS.md section 9 and referenced by name
("the section 9 secret pathspecs") from review.md and gate-auditor.md:

```
':(exclude,glob)**/.env*' ':(exclude,glob)**/*.pem'
':(exclude,glob)**/*.key' ':(exclude,glob)**/id_*'
':(exclude,glob)**/.npmrc' ':(exclude,glob)**/credentials*'
':(exclude,glob)**/*secret*' ':(exclude,glob)**/.env*/**'
':(exclude,glob)**/credentials*/**' ':(exclude,glob)**/*secret*/**'
```

- With git's `glob` magic, `**/` matches zero or more folders, so it also
  matches the root. Checked with a read-only `git ls-files` in the game repo:
  `':(exclude,glob)**/package.json'` drops the root `package.json`, and
  `':(exclude,glob)**/el.js'` drops `src/el.js`. The old non-glob
  `':!**/package.json'` kept the root file, which is the bug: `:!**/id_*`
  missed a root `id_rsa`, and `:!.env*` missed any `.env` below the root.
- Under `glob`, `*` does not cross a `/`, so a shape no longer matches a
  folder on the way to a file. Same probe: `':(exclude,glob)**/*viewer*'`
  left all 30 `src/viewer/` files in, and adding `**/*viewer*/**` removed
  them. The old non-glob `**/*secret*` did catch `a/secrets/x`, so the
  three shapes a folder plausibly carries (`.env*`, `credentials*`,
  `*secret*`) got a `/**` form, ten pathspecs in all, to avoid a regression.
  Tree facts section 6 in review.md now lists files under such a folder,
  so the patch's `withheld:` lines still cover everything the pathspecs
  leave out.
- `grep --exclude` / `--exclude-dir` and `rg -g '!<shape>'` already match a
  base name at any depth; CONTRACTS.md says so and adds `--exclude-dir` for
  the folder shapes.
- `commands/dispatch.md` carries only `':!audits'`, no secret pathspecs, so
  it was not changed. The `.env` "never open" sentences in the agent files
  name files, not pathspecs, and were left as they are.

## Not done or not verified

- Nothing was run. No relay was replayed against the new rules, and the
  gate was not run in any repo.
- The glob probe used ordinary file names in the game repo, not real secret
  files, and did not exercise `git grep --untracked` or `git diff`, only
  `git ls-files`. The same pathspec engine serves all three, which is an
  assumption, untested.
- `.pem`, `.key`, `id_*` and `.npmrc` have no folder form. A folder named
  `keys.pem/` would not be excluded. Judged unlikely; say so if you want the
  folder form on all seven.
- Tier reasons for the non-the game repo entries (the engine repo, the automation repo, and three
  private projects) are read from the entry text alone. Where the
  entry names a relay tier it was kept; the rest are judgment calls from the
  entry's Why, most open to challenge: Fixed sleeps (LOW), Selecting by id
  (LOW), UI not synced (LOW), Command buffer accumulation (MEDIUM), GPU
  resources never collected (MEDIUM, caught in the game repo as LOW-19), Wildcard
  CORS (HIGH, by the K.8 precedent where a write from any page was HIGH).
- Voice: every touched file was grepped for em and en dashes; none found.
