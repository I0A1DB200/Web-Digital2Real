# Shared baseline, title presentation and language entry point

Date: 2026-10-13. Branch: `Dvelop2`. Initial worktree: clean.
Classification: ARCHITECTURE; authorized shared Workspace behavior and test debt.
Status: IMPLEMENTED / AUTOMATED PASS WITH CLASSIFIED EXCLUSION / BROWSER QA PENDING.

## Scope and ownership

Canonical Experience/ENV YAML, internal identities, coordinates, access, progress
storage, engineering semantics and image binaries are unchanged. No dependencies,
frameworks, schema migrations, Player/evaluator modifications, commits or pushes.
Notebook content remains unchanged; its README and authoring policy were updated.

The Workspace now retries catalog loading after a failed/invalid catalog rather
than dereferencing null. Replacing a navigator disposes its old listeners. The
EE-0010 audit includes `DEC-07-INSPECT-B3` before `DEC-07-SAFE-REMOVE-VERIFY`.
The packaging fixture replaces recovery evidence media within its bounded block
instead of injecting a duplicate mapping key; validation and original behavior
checks remain intact.

## Localization findings and implementation

Before this package, document `lang` selected Experience artifacts/catalog metadata,
ENV presentation and Theory. Shared UI copy lived in renderer functions. There was
no language preference persistence or visible entry point. Experience translations
are ID-keyed authored locale documents, projected into per-locale artifacts.
Theory uses canonical ES plus an EN document. Notebook packages one JS content
module and has no equivalent locale contract.

The ES/EN selector uses the same package contracts. UI copy and preference helpers
are now in `experienceLocale.js`. Preference is independent of progress and scoped
to the Workspace; the global site/Notebook language is not falsely relabeled.
Current session commands are replayed into a detached localized Player, checked
for state equivalence and swapped only on success. Completion is not re-registered.
Failed locale loads preserve the previous session and preference. ENV, hotspot
and Theory section navigation survives switching. Completed progress persists;
active sessions remain memory-only as before.

IT activation requirements and deterministic fallback are recorded in
[Experience Engine section 17](01-architecture/D2R-EXPERIENCE-ENGINE.md#17-language-entry-point).
No incomplete IT files or historical translations were added.

## Visual audit and legacy asset identifier debt

Inspected the ENV-001 background and the 13 generated Experience cover images.
The ENV-001 background has no embedded EE numbering. Existing HTML Experience
headers already use the title; the hotspot popover's separate visible EE badge
was removed. Its internal DOM association, canonical editorial ID and coordinates
remain unchanged. No renderer cropping, masking or asset substitutions were used.

`LEGACY ASSET IDENTIFIER DEBT`: all eleven cover images for EE-0001 through
EE-0011 visibly embed their EE identifier. EE-0012 and EE-0013 covers do not.
These are rasterized labels over industrial scenes, not removable HTML layers.
Reconstructing/cropping that background is not a trivial presentation-only repair;
no image remediation campaign was performed. The audit does not claim all other
stage/evidence imagery is free of embedded identifiers.

EE-0001 binary authority remains unresolved. Existing `assets/` and `media/`
copies differ for ART-001, ART-005, ART-006, ART-007 and ART-008. Neither copy nor
the byte-identity test was changed. Choosing authority remains separate work.

## Automated validation

- Phase A checkpoint: 41 tests passed, zero failures (Workspace, correct-option
  audit and packaging tests), before presentation/language implementation.
- Final shared suite: 441 tests passed, zero failures among selected tests.
- Final focused Workspace suite: 33 passed, including failed/malformed catalog
  recovery; ES/EN switching across retry, pending Result and completion; single
  progress registration; failed locale download; ENV/hotspot/Theory continuity;
  persisted preference; IT fallback; V1 selection and blocked local storage.
- Generated inspection and automatic flow: 13 Experiences x ES/EN = 26 complete
  runs, 168 correct decisions, with wrong options/retries checked at each stage;
  matching locale identities, stage/decision ordering and media maps. Titles do
  not have EE prefixes. This is headless validation, not Browser QA.
- Preview packaging: 13 Experiences, ENV-001/002/003, with both locale artifacts.
  Notebook packaging passed. Outputs are ignored under `Frontend/generated/`.
  Shared packaging tests also exercised publish/preview boundaries in temporary
  repositories; no deployment occurred.
- Source Library: 65 records, seven protocol authority organizations, valid.
- JavaScript syntax: 55 Frontend JS files passed, including generated modules.
- `git diff --check`: passed. Production Experience/ENV content, knowledge sources
  and binaries: no diff.

Reproducible shared-suite command:

```powershell
node --test --test-skip-pattern='eight byte-identical approved assets' --test-reporter=spec
```

The known EE-0001 binary comparison is explicitly filtered by this invocation.
Node reports zero skipped because the pattern filters that test before reporting;
the 441 count must not be presented as an unfiltered all-green suite. The original
hash/byte expectation remains intact. In the prior baseline run, formatting the
unequal large binary comparison did not finish and the child process was stopped.
Do not rerun it as a proof of product failure or weaken it to obtain green status.

## Failure classification

- A: no remaining introduced target regression detected.
- B: duplicate-media fixture debt repaired; EE-0001 binary/test debt remains,
  pending authority determination, and is excluded as stated above.
- C: no shared Engine regression detected by selected automated checks.
- D: preview regenerated from canonical source; no manual generated edits.
- E: stale EE-0010 sequence expectation repaired; full action-token path retained.
- F: real browser validation blocked by missing infrastructure.

## Browser gate

`BROWSER QA / PLAYWRIGHT MCP — STATUS: INFRASTRUCTURE BLOCKED`.
Computer/browser inventory returned no connected browser; Chrome tab creation was
unavailable. One Playwright MCP navigation attempt failed because its configured
Firefox executable was absent at
`C:\Users\asanc\AppData\Local\ms-playwright\firefox-1553\firefox\firefox.exe`.
No repeated retries or browser installation was performed.

Desktop, mobile, real keyboard flow, console and network QA remain pending.
Component checks cover native buttons, pressed state, locale semantics, title-only
hotspots and state preservation; CSS provides wrapping controls, 44px targets and
focus styling using existing brand tokens. These checks do not replace visual QA.

## Review handoff

Restore browser infrastructure, then validate Lab -> ENV -> hotspot -> Experience,
ES/EN, progress, catalog recovery, desktop/mobile, keyboard and console/network.
Review the legacy cover debt and EE-0001 authority as separately bounded tasks.
No final publication or unconditional validation-complete claim is made.
