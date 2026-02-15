# Design Notes — Removing Feature-Level Validators from Scope

**Date:** 2026-02-15  
**Context:** Phase 3.2 smoke test finding F49, upstream pattern analysis, contribution strategy  
**Status:** Design decision documented — implementation pending (see Issue #52)

---

## Problem Statement

The Phase 3.2 smoke test (finding F49) revealed that all 5 OSH SamplingFeatures are now correctly **recognized** as SamplingFeature resources (thanks to the SensorML vocabulary extension in Issue #49), but they fail **extraction** because they lack the `sampledFeature@link` property that the validator requires per the OGC spec.

The root cause is architectural: `extractCSAPIFeature()` calls `validateCSAPIFeature()` as a hard gate — if validation returns any errors, extraction throws and returns nothing. This means **100% of OSH SamplingFeatures are currently inaccessible through the client library**, even though they contain perfectly usable data (geometry, uid, name, featureType, validTime).

This finding prompted a broader examination: do the feature-level validators belong in this contribution at all?

---

## Current Design Tension

The current flow in `extractCSAPIFeature()` (lines 425–435 of `geojson.ts`) is:

```
recognize → validate → extract (on success) / throw (on failure)
```

This creates a hard coupling between validation and extraction. The validator correctly enforces the spec (SamplingFeatures require `sampledFeature@link`), but the extractor incorrectly uses validation as a precondition for extraction. The result: any server that returns slightly non-conformant data — even data that is 95% complete and perfectly usable — gets completely blocked.

The initial response was to decouple validation from extraction — keep the validators but stop using them as a gate. But further analysis revealed a more fundamental question: **should these validators exist in the contribution at all?**

---

## Upstream Pattern Analysis

Looking at how the upstream ogc-client library (camptocamp) handles this across **every** existing format handler (WMS, WFS, WMTS, OGC API Features, EDR, STAC, TMS):

- **They never validate-then-reject.** The upstream pattern is tolerant extraction — parse what you can, return what you get, let the caller decide what to do with incomplete data.
- **No existing upstream handler calls a validator as a precondition to extraction.** Validation and extraction are separate concerns. The WMS capabilities parser, for example, will happily return a partially-parsed capabilities document even if some layers have malformed metadata.
- **No existing upstream handler HAS a validator at all.** Zero format handlers in the entire library include validation functions. There is no `validateWMSCapabilities()`, no `validateWFSFeature()`, no `validateSTACItem()`. The library does not validate server responses.
- **The upstream philosophy follows Postel's Law** (be conservative in what you send, be liberal in what you accept). A client library's job is to make server data accessible, not to enforce spec compliance on behalf of the server.

Our CSAPI implementation is the only handler in the library that includes validation functions. This is a deviation, not an extension.

---

## Decision: Remove Feature-Level Validators Entirely

After examining the upstream patterns, the conclusion is clear: **the feature-level validators (`validateCSAPIFeature`, the 13 per-type validators, the `ValidationError` type) should be removed from the contribution scope entirely.**

### What We Built (Now Being Removed)

- `validateCSAPIFeature()` in `geojson.ts` — unified validation entry point
- 13 per-type validators in `helpers.ts` (`validateSystem`, `validateDeployment`, `validateProcedure`, `validateSamplingFeature`, `validateProperty`, `validateDataStream`, `validateObservation`, `validateControlStream`, `validateCommand`, plus partial validators)
- `ValidationError` type with path, message, severity
- ~300+ lines of validation code
- ~200+ lines of validation tests

### Why Remove (Not Just Decouple)

Initially, the plan was to decouple validation from extraction — keep the validators as opt-in diagnostics. But this still raises the question: **would the upstream accept 500+ lines of code (validators + tests) for a feature that no other handler has ever needed?**

The answer is almost certainly no. Here's why:

1. **Zero precedent.** No format handler in the library includes validation. The upstream reviewers would ask "why does CSAPI need this when WMS, WFS, WMTS, EDR, STAC, and TMS don't?"

2. **No caller.** After decoupling from extraction, no code in the library calls the validators. They exist only for external callers who might want conformance checking — a use case the library does not serve for any other API.

3. **Maintenance burden.** Validators must track spec changes. If OGC Part 1 changes `sampledFeature@link` from required to optional, someone has to update the validator. The upstream maintainers would inherit this burden for a feature they didn't ask for.

4. **Scope creep.** A contribution that adds 500+ lines of code for a feature with no precedent and no consumer will be seen as scope creep, regardless of how well-implemented it is.

5. **Wrong layer.** Validation is a server-side responsibility (validate inputs before persisting) or an application-side concern (the consuming app can implement its own validation rules). The client library sits between these layers — its job is transport and parsing, not enforcement.

### What Stays

- **Recognition** (`isCSAPIFeature`, `getCSAPIResourceType`) — stays. This is core to extraction and has clear purpose.
- **Extraction** (`extractCSAPIFeature`) — stays. This is the primary function of the handler.
- **Type system** (all interfaces in `model.ts`) — stays. TypeScript types provide compile-time safety.
- **Helper utilities** (`parseValidTime`, `isValidUri`, `buildAtLinkObject`) — stay. These serve extraction.
- **Format detection** (`mime-type.ts` extensions) — stays. This is infrastructure.

### What Goes

- `validateCSAPIFeature()` — removed from `geojson.ts`
- All 13 per-type validators — removed from `helpers.ts`
- `ValidationError` type — removed from `helpers.ts`
- All validation tests — removed from `geojson.spec.ts` and `helpers.spec.ts`
- The validation gate in `extractCSAPIFeature()` — removed (extraction relies only on recognition)

### What We Learned

The validators were not wasted effort. Building them forced deep engagement with the OGC Part 1 and Part 2 specs — understanding required fields, URI constraints, temporal validity rules, association integrity requirements. That knowledge is embedded in the type system and extraction logic. The validators were the scaffolding; the types and extractors are the building.

---

## Design Principles Applied

1. **Postel's Law** — Be liberal in what you accept from servers. Server-side responsibility for validation, client-side responsibility for access.
2. **Upstream Consistency** — Match the patterns used by every other format handler in the ogc-client library. No handler validates. We shouldn't either.
3. **Minimal Contribution Surface** — A contribution should add what the library needs, not what might be nice to have. The upstream reviewers evaluate additions by necessity and precedent.
4. **Data Accessibility** — A client library that blocks access to usable server data is failing its core purpose. Validators can only block, never enable.
5. **Maintenance Stewardship** — Don't hand upstream maintainers code they'll need to maintain without clear benefit. Validators are maintenance debt for a feature with no upstream consumer.

---

## Impact Assessment

- **Lines removed:** ~500+ (validators + validation tests)
- **Lines changed:** ~20-30 (`extractCSAPIFeature` updated to rely only on recognition, JSDoc updates)
- **Risk:** Low — removing code is lower risk than adding or changing it
- **Benefit:** Cleaner contribution, no maintenance burden, extraction immediately works for all recognized features (including OSH SamplingFeatures from F49)
- **Test Impact:** Validation tests are removed. Extraction tests updated to expect success for any recognized feature. All other tests unchanged.

---

## References

- **F49 (Phase 3.2 smoke test):** OSH SamplingFeatures lack `sampledFeature@link` — recognized but extraction blocked
- **F40 (Phase 3.1 smoke test, Issue #49):** SensorML vocabulary extension — the fix that made recognition work
- **Issue #51:** Unified validation surface refactoring — moved validators to helpers, which is how the tight coupling became visible
- **Issue #52:** Remove validators entirely and update extraction to rely only on recognition
- **Upstream patterns:** `src/ogc-api/endpoint.ts`, `src/wms/endpoint.ts`, `src/wfs/endpoint.ts` — all use tolerant extraction, none have validators
- **OGC Part 1 spec (23-001):** SamplingFeature requires `sampledFeature@link` — the spec is correct; but enforcement belongs to servers, not client libraries
