# Phase 5: Parser Completion — Task Package

**Version:** 1.0  
**Date:** February 19, 2026  
**Status:** Draft — Pending Review  
**Scope:** Parser gap work only (9 items from Parsing Coverage Audit)

---

## Purpose

This document packages a single task: **create three planning documents for the Phase 5 parser completion work.** It defines what each document must contain, which reference document it mirrors, and what scope constraints apply. No implementation, no code changes, no GitHub issues — just three documents.

---

## Background

The [Parsing Coverage Audit](../../research/phase-5/parsing-coverage-audit.md) identified **9 gaps** in our parser layer:

| # | Gap | Category |
|---|-----|----------|
| 1 | `parseProperty()` | Missing Part 1 non-GeoJSON resource parser |
| 2 | `parseDatastream()` | Missing Part 2 resource parser |
| 3 | `parseObservation()` | Missing Part 2 resource parser |
| 4 | `parseControlStream()` | Missing Part 2 resource parser |
| 5 | `parseCommand()` | Missing Part 2 resource parser |
| 6 | `parseCommandStatus()` | Missing Part 2 resource parser |
| 7 | `parseDatastreamSchemaResponse()` | Missing schema response parser |
| 8 | `parseControlStreamSchemaResponse()` | Missing schema response parser |
| 9 | SensorML recursive sub-parser delegation | Incomplete — fix in 2 files (`physical-system.ts`, `aggregate-process.ts`) |

**Current behavior:** `parseCollectionResponse<T>()` extracts items from collection envelopes but passes inner objects through as raw untyped JSON. Time fields that should be `TimeInterval` objects remain raw `[start, end]` arrays. Cross-reference fields use abbreviated notation. No field-level transformation or validation occurs for Part 2 resources or Property.

**What is NOT in scope:** QueryBuilder methods, URL building, format detection, GeoJSON handler extensions, SWE Common parsers, SensorML parsers (all complete), collection envelope handling (complete), content negotiation, integration tests, or any other work outside the 9 parser gaps listed above.

---

## Deliverables

Three documents, all placed in `docs/planning/phase-5/`:

### Document 1: Contribution Goal and Definition

**Filename:** `contribution-goal-and-definition.md`  
**Reference:** [`docs/planning/contribution-goal-and-definition.md`](../contribution-goal-and-definition.md) (Version 1.1, 65 lines)

**Structure to follow:**
1. **Header block** — Version, Date
2. **Contribution Goal** — 1-2 paragraphs stating what the parser completion work achieves and why it matters
3. **Contribution Definition** — Scoped breakdown with these subsections:
   - **Resource Parsers** — The 6 missing resource parse functions (Property, Datastream, Observation, ControlStream, Command, CommandStatus), what each does (time field parsing, cross-reference expansion, type-safe output)
   - **Schema Parsers** — The 2 missing schema response parsers (datastream schema, controlstream schema), what they wrap
   - **Recursive Delegation Fix** — The 1 fix in 2 files, what it corrects
   - **Quality Standards** — Test coverage expectations, TypeScript safety, JSDoc, consistency with existing parser patterns (SensorML, SWE Common, GeoJSON)
   - **Deliverables** — Estimated file count, line count, test file count

**Scope constraints:**
- Must reference ONLY the 9 parser gaps — no QueryBuilder, no URL building, no format detection
- Must reference the audit as the source of truth for gap definitions
- Tone and density should match the reference document (concise, factual, no narrative)
- Estimated line count: ~50-80 lines

---

### Document 2: Implementation Guide

**Filename:** `parser-completion-implementation-guide.md`  
**Reference:** [`docs/planning/csapi-implementation-guide.md`](../csapi-implementation-guide.md) (Version 7.0, 4,715 lines)

**Structure to follow:**
1. **Header block** — Version, Date, Table of Contents
2. **Executive Summary** — What this guide covers (parser completion only), relationship to the main implementation guide, what is NOT covered
3. **Architecture Context** — Where the new parsers fit in the existing format handler architecture (`src/ogc-api/csapi/formats/`), relationship to existing parsers (SensorML, SWE Common, GeoJSON), how they integrate with `parseCollectionResponse()`
4. **Resource Parser Implementation** — One section per missing parser:
   - **parseProperty()** — Input shape, output interface (`Property`), field transformations (`validTime` → `TimeInterval`), no GeoJSON wrapping
   - **parseDatastream()** — Input shape, output interface (`Datastream`), time field parsing (`phenomenonTime`, `resultTime`), schema reference handling
   - **parseObservation()** — Input shape, output interface (`Observation`), time fields, `result` field with SWE Common schema-aware handling, cross-references (`foi@id`, `datastream@id`)
   - **parseControlStream()** — Input shape, output interface (`ControlStream`), time fields, control schema reference
   - **parseCommand()** — Input shape, output interface (`Command`), `executionTime` parsing, parameter handling
   - **parseCommandStatus()** — Input shape, output interface (`CommandStatus`), `executionTime`, `statusCode`, `command@id` cross-reference
5. **Schema Response Parsers** — `parseDatastreamSchemaResponse()` and `parseControlStreamSchemaResponse()`, wrapper format, relationship to SWE Common parser
6. **Recursive Delegation Fix** — What `parseComponentEntry()` currently does, what it should do (delegate to `parseSensorML30()`), both affected files, expected behavior change
7. **Integration Points** — How `parseCollectionResponse()` calls the new parsers, how the response pipeline changes
8. **Testing Strategy** — Test patterns for each parser (input fixtures, expected output, edge cases), relationship to existing test files
9. **Smoke Test Cross-References** — Relevant findings from the server quirks reference (F38 command status cross-references, F45 envelope variance, etc.)

**Scope constraints:**
- Must cover ONLY the 9 parser gaps — no QueryBuilder implementation, no new URL patterns
- Should reference existing parser implementations as patterns to follow (e.g., "follow the same structure as `parsePhysicalSystem()`")
- Should reference the existing model interfaces (they already exist — no new interfaces needed except the 2 schema response interfaces)
- Must include real JSON examples where possible (from fixtures or smoke test observations)
- Estimated line count: ~400-800 lines (much shorter than the 4,715-line main guide because scope is narrow)

---

### Document 3: Roadmap

**Filename:** `ROADMAP.md`  
**Reference:** [`docs/planning/ROADMAP.md`](../ROADMAP.md) (Version 3.4, 795 lines)

**Structure to follow:**
1. **Header block** — Version, Date
2. **Executive Summary** — Total estimated hours, number of tasks, what this covers (parser completion only)
3. **Task Ordering Rationale** — Why tasks are ordered the way they are (dependencies, complexity progression)
4. **Tasks** — Each task as a numbered item with:
   - Task name
   - Estimated time (hours)
   - Complexity rating (Low / Medium / Medium-High)
   - What to implement (function signature, file location, field transformations)
   - What to test (specific test cases, fixture references)
   - Dependencies on other tasks (if any)
5. **Deliverables Summary** — Total files, total lines, total test lines

**Suggested task breakdown** (to be refined during drafting):

| # | Task | Estimated Scope |
|---|------|----------------|
| 1 | `parseProperty()` + tests | Simplest — flat SWE Common object, single time field |
| 2 | `parseDatastream()` + tests | Two time fields, schema reference |
| 3 | `parseObservation()` + tests | Time fields, cross-references, SWE Common result |
| 4 | `parseControlStream()` + tests | Time fields, control schema reference |
| 5 | `parseCommand()` + tests | `executionTime`, parameter handling |
| 6 | `parseCommandStatus()` + tests | `executionTime`, `statusCode`, `command@id` |
| 7 | `parseDatastreamSchemaResponse()` + `parseControlStreamSchemaResponse()` + tests | Wrapper parsers, new interfaces |
| 8 | SensorML recursive delegation fix + tests | 2-file fix, delegate to `parseSensorML30()` |
| 9 | Integration wiring — connect parsers to `parseCollectionResponse()` pipeline | Glue code, end-to-end test |

**Scope constraints:**
- Must cover ONLY the 9 parser gaps
- Time estimates should be realistic for the narrow scope (these are parsers, not full resource handlers)
- Should reference the audit's gap descriptions as task definitions
- Should note that model interfaces already exist (no type system work needed, except 2 schema response interfaces)
- Should explicitly state what is NOT included (everything from the main ROADMAP that is already done)
- Estimated line count: ~150-300 lines (much shorter than the 795-line main roadmap)

---

## Source Documents

| Document | Location | Role |
|----------|----------|------|
| Parsing Coverage Audit | [`docs/research/phase-5/parsing-coverage-audit.md`](../../research/phase-5/parsing-coverage-audit.md) | Source of truth for the 9 gaps |
| Contribution Goal (reference) | [`docs/planning/contribution-goal-and-definition.md`](../contribution-goal-and-definition.md) | Structural template for Document 1 |
| Implementation Guide (reference) | [`docs/planning/csapi-implementation-guide.md`](../csapi-implementation-guide.md) | Structural template for Document 2 |
| ROADMAP (reference) | [`docs/planning/ROADMAP.md`](../ROADMAP.md) | Structural template for Document 3 |
| Server Quirks Reference | [`docs/implementation/server-quirks-reference.md`](../../implementation/server-quirks-reference.md) | Cross-reference for smoke test findings relevant to parser behavior |
| Documentation Inventory | [`docs/research/phase-5/documentation-inventory.md`](../../research/phase-5/documentation-inventory.md) | Full catalog of existing documentation |

---

## Constraints

1. **Parser gaps only.** All three documents must be scoped exclusively to the 9 items from the Parsing Coverage Audit. No QueryBuilder methods, no URL building, no format detection, no GeoJSON extensions, no SWE Common parser additions, no SensorML parser additions beyond the recursive delegation fix.

2. **Mirror the reference documents.** Each document should match the tone, structure, and density of its reference counterpart — not longer where unnecessary, not shorter where detail is needed.

3. **No implementation.** This task package produces documents, not code. The documents themselves describe future implementation, but creating the documents is the only action.

4. **Audit is the source of truth.** Gap definitions, interface names, file locations, and current behavior descriptions should come from the Parsing Coverage Audit, not be re-derived.

5. **Existing interfaces.** The model interfaces for all 6 resource types already exist in the codebase. The only new interfaces needed are the 2 schema response wrapper types (DatastreamSchemaResponse, ControlStreamSchemaResponse).

---

## Acceptance Criteria

- [ ] Three documents created in `docs/planning/phase-5/`
- [ ] Each document follows the structure outlined above
- [ ] Each document is scoped exclusively to the 9 parser gaps
- [ ] Each document references the Parsing Coverage Audit as its source
- [ ] No code changes, no GitHub issues, no implementation included
- [ ] All three documents committed and pushed to main
