# Section 39: Live Sampling Feature Population and Readback Lessons

**Research Time:** June 4, 2026

**Primary Source(s):**
- Live Oracle-hosted CSAPI deployments exercised on June 4, 2026
- [CSAPI CRUD Operations](../../requirements/csapi-crud-operations.md)
- [CSAPI Part 1 Requirements](../../requirements/csapi-part1-requirements.md)
- [OGC API - Connected Systems Part 1 bundled OAS](../../standards/ogcapi-connectedsystems-1.bundled.oas31.yaml)

**Supporting Resources:**
- [Section 32: Real-World Server Compatibility Testing](32-real-world-server-compatibility-testing.md)
- [Server Quirks Reference](../../../implementation/server-quirks-reference.md)
- [Live Server Smoke Test Post Phase 4.1](../../../implementation/live-server-smoke-test-post-phase-4.1.md)

**Document Purpose:** Capture the lessons learned from restoring rich `samplingFeatures` data on the Oracle-hosted public CSAPI deployments. This document is intended as a reusable cross-repo reference for demo-server operations, interoperability testing, seed-data stewardship, and smoke-test acceptance criteria.

---

## Executive Summary

On June 4, 2026, the Oracle-hosted public CSAPI servers were in a state where the `samplingFeatures` surface was technically present but operationally weak:

- OpenSensorHub public `samplingFeatures` returned `200` with an empty collection.
- `csapi-go-v2` public `samplingFeatures` returned `200` with an empty collection.
- `pygeoapi/52North` public `samplingFeatures` returned `200` with an empty collection, while item-level behavior and create-readback behavior were broken or misleading.
- An older OpenSensorHub public route still returned `500`.

The practical result was that a downstream integrator could not use the public servers for positive `samplingFeatures` testing even though some of the routes existed and some stacks nominally supported create operations.

The remediation work on June 4, 2026 used a mixed strategy:

- API-level seeding for OpenSensorHub, `csapi-go-v2`, and `csapi-go-head`
- backing-store repair plus bulk indexing for `pygeoapi/52North`
- a contextual seed corpus of 10 system families with 100 sampling features each

After the remediation pass, the public top-level `samplingFeatures` collections were populated on all four Oracle-hosted stacks:

- OpenSensorHub: `1003`
- `csapi-go-v2`: `1002`
- `csapi-go-head`: `1000`
- `pygeoapi/52North`: `1017`

The most important lesson is simple: a route existing and returning `200` is not enough. Public interoperability surfaces must be judged on populated readback, nested traversal, item retrieval, and create-readback behavior, not just endpoint presence.

---

## Observed Live State Before Remediation

### 1. Route presence did not equal usable interoperability

The public servers exposed `samplingFeatures` routes, but those routes did not provide the positive data needed by generic clients, plugin developers, or smoke-test operators.

This matters because a formally present route can still be operationally useless if it is:

- always empty
- only partially populated
- not traversable from related resources
- not readable after create
- inconsistent across top-level, nested, and item-level views

### 2. Empty collections and broken readback behaved differently across stacks

The June 4, 2026 live checks showed three distinct failure modes:

- **Empty but valid collection response:** top-level `samplingFeatures` returned `200` with an empty `FeatureCollection`
- **Successful create with misleading postconditions:** a create operation returned `201`, but the item route or collection route did not expose the new resource correctly
- **Server-side query/read-path defect:** data existed in the backing store, but the API read path could not return it reliably

These are different operational problems and should not be collapsed into one generic finding.

### 3. API-only write probing was not sufficient for all stacks

OpenSensorHub and both connected-systems-go stacks were seedable through their public APIs.

`pygeoapi/52North` was not.

Its public behavior initially suggested that create might work because the server returned `201`, but the resource was not reliably visible through top-level, nested, or item-level reads. Direct inspection of the Elasticsearch backing index showed that `sampling_features` documents existed, but the read path expected a `geojson` branch that was missing for those documents.

That is a storage/API contract bug, not a mere data-population gap.

---

## Key Lessons

### Lesson 1: Positive interoperability testing needs populated public data

A public CSAPI server is not operationally ready for interoperability work if `samplingFeatures` is always empty.

For many developer workflows, the minimum useful state is not:

- route exists
- route returns `200`

It is:

- top-level collection populated
- at least one item readable directly
- at least one meaningful system-to-samplingFeatures traversal path
- real geometry and descriptive properties present

### Lesson 2: Conformance and population quality must stay separate

An empty `samplingFeatures` collection is not automatically a standards defect.

But it is still an interoperability and testing problem if the public deployment is being used as a live integration target.

This distinction should be preserved:

- **implementation defect:** route behavior, representation, write/readback, filtering, traversal, schema, or media handling is wrong
- **deployment/data-state issue:** the route is structurally present but unpopulated or under-seeded

### Lesson 3: Public smoke checks need postcondition verification

Write-path probing must verify postconditions, not just HTTP status codes.

The June 4, 2026 remediation showed at least two important cases:

- OpenSensorHub could persist a created system even when the create response returned `500`
- `pygeoapi/52North` could return `201` for sampling-feature creation while still failing to expose the resource correctly on readback

Therefore, every write-path smoke check should verify:

- `Location` header or returned identifier
- direct item readback
- top-level collection visibility
- relevant nested collection visibility

### Lesson 4: Top-level, nested, and item routes must be tested separately

`samplingFeatures` is not one endpoint in practice. It is at least three meaningful access surfaces:

- `/samplingFeatures`
- `/samplingFeatures/{id}`
- `/systems/{id}/samplingFeatures`

The June 4, 2026 remediation produced a particularly clear example in `pygeoapi/52North`:

- top-level collection now works
- item-level read now works
- nested `systems/{id}/samplingFeatures` still returns empty

A simple “the endpoint works” conclusion would have been wrong.

### Lesson 5: Seed data should be contextual, not random

The most useful seed corpus was not a bag of anonymous points.

The successful shape used 10 context families:

- desert weather
- coastal buoy
- river gauge
- indoor thermometry
- airport meteorology
- estuary water quality
- acoustic array
- urban air monitoring
- agricultural field monitoring
- wildfire-edge monitoring

This made the public data immediately more useful for:

- discovery testing
- map-based client behavior
- traversal testing
- human inspection
- future observation/datastream linkage

### Lesson 6: Stable UIDs and batch IDs are operationally necessary

Bulk demo seeding should always use:

- a unique batch identifier
- deterministic or patterned UIDs
- deterministic system-family naming

Without those, cleanup, refresh, de-duplication, and future maintenance become fragile.

### Lesson 7: Backing-store access is sometimes required for production demo stewardship

For broken or partially broken stacks, API-only remediation may be insufficient.

The June 4, 2026 work required:

- direct SSH access to the Oracle host
- inspection of Dockerized services and indexes
- direct Elasticsearch indexing for `pygeoapi/52North`

That is not ideal, but it is operationally realistic. The repos should document this possibility rather than assuming all population work can be done through clean public API writes.

### Lesson 8: Public demo stewardship is a separate discipline from code deployment

A server can be freshly deployed and still be a poor public interoperability target if:

- routes are empty
- sample data has drifted away
- write paths create data the read path cannot return
- public aliases and canonical hosts diverge

Public demo environments need explicit data-stewardship checks, not just service-up checks.

---

## Server-Specific Findings

### OpenSensorHub

- Public top-level `samplingFeatures` was empty before remediation.
- API-level create under `/systems/{id}/samplingFeatures` worked and scaled to bulk seeding.
- System create behavior was not fully trustworthy by status code alone; a create could persist despite an HTTP `500`.
- Existing OSH behavior still demonstrates that some sampling-feature subpaths are rejected (`samplingFeatures/{id}/systems`, `samplingFeatures/{id}/history`), consistent with existing quirk documentation.

### connected-systems-go v2

- Public top-level `samplingFeatures` was empty before remediation.
- API-level create/readback was stable enough for bulk seeding.
- The stack accepted a large contextual seed load without requiring direct database intervention.

### connected-systems-go head

- The environment contained considerable test clutter, but the API still accepted contextual seed systems and bulk sampling-feature creation.
- This stack is useful as a future canary for new write-path regressions because it is already noisier than the curated `v2` environment.

### pygeoapi/52North

- Public top-level `samplingFeatures` was empty before remediation.
- The backing Elasticsearch index already contained sampling-feature documents.
- Public create returned `201`, but readback behavior was broken or misleading.
- The primary repair was adding the expected `geojson` representation branch and other missing fields to the sampling-feature documents, then bulk-indexing a larger contextual corpus.
- After repair, top-level collection and item-level reads worked.
- Nested `systems/{id}/samplingFeatures` still returned empty on June 4, 2026, indicating a remaining query-path defect separate from data absence.

---

## Recommended Acceptance Checklist For Public `samplingFeatures`

Before calling a public server “ready” for sampling-feature interoperability work, verify all of the following:

1. `GET /samplingFeatures` returns `200` and a non-empty collection.
2. `GET /samplingFeatures/{id}` works for at least one item from the public collection.
3. `GET /systems/{id}/samplingFeatures` works for at least one system that should have associated sampling features.
4. At least one returned feature has:
   - geometry
   - `uid`
   - `name`
   - `featureType`
5. `sampledFeature@link` is present where the implementation claims standards-facing GeoJSON shape support for Sampling Features.
6. A create operation, where supported, is verified by:
   - status code
   - `Location` or ID
   - direct item readback
   - collection visibility
7. Paging behavior is exercised for a collection larger than one page.
8. Alternate format or content-negotiation behavior is checked where relevant.
9. Public alias URLs and canonical URLs are both tested if both are in use.

---

## Recommended Seed-Corpus Strategy

### Seed shape

Use a contextual seed corpus organized by system family, not anonymous generated points.

Each seed family should include:

- one stable seed system
- a set of 100+ spatially distributed sampling features
- realistic names and descriptions
- a stable `featureType`
- a stable `sampledFeature@link`

### Minimum families

The June 4, 2026 seed set used 10 families and is a good baseline:

- desert weather
- coastal buoy
- river gauge
- indoor thermometry
- airport meteorology
- estuary water quality
- acoustic array
- urban air monitoring
- agricultural field monitoring
- wildfire-edge monitoring

### Operational properties

Every seed batch should include:

- batch ID in `uid`
- deterministic family slug
- deterministic item numbering
- reproducible geometry offsets
- enough count to force paging behavior

---

## Operational Guardrails

### 1. Treat public data state as an asset

The population state of demo servers should be managed as deliberately as:

- container images
- TLS endpoints
- reverse-proxy configuration
- auth configuration

### 2. Keep idempotent seeding scripts

Seed scripts should be:

- versioned
- idempotent
- able to detect previously created seed systems
- able to tolerate partial prior runs
- able to report counts after completion

### 3. Keep a backing-store repair path documented

For stacks like `pygeoapi/52North`, the project should document:

- where data is stored
- what representation branches the read path expects
- how to bulk repair malformed or incomplete documents

### 4. Re-verify after deployment changes

Any deployment, rebuild, or data refresh should re-run the acceptance checklist for:

- top-level collection
- item read
- nested collection
- create-readback

---

## Repo Follow-Up Recommendations

### This repo (`ogc-client-CSAPI_2`)

Document the acceptance checklist and public-server stewardship expectations in future live-server smoke-test or testing-playbook updates.

### `csapi-pygeoapi`

Document the Elasticsearch document-shape contract for sampling features and fix the remaining nested `systems/{id}/samplingFeatures` query-path defect.

### connected-systems-go repos

Preserve an idempotent public seeding workflow and periodically prune or isolate old smoke-test clutter in non-curated environments.

### OSH / publisher / deployment repos

Document the relationship between system seeding, publisher creation, and public `samplingFeatures` visibility so operational seeding does not regress into empty public collections.

---

## Current Verification Snapshot

As observed on **June 4, 2026**, after the remediation pass:

- OpenSensorHub top-level `samplingFeatures`: `1003`
- `csapi-go-v2` top-level `samplingFeatures`: `1002`
- `csapi-go-head` top-level `samplingFeatures`: `1000`
- `pygeoapi/52North` top-level `samplingFeatures`: `1017`

This snapshot should be treated as time-sensitive operational evidence, not a permanent truth about the deployments.
