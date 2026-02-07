# Test Fixtures Guide

**Document Purpose:** Comprehensive guide to understanding and working with test fixtures in this project  
**Audience:** Developers, contributors, and anyone needing to understand our test data  
**Last Updated:** February 7, 2026

---

## Table of Contents

1. [What Are Test Fixtures?](#1-what-are-test-fixtures)
2. [Why We Use Fixtures](#2-why-we-use-fixtures)
3. [Our Fixture Organization](#3-our-fixture-organization)
4. [Fixture Types in This Project](#4-fixture-types-in-this-project)
5. [Working with Fixtures](#5-working-with-fixtures)
6. [Adding New Fixtures](#6-adding-new-fixtures)
7. [Fixture Naming Conventions](#7-fixture-naming-conventions)

---

## 1. What Are Test Fixtures?

### 1.1 Definition

A **test fixture** is a fixed state or set of data used to establish a consistent testing environment. In software testing, fixtures provide:

- **Known inputs** for testing functions
- **Expected outputs** to verify correctness
- **Reproducible conditions** for consistent test results

The term "fixture" comes from physical testing, where a fixture is a device that holds a workpiece in place during manufacturing or inspection. In software testing, fixtures similarly "hold" data in a known state for testing.

### 1.2 Types of Fixtures

**In General Software Testing:**
- **Test data fixtures** - Files containing sample data (what this document focuses on)
- **Setup fixtures** - Functions that prepare test environments
- **Database fixtures** - Pre-populated database states
- **Mock fixtures** - Simulated service responses

**In This Project:**
We primarily use **test data fixtures** - real-world or spec-compliant examples of:
- OGC service responses (API responses, XML capabilities documents)
- GeoJSON data structures
- Service metadata
- Error responses

### 1.3 Why "Fixtures"?

The terminology evolved from hardware testing:

1. **Manufacturing Context** - A fixture holds a part steady during machining or measurement
2. **Testing Context** - A test fixture holds data steady during software testing
3. **Result** - Consistent, repeatable test conditions

Just as a machinist's fixture ensures every part is measured the same way, a test data fixture ensures every test run uses identical input data.

---

## 2. Why We Use Fixtures

### 2.1 Benefits of Using Fixtures

**Consistency**
- Every test run uses identical data
- No variation between developers' machines
- No dependency on external services being available

**Documentation**
- Fixtures show real-world examples of data structures
- Serve as specifications for what valid data looks like
- Help new developers understand expected formats

**Speed**
- Tests run instantly without network calls
- No waiting for external services
- Can run tests offline

**Reliability**
- External services can be down or changed
- Fixtures are version-controlled and stable
- Test failures indicate real problems, not service outages

**Coverage**
- Can test edge cases (errors, unusual formats)
- Can test outdated spec versions
- Can test scenarios hard to reproduce with live services

### 2.2 Real-World Testing vs. Fixtures

**Scenario:** You need to test parsing WFS 2.0.0 capabilities documents.

**Without Fixtures (❌ Problematic):**
```typescript
test('parse WFS capabilities', async () => {
  // Makes real network call every test run
  const response = await fetch('https://example.com/wfs?request=GetCapabilities');
  const xml = await response.text();
  const result = parseWfsCapabilities(xml);
  expect(result.version).toBe('2.0.0');
});
```
**Problems:**
- Requires internet connection
- Slow (network latency)
- Fails if service is down or changed
- Can't test error cases
- Not reproducible

**With Fixtures (✅ Better):**
```typescript
test('parse WFS capabilities', () => {
  // Uses local fixture file
  const xml = readFixture('wfs/capabilities-pigma-2-0-0.xml');
  const result = parseWfsCapabilities(xml);
  expect(result.version).toBe('2.0.0');
});
```
**Benefits:**
- No network required
- Fast (reads from disk)
- Always works
- Can test exact scenarios
- Fully reproducible

---

## 3. Our Fixture Organization

### 3.1 Directory Structure

All test fixtures are located in the `fixtures/` directory at the project root:

```
fixtures/
├── ogc-api/          # OGC API - Features responses
├── wfs/              # Web Feature Service responses
├── wms/              # Web Map Service responses
├── wmts/             # Web Map Tile Service responses
├── stac/             # SpatioTemporal Asset Catalog responses
└── tms/              # Tile Map Service responses
```

**Rationale for Organization:**
- **By Service Type** - Makes it easy to find relevant fixtures
- **Flat Within Type** - No deep nesting; filenames are descriptive
- **Spec Version Neutral** - All versions of a service type in same directory

### 3.2 Fixture File Count (as of Feb 2026)

| Service Type | File Count | Formats |
|--------------|------------|---------|
| OGC API      | ~15        | JSON    |
| WFS          | ~30        | XML, JSON |
| WMS          | ~20        | XML     |
| WMTS         | ~10        | XML     |
| STAC         | ~5         | JSON    |
| TMS          | ~3         | XML     |

### 3.3 Fixture Sources

Our fixtures come from:

1. **Real Services** - Captured from actual OGC services
   - Example: `capabilities-pigma-2-0-0.xml` from Pigma GeoServer
   - Example: `gnosis-earth.json` from Gnosis Earth API

2. **OGC Specifications** - Examples from official specs
   - Example: `sample-data.json` based on OGC API - Features examples

3. **Handcrafted** - Created to test specific scenarios
   - Example: `invalid.json` to test error handling
   - Example: `no-collection.json` to test edge cases

4. **Modified Real Data** - Real responses with adjustments
   - Simplified for clarity
   - Enhanced to test edge cases
   - Stripped of sensitive information

---

## 4. Fixture Types in This Project

### 4.1 OGC API - Features Fixtures

**Location:** `fixtures/ogc-api/`  
**Format:** JSON  
**Purpose:** Testing OGC API - Features (OGCAPI-F) Part 1 conformance

**What OGC API - Features Is:**
A modern REST/JSON API standard for accessing geospatial feature data. Replaces older WFS for new implementations.

**Fixture Categories:**

#### Landing Page Responses
Files representing the API root endpoint response:
- `sample-data.json` - Valid root response with links
- `root-path.json` - Root with specific path structure
- `gnosis-earth.json` - Real Gnosis Earth API root

**What They Contain:**
- Title, description of the service
- Links to conformance, collections, data endpoints
- Service metadata

**Example Structure:**
```json
{
  "title": "OGC API Features Server",
  "description": "Access to geospatial data",
  "links": [
    {
      "href": "http://example.org/collections",
      "rel": "data",
      "type": "application/json"
    }
  ]
}
```

#### Collections Responses
Files representing the `/collections` endpoint:
- `sample-data-2.json` - Collections list with multiple collections

**What They Contain:**
- Array of available feature collections
- Metadata for each collection (title, extent, CRS)
- Links to collection items

#### Error Cases
- `invalid.json` - Malformed JSON for error handling tests
- `no-collection.json` - Missing required fields

### 4.2 WFS (Web Feature Service) Fixtures

**Location:** `fixtures/wfs/`  
**Format:** XML (primarily), JSON (for WFS 2.0.0+)  
**Purpose:** Testing WFS parsing across versions 1.0.0, 1.1.0, 2.0.0

**What WFS Is:**
An older but widely-deployed OGC standard for requesting geospatial features over the web using XML.

**Fixture Categories:**

#### Capabilities Documents
Files representing `GetCapabilities` responses:
- `capabilities-pigma-2-0-0.xml` - WFS 2.0.0 from Pigma service
- `capabilities-geo2france-2-0-0.xml` - WFS 2.0.0 from Geo2France
- `capabilities-states-2-0-0.xml` - WFS 2.0.0 example

**What They Contain:**
- Service identification (title, abstract, keywords)
- Operation endpoints (GetCapabilities, DescribeFeatureType, GetFeature)
- Feature types available
- Output formats supported
- Coordinate reference systems

**Why Multiple Files:**
- Different services have different metadata
- Tests service-specific parsing quirks
- Validates parsing across real-world variations

#### DescribeFeatureType Responses
Files representing schema descriptions:
- `describefeaturetype-pigma-2-0-0-xsd.xml` - XML Schema for features

**What They Contain:**
- XSD (XML Schema Definition) for feature attributes
- Geometry types
- Data types for properties

#### GetFeature Responses
Files representing actual feature data:
- `getfeature-props-states-2-0-0.json` - GeoJSON features (WFS 2.0.0)
- `getfeature-props-states-2-0-0.xml` - GML features (WFS 2.0.0)
- `getfeature-hits-pigma-2-0-0.xml` - Hit count response

**What They Contain:**
- Feature collections with geometries and properties
- Various output formats (GML, GeoJSON)
- Different response types (features vs. hit counts)

#### Exception Reports
Files representing error responses:
- `exception-report-2-0-0.xml` - WFS 2.0.0 error format
- `service-exception-report-1-0-0.xml` - WFS 1.0.0 error format

**What They Contain:**
- Error codes
- Exception messages
- Debugging information

**Why We Test These:**
- Ensures graceful error handling
- Validates error parsing across versions

### 4.3 WMS (Web Map Service) Fixtures

**Location:** `fixtures/wms/`  
**Format:** XML  
**Purpose:** Testing WMS capabilities parsing across versions

**What WMS Is:**
OGC standard for requesting rendered map images (raster tiles) from geospatial data.

**Fixture Categories:**

#### Capabilities Documents
- `capabilities-brgm-1-3-0.xml` - WMS 1.3.0 from BRGM
- `capabilities-brgm-1-1-1.xml` - WMS 1.1.1 from BRGM
- `capabilities-states-1-3-0.xml` - Example WMS 1.3.0

**What They Contain:**
- Layer tree structure
- Available coordinate reference systems
- Map output formats (PNG, JPEG, etc.)
- GetMap operation parameters
- Style information

#### Encoding Variations
- `capabilities-brgm-1-1-1-utf-16.xml` - UTF-16 encoding
- `capabilities-brgm-1-1-1-iso-8859-15.xml` - ISO-8859-15 encoding

**Why These Matter:**
- Tests character encoding handling
- Ensures international character support
- Validates XML parsing robustness

#### Exception Reports
- `service-exception-report-1-1-1.xml` - WMS error responses

### 4.4 WMTS (Web Map Tile Service) Fixtures

**Location:** `fixtures/wmts/`  
**Format:** XML  
**Purpose:** Testing WMTS capabilities parsing

**What WMTS Is:**
OGC standard for serving pre-rendered map tiles (like Google Maps tiles) with standardized tile matrix sets.

**Fixture Categories:**

#### Capabilities Documents
- `arcgis.xml` - WMTS from ArcGIS Server
- Various other WMTS capabilities

**What They Contain:**
- Tile matrix sets (zoom levels, tile dimensions)
- Layer metadata
- Resource URLs for tiles
- Tile format information

### 4.5 STAC (SpatioTemporal Asset Catalog) Fixtures

**Location:** `fixtures/stac/`  
**Format:** JSON  
**Purpose:** Testing STAC catalog and collection parsing

**What STAC Is:**
A specification for describing geospatial assets (satellite imagery, point clouds, etc.) in a standardized way.

**Fixture Categories:**

#### Catalog/Collection Responses
- `root.json` - STAC catalog root
- `collections.json` - STAC collections listing
- `conformance.json` - STAC conformance declaration

**What They Contain:**
- Asset metadata
- Spatial and temporal extents
- Links to items and sub-catalogs

### 4.6 TMS (Tile Map Service) Fixtures

**Location:** `fixtures/tms/`  
**Format:** XML  
**Purpose:** Testing legacy TMS parsing

**What TMS Is:**
An older tiling standard predating WMTS, used by some legacy services.

**Fixture Categories:**
- `tileMap-resource-geopf.xml` - TileMap metadata
- `tms-resource-geopf.xml` - TMS capabilities

---

## 5. Working with Fixtures

### 5.1 Reading Fixtures in Tests

**TypeScript/JavaScript Example:**
```typescript
import fs from 'fs';
import path from 'path';

// Helper function to read fixture
function readFixture(relativePath: string): string {
  const fixturePath = path.join(__dirname, '../fixtures', relativePath);
  return fs.readFileSync(fixturePath, 'utf-8');
}

// Using in a test
test('parses WFS capabilities', () => {
  const xml = readFixture('wfs/capabilities-pigma-2-0-0.xml');
  const result = parseWfsCapabilities(xml);
  
  expect(result.version).toBe('2.0.0');
  expect(result.serviceIdentification.title).toBeDefined();
});
```

### 5.2 Understanding Fixture Content

**To Understand a Fixture:**

1. **Look at the filename** - Tells you the service type, source, and version
   - `capabilities-pigma-2-0-0.xml` = WFS capabilities from Pigma, version 2.0.0

2. **Check the test file** - Find tests that use this fixture
   - Search codebase for the filename
   - Test descriptions explain what the fixture represents

3. **Examine the structure** - Open the file and look at the format
   - XML fixtures: Look for root element, namespaces
   - JSON fixtures: Look for top-level properties

4. **Compare to spec** - Reference the OGC specification
   - Filename indicates spec version
   - Verify structure matches spec requirements

### 5.3 When to Use Which Fixture

**Choose fixtures based on:**

1. **Service Type** - Match your parser (WFS, WMS, OGC API, etc.)
2. **Version** - Test against specific spec versions you support
3. **Scenario** - Pick fixtures that test your specific case:
   - Valid responses for happy path tests
   - Error responses for error handling tests
   - Edge cases for robustness tests

**Example Decision Tree:**
```
Testing OGC API root parsing?
  ├─ Valid response → fixtures/ogc-api/sample-data.json
  ├─ Real service → fixtures/ogc-api/gnosis-earth.json
  └─ Error case → fixtures/ogc-api/invalid.json

Testing WFS 2.0.0 capabilities?
  ├─ Generic example → fixtures/wfs/capabilities-states-2-0-0.xml
  ├─ Real service → fixtures/wfs/capabilities-pigma-2-0-0.xml
  └─ Error response → fixtures/wfs/exception-report-2-0-0.xml
```

---

## 6. Adding New Fixtures

### 6.1 When to Add a New Fixture

**Add a fixture when:**
- ✅ Testing a new service type or version
- ✅ Found a bug caused by specific response format
- ✅ Need to test an edge case (error, unusual structure)
- ✅ Supporting a new OGC specification
- ✅ Real-world response differs from spec examples

**Don't add a fixture when:**
- ❌ Existing fixture already covers the test case
- ❌ Response is identical to existing fixture except trivial details
- ❌ Can test with dynamically generated data

### 6.2 How to Add a New Fixture

**Step 1: Capture the Data**

**From a real service:**
```bash
# Example: Capture WFS capabilities
curl "https://example.com/wfs?service=WFS&version=2.0.0&request=GetCapabilities" \
  > fixtures/wfs/capabilities-example-2-0-0.xml
```

**From a specification:**
- Copy example from OGC spec document
- Save to appropriate fixtures directory

**Handcrafted:**
- Create minimal valid example
- Focus on the specific scenario you're testing

**Step 2: Clean the Data (if needed)**

- Remove sensitive information (API keys, internal URLs)
- Simplify if too large (keep only relevant parts)
- Format for readability (pretty-print JSON/XML)
- Add comments if necessary (XML comments, JSON doesn't support them)

**Step 3: Name the File**

Follow naming convention:
```
{service-type}-{source}-{version}.{ext}

Examples:
- capabilities-newservice-2-0-0.xml
- root-custom-service.json
- getfeature-edgecase-1-1-0.xml
```

**Step 4: Place in Correct Directory**
```
fixtures/{service-type}/{filename}

Examples:
- fixtures/wfs/capabilities-newservice-2-0-0.xml
- fixtures/ogc-api/root-custom-service.json
```

**Step 5: Write Tests Using the Fixture**

```typescript
describe('New Service Parsing', () => {
  it('should parse capabilities from new service', () => {
    const xml = readFixture('wfs/capabilities-newservice-2-0-0.xml');
    const result = parseWfsCapabilities(xml);
    
    expect(result.version).toBe('2.0.0');
    // Add more assertions...
  });
});
```

**Step 6: Document the Source**

Add a comment in your test file explaining the fixture:
```typescript
it('should parse capabilities from new service', () => {
  // Fixture source: https://newservice.example.com/wfs?request=GetCapabilities
  // Captured: 2026-02-07
  // Notes: Tests UTF-8 encoding with international characters
  const xml = readFixture('wfs/capabilities-newservice-2-0-0.xml');
  // ...
});
```

### 6.3 Fixture Quality Guidelines

**A good fixture should:**

1. **Be Representative** - Reflects real-world or spec-compliant data
2. **Be Minimal** - Contains only what's needed for testing
3. **Be Valid** - Follows the specification format
4. **Be Readable** - Properly formatted (pretty-printed)
5. **Be Documented** - Test file explains its purpose

**Example: Good vs. Bad Fixtures**

**❌ Bad Fixture (too large, unreadable):**
```json
{"title":"Service","links":[{"href":"http://example.org/collections","rel":"data"},{"href":"http://example.org/api","rel":"service-desc"},{"href":"http://example.org/conformance","rel":"conformance"},{"href":"http://example.org/collections/lakes","rel":"data"},{"href":"http://example.org/collections/roads","rel":"data"},...hundreds more lines...]}
```

**✅ Good Fixture (focused, readable):**
```json
{
  "title": "OGC API Features Service",
  "description": "Test fixture for root endpoint",
  "links": [
    {
      "href": "http://example.org/collections",
      "rel": "data",
      "type": "application/json",
      "title": "Collections"
    },
    {
      "href": "http://example.org/conformance",
      "rel": "conformance",
      "type": "application/json",
      "title": "Conformance"
    }
  ]
}
```

---

## 7. Fixture Naming Conventions

### 7.1 General Pattern

```
{service-type}-{source}-{version-or-purpose}.{ext}
```

**Components:**

1. **service-type** (optional) - What kind of response
   - `capabilities`, `getfeature`, `describefeaturetype`, `root`, `collections`

2. **source** - Where it came from
   - Service name: `pigma`, `geo2france`, `gnosis-earth`
   - Purpose: `sample`, `invalid`, `edgecase`
   - Spec: `ogc-spec`, `example`

3. **version-or-purpose** - Spec version or test purpose
   - Version: `2-0-0`, `1-1-0`, `1-3-0`
   - Purpose: `error`, `minimal`, `maximal`

4. **ext** - File extension
   - `.xml` for XML fixtures
   - `.json` for JSON fixtures

### 7.2 Examples by Category

**OGC API Fixtures:**
```
root-gnosis-earth.json           # Root response from Gnosis Earth
sample-data.json                 # Generic sample from spec
collections-example.json         # Collections listing
invalid.json                     # Invalid/malformed for error testing
```

**WFS Fixtures:**
```
capabilities-pigma-2-0-0.xml     # Capabilities from Pigma, WFS 2.0.0
getfeature-states-1-1-0.xml      # GetFeature response, WFS 1.1.0
exception-report-2-0-0.xml       # Error response, WFS 2.0.0
describefeaturetype-pigma-1-1-0-xsd.xml  # Feature schema
```

**WMS Fixtures:**
```
capabilities-brgm-1-3-0.xml      # Capabilities from BRGM, WMS 1.3.0
capabilities-brgm-1-1-1-utf-16.xml  # With specific encoding
service-exception-report-1-1-1.xml  # Error response
```

**WMTS Fixtures:**
```
arcgis.xml                       # ArcGIS Server WMTS capabilities
capabilities-example-1-0-0.xml   # Generic WMTS 1.0.0 example
```

### 7.3 Version Notation

**Use hyphens instead of dots:**
- ✅ `2-0-0` (correct)
- ❌ `2.0.0` (avoid - can cause issues on some filesystems)

**Examples:**
```
WFS 2.0.0 → 2-0-0
WMS 1.3.0 → 1-3-0
WFS 1.1.0 → 1-1-0
```

### 7.4 Special Cases

**Multiple fixtures from same source:**
```
capabilities-pigma-2-0-0.xml         # Full capabilities
capabilities-pigma-2-0-0-minimal.xml # Simplified version
capabilities-pigma-2-0-0-error.xml   # Error case
```

**Encoding variations:**
```
capabilities-brgm-1-1-1.xml              # Default UTF-8
capabilities-brgm-1-1-1-utf-16.xml       # UTF-16 encoded
capabilities-brgm-1-1-1-iso-8859-15.xml  # ISO-8859-15 encoded
```

---

## 8. Fixture Maintenance

### 8.1 When to Update Fixtures

**Update a fixture when:**
- OGC specification is updated
- Real service changes its response format
- Bug fix requires more accurate test data
- New required fields are added to specs

**How to update:**
1. Make changes to fixture file
2. Run tests to verify they still pass
3. Update tests if assertions need to change
4. Commit with clear message explaining why fixture changed

### 8.2 Deprecated Fixtures

When a fixture is no longer needed:

1. **Don't delete immediately** - Other tests might depend on it
2. **Search for usage** - `grep -r "fixture-name" test/`
3. **Update or remove tests** - Migrate tests to use different fixture
4. **Then delete** - Remove unused fixture file

### 8.3 Git History as Documentation

**Fixture provenance is tracked via git:**

```bash
# See when a fixture was added and why
git log --follow fixtures/wfs/capabilities-pigma-2-0-0.xml

# See who added it
git log --format="%an - %s" fixtures/wfs/capabilities-pigma-2-0-0.xml

# See the full commit that added it
git show $(git log --format=%H fixtures/wfs/capabilities-pigma-2-0-0.xml | tail -1)
```

**Commit messages should explain:**
- Where the fixture came from
- Why it was added
- What test scenario it covers

**Example good commit message:**
```
Add WFS 2.0.0 capabilities fixture from Pigma service

- Captured from https://www.pigma.org/geoserver/wfs?request=GetCapabilities
- Tests parsing of real-world WFS 2.0.0 service
- Includes all common feature types and metadata
- Needed for Issue #123: Support Pigma-specific metadata extension
```

---

## 9. Troubleshooting Fixture Issues

### 9.1 Common Problems

**Problem: Test fails with "Fixture not found"**

**Solution:**
```typescript
// Wrong - relative to test file
const xml = readFixture('capabilities-pigma-2-0-0.xml');

// Correct - include subdirectory
const xml = readFixture('wfs/capabilities-pigma-2-0-0.xml');
```

**Problem: Fixture has wrong encoding**

**Solution:**
```typescript
// Specify encoding explicitly
const xml = fs.readFileSync(fixturePath, 'utf-16');

// Or check BOM (Byte Order Mark) in file
```

**Problem: Fixture is too large, tests are slow**

**Solution:**
- Create a minimal version: `capabilities-pigma-2-0-0-minimal.xml`
- Keep only relevant parts for your test
- Use smaller fixtures for unit tests, full fixtures for integration tests

**Problem: Fixture is outdated**

**Solution:**
- Capture fresh response from service
- Or manually update to match current spec version
- Run tests to verify changes don't break anything

### 9.2 Validating Fixtures

**XML Fixtures:**
```bash
# Validate against XSD schema
xmllint --schema schema.xsd fixtures/wfs/capabilities-pigma-2-0-0.xml

# Check if well-formed
xmllint --noout fixtures/wfs/capabilities-pigma-2-0-0.xml
```

**JSON Fixtures:**
```bash
# Validate JSON syntax
jq . fixtures/ogc-api/sample-data.json

# Validate against JSON Schema
ajv validate -s schema.json -d fixtures/ogc-api/sample-data.json
```

---

## 10. Resources and References

### 10.1 OGC Specifications

- **OGC API - Features Part 1:** https://docs.ogc.org/is/17-069r4/17-069r4.html
- **WFS 2.0.0:** http://docs.opengeospatial.org/is/09-025r2/09-025r2.html
- **WMS 1.3.0:** http://portal.opengeospatial.org/files/?artifact_id=14416
- **WMTS 1.0.0:** http://portal.opengeospatial.org/files/?artifact_id=35326

### 10.2 Testing Best Practices

- **Martin Fowler on Test Fixtures:** https://martinfowler.com/bliki/TestFixture.html
- **Arrange-Act-Assert Pattern:** http://wiki.c2.com/?ArrangeActAssert
- **Test Data Builders:** https://www.jamesshore.com/v2/blog/2006/test-driven-development-example

### 10.3 Related Documentation

- [Testing Strategy](./testing-strategy.md) - Overall testing approach
- [Section 38: Testing Playbook](../research/testing/findings/38-testing-playbook-synthesis.md) - Comprehensive testing guide
- [Section 15 Part 2: Fixture Best Practices](../research/testing/findings/15-part-2-fixture-documentation-best-practices.md) - Research on fixture documentation

---

## 11. FAQ

**Q: Can I modify fixtures directly?**  
A: Yes, but run tests afterward to ensure nothing breaks. Commit with clear explanation of changes.

**Q: Should fixtures be real-world or spec examples?**  
A: Both are valuable. Real-world fixtures test compatibility; spec examples test correctness.

**Q: How big should fixtures be?**  
A: As small as possible while still being representative. Large fixtures are fine for integration tests, but create minimal versions for unit tests.

**Q: Can I add comments to fixtures?**  
A: XML supports comments (`<!-- -->`), but JSON doesn't. Put documentation in test files instead.

**Q: What if a service returns different data every time?**  
A: Capture one response and use it as fixture. The point is consistency, not currency.

**Q: Should I version-control fixtures?**  
A: Yes! Fixtures are code. They should be in git with everything else.

**Q: How do I know if we already have a fixture for something?**  
A: Check the appropriate `fixtures/{service-type}/` directory and read filenames. They're descriptive.

**Q: What about binary fixtures (images, etc.)?**  
A: We don't currently have binary fixtures, but they would go in the same structure if needed.

---

**Document Status:** Complete  
**Maintained By:** Testing team  
**Questions?** Open an issue or ask in team chat
