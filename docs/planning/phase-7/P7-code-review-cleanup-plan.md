# Phase 7: Code Review Cleanup — Plan

**Version:** 1.0
**Date:** March 7, 2026
**Status:** Ready for Execution
**Scope:** Resolve 17 open issues (11 code-review findings + 6 pre-existing bugs) across 16 steps

---

## Executive Summary

This plan covers the execution of **Phase 7: Code Review Cleanup** — resolving all actionable findings from the senior developer's code review of the `clean-pr` draft PR (#136) plus 6 pre-existing open issues that overlap with the same files. The work is organized into **6 sequential phases (16 steps)** and resolves **17 issues total** (with #111 auto-resolved by #145 at zero extra cost).

**What this covers:**

- 11 code-review findings (#141–#151) identified by the senior developer
- 6 pre-existing open issues (#98, #100, #102, #111, #139, #140) bundled because they affect the same files
- Type safety fixes, DRY refactors, security hardening, test cleanup

**What this does NOT cover:**

- Upstream-only findings 001 and 002 (tracked in `docs/code-review/upstream-findings-report.md`)
- Issue #110 (new `@link` resolution utilities — deferred, see `docs/code-review/110-deferred-enhancement-link-resolution-utilities.md`)
- Any changes to upstream code we did not author

**Key constraints:**

- All changes must be within `src/ogc-api/csapi/` (upstream isolation requirement per jahow's PR #136 comment)
  - Exception: #141 touches `endpoint.ts` (upstream file we modified) — minimal diff only
- Zero public API signature changes unless explicitly required by the issue
- All tests must pass after each step
- Review `docs/governance/AI_OPERATIONAL_CONSTRAINTS.md` before starting implementation

---

## Issue Inventory

### Code Review Findings (must fix)

| # | Finding | Category | Primary File | Severity |
|---|---------|----------|-------------|----------|
| #141 | `parseCollectionResponse` casts raw JSON to `T[]` without validation | Type Safety | `endpoint.ts` | P1 |
| #142 | `subPath` appended without encoding or type constraint | Type Safety + Security | `url_builder.ts` | P2 |
| #143 | `extractCSAPIFeature` casts `properties` without null check | Type Safety | `geojson.ts` | P2 |
| #144 | SensorML parsers spread raw JSON into typed results | Type Safety | `sensorml.ts` | P2 |
| #145 | `assertResourceAvailable()` + `buildResourceUrl()` repeated 90× | DRY / Architecture | `url_builder.ts` | P2 |
| #146 | `parseDatastream` / `parseControlStream` ~30 lines duplicated | DRY / Architecture | `part2.ts` | P2 |
| #147 | `scanCsapiLinks()` no URL scheme validation | Security | `helpers.ts` | P3 |
| #148 | Redundant `as Record` casts after `isRecord` narrowing | Code Quality | `parser.ts`, `data-array.ts` | P3 |
| #149 | Null-guard + cast boilerplate duplicated 5× | Code Quality | `part2.ts` | P3 |
| #150 | `createCommand()` / `createCommands()` byte-identical | DRY | `url_builder.ts` | P3 |
| #151 | Collection fixture factory duplicated in 4 test files | Code Quality | `integration/*.spec.ts` | P3 |

### Pre-existing Issues (bundled — same files)

| # | Title | Category | Primary File | Why Include |
|---|-------|----------|-------------|-------------|
| #98 | `parseCommandStatus` `@see` link precision (F18) | Documentation | `part2.ts` | Same file as #146, #149; trivial |
| #100 | `assertResourceAvailable()` overly strict for per-ID methods | Bug | `url_builder.ts` | Must precede #145 |
| #102 | Command/observation CRUD need nested parent IDs | Bug | `url_builder.ts` | Must precede #145 |
| #111 | `getCommandStatus()` string concatenation (F45) | Bug | `url_builder.ts` | Auto-resolved by #145 |
| #139 | `getDeploymentSystems()` builds non-standard URL | Bug | `url_builder.ts` | Same file; independent fix |
| #140 | `parseControlStreamSchemaResponse()` drops `paramsSchema` | Bug | `part2.ts` | Same file; data loss bug |

### Excluded

| # | Title | Reason | Details |
|---|-------|--------|---------|
| 001 | Path traversal via unencoded `itemId` | Upstream-only | See `docs/code-review/upstream-findings-report.md` |
| 002 | Query param injection via `encodeURI` | Upstream-only | See `docs/code-review/upstream-findings-report.md` |
| #110 | `@link` / `@id` resolution utilities | New functionality | See `docs/code-review/110-deferred-enhancement-link-resolution-utilities.md` |

---

## Execution Plan

### Phase A: Zero-Risk Quick Wins

Low-risk changes that build confidence and establish that the test suite is green.

#### Step 1 — Issue #98: Fix `@see` link precision in `parseCommandStatus`

- **File:** `src/ogc-api/csapi/formats/part2.ts`
- **Action:** Update JSDoc `@see` reference to point to the correct spec section
- **Risk:** None — documentation only
- **Validation:** `npm run lint`, visual inspection

#### Step 2 — Issue #148: Remove redundant `as Record` casts in SWE Common parsers

- **Files:** `src/ogc-api/csapi/formats/swecommon/parser.ts`, `src/ogc-api/csapi/formats/swecommon/data-array.ts`
- **Action:** Delete 27 redundant `as Record<string, unknown>` casts that follow `isRecord()` / `isLinkReference()` narrowing
- **Risk:** None — TypeScript has already narrowed the types
- **Validation:** `tsc --noEmit`, `npm test`

---

### Phase B: `part2.ts` Batch (Parser Cleanup)

All changes in a single file. Run tests once at the end of the batch.

#### Step 3 — Issue #149: Extract `requireObject` helper

- **File:** `src/ogc-api/csapi/formats/part2.ts`
- **Action:** Create private `requireObject(json, fn)` function; replace 5 inline null-guard + cast blocks with one-liner calls
- **Risk:** None — identical behavior, just consolidated
- **Validation:** `npm test`

#### Step 4 — Issue #146: Extract `parseBaseStream` helper

- **File:** `src/ogc-api/csapi/formats/part2.ts`
- **Action:** Create private `parseBaseStream(fn, json)` extracting 7 shared fields (`id`, `name`, `description`, `validTime`, `formats`, `systemId`, `links`); update `parseDatastream()` and `parseControlStream()` to spread `base` and add only resource-specific fields
- **Risk:** Low — internal refactor, no public API change
- **Depends on:** Step 3 (null guard now in `requireObject`, called by `parseBaseStream`)
- **Validation:** `npm test`

#### Step 5 — Issue #140: Fix `paramsSchema` data loss

- **File:** `src/ogc-api/csapi/formats/part2.ts`
- **Action:** Update `parseControlStreamSchemaResponse()` to accept `paramsSchema` (alias used by older OSH servers) in addition to `commandSchema`
- **Risk:** Low — additive, handles a field that was previously silently dropped
- **Validation:** `npm test` + manual check against OSH server response fixture

---

### Phase C: Type Safety Fixes

Fixes across separate files. Each step can be validated independently.

#### Step 6 — Issue #141: Add element validation to `parseCollectionResponse`

- **File:** `src/ogc-api/endpoint.ts` (upstream file we modified)
- **Action:** Add runtime validation before casting `items` array elements to `T[]` — verify each element is a non-null object before passing to the parser callback
- **Risk:** Low — minimal diff to upstream file
- **Validation:** `npm test`

#### Step 7 — Issue #143: Add null check to `extractCSAPIFeature`

- **File:** `src/ogc-api/csapi/formats/geojson.ts`
- **Action:** Add null/type check before casting `feature.properties` to `Record<string, unknown>`
- **Risk:** Low — defensive guard, no behavioral change for valid input
- **Validation:** `npm test`

#### Step 8 — Issue #144: Fix SensorML raw JSON spread

- **File:** `src/ogc-api/csapi/formats/sensorml.ts`
- **Action:** Replace `...json` spread (which passes through all raw JSON properties unfiltered) with explicit field extraction for each typed property
- **Risk:** Low-Medium — more invasive change, but isolated to one file
- **Validation:** `npm test` + review output against SensorML fixtures

---

### Phase D: `url_builder.ts` Batch (The Big One)

This is the highest-value, highest-effort batch. The dependency chain is: #142 → #139 → #100 → #102 → #145 → #150. Each step builds on the previous.

#### Step 9 — Issue #142: Encode/constrain `subPath` in `buildResourceUrl`

- **File:** `src/ogc-api/csapi/url_builder.ts`
- **Action:** Add type constraint or encoding to the `subPath` parameter in `buildResourceUrl()` to prevent unencoded `/`-delimited strings from being injected
- **Risk:** Low — fixes the foundation before refactoring callers
- **Validation:** `npm test`

#### Step 10 — Issue #139: Fix `getDeploymentSystems()` non-standard URL

- **File:** `src/ogc-api/csapi/url_builder.ts`
- **Action:** Fix URL construction — `deployedSystems` is an inline GeoJSON property, not a sub-resource endpoint per OGC 23-001 Table 43
- **Risk:** Low — independent bug fix
- **Validation:** `npm test`

#### Step 11 — Issue #100: Remove `assertResourceAvailable` from per-ID methods

- **File:** `src/ogc-api/csapi/url_builder.ts`
- **Action:** Remove `assertResourceAvailable()` guard from ~69 per-ID methods where the guard is overly strict (blocks valid URL construction for nested resources)
- **Risk:** Medium — changes behavior for callers who relied on the guard. However, the guard was always incorrect for these methods.
- **Must precede:** Step 13 (#145) — reduces the scope of the `build()` wrapper
- **Validation:** `npm test`

#### Step 12 — Issue #102: Add nested parent ID parameters

- **File:** `src/ogc-api/csapi/url_builder.ts`
- **Action:** Add optional parent ID parameters to command/observation CRUD methods so they can construct nested URLs (e.g., `/controlstreams/{csId}/commands/{cmdId}`)
- **Risk:** Medium — extends method signatures (backward-compatible — new optional params)
- **Must precede:** Step 13 (#145) — finalizes the method signatures before wrapping in `build()`
- **Validation:** `npm test`

#### Step 13 — Issue #145: Add `build()` wrapper (auto-resolves #111)

- **File:** `src/ogc-api/csapi/url_builder.ts`
- **Action:** Add private `build(resourceType, id?, subPath?, options?)` method that fuses `assertResourceAvailable()` and `buildResourceUrl()`. Update all remaining public methods (after #100 removed guards from per-ID methods) to delegate to `build()`.
- **Risk:** Medium — mechanical (many call sites), but pure refactor with no behavioral change
- **Side effect:** Auto-resolves #111 (`getCommandStatus()` concatenation deviation disappears)
- **Validation:** `npm test`, verify #111 acceptance criteria met

#### Step 14 — Issue #150: `createCommands` delegates to `createCommand`

- **File:** `src/ogc-api/csapi/url_builder.ts`
- **Action:** Replace `createCommands()` body with `return this.createCommand(controlStreamId)`
- **Risk:** None — trivial after #145
- **Validation:** `npm test`

---

### Phase E: Security Hardening

#### Step 15 — Issue #147: Add URL scheme validation to `scanCsapiLinks`

- **File:** `src/ogc-api/csapi/helpers.ts`
- **Action:** Validate that `href` values stored in the `resourceUrls` map use `http:` or `https:` schemes only — reject `javascript:`, `data:`, `//evil.com` etc.
- **Risk:** Low — defense-in-depth, separate file from everything else
- **Validation:** `npm test`

---

### Phase F: Test-Only Cleanup

#### Step 16 — Issue #151: Extract shared `_fixtures.ts` for integration tests

- **Files:** Create `src/ogc-api/csapi/integration/_fixtures.ts`; modify 4 spec files (`discovery.spec.ts`, `observation.spec.ts`, `command.spec.ts`, `navigation.spec.ts`)
- **Action:** Extract `PADDING` constant, `ALL_CSAPI_LINKS` array, and `makeFullCsapiCollection()` factory into shared fixture file; replace 4 local factories with imports
- **Risk:** None — test-only, zero production impact
- **Validation:** `npm test` (full suite — confirms all 81 integration tests still pass)

---

## Dependency Graph

```
Phase A (independent):
  #98  ───→ done
  #148 ───→ done

Phase B (sequential within part2.ts):
  #149 ───→ #146 ───→ #140 ───→ done

Phase C (independent per file):
  #141 ───→ done
  #143 ───→ done
  #144 ───→ done

Phase D (strict chain in url_builder.ts):
  #142 ───→ #139 ───→ #100 ───→ #102 ───→ #145 (resolves #111) ───→ #150 ───→ done

Phase E (independent):
  #147 ───→ done

Phase F (independent):
  #151 ───→ done
```

---

## Files Touched Summary

| File | Issues | Total Steps |
|------|--------|-------------|
| `src/ogc-api/csapi/formats/part2.ts` | #98, #149, #146, #140 | 4 |
| `src/ogc-api/csapi/url_builder.ts` | #142, #139, #100, #102, #145, #150 | 6 |
| `src/ogc-api/csapi/formats/swecommon/parser.ts` | #148 | 1 |
| `src/ogc-api/csapi/formats/swecommon/data-array.ts` | #148 | 1 |
| `src/ogc-api/csapi/formats/sensorml.ts` | #144 | 1 |
| `src/ogc-api/csapi/formats/geojson.ts` | #143 | 1 |
| `src/ogc-api/csapi/helpers.ts` | #147 | 1 |
| `src/ogc-api/endpoint.ts` | #141 | 1 |
| `src/ogc-api/csapi/integration/_fixtures.ts` | #151 (new) | 1 |
| `src/ogc-api/csapi/integration/discovery.spec.ts` | #151 | 1 |
| `src/ogc-api/csapi/integration/observation.spec.ts` | #151 | 1 |
| `src/ogc-api/csapi/integration/command.spec.ts` | #151 | 1 |
| `src/ogc-api/csapi/integration/navigation.spec.ts` | #151 | 1 |

---

## Validation Gates

After each phase:

1. `tsc --noEmit` — zero type errors
2. `npm test` — all tests pass (1,282+ tests, 29 suites)
3. `npm run lint` — zero lint errors
4. `npx prettier --check src/` — all files formatted

After all phases:

5. Full integration test suite pass
6. Visual diff review of all changes
7. Rebase onto `clean-pr` branch
8. Push to origin

---

## Estimated Effort

| Phase | Steps | Estimated Time | Risk |
|-------|-------|---------------|------|
| A: Quick Wins | 2 | 30 min | None |
| B: `part2.ts` Batch | 3 | 1–2 hours | Low |
| C: Type Safety | 3 | 1–2 hours | Low–Med |
| D: `url_builder.ts` Batch | 6 | 3–5 hours | Medium |
| E: Security Hardening | 1 | 30 min | Low |
| F: Test Cleanup | 1 | 30 min–1 hour | None |
| **Total** | **16** | **6–11 hours** | |

---

## Post-Phase 7

After this cleanup is complete and the PR is updated:

- **#110** — `@link` / `@id` resolution utilities — first enhancement, separate PR
- **001, 002** — Upstream security fixes — coordinate with camptocamp maintainer, separate PR
