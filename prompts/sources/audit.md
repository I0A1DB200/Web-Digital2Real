# Codex Contract — Audit Source Library

**Mode:** INVENTORY → VALIDATE → CLASSIFY → REPORT

Audit without silently repairing records. Check:

- stale or malformed URLs;
- missing required metadata;
- unknown product, variant, revision or language applicability;
- superseded records and unresolved relationships;
- ambiguous storage and production rights;
- duplicate canonical identity;
- invalid taxonomy values or authority IDs;
- orphaned or out-of-bound local files;
- missing master records;
- D2R references or asset records pointing to missing source IDs;
- authenticated sources that imply stored credentials or automated availability.

Retain dead-link and supersession history. Codex must not promote review state to `approved`.
