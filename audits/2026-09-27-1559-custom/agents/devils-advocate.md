---
title: devils-advocate report, audits/2026-09-27-1559-custom
author: Claude Opus 5.5 (devils-advocate)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/agents/cost-complexity-reviewer.md:67` On an Azure app with no hand-written `cost.hosting`, the agent reviews local and CI cost only, even when a Bicep or `azure.yaml` file in the repo names the SKU, region and instance count.
Claim: `cost-complexity-reviewer.md:67-68` "With no `cost.hosting`, review for local and CI cost only ... and say so in one line", with `:44` "Never guess a value and never go looking for one".
Mechanism: `:78-82` tells the agent to read the IaC, and the IaC states the hosting (plan SKU, instance count, region). But `:44` and `:67` forbid using anything not pasted from config. So the Azure half of Donald's question gets a one-line skip. No project has a `cost` block today, and the template has none, so this is the default on day one. With `cost.hosting` set and no `cost.load`, `:70-71` caps every load-driven Azure finding below MEDIUM. External request volume is never bounded in code, so the `:106-107` code-bound escape does not help a web app the way it helps the game repo's seed cap.
Traced: `:44` (no looking) to `:67-68` (local only) against `:78-82` (IaC always read). The IaC facts are read and then not allowed as inputs.
Why other reviewers miss it: breaker MEDIUM-3 asks whether IaC findings get reported, and ux REC-5 counts the "Inputs missing" lines. Neither asks whether IaC can stand in for `cost.hosting`.
What would catch it: a dispatch fixture, an Azure repo with `main.bicep` declaring `sku: { name: 'P1v3' }, capacity: 2` and no `cost` block. Pass means the Cost model has a hosting row cited to `main.bicep:<line>`. Fix wording for `:67`: "With no `cost.hosting`, take hosting from the IaC files under the standing exception, cite their file:line, and say so. Fall back to local and CI only when neither exists."

MEDIUM-2. `plugins/djinn/agents/cost-complexity-reviewer.md:16` The agent never states what the project costs to run. It only covers the changed paths, so the biggest line on an Azure bill, the always-on plan, shows up only in a diff that edits it.
Claim: `:3` "Finds code that works and still costs money ... always-on compute". `:17-18` "What does it cost to run? ... per month". `:152` "an SKU or instance count the load does not need".
Mechanism: `:16` limits all three questions to "every changed path you can reach". `:83` reports on IaC "only where a changed file's cost runs through them", and `:89` bars pre-existing problems. A typical diff touches app code, not the plan. So the report's Cost model covers the delta only and never gives the monthly total Donald asked for. Scope item 5's oversized-SKU check can only fire when someone is already editing the SKU. The Cost model table (`:228-231`) is not a finding and blocks nothing, so it could carry baseline meters with no clash with the fence. The prompt never says it may.
Traced: `:16` (changed paths) to `:83` (IaC only when a changed file runs through it) to `:89` (no pre-existing) to `:228` (Cost model, no baseline rule).
Why other reviewers miss it: breaker MEDIUM-3 treats pre-existing IaC cost as a double-report risk to suppress. Resolving that the obvious way ("never report it") removes the only baseline the goal needs, and no wave 1 reviewer judged the fence against "how much does it cost to run".
What would catch it: add after `:83`: "The Cost model always carries one row per standing-exception meter (plan, instance count, CI minutes, paid API), changed or not, marked `baseline` or `delta`. Findings stay fence-gated." Check: a CSS-only fence on a repo with Bicep yields a Cost model with a `baseline` plan row and zero findings.

### LOW
LOW-1. `plugins/djinn/agents/cost-complexity-reviewer.md:240` The template's example convention is one the conventions already hold, and the prompt never says to check `conventions_files` or the index before proposing one.
Claim: `:240-241` "Every node test script sets --max-old-space-size (MEDIUM-1). Check: grep the manifest's test scripts for the flag."
Mechanism: `~/Conventions/code/KNOWN-BUGS.md:338-342` already prescribes `node --max-old-space-size=4096 --test` and gives the same detection grep. `:39-40` hands index hits to known-bugchecker, but `:237-241` models proposing the same rule again as new. `:63` lists `conventions_files` as input and never says to read them for an existing rule. The result is "Conventions proposed" sections that repeat Donald's own rules back to him, not new ceilings.
Traced: `:240` to `KNOWN-BUGS.md:338-342`; `:63` (listed) to `:237` (no existing-rule check).
Why other reviewers miss it: integration LOW-6 covers where the section goes, not whether its contents are new.
What would catch it: add to `:237`: "Before proposing a rule, grep `conventions_files` and `known_bugs_index` for it. An existing rule the code breaks is a finding citing that rule, not a proposal. Name the conventions file each new rule belongs in." Swap the example for one not already in the index.

LOW-2. `plugins/djinn/agents/cost-complexity-reviewer.md:99` The one Azure price source the prompt names may not be readable by WebFetch, and it leaves out the official machine-readable one. Untraced suspicion.
Claim: `:99-100` "azure.microsoft.com/pricing ... the provider's own pricing or limits page".
Mechanism: if the Azure pricing detail pages fill their price tables client-side by region and currency, WebFetch gets the page with no figures. Every Azure price then drops to UNVERIFIED under `:101-103`, and the Cost model is all variables. The Azure Retail Prices API (`https://prices.azure.com/api/retail/prices`, Microsoft's own, filterable by `armSkuName` and `armRegionName`) returns plain JSON and is not named.
Traced: not traced. This agent has no web tool to fetch the page.
Why other reviewers miss it: breaker LOW-1 covers region and tier mismatch in a fetched price, not a fetch that returns no price.
What would catch it: WebFetch `https://azure.microsoft.com/en-us/pricing/details/app-service/linux/` and grep the result for a dollar figure next to `P1v3`. If none is there, add the Retail Prices API to `:99` as the preferred Azure source.

### DEBT
none

### REC
none

## Checked and Clean
- `plugins/djinn/agents/cost-complexity-reviewer.md`: "complexity" is answered. `:21-22` and `:122-124` require each variable, its real bound and where it comes from, and send a capped O(n squared) to Checked and Clean with the cap's file:line. On the browser game the code bounds exist (seed cap, `CENSUS.MAX_ABILITIES` 12), so `:106-107` lets bounds be stated without `cost.load`.
- `plugins/djinn/agents/cost-complexity-reviewer.md`: the paid 3D API case works. Scope item 1 at `:132-135` names "made before the intent to make it is saved" and "repeated on retry or resume", which match the two Meshy incidents at `KNOWN-BUGS.md:149-158` and `:388-394`. `:59-60` lets `cost.paid_apis` carry a price in credits Donald supplies, so the plan price no public page shows can still be cited.
- `plugins/djinn/agents/cost-complexity-reviewer.md`: "better for speed" is not orphaned. `:29-32` hands CPU to perf-reviewer, and the proposed cost scope (integration REC-4) runs perf-reviewer beside it.
- The citation rule leaving reports empty of numbers: already covered by breaker HIGH-1 and gap-hunter REC-3 (unbounded findings need no price) and gap-hunter REC-2 (actuals). Not restated.
- Conventions having nowhere to land: already covered by integration LOW-6 and REC-8. Not restated. LOW-1 above is the residue: what goes into that section.

## Files read outside the fence
- `plugins/djinn/commands/review.md` (scope lists, dispatch wiring)
- `audits/2026-09-27-1559-custom/agents/breaker.md` (full text of MEDIUM-3)
- `audits/2026-09-27-1559-custom/agents/gap-hunter.md` (full text of REC-2, REC-3)
- `audits/2026-09-27-1559-custom/agents/integration-reviewer.md` (full text of REC-4, LOW-6)
- `plugins/djinn/agents/perf-reviewer.md` (speed handoff target)
- `<game repo>/.djinn/config.yaml` (real project has cost block?)
