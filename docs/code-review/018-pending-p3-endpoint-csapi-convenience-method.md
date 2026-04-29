---
status: pending
priority: p3
issue_id: "018"
tags: [code-review, api-design, ergonomics]
dependencies: []
phase: 8
---

# Asymmetry: `endpoint.edr(id)` vs `createCSAPIBuilder(endpoint, id)`

## Problem Statement

EDR exposes its query builder as a method on `OgcApiEndpoint`:

```ts
const builder = endpoint.edr(collectionId);
```

CSAPI exposes its builder as a standalone factory function imported from a
sub-path:

```ts
import { createCSAPIBuilder } from '@camptocamp/ogc-client/csapi';
const builder = await createCSAPIBuilder(endpoint, collectionId);
```

Both solve the same problem; the asymmetry hurts discoverability. A consumer
exploring `OgcApiEndpoint` in their IDE won't find the CSAPI entry point.

## Findings

**Files:**
- `src/ogc-api/endpoint.ts` (no `csapi()` method exists)
- `src/ogc-api/csapi/factory.ts` (the standalone factory)
- EDR comparison: `endpoint.edr()` is defined on `OgcApiEndpoint`

The sub-path import (`@camptocamp/ogc-client/csapi`) is intentional and
should remain — it preserves tree-shaking and mirrors the OGC Part 1 / Part 2
split. The fix is **additive**, not a replacement.

## Proposed Solutions

### Option A: Add `endpoint.csapi(id)` as a thin wrapper (Recommended)

Add a method on `OgcApiEndpoint` that delegates to `createCSAPIBuilder`:

```ts
async csapi(collectionId: string): Promise<CSAPIQueryBuilder> {
  const { createCSAPIBuilder } = await import('./csapi/factory.js');
  return createCSAPIBuilder(this, collectionId);
}
```

A dynamic import keeps the main bundle tree-shakeable for consumers who don't
use CSAPI. The standalone `createCSAPIBuilder` remains the canonical entry
point; `endpoint.csapi()` is a discoverability aid.

**Effort:** Small | **Risk:** Low (touches `endpoint.ts` — already in our diff)

### Option B: Leave as-is and document the entry point in JSDoc on `OgcApiEndpoint`

Cheaper but doesn't address discoverability for IDE users.

## Ownership Assessment

Touches `src/ogc-api/endpoint.ts` (upstream file we already modified in Phase 6
for `hasConnectedSystems`, `root`, and `getCollectionDocument`). The diff is
minimal and additive.

## Triage

**Accept — Phase 8.** Small additive change.
