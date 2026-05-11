# Spec Validation Report: Deployment→System Navigation Findings
**Date:** 2025-06-10  
**Spec authority:** OGC 23-001 (CS API Part 1), fetched from https://docs.ogc.org/is/23-001/23-001.html  
**Scope:** Validates all claims made during the Deployment→System Navigation 404 investigation against the actual standard text. Supersedes any prior informal characterizations.

---

## Background

During a series of bug fixes in the ogc-csapi-explorer app and OSHConnect-Python publishers, several assumptions were made about:

1. Whether `GET /deployments/{id}/systems` is a required server endpoint  
2. Whether `platform@link` is a spec-defined field  
3. Whether `deployedSystems@link` is the correct standard field  
4. Whether `PUT /deployments/{id}` stripping `parentDeployment` is a server bug  
5. What format `platform@link.href` should take on INSERT  

This document validates each assumption against the authoritative OGC 23-001 text.

---

## Finding 1: `GET /deployments/{id}/systems` — NOT defined by the spec

### Claim being reviewed
The explorer app was calling `GET /deployments/{id}/systems` and receiving 404. This was initially treated as a server gap or bug.

### Spec text (OGC 23-001 §11.4 — Deployment Resources Endpoints)

The spec defines the following deployment-related endpoints:

| Endpoint | Type | Status |
|---|---|---|
| `{api_root}/deployments` | Canonical resources endpoint | Required |
| `{api_root}/deployments/{id}` | Canonical resource endpoint | Required |
| `{api_root}/deployments/{parentId}/subdeployments` | Nested subdeployments endpoint | Required (if /req/subdeployment) |
| `{api_root}/systems/{sysId}/deployments` | Nested from system side | Required (if /req/deployment, §11.4.3) |

**`{api_root}/deployments/{id}/systems` is not defined anywhere in OGC 23-001.**

The conformance tests for the Advanced Filtering conformance class (test A.10, `/conf/advanced-filtering/deployment-by-system`) reference `{deploymentCanonicalUrl}/deployedSystems?recursive=true`, suggesting servers *may* optionally implement a `/deployments/{id}/deployedSystems` endpoint (note: `deployedSystems`, not `systems`). But this endpoint:
- Uses the name `deployedSystems`, not `systems`
- Is tested conditionally ("if the Deployment resource contains a link with relation type deployedSystems")
- Is NOT a normatively required endpoint

### Verdict

**csapi-go returning 404 for `/deployments/{id}/systems` is CORRECT per the spec.** This endpoint is not part of OGC 23-001. The 404 behavior is not a server gap — it is correct conformance.

The client-side fallback to `platform@link` was necessary because the client code was calling a URL that the spec never required.

**Action needed:** If the explorer app wants to navigate to deployed systems, it should:
1. Read `deployedSystems@link` from the deployment's GeoJSON properties (the spec-correct approach)
2. Fall back to `platform@link` if `deployedSystems@link` is absent (practical workaround for publisher gaps)

---

## Finding 2: `platform@link` — Spec-defined and Optional

### Claim being reviewed
The explorer client read `platform@link` from deployment responses as a fallback to find the deployed system. This was not clearly validated against the spec at the time.

### Spec text (OGC 23-001 §11.2.2 and §19.1.6)

**Table 11 — Deployment Associations:**
```
| platform | sosa:deployedOnPlatform | The platform on which the systems are deployed. | A single Feature resource. | Optional |
```

**Table 43 — GeoJSON Encoding of Deployment Associations:**
```
| platform | properties/platform@link | Value is a weblink resolving to a System resource. |
```

**Example from the spec (GeoJSON deployment response):**
```json
"platform@link": {
  "href": "https://data.example.org/api/systems/27559?f=sml",
  "uid": "urn:x-saildrone:platforms:SD-1003",
  "title": "Saildrone SD-1003"
}
```

### Verdict

`platform@link` **is a fully spec-defined field** in OGC 23-001. The explorer's use of it as a fallback is reading a legitimate spec property.

**Important conceptual note:** Per the spec, `platform` maps to `sosa:deployedOnPlatform` — the *platform* on which systems are deployed. In the Saildrone example, the platform is the drone itself, while `deployedSystems@link` lists the sensors onboard. For NDBC station deployments where the station IS the thing being deployed, publishers are technically misusing the field (the station is the deployed system, not just the platform carrier). However, `platform@link` is the closest available link in the absence of a populated `deployedSystems@link`.

---

## Finding 3: `deployedSystems@link` — Required by spec; publishers are non-conformant

### Claim being reviewed
The explorer tried to read `deployedSystems@link[]` from deployment resources, but publishers were not populating this field. We attributed this to publishers using `platform@link` instead.

### Spec text (OGC 23-001 §11.2.2 and §19.1.6)

**Table 11 — Deployment Associations:**
```
| deployedSystems | sosa:deployedSystem | The list of Systems deployed during the Deployment, if any. | A list of System resources. | Required |
```

**Table 43 — GeoJSON Encoding of Deployment Associations:**
```
| deployedSystems | properties/deployedSystems@link | Value is a JSON Array of links to System resources. |
```

The Required cardinality means a conformant deployment resource must include this field (even if empty if no systems are deployed).

### Verdict

**Publishers not populating `deployedSystems@link` is a publisher conformance gap, not a client bug.** All publishers (aviation_wx, coops, nws, opensky, usgs_eq, usgs_nims, usgs_water, ndbc, iss) that rely solely on `platform@link` without populating `deployedSystems@link` are producing non-conformant deployment resources.

The client's fallback to `platform@link` when `deployedSystems@link` is absent is a reasonable defensive measure against this known publisher gap. 

**Recommended publisher fix:** When bootstrapping a deployment, populate both:
- `platform@link` — the physical platform/carrier (if applicable)
- `deployedSystems@link` — array of System links for every system being deployed

---

## Finding 4: `href` format in `platform@link` — URN/uniqueId required on INSERT

### Claim being reviewed
NDBC stores a full absolute URL in `platform@link.href` (after our fix). All other publishers store a bare server-assigned UUID. This was identified as inconsistent; NDBC was "fixed" to use the full URL.

### Spec text (OGC 23-001 §19.1.6, Table 43 footnote)

The footnote after Table 43 states:
> *** When inserting or modifying a link to a system stored locally, the link url (href property) shall be set to the **uniqueID** of the system to be linked.

The `uniqueID` in OGC 23-001 refers to the `uid` field — a persistent URI/URN like `urn:x-saildrone:platforms:SD-1003`, **not** the server-assigned local ID (UUID) and **not** the full REST URL.

### Verdict

All publishers are non-conformant when inserting deployments with `platform@link.href`:

| Publisher | `platform@link.href` value | Conformant? |
|---|---|---|
| NDBC (after our fix) | Full URL (`https://.../systems/UUID`) | No — should be uniqueId URN |
| NDBC (before our fix) | Full URL (`https://.../systems/UUID`) | No — same |
| aviation_wx, coops, nws, etc. | Bare server UUID | No — should be uniqueId URN |

The spec-correct approach on INSERT would be:
```json
"platform@link": {
  "href": "urn:myorg:systems:station-45002",
  "uid":  "urn:myorg:systems:station-45002",
  "title": "NDBC Station 45002"
}
```

The server (csapi-go) would then resolve the URN to the canonical URL for GET responses. The fact that csapi-go appears to store whatever value it receives and return it verbatim (instead of resolving URN → canonical URL) may itself be a csapi-go conformance gap.

**However:** Given the user's high confidence in csapi-go, and that csapi-go's behavior of returning whatever href was sent is typical for simple REST servers that don't perform link resolution, this should be documented as a publisher data quality issue rather than a server bug until confirmed through targeted testing.

**Client-side implication:** The `normalizeLinkHrefForList()` function in the explorer handles:
1. Bare UUID → prepend `/systems/` — handles publisher non-conformance
2. Full absolute URL → extract path — handles NDBC's non-conformant full URL approach
3. A URN would fall through to the bare UUID path, which would produce `/systems/urn:...` — incorrect

**A future improvement would be to also handle URN-format `href` values** once publishers begin sending them.

---

## Finding 5: `PUT /deployments/{id}` stripping `parentDeployment` link — Server is correct

### Claim being reviewed
During a re-bootstrap operation, a `PUT /deployments/{id}` call stripped the `parentDeployment` link from a subdeployment, breaking the deployment hierarchy.

### Spec text (OGC 23-001 §17.4 and §18.3)

Section 17.4:
> The server SHALL support the CREATE operation at the Deployment resources endpoints defined by the following URI template: `{api_root}/deployments`  
> The server SHALL support the **REPLACE** and DELETE operations at: `{api_root}/deployments/{id}`

Section 17.5 (Subdeployments):
> Subdeployments can only be **created** as sub-resources of a parent deployment (`{api_root}/deployments/{parentId}/subdeployments`), but are **updated/deleted at their canonical URL** just like any other Deployment resource.

The spec uses "REPLACE" (HTTP PUT), which by OGC API — Features — Part 4 semantics means a full replacement of the resource.

### Verdict

**This is correct server behavior.** HTTP PUT is a full replace operation. If the publisher sends a PUT body that does not include the `parentDeployment@link`, the server correctly removes it. This is not a csapi-go bug.

**Root cause:** The publisher's Python bootstrap code was doing a `PUT /deployments/{id}` with a request body that did not include the `parentDeployment@link`. The fix correctly adds this link to the PUT body before sending.

The correct pattern for subdeployments is:
1. Create subdeployment via `POST /deployments/{parentId}/subdeployments` (spec §17.5) — server sets parentDeployment automatically
2. Any subsequent `PUT /deployments/{id}` on the subdeployment must include `parentDeployment` in the body

---

## Finding 6: Conformance test A.6 references `deployedSystems` link — optional hypermedia navigation

### Spec text (OGC 23-001 §A.6 — Conformance Class "Subdeployments")

Test `/conf/subdeployment/recursive-assoc`:
> **If the Deployment resource contains a link with relation type `deployedSystems`**, verify that all deployed systems are returned: Issue an HTTP GET request to the link URL.

And test `/conf/advanced-filtering/deployment-by-system`:
> Retrieve all deployed systems by issuing an HTTP GET request at `{deploymentCanonicalUrl}/deployedSystems?recursive=true`.

### Analysis

This reveals that OGC 23-001 anticipates a *possible* server-side endpoint at `/deployments/{id}/deployedSystems` (not `/deployments/{id}/systems`). However:
- The test is conditional: "if the Deployment resource contains a link with relation type deployedSystems"
- It is tested as part of conformance class "Subdeployments" (a separate conformance class)
- No normative requirement (SHALL) mandates exposing this endpoint

If csapi-go chose to implement this, it would be at `/deployments/{id}/deployedSystems`, not `/deployments/{id}/systems`. The explorer's original code hitting `/deployments/{id}/systems` was simply wrong in either case.

---

## Summary Table

| Claim | Finding | Verdict |
|---|---|---|
| "csapi-go should implement `GET /deployments/{id}/systems`" | Endpoint not in OGC 23-001 | csapi-go is correct; claim was WRONG |
| "`platform@link` is our workaround, not official" | Defined in Table 11 & Table 43 | `platform@link` is official spec; claim was WRONG |
| "publishers should populate `deployedSystems@link`" | Required by Table 11 | Publishers are non-conformant; claim was CORRECT |
| "NDBC should store full URL in `platform@link.href`" | Spec says uniqueId/URN on INSERT | All publishers wrong; our "fix" for NDBC is also non-conformant |
| "`PUT /deployments/{id}` stripping parentDeployment is a server bug" | PUT is full replace per spec | Server correct; publisher was not sending the field; claim was WRONG |
| "Bare UUID in `platform@link.href` needs normalization in client" | Server returns whatever was stored | Client normalization is a valid workaround; unchanged recommendation |

---

## Recommendations

### For publishers (OSHConnect-Python)
1. Populate `deployedSystems@link` on every deployment with all deployed systems (spec-required)
2. Keep `platform@link` for physical platform/carrier if distinct from the sensors
3. Use the system's `uniqueId` (URN) — not the server UUID — as `platform@link.href` on INSERT
4. Always include `parentDeployment@link` in PUT body for subdeployments

### For the client explorer app
1. Read `deployedSystems@link` first (spec-correct)  
2. Fall back to `platform@link` if absent (publisher gap workaround)
3. Handle URN-format `href` values in the normalization functions (future improvement)
4. Do NOT call `/deployments/{id}/systems` — that URL is not in the spec

### For csapi-go assessment
- Not implementing `/deployments/{id}/systems`: **correct, no action needed**
- Not resolving URN `platform@link.href` to canonical URL on GET responses: potentially a conformance gap, but requires dedicated testing; do not file without empirical confirmation
- Two open issues (#10 SensorML documents array dropped, #22 null on optional field rejected) remain and are unrelated to navigation

---

## Reference
- OGC 23-001 full text: https://docs.ogc.org/is/23-001/23-001.html
- Relevant spec clauses: §11.2.2 (Table 11), §11.4, §17.4, §17.5, §18.3, §19.1.6 (Table 43), §A.6
