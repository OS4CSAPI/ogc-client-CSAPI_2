import { CSAPIResourceTypes } from './model.js';
import type { CSAPIResourceType } from './model.js';
import type { BoundingBox, DateTimeParameter } from '../../shared/models.js';

// ========================================
// Temporal Encoding
// ========================================

/**
 * Formats a {@link DateTimeParameter} as an ISO 8601 string suitable for
 * CSAPI temporal query parameters (`datetime`, `phenomenonTime`, `resultTime`,
 * `issueTime`, `executionTime`).
 *
 * - Single `Date` → `"2024-01-01T00:00:00.000Z"`
 * - Start only → `"2024-01-01T00:00:00.000Z/.."`
 * - End only → `"../2024-12-31T23:59:59.000Z"`
 * - Start and end → `"2024-01-01T00:00:00.000Z/2024-12-31T23:59:59.000Z"`
 *
 * @param param - A date instant or interval.
 * @returns ISO 8601 date or interval string.
 * @throws {Error} If `param` is not a valid `DateTimeParameter`.
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function formatDateTimeParameter(param: DateTimeParameter): string {
  const format = (d: Date) => d.toISOString();

  if (param instanceof Date) {
    return format(param);
  }

  if ('start' in param && 'end' in param) {
    return `${format(param.start)}/${format(param.end)}`;
  }

  if ('start' in param) {
    return `${format(param.start)}/..`;
  }

  if ('end' in param) {
    return `../${format(param.end)}`;
  }

  throw new Error('Invalid DateTimeParameter');
}

// ========================================
// Resource Type Validation
// ========================================

/**
 * Checks whether a string is a valid {@link CSAPIResourceType}.
 *
 * @param value - The string to check.
 * @returns `true` if `value` is one of the 9 CSAPI resource types.
 * @see https://docs.ogc.org/is/23-001/23-001.html
 * @see https://docs.ogc.org/is/23-002/23-002.html
 */
export function isValidResourceType(value: string): value is CSAPIResourceType {
  return (CSAPIResourceTypes as readonly string[]).includes(value);
}

/**
 * Asserts that a string is a valid {@link CSAPIResourceType}, throwing if not.
 *
 * @param value - The string to validate.
 * @throws {Error} If `value` is not a valid CSAPI resource type.
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function assertValidResourceType(
  value: string
): asserts value is CSAPIResourceType {
  if (!isValidResourceType(value)) {
    throw new Error(
      `Invalid CSAPI resource type: "${value}". ` +
        `Valid types are: ${CSAPIResourceTypes.join(', ')}`
    );
  }
}

// ========================================
// URL Encoding
// ========================================

/**
 * Encodes a resource ID for use in a URL path segment.
 *
 * Uses `encodeURIComponent` to safely handle special characters
 * (spaces, slashes, colons, etc.) that may appear in resource identifiers.
 *
 * @param id - The resource identifier to encode.
 * @returns The percent-encoded string safe for URL path segments.
 */
export function encodeResourceId(id: string): string {
  return encodeURIComponent(id);
}

/**
 * Encodes an array of values as a comma-separated string suitable for
 * CSAPI query parameters that accept multiple values (e.g., `id=sys1,sys2,sys3`).
 *
 * Each individual value is percent-encoded before joining.
 *
 * @param values - Array of string values to encode.
 * @returns Comma-separated encoded string, or an empty string if the array is empty.
 */
export function encodeArrayParameter(values: string[]): string {
  if (values.length === 0) return '';
  return values.map((v) => encodeURIComponent(v)).join(',');
}

// ========================================
// Parameter Validation
// ========================================

/**
 * Validates a `limit` query parameter value.
 *
 * The limit must be a positive integer (≥ 1).
 *
 * @param limit - The limit value to validate.
 * @throws {Error} If `limit` is not a positive integer.
 */
export function validateLimit(limit: number): void {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error(
      `Invalid limit: ${limit}. Must be a positive integer (≥ 1).`
    );
  }
}

/**
 * Validates a `bbox` query parameter value.
 *
 * A valid bounding box is a 4-element array `[minx, miny, maxx, maxy]` where
 * all elements are finite numbers and `minx ≤ maxx`, `miny ≤ maxy`.
 *
 * @param bbox - The bounding box to validate.
 * @throws {Error} If the bounding box is invalid.
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function validateBbox(bbox: BoundingBox): void {
  if (bbox.length !== 4) {
    throw new Error(
      `Invalid bbox: expected 4 coordinates [minx, miny, maxx, maxy], got ${bbox.length}.`
    );
  }

  if (!bbox.every((v) => Number.isFinite(v))) {
    throw new Error('Invalid bbox: all coordinates must be finite numbers.');
  }

  const [minx, miny, maxx, maxy] = bbox;
  if (minx > maxx) {
    throw new Error(
      `Invalid bbox: minx (${minx}) must be ≤ maxx (${maxx}).`
    );
  }
  if (miny > maxy) {
    throw new Error(
      `Invalid bbox: miny (${miny}) must be ≤ maxy (${maxy}).`
    );
  }
}
