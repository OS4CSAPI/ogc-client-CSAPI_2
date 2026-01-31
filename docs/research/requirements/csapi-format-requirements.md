# CSAPI Format Requirements Analysis

**Document:** Section 3 - Format Requirements  
**Date:** 2026-01-31  
**Status:** In Progress

---

## Overview

This document analyzes format requirements for the CSAPI client library, covering GeoJSON, SensorML, and SWE Common data formats used across Part 1 (feature resources) and Part 2 (dynamic data).

---

## Section 3.2: GeoJSON Format Requirements

**Date:** 2026-01-31  
**Status:** Complete

### Overview

GeoJSON (RFC 7946) is a primary format for representing spatial features in CSAPI Part 1. It provides a lightweight, human-readable encoding for Systems, Deployments, Procedures, and Sampling Features with geospatial properties.

**Media Type:** `application/geo+json`

**Standard References:**
- [GeoJSON RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946)
- [OGC API – Connected Systems Part 1](https://docs.ogc.org/is/23-001/23-001.html) - Clause 19.1, Requirements Class `/req/geojson`
- [OGC API – Features Part 1](https://docs.ogc.org/is/17-069r4/17-069r4.html) - GeoJSON encoding requirements

---

### 1. CSAPI Resources Supporting GeoJSON

#### 1.1 Part 1 Feature Resources

**Systems (Required):**
- Systems with spatial location (sensors, platforms, actuators on platforms)
- Geometry represents system's current or typical location
- Example: Weather station (Point), Mobile platform path (LineString), Survey area (Polygon)

**Deployments (Required):**
- All deployments have spatial extent
- Geometry represents deployment coverage area
- Example: Sensor deployment footprint (Polygon), Transect deployment (LineString)

**Procedures (Optional):**
- Geometry typically `null` (procedures are conceptual, not spatial)
- May have geometry if procedure tied to specific location
- Example: Sampling methodology (null geometry), Site-specific calibration procedure (Point)

**Sampling Features (Required):**
- All sampling features have geometry
- Represents the sampled feature (location, area, volume)
- Example: Sampling point (Point), Sampling transect (LineString), Sampling plot (Polygon)

#### 1.2 Part 2 Dynamic Data Resources

**DataStreams (Optional):**
- DataStreams may reference Systems with GeoJSON geometry
- DataStream collections may be represented as FeatureCollection
- Used for spatial discovery of data streams

**ControlStreams (Optional):**
- ControlStreams may reference Systems with GeoJSON geometry
- ControlStream collections may be represented as FeatureCollection
- Used for spatial discovery of control channels

**Not Applicable:**
- Observations (use SWE Common formats, not GeoJSON)
- Commands (use SWE Common formats, not GeoJSON)
- Properties (use SensorML or plain JSON)

---

### 2. GeoJSON Geometry Types Used

#### 2.1 Geometry Type Support Matrix

| Geometry Type | Part 1 Usage | Common Use Cases | Client Support |
|---------------|--------------|------------------|----------------|
| **Point** | Systems, Deployments, SamplingFeatures | Fixed sensors, weather stations, sampling points | **Required** |
| **MultiPoint** | SamplingFeatures | Multiple discrete sampling locations | **Required** |
| **LineString** | Systems, Deployments, SamplingFeatures | Mobile platform paths, transects, pipelines | **Required** |
| **MultiLineString** | Deployments, SamplingFeatures | Multiple transects, network segments | **Required** |
| **Polygon** | Deployments, SamplingFeatures | Coverage areas, sampling plots, survey regions | **Required** |
| **MultiPolygon** | Deployments, SamplingFeatures | Discontinuous coverage, multiple plots | **Required** |
| **GeometryCollection** | Systems, Deployments | Complex features with mixed geometry types | **Required** |

**All 7 geometry types MUST be supported** per RFC 7946 and OGC API – Features requirements.

#### 2.2 Geometry Coordinate Arrays

**2D Coordinates (Required):**
```json
{
  "type": "Point",
  "coordinates": [-122.08, 37.42]
}
```
- Format: `[longitude, latitude]`
- Coordinate order: **longitude first, latitude second** (per RFC 7946 Section 3.1.1)
- Range: longitude [-180, 180], latitude [-90, 90]

**3D Coordinates (Required):**
```json
{
  "type": "Point",
  "coordinates": [-122.08, 37.42, 25.5]
}
```
- Format: `[longitude, latitude, altitude]`
- Third coordinate represents altitude/elevation in meters
- Positive altitude = above reference surface, Negative = below

**Client Library Requirements:**
- Parse 2D and 3D coordinate arrays
- Preserve coordinate precision (typically 6-8 decimal places)
- Validate coordinate array length (minItems: 2 for 2D, minItems: 3 for 3D)
- Handle null altitude (missing third coordinate)

#### 2.3 Null Geometry Handling

**Allowed for Procedures:**
```json
{
  "type": "Feature",
  "id": "proc123",
  "geometry": null,
  "properties": {
    "name": "Standard Operating Procedure"
  }
}
```

**Client Library Requirements:**
- Allow `geometry: null` for Procedure resources
- Reject `geometry: null` for Systems, Deployments, SamplingFeatures (validation error)
- TypeScript type: `geometry: GeoJSONGeometry | null`

---

### 3. CSAPI GeoJSON Feature Structure

#### 3.1 Feature Object Schema

**Complete Feature Structure:**
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
    "validTime": ["2024-01-01T00:00:00Z", null],
    "parent@id": "platform456",
    "procedure@id": "proc789"
  },
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

**Required Feature Properties:**
- `type`: Always `"Feature"` (string, required)
- `geometry`: Geometry object or `null` (required)
- `properties`: Object containing CSAPI-specific properties (required, may be `null`)

**Optional Feature Properties:**
- `id`: Resource identifier (string or integer, optional but strongly recommended)
- `links`: Array of link objects for navigation (optional)
- `bbox`: Bounding box array (optional, rarely used in CSAPI)

#### 3.2 CSAPI Property Mappings

**Common Properties (All Resources):**
- `uid` (string, format: uri) - Unique persistent identifier
- `name` (string) - Human-readable name
- `description` (string) - Detailed description
- `validTime` (array of 2 date-times) - Temporal validity period `[startTime, endTime]`, `null` for open-ended

**System-Specific Properties:**
- `featureType` (string, format: uri) - System ontology type (`sosa:Sensor`, `sosa:Actuator`, etc.)
- `assetType` (string) - Asset classification (`Equipment`, `Human`, `Simulation`, etc.)
- `parent@id` (string) - Parent system local ID
- `procedure@id` (string) - Associated procedure local ID

**Deployment-Specific Properties:**
- `deployedSystem@id` (string) - System being deployed
- `platform@id` (string) - Platform hosting deployment
- `height` (number) - Deployment height above ground/water surface

**SamplingFeature-Specific Properties:**
- `sampledFeature@id` (string) - Feature being sampled
- `samplingProcedure@id` (string) - Procedure used for sampling
- `shape` (string) - Shape classification (`Point`, `Curve`, `Surface`, `Solid`)

**Reference Encoding Convention:**
- Local ID references use `@id` suffix (e.g., `parent@id`)
- URI references use `@link` suffix (e.g., `parent@link` with full Link object)

---

### 4. Coordinate Reference System (CRS)

#### 4.1 Default CRS: WGS 84 (CRS84)

**RFC 7946 Requirement:**
- Default CRS: **WGS 84** (World Geodetic System 1984)
- EPSG code: **EPSG:4326** (latitude/longitude)
- GeoJSON identifier: **CRS84** (OGC:CRS84 - longitude/latitude order)

**Coordinate Order:**
- GeoJSON uses **longitude, latitude** order (CRS84)
- Different from many GIS systems that use **latitude, longitude** (EPSG:4326)

**Altitude Reference:**
- Altitude measured relative to WGS 84 ellipsoid
- Positive values above ellipsoid, negative below
- Not orthometric height (not relative to geoid/mean sea level)

#### 4.2 Alternative CRS Support

**RFC 7946 Position:**
- RFC 7946 Section 4: "The use of alternative coordinate reference systems was specified in [GeoJSON 2008] but... removed from this version of the specification."
- **Alternative CRS not supported in RFC 7946 GeoJSON**

**CSAPI Part 1 Position:**
- Inherits RFC 7946 constraint
- No CRS negotiation mechanism defined
- All GeoJSON uses WGS 84 / CRS84

**Client Library Implications:**
- Assume all GeoJSON coordinates are WGS 84 / CRS84
- No CRS transformation needed for input/output
- If application uses different CRS internally, **client application** responsible for transformation

---

### 5. GeoJSON FeatureCollection Usage

#### 5.1 Collection Responses

**Structure:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "sensor123",
      "geometry": { "type": "Point", "coordinates": [-122.08, 37.42] },
      "properties": { "name": "Sensor TS-001" }
    },
    {
      "type": "Feature",
      "id": "sensor456",
      "geometry": { "type": "Point", "coordinates": [-122.10, 37.45] },
      "properties": { "name": "Sensor TS-002" }
    }
  ],
  "links": [
    {
      "rel": "self",
      "href": "https://api.example.org/systems?f=geojson&limit=10"
    },
    {
      "rel": "next",
      "href": "https://api.example.org/systems?f=geojson&limit=10&cursor=abc123"
    }
  ],
  "timeStamp": "2024-01-15T10:00:00Z",
  "numberMatched": 250
}
```

**Required FeatureCollection Properties:**
- `type`: Always `"FeatureCollection"` (string, required)
- `features`: Array of Feature objects (required, may be empty array)

**Optional FeatureCollection Properties:**
- `links`: Pagination and navigation links (optional)
- `timeStamp`: Response generation time (string, format: date-time, optional)
- `numberMatched`: Total count of matching features (integer, optional)
- `numberReturned`: Count of features in response (integer, optional)
- `bbox`: Bounding box of all features (array of numbers, optional)

#### 5.2 Endpoints Returning FeatureCollections

**Part 1 Collection Endpoints:**
- `GET /systems` with `Accept: application/geo+json`
- `GET /systems/{systemId}/subsystems` with `Accept: application/geo+json`
- `GET /deployments` with `Accept: application/geo+json`
- `GET /samplingFeatures` with `Accept: application/geo+json`
- `GET /procedures` with `Accept: application/geo+json`

**Part 2 Collection Endpoints (Optional):**
- `GET /datastreams` with `Accept: application/geo+json`
- `GET /controlstreams` with `Accept: application/geo+json`
- `GET /systemEvents` (GeoJSON not applicable)

**Single Resource Endpoints:**
- Return single Feature object (not FeatureCollection)
- Example: `GET /systems/sensor123` returns Feature

---

### 6. Client Library Parsing Requirements

#### 6.1 Parse vs Opaque Handling

**Recommended Approach: Structured Parsing**

**Rationale:**
- Client needs to extract `properties` for display/filtering
- Client needs to extract `id` for resource operations
- Client needs to extract `links` for navigation
- Geometry operations needed for spatial filtering/display

**What to Parse:**
- Feature `type`, `id`, `geometry`, `properties`, `links`
- Geometry `type`, `coordinates`
- Property values per resource type schema
- Link `rel`, `href`, `type` for navigation

**What to Preserve Opaquely:**
- Unknown properties in `properties` object (forward compatibility)
- Unknown link relation types
- Extension fields

#### 6.2 TypeScript Type Definitions

**Base GeoJSON Types:**
```typescript
type Position = [number, number] | [number, number, number]; // [lon, lat] or [lon, lat, alt]

type Point = {
  type: 'Point';
  coordinates: Position;
};

type MultiPoint = {
  type: 'MultiPoint';
  coordinates: Position[];
};

type LineString = {
  type: 'LineString';
  coordinates: Position[]; // minItems: 2
};

type MultiLineString = {
  type: 'MultiLineString';
  coordinates: Position[][];
};

type Polygon = {
  type: 'Polygon';
  coordinates: Position[][]; // First ring = exterior, rest = holes
};

type MultiPolygon = {
  type: 'MultiPolygon';
  coordinates: Position[][][];
};

type GeometryCollection = {
  type: 'GeometryCollection';
  geometries: GeoJSONGeometry[];
};

type GeoJSONGeometry = 
  | Point 
  | MultiPoint 
  | LineString 
  | MultiLineString 
  | Polygon 
  | MultiPolygon 
  | GeometryCollection;
```

**Feature Types:**
```typescript
interface GeoJSONFeature<P = any> {
  type: 'Feature';
  id?: string | number;
  geometry: GeoJSONGeometry | null;
  properties: P | null;
  links?: Link[];
  bbox?: number[];
}

interface GeoJSONFeatureCollection<P = any> {
  type: 'FeatureCollection';
  features: GeoJSONFeature<P>[];
  links?: Link[];
  timeStamp?: string;
  numberMatched?: number;
  numberReturned?: number;
  bbox?: number[];
}
```

**CSAPI-Specific Properties:**
```typescript
interface SystemGeoJSONProperties {
  uid: string;
  name: string;
  description?: string;
  featureType: string; // URI
  assetType?: string;
  validTime?: [string, string | null];
  'parent@id'?: string;
  'procedure@id'?: string;
  [key: string]: any; // Allow extensions
}

type SystemFeature = GeoJSONFeature<SystemGeoJSONProperties>;
type SystemCollection = GeoJSONFeatureCollection<SystemGeoJSONProperties>;
```

#### 6.3 Validation Requirements

**Client-Side Validation:**

**Geometry Validation:**
- Validate `type` is one of 7 allowed geometry types
- Validate `coordinates` array structure matches geometry type
- Validate coordinate count (minItems: 2 for positions, minItems: 2 for LineString, minItems: 4 for Polygon rings)
- Validate longitude range [-180, 180]
- Validate latitude range [-90, 90]
- Validate polygon ring closure (first position === last position)

**Feature Validation:**
- Validate `type: "Feature"`
- Validate `geometry` is GeoJSONGeometry or null
- Validate `properties` is object or null
- Reject `geometry: null` for Systems, Deployments, SamplingFeatures

**FeatureCollection Validation:**
- Validate `type: "FeatureCollection"`
- Validate `features` is array
- Validate each feature in array

**Error Handling:**
- Throw `ValidationError` for malformed GeoJSON
- Include specific validation failure details (e.g., "Invalid longitude value: 200")
- Provide JSON path to error location (e.g., "features[2].geometry.coordinates[0]")

---

### 7. Geometry Operations Needed

#### 7.1 Required Operations

**Bounding Box Calculation:**
- Calculate bbox from geometry coordinates
- Used for spatial indexing, map extent calculation
- Algorithm:
  ```typescript
  function calculateBBox(geometry: GeoJSONGeometry): [number, number, number, number] {
    const coords = extractAllCoordinates(geometry);
    const lons = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    return [
      Math.min(...lons), // minLon
      Math.min(...lats), // minLat
      Math.max(...lons), // maxLon
      Math.max(...lats)  // maxLat
    ];
  }
  ```

**Coordinate Extraction:**
- Flatten geometry coordinates to single array of positions
- Needed for bbox calculation, coordinate transformation
- Handle all 7 geometry types including GeometryCollection

**Geometry Type Detection:**
- Determine geometry type from feature
- Used for rendering decisions (point vs line vs polygon)

#### 7.2 Optional Operations (Not Required for MVP)

**Spatial Predicates:**
- Point-in-polygon test (for client-side spatial filtering)
- Geometry intersection (for overlay operations)
- Distance calculation (for proximity queries)

**Geometry Simplification:**
- Reduce coordinate count for performance
- Douglas-Peucker algorithm

**Coordinate Transformation:**
- Transform WGS 84 to/from other CRS (e.g., Web Mercator for web maps)
- Use external library like proj4js

**Recommendation:** Use external GeoJSON libraries (e.g., `@turf/turf`, `geojson-validation`) for complex operations.

---

### 8. 3D Coordinate Handling

#### 8.1 Altitude Semantics

**WGS 84 Ellipsoidal Height:**
- Third coordinate = height above WGS 84 ellipsoid
- **Not** orthometric height (height above mean sea level)
- **Not** height above ground level

**Conversion Needed for Display:**
- Web maps typically expect height above ground or mean sea level
- Requires geoid model for conversion (e.g., EGM96, EGM2008)
- Client library should document altitude semantics, not perform conversion

#### 8.2 Client API for 3D Coordinates

**Position Interface:**
```typescript
interface Position2D {
  lon: number;
  lat: number;
}

interface Position3D extends Position2D {
  alt: number; // Altitude in meters (WGS 84 ellipsoidal height)
}

type Position = Position2D | Position3D;

function parsePosition(coords: number[]): Position {
  if (coords.length === 2) {
    return { lon: coords[0], lat: coords[1] };
  } else if (coords.length === 3) {
    return { lon: coords[0], lat: coords[1], alt: coords[2] };
  } else {
    throw new Error(`Invalid position length: ${coords.length}`);
  }
}
```

**Type Guard:**
```typescript
function hasAltitude(pos: Position): pos is Position3D {
  return 'alt' in pos;
}

// Usage
const pos = parsePosition([-122.08, 37.42, 25.5]);
if (hasAltitude(pos)) {
  console.log(`Altitude: ${pos.alt}m`);
}
```

---

### 9. Client API Implications

#### 9.1 Format Negotiation

**Requesting GeoJSON:**
```typescript
// Option 1: Accept header
const systems = await client.getSystems({
  headers: { 'Accept': 'application/geo+json' }
});

// Option 2: Query parameter
const systems = await client.getSystems({
  format: 'geojson'
});

// Option 3: Convenience method
const systems = await client.getSystemsAsGeoJSON();
```

**Accept Header vs Query Parameter:**
- Accept header: Standard HTTP content negotiation
- Query parameter `f=geojson`: OGC API convention
- Query parameter takes precedence over Accept header (per OGC API – Common)

#### 9.2 Response Type Handling

**TypeScript Return Types:**
```typescript
class CSAPIClient {
  // Generic method - format determined at runtime
  async getSystems(options?: {
    format?: 'json' | 'geojson' | 'sensorml';
    // ... other options
  }): Promise<SystemCollection | SystemGeoJSONCollection | SystemSensorMLCollection>;
  
  // Format-specific methods - explicit return types
  async getSystemsAsGeoJSON(options?: QueryOptions): Promise<SystemGeoJSONCollection>;
  async getSystemAsGeoJSON(id: string): Promise<SystemFeature>;
  
  async getDeploymentsAsGeoJSON(options?: QueryOptions): Promise<DeploymentGeoJSONCollection>;
  async getSamplingFeaturesAsGeoJSON(options?: QueryOptions): Promise<SamplingFeatureGeoJSONCollection>;
}
```

#### 9.3 Geometry Access Convenience

**Direct Geometry Access:**
```typescript
interface System {
  id: string;
  name: string;
  // ... other properties
  geometry?: GeoJSONGeometry; // When fetched as GeoJSON
  location?: Position; // Convenience accessor for Point geometries
}

const system = await client.getSystemAsGeoJSON('sensor123');
if (system.geometry?.type === 'Point') {
  system.location = parsePosition(system.geometry.coordinates);
}
```

#### 9.4 Write Operations

**Creating System with GeoJSON:**
```typescript
const newSystem = await client.createSystem({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [-122.08, 37.42, 25.5]
  },
  properties: {
    name: 'New Temperature Sensor',
    featureType: 'http://www.w3.org/ns/sosa/Sensor',
    assetType: 'Equipment'
  }
}, {
  format: 'geojson'
});
```

**Updating System Geometry:**
```typescript
const system = await client.getSystemAsGeoJSON('sensor123');
system.geometry = {
  type: 'Point',
  coordinates: [-122.10, 37.45, 30.0] // New location
};
await client.updateSystem('sensor123', system, { format: 'geojson' });
```

---

### 10. Error Handling

#### 10.1 Format-Related Errors

**Unsupported Format Error:**
```typescript
class UnsupportedFormatError extends Error {
  constructor(
    public requestedFormat: string,
    public availableFormats: string[]
  ) {
    super(`Format '${requestedFormat}' not supported. Available: ${availableFormats.join(', ')}`);
  }
}

// Server returns 406 Not Acceptable
if (response.status === 406) {
  throw new UnsupportedFormatError('application/geo+json', ['application/json', 'application/sml+json']);
}
```

**Malformed GeoJSON Error:**
```typescript
class MalformedGeoJSONError extends Error {
  constructor(
    public jsonPath: string,
    public validationError: string
  ) {
    super(`Invalid GeoJSON at ${jsonPath}: ${validationError}`);
  }
}

// Example
throw new MalformedGeoJSONError(
  'features[2].geometry.coordinates[0]',
  'Longitude must be between -180 and 180, got 200'
);
```

#### 10.2 Validation Error Reporting

**Detailed Validation Results:**
```typescript
interface ValidationError {
  path: string; // JSON path to error
  message: string; // Human-readable message
  value?: any; // Invalid value
  constraint?: string; // Violated constraint (e.g., "minItems: 2")
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function validateGeoJSONFeature(feature: any): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (feature.type !== 'Feature') {
    errors.push({
      path: 'type',
      message: 'Feature type must be "Feature"',
      value: feature.type
    });
  }
  
  if (feature.geometry) {
    const geomErrors = validateGeometry(feature.geometry, 'geometry');
    errors.push(...geomErrors);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

### 11. Dependencies and Libraries

#### 11.1 Recommended External Libraries

**GeoJSON Validation:**
- **geojson-validation** - RFC 7946 compliance checking
- **@turf/turf** - Spatial operations, bbox calculation, validation

**Usage:**
```typescript
import { validate } from 'geojson-validation';
import * as turf from '@turf/turf';

// Validation
const isValid = validate(geoJsonFeature);

// Bounding box
const bbox = turf.bbox(geoJsonFeatureCollection);

// Point in polygon
const point = turf.point([-122.08, 37.42]);
const polygon = turf.polygon([...]);
const inside = turf.booleanPointInPolygon(point, polygon);
```

#### 11.2 Built-in vs External

**Built-in (Client Library):**
- TypeScript type definitions for GeoJSON
- Basic parsing (JSON.parse)
- Format negotiation (Accept header, query param)
- Property extraction from Feature.properties

**External Libraries (Optional Dependencies):**
- Complex validation (geojson-validation)
- Spatial operations (turf)
- Coordinate transformations (proj4)
- Map rendering (leaflet, mapbox-gl)

**Rationale:** Keep core library lightweight, provide plugin support for advanced features.

---

## Summary

**Section 3.2 Complete:** GeoJSON Format Requirements (~500 lines documenting all GeoJSON aspects)

### Key Requirements

**Resources Supporting GeoJSON:**
- Part 1: Systems, Deployments, Procedures (geometry: null allowed), SamplingFeatures
- Part 2: DataStreams, ControlStreams (optional for collections)

**Geometry Types:**
- All 7 RFC 7946 types required: Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon, GeometryCollection
- 2D and 3D coordinates (altitude = WGS 84 ellipsoidal height)
- Coordinate order: longitude, latitude (CRS84)

**CRS Support:**
- WGS 84 / CRS84 only (RFC 7946 requirement)
- No alternative CRS support
- Application responsible for coordinate transformation if needed

**Feature Structure:**
- Standard RFC 7946 Feature object
- CSAPI properties in `properties` object
- Reference encoding: `@id` for local IDs, `@link` for URI refs
- Navigation links in `links` array with `ogc-rel:` prefix

**Client Library Must:**
- Parse GeoJSON Feature and FeatureCollection
- Extract geometry, properties, id, links
- Validate geometry structure and coordinate ranges
- Support format negotiation (Accept header, query param)
- Calculate bounding boxes
- Handle 3D coordinates (preserve altitude)
- Provide TypeScript types for all GeoJSON structures

**Optional (External Libraries):**
- Complex spatial operations (point-in-polygon, intersection)
- Coordinate transformation
- Geometry simplification

**Ready for Section 3.3:** SensorML Format Requirements
