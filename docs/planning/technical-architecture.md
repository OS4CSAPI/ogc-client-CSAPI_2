# CSAPI Client Library - Technical Architecture

**Version:** 1.0  
**Date:** 2026-02-01  
**Status:** Draft  
**Purpose:** Define all components, modules, classes, and types we will build

---

## Document Purpose

This document answers the question: **"What exactly are we going to build to make the vision possible?"**

It catalogs every file, class, function, and type we'll create, describing what each component does and how it fits into the overall architecture. This is the blueprint for implementation.

**Related Documents:**
- [Vision and Scope](vision-and-scope.md) - What the library will do (user perspective)
- [Functional Specification](functional-spec.md) - How it will work (implementation details)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Core Modules](#2-core-modules)
3. [Format Parser Modules](#3-format-parser-modules)
4. [Resource Modules](#4-resource-modules)
5. [Worker Modules](#5-worker-modules)
6. [Type Definitions](#6-type-definitions)
7. [Utility Modules](#7-utility-modules)
8. [Test Modules](#8-test-modules)
9. [Build Output](#9-build-output)

---

## 1. Architecture Overview

### 1.1 Module Hierarchy

```
@camptocamp/ogc-client
├── Core Library (src/)
│   ├── CSAPI Endpoint (src/csapi/)
│   │   ├── Main endpoint class
│   │   ├── Format parsers
│   │   ├── Resource operations
│   │   └── Type definitions
│   ├── Worker Support (src/worker/)
│   │   └── CSAPI handlers
│   └── Shared Utilities (src/shared/)
│       └── Reused by CSAPI
│
├── Node.js Support (src-node/)
│   └── CSAPI exports for Node.js
│
└── Tests (src/csapi/*.spec.ts)
    ├── Unit tests
    ├── Integration tests
    └── Performance tests
```

### 1.2 Dependency Graph

```
┌─────────────────────┐
│  CSAPIEndpoint      │  ← Main entry point
│  (endpoint.ts)      │
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│ Format Parsers   │  │ Resource Modules │
│ (formats/*)      │  │ (resources/*)    │
└──────────────────┘  └──────────────────┘
           │                 │
           └────────┬────────┘
                    ▼
           ┌────────────────┐
           │  Type Defs     │
           │  (model.ts)    │
           └────────────────┘
                    │
                    ▼
           ┌────────────────┐
           │  Utilities     │
           │  (url.ts, etc) │
           └────────────────┘
```

### 1.3 Layer Responsibilities

| Layer | Responsibilities | Files |
|-------|------------------|-------|
| **Public API** | User-facing endpoint class | `endpoint.ts` |
| **Service Discovery** | Parse metadata endpoints | `conformance.ts`, `collections.ts` |
| **Format Abstraction** | Parse all CSAPI formats | `formats/*.ts` |
| **Resource Operations** | CRUD for all resource types | `resources/*.ts` |
| **Worker Integration** | Offload heavy parsing | `worker/worker.ts`, `worker/index.ts` |
| **Type System** | All TypeScript interfaces | `model.ts` |
| **URL Building** | Construct query URLs | `url.ts` |

---

## 2. Core Modules

### 2.1 `src/csapi/endpoint.ts`

**Purpose:** Main entry point - the `CSAPIEndpoint` class

**What We Build:**
```typescript
export default class CSAPIEndpoint {
  // Private properties
  private _url: string;
  private _fetchOptions?: RequestInit;
  private _validationMode: ValidationMode;
  private _initPromise: Promise<void>;
  private _info?: CSAPIEndpointInfo;
  private _conformance?: string[];
  private _collections?: CSAPICollection[];
  
  // Constructor
  constructor(url: string, options?: CSAPIEndpointOptions)
  
  // Initialization
  private async _initialize(): Promise<void>
  isReady(): Promise<CSAPIEndpoint>
  
  // Metadata getters
  getServiceInfo(): CSAPIEndpointInfo
  getConformanceClasses(): string[]
  getCollections(): CSAPICollection[]
  getVersion(): string | undefined
  
  // Part 1 Resources
  getSystems(options?: QueryOptions): Promise<SystemCollection>
  getSystemById(id: string, options?: GetByIdOptions): Promise<SystemFeature>
  createSystem(system: SystemInput): Promise<string>
  updateSystem(id: string, system: SystemInput): Promise<void>
  deleteSystem(id: string): Promise<void>
  
  getDeployments(options?: QueryOptions): Promise<DeploymentCollection>
  getDeploymentById(id: string, options?: GetByIdOptions): Promise<DeploymentFeature>
  createDeployment(deployment: DeploymentInput): Promise<string>
  updateDeployment(id: string, deployment: DeploymentInput): Promise<void>
  deleteDeployment(id: string): Promise<void>
  
  getProcedures(options?: QueryOptions): Promise<ProcedureCollection>
  getProcedureById(id: string, options?: GetByIdOptions): Promise<Procedure>
  createProcedure(procedure: ProcedureInput): Promise<string>
  updateProcedure(id: string, procedure: ProcedureInput): Promise<void>
  deleteProcedure(id: string): Promise<void>
  
  getSamplingFeatures(options?: QueryOptions): Promise<SamplingFeatureCollection>
  getSamplingFeatureById(id: string, options?: GetByIdOptions): Promise<SamplingFeatureFeature>
  createSamplingFeature(feature: SamplingFeatureInput): Promise<string>
  updateSamplingFeature(id: string, feature: SamplingFeatureInput): Promise<void>
  deleteSamplingFeature(id: string): Promise<void>
  
  getProperties(options?: QueryOptions): Promise<PropertyCollection>
  getPropertyById(id: string, options?: GetByIdOptions): Promise<Property>
  
  // Part 2 Resources
  getDataStreams(options?: QueryOptions): Promise<DataStreamCollection>
  getDataStreamById(id: string, options?: GetByIdOptions): Promise<DataStream>
  getSystemDataStreams(systemId: string, options?: QueryOptions): Promise<DataStreamCollection>
  createDataStream(datastream: DataStreamInput): Promise<string>
  updateDataStream(id: string, datastream: DataStreamInput): Promise<void>
  deleteDataStream(id: string): Promise<void>
  
  getObservations(options?: QueryOptions): Promise<ObservationCollection>
  getObservationById(id: string, options?: GetByIdOptions): Promise<Observation>
  getDataStreamObservations(datastreamId: string, options?: QueryOptions): Promise<ObservationCollection>
  createObservations(observations: ObservationInput[]): Promise<string[]>
  
  getControlStreams(options?: QueryOptions): Promise<ControlStreamCollection>
  getControlStreamById(id: string, options?: GetByIdOptions): Promise<ControlStream>
  getSystemControlStreams(systemId: string, options?: QueryOptions): Promise<ControlStreamCollection>
  createControlStream(stream: ControlStreamInput): Promise<string>
  updateControlStream(id: string, stream: ControlStreamInput): Promise<void>
  deleteControlStream(id: string): Promise<void>
  
  getCommands(options?: QueryOptions): Promise<CommandCollection>
  getCommandById(id: string, options?: GetByIdOptions): Promise<Command>
  getControlStreamCommands(controlStreamId: string, options?: QueryOptions): Promise<CommandCollection>
  createCommands(commands: CommandInput[]): Promise<string[]>
  
  // Utility
  clearCache(): void
}
```

**Responsibilities:**
- Orchestrate initialization (landing page, conformance, collections)
- Delegate to resource modules for actual operations
- Manage caching and error handling
- Provide clean public API

**Estimated Lines:** ~300 lines

---

### 2.2 `src/csapi/conformance.ts`

**Purpose:** Parse CSAPI conformance endpoint

**What We Build:**
```typescript
// Interfaces
export interface ConformanceDocument {
  conformsTo: string[];
}

// Functions
export async function parseConformance(url: string): Promise<string[]>

// Helper functions
function isConformanceDocument(data: unknown): data is ConformanceDocument
function validateConformanceDocument(doc: ConformanceDocument): void
```

**Responsibilities:**
- Fetch `/conformance` endpoint
- Parse JSON response
- Extract conformance class URIs
- Validate structure

**Estimated Lines:** ~150 lines

---

### 2.3 `src/csapi/collections.ts`

**Purpose:** Parse CSAPI collections endpoint

**What We Build:**
```typescript
// Interfaces
export interface CollectionsDocument {
  collections: CSAPICollection[];
  links?: Link[];
}

// Functions
export async function parseCollections(url: string): Promise<CSAPICollection[]>

// Helper functions
function isCollectionsDocument(data: unknown): data is CollectionsDocument
function validateCollectionsDocument(doc: CollectionsDocument): void
function parseCollection(data: unknown): CSAPICollection
```

**Responsibilities:**
- Fetch `/collections` endpoint
- Parse JSON response
- Extract collection metadata
- Validate structure

**Estimated Lines:** ~200 lines

---

### 2.4 `src/csapi/model.ts`

**Purpose:** All TypeScript type definitions for CSAPI

**What We Build:**
```typescript
// Configuration types
export interface CSAPIEndpointOptions {
  fetchOptions?: RequestInit;
  validationMode?: ValidationMode;
}

export type ValidationMode = 'strict' | 'lenient';

// Service metadata types
export interface CSAPIEndpointInfo extends GenericEndpointInfo {
  conformsTo?: string[];
  version?: string;
}

export interface CSAPICollection {
  id: string;
  title: string;
  description?: string;
  links: Link[];
  extent?: Extent;
  itemType?: string;
}

export interface Extent {
  spatial?: SpatialExtent;
  temporal?: TemporalExtent;
}

export interface SpatialExtent {
  bbox: BoundingBox[];
  crs?: string;
}

export interface TemporalExtent {
  interval: string[][];
  trs?: string;
}

export interface Link {
  href: string;
  rel: string;
  type?: string;
  title?: string;
  hreflang?: string;
}

// Query parameter types
export interface QueryOptions {
  bbox?: BoundingBox;
  datetime?: string;
  limit?: number;
  offset?: number;
  filter?: string;
  properties?: string[];
  sortby?: string;
  f?: string;
}

export interface GetByIdOptions {
  f?: string;
}

// Part 1 Resource types
export interface SystemFeature extends Feature {
  id: string;
  type: 'Feature';
  geometry?: Geometry;
  properties: SystemProperties;
  links?: Link[];
}

export interface SystemProperties {
  uid: string;
  name: string;
  description?: string;
  featureType: string;
  validTime?: TemporalExtent;
  // SensorML properties
  definition?: string;
  uniqueId?: string;
  identification?: Identifier[];
  classification?: Classifier[];
  characteristics?: Characteristic[];
  capabilities?: Capability[];
  contacts?: Contact[];
  documentation?: Document[];
  history?: Event[];
  position?: Position;
  components?: SystemFeature[];
}

export interface SystemCollection extends FeatureCollection {
  type: 'FeatureCollection';
  features: SystemFeature[];
  links?: Link[];
  numberMatched?: number;
  numberReturned?: number;
}

export interface SystemInput {
  geometry?: Geometry;
  properties: Partial<SystemProperties>;
}

// Deployment types
export interface DeploymentFeature extends Feature {
  id: string;
  type: 'Feature';
  geometry?: Geometry;
  properties: DeploymentProperties;
  links?: Link[];
}

export interface DeploymentProperties {
  name: string;
  description?: string;
  validTime?: TemporalExtent;
  platform?: Link;
  deployedSystems?: Link[];
}

export interface DeploymentCollection extends FeatureCollection {
  type: 'FeatureCollection';
  features: DeploymentFeature[];
  links?: Link[];
  numberMatched?: number;
  numberReturned?: number;
}

export interface DeploymentInput {
  geometry?: Geometry;
  properties: Partial<DeploymentProperties>;
}

// Procedure types
export interface Procedure {
  id: string;
  name: string;
  description?: string;
  definition?: string;
  // SensorML process details
  type?: string;
  inputs?: IOComponent[];
  outputs?: IOComponent[];
  parameters?: Parameter[];
  links?: Link[];
}

export interface ProcedureCollection {
  items: Procedure[];
  links?: Link[];
  numberMatched?: number;
  numberReturned?: number;
}

export interface ProcedureInput {
  name: string;
  description?: string;
  definition?: string;
  type?: string;
}

// Sampling Feature types
export interface SamplingFeatureFeature extends Feature {
  id: string;
  type: 'Feature';
  geometry?: Geometry;
  properties: SamplingFeatureProperties;
  links?: Link[];
}

export interface SamplingFeatureProperties {
  name: string;
  description?: string;
  featureType: string;
  sampledFeature?: Link;
}

export interface SamplingFeatureCollection extends FeatureCollection {
  type: 'FeatureCollection';
  features: SamplingFeatureFeature[];
  links?: Link[];
  numberMatched?: number;
  numberReturned?: number;
}

export interface SamplingFeatureInput {
  geometry?: Geometry;
  properties: Partial<SamplingFeatureProperties>;
}

// Property types
export interface Property {
  id: string;
  definition: string;
  label?: string;
  description?: string;
  links?: Link[];
}

export interface PropertyCollection {
  items: Property[];
  links?: Link[];
  numberMatched?: number;
  numberReturned?: number;
}

// Part 2 Resource types
export interface DataStream {
  id: string;
  name: string;
  description?: string;
  observedProperty: Link;
  phenomenonTime?: TemporalExtent;
  resultTime?: TemporalExtent;
  system: Link;
  procedure?: Link;
  observedArea?: Geometry;
  outputName?: string;
  schema: SWEComponent;
  encoding?: SWEEncoding;
  links?: Link[];
}

export interface DataStreamCollection {
  items: DataStream[];
  links?: Link[];
  numberMatched?: number;
  numberReturned?: number;
}

export interface DataStreamInput {
  name: string;
  description?: string;
  observedProperty: Link;
  system: Link;
  procedure?: Link;
  outputName?: string;
  schema: SWEComponent;
  encoding?: SWEEncoding;
}

// Observation types
export interface Observation {
  id: string;
  phenomenonTime: string;
  resultTime: string;
  result: unknown;
  datastream: Link;
  featureOfInterest?: Link;
  parameters?: Record<string, unknown>;
  links?: Link[];
}

export interface ObservationCollection {
  items: Observation[];
  links?: Link[];
  numberMatched?: number;
  numberReturned?: number;
}

export interface ObservationInput {
  phenomenonTime: string;
  resultTime: string;
  result: unknown;
  datastream: Link;
  featureOfInterest?: Link;
  parameters?: Record<string, unknown>;
}

// Control Stream types
export interface ControlStream {
  id: string;
  name: string;
  description?: string;
  system: Link;
  schema: SWEComponent;
  encoding?: SWEEncoding;
  links?: Link[];
}

export interface ControlStreamCollection {
  items: ControlStream[];
  links?: Link[];
  numberMatched?: number;
  numberReturned?: number;
}

export interface ControlStreamInput {
  name: string;
  description?: string;
  system: Link;
  schema: SWEComponent;
  encoding?: SWEEncoding;
}

// Command types
export interface Command {
  id: string;
  executionTime: string;
  parameters: unknown;
  controlStream: Link;
  status?: string;
  result?: unknown;
  links?: Link[];
}

export interface CommandCollection {
  items: Command[];
  links?: Link[];
  numberMatched?: number;
  numberReturned?: number;
}

export interface CommandInput {
  executionTime: string;
  parameters: unknown;
  controlStream: Link;
}

// SensorML types (subset used in System properties)
export interface Identifier {
  definition: string;
  label?: string;
  value: string;
}

export interface Classifier {
  definition: string;
  label?: string;
  value: string;
}

export interface Characteristic {
  name: string;
  label?: string;
  definition?: string;
  value: unknown;
  uom?: UnitOfMeasure;
}

export interface Capability {
  name: string;
  label?: string;
  definition?: string;
  value?: unknown;
  uom?: UnitOfMeasure;
  constraint?: AllowedValues;
  quality?: Quality[];
}

export interface Contact {
  role: string;
  organization?: string;
  individual?: string;
  phone?: string;
  email?: string;
  address?: Address;
}

export interface Address {
  deliveryPoint?: string;
  city?: string;
  administrativeArea?: string;
  postalCode?: string;
  country?: string;
}

export interface Document {
  description?: string;
  format?: string;
  url: string;
}

export interface Event {
  time: string;
  type?: string;
  description?: string;
}

export interface Position {
  type: 'Point' | 'Pose';
  coordinates?: number[];
  orientation?: number[];
  referenceFrame?: string;
}

// SWE Common types
export type SWEComponent =
  | Quantity
  | Count
  | Boolean
  | Text
  | Category
  | Time
  | DataRecord
  | Vector
  | DataArray
  | DataChoice
  | Matrix;

export interface Quantity {
  type: 'Quantity';
  label?: string;
  description?: string;
  definition?: string;
  uom: UnitOfMeasure;
  constraint?: AllowedValues;
  quality?: Quality[];
}

export interface Count {
  type: 'Count';
  label?: string;
  description?: string;
  definition?: string;
  constraint?: AllowedValues;
}

export interface Boolean {
  type: 'Boolean';
  label?: string;
  description?: string;
  definition?: string;
}

export interface Text {
  type: 'Text';
  label?: string;
  description?: string;
  definition?: string;
  constraint?: AllowedTokens;
}

export interface Category {
  type: 'Category';
  label?: string;
  description?: string;
  definition?: string;
  codeSpace?: string;
  constraint?: AllowedTokens;
}

export interface Time {
  type: 'Time';
  label?: string;
  description?: string;
  definition?: string;
  uom?: UnitOfMeasure;
  constraint?: AllowedTimes;
  referenceTime?: string;
}

export interface DataRecord {
  type: 'DataRecord';
  label?: string;
  description?: string;
  definition?: string;
  fields: SWEField[];
}

export interface SWEField {
  name: string;
  component: SWEComponent;
}

export interface Vector {
  type: 'Vector';
  label?: string;
  description?: string;
  definition?: string;
  referenceFrame?: string;
  localFrame?: string;
  coordinates: SWEField[];
}

export interface DataArray {
  type: 'DataArray';
  label?: string;
  description?: string;
  definition?: string;
  elementCount?: Count;
  elementType: SWEComponent;
  encoding?: SWEEncoding;
  values?: unknown[];
}

export interface DataChoice {
  type: 'DataChoice';
  label?: string;
  description?: string;
  definition?: string;
  choices: SWEField[];
}

export interface Matrix {
  type: 'Matrix';
  label?: string;
  description?: string;
  definition?: string;
  elementType: SWEComponent;
  encoding?: SWEEncoding;
  values?: unknown[][];
}

export interface UnitOfMeasure {
  code: string;
  href?: string;
}

export interface AllowedValues {
  interval?: [number, number][];
  values?: number[];
  significantFigures?: number;
}

export interface AllowedTokens {
  pattern?: string;
  values?: string[];
}

export interface AllowedTimes {
  interval?: [string, string][];
  values?: string[];
  significantFigures?: number;
}

export interface Quality {
  definition?: string;
  value: unknown;
  uom?: UnitOfMeasure;
}

// SWE Encoding types
export type SWEEncoding = JSONEncoding | TextEncoding | BinaryEncoding | XMLEncoding;

export interface JSONEncoding {
  type: 'JSONEncoding';
}

export interface TextEncoding {
  type: 'TextEncoding';
  tokenSeparator: string;
  blockSeparator: string;
  decimalSeparator?: string;
  collapseWhiteSpaces?: boolean;
}

export interface BinaryEncoding {
  type: 'BinaryEncoding';
  byteOrder: 'bigEndian' | 'littleEndian';
  byteEncoding: 'base64' | 'raw';
  members: BinaryMember[];
}

export interface BinaryMember {
  ref: string;
  dataType: 'int8' | 'uint8' | 'int16' | 'uint16' | 'int32' | 'uint32' | 'int64' | 'uint64' | 'float32' | 'float64' | 'boolean' | 'string' | 'utf8';
  byteLength?: number;
}

export interface XMLEncoding {
  type: 'XMLEncoding';
}

// GeoJSON types (re-export from upstream or define)
export interface Geometry {
  type: string;
  coordinates?: unknown;
  geometries?: Geometry[];
}

export interface Point extends Geometry {
  type: 'Point';
  coordinates: Position;
}

export interface LineString extends Geometry {
  type: 'LineString';
  coordinates: Position[];
}

export interface Polygon extends Geometry {
  type: 'Polygon';
  coordinates: Position[][];
}

export interface MultiPoint extends Geometry {
  type: 'MultiPoint';
  coordinates: Position[];
}

export interface MultiLineString extends Geometry {
  type: 'MultiLineString';
  coordinates: Position[][];
}

export interface MultiPolygon extends Geometry {
  type: 'MultiPolygon';
  coordinates: Position[][][];
}

export interface GeometryCollection extends Geometry {
  type: 'GeometryCollection';
  geometries: Geometry[];
}

export type Position = [number, number] | [number, number, number];

export interface Feature {
  type: 'Feature';
  id?: string | number;
  geometry?: Geometry;
  properties?: Record<string, unknown>;
  bbox?: BoundingBox;
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
  bbox?: BoundingBox;
}

export type BoundingBox = [number, number, number, number];

// Error types
export class CSAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'CSAPIError';
  }
}

export class FormatParseError extends CSAPIError {
  constructor(
    message: string,
    public format: string,
    public path: string,
    cause?: Error
  ) {
    super(message, 'FORMAT_PARSE_ERROR', cause);
    this.name = 'FormatParseError';
  }
}

export class ValidationError extends CSAPIError {
  constructor(
    message: string,
    public path: string,
    public expected?: unknown,
    public actual?: unknown
  ) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class ServerError extends CSAPIError {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

export class NetworkError extends CSAPIError {
  constructor(message: string, cause?: Error) {
    super(message, 'NETWORK_ERROR', cause);
    this.name = 'NetworkError';
  }
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationWarning {
  path: string;
  message: string;
}

// Format detection types
export interface DetectionContext {
  resourceType?: 'system' | 'deployment' | 'procedure' | 'samplingfeature' | 'property' | 'datastream' | 'observation' | 'controlstream' | 'command';
  operation?: 'list' | 'get' | 'create' | 'update';
  expectedFormats?: string[];
}

export interface DetectedFormat {
  format: 'geojson' | 'sensorml' | 'swe-common' | 'json' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  mimeType?: string;
}
```

**Responsibilities:**
- Define all public interfaces
- Define all internal types
- Provide type safety across entire library
- Document expected shapes

**Estimated Lines:** ~800 lines

---

### 2.5 `src/csapi/url.ts`

**Purpose:** URL builder utilities for all CSAPI operations

**What We Build:**
```typescript
// Collection URLs
export function buildSystemsUrl(baseUrl: string, options?: QueryOptions): string
export function buildDeploymentsUrl(baseUrl: string, options?: QueryOptions): string
export function buildProceduresUrl(baseUrl: string, options?: QueryOptions): string
export function buildSamplingFeaturesUrl(baseUrl: string, options?: QueryOptions): string
export function buildPropertiesUrl(baseUrl: string, options?: QueryOptions): string
export function buildDataStreamsUrl(baseUrl: string, options?: QueryOptions): string
export function buildObservationsUrl(baseUrl: string, options?: QueryOptions): string
export function buildControlStreamsUrl(baseUrl: string, options?: QueryOptions): string
export function buildCommandsUrl(baseUrl: string, options?: QueryOptions): string

// Individual resource URLs
export function buildSystemUrl(baseUrl: string, id: string, options?: GetByIdOptions): string
export function buildDeploymentUrl(baseUrl: string, id: string, options?: GetByIdOptions): string
export function buildProcedureUrl(baseUrl: string, id: string, options?: GetByIdOptions): string
export function buildSamplingFeatureUrl(baseUrl: string, id: string, options?: GetByIdOptions): string
export function buildPropertyUrl(baseUrl: string, id: string, options?: GetByIdOptions): string
export function buildDataStreamUrl(baseUrl: string, id: string, options?: GetByIdOptions): string
export function buildObservationUrl(baseUrl: string, id: string, options?: GetByIdOptions): string
export function buildControlStreamUrl(baseUrl: string, id: string, options?: GetByIdOptions): string
export function buildCommandUrl(baseUrl: string, id: string, options?: GetByIdOptions): string

// Nested resource URLs
export function buildSystemDataStreamsUrl(baseUrl: string, systemId: string, options?: QueryOptions): string
export function buildDataStreamObservationsUrl(baseUrl: string, datastreamId: string, options?: QueryOptions): string
export function buildSystemControlStreamsUrl(baseUrl: string, systemId: string, options?: QueryOptions): string
export function buildControlStreamCommandsUrl(baseUrl: string, controlStreamId: string, options?: QueryOptions): string

// Create/update URLs
export function buildCreateSystemUrl(baseUrl: string): string
export function buildCreateDeploymentUrl(baseUrl: string): string
export function buildCreateProcedureUrl(baseUrl: string): string
export function buildCreateSamplingFeatureUrl(baseUrl: string): string
export function buildCreateDataStreamUrl(baseUrl: string): string
export function buildCreateObservationsUrl(baseUrl: string): string
export function buildCreateControlStreamUrl(baseUrl: string): string
export function buildCreateCommandsUrl(baseUrl: string): string

// Helper functions
function appendQueryParams(url: URL, options: QueryOptions): void
function encodeBbox(bbox: BoundingBox): string
function encodePropertiesArray(properties: string[]): string
```

**Responsibilities:**
- Build all CSAPI URLs
- Handle query parameter encoding
- Support all filtering options (bbox, datetime, limit, offset, filter, properties, sortby)
- Validate URL parameters

**Estimated Lines:** ~400 lines

---

## 3. Format Parser Modules

### 3.1 `src/csapi/formats/geojson.ts`

**Purpose:** Parse and validate GeoJSON formats

**What We Build:**
```typescript
// Parser interface
export interface GeoJSONParser {
  parseFeature(data: unknown): Feature;
  parseFeatureCollection(data: unknown): FeatureCollection;
  parseGeometry(data: unknown): Geometry;
  validate(data: unknown): ValidationResult;
}

// Main parser functions
export function parseFeature(data: unknown): Feature
export function parseFeatureCollection(data: unknown): FeatureCollection
export function parseGeometry(data: unknown): Geometry

// Geometry-specific parsers
function parsePoint(data: unknown): Point
function parseLineString(data: unknown): LineString
function parsePolygon(data: unknown): Polygon
function parseMultiPoint(data: unknown): MultiPoint
function parseMultiLineString(data: unknown): MultiLineString
function parseMultiPolygon(data: unknown): MultiPolygon
function parseGeometryCollection(data: unknown): GeometryCollection

// Validation functions
export function validateFeature(feature: Feature): ValidationResult
export function validateFeatureCollection(fc: FeatureCollection): ValidationResult
export function validateGeometry(geometry: Geometry): ValidationResult

// Type guards
function isFeature(data: unknown): data is Feature
function isFeatureCollection(data: unknown): data is FeatureCollection
function isGeometry(data: unknown): data is Geometry
function isPoint(data: unknown): data is Point
function isLineString(data: unknown): data is LineString
function isPolygon(data: unknown): data is Polygon

// Utilities
function validateCoordinates(coords: unknown, type: string): void
function calculateBbox(geometry: Geometry): BoundingBox
```

**Responsibilities:**
- Parse all GeoJSON geometry types
- Parse Feature and FeatureCollection objects
- Validate GeoJSON structure
- Handle CRS (coordinate reference systems)
- Calculate bounding boxes

**Estimated Lines:** ~500 lines

---

### 3.2 `src/csapi/formats/sensorml.ts`

**Purpose:** Parse and validate SensorML 2.0+ formats

**What We Build:**
```typescript
// Parser interface
export interface SensorMLParser {
  parse(data: unknown): SensorMLProcess;
  validate(data: unknown): ValidationResult;
}

// Main parser functions
export function parseSensorML(data: unknown): SensorMLProcess

// Process-type parsers
function parseSimpleProcess(data: unknown): SimpleProcess
function parsePhysicalSystem(data: unknown): PhysicalSystem
function parsePhysicalComponent(data: unknown): PhysicalComponent
function parseAggregateProcess(data: unknown): AggregateProcess
function parseProcessChain(data: unknown): ProcessChain

// Element parsers
function parseIdentification(data: unknown): Identifier[]
function parseClassification(data: unknown): Classifier[]
function parseCharacteristics(data: unknown): Characteristic[]
function parseCapabilities(data: unknown): Capability[]
function parseContacts(data: unknown): Contact[]
function parseDocumentation(data: unknown): Document[]
function parseHistory(data: unknown): Event[]
function parsePosition(data: unknown): Position
function parseComponents(data: unknown): SensorMLProcess[]
function parseConnections(data: unknown): Connection[]

// Validation functions
export function validateSensorML(process: SensorMLProcess): ValidationResult
function validateIdentifier(id: Identifier): ValidationResult
function validateCapability(cap: Capability): ValidationResult
function validatePosition(pos: Position): ValidationResult

// Type guards
function isSensorMLProcess(data: unknown): data is SensorMLProcess
function isPhysicalSystem(data: unknown): data is PhysicalSystem
function isPhysicalComponent(data: unknown): data is PhysicalComponent

// Utilities
function extractValue(data: unknown): unknown
function parseUnitOfMeasure(data: unknown): UnitOfMeasure
function parseAllowedValues(data: unknown): AllowedValues
```

**Responsibilities:**
- Parse all SensorML process types (SimpleProcess, PhysicalSystem, PhysicalComponent, AggregateProcess, ProcessChain)
- Parse nested system components recursively
- Extract identification, classification, characteristics, capabilities
- Parse position and orientation
- Handle SensorML 2.0 and 2.1 versions
- Validate SensorML structure

**Estimated Lines:** ~1,500 lines

---

### 3.3 `src/csapi/formats/swe-common.ts`

**Purpose:** Parse and validate SWE Common 2.0 formats

**What We Build:**
```typescript
// Parser interface
export interface SWECommonParser {
  parseComponent(data: unknown): SWEComponent;
  parseEncoding(data: unknown): SWEEncoding;
  parseValue(value: unknown, component: SWEComponent): unknown;
  validate(data: unknown, schema?: SWEComponent): ValidationResult;
}

// Main parser functions
export function parseComponent(data: unknown): SWEComponent
export function parseEncoding(data: unknown): SWEEncoding
export function parseValue(value: unknown, component: SWEComponent): unknown

// Component parsers
function parseQuantity(data: unknown): Quantity
function parseCount(data: unknown): Count
function parseBoolean(data: unknown): Boolean
function parseText(data: unknown): Text
function parseCategory(data: unknown): Category
function parseTime(data: unknown): Time
function parseDataRecord(data: unknown): DataRecord
function parseVector(data: unknown): Vector
function parseDataArray(data: unknown): DataArray
function parseDataChoice(data: unknown): DataChoice
function parseMatrix(data: unknown): Matrix

// Encoding parsers
function parseJSONEncoding(data: unknown): JSONEncoding
function parseTextEncoding(data: unknown): TextEncoding
function parseBinaryEncoding(data: unknown): BinaryEncoding
function parseXMLEncoding(data: unknown): XMLEncoding

// Value parsers (according to encoding)
function parseJSONValue(value: unknown, component: SWEComponent): unknown
function parseTextValue(value: string, component: SWEComponent, encoding: TextEncoding): unknown
function parseBinaryValue(value: string | ArrayBuffer, component: SWEComponent, encoding: BinaryEncoding): unknown

// Validation functions
export function validateComponent(component: SWEComponent): ValidationResult
export function validateValue(value: unknown, component: SWEComponent): ValidationResult
function validateQuantity(value: unknown, quantity: Quantity): boolean
function validateCount(value: unknown, count: Count): boolean
function validateDataRecord(value: unknown, record: DataRecord): ValidationResult

// Type guards
function isSWEComponent(data: unknown): data is SWEComponent
function isQuantity(data: unknown): data is Quantity
function isDataRecord(data: unknown): data is DataRecord
function isDataArray(data: unknown): data is DataArray

// Utilities
function parseUnitOfMeasure(data: unknown): UnitOfMeasure
function parseAllowedValues(data: unknown): AllowedValues
function parseAllowedTokens(data: unknown): AllowedTokens
function checkConstraints(value: unknown, constraint: AllowedValues | AllowedTokens): boolean
function parseTextLine(line: string, encoding: TextEncoding): string[]
function parseBinaryMember(buffer: ArrayBuffer, offset: number, member: BinaryMember, byteOrder: string): { value: unknown; bytesRead: number }
```

**Responsibilities:**
- Parse all SWE Common component types (Quantity, Count, Boolean, Text, Category, Time, DataRecord, Vector, DataArray, DataChoice, Matrix)
- Parse all encoding types (JSON, Text, Binary, XML)
- Parse observation results according to schema
- Validate values against component constraints
- Handle recursive component structures (DataRecord fields, DataArray elements)
- Support multiple encodings (JSON is native, Text uses separators, Binary uses byte definitions)

**Estimated Lines:** ~2,000 lines

---

### 3.4 `src/csapi/formats/detector.ts`

**Purpose:** Detect format of CSAPI responses

**What We Build:**
```typescript
// Main detection function
export function detectFormat(
  contentType: string | undefined,
  body: unknown,
  context: DetectionContext
): DetectedFormat

// Detection strategy functions
function detectFromContentType(contentType: string): DetectedFormat | null
function detectFromStructure(body: unknown): DetectedFormat | null
function detectFromContext(body: unknown, context: DetectionContext): DetectedFormat | null
function detectFromHeuristics(body: unknown): DetectedFormat | null

// Type detection helpers
function isGeoJSON(body: unknown): boolean
function isSensorML(body: unknown): boolean
function isSWECommon(body: unknown): boolean

// Utilities
function normalizeContentType(contentType: string): string
function calculateConfidence(detections: DetectedFormat[]): 'high' | 'medium' | 'low'
```

**Responsibilities:**
- Detect format from Content-Type header (most reliable)
- Detect format from response structure (JSON keys, type fields)
- Use context to infer format (resource type + operation)
- Apply heuristics when other methods fail
- Return confidence level with detection

**Estimated Lines:** ~300 lines

---

### 3.5 `src/csapi/formats/validator.ts`

**Purpose:** Validate CSAPI formats and data

**What We Build:**
```typescript
// Main validation functions
export function validate(data: unknown, schema: ValidationSchema): ValidationResult
export function validateSystemFeature(system: SystemFeature): ValidationResult
export function validateDeploymentFeature(deployment: DeploymentFeature): ValidationResult
export function validateDataStream(datastream: DataStream): ValidationResult
export function validateObservation(observation: Observation, schema?: SWEComponent): ValidationResult

// Validation level functions
function validateStructure(data: unknown, schema: ValidationSchema): ValidationError[]
function validateTypes(data: unknown, schema: ValidationSchema): ValidationError[]
function validateRequired(data: unknown, schema: ValidationSchema): ValidationError[]
function validateConstraints(data: unknown, schema: ValidationSchema): ValidationError[]
function validateSemantics(data: unknown, schema: ValidationSchema): ValidationError[]

// Resource-specific validators
function validateSystemProperties(properties: SystemProperties): ValidationError[]
function validateTemporalExtent(extent: TemporalExtent): ValidationError[]
function validateGeometryConsistency(feature: Feature): ValidationError[]

// Utilities
function createError(path: string, message: string, expected?: unknown, actual?: unknown): ValidationError
function createWarning(path: string, message: string): ValidationWarning
function getValueAtPath(obj: unknown, path: string): unknown
```

**Responsibilities:**
- Validate structural correctness (JSON matches expected shape)
- Validate type correctness (strings are strings, numbers are numbers)
- Validate required fields are present
- Validate constraints (ranges, allowed values, patterns)
- Validate semantic relationships (bbox matches geometry, temporal extent is valid)
- Provide detailed error messages with paths
- Support strict and lenient modes

**Estimated Lines:** ~600 lines

---

## 4. Resource Modules

### Pattern for All Resource Modules

Each resource module follows the same structure:

```typescript
// Collection operations
export async function getResources(
  endpoint: CSAPIEndpoint,
  options: QueryOptions
): Promise<ResourceCollection>

// Individual operations
export async function getResourceById(
  endpoint: CSAPIEndpoint,
  id: string,
  options: GetByIdOptions
): Promise<Resource>

// Create operations
export async function createResource(
  endpoint: CSAPIEndpoint,
  resource: ResourceInput
): Promise<string>

// Update operations
export async function updateResource(
  endpoint: CSAPIEndpoint,
  id: string,
  resource: ResourceInput
): Promise<void>

// Delete operations
export async function deleteResource(
  endpoint: CSAPIEndpoint,
  id: string
): Promise<void>

// Helper functions
function parseResourceResponse(data: unknown, contentType: string): Resource
function validateResourceInput(input: ResourceInput): void
```

### 4.1 `src/csapi/resources/systems.ts`

**What We Build:**
```typescript
export async function getSystems(endpoint: CSAPIEndpoint, options?: QueryOptions): Promise<SystemCollection>
export async function getSystemById(endpoint: CSAPIEndpoint, id: string, options?: GetByIdOptions): Promise<SystemFeature>
export async function createSystem(endpoint: CSAPIEndpoint, system: SystemInput): Promise<string>
export async function updateSystem(endpoint: CSAPIEndpoint, id: string, system: SystemInput): Promise<void>
export async function deleteSystem(endpoint: CSAPIEndpoint, id: string): Promise<void>

// Helpers
function parseSystemResponse(data: unknown, contentType: string): SystemFeature | SystemCollection
function convertSensorMLToSystem(sensorml: SensorMLProcess): SystemFeature
```

**Estimated Lines:** ~150 lines

---

### 4.2 `src/csapi/resources/deployments.ts`

**What We Build:**
```typescript
export async function getDeployments(endpoint: CSAPIEndpoint, options?: QueryOptions): Promise<DeploymentCollection>
export async function getDeploymentById(endpoint: CSAPIEndpoint, id: string, options?: GetByIdOptions): Promise<DeploymentFeature>
export async function createDeployment(endpoint: CSAPIEndpoint, deployment: DeploymentInput): Promise<string>
export async function updateDeployment(endpoint: CSAPIEndpoint, id: string, deployment: DeploymentInput): Promise<void>
export async function deleteDeployment(endpoint: CSAPIEndpoint, id: string): Promise<void>

// Helpers
function parseDeploymentResponse(data: unknown, contentType: string): DeploymentFeature | DeploymentCollection
```

**Estimated Lines:** ~150 lines

---

### 4.3 `src/csapi/resources/procedures.ts`

**What We Build:**
```typescript
export async function getProcedures(endpoint: CSAPIEndpoint, options?: QueryOptions): Promise<ProcedureCollection>
export async function getProcedureById(endpoint: CSAPIEndpoint, id: string, options?: GetByIdOptions): Promise<Procedure>
export async function createProcedure(endpoint: CSAPIEndpoint, procedure: ProcedureInput): Promise<string>
export async function updateProcedure(endpoint: CSAPIEndpoint, id: string, procedure: ProcedureInput): Promise<void>
export async function deleteProcedure(endpoint: CSAPIEndpoint, id: string): Promise<void>

// Helpers
function parseProcedureResponse(data: unknown, contentType: string): Procedure | ProcedureCollection
function convertSensorMLToProcedure(sensorml: SensorMLProcess): Procedure
```

**Estimated Lines:** ~100 lines

---

### 4.4 `src/csapi/resources/sampling-features.ts`

**What We Build:**
```typescript
export async function getSamplingFeatures(endpoint: CSAPIEndpoint, options?: QueryOptions): Promise<SamplingFeatureCollection>
export async function getSamplingFeatureById(endpoint: CSAPIEndpoint, id: string, options?: GetByIdOptions): Promise<SamplingFeatureFeature>
export async function createSamplingFeature(endpoint: CSAPIEndpoint, feature: SamplingFeatureInput): Promise<string>
export async function updateSamplingFeature(endpoint: CSAPIEndpoint, id: string, feature: SamplingFeatureInput): Promise<void>
export async function deleteSamplingFeature(endpoint: CSAPIEndpoint, id: string): Promise<void>

// Helpers
function parseSamplingFeatureResponse(data: unknown, contentType: string): SamplingFeatureFeature | SamplingFeatureCollection
```

**Estimated Lines:** ~100 lines

---

### 4.5 `src/csapi/resources/properties.ts`

**What We Build:**
```typescript
export async function getProperties(endpoint: CSAPIEndpoint, options?: QueryOptions): Promise<PropertyCollection>
export async function getPropertyById(endpoint: CSAPIEndpoint, id: string, options?: GetByIdOptions): Promise<Property>

// Helpers
function parsePropertyResponse(data: unknown, contentType: string): Property | PropertyCollection
```

**Estimated Lines:** ~80 lines

---

### 4.6 `src/csapi/resources/datastreams.ts`

**What We Build:**
```typescript
export async function getDataStreams(endpoint: CSAPIEndpoint, options?: QueryOptions): Promise<DataStreamCollection>
export async function getDataStreamById(endpoint: CSAPIEndpoint, id: string, options?: GetByIdOptions): Promise<DataStream>
export async function getSystemDataStreams(endpoint: CSAPIEndpoint, systemId: string, options?: QueryOptions): Promise<DataStreamCollection>
export async function createDataStream(endpoint: CSAPIEndpoint, datastream: DataStreamInput): Promise<string>
export async function updateDataStream(endpoint: CSAPIEndpoint, id: string, datastream: DataStreamInput): Promise<void>
export async function deleteDataStream(endpoint: CSAPIEndpoint, id: string): Promise<void>

// Helpers
function parseDataStreamResponse(data: unknown, contentType: string): DataStream | DataStreamCollection
function parseDataStreamSchema(schema: unknown): SWEComponent
function parseDataStreamEncoding(encoding: unknown): SWEEncoding
```

**Estimated Lines:** ~200 lines

---

### 4.7 `src/csapi/resources/observations.ts`

**What We Build:**
```typescript
export async function getObservations(endpoint: CSAPIEndpoint, options?: QueryOptions): Promise<ObservationCollection>
export async function getObservationById(endpoint: CSAPIEndpoint, id: string, options?: GetByIdOptions): Promise<Observation>
export async function getDataStreamObservations(endpoint: CSAPIEndpoint, datastreamId: string, options?: QueryOptions): Promise<ObservationCollection>
export async function createObservations(endpoint: CSAPIEndpoint, observations: ObservationInput[]): Promise<string[]>

// Helpers
function parseObservationResponse(data: unknown, contentType: string, schema?: SWEComponent): Observation | ObservationCollection
function parseObservationResult(result: unknown, schema: SWEComponent, encoding?: SWEEncoding): unknown
function parseBulkObservations(data: unknown, schema: SWEComponent): ObservationInput[]
```

**Estimated Lines:** ~250 lines

---

### 4.8 `src/csapi/resources/control-streams.ts`

**What We Build:**
```typescript
export async function getControlStreams(endpoint: CSAPIEndpoint, options?: QueryOptions): Promise<ControlStreamCollection>
export async function getControlStreamById(endpoint: CSAPIEndpoint, id: string, options?: GetByIdOptions): Promise<ControlStream>
export async function getSystemControlStreams(endpoint: CSAPIEndpoint, systemId: string, options?: QueryOptions): Promise<ControlStreamCollection>
export async function createControlStream(endpoint: CSAPIEndpoint, stream: ControlStreamInput): Promise<string>
export async function updateControlStream(endpoint: CSAPIEndpoint, id: string, stream: ControlStreamInput): Promise<void>
export async function deleteControlStream(endpoint: CSAPIEndpoint, id: string): Promise<void>

// Helpers
function parseControlStreamResponse(data: unknown, contentType: string): ControlStream | ControlStreamCollection
function parseControlStreamSchema(schema: unknown): SWEComponent
```

**Estimated Lines:** ~150 lines

---

### 4.9 `src/csapi/resources/commands.ts`

**What We Build:**
```typescript
export async function getCommands(endpoint: CSAPIEndpoint, options?: QueryOptions): Promise<CommandCollection>
export async function getCommandById(endpoint: CSAPIEndpoint, id: string, options?: GetByIdOptions): Promise<Command>
export async function getControlStreamCommands(endpoint: CSAPIEndpoint, controlStreamId: string, options?: QueryOptions): Promise<CommandCollection>
export async function createCommands(endpoint: CSAPIEndpoint, commands: CommandInput[]): Promise<string[]>

// Helpers
function parseCommandResponse(data: unknown, contentType: string, schema?: SWEComponent): Command | CommandCollection
function parseCommandParameters(parameters: unknown, schema: SWEComponent): unknown
function parseBulkCommands(data: unknown): CommandInput[]
```

**Estimated Lines:** ~200 lines

---

## 5. Worker Modules

### 5.1 `src/worker/worker.ts`

**Purpose:** Register CSAPI handlers in web worker

**What We Build:**
```typescript
// Import CSAPI modules
import * as conformance from '../csapi/conformance.js';
import * as collections from '../csapi/collections.js';
import * as geojson from '../csapi/formats/geojson.js';
import * as sensorml from '../csapi/formats/sensorml.js';
import * as sweCommon from '../csapi/formats/swe-common.js';
import { addTaskHandler } from './utils.js';

// Register CSAPI task handlers
addTaskHandler('parseConformance', globalThis, ({ url }: { url: string }) =>
  conformance.parseConformance(url)
);

addTaskHandler('parseCollections', globalThis, ({ url }: { url: string }) =>
  collections.parseCollections(url)
);

addTaskHandler('parseGeoJSON', globalThis, ({ data }: { data: unknown }) =>
  geojson.parseFeatureCollection(data)
);

addTaskHandler('parseSensorML', globalThis, ({ data }: { data: unknown }) =>
  sensorml.parseSensorML(data)
);

addTaskHandler('parseSWEComponent', globalThis, ({ data }: { data: unknown }) =>
  sweCommon.parseComponent(data)
);

addTaskHandler('parseSWEValue', globalThis, ({ value, component }: { value: unknown; component: SWEComponent }) =>
  sweCommon.parseValue(value, component)
);

addTaskHandler('parseObservations', globalThis, ({ data, schema }: { data: unknown; schema: SWEComponent }) =>
  // Parse array of observations according to schema
  Array.isArray(data) ? data.map(obs => sweCommon.parseValue(obs.result, schema)) : []
);

addTaskHandler('validateSensorML', globalThis, ({ data }: { data: unknown }) =>
  sensorml.validate(data)
);

addTaskHandler('validateSWEComponent', globalThis, ({ data, schema }: { data: unknown; schema?: SWEComponent }) =>
  sweCommon.validate(data, schema)
);
```

**Responsibilities:**
- Register all CSAPI parsing tasks
- Make parsers available to worker API
- Handle task parameters and return values

**Estimated Lines:** ~200 lines (including existing handlers)

---

### 5.2 `src/worker/index.ts`

**Purpose:** Public worker API for CSAPI operations

**What We Build:**
```typescript
// Import worker utilities
import { sendMessageToWorker } from './utils.js';

// CSAPI worker API
export function parseConformance(url: string): Promise<string[]> {
  return sendMessageToWorker('parseConformance', { url });
}

export function parseCollections(url: string): Promise<CSAPICollection[]> {
  return sendMessageToWorker('parseCollections', { url });
}

export function parseGeoJSON(data: unknown): Promise<FeatureCollection> {
  return sendMessageToWorker('parseGeoJSON', { data });
}

export function parseSensorML(data: unknown): Promise<SensorMLProcess> {
  return sendMessageToWorker('parseSensorML', { data });
}

export function parseSWEComponent(data: unknown): Promise<SWEComponent> {
  return sendMessageToWorker('parseSWEComponent', { data });
}

export function parseSWEValue(value: unknown, component: SWEComponent): Promise<unknown> {
  return sendMessageToWorker('parseSWEValue', { value, component });
}

export function parseObservations(data: unknown, schema: SWEComponent): Promise<unknown[]> {
  return sendMessageToWorker('parseObservations', { data, schema });
}

export function validateSensorML(data: unknown): Promise<ValidationResult> {
  return sendMessageToWorker('validateSensorML', { data });
}

export function validateSWEComponent(data: unknown, schema?: SWEComponent): Promise<ValidationResult> {
  return sendMessageToWorker('validateSWEComponent', { data, schema });
}
```

**Responsibilities:**
- Provide clean API for worker operations
- Handle message passing to worker
- Automatic fallback when workers not available

**Estimated Lines:** ~200 lines (including existing exports)

---

### 5.3 `src/worker-fallback/` (existing)

**Purpose:** Fallback implementations when workers unavailable

**What We Build:**
- Synchronous versions of all CSAPI parsing functions
- Imported automatically when `enableFallbackWithoutWorker()` called
- Same API as worker version, but runs synchronously

**Note:** This is handled by existing infrastructure; CSAPI parsers just need to be importable synchronously

---

## 6. Type Definitions

### 6.1 `src/index.ts` (update)

**Purpose:** Export CSAPI types and classes

**What We Build:**
```typescript
// Existing exports...

// CSAPI exports
export { default as CSAPIEndpoint } from './csapi/endpoint.js';
export type {
  // Configuration
  CSAPIEndpointOptions,
  ValidationMode,
  
  // Service metadata
  CSAPIEndpointInfo,
  CSAPICollection,
  
  // Query options
  QueryOptions,
  GetByIdOptions,
  
  // Part 1 resources
  SystemFeature,
  SystemCollection,
  SystemInput,
  DeploymentFeature,
  DeploymentCollection,
  DeploymentInput,
  Procedure,
  ProcedureCollection,
  ProcedureInput,
  SamplingFeatureFeature,
  SamplingFeatureCollection,
  SamplingFeatureInput,
  Property,
  PropertyCollection,
  
  // Part 2 resources
  DataStream,
  DataStreamCollection,
  DataStreamInput,
  Observation,
  ObservationCollection,
  ObservationInput,
  ControlStream,
  ControlStreamCollection,
  ControlStreamInput,
  Command,
  CommandCollection,
  CommandInput,
  
  // SWE Common types
  SWEComponent,
  Quantity,
  Count,
  Boolean,
  Text,
  Category,
  Time,
  DataRecord,
  Vector,
  DataArray,
  DataChoice,
  Matrix,
  SWEEncoding,
  
  // Error types
  CSAPIError,
  FormatParseError,
  ValidationError as CSAPIValidationError,
  ServerError,
  NetworkError,
} from './csapi/model.js';
```

**Estimated Lines:** ~50 lines (additions)

---

### 6.2 `src-node/index.ts` (update)

**Purpose:** Export CSAPI for Node.js environments

**What We Build:**
```typescript
// Existing exports...

// CSAPI exports
export { default as CSAPIEndpoint } from '../src/csapi/endpoint.js';
export type * from '../src/csapi/model.js';
```

**Estimated Lines:** ~10 lines (additions)

---

## 7. Utility Modules

### 7.1 `src/shared/http-utils.ts` (existing, may need updates)

**Purpose:** HTTP utilities used by CSAPI

**What We Use:**
- `queryJsonDocument(url)` - Fetch and parse JSON
- `fetchWithOptions(url, options)` - Fetch with auth/headers
- Error handling utilities

**What We May Add:**
```typescript
export async function parseOGCException(response: Response): Promise<OGCException | null>
export async function handleCSAPIResponse<T>(response: Response, parser: (data: unknown) => T): Promise<T>
```

**Estimated Lines:** ~50 lines (additions)

---

### 7.2 `src/shared/cache.ts` (existing)

**Purpose:** Caching utilities

**What We Use:**
- `useCache(fn, category, key, url)` - Cache function results
- `clearCacheForPrefix(category, prefix)` - Clear cache by prefix

**No additions needed** - existing cache infrastructure sufficient

---

### 7.3 `src/shared/errors.ts` (new or update existing)

**Purpose:** Common error utilities

**What We Build:**
```typescript
export function isNetworkError(error: unknown): error is Error
export function wrapError(error: unknown, context: string): Error
export function formatErrorMessage(error: unknown): string
```

**Estimated Lines:** ~50 lines

---

## 8. Test Modules

### 8.1 Unit Tests

**Files We Build:**
```
src/csapi/endpoint.spec.ts             # CSAPIEndpoint class tests
src/csapi/conformance.spec.ts          # Conformance parsing tests
src/csapi/collections.spec.ts          # Collections parsing tests
src/csapi/url.spec.ts                  # URL building tests

src/csapi/formats/geojson.spec.ts      # GeoJSON parser tests
src/csapi/formats/sensorml.spec.ts     # SensorML parser tests
src/csapi/formats/swe-common.spec.ts   # SWE Common parser tests
src/csapi/formats/detector.spec.ts     # Format detection tests
src/csapi/formats/validator.spec.ts    # Validation tests

src/csapi/resources/systems.spec.ts           # System operations tests
src/csapi/resources/deployments.spec.ts       # Deployment operations tests
src/csapi/resources/procedures.spec.ts        # Procedure operations tests
src/csapi/resources/sampling-features.spec.ts # Sampling Feature operations tests
src/csapi/resources/properties.spec.ts        # Property operations tests
src/csapi/resources/datastreams.spec.ts       # DataStream operations tests
src/csapi/resources/observations.spec.ts      # Observation operations tests
src/csapi/resources/control-streams.spec.ts   # Control Stream operations tests
src/csapi/resources/commands.spec.ts          # Command operations tests
```

**Estimated Lines:** ~1,000 lines (total across all test files)

---

### 8.2 Integration Tests

**Files We Build:**
```
src/csapi/integration.spec.ts          # End-to-end workflow tests
src/csapi/performance.spec.ts          # Performance benchmarks
```

**What We Test:**
- Complete workflows (discover systems → get datastreams → fetch observations)
- Real server integration (52°North demo server)
- Performance targets (10K observations < 5s)
- Worker mode vs sync mode performance

**Estimated Lines:** ~200 lines

---

### 8.3 Test Fixtures

**Directory Structure:**
```
fixtures/csapi/
├── conformance.json
├── collections.json
├── landing-page.json
├── systems/
│   ├── collection.json
│   ├── physical-system.json
│   ├── physical-component.json
│   └── aggregate-process.json
├── deployments/
│   └── collection.json
├── procedures/
│   └── collection.json
├── sampling-features/
│   └── collection.json
├── properties/
│   └── collection.json
├── datastreams/
│   ├── datastream-quantity.json
│   ├── datastream-datarecord.json
│   └── datastream-dataarray.json
├── observations/
│   ├── obs-json-encoding.json
│   ├── obs-text-encoding.txt
│   ├── obs-binary-encoding.b64
│   └── obs-bulk-10k.json
├── control-streams/
│   └── collection.json
├── commands/
│   └── collection.json
└── errors/
    ├── ogc-exception.json
    └── malformed-geojson.json
```

**How We Get Fixtures:**
1. Download from 52°North demo server
2. Use examples from CSAPI specification
3. Create edge cases manually

**Estimated Files:** ~30-40 fixture files

---

## 9. Build Output

### 9.1 Distribution Files

**What Gets Built:**
```
dist/
├── index.js                    # Browser entry point (ESM)
├── index.d.ts                  # TypeScript definitions
├── csapi/
│   ├── endpoint.js
│   ├── endpoint.d.ts
│   ├── model.d.ts
│   ├── formats/
│   │   ├── geojson.js
│   │   ├── sensorml.js
│   │   ├── swe-common.js
│   │   └── ...
│   └── resources/
│       ├── systems.js
│       ├── datastreams.js
│       └── ...
├── worker/
│   ├── worker.js              # Worker script
│   └── index.js               # Worker API
└── ...

dist-node/
├── index.js                    # Node.js entry point (CJS)
├── index.d.ts
└── ...
```

**Bundle Sizes (Estimated):**
- Core CSAPI (endpoint + HTTP + caching): ~20 KB gzipped
- GeoJSON parser: ~10 KB gzipped
- SensorML parser: ~30 KB gzipped
- SWE Common parser: ~40 KB gzipped
- Resource modules: ~30 KB gzipped
- Worker support: ~10 KB gzipped
- **Total (all formats):** ~140 KB gzipped

**Tree-Shaking:**
- Users can import only what they need
- Example: Import only endpoint + GeoJSON = ~30 KB gzipped

---

### 9.2 Published Package

**npm Package:**
```
@camptocamp/ogc-client@<version>
├── dist/                      # Browser build
├── dist-node/                 # Node.js build
├── src/                       # Source code (for source maps)
├── package.json
├── README.md
└── LICENSE
```

**package.json exports:**
```json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist-node/index.js",
      "types": "./dist/index.d.ts"
    },
    "./csapi": {
      "import": "./dist/csapi/endpoint.js",
      "types": "./dist/csapi/endpoint.d.ts"
    },
    "./worker": {
      "import": "./dist/worker/index.js",
      "types": "./dist/worker/index.d.ts"
    }
  }
}
```

---

## Component Summary

### By Category

| Category | Files | Lines of Code | Description |
|----------|-------|---------------|-------------|
| **Core Modules** | 5 | ~1,900 | Main endpoint class, metadata parsing, types, URL builders |
| **Format Parsers** | 5 | ~4,900 | GeoJSON, SensorML, SWE Common parsers, detection, validation |
| **Resource Modules** | 9 | ~1,380 | CRUD operations for all 9 resource types |
| **Worker Support** | 2 | ~400 | Worker handlers and API |
| **Utilities** | 3 | ~150 | HTTP helpers, error utilities |
| **Tests** | 18 | ~1,200 | Unit tests, integration tests, performance tests |
| **Fixtures** | ~40 | N/A | Test data from real servers and spec examples |
| **Build Output** | N/A | N/A | Compiled JavaScript + TypeScript definitions |
| **Total** | **42** | **~9,930** | Complete CSAPI client implementation |

---

### By Implementation Phase

| Phase | Files | Lines | Description |
|-------|-------|-------|-------------|
| **Week 1: Core** | 5 | ~1,000 | Endpoint, conformance, collections, cache, GeoJSON |
| **Week 2: SensorML** | 1 | ~1,500 | Complete SensorML parser |
| **Week 3: SWE Core** | 1 | ~1,200 | Basic SWE Common components |
| **Week 4: SWE Complete** | 2 | ~1,400 | Encodings, validation, detection |
| **Week 5: Part 1** | 5 | ~580 | Systems, Deployments, Procedures, Sampling Features, Properties |
| **Week 6-7: Part 2** | 4 | ~600 | DataStreams, Observations, Control Streams, Commands |
| **Week 8: Advanced** | 2 | ~400 | Worker support, advanced features |
| **Week 9: Tests** | 18 | ~1,200 | Comprehensive test coverage |
| **Week 10: Polish** | N/A | N/A | Documentation, PR preparation |

---

## File Dependency Map

```
CSAPIEndpoint (endpoint.ts)
├── Conformance Parser (conformance.ts)
├── Collections Parser (collections.ts)
├── Type Definitions (model.ts)
├── URL Builders (url.ts)
├── Format Parsers
│   ├── GeoJSON Parser (formats/geojson.ts)
│   ├── SensorML Parser (formats/sensorml.ts)
│   ├── SWE Common Parser (formats/swe-common.ts)
│   ├── Format Detector (formats/detector.ts)
│   └── Validator (formats/validator.ts)
└── Resource Operations
    ├── Systems (resources/systems.ts)
    │   └── Uses: GeoJSON, SensorML, URL builders
    ├── Deployments (resources/deployments.ts)
    │   └── Uses: GeoJSON, URL builders
    ├── Procedures (resources/procedures.ts)
    │   └── Uses: SensorML, URL builders
    ├── Sampling Features (resources/sampling-features.ts)
    │   └── Uses: GeoJSON, URL builders
    ├── Properties (resources/properties.ts)
    │   └── Uses: URL builders
    ├── DataStreams (resources/datastreams.ts)
    │   └── Uses: SWE Common, URL builders
    ├── Observations (resources/observations.ts)
    │   └── Uses: SWE Common, URL builders
    ├── Control Streams (resources/control-streams.ts)
    │   └── Uses: SWE Common, URL builders
    └── Commands (resources/commands.ts)
        └── Uses: SWE Common, URL builders

Worker Support
├── Worker Handlers (worker/worker.ts)
│   └── Imports: All parsers, validators
└── Worker API (worker/index.ts)
    └── Uses: Worker message passing

Test Files
├── Unit Tests (*.spec.ts for each module)
│   └── Uses: Fixtures, mocks
└── Integration Tests (integration.spec.ts, performance.spec.ts)
    └── Uses: Real server or mock server
```

---

## Implementation Checklist

### Core Infrastructure
- [ ] `src/csapi/endpoint.ts` - CSAPIEndpoint class skeleton
- [ ] `src/csapi/conformance.ts` - Parse /conformance endpoint
- [ ] `src/csapi/collections.ts` - Parse /collections endpoint
- [ ] `src/csapi/model.ts` - All TypeScript type definitions
- [ ] `src/csapi/url.ts` - URL builders for all operations

### Format Parsers
- [ ] `src/csapi/formats/geojson.ts` - GeoJSON parser (all geometry types)
- [ ] `src/csapi/formats/sensorml.ts` - SensorML parser (all process types)
- [ ] `src/csapi/formats/swe-common.ts` - SWE Common parser (all components, all encodings)
- [ ] `src/csapi/formats/detector.ts` - Format detection logic
- [ ] `src/csapi/formats/validator.ts` - Format validation logic

### Resource Modules (Part 1)
- [ ] `src/csapi/resources/systems.ts` - System operations
- [ ] `src/csapi/resources/deployments.ts` - Deployment operations
- [ ] `src/csapi/resources/procedures.ts` - Procedure operations
- [ ] `src/csapi/resources/sampling-features.ts` - Sampling Feature operations
- [ ] `src/csapi/resources/properties.ts` - Property operations

### Resource Modules (Part 2)
- [ ] `src/csapi/resources/datastreams.ts` - DataStream operations
- [ ] `src/csapi/resources/observations.ts` - Observation operations
- [ ] `src/csapi/resources/control-streams.ts` - Control Stream operations
- [ ] `src/csapi/resources/commands.ts` - Command operations

### Worker Support
- [ ] `src/worker/worker.ts` - Register CSAPI handlers
- [ ] `src/worker/index.ts` - Public worker API for CSAPI

### Tests (Unit)
- [ ] `src/csapi/endpoint.spec.ts`
- [ ] `src/csapi/conformance.spec.ts`
- [ ] `src/csapi/collections.spec.ts`
- [ ] `src/csapi/url.spec.ts`
- [ ] `src/csapi/formats/geojson.spec.ts`
- [ ] `src/csapi/formats/sensorml.spec.ts`
- [ ] `src/csapi/formats/swe-common.spec.ts`
- [ ] `src/csapi/formats/detector.spec.ts`
- [ ] `src/csapi/formats/validator.spec.ts`
- [ ] `src/csapi/resources/systems.spec.ts`
- [ ] `src/csapi/resources/deployments.spec.ts`
- [ ] `src/csapi/resources/procedures.spec.ts`
- [ ] `src/csapi/resources/sampling-features.spec.ts`
- [ ] `src/csapi/resources/properties.spec.ts`
- [ ] `src/csapi/resources/datastreams.spec.ts`
- [ ] `src/csapi/resources/observations.spec.ts`
- [ ] `src/csapi/resources/control-streams.spec.ts`
- [ ] `src/csapi/resources/commands.spec.ts`

### Tests (Integration)
- [ ] `src/csapi/integration.spec.ts` - End-to-end workflows
- [ ] `src/csapi/performance.spec.ts` - Performance benchmarks

### Test Fixtures
- [ ] Download fixtures from 52°North demo server
- [ ] Create fixtures from CSAPI spec examples
- [ ] Create edge case fixtures (errors, malformed data)

### Documentation
- [ ] JSDoc on all public APIs (100% coverage)
- [ ] README with installation and examples
- [ ] Migration guide (if needed)
- [ ] API reference (generated from JSDoc)

### Build & Quality
- [ ] TypeScript compilation passes (0 errors)
- [ ] ESLint passes (0 errors)
- [ ] Prettier formatting applied
- [ ] Test coverage > 90%
- [ ] CI/CD checks pass
- [ ] Bundle size < 150 KB gzipped

### Release
- [ ] PR created in camptocamp/ogc-client
- [ ] PR approved by maintainers
- [ ] Merged to main
- [ ] Published to npm

---

## Summary

**What We're Building:**
- **42 source files** (~9,930 lines of production code)
- **1 main class** (CSAPIEndpoint) with 40+ public methods
- **3 format parsers** (GeoJSON, SensorML, SWE Common)
- **9 resource modules** (all CSAPI resource types)
- **~100 TypeScript types** (complete type system)
- **18 test files** (~1,200 lines of test code)
- **~40 test fixtures** (real server data + spec examples)
- **Worker support** (browser + Node.js)
- **Comprehensive documentation** (JSDoc + README + examples)

**This gives developers:**
- Complete access to all CSAPI features
- Type-safe API with excellent IDE support
- Robust format parsing and validation
- High performance (worker-offloaded parsing)
- Production-ready quality (90%+ coverage, error handling, caching)
- Seamless integration with camptocamp/ogc-client ecosystem

---

## Document Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-01 | Initial technical architecture document |
