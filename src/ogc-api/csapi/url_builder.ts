import type { OgcApiCollectionInfo } from '../model.js';
import type { QueryOptions, SystemQueryOptions, DeploymentQueryOptions, ProcedureQueryOptions, SamplingFeatureQueryOptions } from './model.js';
import { CSAPIResourceTypes } from './model.js';
import { EndpointError } from '../../shared/errors.js';
import {
  encodeResourceId,
  formatDateTimeParameter,
  scanCsapiLinks,
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
   * Optional map of resource type → absolute URL, supplied when the
   * server advertises top-level (non-collection-scoped) resource URLs
   * in the root API document. When present, `buildResourceUrl()` uses
   * these absolute URLs instead of computing paths relative to the
   * collection self link.
   */
  private resourceUrls_: Map<string, string>;

  /**
   * @param collection_ - The OGC API collection metadata object.
   *   Must contain a `links` array; CSAPI resource availability is
   *   discovered from link relations matching `ogc-cs:{resourceType}`,
   *   plain resource names, or `items` links with resource hrefs.
   * @param resourceUrls - Optional map of resource type names to absolute
   *   URLs. When provided (e.g., from the root API document), these URLs
   *   are used as the base for resource endpoints instead of the
   *   collection-scoped self link. This supports servers that expose
   *   CSAPI resources at the API root (e.g., `/api/systems`) rather than
   *   under a collection path (e.g., `/collections/{id}/systems`).
   * @see https://docs.ogc.org/is/23-001/23-001.html
   */
  constructor(
    private collection_: OgcApiCollectionInfo,
    resourceUrls?: Map<string, string>
  ) {
    this.resourceUrls_ = resourceUrls ?? new Map();
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
   *
   * Recognizes three link relation conventions, in priority order:
   *
   * 1. **`ogc-cs:` prefixed** — `rel: "ogc-cs:systems"` → resource `"systems"`
   * 2. **Plain resource name** — `rel: "systems"` where the value is a known
   *    {@link CSAPIResourceTypes} member → resource `"systems"`
   * 3. **`items` with resource href** — `rel: "items"` where the `href` path
   *    ends with a known resource type name → resource extracted from href
   *
   * All three conventions populate the same Set. Duplicate entries are
   * deduplicated automatically.
   *
   * @returns Set of available resource type names (e.g., 'systems', 'datastreams').
   * @see https://docs.ogc.org/is/23-001/23-001.html
   */
  private extractAvailableResources(): Set<string> {
    const links = this.collection_.links;
    if (!Array.isArray(links)) {
      return new Set<string>();
    }
    return new Set(scanCsapiLinks(links).keys());
  }

  /**
   * Core URL construction helper.
   * Handles canonical, nested, and top-level resource endpoints.
   *
   * If the constructor received a `resourceUrls` map containing an
   * absolute URL for the given `resourceType`, that URL is used as the
   * base (top-level pattern). Otherwise, the URL is built relative to
   * the collection self link (collection-scoped pattern).
   *
   * @param resourceType - Resource type (systems, deployments, etc.)
   * @param id - Optional resource ID.
   * @param subPath - Optional sub-path (subsystems, datastreams, etc.)
   * @param options - Query parameters.
   * @returns Fully constructed URL string.
   * @see https://docs.ogc.org/is/23-001/23-001.html
   */
  private buildResourceUrl(
    resourceType: string,
    id?: string,
    subPath?: string,
    options?: QueryOptions
  ): string {
    // Use the absolute resource URL when available (top-level pattern),
    // otherwise fall back to collection-scoped base URL.
    const topLevelUrl = this.resourceUrls_.get(resourceType);
    const resourceBase = topLevelUrl
      ? topLevelUrl.replace(/\/+$/, '')
      : `${this.baseUrl}/${resourceType}`;
    let url = resourceBase;
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
        // Use plain join — URLSearchParams.append() handles percent-encoding.
        // Previously used encodeArrayParameter() here, which pre-encoded values
        // before URLSearchParams encoded them again (double-encoding bug F5).
        params.append(key, value.join(','));
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
  // SYSTEMS METHODS
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
   * @see https://docs.ogc.org/is/23-001/23-001.html#_system_resources
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
   * @see https://docs.ogc.org/is/23-001/23-001.html#_system_resources
   */
  getSystem(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id, undefined, options);
  }

  /**
   * Returns the URL for creating a new system (POST target).
   *
   * @returns URL string for the systems collection endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.createSystem();
   * // POST to => "https://example.com/collections/iot/systems"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_system_resources
   */
  createSystem(): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems');
  }

  /**
   * Returns the URL for updating an existing system (PUT target).
   *
   * @param id - The system resource identifier to update.
   * @returns URL string for the individual system endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.updateSystem('abc123');
   * // PUT to => "https://example.com/collections/iot/systems/abc123"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_system_resources
   */
  updateSystem(id: string): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id);
  }

  /**
   * Returns the URL for deleting a system (DELETE target).
   *
   * @param id - The system resource identifier to delete.
   * @returns URL string for the individual system endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.deleteSystem('abc123');
   * // DELETE to => "https://example.com/collections/iot/systems/abc123"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_system_resources
   */
  deleteSystem(id: string): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id);
  }

  /**
   * Returns the URL for retrieving a system's version history.
   *
   * @param id - The system resource identifier.
   * @param options - Optional query parameters for filtering history entries.
   * @returns URL string for the system history endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSystemHistory('abc123', { limit: 5 });
   * // => "https://example.com/collections/iot/systems/abc123/history?limit=5"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_system_history
   */
  getSystemHistory(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id, 'history', options);
  }

  /**
   * Returns the URL for listing subsystems of a system.
   *
   * @param id - The parent system resource identifier.
   * @param options - Optional query parameters. Supports `recursive` parameter
   *   to include nested subsystems at all levels.
   * @returns URL string for the system's subsystems endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSystemSubsystems('abc123', { recursive: true });
   * // => "https://example.com/collections/iot/systems/abc123/subsystems?recursive=true"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_system_resources
   */
  getSystemSubsystems(id: string, options?: SystemQueryOptions): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id, 'subsystems', options);
  }

  /**
   * Returns the URL for listing datastreams associated with a system.
   *
   * @param id - The system resource identifier.
   * @param options - Optional query parameters for filtering datastreams.
   * @returns URL string for the system's datastreams endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSystemDataStreams('abc123');
   * // => "https://example.com/collections/iot/systems/abc123/datastreams"
   * ```
   *
   * @see https://docs.ogc.org/is/23-002/23-002.html#_datastream_resources
   */
  getSystemDataStreams(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id, 'datastreams', options);
  }

  /**
   * Returns the URL for listing control streams associated with a system.
   *
   * @param id - The system resource identifier.
   * @param options - Optional query parameters for filtering control streams.
   * @returns URL string for the system's control streams endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSystemControlStreams('abc123');
   * // => "https://example.com/collections/iot/systems/abc123/controlstreams"
   * ```
   *
   * @see https://docs.ogc.org/is/23-002/23-002.html#_controlstream_resources
   */
  getSystemControlStreams(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id, 'controlstreams', options);
  }

  /**
   * Returns the URL for listing sampling features associated with a system.
   *
   * @param id - The system resource identifier.
   * @param options - Optional query parameters for filtering sampling features.
   * @returns URL string for the system's sampling features endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSystemSamplingFeatures('abc123');
   * // => "https://example.com/collections/iot/systems/abc123/samplingFeatures"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_sampling_feature_resources
   */
  getSystemSamplingFeatures(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id, 'samplingFeatures', options);
  }

  /**
   * Returns the URL for listing deployments associated with a system.
   *
   * @param id - The system resource identifier.
   * @param options - Optional query parameters for filtering deployments.
   * @returns URL string for the system's deployments endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSystemDeployments('abc123');
   * // => "https://example.com/collections/iot/systems/abc123/deployments"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_deployment_resources
   */
  getSystemDeployments(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id, 'deployments', options);
  }

  /**
   * Returns the URL for listing procedures associated with a system.
   *
   * @param id - The system resource identifier.
   * @param options - Optional query parameters for filtering procedures.
   * @returns URL string for the system's procedures endpoint.
   * @throws {EndpointError} If 'systems' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSystemProcedures('abc123');
   * // => "https://example.com/collections/iot/systems/abc123/procedures"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_procedure_resources
   */
  getSystemProcedures(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('systems');
    return this.buildResourceUrl('systems', id, 'procedures', options);
  }

  // ========================================
  // DEPLOYMENTS METHODS
  // ========================================

  /**
   * Returns the URL for querying the deployments collection.
   *
   * @param options - Optional query parameters for filtering, pagination, bbox,
   *   datetime, sorting, and deployment-specific filters.
   * @returns URL string for the deployments collection endpoint.
   * @throws {EndpointError} If 'deployments' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getDeployments({ limit: 10, bbox: [-180, -90, 180, 90] });
   * // => "https://example.com/collections/iot/deployments?limit=10&bbox=-180%2C-90%2C180%2C90"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_deployment_resources
   */
  getDeployments(options?: DeploymentQueryOptions): string {
    this.assertResourceAvailable('deployments');
    return this.buildResourceUrl('deployments', undefined, undefined, options);
  }

  /**
   * Returns the URL for retrieving a single deployment by ID.
   *
   * @param id - The deployment resource identifier.
   * @param options - Optional query parameters.
   * @returns URL string for the individual deployment endpoint.
   * @throws {EndpointError} If 'deployments' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getDeployment('dep-001');
   * // => "https://example.com/collections/iot/deployments/dep-001"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_deployment_resources
   */
  getDeployment(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('deployments');
    return this.buildResourceUrl('deployments', id, undefined, options);
  }

  /**
   * Returns the URL for creating a new deployment (POST target).
   *
   * @returns URL string for the deployments collection endpoint.
   * @throws {EndpointError} If 'deployments' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.createDeployment();
   * // POST to => "https://example.com/collections/iot/deployments"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_deployment_resources
   */
  createDeployment(): string {
    this.assertResourceAvailable('deployments');
    return this.buildResourceUrl('deployments');
  }

  /**
   * Returns the URL for updating an existing deployment (PUT target).
   *
   * @param id - The deployment resource identifier to update.
   * @returns URL string for the individual deployment endpoint.
   * @throws {EndpointError} If 'deployments' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.updateDeployment('dep-001');
   * // PUT to => "https://example.com/collections/iot/deployments/dep-001"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_deployment_resources
   */
  updateDeployment(id: string): string {
    this.assertResourceAvailable('deployments');
    return this.buildResourceUrl('deployments', id);
  }

  /**
   * Returns the URL for deleting a deployment (DELETE target).
   *
   * @param id - The deployment resource identifier to delete.
   * @returns URL string for the individual deployment endpoint.
   * @throws {EndpointError} If 'deployments' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.deleteDeployment('dep-001');
   * // DELETE to => "https://example.com/collections/iot/deployments/dep-001"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_deployment_resources
   */
  deleteDeployment(id: string): string {
    this.assertResourceAvailable('deployments');
    return this.buildResourceUrl('deployments', id);
  }

  /**
   * Returns the URL for listing subdeployments of a deployment.
   *
   * @param id - The parent deployment resource identifier.
   * @param options - Optional query parameters. Supports `recursive` parameter
   *   to include nested subdeployments at all levels.
   * @returns URL string for the deployment's subdeployments endpoint.
   * @throws {EndpointError} If 'deployments' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getDeploymentSubdeployments('dep-001', { recursive: true });
   * // => "https://example.com/collections/iot/deployments/dep-001/subdeployments?recursive=true"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_deployment_resources
   */
  getDeploymentSubdeployments(id: string, options?: DeploymentQueryOptions): string {
    this.assertResourceAvailable('deployments');
    return this.buildResourceUrl('deployments', id, 'subdeployments', options);
  }

  /**
   * Returns the URL for listing systems associated with a deployment.
   *
   * @param id - The deployment resource identifier.
   * @param options - Optional query parameters for filtering systems.
   * @returns URL string for the deployment's systems endpoint.
   * @throws {EndpointError} If 'deployments' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getDeploymentSystems('dep-001');
   * // => "https://example.com/collections/iot/deployments/dep-001/systems"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_deployment_resources
   */
  getDeploymentSystems(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('deployments');
    return this.buildResourceUrl('deployments', id, 'systems', options);
  }

  /**
   * Returns the URL for retrieving a deployment's version history.
   *
   * @param id - The deployment resource identifier.
   * @param options - Optional query parameters for filtering history entries.
   * @returns URL string for the deployment history endpoint.
   * @throws {EndpointError} If 'deployments' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getDeploymentHistory('dep-001', { limit: 5 });
   * // => "https://example.com/collections/iot/deployments/dep-001/history?limit=5"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_deployment_history
   */
  getDeploymentHistory(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('deployments');
    return this.buildResourceUrl('deployments', id, 'history', options);
  }

  // ========================================
  // PROCEDURES METHODS
  // ========================================

  /**
   * Returns the URL for listing procedures.
   *
   * @param options - Optional query parameters for filtering procedures.
   *   Procedures support: `id`, `uid`, `q`, `limit`, `offset`, `f`.
   *   Procedures do NOT support `bbox`, `datetime`, `parent`, or `recursive`.
   * @returns URL string for the procedures list endpoint.
   * @throws {EndpointError} If 'procedures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getProcedures({ limit: 10, q: 'thermometer' });
   * // => "https://example.com/collections/iot/procedures?limit=10&q=thermometer"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_procedure_resources
   */
  getProcedures(options?: ProcedureQueryOptions): string {
    this.assertResourceAvailable('procedures');
    return this.buildResourceUrl('procedures', undefined, undefined, options);
  }

  /**
   * Returns the URL for retrieving a single procedure by ID.
   *
   * @param id - The procedure resource identifier.
   * @param options - Optional query parameters.
   * @returns URL string for the individual procedure endpoint.
   * @throws {EndpointError} If 'procedures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getProcedure('proc-001');
   * // => "https://example.com/collections/iot/procedures/proc-001"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_procedure_resources
   */
  getProcedure(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('procedures');
    return this.buildResourceUrl('procedures', id, undefined, options);
  }

  /**
   * Returns the URL for creating a new procedure (POST target).
   *
   * @returns URL string for the procedures collection endpoint.
   * @throws {EndpointError} If 'procedures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.createProcedure();
   * // POST to => "https://example.com/collections/iot/procedures"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_procedure_resources
   */
  createProcedure(): string {
    this.assertResourceAvailable('procedures');
    return this.buildResourceUrl('procedures');
  }

  /**
   * Returns the URL for updating an existing procedure (PUT target).
   *
   * @param id - The procedure resource identifier to update.
   * @returns URL string for the individual procedure endpoint.
   * @throws {EndpointError} If 'procedures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.updateProcedure('proc-001');
   * // PUT to => "https://example.com/collections/iot/procedures/proc-001"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_procedure_resources
   */
  updateProcedure(id: string): string {
    this.assertResourceAvailable('procedures');
    return this.buildResourceUrl('procedures', id);
  }

  /**
   * Returns the URL for deleting a procedure (DELETE target).
   *
   * @param id - The procedure resource identifier to delete.
   * @returns URL string for the individual procedure endpoint.
   * @throws {EndpointError} If 'procedures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.deleteProcedure('proc-001');
   * // DELETE to => "https://example.com/collections/iot/procedures/proc-001"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_procedure_resources
   */
  deleteProcedure(id: string): string {
    this.assertResourceAvailable('procedures');
    return this.buildResourceUrl('procedures', id);
  }

  /**
   * Returns the URL for listing systems that implement a procedure.
   *
   * @param id - The procedure resource identifier.
   * @param options - Optional query parameters for filtering systems.
   * @returns URL string for the procedure's systems endpoint.
   * @throws {EndpointError} If 'procedures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getProcedureSystems('proc-001', { limit: 5 });
   * // => "https://example.com/collections/iot/procedures/proc-001/systems?limit=5"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_procedure_resources
   */
  getProcedureSystems(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('procedures');
    return this.buildResourceUrl('procedures', id, 'systems', options);
  }

  /**
   * Returns the URL for listing datastreams associated with a procedure.
   *
   * @param id - The procedure resource identifier.
   * @param options - Optional query parameters for filtering datastreams.
   * @returns URL string for the procedure's datastreams endpoint.
   * @throws {EndpointError} If 'procedures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getProcedureDataStreams('proc-001');
   * // => "https://example.com/collections/iot/procedures/proc-001/datastreams"
   * ```
   *
   * @see https://docs.ogc.org/is/23-002/23-002.html#_datastream_resources
   */
  getProcedureDataStreams(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('procedures');
    return this.buildResourceUrl('procedures', id, 'datastreams', options);
  }

  /**
   * Returns the URL for retrieving a procedure's version history.
   *
   * @param id - The procedure resource identifier.
   * @param options - Optional query parameters for filtering history entries.
   * @returns URL string for the procedure history endpoint.
   * @throws {EndpointError} If 'procedures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getProcedureHistory('proc-001', { limit: 5 });
   * // => "https://example.com/collections/iot/procedures/proc-001/history?limit=5"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_procedure_history
   */
  getProcedureHistory(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('procedures');
    return this.buildResourceUrl('procedures', id, 'history', options);
  }

  // ========================================
  // SAMPLING FEATURES METHODS
  // ========================================

  /**
   * Returns the URL for listing sampling features.
   *
   * @param options - Optional query parameters for filtering sampling features.
   *   Sampling features support: `id`, `uid`, `q`, `bbox`, `datetime`, `limit`, `offset`, `f`.
   *   Sampling features do NOT support `parent`, `recursive`, or cursor-based pagination.
   * @returns URL string for the sampling features list endpoint.
   * @throws {EndpointError} If 'samplingFeatures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSamplingFeatures({ bbox: [-180, -90, 180, 90], limit: 20 });
   * // => "https://example.com/collections/iot/samplingFeatures?bbox=-180%2C-90%2C180%2C90&limit=20"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_sampling_feature_resources
   */
  getSamplingFeatures(options?: SamplingFeatureQueryOptions): string {
    this.assertResourceAvailable('samplingFeatures');
    return this.buildResourceUrl('samplingFeatures', undefined, undefined, options);
  }

  /**
   * Returns the URL for retrieving a single sampling feature by ID.
   *
   * @param id - The sampling feature resource identifier.
   * @param options - Optional query parameters.
   * @returns URL string for the individual sampling feature endpoint.
   * @throws {EndpointError} If 'samplingFeatures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSamplingFeature('sf-001');
   * // => "https://example.com/collections/iot/samplingFeatures/sf-001"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_sampling_feature_resources
   */
  getSamplingFeature(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('samplingFeatures');
    return this.buildResourceUrl('samplingFeatures', id, undefined, options);
  }

  /**
   * Returns the URL for creating a new sampling feature (POST target).
   *
   * @returns URL string for the sampling features collection endpoint.
   * @throws {EndpointError} If 'samplingFeatures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.createSamplingFeature();
   * // POST to => "https://example.com/collections/iot/samplingFeatures"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_sampling_feature_resources
   */
  createSamplingFeature(): string {
    this.assertResourceAvailable('samplingFeatures');
    return this.buildResourceUrl('samplingFeatures');
  }

  /**
   * Returns the URL for updating an existing sampling feature (PUT target).
   *
   * @param id - The sampling feature resource identifier to update.
   * @returns URL string for the individual sampling feature endpoint.
   * @throws {EndpointError} If 'samplingFeatures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.updateSamplingFeature('sf-001');
   * // PUT to => "https://example.com/collections/iot/samplingFeatures/sf-001"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_sampling_feature_resources
   */
  updateSamplingFeature(id: string): string {
    this.assertResourceAvailable('samplingFeatures');
    return this.buildResourceUrl('samplingFeatures', id);
  }

  /**
   * Returns the URL for deleting a sampling feature (DELETE target).
   *
   * @param id - The sampling feature resource identifier to delete.
   * @returns URL string for the individual sampling feature endpoint.
   * @throws {EndpointError} If 'samplingFeatures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.deleteSamplingFeature('sf-001');
   * // DELETE to => "https://example.com/collections/iot/samplingFeatures/sf-001"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_sampling_feature_resources
   */
  deleteSamplingFeature(id: string): string {
    this.assertResourceAvailable('samplingFeatures');
    return this.buildResourceUrl('samplingFeatures', id);
  }

  /**
   * Returns the URL for listing systems associated with a sampling feature.
   *
   * @param id - The sampling feature resource identifier.
   * @param options - Optional query parameters for filtering systems.
   * @returns URL string for the sampling feature's systems endpoint.
   * @throws {EndpointError} If 'samplingFeatures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSamplingFeatureSystems('sf-001', { limit: 5 });
   * // => "https://example.com/collections/iot/samplingFeatures/sf-001/systems?limit=5"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_sampling_feature_resources
   */
  getSamplingFeatureSystems(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('samplingFeatures');
    return this.buildResourceUrl('samplingFeatures', id, 'systems', options);
  }

  /**
   * Returns the URL for listing observations associated with a sampling feature.
   *
   * This is a Part 2 cross-reference endpoint linking Part 1 sampling features
   * to Part 2 observation data.
   *
   * @param id - The sampling feature resource identifier.
   * @param options - Optional query parameters for filtering observations.
   * @returns URL string for the sampling feature's observations endpoint.
   * @throws {EndpointError} If 'samplingFeatures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSamplingFeatureObservations('sf-001');
   * // => "https://example.com/collections/iot/samplingFeatures/sf-001/observations"
   * ```
   *
   * @see https://docs.ogc.org/is/23-002/23-002.html#_observation_resources
   */
  getSamplingFeatureObservations(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('samplingFeatures');
    return this.buildResourceUrl('samplingFeatures', id, 'observations', options);
  }

  /**
   * Returns the URL for retrieving a sampling feature's version history.
   *
   * @param id - The sampling feature resource identifier.
   * @param options - Optional query parameters for filtering history entries.
   * @returns URL string for the sampling feature history endpoint.
   * @throws {EndpointError} If 'samplingFeatures' is not available on this collection.
   *
   * @example
   * ```ts
   * const url = builder.getSamplingFeatureHistory('sf-001', { limit: 5 });
   * // => "https://example.com/collections/iot/samplingFeatures/sf-001/history?limit=5"
   * ```
   *
   * @see https://docs.ogc.org/is/23-001/23-001.html#_sampling_feature_history
   */
  getSamplingFeatureHistory(id: string, options?: QueryOptions): string {
    this.assertResourceAvailable('samplingFeatures');
    return this.buildResourceUrl('samplingFeatures', id, 'history', options);
  }
}
