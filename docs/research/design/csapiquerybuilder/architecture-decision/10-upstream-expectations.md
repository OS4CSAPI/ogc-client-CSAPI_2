# 10: Upstream Library Expectations

**Research Question:** What does camptocamp/ogc-client expect from new API implementations, and does it favor single-class patterns?

**Source Document:** [docs/research/requirements/upstream-expectations.md](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/requirements/upstream-expectations.md)

**Decision Relevance:** CRITICAL - Upstream expectations directly determine what will be accepted.

---

## Research Objectives

1. **Expectation Analysis:**
   - What patterns do WFS, WMS, WMTS, EDR follow?
   - Are these patterns mandated or suggested?
   - What breaks acceptance criteria?

2. **API Design Expectations:**
   - Endpoint-oriented API structure
   - QueryBuilder vs client vs navigator terminology
   - Integration point requirements

3. **Flexibility Assessment:**
   - Where is innovation acceptable?
   - What must match existing patterns exactly?
   - What variations have been accepted?

---

## Key Questions to Answer

- [ ] Do all accepted implementations use single QueryBuilder class?
- [ ] Is endpoint-oriented API mandatory?
- [ ] What is the factory method signature requirement?
- [ ] Are helper classes allowed alongside QueryBuilder?
- [ ] What organizational flexibility exists?
- [ ] Have any multi-class implementations been accepted?
- [ ] What are explicit vs implicit expectations?

---

## Expected Findings

**If single-class is mandatory:**
- Clear requirement for CSAPIQueryBuilder consolidation
- No room for separate-client pattern
- Must follow EDR example

**If flexibility exists:**
- May accommodate separate classes
- Could use facade pattern
- More architectural options

---

## Architecture Decision Impact

**CRITICAL IMPACT** - Defines what will be accepted vs rejected by upstream.

---

## Synthesis Notes

Record key findings here for final synthesis document:

- Mandatory patterns: [List]
- Flexible areas: [List]
- Single vs multi-class: [Requirement or preference]
- Acceptance criteria: [Summary]
- Risk assessment: [Analysis]
