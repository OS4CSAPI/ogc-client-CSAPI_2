# Research Plan: Roadmap Testing Integration Strategy

**Section:** 5 of 38  
**Phase:** 2 - Architecture Integration  
**Estimated Time:** 1 hour  
**Priority:** HIGH - Defines incremental testing workflow across 34 tasks

---

## Objective

Understand how the 34-task incremental Roadmap structures testing with the "test immediately after each subtask" pattern. Define when to write what tests, how to organize tests incrementally, and how to prevent test debt accumulation across 4 phases.

---

## Why This Research Fifth

The Roadmap specifies "write tests immediately after each subtask" as a core principle to prevent test debt. After validating Implementation Guide requirements (Section 4), understand how those requirements distribute across 34 incremental tasks. This defines:
- **When** to write tests (after which subtasks)
- **What** to test at each checkpoint
- **How** to organize tests incrementally
- **How** to prevent test debt with incremental development
- **How** to commit tests (per subtask vs per phase)

---

## Key Research Questions

### Roadmap Structure
1. How many total tasks are in the Roadmap? (34 tasks across 4 phases)
2. How do tasks break down by phase?
   - Phase 1: 4 tasks (Core Structure)
   - Phase 2: 9 tasks (QueryBuilder Methods)
   - Phase 3: 15 tasks (Format Handling)
   - Phase 4: 4 tasks (Worker & Tests)
3. What's the time estimate for each phase?
4. What's the incremental testing pattern per phase?

### Test-Immediately Pattern
5. What does "test immediately after each subtask" mean concretely?
6. How does this pattern vary by phase?
7. How does this pattern vary by task type (implementation vs pure testing)?
8. What's the maximum time between implementation and tests?

### Phase 1 Testing Strategy
9. What are Phase 1's 4 tasks?
10. What tests are written after each Phase 1 task?
11. What's the test accumulation pattern in Phase 1?
12. What test files exist after Phase 1 completion?
13. What coverage is expected after Phase 1?

### Phase 2 Testing Strategy
14. What are Phase 2's 9 resource type tasks?
15. What tests are written after each resource type implementation?
16. How do tests accumulate across 9 resource types?
17. What's the commit strategy for Phase 2 tests?
18. What test organization prevents duplication across 9 similar tasks?
19. What coverage is expected after Phase 2?

### Phase 3 Testing Strategy
20. What are Phase 3's 15 format handling tasks?
21. How do tests accumulate across 15 parser subtasks?
22. What's the testing checkpoint for each parser component?
23. How are format tests organized (all in one file vs separate)?
24. What coverage is expected after Phase 3?

### Phase 4 Testing Strategy
25. What are Phase 4's 4 tasks?
26. How does Phase 4 differ (Tasks 2-3 ARE testing tasks)?
27. What worker tests are written in Task 1?
28. What integration tests are written in Task 2?
29. What unit tests are completed in Task 3?
30. What documentation is completed in Task 4?

### Test File Evolution
31. What test files are created in Phase 1?
32. What test files are added in Phase 2?
33. What test files are added in Phase 3?
34. What test files are added in Phase 4?
35. How does test file structure evolve across phases?

### Test Line Accumulation
36. What are test line estimates by phase?
   - Phase 1: 400-550 lines
   - Phase 2: 800-1,000 lines
   - Phase 3: 2,400-3,500 lines
   - Phase 4: 800-1,250 lines
37. How do estimates align with task granularity?
38. What's the average lines per task?
39. Are any tasks accumulating too many test lines without checkpoints?

### Test Debt Prevention
40. What's the maximum implementation time before testing?
41. How does incremental testing prevent test debt?
42. What are the natural test checkpoints in each phase?
43. What's the commit frequency for tests?
44. How to balance test completeness vs incremental progress?

### Test Organization Strategy
45. How are tests organized to support incremental development?
46. When to create new test files vs add to existing?
47. How to structure tests for 9 similar resource types (Phase 2)?
48. How to structure tests for 15 parser subtasks (Phase 3)?
49. How to prevent test file bloat?

### Coverage Evolution
50. What's the target coverage after each phase?
51. How does coverage increase incrementally?
52. What components have full coverage early vs late?
53. How to track coverage during incremental development?

### Integration with Implementation Guide
54. How do Roadmap test estimates align with Implementation Guide estimates?
55. Are there discrepancies in test line counts?
56. Are there discrepancies in test types?
57. Are there discrepancies in test organization?

### Commit Strategy
58. What's the recommended commit frequency?
59. Should tests be committed with implementation (same commit)?
60. Should tests be committed separately (test-only commits)?
61. What's the recommended commit message pattern?
62. How to track incremental test progress in commits?

---

## Research Methodology

### Phase 1: Roadmap Deep Dive (20-30 minutes)
1. Read complete Roadmap document
2. Extract all 34 tasks with time estimates
3. Identify test specifications per task
4. Document test accumulation pattern per phase
5. Extract test line estimates per phase
6. Map test checkpoints across all tasks

### Phase 2: Cross-Reference Analysis (20-30 minutes)
1. Compare Roadmap test estimates with Implementation Guide (Section 4)
2. Validate test organization aligns with file structure specs
3. Identify any discrepancies or gaps
4. Map Roadmap tasks to test types
5. Validate incremental pattern prevents test debt

### Phase 3: Documentation (15-20 minutes)
1. Synthesize findings into incremental testing workflow
2. Create phase-by-phase testing guide
3. Document task-by-task test specifications
4. Create test accumulation timeline
5. Define commit strategy recommendations

---

## Resources Required

### Primary Resources
- **Roadmap:** [docs/planning/ROADMAP.md](../../planning/ROADMAP.md)
  - All 4 phases with task breakdowns
  - Test-immediately specifications
  - Development Standards section

### Supporting Resources
- Section 4 Deliverable: Implementation Guide Testing Requirements
- **Implementation Guide:** [docs/planning/csapi-implementation-guide.md](../../planning/csapi-implementation-guide.md)
  - For cross-reference validation

### Tools Needed
- Spreadsheet for task-by-task test mapping
- Timeline visualization for test accumulation

---

## Deliverable Specification

### Document: "Incremental Testing Workflow by Roadmap Phase"
**Location:** `docs/research/testing/findings/05-roadmap-testing-integration.md`

**Required Sections:**

1. **Executive Summary**
   - 34 tasks across 4 phases
   - Test-immediately pattern summary
   - Total test line accumulation (4,500-6,000 lines)
   - Key incremental testing principles
   - Commit strategy recommendation

2. **Incremental Testing Principles**
   - What "test immediately" means
   - Maximum time between implementation and tests
   - Test debt prevention strategy
   - Natural checkpoint identification
   - Commit frequency recommendations

3. **Phase 1: Core Structure (4 tasks, 400-550 test lines)**
   - Task 1: Create Type System
     - What to test: Type validation tests (~200-300 lines)
     - When to test: Immediately after types defined
     - Test file: `model.spec.ts`
   - Task 2: Create Helper Utilities
     - What to test: Helper function tests (~100-150 lines)
     - When to test: Immediately after helpers implemented
     - Test file: Add to helper tests
   - Task 3: Create Stub QueryBuilder
     - What to test: Constructor, resource validation (~100-150 lines)
     - When to test: Immediately after stub created
     - Test file: `url_builder.spec.ts` (initial)
   - Task 4: Integrate with OgcApiEndpoint
     - What to test: Integration tests (~100-150 lines)
     - When to test: Immediately after integration complete
     - Test file: Add to integration tests
   - Phase 1 completion: 4 test checkpoints, ~400-550 lines total

4. **Phase 2: QueryBuilder Methods (9 tasks, 800-1,000 test lines)**
   - Task-by-task breakdown for all 9 resource types
   - For each task (example: Task 1 - Systems Methods):
     - Implementation: 12 Systems methods (~2-2.5 hrs)
     - Testing: Systems method tests immediately (~0.5 hr, ~40-50 lines)
     - Test file: Add to `url_builder.spec.ts`
     - Checkpoint: Commit implementation + tests together
   - Pattern repeated 9 times
   - Phase 2 completion: 9 test checkpoints, ~800-1,000 lines accumulated

5. **Phase 3: Format Handling (15 tasks, 2,400-3,500 test lines)**
   - Task-by-task breakdown for all 15 format subtasks
   - Extensions (Tasks 1-3):
     - GeoJSON, Format Detector, Validator
     - Test immediately after each (~150-300, ~50-100, ~200-400 lines)
   - SWE Common (Tasks 4-9, 6 subtasks):
     - Types → Components → DataRecord → DataArray → Main → Index
     - Test immediately after each (~50-300 lines per subtask)
   - SensorML (Tasks 10-15, 6 subtasks):
     - Types → Simple → Aggregate → Physical → Main → Index
     - Test immediately after each (~50-200 lines per subtask)
   - Format Constants & Index (Tasks 16-17)
   - Phase 3 completion: 15 test checkpoints, ~2,400-3,500 lines accumulated

6. **Phase 4: Worker & Tests (4 tasks, 800-1,250 test lines)**
   - Task 1: Worker Extensions
     - Implementation: 9 message types (~3-4 hrs)
     - Testing: Worker tests immediately (~0.5 hr, ~200-300 lines)
   - Task 2: Integration Tests (~4-6 hrs, ~500-800 lines)
     - THIS IS A TESTING TASK (writing integration tests)
   - Task 3: Unit Tests Completion (~3-4 hrs, ~300-450 lines)
     - THIS IS A TESTING TASK (completing unit coverage)
   - Task 4: API Documentation (~2-3 hrs)
     - Documentation task, no tests added
   - Phase 4 completion: 3 test checkpoints (Task 1 impl test, Tasks 2-3 pure testing)

7. **Test File Evolution Timeline**
   - Phase 1: Create `model.spec.ts`, `url_builder.spec.ts` (initial)
   - Phase 2: Expand `url_builder.spec.ts` (9 resource types)
   - Phase 3: Add format test files (SensorML, SWE Common, GeoJSON tests)
   - Phase 4: Add worker tests, integration tests, complete unit tests
   - Final test file structure

8. **Test Line Accumulation Chart**
   - Phase 1: 0 → 400-550 lines (4 checkpoints)
   - Phase 2: 400-550 → 1,200-1,550 lines (9 checkpoints)
   - Phase 3: 1,200-1,550 → 3,600-5,050 lines (15 checkpoints)
   - Phase 4: 3,600-5,050 → 4,500-6,300 lines (3 checkpoints)
   - Total: 31 test checkpoints across 34 tasks

9. **Test Organization Strategy**
   - When to create new test files
   - When to add to existing test files
   - How to organize 9 similar resource type tests
   - How to organize 15 parser subtask tests
   - Preventing test file bloat

10. **Commit Strategy**
    - Implementation + immediate tests in same commit (recommended)
    - Or: Implementation commit → test commit immediately after
    - Commit message pattern examples
    - How to track incremental progress
    - When to squash vs keep granular commits

11. **Test Debt Prevention**
    - Maximum 2-3 hours between implementation and tests
    - Never accumulate >800 lines without tests
    - Each subtask is commit-able with tests
    - Phase 3 restructure specifically prevents 5-10 hour test debt
    - Continuous coverage tracking

12. **Coverage Evolution**
    - Target after Phase 1: ~60-70% (foundation only)
    - Target after Phase 2: ~70-75% (QueryBuilder complete)
    - Target after Phase 3: ~75-80% (formats complete)
    - Target after Phase 4: >80% (comprehensive testing)
    - Incremental coverage tracking approach

13. **Implementation Guide Alignment**
    - Validation: Do Roadmap estimates match Implementation Guide?
    - Discrepancy resolution (if any)
    - Cross-reference table

14. **Actionable Workflow Guide**
    - Step-by-step guide for each phase
    - Checklist for each task
    - When to write tests
    - What to test
    - How to commit
    - How to validate completeness before moving to next task

### Success Criteria

✅ Complete task-by-task test specifications for all 34 tasks  
✅ Test accumulation timeline with all 31 checkpoints  
✅ Clear definition of "test immediately" per task type  
✅ Test organization strategy for incremental development  
✅ Commit strategy with concrete recommendations  
✅ Test debt prevention validated (max 2-3 hrs, max 800 lines)  
✅ Coverage evolution targets per phase  
✅ Alignment with Implementation Guide validated  
✅ Actionable workflow guide ready for implementation  

### Validation

- All 34 tasks have test specifications
- Test estimates align with Implementation Guide
- Incremental pattern prevents test debt
- Organization strategy is practical for 9 resource types + 15 parser subtasks
- Commit strategy is Git-friendly
- Workflow guide is implementation-ready

---

## Cross-References

**Builds On:**
- Section 4: Implementation Guide Testing Requirements (validates alignment)

**Informs:**
- All subsequent sections (defines when to apply their patterns)
- Section 12: QueryBuilder Testing Strategy (Phase 2 workflow)
- Section 14: Integration Test Workflow Design (Phase 4 Task 2)
- Section 19: Test Organization (file structure evolution)

---

## Next Steps After Completion

1. Use workflow guide during implementation
2. Track actual test lines vs estimates during development
3. Adjust estimates if reality differs
4. Use as template for commit messages
5. Reference for all "when to test" questions

---

## Risks and Mitigation

**Risk:** Incremental testing may slow development velocity  
**Mitigation:** Document efficiency gains from preventing test debt; validate pattern worked in Phases 1-3 restructuring

**Risk:** Test organization may become unwieldy with 9 resource types  
**Mitigation:** Define clear organization strategy upfront; use consistent patterns

**Risk:** Commit strategy may conflict with PR review preferences  
**Mitigation:** Document flexibility; allow squashing later if needed

---

## Research Status

- [ ] Phase 1: Roadmap Deep Dive (20-30 min)
- [ ] Phase 2: Cross-Reference Analysis (20-30 min)
- [ ] Phase 3: Documentation (15-20 min)
- [ ] Deliverable Complete and Reviewed

**Total Estimated Time:** 1 hour  
**Actual Time:** _[To be filled during research]_  
**Started:** _[Date]_  
**Completed:** _[Date]_
