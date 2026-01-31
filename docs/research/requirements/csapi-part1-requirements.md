# CSAPI Part 1 Requirements Analysis

**Document:** Section 1.1 - Standard Document Analysis  
**Source:** [OGC API – Connected Systems Part 1: Feature Resources (23-001)](https://docs.ogc.org/is/23-001/23-001.html)  
**Date:** 2026-01-31  
**Status:** Complete

---

## Executive Summary

This document analyzes the OGC API – Connected Systems Part 1 standard document to extract ALL requirements for implementing a TypeScript client library. Part 1 defines 5 resource types (Systems, Deployments, Procedures, Sampling Features, Properties) with comprehensive CRUD operations, advanced filtering, and dual format support (GeoJSON, SensorML).

**Key Findings:**
- **5 Part 1 Resource Types:** Systems, Deployments, Procedures, Sampling Features, Properties
- **11 Conformance Classes** covering common behavior, resources, CRUD, filtering, encodings
- **70+ Operations Total** across canonical endpoints, nested endpoints, collections
- **Dual Format Support:** GeoJSON (spatial features) and SensorML-JSON (detailed descriptions)
- **Advanced Filtering:** 30+ query parameters for relationship-based queries
- **Sub-Resource Navigation:** Nested collections (subsystems, subdeployments, system-specific sampling features)
- **Hierarchical Queries:** Recursive parameter for multi-level traversal

---

## 1. Resource Types and Operations

### 1.1 Systems Resource

**Definition:** System resources represent instances of observing systems, platforms, sensors, actuators, and samplers. These are feature resources implementing the `ssn:System` concept from SOSA/SSN ontology.

**System Types (from Table 6):**
- **Sensor** (`sosa:Sensor`) - primary activity is sensing/observing
- **Actuator** (`sosa:Actuator`) - primary activity is actuating
- **Sampler** (`sosa:Sampler`) - primary activity is sampling
- **Platform** (`sosa:Platform`) - primary activity is carrying other systems
- **System** (`sosa:System`) - all other system types

**Asset Types (from Table 7):**
- Equipment - hardware devices, automated or manual
- Human - human beings following procedures
- LivingThing - animals or organisms (often platforms carrying sensors)
- Simulation - software algorithms simulating real-world
- Process - process/chain transforming data
- Group - group of similar systems (sensor network, fleet)
- Other - application-specific types

**Operations:**

**Read Operations:**
- `GET {api_root}/systems` - List all systems (canonical resources endpoint)
- `GET {api_root}/systems/{id}` - Retrieve single system (canonical resource endpoint)
- `GET {api_root}/systems?<filters>` - Query systems with filters
- `GET {api_root}/collections/{collectionId}/items` - Systems from collection (featureType=`sosa:System`)

**Create Operations:**
- `POST {api_root}/systems` - Create new system at canonical endpoint
- `POST {api_root}/systems/{parentId}/subsystems` - Create subsystem under parent
- `POST {api_root}/collections/{collectionId}/items` - Add system to collection

**Update/Replace Operations:**
- `PUT {api_root}/systems/{id}` - Replace system (full replacement)
- `PATCH {api_root}/systems/{id}` - Update system (partial update)
- `PUT {api_root}/collections/{collectionId}/items/{id}` - Replace in collection

**Delete Operations:**
- `DELETE {api_root}/systems/{id}` - Delete system
- `DELETE {api_root}/systems/{id}?cascade=true` - Delete system and nested resources
- `DELETE {api_root}/collections/{collectionId}/items/{id}` - Remove from collection (not deletion)

**System Properties (Required):**
- `uniqueIdentifier` (URI) - Persistent unique identifier (preferably URN)
- `name` (String) - Human readable name
- `systemType` (URI/CURIE) - Type from Table 6
- `subsystems` (Array of System resources) - Required association
- `samplingFeatures` (Array of SamplingFeature resources) - Required association
- `datastreams` (Array of DataStream resources) - Required association (Part 2)
- `controlstreams` (Array of ControlStream resources) - Required association (Part 2)

**System Properties (Optional):**
- `description` (String) - Human readable description
- `assetType` (Enum) - Type from Table 7
- `validTime` (DateTime) - Validity period of description
- `location` (Point) - Current location (recommended for mobile systems)
- `systemKind` (Procedure) - Description of system kind (datasheet)
- `deployments` (Array of Deployment resources)
- `procedures` (Array of Procedure resources)

**System Requirements:**
- Systems MUST have `location` property that updates when system moves (Requirement 4)
- Systems MUST be accessible at canonical URL `{api_root}/systems/{id}` (Requirement 5)
- Server MUST expose canonical endpoint `{api_root}/systems` (Requirement 7)
- Server MUST expose at least one collection containing Systems (Requirement 8)
- Collections containing Systems MUST set `featureType=sosa:System` (Requirement 8)

---

### 1.2 Subsystems

**Definition:** Subsystems are regular System resources made available through a sub-collection of a parent System. Used to model hierarchical systems (components, payloads).

**Operations:**

**Read Operations:**
- `GET {api_root}/systems/{parentId}/subsystems` - List subsystems of parent
- `GET {api_root}/systems/{parentId}/subsystems?recursive=false` - Direct subsystems only
- `GET {api_root}/systems/{parentId}/subsystems?recursive=true` - All nested subsystems
- `GET {api_root}/systems?recursive=true` - All systems including all subsystems

**Create Operations:**
- `POST {api_root}/systems/{parentId}/subsystems` - Create subsystem under specific parent

**Subsystem Requirements:**
- Subsystems MUST be exposed at `{api_root}/systems/{parentId}/subsystems` (Requirement 9)
- Subsystems MUST include permanently attached components, CAN include deployed payloads (Requirement 9)
- Server MUST support `recursive` parameter (boolean) (Requirement 10)
- Default behavior (recursive=false or omitted): direct subsystems only (Requirement 11)
- With recursive=true: all nested subsystems at all levels (Requirement 11)
- Recursive associations: subsystem datastreams/controlstreams/samplingFeatures include parent's (Requirement 13)

**Recursive Behavior:**
- Querying `{api_root}/systems` without recursive: top-level systems only
- Querying `{api_root}/systems?recursive=true`: all systems and all subsystems
- Other query parameters apply to ALL processed systems (filters work recursively)
- If system has subsystems, its nested resources endpoints include subsystem resources

---

### 1.3 Deployments Resource

**Definition:** Deployment resources provide information about deployment of one or more Systems. Implements `sosa:Deployment` concept. Typically have temporal and spatial extent.

**Operations:**

**Read Operations:**
- `GET {api_root}/deployments` - List all deployments (canonical resources endpoint)
- `GET {api_root}/deployments/{id}` - Retrieve single deployment
- `GET {api_root}/deployments?<filters>` - Query deployments with filters
- `GET {api_root}/systems/{sysId}/deployments` - Deployments where specific system was deployed
- `GET {api_root}/collections/{collectionId}/items` - Deployments from collection (featureType=`sosa:Deployment`)

**Create Operations:**
- `POST {api_root}/deployments` - Create new deployment
- `POST {api_root}/deployments/{parentId}/subdeployments` - Create subdeployment under parent
- `POST {api_root}/collections/{collectionId}/items` - Add deployment to collection

**Update/Replace Operations:**
- `PUT {api_root}/deployments/{id}` - Replace deployment
- `PATCH {api_root}/deployments/{id}` - Update deployment
- `PUT {api_root}/collections/{collectionId}/items/{id}` - Replace in collection

**Delete Operations:**
- `DELETE {api_root}/deployments/{id}` - Delete deployment
- `DELETE {api_root}/collections/{collectionId}/items/{id}` - Remove from collection

**Deployment Properties (Required):**
- `uniqueIdentifier` (URI) - Persistent unique identifier
- `name` (String) - Human readable name
- `validTime` (DateTime) - Time period during which systems are deployed
- `deployedSystems` (Array of System resources) - Required association
- `subdeployments` (Array of Deployment resources) - Required association

**Deployment Properties (Optional):**
- `description` (String) - Human readable description
- `deploymentType` (URI) - Type of deployment
- `location` (Geometry) - Location or area where systems deployed
- `platform` (Feature) - Platform on which systems deployed
- `featuresOfInterest` (Array of Feature resources) - Ultimate FOIs observed/controlled
- `samplingFeatures` (Array of SamplingFeature resources) - Associated sampling features
- `datastreams` (Array of DataStream resources) - Observations collected during deployment
- `controlstreams` (Array of ControlStream resources) - Commands issued during deployment

**Deployment Requirements:**
- Deployments MUST be accessible at canonical URL `{api_root}/deployments/{id}` (Requirement 14)
- Server MUST expose canonical endpoint `{api_root}/deployments` (Requirement 16)
- Server MUST expose at least one collection containing Deployments (Requirement 18)
- Collections containing Deployments MUST set `featureType=sosa:Deployment` (Requirement 18)
- If System provides `deployments` association, MUST link to `{api_root}/systems/{sysId}/deployments` (Requirement 17)

**Examples from Standard:**
- In-situ sensor deployed at given location
- Network of in-situ sensors along river
- Security camera network in city
- Mission with unmanned systems + payloads
- Team deployed for survey responses
- Sample collection campaign
- Forecast model run

---

### 1.4 Subdeployments

**Definition:** Subdeployments are regular Deployment resources made available through sub-collection of parent Deployment. Used for hierarchical deployments.

**Operations:**

**Read Operations:**
- `GET {api_root}/deployments/{parentId}/subdeployments` - List subdeployments
- `GET {api_root}/deployments/{parentId}/subdeployments?recursive=false` - Direct subdeployments only
- `GET {api_root}/deployments/{parentId}/subdeployments?recursive=true` - All nested subdeployments
- `GET {api_root}/deployments?recursive=true` - All deployments including subdeployments

**Create Operations:**
- `POST {api_root}/deployments/{parentId}/subdeployments` - Create subdeployment

**Subdeployment Requirements:**
- Subdeployments MUST be exposed at `{api_root}/deployments/{parentId}/subdeployments` (Requirement 19)
- Server MUST support `recursive` parameter (boolean) (Requirement 20)
- Default (recursive=false or omitted): direct subdeployments only (Requirement 21)
- With recursive=true: all nested subdeployments at all levels (Requirement 21)
- Recursive associations: nested deployedSystems/featuresOfInterest/samplingFeatures/datastreams/controlstreams include subdeployment resources (Requirement 23)

**Examples from Standard:**
- Deployment of monitoring sensors along river, where each monitoring station is a subdeployment
- Multi-phase campaign with distinct operational periods
- Distributed deployment across multiple geographic regions

---

### 1.5 Procedures Resource

**Definition:** Procedure resources describe procedure implemented by one or more Systems (e.g., specs/datasheets, methodologies). Implements `sosa:Procedure` concept. Non-spatial features.

**Procedure Types (from Table 16):**
- **ObservingProcedure** (`sosa:ObservingProcedure`) - observation method, used by Sensor
- **SamplingProcedure** (`sosa:SamplingProcedure`) - sampling method, used by Sampler
- **ActuatingProcedure** (`sosa:ActuatingProcedure`) - actuation method, used by Actuator
- **Other Procedure** (`sosa:Procedure`) - any other procedure/methodology

**System Kind Types (from Table 16 - for datasheets):**
- **Sensor** (`sosa:Sensor`) - sensor datasheet
- **Actuator** (`sosa:Actuator`) - actuator datasheet
- **Sampler** (`sosa:Sampler`) - sampler datasheet
- **Platform** (`sosa:Platform`) - platform datasheet
- **Other System** (`sosa:System`) - any other system datasheet

**Operations:**

**Read Operations:**
- `GET {api_root}/procedures` - List all procedures
- `GET {api_root}/procedures/{id}` - Retrieve single procedure
- `GET {api_root}/procedures?<filters>` - Query procedures with filters
- `GET {api_root}/collections/{collectionId}/items` - Procedures from collection (featureType=`sosa:Procedure`)

**Create Operations:**
- `POST {api_root}/procedures` - Create new procedure
- `POST {api_root}/collections/{collectionId}/items` - Add procedure to collection

**Update/Replace Operations:**
- `PUT {api_root}/procedures/{id}` - Replace procedure
- `PATCH {api_root}/procedures/{id}` - Update procedure
- `PUT {api_root}/collections/{collectionId}/items/{id}` - Replace in collection

**Delete Operations:**
- `DELETE {api_root}/procedures/{id}` - Delete procedure
- `DELETE {api_root}/collections/{collectionId}/items/{id}` - Remove from collection

**Procedure Properties (Required):**
- `uniqueIdentifier` (URI) - Persistent unique identifier
- `name` (String) - Human readable name
- `procedureType` (URI/CURIE) - Type from Table 16

**Procedure Properties (Optional):**
- `description` (String) - Human readable description
- `implementingSystems` (Array of System resources) - Systems implementing procedure

**Procedure Requirements:**
- Procedures MUST NOT have location (Requirement 24)
- Procedures MUST be accessible at canonical URL `{api_root}/procedures/{id}` (Requirement 25)
- Server MUST expose canonical endpoint `{api_root}/procedures` (Requirement 27)
- Server MUST expose at least one collection containing Procedures (Requirement 28)
- Collections containing Procedures MUST set `featureType=sosa:Procedure` (Requirement 28)

**Usage Notes from Standard:**
- Procedure resources describe **types** (models, datasheets), System resources describe **instances**
- For automated equipment: procedure = equipment specifications (datasheet)
- For human tasks: procedure = steps/methodology operator follows
- For instrument + operator: procedure describes instrument(s) used and how
- Several System instances can implement same Procedure (be of same model)

---

### 1.6 Sampling Features Resource

**Definition:** Sampling Features describe sampling geometry/methodology used when observing property of larger feature (Feature of Interest). Implements `sosa:Sample` concept. Always associated with specific System.

**Operations:**

**Read Operations:**
- `GET {api_root}/samplingFeatures` - List all sampling features
- `GET {api_root}/samplingFeatures/{id}` - Retrieve single sampling feature
- `GET {api_root}/samplingFeatures?<filters>` - Query sampling features with filters
- `GET {api_root}/systems/{sysId}/samplingFeatures` - Sampling features for specific system
- `GET {api_root}/collections/{collectionId}/items` - Sampling features from collection (featureType=`sosa:Sample`)

**Create Operations:**
- `POST {api_root}/systems/{sysId}/samplingFeatures` - Create sampling feature under system
- `POST {api_root}/collections/{collectionId}/items` - Add sampling feature to collection

**Update/Replace Operations:**
- `PUT {api_root}/samplingFeatures/{id}` - Replace sampling feature
- `PATCH {api_root}/samplingFeatures/{id}` - Update sampling feature
- `PUT {api_root}/collections/{collectionId}/items/{id}` - Replace in collection

**Delete Operations:**
- `DELETE {api_root}/samplingFeatures/{id}` - Delete sampling feature
- `DELETE {api_root}/collections/{collectionId}/items/{id}` - Remove from collection

**Sampling Feature Properties (Required):**
- `uniqueIdentifier` (URI) - Persistent unique identifier
- `name` (String) - Human readable name
- `featureType` (URI) - Type of sampling feature
- `parentSystem` (System resource) - System that created/uses this sampling feature
- `sampledFeature` (Feature resource) - Ultimate feature of interest being sampled

**Sampling Feature Properties (Optional):**
- `description` (String) - Human readable description
- `sampleOf` (Array of SamplingFeature resources) - Other sampling features via sub-sampling
- `datastreams` (Array of DataStream resources) - Observations of this sampling feature
- `controlstreams` (Array of ControlStream resources) - Commands impacting this sampling feature

**Sampling Feature Requirements:**
- Sampling features MUST be accessible at canonical URL `{api_root}/samplingFeatures/{id}` (Requirement 29)
- Server MUST expose canonical endpoint `{api_root}/samplingFeatures` (Requirement 31)
- Server MUST expose at least one collection containing Sampling Features (Requirement 33)
- Collections containing Sampling Features MUST set `featureType=sosa:Sample` (Requirement 33)
- For each System, server MUST expose `{api_root}/systems/{sysId}/samplingFeatures` (Requirement 32)
- Sampling features endpoint MUST only list features associated with parent system (Requirement 32)

**Examples from Standard:**
- Sampling point along river
- Trajectory at ocean surface
- Satellite image footprint
- Profile of atmosphere
- Viewing frustum of video camera
- Area covered by weather radar
- Part in complex machine

**Feature of Interest vs Sampling Feature:**
- **Feature of Interest:** Ultimate real-world feature whose properties observed/controlled (exists independently)
- **Sampling Feature:** Specific sampling strategy for particular system (system-dependent)
- FOI examples: building, room, river, atmosphere, person, animal, vehicle, administrative area
- A System can also be FOI of other observations (e.g., GPS observing aircraft platform location)

---

### 1.7 Properties Resource

**Definition:** Property resources provide semantic information about feature properties (observable, controllable, or asserted properties). Implements `ssn:Property` concept. NOT spatial features.

**Property Types:**
- **Observable properties** (`sosa:ObservableProperty`) - subject of observation
- **Controllable properties** (`sosa:ActuatableProperty`) - subject of actuation/command
- **Asserted properties** - system characteristics/capabilities

**Operations:**

**Read Operations:**
- `GET {api_root}/properties` - List all properties
- `GET {api_root}/properties/{id}` - Retrieve single property
- `GET {api_root}/properties?<filters>` - Query properties with filters
- `GET {api_root}/collections/{collectionId}/items` - Properties from collection (itemType=`sosa:Property`)

**Create Operations:**
- `POST {api_root}/properties` - Create new property
- `POST {api_root}/collections/{collectionId}/items` - Add property to collection

**Update/Replace Operations:**
- `PUT {api_root}/properties/{id}` - Replace property
- `PATCH {api_root}/properties/{id}` - Update property
- `PUT {api_root}/collections/{collectionId}/items/{id}` - Replace in collection

**Delete Operations:**
- `DELETE {api_root}/properties/{id}` - Delete property
- `DELETE {api_root}/collections/{collectionId}/items/{id}` - Remove from collection

**Property Resource Properties (Required):**
- `uniqueIdentifier` (URI) - Persistent unique identifier
- `name` (String) - Human readable name

**Property Resource Properties (Optional):**
- `description` (String) - Human readable description
- `baseProperty` (Property resource) - Base property this is derived from
- `objectType` (URI) - Kind of object/feature this property applies to

**Property Requirements:**
- Properties MUST be accessible at canonical URL `{api_root}/properties/{id}` (Requirement 34)
- Server MUST expose canonical endpoint `{api_root}/properties` (Requirement 36)
- Server MUST expose at least one collection containing Properties (Requirement 37)
- Collections containing Properties MUST set `itemType=sosa:Property` (Requirement 37)
- Operations at property endpoints SHALL replace "features/feature" with "resources/resource" terminology (Requirement 35)

---

## 2. HTTP Methods Specified

### 2.1 Read Operations (GET)

**All Resources:**
- `GET {api_root}/{resourceType}` - List resources at canonical endpoint
- `GET {api_root}/{resourceType}/{id}` - Retrieve single resource
- `GET {api_root}/collections/{collectionId}/items` - List items in collection
- `GET {api_root}/collections/{collectionId}/items/{id}` - Retrieve item from collection

**Nested Resources:**
- `GET {api_root}/systems/{id}/subsystems` - List subsystems
- `GET {api_root}/systems/{id}/deployments` - List deployments for system
- `GET {api_root}/systems/{id}/samplingFeatures` - List sampling features for system
- `GET {api_root}/deployments/{id}/subdeployments` - List subdeployments

**Method Requirements:**
- GET operations MUST fulfill requirements from OGC API – Features Part 1 Clause 7.15.2 to 7.15.8
- GET operations MUST support query parameters (filters, pagination)
- GET operations MUST return appropriate status codes (200 for success)

---

### 2.2 Create Operations (POST)

**Canonical Endpoints:**
- `POST {api_root}/systems` - Create system
- `POST {api_root}/deployments` - Create deployment
- `POST {api_root}/procedures` - Create procedure
- `POST {api_root}/properties` - Create property

**Nested Endpoints:**
- `POST {api_root}/systems/{parentId}/subsystems` - Create subsystem
- `POST {api_root}/systems/{sysId}/samplingFeatures` - Create sampling feature
- `POST {api_root}/deployments/{parentId}/subdeployments` - Create subdeployment

**Collection Endpoints:**
- `POST {api_root}/collections/{collectionId}/items` - Add to collection
- `POST {api_root}/collections/{collectionId}/items` (body: text/uri-list) - Add existing resources by URI

**Method Requirements:**
- POST creates new resource instances
- Server returns 201 with Location header pointing to canonical URL
- Created resources MUST be accessible at canonical URL
- Nested resource creation (subsystems, sampling features) automatically associates with parent

---

### 2.3 Replace Operations (PUT)

**Canonical Endpoints:**
- `PUT {api_root}/systems/{id}` - Replace system
- `PUT {api_root}/deployments/{id}` - Replace deployment
- `PUT {api_root}/procedures/{id}` - Replace procedure
- `PUT {api_root}/samplingFeatures/{id}` - Replace sampling feature
- `PUT {api_root}/properties/{id}` - Replace property

**Collection Endpoints:**
- `PUT {api_root}/collections/{collectionId}/items/{id}` - Replace item in collection

**Method Requirements:**
- PUT performs full replacement of resource
- Changes at canonical URL reflected in all collections containing resource
- Server returns appropriate status codes

---

### 2.4 Update Operations (PATCH)

**Canonical Endpoints:**
- `PATCH {api_root}/systems/{id}` - Update system
- `PATCH {api_root}/deployments/{id}` - Update deployment
- `PATCH {api_root}/procedures/{id}` - Update procedure
- `PATCH {api_root}/samplingFeatures/{id}` - Update sampling feature
- `PATCH {api_root}/properties/{id}` - Update property

**Collection Endpoints:**
- `PATCH {api_root}/collections/{collectionId}/items/{id}` - Update item in collection

**Method Requirements:**
- PATCH performs partial update (only specified fields)
- Changes at canonical URL reflected in all collections
- Follows OGC API – Features Part 4 update requirements

---

### 2.5 Delete Operations (DELETE)

**Canonical Endpoints:**
- `DELETE {api_root}/systems/{id}` - Delete system
- `DELETE {api_root}/systems/{id}?cascade=true` - Delete system and nested resources
- `DELETE {api_root}/deployments/{id}` - Delete deployment
- `DELETE {api_root}/procedures/{id}` - Delete procedure
- `DELETE {api_root}/samplingFeatures/{id}` - Delete sampling feature
- `DELETE {api_root}/properties/{id}` - Delete property

**Collection Endpoints:**
- `DELETE {api_root}/collections/{collectionId}/items/{id}` - Remove from collection (NOT deletion)

**Method Requirements:**
- DELETE at canonical URL permanently removes resource
- DELETE at collection URL only removes from that collection
- System deletion requires cascade parameter if nested resources exist
- Without cascade: server rejects DELETE if nested resources present (409 error)
- With cascade=true: deletes resource and all nested resources
- If System referenced by Deployment, Deployment updated to remove link (not deleted)

---

## 3. Query Parameters Defined

### 3.1 Common Query Parameters (All Resources)

**Identifier Parameters:**
- `id` - Filter by local ID(s) (comma-separated list)
  - Example: `?id=abc123,def456`
- `uid` - Filter by unique identifier (UID) (comma-separated list of URIs)
  - Example: `?uid=urn:uuid:31f6865e-f438-430e-9b57-f965a21ee255`

**Keyword Search:**
- `q` - Text search across resource properties (keyword filter)
  - Example: `?q=weather%20station`

**Property Filters:**
- `{propertyName}={value}` - Filter by specific property value
  - Example: `?name=Weather%20Station`
  - Example: `?featureType=om:Specimen`

**Type:** ID_List = comma-separated list of local IDs or UIDs (URIs)

---

### 3.2 Common Feature Query Parameters (Spatial/Temporal Resources)

**Spatial Filters:**
- `bbox` - Bounding box filter (minLon,minLat,maxLon,maxLat)
  - Example: `?bbox=-180,-90,180,90`
- `geom` - Geometry intersection filter (WKT format)
  - Standard: Specified in clause 16.4.2
  - Used for spatial queries on Systems, Deployments, Sampling Features

**Temporal Filters:**
- `datetime` - Temporal filter (ISO 8601 datetime or interval)
  - Single datetime: `?datetime=2024-01-01T00:00:00Z`
  - Open-ended interval: `?datetime=2024-01-01T00:00:00Z/..`
  - Closed interval: `?datetime=2024-01-01T00:00:00Z/2024-12-31T23:59:59Z`
  - Applies to `validTime` property for Systems/Deployments

**Pagination:**
- `limit` - Maximum number of results
  - Example: `?limit=10`
- `offset` - Skip first N results
  - Example: `?offset=20`

---

### 3.3 Hierarchical Query Parameters

**Recursive Traversal:**
- `recursive` - Boolean parameter for hierarchical queries
  - Default (false or omitted): Direct children only
  - `recursive=true`: All descendants recursively
  - Applies to:
    - `{api_root}/systems?recursive=true` (all systems + subsystems)
    - `{api_root}/systems/{id}/subsystems?recursive=true` (nested subsystems)
    - `{api_root}/deployments?recursive=true` (all deployments + subdeployments)
    - `{api_root}/deployments/{id}/subdeployments?recursive=true` (nested subdeployments)

---

### 3.4 System-Specific Query Parameters

Applied to System resources endpoints:
- `{api_root}/systems`
- `{api_root}/systems/{id}/subsystems`
- `{api_root}/collections/{colId}/items` (where collection contains Systems)

**Relationship Filters:**

1. **Parent Filter:** `parent` (ID_List)
   - Find subsystems of specific parent system(s)
   - Example: `?parent=4g4ds54vv`
   - Example: `?parent=urn:uuid:31f6865e-f438-430e-9b57-f965a21ee255`

2. **Procedure Filter:** `procedure` (ID_List)
   - Find systems that implement specific procedure(s)
   - Example: `?procedure=11gsd654g`
   - Example: `?procedure=11gsd654g,fsv4dg62` (multiple)
   - Example: `?procedure=urn:example:procedure:451585`

3. **Feature of Interest Filter:** `foi` (ID_List)
   - Find systems that observe/control specific feature(s) of interest
   - Example: `?foi=11gsd654g`
   - Example: `?foi=urn:mrn:itu:mmsi:538070999`
   - Example: `?foi=http://dbpedia.org/resource/Seawater`
   - Includes both sampling features AND domain features of interest
   - Recursive: if system has subsystems, included if ANY subsystem observes FOI

4. **Observed Property Filter:** `observedProperty` (ID_List)
   - Find systems that can observe specific property/properties
   - Example: `?observedProperty=4578441`
   - Example: `?observedProperty=http://qudt.org/vocab/quantitykind/Temperature`
   - Recursive: if system has subsystems, included if ANY subsystem observes property

5. **Controlled Property Filter:** `controlledProperty` (ID_List)
   - Find systems that control specific property/properties
   - Example: `?controlledProperty=4578441`
   - Example: `?controlledProperty=http://qudt.org/vocab/quantitykind/PH`
   - Recursive: if system has subsystems, included if ANY subsystem controls property

---

### 3.5 Deployment-Specific Query Parameters

Applied to Deployment resources endpoints:
- `{api_root}/deployments`
- `{api_root}/deployments/{id}/subdeployments`
- `{api_root}/collections/{colId}/items` (where collection contains Deployments)

**Relationship Filters:**

1. **Parent Filter:** `parent` (ID_List)
   - Find subdeployments of specific parent deployment(s)
   - Example: `?parent=4g4ds54vv`

2. **Deployed System Filter:** `system` (ID_List)
   - Find deployments where specific system(s) were deployed
   - Example: `?system=b5bxc988rf`
   - Example: `?system=urn:mrn:itu:mmsi:538070999`

3. **Feature of Interest Filter:** `foi` (ID_List)
   - Find deployments where deployed systems observe/control specific FOI(s)
   - Example: `?foi=g4sd56ht41`
   - Example: `?foi=urn:example:river:41148`
   - Includes both sampling features AND domain features

4. **Observed Property Filter:** `observedProperty` (ID_List)
   - Find deployments where specific properties are observed
   - Example: `?observedProperty=4578441`
   - Example: `?observedProperty=http://mmisw.org/ont/cf/parameter/wind_speed`

5. **Controlled Property Filter:** `controlledProperty` (ID_List)
   - Find deployments where specific properties are controlled
   - Example: `?controlledProperty=146687`
   - Example: `?controlledProperty=http://qudt.org/vocab/quantitykind/Velocity`

---

### 3.6 Procedure-Specific Query Parameters

Applied to Procedure resources endpoints:
- `{api_root}/procedures`
- `{api_root}/collections/{colId}/items` (where collection contains Procedures)

**Relationship Filters:**

1. **Observed Property Filter:** `observedProperty` (ID_List)
   - Find procedures designed to observe specific properties
   - Example: `?observedProperty=4578441`
   - Example: `?observedProperty=http://mmisw.org/ont/cf/parameter/air_pressure`

2. **Controlled Property Filter:** `controlledProperty` (ID_List)
   - Find procedures designed to control specific properties
   - Example: `?controlledProperty=146687`
   - Example: `?controlledProperty=urn:example:prop:fuelmixratio`

---

### 3.7 Sampling Feature-Specific Query Parameters

Applied to Sampling Feature resources endpoints:
- `{api_root}/samplingFeatures`
- `{api_root}/collections/{colId}/items` (where collection contains Sampling Features)

**Relationship Filters:**

1. **Feature of Interest Filter:** `foi` (ID_List)
   - Find sampling features that sample specific feature(s) of interest
   - Example: `?foi=g4sd56ht41`
   - Example: `?foi=urn:example:river:41148`

2. **Observed Property Filter:** `observedProperty` (ID_List)
   - Find sampling features with certain observed properties
   - Example: `?observedProperty=221785`
   - Example: `?observedProperty=http://qudt.org/vocab/quantitykind/Voltage`

3. **Controlled Property Filter:** `controlledProperty` (ID_List)
   - Find sampling features with certain controlled properties
   - Example: `?controlledProperty=146687`
   - Example: `?controlledProperty=http://qudt.org/vocab/quantitykind/Velocity`

---

### 3.8 Property-Specific Query Parameters

Applied to Property resources endpoints:
- `{api_root}/properties`
- `{api_root}/collections/{colId}/items` (where collection contains Properties)

**Relationship Filters:**

1. **Base Property Filter:** `baseProperty` (ID_List)
   - Find properties derived from specific base property/properties
   - Example: `?baseProperty=g4sd56ht41`
   - Example: `?baseProperty=http://qudt.org/vocab/quantitykind/AmbientPressure`
   - Searches directly and indirectly (transitive)

2. **Object Type Filter:** `objectType` (ID_List)
   - Find properties associated with specific object/feature type(s)
   - Example: `?object=https://dbpedia.org/page/Watercraft`
   - Example: `?object=https://dbpedia.org/page/Engine`

---

### 3.9 Query Parameter Combination Rules

**Logical AND Between Parameters:**
- Multiple parameters combined with logical AND
- Example: `?bbox=-180,-90,180,90&datetime=2024-01-01T00:00:00Z/..&limit=10`
- Each resource in result set must satisfy ALL filter conditions

**Multiple Values in Single Parameter:**
- Comma-separated values in ID_List parameters
- Treated as logical OR for that parameter
- Example: `?id=abc,def,ghi` matches resources with id=abc OR id=def OR id=ghi

**Recursive + Other Filters:**
- `recursive=true` applies to traversal depth
- Other query parameters apply to ALL processed resources (both parents and descendants)
- Example: `?recursive=true&observedProperty=temperature` finds all systems (including subsystems) that observe temperature

---

## 4. Request Bodies for Create/Update Operations

### 4.1 GeoJSON Format Request Bodies

**Media Type:** `application/geo+json`

**System Creation:**
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [30.706, -134.196, 272]
  },
  "properties": {
    "uid": "urn:x-sensor:id:12345",
    "name": "Weather Station Alpha",
    "description": "Automated weather monitoring station",
    "featureType": "http://www.w3.org/ns/sosa/Sensor",
    "assetType": "Equipment",
    "validTime": ["2024-01-01T00:00:00Z", null]
  }
}
```

**Deployment Creation:**
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[...]]]
  },
  "properties": {
    "uid": "urn:x-deployment:mission-001",
    "name": "Arctic Mission 2024",
    "description": "...",
    "featureType": "http://www.w3.org/ns/sosa/Deployment",
    "validTime": ["2024-07-01T00:00:00Z", "2024-09-30T00:00:00Z"],
    "deployedSystems@link": [
      {"href": "https://api.example.org/systems/abc123"}
    ]
  }
}
```

**Procedure Creation:**
```json
{
  "type": "Feature",
  "geometry": null,
  "properties": {
    "uid": "urn:x-procedure:datasheet:wx-sensor-v2",
    "name": "Weather Sensor Model WX-2000",
    "description": "Technical datasheet for WX-2000 sensor",
    "featureType": "http://www.w3.org/ns/sosa/Sensor",
    "procedureType": "http://www.w3.org/ns/sosa/Sensor"
  }
}
```

**Sampling Feature Creation:**
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [30.706, -134.196]
  },
  "properties": {
    "uid": "urn:x-sample:station-A-01",
    "name": "Sampling Point A-01",
    "featureType": "http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_SamplingPoint",
    "sampledFeature@link": {
      "href": "http://example.org/features/river-123"
    }
  }
}
```

---

### 4.2 SensorML-JSON Format Request Bodies

**Media Type:** `application/sml+json`

**System Creation (PhysicalSystem):**
```json
{
  "type": "PhysicalSystem",
  "id": "wx-station-alpha",
  "definition": "http://www.w3.org/ns/sosa/Sensor",
  "uniqueId": "urn:x-sensor:id:12345",
  "label": "Weather Station Alpha",
  "description": "Automated weather monitoring station",
  "typeOf": {
    "href": "https://api.example.org/procedures/wx-2000-datasheet"
  },
  "position": {
    "type": "Point",
    "coordinates": [30.706, -134.196, 272]
  },
  "validTime": ["2024-01-01T00:00:00Z", null]
}
```

**Deployment Creation:**
```json
{
  "type": "Deployment",
  "uniqueId": "urn:x-deployment:mission-001",
  "label": "Arctic Mission 2024",
  "description": "...",
  "validTime": ["2024-07-01T00:00:00Z", "2024-09-30T00:00:00Z"],
  "location": {
    "type": "Polygon",
    "coordinates": [[[...]]]
  },
  "deployedSystems": [
    {
      "system": {"href": "https://api.example.org/systems/abc123"}
    }
  ]
}
```

**Procedure Creation (SimpleProcess):**
```json
{
  "type": "SimpleProcess",
  "definition": "http://www.w3.org/ns/sosa/Sensor",
  "uniqueId": "urn:x-procedure:datasheet:wx-sensor-v2",
  "label": "Weather Sensor Model WX-2000",
  "description": "Technical datasheet for WX-2000 sensor"
}
```

---

### 4.3 Update (PATCH) Request Bodies

**JSON Merge Patch Format:**
Updates only specified fields, leaves others unchanged.

```json
{
  "properties": {
    "description": "Updated description text",
    "location": {
      "type": "Point",
      "coordinates": [31.0, -135.0, 280]
    }
  }
}
```

**URI List Format (for adding to collections):**
```
https://api.example.org/systems/abc123
https://api.example.org/systems/def456
https://api.example.org/systems/ghi789
```

---

## 5. Response Formats Required

### 5.1 GeoJSON Format

**Media Type:** `application/geo+json`

**Supported For:**
- Systems (with location)
- Deployments (with spatial extent)
- Procedures (geometry = null)
- Sampling Features (with geometry)

**Requirements:**
- Server MUST advertise GeoJSON support via Accept headers (Requirement 77)
- Server MUST accept GeoJSON for write operations (POST/PUT/PATCH) (Requirement 78)
- All spatial resources MUST be serializable to GeoJSON
- Link relations use `ogc-rel:` prefix (e.g., `ogc-rel:subsystems`)
- Property mappings follow Table 40-47

**Example System in GeoJSON:**
```json
{
  "type": "Feature",
  "id": "sensor123",
  "geometry": {
    "type": "Point",
    "coordinates": [-122.08, 37.42, 25.5]
  },
  "properties": {
    "uid": "urn:x-sensor:id:sensor123",
    "name": "Temperature Sensor TS-001",
    "description": "High-precision temperature sensor",
    "featureType": "http://www.w3.org/ns/sosa/Sensor",
    "assetType": "Equipment",
    "validTime": ["2024-01-01T00:00:00Z", null]
  },
  "links": [
    {
      "rel": "canonical",
      "href": "https://api.example.org/systems/sensor123"
    },
    {
      "rel": "ogc-rel:subsystems",
      "href": "https://api.example.org/systems/sensor123/subsystems"
    },
    {
      "rel": "ogc-rel:samplingFeatures",
      "href": "https://api.example.org/systems/sensor123/samplingFeatures"
    }
  ]
}
```

---

### 5.2 SensorML-JSON Format

**Media Type:** `application/sml+json`

**Supported For:**
- Systems (more detailed descriptions than GeoJSON)
- Deployments (detailed deployment information)
- Procedures (datasheets, methodologies)
- Properties (semantic definitions)

**SensorML Classes Used:**
- **PhysicalComponent** - Hardware equipment or human observers
- **PhysicalSystem** - Hardware equipment or human observers
- **SimpleProcess** - Software processes or simulations
- **AggregateProcess** - Grouped processes
- **Deployment** - Deployment descriptions

**Requirements:**
- Server MUST advertise SensorML support via Accept headers (Requirement 89)
- Server MUST accept SensorML for write operations (Requirement 90)
- PhysicalComponent/PhysicalSystem used for hardware/human (Requirement 95)
- SimpleProcess/AggregateProcess used for simulations/processes (Requirement 95)
- Property mappings follow Table 49-53

**Example System in SensorML:**
```json
{
  "type": "PhysicalSystem",
  "id": "sensor123",
  "definition": "http://www.w3.org/ns/sosa/Sensor",
  "uniqueId": "urn:x-sensor:id:sensor123",
  "label": "Temperature Sensor TS-001",
  "description": "High-precision temperature sensor",
  "typeOf": {
    "title": "TS-Series Datasheet",
    "href": "https://api.example.org/procedures/ts-datasheet"
  },
  "position": {
    "type": "Point",
    "coordinates": [-122.08, 37.42, 25.5]
  },
  "validTime": ["2024-01-01T00:00:00Z", null],
  "links": [
    {
      "rel": "canonical",
      "href": "https://api.example.org/systems/sensor123"
    },
    {
      "rel": "ogc-rel:subsystems",
      "href": "https://api.example.org/systems/sensor123/subsystems"
    }
  ]
}
```

---

### 5.3 Format Negotiation

**Mechanisms:**
1. **Accept Header:** Client specifies desired format
   - `Accept: application/geo+json`
   - `Accept: application/sml+json`

2. **Query Parameter:** `f` or `format` parameter
   - `?f=geojson`
   - `?f=sml`
   - `?format=application/sml+json`

**Content-Type Response Header:**
- Server indicates format in response
- `Content-Type: application/geo+json; charset=utf-8`
- `Content-Type: application/sml+json; charset=utf-8`

**Format Selection Rules:**
- If Accept header specified: use requested format
- If `f` parameter specified: use requested format
- Default format: implementation-dependent (typically GeoJSON for spatial, SensorML for non-spatial)
- If requested format not supported: 406 Not Acceptable

---

## 6. Conformance Classes Defined

### 6.1 Common (Clause 8, Conformance Class A.1)

**Identifier:** `/req/api-common`  
**Conformance Class:** `/conf/api-common`

**Prerequisites:**
- OGC API – Features – Part 1: Core `/req/core`
- OGC API – Common – Part 1: Core `/req/core`
- OGC API – Common – Part 1: Landing Page `/req/landing-page`
- OGC API – Common – Part 1: JSON `/req/json`

**Requirements:**
- Resource IDs (local identifiers) (Requirement 1)
- Unique Identifiers (UIDs) as URI or URN (Requirement 2)
- Date/Time query parameter support (Requirement 3)

**Normative Statements:**
- All CS resources MUST have local ID and unique identifier (UID)
- UIDs SHOULD be UUIDs or URNs with registered namespace (Recommendation 1)
- `datetime` parameter applies to `validTime` property

**No Core Class:** Standard explicitly states "There is no Core requirements class" - implementations must implement at least one resource type + one encoding.

---

### 6.2 System Features (Clause 9, Conformance Class A.2)

**Identifier:** `/req/system`  
**Conformance Class:** `/conf/system`

**Prerequisite:** Common (`/req/api-common`)

**Requirements:**
- System location updates when system moves (Requirement 4)
- Canonical URL `{api_root}/systems/{id}` (Requirement 5)
- System resources endpoints support (Requirement 6)
- Canonical endpoint `{api_root}/systems` (Requirement 7)
- At least one System collection exposed (Requirement 8)

**Covered Operations:**
- GET systems list
- GET single system
- POST create system
- PUT replace system
- PATCH update system
- DELETE system

---

### 6.3 Subsystems (Clause 10, Conformance Class A.3)

**Identifier:** `/req/subsystem`  
**Conformance Class:** `/conf/subsystem`

**Prerequisite:** System Features (`/req/system`)

**Requirements:**
- Subsystems exposed at `{api_root}/systems/{parentId}/subsystems` (Requirement 9)
- `recursive` parameter support (Requirements 10, 11, 12)
- Recursive associations for nested resources (Requirement 13)

**Covered Operations:**
- GET subsystems list
- GET subsystems recursively
- POST create subsystem under parent
- Recursive queries across hierarchy

---

### 6.4 Deployment Features (Clause 11, Conformance Class A.4)

**Identifier:** `/req/deployment`  
**Conformance Class:** `/conf/deployment`

**Prerequisite:** Common (`/req/api-common`)

**Requirements:**
- Canonical URL `{api_root}/deployments/{id}` (Requirement 14)
- Deployment resources endpoints support (Requirement 15)
- Canonical endpoint `{api_root}/deployments` (Requirement 16)
- Nested endpoint from systems `{api_root}/systems/{sysId}/deployments` (Requirement 17)
- At least one Deployment collection (Requirement 18)

**Covered Operations:**
- GET deployments list
- GET single deployment
- GET deployments for system
- POST create deployment
- PUT replace deployment
- PATCH update deployment
- DELETE deployment

---

### 6.5 Subdeployments (Clause 12, Conformance Class A.5)

**Identifier:** `/req/subdeployment`  
**Conformance Class:** `/conf/subdeployment`

**Prerequisite:** Deployment Features (`/req/deployment`)

**Requirements:**
- Subdeployments exposed at `{api_root}/deployments/{parentId}/subdeployments` (Requirement 19)
- `recursive` parameter support (Requirements 20, 21, 22)
- Recursive associations for nested resources (Requirement 23)

**Covered Operations:**
- GET subdeployments list
- GET subdeployments recursively
- POST create subdeployment under parent
- Recursive queries across deployment hierarchy

---

### 6.6 Procedure Features (Clause 13, Conformance Class A.6)

**Identifier:** `/req/procedure`  
**Conformance Class:** `/conf/procedure`

**Prerequisite:** Common (`/req/api-common`)

**Requirements:**
- Procedures have NO location (Requirement 24)
- Canonical URL `{api_root}/procedures/{id}` (Requirement 25)
- Procedure resources endpoints support (Requirement 26)
- Canonical endpoint `{api_root}/procedures` (Requirement 27)
- At least one Procedure collection (Requirement 28)

**Covered Operations:**
- GET procedures list
- GET single procedure
- POST create procedure
- PUT replace procedure
- PATCH update procedure
- DELETE procedure

---

### 6.7 Sampling Features (Clause 14, Conformance Class A.7)

**Identifier:** `/req/sf`  
**Conformance Class:** `/conf/sf`

**Prerequisites:** Common (`/req/api-common`), System Features (`/req/system`)

**Requirements:**
- Canonical URL `{api_root}/samplingFeatures/{id}` (Requirement 29)
- Sampling Feature resources endpoints support (Requirement 30)
- Canonical endpoint `{api_root}/samplingFeatures` (Requirement 31)
- Nested endpoint from systems `{api_root}/systems/{sysId}/samplingFeatures` (Requirement 32)
- At least one Sampling Feature collection (Requirement 33)

**Covered Operations:**
- GET sampling features list
- GET single sampling feature
- GET sampling features for system
- POST create sampling feature under system
- PUT replace sampling feature
- PATCH update sampling feature
- DELETE sampling feature

---

### 6.8 Property Definitions (Clause 15, Conformance Class A.8)

**Identifier:** `/req/property`  
**Conformance Class:** `/conf/property`

**Prerequisite:** Common (`/req/api-common`)

**Requirements:**
- Canonical URL `{api_root}/properties/{id}` (Requirement 34)
- Property resources endpoints support (Requirement 35)
- Canonical endpoint `{api_root}/properties` (Requirement 36)
- At least one Property collection (Requirement 37)

**Covered Operations:**
- GET properties list
- GET single property
- POST create property
- PUT replace property
- PATCH update property
- DELETE property

---

### 6.9 Advanced Filtering (Clause 16, Conformance Class A.9)

**Identifier:** `/req/advanced-filtering`  
**Conformance Class:** `/conf/advanced-filtering`

**Prerequisite:** Common (`/req/api-common`)

**Requirements:**
- ID list schema (Requirement 38)
- Filter by ID (Requirement 39)
- Filter by keyword (Requirement 40)
- Filter by geometry (Requirement 41)
- System filters: parent, procedure, foi, observedProperty, controlledProperty (Requirements 42-46)
- Deployment filters: parent, system, foi, observedProperty, controlledProperty (Requirements 47-51)
- Procedure filters: observedProperty, controlledProperty (Requirements 52-53)
- Sampling Feature filters: foi, observedProperty, controlledProperty (Requirements 54-56)
- Property filters: baseProperty, objectType (Requirements 57-58)
- Combined filters (logical AND) (Requirement 59)

**Covered Query Parameters:**
- All relationship-based filters listed in Section 3.4-3.8
- 30+ query parameters total across all resource types

---

### 6.10 Create/Replace/Delete (Clause 17, Conformance Class A.10)

**Identifier:** `/req/create-replace-delete`  
**Conformance Class:** `/conf/create-replace-delete`

**Prerequisites:**
- Common (`/req/api-common`)
- OGC API – Features – Part 4: Create, Replace, Update and Delete `/req/create-replace-delete`

**Requirements:**
- System CRUD operations (Requirements 60, 61, 62)
- Deployment CRUD operations (Requirements 63, 64)
- Procedure CRUD operations (Requirement 65)
- Sampling Feature CRUD operations (Requirement 66)
- Property CRUD operations (Requirement 67)
- Collection operations (Requirements 68-71)

**Covered Operations:**
- POST (create) at canonical and nested endpoints
- PUT (replace) at canonical and collection endpoints
- DELETE at canonical and collection endpoints
- POST with text/uri-list to add existing resources to collections
- Cascade delete for systems with nested resources

---

### 6.11 Update (Clause 18, Conformance Class A.11)

**Identifier:** `/req/update`  
**Conformance Class:** `/conf/update`

**Prerequisites:**
- Create/Replace/Delete (`/req/create-replace-delete`)
- OGC API – Features – Part 4: Update `/req/update`

**Requirements:**
- System PATCH operations (Requirement 72)
- Deployment PATCH operations (Requirement 73)
- Procedure PATCH operations (Requirement 74)
- Sampling Feature PATCH operations (Requirement 75)
- Property PATCH operations (Requirement 76)

**Covered Operations:**
- PATCH (partial update) at canonical and collection endpoints

---

### 6.12 GeoJSON Format (Clause 19.1, Conformance Class A.12)

**Identifier:** `/req/geojson`  
**Conformance Class:** `/conf/geojson`

**Prerequisites:**
- Common (`/req/api-common`)
- OGC API – Features – Part 1: GeoJSON `/req/geojson`

**Requirements:**
- Media type for read operations (Requirement 77)
- Media type for write operations (Requirement 78)
- Link relation types with `ogc-rel:` prefix (Requirement 79)
- Feature attribute mappings (Requirement 80)
- System schema and mappings (Requirements 81-82)
- Deployment schema and mappings (Requirements 83-84)
- Procedure schema and mappings (Requirements 85-86)
- Sampling Feature schema and mappings (Requirements 87-88)

**Covered Encodings:**
- Systems as GeoJSON Feature (with geometry)
- Deployments as GeoJSON Feature (with spatial extent)
- Procedures as GeoJSON Feature (geometry = null)
- Sampling Features as GeoJSON Feature (with geometry)

---

### 6.13 SensorML Format (Clause 19.2, Conformance Class A.13)

**Identifier:** `/req/sensorml`  
**Conformance Class:** `/conf/sensorml`

**Prerequisites:**
- Common (`/req/api-common`)
- SensorML 3.0 JSON requirements for SimpleProcess, PhysicalSystem, Deployment, DerivedProperty

**Requirements:**
- Media type for read operations (Requirement 89)
- Media type for write operations (Requirement 90)
- Link relation types (Requirement 91)
- Resource ID conventions (Requirement 92)
- Feature attribute mappings (Requirement 93)
- System schema, class selection, mappings (Requirements 94-96)
- Deployment schema and mappings (Requirements 97-98)
- Procedure schema, class selection, mappings (Requirements 99-101)
- Property schema and mappings (Requirements 102-103)

**Covered Encodings:**
- Systems as PhysicalSystem/PhysicalComponent or SimpleProcess/AggregateProcess
- Deployments as SensorML Deployment
- Procedures as SimpleProcess/AggregateProcess
- Properties as DerivedProperty

---

## 7. Link Relations Defined

### 7.1 Standard Link Relations (from Table 3)

**Association Links (per resource):**

| Relation | From Resource | Description |
|----------|--------------|-------------|
| `ogc-rel:subsystems` | System | Link to subsystems collection |
| `ogc-rel:parentSystem` | System (subsystem) | Link to parent system |
| `ogc-rel:samplingFeatures` | System | Link to associated sampling features |
| `ogc-rel:deployments` | System | Link to deployments involving system |
| `ogc-rel:procedures` | System | Link to procedures implemented by system |
| `ogc-rel:featuresOfInterest` | System, Deployment | Link to ultimate features of interest |
| `ogc-rel:implementingSystems` | Procedure | Link to systems implementing procedure |
| `ogc-rel:sampledFeature` | Sampling Feature | Link to ultimate feature of interest sampled |
| `ogc-rel:sampleOf` | Sampling Feature | Link to other sampling features |
| `ogc-rel:datastreams` | System, Deployment, Sampling Feature | Link to associated datastreams (Part 2) |
| `ogc-rel:controlStreams` | System, Deployment, Sampling Feature | Link to associated control streams (Part 2) |

**Navigational Links:**
- `canonical` - Link to canonical URL of resource
- `self` - Link to current representation
- `alternate` - Link to alternate format (e.g., GeoJSON vs SensorML)
- `collection` - Link to parent collection
- `items` - Link to collection items

**Example Link in GeoJSON:**
```json
{
  "rel": "ogc-rel:subsystems",
  "href": "https://api.example.org/systems/sensor123/subsystems",
  "type": "application/geo+json",
  "title": "Subsystems of sensor"
}
```

**Example Link in SensorML:**
```json
{
  "rel": "ogc-rel:samplingFeatures",
  "href": "https://api.example.org/systems/sensor123/samplingFeatures",
  "type": "application/geo+json"
}
```

---

## 8. Resource Relationships Model

### 8.1 System Relationships

**System Associations:**
- **subsystems** → Many Systems (hierarchical, recursive)
- **parentSystem** → One System (inverse of subsystems)
- **systemKind** → One Procedure (system type/datasheet)
- **samplingFeatures** → Many Sampling Features
- **deployments** → Many Deployments
- **procedures** → Many Procedures (can implement multiple)
- **datastreams** → Many DataStreams (Part 2)
- **controlstreams** → Many ControlStreams (Part 2)

**Key Patterns:**
- Subsystems create parent-child hierarchy (can be deeply nested)
- Multiple systems can implement same Procedure (type)
- System can participate in multiple Deployments
- Sampling features always belong to one System

---

### 8.2 Deployment Relationships

**Deployment Associations:**
- **deployedSystems** → Many Systems
- **subdeployments** → Many Deployments (hierarchical)
- **parentDeployment** → One Deployment (inverse)
- **platform** → One Feature (system platform is deployed on)
- **featuresOfInterest** → Many Features
- **samplingFeatures** → Many Sampling Features
- **datastreams** → Many DataStreams (Part 2)
- **controlstreams** → Many ControlStreams (Part 2)

**Key Patterns:**
- Deployments can have temporal and spatial extent
- Multiple systems deployed together in one Deployment
- Subdeployments for hierarchical campaigns

---

### 8.3 Procedure Relationships

**Procedure Associations:**
- **implementingSystems** → Many Systems

**Key Patterns:**
- Procedures describe types, Systems describe instances
- Many Systems can implement same Procedure (many sensors of same model)
- One System can implement multiple Procedures

---

### 8.4 Sampling Feature Relationships

**Sampling Feature Associations:**
- **parentSystem** → One System (required - SF always belongs to system)
- **sampledFeature** → One Feature (ultimate FOI being sampled)
- **sampleOf** → Many Sampling Features (sub-sampling hierarchy)
- **datastreams** → Many DataStreams (Part 2)
- **controlstreams** → Many ControlStreams (Part 2)

**Key Patterns:**
- Sampling Features define system's sampling strategy
- sampledFeature = ultimate FOI (independent real-world feature)
- sampleOf creates sub-sampling hierarchy
- Transitive: if SF-A samples SF-B which samples FOI-C, then SF-A indirectly samples FOI-C

---

### 8.5 Property Relationships

**Property Associations:**
- **baseProperty** → One Property (derivation hierarchy)

**Key Patterns:**
- Properties can be derived from base properties
- Transitive queries: querying for base property includes derived properties
- objectType associates property with specific feature types

---

## 9. History/Versioning Requirements

### 9.1 validTime Property

**Defined For:**
- Systems (optional)
- Deployments (required)

**Format:** DateTime interval (ISO 8601)
- Start and end: `["2024-01-01T00:00:00Z", "2024-12-31T23:59:59Z"]`
- Open-ended: `["2024-01-01T00:00:00Z", null]` (ongoing)

**System validTime:**
- Specifies validity period of system's description
- Optional for Systems
- When system changes configuration, new version can be created with new validTime

**Deployment validTime:**
- Specifies time period during which systems are deployed
- Required for Deployments
- Temporal extent of deployment

---

### 9.2 Location Updates for Mobile Systems

**Requirement 4:**
- Systems with assetType NOT "Simulation" or "Process" SHOULD have location
- For mobile systems, location property MUST update when system moves
- Server responsible for keeping location current

**Pattern:**
- Client queries `GET {api_root}/systems/{id}` at different times
- Responses show different locations if system moved
- No explicit versioning - current state query pattern

---

### 9.3 Resource History (Not in Part 1)

**Part 1 Scope:**
- Part 1 does NOT define detailed resource history mechanisms
- validTime provides basic temporal validity
- Location updates for mobile systems

**Future/Out of Scope:**
- Complete version history of resource changes
- Audit trail of modifications
- Historical queries (time travel)
- These may be covered in future parts or extensions

---

## 10. Filtering Capabilities Specified

### 10.1 Spatial Filters

**bbox (Bounding Box):**
- Format: `bbox=minLon,minLat,maxLon,maxLat`
- Applies to: Systems, Deployments, Sampling Features (resources with geometry)
- Matches resources whose geometry intersects bounding box
- Example: `?bbox=-180,-90,180,90`

**geom (Geometry Intersection):**
- Format: WKT geometry
- Applies to: Systems, Deployments, Sampling Features
- Matches resources whose geometry intersects provided geometry
- More flexible than bbox (arbitrary polygons, lines, etc.)
- Example: `?geom=POLYGON((...))`

---

### 10.2 Temporal Filters

**datetime:**
- Format: ISO 8601 datetime or interval
- Applies to: Systems (validTime), Deployments (validTime)
- Single datetime: exact match
- Open-ended interval: `2024-01-01T00:00:00Z/..` (from date forward)
- Closed interval: `2024-01-01T00:00:00Z/2024-12-31T23:59:59Z`
- Matches resources whose validTime overlaps with query interval

---

### 10.3 Identifier Filters

**id (Local ID):**
- Format: Comma-separated list of local IDs
- Applies to: All resource types
- Example: `?id=abc123,def456`

**uid (Unique Identifier):**
- Format: Comma-separated list of URIs
- Applies to: All resource types
- Example: `?uid=urn:uuid:31f6865e-f438-430e-9b57-f965a21ee255,urn:uuid:another-uuid`

---

### 10.4 Text Search Filter

**q (Keyword Search):**
- Format: Text string
- Applies to: All resource types
- Searches across resource properties (implementation-dependent which properties)
- Example: `?q=weather%20station`

---

### 10.5 Property Value Filters

**Custom Property Filters:**
- Format: `{propertyName}={value}`
- Applies to: All resource types
- Filters on specific property values
- Example: `?name=Weather%20Station`
- Example: `?featureType=om:Specimen`

---

### 10.6 Relationship Filters

**parent:**
- Applies to: Systems (subsystems), Deployments (subdeployments)
- Finds resources with specific parent(s)

**procedure:**
- Applies to: Systems
- Finds systems implementing specific procedure(s)

**foi (Feature of Interest):**
- Applies to: Systems, Deployments, Sampling Features
- Finds resources associated with specific FOI(s)
- Transitive for sampling features

**observedProperty:**
- Applies to: Systems, Deployments, Procedures, Sampling Features
- Finds resources associated with specific observed property/properties

**controlledProperty:**
- Applies to: Systems, Deployments, Procedures, Sampling Features
- Finds resources associated with specific controlled property/properties

**system:**
- Applies to: Deployments
- Finds deployments where specific system(s) deployed

**baseProperty:**
- Applies to: Properties
- Finds properties derived from specific base property/properties
- Transitive

**objectType:**
- Applies to: Properties
- Finds properties for specific object/feature type(s)

---

### 10.7 Hierarchical Filters

**recursive:**
- Applies to: Systems (subsystems), Deployments (subdeployments)
- Boolean: true = include all descendants, false/omitted = direct children only
- When true, other filters apply to ALL resources in hierarchy

---

### 10.8 Pagination

**limit:**
- Maximum number of results to return
- Example: `?limit=10`

**offset:**
- Skip first N results
- Example: `?offset=20`
- Combined: `?limit=10&offset=20` returns items 21-30

---

### 10.9 Filter Combination Rules

**Logical AND:**
- Multiple different parameters combined with AND
- Example: `?bbox=-180,-90,180,90&datetime=2024-01-01/..&limit=10`
- Resource must satisfy ALL conditions

**Logical OR:**
- Multiple values in same parameter (ID_List) combined with OR
- Example: `?id=abc,def,ghi` matches id=abc OR id=def OR id=ghi

**Transitive/Recursive:**
- Some filters search transitively (baseProperty, foi via sampledFeature)
- `recursive=true` makes hierarchy traversal recursive
- Documented in standard which filters support transitive behavior

---

### 10.10 Indirect Associations (Recommendation 4)

**Transitive baseProperty:**
- Querying systems by observedProperty=derivedProp SHOULD also match systems observing baseProperty
- Transitive through derivation chain

**Transitive sampledFeature:**
- Querying sampling features by foi=ultimateFOI SHOULD match features sampling intermediate features
- Transitive through sampleOf chain
- Querying systems by foi SHOULD follow sampledFeature transitively

**Recommendation (not requirement):**
- Standard recommends but doesn't require transitive queries
- Implementation-dependent

---

## 11. Requirements Classes and Their Obligations

### 11.1 Minimum Implementation

**No Core Class:**
- Standard explicitly states there is NO core requirements class
- Minimum: Implement at least ONE resource type + ONE encoding

**Typical Minimum:**
- Common conformance class (`/conf/api-common`) - always required
- One resource class (e.g., Systems `/conf/system`)
- One encoding (e.g., GeoJSON `/conf/geojson`)

**Example Minimal Implementation:**
```
/conf/api-common (Common)
/conf/system (System Features)
/conf/geojson (GeoJSON Format)
```

This minimal server exposes Systems in GeoJSON format with basic read operations.

---

### 11.2 Full Part 1 Implementation

**All 11 Conformance Classes:**
1. `/conf/api-common` - Common (required base)
2. `/conf/system` - System Features
3. `/conf/subsystem` - Subsystems
4. `/conf/deployment` - Deployment Features
5. `/conf/subdeployment` - Subdeployments
6. `/conf/procedure` - Procedure Features
7. `/conf/sf` - Sampling Features
8. `/conf/property` - Property Definitions
9. `/conf/advanced-filtering` - Advanced Filtering
10. `/conf/create-replace-delete` - Create/Replace/Delete
11. `/conf/update` - Update
12. `/conf/geojson` - GeoJSON Format
13. `/conf/sensorml` - SensorML Format

**Full Implementation Server:**
- Supports all 5 Part 1 resource types
- Supports both hierarchies (subsystems, subdeployments)
- Supports all CRUD operations
- Supports all 30+ query parameters
- Supports both GeoJSON and SensorML formats

---

### 11.3 Conformance Detection

**Conformance Endpoint:**
- `GET {api_root}/conformance`
- Returns list of conformance class URIs implemented by server

**Example Response:**
```json
{
  "conformsTo": [
    "http://www.opengis.net/spec/ogcapi-common-1/1.0/conf/core",
    "http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/core",
    "http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/api-common",
    "http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/system",
    "http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/subsystem",
    "http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/deployment",
    "http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/geojson"
  ]
}
```

**Client Usage:**
- Client queries conformance endpoint to discover server capabilities
- Client adapts behavior based on supported conformance classes
- Client checks for required conformance classes before attempting operations

---

## 12. Examples Provided in Standard

### 12.1 System Examples

**Example: Fixed In-Situ Sensor (GeoJSON)**
```json
{
  "type": "Feature",
  "id": "sensor001",
  "geometry": {
    "type": "Point",
    "coordinates": [-122.08, 37.42]
  },
  "properties": {
    "uid": "urn:x-sensor:id:sensor001",
    "name": "Weather Station WX-001",
    "featureType": "http://www.w3.org/ns/sosa/Sensor",
    "assetType": "Equipment"
  },
  "links": [
    {
      "rel": "alternate",
      "href": "https://api.example.org/systems/sensor001?f=sml",
      "type": "application/sml+json"
    }
  ]
}
```

---

### 12.2 Deployment Examples

**Example: Saildrone Arctic Mission 2017 (from standard)**
- Three saildrones launched from Dutch Harbor, Alaska
- Partnership with NOAA Research
- Period: July 17 - September 29, 2017
- Geographic extent: Arctic region (53.76°N to 75.03°N, -173.7°E to -155.07°E)
- Platform: Saildrone SD-1003
- Deployed sensors: Air temperature sensor, water temperature sensor, wind sensors, etc.

---

### 12.3 Procedure Examples

**From Standard:**
- **Hardware Equipment:** Procedure = equipment specifications (datasheet)
- **Human Sensing Tasks:** Procedure = steps/methodology operator follows
- **Instrument + Operator:** Procedure describes instrument(s) used and how

---

### 12.4 Sampling Feature Examples

**Example: Rock Sample (from standard, GeoJSON)**
```json
{
  "type": "Feature",
  "id": "f6b464cf",
  "geometry": {
    "type": "Point",
    "coordinates": [30.706, -134.196, 272]
  },
  "properties": {
    "uid": "urn:x-csiro:samples:1114457888",
    "name": "Rock Sample CSIRO:1114457888",
    "description": "Rock sample collected on traverse",
    "featureType": "http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_Specimen",
    "samplingTime": "2007-01-24T12:14:50Z",
    "materialClass": "http://dbpedia.org/resource/Rock_(geology)",
    "sampledFeature@link": {
      "href": "...",
      "uid": "urn:example:x-geology:surface"
    }
  }
}
```

**Other Examples from Standard:**
- Sampling point along river
- Trajectory at ocean surface
- Satellite image footprint
- Profile of atmosphere
- Viewing frustum of video camera
- Area covered by weather radar
- Part in complex machine

---

## Summary

This analysis of CSAPI Part 1 standard document reveals:

**5 Resource Types:**
- Systems (observing systems, sensors, actuators, platforms)
- Deployments (system deployments with temporal/spatial extent)
- Procedures (datasheets, methodologies, specifications)
- Sampling Features (sampling strategies and geometries)
- Properties (semantic property definitions)

**70+ Total Operations:**
- Read operations (GET) - canonical, nested, collection endpoints
- Create operations (POST) - canonical, nested, collection endpoints
- Replace operations (PUT) - full replacement
- Update operations (PATCH) - partial update
- Delete operations (DELETE) - with cascade option for systems

**Dual Format Support:**
- GeoJSON for spatial features (systems, deployments, sampling features)
- SensorML-JSON for detailed descriptions (systems, deployments, procedures, properties)

**Advanced Query Capabilities:**
- 30+ query parameters covering spatial, temporal, identifier, text, property, relationship filters
- Hierarchical queries with recursive parameter
- Transitive relationship traversal (recommended)

**11 Conformance Classes:**
- No mandatory core - minimum is 1 resource type + 1 encoding
- Full implementation supports all 5 resources, hierarchies, CRUD, filtering, both formats

**Client Library Implications:**
- Need URL builders for 70+ operations
- Support for query parameter encoding (bbox, datetime, ID lists, etc.)
- Format negotiation (Accept headers, f parameter)
- Link following for associations (ogc-rel: prefixed)
- Conformance detection to adapt to server capabilities

---

## Action Items for Client Library

Based on this analysis, the client library MUST provide:

1. **URL Builders** for all canonical endpoints:
   - `getSystemsUrl()`
   - `getSystemUrl(id)`
   - `getDeploymentsUrl()`
   - `getDeploymentUrl(id)`
   - `getProceduresUrl()`
   - `getProcedureUrl(id)`
   - `getSamplingFeaturesUrl()`
   - `getSamplingFeatureUrl(id)`
   - `getPropertiesUrl()`
   - `getPropertyUrl(id)`

2. **URL Builders** for nested endpoints:
   - `getSubsystemsUrl(parentId, options)`
   - `getSystemDeploymentsUrl(sysId, options)`
   - `getSystemSamplingFeaturesUrl(sysId, options)`
   - `getSubdeploymentsUrl(parentId, options)`

3. **Query Parameter Support** for all 30+ parameters:
   - Spatial: bbox, geom
   - Temporal: datetime
   - Identifiers: id, uid
   - Text: q
   - Properties: name, featureType, etc.
   - Relationships: parent, procedure, foi, observedProperty, controlledProperty, system, baseProperty, objectType
   - Hierarchical: recursive
   - Pagination: limit, offset

4. **Format Negotiation:**
   - f parameter support
   - Accept header suggestion (not set by library)

5. **TypeScript Interfaces** for:
   - Query options (per resource type)
   - Resource types (System, Deployment, Procedure, SamplingFeature, Property)
   - Collection responses
   - Link objects

**Next:** Section 1.2 will analyze the OpenAPI schema to validate and expand on these findings.
