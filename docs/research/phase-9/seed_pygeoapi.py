#!/usr/bin/env python3
"""
Seed sample data into the Tier-2 (52North connected-systems-pygeoapi) server.

Targets all writable CSA resource collections exposed by this build:
  - /procedures            (sml+json)
  - /systems               (sml+json)
  - /deployments           (sml+json)
  - /systems/{id}/samplingFeatures
  - /systems/{id}/datastreams
  - /datastreams/{id}/observations

Endpoints probed but read-only on this build (no top-level POST):
  - /properties      (only GET/PUT/DELETE)
  - /samplingFeatures (only GET/PUT/DELETE — POST is via /systems/{id}/samplingFeatures)

Usage (run from inside the API container OR from the box host):
  python3 seed_pygeoapi.py --base http://127.0.0.1:8285
  python3 seed_pygeoapi.py --base https://129-80-248-53.sslip.io/csapi-pygeoapi

The script is idempotent on a fresh DB; on re-run the unique IDs collide and
you'll get 409s — pass --suffix to namespace a new batch.
"""
from __future__ import annotations

import argparse
import json
import sys
import uuid
from datetime import datetime, timedelta, timezone
from urllib.error import HTTPError
from urllib.request import Request, urlopen

NOW = datetime.now(timezone.utc).replace(microsecond=0)


def post(base: str, path: str, body: dict, content_type: str = "application/json") -> str:
    url = f"{base.rstrip('/')}/{path.lstrip('/')}"
    data = json.dumps(body).encode()
    req = Request(url, data=data, method="POST", headers={
        "Content-Type": content_type,
        "Accept": "application/json",
    })
    try:
        with urlopen(req, timeout=30) as resp:
            location = resp.headers.get("Location", "")
            raw = resp.read().decode()
            new_id = ""
            if location:
                new_id = location.rstrip("/").split("/")[-1]
            elif raw.strip():
                try:
                    val = json.loads(raw)
                    if isinstance(val, str):
                        new_id = val
                    elif isinstance(val, dict):
                        new_id = val.get("id", "")
                except json.JSONDecodeError:
                    pass
            print(f"  201 {path} -> {new_id or '(no-id)'}")
            return new_id
    except HTTPError as e:
        body_text = e.read().decode(errors="replace")
        print(f"  {e.code} {path}: {body_text[:240]}", file=sys.stderr)
        return ""


# -------- payload builders --------

def proc(uid: str, name: str, defn: str, desc: str) -> dict:
    return {
        "type": "SimpleProcess",
        "id": uid.split(":")[-1],
        "name": name,
        "definition": defn,
        "uniqueId": uid,
        "label": name,
        "description": desc,
    }


def system(uid: str, name: str, defn: str, desc: str, lon: float, lat: float,
           kind: str = "PhysicalSystem") -> dict:
    return {
        "type": kind,
        "id": uid.split(":")[-1],
        "name": name,
        "definition": defn,
        "uniqueId": uid,
        "label": name,
        "description": desc,
        "identifiers": [{
            "definition": "http://sensorml.com/ont/swe/property/SerialNumber",
            "label": "Serial Number",
            "value": "SN-" + uid.split(":")[-1].upper(),
        }],
        "validTime": [
            (NOW - timedelta(days=365)).isoformat(),
            (NOW + timedelta(days=365)).isoformat(),
        ],
        "position": {"type": "Point", "coordinates": [lon, lat]},
    }


def deployment(uid: str, name: str, system_id: str, lon: float, lat: float) -> dict:
    return {
        "type": "Deployment",
        "id": uid.split(":")[-1],
        "name": name,
        "definition": "http://www.opengis.net/def/featureType/SOSA/Deployment",
        "uniqueId": uid,
        "label": name,
        "description": f"Field deployment of system {system_id}",
        "validTime": [
            (NOW - timedelta(days=30)).isoformat(),
            (NOW + timedelta(days=335)).isoformat(),
        ],
        "position": {"type": "Point", "coordinates": [lon, lat]},
    }


def sampling_feature(uid: str, name: str, lon: float, lat: float) -> dict:
    return {
        "type": "SamplingPoint",
        "id": uid.split(":")[-1],
        "name": name,
        "definition": "http://www.opengis.net/def/samplingFeatureType/OGC-OM/2.0/SF_SamplingPoint",
        "uniqueId": uid,
        "label": name,
        "description": f"Sampling point '{name}'",
        "geometry": {"type": "Point", "coordinates": [lon, lat]},
    }


def datastream(uid: str, name: str, observed_definition: str, observed_label: str,
               uom_code: str, system_id: str) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "description": f"{observed_label} time series for {system_id}",
        "system@link": {"href": f"/systems/{system_id}", "title": uid},
        "observedProperties": [{
            "definition": observed_definition,
            "label": observed_label,
            "description": observed_label,
        }],
        "phenomenonTime": [
            (NOW - timedelta(days=7)).isoformat(),
            (NOW + timedelta(days=7)).isoformat(),
        ],
        "resultTime": [
            (NOW - timedelta(days=7)).isoformat(),
            (NOW + timedelta(days=7)).isoformat(),
        ],
        "resultType": "measure",
        "live": False,
        "formats": ["application/json"],
        "schema": {
            "obsFormat": "application/om+json",
            "resultTimeSchema": {
                "name": "time",
                "type": "Time",
                "definition": "http://www.opengis.net/def/property/OGC/0/SamplingTime",
                "referenceFrame": "http://www.opengis.net/def/trs/BIPM/0/UTC",
                "label": "Sampling Time",
                "uom": {"href": "http://www.opengis.net/def/uom/ISO-8601/0/Gregorian"},
            },
            "resultSchema": {
                "name": "value",
                "type": "Quantity",
                "definition": observed_definition,
                "label": observed_label,
                "uom": {"code": uom_code},
            },
        },
    }


def observation(datastream_id: str, t: datetime, value: float) -> dict:
    return {
        "datastream@id": datastream_id,
        "phenomenonTime": t.isoformat(),
        "resultTime": t.isoformat(),
        "result": value,
    }


# -------- main --------

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://127.0.0.1:8285")
    ap.add_argument("--suffix", default="", help="appended to all unique IDs to make a fresh batch")
    ap.add_argument("--obs-per-stream", type=int, default=24)
    args = ap.parse_args()

    sfx = ("-" + args.suffix) if args.suffix else ""
    print(f"Seeding into {args.base}{' (suffix='+args.suffix+')' if args.suffix else ''}")

    print("\n# Procedures")
    procs = [
        proc(f"urn:demo:proc:thermometer{sfx}", f"Thermometer Procedure{sfx}",
             "http://www.w3.org/ns/sosa/Sensor",
             "Reading procedure for digital thermometer."),
        proc(f"urn:demo:proc:anemometer{sfx}", f"Anemometer Procedure{sfx}",
             "http://www.w3.org/ns/sosa/Sensor",
             "Reading procedure for cup anemometer."),
    ]
    for p in procs:
        post(args.base, "/procedures", p, "application/sml+json")

    print("\n# Systems")
    systems = [
        system(f"urn:demo:system:weather-station-01{sfx}",
               f"Weather Station 01{sfx}", "http://www.w3.org/ns/sosa/Platform",
               "Roof-mounted weather station, north quadrant.",
               -74.006, 40.7128),
        system(f"urn:demo:system:weather-station-02{sfx}",
               f"Weather Station 02{sfx}", "http://www.w3.org/ns/sosa/Platform",
               "Field-mounted weather station, south meadow.",
               2.3522, 48.8566),
        system(f"urn:demo:system:thermo-array-01{sfx}",
               f"Indoor Thermo Array 01{sfx}", "http://www.w3.org/ns/sosa/Sensor",
               "Indoor temperature array, lab building B.",
               7.6519, 51.9358, kind="PhysicalComponent"),
    ]
    sys_ids: list[str] = []
    for s in systems:
        sid = post(args.base, "/systems", s, "application/sml+json") or s["id"]
        sys_ids.append(sid)

    print("\n# Deployments")
    for i, sid in enumerate(sys_ids, 1):
        d = deployment(f"urn:demo:deployment:depl-{i:02d}{sfx}",
                       f"Deployment {i:02d}{sfx}", sid,
                       systems[i-1]["position"]["coordinates"][0],
                       systems[i-1]["position"]["coordinates"][1])
        post(args.base, "/deployments", d, "application/sml+json")

    print("\n# Sampling Features (per system)")
    for i, sid in enumerate(sys_ids, 1):
        sf = sampling_feature(f"urn:demo:sf:sf-{i:02d}{sfx}",
                              f"Sampling Point {i:02d}{sfx}",
                              systems[i-1]["position"]["coordinates"][0],
                              systems[i-1]["position"]["coordinates"][1])
        post(args.base, f"/systems/{sid}/samplingFeatures", sf, "application/json")

    print("\n# Datastreams")
    streams = [
        ("Air Temperature", "http://mmisw.org/ont/cf/parameter/air_temperature",
         "Air Temperature", "Cel", sys_ids[0],
         lambda i: 8.0 + 4.0 * (i % 12) / 12.0),
        ("Wind Speed", "http://mmisw.org/ont/cf/parameter/wind_speed",
         "Wind Speed", "m/s", sys_ids[0],
         lambda i: 2.0 + 1.5 * (i % 8)),
        ("Relative Humidity", "http://mmisw.org/ont/cf/parameter/relative_humidity",
         "Relative Humidity", "%", sys_ids[1],
         lambda i: 40.0 + (i % 20)),
        ("Barometric Pressure", "http://mmisw.org/ont/cf/parameter/air_pressure",
         "Barometric Pressure", "hPa", sys_ids[1],
         lambda i: 1010.0 + (i % 5)),
        ("Indoor Temperature", "http://mmisw.org/ont/cf/parameter/air_temperature",
         "Indoor Temperature", "Cel", sys_ids[2],
         lambda i: 19.5 + 0.1 * (i % 10)),
    ]
    ds_targets: list[tuple[str, callable]] = []
    for j, (name, defn, label, uom, sid, fn) in enumerate(streams, 1):
        ds = datastream(f"urn:demo:ds:ds-{j:02d}{sfx}",
                        f"{name}{sfx}", defn, label, uom, sid)
        ds_id = post(args.base, f"/systems/{sid}/datastreams", ds, "application/json") or ds["id"]
        ds_targets.append((ds_id, fn))

    print(f"\n# Observations ({args.obs_per_stream} per stream, {len(streams)} streams)")
    posted = 0
    for ds_id, fn in ds_targets:
        for i in range(args.obs_per_stream):
            t = NOW - timedelta(minutes=15 * (args.obs_per_stream - i))
            obs = observation(ds_id, t, round(fn(i), 3))
            if post(args.base, f"/datastreams/{ds_id}/observations", obs, "application/json"):
                posted += 1
    print(f"\nDone. {posted} observations posted across {len(streams)} datastreams.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
