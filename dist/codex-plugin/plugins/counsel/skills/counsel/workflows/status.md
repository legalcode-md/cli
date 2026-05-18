<purpose>
Cross-matter status workflow. Reads the matter registry and produces a consolidated view of
all active matters with their current phase, approaching deadlines, and outstanding action
items. Designed for the "what needs attention" question across an entire practice.
</purpose>

<process>

## 1. Read Matter Registry

Read `.counsel/matters.json`.

If the file does not exist, inform the user: "No COUNSEL matters found. Run `/counsel:new-matter`
to create one."

Filter to matters with `status: "active"`.

If no active matters: "No active matters. All matters are closed or archived."

## 2. Load Each Matter's State

For each active matter, read:
- `.counsel/active/{matter-id}/STATE.md` -- current phase and status
- `.counsel/active/{matter-id}/DEADLINES.json` -- deadline data

Do NOT load full matter context (MATTER-CONTEXT.md, STRATEGY.md, research memos, etc.).
Status view is a summary -- load only what's needed for the overview.

## 3. Extract Deadline Summary

For each matter, parse DEADLINES.json and identify:
- Overdue deadlines (date < today)
- Critical deadlines (< 7 days)
- Urgent deadlines (< 30 days)
- Next upcoming deadline (regardless of urgency)

Compile a cross-matter deadline view sorted by date (earliest first):

```markdown
## All Approaching Deadlines

| Date | Days | Urgency | Matter | Deadline | Type |
|------|------|---------|--------|----------|------|
| {date} | {days} | OVERDUE | {matter name} | {description} | {type} |
| {date} | {days} | CRITICAL | {matter name} | {description} | {type} |
| {date} | {days} | URGENT | {matter name} | {description} | {type} |
```

## 4. Extract Phase and Action Summary

For each matter, extract from STATE.md:
- Current phase
- Session continuity (what was last worked on, what's next)
- Any blocking issues

## 5. Present Cross-Matter Status

```markdown
# COUNSEL Status Report

## Date
{today}

## Active Matters: {count}

### Matter Summary

| # | Matter | Type | Phase | Last Updated | Next Action |
|---|--------|------|-------|-------------|-------------|
| 1 | {name} ({id}) | {type} | {phase} | {date} | {next action from STATE.md} |
| 2 | {name} ({id}) | {type} | {phase} | {date} | {next action from STATE.md} |

### Deadline Overview

**Overdue:** {count} -- REQUIRES IMMEDIATE ATTENTION
**Critical (< 7 days):** {count}
**Urgent (< 30 days):** {count}
**Total active deadlines:** {count}

{deadline table from step 3}

### Matters Requiring Attention

{List matters with overdue or critical deadlines, or matters that have not been
updated in > 7 days, or matters with blocking issues}
```

## 6. Per-Matter Detail (Expandable)

For each matter, provide a concise status block:

```markdown
---

### {matter name} ({matter-id})

**Type:** {type} | **Phase:** {phase} | **Last Updated:** {date}

**Current Status:**
{1-2 sentence summary from STATE.md}

**Next Deadlines:**
- {nearest deadline}: {date} ({days} days)
- {next deadline}: {date} ({days} days)

**Next Action:**
{from STATE.md session continuity or HANDOFF.json if present}

**Blocking Issues:**
{any, or "None"}
```

## 7. Recommendations

Based on the status data, suggest priorities:

```markdown
## Recommended Priorities

1. **{matter with most urgent deadline}** -- {deadline} in {days} days
2. **{matter with stale state}** -- not updated since {date}
3. **{matter with blocking issues}** -- blocked on {issue}
```

If all matters are on track with no urgent deadlines: "All matters on track. No items
requiring immediate attention."

## 8. Output Options

Present the status report directly in the conversation.

If the user wants a saved copy:
- Save to `.counsel/sessions/YYYYMMDD-status.md`

This workflow does not modify any matter state -- it is read-only.

</process>

<outputs>
- Status report presented in conversation (no files modified)
- Optional: .counsel/sessions/YYYYMMDD-status.md (if user requests saved copy)
</outputs>

<references>
- LEGAL_GSD.md: Session Continuity Protocol
- LEGAL_GSD.md: Multi-Matter Directory Structure
- LEGAL_GSD.md: DEADLINES.json format
- LEGAL_GSD.md: STATE.md format
</references>
