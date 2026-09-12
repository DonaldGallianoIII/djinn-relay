---
id: {{FIX_ID}}
title: Fix brief {{FIX_ID}}
author: Claude {{MODEL}} (/djinn:brief), deliberation by human
date: {{ISO_DATE}}
status: pending
source: {{AUDIT_FILE}}
severity: {{SEVERITY}}
work_set_source: {{WORK_SET_SOURCE}}
work_set:
  files: []
  symbols_renamed: []
  symbols_touched: []
depends_on: []
---

# WHAT

{{One paragraph. Name the files, name the symbols, name the desired end state.}}

# WHY

From {{AGENT_NAME}}: "{{QUOTED_FINDING}}"

**TODO (deliberation context):** _<fill in what was decided with the user, the root-cause insight if any, why THIS fix and not a variant>_

This fix addresses {{SYMPTOM}}.

# SUCCESS CRITERIA

- [ ] {{specific, testable outcome 1}}
- [ ] {{specific, testable outcome 2}}
- [ ] `{{BUILD_CMD}}` passes with no new errors
- [ ] No references to removed or renamed symbols remain in the repo (grep)
- [ ] Doc-block tags on every edited function still describe the code

# REFERENCES

- Audit: {{AUDIT_FILE}}
- Synthesis: {{SYNTHESIS_FILE}}
- Pipe analysis: {{PIPE_CONNECTOR_FILE_OR_NONE}}
- Related code: {{FILE_PATHS}}

# NOTES FOR FIXER

- `work_set.files` is binding. A file outside it means STOP and return BLOCKED_SCOPE.
- Full protocol and report format: the fixer agent definition. This brief does not override it.
