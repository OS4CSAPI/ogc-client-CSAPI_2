# CSAPI Part 2: Dynamic Data - Requirements Analysis

**Document:** Requirements Analysis for OGC API – Connected Systems Part 2: Dynamic Data  
**Primary Source:** [OGC API – Connected Systems Part 2: Dynamic Data (OGC 23-002)](https://docs.ogc.org/is/23-002/23-002.html)  
**Date:** 2026-01-31

---

## Table of Contents

1. [Section 2.1: CSAPI Part 2 Standard Document Analysis](#section-21-csapi-part-2-standard-document-analysis)
   1. [Overview](#overview)
   2. [Dynamic Data Resource Types](#dynamic-data-resource-types)
   3. [HTTP Methods for Dynamic Data](#http-methods-for-dynamic-data)
   4. [Canonical Endpoints](#canonical-endpoints)
   5. [Schema Operations](#schema-operations)
   6. [Status and Result Operations](#status-and-result-operations)
   7. [Streaming and Pagination](#streaming-and-pagination)
   8. [Temporal Query Requirements](#temporal-query-requirements)
   9. [Observation-DataStream Relationships](#observation-datastream-relationships)
   10. [Command-ControlStream Relationships](#command-controlstream-relationships)
   11. [Format Options](#format-options)
   12. [Real-Time and Near-Real-Time Requirements](#real-time-and-near-real-time-requirements)
   13. [Conformance Classes](#conformance-classes)
   14. [Examples](#examples)

---

## Section 2.1: CSAPI Part 2 Standard Document Analysis

**Document:** [OGC API – Connected Systems Part 2: Dynamic Data](https://docs.ogc.org/is/23-002/23-002.html)  
**Date:** 2026-01-31  
**Status:** Complete

---

### Overview

CSAPI Part 2 extends Part 1 (Feature Resources) to handle **dynamic data** flowing to and from connected systems. While Part 1 focused on static metadata (Systems, Deployments, Procedures, Sampling Features, Properties), Part 2 defines resources for observations and commands that change over time.

**Key Architectural Principles:**

1. **Observations and Commands Are Not Features:** Deliberate design choice to separate concrete/virtual objects (Features of Interest) from dynamic data containers
2. **Bridge Between Static and Dynamic:** Part 1 Systems connect to Part 2 DataStreams and ControlStreams
3. **Real-Time and Historical:** Resources support both live streaming and historical data access
4. **Multiple Encoding Formats:** JSON, SWE Common JSON, SWE Common Text (CSV), SWE Common Binary for efficient transmission
5. **Pub/Sub Integration:** Part 3 (future) will define pub/sub protocol bindings

**Scope Statement:**
"Part 2 of the API implements the SSN concepts allowing exchange of dynamic (possibly real-time) data flowing to and from various types of connected systems (e.g., sensors, actuators, platforms)."

---

### Dynamic Data Resource Types

Part 2 defines **6 new resource types** for dynamic data:

#### 2.1 DataStream

**Definition:** Collection of Observations acquired by the same System, sharing the same observed properties

**Purpose:**
- Represents data feeds coming out of Systems
- Containers for Observations
- Used for receiving/ingesting real-time Observations
- Accessing historical Observations

**Key Characteristics:**
- Implements `sosa:ObservationCollection` concept
- All observations from same System
- All observations share same observed properties and result schema
- Can provide real-time data only, archived data only, or both

**Required Associations:**
- system (producer System)
- observations (list of Observation resources)

**Optional Associations:**
- procedure (Procedure used to generate observations)
- deployment (Deployment during which datastream generated)
- samplingFeatures (subject Sampling Features)
- featuresOfInterest (ultimate features of interest)

**DataStream Types:**
- `status` - Status observations of parent system or subsystems
- `observation` - Observations of other features of interest (not the system itself)

#### 2.2 Observation

**Definition:** Records all information regarding an act of observation (automated or human)

**Purpose:**
- Carry observation result structured according to defined schema
- Grouped into DataStreams

**Key Characteristics:**
- Implements `sosa:Observation` concept
- Always associated to a DataStream
- Some properties can be omitted (provided at datastream level)
- Can package observation result of several properties in single resource

**Required Attributes:**
- phenomenonTime (DateTime) - When observed property value applies to FOI
- resultTime (DateTime) - When result value obtained
- result (Any) - Observation result with estimated values

**Optional Attributes:**
- parameters (Any) - Information about how procedure used for this observation

**Required Association:**
- datastream (parent DataStream)

**Optional Associations:**
- samplingFeature (subject of observation)
- procedure (used for observation)

#### 2.3 ControlStream

**Definition:** Collection of Commands targeted at the same System, sharing the same controlled properties

**Purpose:**
- Represents data feeds going into Systems
- Containers for Commands
- Used for receiving/ingesting real-time Commands
- Accessing historical Commands

**Key Characteristics:**
- Implements `sosa:ActuationCollection` concept
- All commands received by same System
- All commands share same controlled properties and parameter schema
- Can provide real-time commands only, archived commands only, or both

**Required Associations:**
- system (receiver System)
- commands (list of Command resources)

**Optional Associations:**
- procedure (Procedure used to process commands)
- deployment (Deployment during which control stream active)
- samplingFeatures (subject Sampling Features)
- featuresOfInterest (ultimate features of interest affected)

**ControlStream Types:**
- `self` - Affect parent system or subsystems
- `external` - Affect external features of interest

#### 2.4 Command

**Definition:** Messages sent to System to control parameters of feature of interest

**Purpose:**
- Carry desired values of controlled parameters
- Structured according to defined schema
- Processing can result in actions on several properties at once

**Key Characteristics:**
- Implements generalization of `sosa:Actuation` concept
- Always associated to a ControlStream
- Some properties can be omitted (provided at control stream level)
- Can package desired value of several controlled parameters in single command
- Cancelling a command different from deleting Command resource (status changes to CANCELED)

**Required Attributes:**
- issueTime (DateTime) - When command issued
- executionTime (DateTime) - When command should be executed
- parameters (Any) - Command parameters with desired values

**Required Association:**
- controlstream (parent ControlStream)

**Optional Associations:**
- samplingFeature (feature of interest whose properties changed)
- procedure (used to process command)
- status (list of CommandStatus resources)
- result (list of CommandResult resources)

#### 2.5 CommandStatus

**Definition:** Status reports during execution of a command

**Purpose:**
- Provide progress updates during command execution
- Report success, failure, or intermediate states
- Support both synchronous and asynchronous command processing

**Required Attributes:**
- reportTime (DateTime) - When status reported
- executionTime (DateTime) - Time command executed or will execute
- statusCode (Enum) - Status of command execution
- percentCompletion (Integer 0-100) - Progress percentage
- message (String) - Human-readable status message

**Status Code Values:**
- `PENDING` - Command accepted, waiting for execution
- `ACCEPTED` - Command being processed
- `EXECUTING` - Command currently executing
- `COMPLETED` - Command successfully completed
- `FAILED` - Command failed
- `CANCELED` - Command canceled by user or system

**Required Association:**
- command (parent Command)

#### 2.6 CommandResult

**Definition:** Result of a command execution

**Purpose:**
- Attach data produced by command execution (e.g., data collection tasks, simulation runs)
- Support multiple result types (inline data, datastream references, observation references, external resources)

**Result Types:**
- Reference to one or more datastreams (with optional time range)
- Reference to one or more individual observations
- Reference to observation collection
- Inline result data encoded per control stream result schema

**At Least One Property Required:**
- inline (Any) - Result data inline
- observation (List<Observation>) - Observations resulting from command
- datastream (DataStream) - DataStream containing result observations
- external (Any) - External dataset reference

**Use Case Examples from Standard:**
1. **Chemical Plume Simulation:** Command triggers model run, creates new datastream with time series
2. **UAV Video Footage Task:** Command collects video, appends to existing datastream with time range
3. **UAV Picture Task:** Command collects single image, appends to datastream, returns observation reference
4. **Satellite Imagery Acquisition:** Coverage request creates multiple observations, returns references
5. **System State Retrieval:** Query returns inline state data

**Required Association:**
- command (parent Command)

---

### HTTP Methods for Dynamic Data

Part 2 specifies the same HTTP methods as Part 1 but applied to dynamic data resources:

#### 3.1 GET (Retrieval)

**Supported At:**
- Canonical resources endpoints: `/datastreams`, `/observations`, `/controlstreams`, `/commands`, `/feasibility`, `/systemEvents`
- Canonical resource endpoints: `/datastreams/{id}`, `/observations/{id}`, `/controlstreams/{id}`, `/commands/{id}`, `/feasibility/{id}`, `/systemEvents/{id}`
- Nested resources endpoints: `/systems/{sysId}/datastreams`, `/datastreams/{dsId}/observations`, `/deployments/{depId}/datastreams`, etc.
- Schema endpoints: `/datastreams/{id}/schema?obsFormat={format}`, `/controlstreams/{id}/schema?cmdFormat={format}`
- Status/result endpoints: `/commands/{cmdId}/status`, `/commands/{cmdId}/result`, `/feasibility/{feasId}/status`, `/feasibility/{feasId}/result`

**Parameters Supported:**
- `limit` - Pagination (min 1, max 10000)
- `datetime` - Temporal filter (for resources with validTime property)
- `phenomenonTime` - Temporal filter for DataStreams (filter by observation phenomenon times)
- `resultTime` - Temporal filter for DataStreams and Observations (filter by result times)
- `observedProperty` - Filter DataStreams by observed properties (ID or URI list)
- `foi` - Filter by feature of interest (transitive via sampling features)
- `controlledProperty` - Filter ControlStreams by controlled properties
- `executionTime` - Temporal filter for ControlStreams
- `issueTime` - Temporal filter for ControlStreams and Commands
- `statusCode` - Filter CommandStatus by status code

**Status Codes:**
- 200 (OK) - Successful retrieval
- 400 (Bad Request) - Invalid parameters
- 401 (Unauthorized) - Authentication required
- 403 (Forbidden) - Access denied
- 404 (Not Found) - Resource doesn't exist
- 5XX (Server Error) - Internal server error

#### 3.2 POST (Create)

**Supported At (when Create/Replace/Delete conformance class implemented):**
- DataStream resources endpoints: `/systems/{sysId}/datastreams`
- Observation resources endpoints: `/datastreams/{dsId}/observations`
- ControlStream resources endpoints: `/systems/{sysId}/controlstreams`
- Command resources endpoints: `/controlstreams/{csId}/commands`
- CommandStatus resources endpoints: `/commands/{cmdId}/status`
- CommandResult resources endpoints: `/commands/{cmdId}/result`
- Feasibility resources endpoints: `/controlstreams/{csId}/feasibility`
- SystemEvent resources endpoints: `/systems/{sysId}/events`

**Request Body:**
- Media type: Specified in Content-Type header (application/json, application/swe+json, application/swe+text, application/swe+binary)
- Must conform to schema (DataStream observation schema, ControlStream command schema)

**Response:**
- 201 (Created) - Resource created successfully
- Location header - URL of created resource (canonical URL)
- 400 (Bad Request) - Invalid payload or schema violation
- 409 (Conflict) - Resource already exists or constraint violation

**Schema Validation:**
- Server MUST reject Observation CREATE if result structure incompatible with datastream observation schema
- Server MUST reject Command CREATE if parameter structure incompatible with control stream command schema

#### 3.3 PUT (Replace)

**Supported At (when Create/Replace/Delete conformance class implemented):**
- DataStream resource endpoints: `/systems/{sysId}/datastreams/{id}`, `/datastreams/{id}`
- Observation resource endpoints: `/datastreams/{dsId}/observations/{id}`, `/observations/{id}`
- ControlStream resource endpoints: `/systems/{sysId}/controlstreams/{id}`, `/controlstreams/{id}`
- Command resource endpoints: `/controlstreams/{csId}/commands/{id}`, `/commands/{id}`
- CommandStatus resource endpoints: `/commands/{cmdId}/status/{id}`
- CommandResult resource endpoints: `/commands/{cmdId}/result/{id}`
- Feasibility resource endpoints: `/controlstreams/{csId}/feasibility/{id}`, `/feasibility/{id}`
- SystemEvent resource endpoints: `/systems/{sysId}/events/{id}`, `/systemEvents/{id}`

**Constraints:**
- Server MUST reject REPLACE on DataStream if modifies observation schema and datastream has observations (409 error)
- Server MUST reject REPLACE on ControlStream if modifies command schema and control stream has commands (409 error)

**Response:**
- 204 (No Content) - Resource replaced successfully
- 400 (Bad Request) - Invalid payload
- 404 (Not Found) - Resource doesn't exist
- 409 (Conflict) - Constraint violation (e.g., schema change with existing data)

#### 3.4 PATCH (Update)

**Supported At (when Update conformance class implemented):**
- Same resource endpoints as PUT
- Uses JSON Merge Patch (RFC 7396) format

**Constraints:**
- Same schema constraints as PUT
- Server MUST reject UPDATE on DataStream/ControlStream if modifies schema with existing observations/commands (409 error)

**Response:**
- 204 (No Content) - Resource updated successfully
- 400 (Bad Request) - Invalid patch
- 404 (Not Found) - Resource doesn't exist
- 409 (Conflict) - Constraint violation

**Note:** PATCH method follows OGC API - Features Part 4: Update

#### 3.5 DELETE (Delete)

**Supported At (when Create/Replace/Delete conformance class implemented):**
- Same resource endpoints as PUT

**Cascade Delete:**
- `cascade` parameter (boolean, default false)
- Without cascade: Server MUST reject DELETE on DataStream if has observations (409 error)
- Without cascade: Server MUST reject DELETE on ControlStream if has commands (409 error)
- With cascade=true: Deletes resource AND all nested resources

**Nested Resources Deleted by Cascade:**
- DataStream: All observations
- ControlStream: All commands

**Response:**
- 204 (No Content) - Resource deleted successfully
- 404 (Not Found) - Resource doesn't exist
- 409 (Conflict) - Cascade required but not provided

---

### Canonical Endpoints

Part 2 defines canonical endpoints following Part 1 patterns:

#### 4.1 Canonical Resources Endpoints (Collections)

Expose all resources of a type, support filtering via query parameters:

| Endpoint | Resource Type | Description |
|----------|---------------|-------------|
| `/datastreams` | DataStream | All datastreams |
| `/observations` | Observation | All observations |
| `/controlstreams` | ControlStream | All control streams |
| `/commands` | Command | All commands |
| `/feasibility` | Feasibility | All feasibility requests |
| `/systemEvents` | SystemEvent | All system events |

**Mandatory Parameters:**
- `limit` (integer, 1-10000, default 10) - Pagination
- `datetime` (string) - Temporal filter (ISO 8601 or intervals)

**Optional Parameters (if Advanced Filtering conformance class implemented):**
- Resource-type-specific filters (see Section 8)

#### 4.2 Canonical Resource Endpoints (Single Resource)

Access individual resources by local ID:

| Endpoint | Resource Type | Description |
|----------|---------------|-------------|
| `/datastreams/{id}` | DataStream | Single datastream |
| `/observations/{id}` | Observation | Single observation |
| `/controlstreams/{id}` | ControlStream | Single control stream |
| `/commands/{id}` | Command | Single command |
| `/feasibility/{id}` | Feasibility | Single feasibility request |
| `/systemEvents/{id}` | SystemEvent | Single system event |

**Canonical URL Requirement:**
- Every resource MUST be accessible via canonical URL
- If retrieved through other URL, response MUST include link to canonical URL with `rel=canonical`

#### 4.3 Nested Resources Endpoints

Resources accessible through parent resource relationships:

**DataStreams nested under Systems:**
- `/systems/{sysId}/datastreams` - All datastreams associated to System
- Exposes ONLY datastreams where system is producer

**DataStreams nested under Deployments:**
- `/deployments/{depId}/datastreams` - All datastreams associated to Deployment
- Exposes ONLY datastreams whose system was deployed during deployment, with validTime intersecting deployment time

**Observations nested under DataStreams:**
- `/datastreams/{dsId}/observations` - All observations in DataStream
- Exposes ONLY observations that are part of parent datastream

**Sampling Features nested under DataStreams:**
- `/datastreams/{dsId}/samplingFeatures` - All sampling features associated to DataStream observations
- Requires Part 1 Sampling Features conformance class

**Features of Interest nested under DataStreams:**
- `/datastreams/{dsId}/featuresOfInterest` - Ultimate features of interest of DataStream observations
- Requires server hosts FOI locally and provides featuresOfInterest association

**ControlStreams nested under Systems:**
- `/systems/{sysId}/controlstreams` - All control streams for System
- Exposes ONLY control streams where system is receiver

**ControlStreams nested under Deployments:**
- `/deployments/{depId}/controlstreams` - All control streams associated to Deployment
- Optional (server provides controlstreams association in Deployment)
- Exposes ONLY control streams whose system was deployed during deployment, with validTime intersecting deployment time

**Commands nested under ControlStreams:**
- `/controlstreams/{csId}/commands` - All commands in ControlStream
- Exposes ONLY commands that are part of parent control stream

**Sampling Features nested under ControlStreams:**
- `/controlstreams/{csId}/samplingFeatures` - All sampling features associated to ControlStream commands
- Requires Part 1 Sampling Features conformance class

**Features of Interest nested under ControlStreams:**
- `/controlstreams/{csId}/featuresOfInterest` - Ultimate features of interest of ControlStream commands
- Requires server hosts FOI locally and provides featuresOfInterest association

**CommandStatus nested under Commands:**
- `/commands/{cmdId}/status` - All status reports for Command
- Exposes ONLY status reports related to parent command

**CommandResult nested under Commands:**
- `/commands/{cmdId}/result` - All result items for Command
- Exposes ONLY results related to parent command
- Only if command can be associated to result

**Feasibility nested under ControlStreams:**
- `/controlstreams/{csId}/feasibility` - All feasibility requests for ControlStream
- Exposes ONLY feasibility requests for parent control stream

**Feasibility Status:**
- `/feasibility/{feasId}/status` - All status reports for Feasibility request

**Feasibility Result:**
- `/feasibility/{feasId}/result` - All result items for Feasibility request

**SystemEvents nested under Systems:**
- `/systems/{sysId}/events` - All system events for System
- Exposes ONLY events related to parent system

---

### Schema Operations

Part 2 provides schema operations for variable-structure resources:

#### 5.1 DataStream Schema Operation

**Purpose:** Different observation schema needed for each datastream (result type and observed properties vary)

**Endpoint:** `/datastreams/{id}/schema`

**Parameter:**
- `obsFormat` (required, string) - Media type of desired observation format
- Examples: `application/json`, `application/swe+csv`, `application/swe+binary`

**Response:**
- 200 (OK) - Single schema corresponding to format
- Schema resource content defined by encoding (not necessarily JSON schema)
- 400 (Bad Request) - Invalid format parameter

**Multiple Formats:**
- Server MAY offer multiple observation formats per datastream
- DataStream resource lists supported formats in `formats` property (List<String>)
- Client requests schema for each format separately
- Server MAY automatically convert observations between formats and generate equivalent schemas

**URL Encoding:**
- Media type must be URL encoded (`+` becomes `%2B`)
- Example: `application/swe+csv` → `application/swe%2Bcsv`

**Example Requests:**
```
GET /datastreams/abc123/schema?obsFormat=application/json
GET /datastreams/abc123/schema?obsFormat=application/swe%2Bcsv
GET /datastreams/abc123/schema?obsFormat=application/swe%2Bbinary
```

**Schema Lifecycle:**
- Schema provided when DataStream created (only one format initially)
- Server can auto-generate schemas for other supported formats
- Schema changes rejected if observations already exist (409 error on PUT/PATCH)
- Workaround: Create new datastream if schema needs to change

#### 5.2 ControlStream Schema Operation

**Purpose:** Different command schema needed for each control stream (controlled properties vary)

**Endpoint:** `/controlstreams/{id}/schema`

**Parameter:**
- `cmdFormat` (required, string) - Media type of desired command format
- Examples: `application/json`, `application/swe+csv`, `application/swe+binary`

**Response:**
- Same as DataStream schema operation

**Multiple Formats:**
- Same pattern as DataStream (server offers multiple formats, client requests specific format)

**URL Encoding:**
- Same as DataStream

**Example Requests:**
```
GET /controlstreams/xyz789/schema?cmdFormat=application/json
GET /controlstreams/xyz789/schema?cmdFormat=application/swe%2Bcsv
GET /controlstreams/xyz789/schema?cmdFormat=application/swe%2Bbinary
```

**Schema Lifecycle:**
- Same constraints as DataStream (schema changes rejected if commands exist)

**Feasibility Channels:**
- Feasibility requests share same parameter schema as corresponding commands
- Both commands and feasibility use schema from parent ControlStream

---

### Status and Result Operations

Part 2 provides specialized operations for command lifecycle management:

#### 6.1 CommandStatus Resources Endpoint

**Purpose:** Retrieve status reports for command execution

**Definition:** Resources endpoint exposing set of CommandStatus resources

**Mandatory Endpoint (nested):**
- `/commands/{cmdId}/status` - Status reports for specific command

**HTTP GET Operation:**
- Supports `limit` and `datetime` parameters (OGC API - Features Part 1 requirements)
- Returns only CommandStatus resources related to parent command

**Response:**
- 200 (OK) - CommandStatus resources selected by request
- Error cases per OGC API - Features Part 1 Clause 7.5.1

**Usage Patterns:**

1. **Polling for Updates:**
```
GET /commands/cmd123/status
// Returns all status reports, client checks latest
```

2. **Filtered by Time:**
```
GET /commands/cmd123/status?datetime=2024-01-15T00:00:00Z/..
// Returns status reports since specific time
```

3. **Pagination:**
```
GET /commands/cmd123/status?limit=10
// Returns up to 10 status reports
```

**Creating Status Reports:**
- POST to `/commands/{cmdId}/status` (when Create/Replace/Delete conformance class implemented)
- Enables both client and server to post status updates
- Command cancellation: POST new status with statusCode=CANCELED (different from DELETE)

#### 6.2 CommandResult Resources Endpoint

**Purpose:** Retrieve result items for command execution

**Definition:** Resources endpoint exposing set of CommandResult resources

**Mandatory Endpoint (nested):**
- `/commands/{cmdId}/result` - Results for specific command
- Only required for commands that can be associated to result

**HTTP GET Operation:**
- Supports `limit` parameter (OGC API - Features Part 1 requirements)
- Returns only CommandResult resources related to parent command

**Response:**
- 200 (OK) - CommandResult resources selected by request
- Error cases per OGC API - Features Part 1 Clause 7.5.1

**Result Types Support:**

1. **Datastream Reference:**
```json
{
  "datastream@link": {
    "href": "https://api.example.org/datastreams/ds456",
    "title": "Plume Simulation Results",
    "type": "application/json"
  },
  "timeRange": "2024-01-15T00:00:00Z/2024-01-15T12:00:00Z"
}
```

2. **Observation Reference:**
```json
{
  "observation@link": {
    "href": "https://api.example.org/observations/obs789",
    "title": "UAV Image",
    "type": "image/jpeg"
  }
}
```

3. **Inline Result:**
```json
{
  "inline": {
    "temperature": 23.5,
    "pressure": 101325,
    "humidity": 65.2
  }
}
```

4. **External Resource:**
```json
{
  "external@link": {
    "href": "https://data.example.org/datasets/sim-run-123",
    "title": "Full Simulation Output",
    "type": "application/netcdf"
  }
}
```

**Synchronous vs Asynchronous:**
- Synchronous commands: Result can be provided in HTTP response
- Asynchronous commands: Client polls result endpoint or uses pub/sub (Part 3)

#### 6.3 Command Feasibility

**Purpose:** Check if command/task feasible without sending actual command

**Feasibility Channel:**
- Created at `/controlstreams/{csId}/feasibility`
- Uses same parameter schema as corresponding commands
- Responds synchronously or asynchronously like regular commands

**Response Types:**

1. **Binary (YES/NO):**
```json
{
  "feasible": true,
  "message": "Task can be scheduled"
}
```

2. **Detailed Analysis:**
```json
{
  "feasible": true,
  "successProbability": 0.85,
  "executionSteps": [
    {"step": 1, "action": "Orient sensor", "duration": "PT5S"},
    {"step": 2, "action": "Capture image", "duration": "PT1S"}
  ],
  "alternatives": [
    {"taskId": "alt1", "probability": 0.92, "delay": "PT30M"}
  ]
}
```

**Feasibility Status and Result:**
- Follows same pattern as Command
- `/feasibility/{feasId}/status` - Status reports
- `/feasibility/{feasId}/result` - Feasibility analysis results

**Use Cases:**
- Check availability before tasking UAV
- Validate command parameters before submission
- Evaluate scheduling conflicts
- Provide cost/risk estimates

---

### Streaming and Pagination

Part 2 supports efficient data streaming and pagination for large result sets:

#### 7.1 Pagination Parameters

**limit Parameter:**
- Type: integer
- Range: 1 to 10000
- Default: 10 (if not specified)
- Inherited from OGC API - Features Part 1 Clause 7.15.2
- Applies to all resources endpoints (DataStreams, Observations, ControlStreams, Commands, etc.)

**Usage:**
```
GET /observations?limit=100
// Returns up to 100 observations
```

**Pagination Links:**
- Response includes `next` link for next page
- Client follows links to retrieve all pages
- Cursor-based pagination (implementation-specific)

**Example Response:**
```json
{
  "type": "FeatureCollection",
  "features": [ /* 100 observations */ ],
  "links": [
    {
      "rel": "next",
      "href": "https://api.example.org/observations?limit=100&cursor=abc123",
      "type": "application/json"
    }
  ]
}
```

#### 7.2 Temporal Windowing

**datetime Parameter:**
- Type: string (ISO 8601)
- Formats: Single instant, closed interval, open interval
- Inherited from OGC API - Features Part 1 Clause 7.15.4

**Single Instant:**
```
GET /datastreams?datetime=2024-01-15T12:00:00Z
// DataStreams with validTime intersecting instant
```

**Closed Interval:**
```
GET /observations?datetime=2024-01-15T00:00:00Z/2024-01-16T00:00:00Z
// Observations with phenomenonTime intersecting interval
```

**Open Start:**
```
GET /observations?datetime=../2024-01-16T00:00:00Z
// Observations with phenomenonTime before end time
```

**Open End:**
```
GET /observations?datetime=2024-01-15T00:00:00Z/..
// Observations with phenomenonTime after start time
```

**Special Value - latest:**
```
GET /observations?resultTime=latest
// Only observations with latest resultTime
```

**Resource-Specific Temporal Filters:**
- `datetime` - Applies to validTime (DataStreams, ControlStreams)
- `phenomenonTime` - Applies to phenomenonTime (DataStreams filter by obs phenomenon times)
- `resultTime` - Applies to resultTime (DataStreams, Observations)
- `executionTime` - Applies to executionTime (ControlStreams)
- `issueTime` - Applies to issueTime (ControlStreams, Commands)

#### 7.3 Streaming Patterns

**Live Data Access:**
- DataStream `live` property (boolean) indicates if live data available
- ControlStream `live` property (boolean) indicates if currently accepts commands

**Pattern 1: Polling Latest:**
```
// Poll every 5 seconds for new observations
GET /datastreams/ds123/observations?resultTime=latest
```

**Pattern 2: Incremental Fetch:**
```
// First request
GET /datastreams/ds123/observations?resultTime=2024-01-15T00:00:00Z/..&limit=1000

// Subsequent requests using last observation resultTime
GET /datastreams/ds123/observations?resultTime=2024-01-15T12:34:56Z/..&limit=1000
```

**Pattern 3: Time-Windowed Pagination:**
```
// Day 1
GET /observations?datetime=2024-01-15T00:00:00Z/2024-01-16T00:00:00Z&limit=10000

// Day 2
GET /observations?datetime=2024-01-16T00:00:00Z/2024-01-17T00:00:00Z&limit=10000
```

**Pattern 4: Pub/Sub (Part 3):**
- For true real-time streaming
- Avoids polling overhead
- WebSocket, MQTT, or other pub/sub protocols
- Part 3 specification (future)

#### 7.4 Efficient Encodings

**SWE Common Binary:**
- Most compact format
- ~10-100x smaller than JSON for time series
- Requires schema parsing
- Best for high-frequency sensor data

**SWE Common Text (CSV):**
- Human-readable
- ~2-5x smaller than JSON
- Easy integration with spreadsheets/analysis tools
- Good for moderate-frequency data

**SWE Common JSON:**
- Structured like JSON
- More compact than plain JSON
- Preserves SWE Common data component structure
- Good balance of efficiency and readability

**Format Selection:**
```
GET /datastreams/ds123/observations
Accept: application/swe+binary
// Server returns observations in binary format
```

---

### Temporal Query Requirements

Part 2 extends temporal query capabilities from Part 1:

#### 8.1 phenomenonTime Filter (Advanced Filtering)

**Applies To:** DataStreams, Observations

**Purpose:** Filter by time the observed property value applies to feature of interest

**DataStream Filtering:**
```
GET /datastreams?phenomenonTime=2024-01-15T00:00:00Z/2024-01-16T00:00:00Z
// Returns datastreams whose phenomenonTime property intersects interval
```

**Observation Filtering:**
```
GET /observations?phenomenonTime=2024-01-15T12:00:00Z
// Returns observations whose phenomenonTime equals or intersects instant
```

**Nested Endpoint:**
```
GET /datastreams/ds123/observations?phenomenonTime=2024-01-15T00:00:00Z/..
// Returns observations in ds123 with phenomenonTime after start
```

**DataStream phenomenonTime Property:**
- Automatically generated by server
- Spans phenomenon times of all observations in datastream
- Set to null if no observations

**Observation phenomenonTime Property:**
- Required attribute
- DateTime type
- When observed property value applies to FOI

#### 8.2 resultTime Filter (Advanced Filtering)

**Applies To:** DataStreams, Observations

**Purpose:** Filter by time the result value was obtained

**DataStream Filtering:**
```
GET /datastreams?resultTime=2024-01-15T00:00:00Z/2024-01-16T00:00:00Z
// Returns datastreams whose resultTime property intersects interval
```

**Observation Filtering:**
```
GET /observations?resultTime=latest
// Returns observations with latest resultTime (special value)
```

**Nested Endpoint:**
```
GET /datastreams/ds123/observations?resultTime=2024-01-15T12:00:00Z/..
// Returns observations in ds123 with resultTime after start
```

**Special Value - latest:**
- Only for Observation filtering
- Returns observations with most recent resultTime
- Useful for real-time monitoring dashboards

**DataStream resultTime Property:**
- Automatically generated by server
- Spans result times of all observations in datastream
- Set to null if no observations

**Observation resultTime Property:**
- Required attribute
- DateTime type
- When result value obtained (may differ from phenomenonTime)

#### 8.3 executionTime Filter (Advanced Filtering)

**Applies To:** ControlStreams

**Purpose:** Filter by time commands should be or were executed

**ControlStream Filtering:**
```
GET /controlstreams?executionTime=2024-01-15T00:00:00Z/2024-01-16T00:00:00Z
// Returns control streams whose executionTime property intersects interval
```

**ControlStream executionTime Property:**
- Automatically generated by server
- Spans execution times of all commands in control stream
- Set to null if no commands

**Command executionTime Property:**
- Required attribute
- DateTime type
- When command should be executed

#### 8.4 issueTime Filter (Advanced Filtering)

**Applies To:** ControlStreams

**Purpose:** Filter by time commands were issued

**ControlStream Filtering:**
```
GET /controlstreams?issueTime=2024-01-15T00:00:00Z/2024-01-16T00:00:00Z
// Returns control streams whose issueTime property intersects interval
```

**ControlStream issueTime Property:**
- Automatically generated by server
- Spans issue times of all commands in control stream
- Set to null if no commands

**Command issueTime Property:**
- Required attribute
- DateTime type
- When command issued

#### 8.5 validTime Filter (Part 1 Inheritance)

**Applies To:** DataStreams, ControlStreams (resources with validTime property)

**Purpose:** Filter by validity period of resource description

**Usage:**
```
GET /datastreams?datetime=2024-01-15T00:00:00Z/2024-01-16T00:00:00Z
// Returns datastreams with validTime intersecting interval
```

**Note:** `datetime` parameter applies to validTime per OGC API - Features Part 1

**DataStream validTime Property:**
- Optional attribute
- TimeExtent type
- Validity period of datastream's description

**ControlStream validTime Property:**
- Optional attribute
- TimeExtent type
- Validity period of control stream's description

---

### Observation-DataStream Relationships

Part 2 defines tight coupling between Observations and DataStreams:

#### 9.1 Containment Relationship

**DataStream as Container:**
- DataStream implements `sosa:ObservationCollection` concept
- Observations MUST be part of exactly one DataStream
- Observations accessed through parent DataStream

**Required Association:**
```json
{
  "type": "Observation",
  "datastream@id": "ds123",
  "phenomenonTime": "2024-01-15T12:00:00Z",
  "resultTime": "2024-01-15T12:00:01Z",
  "result": 23.5
}
```

**Canonical vs Nested Access:**
- Canonical: `/observations/{id}` - Direct access by observation ID
- Nested: `/datastreams/{dsId}/observations` - Access via parent datastream
- Both return same Observation resource (with canonical link)

#### 9.2 Schema Inheritance

**Observation Schema from DataStream:**
- DataStream defines observation schema for all contained observations
- Observation result MUST conform to DataStream resultSchema
- Observation parameters (if any) MUST conform to DataStream parametersSchema

**Schema Properties in DataStream:**
```json
{
  "type": "DataStream",
  "resultSchema": { /* JSON Schema or SWE Common DataComponent */ },
  "parametersSchema": { /* JSON Schema or SWE Common DataComponent */ }
}
```

**Validation:**
- Server MUST reject Observation CREATE/REPLACE if result invalid per schema (400 error)
- Server MUST reject Observation UPDATE if modifies result to be invalid per schema (400 error)

**Schema Evolution:**
- DataStream schema changes rejected if observations exist (409 error)
- Workaround: Create new DataStream with new schema

#### 9.3 Property Inheritance

**Properties Provided at DataStream Level:**
- observedProperties (List<URI>) - Properties for which observations provide measurements
- resultType (Enum) - Type of result (measure, vector, record, coverage, complex)
- system (System) - Producer of datastream
- procedure (Procedure) - Used to generate observations
- deployment (Deployment) - During which datastream generated
- samplingFeatures (List<SamplingFeature>) - Subject sampling features
- featuresOfInterest (List<Feature>) - Ultimate features of interest

**Properties Omitted from Observation:**
- Observation doesn't repeat system, observedProperties (from parent DataStream)
- Reduces payload size for large observation collections

**Properties Specific to Each Observation:**
- phenomenonTime (DateTime) - When observed property value applies
- resultTime (DateTime) - When result obtained
- result (Any) - Observation result
- parameters (Any) - Observation-specific parameters (optional)
- samplingFeature (SamplingFeature) - Subject of observation (optional, can differ per observation)
- procedure (Procedure) - Used for observation (optional, can override DataStream procedure)

#### 9.4 Aggregation Properties

**DataStream Aggregates Observation Properties:**
- phenomenonTime (TimeExtent) - Spans all observation phenomenon times
- resultTime (TimeExtent) - Spans all observation result times
- observedProperties (List<URI>) - All observed properties in observations
- resultType (Enum) - Common result type for all observations

**Auto-Generated by Server:**
- Server automatically updates these properties based on contained observations
- Set to null if no observations
- Server MAY ignore client updates to these properties (they're derived)

**Example:**
```json
{
  "type": "DataStream",
  "phenomenonTime": "2024-01-15T00:00:00Z/2024-01-16T00:00:00Z",
  "resultTime": "2024-01-15T00:00:01Z/2024-01-16T00:00:01Z",
  "observedProperties": ["http://example.org/properties/temperature"],
  "resultType": "measure"
}
```

#### 9.5 Live Data Indicator

**live Property (Boolean):**
- Indicates whether live data available from datastream
- Required attribute
- Server MAY auto-generate and ignore updates

**Use Cases:**
- `live=true` - DataStream provides real-time observations (polling or pub/sub)
- `live=false` - DataStream contains only historical observations
- `live=true` + archived data - DataStream provides both real-time and historical

**Client Behavior:**
- Check `live` before polling or subscribing
- Use polling/pub/sub patterns if `live=true`
- Use batch queries if `live=false`

#### 9.6 Nested Resources Access

**Sampling Features from DataStream:**
```
GET /datastreams/ds123/samplingFeatures
// Returns sampling features associated to observations in ds123
```

**Requirements:**
- Server implements Part 1 Sampling Features conformance class
- Endpoint exposes ONLY sampling features associated to observations in parent datastream

**Features of Interest from DataStream:**
```
GET /datastreams/ds123/featuresOfInterest
// Returns ultimate features of interest of observations in ds123
```

**Requirements:**
- Server provides featuresOfInterest association in DataStream
- Server hosts FOI descriptions locally
- Endpoint exposes ONLY features that are ultimate FOI of observations in parent datastream

---

### Command-ControlStream Relationships

Part 2 defines parallel structure for Commands and ControlStreams (mirrors Observation-DataStream):

#### 10.1 Containment Relationship

**ControlStream as Container:**
- ControlStream implements `sosa:ActuationCollection` concept
- Commands MUST be part of exactly one ControlStream
- Commands accessed through parent ControlStream

**Required Association:**
```json
{
  "type": "Command",
  "controlstream@id": "cs456",
  "issueTime": "2024-01-15T12:00:00Z",
  "executionTime": "2024-01-15T12:01:00Z",
  "parameters": {
    "pan": 45.0,
    "tilt": 30.0,
    "zoom": 2.5
  }
}
```

**Canonical vs Nested Access:**
- Canonical: `/commands/{id}` - Direct access by command ID
- Nested: `/controlstreams/{csId}/commands` - Access via parent control stream
- Both return same Command resource (with canonical link)

#### 10.2 Schema Inheritance

**Command Schema from ControlStream:**
- ControlStream defines command schema for all contained commands
- Command parameters MUST conform to ControlStream parametersSchema

**Schema Properties in ControlStream:**
```json
{
  "type": "ControlStream",
  "parametersSchema": { /* JSON Schema or SWE Common DataComponent */ }
}
```

**Validation:**
- Server MUST reject Command CREATE/REPLACE if parameters invalid per schema (400 error)
- Server MUST reject Command UPDATE if modifies parameters to be invalid per schema (400 error)

**Schema Evolution:**
- ControlStream schema changes rejected if commands exist (409 error)
- Workaround: Create new ControlStream with new schema

#### 10.3 Property Inheritance

**Properties Provided at ControlStream Level:**
- controlledProperties (List<URI>) - Properties whose value can be changed by commands
- system (System) - Receiver of control stream
- procedure (Procedure) - Used to process commands
- deployment (Deployment) - During which control stream active
- samplingFeatures (List<SamplingFeature>) - Subject sampling features
- featuresOfInterest (List<Feature>) - Ultimate features of interest affected

**Properties Omitted from Command:**
- Command doesn't repeat system, controlledProperties (from parent ControlStream)
- Reduces payload size for large command collections

**Properties Specific to Each Command:**
- issueTime (DateTime) - When command issued
- executionTime (DateTime) - When command should execute
- parameters (Any) - Command parameters
- samplingFeature (SamplingFeature) - FOI whose properties changed (optional, can differ per command)
- procedure (Procedure) - Used to process command (optional, can override ControlStream procedure)
- status (List<CommandStatus>) - Status reports
- result (List<CommandResult>) - Result items

#### 10.4 Aggregation Properties

**ControlStream Aggregates Command Properties:**
- issueTime (TimeExtent) - Spans all command issue times
- executionTime (TimeExtent) - Spans all command execution times
- controlledProperties (List<URI>) - All controlled properties in commands

**Auto-Generated by Server:**
- Server automatically updates these properties based on contained commands
- Set to null if no commands
- Server MAY ignore client updates to these properties (they're derived)

**Example:**
```json
{
  "type": "ControlStream",
  "issueTime": "2024-01-15T00:00:00Z/2024-01-16T00:00:00Z",
  "executionTime": "2024-01-15T00:01:00Z/2024-01-16T00:01:00Z",
  "controlledProperties": [
    "http://example.org/properties/pan",
    "http://example.org/properties/tilt",
    "http://example.org/properties/zoom"
  ]
}
```

#### 10.5 Live and Async Indicators

**live Property (Boolean):**
- Indicates whether control stream currently accepts commands
- Required attribute
- `live=true` - System available to receive commands
- `live=false` - System unavailable or control stream archived only

**async Property (Boolean):**
- Indicates whether commands processed asynchronously
- Required attribute
- `async=true` - Commands processed asynchronously (status reports via polling or pub/sub)
- `async=false` - Commands processed synchronously (result in HTTP response)

**Client Behavior:**
- Check `live` before sending commands
- If `async=true`, poll `/commands/{cmdId}/status` or subscribe (Part 3)
- If `async=false`, expect result in immediate HTTP response

#### 10.6 Command Lifecycle

**State Transitions:**
```
PENDING → ACCEPTED → EXECUTING → COMPLETED
                               → FAILED
           ↘ CANCELED
```

**Status Codes:**
- `PENDING` - Command accepted, waiting for execution
- `ACCEPTED` - Command being processed
- `EXECUTING` - Command currently executing
- `COMPLETED` - Successfully completed
- `FAILED` - Failed (see message for reason)
- `CANCELED` - Canceled by user or system

**Reporting Status:**
- POST new status to `/commands/{cmdId}/status`
- Both client and server can post updates
- Cancellation: POST status with statusCode=CANCELED (not DELETE command)

**Retrieving Status:**
- GET from `/commands/{cmdId}/status`
- Poll for updates if `async=true`
- Check percentCompletion for progress

#### 10.7 Command Results

**When Results Generated:**
- Commands that trigger data collection (UAV imagery, sensor sampling)
- Commands that run simulations (plume modeling, forecasts)
- Commands that query system state

**Result Attachment:**
- POST result to `/commands/{cmdId}/result`
- Multiple results per command possible (e.g., each model timestep)

**Result Retrieval:**
- GET from `/commands/{cmdId}/result`
- Provides datastream references, observation references, inline data, or external resources

#### 10.8 Nested Resources Access

**Sampling Features from ControlStream:**
```
GET /controlstreams/cs456/samplingFeatures
// Returns sampling features associated to commands in cs456
```

**Requirements:**
- Server implements Part 1 Sampling Features conformance class
- Endpoint exposes ONLY sampling features associated to commands in parent control stream

**Features of Interest from ControlStream:**
```
GET /controlstreams/cs456/featuresOfInterest
// Returns ultimate features of interest of commands in cs456
```

**Requirements:**
- Server provides featuresOfInterest association in ControlStream
- Server hosts FOI descriptions locally
- Endpoint exposes ONLY features that are ultimate FOI of commands in parent control stream

---

### Format Options

Part 2 supports multiple encoding formats for observations and commands:

#### 11.1 JSON Encoding

**Media Type:** `application/json`

**Supported For:**
- All resource types (DataStreams, Observations, ControlStreams, Commands, CommandStatus, CommandResult, SystemEvents)
- DataStream/ControlStream representations
- Observation/Command schemas

**Characteristics:**
- Human-readable
- Easy to parse with standard JSON libraries
- Verbose (larger payload sizes)
- Good for small datasets and interactive debugging

**Example DataStream:**
```json
{
  "type": "DataStream",
  "id": "ds123",
  "name": "Temperature Sensor Data",
  "observedProperties": ["http://example.org/properties/temperature"],
  "resultType": "measure",
  "live": true,
  "formats": ["application/json", "application/swe+json"]
}
```

**Example Observation:**
```json
{
  "type": "Observation",
  "id": "obs456",
  "datastream@id": "ds123",
  "phenomenonTime": "2024-01-15T12:00:00Z",
  "resultTime": "2024-01-15T12:00:01Z",
  "result": 23.5
}
```

**Mandatory Support:**
- All servers MUST support JSON encoding for retrieval (GET)
- Servers implementing Create/Replace/Delete MUST advertise JSON support for transactional operations

#### 11.2 SWE Common JSON Encoding

**Media Type:** `application/swe+json`

**Supported For:**
- Observations
- Commands
- Observation schemas
- Command schemas

**Characteristics:**
- Structured according to SWE Common Data Model 3.0
- More compact than plain JSON
- Preserves SWE Common data component structure
- Machine-readable with SWE Common parsers

**Example Observation Schema:**
```json
{
  "type": "DataRecord",
  "fields": [
    {
      "name": "phenomenonTime",
      "type": "Time",
      "definition": "http://www.opengis.net/def/property/OGC/0/SamplingTime",
      "uom": {"code": "http://www.opengis.net/def/uom/ISO-8601/0/Gregorian"}
    },
    {
      "name": "result",
      "type": "Quantity",
      "definition": "http://example.org/properties/temperature",
      "uom": {"code": "Cel"}
    }
  ],
  "encoding": {
    "type": "JSONEncoding"
  }
}
```

**Example Observation:**
```json
{
  "phenomenonTime": "2024-01-15T12:00:00Z",
  "result": 23.5
}
```

**Optional Support:**
- Servers MAY support SWE Common JSON encoding
- If supported, MUST be advertised in DataStream/ControlStream `formats` property

#### 11.3 SWE Common Text Encoding (CSV/DSV)

**Media Type:** `application/swe+text`

**Supported For:**
- Observations
- Commands

**Characteristics:**
- Delimiter-separated values (CSV with custom delimiters)
- Human-readable
- ~2-5x more compact than JSON
- Easy integration with spreadsheets and analysis tools
- Requires schema for parsing

**Example Observation Schema:**
```json
{
  "type": "DataRecord",
  "fields": [
    {"name": "phenomenonTime", "type": "Time"},
    {"name": "result", "type": "Quantity"}
  ],
  "encoding": {
    "type": "TextEncoding",
    "tokenSeparator": ",",
    "blockSeparator": "\n",
    "decimalSeparator": "."
  }
}
```

**Example Observations:**
```
2024-01-15T12:00:00Z,23.5
2024-01-15T12:01:00Z,23.6
2024-01-15T12:02:00Z,23.4
```

**Optional Support:**
- Servers MAY support SWE Common Text encoding
- If supported, MUST be advertised in DataStream/ControlStream `formats` property

#### 11.4 SWE Common Binary Encoding

**Media Type:** `application/swe+binary`

**Supported For:**
- Observations
- Commands

**Characteristics:**
- Binary encoding according to SWE Common specification
- Most compact (~10-100x smaller than JSON for time series)
- Requires schema for parsing
- Best for high-frequency sensor data
- Not human-readable

**Example Observation Schema:**
```json
{
  "type": "DataRecord",
  "fields": [
    {"name": "phenomenonTime", "type": "Time"},
    {"name": "result", "type": "Quantity"}
  ],
  "encoding": {
    "type": "BinaryEncoding",
    "byteOrder": "BIG_ENDIAN",
    "byteEncoding": "BASE64",
    "members": [
      {"component": "phenomenonTime", "dataType": "DOUBLE"},
      {"component": "result", "dataType": "FLOAT"}
    ]
  }
}
```

**Example Observations (Base64-encoded binary):**
```
QdZeP4AAAABBuZmZmUHWXkAAAAABQbmZmaVB1l5BAAAAQbpmZpk=
```

**Optional Support:**
- Servers MAY support SWE Common Binary encoding
- If supported, MUST be advertised in DataStream/ControlStream `formats` property

#### 11.5 Format Negotiation

**Content Negotiation via Accept Header:**
```
GET /datastreams/ds123/observations
Accept: application/swe+binary
```

**Format Parameter:**
```
GET /datastreams/ds123/observations?f=application/swe+binary
```

**Schema Query:**
```
GET /datastreams/ds123/schema?obsFormat=application/swe+binary
```

**Multiple Format Support:**
- Server lists supported formats in DataStream/ControlStream `formats` property
- Client selects appropriate format based on use case
- Server MAY automatically convert between formats

**Format Selection Guidance:**
- **JSON** - Interactive debugging, small datasets, human review
- **SWE Common JSON** - Structured data with SWE Common tooling
- **SWE Common Text** - Spreadsheet import, moderate-frequency data, human readability
- **SWE Common Binary** - High-frequency sensor data, bandwidth-constrained environments, archival storage

---

### Real-Time and Near-Real-Time Requirements

Part 2 supports real-time data delivery through multiple mechanisms:

#### 12.1 Live Data Indicators

**DataStream live Property:**
- Boolean flag indicating real-time data availability
- `live=true` - DataStream provides real-time observations
- `live=false` - Historical data only

**ControlStream live Property:**
- Boolean flag indicating command acceptance status
- `live=true` - System currently accepts commands
- `live=false` - System unavailable or archived control stream

**Server Responsibilities:**
- Update `live` flag when system availability changes
- Server MAY auto-generate and ignore client updates

**Client Responsibilities:**
- Check `live` before attempting real-time operations
- Handle `live=false` gracefully (use historical data or retry later)

#### 12.2 Polling Patterns

**Latest Data Polling:**
```
// Poll every N seconds
GET /datastreams/ds123/observations?resultTime=latest
```

**Incremental Polling:**
```
// First poll
GET /datastreams/ds123/observations?resultTime=2024-01-15T12:00:00Z/..&limit=1000

// Subsequent polls using last resultTime
GET /datastreams/ds123/observations?resultTime=2024-01-15T12:05:23Z/..&limit=1000
```

**Polling Frequency Considerations:**
- Check DataStream metadata for expected update frequency
- Balance between latency and server load
- Use limit parameter to control result set size
- Consider server rate limiting

#### 12.3 Asynchronous Command Processing

**async Property:**
- Boolean flag in ControlStream
- `async=true` - Commands processed asynchronously with status updates
- `async=false` - Commands processed synchronously with immediate response

**Asynchronous Workflow:**
```
1. POST command to /controlstreams/cs456/commands
   → 201 Created, Location: /commands/cmd789

2. Poll status endpoint
   GET /commands/cmd789/status
   → Returns status reports (PENDING → ACCEPTED → EXECUTING → COMPLETED)

3. Retrieve result (if applicable)
   GET /commands/cmd789/result
   → Returns CommandResult resources
```

**Synchronous Workflow:**
```
1. POST command to /controlstreams/cs456/commands
   → 200 OK with command result in response body
```

**Status Polling:**
- Poll `/commands/{cmdId}/status` periodically
- Check `percentCompletion` for progress
- Check `statusCode` for terminal states (COMPLETED, FAILED, CANCELED)

#### 12.4 Pub/Sub Integration (Part 3)

**Future Specification:**
- Part 3 will define pub/sub protocol bindings
- Alternatives to HTTP polling
- Lower latency, reduced server load

**Anticipated Protocols:**
- WebSocket
- MQTT
- Server-Sent Events (SSE)
- gRPC streaming

**Current Status:**
- Part 2 defines HTTP-based interfaces only
- Part 3 not yet published
- Servers MAY implement proprietary pub/sub until Part 3 available

**Benefits of Pub/Sub:**
- Push-based updates (no polling)
- Lower latency (<1 second vs 5-10 second polling)
- Reduced bandwidth (only changed data sent)
- Better scaling for many concurrent clients

#### 12.5 Real-Time Use Cases

**Sensor Monitoring Dashboard:**
- Poll latest observations every 5 seconds
- Display real-time charts
- Alert on threshold violations

**UAV Control:**
- Send commands asynchronously
- Poll status for execution confirmation
- Display telemetry from datastreams

**Weather Forecast Model:**
- Trigger model run via command
- Poll status for progress updates
- Retrieve result datastream when complete

**Industrial Process Control:**
- Send control commands to actuators
- Monitor sensor datastreams for feedback
- Implement closed-loop control algorithms

**Emergency Response:**
- Monitor multiple sensor datastreams
- Detect anomalies in real-time
- Dispatch commands to response systems

---

### Conformance Classes

Part 2 defines **8 requirements classes** and corresponding conformance classes:

#### 13.1 Conformance Class A.1: Common

**Identifier:** `/conf/api-common`  
**Requirements Class:** `/req/api-common`  
**Prerequisite:** OGC API - Features Part 1: Core  
**Target Type:** Web API

**Purpose:** Requirements shared by several other requirements classes

**Key Requirements:**
- Non-feature resources (Observations, Commands, etc. are not Features)
- Resource collections (grouping resources with `itemType` property)

**Note:** This conformance class is prerequisite for all Part 2 conformance classes

#### 13.2 Conformance Class A.2: Datastreams & Observations

**Identifier:** `/conf/datastream`  
**Requirements Class:** `/req/datastream`  
**Prerequisite:** Conformance class A.1: `/conf/api-common`  
**Target Type:** Web API

**Resources Defined:**
- DataStream resources
- Observation resources

**Endpoints Required:**
- Canonical: `/datastreams`, `/datastreams/{id}`
- Canonical: `/observations`, `/observations/{id}`
- Nested: `/systems/{sysId}/datastreams`
- Nested: `/deployments/{depId}/datastreams`
- Nested: `/datastreams/{dsId}/observations`
- Schema: `/datastreams/{id}/schema?obsFormat={format}`
- Optional nested: `/datastreams/{dsId}/samplingFeatures`, `/datastreams/{dsId}/featuresOfInterest`

**Collections Support:**
- Collections with `itemType=DataStream`
- Collections with `itemType=Observation`

**Key Requirements (16 total):**
- Requirement 3-4: Sampling features / FOI references from datastream
- Requirement 5: DataStream canonical URL
- Requirement 6-7: DataStream resources endpoints
- Requirement 8-9: DataStream references from System/Deployment
- Requirement 10: DataStream collections
- Requirement 11: DataStream schema operation
- Requirement 12: Observation canonical URL
- Requirement 13-14: Observation resources endpoints
- Requirement 15: Observation references from DataStream
- Requirement 16: Observation collections

**Mandatory:** Minimum server MUST implement this OR ControlStreams & Commands conformance class

#### 13.3 Conformance Class A.3: Control Streams & Commands

**Identifier:** `/conf/controlstream`  
**Requirements Class:** `/req/controlstream`  
**Prerequisite:** Conformance class A.1: `/conf/api-common`  
**Target Type:** Web API

**Resources Defined:**
- ControlStream resources
- Command resources
- CommandStatus resources
- CommandResult resources

**Endpoints Required:**
- Canonical: `/controlstreams`, `/controlstreams/{id}`
- Canonical: `/commands`, `/commands/{id}`
- Nested: `/systems/{sysId}/controlstreams`
- Nested: `/deployments/{depId}/controlstreams` (optional)
- Nested: `/controlstreams/{csId}/commands`
- Nested: `/commands/{cmdId}/status`
- Nested: `/commands/{cmdId}/result`
- Schema: `/controlstreams/{id}/schema?cmdFormat={format}`
- Optional nested: `/controlstreams/{csId}/samplingFeatures`, `/controlstreams/{csId}/featuresOfInterest`

**Collections Support:**
- Collections with `itemType=ControlStream`
- Collections with `itemType=Command`

**Key Requirements (18 total):**
- Requirement 17-18: Sampling features / FOI references from control stream
- Requirement 19: ControlStream canonical URL
- Requirement 20-21: ControlStream resources endpoints
- Requirement 22-23: ControlStream references from System/Deployment
- Requirement 24: ControlStream collections
- Requirement 25: ControlStream schema operation
- Requirement 26: Command canonical URL
- Requirement 27-28: Command resources endpoints
- Requirement 29: Command references from ControlStream
- Requirement 30: Command collections
- Requirement 31-32: CommandStatus endpoints
- Requirement 33-34: CommandResult endpoints

**Mandatory:** Minimum server MUST implement this OR Datastreams & Observations conformance class

#### 13.4 Conformance Class A.4: Command Feasibility

**Identifier:** `/conf/feasibility`  
**Requirements Class:** `/req/feasibility`  
**Prerequisite:** Conformance class A.3: `/conf/controlstream`  
**Target Type:** Web API

**Resources Defined:**
- Feasibility resources (reuses Command structure)
- Status resources (reuses CommandStatus structure)
- Result resources (reuses CommandResult structure)

**Endpoints Required:**
- Canonical: `/feasibility`, `/feasibility/{id}`
- Nested: `/controlstreams/{csId}/feasibility`
- Nested: `/feasibility/{feasId}/status`
- Nested: `/feasibility/{feasId}/result`

**Collections Support:**
- Collections with `itemType=Feasibility`

**Key Requirements (5 total):**
- Requirement 35: Feasibility canonical URL
- Requirement 36: Feasibility references from ControlStream
- Requirement 37: Feasibility status endpoint
- Requirement 38: Feasibility result endpoint
- Requirement 39: Feasibility collections

**Optional:** Servers MAY implement feasibility channels

#### 13.5 Conformance Class A.5: System Events

**Identifier:** `/conf/system-event`  
**Requirements Class:** `/req/system-event`  
**Prerequisite:** Conformance class A.1: `/conf/api-common`, Part 1 System conformance class  
**Target Type:** Web API

**Resources Defined:**
- SystemEvent resources

**Event Types:**
- Sensor activation
- Recalibration
- Maintenance
- Configuration changes
- Other system events

**Endpoints Required:**
- Canonical: `/systemEvents`, `/systemEvents/{id}`
- Nested: `/systems/{sysId}/events`

**Collections Support:**
- Collections with `itemType=SystemEvent`

**Key Requirements (4 total):**
- Requirement 40: SystemEvent canonical URL
- Requirement 41: SystemEvent resources endpoints
- Requirement 42: Canonical SystemEvent resources endpoint
- Requirement 43: SystemEvent references from System
- Requirement 44: SystemEvent collections

**Optional:** Servers MAY implement system events

#### 13.6 Conformance Class A.6: Advanced Filtering

**Identifier:** `/conf/advanced-filtering`  
**Requirements Class:** `/req/advanced-filtering`  
**Prerequisite:** Part 1 Advanced Filtering conformance class  
**Target Type:** Web API

**Additional Query Parameters:**

**For DataStreams:**
- `phenomenonTime` - Filter by observation phenomenon times
- `resultTime` - Filter by observation result times
- `observedProperty` - Filter by observed properties (ID or URI list)
- `foi` - Filter by feature of interest (transitive)

**For Observations:**
- `phenomenonTime` - Filter by phenomenon time
- `resultTime` - Filter by result time (supports special value `latest`)
- `foi` - Filter by feature of interest

**For ControlStreams:**
- `executionTime` - Filter by command execution times
- `issueTime` - Filter by command issue times (optional)
- `controlledProperty` - Filter by controlled properties (ID or URI list)
- `foi` - Filter by feature of interest (transitive)

**For Commands:**
- `executionTime` - Filter by execution time
- `issueTime` - Filter by issue time
- `foi` - Filter by feature of interest

**For CommandStatus:**
- `statusCode` - Filter by status code (PENDING, ACCEPTED, EXECUTING, COMPLETED, FAILED, CANCELED)

**For SystemEvents:**
- `type` - Filter by event type

**Key Requirements (17 total):**
- Requirement 45-47: DataStream filters (phenomenonTime, resultTime, observedProperty, foi)
- Requirement 48-51: Observation filters (phenomenonTime, resultTime, foi)
- Requirement 52-55: ControlStream filters (issueTime, executionTime, controlledProperty, foi)
- Requirement 56-58: Command filters (issueTime, executionTime, foi)
- Requirement 59-60: CommandStatus filters (statusCode)
- Requirement 61-62: SystemEvent filters (type)

**Optional:** Servers MAY implement advanced filtering

#### 13.7 Conformance Class A.7: Create/Replace/Delete

**Identifier:** `/conf/create-replace-delete`  
**Requirements Class:** `/req/create-replace-delete`  
**Prerequisite:** OGC API - Features Part 4: Create, Replace, Update and Delete  
**Target Type:** Web API

**HTTP Methods Enabled:**
- POST (Create) - Create new resources
- PUT (Replace) - Replace existing resources
- DELETE (Delete) - Delete existing resources

**Resources Supported:**
- DataStreams, Observations
- ControlStreams, Commands, CommandStatus, CommandResult
- Feasibility, Feasibility Status, Feasibility Result
- SystemEvents

**Constraints:**
- DataStream schema changes rejected if observations exist (409)
- ControlStream schema changes rejected if commands exist (409)
- DataStream deletion requires `cascade=true` if observations exist (409 without cascade)
- ControlStream deletion requires `cascade=true` if commands exist (409 without cascade)
- Observation validation against DataStream schema (400 if invalid)
- Command validation against ControlStream schema (400 if invalid)

**Key Requirements (16 total):**
- Requirement 63-65: DataStream operations and constraints
- Requirement 66-67: Observation operations and constraints
- Requirement 68-70: ControlStream operations and constraints
- Requirement 71-72: Command operations and constraints
- Requirement 73-74: CommandStatus and CommandResult operations
- Requirement 75-77: Feasibility operations
- Requirement 78: SystemEvent operations

**Optional:** Servers MAY implement create/replace/delete operations

#### 13.8 Conformance Class A.8: Update

**Identifier:** `/conf/update`  
**Requirements Class:** `/req/update`  
**Prerequisite:** OGC API - Features Part 4: Create, Replace, Update and Delete, Conformance class A.7: `/conf/create-replace-delete`  
**Target Type:** Web API

**HTTP Method Enabled:**
- PATCH (Update) - Partial update using JSON Merge Patch (RFC 7396)

**Resources Supported:**
- DataStreams, Observations
- ControlStreams, Commands, CommandStatus, CommandResult
- Feasibility, Feasibility Status, Feasibility Result
- SystemEvents

**Constraints:**
- Same constraints as Create/Replace/Delete conformance class
- Schema changes rejected if data exists

**Key Requirements (14 total):**
- Requirement 79-80: DataStream update and constraints
- Requirement 81-82: Observation update and constraints
- Requirement 83-84: ControlStream update and constraints
- Requirement 85-86: Command update and constraints
- Requirement 87-88: CommandStatus and CommandResult update
- Requirement 89-91: Feasibility update
- Requirement 92: SystemEvent update

**Optional:** Servers MAY implement update operations

#### 13.9 Additional Encoding Conformance Classes

**A.9: JSON Encoding** (`/conf/json`)
- Mandatory for all servers
- Requirement 93-106: JSON schemas for all resource types

**A.10: SWE Common JSON Encoding** (`/conf/swecommon-json`)
- Optional
- Requirement 107-114: SWE Common JSON for observations/commands

**A.11: SWE Common Text Encoding** (`/conf/swecommon-text`)
- Optional
- Requirement 115-122: SWE Common Text (CSV) for observations/commands

**A.12: SWE Common Binary Encoding** (`/conf/swecommon-binary`)
- Optional
- Requirement 123-130: SWE Common Binary for observations/commands

---

### Examples

Part 2 provides comprehensive examples throughout the specification:

#### 14.1 DataStream Examples

**Simple Temperature DataStream (JSON):**
```json
{
  "type": "DataStream",
  "id": "temp-sensor-01-ds",
  "name": "Temperature Sensor 01 Data",
  "description": "Temperature measurements from sensor 01 in building A",
  "type": "observation",
  "validTime": "2024-01-01T00:00:00Z/2024-12-31T23:59:59Z",
  "phenomenonTime": "2024-01-15T00:00:00Z/2024-01-16T00:00:00Z",
  "resultTime": "2024-01-15T00:00:01Z/2024-01-16T00:00:01Z",
  "observedProperties": ["http://example.org/properties/temperature"],
  "resultType": "measure",
  "live": true,
  "formats": ["application/json", "application/swe+json", "application/swe+binary"],
  "links": [
    {
      "rel": "system",
      "href": "https://api.example.org/systems/temp-sensor-01",
      "title": "Temperature Sensor 01"
    },
    {
      "rel": "observations",
      "href": "https://api.example.org/datastreams/temp-sensor-01-ds/observations",
      "title": "Observations"
    },
    {
      "rel": "schema",
      "href": "https://api.example.org/datastreams/temp-sensor-01-ds/schema?obsFormat=application/json",
      "type": "application/schema+json",
      "title": "Observation Schema"
    }
  ]
}
```

**Multi-Property Weather DataStream:**
```json
{
  "type": "DataStream",
  "id": "weather-station-01-ds",
  "name": "Weather Station 01 Data",
  "observedProperties": [
    "http://example.org/properties/temperature",
    "http://example.org/properties/humidity",
    "http://example.org/properties/pressure",
    "http://example.org/properties/windSpeed",
    "http://example.org/properties/windDirection"
  ],
  "resultType": "record",
  "live": true,
  "formats": ["application/json", "application/swe+json"]
}
```

#### 14.2 Observation Examples

**Simple Scalar Observation:**
```json
{
  "type": "Observation",
  "id": "obs-2024-01-15-120000",
  "datastream@id": "temp-sensor-01-ds",
  "phenomenonTime": "2024-01-15T12:00:00Z",
  "resultTime": "2024-01-15T12:00:01Z",
  "result": 23.5
}
```

**Vector Result Observation:**
```json
{
  "type": "Observation",
  "id": "obs-wind-2024-01-15-120000",
  "datastream@id": "wind-sensor-01-ds",
  "phenomenonTime": "2024-01-15T12:00:00Z",
  "resultTime": "2024-01-15T12:00:01Z",
  "result": [5.2, 45.0, 0.0]  // [speed m/s, direction degrees, vertical m/s]
}
```

**Record Result Observation:**
```json
{
  "type": "Observation",
  "id": "obs-weather-2024-01-15-120000",
  "datastream@id": "weather-station-01-ds",
  "phenomenonTime": "2024-01-15T12:00:00Z",
  "resultTime": "2024-01-15T12:00:01Z",
  "result": {
    "temperature": 23.5,
    "humidity": 65.2,
    "pressure": 101325,
    "windSpeed": 5.2,
    "windDirection": 45.0
  }
}
```

#### 14.3 ControlStream Examples

**UAV PTZ Camera Control:**
```json
{
  "type": "ControlStream",
  "id": "uav-camera-ptz-cs",
  "name": "UAV Camera PTZ Control",
  "description": "Control stream for UAV camera pan/tilt/zoom",
  "type": "self",
  "validTime": "2024-01-01T00:00:00Z/2024-12-31T23:59:59Z",
  "issueTime": "2024-01-15T00:00:00Z/2024-01-16T00:00:00Z",
  "executionTime": "2024-01-15T00:01:00Z/2024-01-16T00:01:00Z",
  "controlledProperties": [
    "http://example.org/properties/pan",
    "http://example.org/properties/tilt",
    "http://example.org/properties/zoom"
  ],
  "live": true,
  "async": true,
  "formats": ["application/json", "application/swe+json"],
  "links": [
    {
      "rel": "system",
      "href": "https://api.example.org/systems/uav-01",
      "title": "UAV-01"
    },
    {
      "rel": "commands",
      "href": "https://api.example.org/controlstreams/uav-camera-ptz-cs/commands",
      "title": "Commands"
    }
  ]
}
```

#### 14.4 Command Examples

**PTZ Camera Command:**
```json
{
  "type": "Command",
  "id": "cmd-ptz-2024-01-15-120000",
  "controlstream@id": "uav-camera-ptz-cs",
  "issueTime": "2024-01-15T12:00:00Z",
  "executionTime": "2024-01-15T12:01:00Z",
  "parameters": {
    "pan": 45.0,
    "tilt": 30.0,
    "zoom": 2.5
  }
}
```

**Satellite Imagery Tasking Command:**
```json
{
  "type": "Command",
  "id": "cmd-sat-task-2024-01-15",
  "controlstream@id": "eo-sat-01-cs",
  "issueTime": "2024-01-15T08:00:00Z",
  "executionTime": "2024-01-16T14:23:00Z",
  "parameters": {
    "targetArea": {
      "type": "Polygon",
      "coordinates": [[
        [-122.5, 37.5],
        [-122.3, 37.5],
        [-122.3, 37.7],
        [-122.5, 37.7],
        [-122.5, 37.5]
      ]]
    },
    "bands": ["red", "green", "blue", "nir"],
    "resolution": 10.0
  }
}
```

#### 14.5 CommandStatus Examples

**Accepted Status:**
```json
{
  "type": "CommandStatus",
  "id": "status-001",
  "command@id": "cmd-sat-task-2024-01-15",
  "reportTime": "2024-01-15T08:00:05Z",
  "executionTime": "2024-01-16T14:23:00Z",
  "statusCode": "ACCEPTED",
  "percentCompletion": 0,
  "message": "Command accepted and scheduled for execution"
}
```

**Executing Status:**
```json
{
  "type": "CommandStatus",
  "id": "status-002",
  "command@id": "cmd-sat-task-2024-01-15",
  "reportTime": "2024-01-16T14:23:15Z",
  "executionTime": "2024-01-16T14:23:00Z",
  "statusCode": "EXECUTING",
  "percentCompletion": 25,
  "message": "Image acquisition in progress (pass 1 of 4)"
}
```

**Completed Status:**
```json
{
  "type": "CommandStatus",
  "id": "status-003",
  "command@id": "cmd-sat-task-2024-01-15",
  "reportTime": "2024-01-16T14:35:42Z",
  "executionTime": "2024-01-16T14:23:00Z",
  "statusCode": "COMPLETED",
  "percentCompletion": 100,
  "message": "Image acquisition completed successfully (4 images)"
}
```

#### 14.6 CommandResult Examples

**Datastream Reference Result:**
```json
{
  "type": "CommandResult",
  "id": "result-001",
  "command@id": "cmd-plume-sim-2024-01-15",
  "datastream@link": {
    "href": "https://api.example.org/datastreams/plume-sim-run-123",
    "title": "Chemical Plume Simulation Run 123",
    "type": "application/json"
  }
}
```

**Observation Reference Result:**
```json
{
  "type": "CommandResult",
  "id": "result-002",
  "command@id": "cmd-uav-photo-2024-01-15",
  "observation@link": [
    {
      "href": "https://api.example.org/observations/obs-image-001",
      "title": "UAV Image 001",
      "type": "image/jpeg"
    }
  ]
}
```

**Inline Result:**
```json
{
  "type": "CommandResult",
  "id": "result-003",
  "command@id": "cmd-system-status-query",
  "inline": {
    "batteryLevel": 87.5,
    "temperature": 45.2,
    "dataStorageUsed": 2345678901,
    "lastMaintenance": "2024-01-10T00:00:00Z"
  }
}
```

#### 14.7 SWE Common Examples

**Observation Schema (SWE Common JSON):**
```json
{
  "type": "DataRecord",
  "fields": [
    {
      "name": "phenomenonTime",
      "type": "Time",
      "definition": "http://www.opengis.net/def/property/OGC/0/SamplingTime",
      "label": "Phenomenon Time",
      "uom": {
        "code": "http://www.opengis.net/def/uom/ISO-8601/0/Gregorian"
      }
    },
    {
      "name": "temperature",
      "type": "Quantity",
      "definition": "http://mmisw.org/ont/cf/parameter/air_temperature",
      "label": "Air Temperature",
      "uom": {
        "code": "Cel"
      }
    }
  ],
  "encoding": {
    "type": "JSONEncoding"
  }
}
```

**Observations (SWE Common Text/CSV):**
```
2024-01-15T12:00:00Z,23.5
2024-01-15T12:01:00Z,23.6
2024-01-15T12:02:00Z,23.4
2024-01-15T12:03:00Z,23.5
2024-01-15T12:04:00Z,23.7
```

---

## Next Steps

**Section 2.1 Complete:** CSAPI Part 2 Standard Document Analysis (6,200+ words documenting all dynamic data operations)

**Ready for Section 2.2:** CSAPI Part 2 OpenAPI Schema Analysis (analyze ogcapi-connectedsystems-2.bundled.oas31.yaml)

**Implementation Ready:** All information needed from standard document extracted and synthesized
