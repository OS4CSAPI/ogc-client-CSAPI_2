# Research Plan A1: Test Research ↔ Implementation Guide Alignment

**Date:** February 13, 2026  
**Phase:** Pre-Implementation Alignment  
**Step:** A1 of 5  
**Status:** Not Started

---

## Objective

Systematically cross-reference the 38-document test research corpus (plus 13 review files) against the CSAPI Implementation Guide (v7.0, 4,207 lines) to verify that every implementation component has complete, consistent, and actionable test coverage — and that the test research does not specify tests for components that don't exist in the implementation guide.

**Core Question:** Does the test research corpus accurately and completely cover what the implementation guide specifies, with no gaps, no orphans, and no contradictions?

---

## Anchor Document

**CSAPI Implementation Guide** (`docs/planning/csapi-implementation-guide.md`, v7.0)

This is the anchor because it defines *what will be built*. The test research must cover everything the guide specifies, and nothing it doesn't.

---

## Cross-Reference Document(s)

**Test Research Corpus** — 38 findings documents + 13 review files in `docs/research/testing/`

Key documents by implementation guide section:

| Implementation Guide Section | Primary Test Research Docs |
|------------------------------|---------------------------|
| §5: Service Discovery (Conformance, Collections, Endpoint) | Docs 04, 05, 22 |
| §6: QueryBuilder (all 9 resource types, 70-80 methods) | Docs 08, 12, 13, 23-29 |
| §6: Resource Validation Strategy | Docs 12, 18, 34 |
| §6: Helper Methods | Docs 12, 34 |
| §6: Navigation Patterns | Docs 26 |
| §6: Type System Architecture | Docs 21 |
| §6: Query Parameters | Docs 24, 28, 29 |
| §7: Format Handlers (GeoJSON, SensorML, SWE Common) | Docs 09, 10, 11, 25 |
| §7: Format Detector, Validator | Docs 22, 25 |
| §8: Worker Components | Doc 16 |
| §9: Testing Components | Docs 17, 19, 20 |
| §11: Developer Experience / Error Handling | Docs 06, 18 |
| §12: Usage Scenarios | Docs 07, 14 |
| Cross-cutting: Fixtures | Docs 15, 15P2 |
| Cross-cutting: Quality | Docs 03, 06, 35, 36 |
| Cross-cutting: Playbook | Doc 38 |

---

## Research Methodology

### Check 1: Component Coverage (Implementation Guide → Test Research)

**Question:** Does every component in the implementation guide have corresponding test specifications in the research?

**Procedure:**
1. Extract every distinct component from the implementation guide (12 components across §5-§8)
2. For each component, identify which test research document(s) cover it
3. Rate coverage: **Complete** (test scenarios defined for all public methods/behaviors), **Partial** (some methods/behaviors missing), **Missing** (no test coverage defined)
4. For partial/missing, document specifically what's missing

**Components to check (12):**

| # | Component | Impl Guide Section | Expected Test Docs |
|---|-----------|-------------------|--------------------|
| 1 | Conformance Reader (extensions) | §5, lines 303-330 | Doc 22 |
| 2 | Collections Reader (extensions) | §5, lines 331-352 | Doc 22 |
| 3 | OgcApiEndpoint Integration | §5, lines 353-478 | Docs 04, 05, 14 |
| 4 | CSAPIQueryBuilder (all 9 resource types) | §6, lines 481-1715 | Docs 08, 12, 13, 23-29 |
| 5 | Helper Methods | §6, lines 603-712 | Docs 12, 34 |
| 6 | Type System (model.ts) | §6, lines 1960-2248 | Doc 21 |
| 7 | GeoJSON Handler (extensions) | §7, lines 2682-2710 | Doc 11 |
| 8 | SensorML Handler (new parser) | §7, lines 2711-2761 | Doc 09 |
| 9 | SWE Common Handler (new parser) | §7, lines 2762-2844 | Doc 10 |
| 10 | Format Detector (extensions) | §7, lines 2845-2874 | Docs 22, 25 |
| 11 | Validator (extensions) | §7, lines 2875-2926 | Doc 22 |
| 12 | Worker Extensions | §8, lines 2929-2982 | Doc 16 |

**Deliverable:** Coverage matrix showing Complete/Partial/Missing per component with gap details.

---

### Check 2: Method-Level Coverage (QueryBuilder Deep Dive)

**Question:** Does the test research define test scenarios for all ~70-80 QueryBuilder methods across all 9 resource types?

**Procedure:**
1. Extract every method signature from the implementation guide §6 (Systems through Commands, lines 1193-1715)
2. Cross-reference against Doc 12 (QueryBuilder Testing Strategy) method inventory
3. Cross-reference against Docs 23-29 (parameter-specific strategies) for parameter coverage
4. Identify any methods with no defined test scenarios

**Resource types to check (9):**

| Resource Type | Impl Guide Section | Methods | Test Doc |
|---------------|-------------------|---------|----------|
| Systems | §6, lines 1193-1240 | ~12 | Doc 12 §5 |
| Deployments | §6, lines 1241-1285 | ~8 | Doc 12 §6 |
| Procedures | §6, lines 1286-1334 | ~8 | Doc 12 §7 |
| Sampling Features | §6, lines 1335-1385 | ~8 | Doc 12 §8 |
| Properties | §6, lines 1386-1422 | ~6 | Doc 12 §9 |
| DataStreams | §6, lines 1423-1487 | ~11 | Doc 12 §10 |
| Observations | §6, lines 1488-1569 | ~9 | Doc 12 §11 |
| Control Streams | §6, lines 1570-1629 | ~8 | Doc 12 §12 |
| Commands | §6, lines 1630-1715 | ~10 | Doc 12 §13 |

**Deliverable:** Method-by-method matrix showing which have test scenarios defined and which don't.

---

### Check 3: Estimate Consistency

**Question:** Do the test research estimates align with the implementation guide's stated test volume?

**Procedure:**
1. Extract implementation guide test estimates (§9, §13):
   - Total test lines: ~4,500-6,000
   - Total test files: 17
2. Extract Doc 19 (authoritative file inventory) estimates:
   - Total test lines: ~4,040-5,340 across 22 files
3. Extract Doc 20 (test-to-code ratio) estimates
4. Compare all three sources for consistency
5. Identify any significant discrepancies (>20% variance)

**Key numbers to reconcile:**

| Source | Test Files | Test Lines | Impl Lines |
|--------|-----------|------------|------------|
| Implementation Guide §13 | 17 | ~4,500-6,000 | ~4,614-6,094 |
| Doc 19 (file inventory) | 22 | ~4,040-5,340 | — |
| Doc 20 (ratio validation) | — | — | — |
| ROADMAP v3.0 summary | 17 | ~4,400-6,300 | ~4,850-6,500 |
| Doc 17 §2.1 (component matrix) | — | ~13,090-17,016 | — |

Note: Doc 17's inflated estimates were already flagged (H1 review fix with discrepancy note). Verify that this is the only source of inflation.

**Deliverable:** Estimate reconciliation table with authoritative numbers identified.

---

### Check 4: Orphan Detection (Test Research → Implementation Guide)

**Question:** Does the test research define test specifications for anything that doesn't exist in the implementation guide?

**Procedure:**
1. Scan each test research document's scope/purpose statement
2. Verify the tested component exists in the implementation guide
3. Check for test specifications that reference non-existent methods, types, or behaviors
4. Check for test research that goes beyond the implementation guide's scope (e.g., performance testing already flagged as out-of-scope)

**Known orphans to verify are properly flagged:**

| Test Doc | Potential Orphan | Expected Status |
|----------|-----------------|-----------------|
| Doc 32 | Real-world server compatibility testing | Flagged AP2, heavily bannered |
| Doc 33 | Performance testing | Flagged OUT OF SCOPE |
| Doc 16 | Binary SWE parsing (PARSE_SWE_BINARY) | Deferred per Phase 2E L1 |
| Doc 31 | Command lifecycle (Part 2 scope) | Phase 4 material, bannered |

**Deliverable:** Orphan list with disposition (properly flagged vs needs action).

---

### Check 5: Convention Alignment

**Question:** Do the test research's recommended patterns align with the implementation guide's development standards?

**Procedure:**
1. Extract implementation guide §16 (Development Standards) conventions
2. Cross-reference against test research patterns:
   - Mocking convention: `globalThis.fetch` (Docs 01, 02, 03, Phase 0 AP2)
   - File naming: `*.spec.ts` (Doc 19)
   - Import patterns: three-tier hierarchy (Docs 21, implementation guide §6)
   - JSDoc requirements: (Implementation guide §16, Doc 35)
   - Error handling patterns: (Implementation guide §11, Doc 18)
3. Identify any cases where test research recommends a pattern that contradicts the implementation guide

**Deliverable:** Convention alignment checklist (Aligned/Misaligned per convention).

---

### Check 6: Anti-Pattern Compliance Verification

**Question:** Are all flagged anti-pattern violations (AP1-AP5 from Phase 0) properly accounted for in both the test research AND the implementation guide?

**Procedure:**
1. Extract the 5 anti-patterns from Phase 0 report
2. Verify the implementation guide's development standards address each
3. Verify the test research's review notices cover all at-risk documents (16/16 confirmed in Phase 4, but verify against implementation guide expectations)
4. Check that the implementation guide doesn't inadvertently encourage any anti-patterns in its examples

**Deliverable:** Anti-pattern cross-reference matrix.

---

### Check 7: Fixture Alignment

**Question:** Does the test research's fixture specification match the implementation guide's fixture expectations?

**Procedure:**
1. Extract implementation guide's fixture references (§9)
2. Cross-reference against Doc 15 §5.2 (revised fixture structure)
3. Cross-reference against Doc 15 Part 2 (fixture documentation best practices)
4. Verify Doc 38's fixture structure matches both (already fixed in Phase 4, but verify completeness)
5. Count fixtures specified in test research vs fixtures expected by implementation guide

**Deliverable:** Fixture alignment summary.

---

## Execution Strategy

**Read order:**
1. Implementation guide §5-§8 (the components) — extract what needs testing
2. Implementation guide §9 (testing section) — extract stated test expectations
3. Implementation guide §13-§16 (estimates, standards) — extract constraints
4. Test research docs in component order (Docs 22, 12, 08-11, 16, etc.) — verify coverage
5. Doc 19 (file inventory) — verify structure alignment
6. Doc 34 (test utilities) — verify helper alignment
7. Phase 4 report — verify all prior findings still hold

**Estimated effort:** 3-4 hours

**Output:** Alignment report with severity-rated findings (Critical/High/Medium/Low), following the Phase 0-4 review framework format.

---

## Acceptance Criteria

The cross-reference is complete when:
- [ ] All 12 implementation components have verified test coverage (Check 1)
- [ ] All ~70-80 QueryBuilder methods have verified test scenarios (Check 2)
- [ ] Test estimates are reconciled to one authoritative number (Check 3)
- [ ] All orphan test specs are accounted for (Check 4)
- [ ] All conventions are aligned (Check 5)
- [ ] All anti-patterns are accounted for (Check 6)
- [ ] Fixture structure is aligned (Check 7)
- [ ] Report generated with severity-rated findings
- [ ] All Critical and High findings resolved
