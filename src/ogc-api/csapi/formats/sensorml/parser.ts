/**
 * SensorML 3.0 Main Parser — entry point for parsing SensorML documents.
 *
 * Provides the public {@link parseSensorML30} function that accepts a raw
 * JSON object and returns a fully-typed {@link SensorMLProcess} discriminated
 * union value. Type discrimination reads the `type` property and delegates
 * to the appropriate sub-parser:
 *
 * - `'SimpleProcess'` → {@link parseSimpleProcess} (`simple-process.ts`)
 * - `'AggregateProcess'` → {@link parseAggregateProcess} (`aggregate-process.ts`)
 * - `'PhysicalComponent'` → {@link parsePhysicalComponent} (`physical-system.ts`)
 * - `'PhysicalSystem'` → {@link parsePhysicalSystem} (`physical-system.ts`)
 *
 * Also exports shared parsing helpers for DescribedObject, AbstractProcess,
 * and AbstractPhysicalProcess property groups, plus CapabilityList and
 * CharacteristicList parsers. Sub-parsers may import these helpers in a
 * future refactor to eliminate duplicated parsing logic.
 *
 * @see https://docs.ogc.org/is/23-000/23-000.html — OGC SensorML 3.0 (JSON)
 * @see https://docs.ogc.org/is/23-001/23-001.html — OGC API - Connected Systems Part 1
 * @see OAS: system-2 (L4153), procedure-2 (L4718) — oneOf type discrimination
 * @module
 */

import type {
  SensorMLProcess,
  DescribedObject,
  AbstractProcess,
  AbstractPhysicalProcess,
  CapabilityList,
  CharacteristicList,
  AnyProperty,
  Term,
  Link,
  TimePeriod,
  SecurityConstraint,
  LegalConstraint,
  ResponsibleParty,
  ContactLink,
  Event,
  Settings,
  FeatureList,
  InputList,
  OutputList,
  ParameterList,
  IOComponentChoice,
  Mode,
  Position,
  SpatialFrame,
  TemporalFrame,
} from './types.js';
import type { AnySimpleComponent } from '../swecommon/types.js';
import { SensorMLParseError } from './errors.js';
import { parseSimpleProcess } from './simple-process.js';
import { parseAggregateProcess } from './aggregate-process.js';
import {
  parsePhysicalSystem,
  parsePhysicalComponent,
  parsePosition,
} from './physical-system.js';

export { SensorMLParseError };
export { parsePosition };

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
 * Extracts only the standard OGC link properties (href, rel, type,
 * hreflang, title, uid), stripping any non-standard extensions.
 *
 * @param value - Raw JSON value
 * @returns Parsed {@link Link} or `undefined` if not a valid link object
 * @see OAS: link-2 schema
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
 * Parse a single {@link IOComponentChoice} entry.
 *
 * SWE Common sub-component parsing is deferred to Issues #24-#28;
 * the entry is preserved as-is with validated `name`.
 *
 * @param value - Raw JSON value
 * @returns Parsed IOComponentChoice
 * @throws {SensorMLParseError} If the entry lacks a required `name`
 * @see OAS: IOComponentChoice (L3662)
 */
function parseIOComponentChoice(value: unknown): IOComponentChoice {
  if (!isRecord(value)) {
    throw new SensorMLParseError('IOComponentChoice entry must be an object');
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
 * @returns Parsed array, or `undefined` if absent/null
 * @throws {SensorMLParseError} If present but not an array
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
        `Invalid ${listName}[${i}]: ${(err as Error).message}`,
        `${listName}[${i}]`
      );
    }
  });
}

/**
 * Parse a {@link Settings} object.
 *
 * Field-level parsing is deferred to Issues #24-#28 (SWE Common).
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
// Capability / Characteristic Parsing
// ========================================

/**
 * Parse a single {@link AnyProperty} entry (named SWE Common component).
 *
 * Each entry must have a `name` property (from the SoftNamedProperty
 * wrapper). The SWE Common component portion is passed through as-is
 * until SWE Common parsers are available (Issues #24-#28).
 *
 * @param value - Raw JSON value
 * @param index - Array index for error messages
 * @param context - Parent context for error path (e.g. `'capabilities'`)
 * @returns Parsed AnyProperty
 * @throws {SensorMLParseError} If the entry is not a valid object or
 *   lacks a required `name` property
 * @see OAS: AnyProperty, SoftNamedProperty
 */
function parseAnyProperty(
  value: unknown,
  index: number,
  context: string
): AnyProperty {
  if (!isRecord(value)) {
    throw new SensorMLParseError(
      `${context}[${index}] must be an object`,
      `${context}[${index}]`
    );
  }
  if (typeof value.name !== 'string') {
    throw new SensorMLParseError(
      `${context}[${index}] must have a string "name" property`,
      `${context}[${index}].name`
    );
  }
  // SWE Common component parsing deferred to Issues #24-#28.
  return value as unknown as AnyProperty;
}

/**
 * Parse a {@link CapabilityList} structure.
 *
 * A CapabilityList groups named SWE Common data components that
 * quantify what a process can measure or do (e.g. measurement range,
 * accuracy, resolution).
 *
 * @param json - Raw JSON object
 * @returns Parsed CapabilityList
 * @throws {SensorMLParseError} If the input is not a valid object
 * @see OAS: CapabilityList (L3129)
 * @see SensorML 3.0 §7.2.6 — Capabilities
 */
export function parseCapabilityList(json: unknown): CapabilityList {
  if (!isRecord(json)) {
    throw new SensorMLParseError('CapabilityList must be a non-null object');
  }

  const result: CapabilityList = {
    capabilities: [],
  };

  if (typeof json.id === 'string') result.id = json.id;
  if (typeof json.label === 'string') result.label = json.label;
  if (typeof json.description === 'string')
    result.description = json.description;
  if (typeof json.definition === 'string') result.definition = json.definition;

  // Conditions — SWE Common simple components; pass-through until
  // SWE Common parsers are available (Issues #24-#28).
  if (Array.isArray(json.conditions)) {
    result.conditions = json.conditions as unknown as AnySimpleComponent[];
  }

  if (Array.isArray(json.capabilities)) {
    result.capabilities = json.capabilities.map((item, i) =>
      parseAnyProperty(item, i, 'capabilities')
    );
  }

  return result;
}

/**
 * Parse a {@link CharacteristicList} structure.
 *
 * A CharacteristicList groups named SWE Common data components that
 * describe physical or operational properties (e.g. weight, dimensions,
 * power consumption).
 *
 * @param json - Raw JSON object
 * @returns Parsed CharacteristicList
 * @throws {SensorMLParseError} If the input is not a valid object
 * @see OAS: CharacteristicList (L3107)
 * @see SensorML 3.0 §7.2.5 — Characteristics
 */
export function parseCharacteristicList(json: unknown): CharacteristicList {
  if (!isRecord(json)) {
    throw new SensorMLParseError(
      'CharacteristicList must be a non-null object'
    );
  }

  const result: CharacteristicList = {
    characteristics: [],
  };

  if (typeof json.id === 'string') result.id = json.id;
  if (typeof json.label === 'string') result.label = json.label;
  if (typeof json.description === 'string')
    result.description = json.description;
  if (typeof json.definition === 'string') result.definition = json.definition;

  // Conditions — SWE Common simple components; pass-through.
  if (Array.isArray(json.conditions)) {
    result.conditions = json.conditions as unknown as AnySimpleComponent[];
  }

  if (Array.isArray(json.characteristics)) {
    result.characteristics = json.characteristics.map((item, i) =>
      parseAnyProperty(item, i, 'characteristics')
    );
  }

  return result;
}

// ========================================
// Shared Property-Group Helpers
// ========================================

/**
 * Parse {@link DescribedObject}-level properties from a raw JSON record.
 *
 * Extracts identification, classification, temporal, constraint,
 * capability, characteristic, contact, documentation, and history
 * metadata common to all SensorML process descriptions.
 *
 * Exported for use by sub-parsers in future refactors.
 *
 * @param json - Raw JSON record (already validated as non-null object)
 * @returns Partial DescribedObject with all parsed properties
 * @see OAS: DescribedObject (L3432)
 * @see SensorML 3.0 §7.2 — DescribedObject
 */
export function parseDescribedObjectProperties(
  json: Record<string, unknown>
): Partial<DescribedObject> {
  const result: Partial<DescribedObject> = {};

  // Required fields (caller validates these for their specific type)
  if (typeof json.type === 'string') result.type = json.type;
  if (typeof json.label === 'string') result.label = json.label;
  if (typeof json.uniqueId === 'string') result.uniqueId = json.uniqueId;

  // Optional scalars
  if (typeof json.id === 'string') result.id = json.id;
  if (typeof json.description === 'string')
    result.description = json.description;
  if (typeof json.lang === 'string') result.lang = json.lang;

  // Keywords
  if (Array.isArray(json.keywords)) {
    result.keywords = json.keywords.filter(
      (k): k is string => typeof k === 'string'
    );
  }

  // Identifiers (Term[])
  if (Array.isArray(json.identifiers)) {
    result.identifiers = json.identifiers as Term[];
  }

  // Classifiers (Term[])
  if (Array.isArray(json.classifiers)) {
    result.classifiers = json.classifiers as Term[];
  }

  // ValidTime (TimePeriod)
  if (Array.isArray(json.validTime)) {
    result.validTime = json.validTime as TimePeriod;
  }

  // Security constraints
  if (Array.isArray(json.securityConstraints)) {
    result.securityConstraints =
      json.securityConstraints as SecurityConstraint[];
  }

  // Legal constraints
  if (Array.isArray(json.legalConstraints)) {
    result.legalConstraints = json.legalConstraints as LegalConstraint[];
  }

  // Capabilities (CapabilityList[])
  if (Array.isArray(json.capabilities)) {
    result.capabilities = json.capabilities.map((item) =>
      parseCapabilityList(item)
    );
  }

  // Characteristics (CharacteristicList[])
  if (Array.isArray(json.characteristics)) {
    result.characteristics = json.characteristics.map((item) =>
      parseCharacteristicList(item)
    );
  }

  // Contacts
  if (Array.isArray(json.contacts)) {
    result.contacts = json.contacts as (ResponsibleParty | ContactLink)[];
  }

  // Documents
  if (Array.isArray(json.documents)) {
    result.documents = json.documents as DescribedObject['documents'];
  }

  // History (Event[])
  if (Array.isArray(json.history)) {
    result.history = json.history as Event[];
  }

  return result;
}

/**
 * Parse {@link AbstractProcess}-level properties from a raw JSON record.
 *
 * Extracts process-specific metadata: definition, typeOf, configuration,
 * features of interest, I/O ports, and operating modes. These properties
 * extend {@link DescribedObject} for all process types.
 *
 * Exported for use by sub-parsers in future refactors.
 *
 * @param json - Raw JSON record (already validated as non-null object)
 * @returns Partial AbstractProcess with all parsed properties
 * @see OAS: AbstractProcess (L3599)
 * @see SensorML 3.0 §7.3 — AbstractProcess
 */
export function parseAbstractProcessProperties(
  json: Record<string, unknown>
): Partial<AbstractProcess> {
  const result: Partial<AbstractProcess> = {};

  const definition = optionalString(json.definition);
  if (definition !== undefined) result.definition = definition;

  const typeOf = parseLink(json.typeOf);
  if (typeOf !== undefined) result.typeOf = typeOf;

  const configuration = parseSettings(json.configuration);
  if (configuration !== undefined) result.configuration = configuration;

  const featuresOfInterest = parseFeatureList(json.featuresOfInterest);
  if (featuresOfInterest !== undefined)
    result.featuresOfInterest = featuresOfInterest;

  const inputs = parseIOList(json.inputs, 'inputs') as InputList | undefined;
  if (inputs !== undefined) result.inputs = inputs;

  const outputs = parseIOList(json.outputs, 'outputs') as
    | OutputList
    | undefined;
  if (outputs !== undefined) result.outputs = outputs;

  const parameters = parseIOList(json.parameters, 'parameters') as
    | ParameterList
    | undefined;
  if (parameters !== undefined) result.parameters = parameters;

  const modes = parseModes(json.modes);
  if (modes !== undefined) result.modes = modes;

  return result;
}

/**
 * Parse {@link AbstractPhysicalProcess}-level properties from a raw JSON
 * record.
 *
 * Extracts physical-deployment metadata: attachment reference, local
 * reference frames, local time frames, and position. These properties
 * extend {@link AbstractProcess} for physical process types
 * (PhysicalSystem, PhysicalComponent).
 *
 * Exported for use by sub-parsers in future refactors.
 *
 * @param json - Raw JSON record (already validated as non-null object)
 * @returns Partial AbstractPhysicalProcess with all parsed properties
 * @see OAS: AbstractPhysicalProcess (L4020)
 * @see SensorML 3.0 §7.6 — AbstractPhysicalProcess
 */
export function parseAbstractPhysicalProcessProperties(
  json: Record<string, unknown>
): Partial<AbstractPhysicalProcess> {
  const result: Partial<AbstractPhysicalProcess> = {};

  const attachedTo = parseLink(json.attachedTo);
  if (attachedTo !== undefined) result.attachedTo = attachedTo;

  // localReferenceFrames — pass-through; detailed frame parsing
  // lives in physical-system.ts.
  if (Array.isArray(json.localReferenceFrames)) {
    result.localReferenceFrames =
      json.localReferenceFrames as SpatialFrame[];
  }

  // localTimeFrames — pass-through; detailed frame parsing
  // lives in physical-system.ts.
  if (Array.isArray(json.localTimeFrames)) {
    result.localTimeFrames = json.localTimeFrames as TemporalFrame[];
  }

  const position = parsePosition(json.position);
  if (position !== undefined) result.position = position;

  return result;
}

// ========================================
// Main Entry Point
// ========================================

/**
 * Parse a raw SensorML 3.0 JSON object into a typed
 * {@link SensorMLProcess} discriminated union value.
 *
 * This is the public entry point for SensorML parsing. It reads the
 * `type` property from the input and delegates to the appropriate
 * sub-parser:
 *
 * | `type` value          | Sub-parser                |
 * |-----------------------|---------------------------|
 * | `'SimpleProcess'`     | {@link parseSimpleProcess}     |
 * | `'AggregateProcess'`  | {@link parseAggregateProcess}  |
 * | `'PhysicalComponent'` | {@link parsePhysicalComponent} |
 * | `'PhysicalSystem'`    | {@link parsePhysicalSystem}    |
 *
 * @example
 * ```typescript
 * import { parseSensorML30 } from '@camptocamp/ogc-client/csapi/formats/sensorml';
 *
 * const result = parseSensorML30(jsonFromServer);
 * switch (result.type) {
 *   case 'PhysicalSystem':
 *     console.log(result.components); // PhysicalSystem-specific
 *     break;
 *   case 'SimpleProcess':
 *     console.log(result.method); // SimpleProcess-specific
 *     break;
 * }
 * ```
 *
 * @param json - Raw JSON object parsed from an HTTP response body
 * @returns Fully-typed SensorMLProcess value
 * @throws {SensorMLParseError} If the input is null, not an object,
 *   missing the `type` property, or has an unrecognized type value
 * @see https://docs.ogc.org/is/23-000/23-000.html — OGC SensorML 3.0
 * @see https://docs.ogc.org/is/23-001/23-001.html — OGC API - CS Part 1
 * @see OAS: system-2 (L4153), procedure-2 (L4718)
 */
export function parseSensorML30(json: unknown): SensorMLProcess {
  if (!isRecord(json)) {
    throw new SensorMLParseError(
      'SensorML input must be a non-null object'
    );
  }

  if (typeof json.type !== 'string') {
    throw new SensorMLParseError(
      'SensorML input must have a string "type" property',
      'type'
    );
  }

  switch (json.type) {
    case 'SimpleProcess':
      return parseSimpleProcess(json);
    case 'AggregateProcess':
      return parseAggregateProcess(json);
    case 'PhysicalComponent':
      return parsePhysicalComponent(json);
    case 'PhysicalSystem':
      return parsePhysicalSystem(json);
    default:
      throw new SensorMLParseError(
        `Unknown SensorML process type: "${json.type}"`,
        'type'
      );
  }
}
