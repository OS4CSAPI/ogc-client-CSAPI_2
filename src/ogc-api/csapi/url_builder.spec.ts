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
// Top-Level (Non-Collection-Scoped) Resource URLs
// ========================================

describe('Top-level resource URLs', () => {
  function makeTopLevelBuilder() {
    const resourceUrls = new Map<string, string>([
      ['systems', 'http://server/sensorhub/api/systems'],
      ['datastreams', 'http://server/sensorhub/api/datastreams'],
    ]);
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'http://server/sensorhub/api/collections/all' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
          { rel: 'ogc-cs:datastreams', type: '', title: '', href: '/datastreams' },
        ],
      }),
      resourceUrls
    );
  }

  it('collection-scoped builder still produces correct URLs (no regression)', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
    expect(builder.getSystems()).toBe('https://example.com/collections/iot/systems');
  });

  it('uses absolute resource URL when resourceUrls map is provided', () => {
    const url = makeTopLevelBuilder().getSystems();
    expect(url).toBe('http://server/sensorhub/api/systems');
  });

  it('appends resource ID correctly with top-level URL', () => {
    const url = makeTopLevelBuilder().getSystem('sys-001');
    expect(url).toBe('http://server/sensorhub/api/systems/sys-001');
  });

  it('appends sub-path correctly with top-level URL', () => {
    const url = makeTopLevelBuilder().getSystemSubsystems('sys-001');
    expect(url).toBe('http://server/sensorhub/api/systems/sys-001/subsystems');
  });

  it('appends query parameters correctly with top-level URL', () => {
    const url = makeTopLevelBuilder().getSystems({ limit: 5, q: 'weather' });
    expect(url).toBe('http://server/sensorhub/api/systems?limit=5&q=weather');
  });

  it('encodes special characters in ID with top-level URL', () => {
    const url = makeTopLevelBuilder().getSystem('sys/001');
    expect(url).toBe('http://server/sensorhub/api/systems/sys%2F001');
  });

  it('strips trailing slash from absolute resource URL', () => {
    const resourceUrls = new Map<string, string>([
      ['systems', 'http://server/api/systems/'],
    ]);
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'http://server/api' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      }),
      resourceUrls
    );
    expect(builder.getSystems()).toBe('http://server/api/systems');
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

// ========================================
// Deployments Methods
// ========================================

describe('getDeployments', () => {
  function makeDepBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:deployments', type: '', title: '', href: '/deployments' },
        ],
      })
    );
  }

  it('returns correct URL with no options', () => {
    const url = makeDepBuilder().getDeployments();
    expect(url).toBe('https://example.com/collections/iot/deployments');
  });

  it('returns correct URL with limit and bbox', () => {
    const url = makeDepBuilder().getDeployments({ limit: 10, bbox: [-180, -90, 180, 90] });
    expect(url).toBe(
      'https://example.com/collections/iot/deployments?limit=10&bbox=-180%2C-90%2C180%2C90'
    );
  });

  it('returns correct URL with datetime parameter', () => {
    const url = makeDepBuilder().getDeployments({
      datetime: { start: new Date('2025-01-01T00:00:00Z'), end: new Date('2025-12-31T23:59:59Z') },
    });
    expect(url).toContain('datetime=');
  });

  it('returns correct URL with systemId filter', () => {
    const url = makeDepBuilder().getDeployments({ systemId: 'sys-001' });
    expect(url).toBe('https://example.com/collections/iot/deployments?systemId=sys-001');
  });
});

describe('getDeployment', () => {
  function makeDepBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:deployments', type: '', title: '', href: '/deployments' },
        ],
      })
    );
  }

  it('returns correct URL with resource ID', () => {
    const url = makeDepBuilder().getDeployment('dep-001');
    expect(url).toBe('https://example.com/collections/iot/deployments/dep-001');
  });

  it('encodes special characters in ID', () => {
    const url = makeDepBuilder().getDeployment('dep/001');
    expect(url).toBe('https://example.com/collections/iot/deployments/dep%2F001');
  });
});

describe('Deployment CRUD operations', () => {
  function makeDepBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:deployments', type: '', title: '', href: '/deployments' },
        ],
      })
    );
  }

  it('createDeployment returns correct URL', () => {
    const url = makeDepBuilder().createDeployment();
    expect(url).toBe('https://example.com/collections/iot/deployments');
  });

  it('updateDeployment returns correct URL', () => {
    const url = makeDepBuilder().updateDeployment('dep-001');
    expect(url).toBe('https://example.com/collections/iot/deployments/dep-001');
  });

  it('deleteDeployment returns correct URL', () => {
    const url = makeDepBuilder().deleteDeployment('dep-001');
    expect(url).toBe('https://example.com/collections/iot/deployments/dep-001');
  });
});

describe('getDeploymentSubdeployments', () => {
  function makeDepBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:deployments', type: '', title: '', href: '/deployments' },
        ],
      })
    );
  }

  it('returns correct URL with no options', () => {
    const url = makeDepBuilder().getDeploymentSubdeployments('dep-001');
    expect(url).toBe(
      'https://example.com/collections/iot/deployments/dep-001/subdeployments'
    );
  });

  it('returns correct URL with recursive=true', () => {
    const url = makeDepBuilder().getDeploymentSubdeployments('dep-001', { recursive: true });
    expect(url).toBe(
      'https://example.com/collections/iot/deployments/dep-001/subdeployments?recursive=true'
    );
  });
});

describe('Deployment association and history', () => {
  function makeDepBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:deployments', type: '', title: '', href: '/deployments' },
        ],
      })
    );
  }

  it('getDeploymentSystems returns correct URL', () => {
    const url = makeDepBuilder().getDeploymentSystems('dep-001');
    expect(url).toBe(
      'https://example.com/collections/iot/deployments/dep-001/systems'
    );
  });

  it('getDeploymentSystems returns correct URL with options', () => {
    const url = makeDepBuilder().getDeploymentSystems('dep-001', { limit: 5 });
    expect(url).toBe(
      'https://example.com/collections/iot/deployments/dep-001/systems?limit=5'
    );
  });

  it('getDeploymentHistory returns correct URL', () => {
    const url = makeDepBuilder().getDeploymentHistory('dep-001');
    expect(url).toBe(
      'https://example.com/collections/iot/deployments/dep-001/history'
    );
  });

  it('getDeploymentHistory returns correct URL with limit', () => {
    const url = makeDepBuilder().getDeploymentHistory('dep-001', { limit: 10 });
    expect(url).toBe(
      'https://example.com/collections/iot/deployments/dep-001/history?limit=10'
    );
  });
});

describe('Deployment resource validation', () => {
  it('throws EndpointError when deployments is unavailable', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        id: 'sensors',
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/sensors' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
    expect(() => builder.getDeployments()).toThrow(EndpointError);
  });
});

// ========================================
// Procedures Methods
// ========================================

describe('getProcedures', () => {
  function makeProcBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:procedures', type: '', title: '', href: '/procedures' },
        ],
      })
    );
  }

  it('returns correct URL with no options', () => {
    const url = makeProcBuilder().getProcedures();
    expect(url).toBe('https://example.com/collections/iot/procedures');
  });

  it('returns correct URL with limit', () => {
    const url = makeProcBuilder().getProcedures({ limit: 10 });
    expect(url).toBe('https://example.com/collections/iot/procedures?limit=10');
  });

  it('returns correct URL with offset', () => {
    const url = makeProcBuilder().getProcedures({ offset: 20 });
    expect(url).toBe('https://example.com/collections/iot/procedures?offset=20');
  });

  it('returns correct URL with q parameter', () => {
    const url = makeProcBuilder().getProcedures({ q: 'thermometer' });
    expect(url).toBe('https://example.com/collections/iot/procedures?q=thermometer');
  });

  it('returns correct URL with id filter', () => {
    const url = makeProcBuilder().getProcedures({ id: 'proc-001' });
    expect(url).toBe('https://example.com/collections/iot/procedures?id=proc-001');
  });

  it('returns correct URL with array id filter', () => {
    const url = makeProcBuilder().getProcedures({ id: ['proc-001', 'proc-002'] });
    expect(url).toBe('https://example.com/collections/iot/procedures?id=proc-001%2Cproc-002');
  });

  it('returns correct URL with f (format) parameter', () => {
    const url = makeProcBuilder().getProcedures({ f: 'application/json' });
    expect(url).toBe('https://example.com/collections/iot/procedures?f=application%2Fjson');
  });

  it('returns correct URL with multiple options', () => {
    const url = makeProcBuilder().getProcedures({ limit: 5, offset: 10, q: 'sensor' });
    expect(url).toBe('https://example.com/collections/iot/procedures?limit=5&offset=10&q=sensor');
  });
});

describe('getProcedure', () => {
  function makeProcBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:procedures', type: '', title: '', href: '/procedures' },
        ],
      })
    );
  }

  it('returns correct URL with resource ID', () => {
    const url = makeProcBuilder().getProcedure('proc-001');
    expect(url).toBe('https://example.com/collections/iot/procedures/proc-001');
  });

  it('encodes special characters in ID', () => {
    const url = makeProcBuilder().getProcedure('urn:example:proc:001');
    expect(url).toBe('https://example.com/collections/iot/procedures/urn%3Aexample%3Aproc%3A001');
  });
});

describe('Procedure CRUD operations', () => {
  function makeProcBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:procedures', type: '', title: '', href: '/procedures' },
        ],
      })
    );
  }

  it('createProcedure returns correct URL', () => {
    const url = makeProcBuilder().createProcedure();
    expect(url).toBe('https://example.com/collections/iot/procedures');
  });

  it('updateProcedure returns correct URL', () => {
    const url = makeProcBuilder().updateProcedure('proc-001');
    expect(url).toBe('https://example.com/collections/iot/procedures/proc-001');
  });

  it('deleteProcedure returns correct URL', () => {
    const url = makeProcBuilder().deleteProcedure('proc-001');
    expect(url).toBe('https://example.com/collections/iot/procedures/proc-001');
  });
});

describe('Procedure association methods', () => {
  function makeProcBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:procedures', type: '', title: '', href: '/procedures' },
        ],
      })
    );
  }

  it('getProcedureSystems returns correct URL', () => {
    const url = makeProcBuilder().getProcedureSystems('proc-001');
    expect(url).toBe('https://example.com/collections/iot/procedures/proc-001/systems');
  });

  it('getProcedureSystems returns correct URL with pagination', () => {
    const url = makeProcBuilder().getProcedureSystems('proc-001', { limit: 5, offset: 10 });
    expect(url).toBe('https://example.com/collections/iot/procedures/proc-001/systems?limit=5&offset=10');
  });

  it('getProcedureDataStreams returns correct URL', () => {
    const url = makeProcBuilder().getProcedureDataStreams('proc-001');
    expect(url).toBe('https://example.com/collections/iot/procedures/proc-001/datastreams');
  });

  it('getProcedureDataStreams returns correct URL with options', () => {
    const url = makeProcBuilder().getProcedureDataStreams('proc-001', { limit: 10 });
    expect(url).toBe('https://example.com/collections/iot/procedures/proc-001/datastreams?limit=10');
  });
});

describe('getProcedureHistory', () => {
  function makeProcBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:procedures', type: '', title: '', href: '/procedures' },
        ],
      })
    );
  }

  it('returns correct URL with no options', () => {
    const url = makeProcBuilder().getProcedureHistory('proc-001');
    expect(url).toBe('https://example.com/collections/iot/procedures/proc-001/history');
  });

  it('returns correct URL with limit', () => {
    const url = makeProcBuilder().getProcedureHistory('proc-001', { limit: 5 });
    expect(url).toBe('https://example.com/collections/iot/procedures/proc-001/history?limit=5');
  });
});

describe('Procedure resource validation', () => {
  it('throws EndpointError when procedures is unavailable', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        id: 'sensors',
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/sensors' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
    expect(() => builder.getProcedures()).toThrow(EndpointError);
    expect(() => builder.getProcedure('x')).toThrow(EndpointError);
    expect(() => builder.createProcedure()).toThrow(EndpointError);
    expect(() => builder.updateProcedure('x')).toThrow(EndpointError);
    expect(() => builder.deleteProcedure('x')).toThrow(EndpointError);
    expect(() => builder.getProcedureSystems('x')).toThrow(EndpointError);
    expect(() => builder.getProcedureDataStreams('x')).toThrow(EndpointError);
    expect(() => builder.getProcedureHistory('x')).toThrow(EndpointError);
  });
});

// ========================================
// Sampling Features Methods
// ========================================

describe('getSamplingFeatures', () => {
  function makeSfBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:samplingFeatures', type: '', title: '', href: '/samplingFeatures' },
        ],
      })
    );
  }

  it('returns correct URL with no options', () => {
    const url = makeSfBuilder().getSamplingFeatures();
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures');
  });

  it('returns correct URL with limit', () => {
    const url = makeSfBuilder().getSamplingFeatures({ limit: 20 });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures?limit=20');
  });

  it('returns correct URL with offset', () => {
    const url = makeSfBuilder().getSamplingFeatures({ offset: 10 });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures?offset=10');
  });

  it('returns correct URL with q parameter', () => {
    const url = makeSfBuilder().getSamplingFeatures({ q: 'borehole' });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures?q=borehole');
  });

  it('returns correct URL with id filter', () => {
    const url = makeSfBuilder().getSamplingFeatures({ id: 'sf-001' });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures?id=sf-001');
  });

  it('returns correct URL with array id filter', () => {
    const url = makeSfBuilder().getSamplingFeatures({ id: ['sf-001', 'sf-002'] });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures?id=sf-001%2Csf-002');
  });

  it('returns correct URL with bbox parameter', () => {
    const url = makeSfBuilder().getSamplingFeatures({ bbox: [-120, 35, -110, 45] });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures?bbox=-120%2C35%2C-110%2C45');
  });

  it('returns correct URL with datetime parameter', () => {
    const url = makeSfBuilder().getSamplingFeatures({
      datetime: { start: new Date('2024-01-01T00:00:00Z'), end: new Date('2024-12-31T23:59:59Z') },
    });
    expect(url).toBe(
      'https://example.com/collections/iot/samplingFeatures?datetime=2024-01-01T00%3A00%3A00.000Z%2F2024-12-31T23%3A59%3A59.000Z'
    );
  });

  it('returns correct URL with f (format) parameter', () => {
    const url = makeSfBuilder().getSamplingFeatures({ f: 'application/geo+json' });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures?f=application%2Fgeo%2Bjson');
  });

  it('returns correct URL with multiple options', () => {
    const url = makeSfBuilder().getSamplingFeatures({ limit: 10, offset: 5, q: 'well' });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures?limit=10&offset=5&q=well');
  });
});

describe('getSamplingFeature', () => {
  function makeSfBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:samplingFeatures', type: '', title: '', href: '/samplingFeatures' },
        ],
      })
    );
  }

  it('returns correct URL with resource ID', () => {
    const url = makeSfBuilder().getSamplingFeature('sf-001');
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures/sf-001');
  });

  it('encodes special characters in ID', () => {
    const url = makeSfBuilder().getSamplingFeature('urn:example:sf:001');
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures/urn%3Aexample%3Asf%3A001');
  });
});

describe('SamplingFeature CRUD operations', () => {
  function makeSfBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:samplingFeatures', type: '', title: '', href: '/samplingFeatures' },
        ],
      })
    );
  }

  it('createSamplingFeature returns correct URL', () => {
    const url = makeSfBuilder().createSamplingFeature();
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures');
  });

  it('updateSamplingFeature returns correct URL', () => {
    const url = makeSfBuilder().updateSamplingFeature('sf-001');
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures/sf-001');
  });

  it('deleteSamplingFeature returns correct URL', () => {
    const url = makeSfBuilder().deleteSamplingFeature('sf-001');
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures/sf-001');
  });
});

describe('SamplingFeature association methods', () => {
  function makeSfBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:samplingFeatures', type: '', title: '', href: '/samplingFeatures' },
        ],
      })
    );
  }

  it('getSamplingFeatureSystems returns correct URL', () => {
    const url = makeSfBuilder().getSamplingFeatureSystems('sf-001');
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures/sf-001/systems');
  });

  it('getSamplingFeatureSystems returns correct URL with pagination', () => {
    const url = makeSfBuilder().getSamplingFeatureSystems('sf-001', { limit: 5, offset: 10 });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures/sf-001/systems?limit=5&offset=10');
  });

  it('getSamplingFeatureObservations returns correct URL', () => {
    const url = makeSfBuilder().getSamplingFeatureObservations('sf-001');
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures/sf-001/observations');
  });

  it('getSamplingFeatureObservations returns correct URL with options', () => {
    const url = makeSfBuilder().getSamplingFeatureObservations('sf-001', { limit: 10 });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures/sf-001/observations?limit=10');
  });
});

describe('getSamplingFeatureHistory', () => {
  function makeSfBuilder() {
    return new CSAPIQueryBuilder(
      makeCollection({
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/iot' },
          { rel: 'ogc-cs:samplingFeatures', type: '', title: '', href: '/samplingFeatures' },
        ],
      })
    );
  }

  it('returns correct URL with no options', () => {
    const url = makeSfBuilder().getSamplingFeatureHistory('sf-001');
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures/sf-001/history');
  });

  it('returns correct URL with limit', () => {
    const url = makeSfBuilder().getSamplingFeatureHistory('sf-001', { limit: 5 });
    expect(url).toBe('https://example.com/collections/iot/samplingFeatures/sf-001/history?limit=5');
  });
});

describe('SamplingFeature resource validation', () => {
  it('throws EndpointError when samplingFeatures is unavailable', () => {
    const builder = new CSAPIQueryBuilder(
      makeCollection({
        id: 'sensors',
        links: [
          { rel: 'self', type: '', title: '', href: 'https://example.com/collections/sensors' },
          { rel: 'ogc-cs:systems', type: '', title: '', href: '/systems' },
        ],
      })
    );
    expect(() => builder.getSamplingFeatures()).toThrow(EndpointError);
    expect(() => builder.getSamplingFeature('x')).toThrow(EndpointError);
    expect(() => builder.createSamplingFeature()).toThrow(EndpointError);
    expect(() => builder.updateSamplingFeature('x')).toThrow(EndpointError);
    expect(() => builder.deleteSamplingFeature('x')).toThrow(EndpointError);
    expect(() => builder.getSamplingFeatureSystems('x')).toThrow(EndpointError);
    expect(() => builder.getSamplingFeatureObservations('x')).toThrow(EndpointError);
    expect(() => builder.getSamplingFeatureHistory('x')).toThrow(EndpointError);
  });
});
