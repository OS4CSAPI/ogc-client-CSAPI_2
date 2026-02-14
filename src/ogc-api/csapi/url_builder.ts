import type { OgcApiCollectionInfo } from '../model.js';
import type { QueryOptions, SystemQueryOptions } from './model.js';
import { EndpointError } from '../../shared/errors.js';
import {
  encodeResourceId,
  encodeArrayParameter,
  formatDateTimeParameter,
  validateLimit,
  validateBbox,
} from './helpers.js';

/**
 * Builds query URLs for the OGC API - Connected Systems specification.
 *
 * Constructs canonical and nested resource endpoint URLs for all 9 CSAPI
 * resource types (Part 1: systems, deployments, procedures, samplingFeatures,
 * properties; Part 2: datastreams, observations, controlStreams, commands).
 *
 * @see https://docs.ogc.org/is/23-001/23-001.html
 * @see https://docs.ogc.org/is/23-002/23-002.html
 */
export default class CSAPIQueryBuilder {
  /**
   * The set of CSAPI resource types available on this collection,
   * discovered from the collection's link relations.
   */
  public readonly availableResources: Set<string>;

  /** Base URL for resource endpoints, derived from collection links. */
  private baseUrl: string;

  /**
   * @param collection_ - The OGC API collection metadata object.
   *   Must contain a `links` array; CSAPI resource availability is
   *   discovered from link relations matching `ogc-cs:{resourceType}`.
   */
  constructor(private collection_: OgcApiCollectionInfo) {
    this.baseUrl = this.extractBaseUrl();
    this.availableResources = this.extractAvailableResources();
  }

  // ========================================
  // PRIVATE HELPERS
  // ========================================

  /**
   * Extracts the base URL for CSAPI resource endpoints from collection links.
   * Looks for a self link or falls back to the first available href.
   */
  private extractBaseUrl(): string {
    const links = this.collection_.links;
    if (!Array.isArray(links) || links.length === 0) {
      return '';
    }

    const selfLink = links.find(
      (l: { rel?: string; href?: string }) => l.rel === 'self'
    );
    if (selfLink?.href) {
      return selfLink.href.replace(/\/$/, '');
    }

    // Fall back to first link with an href
    const first = links.find(
      (l: { href?: string }) => typeof l.href === 'string'
    );
    return first?.href?.replace(/\/$/, '') ?? '';
  }

  /**
   * Discovers available CSAPI resource types from collection link relations.
   * Parses links whose `rel` matches `ogc-cs:{resourceType}`.
   * @returns Set of available resource type names (e.g., 'systems', 'datastreams').
   */
  private extractAvailableResources(): Set<string> {
    const resources = new Set<string>();
    const links = this.collection_.links;

    if (!Array.isArray(links)) {
      return resources;
    }

    for (const link of links) {
      const rel = (link as { rel?: string }).rel;
      if (typeof rel === 'string') {
        const match = rel.match(/^ogc-cs:(.+)$/);
        if (match) {
          resources.add(match[1]);
        }
      }
    }

    return resources;
  }

  /**
   * Core URL construction helper.
   * Handles canonical and nested resource endpoints.
   * @param resourceType - Resource type (systems, deployments, etc.)
   * @param id - Optional resource ID.
   * @param subPath - Optional sub-path (subsystems, datastreams, etc.)
   * @param options - Query parameters.
   * @returns Fully constructed URL string.
   */
  private buildResourceUrl(
    resourceType: string,
    id?: string,
    subPath?: string,
    options?: QueryOptions
  ): string {
    let url = `${this.baseUrl}/${resourceType}`;
    if (id) url += `/${encodeResourceId(id)}`;
    if (subPath) url += `/${subPath}`;
    return url + this.buildQueryString(options);
  }

  /**
   * Serializes query options into a URL query string.
   * Handles undefined/null skipping, array joining, temporal formatting,
   * and bbox validation.
   * @param options - Query parameter object.
   * @returns Query string with leading '?', or empty string if no params.
   */
  private buildQueryString(options?: QueryOptions): string {
    if (!options) return '';
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(options)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (key === 'bbox') {
        validateBbox(value);
        params.append(key, value.join(','));
      } else if (key === 'datetime' || key === 'phenomenonTime' || key === 'resultTime' || key === 'issueTime' || key === 'executionTime') {
        params.append(key, formatDateTimeParameter(value));
      } else if (key === 'limit') {
        validateLimit(value);
        params.append(key, String(value));
      } else if (Array.isArray(value)) {
        params.append(key, encodeArrayParameter(value));
      } else {
        params.append(key, String(value));
      }
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Validates that a resource type is available on this collection.
   * @param resourceType - The resource type to validate.
   * @throws {EndpointError} If the resource type is not available.
   */
  private assertResourceAvailable(resourceType: string): void {
    if (!this.availableResources.has(resourceType)) {
      throw new EndpointError(
        `Collection '${this.collection_.id}' does not support '${resourceType}' resource. ` +
          `Available resources: ${Array.from(this.availableResources).join(', ')}`
      );
    }
  }

  // ========================================
  // PUBLIC METHODS (proof-of-concept)
  // ========================================

  /**
   * Returns the URL for listing systems.
   *
   * @param options - Optional query parameters for filtering systems.
   * @returns URL string for the systems list endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSystems({ limit: 10 });
   * // => "https://example.com/collections/iot/systems?limit=10"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html
   */
  getSystems(options?: SystemQueryOptions): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', undefined, undefined, options);
  }

  /**
   * Returns the URL for retrieving a single system by ID.
   *
   * @param id - The system resource identifier.
   * @param options - Optional query parameters.
   * @returns URL string for the individual system endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSystem('abc123');
   * // => "https://example.com/collections/iot/systems/abc123"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html
   */
  getSystem(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id, undefined, options);
  }
}
