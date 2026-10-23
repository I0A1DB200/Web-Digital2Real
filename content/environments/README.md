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

Each `environment.yaml` owns only:

- Environment identity;
- intended Experience capacity;
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

Hotspots use percentage coordinates relative to the full uncropped image:

```text
x: 0–100
y: 0–100
```

## Publication boundary

- `draft` remains canonical but is not browser-consumable.
- `preview` may expose a partial set of validated hotspots in Preview packaging.
- `published` requires the complete governed hotspot set and may enter Production packaging.

The generated catalog resolves every hotspot through the canonical Experience editorial ID. Environment content never owns Experience titles, summaries, access rules, or technical identifiers.

Capacity describes the intended size of an Environment. Completion is user runtime state and is never authored in this directory or emitted as static catalog metadata.

## Environment contract V2 and Theory

Environment contract `2.0.0` may reference one canonical `theory.yaml` within the same ENV package. Theory owns ordered technical preparation content, ES/EN localization and ENV-local media references. Generated Theory artifacts are disposable delivery output and are loaded on demand.

Notebook remains a separate product and source of truth. ENV Theory neither imports nor references Notebook content; independent editorial duplication is permitted when both products need to explain the same industrial concept.
