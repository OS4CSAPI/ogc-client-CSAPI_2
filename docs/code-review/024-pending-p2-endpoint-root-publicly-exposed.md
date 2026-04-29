---
status: pending
priority: p2
issue_id: '024'
tags: [code-review, api-design, upstream-surface]
dependencies: []
phase: 8
needs-decision: true
---

# `OgcApiEndpoint.root` and `getCollectionDocument` Newly Public

## Problem Statement

Phase 6 / Phase 7 made two `OgcApiEndpoint` members public so `factory.ts`
could access them across the module boundary:

- `OgcApiEndpoint.root` — getter returning `Promise<OgcApiDocument>`
- `OgcApiEndpoint.getCollectionDocument(id)` — method returning
  `Promise<OgcApiDocument>`

Both return `OgcApiDocument`, which is a `Record<string, unknown>` wrapper.
Making these public freezes the document format into the public API of
`OgcApiEndpoint` — a change that affects upstream-authored class members and
may draw maintainer pushback during PR review.

## Findings

**File:** `src/ogc-api/endpoint.ts`

These were exposed in Phase 6 to support the standalone `createCSAPIBuilder`
factory pattern. The factory uses both:

```ts
// src/ogc-api/csapi/factory.ts
const collectionDoc = await endpoint.getCollectionDocument(collectionId);
const rootDoc = await endpoint.root;
```

## Decision Required

Three options, in order of upstream-friendliness:

### Option A: Revert to private + add a narrow public method (Recommended candidate)

Add a single new public method that returns exactly what the factory needs,
keeping `root` and `getCollectionDocument` private:

```ts
// On OgcApiEndpoint:
async _getCSAPIBootstrap(collectionId: string): Promise<{
  collection: OgcApiCollectionInfo;
  resourceUrls: Map<string, string>;
}> { ... }
```

Pros: minimum new public surface, factory becomes trivial, easy to evolve.
Cons: still adds _one_ new public method; an underscore prefix is a convention
not a guarantee.

### Option B: Keep public + document in PR description

Leave the surface change. Document in the PR that these are required by the
new CSAPI factory and were public-by-necessity.

Pros: zero additional code change.
Cons: forever a public commitment for the maintainer; harder to refactor.

### Option C: Move the factory inside `OgcApiEndpoint` as a method

Promote `endpoint.csapi(collectionId)` (see [018](018-pending-p3-endpoint-csapi-convenience-method.md))
to _the_ entry point and have it use `private` access internally. Drop or
re-privatize the standalone `createCSAPIBuilder`, or keep it as a
re-export that delegates.

Pros: fully encapsulated; no internals leak.
Cons: changes the canonical entry point; sub-path import remains but does
something different.

## Investigation Needed

1. Confirm what `factory.ts` actually needs from `endpoint.root` and
   `endpoint.getCollectionDocument` — is it the full `OgcApiDocument`, or a
   small slice?
2. Check the Phase 6 commits to see why these were promoted to public (was it
   the only available path?).
3. Compare `OgcApiEndpoint`'s pre-Phase-6 surface against current — what
   exactly did we change?

## Triage

**Investigate — Phase 8.** Highest-impact finding for upstream PR review optics.
Decision blocks the Phase 8 execution plan.
