# Phase 10 Roadmap

- **Version:** 1.0
- **Status:** Approved
- **Date:** August 27, 2026
- **Branch:** `phase-10`
- **Scope authority:** [Phase 10 Contribution Goal and Definition](./P10-contribution-goal-and-definition.md)
- **Technical authority:** [Phase 10 Implementation Guide](./P10-implementation-guide.md)

---

## 1. Purpose

This Roadmap converts the approved Phase 10 scope and technical plan into bounded execution units. Each numbered task is designed for one coherent AI-assisted work session, one GitHub issue, one reviewable workbench commit or explicitly stated evidence-only result, and one issue-closing record.

No GitHub issue exists for these tasks yet. Issues may be created only after this Roadmap is approved and its one-to-one task mapping is verified.

## 2. Non-Negotiable Execution Rules

Every task must follow these rules:

1. Review `docs/governance/AI_OPERATIONAL_CONSTRAINTS.md` at task entry.
2. Restate the single task goal and identify assumptions requiring confirmation.
3. Work only on the named task and its listed paths or evidence.
4. Preserve the approved dynamic-import facade and separate `./csapi` package entry point.
5. Do not introduce new CSAPI features, server fixes, live-server tests, unrelated refactors, dependency remediation, or upstream design questions.
6. Run the exact automated acceptance gate before completion.
7. Review the actual changed-file list and diff for scope.
8. Commit and push workbench changes before closing the issue, unless the task is explicitly evidence-only.
9. Close each issue with the commit SHA or evidence location, changed files, exact gate results, and deviations or `none`.
10. Stop when a conflict, changed upstream state, or required fix exceeds the task boundary.

The Roadmap order is dependency-driven. Tasks must not be combined merely because one session has remaining capacity.

## 3. Dependency Sequence

```text
A1 Revalidate upstream baseline
        ↓
A2 Integrate upstream in workbench
        ↓
A3 Audit preservation
        ↓
B1 Align workbench tooling boundaries
        ↓
B2 Apply Prettier 3 migration
        ↓
C1 Correct public CSAPI documentation
        ↓
D1 Integrate CSAPI API reference
        ↓
E1 Run full repository and documentation QA
        ↓
E2 Prove production package and clean-consumer imports
        ↓
F1 Generate reviewed delivery manifest and patch
        ↓
F2 Prepare and verify clean delivery locally
        ↓
F3 Push clean-pr, refresh PR #136, and verify checks
```

## 4. Phase A — Current-Upstream Integration

### Task A1 — Revalidate and Lock the Upstream Baseline

- **GitHub issue:** [#189](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/189).
- **Objective:** Establish the exact upstream commit and conflict forecast that Task A2 is permitted to merge.
- **Acceptance criteria advanced:** P10-A1, P10-A2.
- **Dependencies:** None.
- **Complexity/risk:** Low; read-only Git analysis.
- **Locked decisions:** Use canonical `camptocamp/ogc-client:main`; use a normal merge; do not integrate anything in this task.
- **Expected work:**
  - fetch workbench `origin` and canonical `upstream`;
  - confirm a clean `phase-10` checkout and record its starting SHA;
  - record `upstream/main`, merge base, ancestry, and commit counts;
  - generate an upstream changed-file inventory;
  - run `git merge-tree --write-tree --messages phase-10 upstream/main`;
  - compare the result to the guide's forecast of one `app/package-lock.json` modify/delete conflict;
  - record any semantic overlaps requiring Task A2 inspection.
- **Affected areas:** Git metadata and an evidence note under `docs/research/phase-10/`; no source files.
- **Explicit exclusions:** Merge, rebase, cherry-pick, conflict resolution, formatter write, package install, delivery-repository changes.
- **Automated acceptance gate:**
  - all fetch and inspection commands exit 0;
  - the evidence note contains the exact SHAs, counts, changed-file inventory location, and complete merge forecast;
  - any forecast differing materially from the approved guide is reported and work stops.
- **Deliverable:** Committed and pushed implementation-baseline evidence naming the one upstream SHA authorized for Task A2.
- **Closing evidence:** Evidence path, commit SHA, upstream SHA, forecast result, changed files, deviations or `none`.

### Task A2 — Integrate the Locked Upstream Commit in the Workbench

- **GitHub issue:** [#190](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/190).
- **Objective:** Merge the A1-recorded upstream commit into `phase-10` while preserving current upstream architecture and the existing CSAPI contribution.
- **Acceptance criteria advanced:** P10-A1, P10-A2, P10-A4, P10-A5.
- **Dependencies:** A1.
- **Complexity/risk:** High; foundational integration mutation.
- **Locked decisions:** Normal `--no-ff` merge; no rebase or force-push; accept upstream deletion of `app/package-lock.json`; preserve the dynamic-import facade and `./csapi` export.
- **Expected work:**
  - verify that `upstream/main` still resolves to the A1-recorded SHA;
  - merge that exact SHA into `phase-10`;
  - resolve the forecast lockfile conflict with `git rm app/package-lock.json`;
  - inspect every conflict and the semantically overlapping automatic merges listed in the Implementation Guide;
  - confirm current upstream root tooling, dependencies, exports, docs structure, and CI runtime remain present;
  - confirm Phase 8 CSAPI files, facade, subpath export, and `sideEffects` metadata remain present;
  - commit and push the integration merge without beginning maintenance work.
- **Affected areas:** Merge result across the repository, especially `app/package-lock.json`, `.github/workflows/qa.yml`, `.prettierignore`, `README.md`, `package*.json`, `src/index.ts`, and endpoint/CSAPI overlap files.
- **Explicit exclusions:** Prettier writes, stale-doc correction, TypeDoc integration, new tests, server testing, unrelated merge cleanup.
- **Automated acceptance gate:**
  - `git merge-base --is-ancestor <recorded-upstream-sha> phase-10` exits 0;
  - `app/package-lock.json` is absent;
  - package metadata parses and exposes both `.` and `./csapi`;
  - recorded conflict paths match the reviewed resolution;
  - the pushed branch contains the merge commit and has no uncommitted changes.
- **Deliverable:** One pushed workbench upstream-integration merge commit.
- **Closing evidence:** Merge SHA, upstream SHA, resolved paths, package-export result, inspected automatic merges, deviations or `none`.

### Task A3 — Audit Upstream and CSAPI Preservation

- **GitHub issue:** [#191](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/191).
- **Objective:** Prove that Task A2 preserved both current upstream changes and the Phase 8 CSAPI public surface before maintenance edits begin.
- **Acceptance criteria advanced:** P10-A2, P10-A3, P10-A4, P10-A5.
- **Dependencies:** A2.
- **Complexity/risk:** Medium; evidence generation and targeted correction only if already authorized by the merge resolution.
- **Locked decisions:** No new public exports; no non-CSAPI upstream reversions; findings outside merge preservation are deferred.
- **Expected work:**
  - compare upstream-changed paths against the merged workbench tree;
  - generate before/after CSAPI public-export inventories;
  - verify root and CSAPI package export targets coexist;
  - run targeted TypeScript and existing CSAPI tests that are compatible with the approved runtime;
  - inspect the final contribution diff against the merge parent for unexplained authored changes;
  - record findings and a clear pass/fail preservation conclusion.
- **Affected areas:** Evidence under `docs/research/phase-10/`; merge-preservation corrections only if strictly required and documented.
- **Explicit exclusions:** Formatter migration, public-doc rewrites, TypeDoc integration, new functionality, broad source fixes.
- **Automated acceptance gate:**
  - automated public-export comparison reports no unexplained removal;
  - package target checks succeed;
  - targeted existing CSAPI tests and typecheck exit 0;
  - upstream-change comparison reports no unexplained reversion;
  - changed-file audit contains no unrelated authored source change.
- **Deliverable:** Committed and pushed preservation-audit report and any strictly necessary documented merge-preservation correction.
- **Closing evidence:** Commit SHA, commands/results, export inventory, reversion report, files, deviations or `none`.

## 5. Phase B — Workbench Tooling and Prettier 3

### Task B1 — Align Workbench QA and Formatting Boundaries

- **GitHub issue:** [#192](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/192).
- **Objective:** Make current upstream QA runnable on `phase-10` without formatting historical workbench-only records.
- **Acceptance criteria advanced:** P10-B1, P10-B2, P10-B4.
- **Dependencies:** A3.
- **Complexity/risk:** Low; workbench operational configuration.
- **Locked decisions:** Node.js 24 and Ubuntu are authoritative; no package dependency divergence; workbench-only differences do not flow to delivery.
- **Expected work:**
  - reconcile `.github/workflows/qa.yml` with current upstream Node.js 24 actions and commands;
  - replace stale workbench branch triggering with `phase-10` and retain `workflow_dispatch` if needed;
  - preserve current upstream pull-request triggering;
  - preserve upstream `.prettierignore` entries and add workbench-only ignores for `docs/` and `.tmp/`;
  - verify that new Phase 10 planning documents are checked explicitly despite the workbench docs ignore;
  - record these paths as workbench-only delivery exclusions.
- **Affected areas:** `.github/workflows/qa.yml`, `.prettierignore`, possibly a Phase 10 evidence note.
- **Explicit exclusions:** Dependency changes beyond upstream, source formatting, source/test edits, delivery workflow changes, historical docs rewrites.
- **Automated acceptance gate:**
  - workflow YAML parses successfully;
  - workflow contains Node.js 24, `phase-10`, `workflow_dispatch`, and current pull-request triggers;
  - ignore rules contain current upstream entries plus `docs/` and `.tmp/`;
  - explicit Prettier 3 checks pass for all new Phase 10 planning documents.
- **Deliverable:** One pushed workbench operational-configuration commit.
- **Closing evidence:** Commit SHA, parsed workflow evidence, explicit document-format results, files, deviations or `none`.

### Task B2 — Apply the Mechanical Prettier 3 Migration

- **GitHub issue:** [#193](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/193).
- **Objective:** Reformat the exact contribution-relevant file population required by current upstream Prettier 3 without semantic edits.
- **Acceptance criteria advanced:** P10-B1, P10-B2, P10-B3.
- **Dependencies:** B1.
- **Complexity/risk:** Medium; large but mechanical diff.
- **Locked decisions:** Inventory before writing; format only contribution-relevant paths; keep formatter-only work separate; do not restore Prettier 2 behavior.
- **Expected work:**
  - install lockfile-resolved dependencies under Node.js 24;
  - derive and record the exact `--list-different` population using local line-ending-safe diagnosis when necessary;
  - review that inventory for historical/workbench-only or generated paths;
  - run Prettier write only on the accepted explicit paths;
  - inspect the diff for mechanical-only changes;
  - run targeted formatting, typecheck, lint, and CSAPI test gates;
  - commit and push the formatter-only result.
- **Affected areas:** The machine-derived CSAPI/source/test/fixture/public-doc file set; no historical `docs/` content.
- **Explicit exclusions:** Authored documentation correction, refactoring, renaming, logic changes, generated files, audit remediation.
- **Automated acceptance gate:**
  - `npm run format:check` exits 0 in a clean Linux checkout;
  - `npm run typecheck`, `npm run lint`, existing CSAPI browser tests, and existing CSAPI node tests exit 0;
  - a semantic-diff review reports formatting only;
  - `git diff --check` exits 0.
- **Deliverable:** One pushed mechanical Prettier 3 migration commit plus its exact file inventory.
- **Closing evidence:** Commit SHA, formatter version, inventory, gate results, files, deviations or `none`.

## 6. Phase C — Public Documentation Correction

### Task C1 — Correct Stale Public CSAPI Usage

- **GitHub issue:** [#194](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/194).
- **Objective:** Make every current public CSAPI example describe the real endpoint facade, method spelling, advanced factory signature, and supported package subpath.
- **Acceptance criteria advanced:** P10-C1, P10-C2, P10-C3.
- **Dependencies:** B2.
- **Complexity/risk:** Medium; authored public documentation with no behavior change.
- **Locked decisions:** Preferred usage is `endpoint.csapi(collectionId)`; advanced factory is `createCSAPIBuilder(collection, resourceUrls)`; method is `getDatastreams()`; no nested SensorML package export.
- **Expected work:**
  - preserve current upstream README additions while correcting its CSAPI section;
  - correct stale examples and comments in the known endpoint and CSAPI files;
  - replace invalid `@camptocamp/ogc-client/csapi/formats/sensorml` public imports with symbols actually exported by `/csapi`;
  - distinguish the preferred facade from the advanced factory without redesigning either;
  - search all current public README/source examples for obsolete usage;
  - format, typecheck, and run affected tests.
- **Affected areas:** `README.md`, `src/ogc-api/endpoint.ts`, `src/ogc-api/csapi/index.ts`, `src/ogc-api/csapi/url_builder.ts`, and relevant SensorML public documentation comments.
- **Explicit exclusions:** Dynamic-import changes, new package exports, root bulk exports, parser behavior changes, historical docs, server testing.
- **Automated acceptance gate:**
  - obsolete-use search over `README.md` and `src/` returns zero matches;
  - positive-use search finds `endpoint.csapi(...)`, `getDatastreams(...)`, and the public `/csapi` import where appropriate;
  - `npm run format:check`, `npm run typecheck`, and affected existing tests exit 0;
  - reviewed diff contains documentation-only authored changes beyond prior formatter output.
- **Deliverable:** One pushed public-documentation correction commit.
- **Closing evidence:** Commit SHA, negative and positive search output, gates, files, deviations or `none`.

## 7. Phase D — CSAPI API-Reference Integration

### Task D1 — Add the CSAPI Entry Point to TypeDoc and VitePress

- **GitHub issue:** [#195](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/195).
- **Objective:** Render the existing public CSAPI subpath in the current API-reference page with its correct consumer import path.
- **Acceptance criteria advanced:** P10-C3, P10-C4, P10-C5, P10-C6.
- **Dependencies:** C1.
- **Complexity/risk:** Medium; documentation-pipeline integration.
- **Locked decisions:** One TypeDoc JSON and one API page; two TypeDoc entry points; per-module import-path mapping; no CSAPI root bulk exports; no internal export expansion.
- **Expected work:**
  - add `src/ogc-api/csapi/index.ts` to the existing `docs:api` TypeDoc command;
  - update `app/api.data.js` to process root and CSAPI modules with `@camptocamp/ogc-client` and `@camptocamp/ogc-client/csapi` respectively;
  - pass the import path into existing class/function processors while preserving sorting and page structure;
  - correct CSAPI-attributable unresolved documentation links using public links or code/plain text as appropriate;
  - capture the upstream root-only warning baseline and distinguish it from CSAPI-added warnings;
  - generate API data, build VitePress, and inspect representative rendered output;
  - confirm `src/index.ts` did not gain bulk CSAPI exports.
- **Affected areas:** `package.json`, lockfile only if metadata requires it, `app/api.data.js`, and the listed CSAPI documentation-comment locations.
- **Explicit exclusions:** Second API site/page/JSON, root export expansion, internal helper exports, unrelated upstream warning fixes, VitePress redesign.
- **Automated acceptance gate:**
  - `npm run docs:api` and `npm run docs:build` exit 0;
  - generated data/output contains `CSAPIQueryBuilder`, `createCSAPIBuilder`, `parseDatastream`, and `@camptocamp/ogc-client/csapi`;
  - root entries still display `@camptocamp/ogc-client`;
  - no unexplained CSAPI-attributable TypeDoc warning remains;
  - root-export comparison reports no CSAPI bulk export;
  - formatter, typecheck, lint, and affected tests exit 0.
- **Deliverable:** One pushed documentation-pipeline integration commit.
- **Closing evidence:** Commit SHA, docs commands/results, representative output search, warning comparison, root-export check, files, deviations or `none`.

## 8. Phase E — Final Workbench Verification

### Task E1 — Run Full Repository and Documentation QA

- **GitHub issue:** [#196](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/196).
- **Objective:** Prove the completed workbench tree passes every repository and documentation gate under the approved runtime.
- **Acceptance criteria advanced:** P10-A3, P10-A5, P10-B2, P10-B4, P10-C6, P10-D1, P10-D2, P10-D3, P10-D4, P10-D7.
- **Dependencies:** D1.
- **Complexity/risk:** Medium; verification-only unless a failure is returned to its owning task.
- **Locked decisions:** Node.js 24 on clean Ubuntu is authoritative; no live server; no opportunistic fixes; browser infrastructure exceptions require baseline evidence and owner disposition.
- **Expected work:**
  - begin from a clean checkout of the pushed workbench tip;
  - record Node.js/npm versions and run `npm ci`;
  - run repository formatting, typecheck, lint, browser tests, node tests, docs build, and `git diff --check`;
  - confirm all tests are fixture/repository-local and no gate contacts a live third-party server;
  - preserve exact command, exit-code, duration, and CI-run evidence;
  - return any failure to the Roadmap task that owns the affected change rather than editing source here.
- **Affected areas:** Verification evidence only; no intended source change.
- **Explicit exclusions:** Source repair, dependency remediation, live testing, delivery mutation.
- **Automated acceptance gate:**
  - `npm ci`, `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run test:browser`, `npm run test:node`, `npm run docs:build`, and `git diff --check` all exit 0 under Node.js 24;
  - the GitHub Actions workbench run succeeds;
  - live-server gate audit reports zero such dependencies.
- **Deliverable:** Committed and pushed QA evidence or an evidence-only issue result linked to the successful immutable commit and CI run.
- **Closing evidence:** Verified commit SHA, runtime, every command/result, CI URL, live-server audit, deviations or `none`.

### Task E2 — Prove the Production Package and Clean-Consumer Imports

- **GitHub issue:** [#197](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/197).
- **Objective:** Demonstrate that the production artifact contains and resolves both the root and CSAPI JavaScript/declaration entry points.
- **Acceptance criteria advanced:** P10-A4, P10-D5, P10-D6, P10-D7.
- **Dependencies:** E1.
- **Complexity/risk:** Medium; build and disposable-consumer verification.
- **Locked decisions:** Use Node.js 24 with a POSIX shell; no live requests; use an ignored `.tmp/` consumer; do not commit generated packages or dependency trees.
- **Expected work:**
  - run the production build from a clean dependency installation;
  - run `npm pack --dry-run --json` and record the file inventory;
  - create a disposable minimal consumer under `.tmp/`;
  - pack/install the library tarball;
  - verify JavaScript imports and TypeScript declarations from both package paths using representative public symbols;
  - compare export targets with actual packed files;
  - remove the disposable consumer and tarball after evidence capture.
- **Affected areas:** Ignored `.tmp/` artifacts and verification evidence only; no intended source change.
- **Explicit exclusions:** Network API calls, publishing, package metadata redesign, audit remediation, committed generated artifacts.
- **Automated acceptance gate:**
  - `npm run build` exits 0;
  - package inventory contains root and CSAPI JavaScript/declaration targets;
  - fresh-consumer runtime and TypeScript checks exit 0 for both `@camptocamp/ogc-client` and `@camptocamp/ogc-client/csapi`;
  - final repository status contains no generated or temporary artifact.
- **Deliverable:** Committed and pushed package-proof evidence or an evidence-only issue result linked to the verified immutable commit.
- **Closing evidence:** Verified commit SHA, build/pack/consumer commands and results, package inventory, cleanup result, deviations or `none`.

## 9. Phase F — Curated Delivery and PR Refresh

### Task F1 — Generate the Reviewed Delivery Manifest and Patch

- **GitHub issue:** [#198](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/198).
- **Objective:** Produce a binary-safe patch containing only accepted contribution-bearing Phase 10 content.
- **Acceptance criteria advanced:** P10-E1, P10-E2.
- **Dependencies:** E2.
- **Complexity/risk:** Medium; delivery-boundary definition with no delivery mutation.
- **Locked decisions:** Diff from the workbench upstream-sync commit; explicit path manifest; exclude all workbench-only records/configuration; do not modify `clean-pr`.
- **Expected work:**
  - identify and record the A2 upstream-sync commit and accepted Phase 10 tip;
  - generate the exact changed-file population between those points;
  - classify every path as contribution-bearing, upstream synchronization, workbench-only, generated, or unexpected;
  - stop on any unexpected path;
  - write the reviewed contribution-bearing manifest;
  - generate a binary-safe `.tmp/phase-10-delivery.patch` limited to that manifest;
  - inspect patch statistics and content for scope.
- **Affected areas:** Delivery manifest/evidence under workbench docs and ignored `.tmp/phase-10-delivery.patch`.
- **Explicit exclusions:** Delivery checkout mutation, push, PR update, inclusion of planning/research/governance/issues/workbench workflow differences.
- **Automated acceptance gate:**
  - every post-sync changed path has exactly one classification;
  - manifest contains only approved contribution-bearing paths;
  - prohibited workbench-only path search returns zero manifest matches;
  - patch applies cleanly in a disposable tree based on the same upstream SHA;
  - patch reverse/check and diff statistics are recorded.
- **Deliverable:** Committed and pushed delivery manifest/evidence plus an ignored reproducible patch artifact.
- **Closing evidence:** Commit SHA, sync/tip SHAs, manifest, classifications, patch checks, deviations or `none`.

### Task F2 — Prepare and Verify `clean-pr` Locally

- **GitHub issue:** [#199](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/199).
- **Objective:** Construct the reviewer-facing delivery locally and prove it matches the verified workbench before any remote change.
- **Acceptance criteria advanced:** P10-A4, P10-E2, P10-E3.
- **Dependencies:** F1.
- **Complexity/risk:** High; local delivery-repository mutation, still reversible before push.
- **Locked decisions:** Use the same upstream SHA; normal merge; apply only the F1 patch; one curated Phase 10 contribution commit; no force-push.
- **Expected work:**
  - inspect and record clean delivery-repository status, branch, remotes, and current PR head;
  - fetch origin/upstream and verify expected ancestry;
  - merge the same A1-recorded upstream SHA into local `clean-pr`;
  - stop if conflicts differ from the reviewed forecast;
  - apply the F1 patch and compare staged paths with the manifest;
  - commit the contribution as one curated Phase 10 commit distinct from upstream history;
  - compare every manifest path against the verified workbench tip;
  - confirm no workbench-only path entered delivery;
  - run full QA, docs, build, and package checks on the local delivery tree;
  - do not push.
- **Affected areas:** Local `OS4CSAPI/ogc-client:clean-pr` only, limited to upstream integration and the F1 manifest.
- **Explicit exclusions:** Push, PR metadata change, force-push, new source work, workbench artifacts.
- **Automated acceptance gate:**
  - delivery log shows the recorded upstream integration plus one Phase 10 contribution commit;
  - manifest path comparison with workbench reports zero differences;
  - prohibited-path audit reports zero workbench-only files;
  - full QA, docs build, production build, and package proof succeed;
  - `git status` is clean and local branch is intentionally ahead of remote.
- **Deliverable:** A fully verified local `clean-pr` ready for one normal push.
- **Closing evidence:** Local commit SHAs, manifest comparison, prohibited-path audit, all gates, files, deviations or `none`; keep issue open for dependent F3 traceability if issue policy requires.

### Task F3 — Push Delivery, Refresh PR #136, and Verify Checks

- **GitHub issue:** [#200](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/200).
- **Objective:** Publish the verified local delivery, make PR #136 accurately describe Phase 10, and confirm the required remote checks.
- **Acceptance criteria advanced:** P10-E4, P10-E5.
- **Dependencies:** F2 and explicit confirmation that its local delivery evidence passed.
- **Complexity/risk:** High; reviewer-visible remote mutation.
- **Locked decisions:** Normal push only; existing base/head remain `camptocamp:main` and `OS4CSAPI:clean-pr`; no new maintainer question or dynamic-facade proposal.
- **Expected work:**
  - reverify local delivery SHA, clean status, remote target, and expected ahead count;
  - push `clean-pr` normally to `OS4CSAPI/ogc-client`;
  - verify PR #136 still has the expected base and head;
  - update the PR description with current upstream synchronization, real consumer APIs, CSAPI docs integration, scope limits, and exact verification results;
  - search PR text for obsolete factory and `getDataStreams()` usage;
  - monitor required checks to completion;
  - record the final PR URL, head SHA, checks, and delivery summary.
- **Affected areas:** Remote `clean-pr` and PR #136 metadata only.
- **Explicit exclusions:** Force-push, new commits after push without returning to the owning task, maintainer questions, live-server claims, unrelated PR edits.
- **Automated acceptance gate:**
  - remote `clean-pr` resolves to the F2-verified head;
  - PR metadata reports base `camptocamp:main` and head `OS4CSAPI:clean-pr`;
  - PR description contains current endpoint facade, advanced-factory role, CSAPI subpath/docs integration, upstream SHA, and gate summary;
  - obsolete-usage search over PR text returns zero matches;
  - all required PR checks complete successfully.
- **Deliverable:** Refreshed PR #136 at the verified Phase 10 delivery head with successful checks.
- **Closing evidence:** Remote head SHA, PR URL, description verification, check URLs/results, changed remote state, deviations or `none`.

## 10. Roadmap Summary

| Phase     |  Tasks | Primary outcome                                                     | Remote mutation                               |
| --------- | -----: | ------------------------------------------------------------------- | --------------------------------------------- |
| A         |      3 | Locked upstream baseline, integrated workbench, preservation proof  | Workbench push only                           |
| B         |      2 | Current workbench QA boundaries and mechanical Prettier 3 migration | Workbench push only                           |
| C         |      1 | Accurate public CSAPI examples and imports                          | Workbench push only                           |
| D         |      1 | CSAPI subpath included in the current API-reference site            | Workbench push only                           |
| E         |      2 | Full QA plus production-package and clean-consumer proof            | Workbench evidence only                       |
| F         |      3 | Curated patch, locally verified delivery, refreshed PR #136         | F3 only changes reviewer-visible remote state |
| **Total** | **12** | **Complete Phase 10 execution and delivery**                        | **One bounded remote-delivery task**          |

## 11. Acceptance-Criteria Coverage

| Criterion | Roadmap task(s) |
| --------- | --------------- |
| P10-A1    | A1, A2          |
| P10-A2    | A1, A2, A3      |
| P10-A3    | A3, E1          |
| P10-A4    | A2, A3, E2, F2  |
| P10-A5    | A2, A3, E1      |
| P10-B1    | B1, B2          |
| P10-B2    | B1, B2, E1      |
| P10-B3    | B2              |
| P10-B4    | B1, E1          |
| P10-C1    | C1              |
| P10-C2    | C1              |
| P10-C3    | C1, D1          |
| P10-C4    | D1              |
| P10-C5    | D1              |
| P10-C6    | D1, E1          |
| P10-D1    | E1              |
| P10-D2    | E1              |
| P10-D3    | E1              |
| P10-D4    | E1              |
| P10-D5    | E2              |
| P10-D6    | E2              |
| P10-D7    | E1, E2          |
| P10-E1    | F1              |
| P10-E2    | F1, F2          |
| P10-E3    | F2              |
| P10-E4    | F3              |
| P10-E5    | F3              |

Coverage is intentionally redundant at preservation and final-verification boundaries. No task exists without a mapped approved criterion.

## 12. Granularity Review

| Task | One bounded objective                     | Independent pass/fail gate | Natural risk boundary                | One coherent session |
| ---- | ----------------------------------------- | -------------------------- | ------------------------------------ | -------------------- |
| A1   | Lock merge input and forecast             | Yes                        | Read-only before integration         | Yes                  |
| A2   | Perform reviewed upstream merge           | Yes                        | Foundational Git mutation            | Yes                  |
| A3   | Prove preservation                        | Yes                        | Evidence before maintenance          | Yes                  |
| B1   | Configure workbench execution boundary    | Yes                        | Workbench-only operations            | Yes                  |
| B2   | Apply mechanical formatter migration      | Yes                        | Formatting isolated from authorship  | Yes                  |
| C1   | Correct consumer-facing documentation     | Yes                        | Authored docs isolated from pipeline | Yes                  |
| D1   | Integrate API-reference entry point       | Yes                        | Documentation architecture           | Yes                  |
| E1   | Run full repository/docs QA               | Yes                        | Verification without source edits    | Yes                  |
| E2   | Prove distributable package               | Yes                        | Artifact boundary                    | Yes                  |
| F1   | Define and generate delivery content      | Yes                        | Workbench-to-delivery boundary       | Yes                  |
| F2   | Construct delivery without publishing     | Yes                        | Reversible local delivery            | Yes                  |
| F3   | Publish and update reviewer-visible state | Yes                        | Remote mutation                      | Yes                  |

No unit contains multiple independent design choices. Code and inseparable validation remain together. The higher-risk transition from local proof to remote publication is explicitly split between F2 and F3.

## 13. GitHub Issue Generation Rules

After Roadmap approval:

1. Create exactly 12 issues, one for each task A1 through F3.
2. Preserve the task ID and title verbatim.
3. Copy the objective, mapped criteria, dependencies, locked decisions, expected work, affected areas, exclusions, automated gate, deliverable, and closing-evidence requirements.
4. Add the Phase 10 label and task-specific labels only if they already exist or are separately approved.
5. Do not create wrapper, umbrella, duplicate, or speculative issues.
6. After creation, audit both directions:
   - every Roadmap task has exactly one issue;
   - every Phase 10 execution issue maps to exactly one Roadmap task.
7. Add issue links to this Roadmap in a separate post-creation documentation commit.
8. Begin A1 only after issue creation and mapping audit are complete.

## 14. Approval Record

The project owner approved this Roadmap on August 27, 2026. Version 1.0 is the authoritative Phase 10 execution sequence and authorizes creating exactly 12 corresponding GitHub issues.

Approval does not authorize implementation, upstream integration, formatter writes, delivery-branch modification, or PR updates. Each action becomes authorized only through its dependency-ready GitHub issue.
