# Phase 9 — Initial Research: Discovery-Layer Lesson Propagation

**Date:** 2026-05-09
**Branch:** `phase-9`
**Status:** Draft (initial research, pre-triage)
**Scope:** Consolidate this project's existing body of research on
discovery-layer correctness in `OgcApiEndpoint`, then fold in Issue
[#188](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/188) (filed
2026-05-03 by [@nsnarayanam](https://github.com/nsnarayanam) against the
`phase-7` branch) as the latest external input to that body. The doc
is primarily *ours*: nine-plus months of CSAPI smoke tests, code
reviews, governance lessons, and cross-repo corroboration. #188 is one
more piece of evidence — the first to surface from a second
independent consumer (the `ogc-csapi-agent` Python ADK project) —
converging on the same conclusions our research had already reached.

---

## Premise

This project carries an existing, multi-phase body of research on
discovery-layer correctness. Across the smoke-test inventory
([known-server-quirks.md](../../governance/known-server-quirks.md)),
the phase governance docs ([phase-2](../../governance/phase-2-lessons-learned.md),
[phase-3](../../governance/phase-3-lessons-learned.md)), the design
research ([collections-reader-analysis.md](../design/collections-reader/collections-reader-analysis.md),
[references.md](../references.md)), and the closed-issue history
([#34](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/34),
[#35](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/35),
[#49](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/49),
[#50](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/50),
[#76](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/76),
[#99](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/99),
[#143](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/143),
[#149](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/149),
[#186](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/186)),
we had independently identified, named, and partially fixed each
failure class that Issue #188 reports. We had also codified the design
principle that would have prevented all of them — Postel's Law
(Phase 3 Lesson 2) — and applied it elsewhere.

The pattern across that body of research, restated in our own terms:

> Each lesson got fixed at the layer where we first discovered it (CSAPI
> module, formats, URL builder), and never propagated up into the
> `OgcApiEndpoint` discovery layer one floor above.

Issue #188 arrived 2026-05-03 from a second independent consumer of
the library (the `ogc-csapi-agent` Python ADK project, the first
being `ogc-csapi-explorer`). It catalogues four sub-findings against
the `phase-7` branch — the same four failure classes our internal
research had been circling. Treated the right way, #188 is therefore
*not the prompt* this document is responding to; it is the most
recent and most concrete piece of external evidence converging on
conclusions the research already held. This document retells each
failure class from our own perspective and timeline first, then maps
#188's four sub-findings into that retelling.

### How Issue #188's four sub-findings map into our existing research

| #188 sub-finding | The internal-research thread it lands on | Strongest prior artefact |
|---|---|---|
| **#1 — `csapiCollections` + 5 sibling getters null-deref when `data` is null** | Finding 3 below — "null-shape responses crash typed parsers, recurring." Three closed instances ([#143](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/143), [#149](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/149), and pending P1 [finding 003](../../code-review/003-pending-p1-unchecked-generic-cast-response.md)) plus the Postel's Law lesson. | Phase 3 Lesson 2 + finding 003 |
| **#2 — `collectionsUrl` rel allowlist rejects `rel: "collections"`** | Finding 1 below — "OSH doesn't speak `ogc-cs:`. Neither do its collections." Issues [#34](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/34)/[#35](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/35) and Issue [#186](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/186)'s prefix-match rule already established that real-server rel naming is heterogeneous. | Issues #34/#35, #186 |
| **#3 — `parseCollections` ignores `featureType`-based CSAPI signaling** | Finding 2 below — "OSH puts `featureType` in the wrong namespace. Then sometimes leaves it `null`. Then sometimes uses SSN." Three closed issues ([#49](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/49)/[#50](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/50)/[#76](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/76)) plus an open ROADMAP TODO since Phase 6. | [collections-reader-analysis.md](../design/collections-reader/collections-reader-analysis.md), [ROADMAP line 369](../../planning/ROADMAP.md) |
| **#4 — `getCollectionDocument` follows `self` link blindly without validating returned ID** | Finding 4 below — "OSH ignores resource IDs. The server returns whatever it wants." The corollary of [#99](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/99) (link-driven content negotiation) and [#122](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/122)/[#179](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/179) (`getCollectionDocument` visibility churn) we had not yet stated outright. Server-side ghost-resource evidence in OSHConnect-Python (folded in below) makes this the only sub-finding with new wire-level reproduction. | #99, plus OSH ghost-resource reproduction (cross-repo section below) |

The rest of this document is structured around the four findings as
*we* named them, with #188's sub-findings appearing as "the latest
restatement of" each. The cross-repo corroboration sections downstream
(cs-go server side, ogc-csapi-explorer front-end, OSHConnect-Python
client) further situate #188 inside a four-repo CSAPI-ecosystem
research corpus rather than treating it as an isolated bug report.

---

## Finding 1 — "OSH doesn't speak `ogc-cs:`. Neither do its collections."

**When we found it:** Smoke Test #1, post-Phase 2.1 (late 2025). First time we
pointed our builder at `45.55.99.236:8080/sensorhub/api`.

**What we saw:** `availableResources` came back as an empty Set. Every public
method on the builder threw `EndpointError`. We dumped the root document and
discovered OSH advertises resources three ways, none of them the spec's
preferred form:

- Root doc: plain `rel: "systems"`, `rel: "datastreams"`, etc.
- Collection doc: generic `rel: "items"` with the type buried in
  `href: "systems"`
- Nowhere: the `rel: "ogc-cs:systems"` form we had built for

**What we wrote down:**
[#34 (F1)](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/34) and
[#35 (F2)](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/35).

**The lesson we drew, in our own retro doc**
([docs/implementation/live-server-retest-post-issues-34-35.md](../../implementation/live-server-retest-post-issues-34-35.md)):

> Real servers don't honor the spec's preferred rel naming. We have to
> recognize multiple link relation conventions or our resource discovery is
> dead on arrival.

**What we did:** Taught `extractAvailableResources()` in `csapi/url_builder.ts`
three conventions (prefix, plain name, `items` + href). Smoke-retested,
verified, closed.

**What we did not do:** Apply the same lesson to upstream's `collectionsUrl`
resolver in `endpoint.ts`. We treated F1/F2 as a CSAPI-builder-internal
problem, fixed our walls, moved on. The same OSH server that served us a
`rel: "items"` instead of `rel: "ogc-cs:systems"` will absolutely serve a
`rel: "collections"` instead of `rel: "data"` — and we knew that, and we did
not carry the fix one layer up.

---

## Finding 2 — "OSH puts `featureType` in the wrong namespace. Then sometimes leaves it `null`. Then sometimes uses SSN."

**When we found it:** Phase 3.1 smoke tests, then Smoke Test #18.

Three separate times, three separate findings, all the same shape:

| Finding | What OSH actually returned | Issue | Our fix |
|---|---|---|---|
| F40 | `featureType: "http://www.opengis.net/sensorml/2.0#Feature"` (SensorML, not SOSA) | [#49](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/49) | Added `SENSORML_NS` to `geojson.ts`, generalized `toLocalName()` |
| F41 | `featureType: null` (52°North case) — definition lived in SensorML doc, not GeoJSON | [#50](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/50) | Added `inferResourceTypeFromPath` + `classifyFeature` in `classification.ts` |
| F83 | `featureType: "http://www.w3.org/ns/ssn/Deployment"` (SSN namespace) | [#76](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/76) | Added `SSN_NS` constant, extended `toLocalName` |

**The lesson we drew, repeatedly:**

> Real servers signal CSAPI resource type through `featureType` content, not
> through link relations. Our classification logic has to walk the vocabulary
> lattice — SOSA, SensorML, SSN, and fall back to URL path inference — because
> no single signal is reliable.

**What we did:** Three rounds of vocabulary expansion in
`src/ogc-api/csapi/formats/`.

**What we did not do:** Carry that exact lesson up into `parseCollections`
(`info.ts`). When we wrote the `hasConnectedSystems` block at
[src/ogc-api/info.ts](../../../src/ogc-api/info.ts) lines 313–320, we matched
on `^ogc-cs:.+$` rel — the same blind spot we had three times rejected at the
feature classification layer. The roadmap remembers
([docs/planning/ROADMAP.md](../../planning/ROADMAP.md) line 369):

> Add recognition for CSAPI featureType property (sosa:System,
> sosa:Deployment, etc.)

That's our own TODO. Open since Phase 6. We knew. We wrote it down. We kept
moving.

---

## Finding 3 — "Null-shape responses crash typed parsers. Recurring."

**When we found it:** Repeatedly. Phase 5 code reviews, senior dev review of
`clean-pr`, internal audit of `part2.ts`.

**Three closed instances:**

| Issue | Where | What null caused |
|---|---|---|
| [#143](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/143) | `extractCSAPIFeature` casts `feature.properties` to `Record<string, unknown>` | RFC 7946 permits `properties: null` → TypeError on `p.featureType` |
| [#149](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/149) | 5 parsers in `part2.ts` each null-guard 4 lines, copy-pasted | DRY/maintainability |
| [finding 003](../../code-review/003-pending-p1-unchecked-generic-cast-response.md) (still pending P1) | `parseCollectionResponse<T>` casts raw arrays to `T[]` without element validation | `[null, 42, "oops"]` → TypeError at `result.items[0].id` |

**The lesson we drew:**

> Untyped server JSON entering the typed system needs explicit shape
> validation. `Array.isArray` is not enough. Optional chains and `||`
> defaults are not enough. We need `requireObject` / `isRecord` at every
> boundary.

**What we did:** Extracted `requireObject` helper. Hardened
`extractCSAPIFeature` against null properties. Filed finding 003 to fix
`parseCollectionResponse`.

**What we did not do:** Walk the *callers* of these parsers to find places
that hand them potentially-null inputs. The 6 endpoint getters
(`allCollections`, `recordCollections`, `featureCollections`, `edrCollections`,
`csapiCollections`, `vectorTileCollections`, `mapTileCollections`) do exactly
that:

```ts
.then(([data, hasX]) => (hasX ? data : { collections: [] }))
.then(parseCollections)
```

When `hasX` is true but `data` is null (because the landing page omitted the
`data` rel link → `collectionsUrl` returned null → `this.data` resolved to
null), we hand `null` directly to `parseCollections`. Which calls
`doc.collections.map(...)`. Which is the exact `Cannot read properties of
null` failure we already cataloged three times in adjacent code.

The `csapiCollections` getter is ours — Issue
[#4](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/4),
commit `0ae92fc`. The instruction was "mirror EDR exactly." We mirrored. EDR's
pattern was already broken. We copied the break. `allCollections` two screens
above already showed the correct pattern (`data && data.collections ? ... : []`)
and we did not look.

---

## Finding 4 — "OSH ignores resource IDs. The server returns whatever it wants."

**When we found it:** Multiple smoke tests, but most pointedly
[#99 closed](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/99) — "URL
builder should support `?f=` query parameter for format negotiation (Accept
header ignored by OSH)" — and the broader pattern documented across our smoke
tests:

> The server's response *does* include an alternate link pointing to the
> SensorML representation … This confirms the server supports SensorML — it
> just requires `?f=sml3` instead of `Accept` header negotiation.

OSH's content negotiation is link-driven, not header-driven. The corollary:
**OSH's `self` links are the source of truth for what the server thinks it's
serving you, and they don't always agree with what you asked for.**

**The lesson we drew (implicit but consistent across smoke tests):**

> Link rels and self URLs are server-authored signals we cannot blindly trust.
> We have to validate that what came back matches what we asked for.

**What we did:** For format negotiation, we taught the URL builder `?f=`
(#99 closed). We added `assertResourceAvailable` for endpoint guarding. We
catalogued OSH's quirks across nineteen smoke tests.

**What we did not do:** Defend `getCollectionDocument` against the same
untrusted-self-link surface. The function is upstream camptocamp code, but
Phase 6 made it `public` ([#122](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/122)
commit `20a35d2`), Phase 8 reverts it
([#179](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/179)),
[docs/code-review/024-pending-p2-endpoint-root-publicly-exposed.md](../../code-review/024-pending-p2-endpoint-root-publicly-exposed.md)
tracks the visibility churn — but at no point in any of that handling did we
ask: *"if `self` is wrong, what happens?"* We had the lesson. We had the
function open on our desk. We did not connect them.

---

## Synthesis — What our own findings tell us, and where #188 fits

Across roughly nine months of CSAPI work we independently discovered,
named, fixed, or filed every failure class involved here:

| Failure class | Our prior name(s) for it | #188 sub-finding it now corresponds to |
|---|---|---|
| 6 sibling getters null-deref | F1/F2 + #143 + #149 + finding 003 (null-shape and rel-naming, both classes we know) | **#1** |
| `collectionsUrl` rel allowlist | F1 — we saw OSH-style rel mismatches in late 2025 and fixed them in our walls | **#2** |
| `parseCollections` ignores featureType | F40 + F41 + F83 + ROADMAP line 369 — the featureType-vocabulary lesson we learned three times | **#3** |
| `getCollectionDocument` follows self link blindly | The unstated corollary of #99 / #122 / #179 — self links are server-authored, not authoritative | **#4** |

The pattern is consistent: **each lesson got fixed at the layer where we
discovered it, and never propagated.** OSH burned us, we patched the specific
call site, we moved to the next phase. The discovery layer of
`OgcApiEndpoint` (collections discovery, getter shape, `parseCollections` rel
matcher, `getCollectionDocument` self-link follow) sits one layer above CSAPI
and got every one of these lessons exactly zero times.

That is not a fresh-eyes problem. That is *"we knew, we fixed it where we
were standing, we did not walk one room over."*

What Issue #188 contributes to that picture is not the discovery of any
of the four lesson classes — we owned each one independently — but
**the first concrete, runnable end-to-end reproduction of all four
classes landing on a single client call** (`createCSAPIBuilder('weather-stations')`
against the OpenSensorHub demo). The reporter
([@nsnarayanam](https://github.com/nsnarayanam)) worked around all
four locally and confirmed the call then succeeds end-to-end. That
empirical chain is the artefact our internal research lacked: we had
each lesson, we had no integrated reproduction tying them together.
Phase 9 inherits #188's reproduction as the canonical exit-criterion
fixture for the propagation pass.

---

## Prior research in this repo we already had

A 2026-05-09 sweep of `docs/research/` (every subfolder except `phase-9/`)
plus `docs/governance/` confirmed that not only did we know each of the
four lesson classes, we had **already codified the design principle that
would have prevented all of them** — and applied it elsewhere. The
discovery layer was not part of that elsewhere.

### The canonical fix principle is already on file

[`docs/governance/phase-3-lessons-learned.md`](../../governance/phase-3-lessons-learned.md)
Lesson 2 ("Postel's Law"):

> *"Never gate extraction on validation. Recognition (can we identify
> what this is?) should gate extraction, not validation (does this
> meet all spec requirements?)."*

Phase 3 closed by deleting ~500 lines of upstream validation that violated
this principle. The four sub-issues in #188 are textbook violations of
the same rule, applied at the discovery layer:

- The 6 collection getters validate (`info.collections.filter(...)`)
  before they recognize the null shape.
- `collectionsUrl` validates rel name against an allowlist before
  recognizing that the link is a collections link.
- `parseCollections` validates featureType against `^ogc-cs:.+$` before
  recognizing that the resource is connected-systems-shaped.
- `getCollectionDocument` validates nothing — extracts the self href
  and follows it without recognizing whether the returned resource ID
  matches the requested one.

Phase 3's lesson was *"recognize first, validate at the boundary you
control."* The discovery layer recognizes nothing and validates
everything by accident.

### The vocabulary we ignore is mapped in our own design docs

[`docs/research/design/collections-reader/collections-reader-analysis.md`](../design/collections-reader/collections-reader-analysis.md)
already enumerates the full featureType vocabulary `parseCollections`
should be tolerating:

> *Part 1 Feature Resources (use `featureType`): `http://www.w3.org/ns/sosa/System`, `http://www.w3.org/ns/sosa/Deployment`, `http://www.w3.org/ns/sosa/Procedure`, `http://www.w3.org/ns/sosa/Sample`. Part 2 Non-Feature Resources (use `itemType`): `http://www.w3.org/ns/sosa/Property`. Part 2 Resources may use shorter names without full URIs, unlike Part 1.*
>
> *Detection Logic: Check BOTH `itemType` AND `featureType` properties.*

The `info.ts:313-320` `hasConnectedSystems` rel block matches
`^ogc-cs:.+$` only. Our own design doc says *check both properties and
expect SOSA URIs as well as short names.* The design doc predates the
discovery-layer code that ignores it.

### The methodological precedent for the rel/property divergence claim

[`docs/research/phase-6/findings/osh-server-property-name-divergence.md`](../phase-6/findings/osh-server-property-name-divergence.md)
captured cross-server property-name divergence with bytecode-decompiled
proof:

| Server | Build | `controlStream/schema` field | Command payload |
|---|---|---|---|
| Oracle Cloud OSH | from source (`e74e12e2`) | `paramsSchema` | `params` |
| DigitalOcean OSH | pre-built distribution | `parametersSchema` | `parameters` |
| 52°North CSA Demo | different implementation | `parametersSchema` | `parameters` |

Methodology: `javap -c -p` on compiled JAR files to find hardcoded
string constants (bypasses GitHub-source vs deployed-binary skew). This
is the shape #188's sub-issue 2 (rel-name divergence) is asserting at
the link layer rather than the schema field layer. The methodology
transfers directly.

### Issue #186 already established the prefix-match rule

[`docs/research/references.md`](../references.md) records:

> *CSAPI support MUST be detected by **prefix match** against either
> base… checking for any single specific class (e.g. a draft-era
> `/conf/core` or `/conf/dynamic-data`) is unsafe and excludes
> spec-conformant servers like csapi-go.*

The `hasConnectedSystems` block in `info.ts:313-320` is exactly the
"single specific class" pattern #186 ruled out at the conformance
layer. The conformance reader was fixed; the collections discovery
layer was not. Same lesson, two adjacent rooms.

### The smoke-test discipline is on file too

[`docs/governance/phase-2-lessons-learned.md`](../../governance/phase-2-lessons-learned.md)
Lesson 8 ("Multi-Server Tolerance"):

> *"Smoke test against BOTH servers before marking complete.
> OpenSensorHub (auth required) and 52North."*

[`docs/governance/known-server-quirks.md`](../../governance/known-server-quirks.md)
inventories Smoke Test #18 (OSH: 33 systems, 16 deployments, 100
datastreams; `/controlstreams` lowercase path required) and 52°North
(partial Part 2, expired SSL on demo). The infrastructure to reproduce
all four sub-issues against live servers exists and is documented.

### The HATEOAS principle Finding 4 turns on is also on file

[`docs/research/upstream/url-building-analysis.md`](../upstream/url-building-analysis.md)
§1:

> *Do: Extract URLs from link relations. Don't: Construct URLs
> manually. OGC APIs are hypermedia-driven.*

Finding 4 is not in tension with this — it sharpens it. *Extract* the
self link, yes. But extraction is not authority: the server can
extract-and-emit an href to a resource other than the one requested.
The HATEOAS principle says "prefer link extraction over URL
construction"; it does not say "trust the extracted link unconditionally."
`getCollectionDocument`'s gap is the missing
*recognize-then-extract-then-validate* discipline that Phase 3's
Postel's Law lesson would have specified.

### What the survey did NOT find

The survey is also informative for what it didn't turn up:

1. **No prior mention of Issue #188 itself** anywhere in
   `docs/research/`. The four sub-issues were not pre-flagged as a
   coordinated discovery-layer concern by us.
2. **No documented crash-guard analysis** of the 6 collection getters.
   Collections nullability is known (the type is optional in
   `OgcApiDocument`) but no code review records the runtime null-deref
   pattern. Sub-issue 1 is genuinely the first time it has been named
   in this corpus.
3. **No prior `getCollectionDocument` self-link mismatch case.** The
   foundational HATEOAS principle is documented; the
   sanity-check-against-requested-ID gap is novel.
4. **No live coordinated-reproduction artifact.** Phase 2 Lesson 8
   prescribes both-server smoke testing; the smoke test inventory shows
   we did this once (ST#5) and tapered. The four sub-issues have not
   yet been reproduced as a set against either OSH or 52°North in our
   own logs.

The first and second null results are the most important: this is not a
case where we already had the report and forgot it. We had every
*ingredient* and never assembled the dish. That distinction matters for
the maintainer-vs-us framing — sub-issues 1, 3, and 4 are first-time
discoveries by us *as system-level concerns*, even though every
component lesson is on file.

---

## Cross-repo corroboration — the same lesson classes show up server-side

The pattern is not isolated to client-side code. The
[`OS4CSAPI/connected-systems-go`](https://github.com/OS4CSAPI/connected-systems-go)
repo — our fork of the Go-based CSAPI server we deploy at
`129-80-248-53.sslip.io/csapi-go-upstream/` — closed 24 of 26 issues in early
2026 and parked a 16-item upstream-followup backlog
([upstream-followup-backlog.md](https://github.com/OS4CSAPI/connected-systems-go/blob/main/docs/research/upstream-followup-backlog.md))
to file against `SomethingCreativeStudios/connected-systems-go`. Several of
those backlog items are server-side mirrors of the same lesson classes
catalogued above:

| Lesson class (client side) | Server-side counterpart in cs-go backlog |
|---|---|
| **Null-shape responses** (Finding 3) | Backlog #5 — `ControlStream.Systems` field JSON-leak: GET returns `"Systems": null` at top level (sibling of `Datastream.Systems` fix that landed in `2dc09f7`). The exact null shape our endpoint getters fail on. |
| **Link-rel divergence / featureType vocabulary** (Findings 1 + 2) | Backlog #15 — Inline `@link` absolutization not applied to 5 of 7 resource types (`d2d1347` only fixed Datastream + ControlStream). Server emits inconsistent `@link` shapes across resource types — exactly the heterogeneity our client has to defend against. |
| **Untrusted-self-link surface** (Finding 4) | Backlog #16 — Inline `@link` Type/Title/UID enrichment incomplete (per maintainer's *"not all fully enriched"* self-ack). Server's own self-link metadata is partial and inconsistent across resources, validating our suspicion that `self` is server-authored signal, not authority. |
| **Silent shape changes between server versions** | Backlog item #17 — silent SensorML field loss exposed by upstream commit `a467aba`'s strict decode. The same pre-strict OSH server that previously accepted broken shapes silently dropped fields on GET. The lesson — *server permissiveness varies by build, never trust the round-trip* — is one we already learned with [#140 closed (paramsSchema vs parametersSchema)](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/140) on the client. |

**What this adds:** the four lesson classes in our findings are not OSH
quirks. They are CSAPI ecosystem patterns visible on at least three servers
(OSH Java at `45.55.99.236`, 52°North, and cs-go). Phase 9 propagation work
should assume *every* CSAPI server will exhibit some subset of these classes,
not just OSH.

**A third server we can smoke-test against.** The
[cross-server-interoperability-analysis.md](../../implementation/cross-server-interoperability-analysis.md)
recommendation #8 named OSH and 52°North as the two-server pair. That doc
predates cs-go's deployment to Oracle Cloud. The pair is now a **trio** and
we have CRUD permission on cs-go (per
[OSHConnect-Python](https://github.com/OS4CSAPI/OSHConnect-Python) PR #6
work). Phase 9 smoke-test discipline should hit all three.

---

## Cross-repo corroboration — the explorer repo's `docs/implementation` archive

A third repo in our orbit,
[`OS4CSAPI/ogc-csapi-explorer`](https://github.com/OS4CSAPI/ogc-csapi-explorer)
(branch `demo/acoustic-cuas-targeting`) — a Vue/TypeScript front-end that
consumes this library against live CSAPI servers — keeps a ~330 KB
`docs/implementation/` archive of phased code reviews, smoke tests, and
design notes. An exhaustive sweep of that archive turned up multiple
load-bearing artifacts that corroborate, extend, or in one case explicitly
fail to corroborate Issue #188's four sub-findings.

### A. The explorer repo already concluded the Postel's Law argument

The single most consequential file is
[`design-notes-validation-extraction-decoupling.md`](https://github.com/OS4CSAPI/ogc-csapi-explorer/blob/demo/acoustic-cuas-targeting/docs/implementation/design-notes-validation-extraction-decoupling.md)
(14 KB). It is **entirely** about validation-extraction decoupling and
reaches the same conclusion we just renamed Implication #1:

> **Postel's Law** — Be liberal in what you accept from servers.
> Server-side responsibility for validation, client-side responsibility for
> access. The mature WMS/WFS/WMTS handlers follow this; STAC's inline
> validation is the exception.

> A client library that blocks access to usable server data is failing its
> core purpose. **Validators can only block, never enable.**

> The validators were the scaffolding; the types and extractors are the
> building.

The trigger was finding **F49**: OSH SamplingFeatures lacked the spec-required
`sampledFeature@link` property, and `extractCSAPIFeature()` called
`validateCSAPIFeature()` as a hard gate, so **100 % of OSH SamplingFeatures
became inaccessible through the client library** despite carrying perfectly
usable geometry / uid / name / featureType / validTime. The explorer repo's
chosen remedy — **delete the validator layer entirely** (Issue #52 in that
repo) — is the most aggressive form of the same Postel's Law conclusion
Issue #188 is asking us to apply to the *discovery* layer specifically.

This is now the second independent prior articulation of the same lesson in
our orbit (the first was [Phase 3 Lesson 2](../docs-archive-PHASE-3-CODE-REVIEW.md)
folded in earlier in this doc). Two of three sister repos converged on it
without coordination. Implication #1 is therefore not a Phase-9 invention;
it is a re-discovery.

### B. Findings #1, #2, #3 are independently corroborated; Finding #4 is not

Mapped against Issue #188's sub-findings:

| #188 sub-finding | Explorer-repo evidence | Strength |
|---|---|---|
| **#1 — null-deref in collection getters** | `design-notes-validation-extraction-decoupling.md` (F49: extraction blocked by validator gate); `server-quirks-reference.md` F82 (OSH items envelope missing `links` key — already mitigated by `parseCollectionResponse()` defaulting to `[]`); F85 (deployments have absent `validTime` and code uses `validTime!` non-null assertion) | **Load-bearing** |
| **#2 — `collectionsUrl` rel allowlist too narrow** | [`cross-server-interoperability-analysis.md`](https://github.com/OS4CSAPI/ogc-csapi-explorer/blob/demo/acoustic-cuas-targeting/docs/implementation/cross-server-interoperability-analysis.md) F1 (query params on href broke Convention 3 parser — fixed by Issue #34) and F2 (52°North uses `featuresOfInterest`, our scanner only knew `samplingFeatures` — fixed by Issue #35 by adding the alias). The remediation pattern is the same one #188 calls for: widen the recogniser, don't tighten the allowlist. | **Corroborative** |
| **#3 — `parseCollections` ignoring `featureType`** | [`server-quirks-reference.md`](https://github.com/OS4CSAPI/ogc-csapi-explorer/blob/demo/acoustic-cuas-targeting/docs/implementation/server-quirks-reference.md) F40 (OSH uses SensorML namespace not SOSA), F41 (52°North emits `featureType: null` for all 3 systems), F83 (one OSH deployment uses SSN not SOSA), F84 (52°North procedure misclassified as System because its `featureType` is `sosa:Sensor`); plus [`d1-d3-d4-fix-recommendations.md`](https://github.com/OS4CSAPI/ogc-csapi-explorer/blob/demo/acoustic-cuas-targeting/docs/implementation/d1-d3-d4-fix-recommendations.md) D-1 (twin `SystemTypeUris` inventories — one CURIE-only, one CURIE+full-URI — bearing witness to how messy the real `featureType` value space is). | **Load-bearing** |
| **#4 — `getCollectionDocument` blindly follows `self`** | **Zero hits.** No mention of self-link verification, ID mismatch detection, or blind link-following in any of the 14 prioritised files (~330 KB). | **Null result — recorded** |

Finding #4's null result is itself useful evidence. The explorer repo's
smoke tests have hit OSH and 52°North hard for months and never observed
the failure mode @nsnarayanam called out. That means either (a) it has not
yet manifested against the two servers under test, (b) it is specific to
third-party servers we have not tried (pygeoapi, QGIS-as-server, ldproxy),
or (c) it is currently theoretical. Phase 9 should treat it as
**defensive-coding territory**: the fix is cheap (`assert returned.id ===
requested`), the absence of observed failures is not the absence of the
bug, and adding a guard costs nothing.

### C. The explorer repo's server-quirks catalog is the discovery-layer test oracle

[`server-quirks-reference.md`](https://github.com/OS4CSAPI/ogc-csapi-explorer/blob/demo/acoustic-cuas-targeting/docs/implementation/server-quirks-reference.md)
(40 KB, ~90 numbered findings F1–F85+) is structured as a per-server
quirks catalog (OSH vs 52°North) with a cross-server comparison table.
For Phase 9, this is the closest thing we have to a **discovery-layer
conformance fixture** — every quirk in it is a real shape that landed in a
real client over real HTTP, and any fix we ship for #188's four findings
should be checked against that table before we mark the issue resolved.
Concretely, the items the catalog flags as still-relevant for the
discovery layer are: response-envelope variation (`{items: [...]}` vs
`FeatureCollection`), validTime as array vs scalar vs `null`, `Accept`
header ignored in favour of `?f=` query param (F71), top-level vs
collection-scoped resource URLs, and the `featureType` namespace zoo.

### D. New process lesson: AI drift can fabricate findings then "verify" them

[`f57-content-negotiation-correction.md`](https://github.com/OS4CSAPI/ogc-csapi-explorer/blob/demo/acoustic-cuas-targeting/docs/implementation/f57-content-negotiation-correction.md)
(18 KB) documents a retracted finding. The explorer repo's AI agent
silently changed the `Accept` header between smoke tests, filed F57
based on the wrong data, "verified" F57 using the same wrong header, and
initially dismissed the human's correct counter-observation as a browser
cache artefact. The retraction lesson, codified there as **L13**, lines
up exactly with the no-skilled-human-reviewer accepted-risk framing later
in this doc:

> The finding survived because re-verification was performed in the same
> context that produced the error.

This is durable evidence for our governance posture: every Phase 9 filing
must record the exact request (URL, method, headers, query params, body)
that produced the observed shape, not just the shape itself. A second
agent should be able to replay the request verbatim and reproduce the
observation independently. **The reproduction step is the only check on
AI drift we actually have.**

### E. Explorer-repo files reviewed (citation-strength rating)

| File | Size | Strength | Why it mattered |
|---|---:|---|---|
| `design-notes-validation-extraction-decoupling.md` | 14 KB | Load-bearing | Independent prior articulation of Postel's Law / Implication #1 |
| `server-quirks-reference.md` | 40 KB | Load-bearing | The discovery-layer conformance fixture (~90 findings) |
| `cross-server-interoperability-analysis.md` | 10 KB | Corroborative | F1/F2 directly parallel #188 finding #2 |
| `d1-d3-d4-fix-recommendations.md` | 10 KB | Corroborative | `SystemTypeUris` dual-inventory parallels #188 finding #3 |
| `f57-content-negotiation-correction.md` | 18 KB | Process-lesson | L13 — AI drift survives same-context re-verification |
| `final-project-code-review.md` | 38 KB | Background | Confirms validator-removal landed (Issue #52) |
| `phase-6-architecture-verification.md` | 19 KB | Process-lesson | Smoke-test cadence and regression-tracking template |
| `outstanding-findings-status-report.md` | 9 KB | Background | Status bookkeeping; no new lesson classes |
| `deferred-findings-final-disposition.md` | 9 KB | Corroborative | F82 (`links` defaulting) precedent for #188 finding #1 |
| `f70-design-findings-investigation.md` | 6 KB | Tangential | Phase-6 introduced no architecture debt |
| `note-crud-smoke-test-readiness.md` | 10 KB | Tangential | CRUD scope clarification; not discovery-layer |
| `p4-findings-code-vs-docs-reassessment.md` | 8 KB | Tangential | Scope discipline reinforcement |
| `p5-findings-coverage-analysis.md` | 11 KB | Background | Findings-to-phase mapping |
| `note-F71-osh-accept-header-noncompliance.md` | 3 KB | Corroborative | OSH `Accept` non-compliance — discovery-layer relevant |

Total: 14 files, ~205 KB of the archive's ~330 KB read in detail. The
remaining ~125 KB is largely per-phase code-review and per-phase smoke-test
files; the keyword-targeted skim across them surfaced no novel
discovery-layer pitfalls beyond what the table above already captures.

---

## Cross-repo corroboration — OSHConnect-Python's `docs/research` archive

A fourth sister repo, [`OS4CSAPI/OSHConnect-Python`](https://github.com/OS4CSAPI/OSHConnect-Python),
is the Python-client side of the same CSAPI ecosystem and originated
the SensorML silent-field-loss PR earlier in this effort. Its
`docs/research/` folder (~50 files, ~1 MB) was surveyed with the same
thoroughness posture as the explorer sweep; 19 files (~310 KB) directly
bear on #188's four sub-findings. The lower-priority remainder
(USGS publishers, LOB triangulation, simulator portability, NDBC/NWS
buoy specifics, ISS orbit work, UAS scenario packs) was
keyword-skimmed and contains no #188-relevant signal.

### A. Sub-finding #4 is no longer a null result — server-side ghost-resource evidence

The explorer-repo sweep recorded #188 sub-finding #4
(`getCollectionDocument` blindly follows the `self` link when the
target ID does not match the requested ID) as a *null result* — defensive
coding, not a response to an observed failure.
[`OSH_Ghost_Resource_Stale_Index_Bug.md`](https://github.com/OS4CSAPI/OSHConnect-Python/blob/main/docs/research/OSH_Ghost_Resource_Stale_Index_Bug.md)
(20 KB) overturns that disposition with a live wire-level reproduction
against OSH SensorHub:

- A dual-registered system (top-level + subsystem) is deleted from the
  resource store, but **persists in the collection listing**.
- `GET /systems/{id}` → **404 NOT FOUND**.
- `GET /systems?limit=100` → **ghost entry returned with full GeoJSON
  payload**, but the entry is unreachable by direct fetch.
- `DELETE /systems/{id}` on the ghost → **404** (cannot purge).
- A subsequent POST with the same UID **reuses the ghost's ID**, but a
  GET on that ID *still* returns 404. The collection-listing index and
  the individual-resource store are *desynchronized*.

This is the exact failure mode #188 finding #4 warns against: a client
that enumerates `/collections`, picks an entry, and then follows the
entry's `self` link without validating that the returned document's ID
matches the requested ID will silently consume ghost data. The OSH bug
turns `getCollectionDocument` from a defensive-coding concern into one
with a documented live reproduction. The Phase 9 disposition for #4
should be revised: the guard belongs in the fork *and* the finding now
clears filing gate 6a (live reproduction exists). It remains held by
gate 6b until interpretive spec text on `self` link authority is
quoted verbatim.

### B. Sub-finding #1 — load-bearing server-side evidence of the silent-drop pattern

Four documents establish that OSH systematically accepts spec-defined
`@link` array fields with HTTP 201, then silently discards them on
read-back:

- [`OSH_DeployedSystems_Conformance_Gap.md`](https://github.com/OS4CSAPI/OSHConnect-Python/blob/main/docs/research/OSH_DeployedSystems_Conformance_Gap.md)
  (22 KB) — `deployedSystems@link` (required per OGC 23-001 §8.5
  Table 10): PUT 204 → GET absent.
- [`OSH_Deployment_Link_Persistence_Gap.md`](https://github.com/OS4CSAPI/OSHConnect-Python/blob/main/docs/research/OSH_Deployment_Link_Persistence_Gap.md)
  (19 KB) — `deployment@link` on Datastreams: same silent-drop pattern.
- [`OSH_SamplingFeature_Link_Persistence_Gap.md`](https://github.com/OS4CSAPI/OSHConnect-Python/blob/main/docs/research/OSH_SamplingFeature_Link_Persistence_Gap.md)
  (7 KB) — third instance: `samplingFeature@link` on Observations.
  *"OSH persists `@link` fields that follow its internal hierarchy
  (`platform@link` on deployments, `system@link` on datastreams). It
  drops cross-cutting associations."*
- [`NWS_NDBC_Hollow_SensorML_Metadata.md`](https://github.com/OS4CSAPI/OSHConnect-Python/blob/main/docs/research/NWS_NDBC_Hollow_SensorML_Metadata.md)
  (13 KB) — bootstrap writes rich SensorML; server returns hollow
  shells on GET. *"Characteristics without group wrapper, documents
  with flat `url` key instead of `link` object"* are silently dropped.

The pattern triple-corroborates Postel's Law / Implication #1: clients
that assume spec-defined fields will be present in collection responses
will null-deref against compliant-on-paper servers. The previous
load-bearing citations were the explorer repo's F49 / F82 / F85.
OSH-Python adds **server-side wire evidence** for the same class.

### C. Sub-finding #2 — corroborative evidence of missing rel advertisements

[`OSH_Deployment_Hierarchy_and_System_Association.md`](https://github.com/OS4CSAPI/OSHConnect-Python/blob/main/docs/research/OSH_Deployment_Hierarchy_and_System_Association.md)
(27 KB) and
[`OSH_DeployedSystems_Conformance_Probe.md`](https://github.com/OS4CSAPI/OSHConnect-Python/blob/main/docs/research/OSH_DeployedSystems_Conformance_Probe.md)
(15 KB) document that OSH advertises `subdeployments` as a link rel
on deployments but **does not advertise `deployedSystems` on
deployments or `deployments` on systems**. The corresponding endpoint
(`GET /deployments/{id}/deployedSystems`) returns `400 "Invalid
resource name"`. Distinct from #188 finding #2 (an *allowlist*
rejecting valid rels), this is the dual mode: the server *omits* the
rel entirely, forcing clients to either hardcode URL paths or fail
discovery silently. Either failure mode lands in the same place — a
client whose discovery is brittle to the rel vocabulary the server
actually emits. This sweep raises #188 finding #2's strength from
*corroborative* (paralleled by explorer Issues #34/#35) to
*corroborative across two failure modes* (allowlist *and* omission).

### D. Sub-finding #3 — informational, not load-bearing

No evidence in OSHConnect-Python that `featureType` is *deliberately
filtered out* during collection parsing. Field loss is documented
(NWS hollow metadata, SensorML field shapes silently dropped) but as
incidental loss within the broader silent-drop pattern, not as a
dedicated discrimination-stripping path. The disposition for #3
(weakly load-bearing in the explorer sweep via F40/F41/F83/F84) is
unchanged; this repo neither strengthens nor refutes it.

### E. New process lesson — 302-redirect error masking

[`OSH_Datastream_Creation_Format_Requirements.md`](https://github.com/OS4CSAPI/OSHConnect-Python/blob/main/docs/research/OSH_Datastream_Creation_Format_Requirements.md)
(26 KB) documents a discovery-layer pitfall not previously named in
our governance: when a client POSTs with a near-correct content type
(`application/json` instead of `application/swe+json`) or a
near-correct schema key (`resultSchema` instead of `recordSchema`),
the OSH server returns a **302 redirect** rather than a 4xx error.
The redirect masks the validation failure — the client follows it,
receives a 200, and only discovers the silent-drop on subsequent
GET. The *write/read asymmetry* (server reads back as
`application/om+json` even when written as `application/swe+json`)
compounds it.

For Phase 9 filing gates this surfaces a concrete failure mode worth
calling out: **300-class responses on write paths must be treated as
validation failures, not as successful redirects, when the original
request carried a body the server is silently re-routing.** This
generalises gate 6a (capture exact request) — the captured request
must include the *response status chain* (every redirect followed,
each status code) so a second agent replaying it can distinguish a
clean 200 from a 302→200 that masked a silent drop.

### F. OSHConnect-Python files reviewed (citation-strength rating)

| File | Size | Strength | Why it mattered |
|---|---:|---|---|
| `OSH_Ghost_Resource_Stale_Index_Bug.md` | 20 KB | Load-bearing | Live wire reproduction of #188 finding #4 (collection→fetch ID desync) |
| `OSH_DeployedSystems_Conformance_Gap.md` | 22 KB | Load-bearing | Server-side silent-drop of spec-required `@link` arrays |
| `OSH_Deployment_Link_Persistence_Gap.md` | 19 KB | Load-bearing | Three-mechanism failure: `deployment@link`, endpoint, `deployedSystems@link` |
| `OSH_SamplingFeature_Link_Persistence_Gap.md` | 7 KB | Load-bearing | Third instance of array-`@link` silent-drop pattern |
| `NWS_NDBC_Hollow_SensorML_Metadata.md` | 13 KB | Load-bearing | Hollow metadata returned for spec-defined SensorML fields |
| `OSH_Datastream_Creation_Format_Requirements.md` | 26 KB | Load-bearing | New process lesson: 302-redirect error masking on write paths |
| `OSH_DeployedSystems_Conformance_Probe.md` | 15 KB | Corroborative | Empirical proof: `/deployments/{id}/deployedSystems` → 400 |
| `OSH_Deployment_Hierarchy_and_System_Association.md` | 27 KB | Corroborative | Required link rels not advertised by server |
| `Deployment_Scoped_Queries_Conformance_Report.md` | 64 KB | Corroborative | `GET /deployments/{id}/datastreams` → 400; rel omission |
| `OSH_Global_Datastreams_Endpoint_500_Bug.md` | 5 KB | Corroborative | Collection-level crash on malformed datastream schema |
| `CSAPI_Go_Server_Integration_Report_2026-04-17.md` | 42 KB | Background | Cross-server integration patterns |
| `OSH_Sampling_Features_Implementation_Analysis.md` | 19 KB | Informational | Feature-not-supported vs. feature-broken indistinguishable |
| `Localizer_Datastream_Deletion_Incident_2026-03-10.md` | 7 KB | Corroborative | Null-fallback failures in real client code |
| `OSH_Cascade_Delete_Experiment.md` | 14 KB | Tangential | DELETE 400 vs 409 conformance gap (not discovery-layer) |
| `OSH_Delete_Cascade_and_Reparenting.md` | 15 KB | Tangential | Resource lifecycle complexity (not discovery-layer) |
| `OSH_Observation_Count_API_Gap.md` | 5 KB | Informational | Missing `numberMatched`/`numberReturned` on collections |
| `Gold_Dots_SamplingFeature_Analysis.md` | 5 KB | Informational | Modeling trade-offs under server gaps |
| `CSAPI_Deployment_Modeling_Standards_Conformance.md` | 12 KB | Informational | Spec/OAS divergence on deployment-scoped endpoints |
| `CSAPI_Deployment_Semantics_Analysis.md` | 19 KB | Informational | Mental-model clarification (deployments don't own data) |

Total: 19 files, ~356 KB read in detail. The remaining ~30 files
(~640 KB) are domain-specific publisher / simulator / LOB /
deployment-modelling work; keyword-targeted skim surfaced no
discovery-layer signal beyond what the table captures.

---

## Process discipline borrowed from cs-go

`connected-systems-go`'s
[upstream-followup-plan.md](https://github.com/OS4CSAPI/connected-systems-go/blob/main/docs/research/upstream-followup-plan.md)
codified a four-step workflow for moving each finding from triage to filed
upstream issue:

1. **Per-issue research plan** at `docs/research/upstream-issues/plan-NN-<slug>.md`
   identifying sources, evidence files, maintainer-triage signal, upstream
   commit context, re-verification commands, and spec-authority citations.
2. **Per-issue report** at `docs/research/upstream-issue-reports/report-NN-<slug>.md`
   synthesizing findings with static + live evidence, alternatives weighed,
   recommended fix, scope guard, fork-side context, and a clearly-marked
   *public-facing extract* section that becomes the upstream issue body
   verbatim.
3. **File the issue** as a mechanical copy of the public-facing extract — the
   issue body is never freshly written, always copied from the report.
4. **Update tracking** — backlog item moves from "Open" to "Closed/superseded"
   with the upstream issue URL.

Two standing decisions from that plan are directly relevant to Phase 9:

- *"All upstream submissions are filed as **issues**, never as direct pull
  requests — even for one-line fixes. The maintainer owns the canonical repo
  and decides what merges; our job is to surface findings with full evidence
  and let them choose the fix shape and timing."*
- *"Issues are drafted and filed **one at a time**, not in batches."*

Our governance precedent
([docs/code-review/upstream-findings-report.md](../../code-review/upstream-findings-report.md))
already says hands-off on upstream code in our PRs. The cs-go workflow gives
us a **constructive alternative** — file as an issue with full evidence,
don't patch around it silently and don't open uninvited PRs. Phase 9's
sub-issues 1 (5 upstream getters), 2 (`collectionsUrl`), and 4
(`getCollectionDocument` self-link) are exactly the shape that workflow was
built for.

**Authoritative references contract.** The cs-go research plan template
opens with: *"Mandatory first action when authoring or working from any
research plan: re-read the curated authoritative-references list at*
[`OS4CSAPI/ogc-client-CSAPI_2:phase-8/docs/research/references.md`](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/blob/phase-8/docs/research/references.md)
*. Self-sourcing references is forbidden; gaps must be surfaced to the user
before drafting."* That references file is in this repo and Phase 9
upstream-filing work is bound by the same rule.

---

## Maintainer-engagement signals from the cs-go filing pass

As of 2026-05-09, eleven of the cs-go backlog items have been filed against
[`SomethingCreativeStudios/connected-systems-go`](https://github.com/SomethingCreativeStudios/connected-systems-go/issues?q=is%3Aissue).
Three early dispositions calibrate what Phase 9 should expect when filing
discovery-layer findings against camptocamp:

### Signal A — Concrete structural evidence + matching prior-fix pattern → merged in hours

[Issue #3](https://github.com/SomethingCreativeStudios/connected-systems-go/issues/3)
(`ControlStream` emits `"Systems": null`) — filed with one-line struct-tag
diff against the parent fix `2dc09f7`, plus live curl on the deployed binary
showing the literal `"Systems": null` member on `GET /controlstreams/{id}`.
**Closed and merged via PR #13 ~10 hours after filing.**

This is the exact wire shape Finding 3 ("null-shape responses crash typed
parsers") defends against, captured live on a third independent CSAPI
server. The defensive parser hardening we did at lower layers is justified
by **observed wire output**, not just speculation.

### Signal B — Spec-conformance argument with cited authority → merged

[Issue #10](https://github.com/SomethingCreativeStudios/connected-systems-go/issues/10)
(inline `@link.href` absolutization across 11 sites in 4 resource types) —
filed with the OAS31 `format: uri` constraint, RFC 3986 §4.3, and a static
file-by-file enumeration. **Linked PR #15 ("Absolute links everywhere")
will close.** Validates Finding 4's premise that server-emitted self / inline
links are heterogeneous and only normalized opportunistically. Even where the
maintainer is responsive, the normalization landed late and one resource type
at a time — which is precisely why our client cannot trust them as authority.

### Signal C — Misread of spec semantics → closed as invalid

[Issue #9](https://github.com/SomethingCreativeStudios/connected-systems-go/issues/9)
(`DatastreamDataComponent.Updatable` orphaned in validator) — filed with full
static evidence chain, asymmetry table, and SWE Common 3.0 citation.
**Closed as `invalid` ~11 hours after filing**, with the maintainer's
verbatim disposition:

> *"Marking as invalid as the AI falsly assumed updatable is meta for
> datastream schema, instead its for the observation value: 'Specifies
> if the value of a data component can be updated externally (i.e., is
> variable)'. The spelling difference of updatable between datastream
> and controlstream is valid however, and can be opened as a new issue."*

The filing's recommended-fix block had even acknowledged the dual reading
(*"SWE Common's `updatable` flag admits two readings: (a) the component's
definition cannot change… and (b) recorded values for that component cannot
change"*) and explicitly recommended leading with reading (a) — which is the
reading the maintainer rejected as a misread of the spec.

**This is the directly-relevant signal for Phase 9.** The cs-go workflow
(per-issue research plan, per-issue report, authoritative-references
contract, public-facing extract) ran in full and *still* shipped an AI-authored
filing that misread the underlying spec language. The discipline is necessary
but not sufficient. Implications for any Phase 9 upstream filing against
camptocamp:

1. The spec-authority section must include the **verbatim normative
   sentence**, not a paraphrase, and must distinguish between alternative
   readings before recommending a fix. Issue #9's "two readings" caveat
   was correct *and ignored* in the recommended-fix selection.
2. **Live evidence beats structural inference.** Issues #3 and #10 (merged)
   both lead with observed wire output. Issue #9 (rejected) is structural
   inference + asymmetry table, no live behavior demonstrating the claimed
   defect. Phase 9 findings should be filed only after the wire-level
   defect is reproduced against at least one CSAPI server.
3. **Adjacent findings are a pattern.** Maintainer carved out the
   "spelling difference of `updatable` vs `updateable`" as a separately
   filable wire-format defect. This is the same mode our findings exhibit
   ("we kept finding featureType variants, kept filing them at lower
   layers, never propagated"). Adjacent findings should be flagged in the
   filing and fielded in batched follow-ups, not silently absorbed into
   the parent claim.
4. **AI-authored filings are at elevated risk of spec misreads.** The
   maintainer's disposition cites the AI specifically. Phase 9 filings
   that touch interpretive spec text (rel name semantics, featureType
   vocabulary scope, "self" link authority) are at elevated risk of
   the same failure mode. **No domain-skilled human reviewer is
   available on this effort** (see "Accepted risk" under Implications
   below); the mitigation is structural — verbatim normative text,
   explicit acknowledgement of alternative readings, mandatory live
   reproduction, one claim per filing, durable capture of rejected
   filings as signal.

---

## Implications for Phase 9

This document is initial research only. It establishes the diagnostic frame.
What it surfaces, but does not yet decide:

1. **Postel's Law is the design principle, on the record.** Phase 3
   Lesson 2 ([docs/governance/phase-3-lessons-learned.md](../../governance/phase-3-lessons-learned.md))
   is binding governance: *"Never gate extraction on validation.
   Recognition (can we identify what this is?) should gate extraction,
   not validation (does this meet all spec requirements?)."* All four
   sub-issues are violations of that rule at the discovery layer. Any
   Phase 9 fix or upstream filing must lead with this principle as the
   architectural rationale, not as a coding-style preference.
2. **Lesson-propagation pass as a first-class deliverable.** Phase 9 should
   include an explicit pass that, for each lesson we previously fixed in
   CSAPI, audits the upstream-inherited `OgcApiEndpoint` surface for the same
   class and either fixes it (if ours), files an upstream issue with
   evidence (per the cs-go discipline), or contributes upstream where the
   maintainer signals interest.
3. **Maintainer-vs-us boundary, per finding.** Sub-issues 1 (5 of 6 getters),
   2, and 4 sit in upstream camptocamp code. Our governance precedent
   ([docs/code-review/upstream-findings-report.md](../../code-review/upstream-findings-report.md))
   says hands-off in our PRs. The cs-go workflow gives us a constructive
   alternative — file as a camptocamp issue with full evidence, one at a
   time, never as an unsolicited PR. The `csapiCollections` getter and the
   `info.ts` `hasConnectedSystems` rel block are unambiguously ours and are
   unblocked. **Sub-finding #4 (`getCollectionDocument` blindly follows
   `self`) was previously held as defensive-coding-only** because the
   explorer repo's smoke-test archive contained zero observations of
   the failure in the wild. The OSHConnect-Python sweep (above) **lifts
   that hold**:
   [`OSH_Ghost_Resource_Stale_Index_Bug.md`](https://github.com/OS4CSAPI/OSHConnect-Python/blob/main/docs/research/OSH_Ghost_Resource_Stale_Index_Bug.md)
   documents a live OSH wire-level reproduction where
   `GET /systems?limit=100` returns ghost entries that 404 on direct
   fetch — the exact desync between collection listing and resource
   store that #4 warns against. The disposition is therefore: land the
   guard in the OS4CSAPI fork *and* draft an upstream filing against
   camptocamp citing the OSH ghost-resource reproduction. The filing
   still must clear gate 6b (verbatim normative text on `self` link
   authority and alternative readings) before it goes out.
4. **Process gap on cross-server smoke testing — now three-server.**
   [docs/implementation/cross-server-interoperability-analysis.md](../../implementation/cross-server-interoperability-analysis.md)
   recommendation #8 prescribed every-phase smoke testing on OSH +
   52°North.
   [docs/governance/phase-2-lessons-learned.md](../../governance/phase-2-lessons-learned.md)
   Lesson 8 made it mandatory. That doc predates cs-go's deployment. The
   smoke-test pair is now a trio (OSH `45.55.99.236`, 52°North,
   cs-go-upstream `129-80-248-53.sslip.io`).
   [docs/governance/known-server-quirks.md](../../governance/known-server-quirks.md)
   already inventories ST#18 with concrete OSH resource counts.
   Re-establishing the discipline is a Phase 9 process task, not a code
   task.
5. **Authoritative-references contract, with precedence rule.** Any
   upstream-filing work in Phase 9 must begin by re-reading
   [docs/research/references.md](../references.md) and may only cite
   sources from that list. The
   [`AI_OPERATIONAL_CONSTRAINTS.md`](../../governance/AI_OPERATIONAL_CONSTRAINTS.md)
   precedence rule is binding: Specs (1) → Agreement (2) → Issue desc
   (3) → Code/docs (4) → Conversation (5). Spec authority outranks
   convenience-of-fix; if `references.md` does not contain a source
   needed for a filing, the gap is surfaced before drafting, never
   self-sourced.
6. **Filing gates inherited from cs-go's #9 invalid disposition and the
   explorer repo's F57 retraction.** Before any Phase 9 finding is
   filed against camptocamp:
   (a) the wire-level defect must be reproduced against at least one
   live CSAPI server and the *exact request* (URL, method, headers,
   query params, body) captured in the filing — not just the response
   shape. The explorer repo's L13 lesson (`f57-content-negotiation-correction.md`)
   is that AI-authored findings can survive re-verification when the
   re-verification reuses the same broken request context that
   produced the original observation. Capturing the request verbatim
   is the only check on this drift mode we have;
   (b) any spec-authority section that turns on interpretive language
   (rel-name semantics, featureType vocabulary scope, `self` link
   authority, null-shape conformance) must quote the normative sentence
   verbatim and acknowledge alternative readings before recommending a
   fix; (c) AI-authored filings must self-review the spec-authority
   block against the verbatim normative text before filing — see
   "Accepted risk" below for why the cs-go human-reviewer step is not
   available on this effort;
   (d) every reproduction must be replayable from the captured request
   alone — if a second agent (or a future return to this work) cannot
   reproduce the observation from the captured request verbatim, the
   finding is held until it can;
   (e) the captured request must include the **full response status
   chain** (every redirect followed, each intermediate status code,
   final body) — the OSHConnect-Python sweep surfaced a 302-redirect
   error-masking pattern on write paths where the client receives
   200 OK on a request the server silently re-routed and re-validated.
   A second agent replaying a captured request without the status
   chain cannot tell a clean 200 from a 302→200 that masked a silent
   drop.

### Accepted risk — no skilled human-in-the-loop reviewer available

This effort does not have a domain-skilled human reviewer available to
sign off on AI-authored filings before they are posted upstream. The
cs-go #9 disposition demonstrates the concrete cost of that gap: an
AI-authored filing with full evidence chain, asymmetry table, and SWE
Common 3.0 citation was still rejected as a spec misread. We do not have
the resources to add the reviewer step that would have caught it.

This is an **accepted risk for Phase 9**, not a deferred one. The
mitigation posture is "maximum diligence the AI workflow can supply,"
specifically:

- **Mandatory live reproduction before filing** (gate 6a above) — the
  AI cannot misread wire output the way it can misread spec prose, so
  any finding that cannot be reproduced live is held back, not filed.
- **Verbatim normative text in every spec-authority block** (gate 6b
  above) — paraphrase is the failure mode that produced #9. The filing
  template requires the quoted sentence; if the sentence does not
  unambiguously support the recommended fix, the filing is held.
- **Acknowledge alternative readings explicitly** — when interpretive
  spec language admits more than one reading, list them and state which
  reading the filing leads with and why. The maintainer can then push
  back on the choice rather than the framing.
- **Adjacent findings filed separately, not folded in** — cs-go #9's
  carve-out of the `updatable`/`updateable` spelling defect is the
  pattern. One claim per filing.
- **Accept-and-record rejected filings as durable evidence.** When a
  filing is rejected (as #9 was), the disposition comment is captured
  verbatim in the per-issue report's "Maintainer disposition" section
  and the filing is not re-litigated. Rejected filings are durable
  signal about where AI-authored research is unreliable, and that
  signal feeds back into this gate list.
- **No PRs, only issues** (already a standing decision from the cs-go
  workflow) — limits the blast radius of a misread to a closeable
  issue, not a code change requiring revert.

The risk this leaves on the table is filings that pass all the gates
above but still misread interpretive spec text in a way only a
domain-skilled reviewer would catch. We do not have a way to close that
gap on this effort. Phase 9 proceeds with the gap acknowledged.

7. **No code changes proposed yet.** This is research. Triage,
   maintainer-vs-us classification per sub-finding, plan/report drafting per
   the cs-go workflow, and PR scoping all come next.

---

## Courses of action

Five COAs are on the table for disposing of Issue #188 and the
broader propagation gap this research surfaces. Each is stated with
its scope, cost, and the risk it carries. The recommendation follows.

### COA 1 — Close #188 as out-of-scope, take no action

**Scope.** Reply on #188 acknowledging the four sub-findings, point
the reporter at the workaround they already implemented locally, and
close. Do not patch the fork. Do not file upstream.

**Cost.** Near zero engineering cost.

**Risk.** High. Three of the four sub-findings (#1, #2, #3) already
have closed-issue ancestry in this repo (#143, #149, #34/#35, #186,
#49/#50/#76). Closing #188 as out-of-scope re-buries lessons that
the project has already paid to learn. The next consumer who hits
the same surface will refile, and the integrity claim of the
phase-9 research corpus weakens because we documented a propagation
gap and then declined to close it. Recommended only if the project
is being shelved.

### COA 2 — Fix in the OS4CSAPI fork only; do not file upstream

**Scope.** Land four small, surgical fixes on `phase-9` (or a child
branch):
- #188 #1: mirror the `allCollections` null-guard pattern across the
  six sibling getters in `endpoint.ts`.
- #188 #2: add `'collections'` to the `collectionsUrl` rel allowlist.
- #188 #3: introduce a `CSAPI_FEATURE_TYPES` Set in `info.ts` and
  extend `parseCollections` to treat `featureType` as an alternative
  CSAPI signal alongside `^ogc-cs:.+$`.
- #188 #4: post-fetch ID validation in `getCollectionDocument`,
  returning a typed error rather than the wrong resource when the
  `self` link resolves to a parent URL.

Each fix is paired with the unit-test fixture it would need plus
the OSH demo as the integration smoke target. #188 stays open as
the tracking issue and is closed by the merging PR.

**Cost.** Low. All four fixes are well-bounded; #1 and #2 are
single-token edits; #3 is the largest, on the order of 15–25 lines
plus tests; #4 is ~10 lines plus a typed error path.

**Risk.** Medium. The fork diverges further from camptocamp/ogc-client
on exactly the surface (`OgcApiEndpoint` discovery layer) where
divergence hurts most. Future upstream sync becomes a four-way
merge each time camptocamp touches `endpoint.ts` or `info.ts`. The
"never propagated" pattern this doc names is reproduced one floor
up: we'd be fixing CSAPI ghost lessons in our walls and not walking
them into the discovery layer of the upstream library.

### COA 3 — File upstream against camptocamp/ogc-client; defer fork patches

**Scope.** Open four separate issues against
`camptocamp/ogc-client`, one per sub-finding, each conforming to
gates 6a–6e (live reproduction, verbatim normative text, alternative
readings, replayable request capture, full response status chain).
Wait for maintainer disposition before patching the fork.

**Cost.** Medium. Each filing requires the full evidence package the
gates demand. #1 is the easiest filing (null-shape responses are
clearly defensive); #2 is the second-easiest (rel allowlist
heterogeneity has multi-server reproduction); #3 is interpretive
(the `featureType`-vs-rel-pattern question is a vocabulary debate
the spec does not resolve cleanly); #4 is the strongest filing
because it has wire-level OSH ghost-resource reproduction
(captured in the OSHConnect-Python cross-repo section above).

**Risk.** Medium-high. The cs-go #9 disposition is the precedent:
AI-authored upstream filings against camptocamp can be rejected as
spec misreads even with full evidence chains, and we have no
domain-skilled human reviewer (see "Accepted risk" above). #3 in
particular admits more than one reading and could land as #9 did.
While the filings are pending, the OSH consumer base remains broken
on the fork too, because we deferred the fork patches.

### COA 4 — Hybrid: patch the fork now, file upstream in parallel, per sub-finding

**Scope.** Disposition each sub-finding independently rather than as
a single block:

| Sub-finding | Fork patch | Upstream filing | Rationale |
|---|---|---|---|
| #188 #1 (null-deref × 6 getters) | **Yes, immediate** | **Yes** — defensive-coding filing | Pure defensive coding; no spec interpretation. Filing is low-risk per gate 6b because there is no normative text to misread. Closed-issue ancestry (#143, #149, finding 003) makes the recurrence claim verifiable. |
| #188 #2 (`collectionsUrl` rel allowlist) | **Yes, immediate** | **Yes** — rel-naming-heterogeneity filing | Issue #186's prefix-match precedent already established that real-server rel naming is heterogeneous. Filing leans on existing OS4CSAPI prior art rather than fresh spec interpretation. |
| #188 #3 (`parseCollections` ignores `featureType`) | **Yes, immediate** as a permissive extension (treat `featureType` as alternative signal, do not remove `ogc-cs:` rel matcher) | **Hold** pending verbatim normative text on featureType-vocabulary scope | This is the interpretive sub-finding. Gate 6b cannot be satisfied without a clean spec quote on whether `featureType` is in-scope as a CSAPI collection signal. Filing held; fork patch ships behind a permissive matcher so the OSH demo works. |
| #188 #4 (`self`-link blind follow) | **Yes, immediate** — post-fetch ID validation with typed error | **Yes, prioritized** — strongest filing | This is the only sub-finding with live wire-level reproduction (OSH ghost-resource bug captured in the OSHConnect-Python sweep). Gate 6a is satisfied uniquely well. File this one first. |

The fork patches land on `phase-9` behind their unit-test fixtures
plus the OSH demo smoke. Upstream filings go out one at a time per
the cs-go process discipline (one claim per filing, no folding-in).
#188 is closed by the merging fork PR, with a comment linking the
upstream filings.

**Cost.** Higher than COA 2 or COA 3 alone, but the cost is
amortized: the evidence captured for the fork patches is the same
evidence the upstream filings need, captured once.

**Risk.** Lowest of the action-taking options. The accepted-risk
posture (live reproduction mandatory, verbatim normative text,
alternative readings, no PRs only issues, separate filings) caps
the blast radius of any one misread to a single closeable upstream
issue. The fork patches are reversible. #188 #3 is held at the
spec-authority gate rather than filed and rejected.

### COA 5 — Treat phase-9 as the propagation pass and refactor the discovery layer

**Scope.** Beyond #188's four points, take the propagation diagnosis
in the Premise section as the main work item: walk every CSAPI
lesson the fork has accumulated (Postel's Law, rel-naming
heterogeneity, featureType vocabulary, self-link authority,
null-shape responses) into the `OgcApiEndpoint` discovery layer
systematically. Produce a triage matrix per the existing Status
section's "next document" plan. Refactor.

**Cost.** High. This is a multi-week effort with API-surface
implications and full regression-test work.

**Risk.** Variable. The work is correct in principle — the doc
above argues the propagation gap is real — but it overshoots #188.
Without a domain-skilled reviewer, the larger the refactor surface,
the larger the blast radius of any single misread. The cs-go #9
precedent suggests "do less, more carefully" is the safer posture.

---

### Recommendation

**Adopt COA 4 (hybrid, per-sub-finding disposition).**

It is the only option that:
- closes #188 with concrete code rather than ceremony;
- satisfies gate 6a uniquely well on sub-finding #4 (the OSH
  ghost-resource live reproduction is already captured);
- holds sub-finding #3 at gate 6b rather than filing it
  speculatively, respecting the cs-go #9 precedent;
- patches the fork *and* files upstream from the same evidence
  package, amortizing the cost across both;
- caps the blast radius per the accepted-risk posture (no PRs
  upstream, one claim per filing, separate filings).

**Suggested execution order, gated by the existing process discipline:**

1. **Triage matrix document** in this folder (the "next document"
   the Status section already names). One row per sub-finding,
   columns: failure class, propagation surface, fork disposition,
   upstream disposition, gate-6 readiness checklist, evidence
   artefact pointer.
2. **Fork patches for #1 and #2** (lowest-interpretive-risk pair,
   smallest diffs). Land behind unit tests + OSH demo smoke.
3. **Upstream filing for #4** (strongest evidence package; ghost-resource
   reproduction already captured; file this one first while the
   evidence is freshest).
4. **Fork patch for #4** (post-fetch ID validation with typed
   error). Land in parallel with the upstream filing — fork does
   not wait on maintainer disposition.
5. **Fork patch for #3** as a *permissive extension only* (treat
   `featureType` as an alternative CSAPI signal; do not remove
   the existing `ogc-cs:` rel matcher). The permissive framing is
   what lets this ship without a clean spec authority block.
6. **Upstream filing for #1, then #2.** Separate filings, gate 6
   compliance each.
7. **Upstream filing for #3 — held** pending verbatim normative
   text on `featureType`-vocabulary scope. Surfaced as a
   `references.md` gap if the source does not exist; not
   self-sourced. Re-evaluated when the spec authority resolves.
8. **Close #188** when steps 2, 4, 5 are merged. Comment on the
   issue with links to the upstream filings (1, 2, 4) and the
   held disposition for #3.

**What this recommendation deliberately does not include:**

- No COA 5 propagation refactor in phase-9. The propagation
  diagnosis stays in this research doc as a Phase 10+ candidate.
  Doing the refactor without a domain-skilled reviewer reproduces
  the cs-go #9 risk pattern at larger scale.
- No PR upstream against `camptocamp/ogc-client`. Standing
  decision from the cs-go workflow: issues only.
- No fold-in of any sub-finding into another's filing. cs-go #9's
  carve-out pattern (the `updatable`/`updateable` spelling defect)
  is the precedent: one claim per filing.
- No re-litigation if any upstream filing is rejected. Per the
  accepted-risk posture, the disposition comment is captured
  verbatim and the filing is not refiled. The fork patch stays.

---

## Status

- Draft — initial framing only.
- Next document in this folder should be a triage matrix mapping each lesson
  to its propagation surface and disposing each as ours / upstream-courtesy /
  upstream-only.
