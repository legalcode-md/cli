<purpose>
Poll-based monitoring workflow. Surfaces approaching deadlines, checks for authority treatment
changes, and monitors regulatory developments. COUNSEL monitoring is not continuously running --
the user invokes this periodically or schedules it via the schedule skill (CronCreate).
</purpose>

<process>

## 1. Load Matter Context

Read from `.counsel/active/{matter-id}/`:
- STATE.md -- current status and phase
- DEADLINES.json -- all registered deadlines
- AUTHORITIES.md -- cited authorities to monitor
- config.json -- jurisdiction, matter type

If `--matter` argument is provided, load that specific matter.
If no argument, check matters.json for active matters and ask which to monitor (or monitor all).

## 2. Deadline Monitoring

Parse DEADLINES.json and calculate status for each deadline:

```markdown
## Deadline Status

| # | Deadline | Date | Days Remaining | Urgency | Action Needed |
|---|----------|------|---------------|---------|---------------|
```

**Urgency classification:**
- OVERDUE (< 0 days): CRITICAL -- immediate escalation required
- CRITICAL (< 7 days): Requires immediate attention
- URGENT (< 30 days): Active preparation needed
- WATCH (< 90 days): Begin preparation
- STANDARD (> 90 days): Monitor

**For OVERDUE deadlines:**
- Flag immediately as highest priority
- Check for extension/tolling possibilities
- This is a potential malpractice issue -- escalate to human

**For CRITICAL deadlines:**
- Surface at top of report
- Verify all prerequisites are on track
- Calculate remaining work vs. time available

## 3. Authority Monitoring

For each authority in AUTHORITIES.md with status `verified`:

Delegate to `legalcode-search-agent`:
- Re-search each cited case to check for recent treatment
- Look for: new decisions citing the case, overruling, distinguishing
- Check statutes for amendments or proposed amendments
- Check regulations for changes

**Treatment change categories:**
- `unchanged` -- no new treatment found
- `positive-treatment` -- cited favorably by new authority
- `negative-treatment` -- distinguished, criticized, or questioned
- `overruled` -- explicitly overruled (CRITICAL)
- `superseded` -- statute amended or repealed (CRITICAL)
- `legislative-change` -- new legislation affects this area

Report any changes:

```markdown
## Authority Treatment Changes

| Authority | Previous Status | Current Status | Change Details |
|-----------|----------------|----------------|----------------|
```

If any authority is overruled or superseded, flag as CRITICAL and identify which
deliverables cite that authority.

## 4. Regulatory Monitoring

For matters with regulatory exposure (regulatory, compliance, administrative types):

Search via `legalcode-search-agent` for:
- New legislation in the relevant jurisdiction affecting this matter's legal area
- Proposed rules or regulations
- Agency guidance updates
- Enforcement actions in the same area

```markdown
## Regulatory Developments

| Development | Source | Date | Relevance | Action |
|-------------|--------|------|-----------|--------|
```

## 5. Obligation Monitoring

For transactional matters with ongoing obligations:

Check DEADLINES.json for entries with type `obligation` or `milestone`:
- Contractual performance deadlines
- Reporting requirements
- Payment schedules
- Compliance milestones

```markdown
## Obligation Status

| Obligation | Due Date | Status | Notes |
|------------|----------|--------|-------|
```

## 6. Generate Status Report

Compile all findings into a monitor report:

```markdown
# Monitor Report: {matter name}

## Date
{ISO date}

## Summary
- Active deadlines: {count}
- Critical/overdue: {count}
- Authority changes detected: {count}
- Regulatory developments: {count}
- Action items: {count}

## Deadline Status
{from step 2}

## Authority Treatment Changes
{from step 3}

## Regulatory Developments
{from step 4}

## Obligation Status
{from step 5}

## Action Items
{prioritized list of items requiring attention}

## Next Recommended Check
{suggest when to run monitor again based on nearest deadline}
```

Save to `.counsel/active/{matter-id}/sessions/YYYYMMDD-monitor.md`.

## 7. Update State Files

Update DEADLINES.json:
- Add status annotations to each deadline
- Record last-checked timestamp

Update AUTHORITIES.md:
- Update verification dates
- Change status for any authorities with treatment changes

Update STATE.md:
- Record monitor run date
- Surface any critical findings in the immediate deadlines section

## 8. Scheduled Monitoring Setup

If the user wants recurring monitoring, suggest:

```
/schedule create --name "{matter-name} Monitor" --cron "0 9 * * 1" --prompt "/counsel:monitor --matter {matter-id}"
```

Recommended frequencies:
- Active litigation: weekly (Mon morning)
- Transactional (pre-closing): twice weekly
- Regulatory: monthly
- Post-closing obligations: per obligation schedule

</process>

<outputs>
- Monitor report in .counsel/active/{matter}/sessions/YYYYMMDD-monitor.md
- Updated .counsel/active/{matter}/DEADLINES.json
- Updated .counsel/active/{matter}/AUTHORITIES.md
- Updated .counsel/active/{matter}/STATE.md
</outputs>

<references>
- LEGAL_GSD.md: Phase 8 MONITOR
- LEGAL_GSD.md: Monitoring Workstreams
- LEGAL_GSD.md: Scheduled Monitoring
- LEGAL_GSD.md: Iron Law 2 (No Filing Without Deadline Check)
</references>
