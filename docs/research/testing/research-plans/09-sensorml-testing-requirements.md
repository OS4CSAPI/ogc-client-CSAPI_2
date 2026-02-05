# Research Plan: SensorML 3.0 Format Testing Requirements

**Section:** 9 of 38  
**Phase:** 3 - Component Requirements  
**Estimated Time:** 2-3 hours  
**Priority:** CRITICAL - Complex format with high rejection risk

---

## Objective

Define comprehensive testing requirements for SensorML 3.0 parser based on specification, JSON schema, and real-world examples. Create detailed test plan covering all structure types, validation rules, edge cases, and integration with SWE Common.

---

## Why This Research Ninth

**Dependency Chain:** After extracting normative requirements from CSAPI specs (Section 8), deep-dive into SensorML 3.0 format testing.

**Rejection Risk:** Format parsing was a major weakness in previous iteration. SensorML is complex with:
- Recursive component structures
- Multiple system types (PhysicalSystem, PhysicalComponent, SimpleProcess, AggregateProcess)
- Deep nesting (systems within systems)
- Integration with SWE Common (capabilities, observableProperties)
- Extensive property validation (identifiers, classifiers, characteristics)

This research defines:
- **Structure Coverage:** All SensorML structure types
- **Validation Rules:** Normative and schema-based validation
- **Edge Cases:** Recursive, missing properties, malformed structures
- **Fixtures:** Spec examples + real-world examples from OpenSensorHub
- **Test Depth:** What constitutes "meaningful" SensorML testing

---

## Key Research Questions

### SensorML 3.0 Specification Analysis

1. What are all the SensorML structure types defined in spec?
2. What properties are mandatory vs optional for each structure?
3. What validation rules are normative (SHALL, MUST)?
4. What recursive structures exist (components within systems)?
5. What are the system type distinctions (Physical vs Simple vs Aggregate)?
6. How deep can nesting go (limits or unbounded)?
7. What identifier/uniqueIdentifier rules apply?
8. What classifier/characteristic structures must be supported?
9. What temporal validity rules exist (validTime)?
10. What reference resolution rules exist (xlink:href)?

### JSON Schema Validation Rules

11. What validation rules are encoded in SensorML 3.0 JSON schema?
12. What properties have format constraints (URI, date-time, etc.)?
13. What properties have enumeration constraints?
14. What required vs optional properties per structure?
15. What array constraints exist (minItems, maxItems)?
16. What nested object constraints exist?
17. Are there schema variations for different system types?
18. What schema validation should parser enforce vs just parse?

### SensorML Structure Types

19. PhysicalSystem: What must be tested?
20. PhysicalComponent: What must be tested?
21. SimpleProcess: What must be tested?
22. AggregateProcess: What must be tested?
23. How do structure types differ in testing requirements?
24. What shared properties across all types?
25. What type-specific properties?

### Identification and Classification

26. How to test identification section (identifiers array)?
27. What identifier types must be supported?
28. How to test classification section (classifiers array)?
29. What classifier types must be supported?
30. How to validate uniqueIdentifier URIs?
31. What label/name validation is required?

### Characteristics and Capabilities

32. How to test characteristics section (SWE Common)?
33. How to test capabilities section (SWE Common)?
34. What level of SWE Common parsing is required?
35. Do we fully parse or just validate structure?
36. What integration tests needed with SWE Common parser?

### Components and Recursive Structures

37. How to test component lists (components array)?
38. How deep to test nesting (system → component → subcomponent)?
39. What edge cases exist in recursive parsing?
40. How to test circular references (if possible)?
41. How to test missing component references?
42. What performance issues with deep nesting?

### Temporal Validity

43. How to test validTime parsing?
44. What temporal formats must be supported (ISO 8601)?
45. How to validate temporal intervals vs instants?
46. What edge cases exist (open intervals, infinite validity)?

### Observable Properties

47. How to test observableProperty arrays?
48. What URI validation is required?
49. How to test property definitions vs references?
50. What integration needed with CSAPI properties resource?

### Contacts and Documentation

51. How to test contacts section?
52. How to test documentation section?
53. Are these critical or lower priority for testing?
54. What validation rules apply to contacts/documentation?

### Position and Location

55. How to test position (geometry)?
56. What geometry types must be supported?
57. How deep to validate geometry (WKT, GeoJSON, gml:Point)?
58. What CRS handling is required?

### Error Handling

59. What error conditions must be tested?
60. How to handle malformed SensorML?
61. How to handle missing required properties?
62. How to handle invalid property values?
63. How to handle unsupported structure types?
64. What error messages should be provided?

### Specification Examples

65. What complete system examples exist in spec?
66. What component examples exist in spec?
67. What recursive structure examples exist?
68. What edge case examples exist?
69. Can all spec examples be extracted as fixtures?

### OpenSensorHub Real-World Examples

70. What SensorML examples available from OpenSensorHub demo server?
71. What structure complexity exists in real-world examples?
72. What edge cases do real-world examples expose?
73. What validation issues exist in real-world data?
74. Can OpenSensorHub examples supplement spec examples?

### Parser Implementation Testing

75. What parsing functions must be unit tested?
76. What integration tests needed (full system parsing)?
77. What test organization (one file or multiple)?
78. What test depth per structure type?
79. How many fixtures per structure type?
80. What's the balance between spec examples and hand-crafted tests?

---

## Research Methodology

### Phase 1: SensorML 3.0 Specification Deep Dive (45-60 minutes)

1. Read SensorML 3.0 specification sections on JSON encoding
2. Extract all structure type definitions
3. Document all normative validation rules
4. Extract all specification examples
5. Document recursive structure patterns
6. Identify integration points with SWE Common
7. Create structure type requirement matrix

### Phase 2: JSON Schema Analysis (30-45 minutes)

1. Parse SensorML 3.0 JSON schemas from https://schemas.opengis.net/sensorml/3.0/
2. Extract validation rules per structure type
3. Document required vs optional properties
4. Document format and enumeration constraints
5. Cross-validate with specification text
6. Create schema validation checklist

### Phase 3: Example Analysis (30-45 minutes)

1. Extract all specification examples
2. Fetch real-world examples from OpenSensorHub
3. Analyze structure complexity and depth
4. Identify edge cases in real-world data
5. Document fixture sourcing strategy
6. Create fixture inventory

### Phase 4: Test Strategy Design (30-45 minutes)

1. Map structure types to test requirements
2. Define unit test scope (parsing functions)
3. Define integration test scope (full systems)
4. Design fixture organization
5. Define test depth per structure type
6. Create test specification document

---

## Resources Required

### Primary Resources

- **SensorML 3.0 Specification:** https://docs.ogc.org/is/23-000r1/23-000r1.html
- **SensorML 3.0 JSON Schema:** https://schemas.opengis.net/sensorml/3.0/
- **CSAPI Implementation Guide:** [docs/planning/csapi-implementation-guide.md](../../../planning/csapi-implementation-guide.md) (SensorML parser specification)

### Supporting Resources

- **Section 8 Deliverable:** CSAPI specification requirements (SensorML validation rules)
- **Format Requirements Analysis:** [docs/research/requirements/csapi-format-requirements.md](../../requirements/csapi-format-requirements.md)
- **OpenSensorHub Analysis:** [docs/research/requirements/csapi-opensensorhub-analysis.md](../../requirements/csapi-opensensorhub-analysis.md)
- Section 6 Deliverable: "Meaningful vs Trivial" guide (quality context)
- Section 1-2 Deliverables: Upstream format parser test patterns

### Tools Needed

- JSON schema validator
- SensorML example parser
- OpenSensorHub API access

---

## Deliverable Specification

### Document: "SensorML 3.0 Parser Testing Specification"

**Location:** `docs/research/testing/findings/09-sensorml-testing-requirements.md`

**Note:** This goes in `findings/` because it's detailed analysis (test strategy synthesis in Section 14+).

**Required Sections:**

#### 1. Executive Summary

- Total structure types to test
- Testing priorities (critical/high/medium)
- Fixture count requirements
- Estimated test lines
- Key testing challenges

#### 2. Structure Type Testing Requirements

```markdown
| Structure Type | Priority | Required Tests | Fixtures Needed | Test Lines Estimate |
|----------------|----------|----------------|-----------------|---------------------|
| PhysicalSystem | CRITICAL | Full parsing, validation, components | 5-8 | 150-200 |
| PhysicalComponent | HIGH | Full parsing, validation, nesting | 3-5 | 80-120 |
| SimpleProcess | MEDIUM | Basic parsing, validation | 2-3 | 60-80 |
| AggregateProcess | HIGH | Full parsing, component aggregation | 3-4 | 100-150 |
```

#### 3. Property Testing Matrix

**Per Structure Type:**

```markdown
### PhysicalSystem Property Testing

| Property | Required/Optional | Validation Rules | Edge Cases | Test Type | Priority |
|----------|-------------------|------------------|------------|-----------|----------|
| uniqueIdentifier | Required | Valid URI | Missing, invalid URI | Unit | CRITICAL |
| definition | Optional | Valid URI | Invalid URI, relative URI | Unit | HIGH |
| label | Optional | String | Very long, special characters | Unit | MEDIUM |
| description | Optional | String | Missing, empty | Unit | LOW |
| identification | Optional | Array of identifiers | Empty array, invalid identifiers | Unit | HIGH |
| classification | Optional | Array of classifiers | Empty array, invalid classifiers | Unit | HIGH |
| characteristics | Optional | SWE Common DataRecord | Malformed, complex nesting | Integration | HIGH |
| capabilities | Optional | SWE Common DataRecord | Malformed, missing required | Integration | HIGH |
| components | Optional | Array of systems | Deep nesting, circular refs | Integration | CRITICAL |
| validTime | Optional | ISO 8601 interval | Invalid format, open intervals | Unit | MEDIUM |
| ... | ... | ... | ... | ... | ... |
```

Repeat for all structure types.

#### 4. Validation Rule Checklist

```markdown
| Validation Rule | Normative/Schema | Enforcement Level | Test Coverage |
|-----------------|------------------|-------------------|---------------|
| uniqueIdentifier must be valid URI | Normative | MUST enforce | Unit test |
| System type must be recognized | Schema | SHOULD enforce | Unit test |
| Components must be valid systems | Normative | MUST enforce | Integration test |
| Characteristics must be valid SWE Common | Normative | MUST parse correctly | Integration test |
| ValidTime must be valid ISO 8601 | Schema | SHOULD validate | Unit test |
| ... | ... | ... | ... |
```

#### 5. Recursive Structure Testing

```markdown
| Nesting Level | Test Scenario | Fixture Needed | Expected Behavior | Priority |
|---------------|---------------|----------------|-------------------|----------|
| Level 1 | System with components (1 level) | Yes | Parse all components | CRITICAL |
| Level 2 | System → Component → Subcomponent | Yes | Parse nested structure | HIGH |
| Level 3 | System → Component → Subcomponent → Sub-subcomponent | Yes | Parse deep nesting | MEDIUM |
| Circular | System references itself | Hand-craft | Detect or handle gracefully | LOW |
| Missing Ref | Component references non-existent system | Hand-craft | Error handling | MEDIUM |
```

#### 6. SWE Common Integration Testing

```markdown
| Integration Point | SWE Common Type | Test Requirement | Priority |
|-------------------|-----------------|------------------|----------|
| Characteristics | DataRecord | Parse structure, extract values | HIGH |
| Capabilities | DataRecord | Parse structure, extract values | HIGH |
| Observable Properties | DataArray (definition) | Parse property definitions | MEDIUM |
```

#### 7. Error Condition Testing

```markdown
| Error Condition | Test Scenario | Expected Error | Test Type | Priority |
|-----------------|---------------|----------------|-----------|----------|
| Missing uniqueIdentifier | System without ID | Clear error message | Unit | HIGH |
| Invalid URI format | uniqueIdentifier = "not a uri" | Validation error | Unit | HIGH |
| Malformed JSON | Invalid JSON structure | Parse error | Unit | MEDIUM |
| Unknown system type | type = "UnknownSystem" | Warning or error | Unit | MEDIUM |
| Circular reference | System references itself in components | Detection or stack overflow prevention | Integration | LOW |
| Missing component reference | Component href points nowhere | Error handling | Integration | MEDIUM |
```

#### 8. Specification Example Fixtures

```markdown
| Spec Section | Example Type | Structure Type | Complexity | Usable as Fixture | Notes |
|--------------|--------------|----------------|------------|-------------------|-------|
| §7.2 | Complete system | PhysicalSystem | Simple | Yes | Basic system with all common properties |
| §8.3 | Composite system | PhysicalSystem | Complex | Yes | System with 3 components |
| §9.1 | Physical component | PhysicalComponent | Medium | Yes | Sensor component with characteristics |
| ... | ... | ... | ... | ... | ... |
```

#### 9. OpenSensorHub Fixture Inventory

```markdown
| Resource URL | Structure Type | Complexity | Issues Found | Usable | Notes |
|--------------|----------------|------------|--------------|--------|-------|
| /systems/weather-station-01 | PhysicalSystem | High | None | Yes | Real weather station with 5 sensors |
| /systems/temp-sensor-01 | PhysicalComponent | Medium | Missing classification | Partially | Good for basic parsing |
| ... | ... | ... | ... | ... | ... |
```

#### 10. Test Organization

```markdown
Test File: `src/ogc-api/formats/sensorml.spec.ts`

Describe Block Structure:
- describe('SensorML 3.0 Parser')
  - describe('PhysicalSystem Parsing')
    - it('should parse simple PhysicalSystem')
    - it('should parse system with components (1 level)')
    - it('should parse system with deep component nesting')
    - it('should validate uniqueIdentifier is valid URI')
    - it('should parse characteristics as SWE Common DataRecord')
    - ...
  - describe('PhysicalComponent Parsing')
    - ...
  - describe('SimpleProcess Parsing')
    - ...
  - describe('AggregateProcess Parsing')
    - ...
  - describe('Error Handling')
    - it('should error on missing uniqueIdentifier')
    - it('should error on invalid URI format')
    - ...
  - describe('Recursive Structure Handling')
    - it('should handle 2-level component nesting')
    - it('should handle 3-level component nesting')
    - ...
```

#### 11. Test Depth Definition

**"Meaningful" SensorML Test Characteristics:**

✅ **DO:**
- Parse complete fixture, validate all properties extracted
- Validate nested structures parsed correctly (characteristics, components)
- Test recursive component parsing with real nesting
- Validate URI formats strictly
- Test integration with SWE Common parser
- Test error conditions with clear assertions
- Use real spec examples or OpenSensorHub data

❌ **DON'T (Trivial):**
- Just check `result !== null`
- Just check `result.uniqueIdentifier` exists without validating format
- Skip nested structure validation
- Use overly simple hand-crafted fixtures when spec examples exist
- Test only happy path without edge cases

#### 12. Fixture Requirements

```markdown
Fixture Directory: `fixtures/sensorml/`

Required Fixtures:
- simple-physical-system.json (5 fixtures: weather station, vehicle, UAV, buoy, satellite)
- physical-component.json (3 fixtures: temp sensor, camera, accelerometer)
- simple-process.json (2 fixtures: algorithm, computation)
- aggregate-process.json (3 fixtures: processing chain, workflow)
- composite-system.json (4 fixtures: 1-level, 2-level, 3-level nesting)
- error-cases/ (5 fixtures: missing-id, invalid-uri, malformed, circular-ref, unknown-type)

Total: ~25 fixtures
```

#### 13. Validation Against Upstream Patterns

Compare with Section 1-2 findings:
- How does EDR test format parsing?
- What test depth do other implementations use?
- What fixture patterns exist upstream?
- Are we aligned with upstream quality standards?

#### 14. Integration with Implementation Guide

Cross-validate with Implementation Guide SensorML parser specification:
- ✅ Aligned: Test requirement matches Implementation Guide
- ⚠️ Gap: Test requirement not addressed in Implementation Guide
- ❌ Conflict: Test requirement conflicts with Implementation Guide

#### 15. Testing Estimates

```markdown
| Test Category | Test Count | Lines per Test | Total Lines | Time Estimate |
|---------------|------------|----------------|-------------|---------------|
| PhysicalSystem parsing | 12-15 | 12-15 | 150-225 | 2-3 hours |
| PhysicalComponent parsing | 8-10 | 10-12 | 80-120 | 1-2 hours |
| SimpleProcess parsing | 5-6 | 10-12 | 50-72 | 1 hour |
| AggregateProcess parsing | 8-10 | 10-15 | 80-150 | 1-2 hours |
| Error handling | 8-10 | 8-10 | 64-100 | 1 hour |
| Recursive structures | 5-6 | 15-20 | 75-120 | 1-2 hours |
| **TOTAL** | **46-57** | **~12 avg** | **499-787** | **7-11 hours** |
```

#### 16. Testing Priorities

**CRITICAL (Must Have):**
- PhysicalSystem parsing (most common)
- Component nesting (1-2 levels)
- uniqueIdentifier validation
- Basic error handling

**HIGH (Should Have):**
- PhysicalComponent parsing
- AggregateProcess parsing
- Characteristics/capabilities parsing (SWE Common integration)
- All spec example coverage

**MEDIUM (Nice to Have):**
- SimpleProcess parsing (less common)
- Deep nesting (3+ levels)
- Advanced error conditions
- Circular reference detection

**LOW (Optional):**
- Contacts/documentation parsing
- Position/location parsing (may defer to geometry parser)
- Performance testing

#### 17. Risks and Edge Cases

```markdown
| Risk/Edge Case | Likelihood | Impact | Mitigation |
|----------------|------------|--------|------------|
| Deep recursion causes stack overflow | Medium | High | Limit nesting depth or use iterative parsing |
| OpenSensorHub data has non-standard extensions | High | Medium | Parse core properties, ignore extensions |
| Circular references in components | Low | Medium | Detect during parsing, error gracefully |
| Very large component lists (100+ components) | Low | Low | Test with realistic fixture (10-20 components) |
| SWE Common parsing failures | Medium | High | Robust error handling, integration tests |
```

### Success Criteria

✅ All SensorML 3.0 structure types have test requirements defined  
✅ All normative validation rules documented  
✅ Recursive structure testing strategy defined  
✅ Fixture inventory complete (spec + OpenSensorHub)  
✅ Test depth defined ("meaningful" criteria)  
✅ Error handling requirements specified  
✅ SWE Common integration points identified  
✅ Test organization and estimates documented  
✅ Validated against upstream patterns  
✅ Cross-validated with Implementation Guide  

### Validation

- All structure types from spec covered
- Test depth meets "meaningful" criteria from Section 6
- Fixture count sufficient for coverage (20-25 fixtures)
- Test estimates realistic (~500-800 lines for SensorML)
- Integration tests cover SWE Common dependencies
- Error conditions comprehensive

---

## Cross-References

**Builds On:**
- Section 8: CSAPI Specification Test Requirements (SensorML validation rules)
- Section 6: "Meaningful vs Trivial" Definition (test depth guidance)
- Section 1-2: Upstream format parser test patterns
- **Format Requirements Analysis:** [docs/research/requirements/csapi-format-requirements.md](../../requirements/csapi-format-requirements.md)

**Critical For:**
- Section 12: QueryBuilder Testing (systems endpoint testing requires SensorML parsing)
- Section 14: Integration Test Workflows (system discovery workflow uses SensorML)
- Section 15: Fixture Sourcing Strategy (SensorML fixture inventory)
- Section 36: Test Quality Checklist (SensorML test validation criteria)

---

## Next Steps After Completion

1. Use test requirements to implement SensorML parser tests (Phase 3, Task 15)
2. Source fixtures from spec and OpenSensorHub (Section 15)
3. Design test file structure and organization
4. Validate test coverage against specification requirements
5. Create fixture organization strategy

---

## Risks and Mitigation

**Risk:** SensorML complexity may lead to insufficient test coverage  
**Mitigation:** Prioritize by usage frequency; focus on PhysicalSystem first

**Risk:** Recursive structures may be hard to test thoroughly  
**Mitigation:** Define clear nesting depth limits; use realistic fixtures

**Risk:** OpenSensorHub examples may be non-standard  
**Mitigation:** Prioritize spec examples; use OpenSensorHub for validation only

**Risk:** SWE Common integration may be fragile  
**Mitigation:** Clear integration test strategy; robust error handling

---

## Research Status

- [ ] Phase 1: SensorML 3.0 Specification Deep Dive (45-60 min)
- [ ] Phase 2: JSON Schema Analysis (30-45 min)
- [ ] Phase 3: Example Analysis (30-45 min)
- [ ] Phase 4: Test Strategy Design (30-45 min)
- [ ] Deliverable Complete and Reviewed

**Total Estimated Time:** 2-3 hours  
**Actual Time:** _[To be filled during research]_  
**Started:** _[Date]_  
**Completed:** _[Date]_
