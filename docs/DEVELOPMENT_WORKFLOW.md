# Digital2Real Development Workflow

**Status:** Official  
**Applies to:** All architecture, implementation, documentation, and maintenance work

## 1. Roles

### Product Owner

- Defines product goals, priorities, and acceptance criteria.
- Approves scope, product behavior, and user-facing decisions.
- Resolves product questions and accepts completed outcomes.
- Approves destructive actions and intentional functionality removal.

### Chief Architect

- Protects the Constitution and architectural integrity.
- Defines boundaries, ownership, dependency direction, and migration strategy.
- Authors or reviews RFCs and ADRs.
- Identifies architectural risk and technical debt.
- Confirms that architecture remains proportional to real requirements.

### Software Engineer

- Implements approved work within the defined scope.
- Preserves unrelated code and behavior.
- Validates syntax, imports, functionality, and presentation.
- Records implementation results and technical debt.
- Reports blockers and deviations before expanding scope.

One person may hold multiple roles, but each decision must be made under the correct role.

## 2. Development Lifecycle

```text
Idea
  ↓
Architecture
  ↓
Approval
  ↓
Implementation
  ↓
Validation
  ↓
Review
  ↓
Merge
```

### Idea

Define the problem, intended outcome, users, and constraints. Do not begin with a preferred technology.

### Architecture

Identify ownership, SSOTs, boundaries, dependencies, risks, and the smallest coherent delivery packages.

### Approval

Record the approved objective and intended file scope. That approval delegates
reversible technical choices inside the objective and existing architecture.
Escalate new product scope, high-risk work or a required architecture decision
before implementing it. Record any evidence-driven scope adjustment that stays
within the objective.

### Implementation

Apply only the approved package. Keep structural, behavioral, and visual changes separate whenever possible.

### Validation

Run checks proportional to risk. On failure, establish cause, classify it
using the QA Standard, fix defects within scope and repeat relevant validation.
Preserve valid assertions and acceptance criteria. Correct outdated expectations
only with evidence. Record unresolved failures and their impact.

### Review

Review the diff, architecture compliance, behavior preservation, documentation, and acceptance criteria.

### Merge

Merge only through the PR policy below. The main branch must remain runnable.

## 3. Architecture Rules

### When an RFC is required

Create an RFC when work:

- changes repository or product architecture;
- establishes or changes product boundaries;
- creates a shared engine or cross-product contract;
- changes an official SSOT;
- introduces a framework, platform, build system, package manager, or dependency strategy;
- changes dependency direction or deployment topology;
- requires a multi-package migration;
- makes a long-lived decision with broad consequences.

An RFC defines the problem, evidence, alternatives, decision, risks, migration, and unresolved questions. It requires approval before implementation.

### When a User Story is required

Create a User Story when work changes or adds user-visible behavior, content interaction, or an acceptance outcome.

A User Story must state:

- user or stakeholder;
- desired capability or outcome;
- reason and value;
- acceptance criteria;
- relevant constraints.

Refactoring with no user-visible behavior change may use an engineering task instead.

### When an ADR is required

Create an Architecture Decision Record when an implementation makes a significant choice within an approved architecture, especially when:

- multiple credible alternatives exist;
- a tradeoff must be preserved for future maintainers;
- an RFC delegates a local technical decision;
- a decision is difficult or costly to reverse;
- a prior decision is superseded.

An ADR records context, decision, consequences, alternatives, status, and superseded decisions. It does not replace an RFC when the decision changes project-wide architecture.

## 4. Implementation Rules

### Maximum files per package

- A package should modify no more than five file paths.
- Moves count as changed paths.
- Split larger work into independently runnable packages.
- When consistency requires an atomic change across more paths, record why and keep the change within the approved objective.

### Behavior preservation

- Preserve all existing behavior unless approved acceptance criteria require a change.
- Do not redesign the UI during structural or maintenance work.
- Do not remove functionality implicitly.
- Record intentional behavior changes separately from moves and refactors.

### Incremental migration

- Prefer moves over rewrites.
- Move one coherent responsibility at a time.
- Correct all imports and references in the same package.
- Keep the project runnable after every commit.
- Maintain compatibility only when necessary and document its exit condition.

### No speculative development

- Implement only approved current requirements.
- Do not create empty product, service, or abstraction placeholders.
- Do not generalize behavior before reuse is demonstrated.
- Defer unresolved product decisions to the Product Owner.

### No unnecessary dependencies

- Prefer existing platform capabilities and current project tools.
- Add a dependency only for a concrete requirement with documented justification.
- Record ownership, lifecycle, security, and replacement implications.
- Never add a framework or build system as incidental implementation work.

## 5. Validation Rules

### Syntax validation

- Validate every changed source file with an appropriate parser or runtime check.
- Treat warnings and encoding corruption as findings.
- Record the command and result.

### Import validation

- Resolve every changed import after a move.
- Verify relative paths, file-name case, and explicit module extensions.
- Confirm there are no stale imports from removed paths.
- Validate referenced local assets.

### Smoke tests

- Exercise every affected route and primary interaction.
- Verify startup, navigation, fallback, open/close lifecycle, keyboard behavior, and focus where relevant.
- Test the smallest unaffected critical path needed to detect integration regressions.
- Record environment and results.

### Visual regression

- Compare affected views before and after visual changes or structural CSS moves.
- Validate representative desktop and mobile sizes.
- Validate reduced motion and interaction states when affected.
- Treat unexplained visual differences as failures.
- Do not retain generated evidence unless repository policy explicitly requires it.

## 6. Documentation Rules

### When `PROJECT_STATUS.md` is updated

Update Project Status when:

- work starts, completes, becomes blocked, or changes phase;
- an RFC, ADR, or User Story changes state;
- a milestone changes;
- technical debt or a known issue is added or resolved;
- a Product Owner decision changes delivery status.

Keep status entries concise. Do not use Project Status as a design document.

### When `06_Changelog.md` is updated

Update the Changelog when implemented work changes:

- architecture or repository structure;
- behavior or user-visible content;
- visual identity or presentation;
- supported data shape;
- dependencies, tooling, or operational workflow.

Do not record proposals as completed changes.

### When RFCs are created

Create an RFC before broad, long-lived, or cross-cutting architectural work. Give it a stable identifier, status, owner, decision, consequences, and migration plan.

Update an RFC only to clarify its decision or status. Supersede it with a new decision when its architecture materially changes.

### When ADRs are created

Create an ADR at the moment a significant delegated implementation decision is made. Link it to its governing RFC or User Story when applicable.

Never rewrite an accepted ADR to hide its history. Mark it superseded and link the replacement.

### Permanent documentation

- The Constitution changes only through explicit exceptional approval.
- Every important decision must be documented.
- Documentation must distinguish current fact, approved decision, proposal, and historical record.

## 7. Git Workflow

```text
main
  └── feature/<bounded-work>
        ├── implementation packages
        ├── validation
        └── review
              ↓
            merge
              ↓
             main
```

### Feature branches

- Start from a clean, current `main` branch.
- Use one branch per approved body of work.
- Keep commits small, coherent, and runnable.
- Do not mix unrelated changes.

### Commits

- Describe the structural or behavioral decision in the commit message.
- State why the change belongs in that package.
- Avoid committing generated local artifacts.
- Review the staged diff before committing.

### Review

- Verify scope, ownership, SSOT compliance, and acceptance criteria.
- Confirm validation evidence.
- Confirm documentation and status updates.
- Identify remaining technical debt explicitly.

### Merge

Publish the scoped work branch and open or update its PR autonomously when
review is the next delivery gate. Base new work on current main and reconcile
ongoing branches without rewriting published history. Keep PRs with unmet gates
in draft and state the blocker. Use the highest applicable risk level.

| Risk | Examples | Integration |
|---|---|---|
| Low | Visual or accessibility fixes, scoped bugs, noncontractual docs, tests, behavior-preserving refactors, compatible hardening | Eligible for automatic integration through a PR only after mandatory checks pass, scope and regression evidence are reviewed, automated review has no significant unresolved risk, rollback is documented, and branch policy permits it. Missing evidence means review is still required. |
| Medium | Routing, persistence, APIs, modules, integrations and material security changes | Implement and validate within approved scope. Prepare the PR autonomously. Obtain review by the responsible maintainer or architect and satisfy branch rules before merge. |
| High | Production identity, critical permissions or secrets, real payments, destructive migration, DNS or mail, foundational contracts, legal publication, commercial releases | Obtain explicit owner approval before execution. Apply relevant architecture and release gates and record the decision. |

Service contracts, new costs, exposure of personal or private information,
production data deletion, history rewrites, weakening safeguards, commercial
model changes, pedagogy changes and irreversible architecture require specific
authorization. Keep main updates on protected PR paths and never bypass controls.

After closing a package, update Project Status with evidence, risk, dependencies
and next approved action. Continue any unblocked, authorized dependency. Report
completion, corrections, validation, residual risk, decisions, branch and commit
concisely. Use repository evidence for details.

### Main

- `main` represents the accepted, runnable project state.
- Incomplete packages, experiments, and unapproved decisions do not belong on `main`.

## 8. Definition of Done

Every task is **Done** only when:

- [ ] implementation is completed within approved scope;
- [ ] syntax validation has passed;
- [ ] imports and references have been validated;
- [ ] required smoke tests have passed;
- [ ] visual regression has passed when applicable;
- [ ] acceptance criteria have been met;
- [ ] the complete diff has been reviewed;
- [ ] documentation has been updated;
- [ ] `PROJECT_STATUS.md` has been updated;
- [ ] `06_Changelog.md` has been updated when required;
- [ ] technical debt and known issues have been recorded if needed;
- [ ] no unrelated files or generated artifacts are included;
- [ ] approval and merge requirements have been satisfied.

Work that is implemented but unvalidated or undocumented is not Done.
