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
   unblocked.
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
6. **Filing gates inherited from cs-go's #9 invalid disposition.**
   Before any Phase 9 finding is filed against camptocamp:
   (a) the wire-level defect must be reproduced against at least one
   live CSAPI server and the request/response captured in the filing;
   (b) any spec-authority section that turns on interpretive language
   (rel-name semantics, featureType vocabulary scope, `self` link
   authority, null-shape conformance) must quote the normative sentence
   verbatim and acknowledge alternative readings before recommending a
   fix; (c) AI-authored filings must self-review the spec-authority
   block against the verbatim normative text before filing — see
   "Accepted risk" below for why the cs-go human-reviewer step is not
   available on this effort.

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

## Status

- Draft — initial framing only.
- Next document in this folder should be a triage matrix mapping each lesson
  to its propagation surface and disposing each as ours / upstream-courtesy /
  upstream-only.
