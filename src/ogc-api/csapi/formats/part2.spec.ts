import {
  parseControlStream,
  parseDatastream,
  parseObservation,
} from './part2.js';
import type { ControlStream, Datastream, Observation } from '../model.js';

/**
 * Tests for Part 2 parsers.
 *
 * This file houses tests for all Part 2 resource parsers. Subsequent tasks
 * will add `describe` blocks for parseCommand and parseCommandStatus.
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

/**
 * Tests for parseObservation().
 *
 * Observation fixtures are derived from real OSH response data (Smoke Test #8).
 * Observation time fields are single ISO 8601 instant strings, not time intervals.
 *
 * @see https://docs.ogc.org/is/23-002/23-002.html#_observation_resources
 */
describe('parseObservation', () => {
  // Fixture derived from OSH Smoke Test #8 response — full Observation with all fields
  const fullObservationFixture = {
    id: '0o1abc123',
    'datastream@id': '0ocb',
    phenomenonTime: '2026-02-19T14:22:03.12Z',
    resultTime: '2026-02-19T14:22:03.12Z',
    parameters: { quality: 'good' },
    result: {
      temperature: 22.5,
      humidity: 65.3,
      pressure: 1013.25,
    },
    links: [
      {
        rel: 'self',
        href: '/observations/0o1abc123',
        type: 'application/json',
      },
    ],
  };

  it('extracts all fields from a full Observation (cross-refs excluded)', () => {
    const result: Observation = parseObservation(fullObservationFixture);

    expect(result.id).toBe('0o1abc123');
    expect(result.phenomenonTime).toBe('2026-02-19T14:22:03.12Z');
    expect(typeof result.phenomenonTime).toBe('string');
    expect(result.resultTime).toBe('2026-02-19T14:22:03.12Z');
    expect(typeof result.resultTime).toBe('string');
    expect(result.parameters).toEqual({ quality: 'good' });
    expect(result.result).toEqual({
      temperature: 22.5,
      humidity: 65.3,
      pressure: 1013.25,
    });
    expect(result.links).toEqual([
      {
        rel: 'self',
        href: '/observations/0o1abc123',
        type: 'application/json',
      },
    ]);

    // Cross-reference fields must NOT be in output
    expect(result).not.toHaveProperty('datastream@id');
  });

  it('handles a minimal Observation with only required fields', () => {
    const input = {
      id: 'obs-minimal',
      resultTime: '2026-02-19T14:22:03.12Z',
    };

    const result: Observation = parseObservation(input);

    expect(result.id).toBe('obs-minimal');
    expect(result.resultTime).toBe('2026-02-19T14:22:03.12Z');
    expect(result.phenomenonTime).toBeUndefined();
    expect(result.parameters).toBeUndefined();
    expect(result.result).toBeUndefined();
    expect(result.links).toBeUndefined();
  });

  it('passes through a complex result as opaque unknown', () => {
    const complexResult = {
      temperature: 22.5,
      humidity: 65.3,
      nested: { depth: 2 },
    };
    const input = {
      id: 'obs-complex',
      resultTime: '2026-02-19T14:22:03.12Z',
      result: complexResult,
    };

    const result: Observation = parseObservation(input);

    // result must be passed through exactly as-is (deep equality)
    expect(result.result).toEqual(complexResult);
  });

  it('extracts parameters when present as an object', () => {
    const input = {
      id: 'obs-params',
      resultTime: '2026-02-19T14:22:03.12Z',
      parameters: { quality: 'good', source: 'sensor-a' },
    };

    const result: Observation = parseObservation(input);

    expect(result.parameters).toEqual({
      quality: 'good',
      source: 'sensor-a',
    });
  });

  it('omits phenomenonTime when absent (NOT empty string)', () => {
    const input = {
      id: 'obs-no-phenom',
      resultTime: '2026-02-19T14:22:03.12Z',
    };

    const result: Observation = parseObservation(input);

    expect(result.phenomenonTime).toBeUndefined();
    expect(result).not.toHaveProperty('phenomenonTime');
  });

  it('throws on non-object input', () => {
    expect(() => parseObservation(null)).toThrow(
      'parseObservation: input must be a non-null object'
    );
    expect(() => parseObservation(42)).toThrow(
      'parseObservation: input must be a non-null object'
    );
    expect(() => parseObservation('string')).toThrow(
      'parseObservation: input must be a non-null object'
    );
  });

  it('ignores all cross-reference fields', () => {
    const input = {
      id: 'obs-crossref',
      resultTime: '2026-02-19T14:22:03.12Z',
      'datastream@id': '0ocb',
      'samplingFeature@id': 'xyz',
      'foi@id': 'feat-001',
    };

    const result: Observation = parseObservation(input);

    expect(result.id).toBe('obs-crossref');
    expect(result.resultTime).toBe('2026-02-19T14:22:03.12Z');
    expect(result).not.toHaveProperty('datastream@id');
    expect(result).not.toHaveProperty('samplingFeature@id');
    expect(result).not.toHaveProperty('foi@id');
  });
});

/**
 * Tests for parseControlStream().
 *
 * ControlStream is structurally parallel to Datastream — same time field
 * parsing, analogous fields. Fixtures derived from real OSH response data
 * (Smoke Test #9, Finding F30).
 *
 * @see https://docs.ogc.org/is/23-002/23-002.html#_controlstream_resources
 */
describe('parseControlStream', () => {
  // Fixture derived from OSH Smoke Test #9 F30 response — full ControlStream with all fields
  const fullControlStreamFixture = {
    id: '0o10',
    name: 'FCU Field Drone CubePilot - Location Control',
    description: 'Control stream for MAVLink navigation commands',
    'system@id': '0o30',
    'system@link': {
      href: 'http://45.55.99.236:8080/sensorhub/api/systems/0o30?f=json',
      uid: 'urn:osh:driver:mavsdk:cube',
      type: 'application/geo+json',
    },
    inputName: 'mavControl',
    validTime: ['2026-01-14T04:49:19.134Z', 'now'],
    issueTime: [
      '2026-01-14T12:42:21.910351Z',
      '2026-01-14T13:11:31.196096Z',
    ],
    executionTime: [
      '2026-01-14T12:42:21.928726Z',
      '2026-01-14T13:11:31.196096Z',
    ],
    controlledProperties: [],
    formats: [
      'application/json',
      'application/swe+json',
      'application/swe+csv',
      'application/swe+xml',
      'application/swe+binary',
    ],
    live: true,
    async: true,
    links: [
      {
        rel: 'self',
        href: '/controlstreams/0o10',
        type: 'application/json',
      },
    ],
  };

  it('extracts all fields from a full ControlStream (cross-refs excluded)', () => {
    const result: ControlStream = parseControlStream(
      fullControlStreamFixture
    );

    expect(result.id).toBe('0o10');
    expect(result.name).toBe(
      'FCU Field Drone CubePilot - Location Control'
    );
    expect(result.description).toBe(
      'Control stream for MAVLink navigation commands'
    );
    expect(result.inputName).toBe('mavControl');
    expect(result.formats).toEqual([
      'application/json',
      'application/swe+json',
      'application/swe+csv',
      'application/swe+xml',
      'application/swe+binary',
    ]);
    expect(result.controlledProperties).toEqual([]);
    expect(result.live).toBe(true);
    expect(result.async).toBe(true);
    expect(result.links).toEqual([
      {
        rel: 'self',
        href: '/controlstreams/0o10',
        type: 'application/json',
      },
    ]);

    // Cross-reference fields must NOT be in output
    expect(result).not.toHaveProperty('system@id');
    expect(result).not.toHaveProperty('system@link');
  });

  it('handles a minimal ControlStream with only required fields', () => {
    const input = {
      id: 'cs-minimal',
      name: 'Minimal Control',
      formats: ['application/json'],
      async: false,
    };

    const result: ControlStream = parseControlStream(input);

    expect(result.id).toBe('cs-minimal');
    expect(result.name).toBe('Minimal Control');
    expect(result.formats).toEqual(['application/json']);
    expect(result.async).toBe(false);
    expect(result.controlledProperties).toEqual([]);
    expect(result.issueTime).toBeNull();
    expect(result.executionTime).toBeNull();
    expect(result.live).toBeNull();
    expect(result.description).toBeUndefined();
    expect(result.inputName).toBeUndefined();
    expect(result.validTime).toBeUndefined();
  });

  it('parses all 3 time fields correctly (including "now" sentinel)', () => {
    const input = {
      id: 'cs-time',
      name: 'Time Test',
      formats: [],
      async: false,
      validTime: ['2026-01-14T04:49:19.134Z', 'now'],
      issueTime: [
        '2026-01-14T12:42:21.910Z',
        '2026-01-14T13:11:31.196Z',
      ],
      executionTime: [
        '2026-01-14T12:42:21.928Z',
        '2026-01-14T13:11:31.196Z',
      ],
    };

    const result: ControlStream = parseControlStream(input);

    // validTime: "now" sentinel → end is undefined
    expect(result.validTime?.start).toEqual(
      new Date('2026-01-14T04:49:19.134Z')
    );
    expect(result.validTime?.end).toBeUndefined();

    // issueTime: concrete start and end
    expect(result.issueTime?.start).toEqual(
      new Date('2026-01-14T12:42:21.910Z')
    );
    expect(result.issueTime?.end).toEqual(
      new Date('2026-01-14T13:11:31.196Z')
    );

    // executionTime: concrete start and end
    expect(result.executionTime?.start).toEqual(
      new Date('2026-01-14T12:42:21.928Z')
    );
    expect(result.executionTime?.end).toEqual(
      new Date('2026-01-14T13:11:31.196Z')
    );
  });

  it('normalizes controlledProperties from object and empty array forms', () => {
    // Object form with definition URIs
    const inputWithProps = {
      id: 'cs-props',
      name: 'Props Test',
      formats: [],
      async: false,
      controlledProperties: [
        {
          definition: 'http://sensorml.com/ont/swe/property/Location',
          label: 'Location',
        },
      ],
    };

    const resultWithProps: ControlStream =
      parseControlStream(inputWithProps);
    expect(resultWithProps.controlledProperties).toEqual([
      'http://sensorml.com/ont/swe/property/Location',
    ]);

    // Empty array (common in live OSH data)
    const inputEmpty = {
      id: 'cs-empty-props',
      name: 'Empty Props',
      formats: [],
      async: false,
      controlledProperties: [],
    };

    const resultEmpty: ControlStream = parseControlStream(inputEmpty);
    expect(resultEmpty.controlledProperties).toEqual([]);
  });

  it('omits optional fields when they are absent', () => {
    const input = {
      id: 'cs-no-optionals',
      name: 'No Optionals',
      formats: [],
      async: false,
    };

    const result: ControlStream = parseControlStream(input);

    expect(result).not.toHaveProperty('description');
    expect(result).not.toHaveProperty('inputName');
    expect(result).not.toHaveProperty('validTime');
  });

  it('defaults async to false when absent', () => {
    // async: true
    const inputTrue = {
      id: 'cs-async-true',
      name: 'Async True',
      formats: [],
      async: true,
    };
    expect(parseControlStream(inputTrue).async).toBe(true);

    // async: false
    const inputFalse = {
      id: 'cs-async-false',
      name: 'Async False',
      formats: [],
      async: false,
    };
    expect(parseControlStream(inputFalse).async).toBe(false);

    // async absent → defaults to false
    const inputAbsent = {
      id: 'cs-async-absent',
      name: 'Async Absent',
      formats: [],
    };
    expect(parseControlStream(inputAbsent).async).toBe(false);
  });

  it('throws on non-object input', () => {
    expect(() => parseControlStream(null)).toThrow(
      'parseControlStream: input must be a non-null object'
    );
    expect(() => parseControlStream(42)).toThrow(
      'parseControlStream: input must be a non-null object'
    );
    expect(() => parseControlStream('string')).toThrow(
      'parseControlStream: input must be a non-null object'
    );
  });
});
