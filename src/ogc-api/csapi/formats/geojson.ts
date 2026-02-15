/**
 * GeoJSON handler extensions for OGC API — Connected Systems (CSAPI).
 *
 * Provides featureType recognition, CSAPI property extraction, and inline
 * validation for GeoJSON Feature resources returned by CSAPI endpoints.
 *
 * Supported resource types: System, Deployment, Procedure, SamplingFeature.
 *
 * @see https://docs.ogc.org/is/23-001/23-001.html
 * @module
 */

import type {
  System,
  Deployment,
  Procedure,
  SamplingFeature,
  TimeInterval,
} from '../model.js';

// ========================================
// Constants
// ========================================

/** SOSA namespace URI. */
export const SOSA_NS = 'http://www.w3.org/ns/sosa/';

/** SOSA compact prefix. */
const SOSA_PREFIX = 'sosa:';

/**
 * OGC SensorML 2.0 namespace URI.
 * @see https://docs.ogc.org/is/12-000r2/12-000r2.html
 */
export const SENSORML_NS = 'http://www.opengis.net/sensorml/2.0#';

/** CSAPI resource type discriminator names. */
export type CSAPIResourceTypeName =
  | 'System'
  | 'Deployment'
  | 'Procedure'
  | 'SamplingFeature';

/**
 * SOSA local names that map to the System resource type.
 * @see SystemTypeUris in model.ts
 */
const SYSTEM_LOCAL_NAMES: ReadonlySet<string> = new Set([
  'System',
  'Sensor',
  'Actuator',
  'Platform',
  'Sampler',
]);

/** SOSA local names that map to the Deployment resource type. */
const DEPLOYMENT_LOCAL_NAMES: ReadonlySet<string> = new Set(['Deployment']);

/**
 * SOSA local names that map to the Procedure resource type.
 *
 * Note: The OGC spec's ProcedureTypeUris also lists System-type URIs,
 * but featureType-based classification prioritizes System over Procedure.
 */
const PROCEDURE_LOCAL_NAMES: ReadonlySet<string> = new Set([
  'Procedure',
  'ObservingProcedure',
  'SamplingProcedure',
  'ActuatingProcedure',
]);

/** SOSA local names that map to the SamplingFeature resource type. */
const SAMPLING_FEATURE_LOCAL_NAMES: ReadonlySet<string> = new Set([
  'SamplingFeature',
  'Sample',
]);

/**
 * SensorML local names that map to the SamplingFeature resource type.
 *
 * OSH servers use `http://www.opengis.net/sensorml/2.0#Feature` as the
 * featureType for sampling features. The SensorML `Feature` local name
 * maps to the CSAPI `SamplingFeature` resource type.
 */
const SENSORML_SAMPLING_FEATURE_LOCAL_NAMES: ReadonlySet<string> = new Set([
  'Feature',
]);

// ========================================
// Internal Helpers
// ========================================

/**
 * Safely extracts the `featureType` string from a GeoJSON-like object.
 * Returns `undefined` if the input is not a valid structure.
 */
function getFeatureType(feature: unknown): string | undefined {
  if (
    typeof feature !== 'object' ||
    feature === null ||
    !('properties' in feature)
  ) {
    return undefined;
  }
  const props = (feature as Record<string, unknown>).properties;
  if (typeof props !== 'object' || props === null) {
    return undefined;
  }
  const ft = (props as Record<string, unknown>).featureType;
  return typeof ft === 'string' ? ft : undefined;
}

/**
 * Extracts the SOSA local name from a featureType URI or CURIE.
 *
 * Handles both forms:
 * - Full URI: `http://www.w3.org/ns/sosa/Sensor` → `Sensor`
 * - Compact CURIE: `sosa:Sensor` → `Sensor`
 *
 * Returns `undefined` if the value does not use the SOSA vocabulary.
 */
function toSosaLocalName(featureType: string): string | undefined {
  if (featureType.startsWith(SOSA_NS)) {
    return featureType.slice(SOSA_NS.length);
  }
  if (featureType.startsWith(SOSA_PREFIX)) {
    return featureType.slice(SOSA_PREFIX.length);
  }
  return undefined;
}

/**
 * Extracts the SensorML local name from a featureType URI.
 *
 * Handles full URI form:
 * - `http://www.opengis.net/sensorml/2.0#Feature` → `Feature`
 *
 * Returns `undefined` if the value does not use the SensorML namespace.
 */
function toSensormlLocalName(featureType: string): string | undefined {
  if (featureType.startsWith(SENSORML_NS)) {
    return featureType.slice(SENSORML_NS.length);
  }
  return undefined;
}

// ========================================
// Recognition
// ========================================

/**
 * Tests whether a GeoJSON Feature has a CSAPI-recognized `featureType`.
 *
 * Recognition covers the SOSA and SensorML vocabularies.
 *
 * @param feature - A candidate GeoJSON Feature object.
 * @returns `true` if the feature has a recognized featureType.
 */
export function isCSAPIFeature(feature: unknown): boolean {
  return getCSAPIResourceType(feature) !== null;
}

/**
 * Classifies a GeoJSON Feature into a CSAPI resource type by its `featureType`.
 *
 * Checks the SOSA vocabulary first, then the SensorML vocabulary.
 * Classification priority within SOSA: System > Deployment > Procedure > SamplingFeature.
 * This ordering ensures that featureType values shared between System and
 * Procedure schemas (per OGC spec) resolve as System.
 *
 * @param feature - A candidate GeoJSON Feature object.
 * @returns The resource type name, or `null` if unrecognized.
 */
export function getCSAPIResourceType(
  feature: unknown
): CSAPIResourceTypeName | null {
  const ft = getFeatureType(feature);
  if (ft === undefined) return null;

  // Try SOSA vocabulary first
  const sosaLocal = toSosaLocalName(ft);
  if (sosaLocal !== undefined) {
    if (SYSTEM_LOCAL_NAMES.has(sosaLocal)) return 'System';
    if (DEPLOYMENT_LOCAL_NAMES.has(sosaLocal)) return 'Deployment';
    if (PROCEDURE_LOCAL_NAMES.has(sosaLocal)) return 'Procedure';
    if (SAMPLING_FEATURE_LOCAL_NAMES.has(sosaLocal)) return 'SamplingFeature';
    return null;
  }

  // Try SensorML vocabulary
  const smlLocal = toSensormlLocalName(ft);
  if (smlLocal !== undefined) {
    if (SENSORML_SAMPLING_FEATURE_LOCAL_NAMES.has(smlLocal))
      return 'SamplingFeature';
    return null;
  }

  return null;
}

// ========================================
// Parsing Helpers
// ========================================

/**
 * Parses a `validTime` value from server JSON into a {@link TimeInterval}.
 *
 * The OGC spec defines `timePeriod` as an array of two items, each being
 * either an ISO 8601 date-time string or the sentinel `"now"`.
 *
 * Example: `["2026-01-26T18:32:01.56Z", "now"]`
 *
 * This function accepts:
 * - Array format: `[startString, endString]` (spec-canonical)
 * - Object format: `{ start: string|Date, end?: string|Date }` (defensive)
 * - `null` or `undefined` → returns `undefined`
 *
 * The sentinel `"now"` for the end value maps to `end: undefined`.
 *
 * @param value - Raw validTime value from the server.
 * @returns Parsed TimeInterval, or `undefined` if the input is absent or invalid.
 */
export function parseValidTime(value: unknown): TimeInterval | undefined {
  if (value === null || value === undefined) return undefined;

  // Array format (spec-canonical): ["2026-01-26T18:32:01.56Z", "now"]
  if (Array.isArray(value) && value.length === 2) {
    const startStr = value[0];
    const endStr = value[1];

    if (typeof startStr !== 'string') return undefined;
    const start = new Date(startStr);
    if (isNaN(start.getTime())) return undefined;

    let end: Date | undefined;
    if (typeof endStr === 'string' && endStr !== 'now') {
      end = new Date(endStr);
      if (isNaN(end.getTime())) return undefined;
    }

    return { start, end };
  }

  // Object format (defensive): { start: ..., end?: ... }
  if (typeof value === 'object' && 'start' in (value as object)) {
    const obj = value as Record<string, unknown>;
    const startVal = obj.start;

    if (startVal instanceof Date) {
      return {
        start: startVal,
        end: obj.end instanceof Date ? obj.end : undefined,
      };
    }

    if (typeof startVal === 'string') {
      const start = new Date(startVal);
      if (isNaN(start.getTime())) return undefined;

      let end: Date | undefined;
      if (typeof obj.end === 'string' && obj.end !== 'now') {
        end = new Date(obj.end);
        if (isNaN(end.getTime())) return undefined;
      }

      return { start, end };
    }
  }

  return undefined;
}

/**
 * Tests whether a value is a syntactically valid URI (has a scheme component).
 *
 * Checks for a non-empty scheme followed by `:` per RFC 3986.
 * Does not validate the complete URI grammar.
 *
 * @param value - The value to test.
 * @returns `true` if the value is a string with a URI scheme.
 */
export function isValidUri(value: unknown): boolean {
  if (typeof value !== 'string' || value.length === 0) return false;
  // RFC 3986: scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
  return /^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(value);
}

// ========================================
// Validation
// ========================================

/**
 * Validates a GeoJSON Feature against CSAPI base requirements.
 *
 * Checks:
 * - Required properties: `featureType`, `uid`, `name`
 * - `uid` must be a valid URI
 * - `featureType` must be a recognized SOSA vocabulary term
 * - `validTime` (if present) must be parseable
 * - Deployment `validTime` is required
 * - Procedure geometry must be `null`
 *
 * @param feature - A candidate GeoJSON Feature object.
 * @returns An array of validation error messages (empty if valid).
 */
export function validateCSAPIFeature(feature: unknown): string[] {
  const errors: string[] = [];

  if (typeof feature !== 'object' || feature === null) {
    errors.push('Feature must be a non-null object');
    return errors;
  }

  const f = feature as Record<string, unknown>;
  const props = f.properties;

  if (typeof props !== 'object' || props === null) {
    errors.push('Feature must have a properties object');
    return errors;
  }

  const p = props as Record<string, unknown>;

  // Required: featureType
  if (typeof p.featureType !== 'string' || p.featureType.length === 0) {
    errors.push('Missing required property: featureType');
  } else if (getCSAPIResourceType(feature) === null) {
    errors.push(`Unrecognized featureType vocabulary: ${p.featureType}`);
  }

  // Required: uid
  if (typeof p.uid !== 'string' || p.uid.length === 0) {
    errors.push('Missing required property: uid');
  } else if (!isValidUri(p.uid)) {
    errors.push(`uid is not a valid URI: ${p.uid}`);
  }

  // Required: name
  if (typeof p.name !== 'string' || p.name.length === 0) {
    errors.push('Missing required property: name');
  }

  // Optional: validTime (if present, must be parseable)
  if (p.validTime !== undefined && p.validTime !== null) {
    if (parseValidTime(p.validTime) === undefined) {
      errors.push('validTime is not a valid time period');
    }
  }

  // Deployment: validTime is required
  const resourceType = getCSAPIResourceType(feature);
  if (resourceType === 'Deployment') {
    if (p.validTime === undefined || p.validTime === null) {
      errors.push('Deployment requires validTime');
    }
  }

  // Procedure: geometry must be null
  if (resourceType === 'Procedure') {
    if (f.geometry !== null && f.geometry !== undefined) {
      errors.push('Procedure geometry must be null');
    }
  }

  return errors;
}

// ========================================
// Extraction
// ========================================

/**
 * Extracts and converts a raw GeoJSON Feature into a typed CSAPI resource.
 *
 * Performs validation, parses `validTime` from server format to
 * {@link TimeInterval}, and returns the appropriately typed resource.
 *
 * @param feature - A raw GeoJSON Feature from the server.
 * @returns The typed CSAPI resource.
 * @throws {Error} If the feature fails validation.
 */
export function extractCSAPIFeature(
  feature: unknown
): System | Deployment | Procedure | SamplingFeature {
  const errors = validateCSAPIFeature(feature);
  if (errors.length > 0) {
    throw new Error(`Invalid CSAPI feature: ${errors.join('; ')}`);
  }

  const f = feature as Record<string, unknown>;
  const p = f.properties as Record<string, unknown>;
  const resourceType = getCSAPIResourceType(feature)!;

  // Parse validTime if present
  const validTime = parseValidTime(p.validTime);

  // Build the base properties
  const baseProperties = {
    featureType: p.featureType as string,
    uid: p.uid as string,
    name: p.name as string,
    ...(typeof p.description === 'string' ? { description: p.description } : {}),
  };

  const links = Array.isArray(f.links) ? f.links : [];

  switch (resourceType) {
    case 'System':
      return {
        id: String(f.id ?? ''),
        type: 'Feature',
        properties: {
          ...baseProperties,
          ...(p.assetType !== undefined ? { assetType: p.assetType } : {}),
          ...(validTime !== undefined ? { validTime } : {}),
        },
        ...(f.geometry !== undefined ? { geometry: f.geometry } : {}),
        links,
      } as System;

    case 'Deployment':
      return {
        id: String(f.id ?? ''),
        type: 'Feature',
        properties: {
          ...baseProperties,
          validTime: validTime!,
        },
        ...(f.geometry !== undefined ? { geometry: f.geometry } : {}),
        links,
      } as Deployment;

    case 'Procedure':
      return {
        id: String(f.id ?? ''),
        type: 'Feature',
        properties: baseProperties,
        geometry: null,
        links,
      } as Procedure;

    case 'SamplingFeature':
      return {
        id: String(f.id ?? ''),
        type: 'Feature',
        properties: {
          ...baseProperties,
          ...(validTime !== undefined ? { validTime } : {}),
        },
        ...(f.geometry !== undefined ? { geometry: f.geometry } : {}),
        links,
      } as SamplingFeature;
  }
}
