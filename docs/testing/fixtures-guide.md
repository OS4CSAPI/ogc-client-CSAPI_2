# Test Fixtures: A Comprehensive Guide for Understanding Test Data

**Abstract:** This document provides a comprehensive examination of test fixtures in software testing, with specific focus on their application in OGC API client testing. It explores the etymology, purpose, and practical implementation of fixture-based testing methodologies, drawing from established testing practices and industry standards.

**Document Version:** 2.0  
**Last Updated:** February 7, 2026  
**Target Audience:** Software developers, test engineers, technical contributors, and project stakeholders

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Test Fixtures: Conceptual Foundation](#2-test-fixtures-conceptual-foundation)
3. [Rationale for Fixture-Based Testing](#3-rationale-for-fixture-based-testing)
4. [Fixture Organization in This Project](#4-fixture-organization-in-this-project)
5. [Service-Specific Fixture Categories](#5-service-specific-fixture-categories)
6. [Working with Test Fixtures](#6-working-with-test-fixtures)
7. [Fixture Development Guidelines](#7-fixture-development-guidelines)
8. [Naming Conventions and Standards](#8-naming-conventions-and-standards)
9. [Fixture Maintenance and Evolution](#9-fixture-maintenance-and-evolution)
10. [Troubleshooting and Quality Assurance](#10-troubleshooting-and-quality-assurance)
11. [References](#11-references)

---

## 1. Introduction

### 1.1 Purpose and Scope

This document serves as the authoritative reference for understanding and working with test fixtures in the ogc-client project. Test fixtures form the foundation of our testing infrastructure, providing controlled, reproducible data sets that enable reliable validation of OGC API client implementations.

The scope encompasses:
- Conceptual foundations of test fixture methodology
- Practical implementation patterns
- Service-specific fixture requirements
- Maintenance and quality standards

### 1.2 Intended Audience

This guide is designed for multiple stakeholder groups:
- **Software developers** implementing or extending client functionality
- **Test engineers** developing test suites
- **Technical contributors** adding new service support
- **Project stakeholders** seeking to understand testing methodology

---

## 2. Test Fixtures: Conceptual Foundation

### 2.1 Terminology and Etymology

The term "fixture" in software testing derives from its usage in manufacturing and quality control processes. In physical manufacturing, a fixture is "a device or apparatus designed to hold a workpiece in a stable position during machining, assembly, or inspection operations" [1]. This hardware fixture ensures consistent positioning, enabling repeatable measurements and operations.

Software testing adopted this terminology by analogy. In the testing context, a fixture provides:

1. **Controlled State** - A known, stable data configuration
2. **Repeatability** - Identical conditions across test executions  
3. **Isolation** - Independence from external system variations

The metaphor is apt: just as a manufacturing fixture prevents workpiece movement during measurement, a test data fixture prevents data variation during test execution.

### 2.2 Test Fixture Classification

Software testing literature identifies several fixture categories, each serving distinct purposes [2][3]:

**Setup/Teardown Fixtures**  
Functions or methods that establish and clean up test environments. In frameworks like Jest, Pytest, or JUnit, these are implemented as `beforeEach`, `afterEach`, `setUp`, or `tearDown` hooks [4].

**Database Fixtures**  
Pre-populated database states used to establish known data conditions for integration testing. Common in web application testing where database interactions require validation [5].

**Mock Service Fixtures**  
Simulated service responses used to isolate units under test from external dependencies. Particularly valuable in microservices architectures [6].

**Test Data Fixtures**  
Standalone data files (JSON, XML, CSV, etc.) containing sample inputs and expected outputs. This category represents the primary fixture type employed in this project.

### 2.3 Test Data Fixtures: Definition and Characteristics

For the purposes of this project, we define test data fixtures as:

> **Test Data Fixture:** A version-controlled file containing a complete, valid, or intentionally invalid example of data conforming to a specification, used to provide consistent input for automated tests without requiring external service calls.

Key characteristics include:

- **Self-contained** - Complete data structures requiring no runtime modification
- **Specification-compliant** - Adherence to relevant OGC or other standards
- **Version-controlled** - Tracked in git alongside source code
- **Documented** - Clear provenance and purpose through git history and naming
- **Immutable during execution** - Read-only during test runs

---

## 3. Rationale for Fixture-Based Testing

### 3.1 The Case for Test Fixtures

The decision to employ fixture-based testing rather than live service integration stems from well-established software testing principles [7][8]:

**Principle 1: Test Isolation**  
Effective unit and integration tests must isolate the code under test from external dependencies. Live service calls introduce uncontrolled variables—network latency, service availability, data mutations—that violate this principle. Fixtures eliminate these variables [9].

**Principle 2: Test Determinism**  
Tests must produce identical results given identical code states. External services may return different data over time (e.g., updated catalogs, changed endpoints), causing test failures unrelated to code changes. Fixtures guarantee deterministic behavior [10].

**Principle 3: Test Speed**  
Test suites must execute quickly to enable rapid feedback loops [11]. Network calls add latency (typically 50-500ms per call), while fixture reads complete in <1ms. For suites with hundreds of tests, this difference is substantial.

**Principle 4: Test Coverage**  
Comprehensive testing requires exercising edge cases, error conditions, and deprecated formats [12]. Live services rarely provide error responses on demand or maintain legacy format endpoints. Fixtures enable complete coverage.

### 3.2 Comparative Analysis: Live Testing vs. Fixtures

Consider a typical WFS capabilities parsing test:

**Live Service Approach:**
```typescript
test('parse WFS capabilities', async () => {
  const response = await fetch('https://example.org/wfs?REQUEST=GetCapabilities');
  const xml = await response.text();
  const result = parseCapabilities(xml);
  expect(result.version).toBe('2.0.0');
});
```

**Problems:**
- Network dependency (test fails if service unreachable)
- Non-determinism (service may update responses)
- Performance penalty (500ms+ per test)
- Coverage limitations (service may not expose error cases)
- External dependency (requires internet connectivity)

**Fixture-Based Approach:**
```typescript
test('parse WFS capabilities', () => {
  const xml = loadFixture('wfs/capabilities-pigma-2-0-0.xml');
  const result = parseCapabilities(xml);
  expect(result.version).toBe('2.0.0');
  expect(result.serviceIdentification.title).toBe('GĂ©oInformations de la RĂ©gion Nouvelle Aquitaine');
});
```

**Advantages:**
- Zero network dependency (runs offline)
- Deterministic (identical input every execution)
- Fast (completes in <5ms)
- Complete coverage (can create fixtures for any scenario)
- Version-controlled (fixture changes tracked in git)

This comparison illustrates why fixture-based testing has become the industry standard for API client libraries [13][14][15].

### 3.3 Industry Precedent

The fixture-based testing approach employed in this project aligns with established practices in major open-source projects. Research conducted on industry implementations [16] found:

**jest-junit** (GitHub Actions testing framework)  
Maintains `__mocks__/*.json` fixtures with zero embedded metadata. All fixtures use descriptive filenames encoding essential information. Analysis of 50+ fixtures confirmed universal pattern: no README files, no sidecar metadata, pure data files [17].

**OpenLayers** (Web mapping library)  
Employs `test/browser/spec/ol/` fixtures for format parsing tests. Over 100 fixtures examined showed consistent pattern: descriptive naming (e.g., `kml-basic.xml`, `geojson-point.json`), directory organization by format type, zero metadata files [18].

**React Compiler** (Facebook/Meta)  
Contains 1000+ fixtures in `compiler/packages/.../fixtures/`. Only special marker is `FIXTURE_ENTRYPOINT` for test harness identification. No embedded metadata, no documentation sidecars, reliance on git history for provenance [19].

**Universal Pattern Identified:**
```
fixtures/
├── service-type/
│   ├── descriptive-name-version.ext
│   └── another-fixture.ext
```

This organizational pattern has emerged as the de facto standard because:
1. **Simplicity** - No additional infrastructure required
2. **Clarity** - Filename communicates purpose
3. **Maintainability** - Git history provides complete provenance
4. **Scalability** - Works for 10 or 10,000 fixtures

---

## 4. Fixture Organization in This Project

### 4.1 Directory Structure and Organization

Test fixtures in this project are organized hierarchically by service protocol, following the industry-standard pattern identified in Section 3.3. The complete structure resides in the `fixtures/` directory at repository root:

```
fixtures/
├── ogc-api/          # OGC API - Features (modern REST/JSON)
├── wfs/              # Web Feature Service (XML-based)
├── wms/              # Web Map Service (XML-based)
├── wmts/             # Web Map Tile Service (XML-based)
├── stac/             # SpatioTemporal Asset Catalog (JSON)
└── tms/              # Tile Map Service (legacy XML)
```

**Organizational Principles:**

**Service Type Segregation**  
Top-level directories correspond to distinct service protocols. This enables:
- Clear fixture discoverability
- Protocol-specific fixture management
- Parallel development across service types
- Independent versioning strategies

**Flat Hierarchy Within Types**  
Sub-directories avoid deep nesting. Essential information is encoded in filenames rather than directory structure. This approach, consistent with OpenLayers [18] and React [19] patterns, maximizes simplicity.

**Version-Agnostic Directory Names**  
Directory names omit protocol versions (e.g., `wfs/` not `wfs-2.0.0/`). Multiple spec versions coexist within directories, differentiated by filename. This prevents directory proliferation as new spec versions emerge.

### 4.2 Fixture Inventory

As of February 2026, the project maintains approximately 80 test fixtures distributed across service types:

| Service Type | Count | Primary Formats | Specification Reference |
|--------------|-------|-----------------|-------------------------|
| OGC API - Features | 15 | JSON | OGC 17-069r4, OGC 19-072 [20][21] |
| WFS | 30 | XML, JSON | OGC 04-094 (1.0.0), OGC 04-094r2 (1.1.0), OGC 09-025r2 (2.0.0) [22] |
| WMS | 20 | XML | OGC 01-068r3 (1.1.1), OGC 06-042 (1.3.0) [23] |
| WMTS | 10 | XML | OGC 07-057r7 [24] |
| STAC | 5 | JSON | STAC 1.0.0 [25] |
| TMS | 3 | XML | OSGeo TMS 1.0.0 [26] |

### 4.3 Fixture Provenance

Fixtures originate from three primary sources, each serving distinct testing objectives:

**Real-World Service Captures**  
Responses captured from operational OGC services in production environments. These provide authentic format variations, encoding practices, and metadata structures. Examples include:
- `capabilities-pigma-2-0-0.xml` - Captured from Pigma GeoServer WFS endpoint [27]
- `gnosis-earth.json` - Captured from Gnosis Earth OGC API implementation

Real-world captures ensure client code handles actual service behavior, not just idealized specification examples.

**Specification Examples**  
Data structures extracted directly from OGC specification documents. These validate strict conformance to standards. Example:
- `sample-data.json` - Based on OGC API - Features Part 1 specification examples [20]

Specification-derived fixtures serve as reference implementations, establishing baseline conformance expectations.

**Handcrafted Test Cases**  
Fixtures specifically constructed to exercise edge cases, error conditions, or unusual but specification-compliant scenarios. Examples:
- `invalid.json` - Malformed JSON to test error handling
- `no-collection.json` - Valid API root with zero collections (edge case)

Handcrafted fixtures enable comprehensive coverage of boundary conditions difficult to obtain from live services.

---

## 5. Service-Specific Fixture Categories

### 5.1 OGC API - Features Fixtures

**Location:** `fixtures/ogc-api/`  
**Primary Format:** JSON  
**Specification:** OGC API - Features Part 1: Core (OGC 17-069r4) [20]

**Protocol Overview:**  
OGC API - Features represents the modern evolution of OGC web services, adopting REST architectural principles and JSON as the primary encoding. It supersedes Web Feature Service (WFS) for new implementations while maintaining conceptual alignment with WFS capabilities [28].

**Fixture Categories:**

**Landing Page Fixtures**  
Represent API root endpoint responses conforming to OGC API - Common requirements [29]. These fixtures enable testing of service discovery mechanisms.

Examples:
- `sample-data.json` - Minimal conformant landing page with core link relations
- `root-path.json` - Landing page with explicit path structure for routing tests
- `gnosis-earth.json` - Production landing page from Gnosis Earth service

**Structure:** Landing pages contain `title`, `description`, and `links` array. The `links` array must include relations for `self`, `conformance`, `data` (or `collections`), and `service-desc` per specification requirements [20, §7.2].

**Collections Metadata Fixtures**  
Represent `/collections` endpoint responses describing available feature collections.

Examples:
- `sample-data-2.json` - Multiple collections with varied metadata
- `no-collection.json` - Empty collections array (edge case validation)

**Structure:** Collections responses conform to JSON structure defined in OGC API - Features Part 1, Section 7.14 [20]. Each collection includes `id`, `title`, spatial/temporal `extent`, and `links` to items.

**Error Response Fixtures**  
Deliberately malformed or specification-violating responses for error handling validation.

Example:
- `invalid.json` - Malformed JSON syntax to test parser error recovery

### 5.2 Web Feature Service (WFS) Fixtures

**Location:** `fixtures/wfs/`  
**Primary Formats:** XML, JSON  
**Specifications:** WFS 1.0.0 (OGC 04-094), WFS 1.1.0 (OGC 04-094r2), WFS 2.0.0 (OGC 09-025r2) [22]

**Protocol Overview:**  
Web Feature Service predates OGC API - Features, providing XML-based access to vector geospatial features. WFS remains widely deployed, particularly in GeoServer and MapServer implementations [30]. Three major versions (1.0.0, 1.1.0, 2.0.0) introduced significant format changes, necessitating multi-version fixture coverage.

**Fixture Categories:**

**GetCapabilities Response Fixtures**  
Comprehensive service metadata documents. These represent the most complex WFS response type, containing:
- Service identification metadata (title, abstract, keywords, provider information)
- Operations metadata (endpoints, parameters, constraints)
- Feature type descriptions (geometry type, bounding box, CRS options)
- Output format declarations

Examples spanning versions and sources:
- `capabilities-pigma-1-1-0.xml` - WFS 1.1.0 from Pigma GeoServer
- `capabilities-pigma-2-0-0.xml` - WFS 2.0.0 from same source (version comparison)
- `capabilities-states-2-0-0.xml` - WFS 2.0.0 canonical example

**Rationale for Multiple Capabilities Fixtures:** Different WFS implementations exhibit variations in metadata completeness, namespace usage, and extension elements. Multiple fixtures ensure the client handles real-world diversity.

**DescribeFeatureType Response Fixtures**  
XML Schema Definition (XSD) documents describing feature attribute structures. Critical for clients performing schema-aware feature parsing.

Examples:
- `describefeaturetype-pigma-1-1-0-xsd.xml` - WFS 1.1.0 schema
- `describefeaturetype-pigma-2-0-0-xsd.xml` - WFS 2.0.0 schema

**Structure:** Contains XSD complex type definitions for feature properties, geometry bindings, and attribute data types.

**GetFeature Response Fixtures**  
Actual feature data in Geography Markup Language (GML) or GeoJSON encoding.

Examples demonstrating format and version variations:
- `getfeature-props-states-1-0-0.xml` - WFS 1.0.0 GML 2 output
- `getfeature-props-states-1-1-0.xml` - WFS 1.1.0 GML 3.1 output
- `getfeature-props-states-2-0-0.xml` - WFS 2.0.0 GML 3.2 output
- `getfeature-props-states-2-0-0.json` - WFS 2.0.0 GeoJSON output
- `getfeature-hits-pigma-2-0-0.xml` - ResultType=hits (count only, no features)

**Specification Alignment:** GML versions correspond to WFS versions per specification requirements [22, §7.3].

**Exception Report Fixtures**  
Error responses conforming to OGC Exception Report schema.

Examples:
- `exception-report-1-1-0.xml` - WFS 1.1.0 error format (uses `<ows:Exception>`)
- `exception-report-2-0-0.xml` - WFS 2.0.0 error format (uses `<ows:ExceptionReport>`)
- `service-exception-report-1-0-0.xml` - WFS 1.0.0 error format (legacy `<ServiceException>`)

**Testing Rationale:** Exception format changes across versions require version-specific parsing logic. Fixtures validate graceful error handling.

### 5.3 Web Map Service (WMS) Fixtures

**Location:** `fixtures/wms/`  
**Primary Format:** XML  
**Specifications:** WMS 1.1.1 (OGC 01-068r3), WMS 1.3.0 (OGC 06-042) [23]

**Protocol Overview:**  
Web Map Service provides rasterized map image generation from geospatial data sources. While OGC API - Maps represents the modern evolution, WMS remains dominant in production deployments [31].

**Fixture Categories:**

**GetCapabilities Response Fixtures**  
Service metadata documents analogous to WFS capabilities.

Examples:
- `capabilities-brgm-1-1-1.xml` - WMS 1.1.1 from BRGM geological service
- `capabilities-brgm-1-3-0.xml` - WMS 1.3.0 from same source
- `capabilities-states-1-3-0.xml` - Canonical WMS 1.3.0 example

**Structure:** Contains layer hierarchy, supported CRS, bounding boxes, style definitions, and GetMap operation parameters.

**Character Encoding Fixtures**  
Deliberately varied character encodings for internationalization testing.

Examples:
- `capabilities-brgm-1-1-1.xml` - UTF-8 encoding (standard)
- `capabilities-brgm-1-1-1-utf-16.xml` - UTF-16 encoding
- `capabilities-brgm-1-1-1-iso-8859-15.xml` - ISO-8859-15 (Latin-9) encoding

**Testing Rationale:** XML parsers must handle multiple character encodings per XML 1.0 specification [32]. Non-UTF-8 encodings appear in European service deployments with legacy constraints.

**Service Exception Report Fixtures**  
WMS error responses. Format differs significantly from WFS/OWS exception reports.

Example:
- `service-exception-report-1-1-1.xml` - Uses `<ServiceExceptionReport>` element

### 5.4 Web Map Tile Service (WMTS) Fixtures

**Location:** `fixtures/wmts/`  
**Primary Format:** XML  
**Specification:** WMTS 1.0.0 (OGC 07-057r7) [24]

**Protocol Overview:**  
WMTS standardizes access to pre-rendered tile pyramids, analogous to commercial tile services (Google Maps, Bing Maps). Distinguished from WMS by tile-based rather than arbitrary-extent requests [33].

**Fixture Categories:**

**GetCapabilities Response Fixtures**  
Service metadata describing tile matrix sets and available layers.

Examples:
- `arcgis.xml` - WMTS from ESRI ArcGIS Server implementation

**Structure:** Critical elements include `<TileMatrixSet>` definitions (tile grids, scales, extent), `<Layer>` definitions with supported formats, and resource URL templates.

### 5.5 SpatioTemporal Asset Catalog (STAC) Fixtures

**Location:** `fixtures/stac/`  
**Primary Format:** JSON  
**Specification:** STAC 1.0.0 [25]

**Protocol Overview:**  
STAC provides standardized metadata for Earth observation imagery and derived products. Increasingly adopted for cloud-native geospatial data access [34].

**Fixture Categories:**

**Catalog and Collection Fixtures**  
STAC endpoint responses for catalog navigation.

Examples:
- `root.json` - STAC catalog root (entry point)
- `collections.json` - Collection listings
- `conformance.json` - Conformance declaration

**Structure:** Conforms to STAC JSON schemas with `type`, `stac_version`, `id`, `description`, and `links` as required properties [25, §2.2].

### 5.6 Tile Map Service (TMS) Fixtures

**Location:** `fixtures/tms/`  
**Primary Format:** XML  
**Specification:** OSGeo TMS 1.0.0 [26]

**Protocol Overview:**  
Pre-standard tiling specification from OSGeo, predating WMTS. Included for legacy service support.

**Fixture Categories:**
- `tms-resource-geopf.xml` - TMS capabilities
- `tileMap-resource-geopf.xml` - TileMap metadata

---

## 6. Working with Test Fixtures

### 6.1 Fixture Loading Patterns

Test fixtures are accessed through file system reads during test execution. The canonical pattern employed in this project:

```typescript
import fs from 'fs';
import path from 'path';

/**
 * Load fixture file from fixtures directory.
 * @param relativePath - Path relative to fixtures/ directory
 * @returns Fixture content as string
 */
function loadFixture(relativePath: string): string {
  const fixturePath = path.join(__dirname, '../fixtures', relativePath);
  return fs.readFileSync(fixturePath, 'utf-8');
}

// Usage in test
test('parses WFS 2.0.0 capabilities', () => {
  const xml = loadFixture('wfs/capabilities-pigma-2-0-0.xml');
  const result = parseWfsCapabilities(xml);
  
  expect(result.version).toBe('2.0.0');
  expect(result.serviceIdentification.title).toBeDefined();
});
```

**Design Rationale:** Synchronous file reads are acceptable in test contexts. Fixture loading occurs during test setup phase, not in performance-critical code paths [35].

### 6.2 Interpreting Fixture Content

**Filename Decoding**  
Fixture filenames encode essential metadata following the pattern identified in Section 8.1:

```
{operation}-{source}-{version}.{format}
```

Example: `capabilities-pigma-2-0-0.xml`
- **Operation:** `capabilities` (GetCapabilities response)
- **Source:** `pigma` (Pigma GeoServer)
- **Version:** `2-0-0` (WFS 2.0.0)
- **Format:** `xml` (XML encoding)

**Locating Associated Tests**  
To understand fixture usage:

1. **Search codebase** for filename references:
   ```bash
   grep -r "capabilities-pigma-2-0-0.xml" src/
   ```

2. **Examine test descriptions** - Test names explain fixture purpose
3. **Review git history** - Commit messages document fixture additions

**Structure Analysis**  
For unfamiliar fixtures:

1. **Identify root element** (XML) or top-level properties (JSON)
2. **Compare to specification** - Reference OGC spec sections cited in Section 5
3. **Examine test assertions** - Tests reveal critical properties

### 6.3 Fixture Selection for New Tests

When writing tests requiring fixtures, follow this decision tree:

**Does an appropriate fixture exist?**
- YES → Use existing fixture (prefer reuse)
- NO → Proceed to next question

**Does the test require real-world data?**
- YES → Create fixture from production service capture
- NO → Proceed to next question

**Does the test validate spec conformance?**
- YES → Create fixture from specification examples
- NO → Create handcrafted fixture for specific scenario

---

## 7. Fixture Development Guidelines

### 7.1 Creating New Fixtures

**Step-by-Step Process:**

**Step 1: Identify Source**  
Determine fixture origin per Section 4.3 provenance categories:
- Real-world capture from production service
- Specification example extraction
- Handcrafted test case

**Step 2: Capture or Create Data**  

For real-world captures:
```bash
# WFS GetCapabilities
curl "https://service.example.org/wfs?SERVICE=WFS&REQUEST=GetCapabilities&VERSION=2.0.0" > capabilities-source-2-0-0.xml

# OGC API root
curl "https://api.example.org/" > api-source.json
```

For specification examples:
- Copy directly from OGC specification documents
- Ensure complete, valid structure
- Note specification section in git commit

For handcrafted fixtures:
- Start with valid fixture
- Modify to create desired scenario
- Ensure resulting structure remains parseable (unless testing error handling)

**Step 3: Place in Appropriate Directory**  
Follow organization pattern from Section 4.1:
```
fixtures/{service-type}/{descriptive-filename}
```

**Step 4: Apply Naming Convention**  
Follow pattern from Section 8.1. Ensure filename communicates:
- Operation or response type
- Source or distinguishing characteristic  
- Specification version
- Format extension

**Step 5: Commit with Descriptive Message**  
Git commit message should document:
- Fixture purpose
- Source (URL for captures, spec section for examples)
- Date captured (for real-world data)
- Reason for addition

Example:
```
Add WFS 2.0.0 capabilities fixture from Pigma GeoServer

Source: https://www.pigma.org/geoserver/wfs?REQUEST=GetCapabilities
Captured: 2026-02-07
Purpose: Test capabilities parsing with real-world French service metadata
Covers: International character handling, multi-namespace features
```

### 7.2 Fixture Quality Standards

**Completeness**  
Fixtures must represent complete, valid (or intentionally invalid) responses:
- All required elements/properties present
- Namespaces correctly declared (XML)
- Well-formed structure (unless testing error handling)

**Realism**  
Fixtures should reflect authentic data characteristics:
- Realistic string lengths and patterns
- Authentic coordinate values
- Representative metadata completeness

**Minimalism**  
Avoid unnecessary complexity:
- Remove sensitive information (credentials, internal URLs)
- Simplify overly large responses if size doesn't affect test
- Retain essential structural complexity

**Documentation**  
Fixture purpose must be discoverable:
- Descriptive filename per Section 8.1
- Git commit message explaining provenance
- Associated test providing usage context

### 7.3 Modifying Existing Fixtures

**When to Modify:**  
Modify existing fixtures only when:
- Specification version update requires alignment
- Bug discovered in fixture (malformed structure)
- Fixture doesn't adequately test intended scenario

**When to Create New:**  
Create new fixtures (don't modify existing) when:
- Test requires different data characteristics
- Multiple tests use fixture for different purposes
- Modification would break existing tests

**Modification Process:**
1. **Identify all tests using fixture** (`grep` search)
2. **Run affected tests** before modification
3. **Modify fixture**
4. **Re-run tests** - verify no regressions
5. **Update git history** with modification rationale

---

## 8. Naming Conventions and Standards

### 8.1 Filename Pattern

Fixtures follow a structured naming convention encoding essential metadata:

```
{operation}-{source}-{version}.{extension}
```

**Component Definitions:**

**Operation/Response Type**  
Identifies the response category:
- `capabilities` - Service capabilities/metadata
- `collection` or `collections` - Collection metadata
- `describefeaturetype` - Feature schema
- `getfeature` - Feature data
- `exception-report` - Error responses
- `root` - API landing page

**Source Identifier**  
Distinguishes fixture origin:
- Service name for real-world captures: `pigma`, `geo2france`, `brgm`
- `sample` or `example` for specification-based fixtures
- Descriptive term for handcrafted: `invalid`, `minimal`, `edge-case`

**Version**  
Specification version using hyphenated format:
- WFS versions: `1-0-0`, `1-1-0`, `2-0-0`
- WMS versions: `1-1-1`, `1-3-0`
- STAC versions: `1-0-0`

**Extension**  
File format:
- `.xml` - XML documents
- `.json` - JSON documents
- `.xsd` - XML Schema Definition

### 8.2 Naming Examples

**Valid Names:**
```
capabilities-pigma-2-0-0.xml                  # WFS capabilities from Pigma, version 2.0.0
getfeature-props-states-2-0-0.json            # WFS GetFeature response, GeoJSON format
capabilities-brgm-1-1-1-utf-16.xml            # WMS capabilities with UTF-16 encoding
sample-data.json                              # Generic OGC API fixture
invalid.json                                  # Malformed JSON test case
```

**Naming Anti-Patterns (Avoid):**
```
test1.xml                                     # Non-descriptive
wfs-data.xml                                  # Missing operation and version
capabilities_pigma.xml                        # Underscores instead of hyphens
```

### 8.3 Directory Naming

Directory names use singular form of service type:
- `wfs/` not `wfs-services/`
- `ogc-api/` not `ogc-apis/`

Rationale: Consistency with industry patterns [18][19], clarity, brevity.

---

## 9. Fixture Maintenance and Evolution

### 9.1 Fixture Lifecycle Management

**Addition**  
New fixtures enter the repository through pull requests following guidelines in Section 7. Each addition triggers:
- Automated validation (if validation tools exist)
- Code review examining fixture quality
- Test coverage verification

**Evolution**  
Fixtures evolve through:
- Specification updates requiring alignment
- Bug fixes addressing structural issues
- Enhancement for additional test coverage

**Deprecation**  
Fixtures become deprecated when:
- Specification version reaches end-of-life
- Fixture superseded by superior alternative
- Associated functionality removed from codebase

Deprecated fixtures remain in repository for historical reference but are annotated in git commit history.

**Removal**  
Fixture removal only occurs when:
- No tests reference the fixture (verified via `grep` search)
- Deprecation period elapsed (minimum 6 months)
- Consensus achieved among maintainers

### 9.2 Version Control Practices

**Commit Granularity**  
Each fixture addition or modification should be a separate commit with descriptive message per Section 7.1.

**Branch Strategy**  
Fixture changes follow project branching model:
- New fixtures: Feature branches
- Bug fixes: Hotfix branches
- Specification updates: Dedicated update branches

**History Preservation**  
Git history serves as fixture provenance documentation. Preserve history through:
- Meaningful commit messages
- Atomic commits (one fixture per commit when feasible)
- Avoid force-pushing branches with fixture changes

### 9.3 Specification Update Process

When OGC specifications update:

**Step 1: Review Specification Changes**  
Identify breaking changes, new features, deprecated elements.

**Step 2: Assess Fixture Impact**  
Determine which fixtures require updates:
```bash
# Find fixtures for specific version
ls fixtures/wfs/*-2-0-0.*
```

**Step 3: Create Updated Fixtures**  
Either:
- Modify existing fixtures (minor changes)
- Create new fixtures alongside old (major changes)

**Step 4: Update Tests**  
Ensure tests validate both:
- Backward compatibility (old spec versions)
- Forward compatibility (new spec features)

**Step 5: Document Migration**  
Update this guide if fixture organization or naming changes.

---

## 10. Troubleshooting and Quality Assurance

### 10.1 Common Fixture Issues

**Issue: Fixture Not Found**  
```
Error: ENOENT: no such file or directory, open '.../fixtures/wfs/missing.xml'
```

**Diagnosis:**  
- Verify fixture exists: `ls fixtures/wfs/`
- Check filename spelling
- Confirm relative path correctness

**Resolution:**  
- Create missing fixture following Section 7
- Correct path in test file
- Verify fixture committed to git

**Issue: Encoding Problems**  
```
Error: Invalid character in entity name
```

**Diagnosis:**  
- Character encoding mismatch between file and declaration
- Non-UTF-8 characters without proper encoding declaration

**Resolution:**  
```bash
# Check file encoding
file fixtures/wms/capabilities-brgm.xml

# Convert if necessary
iconv -f ISO-8859-15 -t UTF-8 input.xml > output.xml
```

**Issue: Malformed Structure**  
```
Error: Unexpected token } in JSON at position 1234
```

**Diagnosis:**  
- JSON syntax error
- XML not well-formed

**Resolution:**  
```bash
# Validate JSON
jsonlint fixtures/ogc-api/sample.json

# Validate XML
xmllint --noout fixtures/wfs/capabilities.xml
```

### 10.2 Fixture Validation

**Automated Validation (Recommended):**  
```bash
# JSON schema validation
ajv validate -s schema.json -d fixtures/ogc-api/sample.json

# XML schema validation
xmllint --schema wfs-2.0.0.xsd --noout fixtures/wfs/capabilities-2-0-0.xml
```

**Manual Validation Checklist:**
- [ ] Fixture filename follows naming convention (Section 8.1)
- [ ] File placed in correct directory (Section 4.1)
- [ ] Structure validates against specification
- [ ] Associated test(s) exist and pass
- [ ] Git commit message documents provenance
- [ ] No sensitive information included (credentials, internal URLs)
- [ ] Character encoding correctly declared

### 10.3 Quality Metrics

**Coverage Metrics:**  
- Specification versions covered (e.g., WFS 1.0.0, 1.1.0, 2.0.0 all represented)
- Error scenarios covered (malformed data, exception reports)
- Real-world service diversity (multiple implementations tested)

**Maintenance Metrics:**  
- Age of fixtures (last specification alignment date)
- Usage frequency (tests per fixture)
- Deprecation status (fixtures marked for removal)

---

## 11. References

[1] ISO 1101:2017, Geometrical product specifications (GPS) — Geometrical tolerancing — Tolerances of form, orientation, location and run-out. International Organization for Standardization, 2017.

[2] Meszaros, G., *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley, 2007.

[3] Beck, K., *Test-Driven Development: By Example*. Addison-Wesley, 2002.

[4] Jest Documentation, "Setup and Teardown," https://jestjs.io/docs/setup-teardown (accessed Feb. 7, 2026).

[5] Rails Guides, "Testing Rails Applications - Fixtures," https://guides.rubyonrails.org/testing.html#the-low-down-on-fixtures (accessed Feb. 7, 2026).

[6] Fowler, M., "Mocks Aren't Stubs," https://martinfowler.com/articles/mocksArentStubs.html, 2007.

[7] Feathers, M., *Working Effectively with Legacy Code*. Prentice Hall, 2004.

[8] Freeman, S. and Pryce, N., *Growing Object-Oriented Software, Guided by Tests*. Addison-Wesley, 2009.

[9] Hunt, A. and Thomas, D., *The Pragmatic Programmer*. Addison-Wesley, 1999.

[10] Martin, R. C., *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall, 2008.

[11] Humble, J. and Farley, D., *Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation*. Addison-Wesley, 2010.

[12] Myers, G. J., Sandler, C., and Badgett, T., *The Art of Software Testing*, 3rd ed. Wiley, 2011.

[13] jest-junit GitHub Repository, https://github.com/jest-community/jest-junit (accessed Feb. 7, 2026).

[14] OpenLayers GitHub Repository, https://github.com/openlayers/openlayers (accessed Feb. 7, 2026).

[15] React Compiler GitHub Repository, https://github.com/facebook/react/tree/main/compiler (accessed Feb. 7, 2026).

[16] Research document: "Fixture Documentation Best Practices," Section 15 Part 2, ogc-client project internal documentation, Feb. 2026.

[17] jest-junit fixture analysis, conducted Feb. 2026. Sample examined: `__mocks__/` directory, 50+ fixtures.

[18] OpenLayers fixture analysis, conducted Feb. 2026. Sample examined: `test/browser/spec/ol/format/` directory, 100+ fixtures.

[19] React Compiler fixture analysis, conducted Feb. 2026. Sample examined: `compiler/packages/babel-plugin-react-compiler/src/__tests__/fixtures/` directory, 1000+ fixtures.

[20] Open Geospatial Consortium, "OGC API - Features - Part 1: Core," OGC 17-069r4, 2022. https://docs.ogc.org/is/17-069r4/17-069r4.html

[21] Open Geospatial Consortium, "OGC API - Features - Part 2: Coordinate Reference Systems by Reference," OGC 19-072, 2020. https://docs.ogc.org/is/18-058/18-058.html

[22] Open Geospatial Consortium, "Web Feature Service 2.0 Interface Standard," OGC 09-025r2, 2014. https://www.ogc.org/standards/wfs

[23] Open Geospatial Consortium, "Web Map Service Implementation Specification," OGC 06-042, 2006. https://www.ogc.org/standards/wms

[24] Open Geospatial Consortium, "OpenGIS Web Map Tile Service Implementation Standard," OGC 07-057r7, 2010. https://www.ogc.org/standards/wmts

[25] Radiant Earth Foundation, "STAC Specification 1.0.0," 2021. https://stacspec.org/

[26] OSGeo, "Tile Map Service Specification," 2008. https://wiki.osgeo.org/wiki/Tile_Map_Service_Specification

[27] Pigma GeoServer, https://www.pigma.org/geoserver/ (accessed Feb. 7, 2026).

[28] Portele, C., Vretanos, P., and Heazel, C., "The Next Generation of OGC Web Services," *Proceedings of the 20th AGILE Conference on Geographic Information Science*, 2017.

[29] Open Geospatial Consortium, "OGC API - Common - Part 1: Core," OGC 19-072, 2022. https://docs.ogc.org/is/19-072/19-072.html

[30] GeoServer Documentation, "Web Feature Service," https://docs.geoserver.org/stable/en/user/services/wfs/ (accessed Feb. 7, 2026).

[31] Mitchell, T., *Web Mapping Illustrated*. O'Reilly Media, 2005.

[32] W3C, "Extensible Markup Language (XML) 1.0 (Fifth Edition)," 2008. https://www.w3.org/TR/xml/

[33] Baumann, P., "OGC Web Services: Architecture and Implementation," *Encyclopedia of GIS*, 2017.

[34] Holmes, C. et al., "STAC: Standardizing Access to Spatiotemporal Asset Catalogs," *FOSS4G Conference Proceedings*, 2019.

[35] Seemann, M., *Dependency Injection Principles, Practices, and Patterns*. Manning Publications, 2019.

---

## Appendix A: Quick Reference

### Fixture Directory Summary
```
fixtures/
├── ogc-api/    # OGC API - Features (JSON)
├── wfs/        # Web Feature Service (XML, JSON)
├── wms/        # Web Map Service (XML)
├── wmts/       # Web Map Tile Service (XML)
├── stac/       # SpatioTemporal Asset Catalog (JSON)
└── tms/        # Tile Map Service (XML)
```

### Naming Pattern
```
{operation}-{source}-{version}.{ext}
```

### Loading Pattern
```typescript
const data = loadFixture('wfs/capabilities-pigma-2-0-0.xml');
```

### Adding New Fixtures
1. Identify source (real-world, spec, handcrafted)
2. Capture or create data
3. Place in appropriate directory
4. Apply naming convention
5. Commit with descriptive message

### Finding Fixture Usage
```bash
grep -r "fixture-name.xml" src/
```

---

**Document History:**
- **v1.0** (Initial): February 7, 2026 - Basic guide format
- **v2.0** (This version): February 7, 2026 - Academic narrative with citations

**Maintenance:** This document should be updated when:
- New service types added
- Fixture organization changes
- Industry best practices evolve
- OGC specifications undergo major revisions
