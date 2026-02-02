# CSAPI Client Library: What We're Building

**Purpose:** This document describes every component we need to implement CSAPI support in the Camptocamp OGC Client Library, explaining which components extend existing code versus which require building new code from scratch.

**Date:** February 1, 2026

---

## Main Component: Unified OGC API Access

The Camptocamp OGC Client Library uses the `OgcApiEndpoint` class as the main component for all OGC API standards. Developers use this same class to interact with CSAPI servers by pointing it at a CSAPI-compliant endpoint. The `OgcApiEndpoint` automatically detects CSAPI capabilities by checking the server's conformance classes and exposes the appropriate methods for working with sensors, observations, and control streams. This unified approach means developers don't need to learn different APIs for different OGC standards - they use the same patterns whether accessing Features, Tiles, Records, EDR, or CSAPI data. The CSAPI implementation extends `OgcApiEndpoint` following the exact same pattern already established for EDR support.

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

**Implementation Type:** EXTENDING EXISTING CODE

---

### Collections Reader: Extending Metadata Parsing

The collections reader is existing code that fetches and parses the `/collections` endpoint to discover what data is available on a server. For CSAPI, we will extend this parser to recognize and extract CSAPI-specific metadata that indicates whether a collection contains Systems, DataStreams, Observations, or other CSAPI resources. This is primarily an extension of existing parsing logic rather than building something entirely new - we're adding new properties to the collection info objects and new filter methods like `csapiSystemCollections`, `csapiDataStreamCollections`, and `csapiObservationCollections` alongside the existing `featureCollections` and `edrCollections` getters. The extension reuses the upstream repository's established patterns for handling different resource types within the unified collections framework. This approach supports the project goal of providing developers a consistent experience across all OGC API standards through one endpoint class.

**CSAPI Collection Properties to Parse:**
- `featureType` property indicating resource type (e.g., `sosa:System`, `sosa:Deployment`, `sosa:ObservationCollection`)
- Links to CSAPI-specific operations (create, update, delete, schema endpoints for Part 2 resources)
- Temporal extent for observation collections
- Spatial extent for systems and deployment collections
- Available query parameters and filtering capabilities
- Supported formats (GeoJSON, SensorML, SWE Common)

**Implementation Type:** EXTENDING EXISTING CODE

---

### URL Builder: Building New CSAPI Query Construction

The URL builder is new code we need to build specifically for CSAPI operations, following the pattern established by the existing `EDRQueryBuilder` class. CSAPI requires constructing URLs for complex operations like querying Systems with spatial/temporal filters, creating Observations in DataStreams, retrieving historical observations with temporal ranges, and sending Commands to Control Streams - operations that don't exist in Features or EDR. We will build a new `CSAPIQueryBuilder` class (or similar) that handles these CSAPI-specific URL construction needs while following the same architecture patterns used by EDR's query builder in the upstream repository. This new component will be instantiated and managed internally by `OgcApiEndpoint`, keeping the developer-facing API simple and consistent. Building this as a separate, focused module aligns with the project goal of maintaining clean separation of concerns while integrating naturally into the existing codebase.

**URL Construction Requirements:**
- Canonical resource endpoints: `/systems`, `/deployments`, `/procedures`, `/samplingFeatures`, `/properties`, `/datastreams`, `/observations`, `/controlstreams`, `/commands`
- Nested resource endpoints: `/systems/{id}/subsystems`, `/systems/{id}/datastreams`, `/datastreams/{id}/observations`, `/controlstreams/{id}/commands`
- Schema endpoints: `/datastreams/{id}/schema`, `/controlstreams/{id}/schema`
- Bulk operations: POST with arrays of observations or commands
- Command status/result endpoints: `/commands/{id}/status`, `/commands/{id}/result`

**Complete Query Parameter Support:**

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

**Implementation Type:** BUILDING NEW CODE (following EDRQueryBuilder pattern)

---

## Format Handler Components

### GeoJSON Handler: Extending Existing Parser

The GeoJSON handler is existing code in the library that parses GeoJSON Feature and FeatureCollection documents, supporting all seven geometry types (Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection). For CSAPI, we will extend this handler to recognize CSAPI-specific feature types through the `featureType` property and extract CSAPI resource properties from the feature `properties` object. CSAPI Part 1 resources (Systems, Deployments, Procedures, Sampling Features) are encoded as GeoJSON features with additional semantic properties like `systemType`, `assetType`, `uniqueIdentifier`, `validTime`, and association links to related resources. The extension will add type checking for these CSAPI properties and validation rules specific to CSAPI feature types, while maintaining compatibility with generic GeoJSON handling for other OGC API standards. This approach leverages the existing GeoJSON infrastructure while adding CSAPI-aware semantics on top.

**CSAPI-Specific GeoJSON Properties:**
- Systems: `systemType` (URI), `assetType` (enum), `uniqueIdentifier` (URI), `validTime` (period), association arrays (`subsystems`, `deployments`, `procedures`, `samplingFeatures`, `datastreams`, `controlstreams`)
- Deployments: `deployedSystems` (array), `validTime` (period), spatial/temporal extent
- Procedures: `procedureType` (URI), `methodKind` (URI), `attachedTo` (link to system)
- Sampling Features: `samplingFeatureType` (URI), `sampledFeature` (link), `relatedSamplingFeature` (links)
- All resources: `id`, `name`, `description`, `links` (HATEOAS navigation)

**Validation Requirements:**
- `uniqueIdentifier` must be valid URI (preferably URN)
- `systemType` must be from SOSA/SSN vocabulary (`sosa:Sensor`, `sosa:Platform`, etc.)
- `validTime` must be ISO 8601 temporal period or instant
- Association arrays must contain valid resource links or inline features
- Geometry must be valid per RFC 7946 (WGS84 coordinates)

**Implementation Type:** EXTENDING EXISTING CODE

---

### SensorML Handler: Building New Format Parser

The SensorML handler is new code we need to build to parse [OGC SensorML 3.0](https://docs.ogc.org/is/23-000r1/23-000r1.html) format documents that describe sensor systems, components, and processes in detail. SensorML 3.0 is the latest version of the JSON-native format from the Sensor Web Enablement (SWE) standards family, published in 2024, that provides rich metadata about sensors, actuators, and processing chains with significant improvements over the previous XML-based 2.x versions. CSAPI servers return SensorML 3.0 documents when describing Systems or Procedures, providing detailed technical specifications beyond what GeoJSON can express. We will build a parser that handles SensorML 3.0 system models (System, PhysicalComponent, PhysicalSystem), component descriptions, feature of interest definitions, capability/characteristic/constraint specifications, input/output specifications, configuration parameters, and temporal validity periods. The parser must convert SensorML 3.0 JSON documents into TypeScript objects that the library can work with, following the same architecture patterns as the existing GeoJSON and other format handlers. This new component represents one of the most complex format handling tasks in the project due to SensorML's hierarchical structure, extensive vocabulary, and integration with [SWE Common 3.0](https://docs.ogc.org/is/23-011r1/23-011r1.html) data components.

**SensorML 3.0 Document Types to Parse:**
- **System**: Abstract system description with common properties (identification, classification, characteristics, capabilities, contacts)
- **PhysicalComponent**: Single physical sensor or actuator with detailed specifications, position, and operating characteristics
- **PhysicalSystem**: Composite system made of multiple components with spatial/functional connections and aggregation properties
- **SystemConfiguration**: Reusable configuration profiles with parameter settings and mode definitions

**SensorML 3.0 Elements to Extract:**
- **Identification**: `uid` (unique identifier), `label`, `description`, `identifiers` (array of alternate identifiers)
- **Classification**: `classifiers` array with type definitions, intended applications, sensor taxonomies
- **ValidTime**: Temporal period when description is valid (ISO 8601 period)
- **SecurityConstraints**: Access restrictions, usage limitations, classification levels
- **Characteristics**: Observable properties, measurement ranges, resolution, accuracy, sensitivity (using SWE Common 3.0 DataRecord)
- **Capabilities**: Operating conditions, survival ranges, response times, power requirements (using SWE Common 3.0 DataRecord)
- **Constraints**: Physical or operational constraints limiting system use
- **Contacts**: Responsible parties, manufacturers, operators with roles and contact information
- **Documentation**: Links to user manuals, datasheets, specifications, images, videos
- **FeaturesOfInterest**: What the system observes or controls (links to feature definitions)
- **Inputs**: Data interfaces, observable properties, control inputs (using SWE Common 3.0 DataComponent definitions)
- **Outputs**: Data outputs, actuated properties, status indicators (using SWE Common 3.0 DataComponent definitions)
- **Parameters**: Configuration settings, calibration parameters, operational modes (using SWE Common 3.0 DataComponent definitions)
- **Modes**: Operating modes with associated configurations and state transitions
- **Components** (PhysicalSystem only): Array of component systems with roles and connections
- **Connections** (PhysicalSystem only): Data flow and physical connections between components
- **Position**: Location and orientation using GeoJSON Point or more complex positioning models

**Parsing Complexity:**
- Recursive component parsing for nested PhysicalSystems
- SWE Common 3.0 DataComponent integration (characteristics, capabilities, parameters, inputs, outputs all use SWE Common schemas)
- Unit of measure parsing ([UCUM codes](http://unitsofmeasure.org/))
- Reference resolution (external links to procedures, datasheets, feature definitions)
- Position/location parsing (GeoJSON geometry plus orientation/reference frames)
- Mode and configuration state management
- Connection graph traversal for component relationships

**References:**
- [OGC SensorML 3.0 Standard](https://docs.ogc.org/is/23-000r1/23-000r1.html) (OGC 23-000r1)
- [SensorML 3.0 JSON Schema](https://schemas.opengis.net/sensorml/3.0/)
- [OGC Connected Systems API Part 1 - SensorML Encoding](https://docs.ogc.org/is/23-001/23-001.html#sensorml-encoding)

**Implementation Type:** BUILDING NEW CODE

---

### SWE Common Handler: Building New Format Parser

The SWE Common handler is new code we need to build to parse [OGC SWE Common 3.0](https://docs.ogc.org/is/23-011r1/23-011r1.html) format documents that define observation data schemas and encode actual observation results. SWE Common 3.0 is the latest version of the data encoding standard from the Sensor Web Enablement family, published in 2024, that describes structured measurement data with units, quality information, and constraints using a modernized JSON-native approach. CSAPI Part 2 uses SWE Common 3.0 extensively for DataStream schemas (defining what properties are observed and result structure) and Observation results (actual measurement values). We will build parsers for three SWE Common 3.0 encodings: JSON (human-readable structured data), Text (CSV-style compact encoding), and Binary (efficient encoding for high-volume streaming). The handler must parse DataComponent schemas (Quantity, Count, Boolean, Text, Time, Category, CategoryRange, QuantityRange, TimeRange, DataRecord, DataArray, Vector, Matrix, GeometryData), extract values from encoded results, validate measurements against schemas including quality indicators and constraints, and convert between different encodings. This is the second most complex format handling component after SensorML due to the variety of encoding formats and the need for schema-driven validation.

**SWE Common 3.0 Data Components to Parse:**

**Simple Components:**
- **Quantity**: Numeric measurement with unit of measure and optional constraints (temperature, pressure, voltage)
- **Count**: Integer count value with optional constraints (particle count, event count)
- **Boolean**: True/false indicator (on/off status, alarm state)
- **Text**: String value with optional pattern constraints (station ID, observation notes)
- **Time**: ISO 8601 timestamp with optional temporal reference frame (observation time, event time)
- **Category**: Categorical value from controlled vocabulary with code space (weather condition, quality flag)

**Range Components (new in 3.0):**
- **QuantityRange**: Range of numeric values with units (temperature range, acceptable operating range)
- **CategoryRange**: Range of categorical values (quality range indicators)
- **TimeRange**: Temporal interval (observation period, validity period)

**Complex Components:**
- **DataRecord**: Structured record containing multiple named fields (multi-property observation)
- **DataArray**: Array of measurements with variable or fixed element count (time series, profile, trajectory)
- **Vector**: Positional vector with coordinate reference system (3D location, velocity, acceleration)
- **Matrix**: Matrix of values with specified dimensions (covariance matrix, transformation matrix)
- **DataChoice**: Choice between alternative structures with selection criteria (different measurement modes, conditional observations)
- **GeometryData**: Geometric data encoded using GeoJSON geometry types (spatial observations, coverage areas)

**SWE Common 3.0 Encodings to Support:**

**JSON Encoding** (human-readable):
```json
{
  "temperature": {"uom": {"code": "Cel"}, "value": 23.5},
  "humidity": {"uom": {"code": "%"}, "value": 65.2}
}
```

**Text Encoding** (CSV-style compact):
```
23.5,65.2
24.1,63.8
```

**Binary Encoding** (efficient streaming):
- IEEE 754 floating point (32-bit, 64-bit)
- Integer encodings (signed/unsigned, 8/16/32/64-bit)
- Base64 encoded blocks
- Block compression support
- Little-endian and big-endian byte order support

**Schema Validation Requirements:**
- Result structure must match DataStream schema (DataComponent definitions)
- Values must be within allowed ranges (AllowedValues, AllowedIntervals, AllowedTimes constraints)
- Units of measure must match schema specification ([UCUM codes](http://unitsofmeasure.org/))
- Array dimensions must match schema element count specifications
- Quality indicators must follow schema (nilValues, quality DataRecord)
- Timestamps must follow ISO 8601 format with optional reference frame
- Categorical values must come from defined code space
- Text patterns must match defined constraints (regex patterns)

**Advanced 3.0 Features:**
- **NilValues**: Representation of missing/invalid data with reason codes
- **Quality**: Associated quality indicators (accuracy, precision, confidence)
- **Constraints**: AllowedValues, AllowedIntervals, AllowedTimes, AllowedTokens for validation
- **ReferenceFrames**: Temporal and spatial reference frame definitions
- **CodeSpaces**: Controlled vocabularies for categorical values

**References:**
- [OGC SWE Common 3.0 Standard](https://docs.ogc.org/is/23-011r1/23-011r1.html) (OGC 23-011r1)
- [SWE Common 3.0 JSON Schema](https://schemas.opengis.net/sweCommon/3.0/)
- [OGC Connected Systems API Part 2 - SWE Common Encoding](https://docs.ogc.org/is/23-002/23-002.html#swe-common-encoding)

**Implementation Type:** BUILDING NEW CODE

---

### Format Detector: Extending Existing Content Negotiation

The format detector is existing code that examines HTTP response headers (Content-Type) and document structure to determine what format a server returned. For CSAPI, we will extend this detector to recognize three new media types used by CSAPI servers: `application/sml+json` (SensorML-JSON encoding), `application/swe+json` (SWE Common JSON encoding), and `application/swe+text` (SWE Common Text/CSV encoding). The extension will add these media types to the library's format registry and route them to the appropriate new format handlers (SensorML handler, SWE Common handler). This follows the existing pattern where the detector checks Content-Type headers first, then falls back to document structure analysis if headers are missing or ambiguous. The extension maintains the library's existing format abstraction architecture where developers work with parsed TypeScript objects regardless of the wire format.

**New Media Types to Detect:**
- `application/sml+json` → Route to SensorML Handler
- `application/swe+json` → Route to SWE Common Handler (JSON encoding)
- `application/swe+text` → Route to SWE Common Handler (Text encoding)
- `application/swe+binary` → Route to SWE Common Handler (Binary encoding)
- `application/geo+json` with CSAPI `featureType` → Route to GeoJSON Handler with CSAPI extensions

**Detection Strategy:**
1. Check Content-Type header (primary method)
2. Examine root JSON properties (fallback for missing headers)
3. Look for format-specific identifiers (SensorML `PhysicalSystem`, SWE Common `DataRecord`)
4. Validate against format schema constraints

**Implementation Type:** EXTENDING EXISTING CODE

---

### Validator: Extending Existing Validation Framework

The validator is existing code that checks whether parsed documents conform to format specifications and semantic constraints. For CSAPI, we will extend this validator to check CSAPI-specific requirements: required properties for each resource type, valid enumeration values (systemType, assetType), URI format validation (uniqueIdentifier must be URN), temporal validity constraints (validTime periods), spatial constraint validation (geometry must be WGS84), association integrity (linked resources must exist or be valid references), and schema conformance for Part 2 resources (Observation results must match DataStream schema, Command parameters must match ControlStream schema). The extension will add CSAPI validation rules to the existing validation pipeline, reporting errors and warnings through the same error handling mechanism used for other formats. This maintains consistency in how the library reports validation failures across all OGC API standards.

**CSAPI Validation Rules:**

**Part 1 Resource Validation:**
- Systems: `uniqueIdentifier` (required URI), `systemType` (required, from SOSA vocabulary), `name` (required string), `location` (required for mobile systems)
- Deployments: `validTime` (required temporal period), spatial extent (required)
- Procedures: `procedureType` (required URI), attached system reference validation
- Sampling Features: `sampledFeature` (required reference), geometry (required)
- Properties: `definition` (required URI from vocabulary), `label` (required string)

**Part 2 Resource Validation:**
- DataStreams: schema validation (result schema must be valid SWE Common DataComponent), observed properties must reference existing Property resources, system association (required)
- Observations: result validation (must conform to DataStream schema), temporal validation (phenomenonTime required), result time validation
- Control Streams: schema validation (parameter schema must be valid SWE Common), system association (required)
- Commands: parameter validation (must conform to ControlStream schema), execution time validation

**Cross-Reference Validation:**
- Association links must reference existing resources or be valid URIs
- Subsystem references must create valid hierarchies (no circular references)
- Deployment-system associations must be bidirectional
- DataStream-system associations must be valid
- Observation-DataStream associations must be valid

**Implementation Type:** EXTENDING EXISTING CODE

---

## Part 1 Resource Components

### Systems Resource Handler: Building New Resource Manager

The Systems resource handler is new code we need to build to manage CSAPI System resources, representing sensors, actuators, platforms, samplers, and other observing systems. This handler will implement all CRUD operations (Create, Read, Update, Delete) for Systems at both canonical endpoints (`/systems`, `/systems/{id}`) and nested endpoints (`/systems/{parentId}/subsystems`). Systems are the core resource in CSAPI Part 1, serving as the entry point for discovering available sensors and their relationships to deployments, procedures, sampling features, and observation streams. The handler must support hierarchical queries (recursive subsystem traversal), relationship filtering (query by deployment, procedure, or sampling feature), spatial filtering (bbox), temporal filtering (validTime), and both GeoJSON and SensorML format parsing. This component connects to the URL builder for query construction, the format handlers for parsing responses, and the validator for checking system constraints. It represents a significant new component with complex relationship management and hierarchical navigation.

**Operations to Implement:**

**Read Operations:**
- List all systems: `GET /systems`
- Get single system: `GET /systems/{id}`
- Query systems: `GET /systems?bbox=...&parent=...&recursive=true`
- List subsystems: `GET /systems/{parentId}/subsystems`
- Recursive subsystem query: `GET /systems/{parentId}/subsystems?recursive=true`
- Systems by deployment: `GET /systems?deployment={deploymentId}`
- Systems by procedure: `GET /systems?procedure={procedureId}`
- Systems in collection: `GET /collections/{collectionId}/items?featureType=sosa:System`

**Create Operations:**
- Create system: `POST /systems` with GeoJSON or SensorML body
- Create subsystem: `POST /systems/{parentId}/subsystems` with body
- Add to collection: `POST /collections/{collectionId}/items` with system feature

**Update Operations:**
- Replace system: `PUT /systems/{id}` with full document
- Partial update: `PATCH /systems/{id}` with partial document (JSON Patch or Merge Patch)

**Delete Operations:**
- Delete system: `DELETE /systems/{id}`
- Cascade delete: `DELETE /systems/{id}?cascade=true` (deletes subsystems, datastreams, etc.)

**System Relationship Management:**
- Parse and expose subsystem hierarchy
- Navigate system-deployment associations (bidirectional)
- Navigate system-procedure associations
- Navigate system-sampling feature associations
- Navigate system-datastream associations (Part 2)
- Navigate system-controlstream associations (Part 2)

**Complete Query and Filtering Support:**

This handler implements FULL query parameter support - NOT MVP scope. All filtering and pagination capabilities from the CSAPI specification are supported.

- **Spatial filtering**: `bbox` parameter (2D and 3D bounding boxes)
- **Temporal filtering**: `datetime` parameter for validTime filtering (ISO 8601 intervals: instant, closed interval, open start, open end)
- **Hierarchy traversal**: `recursive` parameter (true = all descendants, false = direct children only)
- **Relationship filtering**: `parent`, `deployment`, `procedure`, `foi` parameters for association-based queries
- **ID filtering**: `id` parameter (supports comma-separated list for multiple IDs)
- **UID filtering**: `uid` parameter (URN-based unique identifier filtering)
- **Full-text search**: `q` parameter for searching across all text properties
- **Property-based filtering**: Any system property can be used as query parameter (e.g., `systemType=sosa:Sensor`, `name=Weather*`)
- **Pagination**: `limit` (1 to server maximum) and `offset` (non-negative integer) for predictable page navigation
- **Format negotiation**: `f` parameter and Accept headers for GeoJSON vs SensorML-JSON format selection
- **Combined filtering**: All query parameters work together with AND logic

**Implementation Type:** BUILDING NEW CODE

---

### Deployments Resource Handler: Building New Resource Manager

The Deployments resource handler is new code we need to build to manage CSAPI Deployment resources, describing where and when systems are deployed in the field. This handler implements all CRUD operations for Deployments at canonical endpoints (`/deployments`, `/deployments/{id}`) and nested endpoints (`/deployments/{parentId}/subdeployments`). Deployments connect systems to geographic locations and temporal periods, enabling queries like "what sensors were active in this region during this time period." The handler must support hierarchical subdeployment queries (recursive parameter), relationship filtering (query by system), spatial filtering (bbox for deployment footprint), temporal filtering (validTime for deployment period), and GeoJSON format parsing with deployment-specific metadata. Deployments have bidirectional associations with systems - a system can have multiple deployments over time, and a deployment can involve multiple systems. This component manages these many-to-many relationships and provides navigation methods for traversing them.

**Operations to Implement:**

**Read Operations:**
- List all deployments: `GET /deployments`
- Get single deployment: `GET /deployments/{id}`
- Query deployments: `GET /deployments?bbox=...&system=...&datetime=...`
- List subdeployments: `GET /deployments/{parentId}/subdeployments`
- Recursive subdeployment query: `GET /deployments/{parentId}/subdeployments?recursive=true`
- Deployments by system: `GET /deployments?system={systemId}`
- Deployments in collection: `GET /collections/{collectionId}/items?featureType=sosa:Deployment`

**Create Operations:**
- Create deployment: `POST /deployments` with GeoJSON body
- Create subdeployment: `POST /deployments/{parentId}/subdeployments`
- Add to collection: `POST /collections/{collectionId}/items`

**Update Operations:**
- Replace deployment: `PUT /deployments/{id}`
- Partial update: `PATCH /deployments/{id}`

**Delete Operations:**
- Delete deployment: `DELETE /deployments/{id}`
- Cascade delete: `DELETE /deployments/{id}?cascade=true`

**Deployment Relationship Management:**
- Parse and expose subdeployment hierarchy
- Navigate deployment-system associations (many-to-many)
- Extract spatial extent (deployment footprint)
- Extract temporal extent (deployment period)
- Validate validTime periods

**Complete Query and Filtering Support:**

This handler implements FULL query parameter support - NOT MVP scope.

- **Spatial filtering**: `bbox` parameter (2D and 3D for deployment footprint/volume)
- **Temporal filtering**: `datetime` parameter for deployment validTime period filtering
- **Hierarchy traversal**: `recursive` parameter for nested subdeployments
- **Relationship filtering**: `system` parameter (deployments for specific systems), `parent` parameter
- **ID filtering**: `id` parameter (multiple IDs supported)
- **UID filtering**: `uid` parameter
- **Full-text search**: `q` parameter
- **Property-based filtering**: Any deployment property as query parameter
- **Pagination**: `limit` and `offset`
- **Format**: GeoJSON only (deployments always have spatial geometry)
- **Combined filtering**: All parameters work together

**Implementation Type:** BUILDING NEW CODE

---

### Procedures Resource Handler: Building New Resource Manager

The Procedures resource handler is new code we need to build to manage CSAPI Procedure resources, describing the methodologies, algorithms, or processes used to generate observations or control systems. This handler implements all CRUD operations for Procedures at canonical endpoints (`/procedures`, `/procedures/{id}`). Procedures can represent sensor measurement methodologies, data processing algorithms, calibration procedures, quality control processes, or sampling protocols. The handler must parse both GeoJSON features (for simple procedure metadata) and SensorML process models (for detailed technical descriptions), support relationship filtering (procedures used by specific systems), and provide access to procedure documentation and parameters. Procedures are referenced by Systems (via `systemKind` or `procedure` properties) and DataStreams (via `procedure` property), connecting the "how" of data collection to the "what" (systems) and "where" (observation streams).

**Operations to Implement:**

**Read Operations:**
- List all procedures: `GET /procedures`
- Get single procedure: `GET /procedures/{id}`
- Query procedures: `GET /procedures?system=...&q=...`
- Procedures by system: `GET /procedures?system={systemId}`
- Procedures in collection: `GET /collections/{collectionId}/items?featureType=sosa:Procedure`

**Create Operations:**
- Create procedure: `POST /procedures` with GeoJSON or SensorML body
- Add to collection: `POST /collections/{collectionId}/items`

**Update Operations:**
- Replace procedure: `PUT /procedures/{id}`
- Partial update: `PATCH /procedures/{id}`

**Delete Operations:**
- Delete procedure: `DELETE /procedures/{id}`

**Procedure Properties to Parse:**
- `procedureType`: URI indicating type (sensor, algorithm, protocol)
- `methodKind`: URI from controlled vocabulary
- `attachedTo`: Link to system that uses this procedure
- `inputs`: Input parameters/requirements (from SensorML)
- `outputs`: Output specifications (from SensorML)
- `parameters`: Configuration parameters (from SensorML)
- `documentation`: Links to manuals, specifications

**Procedure Relationship Management:**
- Systems using this procedure (reverse lookup)
- DataStreams using this procedure (Part 2 cross-reference)
- Parse SensorML method descriptions
- Extract parameter definitions

**Query Features:**
- Relationship filtering (system parameter)
- Text search (q parameter for methodology descriptions)
- Property filtering (id, uid, custom properties)
- Pagination (limit, offset)
- Format negotiation (GeoJSON vs SensorML)

**Implementation Type:** BUILDING NEW CODE

---

### Sampling Features Resource Handler: Building New Resource Manager

The Sampling Features resource handler is new code we need to build to manage CSAPI Sampling Feature resources, representing the features being observed or sampled by systems. This handler implements all CRUD operations for Sampling Features at canonical endpoints (`/samplingFeatures`, `/samplingFeatures/{id}`) and nested endpoints (`/systems/{systemId}/samplingFeatures` for system-specific sampling features). Sampling Features answer "what is being observed?" - they can be physical locations (weather station site), spatial regions (forest plot), physical samples (water sample, core sample), or abstract features (administrative boundary). The handler must support spatial queries (bbox for sampling location), relationship queries (sampling features for specific systems or sampled features), hierarchical relationships (related sampling features), and GeoJSON format parsing with sampling feature metadata. Sampling Features connect systems to the ultimate features of interest through the sampling relationship chain.

**Operations to Implement:**

**Read Operations:**
- List all sampling features: `GET /samplingFeatures`
- Get single sampling feature: `GET /samplingFeatures/{id}`
- Query sampling features: `GET /samplingFeatures?bbox=...&foi=...&system=...`
- System-specific sampling features: `GET /systems/{systemId}/samplingFeatures`
- Sampling features by feature of interest: `GET /samplingFeatures?foi={featureId}`
- Sampling features in collection: `GET /collections/{collectionId}/items?featureType=sosa:SamplingFeature`

**Create Operations:**
- Create sampling feature: `POST /samplingFeatures` with GeoJSON body
- Create under system: `POST /systems/{systemId}/samplingFeatures`
- Add to collection: `POST /collections/{collectionId}/items`

**Update Operations:**
- Replace sampling feature: `PUT /samplingFeatures/{id}`
- Partial update: `PATCH /samplingFeatures/{id}`

**Delete Operations:**
- Delete sampling feature: `DELETE /samplingFeatures/{id}`

**Sampling Feature Properties to Parse:**
- `samplingFeatureType`: URI indicating type (point, specimen, transect)
- `sampledFeature`: Link to ultimate feature of interest
- `relatedSamplingFeature`: Links to related sampling features
- `hostedProcedure`: Procedures performed at this location
- `shape`: Geometry (point, line, polygon) of sampling location
- `samplingMethod`: How sample was collected

**Sampling Feature Relationship Management:**
- Systems using this sampling feature
- Ultimate feature of interest (sampled feature)
- Related sampling features (hierarchical relationships)
- Observations at this sampling feature (Part 2)

**Query Features:**
- Spatial filtering (bbox parameter)
- Relationship filtering (system, foi, relatedSamplingFeature)
- Property filtering (id, uid, q)
- Pagination (limit, offset)
- Format: GeoJSON

**Implementation Type:** BUILDING NEW CODE

---

### Properties Resource Handler: Building New Resource Manager

The Properties resource handler is new code we need to build to manage CSAPI Property resources, defining the observable or controllable properties that systems can measure or actuate. This handler implements read-only operations (GET only, no CRUD) for Properties at canonical endpoints (`/properties`, `/properties/{id}`). Properties represent physical quantities (temperature, pressure, humidity), chemical properties (pH, dissolved oxygen), biological parameters (species count), or control parameters (valve position, power state). The handler must parse property definitions from controlled vocabularies (like QUDT or CF Standard Names), support relationship queries (properties observed by specific systems or datastreams), and provide access to property metadata (definition URIs, units, descriptions). Properties serve as the vocabulary for DataStreams (what is being measured) and ControlStreams (what can be controlled), connecting abstract concepts to concrete measurement streams.

**Operations to Implement:**

**Read Operations:**
- List all properties: `GET /properties`
- Get single property: `GET /properties/{id}`
- Query properties: `GET /properties?q=temperature&system=...`
- Properties by system: `GET /properties?system={systemId}` (properties this system can observe)
- Properties in collection: `GET /collections/{collectionId}/items?featureType=sosa:ObservableProperty`

**Property Metadata to Parse:**
- `definition`: URI from controlled vocabulary (QUDT, CF, etc.)
- `label`: Human-readable name
- `description`: Detailed explanation
- `baseProperty`: Parent property in hierarchy
- `subProperties`: Child properties
- `units`: Standard units of measure

**Property Relationship Management:**
- Systems capable of observing this property
- DataStreams observing this property (Part 2)
- ControlStreams controlling this property (Part 2)
- Property hierarchies (baseProperty/subProperty relationships)

**Query Features:**
- Text search (q parameter for property names/descriptions)
- Relationship filtering (system, baseProperty)
- Property filtering (id, uid)
- Pagination (limit, offset)
- Format: JSON only (no GeoJSON for properties)

**Implementation Type:** BUILDING NEW CODE

---

## Part 2 Resource Components

### DataStreams Resource Handler: Building New Resource Manager

The DataStreams resource handler is new code we need to build to manage CSAPI DataStream resources, representing collections of observations from the same system with shared schemas. This handler implements all CRUD operations for DataStreams at canonical endpoints (`/datastreams`, `/datastreams/{id}`) and nested endpoints (`/systems/{systemId}/datastreams` for system-specific streams). DataStreams define the structure and metadata for observation data: what properties are being observed, what system is observing them, what sampling features or features of interest are involved, what schema the results follow, and what output format is used. The handler must parse SWE Common result schemas (DataComponent definitions), validate that observations conform to these schemas, support relationship queries (datastreams for specific systems, procedures, or features of interest), and provide access to schema endpoints (`/datastreams/{id}/schema`). DataStreams are the bridge between Part 1 metadata (systems, procedures, sampling features) and Part 2 dynamic data (observations).

**Operations to Implement:**

**Read Operations:**
- List all datastreams: `GET /datastreams`
- Get single datastream: `GET /datastreams/{id}`
- Query datastreams: `GET /datastreams?system=...&observedProperty=...&foi=...`
- System-specific datastreams: `GET /systems/{systemId}/datastreams`
- Get result schema: `GET /datastreams/{id}/schema`
- DataStreams in collection: `GET /collections/{collectionId}/items`

**Create Operations:**
- Create datastream: `POST /datastreams` with JSON body including result schema
- Create under system: `POST /systems/{systemId}/datastreams`

**Update Operations:**
- Replace datastream: `PUT /datastreams/{id}` (caution: schema changes affect existing observations)
- Partial update: `PATCH /datastreams/{id}` (limited schema updates allowed)

**Delete Operations:**
- Delete datastream: `DELETE /datastreams/{id}`
- Cascade delete: `DELETE /datastreams/{id}?cascade=true` (deletes all observations)

**DataStream Properties to Parse:**
- `name`: Human-readable name
- `description`: Detailed description
- `system`: Link to producing system (required)
- `observedProperties`: Array of property URIs being measured
- `resultSchema`: SWE Common DataComponent defining observation structure
- `resultFormat`: Output encoding (JSON, Text, Binary)
- `phenomenonTimeRange`: Temporal extent of observations
- `procedure`: Link to observation methodology
- `samplingFeatures`: Links to sampling features
- `featuresOfInterest`: Links to ultimate features of interest
- `liveFeed`: Boolean indicating real-time availability
- `archiveDuration`: How long observations are retained

**DataStream Relationship Management:**
- System producing this datastream (required association)
- Properties being observed (required association)
- Observations in this datastream (Part 2, see Observations handler)
- Procedure used (optional association)
- Sampling features (optional association)
- Features of interest (optional association)

**Schema Operations:**
- Parse SWE Common result schema
- Validate observation results against schema
- Provide schema introspection for clients
- Support schema evolution (versioning)

**Complete Query and Filtering Support:**

This handler implements FULL query parameter support - NOT MVP scope.

- **Relationship filtering**: `system`, `observedProperty`, `foi`, `samplingFeature`, `procedure` parameters for association-based discovery
- **Temporal filtering**: `datetime` parameter for filtering by phenomenonTimeRange (datastream validity period)
- **ID filtering**: `id` parameter (multiple datastream IDs)
- **UID filtering**: `uid` parameter
- **Full-text search**: `q` parameter across datastream names and descriptions
- **Property-based filtering**: Any datastream property (e.g., `liveFeed=true`, `resultFormat=JSON`)
- **Pagination**: `limit` and `offset` for paging through large datastream catalogs
- **Format**: JSON (datastream metadata and SWE Common schemas in JSON)
- **Combined filtering**: All parameters work together to narrow discovery

**Implementation Type:** BUILDING NEW CODE

---

### Observations Resource Handler: Building New Resource Manager

The Observations resource handler is new code we need to build to manage CSAPI Observation resources, representing actual measurement data from systems. This handler implements CRUD operations for Observations at canonical endpoints (`/observations`, `/observations/{id}`) and nested endpoints (`/datastreams/{datastreamId}/observations` for stream-specific observations). Observations are the dynamic data in CSAPI - they change frequently, come in high volumes, and require efficient pagination and temporal queries. The handler must parse SWE Common result encodings (JSON, Text/CSV, Binary), validate results against DataStream schemas, support temporal range queries (phenomenonTime, resultTime), implement cursor-based pagination for large result sets, and handle bulk observation creation (POST with arrays of observations). Observations connect to DataStreams for schema and metadata, making them schema-driven rather than free-form. This is one of the most performance-critical components due to high data volumes.

**Operations to Implement:**

**Read Operations:**
- List all observations: `GET /observations?phenomenonTime=...&limit=...`
- Get single observation: `GET /observations/{id}`
- Stream-specific observations: `GET /datastreams/{id}/observations?phenomenonTime=2024-01-01/2024-01-31`
- Query by result time: `GET /observations?resultTime=2024-01-01/..`
- Query by feature of interest: `GET /observations?foi={featureId}`
- Pagination: `GET /observations?cursor={nextCursor}&limit=1000`

**Create Operations:**
- Create single observation: `POST /datastreams/{id}/observations` with observation body
- Bulk create: `POST /datastreams/{id}/observations` with array of observations
- Stream ingestion: POST to `/datastreams/{id}/observations` with streaming payload

**Update Operations:**
- Replace observation: `PUT /observations/{id}` (rare, usually observations are immutable)
- Partial update: `PATCH /observations/{id}` (for quality flags, validation status)

**Delete Operations:**
- Delete observation: `DELETE /observations/{id}` (rare, usually retained)

**Observation Properties to Parse:**
- `phenomenonTime`: When the observation was made (required, ISO 8601)
- `resultTime`: When the result became available (optional, defaults to phenomenonTime)
- `result`: Observation result structured per DataStream schema (required)
- `resultQuality`: Quality indicators (accuracy, precision, flags)
- `parameters`: Additional metadata (sensor settings, environmental conditions)
- `featureOfInterest`: Link to observed feature (optional if provided by DataStream)

**Observation Result Parsing:**
- Parse SWE Common JSON encoding: structured JSON with units
- Parse SWE Common Text encoding: CSV-style compact format
- Parse SWE Common Binary encoding: efficient binary format
- Validate against DataStream result schema
- Extract individual property values
- Extract units of measure
- Extract quality information

**Complete Temporal Query Features:**

This handler implements FULL temporal filtering - NOT MVP scope. All temporal query patterns from CSAPI Part 2 are supported.

- **phenomenonTime filtering** (when observation was made - PRIMARY temporal filter):
  - Single instant: `phenomenonTime=2024-01-15T12:00:00Z`
  - Closed interval: `phenomenonTime=2024-01-01/2024-01-31`
  - Open start (before end): `phenomenonTime=../2024-01-31`
  - Open end (after start): `phenomenonTime=2024-01-01/..`
  - Multiple disjoint intervals: `phenomenonTime=2024-01-01/2024-01-15,2024-02-01/2024-02-15`
- **resultTime filtering**: When observation result became available (ISO 8601 intervals)
- **Temporal binning/aggregation**: Group observations by time period (hour, day, month)
- **Temporal resolution**: Filter by minimum time spacing between observations

**Complete Pagination Support:**

Both offset-based and cursor-based pagination fully implemented - NOT MVP scope.

- **Offset-based pagination** (Part 1 style): `limit` + `offset` for predictable page numbers
- **Cursor-based pagination** (Part 2 optimized): `limit` + `cursor` for efficient streaming of large time series
  - Cursor tokens encode position in result set
  - Stable across result set changes
  - Required for datasets > 100K observations
- **Limit parameter**: 1 to 10,000 (CSAPI Part 2 maximum)
- **Next/prev links**: Link headers for navigation
- **Stable sorting**: By phenomenonTime ascending, then by ID for deterministic ordering

**Performance Considerations:**
- Efficient parsing of large observation arrays
- Streaming support for bulk ingestion
- Incremental parsing of CSV/Text format
- Memory-efficient handling of large result sets
- Caching of DataStream schemas

**Implementation Type:** BUILDING NEW CODE

---

### Control Streams Resource Handler: Building New Resource Manager

The Control Streams resource handler is new code we need to build to manage CSAPI ControlStream resources, representing command interfaces for controlling actuators and systems. This handler implements all CRUD operations for Control Streams at canonical endpoints (`/controlstreams`, `/controlstreams/{id}`) and nested endpoints (`/systems/{systemId}/controlstreams` for system-specific control channels). Control Streams define what can be controlled on a system: the control schema (parameters structure using SWE Common), valid parameter ranges and constraints, execution modes (synchronous vs asynchronous), and feasibility checking capabilities. The handler must parse SWE Common parameter schemas, validate commands against these schemas, support relationship queries (controlstreams for specific systems or controlled properties), and provide access to schema endpoints (`/controlstreams/{id}/schema`). Control Streams mirror DataStreams architecturally but for control/actuation rather than observation/sensing. This component is essential for bidirectional system interaction beyond just reading sensor data.

**Operations to Implement:**

**Read Operations:**
- List all control streams: `GET /controlstreams`
- Get single control stream: `GET /controlstreams/{id}`
- Query control streams: `GET /controlstreams?system=...&controlledProperty=...`
- System-specific control streams: `GET /systems/{systemId}/controlstreams`
- Get parameter schema: `GET /controlstreams/{id}/schema`
- Control streams in collection: `GET /collections/{collectionId}/items`

**Create Operations:**
- Create control stream: `POST /controlstreams` with JSON body including parameter schema
- Create under system: `POST /systems/{systemId}/controlstreams`

**Update Operations:**
- Replace control stream: `PUT /controlstreams/{id}`
- Partial update: `PATCH /controlstreams/{id}`

**Delete Operations:**
- Delete control stream: `DELETE /controlstreams/{id}`
- Cascade delete: `DELETE /controlstreams/{id}?cascade=true` (deletes all commands)

**Control Stream Properties to Parse:**
- `name`: Human-readable name
- `description`: Detailed description
- `system`: Link to controlled system (required)
- `controlledProperties`: Array of property URIs being controlled
- `parameterSchema`: SWE Common DataComponent defining command structure
- `parameterFormat`: Input encoding (JSON, Text, Binary)
- `executionMode`: Synchronous or asynchronous
- `supportsExecutionControl`: Can cancel/pause/resume
- `supportsFeasibility`: Can check feasibility before execution

**Control Stream Relationship Management:**
- System being controlled (required association)
- Properties being controlled (required association)
- Commands sent through this stream (see Commands handler)
- Valid parameter ranges and constraints

**Schema Operations:**
- Parse SWE Common parameter schema
- Validate command parameters against schema
- Provide schema introspection for clients
- Support schema evolution

**Query Features:**
- Relationship filtering (system, controlledProperty)
- Property filtering (id, uid, q)
- Pagination (limit, offset)
- Format: JSON (schemas in SWE Common JSON)

**Implementation Type:** BUILDING NEW CODE

---

### Commands Resource Handler: Building New Resource Manager

The Commands resource handler is new code we need to build to manage CSAPI Command resources, representing instructions sent to systems for actuation or control. This handler implements CRUD operations for Commands at canonical endpoints (`/commands`, `/commands/{id}`) and nested endpoints (`/controlstreams/{controlstreamId}/commands` for stream-specific commands). Commands are the control equivalent of Observations - they flow to systems rather than from systems. The handler must parse SWE Common parameter encodings, validate parameters against ControlStream schemas, support temporal queries (issueTime, executionTime), implement command status tracking (`/commands/{id}/status`), handle command results (`/commands/{id}/result`), and support bulk command submission. Commands can be synchronous (immediate execution with result) or asynchronous (queued execution with status polling). This component enables closed-loop control and system tasking capabilities.

**Operations to Implement:**

**Read Operations:**
- List all commands: `GET /commands?issueTime=...&limit=...`
- Get single command: `GET /commands/{id}`
- Stream-specific commands: `GET /controlstreams/{id}/commands?issueTime=2024-01-01/..`
- Query by execution time: `GET /commands?executionTime=2024-01-01/..`
- Query by status: `GET /commands?status=pending,executing`
- Get command status: `GET /commands/{id}/status`
- Get command result: `GET /commands/{id}/result`

**Create Operations:**
- Create single command: `POST /controlstreams/{id}/commands` with command body
- Bulk create: `POST /controlstreams/{id}/commands` with array of commands
- Check feasibility: `POST /controlstreams/{id}/feasibility` with parameters

**Update Operations:**
- Update command status: `PATCH /commands/{id}/status` (for system-generated status updates)
- Update command result: `PUT /commands/{id}/result` (when execution completes)
- Cancel command: `POST /commands/{id}/cancel`

**Delete Operations:**
- Delete command: `DELETE /commands/{id}` (if not yet executed)

**Command Properties to Parse:**
- `issueTime`: When command was issued (ISO 8601)
- `executionTime`: When to execute (optional, immediate if omitted)
- `parameters`: Command parameters per ControlStream schema
- `priority`: Execution priority (integer)
- `sender`: Entity that issued command
- `receiver`: Target system/component

**Command Status Properties:**
- `status`: Current state (pending, accepted, executing, completed, failed, cancelled)
- `percentCompletion`: Progress indicator (0-100)
- `statusMessage`: Human-readable status
- `updateTime`: Last status update timestamp

**Command Result Properties:**
- `result`: Execution result per ControlStream schema
- `completionTime`: When execution finished
- `resultQuality`: Quality indicators for result

**Temporal Query Features:**
- issueTime filtering (when command submitted)
- executionTime filtering (when command scheduled)
- Status-based filtering
- Temporal range queries

**Command Lifecycle Management:**
- Submit command (validate parameters)
- Track status (poll for updates)
- Retrieve result (when completed)
- Cancel command (if supported)
- Check feasibility (before submission)

**Synchronous vs Asynchronous Execution:**
- Synchronous: POST returns 200 with immediate result
- Asynchronous: POST returns 201 with status URL, client polls for completion

**Implementation Type:** BUILDING NEW CODE

---

## Worker Components

### Background Processing: Extending Existing Web Worker Pattern

The background processing component uses existing Web Worker infrastructure in the library to move heavy parsing and validation work off the main thread, keeping browser UIs responsive. For CSAPI, we will extend this worker to handle CSAPI-specific operations: SensorML parsing (complex XML/JSON traversal), SWE Common parsing (especially binary encoding decoding), large observation result set processing, bulk command validation, and schema validation. The existing library uses a worker pattern where computationally expensive operations are offloaded to a Web Worker that runs in parallel, returning results asynchronously. The extension will add CSAPI message types to the worker's message handler and integrate the new format parsers (SensorML, SWE Common) into the worker context. This maintains the library's performance characteristics when dealing with large datasets or complex formats. The same code also provides a fallback for non-worker environments (Node.js, older browsers).

**CSAPI Operations to Move to Worker:**
- SensorML document parsing (complex recursive structure)
- SWE Common binary decoding (byte buffer processing)
- Large observation array parsing (thousands of observations)
- Bulk command parameter validation
- Schema validation (complex SWE Common schemas)
- Recursive system hierarchy traversal
- Large GeoJSON feature collection parsing

**Worker Message Types to Add:**
- `PARSE_SENSORML`: Input SensorML JSON/XML, output parsed object
- `PARSE_SWE_RESULT`: Input SWE encoded result + schema, output parsed values
- `VALIDATE_OBSERVATIONS`: Input observations + schema, output validation results
- `VALIDATE_COMMANDS`: Input commands + schema, output validation results
- `PARSE_OBSERVATION_ARRAY`: Input large array, output parsed observations
- `TRAVERSE_HIERARCHY`: Input system + recursive flag, output full tree

**Performance Benefits:**
- Prevent main thread blocking during large data operations
- Enable responsive UIs during heavy parsing
- Parallel processing of multiple requests
- Better utilization of multi-core CPUs

**Fallback for Non-Worker Environments:**
- Provide synchronous fallback implementation
- Maintain same API surface
- Graceful degradation in environments without Web Worker support

**Implementation Type:** EXTENDING EXISTING CODE (adding CSAPI message handlers to existing worker)

---

## Testing Components

### Test Coverage: Extending Existing Test Suite

The test coverage component extends the existing Jest test suite to cover all CSAPI functionality. For CSAPI, we will add test suites for every new component: format parsers (SensorML, SWE Common), resource handlers (Systems, DataStreams, Observations, Commands, etc.), query builders, validators, and integration tests against real CSAPI servers. The library has established testing patterns including unit tests (isolated component tests), integration tests (multi-component interaction), fixture-based tests (using example documents from the spec), and live server tests (optional tests against real endpoints). The extension will add CSAPI test fixtures (GeoJSON features, SensorML documents, SWE Common results), mock CSAPI responses, and test utilities specific to CSAPI validation. Test coverage should match the existing library standard (>80% code coverage).

**CSAPI Test Suites to Create:**

**Format Parser Tests:**
- GeoJSON CSAPI extensions (system properties, deployment metadata)
- SensorML parser (all process types, components, characteristics)
- SWE Common parser (all data components, all encodings)
- Format detector (media type recognition)
- Validator (all CSAPI validation rules)

**Resource Handler Tests:**
- Systems (CRUD operations, hierarchy, relationships)
- Deployments (CRUD, spatial/temporal queries)
- Procedures (read operations, SensorML parsing)
- Sampling Features (CRUD, spatial queries)
- Properties (read operations, vocabulary integration)
- DataStreams (CRUD, schema operations)
- Observations (CRUD, temporal queries, bulk operations, pagination)
- Control Streams (CRUD, parameter schemas)
- Commands (CRUD, status tracking, execution)

**Query Builder Tests:**
- URL construction for all endpoints
- Query parameter encoding (spatial, temporal, relationship)
- Nested endpoint navigation
- Format negotiation
- Pagination links

**Integration Tests:**
- End-to-end workflows (discover systems → query observations)
- Cross-resource navigation (system → datastreams → observations)
- Format round-tripping (parse → validate → serialize)
- Error handling (server errors, validation errors, network errors)

**Test Fixtures to Create:**
- Example CSAPI responses from spec
- Real server responses (52°North, pygeoapi, etc.)
- Edge cases (empty collections, malformed data)
- Large datasets (pagination testing)

**Live Server Tests:**
- Optional tests against public CSAPI endpoints
- Skipped by default (require network access)
- Useful for validation against real implementations

**Implementation Type:** EXTENDING EXISTING CODE (adding CSAPI test suites to existing Jest framework)

---

## Documentation Components

### API Documentation: Extending Existing TypeDoc Documentation

The API documentation component extends the existing TypeDoc documentation to cover all CSAPI additions. For CSAPI, we will add documentation for new TypeScript interfaces and types (CSAPI resource models, query options, schemas), new methods on OgcApiEndpoint (hasConnectedSystems, csapiCollections, etc.), usage examples for each resource type, format handler documentation, and migration guides for users of other CSAPI clients. The library uses TypeDoc to generate API documentation from TypeScript source code comments, providing type-aware documentation with cross-references and examples. The extension will add comprehensive JSDoc comments to all new code, following the existing documentation standards and style. This ensures CSAPI features are discoverable and understandable for library users.

**Documentation to Add:**

**Type Documentation:**
- CSAPI resource interfaces (System, Deployment, Procedure, SamplingFeature, Property, DataStream, Observation, ControlStream, Command)
- Query option interfaces (spatial filters, temporal filters, relationship filters)
- Schema interfaces (SWE Common DataComponent types)
- Format-specific types (SensorML process models)

**Method Documentation:**
- OgcApiEndpoint CSAPI methods (detection, collections, resource access)
- Resource handler methods (CRUD operations, queries, navigation)
- Format parser methods (parse, validate, serialize)
- Query builder methods (URL construction, parameter encoding)

**Usage Examples:**
- Discovering CSAPI servers
- Querying systems and deployments
- Accessing observation data
- Submitting commands
- Parsing SensorML descriptions
- Working with SWE Common schemas

**Migration Guides:**
- For users of 52°North JavaScript client
- For users of Python OGC API clients
- For users of direct HTTP/fetch approaches

**Implementation Type:** EXTENDING EXISTING CODE (adding CSAPI docs to existing TypeDoc setup)

---

## Summary: Build vs Extend Breakdown

### Components Extending Existing Code (9 components):
1. **Conformance Reader** - Add CSAPI conformance class checks
2. **Collections Reader** - Parse CSAPI collection metadata
3. **GeoJSON Handler** - Recognize CSAPI feature types and properties
4. **Format Detector** - Add SensorML and SWE Common media types
5. **Validator** - Add CSAPI validation rules
6. **Background Processing** - Add CSAPI operations to Web Worker
7. **Test Coverage** - Add CSAPI test suites to Jest framework
8. **API Documentation** - Add CSAPI docs to TypeDoc

### Components Building New Code (13 components):
1. **URL Builder** - New CSAPI query builder (following EDRQueryBuilder pattern)
2. **SensorML Handler** - New format parser for SensorML 2.0/2.1
3. **SWE Common Handler** - New format parser for SWE Common 2.0 (JSON/Text/Binary)
4. **Systems Resource Handler** - New resource manager with CRUD and hierarchy
5. **Deployments Resource Handler** - New resource manager with CRUD
6. **Procedures Resource Handler** - New resource manager with CRUD
7. **Sampling Features Resource Handler** - New resource manager with CRUD
8. **Properties Resource Handler** - New resource manager (read-only)
9. **DataStreams Resource Handler** - New resource manager with schema operations
10. **Observations Resource Handler** - New resource manager with temporal queries and pagination
11. **Control Streams Resource Handler** - New resource manager with parameter schemas
12. **Commands Resource Handler** - New resource manager with status and results

### Estimated Scope:
- **Extending existing code:** ~30% of effort (building on established patterns)
- **Building new code:** ~70% of effort (new format parsers, new resource managers, new schemas)
- **Total estimated lines of code:** ~20,000-25,000 lines
- **Total estimated time:** 8-10 weeks for complete implementation

---

## Project Goals Alignment

Every component described above aligns with these core project goals:

1. **Unified Developer Experience:** All CSAPI functionality accessed through existing `OgcApiEndpoint` class using the same patterns as Features, Tiles, and EDR
2. **Format Abstraction:** Developers work with TypeScript objects, not raw GeoJSON/SensorML/SWE Common
3. **Upstream Integration:** Extensions follow established patterns in the camptocamp/ogc-client repository
4. **Complete Spec Coverage:** All CSAPI Part 1 and Part 2 resources with full CRUD support
5. **Production Ready:** Comprehensive validation, error handling, testing, and documentation
6. **Performance Aware:** Web Worker support for heavy operations, efficient pagination, streaming support
