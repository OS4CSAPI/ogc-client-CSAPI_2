# Phase 10 Addendum AD01: Post-Delivery Upstream Advance — Contribution Goal and Definition

- **Version:** 1.0
- **Status:** Approved
- **Date:** August 28, 2026
- **Original Phase 10 definition:** [P10 Contribution Goal and Definition](../../P10-contribution-goal-and-definition.md)
- **Preflight evidence:** [Post-Delivery Upstream Advance Preflight](../../../../research/phase-10/05-post-delivery-upstream-advance-preflight.md)
- **Prior approved upstream baseline:** `camptocamp/ogc-client@305e3da2cf86cfda5c3254a0be419db70cce54b0`
- **Approved amended addendum baseline:** `camptocamp/ogc-client@a623911201218bc1e814a9f83c64f3a027031990`
- **Current delivered PR head:** `OS4CSAPI/ogc-client:clean-pr@5f7cbd166143be76b60ea54593d6f313c75c3624`
- **Workbench branch:** `OS4CSAPI/ogc-client-CSAPI_2:phase-10`
- **Upstream contribution:** [camptocamp/ogc-client#136](https://github.com/camptocamp/ogc-client/pull/136)

---

## 1. Authority and Relationship to Phase 10

This document is a proposed additive amendment to the approved Phase 10 Contribution Goal and Definition. It exists because canonical upstream advanced after the verified Phase 10 delivery was pushed.

The original Phase 10 definition remains the authoritative record of the work approved and completed against `305e3da2cf86cfda5c3254a0be419db70cce54b0`. This addendum does not rewrite that history, reopen its settled decisions, or create a new feature phase. If approved, it authorizes only the additional work expressly defined here.

Where this addendum addresses the later upstream advance, it supplements the original definition. All original requirements and boundaries continue to apply unless this document explicitly narrows or updates them.

## 2. Trigger and Current State

Phase 10 delivery commit `5f7cbd166143be76b60ea54593d6f313c75c3624` was pushed to `clean-pr` on August 28, 2026 at 01:27 UTC. Upstream PR [#171](https://github.com/camptocamp/ogc-client/pull/171) merged approximately nine hours later at 10:48:59 UTC and advanced `camptocamp/ogc-client:main` to `00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d`.

Before implementation began, canonical upstream advanced again to `a623911201218bc1e814a9f83c64f3a027031990`. The additional four commits comprise upstream PR #172's API-v2 adjustments and a library-description correction. The project owner approved advancing the existing AD01 baseline rather than creating another planning trio or issue set.

The amended upstream range contains 12 commits and changes 32 paths. It primarily changes WMS dimensions, ncWMS handling, shared time models, API exports, API documentation, query-parameter utilities, type-only imports, and the library description. Four paths overlap the delivered CSAPI contribution:

- `app/api.data.js`;
- `src/index.ts`;
- `src/ogc-api/endpoint.ts`; and
- `src/ogc-api/info.ts`.

A read-only merge forecast reports content conflicts in three of those paths. `src/index.ts` merges automatically but still requires explicit preservation review. PR #136 is therefore eight commits behind and non-mergeable at its current head. This state was caused by subsequent upstream activity, not by an omission in the completed synchronization.

## 3. Addendum Contribution Goal

Advance the completed Phase 10 contribution from the prior approved upstream baseline to `a623911201218bc1e814a9f83c64f3a027031990`, preserve both the complete approved upstream range and the already-approved CSAPI contribution through the four known overlap paths, repeat the necessary preservation and quality verification, and return the accepted result to the existing Phase 10 delivery workflow so PR #136 is again current and technically mergeable—without adding CSAPI functionality, redesigning settled architecture, or creating new questions for the upstream maintainer.

## 4. Addendum Acceptance Criteria

Each criterion must map to a later Roadmap Addendum execution unit and an objectively inspectable acceptance gate. The Implementation Guide Addendum will define exact commands and resolution procedures only after this document is approved.

### A. Baseline advance and upstream preservation

| ID | Criterion | Required evidence |
| --- | --- | --- |
| P10-AD01-A1 | The accepted workbench result contains upstream commit `a623911201218bc1e814a9f83c64f3a027031990`. | An ancestry check confirms the amended addendum baseline is integrated. |
| P10-AD01-A2 | All changes in the approved upstream range through `a623911201218bc1e814a9f83c64f3a027031990` remain present except where a documented conflict resolution is necessary to preserve the approved CSAPI contribution. | A before/after upstream-path inventory contains no unexplained reversion or omission across the 32 affected paths. |
| P10-AD01-A3 | The integration introduces no unrelated upstream or CSAPI changes. | The addendum changed-file inventory is limited to merge results, necessary conflict resolutions, and verification records. |

### B. Overlap resolution and CSAPI preservation

| ID | Criterion | Required evidence |
| --- | --- | --- |
| P10-AD01-B1 | `app/api.data.js` retains upstream PR #171 API-documentation behavior and the approved per-entry-point CSAPI import-path mapping. | Focused diff inspection and documentation generation/build checks pass. |
| P10-AD01-B2 | `src/ogc-api/endpoint.ts` retains upstream endpoint API/documentation changes and the existing dynamically loaded `endpoint.csapi(collectionId)` facade. | Focused diff inspection, type checking, and relevant endpoint/CSAPI tests pass. |
| P10-AD01-B3 | `src/ogc-api/info.ts` retains upstream information-model changes and the existing CSAPI conformance/discovery behavior. | Focused diff inspection and relevant information/CSAPI tests pass. |
| P10-AD01-B4 | `src/index.ts` retains upstream WMS/shared-time exports without bulk-exporting the CSAPI surface from the package root. | Automated public-export and root/subpath boundary checks report no unexplained change. |
| P10-AD01-B5 | The approved Phase 10 CSAPI public surface, package entry point, documentation, and tested behavior remain intact after the baseline advance. | The original Phase 10 preservation, documentation, package-consumer, and behavioral gates pass without unexplained regressions. |

### C. Verification and delivery continuity

| ID | Criterion | Required evidence |
| --- | --- | --- |
| P10-AD01-C1 | The integrated workbench result passes the current repository's full formatting, type, lint, Node-test, browser-test, documentation-build, production-build, and package-consumer gates under the approved runtime. | Recorded command results and GitHub Actions evidence satisfy the original Phase 10 quality requirements. |
| P10-AD01-C2 | Contribution-bearing content delivered to `clean-pr` is identical to the accepted workbench result and excludes workbench-only planning, research, governance, and issue records. | Delivery-manifest parity reports zero differences and the delivery diff contains no workbench-only artifacts. |
| P10-AD01-C3 | PR #136 targets current `camptocamp:main`, is no longer behind or conflict-blocked at the time of final verification, and receives the available required checks. | GitHub PR metadata records the expected base/head, mergeability state, commit relationship, and check results. |
| P10-AD01-C4 | The additional work returns to existing Phase 10 issue #200 for final publication and check monitoring rather than creating a duplicate final-delivery issue. | The Roadmap Addendum ends with an explicit dependency handoff to issue #200. |

## 5. Addendum Contribution Definition

The addendum consists of three bounded workstreams.

### Workstream 1 — Advance and classify

Lock the new upstream baseline, integrate it into the workbench, record the actual conflict population, and compare it with the preflight forecast. If upstream advances again before implementation begins, planning stops and the baseline is reassessed before source changes continue.

### Workstream 2 — Resolve and preserve

Resolve only the actual overlaps created by the approved upstream range. Preserve upstream behavior in WMS, ncWMS, shared time models, API exports, query utilities, type-only imports, the library description, and documentation while retaining the established CSAPI endpoint facade, conformance discovery, root/subpath boundary, and documentation mapping.

Automatic merge results are not accepted without inspection. Conflict resolution does not authorize redesign, refactoring, renaming, or new convenience APIs.

### Workstream 3 — Reverify and resume delivery

Repeat the original Phase 10 preservation, documentation, repository-QA, build, and packed-consumer checks against the advanced baseline. Prepare and verify a new local curated delivery result, then return to existing issue #200 for the final `clean-pr` push, PR-state verification, and available check monitoring.

## 6. Locked Decisions

The following decisions apply throughout this addendum:

| Decision | Addendum rule |
| --- | --- |
| **Original Phase 10 remains valid** | Completed work and its evidence are preserved. This addendum records only the necessary response to later upstream activity. |
| **Baseline advances to one identified commit** | The project-owner-approved amended target is `a623911201218bc1e814a9f83c64f3a027031990`; silent movement to a later upstream commit is prohibited. |
| **No new CSAPI scope** | The work is integration and preservation only. No feature, API, server, or interoperability work is added. |
| **Preserve the approved upstream range** | PR #171, PR #172, the library-description correction, and all included WMS, ncWMS, shared-time, export, query-utility, type-only-import, and documentation changes remain intact unless a minimal documented resolution is required for coexistence with CSAPI. |
| **Dynamic-import facade remains settled** | `OgcApiEndpoint.csapi()` keeps its established dynamic boundary and behavior; the addendum does not redesign it or ask the maintainer to decide its future. |
| **CSAPI remains a subpath API** | CSAPI-specific public symbols remain under `@camptocamp/ogc-client/csapi`; root bulk export is prohibited. |
| **Existing two-repository workflow remains** | Work occurs and is evidenced in workbench `phase-10`; only curated contribution-bearing content reaches delivery `clean-pr`. |
| **Normal push only** | Final delivery must not require a force-push. Any history condition that appears to require one stops execution for project-owner review. |
| **No duplicate final-delivery issue** | New addendum issues cover planning-derived integration and verification work; existing issue #200 retains final publication/check responsibility. |
| **No new maintainer question** | Updating the PR must not request a new design decision. Any final notification is limited to factual delivery and verification status already authorized by Phase 10. |
| **Staged planning authority** | Approval of this document authorizes drafting the Implementation Guide Addendum only. It does not authorize source integration, a Roadmap Addendum, issues, delivery changes, or PR updates. |

## 7. Scope Boundaries

### In scope

- Advancing the approved Phase 10 baseline from `305e3da2cf86cfda5c3254a0be419db70cce54b0` to `a623911201218bc1e814a9f83c64f3a027031990`.
- Integrating the 12-commit approved upstream range, including PR #171, PR #172, and the library-description correction.
- Resolving and reviewing the four identified overlap paths and any additional conflict exposed by the real workbench integration.
- Repeating the original preservation, documentation, QA, build, package, parity, and PR-state gates affected by the new baseline.
- Preparing a new curated delivery result and resuming issue #200 for final publication.
- Recording factual evidence and issue-closing results in the workbench repository.

### Out of scope

- Any new CSAPI feature, API redesign, refactor, naming change, or consumer convenience.
- Redesign or removal of the dynamic-import facade.
- Changes to behavior in the approved upstream range beyond minimal coexistence resolution.
- New live-server testing or work on OpenSensorHub or any other independent server.
- Unrelated dependency upgrades, formatting churn, documentation redesign, or defect correction.
- Retrospective editing of the approved Phase 10 planning documents or completed issue records.
- Repeating the already-posted maintainer notification merely to report planning activity.
- Force-pushing `clean-pr` or rewriting its published history.

## 8. Deliverables

| ID | Deliverable |
| --- | --- |
| P10-AD01-DEL-1 | Approved Contribution Goal and Definition Addendum, Implementation Guide Addendum, and Roadmap Addendum. |
| P10-AD01-DEL-2 | One-to-one addendum Roadmap/GitHub issue set for baseline locking, integration, resolution, and verification, with a final handoff to issue #200. |
| P10-AD01-DEL-3 | Workbench result containing the approved advanced upstream baseline and preserved CSAPI contribution. |
| P10-AD01-DEL-4 | Recorded overlap-resolution, public-surface, documentation, QA, build, package, and delivery-parity evidence. |
| P10-AD01-DEL-5 | Curated normal-push update to `clean-pr` and final PR #136 mergeability/check evidence completed through issue #200. |

## 9. Success Condition

Addendum AD01 is complete only when:

- the accepted workbench and delivered PR head contain upstream commit `a623911201218bc1e814a9f83c64f3a027031990`;
- the complete approved upstream range and the approved CSAPI contribution coexist without unexplained omission or reversion;
- the four overlap paths satisfy their preservation requirements;
- the original Phase 10 quality, documentation, build, package, and delivery-parity gates pass against the advanced baseline;
- `clean-pr` is updated by a normal push with no workbench-only artifacts;
- PR #136 is current and technically mergeable against its recorded base at final verification, subject only to maintainer-controlled review and workflow approval; and
- no excluded feature, architecture, server, or unrelated-maintenance work has entered the contribution.

## 10. Approval Record

The project owner approved this Contribution Goal and Definition Addendum on August 28, 2026. Version 1.0 is the authoritative AD01 scope contract from which the Implementation Guide Addendum must be derived.

Approval authorizes drafting the Implementation Guide Addendum only. It does not authorize source integration, conflict resolution, Roadmap creation, GitHub issue creation, delivery-branch modification, force-pushing, or PR updates.
