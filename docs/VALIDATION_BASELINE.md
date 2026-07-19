# Validation Baseline

**Status:** Active
**Scope:** Current vanilla JavaScript ES Modules frontend and repository references
**Dependencies added:** None

## 1. Purpose

This baseline defines repeatable checks for behavior-preserving repository work. It records what must be verified before and after each migration package.

## 2. Preconditions

- Run commands from the repository root.
- Record the current branch and `git status --short`.
- Protect unrelated working-tree changes.
- Serve `Frontend/` through a local static HTTP server for browser checks.
- Use the same browser viewport and motion preference for before/after comparisons.

## 3. Syntax validation

Run the native Node syntax parser against every frontend JavaScript file:

```powershell
Get-ChildItem Frontend -Recurse -Filter *.js |
  ForEach-Object { node --check $_.FullName }
```

**Pass condition:** every file exits successfully with no syntax error.

This check does not make Node a frontend runtime dependency. It is a development-time parser already available in the audited environment.

## 4. Import validation

Inspect all ES Module imports:

```powershell
rg -n '^import .+ from ' Frontend -g '*.js'
```

For each relative import, verify:

- the target exists;
- path casing matches the filesystem;
- the `.js` extension is present;
- no import references a pre-migration path;
- shared modules do not depend on product modules after those boundaries exist;
- product modules do not import sibling products.

**Pass condition:** every import resolves and follows the dependency rules in RFC-001.

## 5. Asset-reference validation

Inventory source references:

```powershell
rg -n 'assets/' Frontend -g '*.js' -g '*.html' -g '*.css'
```

For every changed reference, verify that the target exists with matching case.

Known baseline exceptions:

- `assets/videos/scada-demo.mp4` is missing.
- `assets/videos/opcua-node-red.mp4` is missing.
- `assets/videos/industrial-ai-assistant.mp4` is missing.

These references belong to disconnected Labs data. They remain known issues and must not be silently replaced or removed.

**Pass condition:** no new missing reference is introduced and all existing exceptions remain explicitly recorded.

## 6. Route smoke tests

Validate the following hashes in a browser:

| Route | Expected result |
|---|---|
| `#engineering-notes` | Engineering Notes view renders |
| `#academy` | Academy view renders |
| `#about` | About view renders |
| unknown hash | Engineering Notes fallback renders |
| malformed encoded hash | Engineering Notes fallback renders |

For each valid route verify:

- navigation active state;
- document title;
- content presence;
- scroll reset on route change;
- browser Back and Forward navigation;
- repeated activation of the current route.

**Pass condition:** observed behavior matches the pre-package baseline.

## 7. Engineering Notes interaction smoke tests

Verify:

- Note order and visible metadata;
- thumbnail loading;
- article opening from each card;
- close button;
- backdrop close;
- Escape close;
- Tab and Shift+Tab focus containment;
- focus return to the opening card;
- body scroll lock and restoration;
- structured introduction, headings, paragraphs, lists, code, quotes, and engineering notes when present.

**Pass condition:** content, keyboard behavior, focus behavior, and lifecycle match the baseline.

## 8. Visual regression baseline

Capture or compare affected views at minimum at:

- 390 × 844;
- 1280 × 900;
- 1440 × 1100.

When CSS or rendering structure changes, compare:

- typography and line wrapping;
- spacing and alignment;
- colors and contrast;
- navigation state;
- responsive layout;
- modal sizing and overflow;
- focus-visible presentation;
- reduced-motion behavior.

**Pass condition:** no unexplained visual difference exists. Documentation-only packages require confirmation that no runtime file changed rather than new screenshots.

## 9. Repository-scope validation

Run:

```powershell
git status --short
git diff --name-status
git diff --check
```

Confirm:

- only approved files changed;
- no generated browser profile or Python cache is included;
- no unrelated source, asset, or configuration changed;
- no file move or rename occurred unless explicitly approved;
- the package remains within its approved file limit.

## 10. Validation record template

```markdown
### Package <identifier>

- Date:
- Environment:
- Syntax: Pass / Fail / Not applicable
- Imports: Pass / Fail / Not applicable
- Assets: Pass / Fail / Known baseline exception
- Smoke tests: Pass / Fail / Not applicable
- Visual regression: Pass / Fail / Not applicable
- Scope review: Pass / Fail
- Remaining issues:
```

Validation failures block review and merge. Known baseline issues do not authorize unrelated fixes.
