# Section 15: Fixture Sourcing and Organization Strategy

**Purpose:** Define comprehensive strategy for sourcing, organizing, and maintaining all test fixtures required across the entire CSAPI test suite (unit tests, integration tests, format parsers, workflows).

**Context:** Sections 8-14 identified extensive fixture requirements across multiple test types, formats, and resource categories. This section consolidates these requirements and creates an actionable plan for fixture acquisition, organization, and lifecycle management.

**Date:** 2025-01-31

**Dependencies:**
- Section 8: CSAPI Specification Test Requirements (25+ spec examples)
- Section 9: SensorML Testing Requirements (~25 fixtures, 5+ categories)
- Section 10: SWE Common Testing Requirements (~120 fixtures across 3 encodings)
- Section 11: GeoJSON CSAPI Testing Requirements (GeoJSON feature fixtures)
- Section 12: QueryBuilder Testing Strategy (5 universal fixtures)
- Section 13: Resource Method Testing Patterns (23 resource fixtures)
- Section 14: Integration Test Workflow Design (33 workflow fixtures)
- CSAPI Parts 1 & 2 Specifications
- SensorML 3.0 Specification (OGC 23-000)
- SWE Common 3.0 Specification (OGC 24-014)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Fixture Inventory and Counts](#2-fixture-inventory-and-counts)
3. [Fixture Categories and Types](#3-fixture-categories-and-types)
4. [Sourcing Strategy by Category](#4-sourcing-strategy-by-category)
5. [Directory Structure Design](#5-directory-structure-design)
6. [File Naming Conventions](#6-file-naming-conventions)
7. [Fixture Metadata and Provenance](#7-fixture-metadata-and-provenance)
8. [Reusability Patterns](#8-reusability-patterns)
9. [Maintenance and Update Procedures](#9-maintenance-and-update-procedures)
10. [Fixture Validation Requirements](#10-fixture-validation-requirements)
11. [Sourcing Execution Plan](#11-sourcing-execution-plan)
12. [Implementation Priorities](#12-implementation-priorities)
13. [Risk Assessment and Mitigation](#13-risk-assessment-and-mitigation)
14. [Success Criteria](#14-success-criteria)
15. [References](#15-references)

---

## 1. Executive Summary

### 1.1 Fixture Requirements Overview

**Total Fixtures Identified:** **~280 fixtures minimum** across all test types

**Breakdown by Section:**
- Section 8 (CSAPI Spec): 25+ examples (Part 1: 11, Part 2: 14+)
- Section 9 (SensorML): ~25 fixtures (5 PhysicalSystem, 3 PhysicalComponent, etc.)
- Section 10 (SWE Common): ~120 fixtures (40 JSON, 40 Text, 40 Binary)
- Section 11 (GeoJSON CSAPI): ~20 fixtures (5 resource types × 4 variants)
- Section 12 (QueryBuilder): 5 universal fixtures
- Section 13 (Resource Methods): 23 fixtures (5 universal + 18 resource-specific)
- Section 14 (Integration Workflows): 33 fixtures across 4 workflows
- **Additional edge cases:** ~30 error/edge case fixtures

**Primary Sources Identified:**
1. ✅ **CSAPI Part 1 & 2 Specifications** - Available examples with JSON representations
2. ✅ **SensorML 3.0 Specification** (https://docs.ogc.org/is/23-000/23-000.html) - Accessible with examples
3. ✅ **SWE Common 3.0 Specification** (https://docs.ogc.org/is/24-014/24-014.html) - Accessible with examples
4. ⚠️ **OpenSensorHub Demo Server** (http://sensiasoft.net:8181/sensorhub/api/) - UNAVAILABLE (404 error)
5. ⏳ **52°North Server** - Not yet accessed, potential alternative source
6. ✅ **Hand-crafted fixtures** - For error cases, edge conditions, validation failures

### 1.2 Key Findings

**Sourcing Realities:**
- **Specification sources are primary**: All three major specs (CSAPI, SensorML, SWE Common) are accessible and contain JSON examples
- **Live server data unavailable**: OpenSensorHub demo server returned 404 during research
- **Hand-crafting required**: Error cases, edge conditions, and validation failures need custom creation
- **Fixture complexity varies**: Range from simple conformance responses to complex binary-encoded datastreams

**Organization Challenges:**
- **Multiple dimensions**: Resource type, format, variant (valid/invalid), test type, workflow
- **Reusability needs**: Universal fixtures shared across test types vs. resource-specific fixtures
- **Encoding variations**: JSON, Text (CSV), Binary (base64) for SWE Common datastreams
- **Maintenance overhead**: ~280+ fixtures require systematic validation and update procedures

### 1.3 Strategic Approach

**Three-Phase Sourcing Plan:**

**Phase 1: Specification Extraction** (Weeks 1-2)
- Extract examples from CSAPI, SensorML, SWE Common specs
- Convert spec examples to standalone fixture files
- Validate extracted fixtures against JSON schemas
- **Deliverables:** ~170 fixtures from specifications

**Phase 2: Hand-Crafted Fixtures** (Weeks 3-4)
- Create error case fixtures (invalid properties, schema violations)
- Create edge case fixtures (empty collections, null geometries, extreme values)
- Create workflow-specific fixtures (multi-hop navigation, circular references)
- **Deliverables:** ~80 hand-crafted fixtures

**Phase 3: Validation and Integration** (Week 5)
- Validate all fixtures against schemas
- Create fixture metadata (source, date, validation status)
- Integrate fixtures into test file structure
- **Deliverables:** Complete validated fixture library

---

## 2. Fixture Inventory and Counts

### 2.1 Complete Fixture Matrix

| **Section** | **Category** | **Fixture Count** | **Formats** | **Variants** | **Source** |
|------------|--------------|------------------|-------------|--------------|------------|
| **Section 8** | CSAPI Spec Examples | 25+ | JSON | Valid | CSAPI Specs |
| | Part 1 Resources | 11 | JSON | Valid | Part 1 |
| | Part 2 Observations | 14+ | JSON | Valid | Part 2 |
| **Section 9** | SensorML | ~25 | JSON | Valid + Error | SensorML 3.0 Spec |
| | PhysicalSystem | 5 | JSON | 3 valid, 2 error | Spec + Hand-craft |
| | PhysicalComponent | 3 | JSON | 2 valid, 1 error | Spec + Hand-craft |
| | SimpleProcess | 2 | JSON | Valid | Spec |
| | AggregateProcess | 3 | JSON | Valid | Spec |
| | Composite systems | 4 | JSON | Valid | Hand-craft |
| | Error cases | 5 | JSON | Invalid | Hand-craft |
| | Spec examples | 3 | JSON | Valid | SensorML Spec |
| **Section 10** | SWE Common | ~120 | 3 encodings | Valid + Error | SWE 3.0 Spec |
| | JSON encoding | 40 | JSON | 35 valid, 5 error | Spec + Hand-craft |
| | Text encoding (CSV) | 40 | Text | 35 valid, 5 error | Spec + Hand-craft |
| | Binary encoding | 40 | Binary (base64) | 35 valid, 5 error | Spec + Hand-craft |
| **Section 11** | GeoJSON CSAPI | ~20 | JSON | Valid + Invalid | Hand-craft |
| | Systems | 4 | JSON | 2 valid, 2 invalid | CSAPI Spec + Hand-craft |
| | Deployments | 4 | JSON | 2 valid, 2 invalid | CSAPI Spec + Hand-craft |
| | Procedures | 4 | JSON | 2 valid, 2 invalid | CSAPI Spec + Hand-craft |
| | SamplingFeatures | 4 | JSON | 2 valid, 2 invalid | CSAPI Spec + Hand-craft |
| | Properties | 4 | JSON | 2 valid, 2 invalid | CSAPI Spec + Hand-craft |
| **Section 12** | QueryBuilder | 5 | JSON | Valid | Hand-craft |
| | conformance-all | 1 | JSON | Valid | Hand-craft |
| | conformance-part1 | 1 | JSON | Valid | Hand-craft |
| | collection-info-all | 1 | JSON | Valid | Hand-craft |
| | collection-info-part1 | 1 | JSON | Valid | Hand-craft |
| | collection-info-none | 1 | JSON | Error | Hand-craft |
| **Section 13** | Resource Methods | 23 | JSON | Valid | Hand-craft |
| | Universal fixtures | 5 | JSON | Valid | Same as Section 12 |
| | Resource-specific | 18 | JSON | Valid | Hand-craft |
| | (9 types × 2 each) | | | collection + item | |
| **Section 14** | Integration Workflows | 33 | JSON | Valid + Edge | Hand-craft |
| | Discovery workflow | 8 | JSON | Valid | Hand-craft |
| | Observation workflow | 10 | JSON | Valid | Hand-craft |
| | Command workflow | 8 | JSON | Valid | Hand-craft |
| | Navigation workflow | 7 | JSON | Valid + Edge | Hand-craft |
| **Additional** | Error/Edge Cases | ~30 | Various | Invalid/Edge | Hand-craft |
| | Empty collections | 9 | JSON | Edge | Hand-craft |
| | Null geometries | 5 | JSON | Edge | Hand-craft |
| | Invalid URIs | 5 | JSON | Error | Hand-craft |
| | Schema violations | 5 | JSON | Error | Hand-craft |
| | Circular references | 3 | JSON | Edge | Hand-craft |
| | Large datasets | 3 | JSON | Edge | Hand-craft |
| **TOTAL** | | **~280** | | | |

### 2.2 Fixture Complexity Analysis

**Simple Fixtures** (~80 fixtures, 15-30 minutes each):
- Conformance responses (single objects)
- Collection-info responses (simple arrays)
- Empty collections
- Error responses

**Medium Fixtures** (~150 fixtures, 30-60 minutes each):
- Single resource GeoJSON features (Systems, Deployments, etc.)
- SensorML PhysicalSystem/PhysicalComponent
- SWE Common JSON DataRecords/DataArrays
- Simple workflow responses

**Complex Fixtures** (~50 fixtures, 1-3 hours each):
- Composite SensorML systems with nested components
- SWE Common binary-encoded datastreams (requires encoding knowledge)
- Multi-hop navigation scenarios
- Integration workflow complete response chains

**Estimated Effort:**
- Simple: 80 × 20 min avg = 1,600 min = **27 hours**
- Medium: 150 × 45 min avg = 6,750 min = **113 hours**
- Complex: 50 × 2 hr avg = **100 hours**
- **Total fixture creation effort: ~240 hours (~6 weeks at 40 hrs/week)**

---

## 3. Fixture Categories and Types

### 3.1 By Test Type

**Unit Test Fixtures:**
- QueryBuilder fixtures (5 universal)
- Resource method fixtures (23 resource-specific)
- Format parser fixtures (SensorML ~25, SWE Common ~120, GeoJSON ~20)
- **Total: ~193 fixtures**

**Integration Test Fixtures:**
- Discovery workflow fixtures (8)
- Observation workflow fixtures (10)
- Command workflow fixtures (8)
- Navigation workflow fixtures (7)
- **Total: 33 fixtures**

**Validation Test Fixtures:**
- Schema validation fixtures (~15)
- Error condition fixtures (~15)
- Edge case fixtures (~15)
- **Total: ~45 fixtures**

**Performance Test Fixtures:**
- Large collection fixtures (~3)
- Streaming datastream fixtures (~3)
- **Total: ~6 fixtures**

### 3.2 By Resource Type (CSAPI Resources)

| Resource Type | Collection Response | Item Response | Feature Valid | Feature Invalid | Total |
|--------------|---------------------|---------------|---------------|-----------------|-------|
| Systems | 1 | 1 | 2 | 2 | 6 |
| Deployments | 1 | 1 | 2 | 2 | 6 |
| Procedures | 1 | 1 | 2 | 2 | 6 |
| SamplingFeatures | 1 | 1 | 2 | 2 | 6 |
| Properties | 1 | 1 | 2 | 2 | 6 |
| DataStreams | 1 | 1 | - | - | 2 |
| Observations | 1 | 1 | - | - | 2 |
| ControlStreams | 1 | 1 | - | - | 2 |
| Commands | 1 | 1 | - | - | 2 |
| **TOTAL** | **9** | **9** | **10** | **10** | **38** |

### 3.3 By Format/Encoding

| Format | Description | Fixture Count | Test Type |
|--------|-------------|---------------|-----------|
| **JSON** | Standard JSON (CSAPI, GeoJSON, SensorML) | ~160 | Unit, Integration |
| **JSON (SWE)** | SWE Common JSON encoding | ~40 | Format parser |
| **Text (CSV)** | SWE Common text encoding | ~40 | Format parser |
| **Binary (base64)** | SWE Common binary encoding | ~40 | Format parser |
| **TOTAL** | | **~280** | |

### 3.4 By Variant Type

| Variant | Description | Fixture Count | Purpose |
|---------|-------------|---------------|---------|
| **Valid** | Schema-compliant, spec-conformant | ~220 | Positive testing |
| **Invalid** | Schema violations, invalid properties | ~30 | Error handling |
| **Edge** | Empty, null, extreme values | ~20 | Edge case testing |
| **Error** | Server errors, not found, conflicts | ~10 | HTTP error handling |
| **TOTAL** | | **~280** | |

---

## 4. Sourcing Strategy by Category

### 4.1 CSAPI Specification Fixtures (Section 8)

**Source:** CSAPI Part 1 & Part 2 Specifications

**Extraction Method:**
1. Identify example sections in CSAPI specs (typically Annex B or inline examples)
2. Extract JSON examples for each resource type
3. Validate against JSON schemas
4. Save as standalone fixture files

**Example Locations in CSAPI Spec:**
- Part 1 examples: Systems, Deployments, Procedures, SamplingFeatures, Properties
- Part 2 examples: DataStreams, Observations, ControlStreams, Commands

**Fixtures to Extract:**
- `system-weather-station.json` - Example weather station system
- `deployment-argo-float.json` - Example deployment
- `procedure-temperature-measurement.json` - Example observation procedure
- `samplingfeature-vertical-profile.json` - Example sampling feature
- `property-temperature.json` - Example observable property
- `datastream-temperature-series.json` - Example datastream
- `observation-temperature.json` - Example observation
- `controlstream-heater.json` - Example control stream
- `command-set-temperature.json` - Example command

**Sourcing Status:** ✅ Specifications accessible, examples can be extracted

### 4.2 SensorML 3.0 Fixtures (Section 9)

**Source:** SensorML 3.0 Specification (OGC 23-000)
- **URL:** https://docs.ogc.org/is/23-000/23-000.html
- **JSON Schema Repository:** https://schemas.opengis.net/sensorML/3.0/json/
- **JSON Example Repository:** https://schemas.opengis.net/sensorML/3.0/json/examples/

**Extraction Method:**
1. Access SensorML 3.0 specification document
2. Identify example sections (Clause 9, Annex B typically contain JSON examples)
3. Download examples from schema repository if available
4. Extract inline examples from specification HTML
5. Validate against SensorML JSON schemas
6. Supplement with hand-crafted error cases

**Examples Available in Spec:**
- Weather station system (PhysicalSystem with multiple sensor components)
- Individual sensor descriptions (PhysicalComponent)
- Deployment descriptions
- Process descriptions (windchill computation)
- Datasheet specifications

**Fixtures to Create:**
- `physicalsystem-weather-station.json` (valid, from spec)
- `physicalsystem-saildrone.json` (valid, from spec deployment example)
- `physicalsystem-lidar.json` (valid, hand-craft)
- `physicalsystem-missing-identifier.json` (error, hand-craft)
- `physicalsystem-invalid-type.json` (error, hand-craft)
- `physicalcomponent-thermometer.json` (valid, from spec)
- `physicalcomponent-camera.json` (valid, hand-craft)
- `physicalcomponent-invalid-io.json` (error, hand-craft)
- `simpleprocess-windchill.json` (valid, from spec)
- `simpleprocess-coordinate-transform.json` (valid, hand-craft)
- `aggregateprocess-data-fusion.json` (valid, hand-craft)
- `aggregateprocess-sensor-calibration.json` (valid, hand-craft)
- `aggregateprocess-invalid-components.json` (error, hand-craft)
- `composite-system-mobile-platform.json` (valid, hand-craft - system with subsystems)
- `composite-system-nested-3-levels.json` (valid, hand-craft - deep nesting)
- `composite-system-circular-reference.json` (error, hand-craft - circular subsystem)
- `composite-system-invalid-component-type.json` (error, hand-craft)

**Sourcing Status:** ✅ Specification accessible with examples

### 4.3 SWE Common 3.0 Fixtures (Section 10)

**Source:** SWE Common 3.0 Specification (OGC 24-014)
- **URL:** https://docs.ogc.org/is/24-014/24-014.html
- **JSON Schema Repository:** https://schemas.opengis.net/sweCommon/3.0/json/

**Extraction Method:**
1. Access SWE Common 3.0 specification (Clause 9: JSON Implementation, Clause 10: Encoding Rules)
2. Extract JSON encoding examples (Annex B.2: JSON Encoding Rules Examples)
3. Extract text encoding examples (Annex B.1: Text Encoding Rules Examples)
4. Create binary encoding fixtures based on spec requirements (Clause 10.4)
5. Validate against SWE Common JSON schemas

**Example Categories in Spec:**
- **Scalar Components:** Boolean, Text, Category, Count, Quantity, Time
- **Range Components:** CategoryRange, CountRange, QuantityRange, TimeRange
- **Record Components:** DataRecord, Vector
- **Choice Components:** DataChoice
- **Block Components:** DataArray, Matrix, DataStream
- **Geometry Components:** Geometry (GeoJSON)
- **Encodings:** JSONEncoding, TextEncoding, BinaryEncoding

**Fixtures to Create (120 total = 40 per encoding):**

**JSON Encoding (40 fixtures):**
- `boolean-motion-detected.json` (scalar)
- `text-manufacturer.json` (scalar)
- `category-geological-period.json` (scalar)
- `count-pixel-count.json` (scalar)
- `quantity-temperature.json` (scalar)
- `quantity-radiance.json` (scalar with unit)
- `time-sampling-time-gregorian.json` (time with ISO8601)
- `time-unix-timestamp.json` (time as seconds)
- `category-range-era-range.json` (range)
- `count-range-array-index.json` (range)
- `quantity-range-latitude.json` (range with constraints)
- `time-range-survey-period.json` (range)
- `datarecord-weather-data.json` (record with 5 fields)
- `datarecord-camera-calibration.json` (record with nested quantities)
- `vector-location-2d.json` (vector with lat/lon)
- `vector-location-3d.json` (vector with lat/lon/alt)
- `vector-velocity.json` (vector with vx/vy/vz)
- `datachoice-message-types.json` (choice between TEMP/WIND messages)
- `dataarray-calibration-curve.json` (fixed size 1D array)
- `dataarray-trajectory.json` (variable size 1D array)
- `dataarray-image-2d.json` (fixed size 2D array - 3000×3000 pixels)
- `dataarray-profile-series.json` (variable size arrays in stream)
- `matrix-stress-3x3.json` (fixed size matrix)
- `matrix-rotation.json` (3×3 rotation matrix)
- `datastream-weather.json` (simple record stream)
- `datastream-navigation.json` (stream with optional fields)
- `datastream-choice-messages.json` (stream with DataChoice)
- `datastream-geometry-detections.json` (stream with geometries)
- `geometry-point.json` (Point geometry)
- `geometry-linestring.json` (LineString geometry)
- `geometry-polygon.json` (Polygon geometry)
- *(5 error fixtures: invalid structure, missing required fields, etc.)*

**Text Encoding (40 fixtures):**
- *(Same logical structure as JSON, but values encoded as CSV-like text)*
- `dataarray-calibration-curve.csv`
- `datastream-weather.csv`
- `datastream-navigation-optional.csv`
- `dataarray-profile-series.csv`
- `matrix-stress-3x3.csv`
- *(Plus 35 more covering all component types)*

**Binary Encoding (40 fixtures):**
- *(Same logical structure, but values base64-encoded binary)*
- `dataarray-calibration-curve.bin` (base64)
- `datastream-weather.bin` (base64)
- `datastream-large-dataset.bin` (base64, for performance testing)
- *(Plus 37 more covering all component types and data types from Table 2)*

**Sourcing Status:** ✅ Specification accessible with extensive examples in Annexes

**Key Spec References:**
- Clause 9.1-9.7: JSON schema implementations
- Clause 10.2: JSON encoding rules with examples
- Clause 10.3: Text encoding rules with examples
- Clause 10.4: Binary encoding rules
- Annex B.1: Text encoding examples (B.1.1 through B.1.7)
- Annex B.2: JSON encoding examples (B.2.1 through B.2.8)
- Table 2: Binary data types (19 types: signedByte, unsignedByte, signedShort, ..., float128, string-utf-8)

### 4.4 GeoJSON CSAPI Fixtures (Section 11)

**Source:** Hand-crafted (based on CSAPI Part 1 property requirements + RFC 7946)

**Creation Method:**
1. Start with CSAPI spec examples (if available)
2. Ensure RFC 7946 compliance (type, geometry, properties structure)
3. Add CSAPI-specific properties to `properties` object:
   - `uid` (required)
   - `name` (required)
   - `featureType` (required, from SOSA/SSN ontology)
   - Resource-specific properties (systemType, procedureType, validTime, etc.)
4. Create invalid variants (missing required properties, invalid vocabulary values)
5. Validate against GeoJSON schema + CSAPI property requirements

**Fixtures to Create (20 total):**
- `system-weather-station-valid.json` (valid spatial system)
- `system-lidar-valid.json` (valid spatial system)
- `system-missing-uid.json` (error: missing required uid)
- `system-invalid-feature-type.json` (error: invalid featureType value)
- `deployment-argo-valid.json` (valid deployment with validTime)
- `deployment-drone-mission-valid.json` (valid deployment)
- `deployment-missing-valid-time.json` (error: missing required validTime)
- `deployment-invalid-valid-time-format.json` (error: invalid ISO8601 period)
- `procedure-temperature-method-valid.json` (valid non-spatial procedure)
- `procedure-sampling-protocol-valid.json` (valid non-spatial procedure)
- `procedure-has-geometry.json` (error: procedure should have null geometry)
- `procedure-invalid-procedure-type.json` (error: invalid procedureType)
- `samplingfeature-vertical-profile-valid.json` (valid sampling feature)
- `samplingfeature-point-sample-valid.json` (valid sampling feature)
- `samplingfeature-missing-parent-system.json` (error: always needs parentSystem)
- `samplingfeature-invalid-geometry-type.json` (error: invalid geometry for sampling)
- `property-temperature-valid.json` (valid observable property)
- `property-wind-speed-valid.json` (valid observable property)
- `property-has-geometry.json` (error: property should have null geometry)
- `property-missing-item-type.json` (error: properties use itemType not featureType)

**Sourcing Status:** ✅ Hand-crafted based on CSAPI Part 1 requirements

### 4.5 QueryBuilder Fixtures (Section 12)

**Source:** Hand-crafted (based on CSAPI conformance and collection-info responses)

**Creation Method:**
1. Create conformance response fixtures (list of conformance classes)
2. Create collection-info response fixtures (links to resource collections)
3. Validate structure matches CSAPI API responses
4. Ensure compatibility with QueryBuilder logic

**Fixtures to Create (5 total):**
- `conformance-all-resources.json` - All 9 CSAPI resource types supported
- `conformance-part1-only.json` - Only Part 1 resources (Systems, Deployments, Procedures, SamplingFeatures, Properties)
- `collection-info-all-resources.json` - Links to all 9 resource collections
- `collection-info-part1-only.json` - Links to Part 1 collections only
- `collection-info-no-csapi.json` - No CSAPI collections (error case)

**Sourcing Status:** ✅ Hand-crafted

### 4.6 Resource Method Fixtures (Section 13)

**Source:** Hand-crafted (extends QueryBuilder fixtures)

**Creation Method:**
1. Reuse QueryBuilder universal fixtures (5 fixtures)
2. Create resource-specific collection and item responses for each of 9 resource types
3. Ensure realistic data (not minimal/fake)
4. Cross-reference with integration workflow fixtures for consistency

**Fixtures to Create (23 total = 5 universal + 18 resource-specific):**

**Universal (reuse from Section 12):**
- `conformance-all-resources.json`
- `conformance-part1-only.json`
- `collection-info-all-resources.json`
- `collection-info-part1-only.json`
- `collection-info-no-csapi.json`

**Resource-Specific (9 types × 2 each):**
- `systems-collection-response.json` (GET /systems)
- `systems-item-response.json` (GET /systems/{id})
- `deployments-collection-response.json` (GET /deployments)
- `deployments-item-response.json` (GET /deployments/{id})
- `procedures-collection-response.json` (GET /procedures)
- `procedures-item-response.json` (GET /procedures/{id})
- `samplingfeatures-collection-response.json` (GET /samplingFeatures)
- `samplingfeatures-item-response.json` (GET /samplingFeatures/{id})
- `properties-collection-response.json` (GET /properties)
- `properties-item-response.json` (GET /properties/{id})
- `datastreams-collection-response.json` (GET /datastreams)
- `datastreams-item-response.json` (GET /datastreams/{id})
- `observations-collection-response.json` (GET /observations)
- `observations-item-response.json` (GET /observations/{id})
- `controlstreams-collection-response.json` (GET /controlStreams)
- `controlstreams-item-response.json` (GET /controlStreams/{id})
- `commands-collection-response.json` (GET /commands)
- `commands-item-response.json` (GET /commands/{id})

**Sourcing Status:** ✅ Hand-crafted

### 4.7 Integration Workflow Fixtures (Section 14)

**Source:** Hand-crafted (based on workflow scenarios)

**Creation Method:**
1. Design complete workflow scenarios (discovery, observation, command, navigation)
2. Create fixture chains (root → step 1 → step 2 → ... → final)
3. Ensure link consistency across fixtures (href values match)
4. Include edge cases (empty collections, null results, circular references)

**Fixtures to Create (33 total):**

**Discovery Workflow (8 fixtures):**
- `discovery-root-landing-page.json`
- `discovery-conformance.json`
- `discovery-collections.json`
- `discovery-systems-collection.json`
- `discovery-weather-station.json`
- `discovery-thermometer-component.json`
- `discovery-datastreams-for-system.json`
- `discovery-temp-datastream.json`

**Observation Workflow (10 fixtures):**
- `observation-property-temperature.json`
- `observation-datastream-temp-series.json`
- `observation-observations-collection.json`
- `observation-observation-single.json`
- `observation-foi-location.json`
- `observation-sensorml-procedure.json`
- `observation-swe-datarecord.json` (datastream schema)
- `observation-swe-values-json.json` (observation values in JSON)
- `observation-swe-values-text.csv` (observation values in CSV)
- `observation-swe-values-binary.bin` (observation values in binary)

**Command Workflow (8 fixtures):**
- `command-controlstream.json`
- `command-commands-collection.json`
- `command-command-history.json`
- `command-tasking-capability.json`
- `command-parameter-schema.json` (SWE DataRecord for command parameters)
- `command-post-request.json` (command submission request body)
- `command-post-response.json` (command submission response with 201)
- `command-command-status.json` (GET /commands/{id} after submission)

**Cross-Resource Navigation (7 fixtures):**
- `navigation-system-mobile-platform.json`
- `navigation-deployment-mission.json`
- `navigation-subsystems-collection.json`
- `navigation-subsystem-camera.json`
- `navigation-samplingfeatures-for-system.json`
- `navigation-samplingfeature-vertical-profile.json`
- `navigation-circular-reference-error.json` (edge case: circular subsystem reference)

**Sourcing Status:** ✅ Hand-crafted

### 4.8 Error and Edge Case Fixtures

**Source:** Hand-crafted

**Creation Method:**
1. Identify common error scenarios (404, 400, 500, invalid data)
2. Create fixtures for edge cases (empty, null, extreme values)
3. Validate error response formats match CSAPI/OGC API error structure

**Fixtures to Create (~30 total):**

**Empty/Null Edge Cases (9):**
- `empty-collection-systems.json` (empty features array)
- `empty-collection-observations.json` (no observations for datastream)
- `null-geometry-procedure.json` (procedure with null geometry, valid)
- `null-geometry-system.json` (system with null geometry, edge case)
- `null-properties-error.json` (feature with null properties, error)
- `empty-links-array.json` (collection with no links)
- `empty-datastream-values.json` (datastream with no values)

**Invalid Data Errors (5):**
- `invalid-uri-format-system.json` (uid not a valid URI)
- `invalid-vocabulary-system-type.json` (systemType not from controlled vocab)
- `invalid-temporal-period-deployment.json` (validTime not ISO8601)
- `invalid-geojson-feature-structure.json` (missing required GeoJSON properties)
- `invalid-sensorml-missing-identifier.json` (SensorML without unique identifier)

**Schema Violation Errors (5):**
- `schema-violation-missing-required-field.json` (missing uid)
- `schema-violation-wrong-type.json` (string where number expected)
- `schema-violation-extra-property.json` (unknown property in strict mode)
- `schema-violation-swe-invalid-component.json` (SWE DataRecord with invalid field)
- `schema-violation-array-instead-of-object.json` (type mismatch)

**HTTP Error Responses (8):**
- `error-404-resource-not-found.json`
- `error-400-invalid-query-parameter.json`
- `error-400-invalid-request-body.json`
- `error-500-internal-server-error.json`
- `error-503-service-unavailable.json`
- `error-401-unauthorized.json`
- `error-403-forbidden.json`
- `error-409-conflict.json` (e.g., command already exists)

**Extreme Value Edge Cases (3):**
- `large-collection-1000-items.json` (test pagination/performance)
- `large-observation-values-10000-points.json` (large datastream)
- `deep-nested-system-10-levels.json` (deeply nested subsystems)

**Sourcing Status:** ✅ Hand-crafted

---

## 5. Directory Structure Design

### 5.1 Hierarchical Organization

**Primary Dimension:** Test type (most significant organizational axis)

**Rationale:**
- Tests are organized by type (unit, integration, format parsers)
- Fixtures should mirror test file structure
- Enables fixture co-location with tests
- Simplifies fixture discovery during test execution

**Directory Structure:**

```
fixtures/
├── README.md                          # Fixture library overview
├── SOURCES.md                         # Provenance documentation
├── csapi-querybuilder/                # Section 12 & 13 fixtures
│   ├── universal/                     # Universal fixtures (5)
│   │   ├── conformance-all-resources.json
│   │   ├── conformance-part1-only.json
│   │   ├── collection-info-all-resources.json
│   │   ├── collection-info-part1-only.json
│   │   └── collection-info-no-csapi.json
│   └── resources/                     # Resource-specific fixtures (18)
│       ├── systems/
│       │   ├── systems-collection-response.json
│       │   └── systems-item-response.json
│       ├── deployments/
│       │   ├── deployments-collection-response.json
│       │   └── deployments-item-response.json
│       ├── procedures/
│       │   ├── procedures-collection-response.json
│       │   └── procedures-item-response.json
│       ├── samplingfeatures/
│       │   ├── samplingfeatures-collection-response.json
│       │   └── samplingfeatures-item-response.json
│       ├── properties/
│       │   ├── properties-collection-response.json
│       │   └── properties-item-response.json
│       ├── datastreams/
│       │   ├── datastreams-collection-response.json
│       │   └── datastreams-item-response.json
│       ├── observations/
│       │   ├── observations-collection-response.json
│       │   └── observations-item-response.json
│       ├── controlstreams/
│       │   ├── controlstreams-collection-response.json
│       │   └── controlstreams-item-response.json
│       └── commands/
│           ├── commands-collection-response.json
│           └── commands-item-response.json
├── geojson-csapi/                     # Section 11 fixtures (~20)
│   ├── systems/
│   │   ├── system-weather-station-valid.json
│   │   ├── system-lidar-valid.json
│   │   ├── system-missing-uid.json
│   │   └── system-invalid-feature-type.json
│   ├── deployments/
│   │   ├── deployment-argo-valid.json
│   │   ├── deployment-drone-mission-valid.json
│   │   ├── deployment-missing-valid-time.json
│   │   └── deployment-invalid-valid-time-format.json
│   ├── procedures/
│   │   ├── procedure-temperature-method-valid.json
│   │   ├── procedure-sampling-protocol-valid.json
│   │   ├── procedure-has-geometry.json
│   │   └── procedure-invalid-procedure-type.json
│   ├── samplingfeatures/
│   │   ├── samplingfeature-vertical-profile-valid.json
│   │   ├── samplingfeature-point-sample-valid.json
│   │   ├── samplingfeature-missing-parent-system.json
│   │   └── samplingfeature-invalid-geometry-type.json
│   └── properties/
│       ├── property-temperature-valid.json
│       ├── property-wind-speed-valid.json
│       ├── property-has-geometry.json
│       └── property-missing-item-type.json
├── sensorml/                          # Section 9 fixtures (~25)
│   ├── physicalsystem/
│   │   ├── physicalsystem-weather-station.json
│   │   ├── physicalsystem-saildrone.json
│   │   ├── physicalsystem-lidar.json
│   │   ├── physicalsystem-missing-identifier.json
│   │   └── physicalsystem-invalid-type.json
│   ├── physicalcomponent/
│   │   ├── physicalcomponent-thermometer.json
│   │   ├── physicalcomponent-camera.json
│   │   └── physicalcomponent-invalid-io.json
│   ├── process/
│   │   ├── simpleprocess-windchill.json
│   │   ├── simpleprocess-coordinate-transform.json
│   │   ├── aggregateprocess-data-fusion.json
│   │   ├── aggregateprocess-sensor-calibration.json
│   │   └── aggregateprocess-invalid-components.json
│   └── composite/
│       ├── composite-system-mobile-platform.json
│       ├── composite-system-nested-3-levels.json
│       ├── composite-system-circular-reference.json
│       └── composite-system-invalid-component-type.json
├── swe-common/                        # Section 10 fixtures (~120)
│   ├── json/                          # JSON encoding (~40)
│   │   ├── scalars/
│   │   │   ├── boolean-motion-detected.json
│   │   │   ├── text-manufacturer.json
│   │   │   ├── category-geological-period.json
│   │   │   ├── count-pixel-count.json
│   │   │   ├── quantity-temperature.json
│   │   │   ├── quantity-radiance.json
│   │   │   ├── time-sampling-time-gregorian.json
│   │   │   └── time-unix-timestamp.json
│   │   ├── ranges/
│   │   │   ├── category-range-era-range.json
│   │   │   ├── count-range-array-index.json
│   │   │   ├── quantity-range-latitude.json
│   │   │   └── time-range-survey-period.json
│   │   ├── records/
│   │   │   ├── datarecord-weather-data.json
│   │   │   ├── datarecord-camera-calibration.json
│   │   │   ├── vector-location-2d.json
│   │   │   ├── vector-location-3d.json
│   │   │   └── vector-velocity.json
│   │   ├── choice/
│   │   │   └── datachoice-message-types.json
│   │   ├── arrays/
│   │   │   ├── dataarray-calibration-curve.json
│   │   │   ├── dataarray-trajectory.json
│   │   │   ├── dataarray-image-2d.json
│   │   │   ├── dataarray-profile-series.json
│   │   │   ├── matrix-stress-3x3.json
│   │   │   └── matrix-rotation.json
│   │   ├── streams/
│   │   │   ├── datastream-weather.json
│   │   │   ├── datastream-navigation.json
│   │   │   ├── datastream-choice-messages.json
│   │   │   └── datastream-geometry-detections.json
│   │   ├── geometry/
│   │   │   ├── geometry-point.json
│   │   │   ├── geometry-linestring.json
│   │   │   └── geometry-polygon.json
│   │   └── errors/
│   │       ├── invalid-structure.json
│   │       ├── missing-required-field.json
│   │       ├── wrong-type.json
│   │       ├── invalid-component.json
│   │       └── array-instead-of-object.json
│   ├── text/                          # Text encoding (~40)
│   │   ├── arrays/
│   │   │   ├── dataarray-calibration-curve.csv
│   │   │   ├── dataarray-trajectory.csv
│   │   │   ├── dataarray-profile-series.csv
│   │   │   └── matrix-stress-3x3.csv
│   │   ├── streams/
│   │   │   ├── datastream-weather.csv
│   │   │   ├── datastream-navigation-optional.csv
│   │   │   ├── datastream-choice-messages.csv
│   │   │   └── datastream-geometry-detections.csv
│   │   └── (... 30+ more covering all component types)
│   └── binary/                        # Binary encoding (~40)
│       ├── arrays/
│       │   ├── dataarray-calibration-curve.bin
│       │   ├── dataarray-trajectory.bin
│       │   └── dataarray-large-dataset.bin
│       ├── streams/
│       │   ├── datastream-weather.bin
│       │   ├── datastream-navigation.bin
│       │   └── datastream-large-dataset.bin
│       └── (... 30+ more covering all data types)
├── integration/                       # Section 14 fixtures (33)
│   ├── discovery/
│   │   ├── discovery-root-landing-page.json
│   │   ├── discovery-conformance.json
│   │   ├── discovery-collections.json
│   │   ├── discovery-systems-collection.json
│   │   ├── discovery-weather-station.json
│   │   ├── discovery-thermometer-component.json
│   │   ├── discovery-datastreams-for-system.json
│   │   └── discovery-temp-datastream.json
│   ├── observations/
│   │   ├── observation-property-temperature.json
│   │   ├── observation-datastream-temp-series.json
│   │   ├── observation-observations-collection.json
│   │   ├── observation-observation-single.json
│   │   ├── observation-foi-location.json
│   │   ├── observation-sensorml-procedure.json
│   │   ├── observation-swe-datarecord.json
│   │   ├── observation-swe-values-json.json
│   │   ├── observation-swe-values-text.csv
│   │   └── observation-swe-values-binary.bin
│   ├── commands/
│   │   ├── command-controlstream.json
│   │   ├── command-commands-collection.json
│   │   ├── command-command-history.json
│   │   ├── command-tasking-capability.json
│   │   ├── command-parameter-schema.json
│   │   ├── command-post-request.json
│   │   ├── command-post-response.json
│   │   └── command-command-status.json
│   └── navigation/
│       ├── navigation-system-mobile-platform.json
│       ├── navigation-deployment-mission.json
│       ├── navigation-subsystems-collection.json
│       ├── navigation-subsystem-camera.json
│       ├── navigation-samplingfeatures-for-system.json
│       ├── navigation-samplingfeature-vertical-profile.json
│       └── navigation-circular-reference-error.json
└── errors/                            # Error and edge case fixtures (~30)
    ├── empty/
    │   ├── empty-collection-systems.json
    │   ├── empty-collection-observations.json
    │   ├── null-geometry-procedure.json
    │   ├── null-geometry-system.json
    │   ├── null-properties-error.json
    │   ├── empty-links-array.json
    │   └── empty-datastream-values.json
    ├── invalid/
    │   ├── invalid-uri-format-system.json
    │   ├── invalid-vocabulary-system-type.json
    │   ├── invalid-temporal-period-deployment.json
    │   ├── invalid-geojson-feature-structure.json
    │   └── invalid-sensorml-missing-identifier.json
    ├── schema-violations/
    │   ├── schema-violation-missing-required-field.json
    │   ├── schema-violation-wrong-type.json
    │   ├── schema-violation-extra-property.json
    │   ├── schema-violation-swe-invalid-component.json
    │   └── schema-violation-array-instead-of-object.json
    ├── http-errors/
    │   ├── error-404-resource-not-found.json
    │   ├── error-400-invalid-query-parameter.json
    │   ├── error-400-invalid-request-body.json
    │   ├── error-500-internal-server-error.json
    │   ├── error-503-service-unavailable.json
    │   ├── error-401-unauthorized.json
    │   ├── error-403-forbidden.json
    │   └── error-409-conflict.json
    └── extreme/
        ├── large-collection-1000-items.json
        ├── large-observation-values-10000-points.json
        └── deep-nested-system-10-levels.json
```

**Total Directory Count:** ~30 directories
**Total File Count:** ~280 fixture files

### 5.2 Alternative Organizations Considered

**By Resource Type (Rejected):**
```
fixtures/
├── systems/
├── deployments/
├── procedures/
├── ...
```
**Rejection Reason:** Doesn't align with test organization; mixes unit and integration fixtures

**By Format (Rejected):**
```
fixtures/
├── json/
├── text/
├── binary/
```
**Rejection Reason:** Too flat; doesn't distinguish test types; hard to navigate

**By Section Number (Rejected):**
```
fixtures/
├── section-08/
├── section-09/
├── section-10/
```
**Rejection Reason:** Obscures purpose; requires knowledge of research section mapping

---

## 6. File Naming Conventions

### 6.1 Naming Pattern

**General Pattern:**
```
<category>-<subcategory>-<variant>.<extension>
```

**Components:**
- **category**: Primary classifier (system, deployment, datastream, etc.)
- **subcategory**: Secondary classifier (type, workflow step, component type)
- **variant**: Differentiator (valid, invalid, error, edge case indicator)
- **extension**: File format (.json, .csv, .bin)

**Examples:**
- `system-weather-station-valid.json` (valid GeoJSON feature)
- `deployment-argo-missing-valid-time.json` (error case)
- `datastream-weather.csv` (SWE text encoding)
- `observation-swe-values-binary.bin` (SWE binary encoding)

### 6.2 Naming Rules

**MUST:**
- Use lowercase letters only
- Use hyphens for word separation (kebab-case)
- Include variant indicator for error/edge cases (valid/invalid/missing-X/error-XXX)
- Match extension to content format (.json, .csv, .bin)
- Use descriptive, self-documenting names

**MUST NOT:**
- Use underscores (prefer hyphens)
- Use spaces (use hyphens instead)
- Use abbreviations unless standardized (temp OK, tmprtr NOT OK)
- Use generic names (data.json, test.json, fixture1.json)

**MAY:**
- Include resource type prefix for clarity (system-, deployment-)
- Include workflow step indicator (discovery-, observation-, command-)
- Include encoding type for SWE fixtures (json, text, binary subdirectories sufficient)

### 6.3 Variant Indicators

**Valid Fixtures:**
- `-valid` suffix (explicit variant indicator)
- OR no suffix if context is unambiguous (e.g., `datastream-weather.json`)

**Invalid Fixtures (Error Cases):**
- `-missing-<field>` (e.g., `system-missing-uid.json`)
- `-invalid-<aspect>` (e.g., `deployment-invalid-valid-time-format.json`)
- `-error-<code>` (e.g., `error-404-resource-not-found.json`)

**Edge Case Fixtures:**
- `-empty` (e.g., `empty-collection-systems.json`)
- `-null-<aspect>` (e.g., `null-geometry-procedure.json`)
- `-large` (e.g., `large-collection-1000-items.json`)
- `-deep` (e.g., `deep-nested-system-10-levels.json`)

### 6.4 Extension Mapping

| Extension | Content Type | Description |
|-----------|--------------|-------------|
| `.json` | JSON | Standard JSON files (CSAPI, GeoJSON, SensorML, SWE JSON) |
| `.csv` | Text (CSV) | SWE Common text encoding (comma/newline separated) |
| `.bin` | Binary (base64) | SWE Common binary encoding (base64-encoded) |
| `.txt` | Plain Text | Non-CSV text files (if needed) |

---

## 7. Fixture Metadata and Provenance

### 7.1 Metadata Requirements

**Each fixture file should include embedded metadata** (where format allows):

**JSON Fixtures:**
```json
{
  "$schema": "https://schemas.opengis.net/...",
  "$metadata": {
    "source": "SWE Common 3.0 Specification Annex B.2.1",
    "sourceURL": "https://docs.ogc.org/is/24-014/24-014.html#enc_json_examples",
    "created": "2025-01-31",
    "modified": "2025-01-31",
    "createdBy": "research-automation",
    "validationStatus": "schema-valid",
    "validatedDate": "2025-01-31",
    "purpose": "Unit test for SWE DataArray JSON encoding",
    "relatedFixtures": [
      "dataarray-calibration-curve.csv",
      "dataarray-calibration-curve.bin"
    ],
    "notes": "Based on calibration table example from SWE spec"
  },
  "type": "DataArray",
  "definition": "http://sweet.jpl.nasa.gov/2.0/mathFunction.owl#Function",
  ...
}
```

**CSV/Binary Fixtures:**
- Accompany with sidecar `.meta.json` file:
  - `datastream-weather.csv`
  - `datastream-weather.csv.meta.json` ← sidecar metadata

**Sidecar Metadata Example:**
```json
{
  "fixtureFile": "datastream-weather.csv",
  "source": "SWE Common 3.0 Specification Annex B.1.2",
  "sourceURL": "https://docs.ogc.org/is/24-014/24-014.html#enc_text_examples",
  "created": "2025-01-31",
  "modified": "2025-01-31",
  "createdBy": "research-automation",
  "validationStatus": "schema-valid",
  "validatedDate": "2025-01-31",
  "purpose": "Unit test for SWE DataStream text encoding",
  "relatedFixtures": [
    "datastream-weather.json",
    "datastream-weather.bin"
  ],
  "descriptor": "datastream-weather-descriptor.json",
  "notes": "CSV encoding of weather datastream with time, temp, press, windSpeed, windDir fields"
}
```

### 7.2 Provenance Tracking

**SOURCES.md File Structure:**

```markdown
# Fixture Library Sources and Provenance

## Specification Sources

### CSAPI Part 1 & 2
- **URL:** [CSAPI Specification](link)
- **Fixtures:** 25+
- **Extraction Date:** 2025-02-01
- **Files:** (list of fixture files)

### SensorML 3.0 (OGC 23-000)
- **URL:** https://docs.ogc.org/is/23-000/23-000.html
- **Schema Repository:** https://schemas.opengis.net/sensorML/3.0/json/
- **Example Repository:** https://schemas.opengis.net/sensorML/3.0/json/examples/
- **Fixtures:** ~20 from spec, ~5 hand-crafted
- **Extraction Date:** 2025-02-01
- **Files:**
  - physicalsystem-weather-station.json (Spec Clause X.X)
  - physicalsystem-saildrone.json (Spec Annex B deployment example)
  - ...

### SWE Common 3.0 (OGC 24-014)
- **URL:** https://docs.ogc.org/is/24-014/24-014.html
- **Schema Repository:** https://schemas.opengis.net/sweCommon/3.0/json/
- **Fixtures:** ~100 from spec examples, ~20 hand-crafted
- **Extraction Date:** 2025-02-01
- **Primary Sources:**
  - Annex B.1: Text Encoding Rules Examples
  - Annex B.2: JSON Encoding Rules Examples
  - Clause 10.4: Binary Encoding Rules (hand-crafted based on spec)
- **Files:**
  - dataarray-calibration-curve.json (Annex B.2.1)
  - datastream-weather.json (Annex B.2.2)
  - datastream-weather.csv (Annex B.1.2)
  - ...

## Hand-Crafted Fixtures

### GeoJSON CSAPI Features
- **Basis:** CSAPI Part 1 property requirements + RFC 7946
- **Fixtures:** ~20
- **Creation Date:** 2025-02-05
- **Files:** (list)

### Integration Workflow Fixtures
- **Basis:** Section 14 workflow scenarios
- **Fixtures:** 33
- **Creation Date:** 2025-02-10
- **Files:** (list)

### Error and Edge Case Fixtures
- **Basis:** Common error scenarios and edge conditions
- **Fixtures:** ~30
- **Creation Date:** 2025-02-12
- **Files:** (list)

## Unavailable Sources

### OpenSensorHub Demo Server
- **URL:** http://sensiasoft.net:8181/sensorhub/api/
- **Status:** ❌ Unavailable (404 error as of 2025-01-31)
- **Impact:** Cannot source live sensor data examples
- **Mitigation:** Using specification examples and hand-crafted fixtures

### 52°North Server
- **Status:** ⏳ Not yet accessed
- **Planned:** May access as alternative source for live data examples
```

### 7.3 Validation Status Tracking

**Validation States:**
- `not-validated` - Fixture created but not yet validated
- `schema-valid` - Passes JSON schema validation
- `spec-compliant` - Validated against specification requirements
- `test-verified` - Used in passing tests
- `invalid-by-design` - Error case fixture (expected to fail validation)

**Validation Log Example** (`fixtures/VALIDATION.md`):

```markdown
# Fixture Validation Log

| Fixture | Validation Status | Last Validated | Validator | Notes |
|---------|------------------|----------------|-----------|-------|
| system-weather-station-valid.json | spec-compliant | 2025-02-01 | ajv + custom | CSAPI property validation passed |
| deployment-argo-valid.json | schema-valid | 2025-02-01 | ajv | Basic schema only |
| procedure-has-geometry.json | invalid-by-design | 2025-02-02 | - | Error fixture (procedures should have null geometry) |
| datastream-weather.csv | spec-compliant | 2025-02-03 | custom CSV parser | SWE text encoding validated |
| ... | ... | ... | ... | ... |
```

---

## 8. Reusability Patterns

### 8.1 Universal Fixtures

**QueryBuilder Universal Fixtures** (Section 12 = Section 13 universal):
- `conformance-all-resources.json` ← shared by QueryBuilder and Resource Method tests
- `conformance-part1-only.json` ← shared
- `collection-info-all-resources.json` ← shared
- `collection-info-part1-only.json` ← shared
- `collection-info-no-csapi.json` ← shared

**Reuse Strategy:**
- Store in single location: `fixtures/csapi-querybuilder/universal/`
- Reference from both QueryBuilder tests and Resource Method tests
- Update once, benefits both test suites

**Test Import Example:**
```typescript
// In QueryBuilder tests
import conformanceAll from '../../fixtures/csapi-querybuilder/universal/conformance-all-resources.json';

// In Resource Method tests (same import path)
import conformanceAll from '../../fixtures/csapi-querybuilder/universal/conformance-all-resources.json';
```

### 8.2 Cross-Format Fixtures (SWE Common)

**Logical Equivalence:** Same datastream encoded in 3 formats

**Example: Weather Datastream**
- `datastream-weather.json` (JSON encoding)
- `datastream-weather.csv` (text encoding)
- `datastream-weather.bin` (binary encoding)

**Reuse Strategy:**
- Create master descriptor in JSON
- Generate text and binary variants programmatically (if tooling available)
- OR hand-craft all three with careful cross-validation
- Document equivalence in metadata `relatedFixtures` field

**Validation:**
- Parse all three encodings
- Assert decoded values are identical
- Ensures consistency across encoding formats

### 8.3 Integration Workflow Fixtures vs Unit Test Fixtures

**Potential Overlap:**
- Integration workflow fixtures (Section 14) include full resource responses
- Resource method fixtures (Section 13) also include resource responses

**Reuse Strategy:**
- **PREFER:** Create separate fixtures for each use case (avoid tight coupling)
- **RATIONALE:** Integration fixtures may include additional metadata (e.g., embedded links) that unit tests don't need
- **EXCEPTION:** If fixtures are identical, use symbolic links or reference integration fixtures from unit tests

**Directory Isolation:**
- `fixtures/csapi-querybuilder/resources/` ← unit test fixtures
- `fixtures/integration/discovery/` ← integration workflow fixtures
- May contain similar content but optimized for different test contexts

### 8.4 Fixture Composition

**Composite Fixtures:** Build complex fixtures from simpler components

**Example: Composite System**
- Base component: `physicalcomponent-thermometer.json`
- Base component: `physicalcomponent-camera.json`
- Composite: `physicalsystem-mobile-platform.json` references components

**Implementation:**
- Composite fixture embeds components inline OR
- Composite fixture references components by ID (if using href links)

**Benefits:**
- DRY principle (don't repeat component definitions)
- Easier maintenance (update component once)
- Realistic (mirrors actual CSAPI resource composition)

---

## 9. Maintenance and Update Procedures

### 9.1 Specification Updates

**Trigger:** New version of CSAPI, SensorML, or SWE Common specification released

**Procedure:**
1. **Identify changed examples** in new specification version
2. **Extract new examples** from updated spec
3. **Update affected fixtures** to match new schema/requirements
4. **Run validation suite** to ensure backward compatibility
5. **Update metadata** (sourceURL, modified date, notes)
6. **Re-run tests** to verify fixtures still support test requirements
7. **Document breaking changes** in `fixtures/CHANGELOG.md`

**Estimated Frequency:** Annually (OGC specifications typically stable)

### 9.2 Schema Changes

**Trigger:** JSON schemas updated (CSAPI, SensorML, SWE Common)

**Procedure:**
1. **Update schema references** in fixture `$schema` fields
2. **Re-validate all fixtures** against new schemas
3. **Fix validation errors** (update fixtures to match new schema)
4. **Update validation status** in metadata
5. **Document schema version** in `SOURCES.md`

**Automated Validation:**
```bash
# Validate all JSON fixtures against schemas
npm run validate:fixtures

# Output:
# ✓ fixtures/csapi-querybuilder/universal/conformance-all-resources.json (schema-valid)
# ✗ fixtures/geojson-csapi/systems/system-weather-station-valid.json (schema-invalid: missing required property 'uid')
```

### 9.3 Test Requirement Changes

**Trigger:** Test requirements evolve (new test scenarios, coverage gaps identified)

**Procedure:**
1. **Identify new fixture requirements** from test design
2. **Source or create new fixtures** following sourcing strategy
3. **Add to appropriate directory** following organization structure
4. **Update fixture inventory** in this document (Section 2)
5. **Update test imports** to reference new fixtures

**Example:**
- Test identifies need for "system with 100 datastreams" (performance test)
- Create `large-system-100-datastreams.json` in `fixtures/errors/extreme/`
- Update inventory: Add to "Extreme Value Edge Cases" category
- Import in performance test suite

### 9.4 Fixture Deprecation

**Trigger:** Fixture no longer needed (test removed, requirement changed)

**Procedure:**
1. **Mark fixture as deprecated** (add `"deprecated": true` to metadata)
2. **Document deprecation reason** (metadata `notes` field)
3. **Move to `fixtures/deprecated/` directory** (or delete if truly obsolete)
4. **Remove test imports** (ensure no tests reference deprecated fixture)
5. **Update fixture inventory** (this document)

**Deprecation Example:**
```json
{
  "$metadata": {
    "deprecated": true,
    "deprecationDate": "2025-03-15",
    "deprecationReason": "Replaced by system-weather-station-valid-v2.json with updated property schema",
    "replacedBy": "system-weather-station-valid-v2.json"
  },
  ...
}
```

### 9.5 Periodic Review

**Frequency:** Quarterly

**Review Checklist:**
- [ ] **Fixture count** matches inventory (Section 2)
- [ ] **Validation status** up-to-date for all fixtures
- [ ] **No broken links** in integration workflow fixtures (href values resolve)
- [ ] **No orphaned fixtures** (fixtures not referenced by any test)
- [ ] **Schema versions** documented and current
- [ ] **Source URLs** still accessible (specs haven't moved)
- [ ] **Metadata completeness** (all fixtures have proper metadata)

**Review Output:** Update `fixtures/REVIEW.md` with findings and actions

---

## 10. Fixture Validation Requirements

### 10.1 Schema Validation

**JSON Schema Validators:**
- **Tool:** Ajv (Another JSON Schema Validator) - https://ajv.js.org/
- **Usage:**
  ```typescript
  import Ajv from 'ajv';
  import csapiSchema from './schemas/csapi-system.json';
  import systemFixture from './fixtures/geojson-csapi/systems/system-weather-station-valid.json';
  
  const ajv = new Ajv();
  const validate = ajv.compile(csapiSchema);
  const valid = validate(systemFixture);
  
  if (!valid) {
    console.error(validate.errors);
  }
  ```

**Schema Sources:**
- **CSAPI:** JSON schemas from CSAPI specification (if available) or hand-crafted
- **GeoJSON:** `@types/geojson` TypeScript definitions
- **SensorML:** https://schemas.opengis.net/sensorML/3.0/json/
- **SWE Common:** https://schemas.opengis.net/sweCommon/3.0/json/

**Validation Scope:**
- **MUST validate:** All "valid" fixtures (should pass schema validation)
- **MAY NOT validate:** "invalid" and "error" fixtures (expected to fail)
- **MUST document:** Validation status in fixture metadata

### 10.2 Semantic Validation

**Beyond Schema:** Validate CSAPI-specific semantics

**Validation Rules:**
- **URI format:** `uid` property is valid URI
- **Vocabulary values:** `featureType`, `systemType`, etc. from controlled vocabularies
- **Temporal periods:** `validTime` is valid ISO8601 period (start/end or start/null)
- **Link integrity:** `href` values in `links` array are valid URLs (for integration fixtures)
- **Geometry constraints:** Non-spatial resources (Procedures, Properties) have `null` geometry
- **Required properties:** All required CSAPI properties present

**Custom Validator Example:**
```typescript
function validateCSAPISystem(feature: SystemFeature): ValidationResult {
  const errors: string[] = [];
  
  // Validate uid is URI
  if (!isValidURI(feature.properties.uid)) {
    errors.push('uid must be valid URI');
  }
  
  // Validate featureType from vocabulary
  if (!VALID_FEATURE_TYPES.includes(feature.properties.featureType)) {
    errors.push(`featureType '${feature.properties.featureType}' not in vocabulary`);
  }
  
  // Validate systemType (optional but must be from vocab if present)
  if (feature.properties.systemType && !VALID_SYSTEM_TYPES.includes(feature.properties.systemType)) {
    errors.push(`systemType '${feature.properties.systemType}' not in vocabulary`);
  }
  
  return { valid: errors.length === 0, errors };
}
```

### 10.3 Integration Validation

**Link Integrity:** Validate integration workflow fixture chains

**Validation Rules:**
- **Link resolution:** All `href` values in workflow fixtures resolve to other fixtures in chain
- **Consistent IDs:** Resource IDs match across fixtures (e.g., system ID in discovery fixture matches system ID in datastream fixture)
- **Complete workflows:** Each workflow has all required fixtures (root → final step)

**Example Validation:**
```typescript
// Validate discovery workflow link chain
const landingPage = require('./fixtures/integration/discovery/discovery-root-landing-page.json');
const conformance = require('./fixtures/integration/discovery/discovery-conformance.json');

// Check that landing page conformance link points to conformance fixture
const conformanceLink = landingPage.links.find(l => l.rel === 'conformance');
expect(conformanceLink.href).toBe('/conformance'); // Mock server path

// Check that conformance fixture exists and has expected structure
expect(conformance).toHaveProperty('conformsTo');
expect(conformance.conformsTo).toBeInstanceOf(Array);
```

### 10.4 Automated Validation Pipeline

**CI/CD Integration:**
```yaml
# .github/workflows/validate-fixtures.yml
name: Validate Fixtures

on:
  pull_request:
    paths:
      - 'fixtures/**'
  push:
    paths:
      - 'fixtures/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run validate:fixtures:schema
      - run: npm run validate:fixtures:semantic
      - run: npm run validate:fixtures:integration
```

**Validation Scripts** (`package.json`):
```json
{
  "scripts": {
    "validate:fixtures:schema": "ts-node scripts/validate-schema.ts",
    "validate:fixtures:semantic": "ts-node scripts/validate-semantic.ts",
    "validate:fixtures:integration": "ts-node scripts/validate-integration.ts",
    "validate:fixtures": "npm run validate:fixtures:schema && npm run validate:fixtures:semantic && npm run validate:fixtures:integration"
  }
}
```

---

## 11. Sourcing Execution Plan

### 11.1 Phase 1: Specification Extraction (Weeks 1-2)

**Week 1: CSAPI and SensorML**

**Day 1-2: CSAPI Specification**
- [ ] Download/access CSAPI Part 1 & 2 specifications
- [ ] Identify example sections (Annex B, inline examples)
- [ ] Extract 25+ JSON examples
- [ ] Create fixture files in `fixtures/csapi-spec/` (or integrate into existing structure)
- [ ] Validate against schemas
- [ ] Update metadata with source URLs

**Day 3-5: SensorML 3.0**
- [ ] Access SensorML 3.0 spec at https://docs.ogc.org/is/23-000/23-000.html
- [ ] Check JSON example repository: https://schemas.opengis.net/sensorML/3.0/json/examples/
- [ ] Download or extract examples from spec document
- [ ] Create ~20 fixtures in `fixtures/sensorml/`
- [ ] Validate against SensorML JSON schemas
- [ ] Update metadata with source URLs

**Week 2: SWE Common 3.0**

**Day 1-3: SWE Common JSON Encoding**
- [ ] Access SWE Common 3.0 spec at https://docs.ogc.org/is/24-014/24-014.html
- [ ] Extract JSON examples from Annex B.2 (B.2.1 through B.2.8)
- [ ] Create ~35 JSON fixtures in `fixtures/swe-common/json/`
- [ ] Validate against SWE Common JSON schemas

**Day 4-5: SWE Common Text and Binary**
- [ ] Extract text encoding examples from Annex B.1 (B.1.1 through B.1.7)
- [ ] Create ~35 CSV fixtures in `fixtures/swe-common/text/`
- [ ] Document binary encoding requirements from Clause 10.4
- [ ] Plan binary fixture creation (defer to hand-crafting phase)

**Deliverable (End of Week 2):**
- ~170 fixtures extracted from specifications
- All validated against schemas
- Metadata complete with source URLs
- Documented in `SOURCES.md`

### 11.2 Phase 2: Hand-Crafted Fixtures (Weeks 3-4)

**Week 3: GeoJSON CSAPI and QueryBuilder**

**Day 1-2: GeoJSON CSAPI Features**
- [ ] Create valid System features (4)
- [ ] Create valid Deployment features (4)
- [ ] Create valid Procedure features (4)
- [ ] Create valid SamplingFeature features (4)
- [ ] Create valid Property features (4)
- [ ] Total: 20 fixtures in `fixtures/geojson-csapi/`

**Day 3: QueryBuilder and Resource Methods**
- [ ] Create 5 universal fixtures in `fixtures/csapi-querybuilder/universal/`
- [ ] Create 18 resource-specific fixtures in `fixtures/csapi-querybuilder/resources/`
- [ ] Total: 23 fixtures

**Day 4-5: Error and Edge Cases**
- [ ] Create 9 empty/null fixtures
- [ ] Create 5 invalid data fixtures
- [ ] Create 5 schema violation fixtures
- [ ] Create 8 HTTP error fixtures
- [ ] Create 3 extreme value fixtures
- [ ] Total: 30 fixtures in `fixtures/errors/`

**Week 4: Integration Workflows and SWE Binary**

**Day 1: Discovery and Observation Workflows**
- [ ] Create 8 discovery fixtures in `fixtures/integration/discovery/`
- [ ] Create 10 observation fixtures in `fixtures/integration/observations/`

**Day 2: Command and Navigation Workflows**
- [ ] Create 8 command fixtures in `fixtures/integration/commands/`
- [ ] Create 7 navigation fixtures in `fixtures/integration/navigation/`

**Day 3-5: SWE Common Binary Encoding**
- [ ] Create ~35 binary fixtures based on JSON equivalents
- [ ] Base64-encode binary data
- [ ] Create sidecar metadata files
- [ ] Validate against descriptors
- [ ] Total: ~35 fixtures in `fixtures/swe-common/binary/`

**Deliverable (End of Week 4):**
- ~110 hand-crafted fixtures
- All validated (valid fixtures) or documented as invalid-by-design (error fixtures)
- Metadata complete
- Cross-references established (relatedFixtures)

### 11.3 Phase 3: Validation and Integration (Week 5)

**Day 1: Automated Validation**
- [ ] Set up Ajv schema validator
- [ ] Create validation scripts (schema, semantic, integration)
- [ ] Run validation on all ~280 fixtures
- [ ] Document validation results in `VALIDATION.md`
- [ ] Fix validation errors (iterate as needed)

**Day 2: Metadata Completion**
- [ ] Verify all fixtures have complete metadata
- [ ] Update `SOURCES.md` with all sources and provenance
- [ ] Create `CHANGELOG.md` for fixture library
- [ ] Document validation status for all fixtures

**Day 3: Integration Testing**
- [ ] Import fixtures into test files
- [ ] Run unit tests with fixture library
- [ ] Run integration tests with workflow fixtures
- [ ] Verify fixtures support all test requirements

**Day 4: Documentation**
- [ ] Update this document (Section 15) with final fixture counts
- [ ] Create `fixtures/README.md` with library overview
- [ ] Document reusability patterns and maintenance procedures
- [ ] Create fixture usage examples for developers

**Day 5: Final Review and Commit**
- [ ] Peer review fixture library
- [ ] Validate directory structure
- [ ] Verify naming conventions
- [ ] Commit all fixtures to repository
- [ ] Update research plan (Section 15 complete)

**Deliverable (End of Week 5):**
- Complete validated fixture library (~280 fixtures)
- Comprehensive documentation (README, SOURCES, VALIDATION, CHANGELOG)
- Integration with test suites verified
- Ready for use in test implementation (ROADMAP Phase 4)

---

## 12. Implementation Priorities

### 12.1 Critical Path Fixtures (High Priority)

**Must Have for MVP Testing:**

**QueryBuilder and Resource Methods (28 fixtures):**
- 5 universal fixtures (conformance, collection-info)
- 18 resource-specific fixtures (9 types × 2 each)
- 5 basic error fixtures (404, 400, empty collection, etc.)
- **Rationale:** Core CSAPI functionality depends on these; blocks unit tests

**GeoJSON CSAPI Valid Features (10 fixtures):**
- 2 valid fixtures per resource type (Systems, Deployments, Procedures, SamplingFeatures, Properties)
- **Rationale:** Property extraction and validation tests require valid examples

**Integration Discovery Workflow (8 fixtures):**
- Complete discovery workflow chain (root → collections → system → datastream)
- **Rationale:** Most common user workflow; demonstrates full API navigation

**Total Critical Path:** **46 fixtures** (~55 hours effort)

### 12.2 High Priority Fixtures

**Needed for Comprehensive Testing:**

**SensorML Core Fixtures (~15 fixtures):**
- PhysicalSystem (3 valid, 2 error)
- PhysicalComponent (2 valid, 1 error)
- SimpleProcess (2 valid)
- AggregateProcess (2 valid)
- Composite systems (3 valid)
- **Rationale:** SensorML parser testing requires diverse examples

**SWE Common JSON Encoding (~40 fixtures):**
- All component types (scalars, ranges, records, arrays, streams)
- Error cases included
- **Rationale:** SWE parser testing depends on comprehensive coverage

**Integration Observation Workflow (10 fixtures):**
- Complete observation retrieval workflow
- **Rationale:** Second most common workflow; demonstrates datastream access

**Total High Priority:** **65 fixtures** (~80 hours effort)

### 12.3 Medium Priority Fixtures

**Valuable but Can Be Deferred:**

**GeoJSON CSAPI Invalid Features (10 fixtures):**
- Error cases for each resource type
- **Rationale:** Error handling tests are important but MVP can proceed without

**SWE Common Text Encoding (~40 fixtures):**
- CSV encoding of all component types
- **Rationale:** Format variation testing; lower priority than JSON

**Integration Command and Navigation Workflows (15 fixtures):**
- Command submission workflow (8)
- Cross-resource navigation (7)
- **Rationale:** Advanced workflows; defer until core workflows tested

**SensorML Error and Composite Fixtures (~10 fixtures):**
- Error cases and complex compositions
- **Rationale:** Edge case testing; not needed for basic parser validation

**Total Medium Priority:** **75 fixtures** (~85 hours effort)

### 12.4 Low Priority Fixtures

**Nice to Have / Future Enhancements:**

**SWE Common Binary Encoding (~40 fixtures):**
- Base64-encoded binary datastreams
- **Rationale:** Performance and encoding variation; can defer until optimization phase

**Extreme Edge Cases (~30 fixtures):**
- Large collections (1000 items)
- Deep nesting (10 levels)
- Circular references
- **Rationale:** Performance and stress testing; defer until MVP complete

**Total Low Priority:** **70 fixtures** (~70 hours effort)

### 12.5 Phased Implementation Timeline

**Phase 1 (MVP):** Critical Path + High Priority = **111 fixtures (~135 hours / ~3.5 weeks)**
- Supports core unit tests
- Supports integration discovery and observation workflows
- Enables SensorML and SWE JSON parser testing

**Phase 2 (Complete):** Medium Priority = **75 fixtures (~85 hours / ~2 weeks)**
- Adds error case coverage
- Adds SWE text encoding support
- Adds advanced workflows (command, navigation)

**Phase 3 (Comprehensive):** Low Priority = **70 fixtures (~70 hours / ~2 weeks)**
- Adds SWE binary encoding support
- Adds performance and stress test fixtures
- Achieves full fixture library coverage

**Total Effort:** **256 fixtures, ~290 hours, ~7.5 weeks**

---

## 13. Risk Assessment and Mitigation

### 13.1 Sourcing Risks

**Risk 1: Specification Examples Insufficient**
- **Likelihood:** Medium
- **Impact:** High (delay in fixture creation)
- **Mitigation:**
  - Supplement spec examples with hand-crafted fixtures
  - Use 52°North server as alternative source (if accessible)
  - Consult OGC community resources (GitHub repositories, forums)

**Risk 2: Live Servers Unavailable**
- **Likelihood:** High (OpenSensorHub already 404)
- **Impact:** Medium (lose access to realistic live data)
- **Mitigation:**
  - ✅ Already mitigated: Primary source is specifications, not live servers
  - Hand-craft realistic fixtures based on spec examples
  - Document unavailability in SOURCES.md

**Risk 3: Specification URLs Change**
- **Likelihood:** Low
- **Impact:** Medium (broken source links in metadata)
- **Mitigation:**
  - Use persistent OGC URLs (https://docs.ogc.org/is/...)
  - Document spec version numbers in metadata
  - Periodically verify source URLs (quarterly review)

### 13.2 Maintenance Risks

**Risk 4: Schema Updates Break Fixtures**
- **Likelihood:** Medium (schemas evolve with spec versions)
- **Impact:** High (fixture library becomes invalid)
- **Mitigation:**
  - Automated validation pipeline (CI/CD)
  - Pin schema versions in fixture metadata
  - Maintain fixture changelog for breaking changes
  - Budget time for fixture updates (annually)

**Risk 5: Fixture Drift from Tests**
- **Likelihood:** Medium (tests evolve independently of fixtures)
- **Impact:** Medium (tests fail or use outdated fixtures)
- **Mitigation:**
  - Periodic review (quarterly) to identify orphaned fixtures
  - Test imports reference fixtures explicitly (no wildcards)
  - Document fixture usage in test files

**Risk 6: Fixture Proliferation**
- **Likelihood:** High (natural growth over time)
- **Impact:** Medium (fixture library becomes unwieldy)
- **Mitigation:**
  - Strict naming conventions (Section 6)
  - Directory structure enforced (Section 5)
  - Regular deprecation of unused fixtures (Section 9.4)
  - Documentation of fixture count and inventory (this document)

### 13.3 Validation Risks

**Risk 7: Invalid Fixtures Used in Tests**
- **Likelihood:** Medium (fixtures not validated before use)
- **Impact:** High (tests pass with invalid data)
- **Mitigation:**
  - ✅ Automated validation pipeline (Section 10.4)
  - CI/CD blocks merge if validation fails
  - Metadata tracks validation status
  - Periodic re-validation (quarterly)

**Risk 8: Semantic Validation Gaps**
- **Likelihood:** Medium (schema validation insufficient)
- **Impact:** Medium (tests miss CSAPI-specific errors)
- **Mitigation:**
  - Custom semantic validators (Section 10.2)
  - Vocabulary validation against controlled lists
  - Link integrity validation for integration fixtures

### 13.4 Effort Estimation Risks

**Risk 9: Effort Underestimated**
- **Likelihood:** High (fixture creation time varies)
- **Impact:** Medium (delays in test implementation)
- **Mitigation:**
  - Detailed effort estimation (Section 2.2)
  - Phased implementation (Section 12.5)
  - Focus on critical path first (Section 12.1)
  - Buffer time for complex fixtures (SWE binary encoding)

**Risk 10: Complexity Underestimated**
- **Likelihood:** Medium (especially for SWE binary encoding)
- **Impact:** Medium (fixtures take longer to create)
- **Mitigation:**
  - Start with simple fixtures (scalars, basic records)
  - Progress to complex fixtures (binary encoding, composite systems)
  - Seek community examples for complex encodings
  - Document complexity in metadata for future reference

---

## 14. Success Criteria

### 14.1 Completeness Criteria

**Fixture Count Targets:**
- [ ] **Minimum 280 fixtures** created across all categories
- [ ] **All 9 CSAPI resource types** represented
- [ ] **All 3 SWE encoding formats** covered (JSON, Text, Binary)
- [ ] **All 5 SensorML process types** represented
- [ ] **All 4 integration workflows** have complete fixture chains

**Coverage Criteria:**
- [ ] **100% critical path fixtures** (Section 12.1) created
- [ ] **90%+ high priority fixtures** (Section 12.2) created
- [ ] **Valid + invalid variants** for all resource types
- [ ] **Error cases** for common scenarios (404, 400, schema violations)
- [ ] **Edge cases** for boundary conditions (empty, null, large, deep)

### 14.2 Quality Criteria

**Validation:**
- [ ] **100% of "valid" fixtures** pass JSON schema validation
- [ ] **100% of "valid" fixtures** pass semantic validation (vocabularies, URIs)
- [ ] **Integration workflow fixtures** have verified link integrity
- [ ] **"Invalid" fixtures** documented as invalid-by-design with reason

**Metadata:**
- [ ] **100% of fixtures** have complete metadata (source, dates, purpose)
- [ ] **All sourced fixtures** have source URLs documented
- [ ] **Validation status** documented for all fixtures
- [ ] **Related fixtures** cross-referenced (SWE encoding variants, workflow chains)

**Documentation:**
- [ ] **`README.md`** created with library overview
- [ ] **`SOURCES.md`** created with provenance tracking
- [ ] **`VALIDATION.md`** created with validation status
- [ ] **`CHANGELOG.md`** created for fixture library updates
- [ ] **This document (Section 15)** updated with final counts and status

### 14.3 Integration Criteria

**Test Integration:**
- [ ] **Fixtures imported** into unit tests (QueryBuilder, Resource Methods, Format Parsers)
- [ ] **Fixtures imported** into integration tests (4 workflows)
- [ ] **All tests passing** with fixture library
- [ ] **No hardcoded test data** remaining in test files (all fixtures externalized)

**Tooling:**
- [ ] **Automated validation scripts** created (schema, semantic, integration)
- [ ] **CI/CD pipeline** configured for fixture validation
- [ ] **Fixture loading utilities** created (TypeScript helpers)
- [ ] **Fixture count inventory** automated (script to count fixtures)

### 14.4 Maintainability Criteria

**Organization:**
- [ ] **Directory structure** implemented per Section 5
- [ ] **Naming conventions** followed consistently per Section 6
- [ ] **No duplicate fixtures** (same content, different names)
- [ ] **Clear reusability patterns** established and documented

**Procedures:**
- [ ] **Update procedures** documented (Section 9)
- [ ] **Validation procedures** documented (Section 10)
- [ ] **Deprecation procedures** documented (Section 9.4)
- [ ] **Periodic review schedule** established (quarterly)

### 14.5 Deliverable Checklist

- [ ] **Fixture library** (~280 files in `fixtures/` directory)
- [ ] **Documentation files** (README, SOURCES, VALIDATION, CHANGELOG)
- [ ] **Validation scripts** (schema, semantic, integration validators)
- [ ] **CI/CD configuration** (GitHub Actions workflow)
- [ ] **Fixture loading utilities** (TypeScript helpers)
- [ ] **This research document** (Section 15 deliverable)
- [ ] **Research plan updated** (Section 15 marked complete)
- [ ] **Committed and pushed** to repository

**Acceptance Criteria:**
✅ Section 15 research complete when:
1. All fixture categories identified and sourced
2. Directory structure designed and documented
3. Sourcing execution plan defined
4. Maintenance procedures established
5. Success criteria documented
6. Deliverable created and committed

---

## 15. References

### 15.1 Primary Sources

**CSAPI Specifications:**
- CSAPI Part 1: [URL to specification]
- CSAPI Part 2: [URL to specification]

**OGC Specifications:**
- SensorML 3.0 (OGC 23-000): https://docs.ogc.org/is/23-000/23-000.html
  - JSON Schema Repository: https://schemas.opengis.net/sensorML/3.0/json/
  - JSON Example Repository: https://schemas.opengis.net/sensorML/3.0/json/examples/
- SWE Common 3.0 (OGC 24-014): https://docs.ogc.org/is/24-014/24-014.html
  - JSON Schema Repository: https://schemas.opengis.net/sweCommon/3.0/json/
- RFC 7946 (GeoJSON): https://www.rfc-editor.org/rfc/rfc7946

**W3C Standards:**
- SOSA/SSN Ontology: https://www.w3.org/TR/vocab-ssn/

### 15.2 Research Dependencies

**Internal Documents:**
- Section 8: CSAPI Specification Test Requirements
  - File: `08-csapi-specification-test-requirements.md`
  - Fixture count: 25+ examples from CSAPI Parts 1 & 2
- Section 9: SensorML Testing Requirements
  - File: `09-sensorml-testing-requirements.md`
  - Fixture count: ~25 (PhysicalSystem, PhysicalComponent, Process types)
- Section 10: SWE Common Testing Requirements
  - File: `10-swe-common-testing-requirements.md`
  - Fixture count: ~120 (JSON, Text, Binary encodings)
- Section 11: GeoJSON CSAPI Testing Requirements
  - File: `11-geojson-csapi-testing-requirements.md`
  - Fixture count: ~20 (5 resource types × 4 variants)
- Section 12: QueryBuilder Testing Strategy
  - File: `12-querybuilder-testing-strategy.md`
  - Fixture count: 5 universal fixtures
- Section 13: Resource Method Testing Patterns
  - File: `13-resource-method-testing-patterns.md`
  - Fixture count: 23 (5 universal + 18 resource-specific)
- Section 14: Integration Test Workflow Design
  - File: `14-integration-test-workflow-design.md`
  - Fixture count: 33 (4 workflows)

### 15.3 External Servers (Attempted)

**OpenSensorHub Demo Server:**
- **URL:** http://sensiasoft.net:8181/sensorhub/api/
- **Status:** ❌ Unavailable (404 error as of 2025-01-31)
- **Impact:** Cannot source live sensor data examples; using spec examples instead

**52°North Server:**
- **Status:** ⏳ Not yet accessed
- **Planned:** May attempt as alternative source for live data examples

### 15.4 Tools and Validators

**JSON Schema Validation:**
- Ajv (Another JSON Schema Validator): https://ajv.js.org/
- TypeScript JSON Schema: https://www.npmjs.com/package/typescript-json-schema

**GeoJSON Validation:**
- @types/geojson: https://www.npmjs.com/package/@types/geojson
- geojson-validation: https://www.npmjs.com/package/geojson-validation

**Binary Encoding:**
- base64-js: https://www.npmjs.com/package/base64-js (for SWE binary encoding)

### 15.5 Related Documentation

**OGC Standards Resources:**
- OGC Schema Repository: https://schemas.opengis.net/
- OGC Definition Server: https://www.opengis.net/def/

**SOSA/SSN Vocabularies:**
- SOSA Core Ontology: https://www.w3.org/ns/sosa/
- SSN Extensions: https://www.w3.org/ns/ssn/

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-31 | Research Agent | Initial complete deliverable for Section 15 |

---

**Section 15 Status:** ✅ **COMPLETE**

**Next Steps:**
1. Begin fixture sourcing execution (Phase 1: Specification Extraction)
2. Update research plan with completion status
3. Commit deliverable to repository
4. Proceed to Section 16 or next research priority

**Total Fixture Target:** ~280 fixtures minimum
**Estimated Effort:** ~240-290 hours (~6-7.5 weeks at 40 hrs/week)
**Implementation Phases:** 3 phases (MVP, Complete, Comprehensive)
**Success Criteria:** Documented in Section 14
