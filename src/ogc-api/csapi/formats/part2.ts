/**
 * Part 2 parsers for OGC API - Connected Systems.
 *
 * This file houses parse functions for Part 2 resource types:
 * - `parseDatastream()` — Task 2a
 * - `parseObservation()` — Task 3
 * - `parseControlStream()` — Task 4
 *
 * Subsequent tasks will add `parseCommand()` and `parseCommandStatus()` to this file.
 *
 * @see https://docs.ogc.org/is/23-002/23-002.html — OGC API - Connected Systems Part 2
 * @module
 */

import type {
  ControlStream,
  Datastream,
  Observation,
  ResourceLink,
  TimeInterval,
} from '../model.js';
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

// ========================================
// parseControlStream
// ========================================

/**
 * Transforms a raw JSON object from the `/controlstreams` endpoint into a typed
 * {@link ControlStream} object using tolerant extraction (Postel's Law).
 *
 * Structurally parallel to {@link parseDatastream} — both share the `baseStream`
 * schema in the OpenAPI spec. The same `parseValidTime()` helper is used for all
 * three time fields (`validTime`, `issueTime`, `executionTime`).
 *
 * Cross-reference fields (`system@id`, `system@link`) present in the raw JSON
 * are intentionally ignored — they are not part of the `ControlStream` interface.
 *
 * The `async` field defaults to `false` when absent, per OGC 23-002 semantics
 * (synchronous command handling is the default).
 *
 * @param json - Raw JSON object from the `/controlstreams` items array.
 * @returns A typed {@link ControlStream} object with all 12 fields extracted.
 * @throws {Error} When `json` is not a non-null object.
 *
 * @example
 * ```ts
 * const raw = {
 *   id: '0o10',
 *   name: 'Autopilot - Location Control',
 *   inputName: 'navLocation',
 *   validTime: ['2026-01-14T04:49:19.134Z', 'now'],
 *   issueTime: ['2026-01-14T12:42:21.910Z', '2026-01-14T13:11:31.196Z'],
 *   executionTime: ['2026-01-14T12:42:21.928Z', '2026-01-14T13:11:31.196Z'],
 *   controlledProperties: [],
 *   formats: ['application/json'],
 *   live: true,
 *   async: true,
 * };
 * const cs = parseControlStream(raw);
 * // cs.name === 'Autopilot - Location Control'
 * // cs.async === true
 * // cs.controlledProperties === []
 * ```
 *
 * @see https://docs.ogc.org/is/23-002/23-002.html#_controlstream_resources
 */
export function parseControlStream(json: unknown): ControlStream {
  if (typeof json !== 'object' || json === null) {
    throw new Error('parseControlStream: input must be a non-null object');
  }

  const obj = json as Record<string, unknown>;

  // Time fields: validTime is optional (undefined if absent),
  // issueTime and executionTime are nullable (null if absent).
  const validTime: TimeInterval | undefined = parseValidTime(obj.validTime);
  const issueTime: TimeInterval | null =
    parseValidTime(obj.issueTime) ?? null;
  const executionTime: TimeInterval | null =
    parseValidTime(obj.executionTime) ?? null;

  // controlledProperties: normalize from object or string array form
  const controlledProperties: string[] = Array.isArray(
    obj.controlledProperties
  )
    ? normalizeObservedProperties(obj.controlledProperties)
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
    ...(typeof obj.inputName === 'string'
      ? { inputName: obj.inputName }
      : {}),
    controlledProperties,
    issueTime,
    executionTime,
    live: typeof obj.live === 'boolean' ? obj.live : null,
    async: typeof obj.async === 'boolean' ? obj.async : false,
    links: Array.isArray(obj.links)
      ? (obj.links as ResourceLink[])
      : [],
  } satisfies ControlStream;
}

// ========================================
// parseObservation
// ========================================

/**
 * Transforms a raw JSON object from the `/observations` endpoint into a typed
 * {@link Observation} object using tolerant extraction (Postel's Law).
 *
 * Unlike Datastream/ControlStream, Observation time fields (`phenomenonTime`,
 * `resultTime`) are single ISO 8601 instant strings, **not** time intervals.
 * `parseValidTime()` is NOT used here.
 *
 * The `result` field is passed through as opaque `unknown` because its shape
 * depends on the datastream's observation schema (scalar, record, vector,
 * coverage, etc.). Consumers who need typed results should validate against
 * the datastream's schema separately.
 *
 * Cross-reference fields (`datastream@id`, `samplingFeature@id`, `foi@id`)
 * present in the raw JSON are intentionally ignored — they are not part of
 * the `Observation` interface.
 *
 * @param json - Raw JSON object from the `/observations` items array.
 * @returns A typed {@link Observation} object with extracted fields.
 * @throws {Error} When `json` is not a non-null object.
 *
 * @example
 * ```ts
 * const raw = {
 *   id: '0o1abc123',
 *   'datastream@id': '0ocb',
 *   phenomenonTime: '2026-02-19T14:22:03.12Z',
 *   resultTime: '2026-02-19T14:22:03.12Z',
 *   parameters: { quality: 'good' },
 *   result: { temperature: 22.5, humidity: 65.3, pressure: 1013.25 },
 * };
 * const obs = parseObservation(raw);
 * // obs.id === '0o1abc123'
 * // obs.resultTime === '2026-02-19T14:22:03.12Z'
 * // obs.result === { temperature: 22.5, humidity: 65.3, pressure: 1013.25 }
 * ```
 *
 * @see https://docs.ogc.org/is/23-002/23-002.html#_observation_resources
 */
export function parseObservation(json: unknown): Observation {
  if (typeof json !== 'object' || json === null) {
    throw new Error('parseObservation: input must be a non-null object');
  }

  const obj = json as Record<string, unknown>;

  // parameters: pass through if non-null object, omit otherwise
  const parametersValue = obj.parameters;
  const hasParameters =
    typeof parametersValue === 'object' &&
    parametersValue !== null &&
    !Array.isArray(parametersValue);

  return {
    id: typeof obj.id === 'string' ? obj.id : '',
    ...(typeof obj.phenomenonTime === 'string'
      ? { phenomenonTime: obj.phenomenonTime }
      : {}),
    resultTime: typeof obj.resultTime === 'string' ? obj.resultTime : '',
    ...(hasParameters
      ? { parameters: parametersValue as Record<string, unknown> }
      : {}),
    ...(obj.result !== undefined ? { result: obj.result } : {}),
    ...(Array.isArray(obj.links)
      ? { links: obj.links as ResourceLink[] }
      : {}),
  } satisfies Observation;
}
