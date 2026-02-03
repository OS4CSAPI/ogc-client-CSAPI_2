# CSAPIQueryBuilder Component Research Plan

**Component:** CSAPIQueryBuilder (Component 4)
**Type:** BUILDING NEW CODE
**Pattern:** Single class following EDRQueryBuilder pattern
**Scope:** ~10k-14k lines (~70% of total new code)
**Location:** `src/ogc-api/csapi/url_builder.js`

---

## 1. Purpose

Document research objectives and methodology for implementing the CSAPIQueryBuilder class, which is the heart of the CSAPI implementation. This single class provides URL construction methods for all 9 CSAPI resource types (Systems, Deployments, Procedures, Sampling Features, Properties, DataStreams, Observations, Control Streams, Commands), implementing approximately 60-70 unique URL patterns with full CRUD operations, comprehensive query parameters, spatial/temporal/hierarchical filtering, pagination support, and schema endpoints. The QueryBuilder follows the EDRQueryBuilder pattern from upstream PR #114 where one comprehensive class per API family handles all URL construction for that API, accessed via `endpoint.csapi(collectionId)`. This component defines the URL patterns and query parameter structures that all downstream format handlers will parse and all validators will check, making it the architectural foundation that other components build upon.

---

## 2. Context

### Implementation Type
**BUILDING NEW CODE** - This is a new class we're adding to the library, not extending existing functionality.

### Upstream Pattern
The CSAPIQueryBuilder follows the **EDRQueryBuilder pattern** established in the upstream repository:
- Single comprehensive class accessed via factory method: `endpoint.csapi(collectionId)`
- Contains methods for all resource types (not 9 separate classes)
- Instantiated by OgcApiEndpoint and cached for reuse
- Encapsulates collection-specific metadata (from CSAPI collection info)
- Provides both URL-building methods and optional query execution methods
- Validates parameters against collection capabilities

### Key References
- [csapi-implementation-guide.md](../../../planning/csapi-implementation-guide.md#csapiquerybuilder-building-new-query-construction-class): Specification for CSAPIQueryBuilder including all 9 resource types
- [querybuilder-pattern-analysis.md](../../../research/upstream/querybuilder-pattern-analysis.md): Detailed analysis of QueryBuilder pattern from EDR implementation
- [url-building-analysis.md](../../../research/upstream/url-building-analysis.md): URL construction patterns and query parameter assembly
- [OGC API - Connected Systems Part 1: OpenAPI](../../../research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml): Part 1 endpoint definitions
- [OGC API - Connected Systems Part 2: OpenAPI](../../../research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml): Part 2 endpoint definitions

### Scope and Complexity
This is the largest single component in the CSAPI implementation:
- **Code volume:** ~10k-14k lines (70% of total new code)
- **URL patterns:** 60-70 unique URL patterns across 9 resource types
- **Operations:** Full CRUD (Create, Read, Update, Delete) not just read-only
- **Query parameters:** Spatial (bbox), temporal (datetime, phenomenonTime), hierarchical (recursive), relationship (parent, system, foi), pagination (offset-based, cursor-based), format negotiation (f, obsFormat, cmdFormat), property-based filtering
- **Resource types:** Part 1 (Systems, Deployments, Procedures, Sampling Features, Properties) + Part 2 (DataStreams, Observations, Control Streams, Commands)
- **Special endpoints:** Schema endpoints, command status/result endpoints, feasibility checking, bulk operations

---

## 3. Research Objectives

### Primary Objectives

1. **Understand EDRQueryBuilder Pattern:**
   - How is EDRQueryBuilder instantiated via factory method?
   - What metadata does it encapsulate from collection info?
   - How does caching work in the factory method?
   - What is the lifecycle of a QueryBuilder instance?
   - How are query methods organized (URL building vs execution)?

2. **Design Single-Class Architecture for 9 Resource Types:**
   - How should methods be organized within one class?
   - What method naming conventions follow EDR pattern?
   - How to group methods logically by resource type?
   - How to avoid code duplication across resource types?
   - How to maintain consistency across 60-70 URL patterns?

3. **Implement URL Construction for All CSAPI Resources:**
   - What are the canonical endpoint patterns for each resource type?
   - What are the nested endpoint patterns (e.g., `/systems/{id}/subsystems`)?
   - How to build URLs with query parameters?
   - How to encode array parameters (multiple IDs, bounding boxes)?
   - How to handle format negotiation (`f` parameter)?

4. **Support Full CRUD Operations:**
   - What HTTP methods (GET, POST, PUT, PATCH, DELETE) for each operation?
   - How to construct bodies for POST/PUT/PATCH requests?
   - How to pass request bodies through URL builder methods?
   - What validation should occur before making requests?
   - How to handle cascade delete parameters?

5. **Implement Comprehensive Query Parameter Support:**
   - What are ALL standard OGC API parameters (bbox, datetime, limit, offset, f)?
   - What are ALL CSAPI common parameters (id, uid, q, propertyName filters)?
   - What are hierarchical parameters (recursive)?
   - What are relationship parameters (parent, system, foi, observedProperty, etc.)?
   - What are temporal parameters (phenomenonTime, resultTime, executionTime, issueTime)?
   - How to combine multiple parameters (AND logic)?
   - How to encode spatial bounding boxes (2D vs 3D)?
   - How to encode temporal intervals (ISO 8601)?

6. **Support Pagination:**
   - How does offset-based pagination work (Part 1 style)?
   - How does cursor-based pagination work (Part 2 style)?
   - What are the limit parameter constraints (1 to 10,000 for Part 2)?
   - How to extract next/prev cursor tokens from responses?

7. **Implement Resource-Specific Requirements:**
   - **Systems:** Hierarchical queries (recursive subsystems), relationship filtering, spatial queries
   - **Deployments:** Spatial extent queries, temporal validity, system associations
   - **Procedures:** System associations, SensorML format support
   - **Sampling Features:** Spatial queries, feature of interest relationships, system associations
   - **Properties:** Property hierarchies (baseProperty), system associations, read-only operations
   - **DataStreams:** Schema endpoints, system/property relationships, result format parameters
   - **Observations:** Temporal queries (phenomenonTime primary), cursor-based pagination, bulk operations, schema validation
   - **Control Streams:** Schema endpoints, controlled property relationships, execution modes
   - **Commands:** Temporal queries, status/result endpoints, feasibility checking, bulk operations, status filtering

8. **Define Data Structures for Handlers:**
   - What TypeScript interfaces should be defined for query parameters?
   - What parameter validation is needed?
   - What response structures will handlers parse?
   - How to type method return values?

### Secondary Objectives

1. **Performance Optimization:**
   - How to efficiently encode query strings?
   - When to validate parameters (before request vs on server)?
   - How to reuse URL construction logic across resource types?

2. **Error Handling:**
   - What validations should throw errors vs warnings?
   - How to validate collection capabilities before building URLs?
   - How to handle missing required parameters?

3. **Extensibility:**
   - How to design for future CSAPI extensions?
   - How to add new resource types without breaking existing code?
   - How to support custom query parameters?

---

## 4. Critical Research Questions

### A. EDRQueryBuilder Pattern Study

**Questions:**

1. **Instantiation:** How is EDRQueryBuilder instantiated in `endpoint.edr(collectionId)`? What's the factory method implementation?

**Answer:** EDRQueryBuilder is instantiated via a factory method in OgcApiEndpoint that follows this pattern:
1. Check if endpoint supports EDR (conformance check - fail fast if not)
2. Check cache (`collection_id_to_edr_builder_` Map) for existing instance
3. If cached, return cached instance (same object reference)
4. If not cached, fetch collection metadata via `await this.getCollectionInfo(collection_id)`
5. Instantiate new `EDRQueryBuilder(collection)` passing collection metadata
6. Cache instance with collection ID as key: `cache.set(collection_id, result)`
7. Return the QueryBuilder instance

The factory method signature: `public async edr(collection_id: string): Promise<EDRQueryBuilder>`

2. **Metadata Encapsulation:** What metadata from `OgcApiCollectionInfo` does EDRQueryBuilder encapsulate? What properties are extracted?

**Answer:** EDRQueryBuilder encapsulates and extracts the following from `OgcApiCollectionInfo`:
- **`collection` object** (stored privately): Full collection metadata reference
- **`data_queries` object**: Contains links for query types (position, area, cube, trajectory, corridor, radius, locations, instances)
- **`parameter_names`**: Dictionary of available parameters (temperature, humidity, etc.) with metadata
- **`crs`**: Array of supported Coordinate Reference System codes
- **`links`**: Array of link objects with rel and href for navigation
- **Derived `supported_query_types`**: Boolean flags computed from `data_queries` (e.g., `area: collection.data_queries.area !== undefined`)

These are extracted in the constructor and stored as instance properties (some private, some public).

3. **Caching Strategy:** How does the factory method cache QueryBuilder instances? What is the cache key? When is cache invalidated?

**Answer:** Caching strategy:
- **Cache location:** Private Map in OgcApiEndpoint class: `collection_id_to_edr_builder_: Map<string, EDRQueryBuilder>`
- **Cache key:** Collection ID string (e.g., "temperature", "humidity")
- **Cache behavior:** One instance per collection per endpoint instance
- **Cache lifetime:** Tied to endpoint instance lifetime - no automatic invalidation
- **Cache invalidation:** Only when endpoint instance is destroyed (no explicit invalidation API)
- **Cache benefits:** Avoids redundant HTTP requests for collection metadata, ensures same collection always returns same builder instance

Example: `endpoint.edr('temp')` twice returns the exact same object (`===` equality).

4. **Lifecycle:** What happens in the EDRQueryBuilder constructor? What validation occurs? What state is initialized?

**Answer:** Constructor lifecycle:
1. **Store collection metadata:** `constructor(private collection: OgcApiCollectionInfo)`
2. **Validate required data exists:** Check `if (!collection.data_queries)` throw error "No data queries found, so cannot issue EDR queries"
3. **Extract query type support:** Compute boolean flags for each query type from presence in `data_queries` object:
   ```typescript
   this.supported_query_types = {
     area: collection.data_queries.area !== undefined,
     cube: collection.data_queries.cube !== undefined,
     // ... for all 7 EDR query types
   };
   ```
4. **Extract metadata:** Store public properties:
   - `this.supported_parameters = collection.parameter_names`
   - `this.supported_crs = collection.crs`
   - `this.links = collection.links`
5. **State is immutable** after construction - no further changes

If validation fails (no `data_queries`), constructor throws immediately and no instance is created.

5. **Method Organization:** How are EDR query methods organized? Are they grouped by query type? What naming conventions are used?

**Answer:** Method organization in EDRQueryBuilder:
- **Grouped by query type:** Each of 7 EDR query types gets two methods (build URL + execute query)
- **Naming convention:** 
  - URL builders: `build<QueryType>DownloadUrl()` (e.g., `buildPositionDownloadUrl()`, `buildAreaDownloadUrl()`)
  - Query executors: `get<QueryType>()` (e.g., `getPosition()`, `getArea()`)
- **Parameter pattern:** Required params as direct arguments, optional params as options object with default `= {}`
- **Method pairs:** Each query type has both patterns (14 methods total for 7 query types)
- **Capability getter:** `get supported_queries(): Set<DataQueryType>` exposes what's available
- **No sectioning:** All methods at same level in class (no nested classes or sections)

Example: `buildPositionDownloadUrl(coords, optional_params = {})` and `async getPosition(coords, optional_params = {})`

6. **URL Building vs Execution:** Does EDRQueryBuilder provide both `buildXxxUrl()` methods (return URL) and `getXxx()` methods (execute and return data)? What's the pattern?

**Answer:** Yes, EDRQueryBuilder provides BOTH patterns:

**Build URL methods (synchronous):**
- Pattern: `build<QueryType>DownloadUrl(...): string`
- Returns: URL string
- Use case: User wants URL to fetch themselves or use in other context
- Example: `buildPositionDownloadUrl(coords, optional_params)` → `"https://api.example.com/collections/temp/position?coords=POINT(...)"`

**Execute query methods (asynchronous):**
- Pattern: `async get<QueryType>(...): Promise<EdrData>`
- Implementation: Calls build method + fetch + parse
- Returns: Typed data object
- Use case: User wants data directly, doesn't care about URL
- Example: `await getPosition(coords, optional_params)` → `{ type: 'FeatureCollection', features: [...] }`

**Relationship:** Execute methods internally call build methods: `const url = this.buildPositionDownloadUrl(coords, optional_params);`

7. **Collection Validation:** How does EDRQueryBuilder validate that a collection supports EDR operations? What errors are thrown?

**Answer:** Validation occurs at two levels:

**Constructor validation (fail fast):**
- Check: `if (!collection.data_queries)` 
- Error: `throw new Error('No data queries found, so cannot issue EDR queries')`
- Result: No QueryBuilder instance created if collection doesn't support EDR at all

**Method-level validation (per query type):**
- Check: `if (!this.supported_query_types.position)` (example for position queries)
- Error: `throw new Error('Collection does not support position queries')`
- Result: Runtime error if user tries to call unsupported query type

**User-facing capability exposure:**
- Property: `builder.supported_queries` returns `Set<'position' | 'area' | 'cube' | ...>`
- Pattern: User checks capabilities before calling methods to avoid errors
- Example: `if (builder.supported_queries.has('trajectory')) { ... }`

Additional validation in methods: Parameter validation (check `supported_parameters` and `supported_crs` before adding to URL).


### B. Single-Class Architecture for 9 Resource Types

**Questions:**

8. **Method Grouping:** How should we organize methods for 9 resource types within one class? By resource type sections? By operation type (CRUD)? Both?

**Answer:** Organize by **resource type sections** (not by CRUD operation) following EDR pattern:
- Group all methods for each resource together (Systems, Deployments, Procedures, etc.)
- Within each resource group, order by: list/query → get by ID → create → update → delete → nested resources
- Use JSDoc section comments to mark resource boundaries: `// ========== Systems Resource Methods ==========`
- No nested classes or modules - all methods at same level in one class
- Example structure:
  ```typescript
  class CSAPIQueryBuilder {
    // ========== Systems ==========
    getSystems(options?) { }
    getSystem(id) { }
    createSystem(body) { }
    updateSystem(id, body) { }
    deleteSystem(id, cascade?) { }
    getSubsystems(parentId, options?) { }
    
    // ========== Deployments ==========
    getDeployments(options?) { }
    getDeployment(id) { }
    // ... etc
  }
  ```
This mirrors how EDR groups methods by query type (position, area, cube, etc.).

9. **Method Naming:** What naming convention should we use for methods? `getSystems()`, `getSystemById(id)`, `createSystem(body)`, `updateSystem(id, body)`, `deleteSystem(id)`? How does this scale to 9 resource types?

**Answer:** Follow EDR pattern with CRUD-based naming:
- **List/query:** `get<ResourcePlural>(options?)` → `getSystems()`, `getDeployments()`, `getObservations()`
- **Get by ID:** `get<ResourceSingular>(id)` → `getSystem(id)`, `getDeployment(id)`, `getObservation(id)`
- **Create:** `create<ResourceSingular>(body)` → `createSystem(body)`, `createDeployment(body)`
- **Update:** `update<ResourceSingular>(id, body)` → `updateSystem(id, body)`
- **Delete:** `delete<ResourceSingular>(id, cascade?)` → `deleteSystem(id, cascade)`
- **Nested resources:** `get<Nested>(parentId, options?)` → `getSubsystems(parentId)`, `getDatastreams(systemId)`

**Scaling:** This pattern scales well - each resource type gets 4-6 methods (list, get, create, update, delete, potentially nested). For 9 resources with full CRUD, expect ~50-60 methods total.

**Naming rationale:** "get" prefix indicates read operations (GET), "create/update/delete" prefixes match HTTP verbs, singular vs plural indicates single vs multiple results.

10. **Code Reuse:** What patterns can reduce duplication across resource types? Can we abstract common URL construction logic? Can we use helper methods?

**Answer:** Several code reuse patterns based on EDR approach:

**1. Private helper methods for common operations:**
```typescript
private buildResourceListUrl(resourcePath: string, options: QueryOptions): string {
  const baseUrl = this.getResourceLink(resourcePath);
  const url = new URL(baseUrl);
  if (options.limit) url.searchParams.set('limit', options.limit.toString());
  if (options.offset) url.searchParams.set('offset', options.offset.toString());
  if (options.bbox) url.searchParams.set('bbox', options.bbox.join(','));
  return url.toString();
}
```

**2. Shared parameter encoding:**
```typescript
private addQueryParams(url: URL, options: QueryOptions): void {
  if (options.limit !== undefined) url.searchParams.set('limit', options.limit.toString());
  if (options.offset !== undefined) url.searchParams.set('offset', options.offset.toString());
  // ... common parameters
}
```

**3. Link extraction helper:**
```typescript
private getResourceLink(rel: string): string {
  const link = this.collection.links.find(l => l.rel === rel);
  if (!link) throw new Error(`Resource '${rel}' not available`);
  return link.href;
}
```

**4. Common fetch/parse logic:**
```typescript
private async fetchResource<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}
```

**Pattern:** Extract common logic into private helpers, call from public methods. EDR doesn't abstract much because each query type is unique; CSAPI can abstract more because resources share common patterns.

11. **Nested Endpoints:** How to handle nested endpoints like `/systems/{id}/subsystems`? Separate methods like `getSubsystems(parentId)` or parameters like `getSystems({ parent: id })`?

**Answer:** Use **separate dedicated methods** for nested endpoints, not parameters:

**✅ Recommended approach (explicit):**
```typescript
// Dedicated method for nested resource
getSubsystems(parentId: string, options?: QueryOptions): Promise<System[]> {
  const url = this.buildResourceUrl(`systems/${parentId}/subsystems`);
  // ... add query params, fetch, return
}

// Usage: clear intent
const subsystems = await builder.getSubsystems('system-123');
```

**❌ Not recommended (parameter-based):**
```typescript
getSystems(options?: { parent?: string, ... }): Promise<System[]> {
  // Builds /systems OR /systems/{parent}/subsystems based on options
  // LESS CLEAR, mixes concerns
}
```

**Rationale:**
1. **Clarity:** Separate methods make nested relationships explicit
2. **Type safety:** Different return types possible (subsystems vs all systems)
3. **URL patterns:** Different endpoints may have different query parameter support
4. **Follows REST:** Each endpoint is a distinct resource with its own method
5. **Scalability:** Easy to add more nested patterns (e.g., `getSystemDatastreams(systemId)`)

**For hierarchical queries via parent parameter:** Use the `parent` query parameter when querying the canonical endpoint: `GET /systems?parent=system-123` vs nested endpoint `GET /systems/system-123/subsystems`.

12. **State Management:** What state should CSAPIQueryBuilder maintain? Collection metadata? Supported resource types? Capabilities flags?

**Answer:** Following EDR pattern, CSAPIQueryBuilder should maintain:

**Private state (encapsulated):**
- `private collection: OgcApiCollectionInfo` - Full collection metadata reference
- `private supported_resources: Set<string>` - Computed from links (which resources are available)

**Public state (exposed to users):**
- `public links: Array<{rel: string, href: string}>` - Collection links for resource navigation
- `public id: string` - Collection ID
- `public title: string` - Collection title
- Potentially: `public extent: Extent` - Spatial/temporal extent
- Potentially: `public crs: string[]` - Supported CRS codes (if relevant for CSAPI)

**Derived getters:**
```typescript
get supportedResources(): Set<string> {
  return new Set(this.supported_resources); // Return copy, not reference
}
```

**State characteristics:**
- **Immutable after construction:** All state set in constructor, never modified
- **Derived from collection:** All state comes from `OgcApiCollectionInfo` passed to constructor
- **No shared state:** Each collection gets own QueryBuilder instance with isolated state
- **Source of truth:** Collection metadata from server is authoritative

**What NOT to maintain:**
- Runtime query state (no caching of results)
- User preferences (stateless service object)
- Connection pools (leave to fetch implementation)


### C. URL Construction Patterns

**Questions:**

13. **Canonical Endpoints:** What are the URL patterns for canonical resource endpoints? `/systems`, `/deployments`, `/procedures`, `/samplingFeatures`, `/properties`, `/datastreams`, `/observations`, `/controlstreams`, `/commands`?

**Answer:** Based on OpenAPI specs, the canonical endpoint patterns are:

**Part 1 Resources:**
- `/systems` - List/create systems
- `/systems/{systemId}` - Get/update/delete specific system
- `/deployments` - List/create deployments
- `/deployments/{deploymentId}` - Get/update/delete specific deployment
- `/procedures` - List/create procedures
- `/procedures/{procedureId}` - Get/update/delete specific procedure
- `/samplingFeatures` - List/create sampling features
- `/samplingFeatures/{featureId}` - Get/update/delete specific sampling feature
- `/properties` - List properties (read-only)
- `/properties/{propId}` - Get specific property (read-only)

**Part 2 Resources:**
- `/datastreams` - List/create datastreams
- `/datastreams/{dataStreamId}` - Get/update/delete specific datastream
- `/observations` - List/create observations (canonical, not commonly used)
- `/observations/{obsId}` - Get/update/delete specific observation
- `/controlstreams` - List/create control streams
- `/controlstreams/{controlStreamId}` - Get/update/delete specific control stream
- `/commands` - List/create commands (canonical, not commonly used)
- `/commands/{cmdId}` - Get/update/delete specific command

**Important:** CSAPI follows standard OGC API pattern: plural resource name for collections, `{id}` parameter for individual resources.

14. **Nested Endpoints:** What are ALL nested endpoint patterns? (e.g., `/systems/{id}/subsystems`, `/systems/{id}/datastreams`, `/datastreams/{id}/observations`, `/controlstreams/{id}/commands`)?

**Answer:** Nested endpoint patterns from OpenAPI specs:

**Systems nested resources:**
- `/systems/{systemId}/subsystems` - Subsystems of a specific system (hierarchical)
- `/systems/{systemId}/deployments` - Deployments for a specific system
- `/systems/{systemId}/samplingFeatures` - Sampling features for a specific system
- `/systems/{systemId}/datastreams` - Datastreams for a specific system (Part 2)
- `/systems/{systemId}/controlstreams` - Control streams for a specific system (Part 2)

**Deployments nested resources:**
- `/deployments/{deploymentId}/subdeployments` - Subdeployments of a specific deployment (hierarchical)

**DataStreams nested resources:**
- `/datastreams/{dataStreamId}/observations` - Observations for a specific datastream (most common pattern for querying observations)

**ControlStreams nested resources:**
- `/controlstreams/{controlStreamId}/commands` - Commands for a specific control stream (most common pattern for querying commands)

**Commands nested resources:**
- `/commands/{cmdId}/status` - Status updates for a specific command
- `/commands/{cmdId}/status/{statusId}` - Specific status update
- `/commands/{cmdId}/result` - Result of a specific command
- `/commands/{cmdId}/result/{resultId}` - Specific result

**Pattern:** Nested endpoints follow format `/{parentResource}/{parentId}/{childResource}` and are used for:
1. Hierarchical relationships (subsystems, subdeployments)
2. Association navigation (system → datastreams, datastream → observations)
3. Sub-resources (command → status/result)

15. **Schema Endpoints:** What are the schema endpoint patterns? `/datastreams/{id}/schema`, `/controlstreams/{id}/schema`?

**Answer:** Schema endpoint patterns from OpenAPI specs:

**DataStream schema:**
- `/datastreams/{dataStreamId}/schema` - Returns SWE Common DataComponent schema defining structure of observation results for this datastream
- HTTP Method: GET
- Response: JSON schema document (SWE Common 3.0 format)
- Purpose: Clients use this to understand observation result structure before parsing observations

**ControlStream schema:**
- `/controlstreams/{controlStreamId}/schema` - Returns SWE Common DataComponent schema defining structure of command parameters for this control stream
- HTTP Method: GET
- Response: JSON schema document (SWE Common 3.0 format)
- Purpose: Clients use this to understand command parameter structure before submitting commands

**Pattern:** `/{resourceType}/{resourceId}/schema` where schema is a sub-resource providing metadata about data structure.

**Note:** Only DataStreams and ControlStreams have schema endpoints because they deal with structured data (observations and commands respectively). Other resources (Systems, Deployments, etc.) don't have schema endpoints as they use fixed GeoJSON/SensorML formats.

16. **Special Endpoints:** What are the special-purpose endpoints? `/commands/{id}/status`, `/commands/{id}/result`, `/controlstreams/{id}/feasibility`?

**Answer:** Special-purpose endpoints from OpenAPI specs:

**Command status tracking:**
- `/commands/{cmdId}/status` - GET: Retrieve current status of command execution
- `/commands/{cmdId}/status` - POST: Add status update (typically by system, not client)
- `/commands/{cmdId}/status/{statusId}` - GET: Retrieve specific status update by ID
- Returns: Status object with fields like `status` (pending/executing/completed/failed), `percentCompletion`, `statusMessage`, `updateTime`

**Command result retrieval:**
- `/commands/{cmdId}/result` - GET: Retrieve result after command execution completes
- `/commands/{cmdId}/result` - PUT: Set result (typically by system, not client)
- `/commands/{cmdId}/result/{resultId}` - GET: Retrieve specific result by ID
- Returns: Result object with execution output data

**Feasibility checking:**
- `/controlstreams/{controlStreamId}/feasibility` - POST: Check if command parameters are feasible before actual submission
- Request body: Command parameters (same structure as command)
- Response: Feasibility report indicating whether parameters are valid/achievable
- Purpose: Pre-validation before committing to command execution

**Other potential special endpoints:**
- `/commands/{cmdId}/cancel` - POST: Cancel pending/executing command (if supported by server)

**Pattern:** These are sub-resources or actions on parent resources, typically using POST for operations beyond standard CRUD.

17. **Query String Assembly:** How to construct query strings from parameter objects? How to handle URL encoding? How to serialize arrays?

**Answer:** Following EDR pattern, use native JavaScript URL API:

**Basic pattern:**
```typescript
const url = new URL(baseUrl); // Base URL from links
if (options.limit !== undefined) {
  url.searchParams.set('limit', options.limit.toString());
}
if (options.offset !== undefined) {
  url.searchParams.set('offset', options.offset.toString());
}
return url.toString();
```

**URL encoding:** Automatic via `URL.searchParams.set()` - no manual encoding needed:
```typescript
url.searchParams.set('q', 'weather station'); 
// Automatically encodes spaces: ?q=weather%20station
```

**Array serialization:** Join with comma (OGC API standard):
```typescript
if (options.id?.length > 0) {
  url.searchParams.set('id', options.id.join(','));
}
// Result: ?id=sys1,sys2,sys3
```

**Conditional addition:** Always check for undefined before adding:
```typescript
if (options.bbox !== undefined) {
  url.searchParams.set('bbox', options.bbox.join(','));
}
// Only adds parameter if provided
```

**Boolean serialization:** Convert to string:
```typescript
if (options.recursive !== undefined) {
  url.searchParams.set('recursive', options.recursive.toString());
}
// Result: ?recursive=true or ?recursive=false
```

**Temporal parameters:** Pass through as-is (already ISO 8601 formatted):
```typescript
if (options.datetime) {
  url.searchParams.set('datetime', options.datetime);
}
// Result: ?datetime=2024-01-01T00:00:00Z/2024-01-31T23:59:59Z
```

**Key principles:** Use native URL API, check undefined before adding, join arrays with comma, toString() for primitives.

18. **Base URL Construction:** How to combine base URL + collection path + resource path + query string? How to handle trailing slashes?

**Answer:** Following OGC API hypermedia principle, **NEVER construct base URLs manually** - always extract from links:

**✅ Correct approach - link-based:**
```typescript
// 1. Get URL from collection links (provided by server)
const baseUrl = this.getResourceLink('systems'); 
// Server provides: "https://api.example.com/collections/sensors/systems"

// 2. Create URL object
const url = new URL(baseUrl);

// 3. For specific resource, append ID
const resourceUrl = new URL(`${baseUrl}/${systemId}`);
// Result: "https://api.example.com/collections/sensors/systems/system-123"

// 4. Add query parameters
url.searchParams.set('limit', '10');

// 5. Return string
return url.toString();
```

**❌ Wrong approach - manual construction:**
```typescript
// DON'T DO THIS - fragile, non-standard
const url = `${this.endpoint}/collections/${this.collectionId}/systems`;
```

**Trailing slash handling:** Let URL API normalize:
```typescript
new URL('/systems/123', 'https://api.example.com').toString()
// Result: https://api.example.com/systems/123 (no trailing slash)

new URL('systems/123', 'https://api.example.com/').toString()
// Result: https://api.example.com/systems/123 (URL API handles normalization)
```

**For nested resources:**
```typescript
const systemsUrl = this.getResourceLink('systems');
const subsystemsUrl = `${systemsUrl}/${parentId}/subsystems`;
const url = new URL(subsystemsUrl);
```

**Rationale:** Servers can use ANY URL structure. By using links, client works with any compliant implementation (even non-standard paths).

19. **HTTP Methods:** What HTTP methods map to what CRUD operations? GET = Read, POST = Create, PUT = Replace, PATCH = Update, DELETE = Delete?

**Answer:** HTTP method mapping for CSAPI (from OpenAPI specs):

**GET - Read/Retrieve:**
- List resources: `GET /systems` → array of systems
- Get by ID: `GET /systems/{id}` → single system
- Nested resources: `GET /systems/{id}/subsystems` → array of subsystems
- Schema: `GET /datastreams/{id}/schema` → schema document
- Status/Result: `GET /commands/{id}/status` → status object

**POST - Create:**
- Create resource: `POST /systems` with body → 201 Created with Location header
- Create nested: `POST /systems/{id}/subsystems` with body → 201 Created
- Bulk create: `POST /datastreams/{id}/observations` with array → 201 Created
- Actions: `POST /controlstreams/{id}/feasibility` → feasibility report
- Submit command: `POST /controlstreams/{id}/commands` with body → 201 Created

**PUT - Replace (complete):**
- Full replacement: `PUT /systems/{id}` with complete body → 200 OK or 204 No Content
- Replace result: `PUT /commands/{id}/result` with result → 200 OK
- **Idempotent:** Same request produces same result

**PATCH - Update (partial):**
- Partial update: `PATCH /systems/{id}` with partial body (JSON Patch or JSON Merge Patch) → 200 OK
- Update status: `PATCH /commands/{id}/status` with status fields → 200 OK
- **Non-idempotent:** May produce different results

**DELETE - Remove:**
- Delete resource: `DELETE /systems/{id}` → 204 No Content
- Cascade delete: `DELETE /systems/{id}?cascade=true` → 204 No Content
- **Note:** Some resources may be retained (archives) rather than truly deleted

**Response codes:**
- 200 OK - successful GET/PUT/PATCH with response body
- 201 Created - successful POST with Location header
- 204 No Content - successful DELETE or PUT/PATCH without response body
- 400 Bad Request - validation error
- 404 Not Found - resource doesn't exist
- 409 Conflict - constraint violation (e.g., can't delete system with datastreams)

20. **Request Bodies:** For POST/PUT/PATCH, how to pass request bodies? Method parameter? TypeScript interface for body structure?

**Answer:** Pass request bodies as typed method parameters:

**Method signature pattern:**
```typescript
async createSystem(body: SystemInput): Promise<System> {
  const url = this.getResourceLink('systems');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/geo+json' },
    body: JSON.stringify(body)
  });
  // ... handle response
}
```

**TypeScript interfaces for bodies:**
```typescript
interface SystemInput {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: {
    name: string;
    description?: string;
    systemType: string; // URI like 'http://www.w3.org/ns/sosa/Sensor'
    uniqueIdentifier?: string; // URN
    validTime?: TemporalPeriod;
    // ... other system properties
  };
}

interface ObservationInput {
  phenomenonTime: string; // ISO 8601
  resultTime?: string;
  result: any; // Structure defined by datastream schema
  resultQuality?: QualityInfo;
  parameters?: Record<string, any>;
}

interface CommandInput {
  issueTime?: string;
  executionTime?: string;
  parameters: any; // Structure defined by controlstream schema
  priority?: number;
}
```

**For bulk operations (arrays):**
```typescript
async createObservations(
  datastreamId: string,
  observations: ObservationInput[]
): Promise<Observation[]> {
  const url = `${this.getDatastreamUrl(datastreamId)}/observations`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(observations) // Array directly
  });
  // ...
}
```

**For updates (partial):**
```typescript
async updateSystem(
  id: string,
  updates: Partial<SystemInput> // Partial type for PATCH
): Promise<System> {
  const url = `${this.getResourceLink('systems')}/${id}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(updates)
  });
  // ...
}
```

**Pattern:** Strongly typed body parameter, serialize with JSON.stringify(), set appropriate Content-Type header.

21. **Content-Type Headers:** What Content-Type headers for different body formats? `application/json`, `application/geo+json`, `application/sml+json`?

**Answer:** Content-Type headers vary by resource type and format:

**GeoJSON resources (Systems, Deployments, Sampling Features):**
- `Content-Type: application/geo+json` - Preferred for GeoJSON Feature/FeatureCollection
- `Content-Type: application/json` - Also acceptable (GeoJSON is valid JSON)
- Used for: POST/PUT/PATCH of Part 1 spatial resources

**SensorML resources (Systems, Procedures with detailed descriptions):**
- `Content-Type: application/sml+json` - SensorML 3.0 JSON encoding
- Used for: POST/PUT of Systems or Procedures with detailed sensor metadata

**Standard JSON resources (DataStreams, ControlStreams, Properties):**
- `Content-Type: application/json` - Standard JSON
- Used for: POST/PUT/PATCH of Part 2 resources and metadata resources

**SWE Common resources (Observations, Commands):**
- `Content-Type: application/json` - For JSON-encoded observations/commands
- `Content-Type: application/swe+json` - SWE Common JSON encoding (if server supports)
- `Content-Type: text/csv` or `application/swe+text` - For CSV/text-encoded observations (bulk data)
- `Content-Type: application/octet-stream` - For binary-encoded observations (high-volume streaming)

**Partial updates (PATCH):**
- `Content-Type: application/merge-patch+json` - JSON Merge Patch (RFC 7396)
- `Content-Type: application/json-patch+json` - JSON Patch (RFC 6902)

**Format negotiation via Accept header (GET requests):**
- `Accept: application/geo+json` - Request GeoJSON format
- `Accept: application/sml+json` - Request SensorML format
- `Accept: application/json` - Request standard JSON
- Or use `?f=geojson` query parameter

**Pattern:** Match Content-Type to resource format: GeoJSON for spatial, SensorML for detailed sensors, JSON for others.

22. **Response Handling:** Should QueryBuilder methods return URLs only or execute requests and return parsed data? Or both patterns?

**Answer:** Follow EDR pattern - provide BOTH approaches but **ONLY implement execute pattern** initially:

**Recommended approach (execute and return data):**
```typescript
async getSystems(options?: QueryOptions): Promise<System[]> {
  const url = this.buildSystemsUrl(options);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  return data.features || data.items; // Handle both formats
}
```

**Optional approach (build URL only) - for advanced users:**
```typescript
buildSystemsUrl(options?: QueryOptions): string {
  const baseUrl = this.getResourceLink('systems');
  const url = new URL(baseUrl);
  this.addQueryParams(url, options);
  return url.toString();
}

// User can fetch themselves:
const url = builder.buildSystemsUrl({ limit: 10 });
const response = await fetch(url);
```

**Recommendation for CSAPI:**
- **Start with execute methods only:** `getSystems()`, `getSystem()`, etc.
- **Add build methods later if needed:** `buildSystemsUrl()`, `buildSystemUrl()`
- **Rationale:** 
  - Most users want data, not URLs
  - Execute methods can use build methods internally (DRY)
  - Build methods add API surface area (more to document/test)
  - EDR provides both but most users use execute methods

**Return type pattern:**
- List methods: `Promise<Resource[]>`
- Get by ID: `Promise<Resource>`
- Create: `Promise<Resource>` (returns created resource with ID)
- Update: `Promise<Resource>` (returns updated resource)
- Delete: `Promise<void>` (no return value on 204 No Content)

23. **Cascade Delete:** How to support cascade delete? Query parameter `?cascade=true`? Separate method?

**Answer:** Use **query parameter** approach (not separate method):

**Recommended implementation:**
```typescript
async deleteSystem(
  id: string,
  options?: { cascade?: boolean }
): Promise<void> {
  const baseUrl = this.getResourceLink('systems');
  const url = new URL(`${baseUrl}/${id}`);
  
  // Add cascade parameter if requested
  if (options?.cascade) {
    url.searchParams.set('cascade', 'true');
  }
  
  const response = await fetch(url.toString(), {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  // DELETE returns 204 No Content on success
}
```

**Usage:**
```typescript
// Delete system only (fails if has dependencies)
await builder.deleteSystem('system-123');

// Delete system and all dependent resources
await builder.deleteSystem('system-123', { cascade: true });
```

**❌ Not recommended (separate method):**
```typescript
// Creates API bloat
async deleteSystem(id: string): Promise<void> { }
async deleteSystemCascade(id: string): Promise<void> { }
```

**Cascade behavior from OpenAPI specs:**
- `cascade=false` or omitted: Delete fails if resource has dependents (409 Conflict)
- `cascade=true`: Delete resource and ALL dependent resources (subsystems, datastreams, observations, etc.)
- **Dangerous operation:** Potentially deletes large amounts of data
- **Server-side validation:** Server checks authorization and constraints

**Applies to:** Systems, Deployments, DataStreams, ControlStreams (resources that can have dependents).

**Does NOT apply to:** Observations, Commands, Procedures, Sampling Features, Properties (leaf nodes or shared resources).


### E. Standard OGC API Query Parameters

**Questions:**

24. **bbox Parameter:** How to encode spatial bounding box? Comma-separated coordinates? 2D vs 3D support? CRS parameter?

**Answer:** The `bbox` parameter filters resources by spatial bounding box:

**Format:** Comma-separated coordinates in WGS 84 (EPSG:4326) by default: `minLon,minLat,maxLon,maxLat`

**Examples:**
```
bbox=-180,-90,180,90           # Global extent
bbox=-10.0,50.0,2.0,60.0       # Part of Europe
bbox=-122.4,37.7,-122.3,37.8   # San Francisco area
```

**3D Support (optional):** Add elevation values for 3D bbox: `minLon,minLat,minElev,maxLon,maxLat,maxElev`
```
bbox=-122.4,37.7,0,-122.3,37.8,1000  # With elevation range
```

**CRS Parameter:** While OGC API standard supports CRS negotiation via `bbox-crs` parameter, CSAPI Part 1 spec uses WGS 84 as default and primary CRS. Most implementations accept only WGS 84 for bbox queries.

**Behavior:** Only resources with geometry that **intersects** the bounding box are returned (not just contained within).

**TypeScript signature:**
```typescript
bbox?: [number, number, number, number] | [number, number, number, number, number, number]
```

**URL encoding:**
```typescript
if (options.bbox) {
  url.searchParams.set('bbox', options.bbox.join(','));
}
// Result: ?bbox=-180,-90,180,90
```

25. **datetime Parameter:** How to encode temporal intervals? ISO 8601 format? Single instant vs interval? Open intervals (`../2024-01-31`, `2024-01-01/..`)?

**Answer:** The `datetime` parameter filters resources by temporal extent using ISO 8601 format:

**Single instant (exact time):**
```
datetime=2024-02-02T12:00:00Z     # Specific instant
datetime=2024-02-02                # Whole day (shorthand)
```

**Closed interval (start and end):**
```
datetime=2024-01-01T00:00:00Z/2024-01-31T23:59:59Z   # January 2024
datetime=2024-01-01/2024-01-31                        # Shorthand (whole days)
```

**Open start (everything up to date):**
```
datetime=../2024-01-31             # Everything before Feb 1, 2024
datetime=../2024-01-31T23:59:59Z   # Everything before midnight
```

**Open end (everything from date onwards):**
```
datetime=2024-01-01/..             # Everything from Jan 1, 2024 onwards
datetime=2024-01-01T00:00:00Z/..   # Same with explicit time
```

**Special keywords:**
```
datetime=now/..                    # From current time onwards
datetime=../now                    # Everything up to now
datetime=latest                    # Most recent resource only
```

**Behavior:** Resources with `validTime` that **intersects** the specified datetime/interval are returned.

**TypeScript signature:**
```typescript
datetime?: string  // ISO 8601 instant or interval
```

**URL encoding:** Pass string directly (already properly formatted):
```typescript
if (options.datetime) {
  url.searchParams.set('datetime', options.datetime);
}
```

**Note:** Part 1 resources use `datetime` for validity periods. Part 2 resources use specialized temporal parameters (`phenomenonTime`, `resultTime`, etc.) for observations/commands.

26. **limit Parameter:** What are valid range values? 1 to 10,000 for Part 2? Different defaults for Part 1 vs Part 2?

**Answer:** The `limit` parameter controls maximum number of items returned:

**Valid range:** 1 to 10,000 (inclusive)
```
limit=1        # Minimum (single resource)
limit=100      # Common page size
limit=10000    # Maximum allowed
```

**Default value:** 10 (if limit not specified)

**Part 1 vs Part 2:**
- **Part 1** (Systems, Deployments, etc.): Default 10, max 10,000
- **Part 2** (DataStreams, Observations, etc.): Default 10, max 10,000
- **Same limits for both parts** per OpenAPI specs

**Behavior:** Limits items at **first level only** (nested objects don't count toward limit)

**TypeScript signature:**
```typescript
limit?: number  // 1-10000, default 10
```

**URL encoding:**
```typescript
if (options.limit !== undefined) {
  if (options.limit < 1 || options.limit > 10000) {
    throw new Error('limit must be between 1 and 10000');
  }
  url.searchParams.set('limit', options.limit.toString());
}
```

**Server behavior:**
- Returns up to `limit` items
- May return fewer if insufficient matches
- If more items exist, provides pagination links (next/prev)
- Returns HTTP 400 Bad Request if limit out of range

27. **offset Parameter:** How does offset-based pagination work? Combined with limit? Start at 0 or 1?

**Answer:** The `offset` parameter implements offset-based pagination for Part 1 resources:

**Format:** Non-negative integer (0-based index)
```
offset=0       # First page (default)
offset=10      # Skip first 10 items
offset=100     # Skip first 100 items
```

**Combined with limit:**
```
limit=10&offset=0    # Items 0-9 (page 1)
limit=10&offset=10   # Items 10-19 (page 2)
limit=10&offset=20   # Items 20-29 (page 3)
```

**Calculate next page offset:**
```typescript
const nextOffset = currentOffset + limit;
```

**TypeScript signature:**
```typescript
interface PaginationOptions {
  limit?: number;   // Items per page (default 10)
  offset?: number;  // Zero-based starting index (default 0)
}
```

**URL encoding:**
```typescript
if (options.offset !== undefined) {
  url.searchParams.set('offset', options.offset.toString());
}
if (options.limit !== undefined) {
  url.searchParams.set('limit', options.limit.toString());
}
// Result: ?limit=10&offset=20
```

**Part 1 vs Part 2:**
- **Part 1:** Uses offset-based pagination (offset + limit)
- **Part 2:** May use cursor-based pagination (cursor + limit) for observations/commands (better for streaming data)

**Important:** Part 1 spec does NOT explicitly document `offset` parameter in OpenAPI spec, but it's part of OGC API - Features standard that CSAPI Part 1 extends. Servers SHOULD support it.

28. **f Parameter:** What format values are supported? `json`, `geojson`, `sml+json`, `swe+json`, `swe+text`, `html`?

**Answer:** The `f` parameter specifies response format (content negotiation):

**Supported format values:**

**Part 1 Resources (Systems, Deployments, Procedures, Sampling Features):**
- `f=json` - Standard JSON
- `f=geojson` - GeoJSON (default for spatial resources)
- `f=sml+json` - SensorML 3.0 JSON (for detailed system descriptions)
- `f=html` - Human-readable HTML representation

**Part 2 Resources (DataStreams, ControlStreams, Properties):**
- `f=json` - Standard JSON (default for non-spatial resources)
- `f=swe+json` - SWE Common JSON encoding

**Observations/Commands:**
- `f=json` - Standard JSON (default)
- `f=swe+json` - SWE Common JSON
- `f=swe+text` - CSV/text encoding (for bulk observations)
- `f=swe+binary` - Binary encoding (high-performance streaming)
- `f=om+json` - O&M JSON (legacy format)

**Examples:**
```
GET /systems?f=geojson       # GeoJSON Feature Collection
GET /systems/sys1?f=sml+json # SensorML document
GET /procedures/p1?f=sml+json # Detailed procedure description
GET /observations?f=swe+text  # CSV format
```

**TypeScript signature:**
```typescript
type Format = 'json' | 'geojson' | 'sml+json' | 'swe+json' | 'swe+text' | 'html';

interface QueryOptions {
  f?: Format;
}
```

**URL encoding:**
```typescript
if (options.f) {
  url.searchParams.set('f', options.f);
}
```

**Alternative:** Use HTTP `Accept` header instead of query parameter:
```typescript
headers: {
  'Accept': 'application/geo+json'  // Same as f=geojson
}
```

**Default formats (when f not specified):**
- Systems, Deployments, Sampling Features → `application/geo+json`
- Procedures → `application/sml+json` or `application/geo+json`
- DataStreams, ControlStreams, Properties → `application/json`
- Observations, Commands → `application/json`


### F. CSAPI-Specific Query Parameters

**Questions:**

29. **id Parameter:** How to filter by multiple IDs? Comma-separated list? OR logic? Example: `id=sys1,sys2,sys3`?

**Answer:** The `id` parameter filters resources by one or more identifiers:

**Format:** Comma-separated list of local IDs or unique IDs (URIs)
```
id=sys1                                    # Single local ID
id=sys1,sys2,sys3                          # Multiple local IDs (OR logic)
id=urn:example:system:001                  # Single unique ID (URN)
id=urn:example:system:001,urn:example:system:002  # Multiple URNs
```

**Logic:** OR operation - returns resources matching **any** of the provided IDs

**Applies to:** All resource types (Systems, Deployments, Procedures, Sampling Features, Properties, DataStreams, Observations, ControlStreams, Commands)

**TypeScript signature:**
```typescript
id?: string[]  // Array of IDs (local or URN)
```

**URL encoding:**
```typescript
if (options.id?.length > 0) {
  url.searchParams.set('id', options.id.join(','));
}
// Result: ?id=sys1,sys2,sys3
```

**OpenAPI spec schema:**
```yaml
schema:
  oneOf:
    - type: string        # Single ID
    - type: array         # Multiple IDs
      items:
        type: string
```

**Note:** `id` parameter is different from `{systemId}` path parameter. Query parameter filters collections; path parameter accesses specific resource.

30. **uid Parameter:** How to filter by unique identifier? URN format? Single value or multiple?

**Answer:** CSAPI does NOT have a separate `uid` parameter. The `id` parameter accepts **both** local IDs and unique identifiers (UIDs):

**Rationale:** The `id` parameter is polymorphic - accepts local IDs OR URN/URI identifiers:
```
id=sys1                           # Local ID
id=urn:uuid:550e8400-e29b-41d4    # UUID URN
id=urn:ogc:def:identifier:001     # OGC URN
id=http://example.org/systems/s1  # HTTP URI
```

**No separate uid parameter needed** - use `id` with URN/URI values.

**Schema note:** OpenAPI spec defines `idListSchema` as:
```yaml
idListSchema:
  description: List of resource local IDs or unique identifiers (URIs)
  oneOf:
    - type: string       # Can be local ID or URI
    - type: array        # Array of IDs or URIs
```

**Usage:**
```typescript
// Filter by unique IDs
getSystems({ 
  id: ['urn:uuid:123', 'urn:uuid:456'] 
});
```

31. **q Parameter:** How does full-text search work? What properties are searched? Case sensitivity?

**Answer:** The `q` parameter performs full-text keyword search:

**Format:** Comma-separated list of keywords (1-50 characters each)
```
q=temperature                    # Single keyword
q=temp,humidity,pressure         # Multiple keywords (OR logic)
q=weather,station                # Multiple keywords
```

**Searched properties:**
- `name` (always searched)
- `description` (always searched)
- Other textual fields (server-dependent)

**Search behavior:**
- **OR logic:** Resources matching **any** keyword are returned
- **Partial match:** Keyword can match part of text (e.g., "temp" matches "temperature")
- **Case insensitive:** Search is case-insensitive by default
- **Server-dependent:** Exact matching rules vary by implementation

**TypeScript signature:**
```typescript
q?: string[]  // Array of keywords (1-50 chars each)
```

**URL encoding:**
```typescript
if (options.q?.length > 0) {
  const keywords = options.q.filter(k => k.length >= 1 && k.length <= 50);
  url.searchParams.set('q', keywords.join(','));
}
// Result: ?q=temp,humidity
```

**OpenAPI spec:**
```yaml
keyword:
  name: q
  schema:
    type: array
    items:
      type: string
      minLength: 1
      maxLength: 50
  explode: false
```

**Applies to:** All resource types

32. **Property Filters:** How to filter by arbitrary resource properties? Example: `name=Weather%20Station`, `systemType=sosa:Sensor`?

**Answer:** CSAPI does NOT support arbitrary property filtering via query parameters in the OpenAPI spec.

**What IS supported:**
- `id` - Filter by resource IDs
- `q` - Full-text keyword search (searches name, description, and other text fields)
- Specific relationship filters: `parent`, `system`, `procedure`, `foi`, `observedProperty`, `controlledProperty`, `baseProperty`
- Spatial filters: `bbox`, `geom`
- Temporal filters: `datetime`, `phenomenonTime`, `resultTime`, etc.

**What is NOT supported:**
- Generic property filters like `name=value`, `systemType=uri`, `assetType=sensor`
- JSONPath or dot notation for nested properties
- Custom property filters

**Workaround:** Use `q` parameter for text-based properties:
```
q=weather,station  # Finds resources with "weather" or "station" in name/description
```

**Future consideration:** Some server implementations MAY support vendor-specific property filters, but these are not standardized in CSAPI spec.

**For exact property matching:** Client must fetch all resources and filter locally, or use relationship parameters (parent, system, etc.) to narrow search scope.

33. **recursive Parameter:** How does hierarchical recursion work? Boolean flag? `recursive=true` for all descendants?

**Answer:** The `recursive` parameter enables hierarchical traversal for nested resources:

**Format:** Boolean flag (`true` or `false`)
```
recursive=true     # Include all descendants recursively
recursive=false    # Direct children only (default)
```

**Applies to:**
- **Systems:** `GET /systems?recursive=true` - includes subsystems, sub-subsystems, etc.
- **Systems subsystems:** `GET /systems/{id}/subsystems?recursive=true` - all nested subsystems
- **Deployments:** `GET /deployments?recursive=true` - includes subdeployments at all levels
- **Deployments subdeployments:** `GET /deployments/{id}/subdeployments?recursive=true` - all nested subdeployments

**Behavior:**
- `recursive=false` (default): Returns only immediate children
- `recursive=true`: Returns entire hierarchy tree (all descendants)

**Example:**
```
System A
  ├─ Subsystem B
  │   └─ Subsystem D
  └─ Subsystem C

GET /systems/A/subsystems?recursive=false
→ Returns: [B, C]

GET /systems/A/subsystems?recursive=true
→ Returns: [B, C, D]
```

**TypeScript signature:**
```typescript
recursive?: boolean  // Default false
```

**URL encoding:**
```typescript
if (options.recursive !== undefined) {
  url.searchParams.set('recursive', options.recursive.toString());
}
```

**OpenAPI spec:**
```yaml
recursive:
  name: recursive
  schema:
    type: boolean
    default: false
  description: If true, instructs the server to include nested resources in the search results
```

**Performance note:** Recursive queries can return large result sets for deep hierarchies. Use with limit parameter to control response size.

34. **parent Parameter:** How to filter by parent resource? Single ID or multiple? Apply to systems and deployments?

**Answer:** The `parent` parameter filters resources by their parent resource ID:

**Format:** Comma-separated list of parent IDs (local or URN)
```
parent=sys1                         # Single parent
parent=sys1,sys2                    # Multiple parents (OR logic)
parent=urn:example:system:parent001 # Parent by URN
```

**Applies to:**
- **Systems:** Filter systems by parent system ID
- **Deployments:** Filter deployments by parent deployment ID

**Logic:** OR operation - returns resources with parent matching **any** of the provided IDs

**TypeScript signature:**
```typescript
parent?: string[]  // Array of parent IDs
```

**URL encoding:**
```typescript
if (options.parent?.length > 0) {
  url.searchParams.set('parent', options.parent.join(','));
}
// Result: ?parent=sys1,sys2
```

**OpenAPI spec:**
```yaml
parentIdList:
  name: parent
  schema:
    description: List of resource local IDs or unique IDs (URI)
    oneOf:
      - type: string
      - type: array
        items:
          type: string
```

**Usage examples:**
```typescript
// Get all subsystems of sys1 (without recursion)
GET /systems?parent=sys1

// Get all subdeployments of deployment123
GET /deployments?parent=deployment123

// Equivalent to nested endpoint (but uses canonical endpoint)
GET /systems?parent=sys1  ≈  GET /systems/sys1/subsystems
```

**Note:** Using nested endpoint (`/systems/{id}/subsystems`) is preferred over `parent` parameter for better RESTful semantics.

35. **system Parameter:** How to filter resources by associated system? Single ID or multiple? Apply to which resource types?

**Answer:** The `system` parameter filters resources by associated system ID:

**Format:** Comma-separated list of system IDs (local or URN)
```
system=sys1                         # Single system
system=sys1,sys2,sys3               # Multiple systems (OR logic)
system=urn:example:system:sensor001 # System by URN
```

**Applies to:**
- **Deployments:** Filter by deployed system
- **Procedures:** Filter by system implementing the procedure
- **Sampling Features:** Filter by system that uses the sampling feature
- **Properties:** Filter by system that measures/controls the property
- **DataStreams** (Part 2): Filter by system producing observations
- **Observations** (Part 2): Filter by observing system
- **ControlStreams** (Part 2): Filter by controlled system
- **Commands** (Part 2): Filter by target system

**Logic:** OR operation - returns resources associated with **any** of the provided systems

**TypeScript signature:**
```typescript
system?: string[]  // Array of system IDs
```

**URL encoding:**
```typescript
if (options.system?.length > 0) {
  url.searchParams.set('system', options.system.join(','));
}
// Result: ?system=sys1,sys2
```

**OpenAPI spec:**
```yaml
systemIdList:
  name: system
  schema:
    description: List of system local IDs or unique IDs (URI)
    oneOf:
      - type: string
      - type: array
        items:
          type: string
```

**Usage examples:**
```typescript
// Get all deployments of specific system
GET /deployments?system=weather-station-1

// Get all datastreams from multiple systems
GET /datastreams?system=sys1,sys2,sys3

// Equivalent to nested endpoint
GET /datastreams?system=sys1  ≈  GET /systems/sys1/datastreams
```

36. **deployment Parameter:** How to filter by deployment? Single ID or multiple?

**Answer:** The `deployment` parameter filters resources by deployment ID:

**Format:** Comma-separated list of deployment IDs (local or URN)
```
deployment=dep1                        # Single deployment
deployment=dep1,dep2                   # Multiple deployments (OR logic)
deployment=urn:example:deployment:mission01  # Deployment by URN
```

**Applies to:**
- **Systems:** Filter systems by deployment they're part of
- **Procedures:** Filter procedures by deployment context
- **Sampling Features:** Filter by deployment
- **DataStreams** (Part 2): Filter by deployment context
- **Observations** (Part 2): Filter by deployment during which observation was made
- **ControlStreams** (Part 2): Filter by deployment
- **Commands** (Part 2): Filter by deployment context

**Logic:** OR operation - returns resources associated with **any** of the provided deployments

**TypeScript signature:**
```typescript
deployment?: string[]  // Array of deployment IDs
```

**URL encoding:**
```typescript
if (options.deployment?.length > 0) {
  url.searchParams.set('deployment', options.deployment.join(','));
}
// Result: ?deployment=dep1,dep2
```

**Note:** OpenAPI spec does NOT explicitly define `deployment` parameter in Part 1. It's **implied** by the spec structure but not formally documented. Implementations SHOULD support it for consistency.

37. **procedure Parameter:** How to filter by procedure? Single ID or multiple?

**Answer:** The `procedure` parameter filters resources by procedure ID:

**Format:** Comma-separated list of procedure IDs (local or URN)
```
procedure=proc1                         # Single procedure
procedure=proc1,proc2                   # Multiple procedures (OR logic)
procedure=urn:example:procedure:method1 # Procedure by URN
```

**Applies to:**
- **Systems:** Filter systems that implement specific procedure(s)
- **DataStreams** (Part 2): Filter by acquisition procedure
- **Observations** (Part 2): Filter by observation procedure

**Logic:** OR operation - returns resources using **any** of the provided procedures

**TypeScript signature:**
```typescript
procedure?: string[]  // Array of procedure IDs
```

**URL encoding:**
```typescript
if (options.procedure?.length > 0) {
  url.searchParams.set('procedure', options.procedure.join(','));
}
// Result: ?procedure=proc1,proc2
```

**OpenAPI spec:**
```yaml
procedureIdList:
  name: procedure
  schema:
    description: List of procedure local IDs or unique IDs (URI)
    oneOf:
      - type: string
      - type: array
        items:
          type: string
```

**Usage:**
```typescript
// Get all systems implementing calibration procedure
GET /systems?procedure=calibration-method-v2

// Get observations made with specific procedure
GET /observations?procedure=satellite-imaging-v1
```

38. **foi Parameter:** How to filter by feature of interest? Single ID or multiple?

**Answer:** The `foi` parameter filters resources by feature of interest ID:

**Format:** Comma-separated list of FOI IDs (local or URN)
```
foi=sf1                                 # Single FOI
foi=sf1,sf2,sf3                         # Multiple FOIs (OR logic)
foi=urn:example:feature:location001     # FOI by URN
```

**Applies to:**
- **Systems:** Filter systems observing specific feature(s)
- **Deployments:** Filter deployments related to specific feature(s)
- **Sampling Features:** Filter by related feature of interest
- **DataStreams** (Part 2): Filter by ultimate feature of interest
- **Observations** (Part 2): Filter by feature being observed

**Logic:** OR operation - returns resources associated with **any** of the provided features

**TypeScript signature:**
```typescript
foi?: string[]  // Array of feature of interest IDs
```

**URL encoding:**
```typescript
if (options.foi?.length > 0) {
  url.searchParams.set('foi', options.foi.join(','));
}
// Result: ?foi=sf1,sf2
```

**OpenAPI spec:**
```yaml
foiIdList:
  name: foi
  schema:
    description: List of feature local IDs or unique IDs (URI)
    oneOf:
      - type: string
      - type: array
        items:
          type: string
```

**Usage:**
```typescript
// Get all observations of specific building
GET /observations?foi=building-123

// Get datastreams observing multiple locations
GET /datastreams?foi=loc1,loc2,loc3
```

39. **observedProperty Parameter:** How to filter by observed property? URI or ID? Single or multiple?

**Answer:** The `observedProperty` parameter filters resources by observed property:

**Format:** Comma-separated list of property IDs or URIs
```
observedProperty=temp                                    # Single property (local ID)
observedProperty=temp,humidity,pressure                  # Multiple (OR logic)
observedProperty=http://mmisw.org/ont/cf/parameter/air_temperature  # Property URI
```

**Applies to:**
- **Systems:** Filter systems observing specific property/properties
- **DataStreams** (Part 2): Filter by observed property
- **Observations** (Part 2): Filter by property being observed
- **Properties:** Filter properties by ID (redundant, but supported)

**ID vs URI:** Can use either local property ID OR full semantic URI

**Logic:** OR operation - returns resources observing **any** of the provided properties

**TypeScript signature:**
```typescript
observedProperty?: string[]  // Array of property IDs or URIs
```

**URL encoding:**
```typescript
if (options.observedProperty?.length > 0) {
  url.searchParams.set('observedProperty', options.observedProperty.join(','));
}
// Result: ?observedProperty=temp,humidity
```

**OpenAPI spec:**
```yaml
obsPropIdList:
  name: observedProperty
  schema:
    description: List of property local IDs or unique IDs (URI)
    oneOf:
      - type: string
      - type: array
        items:
          type: string
```

**Usage:**
```typescript
// Get all temperature datastreams
GET /datastreams?observedProperty=air-temperature

// Get observations of multiple properties
GET /observations?observedProperty=temp,humidity,pressure
```

40. **controlledProperty Parameter:** How to filter by controlled property? URI or ID? Single or multiple?

**Answer:** The `controlledProperty` parameter filters resources by controlled property:

**Format:** Comma-separated list of property IDs or URIs
```
controlledProperty=pan                                   # Single property (local ID)
controlledProperty=pan,tilt                              # Multiple (OR logic)
controlledProperty=http://example.org/ont/pan_angle      # Property URI
```

**Applies to:**
- **Systems:** Filter systems controlling specific property/properties
- **ControlStreams** (Part 2): Filter by controlled property
- **Commands** (Part 2): Filter by property being controlled
- **Properties:** Filter properties that are controllable

**ID vs URI:** Can use either local property ID OR full semantic URI

**Logic:** OR operation - returns resources controlling **any** of the provided properties

**TypeScript signature:**
```typescript
controlledProperty?: string[]  // Array of property IDs or URIs
```

**URL encoding:**
```typescript
if (options.controlledProperty?.length > 0) {
  url.searchParams.set('controlledProperty', options.controlledProperty.join(','));
}
// Result: ?controlledProperty=pan,tilt
```

**OpenAPI spec:**
```yaml
controlPropIdList:
  name: controlledProperty
  schema:
    description: List of property local IDs or unique IDs (URI)
    oneOf:
      - type: string
      - type: array
        items:
          type: string
```

**Usage:**
```typescript
// Get all pan-tilt control streams
GET /controlstreams?controlledProperty=pan,tilt

// Get commands controlling specific property
GET /commands?controlledProperty=camera-zoom
```

41. **baseProperty Parameter:** How to filter properties by base property? Property hierarchy?

**Answer:** The `baseProperty` parameter filters properties by their base property (parent in property hierarchy):

**Format:** Comma-separated list of base property IDs or URIs
```
baseProperty=temperature                                  # Single base property
baseProperty=temp,pressure                                # Multiple (OR logic)
baseProperty=http://mmisw.org/ont/cf/parameter/temperature  # Base property URI
```

**Applies to:**
- **Properties ONLY:** Filter derived properties by their base property

**Property hierarchy example:**
```
temperature (base)
  ├─ air_temperature (derived)
  ├─ water_temperature (derived)
  └─ surface_temperature (derived)
```

**Usage:**
```typescript
// Get all temperature-related properties
GET /properties?baseProperty=temperature
// Returns: air_temperature, water_temperature, surface_temperature

// Get properties derived from multiple base properties
GET /properties?baseProperty=temperature,pressure
```

**Logic:** OR operation - returns properties derived from **any** of the provided base properties

**TypeScript signature:**
```typescript
baseProperty?: string[]  // Array of base property IDs or URIs
```

**URL encoding:**
```typescript
if (options.baseProperty?.length > 0) {
  url.searchParams.set('baseProperty', options.baseProperty.join(','));
}
// Result: ?baseProperty=temperature,pressure
```

**OpenAPI spec:**
```yaml
basePropIdList:
  name: baseProperty
  schema:
    description: List of property local IDs or unique IDs (URI)
    oneOf:
      - type: string
      - type: array
        items:
          type: string
```

**Note:** Property hierarchy enables semantic querying - finding all temperature properties regardless of specific type.


### G. Part 2 Temporal Query Parameters

**Questions:**

42. **phenomenonTime Parameter:** How to encode when observation was made? ISO 8601 intervals? Primary temporal filter for observations?

**Answer:** The `phenomenonTime` parameter filters observations by when the phenomenon was observed:

**Format:** ISO 8601 instant or interval (same syntax as `datetime`)

**Single instant:**
```
phenomenonTime=2024-02-02T12:00:00Z     # Exact observation time
phenomenonTime=2024-02-02                # Shorthand (whole day)
```

**Closed interval:**
```
phenomenonTime=2024-01-01T00:00:00Z/2024-01-31T23:59:59Z  # January observations
phenomenonTime=2024-01-01/2024-01-31                       # Shorthand
```

**Open intervals:**
```
phenomenonTime=../2024-01-31             # All observations before Feb 1
phenomenonTime=2024-01-01/..             # All observations from Jan 1 onwards
phenomenonTime=../now                    # All observations up to now
phenomenonTime=now/..                    # Future scheduled observations
```

**Special keyword:**
```
phenomenonTime=latest                    # Most recent observation only
```

**Applies to:**
- **DataStreams:** Filter by phenomenon time extent
- **Observations:** **Primary temporal filter** - when phenomenon was observed

**Behavior:** Returns observations where `phenomenonTime` **intersects** the specified interval

**TypeScript signature:**
```typescript
phenomenonTime?: string  // ISO 8601 instant or interval
```

**URL encoding:**
```typescript
if (options.phenomenonTime) {
  url.searchParams.set('phenomenonTime', options.phenomenonTime);
}
```

**OpenAPI spec:**
```yaml
phenomenonTime:
  name: phenomenonTime
  schema:
    type: string  # ISO 8601 format
  description: Filter observations by phenomenon time
```

**Note:** `phenomenonTime` is the **when the phenomenon occurred** (e.g., when temperature was 25°C), distinct from `resultTime` (when result became available).

43. **resultTime Parameter:** How to encode when result became available? ISO 8601 intervals?

**Answer:** The `resultTime` parameter filters by when the observation result was produced/became available:

**Format:** ISO 8601 instant or interval (same syntax as `phenomenonTime`)

**Examples:**
```
resultTime=2024-02-02T12:05:00Z          # Result available at specific time
resultTime=2024-01-01/2024-01-31         # Results produced in January
resultTime=../now                        # All results available up to now
resultTime=latest                        # Most recently produced result
```

**Applies to:**
- **DataStreams:** Filter by result time extent
- **Observations:** Filter by when result was produced

**Phenomenon time vs Result time:**
- `phenomenonTime`: When phenomenon occurred (e.g., 12:00:00 - temperature measured)
- `resultTime`: When result became available (e.g., 12:05:00 - after processing/transmission)
- Usually `resultTime >= phenomenonTime` (processing delay)
- Can be equal for real-time systems

**Use cases:**
- Find observations processed/received in specific timeframe
- Query by data availability rather than phenomenon occurrence
- Filter by data latency

**TypeScript signature:**
```typescript
resultTime?: string  // ISO 8601 instant or interval
```

**URL encoding:**
```typescript
if (options.resultTime) {
  url.searchParams.set('resultTime', options.resultTime);
}
```

**OpenAPI spec:**
```yaml
resultTime:
  name: resultTime
  schema:
    type: string  # ISO 8601 format
  description: Filter observations by result time
```

44. **executionTime Parameter:** How to encode when command should be/was executed? ISO 8601 intervals?

**Answer:** The `executionTime` parameter filters commands by their scheduled/actual execution time:

**Format:** ISO 8601 instant or interval

**Examples:**
```
executionTime=2024-02-02T14:00:00Z       # Command executed at specific time
executionTime=2024-01-01/2024-01-31      # Commands executed in January
executionTime=now/..                     # Commands scheduled for future
executionTime=../now                     # Commands already executed
```

**Applies to:**
- **ControlStreams:** Filter by execution time extent
- **Commands:** Filter by when command should be/was executed

**Semantics:**
- **Scheduled:** When command should execute (future time)
- **Actual:** When command was executed (past time)
- Can be used for both scheduling and historical queries

**TypeScript signature:**
```typescript
executionTime?: string  // ISO 8601 instant or interval
```

**URL encoding:**
```typescript
if (options.executionTime) {
  url.searchParams.set('executionTime', options.executionTime);
}
```

**OpenAPI spec:** Part 2 spec does NOT explicitly document `executionTime` as query parameter, but `executionTime` is a property of commands, so filtering by it is **implied**. Implementations SHOULD support it.

45. **issueTime Parameter:** How to encode when command was issued? ISO 8601 intervals?

**Answer:** The `issueTime` parameter filters commands by when they were issued/submitted:

**Format:** ISO 8601 instant or interval

**Examples:**
```
issueTime=2024-02-02T13:00:00Z           # Command issued at specific time
issueTime=2024-01-01/2024-01-31          # Commands issued in January
issueTime=../now                         # All commands issued up to now
issueTime=2024-02-01/..                  # Commands issued from Feb 1 onwards
```

**Applies to:**
- **Commands:** Filter by when command was submitted to system

**Issue time vs Execution time:**
- `issueTime`: When command was submitted by client
- `executionTime`: When command should be/was executed by system
- Usually `executionTime >= issueTime` (scheduled for future or immediate)

**Use cases:**
- Find commands submitted in specific timeframe
- Query command history by submission time
- Audit trail of command issuance

**TypeScript signature:**
```typescript
issueTime?: string  // ISO 8601 instant or interval
```

**URL encoding:**
```typescript
if (options.issueTime) {
  url.searchParams.set('issueTime', options.issueTime);
}
```

**OpenAPI spec:** Part 2 spec does NOT explicitly document `issueTime` as query parameter, but `issueTime` is a property of commands, so filtering by it is **implied**. Implementations SHOULD support it.

46. **Temporal Interval Syntax:** What is the complete ISO 8601 interval syntax? Single instant, closed interval, open start, open end, multiple disjoint intervals?

**Answer:** Complete ISO 8601 temporal syntax for CSAPI query parameters:

**1. Single instant (exact time):**
```
2024-02-02T12:00:00Z                     # With time zone (UTC)
2024-02-02T12:00:00-05:00                # With time zone offset
2024-02-02                                # Date only (shorthand for whole day)
```

**2. Closed interval (start and end):**
```
2024-01-01T00:00:00Z/2024-01-31T23:59:59Z   # Full timestamp interval
2024-01-01/2024-01-31                        # Date interval (shorthand)
2024-01-15T10:00:00Z/PT1H                    # Start + duration (1 hour)
PT1H/2024-01-15T11:00:00Z                    # Duration + end
```

**3. Open start (everything before end):**
```
../2024-01-31                            # Everything up to Jan 31
../2024-01-31T23:59:59Z                  # Everything up to end of Jan 31
../now                                   # Everything up to current time
```

**4. Open end (everything after start):**
```
2024-01-01/..                            # Everything from Jan 1 onwards
2024-01-01T00:00:00Z/..                  # Everything from start of Jan 1
now/..                                   # Everything from now onwards (future)
```

**5. Special keywords:**
```
now                                      # Current time (can be used as instant or in interval)
latest                                   # Most recent resource only
```

**6. Duration format (ISO 8601 duration):**
```
PT1H                                     # 1 hour
PT30M                                    # 30 minutes
PT1H30M                                  # 1 hour 30 minutes
P1D                                      # 1 day
P1M                                      # 1 month
P1Y                                      # 1 year
P1DT12H                                  # 1 day 12 hours
```

**NOT supported (non-standard):**
- Multiple disjoint intervals: `2024-01-01/2024-01-15,2024-02-01/2024-02-15` ❌
- For multiple intervals, use separate queries and merge results client-side

**TypeScript types:**
```typescript
type ISO8601Instant = string;  // "2024-02-02T12:00:00Z"
type ISO8601Interval = string; // "2024-01-01/2024-01-31"
type TemporalQuery = ISO8601Instant | ISO8601Interval | 'now' | 'latest';
```

**Parsing pattern:**
- Single date/time: Instant
- Contains `/`: Interval
- Contains `..`: Open interval
- `now` or `latest`: Special keyword

47. **Offset-Based Pagination:** How to implement Part 1 style pagination? `limit` + `offset` parameters? How to calculate next page offset?

**Answer:** Part 1 offset-based pagination using `limit` and `offset` parameters:

**Parameters:**
- `limit`: Number of items per page (default 10, max 10,000)
- `offset`: Zero-based starting index (default 0)

**Page calculation:**
```typescript
// Page 1 (first 10 items)
GET /systems?limit=10&offset=0

// Page 2 (next 10 items)
GET /systems?limit=10&offset=10

// Page 3
GET /systems?limit=10&offset=20

// Calculate next page offset
const nextOffset = currentOffset + limit;
```

**Implementation pattern:**
```typescript
async function getSystems(options: {
  limit?: number;
  offset?: number;
  // ... other filters
}): Promise<{ items: System[]; hasMore: boolean }> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;
  
  const url = new URL(baseUrl);
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('offset', offset.toString());
  
  const response = await fetch(url.toString());
  const data = await response.json();
  
  return {
    items: data.features || data.items,
    hasMore: data.features?.length === limit  // More items if full page returned
  };
}
```

**Pagination logic:**
```typescript
// Fetch all pages
async function getAllSystems(): Promise<System[]> {
  const allSystems: System[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;
  
  while (hasMore) {
    const { items, hasMore: more } = await getSystems({ limit, offset });
    allSystems.push(...items);
    hasMore = more;
    offset += limit;
  }
  
  return allSystems;
}
```

**Advantages:**
- Simple to implement
- Easy to jump to specific page
- Predictable page sizes

**Disadvantages:**
- Performance degrades with large offsets (database skips many rows)
- Inconsistent results if data changes between requests (items added/deleted)
- Not ideal for real-time streaming data

**Part 1 resources using offset pagination:**
- Systems
- Deployments
- Procedures
- Sampling Features
- Properties

48. **Cursor-Based Pagination:** How to implement Part 2 style pagination? `limit` + `cursor` parameters? How to extract cursor from responses?

**Answer:** Part 2 MAY use cursor-based pagination for streaming data (observations, commands):

**Parameters:**
- `limit`: Number of items per page (default 10, max 10,000)
- `cursor`: Opaque pagination token (from previous response)

**Pattern:**
```typescript
// First request (no cursor)
GET /observations?limit=100

// Subsequent requests (with cursor from previous response)
GET /observations?limit=100&cursor=eyJpZCI6MTIzLCJ0aW1lIjoiMjAyNC0wMS0zMVQyMzo1OTo1OVoifQ==
```

**Response structure (with pagination metadata):**
```json
{
  "items": [ /* observations */ ],
  "links": [
    {
      "rel": "next",
      "href": "https://api.example.com/observations?limit=100&cursor=xyz123"
    },
    {
      "rel": "prev",
      "href": "https://api.example.com/observations?limit=100&cursor=abc456"
    }
  ]
}
```

**Implementation:**
```typescript
async function getObservations(options: {
  limit?: number;
  cursor?: string;
  // ... other filters
}): Promise<{
  items: Observation[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  const limit = options.limit ?? 10;
  const url = new URL(baseUrl);
  url.searchParams.set('limit', limit.toString());
  
  if (options.cursor) {
    url.searchParams.set('cursor', options.cursor);
  }
  
  const response = await fetch(url.toString());
  const data = await response.json();
  
  // Extract next cursor from Link header or response body
  const nextLink = data.links?.find((l: any) => l.rel === 'next');
  const nextCursor = nextLink ? new URL(nextLink.href).searchParams.get('cursor') : undefined;
  
  return {
    items: data.items,
    nextCursor: nextCursor ?? undefined,
    hasMore: !!nextCursor
  };
}
```

**Advantages:**
- Efficient for large datasets (no skipping rows)
- Consistent results even if data changes
- Ideal for streaming/real-time data
- No performance degradation

**Disadvantages:**
- Cannot jump to arbitrary page
- Must traverse sequentially
- Cursors are opaque (server-specific encoding)

**Note:** CSAPI Part 2 spec does NOT explicitly require cursor-based pagination. It's an **implementation choice** - servers MAY use offset or cursor pagination for Part 2 resources.

**Fallback:** If server doesn't provide cursor, use offset pagination for Part 2 resources.

49. **Pagination Limits:** What are the limit constraints? Min 1, max 10,000 for Part 2? Different for Part 1?

**Answer:** Pagination limits are **consistent across Part 1 and Part 2**:

**Constraints:**
- **Minimum:** 1 (single item)
- **Maximum:** 10,000 (ten thousand items)
- **Default:** 10 (if not specified)

**OpenAPI spec (both Part 1 and Part 2):**
```yaml
limit:
  name: limit
  schema:
    type: integer
    minimum: 1
    maximum: 10000
    default: 10
```

**Validation:**
```typescript
function validateLimit(limit?: number): number {
  const value = limit ?? 10;
  
  if (value < 1) {
    throw new Error('limit must be at least 1');
  }
  
  if (value > 10000) {
    throw new Error('limit cannot exceed 10000');
  }
  
  return value;
}
```

**Server behavior:**
- `limit` < 1: Server returns HTTP 400 Bad Request
- `limit` > 10,000: Server returns HTTP 400 Bad Request
- No `limit` specified: Server uses default (10)
- Server MAY return fewer items than limit (if insufficient matches)

**Practical recommendations:**
- **Interactive UIs:** Use limit=10-50 for responsive pagination
- **Batch processing:** Use limit=1000-10000 for efficient bulk retrieval
- **Streaming data:** Use smaller limits (100-500) with cursor pagination
- **Export/download:** Multiple requests with limit=10000 to minimize round trips

**Part 1 vs Part 2 - No difference:**
- Part 1 (Systems, Deployments, etc.): min 1, max 10,000, default 10
- Part 2 (DataStreams, Observations, etc.): min 1, max 10,000, default 10

50. **Link Headers:** Should QueryBuilder parse Link headers for next/prev pages? Or leave to handlers?

**Answer:** QueryBuilder should **parse links from response body**, NOT Link headers:

**CSAPI response structure (JSON body):**
```json
{
  "items": [ /* resources */ ],
  "links": [
    {
      "rel": "self",
      "href": "https://api.example.com/systems?limit=10&offset=0",
      "type": "application/json"
    },
    {
      "rel": "next",
      "href": "https://api.example.com/systems?limit=10&offset=10",
      "type": "application/json"
    },
    {
      "rel": "prev",
      "href": "https://api.example.com/systems?limit=10&offset=0",
      "type": "application/json"
    }
  ]
}
```

**Recommended approach:**
```typescript
interface PaginatedResponse<T> {
  items: T[];
  links?: Array<{
    rel: string;
    href: string;
    type?: string;
  }>;
}

async function getSystems(options?: QueryOptions): Promise<PaginatedResponse<System>> {
  const url = buildSystemsUrl(options);
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    items: data.features || data.items,
    links: data.links  // Return links from response body
  };
}

// Helper to extract next page URL
function getNextPageUrl(response: PaginatedResponse<any>): string | undefined {
  return response.links?.find(l => l.rel === 'next')?.href;
}

// Helper to fetch next page
async function getNextPage<T>(response: PaginatedResponse<T>): Promise<PaginatedResponse<T> | undefined> {
  const nextUrl = getNextPageUrl(response);
  if (!nextUrl) return undefined;
  
  const nextResponse = await fetch(nextUrl);
  return await nextResponse.json();
}
```

**Why body links over HTTP Link headers:**
1. **OGC API standard:** Specifies links in JSON response body
2. **Typed:** Links in body are part of JSON schema (type-safe)
3. **Consistent:** All OGC APIs use body links
4. **Metadata:** Body links include `type`, `title`, `uid` (not in HTTP headers)
5. **Cross-origin:** Body links work with CORS (headers may be filtered)

**HTTP Link headers (if present):**
Some servers MAY include HTTP Link headers for backwards compatibility:
```
Link: <https://api.example.com/systems?limit=10&offset=10>; rel="next"
Link: <https://api.example.com/systems?limit=10&offset=0>; rel="prev"
```

**Recommendation:**
- **Primary:** Parse links from response body
- **Fallback:** Parse Link headers if body links not present
- **Return:** Expose links to caller (don't hide pagination logic)
- **Helpers:** Provide utility methods for common pagination patterns


### I. Systems Resource Methods

**Questions:**

51. **Systems Endpoints:** What are ALL Systems endpoints? List all, get by ID, query, subsystems, by deployment, by procedure, in collection?

**Answer:** Complete list of Systems endpoints from OpenAPI Part 1 spec:

**Canonical endpoints:**
- `GET /systems` - List/query all top-level systems
- `POST /systems` - Create new top-level system
- `GET /systems/{systemId}` - Get specific system by ID
- `PUT /systems/{systemId}` - Replace system (complete update)
- `DELETE /systems/{systemId}` - Delete system (with optional cascade)

**Hierarchical endpoints:**
- `GET /systems/{systemId}/subsystems` - List subsystems of specific system
- `POST /systems/{systemId}/subsystems` - Add subsystem to specific system

**Association endpoints:**
- `GET /systems/{systemId}/deployments` - List deployments of specific system (association navigation)
- `GET /systems/{systemId}/samplingFeatures` - List sampling features of specific system
- `GET /systems/{systemId}/datastreams` - List datastreams of specific system (Part 2)
- `GET /systems/{systemId}/controlstreams` - List control streams of specific system (Part 2)

**Query by relationship (canonical endpoint with filters):**
- `GET /systems?deployment={id}` - Systems in specific deployment
- `GET /systems?procedure={id}` - Systems implementing specific procedure
- `GET /systems?foi={id}` - Systems observing specific feature
- `GET /systems?parent={id}` - Subsystems of specific parent (alternative to nested)

**History (if supported by server):**
- `GET /systems/{systemId}/history` - Historical versions of system description

**Total: 13+ distinct endpoint patterns for Systems**

52. **Systems Query Parameters:** What query parameters apply to Systems? bbox, datetime, recursive, parent, deployment, procedure, foi, id, uid, q, properties, limit, offset, f?

**Answer:** Query parameters for Systems endpoints from OpenAPI Part 1 spec:

**Spatial filters:**
- `bbox` - Bounding box (comma-separated: minLon,minLat,maxLon,maxLat)
- `geom` - WKT geometry for spatial intersection

**Temporal filters:**
- `datetime` - ISO 8601 instant/interval for validity period

**Identifier filters:**
- `id` - Comma-separated list of local IDs or URNs

**Text search:**
- `q` - Comma-separated keywords for full-text search

**Relationship filters:**
- `parent` - Filter by parent system ID (for hierarchical queries)
- `deployment` - Filter by deployment ID
- `procedure` - Filter by procedure ID
- `foi` - Filter by feature of interest ID
- `observedProperty` - Filter by observed property
- `controlledProperty` - Filter by controlled property

**Hierarchical control:**
- `recursive` - Boolean flag (true = include all descendants)

**Pagination:**
- `limit` - Max items per page (1-10000, default 10)
- `offset` - Zero-based starting index (default 0)

**Format negotiation:**
- `f` - Response format (json, geojson, sml+json, html)

**Complete TypeScript interface:**
```typescript
interface SystemQueryOptions {
  // Spatial
  bbox?: [number, number, number, number];
  geom?: string;  // WKT geometry
  
  // Temporal
  datetime?: string;  // ISO 8601
  
  // Identifiers
  id?: string[];
  
  // Text search
  q?: string[];
  
  // Relationships
  parent?: string[];
  deployment?: string[];
  procedure?: string[];
  foi?: string[];
  observedProperty?: string[];
  controlledProperty?: string[];
  
  // Hierarchical
  recursive?: boolean;
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // Format
  f?: 'json' | 'geojson' | 'sml+json' | 'html';
}
```

**Note:** Not all parameters apply to all endpoints (e.g., `parent` doesn't make sense for `/systems/{id}/subsystems`).

53. **Subsystems Hierarchy:** How to query subsystems? Recursive flag? `/systems/{id}/subsystems?recursive=true`?

**Answer:** Subsystems can be queried via nested endpoint with recursive flag:

**Nested endpoint (preferred):**
```
GET /systems/{systemId}/subsystems
GET /systems/{systemId}/subsystems?recursive=true
GET /systems/{systemId}/subsystems?recursive=false
```

**Canonical endpoint with parent filter (alternative):**
```
GET /systems?parent={systemId}
GET /systems?parent={systemId}&recursive=true
```

**Recursive behavior:**

**Non-recursive (recursive=false or omitted):**
```
System A
  ├─ Subsystem B
  │   └─ Subsystem D
  └─ Subsystem C

GET /systems/A/subsystems
Returns: [B, C]  (direct children only)
```

**Recursive (recursive=true):**
```
System A
  ├─ Subsystem B
  │   └─ Subsystem D
  └─ Subsystem C

GET /systems/A/subsystems?recursive=true
Returns: [B, C, D]  (all descendants)
```

**Method signatures:**
```typescript
// Direct children only
async getSubsystems(
  parentId: string,
  options?: Omit<SystemQueryOptions, 'parent'>
): Promise<System[]>

// With recursive flag
async getSubsystems(
  parentId: string,
  options?: SystemQueryOptions & { recursive?: boolean }
): Promise<System[]>
```

**Implementation:**
```typescript
async getSubsystems(
  parentId: string,
  options?: SystemQueryOptions
): Promise<System[]> {
  const baseUrl = this.getResourceLink('systems');
  const url = new URL(`${baseUrl}/${parentId}/subsystems`);
  
  // Add recursive parameter
  if (options?.recursive !== undefined) {
    url.searchParams.set('recursive', options.recursive.toString());
  }
  
  // Add other query parameters
  this.addStandardQueryParams(url, options);
  
  return this.fetchResource<System[]>(url.toString());
}
```

**Use cases:**
- **Non-recursive:** UI tree view with lazy loading (load one level at a time)
- **Recursive:** Export/analysis needing complete system hierarchy
- **Performance:** Recursive queries can return large datasets - use `limit` to control size

54. **Systems CRUD:** What CRUD operations for Systems? POST `/systems`, PUT/PATCH `/systems/{id}`, DELETE `/systems/{id}?cascade=true`?

**Answer:** Complete CRUD operations for Systems from OpenAPI Part 1 spec:

**CREATE (POST):**
```
POST /systems
Content-Type: application/geo+json | application/sml+json
Body: System resource (without ID - server assigns)

Response: 201 Created
Location: https://api.example.com/systems/{new-id}
```

**CREATE subsystem (POST to nested):**
```
POST /systems/{parentId}/subsystems
Content-Type: application/geo+json | application/sml+json
Body: Subsystem resource

Response: 201 Created
Location: https://api.example.com/systems/{new-subsystem-id}
```

**READ (GET):**
```
GET /systems/{systemId}
Accept: application/geo+json | application/sml+json

Response: 200 OK
Body: System resource
```

**UPDATE - Replace (PUT):**
```
PUT /systems/{systemId}
Content-Type: application/geo+json | application/sml+json
Body: Complete system resource

Response: 204 No Content (or 200 OK with body)
```

**UPDATE - Partial (PATCH):**
```
PATCH /systems/{systemId}
Content-Type: application/merge-patch+json
Body: Partial system properties to update

Response: 204 No Content (or 200 OK with body)
```

**Note:** OpenAPI spec defines PUT but NOT PATCH. PATCH support is **implementation-dependent**.

**DELETE:**
```
DELETE /systems/{systemId}

Response: 204 No Content (success)
         409 Conflict (has dependents, cascade required)
```

**DELETE with cascade:**
```
DELETE /systems/{systemId}?cascade=true

Response: 204 No Content
Deletes: System + subsystems + datastreams + observations + controlstreams + commands
```

**Method signatures:**
```typescript
// Create
async createSystem(body: SystemInput): Promise<System>
async createSubsystem(parentId: string, body: SystemInput): Promise<System>

// Read
async getSystem(systemId: string, options?: { datetime?: string, f?: Format }): Promise<System>

// Update
async updateSystem(systemId: string, body: SystemInput): Promise<System>
async patchSystem(systemId: string, updates: Partial<SystemInput>): Promise<System>

// Delete
async deleteSystem(systemId: string, options?: { cascade?: boolean }): Promise<void>
```

**Response codes:**
- 200 OK - Successful GET/PUT/PATCH with body
- 201 Created - Successful POST (with Location header)
- 204 No Content - Successful DELETE or PUT/PATCH without body
- 400 Bad Request - Validation error
- 404 Not Found - System doesn't exist
- 409 Conflict - Cannot delete (has dependents)
- 422 Unprocessable Entity - Semantic validation error


### J. Deployments Resource Methods

**Questions:**

55. **Deployments Endpoints:** What are ALL Deployments endpoints? List all, get by ID, query, subdeployments, by system, in collection?

**Answer:** Complete list of Deployments endpoints from OpenAPI Part 1 spec:

**Canonical endpoints:**
- `GET /deployments` - List/query all top-level deployments
- `POST /deployments` - Create new top-level deployment
- `GET /deployments/{deploymentId}` - Get specific deployment by ID
- `PUT /deployments/{deploymentId}` - Replace deployment (complete update)
- `DELETE /deployments/{deploymentId}` - Delete deployment

**Hierarchical endpoints:**
- `GET /deployments/{deploymentId}/subdeployments` - List subdeployments of specific deployment
- `POST /deployments/{deploymentId}/subdeployments` - Add subdeployment to specific deployment

**Association endpoints (reverse navigation):**
- `GET /systems/{systemId}/deployments` - List deployments of specific system

**Query by relationship (canonical endpoint with filters):**
- `GET /deployments?system={id}` - Deployments containing specific system
- `GET /deployments?foi={id}` - Deployments at specific feature of interest
- `GET /deployments?parent={id}` - Subdeployments of specific parent

**History (if supported):**
- `GET /deployments/{deploymentId}/history` - Historical versions

**Total: 10+ distinct endpoint patterns for Deployments**

56. **Deployments Query Parameters:** What query parameters apply to Deployments? bbox, datetime, system, recursive, parent, id, uid, q, properties, limit, offset, f?

**Answer:** Query parameters for Deployments endpoints from OpenAPI Part 1 spec:

**Spatial filters:**
- `bbox` - Bounding box for deployment location
- `geom` - WKT geometry for spatial intersection

**Temporal filters:**
- `datetime` - ISO 8601 instant/interval for deployment validity period

**Identifier filters:**
- `id` - Comma-separated list of local IDs or URNs

**Text search:**
- `q` - Comma-separated keywords for full-text search

**Relationship filters:**
- `parent` - Filter by parent deployment ID (for hierarchical queries)
- `system` - Filter by deployed system ID
- `foi` - Filter by feature of interest ID
- `observedProperty` - Filter by observed property (systems in deployment)
- `controlledProperty` - Filter by controlled property (systems in deployment)

**Hierarchical control:**
- `recursive` - Boolean flag (true = include all subdeployments recursively)

**Pagination:**
- `limit` - Max items per page (1-10000, default 10)
- `offset` - Zero-based starting index (default 0)

**Format negotiation:**
- `f` - Response format (json, geojson, html)

**TypeScript interface:**
```typescript
interface DeploymentQueryOptions {
  // Spatial
  bbox?: [number, number, number, number];
  geom?: string;
  
  // Temporal
  datetime?: string;
  
  // Identifiers
  id?: string[];
  
  // Text search
  q?: string[];
  
  // Relationships
  parent?: string[];
  system?: string[];
  foi?: string[];
  observedProperty?: string[];
  controlledProperty?: string[];
  
  // Hierarchical
  recursive?: boolean;
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // Format
  f?: 'json' | 'geojson' | 'html';
}
```

57. **Subdeployments Hierarchy:** How to query subdeployments? Recursive flag? `/deployments/{id}/subdeployments?recursive=true`?

**Answer:** Subdeployments can be queried via nested endpoint with recursive flag:

**Nested endpoint (preferred):**
```
GET /deployments/{deploymentId}/subdeployments
GET /deployments/{deploymentId}/subdeployments?recursive=true
```

**Canonical endpoint with parent filter (alternative):**
```
GET /deployments?parent={deploymentId}
GET /deployments?parent={deploymentId}&recursive=true
```

**Recursive behavior (same as Systems):**
```
Deployment A
  ├─ Subdeployment B
  │   └─ Subdeployment D
  └─ Subdeployment C

GET /deployments/A/subdeployments
Returns: [B, C]  (direct children only)

GET /deployments/A/subdeployments?recursive=true
Returns: [B, C, D]  (all descendants)
```

**Method signature:**
```typescript
async getSubdeployments(
  parentId: string,
  options?: DeploymentQueryOptions
): Promise<Deployment[]> {
  const baseUrl = this.getResourceLink('deployments');
  const url = new URL(`${baseUrl}/${parentId}/subdeployments`);
  
  if (options?.recursive !== undefined) {
    url.searchParams.set('recursive', options.recursive.toString());
  }
  
  this.addStandardQueryParams(url, options);
  return this.fetchResource<Deployment[]>(url.toString());
}
```

**Use cases:**
- **Mission planning:** Nested deployments for complex missions (e.g., Arctic mission with multiple platform deployments)
- **Hierarchical campaigns:** Multi-level deployment structures (campaign → mission → platform)

58. **Deployments CRUD:** What CRUD operations for Deployments? POST, PUT/PATCH, DELETE with cascade?

**Answer:** Complete CRUD operations for Deployments from OpenAPI Part 1 spec:

**CREATE (POST):**
```
POST /deployments
Content-Type: application/geo+json
Body: Deployment resource (without ID)

Response: 201 Created
Location: https://api.example.com/deployments/{new-id}
```

**CREATE subdeployment:**
```
POST /deployments/{parentId}/subdeployments
Content-Type: application/geo+json
Body: Subdeployment resource

Response: 201 Created
```

**READ (GET):**
```
GET /deployments/{deploymentId}
Accept: application/geo+json

Response: 200 OK
Body: Deployment resource
```

**UPDATE - Replace (PUT):**
```
PUT /deployments/{deploymentId}
Content-Type: application/geo+json
Body: Complete deployment resource

Response: 204 No Content
```

**DELETE:**
```
DELETE /deployments/{deploymentId}

Response: 204 No Content (success)
         409 Conflict (has subdeployments or other dependents)
```

**Method signatures:**
```typescript
// Create
async createDeployment(body: DeploymentInput): Promise<Deployment>
async createSubdeployment(parentId: string, body: DeploymentInput): Promise<Deployment>

// Read
async getDeployment(deploymentId: string, options?: { f?: Format }): Promise<Deployment>

// Update
async updateDeployment(deploymentId: string, body: DeploymentInput): Promise<Deployment>

// Delete
async deleteDeployment(deploymentId: string): Promise<void>
```

**Note:** OpenAPI spec does NOT define `cascade` parameter for Deployments DELETE. Deletion fails (409 Conflict) if deployment has subdeployments or other dependencies.


### K. Procedures Resource Methods

**Questions:**

59. **Procedures Endpoints:** What are ALL Procedures endpoints? List all, get by ID, query, by system, in collection?

**Answer:** Complete list of Procedures endpoints from OpenAPI Part 1 spec:

**Canonical endpoints:**
- `GET /procedures` - List/query all procedures
- `POST /procedures` - Create new procedure
- `GET /procedures/{procedureId}` - Get specific procedure by ID
- `PUT /procedures/{procedureId}` - Replace procedure (complete update)
- `DELETE /procedures/{procedureId}` - Delete procedure

**Query by relationship (canonical endpoint with filters):**
- `GET /procedures?system={id}` - Procedures implemented by specific system

**No nested endpoints:** Procedures don't have hierarchical structure (no subprocedures)

**No association endpoints:** No reverse navigation from systems to procedures (use canonical with filter)

**History (if supported):**
- `GET /procedures/{procedureId}/history` - Historical versions of procedure

**Total: 6 distinct endpoint patterns for Procedures**

**Note:** Procedures are often **shared resources** (multiple systems implement same procedure), so they're typically managed separately from systems.

60. **Procedures Query Parameters:** What query parameters apply to Procedures? system, id, uid, q, properties, limit, offset, f?

**Answer:** Query parameters for Procedures endpoints from OpenAPI Part 1 spec:

**NO spatial/temporal filters:** Procedures are abstract methods (not spatially/temporally bound)

**Identifier filters:**
- `id` - Comma-separated list of local IDs or URNs

**Text search:**
- `q` - Comma-separated keywords for full-text search

**Relationship filters:**
- `system` - Filter by system ID (procedures implemented by system)

**Pagination:**
- `limit` - Max items per page (1-10000, default 10)
- `offset` - Zero-based starting index (default 0)

**Format negotiation:**
- `f` - Response format (json, geojson, sml+json, html)

**TypeScript interface:**
```typescript
interface ProcedureQueryOptions {
  // Identifiers
  id?: string[];
  
  // Text search
  q?: string[];
  
  // Relationships
  system?: string[];
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // Format
  f?: 'json' | 'geojson' | 'sml+json' | 'html';
}
```

**Simplified compared to Systems/Deployments:** No bbox, datetime, parent, recursive (procedures are simple resources)

61. **Procedures CRUD:** What CRUD operations for Procedures? POST, PUT/PATCH, DELETE?

**Answer:** Complete CRUD operations for Procedures from OpenAPI Part 1 spec:

**CREATE (POST):**
```
POST /procedures
Content-Type: application/sml+json | application/geo+json
Body: Procedure resource (without ID)

Response: 201 Created
Location: https://api.example.com/procedures/{new-id}
```

**READ (GET):**
```
GET /procedures/{procedureId}
Accept: application/sml+json | application/geo+json

Response: 200 OK
Body: Procedure resource (detailed SensorML description)
```

**UPDATE - Replace (PUT):**
```
PUT /procedures/{procedureId}
Content-Type: application/sml+json
Body: Complete procedure resource

Response: 204 No Content
```

**DELETE:**
```
DELETE /procedures/{procedureId}

Response: 204 No Content (success)
         409 Conflict (procedure in use by systems/datastreams)
```

**Method signatures:**
```typescript
// Create
async createProcedure(body: ProcedureInput): Promise<Procedure>

// Read
async getProcedure(procedureId: string, options?: { f?: Format }): Promise<Procedure>

// Update
async updateProcedure(procedureId: string, body: ProcedureInput): Promise<Procedure>

// Delete
async deleteProcedure(procedureId: string): Promise<void>
```

**Important:** Procedures are often **referenced** by multiple systems. Deleting a procedure may fail (409 Conflict) if systems/datastreams reference it. No cascade delete for procedures.

62. **SensorML Format:** How to handle SensorML format for Procedures? `f=sml+json` parameter?

**Answer:** Procedures support SensorML 3.0 JSON format for detailed method descriptions:

**Format negotiation via query parameter:**
```
GET /procedures/{id}?f=sml+json
GET /procedures/{id}?f=geojson
GET /procedures/{id}?f=json
```

**Format negotiation via Accept header:**
```
GET /procedures/{id}
Accept: application/sml+json

GET /procedures/{id}
Accept: application/geo+json
```

**SensorML format characteristics:**
- **Detailed:** Complete procedure specification (inputs, outputs, parameters, algorithms)
- **Semantic:** Rich metadata with definitions and ontology links
- **Structured:** Hierarchical process description
- **Standard:** SensorML 3.0 JSON encoding

**GeoJSON format characteristics:**
- **Simple:** Basic procedure information (name, description, links)
- **Lightweight:** Minimal metadata
- **Spatial:** Can include geometry if procedure is location-specific

**Method signature:**
```typescript
async getProcedure(
  procedureId: string,
  options?: { f?: 'sml+json' | 'geojson' | 'json' }
): Promise<Procedure>
```

**Implementation:**
```typescript
async getProcedure(
  procedureId: string,
  options?: { f?: Format }
): Promise<Procedure> {
  const baseUrl = this.getResourceLink('procedures');
  const url = new URL(`${baseUrl}/${procedureId}`);
  
  // Add format parameter
  if (options?.f) {
    url.searchParams.set('f', options.f);
  }
  
  // Alternatively, use Accept header
  const headers: Record<string, string> = {};
  if (options?.f === 'sml+json') {
    headers['Accept'] = 'application/sml+json';
  } else if (options?.f === 'geojson') {
    headers['Accept'] = 'application/geo+json';
  }
  
  const response = await fetch(url.toString(), { headers });
  return await response.json();
}
```

**Use cases:**
- **SensorML:** Detailed procedure documentation, calibration specs, algorithm descriptions
- **GeoJSON:** Quick procedure lookup, UI display, simple queries

**Default:** Server returns GeoJSON by default if no format specified


### L. Sampling Features Resource Methods

**Questions:**

63. **Sampling Features Endpoints:** What are ALL Sampling Features endpoints? List all, get by ID, query, by system, by foi, in collection?

**Answer:** Complete list of Sampling Features endpoints from OpenAPI Part 1 spec:

**Canonical endpoints:**
- `GET /samplingFeatures` - List/query all sampling features
- `POST /samplingFeatures` - Create new sampling feature
- `GET /samplingFeatures/{featureId}` - Get specific sampling feature by ID
- `PUT /samplingFeatures/{featureId}` - Replace sampling feature (complete update)
- `DELETE /samplingFeatures/{featureId}` - Delete sampling feature

**Association endpoints (reverse navigation):**
- `GET /systems/{systemId}/samplingFeatures` - List sampling features of specific system

**Query by relationship (canonical endpoint with filters):**
- `GET /samplingFeatures?system={id}` - Sampling features used by specific system
- `GET /samplingFeatures?foi={id}` - Sampling features related to specific feature of interest

**No hierarchical structure:** Sampling features don't have parent-child relationships (flat structure)

**History (if supported):**
- `GET /samplingFeatures/{featureId}/history` - Historical versions

**Total: 7 distinct endpoint patterns for Sampling Features**

64. **Sampling Features Query Parameters:** What query parameters apply to Sampling Features? bbox, system, foi, relatedSamplingFeature, id, uid, q, properties, limit, offset, f?

**Answer:** Query parameters for Sampling Features endpoints from OpenAPI Part 1 spec:

**Spatial filters:**
- `bbox` - Bounding box (sampling features have locations)
- `geom` - WKT geometry for spatial intersection

**NO temporal filter:** Sampling features don't have temporal extent (use system/deployment datetime instead)

**Identifier filters:**
- `id` - Comma-separated list of local IDs or URNs

**Text search:**
- `q` - Comma-separated keywords for full-text search

**Relationship filters:**
- `system` - Filter by system ID (sampling features used by system)
- `foi` - Filter by ultimate feature of interest ID

**Pagination:**
- `limit` - Max items per page (1-10000, default 10)
- `offset` - Zero-based starting index (default 0)

**Format negotiation:**
- `f` - Response format (json, geojson, html)

**TypeScript interface:**
```typescript
interface SamplingFeatureQueryOptions {
  // Spatial
  bbox?: [number, number, number, number];
  geom?: string;
  
  // Identifiers
  id?: string[];
  
  // Text search
  q?: string[];
  
  // Relationships
  system?: string[];
  foi?: string[];
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // Format
  f?: 'json' | 'geojson' | 'html';
}
```

**Note:** OpenAPI spec does NOT define `relatedSamplingFeature` parameter. Sampling feature relationships are typically expressed via `foi` parameter or geometry relationships.

65. **Sampling Features CRUD:** What CRUD operations for Sampling Features? POST, PUT/PATCH, DELETE?

**Answer:** Complete CRUD operations for Sampling Features from OpenAPI Part 1 spec:

**CREATE (POST):**
```
POST /samplingFeatures
Content-Type: application/geo+json
Body: Sampling feature resource (without ID)

Response: 201 Created
Location: https://api.example.com/samplingFeatures/{new-id}
```

**READ (GET):**
```
GET /samplingFeatures/{featureId}
Accept: application/geo+json

Response: 200 OK
Body: Sampling feature resource (GeoJSON Feature)
```

**UPDATE - Replace (PUT):**
```
PUT /samplingFeatures/{featureId}
Content-Type: application/geo+json
Body: Complete sampling feature resource

Response: 204 No Content
```

**DELETE:**
```
DELETE /samplingFeatures/{featureId}

Response: 204 No Content (success)
         409 Conflict (feature referenced by observations/datastreams)
```

**Method signatures:**
```typescript
// Create
async createSamplingFeature(body: SamplingFeatureInput): Promise<SamplingFeature>

// Read
async getSamplingFeature(featureId: string, options?: { f?: Format }): Promise<SamplingFeature>

// Update
async updateSamplingFeature(featureId: string, body: SamplingFeatureInput): Promise<SamplingFeature>

// Delete
async deleteSamplingFeature(featureId: string): Promise<void>
```

**Important:** Sampling features are often **shared resources** (multiple observations/datastreams reference same sampling feature). Deleting may fail (409 Conflict) if referenced. No cascade delete.


### M. Properties Resource Methods

**Questions:**

66. **Properties Endpoints:** What are ALL Properties endpoints? List all, get by ID, query, by system, by base property, in collection?

**Answer:** Complete list of Properties endpoints from OpenAPI Part 1 spec:

**Canonical endpoints (READ-ONLY):**
- `GET /properties` - List/query all properties
- `GET /properties/{propId}` - Get specific property by ID

**Query by relationship (canonical endpoint with filters):**
- `GET /properties?system={id}` - Properties observed/controlled by specific system
- `GET /properties?baseProperty={id}` - Properties derived from specific base property (hierarchy)
- `GET /properties?objectType={uri}` - Properties of specific object type

**NO CREATE/UPDATE/DELETE:** Properties are **read-only** (managed by server, not user-editable)

**NO nested endpoints:** Properties are flat resources (no sub-properties via nested paths)

**NO association endpoints:** No reverse navigation from systems to properties

**Total: 4 endpoint patterns for Properties (all read-only)**

**Rationale:** Properties define the vocabulary of observable/controllable phenomena. They're typically managed centrally (not created by individual users).

67. **Properties Query Parameters:** What query parameters apply to Properties? system, baseProperty, id, uid, q, properties, limit, offset, f?

**Answer:** Query parameters for Properties endpoints from OpenAPI Part 1 spec:

**NO spatial/temporal filters:** Properties are abstract concepts (not spatially/temporally bound)

**Identifier filters:**
- `id` - Comma-separated list of local IDs or URNs

**Text search:**
- `q` - Comma-separated keywords for full-text search

**Relationship filters:**
- `system` - Filter by system ID (properties measured/controlled by system)
- `baseProperty` - Filter by base property ID (for hierarchy queries)
- `objectType` - Filter by object type URI (semantic classification)

**Pagination:**
- `limit` - Max items per page (1-10000, default 10)
- `offset` - Zero-based starting index (default 0)

**Format negotiation:**
- `f` - Response format (json, html)

**TypeScript interface:**
```typescript
interface PropertyQueryOptions {
  // Identifiers
  id?: string[];
  
  // Text search
  q?: string[];
  
  // Relationships
  system?: string[];
  baseProperty?: string[];
  objectType?: string[];  // URIs
  
  // Pagination
  limit?: number;
  offset?: number;
  
  // Format
  f?: 'json' | 'html';
}
```

**Note:** Properties don't use GeoJSON format (no spatial component).

68. **Properties Read-Only:** Are Properties read-only (GET only)? No CRUD operations?

**Answer:** Yes, Properties are **READ-ONLY** resources:

**Supported operations:**
```
GET /properties               ✓ List all properties
GET /properties/{propId}      ✓ Get specific property
```

**NOT supported:**
```
POST /properties              ✗ Cannot create properties
PUT /properties/{propId}      ✗ Cannot update properties
DELETE /properties/{propId}   ✗ Cannot delete properties
```

**Method signatures:**
```typescript
// Only read operations
async getProperties(options?: PropertyQueryOptions): Promise<Property[]>
async getProperty(propId: string, options?: { f?: Format }): Promise<Property>

// No create/update/delete methods
```

**Rationale:**
1. **Vocabulary management:** Properties define standard terminology (centrally managed)
2. **Semantic consistency:** Prevents users from creating conflicting property definitions
3. **Interoperability:** Ensures consistent property URIs across systems
4. **Ontology-driven:** Properties typically derived from standard ontologies (CF, QUDT, etc.)

**Server management:** Properties are typically:
- Pre-populated from standard vocabularies
- Managed by administrators (not regular API users)
- Updated through server configuration (not API calls)

**For custom properties:** Servers MAY provide admin endpoints outside CSAPI spec, but this is implementation-specific.

69. **Property Hierarchy:** How to query property hierarchies? `baseProperty` parameter for parent-child relationships?

**Answer:** Property hierarchies are queried using `baseProperty` parameter:

**Hierarchy example:**
```
temperature (base)
  ├─ air_temperature (derived)
  ├─ water_temperature (derived)
  └─ surface_temperature (derived)

pressure (base)
  ├─ air_pressure (derived)
  └─ water_pressure (derived)
```

**Query derived properties:**
```
GET /properties?baseProperty=temperature
Returns: [air_temperature, water_temperature, surface_temperature]

GET /properties?baseProperty=temperature,pressure
Returns: [air_temperature, water_temperature, surface_temperature, air_pressure, water_pressure]
```

**Query specific property:**
```
GET /properties/air_temperature
Response:
{
  "id": "air_temperature",
  "name": "Air Temperature",
  "definition": "http://mmisw.org/ont/cf/parameter/air_temperature",
  "baseProperty@link": {
    "href": "https://api.example.com/properties/temperature",
    "uid": "http://mmisw.org/ont/cf/parameter/temperature"
  },
  "objectType": "http://www.w3.org/ns/ssn/Property"
}
```

**Method signature:**
```typescript
async getProperties(options?: {
  baseProperty?: string[];  // Filter by base property
  // ... other options
}): Promise<Property[]>
```

**Implementation:**
```typescript
async getProperties(options?: PropertyQueryOptions): Promise<Property[]> {
  const url = new URL(this.getResourceLink('properties'));
  
  // Add baseProperty filter
  if (options?.baseProperty?.length > 0) {
    url.searchParams.set('baseProperty', options.baseProperty.join(','));
  }
  
  this.addStandardQueryParams(url, options);
  return this.fetchResource<Property[]>(url.toString());
}
```

**Use cases:**
- **Semantic search:** Find all temperature-related properties
- **Property discovery:** Explore property vocabulary
- **UI filtering:** Group properties by category
- **Query expansion:** Query observations for any temperature type

**Note:** Hierarchy is **single-level** (base → derived). No multi-level hierarchies in CSAPI spec.


### N. DataStreams Resource Methods

**Questions:**

70. **DataStreams Endpoints:** What are ALL DataStreams endpoints? List all, get by ID, query, by system, schema endpoint, in collection?

**Answer:**


71. **DataStreams Query Parameters:** What query parameters apply to DataStreams? system, observedProperty, foi, samplingFeature, procedure, datetime, id, uid, q, properties, limit, offset, f?

**Answer:**


72. **Schema Endpoint:** How to construct schema endpoint URL? `/datastreams/{id}/schema`? What format?

**Answer:**


73. **DataStreams CRUD:** What CRUD operations for DataStreams? POST, PUT/PATCH, DELETE with cascade?

**Answer:**


74. **Result Format Parameters:** Are there special format parameters for DataStreams? `obsFormat` parameter?

**Answer:**


### O. Observations Resource Methods

**Questions:**

75. **Observations Endpoints:** What are ALL Observations endpoints? List all, get by ID, by datastream, query with temporal filters?

**Answer:**


76. **Observations Query Parameters:** What query parameters apply to Observations? phenomenonTime (PRIMARY), resultTime, foi, id, limit, offset, cursor, f, obsFormat?

**Answer:**


77. **Temporal Queries:** What are ALL phenomenonTime query patterns? Single instant, closed interval, open start, open end, multiple disjoint intervals?

**Answer:**


78. **Cursor Pagination:** How to implement cursor-based pagination for Observations? Extract cursor from response headers or body? Pass as query parameter?

**Answer:**


79. **Observations CRUD:** What CRUD operations for Observations? POST single, POST bulk array, PUT (rare), DELETE?

**Answer:**


80. **Bulk Operations:** How to support bulk observation creation? POST array to `/datastreams/{id}/observations`?

**Answer:**


81. **Limit Constraints:** What is max limit for Observations? 10,000 for Part 2?

**Answer:**


### P. Control Streams Resource Methods

**Questions:**

82. **Control Streams Endpoints:** What are ALL Control Streams endpoints? List all, get by ID, query, by system, schema endpoint, in collection?

**Answer:**


83. **Control Streams Query Parameters:** What query parameters apply to Control Streams? system, controlledProperty, id, uid, q, properties, limit, offset, f?

**Answer:**


84. **Schema Endpoint:** How to construct schema endpoint URL? `/controlstreams/{id}/schema`? What format?

**Answer:**


85. **Control Streams CRUD:** What CRUD operations for Control Streams? POST, PUT/PATCH, DELETE with cascade?

**Answer:**


86. **Parameter Format:** Are there special format parameters for Control Streams? `cmdFormat` parameter?

**Answer:**


### Q. Commands Resource Methods

**Questions:**

87. **Commands Endpoints:** What are ALL Commands endpoints? List all, get by ID, by controlstream, query with temporal filters, status endpoint, result endpoint, feasibility endpoint?

**Answer:**


88. **Commands Query Parameters:** What query parameters apply to Commands? issueTime (PRIMARY), executionTime, status, controlstream, id, limit, offset, cursor, f, cmdFormat?

**Answer:**


89. **Status Endpoint:** How to construct command status endpoint? `/commands/{id}/status`? What does it return?

**Answer:**


90. **Result Endpoint:** How to construct command result endpoint? `/commands/{id}/result`? What does it return?

**Answer:**


91. **Feasibility Endpoint:** How to construct feasibility endpoint? `POST /controlstreams/{id}/feasibility` with parameters?

**Answer:**


92. **Status Filtering:** How to filter commands by status? `status` parameter with multiple values (pending, executing, completed, failed, cancelled)?

**Answer:**


93. **Temporal Queries:** What are issueTime and executionTime query patterns? ISO 8601 intervals?

**Answer:**


94. **Commands CRUD:** What CRUD operations for Commands? POST single, POST bulk array, PATCH status/result, POST cancel?

**Answer:**


95. **Bulk Operations:** How to support bulk command submission? POST array to `/controlstreams/{id}/commands`?

**Answer:**


96. **Synchronous vs Asynchronous:** How do sync vs async command execution differ? Different response codes (200 vs 201)?

**Answer:**


### R. TypeScript Type Definitions

**Questions:**

97. **Query Parameter Interfaces:** What TypeScript interfaces should be defined for query parameters? One per resource type? Common parameters interface?

**Answer:**


98. **Request Body Types:** What TypeScript types for CRUD request bodies? GeoJSON features? SensorML documents? Observation/command arrays?

**Answer:**


99. **Response Types:** Should methods return typed responses or leave typing to handlers?

**Answer:**


100. **Optional vs Required Parameters:** How to type optional parameters? Partial types? Undefined allowed?

**Answer:**


### S. Code Organization and Structure

**Questions:**

101. **File Structure:** Should CSAPIQueryBuilder be one file or split across multiple files? If split, how to organize?

**Answer:**


102. **Helper Functions:** What helper functions are needed? URL encoding? Query string construction? Parameter validation?

**Answer:**


103. **Constants:** What constants should be defined? Default limits? Valid format values? Status values?

**Answer:**


104. **Documentation:** How to document 60-70 methods? JSDoc for each? Examples?

**Answer:**


### T. Testing Strategy

**Questions:**

105. **Unit Tests:** What should be unit tested? Each URL construction method? Parameter validation? Query string encoding?

**Answer:**


106. **Integration Tests:** What should be integration tested? Full request/response cycle? Actual CSAPI server interaction?

**Answer:**


107. **Test Organization:** How to organize tests for 9 resource types? Separate test files per resource? Single test file with sections?

**Answer:**


108. **Mock Data:** What mock data is needed? Mock collection info? Mock server responses?

**Answer:**


---

## 5. Research Tasks

### Task 1: Study EDRQueryBuilder Implementation

**Objective:** Understand the EDRQueryBuilder pattern in depth to apply it to CSAPIQueryBuilder.

**Actions:**
- [ ] Read querybuilder-pattern-analysis.md completely
- [ ] Study EDRQueryBuilder source code in upstream repository
- [ ] Document factory method implementation pattern
- [ ] Document caching strategy
- [ ] Document metadata encapsulation pattern
- [ ] Document method organization (URL building vs execution)
- [ ] Identify reusable patterns for CSAPI

**Deliverable:** Complete answers to Section A questions (Questions 1-7)

---

### Task 2: Design CSAPI URL Construction Architecture

**Objective:** Define all 60-70 URL patterns for CSAPI resources and design URL construction logic.

**Actions:**
- [ ] Read OGC API - Connected Systems Part 1 OpenAPI specification
- [ ] Read OGC API - Connected Systems Part 2 OpenAPI specification
- [ ] Extract ALL endpoint paths from OpenAPI specs
- [ ] Categorize endpoints: canonical, nested, schema, special-purpose
- [ ] Design query string assembly logic
- [ ] Design parameter encoding logic (arrays, spatial, temporal)
- [ ] Document all URL patterns with examples

**Deliverable:** Complete answers to Section C questions (Questions 13-18)

---

### Task 3: Define CSAPI Query Parameter Support

**Objective:** Document ALL query parameters for CSAPI and design parameter handling logic.

**Actions:**
- [ ] Read csapi-implementation-guide.md "Complete Query Parameter Support" section
- [ ] Read OGC API - Common specification for standard parameters
- [ ] Read CSAPI Part 1 specification for Part 1 parameters
- [ ] Read CSAPI Part 2 specification for Part 2 parameters
- [ ] Document parameter syntax (value formats, encoding)
- [ ] Document parameter combinations (AND logic, multiple IDs)
- [ ] Document validation requirements
- [ ] Design parameter interface types

**Deliverable:** Complete answers to Sections E, F, G, H questions (Questions 24-50)

---

### Task 4: Design Methods for Each Resource Type

**Objective:** Design method signatures and URL patterns for all 9 CSAPI resource types.

**Actions:**
- [ ] For each resource type (Systems, Deployments, Procedures, Sampling Features, Properties, DataStreams, Observations, Control Streams, Commands):
  - [ ] List ALL endpoints from OpenAPI specs
  - [ ] Define method signatures (parameters, return types)
  - [ ] Document query parameters supported
  - [ ] Document CRUD operations supported
  - [ ] Document special endpoints (schema, status, result, feasibility)
  - [ ] Document pagination support
  - [ ] Document format negotiation
- [ ] Design method naming convention
- [ ] Design code reuse strategy (helper methods)

**Deliverable:** Complete answers to Sections I-Q questions (Questions 51-96)

---

### Task 5: Design TypeScript Type System

**Objective:** Define TypeScript interfaces and types for CSAPIQueryBuilder.

**Actions:**
- [ ] Read typescript-types-analysis.md from upstream research
- [ ] Design query parameter interfaces (per resource type)
- [ ] Design request body types (GeoJSON, SensorML, observations, commands)
- [ ] Design response types (if QueryBuilder executes requests)
- [ ] Design optional vs required parameter handling
- [ ] Document type definitions

**Deliverable:** Complete answers to Section R questions (Questions 97-100)

---

### Task 6: Plan Implementation and Testing

**Objective:** Create implementation checklist and testing strategy.

**Actions:**
- [ ] Design file organization (single file vs multiple files)
- [ ] Identify helper functions needed
- [ ] Define constants (limits, formats, statuses)
- [ ] Design documentation approach (JSDoc examples)
- [ ] Design unit testing strategy (what to test, how to organize)
- [ ] Design integration testing strategy (mock server vs real server)
- [ ] Estimate implementation timeline (likely 2-3 weeks for 10k-14k lines)

**Deliverable:** Complete answers to Sections S-T questions (Questions 101-108)

---

## 6. Development Standards Reference

All implementation work for this component must follow the standards documented in:

**[csapi-implementation-guide.md - Development Standards](../../../planning/csapi-implementation-guide.md#development-standards)**

Key standards include:
- Code style and formatting conventions
- Testing requirements and coverage expectations  
- Documentation standards (JSDoc, inline comments)
- Error handling patterns
- TypeScript usage guidelines
- Naming conventions (classes, methods, variables, files)
- File organization principles

---

## 7. Success Criteria

This research phase is complete when:

- [ ] All 108 critical research questions answered with detailed findings
- [ ] EDRQueryBuilder pattern fully documented and understood
- [ ] All 60-70 CSAPI URL patterns documented with examples
- [ ] All query parameters documented with syntax and validation rules
- [ ] Method signatures designed for all 9 resource types
- [ ] TypeScript type definitions designed
- [ ] Code organization and file structure decided
- [ ] Testing strategy documented (unit + integration)
- [ ] Implementation checklist created with timeline estimate
- [ ] All research tasks completed and checked off
- [ ] Analysis document created with comprehensive findings
- [ ] Ready to begin implementation with clear specifications

---

## 8. Dependencies

### Upstream Research Required
- querybuilder-pattern-analysis.md (EDRQueryBuilder study)
- url-building-analysis.md (URL construction patterns)
- typescript-types-analysis.md (Type system design)
- csapi-architecture-analysis.md (Single-class design rationale)

### Specifications Required
- OGC API - Connected Systems Part 1 (Systems, Deployments, Procedures, Sampling Features, Properties)
- OGC API - Connected Systems Part 2 (DataStreams, Observations, Control Streams, Commands)
- OGC API - Common (Standard query parameters: bbox, datetime, limit, offset, f)
- ISO 8601 (Temporal parameter syntax)

### Previous Components Required
- Component 1: OgcApiEndpoint Integration (factory method pattern for `endpoint.csapi()`)
- Component 2: Conformance Reader (determines if CSAPI is supported)
- Component 3: Collections Reader (provides collection info to QueryBuilder)

### Informs Downstream Components
- Component 5-8: Format handlers (parse the response structures QueryBuilder requests)
- Component 9-12: Infrastructure extensions (validate URLs and parameters QueryBuilder constructs)

---

## 9. Deliverables

### Research Plan (This Document)
- 10 sections covering all aspects of CSAPIQueryBuilder research
- 108 critical research questions requiring answers
- 6 research tasks with detailed action items
- Success criteria checklist
- Dependencies mapping

### Analysis Report (To Be Created)
**File:** `csapiquerybuilder-analysis.md`

**Sections:**
1. **Executive Summary:** High-level findings and design decisions
2. **EDRQueryBuilder Pattern Analysis:** Factory method, caching, metadata encapsulation, lifecycle
3. **Single-Class Architecture Design:** Method organization for 9 resource types, code reuse strategy
4. **URL Construction Patterns:** All 60-70 URL patterns with examples and documentation
5. **Query Parameter Reference:** Complete parameter documentation (syntax, validation, combinations)
6. **Resource Type Methods:** Detailed design for each of 9 resource types (endpoints, methods, parameters, CRUD)
7. **TypeScript Type Definitions:** Interfaces and types for parameters, bodies, responses
8. **Code Organization:** File structure, helper functions, constants, documentation approach
9. **Testing Strategy:** Unit test requirements, integration test requirements, test organization
10. **Implementation Checklist:** Phased implementation plan with timeline estimate (2-3 weeks)

**Appendices:**
- Appendix A: Complete URL Pattern Catalog (all 60-70 patterns)
- Appendix B: Complete Query Parameter Catalog (all parameters with syntax)
- Appendix C: Method Signature Reference (all methods across 9 resource types)
- Appendix D: Code Reuse Patterns (helper functions and abstractions)

**Expected Length:** 2000-3000 lines (significantly larger than previous component analyses due to scope)

---

## 10. Timeline Estimate

### Research Phase (This Document)
- **Duration:** 2-3 days
- **Effort:** Study upstream patterns, read specifications, document 60-70 URL patterns, design 9 resource type method groups

### Analysis Phase (Next Document)
- **Duration:** 2-3 days  
- **Effort:** Create comprehensive analysis document, design all methods, document all parameters, create implementation checklist

### Implementation Phase (After Research Complete)
- **Duration:** 2-3 weeks
- **Effort:** Implement ~10k-14k lines of code, 60-70 URL patterns, 9 resource types, comprehensive testing

**Total Time to Complete Component 4:** ~3-4 weeks (research + implementation + testing)

**Note:** This is 5-10x longer than Components 1-3 due to scope (70% of total code volume).

---

## Notes

- This is the most complex component in the entire 12-component design
- Represents ~70% of total new code volume (~10k-14k lines)
- Contains methods for 9 resource types within one class (not 9 separate classes)
- Implements 60-70 unique URL patterns with full CRUD operations
- Defines interfaces that all downstream handlers and validators depend on
- Follows EDRQueryBuilder pattern from upstream PR #114
- Success depends on thorough research of upstream patterns and CSAPI specifications
- Implementation will require careful code organization to avoid duplication across resource types
- Testing strategy must cover all 60-70 URL patterns and all query parameter combinations
- Timeline estimate reflects significantly larger scope than previous components

---

**Status:** 🔄 IN PROGRESS - Research questions await answers
**Next Step:** Execute Task 1 (Study EDRQueryBuilder Implementation)
