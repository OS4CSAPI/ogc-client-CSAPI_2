# oracle-pygeoapi captures

Tier-2 server: 52°North `connected-systems-pygeoapi` deployed on the
Oracle box behind Caddy at:

```
https://129-80-248-53.sslip.io/csapi-pygeoapi
```

Backend stack on the box:

- pygeoapi (52North fork, pinned to commit
  `ec1eb38d9a64d93ec9a2e1b9db6fea6dc05f194a`) + `connected-systems-api`
  v0.6.0 (commit `18c1ce80`)
- Elasticsearch `8.7.1` (TLS, security on)
- TimescaleDB `pg16`
- Caddy `handle_path /csapi-pygeoapi/*` → `localhost:8285`

## How to replay

Each `YYYY-MM-DD-*.json` is the response body of the corresponding
endpoint, captured with PowerShell `Invoke-WebRequest -UseBasicParsing`
on the date in the filename. To re-capture:

```powershell
$base = "https://129-80-248-53.sslip.io/csapi-pygeoapi"
Invoke-WebRequest -Uri "$base/?f=json"      -UseBasicParsing | % Content
Invoke-WebRequest -Uri "$base/conformance"  -UseBasicParsing | % Content
Invoke-WebRequest -Uri "$base/collections"  -UseBasicParsing | % Content
Invoke-WebRequest -Uri "$base/systems"      -UseBasicParsing | % Content
Invoke-WebRequest -Uri "$base/datastreams"  -UseBasicParsing | % Content
```

Or with `curl`:

```bash
base="https://129-80-248-53.sslip.io/csapi-pygeoapi"
curl -sS "$base/?f=json"
curl -sS "$base/conformance"
curl -sS "$base/collections"
curl -sS "$base/systems"
curl -sS "$base/datastreams"
```

## Files

| File | What it is |
| --- | --- |
| `*-landing-page.json`  | Response from `GET /?f=json`. Contains the `links` array Sub-finding #1 cares about. |
| `*-conformance.json`   | Response from `GET /conformance`. Currently advertises only `ogcapi-common-1` core — the CSA conformance class strings are not yet emitted (likely server config). |
| `*-collections.json`   | Response from `GET /collections`. Includes the seeded `dutch_windmills` sample collection. |
| `*-systems.json`       | Response from `GET /systems` (CSA endpoint, default GeoJSON view — empty `FeatureCollection` because the seeded system has no `geometry`). |
| `*-systems-sml.json`   | Response from `GET /systems` with `Accept: application/sml+json`. Shows the actual seeded `PhysicalSystem` (Outdoor Thermometer 001). |
| `*-datastreams.json`   | Response from `GET /datastreams`. One datastream linked to the seeded system. |
| `*-datastreams-after.json` | Same endpoint, captured after running the bundled simulator (`tools/simulator/simulator.py`, 50 obs). |
| `*-observations-after.json` | Response from `GET /observations?limit=5`. Five sample temperature observations posted by the simulator. |

## Sample data load

The bundled simulator at `csapi-pygeoapi/tools/simulator/simulator.py`
seeds a `PhysicalSystem` + one datastream + N observations. To re-seed:

```bash
# On the Oracle box
cp ~/csapi-pygeoapi/tools/simulator/simulator.py /tmp/sim.py
sed -i 's|num_of_obs_to_insert = 1_000_000|num_of_obs_to_insert = 50|' /tmp/sim.py
sed -i 's|HTTPBasicAuth.*test., .test..|None|; s|, auth=basic||' /tmp/sim.py
sudo docker cp /tmp/sim.py csapi-pygeoapi-connected-systems-api-1:/app/sim.py
sudo docker exec csapi-pygeoapi-connected-systems-api-1 uv run python /app/sim.py
```

`url_stub` inside the simulator is `http://localhost:5000` and is run
*inside* the API container, so it bypasses Caddy.

## Known oddities (recorded, not yet filed)

## Known oddities (recorded, not yet filed)

- `Content-Type: None` on the landing-page response (raw header, not
  the more usual `application/json`). Worth noting against
  Sub-finding #1's "MIME-sniffing" thread.
- Inner `links[*].href` values inside `/collections` point at
  `http://localhost:5000/...` rather than the public base URL. That
  is a `pygeoapi.config.server.url` setting inside the container,
  not a Caddy issue. Tracked separately.
- Default `GET /systems` returns a GeoJSON `FeatureCollection` and
  filters to systems with non-null geometry; to see all systems use
  `Accept: application/sml+json` (or `?f=smljson`). The bundled
  simulator's seeded system has `position` but is still excluded from
  the GeoJSON view — likely a property-mapping bug worth filing.

## Publisher integration: status

Goal was to point one of the existing OS4CSAPI publishers
(`/home/ubuntu/iss-publisher-go/`) at this pygeoapi as an additional
target. **Not completed in this stand-up.**

What was tried (cloned to `/home/ubuntu/iss-publisher-pygeoapi/`,
patched `publishers/bootstrap_helpers.py`):

1. POSTs were rejected with `name: required`. Adapter added `name`
   from `label`/`uniqueId`.
2. POSTs were then rejected with `definition: required`. Adapter
   added `definition` from `typeOf.uid` / `featureType`.
3. POSTs still rejected: payload was a GeoJSON `Feature` wrapper but
   pygeoapi-CSA wants flat top-level keys. Adapter unwrapped
   `properties` → top level and lifted `geometry` → `position`.
4. Switched content-type to `application/sml+json` for `/procedures`
   and `/systems`.
5. Validator then rejected `validTime: '..'` (open-ended sentinel
   used by OS4CSAPI/Go) which pygeoapi cannot parse, plus required a
   nested `smljson.type` field.

Conclusion: the OS4CSAPI Go-publisher payload shape (GeoJSON Feature
wrapper, `..` sentinel time bounds, no top-level `name` /
`definition`, no `smljson` envelope) is structurally incompatible
with the pygeoapi-CSA validator. A real adapter needs full payload
rewrite, not field-injection. The cloned tree at
`/home/ubuntu/iss-publisher-pygeoapi/` is left in place as a
starting point. The dummy systemd unit was removed.

For now, sample data into pygeoapi is produced via the bundled
`tools/simulator/simulator.py` (above), which is already on the right
shape because it ships with `connected-systems-pygeoapi`.

## Multi-resource seed (2026-05-09)

A custom Python seeder, [`docs/research/phase-9/seed_pygeoapi.py`](../../seed_pygeoapi.py),
posts at least one of every writable CSA resource kind exposed by this
build to enable broad client-side testing. It uses only stdlib
(`urllib`).

Resource kinds the running CSA build accepts via POST:

| Endpoint                                  | Content-Type            | Notes |
| ----------------------------------------- | ----------------------- | ----- |
| `POST /procedures`                        | `application/sml+json`  | Top-level `name`, `definition` required. |
| `POST /systems`                           | `application/sml+json`  | `position` (Point) recommended; default GeoJSON listing filters out systems without it. |
| `POST /deployments`                       | `application/sml+json`  | **Do not** include `deployedSystems` — current build crashes with `'system'` KeyError when validating it. Submit minimal deployment, link by other means. |
| `POST /systems/{id}/samplingFeatures`     | `application/json`      | Returns 201 but **GET-by-id 500s and list returns empty** in this build (CSA bug — POSTs accepted, retrieval broken). |
| `POST /systems/{id}/datastreams`          | `application/json`      | Schema includes `system@link`, `observedProperties`, `phenomenonTime`, `resultTime`, `resultType`, `formats`, `schema`. |
| `POST /datastreams/{id}/observations`     | `application/json`      | Body `{datastream@id, phenomenonTime, resultTime, result}`. |

Endpoints **not** writable in this build (top-level `POST` returns 405,
no nested write path discovered):

| Endpoint              | Status |
| --------------------- | ------ |
| `POST /properties`        | 405 — listing endpoint only. No nested writer. |
| `POST /samplingFeatures`  | 405 — write only via `/systems/{id}/samplingFeatures`. |

Endpoints absent in this build (404 on GET):
`controlstreams`, `commands`, `systemEvents`, `systemHistory`, `features`.

### Run

```powershell
# Local copy lives at docs/research/phase-9/seed_pygeoapi.py
$key = "$env:USERPROFILE\.ssh-oracle-deploy\oracle.key"
scp -i $key docs/research/phase-9/seed_pygeoapi.py ubuntu@129.80.248.53:/tmp/seed_pygeoapi.py
ssh -i $key ubuntu@129.80.248.53 'python3 /tmp/seed_pygeoapi.py --base http://127.0.0.1:8285 --suffix b3 --obs-per-stream 24'
```

Pass `--suffix <tag>` to namespace a fresh batch (avoids 409s on
re-run). Pass `--obs-per-stream N` to size the time series.

### Counts after the 2026-05-09 b3 run (cumulative across all batches)

| Resource              | Items returned by `GET /<collection>` |
| --------------------- | ------------------------------------- |
| procedures            | 7  |
| systems               | 10 |
| deployments           | 4  |
| datastreams           | 16 |
| observations          | 170+ (returned 20 with `limit=20`) |
| samplingFeatures      | 0 (POST-only; listing broken in this build) |
| properties            | 0 (no writer in this build) |

### Files (this batch)

| File | Source endpoint |
| ---- | --------------- |
| `*-seed-procedures.json`                        | `GET /procedures?f=smljson&limit=50` |
| `*-seed-systems.json`                           | `GET /systems?f=smljson&limit=50` |
| `*-seed-deployments.json`                       | `GET /deployments?f=smljson&limit=50` |
| `*-seed-datastreams.json`                       | `GET /datastreams?limit=50` |
| `*-seed-datastreams-by-system.json`             | `GET /systems/weather-station-01-b3/datastreams` |
| `*-seed-observations.json`                      | `GET /observations?limit=20` |
| `*-seed-observations-by-datastream-paged.json`  | `GET /observations?limit=5&offset=10` (pagination probe) |
| `*-seed-properties.json`                        | `GET /properties?limit=20` (empty — no writer) |
| `*-seed-samplingFeatures.json`                  | `GET /samplingFeatures?limit=20` (empty — listing broken) |
| `*-seed-samplingFeatures-by-system.json`        | `GET /systems/.../samplingFeatures` (empty — listing broken) |
| `*-seed-deployments-by-system.json`             | `GET /systems/.../deployments` (empty — server doesn't auto-link) |

