# Conformance Reader - Design Research Plan

**Component:** Conformance Reader  
**Design Phase:** Phase 1 - Foundation & Integration (Component #2)  
**Status:** Research Planning

---

## Purpose

Define how to detect CSAPI support by reading conformance classes from the `/conformance` endpoint. This component determines whether a server implements Connected Systems API Parts 1 and/or 2, enabling the `endpoint.csapi()` factory method to validate CSAPI availability before instantiation.

---

## Context

From the [Implementation Guide](../../../planning/csapi-implementation-guide.md#conformance-reader-extending-existing-capability-detection):

- **Scope:** ~7 lines in `info.ts` (1 function, similar to EDR pattern)
- **Pattern:** Add `checkHasConnectedSystems()` function alongside existing `checkHasEnvironmentalDataRetrieval()`
- **Purpose:** Return true if endpoint advertises CSAPI Part 1 OR Part 2 conformance classes
- **Integration:** Used by `hasConnectedSystems` getter in endpoint.ts (added in Component 1)

**CSAPI Conformance Classes:**
- Part 1 Core: `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/req/core`
- Part 2 Core: `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/req/core`
- Plus 9 optional resource-specific classes (system, deployment, datastream, etc.)

---

## Research Objectives

1. **Understand existing conformance checking pattern** used for Features, Tiles, Records, EDR
2. **Identify the exact function signature** for conformance check functions
3. **Determine detection strategy** (check only core classes vs. all classes)
4. **Understand how conformance classes are accessed** (data structure, parsing)
5. **Define error handling** (what if conformance endpoint fails?)
6. **Understand conformance class matching** (exact match vs. contains check)
7. **Document all CSAPI conformance class URIs** to detect

---

## Critical Questions

### 1. Existing Conformance Check Pattern

**Study:** `checkHasEnvironmentalDataRetrieval()` in info.ts

**Questions:**
- [ ] What is the exact function signature?
  - **Answer:** _[To be filled after research]_

- [ ] What parameters does it accept?
  - **Answer:** _[To be filled after research]_

- [ ] What does it return?
  - **Answer:** _[To be filled after research]_

- [ ] How does it check for conformance classes?
  - **Answer:** _[To be filled after research]_

- [ ] Does it use exact string matching or `.includes()` or regex?
  - **Answer:** _[To be filled after research]_

- [ ] Does it check for ONE class or MULTIPLE classes?
  - **Answer:** _[To be filled after research]_

- [ ] What's the logic operator (AND, OR, XOR)?
  - **Answer:** _[To be filled after research]_

### 2. ConformanceClass Type

**Study:** Type definitions for conformance classes

**Questions:**
- [ ] What is the TypeScript type for `ConformanceClass`?
  - **Answer:** _[To be filled after research]_

- [ ] Is it a string, array, object, or union type?
  - **Answer:** _[To be filled after research]_

- [ ] Where is this type defined?
  - **Answer:** _[To be filled after research]_

- [ ] Are conformance classes case-sensitive?
  - **Answer:** _[To be filled after research]_

- [ ] Do conformance class URIs include version numbers?
  - **Answer:** _[To be filled after research]_

### 3. Conformance Class Access

**Study:** How conformance classes are fetched and parsed

**Questions:**
- [ ] Where does the conformance classes array come from?
  - **Answer:** _[To be filled after research]_

- [ ] Is it fetched from `/conformance` endpoint?
  - **Answer:** _[To be filled after research]_

- [ ] How is the response parsed?
  - **Answer:** _[To be filled after research]_

- [ ] What format is the conformance document (JSON, XML)?
  - **Answer:** _[To be filled after research]_

- [ ] Is there caching for conformance classes?
  - **Answer:** _[To be filled after research]_

### 4. CSAPI Detection Strategy

**Study:** Which CSAPI conformance classes should trigger detection

**Questions:**
- [ ] Should we check ONLY core classes (Part 1 OR Part 2)?
  - **Answer:** _[To be filled after research]_

- [ ] Should we check resource-specific classes too?
  - **Answer:** _[To be filled after research]_

- [ ] What if server advertises Part 1 System but not Part 1 Core?
  - **Answer:** _[To be filled after research]_

- [ ] Should detection require BOTH Part 1 AND Part 2?
  - **Answer:** _[To be filled after research]_

- [ ] What's the minimum conformance for valid CSAPI support?
  - **Answer:** _[To be filled after research]_

### 5. Multiple Conformance Class Handling

**Study:** How EDR checks for multiple versions (1.0 OR 1.1)

**Questions:**
- [ ] Does EDR check for multiple conformance class variants?
  - **Answer:** _[To be filled after research]_

- [ ] How does it handle version differences (1.0 vs 1.1)?
  - **Answer:** _[To be filled after research]_

- [ ] Should CSAPI check for future versions (1.1, 2.0)?
  - **Answer:** _[To be filled after research]_

- [ ] How to make version checking future-proof?
  - **Answer:** _[To be filled after research]_

### 6. Function Placement and Exports

**Study:** Where conformance check functions live in the codebase

**Questions:**
- [ ] Where in info.ts is `checkHasEnvironmentalDataRetrieval` defined?
  - **Answer:** _[To be filled after research]_

- [ ] Is it exported from info.ts?
  - **Answer:** _[To be filled after research]_

- [ ] Is it a named export or default export?
  - **Answer:** _[To be filled after research]_

- [ ] Is it imported in endpoint.ts?
  - **Answer:** _[To be filled after research]_

- [ ] Are there JSDoc comments on the function?
  - **Answer:** _[To be filled after research]_

### 7. Integration with Endpoint Getter

**Study:** How conformance check function is called from endpoint.ts

**Questions:**
- [ ] How is `hasEnvironmentalDataRetrieval` getter implemented?
  - **Answer:** _[To be filled after research]_

- [ ] Does it call the check function directly?
  - **Answer:** _[To be filled after research]_

- [ ] Does it pass conformance classes as parameter?
  - **Answer:** _[To be filled after research]_

- [ ] Is it async or sync?
  - **Answer:** _[To be filled after research]_

- [ ] Does it use Promise.all() or other async patterns?
  - **Answer:** _[To be filled after research]_

### 8. Error Handling

**Study:** What happens if conformance endpoint is unreachable

**Questions:**
- [ ] Does conformance check throw errors?
  - **Answer:** _[To be filled after research]_

- [ ] What happens if `/conformance` returns 404?
  - **Answer:** _[To be filled after research]_

- [ ] What happens if conformance classes array is empty?
  - **Answer:** _[To be filled after research]_

- [ ] Is there a default/fallback behavior?
  - **Answer:** _[To be filled after research]_

### 9. Other API Conformance Patterns

**Study:** How Features, Tiles, Records check conformance

**Questions:**
- [ ] Do all OGC APIs use same conformance check pattern?
  - **Answer:** _[To be filled after research]_

- [ ] Are there variations in the pattern?
  - **Answer:** _[To be filled after research]_

- [ ] What can we learn from Features conformance check?
  - **Answer:** _[To be filled after research]_

- [ ] Are there any edge cases to watch for?
  - **Answer:** _[To be filled after research]_

### 10. CSAPI-Specific Conformance Classes

**Study:** Official CSAPI conformance class URIs from specs

**Questions:**
- [ ] What is the EXACT URI for Part 1 Core conformance?
  - **Answer:** _[To be filled after research]_

- [ ] What is the EXACT URI for Part 2 Core conformance?
  - **Answer:** _[To be filled after research]_

- [ ] Are there alternate URI formats to check (with/without trailing slash)?
  - **Answer:** _[To be filled after research]_

- [ ] Do URIs include `/req/` or `/conf/`?
  - **Answer:** _[To be filled after research]_

- [ ] Should we check for ALL 11 conformance classes or just 2 core?
  - **Answer:** _[To be filled after research]_

---

## Research Tasks

### Task 1: Study EDR Conformance Check
- [ ] Read `checkHasEnvironmentalDataRetrieval()` function in info.ts
- [ ] Document exact implementation line-by-line
- [ ] Extract function signature
- [ ] Understand conformance class matching logic
- [ ] Note any comments or documentation

### Task 2: Study Endpoint Getter Pattern
- [ ] Read `hasEnvironmentalDataRetrieval` getter in endpoint.ts
- [ ] Understand how it calls the check function
- [ ] Document the Promise pattern used
- [ ] Identify where conformance classes come from
- [ ] Check how it's used in factory method

### Task 3: Study Other Conformance Checks
- [ ] Find `checkHasFeatures()` function (if exists)
- [ ] Find `checkHasRecords()` function (if exists)
- [ ] Find `checkHasTiles()` function (if exists)
- [ ] Compare patterns across all checks
- [ ] Identify the canonical pattern to follow

### Task 4: Review CSAPI Specifications
- [ ] Read Part 1 conformance classes section
- [ ] Read Part 2 conformance classes section
- [ ] Extract all 11 conformance class URIs
- [ ] Verify URI format (with /req/ or /conf/)
- [ ] Check for version-specific URIs

### Task 5: Study ConformanceClass Type
- [ ] Find type definition in model.ts or types files
- [ ] Understand the data structure
- [ ] Check how conformance document is parsed
- [ ] Review any validation logic

### Task 6: Test Conformance Detection Logic
- [ ] Determine if Part 1 OR Part 2 is sufficient
- [ ] Decide on core-only vs all-classes approach
- [ ] Consider future version compatibility
- [ ] Design the boolean logic expression

---

## Upstream Code to Study

### Primary Sources
- **src/ogc-api/info.ts**
  - Line ~250: `checkHasEnvironmentalDataRetrieval()` function
  - All other `checkHas*()` functions for comparison
  
- **src/ogc-api/endpoint.ts**
  - Line ~270: `hasEnvironmentalDataRetrieval` getter
  - Other `has*` getters for comparison

- **src/ogc-api/model.ts**
  - `ConformanceClass` type definition
  - Conformance-related types

### Secondary Sources
- **OGC API - Connected Systems Part 1 Spec**
  - Section on conformance classes
  - Requirements classes URIs

- **OGC API - Connected Systems Part 2 Spec**
  - Section on conformance classes
  - Requirements classes URIs

### Reference Analysis
- **[pr114-analysis.md](../../upstream/pr114-analysis.md)** - Section on conformance detection
- **[conformance-capabilities.md](../../requirements/csapi-conformance-capabilities.md)** - All CSAPI conformance classes

---

## Deliverables

### 1. Research Plan (This Document)
- [x] Define all research questions
- [ ] Fill in answers as research progresses
- [ ] Mark completed tasks
- [ ] Document key findings inline

### 2. Analysis Report
**File:** `conformance-reader-analysis.md` (to be created in this folder)

**Important:** The analysis report MUST include the [Development Standards](../../../planning/csapi-implementation-guide.md#development-standards) section from the implementation guide. All design decisions should follow these standards for code quality, documentation, and testing.

**Required Sections:**
1. **Executive Summary**
   - Conformance detection approach (core-only vs all-classes)
   - Recommended detection logic

2. **Function Design**
   - Exact function signature
   - Implementation code (full function)
   - JSDoc documentation

3. **Conformance Class URIs**
   - Complete list of all CSAPI conformance classes
   - Which ones to check (core only vs all)
   - Rationale for detection strategy

4. **Integration with Endpoint**
   - How `hasConnectedSystems` getter calls the function
   - Promise handling pattern
   - Integration with factory method (from Component 1)

5. **Detection Logic**
   - Boolean expression (Part 1 OR Part 2 OR resource-specific)
   - String matching strategy (exact vs contains)
   - Future-proofing for version changes

6. **Error Handling**
   - What happens if conformance endpoint fails
   - Default behavior for missing conformance
   - Edge cases and fallbacks

7. **Type Definitions**
   - ConformanceClass type
   - Any helper types needed

8. **Code Location**
   - Exact line in info.ts to add function
   - Exact line in endpoint.ts for getter (from Component 1)

9. **Testing Approach**
   - How to test conformance detection
   - Mock conformance documents
   - Edge cases to test

10. **Implementation Checklist**
    - Step-by-step implementation guide
    - Validation steps
    - Integration verification

### 3. Code Artifacts
**Optional but recommended:**
- Draft function implementation with JSDoc
- Example conformance documents (fixtures)
- Test cases

---

## Success Criteria

This research is complete when:

- [ ] All critical questions have answers
- [ ] Analysis report is written and reviewed
- [ ] Function implementation is fully specified
- [ ] CSAPI conformance class URIs are documented
- [ ] Detection logic is clearly defined
- [ ] Integration with Component 1 is verified
- [ ] Error scenarios are identified and handled
- [ ] Testing strategy is defined

---

## Next Steps

1. **DO NOT START IMPLEMENTATION** - This is research only
2. Review this plan for completeness
3. Begin research with Task 1 (Study EDR conformance check)
4. Fill in answers as research progresses
5. Create analysis report when research is complete
6. Mark component complete in [design-sequence.md](../design-sequence.md)
7. Move to Component #3 (Collections Reader)

---

## Notes

- This component is simpler than Component 1 (~7 lines vs ~65 lines)
- Critical for enabling the factory method from Component 1
- Must match EDR pattern exactly - no innovation needed
- Detection strategy (core-only vs all-classes) is the key decision
- Function will be called every time `endpoint.csapi()` is invoked (via getter)
- Must be efficient - no heavy processing, just array matching

---

## Dependencies

**Depends On:**
- Component 1 (OgcApiEndpoint Integration) - Provides `hasConnectedSystems` getter pattern

**Required By:**
- Component 1 (OgcApiEndpoint Integration) - Factory method checks `hasConnectedSystems` before instantiation
- Component 3 (Collections Reader) - Uses `hasConnectedSystems` to filter collections

**Integration Point:**
```typescript
// In endpoint.ts (from Component 1)
public async csapi(collection_id: string): Promise<CSAPIQueryBuilder> {
  if (!this.hasConnectedSystems) {  // ← Calls our conformance check
    throw new EndpointError('Endpoint does not support Connected Systems API');
  }
  // ... rest of factory method
}
```

---

## Key Design Decisions to Research

1. **Detection Granularity:** Core-only vs resource-specific classes?
2. **Part Requirements:** Part 1 OR Part 2 (either) vs Part 1 AND Part 2 (both)?
3. **String Matching:** Exact match vs `.includes()` vs regex?
4. **Version Handling:** Check specific version (1.0) or any version?
5. **Error Strategy:** Throw error, return false, or default assumption?

These decisions will be documented in the analysis report with rationale.
