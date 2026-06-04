# Public Sampling Features Seeding and Verification Runbook

**Document date:** June 4, 2026

**Purpose:** Provide a repeatable operational runbook for maintaining public `samplingFeatures` readiness across the Oracle-hosted CSAPI demo deployments. This runbook is based on the June 4, 2026 live remediation work and is intended to prevent future drift into empty, misleading, or partially readable public `samplingFeatures` surfaces.

## Scope

This runbook is for operational stewardship of public demo data. It is not a standards interpretation document and it is not a replacement for implementation-specific bug fixing.

Use it when a public deployment:

- exposes `samplingFeatures` routes but returns empty collections
- accepts create operations without dependable readback
- shows divergence between top-level, item-level, and nested traversal paths
- needs a richer public demo surface for downstream integration testing

## Readiness target

Before a public deployment should be described as ready for positive `samplingFeatures` interoperability work, it should satisfy all of the following:

1. `GET /samplingFeatures` returns `200` and a non-empty collection.
2. `GET /samplingFeatures/{id}` works for at least one public item.
3. `GET /systems/{id}/samplingFeatures` works for at least one system that should have associated sampling features.
4. At least one returned sampling feature includes:
   - geometry
   - `uid`
   - `name`
   - `featureType`
5. Post-write verification is possible where create is supported.

## Seed-corpus pattern

Prefer a contextual seed corpus over anonymous generated points.

### Recommended seed families

The June 4, 2026 remediation used these ten families:

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

### Recommended seed properties

Each family should include:

- one stable seed system
- 100 or more spatially distributed sampling features
- deterministic UIDs
- deterministic item numbering
- realistic names and descriptions
- stable `featureType`
- stable `sampledFeature@link`

The goal is not random bulk volume. The goal is reusable, plausible, and inspectable public test data.

## Verification sequence

Run these checks in order.

### 1. Collection presence

Verify:

- top-level `GET /samplingFeatures`
- collection count or feature length
- paging with `limit`

This answers whether public data is present at all.

### 2. Item readback

Pick one known item ID from the public collection and verify:

- `GET /samplingFeatures/{id}`

This confirms that the collection is not exposing references to unreadable items.

### 3. Nested traversal

Pick one known parent system and verify:

- `GET /systems/{id}/samplingFeatures`

This must be checked separately. Do not assume that a working top-level collection implies a working nested traversal path.

### 4. Filtered top-level behavior

If the implementation supports filtering by parent system, verify:

- `GET /samplingFeatures?system=<id>`

This is particularly important because some stacks can expose working top-level collections while still breaking the parent-system filter path.

### 5. Create-readback verification

Where create is supported:

1. create a known sampling feature under a known system
2. record the returned ID or `Location`
3. verify direct item readback
4. verify top-level collection visibility
5. verify nested collection visibility

Do not treat the status code as sufficient evidence by itself.

## Write-path guardrails

The June 4, 2026 live work showed that write-path status codes can be misleading.

- A create may persist even when the server returns an error.
- A create may return success while the read path still cannot expose the new resource correctly.

Because of that, every write-path check should be treated as a postcondition check, not a status-only check.

## Backing-store repair boundary

Some deployments may require backing-store repair rather than API-only remediation.

Examples of when that boundary has been crossed:

- public create returns success but readback remains broken
- documents exist in the backing store but lack the representation branch expected by the API read path
- top-level and item reads behave differently for the same resource family

When this happens:

- document the backing-store contract
- repair documents in a controlled way
- rerun the full readback sequence after repair

Do not treat backing-store repair as a substitute for fixing a genuine API query-path bug.

## Distinguish operational state from implementation defects

Keep these categories separate:

- **Operational/data-state issue:** route exists but is empty or thinly seeded
- **Implementation defect:** route, filter, traversal, representation, or readback logic is wrong

The same deployment can have both at once. The runbook should not blur them together.

## Minimum reporting after a maintenance pass

After any seeding or repair pass, record:

- deployment URL
- date and time
- top-level collection count
- item-read verification result
- nested-traversal verification result
- filtered top-level verification result, if applicable
- whether create-readback was exercised
- any remaining route-specific defects

## Recommended follow-up integration

- Add these checks to live public smoke-test workflows.
- Keep the seed corpus versioned and idempotent.
- Preserve stable batch identifiers so cleanup and refresh remain possible.
- Re-run this checklist after deployment rebuilds, proxy changes, or data refreshes.
