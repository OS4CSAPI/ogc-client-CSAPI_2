/**
 * Barrel file for CSAPI format handlers.
 *
 * Re-exports all public symbols from individual format handler modules.
 * As new format handlers are added during Phase 3, their exports should
 * be added here.
 *
 * @module
 */

export {
  SOSA_NS,
  SENSORML_NS,
  isCSAPIFeature,
  getCSAPIResourceType,
  parseValidTime,
  isValidUri,
  validateCSAPIFeature,
  extractCSAPIFeature,
} from './geojson.js';

export type { CSAPIResourceTypeName } from './geojson.js';
