# Cross-Server Interoperability Analysis

**Date:** February 14, 2026
**Milestone:** Post Phase 2.3 — second-server comparative testing
**Servers tested:** OpenSensorHub (`http://45.55.99.236:8080/sensorhub/api`), 52North (`https://csa.demo.52north.org/`)
**Purpose:** Determine what is our bug vs. upstream, whether server behaviors are consistent, and whether our code works with both implementations.

> Based on findings from:
> - [OpenSensorHub smoke test](live-server-smoke-test-post-phase-2.3.md)
> - [52North smoke test](live-server-smoke-test-52north.md)

---

## 1. On Us or Upstream?

| Finding | Whose Bug? | Rationale |
|---------|-----------|-----------|
| **F1: Query params in href break Convention 3** | **Ours.** | Our `scanCsapiLinks` doesn't strip `?f=application/json` before extracting the path segment. Works today only by luck — HTML links (no query params) happen to appear before JSON links. |
| **F2: `featuresOfInterest` vs `samplingFeatures`** | **Shared.** | The OGC spec defines `samplingFeatures` as the resource path. 52North chose `featuresOfInterest` in their collection hrefs — that's a spec deviation on their side. But our code could be more resilient by recognizing the alias. |
| **F3: No CSAPI conformance classes** | Upstream (52North). | They just don't advertise them. |
| **F5: 500s and 404s** | Upstream (52North). | Broken server endpoints. |
| **Response envelope (`items` vs `features`)** | Upstream (OpenSensorHub). | The OGC standard specifies `FeatureCollection`/`features` — 52North follows the standard. OpenSensorHub uses a non-standard `items` key. |

**Bottom line:** Two bugs are ours (F1, F2). The rest is server-side variation.

---

## 2. Consistent or Different Server Behaviors?

**Wildly different.** These two servers diverge on nearly every dimension:

| Dimension | OpenSensorHub | 52North | Same? |
|-----------|--------------|---------|-------|
| Root doc resource links | 6 links (Convention 2) | None | ❌ |
| CSAPI conformance classes | 20+ | Zero | ❌ |
| Response envelope | `{ items: [...] }` | `{ type: "FeatureCollection", features: [...] }` | ❌ |
| Collection link hrefs | Clean paths | Paths with query params | ❌ |
| FOI naming | `samplingFeatures` | `featuresOfInterest` | ❌ |
| Data present | Yes (12 systems, 100+ obs) | All empty | ❌ |
| Broken endpoints | None | 3 (datastreams, FOI, controlstreams) | ❌ |
| Auth | Basic auth | None | ❌ |
| **Collection Convention 3 links** | **`rel: "items"` with resource href** | **`rel: "items"` with resource href** | **✅** |
| **Resource path names** | **`/systems`, `/deployments`, etc.** | **`/systems`, `/deployments`, etc.** | **✅** |
| **Query param acceptance** | **`limit`, `offset`, `bbox`, `datetime`, `q`** | **`limit`, `offset`, `bbox`, `datetime`, `q`** | **✅** |

The servers agree on the core resource paths and query parameters — which is what our URL builder produces. They disagree on essentially everything around discovery, response shape, and naming edges.

---

## 3. Does Our Code Work With Both Servers?

### URL Generation: Yes

Every URL our 28 builder methods produce gets a 200 from both servers (for all Part 1 endpoints that aren't broken server-side). This is the core of what we've built and it's solid.

### Resource Discovery: Mostly, With Two Gaps

| Discovery Mechanism | OpenSensorHub | 52North |
|-------------------|--------------|---------|
| Convention 1 (`ogc-cs:` prefix) | Not used by either | Not used by either |
| Convention 2 (plain rel name from root) | ✅ Finds 6 resources | ⚠️ No root links → finds 0 |
| Convention 3 (items + href from collections) | ✅ Full match | ⚠️ Finds 4/5 — misses `featuresOfInterest` |
| Conformance-based detection | ✅ Detects CSAPI server | ❌ Would miss this server |

On 52North, our discovery finds `systems`, `datastreams`, `procedures`, `deployments` from collections — but misses `featuresOfInterest` (F2) and is saved from the query-param bug (F1) only because HTML links happen to appear first.

### Verdict

Our URL builder is interoperable across both implementations. Our discovery layer has two latent bugs that should be fixed before Phase 3 response parsing work begins.
