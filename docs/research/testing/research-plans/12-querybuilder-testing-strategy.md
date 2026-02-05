# Research Plan: QueryBuilder URL Construction Testing Strategy

**Section:** 12 of 38  
**Phase:** 3 - Component Requirements  
**Estimated Time:** 2-3 hours  
**Priority:** CRITICAL - Core API surface, 70-80 methods

---

## Objective

Define comprehensive testing strategy for CSAPIQueryBuilder covering all 70-80 methods across 9 resource types. Create systematic approach for URL validation that ensures deep, meaningful testing beyond trivial string checks.

---

## Why This Research Twelfth

**Dependency Chain:** After format testing requirements (Sections 9-11), address the QueryBuilder that constructs URLs for those resources.

**Core API Surface:** CSAPIQueryBuilder is the primary developer-facing API with:
- **70-80 methods** across 9 resource types
- **Complex query parameters:** Temporal, spatial, filtering, pagination, format negotiation
- **Resource availability validation:** Checking if endpoints exist before constructing URLs
- **Nested endpoint construction:** System → DataStreams → Observations chains
- **URL correctness:** Path, query parameters, encoding

This research defines:
- **Method Coverage:** All 70-80 methods with test specifications
- **URL Validation Depth:** What constitutes "meaningful" URL testing
- **Query Parameter Testing:** Systematic coverage of all parameter combinations
- **Edge Cases:** Optional parameters, encoding edge cases, availability checks
- **Test Organization:** How to structure 70-80 method tests maintainably
- **Fixture Requirements:** Collection info, conformance responses

---

## Key Research Questions

### CSAPIQueryBuilder Architecture

1. How many methods exist in CSAPIQueryBuilder?
2. What are the method categories (GET/POST/PUT/PATCH/DELETE)?
3. What resource types are covered (Systems, Deployments, etc.)?
4. How many methods per resource type?
5. What query parameters are supported per method?
6. What validation logic exists in QueryBuilder?
7. What dependencies exist (collection info, conformance)?

### Method Inventory

8. **Systems:** What methods exist? (getSystems, getSystem, createSystem, etc.)
9. **Deployments:** What methods exist?
10. **Procedures:** What methods exist?
11. **SamplingFeatures:** What methods exist?
12. **Properties:** What methods exist?
13. **DataStreams:** What methods exist?
14. **Observations:** What methods exist?
15. **ControlStreams:** What methods exist?
16. **Commands:** What methods exist?
17. What cross-resource navigation methods exist?

### URL Validation Depth

18. What constitutes "meaningful" URL testing vs "trivial"?
19. Is checking `url.includes('/systems')` sufficient? (NO)
20. What URL components must be validated (protocol, host, path, query, hash)?
21. How to validate path structure systematically?
22. How to validate query parameters systematically?
23. How to validate URL encoding?
24. What tools/utilities for URL parsing and validation?

### Query Parameter Testing

25. What query parameters exist across all methods?
26. **Pagination:** limit, offset
27. **Filtering:** property filters, systemType, etc.
28. **Temporal:** phenomenonTime, resultTime, validTime
29. **Spatial:** bbox, geometry
30. **Format negotiation:** format, encoding
31. **Sorting:** sortBy, sortOrder
32. **Relationships:** parent, children, related resources
33. How to test parameter combinations systematically?
34. How to test optional parameters?
35. How to test array parameters?
36. How to test encoding (spaces, special characters)?

### Resource Availability Validation

37. Does QueryBuilder check if resource endpoint exists before constructing URL?
38. How to test resource availability logic?
39. What error handling exists for unavailable resources?
40. What fixtures needed (collection info, conformance)?

### Nested Endpoint Construction

41. What nested endpoint chains exist?
42. System → DataStreams → Observations
43. System → Deployments
44. System → ControlStreams → Commands
45. How to test nested endpoint construction?
46. How to validate parent-child relationships?

### URL Encoding Edge Cases

47. How to test space encoding (%20 vs +)?
48. How to test special character encoding?
49. How to test international characters (UTF-8)?
50. How to test reserved characters in values?
51. How to test already-encoded values (double-encoding)?

### Implementation Guide Specifications

52. What QueryBuilder testing specifications exist in Implementation Guide?
53. What test structure is recommended?
54. What test depth is specified?
55. What fixtures are specified?
56. What coverage targets are specified?

### Upstream URL Builder Patterns

57. How do other implementations test URL builders?
58. What URL validation depth exists upstream?
59. What query parameter testing patterns exist?
60. What assertion patterns are used for URLs?
61. What URL parsing utilities exist?

### Method Categories and Testing Strategies

62. **GET methods:** How to test collection queries?
63. **GET methods:** How to test single resource retrieval?
64. **POST methods:** How to test resource creation URLs?
65. **PUT methods:** How to test full resource update URLs?
66. **PATCH methods:** How to test partial resource update URLs?
67. **DELETE methods:** How to test resource deletion URLs?

### Error Handling

68. What error conditions must be tested?
69. How to handle unavailable resources?
70. How to handle invalid parameters?
71. How to handle missing required parameters?
72. What error messages should be provided?

### Fixture Requirements

73. What collection info fixtures are needed?
74. What conformance response fixtures are needed?
75. What resource availability scenarios need fixtures?
76. How to organize fixtures for 9 resource types?

### Test Organization Strategies

77. One test file or multiple (per resource type)?
78. How to structure describe blocks?
79. How to avoid repetitive test code?
80. What test utilities can reduce duplication?
81. What's the test-to-method ratio (1:1, 2:1, 3:1)?

### Test Depth Per Method

82. How many tests per method (average)?
83. What scenarios must be tested per method?
84. Happy path only or edge cases too?
85. How to prioritize test scenarios?

---

## Research Methodology

### Phase 1: QueryBuilder Method Inventory (30-45 minutes)

1. Read Implementation Guide QueryBuilder specification
2. List all CSAPIQueryBuilder methods
3. Categorize by resource type and HTTP method
4. Document query parameters per method
5. Document nested endpoint methods
6. Create method inventory matrix

### Phase 2: Upstream URL Builder Analysis (30-45 minutes)

1. Review Section 1-2 deliverables (EDR and upstream patterns)
2. Analyze URL builder test patterns
3. Document URL validation depth
4. Extract assertion patterns
5. Identify test utilities
6. Create URL testing best practices guide

### Phase 3: URL Validation Strategy Design (30-45 minutes)

1. Define "meaningful" URL testing criteria
2. Design URL parsing/validation approach
3. Document query parameter testing strategy
4. Design encoding validation approach
5. Create URL validation utility specifications
6. Define test depth standards

### Phase 4: Method-by-Method Test Planning (45-60 minutes)

1. For each resource type, document test requirements per method
2. Identify shared test patterns
3. Design test organization structure
4. Define fixture requirements
5. Estimate test count and lines per resource type
6. Create test specification template

---

## Resources Required

### Primary Resources

- **CSAPI Implementation Guide:** [docs/planning/csapi-implementation-guide.md](../../../planning/csapi-implementation-guide.md) (CSAPIQueryBuilder specification)
- **ROADMAP.md:** [docs/planning/ROADMAP.md](../../../planning/ROADMAP.md) (Phase 2: 9 resource type tasks)
- **URL Building Architecture:** [docs/research/upstream/url-building-analysis.md](../../upstream/url-building-analysis.md)

### Supporting Resources

- **Section 8 Deliverable:** CSAPI specification requirements (query parameter specs)
- **Section 6 Deliverable:** "Meaningful vs Trivial" Definition (URL testing depth guidance)
- **Section 1-2 Deliverables:** Upstream URL builder test patterns
- **Query Parameter Requirements:** [docs/research/requirements/csapi-query-parameters.md](../../requirements/csapi-query-parameters.md)

### Tools Needed

- URL parsing library (Node.js `URL` or equivalent)
- Query string parser
- URL encoding utilities

---

## Deliverable Specification

### Document: "CSAPIQueryBuilder Testing Strategy"

**Location:** `docs/research/testing/findings/12-querybuilder-testing-strategy.md`

**Note:** This goes in `findings/` because it's detailed analysis (test strategy synthesis in Section 14+).

**Required Sections:**

#### 1. Executive Summary

- Total methods to test: ~70-80
- Resource types: 9
- Testing priorities
- URL validation approach
- Estimated test lines
- Test organization strategy

#### 2. Method Inventory Matrix

```markdown
| Resource Type | GET Collection | GET Item | POST Create | PUT Update | PATCH Update | DELETE | Total |
|---------------|----------------|----------|-------------|------------|--------------|--------|-------|
| Systems | getSystems | getSystem | createSystem | updateSystem | patchSystem | deleteSystem | 6 |
| Deployments | getDeployments | getDeployment | createDeployment | updateDeployment | patchDeployment | deleteDeployment | 6 |
| Procedures | getProcedures | getProcedure | createProcedure | updateProcedure | patchProcedure | deleteProcedure | 6 |
| SamplingFeatures | getSamplingFeatures | getSamplingFeature | createSamplingFeature | updateSamplingFeature | patchSamplingFeature | deleteSamplingFeature | 6 |
| Properties | getProperties | getProperty | createProperty | updateProperty | patchProperty | deleteProperty | 6 |
| DataStreams | getDataStreams | getDataStream | createDataStream | updateDataStream | patchDataStream | deleteDataStream | 6 |
| Observations | getObservations | getObservation | createObservation | updateObservation | patchObservation | deleteObservation | 6 |
| ControlStreams | getControlStreams | getControlStream | createControlStream | updateControlStream | patchControlStream | deleteControlStream | 6 |
| Commands | getCommands | getCommand | createCommand | updateCommand | patchCommand | deleteCommand | 6 |
| **TOTAL** | **9** | **9** | **9** | **9** | **9** | **9** | **54** |
```

**Additional Methods:**
- Nested endpoint methods: ~15 (e.g., getSystemDataStreams, getDataStreamObservations)
- Cross-resource navigation: ~5
- **Grand Total: ~70-80 methods**

#### 3. "Meaningful" URL Testing Definition

**Trivial URL Test (DON'T DO):**
```typescript
it('should build systems URL', () => {
  const url = builder.getSystems();
  expect(url).toContain('/systems'); // ❌ TRIVIAL
});
```

**Meaningful URL Test (DO THIS):**
```typescript
it('should build systems URL with correct structure and parameters', () => {
  const url = builder.getSystems({
    limit: 10,
    offset: 20,
    systemType: 'sensor'
  });
  
  const parsed = new URL(url);
  
  // Validate protocol and host
  expect(parsed.protocol).toBe('https:');
  expect(parsed.host).toBe('api.example.com');
  
  // Validate path structure
  expect(parsed.pathname).toBe('/collections/sensors/systems');
  
  // Validate query parameters
  const params = Object.fromEntries(parsed.searchParams);
  expect(params).toEqual({
    limit: '10',
    offset: '20',
    systemType: 'sensor'
  });
  
  // Validate encoding
  expect(parsed.searchParams.get('systemType')).toBe('sensor');
});
```

**URL Validation Utility:**
```typescript
function parseAndValidateUrl(url: string, expected: {
  protocol?: string;
  host?: string;
  pathname: string;
  query?: Record<string, string>;
}) {
  const parsed = new URL(url);
  
  if (expected.protocol) {
    expect(parsed.protocol).toBe(expected.protocol);
  }
  if (expected.host) {
    expect(parsed.host).toBe(expected.host);
  }
  expect(parsed.pathname).toBe(expected.pathname);
  
  if (expected.query) {
    const params = Object.fromEntries(parsed.searchParams);
    expect(params).toEqual(expected.query);
  }
  
  return parsed;
}
```

#### 4. Query Parameter Testing Strategy

```markdown
| Parameter Category | Examples | Test Approach | Priority |
|--------------------|----------|---------------|----------|
| Pagination | limit, offset | Test with values, test defaults, test edge cases (0, very large) | HIGH |
| Temporal | phenomenonTime, resultTime, validTime | Test ISO 8601 formats (instant, interval), test encoding | CRITICAL |
| Spatial | bbox, geometry | Test coordinate formats, test encoding, test edge cases | HIGH |
| Filtering | systemType, property filters | Test vocabulary values, test multiple filters, test encoding | HIGH |
| Format | format, encoding | Test valid values, test defaults | MEDIUM |
| Sorting | sortBy, sortOrder | Test valid fields, test asc/desc | MEDIUM |
| Optional | All | Test presence vs absence, test default behavior | HIGH |
| Arrays | Multiple values for same parameter | Test array encoding, test empty arrays | MEDIUM |
| Encoding | Special characters, spaces, international | Test URL encoding correctness | HIGH |
```

#### 5. Resource Type Testing Requirements

**Per Resource Type (Systems Example):**

```markdown
### Systems Resource Methods

| Method | Parameters | URL Pattern | Test Scenarios | Test Count | Priority |
|--------|------------|-------------|----------------|------------|----------|
| getSystems() | limit, offset, bbox, systemType | /collections/{id}/systems | No params, all params, optional params, encoding edge cases | 5-6 | CRITICAL |
| getSystem(id) | None | /collections/{id}/systems/{systemId} | Valid ID, special chars in ID, encoding | 2-3 | CRITICAL |
| getSystemDataStreams(id) | limit, offset | /collections/{id}/systems/{systemId}/datastreams | Nested endpoint, params, encoding | 3-4 | HIGH |
| getSystemDeployments(id) | limit, offset, validTime | /collections/{id}/systems/{systemId}/deployments | Nested endpoint, temporal filter, encoding | 3-4 | HIGH |
| createSystem() | body | /collections/{id}/systems | POST URL structure | 1-2 | MEDIUM |
| updateSystem(id) | body | /collections/{id}/systems/{systemId} | PUT URL structure | 1-2 | LOW |
| patchSystem(id) | body | /collections/{id}/systems/{systemId} | PATCH URL structure | 1-2 | LOW |
| deleteSystem(id) | None | /collections/{id}/systems/{systemId} | DELETE URL structure | 1-2 | LOW |
| **TOTAL** | | | | **19-27** | |
```

Repeat for all 9 resource types.

#### 6. Nested Endpoint Testing

```markdown
| Nested Chain | Method | URL Pattern | Test Scenarios |
|--------------|--------|-------------|----------------|
| System → DataStreams | getSystemDataStreams(systemId) | /collections/{id}/systems/{systemId}/datastreams | Valid ID, params, encoding |
| System → Deployments | getSystemDeployments(systemId) | /collections/{id}/systems/{systemId}/deployments | Valid ID, temporal filter |
| DataStream → Observations | getDataStreamObservations(datastreamId) | /collections/{id}/datastreams/{datastreamId}/observations | Valid ID, temporal filter, pagination |
| System → ControlStreams | getSystemControlStreams(systemId) | /collections/{id}/systems/{systemId}/controlstreams | Valid ID, params |
| ControlStream → Commands | getControlStreamCommands(controlstreamId) | /collections/{id}/controlstreams/{controlstreamId}/commands | Valid ID, temporal filter |
```

#### 7. URL Encoding Edge Cases

```markdown
| Edge Case | Test Input | Expected Encoding | Test Priority |
|-----------|------------|-------------------|---------------|
| Space | systemType = "weather station" | systemType=weather%20station | HIGH |
| Forward slash | systemType = "system/sensor" | systemType=system%2Fsensor | HIGH |
| Ampersand | description = "temp & humidity" | description=temp%20%26%20humidity | MEDIUM |
| Equals | filter = "prop=value" | filter=prop%3Dvalue | MEDIUM |
| Plus | value = "A+B" | value=A%2BB | MEDIUM |
| International | label = "Système météo" | label=Syst%C3%A8me%20m%C3%A9t%C3%A9o | LOW |
| Already encoded | value = "test%20value" | value=test%20value (no double-encoding) | MEDIUM |
```

#### 8. Resource Availability Validation Testing

```markdown
| Scenario | Test Requirement | Priority |
|----------|------------------|----------|
| Resource available | QueryBuilder should construct URL successfully | HIGH |
| Resource unavailable (not in conformance) | QueryBuilder should throw error or return null | HIGH |
| Nested resource unavailable | QueryBuilder should check parent availability | MEDIUM |
| Collection info missing | QueryBuilder should handle gracefully | MEDIUM |
```

**Fixtures Needed:**
- Conformance response with all resource types
- Conformance response with subset of resources
- Collection info for each resource type

#### 9. Error Condition Testing

```markdown
| Error Condition | Test Scenario | Expected Behavior | Priority |
|-----------------|---------------|-------------------|----------|
| Invalid parameter value | limit = -1 | Throw validation error | HIGH |
| Missing required parameter | getSystem() without ID | Throw error | HIGH |
| Resource not available | getSystems() when systems not in conformance | Throw error or return null | HIGH |
| Invalid temporal format | phenomenonTime = "invalid" | Throw validation error | MEDIUM |
| Invalid bbox format | bbox = "not a bbox" | Throw validation error | MEDIUM |
```

#### 10. Test Organization Structure

**Option 1: Single File (if manageable)**
```markdown
Test File: `src/ogc-api/csapi-query-builder.spec.ts` (~1,200-1,800 lines)

- describe('CSAPIQueryBuilder')
  - describe('Systems Resource')
    - describe('getSystems')
      - it('should build URL with no parameters')
      - it('should build URL with all parameters')
      - it('should handle optional parameters')
      - it('should encode special characters')
      - ...
    - describe('getSystem')
      - ...
  - describe('Deployments Resource')
    - ...
  - describe('DataStreams Resource')
    - ...
  - describe('Observations Resource')
    - ...
  - (etc. for all 9 resource types)
```

**Option 2: Multiple Files (recommended for maintainability)**
```markdown
Test Files:
- `src/ogc-api/csapi-query-builder-systems.spec.ts` (~150-250 lines)
- `src/ogc-api/csapi-query-builder-deployments.spec.ts` (~120-180 lines)
- `src/ogc-api/csapi-query-builder-procedures.spec.ts` (~120-180 lines)
- `src/ogc-api/csapi-query-builder-samplingfeatures.spec.ts` (~120-180 lines)
- `src/ogc-api/csapi-query-builder-properties.spec.ts` (~120-180 lines)
- `src/ogc-api/csapi-query-builder-datastreams.spec.ts` (~150-250 lines)
- `src/ogc-api/csapi-query-builder-observations.spec.ts` (~180-300 lines)
- `src/ogc-api/csapi-query-builder-controlstreams.spec.ts` (~120-180 lines)
- `src/ogc-api/csapi-query-builder-commands.spec.ts` (~120-180 lines)

Total: ~1,200-1,880 lines
```

#### 11. Test Utility Specifications

```typescript
// URL Validation Utility
function parseAndValidateUrl(url: string, expected: {
  protocol?: string;
  host?: string;
  pathname: string;
  query?: Record<string, string | string[]>;
}): URL;

// Query Parameter Utility
function validateQueryParams(url: string, expected: Record<string, string | string[]>): void;

// Encoding Validation Utility
function validateEncoding(url: string, param: string, expectedValue: string): void;
```

#### 12. Fixture Requirements

```markdown
Fixture Directory: `fixtures/csapi-querybuilder/`

Required Fixtures:
- conformance-all-resources.json (all 9 resource types available)
- conformance-subset.json (only some resources available)
- collection-info-systems.json (Systems collection info)
- collection-info-deployments.json (Deployments collection info)
- (etc. for all 9 resource types)

Total: ~11 fixtures
```

#### 13. Testing Estimates

```markdown
| Resource Type | Methods | Tests per Method | Total Tests | Lines per Test | Total Lines | Time Estimate |
|---------------|---------|------------------|-------------|----------------|-------------|---------------|
| Systems | 8 | 3 | 24 | 10-12 | 240-288 | 3-4 hours |
| Deployments | 7 | 3 | 21 | 10-12 | 210-252 | 2-3 hours |
| Procedures | 6 | 2.5 | 15 | 10-12 | 150-180 | 2 hours |
| SamplingFeatures | 7 | 2.5 | 18 | 10-12 | 180-216 | 2-3 hours |
| Properties | 6 | 2.5 | 15 | 10-12 | 150-180 | 2 hours |
| DataStreams | 8 | 3 | 24 | 10-12 | 240-288 | 3-4 hours |
| Observations | 10 | 3.5 | 35 | 10-12 | 350-420 | 4-5 hours |
| ControlStreams | 7 | 2.5 | 18 | 10-12 | 180-216 | 2-3 hours |
| Commands | 7 | 2.5 | 18 | 10-12 | 180-216 | 2-3 hours |
| **TOTAL** | **66** | **~3 avg** | **188** | **~11 avg** | **1,880-2,256** | **22-29 hours** |
```

#### 14. Testing Priorities

**CRITICAL (Must Have):**
- All GET collection methods (9 methods)
- All GET item methods (9 methods)
- Query parameter validation (pagination, temporal, spatial)
- URL encoding correctness
- Nested endpoint methods (top 5)

**HIGH (Should Have):**
- POST/PUT/PATCH methods (27 methods)
- Optional parameter handling
- Resource availability validation
- All spec-defined methods

**MEDIUM (Nice to Have):**
- DELETE methods (9 methods)
- Advanced query parameter combinations
- Edge case encoding
- Error condition coverage

**LOW (Optional):**
- Performance testing
- Very large parameter values
- Complex filter combinations

#### 15. Validation Against Upstream Patterns

Compare with Section 1-2 findings:
- How does EDR test QueryBuilder/URL builders?
- What URL validation depth exists upstream?
- What assertion patterns are used?
- Are we aligned with upstream quality standards?

#### 16. Integration with Implementation Guide

Cross-validate with Implementation Guide QueryBuilder specification:
- ✅ Aligned: Test requirement matches Implementation Guide
- ⚠️ Gap: Test requirement not addressed in Implementation Guide
- ❌ Conflict: Test requirement conflicts with Implementation Guide

#### 17. Risks and Edge Cases

```markdown
| Risk/Edge Case | Likelihood | Impact | Mitigation |
|----------------|------------|--------|------------|
| Test suite very large (2,000+ lines) | High | Medium | Organize into multiple files; shared utilities |
| URL validation utilities missing | Medium | High | Create robust parseAndValidateUrl utility |
| Encoding edge cases missed | Medium | High | Systematic encoding test matrix |
| Resource availability logic complex | Medium | Medium | Clear fixtures; explicit test scenarios |
| Parameter combinations explosive | High | Medium | Prioritize common combinations; parametrize tests |
```

### Success Criteria

✅ All 70-80 CSAPIQueryBuilder methods inventoried  
✅ "Meaningful" URL testing approach defined  
✅ Query parameter testing strategy comprehensive  
✅ URL encoding edge cases identified  
✅ Nested endpoint testing strategy defined  
✅ Resource availability validation approach defined  
✅ Test organization structure decided (multiple files recommended)  
✅ Test utilities specified (parseAndValidateUrl, etc.)  
✅ Fixture requirements documented  
✅ Testing estimates realistic (~1,900-2,300 lines)  
✅ Validated against upstream patterns  
✅ Cross-validated with Implementation Guide  

### Validation

- All methods from Implementation Guide covered
- Test depth meets "meaningful" criteria from Section 6
- URL validation goes beyond trivial string checks
- Query parameter coverage systematic
- Test estimates align with Phase 2 Roadmap (800-1,000 lines for resource methods)
- Fixture count manageable (~11 fixtures)
- Test organization maintainable

---

## Cross-References

**Builds On:**
- Section 8: CSAPI Specification Test Requirements (query parameter specs)
- Section 6: "Meaningful vs Trivial" Definition (URL testing depth)
- Section 1-2: Upstream URL builder test patterns
- **Implementation Guide:** [docs/planning/csapi-implementation-guide.md](../../../planning/csapi-implementation-guide.md) (QueryBuilder specification)

**Critical For:**
- Section 13: Resource Method Testing Patterns (uses QueryBuilder)
- Section 14: Integration Test Workflows (uses QueryBuilder methods)
- Section 15: Fixture Sourcing Strategy (conformance and collection info fixtures)
- Section 36: Test Quality Checklist (QueryBuilder test validation)

---

## Next Steps After Completion

1. Use test requirements to implement QueryBuilder tests (Phase 2, Tasks 2-10)
2. Create parseAndValidateUrl test utility
3. Create conformance and collection info fixtures
4. Design multi-file test organization
5. Validate test coverage against all 70-80 methods

---

## Risks and Mitigation

**Risk:** Test suite becomes unmaintainably large  
**Mitigation:** Multiple test files (one per resource type); shared utilities

**Risk:** URL validation utilities insufficient  
**Mitigation:** Robust parseAndValidateUrl function; extensive query parameter utilities

**Risk:** Parameter combinations create test explosion  
**Mitigation:** Prioritize common combinations; use parametrized tests where appropriate

**Risk:** Resource availability logic untested  
**Mitigation:** Explicit fixtures and test scenarios for availability checking

---

## Research Status

- [ ] Phase 1: QueryBuilder Method Inventory (30-45 min)
- [ ] Phase 2: Upstream URL Builder Analysis (30-45 min)
- [ ] Phase 3: URL Validation Strategy Design (30-45 min)
- [ ] Phase 4: Method-by-Method Test Planning (45-60 min)
- [ ] Deliverable Complete and Reviewed

**Total Estimated Time:** 2-3 hours  
**Actual Time:** _[To be filled during research]_  
**Started:** _[Date]_  
**Completed:** _[Date]_
