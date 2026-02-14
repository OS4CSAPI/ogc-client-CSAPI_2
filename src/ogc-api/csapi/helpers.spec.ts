import type { DateTimeParameter } from '../../shared/models.js';
import type { BoundingBox } from '../../shared/models.js';
import {
  formatDateTimeParameter,
  isValidResourceType,
  assertValidResourceType,
  encodeResourceId,
  encodeArrayParameter,
  validateLimit,
  validateBbox,
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

  it('throws for an invalid parameter', () => {
    expect(() =>
      formatDateTimeParameter({} as DateTimeParameter)
    ).toThrow('Invalid DateTimeParameter');
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

describe('encodeArrayParameter', () => {
  it('returns empty string for empty array', () => {
    expect(encodeArrayParameter([])).toBe('');
  });

  it('returns single value without comma', () => {
    expect(encodeArrayParameter(['sys-001'])).toBe('sys-001');
  });

  it('joins multiple values with commas', () => {
    expect(encodeArrayParameter(['sys-001', 'sys-002', 'sys-003'])).toBe(
      'sys-001,sys-002,sys-003'
    );
  });

  it('encodes special characters in individual values', () => {
    expect(encodeArrayParameter(['a/b', 'c d'])).toBe('a%2Fb,c%20d');
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
