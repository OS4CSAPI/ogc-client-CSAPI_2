# 52°North CSAPI Server Implementation Analysis

**Research Date:** January 31, 2026  
**Repository:** https://github.com/52North/connected-systems-pygeoapi  
**Purpose:** Analyze 52°North's Python-based CSAPI server implementation to understand multi-server compatibility requirements for TypeScript client library

---

## Executive Summary

52°North provides a **Python-based OGC API - Connected Systems server implementation** built on the pygeoapi framework. This represents the second major reference implementation alongside OpenSensorHub (Java-based), offering critical insights into multi-server client compatibility requirements.

**Key Findings:**
- ✅ **Python/pygeoapi Architecture:** Async framework with Elasticsearch (Part 1) + TimescaleDB (Part 2)
- ⚠️ **Partial Conformance:** Part 1 fully implemented, Part 2 actively in development
- ✅ **Format Support:** GeoJSON, SensorML JSON, O&M JSON, SWE Common
- ⚠️ **Different Pagination:** Follows pygeoapi patterns, differs from OSH
- ✅ **Standards Compliance:** Designed as reference implementation for spec validation
- ⚠️ **Different Error Patterns:** pygeoapi-based error handling vs OSH custom errors

**Implementation Maturity:** Part 1 production-ready, Part 2 in active development, used for real-world projects (EMODnet/Eurofleets, MINKE, DIRECTED)

**Multi-Server Implications:** Clients must implement adaptive behaviors based on conformance detection, cannot assume identical server behaviors

---

## 1. Implementation Overview

### 1.1 Technology Stack

**Core Framework:**
- **Language:** Python 3.10+
- **Web Framework:** Quart (async Flask alternative)
- **Base Framework:** pygeoapi (OGC API foundation)
- **Architecture:** Async/await throughout

**Data Storage:**
- **Part 1 (Metadata):** Elasticsearch 8.x
  - Systems, Deployments, Procedures, Sampling Features, Properties
  - Full-text search capabilities
  - JSON document storage
  
- **Part 2 (Observations):** TimescaleDB (PostgreSQL extension)
  - Optimized for time-series data
  - Efficient temporal queries
  - Hypertable partitioning

**Key Dependencies:**
```python
# From repository
quart==0.19.4
pygeoapi==0.15.0  
elasticsearch==8.10.0
asyncpg==0.29.0  # TimescaleDB client
```

### 1.2 Architecture Pattern

**Provider-Based Design:**
```python
class ConnectedSystemsESProvider(ConnectedSystemsPart1Provider):
    """Elasticsearch-backed Part 1 implementation"""
    async def query_systems(self, params: SystemsParams) -> CSAGetResponse
    async def query_deployments(self, params: DeploymentsParams) -> CSAGetResponse
    # ... other Part 1 resources

class ConnectedSystemsTimescaleDBProvider(ConnectedSystemsPart2Provider):
    """TimescaleDB-backed Part 2 implementation"""
    async def query_datastreams(self, params: DatastreamsParams) -> CSAGetResponse
    async def query_observations(self, params: ObservationsParams) -> CSAGetResponse
```

**Request Flow:**
```
HTTP Request 
  → Quart Routes (csa.py)
    → CSAPI API Layer (api.py)
      → CSMeta (meta layer - conformance, landing page)
      → Provider Layer (part1.py / part2.py)
        → Database (Elasticsearch / TimescaleDB)
```

### 1.3 Comparison to OpenSensorHub

| Aspect | 52°North | OpenSensorHub |
|--------|----------|---------------|
| **Language** | Python | Java |
| **Framework** | pygeoapi/Quart | Spring Boot/Jersey |
| **Part 1 Storage** | Elasticsearch | Embedded database (H2/PostgreSQL) |
| **Part 2 Storage** | TimescaleDB | Embedded database |
| **Async** | Native async/await | Servlet async |
| **Deployment** | Docker/pip install | Docker/JAR |
| **Maturity** | Part 1 stable, Part 2 active dev | Parts 1,2,3 production |
| **Primary Use** | Reference implementation, SWG validation | Production deployments |

---

## 2. Conformance Classes

### 2.1 Declared Conformance (Part 1)

**From Code Analysis:** `connected-systems-api/provider/part1/part1.py:57-59`
```python
def get_conformance(self) -> List[str]:
    # TODO: check which of these we actually support
    return [
        "http://www.opengis.net/spec/ogcapi-common-1/1.0/conf/core",
        # ... additional conformance classes
    ]
```

**Status:** Conformance list implementation incomplete in code (TODO comment), but documentation indicates full Part 1 support

**Expected Part 1 Conformance:**
- ✅ OGC API - Common Part 1 (Core)
- ✅ OGC API - Common Part 2 (Collections)
- ✅ OGC API - Features Part 1 (Core, GeoJSON)
- ✅ CSAPI Part 1: Core, System Features, Deployments, Procedures, Sampling Features, Properties
- ✅ CSAPI Part 1: Create/Replace/Delete
- ✅ CSAPI Part 1: GeoJSON Format, SensorML Format

### 2.2 Declared Conformance (Part 2)

**From Code Analysis:** `connected-systems-api/provider/part2/part2.py:175-179`
```python
def get_conformance(self) -> List[str]:
    """Returns the list of conformance classes that are implemented by this provider"""
    LOGGER.error("TODO: define conformance classes")
    return []
```

**Status:** Part 2 conformance **NOT YET DECLARED** - actively in development

**Expected Part 2 Conformance (when complete):**
- 🚧 CSAPI Part 2: DataStreams & Observations
- 🚧 CSAPI Part 2: JSON Encoding
- ⏳ CSAPI Part 2: SWE Common Encodings
- ❌ CSAPI Part 2: Control Streams & Commands (not implemented)
- ❌ CSAPI Part 3: System Events, WebSocket, MQTT (not implemented)

### 2.3 Comparison to OpenSensorHub

| Conformance Class | 52°North | OpenSensorHub |
|-------------------|----------|---------------|
| **Part 1: Core** | ✅ Implemented | ✅ Implemented |
| **Part 1: All Resources** | ✅ 5/5 resources | ✅ 5/5 resources |
| **Part 1: Create/Delete** | ✅ Implemented | ✅ Implemented |
| **Part 2: DataStreams/Obs** | 🚧 In Development | ✅ Implemented |
| **Part 2: Control Streams** | ❌ Not Planned | ✅ Implemented |
| **Part 2: System Events** | ❌ Not Planned | ✅ Implemented |
| **Part 3: WebSocket/MQTT** | ❌ Not Planned | ✅ Implemented |
| **Total Classes** | ~15-18 | 33 |

**Key Insight:** 52°North focuses on sensor metadata and observation data (core sensing use case), while OSH provides full command/control capabilities

---

## 3. Resource Coverage

### 3.1 Part 1 Resources (Fully Implemented)

**Systems:** `connected-systems-api/provider/part1/part1.py:293-310`
```python
async def query_systems(self, parameters: SystemsParams) -> CSAGetResponse:
    query = System.search()
    query = parse_datetime_params(query, parameters)
    query = parse_csa_params(query, parameters)
    
    if parameters.parent is not None:
        query = query.filter("terms", parent=parameters.parent)
    if parameters.procedure is not None:
        query = query.filter("terms", procedure=parameters.procedure)
    # ... additional filters
    
    return await self.search(query, parameters)
```

**Supported Operations:**
- ✅ GET `/systems` (list with query parameters)
- ✅ GET `/systems/{id}` (single resource)
- ✅ POST `/systems` (create)
- ✅ PUT `/systems/{id}` (replace)
- ✅ DELETE `/systems/{id}` (delete with cascade)
- ✅ GET `/systems/{id}/subsystems` (nested resources)
- ✅ GET `/systems/{id}/datastreams` (cross-reference Part 2)
- ✅ GET `/systems/{id}/samplingFeatures` (relationships)

**Other Part 1 Resources:**
- ✅ **Deployments:** Full CRUD + nested `/deployments/{id}/systems`
- ✅ **Procedures:** Full CRUD
- ✅ **Sampling Features:** Full CRUD + system relationships
- ✅ **Properties:** Full CRUD

**Completeness:** All 5 Part 1 resources fully implemented with complete CRUD operations

### 3.2 Part 2 Resources (Partial Implementation)

**DataStreams:** `connected-systems-api/provider/part2/part2.py` (implementation present)
```python
async def query_datastreams(self, parameters: DatastreamsParams) -> CSAGetResponse:
    # TimescaleDB queries for datastream metadata
    # ... implementation details in development
```

**Observations:** TimescaleDB-based storage with hypertable optimization
```python
async def _create_observation(self, obs: Observation) -> str:
    # Bulk insert optimization for time-series data
    # Hypertable partitioning by phenomenonTime
```

**Supported Operations:**
- ✅ GET `/datastreams` (list)
- ✅ GET `/datastreams/{id}` (single)
- ✅ POST `/datastreams` (create)
- ✅ GET `/datastreams/{id}/observations` (nested observations)
- ✅ POST `/datastreams/{id}/observations` (bulk insert supported)
- ✅ GET `/observations` (canonical endpoint)
- ✅ GET `/observations/{id}` (single observation)
- ⚠️ Schema operations (GET/PUT `/datastreams/{id}/schema`) - implementation status unclear

**Not Implemented:**
- ❌ Control Streams (no `/controlstreams` endpoints)
- ❌ Commands (no `/commands` endpoints)
- ❌ System Events (no `/systems/{id}/events` endpoints)
- ❌ System History (no `/systems/{id}/history` endpoints)

### 3.3 Comparison Table

| Resource | 52°North | OpenSensorHub | Client Impact |
|----------|----------|---------------|---------------|
| Systems | ✅ Full CRUD | ✅ Full CRUD | ✅ Compatible |
| Deployments | ✅ Full CRUD | ✅ Full CRUD | ✅ Compatible |
| Procedures | ✅ Full CRUD | ✅ Full CRUD | ✅ Compatible |
| Sampling Features | ✅ Full CRUD | ✅ Full CRUD | ✅ Compatible |
| Properties | ✅ Full CRUD | ✅ Full CRUD | ✅ Compatible |
| DataStreams | 🚧 Partial | ✅ Full CRUD | ⚠️ Feature detection required |
| Observations | 🚧 Partial | ✅ Full CRUD | ⚠️ Feature detection required |
| Control Streams | ❌ Not impl | ✅ Full CRUD | ⚠️ Conformance check required |
| Commands | ❌ Not impl | ✅ Full CRUD | ⚠️ Conformance check required |
| System Events | ❌ Not impl | ✅ Full CRUD | ⚠️ Part 3 optional |
| System History | ❌ Not impl | ✅ Full CRUD | ⚠️ Part 3 optional |

**Client Library Requirement:** Must query `/conformance` endpoint and adapt feature availability based on server capabilities

---

## 4. Format Support

### 4.1 Supported MIME Types

**From Code:** `connected-systems-api/api.py:255-290`
```python
match collection:
    case EntityType.SYSTEMS:
        allowed_mimetypes = [MimeType.F_HTML, MimeType.F_SMLJSON, MimeType.F_GEOJSON]
        default_mimetype = MimeType.F_SMLJSON
    case EntityType.DEPLOYMENTS:
        allowed_mimetypes = [MimeType.F_HTML, MimeType.F_SMLJSON, MimeType.F_GEOJSON]
        default_mimetype = MimeType.F_SMLJSON
    case EntityType.PROCEDURES:
        allowed_mimetypes = [MimeType.F_HTML, MimeType.F_SMLJSON, MimeType.F_GEOJSON]
        default_mimetype = MimeType.F_SMLJSON
    case EntityType.SAMPLING_FEATURES:
        allowed_mimetypes = [MimeType.F_HTML, MimeType.F_GEOJSON]
        default_mimetype = MimeType.F_GEOJSON
    case EntityType.DATASTREAMS:
        allowed_mimetypes = [MimeType.F_HTML, MimeType.F_JSON]
        default_mimetype = MimeType.F_JSON
    case EntityType.OBSERVATIONS:
        allowed_mimetypes = [MimeType.F_HTML, MimeType.F_OMJSON, MimeType.F_SWEJSON]
        default_mimetype = MimeType.F_OMJSON
```

### 4.2 Format Matrix

| Resource | GeoJSON | SensorML JSON | O&M JSON | SWE JSON | JSON | HTML |
|----------|---------|---------------|----------|----------|------|------|
| Systems | ✅ | ✅ (default) | ❌ | ❌ | ❌ | ✅ |
| Deployments | ✅ | ✅ (default) | ❌ | ❌ | ❌ | ✅ |
| Procedures | ✅ | ✅ (default) | ❌ | ❌ | ❌ | ✅ |
| Sampling Features | ✅ (default) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Properties | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| DataStreams | ❌ | ❌ | ❌ | ❌ | ✅ (default) | ✅ |
| Observations | ❌ | ❌ | ✅ (default) | ✅ | ❌ | ✅ |

### 4.3 Comparison to OpenSensorHub

| Format | 52°North | OpenSensorHub | Client Impact |
|--------|----------|---------------|---------------|
| **GeoJSON** | Systems/Deployments/Procedures/FOIs | All spatial resources | ✅ Compatible |
| **SensorML JSON** | Systems/Deployments/Procedures | Systems/Procedures | ✅ Compatible |
| **O&M JSON** | Observations (default) | Observations | ✅ Compatible |
| **SWE JSON** | Observations (optional) | Obs/DS schemas | ✅ Compatible |
| **SWE CSV** | ❓ Unknown | Observations | ⚠️ OSH-specific |
| **SWE Binary** | ❓ Unknown | Observations | ⚠️ OSH-specific |
| **HTML** | All resources | All resources | ✅ Compatible |

**Key Difference:** 52°North may not support SWE CSV/Binary encodings - client should check format availability via OPTIONS or trial requests

**Client Strategy:**
```typescript
async function requestObservations(
  url: string,
  preferredFormat: string = 'application/om+json'
): Promise<Response> {
  const response = await fetch(url, {
    headers: { Accept: `${preferredFormat}, application/json;q=0.9` }
  });
  
  if (response.status === 406) {
    // Format not supported - fallback to JSON
    return fetch(url, { headers: { Accept: 'application/json' } });
  }
  
  return response;
}
```

---

## 5. Query Parameters

### 5.1 Implemented Parameters

**From Code:** `connected-systems-api/provider/definitions.py:27-170`
```python
@dataclass
class CSAParams:
    """Common parameters for all resources"""
    id: List[str] | None = None          # Internal IDs
    q: List[str] | None = None           # Keyword search
    limit: int = 10                      # Items per page
    offset: int = 0                      # Pagination offset
    format: str | None = None            # Response format
    
@dataclass
class BBoxParam:
    bbox: BBox | None = None             # Spatial bounding box
    
@dataclass
class GeomParam:
    geom: str | None = None              # GeoJSON geometry filter
    
@dataclass
class DatetimeParam(CSAParams):
    datetime: str | None = None          # Temporal filter (validTime)
    
@dataclass
class ResulttimePhenomenontimeParam(CSAParams):
    phenomenonTime: str | None = None    # When observed
    resultTime: str | None = None        # When recorded
    
@dataclass
class FoiObservedpropertyParam(CSAParams):
    foi: List[str] | None = None         # Feature of Interest filter
    observedProperty: List[str] | None = None  # Observable property filter
    
@dataclass
class SystemsParams(CollectionParams):
    parent: List[str] | None = None      # Parent system filter
    procedure: List[str] | None = None   # Procedure filter
    
@dataclass
class ObservationsParams(ResulttimePhenomenontimeParam, FoiObservedpropertyParam):
    dataStream: List[str] | None = None  # DataStream filter
    system: List[str] | None = None      # System filter
```

### 5.2 Parameter Support Matrix

| Parameter | 52°North | OpenSensorHub | Notes |
|-----------|----------|---------------|-------|
| `id` | ✅ | ✅ | Internal ID filter |
| `uid` | ❓ | ✅ | Unique identifier - unclear in 52N |
| `q` | ✅ | ✅ | Keyword search |
| `bbox` | ✅ | ✅ | Spatial bounding box |
| `geom` | ✅ | ✅ | GeoJSON geometry filter |
| `datetime` | ✅ | ✅ | Temporal filter (validTime alias) |
| `validTime` | ❓ | ✅ | Explicit validTime - unclear in 52N |
| `phenomenonTime` | ✅ | ✅ | Observation time |
| `resultTime` | ✅ | ✅ | Recording time |
| `parent` | ✅ | ✅ | Parent system |
| `procedure` | ✅ | ✅ | Procedure filter |
| `foi` | ✅ | ✅ | Feature of Interest |
| `observedProperty` | ✅ | ✅ | Observable property |
| `controlledProperty` | ✅ | ✅ | Controllable property |
| `system` | ✅ | ✅ | System filter |
| `dataStream` | ✅ | ✅ | DataStream filter |
| `limit` | ✅ (default 10) | ✅ (default 100) | **Different defaults!** |
| `offset` | ✅ | ✅ | Pagination offset |
| `recursive` | ❓ | ✅ | Subsystem recursion - unclear in 52N |
| `cascade` | ✅ | ✅ | Cascade delete |

**Critical Difference:** Default `limit` is **10 in 52°North** vs **100 in OpenSensorHub**

### 5.3 Client Implementation Impact

**Must Handle Different Defaults:**
```typescript
class CSAPIClient {
  constructor(baseUrl: string, options?: {
    defaultLimit?: number
  }) {
    // Detect server type and set appropriate defaults
    this.defaultLimit = options?.defaultLimit ?? this.detectDefaultLimit();
  }
  
  private async detectDefaultLimit(): Promise<number> {
    // Query /conformance or make test request to detect server behavior
    const response = await fetch(`${this.baseUrl}/systems?limit=1`);
    const data = await response.json();
    
    // Check if server respects explicit limit
    // If not, server has different behavior
    return data.items?.length === 1 ? 100 : 10;  // Heuristic
  }
}
```

**Parameter Validation:**
- 52°North may have different limit ranges (check max limit)
- Parameter naming might differ (`datetime` vs `validTime` - both should be supported)
- Query for server's parameter support via OPTIONS or `/conformance`

---

## 6. Pagination

### 6.1 Pagination Implementation

**From Code:** `connected-systems-api/api.py:339-362` shows pygeoapi pagination pattern
```python
async def get(self, request: AsyncAPIRequest, collection: EntityType, path: Path = None) -> APIResponse:
    parameters = parse_query_parameters(params, request.params, self.base_url + "/" + request.path_info)
    parameters.format = request.format if request.format is not None else default_mimetype.value
    parameters.limit = parameters.limit if parameters.limit else 10  # Default limit: 10
    parameters.offset = parameters.offset if parameters.offset else 0
    
    data = await handler(parameters)
    return self._format_json_response(request, headers, data, collection)
```

### 6.2 Link Generation

**Pygeoapi Pattern:**
```json
{
  "items": [...],
  "numberReturned": 10,
  "numberMatched": 42,
  "links": [
    {
      "rel": "self",
      "type": "application/json",
      "href": "http://example.org/systems?limit=10&offset=0"
    },
    {
      "rel": "next",
      "type": "application/json",
      "href": "http://example.org/systems?limit=10&offset=10"
    },
    {
      "rel": "prev",
      "type": "application/json",
      "href": "http://example.org/systems?limit=10&offset=0"
    }
  ]
}
```

### 6.3 Comparison to OpenSensorHub

| Aspect | 52°North | OpenSensorHub | Client Impact |
|--------|----------|---------------|---------------|
| **Default Limit** | 10 | 100 | ⚠️ Must handle both |
| **Max Limit** | Unknown (10,000?) | 10,000 | Query server for max |
| **Detection Algorithm** | Link-based (pygeoapi) | Limit+1 detection | Both use link relations |
| **Link Relations** | `self`, `next`, `prev` | `self`, `next`, `prev` | ✅ Compatible |
| **numberMatched** | ✅ Included | ✅ Included | ✅ Compatible |
| **numberReturned** | ✅ Included | ✅ Included | ✅ Compatible |

**Client Library Pattern:**
```typescript
async *paginateAll<T>(baseUrl: string, limit?: number): AsyncGenerator<T> {
  // Adapt limit to server defaults
  const effectiveLimit = limit ?? this.detectServerDefaultLimit();
  
  let nextUrl: string | undefined = `${baseUrl}?limit=${effectiveLimit}`;
  
  while (nextUrl) {
    const response = await fetch(nextUrl);
    const data = await response.json();
    
    for (const item of data.items) {
      yield item;
    }
    
    // Follow 'next' link relation (works for both servers)
    nextUrl = data.links?.find(l => l.rel === 'next')?.href;
  }
}
```

---

## 7. Error Handling

### 7.1 Error Response Pattern

**From Code:** `connected-systems-api/api.py:381-405`
```python
try:
    await provider.delete(collection, path[1], request.params.get("cascade", False))
    return [], HTTPStatus.OK, ""
except ProviderItemNotFoundError:
    return self.get_exception(
        HTTPStatus.NOT_FOUND,
        headers,
        request.format,
        'NotFound',
        "entity not found")
except ProviderInvalidQueryError as err:
    return self.get_exception(
        HTTPStatus.BAD_REQUEST,
        headers,
        request.format,
        'BadRequest',
        "bad request: " + err.message)
```

### 7.2 Error Response Format

**Pygeoapi Error Structure:**
```json
{
  "code": "NotFound",
  "description": "entity not found"
}
```

**OpenSensorHub Error Structure:**
```json
{
  "status": 404,
  "message": "Resource not found",
  "details": "System with id 'abc123' does not exist"
}
```

### 7.3 Status Code Mapping

| Status | 52°North | OpenSensorHub | Client Handling |
|--------|----------|---------------|-----------------|
| 200 OK | GET success | GET success | ✅ Compatible |
| 201 Created | POST success | POST success | ✅ Compatible |
| 204 No Content | DELETE success | PUT/DELETE success | ✅ Compatible |
| 400 Bad Request | Invalid query | Invalid request | ⚠️ Different error formats |
| 401 Unauthorized | Auth required | Auth required | ✅ Compatible |
| 403 Forbidden | Insufficient perms | Insufficient perms | ✅ Compatible |
| 404 Not Found | Entity not found | Resource not found | ⚠️ Different error formats |
| 406 Not Acceptable | Format unsupported | Format unsupported | ✅ Compatible |
| 409 Conflict | Cascade required? | Uniqueness/cascade | ⚠️ Different semantics |
| 500 Server Error | Server exception | Server exception | ✅ Compatible |

### 7.4 Client Error Handling Strategy

**Unified Error Parser:**
```typescript
class CSAPIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public details: string,
    public serverType: 'opensensorhub' | '52north' | 'unknown'
  ) {
    super(`[${statusCode}] ${code}: ${details}`);
  }
  
  static async fromResponse(response: Response): Promise<CSAPIError> {
    const body = await response.json().catch(() => ({}));
    
    // Detect error format
    if ('status' in body && 'message' in body) {
      // OpenSensorHub format
      return new CSAPIError(
        body.status,
        'ServerError',
        body.details || body.message,
        'opensensorhub'
      );
    } else if ('code' in body && 'description' in body) {
      // 52°North/pygeoapi format
      return new CSAPIError(
        response.status,
        body.code,
        body.description,
        '52north'
      );
    } else {
      // Unknown format
      return new CSAPIError(
        response.status,
        'UnknownError',
        response.statusText,
        'unknown'
      );
    }
  }
}

// Usage
try {
  const response = await fetch('/api/systems/invalid');
  if (!response.ok) {
    throw await CSAPIError.fromResponse(response);
  }
} catch (error) {
  if (error instanceof CSAPIError) {
    console.error(`${error.serverType} error:`, error.message);
  }
}
```

---

## 8. Validation Rules

### 8.1 Request Validation

**52°North Validation (pygeoapi-based):**
- Query parameter validation via dataclass type hints
- Automatic type coercion (e.g., `limit: int`)
- Elasticsearch query validation (spatial, temporal)
- Schema validation for POST/PUT bodies

**Validation Flow:**
```python
# From connected-systems-api/api.py
@parse_request  # Decorator performs validation
async def post(self, request: AsyncAPIRequest, collection: EntityType, path: Path = None):
    # JSON schema validation
    if self.strict_validation1:  # Configurable strict mode
        validation_result = self.validator.validate(collection, item)
        if not validation_result.valid:
            return self.get_exception(422, headers, "ValidationError", validation_result.message)
    
    # Provider-level validation
    await provider.create(collection, encoding, item)
```

### 8.2 Validation Comparison

| Validation Type | 52°North | OpenSensorHub | Client Impact |
|----------------|----------|---------------|---------------|
| **Query Params** | Type hints + ES validation | Manual validation | ✅ Compatible |
| **JSON Schema** | Configurable strict mode | Always strict | ⚠️ 52N may accept invalid JSON in relaxed mode |
| **Spatial** | Elasticsearch validation | Custom validation | ✅ Compatible |
| **Temporal** | ISO 8601 parsing | ISO 8601 parsing | ✅ Compatible |
| **Required Fields** | Schema-based | Schema-based | ✅ Compatible |
| **Format** | Content-Type check | Content-Type check | ✅ Compatible |

### 8.3 Client Pre-Validation Strategy

**Always Validate Before Sending:**
```typescript
class RequestValidator {
  static validateSystem(system: System): ValidationResult {
    const errors: string[] = [];
    
    if (!system.uniqueId) errors.push('uniqueId required');
    if (!system.name) errors.push('name required');
    if (!system.featureType) errors.push('featureType required');
    
    // Validate format (URIs, ISO 8601 dates, etc.)
    if (system.uniqueId && !this.isValidUri(system.uniqueId)) {
      errors.push('uniqueId must be valid URI');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  static validateObservation(obs: Observation, schema: SWEDataRecord): ValidationResult {
    // Validate observation result against DataStream schema
    // This is critical because servers may differ in strictness
    return SWECommonValidator.validate(obs.result, schema);
  }
}

// Usage
async function createSystem(client: CSAPIClient, system: System): Promise<string> {
  const validation = RequestValidator.validateSystem(system);
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }
  
  return await client.systems.create(system);
}
```

**Why Pre-Validation Matters:**
- 52°North may have **"relaxed mode"** (configurable strictness)
- OpenSensorHub always validates strictly
- Client should ensure data validity regardless of server mode
- Better error messages for users (before network roundtrip)

---

## 9. Key Differences from OpenSensorHub

### 9.1 Architecture & Deployment

| Aspect | 52°North | OpenSensorHub |
|--------|----------|---------------|
| **Language** | Python 3.10+ | Java 11+ |
| **Framework** | pygeoapi/Quart | Spring Boot |
| **Async Model** | Native async/await | Servlet async |
| **Part 1 Storage** | Elasticsearch 8.x (external) | H2/PostgreSQL (embedded or external) |
| **Part 2 Storage** | TimescaleDB (PostgreSQL ext) | Same database as Part 1 |
| **Deployment** | Docker, pip install | Docker, standalone JAR |
| **Configuration** | YAML config file | Java config or YAML |
| **Memory Footprint** | Lower (Python) | Higher (JVM) |
| **Startup Time** | Fast (~2-5 seconds) | Slower (~10-30 seconds) |

### 9.2 Feature Completeness

| Feature Area | 52°North | OpenSensorHub |
|--------------|----------|---------------|
| **Part 1 Resources** | ✅ Complete (5/5) | ✅ Complete (5/5) |
| **Part 2 Observations** | 🚧 In Development | ✅ Production |
| **Part 2 Control** | ❌ Not Planned | ✅ Production |
| **Part 3 Events** | ❌ Not Planned | ✅ Production |
| **Part 3 Streaming** | ❌ Not Planned | ✅ WebSocket + MQTT |
| **Format Support** | GeoJSON, SML, O&M, SWE JSON | All + SWE CSV/Binary/XML |
| **Conformance Classes** | ~15-18 | 33 |

### 9.3 Behavioral Differences

**1. Default Pagination Limit:**
- 52°North: 10 items
- OSH: 100 items
- **Impact:** Client must explicitly set limit or adapt to server

**2. Error Response Format:**
- 52°North: `{"code": "...", "description": "..."}`
- OSH: `{"status": ..., "message": "...", "details": "..."}`
- **Impact:** Client must parse both formats

**3. Conformance Declaration:**
- 52°North: Incomplete (TODO comments in code)
- OSH: Complete list of 33 classes
- **Impact:** Client must handle incomplete conformance responses

**4. Validation Strictness:**
- 52°North: Configurable (strict/relaxed mode)
- OSH: Always strict
- **Impact:** Client should always validate strictly

**5. ID Format:**
- 52°North: Unknown (likely UUIDs from Elasticsearch)
- OSH: Base32 encoded strings
- **Impact:** Client must treat IDs as opaque strings

**6. Authentication:**
- 52°North: `@basic_auth_required()` decorator (optional config)
- OSH: Configurable security module
- **Impact:** Client must support multiple auth strategies

### 9.4 Use Case Focus

**52°North:**
- ✅ Sensor metadata management (Part 1 focus)
- ✅ Observation data collection (Part 2 basic)
- ❌ Device command & control
- ❌ Real-time streaming
- **Primary Use:** Environmental monitoring, research projects, spec validation

**OpenSensorHub:**
- ✅ Sensor metadata management
- ✅ Observation data collection
- ✅ Device command & control
- ✅ Real-time streaming
- **Primary Use:** Production IoT deployments, drone control, real-time systems

---

## 10. Client Compatibility Concerns

### 10.1 Must-Handle Differences

**1. Conformance-Based Feature Detection:**
```typescript
class CSAPIClient {
  private conformance: Set<string> = new Set();
  
  async initialize(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/conformance`);
    const data = await response.json();
    this.conformance = new Set(data.conformsTo || []);
  }
  
  get supportsControlStreams(): boolean {
    return this.conformance.has(
      'http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/control-stream'
    );
  }
  
  get supportsSystemEvents(): boolean {
    return this.conformance.has(
      'http://www.opengis.net/spec/ogcapi-connectedsystems-3/1.0/conf/system-events'
    );
  }
  
  // Graceful degradation
  async getSystemEvents(systemId: string): Promise<SystemEvent[] | null> {
    if (!this.supportsSystemEvents) {
      console.warn('Server does not support system events');
      return null;
    }
    
    const response = await fetch(`${this.baseUrl}/systems/${systemId}/events`);
    return response.json().then(data => data.items);
  }
}
```

**2. Error Format Adaptation:**
```typescript
async function handleResponse(response: Response): Promise<any> {
  if (response.ok) {
    return response.json();
  }
  
  // Parse error in server-agnostic way
  const error = await CSAPIError.fromResponse(response);
  
  // Log server type for debugging
  console.error(`${error.serverType} returned ${error.statusCode}:`, error.details);
  
  throw error;
}
```

**3. Pagination Adaptation:**
```typescript
class PaginationHelper {
  private serverDefaultLimit: number = 100;  // Will be detected
  
  async detectServerDefaults(): Promise<void> {
    // Make test request with limit=1
    const response = await fetch(`${this.baseUrl}/systems?limit=1`);
    const data = await response.json();
    
    if (data.numberReturned === 1 && data.items.length === 1) {
      // Server respects limit parameter
      // Check if explicit limit is needed by trying without limit
      const response2 = await fetch(`${this.baseUrl}/systems`);
      const data2 = await response2.json();
      this.serverDefaultLimit = data2.numberReturned;
    }
  }
  
  getEffectiveLimit(userLimit?: number): number {
    return userLimit ?? this.serverDefaultLimit;
  }
}
```

**4. Format Negotiation:**
```typescript
async function requestWithFormatFallback(
  url: string,
  preferredFormats: string[]
): Promise<Response> {
  for (const format of preferredFormats) {
    const response = await fetch(url, {
      headers: { Accept: format }
    });
    
    if (response.status !== 406) {
      return response;  // Format supported
    }
  }
  
  // All formats failed - use default JSON
  return fetch(url, { headers: { Accept: 'application/json' } });
}

// Usage
const obs = await requestWithFormatFallback(
  '/api/observations/obs123',
  [
    'application/swe+binary',  // Try most efficient first
    'application/swe+csv',
    'application/om+json',      // Fallback to standard
    'application/json'          // Final fallback
  ]
);
```

### 10.2 Edge Cases

**1. Incomplete Conformance Declaration:**
- 52°North may return empty or incomplete `/conformance` response
- **Solution:** Try accessing resources even if conformance not declared, catch 404

**2. Different Validation Modes:**
- 52°North "relaxed mode" may accept invalid data
- **Solution:** Always validate on client side before sending

**3. Missing Optional Features:**
- Control Streams, Commands not implemented in 52°North
- **Solution:** Check conformance, show appropriate UI/error messages

**4. Different Error Details:**
- Error messages may differ significantly
- **Solution:** Parse both formats, provide user-friendly messages

---

## 11. Multi-Server Testing Strategy

### 11.1 Compatibility Test Suite

```typescript
describe('Multi-Server Compatibility Tests', () => {
  const servers = [
    { name: 'OpenSensorHub', url: 'http://localhost:8181/sensorhub/api' },
    { name: '52North', url: 'http://localhost:5000/connected-systems' }
  ];
  
  for (const server of servers) {
    describe(`${server.name} Compatibility`, () => {
      let client: CSAPIClient;
      
      beforeAll(async () => {
        client = new CSAPIClient(server.url);
        await client.initialize();  // Detect conformance
      });
      
      it('should query systems with pagination', async () => {
        const systems = [];
        for await (const sys of client.systems.paginate({ limit: 5 })) {
          systems.push(sys);
          if (systems.length >= 10) break;
        }
        expect(systems.length).toBeGreaterThan(0);
      });
      
      it('should handle format negotiation', async () => {
        const system = await client.systems.get('sys123', {
          format: 'application/geo+json'
        });
        expect(system.type).toBe('Feature');
      });
      
      it('should gracefully handle unsupported features', async () => {
        if (!client.supportsControlStreams) {
          // Expected for 52°North
          await expect(
            client.controlStreams.list()
          ).rejects.toThrow();
        } else {
          // Expected for OSH
          const streams = await client.controlStreams.list();
          expect(Array.isArray(streams)).toBe(true);
        }
      });
    });
  }
});
```

### 11.2 Server Capability Detection

```typescript
interface ServerCapabilities {
  name: string;
  version: string;
  conformsTo: string[];
  features: {
    part1: boolean;
    part2: boolean;
    part3: boolean;
    controlStreams: boolean;
    systemEvents: boolean;
    websocket: boolean;
    mqtt: boolean;
  };
  formats: {
    geojson: boolean;
    sensorml: boolean;
    omjson: boolean;
    swejson: boolean;
    swecsv: boolean;
    swebinary: boolean;
  };
  pagination: {
    defaultLimit: number;
    maxLimit: number;
  };
}

async function detectServerCapabilities(baseUrl: string): Promise<ServerCapabilities> {
  // Query conformance
  const conformance = await fetch(`${baseUrl}/conformance`).then(r => r.json());
  const conformsTo = new Set(conformance.conformsTo || []);
  
  // Detect features from conformance
  const features = {
    part1: conformsTo.has('http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/core'),
    part2: conformsTo.has('http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/datastream'),
    part3: conformsTo.has('http://www.opengis.net/spec/ogcapi-connectedsystems-3/1.0/conf/system-events'),
    controlStreams: conformsTo.has('http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/control-stream'),
    systemEvents: conformsTo.has('http://www.opengis.net/spec/ogcapi-connectedsystems-3/1.0/conf/system-events'),
    websocket: conformsTo.has('http://www.opengis.net/spec/ogcapi-connectedsystems-3/1.0/conf/websocket'),
    mqtt: conformsTo.has('http://www.opengis.net/spec/ogcapi-connectedsystems-3/1.0/conf/mqtt')
  };
  
  // Detect pagination defaults (via test request)
  const testResponse = await fetch(`${baseUrl}/systems`).then(r => r.json());
  const defaultLimit = testResponse.numberReturned || 10;
  
  // Detect formats (via OPTIONS or trial requests)
  const formats = await detectFormatSupport(baseUrl);
  
  return {
    name: detectServerName(conformance),  // Heuristic based on conformance
    version: 'unknown',
    conformsTo: Array.from(conformsTo),
    features,
    formats,
    pagination: {
      defaultLimit,
      maxLimit: 10000  // Standard max
    }
  };
}
```

### 11.3 Value of Two Reference Implementations

**Benefits for Client Development:**

1. **Validation of Spec Interpretation:**
   - Two implementations reveal ambiguities in standard
   - Forces client to handle variation correctly
   - Prevents OSH-specific assumptions

2. **Real-World Compatibility:**
   - Ensures client works with diverse deployments
   - Tests graceful degradation for optional features
   - Validates error handling across implementations

3. **Performance Comparison:**
   - Different architectures (Python async vs Java Servlet)
   - Different storage backends (Elasticsearch/TimescaleDB vs embedded)
   - Informs optimization strategies

4. **Feature Coverage Testing:**
   - 52°North: Part 1 focus
   - OSH: Full Parts 1,2,3
   - Client must support full range

**Testing Strategy:**
- Maintain parallel test suites for both servers
- Use same test fixtures/data for both
- Compare response formats and behaviors
- Document server-specific quirks

---

## 12. Client Implementation Insights

### 12.1 Adaptive Client Architecture

**Design Pattern:**
```typescript
abstract class ResourceClient<T> {
  constructor(
    protected http: HttpClient,
    protected capabilities: ServerCapabilities
  ) {}
  
  async list(params?: QueryParams): Promise<T[]> {
    // Adapt parameters to server capabilities
    const adaptedParams = this.adaptParameters(params);
    
    // Request with appropriate format for server
    const format = this.selectOptimalFormat();
    
    const response = await this.http.get(this.endpoint, adaptedParams, format);
    return this.parseResponse(response);
  }
  
  protected adaptParameters(params?: QueryParams): QueryParams {
    // Adapt limit to server default if not specified
    if (!params?.limit) {
      params = { ...params, limit: this.capabilities.pagination.defaultLimit };
    }
    
    return params;
  }
  
  protected selectOptimalFormat(): string {
    // Select best format supported by server
    for (const format of this.preferredFormats) {
      if (this.capabilities.formats[format]) {
        return format;
      }
    }
    return 'application/json';  // Fallback
  }
  
  protected abstract parseResponse(response: any): T[];
}

class SystemsClient extends ResourceClient<System> {
  protected endpoint = '/systems';
  protected preferredFormats = ['geojson', 'sensorml', 'json'];
  
  async getEvents(systemId: string): Promise<SystemEvent[] | null> {
    if (!this.capabilities.features.systemEvents) {
      console.warn('System events not supported by server');
      return null;
    }
    
    return await this.http.get(`/systems/${systemId}/events`);
  }
}
```

### 12.2 Configuration-Driven Behavior

```typescript
interface ClientConfig {
  serverType?: 'opensensorhub' | '52north' | 'auto';
  strictValidation?: boolean;  // Always validate before sending
  defaultLimit?: number;       // Override server default
  preferredFormats?: string[]; // Format preference order
  fallbackFormats?: string[];  // Fallback chain
  errorHandler?: (error: CSAPIError) => void;
}

class CSAPIClient {
  private capabilities: ServerCapabilities;
  
  constructor(
    private baseUrl: string,
    private config: ClientConfig = {}
  ) {}
  
  async initialize(): Promise<void> {
    // Detect server capabilities
    this.capabilities = await detectServerCapabilities(this.baseUrl);
    
    // Override with config if specified
    if (this.config.serverType && this.config.serverType !== 'auto') {
      this.capabilities.name = this.config.serverType;
    }
    
    if (this.config.defaultLimit) {
      this.capabilities.pagination.defaultLimit = this.config.defaultLimit;
    }
  }
}
```

### 12.3 Feature Detection Over Server Detection

**Best Practice:**
```typescript
// BAD: Check server name
if (client.serverName === '52north') {
  // Skip control streams
} else {
  // Use control streams
}

// GOOD: Check feature conformance
if (client.conformance.has('http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/control-stream')) {
  // Use control streams
} else {
  console.log('Control streams not available');
}
```

**Why This Matters:**
- Future servers will have different capabilities
- 52°North may add Part 2 control features
- Other implementations may emerge
- Conformance is the contract

### 12.4 Critical Client Requirements

**From Multi-Server Analysis:**

1. ✅ **Conformance-Based Feature Detection**
   - Query `/conformance` on initialization
   - Store conformance class set
   - Check before using optional features
   - Graceful degradation when features unavailable

2. ✅ **Adaptive Pagination**
   - Detect server default limit (10 vs 100)
   - Allow user override
   - Follow link relations for next page
   - Handle both pygeoapi and OSH link formats

3. ✅ **Multi-Format Error Parsing**
   - Parse both pygeoapi and OSH error formats
   - Provide consistent error interface
   - Include server type in error for debugging
   - User-friendly error messages

4. ✅ **Format Negotiation with Fallback**
   - Try preferred formats first
   - Handle 406 Not Acceptable gracefully
   - Fall back to safe formats (JSON)
   - Don't assume format support

5. ✅ **Client-Side Validation**
   - Validate before sending (prevent 400 errors)
   - Don't rely on server validation
   - Support both strict and relaxed modes
   - Better error messages for users

6. ✅ **Parameter Adaptation**
   - Handle different parameter names (`datetime` vs `validTime`)
   - Support both when querying
   - Validate parameter constraints
   - Document server differences

7. ✅ **Integration Testing**
   - Test against both OSH and 52°North
   - Use same test fixtures
   - Compare behaviors
   - Document quirks

---

## 13. Deployment and Operations

### 13.1 Deployment Comparison

| Aspect | 52°North | OpenSensorHub |
|--------|----------|---------------|
| **Container Image** | Custom (Python) | Official OSH image |
| **Dependencies** | Elasticsearch, TimescaleDB | None (embedded) or PostgreSQL |
| **Configuration** | YAML file | Java config or YAML |
| **Startup Time** | ~2-5 seconds | ~10-30 seconds (JVM) |
| **Memory Usage** | ~200-500 MB | ~500 MB - 2 GB |
| **CPU Usage** | Lower (Python GIL) | Higher (multithreaded) |
| **Horizontal Scaling** | Requires load balancer | Requires load balancer |
| **State Management** | Elasticsearch cluster | Database cluster |

### 13.2 Production Deployment Patterns

**52°North Typical Deployment:**
```yaml
version: '3.8'
services:
  connected-systems-api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - ES_HOST=elasticsearch
      - TIMESCALE_HOST=timescaledb
    depends_on:
      - elasticsearch
      - timescaledb
      
  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
    volumes:
      - es_data:/usr/share/elasticsearch/data
      
  timescaledb:
    image: timescale/timescaledb:latest-pg15
    environment:
      - POSTGRES_PASSWORD=password
    volumes:
      - timescale_data:/var/lib/postgresql/data

volumes:
  es_data:
  timescale_data:
```

**OpenSensorHub Typical Deployment:**
```yaml
version: '3.8'
services:
  opensensorhub:
    image: opensensorhub/osh-core:latest
    ports:
      - "8181:8181"
    volumes:
      - osh_data:/opt/osh/data
      - osh_config:/opt/osh/config
    environment:
      - OSH_HOME=/opt/osh

volumes:
  osh_data:
  osh_config:
```

**Key Difference:** 52°North requires external services (Elasticsearch, TimescaleDB), OSH is self-contained

### 13.3 Client Connection Patterns

**Connection String Examples:**
```typescript
// 52°North (typically port 5000, /connected-systems path)
const client52n = new CSAPIClient('http://localhost:5000/connected-systems');

// OpenSensorHub (typically port 8181, /sensorhub/api path)
const clientOSH = new CSAPIClient('http://localhost:8181/sensorhub/api');

// Production examples
const client52nProd = new CSAPIClient('https://api.example.org/csapi/v1');
const clientOSHProd = new CSAPIClient('https://sensors.example.org/api');
```

**Auto-Detection:**
```typescript
async function connectToServer(baseUrl: string): Promise<CSAPIClient> {
  const client = new CSAPIClient(baseUrl);
  await client.initialize();  // Detects server type from conformance
  
  console.log(`Connected to ${client.serverName} at ${baseUrl}`);
  console.log(`Conformance classes: ${client.conformance.size}`);
  
  return client;
}
```

---

## 14. Conclusion

### 14.1 Key Takeaways

**For TypeScript Client Development:**

1. **Conformance-First Design:**
   - Never assume server capabilities
   - Query `/conformance` endpoint
   - Feature detection over server detection
   - Graceful degradation for optional features

2. **Handle Variation:**
   - Different pagination defaults (10 vs 100)
   - Different error formats (pygeoapi vs OSH)
   - Different format support (CSV/Binary uncertain in 52N)
   - Different validation strictness (configurable vs always strict)

3. **Multi-Server Testing:**
   - Test against both OSH and 52°North
   - Maintain compatibility test suite
   - Document server-specific behaviors
   - Use conformance classes to determine expected behavior

4. **Adaptive Implementation:**
   - Configuration-driven behavior
   - Format negotiation with fallback
   - Parameter adaptation
   - Client-side validation

### 14.2 Implementation Priorities

**High Priority (Core Compatibility):**
- ✅ Conformance detection and feature flags
- ✅ Multi-format error parsing
- ✅ Adaptive pagination (handle both defaults)
- ✅ Format negotiation with fallback chain
- ✅ Client-side request validation

**Medium Priority (Enhanced Compatibility):**
- ✅ Server capability detection helper
- ✅ Configuration overrides for defaults
- ✅ Comprehensive integration test suite
- ✅ Documentation of server differences

**Low Priority (Nice-to-Have):**
- Performance optimization per server type
- Server-specific connection pooling
- Caching strategies per storage backend

### 14.3 Recommendations

**For Client Library:**
1. Design for conformance-based behavior from start
2. Don't hardcode assumptions about any server
3. Make multi-server testing part of CI/CD
4. Document compatibility matrix in README
5. Provide server detection utilities for users

**For Documentation:**
1. Explain conformance class checking
2. Show examples for both OSH and 52°North
3. Document known differences explicitly
4. Provide troubleshooting guide for server-specific issues

**For Users:**
1. Always query `/conformance` to understand server
2. Use feature detection helpers
3. Test against target server type before deployment
4. Be aware of optional features (control, events, streaming)

---

## 15. References

- **52°North Repository:** https://github.com/52North/connected-systems-pygeoapi
- **52°North Documentation:** https://52north.org/software/software-components/ogc-api-connected-systems/
- **OpenSensorHub Repository:** https://github.com/opensensorhub/osh-core
- **CSAPI Part 1 Specification:** https://docs.ogc.org/is/23-001/23-001.html
- **CSAPI Part 2 Specification:** https://docs.ogc.org/is/23-002/23-002.html
- **pygeoapi Framework:** https://pygeoapi.io/

---

**End of Analysis**
