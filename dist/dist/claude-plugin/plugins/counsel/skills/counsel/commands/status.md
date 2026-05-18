---
name: counsel:status
description: Show all active matters with approaching deadlines
argument-hint: ""
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
  - AskUserQuestion
---
<context>
Use for a dashboard view across all active matters. Reads STATE.md from each matter in .counsel/active/ and surfaces approaching deadlines, current phase, and any flagged blockers.
</context>

<objective>
Display a summary table of all active matters showing matter id, phase, next deadline, days remaining, and any blockers or alerts.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/status.md
@.claude/skills/counsel/references/deadline-rules.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
