# Upstream Security Findings — Out of Scope Assessment

**Date:** 2026-03-07
**Reviewer:** GitHub Copilot (Claude Opus 4.6)
**Source:** Senior developer code review of `clean-pr` (upstream draft PR #136)

---

## Summary

Two security findings (001, 002) from the senior developer's code review target pre-existing vulnerabilities in `src/ogc-api/endpoint.ts` — code authored by camptocamp/ogc-client maintainers that we did not write and did not modify. Both findings are **TRUE and VERIFIED** but **out of scope** for our CSAPI PR.

**Verdict: Do not fix in our PR. Do not create GitHub issues. Track via MD files only.**

---

## Finding 001 — Path Traversal via Unencoded `itemId`

**MD file:** [001-upstream-p1-path-traversal-item-id.md](001-upstream-p1-path-traversal-item-id.md)

| Field | Value |
|-------|-------|
| **Severity** | P1-Critical |
| **File** | `src/ogc-api/endpoint.ts:551` |
| **Upstream author** | Olivier Guyot (commit `ecdb8442`, 2023-02-12) |
| **Exists in `upstream/main`** | Yes — identical line |
| **In our diff** | No |
| **CSAPI affected** | No — CSAPI uses `encodeResourceId()` |

**Assessment:** The finding is correct. `url.pathname += \`/\${itemId}\`` without `encodeURIComponent` is a textbook path traversal vector. However, this line was written by the upstream maintainer in 2023, exists identically in `upstream/main`, and is not part of our contribution. Our CSAPI module is not affected because it uses `encodeResourceId()` (which wraps `encodeURIComponent`) for all resource IDs.

**Out of scope because:**
- We did not author this code
- It is not in our diff to `clean-pr`
- Modifying upstream code we didn't write violates our governance rules
- Our CSAPI code is independently protected

---

## Finding 002 — Query Parameter Injection via `encodeURI`

**MD file:** [002-upstream-p1-query-param-injection.md](002-upstream-p1-query-param-injection.md)

| Field | Value |
|-------|-------|
| **Severity** | P1-Critical |
| **File** | `src/ogc-api/endpoint.ts:651` |
| **Upstream author** | Olivia (commit `d587336c`, 2025-08-04) |
| **Exists in `upstream/main`** | Yes — identical line |
| **In our diff** | No |
| **CSAPI affected** | No — CSAPI uses typed `buildQueryString()` |

**Assessment:** The finding is correct. `encodeURI(options.query)` does not encode `&`, `=`, `?`, or `#`, enabling parameter injection and URL corruption. However, this line was authored by an upstream contributor in 2025, exists identically in `upstream/main`, and is not part of our contribution. Our CSAPI URL builder uses typed query parameter construction via `buildQueryString()` which individually encodes each parameter value — not affected.

**Out of scope because:**
- We did not author this code
- It is not in our diff to `clean-pr`
- Modifying upstream code we didn't write violates our governance rules
- Our CSAPI code is independently protected

---

## Recommendation

Both vulnerabilities are real and should eventually be fixed in the upstream camptocamp/ogc-client repository. If we choose to contribute fixes, they should be offered as **separate upstream PRs** — not bundled into our CSAPI contribution. For now, the MD files in `docs/code-review/` serve as our awareness record.
