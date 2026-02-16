/**
 * SWE Common 3.0 — shared internal parsing helpers.
 *
 * These helpers are used by multiple SWE Common sub-parsers and the main
 * parser. They were previously duplicated as private functions in each
 * consumer file; this module consolidates them into a single source of
 * truth (Issue #56, resolving Phase 3.12 F3).
 *
 * **Consumers:**
 * - `components.ts` — simple component parsers (`isRecord` only)
 * - `data-record.ts` — DataRecord parser
 * - `data-array.ts` — DataArray / encoding parser
 * - `parser.ts` — main SWE Common parser
 *
 * @see https://docs.ogc.org/is/24-014/24-014.html — OGC SWE Common 3.0
 * @module
 */

// ========================================
// Primitive Helpers
// ========================================

/**
 * Type guard: checks whether `value` is a non-null, non-array object.
 */
export function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ========================================
// Base Property Extraction
// ========================================

/**
 * Parse the shared AbstractDataComponent base properties from raw JSON.
 *
 * Extracts: `id`, `label`, `description`, `definition`, `updatable`, `optional`.
 *
 * Note: `components.ts` has its own extended variant that also extracts
 * `referenceFrame` and `axisID` for coordinate-aware components.
 */
export function parseBaseProperties(
  json: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (typeof json.id === 'string') result.id = json.id;
  if (typeof json.label === 'string') result.label = json.label;
  if (typeof json.description === 'string') result.description = json.description;
  if (typeof json.definition === 'string') result.definition = json.definition;
  if (typeof json.updatable === 'boolean') result.updatable = json.updatable;
  if (typeof json.optional === 'boolean') result.optional = json.optional;
  return result;
}
