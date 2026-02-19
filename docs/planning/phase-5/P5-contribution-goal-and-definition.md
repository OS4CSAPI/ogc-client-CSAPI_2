# Phase 5: Parser Completion — Contribution Goal and Definition

**Version:** 1.0  
**Date:** February 19, 2026

---

## Contribution Goal

Complete the CSAPI parser layer so that every resource returned by a Connected Systems API server is transformed into a typed, field-parsed TypeScript object — not passed through as raw JSON.

The SensorML 3.0, SWE Common 3.0, and Part 1 GeoJSON parsers are fully implemented. The Part 2 resource layer (Datastreams, Observations, Control Streams, Commands, Command Statuses), the Part 1 Property resource, the schema response wrappers, and full recursive SensorML component delegation are not. This work closes those 9 gaps identified by the [Parsing Coverage Audit](../../research/phase-5/parsing-coverage-audit.md), bringing parser coverage from partial to complete across all CSAPI resource types.

---

## Contribution Definition

Implementation of the 9 missing parse functions identified by the Parsing Coverage Audit, consisting of:

**Resource Parsers**
- `parseProperty()` — Transform flat Property JSON into typed `Property` object; parse `validTime` into `TimeInterval`
- `parseDatastream()` — Parse `phenomenonTime` and `resultTime` into `TimeInterval` objects; validate schema references
- `parseObservation()` — Parse time fields; expand cross-references (`foi@id`, `datastream@id`); handle `result` field with SWE Common schema-aware parsing via existing `validateAgainstSchema()`
- `parseControlStream()` — Parse time fields into `TimeInterval`; validate control schema references
- `parseCommand()` — Parse `executionTime` into `TimeInterval`; handle command parameters
- `parseCommandStatus()` — Parse `executionTime` into `TimeInterval`; normalize `statusCode`; expand `command@id` cross-reference

**Schema Response Parsers**
- `parseDatastreamSchemaResponse()` — Parse `{ obsFormat, resultSchema }` wrapper returned by `/datastreams/{id}/schema`; delegate `resultSchema` to existing SWE Common parser
- `parseControlStreamSchemaResponse()` — Parse `{ commandFormat, commandSchema }` wrapper returned by `/controlstreams/{id}/schema`; delegate `commandSchema` to existing SWE Common parser
- Two new TypeScript interfaces: `DatastreamSchemaResponse` and `ControlStreamSchemaResponse`

**Recursive Delegation Fix**
- Update `parseComponentEntry()` in `physical-system.ts` and `aggregate-process.ts` to delegate to `parseSensorML30()` instead of only recursing for their own type — enabling all 4 SensorML process types to be parsed when embedded as inline components

**Quality Standards**
- Unit tests for each new parse function with fixtures derived from real server responses
- TypeScript type safety — all parse functions return their declared interface type, no `any` or `unknown` in output
- JSDoc documentation for all public parse functions
- Consistent patterns with existing parsers (SensorML, SWE Common, GeoJSON) — same error handling, same field transformation conventions, same tolerant extraction philosophy
- >80% code coverage on new parser files

**Deliverables**
- 6 resource parse functions + 2 schema response parse functions + 1 delegation fix (2 files)
- 2 new TypeScript interfaces (schema response wrappers)
- Integration wiring into `parseCollectionResponse()` pipeline
- Corresponding test files with fixture-based unit tests
- Estimated ~300-500 lines of implementation, ~400-600 lines of tests
