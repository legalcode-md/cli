---
name: counsel:review
description: Peer review with counter-argument stress test and citation spot-check
argument-hint: "[document path or matter id]"
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
Use as a second-opinion pass on any work product. Applies adversarial counter-argument testing to every conclusion, spot-checks a sample of citations, and flags weaknesses in reasoning or coverage.
</context>

<objective>
Produce a review memo with strength/weakness assessment, counter-argument results, citation spot-check results, and recommended revisions.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/review.md
@.claude/skills/counsel/references/review-standards.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
