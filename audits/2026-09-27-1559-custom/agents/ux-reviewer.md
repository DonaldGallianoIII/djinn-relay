---
title: ux-reviewer report, audits/2026-09-27-1559-custom
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
LOW-1. `plugins/djinn/agents/cost-complexity-reviewer.md:214` The prompt says "The two sections before Findings", but the template has three (Inputs missing, Cost model, Conventions proposed) and a fourth of its own after Findings (UNVERIFIED).
Mechanism: the agent is told the count and then shown a different one. A careful reader will think one section is optional, and the most likely one to go is Conventions proposed, because it looks like a suggestion.
Traced: line 214 to 215 ("The two sections before Findings are this agent's own output") against the template headings at lines 225, 228, 237 and 267.
Proposed rewrite for lines 213 to 215: "Write exactly one file, at the path the orchestrator gives you, in this shape. Inputs missing, Cost model and Conventions proposed are this agent's own sections and come before Findings. UNVERIFIED comes after REC."

LOW-2. `plugins/djinn/agents/cost-complexity-reviewer.md:70` The rule for uncited figures appears three times, worded differently, and the three versions disagree on whether a LOW may rest on a load figure the agent was not given.
Mechanism: line 70 to 71 forbids only "a MEDIUM or HIGH that depends on a load figure you were not given", which reads as though a LOW is allowed. Line 200 to 201 says any finding that "rests on an uncited price, limit or load figure is UNVERIFIED and is not a finding", which rules the LOW out. Line 188 then defines a LOW as "a missing cap that no configured load reaches", and that definition needs a configured load. Faced with a missing `cost.load` and a real unbounded loop, the agent has no single rule to follow, so two runs can file it two ways.
Traced: line 70 to 71, line 101 to 103, line 106 to 107, line 188, line 200 to 201.
Proposed: one rule in the "Prices and limits" section, deleted from the other two places. "A price, a limit or a load figure is usable only if it comes from the config, a cited official page (URL and date read), or a bound in the code (file:line). Any other figure is a variable (`P`, `n`), and a claim that needs a variable's value goes under UNVERIFIED, never under Findings. A complexity stated in `n`, with the `n` at which it breaks a cited limit, is a finding at LOW at most."

LOW-3. `plugins/djinn/agents/cost-complexity-reviewer.md:231` The template's example row fills price and estimate with `...`, and line 101 says an uncited figure is written as a variable.
Mechanism: the agent copies templates more faithfully than it follows prose. The one worked row teaches it to write `...` for a price it cannot cite, which is the exact outcome lines 101 to 103 exist to prevent. It also leaves open whether an uncited driver belongs in the Cost model table at all, or only under UNVERIFIED.
Traced: line 231 (`| ... | ... | URL, read YYYY-MM-DD |`) against line 101 to 102 ("written as a variable (`P` dollars per million calls)").
Proposed: two example rows, one cited and one not.
`| Meshy image to 3D | tools/meshy.mjs:291 | task | 9 per character set | P per task | 9 x P per set | UNVERIFIED [see UNVERIFIED] |`
`| App Service plan | infra/main.bicep:40 | instance hour | 2 x 730 a month | 0.xx dollars [1] | 1460 x 0.xx | [1] |`
Also add one sentence: "An uncited driver stays in the table with a variable and UNVERIFIED as its source, and its claim goes under UNVERIFIED."

LOW-4. `plugins/djinn/agents/cost-complexity-reviewer.md:105` Three notices are told to go "at the top" or "in one line" with no slot in the template.
Mechanism: line 66 puts Inputs missing "at the top", line 105 says the no web access notice goes "at the top", line 69 says the local-only review is stated "in one line" with no place given, and line 211 to 212 puts Round n-1 status "above Findings". The template has a slot for only the first of these, and its placeholder at line 226 (`- \`cost.load\` (for example). none`) puts a bullet and the word `none` on one line, which shows neither the filled nor the empty case.
Traced: lines 66, 69, 105, 211 to 212, 226.
Proposed: every run condition becomes a bullet in Inputs missing, and the template shows both states.
```
## Inputs missing
- `cost.load`: absent. Complexity stated in n only.
- `cost.hosting`: absent. Reviewed for local and CI cost only.
- web access: none. Every price and limit below is UNVERIFIED.
```
Also state the order: "Round n-1 status first, then Inputs missing, Cost model, Conventions proposed, Findings."

LOW-5. `plugins/djinn/agents/cost-complexity-reviewer.md:44` "Never guess a value and never go looking for one" collides with line 97 to 100, which tells the agent to fetch official pricing and limits pages.
Mechanism: the first sentence is about config values, but it says "a value", unqualified. Read literally, it forbids the web lookups the tools line grants. An agent that does not fetch loses nothing visibly, and every price becomes UNVERIFIED.
Traced: line 44 to 45 against line 97 to 100 and the `tools:` line 4.
Proposed: "Never guess a config value, and never search the repo for one. Prices and limits the config does not give are fetched from official pages, as the next section says."

### DEBT
none

### REC
REC-1. `plugins/djinn/agents/cost-complexity-reviewer.md:47` Donald writes the `cost` block by hand. Only `cost.hosting` has an example, and nothing says whether a key takes a string, a list or a map.
Friction: `cost.paid_apis` asks for six facts per service ("name, billing unit, price if known, rate limit, quota, and where the key is read"), with no shape given. `cost.budget` and `cost.limits` give categories but no example line. To fill it in, Donald has to guess the YAML shape, and today nothing checks it, so a typo like `paid_api` fails silently and shows up only as a line under Inputs missing. The context file says the wiring into CONTRACTS.md section 5 and `templates/config.yaml` is still to come. That wiring should carry this block, in the style `templates/config.yaml` already uses (a comment above each key, `none` accepted everywhere).
Proposed, for `templates/config.yaml` and section 5. Every value here is a placeholder to replace, not a cited figure:
```yaml
# Optional. What the code costs to run, for cost-complexity-reviewer.
# Leave the whole block out, or set any key to none.
cost:
  hosting:                 # where it runs, one line per tier
    - "local dev only, WSL2, 31 GB RAM"
    - "Azure App Service P1v3, Linux, 2 instances, East US"
  load:                    # volumes the code sees, each with its unit
    - "up to 2000 seeds per batch (MAX_BATCH_SEEDS)"
    - "about 40 requests a day, 1 user"
  budget:                  # what you will pay, and any hard cap
    - "Meshy: 20 dollars a month, hard cap"
  limits:                  # ceilings you know; the agent cites these as given
    - "node heap: 4 GB, set by --max-old-space-size=4096"
  paid_apis:               # one entry per service billed per use
    - name: Meshy
      unit: task           # what one line on the bill counts
      price: none          # none: the agent writes it as a variable
      rate_limit: none
      quota: none
      key: ".env MESHY_API_KEY"
  pricing_refs:            # official pricing or limits pages only
    - https://www.meshy.ai/pricing
```
Then rename the prose bullets at lines 65 to 66 to the same sub-keys (`unit`, `price`, `rate_limit`, `quota`, `key`), so the prompt and the template name the same fields. The Meshy pricing URL above is UNVERIFIED (not fetched).
Effort to adopt (estimate): under an hour, including section 5.
Downside: a structured `paid_apis` is one more schema to keep in step across CONTRACTS.md, the template and this prompt.

REC-2. `plugins/djinn/agents/cost-complexity-reviewer.md:229` The Cost model table is seven columns, and its last column holds a full URL plus a date, so it breaks in a terminal.
Friction: the placeholder row at line 231 is already 104 characters wide. With a real pricing URL in the source column, a row runs past 150 characters, and an 80 or 120 column terminal wraps it mid-row, so the columns no longer line up. `tools/render_html.py` does not help here. Its Groups (lines 23 to 31) render `plugins/`, `_FromClaude/` and `docs/`, not `audits/`, so a report is read raw or through `~/Conventions/tools/render-doc.py`, which I did not read. The prompt page itself does render, and it shows the template inside a `<pre>` that scrolls sideways (`overflow-x:auto`, line 54 to 55), which is fine.
Proposed: footnote the sources. The source column holds `[1]`, and a `Sources:` list under the two tables holds `[1] https://... read 2026-09-27`. The widest cell shrinks from a URL to three characters, and one page cited by six rows is written once.
Effort to adopt (estimate): minutes.
Downside: one indirection for the reader, and the numbering has to stay in step with the rows.

REC-3. `plugins/djinn/agents/cost-complexity-reviewer.md:234` The Ceilings table's `headroom` column has no convention for a breach.
Friction: a breach would show up only as a minus sign or a small number. Nothing in the prompt uses color, so this is not a break of the accessibility rule. It still leaves the most important cell in the table without a word, and a grep cannot find breaches.
Proposed: headroom always starts with a word. `ok, 2.1 GB left`, `BREACH, 0.4 GB over`, or `UNVERIFIED, limit not cited`. A reader in greyscale, a terminal, or a grep all see the same thing.
Effort to adopt (estimate): minutes.
Downside: none worth naming.

REC-4. `plugins/djinn/agents/cost-complexity-reviewer.md:176` At 295 lines, the prompt is about 100 lines longer than `perf-reviewer.md`, which ends near line 195. About 30 of those lines can go without losing an instruction.
Friction: the longer the prompt, the more likely the agent weighs a restated rule over the contract's version.
Proposed cuts:
(a) Lines 176 to 201, Severity: this section restates CONTRACTS.md section 1, including the sub-label rule and "blocks merge". Replace it with "Tiers are CONTRACTS.md section 1. For cost, read them as:" followed by the five one-line cost readings. That saves about 12 lines.
(b) The LOW-2 merge, which saves about 6 lines.
(c) Lines 63 to 64: `hot_paths`, `deps.platform`, `build_cmd`, `test_cmd` and `goal_doc` are listed and never used again anywhere in the prompt (grep confirms each appears only on those two lines). Either say what each one is for (for example, "`hot_paths`: where a per-call cost multiplies") or cut the line.
(d) Lines 24 to 25 ("whether it could be written cheaper") and Scope item 8 (lines 163 to 168) say the same thing. Keep item 8.
Effort to adopt (estimate): under an hour.
Downside: a pointer to CONTRACTS.md means the agent has to read one more section. It is handed that file anyway.

REC-5. `plugins/djinn/agents/cost-complexity-reviewer.md:66` With no `cost` block at all, which is the case for djinn-relay (`.djinn/config.yaml` has none) and the game repo today, the rule produces six near-identical Inputs missing lines.
Friction: the most common run so far opens with six lines that together say one thing.
Proposed: "If the whole `cost` block is absent, write one line: `- cost block: absent. Local and CI cost only; every price and limit is a variable.` List keys one by one only when the block exists and some keys are missing."
Effort to adopt (estimate): minutes.
Downside: none.

REC-6. `plugins/djinn/agents/cost-complexity-reviewer.md:4` For integration-reviewer: the `tools:` line grants WebFetch and WebSearch, but CONTRACTS.md section 9 lists only dependency-reviewer and ux-reviewer as web agents.

REC-7. `plugins/djinn/agents/cost-complexity-reviewer.md:267` For integration-reviewer: CONTRACTS.md section 3 allows an agent's own sections before Findings only, and `## UNVERIFIED` sits after Findings.

## Blast radius
none

## Checked and Clean
- `plugins/djinn/agents/cost-complexity-reviewer.md`: nothing in the prompt or its template encodes meaning in color. Tier is a word, UNVERIFIED is a word, and the tables are plain text. The prompt contains no em dashes and no en dashes (grep).
- `plugins/djinn/agents/cost-complexity-reviewer.md:3`: the frontmatter description is one line, so `render_html.py` `split_frontmatter` (line 81 to 84) reads it whole. The index truncates it at 110 characters (line 142), and the cut still reads as a sentence.
- What the design gets right: "count, do not clock" (line 111) and "show both sides" of a ceiling (line 116 to 120) give the agent a worked example of a finding and a non-finding. That is the clearest instruction in the file.

## Files read outside the fence
- `tools/render_html.py` (HTML rendering of tables)
- `plugins/djinn/templates/config.yaml` (config style Donald copies)
- `plugins/djinn/agents/perf-reviewer.md` (length and structure comparison)
- `audits/2026-09-27-1559-custom/context.md` (run notes, wiring deliberate)
