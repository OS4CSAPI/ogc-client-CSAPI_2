# Research Plan: Existing Upstream Test Pattern Survey

**Section:** 2 of 38  
**Phase:** 1 - Critical Foundation  
**Estimated Time:** 2-3 hours  
**Priority:** HIGH - Validates consistency across all implementations

---

## Objective

Survey and document consistent testing patterns across all existing ogc-client implementations (WFS, WMS, WMTS, STAC, EDR). Identify library-wide conventions, test-to-code ratios, shared utilities, and quality standards that define the expected testing approach for any new OGC API implementation.

---

## Why This Research Second

After understanding EDR (Section 1) - the newest and closest match to CSAPI - we need to validate those patterns are consistent across the entire library. This identifies:
- **Library-wide conventions** that all implementations follow
- **Mature patterns** from older implementations (WFS, WMS, WMTS)
- **Evolution** of testing practices over time
- **Shared infrastructure** we should leverage
- **Gaps** where EDR differs from established patterns

---

## Key Research Questions

### Implementation Inventory
1. What implementations exist in camptocamp/ogc-client?
2. When was each implementation added (chronological order)?
3. What's the maturity level of each (lines of code, features)?
4. Which implementations have the most comprehensive tests?

### Test File Consistency
5. What test file naming conventions are consistent across implementations?
6. Where are test files located (always colocated? always separate?)?
7. What's the standard test file structure template?
8. Are there variations in organization? Why?

### Coverage Consistency
9. What's the coverage % for each implementation?
10. Is there a consistent coverage target?
11. Which implementations exceed/fall short of targets?
12. How does coverage vary by component type (QueryBuilder vs parsers vs types)?

### Test Structure Patterns
13. Are describe/it block patterns consistent?
14. Do all implementations use the same test framework (Jest)?
15. Are there consistent setup/teardown patterns?
16. How are tests grouped (by file? by describe block?)?

### Assertion Patterns
17. What assertion patterns are used consistently across implementations?
18. Are URL validation patterns consistent?
19. Are query parameter validation patterns consistent?
20. Are error assertion patterns consistent?
21. What assertion depth is standard?

### Fixture Organization
22. How are fixtures organized in each implementation?
23. Is there a standard fixture directory structure?
24. Are fixtures real spec examples or synthetic mocks (consistent approach)?
25. How are fixtures named?
26. Are fixtures shared across implementations?

### Test Utility Patterns
27. What shared test utilities exist?
28. What test helpers are implementation-specific?
29. Are there mock creation utilities?
30. Are there fixture loading utilities?
31. What assertion helpers exist?

### Test-to-Code Ratios
32. What's the test-to-code ratio for each implementation?
33. Is there a consistent ratio across implementations?
34. How does ratio correlate with implementation complexity?
35. What's considered "good" coverage ratio?

### Type System Testing
36. How are TypeScript types tested across implementations?
37. Are type tests consistent?
38. What's the standard approach for interface testing?
39. Are generic types tested? How?

### Integration Test Patterns
40. What qualifies as "integration" test across implementations?
41. Are integration tests consistently structured?
42. What integration scenarios are common?
43. Is there a standard integration test file?

### Error Handling Patterns
44. How are errors tested across implementations?
45. What error types are consistently tested?
46. Are error messages validated consistently?
47. What error assertion patterns are standard?

### Conformance Testing
48. How is conformance detection tested in each implementation?
49. Are conformance tests consistent?
50. What conformance scenarios are tested?

### Format Handling
51. How are format parsers tested across implementations?
52. Are format tests consistent in structure?
53. What format validation depth is standard?

### QueryBuilder/Navigator Testing
54. How are QueryBuilder classes tested consistently?
55. What method testing patterns are universal?
56. Are parameter testing approaches consistent?

### Documentation Standards
57. What test documentation exists across implementations?
58. Are tests documented with JSDoc consistently?
59. How is test intent communicated?

### Evolution Analysis
60. How have testing patterns evolved from oldest to newest implementations?
61. What patterns were deprecated?
62. What new patterns emerged with EDR?
63. What should CSAPI adopt vs avoid?

---

## Research Methodology

### Phase 1: Implementation Identification (15 minutes)
1. Survey camptocamp/ogc-client repository
2. List all OGC API implementations with tests
3. Identify implementation dates (git history)
4. Categorize by maturity (LOC, features, test coverage)

### Phase 2: Per-Implementation Analysis (1.5-2 hours)
For each implementation (WFS, WMS, WMTS, STAC, EDR):
1. Locate all test files
2. Count test files, lines, test cases
3. Measure coverage % (if available)
4. Document test structure patterns
5. Extract fixture patterns
6. Identify test utilities used
7. Calculate test-to-code ratio
8. Extract 2-3 example test patterns

### Phase 3: Consistency Matrix (30-45 minutes)
1. Create comparison matrix across all implementations
2. Identify patterns present in 100% of implementations (universal)
3. Identify patterns present in 80%+ implementations (standard)
4. Identify patterns present in 40-60% implementations (emerging)
5. Identify patterns unique to one implementation (outliers)
6. Document pattern evolution timeline

### Phase 4: Documentation (30 minutes)
1. Synthesize findings into consistency matrix
2. Document universal patterns CSAPI must follow
3. Document standard patterns CSAPI should follow
4. Document emerging patterns to consider
5. Create recommendations for CSAPI

---

## Resources Required

### Primary Resources
- **camptocamp/ogc-client repository:** Local clone required
- All existing test files in:
  - `src/wfs/*.spec.ts` or similar
  - `src/wms/*.spec.ts` or similar
  - `src/wmts/*.spec.ts` or similar
  - `src/ogc-api/stac/*.spec.ts` or similar
  - `src/ogc-api/edr/*.spec.ts` or similar

### Supporting Resources
- [Architecture Patterns Analysis](../../upstream/architecture-patterns-analysis.md)
- [File Organization Strategy](../../upstream/file-organization-analysis.md)
- Section 1 Deliverable (EDR Test Blueprint) - for comparison
- Git history for implementation dates
- Coverage reports (if available)

### Tools Needed
- VS Code for test file examination
- Jest coverage tools
- Git for history analysis
- Spreadsheet for consistency matrix

---

## Deliverable Specification

### Document: "Upstream Test Pattern Consistency Matrix"
**Location:** `docs/research/testing/findings/02-upstream-test-consistency.md`

**Required Sections:**

1. **Executive Summary**
   - Implementations surveyed (count, names, dates)
   - Key consistency findings
   - Universal patterns identified
   - Variations and evolution

2. **Implementation Inventory**
   - Complete list with metadata
   - Maturity assessment
   - Test coverage summary
   - Implementation dates

3. **Consistency Matrix**
   - Pattern-by-pattern comparison table
   - Universal patterns (100% consistency)
   - Standard patterns (80%+ consistency)
   - Emerging patterns (40-60% consistency)
   - Outlier patterns (unique to one)

4. **Test File Organization**
   - Naming conventions (consistent vs varied)
   - Location patterns (consistent vs varied)
   - Structure patterns (consistent vs varied)
   - Recommendations for CSAPI

5. **Coverage Analysis**
   - Coverage % per implementation
   - Coverage targets identified
   - Coverage consistency assessment
   - Recommended targets for CSAPI

6. **Test Structure Standards**
   - Describe/it block patterns
   - Setup/teardown patterns
   - Test naming conventions
   - Grouping strategies
   - Recommended structure for CSAPI

7. **Assertion Standards**
   - URL validation patterns
   - Query parameter patterns
   - Error assertion patterns
   - Depth standards
   - Recommended assertions for CSAPI

8. **Fixture Standards**
   - Organization patterns
   - Naming patterns
   - Quality standards (real vs mock)
   - Sharing patterns
   - Recommended approach for CSAPI

9. **Test Utility Analysis**
   - Shared utilities inventory
   - Implementation-specific utilities
   - Common patterns
   - Recommended utilities for CSAPI

10. **Test-to-Code Ratios**
    - Ratio per implementation
    - Average ratio
    - Ratio by component type
    - Recommended ratio for CSAPI

11. **Pattern Evolution**
    - Timeline of testing practices
    - Deprecated patterns
    - Emerging patterns
    - What CSAPI should adopt

12. **CSAPI Recommendations**
    - Must follow (universal patterns)
    - Should follow (standard patterns)
    - Consider (emerging patterns)
    - Avoid (deprecated patterns)
    - CSAPI-specific adaptations needed

### Matrix Format Example

```markdown
| Pattern | WFS | WMS | WMTS | STAC | EDR | Consistency | Recommendation |
|---------|-----|-----|------|------|-----|-------------|----------------|
| Colocated test files | ✅ | ✅ | ✅ | ✅ | ✅ | 100% | MUST |
| Jest framework | ✅ | ✅ | ✅ | ✅ | ✅ | 100% | MUST |
| >80% coverage | ✅ | ⚠️ | ✅ | ✅ | ✅ | 80% | SHOULD |
| URL parseUrl() validation | ❌ | ❌ | ✅ | ✅ | ✅ | 60% | CONSIDER |
```

### Success Criteria

✅ All implementations surveyed with quantifiable metrics  
✅ Complete consistency matrix with % ratings  
✅ Universal patterns identified (must follow)  
✅ Standard patterns identified (should follow)  
✅ Clear recommendations for CSAPI  
✅ Pattern evolution timeline documented  
✅ Test-to-code ratio benchmarks established  
✅ Validates or contradicts EDR patterns from Section 1  

### Validation

- Matrix covers all major test aspects
- Consistency ratings are based on quantifiable analysis
- Recommendations are actionable for CSAPI
- Patterns are proven across multiple implementations
- Evolution shows improvement over time

---

## Cross-References

**Validates Against:**
- Section 1: EDR Test Blueprint (should align with universal patterns)

**Informs:**
- Section 4: Implementation Guide requirements validation
- Section 12: QueryBuilder testing strategy (consistent patterns)
- Section 19: Test organization and file structure (naming conventions)
- Section 34: Test utility design (shared utilities)

---

## Next Steps After Completion

1. Compare findings with Section 1 (EDR blueprint)
2. Validate universal patterns are in EDR
3. Identify any EDR deviations from standard patterns
4. Use consistency matrix to guide all subsequent test design
5. Update Section 3 research with library-specific context

---

## Risks and Mitigation

**Risk:** Older implementations (WFS, WMS) may have outdated test patterns  
**Mitigation:** Weight recent implementations (STAC, EDR) more heavily; document evolution

**Risk:** Different implementations may have different complexity requiring different patterns  
**Mitigation:** Normalize comparisons by complexity; identify complexity-driven variations

**Risk:** Coverage metrics may not be consistently available  
**Mitigation:** Use current coverage tools to measure retrospectively; estimate if needed

**Risk:** Time-consuming to analyze 5+ implementations deeply  
**Mitigation:** Focus on pattern presence/absence rather than deep analysis of each; sample 2-3 tests per implementation for depth

---

## Research Status

- [ ] Phase 1: Implementation Identification (15 min)
- [ ] Phase 2: Per-Implementation Analysis (1.5-2 hrs)
- [ ] Phase 3: Consistency Matrix (30-45 min)
- [ ] Phase 4: Documentation (30 min)
- [ ] Deliverable Complete and Reviewed

**Total Estimated Time:** 2-3 hours  
**Actual Time:** _[To be filled during research]_  
**Started:** _[Date]_  
**Completed:** _[Date]_
