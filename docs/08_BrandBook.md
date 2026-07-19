# Digital2Real — Brand Book

**Version:** 2.0
**Status:** Active
**Focus:** Industrial editorial platform

## 1. Brand Essence

Digital2Real is an editorial and educational engineering platform focused on Industrial Automation.

It should feel like a technical publication and an industrial laboratory gallery, not a dashboard, commercial landing page, or generic portfolio.

## 2. Logo

The wordmark is:

Digital2Real

The number **2** is the identity accent. Its color must come exclusively from `Frontend/styles/brand.css`.

The active navbar wordmark remains HTML and CSS. Brand SVG files are resources and do not replace it.

## 3. Identity Color

The official identity color is copper.

Current token:

```css
--brand-primary: #b36002;
```

The token value in `Frontend/styles/brand.css` is authoritative. Other documents and modules must not define competing identity colors.

## 4. Color System

Color primitives are owned by `Frontend/styles/brand.css`:

- graphite and black backgrounds;
- off-white primary ink;
- restrained neutral text and lines;
- copper identity accents.

Copper must remain selective. It supports identity and technical emphasis without dominating the editorial composition.

## 5. Typography

Preferred typography is technical, neutral, editorial, and durable.

The authoritative font stacks are defined in `Frontend/styles/brand.css`.

Avoid decorative futuristic, gaming, or novelty industrial typefaces.

## 6. Editorial Design Rules

Do:

- use generous whitespace;
- prioritize clear typography;
- use large, meaningful photography;
- maintain thin lines and restrained interaction;
- give engineering work room to breathe;
- preserve accessible focus and readable contrast.

Do not:

- create dashboard-like chrome around editorial content;
- use glassmorphism, neon accents, or heavy decorative effects;
- add badges or controls without purpose;
- allow the interface to compete with the work;
- hardcode colors outside the brand SSOT.

## 7. Brand Assets

Brand resources currently live in `Frontend/assets/brand/`:

- `favicon.svg`
- `logo-mark.svg`
- `logo.svg`

Asset presence does not imply that every resource is used by the active interface.

## 8. CSS Ownership

| Concern | Owner |
|---|---|
| Brand primitives | `Frontend/styles/brand.css` |
| Compatibility aliases | `Frontend/styles/variables.css` |
| Navbar presentation | `Frontend/styles/navbar.css` |
| Document metadata theme color | `Frontend/index.html` |

Literal color values currently present outside `brand.css` are known technical debt. They must be corrected through an approved, visually validated package.

## 9. Brand Principle

The interface must never compete with the engineering work.
