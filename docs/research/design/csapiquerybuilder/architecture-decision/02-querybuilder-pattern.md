# 02: QueryBuilder Pattern Core Concepts

**Research Question:** What are the essential characteristics of the QueryBuilder pattern in ogc-client, and does it inherently require a single class?

**Source Document:** [docs/research/upstream/querybuilder-pattern-analysis.md](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/main/docs/research/upstream/querybuilder-pattern-analysis.md)

**Decision Relevance:** CRITICAL - Understanding the pattern fundamentals informs whether we must use single class or if multiple classes are pattern-compatible.

---

## Research Objectives

1. **Pattern Definition:**
   - What is a "QueryBuilder" in ogc-client terminology?
   - What responsibilities does a QueryBuilder have?
   - What distinguishes QueryBuilder from other patterns (navigator, client, handler)?

2. **Lifecycle Analysis:**
   - How is a QueryBuilder instantiated? (factory method)
   - What state does it maintain?
   - How is caching implemented?
   - When is a QueryBuilder instance destroyed?

3. **State Management:**
   - What metadata does QueryBuilder encapsulate from collection info?
   - Is state immutable or mutable?
   - How does it validate capabilities?

4. **Method Organization:**
   - Are there organizational requirements for methods?
   - Can methods be split across multiple classes?
   - How are related operations grouped?

---

## Key Questions to Answer

- [ ] What is the canonical definition of QueryBuilder pattern?
- [ ] Must a QueryBuilder be a single class or can it be multiple classes?
- [ ] What are the required responsibilities of a QueryBuilder?
- [ ] How does factory method + caching work?
- [ ] What metadata must be encapsulated?
- [ ] Are there examples of multi-class QueryBuilders in ogc-client?
- [ ] Does the pattern specify method organization?
- [ ] Can QueryBuilder delegate to helper classes?

---

## Expected Findings

**If pattern requires single class:**
- Clear mandate for CSAPIQueryBuilder as single class
- No flexibility for separate resource clients
- Must consolidate all 9 resources into one class

**If pattern allows multiple classes:**
- Could use separate classes per resource
- QueryBuilder could be a facade/coordinator
- More flexibility in organization

---

## Architecture Decision Impact

**HIGH IMPACT** - Determines whether pattern constraints force single-class approach or if we have flexibility.

---

## Synthesis Notes

Record key findings here for final synthesis document:

- Pattern definition: [Summary]
- Single vs multi-class: [Requirement]
- State management approach: [Description]
- Method organization rules: [Requirements]
- Flexibility assessment: [Analysis]
