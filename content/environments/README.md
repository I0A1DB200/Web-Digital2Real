# Experience Environments

## Ownership

`content/environments/` is the canonical source for authored Environment definitions and master images.

`Frontend/generated/` is disposable generated output and must never become a source of truth. Environment images must not be authored directly under `Frontend/assets/`.

## Visual assets

- Master images are clean industrial backgrounds.
- Images must not contain hotspots, labels, cards, locks, prices, or other interface elements.
- The current canonical aspect ratio is 16:9.
- Replacing or cropping a frozen master invalidates its hotspot coordinates.

## Data boundaries

Future `environment.yaml` files will own only:

- Environment identity;
- background reference;
- aspect ratio;
- Experience references;
- percentage hotspot coordinates.

Environment definitions must not duplicate:

- Experience titles;
- diagnostic descriptions;
- access classification;
- publication status;
- routes;
- Player content.

Those fields remain owned by canonical Experience content.

## Coordinate contract

Future hotspots use percentage coordinates relative to the full uncropped image:

```text
x: 0–100
y: 0–100
```

## Current mapping

```text
ENV-001 → EE-0001 to EE-0010
ENV-002 → EE-0011 to EE-0020
ENV-003 → EE-0021 to EE-0030
```

This mapping is architectural. It does not authorize inventing missing Experiences or making them playable.
