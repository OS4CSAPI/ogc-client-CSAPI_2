# CSAPI Implementation References

**Purpose:** Annotated bibliography of key resources for implementing OGC Connected Systems API (CSAPI) support in the Camptocamp OGC Client Library.

**Last Updated:** February 2, 2026

---

## Table of Contents

1. [OGC CSAPI Standards](#ogc-csapi-standards)
2. [Related OGC Standards](#related-ogc-standards)
3. [Foundational Semantic Standards](#foundational-semantic-standards)
4. [Data Encoding Standards](#data-encoding-standards)
5. [Code Repositories](#code-repositories)
6. [Vocabularies and Ontologies](#vocabularies-and-ontologies)
7. [Supporting Specifications](#supporting-specifications)
8. [Implementation Examples](#implementation-examples)

---

## OGC CSAPI Standards

### OGC API - Connected Systems - Part 1: Feature Resources
**URL:** https://docs.ogc.org/is/23-001/23-001.html  
**Document ID:** OGC 23-001  
**Status:** Approved Implementation Standard (2024)

Defines the core CSAPI resources representing physical and logical assets in observation and control systems: Systems, Deployments, Procedures, Sampling Features, and Properties. Specifies REST API patterns for discovery, CRUD operations, hierarchical relationships, and query parameters for these metadata resources. This is the foundation for understanding what sensors/actuators exist, where they're deployed, how they observe, and what they observe.

**Key Relevance:**
- Primary specification for Part 1 resource types and their properties
- Defines conformance classes we need to detect (`hasConnectedSystems`)
- Specifies query parameters: bbox, datetime, id, uid, q, recursive, parent, deployment, procedure, foi, observedProperty, controlledProperty
- Defines collection metadata structures for CSAPI resources
- Establishes GeoJSON and SensorML encoding requirements

---

### OGC API - Connected Systems - Part 1: OpenAPI Specification
**URL:** https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml  
**Format:** OpenAPI 3.1 (YAML)  
**Status:** Bundled specification (all references resolved)

Machine-readable OpenAPI definition of the CSAPI Part 1 REST API. Describes all endpoints, query parameters, request/response schemas, and error codes for Systems, Deployments, Procedures, Sampling Features, and Properties resources.

**Key Relevance:**
- Definitive source for endpoint paths and HTTP methods
- Query parameter validation rules and constraints
- Response schema definitions for all Part 1 resources
- Error response formats and status codes
- Could enable runtime API validation or dynamic client generation
- Reference for implementing URL builder methods in CSAPIQueryBuilder

---

### OGC API - Connected Systems - Part 2: Dynamic Data
**URL:** https://docs.ogc.org/is/23-002/23-002.html  
**Document ID:** OGC 23-002  
**Status:** Approved Implementation Standard (2024)

Extends Part 1 with dynamic observation and control data resources: DataStreams, Observations, Control Streams, and Commands. Specifies schema-driven observation ingestion, temporal queries, cursor-based pagination for high-volume data, command submission, and status tracking. This enables reading sensor data and controlling actuators beyond just metadata discovery.

**Key Relevance:**
- Primary specification for Part 2 resource types and operations
- Defines temporal query parameters: phenomenonTime, resultTime, executionTime, issueTime
- Specifies both pagination modes: offset-based (Part 1) and cursor-based (Part 2)
- Establishes schema requirements for DataStreams and ControlStreams
- Defines bulk operations for observations and commands
- Specifies SWE Common 3.0 encoding requirements for observation results

---

### OGC API - Connected Systems - Part 2: OpenAPI Specification
**URL:** https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml  
**Format:** OpenAPI 3.1 (YAML)  
**Status:** Bundled specification (all references resolved)

Machine-readable OpenAPI definition of the CSAPI Part 2 REST API. Describes all endpoints, query parameters, request/response schemas, and error codes for DataStreams, Observations, Control Streams, and Commands resources.

**Key Relevance:**
- Definitive source for endpoint paths and HTTP methods for dynamic data
- Temporal query parameter definitions with ISO 8601 interval formats
- Schema endpoint definitions for DataStreams and ControlStreams
- Observation result encoding specifications (JSON, Text, Binary)
- Command submission, status tracking, and result retrieval patterns
- Pagination parameter constraints (limit: 1-10000, cursor format)
- Reference for implementing URL builder methods for Part 2 resources

---

## Related OGC Standards

### OGC SensorML 3.0
**URL:** https://docs.ogc.org/is/23-000r1/23-000r1.html  
**Document ID:** OGC 23-000r1  
**Status:** Approved Implementation Standard (2024)  
**JSON Schema:** https://schemas.opengis.net/sensorml/3.0/

The latest Sensor Model Language standard providing rich XML-free JSON-native metadata for sensors, actuators, platforms, and processing chains. Complete rewrite from 2.x versions with modern JSON structure. Describes system capabilities, characteristics, components, connections, modes, and positions.

**Key Relevance:**
- Format we must parse for detailed System and Procedure descriptions
- Media type: `application/sml+json`
- Defines PhysicalSystem, PhysicalComponent, System, SystemConfiguration models
- Integrates deeply with SWE Common 3.0 for capabilities, characteristics, parameters
- Supports recursive component hierarchies we need to parse
- Alternative to GeoJSON for Systems/Procedures when detailed technical metadata needed

---

### OGC SWE Common 3.0
**URL:** https://docs.ogc.org/is/23-011r1/23-011r1.html  
**Document ID:** OGC 23-011r1  
**Status:** Approved Implementation Standard (2024)  
**JSON Schema:** https://schemas.opengis.net/sweCommon/3.0/

Data component specification for structured observation and control data encoding. Defines schemas for measurement data (DataRecord, Quantity, DataArray, etc.) and three encoding formats: JSON (human-readable), Text/CSV (compact), Binary (efficient streaming). The "type system" for observation results and command parameters.

**Key Relevance:**
- Critical format for parsing observation results and command parameters
- Media types: `application/swe+json`, `application/swe+text`, `application/swe+binary`
- Defines all data component types we must support (12+ types including ranges, choices, geometry)
- Specifies schema validation rules for observations against DataStream schemas
- Binary encoding parsing is most complex: IEEE 754 floats, multi-byte integers, endianness
- Used in SensorML 3.0 for capabilities, characteristics, parameters (nested integration)

---

### OGC API - Common
**URL:** https://docs.ogc.org/is/19-072/19-072.html  
**Document ID:** OGC 19-072  
**Status:** Approved Implementation Standard

Foundation specification for all OGC API standards defining common patterns: landing page, conformance endpoint, collections endpoint, bbox/datetime parameters, pagination, error handling, and HATEOAS link patterns.

**Key Relevance:**
- Establishes patterns CSAPI extends (conformance checking, collections metadata)
- Defines standard query parameters we inherit: bbox, datetime, limit, offset, f
- Specifies link relation types and HATEOAS navigation patterns
- Conformance class detection pattern we follow for `hasConnectedSystems`
- Already implemented in camptocamp/ogc-client, we extend rather than rebuild

---

### OGC API - Features
**URL:** https://docs.ogc.org/is/17-069r4/17-069r4.html  
**Document ID:** OGC 17-069r4  
**Status:** Approved Implementation Standard

REST API for accessing geospatial features with GeoJSON encoding. CSAPI Part 1 resources are exposed as GeoJSON features with SOSA/SSN semantic properties.

**Key Relevance:**
- Part 1 resources use Features API patterns (items endpoint, GeoJSON encoding)
- Existing GeoJSON parser in library provides foundation we extend
- Query parameter patterns (bbox, datetime, limit, offset) inherited by CSAPI
- Feature collections pattern used for Systems, Deployments, Procedures, Sampling Features

---

## Foundational Semantic Standards

### SOSA/SSN (Semantic Sensor Network Ontology)
**W3C Recommendation:** https://www.w3.org/TR/vocab-ssn/  
**Namespace:** http://www.w3.org/ns/sosa/  
**Status:** W3C Recommendation (2017)

Semantic foundation for sensor and observation concepts. SOSA (Sensor, Observation, Sample, and Actuator) provides core classes and properties. SSN extends SOSA with additional concepts. CSAPI resources are instances of SOSA/SSN classes.

**Key Relevance:**
- Vocabulary for `systemType` property: `sosa:Sensor`, `sosa:Platform`, `sosa:Actuator`, `sosa:Sampler`
- Semantic model for resource relationships: system-deployment, system-procedure, observation-foi
- `featureType` property values reference SOSA classes
- Properties like `observedProperty`, `madeBySensor`, `hasFeatureOfInterest` from SOSA
- Validates our understanding of sensor observation patterns

---

### GeoJSON (RFC 7946)
**RFC:** https://tools.ietf.org/html/rfc7946  
**Status:** IETF Proposed Standard (2016)

JSON format for encoding geographic features with geometries and properties. Primary encoding for CSAPI Part 1 resources.

**Key Relevance:**
- All Part 1 resources encoded as GeoJSON features
- Library already has GeoJSON parser we extend with CSAPI-specific property extraction
- Geometry types for system locations, deployment footprints, sampling feature shapes
- Feature properties object contains CSAPI resource metadata
- Coordinate validation (WGS84, right-hand rule) we must enforce

---

## Data Encoding Standards

### ISO 8601 (Date and Time Format)
**ISO Standard:** https://www.iso.org/iso-8601-date-and-time-format.html  
**Wikipedia:** https://en.wikipedia.org/wiki/ISO_8601

International standard for date, time, and temporal interval representation. Used extensively in CSAPI for temporal queries and temporal properties.

**Key Relevance:**
- All temporal parameters use ISO 8601: datetime, phenomenonTime, resultTime, executionTime, issueTime
- Interval formats: instant, closed interval, open-start, open-end
- validTime property encoding for Systems, Deployments
- Temporal extent in collection metadata
- Must parse all interval types including open-ended (e.g., `2024-01-01/..`)

---

### UCUM (Unified Code for Units of Measure)
**Home:** http://unitsofmeasure.org/  
**Specification:** http://unitsofmeasure.org/ucum.html

Standard for representing units of measure in machine-readable format. Used in SWE Common for quantity units.

**Key Relevance:**
- Unit codes in SWE Common Quantity components: `Cel`, `m`, `Pa`, `%`, etc.
- Unit validation for observation results
- Unit conversion calculations when needed
- Scale factors and offsets in unit definitions
- Validates measurement data is physically meaningful

---

### IEEE 754 (Floating Point Arithmetic)
**Wikipedia:** https://en.wikipedia.org/wiki/IEEE_754

Standard for binary floating-point arithmetic. Used in SWE Common Binary encoding.

**Key Relevance:**
- Binary observation encoding uses IEEE 754 float32 and float64
- Must implement binary parsing with correct endianness (little-endian, big-endian)
- Precision considerations for measurement data
- Special values: NaN, Infinity for missing/invalid data
- Performance-critical for high-volume observation streaming

---

## Code Repositories

### camptocamp/ogc-client
**GitHub:** https://github.com/camptocamp/ogc-client  
**NPM:** https://www.npmjs.com/package/@camptocamp/ogc-client

The upstream library we're extending with CSAPI support. Provides unified OGC API access for Features, Tiles, Records, EDR, WMS, WFS, WMTS.

**Key Relevance:**
- Architecture patterns we must follow (OgcApiEndpoint, QueryBuilder classes)
- EDR implementation (PR #114) is our direct pattern: factory method, QueryBuilder, conformance detection
- Existing format handlers (GeoJSON, XML) we extend
- Web Worker infrastructure for background processing
- Testing patterns (Jest, fixtures) we replicate for CSAPI
- TypeDoc documentation style we match
- Integration requires ~48 lines across 2-3 files (endpoint.ts, info.ts, index.ts)

---

### OS4CSAPI/ogc-client-CSAPI_2
**GitHub:** https://github.com/OS4CSAPI/ogc-client-CSAPI_2

This repository - our development workspace for CSAPI implementation.

**Key Relevance:**
- Fork of camptocamp/ogc-client for CSAPI development
- Implementation guide and technical architecture in docs/planning/
- Will contain all new CSAPI code: CSAPIQueryBuilder, SensorML handler, SWE Common handler
- Test fixtures for CSAPI resources
- Integration point for upstream contribution

---

## Vocabularies and Ontologies

### QUDT (Quantities, Units, Dimensions and Data Types)
**Home:** http://www.qudt.org/  
**Vocabularies:** http://www.qudt.org/release2/qudt-catalog.html

Ontology for physical quantities, units, and dimensions. Common vocabulary for observed/controlled properties.

**Key Relevance:**
- Property definition URIs for observedProperty, controlledProperty
- Standard vocabulary alternative to CF Standard Names
- Quantity kinds (Temperature, Pressure, Velocity, etc.)
- Unit definitions with conversion factors
- Referenced in CSAPI examples and test servers

---

### CF Standard Names
**Home:** https://cfconventions.org/standard-names.html  
**Name Table:** https://cfconventions.org/Data/cf-standard-names/current/build/cf-standard-name-table.html

Standardized vocabulary for climate and forecast variables. Widely used in Earth observation communities.

**Key Relevance:**
- Alternative vocabulary for observedProperty in atmospheric/oceanic observations
- Standard names: `air_temperature`, `sea_surface_temperature`, etc.
- Canonical units and descriptions for each variable
- Common in meteorology, oceanography, climate science CSAPI deployments
- Many servers use CF names for property definitions

---

### EPSG Geodetic Parameter Dataset
**Home:** https://epsg.org/  
**Registry:** https://epsg.io/

Registry of coordinate reference systems, geodetic datums, and coordinate transformations.

**Key Relevance:**
- CRS codes for spatial data: EPSG:4326 (WGS84), EPSG:3857 (Web Mercator)
- Geometry validation requires CRS awareness
- Reference frames for Vector components in SWE Common
- Position definitions in SensorML
- Default CRS for CSAPI is WGS84 (EPSG:4326) per GeoJSON RFC 7946

---

## Supporting Specifications

### IANA Link Relations
**Registry:** https://www.iana.org/assignments/link-relations/link-relations.xhtml

Official registry of link relation types for HATEOAS navigation.

**Key Relevance:**
- Standard rel values: `self`, `alternate`, `collection`, `item`, `next`, `prev`
- CSAPI-specific relations: `system`, `deployment`, `procedure`, `datastream`, `observations`
- Link validation in GeoJSON features and collection metadata
- Navigation patterns between related resources

---

### JSON Schema
**Specification:** https://json-schema.org/  
**Latest Draft:** https://json-schema.org/draft/2020-12/json-schema-core.html

Standard for describing JSON document structure and validation rules.

**Key Relevance:**
- SensorML 3.0 and SWE Common 3.0 both have JSON Schemas for validation
- Schema validation in our parsers uses JSON Schema
- DataStream result schemas defined using JSON Schema subset
- ControlStream parameter schemas use similar patterns
- Type definitions inform our TypeScript interfaces

---

### OpenAPI Specification
**Home:** https://www.openapis.org/  
**Specification:** https://spec.openapis.org/oas/latest.html

Standard for describing REST APIs. OGC API standards provide OpenAPI definitions.

**Key Relevance:**
- CSAPI servers expose OpenAPI definitions at `/api` endpoint
- Describes available endpoints, query parameters, response schemas
- Could enable dynamic client generation or runtime validation
- Alternative to hard-coded URL patterns (future enhancement)
- Useful for testing against compliant servers

---

## Implementation Examples

### OGC CSAPI Test Server
**URL:** TBD (reference implementation when available)

Official OGC reference implementation of CSAPI specification.

**Key Relevance:**
- Validation of our implementation against spec-compliant server
- Source of test fixtures and example responses
- Edge cases and conformance class examples
- Performance characteristics baseline
- Real-world data schemas and patterns

---

### 52°North SensorWeb Community
**Home:** https://52north.org/software/software-projects/sos/  
**GitHub:** https://github.com/52North

Open source community with extensive OGC sensor web implementations (SOS, SensorML, SWE Common).

**Key Relevance:**
- Reference implementations of earlier SWE standards (SensorML 2.0, SWE Common 2.0)
- Java parsers for SensorML/SWE Common (architecture reference, not direct reuse)
- Real-world deployment examples and lessons learned
- Test data and fixtures from operational systems
- Community expertise on sensor web standards

---

## Notes

### Document Maintenance
- Add new references as discovered during implementation
- Update URLs if specifications move
- Note specification version changes (CSAPI may evolve to 1.1, 2.0, etc.)
- Track implementation-specific resources (blog posts, tutorials, tools)

### Missing References
Resources we may need to add:
- Specific CSAPI server implementations as they become available
- TypeScript libraries for SWE Common/SensorML parsing (if any exist)
- Performance benchmarks for observation streaming
- Security considerations (OAuth2, API keys) for CSAPI endpoints
- Real-world CSAPI deployment case studies
