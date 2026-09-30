---
title: gap-hunter report, audits/2026-09-27-1559-custom
author: Claude Opus 5.5 (gap-hunter)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Anchor: no single bug supplied. The goal is Donald's ask of 2026-09-27 (an agent that reviews what code costs to run, whether it could be cheaper, and conventions for rate limits, heap caps and similar ceilings; no dollar figure from memory). Retrospective sources: KNOWN-BUGS.md "Deep equality over a large value" (node to 30 GB, WSL distro down, 2026-09-27), "Paid call before the intent is saved" (`tools/meshy.mjs:291`), and "Allocation per frame" recurring at nine viewer sites in one audit.

## Findings

### HIGH
none

### MEDIUM
none

### LOW
none

### DEBT
none

### REC
REC-1 (high). `plugins/djinn/agents/cost-complexity-reviewer.md:138` LLM token meter, as its own scope item.
What: I would add a scope item for token-billed APIs (Claude above all) that prices a call as four meters (input, output, cache read, cache write) and checks the things that move them: a prompt prefix that changes every call (a date, a run id or a file list ahead of the stable text breaks the cache), `max_tokens` left unset or at the maximum, a retry that re-sends the whole input, a whole file pasted where a path and a line would do, and the model tier per call.
Why: Claude is the paid API Donald spends the most on, and the relay itself runs on it (memory: Fable at about 80 percent on 2026-09-10, Opus subagents to spread load). Scope item 1 reads like a REST API with per-call pricing; nothing in it would see a cache miss on every call or a prompt that grew by one pasted file per agent. For a repo like this one, which is prompts and no code, tokens are the ONLY meter, so the agent as written has nothing to review here.
How: new item between 1 and 2 in `# Scope`; add `billing: tokens` with the four-way split to the `cost.paid_apis` entry shape at line 65; name the relay's own `usage.md` (CONTRACTS.md section 6 already records the four-way split) as the source of units per run. Note in one line that CONTRACTS.md section 8 pins every relay agent to Opus, so a "use a smaller model" finding against the relay's own prompts is a contract change, not a fix.

REC-2 (high). `plugins/djinn/agents/cost-complexity-reviewer.md:111` A way to feed real bills and metrics back in.
What: I would add a `cost.actuals` config key listing files the owner already has (a Meshy ledger, `audits/*/usage.md`, an Azure Cost Management CSV export, a bench output such as `docs/perf-baseline.md`), and a Cost model column `actual` beside `estimate`, with any row where the two differ by more than a factor of 2 reported as a REC naming the wrong factor.
Why: line 111 says "You have no profiler, no bill, and no metrics", which is true today by construction and stays true forever unless the prompt names a slot. Estimates that are never checked against the bill never get better, and the multiplication rule at lines 112 to 114 is exactly the kind of arithmetic that is right in shape and wrong by 10x in one factor. The game repo's `tools/meshy.mjs` is already "capped, resumable, ledgered": the real spend exists on disk and the agent is told not to look.
How: `# Inputs from config`, after `cost.pricing_refs` at line 61: `cost.actuals: [paths]`, read-only, each figure cited as `path:line, read <date>`. Change line 111 to "Unless `cost.actuals` names one, you have no bill". Add `actual` and `actual source` columns to the Cost model table at line 235.

REC-3 (high). `plugins/djinn/agents/cost-complexity-reviewer.md:200` A path for a finding that needs no price, and for limits no web page publishes.
What: I would say outright that a finding tiered on units (calls per run with no cap, bytes held against a limit) stands without a price, and that a local machine limit can be cited from a recorded command output (`free -g`, `.wslconfig`, `node -p "v8.getHeapStatistics().heap_size_limit"`) placed in `cost.limits` by the owner.
Why: the anchor incident (node to 30 GB on a WSL2 box) had a limit that lives in `.wslconfig` and on no provider's official page. Read literally, lines 97 to 113 plus line 200 turn that into UNVERIFIED, "never promoted to a finding", so the one real OOM in the index could not be filed at MEDIUM. The same rule, applied by a cautious model, demotes "a paid call that repeats without a cap" (the HIGH example at line 184) because the price per call is uncited, even though an unbounded count is unbounded at any price.
How: in `# Prices and limits come from a citation`, add two bullets: "A finding tiered on a unit count or a bound (no cap, no backoff, holds all n) needs no price; the price only fills the estimate column." and "A local limit is cited from the owner's `cost.limits` entry, which may quote a command's output and its date." Change line 200 to "rests on an uncited price, limit or load figure that the tier depends on".

REC-4 (medium). `plugins/djinn/agents/cost-complexity-reviewer.md:234` One row per meter, findings point at it.
What: I would give each Cost model row an id (`C1`, `C2`) and require one finding per root cause listing every `file:line` that feeds the same meter, never one finding per site.
Why: the index's "Allocation per frame" entry recurred at nine viewer sites in one audit, and a cost reviewer that meets "every Meshy call in the loop" or "every test script without `--max-old-space-size`" will file N copies of one meter. Synthesis then merges them by hand, and the ledger counts inflate.
How: add an `id` column to the Cost model table at line 235 and a rule under `# Severity` Rules: "Every finding names its meter id. Two findings on one meter merge into one, with all sites listed."

REC-5 (medium). `plugins/djinn/agents/cost-complexity-reviewer.md:27` Say which "complexity" the name means.
What: I would add one sentence to `# Role` stating that complexity here is growth against input size, and that how hard the code is to change is not this agent's, naming who owns it or saying nobody does.
Why: the name reads "cost and complexity", and Donald's ask was "could it be written better". A reader, and the model, will reasonably take maintainer complexity (deep nesting, one function doing five jobs, a config surface nobody can hold) as in scope. I grepped every agent in `plugins/djinn/agents/` for complexity, nesting, duplication and readability: only perf-reviewer mentions `@complexity` tags, and no agent owns cost to change. Leaving it implicit gets either silent drift into that lens or silent absence of it.
How: in the Division of labor list at line 33, one bullet: "Code that is hard to change is not a cost finding here. File it as DEBT only when it blocks a cheaper rewrite you are proposing." If Donald wants the lens, it is a separate agent or a format-reviewer amendment, not a ninth scope item.

REC-6 (medium). `plugins/djinn/agents/cost-complexity-reviewer.md:156` Azure resource shape and environments left running.
What: I would add the Azure meters the work repo stack is heading for and an environment inventory: database compute tier (Postgres Flexible Server burstable credits and stop state, DTU or vCore for Azure SQL, RU for Cosmos only if used), Functions plan differences (Consumption, Flex Consumption, Premium always-ready instances), App Service Always On and deployment slots, container registry tier, reserved capacity against pay-as-you-go, and every dev, test and preview environment with its running hours.
Why: the work repo's config shows a small Azure web stack with a database and blob storage. The biggest line on a small Azure bill is usually a non-prod database or slot nobody stopped, and item 5 at line 159 names only "a dev server or worker nobody stops", which reads as a local process. Nothing in the prompt asks which environments exist.
How: `# Inputs from config`: `cost.environments`, one line per environment with its SKU and hours per week. In item 5, add "a non-prod environment, slot or database that runs outside the hours `cost.environments` gives" and "a tier chosen for a peak the load does not show"; in DEBT at line 194 add "a commitment (reservation, savings plan) bought ahead of a known load".

REC-7 (medium). `plugins/djinn/agents/cost-complexity-reviewer.md:166` Bytes shipped to a browser as a meter.
What: I would add bundle size, static asset weight (GLBs, texture atlases, `content/bundle.json`) and cache headers as a cost surface: bytes per page load times loads per month against a CDN or Static Web Apps bandwidth allowance, and the first load time a user waits through.
Why: Donald's browser games ship three.js from `node_modules`, committed character GLBs (commit `0c89df3`) and a generated bundle with its own budget line (23705 bytes, K.8). Once any of them is hosted, egress is the meter; item 7 covers binaries in git for the clone, and nothing covers the same binaries downloaded per visitor.
How: new bullet in item 5 or a short item 9: "Bytes a browser downloads: asset and bundle weight, missing `Cache-Control` or content hashing so a revisit re-downloads, compressed size against the hosting plan's bandwidth." Load comes from `cost.load` as visits per month.

REC-8 (medium). `plugins/djinn/agents/cost-complexity-reviewer.md:141` A spend gate on every paid tool.
What: I would add to item 1: a paid tool with no per-run spend cap, no dry run that prints the count of billed calls before making them, or no confirm step between the estimate and the first charge.
Why: Donald's standing rule is "ask before paid calls" (memory, Meshy API key note). The index entry "Paid call before the intent is saved" is one way a resume re-buys; a cap and a printed estimate bound every other way, including ones nobody has found yet. Item 1 lists how calls repeat but never asks whether the tool knows its own ceiling.
How: item 1 at line 141, append: "or a paid tool with no per-run cap, no dry run and no confirm gate before the first billed call". Pair it with a Conventions proposed example: "Every paid tool takes `--max-credits` and `--dry-run`. Check: grep the tool's argument parser."

REC-9 (low). Storage that only grows: add artifact retention (traces, audit folders, blob containers with no lifecycle tier or delete rule) to item 5, with cool and archive tiers and their early-deletion charges as the cheaper alternative.
REC-10 (low). GPU: one line saying GPU time on a player's machine is perf-reviewer's, GPU billed per second (a cloud render or a generative provider) is this agent's.
REC-11 (low). Save every fetched price and limit into the audit folder as `prices.md` with URL and date, so round 2 reuses it and the owner can paste rows into `cost.pricing_refs`.
REC-12 (low). The wiring into CONTRACTS.md section 5 needs `cost.hosting`, `load`, `budget`, `limits`, `paid_apis`, `pricing_refs`, plus `actuals` and `environments` if REC-2 and REC-6 land, and templates/config.yaml needs the same keys commented.
REC-13 (low). Cold start is named once (line 160); teardown is named only as "a dev server nobody stops". A one line checklist of the three phases (provision, run, tear down) in item 5 would stop the teardown phase being the one nobody reads.

## Blast radius
none

## Already present
- `plugins/djinn/agents/cost-complexity-reviewer.md:141` Paid call made before the intent is saved (index entry, `tools/meshy.mjs:291`).
- `plugins/djinn/agents/cost-complexity-reviewer.md:147` Node processes with no `--max-old-space-size`, test lanes included (index entry, deep equality incident).
- `plugins/djinn/agents/cost-complexity-reviewer.md:150` An assertion or log call that prints a large value (same incident's mechanism).
- `plugins/djinn/agents/cost-complexity-reviewer.md:160` Log and telemetry ingestion billed per GB, egress in general, storage transactions.
- `plugins/djinn/agents/cost-complexity-reviewer.md:168` Binaries in git that every clone pays for.
- `plugins/djinn/agents/cost-complexity-reviewer.md:106` Never invent a load figure; use a bound the code carries.

## The One Question
What does one relay review cost today: `grep -h '^| total' <game repo>/audits/*/usage.md` gives the token total per audit, and that one column tells you whether the relay's own bill is the first meter this agent should price.

## Checked and Clean
- `plugins/djinn/agents/cost-complexity-reviewer.md`: read in full; checked for token-billed APIs, bill feedback, unpriceable findings, meter deduplication, the meaning of complexity, Azure plan and environment meters, browser egress, spend gates, storage growth and the three phases. The index's paid-call and heap entries are covered; the gaps above are the rest.

## Files read outside the fence
- `<work repo>/.djinn/config.yaml` (Azure hosting shape, as dispatched)
- `plugins/djinn/agents/perf-reviewer.md` (who owns complexity tags)
- `plugins/djinn/agents/format-reviewer.md` (maintainer complexity owner search)
- `plugins/djinn/agents/consolidator.md` (maintainer complexity owner search)
- `plugins/djinn/agents/bugs-reviewer.md` (maintainer complexity owner search)
