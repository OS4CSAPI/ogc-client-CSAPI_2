# Requirements Research Strategy

**Purpose:** Systematically identify ALL functional requirements for CSAPI client implementation to avoid gaps and missed functionality.

**Context:** Previous iterations missed requirements (e.g., SensorML parsing). Need comprehensive requirement discovery BEFORE writing functional specification.

**Approach:** Research-first methodology - investigate multiple sources, document findings, synthesize into complete functional specification.

**Date:** 2026-01-31

---

## Research Methodology

**Pattern:** Similar to design-strategy-research.md approach

1. **Identify requirement sources** (this document)
2. **Research each source systematically** (create analysis documents)
3. **Document findings and insights** (comprehensive analyses)
4. **Synthesize into functional specification** (after research complete)

**Goal:** Ensure we capture 100% of what the implementation needs to do.

---

## Requirement Sources

### Section 1: CSAPI Part 1 Specification Analysis ⏳

**Source:** [OGC API – Connected Systems Part 1: Feature Resources](https://docs.ogc.org/is/23-001/23-001.html)
**OpenAPI:** docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml

**Questions to answer:**
- [ ] What are ALL operations for each resource type? (Systems, Deployments, Procedures, Sampling Features, Properties)
- [ ] What HTTP methods are required? (GET, POST, PUT, DELETE, PATCH?)
- [ ] What query parameters must be supported?
- [ ] What request bodies are needed for create/update operations?
- [ ] What response formats must be supported? (GeoJSON, SensorML)
- [ ] What conformance classes exist and what do they require?
- [ ] What link relations are defined and required?
- [ ] What's the relationship model between resources?
- [ ] What are the history/versioning requirements?
- [ ] What filtering capabilities are specified?

**Deliverable:** Detailed analysis of Part 1 requirements (~800-1200 lines)

---

### Section 2: CSAPI Part 2 Specification Analysis ⏳

**Source:** [OGC API – Connected Systems Part 2: Dynamic Data](https://docs.ogc.org/is/23-002/23-002.html)
**OpenAPI:** docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml

**Questions to answer:**
- [ ] What are ALL operations for dynamic data resources? (Datastreams, Observations, Control Streams, Commands)
- [ ] What's different from Part 1 patterns?
- [ ] What schema operations are required? (DataStream schema, Control Stream schema)
- [ ] What status/result operations exist? (Command status, Command result)
- [ ] What streaming/pagination patterns are used?
- [ ] What temporal query requirements exist?
- [ ] How do observations relate to datastreams?
- [ ] How do commands relate to control streams?
- [ ] What format options exist? (protobuf, SWE Common)
- [ ] What real-time requirements exist (if any)?

**Deliverable:** Detailed analysis of Part 2 requirements (~800-1200 lines)

---

### Section 3: Format Requirements Analysis ⏳

**Sources:** 
- CSAPI specs (both parts)
- SensorML 3.0 spec
- SWE Common 3.0 spec  
- GeoJSON RFC 7946

**Questions to answer:**
- [ ] What formats MUST the library support?
- [ ] What formats are OPTIONAL but commonly used?
- [ ] Does library need to parse formats or just request them?
- [ ] Does library need to serialize formats for POST/PUT?
- [ ] What's the scope of SensorML support? (SimpleProcess, AggregateProcess, PhysicalSystem, etc.)
- [ ] What's the scope of SWE Common support? (DataArray, DataRecord, Quantity, etc.)
- [ ] What format negotiation mechanisms are required? (Accept headers, query params)
- [ ] Are there format validation requirements?
- [ ] What's the minimum viable format support?
- [ ] What did previous iterations get wrong about format requirements?

**Deliverable:** Complete format requirements analysis (~600-1000 lines)

---

### Section 4: Query Parameter Requirements ⏳

**Sources:**
- CSAPI OpenAPI specs
- OGC API Common standards
- Query examples from specs

**Questions to answer:**
- [ ] What are ALL standard OGC API query parameters? (bbox, datetime, limit, offset, f)
- [ ] What are CSAPI-specific query parameters?
- [ ] What parameter types exist? (spatial, temporal, pagination, format, filtering)
- [ ] What encoding rules apply? (bbox arrays, datetime intervals, URL encoding)
- [ ] What parameter combinations are valid?
- [ ] What parameter validation is required?
- [ ] What are parameter defaults?
- [ ] What parameters are required vs optional?
- [ ] Are there parameter constraints? (min/max values, format restrictions)
- [ ] How do parameters interact with resource types?

**Deliverable:** Comprehensive query parameter catalog (~500-800 lines)

---

### Section 5: CRUD Operation Requirements ⏳

**Sources:**
- CSAPI OpenAPI specs
- HTTP method specifications
- Request/response examples

**Questions to answer:**
- [ ] Which resources support full CRUD? (Create, Read, Update, Delete)
- [ ] Which resources are read-only?
- [ ] What HTTP methods map to which operations?
- [ ] What request bodies are needed for create operations?
- [ ] What request bodies are needed for update operations?
- [ ] Is PATCH supported? What does it do?
- [ ] What's the difference between PUT and PATCH?
- [ ] What response codes are expected?
- [ ] What headers are required for write operations?
- [ ] Does library build request bodies or just URLs?

**Deliverable:** CRUD operation matrix and requirements (~400-600 lines)

---

### Section 6: Sub-Resource Navigation Requirements ⏳

**Sources:**
- CSAPI spec section on relationships
- OpenAPI paths for sub-resources
- Link relation specifications

**Questions to answer:**
- [ ] What are ALL sub-resource relationships? (systems/{id}/datastreams, etc.)
- [ ] How deep does nesting go? (2 levels? 3 levels?)
- [ ] What sub-resource query parameters are supported?
- [ ] Are sub-resource collections paginated?
- [ ] Can sub-resources be created via parent URLs?
- [ ] What link relations exist for sub-resources?
- [ ] How do bidirectional relationships work? (systems->deployments, deployments->systems)
- [ ] What's the canonical URL for a sub-resource vs relationship URL?
- [ ] Are there sub-resource filtering capabilities?
- [ ] What navigation patterns are required?

**Deliverable:** Sub-resource relationship model and requirements (~500-700 lines)

---

### Section 7: Conformance and Capability Requirements ⏳

**Sources:**
- CSAPI conformance class definitions
- Requirements classes in spec
- Collection-level capabilities

**Questions to answer:**
- [ ] What conformance classes exist?
- [ ] What does each conformance class require?
- [ ] How do we detect which conformance classes an endpoint supports?
- [ ] What's the minimum conformance for a valid CSAPI endpoint?
- [ ] What capabilities can vary by collection?
- [ ] How do we detect resource availability per collection?
- [ ] What's required vs optional at the endpoint level?
- [ ] What's required vs optional at the collection level?
- [ ] How do conformance classes relate to features?
- [ ] What validation do we need for non-conformant endpoints?

**Deliverable:** Conformance requirements and detection strategy (~400-600 lines)

---

### Section 8: Data Type and Schema Requirements ⏳

**Sources:**
- CSAPI data models
- SWE Common schemas
- GeoJSON schemas
- TypeScript type requirements

**Questions to answer:**
- [ ] What TypeScript interfaces does library export?
- [ ] What domain model types are needed? (System, Deployment, Observation, etc.)
- [ ] What query option types are needed?
- [ ] What response types are needed?
- [ ] Does library provide types for SensorML structures?
- [ ] Does library provide types for SWE Common structures?
- [ ] What's the scope of type definitions? (minimal vs comprehensive)
- [ ] Are types for request bodies needed?
- [ ] Are generic types needed? (Resource<T>, Collection<T>)
- [ ] What's the balance between type safety and flexibility?

**Deliverable:** Type system requirements and scope definition (~500-700 lines)

---

### Section 9: Real-World Usage Scenario Requirements ⏳

**Sources:**
- osh-viewer codebase
- oscar-viewer codebase
- OpenSensorHub examples
- Common CSAPI use cases

**Questions to answer:**
- [ ] What are the top 10 most common usage scenarios?
- [ ] What API calls do real applications make most often?
- [ ] What functionality do existing CSAPI clients use?
- [ ] What workflows need to be supported? (discover systems, fetch observations, send commands)
- [ ] What convenience methods would reduce user code?
- [ ] What error conditions do users commonly encounter?
- [ ] What integration patterns exist? (with OpenLayers, Leaflet, etc.)
- [ ] What data transformation needs exist?
- [ ] What are typical query patterns? (bbox + datetime filters, etc.)
- [ ] What requirements emerge from actual usage vs spec reading?

**Deliverable:** Usage scenario requirements and priorities (~600-800 lines)

---

### Section 10: Gap Analysis - Previous Iteration Misses ⏳

**Sources:**
- Previous iteration code (OS4CSAPI/ogc-client-CSAPI)
- Draft PR #131 feedback
- Known missing functionality

**Questions to answer:**
- [ ] What did previous iteration implement that shouldn't have been?
- [ ] What did previous iteration miss that should have been included?
- [ ] What functionality was half-implemented?
- [ ] What ambiguous requirements caused implementation errors?
- [ ] Where did we make wrong assumptions about scope?
- [ ] What examples: SensorML parsing - should it have been included?
- [ ] What format serialization requirements exist?
- [ ] What validation requirements were missed?
- [ ] What edge cases were not considered?
- [ ] What requirements are implied but not explicit in specs?

**Deliverable:** Comprehensive gap analysis and requirement corrections (~500-700 lines)

---

### Section 11: Upstream Library Expectations ⏳

**Sources:**
- ogc-client contribution guidelines
- PR review patterns
- Maintainer feedback
- Similar library precedents

**Questions to answer:**
- [ ] What does upstream expect a client library to do vs not do?
- [ ] Where's the line between library responsibility and user responsibility?
- [ ] What level of validation is expected?
- [ ] What level of error handling is expected?
- [ ] What documentation is required? (JSDoc, README examples, etc.)
- [ ] What export patterns are expected?
- [ ] What backward compatibility requirements exist?
- [ ] What performance expectations exist?
- [ ] What browser/Node.js compatibility is required?
- [ ] What bundle size constraints exist?

**Deliverable:** Library contract and expectations analysis (~400-600 lines)

---

### Section 12: Minimum Viable vs Full Feature Set ⏳

**Sources:**
- All previous sections
- CSAPI spec (required vs optional features)
- Resource prioritization

**Questions to answer:**
- [ ] What's the absolute minimum for a valid CSAPI client?
- [ ] What's the core feature set (must-have)?
- [ ] What's the extended feature set (nice-to-have)?
- [ ] What's explicitly out of scope?
- [ ] Could implementation be phased? (Part 1 first, Part 2 later?)
- [ ] What resources are most critical? (Systems, Datastreams vs others?)
- [ ] What query capabilities are most critical?
- [ ] What format support is most critical?
- [ ] What can be added in future iterations?
- [ ] What's the MVP for PR acceptance?

**Deliverable:** Prioritized feature matrix and phasing strategy (~400-600 lines)

---

## Success Criteria

Requirements research is complete when we can answer:

1. ✅ "What are ALL operations the library must support?"
2. ✅ "What formats must be supported and to what extent?"
3. ✅ "What's in scope vs out of scope?"
4. ✅ "What query parameters are required?"
5. ✅ "What CRUD operations exist for each resource?"
6. ✅ "What sub-resource relationships must be navigable?"
7. ✅ "What conformance/capability detection is needed?"
8. ✅ "What TypeScript types must be exported?"
9. ✅ "What do real-world applications actually need?"
10. ✅ "What did previous iterations get wrong about requirements?"
11. ✅ "What does upstream expect from the contribution?"
12. ✅ "What's the MVP vs full feature set?"

---

## Deliverables

### Analysis Documents (in docs/research/requirements/)

1. **csapi-part1-requirements.md** - Complete Part 1 analysis
2. **csapi-part2-requirements.md** - Complete Part 2 analysis
3. **format-requirements.md** - Format support scope and rationale
4. **query-parameters.md** - Complete query parameter catalog
5. **crud-operations.md** - CRUD operation matrix
6. **sub-resource-navigation.md** - Relationship model
7. **conformance-requirements.md** - Conformance detection strategy
8. **type-system-requirements.md** - TypeScript type scope
9. **usage-scenarios.md** - Real-world requirement validation
10. **gap-analysis.md** - Previous iteration lessons
11. **library-expectations.md** - Upstream contract
12. **mvp-definition.md** - Prioritized feature matrix

**Total Expected Output:** ~6,000-9,000 lines of requirements analysis

### Synthesis Document (in docs/specification/)

**functional-specification.md** - Complete functional spec synthesized from research

- Method catalog (all 70-80+ methods)
- Type definitions
- Query parameter reference
- Usage examples
- Acceptance criteria
- CSAPI coverage matrix

**Expected Output:** ~1,000-1,500 lines

---

## Next Steps

**Phase 1: Requirements Discovery**
1. Start with Section 1 (CSAPI Part 1) - most foundational
2. Progress through sections sequentially
3. Each section produces detailed analysis document
4. Update this checklist as sections complete

**Phase 2: Requirements Synthesis**
1. Review all analysis documents
2. Identify conflicts or ambiguities
3. Make scope decisions
4. Write functional specification

**Phase 3: Validation**
1. Compare functional spec to CSAPI OpenAPI schemas
2. Validate against real-world usage patterns
3. Verify nothing critical is missing
4. Get agreement on scope before implementation

---

## Critical Constraints

**Must maintain from design research:**
- ✅ URL building only (no data fetching in library)
- ✅ Minimal validation (trust TypeScript + server)
- ✅ Single QueryBuilder class
- ✅ ~560-760 lines implementation target
- ✅ Follow EDR pattern exactly

**Requirements must respect:**
- Design decisions are fixed (architecture is decided)
- Requirements define "what" not "how"
- Scope must fit within code volume constraints
- Format requirements must justify any parsing/serialization

---

## Research Order

**Recommended sequence:**

1. ✅ **Section 1** - CSAPI Part 1 (foundation)
2. ✅ **Section 2** - CSAPI Part 2 (complete spec coverage)
3. ✅ **Section 3** - Format Requirements (critical scope decision)
4. ✅ **Section 4** - Query Parameters (defines interface)
5. ✅ **Section 5** - CRUD Operations (defines scope per resource)
6. ✅ **Section 6** - Sub-Resource Navigation (defines relationships)
7. ✅ **Section 7** - Conformance Requirements (defines detection)
8. ✅ **Section 8** - Type System (defines exports)
9. ✅ **Section 9** - Usage Scenarios (validates priorities)
10. ✅ **Section 10** - Gap Analysis (prevents past mistakes)
11. ✅ **Section 11** - Library Expectations (aligns with upstream)
12. ✅ **Section 12** - MVP Definition (finalizes scope)

**Rationale:** Start with spec analysis (1-2), then scope decisions (3-8), then validation (9-11), then prioritization (12).

---

## Notes

- This is similar effort to design research (~6,000-9,000 lines of analysis)
- Each section can be done independently (like design research)
- User approval before proceeding to next section
- Goal: Comprehensive requirement capture to avoid implementation gaps
- Success = functional spec that covers 100% of needed functionality
