# What We're Building - CSAPI Client Library

**Version:** 1.0  
**Date:** 2026-02-01  
**Status:** Draft  

---

## Purpose

This document simply lists out everything we're going to build for the CSAPI client library. No code, just descriptions of what each thing does.

**Related Documents:**
- [Vision and Scope](vision-and-scope.md) - What developers can do with the library
- [Functional Specification](functional-spec.md) - How it will work internally

---

## Table of Contents

1. [Main Entry Point](#1-main-entry-point)
2. [Service Discovery Components](#2-service-discovery-components)
3. [Format Parsers](#3-format-parsers)
4. [Part 1 Resource Handlers](#4-part-1-resource-handlers)
5. [Part 2 Resource Handlers](#5-part-2-resource-handlers)
6. [Worker Support](#6-worker-support)
7. [Test Suite](#7-test-suite)

---

## 1. Main Entry Point

### CSAPIEndpoint Class
The main class developers will use. It handles:
- Connecting to a CSAPI server
- Discovering what the server supports
- Providing methods to work with all resource types
- Managing caching and error handling

---

## 2. Service Discovery Components

### Conformance Parser
Reads the server's `/conformance` endpoint to find out:
- Which CSAPI features the server supports
- Which Parts (1 and/or 2) are implemented
- Which optional features are available

### Collections Parser
Reads the server's `/collections` endpoint to discover:
- What resource collections are available
- Metadata about each collection (title, description)
- Spatial and temporal extents
- Links to access each collection

### URL Builder
Constructs proper URLs for:
- Fetching resource collections with filters
- Getting individual resources by ID
- Creating new resources
- Updating existing resources
- Deleting resources
- Nested resource access (e.g., datastreams for a system)

---

## 3. Format Parsers

### GeoJSON Parser
Handles geographic data including:
- All geometry types (Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection)
- Feature objects with properties
- FeatureCollections
- Coordinate validation
- Bounding box calculation

### SensorML Parser
Parses sensor and system descriptions including:
- Physical systems (complete sensor platforms)
- Physical components (individual sensors)
- Simple processes
- Aggregate processes (systems made of subsystems)
- Process chains
- System identification and classification
- Capabilities and characteristics
- Position and orientation
- Contact information
- Documentation links
- System history

### SWE Common Parser
Handles observation schemas and data encoding:
- Simple types (numbers, counts, booleans, text, categories, timestamps)
- Complex types (records, vectors, arrays, choices, matrices)
- JSON encoding (native JavaScript objects)
- Text encoding (CSV-style with custom separators)
- Binary encoding (compact byte representations)
- XML encoding
- Constraint validation (allowed values, ranges, patterns)
- Unit of measure handling

### Format Detector
Automatically identifies response formats using:
- Content-Type headers
- Response structure analysis
- Context clues (resource type, operation)
- Heuristics for ambiguous cases

### Format Validator
Validates data against expected formats:
- Structure validation (correct JSON shape)
- Type validation (correct data types)
- Required field checking
- Constraint checking (value ranges, patterns)
- Semantic validation (logical consistency)
- Detailed error messages with paths

---

## 4. Part 1 Resource Handlers

### Systems Handler
Manages sensor systems and platforms:
- List all systems with filtering
- Get individual system details
- Create new systems
- Update existing systems
- Delete systems
- Parse system metadata (SensorML format)
- Handle nested subsystems

### Deployments Handler
Manages sensor deployments:
- List all deployments
- Get deployment details
- Create new deployments
- Update deployments
- Delete deployments
- Link deployments to systems and platforms

### Procedures Handler
Manages measurement procedures:
- List all procedures
- Get procedure details
- Create new procedures
- Update procedures
- Delete procedures
- Parse procedure descriptions (SensorML format)

### Sampling Features Handler
Manages sampling locations:
- List all sampling features
- Get sampling feature details
- Create new sampling features
- Update sampling features
- Delete sampling features
- Handle spatial geometries

### Properties Handler
Manages observable properties:
- List all observable properties
- Get property definitions
- Read-only access (properties typically predefined)

---

## 5. Part 2 Resource Handlers

### DataStreams Handler
Manages observation data streams:
- List all datastreams
- Get datastream details
- Get datastreams for a specific system
- Create new datastreams
- Update datastreams
- Delete datastreams
- Parse result schemas (SWE Common format)
- Handle encoding specifications

### Observations Handler
Manages actual observation data:
- List all observations
- Get individual observations
- Get observations for a specific datastream
- Create observations (single or bulk)
- Parse observation results according to schema
- Handle different encodings (JSON, text, binary)
- Support bulk ingestion of large datasets

### Control Streams Handler
Manages command/control interfaces:
- List all control streams
- Get control stream details
- Get control streams for a specific system
- Create new control streams
- Update control streams
- Delete control streams
- Parse command schemas (SWE Common format)

### Commands Handler
Manages system commands:
- List all commands
- Get command details
- Get commands for a specific control stream
- Issue new commands (single or bulk)
- Parse command parameters according to schema
- Track command status and results

---

## 6. Worker Support

### Worker Task Handlers
Register parsing operations that can run in web workers:
- Conformance parsing
- Collections parsing
- GeoJSON parsing
- SensorML parsing
- SWE Common schema parsing
- Observation data parsing
- Validation operations

### Worker API
Public interface for worker operations:
- Transparent message passing
- Promise-based API
- Automatic fallback when workers unavailable
- Same API in worker and non-worker modes

---

## 7. Test Suite

### Unit Tests
Individual tests for each component:
- Endpoint initialization
- URL building
- GeoJSON parsing for all geometry types
- SensorML parsing for all process types
- SWE Common parsing for all component types
- Each resource handler (9 handlers)
- Format detection
- Validation

### Integration Tests
End-to-end workflow tests:
- Complete user journeys (discover → query → fetch → parse)
- Real server integration (52°North demo)
- Cross-component integration
- Error handling flows

### Performance Tests
Benchmark tests for:
- Parsing 10K observations under 5 seconds
- Worker vs non-worker mode comparison
- Memory usage
- Bundle size verification

### Test Fixtures
Real-world test data:
- 30-40 JSON files from actual CSAPI servers
- Examples from CSAPI specifications
- Edge cases and error scenarios
- Large datasets for performance testing

---

## Summary Count

**What We're Building:**
- **1** main endpoint class
- **3** service discovery components
- **5** format parsers
- **9** resource handlers (5 Part 1 + 4 Part 2)
- **2** worker components
- **~100** TypeScript type definitions
- **~20** test suites
- **~40** test fixtures

**Total:** ~42 source files covering all CSAPI features

---

## Why Each Thing Matters

- **Main endpoint** = Single entry point for developers
- **Service discovery** = Automatic capability detection
- **Format parsers** = Handle GeoJSON, SensorML, SWE Common
- **Resource handlers** = CRUD for all 9 resource types
- **Worker support** = Keep UI responsive during heavy parsing
- **Tests** = Ensure quality and catch regressions

This gives developers a complete, production-ready CSAPI client that works with any compliant server.

This gives developers a complete, production-ready CSAPI client that works with any compliant server.

---

## Document Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-01 | Initial component list |
