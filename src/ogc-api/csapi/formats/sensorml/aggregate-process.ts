/**
 * SensorML 3.0 AggregateProcess sub-parser.
 *
 * Parses raw JSON objects with `type: 'AggregateProcess'` into typed
 * {@link AggregateProcess} instances. Handles all {@link AbstractProcess}-level
 * properties (definition, typeOf, configuration, featuresOfInterest,
 * inputs, outputs, parameters, modes) and the AggregateProcess-specific
 * {@link ComponentList | components} and {@link ConnectionList | connections}
 * properties.
 *
 * Component parsing is recursive: an AggregateProcess may contain other
 * AggregateProcess instances as inline components, which are parsed by
 * calling `parseAggregateProcess` again. Other inline process types
 * (SimpleProcess, PhysicalComponent, PhysicalSystem) are passed through
 * as-is until the main parser (Issue #22) coordinates full sub-parser
 * delegation.
 *
 * This is a sub-parser — it is intended to be called by the main
 * SensorML parser (Issue #22) when the `type` discriminator is
 * `'AggregateProcess'`.
 *
 * @see https://docs.ogc.org/is/23-000/23-000.html — OGC SensorML 3.0
 * @see OAS: AggregateProcess (L3698), ComponentList (L4112), ConnectionList (L4127)
 * @module
 */

import type {
  AggregateProcess,
  ComponentList,
  ComponentEntry,
  ConnectionList,
  Connection,
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
 * Error thrown when SensorML AggregateProcess parsing fails.
 *
 * @see parseAggregateProcess
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
function parseIOComponentChoice(value: unknown): IOComponentChoice {
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
 * Currently performs a pass-through cast — field-level parsing of
 * individual setting values is deferred to Issues #24-#28 (SWE Common
 * sub-component parsing).
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
 * @param value - Raw JSON value
 * @returns Parsed Mode or `undefined`
 * @see OAS: Mode (L3570)
 */
function parseMode(value: unknown): Mode | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.type !== 'string') return undefined;
  if (typeof value.label !== 'string') return undefined;
  if (typeof value.uniqueId !== 'string') return undefined;
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
// AggregateProcess-specific Helpers
// ========================================

/**
 * Parse a single {@link ComponentEntry}.
 *
 * Each component entry must have a `name` property (from SoftNamedProperty).
 * The entry is either:
 * - An **inline process** (any of the 4 concrete SensorML process types,
 *   identified by `type` being one of `'SimpleProcess'`, `'AggregateProcess'`,
 *   `'PhysicalComponent'`, `'PhysicalSystem'`)
 * - An **external link** (`type: 'Link'` with `href`)
 *
 * Inline `AggregateProcess` components are parsed recursively via
 * {@link parseAggregateProcess}. Other inline process types are
 * passed through as-is until the main parser (Issue #22) coordinates
 * full sub-parser delegation.
 *
 * @param value - Raw JSON value
 * @param index - Array index for error messages
 * @returns Parsed ComponentEntry
 * @throws {SensorMLParseError} If the entry is not a valid object or
 *   lacks a required `name` property
 * @see OAS: ComponentList (L4112), SoftNamedProperty (L1938)
 */
export function parseComponentEntry(
  value: unknown,
  index: number
): ComponentEntry {
  if (!isRecord(value)) {
    throw new SensorMLParseError(
      `components[${index}] must be an object`
    );
  }
  if (typeof value.name !== 'string') {
    throw new SensorMLParseError(
      `components[${index}] must have a string "name" property`
    );
  }

  // Recursive AggregateProcess parsing
  if (value.type === 'AggregateProcess') {
    const parsed = parseAggregateProcess(value);
    return { ...parsed, name: value.name as string } as ComponentEntry;
  }

  // Other inline process types and external links are passed through.
  // Full sub-parser delegation (SimpleProcess, PhysicalComponent,
  // PhysicalSystem) is coordinated by the main parser (Issue #22).
  return value as unknown as ComponentEntry;
}

/**
 * Parse a {@link ComponentList} — array of named sub-process components.
 *
 * @param value - Raw JSON value
 * @returns Parsed ComponentList, or `undefined` if absent/null
 * @throws {SensorMLParseError} If `value` is present but is not an array,
 *   or if any component entry is invalid
 * @see OAS: ComponentList (L4112)
 */
export function parseComponentList(
  value: unknown
): ComponentList | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new SensorMLParseError('"components" must be an array');
  }
  return value.map((item, i) => {
    try {
      return parseComponentEntry(item, i);
    } catch (err) {
      if (err instanceof SensorMLParseError) throw err;
      throw new SensorMLParseError(
        `Invalid components[${i}]: ${(err as Error).message}`
      );
    }
  });
}

/**
 * Parse a single {@link Connection} entry.
 *
 * Both `source` and `destination` properties are required strings
 * (PathRef data paths).
 *
 * @param value - Raw JSON value
 * @param index - Array index for error messages
 * @returns Parsed Connection
 * @throws {SensorMLParseError} If the entry is not valid or lacks
 *   required `source`/`destination` properties
 * @see OAS: ConnectionList (L4127)
 */
function parseConnection(value: unknown, index: number): Connection {
  if (!isRecord(value)) {
    throw new SensorMLParseError(
      `connections[${index}] must be an object`
    );
  }
  if (typeof value.source !== 'string') {
    throw new SensorMLParseError(
      `connections[${index}] must have a string "source" property`
    );
  }
  if (typeof value.destination !== 'string') {
    throw new SensorMLParseError(
      `connections[${index}] must have a string "destination" property`
    );
  }
  return {
    source: value.source,
    destination: value.destination,
  };
}

/**
 * Parse a {@link ConnectionList} — array of data-flow connections.
 *
 * @param value - Raw JSON value
 * @returns Parsed ConnectionList, or `undefined` if absent/null
 * @throws {SensorMLParseError} If `value` is present but is not an array,
 *   or if any connection entry is invalid
 * @see OAS: ConnectionList (L4127)
 */
export function parseConnectionList(
  value: unknown
): ConnectionList | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) {
    throw new SensorMLParseError('"connections" must be an array');
  }
  return value.map((item, i) => parseConnection(item, i));
}

// ========================================
// Main Parser
// ========================================

/**
 * Parse a raw SensorML 3.0 AggregateProcess JSON object into a typed
 * {@link AggregateProcess}.
 *
 * AggregateProcess is a composite non-physical process that orchestrates
 * sub-processes via named components and data flow connections.
 *
 * Handles all {@link AbstractProcess}-level properties (`definition`,
 * `typeOf`, `configuration`, `featuresOfInterest`, `inputs`, `outputs`,
 * `parameters`, `modes`) and the AggregateProcess-specific `components`
 * and `connections` properties.
 *
 * Component parsing is **recursive**: if a component's `type` is
 * `'AggregateProcess'`, it is parsed by calling this function again.
 * Other inline process types are passed through as-is until the main
 * parser (Issue #22) coordinates full sub-parser delegation.
 *
 * DescribedObject-level properties (`label`, `uniqueId`, `identifiers`,
 * `classifiers`, etc.) are passed through as-is — shared parsing helpers
 * for those fields belong to Issue #22 (SensorML Main Parser).
 *
 * @param json - Raw JSON object with `type: 'AggregateProcess'`
 * @returns Parsed AggregateProcess object
 * @throws {SensorMLParseError} If the input is not a valid AggregateProcess
 * @see https://docs.ogc.org/is/23-000/23-000.html — OGC SensorML 3.0
 * @see OAS: AggregateProcess (L3698), AbstractProcess (L3599)
 */
export function parseAggregateProcess(json: unknown): AggregateProcess {
  if (!isRecord(json)) {
    throw new SensorMLParseError(
      'AggregateProcess input must be a non-null object'
    );
  }

  if (json.type !== 'AggregateProcess') {
    throw new SensorMLParseError(
      `Expected type "AggregateProcess", got "${String(json.type)}"`
    );
  }

  // --- DescribedObject-level properties (required) ---
  if (typeof json.label !== 'string') {
    throw new SensorMLParseError(
      'AggregateProcess must have a string "label" property'
    );
  }
  if (typeof json.uniqueId !== 'string') {
    throw new SensorMLParseError(
      'AggregateProcess must have a string "uniqueId" property'
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

  // --- AggregateProcess-specific properties ---
  const components = parseComponentList(json.components);
  const connections = parseConnectionList(json.connections);

  // --- Build result, preserving DescribedObject passthrough ---
  const result: AggregateProcess = {
    // DescribedObject passthrough — the main parser (Issue #22)
    // will handle shared helpers for these fields.
    ...(json as Record<string, unknown>),
    // Enforce discriminator and required fields
    type: 'AggregateProcess' as const,
    label: json.label as string,
    uniqueId: json.uniqueId as string,
  };

  // Apply parsed AbstractProcess-level and AggregateProcess-specific
  // properties (overwrite raw values). Explicitly delete null/undefined
  // raw values before assigning parsed ones, so that optional properties
  // absent in input don't leak as `null`.
  const managedKeys = [
    'definition',
    'typeOf',
    'configuration',
    'featuresOfInterest',
    'inputs',
    'outputs',
    'parameters',
    'modes',
    'components',
    'connections',
  ] as const;
  for (const key of managedKeys) {
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

  // Apply AggregateProcess-specific properties
  if (components !== undefined) result.components = components;
  if (connections !== undefined) result.connections = connections;

  return result;
}
