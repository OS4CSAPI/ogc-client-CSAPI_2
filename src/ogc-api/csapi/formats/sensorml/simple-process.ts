/**
 * SensorML 3.0 SimpleProcess sub-parser.
 *
 * Parses raw JSON objects with `type: 'SimpleProcess'` into typed
 * {@link SimpleProcess} instances. Handles all {@link AbstractProcess}-level
 * properties (definition, typeOf, configuration, featuresOfInterest,
 * inputs, outputs, parameters, modes) and the SimpleProcess-specific
 * {@link ProcessMethod | method} property.
 *
 * This is a sub-parser — it is intended to be called by the main
 * SensorML parser (Issue #22) when the `type` discriminator is
 * `'SimpleProcess'`.
 *
 * @see https://docs.ogc.org/is/23-000/23-000.html — OGC SensorML 3.0
 * @see OAS: SimpleProcess (L3679), AbstractProcess (L3599)
 * @module
 */

import type {
  SimpleProcess,
  ProcessMethod,
  IOComponentChoice,
  Mode,
  Settings,
  Link,
  FeatureList,
  InputList,
  OutputList,
  ParameterList,
} from './types.js';

// ========================================
// Error Class
// ========================================

/**
 * Error thrown when SensorML SimpleProcess parsing fails.
 *
 * @see parseSimpleProcess
 */
export class SensorMLParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SensorMLParseError';
  }
}

// ========================================
// Internal Helpers
// ========================================

/**
 * Type guard: checks whether `value` is a non-null object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Return `value` if it is a string, otherwise `undefined`.
 */
function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/**
 * Parse a `link-2` object.
 *
 * @param value - Raw JSON value
 * @returns Parsed {@link Link} or `undefined` if not a valid link object
 */
function parseLink(value: unknown): Link | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.href !== 'string') return undefined;
  const link: Link = { href: value.href };
  if (typeof value.rel === 'string') link.rel = value.rel;
  if (typeof value.type === 'string') link.type = value.type;
  if (typeof value.hreflang === 'string') link.hreflang = value.hreflang;
  if (typeof value.title === 'string') link.title = value.title;
  if (typeof value.uid === 'string') link.uid = value.uid;
  return link;
}

/**
 * Parse a {@link ProcessMethod} object.
 *
 * @param value - Raw JSON value
 * @returns Parsed ProcessMethod or `undefined` if not a valid object
 * @see OAS: ProcessMethod (L3671)
 */
export function parseProcessMethod(value: unknown): ProcessMethod | undefined {
  if (!isRecord(value)) return undefined;
  const method: ProcessMethod = {};
  if (value.algorithm !== undefined) method.algorithm = value.algorithm;
  if (typeof value.description === 'string')
    method.description = value.description;
  return method;
}

/**
 * Parse a single {@link IOComponentChoice} entry.
 *
 * Each entry must have a `name` (string) and either:
 * - A `type` property indicating a SWE Common component or `'ObservableProperty'`
 * - Other properties carried through as-is (the SWE Common parser is not yet available)
 *
 * @param value - Raw JSON value
 * @returns Parsed IOComponentChoice
 * @throws {SensorMLParseError} If the entry lacks a required `name` property
 * @see OAS: IOComponentChoice (L3662)
 */
export function parseIOComponentChoice(value: unknown): IOComponentChoice {
  if (!isRecord(value)) {
    throw new SensorMLParseError(
      'IOComponentChoice entry must be an object'
    );
  }
  if (typeof value.name !== 'string') {
    throw new SensorMLParseError(
      'IOComponentChoice entry must have a string "name" property'
    );
  }
  // Pass through the full object as IOComponentChoice.
  // SWE Common sub-component parsing will be handled by Issues #24-#28;
  // for now we preserve the raw structure cast to the typed union.
  return value as unknown as IOComponentChoice;
}

/**
 * Parse an array of {@link IOComponentChoice} entries.
 *
 * @param value - Raw JSON value (expected: array)
 * @param listName - Name for error messages (e.g. `'inputs'`)
 * @returns Parsed array, or `undefined` if `value` is `undefined`/`null`
 * @throws {SensorMLParseError} If `value` is present but is not an array,
 *   or if any entry is invalid
 */
function parseIOList(
  value: unknown,
  listName: string
): IOComponentChoice[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new SensorMLParseError(`"${listName}" must be an array`);
  }
  return value.map((item, i) => {
    try {
      return parseIOComponentChoice(item);
    } catch (err) {
      throw new SensorMLParseError(
        `Invalid ${listName}[${i}]: ${(err as Error).message}`
      );
    }
  });
}

/**
 * Parse a {@link Settings} object.
 *
 * @param value - Raw JSON value
 * @returns Parsed Settings or `undefined`
 * @see OAS: Settings (L3307)
 */
function parseSettings(value: unknown): Settings | undefined {
  if (!isRecord(value)) return undefined;
  return value as unknown as Settings;
}

/**
 * Parse a {@link FeatureList} (array of links).
 *
 * @param value - Raw JSON value
 * @returns Parsed FeatureList or `undefined`
 * @see OAS: FeatureList (L3579)
 */
function parseFeatureList(value: unknown): FeatureList | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return undefined;
  const links: Link[] = [];
  for (const item of value) {
    const link = parseLink(item);
    if (link) links.push(link);
  }
  return links.length > 0 ? links : undefined;
}

/**
 * Parse a {@link Mode} object.
 *
 * Modes extend DescribedObject with an optional configuration. Only the
 * fields needed for the Mode type are extracted here.
 *
 * @param value - Raw JSON value
 * @returns Parsed Mode or `undefined`
 * @see OAS: Mode (L3570)
 */
function parseMode(value: unknown): Mode | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.type !== 'string') return undefined;
  if (typeof value.label !== 'string') return undefined;
  if (typeof value.uniqueId !== 'string') return undefined;
  // Pass through the full Mode object — DescribedObject-level parsing
  // is coordinated by the main parser (Issue #22).
  return value as unknown as Mode;
}

/**
 * Parse an array of {@link Mode} objects.
 *
 * @param value - Raw JSON value
 * @returns Parsed array or `undefined`
 */
function parseModes(value: unknown): Mode[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return undefined;
  const modes: Mode[] = [];
  for (const item of value) {
    const mode = parseMode(item);
    if (mode) modes.push(mode);
  }
  return modes.length > 0 ? modes : undefined;
}

// ========================================
// Main Parser
// ========================================

/**
 * Parse a raw SensorML 3.0 SimpleProcess JSON object into a typed
 * {@link SimpleProcess}.
 *
 * Handles all {@link AbstractProcess}-level properties (`definition`,
 * `typeOf`, `configuration`, `featuresOfInterest`, `inputs`, `outputs`,
 * `parameters`, `modes`) and the SimpleProcess-specific `method` property.
 *
 * DescribedObject-level properties (`label`, `uniqueId`, `identifiers`,
 * `classifiers`, etc.) are passed through as-is — shared parsing helpers
 * for those fields belong to Issue #22 (SensorML Main Parser).
 *
 * @param json - Raw JSON object with `type: 'SimpleProcess'`
 * @returns Parsed SimpleProcess object
 * @throws {SensorMLParseError} If the input is not a valid SimpleProcess
 * @see https://docs.ogc.org/is/23-000/23-000.html — OGC SensorML 3.0
 * @see OAS: SimpleProcess (L3679), AbstractProcess (L3599)
 */
export function parseSimpleProcess(json: unknown): SimpleProcess {
  if (!isRecord(json)) {
    throw new SensorMLParseError(
      'SimpleProcess input must be a non-null object'
    );
  }

  if (json.type !== 'SimpleProcess') {
    throw new SensorMLParseError(
      `Expected type "SimpleProcess", got "${String(json.type)}"`
    );
  }

  // --- DescribedObject-level properties (required) ---
  if (typeof json.label !== 'string') {
    throw new SensorMLParseError(
      'SimpleProcess must have a string "label" property'
    );
  }
  if (typeof json.uniqueId !== 'string') {
    throw new SensorMLParseError(
      'SimpleProcess must have a string "uniqueId" property'
    );
  }

  // --- AbstractProcess-level properties ---
  const definition = optionalString(json.definition);
  const typeOf = parseLink(json.typeOf);
  const configuration = parseSettings(json.configuration);
  const featuresOfInterest = parseFeatureList(json.featuresOfInterest);
  const inputs = parseIOList(json.inputs, 'inputs') as InputList | undefined;
  const outputs = parseIOList(json.outputs, 'outputs') as
    | OutputList
    | undefined;
  const parameters = parseIOList(json.parameters, 'parameters') as
    | ParameterList
    | undefined;
  const modes = parseModes(json.modes);

  // --- SimpleProcess-specific property ---
  const method = parseProcessMethod(json.method);

  // --- Build result, preserving DescribedObject passthrough ---
  const result: SimpleProcess = {
    // DescribedObject passthrough — the main parser (Issue #22)
    // will handle shared helpers for these fields.
    ...(json as Record<string, unknown>),
    // Enforce discriminator and required fields
    type: 'SimpleProcess' as const,
    label: json.label as string,
    uniqueId: json.uniqueId as string,
  };

  // Apply parsed AbstractProcess-level properties (overwrite raw values).
  // Explicitly delete null/undefined raw values before assigning parsed ones,
  // so that optional properties absent in input don't leak as `null`.
  const abstractKeys = [
    'definition',
    'typeOf',
    'configuration',
    'featuresOfInterest',
    'inputs',
    'outputs',
    'parameters',
    'modes',
    'method',
  ] as const;
  for (const key of abstractKeys) {
    delete (result as unknown as Record<string, unknown>)[key];
  }

  if (definition !== undefined) result.definition = definition;
  if (typeOf !== undefined) result.typeOf = typeOf;
  if (configuration !== undefined) result.configuration = configuration;
  if (featuresOfInterest !== undefined)
    result.featuresOfInterest = featuresOfInterest;
  if (inputs !== undefined) result.inputs = inputs;
  if (outputs !== undefined) result.outputs = outputs;
  if (parameters !== undefined) result.parameters = parameters;
  if (modes !== undefined) result.modes = modes;

  // Apply SimpleProcess-specific property
  if (method !== undefined) result.method = method;

  return result;
}
