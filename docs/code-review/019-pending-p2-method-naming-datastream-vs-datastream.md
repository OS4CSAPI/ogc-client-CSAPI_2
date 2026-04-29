---
status: pending
priority: p2
issue_id: '019'
tags: [code-review, api-design, naming]
dependencies: []
phase: 8
blocking-decision: true
---

# `DataStream` (Methods) vs `Datastream` (Types and Parsers) Naming Split

## Problem Statement

The CSAPI public surface uses two different capitalizations of "datastream"
across closely related identifiers:

- **Methods (camelCase, capital S):** `getDataStream`, `getDataStreams`,
  `createDataStream`, `updateDataStream`, `deleteDataStream`,
  `getDataStreamSchema`, `getDataStreamObservations`,
  `getDataStreamSystems`, `getDataStreamProcedures`, `getDataStreamHistory`,
  `getSystemDataStreams`, `createDataStreamForSystem`,
  `getProcedureDataStreams`.
- **Types and parsers (lowercase s):** `Datastream`, `DatastreamCollection`,
  `DatastreamQueryOptions`, `DatastreamSchemaResponse`,
  `parseDatastream`, `parseDatastreamSchemaResponse`, and the resource type
  constant `'datastreams'`.

A consumer who calls `builder.getDataStream('id')` and then searches for
`parseDataStream` will not find it — the parser is `parseDatastream`. The OGC
spec writes "Datastream" as one word, which matches the type/parser side.

`ControlStream` is consistent: methods, types, and parsers all use
`ControlStream` (capital S). Only `DataStream`/`Datastream` has the split.

## Findings

**Files:**

- `src/ogc-api/csapi/url_builder.ts` — all method names use `DataStream`
- `src/ogc-api/csapi/model.ts` — types use `Datastream`
- `src/ogc-api/csapi/formats/part2.ts` — parsers use `parseDatastream`
- `src/ogc-api/csapi/index.ts` — exports both spellings

13 method names use `DataStream`. 8+ types/parsers/constants use `Datastream`.

## Proposed Solutions

### Option A: Rename methods to `Datastream` (Recommended if breaking changes still allowed)

Rename all 13 builder methods from `*DataStream*` to `*Datastream*`. Aligns
with the OGC spec, the type names, the parser names, and the resource constant.
Single coherent spelling everywhere.

**Effort:** Mechanical (rename + update all call sites in tests + integration specs)
**Risk:** Breaking change to public API surface

### Option B: Add aliased methods + deprecate the camelcase ones

Keep the current `DataStream` methods as `@deprecated` and add `Datastream`
versions that delegate. Non-breaking but doubles the surface.

**Effort:** Small | **Risk:** Low | **Cost:** Public-surface bloat

### Option C: Status quo

Document the split as a known wart. Cheapest, but the reviewer correctly
identifies it as the most legitimate consistency finding in the report.

## Ownership Assessment

100% ours — all naming is in `src/ogc-api/csapi/`.

## Decision Needed

**Can we still make breaking public-API changes on `clean-pr` before upstream
merge?**

- If **yes** → Option A (rename).
- If **no** → Option B (alias + deprecate).
- Option C only if neither A nor B is acceptable.

## Triage

**Accept — Phase 8.** Approach (A vs B) blocked on the decision above.
