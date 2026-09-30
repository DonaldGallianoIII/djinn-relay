---
title: devils-advocate report, audits/2026-09-27-1628-custom
author: Claude Opus 5.5 (devils-advocate)
date: 2026-09-27
status: audit finding, not yet deliberated
---

## Round 1 status
- MEDIUM-1 (synthesis MEDIUM-2, hosting skipped when the IaC names it): RESOLVED. `cost-complexity-reviewer.md:49-51` and `:79-81` take hosting from the IaC by file:line, and `:93-94` opens unchanged IaC when "hosting has to come from it". Residue: with no `cost.load`, an Azure breach still cannot reach MEDIUM (`:210-213`). That follows the load rule Donald accepted, so it is not refiled.
- MEDIUM-2 (synthesis LOW-17, no baseline): RESOLVED in part. `:26-27` and `:94-95` put baseline rows in the Cost model and `:256` shows one. The part still open is LOW-1 below.
- LOW-1 (synthesis LOW-26, the example convention was already in the index): RESOLVED. `:276-279` now says to check `conventions_files` and `known_bugs_index` first, and the heap-flag example is gone from Conventions proposed.
- LOW-2 (synthesis REC-19, the Azure Retail Prices API): RESOLVED at `:114-115`, even though the decision record defers it (integration-reviewer REC-2 already notes that).
- Wiring (synthesis LOW-6, REC-1): DEFERRED. Cost model, UNVERIFIED and Inputs missing still reach no synthesis consumer. Nothing dispatches this agent yet.

The question again. Dispatched as written, the Azure work app gets a useful report. Hosting comes from the IaC, the baseline plan row is priced from prices.azure.com, and unbounded retries and leaks file as HIGH with no price needed. The local game with a paid 3D API gets less than it did in round 1. Two findings below explain why: the prompt tightened in two places without a way back up. The CONTRACTS.md amendment's over-reach (reaching perf-reviewer and breaker) is breaker MEDIUM-1 and integration-reviewer's blast radius LOW. I found nothing beyond those.

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/agents/cost-complexity-reviewer.md:120` The region, tier and currency match rule sends every paid API price to UNVERIFIED, the owner's own config price included, because a per-use API has no region to match `cost.hosting`.
Claim: `:120-121` "A cited price names its region, tier and currency, and they match `cost.hosting`, or it is UNVERIFIED." Also `:66-68`, where `cost.paid_apis` carries `price` and `as_of`.
Mechanism: a Meshy credit, a Claude token or a 3D API task is priced per account. It has no region and no hosting tier, and for a local game `cost.hosting` is "local dev only" (`:57`). A literal agent cannot match any paid API price to hosting, so C1-style rows stay UNVERIFIED even when the owner typed the price into `cost.paid_apis`. Every paid-call MEDIUM against `cost.budget` becomes unfileable. Only the no-price HIGH survives. On the paid 3D API scenario, the one meter that bills gets no number.
Traced: `:66-68` (config price) to `:111` (config is a source) to `:120-121` (must match `cost.hosting`, else UNVERIFIED) to `:57` (local hosting line) to `:210-213` (MEDIUM needs every figure cited).
Why other reviewers miss it: breaker LOW-7 reads the query-content line at `:133`, and integration-reviewer read the contract-versus-prompt source list. Neither ran a non-Azure paid API through the match rule.
What would catch it: a dispatch fixture with `cost.hosting: local dev only` and one `cost.paid_apis` entry (unit credit, price, as_of), and an expected report where C1 carries the config price and not UNVERIFIED. Suggested fix wording: "A cited hosting price names its region, tier and currency and they match `cost.hosting`. A per-use API price names its unit and currency and matches `cost.paid_apis`."

MEDIUM-2. `plugins/djinn/agents/cost-complexity-reviewer.md:145` A heap ceiling breach, one of the ceilings the goal names, cannot reach MEDIUM unless the owner writes bytes per item into the config. No key asks for that number and no source class supplies it.
Claim: `:145-148` "Before filing a ceiling, show both sides: the demand from source and the limit from a source ... 4 million rows at about 1 KB each" (both numbers from config), with `:3` "memory and heap caps" and `:169-174` scope item 3.
Mechanism: heap demand is count times bytes per item. Count can come from a code cap (`:116`). Bytes per in-memory object (a JS object, a trace snapshot, a .NET record) is not on a provider page, is not a bound in code except for typed arrays and buffers, and is not among the `cost.load` examples at `:58-59` (requests, users, rows, file sizes, batch sizes, seeds). The owner's measured numbers, such as a bench or leak baseline doc in the repo, are not a source either. So an "N seeds keep N traces against a 4 GB heap" breach goes to UNVERIFIED, and the heap half of the goal can only report HIGH (unbounded) or nothing. Raw-byte loads (whole-file reads of a configured file size) are the one path that still reaches MEDIUM.
Traced: `:58-59` (load keys) to `:109-116` (three sources) to `:145-148` (demand from source) to `:118-120` (a tier that depends on a variable goes to UNVERIFIED) to `:210-213` (MEDIUM needs a cited load reaching a cited limit). The contract agrees at `CONTRACTS.md:31-32`.
Why other reviewers miss it: breaker LOW-6 covers an owner's limit written in a repo doc. This is the demand side, which no wave 1 finding reads.
What would catch it: a fixture where a fenced loop keeps one object per seed under a code cap of 2000 against a cited heap limit, with the expected tier written down. If the expected tier is MEDIUM, add `cost.load` guidance, "bytes per item, measured, with the command and date", accepted like a `cost.limits` command output at `:63-65`.

### LOW
LOW-1. `plugins/djinn/agents/cost-complexity-reviewer.md:26` "Your Cost model table also carries what the project already pays", but CI and an unchanged paid-API tool are read only when a fenced file names them, so the baseline is partial.
Claim: `:26-27` and `:94-95` ("It feeds the Cost model as baseline rows").
Mechanism: `:92-94` opens an unchanged CI definition or manifest only "when a fenced file names it or hosting has to come from it". Hosting now has its own path, but CI minutes and an unchanged billed script (a Meshy tool the diff did not touch) do not. Those baseline rows are missing from a typical app-code diff while the table claims the project baseline. Round 1 plan step 5 said "always carries one row per standing-exception meter". The prompt kept the read gate and dropped "always".
Traced: `audits/.../round-1-synthesis.md:153` (plan step 5, "always") to `cost-complexity-reviewer.md:92-94` (read gate) against `:26-27` (claim).
Why other reviewers miss it: breaker LOW-4 and integration-reviewer LOW-3 read the large-fence skip list, not the read gate on unchanged meters.
What would catch it: reword `:26` to "carries the baseline of every meter it read", or list CI and `cost.paid_apis` entries as always-read baseline sources. A fixture with an untouched workflow file and an app-only diff settles which one.

### DEBT
none

### REC
none

## Checked and Clean
- `plugins/djinn/agents/cost-complexity-reviewer.md`: the HIGH path with no price (`:126-128`, `:204-209`, template `:292-294`) now lets an unbounded Meshy or Azure retry file as blocking with the price as a variable. Round 1 HIGH-1 is closed for the goal's main case.
- `plugins/djinn/agents/cost-complexity-reviewer.md`: the standing ruling holds. No line lets a dollar figure come from memory (`:109-121`, `:258`, `:270`).
- `plugins/djinn/agents/cost-complexity-reviewer.md`: on the Azure scenario, the baseline plan row is derivable (`:94`, `:114-115`, `:256`, units 730 from the month, instance count and SKU from the IaC).
- `plugins/djinn/CONTRACTS.md:27-35`: holds for this agent's HIGH and MEDIUM. The over-reach onto perf-reviewer and breaker is breaker MEDIUM-1, integration-reviewer's blast radius LOW and integration-reviewer REC-1. Not restated.

## Files read outside the fence
none
