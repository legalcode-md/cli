# Matter Context Template

Template for `.counsel/active/{matter}/MATTER-CONTEXT.md` -- the full output of the questioning system.

---

## File Template

```markdown
# Matter Context: {MATTER_NAME}

Questioning mode: {interactive|assumptions|strategy}
Completed: {YYYY-MM-DD}

---

## 1. Matter Boundary

**In scope:** {What this engagement covers}

**Out of scope:** {What is explicitly excluded}

**Adjacent matters:** {Related issues identified but deferred}

---

## 2. Established Facts

{Numbered list of facts established during questioning. Each fact is an observable event or documented condition, not a characterization or opinion.}

1. {FACT}
2. {FACT}
3. {FACT}

---

## 3. Legal Issues Identified

| # | Issue | Type | Priority | Notes |
|---|-------|------|----------|-------|
| 1 | {ISSUE} | {threshold|merits|alternative|remedies} | {high|medium|low} | {NOTES} |
| 2 | {ISSUE} | {threshold|merits|alternative|remedies} | {high|medium|low} | {NOTES} |

---

## 4. Parties

| Name | Role | Relationship to Client | Contact/Counsel | Notes |
|------|------|----------------------|-----------------|-------|
| {NAME} | {ROLE} | {RELATIONSHIP} | {CONTACT} | {NOTES} |

---

## 5. Timeline

| Date | Event | Source | Significance |
|------|-------|--------|-------------|
| {YYYY-MM-DD} | {EVENT} | {CLIENT_STATEMENT|DOCUMENT|PUBLIC_RECORD} | {WHY_IT_MATTERS} |

---

## 6. Document Inventory

| Document | Date | Type | Status | Significance |
|----------|------|------|--------|-------------|
| {DOCUMENT_NAME} | {DATE} | {contract|correspondence|filing|record|other} | {in_possession|requested|missing} | {RELEVANCE} |

---

## 7. Client Preferences

- **Risk tolerance:** {conservative|moderate|aggressive}
- **Priority:** {speed|cost|thoroughness|relationship_preservation}
- **Budget constraints:** {IF_APPLICABLE}
- **Timeline expectations:** {CLIENT_EXPECTATIONS}
- **Preferred outcome:** {WHAT_CLIENT_WANTS}
- **Acceptable alternatives:** {FALLBACK_POSITIONS}

---

## 8. Open Questions

{Questions that remain unanswered after questioning. Each should note why it matters and what it affects.}

1. {QUESTION} -- affects {WHAT_IT_AFFECTS}
2. {QUESTION} -- affects {WHAT_IT_AFFECTS}

---

## 9. Jurisdictional

- **Governing law:** {JURISDICTION and BASIS}
- **Forum:** {COURT_OR_AGENCY}
- **Choice of law issues:** {IF_ANY}
- **Multi-jurisdictional considerations:** {IF_ANY}
- **Applicable limitation periods:** {WITH_CITATIONS}

---

## 10. Deferred Matters

{Issues identified during questioning that are outside the current engagement scope but should be tracked.}

| Issue | Why Deferred | When to Revisit |
|-------|-------------|-----------------|
| {ISSUE} | {REASON} | {TRIGGER_OR_DATE} |
```

---

## Notes

- This is the comprehensive output of Phase 0 questioning.
- Feeds directly into Phase 1 (STRATEGY) for issue analysis and path mapping.
- Facts in Section 2 must be separated from characterizations. See `references/questioning.md` for fact vs. feeling separation guidance.
- Timeline in Section 5 is critical -- dates determine limitation periods (Iron Law 2).
