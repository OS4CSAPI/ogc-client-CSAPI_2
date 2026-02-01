# MVP Definition and Phasing Strategy

**Purpose:** Define minimum viable product scope for CSAPI client library contribution to camptocamp/ogc-client, establish phasing strategy (Part 1 vs Part 2), and create priority matrix for features.

**Context:** Based on Section 16 (52°North analysis), Section 17 (Gap analysis), and Section 18 (Upstream expectations), define what must be in MVP vs what can be deferred.

**Date:** 2026-01-31

---

## Executive Summary

**MVP Scope Decision:** Implement **Part 1 resources only** (Systems, Deployments, Procedures, Sampling Features, Properties) with comprehensive format abstraction (GeoJSON, SensorML, SWE Common parsing). Part 2 resources (DataStreams, Observations, Control Streams, Commands) deferred to Phase 2.

**Rationale:**
1. Part 1 provides complete catalog/discovery functionality
2. Part 1 demonstrates format abstraction patterns for Part 2
3. Part 1 sufficient for PR acceptance and user value
4. Part 2 builds incrementally on proven patterns
5. Reduces initial implementation risk and complexity

**Implementation Phases:**
- **Phase 1 (MVP):** Part 1 resources + format abstraction (~4-6 weeks)
- **Phase 2 (Full):** Part 2 resources + advanced features (~3-4 weeks)

---

## 1. Resource Scope Analysis

### 1.1 Part 1 Resources (Discovery & Catalog)

**Systems (`/systems`)**
- **Priority:** P0 (CRITICAL)
- **Justification:** Core discovery resource, required for all workflows
- **Operations:** GET collection, GET by ID, POST create, PUT update, DELETE
- **Complexity:** Medium (GeoJSON + SensorML parsing required)
- **MVP Status:** ✅ MUST HAVE

**Deployments (`/deployments`)**
- **Priority:** P0 (CRITICAL)
- **Justification:** Describes where/when systems are deployed
- **Operations:** GET collection, GET by ID, POST create, PUT update, DELETE
- **Complexity:** Medium (GeoJSON + deployment metadata)
- **Dependencies:** Systems (links to system resources)
- **MVP Status:** ✅ MUST HAVE

**Procedures (`/procedures`)**
- **Priority:** P1 (HIGH)
- **Justification:** Describes measurement methodologies, referenced by systems
- **Operations:** GET collection, GET by ID, POST create, PUT update, DELETE
- **Complexity:** Medium (SensorML process models)
- **Dependencies:** Systems (referenced via procedure links)
- **MVP Status:** ✅ SHOULD HAVE (include for completeness)

**Sampling Features (`/samplingFeatures`)**
- **Priority:** P1 (HIGH)
- **Justification:** Describes feature of interest being observed
- **Operations:** GET collection, GET by ID, POST create, PUT update, DELETE
- **Complexity:** Medium (GeoJSON + sampling feature metadata)
- **Dependencies:** Systems (associated with deployments)
- **MVP Status:** ✅ SHOULD HAVE (include for completeness)

**Properties (`/properties`)**
- **Priority:** P1 (HIGH)
- **Justification:** Defines observable properties, referenced by datastreams
- **Operations:** GET collection, GET by ID
- **Complexity:** Low (simple JSON metadata)
- **Dependencies:** None (standalone catalog)
- **MVP Status:** ✅ SHOULD HAVE (simple to implement, high value)

### 1.2 Part 2 Resources (Data & Control)

**DataStreams (`/datastreams`, `/systems/{id}/datastreams`)**
- **Priority:** P2 (MEDIUM)
- **Justification:** Describes observation streams, links to observations
- **Operations:** GET collection, GET by ID, POST create, PUT update, DELETE
- **Complexity:** HIGH (SWE Common component schemas, complex validation)
- **Dependencies:** Systems, Properties, Procedures, Sampling Features
- **MVP Status:** ❌ DEFER TO PHASE 2

**Observations (`/observations`, `/datastreams/{id}/observations`)**
- **Priority:** P2 (MEDIUM)
- **Justification:** Actual measurement data, bulk operations
- **Operations:** GET collection, GET by ID, POST create (bulk)
- **Complexity:** VERY HIGH (SWE Common encodings, large volumes, pagination)
- **Dependencies:** DataStreams
- **MVP Status:** ❌ DEFER TO PHASE 2

**Control Streams (`/controlStreams`, `/systems/{id}/controlStreams`)**
- **Priority:** P3 (LOW)
- **Justification:** Describes control channels, less common use case
- **Operations:** GET collection, GET by ID, POST create, PUT update, DELETE
- **Complexity:** HIGH (similar to DataStreams)
- **Dependencies:** Systems
- **MVP Status:** ❌ DEFER TO PHASE 2

**Commands (`/commands`, `/controlStreams/{id}/commands`)**
- **Priority:** P3 (LOW)
- **Justification:** Tasking/control messages, less common use case
- **Operations:** GET collection, GET by ID, POST create (bulk)
- **Complexity:** VERY HIGH (similar to Observations)
- **Dependencies:** Control Streams
- **MVP Status:** ❌ DEFER TO PHASE 2

### 1.3 MVP Scope Decision Matrix

| Resource | Part | Priority | Complexity | Dependencies | MVP Status | Phase |
|----------|------|----------|------------|--------------|------------|-------|
| Systems | 1 | P0 | Medium | None | ✅ MUST HAVE | 1 |
| Deployments | 1 | P0 | Medium | Systems | ✅ MUST HAVE | 1 |
| Procedures | 1 | P1 | Medium | Systems | ✅ SHOULD HAVE | 1 |
| Sampling Features | 1 | P1 | Medium | Systems | ✅ SHOULD HAVE | 1 |
| Properties | 1 | P1 | Low | None | ✅ SHOULD HAVE | 1 |
| DataStreams | 2 | P2 | High | Systems, Props | ❌ DEFER | 2 |
| Observations | 2 | P2 | Very High | DataStreams | ❌ DEFER | 2 |
| Control Streams | 2 | P3 | High | Systems | ❌ DEFER | 2 |
| Commands | 2 | P3 | Very High | Control Streams | ❌ DEFER | 2 |

---

## 2. Format Abstraction Scope

### 2.1 GeoJSON Parser (MVP Phase 1)

**Geometry Types:**
- [x] Point
- [x] LineString
- [x] Polygon
- [x] MultiPoint
- [x] MultiLineString
- [x] MultiPolygon
- [x] GeometryCollection

**Feature Types:**
- [x] Feature
- [x] FeatureCollection

**Validation:**
- [x] Structural validation (required properties)
- [x] Geometry validation (coordinate arrays)
- [x] CRS validation (if present)
- [ ] Semantic validation (bbox consistency) - PHASE 2

**Effort:** ~400 lines (2-3 days)

### 2.2 SensorML Parser (MVP Phase 1)

**Process Types (All Versions):**
- [x] SimpleProcess (basic metadata)
- [x] PhysicalSystem (systems with components)
- [x] PhysicalComponent (individual sensors)
- [x] AggregateProcess (systems with sub-processes)
- [ ] ProcessChain (processing workflows) - PHASE 2 (less common)

**SensorML Versions:**
- [x] SensorML 2.0 (JSON)
- [ ] SensorML 2.1 (JSON) - PHASE 2 (if needed)
- [ ] SensorML 1.0 (XML) - OUT OF SCOPE (not in CSAPI spec)

**Key Elements:**
- [x] Identification (identifiers, classifiers)
- [x] Classification (system type, sensor type)
- [x] Characteristics (physical properties)
- [x] Capabilities (measurement capabilities)
- [x] Contacts (responsible parties)
- [x] Documentation (manuals, datasheets)
- [x] Position (location, orientation)
- [x] Components/Connections (for systems)
- [ ] History (configuration changes) - PHASE 2

**Effort:** ~1,200 lines (5-7 days)

### 2.3 SWE Common Parser (MVP Phase 1 - Basic)

**Component Types (MVP Subset):**
- [x] DataRecord (structured data)
- [x] DataArray (arrays of data)
- [x] Vector (position, velocity)
- [x] Quantity (numeric with UOM)
- [x] Count (integer)
- [x] Boolean
- [x] Text
- [x] Category (enumeration)
- [x] Time (temporal)
- [ ] DataChoice (union types) - PHASE 2
- [ ] Matrix (2D arrays) - PHASE 2

**Encoding Types (MVP Subset):**
- [x] JSON encoding (CSAPI default)
- [ ] Text encoding (CSV-like) - PHASE 2
- [ ] Binary encoding - PHASE 2

**Use Cases (MVP):**
- [x] Parse DataStream schemas (result schemas)
- [x] Parse System characteristics/capabilities
- [x] Parse Position (location, orientation)
- [ ] Parse Observation result values - PHASE 2
- [ ] Validate observation data against schemas - PHASE 2

**Effort:** ~800 lines MVP (4-5 days), +600 lines Phase 2

### 2.4 Format Detection (MVP Phase 1)

**Detection Strategies:**
- [x] Content-Type header inspection
- [x] Body structure analysis (JSON keys)
- [x] Context-based inference (resource type)
- [x] Fallback heuristics

**Supported Formats (MVP):**
- [x] `application/geo+json` → GeoJSON
- [x] `application/sensorml+json` → SensorML
- [x] `application/json` → Context-based detection
- [ ] `application/om+json` → Observation (Phase 2)

**Effort:** ~200 lines (1-2 days)

### 2.5 Format Validation (MVP Phase 1)

**Validation Types:**
- [x] Structural validation (JSON schema-like)
- [x] Type validation (field types, required fields)
- [x] Pre-request validation (client-side catch errors early)
- [x] Post-response validation (server data integrity)
- [ ] Semantic validation (relationships, constraints) - PHASE 2
- [ ] Cross-resource validation (foreign keys) - PHASE 2

**Validation Modes:**
- [x] Strict mode (throw on any error)
- [x] Lenient mode (log warnings, continue)
- [x] Configurable per-endpoint

**Error Reporting:**
- [x] JSON path to error location
- [x] Expected vs actual values
- [x] Actionable error messages
- [x] Multiple errors collected

**Effort:** ~400 lines (2-3 days)

---

## 3. Capability Requirements

### 3.1 Core Capabilities (MVP Phase 1)

**Endpoint Initialization:**
- [x] Parse `/` landing page
- [x] Parse `/conformance` 
- [x] Parse `/collections` (all resource types)
- [x] Cache parsed metadata
- [x] `isReady()` async pattern

**Service Metadata:**
- [x] `getServiceInfo()` - GenericEndpointInfo
- [x] `getConformanceClasses()` - array of URIs
- [x] `getCollections()` - all collections
- [x] `getVersion()` - API version (if available)

**Resource Discovery:**
- [x] `getSystems()` - list all systems
- [x] `getSystemById(id)` - get single system
- [x] `getDeployments()` - list all deployments
- [x] `getDeploymentById(id)` - get single deployment
- [x] `getProcedures()` - list procedures
- [x] `getProcedureById(id)` - get single procedure
- [x] `getSamplingFeatures()` - list sampling features
- [x] `getSamplingFeatureById(id)` - get single sampling feature
- [x] `getProperties()` - list properties
- [x] `getPropertyById(id)` - get single property

**Query Parameters:**
- [x] `bbox` - bounding box filter
- [x] `datetime` - temporal filter
- [x] `limit` - pagination limit
- [x] `offset` - pagination offset (if supported)
- [ ] `filter` - CQL2 filtering - PHASE 2
- [ ] `properties` - property selection - PHASE 2
- [ ] `sortby` - sorting - PHASE 2

**CRUD Operations:**
- [x] GET (read)
- [x] POST (create) - URL builder
- [x] PUT (update) - URL builder
- [x] DELETE - URL builder
- [ ] PATCH (partial update) - PHASE 2 (less common)

### 3.2 Advanced Capabilities (Phase 2)

**DataStreams & Observations:**
- [ ] `getDataStreams()` / `getDataStreamById(id)`
- [ ] `getSystemDataStreams(systemId)` - nested resource
- [ ] `getObservations()` / `getObservationById(id)`
- [ ] `getDataStreamObservations(dataStreamId)` - nested resource
- [ ] Observation bulk insert
- [ ] Streaming observation updates
- [ ] Observation aggregation queries

**Control & Commands:**
- [ ] `getControlStreams()` / `getControlStreamById(id)`
- [ ] `getSystemControlStreams(systemId)` - nested resource
- [ ] `getCommands()` / `getCommandById(id)`
- [ ] `getControlStreamCommands(controlStreamId)` - nested resource
- [ ] Command submission
- [ ] Command status polling

**Advanced Queries:**
- [ ] CQL2 filter support
- [ ] Property selection (sparse fieldsets)
- [ ] Sorting
- [ ] Full-text search (if server supports)
- [ ] Spatial relationship queries (intersects, within, etc.)

**Associations:**
- [ ] `getSystemDeployments(systemId)` - helper method
- [ ] `getSystemProcedures(systemId)` - helper method
- [ ] `getDeploymentSystems(deploymentId)` - helper method
- [ ] Link traversal utilities

---

## 4. Implementation Phasing

### 4.1 Phase 1: MVP (Part 1 Resources + Format Abstraction)

**Timeline:** 4-6 weeks

**Deliverables:**
1. **Core Infrastructure** (~1 week)
   - CSAPIEndpoint class
   - Parse `/`, `/conformance`, `/collections`
   - Cache implementation
   - Error handling (CSAPIError, FormatParseError, ValidationError)
   - HTTP utilities (fetch wrapper, headers, auth)

2. **Format Abstraction** (~2 weeks)
   - GeoJSON parser (400 lines)
   - SensorML parser MVP (1,200 lines)
   - SWE Common parser MVP (800 lines)
   - Format detector (200 lines)
   - Format validator (400 lines)
   - Unit tests for all parsers

3. **Part 1 Resources** (~1 week)
   - Systems (collection, by ID, CRUD URLs)
   - Deployments (collection, by ID, CRUD URLs)
   - Procedures (collection, by ID, CRUD URLs)
   - Sampling Features (collection, by ID, CRUD URLs)
   - Properties (collection, by ID, CRUD URLs)
   - Query parameter support (bbox, datetime, limit, offset)

4. **Worker Support** (~3 days)
   - Register handlers in `worker/worker.ts`
   - Export functions from `worker/index.ts`
   - Parse conformance/collections in worker
   - Parse SensorML in worker
   - Parse SWE Common in worker
   - Fallback mode

5. **Testing & Documentation** (~1 week)
   - Unit tests (90%+ coverage target)
   - Integration tests with fixtures
   - JSDoc documentation
   - README with examples
   - Type definitions

**Success Criteria:**
- ✅ All Part 1 resources accessible via CSAPIEndpoint
- ✅ GeoJSON, SensorML, SWE Common parsing functional
- ✅ Format detection and validation working
- ✅ 90%+ test coverage
- ✅ Comprehensive JSDoc
- ✅ PR ready for camptocamp/ogc-client

**Lines of Code Estimate:** ~6,000 lines
- Core infrastructure: ~800 lines
- Format abstraction: ~3,000 lines
- Part 1 resources: ~1,200 lines
- Worker support: ~400 lines
- Tests: ~600 lines (separate from coverage)

### 4.2 Phase 2: Full Implementation (Part 2 Resources)

**Timeline:** 3-4 weeks (starts after Phase 1 merged)

**Deliverables:**
1. **DataStreams & Observations** (~2 weeks)
   - DataStream resources (collection, by ID, CRUD)
   - Nested DataStreams (`/systems/{id}/datastreams`)
   - DataStream schema parsing (SWE Common components)
   - Observation resources (collection, by ID)
   - Nested Observations (`/datastreams/{id}/observations`)
   - Observation bulk insert support
   - Advanced SWE Common encoding support (text, binary)
   - Pagination for large observation sets

2. **Control Streams & Commands** (~1 week)
   - Control Stream resources (collection, by ID, CRUD)
   - Nested Control Streams (`/systems/{id}/controlStreams`)
   - Command resources (collection, by ID)
   - Nested Commands (`/controlStreams/{id}/commands`)
   - Command submission and status

3. **Advanced Features** (~3-5 days)
   - CQL2 filter support
   - Property selection
   - Sorting
   - Association helper methods
   - Streaming observation updates (if server supports)

4. **Testing & Documentation** (~3 days)
   - Tests for Part 2 resources
   - Integration tests for data workflows
   - Update documentation
   - Performance testing (large observation sets)

**Success Criteria:**
- ✅ All Part 2 resources accessible
- ✅ Observation bulk operations working
- ✅ Command submission working
- ✅ Advanced query features functional
- ✅ Performance validated (10K+ observations)
- ✅ Documentation updated

**Lines of Code Estimate:** ~4,000 lines
- DataStreams/Observations: ~2,000 lines
- Control Streams/Commands: ~1,200 lines
- Advanced features: ~600 lines
- Tests: ~200 lines (separate from coverage)

---

## 5. Feature Priority Matrix

### 5.1 Must-Have (P0) - MVP Phase 1

**Core Endpoint:**
- Parse landing page, conformance, collections
- Async initialization (`isReady()`)
- Service metadata getters
- Cache implementation
- Error handling

**Part 1 Resources:**
- Systems (GET collection, GET by ID)
- Deployments (GET collection, GET by ID)

**Format Abstraction (MVP Subset):**
- GeoJSON parser (all geometry types)
- SensorML parser (SimpleProcess, PhysicalSystem, PhysicalComponent)
- SWE Common parser (DataRecord, Vector, Quantity, basic types)
- Format detection (Content-Type + body analysis)
- Format validation (structural + type validation)

**Testing:**
- Unit tests (90%+ coverage)
- Integration tests with fixtures

**Documentation:**
- JSDoc on all public APIs
- README with examples

### 5.2 Should-Have (P1) - MVP Phase 1

**Part 1 Resources (Complete):**
- Procedures (GET collection, GET by ID)
- Sampling Features (GET collection, GET by ID)
- Properties (GET collection, GET by ID)

**CRUD Operations:**
- POST URL builders (create resources)
- PUT URL builders (update resources)
- DELETE URL builders (delete resources)

**Query Parameters:**
- `bbox` filter
- `datetime` filter
- `limit` pagination
- `offset` pagination (if server supports)

**Worker Support:**
- Heavy parsing in workers
- Fallback mode

**Format Abstraction (Complete):**
- SensorML AggregateProcess
- All SWE Common basic types
- Validation error reporting (JSON paths)

### 5.3 Could-Have (P2) - Phase 2

**Part 2 Resources:**
- DataStreams (GET collection, GET by ID, CRUD)
- Observations (GET collection, GET by ID, POST bulk)
- Nested resources (`/systems/{id}/datastreams`, etc.)

**Advanced SWE Common:**
- DataChoice, Matrix components
- Text encoding support
- Binary encoding support
- Observation result validation

**Advanced Queries:**
- CQL2 filter support
- Property selection
- Sorting

**Performance:**
- Streaming observations
- Incremental parsing
- Lazy loading

### 5.4 Won't-Have (P3) - Future/Out of Scope

**Control & Commands:**
- Control Streams
- Commands
- *(Reason: Less common use case, can be added later if needed)*

**Advanced Features:**
- Full-text search
- Spatial relationship queries (intersects, within)
- Aggregation queries
- *(Reason: Server-dependent, niche use cases)*

**Historical Features:**
- SensorML history parsing
- Configuration change tracking
- *(Reason: Rarely used, complex to implement)*

**UI/Visualization:**
- Map rendering
- Chart generation
- *(Reason: Out of scope for client library)*

---

## 6. Risk Assessment

### 6.1 Phase 1 Risks

**Risk: SensorML Parser Complexity**
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Start with SimpleProcess, iterate to PhysicalSystem
- **Fallback:** Defer AggregateProcess to Phase 2 if needed

**Risk: SWE Common Scope Creep**
- **Probability:** High
- **Impact:** Medium
- **Mitigation:** Define strict MVP subset (no DataChoice, no Matrix initially)
- **Fallback:** Defer advanced components to Phase 2

**Risk: Test Coverage Target (90%+)**
- **Probability:** Low
- **Impact:** High (blocks PR acceptance)
- **Mitigation:** Write tests alongside implementation, use coverage tools
- **Fallback:** Focus on core paths, defer edge cases if needed

**Risk: Upstream Pattern Mismatch**
- **Probability:** Low
- **Impact:** High
- **Mitigation:** Section 18 validates pattern compatibility
- **Fallback:** Engage with maintainers early if issues arise

### 6.2 Phase 2 Risks

**Risk: Observation Volume Performance**
- **Probability:** Medium
- **Impact:** High
- **Mitigation:** Implement pagination, streaming, worker-based parsing
- **Fallback:** Document limitations, provide guidance for large datasets

**Risk: Control Stream Adoption**
- **Probability:** High
- **Impact:** Low
- **Mitigation:** Validate with user community before implementing
- **Fallback:** Defer if no demand, focus on data side

**Risk: Advanced Query Complexity (CQL2)**
- **Probability:** Medium
- **Impact:** Medium
- **Mitigation:** Start with simple CQL2 subset, iterate
- **Fallback:** Defer to Phase 3 if too complex

---

## 7. Success Metrics

### 7.1 Phase 1 Success Metrics

**Code Quality:**
- ✅ 90%+ test coverage
- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors
- ✅ Passes Prettier formatting
- ✅ All JSDoc complete

**Functionality:**
- ✅ All Part 1 resources accessible
- ✅ GeoJSON parsing works (all geometry types)
- ✅ SensorML parsing works (MVP process types)
- ✅ SWE Common parsing works (MVP components)
- ✅ Format detection/validation works
- ✅ Query parameters work (bbox, datetime, limit)

**Performance:**
- ✅ Endpoint init < 2 seconds (typical server)
- ✅ Format parsing < 100ms (typical document)
- ✅ Worker support functional
- ✅ Bundle size < 100KB (with all formats)

**Documentation:**
- ✅ README with installation + examples
- ✅ JSDoc on all public APIs
- ✅ Type definitions exported
- ✅ Integration examples (Node.js + browser)

**Upstream Acceptance:**
- ✅ PR passes CI/CD checks
- ✅ PR approved by maintainer(s)
- ✅ No major revision requests
- ✅ Merged to main branch

### 7.2 Phase 2 Success Metrics

**Functionality:**
- ✅ All Part 2 resources accessible
- ✅ Observation bulk insert works
- ✅ DataStream schemas parsed correctly
- ✅ Advanced SWE Common encodings work
- ✅ CQL2 filtering works (basic subset)

**Performance:**
- ✅ 10K observations parsed < 5 seconds
- ✅ Streaming observations works
- ✅ Memory usage acceptable for large datasets

**User Adoption:**
- ✅ 5+ GitHub stars on PR
- ✅ Positive community feedback
- ✅ 0 critical bugs reported in first month
- ✅ Documentation viewed 100+ times

---

## 8. MVP Recommendation

### 8.1 Final MVP Scope

**RECOMMENDED: Part 1 Resources + Format Abstraction**

**Include in Phase 1:**
1. Core infrastructure (endpoint, caching, errors)
2. Format abstraction (GeoJSON, SensorML MVP, SWE Common MVP)
3. Part 1 resources (Systems, Deployments, Procedures, Sampling Features, Properties)
4. Query parameters (bbox, datetime, limit, offset)
5. CRUD URL builders (POST, PUT, DELETE)
6. Worker support + fallback
7. Comprehensive tests (90%+)
8. Full documentation (JSDoc, README)

**Defer to Phase 2:**
1. Part 2 resources (DataStreams, Observations, Control Streams, Commands)
2. Advanced SWE Common (DataChoice, Matrix, Text/Binary encodings)
3. Advanced queries (CQL2, property selection, sorting)
4. Streaming observations
5. Association helpers
6. Performance optimizations

**Rationale:**
- **Sufficient Value:** Part 1 provides complete discovery/catalog functionality
- **Proven Patterns:** Format abstraction demonstrates approach for Part 2
- **Manageable Scope:** 6,000 lines achievable in 4-6 weeks
- **Low Risk:** No dependencies on complex data operations
- **PR Acceptance:** Demonstrates complete feature set (discovery domain)
- **Incremental Path:** Part 2 builds on proven Phase 1 patterns

### 8.2 Alternative Scopes (Not Recommended)

**Alternative 1: Part 1 Only (No Format Abstraction)**
- ❌ REJECTED: Format abstraction is core value proposition (Section 17)
- ❌ REJECTED: Cannot parse SensorML/SWE Common without parsers
- ❌ REJECTED: Upstream expects format handling (Section 18)

**Alternative 2: All Resources (Part 1 + Part 2)**
- ❌ REJECTED: 10,000+ lines too risky for single PR
- ❌ REJECTED: Observation complexity high (bulk operations, encodings)
- ❌ REJECTED: Control Streams low value (uncommon use case)
- ❌ REJECTED: 8-10 week timeline too long before feedback

**Alternative 3: Systems Only**
- ❌ REJECTED: Incomplete discovery functionality
- ❌ REJECTED: Deployments critical for operational context
- ❌ REJECTED: Properties needed for DataStream preparation (Phase 2)

---

## 9. Implementation Roadmap

### 9.1 Phase 1 Detailed Timeline (6 weeks)

**Week 1: Core Infrastructure**
- Days 1-2: Project setup, TypeScript config, test framework
- Days 3-4: CSAPIEndpoint class, landing page parsing
- Day 5: Conformance/collections parsing, caching

**Week 2: Format Detection & GeoJSON**
- Days 1-2: Format detector (Content-Type + body analysis)
- Days 3-5: GeoJSON parser (all geometry types, validation)

**Week 3: SensorML Parser**
- Days 1-2: SimpleProcess parsing
- Days 3-4: PhysicalSystem parsing (components)
- Day 5: PhysicalComponent, AggregateProcess

**Week 4: SWE Common Parser**
- Days 1-2: Basic types (Quantity, Count, Boolean, Text, Category, Time)
- Days 3-4: Structured types (DataRecord, Vector)
- Day 5: DataArray parsing

**Week 5: Part 1 Resources & Validation**
- Days 1-2: Systems, Deployments (collection, by ID, CRUD URLs)
- Days 3-4: Procedures, Sampling Features, Properties
- Day 5: Format validation (structural + type)

**Week 6: Worker Support, Testing, Documentation**
- Days 1-2: Worker handlers, fallback mode
- Days 3-4: Test suite (90%+ coverage)
- Day 5: JSDoc, README, final polish

**Deliverable:** PR ready for camptocamp/ogc-client

### 9.2 Phase 2 Detailed Timeline (4 weeks)

**Week 1: DataStreams**
- Days 1-2: DataStream resources (collection, by ID, CRUD)
- Days 3-4: Nested DataStreams (`/systems/{id}/datastreams`)
- Day 5: DataStream schema parsing (SWE Common components)

**Week 2: Observations**
- Days 1-2: Observation resources (collection, by ID)
- Days 3-4: Nested Observations (`/datastreams/{id}/observations`)
- Day 5: Observation bulk insert, pagination

**Week 3: Control Streams & Commands**
- Days 1-2: Control Stream resources (collection, by ID, CRUD)
- Days 3-4: Command resources (collection, by ID)
- Day 5: Command submission, status polling

**Week 4: Advanced Features & Testing**
- Days 1-2: CQL2 filter support (basic subset)
- Days 3-4: Property selection, sorting
- Day 5: Tests, documentation, PR

**Deliverable:** Full CSAPI implementation

---

## 10. Conclusion

**MVP Decision:** Implement **Phase 1: Part 1 Resources + Format Abstraction** (~6,000 lines, 4-6 weeks).

**Justification:**
1. **Complete Feature Set (Discovery Domain):** Systems, Deployments, Procedures, Sampling Features, Properties provide full catalog/discovery functionality
2. **Format Abstraction Proven:** GeoJSON, SensorML, SWE Common parsers demonstrate patterns for Phase 2
3. **Upstream Alignment:** Follows WFS/WMS patterns (Section 18), sufficient for PR acceptance
4. **User Value:** Discovery is primary use case for most users (Section 16)
5. **Manageable Risk:** No complex data operations, proven patterns
6. **Incremental Path:** Phase 2 builds on proven Phase 1 infrastructure

**Phase 2 (Part 2 Resources):** DataStreams, Observations, Control Streams, Commands deferred to separate PR after Phase 1 merged. Builds incrementally on Phase 1 patterns, reduces initial risk.

**Success Criteria:** 90%+ test coverage, comprehensive JSDoc, upstream patterns followed, PR accepted and merged.

**Next Step:** Begin implementation (Week 1: Core Infrastructure).

---

**End of MVP Definition**
