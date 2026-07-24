# Experience Creation Workflow

## Purpose

Define the standard process for creating a Digital2Real industrial learning experience.

Experiences must teach engineering judgement through diagnosis, decisions and troubleshooting.

## 1. Define the industrial case

Specify:

- Industrial system
- Operational context
- Initial symptom
- Technical boundaries
- Available evidence
- Target learner level

The case must represent a credible industrial situation.

## 2. Define learning objectives

Identify the judgement the learner must develop, such as:

- Separating symptoms from root causes
- Selecting useful diagnostic evidence
- Interpreting PLC, drive, HMI or field-device information
- Avoiding unsafe or destructive actions
- Validating a repair before returning equipment to service

## 3. Establish the technical truth model

Document privately:

- Actual root cause
- Failure mechanism
- Relevant signals and states
- Misleading symptoms
- Correct diagnostic path
- Acceptable alternative paths
- Unsafe or invalid actions

The experience must never depend on invented or contradictory technical behavior.

## 4. Design the decision structure

Each decision must have an engineering consequence.

Include:

- Observation points
- Diagnostic actions
- Evidence revealed
- Competing hypotheses
- Decision branches
- Feedback
- Recovery paths where appropriate

Avoid trivia questions and linear memorization.

## 5. Define the experience states

Use explicit states for:

- Initial condition
- Investigation
- Hypothesis formation
- Testing
- Repair
- Validation
- Completion or failure

State transitions must be deterministic and maintainable.

## 6. Produce required assets

Create only assets that improve diagnosis or immersion:

- Machine or process views
- HMI screens
- Alarm histories
- PLC diagnostics
- Electrical diagrams
- Trend data
- Device indicators

Assets must remain consistent with the technical truth model.

## 7. Integrate with Codex

Provide Codex with:

- Exact scope
- Experience specification
- Existing architecture references
- Allowed files
- Prohibited changes
- Acceptance criteria
- Validation requirements

Codex must not redesign the experience or invent technical behavior.

## 8. Validate

Verify:

- Technical correctness
- Decision-path consistency
- No dead ends without intentional feedback
- Evidence supports the root cause
- Wrong actions produce credible consequences
- The learner must reason, not guess
- Existing experiences remain unchanged
- Keyboard, responsive and close/reset behavior work where applicable

## Completion criterion

An experience is complete only when it reliably teaches a reusable diagnostic method, not merely when the interface works.
