# ogc-client [![Latest version on NPM](https://img.shields.io/npm/v/%40camptocamp%2Fogc-client)](https://www.npmjs.com/package/@camptocamp/ogc-client) [![Latest @dev version on NPM](https://img.shields.io/npm/v/%40camptocamp%2Fogc-client/dev)](https://www.npmjs.com/package/@camptocamp/ogc-client?activeTab=versions)

> A Typescript library for interacting with [OGC-compliant services](https://www.ogc.org/docs/is)

**ogc-client** is a Typescript library which implements several OGC standards and will help you interact with
them in a user-friendly and consistent way.

[Documentation and live demo here!](https://camptocamp.github.io/ogc-client/)

The following standards are partially implemented:

- WMS - _Web Map Service_
- WFS - _Web Feature Service_
- WMTS - _Web Map Tile Service_
- OGC API (Records and Features)
- TMS - _Tile Map Service_
- STAC API - _SpatioTemporal Asset Catalog_

## Why use it?

1. **ogc-client** will abstract the service version so you don't have to worry about it
2. **ogc-client** will handle XML so you only have to deal with native Javascript objects
3. **ogc-client** will hide the complexity of OGC standards behind straightforward APIs
4. **ogc-client** will run heavy tasks in a worker to avoid blocking the main thread
5. **ogc-client** will keep a persistent cache of operations to minimize requests and processing
6. **ogc-client** will tell you if a service is not usable for [CORS-related issues](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## Instructions

To install **ogc-client**, run:

```bash
$ npm install --save @camptocamp/ogc-client
```

To use, import API symbols like so:

```js
import { WmsEndpoint, WfsEndpoint, StacEndpoint } from '@camptocamp/ogc-client';
```

Note: if you want to disable web worker usage, for example to solve issues with the `Referer` header on outgoing
requests, use:

```js
import { enableFallbackWithoutWorker } from '@camptocamp/ogc-client';

enableFallbackWithoutWorker();
```

All processing will be done on the main thread after this call, including HTTP requests.

### Use the latest development version

[The `@camptocamp/ogc-client` NPM package](https://www.npmjs.com/package/@camptocamp/ogc-client) is updated on every commit on the `main` branch under the `@dev` tag. To use it:

```bash
$ npm install --save @camptocamp/ogc-client@dev
```

### Application

A provided application containing the documentation and demo is located in the `app` folder.
To start it locally, clone the repository and run the following commands:

```bash
$ npm install
$ cd app
$ npm install
$ npm start
```

The app is based on [Vue.js](https://vuejs.org/) and will showcase most features implemented in the library.
You will need to supply it with valid OGC service urls.

## Quick Examples

### STAC API

See the [`examples/`](./examples/) directory for more complete examples, including:

- `examples/stac-query.js` - Full STAC API query example with spatial and temporal filters

Run examples with:

```bash
npm run build
node examples/stac-query.js
```

### OGC API — Connected Systems (Parts 1 & 2)

The `csapi` sub-module provides a **URL builder + response parsers** for the
[OGC API — Connected Systems](https://docs.ogc.org/is/23-002/23-002.html)
standards. It is **not an HTTP client** — `CSAPIQueryBuilder.get*()` methods
return URL strings, and the consumer owns the `fetch()` call (auth headers,
timeouts, retries, `AbortSignal`, error handling). This mirrors the design of
`EDRQueryBuilder` (see [`src/ogc-api/edr`](./src/ogc-api/edr)) — same pattern,
same rationale.

**The 5-step request pattern:**

1. Construct an `OgcApiEndpoint` for the API root.
2. Build a `CSAPIQueryBuilder` for the target collection.
3. Call a `get*()` method to obtain a URL string.
4. Issue the request yourself with `fetch` (or any HTTP client).
5. Hand the parsed JSON body to the matching parser.

```ts
import { OgcApiEndpoint } from '@camptocamp/ogc-client';
import {
  createCSAPIBuilder,
  parseDatastream,
} from '@camptocamp/ogc-client/csapi';

// 1. Endpoint → 2. Builder → 3. URL
const endpoint = new OgcApiEndpoint('https://api.example.com');
const builder = await createCSAPIBuilder(endpoint, 'weather-stations');
const url = builder.getDataStreams({ limit: 10 });

// 4. Consumer-owned fetch — add auth, timeouts, retries as needed
const response = await fetch(url, {
  headers: { Authorization: 'Bearer <token>' },
  signal: AbortSignal.timeout(10_000),
});
if (!response.ok) {
  throw new Error(`CSAPI request failed: ${response.status}`);
}

// 5. Parse the body with the matching parser
const body = (await response.json()) as { items: unknown[] };
const datastreams = body.items.map(parseDatastream);
```
