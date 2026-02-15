import type { BoundingBox } from '../../shared/models.js';
import type { CsapiDateTimeParameter } from './model.js';
import type { ValidationError } from './helpers.js';
import {
  formatDateTimeParameter,
  isValidResourceType,
  assertValidResourceType,
  encodeResourceId,
  scanCsapiLinks,
  validateLimit,
  validateBbox,
  validateUri,
  validateLink,
  validateIsoDateTime,
  validateTimePeriod,
  validateSystem,
  validateDeployment,
  validateProcedure,
  validateSamplingFeature,
  validateProperty,
  validateDatastream,
  validateObservation,
  validateControlStream,
  validateCommand,
} from './helpers.js';

// ========================================
// Temporal Encoding
// ========================================

describe('formatDateTimeParameter', () => {
  const toDate = (str: string) => new Date(str);

  it('serializes a plain Date', () => {
    const result = formatDateTimeParameter(toDate('2024-01-01T00:00:00Z'));
    expect(result).toBe('2024-01-01T00:00:00.000Z');
  });

  it('serializes with only start (open-ended range)', () => {
    const result = formatDateTimeParameter({
      start: toDate('2024-01-01T00:00:00Z'),
    });
    expect(result).toBe('2024-01-01T00:00:00.000Z/..');
  });

  it('serializes with only end (open-ended range)', () => {
    const result = formatDateTimeParameter({
      end: toDate('2024-12-31T23:59:59Z'),
    });
    expect(result).toBe('../2024-12-31T23:59:59.000Z');
  });

  it('serializes start and end interval', () => {
    const result = formatDateTimeParameter({
      start: toDate('2024-01-01T00:00:00Z'),
      end: toDate('2024-12-31T23:59:59Z'),
    });
    expect(result).toBe(
      '2024-01-01T00:00:00.000Z/2024-12-31T23:59:59.000Z'
    );
  });

  it('passes through the "latest" keyword', () => {
    const result = formatDateTimeParameter('latest');
    expect(result).toBe('latest');
  });

  it('throws for an invalid parameter', () => {
    expect(() =>
      formatDateTimeParameter({} as CsapiDateTimeParameter)
    ).toThrow('Invalid CsapiDateTimeParameter');
  });
});

// ========================================
// Resource Type Validation
// ========================================

describe('isValidResourceType', () => {
  it('returns true for all 9 valid resource types', () => {
    const validTypes = [
      'systems',
      'deployments',
      'samplingFeatures',
      'procedures',
      'properties',
      'datastreams',
      'observations',
      'controlStreams',
      'commands',
    ];
    validTypes.forEach((type) => {
      expect(isValidResourceType(type)).toBe(true);
    });
  });

  it('returns false for invalid resource types', () => {
    expect(isValidResourceType('sensors')).toBe(false);
    expect(isValidResourceType('System')).toBe(false);
    expect(isValidResourceType('')).toBe(false);
    expect(isValidResourceType('SYSTEMS')).toBe(false);
  });
});

describe('assertValidResourceType', () => {
  it('does not throw for valid resource types', () => {
    expect(() => assertValidResourceType('systems')).not.toThrow();
    expect(() => assertValidResourceType('observations')).not.toThrow();
  });

  it('throws with descriptive message for invalid types', () => {
    expect(() => assertValidResourceType('invalid')).toThrow(
      'Invalid CSAPI resource type: "invalid"'
    );
    expect(() => assertValidResourceType('invalid')).toThrow(
      'Valid types are:'
    );
  });
});

// ========================================
// URL Encoding
// ========================================

describe('encodeResourceId', () => {
  it('encodes a simple ID unchanged', () => {
    expect(encodeResourceId('sys-001')).toBe('sys-001');
  });

  it('encodes spaces', () => {
    expect(encodeResourceId('my system')).toBe('my%20system');
  });

  it('encodes slashes', () => {
    expect(encodeResourceId('org/sys/001')).toBe('org%2Fsys%2F001');
  });

  it('encodes colons and special characters', () => {
    expect(encodeResourceId('urn:example:sensor:001')).toBe(
      'urn%3Aexample%3Asensor%3A001'
    );
  });

  it('encodes hash and query characters', () => {
    expect(encodeResourceId('id#1?v=2')).toBe('id%231%3Fv%3D2');
  });
});

// ========================================
// Link Scanning
// ========================================

describe('scanCsapiLinks', () => {
  it('returns empty map for empty links array', () => {
    expect(scanCsapiLinks([])).toEqual(new Map());
  });

  it('returns empty map for non-array input', () => {
    expect(scanCsapiLinks(null as unknown as [])).toEqual(new Map());
  });

  it('detects ogc-cs: prefixed link relations', () => {
    const links = [
      { rel: 'ogc-cs:systems', href: 'http://example.com/api/systems' },
      { rel: 'ogc-cs:deployments', href: 'http://example.com/api/deployments' },
    ];
    const result = scanCsapiLinks(links);
    expect(result.size).toBe(2);
    expect(result.get('systems')).toBe('http://example.com/api/systems');
    expect(result.get('deployments')).toBe('http://example.com/api/deployments');
  });

  it('detects plain resource name link relations', () => {
    const links = [
      { rel: 'systems', href: 'http://example.com/api/systems' },
      { rel: 'datastreams', href: 'http://example.com/api/datastreams' },
    ];
    const result = scanCsapiLinks(links);
    expect(result.size).toBe(2);
    expect(result.get('systems')).toBe('http://example.com/api/systems');
    expect(result.get('datastreams')).toBe('http://example.com/api/datastreams');
  });

  it('detects items links with resource type in href', () => {
    const links = [
      { rel: 'items', href: 'http://example.com/api/systems' },
      { rel: 'items', href: 'http://example.com/api/observations/' },
    ];
    const result = scanCsapiLinks(links);
    expect(result.size).toBe(2);
    expect(result.get('systems')).toBe('http://example.com/api/systems');
    expect(result.get('observations')).toBe('http://example.com/api/observations/');
  });

  it('handles mixed conventions in the same links array', () => {
    const links = [
      { rel: 'ogc-cs:systems', href: 'http://example.com/api/systems' },
      { rel: 'deployments', href: 'http://example.com/api/deployments' },
      { rel: 'items', href: 'http://example.com/api/procedures' },
      { rel: 'self', href: 'http://example.com/api' },
    ];
    const result = scanCsapiLinks(links);
    expect(result.size).toBe(3);
    expect(result.has('systems')).toBe(true);
    expect(result.has('deployments')).toBe(true);
    expect(result.has('procedures')).toBe(true);
  });

  it('ignores links without string rel', () => {
    const links = [
      { href: 'http://example.com/api/systems' },
      { rel: 123, href: 'http://example.com/api/systems' },
    ] as unknown as Array<{ rel?: string; href?: string }>;
    expect(scanCsapiLinks(links)).toEqual(new Map());
  });

  it('ignores items links with non-resource-type href', () => {
    const links = [
      { rel: 'items', href: 'http://example.com/api/widgets' },
    ];
    expect(scanCsapiLinks(links)).toEqual(new Map());
  });

  it('strips query parameters from items href before matching', () => {
    const links = [
      { rel: 'items', href: '/systems?f=application/json' },
      { rel: 'items', href: '/deployments?f=application/json' },
    ];
    const result = scanCsapiLinks(links);
    expect(result.size).toBe(2);
    expect(result.get('systems')).toBe('/systems?f=application/json');
    expect(result.get('deployments')).toBe('/deployments?f=application/json');
  });

  it('strips query parameters and trailing slashes from items href', () => {
    const links = [
      { rel: 'items', href: '/procedures/?f=application/json' },
    ];
    const result = scanCsapiLinks(links);
    expect(result.size).toBe(1);
    expect(result.get('procedures')).toBe('/procedures/?f=application/json');
  });

  it('normalizes featuresOfInterest to samplingFeatures in items href', () => {
    const links = [
      { rel: 'items', href: '/featuresOfInterest' },
    ];
    const result = scanCsapiLinks(links);
    expect(result.size).toBe(1);
    expect(result.get('samplingFeatures')).toBe('/featuresOfInterest');
  });

  it('normalizes featuresOfInterest with query params to samplingFeatures', () => {
    const links = [
      { rel: 'items', href: '/featuresOfInterest?f=application/json' },
    ];
    const result = scanCsapiLinks(links);
    expect(result.size).toBe(1);
    expect(result.get('samplingFeatures')).toBe('/featuresOfInterest?f=application/json');
  });
});

// ========================================
// Parameter Validation
// ========================================

describe('validateLimit', () => {
  it('accepts positive integers', () => {
    expect(() => validateLimit(1)).not.toThrow();
    expect(() => validateLimit(100)).not.toThrow();
    expect(() => validateLimit(10000)).not.toThrow();
  });

  it('rejects zero', () => {
    expect(() => validateLimit(0)).toThrow('Must be a positive integer');
  });

  it('rejects negative numbers', () => {
    expect(() => validateLimit(-5)).toThrow('Must be a positive integer');
  });

  it('rejects non-integer numbers', () => {
    expect(() => validateLimit(1.5)).toThrow('Must be a positive integer');
  });

  it('rejects NaN', () => {
    expect(() => validateLimit(NaN)).toThrow('Must be a positive integer');
  });
});

describe('validateBbox', () => {
  it('accepts a valid bounding box', () => {
    expect(() => validateBbox([0, 0, 10, 10])).not.toThrow();
  });

  it('accepts equal min/max (point bbox)', () => {
    expect(() => validateBbox([5, 5, 5, 5])).not.toThrow();
  });

  it('accepts negative coordinates', () => {
    expect(() => validateBbox([-180, -90, 180, 90])).not.toThrow();
  });

  it('rejects when minx > maxx', () => {
    expect(() => validateBbox([10, 0, 5, 10] as BoundingBox)).toThrow(
      'minx (10) must be ≤ maxx (5)'
    );
  });

  it('rejects when miny > maxy', () => {
    expect(() => validateBbox([0, 10, 10, 5] as BoundingBox)).toThrow(
      'miny (10) must be ≤ maxy (5)'
    );
  });

  it('rejects non-finite coordinates', () => {
    expect(() =>
      validateBbox([0, 0, Infinity, 10] as BoundingBox)
    ).toThrow('finite numbers');
  });

  it('rejects NaN coordinates', () => {
    expect(() => validateBbox([NaN, 0, 10, 10] as BoundingBox)).toThrow(
      'finite numbers'
    );
  });
});

// ========================================
// Cross-Reference Validation
// ========================================

describe('validateUri', () => {
  it('accepts valid URIs', () => {
    expect(validateUri('urn:test:1', 'test')).toEqual([]);
    expect(validateUri('http://example.com', 'test')).toEqual([]);
    expect(validateUri('sosa:Sensor', 'test')).toEqual([]);
  });

  it('rejects non-string values', () => {
    expect(validateUri(42, 'test')).toHaveLength(1);
    expect(validateUri(null, 'test')).toHaveLength(1);
  });

  it('rejects empty strings', () => {
    expect(validateUri('', 'test')).toHaveLength(1);
  });

  it('rejects strings without a URI scheme', () => {
    const errors = validateUri('no-scheme', 'test');
    expect(errors).toHaveLength(1);
    expect(errors[0].path).toBe('test');
    expect(errors[0].message).toContain('missing scheme');
  });
});

describe('validateLink', () => {
  it('accepts a valid link', () => {
    expect(
      validateLink({ href: 'http://example.com', rel: 'self' }, 'link')
    ).toEqual([]);
  });

  it('rejects non-object values', () => {
    expect(validateLink(null, 'link')).toHaveLength(1);
    expect(validateLink('string', 'link')).toHaveLength(1);
  });

  it('rejects missing href', () => {
    const errors = validateLink({ rel: 'self' }, 'link');
    expect(errors.some((e) => e.path === 'link.href')).toBe(true);
  });

  it('rejects empty rel when present', () => {
    const errors = validateLink(
      { href: 'http://example.com', rel: '' },
      'link'
    );
    expect(errors.some((e) => e.path === 'link.rel')).toBe(true);
  });

  it('accepts link without rel', () => {
    expect(validateLink({ href: 'http://example.com' }, 'link')).toEqual([]);
  });
});

describe('validateIsoDateTime', () => {
  it('accepts valid ISO 8601 strings', () => {
    expect(validateIsoDateTime('2026-01-01T00:00:00Z', 'dt')).toEqual([]);
  });

  it('rejects non-string values', () => {
    expect(validateIsoDateTime(42, 'dt')).toHaveLength(1);
    expect(validateIsoDateTime(null, 'dt')).toHaveLength(1);
  });

  it('rejects empty strings', () => {
    expect(validateIsoDateTime('', 'dt')).toHaveLength(1);
  });

  it('rejects invalid date strings', () => {
    const errors = validateIsoDateTime('not-a-date', 'dt');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('not-a-date');
  });
});

describe('validateTimePeriod', () => {
  it('accepts array format with two ISO dates', () => {
    expect(
      validateTimePeriod(
        ['2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z'],
        'tp'
      )
    ).toEqual([]);
  });

  it('accepts array format with "now" end sentinel', () => {
    expect(
      validateTimePeriod(['2026-01-01T00:00:00Z', 'now'], 'tp')
    ).toEqual([]);
  });

  it('accepts object format with Date instances', () => {
    expect(
      validateTimePeriod({ start: new Date('2026-01-01') }, 'tp')
    ).toEqual([]);
  });

  it('rejects null and undefined', () => {
    expect(validateTimePeriod(null, 'tp')).toHaveLength(1);
    expect(validateTimePeriod(undefined, 'tp')).toHaveLength(1);
  });

  it('rejects array with wrong length', () => {
    expect(validateTimePeriod(['2026-01-01T00:00:00Z'], 'tp')).toHaveLength(1);
  });

  it('reports end before start', () => {
    const errors = validateTimePeriod(
      ['2027-01-01T00:00:00Z', '2026-01-01T00:00:00Z'],
      'tp'
    );
    expect(errors.some((e) => e.message.includes('before start'))).toBe(true);
  });

  it('rejects object without start', () => {
    const errors = validateTimePeriod({ end: '2027-01-01T00:00:00Z' }, 'tp');
    expect(errors.some((e) => e.path.includes('start'))).toBe(true);
  });

  it('rejects invalid start in array', () => {
    expect(validateTimePeriod(['invalid', 'now'], 'tp')).toHaveLength(1);
  });
});

// ========================================
// Part 1 Resource Validation
// ========================================

/** Helper: builds a minimal valid GeoJSON Feature for testing. */
function makeFeature(
  props: Record<string, unknown>,
  extra: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    type: 'Feature',
    id: 'test1',
    properties: props,
    geometry: null,
    links: [],
    ...extra,
  };
}

describe('validateSystem', () => {
  it('returns empty array for valid System (CURIE)', () => {
    expect(
      validateSystem(
        makeFeature({
          featureType: 'sosa:Sensor',
          uid: 'urn:test:1',
          name: 'Test',
        })
      )
    ).toEqual([]);
  });

  it('accepts full URI featureType', () => {
    expect(
      validateSystem(
        makeFeature({
          featureType: 'http://www.w3.org/ns/sosa/Platform',
          uid: 'urn:test:1',
          name: 'Test',
        })
      )
    ).toEqual([]);
  });

  it('reports invalid featureType', () => {
    const errors = validateSystem(
      makeFeature({
        featureType: 'sosa:Deployment',
        uid: 'urn:test:1',
        name: 'Test',
      })
    );
    expect(
      errors.some((e) => e.message.includes('not a valid System type'))
    ).toBe(true);
  });

  it('reports missing uid', () => {
    const errors = validateSystem(
      makeFeature({ featureType: 'sosa:Sensor', name: 'Test' })
    );
    expect(errors.some((e) => e.path.includes('uid'))).toBe(true);
  });

  it('reports malformed uid', () => {
    const errors = validateSystem(
      makeFeature({
        featureType: 'sosa:Sensor',
        uid: 'not-a-uri',
        name: 'Test',
      })
    );
    expect(errors.some((e) => e.message.includes('missing scheme'))).toBe(
      true
    );
  });

  it('reports missing name', () => {
    const errors = validateSystem(
      makeFeature({ featureType: 'sosa:Sensor', uid: 'urn:test:1' })
    );
    expect(errors.some((e) => e.path.includes('name'))).toBe(true);
  });

  it('reports missing properties object', () => {
    const errors = validateSystem({ type: 'Feature' });
    expect(
      errors.some((e) => e.message.includes('properties object'))
    ).toBe(true);
  });
});

describe('validateDeployment', () => {
  it('returns empty array for valid Deployment', () => {
    expect(
      validateDeployment(
        makeFeature({
          featureType: 'sosa:Deployment',
          uid: 'urn:test:1',
          name: 'Test',
          validTime: ['2026-01-01T00:00:00Z', 'now'],
        })
      )
    ).toEqual([]);
  });

  it('reports invalid featureType', () => {
    const errors = validateDeployment(
      makeFeature({
        featureType: 'sosa:Sensor',
        uid: 'urn:test:1',
        name: 'Test',
        validTime: ['2026-01-01T00:00:00Z', 'now'],
      })
    );
    expect(
      errors.some((e) => e.message.includes('not a valid Deployment type'))
    ).toBe(true);
  });

  it('reports missing validTime', () => {
    const errors = validateDeployment(
      makeFeature({
        featureType: 'sosa:Deployment',
        uid: 'urn:test:1',
        name: 'Test',
      })
    );
    expect(errors.some((e) => e.path.includes('validTime'))).toBe(true);
  });

  it('reports invalid validTime', () => {
    const errors = validateDeployment(
      makeFeature({
        featureType: 'sosa:Deployment',
        uid: 'urn:test:1',
        name: 'Test',
        validTime: ['bad-date', 'now'],
      })
    );
    expect(errors.some((e) => e.path.includes('validTime'))).toBe(true);
  });

  it('accepts full URI featureType', () => {
    expect(
      validateDeployment(
        makeFeature({
          featureType: 'http://www.w3.org/ns/sosa/Deployment',
          uid: 'urn:test:1',
          name: 'Test',
          validTime: ['2026-01-01T00:00:00Z', 'now'],
        })
      )
    ).toEqual([]);
  });
});

describe('validateProcedure', () => {
  it('returns empty array for valid Procedure', () => {
    expect(
      validateProcedure(
        makeFeature({
          featureType: 'sosa:Procedure',
          uid: 'urn:test:1',
          name: 'Test',
        })
      )
    ).toEqual([]);
  });

  it('accepts Procedure subtypes', () => {
    expect(
      validateProcedure(
        makeFeature({
          featureType: 'sosa:ObservingProcedure',
          uid: 'urn:test:1',
          name: 'Test',
        })
      )
    ).toEqual([]);
    expect(
      validateProcedure(
        makeFeature({
          featureType:
            'http://www.w3.org/ns/sosa/ActuatingProcedure',
          uid: 'urn:test:1',
          name: 'Test',
        })
      )
    ).toEqual([]);
  });

  it('reports invalid featureType', () => {
    const errors = validateProcedure(
      makeFeature({
        featureType: 'sosa:Sensor',
        uid: 'urn:test:1',
        name: 'Test',
      })
    );
    expect(
      errors.some((e) => e.message.includes('not a valid Procedure type'))
    ).toBe(true);
  });
});

describe('validateSamplingFeature', () => {
  it('returns empty array for valid SamplingFeature', () => {
    expect(
      validateSamplingFeature(
        makeFeature({
          featureType: 'sosa:SamplingFeature',
          uid: 'urn:test:1',
          name: 'Test',
          'sampledFeature@link': { href: 'http://example.com/feature/1' },
        })
      )
    ).toEqual([]);
  });

  it('reports missing sampledFeature@link', () => {
    const errors = validateSamplingFeature(
      makeFeature({
        featureType: 'sosa:SamplingFeature',
        uid: 'urn:test:1',
        name: 'Test',
      })
    );
    expect(
      errors.some((e) => e.path.includes('sampledFeature@link'))
    ).toBe(true);
  });

  it('reports invalid sampledFeature@link (missing href)', () => {
    const errors = validateSamplingFeature(
      makeFeature({
        featureType: 'sosa:SamplingFeature',
        uid: 'urn:test:1',
        name: 'Test',
        'sampledFeature@link': { title: 'No href' },
      })
    );
    expect(errors.some((e) => e.path.includes('href'))).toBe(true);
  });
});

describe('validateProperty', () => {
  it('returns empty array for valid Property', () => {
    expect(
      validateProperty({
        label: 'Temperature',
        uniqueId: 'urn:test:prop:1',
        baseProperty: 'http://example.com/prop',
      })
    ).toEqual([]);
  });

  it('reports missing label', () => {
    const errors = validateProperty({
      uniqueId: 'urn:test:1',
      baseProperty: 'http://example.com/prop',
    });
    expect(errors.some((e) => e.path.includes('label'))).toBe(true);
  });

  it('reports missing uniqueId', () => {
    const errors = validateProperty({
      label: 'Temp',
      baseProperty: 'http://example.com/prop',
    });
    expect(errors.some((e) => e.path.includes('uniqueId'))).toBe(true);
  });

  it('reports invalid uniqueId (not a URI)', () => {
    const errors = validateProperty({
      label: 'Temp',
      uniqueId: 'not-a-uri',
      baseProperty: 'http://example.com/prop',
    });
    expect(errors.some((e) => e.message.includes('missing scheme'))).toBe(
      true
    );
  });

  it('reports missing baseProperty', () => {
    const errors = validateProperty({
      label: 'Temp',
      uniqueId: 'urn:test:1',
    });
    expect(errors.some((e) => e.path.includes('baseProperty'))).toBe(true);
  });

  it('reports invalid baseProperty (not a URI)', () => {
    const errors = validateProperty({
      label: 'Temp',
      uniqueId: 'urn:test:1',
      baseProperty: 'not-a-uri',
    });
    expect(errors.some((e) => e.message.includes('missing scheme'))).toBe(
      true
    );
  });

  it('reports multiple errors at once', () => {
    const errors = validateProperty({});
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });
});

// ========================================
// Part 2 Resource Validation
// ========================================

describe('validateDatastream', () => {
  it('returns empty array for valid Datastream', () => {
    expect(
      validateDatastream({ name: 'Weather', schema: { type: 'DataRecord' } })
    ).toEqual([]);
  });

  it('reports missing name', () => {
    const errors = validateDatastream({ schema: { type: 'DataRecord' } });
    expect(errors.some((e) => e.path.includes('name'))).toBe(true);
  });

  it('reports missing schema', () => {
    const errors = validateDatastream({ name: 'Weather' });
    expect(errors.some((e) => e.path.includes('schema'))).toBe(true);
  });

  it('rejects null input', () => {
    expect(validateDatastream(null)).toHaveLength(1);
  });

  it('accepts resultSchema as alternative to schema', () => {
    expect(
      validateDatastream({
        name: 'Weather',
        resultSchema: { type: 'DataRecord' },
      })
    ).toEqual([]);
  });
});

describe('validateObservation', () => {
  it('returns empty array for valid Observation', () => {
    expect(
      validateObservation({
        phenomenonTime: '2026-01-01T00:00:00Z',
        result: { value: 42 },
      })
    ).toEqual([]);
  });

  it('reports missing phenomenonTime', () => {
    const errors = validateObservation({ result: { value: 42 } });
    expect(errors.some((e) => e.path.includes('phenomenonTime'))).toBe(true);
  });

  it('reports invalid phenomenonTime', () => {
    const errors = validateObservation({
      phenomenonTime: 'not-a-date',
      result: { value: 42 },
    });
    expect(errors.some((e) => e.message.includes('not-a-date'))).toBe(true);
  });

  it('reports missing result', () => {
    const errors = validateObservation({
      phenomenonTime: '2026-01-01T00:00:00Z',
    });
    expect(errors.some((e) => e.path.includes('result'))).toBe(true);
  });
});

describe('validateControlStream', () => {
  it('returns empty array for valid ControlStream', () => {
    expect(
      validateControlStream({
        name: 'Motor Control',
        schema: { type: 'DataRecord' },
      })
    ).toEqual([]);
  });

  it('reports missing name', () => {
    const errors = validateControlStream({ schema: { type: 'DataRecord' } });
    expect(errors.some((e) => e.path.includes('name'))).toBe(true);
  });

  it('reports missing schema', () => {
    const errors = validateControlStream({ name: 'Motor Control' });
    expect(errors.some((e) => e.path.includes('schema'))).toBe(true);
  });

  it('accepts commandSchema as alternative', () => {
    expect(
      validateControlStream({
        name: 'Motor Control',
        commandSchema: { type: 'DataRecord' },
      })
    ).toEqual([]);
  });
});

describe('validateCommand', () => {
  it('returns empty array for valid Command', () => {
    expect(validateCommand({ parameters: { speed: 100 } })).toEqual([]);
  });

  it('reports missing parameters', () => {
    const errors = validateCommand({});
    expect(errors.some((e) => e.path.includes('parameters'))).toBe(true);
  });

  it('reports null parameters', () => {
    const errors = validateCommand({ parameters: null });
    expect(errors.some((e) => e.path.includes('parameters'))).toBe(true);
  });
});

// ========================================
// Error Reporting
// ========================================

describe('validation error reporting', () => {
  it('collects multiple errors in a single validation pass', () => {
    const errors = validateSystem(
      makeFeature({ featureType: 'invalid', uid: '', name: '' })
    );
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('includes property path in each error', () => {
    const errors = validateDeployment(
      makeFeature({
        featureType: 'sosa:Deployment',
        uid: 'urn:test:1',
        name: 'Test',
      })
    );
    const vtError = errors.find((e) => e.path.includes('validTime'));
    expect(vtError).toBeDefined();
    expect(vtError!.path).toBe('Deployment.properties.validTime');
  });

  it('includes expected values in error messages', () => {
    const errors = validateProperty({
      label: 'Temp',
      uniqueId: 'bad',
      baseProperty: 'http://example.com/prop',
    });
    const uriErr = errors.find((e) => e.path === 'Property.uniqueId');
    expect(uriErr).toBeDefined();
    expect(uriErr!.message).toContain('bad');
  });
});
