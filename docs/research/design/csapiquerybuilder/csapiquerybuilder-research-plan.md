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

**Answer:**


25. **datetime Parameter:** How to encode temporal intervals? ISO 8601 format? Single instant vs interval? Open intervals (`../2024-01-31`, `2024-01-01/..`)?

**Answer:**


26. **limit Parameter:** What are valid range values? 1 to 10,000 for Part 2? Different defaults for Part 1 vs Part 2?

**Answer:**


27. **offset Parameter:** How does offset-based pagination work? Combined with limit? Start at 0 or 1?

**Answer:**


28. **f Parameter:** What format values are supported? `json`, `geojson`, `sml+json`, `swe+json`, `swe+text`, `html`?

**Answer:**


### F. CSAPI-Specific Query Parameters

**Questions:**

29. **id Parameter:** How to filter by multiple IDs? Comma-separated list? OR logic? Example: `id=sys1,sys2,sys3`?

**Answer:**


30. **uid Parameter:** How to filter by unique identifier? URN format? Single value or multiple?

**Answer:**


31. **q Parameter:** How does full-text search work? What properties are searched? Case sensitivity?

**Answer:**


32. **Property Filters:** How to filter by arbitrary resource properties? Example: `name=Weather%20Station`, `systemType=sosa:Sensor`?

**Answer:**


33. **recursive Parameter:** How does hierarchical recursion work? Boolean flag? `recursive=true` for all descendants?

**Answer:**


34. **parent Parameter:** How to filter by parent resource? Single ID or multiple? Apply to systems and deployments?

**Answer:**


35. **system Parameter:** How to filter resources by associated system? Single ID or multiple? Apply to which resource types?

**Answer:**


36. **deployment Parameter:** How to filter by deployment? Single ID or multiple?

**Answer:**


37. **procedure Parameter:** How to filter by procedure? Single ID or multiple?

**Answer:**


38. **foi Parameter:** How to filter by feature of interest? Single ID or multiple?

**Answer:**


39. **observedProperty Parameter:** How to filter by observed property? URI or ID? Single or multiple?

**Answer:**


40. **controlledProperty Parameter:** How to filter by controlled property? URI or ID? Single or multiple?

**Answer:**


41. **baseProperty Parameter:** How to filter properties by base property? Property hierarchy?

**Answer:**


### G. Part 2 Temporal Query Parameters

**Questions:**

42. **phenomenonTime Parameter:** How to encode when observation was made? ISO 8601 intervals? Primary temporal filter for observations?

**Answer:**


43. **resultTime Parameter:** How to encode when result became available? ISO 8601 intervals?

**Answer:**


44. **executionTime Parameter:** How to encode when command should be/was executed? ISO 8601 intervals?

**Answer:**


45. **issueTime Parameter:** How to encode when command was issued? ISO 8601 intervals?

**Answer:**


46. **Temporal Interval Syntax:** What is the complete ISO 8601 interval syntax? Single instant, closed interval, open start, open end, multiple disjoint intervals?

**Answer:**


### H. Pagination Implementation

**Questions:**

47. **Offset-Based Pagination:** How to implement Part 1 style pagination? `limit` + `offset` parameters? How to calculate next page offset?

**Answer:**


48. **Cursor-Based Pagination:** How to implement Part 2 style pagination? `limit` + `cursor` parameters? How to extract cursor from responses?

**Answer:**


49. **Pagination Limits:** What are the limit constraints? Min 1, max 10,000 for Part 2? Different for Part 1?

**Answer:**


50. **Link Headers:** Should QueryBuilder parse Link headers for next/prev pages? Or leave to handlers?

**Answer:**


### I. Systems Resource Methods

**Questions:**

51. **Systems Endpoints:** What are ALL Systems endpoints? List all, get by ID, query, subsystems, by deployment, by procedure, in collection?

**Answer:**


52. **Systems Query Parameters:** What query parameters apply to Systems? bbox, datetime, recursive, parent, deployment, procedure, foi, id, uid, q, properties, limit, offset, f?

**Answer:**


53. **Subsystems Hierarchy:** How to query subsystems? Recursive flag? `/systems/{id}/subsystems?recursive=true`?

**Answer:**


54. **Systems CRUD:** What CRUD operations for Systems? POST `/systems`, PUT/PATCH `/systems/{id}`, DELETE `/systems/{id}?cascade=true`?

**Answer:**


### J. Deployments Resource Methods

**Questions:**

55. **Deployments Endpoints:** What are ALL Deployments endpoints? List all, get by ID, query, subdeployments, by system, in collection?

**Answer:**


56. **Deployments Query Parameters:** What query parameters apply to Deployments? bbox, datetime, system, recursive, parent, id, uid, q, properties, limit, offset, f?

**Answer:**


57. **Subdeployments Hierarchy:** How to query subdeployments? Recursive flag? `/deployments/{id}/subdeployments?recursive=true`?

**Answer:**


58. **Deployments CRUD:** What CRUD operations for Deployments? POST, PUT/PATCH, DELETE with cascade?

**Answer:**


### K. Procedures Resource Methods

**Questions:**

59. **Procedures Endpoints:** What are ALL Procedures endpoints? List all, get by ID, query, by system, in collection?

**Answer:**


60. **Procedures Query Parameters:** What query parameters apply to Procedures? system, id, uid, q, properties, limit, offset, f?

**Answer:**


61. **Procedures CRUD:** What CRUD operations for Procedures? POST, PUT/PATCH, DELETE?

**Answer:**


62. **SensorML Format:** How to handle SensorML format for Procedures? `f=sml+json` parameter?

**Answer:**


### L. Sampling Features Resource Methods

**Questions:**

63. **Sampling Features Endpoints:** What are ALL Sampling Features endpoints? List all, get by ID, query, by system, by foi, in collection?

**Answer:**


64. **Sampling Features Query Parameters:** What query parameters apply to Sampling Features? bbox, system, foi, relatedSamplingFeature, id, uid, q, properties, limit, offset, f?

**Answer:**


65. **Sampling Features CRUD:** What CRUD operations for Sampling Features? POST, PUT/PATCH, DELETE?

**Answer:**


### M. Properties Resource Methods

**Questions:**

66. **Properties Endpoints:** What are ALL Properties endpoints? List all, get by ID, query, by system, by base property, in collection?

**Answer:**


67. **Properties Query Parameters:** What query parameters apply to Properties? system, baseProperty, id, uid, q, properties, limit, offset, f?

**Answer:**


68. **Properties Read-Only:** Are Properties read-only (GET only)? No CRUD operations?

**Answer:**


69. **Property Hierarchy:** How to query property hierarchies? `baseProperty` parameter for parent-child relationships?

**Answer:**


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
