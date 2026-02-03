# CSAPIQueryBuilder Component Research Plan

**Component:** CSAPIQueryBuilder (Component 4)
**Type:** BUILDING NEW CODE
**Pattern:** Single class following EDRQueryBuilder pattern
**Scope:** ~10k-14k lines (~70% of total new code)
**Location:** `src/ogc-api/csapi/url_builder.js`

---

## 1. Purpose

Document research objectives and methodology for implementing the CSAPIQueryBuilder class, which is the heart of the CSAPI implementation. This single class provides URL construction methods for all 9 CSAPI resource types (Systems, Deployments, Procedures, Sampling Features, Properties, DataStreams, Observations, Control Streams, Commands), implementing approximately 60-70 unique URL patterns with full CRUD operations, comprehensive query parameters, spatial/temporal/hierarchical filtering, pagination support, and schema endpoints. The QueryBuilder follows the EDRQueryBuilder pattern from upstream PR #114 where one comprehensive class per API family handles all URL construction for that API, accessed via `endpoint.csapi(collectionId)`. This component defines the URL patterns and query parameter structures that all downstream format handlers will parse and all validators will check, making it the architectural foundation that other components build upon.

---

## 2. Context

### Implementation Type
**BUILDING NEW CODE** - This is a new class we're adding to the library, not extending existing functionality.

### Upstream Pattern
The CSAPIQueryBuilder follows the **EDRQueryBuilder pattern** established in the upstream repository:
- Single comprehensive class accessed via factory method: `endpoint.csapi(collectionId)`
- Contains methods for all resource types (not 9 separate classes)
- Instantiated by OgcApiEndpoint and cached for reuse
- Encapsulates collection-specific metadata (from CSAPI collection info)
- Provides both URL-building methods and optional query execution methods
- Validates parameters against collection capabilities

### Key References
- [csapi-implementation-guide.md](../../../planning/csapi-implementation-guide.md#csapiquerybuilder-building-new-query-construction-class): Specification for CSAPIQueryBuilder including all 9 resource types
- [querybuilder-pattern-analysis.md](../../../research/upstream/querybuilder-pattern-analysis.md): Detailed analysis of QueryBuilder pattern from EDR implementation
- [url-building-analysis.md](../../../research/upstream/url-building-analysis.md): URL construction patterns and query parameter assembly
- [OGC API - Connected Systems Part 1: OpenAPI](../../../research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml): Part 1 endpoint definitions
- [OGC API - Connected Systems Part 2: OpenAPI](../../../research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml): Part 2 endpoint definitions

### Scope and Complexity
This is the largest single component in the CSAPI implementation:
- **Code volume:** ~10k-14k lines (70% of total new code)
- **URL patterns:** 60-70 unique URL patterns across 9 resource types
- **Operations:** Full CRUD (Create, Read, Update, Delete) not just read-only
- **Query parameters:** Spatial (bbox), temporal (datetime, phenomenonTime), hierarchical (recursive), relationship (parent, system, foi), pagination (offset-based, cursor-based), format negotiation (f, obsFormat, cmdFormat), property-based filtering
- **Resource types:** Part 1 (Systems, Deployments, Procedures, Sampling Features, Properties) + Part 2 (DataStreams, Observations, Control Streams, Commands)
- **Special endpoints:** Schema endpoints, command status/result endpoints, feasibility checking, bulk operations

---

## 3. Research Objectives

### Primary Objectives

1. **Understand EDRQueryBuilder Pattern:**
   - How is EDRQueryBuilder instantiated via factory method?
   - What metadata does it encapsulate from collection info?
   - How does caching work in the factory method?
   - What is the lifecycle of a QueryBuilder instance?
   - How are query methods organized (URL building vs execution)?

2. **Design Single-Class Architecture for 9 Resource Types:**
   - How should methods be organized within one class?
   - What method naming conventions follow EDR pattern?
   - How to group methods logically by resource type?
   - How to avoid code duplication across resource types?
   - How to maintain consistency across 60-70 URL patterns?

3. **Implement URL Construction for All CSAPI Resources:**
   - What are the canonical endpoint patterns for each resource type?
   - What are the nested endpoint patterns (e.g., `/systems/{id}/subsystems`)?
   - How to build URLs with query parameters?
   - How to encode array parameters (multiple IDs, bounding boxes)?
   - How to handle format negotiation (`f` parameter)?

4. **Support Full CRUD Operations:**
   - What HTTP methods (GET, POST, PUT, PATCH, DELETE) for each operation?
   - How to construct bodies for POST/PUT/PATCH requests?
   - How to pass request bodies through URL builder methods?
   - What validation should occur before making requests?
   - How to handle cascade delete parameters?

5. **Implement Comprehensive Query Parameter Support:**
   - What are ALL standard OGC API parameters (bbox, datetime, limit, offset, f)?
   - What are ALL CSAPI common parameters (id, uid, q, propertyName filters)?
   - What are hierarchical parameters (recursive)?
   - What are relationship parameters (parent, system, foi, observedProperty, etc.)?
   - What are temporal parameters (phenomenonTime, resultTime, executionTime, issueTime)?
   - How to combine multiple parameters (AND logic)?
   - How to encode spatial bounding boxes (2D vs 3D)?
   - How to encode temporal intervals (ISO 8601)?

6. **Support Pagination:**
   - How does offset-based pagination work (Part 1 style)?
   - How does cursor-based pagination work (Part 2 style)?
   - What are the limit parameter constraints (1 to 10,000 for Part 2)?
   - How to extract next/prev cursor tokens from responses?

7. **Implement Resource-Specific Requirements:**
   - **Systems:** Hierarchical queries (recursive subsystems), relationship filtering, spatial queries
   - **Deployments:** Spatial extent queries, temporal validity, system associations
   - **Procedures:** System associations, SensorML format support
   - **Sampling Features:** Spatial queries, feature of interest relationships, system associations
   - **Properties:** Property hierarchies (baseProperty), system associations, read-only operations
   - **DataStreams:** Schema endpoints, system/property relationships, result format parameters
   - **Observations:** Temporal queries (phenomenonTime primary), cursor-based pagination, bulk operations, schema validation
   - **Control Streams:** Schema endpoints, controlled property relationships, execution modes
   - **Commands:** Temporal queries, status/result endpoints, feasibility checking, bulk operations, status filtering

8. **Define Data Structures for Handlers:**
   - What TypeScript interfaces should be defined for query parameters?
   - What parameter validation is needed?
   - What response structures will handlers parse?
   - How to type method return values?

### Secondary Objectives

1. **Performance Optimization:**
   - How to efficiently encode query strings?
   - When to validate parameters (before request vs on server)?
   - How to reuse URL construction logic across resource types?

2. **Error Handling:**
   - What validations should throw errors vs warnings?
   - How to validate collection capabilities before building URLs?
   - How to handle missing required parameters?

3. **Extensibility:**
   - How to design for future CSAPI extensions?
   - How to add new resource types without breaking existing code?
   - How to support custom query parameters?

---

## 4. Critical Research Questions

### A. EDRQueryBuilder Pattern Study

**Questions:**

1. **Instantiation:** How is EDRQueryBuilder instantiated in `endpoint.edr(collectionId)`? What's the factory method implementation?

**Answer:**


2. **Metadata Encapsulation:** What metadata from `OgcApiCollectionInfo` does EDRQueryBuilder encapsulate? What properties are extracted?

**Answer:**


3. **Caching Strategy:** How does the factory method cache QueryBuilder instances? What is the cache key? When is cache invalidated?

**Answer:**


4. **Lifecycle:** What happens in the EDRQueryBuilder constructor? What validation occurs? What state is initialized?

**Answer:**


5. **Method Organization:** How are EDR query methods organized? Are they grouped by query type? What naming conventions are used?

**Answer:**


6. **URL Building vs Execution:** Does EDRQueryBuilder provide both `buildXxxUrl()` methods (return URL) and `getXxx()` methods (execute and return data)? What's the pattern?

**Answer:**


7. **Collection Validation:** How does EDRQueryBuilder validate that a collection supports EDR operations? What errors are thrown?

**Answer:**


### B. Single-Class Architecture for 9 Resource Types

**Questions:**

8. **Method Grouping:** How should we organize methods for 9 resource types within one class? By resource type sections? By operation type (CRUD)? Both?

**Answer:**


9. **Method Naming:** What naming convention should we use for methods? `getSystems()`, `getSystemById(id)`, `createSystem(body)`, `updateSystem(id, body)`, `deleteSystem(id)`? How does this scale to 9 resource types?

**Answer:**


10. **Code Reuse:** What patterns can reduce duplication across resource types? Can we abstract common URL construction logic? Can we use helper methods?

**Answer:**


11. **Nested Endpoints:** How to handle nested endpoints like `/systems/{id}/subsystems`? Separate methods like `getSubsystems(parentId)` or parameters like `getSystems({ parent: id })`?

**Answer:**


12. **State Management:** What state should CSAPIQueryBuilder maintain? Collection metadata? Supported resource types? Capabilities flags?

**Answer:**


### C. URL Construction Patterns

**Questions:**

13. **Canonical Endpoints:** What are the URL patterns for canonical resource endpoints? `/systems`, `/deployments`, `/procedures`, `/samplingFeatures`, `/properties`, `/datastreams`, `/observations`, `/controlstreams`, `/commands`?

**Answer:**


14. **Nested Endpoints:** What are ALL nested endpoint patterns? (e.g., `/systems/{id}/subsystems`, `/systems/{id}/datastreams`, `/datastreams/{id}/observations`, `/controlstreams/{id}/commands`)?

**Answer:**


15. **Schema Endpoints:** What are the schema endpoint patterns? `/datastreams/{id}/schema`, `/controlstreams/{id}/schema`?

**Answer:**


16. **Special Endpoints:** What are the special-purpose endpoints? `/commands/{id}/status`, `/commands/{id}/result`, `/controlstreams/{id}/feasibility`?

**Answer:**


17. **Query String Assembly:** How to construct query strings from parameter objects? How to handle URL encoding? How to serialize arrays?

**Answer:**


18. **Base URL Construction:** How to combine base URL + collection path + resource path + query string? How to handle trailing slashes?

**Answer:**


### D. CRUD Operations Implementation

**Questions:**

19. **HTTP Methods:** What HTTP methods map to what CRUD operations? GET = Read, POST = Create, PUT = Replace, PATCH = Update, DELETE = Delete?

**Answer:**


20. **Request Bodies:** For POST/PUT/PATCH, how to pass request bodies? Method parameter? TypeScript interface for body structure?

**Answer:**


21. **Content-Type Headers:** What Content-Type headers for different body formats? `application/json`, `application/geo+json`, `application/sml+json`?

**Answer:**


22. **Response Handling:** Should QueryBuilder methods return URLs only or execute requests and return parsed data? Or both patterns?

**Answer:**


23. **Cascade Delete:** How to support cascade delete? Query parameter `?cascade=true`? Separate method?

**Answer:**


### E. Standard OGC API Query Parameters

**Questions:**

24. **bbox Parameter:** How to encode spatial bounding box? Comma-separated coordinates? 2D vs 3D support? CRS parameter?

**Answer:**


25. **datetime Parameter:** How to encode temporal intervals? ISO 8601 format? Single instant vs interval? Open intervals (`../2024-01-31`, `2024-01-01/..`)?

**Answer:**


26. **limit Parameter:** What are valid range values? 1 to 10,000 for Part 2? Different defaults for Part 1 vs Part 2?

**Answer:**


27. **offset Parameter:** How does offset-based pagination work? Combined with limit? Start at 0 or 1?

**Answer:**


28. **f Parameter:** What format values are supported? `json`, `geojson`, `sml+json`, `swe+json`, `swe+text`, `html`?

**Answer:**


### F. CSAPI-Specific Query Parameters

**Questions:**

29. **id Parameter:** How to filter by multiple IDs? Comma-separated list? OR logic? Example: `id=sys1,sys2,sys3`?

**Answer:**


30. **uid Parameter:** How to filter by unique identifier? URN format? Single value or multiple?

**Answer:**


31. **q Parameter:** How does full-text search work? What properties are searched? Case sensitivity?

**Answer:**


32. **Property Filters:** How to filter by arbitrary resource properties? Example: `name=Weather%20Station`, `systemType=sosa:Sensor`?

**Answer:**


33. **recursive Parameter:** How does hierarchical recursion work? Boolean flag? `recursive=true` for all descendants?

**Answer:**


34. **parent Parameter:** How to filter by parent resource? Single ID or multiple? Apply to systems and deployments?

**Answer:**


35. **system Parameter:** How to filter resources by associated system? Single ID or multiple? Apply to which resource types?

**Answer:**


36. **deployment Parameter:** How to filter by deployment? Single ID or multiple?

**Answer:**


37. **procedure Parameter:** How to filter by procedure? Single ID or multiple?

**Answer:**


38. **foi Parameter:** How to filter by feature of interest? Single ID or multiple?

**Answer:**


39. **observedProperty Parameter:** How to filter by observed property? URI or ID? Single or multiple?

**Answer:**


40. **controlledProperty Parameter:** How to filter by controlled property? URI or ID? Single or multiple?

**Answer:**


41. **baseProperty Parameter:** How to filter properties by base property? Property hierarchy?

**Answer:**


### G. Part 2 Temporal Query Parameters

**Questions:**

42. **phenomenonTime Parameter:** How to encode when observation was made? ISO 8601 intervals? Primary temporal filter for observations?

**Answer:**


43. **resultTime Parameter:** How to encode when result became available? ISO 8601 intervals?

**Answer:**


44. **executionTime Parameter:** How to encode when command should be/was executed? ISO 8601 intervals?

**Answer:**


45. **issueTime Parameter:** How to encode when command was issued? ISO 8601 intervals?

**Answer:**


46. **Temporal Interval Syntax:** What is the complete ISO 8601 interval syntax? Single instant, closed interval, open start, open end, multiple disjoint intervals?

**Answer:**


### H. Pagination Implementation

**Questions:**

47. **Offset-Based Pagination:** How to implement Part 1 style pagination? `limit` + `offset` parameters? How to calculate next page offset?

**Answer:**


48. **Cursor-Based Pagination:** How to implement Part 2 style pagination? `limit` + `cursor` parameters? How to extract cursor from responses?

**Answer:**


49. **Pagination Limits:** What are the limit constraints? Min 1, max 10,000 for Part 2? Different for Part 1?

**Answer:**


50. **Link Headers:** Should QueryBuilder parse Link headers for next/prev pages? Or leave to handlers?

**Answer:**


### I. Systems Resource Methods

**Questions:**

51. **Systems Endpoints:** What are ALL Systems endpoints? List all, get by ID, query, subsystems, by deployment, by procedure, in collection?

**Answer:**


52. **Systems Query Parameters:** What query parameters apply to Systems? bbox, datetime, recursive, parent, deployment, procedure, foi, id, uid, q, properties, limit, offset, f?

**Answer:**


53. **Subsystems Hierarchy:** How to query subsystems? Recursive flag? `/systems/{id}/subsystems?recursive=true`?

**Answer:**


54. **Systems CRUD:** What CRUD operations for Systems? POST `/systems`, PUT/PATCH `/systems/{id}`, DELETE `/systems/{id}?cascade=true`?

**Answer:**


### J. Deployments Resource Methods

**Questions:**

55. **Deployments Endpoints:** What are ALL Deployments endpoints? List all, get by ID, query, subdeployments, by system, in collection?

**Answer:**


56. **Deployments Query Parameters:** What query parameters apply to Deployments? bbox, datetime, system, recursive, parent, id, uid, q, properties, limit, offset, f?

**Answer:**


57. **Subdeployments Hierarchy:** How to query subdeployments? Recursive flag? `/deployments/{id}/subdeployments?recursive=true`?

**Answer:**


58. **Deployments CRUD:** What CRUD operations for Deployments? POST, PUT/PATCH, DELETE with cascade?

**Answer:**


### K. Procedures Resource Methods

**Questions:**

59. **Procedures Endpoints:** What are ALL Procedures endpoints? List all, get by ID, query, by system, in collection?

**Answer:**


60. **Procedures Query Parameters:** What query parameters apply to Procedures? system, id, uid, q, properties, limit, offset, f?

**Answer:**


61. **Procedures CRUD:** What CRUD operations for Procedures? POST, PUT/PATCH, DELETE?

**Answer:**


62. **SensorML Format:** How to handle SensorML format for Procedures? `f=sml+json` parameter?

**Answer:**


### L. Sampling Features Resource Methods

**Questions:**

63. **Sampling Features Endpoints:** What are ALL Sampling Features endpoints? List all, get by ID, query, by system, by foi, in collection?

**Answer:**


64. **Sampling Features Query Parameters:** What query parameters apply to Sampling Features? bbox, system, foi, relatedSamplingFeature, id, uid, q, properties, limit, offset, f?

**Answer:**


65. **Sampling Features CRUD:** What CRUD operations for Sampling Features? POST, PUT/PATCH, DELETE?

**Answer:**


### M. Properties Resource Methods

**Questions:**

66. **Properties Endpoints:** What are ALL Properties endpoints? List all, get by ID, query, by system, by base property, in collection?

**Answer:**


67. **Properties Query Parameters:** What query parameters apply to Properties? system, baseProperty, id, uid, q, properties, limit, offset, f?

**Answer:**


68. **Properties Read-Only:** Are Properties read-only (GET only)? No CRUD operations?

**Answer:**


69. **Property Hierarchy:** How to query property hierarchies? `baseProperty` parameter for parent-child relationships?

**Answer:**


### N. DataStreams Resource Methods

**Questions:**

70. **DataStreams Endpoints:** What are ALL DataStreams endpoints? List all, get by ID, query, by system, schema endpoint, in collection?

**Answer:**


71. **DataStreams Query Parameters:** What query parameters apply to DataStreams? system, observedProperty, foi, samplingFeature, procedure, datetime, id, uid, q, properties, limit, offset, f?

**Answer:**


72. **Schema Endpoint:** How to construct schema endpoint URL? `/datastreams/{id}/schema`? What format?

**Answer:**


73. **DataStreams CRUD:** What CRUD operations for DataStreams? POST, PUT/PATCH, DELETE with cascade?

**Answer:**


74. **Result Format Parameters:** Are there special format parameters for DataStreams? `obsFormat` parameter?

**Answer:**


### O. Observations Resource Methods

**Questions:**

75. **Observations Endpoints:** What are ALL Observations endpoints? List all, get by ID, by datastream, query with temporal filters?

**Answer:**


76. **Observations Query Parameters:** What query parameters apply to Observations? phenomenonTime (PRIMARY), resultTime, foi, id, limit, offset, cursor, f, obsFormat?

**Answer:**


77. **Temporal Queries:** What are ALL phenomenonTime query patterns? Single instant, closed interval, open start, open end, multiple disjoint intervals?

**Answer:**


78. **Cursor Pagination:** How to implement cursor-based pagination for Observations? Extract cursor from response headers or body? Pass as query parameter?

**Answer:**


79. **Observations CRUD:** What CRUD operations for Observations? POST single, POST bulk array, PUT (rare), DELETE?

**Answer:**


80. **Bulk Operations:** How to support bulk observation creation? POST array to `/datastreams/{id}/observations`?

**Answer:**


81. **Limit Constraints:** What is max limit for Observations? 10,000 for Part 2?

**Answer:**


### P. Control Streams Resource Methods

**Questions:**

82. **Control Streams Endpoints:** What are ALL Control Streams endpoints? List all, get by ID, query, by system, schema endpoint, in collection?

**Answer:**


83. **Control Streams Query Parameters:** What query parameters apply to Control Streams? system, controlledProperty, id, uid, q, properties, limit, offset, f?

**Answer:**


84. **Schema Endpoint:** How to construct schema endpoint URL? `/controlstreams/{id}/schema`? What format?

**Answer:**


85. **Control Streams CRUD:** What CRUD operations for Control Streams? POST, PUT/PATCH, DELETE with cascade?

**Answer:**


86. **Parameter Format:** Are there special format parameters for Control Streams? `cmdFormat` parameter?

**Answer:**


### Q. Commands Resource Methods

**Questions:**

87. **Commands Endpoints:** What are ALL Commands endpoints? List all, get by ID, by controlstream, query with temporal filters, status endpoint, result endpoint, feasibility endpoint?

**Answer:**


88. **Commands Query Parameters:** What query parameters apply to Commands? issueTime (PRIMARY), executionTime, status, controlstream, id, limit, offset, cursor, f, cmdFormat?

**Answer:**


89. **Status Endpoint:** How to construct command status endpoint? `/commands/{id}/status`? What does it return?

**Answer:**


90. **Result Endpoint:** How to construct command result endpoint? `/commands/{id}/result`? What does it return?

**Answer:**


91. **Feasibility Endpoint:** How to construct feasibility endpoint? `POST /controlstreams/{id}/feasibility` with parameters?

**Answer:**


92. **Status Filtering:** How to filter commands by status? `status` parameter with multiple values (pending, executing, completed, failed, cancelled)?

**Answer:**


93. **Temporal Queries:** What are issueTime and executionTime query patterns? ISO 8601 intervals?

**Answer:**


94. **Commands CRUD:** What CRUD operations for Commands? POST single, POST bulk array, PATCH status/result, POST cancel?

**Answer:**


95. **Bulk Operations:** How to support bulk command submission? POST array to `/controlstreams/{id}/commands`?

**Answer:**


96. **Synchronous vs Asynchronous:** How do sync vs async command execution differ? Different response codes (200 vs 201)?

**Answer:**


### R. TypeScript Type Definitions

**Questions:**

97. **Query Parameter Interfaces:** What TypeScript interfaces should be defined for query parameters? One per resource type? Common parameters interface?

**Answer:**


98. **Request Body Types:** What TypeScript types for CRUD request bodies? GeoJSON features? SensorML documents? Observation/command arrays?

**Answer:**


99. **Response Types:** Should methods return typed responses or leave typing to handlers?

**Answer:**


100. **Optional vs Required Parameters:** How to type optional parameters? Partial types? Undefined allowed?

**Answer:**


### S. Code Organization and Structure

**Questions:**

101. **File Structure:** Should CSAPIQueryBuilder be one file or split across multiple files? If split, how to organize?

**Answer:**


102. **Helper Functions:** What helper functions are needed? URL encoding? Query string construction? Parameter validation?

**Answer:**


103. **Constants:** What constants should be defined? Default limits? Valid format values? Status values?

**Answer:**


104. **Documentation:** How to document 60-70 methods? JSDoc for each? Examples?

**Answer:**


### T. Testing Strategy

**Questions:**

105. **Unit Tests:** What should be unit tested? Each URL construction method? Parameter validation? Query string encoding?

**Answer:**


106. **Integration Tests:** What should be integration tested? Full request/response cycle? Actual CSAPI server interaction?

**Answer:**


107. **Test Organization:** How to organize tests for 9 resource types? Separate test files per resource? Single test file with sections?

**Answer:**


108. **Mock Data:** What mock data is needed? Mock collection info? Mock server responses?

**Answer:**


---

## 5. Research Tasks

### Task 1: Study EDRQueryBuilder Implementation

**Objective:** Understand the EDRQueryBuilder pattern in depth to apply it to CSAPIQueryBuilder.

**Actions:**
- [ ] Read querybuilder-pattern-analysis.md completely
- [ ] Study EDRQueryBuilder source code in upstream repository
- [ ] Document factory method implementation pattern
- [ ] Document caching strategy
- [ ] Document metadata encapsulation pattern
- [ ] Document method organization (URL building vs execution)
- [ ] Identify reusable patterns for CSAPI

**Deliverable:** Complete answers to Section A questions (Questions 1-7)

---

### Task 2: Design CSAPI URL Construction Architecture

**Objective:** Define all 60-70 URL patterns for CSAPI resources and design URL construction logic.

**Actions:**
- [ ] Read OGC API - Connected Systems Part 1 OpenAPI specification
- [ ] Read OGC API - Connected Systems Part 2 OpenAPI specification
- [ ] Extract ALL endpoint paths from OpenAPI specs
- [ ] Categorize endpoints: canonical, nested, schema, special-purpose
- [ ] Design query string assembly logic
- [ ] Design parameter encoding logic (arrays, spatial, temporal)
- [ ] Document all URL patterns with examples

**Deliverable:** Complete answers to Section C questions (Questions 13-18)

---

### Task 3: Define CSAPI Query Parameter Support

**Objective:** Document ALL query parameters for CSAPI and design parameter handling logic.

**Actions:**
- [ ] Read csapi-implementation-guide.md "Complete Query Parameter Support" section
- [ ] Read OGC API - Common specification for standard parameters
- [ ] Read CSAPI Part 1 specification for Part 1 parameters
- [ ] Read CSAPI Part 2 specification for Part 2 parameters
- [ ] Document parameter syntax (value formats, encoding)
- [ ] Document parameter combinations (AND logic, multiple IDs)
- [ ] Document validation requirements
- [ ] Design parameter interface types

**Deliverable:** Complete answers to Sections E, F, G, H questions (Questions 24-50)

---

### Task 4: Design Methods for Each Resource Type

**Objective:** Design method signatures and URL patterns for all 9 CSAPI resource types.

**Actions:**
- [ ] For each resource type (Systems, Deployments, Procedures, Sampling Features, Properties, DataStreams, Observations, Control Streams, Commands):
  - [ ] List ALL endpoints from OpenAPI specs
  - [ ] Define method signatures (parameters, return types)
  - [ ] Document query parameters supported
  - [ ] Document CRUD operations supported
  - [ ] Document special endpoints (schema, status, result, feasibility)
  - [ ] Document pagination support
  - [ ] Document format negotiation
- [ ] Design method naming convention
- [ ] Design code reuse strategy (helper methods)

**Deliverable:** Complete answers to Sections I-Q questions (Questions 51-96)

---

### Task 5: Design TypeScript Type System

**Objective:** Define TypeScript interfaces and types for CSAPIQueryBuilder.

**Actions:**
- [ ] Read typescript-types-analysis.md from upstream research
- [ ] Design query parameter interfaces (per resource type)
- [ ] Design request body types (GeoJSON, SensorML, observations, commands)
- [ ] Design response types (if QueryBuilder executes requests)
- [ ] Design optional vs required parameter handling
- [ ] Document type definitions

**Deliverable:** Complete answers to Section R questions (Questions 97-100)

---

### Task 6: Plan Implementation and Testing

**Objective:** Create implementation checklist and testing strategy.

**Actions:**
- [ ] Design file organization (single file vs multiple files)
- [ ] Identify helper functions needed
- [ ] Define constants (limits, formats, statuses)
- [ ] Design documentation approach (JSDoc examples)
- [ ] Design unit testing strategy (what to test, how to organize)
- [ ] Design integration testing strategy (mock server vs real server)
- [ ] Estimate implementation timeline (likely 2-3 weeks for 10k-14k lines)

**Deliverable:** Complete answers to Sections S-T questions (Questions 101-108)

---

## 6. Development Standards Reference

All implementation work for this component must follow the standards documented in:

**[csapi-implementation-guide.md - Development Standards](../../../planning/csapi-implementation-guide.md#development-standards)**

Key standards include:
- Code style and formatting conventions
- Testing requirements and coverage expectations  
- Documentation standards (JSDoc, inline comments)
- Error handling patterns
- TypeScript usage guidelines
- Naming conventions (classes, methods, variables, files)
- File organization principles

---

## 7. Success Criteria

This research phase is complete when:

- [ ] All 108 critical research questions answered with detailed findings
- [ ] EDRQueryBuilder pattern fully documented and understood
- [ ] All 60-70 CSAPI URL patterns documented with examples
- [ ] All query parameters documented with syntax and validation rules
- [ ] Method signatures designed for all 9 resource types
- [ ] TypeScript type definitions designed
- [ ] Code organization and file structure decided
- [ ] Testing strategy documented (unit + integration)
- [ ] Implementation checklist created with timeline estimate
- [ ] All research tasks completed and checked off
- [ ] Analysis document created with comprehensive findings
- [ ] Ready to begin implementation with clear specifications

---

## 8. Dependencies

### Upstream Research Required
- querybuilder-pattern-analysis.md (EDRQueryBuilder study)
- url-building-analysis.md (URL construction patterns)
- typescript-types-analysis.md (Type system design)
- csapi-architecture-analysis.md (Single-class design rationale)

### Specifications Required
- OGC API - Connected Systems Part 1 (Systems, Deployments, Procedures, Sampling Features, Properties)
- OGC API - Connected Systems Part 2 (DataStreams, Observations, Control Streams, Commands)
- OGC API - Common (Standard query parameters: bbox, datetime, limit, offset, f)
- ISO 8601 (Temporal parameter syntax)

### Previous Components Required
- Component 1: OgcApiEndpoint Integration (factory method pattern for `endpoint.csapi()`)
- Component 2: Conformance Reader (determines if CSAPI is supported)
- Component 3: Collections Reader (provides collection info to QueryBuilder)

### Informs Downstream Components
- Component 5-8: Format handlers (parse the response structures QueryBuilder requests)
- Component 9-12: Infrastructure extensions (validate URLs and parameters QueryBuilder constructs)

---

## 9. Deliverables

### Research Plan (This Document)
- 10 sections covering all aspects of CSAPIQueryBuilder research
- 108 critical research questions requiring answers
- 6 research tasks with detailed action items
- Success criteria checklist
- Dependencies mapping

### Analysis Report (To Be Created)
**File:** `csapiquerybuilder-analysis.md`

**Sections:**
1. **Executive Summary:** High-level findings and design decisions
2. **EDRQueryBuilder Pattern Analysis:** Factory method, caching, metadata encapsulation, lifecycle
3. **Single-Class Architecture Design:** Method organization for 9 resource types, code reuse strategy
4. **URL Construction Patterns:** All 60-70 URL patterns with examples and documentation
5. **Query Parameter Reference:** Complete parameter documentation (syntax, validation, combinations)
6. **Resource Type Methods:** Detailed design for each of 9 resource types (endpoints, methods, parameters, CRUD)
7. **TypeScript Type Definitions:** Interfaces and types for parameters, bodies, responses
8. **Code Organization:** File structure, helper functions, constants, documentation approach
9. **Testing Strategy:** Unit test requirements, integration test requirements, test organization
10. **Implementation Checklist:** Phased implementation plan with timeline estimate (2-3 weeks)

**Appendices:**
- Appendix A: Complete URL Pattern Catalog (all 60-70 patterns)
- Appendix B: Complete Query Parameter Catalog (all parameters with syntax)
- Appendix C: Method Signature Reference (all methods across 9 resource types)
- Appendix D: Code Reuse Patterns (helper functions and abstractions)

**Expected Length:** 2000-3000 lines (significantly larger than previous component analyses due to scope)

---

## 10. Timeline Estimate

### Research Phase (This Document)
- **Duration:** 2-3 days
- **Effort:** Study upstream patterns, read specifications, document 60-70 URL patterns, design 9 resource type method groups

### Analysis Phase (Next Document)
- **Duration:** 2-3 days  
- **Effort:** Create comprehensive analysis document, design all methods, document all parameters, create implementation checklist

### Implementation Phase (After Research Complete)
- **Duration:** 2-3 weeks
- **Effort:** Implement ~10k-14k lines of code, 60-70 URL patterns, 9 resource types, comprehensive testing

**Total Time to Complete Component 4:** ~3-4 weeks (research + implementation + testing)

**Note:** This is 5-10x longer than Components 1-3 due to scope (70% of total code volume).

---

## Notes

- This is the most complex component in the entire 12-component design
- Represents ~70% of total new code volume (~10k-14k lines)
- Contains methods for 9 resource types within one class (not 9 separate classes)
- Implements 60-70 unique URL patterns with full CRUD operations
- Defines interfaces that all downstream handlers and validators depend on
- Follows EDRQueryBuilder pattern from upstream PR #114
- Success depends on thorough research of upstream patterns and CSAPI specifications
- Implementation will require careful code organization to avoid duplication across resource types
- Testing strategy must cover all 60-70 URL patterns and all query parameter combinations
- Timeline estimate reflects significantly larger scope than previous components

---

**Status:** 🔄 IN PROGRESS - Research questions await answers
**Next Step:** Execute Task 1 (Study EDRQueryBuilder Implementation)
