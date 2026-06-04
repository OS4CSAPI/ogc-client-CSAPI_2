# pygeoapi Sampling Features System-Filter Defect

**Document date:** June 4, 2026

**Purpose:** Record the remaining `pygeoapi/52North` defect observed after public `samplingFeatures` population was restored on the Oracle-hosted demo environment. This note is intentionally narrow. It documents the defect, the observed evidence, the likely query-path cause, and the acceptance target for a future code fix.

## Summary

The public `pygeoapi/52North` deployment now exposes populated top-level and item-level `samplingFeatures` data, but the nested system traversal path still fails:

- `GET /samplingFeatures` returns populated results
- `GET /samplingFeatures/{id}` returns populated item results
- `GET /systems/{id}/samplingFeatures` returns an empty collection for seeded systems that do have associated sampling features

This should be treated as a remaining query-path defect, not as a data-population gap.

## Observed evidence

As verified on June 4, 2026:

- top-level public collection was populated after repair and bulk indexing
- individual item reads worked for newly indexed public sampling features
- nested `systems/{id}/samplingFeatures` remained empty for known seeded systems
- top-level filtering by `system=<id>` also returned empty results for those same seeded systems

These two failing paths strongly suggest that the nested traversal and the top-level `system` filter share the same broken filter logic.

## Why this is not a data-absence problem

The same deployment demonstrated all of the following at the same time:

- sampling-feature documents existed in Elasticsearch
- the documents were readable through the public top-level collection
- individual item reads worked through the public API
- the seeded system identifiers were known and stable

That combination rules out the earlier "empty demo data" explanation for this specific route. The remaining issue is the query logic used to associate sampling features with their parent systems.

## Likely cause

The observed Elasticsearch mapping for the `sampling_features` index included:

- `system` as a `text` field
- `system.keyword` as an exact-match `keyword` subfield

The server-side query path appears to filter against `system` rather than `system.keyword`.

That is a bad fit for exact system-ID matching because:

- the system IDs are hyphenated slugs
- the `text` analyzer tokenizes those values
- exact parent-system lookups should use the `keyword` subfield instead

The nested route behavior and the top-level `?system=` behavior both match this diagnosis.

## Probable fix direction

The future code fix should keep the existing multi-value filter shape but route the filter to the exact-match field.

In practical terms, the likely change is:

- keep a `terms`-style filter if the API layer passes `system` as a list
- target `system.keyword` rather than `system`

This note intentionally does not prescribe a specific patch beyond that direction. The owning repo should implement and verify the fix in its own test suite and deployment process.

## Acceptance target for the fix

Treat the defect as fixed only when all of the following succeed for a seeded or otherwise known-associated system:

1. `GET /samplingFeatures?system=<system-id>` returns non-empty results.
2. `GET /systems/{id}/samplingFeatures` returns non-empty results.
3. Results from both paths are consistent for the same system.
4. Top-level `GET /samplingFeatures` still works.
5. Direct `GET /samplingFeatures/{id}` item reads still work.
6. Paging still works on both the filtered top-level path and the nested path.

## Recommended follow-up

- Open or update a `csapi-pygeoapi` issue with this note as the evidence summary.
- Add an automated regression test for both:
  - `GET /samplingFeatures?system=<id>`
  - `GET /systems/{id}/samplingFeatures`
- Keep this defect separate from demo-data stewardship work. The demo population issue was remediated; this remaining issue is code-path behavior.
