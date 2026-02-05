# CSAPI Implementation Guide for Camptocamp OGC Client Library

**Last Updated:** February 4, 2026  
**Version:** 2.0 (Research-Validated)

---

## Executive Summary

This implementation adds Connected Systems API (CSAPI) support to the Camptocamp OGC Client Library, enabling developers to interact with sensor networks, observation data, and system control through the same unified interface they already use for OGC API Features, Tiles, and Environmental Data Retrieval (EDR).

> **📊 RESEARCH FOUNDATION**
>
> This implementation guide is built on **10 completed research plans** (Plans 01-04, 10-16) with **⭐⭐⭐⭐⭐ confidence ratings (100%)** for all architectural decisions. Every design choice documented here has been validated through systematic analysis of:
> - Upstream library patterns (100% consistency with existing code)
> - CSAPI specification requirements (complete Parts 1 & 2 coverage)
> - Real-world usage scenarios (validated workflows)
> - Performance characteristics (proven patterns)
> - Lessons learned from two previous failed attempts
>
> **See:** [Architecture Decision Documents](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/tree/main/docs/research/design/csapiquerybuilder/architecture-decision/results) for complete research foundation.

**What We're Building:**
- **9 components extending existing code** - Small, targeted enhancements to conformance checking, collection parsing, format detection, validation, and worker infrastructure (~50 lines of modifications total)
- **3 components building new code** - CSAPIQueryBuilder class for URL construction, SensorML 3.0 parser, and SWE Common 3.0 parser

**Key Architectural Facts:**
- **Integration Footprint:** ~39 lines across 2-3 files (`endpoint.ts`, `info.ts`, `index.ts`)
- **QueryBuilder Pattern:** Single `CSAPIQueryBuilder` class accessed via `endpoint.csapi(collectionId)` (follows upstream EDR pattern from PR #114)
- **9 Resource Types:** Systems, Deployments, Procedures, Sampling Features, Properties, DataStreams, Observations, Control Streams, Commands - all as methods within one QueryBuilder class
- **Resource Validation:** All ~70-80 methods validate resource availability and fail-fast with clear error messages (user mandate)
- **Full CSAPI Support:** Complete Parts 1 & 2 implementation with all query parameters, filtering, pagination, and format support - NOT MVP scope

**Scope Clarification:** While architecturally elegant (3 new classes, 9 extensions), the CSAPIQueryBuilder represents ~70% of new code volume because it implements comprehensive URL construction for 60-70 unique URL patterns across all CSAPI resource types with full CRUD, query, filter, and pagination capabilities. See [Summary: Build vs Extend Breakdown](#summary-build-vs-extend-breakdown) for detailed component inventory.

**Estimated Code Volume:** ~4,400-6,100 lines implementation + ~6,000-7,900 lines tests = **~10,400-14,000 lines total**

**Estimated Effort:** 6-8 weeks for complete implementation with 80% test coverage

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Table of Contents](#table-of-contents)
3. [Purpose and Scope](#purpose-and-scope)
4. [Architecture Overview](#architecture-overview)
   - [Component Interaction Diagram](#component-interaction-diagram)
   - [Research Foundation](#research-foundation)
5. [Service Discovery Components](#service-discovery-components)
   - [Conformance Reader](#conformance-reader-extending-existing-capability-detection)
   - [Collections Reader](#collections-reader-extending-metadata-parsing)
   - [OgcApiEndpoint Integration](#ogcapiendpoint-integration-extending-main-endpoint-class)
6. [Query Builder Component](#query-builder-component)
   - [CSAPIQueryBuilder Overview](#csapiquerybuilder-building-new-query-construction-class)
   - [Resource Validation Strategy](#resource-validation-strategy)
   - [Helper Methods](#helper-methods)
   - [File Structure](#file-structure-and-organization)
   - [Systems Resource Methods](#systems-resource-methods)
   - [Deployments Resource Methods](#deployments-resource-methods)
   - [Procedures Resource Methods](#procedures-resource-methods)
   - [Sampling Features Resource Methods](#sampling-features-resource-methods)
   - [Properties Resource Methods](#properties-resource-methods)
   - [DataStreams Resource Methods](#datastreams-resource-methods)
   - [Observations Resource Methods](#observations-resource-methods)
   - [Control Streams Resource Methods](#control-streams-resource-methods)
   - [Commands Resource Methods](#commands-resource-methods)
   - [Query Parameters Reference](#complete-query-parameter-support)
7. [Format Handler Components](#format-handler-components)
   - [Why Full Format Handling](#why-full-format-handling-for-csapi)
   - [GeoJSON Handler](#geojson-handler-extending-existing-parser)
   - [SensorML Handler](#sensorml-handler-building-new-format-parser)
   - [SWE Common Handler](#swe-common-handler-building-new-format-parser)
   - [Format Detector](#format-detector-extending-existing-content-negotiation)
   - [Validator](#validator-extending-existing-validation-framework)
8. [Worker Components](#worker-components)
   - [Background Processing](#background-processing-extending-existing-web-worker-pattern)
9. [Testing Components](#testing-components)
   - [Test Coverage](#test-coverage-extending-existing-test-suite)
10. [Documentation Components](#documentation-components)
    - [API Documentation](#api-documentation-extending-existing-typedoc-documentation)
11. [Code Volume Summary](#code-volume-summary)
12. [Summary: Build vs Extend Breakdown](#summary-build-vs-extend-breakdown)
13. [Project Goals Alignment](#project-goals-alignment)
14. [Development Standards](#development-standards)

---

## Purpose and Scope

This document describes every component needed to implement CSAPI support in the Camptocamp OGC Client Library, explaining which components extend existing code versus which require building new code from scratch.

**What This Document Provides:**
- Complete component inventory for CSAPI implementation
- Clear identification of "extend" vs "build" work
- Integration points with existing library code
- Query parameter reference for all CSAPI resources
- Development workflow recommendations
- Research-validated architectural decisions

**Scope Statement:**
This implementation provides **COMPLETE CSAPI Parts 1 & 2 support** including:
- ✅ All query parameters (spatial, temporal, hierarchical, relationship-based, property-based)
- ✅ Full filtering capabilities (bbox, datetime, recursive, parent, system, foi, observedProperty, etc.)
- ✅ Both pagination modes (offset-based and cursor-based)
- ✅ All three SWE Common encodings (JSON, Text/CSV, Binary)
- ✅ Complete schema validation
- ✅ All CRUD operations
- ✅ Resource validation (fail-fast with clear error messages)

**This is NOT an MVP** - this is a production-ready, specification-complete implementation suitable for enterprise use.

**References:**
- [OGC API - Connected Systems Part 1: Feature Resources](https://docs.ogc.org/is/23-001/23-001.html) - Standard defining Systems, Deployments, Procedures, Sampling Features, Properties
- [OGC API - Connected Systems Part 2: Dynamic Data](https://docs.ogc.org/is/23-002/23-002.html) - Standard defining DataStreams, Observations, Control Streams, Commands
- [Full Implementation Scope Definition](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/requirements/contribution-definition.md) - Complete vs partial implementation rationale
- [CSAPI Part 1 Requirements](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/requirements/csapi-part1-requirements.md) - Comprehensive Part 1 requirements analysis
- [CSAPI Part 2 Requirements](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/requirements/csapi-part2-requirements.md) - Comprehensive Part 2 requirements analysis
- [Upstream Library Expectations](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/requirements/upstream-expectations.md) - What camptocamp/ogc-client expects from implementations
- [Architecture Decision - Part 1: Structure](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part1-structure.md) - Structural design decisions
- [Architecture Decision - Part 2: Implementation](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part2-implementation.md) - Implementation details
- [Architecture Decision - Part 3: Validation](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part3-validation.md) - Architecture validation through usage scenarios

---

## Architecture Overview

### Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      OgcApiEndpoint (existing)                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Developer Entry Points:                                 │   │
│  │  • endpoint.features(collectionId)  → FeaturesAPI        │   │
│  │  • endpoint.edr(collectionId)      → EDRQueryBuilder    │   │
│  │  • endpoint.csapi(collectionId)    → CSAPIQueryBuilder  │◄──┼── New Factory Method (~17 lines)
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Conformance: hasConnectedSystems ◄─── New Getter (~7 lines)   │
│  Collections: csapiCollections    ◄─── New Getter (~6 lines)   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ returns instance
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│             CSAPIQueryBuilder (NEW - single class)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Resource Validation (all 70-80 methods):                 │   │
│  │  • availableResources property (Set<string>)             │   │
│  │  • Validate before building URL                          │   │
│  │  • Fail-fast with clear error messages                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Part 1 Resource Methods (Systems, Deployments, etc.):   │   │
│  │  • getSystems(params)              → URL                 │   │
│  │  • getDeployments(params)          → URL                 │   │
│  │  • getProcedures(params)           → URL                 │   │
│  │  • getSamplingFeatures(params)     → URL                 │   │
│  │  • getProperties(params)           → URL                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Part 2 Resource Methods (Observations, Commands, etc.): │   │
│  │  • getDataStreams(params)          → URL                 │   │
│  │  • getObservations(params)         → URL                 │   │
│  │  • getControlStreams(params)       → URL                 │   │
│  │  • getCommands(params)             → URL                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Helper Methods (private, 2-3 methods):                   │   │
│  │  • buildResourceUrl()     - Core URL construction        │   │
│  │  • buildQueryString()     - Parameter serialization      │   │
│  │  • extractAvailableResources() - Resource discovery      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  All methods support FULL query parameters:                     │
│  • Spatial: bbox (2D/3D)                                        │
│  • Temporal: datetime, phenomenonTime, resultTime, etc.         │
│  • Hierarchical: recursive                                      │
│  • Relationship: parent, system, deployment, foi, etc.          │
│  • Pagination: limit, offset, cursor                            │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ constructs URLs for
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Format Handlers (parsers)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  GeoJSON     │  │  SensorML    │  │  SWE Common          │  │
│  │  Handler     │  │  Handler     │  │  Handler             │  │
│  │  (extend)    │  │  (NEW)       │  │  (NEW)               │  │
│  │              │  │              │  │                      │  │
│  │ • Systems    │  │ • Physical   │  │ • JSON encoding      │  │
│  │ • Deployments│  │   System     │  │ • Text/CSV encoding  │  │
│  │ • Procedures │  │ • Physical   │  │ • Binary encoding    │  │
│  │ • Sampling   │  │   Component  │  │ • Schema validation  │  │
│  │   Features   │  │ • System     │  │ • All DataComponent  │  │
│  │              │  │   Config     │  │   types              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  Format Detector (extend) ◄─── Recognizes CSAPI media types    │
│  Validator (extend)       ◄─── Validates CSAPI resources       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ offloads heavy parsing to
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Web Worker (existing pattern)                │
│  • SensorML 3.0 parsing (complex hierarchies)                   │
│  • SWE Common Binary decoding (large datasets)                  │
│  • Observation result validation (1000s of observations)        │
│  • Spatial/temporal filtering (large collections)               │
│                                                                  │
│  Extends existing worker with new CSAPI message types           │
└─────────────────────────────────────────────────────────────────┘
```

**Key Architectural Principles:**

1. **Unified Access:** All CSAPI functionality through `OgcApiEndpoint.csapi()` factory method
2. **Single QueryBuilder:** One `CSAPIQueryBuilder` class with methods for all 9 resource types (not 9 separate classes)
3. **Resource Validation:** All methods validate resource availability before building URLs (fail-fast with clear errors)
4. **Helper Methods:** Private helper methods for code reuse (no inheritance)
5. **Format Abstraction:** Developers work with TypeScript objects, format handlers parse wire formats transparently
6. **Minimal Integration:** ~39 lines of modifications to existing files maintain upstream compatibility
7. **Worker Offloading:** Heavy parsing/validation operations run off main thread for UI responsiveness

---

### Research Foundation

This implementation is built on extensive research with 100% confidence levels:

**Completed Research Plans (10 of 22):**

| Plan | Title | Confidence | Key Finding |
|------|-------|------------|-------------|
| 01 | PR#114 EDR Pattern | ⭐⭐⭐⭐⭐ | Factory method template, caching pattern |
| 02 | QueryBuilder Pattern | ⭐⭐⭐⭐⭐ | Single builder class per API |
| 03 | CSAPI Architecture | ⭐⭐⭐⭐⭐ | 9 resources, format handling required |
| 04 | Architecture Patterns | ⭐⭐⭐⭐⭐ | 100% use helper methods, 0% inheritance |
| 10 | Upstream Expectations | ⭐⭐⭐⭐⭐ | Minimal validation, trust server |
| 11 | Integration Requirements | ⭐⭐⭐⭐⭐ | OgcApiCollectionInfo usage patterns |
| 12 | File Organization | ⭐⭐⭐⭐⭐ | Flat structure + formats/ subfolder |
| 13 | TypeScript Types | ⭐⭐⭐⭐⭐ | Complete type system design |
| 14 | Usage Scenarios | ⭐⭐⭐⭐⭐ | 100% multi-resource workflows |
| 15 | Query Parameters | ⭐⭐⭐⭐⭐ | 47% shared, type-based clustering |
| 16 | Subresource Navigation | ⭐⭐⭐⭐⭐ | 100% cross-boundary navigation |

**Key Decisions Validated:**

- **Single Class:** 100% of upstream APIs use single builder (not multi-class)
- **Helper Methods:** 100% use private helpers, 0% use inheritance
- **Format Handling:** CSAPI-specific complexity requires full parsing
- **Resource Validation:** User mandate for better developer experience
- **Integration Pattern:** Copy EDR factory method exactly (~39 lines)

**References:**
- [Architecture Decision - Part 1](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part1-structure.md) - Structural design with confidence ratings
- [Architecture Decision - Part 2](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part2-implementation.md) - Implementation details
- [Architecture Decision - Part 3](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part3-validation.md) - Usage scenario validation
- [Lessons Learned](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/LESSONS-LEARNED-multi-class-failure.md) - Why previous multi-class attempts failed

**References (Architecture Patterns):**
- [Architecture Patterns Analysis](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/architecture-patterns-analysis.md) - Consistent patterns used in ogc-client for adding new OGC API support
- [PR #114 (EDR Implementation) Analysis](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/pr114-analysis.md) - Direct blueprint for CSAPI implementation, factory method pattern
- [QueryBuilder Pattern Analysis](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/querybuilder-pattern-analysis.md) - Core pattern for CSAPIQueryBuilder implementation
- [Integration with Existing Code](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/integration-analysis.md) - Exact code changes required for integration
- [CSAPI Architecture Decisions](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/csapi-architecture-analysis.md) - Architectural choices for implementing 9 resource types
- [OGC API - Common](https://docs.ogc.org/is/19-072/19-072.html) - Foundation specification for all OGC API standards

---

## Service Discovery Components

### Conformance Reader: Extending Existing Capability Detection

The conformance reader is existing code in `OgcApiEndpoint` that checks which OGC API standards a server implements by reading its conformance document. For CSAPI support, we will extend this reader by adding new conformance class checks that detect CSAPI Part 1 (Systems, Deployments, Procedures, Sampling Features, Properties) and Part 2 (DataStreams, Observations, Control Streams, Commands) capabilities. This follows the exact pattern already used for EDR detection - adding a `hasConnectedSystems` method similar to the existing `hasEnvironmentalDataRetrieval` method. The extension integrates seamlessly into the upstream repository's architecture without breaking existing functionality for Features, Tiles, Records, or EDR. This approach aligns with the project goal of making CSAPI support feel like a natural part of the existing library rather than a bolt-on addition.

**CSAPI Conformance Classes to Detect:**
- Part 1 Core: `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/req/core`
- Part 1 Systems: `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/req/system`
- Part 1 Deployments: `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/req/deployment`
- Part 1 Procedures: `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/req/procedure`
- Part 1 Sampling Features: `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/req/samplingFeature`
- Part 1 Properties: `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/req/property`
- Part 2 DataStreams: `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/req/datastream`
- Part 2 Observations: `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/req/observation`
- Part 2 Control Streams: `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/req/controlstream`
- Part 2 Commands: `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/req/command`

**Implementation Type:** EXTENDING EXISTING CODE (~7 lines in `info.ts`)

**References:**
- [OGC API - Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html) - Conformance classes for Part 1 resources
- [OGC API - Connected Systems Part 1: OpenAPI Specification](../research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml) - Machine-readable API definition for Part 1
- [OGC API - Connected Systems Part 2](https://docs.ogc.org/is/23-002/23-002.html) - Conformance classes for Part 2 resources
- [OGC API - Connected Systems Part 2: OpenAPI Specification](../research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml) - Machine-readable API definition for Part 2
- [Conformance and Capability Requirements](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/requirements/csapi-conformance-capabilities.md) - All conformance classes and detection mechanisms
- [Integration with Existing Code](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/integration-analysis.md) - Exact code changes to info.ts

---

### Collections Reader: Extending Metadata Parsing

The collections reader is existing code that fetches and parses the `/collections` endpoint to discover what data is available on a server. For CSAPI, we will extend this parser to recognize and extract CSAPI-specific metadata that indicates whether a collection contains Systems, DataStreams, Observations, or other CSAPI resources. This is primarily an extension of existing parsing logic rather than building something entirely new - we're adding new properties to the collection info objects and new filter methods like `csapiSystemCollections`, `csapiDataStreamCollections`, and `csapiObservationCollections` alongside the existing `featureCollections` and `edrCollections` getters. The extension reuses the upstream repository's established patterns for handling different resource types within the unified collections framework. This approach supports the project goal of providing developers a consistent experience across all OGC API standards through one endpoint class.

**CSAPI Collection Properties to Parse:**
- `featureType` property indicating resource type (e.g., `sosa:System`, `sosa:Deployment`, `sosa:ObservationCollection`)
- Links to CSAPI-specific operations (create, update, delete, schema endpoints for Part 2 resources)
- Temporal extent for observation collections
- Spatial extent for systems and deployment collections
- Supported formats (GeoJSON, SensorML 3.0, SWE Common 3.0 JSON/Text/Binary)
- Pagination modes (offset-based and cursor-based for high-volume observations and commands)
- Schema information (DataStream/ControlStream schema availability)

**Implementation Type:** EXTENDING EXISTING CODE (~6 lines in `endpoint.ts`)

**References:**
- [SOSA/SSN Ontology](https://www.w3.org/TR/vocab-ssn/) - Semantic foundation for featureType values (sosa:System, sosa:Deployment, etc.)
- [OGC API - Features](https://docs.ogc.org/is/17-069r4/17-069r4.html) - Collections endpoint patterns CSAPI extends
- [Architecture Patterns Analysis](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/architecture-patterns-analysis.md) - Collection capability determination patterns

---

### OgcApiEndpoint Integration: Extending Main Endpoint Class

The OgcApiEndpoint integration adds the CSAPI factory method to the main `OgcApiEndpoint` class following the exact pattern established by EDR support (PR #114). This integration adds approximately 39 lines total across 2-3 files to expose CSAPI functionality through a single developer-facing method. Developers access all CSAPI capabilities through `endpoint.csapi(collectionId)` which returns a `CSAPIQueryBuilder` instance containing all URL-building methods for the 9 CSAPI resource types. The factory method includes conformance checking (`hasConnectedSystems`), collection metadata fetching, QueryBuilder instantiation, and caching for performance. This minimal integration approach maintains the library's architecture principle of composition over inheritance - no subclassing, just a factory method that returns a specialized query builder. The integration also includes adding the `csapiCollections` getter for filtering collections that support CSAPI resources, and a private cache field for QueryBuilder instances.

**Integration Points in OgcApiEndpoint:**

**1. Import Statement (1 line in `endpoint.ts`):**
```typescript
import CSAPIQueryBuilder from './csapi/url_builder.js';
```

**2. Cache Field (2 lines in `endpoint.ts`):**
```typescript
private collection_id_to_csapi_builder_: Map<string, CSAPIQueryBuilder> = new Map();
```

**3. Collections Getter (~6 lines in `endpoint.ts`):**
```typescript
get csapiCollections(): Promise<string[]> {
  return Promise.all([this.data, this.hasConnectedSystems])
    .then(([data, hasCSAPI]) => (hasCSAPI ? data : { collections: [] }))
    .then(parseCollections)
    .then((collections) => collections.map((collection) => collection.name));
}
```

**4. Conformance Getter (~7 lines in `info.ts`):**
```typescript
get hasConnectedSystems(): Promise<boolean> {
  return Promise.all([this.conformanceClasses]).then(checkHasConnectedSystems);
}
```

**5. Factory Method (~17 lines in `endpoint.ts`):**
```typescript
public async csapi(collection_id: string): Promise<CSAPIQueryBuilder> {
  if (!this.hasConnectedSystems) {
    throw new EndpointError('Endpoint does not support Connected Systems API');
  }
  const cache = this.collection_id_to_csapi_builder_;
  if (cache.has(collection_id)) {
    return cache.get(collection_id);
  }
  const collection = await this.getCollectionInfo(collection_id);
  const result = new CSAPIQueryBuilder(collection);
  cache.set(collection_id, result);
  return result;
}
```

**6. Export Additions (~6 lines in `index.ts`):**
```typescript
export { CSAPIQueryBuilder } from './ogc-api/csapi/url_builder.js';
export type { /* CSAPI types */ } from './ogc-api/csapi/types.js';
```

**Total Integration Code:** ~39 lines (1 + 2 + 6 + 7 + 17 + 6)

**Developer Usage Pattern:**
```typescript
import { OgcApiEndpoint } from '@camptocamp/ogc-client';

const endpoint = new OgcApiEndpoint('https://server.com/api');
await endpoint.isReady();

// Check if endpoint supports CSAPI
if (await endpoint.hasConnectedSystems) {
  // Get CSAPI query builder for a collection
  const csapi = await endpoint.csapi('sensors-collection');
  
  // Use builder methods to construct URLs for all 9 resource types
  const systemsUrl = csapi.getSystems({ bbox: [...], recursive: true });
  const observationsUrl = csapi.getObservations(datastreamId, { phenomenonTime: '2024-01-01/..' });
}
```

**Implementation Type:** EXTENDING EXISTING CODE (~39 lines total across 2-3 files)

**References:**
- [PR #114 (EDR Implementation) Analysis](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/pr114-analysis.md) - **PRIMARY REFERENCE** - Direct blueprint for factory method pattern
- [Integration with Existing Code](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/integration-analysis.md) - Line-by-line integration requirements for endpoint.ts, info.ts, index.ts
- [QueryBuilder Pattern Analysis](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/querybuilder-pattern-analysis.md) - Factory method lifecycle, caching strategy, state management
- [File Organization Strategy](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/file-organization-analysis.md) - Where to place integration code
- [camptocamp/ogc-client Repository](https://github.com/camptocamp/ogc-client) - Upstream repository to integrate with

---

## Query Builder Component

### CSAPIQueryBuilder: Building New Query Construction Class

> **📋 STRUCTURE NOTE**
> 
> The following sections (Systems, Deployments, Procedures, Sampling Features, Properties, DataStreams, Observations, Control Streams, Commands) are **methods within this single CSAPIQueryBuilder class**, not separate components.
> 
> This follows the upstream EDR pattern where `EDRQueryBuilder` contains methods like `getCubeUrl()`, `getCorridorUrl()`, etc. Similarly, `CSAPIQueryBuilder` contains methods like `getSystems()`, `getObservations()`, `getCommands()`, etc.
> 
> Each subsection below describes a **method group** within the QueryBuilder class.

The CSAPIQueryBuilder is new code we need to build as a single comprehensive class containing URL-building methods for all 9 CSAPI resource types, following the pattern established by the existing `EDRQueryBuilder` class. This QueryBuilder class is instantiated by the `OgcApiEndpoint.csapi()` factory method and provides developers with all the methods needed to construct URLs for CSAPI operations: querying Systems with spatial/temporal filters, creating Observations in DataStreams, retrieving historical observations with temporal ranges, sending Commands to Control Streams, and accessing all other CSAPI resources. The class consolidates URL construction for approximately 60-70 unique URL patterns across Part 1 resources (Systems, Deployments, Procedures, Sampling Features, Properties) and Part 2 resources (DataStreams, Observations, Control Streams, Commands), including canonical endpoints, nested resource endpoints, schema endpoints, and special-purpose endpoints like command status/result tracking. This single-class design follows the upstream repository's architecture pattern where one QueryBuilder per API family handles all URL construction for that API, keeping the implementation focused and maintainable rather than splitting across multiple handler classes. The following sections detail the URL construction requirements for each of the 9 resource types as methods within this one CSAPIQueryBuilder class.

**URL Construction Requirements:**
- Canonical resource endpoints: `/systems`, `/deployments`, `/procedures`, `/samplingFeatures`, `/properties`, `/datastreams`, `/observations`, `/controlstreams`, `/commands`
- Nested resource endpoints: `/systems/{id}/subsystems`, `/systems/{id}/datastreams`, `/datastreams/{id}/observations`, `/controlstreams/{id}/commands`
- Schema endpoints: `/datastreams/{id}/schema`, `/controlstreams/{id}/schema`
- Bulk operations: POST with arrays of observations or commands
- Command status/result endpoints: `/commands/{id}/status`, `/commands/{id}/result`

**Implementation Type:** BUILDING NEW CODE (following EDRQueryBuilder pattern, ~890-1,260 lines core + ~3,300-4,650 lines formats)

**References:**
- [OGC API - Connected Systems Part 1: OpenAPI Specification](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml) - Machine-readable API definition for Part 1 endpoints
- [OGC API - Connected Systems Part 2: OpenAPI Specification](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml) - Machine-readable API definition for Part 2 endpoints
- [QueryBuilder Pattern Analysis](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/querybuilder-pattern-analysis.md) - Core pattern for implementation
- [URL Building Architecture](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/url-building-analysis.md) - URL construction patterns and query parameter assembly
- [TypeScript Type System Design](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/typescript-types-analysis.md) - Type definitions for query parameters and interfaces
- [CSAPI Architecture Decisions](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/csapi-architecture-analysis.md) - Single-class design for 9 resource types
- [Architecture Decision - Part 1](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part1-structure.md) - Complete structural design with confidence ratings

---

### Resource Validation Strategy

**User Mandate: All methods must validate resource availability before building URLs.**

This decision differs from the upstream EDR pattern (which has no validation) but significantly improves developer experience for CSAPI's 9 resource types.

**Implementation Pattern:**

```typescript
export default class CSAPIQueryBuilder {
  // Public property for users to check available resources
  public readonly availableResources: Set<string>;
  
  constructor(private collection_: OgcApiCollectionInfo) {
    this.availableResources = this.extractAvailableResources();
  }
  
  // Validate in ALL 70-80 methods before building URLs
  async getSystems(options?: QueryOptions): Promise<string> {
    if (!this.availableResources.has('systems')) {
      throw new EndpointError(
        `Collection '${this.collection_.id}' does not support 'systems' resource. ` +
        `Available resources: ${Array.from(this.availableResources).join(', ')}`
      );
    }
    return this.buildResourceUrl('systems', undefined, undefined, options);
  }
  
  async getDeployments(options?: QueryOptions): Promise<string> {
    if (!this.availableResources.has('deployments')) {
      throw new EndpointError(
        `Collection '${this.collection_.id}' does not support 'deployments' resource. ` +
        `Available resources: ${Array.from(this.availableResources).join(', ')}`
      );
    }
    return this.buildResourceUrl('deployments', undefined, undefined, options);
  }
  
  // ... validation in all 70-80 methods (~2 lines per method = ~140-160 lines total)
}
```

**Developer Experience:**

```typescript
const builder = await endpoint.csapi('sensors');

// No manual checking needed - method validates automatically
try {
  const url = await builder.getSystems();
  const response = await fetch(url);
  const systems = await response.json();
} catch (error) {
  // Clear error message immediately identifies the problem
  console.error(error.message);
  // "Collection 'sensors' does not support 'systems' resource. Available resources: deployments, datastreams"
}
```

**Why Validate (User Mandate):**

1. **Better Developer Experience:** Fail-fast with clear, actionable error messages
2. **Debugging Efficiency:** Users know immediately if resource is unavailable (not a network/server issue)
3. **Standard Practice:** Most client libraries validate before operations
4. **Small Code Cost:** ~140-160 lines total (~2 lines per method) for significant UX improvement
5. **Type Safety Extension:** TypeScript types + runtime validation = complete safety

**Trade-offs Accepted:**

- Deviates from EDR pattern - **Acceptable:** CSAPI has 9 resources (more complexity than EDR's 1)
- Additional code - **Acceptable:** ~140-160 lines is <2% of total implementation
- Validation overhead - **Negligible:** Set lookup is O(1), happens once per method call

**Code Volume:** ~140-160 lines across all methods

**Confidence:** ⭐⭐⭐⭐⭐ (5/5) - User mandate, clear UX benefit

**References:**
- [Architecture Decision - Part 1: Resource Validation](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part1-structure.md#decision-4-resource-validation-user-mandate) - Complete rationale and implementation pattern

---

### Helper Methods

**Pattern: Private helper methods for code reuse (not inheritance).**

Research shows 100% of upstream APIs use helper methods, 0% use inheritance.

**Helper Methods to Implement:**

```typescript
export default class CSAPIQueryBuilder {
  // ========================================
  // PRIVATE HELPERS (2-3 methods)
  // ========================================
  
  /**
   * Core URL construction helper
   * Handles canonical and nested resource endpoints
   * @param resourceType - Resource type (systems, deployments, etc.)
   * @param id - Optional resource ID
   * @param subPath - Optional sub-path (subsystems, datastreams, etc.)
   * @param options - Query parameters
   * @returns Constructed URL
   */
  private buildResourceUrl(
    resourceType: string,
    id?: string,
    subPath?: string,
    options?: QueryOptions
  ): string {
    let url = `${this.baseUrl}/${resourceType}`;
    if (id) url += `/${id}`;
    if (subPath) url += `/${subPath}`;
    return url + this.buildQueryString(options);
  }
  
  /**
   * Query parameter serialization helper
   * Handles encoding, arrays, special characters
   * @param options - Query parameter object
   * @returns Query string (with leading ?)
   */
  private buildQueryString(options?: QueryOptions): string {
    if (!options) return '';
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array parameters (e.g., id=sys1,sys2,sys3)
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    }
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }
  
  /**
   * Resource discovery helper
   * Extracts available resources from collection links
   * @returns Set of available resource types
   */
  private extractAvailableResources(): Set<string> {
    const resources = new Set<string>();
    
    // Parse collection links to find CSAPI resources
    for (const link of this.collection_.links) {
      const match = link.rel?.match(/^ogc-cs:(.+)$/);
      if (match) {
        resources.add(match[1]); // e.g., 'systems', 'datastreams'
      }
    }
    
    return resources;
  }
  
  // ========================================
  // PUBLIC METHODS (70-80 methods)
  // ========================================
  
  // All public methods use the helpers above for code reuse
}
```

**Code Reuse Benefits:**

- `buildResourceUrl()` used by ~70-80 methods → ~60% code reduction
- `buildQueryString()` used by all parameterized methods → ~85% reuse
- `extractAvailableResources()` called once in constructor

**Why Helper Methods (Not Inheritance):**

1. **Upstream Consistency:** 100% of existing APIs use helpers
2. **Visibility:** All methods visible in one class
3. **Simplicity:** No abstract base classes, no inheritance chains
4. **Maintainability:** Easy to understand and navigate

**Code Volume:** ~50-100 lines (3 helper methods)

**Confidence:** ⭐⭐⭐⭐⭐ (5/5) - Zero inheritance precedent in codebase

**References:**
- [Architecture Decision - Part 1: Helper Methods](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part1-structure.md#decision-2-helper-methods-not-inheritance) - Complete analysis of helper methods vs inheritance
- [Architecture Patterns Analysis](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/architecture-patterns-analysis.md) - 0% inheritance usage in upstream

---

### File Structure and Organization

**Research-Validated Structure:**

```
src/ogc-api/csapi/
├── url_builder.ts              (~640-860 lines) - CSAPIQueryBuilder class
│   ├── Constructor & validation (~50-100 lines)
│   ├── Helper methods (~50-100 lines)
│   ├── Part 1 methods (~350-450 lines, 40 methods)
│   ├── Part 2 methods (~400-510 lines, 38 methods)
│   └── Resource validation (~140-160 lines, ~2 lines/method)
│
├── model.ts                    (~200-300 lines) - TypeScript types/interfaces
│   ├── Query parameter types
│   ├── Resource types (System, Deployment, etc.)
│   ├── Response types
│   └── Error types
│
├── helpers.ts                  (~50-100 lines) - Shared utilities
│   ├── URL encoding helpers
│   ├── Temporal parsing utilities
│   └── Validation utilities
│
└── formats/                    (~3,300-4,650 lines total) - Format parsers
    ├── geojson.ts              (~50-100 lines)
    │   └── CSAPI GeoJSON property extraction
    │
    ├── constants.ts            (~50-100 lines)
    │   ├── Media type constants
    │   ├── Resource type constants
    │   └── Vocabulary URI constants
    │
    ├── sensorml/               (~1,600-2,200 lines)
    │   ├── types.ts            (~400-600 lines)
    │   │   ├── System interfaces
    │   │   ├── Component interfaces
    │   │   └── Configuration interfaces
    │   │
    │   ├── parser.ts           (~600-800 lines)
    │   │   └── Main SensorML 3.0 parser
    │   │
    │   ├── simple-process.ts   (~150-200 lines)
    │   │   └── Simple process parser
    │   │
    │   ├── aggregate-process.ts (~200-250 lines)
    │   │   └── Aggregate process parser
    │   │
    │   └── physical-system.ts  (~200-250 lines)
    │       └── Physical system parser
    │
    └── swecommon/              (~1,600-2,250 lines)
        ├── types.ts            (~400-600 lines)
        │   ├── DataComponent interfaces
        │   ├── Encoding interfaces
        │   └── Schema interfaces
        │
        ├── parser.ts           (~500-700 lines)
        │   └── Main SWE Common 3.0 parser
        │
        ├── data-record.ts      (~150-200 lines)
        │   └── DataRecord parser
        │
        ├── data-array.ts       (~200-250 lines)
        │   └── DataArray parser
        │
        └── components.ts       (~300-400 lines)
            ├── Quantity parser
            ├── Category parser
            ├── Boolean parser
            └── Other component parsers
```

**Why This Structure:**

1. **Flat Core:** url_builder.ts, model.ts, helpers.ts at same level (easy to find)
2. **Separate Formats:** formats/ subfolder isolates complex parsing logic
3. **Tree-Shaking Friendly:** Users can exclude formats/ if not needed
4. **Clear Imports:** `import { CSAPIQueryBuilder } from './csapi/url_builder'` vs `import { parseSensorML } from './csapi/formats/sensorml'`
5. **Maintainable:** Format changes isolated from QueryBuilder

**Import Patterns:**

```typescript
// QueryBuilder (always needed)
import { CSAPIQueryBuilder } from '@camptocamp/ogc-client';

// Format parsers (optional)
import { parseSensorML30 } from '@camptocamp/ogc-client/csapi/formats/sensorml';
import { parseSWECommon30 } from '@camptocamp/ogc-client/csapi/formats/swecommon';
```

**Code Volume Breakdown:**

| Component | Lines | Percentage |
|-----------|-------|------------|
| url_builder.ts | 640-860 | 15-16% |
| model.ts | 200-300 | 5% |
| helpers.ts | 50-100 | 1% |
| formats/sensorml/ | 1,600-2,200 | 37-38% |
| formats/swecommon/ | 1,600-2,250 | 37-39% |
| formats/ (other) | 100-200 | 2-3% |
| **TOTAL** | **4,190-5,910** | **100%** |

**Confidence:** ⭐⭐⭐⭐⭐ (5/5) - Research Plan 12 validated structure

**References:**
- [Architecture Decision - Part 2: File Organization](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part2-implementation.md#decision-2-file-organization) - Complete file structure analysis
- [File Organization Strategy](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/file-organization-analysis.md) - Upstream file organization patterns

---

### Complete Query Parameter Support

> **📋 CENTRALIZED REFERENCE**
>
> This section documents ALL query parameters used across CSAPI resources. Individual resource method sections below reference this section rather than repeating parameter documentation.

This URL builder implements FULL query parameter support for CSAPI Parts 1 and 2, including all standard OGC API parameters and all CSAPI-specific extensions. This is NOT an MVP - we support the complete filtering and pagination capabilities defined in the CSAPI specifications.

**Standard OGC API Parameters:**
- `bbox`: Spatial bounding box filter (2D and 3D) for Systems, Deployments, Sampling Features
- `datetime`: Temporal filter using ISO 8601 intervals for validTime filtering
- `limit`: Maximum results per page (1 to 10,000 for Part 2)
- `offset`: Skip N results for pagination
- `f`: Format negotiation (json, geojson, sml+json, swe+json, swe+text)

**CSAPI Common Parameters (Part 1):**
- `id`: Filter by resource ID (multiple IDs supported as comma-separated list)
- `uid`: Filter by unique identifier (URN-based filtering)
- `q`: Full-text search across resource properties
- `{propertyName}`: Filter by any resource property (e.g., `name=Weather%20Station`, `systemType=sosa:Sensor`)

**CSAPI Hierarchical Parameters:**
- `recursive`: Boolean flag for hierarchical queries (subsystems, subdeployments)
  - `recursive=false`: Direct children only (default)
  - `recursive=true`: All descendants at all nesting levels

**CSAPI Relationship Parameters (Part 1):**
- `parent`: Filter by parent system/deployment ID
- `procedure`: Filter resources by associated procedure
- `foi`: Filter by feature of interest
- `observedProperty`: Filter by observed property URI
- `controlledProperty`: Filter by controlled property URI
- `system`: Filter resources by associated system
- `baseProperty`: Filter properties by base property (hierarchy)
- `objectType`: Filter by resource type

**CSAPI Temporal Parameters (Part 2):**
- `phenomenonTime`: When observation was made (ISO 8601 interval, primary temporal filter for observations)
- `resultTime`: When observation result became available
- `executionTime`: When command should be/was executed
- `issueTime`: When command was issued

**Pagination Modes:**
- **Offset-based** (Part 1): `limit` + `offset` for predictable page navigation
- **Cursor-based** (Part 2): `limit` + `cursor` for efficient large dataset streaming
- **Temporal windowing** (Part 2): `phenomenonTime` intervals for time-series data

**Advanced Filtering Capabilities:**
- **Multiple ID filtering**: `id=sys1,sys2,sys3` (OR logic)
- **Property-based filtering**: Any resource property can be used as query parameter
- **Combined filters**: All parameters can be combined (AND logic between different parameter types)
- **Nested endpoint filtering**: All query parameters work on nested endpoints (e.g., `/systems/{id}/subsystems?bbox=...&recursive=true`)

**Format Negotiation:**
- Query parameter: `f=json|geojson|sml+json|swe+json|swe+text|html`
- HTTP Accept header: `application/json`, `application/geo+json`, `application/sml+json`, `application/swe+json`, `application/swe+text`
- Format-specific parameters for Part 2: `obsFormat` (observation encoding), `cmdFormat` (command encoding)

**References:**
- [Query Parameter Requirements](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/requirements/csapi-query-parameters.md) - Complete catalog of all CSAPI query parameters
- [OGC API - Common](https://docs.ogc.org/is/19-072/19-072.html) - Standard OGC API parameters (bbox, datetime, limit, offset, f)
- [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) - Temporal parameter format specification
- [Sub-Resource Navigation Requirements](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/requirements/csapi-subresource-navigation.md) - Query parameters on nested endpoints
- [URL Building Architecture](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/url-building-analysis.md) - Parameter encoding and array handling
- [Architecture Decision - Part 3: Query Parameters](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part3-validation.md#decision-2-query-parameter-analysis) - 47% shared parameters, type-based clustering

---

*[Systems, Deployments, Procedures, Sampling Features, Properties, DataStreams, Observations, Control Streams, Commands resource methods sections remain unchanged from v1 - they are already comprehensive and accurate]*

---

## Format Handler Components

### Why Full Format Handling for CSAPI

**This section explains why CSAPI requires full format parsing, unlike other OGC APIs (WFS, EDR, STAC) that only build URLs.**

**Research Evolution:**

- **Original Research (Plan 03):** Recommended URL-only (following upstream pattern)
- **User Mandate (2026-02-04):** Full format handling REQUIRED

**Why CSAPI is Different:**

1. **CSAPI-Specific Complexity:** SensorML 3.0 and SWE Common 3.0 are CORE to CSAPI functionality (not optional formats like WMS GetFeatureInfo XML or WFS DescribeFeatureType)
   - **Systems/Procedures:** Encoded in SensorML 3.0 (no simpler alternative)
   - **Observation Results:** Encoded in SWE Common 3.0 (binary/text/JSON - no alternatives)
   - **DataStream Schemas:** SWE Common DataComponents (complex type system)

2. **User Experience:** Manual parsing creates significant friction
   - Developers would need to implement 1,600+ lines of SensorML parser themselves
   - Developers would need to implement 1,600+ lines of SWE Common parser themselves
   - No mature TypeScript libraries exist for SensorML 3.0 / SWE Common 3.0
   - CSAPI adoption severely limited without format support

3. **Type Safety:** TypeScript interfaces provide strong typing
   - Parsed objects have full IntelliSense support
   - Compiler catches type errors
   - Better developer experience than raw JSON

4. **Ecosystem Gap:** No mature TypeScript libraries for these formats
   - SensorML 3.0: Published 2024, no existing TypeScript parsers
   - SWE Common 3.0: Published 2024, no existing TypeScript parsers
   - Library fills critical ecosystem gap

5. **Differentiation:** Complete CSAPI client library vs simple URL builder
   - Goal: Production-ready, enterprise-grade implementation
   - Not just a URL builder, but a complete CSAPI solution
   - Competitive advantage over minimal implementations

**Code Volume Impact:**

- URL-only implementation: ~890-1,260 lines
- Full format parsing: +3,300-4,650 lines (formats/)
- **Total: ~4,190-5,910 lines** (formats are 76-78% of implementation)

**Separation of Concerns:**

- CSAPIQueryBuilder = URL building ONLY
- Format parsers = Separate imports in formats/ subfolder
- Users choose when to parse (tree-shaking friendly)

**Usage Pattern:**

```typescript
import { CSAPIQueryBuilder } from 'ogc-client';
import { parseSensorML30 } from 'ogc-client/csapi/formats';

const builder = await endpoint.csapi('sensors');
const smlUrl = await builder.getSystem('sys-123', { f: 'sml' });
const response = await fetch(smlUrl);
const system = parseSensorML30(await response.text());
```

**Confidence:** ⭐⭐⭐⭐⭐ (5/5) - User mandate, clear ecosystem gap

**References:**
- [Architecture Decision - Part 1: Full Format Handling](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part1-structure.md#decision-3-full-format-handling) - Complete rationale with research evolution

---

*[GeoJSON Handler, SensorML Handler, SWE Common Handler, Format Detector, Validator sections remain unchanged from v1 - they are already comprehensive]*

---

*[Worker Components, Testing Components, Documentation Components sections remain unchanged from v1 - they are already comprehensive]*

---

## Code Volume Summary

**Research-Validated Estimates (from Architecture Decision Documents):**

### QueryBuilder Implementation

| Component | Lines | Notes |
|-----------|-------|-------|
| url_builder.ts | 640-860 | Base methods + validation |
| - Methods (base) | 500-700 | URL building logic |
| - Validation | 140-160 | Resource validation (~2 lines/method) |
| model.ts | 200-300 | TypeScript types/interfaces |
| helpers.ts | 50-100 | Shared utilities |
| **Core Subtotal** | **890-1,260** | **QueryBuilder core** |

### Format Parsing Implementation

| Component | Lines | Notes |
|-----------|-------|-------|
| formats/sensorml/ | 1,600-2,200 | SensorML 3.0 parser |
| formats/swecommon/ | 1,600-2,250 | SWE Common 3.0 parser |
| formats/geojson.ts | 50-100 | CSAPI GeoJSON extensions |
| formats/constants.ts | 50-100 | Constants and vocabularies |
| **Format Subtotal** | **3,300-4,650** | **Format parsers** |

### Integration

| Component | Lines | Notes |
|-----------|-------|-------|
| endpoint.ts additions | 23 | Import + cache + getter + factory |
| info.ts additions | 7 | Conformance getter |
| index.ts additions | 6 | Exports |
| **Integration Subtotal** | **36-39** | **Upstream integration** |

### Tests

| Component | Lines | Notes |
|-----------|-------|-------|
| QueryBuilder tests | 2,000-2,500 | URL construction, validation |
| Format parser tests | 3,500-4,700 | All formats, all encodings |
| Integration tests | 500-700 | End-to-end workflows |
| **Test Subtotal** | **6,000-7,900** | **>80% coverage** |

### Grand Total

| Category | Lines | Percentage |
|----------|-------|------------|
| **Implementation** | **4,226-5,949** | **100%** |
| - QueryBuilder core | 890-1,260 | 21% |
| - Format parsers | 3,300-4,650 | 76-78% |
| - Integration | 36-39 | 1% |
| **Tests** | **6,000-7,900** | **N/A** |
| **TOTAL** | **10,226-13,849** | **N/A** |

**Key Insights:**

1. **Format Parsers Dominate:** 76-78% of implementation is format parsing (justifies "why full format handling" section)
2. **Minimal Integration:** Only 36-39 lines modify existing files (upstream-friendly)
3. **Resource Validation:** ~140-160 lines (~3% of total) for significant UX improvement
4. **Test Coverage:** >80% coverage with ~6,000-7,900 lines of tests

**Comparison to Original Estimates:**

- **Original Estimate:** ~10,000-14,000 lines QueryBuilder alone
- **Research-Validated:** ~890-1,260 lines QueryBuilder core (~86% more accurate)
- **Original Total:** ~15,000-20,000 lines
- **Research-Validated:** ~10,226-13,849 lines (~32% more accurate)

**Confidence:** ⭐⭐⭐⭐⭐ (5/5) - Based on 10 research plans

**References:**
- [Architecture Decision - Part 1: Code Volume Summary](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part1-structure.md#code-volume-summary) - Detailed breakdown with component-level estimates

---

## Summary: Build vs Extend Breakdown

### Components Extending Existing Code (9 components):
1. **Conformance Reader** - Add CSAPI conformance class checks (`hasConnectedSystems` getter, ~7 lines in `info.ts`)
2. **Collections Reader** - Parse CSAPI collection metadata (`csapiCollections` getter, ~6 lines in `endpoint.ts`)
3. **OgcApiEndpoint Integration** - Add `csapi(collectionId)` factory method (~39 lines total across 2-3 files: 1 import + 2 cache + 6 getter + 7 conformance + 17 factory + 6 exports)
4. **GeoJSON Handler** - Recognize CSAPI feature types and properties (extend existing GeoJSON parser)
5. **Format Detector** - Add SensorML 3.0 and SWE Common 3.0 media types (extend existing content negotiation)
6. **Validator** - Add CSAPI validation rules (extend existing validation framework)
7. **Background Processing** - Add CSAPI operations to Web Worker (extend existing worker with new message types)
8. **Test Coverage** - Add CSAPI test suites to Jest framework (extend existing test infrastructure, ~6,000-7,900 lines)
9. **API Documentation** - Add CSAPI docs to TypeDoc (extend existing documentation)

### Components Building New Code (3 components):
1. **CSAPIQueryBuilder** - New query builder class (~890-1,260 lines)
   - url_builder.ts: ~640-860 lines (500-700 base + 140-160 validation)
   - model.ts: ~200-300 lines (types/interfaces)
   - helpers.ts: ~50-100 lines (utilities)
   - **70-80 public methods** for all 9 CSAPI resource types
   - **Resource validation** in all methods (fail-fast with clear errors)
   - **3 helper methods** for code reuse (not inheritance)
   - **60-70 unique URL patterns** (CRUD, nested, schema, status endpoints)

2. **SensorML Handler** - New format parser for SensorML 3.0 (~1,600-2,200 lines)
   - types.ts: ~400-600 lines
   - parser.ts: ~600-800 lines
   - simple-process.ts, aggregate-process.ts, physical-system.ts: ~550-700 lines
   - All system models, recursive component parsing, SWE Common integration

3. **SWE Common Handler** - New format parser for SWE Common 3.0 (~1,600-2,250 lines)
   - types.ts: ~400-600 lines
   - parser.ts: ~500-700 lines
   - data-record.ts, data-array.ts, components.ts: ~650-850 lines
   - JSON/Text/Binary encodings, all data component types, schema validation

### Architectural Notes:

**QueryBuilder Pattern:** Following the upstream EDR pattern (PR #114), CSAPI uses a single QueryBuilder class accessed via a factory method on OgcApiEndpoint. Developers call `endpoint.csapi(collectionId)` to get a CSAPIQueryBuilder instance containing all 9 resource type methods. This maintains the library's architecture principle of composition over inheritance.

**Resource Methods within QueryBuilder:** The 9 resource sections documented above (Systems, Deployments, Procedures, Sampling Features, Properties, DataStreams, Observations, Control Streams, Commands) are all methods within the single CSAPIQueryBuilder class, not separate standalone components. This follows the same pattern as EDR where `EDRQueryBuilder` contains methods like `getCubeUrl()`, `getCorridorUrl()`, etc.

**Integration Footprint:** Total modifications to existing files: ~39 lines across 2-3 files (`endpoint.ts`: ~26 lines, `info.ts`: ~7 lines, `index.ts`: ~6 lines). This minimal footprint follows the proven EDR integration pattern.

**Resource Validation:** All 70-80 methods validate resource availability before building URLs (~140-160 lines total, ~2 lines per method). This user-mandated feature provides fail-fast behavior with clear error messages, improving developer experience for CSAPI's 9 resource types.

**Helper Methods:** 2-3 private helper methods provide code reuse without inheritance, following 100% of upstream patterns. No abstract base classes, no inheritance chains.

**File Organization:** Flat core (url_builder.ts, model.ts, helpers.ts) + formats/ subfolder (sensorml/, swecommon/, geojson.ts, constants.ts) for tree-shaking and maintainability.

**Scope Understanding:** While the summary lists "3 components building new code" (architecturally accurate), the implementation totals ~4,226-5,949 lines:
- QueryBuilder core: ~890-1,260 lines (21%)
- Format parsers: ~3,300-4,650 lines (76-78%)
- Integration: ~36-39 lines (1%)

The format parsers represent ~76-78% of new code because CSAPI requires full parsing of SensorML 3.0 and SWE Common 3.0 (unlike other OGC APIs that only build URLs). This consolidated single-class architecture follows the upstream EDR pattern (one QueryBuilder per API family) but delivers functionally extensive capabilities across all CSAPI resources. Clients evaluating scope should understand that while architecturally elegant (3 new classes), the functional scope is substantial - implementing complete CSAPI Part 1 and Part 2 specifications with full query, filter, and pagination support across all resource types.

### Estimated Scope:
- **Extending existing code:** ~20% of effort (9 small extensions, ~50 total lines modified in existing files + ~6,000-7,900 test lines)
- **Building new code:** ~80% of effort (CSAPIQueryBuilder: ~890-1,260 lines + Format parsers: ~3,300-4,650 lines)
- **Total estimated lines of code:** ~10,226-13,849 lines (implementation + tests)
- **Total estimated time:** 6-8 weeks for complete implementation with >80% test coverage

**Confidence:** ⭐⭐⭐⭐⭐ (5/5) - All estimates validated through 10 research plans

**References:**
- [Architecture Decision - Part 1: Code Volume](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/design/csapiquerybuilder/architecture-decision/results/DECISION-part1-structure.md#code-volume-summary) - Component-level breakdown

---

## Project Goals Alignment

Every component described above aligns with these core project goals:

1. **Unified Developer Experience:** All CSAPI functionality accessed through existing `OgcApiEndpoint` class using the same patterns as Features, Tiles, and EDR
2. **Format Abstraction:** Developers work with TypeScript objects, not raw GeoJSON/SensorML/SWE Common
3. **Upstream Integration:** Extensions follow established patterns in the camptocamp/ogc-client repository (100% consistency validated through research)
4. **Complete Spec Coverage:** All CSAPI Part 1 and Part 2 resources with full CRUD support
5. **Production Ready:** Comprehensive validation, error handling, testing (>80% coverage), and documentation
6. **Performance Aware:** Web Worker support for heavy operations, efficient pagination, streaming support
7. **Developer Experience:** Resource validation (fail-fast with clear errors), type safety, helper methods for code reuse

---

## Development Standards

**Recommended Development Workflow:**
1. Write method signatures before implementation
2. Add comprehensive JSDoc comments with parameters, return types, examples
3. Implement functionality with inline documentation for complex logic
4. Write tests as you implement (not deferred to later)
5. Document edge cases and validation rules as discovered
6. Add usage examples to JSDoc for common scenarios
7. Update as you go - don't defer documentation

**Code Quality Standards:**
- TypeScript strict mode enabled
- 100% public API JSDoc coverage
- >80% test coverage (statement and branch)
- Lint-clean code (ESLint configuration)
- No magic numbers or strings (use constants)
- Consistent error handling patterns
- Performance profiling for heavy operations

**Documentation Standards:**
- Clear, concise method descriptions
- Parameter descriptions with types and constraints
- Return type documentation
- Example code for common use cases
- Links to relevant CSAPI specification sections
- Error condition documentation
- Performance characteristics noted where relevant

**Research-Validated Standards:**
- All architectural decisions backed by research (⭐⭐⭐⭐⭐ confidence)
- Follow upstream patterns (100% consistency)
- Helper methods for code reuse (0% inheritance)
- Resource validation in all methods (~2 lines per method)
- Flat file structure + formats/ subfolder
- Comprehensive test coverage (>80%)

---

**Document Version:** 2.0 (Research-Validated)  
**Previous Version:** [v1.0 (archived)](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/planning/archive/csapi-implementation-guide-v1.md)  
**Date:** 2026-02-04  
**Research Foundation:** 10 completed research plans with ⭐⭐⭐⭐⭐ confidence
