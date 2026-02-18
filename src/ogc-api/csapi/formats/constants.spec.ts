import {
  CSAPI_CONTENT_TYPES,
  getContentTypeForResource,
  MEDIA_TYPE_GEOJSON,
  MEDIA_TYPE_JSON,
} from './constants.js';

// ========================================
// CSAPI_CONTENT_TYPES constant
// ========================================

describe('CSAPI_CONTENT_TYPES', () => {
  it('has exactly 9 entries (one per CSAPIResourceType)', () => {
    expect(Object.keys(CSAPI_CONTENT_TYPES)).toHaveLength(9);
  });

  it.each(['systems', 'deployments', 'procedures', 'samplingFeatures', 'properties'] as const)(
    'maps Part 1 type "%s" to application/geo+json',
    (type) => {
      expect(CSAPI_CONTENT_TYPES[type]).toBe(MEDIA_TYPE_GEOJSON);
    }
  );

  it.each(['datastreams', 'observations', 'controlStreams', 'commands'] as const)(
    'maps Part 2 type "%s" to application/json',
    (type) => {
      expect(CSAPI_CONTENT_TYPES[type]).toBe(MEDIA_TYPE_JSON);
    }
  );
});

// ========================================
// getContentTypeForResource() helper
// ========================================

describe('getContentTypeForResource', () => {
  it('returns application/geo+json for a Part 1 resource', () => {
    expect(getContentTypeForResource('systems')).toBe('application/geo+json');
  });

  it('returns application/json for a Part 2 resource', () => {
    expect(getContentTypeForResource('datastreams')).toBe('application/json');
  });

  it('defaults to application/json for an unrecognized type', () => {
    expect(getContentTypeForResource('unknownType')).toBe('application/json');
  });
});
