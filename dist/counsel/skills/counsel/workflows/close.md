<purpose>
Matter closure workflow. Documents outcomes, captures lessons learned, updates the authority
registry with tribunal feedback, sets file retention schedules, and archives the matter
directory. Knowledge captured here improves future matter handling.
</purpose>

<process>

## 1. Load Matter Context

Read from `.counsel/active/{matter-id}/`:
- STATE.md -- current status
- MATTER.md -- matter identity
- STRATEGY.md -- original strategy and decision points
- AUTHORITIES.md -- all cited authorities
- DEADLINES.json -- all deadlines (verify none outstanding)
- config.json -- matter type, jurisdiction
- deliverables/ -- all final work product
- timeline/ -- chronological record

## 2. Verify Closure Prerequisites

Before closing, confirm:
- [ ] No outstanding deadlines in DEADLINES.json (all met, waived, or expired)
- [ ] No pending checkpoint:human-action items
- [ ] No open workstreams with incomplete tasks
- [ ] Client has been notified of closure (or this IS the closure communication)

If any prerequisite fails, list the blockers. Cannot close with outstanding obligations.

## 3. Outcome Documentation

Document what happened:

```markdown
## Outcome

### Result
{Win / Loss / Settlement / Deal Closed / Deal Terminated / Advisory Delivered /
 Regulatory Compliance Achieved / Withdrawn / Dismissed / Other}

### Summary
{2-3 paragraph narrative of the matter outcome}

### Key Dates
- Matter opened: {date}
- Matter resolved: {date}
- Duration: {days/months}

### Financial Summary
- Amount in controversy: {amount}
- Outcome value: {recovery/savings/cost}
- Legal costs: {if tracked}
```

## 4. Lessons Learned

Structured reflection on the matter:

```markdown
## Lessons Learned

### What Worked
- {strategy/approach that was effective}
- {research finding that proved decisive}
- {document/argument that was particularly effective}

### What Could Be Improved
- {areas where approach could be refined}
- {research gaps that caused problems}
- {timing/process issues}

### Surprises
- {unexpected developments and how they were handled}
- {arguments that were stronger/weaker than anticipated}

### Recommendations for Similar Matters
- {specific tactical recommendations}
- {key authorities to start with}
- {procedural considerations}
```

## 5. Knowledge Capture

Index reusable work product for future matters:

```markdown
## Knowledge Capture

### Precedent Documents
| Document | Type | Jurisdiction | Reuse Value | Path |
|----------|------|-------------|-------------|------|
{documents that could serve as templates for future matters}

### Key Research Findings
| Issue | Finding | Authority | Confidence |
|-------|---------|-----------|------------|
{research conclusions that may be useful in future matters}

### Effective Arguments
| Argument | Context | Tribunal Response | Notes |
|----------|---------|-------------------|-------|
{arguments that were or were not effective, with tribunal feedback}
```

## 6. Authority Registry Update

Update AUTHORITIES.md with outcome-based information:

For each authority that was cited to a tribunal:
- Was it accepted or rejected by the tribunal?
- Did the tribunal find it persuasive?
- Was it distinguished from the matter's facts?

Add a `tribunal_treatment` column or notes:

```markdown
| Citation | ... | Tribunal Treatment |
|----------|-----|--------------------|
| Smith v. Jones | ... | Cited favorably in ruling; court found directly applicable |
| Doe v. Roe | ... | Court distinguished on facts; less persuasive than anticipated |
```

This builds institutional knowledge about which authorities are effective.

## 7. File Retention Schedule

Apply retention schedule based on jurisdiction and matter type:

| Matter Type | Minimum Retention | Source |
|-------------|-------------------|--------|
| Litigation | 7-10 years post-final resolution | Varies by jurisdiction |
| Transactional | Life of agreement + 6 years | Standard practice |
| Regulatory | Duration of regulation + 5 years | Varies |
| Advisory | 7 years | Standard practice |
| IP | Life of IP right + 6 years | Standard practice |

```markdown
## Retention Schedule

Retention period: {period}
Retention basis: {jurisdiction rule or practice standard}
Earliest destruction date: {date}
Review date: {date to reassess retention}
```

## 8. Statistics

Record metrics for future matter estimation:

```json
{
  "matter_id": "{id}",
  "type": "{type}",
  "jurisdiction": "{jurisdiction}",
  "duration_days": 0,
  "phases_used": ["intake", "strategy", "research", "..."],
  "research_memos": 0,
  "deliverables": 0,
  "authorities_cited": 0,
  "deadlines_tracked": 0,
  "outcome": "{result}"
}
```

## 9. Write CLOSE.md

```markdown
# Closure Report: {matter name}

## Matter ID
{id}

## Outcome
{from step 3}

## Lessons Learned
{from step 4}

## Knowledge Capture
{from step 5}

## Authority Updates
{from step 6}

## Retention Schedule
{from step 7}

## Statistics
{from step 8}

## Closed By
{attorney name / COUNSEL session}

## Close Date
{ISO date}
```

## 10. Archive Matter

Move the matter directory from active to archive:

```bash
mv .counsel/active/{matter-id} .counsel/archive/{matter-id}
```

Update matters.json:
- Set status to `closed`
- Update path to `archive/{matter-id}/`
- Add close_date

Update STATE.md final entry:
- Phase: closed
- Status: archived

Commit all closure artifacts.

</process>

<outputs>
- .counsel/active/{matter}/CLOSE.md (before archival)
- .counsel/archive/{matter}/ (matter directory moved)
- Updated .counsel/matters.json
- Updated .counsel/archive/{matter}/AUTHORITIES.md
</outputs>

<references>
- LEGAL_GSD.md: Phase 9 CLOSE
- LEGAL_GSD.md: Session Continuity Protocol
</references>
