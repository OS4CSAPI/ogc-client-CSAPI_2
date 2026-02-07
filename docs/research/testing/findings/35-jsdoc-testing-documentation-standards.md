# Section 35: JSDoc Testing Documentation Standards

**Research Section:** 35 of 38  
**Phase:** 3 - Component Requirements  
**Based On:**
- Section 19: Test Organization and File Structure (test file patterns)
- Section 34: Test Utility and Helper Design (utility documentation)
- Implementation Guide (existing JSDoc standards)

**Research Completed:** February 6, 2026

---

## Executive Summary

This document defines JSDoc documentation standards for CSAPI test files to ensure tests are self-documenting, maintainable, and traceable to specifications. Based on analysis of upstream patterns (minimal JSDoc in tests) and existing implementation guide standards (comprehensive JSDoc for source code), this specification establishes lightweight but effective documentation practices for test files.

### Key Principles

1. **Intent over Implementation** - Document WHY (test intent) not WHAT (already in code)
2. **Specification Traceability** - Link tests to spec sections for requirements tracing
3. **Fixture Provenance** - Document where test data came from and what it represents
4. **Coverage Transparency** - Document what IS and ISN'T tested to expose gaps

### Documentation Philosophy

**Tests Are Living Documentation:**
- Test files serve as executable examples of API usage
- Well-named tests with clear structure reduce need for verbose comments
- JSDoc adds value by explaining intent, rationale, and context
- Over-documentation creates maintenance burden

**Balance Verbosity vs Value:**
- ✅ **Document**: Why test exists, spec traceability, fixture sources, known limitations
- ❌ **Don't Document**: What code does (visible from test structure), obvious assertions
- 🟡 **Sometimes Document**: Complex setup logic, non-obvious test data, tricky edge cases

### Upstream Findings

**Upstream Test Documentation (Minimal):**
- **NO file-level JSDoc** in any upstream test files
- **NO test case JSDoc** (tests are self-explanatory via naming)
- **Occasional inline comments** for complex logic (~4 instances across 10,000+ test lines)
- **Comments focus on "why"** not "what" (e.g., "prevent promise leaks", "mimic webapp behavior")

**Implication for CSAPI:**
- Don't over-document tests (upstream proves tests can be self-documenting)
- Use JSDoc selectively where it adds value
- Prioritize clear test names and structure over verbose comments

### Documentation Levels

| Level | Required | Optional | Never |
|-------|----------|----------|-------|
| **File** | Module identifier | Purpose, spec refs, fixture list | Implementation details |
| **Suite (describe)** | N/A | Complex setup rationale | What tests do (visible from names) |
| **Test (it)** | N/A | Non-obvious intent, fixture refs, spec refs | What assertions check (visible from code) |
| **Helper** | Signature (@param, @returns) | Purpose, examples | Internal implementation |

### Standard JSDoc Tags for Tests

| Tag | Purpose | Usage | Example |
|-----|---------|-------|---------|
| `@fileoverview` | File-level description | Optional | `@fileoverview Tests for System resource CRUD operations` |
| `@module` | Test module identifier | Optional | `@module tests/CSAPIQueryBuilder/systems` |
| `@specification` | Link to spec section | Recommended | `@specification OGC 23-001 §7.2` |
| `@fixture` | Reference test data file | Recommended | `@fixture fixtures/csapi/systems/system-123.json` |
| `@coverage` | What requirements tested | Optional | `@coverage Systems CRUD (create, read, update, delete)` |
| `@scenario` | Test scenario description | Optional | `@scenario User queries systems with bbox filter` |
| `@example` | Example usage | For helpers | `@example const url = buildResourceUrl(...)` |
| `@param` | Parameter documentation | For helpers | `@param {string} id - Resource ID` |
| `@returns` | Return value | For helpers | `@returns {Promise<string>} Resource URL` |
| `@throws` | Exception documentation | For helpers | `@throws {EndpointError} If resource not found` |
| `@deprecated` | Deprecation notice | For old patterns | `@deprecated Use newHelper() instead` |

---

## 1. Upstream Documentation Analysis

### 1.1 Upstream Test Documentation Inventory

**Analysis of 7 Upstream Test Suites:**

| Test Suite | Files | Total Lines | JSDoc Blocks | Inline Comments | Documentation Density |
|------------|-------|-------------|--------------|-----------------|----------------------|
| **WFS** | 7 | ~1,500 | 0 | ~5 | 0.3% |
| **WMS** | 4 | ~800 | 1 | ~3 | 0.5% |
| **WMTS** | 3 | ~600 | 0 | ~2 | 0.3% |
| **TMS** | 2 | ~400 | 0 | ~1 | 0.3% |
| **STAC** | 3 | ~800 | 0 | ~4 | 0.5% |
| **OGC-API** | 5 | ~3,500 | 0 | ~8 | 0.2% |
| **Shared** | 4 | ~600 | 0 | ~2 | 0.3% |
| **TOTAL** | **28** | **~8,200** | **1** | **~25** | **0.3%** |

**Key Finding:** Upstream has **NEAR-ZERO formal documentation** in test files (0.3% documentation density).

### 1.2 Upstream Documentation Patterns

**Pattern 1: No File-Level Documentation**

All 28 upstream test files have **NO** `@fileoverview`, `@module`, or file-level JSDoc comments. Files start directly with imports and test setup.

**Example from ogc-api/endpoint.spec.ts:**
```typescript
import OgcApiEndpoint from './endpoint.js';
import { readFile, stat } from 'fs/promises';
import * as path from 'path';

const FIXTURES_ROOT = path.join(__dirname, '../../fixtures/ogc-api');

beforeAll(() => {
  // Setup fetch mock...
});

describe('OgcApiEndpoint', () => {
  // Tests...
});
```

**Pattern 2: No Test Case Documentation**

Tests are self-documenting through naming and structure:

```typescript
describe('#info', () => {
  it('should return endpoint information', async () => {
    const info = await endpoint.info;
    expect(info).toHaveProperty('title');
    expect(info).toHaveProperty('description');
  });
  
  it('should throw error if info endpoint fails', async () => {
    // Test implementation...
  });
});
```

**Pattern 3: Minimal Inline Comments (Purpose-Driven)**

The **few comments** that exist explain **WHY** not **WHAT**:

```typescript
// Example 1: Explain non-obvious behavior
// if we're on the root path (e.g. /sample-data/), only answer if there's a trailing slash
// this is made to mimic the behavior of a webapp deployed on http://host.com/webapp/,
// where querying http://host.com/webapp would return a 404
if (url.pathname.split('/').length === 2 && !url.pathname.endsWith('/')) {
  return { ok: false, status: 404 };
}

// Example 2: Explain purpose of cleanup
// this will exhaust all microtasks, effectively preventing rejected promises from leaking between tests
await jest.runAllTimersAsync();

// Example 3: Clarify test focus
// For now we test that the method handles the case properly
it('should handle missing search endpoint', async () => {
  // Test implementation...
});
```

**Pattern 4: One JSDoc Block Found (Exception)**

Found **1 JSDoc block** in WMS capabilities test (409 lines into file):

```typescript
/**
 * @param {string} capabilitiesUrl
 */
function parseCapabilitiesUrl(capabilitiesUrl: string) {
  // Implementation...
}
```

This is the **ONLY** formal JSDoc in 8,200+ lines of test code.

### 1.3 Implications for CSAPI

**Upstream Demonstrates:**
1. ✅ **Tests CAN be self-documenting** through clear naming and structure
2. ✅ **Minimal documentation works** for straightforward test suites
3. ✅ **Comments focus on "why"** not "what" when they exist
4. ✅ **No file-level boilerplate** reduces maintenance burden

**CSAPI Differences Requiring More Documentation:**
1. **Specification Complexity** - CSAPI has complex spec with many conformance classes
2. **Resource Relationships** - Tests validate complex resource links and relationships
3. **Fixture Complexity** - CSAPI fixtures represent real sensor data with provenance
4. **Coverage Requirements** - Need to track which spec sections are tested

**Conclusion:** CSAPI needs **MORE documentation than upstream** but should remain **lightweight and focused on value**.

---

## 2. JSDoc Tag Reference for Test Documentation

### 2.1 Standard JSDoc Tags

These are standard JSDoc tags with established semantics:

#### @fileoverview

**Purpose:** High-level file description  
**Usage:** Optional at file level  
**When to Use:** For files testing complex components or multiple related features  

**Example:**
```typescript
/**
 * @fileoverview Tests for CSAPIQueryBuilder system resource operations
 * 
 * Validates CRUD operations for System resources including:
 * - Collection listing with filtering
 * - Individual resource retrieval
 * - System history queries
 * - Subsystem navigation
 * - Member system queries
 */
```

#### @module

**Purpose:** Test module identifier for navigation  
**Usage:** Optional at file level  
**When to Use:** For large test suites with many files  

**Example:**
```typescript
/**
 * @module tests/CSAPIQueryBuilder/systems
 */
```

#### @example

**Purpose:** Show example usage  
**Usage:** Required for helper functions, optional for complex tests  
**When to Use:** For test utilities and non-obvious test patterns  

**Example:**
```typescript
/**
 * Create test endpoint with mock conformance
 * 
 * @param options - Configuration options
 * @returns Initialized endpoint
 * 
 * @example
 * ```typescript
 * const endpoint = await createTestEndpoint({
 *   conformance: ['systems', 'deployments']
 * });
 * ```
 */
async function createTestEndpoint(options) {
  // Implementation...
}
```

#### @param

**Purpose:** Document function parameters  
**Usage:** Required for helper functions  
**When to Use:** For all test utility functions with parameters  

**Example:**
```typescript
/**
 * @param {string} url - URL to parse and validate
 * @param {object} expected - Expected URL components
 * @param {string} expected.protocol - Expected protocol (e.g., 'https:')
 * @param {string} expected.hostname - Expected hostname
 */
function parseAndValidateUrl(url, expected) {
  // Implementation...
}
```

#### @returns / @return

**Purpose:** Document return value  
**Usage:** Required for helper functions that return values  
**When to Use:** For all test utilities with return values  

**Example:**
```typescript
/**
 * @returns {ParsedURL} Parsed URL components
 */
function parseAndValidateUrl(url, expected): ParsedURL {
  // Implementation...
}
```

#### @throws

**Purpose:** Document exceptions thrown  
**Usage:** Required for helpers that throw errors  
**When to Use:** For utilities with error conditions  

**Example:**
```typescript
/**
 * @throws {Error} If URL parsing fails
 * @throws {ValidationError} If URL doesn't match expected components
 */
function parseAndValidateUrl(url, expected) {
  // Implementation...
}
```

#### @deprecated

**Purpose:** Mark deprecated test patterns or helpers  
**Usage:** Required when deprecating test utilities  
**When to Use:** During test refactoring or utility migration  

**Example:**
```typescript
/**
 * @deprecated Use parseAndValidateUrl() instead. This function will be
 *             removed in next test suite refactor.
 */
function parseUrl(url) {
  // Legacy implementation...
}
```

### 2.2 Custom Tags for Testing

These are CSAPI-specific tags for test documentation:

#### @specification

**Purpose:** Link test to specification section  
**Usage:** Recommended for tests validating spec requirements  
**Format:** `@specification <spec> <section>`  

**Examples:**
```typescript
/**
 * @specification OGC 23-001 §7.2
 */
it('should return system collection', async () => {
  // Test validates OGC 23-001 section 7.2 requirements
});

/**
 * @specification OGC 23-001 §7.2.1, §7.2.2
 */
describe('System CRUD Operations', () => {
  // Test suite validates multiple spec sections
});

/**
 * @specification OGC 23-001 Table 5 (System Properties)
 */
it('should include all required system properties', async () => {
  // Test validates table 5 requirements
});
```

**Spec Abbreviations:**
- `OGC 23-001` - Part 1: Feature Resources
- `OGC 23-002` - Part 2: Observation Data
- `OGC 23-003` - Part 3: Command & Control
- `RFC 8288` - Web Linking
- `RFC 3339` - Date/Time Format

#### @fixture

**Purpose:** Reference test data file used  
**Usage:** Recommended for tests using external fixtures  
**Format:** `@fixture <path> [description]`  

**Examples:**
```typescript
/**
 * @fixture fixtures/csapi/systems/system-123.json
 */
it('should parse system from fixture', async () => {
  const system = await loadFixture('csapi/systems/system-123.json');
  // Test using fixture...
});

/**
 * @fixture fixtures/csapi/systems/weather-station.json (Weather station with 3 subsystems)
 */
it('should navigate to subsystems', async () => {
  // Test using weather station fixture...
});

/**
 * @fixture fixtures/csapi/observations/temp-1000.csv (1000 temperature observations)
 */
it('should parse large observation dataset', async () => {
  // Test using large CSV fixture...
});
```

#### @coverage

**Purpose:** Document what requirements are tested  
**Usage:** Optional at file or suite level  
**Format:** `@coverage <description>`  

**Examples:**
```typescript
/**
 * @fileoverview Tests for System resource operations
 * @coverage System CRUD operations (OGC 23-001 §7.2)
 * @coverage System filtering (bbox, datetime, property queries)
 * @coverage System relationships (subsystems, deployments, datastreams)
 */

/**
 * @coverage Pagination with limit, offset, cursor parameters
 */
describe('System Pagination', () => {
  // Pagination tests...
});
```

#### @scenario

**Purpose:** Describe test scenario in user terms  
**Usage:** Optional for complex or high-level tests  
**Format:** `@scenario <user-facing description>`  

**Examples:**
```typescript
/**
 * @scenario User searches for weather stations within a geographic region
 * @specification OGC 23-001 §7.2.3 (Spatial Filtering)
 */
it('should filter systems by bounding box', async () => {
  const url = await builder.getSystems({ 
    bbox: [-180, -90, 180, 90] 
  });
  // Test implementation...
});

/**
 * @scenario User queries recent observations from a datastream
 * @specification OGC 23-002 §8.4
 */
it('should filter observations by datetime', async () => {
  // Test implementation...
});
```

### 2.3 Tag Combination Patterns

**Pattern 1: Spec-Driven Test**
```typescript
/**
 * Tests system collection endpoint returns properly formatted response
 * 
 * @specification OGC 23-001 §7.2.1 (Systems Collection)
 * @fixture fixtures/csapi/systems/systems-collection.json
 */
it('should return valid system collection', async () => {
  // Test implementation...
});
```

**Pattern 2: Complex Scenario Test**
```typescript
/**
 * @scenario User queries observations from deployed system at specific location
 * @specification OGC 23-002 §8.4 (Observation Filtering)
 * @fixture fixtures/csapi/deployments/field-deployment.json (Deployment with location)
 * @fixture fixtures/csapi/observations/deployment-obs.json (100 observations)
 */
it('should retrieve observations for deployed system', async () => {
  // Test implementation...
});
```

**Pattern 3: Coverage Documentation**
```typescript
/**
 * @fileoverview Tests for observation data retrieval
 * @module tests/CSAPIQueryBuilder/observations
 * @specification OGC 23-002 Part 2: Observation Data
 * @coverage Observation CRUD operations (§8.1-8.5)
 * @coverage Temporal filtering (datetime, phenomenonTime)
 * @coverage Spatial filtering (bbox, location)
 * @coverage Result filtering (observedProperty, procedure)
 */
```

---

## 3. Documentation Level Design

### 3.1 File-Level Documentation

**When to Add:**
- ✅ **YES**: Files testing complex components (e.g., CSAPIQueryBuilder)
- ✅ **YES**: Files covering multiple related features
- ✅ **YES**: Files using many fixtures or complex setup
- 🟡 **MAYBE**: Files with single, straightforward feature
- ❌ **NO**: Simple utility tests

**Required Elements:**
- Clear description of what is tested
- Module identifier (optional but recommended)

**Optional Elements:**
- Specification references
- Coverage summary
- Fixture inventory
- Known limitations

**Template:**
```typescript
/**
 * @fileoverview Tests for <component> <feature area>
 * @module tests/<component>/<feature>
 * 
 * [2-3 sentence overview of what this file tests]
 * 
 * @specification <primary spec reference>
 * @coverage <high-level coverage description>
 * @fixture <commonly used fixtures>
 */
```

**Example 1: Complex Component**
```typescript
/**
 * @fileoverview Tests for CSAPIQueryBuilder system resource operations
 * @module tests/CSAPIQueryBuilder/systems
 * 
 * Validates URL construction for system resource CRUD operations including
 * collection listing, individual retrieval, history queries, subsystem navigation,
 * and member system queries according to OGC 23-001 Part 1.
 * 
 * @specification OGC 23-001 §7.2 (Systems)
 * @coverage System CRUD, filtering, pagination, relationships
 * @fixture fixtures/csapi/systems/system-123.json (Standard system)
 * @fixture fixtures/csapi/systems/weather-station.json (System with subsystems)
 */

import { createTestQueryBuilder, parseAndValidateUrl } from '../test-utils/index.js';
// ... imports

describe('CSAPIQueryBuilder - Systems', () => {
  // Tests...
});
```

**Example 2: Simple Utility (NO file-level JSDoc)**
```typescript
import { parseAndValidateUrl } from '../test-utils.js';

describe('parseAndValidateUrl', () => {
  it('should parse valid URL', () => {
    // Test...
  });
});
```

### 3.2 Test Suite (describe block) Documentation

**When to Add:**
- 🟡 **MAYBE**: Complex setup requiring explanation
- 🟡 **MAYBE**: Suite testing specific spec section
- ❌ **NO**: Standard test suites (self-explanatory from naming)

**Rationale:** `describe` block names should be self-explanatory. Only add JSDoc if there's non-obvious context.

**Example 1: No Documentation Needed (Self-Explanatory)**
```typescript
describe('CSAPIQueryBuilder - Systems', () => {
  describe('getSystems()', () => {
    it('should construct systems collection URL', async () => {
      // Test...
    });
    
    it('should include limit parameter', async () => {
      // Test...
    });
  });
});
```

**Example 2: Documentation Adds Value**
```typescript
/**
 * Tests pagination behavior across all resource types.
 * 
 * Note: CSAPI spec allows both offset-based and cursor-based pagination.
 * These tests validate both patterns are supported.
 * 
 * @specification OGC 23-001 §6.4 (Pagination)
 */
describe('Pagination', () => {
  describe('offset-based pagination', () => {
    // Tests...
  });
  
  describe('cursor-based pagination', () => {
    // Tests...
  });
});
```

### 3.3 Test Case (it block) Documentation

**When to Add:**
- ✅ **YES**: Non-obvious test intent or rationale
- ✅ **YES**: Tests validating specific spec requirements
- ✅ **YES**: Tests using complex fixtures
- 🟡 **MAYBE**: Edge cases with subtle differences
- ❌ **NO**: Simple, self-explanatory tests

**Required Elements:**
- Clear explanation of test intent (WHY test exists)

**Optional Elements:**
- Specification reference
- Fixture reference
- Known limitations
- Related tests

**Example 1: No Documentation (Self-Explanatory)**
```typescript
it('should construct systems collection URL', async () => {
  const url = await builder.getSystems();
  
  parseAndValidateUrl(url, {
    pathname: '/systems',
    query: { f: 'json' }
  });
});
```

**Example 2: Documentation Adds Value**
```typescript
/**
 * Validates that system collection response includes required properties
 * per OGC 23-001 Table 4.
 * 
 * Required properties: id, type, properties.name, links
 * Optional properties: properties.description, properties.validTime, geometry
 * 
 * @specification OGC 23-001 §7.2.1, Table 4
 * @fixture fixtures/csapi/systems/system-123.json
 */
it('should include all required system properties', async () => {
  const system = await loadFixture('csapi/systems/system-123.json');
  
  expect(system).toHaveProperty('id');
  expect(system).toHaveProperty('type', 'Feature');
  expect(system.properties).toHaveProperty('name');
  expect(system).toHaveProperty('links');
});
```

**Example 3: Complex Scenario**
```typescript
/**
 * Tests temporal filtering with ISO 8601 intervals.
 * 
 * CSAPI supports both closed intervals (start/end) and open intervals
 * (../end or start/..). This test validates closed interval handling.
 * Open intervals are tested in separate test case.
 * 
 * @scenario User queries observations within a specific time range
 * @specification OGC 23-002 §8.4.2 (Temporal Filtering)
 */
it('should filter observations by closed datetime interval', async () => {
  const url = await builder.getObservations({
    datetime: '2024-01-01T00:00:00Z/2024-12-31T23:59:59Z'
  });
  
  expectQueryParam(url, 'datetime', '2024-01-01T00:00:00Z/2024-12-31T23:59:59Z');
});
```

### 3.4 Helper Function Documentation

**When to Add:**
- ✅ **ALWAYS**: All test utility functions in test-utils/

**Required Elements:**
- Clear description
- @param for all parameters
- @returns for return value
- @example showing usage

**Optional Elements:**
- @throws for error conditions
- @see for related utilities
- Implementation notes

**Template:**
```typescript
/**
 * <One-sentence description>
 * 
 * [Optional: 1-2 sentence elaboration on purpose or usage]
 * 
 * @param <name> - <description>
 * @param <name> - <description>
 * @returns <description>
 * @throws <exception> - <condition>
 * 
 * @example
 * ```typescript
 * <usage example>
 * ```
 * 
 * @see <related utility>
 */
function utilityName(params) {
  // Implementation...
}
```

**Example:**
```typescript
/**
 * Parse URL and validate expected components
 * 
 * Parses URL using native URL class and validates each provided expected
 * component matches. Throws descriptive error if any component doesn't match.
 * 
 * @param url - URL string to parse
 * @param expected - Expected URL components to validate
 * @param expected.protocol - Expected protocol (e.g., 'https:')
 * @param expected.hostname - Expected hostname
 * @param expected.pathname - Expected pathname
 * @param expected.query - Expected query parameters (as object)
 * @returns Parsed URL components
 * @throws {Error} If URL parsing fails
 * @throws {ValidationError} If URL doesn't match expected components
 * 
 * @example
 * ```typescript
 * const parsed = parseAndValidateUrl('https://api.example.com/systems?limit=10', {
 *   protocol: 'https:',
 *   hostname: 'api.example.com',
 *   pathname: '/systems',
 *   query: { limit: '10' }
 * });
 * // parsed.protocol === 'https:'
 * // parsed.query.limit === '10'
 * ```
 * 
 * @see expectQueryParam - For validating single query parameter
 */
function parseAndValidateUrl(url: string, expected: {
  protocol?: string;
  hostname?: string;
  pathname?: string;
  query?: Record<string, string>;
}): ParsedURL {
  // Implementation...
}
```

---

## 4. JSDoc Templates

### 4.1 File-Level Templates

#### Template 1: Standard Component Test File

```typescript
/**
 * @fileoverview Tests for <ComponentName> <feature area>
 * @module tests/<ComponentName>/<feature>
 * 
 * <2-3 sentence description of what this file tests>
 * 
 * @specification <primary spec reference>
 * @coverage <high-level coverage summary>
 */
```

**Usage:**
```typescript
/**
 * @fileoverview Tests for CSAPIQueryBuilder system resource operations
 * @module tests/CSAPIQueryBuilder/systems
 * 
 * Validates URL construction for system CRUD operations including collection
 * listing, individual retrieval, history queries, and subsystem navigation.
 * 
 * @specification OGC 23-001 §7.2 (Systems)
 * @coverage System CRUD, filtering, pagination, relationships
 */
```

#### Template 2: Format Parser Test File

```typescript
/**
 * @fileoverview Tests for <FormatName> format parsing
 * @module tests/parsers/<format>
 * 
 * <2-3 sentence description of format parsing capabilities>
 * 
 * @specification <format specification reference>
 * @fixture <commonly used format fixtures>
 */
```

**Usage:**
```typescript
/**
 * @fileoverview Tests for SensorML 3.0 format parsing
 * @module tests/parsers/sensorml
 * 
 * Validates parsing of SensorML 3.0 documents for system descriptions,
 * including physical systems, components, and process chains.
 * 
 * @specification OGC 23-000 (SensorML 3.0)
 * @fixture fixtures/csapi/sensorml/weather-station.xml
 * @fixture fixtures/csapi/sensorml/sensor-array.xml
 */
```

#### Template 3: Utility Test File (Minimal/None)

For test utility tests, **NO file-level JSDoc** is typically needed since utilities are simple and self-explanatory:

```typescript
import { parseAndValidateUrl } from '../test-utils.js';

describe('parseAndValidateUrl', () => {
  // Tests...
});
```

### 4.2 Test Case Templates

#### Template 1: Standard Test (No JSDoc)

Most tests should be self-documenting through naming:

```typescript
it('should <action> <expected result>', async () => {
  // Arrange
  const input = setupInput();
  
  // Act
  const result = await performAction(input);
  
  // Assert
  expect(result).toMatchExpected();
});
```

#### Template 2: Spec-Validated Test

```typescript
/**
 * <What is being validated in user terms>
 * 
 * @specification <spec reference>
 * @fixture <fixture file> [optional description]
 */
it('should <action> <expected result>', async () => {
  // Test implementation...
});
```

**Usage:**
```typescript
/**
 * Validates system collection response structure matches spec requirements
 * 
 * @specification OGC 23-001 §7.2.1, Table 4
 * @fixture fixtures/csapi/systems/systems-collection.json
 */
it('should return valid system collection', async () => {
  const collection = await loadFixture('csapi/systems/systems-collection.json');
  expectCollectionResponse(collection, { minItems: 1 });
});
```

#### Template 3: Scenario Test

```typescript
/**
 * @scenario <User-facing scenario description>
 * @specification <spec reference>
 * @fixture <fixture file> [optional description]
 */
it('should <action> <expected result>', async () => {
  // Test implementation...
});
```

**Usage:**
```typescript
/**
 * @scenario User queries observations from weather station during storm event
 * @specification OGC 23-002 §8.4
 * @fixture fixtures/csapi/observations/storm-event.json (500 observations, 2-hour window)
 */
it('should retrieve observations within datetime range', async () => {
  const url = await builder.getObservations({
    datetime: '2024-10-15T14:00:00Z/2024-10-15T16:00:00Z'
  });
  expectQueryParam(url, 'datetime', /2024-10-15T14:00:00Z\/2024-10-15T16:00:00Z/);
});
```

### 4.3 Helper Function Templates

#### Template 1: Test Utility

```typescript
/**
 * <One-sentence description>
 * 
 * [Optional elaboration]
 * 
 * @param <name> - <description>
 * @returns <description>
 * @throws <exception> - <condition>
 * 
 * @example
 * ```typescript
 * <usage example>
 * ```
 */
function utilityName(params): ReturnType {
  // Implementation...
}
```

#### Template 2: Setup Helper

```typescript
/**
 * <One-sentence description>
 * 
 * Creates and initializes <resource> with <configuration>.
 * 
 * @param options - Configuration options
 * @param options.<property> - <description>
 * @returns Initialized <resource>
 * 
 * @example
 * ```typescript
 * const endpoint = await createTestEndpoint({
 *   conformance: ['systems', 'deployments']
 * });
 * ```
 */
async function createTestEndpoint(options): Promise<Endpoint> {
  // Implementation...
}
```

#### Template 3: Assertion Helper

```typescript
/**
 * Assert <condition>
 * 
 * Validates <what is validated> and throws descriptive error if invalid.
 * 
 * @param value - Value to validate
 * @param options - Validation options
 * @throws {AssertionError} If validation fails
 * 
 * @example
 * ```typescript
 * expectValidIsoDate('2024-01-01T00:00:00Z');
 * expectValidIsoDate('2024-01-01T00:00:00.000Z', { allowMilliseconds: true });
 * ```
 */
function expectValidIsoDate(value: string, options?): void {
  // Implementation...
}
```

---

## 5. Documentation Standards and Guidelines

### 5.1 When JSDoc Is Required vs Optional

#### REQUIRED

**1. Test Utility Functions (test-utils/)**
- ✅ All public functions must have JSDoc
- ✅ Must include @param, @returns, @example
- ✅ Should include @throws if errors thrown

**2. Complex Test Setup**
- ✅ Non-obvious beforeAll/beforeEach logic
- ✅ Shared test context setup
- ✅ Mock configuration with tricky behavior

**3. Deprecated Code**
- ✅ Must use @deprecated tag
- ✅ Must specify migration path

#### RECOMMENDED

**1. File-Level Documentation**
- 🟡 Component test files (e.g., CSAPIQueryBuilder tests)
- 🟡 Format parser test files
- 🟡 Integration test files

**2. Specification-Linked Tests**
- 🟡 Tests validating specific spec sections
- 🟡 Tests with spec requirement traceability

**3. Fixture-Heavy Tests**
- 🟡 Tests using multiple fixtures
- 🟡 Tests with fixture provenance needs

#### OPTIONAL

**1. Test Suites (describe blocks)**
- 🟡 Only if adding context beyond name
- 🟡 For complex multi-suite relationships

**2. Individual Tests (it blocks)**
- 🟡 Only for non-obvious intent
- 🟡 For edge cases needing explanation

#### NEVER

**1. Simple Tests**
- ❌ Tests that are self-explanatory from name
- ❌ Tests with obvious assertions

**2. Implementation Details**
- ❌ Don't document what code does (visible from test)
- ❌ Don't document obvious assertions

**3. Redundant Information**
- ❌ Don't repeat information from test name
- ❌ Don't document framework behavior (e.g., how Jest works)

### 5.2 Documentation Style Guidelines

#### Style Rule 1: Write for Humans, Not Parsers

**❌ Bad (too formal):**
```typescript
/**
 * This function constructs a Uniform Resource Locator for the systems collection
 * endpoint by concatenating the base URL with the '/systems' path segment and
 * appending query parameters if provided.
 */
```

**✅ Good (clear and concise):**
```typescript
/**
 * Construct URL for systems collection endpoint
 * 
 * @param builder - Query builder instance
 * @param params - Optional query parameters
 * @returns Systems collection URL
 */
```

#### Style Rule 2: Focus on Intent (Why), Not Implementation (What)

**❌ Bad (describes what code does):**
```typescript
/**
 * This test calls builder.getSystems() with a limit parameter of 10,
 * then calls parseAndValidateUrl() to check if the URL contains 'limit=10'.
 */
it('should include limit parameter', async () => {
  // Test implementation...
});
```

**✅ Good (explains why test exists):**
```typescript
/**
 * Validates that limit parameter is properly encoded in query string
 * per OGC 23-001 §6.3 pagination requirements.
 * 
 * @specification OGC 23-001 §6.3
 */
it('should include limit parameter', async () => {
  // Test implementation...
});
```

#### Style Rule 3: Be Concise but Complete

**❌ Bad (too verbose):**
```typescript
/**
 * This test validates that when a user calls the getSystems method on the
 * CSAPIQueryBuilder instance with a bounding box filter parameter consisting
 * of four numeric values representing the minimum longitude, minimum latitude,
 * maximum longitude, and maximum latitude, the resulting URL contains the
 * bbox query parameter with all four values properly encoded and separated
 * by commas as required by the OGC API specification.
 */
```

**✅ Good (concise but complete):**
```typescript
/**
 * Validates bbox parameter encoding in systems query URL
 * 
 * @specification OGC 23-001 §7.2.3 (Spatial Filtering)
 */
it('should encode bbox parameter correctly', async () => {
  // Test implementation...
});
```

#### Style Rule 4: Use Active Voice

**❌ Bad (passive voice):**
```typescript
/**
 * The system collection is retrieved and validated against spec requirements.
 */
```

**✅ Good (active voice):**
```typescript
/**
 * Retrieve system collection and validate against spec requirements
 */
```

#### Style Rule 5: Use Present Tense

**❌ Bad (future/past tense):**
```typescript
/**
 * This test will validate that systems are filtered by bbox.
 */
```

**✅ Good (present tense):**
```typescript
/**
 * Validates that systems are filtered by bbox
 */
```

### 5.3 Specification Linking Standards

#### Format: @specification Tag

**Pattern:**
```typescript
@specification <spec-abbrev> <section> [optional: title]
```

**Spec Abbreviations:**
- `OGC 23-001` - Part 1: Feature Resources
- `OGC 23-002` - Part 2: Observation Data
- `OGC 23-003` - Part 3: Command & Control
- `OGC 23-000` - SensorML 3.0
- `RFC 8288` - Web Linking
- `RFC 3339` - Date/Time Format
- `RFC 9110` - HTTP Semantics

**Section Formats:**
- `§7.2` - Section number
- `§7.2.1` - Subsection
- `Table 4` - Table reference
- `Figure 3` - Figure reference
- `Req 15` - Requirement reference

**Examples:**
```typescript
// Single section
@specification OGC 23-001 §7.2

// Multiple sections
@specification OGC 23-001 §7.2.1, §7.2.2

// Section with title (optional)
@specification OGC 23-001 §7.2 (Systems)

// Table reference
@specification OGC 23-001 Table 4 (System Properties)

// Requirement reference
@specification OGC 23-001 Req 15 (System Collection Response)

// Multiple specs
@specification OGC 23-001 §7.2, RFC 8288 §3.3
```

### 5.4 Fixture Reference Standards

#### Format: @fixture Tag

**Pattern:**
```typescript
@fixture <relative-path> [optional: description]
```

**Path Format:**
- Relative to `fixtures/` directory
- Use forward slashes
- Include file extension

**Examples:**
```typescript
// Simple reference
@fixture csapi/systems/system-123.json

// With description
@fixture csapi/systems/weather-station.json (Weather station with 3 subsystems)

// Multiple fixtures
@fixture csapi/systems/system-123.json (Standard system)
@fixture csapi/deployments/deployment-456.json (Field deployment)

// Complex fixture
@fixture csapi/observations/temp-1000.csv (1000 temperature observations, 24-hour period)
```

#### Fixture Description Guidelines

**Include in description:**
- ✅ Number of records (for collections/datasets)
- ✅ Time range (for temporal data)
- ✅ Special characteristics (e.g., "with subsystems", "missing optional fields")
- ✅ Data source if relevant (e.g., "from NOAA weather station")

**Don't include:**
- ❌ Implementation details (e.g., "uses fetch mock")
- ❌ File format (visible from extension)
- ❌ Redundant information (e.g., "fixture file located at...")

### 5.5 Example Code Standards

#### Format: @example Tag

**Pattern:**
```typescript
@example
```typescript
<code example>
```
```

**Example Guidelines:**

**1. Show Complete Usage**
```typescript
/**
 * @example
 * ```typescript
 * const endpoint = await createTestEndpoint({
 *   conformance: ['systems', 'deployments']
 * });
 * const builder = await endpoint.csapi('test-collection');
 * const url = await builder.getSystems();
 * ```
 */
```

**2. Include Expected Output**
```typescript
/**
 * @example
 * ```typescript
 * const parsed = parseAndValidateUrl('https://api.example.com/systems?limit=10', {
 *   pathname: '/systems',
 *   query: { limit: '10' }
 * });
 * // parsed.protocol === 'https:'
 * // parsed.query.limit === '10'
 * ```
 */
```

**3. Show Multiple Use Cases**
```typescript
/**
 * @example
 * ```typescript
 * // Basic usage
 * expectValidIsoDate('2024-01-01T00:00:00Z');
 * 
 * // With milliseconds
 * expectValidIsoDate('2024-01-01T00:00:00.000Z', { allowMilliseconds: true });
 * 
 * // With timezone
 * expectValidIsoDate('2024-01-01T00:00:00+01:00', { allowTimeZone: true });
 * ```
 */
```

**4. Keep Examples Concise**
- ✅ Focus on key usage patterns
- ✅ Use realistic but simple data
- ✅ Include comments for clarity
- ❌ Don't show every parameter combination
- ❌ Don't include error handling (unless demonstrating error cases)

### 5.6 Documentation Review Process

#### Review Checklist

**Documentation Quality:**
- [ ] JSDoc adds value (not redundant with code)
- [ ] Explains WHY not just WHAT
- [ ] Uses clear, concise language
- [ ] Uses active voice and present tense
- [ ] Examples are accurate and helpful
- [ ] Specification references are correct
- [ ] Fixture references are accurate

**Documentation Completeness:**
- [ ] All required JSDoc is present (utilities, complex setup)
- [ ] @param documented for all parameters
- [ ] @returns documented for return values
- [ ] @throws documented for error conditions
- [ ] @example shows complete usage

**Documentation Consistency:**
- [ ] Follows template patterns
- [ ] Uses standard tag formats
- [ ] Spec abbreviations are correct
- [ ] Fixture paths are correct
- [ ] Consistent terminology

**Documentation Maintenance:**
- [ ] No outdated references to old code
- [ ] No references to removed fixtures
- [ ] @deprecated tags added for old patterns
- [ ] Updated when code changes

#### Review Roles

**Developer (Author):**
1. Add JSDoc per standards before committing
2. Self-review against checklist
3. Ensure examples are tested/accurate

**Reviewer (Code Review):**
1. Verify JSDoc adds value
2. Check spec references are accurate
3. Validate examples work as shown
4. Suggest improvements for clarity

**Maintainer (Periodic):**
1. Audit test documentation quarterly
2. Remove outdated JSDoc
3. Update spec references for new versions
4. Consolidate duplicate documentation

---

## 6. Documentation Patterns and Anti-Patterns

### 6.1 Good Patterns

#### Pattern 1: Specification-Driven Documentation

**✅ Good:**
```typescript
/**
 * Validates system response includes all required properties per spec
 * 
 * Required by OGC 23-001 Table 4:
 * - id (unique identifier)
 * - type (must be 'Feature')
 * - properties.name (human-readable name)
 * - links (at least self relation)
 * 
 * @specification OGC 23-001 §7.2.1, Table 4
 */
it('should include all required system properties', async () => {
  // Test implementation...
});
```

**Why good:**
- ✅ Links to spec for traceability
- ✅ Explains what requirements are validated
- ✅ Lists specific properties being checked

#### Pattern 2: Fixture Provenance Documentation

**✅ Good:**
```typescript
/**
 * @fileoverview Tests for observation data parsing
 * @module tests/parsers/observations
 * 
 * Tests use real observation data from NOAA weather stations:
 * 
 * @fixture csapi/observations/noaa-temp-hourly.csv (NOAA station KORD, 24 hours)
 * @fixture csapi/observations/noaa-wind-10min.csv (NOAA station KJFK, 6 hours)
 * @fixture csapi/observations/noaa-precip-daily.csv (NOAA station KSEA, 30 days)
 * 
 * Fixtures generated from NOAA API on 2024-01-15.
 */
```

**Why good:**
- ✅ Documents where test data came from
- ✅ Includes temporal scope of data
- ✅ Notes when fixtures were generated
- ✅ Helps future maintainers understand test data

#### Pattern 3: Complex Scenario Documentation

**✅ Good:**
```typescript
/**
 * Tests end-to-end workflow for querying observations from deployed system
 * 
 * @scenario User finds weather station deployment by location, retrieves its
 *           datastreams, then queries recent observations from temperature sensor.
 * 
 * @specification OGC 23-001 §7.3 (Deployments)
 * @specification OGC 23-002 §8.4 (Observations)
 * @fixture csapi/deployments/weather-deployment.json (Deployment with location and datastreams)
 * @fixture csapi/observations/temp-recent.json (100 observations, last 24 hours)
 */
it('should retrieve observations from deployed system datastream', async () => {
  // Multi-step test implementation...
});
```

**Why good:**
- ✅ Explains high-level scenario
- ✅ Links to multiple spec sections
- ✅ Documents fixtures with context
- ✅ Helps understand test purpose

#### Pattern 4: Minimal Documentation for Simple Tests

**✅ Good:**
```typescript
it('should construct systems collection URL', async () => {
  const url = await builder.getSystems();
  parseAndValidateUrl(url, { pathname: '/systems' });
});

it('should include limit parameter', async () => {
  const url = await builder.getSystems({ limit: 10 });
  expectQueryParam(url, 'limit', '10');
});

it('should include bbox parameter', async () => {
  const url = await builder.getSystems({ bbox: [0, 0, 1, 1] });
  expectQueryParam(url, 'bbox', '0,0,1,1');
});
```

**Why good:**
- ✅ Tests are self-explanatory from names
- ✅ No redundant JSDoc
- ✅ Clean and readable
- ✅ Easy to maintain

### 6.2 Anti-Patterns

#### Anti-Pattern 1: Redundant Documentation

**❌ Bad:**
```typescript
/**
 * This test tests that the getSystems method returns a valid URL.
 * It calls builder.getSystems() and expects the result to be a valid URL.
 */
it('should return valid URL', async () => {
  const url = await builder.getSystems();
  expectValidUrl(url);
});
```

**Why bad:**
- ❌ JSDoc repeats test name
- ❌ Describes WHAT code does (visible from test)
- ❌ Adds no value
- ❌ Creates maintenance burden

**✅ Fix: Remove JSDoc (test is self-explanatory)**
```typescript
it('should return valid URL', async () => {
  const url = await builder.getSystems();
  expectValidUrl(url);
});
```

#### Anti-Pattern 2: Implementation Documentation

**❌ Bad:**
```typescript
/**
 * This test mocks the fetch function to return a system collection JSON response,
 * then calls builder.getSystems() which internally calls fetch, then parses
 * the returned URL using parseAndValidateUrl helper.
 */
it('should construct systems URL', async () => {
  // Test implementation...
});
```

**Why bad:**
- ❌ Documents HOW test works (implementation details)
- ❌ Not useful for understanding test purpose
- ❌ Becomes outdated when implementation changes

**✅ Fix: Document WHY test exists**
```typescript
/**
 * Validates systems collection URL construction per spec
 * 
 * @specification OGC 23-001 §7.2
 */
it('should construct systems URL', async () => {
  // Test implementation...
});
```

#### Anti-Pattern 3: Obvious Assertions Documentation

**❌ Bad:**
```typescript
/**
 * Expects the system object to have an 'id' property.
 * Expects the system object to have a 'type' property with value 'Feature'.
 * Expects the system.properties object to have a 'name' property.
 */
it('should have required properties', async () => {
  expect(system).toHaveProperty('id');
  expect(system).toHaveProperty('type', 'Feature');
  expect(system.properties).toHaveProperty('name');
});
```

**Why bad:**
- ❌ JSDoc repeats assertions (visible from code)
- ❌ No additional context provided
- ❌ Must be updated when assertions change

**✅ Fix: Document spec requirement, not assertions**
```typescript
/**
 * Validates required properties per OGC 23-001 Table 4
 * 
 * @specification OGC 23-001 Table 4
 */
it('should have required properties', async () => {
  expect(system).toHaveProperty('id');
  expect(system).toHaveProperty('type', 'Feature');
  expect(system.properties).toHaveProperty('name');
});
```

#### Anti-Pattern 4: Over-Documentation

**❌ Bad:**
```typescript
/**
 * @fileoverview Tests for parseAndValidateUrl utility function
 * @module tests/test-utils/url
 * @author John Doe <john@example.com>
 * @since v1.0.0
 * @version 2.1.3
 * @copyright © 2024 Example Corp
 * @license MIT
 * 
 * This file contains comprehensive tests for the parseAndValidateUrl utility
 * function which is used throughout the test suite to parse URLs and validate
 * their components match expected values.
 * 
 * The parseAndValidateUrl function takes two parameters: a URL string and an
 * expected object containing the expected values for protocol, hostname,
 * pathname, and query parameters.
 * 
 * @see test-utils.ts For implementation
 * @see ../CSAPIQueryBuilder/systems.spec.ts For usage examples
 * 
 * @specification N/A (internal utility)
 * @coverage URL parsing and validation
 * 
 * @example
 * ```typescript
 * import { parseAndValidateUrl } from './test-utils.js';
 * // See tests below for usage examples
 * ```
 */
```

**Why bad:**
- ❌ Excessive metadata (@author, @version, @copyright not useful in tests)
- ❌ Repetitive descriptions
- ❌ Too many cross-references
- ❌ High maintenance burden

**✅ Fix: Minimal file-level JSDoc**
```typescript
/**
 * @module tests/test-utils/url
 * 
 * Tests for URL parsing and validation utilities
 */
```

#### Anti-Pattern 5: Missing Context for Complex Tests

**❌ Bad:**
```typescript
it('should handle edge case', async () => {
  const url = await builder.getSystems({ 
    datetime: '../2024-12-31T23:59:59Z' 
  });
  expectQueryParam(url, 'datetime', '../2024-12-31T23:59:59Z');
});
```

**Why bad:**
- ❌ "Edge case" not explained
- ❌ Non-obvious datetime format (open interval) not documented
- ❌ No spec reference for why this format is supported

**✅ Fix: Add context for non-obvious behavior**
```typescript
/**
 * Validates open interval support (unbounded start, bounded end)
 * 
 * CSAPI supports ISO 8601 intervals including open intervals using '..'
 * for unbounded start or end per RFC 3339.
 * 
 * @specification RFC 3339 §5.6 (Time Intervals)
 */
it('should handle open interval (unbounded start)', async () => {
  const url = await builder.getSystems({ 
    datetime: '../2024-12-31T23:59:59Z' 
  });
  expectQueryParam(url, 'datetime', '../2024-12-31T23:59:59Z');
});
```

---

## 7. Implementation Estimates

### 7.1 Documentation Effort by Test File Type

| File Type | Avg Tests | Avg Lines | JSDoc Blocks | JSDoc Lines | % Overhead | Effort per File |
|-----------|-----------|-----------|--------------|-------------|------------|-----------------|
| **QueryBuilder (URL)** | 40 | 200 | 1 file + 5 tests | 30 | 15% | 30 min |
| **QueryBuilder (Parser)** | 30 | 150 | 1 file + 3 tests | 20 | 13% | 20 min |
| **Format Parser** | 25 | 250 | 1 file + 4 tests | 25 | 10% | 25 min |
| **Utilities** | 15 | 100 | 15 functions | 75 | 75% | 60 min |
| **Integration** | 10 | 150 | 1 file + 3 tests | 25 | 17% | 25 min |
| **Simple Utility Tests** | 10 | 80 | 0 | 0 | 0% | 0 min |

**Notes:**
- Utility tests require most documentation (75% overhead - comprehensive JSDoc for all functions)
- Simple test files require NO documentation (0% overhead - self-explanatory tests)
- Average test file: ~15% documentation overhead

### 7.2 Total Documentation Effort Estimate

**CSAPI Test Suite Estimates:**

| Component | Test Files | Avg Effort | Total Effort |
|-----------|------------|------------|--------------|
| **QueryBuilder Tests** | 40 | 25 min | 16.7 hours |
| **Format Parsers** | 10 | 25 min | 4.2 hours |
| **Test Utilities** | 5 | 60 min | 5 hours |
| **Integration Tests** | 10 | 25 min | 4.2 hours |
| **Simple Utility Tests** | 15 | 0 min | 0 hours |
| **TOTAL** | **80** | **avg 22 min** | **30 hours** |

**Documentation phases:**
1. **Initial Documentation** (during test writing): ~30 hours
2. **Maintenance** (updates as code changes): ~5% of test maintenance time
3. **Review** (in code reviews): ~10 min per PR with test changes

### 7.3 Documentation Value vs Cost Analysis

**Benefits of Documentation:**
- ✅ **Specification Traceability**: Can trace tests to spec requirements (value: HIGH)
- ✅ **Maintenance Aid**: Future developers understand test intent (value: HIGH)
- ✅ **Fixture Understanding**: Know what test data represents (value: MEDIUM)
- ✅ **Coverage Visibility**: Identify gaps in test coverage (value: MEDIUM)

**Costs of Documentation:**
- ❌ **Initial Time**: ~30 hours to document 80 test files (cost: MEDIUM)
- ❌ **Maintenance**: Keep JSDoc in sync with code changes (cost: LOW)
- ❌ **Review Time**: Validate documentation accuracy (cost: LOW)

**ROI Analysis:**
- **Value**: HIGH (traceability, maintainability)
- **Cost**: MEDIUM (initial time), LOW (maintenance)
- **Recommendation**: **PROCEED** - Benefits outweigh costs

**Optimization:**
- Focus documentation on HIGH-VALUE tests (spec validation, complex scenarios)
- Skip documentation for SIMPLE tests (self-explanatory)
- Use templates to reduce writing time
- Review documentation in code reviews (minimal overhead)

---

## 8. Documentation Examples

### 8.1 Complete File Example: Systems Resource Tests

```typescript
/**
 * @fileoverview Tests for CSAPIQueryBuilder system resource operations
 * @module tests/CSAPIQueryBuilder/systems
 * 
 * Validates URL construction and parameter encoding for system resource CRUD
 * operations including collection listing, individual retrieval, history queries,
 * subsystem navigation, and member system queries.
 * 
 * @specification OGC 23-001 §7.2 (Systems)
 * @coverage System CRUD operations, filtering, pagination, relationships
 * @fixture fixtures/csapi/systems/system-123.json (Standard system)
 * @fixture fixtures/csapi/systems/weather-station.json (System with subsystems)
 */

import { 
  createTestQueryBuilder, 
  parseAndValidateUrl, 
  expectQueryParam,
  cleanupTest 
} from '../test-utils/index.js';

describe('CSAPIQueryBuilder - Systems', () => {
  let builder: CSAPIQueryBuilder;
  
  beforeEach(async () => {
    builder = await createTestQueryBuilder({ 
      conformance: ['systems'] 
    });
  });
  
  afterEach(async () => {
    await cleanupTest();
  });
  
  describe('getSystems()', () => {
    it('should construct systems collection URL', async () => {
      const url = await builder.getSystems();
      
      parseAndValidateUrl(url, {
        pathname: '/systems',
        query: { f: 'json' }
      });
    });
    
    /**
     * Validates limit parameter encoding per pagination spec
     * 
     * @specification OGC 23-001 §6.3 (Pagination)
     */
    it('should include limit parameter', async () => {
      const url = await builder.getSystems({ limit: 10 });
      expectQueryParam(url, 'limit', '10');
    });
    
    /**
     * Validates spatial filtering with bounding box
     * 
     * Tests that bbox parameter is properly encoded as comma-separated
     * coordinates (minLon,minLat,maxLon,maxLat) per spec.
     * 
     * @specification OGC 23-001 §7.2.3 (Spatial Filtering)
     */
    it('should include bbox parameter', async () => {
      const url = await builder.getSystems({ 
        bbox: [-180, -90, 180, 90] 
      });
      expectQueryParam(url, 'bbox', '-180,-90,180,90');
    });
  });
  
  describe('getSystem()', () => {
    it('should construct individual system URL', async () => {
      const url = await builder.getSystem('sys-123');
      
      parseAndValidateUrl(url, {
        pathname: '/systems/sys-123'
      });
    });
  });
  
  /**
   * Tests system history query endpoint per spec
   * 
   * System history provides temporal versions of system metadata,
   * allowing users to see how system properties changed over time.
   * 
   * @specification OGC 23-001 §7.2.4 (System History)
   */
  describe('getSystemHistory()', () => {
    it('should construct system history URL', async () => {
      const url = await builder.getSystemHistory('sys-123');
      
      parseAndValidateUrl(url, {
        pathname: '/systems/sys-123/history'
      });
    });
    
    /**
     * @specification OGC 23-001 §7.2.4, RFC 3339 §5.6
     */
    it('should include datetime filter', async () => {
      const url = await builder.getSystemHistory('sys-123', {
        datetime: '2024-01-01T00:00:00Z/2024-12-31T23:59:59Z'
      });
      
      expectQueryParam(url, 'datetime', '2024-01-01T00:00:00Z/2024-12-31T23:59:59Z');
    });
  });
});
```

### 8.2 Utility Function Example

```typescript
/**
 * Parse URL and validate expected components
 * 
 * Parses URL using native URL class and validates each provided expected
 * component matches. Throws descriptive error if any component doesn't match.
 * Useful for validating URL construction in builder tests.
 * 
 * @param url - URL string to parse
 * @param expected - Expected URL components to validate
 * @param expected.protocol - Expected protocol (e.g., 'https:')
 * @param expected.hostname - Expected hostname
 * @param expected.pathname - Expected pathname
 * @param expected.query - Expected query parameters (as object)
 * @returns Parsed URL components for further assertions
 * @throws {Error} If URL parsing fails
 * @throws {ValidationError} If URL doesn't match expected components
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const parsed = parseAndValidateUrl('https://api.example.com/systems?limit=10', {
 *   protocol: 'https:',
 *   hostname: 'api.example.com',
 *   pathname: '/systems',
 *   query: { limit: '10' }
 * });
 * 
 * // Partial validation (only check pathname)
 * parseAndValidateUrl(url, { pathname: '/systems' });
 * 
 * // With complex query params
 * parseAndValidateUrl(url, {
 *   pathname: '/observations',
 *   query: {
 *     bbox: '-180,-90,180,90',
 *     datetime: '2024-01-01T00:00:00Z/2024-12-31T23:59:59Z'
 *   }
 * });
 * ```
 * 
 * @see expectQueryParam - For validating single query parameter
 * @see buildResourceUrl - For constructing URLs in tests
 */
export function parseAndValidateUrl(
  url: string,
  expected: {
    protocol?: string;
    hostname?: string;
    pathname?: string;
    query?: Record<string, string>;
  }
): ParsedURL {
  // Implementation...
}
```

### 8.3 Complex Scenario Example

```typescript
/**
 * Tests end-to-end workflow for querying observations from deployed sensor
 * 
 * Simulates real-world scenario where user:
 * 1. Finds weather station deployment by location (bbox query)
 * 2. Retrieves deployment's associated datastreams
 * 3. Queries recent observations from temperature datastream
 * 4. Filters observations by time range
 * 
 * This integration test validates that resource relationships work correctly
 * across multiple API calls and that query parameters are properly propagated.
 * 
 * @scenario User queries observations from weather station in specific region
 * @specification OGC 23-001 §7.3 (Deployments)
 * @specification OGC 23-002 §8.1 (DataStreams), §8.4 (Observations)
 * @fixture fixtures/csapi/deployments/weather-deployment.json (Deployment at 45°N, -122°W)
 * @fixture fixtures/csapi/datastreams/temp-datastream.json (Temperature sensor datastream)
 * @fixture fixtures/csapi/observations/temp-recent.json (100 observations, last 24 hours)
 */
it('should retrieve observations from deployed system datastream', async () => {
  // Step 1: Find deployment by location
  const deploymentUrl = await builder.getDeployments({ 
    bbox: [-123, 44, -121, 46] 
  });
  const deployments = await fetch(deploymentUrl).then(r => r.json());
  const deployment = deployments.features[0];
  
  // Step 2: Get datastreams for deployed system
  const datastreamUrl = await builder.getDatastreamsForSystem(
    deployment.properties.system.id
  );
  const datastreams = await fetch(datastreamUrl).then(r => r.json());
  const tempDatastream = datastreams.features.find(
    ds => ds.properties.observedProperty === 'Temperature'
  );
  
  // Step 3: Query recent observations
  const obsUrl = await builder.getObservationsForDatastream(
    tempDatastream.id,
    { 
      datetime: '../2024-02-06T00:00:00Z',  // Open interval: all observations up to now
      limit: 100 
    }
  );
  
  // Validate final URL
  parseAndValidateUrl(obsUrl, {
    pathname: `/datastreams/${tempDatastream.id}/observations`,
    query: {
      datetime: '../2024-02-06T00:00:00Z',
      limit: '100',
      f: 'json'
    }
  });
});
```

### 8.4 Format Parser Example

```typescript
/**
 * @fileoverview Tests for SensorML 3.0 format parsing
 * @module tests/parsers/sensorml
 * 
 * Validates parsing of SensorML 3.0 documents for system descriptions.
 * SensorML provides detailed technical descriptions of sensors, systems,
 * and processes including capabilities, characteristics, and configurations.
 * 
 * @specification OGC 23-000 (SensorML 3.0)
 * @coverage System parsing, component parsing, process chain parsing
 * @fixture fixtures/csapi/sensorml/weather-station.xml (Complete weather station with 5 sensors)
 * @fixture fixtures/csapi/sensorml/temp-sensor.xml (Simple temperature sensor)
 * @fixture fixtures/csapi/sensorml/sensor-array.xml (Sensor array with spatial configuration)
 */

import { parseSensorML } from '../../src/csapi/parsers/sensorml.js';
import { loadFixture } from '../test-utils/index.js';

describe('SensorML Parser', () => {
  describe('Physical System', () => {
    /**
     * Validates parsing of complete weather station description
     * 
     * Weather station fixture includes:
     * - System identification (id, name, description)
     * - Physical location (gml:Point)
     * - 5 component sensors (temp, humidity, wind speed, wind dir, pressure)
     * - Calibration information
     * - Operating characteristics
     * 
     * @fixture fixtures/csapi/sensorml/weather-station.xml
     * @specification OGC 23-000 §7.2.2 (PhysicalSystem)
     */
    it('should parse weather station with components', async () => {
      const xml = await loadFixture('csapi/sensorml/weather-station.xml');
      const system = parseSensorML(xml);
      
      expect(system.id).toBe('weather-station-001');
      expect(system.name).toBe('Campus Weather Station');
      expect(system.components).toHaveLength(5);
      expect(system.location.coordinates).toEqual([-122.6819, 45.5051]);
    });
  });
});
```

---

## 9. Key Recommendations

### 9.1 Priorities (Must, Should, Optional)

#### MUST HAVE

1. **✅ Test Utility Documentation**
   - All functions in test-utils/ must have comprehensive JSDoc
   - @param, @returns, @example, @throws required
   - Examples must be tested and accurate

2. **✅ Deprecation Documentation**
   - @deprecated tag required for old patterns
   - Must specify migration path
   - Must include removal timeline

3. **✅ Complex Setup Documentation**
   - Document non-obvious beforeAll/beforeEach logic
   - Explain fixture configuration
   - Document mock behavior

#### SHOULD HAVE

4. **🟡 File-Level Documentation**
   - Component test files should have @fileoverview
   - Should include @module, @specification, @coverage
   - Should list primary fixtures

5. **🟡 Specification Links**
   - Tests validating spec requirements should link to spec sections
   - Use @specification tag consistently
   - Include section numbers and titles

6. **🟡 Fixture References**
   - Tests using fixtures should document with @fixture tag
   - Include fixture description when non-obvious
   - Document fixture provenance for real data

#### OPTIONAL

7. **🟢 Test Case Documentation**
   - Only for non-obvious test intent
   - Only for complex scenarios
   - Skip for simple, self-explanatory tests

8. **🟢 Coverage Documentation**
   - Track coverage with @coverage at file level
   - Document known gaps
   - Optional for most files

### 9.2 Balance: Value vs Maintenance Burden

**HIGH Value Documentation** (prioritize):
- ✅ Test utility function signatures and examples
- ✅ Specification traceability links
- ✅ Fixture provenance for real data
- ✅ Non-obvious test intent
- ✅ Complex scenario explanations

**LOW Value Documentation** (skip):
- ❌ Repeating test names
- ❌ Describing what code does (visible from test)
- ❌ Obvious assertions
- ❌ Framework behavior
- ❌ Implementation details

**Documentation Principle:**
> "Document WHY (intent, rationale, context), not WHAT (visible from code)"

### 9.3 Migration Strategy for Existing Tests

If adding documentation to existing tests:

**Phase 1: High-Value First**
1. Document all test utilities (test-utils/)
2. Add file-level JSDoc to component tests
3. Add @specification to spec-validation tests

**Phase 2: Coverage & Traceability**
4. Add @coverage to file-level JSDoc
5. Add @fixture references where helpful
6. Document complex scenarios

**Phase 3: Polish**
7. Review and improve existing documentation
8. Remove outdated comments
9. Consolidate redundant documentation

### 9.4 Documentation Review Guidelines

**In Code Reviews:**
- ✅ Check JSDoc adds value (not redundant)
- ✅ Validate specification references are accurate
- ✅ Test examples work as shown
- ✅ Check for typos and clarity
- ❌ Don't require JSDoc for simple tests
- ❌ Don't nitpick style (use templates)

**Periodic Audits (Quarterly):**
- Review file-level JSDoc for accuracy
- Update specification references for new versions
- Remove outdated JSDoc
- Consolidate duplicate documentation
- Verify fixture references are still valid

---

## 10. Summary

### 10.1 Key Principles

1. **Intent over Implementation** - Document WHY not WHAT
2. **Specification Traceability** - Link tests to spec sections
3. **Fixture Provenance** - Document test data sources
4. **Coverage Transparency** - Expose gaps in testing
5. **Lightweight by Default** - Only document where it adds value

### 10.2 Documentation Levels

| Level | Required | Recommended | Optional |
|-------|----------|-------------|----------|
| **File** | N/A | Module ID, spec refs | Coverage, fixtures |
| **Suite** | N/A | Complex setup only | Spec refs |
| **Test** | N/A | Spec-driven tests | Complex scenarios |
| **Helper** | @param, @returns, @example | @throws | @see |

### 10.3 Standard Tags

**Most Useful Tags:**
- `@fileoverview` - File description
- `@module` - Module identifier
- `@specification` - Spec traceability
- `@fixture` - Test data reference
- `@param` - Parameter docs (helpers)
- `@returns` - Return value (helpers)
- `@example` - Usage examples (helpers)

### 10.4 Upstream Insights

- Upstream has **NEAR-ZERO** formal documentation in tests (0.3% density)
- Tests are **self-documenting** through clear naming and structure
- Minimal inline comments focus on **"why"** not "what"
- **CSAPI needs MORE documentation** due to spec complexity but should remain lightweight

### 10.5 Effort Estimates

- **Initial Documentation**: ~30 hours for 80 test files (~22 min/file average)
- **Maintenance**: ~5% of test maintenance time
- **Review**: ~10 min per PR with test changes
- **ROI**: **POSITIVE** - Benefits (traceability, maintainability) outweigh costs

### 10.6 What This Unblocks

✅ **Test Implementation** - Documentation standards guide test writing  
✅ **Test Maintenance** - Documentation aids understanding for future maintainers  
✅ **Code Review** - Standards provide review checklist  
✅ **Specification Traceability** - Tests linked to requirements  
✅ **Coverage Analysis** - Documentation reveals gaps  

---

## 11. References

### 11.1 Related Research Documents

- **Section 19:** Test Organization and File Structure (test file patterns)
- **Section 34:** Test Utility and Helper Design (utility documentation standards)
- **Section 1-2:** Upstream Analysis (upstream documentation patterns)

### 11.2 Specification References

- **OGC 23-001:** Connected Systems API Part 1 - Feature Resources
- **OGC 23-002:** Connected Systems API Part 2 - Observation Data
- **OGC 23-003:** Connected Systems API Part 3 - Command & Control
- **OGC 23-000:** SensorML 3.0
- **RFC 8288:** Web Linking
- **RFC 3339:** Date and Time on the Internet

### 11.3 Tool Documentation

- **JSDoc:** https://jsdoc.app/
- **TypeDoc:** https://typedoc.org/
- **Jest:** https://jestjs.io/
- **Testing Library:** https://testing-library.com/

### 11.4 Implementation Guide

- [docs/planning/csapi-implementation-guide.md](../../../planning/csapi-implementation-guide.md) - Documentation standards for source code

---

**END OF DOCUMENT**
