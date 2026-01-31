# Design Strategy Research

**Purpose:** Define the correct architectural approach for implementing CSAPI client support in ogc-client.

**Context:** Multiple previous iterations. Need to get design right BEFORE implementation to avoid wasted effort and PR rejection.

**Priority:** This research MUST be completed before writing any implementation code.

---

## Critical Question

**"What architecture will the maintainers accept and merge?"**

Everything else is secondary. This research answers that question definitively.

---

## ✅ CRITICAL TERMINOLOGY QUESTION (RESOLVED)

**Issue:** We've been using the term "navigator" throughout documentation and previous implementations (e.g., `CSAPINavigator`, `endpoint.csapi()` returns a "navigator"). However, this term may not be consistent with upstream terminology.

**RESOLUTION (from PR #114 analysis):**

The object returned by `endpoint.edr()` is called **`EDRQueryBuilder`** (not "navigator").

**Answers:**
- [x] What does PR #114 call the object returned by `endpoint.edr()`? → **`EDRQueryBuilder`**
- [x] Is "navigator" the correct upstream term? → **No, "QueryBuilder" is the pattern**
- [x] What's the actual class name in PR #114? → **`EDRQueryBuilder`**
- [x] What terminology should CSAPI use? → **`CSAPIQueryBuilder`**

**Confirmed Pattern:**
```typescript
// EDR implementation:
endpoint.edr() → returns EDRQueryBuilder

// CSAPI should follow:
endpoint.csapi() → returns CSAPIQueryBuilder
```

**Impact:** 
- Previous "navigator" terminology was incorrect
- CSAPI implementation must use "QueryBuilder" pattern
- Minimal documentation updates needed (terminology wasn't widely used in committed docs yet)

**Source:** [docs/research/upstream/pr114-analysis.md](../upstream/pr114-analysis.md) Section 2

---

## ✅ CODE VOLUME CONCERN (RESOLVED)

**Issue:** Previous implementation was ~2x the size of entire upstream repo. This is a red flag for maintainers.

**RESOLUTION (from PR #114 analysis):**

**PR #114 Metrics:**
- **Total:** 2858 additions, 54 deletions
- **Implementation code:** ~750 lines (26%)
- **Test code:** ~2050 lines (72%)
- **Other:** ~58 lines (2%)
- **Files:** 18 total
- **Core modifications:** ~115 lines to existing files

**CSAPI Projection:**
- EDR has 5 query types, CSAPI has 9 resources
- Estimated **~3500 total lines** (~975 implementation, ~2450 tests, ~75 other)
- This is **~25% larger than EDR** (reasonable for 80% more resources)
- **NOT 2x the size of entire repo** - that was over-engineering in previous attempts

**Answers:**
- [x] How large is PR #114? → **2858 total lines, 750 implementation**
- [x] Typical size? → **~750 implementation per API family**
- [x] EDR resources vs CSAPI? → **5 query types vs 9 resources**
- [x] Code-per-resource ratio? → **~150 lines per resource for EDR**
- [x] Can we stay proportional? → **Yes, if we follow EDR patterns closely**

**Design Principle Confirmed:** Match PR #114's architecture exactly. Code volume will naturally align with upstream patterns.

**Source:** [docs/research/upstream/pr114-analysis.md](../upstream/pr114-analysis.md) Section 1

---

## Research Questions

### 1. ✅ PR #114 Architecture Deep Dive (COMPLETED)

**Source:** [PR #114 - EDR Implementation](https://github.com/camptocamp/ogc-client/pull/114)  
**Analysis:** [docs/research/upstream/pr114-analysis.md](../upstream/pr114-analysis.md)

**Answers:**
- [x] **PRIORITY: What is the object returned by endpoint.edr() actually called?** → **`EDRQueryBuilder`** (Analysis Section 2)
- [x] **PRIORITY: How many lines of code / files did PR #114 add?** → **2858 additions, 54 deletions, 18 files** (Section 1)
- [x] What files were added? → **18 files documented in complete structure** (Section 3.1)
- [x] Where were files placed? → **`src/ogc-api/edr/`** (Section 3.1)
- [x] What existing files were modified? → **endpoint.ts, info.ts, index.ts + 3 others, ~115 lines total** (Section 3.2)
- [x] How minimal were modifications to existing files? → **Very minimal: 6 files, ~115 lines to core** (Section 3.2)
- [x] What classes/interfaces were created? → **EDRQueryBuilder, 15+ TypeScript types** (Section 4)
- [x] How is the QueryBuilder pattern implemented? → **Fluent API with method chaining** (Section 5)
- [x] How is format negotiation handled? → **Accept header, format parameter, defaults to GeoJSON** (Section 6.2)
- [x] How are TypeScript types defined? → **Types in types.ts, detailed in Section 4** (Section 4)
- [x] How are query parameters modeled? → **Interfaces per query type + common params** (Section 5.1)
- [x] How is conformance checking done? → **info.ts conformance classes** (Section 6.4)
- [x] How are errors handled? → **HTTP errors, validation errors, network errors** (Section 6.5)
- [x] What's the separation of concerns between files? → **Clear separation documented** (Section 7)
- [x] How is caching implemented? → **Collection metadata cached** (Section 6.3)
- [x] What's exported from the module? → **EDRQueryBuilder + 3 types** (Section 8)

**Status:** Comprehensive 794-line analysis completed and documented.

---

### 2. ✅ Existing ogc-client Architecture Patterns (COMPLETED)

**Files studied:**
- `src/ogc-api/endpoint.ts` - Main endpoint class
- `src/ogc-api/info.ts` - Conformance and capability checking
- `src/index.ts` - Public API exports
- `src/ogc-api/edr/` - EDR implementation reference
- `src/shared/` - Shared utilities and models

**Analysis:** [docs/research/upstream/architecture-patterns-analysis.md](../upstream/architecture-patterns-analysis.md)

**Answers:**
- [x] What's the consistent pattern for adding new API support? → **5-step pattern: conformance check (info.ts) + capability getter (endpoint.ts) + collection filter + factory method + exports** (Analysis Section 2)
- [x] How do implementations extend OgcApiEndpoint? → **They DON'T - QueryBuilder pattern via composition, not inheritance** (Section 3)
- [x] How are collection-specific capabilities determined? → **Two-level: endpoint conformance + collection metadata via getCollectionInfo()** (Section 4)
- [x] How are shared types vs API-specific types organized? → **3-tier: shared/ → ogc-api/ → ogc-api/{api}/model.ts** (Section 5)
- [x] What's the pattern for adding methods to endpoint? → **Async factory methods with Map caching, conformance guards** (Section 6)
- [x] How is conformance class checking done consistently? → **Helper functions in info.ts checking conformance URIs** (Section 7)
- [x] What utilities exist that we should reuse? → **Link utils (getLinkUrl, fetchLink), url-utils (getChildPath), mime-type checking** (Section 8)
- [x] How are links handled? → **Follow links via link-utils, never construct URLs manually** (Section 9)
- [x] How is pagination handled across implementations? → **limit + offset query params via searchParams** (Section 10)
- [x] How are datetime/bbox parameters handled? → **Shared DateTimeParameter type, encoded to ISO 8601 ranges** (Section 11)

**Status:** Comprehensive 902-line architecture analysis completed. CSAPI implementation checklist documented in Section 12.

---

### 3. ✅ QueryBuilder Pattern Analysis (COMPLETED)

**Terminology confirmed: "QueryBuilder" (not "navigator")**

**Critical architectural decision: How does the QueryBuilder pattern work?**

**Analysis:** [docs/research/upstream/querybuilder-pattern-analysis.md](../upstream/querybuilder-pattern-analysis.md)

**Answers:**
- [x] **What is the correct terminology?** → **QueryBuilder (not "navigator" - that was invented term from previous attempt)** (Analysis Section 1)
- [x] What is a "QueryBuilder" in ogc-client context? → **Standalone class that encapsulates collection metadata and provides query methods** (Section 2)
- [x] What's the lifecycle of a QueryBuilder instance? → **4 phases: instantiation (via endpoint) → configuration (constructor) → usage (method calls) → reuse (caching)** (Section 3)
- [x] How is `endpoint.csapi(collectionId)` supposed to work? → **Check conformance → check cache → fetch collection info → instantiate QueryBuilder → cache → return** (Section 3.1)
- [x] What does a QueryBuilder expose? → **Public properties (capabilities, links) + query methods (build URL or execute query)** (Section 4)
- [x] How is per-collection state managed? → **Immutable state stored in QueryBuilder instance, set in constructor from OgcApiCollectionInfo** (Section 5)
- [x] How is caching implemented? → **Map<collection_id, QueryBuilder> in endpoint class, checked before instantiation** (Section 6)
- [x] What's the interface vs implementation separation? → **No formal interface - concrete class with public/private members** (Section 7)
- [x] How do QueryBuilders handle resource availability checking? → **Constructor validation + runtime checks + exposed capability properties** (Section 8)
- [x] How do QueryBuilders construct base URLs? → **From collection.links, never manual construction** (Section 9)
- [x] What's the pattern for URL builder methods? → **Validate capability → get URL from links → add params via searchParams → return string** (Section 10)

**Status:** Comprehensive 1135-line QueryBuilder analysis completed. CSAPI design documented in Section 11.

---

### 4. URL Building Architecture

**Core functionality: How should URL building be structured?**

**Questions to answer:**
- [ ] Should there be a base URL builder class?
- [ ] How are query parameters assembled?
- [ ] How is URL encoding handled?
- [ ] How are optional vs required parameters modeled?
- [ ] How are array parameters handled?
- [ ] How is the base path constructed?
- [ ] How are resource paths structured?
- [ ] Should there be URL builder utilities?
- [ ] How to avoid duplication across 9 resource types?
- [ ] What's the pattern for sub-resource URLs (e.g., /systems/{id}/datastreams)?

**Action:** Identify reusable URL building patterns

---

### 5. TypeScript Type System Design

**Questions to answer:**
- [ ] How should query parameter types be defined?
- [ ] Should each resource have its own query interface?
- [ ] How to model shared parameters (bbox, datetime, limit)?
- [ ] How to model resource-specific parameters?
- [ ] How to ensure type safety for URL builders?
- [ ] How to model CSAPI resources themselves?
- [ ] How granular should types be?
- [ ] Where should type definitions live?
- [ ] How to handle format-specific types (GeoJSON vs SensorML)?
- [ ] How to model optional properties?

**Action:** Study upstream TypeScript patterns

---

### 6. File Organization Strategy

**Questions to answer:**
- [ ] What files go in `src/ogc-api/csapi/`?
- [ ] Should there be subdirectories? (parsers/, validation/, models/?)
- [ ] How to organize 9 resource types?
- [ ] Should each resource be a separate file?
- [ ] Where do format utilities go?
- [ ] Where do validators/parsers go?
- [ ] How to organize test files?
- [ ] Where do fixtures go?
- [ ] What gets exported publicly vs kept internal?

**Constraint:** Must be organized for easy PR review

---

### 7. Integration with Existing Code

**Questions to answer:**
- [ ] Exactly what changes to `endpoint.ts`? (add csapi() method? what else?)
- [ ] Exactly what changes to `info.ts`? (add conformance checking? what else?)
- [ ] Exactly what changes to `index.ts`? (export what exactly?)
- [ ] What shared models can/should be reused?
- [ ] What shared utilities can be reused?
- [ ] How to avoid touching unnecessary files?
- [ ] How to minimize diff size?

**Principle:** Additive only, minimal modifications

---

### 8. Format Negotiation Architecture

**Questions to answer:**
- [ ] Where does format negotiation logic live?
- [ ] How are Accept headers set?
- [ ] How is Content-Type detected?
- [ ] How are format-specific URLs built?
- [ ] Should there be a format utility module?
- [ ] How to model format enum/constants?
- [ ] How do parsers/validators fit in?

---

### 9. Error Handling Design

**Questions to answer:**
- [ ] What errors should the library throw?
- [ ] What errors should be left to user?
- [ ] How to handle invalid parameters?
- [ ] How to handle non-CSAPI endpoints?
- [ ] How to handle missing resources?
- [ ] What's the error handling pattern upstream?
- [ ] Should there be custom error classes?

---

### 10. CSAPI-Specific Architectural Decisions

**Questions to answer:**
- [ ] How to handle 9 different resource types cleanly?
- [ ] Should resources share base implementation?
- [ ] How to model Part 1 vs Part 2 resources?
- [ ] How to handle sub-resources (systems/{id}/datastreams)?
- [ ] How to model observation/command schemas?
- [ ] How to handle SWE Common data components?
- [ ] How to handle SensorML structures?
- [ ] Should there be resource-specific navigators?
- [ ] How to check resource availability per collection?

---

### 11. Code Reuse vs Duplication

**Questions to answer:**
- [ ] When to reuse upstream utilities vs duplicate?
- [ ] What shared models exist for bbox, datetime, pagination?
- [ ] Should we create abstraction base classes?
- [ ] When to copy-paste vs import?
- [ ] How much duplication is acceptable to maintain isolation?

**Principle:** Prefer duplication over coupling (per governance constraints)

---

### 12. Lessons from Previous Iterations

**From [ogc-client-CSAPI](https://github.com/OS4CSAPI/ogc-client-CSAPI):**
- [ ] What architectural decisions worked well?
- [ ] What was over-engineered?
- [ ] What was under-engineered?
- [ ] What caused maintenance problems?
- [ ] What made testing difficult?
- [ ] What would maintainers likely reject?
- [ ] What feedback did we get (if any)?

**Action:** Review second iteration's architecture and identify improvements

---

## Research Deliverables

### Phase 1: Pattern Discovery (Do these first)
1. **PR #114 Architecture Document** - Complete file-by-file breakdown
2. **Upstream Pattern Catalog** - Common patterns across WFS/STAC/EDR
3. **Navigator Pattern Specification** - Exact pattern to follow

### Phase 2: Design Decisions
4. **File Organization Plan** - Exact file structure for CSAPI
5. **Type System Design** - Complete TypeScript interface definitions
6. **Integration Point Specification** - Exact changes to endpoint.ts, info.ts, index.ts

### Phase 3: Implementation Blueprint
7. **Architecture Diagram** - Visual representation of module structure
8. **Class/Interface Reference** - What needs to be created
9. **Implementation Checklist** - Step-by-step build order

---

## Success Criteria

Research is complete when we can answer:
1. ✅ "What exact files do we need to create?"
2. ✅ "What exact changes do we make to existing files?"
3. ✅ "How do we structure the navigator class?"
4. ✅ "How do we organize 9 resource types?"
5. ✅ "What TypeScript interfaces do we need?"
6. ✅ "Does this match upstream patterns exactly?"

---

## Critical Constraints (From Governance)

**Must follow these when designing:**
- ✅ Additive only - minimize modifications to existing files
- ✅ No refactoring of upstream code
- ✅ Follow existing patterns exactly
- ✅ Isolated to `src/ogc-api/csapi/` directory
- ✅ Prefer duplication over shared abstractions
- ✅ Match PR #114 architectural style

---

## Next Steps

1. **START HERE:** Deep dive into PR #114 code structure
2. Document findings as we discover them
3. Create detailed architecture specification
4. Update FEATURE_SPEC.md Section 3 (Technical Design) with findings
5. Get your approval before writing any implementation code

---

## Investigation Priority Order

**Week 1: Foundation (CRITICAL)**
1. **FIRST:** Resolve terminology question - what is the correct term for the object returned by endpoint methods?
2. PR #114 complete file-by-file analysis
3. Existing endpoint.ts patterns
4. [CORRECT_TERM] pattern deep dive

**Week 2: Details**
4. URL building patterns
5. Type system design
6. File organization

**Week 3: Integration**
7. Integration points specification
8. Format negotiation architecture
9. Final architecture document

---

## Notes & Findings

_(Add research findings here as we investigate)_

### PR #114 Analysis
- [ ] TODO: Pull PR and analyze

### Upstream Patterns
- [ ] TODO: Study existing implementations

### Key Architectural Decisions
- [ ] TODO: Document decisions as they're made

