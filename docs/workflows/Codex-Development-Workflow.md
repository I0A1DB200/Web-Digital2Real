# Codex Development Workflow

## Purpose

Define how Codex implements changes in Digital2Real without weakening the architecture.

## 1. Define the change package

Every Codex task must contain:

- Objective
- Context
- Source of truth
- Files allowed to change
- Files or areas prohibited from change
- Functional requirements
- Acceptance criteria
- Validation commands
- Required final report

Do not send vague implementation requests.

## 2. Inspect before editing

Codex must first inspect:

- Repository structure
- Relevant data models
- Existing components
- Naming conventions
- Similar implementations
- Project documentation

Existing patterns take precedence over assumptions.

## 3. Keep the scope minimal

Codex must implement only the requested change.

Unless explicitly approved, it must not:

- Refactor unrelated code
- Rename existing files
- Introduce dependencies
- Change architecture
- Duplicate data
- Create parallel sources of truth
- Add speculative features
- Invent content or metadata

## 4. Preserve the source of truth

New information must be added to the established source of truth.

Codex must not create a second representation of the same knowledge merely for convenience.

## 5. Implement incrementally

Prefer:

- Small diffs
- Existing patterns
- Reusable structures
- Deterministic behavior
- Clear naming
- Explicit validation

Avoid premature abstractions.

## 6. Validate

Use the checks appropriate to the change, including:

- Syntax checks
- Automated tests
- Data-shape validation
- Unique identifier checks
- Static analysis
- `git diff --check`
- Merge-marker scan
- Local application execution
- Browser validation
- Regression checks

A task is not complete until validation passes or the remaining limitation is explicitly reported.

## 7. Final report

Codex must report:

- Files modified
- Files created or renamed
- Data fields used
- Assets referenced
- Validation executed
- Validation results
- Existing behavior confirmed unchanged
- Any uncertainty or unresolved issue

The report must distinguish verified facts from assumptions.
