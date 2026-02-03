# Collections Reader - Design Research Plan

**Component:** Collections Reader  
**Design Phase:** Phase 1 - Foundation & Integration (Component #3)  
**Status:** Research Planning

---

## Purpose

Define how to identify which collections contain CSAPI resources by parsing collection metadata from the `/collections` endpoint. This component determines which collections support Systems, DataStreams, Observations, or other CSAPI resource types, enabling developers to discover available CSAPI collections before constructing queries.

---

## Context

From the [Implementation Guide](../../../planning/csapi-implementation-guide.md#collections-reader-extending-metadata-parsing):

- **Scope:** ~15 lines total (filter function in info.ts + getter in endpoint.ts)
- **Pattern:** Add `parseCollections()` filtering logic and `csapiCollections` getter (similar to EDR pattern)
- **Purpose:** Filter collections metadata to identify those with CSAPI resource types (Systems, DataStreams, etc.)
- **Integration:** Used by developers to discover available CSAPI collections; called internally by `endpoint.csapi()` factory method

**CSAPI Collection Indicators:**
- `featureType` property with SOSA/SSN values (`sosa:System`, `sosa:Deployment`, `sosa:ObservationCollection`, etc.)
- Links to CSAPI-specific operations (systems, datastreams, observations endpoints)
- Schema information for DataStreams/ControlStreams
- Supported formats (GeoJSON, SensorML 3.0, SWE Common 3.0)

**Key Metadata Properties:**
```json
{
  "id": "sensors-collection",
  "title": "IoT Sensors",
  "featureType": "sosa:System",
  "links": [
    { "rel": "systems", "href": ".../collections/sensors-collection/systems" },
    { "rel": "datastreams", "href": ".../collections/sensors-collection/datastreams" }
  ]
}
```

---

## Research Objectives

1. **Understand existing collection parsing pattern** used for Features, Tiles, Records, EDR
2. **Identify collection metadata structure** (what fields exist, what indicates CSAPI support)
3. **Determine filtering strategy** (check featureType, check links, check both?)
4. **Understand parseCollections pattern** (how EDR filters collections by metadata)
5. **Define csapiCollections getter** (returns array of collection IDs with CSAPI support)
6. **Understand collection data access** (where collections data comes from, caching)
7. **Define error handling** (what if /collections fails, empty collections array)

---

## Critical Questions

### 1. Existing Collection Parsing Pattern

**Study:** How EDR, Features, Tiles, Records parse and filter collections

**Questions:**
- [ ] What is the exact structure of collection metadata objects?
  - **Answer:** _[To be filled after research]_

- [ ] Where is collection metadata fetched from (`/collections` endpoint)?
  - **Answer:** _[To be filled after research]_

- [ ] How is the collection data parsed (JSON structure)?
  - **Answer:** _[To be filled after research]_

- [ ] What TypeScript types represent collections?
  - **Answer:** _[To be filled after research]_

- [ ] Is collection data cached?
  - **Answer:** _[To be filled after research]_

### 2. EDR Collection Filtering Pattern

**Study:** `parseCollections()` function and EDR filtering logic in info.ts

**Questions:**
- [ ] Does a `parseCollections()` function exist in info.ts?
  - **Answer:** _[To be filled after research]_

- [ ] What is the exact function signature for collection parsing?
  - **Answer:** _[To be filled after research]_

- [ ] How does EDR identify collections with EDR support?
  - **Answer:** _[To be filled after research]_

- [ ] What metadata properties does EDR check (data_queries, crs, extent)?
  - **Answer:** _[To be filled after research]_

- [ ] Does it use `.filter()`, `.map()`, or other array methods?
  - **Answer:** _[To be filled after research]_

- [ ] What does the function return (collection IDs, collection objects, both)?
  - **Answer:** _[To be filled after research]_

### 3. Collection Metadata Structure

**Study:** TypeScript types for collection objects in model.ts

**Questions:**
- [ ] What is the TypeScript type for a collection object?
  - **Answer:** _[To be filled after research]_

- [ ] What properties are available on collection objects?
  - **Answer:** _[To be filled after research]_

- [ ] Is there a `featureType` property on collections?
  - **Answer:** _[To be filled after research]_

- [ ] Is there a `links` array property on collections?
  - **Answer:** _[To be filled after research]_

- [ ] What other CSAPI-relevant metadata might exist?
  - **Answer:** _[To be filled after research]_

- [ ] Are there any optional vs required properties?
  - **Answer:** _[To be filled after research]_

### 4. CSAPI Detection Strategy

**Study:** How to identify collections with CSAPI resources

**Questions:**
- [ ] Should we check `featureType` property for SOSA/SSN values?
  - **Answer:** _[To be filled after research]_

- [ ] Should we check `links` array for CSAPI-specific relations (systems, datastreams)?
  - **Answer:** _[To be filled after research]_

- [ ] What are valid `featureType` values for CSAPI collections?
  - **Answer:** _[To be filled after research]_

- [ ] Should detection require BOTH featureType AND links?
  - **Answer:** _[To be filled after research]_

- [ ] What if collection has Systems but not DataStreams - still CSAPI?
  - **Answer:** _[To be filled after research]_

- [ ] Should we detect specific resource types (systems, datastreams separately)?
  - **Answer:** _[To be filled after research]_

### 5. Collection Data Access

**Study:** Where collection metadata comes from in endpoint.ts

**Questions:**
- [ ] What is `this.data` in endpoint.ts?
  - **Answer:** _[To be filled after research]_

- [ ] Does `this.data` return a Promise?
  - **Answer:** _[To be filled after research]_

- [ ] What structure does `this.data` return (object with collections array)?
  - **Answer:** _[To be filled after research]_

- [ ] How is collection data fetched (HTTP GET to /collections)?
  - **Answer:** _[To be filled after research]_

- [ ] Is there error handling for failed collection fetches?
  - **Answer:** _[To be filled after research]_

### 6. Getter Implementation Pattern

**Study:** How `edrCollections`, `featureCollections` getters work in endpoint.ts

**Questions:**
- [ ] What is the exact implementation of `edrCollections` getter?
  - **Answer:** _[To be filled after research]_

- [ ] Does it use `Promise.all()` pattern?
  - **Answer:** _[To be filled after research]_

- [ ] Does it combine collection data with conformance check?
  - **Answer:** _[To be filled after research]_

- [ ] What does the getter return (Promise<string[]> of collection IDs)?
  - **Answer:** _[To be filled after research]_

- [ ] How does it handle empty collections?
  - **Answer:** _[To be filled after research]_

- [ ] Does it call a parsing/filter function from info.ts?
  - **Answer:** _[To be filled after research]_

### 7. Filter Function Design

**Study:** How to structure the collection filtering function

**Questions:**
- [ ] Should the filter function be in info.ts or endpoint.ts?
  - **Answer:** _[To be filled after research]_

- [ ] Should it accept collections array as parameter?
  - **Answer:** _[To be filled after research]_

- [ ] Should it return collection objects or just IDs?
  - **Answer:** _[To be filled after research]_

- [ ] Should it be named `parseCSAPICollections()` or similar?
  - **Answer:** _[To be filled after research]_

- [ ] Is it exported for testing?
  - **Answer:** _[To be filled after research]_

### 8. Integration with Conformance Check

**Study:** How csapiCollections relates to hasConnectedSystems

**Questions:**
- [ ] Should `csapiCollections` check `hasConnectedSystems` first?
  - **Answer:** _[To be filled after research]_

- [ ] What if `hasConnectedSystems` is false but collection has featureType?
  - **Answer:** _[To be filled after research]_

- [ ] Should we return empty array if no CSAPI conformance?
  - **Answer:** _[To be filled after research]_

- [ ] How does EDR pattern handle conformance + collections together?
  - **Answer:** _[To be filled after research]_

### 9. Error Handling

**Study:** What happens if collection endpoint is unreachable

**Questions:**
- [ ] Does the getter throw errors or return empty array?
  - **Answer:** _[To be filled after research]_

- [ ] What happens if `/collections` returns 404?
  - **Answer:** _[To be filled after research]_

- [ ] What happens if collection metadata is malformed?
  - **Answer:** _[To be filled after research]_

- [ ] Is there a default/fallback behavior?
  - **Answer:** _[To be filled after research]_

### 10. CSAPI-Specific Metadata

**Study:** Official CSAPI collection metadata from specs

**Questions:**
- [ ] What are the EXACT `featureType` values for CSAPI resources?
  - **Answer:** _[To be filled after research]_

- [ ] What link relation types indicate CSAPI endpoints (rel="systems")?
  - **Answer:** _[To be filled after research]_

- [ ] Are there version-specific indicators (Part 1 vs Part 2)?
  - **Answer:** _[To be filled after research]_

- [ ] What other metadata might indicate CSAPI support?
  - **Answer:** _[To be filled after research]_

- [ ] Should we check for all 9 resource types or just core types?
  - **Answer:** _[To be filled after research]_

---

## Research Tasks

### Task 1: Study EDR Collection Parsing
- [ ] Find `parseCollections()` or similar function in info.ts
- [ ] Document exact implementation line-by-line
- [ ] Extract function signature
- [ ] Understand collection filtering logic
- [ ] Note any comments or documentation

### Task 2: Study Collection Getter Pattern
- [ ] Read `edrCollections` getter in endpoint.ts
- [ ] Understand how it calls the parsing function
- [ ] Document the Promise pattern used
- [ ] Identify where collection data comes from
- [ ] Check how it integrates with conformance check

### Task 3: Study Collection Metadata Structure
- [ ] Find collection type definitions in model.ts
- [ ] Document all properties on collection objects
- [ ] Identify CSAPI-relevant properties (featureType, links)
- [ ] Check for optional vs required properties
- [ ] Review any validation logic

### Task 4: Study Other Collection Getters
- [ ] Find `featureCollections` getter (if exists)
- [ ] Find `tileCollections` getter (if exists)
- [ ] Compare patterns across all getters
- [ ] Identify the canonical pattern to follow

### Task 5: Review CSAPI Specifications
- [ ] Read Part 1 collection metadata section
- [ ] Read Part 2 collection metadata section
- [ ] Extract CSAPI-specific featureType values
- [ ] Document link relation types for CSAPI resources
- [ ] Check for version-specific metadata

### Task 6: Design Filter Strategy
- [ ] Determine if checking featureType is sufficient
- [ ] Decide if links array check is needed
- [ ] Consider combinations (featureType AND/OR links)
- [ ] Define the boolean logic expression
- [ ] Plan for future extensibility

---

## Upstream Code to Study

### Primary Sources
- **src/ogc-api/info.ts**
  - Collection parsing functions (if they exist)
  - EDR-specific collection filtering logic
  
- **src/ogc-api/endpoint.ts**
  - Line ~280-300: `edrCollections` getter (if exists)
  - Line ~250-270: `featureCollections` getter (if exists)
  - `this.data` property (collections data source)

- **src/ogc-api/model.ts**
  - Collection type definition
  - Collection-related types and interfaces

### Secondary Sources
- **OGC API - Connected Systems Part 1 Spec**
  - Section on collection metadata
  - featureType property definition
  - Links array for CSAPI resources

- **OGC API - Connected Systems Part 2 Spec**
  - Section on collection metadata
  - DataStream/Observation collection properties

- **SOSA/SSN Ontology Spec**
  - `sosa:System`, `sosa:Deployment`, `sosa:ObservationCollection` definitions

### Reference Analysis
- **[pr114-analysis.md](../../upstream/pr114-analysis.md)** - Section on EDR collection filtering
- **[collection-metadata-analysis.md](../../requirements/csapi-collection-metadata.md)** - CSAPI collection structure

---

## Deliverables

### 1. Research Plan (This Document)
- [x] Define all research questions
- [ ] Fill in answers as research progresses
- [ ] Mark completed tasks
- [ ] Document key findings inline

### 2. Analysis Report
**File:** `collections-reader-analysis.md` (to be created in this folder)

**Important:** The analysis report MUST include a reference to the [Development Standards](../../../planning/csapi-implementation-guide.md#development-standards) section from the implementation guide. All design decisions should follow these standards for code quality, documentation, and testing.

**Required Sections:**
1. **Executive Summary**
   - Collection filtering approach (featureType-based, links-based, or both)
   - Recommended detection strategy

2. **Filter Function Design**
   - Exact function signature
   - Implementation code (full function)
   - Filtering logic and criteria

3. **Collection Metadata Structure**
   - TypeScript type definitions
   - CSAPI-relevant properties (featureType, links)
   - How to identify CSAPI collections

4. **CSAPI Collection Indicators**
   - Complete list of valid `featureType` values
   - Link relation types for CSAPI resources
   - Which properties to check and why

5. **Getter Implementation**
   - How `csapiCollections` getter calls the filter function
   - Promise handling pattern
   - Integration with `hasConnectedSystems` conformance check

6. **Detection Logic**
   - Boolean expression for filtering
   - Why checking featureType vs links vs both
   - Future-proofing for additional resource types

7. **Error Handling**
   - What happens if collections endpoint fails
   - Default behavior for missing collections
   - Edge cases and fallbacks

8. **Integration Points**
   - Exact line in info.ts to add filter function
   - Exact line in endpoint.ts to add getter
   - Integration with factory method from Component 1

9. **Testing Approach**
   - How to test collection filtering
   - Mock collection metadata
   - Edge cases to test

10. **Implementation Checklist**
    - Step-by-step implementation guide
    - Validation steps
    - Integration verification

### 3. Code Artifacts
**Optional but recommended:**
- Draft filter function implementation
- Example collection metadata (fixtures)
- Test cases

---

## Success Criteria

This research is complete when:

- [ ] All critical questions have answers
- [ ] Analysis report is written and reviewed
- [ ] Filter function implementation is fully specified
- [ ] CSAPI collection indicators are documented
- [ ] Detection logic is clearly defined
- [ ] Integration with Component 2 is verified
- [ ] Error scenarios are identified and handled
- [ ] Testing strategy is defined

---

## Next Steps

1. **DO NOT START IMPLEMENTATION** - This is research only
2. Review this plan for completeness
3. Begin research with Task 1 (Study EDR collection parsing)
4. Fill in answers as research progresses
5. Create analysis report when research is complete
6. Mark component complete in [design-sequence.md](../design-sequence.md)
7. Move to Component #4 (CSAPIQueryBuilder)

---

## Notes

- This component is slightly more complex than Component 2 (~15 lines vs ~7 lines)
- Depends on Component 2 (uses `hasConnectedSystems` getter)
- Critical for enabling the factory method from Component 1
- Filter strategy (featureType vs links vs both) is the key decision
- Function will be called when developers query `csapiCollections` getter
- Must be efficient - no heavy processing, just array filtering

---

## Dependencies

**Depends On:**
- Component 2 (Conformance Reader) - Provides `hasConnectedSystems` getter to check CSAPI support

**Required By:**
- Component 1 (OgcApiEndpoint Integration) - Factory method may use `csapiCollections` to validate collection ID
- Component 4 (CSAPIQueryBuilder) - Developers use `csapiCollections` to discover available collections

**Integration Point:**
```typescript
// In endpoint.ts (from Component 1)
public async csapi(collection_id: string): Promise<CSAPIQueryBuilder> {
  if (!this.hasConnectedSystems) {  // ← Component 2 conformance check
    throw new EndpointError('Endpoint does not support Connected Systems API');
  }
  // Could also validate collection_id is in csapiCollections ← This component
  const collection = await this.getCollectionInfo(collection_id);
  const result = new CSAPIQueryBuilder(collection);
  return result;
}
```

**Developer Usage:**
```typescript
// Discover CSAPI collections
const csapiCollections = await endpoint.csapiCollections;
// ['sensors-collection', 'weather-stations', 'iot-devices']

// Then query specific collection
const csapi = await endpoint.csapi('sensors-collection');
```

---

## Key Design Decisions to Research

1. **Detection Strategy:** Check featureType only vs links only vs both?
2. **featureType Values:** Which SOSA/SSN values indicate CSAPI? All 9 types or just core?
3. **Link Relations:** Which link rel values indicate CSAPI endpoints?
4. **Part 1 vs Part 2:** How to distinguish or do we need to?
5. **Error Strategy:** Return empty array, throw error, or default assumption?
6. **Filtering Efficiency:** Filter once or multiple times? Cache results?

These decisions will be documented in the analysis report with rationale.
