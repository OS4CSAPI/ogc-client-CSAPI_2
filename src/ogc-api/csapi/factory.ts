import type OgcApiEndpoint from '../endpoint.js';
import type { OgcApiCollectionInfo } from '../model.js';
import { EndpointError } from '../../shared/errors.js';
import CSAPIQueryBuilder from './url_builder.js';
import { scanCsapiLinks } from './helpers.js';

/**
 * Validates that a document has the minimum shape of an {@link OgcApiCollectionInfo}.
 */
function isCollectionInfo(doc: unknown): doc is OgcApiCollectionInfo {
  return (
    typeof doc === 'object' &&
    doc !== null &&
    'id' in doc &&
    typeof (doc as Record<string, unknown>).id === 'string'
  );
}

/**
 * Creates a {@link CSAPIQueryBuilder} for constructing Connected Systems
 * query URLs against the given collection.
 *
 * The builder discovers available resource types by inspecting the
 * collection's link relations and the root API document.
 *
 * **URL builder, not HTTP client.** The returned builder produces URL
 * strings via its `get*()` methods — the consumer is responsible for the
 * `fetch()` call (auth headers, timeouts, retries, `AbortSignal`, error
 * handling) and for handing the parsed JSON body to the matching parser
 * function. See the {@link module:csapi | csapi module docblock} for the
 * full 5-step request pattern.
 *
 * @param endpoint - An initialized OGC API endpoint instance.
 * @param collectionId - The collection identifier to create a builder for.
 * @returns A CSAPIQueryBuilder scoped to the specified collection.
 * @throws {EndpointError} If the endpoint does not support Connected Systems.
 *
 * @example
 * ```ts
 * import { OgcApiEndpoint } from '@camptocamp/ogc-client';
 * import {
 *   createCSAPIBuilder,
 *   parseDatastream,
 * } from '@camptocamp/ogc-client/csapi';
 *
 * const endpoint = new OgcApiEndpoint('https://api.example.com');
 * const builder = await createCSAPIBuilder(endpoint, 'weather-stations');
 *
 * // 1. Builder → URL string (no network call here)
 * const url = builder.getDatastreams({ limit: 50 });
 *
 * // 2. Consumer owns the fetch — auth, timeouts, retries, etc.
 * const response = await fetch(url, {
 *   headers: { Authorization: 'Bearer ...' },
 * });
 *
 * // 3. Parse the body with the matching parser
 * const body = (await response.json()) as { items: unknown[] };
 * const datastreams = body.items.map(parseDatastream);
 * ```
 *
 * @see {@link CSAPIQueryBuilder} for all available query methods
 * @see {@link module:csapi | csapi module docblock} for the request pattern
 * @see https://docs.ogc.org/is/23-001/23-001.html
 * @see https://docs.ogc.org/is/23-002/23-002.html
 */
export async function createCSAPIBuilder(
  endpoint: OgcApiEndpoint,
  collectionId: string
): Promise<CSAPIQueryBuilder> {
  if (!(await endpoint.hasConnectedSystems)) {
    throw new EndpointError('Endpoint does not support Connected Systems');
  }

  const collectionDoc = await endpoint.getCollectionDocument(collectionId);
  const rootDoc = await endpoint.root;
  const links = rootDoc?.links;
  const resourceUrls = Array.isArray(links)
    ? scanCsapiLinks(links)
    : new Map<string, string>();

  if (!isCollectionInfo(collectionDoc)) {
    throw new EndpointError(
      `Collection '${collectionId}' document is not a valid OgcApiCollectionInfo`
    );
  }

  return new CSAPIQueryBuilder(collectionDoc, resourceUrls);
}
