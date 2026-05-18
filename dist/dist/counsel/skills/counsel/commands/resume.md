---
name: counsel:resume
description: Resume work on an active matter by reading STATE.md and HANDOFF.json
argument-hint: "[matter id]"
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
Use to pick up where a previous session left off. Reads the matter's STATE.md for overall status and HANDOFF.json for the last session's specific context, pending tasks, and next actions.
</context>

<objective>
Load matter state, display a summary of current status and pending work, and prepare to continue from the recorded handoff point.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/resume.md
@.claude/skills/counsel/references/handoff-schema.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
