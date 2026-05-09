# Phase 9 — Live Testing Experiment Plan

**Date:** 2026-05-09
**Branch:** `phase-9`
**Status:** Draft (experiment plan; no execution yet)
**Companion document:** [01-discovery-layer-lesson-propagation.md](./01-discovery-layer-lesson-propagation.md)

---

## Why this experiment exists

Issue #188 reports four sub-findings against the OpenSensorHub demo
server. Our companion research document recommends an action plan
(Option 4) that splits the four sub-findings into "fix in our own
code" and "file an awareness issue on the upstream library." That
plan rests on a stack of assumptions that we have not actually
verified end-to-end with our own hands:

1. That the bugs reproduce against OpenSensorHub today, in the same
   shape Issue #188 describes.
2. That the bugs **do not** reproduce against other spec-compliant
   CSAPI servers — i.e. that what we see on OpenSensorHub is
   server-specific implementation behavior, not the spec working
   as designed.
3. That the upstream library function we want to file an awareness
   issue against (`getCollectionDocument`) is the actual cause of
   the broken behavior the user sees, not just a coincident layer.
4. That the data our fix needs to handle (rel names, featureType
   values, response shapes) really looks the way we think it does.
5. That when we do file an upstream awareness issue, our wire-level
   evidence will be reproducible by the maintainer from scratch —
   they can hit the captured request and see what we saw.

This document is the experiment we run to turn each of those five
assumptions into either a verified fact backed by captured evidence,
or a falsified assumption that changes the action plan. We do not
take Issue #188's word for any of it. We do not take the upstream
library's documentation's word for any of it. We do not take our
own previous research's word for any of it. We capture the wire and
read it ourselves.

---

## Hypotheses being tested

Each hypothesis below has a clear pass/fail outcome and a stated
implication for the action plan if it fails.

### Hypothesis 1 — The four sub-findings reproduce on OpenSensorHub

**Statement:** Hitting the OpenSensorHub demo server with the same
calls Issue #188 describes will reproduce all four bugs in the
shape described.

**Pass criterion:** All four bug behaviors observable in captured
request/response pairs against `http://45.55.99.236:8080/sensorhub/api`.

**Fail implication:** If any sub-finding does not reproduce, our
action plan needs revision for that sub-finding before we ship code
or file an issue.

### Hypothesis 2 — The four sub-findings do NOT reproduce on spec-compliant CSAPI servers

**Statement:** The same calls against CSAPI servers other than
OpenSensorHub will return spec-compliant responses that do not
trigger any of the four bugs.

**Pass criterion:** For each sub-finding, at least one other CSAPI
server can be shown to behave correctly (no null `data` rel,
recognized rel name, valid `featureType`, `self` link returning the
correct resource).

**Fail implication:** If a behavior we attributed to "OpenSensorHub
being wrong" turns out to also appear on other servers, that
behavior is probably permitted by the spec, and our upstream
awareness issue framing is wrong. We would either need to drop the
filing or refile it as a real spec interpretation question, not a
bug report.

### Hypothesis 3 — The upstream library functions named in our action plan are the actual surfaces involved

**Statement:** When the OpenSensorHub bugs trigger a client-side
crash or wrong-result, the call stack runs through the upstream
functions we named (`collectionsUrl` for #2, `getCollectionDocument`
for #4) and our CSAPI extensions to upstream functions (the rel
matcher in `parseCollections` for #3) and our six getter functions
(for #1).

**Pass criterion:** Stepwise trace from a live call through the
library code shows the named function is the one that produces the
broken behavior.

**Fail implication:** If the bug is actually somewhere else, we
have to revise both our fixes and our awareness-issue framing.

### Hypothesis 4 — The data shapes our fixes need to handle look the way we think they do

**Statement:**
- For the rel-name allowlist (sub-finding #2): OpenSensorHub uses
  `rel: "collections"`, and a known-good catalogue of rel names
  used by spec-compliant servers can be enumerated.
- For the featureType signal (sub-finding #3): OpenSensorHub
  populates `featureType` with a small, finite vocabulary
  (`"system"`, possibly others) that can be enumerated.
- For the self-link issue (sub-finding #4): the `self` link on
  collection items can in fact resolve to a parent URL, and this
  is observable on the wire.
- For the null-deref (sub-finding #1): the OpenSensorHub landing
  page can in fact be missing the rel link our six getters depend
  on, and this is observable.

**Pass criterion:** Each data shape captured as concrete JSON
fixtures from real responses.

**Fail implication:** If the shapes are different than we thought,
our fix shape changes accordingly.

### Hypothesis 5 — Our captured wire evidence is replayable

**Statement:** A second person, given only our captured request
text (URL, method, headers, body), can re-run the request and see
the same response. The bugs are not transient or
session-state-dependent.

**Pass criterion:** Same captured request run on two different days
from two different machines yields the same broken behavior.

**Fail implication:** If the bug is transient, the evidence is too
weak for an upstream filing under our standing rule that wire
evidence must be replayable. We hold the filing.

---

## Test targets — the server menagerie

To test Hypothesis 2 (that the OpenSensorHub bugs are
implementation-specific, not spec-compliant), we need server
diversity along two axes: **implementation diversity** (different
codebases) and **control diversity** (instances we own versus
public demos run by their projects). The strength of the upstream
awareness issue depends directly on how many spec-compliant
servers we can show *don't* reproduce the bugs, and how cleanly
we can reproduce captures.

### Tier 1 — Servers we already have access to

| Server | Base URL | Who controls it | Implementation | Role in experiment |
|---|---|---|---|---|
| **Our Oracle OSH** | `https://129-80-248-53.sslip.io/sensorhub/api` | **Us** | OpenSensorHub | Self-hosted OSH for controlled bug-diagnosis work and stable replay target. |
| **Our Oracle cs-go** | `https://129-80-248-53.sslip.io/csapi-go-upstream/` | **Us** | cs-go (Go-language reference) | Self-hosted independent implementation; primary control for Hypothesis 2. |
| **Upstream OSH demo** | `http://45.55.99.236:8080/sensorhub/api` | OpenSensorHub project | OpenSensorHub | Where Issue #188 was originally reported. The *subject* of the experiment. Not a control. |
| **52North CSAPI demo** | `https://csa.demo.52north.org/` | 52North | `connected-systems-pygeoapi` | Third independent implementation; second control for Hypothesis 2. Has its own server-side quirks documented (e.g. `featureType: "sosa:Sensor"` for procedures). |

We already have three independent CSAPI implementations
represented (OpenSensorHub, cs-go, `connected-systems-pygeoapi`)
and we control instances of two of them (OSH and cs-go on our
Oracle box). The major gap is that we do **not** yet control a
`connected-systems-pygeoapi` instance — we only have access to
52North's public demo.

### Tier 2 — Self-hosted `connected-systems-pygeoapi` (proposed)

Stand up a clean, latest `connected-systems-pygeoapi` instance on
our Oracle account, point our publishers at it, and load it with
sample data. Source: [52North/connected-systems-pygeoapi](https://github.com/52North/connected-systems-pygeoapi).

This closes the implementation-diversity matrix: we'd have
self-hosted instances of all three CSAPI implementations we know
about, plus the two public demos.

Why this matters for the experiment specifically:
- **Stable replay target for the pygeoapi family.** The 52North
  public demo can change underneath us. Threat #1 in the
  validity section directly. Captures we publish in an upstream
  awareness issue stay reproducible against a server we control.
- **Data-shape control.** We can load both well-formed data and
  deliberately malformed/edge-case fixtures (sparse links,
  missing optional fields, items deleted while `/collections`
  still references them) and observe how each implementation
  reacts. Without that, we only see whatever data each project
  chose to load on their public demo.
- **Cross-implementation diff under identical data.** When all
  three of our self-hosted instances (OSH, cs-go, pygeoapi) have
  the **same publisher data**, any behavioral difference is
  guaranteed to be implementation-driven, not data-driven. This
  is the cleanest possible evidence for Hypothesis 2.
- **Maintainer credibility.** Filing an upstream awareness issue
  with "and here's what three independent self-hosted instances
  of three different CSAPI implementations did against identical
  data" is materially stronger than "we tried it on three public
  demos."

Setup requirements to record:
- Source commit hash of `connected-systems-pygeoapi` deployed.
- Python version, pygeoapi version, dependency lockfile.
- Publisher configuration (what data sources, what mappings).
- Sample data fixtures, version-pinned in our repo.
- Replay readme: how to stand up the same instance from scratch
  and load the same data.

### Tier 3 — Servers we should try to find

Beyond what we have and what we'll stand up, the experiment
strengthens further with additional independent deployments.
Sources to investigate:

- **The OGC Connected Systems Standards Working Group** maintains
  a list of demo servers; check for any we haven't tested.
- **Other deployments of the same codebases by other
  organizations** (different demo data, same software). These
  don't add implementation diversity but do help spot
  data-driven differences within an implementation.
- **Upstream PR #136's own validation list.** Check what servers
  the upstream maintainer has used to validate other contributions;
  those are servers the maintainer already considers credible.
- **Recent OGC Testbed and Code Sprint deployments.** OGC publishes
  these. The May 2026 Code Sprint that @nsnarayanam mentioned in
  Issue #188 may have produced fresh demo URLs.

For each Tier 3 server we find, we record: base URL, implementation
software, deployment owner, and whether it returns a CSAPI
conformance declaration on `/conformance`.

### Tier 4 — Optional: additional self-hosted instances

If we want to deepen evidence further, additional value comes from:

- **A second self-hosted OpenSensorHub instance** at a different
  pinned version, to diff bug behavior across OSH releases (does
  the bug exist in latest? main? a tagged release?). Useful for
  sub-finding #4's awareness-issue framing if we want to claim
  the bug is current rather than historical.
- **A locally-built mock CSAPI server.** A tiny server we write
  that emits one bug per deployment configuration. Useful for
  isolating sub-finding #4 from OSH-specific weirdness — if our
  mock emits a wrong `self` link, we can show the upstream library
  follows it blindly without any OSH-specific complications
  muddying the trace.

Both are optional. Pursue only if the Tier 1 + Tier 2 captures
leave gaps we can't otherwise close.

---

## How we capture evidence (and why this matters)

For the upstream awareness issues to land well, the captured
evidence needs to be reproducible by a stranger. Here's the
discipline:

### Per-request capture format

For every request we make to a real server, we record:

1. **Full request line:** method, URL (including any query string),
   protocol version.
2. **All request headers,** including `Accept`, `User-Agent`, and
   anything else our client sent.
3. **Request body** (if any).
4. **Full response status chain.** Not just the final status code
   — every redirect followed, with each intermediate `Location`
   header. This is critical: a client that thinks it got a 200 OK
   may have actually been silently bounced through a 302 that
   re-validated and rewrote the response. We need to see the whole
   chain.
5. **All response headers,** at every step in the chain.
6. **Response body** (full, not truncated; if binary, captured raw).
7. **Wall clock timestamp** of the request.
8. **Which client made the request** (curl version, fetch from
   browser, fetch from worker, etc.) — different clients handle
   redirects differently, so this matters.

### Tools we use

- **`curl` with `-i -L --trace-ascii`** for the canonical capture.
  The trace file shows the full chain. This is the gold standard.
- **`Invoke-WebRequest -MaximumRedirection` with `-OutFile`** as a
  PowerShell-side equivalent (the existing project documentation
  uses `Invoke-RestMethod`, but that swallows status codes; we
  switch to `Invoke-WebRequest` for capture).
- **The library's own worker/fetch path,** instrumented with
  logging at the request/response boundary. This is what proves
  Hypothesis 3 — that the broken behavior the user sees actually
  flows through the upstream functions we name.
- **Browser DevTools Network panel** for any sanity-check capture
  done from a browser context. Save `.har` files as the archive
  format.

### Where the captures live

A new directory: `docs/research/phase-9/captures/`. Subdirectories
per server:

```
docs/research/phase-9/captures/
├── oracle-osh/                  (our Oracle-hosted OSH)
│   ├── 2026-05-DD-landing-page.txt
│   ├── 2026-05-DD-collections.json
│   ├── 2026-05-DD-collection-self-follow-trace.txt
│   ├── 2026-05-DD-collection-self-follow-response.json
│   └── README.md                (what each file is, and how to replay it)
├── oracle-csgo/                 (our Oracle-hosted cs-go)
│   └── ... same shape ...
├── upstream-osh/                (the OpenSensorHub project's public demo)
│   └── ... same shape ...
├── 52north-demo/                (52North's public pygeoapi demo)
│   └── ... same shape ...
└── oracle-pygeoapi/             (our Oracle-hosted pygeoapi — Tier 2)
    └── ... same shape ...
```

The `README.md` in each subdirectory contains the exact `curl`
command to reproduce each capture. A second person (or a future us)
should be able to copy/paste the command and see the same response.

### Replay verification

Two separate days, two separate machines, two separate network
paths (different ISPs / VPN configs if we have them) for at least
the sub-finding #4 captures, since that one drives the upstream
filing. If a capture differs between the two replays, that's a
finding in itself and the filing waits.

---

## The experiments, sub-finding by sub-finding

Each experiment below is structured as: what we test, on which
servers, what we expect, what we capture, and how we read the
result.

### Experiment 1 — Sub-finding #1: six getters crash on OSH-shaped responses

**What we test:** Whether OpenSensorHub's landing page is in fact
missing the `rel: "data"` link that our six CSAPI getters depend on,
and whether spec-compliant servers do the same or include it.

**Servers:** All Tier 1 servers, plus any Tier 2 we add.

**What we capture:**
- The landing-page response from each server.
- The `links` array, extracted, with each link's `rel`, `href`,
  `type` recorded.

**What we expect:**
- OpenSensorHub: no link with `rel: "data"`.
- 52North: link with `rel: "data"` present (or possibly absent —
  we don't actually know; this is what we're testing).
- cs-go: same.

**How we read the result:**
- If OpenSensorHub indeed omits `rel: "data"` and other servers
  include it, this confirms our fix posture (mirror the existing
  null-guard pattern from `allCollections` to the six CSAPI
  getters).
- If other servers also omit it, that's interesting and changes
  the framing — it would suggest the `rel: "data"` requirement is
  weaker than we assumed, and our fix is even more important.
- If OpenSensorHub does include `rel: "data"` (contradicting Issue
  #188), we go back to Issue #188 and reproduce more carefully.
  Do not proceed until reconciled.

**Spec checks:**
- Read OGC API Common Part 1 (Core) on the `data` link relation.
  Verify whether it is REQUIRED, RECOMMENDED, or OPTIONAL on the
  landing page.
- Read OGC API Common Part 2 (Geospatial Data) for any
  modification of that requirement.
- Record the verbatim normative sentence in the capture readme.

### Experiment 2 — Sub-finding #2: rel-name allowlist for collections discovery

**What we test:** Which rel-name string each server uses to point
from the landing page to its `/collections` endpoint, and whether
the upstream library's allowlist (`'data'`,
`'http://www.opengis.net/def/rel/ogc/1.0/data'`) matches what
real servers actually emit.

**Servers:** All Tier 1, plus Tier 2.

**What we capture:**
- The landing-page response from each server (reuses Experiment 1's
  capture).
- The set of rel names found across all servers.
- For OpenSensorHub specifically: the exact rel name used to point
  to `/collections` (Issue #188 says `"collections"`).
- The upstream library's exact allowlist (read from the source).

**What we expect:**
- A small zoo of rel names: `"data"`, `"collections"`, the OGC
  namespaced URI form, possibly others.
- OpenSensorHub on the `"collections"` end of the spectrum, 52North
  on the `"data"` or namespaced-URI end.

**How we read the result:**
- The wider the rel-name zoo we observe, the stronger the upstream
  awareness issue. The argument changes from "OpenSensorHub uses
  an unusual rel name" to "real-world CSAPI servers use a
  heterogeneous rel-name vocabulary that the current allowlist
  does not accommodate."
- If only OpenSensorHub uses a non-allowlisted rel name and every
  other server uses `"data"`, the awareness issue is weaker but
  still defensible (the argument becomes "the current allowlist
  works for most servers, but a real-world deployment exists where
  it doesn't").

**Spec checks:**
- OGC API Common on rel-name conventions for collection discovery.
  Verify whether `"data"` is the singular spec-prescribed value or
  one of several acceptable values.
- The IANA Link Relations registry — is `"collections"` registered?
  By whom?

### Experiment 3 — Sub-finding #3: featureType vocabulary

**What we test:** What values the `featureType` field actually
takes across collections on each server, whether it is populated
at all, and what the upstream library's CSAPI rel-name matcher
(`^ogc-cs:.+$`) does with each value.

**Servers:** All Tier 1, plus Tier 2.

**What we capture:**
- The `/collections` response from each server (full).
- For each collection in each response, the `featureType` field
  value (or null/missing).
- The set of distinct `featureType` values observed across all
  servers, with which collections use each.

**What we expect:**
- OpenSensorHub: `"system"` per Issue #188, possibly others
  (sampling features, observations, etc.).
- 52North: `"sosa:Sensor"`, `"sosa:Procedure"`, possibly others.
- cs-go: a third vocabulary, possibly using bare CSAPI vocabulary.

**How we read the result:**
- The set of `featureType` values we actually see is the input
  to our fix. If we see {"system", "sosa:Sensor",
  "sosa:Procedure"}, our fix recognizes that set. If we see more,
  we recognize more.
- If `featureType` is null or missing on most collections, the
  field is too unreliable to use as a CSAPI signal and we
  reconsider the fix shape.
- If `featureType` values overlap with non-CSAPI vocabularies in
  ways that cause false positives, we narrow the recognized set.

**Spec checks:**
- OGC API Common Part 2 on `featureType`: required? optional?
  vocabulary constrained?
- The CSAPI specification on `featureType` — what values are
  CSAPI-prescribed?
- The SOSA/SSN ontology — how does `sosa:Sensor` etc. relate to
  CSAPI's `featureType`?

### Experiment 4 — Sub-finding #4: self-link blind follow (THE BIG ONE)

**What we test:** Whether collection-item `self` links on each
server resolve to the actual item resource, or to something else
(parent collection, ghost resource, error page).

**Servers:** All Tier 1 servers, plus the Tier 2 pygeoapi instance
once we stand it up, plus any Tier 3 servers we discover, plus
Tier 4 alternate-version OSH if we add one. Sub-finding #4 is
the centerpiece of this experiment, so we want maximum server
diversity here.

**What we capture:**
- The `/collections` response from each server.
- For a sample of collections in that response: the value of the
  `self` link.
- The result of GET-ing each `self` link, with **full status
  chain** (every redirect, every status code, every Location
  header, the final body).
- Whether the final response body matches the resource we asked
  for (correct ID, correct shape) or is something else.
- Replay the captures on a second day and verify they're stable.

**What we expect (given Issue #188 and the OSHConnect-Python
ghost-resource bug):**
- OpenSensorHub: the `self` link on a collection item resolves to
  the parent `/collections` URL or to a 404, in at least some
  cases. The "ghost resource" pattern — listed in `/collections`
  but 404 on direct fetch — should be reproducible.
- 52North: the `self` link resolves to the actual item, returning
  the correct resource.
- cs-go: same as 52North (correct resolution).

**How we read the result:**
- If OpenSensorHub reproduces the bug and the others don't, this
  is the strongest piece of evidence in the experiment. The
  upstream awareness issue is then framed as: "the upstream
  library follows `self` links blindly, which is a hazard against
  *any* server that emits an incorrect `self` link, of which
  OpenSensorHub is one observed example."
- If multiple servers emit incorrect `self` links, the framing
  shifts: "this is a widespread pattern in real-world CSAPI
  deployments and the library should not assume `self` links are
  authoritative."
- If we cannot reproduce the bug on OpenSensorHub at all, we go
  back to Issue #188 and the OSHConnect-Python ghost-resource
  capture, examine what was different about their environment,
  and decide whether the bug is real, fixed-since-last-seen, or
  conditional.

**Diagnostic depth for this one:**
- Trace the upstream library's code path through
  `getCollectionDocument` and identify the exact line where the
  `self` link is followed without ID validation. Capture the line
  numbers and the function signature.
- Look for any existing validation we might have missed (some
  defensive code may already exist that we didn't see).
- Capture the request/response with full status chain for at
  least three different ghost-resource collections, so the
  pattern is shown to be repeatable, not a one-off fluke.

**Spec checks:**
- OGC API Common on `self` link semantics: is the server obligated
  to make `self` link to the actual resource? What does the spec
  say about clients trusting `self` versus re-validating the ID?
- This is the gate where our action plan currently parks the
  interpretive sub-finding #3 question. For sub-finding #4, the
  spec text is more clearly in our favor — but we still need to
  capture the verbatim sentence so the awareness issue can quote
  it.

### Experiment 5 — Cross-cutting: full call-stack trace through the upstream library

**What we test:** Hypothesis 3 — that when the OpenSensorHub bugs
trigger broken client behavior, the call stack runs through the
upstream functions we named.

**Servers:** OpenSensorHub demo, since that's where the bugs
trigger.

**What we capture:**
- A working build of the library with logging instrumentation at
  every function entry/exit in `endpoint.ts` and `info.ts`.
- A run of `createCSAPIBuilder('weather-stations')` against the
  OpenSensorHub demo, with the log captured.
- The exact line numbers reached at each crash point.

**What we expect:**
- The crash for sub-finding #1 lands inside one of the six getter
  functions in `endpoint.ts`.
- The wrong-rel-name behavior for sub-finding #2 lands inside
  `collectionsUrl` at the allowlist check.
- The featureType-not-recognized behavior for sub-finding #3 lands
  inside `parseCollections` at the rel matcher.
- The wrong-resource-returned behavior for sub-finding #4 lands
  inside `getCollectionDocument` at the `self` link follow.

**How we read the result:**
- If the trace confirms each function, we proceed with the
  current action plan.
- If a trace lands somewhere else, we fix the action plan to name
  the actual surface, not the assumed one.

### Experiment 6 — Cross-cutting: replay verification

**What we test:** Hypothesis 5 — captures are stable across time
and machine.

**Servers:** All servers we hold captures for, with priority on
sub-finding #4 captures.

**What we capture:** The same set of captures, on a second
calendar day, ideally from a different machine.

**How we read the result:**
- Captures stable across replays: evidence is solid, awareness
  issues can be filed.
- Captures unstable: investigate why, and only file when stable.

### Experiment 7 — Cross-cutting: spec-text harvest

**What we test:** What the relevant specification documents
actually say, verbatim, on each of the four sub-findings.

**Sources (consult the project's `docs/research/references.md`
first):**
- OGC API - Features Part 1: Core
- OGC API - Common Part 1: Core
- OGC API - Common Part 2: Geospatial Data
- OGC API - Connected Systems Part 1
- OGC API - Connected Systems Part 2
- IANA Link Relations registry
- SOSA/SSN ontology

**What we capture:** A `docs/research/phase-9/spec-citations.md`
document that, for each sub-finding, contains:
- The exact sentence from the relevant spec, copy-pasted verbatim,
  with section/page reference and document version.
- A statement of how that sentence supports or qualifies our
  awareness-issue framing.
- An honest acknowledgement of any alternative reading the
  sentence admits.

If any source we want to cite is not in `references.md`, that gap
is surfaced — we do not self-source from sources outside the
established reference list.

---

## Decision criteria — what each outcome means for our action plan

| Result | Implication for Option 4 |
|---|---|
| All five hypotheses confirmed | Proceed with Option 4 as written, with strong evidence for all four sub-findings. |
| Hypothesis 1 fails for any sub-finding | That sub-finding's plan is paused until we understand why we couldn't reproduce. Other sub-findings proceed. |
| Hypothesis 2 fails (other servers reproduce too) for sub-finding #1 or #3 | Probably no change — these are fixes to our own code regardless. The upstream awareness framing for them was never the plan, so there's nothing to retract. |
| Hypothesis 2 fails for sub-finding #2 or #4 | Major change. The upstream awareness issue cannot frame the behavior as "OpenSensorHub-specific." It would have to be reframed as a spec interpretation question, which under our standing rules we hold rather than file. The sub-finding becomes a held interpretive issue. |
| Hypothesis 3 fails | We retrace the bug to its actual surface and update the action plan accordingly. |
| Hypothesis 4 fails | The fix shape changes to match what we actually observed. |
| Hypothesis 5 fails (captures unstable) | Hold the affected upstream awareness issue until we can produce a stable capture. |

This table is the **decision-making backbone of the experiment**.
Whatever we observe, we already know what it means before we run
the experiment. That keeps us from rationalizing surprising
results.

---

## Threats to validity

These are the ways we could deceive ourselves. Each one needs an
explicit guard.

1. **The OpenSensorHub demo server changes underneath us.** It is
   someone else's machine. If they update it during the experiment,
   captures from before and after the update may not match. *Guard:*
   record the server's reported version (most CSAPI servers expose
   build info in landing-page metadata), and re-capture if it
   changes.

2. **We test only one OpenSensorHub deployment and assume it
   represents OpenSensorHub-the-software.** A single broken demo
   may not represent the codebase. *Guard:* ideally test against a
   second OpenSensorHub deployment if any can be found, OR stand up
   a local OpenSensorHub instance and test against that too. Note
   the version commit hash so we know what we tested against.

3. **The "spec-compliant servers" we use as controls may be
   non-compliant in different ways.** A server can be wrong without
   being wrong-in-the-same-way. *Guard:* before treating a server
   as a "spec-compliant control," verify its `/conformance`
   declares the relevant CSAPI conformance classes. A server that
   doesn't declare conformance is not a control.

4. **Our capture tooling may itself transform the data.** `curl`
   and `Invoke-RestMethod` and `fetch` all do things to redirects,
   character encodings, and JSON parsing. *Guard:* run the
   sub-finding #4 capture with at least two independent tools
   (`curl` and the library's own fetch path) and verify they show
   the same thing.

5. **We may unconsciously bias toward results that confirm Issue
   #188.** *Guard:* the decision criteria table above is committed
   before we run the experiment. Any pivot from it is a deliberate,
   documented decision, not an after-the-fact rationalization.

6. **The upstream library has changed since Issue #188 was filed
   (against the `phase-7` branch).** Our tests run against current
   code, which may have moved. *Guard:* capture the line numbers
   and function signatures fresh; do not trust Issue #188's line
   numbers without re-verification.

7. **Network conditions might mask intermittent server bugs.** A
   ghost-resource bug that only happens under load won't reproduce
   from a single quiet capture. *Guard:* take captures at different
   times of day, on different days, and note any variation.

8. **Our own client code (the worker/fetch path) might mask or
   transform server behavior.** The browser/worker layer does
   things on its own. *Guard:* always have a `curl` capture as the
   ground truth and compare the library's behavior to it.

---

## What we produce — output artifacts

By the time the experiment is complete, the following exist in the
repository:

1. **`docs/research/phase-9/captures/`** — the directory of
   server-by-server raw captures, with replay readmes.
2. **`docs/research/phase-9/spec-citations.md`** — the verbatim
   spec-text harvest from Experiment 7.
3. **`docs/research/phase-9/03-experiment-results.md`** — the
   results document, structured against the same hypothesis list
   above. Per hypothesis: result (confirmed / falsified / partial),
   evidence pointer (which capture file), implication for the
   action plan.
4. **`docs/research/phase-9/04-revised-action-plan.md`** — only
   created if the experiment results require revisions to Option 4.
   If they don't, this file is not created and the original plan
   stands as written.
5. **Updates to the existing `docs/governance/known-server-quirks.md`
   document** — any new server-quirk findings join the existing
   inventory.

---

## Resources we need

Listed honestly so the scope is visible up front.

### Tools and libraries
- `curl` (already on the system).
- PowerShell `Invoke-WebRequest` (already on the system).
- A browser with DevTools for `.har` capture (already on the
  system).
- Node.js to run the upstream library's own fetch path
  (already on the system).
- Optionally: Wireshark or `mitmproxy` if we need packet-level
  inspection for sub-finding #4.

### Server access
- Admin/SSH access to our Oracle box hosting OSH at
  `https://129-80-248-53.sslip.io/sensorhub/api` and cs-go at
  `https://129-80-248-53.sslip.io/csapi-go-upstream/`. We control
  these; we can pin versions, capture from inside the box, and
  load whatever data we want.
- Network reachability to the upstream OpenSensorHub project's
  public demo (`http://45.55.99.236:8080/sensorhub/api`) — note
  the `http`, not `https`, which is itself worth recording.
- Network reachability to 52North's public demo
  (`https://csa.demo.52north.org/`).
- For Tier 2: Oracle account capacity to stand up a fresh
  `connected-systems-pygeoapi` instance, plus a CSAPI
  conformance-class-aware publisher configuration and the sample
  data we want loaded.
- For Tier 4 (optional): additional Oracle capacity for
  alternate-version OSH or local mock server.

### Specifications
- All documents listed in `docs/research/references.md`.
- Verify each is currently accessible before starting Experiment 7.
- Any source needed but absent from `references.md` is a gap to
  surface, not a free-form lookup.

### Time budget
- Experiments 1, 2, 3 (data shape captures, all servers): roughly
  one focused session each, three sessions total.
- Experiment 4 (the big one, sub-finding #4): roughly one to two
  focused sessions for initial captures, plus a second day for
  replay verification.
- Experiment 5 (call-stack trace): roughly one session, dependent
  on the library's existing build/test setup being workable.
- Experiment 6 (replay verification): a second day, lighter
  effort.
- Experiment 7 (spec harvest): one focused reading session,
  possibly two.
- Results write-up and decision: one final session.

This adds up to roughly two working weeks at a normal pace, less
if compressed, more if unexpected weirdness shows up (and it will).

### What we explicitly don't need
- We do not need credentials for any of these servers. They are
  all public demos.
- We do not need to write any code that ships in pull request #136
  during this experiment. This is research; the fixes come after.
- We do not need to run any test against authenticated, private,
  or production endpoints.

---

## Order of execution

A suggested order, with the reasoning:

1. **Stand up the capture infrastructure first** — directory
   layout, capture script templates, replay-readme template. No
   real captures yet. This is half a session; it removes friction
   from every subsequent step.

2. **Experiment 1, 2, 3 in parallel against all Tier 1 servers.**
   These three share a single `/collections` capture per server,
   so doing them together is efficient. One session per server,
   three servers, possibly one combined session if the captures
   go quickly.

3. **Experiment 7 (spec harvest)** — done early, while the
   captures are fresh. The verbatim spec text shapes how we
   interpret the captures.

4. **Stand up the Tier 2 pygeoapi instance.** Can run in parallel
   with Experiment 1–3 captures from the existing servers. Once
   live, add it to the captures matrix and re-run Experiments 1–3
   against it.

5. **Tier 3 server discovery.** While doing Experiments 1–3, also
   look for additional public servers. Add any we find.

6. **Experiment 4 (sub-finding #4) — the big one.** Done after
   Experiments 1–3 because we have the lay of the land at that
   point and know what to look for. Two sessions: initial
   captures, then replay-verification on a different day. Our
   Oracle OSH instance is the primary diagnostic surface here
   since we control it and can vary conditions; the upstream OSH
   demo is the validation surface that the bug exists in the wild.

7. **Experiment 5 (call-stack trace)** — done last because it
   requires the library's logging instrumentation, which is the
   most setup-heavy piece.

8. **Tier 4 alternate-version instances or mock server** — only if
   Experiment 4 results suggest we need it. Optional.

9. **Results document and decision** — once all data is in.
   Compare against the decision criteria table; produce the
   results document; revise the action plan if required.

---

## Status

- Draft. Not yet executed.
- Companion to [01-discovery-layer-lesson-propagation.md](./01-discovery-layer-lesson-propagation.md).
- Next document in this folder will be `03-experiment-results.md`,
  written after the experiments complete.
