# Digital2Real — File Architecture

**Version:** 1.0  
**Status:** Active  
**Project:** Digital2Real V2  
**Purpose:** Define the official file structure, responsibilities and modification rules for the project.

---

## 1. Purpose

This document defines how the Digital2Real project is organised.

Its goal is to make future development predictable, maintainable and scalable.

Before modifying, creating or deleting files, this document should be used as the reference map.

---

## 2. Current Project Structure

```txt
WEB-DIGITAL2REALV2/
│
├── Backend/
│
├── docs/
│   ├── 00_ProjectVision.md
│   ├── 01_ProductBlueprint.md
│   ├── 02_DesignLanguage.md
│   ├── 03_FrontendArchitecture.md
│   ├── 04_DataModel.md
│   ├── 05_Roadmap.md
│   ├── 06_Changelog.md
│   ├── 07_FileArchitecture.md
│   └── 08_BrandBook.md
│
└── Frontend/
    ├── assets/
    │   ├── brand/
    │   │   ├── favicon.svg
    │   │   ├── logo-mark.svg
    │   │   └── logo.svg
    │   ├── fonts/
    │   ├── icons/
    │   ├── images/
    │   └── videos/
    │
    ├── assistant/
    │
    ├── components/
    │   ├── about.js
    │   ├── labCard.js
    │   ├── labViewer.js
    │   ├── navbar.js
    │   └── notebookCard.js
    │
    ├── data/
    │   ├── labs.js
    │   ├── notebook.js
    │   └── site.js
    │
    ├── styles/
    │   ├── about.css
    │   ├── base.css
    │   ├── brand.css
    │   ├── cards.css
    │   ├── exhibition.css
    │   ├── labs.css
    │   ├── layout.css
    │   ├── navbar.css
    │   ├── notebook.css
    │   ├── responsive.css
    │   ├── variables.css
    │   └── viewer.css
    │
    ├── app.js
    ├── index.html
    └── styles.css
```

---

## 3. Folder Responsibilities

### `docs/`

Project documentation.

It defines the vision, product logic, design language, architecture, data model, roadmap, changelog, file architecture and brand book.

---

### `Frontend/assets/`

Static resources.

Contains brand assets, fonts, icons, images and videos.

---

### `Frontend/components/`

JavaScript UI components.

Each file has one responsibility.

---

### `Frontend/data/`

Source of truth for site content.

Labs and Notebook entries must live here.

---

### `Frontend/styles/`

CSS system.

Each file controls a specific area of the interface.

---

## 4. Main File Responsibilities

### `Frontend/index.html`

Minimal HTML shell.

Allowed:

- Metadata
- Favicon reference
- Stylesheet reference
- `<div id="app"></div>`
- JavaScript module reference

Not allowed:

- Manual Lab cards
- Notebook content
- About content
- Inline styles
- Inline scripts

---

### `Frontend/app.js`

Main application controller.

Responsibilities:

- Render views
- Load data
- Create navigation
- Open/close Lab Viewer
- Initialise reveal animations

---

### `Frontend/data/site.js`

Global site metadata:

- Name
- Subtitle
- Description
- Author
- Version
- Navigation labels
- External links

---

### `Frontend/data/labs.js`

Source of truth for laboratories.

To add a new Lab, add a new object here.

---

### `Frontend/data/notebook.js`

Source of truth for Notebook entries.

---

### `Frontend/components/navbar.js`

Creates the main navigation.

Visual CSS:

`Frontend/styles/navbar.css`

---

### `Frontend/components/labCard.js`

Creates one Lab item for the Home/Labs view.

Visual CSS:

`Frontend/styles/exhibition.css`

---

### `Frontend/components/labViewer.js`

Creates the Lab Viewer overlay.

Visual CSS:

`Frontend/styles/viewer.css`

---

### `Frontend/components/notebookCard.js`

Creates one Notebook item.

Visual CSS:

`Frontend/styles/notebook.css`

---

### `Frontend/components/about.js`

Creates the About view.

Visual CSS:

`Frontend/styles/about.css`

---

## 5. CSS Architecture

### `Frontend/styles.css`

CSS entry point.

It imports all CSS modules.

---

### `Frontend/styles/brand.css`

Brand identity tokens.

This is the only place where the official colour of the `2` should be changed.

Example:

```css
--brand-primary: #6C8AA6;
```

---

### `Frontend/styles/variables.css`

Bridge between brand tokens and application variables.

It must import:

```css
@import url("./brand.css");
```

---

### `Frontend/styles/navbar.css`

Navbar and logo styling.

The `2` must use:

```css
.brand__accent {
  color: var(--brand-primary);
}
```

Never hardcode the colour here.

---

### `Frontend/styles/exhibition.css`

Main Home/Labs editorial composition.

This file defines the visual rhythm of the laboratory magazine.

---

### `Frontend/styles/viewer.css`

Lab Viewer visual system.

---

### `Frontend/styles/notebook.css`

Notebook visual system.

---

### `Frontend/styles/about.css`

About view visual system.

---

### `Frontend/styles/responsive.css`

Responsive behaviour.

---

## 6. Assets Architecture

### `Frontend/assets/brand/`

Brand identity assets.

Current files:

- `favicon.svg`
- `logo-mark.svg`
- `logo.svg`

Decision:

The navbar logo is HTML + CSS.

The SVG files are brand resources, not the live navbar logo.

---

### `Frontend/assets/images/`

Lab covers, SCADA images, HMI images and other visual content.

---

### `Frontend/assets/videos/`

Laboratory videos.

---

### `Frontend/assets/icons/`

Interface icons.

Use sparingly.

---

### `Frontend/assets/fonts/`

Local fonts if required.

Do not add commercial fonts unless the licence allows it.

---

## 7. Modification Rules

### Rule 1

Do not modify files without a clear purpose.

---

### Rule 2

Do not modify more than five files in one change package unless strictly necessary.

---

### Rule 3

Labs and Notebook entries must live in `data/`.

---

### Rule 4

Brand identity lives in `brand.css`.

---

### Rule 5

Components generate visible UI.

HTML stays minimal.

---

### Rule 6

CSS modules must respect their boundaries.

---

### Rule 7

The interface must not compete with the laboratories.

Digital2Real is a laboratory magazine, not a dashboard.

---

## 8. Common Tasks

### Change the colour of the `2`

Modify:

```txt
Frontend/styles/brand.css
```

Variable:

```css
--brand-primary
```

---

### Add a new Lab

Modify:

```txt
Frontend/data/labs.js
```

Add images to:

```txt
Frontend/assets/images/
```

Add videos to:

```txt
Frontend/assets/videos/
```

---

### Add a new Notebook entry

Modify:

```txt
Frontend/data/notebook.js
```

---

### Change Home visual composition

Modify:

```txt
Frontend/styles/exhibition.css
```

---

### Change Lab Viewer

Modify:

```txt
Frontend/components/labViewer.js
Frontend/styles/viewer.css
```

---

### Change Navbar

Modify:

```txt
Frontend/components/navbar.js
Frontend/styles/navbar.css
```

---

### Change brand identity

Modify:

```txt
Frontend/styles/brand.css
docs/08_BrandBook.md
```

---

## 9. Development Workflow

Before modifying the project:

1. Define the goal.
2. List affected files.
3. List files that will not be touched.
4. Explain the reason.
5. Wait for approval.
6. Generate the change package.
7. Test visually.
8. Update changelog if needed.

---

Digital2Real  
Industrial Automation Laboratory Magazine
