# Verified CSAPI Conformance Class URIs

**Verified Against:** Live OSH SensorHub CSAPI server  
**Verification Date:** 2026-02-12  
**Server Endpoint:** `/conformance`  
**Status:** GROUND TRUTH — use these URIs in all fixtures, tests, and implementation code

---

## Key Finding: Namespace Uses NO Hyphen

The correct URI namespace is:

```
ogcapi-connectedsystems-1    ← CORRECT (no hyphen between "connected" and "systems")
ogcapi-connected-systems-1   ← WRONG (hyphenated variant found in docs 22, 38)
```

This resolves the M1 uncertainty about "connectedsystems" vs "connected-systems". **The non-hyphenated form is correct.**

---

## Verified Conformance Classes

### Part 1: Feature Resources (`ogcapi-connectedsystems-1`)

| Conformance Class | Full URI |
|---|---|
| Core | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/core` |
| System | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/system` |
| Subsystem | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/subsystem` |
| Deployment | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/deployment` |
| Subdeployment | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/subdeployment` |
| Procedure | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/procedure` |
| Sampling Features | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/sf` |
| Property | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/property` |
| CRUD | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/create-replace-delete` |
| GeoJSON Encoding | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/geojson` |
| SensorML Encoding | `http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/sensorml` |

### Part 2: Dynamic Data (`ogcapi-connectedsystems-2`)

| Conformance Class | Full URI |
|---|---|
| DataStream | `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/datastream` |
| ControlStream | `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/controlstream` |
| System History | `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/system-history` |
| System Event | `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/system-event` |
| CRUD | `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/create-replace-delete` |
| JSON Encoding | `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/json` |
| SWE Common JSON | `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/swecommon-json` |
| SWE Common Text | `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/swecommon-text` |
| SWE Common Binary | `http://www.opengis.net/spec/ogcapi-connectedsystems-2/1.0/conf/swecommon-binary` |

### Part 3: Pub/Sub (`ogcapi-connectedsystems-3`)

| Conformance Class | Full URI |
|---|---|
| WebSocket | `http://www.opengis.net/spec/ogcapi-connectedsystems-3/1.0/conf/websocket` |
| MQTT | `http://www.opengis.net/spec/ogcapi-connectedsystems-3/1.0/conf/mqtt` |

---

## Discrepancies Found in Research Documents

### Problem 1: Wrong Namespace Prefix (Hyphenated)

**Documents affected:** 22, 38  
**Pattern:** `ogcapi-connected-systems-1` (hyphenated) instead of `ogcapi-connectedsystems-1`  
**Impact:** HIGH — code using this prefix will never match real server conformance responses  
**Scope:** ~60+ occurrences across docs 22 and 38

### Problem 2: Wrong Conformance Class Names

**Documents affected:** 06, 12, 14, 18  
**Pattern:** Invented class names that don't exist in the specification

| Wrong (in docs) | Correct (from server) | Affected Docs |
|---|---|---|
| `conf/system-features` | `conf/system` | 12, 18 |
| `conf/deployment-features` | `conf/deployment` | 12, 18 |
| `conf/procedure-features` | `conf/procedure` | 12 |
| `conf/samplingfeature-features` | `conf/sf` | 12 |
| `conf/property-features` | `conf/property` | 12 |
| `conf/datastream-schema` | `conf/datastream` | 12 |
| `conf/observation-features` | *(no match — observations don't have a separate conf class)* | 12 |
| `conf/controlstream-schema` | `conf/controlstream` | 12 |
| `conf/command-features` | *(no match — commands don't have a separate conf class)* | 12 |
| `conf/dynamic-data` | *(not a real class name)* | 14, 38 |
| `req/core` | `conf/core` (uses `/req/` instead of `/conf/`) | 06 |
| `req/datastreams` | `conf/datastream` | 06 |
| `req/create` | `conf/create-replace-delete` | 06 |

### Problem 3: Wrong Encoding Class Names (Doc 22 only)

| Wrong (in doc 22) | Correct (from server) |
|---|---|
| `conf/o-and-m-json` | `conf/json` |
| `conf/swe-json` | `conf/swecommon-json` |
| `conf/swe-text` | `conf/swecommon-text` |
| `conf/swe-binary` | `conf/swecommon-binary` |

### Problem 4: Invented Classes (not published by server)

These appear in research docs but are not in the server's conformance list:
- `conf/api-common` (docs 22) — server does not publish this separately
- `conf/feasibility` (doc 22) — not on this server (may be optional)
- `conf/update` (doc 22) — not on this server (may be optional)
- `conf/advanced-filtering` (doc 22) — not on this server (may be optional)

> **Note:** Classes marked "may be optional" could be valid conformance classes that this particular server simply doesn't implement. They should be verified against the published specification before being removed from documentation.

---

## Landing Page Resource Links (Also Verified)

The server's landing page confirms these rel types and endpoint paths:

| Rel Type | Endpoint Path |
|---|---|
| `systems` | `/systems` |
| `deployments` | `/deployments` |
| `procedures` | `/procedures` |
| `samplingFeatures` | `/samplingFeatures` |
| `datastreams` | `/datastreams` |
| `observations` | `/observations` |
| `conformance` | `/conformance` |
| `collections` | `/collections` |

---

## Recommended Fixture for `checkHasConnectedSystems()`

Based on verified server output, the minimum conformance fixture for CSAPI detection should include:

```json
{
  "conformsTo": [
    "http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/core",
    "http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/system",
    "http://www.opengis.net/spec/ogcapi-connectedsystems-1/1.0/conf/geojson"
  ]
}
```

The detection function should check for `ogcapi-connectedsystems-1` (no hyphen) in the conformance URI strings.
