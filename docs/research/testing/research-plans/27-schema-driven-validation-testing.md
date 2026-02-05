# Section 27: Schema-Driven Validation Testing - Research Plan

**Status:** Research Planning Phase - Outline Only  
**Last Updated:** February 5, 2026  
**Estimated Research Time:** TBD  
**Estimated Test Implementation Lines:** TBD

---

## 1. Research Objective

Define testing strategy for schema validation (DataStream schemas for Observations, ControlStream schemas for Commands).

**Why 27th:** Schema validation is unique to CSAPI Part 2. After format testing (Section 10), test schema-driven validation.

---

## 2. Research Questions

### Core Questions

1. How to test observation result validation against DataStream schema?
2. How to test command parameter validation against ControlStream schema?
3. What schema mismatch scenarios must be tested?
4. How to test schema parsing (SWE Common schemas)?
5. What fixtures needed for schema validation scenarios?
6. How to test error messages for schema violations?

### Detailed Questions

- What is the structure of DataStream schemas?
- What is the structure of ControlStream schemas?
- How are schemas defined in SWE Common 3.0?
- What validation rules apply to observation results?
- What validation rules apply to command parameters?
- How to test type mismatches (e.g., numeric field receives string)?
- How to test missing required fields?
- How to test extra unexpected fields?
- How to test constraint violations (e.g., value out of range)?
- What are the expected error messages for schema violations?
- How to test schema evolution scenarios?
- Can schemas reference other schemas?

---

## 3. Primary Resources

- **CSAPI Part 2 Specification**: https://docs.ogc.org/is/23-002/23-002.html (schema requirements)
- **Part 2 Requirements**: [docs/research/requirements/csapi-part2-requirements.md](../../requirements/csapi-part2-requirements.md)
- **SWE Common 3.0 Specification**: https://docs.ogc.org/is/24-014/24-014.html
- **Section 10 deliverable**: SWE Common testing specification

## 4. Supporting Resources

- Section 1-2 deliverables (upstream schema validation patterns)
- Section 8 deliverable (CSAPI Spec Review - schema definitions)
- Implementation Guide (schema validation specifications)
- JSON Schema standards (if applicable)

---

## 5. Research Methodology

### Phase 1: Schema Specification Analysis (TBD minutes)

**Objective:** Understand DataStream and ControlStream schema requirements

**Tasks:**
1. Extract DataStream schema specification from Part 2
2. Extract ControlStream schema specification from Part 2
3. Document schema structure (SWE Common components)
4. Identify validation rules for observations
5. Identify validation rules for commands
6. Create schema validation requirements matrix

### Phase 2: SWE Common Schema Analysis (TBD minutes)

**Objective:** Understand SWE Common schema definitions

**Tasks:**
1. Review SWE Common component schemas
2. Document schema composition rules
3. Identify constraint types (allowedValues, intervals, etc.)
4. Document schema parsing requirements
5. Create SWE Common schema test patterns

### Phase 3: Upstream Schema Validation Analysis (TBD minutes)

**Objective:** Analyze schema validation testing in upstream

**Tasks:**
1. Identify schema validation tests in upstream
2. Extract schema validation test patterns
3. Document schema mocking approaches
4. Identify error handling patterns
5. Extract best practices

### Phase 4: Validation Scenario Design (TBD minutes)

**Objective:** Design test scenarios for schema validation

**Tasks:**
1. Design observation result validation scenarios
2. Design command parameter validation scenarios
3. Design schema mismatch scenarios (type, missing, extra fields)
4. Design constraint violation scenarios
5. Design error message validation tests
6. Document scenario matrix

### Phase 5: Fixture Design (TBD minutes)

**Objective:** Design fixtures for schema validation testing

**Tasks:**
1. Design valid observation result fixtures
2. Design invalid observation result fixtures
3. Design valid command parameter fixtures
4. Design invalid command parameter fixtures
5. Design DataStream schema fixtures
6. Design ControlStream schema fixtures
7. Estimate fixture counts

### Phase 6: Synthesis (TBD minutes)

**Objective:** Create comprehensive schema-driven validation testing strategy

**Tasks:**
1. Consolidate validation scenarios
2. Create schema validation test templates
3. Document fixture requirements
4. Estimate test implementation effort
5. Create deliverable document

---

## 6. Success Criteria

This research is complete when:

- [ ] DataStream schema validation is fully specified
- [ ] ControlStream schema validation is fully specified
- [ ] Schema mismatch scenarios are documented
- [ ] SWE Common schema parsing tests are defined
- [ ] Error message validation is specified
- [ ] Schema validation fixtures are designed
- [ ] Deliverable document is peer-reviewed

---

## 7. Deliverable

**Schema-driven validation testing strategy with mismatch scenarios**

Content includes:
- DataStream schema structure and validation rules
- ControlStream schema structure and validation rules
- Observation result validation test patterns
- Command parameter validation test patterns
- Schema mismatch test scenarios (type errors, missing/extra fields)
- Constraint violation test scenarios (range, allowedValues)
- SWE Common schema parsing tests
- Error message validation tests
- Valid and invalid fixture requirements
- Schema evolution test scenarios
- Implementation estimates

**Example Validation Scenarios:**
- Observation result with wrong data type (e.g., string instead of number)
- Observation result missing required field
- Command parameter with value out of allowed range
- Schema with complex nested structure validation
- Schema with allowedValues constraint violation

---

## 8. Dependencies

**Must Complete Before Starting:**
- Section 10: SWE Common Testing Requirements (schema component testing)
- Section 8: CSAPI Specification Review (schema definitions)
- Section 1-2: Upstream Analysis (schema validation patterns)

**Blocks:**
- DataStream schema validation implementation
- ControlStream schema validation implementation
- Schema-based error reporting

---

## 9. Research Status Checklist

- [ ] Phase 1: Schema Specification Analysis - Complete
- [ ] Phase 2: SWE Common Schema Analysis - Complete
- [ ] Phase 3: Upstream Schema Validation Analysis - Complete
- [ ] Phase 4: Validation Scenario Design - Complete
- [ ] Phase 5: Fixture Design - Complete
- [ ] Phase 6: Synthesis - Complete
- [ ] Deliverable document created and reviewed
- [ ] Cross-references updated in related documents

---

## 10. Notes and Open Questions

<!-- Add notes and unresolved questions here as research progresses -->

**Initial Observations:**
- CSAPI Part 2 introduces schema-driven validation unique to Connected Systems API
- DataStreams have resultSchema (SWE Common DataRecord or DataArray)
- ControlStreams have parametersSchema (SWE Common DataRecord)
- Observation results must match DataStream's resultSchema
- Command parameters must match ControlStream's parametersSchema

**Schema Types:**
- **DataRecord**: Named fields with types
- **DataArray**: Array of values with element type definition
- **Component Types**: Quantity, Count, Boolean, Text, Category, Time, etc.
- **Constraints**: allowedValues, allowedIntervals, significantFigures, etc.

**Key Validation Rules:**
- Type matching (observation values match schema types)
- Constraint enforcement (values within allowed ranges)
- Required field validation
- Array length validation for DataArray results

---

**Next Steps:** Review CSAPI Part 2 specification section on DataStream resultSchema and ControlStream parametersSchema.
