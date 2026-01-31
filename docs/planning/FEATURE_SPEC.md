# Feature Specification: CSAPI Client Support

**Project:** OGC API – Connected Systems (CSAPI) v1.0 Client Implementation  
**Target Repository:** camptocamp/ogc-client  
**Status:** In Development

---

## 1. Contribution Vision

This contribution adds comprehensive client support for OGC API – Connected Systems (CSAPI) v1.0 to ogc-client, enabling developers to build applications that communicate with CSAPI-compliant servers. The implementation provides standards-based programmatic access to sensor systems, real-time observations, deployments, and dynamic data streams, eliminating the need for developers to manually implement the specification and ensuring their applications achieve interoperability with any CSAPI-compliant endpoint. By extending ogc-client's proven patterns to cover this newly published standard (July 2025), this work fills a critical gap for IoT, sensor web, and observational data applications. The contribution implements both Part 1 (Feature Resources) and Part 2 (Dynamic Data), delivering complete CSAPI client functionality that aligns with upstream conventions and reduces the development burden for standards-compliant sensor data integration.

---

## 2. Feature Overview

### 2.1 Motivation & Context

OGC API – Connected Systems (CSAPI) v1.0 was published in July 2025 as the modern successor to SOS (Sensor Observation Service). The standard defines RESTful access to sensor systems, observations, deployments, and control mechanisms. Despite its importance for IoT and sensor web applications, no TypeScript client library currently supports CSAPI. This creates a gap where developers must manually implement the specification to access CSAPI-compliant servers.

The ogc-client library already supports multiple OGC API standards (WFS, STAC, EDR). Adding CSAPI support extends this coverage to sensor and observational data, enabling developers to access all major OGC API families through a single, consistent TypeScript interface.

### 2.2 In Scope

**Core Implementation (following PR #114 EDR pattern):**
- URL building pattern: Library provides URL strings, users handle `fetch()`
- `endpoint.csapi(collectionId)` navigator pattern
- Per-collection navigator instances with caching

**Resource Coverage (9 CSAPI resource types):**

*Part 1: Feature Resources*
- Systems (12 methods: CRUD + history + subsystems)
- Procedures (8 methods: CRUD + history)
- Deployments (8 methods: CRUD + history)
- Sampling Features (8 methods: CRUD + history)
- Properties (6 methods: CRUD)

*Part 2: Dynamic Data*
- Datastreams (11 methods: CRUD + observations + schema)
- Observations (9 methods: Read/create + time filtering)
- Control Streams (8 methods: CRUD + timing)
- Commands (8 methods: CRUD + status)

**Query Support:**
- All CSAPI query parameters: bbox, datetime, limit, offset, filters
- Pagination support (offset-based)
- Format negotiation (GeoJSON and SensorML via Accept headers)
- Proper URL encoding and parameter handling

**Testing & Quality:**
- Client-oriented tests (real-world usage scenarios)
- Unit tests for all URL builder methods
- Integration tests for endpoint conformance
- Parser and validator test coverage
- Target: 85%+ overall test coverage
- OGC-conformant test fixtures

**Integration:**
- Extend `OgcApiEndpoint` following upstream patterns
- Conformance class detection
- Collection-level capability checking
- TypeScript interfaces for all query options

### 2.3 Out of Scope

**Explicitly excluded (defer or not applicable):**
- HTTP execution (users control fetch, auth, retries)
- Response parsing into domain objects (users handle JSON)
- Client-side validation of payloads before POST/PUT
- Server-side pagination cursor support (CSAPI uses offset-based)
- Advanced SWE Common encoding/decoding beyond format negotiation
- WebSocket subscriptions (CSAPI doesn't define this)
- Non-CSAPI OGC standards (separate concerns)

**Deferred to future work:**
- System Events resource (Part 3, not yet published)
- System History detailed query support (if spec evolves)
- Performance benchmarking suite
- Browser-specific optimizations

### 2.4 Upstream Alignment & Constraints

**Non-Negotiable Principles:**

**Minimal Impact on Existing Code:**
- Modify existing upstream files **only when absolutely necessary** for CSAPI integration
- Do NOT refactor, optimize, or "improve" existing upstream code
- Do NOT fix existing upstream test failures or issues unrelated to CSAPI
- Do NOT change existing patterns, conventions, or architectural choices
- Preserve all existing functionality - zero regressions

**Additive-Only Approach:**
- New functionality lives in isolated `src/ogc-api/csapi/` directory
- Changes to shared files (`endpoint.ts`, `info.ts`, `index.ts`) limited to:
  - Adding CSAPI conformance checking
  - Adding `csapi()` method to endpoint
  - Exporting CSAPI types
- Each modification to existing files must be justified as essential for CSAPI functionality

**Diff Discipline:**
- Every line changed in an existing file must directly support CSAPI integration
- Prefer duplication over refactoring shared code
- Follow existing code style exactly (no formatting changes)
- Avoid "while we're here" improvements

**Rationale:** Maintainers must review changes efficiently. Mixing CSAPI addition with unrelated changes creates review burden, increases merge conflict risk, and reduces approval likelihood.

### 2.5 Standards & Specifications

**Primary:**
- [OGC API – Connected Systems Part 1: Feature Resources (23-001) v1.0](https://docs.ogc.org/is/23-001/23-001.html)
  - [OpenAPI Specification](../research/ogcapi-connectedsystems-1.bundled.oas31.yaml) (local reference)
- [OGC API – Connected Systems Part 2: Dynamic Data (23-002) v1.0](https://docs.ogc.org/is/23-002/23-002.html)
  - [OpenAPI Specification](../research/ogcapi-connectedsystems-2.bundled.oas31.yaml) (local reference)

**Supporting:**
- [OGC SWE Common Data Model (23-000) v3.0](https://docs.ogc.org/is/23-000/23-000.html) - Data component structure
- [OGC SensorML (24-014) v3.0](https://docs.ogc.org/is/24-014/24-014.html) - System description format
- [GeoJSON (RFC 7946)](https://tools.ietf.org/html/rfc7946) - Alternative feature encoding

**Reference Implementation:**
- [PR #114 (EDR implementation)](https://github.com/camptocamp/ogc-client/pull/114) - Direct pattern template for architecture

**Previous Work:**
- Exploratory repo: [OS4CSAPI/ogc-client-homework](https://github.com/OS4CSAPI/ogc-client-homework) (257 commits - learning phase)
- Second iteration: [OS4CSAPI/ogc-client-CSAPI](https://github.com/OS4CSAPI/ogc-client-CSAPI) (refined implementation - Phases 1-5 ~90% complete)
- Cleaned repo: [OS4CSAPI/ogc-client](https://github.com/OS4CSAPI/ogc-client) (14 commits - rebased)
- Draft PR: [camptocamp/ogc-client#131](https://github.com/camptocamp/ogc-client/pull/131)

### 2.6 Success Criteria

**Complete when:**
- ✅ URL builder methods exist for all 70+ CRUD operations across 9 resources
- ✅ Both GeoJSON and SensorML format negotiation supported via Accept headers
- ✅ All query parameters from spec supported with proper encoding
- ✅ Pagination (offset-based) fully functional
- ✅ 85%+ test coverage with client-oriented tests
- ✅ Integration tests validate conformance checking
- ✅ TypeScript interfaces provide full type safety
- ✅ JSDoc documentation for all public methods
- ✅ Usage examples demonstrate common workflows
- ✅ Upstream maintainers approve PR for merge

---

## 3. Technical Design

_[To be completed]_

---
