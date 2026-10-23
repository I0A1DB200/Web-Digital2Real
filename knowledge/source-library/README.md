# D2R Source Library

This directory owns traceable records for external technical sources. `D2R_SOURCE_LIBRARY_MASTER.yaml` is a discovery index; complete metadata lives in one stable `records/SRC-xxxxxx.yaml` file per source.

The library is metadata-first. External documents are not downloaded by default. Local storage requires a technical need, compatible rights, provenance, and explicit approval. Authenticated sources may be registered, but credentials never belong here and automated access must not be assumed.

Source classification, authority, review, availability, and rights are independent decisions. Codex may create and validate a record but must not set `review.state: approved` without an explicit Architect or Engineering review decision.

Broken, unavailable, rejected, and superseded sources retain their records and relationships. Do not delete history silently.

## Layout

- `D2R_SOURCE_LIBRARY_MASTER.yaml`: compact discovery index.
- `records/`: complete source records.
- `schema/`: declarative record contract.
- `taxonomies.yaml`: governed vocabulary.
- `authorities/`: protocol-neutral authority ownership.
- `files/`: reserved for explicitly approved local documents and device data; no placeholder directories are created until required.

Run `node scripts/validate-source-library.mjs` to validate the library.
