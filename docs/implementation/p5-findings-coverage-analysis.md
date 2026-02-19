# Phase 5 Findings Coverage Analysis

**Date:** February 19, 2026  
**Purpose:** Cross-reference smoke test findings flagged as "fixable issues" within CSAPI client library scope against the Phase 5 ROADMAP to identify what is covered and what remains.  
**Source Documents:**
- [P5 ROADMAP v1.1](../planning/phase-5/P5-ROADMAP.md)
- [Smoke Test #19 (Post Phase 4.1)](live-server-smoke-test-post-phase-4.1.md)
- [Server Quirks Reference](server-quirks-reference.md)

---

## Findings Under Review

The following findings were assessed as being within scope and lane for the CSAPI client library contribution — i.e., they are "fixable issues" from the library's perspective:

| Finding | Description | Category |
|---------|-------------|----------|
| P4-F2 | OSH PUT rejects uid changes — stricter than documented | CRUD correctness |
| F82 | OSH items envelope sometimes has no `links` key | Pagination / envelope handling |
| F5 | Missing pagination metadata (`numberMatched`/`numberReturned`) | Pagination handling |
| P4-F1 | Command POST hangs — connection never returns | CRUD / command lifecycle |
| F84 | 52N procedure `featureType: sosa:Sensor` misclassified as System | Classification |
| F14 | Properties not discoverable via any link detection convention | Discovery / link scanning |
| F27 | Observation `foi@id` abbreviated notation | Part 2 data shape |
| F30 | ControlStream `system@link` cross-reference | Part 2 data shape |
| F31 | Command entity data shape (`controlstream@id`) | Part 2 data shape |
| F33 | ControlStream schema returns SWE DataRecord (`commandFormat`/`parametersSchema`) | Part 2 data shape |
| F38 | CommandStatus data shape (`command@id`, `reportTime`, `statusCode`, `executionTime`) | Part 2 data shape |

---

## What the P5 ROADMAP Covers

The P5 ROADMAP is scoped to **9 parser gaps** — building parse functions that transform raw JSON into typed TypeScript objects for 6 resource types, 2 schema response types, and 1 recursive delegation fix. It covers **5 of the 11 findings** above:

| Finding | What P5 Covers | P5 Task | GitHub Issue |
|---------|----------------|---------|--------------|
| **F27** | `parseObservation()` handles the `foi@id` field shape tolerantly | Task 3 | [#81](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/81) |
| **F30** | `parseControlStream()` extracts fields from this data shape | Task 4 | [#82](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/82) |
| **F31** | `parseCommand()` models this data shape | Tasks 5a/5b | [#83](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/83), [#84](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/84) |
| **F33** | `parseControlStreamSchemaResponse()` handles `commandFormat`/`parametersSchema` variant | Task 7b | [#87](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/87) |
| **F38** | `parseCommandStatus()` models `command@id`, `reportTime`, `statusCode`, `executionTime` | Task 6 | [#85](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/85) |

These 5 findings (F27, F30, F31, F33, F38) are **directly addressed** by Phase 5 — they are the data shapes the parsers are being built to handle.

---

## What Remains After P5

Six findings are **not covered** by the P5 ROADMAP:

| Finding | Description | Why Not in P5 | Current Status (ST#19) | Recommended Target |
|---------|-------------|---------------|------------------------|-------------------|
| **P4-F2** | OSH PUT rejects uid changes | CRUD/write-path concern, not a parser gap | Moderate — new Phase 4 finding | Phase 4.2 |
| **F82** | OSH items envelope sometimes omits `links` | Already mitigated — `parseCollectionResponse()` defaults to `[]` | Confirmed Low — no code change needed | None (resolved) |
| **F5** | Missing pagination metadata | Pagination metadata handling is beyond parser completion scope | Deferred | TBD |
| **P4-F1** | Command POST hangs (OSH holds connection open) | CRUD/write-path concern — needs timeout strategy or SSE-aware handler | Moderate — new Phase 4 finding | Phase 4.2 |
| **F84** | 52N procedure misclassification (`sosa:Sensor`) | Upstream server bug — filed as [Issue #16](https://github.com/52North/connected-systems-pygeoapi/issues/16) on 52North. Client-side workaround (endpoint-context classification) would be a separate issue | Deferred — still present | Separate issue |
| **F14** | Properties not discoverable via links | Discovery/link-scanning concern, not a parser gap. `parseProperty()` (Task 1) is in P5, but the discoverability problem is separate | Deferred | Separate issue |

### Disposition Summary

| Category | Count | Findings |
|----------|-------|----------|
| **Covered by P5** | 5 | F27, F30, F31, F33, F38 |
| **Phase 4.2 CRUD concerns** | 2 | P4-F1, P4-F2 |
| **Already mitigated (no action needed)** | 1 | F82 |
| **Deferred — needs separate issue** | 3 | F5, F14, F84 |
| **Total** | **11** | |

---

## Observations

1. **Phase 5 cleanly addresses the Part 2 data shape findings.** All 5 data shape findings (F27, F30, F31, F33, F38) map directly to parser tasks in the P5 ROADMAP. Once Phase 5 is complete, the library will have typed parse functions for every CSAPI resource shape observed in smoke testing.

2. **The two Phase 4 findings (P4-F1, P4-F2) are CRUD concerns.** They were discovered during Smoke Test #19's first CRUD testing pass and are already targeted for Phase 4.2 in the ST#19 verdict. They are write-path issues, not read-path/parsing issues.

3. **F82 requires no further action.** The `parseCollectionResponse()` function already defaults `links` to an empty array when the key is absent. This was confirmed as "Low" severity in ST#19.

4. **Three findings (F5, F14, F84) remain deferred.** Each would need its own scoped issue:
   - **F5 (pagination):** Would require enhancing how the library surfaces `numberMatched`/`numberReturned` to consumers.
   - **F14 (properties discovery):** Would require a fallback/probing strategy for resource types servers implement but don't advertise via links.
   - **F84 (procedure misclassification):** The upstream fix is pending on 52North. A client-side workaround using endpoint-context classification is possible but would be CSAPI-specific scope.
