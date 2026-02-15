import {
  isCSAPIFeature,
  getCSAPIResourceType,
  parseValidTime,
  isValidUri,
  validateCSAPIFeature,
  extractCSAPIFeature,
  SOSA_NS,
  SENSORML_NS,
} from './geojson.js';
import type { ValidationError } from '../helpers.js';

// ========================================
// Test Fixtures
// ========================================

/** Builds a minimal GeoJSON Feature for testing. */
function makeFeature(
  featureType: string,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  const {
    uid = 'urn:x-test:feature:1',
    name = 'Test Feature',
    id = 'abc123',
    geometry,
    links = [],
    ...extraProps
  } = overrides;
  return {
    type: 'Feature',
    id,
    geometry: geometry !== undefined ? geometry : null,
    properties: {
      featureType,
      uid,
      name,
      ...extraProps,
    },
    links,
  };
}

// ========================================
// isCSAPIFeature
// ========================================

describe('isCSAPIFeature', () => {
  it('returns true for System subtypes (compact CURIE)', () => {
    for (const name of ['System', 'Sensor', 'Actuator', 'Platform', 'Sampler']) {
      expect(isCSAPIFeature(makeFeature(`sosa:${name}`))).toBe(true);
    }
  });

  it('returns true for System subtypes (full URI)', () => {
    for (const name of ['System', 'Sensor', 'Actuator', 'Platform', 'Sampler']) {
      expect(isCSAPIFeature(makeFeature(`${SOSA_NS}${name}`))).toBe(true);
    }
  });

  it('returns true for Deployment', () => {
    expect(isCSAPIFeature(makeFeature('sosa:Deployment'))).toBe(true);
    expect(isCSAPIFeature(makeFeature(`${SOSA_NS}Deployment`))).toBe(true);
  });

  it('returns true for Procedure subtypes', () => {
    for (const name of [
      'Procedure',
      'ObservingProcedure',
      'SamplingProcedure',
      'ActuatingProcedure',
    ]) {
      expect(isCSAPIFeature(makeFeature(`sosa:${name}`))).toBe(true);
      expect(isCSAPIFeature(makeFeature(`${SOSA_NS}${name}`))).toBe(true);
    }
  });

  it('returns true for SamplingFeature', () => {
    expect(isCSAPIFeature(makeFeature('sosa:SamplingFeature'))).toBe(true);
    expect(isCSAPIFeature(makeFeature(`${SOSA_NS}SamplingFeature`))).toBe(true);
    expect(isCSAPIFeature(makeFeature(`${SOSA_NS}Sample`))).toBe(true);
  });

  it('returns false for non-SOSA URIs', () => {
    expect(
      isCSAPIFeature(
        makeFeature(
          'http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_SamplingPoint'
        )
      )
    ).toBe(false);
  });

  it('returns false for missing featureType', () => {
    expect(
      isCSAPIFeature({
        type: 'Feature',
        properties: { uid: 'urn:x:1', name: 'Test' },
      })
    ).toBe(false);
  });

  it('returns false for non-object input', () => {
    expect(isCSAPIFeature(null)).toBe(false);
    expect(isCSAPIFeature(undefined)).toBe(false);
    expect(isCSAPIFeature('string')).toBe(false);
    expect(isCSAPIFeature(42)).toBe(false);
  });

  it('returns false for missing properties object', () => {
    expect(isCSAPIFeature({ type: 'Feature' })).toBe(false);
    expect(isCSAPIFeature({ type: 'Feature', properties: null })).toBe(false);
  });

  it('returns false for unrecognized SOSA local name', () => {
    expect(isCSAPIFeature(makeFeature('sosa:UnknownType'))).toBe(false);
  });

  it('returns true for SensorML Feature featureType', () => {
    expect(
      isCSAPIFeature(makeFeature(`${SENSORML_NS}Feature`))
    ).toBe(true);
  });

  it('returns false for unrecognized SensorML local name', () => {
    expect(
      isCSAPIFeature(makeFeature(`${SENSORML_NS}UnknownThing`))
    ).toBe(false);
  });
});

// ========================================
// getCSAPIResourceType
// ========================================

describe('getCSAPIResourceType', () => {
  it('classifies System subtypes correctly', () => {
    expect(getCSAPIResourceType(makeFeature('sosa:Sensor'))).toBe('System');
    expect(getCSAPIResourceType(makeFeature('sosa:Actuator'))).toBe('System');
    expect(getCSAPIResourceType(makeFeature('sosa:Platform'))).toBe('System');
    expect(getCSAPIResourceType(makeFeature('sosa:Sampler'))).toBe('System');
    expect(getCSAPIResourceType(makeFeature('sosa:System'))).toBe('System');
  });

  it('classifies System subtypes with full URI', () => {
    expect(getCSAPIResourceType(makeFeature(`${SOSA_NS}Sensor`))).toBe('System');
    expect(getCSAPIResourceType(makeFeature(`${SOSA_NS}Platform`))).toBe(
      'System'
    );
  });

  it('classifies Deployment', () => {
    expect(getCSAPIResourceType(makeFeature('sosa:Deployment'))).toBe(
      'Deployment'
    );
    expect(getCSAPIResourceType(makeFeature(`${SOSA_NS}Deployment`))).toBe(
      'Deployment'
    );
  });

  it('classifies Procedure subtypes', () => {
    expect(getCSAPIResourceType(makeFeature('sosa:Procedure'))).toBe(
      'Procedure'
    );
    expect(getCSAPIResourceType(makeFeature('sosa:ObservingProcedure'))).toBe(
      'Procedure'
    );
    expect(getCSAPIResourceType(makeFeature('sosa:SamplingProcedure'))).toBe(
      'Procedure'
    );
    expect(getCSAPIResourceType(makeFeature('sosa:ActuatingProcedure'))).toBe(
      'Procedure'
    );
  });

  it('classifies SamplingFeature', () => {
    expect(getCSAPIResourceType(makeFeature('sosa:SamplingFeature'))).toBe(
      'SamplingFeature'
    );
    expect(getCSAPIResourceType(makeFeature(`${SOSA_NS}Sample`))).toBe(
      'SamplingFeature'
    );
  });

  it('returns null for non-SOSA featureType', () => {
    expect(getCSAPIResourceType(makeFeature('http://example.com/Type'))).toBe(
      null
    );
  });

  it('returns null for non-string featureType', () => {
    expect(
      getCSAPIResourceType({
        type: 'Feature',
        properties: { featureType: 42, uid: 'urn:x:1', name: 'Test' },
      })
    ).toBe(null);
  });

  it('returns null for null input', () => {
    expect(getCSAPIResourceType(null)).toBe(null);
  });

  it('prioritizes System over Procedure for shared SOSA names', () => {
    // The OGC spec ProcedureTypeUris includes System types; our
    // classification gives System priority.
    expect(getCSAPIResourceType(makeFeature('sosa:Sensor'))).toBe('System');
    expect(getCSAPIResourceType(makeFeature('sosa:Platform'))).toBe('System');
  });

  it('classifies SensorML Feature as SamplingFeature', () => {
    expect(
      getCSAPIResourceType(makeFeature(`${SENSORML_NS}Feature`))
    ).toBe('SamplingFeature');
  });

  it('returns null for unrecognized SensorML local name', () => {
    expect(
      getCSAPIResourceType(makeFeature(`${SENSORML_NS}UnknownThing`))
    ).toBe(null);
  });
});

// ========================================
// parseValidTime
// ========================================

describe('parseValidTime', () => {
  const iso = '2026-01-26T18:32:01.560Z';
  const isoEnd = '2027-06-15T00:00:00Z';

  it('parses array format with two ISO dates', () => {
    const result = parseValidTime([iso, isoEnd]);
    expect(result).toBeDefined();
    expect(result!.start).toEqual(new Date(iso));
    expect(result!.end).toEqual(new Date(isoEnd));
  });

  it('parses array format with "now" end sentinel', () => {
    const result = parseValidTime([iso, 'now']);
    expect(result).toBeDefined();
    expect(result!.start).toEqual(new Date(iso));
    expect(result!.end).toBeUndefined();
  });

  it('parses object format with Date instances', () => {
    const start = new Date(iso);
    const end = new Date(isoEnd);
    const result = parseValidTime({ start, end });
    expect(result).toBeDefined();
    expect(result!.start).toBe(start);
    expect(result!.end).toBe(end);
  });

  it('parses object format with string dates', () => {
    const result = parseValidTime({ start: iso, end: isoEnd });
    expect(result).toBeDefined();
    expect(result!.start).toEqual(new Date(iso));
    expect(result!.end).toEqual(new Date(isoEnd));
  });

  it('parses object format with "now" end', () => {
    const result = parseValidTime({ start: iso, end: 'now' });
    expect(result).toBeDefined();
    expect(result!.start).toEqual(new Date(iso));
    expect(result!.end).toBeUndefined();
  });

  it('returns undefined for null', () => {
    expect(parseValidTime(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(parseValidTime(undefined)).toBeUndefined();
  });

  it('returns undefined for invalid start date string', () => {
    expect(parseValidTime(['not-a-date', 'now'])).toBeUndefined();
  });

  it('returns undefined for invalid end date string', () => {
    expect(parseValidTime([iso, 'not-a-date'])).toBeUndefined();
  });

  it('returns undefined for array with wrong length', () => {
    expect(parseValidTime([iso])).toBeUndefined();
    expect(parseValidTime([iso, isoEnd, 'extra'])).toBeUndefined();
  });

  it('returns undefined for non-string array start', () => {
    expect(parseValidTime([123, 'now'])).toBeUndefined();
  });

  it('returns undefined for object with non-Date non-string start', () => {
    expect(parseValidTime({ start: 123 })).toBeUndefined();
  });

  it('returns undefined for plain string input', () => {
    expect(parseValidTime(iso)).toBeUndefined();
  });
});

// ========================================
// isValidUri
// ========================================

describe('isValidUri', () => {
  it('accepts urn: URIs', () => {
    expect(isValidUri('urn:x-test:feature:1')).toBe(true);
  });

  it('accepts http: and https: URIs', () => {
    expect(isValidUri('http://example.com/thing')).toBe(true);
    expect(isValidUri('https://example.com/thing')).toBe(true);
  });

  it('accepts sosa: CURIEs', () => {
    expect(isValidUri('sosa:Sensor')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidUri('')).toBe(false);
  });

  it('rejects strings without a scheme', () => {
    expect(isValidUri('no-scheme')).toBe(false);
    expect(isValidUri('/relative/path')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isValidUri(42)).toBe(false);
    expect(isValidUri(null)).toBe(false);
    expect(isValidUri(undefined)).toBe(false);
  });

  it('rejects scheme starting with digit', () => {
    expect(isValidUri('1http://example.com')).toBe(false);
  });
});

// ========================================
// validateCSAPIFeature
// ========================================

describe('validateCSAPIFeature', () => {
  it('returns empty array for valid System feature', () => {
    const feature = makeFeature('sosa:Sensor');
    expect(validateCSAPIFeature(feature)).toEqual([]);
  });

  it('returns empty array for valid Deployment with validTime', () => {
    const feature = makeFeature('sosa:Deployment', {
      validTime: ['2026-01-01T00:00:00Z', 'now'],
    });
    expect(validateCSAPIFeature(feature)).toEqual([]);
  });

  it('returns empty array for valid Procedure with null geometry', () => {
    const feature = makeFeature('sosa:Procedure', { geometry: null });
    expect(validateCSAPIFeature(feature)).toEqual([]);
  });

  it('returns empty array for valid SamplingFeature', () => {
    const feature = makeFeature('sosa:SamplingFeature', {
      'sampledFeature@link': { href: 'http://example.com/feature/1' },
    });
    expect(validateCSAPIFeature(feature)).toEqual([]);
  });

  it('returns empty array for valid SensorML SamplingFeature', () => {
    const feature = makeFeature(`${SENSORML_NS}Feature`, {
      'sampledFeature@link': { href: 'http://example.com/feature/1' },
    });
    expect(validateCSAPIFeature(feature)).toEqual([]);
  });

  it('reports missing featureType', () => {
    const feature = {
      type: 'Feature',
      properties: { uid: 'urn:x:1', name: 'Test' },
    };
    const errors = validateCSAPIFeature(feature);
    expect(errors.some((e) => e.message.includes('featureType'))).toBe(true);
  });

  it('reports unrecognized featureType vocabulary', () => {
    const feature = makeFeature('http://example.com/Unknown');
    const errors = validateCSAPIFeature(feature);
    expect(errors.some((e) => e.message.includes('Unrecognized featureType'))).toBe(
      true
    );
  });

  it('reports missing uid', () => {
    const feature = makeFeature('sosa:Sensor', { uid: '' });
    const errors = validateCSAPIFeature(feature);
    expect(errors.some((e) => e.path.includes('uid'))).toBe(true);
  });

  it('reports invalid uid (not a URI)', () => {
    const feature = makeFeature('sosa:Sensor', { uid: 'not-a-uri' });
    const errors = validateCSAPIFeature(feature);
    expect(errors.some((e) => e.message.includes('missing scheme'))).toBe(true);
  });

  it('reports missing name', () => {
    const feature = makeFeature('sosa:Sensor', { name: '' });
    const errors = validateCSAPIFeature(feature);
    expect(errors.some((e) => e.path.includes('name'))).toBe(true);
  });

  it('reports invalid validTime', () => {
    const feature = makeFeature('sosa:Sensor', { validTime: 'bad' });
    const errors = validateCSAPIFeature(feature);
    expect(errors.some((e) => e.path.includes('validTime'))).toBe(true);
  });

  it('reports Deployment missing validTime', () => {
    const feature = makeFeature('sosa:Deployment');
    const errors = validateCSAPIFeature(feature);
    expect(errors.some((e) => e.path.includes('validTime'))).toBe(true);
  });

  it('reports Procedure with non-null geometry', () => {
    const feature = makeFeature('sosa:Procedure', {
      geometry: { type: 'Point', coordinates: [0, 0] },
    });
    const errors = validateCSAPIFeature(feature);
    expect(errors.some((e) => e.message.includes('Procedure geometry must be null'))).toBe(
      true
    );
  });

  it('reports multiple errors at once', () => {
    const feature = makeFeature('sosa:Sensor', { uid: '', name: '' });
    const errors = validateCSAPIFeature(feature);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it('returns error for non-object input', () => {
    expect(
      validateCSAPIFeature(null).some(
        (e) => e.message === 'Feature must be a non-null object'
      )
    ).toBe(true);
    expect(
      validateCSAPIFeature(42).some(
        (e) => e.message === 'Feature must be a non-null object'
      )
    ).toBe(true);
  });

  it('returns error for missing properties object', () => {
    expect(
      validateCSAPIFeature({ type: 'Feature' }).some(
        (e) => e.message === 'Feature must have a properties object'
      )
    ).toBe(true);
  });
});

// ========================================
// extractCSAPIFeature
// ========================================

describe('extractCSAPIFeature', () => {
  it('extracts a System feature', () => {
    const raw = makeFeature('sosa:Sensor', {
      description: 'A sensor',
      assetType: 'Equipment',
      validTime: ['2026-01-01T00:00:00Z', 'now'],
      geometry: { type: 'Point', coordinates: [1, 2] },
    });
    const result = extractCSAPIFeature(raw);
    expect(result.type).toBe('Feature');
    expect(result.id).toBe('abc123');
    expect(result.properties.featureType).toBe('sosa:Sensor');
    expect(result.properties.uid).toBe('urn:x-test:feature:1');
    expect(result.properties.name).toBe('Test Feature');
    expect(result.properties.description).toBe('A sensor');
    expect((result as any).properties.assetType).toBe('Equipment');
    expect((result as any).properties.validTime).toEqual({
      start: new Date('2026-01-01T00:00:00Z'),
      end: undefined,
    });
  });

  it('extracts a Deployment feature with validTime', () => {
    const raw = makeFeature('sosa:Deployment', {
      validTime: ['2026-01-01T00:00:00Z', '2027-01-01T00:00:00Z'],
    });
    const result = extractCSAPIFeature(raw);
    expect(result.properties.featureType).toBe('sosa:Deployment');
    expect((result as any).properties.validTime).toEqual({
      start: new Date('2026-01-01T00:00:00Z'),
      end: new Date('2027-01-01T00:00:00Z'),
    });
  });

  it('extracts a Procedure feature with null geometry', () => {
    const raw = makeFeature('sosa:Procedure', { geometry: null });
    const result = extractCSAPIFeature(raw);
    expect(result.properties.featureType).toBe('sosa:Procedure');
    expect(result.geometry).toBe(null);
  });

  it('extracts a SamplingFeature', () => {
    const raw = makeFeature('sosa:SamplingFeature', {
      geometry: { type: 'Point', coordinates: [12.31, -86.98, -21] },
      'sampledFeature@link': { href: 'http://example.com/feature/1' },
    });
    const result = extractCSAPIFeature(raw);
    expect(result.properties.featureType).toBe('sosa:SamplingFeature');
    expect(result.geometry).toEqual({
      type: 'Point',
      coordinates: [12.31, -86.98, -21],
    });
  });

  it('converts validTime from array format to TimeInterval', () => {
    const raw = makeFeature('sosa:Sensor', {
      validTime: ['2026-01-26T18:32:01.56Z', 'now'],
    });
    const result = extractCSAPIFeature(raw);
    expect((result as any).properties.validTime).toEqual({
      start: new Date('2026-01-26T18:32:01.56Z'),
      end: undefined,
    });
  });

  it('omits validTime when not present', () => {
    const raw = makeFeature('sosa:Sensor');
    const result = extractCSAPIFeature(raw);
    expect((result as any).properties.validTime).toBeUndefined();
  });

  it('omits description when not present', () => {
    const raw = makeFeature('sosa:Sensor');
    const result = extractCSAPIFeature(raw);
    expect(result.properties.description).toBeUndefined();
  });

  it('preserves links array', () => {
    const links = [
      { rel: 'self', href: 'http://example.com/systems/1', type: 'application/geo+json' },
    ];
    const raw = makeFeature('sosa:Sensor', { links });
    const result = extractCSAPIFeature(raw);
    expect(result.links).toEqual(links);
  });

  it('defaults links to empty array when missing', () => {
    const raw = { ...makeFeature('sosa:Sensor') };
    delete (raw as any).links;
    const result = extractCSAPIFeature(raw);
    expect(result.links).toEqual([]);
  });

  it('extracts a SamplingFeature from SensorML vocabulary', () => {
    const raw = makeFeature(`${SENSORML_NS}Feature`, {
      geometry: { type: 'Point', coordinates: [10.5, 50.2] },
      'sampledFeature@link': { href: 'http://example.com/feature/1' },
    });
    const result = extractCSAPIFeature(raw);
    expect(result.properties.featureType).toBe(
      `${SENSORML_NS}Feature`
    );
    expect(result.properties.uid).toBe('urn:x-test:feature:1');
    expect(result.properties.name).toBe('Test Feature');
    expect(result.geometry).toEqual({
      type: 'Point',
      coordinates: [10.5, 50.2],
    });
  });

  it('throws for invalid feature', () => {
    expect(() => extractCSAPIFeature(null)).toThrow('Invalid CSAPI feature');
  });

  it('throws with all validation errors in message', () => {
    const raw = {
      type: 'Feature',
      properties: { featureType: '', uid: '', name: '' },
    };
    expect(() => extractCSAPIFeature(raw)).toThrow('featureType');
  });
});
