# Strategy Template

Template for `.counsel/active/{matter}/STRATEGY.md` -- the matter's legal strategy document.

---

## File Template

```markdown
# Legal Strategy: {MATTER_NAME}

## Issue Analysis

### Issue 1: {ISSUE_NAME} [threshold|merits|alternative|remedies]

**Legal Question:** Whether {legal question} when {key facts}.

**Preliminary Assessment:** {favorable|unfavorable|uncertain}

**Key Authorities:** {Brief citation list -- full details in AUTHORITIES.md}

**Burden:** {Who bears the burden; what standard}

---

## Path Mapping

### Path A: {PATH_NAME} (Recommended)

- **Description:** {What this path involves}
- **Probability of Success:** {X%}
- **Expected Timeline:** {Duration}
- **Estimated Cost:** {Range}
- **Key Risks:** {Top 2-3 risks}

### Path B: {ALTERNATIVE_PATH_NAME}

- **Description:** {What this path involves}
- **Probability of Success:** {X%}
- **Expected Timeline:** {Duration}
- **Estimated Cost:** {Range}
- **Key Risks:** {Top 2-3 risks}

---

## Risk-Reward Analysis

| Path | P(Success) | Expected Recovery | Costs | Expected Value | Key Risk |
|------|-----------|-------------------|-------|---------------|----------|
| A | {X%} | {$AMOUNT} | {$AMOUNT} | {$AMOUNT} | {RISK} |
| B | {X%} | {$AMOUNT} | {$AMOUNT} | {$AMOUNT} | {RISK} |

---

## Selected Strategy

**Path:** {SELECTED_PATH}

**Rationale:** {Why this path was selected}

**Decision Point:** checkpoint:strategy-decision -- {Date or trigger for re-evaluation}

---

## Workstreams

| # | Workstream | Status | Owner | Dependencies |
|---|-----------|--------|-------|-------------|
| 1 | {WORKSTREAM_NAME} | {not_started|in_progress|complete} | {AI|human|both} | {DEPENDENCIES} |
| 2 | {WORKSTREAM_NAME} | {not_started|in_progress|complete} | {AI|human|both} | {DEPENDENCIES} |

---

## Milestones

| Date | Milestone | Deliverable | Status |
|------|-----------|------------|--------|
| {YYYY-MM-DD} | {MILESTONE} | {DELIVERABLE} | {pending|complete} |
| {YYYY-MM-DD} | {MILESTONE} | {DELIVERABLE} | {pending|complete} |

---

## Proportionality Assessment

- **Stakes:** {Amount in controversy, non-monetary consequences, precedential value}
- **Complexity:** {Number of issues, jurisdictions, parties}
- **Resources:** {Budget, timeline, available expertise}
- **Research Depth:** {quick|standard|deep} -- based on above factors
```

---

## Lifecycle

**Creation:** During Phase 1 (STRATEGY), after issue analysis and path mapping.

**Reading:** Before any strategic decision. When planning workstreams. When evaluating whether to change course.

**Writing:** When strategy changes, new paths are identified, milestones are reached, or risk assessments are updated. Strategy changes trigger `checkpoint:strategy-decision`.
