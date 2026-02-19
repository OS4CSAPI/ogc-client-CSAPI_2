import { parseDatastream } from './part2.js';
import type { Datastream } from '../model.js';

/**
 * Tests for Part 2 parsers.
 *
 * This file houses tests for all Part 2 resource parsers. Subsequent tasks
 * will add `describe` blocks for parseObservation, parseControlStream,
 * parseCommand, and parseCommandStatus.
 *
 * Datastream fixtures are derived from real OSH response data (Smoke Test #7).
 *
 * @see https://docs.ogc.org/is/23-002/23-002.html
 */

describe('parseDatastream', () => {
  // Fixture derived from OSH Smoke Test #7 response — full Datastream with all fields
  const fullDatastreamFixture = {
    id: '0ocb',
    name: 'FCU Simulated Weather Station - Weather',
    description: 'Weather observations from simulated station',
    'system@id': '0o0o',
    'system@link': {
      href: 'http://45.55.99.236:8080/sensorhub/api/systems/0o0o?f=json',
      uid: 'urn:osh:sensor:simweather:001',
      type: 'application/geo+json',
    },
    outputName: 'weather',
    validTime: ['2026-01-26T18:32:01.56Z', 'now'],
    observedProperties: [
      {
        definition: 'http://mmisw.org/ont/cf/parameter/air_temperature',
        label: 'Air Temperature',
      },
    ],
    formats: [
      'application/om+json',
      'application/swe+json',
      'application/swe+csv',
      'application/swe+xml',
      'application/swe+binary',
    ],
    phenomenonTime: [
      '2026-01-26T18:32:01.56Z',
      '2026-02-19T14:22:03.12Z',
    ],
    resultTime: ['2026-01-26T18:32:01.56Z', '2026-02-19T14:22:03.12Z'],
    resultType: 'record',
    live: true,
    links: [
      {
        rel: 'self',
        href: '/datastreams/0ocb',
        type: 'application/json',
      },
    ],
  };

  it('extracts all fields from a full Datastream (cross-refs excluded)', () => {
    const result: Datastream = parseDatastream(fullDatastreamFixture);

    expect(result.id).toBe('0ocb');
    expect(result.name).toBe('FCU Simulated Weather Station - Weather');
    expect(result.description).toBe(
      'Weather observations from simulated station'
    );
    expect(result.outputName).toBe('weather');
    expect(result.formats).toEqual([
      'application/om+json',
      'application/swe+json',
      'application/swe+csv',
      'application/swe+xml',
      'application/swe+binary',
    ]);
    expect(result.observedProperties).toEqual([
      'http://mmisw.org/ont/cf/parameter/air_temperature',
    ]);
    expect(result.resultType).toBe('record');
    expect(result.live).toBe(true);
    expect(result.links).toEqual([
      { rel: 'self', href: '/datastreams/0ocb', type: 'application/json' },
    ]);

    // Cross-reference fields must NOT be in output
    expect(result).not.toHaveProperty('system@id');
    expect(result).not.toHaveProperty('system@link');
  });

  it('handles a minimal Datastream with only required fields', () => {
    const input = {
      id: 'ds-minimal',
      name: 'Minimal Stream',
      formats: ['application/om+json'],
    };

    const result: Datastream = parseDatastream(input);

    expect(result.id).toBe('ds-minimal');
    expect(result.name).toBe('Minimal Stream');
    expect(result.formats).toEqual(['application/om+json']);
    expect(result.observedProperties).toEqual([]);
    expect(result.phenomenonTime).toBeNull();
    expect(result.resultTime).toBeNull();
    expect(result.resultType).toBeNull();
    expect(result.live).toBeNull();
    expect(result.description).toBeUndefined();
    expect(result.outputName).toBeUndefined();
    expect(result.validTime).toBeUndefined();
    expect(result.type).toBeUndefined();
  });

  it('parses all 3 time fields correctly (including "now" sentinel)', () => {
    const input = {
      id: 'ds-time',
      name: 'Time Test',
      formats: [],
      validTime: ['2026-01-26T18:32:01.56Z', 'now'],
      phenomenonTime: [
        '2026-01-26T18:32:01.56Z',
        '2026-02-19T14:22:03.12Z',
      ],
      resultTime: ['2026-01-26T18:32:01.56Z', '2026-02-19T14:22:03.12Z'],
    };

    const result: Datastream = parseDatastream(input);

    // validTime: "now" sentinel → end is undefined
    expect(result.validTime?.start).toEqual(
      new Date('2026-01-26T18:32:01.56Z')
    );
    expect(result.validTime?.end).toBeUndefined();

    // phenomenonTime: concrete start and end
    expect(result.phenomenonTime?.start).toEqual(
      new Date('2026-01-26T18:32:01.56Z')
    );
    expect(result.phenomenonTime?.end).toEqual(
      new Date('2026-02-19T14:22:03.12Z')
    );

    // resultTime: concrete start and end
    expect(result.resultTime?.start).toEqual(
      new Date('2026-01-26T18:32:01.56Z')
    );
    expect(result.resultTime?.end).toEqual(
      new Date('2026-02-19T14:22:03.12Z')
    );
  });

  it('extracts definition URIs from observedProperties objects', () => {
    const input = {
      id: 'ds-obs-obj',
      name: 'Observed Props Object Form',
      formats: [],
      observedProperties: [
        {
          definition: 'http://mmisw.org/ont/cf/parameter/air_temperature',
          label: 'Air Temperature',
        },
        {
          definition: 'http://mmisw.org/ont/cf/parameter/relative_humidity',
          label: 'Humidity',
        },
      ],
    };

    const result: Datastream = parseDatastream(input);

    expect(result.observedProperties).toEqual([
      'http://mmisw.org/ont/cf/parameter/air_temperature',
      'http://mmisw.org/ont/cf/parameter/relative_humidity',
    ]);
  });

  it('passes through observedProperties when already strings', () => {
    const input = {
      id: 'ds-obs-str',
      name: 'Observed Props String Form',
      formats: [],
      observedProperties: [
        'http://mmisw.org/ont/cf/parameter/air_temperature',
        'http://mmisw.org/ont/cf/parameter/relative_humidity',
      ],
    };

    const result: Datastream = parseDatastream(input);

    expect(result.observedProperties).toEqual([
      'http://mmisw.org/ont/cf/parameter/air_temperature',
      'http://mmisw.org/ont/cf/parameter/relative_humidity',
    ]);
  });

  it('returns null (not undefined) for phenomenonTime when null', () => {
    const input = {
      id: 'ds-null-time',
      name: 'Null Time',
      formats: [],
      phenomenonTime: null,
      resultTime: null,
    };

    const result: Datastream = parseDatastream(input);

    // Nullable fields must be null, not undefined
    expect(result.phenomenonTime).toBeNull();
    expect(result.resultTime).toBeNull();
  });

  it('omits optional fields when they are absent', () => {
    const input = {
      id: 'ds-no-optionals',
      name: 'No Optionals',
      formats: [],
    };

    const result: Datastream = parseDatastream(input);

    expect(result).not.toHaveProperty('description');
    expect(result).not.toHaveProperty('outputName');
    expect(result).not.toHaveProperty('type');
    expect(result).not.toHaveProperty('validTime');
  });

  it('throws on non-object input', () => {
    expect(() => parseDatastream(null)).toThrow(
      'parseDatastream: input must be a non-null object'
    );
    expect(() => parseDatastream(42)).toThrow(
      'parseDatastream: input must be a non-null object'
    );
    expect(() => parseDatastream('string')).toThrow(
      'parseDatastream: input must be a non-null object'
    );
  });
});
