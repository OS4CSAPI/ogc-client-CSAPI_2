# Research Plan 06: Endpoint Decoupling Architecture (Design Synthesis)

> **Plan 6 of 8** | **Phase 6 — Upstream Acceptance Refactoring**

---

## Metadata

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Plan Type** | Design synthesis |
| **Date Created** | 2026-02-23 |
| **Last Updated** | 2026-02-23 |
| **Estimated Time** | 3–4 hours |
| **Actual Time** | — |
| **Depends On** | 02, 03, 04, 05 |
| **Blocks** | 08 (File-Level Changelist and Commit Strategy) |
| **Strategy Reference** | [research-strategy.md § Plan 06](../research-strategy.md) |

---

## 1. Research Objective

Synthesize all prior research into a concrete architecture for decoupling CSAPI from `endpoint.ts`, producing a complete design with class diagrams, data flow, factory function signatures, before/after code comparison, and boundary condition verification for every design choice. The deliverable is a detailed architectural document that specifies how CSAPI will be extracted into a separately-importable sub-module, how the consumer API will be shaped, how the module boundary will be enforced, and how all four boundary conditions are satisfied.

---

## 2. Sequencing Rationale

### Why Plan 6?

This is the critical design plan — every consequential decision lives here. It is now informed by five prior plans: build system mechanics (01), EDR precedent (02), entry point patterns (03), industry API patterns (04), and TypeScript decoupling patterns (05). Plan 06 cannot begin until Plans 02–05 are complete, as it must synthesize their findings into a single architectural solution. The output of this plan is the blueprint for implementation and the basis for the file-level changelist in Plan 08.

### Dependency Chain

- **Builds on:**
  - **Plan 02:** EDR integration pattern analysis — how EDR is decoupled from endpoint, what patterns are proven
  - **Plan 03:** Separate entry point design — how sub-path exports are configured, barrel file structure
  - **Plan 04:** Industry API patterns — what consumer API shapes are proven, what coupling levels are viable
  - **Plan 05:** Module decoupling patterns — coupling level analysis, structural typing implications, module boundary enforcement
- **Feeds into:**
  - **Plan 08:** File-Level Changelist and Commit Strategy — needs the architectural blueprint to produce the exact changelist and commit sequence

---

## 3. Boundary Conditions

### Non-Negotiable Constraints

1. **No CSAPI in root exports (Constraint 1):** Nothing from `src/ogc-api/csapi/` shall appear in the root `index.ts`. All CSAPI exports must move to the `./csapi` barrel file.
2. **Separate entry point (Constraint 2):** CSAPI must be importable via `@camptocamp/ogc-client/csapi`. The architecture must support this separation.
3. **No outward imports (Constraint 3):** Nothing outside `src/ogc-api/csapi/` should import from the CSAPI module. The endpoint must not import `CSAPIQueryBuilder` or `scanCsapiLinks`.
4. **One-way dependency (Constraint 4):** The core module must not depend on CSAPI code. Dependency direction is strictly CSAPI → core, never core → CSAPI.
5. **CI compliance:** All architectural changes must pass Prettier formatting, TypeScript type checking, ESLint linting, browser tests, and Node.js tests.

### Excluded From Scope

- **Plugin registration, mixin injection, decorator patterns:** Excluded per boundary conditions. These require core to know about the sub-module (violates constraints 3 and 4).
- **Shared barrel exports:** Excluded — violates constraint 1.
- **Runtime dependency injection containers:** Over-engineered for a library, not applicable.
- **Build system mechanics:** Covered in Plans 01 and 03.
- **Consumer API shape decisions not supported by industry precedent:** Only patterns proven in Plan 04 are considered.

### What Remains Open

- The exact consumer API shape: `new CSAPIClient(endpoint)` vs `CSAPIClient.fromEndpoint(endpoint)` vs `createCSAPIClient({baseUrl, conformance})` vs standalone functions
- The coupling level: concrete class, explicit interface, data record, or individual parameters
- The placement of `hasConnectedSystems` and `csapiCollections`: endpoint or CSAPI module
- The handling of shared types: `OgcApiCollectionInfo`, `OgcApiDocumentLink`, `EndpointError`
- The placement and implementation of `scanCsapiLinks`: duplicated, moved, or replaced
- The migration of CSAPI tests from `endpoint.spec.ts` to CSAPI's test suite
- The before/after code comparison for all affected files

---

## 4. Research Questions

### Core Questions

1. What is the optimal architecture for decoupling CSAPI from `endpoint.ts` given all boundary conditions and prior research findings?
2. What consumer API shape and coupling level best fit our constraints and industry precedent?
3. How should the module boundary be enforced to guarantee one-way dependency and zero outward imports?
4. How should shared utilities and types (e.g., `scanCsapiLinks`, `OgcApiCollectionInfo`) be handled to avoid constraint violations?
5. What is the migration plan for tests and documentation?

### Detailed Questions

#### Consumer API Shape and Coupling Level (8 questions)

1. Which consumer API pattern (constructor, factory, static method, standalone function) is recommended by Plan 04 and feasible given Plan 05's coupling analysis?
2. What data does CSAPI actually need from the endpoint? Can it be provided via public API without violating constraints?
3. What coupling level (concrete class, interface, data record, parameters) best balances ergonomics, constraint compliance, and migration effort?
4. How does the recommended pattern compare to the current `endpoint.csapi(collectionId)` API? What changes are required?
5. How does the recommended pattern handle asynchronous data flows (collection document, root resource URLs, conformance classes)?
6. How does the recommended pattern affect IDE discoverability and developer experience?
7. What is the migration effort from the current API to the recommended pattern?
8. How does the recommended pattern affect testability and isolation of CSAPI?

#### Module Boundary Enforcement (7 questions)

9. How should the module boundary be enforced? (Barrel file structure, `package.json` `"exports"`, ESLint rules, project references)
10. How should CSAPI exports be curated in the `./csapi` barrel file? Should all symbols be exported, or only a curated public API?
11. How should internal-only CSAPI types be handled? (`@internal` tags, private modules, exclusion from barrel)
12. How should shared types be imported? (`import type` from core, re-declaration, or shared types module)
13. How should `scanCsapiLinks` be handled? (Duplicate, move, inline, expose from CSAPI barrel)
14. How should the migration be verified? (`git grep`, static analysis, CI checks)
15. How should tree-shaking and bundler compatibility be ensured?

#### Test and Documentation Migration (5 questions)

16. Which CSAPI tests in `endpoint.spec.ts` need to move to CSAPI's test suite? What is the migration plan?
17. How should documentation be updated to reflect the new architecture? (README, API docs, code comments)
18. How should before/after code comparisons be documented for PR reviewers?
19. How should the migration be staged? (One-shot vs incremental, feature flags, branch-by-abstraction)
20. How should the migration be verified for completeness? (Import graphs, CI checks, manual review)

**Total: 20 detailed questions**

---

## 5. Sources

### Primary Sources (In Workspace)

| Source | Path | What to Extract |
|--------|------|-----------------|
| Current CSAPI integration | `src/ogc-api/endpoint.ts` (lines 1–55, 385–413) | Current imports, `csapi()` method, data flow, constraint violations |
| CSAPIQueryBuilder constructor | `src/ogc-api/csapi/url_builder.ts` (lines 106–180) | What data the builder needs, current structural typing pattern |
| scanCsapiLinks utility | `src/ogc-api/csapi/helpers.ts` (lines 129–170) | Shared utility problem, current usage in endpoint and CSAPI |
| Core model types | `src/ogc-api/model.ts` (lines 85–155) | Shared types crossing the module boundary |
| CSAPI model types | `src/ogc-api/csapi/model.ts` | Types exported by CSAPI |
| Root exports | `src/index.ts` (lines 45–252) | Current CSAPI exports that must move to `./csapi` barrel |
| CSAPI tests in endpoint | `src/ogc-api/endpoint.spec.ts` (lines 1–60) | Which tests are CSAPI-specific and need migration |
| EDR pattern | `src/ogc-api/edr/url_builder.ts` | Baseline for decoupling pattern |

### External Sources

| Source | URL/Reference | What to Extract |
|--------|---------------|-----------------|
| TypeScript Handbook — Structural Typing | https://www.typescriptlang.org/docs/handbook/type-compatibility.html | How structural compatibility works, implications for adapter patterns |
| TypeScript Handbook — Module Resolution | https://www.typescriptlang.org/docs/handbook/modules/theory.html | How `import type` works, module boundary semantics |
| Node.js subpath exports documentation | https://nodejs.org/api/packages.html#subpath-exports | Canonical reference for `"exports"` field behavior — context for barrel file design |
| ESLint import boundary rules | https://github.com/import-js/eslint-plugin-import | How to enforce module boundaries via linting |
| Martin Fowler — Refactoring Catalog | https://refactoring.guru/refactoring/catalog | Extract Module, Move Function, Replace Dependency with Interface — migration strategies |

### Prior Research Findings

| Finding | Path | What to Use |
|---------|------|-------------|
| Plan 02 findings | `docs/research/phase-6/findings/02-edr-integration-pattern-analysis.md` | EDR decoupling pattern as baseline |
| Plan 03 findings | `docs/research/phase-6/findings/03-separate-entry-point-design-patterns.md` | Entry point configuration, barrel file structure |
| Plan 04 findings | `docs/research/phase-6/findings/04-sub-module-api-design-patterns.md` | Industry consumer API patterns, coupling level recommendations |
| Plan 05 findings | `docs/research/phase-6/findings/05-module-decoupling-patterns.md` | Coupling level analysis, structural typing implications, module boundary enforcement |

---

## 6. Research Methodology

### Phase 1: Synthesize Consumer API and Coupling Level (~60 minutes)

**Objective:** Integrate findings from Plans 04 and 05 to select the optimal consumer API shape and coupling level for CSAPI extraction.

**Tasks:**
1. Review Plan 04's pattern catalog and recommendations — identify the dominant consumer API pattern
2. Review Plan 05's coupling level analysis — identify the recommended coupling level
3. Draft concrete code examples for the selected pattern and coupling level
4. Compare to current `endpoint.csapi(collectionId)` API — document required changes
5. Analyze data flow: what data does CSAPI need, how is it provided, how does async flow work?
6. Document migration effort, developer ergonomics, testability, and constraint compliance

**Output:** Consumer API and coupling level selection with code examples and migration analysis

### Phase 2: Design Module Boundary and Enforcement (~60 minutes)

**Objective:** Design the module boundary, barrel file structure, export curation, and enforcement mechanisms to guarantee one-way dependency and zero outward imports.

**Tasks:**
1. Design the `./csapi` barrel file — what to export, what to keep internal
2. Design the `package.json` `"exports"` field for sub-path entry point
3. Design ESLint rules or project references to enforce module boundary
4. Design import strategy for shared types — `import type`, re-declaration, or shared types module
5. Design placement and implementation of `scanCsapiLinks` — resolve the shared utility problem
6. Document before/after code comparison for all affected files
7. Document tree-shaking and bundler compatibility

**Output:** Module boundary design with enforcement mechanisms and before/after code comparison

### Phase 3: Test and Documentation Migration (~40 minutes)

**Objective:** Plan the migration of CSAPI tests and documentation to reflect the new architecture.

**Tasks:**
1. Identify CSAPI-specific tests in `endpoint.spec.ts` — plan migration to CSAPI test suite
2. Draft migration plan for documentation — README, API docs, code comments
3. Draft before/after code comparison for PR reviewers
4. Plan migration staging — one-shot vs incremental, feature flags, branch-by-abstraction
5. Plan migration verification — import graphs, CI checks, manual review

**Output:** Test and documentation migration plan with verification checklist

### Phase 4: Synthesis and Final Documentation (~40 minutes)

**Objective:** Consolidate all phase outputs into the deliverable architectural document.

**Tasks:**
1. Synthesize findings from Phases 1–3 into the findings report structure
2. Verify all 20 research questions are answered
3. Validate every finding against all boundary conditions
4. Write the deliverable document
5. Cross-reference with Plan 08 (changelist and commit strategy)

**Output:** Completed architectural findings report at `docs/research/phase-6/findings/06-endpoint-decoupling-architecture.md`

---

## 7. Success Criteria

This research is complete when:

- [ ] All 20 detailed research questions have specific, evidenced answers
- [ ] Findings respect all boundary conditions listed in Section 3
- [ ] Consumer API shape and coupling level are selected with code examples and migration analysis
- [ ] Module boundary is designed with enforcement mechanisms and before/after code comparison
- [ ] Test and documentation migration plan is drafted with verification checklist
- [ ] Deliverable document is complete and follows the findings report template
- [ ] Findings are cross-referenced with Plan 08

---

## 8. Deliverable

**Title:** Endpoint Decoupling Architecture: Design Synthesis and Migration Blueprint for CSAPI Extraction

**Location:** `docs/research/phase-6/findings/06-endpoint-decoupling-architecture.md`

**Required Sections:** (per findings report template)

1. Executive Summary — the selected architecture, consumer API shape, coupling level, and module boundary design
2. Consumer API and Coupling Level Selection — code examples, migration analysis, constraint compliance
3. Module Boundary Design — barrel file structure, export curation, enforcement mechanisms
4. Test and Documentation Migration Plan — test migration, documentation updates, verification checklist
5. Before/After Code Comparison — for all affected files
6. Recommendation — the selected architecture with full rationale
7. Impact on Implementation — what Plan 08 should consume, what decisions are made vs. deferred
8. Open Questions — anything unresolved that feeds into Plan 08

---

## 9. Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Plan 04 and Plan 05 recommendations may conflict — consumer API shape vs coupling level | May require compromise or hybrid pattern | Document both recommendations, analyze tradeoffs, propose hybrid if needed. Let Plan 08 resolve any remaining conflicts. |
| Enforcement mechanisms (ESLint, project references) may not catch all boundary violations | Residual imports may persist | Use multiple verification techniques: `git grep`, static analysis, CI checks, manual review. Document all in migration plan. |
| Migration of tests may break coverage or introduce regressions | Loss of test coverage | Plan migration carefully, verify with CI, document before/after test suite. |
| Tree-shaking or bundler compatibility may be affected by barrel file changes | Increased bundle size or runtime errors | Test with all supported bundlers, document compatibility, adjust barrel file as needed. |
| Documentation may lag behind code changes | Confusion for consumers and maintainers | Draft documentation updates as part of migration plan, verify completeness before merging. |

---

## 10. Research Status Checklist

- [ ] Phase 1: Synthesize Consumer API and Coupling Level — Not Started
- [ ] Phase 2: Design Module Boundary and Enforcement — Not Started
- [ ] Phase 3: Test and Documentation Migration — Not Started
- [ ] Phase 4: Synthesis and Final Documentation — Not Started
- [ ] Deliverable document created
- [ ] Cross-references updated in Plan 08

**Start Date:** —
**Completion Date:** —
**Actual Time:** —
