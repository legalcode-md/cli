# using-counsel

COUNSEL is a phase-based legal workflow framework for AI-assisted legal work. It integrates
with the Legalcode search API and a domain-specific skills library to move legal matters
from intake through research, analysis, drafting, verification, review, and delivery. The
full framework specification lives at `LEGAL_GSD.md` in the project root. This skill
bootstraps COUNSEL and routes work to the appropriate phase, agent, and skill.

## Commands

| Command | Phase | Description |
|---------|-------|-------------|
| `/counsel:intake` | 0 | New matter intake: conflict check, jurisdiction, privilege, limitations, fact extraction |
| `/counsel:strategize` | 1 | Develop legal strategy: issue analysis, path mapping, risk-reward, workstream planning |
| `/counsel:research` | 2 | Systematic legal research with IRAC methodology and authority verification |
| `/counsel:analyze` | 3 | Apply law to facts using IRAC (objective) or CREAC (persuasive) frameworks |
| `/counsel:draft` | 4 | Produce legal documents from analysis with template-first drafting |
| `/counsel:verify` | 5 | Three-tier verification: authorities, substance, procedure |
| `/counsel:review` | 6 | Peer review across 6 dimensions with counter-argument stress test |
| `/counsel:deliver` | 7 | Pre-delivery checklist and filing preparation (human files) |
| `/counsel:monitor` | 8 | Poll deadlines, authority changes, and regulatory updates |
| `/counsel:close` | 9 | Outcome documentation, knowledge capture, archival |
| `/counsel:resume` | -- | Resume a paused matter (reads STATE.md + HANDOFF.json) |
| `/counsel:pause` | -- | Save work state for later resumption (writes HANDOFF.json) |
| `/counsel:status` | -- | Show all active matters with approaching deadlines |

## Session Continuity Protocol

On every session start:
1. Read `.counsel/matters.json` -- identify active matters.
2. If resuming: read `.counsel/active/{matter}/STATE.md` for current phase and status.
3. Check for `HANDOFF.json` -- if it exists, parse the resume point, present it, then delete it.
4. Check `DEADLINES.json` -- surface deadlines within 7 days.
5. Present status summary and offer contextual next actions.

## Skill Routing Logic

On every phase entry:
1. Identify the current phase, jurisdiction, and matter type from `config.json`.
2. Check `skills/` for skills matching the phase (see Phase-to-Skill table in LEGAL_GSD.md).
3. When both a general skill and a jurisdiction-specific variant exist, prefer the
   jurisdiction-specific one.
4. Check Iron Laws before proceeding. Iron Laws are non-negotiable:
   - Iron Law 1: No legal conclusion without verified citation.
   - Iron Law 2: No filing without deadline check.
   - Iron Law 3: No work without conflict check.
   - Iron Law 4: No deliverable without fresh verification.
   - Iron Law 5: No privilege waiver.
   - Iron Law 6: No jurisdiction assumption.
   - Iron Law 7: Counter-argument required for every favorable conclusion.
5. Delegate legal research to `legalcode-search-agent`. Never call MCP tools directly.

## Core Agents

| Agent | Role | Spawned During |
|-------|------|---------------|
| `counsel-researcher` | Legal research with IRAC-structured memos | Phase 2 (Research) |
| `counsel-analyzer` | IRAC/CREAC analysis with counter-argument requirement | Phase 3 (Analysis) |
| `counsel-drafter` | Template-first document drafting | Phase 4 (Drafting) |
| `counsel-verifier` | Three-tier verification with outcome matrix | Phase 5 (Verification) |
| `counsel-reviewer` | Adversarial peer review across 6 dimensions | Phase 6 (Review) |

Research delegation chain: COUNSEL phase -> skill -> `counsel-researcher` -> `legalcode-search-agent` -> MCP tools.

## Cross-Phase Safety (Always Active)

These checks run regardless of current phase:
- **Privilege guard** -- never include privileged content in non-privileged output.
- **Deadline management** -- surface approaching deadlines at every phase entry.
- **Citation verification** -- flag any unverified authority encountered during any phase.

## Matter State

All state is file-based in `.counsel/active/{matter}/`:
- `STATE.md` -- living status, always read first (under 80 lines)
- `MATTER.md` -- static identity (parties, jurisdiction, type)
- `STRATEGY.md` -- legal strategy with decision points
- `AUTHORITIES.md` -- verified authority registry
- `DEADLINES.json` -- machine-readable deadline tracker
- `config.json` -- framework configuration

## Full Specification

See `LEGAL_GSD.md` in the project root for the complete framework: all ten phases,
matter type routing templates, iron laws, checkpoint system, deviation rules, node
repair strategies, analysis framework templates (IRAC/CREAC), and configuration options.
