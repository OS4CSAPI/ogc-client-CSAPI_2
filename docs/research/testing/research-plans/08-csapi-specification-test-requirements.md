# Research Plan: CSAPI Specification Test Requirements

**Section:** 8 of 38  
**Phase:** 3 - Component Requirements  
**Estimated Time:** 2-3 hours  
**Priority:** HIGH - Normative testing requirements from specifications

---

## Objective

Extract all testable requirements from CSAPI Parts 1 & 2 specifications and OpenAPI definitions to create a comprehensive specification test requirement matrix. Identify what MUST be tested to claim conformance with CSAPI standards.

---

## Why This Research Eighth

**Dependency Chain:** After understanding test patterns (Sections 1-3), validating our architecture (Sections 4-5), and defining quality criteria (Sections 6-7), now extract normative requirements from the specifications themselves.

This research identifies:
- **Normative Requirements:** What MUST be tested per specification
- **Conformance Classes:** What conformance claims require what tests
- **Specification Examples:** Reusable fixtures from spec examples
- **Query Parameters:** All valid combinations and constraints
- **Error Conditions:** Normative error responses
- **Format Validation:** Normative structure and property rules

This is the foundation for Sections 9-11 (format-specific testing) and Section 12 (QueryBuilder testing).

---

## Key Research Questions

### CSAPI Part 1 Normative Requirements

1. What conformance classes are defined in Part 1?
2. What are the testing requirements for each conformance class?
3. What resource types are normative vs optional?
4. What properties are mandatory vs optional per resource type?
5. What query parameters are defined for each resource type?
6. What query parameter combinations are valid?
7. What query parameter constraints exist (formats, ranges, vocabularies)?
8. What error responses are normative?
9. What HTTP status codes are specified?
10. What validation rules are normative for GeoJSON encoding?

### CSAPI Part 2 Normative Requirements

11. What conformance classes are defined in Part 2?
12. What are the testing requirements for each conformance class?
13. What resource types are added in Part 2?
14. What properties are mandatory vs optional for Part 2 resources?
15. What query parameters are specific to observations?
16. What are the temporal query parameter rules?
17. What are the spatial query parameter rules?
18. What command submission requirements exist?
19. What command status tracking requirements exist?
20. What validation rules are normative for SensorML/SWE Common encoding?

### OpenAPI Specification Analysis

21. What endpoints are defined in Part 1 OpenAPI?
22. What endpoints are defined in Part 2 OpenAPI?
23. What request parameters are defined in schemas?
24. What response schemas are defined?
25. What error response schemas are defined?
26. What media types are required per endpoint?
27. What HTTP methods are supported per endpoint?
28. What are the path parameter constraints?
29. What are the query parameter constraints per endpoint?
30. What validation rules are encoded in JSON schemas?

### Conformance Test Suites

31. Does CSAPI have official conformance test suites?
32. What existing test suites can be referenced?
33. What test patterns exist in conformance suites?
34. What edge cases are tested in conformance suites?
35. How do conformance suites structure tests?

### Specification Examples as Fixtures

36. What example requests exist in specifications?
37. What example responses exist in specifications?
38. What example resources exist per type?
39. What example queries demonstrate all query parameters?
40. What example error responses exist?
41. Can spec examples be extracted as JSON fixtures?
42. What spec examples demonstrate edge cases?

### Resource Type Requirements Matrix

43. Systems: What properties/behaviors must be tested?
44. Deployments: What properties/behaviors must be tested?
45. Procedures: What properties/behaviors must be tested?
46. SamplingFeatures: What properties/behaviors must be tested?
47. Properties: What properties/behaviors must be tested?
48. DataStreams: What properties/behaviors must be tested?
49. Observations: What properties/behaviors must be tested?
50. ControlStreams: What properties/behaviors must be tested?
51. Commands: What properties/behaviors must be tested?

### Query Parameter Coverage Matrix

52. What temporal query parameters exist and what formats?
53. What spatial query parameters exist and what formats?
54. What filtering parameters exist (property filters)?
55. What pagination parameters exist?
56. What sorting parameters exist?
57. What format negotiation parameters exist?
58. What relationship navigation parameters exist?
59. What are the parameter encoding rules (arrays, dates, geometries)?

### Error Condition Matrix

60. What are all normative error conditions?
61. What error responses are required for invalid parameters?
62. What error responses are required for missing resources?
63. What error responses are required for unsupported operations?
64. What error responses are required for format errors?
65. What error detail structure is normative?
66. What HTTP status codes map to what error conditions?

### Format Validation Requirements

67. What GeoJSON validation rules are normative?
68. What SensorML validation rules are normative?
69. What SWE Common validation rules are normative?
70. What property format rules exist (URIs, timestamps, enums)?
71. What structure validation rules exist (nesting, arrays, required fields)?
72. What vocabulary validation rules exist (controlled terms)?

---

## Research Methodology

### Phase 1: Part 1 Specification Deep Dive (45-60 minutes)

1. Read CSAPI Part 1 specification cover-to-cover
2. Extract all conformance classes and requirements
3. Document all normative statements (SHALL, MUST)
4. Extract all resource type definitions
5. Document all query parameters and constraints
6. Extract all specification examples
7. Document all error conditions
8. Create Part 1 requirements matrix

### Phase 2: Part 2 Specification Deep Dive (45-60 minutes)

1. Read CSAPI Part 2 specification cover-to-cover
2. Extract all conformance classes and requirements
3. Document all normative statements (SHALL, MUST)
4. Extract additional resource type definitions
5. Document Part 2-specific query parameters
6. Extract all specification examples
7. Document command/observation requirements
8. Create Part 2 requirements matrix

### Phase 3: OpenAPI Analysis (30-45 minutes)

1. Parse Part 1 OpenAPI YAML
2. Parse Part 2 OpenAPI YAML
3. Extract all endpoint definitions
4. Extract all schema definitions
5. Extract all parameter constraints
6. Document media type requirements
7. Cross-validate with specification text
8. Create OpenAPI requirements matrix

### Phase 4: Synthesis and Documentation (15-20 minutes)

1. Combine Part 1 + Part 2 + OpenAPI findings
2. Create unified test requirement matrix
3. Map requirements to test types (unit/integration/e2e)
4. Identify specification examples usable as fixtures
5. Document requirement-to-test traceability
6. Create actionable test requirement checklist

---

## Resources Required

### Primary Resources

- **CSAPI Part 1 Specification:** https://docs.ogc.org/is/23-001/23-001.html
- **CSAPI Part 1 OpenAPI:** [docs/research/standards/ogcapi-connectedsystems-1.bundled.oas31.yaml](../../standards/ogcapi-connectedsystems-1.bundled.oas31.yaml)
- **CSAPI Part 2 Specification:** https://docs.ogc.org/is/23-002/23-002.html
- **CSAPI Part 2 OpenAPI:** [docs/research/standards/ogcapi-connectedsystems-2.bundled.oas31.yaml](../../standards/ogcapi-connectedsystems-2.bundled.oas31.yaml)

### Supporting Resources

- **Part 1 Requirements Analysis:** [docs/research/requirements/csapi-part1-requirements.md](../../requirements/csapi-part1-requirements.md)
- **Part 2 Requirements Analysis:** [docs/research/requirements/csapi-part2-requirements.md](../../requirements/csapi-part2-requirements.md)
- **Implementation Guide:** [docs/planning/csapi-implementation-guide.md](../../../planning/csapi-implementation-guide.md) (for cross-validation)
- Section 6 Deliverable: "Meaningful vs Trivial" guide (quality context)

### Tools Needed

- YAML parser for OpenAPI schemas
- Markdown table generator for matrices
- JSON validator for schema validation

---

## Deliverable Specification

### Document: "CSAPI Specification Test Requirement Matrix"

**Location:** `docs/research/testing/findings/08-csapi-specification-test-requirements.md`

**Note:** This goes in `findings/` because it's raw extraction from specifications (not synthesized strategy).

**Required Sections:**

#### 1. Executive Summary

- Total normative requirements identified
- Conformance classes and their testing requirements
- Coverage across 9 resource types
- Key testing priorities

#### 2. Conformance Classes Matrix

```markdown
| Conformance Class | Part | Requirements Count | Testing Priority | Notes |
|-------------------|------|-------------------|------------------|-------|
| Core | 1 | X | CRITICAL | Base functionality |
| Systems | 1 | X | HIGH | Primary resource type |
| ... | ... | ... | ... | ... |
```

#### 3. Resource Type Requirements Matrix

**Per Resource Type (9 total):**

```markdown
### Systems Resource Requirements

| Requirement ID | Type | Description | Test Type | Priority | Spec Reference |
|----------------|------|-------------|-----------|----------|----------------|
| SYS-001 | Property | uniqueIdentifier must be valid URI | Unit | CRITICAL | Part 1, §7.2.1 |
| SYS-002 | Property | systemType from controlled vocabulary | Unit | HIGH | Part 1, §7.2.2 |
| SYS-003 | Query | filter by systemType | Integration | HIGH | Part 1, §7.3 |
| SYS-004 | Error | 404 for non-existent system | Unit | MEDIUM | Part 1, §7.4 |
| ... | ... | ... | ... | ... | ... |
```

Repeat for all 9 resource types:
- Systems
- Deployments
- Procedures
- SamplingFeatures
- Properties
- DataStreams
- Observations
- ControlStreams
- Commands

#### 4. Query Parameter Requirements Matrix

```markdown
| Parameter | Resource Types | Format | Required/Optional | Validation Rules | Example | Spec Reference |
|-----------|---------------|--------|-------------------|------------------|---------|----------------|
| phenomenonTime | DataStreams, Observations | ISO 8601 interval | Optional | Valid interval format | 2024-01-01/2024-01-31 | Part 2, §8.3.1 |
| resultTime | Observations | ISO 8601 instant/interval | Optional | Valid instant or interval | 2024-01-01T00:00:00Z | Part 2, §8.3.2 |
| bbox | All (spatial) | WGS84 coordinates | Optional | 4 values, valid bbox | -180,-90,180,90 | OGC API Common |
| ... | ... | ... | ... | ... | ... | ... |
```

#### 5. Error Condition Requirements Matrix

```markdown
| Error Condition | HTTP Status | Error Detail Required | Applies To | Test Type | Spec Reference |
|-----------------|-------------|----------------------|------------|-----------|----------------|
| Resource not found | 404 | Resource type, ID | All resources | Unit | Part 1, §5.5 |
| Invalid parameter format | 400 | Parameter name, reason | All queries | Unit | Part 1, §5.4 |
| Unsupported media type | 406 | Supported types | All resources | Unit | Part 1, §5.6 |
| Method not allowed | 405 | Allowed methods | Read-only resources | Unit | Part 1, §5.7 |
| ... | ... | ... | ... | ... | ... |
```

#### 6. Format Validation Requirements

**GeoJSON Validation (Part 1):**
```markdown
| Validation Rule | Applies To | Required/Optional | Spec Reference |
|-----------------|------------|-------------------|----------------|
| Feature must have geometry or properties | All resources | Required | RFC 7946 |
| uniqueIdentifier must be valid URI | Systems, Deployments, etc. | Required | Part 1, §6.2 |
| featureType must be recognized | All resources | Required | Part 1, §6.3 |
| ... | ... | ... | ... |
```

**SensorML Validation (Part 1 & 2):**
```markdown
| Validation Rule | Applies To | Required/Optional | Spec Reference |
|-----------------|------------|-------------------|----------------|
| System must have identification | Systems, Procedures | Required | SensorML 3.0, §7.2 |
| Components must reference valid systems | Systems (composite) | Optional | SensorML 3.0, §8.3 |
| ... | ... | ... | ... |
```

**SWE Common Validation (Part 2):**
```markdown
| Validation Rule | Applies To | Required/Optional | Spec Reference |
|-----------------|------------|-------------------|----------------|
| DataRecord must have fields | Observations schema | Required | SWE Common 3.0, §7.2 |
| Quantity must have UOM | Numeric observations | Required | SWE Common 3.0, §8.1 |
| Encoding must match schema | Binary observations | Required | SWE Common 3.0, §9 |
| ... | ... | ... | ... |
```

#### 7. Specification Examples Fixture Inventory

```markdown
| Spec Section | Example Type | Resource Type | Format | Usable as Fixture | Notes |
|--------------|--------------|---------------|--------|-------------------|-------|
| Part 1, §7.2 | Response | System | GeoJSON | Yes | Complete system with all properties |
| Part 1, §8.2 | Response | Deployment | GeoJSON | Yes | System with temporal validity |
| Part 2, §8.2 | Response | Observations | SWE Common JSON | Yes | DataArray with 3 observations |
| ... | ... | ... | ... | ... | ... |
```

#### 8. OpenAPI Schema Requirements

```markdown
| Schema Name | Purpose | Properties Count | Validation Rules | Notes |
|-------------|---------|------------------|------------------|-------|
| System | System resource | 15 | uniqueIdentifier URI, systemType vocab | ... |
| DataStream | DataStream resource | 12 | phenomenonTime interval, observedProperty URI | ... |
| Observation | Observation resource | 8 | result matches schema, resultTime valid | ... |
| ... | ... | ... | ... | ... |
```

#### 9. Endpoint Requirements Matrix

```markdown
| Endpoint | HTTP Methods | Request Parameters | Response Format | Error Responses | Spec Reference |
|----------|--------------|-------------------|-----------------|-----------------|----------------|
| /collections/{collectionId}/systems | GET | bbox, systemType, limit, offset | GeoJSON FeatureCollection | 404, 400 | Part 1, §7.3 |
| /collections/{collectionId}/systems/{systemId} | GET | None | GeoJSON Feature | 404 | Part 1, §7.2 |
| /collections/{collectionId}/systems/{systemId}/datastreams | GET | limit, offset | GeoJSON FeatureCollection | 404, 400 | Part 2, §8.3 |
| ... | ... | ... | ... | ... | ... |
```

#### 10. Test Type Mapping

```markdown
| Requirement Category | Test Type | Example Test | Priority |
|---------------------|-----------|--------------|----------|
| Property validation | Unit | Validate uniqueIdentifier is valid URI | HIGH |
| Query parameters | Unit + Integration | Test bbox filtering returns correct systems | HIGH |
| Error responses | Unit | Test 404 for non-existent system | MEDIUM |
| Format validation | Unit | Test GeoJSON structure matches RFC 7946 | HIGH |
| Multi-resource workflows | Integration/E2E | Test system → datastreams → observations | CRITICAL |
| ... | ... | ... | ... |
```

#### 11. Requirement-to-Test Traceability

For each requirement, specify:
- Requirement ID
- Test file where it's covered
- Test case name(s)
- Coverage status (planned/implemented/verified)

This will be populated during test implementation.

#### 12. Conformance Claim Validation

```markdown
| Conformance Class | Required Tests | Test File(s) | Status |
|-------------------|---------------|--------------|--------|
| Core | Landing page, conformance declaration, collections list | core.spec.ts | Planned |
| Systems | System CRUD, query parameters, GeoJSON validation | systems.spec.ts | Planned |
| Observations | Observation query, temporal/spatial filtering, SWE Common validation | observations.spec.ts | Planned |
| ... | ... | ... | ... |
```

#### 13. Testing Priorities

**CRITICAL (Must Have):**
- Core conformance class
- Systems resource (primary use case)
- Observations resource (primary data access)
- GeoJSON validation
- SWE Common JSON validation
- Query parameter validation (temporal, spatial, filters)

**HIGH (Should Have):**
- All Part 1 resources
- All Part 2 observation resources
- Error condition coverage
- SensorML validation
- Binary encoding validation

**MEDIUM (Nice to Have):**
- Command submission (Part 2, less common)
- Advanced query combinations
- Edge case coverage
- Performance validation

#### 14. Gaps and Ambiguities

Document any specification areas that are:
- Unclear or ambiguous (needs interpretation)
- Missing examples (needs hand-crafted fixtures)
- Under-specified (needs upstream clarification)
- Conflicting (Part 1 vs Part 2 vs OpenAPI discrepancies)

#### 15. Cross-Validation with Implementation Guide

Compare extracted requirements with Implementation Guide specifications:
- ✅ Aligned: Requirement matches Implementation Guide
- ⚠️ Gap: Requirement not addressed in Implementation Guide
- ❌ Conflict: Requirement conflicts with Implementation Guide

Document any gaps or conflicts for resolution.

### Success Criteria

✅ All conformance classes identified with testing requirements  
✅ All 9 resource types have requirement matrices  
✅ All query parameters documented with validation rules  
✅ All error conditions cataloged with expected responses  
✅ All specification examples inventoried as potential fixtures  
✅ OpenAPI schemas analyzed and documented  
✅ Test type mapping complete (unit/integration/e2e)  
✅ Requirement traceability framework established  
✅ Testing priorities defined (critical/high/medium)  
✅ Gaps and ambiguities documented  
✅ Cross-validated with Implementation Guide  

### Validation

- All normative statements (SHALL, MUST) extracted
- All specification examples cataloged
- OpenAPI schemas match specification text
- No conflicts between Part 1, Part 2, and OpenAPI
- Requirements are testable (concrete acceptance criteria)
- Priorities align with CSAPI usage scenarios

---

## Cross-References

**Builds On:**
- Section 6: "Meaningful vs Trivial" Definition (quality criteria context)
- Section 7: End-to-End Testing Scope (workflow context)
- **Part 1 Requirements Analysis:** [docs/research/requirements/csapi-part1-requirements.md](../../requirements/csapi-part1-requirements.md)
- **Part 2 Requirements Analysis:** [docs/research/requirements/csapi-part2-requirements.md](../../requirements/csapi-part2-requirements.md)

**Critical For:**
- Section 9: SensorML 3.0 Format Testing (format validation requirements)
- Section 10: SWE Common 3.0 Format Testing (format validation requirements)
- Section 11: GeoJSON CSAPI Extensions Testing (GeoJSON validation requirements)
- Section 12: QueryBuilder URL Construction Testing (query parameter requirements)
- Section 13: Resource Method Testing Patterns (resource operation requirements)
- Section 14: Integration Test Workflow Design (workflow requirements)
- Section 36: Test Quality Checklist (requirement coverage validation)

---

## Next Steps After Completion

1. Use requirement matrices for Sections 9-13 (component-specific testing)
2. Extract specification examples as fixtures (Section 15)
3. Create requirement traceability matrix for test implementation
4. Validate Implementation Guide against extracted requirements
5. Reference during code review to ensure all normative requirements tested

---

## Risks and Mitigation

**Risk:** Specifications may have ambiguous or conflicting requirements  
**Mitigation:** Document ambiguities; flag for upstream clarification; make reasonable interpretations documented

**Risk:** OpenAPI schemas may not fully match specification text  
**Mitigation:** Cross-validate carefully; prioritize specification text when conflicts exist

**Risk:** Too many requirements to test comprehensively  
**Mitigation:** Prioritize by conformance class and usage scenarios; implement critical requirements first

**Risk:** Specification examples may not cover edge cases  
**Mitigation:** Supplement with hand-crafted fixtures (Section 15); document gaps

---

## Research Status

- [ ] Phase 1: Part 1 Specification Deep Dive (45-60 min)
- [ ] Phase 2: Part 2 Specification Deep Dive (45-60 min)
- [ ] Phase 3: OpenAPI Analysis (30-45 min)
- [ ] Phase 4: Synthesis and Documentation (15-20 min)
- [ ] Deliverable Complete and Reviewed

**Total Estimated Time:** 2-3 hours  
**Actual Time:** _[To be filled during research]_  
**Started:** _[Date]_  
**Completed:** _[Date]_
