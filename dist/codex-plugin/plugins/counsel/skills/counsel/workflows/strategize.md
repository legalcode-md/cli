<purpose>
Strategy development for a legal matter. Develops the legal strategy before any substantive
work begins. Produces explicit decision trees for legal paths with risk-reward analysis,
workstream planning, and milestone definitions. Output is the living STRATEGY.md document.
</purpose>

<process>

## 1. Load Matter Context

Read these files from `.counsel/active/{matter-id}/`:
- STATE.md -- current status
- MATTER.md -- parties, jurisdiction, type
- MATTER-CONTEXT.md -- facts, issues, timeline
- DEADLINES.json -- deadline constraints
- config.json -- matter configuration

Verify phase is `strategy` (or that intake is complete).

## 2. Proportionality Assessment

Before setting research depth and analysis scope, evaluate:

**Stakes:**
- Amount in controversy (quantify if possible)
- Non-monetary consequences (reputation, liberty, precedent, regulatory standing)
- Precedential value (novel issue? multi-party impact?)

**Complexity:**
- Number of distinct legal issues
- Number of jurisdictions involved
- Number of parties
- Interaction between issues (independent vs. dependent)

**Resources:**
- Budget constraints from engagement/SCOPE.md
- Timeline constraints from DEADLINES.json
- Available expertise

Map to research depth: quick (1) | standard (2) | deep (3)
Map to analysis scope: focused | standard | comprehensive

Document proportionality assessment at top of STRATEGY.md.

## 3. Issue Analysis

For each legal issue identified during intake, apply preliminary IRAC:
- State the precise legal question
- Identify the likely governing rule (citation not required yet -- this is strategy, not research)
- Assess strength of position: Strong | Moderate | Weak | Unknown
- Flag threshold issues (standing, jurisdiction, ripeness) -- these must be resolved first

Classify issues:
- Threshold (must win to proceed)
- Core (central to the matter outcome)
- Secondary (affects remedy/scope but not liability)
- Defensive (counter-claims, affirmative defenses)

## 4. Authority Survey

Delegate a quick-check research sweep to `legalcode-search-agent`:
- For each core issue, search for governing authority in the identified jurisdiction
- Purpose: assess strength of position, not comprehensive research
- Depth: Level 1 (Quick Check) per the research depths table

This informs path mapping -- do not produce full research memos here.

## 5. Path Mapping

Identify ALL possible legal paths. For each path document:

| Path | Description | Probability | Timeline | Cost | Risk |
|------|-------------|-------------|----------|------|------|
| {path} | {description} | {%} | {est.} | {est.} | {H/M/L} |

Common paths to consider by matter type:
- Litigation: settle early, litigate to summary judgment, litigate to trial, mediate, arbitrate
- Transactional: proceed, renegotiate terms, walk away, restructure deal
- Regulatory: comply, contest, negotiate consent order, seek exemption
- Advisory: narrow scope, broad scope, phased approach

## 6. Risk-Reward Analysis

For each viable path, calculate expected value:

```
EV = (P(success) x Expected Recovery) - (P(failure) x Downside) - Costs
```

Present as a decision matrix:

| Path | P(Success) | Upside | P(Failure) | Downside | Est. Cost | Expected Value |
|------|------------|--------|------------|----------|-----------|----------------|

Include non-monetary factors that cannot be reduced to EV:
- Precedential risk
- Relationship preservation
- Regulatory standing
- Publicity/reputation

**checkpoint:strategy-decision** -- Present the analysis and paths to the attorney/client
for strategy selection. Do not select a path unilaterally.

## 7. Strategy Selection

After human selects the strategy path:
- Document the selected strategy with rationale
- Document rejected alternatives and why
- Identify decision points where strategy may pivot
- Define conditions that would trigger strategy reassessment

## 8. Workstream Planning

Break the selected strategy into parallel workstreams:

```
workstream/
  01-research/     -- Legal research tasks
  02-analysis/     -- IRAC/CREAC analysis
  03-drafting/     -- Document preparation
  04-discovery/    -- (if litigation)
  05-negotiation/  -- (if applicable)
  ...
```

For each workstream:
- Define scope and deliverables
- Identify dependencies on other workstreams
- Assign research depth per proportionality assessment
- Note which skills from skills/ library apply

Create workstream directories under `.counsel/active/{matter-id}/workstreams/`.

## 9. Milestone Definition

Define key milestones with:

| # | Milestone | Deliverable | Deadline | Dependencies | Status |
|---|-----------|-------------|----------|--------------|--------|
| 1 | {name} | {output} | {date} | {deps} | pending |

Register all milestone deadlines in DEADLINES.json with type `milestone`.

## 10. Write STRATEGY.md

Assemble the living strategy document:

```markdown
# Strategy: {matter name}

## Proportionality Assessment
{from step 2}

## Issue Analysis
{from step 3}

## Selected Strategy
{from step 7}

## Rejected Alternatives
{from step 7}

## Decision Points
{conditions for strategy reassessment}

## Workstreams
{from step 8}

## Milestones
{from step 9}

## Risk Register
{ongoing risks to monitor}
```

## 11. Update State

Update STATE.md:
- Phase: ready for research/analysis (or next applicable phase per matter type routing)
- Record strategy selection
- Update session continuity

Commit STRATEGY.md and all workstream scaffolding.

</process>

<outputs>
- .counsel/active/{matter}/STRATEGY.md -- Living strategy document
- .counsel/active/{matter}/workstreams/ -- Workstream directories created
- .counsel/active/{matter}/DEADLINES.json -- Updated with milestones
- .counsel/active/{matter}/STATE.md -- Updated phase
</outputs>

<references>
- LEGAL_GSD.md: Phase 1 STRATEGY
- LEGAL_GSD.md: Matter Type Routing
- LEGAL_GSD.md: Proportionality (Design Principle 11)
- LEGAL_GSD.md: Checkpoint System (strategy:fork, strategy:risk)
</references>
