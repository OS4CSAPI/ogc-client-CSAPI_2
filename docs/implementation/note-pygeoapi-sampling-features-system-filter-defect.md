# pygeoapi Sampling Features System-Filter Defect

**Document date:** June 4, 2026

**Purpose:** Record the remaining `pygeoapi/52North` defect observed after public `samplingFeatures` population was restored on the Oracle-hosted demo environment. This note is intentionally narrow. It documents the defect, the observed evidence, the likely query-path cause, and the acceptance target for a future code fix.

## Summary

The public `pygeoapi/52North` deployment now exposes populated top-level and item-level `samplingFeatures` data, but the nested system traversal path still fails:

- `GET /samplingFeatures` returns populated results
- `GET /samplingFeatures/{id}` returns populated item results
- `GET /systems/{id}/samplingFeatures` returns an empty collection for seeded systems that do have associated sampling features

This should be treated as a remaining query-path defect, not as a data-population gap.

It should also be treated as a narrow route-association defect, not as evidence that the implementation family lacks real CSAPI capability. The latest publication-ready pygeoapi / 52North report card already preserves that distinction: the family exposes real Part 1 resources, real SensorML-bearing output, and some real route-specific Part 2 and write behavior, but generic-client confidence remains limited when route-specific readback and traversal paths break.

## Observed evidence

As verified on June 4, 2026:

- top-level public collection was populated after repair and bulk indexing
- individual item reads worked for newly indexed public sampling features
- nested `systems/{id}/samplingFeatures` remained empty for known seeded systems
- top-level filtering by `system=<id>` also returned empty results for those same seeded systems

These two failing paths strongly suggest that the nested traversal and the top-level `system` filter share the same broken filter logic.

## Relationship to the current pygeoapi report card

The latest publication-ready pygeoapi / 52North report card is useful supporting context for this defect, but it should be used carefully.

### 1. This aligns with the narrowed SamplingFeature lifecycle finding

The publication-ready report already preserves a narrowed lifecycle/read-back problem for SamplingFeatures in S3:

- scoped create can return success
- the created resource can remain invisible on expected read paths
- lifecycle confidence is therefore limited by broken create/read-back integrity rather than by total feature absence

This live June 4, 2026 note adds a more specific diagnosis to that same problem family: after public data repair, the remaining breakage is concentrated in parent-system association and filtering behavior rather than in total top-level or item-level unreadability.

### 2. This should stay S3-scoped unless broader evidence appears

The publication-ready report treats S3 as the more extensively exercised deployment and uses S3 as the main source of direct route-level write and lifecycle evidence. This note should do the same.

The current defect note is therefore about the Oracle-hosted S3 deployment and its public read paths. It should not be generalized into a broad claim that every pygeoapi / 52North deployment exhibits the same exact route defect unless separately verified.

### 3. This is not a “no sampling features” or “no Part 1” claim

The publication-ready report is explicit that pygeoapi / 52North is not a total non-implementation:

- real Part 1 resources exist
- real SensorML-bearing output exists
- some meaningful S3 dynamic-data and write-path behavior exists

This defect note should preserve that same boundary. The live problem is that a generic client still cannot trust all expected SamplingFeature association paths, even after the public data surface was repaired.

## Why this is not a data-absence problem

The same deployment demonstrated all of the following at the same time:

- sampling-feature documents existed in Elasticsearch
- the documents were readable through the public top-level collection
- individual item reads worked through the public API
- the seeded system identifiers were known and stable

That combination rules out the earlier "empty demo data" explanation for this specific route. The remaining issue is the query logic used to associate sampling features with their parent systems.

This also fits the broader publication-ready pygeoapi report framing: deployment/sample-surface richness is context, but route, filtering, traversal, and read-back behavior are scored implementation behavior. The current remaining defect belongs in the second category.

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

These acceptance checks are intentionally aligned with the pygeoapi report-card concern about create/read-back integrity and generic-client portability: the fix is not complete if it restores one association path while regressing the already-working top-level or item-level surfaces.

## Recommended follow-up

- Open or update a `csapi-pygeoapi` issue with this note as the evidence summary.
- Add an automated regression test for both:
  - `GET /samplingFeatures?system=<id>`
  - `GET /systems/{id}/samplingFeatures`
- Cross-reference the publication-ready pygeoapi report card only for narrow supporting context:
  - the residual `F28` SamplingFeature lifecycle/read-back concern
  - the S3-specific route-level evidence boundary
  - the broader caution that pygeoapi / 52North still requires too much generic-client adaptation on fragile paths
- Keep this defect separate from demo-data stewardship work. The demo population issue was remediated; this remaining issue is code-path behavior.
