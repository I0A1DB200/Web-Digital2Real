# D2R-STD-001 — Experience Package v1

## Purpose

Define the minimum maintainable package for a self-contained, localizable, reproducible Digital2Real Experience without duplicating Engine contracts or generated artifacts.

## Structure

```text
content/experiences/<domain>/EE-XXXX-<slug>/
├── experience.yaml
├── locales/
│   ├── es.yaml
│   └── en.yaml
├── media-source/
├── assets/
└── README.md
```

No additional folders are required. Runtime Contracts, Web Artifacts, validators, reports, and Player code never belong in an Experience package.

## Responsibilities

- `experience.yaml` is the functional SSOT: identity, structure, IDs, stages, decisions, evidence, private evaluation, media references, and localization configuration.
- `locales/` overlays visible copy by stable functional IDs. It never duplicates Experience logic. The declared default locale is the controlled fallback.
- `media-source/` contains only genuine, unmodified high-quality masters. A missing master must be documented, never reconstructed from a compressed derivative.
- `assets/` contains browser-ready derivatives referenced by `experience.yaml`. Assets must remain inside their package publication namespace.
- `README.md` records operational ownership, validation, locale, and media provenance.

## Naming and sources

The folder name must match `EE-[0-9]{4}-<slug>` and live below one domain. `experience.yaml` remains the only functional source. Locale and media paths must be package-relative, must not traverse upward, and must resolve to declared files.

## Internationalization

Every standardized package declares supported locales and a default fallback. Packaging resolves each locale before Authoring validation and produces localized public artifacts from one logical Experience. Missing critical translation keys fail resolution; an unavailable requested locale falls back only to the declared default.

## Regeneration and publication

Masters are never overwritten or optimized in place. Web derivatives may be regenerated into `assets/`; packaging copies only declared derivatives and never publishes `media-source/`. Generated Runtime and Web Artifacts remain outside `content/`.

## Legacy compatibility

Package v1 validation is enforced for Experiences that declare `localization`. Existing Experiences may retain their current structure until explicitly migrated; no implicit migration or fallback to legacy Engine content is introduced.

## Acceptance

A package is accepted when its canonical files and directories exist, both locale documents resolve, all paths remain inside the package, declared assets exist, Authoring/Runtime/Web validation passes, private content is absent from the public artifact, and the full repository suite remains green.
