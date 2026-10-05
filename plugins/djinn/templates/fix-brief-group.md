---
id: {{GROUP_ID}}
title: Group fix brief {{GROUP_ID}}, {{N_FINDINGS}} findings
author: Claude {{MODEL}} (/djinn:brief, group), deliberation by human
date: {{ISO_DATE}}
status: pending
selection: {{SELECTION}}
source: {{SYNTHESIS_FILE}}
findings:
  - id: {{FINDING_ID}}
    severity: {{SEVERITY}}
    status: pending
work_set_source: {{WORK_SET_SOURCE}}
work_set:
  files: []
  symbols_renamed: []
  symbols_touched: []
depends_on: []
---

# WHAT

One fixer works through every finding below, in order, inside one work set
(the union of what each finding needs). {{N_FINDINGS}} findings selected by
`{{SELECTION}}`{{PART_OF}}.

# WHY

**TODO (deliberation context):** _<fill in anything decided with the user
that applies to the whole group: a finding to leave alone, a fix to prefer>_

# FINDINGS

<!-- One section per finding, in the order the fixer works. -->

## {{FINDING_ID}} ({{SEVERITY}}) `{{FILE_LINE}}`

From {{AGENT_NAME}}: "{{QUOTED_FINDING}}"

What to change: {{One or two sentences. Name the file, the symbol, the end state.}}

- [ ] {{specific, testable outcome for this finding}}

# SUCCESS CRITERIA FOR THE GROUP

- [ ] Every finding above is FIXED, or reported NOT-PRESENT or BLOCKED with a reason
- [ ] `{{BUILD_CMD}}` passes with no new errors
- [ ] No references to removed or renamed symbols remain in the repo (grep)
- [ ] Doc-block tags on every edited function still describe the code

# REFERENCES

- Synthesis: {{SYNTHESIS_FILE}}
- Pipe analysis: {{PIPE_CONNECTOR_FILE_OR_NONE}}

# NOTES FOR FIXER

- This is a group brief: follow the fixer agent definition's Group mode.
- `work_set.files` is binding for every finding. A finding that needs a
  file outside it is that finding's BLOCKED_SCOPE, not the group's: skip it
  and carry on with the rest.
