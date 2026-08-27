# Phase 10: Upstream Synchronization and Documentation Maintenance — Implementation Guide

- **Version:** 1.0
- **Status:** Approved
- **Date:** August 27, 2026
- **Branch:** `phase-10`
- **Authority:** Derived from the approved [Phase 10 Contribution Goal and Definition](./P10-contribution-goal-and-definition.md)

---

## 1. Purpose and Authority

This guide defines how to implement the approved Phase 10 contribution. It translates the Contribution Goal and Definition into a technical approach, file-level actions, automated verification, Git procedure, and clean-delivery procedure.

This guide does not change the approved contribution scope. If implementation reveals a contradiction with the Contribution Goal and Definition, work stops and the upstream planning document is amended explicitly before implementation continues.

The planning authority chain remains:

```text
Project governance
        ↓
Approved P10 Contribution Goal and Definition
        ↓
Approved P10 Implementation Guide
        ↓
Approved P10 Roadmap
        ↓
One GitHub issue per Roadmap execution unit
        ↓
Implementation, verification, and closing evidence
```

Approval of this guide will authorize drafting the Roadmap. It will not by itself authorize source changes, upstream integration, GitHub issue creation, delivery-branch changes, or PR updates.

## 2. Executive Technical Decision

Phase 10 will preserve the existing CSAPI implementation and refresh its surroundings:

1. Merge one recorded current `upstream/main` commit into workbench `phase-10`.
2. Resolve the known deleted application lockfile in favor of current upstream and inspect every automatic merge.
3. Adopt current upstream Prettier 3 and toolchain behavior, isolating mechanical formatting from authored maintenance changes.
4. Correct stale CSAPI public examples without redesigning the endpoint facade or advanced factory.
5. Add the CSAPI subpath entry point to the existing TypeDoc input and teach the existing VitePress data loader to display the correct package import for each entry point.
6. Run repository-local QA, documentation, build, and packed-consumer gates under the current CI runtime.
7. Merge the same upstream commit into delivery `clean-pr`, then apply only the verified contribution-bearing Phase 10 files as one curated commit.

The dynamic-import facade remains unchanged. No live server is required. No new CSAPI behavior is introduced.

## 3. Observed Baseline

The following facts were established during pre-implementation analysis. They are planning evidence, not implementation results.

| Area                          | Observed state                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Workbench                     | `OS4CSAPI/ogc-client-CSAPI_2:phase-10`, created from Phase 9                                    |
| Delivery                      | `OS4CSAPI/ogc-client:clean-pr`, the head of upstream PR #136                                    |
| Canonical upstream            | `camptocamp/ogc-client:main`                                                                    |
| Recorded analysis tip         | `305e3da2cf86cfda5c3254a0be419db70cce54b0` on August 26, 2026                                   |
| Upstream distance at analysis | 83 upstream commits absent from the Phase 9 workbench baseline                                  |
| Workbench merge forecast      | One true conflict: upstream deleted `app/package-lock.json` while the workbench had modified it |
| Delivery merge forecast       | No textual conflicts when merging the recorded upstream tip into `clean-pr`                     |
| Current docs architecture     | Root TypeDoc JSON consumed by one VitePress API page                                            |
| Current package architecture  | Root entry point plus the existing `./csapi` subpath export                                     |
| Current CI runtime            | Node.js 24 on Ubuntu in current upstream                                                        |
| Local preflight runtime       | Unsupported Node.js 26 alpha; unsuitable as authoritative QA evidence                           |

Before implementation, fetch all remotes and record the exact chosen upstream commit. If `upstream/main` has advanced beyond the analyzed tip, rerun the merge forecast and update the Roadmap issue's evidence before merging. A changed tip does not authorize silently accepting new conflicts or scope.

## 4. Locked Implementation Principles

The following rules are mandatory throughout Phase 10:

1. Preserve the public API and behavior established through Phase 8.
2. Preserve `OgcApiEndpoint.csapi(...)` and its dynamic-import boundary.
3. Preserve the separate `@camptocamp/ogc-client/csapi` package entry point.
4. Do not bulk-export CSAPI from the package root to simplify documentation generation.
5. Treat `endpoint.csapi(collectionId)` as preferred consumer usage.
6. Document `createCSAPIBuilder(collection, resourceUrls)` only as the advanced value-shaped factory that already exists.
7. Do not call live third-party servers in an acceptance gate.
8. Do not repair OpenSensorHub, pygeoapi, or any other independent server.
9. Do not use formatter migration as permission for refactoring.
10. Do not fix unrelated upstream warnings, audit findings, or source defects.
11. Complete and verify work in the workbench before modifying `clean-pr`.
12. Do not copy workbench planning, research, governance, or issue records into the delivery repository.
13. Do not add a new design question for the upstream maintainer. The refreshed PR should present a finished, verified contribution.

## 5. Required Execution Environment

### 5.1 Authoritative environment

Full acceptance must run with:

- the Node.js major version used by current upstream CI, presently Node.js 24;
- the package-lock-resolved npm dependencies;
- a clean Linux checkout or equivalent POSIX shell for scripts that invoke `rm` and `find`;
- no untracked build output or previously installed dependency tree.

The workbench GitHub Actions run is the authoritative full-platform gate when the local Windows shell cannot execute the POSIX build script. The final PR checks provide the corresponding delivery evidence.

### 5.2 Local Windows use

Local Windows work may run compatible checks such as TypeScript, ESLint, Jest, and documentation generation. It must not substitute the unsupported preflight Node.js alpha runtime for the approved CI runtime.

Because the workstation uses Git line-ending conversion, local Prettier diagnosis may use:

```powershell
npx prettier --check --end-of-line auto <explicit-paths>
```

This is a diagnostic accommodation only. The committed files must pass the unmodified repository command in a clean Linux checkout:

```bash
npm run format:check
```

## 6. Workstream 1 — Integrate Current Upstream

### 6.1 Record and forecast the merge

From the workbench repository:

```bash
git fetch origin
git fetch upstream
git status --short --branch
git rev-parse upstream/main
git merge-base phase-10 upstream/main
git log --oneline --left-right phase-10...upstream/main
git merge-tree --write-tree --messages phase-10 upstream/main
```

Record:

- the exact upstream SHA;
- the merge base;
- upstream commit count since the merge base;
- predicted conflicts;
- a machine-generated upstream changed-file inventory.

The implementation issue must stop if the actual conflict set differs materially from the reviewed forecast.

### 6.2 Merge without rewriting history

Merge the recorded upstream SHA normally into `phase-10`. Do not rebase the historical workbench and do not force-push.

```bash
git merge --no-ff <recorded-upstream-sha>
```

For the forecast `app/package-lock.json` modify/delete conflict, accept current upstream's deletion:

```bash
git rm app/package-lock.json
```

This is required because current upstream moved documentation tooling and dependency ownership to the repository root. Restoring the obsolete application lockfile would reverse that architecture.

### 6.3 Inspect automatic merges

Do not treat a conflict-free automatic merge as semantic proof. Inspect at least:

- `.github/workflows/qa.yml`;
- `.prettierignore`;
- `README.md`;
- `package.json` and `package-lock.json`;
- `src/index.ts`;
- `src/ogc-api/endpoint.ts` and its tests;
- all CSAPI files touched by upstream or formatter migration.

Required outcomes:

- root package exports and current upstream import paths remain present;
- the `./csapi` export remains present;
- `sideEffects: false` remains present if required by the current combined tree;
- current upstream dependencies, Prettier version, TypeDoc, and VitePress remain present;
- no non-CSAPI upstream behavior is deliberately reversed;
- the Phase 8 CSAPI facade and public exports remain present.

The workbench QA workflow may retain a `phase-10` push trigger and `workflow_dispatch` so workbench commits can be verified. That operational difference is workbench-only. Delivery must inherit the current upstream workflow unless a contribution-bearing change is explicitly approved.

### 6.4 Establish preservation evidence

Generate and retain machine-readable comparisons for:

- upstream paths changed since the merge base;
- Phase 8 CSAPI public exports before and after the merge;
- final package export metadata;
- final Phase 10 contribution diff excluding the upstream merge.

Any unexplained public export removal, upstream reversion, or non-CSAPI source change is a stop condition.

## 7. Workstream 2 — Align Prettier 3 and Current Tooling

### 7.1 Use upstream configuration

Use the Prettier 3 dependency and formatting conventions supplied by the integrated upstream baseline. Do not restore Prettier 2, pin a divergent formatter, or add compatibility transforms.

The current workbench contains extensive historical documentation that is not part of the upstream contribution. Add workbench-only ignore coverage for `docs/` and `.tmp/` so a repository-wide formatter run does not rewrite project history or temporary proof artifacts. Validate each newly created Phase 10 planning document explicitly before committing it.

The workbench-only ignore additions must not be included in the clean delivery unless an ignored path is part of the upstream contribution.

### 7.2 Inventory before writing

After upstream integration and dependency installation:

```bash
npx prettier --list-different --end-of-line auto src fixtures README.md package.json app
```

Record the resulting file list. Preflight observed approximately 52 contribution-relevant source files, but the implementation must derive the exact list from the recorded upstream commit rather than treating that estimate as normative.

### 7.3 Isolate mechanical changes

Apply Prettier only to the inventoried contribution-relevant files. Commit mechanical formatter output separately from authored documentation or integration changes so reviewers can distinguish syntax-neutral churn from substantive maintenance.

Run:

```bash
npx prettier --write <inventoried-paths>
npx prettier --check <inventoried-paths>
git diff --check
```

Then use tests and build gates to demonstrate that the formatter-only commit introduced no semantic change.

## 8. Workstream 3 — Correct Public CSAPI Documentation

### 8.1 Preferred endpoint usage

Public examples should obtain a builder through the existing facade:

```ts
import { OgcApiEndpoint } from '@camptocamp/ogc-client';

const endpoint = new OgcApiEndpoint('https://example.test');
const csapi = await endpoint.csapi('weather-stations');
const datastreamsUrl = csapi.getDatastreams();
```

The exact endpoint construction must match the repository's current public API. The important locked relationships are:

- collection ID is supplied to `endpoint.csapi(...)`;
- the method spelling is `getDatastreams()`;
- symbols imported directly from the subpath use `@camptocamp/ogc-client/csapi`.

### 8.2 Advanced factory usage

Where the advanced factory is documented, show its real signature:

```ts
createCSAPIBuilder(collection, resourceUrls);
```

Here `collection` is a value-shaped `CSAPICollectionRef` and `resourceUrls` is the discovered `ReadonlyMap<string, string>`. Do not pass an endpoint instance and collection ID to this factory.

### 8.3 Known correction locations

Inspect and correct current public-facing examples in:

- `README.md`;
- `src/ogc-api/endpoint.ts`;
- `src/ogc-api/csapi/index.ts`;
- `src/ogc-api/csapi/url_builder.ts`;
- `src/ogc-api/csapi/formats/sensorml/index.ts`;
- `src/ogc-api/csapi/formats/sensorml/parser.ts`.

The SensorML documentation currently uses an unexported nested import path. Replace public nested imports such as `@camptocamp/ogc-client/csapi/formats/sensorml` with public symbols available from `@camptocamp/ogc-client/csapi`. Do not add a new nested package export or expand the public API merely to preserve a stale example.

### 8.4 Search gates

Search public source and README content, excluding explicitly historical workbench records:

```bash
rg -n "createCSAPIBuilder\(endpoint|createCSAPIBuilder\([^,]+, ['\"]|getDataStreams|csapi/formats/" README.md src
rg -n "endpoint\.csapi\(|getDatastreams\(|@camptocamp/ogc-client/csapi" README.md src
```

The obsolete-use search must return no public examples. The positive search must demonstrate the preferred facade, correct method spelling, and public CSAPI subpath.

## 9. Workstream 4 — Integrate CSAPI into TypeDoc and VitePress

### 9.1 Selected design

Keep one generated TypeDoc JSON file and one existing VitePress API page. Generate that JSON from both public package entry points:

```json
"docs:api": "typedoc ./src/index.ts ./src/ogc-api/csapi/index.ts --json app/data/api.json --pretty --excludePrivate"
```

Do not create a second documentation site, copy CSAPI exports into `src/index.ts`, or expose internal modules.

### 9.2 Data-loader change

Update `app/api.data.js` to process both top-level TypeDoc modules and associate each with its real consumer import path:

| TypeDoc module | Displayed import path          |
| -------------- | ------------------------------ |
| Root `index`   | `@camptocamp/ogc-client`       |
| CSAPI `csapi`  | `@camptocamp/ogc-client/csapi` |

Pass the selected import path into the existing class and function processing helpers rather than hardcoding the root package inside them. Preserve the current page structure and sorting behavior.

A disposable prototype verified that this design generates both root and CSAPI reflections and successfully builds the existing VitePress site. Representative generated output included `CSAPIQueryBuilder`, `createCSAPIBuilder`, and `parseDatastream` with the CSAPI subpath import.

### 9.3 TypeDoc warning discipline

Combined entry-point generation exposes stale CSAPI documentation links that root-only generation did not visit. Correct CSAPI-attributable unresolved links in documentation comments by using an accurate link when the target is public, or code/plain text when the target is internal.

Known inspection locations include:

- `src/ogc-api/csapi/index.ts`;
- `src/ogc-api/csapi/factory.ts`;
- `src/ogc-api/csapi/model.ts`;
- `src/ogc-api/csapi/url_builder.ts`;
- `src/ogc-api/csapi/formats/sensorml/parser.ts`;
- `src/ogc-api/csapi/formats/schema-response.ts`.

Do not export internal helpers simply to eliminate warnings. Record the upstream root-only warning baseline, then require no unexplained warning newly attributable to the CSAPI entry point. Pre-existing upstream warnings, including the VitePress JSON-import warning, remain out of scope.

### 9.4 Documentation gates

Run:

```bash
npm run docs:api
npm run docs:build
```

Then search generated API data and rendered output for:

- `CSAPIQueryBuilder`;
- `createCSAPIBuilder`;
- `parseDatastream`;
- `@camptocamp/ogc-client/csapi`.

Also verify that root API elements still display `@camptocamp/ogc-client` and that `src/index.ts` has not gained bulk CSAPI exports.

Generated documentation artifacts should not be committed unless current upstream already tracks them.

## 10. Workstream 5 — Automated QA, Build, and Package Proof

### 10.1 Repository gates

From a clean dependency installation under Node.js 24:

```bash
npm ci
npm run format:check
npm run typecheck
npm run lint
npm run test:node
npm run test:browser
npm run docs:build
npm run build
git diff --check
```

Do not run `npm audit fix` as part of Phase 10. Dependency audit findings inherited from upstream are not authorization for dependency remediation.

Browser-test infrastructure failure is not automatically waived. It requires reproducible evidence that the same failure occurs on the approved baseline and explicit project-owner disposition before delivery.

### 10.2 Package contents

After a successful production build:

```bash
npm pack --dry-run --json
```

Verify that the package includes at least:

- `dist/index.js`;
- `dist/index.d.ts`;
- `dist/ogc-api/csapi/index.js`;
- `dist/ogc-api/csapi/index.d.ts`.

Confirm that `package.json` exports both `.` and `./csapi`, with existing JavaScript and declaration targets that actually exist in the packed artifact.

### 10.3 Clean-consumer proof

Create an ignored disposable directory under `.tmp/`, pack the library, install the tarball into a fresh minimal consumer, and verify runtime and TypeScript imports from:

```ts
import { OgcApiEndpoint } from '@camptocamp/ogc-client';
import {
  CSAPIQueryBuilder,
  createCSAPIBuilder,
} from '@camptocamp/ogc-client/csapi';
```

The proof must not contact a network service. It only verifies package resolution, JavaScript loading, and declaration availability. Delete the disposable consumer after recording its commands and results.

## 11. File-Level Change Plan

The Roadmap must refine this table into bounded execution units after the guide is approved.

| Area                                                              | Expected action                                                                                        | Delivery classification                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `app/package-lock.json`                                           | Accept upstream deletion during merge                                                                  | Upstream synchronization                                   |
| `.github/workflows/qa.yml`                                        | Integrate upstream Node.js 24 workflow; permit workbench `phase-10` execution if needed                | Workbench operational difference unless otherwise approved |
| `.prettierignore`                                                 | Preserve upstream rules; ignore historical workbench docs and `.tmp/` in workbench                     | Workbench-only difference                                  |
| `package.json`                                                    | Preserve current upstream metadata; add the CSAPI TypeDoc entry point while retaining `./csapi` export | Contribution-bearing                                       |
| `package-lock.json`                                               | Result of current upstream and approved package-script metadata                                        | Contribution-bearing only if changed after sync            |
| `README.md`                                                       | Preserve current upstream standards and correct the CSAPI consumer example                             | Contribution-bearing                                       |
| `app/api.data.js`                                                 | Map root and CSAPI TypeDoc modules to their public import paths                                        | Contribution-bearing                                       |
| `src/ogc-api/endpoint.ts`                                         | Correct stale documentation only; preserve implementation                                              | Contribution-bearing                                       |
| `src/ogc-api/csapi/**/*.ts`                                       | Prettier 3 formatting and accurate public documentation/link corrections                               | Contribution-bearing                                       |
| Existing tests/fixtures                                           | Mechanical formatting only unless a narrowly required maintenance assertion is approved                | Contribution-bearing if changed                            |
| `docs/planning/**`, `docs/research/**`, governance, issue records | Retain Phase 10 workbench history                                                                      | Never deliver upstream                                     |
| `.github/ISSUE_TEMPLATE/**`, workbench `.gitignore`               | Retain workbench operation                                                                             | Never deliver upstream                                     |

No file is authorized merely because it appears in this table. Each change must map to an approved Roadmap unit and acceptance criterion.

## 12. Verification Matrix

| Criteria               | Required evidence                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| P10-A1                 | Recorded upstream SHA and successful `merge-base --is-ancestor` check                      |
| P10-A2, P10-A5         | Upstream changed-file inventory, merge-resolution record, and unexplained-reversion check  |
| P10-A3                 | CSAPI export comparison plus passing CSAPI and full test gates                             |
| P10-A4                 | Parsed package exports, packed-file inventory, and clean-consumer proof                    |
| P10-B1, P10-B2         | Lockfile-resolved Prettier 3 and clean-checkout `npm run format:check`                     |
| P10-B3                 | Separate formatter commit/diff plus behavioral QA                                          |
| P10-B4                 | Recorded Node.js 24 CI runtime and successful install/QA                                   |
| P10-C1, P10-C2, P10-C3 | Public-doc search gates and reviewed README/source examples                                |
| P10-C4                 | Generated API data/site contains representative CSAPI elements and correct subpath imports |
| P10-C5                 | Root export comparison shows no CSAPI bulk export                                          |
| P10-C6                 | Successful `npm run docs:build`                                                            |
| P10-D1                 | Successful `npm run typecheck`                                                             |
| P10-D2                 | Successful `npm run lint`                                                                  |
| P10-D3                 | Successful `npm run test:node`                                                             |
| P10-D4                 | Successful `npm run test:browser`, or approved baseline-supported exception                |
| P10-D5                 | Successful `npm run build`                                                                 |
| P10-D6                 | Package inventory and clean-consumer runtime/declaration imports                           |
| P10-D7                 | Roadmap and issue audit contains no live-server gate                                       |
| P10-E1                 | Generated contribution-bearing delivery manifest excludes workbench-only paths             |
| P10-E2                 | Delivery log shows upstream integration plus one Phase 10 contribution commit              |
| P10-E3                 | Zero-difference comparison over the delivery manifest                                      |
| P10-E4                 | Reviewed PR description contains current usage and verification summary                    |
| P10-E5                 | PR base/head metadata and successful required checks                                       |

## 13. Workbench Git Procedure

Each Roadmap issue must use the following procedure:

1. Confirm the issue is the next dependency-ready execution unit.
2. Review `AI_OPERATIONAL_CONSTRAINTS.md` and restate the single issue goal.
3. Start from a clean, current `phase-10` checkout.
4. Make only the issue's approved changes.
5. Run the issue-specific automated gate.
6. Review the actual changed-file list and diff for scope.
7. Commit with the issue/task ID.
8. Push `phase-10` without force.
9. Add a closing issue comment containing the commit SHA, changed files, exact gate results, and deviations or `none`.
10. Close the issue only after the pushed commit and evidence exist.

Use one integration commit for the upstream merge. Keep formatter-only changes mechanically identifiable. Keep each later authored Roadmap unit in its own reviewable workbench commit.

## 14. Clean Delivery Procedure

Delivery begins only after all implementation issues and final workbench verification are complete.

### 14.1 Build the delivery manifest

Identify the workbench upstream-sync commit and generate the exact contribution-bearing path list from that point to the accepted Phase 10 tip. Exclude:

- planning and research documents;
- governance and issue templates;
- workbench-only workflow triggers and ignore rules;
- temporary files and generated documentation/build output;
- verification logs that do not belong in the upstream repository.

Generate a binary-safe patch limited to the reviewed manifest. One acceptable pattern is:

```bash
git diff --binary --output=.tmp/phase-10-delivery.patch <workbench-sync-commit>..phase-10 -- <manifest-paths>
```

### 14.2 Synchronize delivery

In `OS4CSAPI/ogc-client:clean-pr`:

1. Fetch `origin` and canonical `upstream`.
2. Verify the checkout is clean and record the existing PR head.
3. Merge the same recorded upstream SHA used by the workbench with a normal merge.
4. Resolve only reviewed conflicts; stop if the forecast is no longer valid.
5. Apply the workbench-generated contribution patch.
6. Review the staged path list against the delivery manifest.
7. Commit the Phase 10 contribution as one curated commit distinct from upstream history.

Do not force-push unless the project owner separately authorizes history rewriting after reviewing the exact reason and recovery plan. The analyzed delivery graph supports a normal merge and push.

### 14.3 Prove fidelity before pushing

For every manifest path, compare delivery content to the verified workbench tip. The comparison must report zero differences. Also verify that no workbench-only path was added.

Run the full applicable QA, documentation, build, and package gates in the delivery tree. Push `clean-pr` normally only after local review succeeds.

### 14.4 Refresh PR #136

Update the existing PR description to state:

- that it is synchronized with the recorded current upstream baseline;
- the current endpoint-facade and advanced-factory usage;
- the CSAPI package subpath and API-reference integration;
- the automated Phase 10 verification results;
- the absence of new CSAPI feature or live-server scope.

Verify that the PR still targets `camptocamp:main` from `OS4CSAPI:clean-pr` and wait for required checks. Do not ask the upstream maintainer a new design question or request review until the refreshed contribution and evidence are complete.

## 15. Risks and Mitigations

| Risk                                           | Mitigation and stop rule                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Upstream advances after planning               | Record the implementation-day SHA and rerun merge forecasts; stop on materially changed conflicts |
| Automatic merge silently reverses upstream     | Compare upstream changed paths and inspect all semantically overlapping files                     |
| Prettier rewrites historical workbench records | Ignore `docs/` and `.tmp/` in the workbench; validate new planning docs explicitly                |
| CRLF produces false formatter failures         | Use `--end-of-line auto` only for local diagnosis; use clean Linux CI as canonical evidence       |
| Formatter churn hides behavior changes         | Separate formatter changes and require full behavioral gates                                      |
| Docs integration encourages root bulk exports  | Use two TypeDoc entry points and per-module import-path mapping                                   |
| TypeDoc warning cleanup expands public API     | Convert internal references to code/plain text instead of exporting internals                     |
| Local Windows shell cannot run build scripts   | Use Node.js 24 on Linux/Git Bash/WSL; make GitHub Actions authoritative                           |
| Browser test fails for infrastructure reasons  | Reproduce on approved baseline and obtain explicit owner disposition before delivery              |
| Audit output creates unrelated dependency work | Record if relevant; do not run `npm audit fix` in Phase 10                                        |
| Delivery includes workbench artifacts          | Use an explicit manifest, binary-safe patch, and zero-difference tree comparison                  |
| Delivery history becomes harder to review      | Normal upstream merge followed by one curated Phase 10 commit; no force-push by default           |
| New server incompatibility is discovered       | Record separately; do not absorb server repair or live testing into Phase 10                      |

## 16. Scope and Evidence Stop Conditions

Stop the active execution unit and report to the project owner if any of the following occurs:

- a merge conflict or upstream architectural change invalidates this guide;
- preserving CSAPI appears to require reversing unrelated upstream behavior;
- an existing Phase 8 public export or tested behavior must be removed;
- TypeDoc integration appears to require bulk root exports or a new public entry point;
- a fix would redesign the dynamic-import facade;
- a test requires a live third-party server;
- an unrelated source defect, audit finding, or dependency upgrade is discovered;
- the actual changed-file set exceeds the issue's approved boundary;
- an acceptance gate cannot be run in the approved environment;
- workbench and delivery content differ over the contribution manifest;
- updating the PR would require history rewriting or a materially different delivery strategy.

Record new findings separately. Do not expand the active issue to solve them.

## 17. Roadmap Requirements

After this guide is approved, the Roadmap must:

1. Map every P10-A1 through P10-E5 criterion to at least one execution unit.
2. Contain no execution unit that lacks an approved criterion or delivery need.
3. Separate upstream synchronization, formatter migration, authored documentation correction, documentation-system integration, final verification, clean delivery, and PR refresh at their natural risk boundaries.
4. Keep inseparable code and tests within the same unit.
5. Give every task or subtask one bounded objective, dependencies, affected areas, exclusions, automated gate, deliverable, and completion evidence.
6. Make each task or subtask suitable for one coherent AI work session.
7. Separate reversible workbench verification from reviewer-visible delivery actions.
8. Require exactly one GitHub issue per settled Roadmap execution unit only after project-owner approval.
9. Require issue-closing comments with commit, files, gates, and deviations.
10. Contain no live-server acceptance gate.

## 18. Approval Record

The project owner approved this Implementation Guide on August 27, 2026. Version 1.0 is the authoritative Phase 10 technical plan from which the Roadmap must be derived.

Approval authorizes drafting the Roadmap only. It does not authorize upstream integration, source changes, formatter writes, GitHub issue creation, delivery-branch modification, or PR updates.
