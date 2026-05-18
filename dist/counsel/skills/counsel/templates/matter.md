# Matter Template

Template for `.counsel/active/{matter}/MATTER.md` -- the matter's static identity document.

---

## File Template

```markdown
# Matter: {MATTER_NAME}

## Identity

- **Matter ID:** {MATTER_ID}
- **Client:** {CLIENT_NAME}
- **Matter Type:** {litigation|transactional|regulatory|advisory|adr|administrative|appeals|ip|class_action|investigation}
- **Opened:** {YYYY-MM-DD}

## Jurisdiction

- **Primary:** {JURISDICTION_CODE} (e.g., US-NY, GB, IS)
- **Secondary:** {ADDITIONAL_JURISDICTIONS}
- **Legal System:** {common_law|civil_law|hybrid}

## Parties

| Role | Name | Representation | Notes |
|------|------|----------------|-------|
| Client | {NAME} | This firm | |
| Opposing Party | {NAME} | {COUNSEL_IF_KNOWN} | |
| {OTHER_ROLE} | {NAME} | {COUNSEL_IF_KNOWN} | |

## Summary

{2-3 sentence summary of the matter. What happened, what is at stake, what the client wants.}

## Key Constraints

- **Limitation Period:** {DATE and SOURCE -- e.g., "2026-12-01 per 28 U.S.C. ss 1658(a)"}
- **Budget:** {IF_APPLICABLE}
- **Timeline:** {CLIENT_TIMELINE_EXPECTATIONS}
- **Privilege Level:** {standard|heightened|joint_defense}
- **AI Disclosure:** {required|not_required|check_before_filing}

## Related Matters

{Links to related matters if any, otherwise "None."}

## Engagement

- **Scope:** See `engagement/SCOPE.md`
- **Conflicts:** See `engagement/CONFLICT.md`
- **Privilege:** See `engagement/PRIVILEGE.md`
```

---

## Lifecycle

**Creation:** During Phase 0 (INTAKE), after initial questioning is complete.

**Reading:** On resume, after STATE.md. Provides the static context that rarely changes.

**Writing:** Rarely updated. Only when fundamental matter attributes change (new parties, jurisdiction change, scope amendment).

## Notes

- MATTER.md is the **identity** document. It answers "what is this matter?"
- STATE.md is the **status** document. It answers "where are we now?"
- Keep these concerns separate. Do not put status information in MATTER.md.
