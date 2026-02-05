# Research Plan: GeoJSON CSAPI Extensions Testing Requirements

**Section:** 11 of 38  
**Phase:** 3 - Component Requirements  
**Estimated Time:** 1.5-2 hours  
**Priority:** HIGH - Primary Part 1 resource format

---

## Objective

Define comprehensive testing requirements for CSAPI-specific GeoJSON extensions that build on existing GeoJSON parser. Identify what CSAPI property validation and resource-specific logic must be tested beyond standard GeoJSON compliance.

---

## Why This Research Eleventh

**Dependency Chain:** After SensorML and SWE Common testing (Sections 9-10), address the simpler but equally important GeoJSON format for Part 1 resources.

**Context:** GeoJSON is the primary encoding for CSAPI Part 1 resources (Systems, Deployments, Procedures, SamplingFeatures, Properties). The library already has a GeoJSON parser from upstream, so testing focuses on:
- **CSAPI-specific properties:** uniqueIdentifier, featureType, systemType, etc.
- **Property validation:** URI formats, vocabulary values, required vs optional
- **Resource type differentiation:** How testing differs across 5 Part 1 resource types
- **Integration with existing parser:** What's inherited vs what's new
- **Minimal duplication:** Don't re-test standard GeoJSON (already tested upstream)

This research defines:
- **CSAPI Extension Testing:** What properties are CSAPI-specific
- **Validation Rules:** URI formats, controlled vocabularies, temporal validity
- **Resource Type Coverage:** 5 Part 1 resource types (Systems, Deployments, Procedures, SamplingFeatures, Properties)
- **Reuse Strategy:** What to inherit from existing GeoJSON tests
- **Test Depth:** What constitutes "meaningful" GeoJSON CSAPI testing

---

## Key Research Questions

### CSAPI Part 1 GeoJSON Requirements

1. What GeoJSON properties are standard (inherited from RFC 7946)?
2. What GeoJSON properties are CSAPI-specific?
3. What properties are common across all Part 1 resources?
4. What properties are resource-specific?
5. What validation rules apply to CSAPI properties?
6. What controlled vocabularies must be validated?
7. What temporal properties exist (validTime, phenomenonTime)?
8. What relationship properties exist (links, associations)?

### Existing GeoJSON Parser Analysis

9. What GeoJSON parser exists in upstream ogc-client?
10. What does the existing parser already test?
11. What test coverage exists for standard GeoJSON?
12. What can be reused vs must be CSAPI-specific?
13. How does CSAPI extend the existing parser?
14. What integration points exist with existing parser?

### Resource Type Differentiation

15. **Systems:** What CSAPI-specific properties must be tested?
16. **Deployments:** What CSAPI-specific properties must be tested?
17. **Procedures:** What CSAPI-specific properties must be tested?
18. **SamplingFeatures:** What CSAPI-specific properties must be tested?
19. **Properties:** What CSAPI-specific properties must be tested?
20. What properties are shared across all 5 resource types?
21. What properties are unique per resource type?

### Property Validation Requirements

22. **uniqueIdentifier:** What URI validation is required?
23. **featureType:** What vocabulary values are valid?
24. **systemType:** What vocabulary values are valid (for Systems)?
25. **samplingFeatureType:** What vocabulary values are valid (for SamplingFeatures)?
26. **definition:** What URI validation is required?
27. **validTime:** What temporal format validation is required?
28. **phenomenonTime:** What temporal format validation is required?
29. **resultTime:** What temporal format validation is required?
30. **links:** What link structure validation is required?

### Geometry Handling

31. Does CSAPI add geometry requirements beyond RFC 7946?
32. What geometry types are used per resource type?
33. Are there CSAPI-specific CRS requirements?
34. How to test geometry parsing without duplicating RFC 7946 tests?

### featureType Vocabulary

35. What featureType values are defined for Systems?
36. What featureType values are defined for Deployments?
37. What featureType values are defined for Procedures?
38. What featureType values are defined for SamplingFeatures?
39. What featureType values are defined for Properties?
40. Is featureType validation strict or permissive?

### Temporal Property Validation

41. What temporal formats must be supported (ISO 8601)?
42. How to validate instant vs interval formats?
43. What edge cases exist (open intervals, null values)?
44. How to test validTime for Deployments?
45. How to test phenomenonTime for observations (if applicable)?

### Link Validation

46. What link relations are defined in CSAPI?
47. What link structure is required (href, rel, type)?
48. How to validate link URIs?
49. What relationships exist between resource types?

### FeatureCollection Testing

50. How to test FeatureCollection parsing?
51. What CSAPI-specific collection properties exist?
52. How to test pagination links in collections?
53. How to test mixed resource types in collections?

### Error Handling

54. What error conditions must be tested?
55. How to handle missing required CSAPI properties?
56. How to handle invalid property values (wrong type, format)?
57. How to handle invalid vocabulary values?
58. How to handle malformed temporal properties?
59. What error messages should be provided?

### Specification Examples

60. What GeoJSON examples exist in CSAPI Part 1 spec?
61. What examples exist per resource type?
62. Can all spec examples be extracted as fixtures?
63. What edge case examples exist?

### OpenSensorHub Real-World Examples

64. What GeoJSON examples available from OpenSensorHub?
65. What property complexity exists in real-world data?
66. What edge cases do real-world examples expose?
67. What validation issues exist in real-world data?
68. Can OpenSensorHub examples supplement spec examples?

### Parser Implementation Testing

69. What parsing functions are CSAPI-specific?
70. What integration tests needed with existing GeoJSON parser?
71. What test organization (one file or per resource type)?
72. What test depth per resource type?
73. How many fixtures per resource type?
74. What's the balance between spec examples and hand-crafted tests?

---

## Research Methodology

### Phase 1: CSAPI Part 1 GeoJSON Requirements (30-40 minutes)

1. Read CSAPI Part 1 specification GeoJSON encoding sections
2. Extract all CSAPI-specific property definitions
3. Document validation rules per property
4. Document controlled vocabularies
5. Extract resource type specific requirements
6. Extract all specification examples
7. Create property validation matrix

### Phase 2: Existing Parser Analysis (20-30 minutes)

1. Review existing GeoJSON parser in upstream ogc-client
2. Review existing GeoJSON tests
3. Identify what's already covered
4. Identify CSAPI-specific extensions
5. Document integration points
6. Create reuse vs new test matrix

### Phase 3: Resource Type Deep Dive (20-30 minutes)

1. Analyze Systems resource requirements
2. Analyze Deployments resource requirements
3. Analyze Procedures resource requirements
4. Analyze SamplingFeatures resource requirements
5. Analyze Properties resource requirements
6. Document shared vs unique properties
7. Create resource type testing matrix

### Phase 4: Example and Fixture Analysis (15-20 minutes)

1. Extract all Part 1 specification examples
2. Fetch real-world examples from OpenSensorHub
3. Analyze property complexity
4. Identify edge cases
5. Document fixture sourcing strategy
6. Create fixture inventory per resource type

### Phase 5: Test Strategy Design (15-20 minutes)

1. Map resource types to test requirements
2. Define CSAPI-specific test scope
3. Define integration with existing parser tests
4. Design fixture organization
5. Define test depth per resource type
6. Create test specification document

---

## Resources Required

### Primary Resources

- **CSAPI Part 1 Specification:** https://docs.ogc.org/is/23-001/23-001.html (GeoJSON encoding sections)
- **GeoJSON RFC 7946:** https://tools.ietf.org/html/rfc7946
- **CSAPI Implementation Guide:** [docs/planning/csapi-implementation-guide.md](../../../planning/csapi-implementation-guide.md) (GeoJSON handler extensions)

### Supporting Resources

- **Section 8 Deliverable:** CSAPI specification requirements (GeoJSON validation rules)
- **Part 1 Requirements Analysis:** [docs/research/requirements/csapi-part1-requirements.md](../../requirements/csapi-part1-requirements.md)
- **Format Requirements Analysis:** [docs/research/requirements/csapi-format-requirements.md](../../requirements/csapi-format-requirements.md)
- **OpenSensorHub Analysis:** [docs/research/requirements/csapi-opensensorhub-analysis.md](../../requirements/csapi-opensensorhub-analysis.md)
- Section 6 Deliverable: "Meaningful vs Trivial" guide (quality context)
- Section 1-2 Deliverables: Upstream GeoJSON parser and tests

### Tools Needed

- GeoJSON validator
- JSON schema validator
- OpenSensorHub API access

---

## Deliverable Specification

### Document: "GeoJSON CSAPI Extensions Testing Specification"

**Location:** `docs/research/testing/findings/11-geojson-csapi-testing-requirements.md`

**Note:** This goes in `findings/` because it's detailed analysis (test strategy synthesis in Section 14+).

**Required Sections:**

#### 1. Executive Summary

- CSAPI-specific properties to test
- 5 Part 1 resource types
- Testing priorities
- Fixture count requirements
- Estimated test lines
- Reuse strategy for existing GeoJSON tests

#### 2. Existing GeoJSON Parser Coverage

```markdown
| Standard GeoJSON Feature | Upstream Test Coverage | CSAPI Needs Additional Testing? | Notes |
|---------------------------|------------------------|--------------------------------|-------|
| Feature geometry parsing | ✅ Covered | ❌ No | RFC 7946 compliance tested upstream |
| Feature properties parsing | ✅ Covered | ✅ Yes (CSAPI-specific properties) | Need CSAPI property validation |
| FeatureCollection parsing | ✅ Covered | ✅ Yes (pagination links) | Need CSAPI collection extensions |
| CRS handling | ✅ Covered | ❌ No | WGS84 default tested upstream |
| Geometry validation | ✅ Covered | ❌ No | Geometry types tested upstream |
```

#### 3. CSAPI-Specific Property Testing Matrix

**Common Properties (All 5 Resource Types):**

```markdown
| Property | Required/Optional | Validation Rules | Edge Cases | Test Type | Priority |
|----------|-------------------|------------------|------------|-----------|----------|
| uniqueIdentifier | Required | Valid URI | Missing, invalid URI, relative URI | Unit | CRITICAL |
| featureType | Required | Controlled vocabulary | Unknown type, missing | Unit | CRITICAL |
| definition | Optional | Valid URI | Invalid URI, relative URI | Unit | HIGH |
| label | Optional | String | Very long, special characters, missing | Unit | MEDIUM |
| description | Optional | String | Very long, missing | Unit | LOW |
| validTime | Optional | ISO 8601 interval | Invalid format, open interval, missing | Unit | MEDIUM |
| links | Optional | Array of links | Invalid structure, missing href, invalid rel | Unit | MEDIUM |
```

#### 4. Resource Type Specific Testing Requirements

##### Systems Resource

```markdown
| Property | Required/Optional | Validation Rules | Test Scenarios | Priority |
|----------|-------------------|------------------|----------------|----------|
| systemType | Optional | Controlled vocabulary | Valid type, invalid type, missing | HIGH |
| parent | Optional | Valid system URI | Valid reference, invalid URI, missing | MEDIUM |
| samplingFeatures | Optional | Array of URIs | Valid URIs, invalid URIs, empty array | MEDIUM |
| properties | Optional | Array of URIs | Valid URIs, invalid URIs, empty array | MEDIUM |
| datastreams | Optional | Array of URIs | Valid URIs, invalid URIs, empty array | MEDIUM |
```

##### Deployments Resource

```markdown
| Property | Required/Optional | Validation Rules | Test Scenarios | Priority |
|----------|-------------------|------------------|----------------|----------|
| deployedSystem | Required | Valid system URI | Valid URI, invalid URI, missing | CRITICAL |
| platform | Optional | Valid system URI | Valid URI, invalid URI, missing | MEDIUM |
| validTime | Required | ISO 8601 interval | Valid interval, open interval, missing | HIGH |
```

##### Procedures Resource

```markdown
| Property | Required/Optional | Validation Rules | Test Scenarios | Priority |
|----------|-------------------|------------------|----------------|----------|
| procedureType | Optional | Controlled vocabulary | Valid type, invalid type, missing | MEDIUM |
| implementation | Optional | Valid procedure URI | Valid URI, invalid URI, missing | LOW |
```

##### SamplingFeatures Resource

```markdown
| Property | Required/Optional | Validation Rules | Test Scenarios | Priority |
|----------|-------------------|------------------|----------------|----------|
| samplingFeatureType | Optional | Controlled vocabulary | Valid type, invalid type, missing | HIGH |
| sampledFeature | Optional | Valid feature URI | Valid URI, invalid URI, missing | MEDIUM |
```

##### Properties Resource

```markdown
| Property | Required/Optional | Validation Rules | Test Scenarios | Priority |
|----------|-------------------|------------------|----------------|----------|
| observableProperty | Required | Valid property URI | Valid URI, invalid URI, missing | CRITICAL |
| uom | Optional | Valid UOM code | Valid UCUM, invalid code, missing | MEDIUM |
```

#### 5. featureType Vocabulary Validation

```markdown
| Resource Type | Valid featureType Values | Validation Strictness | Priority |
|---------------|--------------------------|----------------------|----------|
| Systems | system, platform, sensor | Strict (error if unknown) | HIGH |
| Deployments | deployment | Strict | HIGH |
| Procedures | procedure, process | Strict | MEDIUM |
| SamplingFeatures | samplingFeature, samplingPoint, samplingCurve, samplingSurface | Strict | HIGH |
| Properties | observableProperty | Strict | HIGH |
```

#### 6. Temporal Property Validation

```markdown
| Property | Format | Valid Examples | Invalid Examples | Test Priority |
|----------|--------|----------------|------------------|---------------|
| validTime | ISO 8601 interval | "2024-01-01/2024-12-31" | "2024-01-01" (instant), "invalid" | HIGH |
| validTime (open start) | ISO 8601 interval | "../2024-12-31" | ".../2024-12-31" (wrong syntax) | MEDIUM |
| validTime (open end) | ISO 8601 interval | "2024-01-01/.." | "2024-01-01/..." (wrong syntax) | MEDIUM |
| phenomenonTime | ISO 8601 instant or interval | "2024-01-01T12:00:00Z", "2024-01-01/2024-01-31" | "2024-01-01 12:00:00" (missing T) | MEDIUM |
```

#### 7. Link Structure Validation

```markdown
| Link Property | Required | Format | Test Scenarios | Priority |
|---------------|----------|--------|----------------|----------|
| href | Yes | Valid URI | Valid absolute URI, valid relative URI, invalid URI, missing | HIGH |
| rel | Yes | String (relation type) | Valid relation, custom relation, missing | HIGH |
| type | No | MIME type | Valid MIME, invalid MIME, missing | LOW |
| title | No | String | Valid title, missing | LOW |
```

#### 8. Error Condition Testing

```markdown
| Error Condition | Test Scenario | Expected Error | Test Type | Priority |
|-----------------|---------------|----------------|-----------|----------|
| Missing uniqueIdentifier | Feature without uniqueIdentifier | Validation error | Unit | CRITICAL |
| Invalid URI format | uniqueIdentifier = "not a uri" | Validation error | Unit | HIGH |
| Missing featureType | Feature without featureType | Validation error | Unit | HIGH |
| Unknown featureType | featureType = "unknownType" | Validation error or warning | Unit | HIGH |
| Invalid systemType vocabulary | systemType = "invalidType" | Validation warning | Unit | MEDIUM |
| Invalid validTime format | validTime = "invalid" | Validation error | Unit | MEDIUM |
| Missing required property (resource-specific) | Deployment without deployedSystem | Validation error | Unit | HIGH |
```

#### 9. Specification Example Fixtures

```markdown
| Spec Section | Resource Type | Complexity | CSAPI Properties | Usable | Notes |
|--------------|---------------|------------|------------------|--------|-------|
| Part 1, §7.2 | Systems | Simple | uniqueIdentifier, featureType, systemType | Yes | Weather station example |
| Part 1, §8.2 | Deployments | Medium | uniqueIdentifier, deployedSystem, validTime | Yes | Deployment with temporal validity |
| Part 1, §9.2 | Procedures | Simple | uniqueIdentifier, featureType, procedureType | Yes | Observation procedure |
| Part 1, §10.2 | SamplingFeatures | Medium | uniqueIdentifier, samplingFeatureType, geometry | Yes | Sampling location |
| Part 1, §11.2 | Properties | Simple | uniqueIdentifier, observableProperty, uom | Yes | Temperature property |
| ... | ... | ... | ... | ... | ... |
```

#### 10. OpenSensorHub Fixture Inventory

```markdown
| Resource URL | Resource Type | CSAPI Properties | Usable | Notes |
|--------------|---------------|------------------|--------|-------|
| /collections/sensors/systems | Systems | uniqueIdentifier, systemType, links | Yes | Real weather station |
| /collections/deployments/items | Deployments | deployedSystem, validTime | Yes | Active deployment |
| /collections/procedures/items | Procedures | uniqueIdentifier, procedureType | Partially | May have extensions |
| ... | ... | ... | ... | ... |
```

#### 11. Test Organization

```markdown
Test File: `src/ogc-api/formats/geojson-csapi.spec.ts`

Describe Block Structure:
- describe('GeoJSON CSAPI Extensions')
  - describe('Common Properties')
    - it('should validate uniqueIdentifier is valid URI')
    - it('should error on missing uniqueIdentifier')
    - it('should validate featureType is recognized')
    - it('should parse validTime as ISO 8601 interval')
    - it('should parse links array')
    - ...
  - describe('Systems Resource')
    - it('should parse Systems Feature with systemType')
    - it('should validate systemType vocabulary')
    - it('should parse parent reference')
    - it('should parse samplingFeatures array')
    - ...
  - describe('Deployments Resource')
    - it('should parse Deployments Feature with validTime')
    - it('should require deployedSystem')
    - it('should error on missing deployedSystem')
    - ...
  - describe('Procedures Resource')
    - it('should parse Procedures Feature')
    - it('should validate procedureType vocabulary')
    - ...
  - describe('SamplingFeatures Resource')
    - it('should parse SamplingFeatures Feature')
    - it('should validate samplingFeatureType vocabulary')
    - ...
  - describe('Properties Resource')
    - it('should parse Properties Feature')
    - it('should require observableProperty')
    - ...
  - describe('FeatureCollection Extensions')
    - it('should parse FeatureCollection with pagination links')
    - it('should handle mixed resource types')
    - ...
  - describe('Error Handling')
    - it('should error on missing uniqueIdentifier')
    - it('should error on invalid URI format')
    - it('should error on unknown featureType')
    - ...
```

#### 12. Test Depth Definition

**"Meaningful" GeoJSON CSAPI Test Characteristics:**

✅ **DO:**
- Parse complete fixture, validate all CSAPI properties extracted
- Validate URI formats strictly (uniqueIdentifier, definition, links)
- Validate controlled vocabularies (featureType, systemType, etc.)
- Test resource type specific properties
- Test temporal property parsing (validTime, ISO 8601 intervals)
- Test error conditions with clear assertions
- Use real spec examples or OpenSensorHub data
- Don't duplicate RFC 7946 tests (trust existing parser)

❌ **DON'T (Trivial):**
- Re-test standard GeoJSON compliance (geometry, etc.)
- Just check `result !== null`
- Skip URI validation
- Skip vocabulary validation
- Use overly simple hand-crafted fixtures when spec examples exist
- Test only happy path without edge cases

#### 13. Fixture Requirements

```markdown
Fixture Directory: `fixtures/geojson-csapi/`

Required Fixtures per Resource Type:
- Systems: 5 fixtures (simple, with components, with links, with parent, edge cases)
- Deployments: 4 fixtures (simple, with platform, open validTime, edge cases)
- Procedures: 3 fixtures (simple, with implementation, edge cases)
- SamplingFeatures: 4 fixtures (point, curve, surface, edge cases)
- Properties: 3 fixtures (simple, with UOM, edge cases)
- FeatureCollections: 3 fixtures (systems collection, mixed types, with pagination links)
- Error cases: 5 fixtures (missing uniqueIdentifier, invalid URI, unknown featureType, etc.)

Total: ~30 fixtures
```

#### 14. Validation Against Upstream Patterns

Compare with Section 1-2 findings:
- How does upstream handle GeoJSON parsing?
- What test depth exists for GeoJSON?
- Are CSAPI extensions similar to other OGC API extensions?
- What patterns exist for extending parsers?

#### 15. Integration with Implementation Guide

Cross-validate with Implementation Guide GeoJSON handler specification:
- ✅ Aligned: Test requirement matches Implementation Guide
- ⚠️ Gap: Test requirement not addressed in Implementation Guide
- ❌ Conflict: Test requirement conflicts with Implementation Guide

#### 16. Testing Estimates

```markdown
| Test Category | Test Count | Lines per Test | Total Lines | Time Estimate |
|---------------|------------|----------------|-------------|---------------|
| Common properties | 8-10 | 10-12 | 80-120 | 1-2 hours |
| Systems resource | 8-10 | 10-15 | 80-150 | 1-2 hours |
| Deployments resource | 6-8 | 10-15 | 60-120 | 1-1.5 hours |
| Procedures resource | 5-6 | 10-12 | 50-72 | 1 hour |
| SamplingFeatures resource | 6-8 | 10-15 | 60-120 | 1-1.5 hours |
| Properties resource | 5-6 | 10-12 | 50-72 | 1 hour |
| FeatureCollection extensions | 4-5 | 12-15 | 48-75 | 1 hour |
| Error handling | 8-10 | 8-10 | 64-100 | 1 hour |
| **TOTAL** | **50-63** | **~10 avg** | **492-829** | **8-11 hours** |
```

#### 17. Testing Priorities

**CRITICAL (Must Have):**
- uniqueIdentifier validation (all resources)
- featureType validation (all resources)
- Systems resource (most common)
- Deployments resource (temporal validity)
- Properties resource (observable properties)
- Basic error handling

**HIGH (Should Have):**
- SamplingFeatures resource
- Procedures resource
- Temporal property validation (validTime)
- Link structure validation
- All spec example coverage

**MEDIUM (Nice to Have):**
- Vocabulary validation strictness
- FeatureCollection pagination
- Mixed resource type collections
- Advanced error conditions

**LOW (Optional):**
- Edge case vocabularies
- Performance testing
- Complex link relationships

#### 18. Risks and Edge Cases

```markdown
| Risk/Edge Case | Likelihood | Impact | Mitigation |
|----------------|------------|--------|------------|
| OpenSensorHub data has non-standard properties | High | Low | Ignore unknown properties; warn if desired |
| Vocabulary values evolve | Medium | Medium | Configurable strictness; warning vs error |
| Temporal format edge cases | Medium | Medium | Strict ISO 8601 validation; clear errors |
| URI validation too strict/lenient | Medium | Medium | Follow RFC 3986; configurable strictness |
| Real-world data violates spec | Medium | Low | Log warnings; don't fail parsing |
```

### Success Criteria

✅ All CSAPI-specific properties have test requirements defined  
✅ All 5 Part 1 resource types covered  
✅ Validation rules documented (URI formats, vocabularies, temporal)  
✅ Reuse strategy clear (don't duplicate RFC 7946 tests)  
✅ Fixture inventory complete (30 fixtures)  
✅ Test depth defined ("meaningful" criteria)  
✅ Error handling requirements specified  
✅ Test organization and estimates documented  
✅ Validated against upstream patterns  
✅ Cross-validated with Implementation Guide  

### Validation

- All CSAPI properties from Part 1 spec covered
- Resource type differentiation clear
- Test depth meets "meaningful" criteria from Section 6
- Fixture count sufficient for coverage (30 fixtures)
- Test estimates realistic (~500-800 lines for GeoJSON CSAPI)
- Reuse strategy minimizes duplication
- Error conditions comprehensive

---

## Cross-References

**Builds On:**
- Section 8: CSAPI Specification Test Requirements (GeoJSON validation rules from Part 1)
- Section 6: "Meaningful vs Trivial" Definition (test depth guidance)
- Section 1-2: Upstream GeoJSON parser and test patterns
- **Part 1 Requirements Analysis:** [docs/research/requirements/csapi-part1-requirements.md](../../requirements/csapi-part1-requirements.md)

**Critical For:**
- Section 12: QueryBuilder Testing (Part 1 resource endpoints require GeoJSON parsing)
- Section 13: Resource Method Testing (all Part 1 resource methods use GeoJSON)
- Section 14: Integration Test Workflows (discovery workflow uses GeoJSON resources)
- Section 15: Fixture Sourcing Strategy (GeoJSON fixture inventory)
- Section 36: Test Quality Checklist (GeoJSON test validation criteria)

---

## Next Steps After Completion

1. Use test requirements to implement GeoJSON CSAPI extension tests (Phase 2, Tasks 2-6)
2. Source fixtures from Part 1 spec and OpenSensorHub
3. Design test file structure
4. Validate test coverage against Part 1 requirements
5. Create fixture organization strategy

---

## Risks and Mitigation

**Risk:** Over-testing standard GeoJSON (duplication with upstream)  
**Mitigation:** Clear reuse strategy; focus only on CSAPI-specific properties

**Risk:** Vocabulary validation may be too strict for real-world data  
**Mitigation:** Configurable strictness; warning vs error modes

**Risk:** OpenSensorHub examples may not cover all edge cases  
**Mitigation:** Supplement with spec examples and hand-crafted fixtures

**Risk:** Temporal property validation complexity  
**Mitigation:** Strict ISO 8601 validation; clear error messages

---

## Research Status

- [ ] Phase 1: CSAPI Part 1 GeoJSON Requirements (30-40 min)
- [ ] Phase 2: Existing Parser Analysis (20-30 min)
- [ ] Phase 3: Resource Type Deep Dive (20-30 min)
- [ ] Phase 4: Example and Fixture Analysis (15-20 min)
- [ ] Phase 5: Test Strategy Design (15-20 min)
- [ ] Deliverable Complete and Reviewed

**Total Estimated Time:** 1.5-2 hours  
**Actual Time:** _[To be filled during research]_  
**Started:** _[Date]_  
**Completed:** _[Date]_
