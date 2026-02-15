# Design Notes — Decoupling Validation from Extraction

**Date:** 2026-02-15  
**Context:** Phase 3.2 smoke test finding F49, discussion of client-side validation philosophy  
**Status:** Design decision documented — implementation pending (see GitHub issue)

---

## Problem Statement

The Phase 3.2 smoke test (finding F49) revealed that all 5 OSH SamplingFeatures are now correctly **recognized** as SamplingFeature resources (thanks to the SensorML vocabulary extension in Issue #49), but they fail **extraction** because they lack the `sampledFeature@link` property that the validator requires per the OGC spec.

The root cause is architectural: `extractCSAPIFeature()` calls `validateCSAPIFeature()` as a hard gate — if validation returns any errors, extraction throws and returns nothing. This means **100% of OSH SamplingFeatures are currently inaccessible through the client library**, even though they contain perfectly usable data (geometry, uid, name, featureType, validTime).

---

## Current Design Tension

The current flow in `extractCSAPIFeature()` (lines 425–435 of `geojson.ts`) is:

```
recognize → validate → extract (on success) / throw (on failure)
```

This creates a hard coupling between validation and extraction. The validator correctly enforces the spec (SamplingFeatures require `sampledFeature@link`), but the extractor incorrectly uses validation as a precondition for extraction. The result: any server that returns slightly non-conformant data — even data that is 95% complete and perfectly usable — gets completely blocked.

This is a **design tension**, not a bug in either function individually. The validator is right to flag the missing property. The extractor is wrong to refuse all work because of it.

---

## Upstream Pattern Analysis

Looking at how the upstream ogc-client library (camptocamp) handles this in its existing format handlers (WMS, WFS, WMTS, OGC API Features):

- **They never validate-then-reject.** The upstream pattern is tolerant extraction — parse what you can, return what you get, let the caller decide what to do with incomplete data.
- **No existing upstream handler calls a validator as a precondition to extraction.** Validation and extraction are separate concerns. The WMS capabilities parser, for example, will happily return a partially-parsed capabilities document even if some layers have malformed metadata.
- **The upstream philosophy follows Postel's Law** (be conservative in what you send, be liberal in what you accept). A client library's job is to make server data accessible, not to enforce spec compliance on behalf of the server.

Our current CSAPI design inverts this: we're being **conservative in what we accept** from servers. That's the server's job (validate inputs before persisting), not the client's job (make data accessible to the application).

---

## Recommended Fix

**Remove the validation gate from `extractCSAPIFeature()`.** The function should:

1. Call `getCSAPIResourceType(feature)` — this is the only hard stop. If we can't even identify what kind of resource this is, we genuinely can't extract it.
2. If recognized, proceed directly to extraction — build the typed object from whatever properties are present.
3. **Do not** call `validateCSAPIFeature()` as a precondition.

**What stays the same:**

- `validateCSAPIFeature()` continues to exist and work exactly as it does today.
- All 13 per-type validators continue to correctly flag spec violations.
- `getCSAPIResourceType()` continues to be the recognition gate.
- All existing tests for validation pass unchanged.
- The validation functions remain available as opt-in diagnostics for callers who want them.

**What changes:**

- `extractCSAPIFeature()` no longer calls `validateCSAPIFeature()` internally.
- Callers who want validation do it themselves: call `validateCSAPIFeature()`, inspect the errors, decide what to do.
- The pattern becomes: recognize → extract (always succeeds for recognized features), validate (opt-in, separate step).

This is roughly a ~50-line change: remove the validation gate (~5 lines from `extractCSAPIFeature`), update ~15-20 lines of test expectations, update JSDoc on both functions to clarify the new relationship (~20-25 lines of documentation).

---

## Design Principles Applied

1. **Postel's Law** — Be liberal in what you accept from servers. Server-side responsibility for validation, client-side responsibility for access.
2. **Separation of Concerns** — Extraction and validation are different responsibilities. Coupling them means a failure in one blocks the other.
3. **Upstream Consistency** — Match the tolerant extraction pattern used by every other format handler in the ogc-client library.
4. **Data Accessibility** — A client library that blocks access to usable server data is failing its core purpose.
5. **Opt-in Diagnostics** — Validation remains available for callers who need it (debugging, developer tools, conformance testing), but never blocks normal operation.

---

## Impact Assessment

- **Scope:** ~50 lines of changes across `geojson.ts` and `geojson.spec.ts`
- **Risk:** Low — validation logic is unchanged, only the coupling is removed
- **Benefit:** Immediately unblocks extraction of all OSH SamplingFeatures (and any other server data that is recognized but fails strict validation)
- **Test Impact:** Existing validation tests pass unchanged. Extraction tests that expected `throw` on invalid data need updating to expect successful extraction instead.
- **Backwards Compatibility:** Callers who relied on `extractCSAPIFeature()` throwing on invalid data will need to add their own `validateCSAPIFeature()` call if they want that behavior.

---

## References

- **F49 (Phase 3.2 smoke test):** OSH SamplingFeatures lack `sampledFeature@link` — recognized but extraction blocked
- **F40 (Phase 3.1 smoke test, Issue #49):** SensorML vocabulary extension — the fix that made recognition work
- **Issue #51:** Unified validation surface refactoring — moved validators to helpers, which is how the tight coupling became visible
- **Upstream patterns:** `src/ogc-api/endpoint.ts`, `src/wms/endpoint.ts`, `src/wfs/endpoint.ts` — all use tolerant extraction
- **OGC Part 1 spec (23-001):** SamplingFeature requires `sampledFeature@link` — the validator is correct per spec; the issue is using validation as a gate
