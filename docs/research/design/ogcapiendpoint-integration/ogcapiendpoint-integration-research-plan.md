# OgcApiEndpoint Integration - Design Research Plan

**Component:** OgcApiEndpoint Integration  
**Design Phase:** Phase 1 - Foundation & Integration (Component #1)  
**Status:** Research Planning

---

## Purpose

Define the exact code changes needed to integrate CSAPI into the existing `OgcApiEndpoint` class, following the proven EDR pattern from PR #114. This is the entry point for all CSAPI functionality - must be designed correctly to ensure smooth developer experience.

---

## Context

From the [Implementation Guide](../../../planning/csapi-implementation-guide.md#ogcapiendpoint-integration-extending-main-endpoint-class):

- **Scope:** ~48 lines across 2-3 files (endpoint.ts, info.ts, index.ts)
- **Pattern:** Factory method that returns CSAPIQueryBuilder instance
- **Blueprint:** PR #114 EDR implementation (`endpoint.edr()` → returns `EDRQueryBuilder`)
- **Key Method:** `endpoint.csapi(collectionId)` → returns `CSAPIQueryBuilder`

---

## Research Objectives

1. **Understand the factory method pattern** used in EDR implementation
2. **Identify exact integration points** in existing endpoint.ts, info.ts, index.ts files
3. **Define the method signature** for `endpoint.csapi(collectionId)`
4. **Determine caching strategy** (does QueryBuilder get cached per collection?)
5. **Understand lifecycle management** (when is QueryBuilder instantiated? disposed?)
6. **Define error handling** (what happens if collection doesn't support CSAPI?)
7. **Understand collection validation** (how to verify collection has CSAPI features?)

---

## Critical Questions

### 1. Factory Method Pattern

**Study:** PR #114 `endpoint.edr()` implementation in endpoint.ts

**Questions:**
- [ ] What is the exact method signature for `endpoint.edr()`?
  - **Answer:** _[To be filled after research]_

- [ ] What parameters does it accept?
  - **Answer:** _[To be filled after research]_

- [ ] What does it return (class name, interface)?
  - **Answer:** _[To be filled after research]_

- [ ] Is it async or sync?
  - **Answer:** _[To be filled after research]_

- [ ] What validation/checks happen before returning QueryBuilder?
  - **Answer:** _[To be filled after research]_

### 2. Integration Points in endpoint.ts

**Study:** PR #114 modifications to src/shared/endpoint.ts

**Questions:**
- [ ] Where in the endpoint.ts file is the factory method added?
  - **Answer:** _[To be filled after research]_

- [ ] What imports are added at the top of endpoint.ts?
  - **Answer:** _[To be filled after research]_

- [ ] How many lines of code are added to endpoint.ts?
  - **Answer:** _[To be filled after research]_

- [ ] Are there any dependencies on other endpoint methods/properties?
  - **Answer:** _[To be filled after research]_

- [ ] How does it access endpoint URL, headers, fetch implementation?
  - **Answer:** _[To be filled after research]_

### 3. Caching Strategy

**Study:** PR #114 QueryBuilder instantiation and reuse patterns

**Questions:**
- [ ] Is the QueryBuilder instance cached?
  - **Answer:** _[To be filled after research]_

- [ ] If cached, where is the cache stored (class property, WeakMap)?
  - **Answer:** _[To be filled after research]_

- [ ] Is caching per-collection or per-endpoint?
  - **Answer:** _[To be filled after research]_

- [ ] When is the cache cleared/invalidated?
  - **Answer:** _[To be filled after research]_

- [ ] What's the reasoning for cache vs no-cache approach?
  - **Answer:** _[To be filled after research]_

### 4. Collection Validation

**Study:** How EDR validates collections support EDR queries

**Questions:**
- [ ] Does `endpoint.edr()` accept a collectionId parameter?
  - **Answer:** _[To be filled after research]_

- [ ] How does it validate the collection exists?
  - **Answer:** _[To be filled after research]_

- [ ] How does it validate the collection supports EDR?
  - **Answer:** _[To be filled after research]_

- [ ] What error is thrown if validation fails?
  - **Answer:** _[To be filled after research]_

- [ ] Does validation happen sync or async?
  - **Answer:** _[To be filled after research]_

### 5. Type Definitions

**Study:** TypeScript types/interfaces related to factory method

**Questions:**
- [ ] What is the return type declaration for the factory method?
  - **Answer:** _[To be filled after research]_

- [ ] Are there any generic type parameters?
  - **Answer:** _[To be filled after research]_

- [ ] What types are exported from index.ts for this integration?
  - **Answer:** _[To be filled after research]_

- [ ] How is the QueryBuilder class type imported/referenced?
  - **Answer:** _[To be filled after research]_

### 6. Error Handling

**Study:** Error handling patterns in EDR factory method

**Questions:**
- [ ] What errors can the factory method throw?
  - **Answer:** _[To be filled after research]_

- [ ] What are the error messages?
  - **Answer:** _[To be filled after research]_

- [ ] Are custom error classes used?
  - **Answer:** _[To be filled after research]_

- [ ] How are network errors vs validation errors distinguished?
  - **Answer:** _[To be filled after research]_

### 7. Dependencies and Context

**Study:** What context/state the factory method needs access to

**Questions:**
- [ ] Does the factory method need access to endpoint._info?
  - **Answer:** _[To be filled after research]_

- [ ] Does it need access to collections metadata?
  - **Answer:** _[To be filled after research]_

- [ ] What information is passed to the QueryBuilder constructor?
  - **Answer:** _[To be filled after research]_

- [ ] How does QueryBuilder get endpoint URL, auth headers, fetch?
  - **Answer:** _[To be filled after research]_

### 8. Export Strategy

**Study:** PR #114 modifications to src/index.ts

**Questions:**
- [ ] What is exported from index.ts related to the factory method?
  - **Answer:** _[To be filled after research]_

- [ ] Is the QueryBuilder class exported?
  - **Answer:** _[To be filled after research]_

- [ ] Are there re-exports from the ogc-api/edr module?
  - **Answer:** _[To be filled after research]_

- [ ] What types are exported vs kept internal?
  - **Answer:** _[To be filled after research]_

### 9. CSAPI-Specific Considerations

**Study:** Differences between EDR and CSAPI that affect integration

**Questions:**
- [ ] EDR: Does `endpoint.edr()` require a collectionId?
  - **Answer:** _[To be filled after research]_

- [ ] CSAPI: Should `endpoint.csapi(collectionId)` require collectionId?
  - **Answer:** _[To be filled after research]_

- [ ] CSAPI: Can one collection have multiple CSAPI resource types?
  - **Answer:** _[To be filled after research]_

- [ ] CSAPI: Should QueryBuilder know which resource types are available?
  - **Answer:** _[To be filled after research]_

- [ ] CSAPI: Are there collection-level vs endpoint-level CSAPI operations?
  - **Answer:** _[To be filled after research]_

### 10. Code Organization

**Study:** File structure and import patterns in PR #114

**Questions:**
- [ ] Where is the QueryBuilder class file located?
  - **Answer:** _[To be filled after research]_

- [ ] What is the import path from endpoint.ts to QueryBuilder?
  - **Answer:** _[To be filled after research]_

- [ ] Are there any circular dependency concerns?
  - **Answer:** _[To be filled after research]_

- [ ] How are relative imports structured?
  - **Answer:** _[To be filled after research]_

---

## Research Tasks

### Task 1: Study PR #114 EDR Factory Method
- [ ] Read endpoint.ts changes in PR #114
- [ ] Document exact implementation of `endpoint.edr()`
- [ ] Extract method signature, parameters, return type
- [ ] Identify all dependencies and imports
- [ ] Note any comments or documentation in the code

### Task 2: Analyze QueryBuilder Instantiation
- [ ] Trace the `new EDRQueryBuilder()` call
- [ ] Document what parameters are passed to constructor
- [ ] Understand how endpoint context is provided
- [ ] Identify any configuration or options objects

### Task 3: Study Collection Integration
- [ ] Determine if/how collections are involved
- [ ] Check if collection metadata is accessed
- [ ] Understand relationship between endpoint and collections
- [ ] Review how collection-specific features are exposed

### Task 4: Review Type System
- [ ] Document all TypeScript types involved
- [ ] Understand interface contracts
- [ ] Review type exports in index.ts
- [ ] Check for any type guards or validators

### Task 5: Examine Error Handling
- [ ] Find all error throwing locations
- [ ] Document error messages and types
- [ ] Understand error propagation
- [ ] Review any try-catch blocks

### Task 6: Compare with Other API Implementations
- [ ] Check if Features, Tiles, STAC have similar patterns
- [ ] Identify common patterns across API families
- [ ] Note any deviations or special cases
- [ ] Understand why EDR pattern should be followed

---

## Upstream Code to Study

### Primary Sources
- **PR #114:** https://github.com/camptocamp/ogc-client/pull/114
  - File: `src/shared/endpoint.ts` (factory method implementation)
  - File: `src/ogc-api/edr/url_builder.ts` (QueryBuilder class)
  - File: `src/index.ts` (exports)

### Secondary Sources
- **Current endpoint.ts:** https://github.com/camptocamp/ogc-client/blob/main/src/shared/endpoint.ts
  - Study existing factory methods for Features, Tiles, STAC
  - Understand the OgcApiEndpoint class structure

### Reference Analysis
- **[pr114-analysis.md](../../upstream/pr114-analysis.md)** - Sections 2, 3.2, 5
- **[integration-analysis.md](../../upstream/integration-analysis.md)** - Integration points
- **[querybuilder-pattern-analysis.md](../../upstream/querybuilder-pattern-analysis.md)** - Factory method pattern

---

## Deliverables

### 1. Research Plan (This Document)
- [x] Define all research questions
- [ ] Fill in answers as research progresses
- [ ] Mark completed tasks
- [ ] Document key findings inline

### 2. Analysis Report
**File:** `ogcapiendpoint-integration-analysis.md` (to be created in this folder)

**Important:** The analysis report MUST include the [Development Standards](../../../planning/csapi-implementation-guide.md#development-standards) section from the implementation guide. All design decisions should follow these standards for code quality, documentation, and testing.

**Required Sections:**
1. **Executive Summary**
   - Key findings in 3-5 bullets
   - Recommended approach for CSAPI integration

2. **Factory Method Design**
   - Exact method signature for `endpoint.csapi(collectionId)`
   - Parameters and return type
   - Implementation pseudocode

3. **Integration Code Changes**
   - endpoint.ts: Exact lines to add, where to add them
   - info.ts: Changes needed (if any)
   - index.ts: Export statements to add

4. **Caching Strategy**
   - Whether to cache QueryBuilder instances
   - Implementation approach if caching

5. **Collection Validation**
   - How to validate collection supports CSAPI
   - Error handling for invalid collections

6. **Type Definitions**
   - All TypeScript types needed
   - Interface contracts

7. **Code Examples**
   - Before/after code snippets
   - Developer usage examples
   - Error handling examples

8. **Dependencies**
   - What the factory method depends on
   - What the QueryBuilder receives from endpoint

9. **Testing Approach**
   - How the factory method will be tested
   - Mock strategies
   - Edge cases to test

10. **Implementation Checklist**
    - Step-by-step implementation guide
    - Files to create/modify
    - Order of operations

### 3. Code Artifacts
**Optional but recommended:**
- Draft method signature with JSDoc comments
- Draft TypeScript interfaces
- Example test cases

---

## Success Criteria

This research is complete when:

- [ ] All critical questions have answers
- [ ] Analysis report is written and reviewed
- [ ] Code changes are clearly specified (file, location, exact code)
- [ ] CSAPI-specific considerations are addressed
- [ ] Integration approach matches EDR pattern exactly
- [ ] Developer usage pattern is clear and documented
- [ ] Error scenarios are identified and handled
- [ ] Testing strategy is defined

---

## Next Steps

1. **DO NOT START IMPLEMENTATION** - This is research only
2. Review this plan for completeness
3. Begin research with Task 1 (Study PR #114)
4. Fill in answers as research progresses
5. Create analysis report when research is complete
6. Mark component complete in [design-sequence.md](../design-sequence.md)
7. Move to Component #2 (Conformance Reader)

---

## Notes

- This component is foundational - get it right before moving forward
- The factory method is the developer's entry point to all CSAPI functionality
- Match EDR pattern exactly - do not innovate or "improve" on this pattern
- Keep it minimal - ~48 lines total across all files
- Prioritize developer experience - method should be intuitive and discoverable
