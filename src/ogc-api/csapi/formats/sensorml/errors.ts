/**
 * Shared error class for SensorML 3.0 parsing failures.
 *
 * All SensorML sub-parsers throw this single error class, ensuring that
 * `instanceof SensorMLParseError` checks work consistently regardless of
 * which sub-parser module throws the error.
 *
 * @see parsePhysicalSystem — `physical-system.ts`
 * @see parsePhysicalComponent — `physical-system.ts`
 * @see parseSimpleProcess — `simple-process.ts`
 * @see parseAggregateProcess — `aggregate-process.ts`
 * @module
 */

/**
 * Error thrown when SensorML parsing fails.
 *
 * Indicates that the input JSON did not conform to the expected SensorML 3.0
 * structure for the target process type (e.g., wrong `type` discriminator,
 * missing required fields, or non-object input).
 *
 * @see parsePhysicalSystem
 * @see parsePhysicalComponent
 * @see parseSimpleProcess
 * @see parseAggregateProcess
 */
export class SensorMLParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SensorMLParseError';
  }
}
