# EE-0007 — Sequence stuck waiting for condition

Experience Engine V2 scenario for diagnosing a Siemens GRAPH sequence blocked at S40 because T40 references `PartAtStop_2` instead of the verified physical tag `PartAtStop_Sensor` at `%I0.5`.

The canonical diagnostic path preserves the physical process and PLC input, corrects the transition reference, and verifies progression to S41 over repeated cycles without forcing.

## Canonical files

- `experience.yaml`: authoring SSOT and private diagnostic truth.
- `locales/es.yaml` and `locales/en.yaml`: learner-facing localization.
- `assets/`: seven approved frozen raster assets.
- `media-source/`: source provenance only; never packaged for the browser.

