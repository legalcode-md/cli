---
name: counsel:close
description: Matter closure with outcome documentation and knowledge capture
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
Use when a matter reaches final disposition. Documents the outcome, captures lessons learned, archives work product, and updates the knowledge base for future reference.
</context>

<objective>
Produce a closure memo with outcome summary, lessons learned, reusable templates/patterns identified, and archive the matter from active to closed.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/close.md
@.claude/skills/counsel/templates/closure-memo.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
