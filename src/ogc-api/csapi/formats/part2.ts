/**
 * Part 2 parsers for OGC API - Connected Systems.
 *
 * This file houses parse functions for Part 2 resource types:
 * - `parseDatastream()` — Task 2a
 *
 * Subsequent tasks will add `parseObservation()`, `parseControlStream()`,
 * `parseCommand()`, and `parseCommandStatus()` to this file.
 *
 * @see https://docs.ogc.org/is/23-002/23-002.html — OGC API - Connected Systems Part 2
 * @module
 */

import type { Datastream, ResourceLink, TimeInterval } from '../model.js';
import { parseValidTime } from './geojson.js';

// ========================================
// Shared Helpers
// ========================================

/** Known `resultType` enum values per OGC 23-002. */
const RESULT_TYPES = new Set([
  'measure',
  'vector',
  'record',
  'coverage',
  'complex',
]);

/**
 * Normalizes the `observedProperties` field from server JSON.
 *
 * Servers may return either:
 * - An array of objects with a `definition` field: `[{ definition: "uri", label: "..." }]`
 * - A plain string array: `["uri1", "uri2"]`
 *
 * This function handles both forms and extracts the URI string for each entry.
 * Empty strings are filtered out.
 *
 * @param arr - Raw array from the server JSON.
 * @returns Array of property definition URI strings.
 */
function normalizeObservedProperties(arr: unknown[]): string[] {
  return arr
    .map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null && 'definition' in item) {
        return String((item as Record<string, unknown>).definition);
      }
      return '';
    })
    .filter(Boolean);
}

// ========================================
// parseDatastream
// ========================================

/**
 * Transforms a raw JSON object from the `/datastreams` endpoint into a typed
 * {@link Datastream} object using tolerant extraction (Postel's Law).
 *
 * Extracts all 13 fields defined in the {@link Datastream} interface. Three
 * time fields (`validTime`, `phenomenonTime`, `resultTime`) are parsed via
 * {@link parseValidTime} from `geojson.ts`. The `observedProperties` field
 * is normalized from server object form (`{ definition, label }`) to a plain
 * string array of definition URIs.
 *
 * Cross-reference fields (`system@id`, `system@link`) present in the raw JSON
 * are intentionally ignored — they are not part of the `Datastream` interface.
 *
 * @param json - Raw JSON object from the `/datastreams` items array.
 * @returns A typed {@link Datastream} object with all 13 fields extracted.
 * @throws {Error} When `json` is not a non-null object.
 *
 * @example
 * ```ts
 * const raw = {
 *   id: '0ocb',
 *   name: 'Weather Station - Weather',
 *   outputName: 'weather',
 *   validTime: ['2026-01-26T18:32:01.56Z', 'now'],
 *   observedProperties: [
 *     { definition: 'http://mmisw.org/ont/cf/parameter/air_temperature', label: 'Air Temperature' },
 *   ],
 *   formats: ['application/om+json'],
 *   phenomenonTime: ['2026-01-26T18:32:01.56Z', '2026-02-19T14:22:03.12Z'],
 *   resultTime: ['2026-01-26T18:32:01.56Z', '2026-02-19T14:22:03.12Z'],
 *   resultType: 'record',
 *   live: true,
 *   links: [{ rel: 'self', href: '/datastreams/0ocb', type: 'application/json' }],
 * };
 * const ds = parseDatastream(raw);
 * // ds.name === 'Weather Station - Weather'
 * // ds.observedProperties === ['http://mmisw.org/ont/cf/parameter/air_temperature']
 * // ds.live === true
 * ```
 *
 * @see https://docs.ogc.org/is/23-002/23-002.html#_datastream_resources
 */
export function parseDatastream(json: unknown): Datastream {
  if (typeof json !== 'object' || json === null) {
    throw new Error('parseDatastream: input must be a non-null object');
  }

  const obj = json as Record<string, unknown>;

  // Time fields: validTime is optional (undefined if absent),
  // phenomenonTime and resultTime are nullable (null if absent).
  const validTime: TimeInterval | undefined = parseValidTime(obj.validTime);
  const phenomenonTime: TimeInterval | null =
    parseValidTime(obj.phenomenonTime) ?? null;
  const resultTime: TimeInterval | null =
    parseValidTime(obj.resultTime) ?? null;

  // resultType: validate against known enum values
  const rawResultType = obj.resultType;
  const resultType: Datastream['resultType'] =
    typeof rawResultType === 'string' && RESULT_TYPES.has(rawResultType)
      ? (rawResultType as Datastream['resultType'])
      : null;

  // observedProperties: normalize from object or string array form
  const observedProperties: string[] = Array.isArray(obj.observedProperties)
    ? normalizeObservedProperties(obj.observedProperties)
    : [];

  return {
    id: typeof obj.id === 'string' ? obj.id : '',
    name: typeof obj.name === 'string' ? obj.name : '',
    ...(typeof obj.description === 'string'
      ? { description: obj.description }
      : {}),
    ...(validTime !== undefined ? { validTime } : {}),
    formats: Array.isArray(obj.formats)
      ? (obj.formats.filter((f) => typeof f === 'string') as string[])
      : [],
    ...(typeof obj.outputName === 'string'
      ? { outputName: obj.outputName }
      : {}),
    observedProperties,
    phenomenonTime,
    resultTime,
    resultType,
    live: typeof obj.live === 'boolean' ? obj.live : null,
    ...(typeof obj.type === 'string' &&
    (obj.type === 'status' || obj.type === 'observation')
      ? { type: obj.type as 'status' | 'observation' }
      : {}),
    links: Array.isArray(obj.links)
      ? (obj.links as ResourceLink[])
      : [],
  } satisfies Datastream;
}
