# Authorities Template

Template for `.counsel/active/{matter}/AUTHORITIES.md` -- the verified authorities registry.

---

## File Template

```markdown
# Authority Registry: {MATTER_NAME}

Last verified: {YYYY-MM-DD}

## Verification Statuses

| Status | Meaning |
|--------|---------|
| `verified` | Retrieved from authoritative source, confirmed current and good law |
| `cited-unverified` | Referenced but not yet independently verified |
| `negative-treatment` | Distinguished, criticized, or overruled |
| `superseded` | Statute amended or repealed since cited version |
| `not-found` | Could not be located -- CRITICAL: likely hallucinated |

---

## Cases

| Citation | Jurisdiction | Status | Verified | Source | Local File | Proposition | Notes |
|----------|-------------|--------|----------|--------|------------|-------------|-------|
| | | | | | | | |

## Statutes

| Citation | Jurisdiction | Status | Verified | Source | Local File | Relevant Provision | Notes |
|----------|-------------|--------|----------|--------|------------|--------------------|-------|
| | | | | | | | |

## Regulations

| Citation | Jurisdiction | Status | Verified | Source | Local File | Relevant Provision | Notes |
|----------|-------------|--------|----------|--------|--------------------|-------|
| | | | | | | |

## Secondary Sources

| Citation | Type | Source | Relevance | Notes |
|----------|------|--------|-----------|-------|
| | | | | |

---

## Coverage Disclaimer

Verified against Legalcode database as of {DATE}. Coverage limitations: {LIST_GAPS}.
For critical authorities in high-stakes matters, manual verification via Shepard's (Lexis) or KeyCite (Westlaw) is recommended.
```

---

## Registry Rules

1. **Every cited authority gets a row.** No exceptions.
2. **`not-found` status is a critical flag.** Likely hallucinated -- remove from deliverables immediately.
3. **`negative-treatment` does not mean unusable** -- it means the authority must be cited with its treatment noted.
4. **Re-verify before delivery.** Iron Law 4: No deliverable without fresh verification.
5. **Source column tracks provenance.** "Legalcode", "Manual", "Westlaw", "Lexis", etc.

## Lifecycle

**Creation:** During Phase 2 (RESEARCH), as authorities are discovered.

**Reading:** During analysis, drafting, and verification phases.

**Writing:** Every time a new authority is cited or an existing authority's status changes. Updated during verification sweeps.
