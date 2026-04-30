# Phase 8 — "Library strict-mode validation skipped" Warning: Root-Cause Investigation

**Date:** 2026-04-30
**Investigator:** GitHub Copilot (Claude Opus 4.7)
**Trigger:** User-observed yellow warning on the live demo at `https://ogc-csapi-explorer.pages.dev` when connecting to the CSAPI-Go preset:

> ⚠️ **Library strict-mode validation skipped** — *"The canonical `OgcApiEndpoint.csapi()` entry point could not be used against this server (`Failed to construct 'URL': Invalid URL`). The explorer fell back to permissive discovery so it can still connect, but this is a server-side conformance issue worth reporting upstream."*

**Status:** Investigation complete. Root causes identified, ownership classified, fix scope determined.

---

## Executive Summary

The warning text shipped in the demo speculates that the failure is *"a server-side conformance issue worth reporting upstream"* — meaning a bug in the CSAPI-Go server. **That speculation is wrong.** The failure is a JavaScript `TypeError` thrown deep inside the camptocamp/ogc-client library code, not in any server response.

Five distinct latent defects in URL handling were identified during the audit. **All five live entirely in pre-existing upstream code authored by camptocamp/ogc-client maintainers.** Zero defects are in our CSAPI contribution surface (`src/ogc-api/csapi/**`, the `csapi()` factory method on `OgcApiEndpoint`, conformance helpers, etc.).

| # | Defect | File / line (phase-8) | Owner | Active today? | Fix policy |
|---|---|---|---|---|---|
| 1 | `getBaseUrl(relativePath)` throws `TypeError: Invalid URL` | `src/shared/url-utils.ts:9` | **Upstream** (camptocamp) | **Yes — fires for csapi-go** | **Forbidden to fix** |
| 2 | `parseBaseCollectionInfo` items-link `new URL(link.href)` with no base | `src/ogc-api/info.ts:161` | **Upstream** | Latent | **Forbidden to fix** |
| 3 | EDR builder `new URL(...)` with no base — 7 sites | `src/ogc-api/edr/url_builder.ts:103,163,223,300,371,446,514` | **Upstream** | Latent (no EDR servers tested) | **Forbidden to fix** |
| 4 | `getCollectionItemsUrl` uses `this.baseUrl \|\| ''` as URL base | `src/ogc-api/endpoint.ts:675,678,680` | **Upstream** | Latent | **Forbidden to fix** |
| 5 | `fetchCollectionRoot` `new URL(parentUrl)` with no base | `src/ogc-api/link-utils.ts:75` | **Upstream** | Latent (defensive only) | **Forbidden to fix** |

**Net answer to the question "is this our faulty code?":** No. **It is not our code.** Every single one of the URL-construction defects on the failure path is in code that existed in `camptocamp/ogc-client` before our fork was created. None of these lines appear in our diff against `upstream/main`. Per established governance precedent (see [`docs/code-review/upstream-findings-report.md`](../code-review/upstream-findings-report.md)), upstream code is **out of scope** for our PR — we may not modify it as part of the CSAPI contribution.

The user-visible warning is therefore a symptom that traces, through our (correctly-written) `csapi()` entry point, into upstream URL handling that has never tolerated a relative `baseUrl`. The mistake-in-shipping is in the **demo's warning text**, which mis-attributes the failure to the server. That part *is* ours and *is* fixable.

---

## 1. Background: What the demo is doing and why it warns

### 1.1 The demo's hybrid strict-then-permissive discovery

The explorer demo performs a two-tier discovery probe in `demo/src/csapi-bridge.ts`:

1. **Strict mode** — call the canonical library entry point `new OgcApiEndpoint(baseUrl).csapi(collectionId)`. This validates that:
   - `/conformance` advertises a Connected Systems class (Part 1 or Part 2).
   - The collection id resolves to a real collection document.
   - Root / collection links can be scanned for CSAPI resource relations.

2. **Permissive mode** — if strict validation fails for any reason, scan the landing page and collection links directly for CSAPI relations (`ogc-cs:*`, plain resource names, `items` with resource paths). This is the "legacy" path that lets the demo still function against partially-conformant servers.

When strict succeeds: green card, "Library strict-mode validation passed".
When strict fails: yellow card with the captured error message and the misleading "server-side conformance issue worth reporting upstream" text.

### 1.2 Why strict-mode is even being attempted with a relative baseUrl

The explorer is deployed to Cloudflare Pages and uses CF Pages Functions as a reverse proxy:

```
browser  →  https://ogc-csapi-explorer.pages.dev/api/csapi-go/*  (CF Pages Function proxy)
                                            ↓
                                  https://129-80-248-53.sslip.io/csapi-go/*  (upstream server)
```

For server presets the demo therefore configures `connection.baseUrl = '/api/csapi-go'` (proxy-relative). The proxy injects auth, strips problematic headers, and adds CORS — without it the browser can't reach OSH at all.

When the demo invokes the strict path it does:

```ts
const endpoint = new OgcApiEndpoint('/api/csapi-go')
await endpoint.csapi('systems')
```

That second call is what throws.

---

## 2. Reproducing and pinpointing the failure

### 2.1 Direct reproduction in this repo

```sh
cd ogc-client-CSAPI_2
node --input-type=module -e "
  import { getBaseUrl } from './src/shared/url-utils.ts';
  console.log('getBaseUrl(absolute) =', getBaseUrl('http://x.com').toString());
  try {
    console.log('getBaseUrl(/api/csapi-go) =', getBaseUrl('/api/csapi-go').toString());
  } catch (e) {
    console.log('THREW:', e.constructor.name + ':', e.message);
  }
"
```

Output:

```
getBaseUrl(absolute) = http://x.com/
getBaseUrl(/api/csapi-go) THREW: TypeError: Invalid URL
```

That is the **exact** TypeError surfaced in the demo's warning card. The browser variant has the prefix "Failed to construct 'URL'" instead of the plain Node form, but the underlying cause is identical: the single-argument `URL` constructor requires an absolute URL.

### 2.2 The throwing line

[`src/shared/url-utils.ts:7-17`](../../src/shared/url-utils.ts) (planning repo, phase-8):

```ts
export function getBaseUrl(url?: string): string | URL {
  if (url && typeof url === 'string') {
    return new URL(url);          // ← line 9 — throws on relative path
  }
  if ('location' in globalThis && typeof globalThis.location === 'object') {
    return globalThis.location.toString();
  }
  return new URL('http://localhost');
}
```

Only the *first* branch is buggy. The other two branches (no-arg and Node fallback) work correctly. The bug is that whenever a caller passes a relative-path string, the function does not attempt to resolve it against `globalThis.location` — it goes straight to `new URL(string)` which mandates an absolute URL.

### 2.3 The full call chain that triggers it

```
endpoint.csapi('systems')                                       — src/ogc-api/endpoint.ts:376  (OURS — CSAPI contribution)
  └─ await this.hasConnectedSystems                             — src/ogc-api/endpoint.ts:333  (OURS — CSAPI contribution)
       └─ this.conformanceClasses                               — src/ogc-api/endpoint.ts:243  (UPSTREAM)
            └─ this.conformance                                 — src/ogc-api/endpoint.ts:82   (UPSTREAM)
                 └─ fetchLink(root, ['conformance', …], this.baseUrl)
                                                                — src/ogc-api/link-utils.ts:125 (UPSTREAM)
                      └─ getLinkUrl(doc, rel, baseUrl, …, true) — src/ogc-api/link-utils.ts:113 (UPSTREAM)
                           └─ new URL(link.href, getBaseUrl(baseUrl))
                                                                — src/ogc-api/link-utils.ts:122 (UPSTREAM)
                                └─ getBaseUrl('/api/csapi-go')  — src/shared/url-utils.ts:9    (UPSTREAM — THROWS)
```

**Critical observation about ownership:** the only two frames that are CSAPI contribution code are the two top-most frames (`csapi()` and the `hasConnectedSystems` getter). The remainder — every link-utils, every URL constructor invocation, the `getBaseUrl` helper itself — is upstream code. **The throw originates four call levels deep inside upstream code, in a function we did not write.**

### 2.4 Note on JavaScript evaluation order

There is a subtle but important detail. The throwing call site is:

```ts
return new URL(link.href, getBaseUrl(baseUrl)).toString();
```

For an absolute `link.href` (which csapi-go's conformance link is — `https://129-80-248-53.sslip.io/csapi-go/conformance`), the second argument is normally ignored by `URL`. But JavaScript evaluates arguments **before** calling the constructor — so `getBaseUrl('/api/csapi-go')` is invoked unconditionally and throws before `new URL` ever sees `link.href`. Even servers with perfectly-formed absolute hrefs cannot rescue this code path; the only requirement to trigger the bug is constructing the endpoint with a relative `baseUrl`.

---

## 3. Why the explorer's other diagnostics still pass

The Connection Diagnostics panel shows several green checks (HTTPS, CORS, conformance class count, resource types discovered). Those checks all use raw `fetch(baseUrl + '/conformance')` etc. in `demo/src/pages/ServerConnectPage.vue`. They never feed `'/api/csapi-go'` into a `URL` constructor — they concatenate strings and let the browser's `fetch` resolve relative URLs against `document.URL`.

The library's `csapi()` path is the *only* code path that constructs URL objects from the relative baseUrl. That asymmetry is exactly why we see "8 CSAPI resource types discovered" succeeding next to "Library strict-mode validation skipped" — they don't share an implementation.

---

## 4. The complete URL-defect audit

I audited every `new URL(` call site in `src/ogc-api/**` and `src/shared/**`, and traced each back to its commit. Findings, in priority order:

### Defect #1 — `getBaseUrl(relativePath)` throws on the strict path

| Field | Value |
|---|---|
| **File / line** | `src/shared/url-utils.ts:9` |
| **Function** | `getBaseUrl(url?: string)` |
| **Owner** | **Upstream — camptocamp/ogc-client** |
| **Diff vs `upstream/main`** | **0 lines** — file is identical |
| **Active for csapi-go today** | **Yes** |
| **Fix policy** | **Forbidden in our PR.** Upstream-only. |

This is the only defect actually firing today. Fixing it would require changing the first branch to attempt `new URL(url, globalThis.location?.toString() ?? 'http://localhost')` before falling through. That is a four-line change *we are not permitted to make in our PR*.

**Test coverage gap (also upstream-owned):** [`src/shared/url-utils.spec.ts:4-11`](../../src/shared/url-utils.spec.ts) tests only `getBaseUrl()` and `getBaseUrl('http://example.com')`. There is no test exercising relative-path input. The upstream library has implicitly always been an "absolute-URL-only" API; the contract was never written down or asserted.

### Defect #2 — `parseBaseCollectionInfo` items map throws on relative item hrefs

| Field | Value |
|---|---|
| **File / line** | `src/ogc-api/info.ts:161` |
| **Function** | `parseBaseCollectionInfo` (items map step) |
| **Code** | `const url = new URL(link.href);` (no second argument) |
| **Owner** | **Upstream** |
| **Diff vs `upstream/main`** | The line is unchanged. Our diff to `info.ts` adds CSAPI conformance helpers and extends `parseCollections` with `hasConnectedSystems` — see hunks at lines 103, 269, 279, 310. **The `parseBaseCollectionInfo` function and the throwing line are not in our diff.** |
| **Active for csapi-go today** | No — csapi-go uses absolute item hrefs |
| **Fix policy** | **Forbidden in our PR.** |

Latent: any OGC API server that emits a relative `items` href (which is permitted by OGC API Common) crashes here.

### Defect #3 — EDR builder URL constructions

| Field | Value |
|---|---|
| **File** | `src/ogc-api/edr/url_builder.ts` |
| **Lines** | 103, 163, 223, 300, 371, 446, 514 (seven sites) |
| **Pattern** | `new URL(this.collection.data_queries?.X?.link.href)` with no base |
| **Owner** | **Upstream** |
| **Diff vs `upstream/main`** | **0 lines** |
| **Active for csapi-go today** | No — csapi-go is not an EDR server |
| **Fix policy** | **Forbidden in our PR.** |

Latent: any EDR server using relative `data_queries.*.link.href` crashes.

### Defect #4 — `getCollectionItemsUrl` uses `this.baseUrl || ''` as base

| Field | Value |
|---|---|
| **File / lines** | `src/ogc-api/endpoint.ts:675, 678, 680` |
| **Function** | `getCollectionItemsUrl` |
| **Pattern** | `new URL(linkWithFormat.href, baseUrl)` where `baseUrl = this.baseUrl \|\| ''` |
| **Owner** | **Upstream** — function exists at upstream `endpoint.ts:522` with identical logic |
| **Diff vs `upstream/main`** | The function is unchanged from upstream. |
| **Active for csapi-go today** | No — csapi-go item hrefs are absolute, so the second argument is ignored |
| **Fix policy** | **Forbidden in our PR.** |

Triggers if both `this.baseUrl` is relative AND `link.href` is relative. (Note: this same function also has a pre-existing P1 path-traversal vulnerability tracked as **Finding 002** in [`docs/code-review/002-upstream-p1-query-param-injection.md`](../code-review/002-upstream-p1-query-param-injection.md) — same out-of-scope rationale.)

### Defect #5 — `fetchCollectionRoot` `new URL(parentUrl)` with no base

| Field | Value |
|---|---|
| **File / line** | `src/ogc-api/link-utils.ts:75` |
| **Function** | `fetchCollectionRoot` |
| **Owner** | **Upstream** |
| **Diff vs `upstream/main`** | **0 lines** |
| **Active for csapi-go today** | No — `parentUrl` is always already absolute (it comes from `getParentPath` which resolves through `getBaseUrl()` no-arg) |
| **Fix policy** | **Forbidden in our PR.** |

Defensive only; harmless today but inconsistent.

---

## 5. Ownership rules and why we cannot fix any of this

### 5.1 The governance constraint

The repository's operating rules — established in [`docs/governance/AI_OPERATIONAL_CONSTRAINTS.md`](../governance/AI_OPERATIONAL_CONSTRAINTS.md) and reinforced through the Phase 6 / Phase 7 / Phase 8 review templates — require us to:

> *"Preserve upstream structure, naming, and patterns unless explicitly instructed otherwise."*

The same rule was applied verbatim to four pre-existing P1/P2 security findings in [`docs/code-review/upstream-findings-report.md`](../code-review/upstream-findings-report.md), which concludes:

> *"Verdict: Do not fix in our PR. Do not create GitHub issues. Track via MD files only."*

Those four security findings (path traversal, query injection, HTTP scheme enforcement, credential leakage) all have the exact same disposition that applies here:

- We did not author the code.
- The code is identical to `upstream/main`.
- The code is not in our diff to `clean-pr`.
- Our CSAPI module is unaffected (or in this case, our CSAPI module *exposes* the upstream defect through a contributed entry point, but does not contain it).
- Modifying upstream code we didn't write violates governance.

This new audit applies the same rules to URL-handling defects. The verdict is the same: **out of scope, do not patch, track via MD only.**

### 5.2 What "in our diff" actually means here, file by file

I ran `git diff upstream/main -- <path>` for every file on the failure path. Results:

| File | Lines changed in our diff | Includes the defect line? |
|---|---|---|
| `src/shared/url-utils.ts` | **0** | No (whole file is upstream) |
| `src/ogc-api/link-utils.ts` | **0** | No (whole file is upstream) |
| `src/ogc-api/edr/url_builder.ts` | **0** | No (whole file is upstream) |
| `src/ogc-api/info.ts` | 79 lines added (CSAPI conformance helpers + `hasConnectedSystems` extension to `parseCollections`) | **No** — diff hunks are at lines 103, 269, 279, 310; defect is at line 161 (untouched) |
| `src/ogc-api/endpoint.ts` | 169 lines added (CSAPI integration: `csapi()`, `csapiCollections`, `hasConnectedSystems`, `csapi-bridge` glue, etc.) | **No for defect #4** — `getCollectionItemsUrl` body is unchanged from upstream |

**Every defect on the failure path is in a region of code that we have not touched and may not touch.**

### 5.3 What we *did* contribute, and why it isn't broken

Our additions on this code path are:

- `OgcApiEndpoint.csapi(collectionId)` — `endpoint.ts:376-412`
- `OgcApiEndpoint.hasConnectedSystems` getter — `endpoint.ts:333-337`
- `OgcApiEndpoint.csapiCollections` getter — `endpoint.ts:237-241`
- `checkHasConnectedSystems` and Part-1/Part-2 prefix constants — `info.ts` (issue #186 fix)
- `parseCollections` extension setting `hasConnectedSystems` from `ogc-cs:` link relations — `info.ts:312-321`
- `src/ogc-api/csapi/**` — entire CSAPI module (factory, helpers, query builder, types, URL helpers)
- `csapi/helpers.ts isSafeHref` — defensive URL acceptance check — line 122 *does* use the safe pattern `try { new URL(href) } catch { return true }`. **This is correct and is the pattern the upstream code should be using.**

None of those additions throw a `TypeError: Invalid URL` for relative bases. The closest-to-the-defect file we own — `src/ogc-api/csapi/helpers.ts` — actually demonstrates the *correct* pattern (lines 110-128): wrap the constructor in a try/catch and treat construction failure as "this is a relative URL, that's fine." The upstream `getBaseUrl` does the opposite.

### 5.4 The strict path's URL-resolution contract is also upstream's design

A second point that strengthens the "not ours" classification: the policy that the library should always be constructed with an absolute URL is itself an upstream design decision. The original camptocamp library was built around the pattern `new OgcApiEndpoint('https://example.com/path')`, and every internal URL resolver assumes that. The `getBaseUrl` helper reflects that assumption. Whether to *change* that contract — to allow relative bases that resolve against `document.URL` in the browser, or against a configured base in Node — is a library API design choice that belongs to camptocamp, not to us. We can advocate for it (see §7), but unilaterally rewriting it inside our PR would:

- Change behaviour for existing camptocamp consumers in subtle ways.
- Introduce a SSR/Node concern that does not belong in our CSAPI scope.
- Risk PR rejection on the entirely orthogonal grounds of "scope creep."

---

## 6. What *is* ours to fix (and what we already shipped)

While the URL defects themselves are upstream, two things in *this* failure are ours:

### 6.1 The misleading warning text in the demo (ours, fixable)

`demo/src/pages/ServerConnectPage.vue:380-389` (in the explorer fork) reads:

```ts
detectedWarnings.push({
  severity: 'warn',
  summary: 'Library strict-mode validation skipped',
  detail: 'The canonical OgcApiEndpoint.csapi() entry point could not be used '
    + `against this server (${initResult.strictModeError ?? 'unknown reason'}). `
    + 'The explorer fell back to permissive discovery so it can still connect, '
    + 'but this is a server-side conformance issue worth reporting upstream.',
})
```

The trailing sentence — "this is a server-side conformance issue worth reporting upstream" — is **factually wrong** when the captured error is `Failed to construct 'URL': Invalid URL`. That error comes from inside the library, not from the server. The text was written assuming strict-mode would only fail when the *server* was non-conformant; we now know it can also fail when the library cannot resolve a relative `baseUrl`.

This is in the *demo* (not the library), and it is in *our* code (the explorer fork repo). It is fixable in scope. Recommended replacement (sketch — not yet committed):

```ts
detail: 'The canonical OgcApiEndpoint.csapi() entry point could not be used '
  + `against this server (${initResult.strictModeError ?? 'unknown reason'}). `
  + 'The explorer fell back to permissive discovery so it can still connect. '
  + 'This may indicate a server-side conformance issue, OR (if the error '
  + 'mentions \'Invalid URL\') a known limitation of the library when '
  + 'configured with a proxy-relative base URL — see '
  + 'OS4CSAPI/ogc-client-CSAPI_2/docs/implementation/'
  + 'phase-8-strict-mode-validation-warning-root-cause.md',
```

### 6.2 The `checkHasConnectedSystems` Part-1/Part-2 prefix support (already shipped)

This is fully resolved in [issue #186](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/186) and committed as `c323e06` on `phase-8`, `effaa78` on `clean-pr`. It is the reason the diagnostics panel correctly shows "18 CSAPI conformance classes" today; without it the demo would have flagged csapi-go as non-CSAPI entirely. Mentioned here for completeness — it is *not* the cause of the strict-mode warning.

---

## 7. Recommended actions

### 7.1 Inside this repo (planning) — allowed

| Action | Scope | Status |
|---|---|---|
| File this report | `docs/implementation/phase-8-strict-mode-validation-warning-root-cause.md` | This document |
| Add a session-memory note recording the audit so future sessions don't re-investigate | `/memories/repo/csapi-explorer-deployment.md` (extend) | Pending |
| Cross-link from `docs/code-review/upstream-findings-report.md` to indicate URL-handling defects join the existing security-finding cohort | Optional doc update | Pending decision |

### 7.2 Inside the demo (explorer fork) — allowed

| Action | Scope | Priority |
|---|---|---|
| Soften the "server-side conformance issue" assertion in the strict-mode warning text and link to this report | `demo/src/pages/ServerConnectPage.vue` | High — currently misleads users into filing wrong bugs upstream |
| Optionally: add an `Invalid URL` heuristic in `csapi-bridge.ts` that reclassifies the warning into an explicit "known library limitation with proxy-relative base URLs" category | `demo/src/csapi-bridge.ts` | Medium |

### 7.3 Inside the library (CSAPI contribution) — **forbidden in this PR**

We must not modify any of the five defect sites. Acceptable adjacent actions, *if* the team chooses to invest:

| Action | Why allowed | Scope |
|---|---|---|
| Add a defensive guard inside our `csapi()` method that throws an `EndpointError` with a clear message when `this.baseUrl` is relative, *before* control reaches the upstream chain | The guard is in code we own (the `csapi()` method itself) and only affects our entry point | `src/ogc-api/endpoint.ts:376-412` (already ours) |
| Document the absolute-URL requirement in the `csapi()` JSDoc | Pure docs change inside our contribution | Same file |

The defensive guard is the only library-side improvement available to us within governance. It does not fix the underlying upstream defect; it just produces a better error message when the upstream defect would otherwise fire on our code path.

### 7.4 Upstream (camptocamp/ogc-client) — for them, not us

Recommended issue to file against camptocamp/ogc-client (after Phase 8 ships, separate from PR #136):

> **`getBaseUrl` throws `TypeError: Invalid URL` for relative-path arguments**
>
> `src/shared/url-utils.ts:9` calls `new URL(url)` unconditionally when given a string argument, which throws for any relative path. Callers — including `getLinkUrl`, `fetchDocument`, `fetchLink`, `parseBaseCollectionInfo` — therefore cannot tolerate a relative `baseUrl` even when the link href being resolved is absolute (because the second argument is evaluated before the constructor runs).
>
> Suggested fix: in browser environments, fall through the relative-path case to `new URL(url, globalThis.location?.toString() ?? 'http://localhost')` — matching the behaviour of the no-argument branch.
>
> Reproduction: see attached report.

That issue should originate from a project maintainer / sponsor account, not from this contribution PR. **Do not file it as part of PR #136.**

---

## 8. Verdict

**This is not our code. It is camptocamp's pre-existing URL-handling code, exposed through our (correctly-implemented) `csapi()` entry point. We are forbidden from fixing it inside our CSAPI PR.**

**What we should fix is the demo's warning text**, which currently slanders the server when it should mention the library limitation. That fix is small, in-scope, and lives entirely in our repo.

The strict-mode warning will continue to fire in the live demo against any preset that uses a proxy-relative base URL (CSAPI-Go, OSH, OSH SensorHub) until camptocamp accepts the upstream fix to `getBaseUrl`. Until then, the permissive-fallback path the demo already implements ensures the explorer continues to work — at the cost of one yellow card per connection.

---

## Appendix A — Files inspected

Primary source files (all in `OS4CSAPI/ogc-client-CSAPI_2`, branch `phase-8`):

- [`src/shared/url-utils.ts`](../../src/shared/url-utils.ts) — defect #1
- [`src/ogc-api/link-utils.ts`](../../src/ogc-api/link-utils.ts) — defect #5; also the `getLinkUrl` site that triggers #1
- [`src/ogc-api/info.ts`](../../src/ogc-api/info.ts) — defect #2
- [`src/ogc-api/edr/url_builder.ts`](../../src/ogc-api/edr/url_builder.ts) — defect #3
- [`src/ogc-api/endpoint.ts`](../../src/ogc-api/endpoint.ts) — defect #4; also our `csapi()` entry point
- [`src/ogc-api/csapi/helpers.ts`](../../src/ogc-api/csapi/helpers.ts) — example of correct relative-URL handling

Demo files (in `OS4CSAPI/ogc-csapi-explorer`, branch `main`):

- `demo/src/pages/ServerConnectPage.vue` — warning text (ours, fixable)
- `demo/src/csapi-bridge.ts` — strict/permissive bridge (ours, fixable)
- `demo/functions/api/csapi-go/[[path]].ts` — CF Pages reverse proxy (ours, working correctly)

Governance / precedent docs consulted:

- [`docs/governance/AI_OPERATIONAL_CONSTRAINTS.md`](../governance/AI_OPERATIONAL_CONSTRAINTS.md)
- [`docs/code-review/upstream-findings-report.md`](../code-review/upstream-findings-report.md)
- [`docs/code-review/001-upstream-p1-path-traversal-item-id.md`](../code-review/001-upstream-p1-path-traversal-item-id.md)
- [`docs/code-review/002-upstream-p1-query-param-injection.md`](../code-review/002-upstream-p1-query-param-injection.md)

## Appendix B — Reproduction commands

```sh
# 1. Confirm the upstream files are unchanged
cd ogc-client-CSAPI_2
git diff upstream/main -- src/shared/url-utils.ts                # → 0 lines
git diff upstream/main -- src/ogc-api/link-utils.ts              # → 0 lines
git diff upstream/main -- src/ogc-api/edr/url_builder.ts         # → 0 lines

# 2. Confirm info.ts and endpoint.ts diffs do NOT touch the defect lines
git diff upstream/main -- src/ogc-api/info.ts | grep -E '^@@'
# → hunks at +103, +269, +279, +310 (defect at line 161 is NOT in any hunk)
git diff upstream/main -- src/ogc-api/endpoint.ts | grep -E '^@@' | head -20
# → none of the hunks cover lines 638-682 (getCollectionItemsUrl body)

# 3. Reproduce the throw in isolation
node --input-type=module -e "
  import { getBaseUrl } from './src/shared/url-utils.ts';
  try { console.log(getBaseUrl('/api/csapi-go').toString()); }
  catch (e) { console.log('THREW:', e.message); }
"
# → THREW: Invalid URL
```
