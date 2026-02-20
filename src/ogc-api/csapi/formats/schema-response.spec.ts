import { parseDatastreamSchemaResponse } from './schema-response.js';
import type { DatastreamSchemaResponse } from '../model.js';
import type {
  DataRecord,
  SweQuantity,
  SweTime,
  SweText,
  JSONEncoding,
  TypedDataField,
} from './swecommon/types.js';

describe('parseDatastreamSchemaResponse', () => {
  // ========================================
  // Test 1: JSON format response
  // ========================================

  it('parses a JSON format response with resultSchema (DataRecord + Quantity)', () => {
    // Canonical fixture from OSH Smoke Test #7 (ST#3 L263-282)
    const raw = {
      obsFormat: 'application/om+json',
      resultSchema: {
        type: 'DataRecord',
        name: 'TemperatureOutput',
        label: 'Temperature',
        description: 'UnannedSystem temperature output data',
        fields: [
          {
            type: 'Quantity',
            name: 'Temperature',
            label: 'Temperature',
            description: 'Temperature in degrees celsius',
            uom: { href: 'http://qudt.org/vocab/unit/UNITLESS' },
          },
        ],
      },
    };

    const result: DatastreamSchemaResponse =
      parseDatastreamSchemaResponse(raw);

    // obsFormat extracted as string
    expect(result.obsFormat).toBe('application/om+json');

    // resultSchema is a parsed DataRecord (not raw JSON)
    expect(result.resultSchema).toBeDefined();
    const dr = result.resultSchema as DataRecord;
    expect(dr.type).toBe('DataRecord');
    expect(dr.label).toBe('Temperature');
    expect(dr.fields).toHaveLength(1);

    // Fields are TypedDataField: { name, component: parseSWEComponent(json) }
    const f0 = dr.fields[0] as TypedDataField;
    expect(f0.name).toBe('Temperature');
    const comp0 = f0.component as SweQuantity;
    expect(comp0.type).toBe('Quantity');
    expect(comp0.uom).toEqual({ href: 'http://qudt.org/vocab/unit/UNITLESS' });

    // SWE Common format fields are absent
    expect(result.recordSchema).toBeUndefined();
    expect(result.encoding).toBeUndefined();
  });

  // ========================================
  // Test 2: SWE Common format response
  // ========================================

  it('parses a SWE Common format response with recordSchema + encoding', () => {
    const raw = {
      obsFormat: 'application/swe+json',
      recordSchema: {
        type: 'DataRecord',
        name: 'WeatherRecord',
        fields: [
          {
            type: 'Quantity',
            name: 'temperature',
            label: 'Air Temperature',
            uom: { code: 'Cel' },
          },
        ],
      },
      encoding: {
        type: 'JSONEncoding',
        recordsAsArrays: true,
      },
    };

    const result = parseDatastreamSchemaResponse(raw);

    // obsFormat extracted
    expect(result.obsFormat).toBe('application/swe+json');

    // recordSchema parsed via parseSWEComponent
    expect(result.recordSchema).toBeDefined();
    const dr = result.recordSchema as DataRecord;
    expect(dr.type).toBe('DataRecord');
    expect(dr.fields).toHaveLength(1);
    const rf0 = dr.fields[0] as TypedDataField;
    expect(rf0.name).toBe('temperature');
    expect((rf0.component as SweQuantity).type).toBe('Quantity');

    // encoding parsed via parseEncoding
    expect(result.encoding).toBeDefined();
    const enc = result.encoding as JSONEncoding;
    expect(enc.type).toBe('JSONEncoding');
    expect(enc.recordsAsArrays).toBe(true);

    // JSON format field is absent
    expect(result.resultSchema).toBeUndefined();
  });

  // ========================================
  // Test 3: Missing schema fields
  // ========================================

  it('returns only obsFormat when schema fields are absent', () => {
    const raw = {
      obsFormat: 'application/om+json',
    };

    const result = parseDatastreamSchemaResponse(raw);

    expect(result.obsFormat).toBe('application/om+json');
    expect(result.resultSchema).toBeUndefined();
    expect(result.recordSchema).toBeUndefined();
    expect(result.encoding).toBeUndefined();
  });

  // ========================================
  // Test 4: Nested DataRecord (multiple field types)
  // ========================================

  it('parses a nested DataRecord with Time + Quantity + Text fields', () => {
    const raw = {
      obsFormat: 'application/om+json',
      resultSchema: {
        type: 'DataRecord',
        name: 'MultiSensorOutput',
        fields: [
          {
            type: 'Time',
            name: 'timestamp',
            label: 'Measurement Time',
            uom: { href: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian' },
          },
          {
            type: 'Quantity',
            name: 'pressure',
            label: 'Atmospheric Pressure',
            uom: { code: 'hPa' },
          },
          {
            type: 'Text',
            name: 'status',
            label: 'Sensor Status',
          },
        ],
      },
    };

    const result = parseDatastreamSchemaResponse(raw);

    expect(result.obsFormat).toBe('application/om+json');
    expect(result.resultSchema).toBeDefined();

    const dr = result.resultSchema as DataRecord;
    expect(dr.type).toBe('DataRecord');
    expect(dr.fields).toHaveLength(3);

    // Verify each field name and parsed SWE component type
    const tf0 = dr.fields[0] as TypedDataField;
    expect(tf0.name).toBe('timestamp');
    const timeComp = tf0.component as SweTime;
    expect(timeComp.type).toBe('Time');
    expect(timeComp.uom).toEqual({
      href: 'http://www.opengis.net/def/uom/ISO-8601/0/Gregorian',
    });

    const tf1 = dr.fields[1] as TypedDataField;
    expect(tf1.name).toBe('pressure');
    const qtyComp = tf1.component as SweQuantity;
    expect(qtyComp.type).toBe('Quantity');
    expect(qtyComp.uom).toEqual({ code: 'hPa' });

    const tf2 = dr.fields[2] as TypedDataField;
    expect(tf2.name).toBe('status');
    const textComp = tf2.component as SweText;
    expect(textComp.type).toBe('Text');
  });

  // ========================================
  // Test 5: Non-object input
  // ========================================

  it('throws on non-object input', () => {
    expect(() => parseDatastreamSchemaResponse(null)).toThrow(
      'parseDatastreamSchemaResponse: input must be a non-null object'
    );
    expect(() => parseDatastreamSchemaResponse(undefined)).toThrow(
      'parseDatastreamSchemaResponse: input must be a non-null object'
    );
    expect(() => parseDatastreamSchemaResponse('string')).toThrow(
      'parseDatastreamSchemaResponse: input must be a non-null object'
    );
    expect(() => parseDatastreamSchemaResponse(42)).toThrow(
      'parseDatastreamSchemaResponse: input must be a non-null object'
    );
  });
});
