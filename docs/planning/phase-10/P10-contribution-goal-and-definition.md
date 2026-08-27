# Phase 10: Upstream Synchronization and Documentation Maintenance — Contribution Goal and Definition

- **Version:** 1.0
- **Status:** Approved
- **Date:** August 27, 2026
- **Upstream baseline observed during preflight:** `camptocamp/ogc-client@305e3da2cf86cfda5c3254a0be419db70cce54b0`
- **Workbench branch:** `OS4CSAPI/ogc-client-CSAPI_2:phase-10`
- **Delivery branch:** `OS4CSAPI/ogc-client:clean-pr`
- **Upstream contribution:** [camptocamp/ogc-client#136](https://github.com/camptocamp/ogc-client/pull/136)

---

## 1. Context

[PR #136](https://github.com/camptocamp/ogc-client/pull/136) adds OGC API — Connected Systems (CSAPI) support to `camptocamp/ogc-client`. The contribution remains open and currently uses `OS4CSAPI/ogc-client:clean-pr` as its head branch.

The CSAPI contribution was last delivered at the end of Phase 8 on April 29, 2026. Phase 9 subsequently synchronized the workbench through upstream PR #140 and produced research and live-testing records, but it did not create a new CSAPI implementation workstream or update the delivery branch.

Canonical upstream has continued to evolve. At the Phase 10 preflight on August 27, 2026:

- workbench `phase-9` and the new `phase-10` branch shared upstream commit `afd9c266cb124c622439677cf438904b7ef1e03f` as their latest integrated upstream baseline;
- current `upstream/main` was `305e3da2cf86cfda5c3254a0be419db70cce54b0`;
- 83 commits were reachable from current `upstream/main` but not from the Phase 9 baseline;
- upstream had added and changed library functionality, dependencies, CI configuration, package entry points, formatting, and the public documentation application;
- upstream had replaced the previous documentation application with VitePress and a TypeDoc-generated API data pipeline;
- upstream had upgraded Prettier from 2.8.8 to the 3.x line;
- delivery `clean-pr` remained at the squashed Phase 8 commit `effaa783ed689187f8d3e3795b4946fa38175448`.

The existing CSAPI public documentation also contains stale Phase 6-era examples. In particular, the README still passes an `OgcApiEndpoint` directly to `createCSAPIBuilder()` and calls `getDataStreams()`, while the Phase 8 API uses `endpoint.csapi(collectionId)`, a value-shaped `createCSAPIBuilder()` factory for advanced consumers, and `getDatastreams()` naming. These examples must not be carried into the refreshed upstream documentation unchanged.

Phase 10 is therefore a bounded maintenance and integration phase. Its purpose is to bring the already-developed CSAPI contribution forward onto current upstream conventions and restore reviewer-facing accuracy. It is not a new feature-design phase and does not reopen Phase 8 architecture decisions.

## 2. Contribution Goal

Synchronize the existing CSAPI contribution in PR #136 with current `camptocamp/ogc-client` `main`, adapt the contribution to the upstream Prettier 3 and VitePress/TypeDoc documentation systems, correct stale public CSAPI documentation and examples, verify the combined library and published package through current automated quality gates, and deliver the accepted result to `clean-pr` as a minimal, reviewable PR update without expanding CSAPI functionality or reopening settled architecture.

## 3. Acceptance Criteria

Every Phase 10 acceptance criterion must ultimately map to at least one Roadmap execution unit and an automated or objectively inspectable acceptance gate. The Implementation Guide will define the exact commands after this document is approved.

### A. Upstream synchronization and preservation

| ID     | Criterion                                                                                                                                                                                       | Required evidence                                                                                                           |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| P10-A1 | The final workbench result contains the approved current-upstream baseline.                                                                                                                     | `git merge-base --is-ancestor <recorded-upstream-sha> phase-10` exits 0.                                                    |
| P10-A2 | Upstream changes made after the Phase 9 baseline remain present unless a documented merge resolution is required to preserve CSAPI.                                                             | A machine-generated upstream-change inventory and final changed-file comparison contain no unexplained upstream reversions. |
| P10-A3 | The existing Phase 8 CSAPI public surface and tested behavior remain available after synchronization, except for documentation or toolchain adaptations explicitly authorized by this document. | Existing CSAPI unit/integration tests pass, and an automated public-export comparison reports no unexplained removals.      |
| P10-A4 | Current upstream package-entry changes and the CSAPI `./csapi` subpath export coexist in the final package metadata.                                                                            | Package metadata parses successfully and exposes both `.` and `./csapi` with working JavaScript and declaration targets.    |
| P10-A5 | Non-CSAPI upstream functionality is not intentionally altered by Phase 10 conflict resolution or maintenance work.                                                                              | Full project QA passes and the Phase 10 contribution diff contains no unrelated source changes.                             |

### B. Prettier 3 and current toolchain alignment

| ID     | Criterion                                                                                                                                                        | Required evidence                                                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P10-B1 | The combined tree uses the current upstream Prettier 3 dependency, configuration, ignore rules, and formatting conventions.                                      | The locked dependency resolves to the approved 3.x version and `npm run format:check` exits 0.                                                           |
| P10-B2 | CSAPI source, tests, fixtures, and public documentation included by the current formatter pass without locally restoring Prettier 2 behavior.                    | `npm run format:check` exits 0 on a clean checkout of the final workbench commit.                                                                        |
| P10-B3 | Formatter migration does not introduce semantic CSAPI changes.                                                                                                   | Formatting-only changes are mechanically distinguishable from authored maintenance changes, and all behavioral gates pass.                               |
| P10-B4 | Phase 10 verification uses a Node.js runtime supported by the project and current upstream CI rather than the preflight workstation's unsupported alpha runtime. | The recorded runtime satisfies `package.json` and the current CI workflow; install and QA commands complete without the preflight compatibility warning. |

### C. Public documentation and API-reference integration

| ID     | Criterion                                                                                                                                                                      | Required evidence                                                                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P10-C1 | The current upstream README identifies OGC API — Connected Systems as a supported standard and contains an accurate, concise consumer example.                                 | README checks find the CSAPI standard entry, `endpoint.csapi(...)`, `getDatastreams(...)`, and the `@camptocamp/ogc-client/csapi` subpath where subpath symbols are used. |
| P10-C2 | Public documentation no longer presents the obsolete Phase 6 call `createCSAPIBuilder(endpoint, collectionId)` or obsolete `*DataStream*` method spelling as current usage.    | Repository searches over public documentation and examples return zero obsolete usage matches, excluding explicitly historical workbench records.                         |
| P10-C3 | Documentation distinguishes the preferred endpoint facade from the value-shaped `createCSAPIBuilder(collection, resourceUrls)` advanced API without redesigning either API.    | Generated/public documentation contains both signatures with their correct roles and contains no contradictory invocation.                                                |
| P10-C4 | The current VitePress/TypeDoc API-reference pipeline includes the public CSAPI subpath surface and renders CSAPI imports from `@camptocamp/ogc-client/csapi` where applicable. | An automated documentation check finds representative CSAPI classes, functions, and types in generated API data/output and validates their displayed import path.         |
| P10-C5 | API-documentation integration does not expose the entire CSAPI surface from the package root merely to make TypeDoc discover it.                                               | The root public-export inventory remains unchanged with respect to CSAPI bulk exports, while the generated reference includes the `./csapi` entry point.                  |
| P10-C6 | The complete documentation site builds using the current upstream command.                                                                                                     | `npm run docs:build` exits 0 on the final workbench commit.                                                                                                               |

### D. Automated quality, build, and package verification

| ID     | Criterion                                                                                                                             | Required evidence                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| P10-D1 | TypeScript compilation succeeds.                                                                                                      | `npm run typecheck` exits 0.                                                                                                                  |
| P10-D2 | ESLint succeeds.                                                                                                                      | `npm run lint` exits 0.                                                                                                                       |
| P10-D3 | Node tests succeed under the approved runtime.                                                                                        | `npm run test:node` exits 0.                                                                                                                  |
| P10-D4 | Browser tests succeed under the approved runtime, or any infrastructure exception is shown to predate and be independent of Phase 10. | `npm run test:browser` exits 0; any exception requires reproducible baseline evidence and explicit project-owner disposition before delivery. |
| P10-D5 | Production builds succeed.                                                                                                            | `npm run build` exits 0.                                                                                                                      |
| P10-D6 | The packed artifact contains working root and CSAPI subpath JavaScript/declaration entry points.                                      | Automated package-content and clean-consumer import checks succeed for `@camptocamp/ogc-client` and `@camptocamp/ogc-client/csapi`.           |
| P10-D7 | No acceptance gate depends on a live third-party CSAPI server.                                                                        | The Roadmap verification matrix contains only repository-local, fixture-based, build, package, or Git/PR metadata gates.                      |

### E. Delivery to PR #136

| ID     | Criterion                                                                                                                                                                                          | Required evidence                                                                                                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P10-E1 | All implementation and verification work is completed first on workbench `phase-10`; workbench-only planning, research, governance, and issue records are not copied into the delivery repository. | A generated delivery manifest contains only contribution-bearing source, tests, fixtures, package/build configuration, and public documentation files.                                         |
| P10-E2 | The Phase 10 contribution is presented on `clean-pr` as one curated review unit distinct from the integrated upstream history.                                                                     | The final delivery log and diff show the approved upstream baseline plus one identifiable Phase 10 contribution unit; exact synchronization mechanics are defined in the Implementation Guide. |
| P10-E3 | The delivery tree contains the same accepted contribution-bearing content as the verified workbench tree.                                                                                          | Automated tree/file comparison over the delivery manifest reports zero differences.                                                                                                            |
| P10-E4 | PR #136 accurately describes the current consumer API, documentation integration, upstream synchronization, and Phase 10 verification results.                                                     | GitHub PR metadata contains the approved Phase 10 summary and contains no obsolete factory or `getDataStreams()` usage.                                                                        |
| P10-E5 | PR #136 targets current `camptocamp:main` from `OS4CSAPI:clean-pr` and its required checks complete successfully after the update.                                                                 | GitHub PR metadata and check results confirm the expected base/head branches and required successful checks.                                                                                   |

## 4. Contribution Definition

Phase 10 consists of four bounded workstreams that converge on a single verified update to PR #136.

### Workstream 1 — Current-upstream integration

Bring the existing Phase 8 CSAPI contribution forward across all upstream changes since the Phase 9 baseline. Preserve current upstream behavior, structure, dependencies, package-entry changes, CI expectations, and documentation architecture while resolving only the overlaps necessary to retain CSAPI.

This workstream includes establishing a reproducible upstream baseline and recording merge/conflict evidence. It does not authorize opportunistic refactoring of CSAPI or unrelated upstream code.

### Workstream 2 — Prettier 3 and toolchain maintenance

Adopt current upstream formatting and runtime expectations across the combined tree. Apply Prettier 3 where required, keep mechanical formatting distinguishable from authored changes, and avoid configuration forks whose only purpose would be to preserve historical Prettier 2 output.

This workstream may include necessary lockfile and configuration resolution caused by synchronization. It does not authorize unrelated dependency upgrades beyond those inherited from the approved upstream baseline or proven necessary for Phase 10 acceptance.

### Workstream 3 — Public documentation correction and integration

Reconcile the CSAPI public documentation with both the Phase 8 API and upstream's new documentation system:

- restore CSAPI to the supported-standards documentation after upstream synchronization;
- replace stale consumer examples with correct `endpoint.csapi(collectionId)` and `getDatastreams()` usage;
- accurately document the advanced, value-shaped `createCSAPIBuilder(collection, resourceUrls)` API;
- retain subpath imports for CSAPI-specific public symbols;
- include the CSAPI public surface in the VitePress/TypeDoc API reference without bulk-exporting it from the root package entry point;
- update PR #136's reviewer-facing description so it no longer repeats superseded Phase 6 usage.

This is documentation maintenance and integration, not an API redesign or a new documentation-site redesign.

### Workstream 4 — Current QA and clean delivery

Run the current repository's automated formatter, type, lint, test, documentation, build, and packaging gates under a supported runtime. Resolve only failures attributable to the synchronization or Phase 10 maintenance scope.

After the workbench result is accepted, transfer only the curated contribution-bearing changes to `clean-pr`, verify workbench/delivery parity over the delivery manifest, update PR #136, and record the final CI evidence.

## 5. Locked Decisions

These decisions are established inputs to Phase 10 and must not be reopened by the Implementation Guide, Roadmap, or individual issues without explicit project-owner approval.

| Decision                                     | Phase 10 rule                                                                                                                                                                                                                                                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Maintenance, not feature development**     | Phase 10 synchronizes, documents, and verifies the existing contribution. It adds no new CSAPI capabilities or consumer conveniences.                                                                                                                                                                          |
| **Preserve the Phase 8 public API**          | `OgcApiEndpoint.csapi(collectionId)`, the value-shaped `createCSAPIBuilder(collection, resourceUrls)`, current parser/query-builder APIs, and current naming remain the baseline.                                                                                                                              |
| **Do not revisit the dynamic-import facade** | The existing dynamic imports used by `OgcApiEndpoint.csapi()` are preserved. Phase 10 does not redesign, remove, replace, or seek new upstream guidance about that facade. Mechanical adaptation is allowed only if required by upstream integration while preserving equivalent behavior and boundary intent. |
| **Preserve the CSAPI subpath**               | CSAPI-specific public exports remain available from `@camptocamp/ogc-client/csapi`; bulk root export is not used as a documentation shortcut.                                                                                                                                                                  |
| **Follow current upstream patterns**         | Current upstream structure, naming, build configuration, VitePress/TypeDoc architecture, and dependency choices are the default. Diffs remain minimal and Phase 10-specific.                                                                                                                                   |
| **No live-server acceptance dependency**     | Phase 10 relies on repository fixtures and automated local/CI gates. OpenSensorHub, 52North, CS-Go, and other independent servers are not retested or modified.                                                                                                                                                |
| **Two-repository workflow**                  | Development history and institutional records remain in `ogc-client-CSAPI_2:phase-10`; `ogc-client:clean-pr` remains the curated delivery branch for PR #136.                                                                                                                                                  |
| **No new questions for upstream**            | Phase 10 prepares a self-contained maintenance update from already-settled decisions. It does not ask the upstream maintainer to choose among new designs.                                                                                                                                                     |
| **Staged planning authority**                | The Implementation Guide begins only after this document is approved; the Roadmap begins only after the Guide is approved; issues are generated only from the settled Roadmap.                                                                                                                                 |

## 6. Scope Boundaries

### In scope

- Synchronization with an explicitly recorded current `camptocamp/ogc-client:main` baseline.
- Necessary conflict resolution that preserves both current upstream and the existing CSAPI contribution.
- Adoption of upstream Prettier 3 formatting and relevant current toolchain conventions.
- Correction of stale CSAPI README, JSDoc, generated-reference, example, and PR-description content.
- Integration of the CSAPI subpath into upstream's VitePress/TypeDoc documentation pipeline.
- Repository-local tests, fixtures, type checks, lint, documentation build, production build, and package-consumer verification.
- Workbench review, curated clean delivery, tree-parity verification, and PR #136 refresh.

### Out of scope

- New CSAPI features, resource types, query helpers, parser capabilities, CRUD behavior, pagination helpers, or result-extraction utilities.
- Reconsideration or redesign of the existing dynamic-import facade.
- Live-server smoke testing or renewed cross-server interoperability research.
- Changes to OpenSensorHub, 52North, CS-Go, or any other independent server or consumer repository.
- Fixes for server-specific nonconformance owned outside this library.
- Unrelated refactors, renames, abstractions, dependency upgrades, or style cleanup.
- Broad redesign of upstream's VitePress site or API-reference user experience.
- Resolution of unrelated defects discovered during Phase 10; such findings are recorded for later disposition.
- Creation of the Implementation Guide, Roadmap, or Phase 10 GitHub issues before their respective approval gates.

## 7. Verification Strategy

Phase 10 verification is layered so that a passing final CI result is supported by narrower evidence:

1. **Baseline verification** — record exact workbench, delivery, and upstream SHAs and prove the approved upstream commit is integrated.
2. **Scope verification** — inventory changed files and compare them to the approved Roadmap/delivery manifest.
3. **Public-surface verification** — compare CSAPI exports and check the root/subpath boundary.
4. **Documentation verification** — detect obsolete public examples, validate correct import paths, generate TypeDoc data, and build VitePress.
5. **Repository QA** — run formatting, type checking, lint, Node tests, and browser tests under the supported runtime.
6. **Build/package verification** — build all targets, inspect the packed artifact, and import both package entry points from a clean consumer context.
7. **Delivery verification** — compare accepted workbench files with `clean-pr`, inspect PR metadata, and record GitHub Actions results.

The Implementation Guide must convert these layers into exact commands, expected outputs, failure-handling rules, and a supported runtime specification. The Roadmap must attach the relevant commands to each execution unit rather than postponing all validation until the end.

## 8. Relationship to Prior Work

| Phase      | Contribution to the Phase 10 baseline                                                                                     | Status entering Phase 10                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Phases 1–5 | Core CSAPI models, query building, parsing, endpoint integration, tests, and parser completion                            | Preserved                                                         |
| Phase 6    | Separate `./csapi` entry point and decoupling architecture                                                                | Preserved, as subsequently refined                                |
| Phase 7    | Senior code-review cleanup and hardening                                                                                  | Preserved                                                         |
| Phase 8    | Public API refinements, endpoint facade, dynamic boundary, error/type improvements, documentation, and interop correction | Current CSAPI implementation baseline                             |
| Phase 9    | May upstream synchronization and research/live-testing record                                                             | Parent of `phase-10`; no new implementation scope carried forward |
| Phase 10   | Current-upstream synchronization, formatter/docs maintenance, current QA, and clean PR refresh                            | Defined by this draft                                             |

The descriptive [Phase 10 planning and execution workflow](../../research/phase-10/01-phase-10-planning-and-execution-workflow.md) records how this document, the later Implementation Guide, Roadmap, and GitHub issues are gated. It does not override this contribution definition.

## 9. Deliverables

| ID    | Deliverable                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------ |
| DEL-1 | Approved Phase 10 Contribution Goal and Definition, Implementation Guide, and Roadmap in the workbench repository. |
| DEL-2 | One-to-one Phase 10 Roadmap/GitHub issue set with automated acceptance gates and dependencies.                     |
| DEL-3 | Workbench `phase-10` implementation containing the approved upstream baseline and completed maintenance changes.   |
| DEL-4 | Recorded automated QA, documentation, build, package, and scope-verification evidence.                             |
| DEL-5 | Curated Phase 10 delivery on `OS4CSAPI/ogc-client:clean-pr`, excluding workbench-only artifacts.                   |
| DEL-6 | Updated PR #136 description and successful required GitHub checks.                                                 |
| DEL-7 | Issue-closing records containing commit links, acceptance results, changed-file reality, and deviations or `none`. |

## 10. Success Condition

Phase 10 is complete only when:

- PR #136 is based on an approved current upstream baseline;
- the existing Phase 8 CSAPI API and behavior remain intact;
- the combined tree conforms to upstream's current Prettier and toolchain expectations;
- public CSAPI documentation and examples match the actual API;
- the VitePress/TypeDoc site includes a correct CSAPI subpath API reference;
- repository QA, documentation, production build, and packed-consumer checks satisfy their approved gates;
- the verified workbench result is represented faithfully and minimally on `clean-pr`;
- PR #136 contains an accurate Phase 10 summary and successful required checks;
- no excluded feature, architecture, server, or unrelated-maintenance work has been absorbed.

At that point, the upstream maintainer can review the refreshed contribution without first resolving new design questions introduced by Phase 10.

## 11. Approval Record

The project owner approved this Contribution Goal and Definition on August 27, 2026. Version 1.0 is the authoritative Phase 10 scope contract from which the Implementation Guide must be derived.

Approval authorizes drafting the Implementation Guide only. It does not authorize an upstream merge, source change, formatter migration, Roadmap, GitHub issue, delivery-branch modification, or PR update.
