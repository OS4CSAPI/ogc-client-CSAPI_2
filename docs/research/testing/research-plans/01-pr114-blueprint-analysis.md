# Research Plan: Upstream Blueprint Analysis (PR #114 - EDR Implementation)

**Section:** 1 of 38  
**Phase:** 1 - Critical Foundation  
**Estimated Time:** 3-4 hours  
**Priority:** CRITICAL - This is our direct pattern reference

---

## Objective

Extract the complete testing blueprint from the accepted EDR implementation (PR #114 - camptocamp/ogc-client#114). Document all test patterns, structures, assertions, fixtures, and quality indicators that define what upstream maintainers accept as "meaningful" tests.

---

## Why This Research First

PR #114 is the **most recent accepted implementation** that follows the same pattern CSAPI will use (factory method + QueryBuilder + conformance detection). EDR was merged by upstream maintainers, so their test strategy is proven and accepted. Everything else in our testing strategy validates against this blueprint.

**Critical Constraint:** Our tests were previously rejected as "not meaningful, useful, deep, or end-to-end." PR #114 shows us what IS accepted.

---

## Key Research Questions

### Test File Structure
1. How many test files did EDR add?
2. What are the test file names and locations?
3. How are test files organized (per resource? per functionality?)?
4. What's the file size/line count per test file?
5. How are tests colocated with implementation vs separate test/ directory?

### Test Coverage Metrics
6. What's the overall test coverage % achieved?
7. What's the statement coverage %?
8. What's the branch coverage %?
9. What's the function coverage %?
10. Which modules have highest/lowest coverage?
11. What coverage tools/reports were used?

### Test Structure and Organization
12. How are describe/it blocks structured?
13. What's the typical nesting depth of describe blocks?
14. How are test names written (naming conventions)?
15. How are tests grouped (by method? by scenario? by resource type)?
16. What setup/teardown patterns are used (beforeEach, afterEach, beforeAll, afterAll)?

### Assertion Patterns
17. What assertion depth defines "meaningful" vs "trivial"?
    - Example: `expect(url).toContain('string')` vs `expect(parseUrl(url).pathname).toBe('/exact/path')`
18. What URL validation patterns are used?
19. How are query parameters validated?
20. How are nested objects validated?
21. What matcher types are most common (toBe, toEqual, toMatchObject, toContain)?
22. How are error conditions asserted?

### Fixture Patterns
23. What test fixtures were added?
24. Where are fixtures located?
25. What fixture formats are used (JSON, XML, real server responses)?
26. How are fixtures loaded and used in tests?
27. Are fixtures real spec examples or synthetic mocks?
28. How many fixtures per resource type?
29. What fixture variations exist (minimal, typical, maximal, edge cases, errors)?

### Test Types and Coverage
30. What's the ratio of unit tests vs integration tests?
31. What makes a test "integration" vs "unit" for EDR?
32. Are there end-to-end tests? What defines "e2e" for EDR?
33. What's tested at each level (unit, integration, e2e)?

### Test Depth Analysis
34. How many test cases per method?
35. What edge cases are covered?
36. What error conditions are tested?
37. How are optional parameters tested?
38. How are parameter combinations tested?
39. What boundary conditions are tested?

### QueryBuilder Testing Patterns
40. How is the EDRQueryBuilder class tested?
41. How are URL construction methods tested?
42. How are query parameters tested?
43. How is the factory method tested?
44. How is caching tested?
45. How is resource availability checking tested?

### Format Handling Testing
46. How are format parsers tested?
47. How is format negotiation tested?
48. What format fixtures are used?
49. How deep are format validation tests?

### Error Handling Testing
50. What error scenarios are tested?
51. How are validation errors tested?
52. How are missing resource errors tested?
53. How are malformed data errors tested?
54. What error message assertions are used?

### Integration with Existing Code
55. How is OgcApiEndpoint integration tested?
56. How is conformance detection tested?
57. How are collection operations tested?
58. How is the factory method (`edr()`) tested?

### Test Utilities and Helpers
59. What test utilities are provided?
60. What helper functions are shared across tests?
61. How are mock responses created?
62. What setup/teardown helpers exist?

### Test-to-Code Ratio
63. What's the test-to-code ratio (lines of tests / lines of implementation)?
64. How does ratio vary by component type?

### Documentation and Comments
65. How are tests documented?
66. What JSDoc comments exist in test files?
67. How is test intent documented?

### PR Review Feedback
68. What feedback did reviewers provide on tests?
69. What test changes were requested?
70. What test patterns were praised?
71. What defines "good enough" for merge?

---

## Research Methodology

### Phase 1: PR Overview (30 minutes)
1. Read complete PR #114 description and discussion
2. Review all PR comments focusing on test feedback
3. Identify reviewer expectations and concerns
4. Document merge criteria

### Phase 2: Test File Analysis (1.5-2 hours)
1. Clone/checkout camptocamp/ogc-client repository
2. Identify all test files added/modified in PR #114
3. Read each test file line-by-line
4. Document structure, patterns, assertions for each file
5. Extract code samples for key patterns
6. Count lines, coverage, test cases

### Phase 3: Pattern Extraction (1-1.5 hours)
1. Identify consistent patterns across all EDR test files
2. Document "good" vs "trivial" assertion examples
3. Extract fixture patterns and organization
4. Document test structure conventions
5. Create pattern template based on findings

### Phase 4: Documentation (30 minutes)
1. Synthesize findings into comprehensive document
2. Create side-by-side "trivial vs meaningful" examples
3. Document actionable patterns for CSAPI
4. Cross-reference with CSAPI requirements
5. Identify gaps where CSAPI differs from EDR

---

## Resources Required

### Primary Resources
- **PR #114:** https://github.com/camptocamp/ogc-client/pull/114
- **PR #114 Analysis (existing):** [docs/research/upstream/pr114-analysis.md](../../upstream/pr114-analysis.md)
- **camptocamp/ogc-client repository:** Local clone required

### Supporting Resources
- Jest documentation (library's test framework)
- EDR specification for context on what's being tested
- OGC API - Common patterns
- Previous iteration feedback on "not meaningful" tests

### Tools Needed
- Git (to examine PR diff)
- VS Code (to examine test files)
- Jest coverage reports (if available in PR artifacts)
- GitHub PR review interface

---

## Deliverable Specification

### Document: "EDR Test Pattern Blueprint"
**Location:** `docs/research/testing/findings/01-edr-test-blueprint.md`

**Required Sections:**

1. **Executive Summary**
   - Overall test approach
   - Key metrics (files, lines, coverage %)
   - Core patterns identified

2. **Test File Inventory**
   - Complete list of test files
   - File sizes and locations
   - Purpose of each file
   - Test count per file

3. **Test Structure Patterns**
   - Describe/it block conventions
   - Naming patterns
   - Setup/teardown patterns
   - Test grouping strategies

4. **Assertion Depth Analysis**
   - "Trivial" vs "Meaningful" examples (side-by-side)
   - URL validation patterns
   - Query parameter validation patterns
   - Error assertion patterns

5. **Fixture Strategy**
   - Complete fixture inventory
   - Fixture organization
   - Fixture quality (real vs synthetic)
   - Fixture usage patterns

6. **Coverage Analysis**
   - Overall coverage %
   - Coverage by component
   - Coverage targets identified
   - Gap analysis

7. **QueryBuilder Test Patterns**
   - Method testing approach
   - Parameter testing depth
   - Edge case coverage
   - Error condition testing

8. **Integration Test Patterns**
   - What qualifies as "integration"
   - Integration test structure
   - Multi-component interaction testing
   - Workflow testing

9. **Test Utilities and Helpers**
   - Shared utilities documented
   - Helper function patterns
   - Mock creation patterns

10. **Quality Indicators**
    - What makes tests "good"?
    - What patterns indicate "trivial"?
    - Review feedback patterns
    - Merge criteria

11. **CSAPI Application**
    - How patterns apply to CSAPI
    - Where CSAPI differs from EDR
    - Adaptations needed for CSAPI complexity
    - Actionable recommendations

12. **Code Examples**
    - 10+ concrete examples of good test patterns
    - Side-by-side trivial vs meaningful comparisons
    - Assertion pattern templates
    - Test structure templates

### Success Criteria

✅ Complete answer to: "What specific test patterns did upstream maintainers accept in PR #114?"  
✅ Concrete examples of "meaningful" assertions (not descriptions)  
✅ Quantifiable metrics (coverage %, test counts, file sizes)  
✅ Actionable patterns CSAPI can follow  
✅ Clear "trivial vs meaningful" distinction with examples  
✅ Complete fixture inventory and quality assessment  
✅ Test structure template ready for CSAPI  

### Validation

- Can reproduce EDR test patterns in CSAPI context
- Examples are concrete code samples, not vague descriptions
- Metrics are quantified, not estimated
- Patterns are proven (from merged PR), not theoretical

---

## Next Steps After Completion

1. Use EDR blueprint to validate Section 2 findings (upstream consistency)
2. Compare EDR patterns against Section 3 industry standards
3. Apply EDR patterns to Section 12 (QueryBuilder testing strategy)
4. Use as validation criteria for Section 36 (Test Quality Checklist)

---

## Risks and Mitigation

**Risk:** PR #114 may not have comprehensive test coverage  
**Mitigation:** Cross-reference with Section 2 (other implementations) to identify any EDR gaps

**Risk:** EDR tests may be simpler than CSAPI needs (EDR has fewer resource types)  
**Mitigation:** Document where CSAPI complexity exceeds EDR and plan adaptations

**Risk:** Coverage reports may not be available in PR  
**Mitigation:** Use current repository coverage tools to measure EDR tests retrospectively

**Risk:** Test patterns may be implicit rather than documented  
**Mitigation:** Extract patterns through direct code analysis, not relying on PR description

---

## Research Status

- [ ] Phase 1: PR Overview (30 min)
- [ ] Phase 2: Test File Analysis (1.5-2 hrs)
- [ ] Phase 3: Pattern Extraction (1-1.5 hrs)
- [ ] Phase 4: Documentation (30 min)
- [ ] Deliverable Complete and Reviewed

**Total Estimated Time:** 3-4 hours  
**Actual Time:** _[To be filled during research]_  
**Started:** _[Date]_  
**Completed:** _[Date]_
