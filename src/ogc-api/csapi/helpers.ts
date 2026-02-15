import { CSAPIResourceTypes, SystemTypeUris } from './model.js';
import type { CSAPIResourceType, CsapiDateTimeParameter } from './model.js';
import type { BoundingBox } from '../../shared/models.js';

// ========================================
// Temporal Encoding
// ========================================

/**
 * Formats a {@link CsapiDateTimeParameter} as an ISO 8601 string suitable for
 * CSAPI temporal query parameters (`datetime`, `phenomenonTime`, `resultTime`,
 * `issueTime`, `executionTime`).
 *
 * - `'latest'` → `"latest"` (CSAPI Part 2 special value for `resultTime`)
 * - Single `Date` → `"2024-01-01T00:00:00.000Z"`
 * - Start only → `"2024-01-01T00:00:00.000Z/.."`
 * - End only → `"../2024-12-31T23:59:59.000Z"`
 * - Start and end → `"2024-01-01T00:00:00.000Z/2024-12-31T23:59:59.000Z"`
 *
 * @param param - A date instant, interval, or the `'latest'` keyword.
 * @returns ISO 8601 date or interval string, or `'latest'`.
 * @throws {Error} If `param` is not a valid `CsapiDateTimeParameter`.
 * @see https://docs.ogc.org/is/23-001/23-001.html
 * @see https://docs.ogc.org/is/23-002/23-002.html
 */
export function formatDateTimeParameter(param: CsapiDateTimeParameter): string {
  if (param === 'latest') return 'latest';

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

  throw new Error('Invalid CsapiDateTimeParameter');
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

// ========================================
// Link Scanning
// ========================================

/**
 * Scans an array of link objects for CSAPI resource references and returns
 * a Map of resource type name → href.
 *
 * Recognizes three OGC link relation conventions, in priority order:
 *
 * 1. **`ogc-cs:` prefixed** — `rel: "ogc-cs:systems"` → resource `"systems"`
 * 2. **Plain resource name** — `rel: "systems"` where the value is a known
 *    {@link CSAPIResourceTypes} member
 * 3. **`items` with resource href** — `rel: "items"` where the `href` path
 *    ends with a known resource type name (query parameters are stripped
 *    before matching; the alias `featuresOfInterest` is normalized to
 *    `samplingFeatures`)
 *
 * @param links - Array of link objects (e.g., from a collection or root document).
 * @returns Map of resource type name → href string. Empty if no CSAPI links found.
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function scanCsapiLinks(
  links: Array<{ rel?: string; href?: string }>
): Map<string, string> {
  const result = new Map<string, string>();

  if (!Array.isArray(links)) {
    return result;
  }

  const knownTypes: ReadonlySet<string> = new Set(CSAPIResourceTypes);

  for (const link of links) {
    const rel = link.rel;
    const href = link.href;
    if (typeof rel !== 'string') continue;

    // Convention 1: ogc-cs: prefixed (e.g., rel: "ogc-cs:systems")
    const match = rel.match(/^ogc-cs:(.+)$/);
    if (match) {
      result.set(match[1], typeof href === 'string' ? href : '');
      continue;
    }

    // Convention 2: plain resource name (e.g., rel: "systems")
    if (knownTypes.has(rel)) {
      result.set(rel, typeof href === 'string' ? href : '');
      continue;
    }

    // Convention 3: rel: "items" with resource type in href
    if (rel === 'items' && typeof href === 'string') {
      const segment = href.split('?')[0].replace(/\/+$/, '').split('/').pop();
      // Normalize known server naming variants to spec resource type names
      const normalized = segment === 'featuresOfInterest' ? 'samplingFeatures' : segment;
      if (normalized && knownTypes.has(normalized)) {
        result.set(normalized, href);
      }
    }
  }

  return result;
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

// ========================================
// Validation Types
// ========================================

/**
 * Describes a validation error found in a CSAPI resource document.
 *
 * @see https://docs.ogc.org/is/23-001/23-001.html
 * @see https://docs.ogc.org/is/23-002/23-002.html
 */
export interface ValidationError {
  /** Error severity: 'error' = invalid/unusable, 'warning' = questionable/suboptimal. */
  severity: 'error' | 'warning';
  /** Property path to the error location (e.g., "properties.uid"). */
  path: string;
  /** Description of what was expected vs. what was found. */
  message: string;
}

// ========================================
// Cross-Reference Validation
// ========================================

/** @internal RFC 3986 scheme pattern. */
const URI_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+\-.]*:/;

/**
 * Validates that a value is a syntactically valid URI (has a scheme component).
 *
 * @param value - The value to validate.
 * @param path - Property path for error reporting.
 * @returns Array of validation errors (empty if valid).
 * @see https://tools.ietf.org/html/rfc8141
 */
export function validateUri(value: unknown, path: string): ValidationError[] {
  if (typeof value !== 'string' || value.length === 0)
    return [
      { severity: 'error', path, message: 'Expected a non-empty URI string' },
    ];
  if (!URI_SCHEME_RE.test(value))
    return [
      {
        severity: 'error',
        path,
        message: `Not a valid URI (missing scheme): "${value}"`,
      },
    ];
  return [];
}

/**
 * Validates a HATEOAS link object.
 *
 * Checks that `href` is a non-empty string and that `rel` (if present)
 * is a non-empty string.
 *
 * @param link - The link object to validate.
 * @param path - Property path for error reporting.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function validateLink(
  link: unknown,
  path: string
): ValidationError[] {
  if (typeof link !== 'object' || link === null)
    return [{ severity: 'error', path, message: 'Expected a link object' }];
  const errors: ValidationError[] = [];
  const obj = link as Record<string, unknown>;
  if (typeof obj.href !== 'string' || obj.href.length === 0)
    errors.push({
      severity: 'error',
      path: `${path}.href`,
      message: 'Link must have a non-empty href string',
    });
  if ('rel' in obj && (typeof obj.rel !== 'string' || obj.rel.length === 0))
    errors.push({
      severity: 'error',
      path: `${path}.rel`,
      message: 'Link rel must be a non-empty string',
    });
  return errors;
}

/**
 * Validates an ISO 8601 date-time string.
 *
 * @param value - The value to validate.
 * @param path - Property path for error reporting.
 * @returns Array of validation errors (empty if valid).
 */
export function validateIsoDateTime(
  value: unknown,
  path: string
): ValidationError[] {
  if (typeof value !== 'string' || value.length === 0)
    return [
      {
        severity: 'error',
        path,
        message: 'Expected an ISO 8601 date-time string',
      },
    ];
  if (isNaN(new Date(value).getTime()))
    return [
      {
        severity: 'error',
        path,
        message: `Not a valid ISO 8601 date-time: "${value}"`,
      },
    ];
  return [];
}

/**
 * Validates a time period value.
 *
 * Accepts array format `[startString, endString]` (spec-canonical) or
 * object format `{ start, end? }`. The end sentinel `"now"` is allowed.
 *
 * @param value - The time period to validate.
 * @param path - Property path for error reporting.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function validateTimePeriod(
  value: unknown,
  path: string
): ValidationError[] {
  if (value === null || value === undefined)
    return [{ severity: 'error', path, message: 'Expected a time period' }];
  const errors: ValidationError[] = [];

  if (Array.isArray(value)) {
    if (value.length !== 2)
      return [
        {
          severity: 'error',
          path,
          message: `Expected [start, end], got ${value.length} elements`,
        },
      ];
    const sErr = validateIsoDateTime(value[0], `${path}[0]`);
    errors.push(...sErr);
    if (typeof value[1] === 'string' && value[1] !== 'now') {
      const eErr = validateIsoDateTime(value[1], `${path}[1]`);
      errors.push(...eErr);
      if (
        sErr.length === 0 &&
        eErr.length === 0 &&
        new Date(value[1] as string) < new Date(value[0] as string)
      )
        errors.push({
          severity: 'error',
          path,
          message: 'Time period end is before start',
        });
    }
    return errors;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (!('start' in obj))
      return [
        {
          severity: 'error',
          path: `${path}.start`,
          message: 'Time period must have a start',
        },
      ];
    if (obj.start instanceof Date) {
      if (isNaN(obj.start.getTime()))
        errors.push({
          severity: 'error',
          path: `${path}.start`,
          message: 'Invalid start date',
        });
    } else {
      errors.push(...validateIsoDateTime(obj.start, `${path}.start`));
    }
    if (obj.end !== undefined && obj.end !== null && obj.end !== 'now') {
      if (obj.end instanceof Date) {
        if (isNaN(obj.end.getTime()))
          errors.push({
            severity: 'error',
            path: `${path}.end`,
            message: 'Invalid end date',
          });
      } else {
        errors.push(...validateIsoDateTime(obj.end, `${path}.end`));
      }
    }
    return errors;
  }

  return [
    {
      severity: 'error',
      path,
      message: 'Expected a time period array or object',
    },
  ];
}

// ========================================
// Part 1 Resource Validation
// ========================================

/** @internal Valid System featureType values (full URI and CURIE forms). */
const VALID_SYSTEM_FEATURE_TYPES: ReadonlySet<string> = new Set([
  ...SystemTypeUris,
  'sosa:Sensor',
  'sosa:Actuator',
  'sosa:Platform',
  'sosa:Sampler',
  'sosa:System',
]);

/** @internal Valid Deployment featureType values. */
const VALID_DEPLOYMENT_FEATURE_TYPES: ReadonlySet<string> = new Set([
  'http://www.w3.org/ns/sosa/Deployment',
  'sosa:Deployment',
]);

/** @internal Valid Procedure featureType values. */
const VALID_PROCEDURE_FEATURE_TYPES: ReadonlySet<string> = new Set([
  'http://www.w3.org/ns/sosa/Procedure',
  'http://www.w3.org/ns/sosa/ObservingProcedure',
  'http://www.w3.org/ns/sosa/SamplingProcedure',
  'http://www.w3.org/ns/sosa/ActuatingProcedure',
  'sosa:Procedure',
  'sosa:ObservingProcedure',
  'sosa:SamplingProcedure',
  'sosa:ActuatingProcedure',
]);

/**
 * @internal Extracts the `properties` object from a GeoJSON Feature.
 * Returns `null` if the input is not a valid Feature structure.
 */
function getFeatureProps(input: unknown): Record<string, unknown> | null {
  if (typeof input !== 'object' || input === null) return null;
  const f = input as Record<string, unknown>;
  if (typeof f.properties !== 'object' || f.properties === null) return null;
  return f.properties as Record<string, unknown>;
}

/**
 * @internal Validates base GeoJSON Feature requirements (featureType, uid, name).
 */
function validateBaseFeature(
  input: unknown,
  typeName: string
): ValidationError[] {
  const errors: ValidationError[] = [];
  const props = getFeatureProps(input);
  if (props === null) {
    return [
      {
        severity: 'error',
        path: typeName,
        message: 'Feature must have a properties object',
      },
    ];
  }
  if (typeof props.featureType !== 'string' || props.featureType.length === 0)
    errors.push({
      severity: 'error',
      path: `${typeName}.properties.featureType`,
      message: 'Required: featureType (non-empty string)',
    });
  if (typeof props.uid !== 'string' || props.uid.length === 0)
    errors.push({
      severity: 'error',
      path: `${typeName}.properties.uid`,
      message: 'Required: uid (non-empty string)',
    });
  else errors.push(...validateUri(props.uid, `${typeName}.properties.uid`));
  if (typeof props.name !== 'string' || props.name.length === 0)
    errors.push({
      severity: 'error',
      path: `${typeName}.properties.name`,
      message: 'Required: name (non-empty string)',
    });
  return errors;
}

/**
 * Validates a System resource against OGC Part 1 requirements.
 *
 * Checks: base feature requirements + featureType from SystemTypeUris.
 *
 * @param input - A candidate System resource object.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function validateSystem(input: unknown): ValidationError[] {
  const errors = validateBaseFeature(input, 'System');
  const props = getFeatureProps(input);
  if (
    props &&
    typeof props.featureType === 'string' &&
    props.featureType.length > 0
  ) {
    if (!VALID_SYSTEM_FEATURE_TYPES.has(props.featureType))
      errors.push({
        severity: 'error',
        path: 'System.properties.featureType',
        message: `featureType "${props.featureType}" is not a valid System type`,
      });
  }
  return errors;
}

/**
 * Validates a Deployment resource against OGC Part 1 requirements.
 *
 * Checks: base feature requirements + DeploymentTypeUris + validTime required.
 *
 * @param input - A candidate Deployment resource object.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function validateDeployment(input: unknown): ValidationError[] {
  const errors = validateBaseFeature(input, 'Deployment');
  const props = getFeatureProps(input);
  if (props) {
    if (
      typeof props.featureType === 'string' &&
      props.featureType.length > 0
    ) {
      if (!VALID_DEPLOYMENT_FEATURE_TYPES.has(props.featureType))
        errors.push({
          severity: 'error',
          path: 'Deployment.properties.featureType',
          message: `featureType "${props.featureType}" is not a valid Deployment type`,
        });
    }
    if (props.validTime === undefined || props.validTime === null)
      errors.push({
        severity: 'error',
        path: 'Deployment.properties.validTime',
        message: 'Required: validTime (time period)',
      });
    else
      errors.push(
        ...validateTimePeriod(
          props.validTime,
          'Deployment.properties.validTime'
        )
      );
  }
  return errors;
}

/**
 * Validates a Procedure resource against OGC Part 1 requirements.
 *
 * Checks: base feature requirements + ProcedureTypeUris.
 *
 * @param input - A candidate Procedure resource object.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function validateProcedure(input: unknown): ValidationError[] {
  const errors = validateBaseFeature(input, 'Procedure');
  const props = getFeatureProps(input);
  if (
    props &&
    typeof props.featureType === 'string' &&
    props.featureType.length > 0
  ) {
    if (!VALID_PROCEDURE_FEATURE_TYPES.has(props.featureType))
      errors.push({
        severity: 'error',
        path: 'Procedure.properties.featureType',
        message: `featureType "${props.featureType}" is not a valid Procedure type`,
      });
  }
  return errors;
}

/**
 * Validates a SamplingFeature resource against OGC Part 1 requirements.
 *
 * Checks: base feature requirements + sampledFeature@link required.
 *
 * @param input - A candidate SamplingFeature resource object.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function validateSamplingFeature(input: unknown): ValidationError[] {
  const errors = validateBaseFeature(input, 'SamplingFeature');
  const props = getFeatureProps(input);
  if (props) {
    const sfLink = props['sampledFeature@link'];
    if (sfLink === undefined || sfLink === null)
      errors.push({
        severity: 'error',
        path: 'SamplingFeature.properties.sampledFeature@link',
        message: 'Required: sampledFeature@link (link with href)',
      });
    else
      errors.push(
        ...validateLink(
          sfLink,
          'SamplingFeature.properties.sampledFeature@link'
        )
      );
  }
  return errors;
}

/**
 * Validates a Property resource against OGC Part 1 requirements.
 *
 * Properties are NOT GeoJSON Features. Checks: uniqueId (URI), label, baseProperty (URI).
 *
 * @param input - A candidate Property resource object.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-001/23-001.html
 */
export function validateProperty(input: unknown): ValidationError[] {
  if (typeof input !== 'object' || input === null)
    return [
      { severity: 'error', path: 'Property', message: 'Expected a non-null object' },
    ];
  const errors: ValidationError[] = [];
  const obj = input as Record<string, unknown>;
  if (typeof obj.label !== 'string' || obj.label.length === 0)
    errors.push({
      severity: 'error',
      path: 'Property.label',
      message: 'Required: label (non-empty string)',
    });
  if (typeof obj.uniqueId !== 'string' || obj.uniqueId.length === 0)
    errors.push({
      severity: 'error',
      path: 'Property.uniqueId',
      message: 'Required: uniqueId (URI)',
    });
  else errors.push(...validateUri(obj.uniqueId, 'Property.uniqueId'));
  if (typeof obj.baseProperty !== 'string' || obj.baseProperty.length === 0)
    errors.push({
      severity: 'error',
      path: 'Property.baseProperty',
      message: 'Required: baseProperty (URI)',
    });
  else errors.push(...validateUri(obj.baseProperty, 'Property.baseProperty'));
  return errors;
}

// ========================================
// Part 2 Resource Validation
// ========================================

/**
 * Validates a Datastream resource against OGC Part 2 requirements.
 *
 * Checks: name required, schema (SWE DataComponent) present (structural check only).
 *
 * @param input - A candidate Datastream resource object.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-002/23-002.html
 */
export function validateDatastream(input: unknown): ValidationError[] {
  if (typeof input !== 'object' || input === null)
    return [
      {
        severity: 'error',
        path: 'Datastream',
        message: 'Expected a non-null object',
      },
    ];
  const errors: ValidationError[] = [];
  const obj = input as Record<string, unknown>;
  if (typeof obj.name !== 'string' || obj.name.length === 0)
    errors.push({
      severity: 'error',
      path: 'Datastream.name',
      message: 'Required: name (non-empty string)',
    });
  const schema = obj.schema ?? obj.resultSchema;
  if (schema === undefined || schema === null || typeof schema !== 'object')
    errors.push({
      severity: 'error',
      path: 'Datastream.schema',
      message: 'Required: schema (SWE DataComponent object)',
    });
  return errors;
}

/**
 * Validates an Observation resource against OGC Part 2 requirements.
 *
 * Checks: phenomenonTime present, result structure exists.
 *
 * @param input - A candidate Observation resource object.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-002/23-002.html
 */
export function validateObservation(input: unknown): ValidationError[] {
  if (typeof input !== 'object' || input === null)
    return [
      {
        severity: 'error',
        path: 'Observation',
        message: 'Expected a non-null object',
      },
    ];
  const errors: ValidationError[] = [];
  const obj = input as Record<string, unknown>;
  if (obj.phenomenonTime === undefined || obj.phenomenonTime === null)
    errors.push({
      severity: 'error',
      path: 'Observation.phenomenonTime',
      message: 'Required: phenomenonTime',
    });
  else if (typeof obj.phenomenonTime === 'string')
    errors.push(
      ...validateIsoDateTime(
        obj.phenomenonTime,
        'Observation.phenomenonTime'
      )
    );
  if (!('result' in obj) || obj.result === undefined)
    errors.push({
      severity: 'error',
      path: 'Observation.result',
      message: 'Required: result',
    });
  return errors;
}

/**
 * Validates a ControlStream resource against OGC Part 2 requirements.
 *
 * Checks: name required, schema present (structural check only).
 *
 * @param input - A candidate ControlStream resource object.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-002/23-002.html
 */
export function validateControlStream(input: unknown): ValidationError[] {
  if (typeof input !== 'object' || input === null)
    return [
      {
        severity: 'error',
        path: 'ControlStream',
        message: 'Expected a non-null object',
      },
    ];
  const errors: ValidationError[] = [];
  const obj = input as Record<string, unknown>;
  if (typeof obj.name !== 'string' || obj.name.length === 0)
    errors.push({
      severity: 'error',
      path: 'ControlStream.name',
      message: 'Required: name (non-empty string)',
    });
  const schema = obj.schema ?? obj.commandSchema;
  if (schema === undefined || schema === null || typeof schema !== 'object')
    errors.push({
      severity: 'error',
      path: 'ControlStream.schema',
      message: 'Required: schema (SWE DataComponent object)',
    });
  return errors;
}

/**
 * Validates a Command resource against OGC Part 2 requirements.
 *
 * Checks: parameters structure exists (non-null object).
 *
 * @param input - A candidate Command resource object.
 * @returns Array of validation errors (empty if valid).
 * @see https://docs.ogc.org/is/23-002/23-002.html
 */
export function validateCommand(input: unknown): ValidationError[] {
  if (typeof input !== 'object' || input === null)
    return [
      {
        severity: 'error',
        path: 'Command',
        message: 'Expected a non-null object',
      },
    ];
  const errors: ValidationError[] = [];
  const obj = input as Record<string, unknown>;
  if (
    !('parameters' in obj) ||
    typeof obj.parameters !== 'object' ||
    obj.parameters === null
  )
    errors.push({
      severity: 'error',
      path: 'Command.parameters',
      message: 'Required: parameters (non-null object)',
    });
  return errors;
}
