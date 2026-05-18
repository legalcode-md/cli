---
name: counsel:pause
description: Save current work state for later resumption by creating HANDOFF.json
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
Use when stopping work on a matter mid-session. Captures the current context, pending tasks, open questions, and next actions into HANDOFF.json so a future session can resume seamlessly.
</context>

<objective>
Update STATE.md with current status and create HANDOFF.json capturing session context, completed work, pending tasks, blockers, and recommended next steps.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/pause.md
@.claude/skills/counsel/references/handoff-schema.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
