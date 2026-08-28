# Phase 10 Addendum AD01: Post-Delivery Upstream Advance — Implementation Guide

- **Version:** 0.1
- **Status:** Draft — awaiting project-owner approval
- **Date:** August 28, 2026
- **Branch:** `phase-10`
- **Authority:** Derived from the approved [AD01 Contribution Goal and Definition](./P10-AD01-contribution-goal-and-definition.md)
- **Supporting evidence:** [Post-Delivery Upstream Advance Preflight](../../../../research/phase-10/05-post-delivery-upstream-advance-preflight.md)
- **Original technical plan:** [Phase 10 Implementation Guide](../../P10-implementation-guide.md)

---

## 1. Purpose and Authority

This guide translates the approved AD01 scope into the technical procedure for advancing the completed Phase 10 contribution to upstream commit `00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d`. It governs baseline validation, workbench integration, conflict resolution, preservation auditing, verification, and preparation for resuming existing delivery issue #200.

The approved original Phase 10 Implementation Guide remains in force. This addendum supplies only the changed procedure required by upstream PR #171. Where the two guides differ for this later integration, this addendum controls. It does not authorize implementation until an approved Roadmap Addendum has been converted into GitHub issues.

The authority chain is:

```text
Approved P10 Contribution Goal and Definition
        ↓
Approved P10 Implementation Guide
        ↓
Approved AD01 Contribution Goal and Definition
        ↓
Approved AD01 Implementation Guide
        ↓
Approved AD01 Roadmap
        ↓
One GitHub issue per new execution unit
        ↓
Implementation and verification
        ↓
Resume existing issue #200 for final publication
```

Approval of this guide will authorize drafting the Roadmap Addendum only. It will not authorize a merge, source edit, GitHub issue, delivery-branch change, or PR update.

## 2. Executive Technical Decision

AD01 will use the existing two-repository workflow and normal Git history:

1. Revalidate and lock exactly `camptocamp/ogc-client@00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d`.
2. Merge that commit normally into workbench `phase-10` without rebasing or force-pushing.
3. Resolve the three forecast content conflicts by combining the already-delivered CSAPI behavior with upstream PR #171's new API and documentation behavior.
4. Inspect the automatic `src/index.ts` merge and make the one required semantic type adaptation in `src/ogc-api/model.ts` so upstream's new `OgcApiCollectionCapabilities` interface can represent the existing CSAPI capability flag.
5. Prove preservation across all 29 upstream PR #171 paths, the CSAPI public surface, documentation, package entry points, tests, builds, and packed-consumer imports.
6. Prepare a local delivery merge that takes its conflict-resolution files directly from the accepted workbench commit, prove workbench/delivery parity, and stop before publication.
7. Resume existing issue #200 for the normal push to `clean-pr`, PR mergeability verification, and available GitHub checks.

No new CSAPI behavior, facade redesign, live-server test, or maintainer design question is introduced.

## 3. Locked Inputs and Forecast

| Input | Locked value |
| --- | --- |
| Prior approved upstream baseline and merge base | `305e3da2cf86cfda5c3254a0be419db70cce54b0` |
| AD01 upstream baseline | `00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d` |
| Upstream change source | PR #171: seven content commits plus one merge commit |
| Delivered PR head before AD01 | `5f7cbd166143be76b60ea54593d6f313c75c3624` |
| Upstream-only distance at preflight | 8 commits |
| Upstream PR #171 changed paths | 29: 23 modified, 3 added, 3 deleted |
| Forecast content conflicts | `app/api.data.js`, `src/ogc-api/endpoint.ts`, `src/ogc-api/info.ts` |
| Mandatory automatic-merge inspection | `src/index.ts` |
| Required semantic companion path | `src/ogc-api/model.ts` |
| Approved runtime | Node.js 24, matching current upstream QA |

The companion change to `src/ogc-api/model.ts` is required because upstream PR #171 replaces the inline `allCollections` result type with `OgcApiCollectionCapabilities`. The accepted CSAPI contribution adds `hasConnectedSystems` to those results. The combined type must therefore declare `hasConnectedSystems?: boolean`; omitting it would discard the public typing for existing behavior or fail type checking when `parseCollections()` sets that property.

## 4. Baseline Revalidation and Stop Rule

Before any source mutation, fetch both remotes and record exact refs:

```bash
git fetch origin
git fetch upstream
git status --short --branch
git rev-parse HEAD
git rev-parse origin/phase-10
git rev-parse upstream/main
git merge-base phase-10 upstream/main
git rev-list --left-right --count phase-10...upstream/main
git diff --name-status \
  305e3da2cf86cfda5c3254a0be419db70cce54b0 \
  00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d
git merge-tree --write-tree --messages \
  phase-10 \
  00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d
```

The execution unit may proceed only when:

- `HEAD` equals `origin/phase-10` and the worktree is clean;
- the locked commit exists and remains the reviewed target;
- the 29-path inventory matches the preflight record;
- the forecast reports exactly the three reviewed content conflicts; and
- `src/index.ts` remains the only forecast automatic merge among the four contribution-overlap paths.

If `upstream/main` has advanced beyond the locked commit, do not silently change the target. Record the newer ref, continue using the locked commit only if it remains available and the approved Roadmap says to do so, and stop for project-owner reassessment if the PR base relationship would make the locked result immediately stale.

## 5. Workbench Integration Procedure

### 5.1 Start the merge

Merge only the locked upstream commit:

```bash
git merge --no-ff 00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d
```

Do not use `ours` or `theirs` across an entire conflicted file. Each conflict contains independent approved behavior from both sides.

### 5.2 Resolve `app/api.data.js`

Combine upstream's API-rendering improvements with the Phase 10 entry-point mapping:

- keep upstream recognition of accessor and property reflections;
- keep upstream separation and display of static methods;
- keep upstream handling for classes without constructors;
- keep upstream property-type fallback through `property.getSignature?.type ?? property.type`;
- retain `importPath` as an argument to class and function processing;
- pass `importPath` through constructors, instance methods, and static methods;
- retain the root and CSAPI TypeDoc module list;
- render root imports from `@camptocamp/ogc-client` and CSAPI imports from `@camptocamp/ogc-client/csapi`; and
- retain deterministic sorting of combined classes, functions, and types.

The resolved loader must support the upstream component expectation for `staticMethods` and must not hardcode the root package inside `processClass()` or `processFunction()`.

### 5.3 Resolve `src/ogc-api/endpoint.ts`

Preserve all upstream PR #171 endpoint changes:

- use `OgcApiCollectionCapabilities[]` for `allCollections`;
- use `OgcApiGetCollectionItemsUrlOptions` for item URL options;
- retain upstream's current model imports and documentation improvements; and
- retain the current `EndpointError` and shared-model import structure.

Also preserve the delivered CSAPI contribution:

- `checkHasConnectedSystems` import and `hasConnectedSystems` getter;
- `csapiCollections` getter;
- type-only `CSAPIQueryBuilder` and `CSAPICollectionRef` imports;
- `csapi(collectionId)` behavior and error handling;
- both dynamic imports of `./csapi/factory.js` and `./csapi/helpers.js`; and
- the root/subpath dependency boundary described by the existing documentation.

Do not convert either CSAPI dynamic import into a static runtime import.

### 5.4 Resolve `src/ogc-api/info.ts` and adapt `src/ogc-api/model.ts`

In `src/ogc-api/info.ts`:

- use upstream's `OgcApiCollectionCapabilities` import and return type for `parseCollections()`;
- preserve the CSAPI Part 1 and Part 2 conformance prefixes;
- preserve `checkHasConnectedSystems()`;
- preserve detection of `ogc-cs:*` collection links; and
- set `result.hasConnectedSystems = true` only under the established CSAPI-link condition.

In `src/ogc-api/model.ts`, add the optional property below to upstream's `OgcApiCollectionCapabilities` interface:

```ts
hasConnectedSystems?: boolean;
```

Do not create a second capability interface or revert upstream's consolidation into the shared model.

### 5.5 Inspect `src/index.ts`

The automatic result must retain:

- upstream's `expandTimeInterval` export;
- upstream's WMS dimension types;
- upstream's `LayerDimension` and `WmtsRequestEncoding` types;
- the existing `DateTimeParameter` root type export; and
- no bulk export from `./ogc-api/csapi/index.js`.

No authored change is expected unless the actual automatic result fails one of these assertions.

### 5.6 Complete the merge

Before committing, verify there are no unmerged paths and inspect the staged merge diff. The merge commit may contain the three conflict resolutions and the required `src/ogc-api/model.ts` semantic companion change. It must not contain unrelated cleanup.

Commit the normal merge and push `phase-10` without force only after its issue-specific gates pass.

## 6. Focused Preservation Gates

Run focused checks under Node.js 24 before broad QA:

```bash
npm ci
npm run typecheck
npx jest --runInBand src/ogc-api/info.spec.ts src/ogc-api/endpoint.spec.ts
npm run docs:api
npm run docs:build
git diff --check
```

Inspect generated API data or rendered output for representative elements and imports:

- `CSAPIQueryBuilder`;
- `createCSAPIBuilder`;
- `parseDatastream`;
- `@camptocamp/ogc-client/csapi` for CSAPI elements; and
- `@camptocamp/ogc-client` for root elements.

Use automated source assertions to confirm:

- `OgcApiCollectionCapabilities` includes `hasConnectedSystems?: boolean`;
- `src/index.ts` contains the reviewed upstream exports and `DateTimeParameter`;
- `src/index.ts` does not bulk-export CSAPI;
- `endpoint.csapi()` retains both dynamic imports;
- the package still exports `.` and `./csapi`; and
- obsolete CSAPI public examples remain absent.

## 7. Upstream and Contribution Audit

After the workbench merge, generate a preservation record rather than relying only on tests.

### 7.1 Upstream PR #171 inventory

Compare each of the 29 recorded upstream paths between the locked upstream commit and the merged workbench. Every difference must be classified as one of:

- an already-delivered CSAPI/Phase 10 overlay;
- one of the three reviewed conflict resolutions;
- the required `src/ogc-api/model.ts` capability-field adaptation; or
- an explained automatic coexistence result in `src/index.ts`.

Any other difference is a stop condition.

### 7.2 CSAPI preservation

Compare the pre-AD01 delivered state at `5f7cbd166143be76b60ea54593d6f313c75c3624` with the merged workbench for:

- normalized public exports from `src/ogc-api/csapi/index.ts`;
- the `./csapi` package export targets;
- `OgcApiEndpoint.csapi()`, `hasConnectedSystems`, and `csapiCollections`;
- the root/subpath export boundary;
- public README and TypeDoc import paths; and
- the existing CSAPI test population.

Upstream-required type coexistence is allowed; an unexplained CSAPI export removal or behavior change is not.

## 8. Full Verification Matrix

The accepted workbench commit must pass the original Phase 10 gates again under Node.js 24:

```bash
npm ci
npm run format:check
npm run typecheck
npm run lint
npm run test:node
npm run test:browser
npm run docs:build
npm run build
npm pack --dry-run --json
git diff --check
```

Then repeat the clean-consumer proof for both:

```ts
import { OgcApiEndpoint } from '@camptocamp/ogc-client';
import {
  CSAPIQueryBuilder,
  createCSAPIBuilder,
} from '@camptocamp/ogc-client/csapi';
```

The packed artifact must contain the existing JavaScript and declaration targets for both entry points. No verification step may contact a live third-party server.

The workbench GitHub Actions run for the accepted commit is authoritative for the repository's Linux QA workflow. Inherited audit notices, blocked optional install-script notices, and pre-existing upstream warnings remain informational unless they cause an approved gate to fail.

## 9. Local Delivery Preparation

Delivery preparation begins only after all new addendum implementation and verification issues are complete. It must end before a remote push so existing issue #200 retains final publication authority.

### 9.1 Entry checks

In `OS4CSAPI/ogc-client`:

1. fetch `origin` and canonical `upstream`;
2. confirm `clean-pr` is clean and equals `origin/clean-pr` at the recorded head;
3. confirm PR #136 still uses `clean-pr` against `camptocamp:main`;
4. record the accepted workbench SHA; and
5. fetch that exact workbench commit into a namespaced local ref without changing delivery remotes.

One acceptable fetch is:

```bash
git fetch https://github.com/OS4CSAPI/ogc-client-CSAPI_2.git \
  phase-10:refs/remotes/workbench/phase-10
```

### 9.2 Merge and transplant reviewed resolutions

Merge the same locked upstream commit normally:

```bash
git merge --no-ff 00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d
```

For the three expected conflicts, restore the exact accepted workbench blobs rather than independently re-authoring the resolutions:

```bash
git restore --source=refs/remotes/workbench/phase-10 -- \
  app/api.data.js \
  src/ogc-api/endpoint.ts \
  src/ogc-api/info.ts
git add \
  app/api.data.js \
  src/ogc-api/endpoint.ts \
  src/ogc-api/info.ts
```

Also restore and stage the accepted semantic companion file:

```bash
git restore --source=refs/remotes/workbench/phase-10 -- \
  src/ogc-api/model.ts
git add src/ogc-api/model.ts
```

Inspect `src/index.ts`; its automatic delivery merge must match the accepted workbench blob. Stop if the delivery conflict population differs, if another path needs authored resolution, or if any restored blob includes workbench-only content.

Commit the resulting local normal merge. Do not push it during the delivery-preparation issue.

### 9.3 Fidelity and QA before handoff

Generate the contribution-bearing manifest from the previously delivered tree and the accepted workbench tree. Exclude workbench-only planning, research, governance, issue-template, branch-trigger, ignore-rule, and temporary paths.

For every manifest path, compare the prepared delivery tree with the accepted workbench tree. Require zero differences. Additionally verify that every upstream PR #171 path not intentionally overlaid matches either the accepted workbench or the locked upstream blob as classified by the preservation audit.

Run the full applicable QA, documentation, build, packed-artifact, and clean-consumer gates in the prepared delivery tree. Record the local merge SHA, tree SHA, manifest, exact commands, results, and deviations or `none` for issue #200.

## 10. Resume Existing Issue #200

After local delivery preparation succeeds, issue #200 resumes with no new final-delivery issue. Its remaining procedure is:

1. revalidate that upstream `main` still points to the locked AD01 baseline;
2. confirm the prepared local `clean-pr` merge is clean, verified, and ahead of `origin/clean-pr` only by the reviewed local commit;
3. push `clean-pr` normally without force;
4. verify PR #136's base/head SHAs and mergeability;
5. verify that the existing PR description remains accurate, changing it only if the new baseline makes a factual statement stale;
6. monitor available GitHub checks and record maintainer-controlled workflow approval separately from technical failures; and
7. close #200 only after the pushed commit, PR state, check state, and deviations are recorded.

Do not post a new maintainer question. A factual notification is permitted only if needed to report that the already-described contribution has been synchronized again and verified; it must not request a design decision or duplicate the earlier planning-only status.

## 11. Commit and Evidence Discipline

Each new Roadmap execution unit must:

1. begin from a clean dependency-ready state;
2. change only its approved paths and evidence records;
3. run its attached automated gates;
4. review the actual changed-file list;
5. commit and push workbench `phase-10` normally;
6. record the commit, paths, command results, and deviations in its GitHub issue; and
7. close only after the remote commit and evidence exist.

The workbench merge is one integration commit. Preservation and verification records use later workbench commits. The prepared delivery merge remains local until issue #200 authorizes its normal push.

## 12. Stop Conditions

Stop the active execution unit and report to the project owner if:

- canonical upstream advances in a way that makes the locked baseline stale before delivery;
- the actual conflict set differs from the three reviewed conflicts;
- preserving CSAPI requires reversing unrelated PR #171 behavior;
- an existing CSAPI public export or tested behavior must be removed;
- `app/api.data.js` cannot support upstream static methods and per-entry-point imports together;
- upstream's capability model cannot represent `hasConnectedSystems` with the single optional field authorized here;
- `src/index.ts` gains bulk CSAPI exports or loses reviewed upstream exports;
- an unrelated source correction, refactor, dependency change, or formatter migration appears necessary;
- a gate requires a live third-party server;
- the accepted workbench and prepared delivery differ over the contribution manifest;
- final publication would require a force-push or history rewrite; or
- the PR remains conflict-blocked after the reviewed delivery merge.

Record unrelated findings separately. Do not expand the active issue to solve them.

## 13. Roadmap Addendum Requirements

After this guide is approved, the Roadmap Addendum must:

1. map every P10-AD01-A1 through P10-AD01-C4 criterion to at least one execution unit;
2. create no unit outside the approved addendum scope;
3. separate baseline validation, workbench integration/resolution, preservation audit, full verification, and local delivery preparation at their natural risk boundaries;
4. keep each unit suitable for one coherent prompt and AI iteration;
5. place inseparable resolution code and focused tests in the same unit;
6. give every unit one objective, dependencies, affected paths, exclusions, commands, acceptance gate, deliverable, and closing evidence;
7. require one new GitHub issue per new execution unit only after Roadmap approval;
8. end with an explicit dependency handoff to existing issue #200 rather than a duplicate publication issue;
9. require normal commits and pushes with no history rewriting; and
10. contain no live-server acceptance gate or new maintainer design question.

## 14. Approval Record

This version is a draft and has not yet been approved.

Project-owner approval will authorize drafting the Roadmap Addendum only. It will not authorize upstream integration, conflict resolution, source changes, GitHub issue creation, delivery-branch modification, force-pushing, or PR updates.
