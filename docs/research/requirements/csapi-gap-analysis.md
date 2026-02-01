# CSAPI Previous Iteration Gap Analysis

**Purpose:** Identify gaps, errors, and lessons from the first implementation attempt to avoid repeating mistakes in v2.

**Context:** First iteration (OS4CSAPI/ogc-client-CSAPI repository) had scope issues that led to rejection. This analysis ensures v2 correctly defines "what should be included vs excluded."

**Date:** 2026-01-31

---

## Executive Summary

**Key Finding:** The first iteration **over-implemented parsing capabilities** that belonged outside the client library's responsibility. The library should focus on **HTTP operations, URL building, and basic response handling**—not deep format parsing/validation.

**Primary Issue:** Implemented extensive SensorML parsing (~1,500+ lines) that exceeded client library scope. Upstream libraries (WFS, WMS, etc.) do minimal format parsing—they fetch and pass through data.

**Recommendation:** v2 should provide **thin wrappers around HTTP**, not comprehensive format parsers. Users handle complex parsing with dedicated libraries (SensorML parsers, SWE Common libraries, GeoJSON processors).

---

## 1. What Was Implemented (First Iteration)

### 1.1 Core Implementation Scope

**Implemented Components:**

1. **SensorML Parsers** (~1,500+ lines)
   - SystemParser with PhysicalSystem/PhysicalComponent parsing
   - DeploymentParser with Deployment-specific handling
   - ProcedureParser with SimpleProcess/AggregateProcess support
   - PropertyParser with DerivedProperty extraction
   - Position extraction from multiple SWE Common types (Vector, DataRecord, Pose)
   - Geometry conversion from SensorML position to GeoJSON
   - Common property extraction (identifiers, classifiers, capabilities, etc.)

2. **SWE Common Parsers** (~800+ lines)
   - DataStream schema parsing
   - Observation parsing (scalar, vector, DataRecord)
   - Command parsing
   - SWE component extraction

3. **Format Detection** (~200+ lines)
   - Auto-detect GeoJSON vs SensorML vs SWE Common
   - Content-Type header analysis
   - Body structure inspection
   - Confidence scoring

4. **Validation Framework** (~400+ lines)
   - SensorML validation with Ajv
   - Required property checking
   - Type validation
   - GeoJSON structure validation
   - Strict vs non-strict modes

5. **Type Definitions** (~1,000+ lines)
   - Complete SensorML type hierarchy
   - DescribedObject interfaces
   - Position types (Vector, DataRecord, Pose, Text)
   - SWE Common component types
   - Capability/Characteristic interfaces

**Total Code:** ~3,900+ lines of parsing/validation logic

### 1.2 Resource Coverage

**Part 1 Resources:**
- ✅ Systems - Full parser with SensorML support
- ✅ Deployments - Full parser with location extraction
- ✅ Procedures - Full parser with process types
- ✅ Sampling Features - GeoJSON only (correct—no SensorML format)
- ✅ Properties - Full parser with DerivedProperty support

**Part 2 Resources:**
- ✅ DataStreams - GeoJSON + SWE Common schema parsing
- ✅ Observations - JSON + SWE Common parsing
- ✅ ControlStreams - GeoJSON only
- ✅ Commands - JSON + SWE Common parsing

**Part 3 Resources:**
- ❌ Not implemented (streaming deferred)

---

## 2. What Shouldn't Have Been Included

### 2.1 SensorML Parsing (PRIMARY ISSUE)

**Problem:** Client library implemented **comprehensive SensorML parsing** that belongs in a dedicated SensorML library.

**What Was Implemented:**
```typescript
// base.ts - SystemParser.parseSensorML() method
parseSensorML(data: Record<string, unknown>): SystemFeature {
  const sml = data as unknown as SensorMLProcess;

  // Validate it's a physical system/component
  if (sml.type !== 'PhysicalSystem' && sml.type !== 'PhysicalComponent') {
    throw new CSAPIParseError(
      `Expected PhysicalSystem or PhysicalComponent, got ${sml.type}`
    );
  }

  // Extract geometry from position
  const geometry =
    'position' in sml ? extractGeometry(sml.position as Position) : undefined;

  // Build properties from SensorML metadata
  const properties: Record<string, unknown> = {
    ...extractCommonProperties(sml),
    featureType: 'System',
    systemType: sml.type === 'PhysicalSystem' ? 'platform' : 'sensor',
  };

  // Add inputs/outputs/parameters if present
  if ('inputs' in sml && sml.inputs) properties.inputs = sml.inputs;
  if ('outputs' in sml && sml.outputs) properties.outputs = sml.outputs;
  if ('parameters' in sml && sml.parameters)
    properties.parameters = sml.parameters;

  // Add components for systems
  if (
    sml.type === 'PhysicalSystem' &&
    'components' in sml &&
    sml.components
  ) {
    properties.components = sml.components;
  }

  return {
    type: 'Feature',
    id: sml.id || sml.uniqueId,
    geometry: geometry || null,
    properties,
  } as unknown as SystemFeature;
}

// Position extraction with multiple format support
function extractGeometry(position?: Position): Geometry | undefined {
  if (!position) return undefined;

  // Handle Point geometry
  if (position.type === 'Point') {
    return position as Geometry;
  }

  // Handle Vector with coordinates array
  if (position.type === 'Vector' && 'coordinates' in position) {
    const coords = (position as any).coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      return {
        type: 'Point',
        coordinates: [coords[0], coords[1], coords[2] || 0],
      };
    }
  }

  // Handle DataRecord with lat/lon fields
  if (position.type === 'DataRecord' && 'fields' in position) {
    const fields = (position as any).fields;
    const lat = fields.find((f: any) => f.name === 'lat' || f.name === 'latitude')?.value;
    const lon = fields.find((f: any) => f.name === 'lon' || f.name === 'longitude')?.value;
    const alt = fields.find((f: any) => f.name === 'h' || f.name === 'altitude')?.value || 0;
    
    if (lat !== undefined && lon !== undefined) {
      return {
        type: 'Point',
        coordinates: [lon, lat, alt],
      };
    }
  }

  // Handle Pose with position object
  if ('position' in position) {
    const pos = (position as any).position;
    if (pos.lat !== undefined && pos.lon !== undefined) {
      return {
        type: 'Point',
        coordinates: [pos.lon, pos.lat, pos.h || 0],
      };
    }
  }

  return undefined;
}

// Common properties extraction
function extractCommonProperties(
  sml: DescribedObject
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  
  if (sml.id) props.id = sml.id;
  if (sml.uniqueId) props.uniqueId = sml.uniqueId;
  if (sml.label) props.name = sml.label;
  if (sml.description) props.description = sml.description;
  if (sml.lang) props.language = sml.lang;
  
  // Extract keywords
  if (sml.keywords) {
    if (Array.isArray(sml.keywords) && sml.keywords.length > 0) {
      if (typeof sml.keywords[0] === 'string') {
        props.keywords = sml.keywords;
      } else {
        props.keywords = (sml.keywords as Keyword[]).map(k => k.value || k.label);
      }
    }
  }
  
  // Extract identifiers
  if (sml.identifiers) props.identifiers = sml.identifiers;
  
  // Extract classifiers
  if (sml.classifiers) props.classifiers = sml.classifiers;
  
  // Extract validTime
  if (sml.validTime) props.validTime = sml.validTime;
  
  // Extract contacts
  if (sml.contacts) props.contacts = sml.contacts;
  
  // Extract documents
  if (sml.documents) props.documents = sml.documents;
  
  // Extract constraints
  if (sml.securityConstraints) props.securityConstraints = sml.securityConstraints;
  if (sml.legalConstraints) props.legalConstraints = sml.legalConstraints;
  
  // Extract capabilities
  if (sml.capabilities) props.capabilities = sml.capabilities;
  
  // Extract characteristics
  if (sml.characteristics) props.characteristics = sml.characteristics;
  
  return props;
}
```

**Why This Is Wrong:**

1. **Not Client Library Responsibility:** Upstream ogc-client WFS/WMS libraries don't parse XML schemas—they return raw XML. Users handle parsing with xml2js or similar.

2. **Excessive Complexity:** 1,500+ lines of SensorML-specific logic makes library unmaintainable. Each SensorML version change requires library updates.

3. **Incomplete Coverage:** Even with 1,500 lines, implementation is incomplete:
   - No support for AggregateProcess traversal
   - No connection/link resolution
   - No configuration mode handling
   - No history parsing
   - Missing many SensorML 3.0 elements

4. **Wrong Abstraction Level:** Client library should return `Response<SensorML>` where `SensorML = unknown`. Users apply SensorML parser library if needed.

5. **Testing Burden:** 1,200+ lines of tests just for SensorML parsing. Tests should focus on HTTP operations, not format validation.

**What Should Have Been Done:**

```typescript
// CORRECT APPROACH - Minimal parsing
export class SystemEndpoint {
  async getSystem(id: string, options?: { format?: string }): Promise<System> {
    const url = this.buildUrl(`/systems/${id}`, options);
    const response = await this.http.get(url);
    
    // Minimal parsing - just return the response body
    // If format is application/sml+json, return as-is
    // If format is application/geo+json, return as-is
    // User applies dedicated parser if they need deep introspection
    
    return response.data; // That's it!
  }
}

// Users handle complex parsing themselves
import { parseSensorML } from '@ogc/sensorml-parser'; // Separate library

const client = new CSAPIClient('https://server.com/api');
const system = await client.systems.get('system-1', { format: 'application/sml+json' });

// User decides how to parse
if (needsDeepInspection) {
  const parsed = parseSensorML(system); // Dedicated library
  console.log(parsed.components, parsed.capabilities);
} else {
  // Use raw data directly
  console.log(system.id, system.label);
}
```

### 2.2 SWE Common Parsing

**Problem:** Implemented partial SWE Common parsing for DataStream schemas and Observations.

**What Was Implemented:**
```typescript
// resources.ts - DatastreamParser.parseSWE()
parseSWE(data: Record<string, unknown>): DatastreamFeature {
  const sweDS = data as any;

  // Extract schema from elementType
  const schema = sweDS.elementType?.component;

  return {
    type: 'Feature',
    id: sweDS.id,
    geometry: null,
    properties: {
      featureType: 'Datastream',
      uid: sweDS.definition,
      name: sweDS.label,
      description: sweDS.description,
      schema: schema, // Embedded schema
    },
  } as DatastreamFeature;
}

// ObservationParser with result extraction
parseSWE(data: Record<string, unknown>): Record<string, unknown> {
  // Parse SWE observation
  return data;
}
```

**Why This Is Wrong:**

1. **Incomplete Implementation:** SWE Common has 30+ component types (Quantity, Count, Boolean, Text, Category, Time, DataRecord, DataArray, Vector, Matrix, DataChoice, Geometry, etc.). Implementation only handled a few.

2. **Schema Complexity:** SWE Common schemas are recursive (DataRecord contains DataRecords). Parser would need to be comprehensive or not exist at all.

3. **Encoding Formats:** SWE Common has 3 encodings (JSON, Text/CSV, Binary). First iteration only handled JSON partially.

**What Should Have Been Done:**

```typescript
// CORRECT - Return raw schema, user parses with SWE library
async getDataStreamSchema(id: string): Promise<unknown> {
  const url = `/datastreams/${id}/schema`;
  const response = await this.http.get(url);
  return response.data; // Raw SWE schema - user handles parsing
}

// Users apply dedicated SWE parser
import { SWECommonParser } from '@ogc/swe-common'; // Separate library

const schema = await client.datastreams.getSchema('ds-1');
const parser = new SWECommonParser(schema);

// Use parser for observations
const obs = await client.observations.list({ datastream: 'ds-1' });
obs.forEach(o => {
  const parsed = parser.decode(o.result); // Dedicated library handles complexity
  console.log(parsed.temperature, parsed.humidity);
});
```

### 2.3 Format Validation

**Problem:** Implemented runtime schema validation with Ajv for SensorML and GeoJSON.

**What Was Implemented:**
```typescript
// validation/sensorml-validator.ts
async function validateSensorMLProcess(
  data: SensorMLProcess
): Promise<{ valid: boolean; errors?: string[]; warnings?: string[] }> {
  const ajv = await initializeValidator();
  
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required property checks
  if (!data.type) {
    errors.push('Missing required property: type');
  }

  // Valid types check
  const validTypes = ['PhysicalSystem', 'PhysicalComponent', 'SimpleProcess', 
                      'AggregateProcess', 'Deployment', 'DerivedProperty'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push(`Invalid type: ${data.type}`);
  }

  // Identification warnings
  if (!data.uniqueId && !data.id) {
    warnings.push('Object should have uniqueId or id for identification');
  }

  // Description warnings
  if (!data.label && !data.description) {
    warnings.push('Object should have label or description for clarity');
  }

  // Position validation
  if ('position' in data && data.position) {
    const posValidation = validatePosition(data.position);
    if (!posValidation.valid) {
      errors.push(...(posValidation.errors || []));
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// Per-format validation in base parser
validate(
  data: T,
  format: string
): { valid: boolean; errors?: string[]; warnings?: string[] } {
  if (format === 'geojson') {
    return this.validateGeoJSON(data as any);
  }
  // Skip validation for other formats
  return { valid: true };
}
```

**Why This Is Wrong:**

1. **Server Responsibility:** API servers validate requests before accepting them (400 Bad Request). Client shouldn't duplicate server validation.

2. **Inconsistent:** Only validates GeoJSON, not SensorML (despite having `validateSensorML` method that does basic checks).

3. **TypeScript Provides Compile-Time Safety:** With proper types, many validation errors caught at compile time. Runtime validation only needed for external data (which comes from server—already validated).

4. **Performance Overhead:** Ajv validation on every parse adds latency. Unnecessary for most use cases.

**What Should Have Been Done:**

```typescript
// CORRECT - Rely on TypeScript types + server validation
async createSystem(system: SystemInput): Promise<System> {
  // TypeScript ensures 'system' matches SystemInput interface at compile time
  const response = await this.http.post('/systems', system);
  
  // If server rejects (400), throw error with server's validation message
  // No client-side validation needed
  
  return response.data;
}

// Optional: Provide validation utility (separate from core client)
import { validateSystem } from '@camptocamp/ogc-client/validators'; // Optional import

const errors = validateSystem(systemData);
if (errors.length > 0) {
  console.warn('Validation warnings:', errors);
}
```

### 2.4 Format Detection

**Problem:** Implemented auto-detection of formats from Content-Type headers and body structure.

**What Was Implemented:**
```typescript
// formats.ts
export function detectFormat(
  contentType: string | null,
  data: unknown
): FormatInfo {
  // Check Content-Type header first
  if (contentType) {
    if (contentType.includes('geo+json')) {
      return { format: 'geojson', confidence: 'high', source: 'content-type' };
    }
    if (contentType.includes('sml+json')) {
      return { format: 'sensorml', confidence: 'high', source: 'content-type' };
    }
    if (contentType.includes('swe+json') || contentType.includes('swe+text')) {
      return { format: 'swe', confidence: 'high', source: 'content-type' };
    }
  }

  // Fallback to body inspection
  return detectFormatFromBody(data);
}

export function detectFormatFromBody(data: unknown): FormatInfo {
  if (!data || typeof data !== 'object') {
    return { format: 'json', confidence: 'low', source: 'fallback' };
  }

  const obj = data as Record<string, unknown>;

  // GeoJSON detection
  if (obj.type === 'Feature' || obj.type === 'FeatureCollection') {
    return { format: 'geojson', confidence: 'high', source: 'body' };
  }

  // SensorML detection
  const sensorMLTypes = ['PhysicalSystem', 'PhysicalComponent', 'SimpleProcess', 
                         'AggregateProcess', 'Deployment', 'DerivedProperty'];
  if (typeof obj.type === 'string' && sensorMLTypes.includes(obj.type)) {
    return { format: 'sensorml', confidence: 'high', source: 'body' };
  }

  // SWE Common detection
  if (obj.type === 'DataRecord' || obj.type === 'DataArray' || obj.type === 'Vector') {
    return { format: 'swe', confidence: 'medium', source: 'body' };
  }

  return { format: 'json', confidence: 'low', source: 'fallback' };
}
```

**Why This Is Wrong:**

1. **Content-Type Sufficient:** HTTP Content-Type header is authoritative. Body inspection unnecessary.

2. **Ambiguity:** Some SWE Common types (`DataRecord`) appear in multiple contexts. Detection unreliable.

3. **Performance:** Inspecting body structure on every response adds overhead.

**What Should Have Been Done:**

```typescript
// CORRECT - Trust Content-Type, let user specify if needed
async getSystem(id: string, options?: { format?: string }): Promise<System> {
  const format = options?.format || 'application/geo+json'; // Default
  const url = this.buildUrl(`/systems/${id}`, { f: formatToParam(format) });
  
  const response = await this.http.get(url, {
    headers: { Accept: format }
  });
  
  // Return raw response - Content-Type tells user what they got
  return {
    data: response.data,
    contentType: response.headers['content-type'],
  };
}
```

### 2.5 Collection Parsers

**Problem:** Implemented collection-specific parsers (SystemCollectionParser, DeploymentCollectionParser, etc.) with format-specific handling.

**What Was Implemented:**
```typescript
// base.ts
export class SystemCollectionParser extends CSAPIParser<SystemFeature[]> {
  parseGeoJSON(data: Feature | FeatureCollection): SystemFeature[] {
    if (data.type === 'Feature') {
      return [data as SystemFeature];
    }
    return (data as FeatureCollection).features as SystemFeature[];
  }

  parseSensorML(data: Record<string, unknown>): SystemFeature[] {
    throw new CSAPIParseError(
      'SensorML collection parsing not yet implemented'
    );
  }

  parseSWE(data: Record<string, unknown>): SystemFeature[] {
    throw new CSAPIParseError('SWE format not applicable for System resources');
  }
}

// resources.ts - Generic collection parser
export class CollectionParser<T> extends CSAPIParser<T[]> {
  constructor(private itemParser: CSAPIParser<T>) {
    super();
  }

  parseGeoJSON(data: Feature | FeatureCollection): T[] {
    if (data.type === 'FeatureCollection') {
      return data.features.map(feature => 
        this.itemParser.parseGeoJSON(feature)
      );
    }
    return [this.itemParser.parseGeoJSON(data)];
  }

  parseSensorML(data: Record<string, unknown>): T[] {
    if (Array.isArray(data)) {
      return data.map(item => this.itemParser.parseSensorML(item));
    }
    return [this.itemParser.parseSensorML(data)];
  }
}
```

**Why This Is Wrong:**

1. **Unnecessary Abstraction:** Collections are just arrays. No special parser needed—map over items.

2. **Format Mixing:** Collections always use same format (GeoJSON FeatureCollection or JSON array). No need for per-item format detection.

**What Should Have Been Done:**

```typescript
// CORRECT - Simple array handling
async listSystems(options?: QueryParams): Promise<SystemCollection> {
  const response = await this.http.get('/systems', { params: options });
  
  // Response is FeatureCollection or paginated JSON response
  // No parsing - just return it
  return {
    items: response.data.features || response.data.items,
    links: response.data.links,
    numberMatched: response.data.numberMatched,
  };
}
```

---

## 3. What Was Missing

### 3.1 HTTP Operation Focus

**What Was Missing:** First iteration focused on parsing but missed core HTTP client responsibilities.

**Should Have Implemented:**

1. **URL Building with Query Parameters**
   ```typescript
   // Robust query parameter handling
   buildUrl(path: string, params?: QueryParams): string {
     const url = new URL(path, this.baseUrl);
     
     // Handle bbox (array → comma-separated)
     if (params?.bbox) {
       url.searchParams.set('bbox', params.bbox.join(','));
     }
     
     // Handle datetime (Date → ISO 8601)
     if (params?.datetime) {
       url.searchParams.set('datetime', params.datetime.toISOString());
     }
     
     // Handle id lists (array → comma-separated)
     if (params?.id) {
       url.searchParams.set('id', params.id.join(','));
     }
     
     // Handle limit/offset
     if (params?.limit) url.searchParams.set('limit', params.limit.toString());
     if (params?.offset) url.searchParams.set('offset', params.offset.toString());
     
     return url.toString();
   }
   ```

2. **Format Negotiation**
   ```typescript
   async request<T>(
     method: string,
     path: string,
     options?: {
       params?: QueryParams;
       body?: unknown;
       format?: string; // Desired response format
     }
   ): Promise<T> {
     const headers: Record<string, string> = {};
     
     // Set Accept header for format negotiation
     if (options?.format) {
       headers['Accept'] = options.format;
     }
     
     // Set Content-Type for request body
     if (options?.body) {
       headers['Content-Type'] = 'application/json';
     }
     
     const response = await fetch(this.buildUrl(path, options?.params), {
       method,
       headers,
       body: options?.body ? JSON.stringify(options.body) : undefined,
     });
     
     if (!response.ok) {
       throw new Error(`HTTP ${response.status}: ${await response.text()}`);
     }
     
     return response.json();
   }
   ```

3. **Link Following**
   ```typescript
   // Follow rel=next links for pagination
   async *listSystemsPaginated(params?: QueryParams): AsyncGenerator<System> {
     let url: string | null = this.buildUrl('/systems', params);
     
     while (url) {
       const response = await this.http.get(url);
       const collection = response.data as FeatureCollection;
       
       // Yield all items from this page
       for (const feature of collection.features) {
         yield feature as System;
       }
       
       // Find next link
       const nextLink = collection.links?.find(l => l.rel === 'next');
       url = nextLink?.href || null;
     }
   }
   ```

4. **Error Handling with OGC Exception Reports**
   ```typescript
   async request<T>(method: string, path: string, options?: RequestOptions): Promise<T> {
     try {
       const response = await fetch(this.buildUrl(path, options?.params), { method });
       
       if (!response.ok) {
         // Check for OGC Exception Report
         const contentType = response.headers.get('content-type');
         if (contentType?.includes('xml')) {
           const text = await response.text();
           if (text.includes('ExceptionReport') || text.includes('ServiceException')) {
             throw parseOGCException(text);
           }
         }
         
         throw new Error(`HTTP ${response.status}: ${await response.text()}`);
       }
       
       return response.json();
     } catch (error) {
       throw new CSAPIError('Request failed', error);
     }
   }
   ```

5. **Conformance-Based Feature Detection**
   ```typescript
   async initialize(): Promise<void> {
     // Fetch conformance classes
     const conformance = await this.http.get('/conformance');
     this.conformanceClasses = new Set(conformance.conformsTo);
     
     // Detect available resources
     this.capabilities = {
       systems: this.supportsConformance('http://www.opengis.net/spec/ogcapi-connected-systems-1/1.0/conf/system-features'),
       deployments: this.supportsConformance('http://www.opengis.net/spec/ogcapi-connected-systems-1/1.0/conf/deployment-features'),
       datastreams: this.supportsConformance('http://www.opengis.net/spec/ogcapi-connected-systems-2/1.0/conf/datastream-features'),
       // ... etc
     };
   }
   
   supportsConformance(uri: string): boolean {
     return this.conformanceClasses.has(uri);
   }
   ```

### 3.2 Convenience Methods

**What Was Missing:** Methods that simplify common workflows without over-parsing.

**Should Have Implemented:**

1. **Fluent API for Sub-Resource Navigation**
   ```typescript
   // Chainable resource access
   const datastreams = await client
     .systems
     .get('system-1')
     .datastreams
     .list();
   
   // Implementation
   class SystemResource {
     constructor(private client: CSAPIClient, private id: string) {}
     
     get datastreams() {
       return new DataStreamResource(this.client, { system: this.id });
     }
     
     get deployments() {
       return new DeploymentResource(this.client, { system: this.id });
     }
   }
   ```

2. **Bulk Operations**
   ```typescript
   // Fetch multiple systems in one request
   const systems = await client.systems.getMany(['sys-1', 'sys-2', 'sys-3']);
   // GET /systems?id=sys-1,sys-2,sys-3
   ```

3. **Stream Helpers**
   ```typescript
   // Auto-pagination iterator
   for await (const system of client.systems.stream()) {
     console.log(system.id, system.name);
   }
   ```

4. **Spatial Query Helpers**
   ```typescript
   // Bbox query builder
   const systems = await client.systems.list({
     bbox: [minLon, minLat, maxLon, maxLat],
     datetime: { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
   });
   ```

### 3.3 TypeScript Type Exports

**What Was Missing:** Clean, focused type exports for users.

**Should Have Implemented:**

```typescript
// types/index.ts - Clean public API
export interface System {
  id: string;
  type: 'Feature';
  geometry: Geometry | null;
  properties: SystemProperties;
  links?: Link[];
}

export interface SystemProperties {
  featureType: 'System';
  uid: string; // URI
  name: string;
  description?: string;
  validTime?: [string, string];
  // ... essentials only, not every SensorML property
}

export interface QueryParams {
  limit?: number;
  offset?: number;
  bbox?: [number, number, number, number];
  datetime?: string | { start: Date; end: Date };
  id?: string[];
  q?: string[];
  // ... standard query params only
}

export interface CSAPIClient {
  systems: SystemEndpoint;
  deployments: DeploymentEndpoint;
  procedures: ProcedureEndpoint;
  samplingFeatures: SamplingFeatureEndpoint;
  properties: PropertyEndpoint;
  datastreams: DataStreamEndpoint;
  observations: ObservationEndpoint;
  controlstreams: ControlStreamEndpoint;
  commands: CommandEndpoint;
}
```

**What NOT to Export:** Complete SensorML type hierarchy (DescribedObject, AbstractProcess, PhysicalSystem, PhysicalComponent, SimpleProcess, AggregateProcess, Deployment, DerivedProperty, Position, Vector, DataRecord, Pose, Text, CapabilityList, CharacteristicList, etc.). Let dedicated SensorML library handle that.

---

## 4. Scope Boundary Definition

### 4.1 Client Library Responsibilities (IN SCOPE)

**✅ HTTP Operations:**
- Build URLs with query parameters
- Execute GET/POST/PUT/PATCH/DELETE requests
- Handle authentication (Basic, Bearer, OAuth)
- Follow pagination links
- Manage request/response headers

**✅ Format Negotiation:**
- Set Accept headers
- Set Content-Type for requests
- Respect f parameter for format selection
- Return raw response with contentType metadata

**✅ Error Handling:**
- Parse HTTP status codes
- Extract OGC Exception Reports (XML)
- Provide typed error classes
- Include request context in errors

**✅ Conformance Detection:**
- Fetch /conformance on initialization
- Detect available resource types
- Provide capability checking methods
- Adapt behavior based on conformance

**✅ URL Building:**
- Encode query parameters correctly
- Handle arrays (comma-separated)
- Handle bbox (4-6 values)
- Handle datetime (ISO 8601)
- Handle special characters

**✅ Basic Response Handling:**
- Parse JSON responses
- Extract links from responses
- Handle pagination (next/prev links)
- Provide collection metadata (numberMatched, timeStamp)

**✅ TypeScript Types:**
- Resource interfaces (System, Deployment, etc.)
- Query parameter types
- Response collection types
- Error types
- Geometry types (from GeoJSON spec)

**✅ Convenience Methods:**
- Fluent API for sub-resources
- Async iterators for pagination
- Batch operations (getMany)
- Spatial/temporal query builders

### 4.2 NOT Client Library Responsibilities (OUT OF SCOPE)

**❌ Format Parsing:**
- SensorML structure introspection
- SWE Common schema interpretation
- GeoJSON geometry operations (beyond basic types)
- Binary format decoding (SWE+Binary, Protobuf)

**❌ Validation:**
- Request body validation (TypeScript types sufficient)
- SensorML structure validation
- Schema constraint checking
- UoM unit validation
- Coordinate reference system transformation

**❌ Data Transformation:**
- SensorML → GeoJSON conversion
- Observation format conversion (JSON → CSV → Binary)
- Coordinate system transformations
- Unit conversions
- Geometry operations (buffer, intersection, etc.)

**❌ Complex Parsing:**
- Position extraction from SWE Common types
- Recursive component traversal
- Link resolution (href following)
- Schema caching and management
- Capability/Characteristic interpretation

**❌ Server-Side Logic:**
- Cascade delete implementation
- Recursive query traversal
- Access control enforcement
- Resource validation rules
- Conformance class dependencies

### 4.3 Where to Draw the Line

**Question:** Should library parse `response.data.features` from a FeatureCollection?

**Answer:** **YES** - This is basic JSON access, not format parsing. Extracting `features` array from FeatureCollection is convenience, not parsing.

```typescript
// ✅ GOOD - Basic JSON extraction
async listSystems(): Promise<System[]> {
  const response = await this.http.get('/systems');
  return response.data.features || response.data.items || [];
}
```

**Question:** Should library extract `lat/lon` from a SensorML Position object?

**Answer:** **NO** - This is format-specific parsing. Users apply SensorML library if they need position extraction.

```typescript
// ❌ BAD - Format-specific parsing
function extractPosition(position: Position): [number, number] {
  if (position.type === 'DataRecord') {
    const lat = position.fields.find(f => f.name === 'lat').value;
    const lon = position.fields.find(f => f.name === 'lon').value;
    return [lon, lat];
  }
  // ... more cases
}

// ✅ GOOD - Return raw position, let user parse
async getSystem(id: string): Promise<System> {
  const response = await this.http.get(`/systems/${id}`);
  return response.data; // position field included as-is
}
```

**Question:** Should library validate that a System has a required `uid` property?

**Answer:** **NO** - TypeScript interface ensures compile-time checking. Server validates at runtime. No client-side validation needed.

```typescript
// ❌ BAD - Runtime validation
async createSystem(system: SystemInput): Promise<System> {
  if (!system.uid) {
    throw new Error('uid is required');
  }
  return this.http.post('/systems', system);
}

// ✅ GOOD - TypeScript interface + server validation
interface SystemInput {
  uid: string; // TypeScript enforces this at compile time
  name: string;
  description?: string;
}

async createSystem(system: SystemInput): Promise<System> {
  // TypeScript ensures system.uid exists
  // Server validates and returns 400 if invalid
  return this.http.post('/systems', system);
}
```

---

## 5. Lessons Learned

### 5.1 Scope Creep Prevention

**Lesson:** Define "thin client" vs "thick client" at project start.

**Indicators of Scope Creep:**
- More than 500 lines in a single parser file
- Imports from XML/JSON schema validation libraries (Ajv, json-schema)
- Recursive data structure traversal
- Format-specific type definitions (>20 interfaces for one format)
- Tests focused on parsing logic (not HTTP operations)

**Prevention:**
- Review upstream libraries (WFS, WMS, WMTS, EDR) for scope guidance
- Set "lines of code" budget per module (~200-300 max)
- Require justification for any format-specific logic
- Ask: "Would a dedicated library handle this better?"

### 5.2 Format Handling Philosophy

**Lesson:** Client library is a **transport layer**, not a **parsing layer**.

**Transport Layer Responsibilities:**
- Fetch data via HTTP
- Set correct headers (Accept, Content-Type)
- Handle errors
- Return raw response

**Parsing Layer Responsibilities (SEPARATE LIBRARIES):**
- Interpret format structures
- Validate schemas
- Extract nested values
- Transform between formats

**Example Separation:**
```
┌─────────────────────────────────────────────┐
│  User Application                           │
└──────────────┬──────────────────────────────┘
               │
               ├──► @camptocamp/ogc-client (HTTP transport)
               │
               ├──► @ogc/sensorml-parser (SensorML parsing)
               │
               ├──► @ogc/swe-common (SWE Common parsing)
               │
               └──► @turf/turf (GeoJSON operations)
```

### 5.3 TypeScript vs Runtime Validation

**Lesson:** Leverage TypeScript for type safety, avoid runtime validation.

**TypeScript Strengths:**
- Compile-time type checking
- IDE autocomplete and error detection
- Interface contracts
- Generic constraints

**When Runtime Validation Needed:**
- External data from untrusted sources (not applicable—data comes from server)
- Dynamic schemas (not applicable—CSAPI has fixed schemas)
- User input sanitization (not applicable—server validates)

**Conclusion:** For CSAPI client, TypeScript types are sufficient. No Ajv, no Zod, no json-schema.

### 5.4 Test Focus

**Lesson:** Tests should validate HTTP operations, not parsing logic.

**First Iteration Test Distribution:**
- 60% parsing tests (SensorML, SWE, format detection)
- 30% validation tests
- 10% HTTP operation tests

**Correct Test Distribution:**
- 70% HTTP operation tests (URL building, query params, error handling)
- 20% integration tests (real server responses)
- 10% convenience method tests (fluent API, iterators)

**Example Good Test:**
```typescript
describe('SystemEndpoint', () => {
  it('should build correct URL with query parameters', () => {
    const url = endpoint.buildUrl('/systems', {
      bbox: [-180, -90, 180, 90],
      datetime: '2024-01-01T00:00:00Z',
      limit: 100
    });
    
    expect(url).toBe(
      'https://server.com/api/systems?bbox=-180,-90,180,90&datetime=2024-01-01T00:00:00Z&limit=100'
    );
  });
  
  it('should set Accept header based on format parameter', async () => {
    await endpoint.getSystem('sys-1', { format: 'application/sml+json' });
    
    expect(mockHttp.lastRequest.headers.Accept).toBe('application/sml+json');
  });
});
```

**Example Bad Test:**
```typescript
describe('SystemParser', () => {
  it('should extract latitude from DataRecord position', () => {
    const sml = {
      type: 'PhysicalSystem',
      position: {
        type: 'DataRecord',
        fields: [
          { name: 'lat', value: 45.0 },
          { name: 'lon', value: 5.0 }
        ]
      }
    };
    
    const result = parser.parseSensorML(sml);
    expect(result.geometry.coordinates).toEqual([5.0, 45.0, 0]);
  });
});
```

This test validates parsing logic that shouldn't exist in the client library.

---

## 6. Upstream Library Patterns

### 6.1 WFS Client Pattern

**Scope:** WFS client in upstream ogc-client is minimal—fetches XML, parses capabilities, returns feature properties.

**What WFS Does:**
```typescript
// wfs/endpoint.ts
async getFeatureType(name: string): Promise<WfsFeatureTypeFull> {
  const url = this.getFeatureTypeUrl(name);
  const response = await fetch(url);
  const xml = await response.text();
  
  // Parse XML DescribeFeatureType response
  // Extract property names/types only
  return parseFeatureTypeSchema(xml);
}

async getFeatures(typeName: string, options?: QueryOptions): Promise<Feature[]> {
  const url = this.getFeatureUrl(typeName, options);
  const response = await fetch(url);
  const xml = await response.text();
  
  // Parse GML to extract features
  // NO geometry operations, NO schema validation
  return parseFeatureProps(xml, featureType);
}
```

**What WFS Does NOT Do:**
- ❌ Validate feature properties against schema
- ❌ Transform coordinates
- ❌ Parse complex GML geometries (beyond basic extraction)
- ❌ Validate XML against XSD
- ❌ Interpret WFS filter expressions

**Lesson:** WFS client focuses on **fetching and basic parsing**. Complex geometry operations and validation left to users with dedicated libraries (Turf.js, JSTS, etc.).

### 6.2 WMS Client Pattern

**Scope:** WMS client builds URLs, parses capabilities, returns layer info. No image processing.

**What WMS Does:**
```typescript
// wms/endpoint.ts
getMapUrl(layers: string[], options: GetMapOptions): string {
  const params = new URLSearchParams();
  params.set('SERVICE', 'WMS');
  params.set('REQUEST', 'GetMap');
  params.set('LAYERS', layers.join(','));
  params.set('WIDTH', options.width.toString());
  params.set('HEIGHT', options.height.toString());
  params.set('BBOX', options.bbox.join(','));
  params.set('CRS', options.crs || 'EPSG:4326');
  
  return `${this.baseUrl}?${params.toString()}`;
}
```

**What WMS Does NOT Do:**
- ❌ Fetch or decode images
- ❌ Validate image formats
- ❌ Transform image data
- ❌ Parse legend graphics
- ❌ Validate bounding boxes

**Lesson:** WMS client is a **URL builder**. Image fetching/processing is user responsibility.

### 6.3 OGC API - Features Pattern

**Scope:** Fetch collections, items, and queryables. Basic JSON parsing only.

**What OGC API Endpoint Does:**
```typescript
// ogc-api/endpoint.ts
async getCollectionItems(
  collectionId: string,
  options?: QueryOptions
): Promise<FeatureCollection> {
  const url = await this.getCollectionItemsUrl(collectionId, options);
  const response = await fetch(url);
  const json = await response.json();
  
  // Return raw GeoJSON FeatureCollection
  return json;
}
```

**What OGC API Endpoint Does NOT Do:**
- ❌ Parse feature properties beyond JSON access
- ❌ Validate feature schemas
- ❌ Transform geometries
- ❌ Interpret queryable definitions
- ❌ Execute CQL filters locally

**Lesson:** OGC API client is **JSON fetcher**. Schema interpretation and geometry operations are user responsibility.

### 6.4 Pattern Summary

| Library | Parses | Returns | User Responsibility |
|---------|--------|---------|---------------------|
| **WFS** | XML Capabilities, GML features | Feature properties (name/value pairs) | Geometry operations, validation |
| **WMS** | XML Capabilities | URLs, layer metadata | Image fetching, rendering |
| **WMTS** | XML Capabilities | URLs, tile metadata | Tile fetching, rendering |
| **OGC API** | JSON capabilities, JSON collections | Raw JSON (FeatureCollection) | Schema interpretation, geometry ops |
| **EDR** | JSON queries | Raw JSON (CoverageJSON) | Coverage data parsing |

**CSAPI Should Follow Same Pattern:**
- Parse JSON capabilities (/conformance, /collections)
- Return raw JSON for resources (Systems, Deployments, Observations)
- Let users apply SensorML/SWE libraries for deep parsing

---

## 7. Recommendations for V2

### 7.1 Implementation Strategy

**Phase 1: Core HTTP Client (Week 1-2)**
- URL building with query parameters
- GET/POST/PUT/DELETE methods
- Authentication (Basic, Bearer)
- Error handling (HTTP status + OGC exceptions)
- Format negotiation (Accept headers)

**Phase 2: Part 1 Resources (Week 3-4)**
- Systems endpoint
- Deployments endpoint
- Procedures endpoint
- Sampling Features endpoint
- Properties endpoint
- Sub-resource navigation

**Phase 3: Part 2 Resources (Week 5-6)**
- DataStreams endpoint
- Observations endpoint
- ControlStreams endpoint
- Commands endpoint
- Schema endpoints
- Status/Result endpoints

**Phase 4: Convenience (Week 7)**
- Fluent API
- Async iterators
- Batch operations
- Spatial/temporal query builders

**Total Timeline:** 7 weeks (vs 12 weeks for first iteration with parsing)

### 7.2 Code Organization

```
src/
├── core/                      # HTTP client, error handling
│   ├── client.ts
│   ├── errors.ts
│   ├── auth.ts
│   └── url-builder.ts
├── endpoints/                 # Resource endpoints
│   ├── systems.ts
│   ├── deployments.ts
│   ├── procedures.ts
│   ├── sampling-features.ts
│   ├── properties.ts
│   ├── datastreams.ts
│   ├── observations.ts
│   ├── controlstreams.ts
│   └── commands.ts
├── types/                     # TypeScript interfaces
│   ├── system.ts
│   ├── deployment.ts
│   ├── procedure.ts
│   ├── sampling-feature.ts
│   ├── property.ts
│   ├── datastream.ts
│   ├── observation.ts
│   ├── controlstream.ts
│   ├── command.ts
│   ├── query-params.ts
│   └── index.ts
└── utils/                     # Helpers
    ├── conformance.ts
    ├── pagination.ts
    └── links.ts
```

**Total Lines of Code Target:** ~3,000 lines (vs 7,000+ in first iteration)

### 7.3 Documentation Strategy

**User Guide Should Cover:**
1. Installation and setup
2. Authentication
3. Basic CRUD operations
4. Query parameters
5. Pagination
6. Format selection
7. Error handling
8. Using with SensorML/SWE libraries (separate packages)

**User Guide Should NOT Cover:**
- How to parse SensorML (link to @ogc/sensorml-parser docs)
- How to parse SWE Common (link to @ogc/swe-common docs)
- Geometry operations (link to Turf.js docs)
- Schema validation (not needed with TypeScript)

### 7.4 Testing Strategy

**Test Categories:**

1. **URL Building Tests** (30%)
   - Query parameter encoding
   - Array handling (bbox, id lists)
   - Special characters
   - Format parameter

2. **HTTP Operation Tests** (40%)
   - Request headers
   - Response parsing
   - Error status codes
   - Authentication

3. **Integration Tests** (20%)
   - Real server responses (fixtures)
   - Pagination
   - Link following
   - Conformance detection

4. **Convenience Method Tests** (10%)
   - Fluent API
   - Async iterators
   - Batch operations

**Target:** 90%+ code coverage, ~500-600 test cases

---

## 8. Decision Matrix

### 8.1 Feature Inclusion Criteria

For each proposed feature, ask:

| Question | Include If YES | Exclude If YES |
|----------|---------------|----------------|
| Is this HTTP transport logic? | ✅ | |
| Is this URL building/encoding? | ✅ | |
| Is this basic JSON access? | ✅ | |
| Does upstream WFS/WMS do this? | ✅ | |
| Does this require format-specific knowledge? | | ❌ |
| Does this interpret schemas? | | ❌ |
| Does this validate structures? | | ❌ |
| Would a dedicated library handle this better? | | ❌ |
| Is this more than 200 lines? | | ❌ |
| Does this require external validation library? | | ❌ |

### 8.2 Examples

| Feature | Decision | Reasoning |
|---------|----------|-----------|
| URL building for `/systems?bbox=...` | ✅ Include | Core HTTP transport |
| Parsing `response.data.features` array | ✅ Include | Basic JSON access |
| Following `rel=next` links | ✅ Include | Standard pagination |
| Setting Accept header | ✅ Include | Format negotiation |
| Extracting lat/lon from SensorML Position | ❌ Exclude | Format-specific parsing |
| Validating System has required uid | ❌ Exclude | TypeScript enforces this |
| Converting SensorML → GeoJSON | ❌ Exclude | Format transformation |
| Parsing SWE DataRecord fields | ❌ Exclude | Schema interpretation |
| Decoding SWE Binary encoding | ❌ Exclude | Complex format decoding |
| Validating UoM codes | ❌ Exclude | Domain-specific validation |

---

## 9. Conclusion

**Primary Gap:** First iteration over-implemented format parsing (~1,500 lines SensorML, ~800 lines SWE, ~400 lines validation) that belongs outside client library scope.

**Core Lesson:** Client library is **HTTP transport layer**, not **parsing layer**. Focus on:
- Building URLs correctly
- Executing requests with proper headers
- Handling errors
- Following links
- Returning raw responses

**Users** apply dedicated format libraries when needed:
- `@ogc/sensorml-parser` for SensorML introspection
- `@ogc/swe-common` for SWE Common parsing
- `@turf/turf` for GeoJSON geometry operations

**V2 Should:**
- Remove all format parsing (cut ~3,000 lines)
- Focus on HTTP operations (add ~500 lines URL building, ~300 lines error handling)
- Provide convenience methods (add ~400 lines fluent API, pagination)
- Total: ~3,000 lines (down from ~7,000 in v1)

**Success Criteria:**
- ✅ Thin wrapper around HTTP (like upstream WFS/WMS/OGC API clients)
- ✅ Users can fetch any resource in any format
- ✅ No format-specific parsing beyond basic JSON access
- ✅ Easy integration with dedicated parsing libraries
- ✅ Maintainable (~3,000 lines total)

---

**End of Gap Analysis**
