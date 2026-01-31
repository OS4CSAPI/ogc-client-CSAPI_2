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

#### Section 1.1: Standard Document Analysis

**Source:** [OGC API – Connected Systems Part 1: Feature Resources](https://docs.ogc.org/is/23-001/23-001.html)

**Questions to answer:**
- [ ] What are ALL operations for each resource type according to the standard? (Systems, Deployments, Procedures, Sampling Features, Properties)
- [ ] What HTTP methods are specified in the standard text?
- [ ] What query parameters are defined in the standard?
- [ ] What request bodies are described for create/update operations?
- [ ] What response formats are required by the standard? (GeoJSON, SensorML)
- [ ] What conformance classes are defined and what requirements do they specify?
- [ ] What link relations are defined in the standard text?
- [ ] How does the standard describe relationships between resources?
- [ ] What history/versioning requirements are stated?
- [ ] What filtering capabilities does the standard specify?
- [ ] What are the requirements classes and their obligations?
- [ ] What examples are provided in the standard?

**Deliverable:** Standard document analysis (~400-500 lines)

#### Section 1.2: OpenAPI Schema Analysis

**Source:** docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml

**Questions to answer:**
- [ ] What paths are defined in the OpenAPI schema?
- [ ] What HTTP methods are specified for each path?
- [ ] What parameters are defined (path, query, header)?
- [ ] What request body schemas exist?
- [ ] What response schemas are defined?
- [ ] What are the exact parameter names, types, and constraints?
- [ ] What status codes are documented?
- [ ] What security requirements are specified?
- [ ] What examples are provided in the schema?
- [ ] What data models/schemas are defined for resources?
- [ ] What are the exact property names and types for each resource?
- [ ] What's optional vs required according to the schema?

**Deliverable:** OpenAPI schema analysis (~400-500 lines)

#### Section 1.3: Comparison and Insights

**Questions to answer:**
- [ ] Where do the standard and OpenAPI schema align perfectly?
- [ ] Where does the OpenAPI schema provide more specific details than the standard?
- [ ] Where does the standard describe things not captured in OpenAPI?
- [ ] Are there any conflicts or ambiguities between the two sources?
- [ ] What implementation details are clearer in the OpenAPI schema?
- [ ] What conceptual/requirement details are clearer in the standard?
- [ ] Which source should take precedence for specific decisions?
- [ ] What requirements emerge from reading both together?
- [ ] What examples or patterns appear in one but not the other?
- [ ] What are the implications for implementation?

**Deliverable:** Comparison analysis and insights (~200-300 lines)

**Total Section 1 Deliverable:** ~1,000-1,300 lines

---

### Section 2: CSAPI Part 2 Specification Analysis ⏳

**Source:** [OGC API – Connected Systems Part 2: Dynamic Data](https://docs.ogc.org/is/23-002/23-002.html)
**OpenAPI:** docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml

#### Section 2.1: Standard Document Analysis

**Source:** [OGC API – Connected Systems Part 2: Dynamic Data](https://docs.ogc.org/is/23-002/23-002.html)

**Questions to answer:**
- [ ] What are ALL operations for dynamic data resources according to the standard? (Datastreams, Observations, Control Streams, Commands)
- [ ] What HTTP methods are specified for dynamic data resources?
- [ ] How does the standard describe differences from Part 1 patterns?
- [ ] What schema operations are described in the standard? (DataStream schema, Control Stream schema)
- [ ] What status/result operations does the standard define? (Command status, Command result)
- [ ] What streaming/pagination patterns are specified?
- [ ] What temporal query requirements does the standard describe?
- [ ] How does the standard describe observation-datastream relationships?
- [ ] How does the standard describe command-control stream relationships?
- [ ] What format options are discussed in the standard? (protobuf, SWE Common)
- [ ] What real-time or near-real-time requirements exist?
- [ ] What conformance classes are defined for Part 2?
- [ ] What examples are provided?

**Deliverable:** Standard document analysis (~400-500 lines)

#### Section 2.2: OpenAPI Schema Analysis

**Source:** docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml

**Questions to answer:**
- [ ] What paths are defined for Datastreams, Observations, Control Streams, and Commands?
- [ ] What HTTP methods are specified for each dynamic data path?
- [ ] What parameters are defined for dynamic data endpoints?
- [ ] What request body schemas exist for observations and commands?
- [ ] What response schemas are defined for dynamic data?
- [ ] What are the schema operation endpoints and their definitions?
- [ ] What are the status/result endpoint definitions?
- [ ] What pagination/temporal query parameters are defined?
- [ ] What data models exist for Observation, DataStream, ControlStream, Command?
- [ ] What property names and types are specified?
- [ ] What's required vs optional in the schemas?
- [ ] What format media types are specified in responses?

**Deliverable:** OpenAPI schema analysis (~400-500 lines)

#### Section 2.3: Comparison and Insights

**Questions to answer:**
- [ ] Where do the Part 2 standard and OpenAPI schema align perfectly?
- [ ] Where does the OpenAPI schema provide more specifics than the standard?
- [ ] Where does the standard describe concepts not captured in OpenAPI?
- [ ] Are there any conflicts or ambiguities between the two sources?
- [ ] What patterns from Part 1 are reused vs changed in Part 2?
- [ ] How do dynamic data resources differ from feature resources architecturally?
- [ ] What implementation complexity is unique to Part 2?
- [ ] Which source clarifies the datastream-observation relationship better?
- [ ] Which source clarifies the control stream-command relationship better?
- [ ] What are the implications for client library implementation?

**Deliverable:** Comparison analysis and insights (~200-300 lines)

**Total Section 2 Deliverable:** ~1,000-1,300 lines

---

### Section 3: Format Requirements Analysis ⏳

**Resources:**

#### Standards & Specifications:
- [OGC API – Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html)
- [OGC API – Connected Systems Part 2](https://docs.ogc.org/is/23-002/23-002.html)
- [SensorML 3.0 Specification](https://docs.ogc.org/is/20-010r3/20-010r3.html)
- [SWE Common Data Model 3.0 Specification](https://docs.ogc.org/is/18-003r2/18-003r2.html)
- [GeoJSON RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946)

#### Schemas:
- docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml
- docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml
- [SensorML 3.0 JSON Schema](https://schemas.opengis.net/sensorml/3.0/sensorml.json)
- [SWE Common 3.0 JSON Schema](https://schemas.opengis.net/sweCommon/3.0/sweCommon.json)
- [GeoJSON Schema](https://geojson.org/schema/GeoJSON.json)

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

**Resources:**

#### Standards & Specifications:
- [OGC API – Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html)
- [OGC API – Connected Systems Part 2](https://docs.ogc.org/is/23-002/23-002.html)
- [OGC API - Common - Part 1: Core](https://docs.ogc.org/is/19-072/19-072.html)
- [OGC API - Common - Part 2: Geospatial Data](https://docs.ogc.org/DRAFTS/20-024.html)

#### Schemas:
- docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml
- docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml

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

**Resources:**

#### Standards & Specifications:
- [OGC API – Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html)
- [OGC API – Connected Systems Part 2](https://docs.ogc.org/is/23-002/23-002.html)
- [HTTP/1.1 Method Definitions (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html#name-methods)

#### Schemas:
- docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml
- docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml

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

**Resources:**

#### Standards & Specifications:
- [OGC API – Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html) - especially sections on relationships
- [OGC API – Connected Systems Part 2](https://docs.ogc.org/is/23-002/23-002.html) - especially sections on relationships
- [Web Linking (RFC 8288)](https://www.rfc-editor.org/rfc/rfc8288.html)
- [Link Relation Types (IANA Registry)](https://www.iana.org/assignments/link-relations/link-relations.xhtml)

#### Schemas:
- docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml
- docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml

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

**Resources:**

#### Standards & Specifications:
- [OGC API – Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html) - especially Annex A (Conformance Classes)
- [OGC API – Connected Systems Part 2](https://docs.ogc.org/is/23-002/23-002.html) - especially Annex A (Conformance Classes)
- [OGC API - Common - Part 1: Core](https://docs.ogc.org/is/19-072/19-072.html) - conformance framework

#### Schemas:
- docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml
- docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml

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

**Resources:**

#### Standards & Specifications:
- [OGC API – Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html) - data models
- [OGC API – Connected Systems Part 2](https://docs.ogc.org/is/23-002/23-002.html) - data models
- [SWE Common Data Model 3.0](https://docs.ogc.org/is/18-003r2/18-003r2.html)
- [GeoJSON RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946)

#### Schemas:
- docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml
- docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml
- [SWE Common 3.0 JSON Schema](https://schemas.opengis.net/sweCommon/3.0/sweCommon.json)
- [GeoJSON Schema](https://geojson.org/schema/GeoJSON.json)

#### Code References:
- TypeScript type patterns in ogc-client (for consistency)

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

**Resources:**

#### Reference Implementations:
- [osh-js Repository](https://github.com/opensensorhub/osh-js) - JavaScript client implementation
- [OpenSensorHub OSH-Core](https://github.com/opensensorhub/osh-core) - Java server with examples
- [OGC Connected Systems API Implementations](https://github.com/opengeospatial/connected-systems) - official examples

#### Use Case Documentation:
- [OGC API – Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html) - use cases and examples
- [OGC API – Connected Systems Part 2](https://docs.ogc.org/is/23-002/23-002.html) - use cases and examples

#### Related Client Libraries:
- [camptocamp/ogc-client](https://github.com/camptocamp/ogc-client) - upstream patterns for WFS, WMS, etc.

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

**Resources:**

#### Previous Implementation:
- [OS4CSAPI/ogc-client-CSAPI Repository](https://github.com/OS4CSAPI/ogc-client-CSAPI) - first iteration
- [Draft PR #131](https://github.com/camptocamp/ogc-client/pull/131) - review feedback
- Design research documents (Sections 1-12) for lessons learned analysis

#### Standards Reference:
- [OGC API – Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html)
- [OGC API – Connected Systems Part 2](https://docs.ogc.org/is/23-002/23-002.html)

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

**Resources:**

#### Upstream Repository:
- [camptocamp/ogc-client](https://github.com/camptocamp/ogc-client) - main repository
- [camptocamp/ogc-client Contributing Guide](https://github.com/camptocamp/ogc-client/blob/main/CONTRIBUTING.md) (if exists)
- [Draft PR #131 Review Comments](https://github.com/camptocamp/ogc-client/pull/131) - maintainer feedback

#### Reference Implementations:
- [ogc-client WFS implementation](https://github.com/camptocamp/ogc-client/tree/main/src/wfs)
- [ogc-client WMS implementation](https://github.com/camptocamp/ogc-client/tree/main/src/wms)
- [ogc-client EDR implementation](https://github.com/camptocamp/ogc-client/tree/main/src/ogc-api)

#### Documentation Patterns:
- [ogc-client README](https://github.com/camptocamp/ogc-client/blob/main/README.md)
- [ogc-client API Documentation](https://camptocamp.github.io/ogc-client/)

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

**Resources:**

#### Analysis Synthesis:
- All previous requirement sections (1-11)
- Design research documents (docs/research/upstream/)

#### Standards Reference:
- [OGC API – Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html) - conformance requirements
- [OGC API – Connected Systems Part 2](https://docs.ogc.org/is/23-002/23-002.html) - conformance requirements
- docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml
- docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml

#### Priority References:
- Real-world usage patterns (Section 9 findings)
- Upstream expectations (Section 11 findings)
- Previous iteration gaps (Section 10 findings)

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
