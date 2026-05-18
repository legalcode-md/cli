# State Template

Template for `.counsel/active/{matter}/STATE.md` -- the matter's living memory. Keep under 80 lines.

---

## File Template

```markdown
---
counsel_version: 1.0
matter_id: {MATTER_ID}
matter_type: {MATTER_TYPE}
phase: {CURRENT_PHASE}
status: active
last_updated: "{YYYY-MM-DDTHH:MM:SSZ}"
---

# Matter Status: {MATTER_NAME}

## Current Phase
**{Phase Name}** -- {One-line description of current activity}

## Immediate Deadlines
- {YYYY-MM-DD}: {Deadline description}
- {YYYY-MM-DD}: {Deadline description}
- {YYYY-MM-DD}: {Deadline description}

## Session Continuity
Last session: {YYYY-MM-DD}
Stopped at: {Description of last completed action}
Resume: {What to do next}
```

---

## Format Guidance

- **Under 80 lines.** STATE.md is a digest, not an archive.
- **YAML frontmatter** for machine-readable metadata.
- **Three sections only:** Current Phase, Immediate Deadlines, Session Continuity.
- If accumulated context grows too large, prune to essentials.

---

## Lifecycle

### When to Read
- **First step of every workflow.** Every phase, every command, every resume starts by reading STATE.md.
- Provides instant orientation: what phase, what deadlines, where we stopped.

### When to Write
- **After every significant action.** Phase transitions, completed tasks, new deadlines, strategy changes.
- Update the YAML frontmatter (`phase`, `last_updated`).
- Update the prose sections to reflect current state.
- Clear resolved deadlines. Add new ones.

### Graduated Detail

STATE.md is the entry point. For deeper context, load on demand:

| File | When to Load |
|------|-------------|
| STATE.md | Always (first step) |
| MATTER.md | On resume (static identity) |
| STRATEGY.md | When making strategy decisions |
| AUTHORITIES.md | During research and verification |
| DEADLINES.json | For deadline calculations |
| workstream files | When executing specific tasks |
| session reports | When reviewing history |
