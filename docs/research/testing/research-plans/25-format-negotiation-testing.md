# Section 25: Format Negotiation Testing Strategy - Research Plan

**Status:** Research Planning Phase - Outline Only  
**Last Updated:** February 5, 2026  
**Estimated Research Time:** TBD  
**Estimated Test Implementation Lines:** TBD

---

## 1. Research Objective

Define testing strategy for format negotiation via Accept headers, query parameters, and link discovery.

**Why 25th:** After query parameter testing (Section 24), test format negotiation mechanisms across all three methods.

---

## 2. Research Questions

### Core Questions

1. How to test Accept header format negotiation?
2. How to test query parameter format selection (f=geojson)?
3. How to test format discovery via links?
4. What media types does CSAPI support?
5. How to test format precedence (Accept vs query param)?
6. What happens with unsupported formats?

### Detailed Questions

- What are all the CSAPI-supported media types?
- Which resources support which formats?
- How is format negotiation prioritized (Accept header vs f= parameter)?
- What is the default format?
- How to test wildcard Accept headers (*/*)?
- How to test complex Accept headers with quality values?
- How to test format links in resource representations?
- What error responses occur for unsupported formats?
- How to test format fallback scenarios?
- How to test format encoding (charset)?
- What is the role of the Vary header?

---

## 3. Primary Resources

- **Format Negotiation Architecture**: [docs/architecture/responses/format-negotiation.md](../../../architecture/responses/format-negotiation.md)
- **Format Requirements**: [docs/research/requirements/format-requirements.md](../../requirements/format-requirements.md)
- **CSAPI Specifications**: Media type definitions across all parts
- **Implementation Guide**: [docs/planning/csapi-implementation-guide.md](../../../planning/csapi-implementation-guide.md)

## 4. Supporting Resources

- HTTP Content Negotiation (RFC 7231)
- OGC API - Common format negotiation patterns
- Section 8 deliverable (CSAPI Spec Review - format specifications)
- Section 24 deliverable (Query Parameter Testing - f= parameter)

---

## 5. Research Methodology

### Phase 1: Format Specification Analysis (TBD minutes)

**Objective:** Extract format negotiation requirements from CSAPI

**Tasks:**
1. Identify all CSAPI media types
2. Document media type support by resource type
3. Extract Accept header requirements
4. Extract f= query parameter requirements
5. Extract link-based format discovery requirements
6. Document format precedence rules
7. Create format negotiation matrix

### Phase 2: Upstream Format Testing Analysis (TBD minutes)

**Objective:** Analyze format negotiation testing in upstream

**Tasks:**
1. Identify format negotiation tests in upstream
2. Extract Accept header test patterns
3. Extract query parameter format test patterns
4. Extract link parsing test patterns
5. Document format mocking approaches
6. Extract best practices

### Phase 3: Test Scenario Design (TBD minutes)

**Objective:** Design test scenarios for format negotiation

**Tasks:**
1. Design Accept header test scenarios
2. Design f= query parameter test scenarios
3. Design link-based format discovery test scenarios
4. Design format precedence test scenarios
5. Design unsupported format test scenarios
6. Design format fallback test scenarios
7. Document scenario matrix

### Phase 4: Media Type Matrix Creation (TBD minutes)

**Objective:** Create comprehensive media type support matrix

**Tasks:**
1. Map media types to resource types
2. Document default formats
3. Document format precedence
4. Identify format-specific representations
5. Create media type test matrix

### Phase 5: Fixture Design (TBD minutes)

**Objective:** Design fixtures for format negotiation testing

**Tasks:**
1. Design Accept header fixtures
2. Design format-specific response fixtures
3. Design link relation fixtures
4. Design error response fixtures
5. Estimate fixture counts

### Phase 6: Synthesis (TBD minutes)

**Objective:** Create comprehensive format negotiation testing strategy

**Tasks:**
1. Consolidate format negotiation scenarios
2. Create format test templates
3. Document fixture requirements
4. Estimate test implementation effort
5. Create deliverable document

---

## 6. Success Criteria

This research is complete when:

- [ ] All CSAPI media types are inventoried
- [ ] Format negotiation methods are fully specified (Accept, f=, links)
- [ ] Format precedence rules are documented
- [ ] Media type support matrix is complete
- [ ] Format fallback scenarios are defined
- [ ] Format test patterns are documented
- [ ] Deliverable document is peer-reviewed

---

## 7. Deliverable

**Format negotiation testing strategy covering all three negotiation methods**

Content includes:
- Complete CSAPI media type inventory
- Media type support matrix by resource type
- Accept header test patterns
- Query parameter (f=) test patterns
- Link-based format discovery test patterns
- Format precedence test scenarios
- Unsupported format test scenarios
- Format fallback test scenarios
- Wildcard Accept header tests
- Quality value (q=) Accept header tests
- Format-specific fixture requirements
- Implementation estimates

---

## 8. Dependencies

**Must Complete Before Starting:**
- Section 8: CSAPI Specification Review (media type definitions)
- Section 24: Query Parameter Combination Testing (f= parameter)
- Format Negotiation Architecture document

**Blocks:**
- Format negotiation implementation
- Media type selection logic
- Section 19: Test Organization and File Structure (format test organization)

---

## 9. Research Status Checklist

- [ ] Phase 1: Format Specification Analysis - Complete
- [ ] Phase 2: Upstream Format Testing Analysis - Complete
- [ ] Phase 3: Test Scenario Design - Complete
- [ ] Phase 4: Media Type Matrix Creation - Complete
- [ ] Phase 5: Fixture Design - Complete
- [ ] Phase 6: Synthesis - Complete
- [ ] Deliverable document created and reviewed
- [ ] Cross-references updated in related documents

---

## 10. Notes and Open Questions

<!-- Add notes and unresolved questions here as research progesses -->

**Initial Observations:**
- CSAPI supports multiple formats: GeoJSON, SensorML, O&M JSON, HTML, JSON
- Format negotiation has three mechanisms: Accept header, f= query parameter, link relations
- Query parameter (f=) takes precedence over Accept header
- Default format is typically JSON or GeoJSON

**Known Media Types (Partial List):**
- `application/geo+json` - GeoJSON (collections, features)
- `application/sensorml+json` - SensorML (systems, procedures)
- `application/om+json` - O&M JSON (observations)
- `application/json` - Generic JSON
- `text/html` - HTML representation
- `application/ld+json` - JSON-LD (linked data)

**Format Negotiation Precedence:**
1. f= query parameter (highest precedence)
2. Accept header
3. Default format (lowest precedence)

---

**Next Steps:** Review format-negotiation.md architecture document for complete format specification.
