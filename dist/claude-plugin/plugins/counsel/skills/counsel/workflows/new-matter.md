<purpose>
Initialize a new matter in the COUNSEL framework. Creates the .counsel/ directory structure,
registers the matter, and scaffolds all state files from templates. This is the entry point
before intake begins -- it establishes the container, not the legal analysis.
</purpose>

<process>

## 1. Check Prerequisites

Verify `.counsel/` root exists. If not, create it with the matter registry:

```bash
mkdir -p .counsel/active
```

If `.counsel/matters.json` does not exist, create it:

```json
{
  "matters": [],
  "last_updated": "YYYY-MM-DDTHH:MM:SSZ"
}
```

## 2. Gather Matter Identity

Ask the user three questions, one at a time:

**Question 1: Matter type**

"What type of legal matter is this?"

Options:
- Litigation
- Transactional
- Regulatory
- Advisory
- ADR (Alternative Dispute Resolution)
- Administrative
- Appeals
- IP (Intellectual Property)
- Class Action / Mass Tort
- Investigation Response

**Question 2: Jurisdiction**

"What is the primary jurisdiction?"

Ask for ISO 3166-1 alpha-2 country code (US, GB, FR, DE, IS, EU, etc.) and any sub-jurisdiction
(e.g., US-NY, US-CA, US-Federal). Ask if there are secondary jurisdictions.

**Question 3: Parties**

"Who are the parties involved?"

Collect: party names, roles (plaintiff, defendant, buyer, seller, petitioner, respondent, etc.),
and any known related entities.

## 3. Generate Matter ID

Format: `YYYY-NNNN-shortname`

- YYYY: current year
- NNNN: sequential number (read matters.json, increment highest number for this year)
- shortname: lowercase slug from primary party name or matter description (max 20 chars)

Example: `2026-0001-smith-v-acme`

Confirm the generated ID with the user before proceeding.

## 4. Create Directory Structure

```bash
MATTER_DIR=".counsel/active/{matter-id}"
mkdir -p "$MATTER_DIR"
mkdir -p "$MATTER_DIR/engagement"
mkdir -p "$MATTER_DIR/workstreams"
mkdir -p "$MATTER_DIR/authorities"
mkdir -p "$MATTER_DIR/timeline"
mkdir -p "$MATTER_DIR/documents"
mkdir -p "$MATTER_DIR/deliverables"
mkdir -p "$MATTER_DIR/sessions"
```

## 5. Create State Files

**MATTER.md** -- Static identity document:

```markdown
# Matter: {matter-id}

## Parties
{party list with roles}

## Jurisdiction
- Primary: {jurisdiction}
- Secondary: {secondary jurisdictions or "None"}
- Legal system: {common_law|civil_law|hybrid}

## Matter Type
{selected type}

## Created
{ISO timestamp}
```

**STATE.md** -- Living status (kept under 80 lines):

```markdown
---
counsel_version: 1.0
matter_id: {matter-id}
matter_type: {type}
phase: intake
status: active
last_updated: "{ISO timestamp}"
---

# Matter Status: {matter name}

## Current Phase
**Intake** -- Matter created, awaiting full intake

## Immediate Deadlines
- None registered yet

## Session Continuity
Last session: {today}
Stopped at: Matter initialized
Resume: Run /counsel:intake to begin intake process
```

**DEADLINES.json**:

```json
{
  "matter_id": "{matter-id}",
  "deadlines": [],
  "last_checked": "{ISO timestamp}"
}
```

**AUTHORITIES.md**:

```markdown
# Authorities: {matter-id}

## Cases

| Citation | Jurisdiction | Status | Verified | Source | Proposition | Notes |
|----------|-------------|--------|----------|--------|-------------|-------|

## Statutes

| Citation | Jurisdiction | Status | Verified | Source | Relevant Provision | Notes |
|----------|-------------|--------|----------|--------|--------------------|-------|
```

**config.json**:

```json
{
  "matter_type": "{type}",
  "jurisdiction": {
    "primary": "{jurisdiction}",
    "secondary": [],
    "legal_system": "{system}"
  },
  "mode": "interactive",
  "research_depth": "standard",
  "citation_format": "jurisdiction_default",
  "related_matters": []
}
```

**engagement/CONFLICT.md**, **engagement/SCOPE.md**, **engagement/PRIVILEGE.md**: Create empty
templates with headers only, to be populated during intake.

**documents/index.md**: Create with header "# Document Index" and empty table.

## 6. Register Matter

Add the new matter to `.counsel/matters.json`:

```json
{
  "id": "{matter-id}",
  "name": "{descriptive name}",
  "type": "{matter type}",
  "status": "active",
  "phase": "intake",
  "path": "active/{matter-id}/",
  "created": "{ISO timestamp}"
}
```

## 7. Confirm and Next Step

Display summary:
- Matter ID
- Type
- Jurisdiction
- Parties
- Directory path

Instruct: "Matter initialized. Run `/counsel:intake` to begin the full intake process."

</process>

<references>
- LEGAL_GSD.md: Multi-Matter Directory Structure
- LEGAL_GSD.md: Configuration
- templates/matter.md (when created)
- templates/state.md (when created)
</references>
