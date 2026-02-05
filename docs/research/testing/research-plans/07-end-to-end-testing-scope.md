# Research Plan: End-to-End Testing Scope Definition

**Section:** 7 of 38  
**Phase:** 2 - Architecture Integration  
**Estimated Time:** 1 hour  
**Priority:** HIGH - Senior dev criticized lack of "end-to-end" tests

---

## Objective

Define what "end-to-end" means for a URL-building client library that doesn't make HTTP calls. Establish clear scope, boundaries, and test structure for e2e tests that satisfy the senior dev's "end-to-end" requirement while remaining appropriate for the library's architecture.

---

## Why This Research Seventh

**Primary Constraint:** Senior dev specifically criticized lack of "end-to-end" tests.

After defining test quality (Section 6), clarify what "end-to-end" means in CSAPI context. For a library that **builds URLs but doesn't make HTTP calls**, e2e has a different meaning than traditional API client e2e tests. This research defines:
- **What** constitutes e2e for CSAPI
- **Scope** of e2e tests (boundaries)
- **Structure** of e2e tests (how to implement)
- **Distinction** from integration tests
- **Test pyramid** distribution (unit/integration/e2e ratios)

---

## Key Research Questions

### E2E Definition for URL-Building Libraries
1. What is "end-to-end" for a library that doesn't make HTTP calls?
2. Is e2e about multi-component interaction?
3. Is e2e about complete workflows?
4. Is e2e about full library API surface coverage?
5. What's the "end" in "end-to-end" for CSAPI?

### Scope and Boundaries
6. What's the entry point of an e2e test? (`OgcApiEndpoint.fromUrl()`?)
7. What's the exit point of an e2e test? (URL string? Parsed format?)
8. Does e2e include format parsing or just URL building?
9. Does e2e include HTTP mocking or assume URLs are correct?
10. What components must be involved for a test to be e2e?

### Integration vs E2E Distinction
11. What's the difference between integration and e2e for CSAPI?
12. Where's the boundary?
13. Are the 4 workflows in Implementation Guide integration or e2e?
14. Can integration tests satisfy the e2e requirement?
15. Do we need both integration AND e2e tests, or are they the same?

### Workflow-Based E2E
16. Is e2e about complete workflows (discovery → query → parse)?
17. What workflows constitute e2e coverage?
18. How do workflows differ from integration tests?
19. How many workflow scenarios are sufficient?

### Implementation Guide Workflows
20. Discovery workflow: Is this e2e or integration?
    - Connect → check conformance → list collections → retrieve resources
21. Observation workflow: Is this e2e or integration?
    - Systems → datastreams → observations → pagination → parsing
22. Command workflow: Is this e2e or integration?
    - Systems → control streams → feasibility → submit → status → result
23. Cross-resource navigation: Is this e2e or integration?
    - System → deployments → procedures → sampling features → datastreams → observations

### Upstream E2E Patterns
24. How does EDR define e2e tests?
25. Do other upstream implementations have e2e tests?
26. What patterns exist in upstream for e2e vs integration?
27. What did upstream maintainers accept as e2e in PR #114?

### Industry E2E Patterns
28. How do TypeScript client libraries define e2e?
29. Do client libraries without HTTP have e2e tests?
30. What's the industry standard for e2e in URL-building libraries?
31. Examples from @octokit/rest, axios, AWS SDK?

### Test Pyramid Distribution
32. What's the recommended test pyramid for CSAPI?
33. What % should be unit tests?
34. What % should be integration tests?
35. What % should be e2e tests?
36. How does CSAPI test pyramid compare to upstream?
37. How does it compare to industry standards?

### E2E Test Structure
38. How should e2e tests be organized?
39. One e2e test file or multiple?
40. How long should e2e tests be (lines per test)?
41. What setup is required for e2e tests?
42. What fixtures are required for e2e tests?
43. How to mock HTTP responses for e2e tests (if needed)?

### E2E Coverage Requirements
44. What must be covered by e2e tests?
45. Do all 9 resource types need e2e coverage?
46. Do all workflows need e2e coverage?
47. What's the minimum viable e2e test suite?
48. What's comprehensive e2e coverage?

### Error Scenarios in E2E
49. Should e2e tests cover error scenarios?
50. What error workflows are e2e vs unit?
51. How deep should e2e error testing go?

### Performance Considerations
52. Should e2e tests validate performance?
53. Are e2e tests slower than integration tests?
54. What's acceptable e2e test execution time?

---

## Research Methodology

### Phase 1: Upstream E2E Analysis (20-25 minutes)
1. Review Section 1 deliverable: Does EDR have e2e tests?
2. Review Section 2 deliverable: Do other implementations have e2e tests?
3. Extract e2e patterns from upstream
4. Document e2e vs integration distinction in upstream
5. Identify what upstream considers e2e

### Phase 2: Industry E2E Analysis (15-20 minutes)
1. Review Section 3 deliverable: Industry e2e standards
2. Analyze client library e2e patterns
3. Understand e2e for non-HTTP libraries
4. Extract e2e scope definitions
5. Document test pyramid distributions

### Phase 3: CSAPI E2E Definition (15-20 minutes)
1. Apply upstream + industry patterns to CSAPI
2. Define e2e scope specific to CSAPI architecture
3. Clarify integration vs e2e boundary
4. Map Implementation Guide workflows to integration/e2e
5. Define test pyramid for CSAPI

### Phase 4: Documentation (10 minutes)
1. Synthesize findings into e2e scope document
2. Create clear definition and boundaries
3. Provide concrete e2e test examples
4. Define test pyramid distribution
5. Create actionable e2e testing strategy

---

## Resources Required

### Primary Resources
- Section 1 Deliverable: EDR Test Pattern Blueprint (e2e patterns)
- Section 2 Deliverable: Upstream Test Consistency Matrix (e2e across implementations)
- Section 3 Deliverable: TypeScript Testing Standards (industry e2e)
- **Implementation Guide:** [docs/planning/csapi-implementation-guide.md](../../planning/csapi-implementation-guide.md) (4 workflow types)

### Supporting Resources
- Section 6 Deliverable: "Meaningful vs Trivial" Definition (quality context)
- Senior dev feedback on lack of e2e tests

### Tools Needed
- Test pyramid visualization
- Workflow diagram for e2e scenarios

---

## Deliverable Specification

### Document: "End-to-End Testing Scope and Strategy"
**Location:** `docs/research/testing/results/07-end-to-end-testing-scope.md`

**Note:** This goes in `results/` not `findings/` because it's a synthesized, actionable strategy.

**Required Sections:**

1. **Executive Summary**
   - E2E definition for CSAPI
   - E2E vs integration distinction
   - E2E scope and boundaries
   - Test pyramid distribution
   - E2E coverage requirements

2. **E2E Definition for URL-Building Libraries**
   - What "end-to-end" means for CSAPI
   - Entry point: `OgcApiEndpoint.fromUrl()`
   - Exit point: Complete workflow execution (URL + parsing)
   - Components involved: All layers (endpoint → QueryBuilder → formats)
   - Workflow completion: Multi-step scenarios

3. **E2E vs Integration Distinction**
   ```markdown
   | Aspect | Integration Test | End-to-End Test |
   |--------|-----------------|-----------------|
   | Scope | 2-3 components | All components |
   | Entry | Mid-level API | Top-level API |
   | Workflow | Partial | Complete |
   | Example | QueryBuilder + helpers | Endpoint → QueryBuilder → format parser |
   ```

4. **E2E Scope and Boundaries**
   - **IN SCOPE:**
     - Complete workflows from `OgcApiEndpoint.fromUrl()` to parsed results
     - Multi-resource navigation across 9 resource types
     - Format parsing integration (URL → format detection → parsing)
     - Conformance-based behavior (adapt to server capabilities)
     - Error workflows (server errors → client error handling)
   - **OUT OF SCOPE:**
     - Actual HTTP calls (mocked responses)
     - Server-side behavior
     - Network latency/performance
     - Real-time streaming (unless library supports it)

5. **E2E Workflows for CSAPI**
   - **Workflow 1: Discovery**
     - Steps: Connect → conformance check → list collections → filter by type → retrieve resources
     - Components: OgcApiEndpoint, conformance detector, collection manager, QueryBuilder
     - Exit: Resource list with metadata
   - **Workflow 2: Observation Query**
     - Steps: Discover systems → find datastreams → query observations → paginate → parse results
     - Components: OgcApiEndpoint, QueryBuilder (systems, datastreams, observations), SWE Common parser
     - Exit: Parsed observation array
   - **Workflow 3: Command Submission**
     - Steps: Discover systems → find control streams → check feasibility → submit command → track status → retrieve results
     - Components: OgcApiEndpoint, QueryBuilder (systems, controlstreams, commands), status tracker
     - Exit: Command result with status
   - **Workflow 4: Cross-Resource Navigation**
     - Steps: System → deployments → procedures → sampling features → datastreams → observations
     - Components: OgcApiEndpoint, QueryBuilder (all resource types), navigation links
     - Exit: Complete resource graph

6. **Test Pyramid Distribution**
   ```
         E2E (10-15%)
         ~500-800 lines
         4 workflow tests
            /\
           /  \
          /    \
         /      \
        /        \
       / Integration \
      /    (15-20%)   \
     /   ~800-1,200    \
    /      lines        \
   /____________________\
   
          Unit (65-75%)
        ~3,200-4,400 lines
         Component tests
   ```
   - **Unit Tests (65-75%):** Individual component testing
   - **Integration Tests (15-20%):** Multi-component interaction
   - **E2E Tests (10-15%):** Complete workflows

7. **E2E Test Structure**
   - File: `e2e.spec.ts` or `integration.e2e.spec.ts`
   - Organization: One test per workflow
   - Length: 100-200 lines per workflow test
   - Setup: Mock HTTP responses for all endpoints in workflow
   - Assertions: Validate complete workflow outcome + intermediate states

8. **E2E Test Example Structure**
   ```typescript
   describe('CSAPI End-to-End Workflows', () => {
     let endpoint: OgcApiEndpoint;
     
     beforeEach(async () => {
       // Mock HTTP responses for entire workflow
       mockHttpResponses({
         '/': landingPageResponse,
         '/conformance': conformanceResponse,
         '/collections': collectionsResponse,
         '/collections/sensors/systems': systemsResponse,
         // ... etc
       });
       
       endpoint = await OgcApiEndpoint.fromUrl('https://api.example.com');
     });
     
     it('should complete observation query workflow end-to-end', async () => {
       // 1. Discover systems
       const builder = await endpoint.csapi('sensors');
       const systemsUrl = builder.getSystems();
       expect(parseUrl(systemsUrl).pathname).toBe('/collections/sensors/systems');
       
       // 2. Find datastreams
       const datastreamsUrl = builder.getSystemDataStreams('system-1');
       expect(parseUrl(datastreamsUrl).pathname).toContain('/systems/system-1/datastreams');
       
       // 3. Query observations
       const obsUrl = builder.getDataStreamObservations('ds-1', {
         phenomenonTime: '2024-01-01/2024-01-31'
       });
       expect(parseUrl(obsUrl).query).toMatchObject({
         phenomenonTime: '2024-01-01/2024-01-31'
       });
       
       // 4. Parse results
       const observations = await parseObservations(mockObservationResponse);
       expect(observations).toHaveLength(100);
       expect(observations[0].result).toBeDefined();
     });
   });
   ```

9. **E2E Coverage Requirements**
   - **Minimum Viable:**
     - 1 test per workflow type (4 total)
     - Happy path coverage
     - ~400-500 lines
   - **Comprehensive:**
     - 2-3 tests per workflow (variations, edge cases)
     - Error scenario coverage
     - ~700-1,000 lines
   - **Target for CSAPI:** Comprehensive (align with Phase 4 Task 2)

10. **Integration vs E2E Mapping**
    - **Implementation Guide "Integration Tests" = E2E Tests**
    - 4 workflow types = 4 e2e tests
    - ~500-800 lines (Task 2 of Phase 4)
    - This satisfies senior dev's e2e requirement

11. **HTTP Mocking Strategy for E2E**
    - Mock complete workflow responses
    - Use realistic spec example fixtures
    - Mock error responses for error workflows
    - Mock pagination links
    - Mock format negotiation

12. **Error Workflows in E2E**
    - Server error handling (404, 500)
    - Validation errors (invalid parameters)
    - Network errors (timeout, connection failure)
    - Malformed responses
    - Should have 1-2 error workflow e2e tests

13. **E2E Test Organization**
    - Single file: `e2e.spec.ts`
    - 4-6 workflow tests
    - Shared setup (mock infrastructure)
    - Fixture directory for e2e scenarios

14. **Validation Against Upstream**
    - EDR e2e patterns (if any)
    - Upstream integration test patterns
    - Alignment or deviation justification

15. **Validation Against Industry**
    - Industry e2e standards for client libraries
    - Test pyramid alignment
    - Mocking strategy alignment

16. **Application to CSAPI Roadmap**
    - Phase 4, Task 2: Integration Tests = E2E Tests
    - ~500-800 lines for 4 workflows
    - Write after Phases 1-3 complete (need all components)
    - Validates complete implementation end-to-end

### Success Criteria

✅ Clear definition of e2e for CSAPI  
✅ Unambiguous integration vs e2e distinction  
✅ Scope and boundaries defined  
✅ 4 workflow specifications ready for implementation  
✅ Test pyramid distribution defined  
✅ E2E test structure and organization specified  
✅ HTTP mocking strategy defined  
✅ Coverage requirements clear (minimum vs comprehensive)  
✅ Addresses senior dev's e2e criticism  
✅ Validated against upstream + industry patterns  

### Validation

- Definition is clear and unambiguous
- Scope is appropriate for URL-building library
- Workflows are concrete and implementation-ready
- Test pyramid aligns with upstream + industry
- E2E tests are achievable within Phase 4 time estimates
- Senior dev feedback addressed

---

## Cross-References

**Builds On:**
- Section 1: EDR Test Blueprint (upstream e2e patterns)
- Section 2: Upstream Test Consistency (e2e across implementations)
- Section 3: TypeScript Testing Standards (industry e2e)
- Section 6: "Meaningful vs Trivial" Definition (quality context)
- Senior dev feedback (lack of e2e tests)

**Critical For:**
- Section 14: Integration Test Workflow Design (implements these e2e tests)
- Section 36: Test Quality Checklist (e2e validation criteria)

---

## Next Steps After Completion

1. Use definition to implement Phase 4 Task 2 (Integration Tests)
2. Validate workflows align with Implementation Guide
3. Design HTTP mocking infrastructure
4. Create e2e fixture directory
5. Reference during code review to validate e2e coverage

---

## Risks and Mitigation

**Risk:** E2E may be over-scoped (too ambitious)  
**Mitigation:** Validate scope against upstream patterns; start with minimum viable

**Risk:** Integration and e2e may be conflated  
**Mitigation:** Clear distinction in deliverable; concrete examples of each

**Risk:** E2E may require HTTP calls (not practical)  
**Mitigation:** Clearly define mocking strategy; validate against industry standards

**Risk:** E2E estimate may not fit Phase 4 timeline  
**Mitigation:** Validate 500-800 lines is achievable for 4 workflows

---

## Research Status

- [ ] Phase 1: Upstream E2E Analysis (20-25 min)
- [ ] Phase 2: Industry E2E Analysis (15-20 min)
- [ ] Phase 3: CSAPI E2E Definition (15-20 min)
- [ ] Phase 4: Documentation (10 min)
- [ ] Deliverable Complete and Reviewed

**Total Estimated Time:** 1 hour  
**Actual Time:** _[To be filled during research]_  
**Started:** _[Date]_  
**Completed:** _[Date]_
