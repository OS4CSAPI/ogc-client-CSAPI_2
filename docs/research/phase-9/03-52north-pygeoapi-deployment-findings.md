# 52°North `connected-systems-pygeoapi` — Deployment & Sample-Data Research

**Date range:** 2026-05-08 → 2026-05-09
**Target server:** `https://129-80-248-53.sslip.io/csapi-pygeoapi`
**Backend revision:** [`52North/connected-systems-pygeoapi`](https://github.com/52North/connected-systems-pygeoapi) commit `18c1ce80`, atop `pygeoapi` (52North fork, pin `ec1eb38d9a64d93ec9a2e1b9db6fea6dc05f194a`)
**Author of findings:** automated stand-up + load by Copilot, captured for the Tier-2 leg of Phase 9 live testing

---

## 0. TL;DR

- The 52°North fork is **buildable, runnable and externally reachable** behind Caddy on the Oracle box. Four containers (api / es01 / timescaledb / setup) run cleanly under the patched compose file.
- Bringing the image up required **three Dockerfile/pyproject patches** to get past ARM64-Alpine compile failures and `uv` virtualenv mis-targeting. None of these are documented upstream.
- The CSA write surface this build exposes is **narrower** than the OGC API – Connected Systems Part 1 spec: 6 collections accept POST, 4 are read-only, and 5 spec'd collections (`controlstreams`, `commands`, `systemEvents`, `systemHistory`, `features`) **do not exist** in this build at all.
- Several spec-level features that *do* exist are **broken at retrieval time**: e.g. `POST /systems/{id}/samplingFeatures` returns 201, but `GET /samplingFeatures` returns an empty collection and `GET /samplingFeatures/{id}` returns 500.
- The OpenAPI doc at `/openapi?f=json` is **incomplete** — it lists 11 paths and omits `/datastreams`, `/observations`, `/procedures`, `/properties` even though they all respond. Treat it as a hint, not as an inventory.
- A reusable, stdlib-only seeder ([`seed_pygeoapi.py`](./seed_pygeoapi.py)) now loads a varied multi-resource graph (procedures, systems, deployments, datastreams, observations) for SDK-level testing. Captured wire evidence is in [`captures/oracle-pygeoapi/`](./captures/oracle-pygeoapi/).
- Pointing existing OS4CSAPI Go-publishers at this server is **structurally infeasible** without a full payload rewrite (not field injection). That blocker is documented separately and the cloned tree at `/home/ubuntu/iss-publisher-pygeoapi/` is left as a dormant starting point.

---

## 1. Environment

### 1.1 Box

| Property | Value |
| --- | --- |
| Host | Oracle Cloud VM, `129.80.248.53` (sslip.io: `129-80-248-53.sslip.io`) |
| OS | Ubuntu 22.04, ARM64 (`aarch64`) |
| Resources | 1 vCPU, 6 GB RAM (cramped — see §2.4) |
| User | `ubuntu` |
| SSH key | `$env:USERPROFILE\.ssh-oracle-deploy\oracle.key` |
| Reverse proxy | Caddy v2 (system service) |
| Container runtime | Docker + Compose v2 |

### 1.2 Stack

| Component | Image / Version |
| --- | --- |
| `connected-systems-api` | local build of `csapi-pygeoapi:local` (3rd rebuild) |
| Elasticsearch | `docker.elastic.co/elasticsearch/elasticsearch:8.7.1` (TLS + security on) |
| TimescaleDB | `timescale/timescaledb:latest-pg16` |
| ES bootstrap | one-shot `setup` service (creates roles + certs) |

### 1.3 Public URL → backend

```
https://129-80-248-53.sslip.io/csapi-pygeoapi/*
   └─> Caddy `handle_path /csapi-pygeoapi/*`
       └─> http://localhost:8285  (api container, host-published)
```

Caddyfile backup at `/etc/caddy/Caddyfile.bak.pre-pygeoapi`.

### 1.4 Authoritative compose file

[`docs/research/oracle-deploy/docker-compose.deploy.yml`](../oracle-deploy/docker-compose.deploy.yml) is the local source of truth and is what was scp'd onto the box. Two non-default decisions matter:

1. The `setup` service uses a YAML literal-block (`|`) heredoc to write `instances.yml` for ES. Anything else trips Compose's escape parsing.
2. `es01` declares `depends_on: setup: condition: service_completed_successfully` so the API never tries to talk to ES while the bootstrap script is still running.

---

## 2. Image build — what broke and why

The upstream `Dockerfile` and `pyproject.toml` cannot build cleanly on ARM64 / Alpine without intervention. **All three of the following patches were required**, in order, before `docker compose build api` would succeed.

### 2.1 `uv venv` ignored Alpine's system Python

**Symptom:** at runtime, `import shapely` failed despite `apk add py3-shapely` in the build.

**Root cause:** `uv venv` (in the Dockerfile) was invoked without `--python`, so `uv` downloaded its own managed CPython into the venv. That interpreter has no path into Alpine's `/usr/lib/python3.*/site-packages`, so `py3-shapely` was invisible.

**Fix (Dockerfile):**

```diff
- RUN uv venv --system-site-packages
+ RUN uv venv --system-site-packages --python /usr/bin/python3
```

This forces `uv` to build the venv against Alpine's interpreter, which **does** see `py3-shapely`.

### 2.2 `pyproject.toml` had a redundant `shapely==2.6.0` pin and a broken `override-dependencies` block

**Symptom:** `uv pip install` resolved `shapely` to the broken `2.6.0` build, ignoring the system-installed version.

**Fix (pyproject.toml — backup at `~/csapi-pygeoapi/pyproject.toml.bak`):**

- Removed the duplicate top-level `shapely==2.6.0` entry from `dependencies`.
- Removed the `[tool.uv]` `override-dependencies` block entirely (it was forcing a wheel-only resolution that doesn't exist for ARM64).
- Set `tool.uv.build-constraint-dependencies` to `shapely==2.0.6` (the version `py3-shapely` actually provides on Alpine 3.20).

### 2.3 `rasterio` failed to compile on ARM64 with the default toolchain

**Symptom:** linker errors during `rasterio` wheel build.

**Fix (Dockerfile):** install `clang` and `lld` before the `uv pip install` step, and export `CC=clang LD=lld` for that layer. Standard ARM64-rasterio remedy.

### 2.4 Build resource pressure

The 1-vCPU box can run `docker compose build api` in ≈8–12 min. SSH **stalls indefinitely** while the build is contending for CPU and ES is also up. Standard practice from then on:

- Use `ssh -o ConnectTimeout=15` everywhere.
- Run any long terminal operation under `mode=async` so it doesn't time out the calling tool.
- Don't keep unnecessary terminals open; each ssh session pins a small amount of memory.

---

## 3. Reverse-proxy layer

### 3.1 Caddy snippet

```caddy
handle_path /csapi-pygeoapi/* {
    reverse_proxy localhost:8285
}
```

### 3.2 The tab-vs-space gotcha

Editing `/etc/caddy/Caddyfile` with `sed -i` against a heredoc that mixed tabs and spaces produced a Caddy config that **parsed** but **served 404 for every CSA path**. The fix was to rewrite the snippet using only spaces, restart Caddy, and verify with `caddy validate`.

### 3.3 Backend `server.url` mis-config (still open)

Inside `pygeoapi.config.yml`, `server.url` is `http://localhost:5000`. As a result, **`href` values inside `/collections` responses point at `http://localhost:5000/...`** instead of the public base URL. Clients that follow these links break. This is a config issue, not a Caddy issue, and is **not yet patched** because the configmap lives inside the container image and would require a rebuild. Tracked in the captures README.

---

## 4. CSA write surface — empirically discovered

The single most useful artifact for any client-side work against this server is the **actual write surface**. I enumerated it by:

1. Probing every spec'd collection with `GET /<collection>` (200 / 404).
2. Probing each existing collection with `POST /<collection>` (201 / 405 / 400).
3. For 405s, walking the parent path (`/systems/{id}/...`).
4. Inspecting validation errors to recover required-field schemas.

### 4.1 Existence map

| Spec'd collection | `GET /<collection>` | Notes |
| --- | --- | --- |
| `procedures`        | 200 | writable |
| `systems`           | 200 | writable |
| `deployments`       | 200 | writable |
| `datastreams`       | 200 | nested-write only |
| `observations`      | 200 | nested-write only |
| `samplingFeatures`  | 200 | nested-write only, **listing broken** |
| `properties`        | 200 | **read-only** in this build |
| `controlstreams`    | 404 | absent from this build |
| `commands`          | 404 | absent from this build |
| `systemEvents`      | 404 | absent from this build |
| `systemHistory`     | 404 | absent from this build |
| `features`          | 404 | absent from this build |

### 4.2 Write paths and content-types

| Endpoint | Content-Type | Required top-level fields |
| --- | --- | --- |
| `POST /procedures`                      | `application/sml+json` | `name`, `definition` |
| `POST /systems`                         | `application/sml+json` | `name`, `definition` (`position` recommended) |
| `POST /deployments`                     | `application/sml+json` | `name`, `definition`, `validTime` (real ISO dates), **NOT** `deployedSystems` (see §5.2) |
| `POST /systems/{id}/samplingFeatures`   | `application/json`     | `name`, `definition`, `geometry` |
| `POST /systems/{id}/datastreams`        | `application/json`     | `name`, `system@link`, `observedProperties[]`, `phenomenonTime`, `resultTime`, `resultType`, `formats[]`, `schema` |
| `POST /datastreams/{id}/observations`   | `application/json`     | `datastream@id`, `phenomenonTime`, `resultTime`, `result` |

### 4.3 Read-only collections

| Endpoint | POST result |
| --- | --- |
| `POST /samplingFeatures`  | 405 (`Allow: GET, PUT, DELETE, HEAD, OPTIONS`). Top-level write was removed; create via `/systems/{id}/samplingFeatures`. |
| `POST /properties`        | 405. **No nested write path was found**, so this build effectively has no way to create `ObservedProperty` resources. The collection is permanently empty. |

---

## 5. Schema and validation findings

### 5.1 Authentication

There is **no auth** on any write endpoint in this build. `HTTPBasicAuth` headers are accepted and ignored. Any HTTPS client can POST. *(Not safe for prod; this is a research deploy.)*

### 5.2 The `deployedSystems` KeyError

`POST /deployments` with a `deployedSystems[]` array containing `{name, system@link}` (the spec-shaped form) **crashes** with:

```
400 InvalidParameterValue: ["'system'"]
```

The validator looks up a flat key called `system` instead of walking the nested `system@link.href`. Workaround for this build: omit `deployedSystems` entirely and rely on the implicit relation through `/systems/{id}/deployments` listings. This is a **bug**, not a spec choice, and is worth filing upstream.

### 5.3 The `validTime: ".."` sentinel rejection

OS4CSAPI / OSH-style payloads use `".."` as an open-ended ISO time sentinel (e.g. `validTime: ["2024-01-01T00:00:00Z", ".."]`). This build rejects `..` outright and demands real ISO 8601 datetimes on both endpoints. For demo data we use `now ± 365 days`.

### 5.4 The `application/sml+json` content-type requirement

`POST /procedures`, `/systems`, `/deployments` **must** be sent with `Content-Type: application/sml+json`. Sending `application/json` returns 400 with a misleading "name required" message even when `name` is present. (Took an embarrassingly long time to debug.)

### 5.5 Required fields are positional, not nullable

Every CSA validator complains about `name` and `definition` first, regardless of what other fields are wrong. A 400 saying `'name': ['Value required for this field.']` does **not** mean `name` is missing — it usually means the content-type is wrong and the parser bailed before hitting the JSON body.

### 5.6 Default `/systems` view filters out positionless systems

`GET /systems` (no Accept header) returns a GeoJSON `FeatureCollection`, **filtering out** any system that lacks a top-level `geometry`. This is surprising because the seeded systems carry `position` (a SensorML-style Point), which the GeoJSON view doesn't pick up. To enumerate **all** systems use either:

```http
GET /systems?f=smljson
Accept: application/sml+json
```

### 5.7 OpenAPI doc is incomplete

`/openapi?f=json` declares only 11 paths:

```
/, /collections, /collections/{systemCollectionId}/items,
/conformance, /deployments/{deploymentId}/systems, /openapi,
/systems, /systems/{systemId}, /systems/{systemId}/deployments,
/systems/{systemId}/members, /systems/{systemId}/samplingFeatures
```

It omits `/datastreams`, `/observations`, `/procedures`, `/properties`, and the nested write paths under `/systems/{id}/datastreams` and `/datastreams/{id}/observations`. **All of those endpoints work**; the OpenAPI generator just doesn't know about them. Don't trust it for SDK code-generation.

### 5.8 PowerShell `ConvertFrom-Json` case collision

The OpenAPI doc has `Deployment` and `deployment` as sibling object keys. PowerShell's default `ConvertFrom-Json` is case-insensitive and **throws** on this. Workaround: `ConvertFrom-Json -AsHashtable`.

### 5.9 `Content-Type: None` on the landing page

`GET /?f=json` returns a JSON body but emits the literal string `None` as the `Content-Type` header. Any strict client that does MIME-sniffing will reject the body. This was already documented in the captures README under sub-finding #1.

---

## 6. Sample-data load

### 6.1 First pass — bundled simulator (50 obs, single system/datastream)

`tools/simulator/simulator.py` ships with the upstream repo. It defaults to 1,000,000 observations (way too many for a 6 GB box) and uses `HTTPBasicAuth('test', 'test')` even though this build doesn't auth. Two `sed` patches:

```bash
sed -i 's|num_of_obs_to_insert = 1_000_000|num_of_obs_to_insert = 50|' /tmp/sim.py
sed -i 's|HTTPBasicAuth.*test., .test..|None|; s|, auth=basic||' /tmp/sim.py
sudo docker cp /tmp/sim.py csapi-pygeoapi-connected-systems-api-1:/app/sim.py
sudo docker exec csapi-pygeoapi-connected-systems-api-1 uv run python /app/sim.py
```

Result: 1 `PhysicalSystem` (Outdoor Thermometer 001) + 1 datastream + 50 obs. **Useful as a baseline but far too narrow** for SDK testing.

### 6.2 Second pass — multi-resource seeder ([`seed_pygeoapi.py`](./seed_pygeoapi.py))

Stdlib-only Python (`urllib`), runs from the box host or inside the container. Posts to every writable endpoint in §4.2 with realistic payloads:

- 2 procedures (thermometer, anemometer)
- 3 systems (`PhysicalSystem` × 2, `PhysicalComponent` × 1) at varied geographic positions (NYC, Paris, Münster)
- 1 deployment per system
- 1 sampling feature per system (POSTed; retrieval broken — see §6.4)
- 5 datastreams covering air temp / wind speed / humidity / pressure / indoor temp
- N observations per stream (default 24, configurable via `--obs-per-stream`)

Run multiple disjoint batches with `--suffix bN`:

```powershell
$key = "$env:USERPROFILE\.ssh-oracle-deploy\oracle.key"
scp -i $key docs/research/phase-9/seed_pygeoapi.py ubuntu@129.80.248.53:/tmp/seed_pygeoapi.py
ssh -i $key ubuntu@129.80.248.53 'python3 /tmp/seed_pygeoapi.py --base http://127.0.0.1:8285 --suffix b3 --obs-per-stream 24'
```

### 6.3 Cumulative state on the live server (post-batch b3)

| Resource | Items returned |
| --- | ---: |
| `/procedures`        | 7 |
| `/systems`           | 10 |
| `/deployments`       | 4 |
| `/datastreams`       | 16 |
| `/observations`      | 170+ (verified `limit=20`, paginated `offset=10` returns 5) |
| `/samplingFeatures`  | 0 (POSTs accepted, listing broken) |
| `/properties`        | 0 (no writer) |

### 6.4 `/samplingFeatures` retrieval bug

After 3 successful POSTs to `/systems/{id}/samplingFeatures` (each returning `201` + the new id):

- `GET /samplingFeatures?limit=20` → `{"type":"FeatureCollection","features":[],"links":[]}` (empty)
- `GET /samplingFeatures/sf-01-b3` → **HTTP 500 Internal Server Error** (HTML body)
- `GET /systems/{id}/samplingFeatures/sf-01-b3` → 400 *"entity identifier is malformed"*
- `GET /systems/{id}/samplingFeatures` → `{"items":[],"links":[]}` (empty)

So the writes succeed at the storage layer but no read path returns them. This is a **clear upstream bug** to file. Until fixed, samplingFeatures can be written but not exercised round-trip.

### 6.5 `/systems/{id}/deployments` does not auto-link

`GET /systems/{id}/deployments` returns `{"items":[]}` even after 4 deployments exist. There appears to be no implicit link between a deployment and a system in this build, and (per §5.2) the explicit `deployedSystems` array crashes the validator. Net effect: **deployment ↔ system relations are not exercisable** in this build at all.

### 6.6 Captured wire evidence

All under [`captures/oracle-pygeoapi/`](./captures/oracle-pygeoapi/):

| File | Source endpoint |
| --- | --- |
| `2026-05-09-landing-page.json`                        | `GET /?f=json` |
| `2026-05-09-conformance.json`                         | `GET /conformance` |
| `2026-05-09-collections.json`                         | `GET /collections` |
| `2026-05-09-systems.json`                             | `GET /systems` (default GeoJSON view, empty) |
| `2026-05-09-systems-sml.json`                         | `GET /systems` with `Accept: application/sml+json` |
| `2026-05-09-systems-after.json`                       | post-simulator state |
| `2026-05-09-datastreams.json`                         | `GET /datastreams` |
| `2026-05-09-datastreams-after.json`                   | post-simulator state |
| `2026-05-09-observations-after.json`                  | `GET /observations?limit=5` (simulator output) |
| `2026-05-09-seed-procedures.json`                     | `GET /procedures?f=smljson&limit=50` |
| `2026-05-09-seed-systems.json`                        | `GET /systems?f=smljson&limit=50` |
| `2026-05-09-seed-deployments.json`                    | `GET /deployments?f=smljson&limit=50` |
| `2026-05-09-seed-datastreams.json`                    | `GET /datastreams?limit=50` |
| `2026-05-09-seed-datastreams-by-system.json`          | `GET /systems/{id}/datastreams` |
| `2026-05-09-seed-observations.json`                   | `GET /observations?limit=20` |
| `2026-05-09-seed-observations-by-datastream-paged.json` | pagination probe `?limit=5&offset=10` |
| `2026-05-09-seed-properties.json`                     | empty (no writer) |
| `2026-05-09-seed-samplingFeatures.json`               | empty (listing broken) |
| `2026-05-09-seed-samplingFeatures-by-system.json`     | empty (listing broken) |
| `2026-05-09-seed-deployments-by-system.json`          | empty (no auto-link) |

---

## 7. Conformance

`GET /conformance` advertises **only** `ogcapi-common-1` core. None of the CSA conformance class URIs (e.g. `…/conf/csa/sensorml`, `…/conf/csa/observations`) appear, even though the server actually implements much of CSA Part 1. This is consistent with §5.7's incomplete OpenAPI doc — the metadata layer is just thin.

For a Tier-2 SDK adapter, **do not rely on conformance-class detection** against this server; it will under-report.

---

## 8. Publisher integration — documented blocker

The original Phase 9 plan was to point one of the existing OS4CSAPI Go-publishers at this pygeoapi as an additional sink. After 4 patch iterations against `iss-publisher-go`'s `publishers/bootstrap_helpers.py`, this is **structurally infeasible** without a full payload rewrite:

| Issue | Why it blocks |
| --- | --- |
| Payload is a GeoJSON `Feature` wrapper | pygeoapi-CSA wants flat top-level keys (no `properties` / `geometry` lift) |
| Top-level `name` and `definition` missing | required by validator (§4.2); adapter can synthesise from `label`/`uniqueId`/`featureType` for some types but not all |
| `validTime: ".."` sentinel | rejected; needs real ISO dates on both ends (§5.3) |
| Content-type is `application/json` | needs to be `application/sml+json` for procedure/system/deployment writes (§5.4) |
| No `smljson` envelope | some validators want a nested `smljson.type` field |

The cloned tree is at `/home/ubuntu/iss-publisher-pygeoapi/`, dormant. The systemd unit that was failing on every retry was removed. **Recommendation:** instead of adapting the Go publisher, write a thin Python publisher that consumes the same OS4CSAPI event stream and emits pygeoapi-shaped payloads directly. The seeder (§6.2) already implements ~80% of that translation.

---

## 9. Recommendations for the SDK / Tier-2 adapter

1. **Treat `/openapi` as advisory** (§5.7). For collection discovery, walk `/collections` and probe known CSA collection ids in addition.
2. **Use `Accept: application/sml+json`** for systems / procedures / deployments listings (§5.6). The default GeoJSON view silently filters and breaks pagination math.
3. **Negotiate write content-type per-endpoint** (§4.2, §5.4). `application/json` for datastreams + observations + samplingFeatures; `application/sml+json` for procedures + systems + deployments.
4. **Don't emit `deployedSystems`** on deployment writes against this build (§5.2). Either omit the field or detect the build version and gate on it.
5. **Don't depend on `samplingFeatures` round-trip** (§6.4). Treat it as write-only until the upstream listing bug is fixed.
6. **Don't depend on `/properties` writes** at all on this build (§4.3).
7. **Don't rely on conformance-class strings** (§7). They under-report on this build.
8. **Configure `pygeoapi.config.yml > server.url`** to the public base URL before you trust any `href` in `/collections` (§3.3).

---

## 10. Reproduction recipe (end-to-end)

```powershell
# Local
$key = "$env:USERPROFILE\.ssh-oracle-deploy\oracle.key"

# Ship compose + seeder
scp -i $key docs/research/oracle-deploy/docker-compose.deploy.yml ubuntu@129.80.248.53:/home/ubuntu/csapi-pygeoapi/docker-compose.yml
scp -i $key docs/research/phase-9/seed_pygeoapi.py                ubuntu@129.80.248.53:/tmp/seed_pygeoapi.py

# Build + run
ssh -i $key ubuntu@129.80.248.53 'cd ~/csapi-pygeoapi && sudo docker compose build api && sudo docker compose up -d'

# Wait for health, then load data (3 disjoint batches)
ssh -i $key ubuntu@129.80.248.53 'python3 /tmp/seed_pygeoapi.py --base http://127.0.0.1:8285 --suffix b1 --obs-per-stream 24'
ssh -i $key ubuntu@129.80.248.53 'python3 /tmp/seed_pygeoapi.py --base http://127.0.0.1:8285 --suffix b2 --obs-per-stream 6'
ssh -i $key ubuntu@129.80.248.53 'python3 /tmp/seed_pygeoapi.py --base http://127.0.0.1:8285 --suffix b3 --obs-per-stream 4'

# External smoke-test
curl -sS https://129-80-248-53.sslip.io/csapi-pygeoapi/conformance
curl -sS -H 'Accept: application/sml+json' https://129-80-248-53.sslip.io/csapi-pygeoapi/systems?f=smljson
curl -sS https://129-80-248-53.sslip.io/csapi-pygeoapi/datastreams?limit=5
curl -sS https://129-80-248-53.sslip.io/csapi-pygeoapi/observations?limit=5
```

---

## 11. Open issues to file upstream

In rough priority order:

1. **`POST /deployments` with `deployedSystems` crashes** (§5.2). Validator looks up flat key `system` instead of walking `system@link`.
2. **`/samplingFeatures` listing + GET-by-id broken** after successful POST (§6.4). 500 on detail, empty on listing.
3. **OpenAPI doc is incomplete** (§5.7). Endpoints `/datastreams`, `/observations`, `/procedures`, `/properties` are omitted from the generated spec even though they work.
4. **`/conformance` under-reports** (§7). Should advertise CSA conformance classes, not just `ogcapi-common-1`.
5. **`Content-Type: None`** on landing-page response (§5.9).
6. **`application/json` POSTs to procedure/system/deployment endpoints** return a misleading "name required" error rather than a 415 / proper diagnostic (§5.4).
7. **`server.url` defaults to `http://localhost:5000`** in shipped config, leaking into all `links[*].href` (§3.3). Should be templated or derivable from request.
8. **Default `GET /systems` filters out systems with non-`geometry` position** (§5.6). Either reflect the SensorML `position` into the GeoJSON view, or document the filter.
9. **Dockerfile / pyproject.toml ARM64 + Alpine breakage** (§2). Three patches needed before image will build.
10. **No nested write path for `properties`** (§4.3). Either expose `POST /properties` or document that `ObservedProperty` is referenced-only.

---

## 12. Pointers

- Seeder source: [`seed_pygeoapi.py`](./seed_pygeoapi.py)
- Wire captures: [`captures/oracle-pygeoapi/`](./captures/oracle-pygeoapi/)
- Compose file: [`../oracle-deploy/docker-compose.deploy.yml`](../oracle-deploy/docker-compose.deploy.yml)
- Phase-9 plan docs: [`01-discovery-layer-lesson-propagation.md`](./01-discovery-layer-lesson-propagation.md), [`02-live-testing-experiment-plan.md`](./02-live-testing-experiment-plan.md)
- Session memory (in-progress notes): `/memories/session/oracle-pygeoapi-deploy.md`
