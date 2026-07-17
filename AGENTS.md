# Digital2Real — Repository Instructions

## Project role

Digital2Real is an editorial platform about Industrial Automation.

It is not a SaaS dashboard, a commercial landing page, or a generic portfolio.

The project must feel like:
- a technical magazine;
- an industrial laboratory gallery;
- an editorial publication.

Visual priorities:
- generous whitespace;
- large photography;
- typography-led composition;
- graphite black;
- copper as the identity colour;
- minimal interface chrome.

## Official architecture

Frontend/
├── assets/
├── assistant/
├── components/
├── data/
├── styles/
├── app.js
├── index.html
└── styles.css

Backend/
docs/

Do not change this structure without an explicit architectural reason and prior approval.

## Single Source of Truth

- Visual identity: Frontend/styles/brand.css
- Global site information: Frontend/data/site.js
- Laboratories: Frontend/data/labs.js
- Notebook entries: Frontend/data/notebook.js
- Navbar: Frontend/components/navbar.js
- Lab Card: Frontend/components/labCard.js
- Lab Viewer: Frontend/components/labViewer.js
- About: Frontend/components/about.js

Never duplicate information that already belongs to one of these files.

## Development rules

- Use semantic HTML.
- Use modular CSS.
- Use native JavaScript ES Modules.
- Keep components small and focused.
- Separate data from rendering logic.
- Do not hardcode colours outside Frontend/styles/brand.css.
- Do not create unnecessary files.
- Do not modify more than five files in one package unless the change genuinely requires it.
- Every file must have one clear responsibility.
- Preserve scalability for 50+ laboratories.
- Adding a new laboratory should normally require only:
  - adding one object to Frontend/data/labs.js;
  - adding images to Frontend/assets/images/;
  - adding video to Frontend/assets/videos/.

## Mandatory workflow

Before modifying anything:

1. Define the objective.
2. Identify the SSOT.
3. List the exact files that will be modified.
4. List the files that will not be modified.
5. Wait for explicit approval.

After approval:

- Modify only the approved files.
- Provide complete file changes, not partial snippets.
- Verify imports and references.
- Run appropriate checks.
- Summarize the result.
- Do not commit, push, merge, delete branches, or change Git history without explicit approval.

## Change safety

- Do not silently rewrite unrelated files.
- Do not introduce a framework or build system without approval.
- Do not add npm dependencies without approval.
- Do not move data into components.
- Do not create duplicate CSS tokens.
- Do not replace the HTML + CSS navbar logo with SVG.
- The colour of the “2” in Digital2Real must come exclusively from brand.css.
- Do not remove existing functionality unless explicitly requested.
- Prefer maintainability over cleverness.

## Documentation

Document important architectural decisions in docs/.

Update docs/06_Changelog.md when a package changes architecture, behaviour, structure, or visual identity.

## Git workflow

- Work from a clean repository.
- Prefer one branch per package.
- Review git diff before committing.
- Test locally before committing.
- Never commit directly unless explicitly instructed.
