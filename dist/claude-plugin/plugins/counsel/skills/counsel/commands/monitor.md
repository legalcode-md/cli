---
name: counsel:monitor
description: Poll-based monitoring of deadlines, authorities, and regulatory changes
argument-hint: "--matter <id>"
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
Use on active matters to check for approaching deadlines, changes in cited authorities (overruled, amended, superseded), and relevant regulatory developments. Can be run on a schedule or ad hoc.
</context>

<objective>
Produce a monitoring report listing deadline status, authority change alerts, and any new regulatory developments relevant to the matter.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/monitor.md
@.claude/skills/counsel/references/deadline-rules.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
