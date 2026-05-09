# Phase 9 — Initial Research: Discovery-Layer Lesson Propagation

**Date:** 2026-05-09
**Branch:** `phase-9`
**Status:** Draft (initial research, pre-triage)
**Scope:** Account for the failure classes surfaced by external Issue
[#188](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/188) by retelling
each as findings *we* independently made earlier in the project, identifying
where the lesson got fixed, and where it never propagated.

---

## Premise

Every failure class in Issue #188 is a recurrence of a lesson we already
learned and documented. None of these are fresh discoveries. The pattern across
all four sub-issues is consistent:

> Each lesson got fixed at the layer where we first discovered it (CSAPI
> module, formats, URL builder), and never propagated up into the
> `OgcApiEndpoint` discovery layer one floor above.

This document retells each finding from our own perspective and timeline,
without referencing the external reporter's framing, so we can ground Phase 9
work in our own discovery history rather than treating any of this as new.

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

## Synthesis — What our own findings tell us

Across roughly nine months of CSAPI work we independently discovered, named,
fixed, or filed every failure class involved here:

| Failure class | Our prior name(s) for it |
|---|---|
| 6 sibling getters null-deref | F1/F2 + #143 + #149 + finding 003 (null-shape and rel-naming, both classes we know) |
| `collectionsUrl` rel allowlist | F1 — we saw OSH-style rel mismatches in late 2025 and fixed them in our walls |
| `parseCollections` ignores featureType | F40 + F41 + F83 + ROADMAP line 369 — the featureType-vocabulary lesson we learned three times |
| `getCollectionDocument` follows self link blindly | The unstated corollary of #99 / #122 / #179 — self links are server-authored, not authoritative |

The pattern is consistent: **each lesson got fixed at the layer where we
discovered it, and never propagated.** OSH burned us, we patched the specific
call site, we moved to the next phase. The discovery layer of
`OgcApiEndpoint` (collections discovery, getter shape, `parseCollections` rel
matcher, `getCollectionDocument` self-link follow) sits one layer above CSAPI
and got every one of these lessons exactly zero times.

That is not a fresh-eyes problem. That is *"we knew, we fixed it where we
were standing, we did not walk one room over."*

---

## Implications for Phase 9

This document is initial research only. It establishes the diagnostic frame.
What it surfaces, but does not yet decide:

1. **Lesson-propagation pass as a first-class deliverable.** Phase 9 should
   include an explicit pass that, for each lesson we previously fixed in
   CSAPI, audits the upstream-inherited `OgcApiEndpoint` surface for the same
   class and either fixes it (if ours), patches around it (if not), or
   contributes upstream (if camptocamp would accept it).
2. **Maintainer-vs-us boundary, per finding.** Sub-issues 1 (5 of 6 getters),
   2, and 4 sit in upstream camptocamp code. Our governance precedent
   ([docs/code-review/upstream-findings-report.md](../../code-review/upstream-findings-report.md))
   says hands-off. Phase 9 needs to revisit whether that precedent should
   extend to *consumer-facing* failures the upstream maintainer has not
   prioritized. The `csapiCollections` getter and the `info.ts`
   `hasConnectedSystems` rel block are unambiguously ours and are unblocked.
3. **Process gap on cross-server smoke testing.**
   [docs/implementation/cross-server-interoperability-analysis.md](../../implementation/cross-server-interoperability-analysis.md)
   recommendation #8 prescribed every-phase smoke testing on both OSH and
   52°North. Smoke Test inventory shows we did this once (ST#5) and tapered
   off. Re-establishing the discipline is a Phase 9 process task, not a code
   task.
4. **No code changes proposed yet.** This is research. Triage,
   maintainer-vs-us classification per sub-finding, and PR scoping come next.

---

## Status

- Draft — initial framing only.
- Next document in this folder should be a triage matrix mapping each lesson
  to its propagation surface and disposing each as ours / upstream-courtesy /
  upstream-only.
