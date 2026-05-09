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
   vocabulary scope, "self" link authority) need a human-in-the-loop
   review of the spec-authority block before filing.

---

## Implications for Phase 9

This document is initial research only. It establishes the diagnostic frame.
What it surfaces, but does not yet decide:

1. **Lesson-propagation pass as a first-class deliverable.** Phase 9 should
   include an explicit pass that, for each lesson we previously fixed in
   CSAPI, audits the upstream-inherited `OgcApiEndpoint` surface for the same
   class and either fixes it (if ours), files an upstream issue with
   evidence (per the cs-go discipline), or contributes upstream where the
   maintainer signals interest.
2. **Maintainer-vs-us boundary, per finding.** Sub-issues 1 (5 of 6 getters),
   2, and 4 sit in upstream camptocamp code. Our governance precedent
   ([docs/code-review/upstream-findings-report.md](../../code-review/upstream-findings-report.md))
   says hands-off in our PRs. The cs-go workflow gives us a constructive
   alternative — file as a camptocamp issue with full evidence, one at a
   time, never as an unsolicited PR. The `csapiCollections` getter and the
   `info.ts` `hasConnectedSystems` rel block are unambiguously ours and are
   unblocked.
3. **Process gap on cross-server smoke testing — now three-server.**
   [docs/implementation/cross-server-interoperability-analysis.md](../../implementation/cross-server-interoperability-analysis.md)
   recommendation #8 prescribed every-phase smoke testing on OSH +
   52°North. That doc predates cs-go's deployment. The smoke-test pair is
   now a trio (OSH `45.55.99.236`, 52°North, cs-go-upstream
   `129-80-248-53.sslip.io`). Re-establishing the discipline is a Phase 9
   process task, not a code task.
4. **Authoritative-references contract.** Any upstream-filing work in
   Phase 9 must begin by re-reading
   [docs/research/references.md](../references.md) and may only cite
   sources from that list. This is the same contract cs-go research is
   bound by.
5. **Filing gates inherited from cs-go's #9 invalid disposition.**
   Before any Phase 9 finding is filed against camptocamp:
   (a) the wire-level defect must be reproduced against at least one
   live CSAPI server and the request/response captured in the filing;
   (b) any spec-authority section that turns on interpretive language
   (rel-name semantics, featureType vocabulary scope, `self` link
   authority, null-shape conformance) must quote the normative sentence
   verbatim and acknowledge alternative readings before recommending a
   fix; (c) AI-authored filings get a human-in-the-loop review of the
   spec-authority block before filing.
6. **No code changes proposed yet.** This is research. Triage,
   maintainer-vs-us classification per sub-finding, plan/report drafting per
   the cs-go workflow, and PR scoping all come next.

---

## Status

- Draft — initial framing only.
- Next document in this folder should be a triage matrix mapping each lesson
  to its propagation surface and disposing each as ours / upstream-courtesy /
  upstream-only.
