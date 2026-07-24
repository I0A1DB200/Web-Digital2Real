# Architecture Decisions

This directory owns Digital2Real Architecture Decision Records (ADRs). An ADR preserves one significant, durable architectural decision and the context in which it was made.

## When an ADR is required

Create an ADR when:

- multiple credible implementation alternatives exist;
- the choice affects ownership, compatibility, dependencies, or long-term maintenance;
- an RFC or normative standard delegates a bounded decision;
- an accepted decision is superseded.

Do not use an ADR to bypass an RFC, Product Owner approval, or a required version change. Do not create ADRs retrospectively when an existing RFC already owns the historical decision.

## Statuses

- `proposed`
- `accepted`
- `rejected`
- `deprecated`
- `superseded`

Accepted ADR content MUST NOT be rewritten to hide history. A replacement ADR MUST link both directions and mark the previous record `superseded`.

## Naming

Use:

```text
ADR-NNNN-short-kebab-case-title.md
```

Numbers MUST be unique and assigned sequentially. File names and document IDs MUST agree.

## Required links

Every ADR MUST link to:

- its governing RFC, blueprint, architecture document, or standard;
- every normative document directly affected;
- superseded and replacement ADRs where applicable.

Use the canonical [`ADR template`](../../templates/architecture-decision-record-template.md) and follow [D2R-008](../D2R-008-architecture-governance.md).

No ADRs have been created by the documentation baseline. Existing RFCs remain in their historical locations.
