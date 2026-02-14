import type { OgcApiCollectionInfo } from '../model.js';
import { EndpointError } from '../../shared/errors.js';
import CSAPIQueryBuilder from './url_builder.js';

/**
 * Builds a minimal OgcApiCollectionInfo suitable for CSAPIQueryBuilder tests.
 */
function makeCollection(
  overrides: Partial<OgcApiCollectionInfo> = {}
): OgcApiCollectionInfo {
  return {
    links: [],
    title: 'Test Collection',
    description: 'A test collection',
    id: 'test-collection',
    itemFormats: [],
    bulkDownloadLinks: {},
    jsonDownloadLink: '',
    crs: [],
    itemCount: 0,
    queryables: [],
    sortables: [],
    mapTileFormats: [],
    vectorTileFormats: [],
    supportedTileMatrixSets: [],
    ...overrides,
  };
}

// ========================================
// Constructor & Resource Discovery
// ========================================

describe('CSAPIQueryBuilder constructor', () => {
  it('constructs with a valid collection', () => {
    const builder = new CSAPIQueryBuilder(makeCollection());
    expect(builder).toBeInstanceOf(CSAPIQueryBuilder);
  });

  it('populates availableResources from ogc-cs: link relations', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
          { rel: 'ogc-cs:datastreams', type: '', title: '', href: '/datastreams' },
          { rel: 'ogc-cs:deployments', type: '', title: '', href: '/deployments' },
        ],
      })
    );
    expect(builder.availableResources).toEqual(
      new Set(['systems', 'datastreams', 'deployments'])
    );
  });

  it('returns empty availableResources when no CSAPI links exist', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'items', type: '', title: '', href: '/items' },
        ],
      })
    );
    expect(builder.availableResources.size).toBe(0);
  });

  it('handles collection with empty links array', () => {
    const builder = new CSAPIQueryBuilder(makeCollection({ links: [] }));
    expect(builder.availableResources.size).toBe(0);
  });

  it('discovers resources from plain rel matching known resource types', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/api' },
          { rel: 'systems', type: '', title: '', href: '/api/systems' },
          { rel: 'datastreams', type: '', title: '', href: '/api/datastreams' },
        ],
      })
    );
    expect(builder.availableResources).toEqual(
      new Set(['systems', 'datastreams'])
    );
  });

  it('discovers resources from rel:"items" when href ends with a known resource type', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'items', type: '', title: '', href: '/collections/iot/systems' },
          { rel: 'items', type: '', title: '', href: '/collections/iot/deployments' },
        ],
      })
    );
    expect(builder.availableResources).toEqual(
      new Set(['systems', 'deployments'])
    );
  });

  it('discovers resources from mixed conventions in same collection', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/api' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
          { rel: 'datastreams', type: '', title: '', href: '/api/datastreams' },
          { rel: 'items', type: '', title: '', href: '/collections/iot/deployments' },
        ],
      })
    );
    expect(builder.availableResources).toEqual(
      new Set(['systems', 'datastreams', 'deployments'])
    );
  });

  it('ignores plain rel values that are not known resource types', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/api' },
          { rel: 'alternate', type: '', title: '', href: '/alt' },
          { rel: 'describedby', type: '', title: '', href: '/schema' },
          { rel: 'systems', type: '', title: '', href: '/api/systems' },
        ],
      })
    );
    expect(builder.availableResources).toEqual(new Set(['systems']));
  });

  it('ignores rel:"items" when href does not end with a known resource type', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'items', type: '', title: '', href: '/collections/iot/items' },
          { rel: 'items', type: '', title: '', href: '/collections/iot/unknown' },
        ],
      })
    );
    expect(builder.availableResources.size).toBe(0);
  });
});

// ========================================
// Resource Validation
// ========================================

describe('Resource validation', () => {
  it('throws EndpointError when resource type is unavailable', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        id: 'sensors',
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/sensors' },
          { rel: 'ogc-cs:deployments', type: '', title: '', href: '/deployments' },
        ],
      })
    );

    expect(() => builder.getSystems()).toThrow(EndpointError);
  });

  it('error message includes collection ID', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        id: 'sensors',
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/sensors' },
        ],
      })
    );

    expect(() => builder.getSystems()).toThrow(
      "Collection 'sensors' does not support 'systems' resource"
    );
  });

  it('error message lists available resources', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        id: 'iot',
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:deployments', type: '', title: '', href: '/deployments' },
          { rel: 'ogc-cs:datastreams', type: '', title: '', href: '/datastreams' },
        ],
      })
    );

    expect(() => builder.getSystems()).toThrow('Available resources: deployments, datastreams');
  });

  it('succeeds when resource type is available', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );

    expect(() => builder.getSystems()).not.toThrow();
  });
});

// ========================================
// getSystems
// ========================================

describe('getSystems', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL with no options', () => {
    const url = makeIotBuilder().getSystems();
    expect(url).toBe('https://example.com/collections/iot/systems');
  });

  it('returns correct URL with limit', () => {
    const url = makeIotBuilder().getSystems({ limit: 10 });
    expect(url).toBe('https://example.com/collections/iot/systems?limit=10');
  });

  it('returns correct URL with bbox', () => {
    const url = makeIotBuilder().getSystems({ bbox: [-180, -90, 180, 90] });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?bbox=-180%2C-90%2C180%2C90'
    );
  });

  it('returns correct URL with q parameter', () => {
    const url = makeIotBuilder().getSystems({ q: 'temperature' });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?q=temperature'
    );
  });

  it('returns correct URL with multiple options', () => {
    const url = makeIotBuilder().getSystems({ limit: 5, q: 'sensor' });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?limit=5&q=sensor'
    );
  });

  it('skips undefined option values', () => {
    const url = makeIotBuilder().getSystems({ limit: 10, offset: undefined });
    expect(url).toBe('https://example.com/collections/iot/systems?limit=10');
  });

  it('returns correct URL with datetime parameter', () => {
    const url = makeIotBuilder().getSystems({
      datetime: new Date('2024-06-01T00:00:00Z'),
    });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?datetime=2024-06-01T00%3A00%3A00.000Z'
    );
  });

  it('handles array id parameter', () => {
    const url = makeIotBuilder().getSystems({ id: ['sys-001', 'sys-002'] });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?id=sys-001%2Csys-002'
    );
  });

  it('does not double-encode special characters in array values', () => {
    const url = makeIotBuilder().getSystems({ id: ['sys 001', 'sys:002'] });
    // Spaces and colons should be encoded exactly once by URLSearchParams
    // (not double-encoded as %2520 or %253A)
    expect(url).toBe(
      'https://example.com/collections/iot/systems?id=sys+001%2Csys%3A002'
    );
  });

  // Systems-specific query parameters
  it('returns correct URL with parent parameter', () => {
    const url = makeIotBuilder().getSystems({ parent: 'urn:parent:1' });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?parent=urn%3Aparent%3A1'
    );
  });

  it('returns correct URL with procedureId parameter', () => {
    const url = makeIotBuilder().getSystems({ procedureId: 'proc-001' });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?procedureId=proc-001'
    );
  });

  it('returns correct URL with foiId parameter', () => {
    const url = makeIotBuilder().getSystems({ foiId: 'foi-001' });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?foiId=foi-001'
    );
  });

  it('returns correct URL with observedPropertyId parameter', () => {
    const url = makeIotBuilder().getSystems({
      observedPropertyId: 'temp-prop',
    });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?observedPropertyId=temp-prop'
    );
  });

  it('returns correct URL with controlledPropertyId parameter', () => {
    const url = makeIotBuilder().getSystems({
      controlledPropertyId: 'ctrl-prop',
    });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?controlledPropertyId=ctrl-prop'
    );
  });

  it('returns correct URL with recursive parameter', () => {
    const url = makeIotBuilder().getSystems({ recursive: true });
    expect(url).toBe(
      'https://example.com/collections/iot/systems?recursive=true'
    );
  });
});

// ========================================
// getSystem
// ========================================

describe('getSystem', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL with resource ID', () => {
    const url = makeIotBuilder().getSystem('abc123');
    expect(url).toBe('https://example.com/collections/iot/systems/abc123');
  });

  it('encodes special characters in ID', () => {
    const url = makeIotBuilder().getSystem('urn:example:sensor:001');
    expect(url).toBe(
      'https://example.com/collections/iot/systems/urn%3Aexample%3Asensor%3A001'
    );
  });

  it('throws EndpointError when systems is unavailable', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        id: 'no-systems',
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/no-systems' },
        ],
      })
    );

    expect(() => builder.getSystem('abc')).toThrow(EndpointError);
  });
});

// ========================================
// CRUD Methods
// ========================================

describe('createSystem', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL for POST target', () => {
    const url = makeIotBuilder().createSystem();
    expect(url).toBe('https://example.com/collections/iot/systems');
  });

  it('throws EndpointError when systems is unavailable', () => {
    const builder = new CSAPIQueryBuilder(makeCollection({ id: 'empty' }));
    expect(() => builder.createSystem()).toThrow(EndpointError);
  });
});

describe('updateSystem', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL for PUT target', () => {
    const url = makeIotBuilder().updateSystem('sys-001');
    expect(url).toBe('https://example.com/collections/iot/systems/sys-001');
  });

  it('encodes special characters in ID', () => {
    const url = makeIotBuilder().updateSystem('urn:example:sys:1');
    expect(url).toBe(
      'https://example.com/collections/iot/systems/urn%3Aexample%3Asys%3A1'
    );
  });
});

describe('deleteSystem', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL for DELETE target', () => {
    const url = makeIotBuilder().deleteSystem('sys-001');
    expect(url).toBe('https://example.com/collections/iot/systems/sys-001');
  });
});

// ========================================
// History
// ========================================

describe('getSystemHistory', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL with no options', () => {
    const url = makeIotBuilder().getSystemHistory('sys-001');
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/history'
    );
  });

  it('returns correct URL with limit', () => {
    const url = makeIotBuilder().getSystemHistory('sys-001', { limit: 5 });
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/history?limit=5'
    );
  });
});

// ========================================
// Subsystems
// ========================================

describe('getSystemSubsystems', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL with no options', () => {
    const url = makeIotBuilder().getSystemSubsystems('sys-001');
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/subsystems'
    );
  });

  it('returns correct URL with recursive=true', () => {
    const url = makeIotBuilder().getSystemSubsystems('sys-001', {
      recursive: true,
    });
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/subsystems?recursive=true'
    );
  });

  it('returns correct URL with pagination and filtering', () => {
    const url = makeIotBuilder().getSystemSubsystems('sys-001', {
      limit: 10,
      q: 'temperature',
    });
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/subsystems?limit=10&q=temperature'
    );
  });
});

// ========================================
// Cross-link Navigation
// ========================================

describe('getSystemDataStreams', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL', () => {
    const url = makeIotBuilder().getSystemDataStreams('sys-001');
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/datastreams'
    );
  });

  it('returns correct URL with options', () => {
    const url = makeIotBuilder().getSystemDataStreams('sys-001', { limit: 20 });
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/datastreams?limit=20'
    );
  });
});

describe('getSystemControlStreams', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL', () => {
    const url = makeIotBuilder().getSystemControlStreams('sys-001');
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/controlstreams'
    );
  });
});

// ========================================
// Association Links
// ========================================

describe('getSystemSamplingFeatures', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL', () => {
    const url = makeIotBuilder().getSystemSamplingFeatures('sys-001');
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/samplingFeatures'
    );
  });
});

describe('getSystemDeployments', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL', () => {
    const url = makeIotBuilder().getSystemDeployments('sys-001');
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/deployments'
    );
  });

  it('returns correct URL with options', () => {
    const url = makeIotBuilder().getSystemDeployments('sys-001', { limit: 5 });
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/deployments?limit=5'
    );
  });
});

describe('getSystemProcedures', () => {
  function makeIotBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
  }

  it('returns correct URL', () => {
    const url = makeIotBuilder().getSystemProcedures('sys-001');
    expect(url).toBe(
      'https://example.com/collections/iot/systems/sys-001/procedures'
    );
  });
});
