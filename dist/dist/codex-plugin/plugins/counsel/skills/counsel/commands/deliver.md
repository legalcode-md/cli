---
name: counsel:deliver
description: AI-assisted filing/delivery preparation with pre-delivery checklist
argument-hint: "[document path] [filing method]"
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
Use when a work product is ready for filing or delivery. Runs a pre-delivery checklist covering format compliance, signature blocks, filing fees, service requirements, and deadline confirmation.
</context>

<objective>
Produce a delivery-ready package with pre-delivery checklist completed, filing instructions, service list, and confirmation artifacts.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/deliver.md
@.claude/skills/counsel/references/filing-requirements.md
@.claude/skills/counsel/templates/delivery-checklist.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
