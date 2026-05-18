<purpose>
Session resume workflow. Restores context from the file-based state system so a new session
can pick up where the last one left off. Reads the matter registry, loads the relevant matter's
state, consumes any handoff data, and surfaces approaching deadlines.
</purpose>

<process>

## 1. Read Matter Registry

Read `.counsel/matters.json` to identify active matters.

If the file does not exist, inform the user: "No COUNSEL matters found. Run `/counsel:new-matter`
to create one."

Filter to matters with `status: "active"`.

## 2. Select Matter

**If single active matter:** Proceed with that matter automatically.

**If multiple active matters:** Present a selection:

```markdown
## Active Matters

| # | ID | Name | Type | Phase | Last Updated |
|---|-----|------|------|-------|-------------|
| 1 | {id} | {name} | {type} | {phase} | {date} |
| 2 | {id} | {name} | {type} | {phase} | {date} |
```

"Which matter would you like to resume?"

**If no active matters:** Inform the user and suggest `/counsel:new-matter`.

## 3. Load STATE.md

Read `.counsel/active/{matter-id}/STATE.md`.

This is the single entry point for any session. Extract:
- Current phase
- Status
- Immediate deadlines
- Session continuity section (last session date, what was stopped at, resume point)

## 4. Check HANDOFF.json

Check for `.counsel/active/{matter-id}/HANDOFF.json`.

**If HANDOFF.json exists:**

Parse the handoff data:
- `current_task` -- what was being worked on
- `task_progress` -- how far it got
- `next_action` -- what to do next
- `context_notes` -- important context from the pausing session

Present the handoff summary:

```markdown
## Handoff from Last Session

**Last session:** {timestamp}
**Was working on:** {current_task}
**Progress:** {task_progress}
**Recommended next action:** {next_action}

**Context notes:**
{context_notes}
```

**DELETE HANDOFF.json after consuming it.** It is ephemeral -- once the resume session has read
it, it must not persist to avoid stale handoff data confusing future sessions.

```bash
rm .counsel/active/{matter-id}/HANDOFF.json
```

**If HANDOFF.json does not exist:**

Use the session continuity section from STATE.md to determine resume point.

## 5. Check Approaching Deadlines

Read `.counsel/active/{matter-id}/DEADLINES.json`.

Surface any deadlines within 7 days:

```markdown
## Approaching Deadlines (Next 7 Days)

| Deadline | Date | Days Remaining | Urgency |
|----------|------|---------------|---------|
```

If any deadlines are OVERDUE, flag immediately as CRITICAL.
If any deadlines are within 3 days, flag as URGENT.

If no deadlines within 7 days, note: "No deadlines within the next 7 days."

## 6. Load Additional Context (On Demand)

Following the graduated detail principle, do NOT auto-load everything. Only load:

**Always loaded:**
- STATE.md (already loaded in step 3)

**Loaded on resume:**
- MATTER.md -- static identity, rarely changes

**Loaded on demand (only when needed for the current task):**
- STRATEGY.md -- if resuming strategy work
- Research memos -- if resuming research
- Deliverables -- if resuming drafting/review
- Timeline entries -- if chronology is relevant
- Session reports -- historical record, rarely needed

Read MATTER.md now for basic context:

```markdown
## Matter Identity

**Parties:** {from MATTER.md}
**Jurisdiction:** {from MATTER.md}
**Type:** {from MATTER.md}
```

## 7. Present Status Summary

Compile and present:

```markdown
# Resuming: {matter name} ({matter-id})

## Current Phase
{phase} -- {brief description of where things stand}

## Handoff
{from step 4, if available}

## Approaching Deadlines
{from step 5}

## Matter Identity
{from step 6}

## Suggested Next Actions
1. {most logical next step based on phase and handoff}
2. {alternative action}
3. {other relevant actions}
```

## 8. Offer Contextual Actions

Based on the current phase and state, offer relevant next actions:

| Current Phase | Available Actions |
|---------------|-------------------|
| intake | Continue intake, check gates |
| strategy | Continue strategy development, start research |
| research | Continue research, start analysis |
| analysis | Continue analysis, start drafting |
| drafting | Continue drafting, run verification |
| verification | Run verification, address failures |
| review | Continue review, prepare delivery |
| delivery | Prepare filing package, check deadlines |
| monitor | Run monitor check, review changes |

"What would you like to work on?"

</process>

<outputs>
- HANDOFF.json deleted (if it existed)
- No new files created -- this workflow reads state and presents it
</outputs>

<references>
- LEGAL_GSD.md: Session Continuity Protocol
- LEGAL_GSD.md: Resume Protocol
- LEGAL_GSD.md: Graduated Detail Principle
- LEGAL_GSD.md: HANDOFF.json (Ephemeral Pause State)
</references>
