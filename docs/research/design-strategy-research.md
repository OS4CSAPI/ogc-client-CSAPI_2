# Design Strategy Research

**Purpose:** Define the correct architectural approach for implementing CSAPI client support in ogc-client.

**Context:** Multiple previous iterations. Need to get design right BEFORE implementation to avoid wasted effort and PR rejection.

**Priority:** This research MUST be completed before writing any implementation code.

---

## Critical Question

**"What architecture will the maintainers accept and merge?"**

Everything else is secondary. This research answers that question definitively.

---

## ⚠️ CRITICAL TERMINOLOGY QUESTION (MUST RESOLVE FIRST)

**Issue:** We've been using the term "navigator" throughout documentation and previous implementations (e.g., `CSAPINavigator`, `endpoint.csapi()` returns a "navigator"). However, this term may not be consistent with upstream terminology.

**Risk:** 
- Using wrong terminology makes PR harder to review
- Naming inconsistency with upstream patterns
- Documentation uses incorrect concepts
- Potential large refactor if wrong

**MUST ANSWER BEFORE PROCEEDING:**
- [ ] What does PR #114 call the object returned by `endpoint.edr()`?
- [ ] Is "navigator" the correct upstream term?
- [ ] What's the actual class name in PR #114? (EDRNavigator? EDRClient? EDREndpoint? Something else?)
- [ ] What terminology is used in WFS/STAC implementations?
- [ ] Should we be calling it "client", "accessor", "resource", or something else?

**Action:** Check PR #114 and existing implementations IMMEDIATELY to determine correct terminology. Update all documentation accordingly before writing any code.

**If "navigator" is wrong:** We need to update:
- FEATURE_SPEC.md Section 2.2 (uses "navigator" extensively)
- design-strategy-research.md (uses "navigator" throughout)
- testing-strategy-research.md
- Any other planning docs

---

## ⚠️ CODE VOLUME CONCERN (MUST ADDRESS)

**Issue:** Previous implementation was ~2x the size of entire upstream repo. This is a red flag for maintainers.

**Risk:**
- Contribution appears over-engineered
- Review burden too high
- Reduces acceptance likelihood
- Creates maintenance concerns

**MUST INVESTIGATE:**
- [ ] How large is PR #114? (lines of code, files added)
- [ ] What's the typical size of an OGC API implementation in upstream?
- [ ] How many resources does EDR have vs CSAPI's 9?
- [ ] What's the code-per-resource ratio in EDR?
- [ ] How much was test code vs implementation code in our second iteration?
- [ ] Can we eliminate bloat before reaching 2x upstream size?

**Design Principle:** Every line of code must justify its existence. If we can't explain why CSAPI needs more code than EDR proportionally, it's probably over-engineered.

**Action:** Add code volume analysis to research. Compare CSAPI needs to EDR implementation on per-resource basis. Plan for lean implementation.

---

## Research Questions

### 1. PR #114 Architecture Deep Dive (PRIMARY REFERENCE)

**Source:** [PR #114 - EDR Implementation](https://github.com/camptocamp/ogc-client/pull/114)

**Questions to answer:**
- [ ] **PRIORITY: What is the object returned by endpoint.edr() actually called?** (Class name? Type name?)
- [ ] **PRIORITY: How many lines of code / files did PR #114 add?** (Need baseline for comparison)
- [ ] What files were added? (list complete file structure)
- [ ] Where were files placed? (`src/ogc-api/edr/` ?)
- [ ] What existing files were modified? (endpoint.ts, info.ts, index.ts?)
- [ ] How minimal were modifications to existing files?
- [ ] What classes/interfaces were created?
- [ ] How is the navigator pattern implemented?
- [ ] How is format negotiation handled?
- [ ] How are TypeScript types defined?
- [ ] How are query parameters modeled?
- [ ] How is conformance checking done?
- [ ] How are errors handled?
- [ ] What's the separation of concerns between files?
- [ ] How is caching implemented?
- [ ] What's exported from the module?

**Action:** Download PR #114 diff and analyze file-by-file

---

### 2. Existing ogc-client Architecture Patterns

**Files to study:**
- `src/ogc-api/endpoint.ts` - Main endpoint class
- `src/ogc-api/info.ts` - Conformance and capability checking
- `src/index.ts` - Public API exports
- `src/ogc-api/wfs/` - WFS implementation
- `src/ogc-api/stac/` - STAC implementation
- `src/shared/` - Shared utilities and models

**Questions to answer:**
- [ ] What's the consistent pattern for adding new API support?
- [ ] How do implementations extend OgcApiEndpoint?
- [ ] How are collection-specific capabilities determined?
- [ ] How are shared types vs API-specific types organized?
- [ ] What's the pattern for adding methods to endpoint?
- [ ] How is conformance class checking done consistently?
- [ ] What utilities exist that we should reuse?
- [ ] How are links handled?
- [ ] How is pagination handled across implementations?
- [ ] How are datetime/bbox parameters handled?

**Action:** Read existing implementations to understand patterns

---

### 3. Navigator Pattern Analysis

**⚠️ NOTE: "Navigator" may not be the correct term - verify with PR #114 first!**

**Critical architectural decision: How does the [CORRECT_TERM] pattern work?**

**Questions to answer:**
- [ ] **What is the correct terminology?** (navigator? client? accessor? endpoint?)
- [ ] What is a "[TERM]" in ogc-client context?
- [ ] What's the lifecycle of a navigator instance?
- [ ] How is `endpoint.csapi(collectionId)` supposed to work?
- [ ] What does a navigator expose? (methods, properties?)
- [ ] How is per-collection state managed?
- [ ] How is caching implemented?
- [ ] What's the interface vs implementation separation?
- [ ] How do navigators handle resource availability checking?
- [ ] How do navigators construct base URLs?
- [ ] What's the pattern for URL builder methods?

**Action:** Study existing navigator implementations in detail

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

