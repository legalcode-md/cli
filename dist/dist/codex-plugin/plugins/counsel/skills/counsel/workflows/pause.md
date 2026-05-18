<purpose>
Session pause workflow. Creates a structured HANDOFF.json with the current task state so the
next session can resume exactly where this one stopped. Updates STATE.md with session
continuity information. Designed for clean context handoff between sessions.
</purpose>

<process>

## 1. Assess Current State

Before pausing, determine what is currently in progress:

- What task is being worked on?
- How far along is it?
- What remains to be done?
- What is the single most important next action?
- Is there context that would be lost if the session ends now?

If in the middle of a multi-step operation (e.g., research across multiple issues, drafting
a multi-section document), note which steps are complete and which remain.

## 2. Create HANDOFF.json

Write `.counsel/active/{matter-id}/HANDOFF.json`:

```json
{
  "version": "1.0",
  "timestamp": "{ISO timestamp}",
  "matter_id": "{matter-id}",
  "phase": "{current phase}",
  "current_task": "{what was being worked on}",
  "task_progress": "{specific progress description}",
  "remaining_items": [
    "{item 1 still to do}",
    "{item 2 still to do}"
  ],
  "next_action": "{single most important thing to do next}",
  "context_notes": "{important context that would otherwise be lost}",
  "files_modified": [
    "{list of files changed this session that are relevant}"
  ],
  "blocking_issues": [
    "{any issues that block progress, if applicable}"
  ]
}
```

**HANDOFF.json content guidelines:**

- `current_task`: Be specific. Not "working on research" but "Researching limitation period
  for negligence claim under NY CPLR 214"
- `task_progress`: Quantify when possible. "3 of 7 issues researched" not "some research done"
- `next_action`: One clear action. The resume session should be able to start immediately.
- `context_notes`: Include anything non-obvious. Patterns noticed, decisions made but not yet
  documented, important findings not yet written up, things tried that did not work.
- `remaining_items`: Ordered by priority. First item should match `next_action`.
- `blocking_issues`: Anything that prevents progress without human input.

## 3. Update STATE.md Session Continuity

Update the session continuity section of `.counsel/active/{matter-id}/STATE.md`:

```markdown
## Session Continuity
Last session: {today's date}
Stopped at: {brief description of stopping point}
Resume: {what to do when resuming -- matches next_action from HANDOFF.json}
```

Also update:
- `last_updated` in the frontmatter
- Any deadline or status changes from this session
- Current phase (if it changed)

Keep STATE.md under 80 lines. If the session continuity section is growing too large,
summarize older session notes and keep only the most recent.

## 4. Write Session Report (Optional)

If significant work was done this session, write a session report:

`.counsel/active/{matter-id}/sessions/YYYYMMDD-report.md`:

```markdown
# Session Report: {date}

## Duration
{approximate session duration}

## Work Completed
- {completed item 1}
- {completed item 2}

## Decisions Made
- {decision and rationale}

## Issues Encountered
- {issue and how it was handled}

## State at End of Session
Phase: {phase}
Active task: {task}
Progress: {description}
```

This is optional -- only write it if the session involved substantive work worth recording.
Skip for brief check-in sessions.

## 5. Verify Pause State

Confirm the pause state is complete:
- [ ] HANDOFF.json created with all fields populated
- [ ] STATE.md session continuity section updated
- [ ] All in-progress work is saved (no unsaved edits)
- [ ] Any new deadlines discovered this session are registered in DEADLINES.json
- [ ] Any new authorities found this session are registered in AUTHORITIES.md

## 6. Confirm Pause

Present summary:

```markdown
## Session Paused

**Matter:** {matter name} ({matter-id})
**Phase:** {current phase}
**Stopped at:** {current_task}
**Next action:** {next_action}

To resume: run `/counsel:resume`
```

</process>

<outputs>
- .counsel/active/{matter}/HANDOFF.json -- Ephemeral pause state
- Updated .counsel/active/{matter}/STATE.md -- Session continuity section
- .counsel/active/{matter}/sessions/YYYYMMDD-report.md (optional)
</outputs>

<references>
- LEGAL_GSD.md: Session Continuity Protocol
- LEGAL_GSD.md: HANDOFF.json (Ephemeral Pause State)
- LEGAL_GSD.md: STATE.md (Living Status)
- LEGAL_GSD.md: Graduated Detail Principle
</references>
