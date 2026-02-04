# CSAPIQueryBuilder Architecture Decision - Part 1: Structural Design

**Status:** ✅ DECIDED (2026-02-04)  
**Decision Type:** Structural Architecture  
**Authority:** Research Plans 01-04, 10 + User Mandate

---

## Executive Summary

**DECISION: Single CSAPIQueryBuilder class following EDR pattern with full format handling.**

- ✅ Single builder class (not separate Part 1/Part 2)
- ✅ ~70-80 public methods organized by resource type
- ✅ Helper methods for code reuse (no inheritance)
- ✅ Full format parsing for GeoJSON, SensorML 3.0, SWE Common 3.0
- ✅ Format parsers in separate formats/ subfolder
- ✅ Resource discovery via links (no validation in methods)

**Status:** Structural decisions complete. Implementation details require Plans 11-16.

---

## Part 1 vs Part 2 Scope

### Part 1 Decisions (THIS DOCUMENT - COMPLETE)

**Questions Answered:**
- ✅ Should we have one builder or split Part 1/Part 2?
- ✅ Should we use inheritance or helper methods?
- ✅ Should we parse formats or URL-only?
- ✅ How many methods total?
- ✅ How to organize resources?
- ✅ How to discover available resources?

**Research Basis:**
- Plan 01: PR#114 EDR Pattern (template)
- Plan 02: QueryBuilder Pattern (upstream consistency)
- Plan 03: CSAPI Architecture Decisions (9 resources, format handling)
- Plan 04: Architecture Patterns (100% single-class pattern)
- Plan 10: Upstream Expectations (governance principles)

### Part 2 Decisions (PENDING - Plans 11-16)

**Questions Remaining:**
- 📋 How to integrate with endpoint.ts? (Plan 11)
- 📋 Exact file structure for 10,000+ lines? (Plan 12)
- 📋 How to define SensorML/SWE types? (Plan 13)
- 📋 What are the usage patterns? (Plan 14)
- 📋 How to handle query parameters? (Plan 15)
- 📋 How to navigate sub-resources? (Plan 16)

**Why Separate:**
We know **WHAT to build** (structure) but need **HOW to build it** (implementation patterns).

---

## Decision 1: Single Builder Class

### The Question

Should CSAPI have one builder or split Part 1 (feature resources) and Part 2 (dynamic data)?

### Research Evidence

**From Plan 04 (Architecture Patterns):**
- 100% of ogc-client APIs use single builder class
- EDR: 1 builder for 1 resource type
- WFS: 1 builder for 1 resource type
- STAC: 1 builder for 2 resource types
- **Pattern: Always single builder, regardless of complexity**

**From Plan 02 (QueryBuilder Pattern):**
- Upstream convention: One entry point per API
- Users expect `endpoint.csapi()` to return single object
- Cache management simpler with single class

**From Plan 03 (CSAPI Architecture):**
- 9 resources share common patterns (CRUD, history, schema)
- Part 1 and Part 2 are logically one API (just different purposes)
- Class size manageable with clear organization

### Decision

**✅ Single CSAPIQueryBuilder class**

```typescript
export default class CSAPIQueryBuilder {
  // ========================================
  // PART 1: FEATURE RESOURCES
  // ========================================
  
  // Systems (12 methods)
  async getSystems(options?: QueryOptions): Promise<string>
  async getSystem(systemId: string): Promise<string>
  async getSystemHistory(systemId: string, options?: HistoryOptions): Promise<string>
  // ... 9 more system methods
  
  // Deployments (8 methods)
  // Procedures (8 methods)
  // Sampling Features (8 methods)
  // Properties (6 methods)
  
  // ========================================
  // PART 2: DYNAMIC DATA
  // ========================================
  
  // Datastreams (11 methods)
  // Observations (9 methods)
  // Control Streams (8 methods)
  // Commands (10 methods)
}
```

**Total:** ~70-80 public methods in single class

### Rationale

**Pros:**
- ✅ Matches EDR pattern (single builder)
- ✅ Follows upstream convention (100% consistency)
- ✅ Single entry point for users
- ✅ Shared cache and base URL
- ✅ Clear organization via comment sections

**Cons Considered:**
- Large class (~500-700 lines) - **Mitigated:** Similar to EDR, organized by sections
- Mixed concerns (metadata + data) - **Mitigated:** CSAPI is logically one API

**Confidence:** ⭐⭐⭐⭐⭐ (5/5) - Zero ambiguity from research

---

## Decision 2: Helper Methods, Not Inheritance

### The Question

Should we use abstract base classes for code reuse or helper methods?

### Research Evidence

**From Plan 04 (Architecture Patterns):**
- **0 occurrences** of inheritance in ogc-client
- **0 abstract base classes** for resource navigation
- **100%** use private helper methods for code reuse
- EDR uses helper functions for link extraction, URL building

**From Plan 02 (QueryBuilder Pattern):**
- Explicit method implementations preferred
- All methods visible in single class
- Helper methods reduce duplication without inheritance

### Decision

**✅ Private helper methods with explicit public methods**

```typescript
export default class CSAPIQueryBuilder {
  // ========================================
  // PRIVATE HELPERS
  // ========================================
  
  private buildResourceUrl(
    resourceType: string,
    id?: string,
    subPath?: string,
    options?: QueryOptions
  ): string {
    let url = `${this.baseUrl}/${resourceType}`;
    if (id) url += `/${id}`;
    if (subPath) url += `/${subPath}`;
    return url + this.buildQueryString(options);
  }
  
  private buildQueryString(options?: QueryOptions): string {
    // Implementation
  }
  
  private extractAvailableResources(): Set<string> {
    // Implementation
  }
  
  // ========================================
  // PUBLIC METHODS (70-80 methods)
  // ========================================
  
  async getSystems(options?: QueryOptions): Promise<string> {
    return this.buildResourceUrl('systems', undefined, undefined, options);
  }
  
  async getSystem(systemId: string): Promise<string> {
    return this.buildResourceUrl('systems', systemId);
  }
  
  // ... explicit methods for all resources
}
```

**Helper count:** 2-3 private methods

### Rationale

**Pros:**
- ✅ Matches EDR pattern (no inheritance)
- ✅ Follows upstream convention (100% consistency)
- ✅ All methods visible in one place
- ✅ Easy to understand and navigate
- ✅ Reduces duplication (~60% reuse via helpers)

**Cons Considered:**
- Some method signature repetition - **Acceptable:** Clarity over cleverness

**Confidence:** ⭐⭐⭐⭐⭐ (5/5) - Zero inheritance precedent in codebase

---

## Decision 3: Full Format Handling

### The Question

Should the library parse GeoJSON, SensorML, and SWE Common formats?

### Research Evolution

**Original Research (Plan 03, 2026-01-30):**
- Found: All upstream implementations (WFS, EDR, STAC) skip format parsing
- Recommendation: No format parsing, URL building only
- Code volume savings: ~2,000-4,000 lines

**User Mandate (2026-02-04):**
- ✅ **FULL format handling REQUIRED**
- ✅ GeoJSON, SensorML 3.0, SWE Common 3.0
- ✅ Version-specific: 3.0 ONLY (not older versions)

### Decision

**✅ Full format parsing in separate formats/ subfolder**

```
src/ogc-api/csapi/
├── url_builder.ts              (~500-700 lines) - QueryBuilder
├── model.ts                    (~200-300 lines) - CSAPI types
├── helpers.ts                  (~50-100 lines)  - URL helpers
├── formats/                    (~3,300-4,650 lines) - Parsers
│   ├── geojson.ts              (~50-100 lines)
│   ├── constants.ts            (~50-100 lines)
│   ├── sensorml/               (~1,600-2,200 lines)
│   │   ├── types.ts            (~400-600 lines)
│   │   ├── parser.ts           (~600-800 lines)
│   │   ├── simple-process.ts   (~150-200 lines)
│   │   ├── aggregate-process.ts(~200-250 lines)
│   │   └── physical-system.ts  (~200-250 lines)
│   └── swecommon/              (~1,600-2,250 lines)
│       ├── types.ts            (~400-600 lines)
│       ├── parser.ts           (~500-700 lines)
│       ├── data-record.ts      (~150-200 lines)
│       ├── data-array.ts       (~200-250 lines)
│       └── components.ts       (~300-400 lines)
```

**Separation of Concerns:**
- CSAPIQueryBuilder = URL building ONLY
- Format parsers = Separate imports
- Users choose when to parse

**Usage Pattern:**
```typescript
import { CSAPIQueryBuilder } from 'ogc-client';
import { parseSensorML30 } from 'ogc-client/csapi/formats';

const builder = await endpoint.csapi('sensors');
const smlUrl = await builder.getSystem('sys-123', { f: 'sml' });
const response = await fetch(smlUrl);
const system = parseSensorML30(await response.text());
```

### Rationale

**Why Full Format Handling:**
1. **CSAPI-Specific Complexity:** SensorML/SWE are core to CSAPI (unlike optional formats)
2. **User Experience:** Manual parsing creates significant friction
3. **Type Safety:** TypeScript interfaces provide strong typing
4. **Ecosystem Gap:** No mature TypeScript libraries for SensorML 3.0 / SWE Common 3.0
5. **Differentiation:** Complete CSAPI client library vs simple URL builder

**Why Separate Subfolder:**
1. **Clean Separation:** URL building vs parsing are distinct concerns
2. **Tree-Shaking:** Users can exclude parsers if not needed
3. **Maintainability:** Format changes isolated from QueryBuilder
4. **Clear Imports:** Explicit `import { parser } from 'formats'`

**Confidence:** ⭐⭐⭐⭐ (4/5) - User mandate (firm), implementation details pending

---

## Decision 4: Resource Discovery Without Validation

### The Question

Should methods validate that a resource is available before building URLs?

### Research Evidence

**From Plan 10 (Upstream Expectations):**
- Principle: "Minimal validation" - trust TypeScript + server
- Server validates via HTTP 404 if resource unavailable
- No validation in EDR methods

**From Plan 03 (CSAPI Architecture):**
- Collection links indicate available resources
- Not all endpoints support all 9 resources

### Decision

**✅ Expose availability, don't validate in methods**

```typescript
export default class CSAPIQueryBuilder {
  // Public property for users to check
  public readonly availableResources: Set<string>;
  
  constructor(private collection_: OgcApiCollectionInfo) {
    this.availableResources = this.extractAvailableResources();
  }
  
  // NO validation in methods
  async getSystems(options?: QueryOptions): Promise<string> {
    return this.buildResourceUrl('systems', undefined, undefined, options);
  }
}

// User code
const builder = await endpoint.csapi('sensors');

// User checks availability
if (builder.availableResources.has('systems')) {
  const url = await builder.getSystems();
  const response = await fetch(url);
  if (response.ok) {
    const systems = await response.json();
  }
}
```

### Rationale

**Pros:**
- ✅ Follows "minimal validation" principle
- ✅ Matches EDR pattern (no validation)
- ✅ Server validates via HTTP 404
- ✅ Less code (~0 lines vs ~70-80 lines of checks)
- ✅ User has visibility into capabilities

**Cons Considered:**
- Methods may generate invalid URLs - **Acceptable:** Server will 404

**Confidence:** ⭐⭐⭐⭐ (4/5) - Consistent with upstream, but could add validation later

---

## Decision 5: Integration Pattern

### The Question

How does CSAPIQueryBuilder integrate with OgcApiEndpoint?

### Research Evidence

**From Plan 01 (EDR Pattern):**
```typescript
// In endpoint.ts
private collection_id_to_edr_builder_ = new Map<string, EDRQueryBuilder>();

async edr(collection_id: string): Promise<EDRQueryBuilder> {
  // Cache lookup
  // Fetch collection
  // Create builder
  return builder;
}
```

**From Plan 02 (QueryBuilder Pattern):**
- Factory method per API type
- Collection-based builders
- Map-based caching

### Decision

**✅ Follow EDR integration pattern exactly**

```typescript
// In src/ogc-api/endpoint.ts (~30 lines added)
import CSAPIQueryBuilder from './csapi/url_builder.js';

export default class OgcApiEndpoint {
  private collection_id_to_csapi_builder_ = new Map<string, CSAPIQueryBuilder>();
  
  get hasConnectedSystems(): Promise<boolean> {
    return this.featureCheckFactory_(checkHasConnectedSystems);
  }
  
  async csapi(collection_id: string): Promise<CSAPIQueryBuilder> {
    if (!await this.hasConnectedSystems) {
      throw new EndpointError('Endpoint does not support Connected Systems API');
    }
    const cache = this.collection_id_to_csapi_builder_;
    if (cache.has(collection_id)) {
      return cache.get(collection_id)!;
    }
    const collection = await this.getCollectionInfo(collection_id);
    const builder = new CSAPIQueryBuilder(collection);
    cache.set(collection_id, builder);
    return builder;
  }
}
```

**Conformance checking:**
```typescript
// In src/ogc-api/shared/info.ts (~15 lines added)
export function checkHasConnectedSystems([conformance]: [
  OgcApiConformance
]): boolean {
  return conformance.conformsTo.includes(
    'http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/core'
  );
}
```

### Rationale

**Pros:**
- ✅ Identical to EDR pattern
- ✅ Minimal code addition (~45 lines total)
- ✅ Collection-based caching
- ✅ Conformance checking

**Confidence:** ⭐⭐⭐⭐⭐ (5/5) - Copy-paste EDR pattern

---

## Code Volume Summary

### QueryBuilder Implementation

| Component | Lines | Status |
|-----------|-------|--------|
| url_builder.ts | 500-700 | Structure decided, details pending |
| model.ts | 200-300 | Structure decided, types pending |
| helpers.ts | 50-100 | Structure decided, details pending |
| **Core Subtotal** | **750-1,100** | **Structure complete** |

### Format Parsing Implementation

| Component | Lines | Status |
|-----------|-------|--------|
| formats/sensorml/ | 1,600-2,200 | Structure decided, types pending |
| formats/swecommon/ | 1,600-2,250 | Structure decided, types pending |
| formats/geojson.ts | 50-100 | Structure decided |
| formats/constants.ts | 50-100 | Structure decided |
| **Format Subtotal** | **3,300-4,650** | **Structure complete** |

### Integration

| Component | Lines | Status |
|-----------|-------|--------|
| endpoint.ts additions | 30 | Pattern decided |
| info.ts additions | 15 | Pattern decided |
| **Integration Subtotal** | **45** | **Complete** |

### Tests

| Component | Lines | Status |
|-----------|-------|--------|
| QueryBuilder tests | 2,000-2,500 | Patterns pending (Plan 06?) |
| Format parser tests | 3,500-4,700 | Patterns pending |
| Integration tests | 500-700 | Patterns pending |
| **Test Subtotal** | **6,000-7,900** | **Patterns pending** |

### Grand Total

**Implementation:** ~4,095-5,795 lines  
**Tests:** ~6,000-7,900 lines  
**TOTAL:** ~10,095-13,695 lines

**Status:** Structure decided, implementation details pending Plans 11-16.

---

## What Part 1 Achieved

### Structural Questions - ANSWERED ✅

1. **One builder or split?** → Single CSAPIQueryBuilder
2. **Inheritance or helpers?** → Helper methods (no inheritance)
3. **Format parsing?** → Yes, in separate formats/ subfolder
4. **How many methods?** → ~70-80 public methods
5. **Resource discovery?** → Expose via property, don't validate
6. **Integration pattern?** → Copy EDR exactly

### Confidence Levels

- **Single class:** ⭐⭐⭐⭐⭐ (100% confidence - zero ambiguity)
- **Helper methods:** ⭐⭐⭐⭐⭐ (100% confidence - zero inheritance precedent)
- **Format handling:** ⭐⭐⭐⭐ (95% confidence - user mandate, details pending)
- **No validation:** ⭐⭐⭐⭐ (90% confidence - consistent with upstream)
- **Integration:** ⭐⭐⭐⭐⭐ (100% confidence - copy EDR pattern)

**Average Confidence:** ⭐⭐⭐⭐⭐ (98%)

---

## What Part 2 Must Answer

### Implementation Questions - PENDING 📋

**From Remaining Research Plans:**

**Plan 11: Integration Requirements**
- How does CSAPIQueryBuilder use OgcApiCollectionInfo?
- What properties are accessed?
- What links are expected?

**Plan 12: File Organization**
- Exact file structure for 10,000+ lines?
- How to organize format parsers?
- Where do tests go?

**Plan 13: TypeScript Types**
- How to structure SensorML 3.0 types (~400-600 lines)?
- How to structure SWE Common 3.0 types (~400-600 lines)?
- Type export strategy?

**Plan 14: Usage Scenarios**
- What are the common usage patterns?
- How do users typically combine methods?
- What convenience methods are needed?

**Plan 15: Query Parameters**
- What parameters are common across resources?
- What parameters are resource-specific?
- How to handle format selection (f=json|sml)?

**Plan 16: Subresource Navigation**
- Exact pattern for `/systems/{id}/datastreams`?
- How to handle nested resources?
- Cache parent URLs?

### Why These Matter

**Part 1** gave us the **blueprint** (what rooms, what floors).  
**Part 2** gives us the **floorplan** (exact dimensions, door placement).

Without Plans 11-16, we'd be guessing at:
- Type definitions (~800-1,200 lines of guessing)
- Query parameter handling (inconsistent across methods)
- File organization (messy 10,000+ line structure)
- Usage patterns (API that's hard to use)

**Estimated risk:** 15-20 hours of refactoring if we skip this research.

---

## Recommendation

### Phase 1: Structural Design ✅ COMPLETE

**Research:** Plans 01-04, 10 (5 plans)  
**Time:** ~8-10 hours  
**Output:** This decision document  
**Confidence:** 98%  

### Phase 2: Implementation Design 📋 PENDING

**Research:** Plans 11-16 (6 plans)  
**Time:** ~3-4 hours  
**Output:** Part 2 decision document  
**Expected Confidence:** 95%+

**Plans to Complete:**
- ✅ Plan 11: Integration Requirements (CRITICAL)
- ✅ Plan 12: File Organization (CRITICAL)
- ✅ Plan 13: TypeScript Types (CRITICAL)
- ✅ Plan 14: Usage Scenarios (HIGH)
- ✅ Plan 15: Query Parameters (HIGH)
- ✅ Plan 16: Subresource Navigation (HIGH)

### Phase 3: Implementation 🚀 READY AFTER PART 2

**What we'll implement:**
- CSAPIQueryBuilder class (~500-700 lines)
- Format parsers (~3,300-4,650 lines)
- Integration (~45 lines)
- Tests (~6,000-7,900 lines)

**Confidence with Part 2:** 95%+ (minimal rework expected)  
**Confidence without Part 2:** 60-70% (high refactoring risk)

---

## Decision Authority

**Research Foundation:**
- Plan 01: PR#114 EDR Pattern ✅
- Plan 02: QueryBuilder Pattern ✅
- Plan 03: CSAPI Architecture Decisions ✅
- Plan 04: Architecture Patterns ✅
- Plan 10: Upstream Expectations ✅

**User Decisions:**
- Format handling mandate (2026-02-04)

**Governance:**
- Follows upstream conventions (100% alignment)
- Minimal impact on existing code
- EDR pattern as template

**Status:** ✅ **APPROVED FOR STRUCTURAL DESIGN**  
**Next:** Complete Plans 11-16 for implementation details

---

## Appendix: Research Plan Status

### Completed (5 of 22)

| Plan | Title | Status | Output |
|------|-------|--------|--------|
| 01 | PR#114 EDR Pattern | ✅ Complete | findings/01-pr114-edr-pattern-findings.md |
| 02 | QueryBuilder Pattern | ✅ Complete | findings/02-querybuilder-pattern-findings.md |
| 03 | CSAPI Architecture Decisions | ✅ Complete | findings/03-csapi-architecture-decisions-findings.md |
| 04 | Architecture Patterns | ✅ Complete | findings/04-architecture-patterns-findings.md |
| 10 | Upstream Expectations | ✅ Complete | findings/10-upstream-expectations-findings.md |

### Pending for Part 2 (6 of 22)

| Plan | Title | Priority | Why Needed |
|------|-------|----------|------------|
| 11 | Integration Requirements | CRITICAL | How to use OgcApiCollectionInfo |
| 12 | File Organization | CRITICAL | Exact file structure |
| 13 | TypeScript Types | CRITICAL | Type definitions for formats |
| 14 | Usage Scenarios | HIGH | Common patterns |
| 15 | Query Parameters | HIGH | Parameter handling |
| 16 | Subresource Navigation | HIGH | Nested resource patterns |

### Optional (11 of 22)

Plans 05-09, 17-22 - External implementations, scope, lessons, OpenAPI analysis.  
**Status:** Useful but not essential for core implementation.

---

**Document Version:** 1.0  
**Date:** 2026-02-04  
**Next Review:** After Plans 11-16 completion
