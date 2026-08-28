# Phase 10 Addendum AD01: Post-Delivery Upstream Advance — Roadmap

- **Version:** 1.0
- **Status:** Approved
- **Date:** August 28, 2026
- **Branch:** `phase-10`
- **Scope authority:** [AD01 Contribution Goal and Definition](./P10-AD01-contribution-goal-and-definition.md)
- **Technical authority:** [AD01 Implementation Guide](./P10-AD01-implementation-guide.md)
- **Existing final-delivery issue:** [Phase 10 issue #200](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/200)

---

## 1. Purpose

This Roadmap Addendum converts the approved AD01 scope and technical plan into five bounded execution units. Each new task is designed for one coherent AI-assisted work session, one GitHub issue, one reviewable workbench commit or explicitly identified merge/evidence result, and one issue-closing record.

The fifth task ends with a verified local delivery and hands control back to existing Phase 10 issue #200. No duplicate publication issue will be created.

No new AD01 GitHub issue exists yet. Issues may be created only after this Roadmap Addendum is approved and its one-to-one mapping is verified.

## 2. Non-Negotiable Execution Rules

Every task must:

1. review `docs/governance/AI_OPERATIONAL_CONSTRAINTS.md` at entry;
2. restate its single objective and verify that all dependencies are complete;
3. begin from the exact clean and synchronized repository state named by the task;
4. use only the project-owner-approved amended upstream commit `a623911201218bc1e814a9f83c64f3a027031990` unless planning is explicitly amended again;
5. preserve the complete approved upstream range, the approved CSAPI behavior, the dynamic-import facade, and the separate `./csapi` entry point;
6. avoid new features, live-server calls, unrelated fixes, dependency remediation, refactoring, force-pushing, and new maintainer questions;
7. run the task's exact acceptance gates and review the actual changed-file list;
8. commit and push workbench changes before closing the issue, except that Task AD5 intentionally leaves delivery `clean-pr` unpushed;
9. close with commit/evidence SHAs, affected paths, exact command results, and deviations or `none`; and
10. stop rather than expanding scope if an actual conflict, required correction, upstream advance, or delivery state differs materially from the approved guide.

Tasks remain separate even if one session has spare capacity.

## 3. Dependency Sequence

```text
AD1 Lock the advanced upstream baseline
        ↓
AD2 Integrate advanced upstream and resolve coexistence
        ↓
AD3 Audit upstream and CSAPI preservation
        ↓
AD4 Run full workbench and package verification
        ↓
AD5 Prepare and verify clean-pr locally
        ↓
Resume existing issue #200
        ↓
Push clean-pr and verify PR #136/checks
```

## 4. Task AD1 — Revalidate and Lock the Advanced Upstream Baseline

- **GitHub issue:** [#201](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/201).
- **Objective:** Establish the exact immutable Git input, 32-path inventory, and three-conflict forecast that AD2 is permitted to merge.
- **Acceptance criteria advanced:** P10-AD01-A1, P10-AD01-A2, P10-AD01-A3.
- **Dependencies:** None.
- **Complexity/risk:** Low; read-only Git analysis.
- **Locked decisions:** Analyze canonical upstream but authorize only `a623911201218bc1e814a9f83c64f3a027031990`; do not merge or edit source.
- **Expected work:**
  - fetch workbench `origin` and canonical `upstream`;
  - confirm clean `phase-10`, equality with `origin/phase-10`, and no active Git operation;
  - record workbench start, delivery head, locked upstream, current `upstream/main`, merge base, ancestry, and left/right counts;
  - regenerate the exact approved upstream changed-path inventory from `305e3da2` to `a6239112`;
  - run the read-only `git merge-tree --write-tree --messages` forecast against the workbench tip;
  - confirm the three expected content conflicts and automatic `src/index.ts` overlap;
  - record `src/ogc-api/model.ts` as the required semantic companion path; and
  - record whether canonical upstream has advanced beyond the locked commit and apply the guide's stop rule.
- **Affected areas:** A new evidence note and machine-generated inventory under `docs/research/phase-10/`; no source or delivery changes.
- **Explicit exclusions:** Merge, rebase, cherry-pick, conflict resolution, source edit, formatter write, package install, delivery mutation, PR change.
- **Automated acceptance gate:**
  - all fetch and inspection commands complete successfully;
  - the inventory contains exactly 32 paths with 23 modified, 5 added, and 4 deleted;
  - the forecast contains exactly the reviewed conflicts in `app/api.data.js`, `src/ogc-api/endpoint.ts`, and `src/ogc-api/info.ts`;
  - `src/index.ts` is recorded as the automatic contribution overlap;
  - worktree remains clean except for the new evidence files; and
  - any changed canonical-upstream state is recorded and causes the required stop rather than silently changing the baseline.
- **Deliverable:** One committed and pushed AD01 baseline evidence note plus its exact changed-path inventory.
- **Closing evidence:** Workbench commit, all recorded SHAs/counts, inventory path and totals, forecast output, canonical-upstream disposition, changed files, deviations or `none`.

## 5. Task AD2 — Integrate Advanced Upstream and Resolve Coexistence

- **GitHub issue:** [#202](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/202).
- **Objective:** Merge the amended AD1-locked upstream commit into workbench `phase-10` and produce one coherent result that preserves the complete approved upstream range and the already-approved CSAPI contribution.
- **Acceptance criteria advanced:** P10-AD01-A1, P10-AD01-A2, P10-AD01-A3, P10-AD01-B1, P10-AD01-B2, P10-AD01-B3, P10-AD01-B4, P10-AD01-B5.
- **Dependencies:** AD1 completed without a stop condition.
- **Complexity/risk:** High; foundational workbench merge and three authored conflict resolutions.
- **Locked decisions:** Normal `--no-ff` merge; exact AD1 SHA; no whole-file `ours`/`theirs`; add only `hasConnectedSystems?: boolean` to upstream's capability interface; preserve dynamic imports and subpath boundary.
- **Expected work:**
  - verify the clean workbench state and the AD1 evidence immediately before mutation;
  - merge exactly `a623911201218bc1e814a9f83c64f3a027031990`;
  - resolve `app/api.data.js` by combining upstream property/static-method/constructor handling with Phase 10 per-entry-point import mapping and combined TypeDoc modules;
  - resolve `src/ogc-api/endpoint.ts` by combining upstream capability/options types and documentation with the CSAPI getters, facade, errors, and dynamic imports;
  - resolve `src/ogc-api/info.ts` using upstream's `OgcApiCollectionCapabilities` while retaining CSAPI conformance and collection-link detection;
  - add `hasConnectedSystems?: boolean` to `OgcApiCollectionCapabilities` in `src/ogc-api/model.ts`;
  - inspect the automatic `src/index.ts` result for all reviewed upstream and Phase 10 exports and the absence of CSAPI bulk root exports;
  - run focused type, endpoint/info test, documentation-generation/build, source-assertion, formatting, and diff checks;
  - commit the merge and push `phase-10` normally.
- **Affected areas:** Repository merge result, with authored resolution/adaptation limited to `app/api.data.js`, `src/ogc-api/endpoint.ts`, `src/ogc-api/info.ts`, and `src/ogc-api/model.ts`; mandatory inspection of `src/index.ts`.
- **Explicit exclusions:** New API behavior, facade redesign, static CSAPI runtime imports, new exports beyond the one capability field, unrelated changes to the approved upstream range, broad formatting, live testing, delivery changes.
- **Automated acceptance gate:**
  - ancestry check for the locked upstream SHA exits 0;
  - no unmerged paths remain and actual conflicts equal the AD1 forecast;
  - Node.js 24 typecheck exits 0;
  - existing `info.spec.ts` and `endpoint.spec.ts` tests pass;
  - `npm run docs:api` and `npm run docs:build` exit 0;
  - source assertions confirm the capability field, dynamic imports, reviewed root exports, and root/subpath boundary;
  - explicit formatting and `git diff --check` pass;
  - workbench Actions succeeds for the pushed merge; and
  - the final authored resolution population contains no unexplained path.
- **Deliverable:** One pushed normal workbench merge commit containing the reviewed coexistence resolutions.
- **Closing evidence:** Merge SHA, upstream SHA, resolved/companion/inspected paths, focused gate totals and results, Actions URL, deviations or `none`.

## 6. Task AD3 — Audit Upstream and CSAPI Preservation

- **GitHub issue:** [#203](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/203).
- **Objective:** Prove mechanically that AD2 preserved all changes in the approved upstream range and the completed Phase 10 CSAPI contribution before broad final verification.
- **Acceptance criteria advanced:** P10-AD01-A2, P10-AD01-A3, P10-AD01-B1, P10-AD01-B2, P10-AD01-B3, P10-AD01-B4, P10-AD01-B5.
- **Dependencies:** AD2.
- **Complexity/risk:** Medium; evidence generation and semantic comparison with no planned source edits.
- **Locked decisions:** Tests alone are insufficient; classify every difference; an unexplained reversion or public-surface removal is a stop, not authority to repair broadly.
- **Expected work:**
  - compare all 32 approved upstream paths between locked upstream and the merged workbench;
  - classify every difference as an existing Phase 10 overlay, reviewed conflict resolution, `src/ogc-api/model.ts` adaptation, or `src/index.ts` coexistence result;
  - generate normalized pre/post-AD01 CSAPI public-export inventories;
  - verify the root and `./csapi` package metadata and actual boundary;
  - verify endpoint facade, conformance detection, collection detection, documentation import mapping, and representative existing tests remain present;
  - inspect the AD2 merge against both parents for unapproved authored changes; and
  - commit and push a preservation-audit report and machine-generated inventories.
- **Affected areas:** New evidence under `docs/research/phase-10/`; no planned source or delivery changes.
- **Explicit exclusions:** Source correction, new test behavior, formatting migration, documentation rewriting, package redesign, delivery mutation.
- **Automated acceptance gate:**
  - all 29 upstream paths receive exactly one explained classification;
  - upstream comparison contains no unexplained omission or reversion;
  - normalized CSAPI export comparison contains no unexplained removal;
  - root and `./csapi` package boundaries parse and match their approved targets;
  - reviewed endpoint/info/TypeDoc assertions pass;
  - merge-parent changed-file audit reports no unrelated authored path; and
  - workbench remains clean and synchronized after the evidence commit.
- **Deliverable:** One committed and pushed AD01 preservation report with reproducible inventories.
- **Closing evidence:** Evidence commit/path, classified upstream comparison, export counts/diff, package-boundary result, merge-parent audit, files, deviations or `none`.

## 7. Task AD4 — Run Full Workbench and Package Verification

- **GitHub issue:** [#204](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/204).
- **Objective:** Demonstrate that the accepted AD01 workbench tree passes the complete original Phase 10 repository, documentation, build, packed-artifact, and clean-consumer gates.
- **Acceptance criteria advanced:** P10-AD01-B5, P10-AD01-C1.
- **Dependencies:** AD3.
- **Complexity/risk:** Medium; long-running verification with no planned source edits.
- **Locked decisions:** Node.js 24/Linux Actions is authoritative; no live server; failures return to their owning task or stop for scope review; do not remediate inherited audit notices.
- **Expected work:**
  - start from the clean pushed AD3 tip and record Node.js/npm versions;
  - run `npm ci`, formatting, typecheck, lint, Node tests, browser tests, documentation build, production build, package dry-run, and `git diff --check`;
  - build a disposable clean consumer under ignored `.tmp/`;
  - pack/install the library and verify runtime plus TypeScript imports from both root and `/csapi`;
  - verify required JavaScript and declaration files exist in the packed artifact;
  - audit commands for zero live-server dependency;
  - remove all temporary consumer/package artifacts; and
  - commit and push one verification report tied to immutable code and Actions SHAs.
- **Affected areas:** New verification evidence under `docs/research/phase-10/` and ignored disposable `.tmp/` content removed before completion; no intended source change.
- **Explicit exclusions:** Source repair, dependency upgrade, `npm audit fix`, live API requests, generated artifact commits, delivery mutation.
- **Automated acceptance gate:**
  - `npm ci`, `npm run format:check`, `npm run typecheck`, `npm run lint`, `npm run test:node`, `npm run test:browser`, `npm run docs:build`, `npm run build`, and `git diff --check` exit 0 under Node.js 24;
  - package inventory contains root and CSAPI JavaScript/declaration targets;
  - clean-consumer runtime and TypeScript checks pass for both entry points;
  - temporary-artifact audit returns zero tracked/untracked residue;
  - workbench Actions succeeds for the verified commit; and
  - live-server dependency audit returns zero.
- **Deliverable:** One committed and pushed full-verification report tied to the accepted workbench code and successful CI.
- **Closing evidence:** Verified code/evidence SHAs, runtime, every command/result and test total, package inventory, consumer proof, cleanup, Actions URL, deviations or `none`.

## 8. Task AD5 — Prepare and Verify `clean-pr` Locally

- **GitHub issue:** [#205](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/205).
- **Objective:** Construct the AD01 delivery as one local normal merge, prove it matches the accepted workbench, and hand a fully verified unpushed commit to existing issue #200.
- **Acceptance criteria advanced:** P10-AD01-A1, P10-AD01-A2, P10-AD01-A3, P10-AD01-B5, P10-AD01-C2, P10-AD01-C4.
- **Dependencies:** AD4.
- **Complexity/risk:** High; reversible local mutation of the delivery repository.
- **Locked decisions:** Same upstream SHA; normal merge; exact accepted workbench blobs for three conflicts and `src/ogc-api/model.ts`; no force-push; no remote delivery or PR mutation in this task.
- **Expected work:**
  - record clean delivery branch, remote head, remotes, ancestry, and PR base/head metadata;
  - fetch origin, upstream, and the exact accepted workbench tip into a namespaced local ref;
  - merge exactly `a623911201218bc1e814a9f83c64f3a027031990` into local `clean-pr`;
  - confirm the conflict set matches AD1/AD2;
  - restore the three accepted workbench conflict-resolution blobs and the accepted `src/ogc-api/model.ts` blob, then inspect automatic `src/index.ts`;
  - commit the local normal merge without pushing;
  - generate the contribution-bearing delivery manifest and compare every included path with the accepted workbench;
  - audit for zero workbench-only planning, research, governance, issue, workflow-trigger, ignore-rule, temporary, or generated artifacts;
  - repeat full applicable QA, docs, build, packed-artifact, and clean-consumer checks in delivery;
  - record the local commit/tree SHAs, expected ahead count, and exact handoff requirements for #200; and
  - commit and push the durable delivery-preparation/handoff evidence to workbench `phase-10` without pushing delivery.
- **Affected areas:** Local `OS4CSAPI/ogc-client:clean-pr`, limited to the normal upstream merge and reviewed resolution/adaptation content; one workbench handoff-evidence record under `docs/research/phase-10/`.
- **Explicit exclusions:** Push, force-push, PR body/comment change, new source work, independent re-authoring of resolutions, workbench-only file delivery.
- **Automated acceptance gate:**
  - delivery contains the locked upstream SHA and exactly the reviewed merge resolution population;
  - contribution-manifest comparison with accepted workbench reports zero differences;
  - prohibited-path audit reports zero delivery contamination;
  - full delivery QA, documentation, build, package, and consumer gates exit 0;
  - delivery worktree is clean and local `clean-pr` is ahead of `origin/clean-pr` only by the reviewed normal merge;
  - no remote delivery ref or PR metadata changed; and
  - the committed and pushed workbench handoff record points explicitly to existing issue #200.
- **Deliverable:** A fully verified local `clean-pr` merge ready for one normal push by issue #200, plus committed and pushed workbench handoff evidence.
- **Closing evidence:** Local commit/tree SHAs, accepted workbench SHA, manifest/parity results, prohibited-path audit, all delivery gates, remote non-mutation proof, #200 handoff, deviations or `none`.

## 9. Existing Issue #200 — Resume Final Publication and Checks

Issue #200 is not a new Roadmap execution unit and receives no duplicate issue. It resumes only after AD5 closes successfully.

Its remaining authorized work is:

- confirm upstream `main` still equals the locked AD01 baseline;
- confirm the local verified merge and expected one-commit ahead state;
- push `clean-pr` normally without force;
- verify PR #136's base/head SHAs and technical mergeability;
- confirm the PR description remains factually accurate, updating only a stale baseline statement if necessary;
- monitor available checks and distinguish maintainer-controlled workflow approval from a technical failure;
- post no new design question; and
- close #200 with the pushed SHA, PR/check state, remote changes, and deviations.

Issue #200 completes P10-AD01-C3 and the final publication portion of P10-AD01-C2. It also confirms the dependency handoff required by P10-AD01-C4.

## 10. Roadmap Summary

| Task | Primary outcome | Repository mutation | Remote publication |
| --- | --- | --- | --- |
| AD1 | Locked baseline, inventory, and forecast | Workbench evidence only | Workbench push |
| AD2 | Integrated upstream and resolved coexistence | Workbench source merge | Workbench push |
| AD3 | Mechanical upstream/CSAPI preservation proof | Workbench evidence only | Workbench push |
| AD4 | Full QA, package, and consumer proof | Workbench evidence only | Workbench push |
| AD5 | Verified local delivery merge | Local delivery plus workbench evidence if needed | No delivery push |
| Existing #200 | Published delivery and verified PR state | Remote `clean-pr` and factual PR metadata only | Normal delivery push |

Five new issues are required. Existing issue #200 remains the single reviewer-visible publication unit.

## 11. Acceptance-Criteria Coverage

| Criterion | Roadmap task or existing issue |
| --- | --- |
| P10-AD01-A1 | AD1, AD2, AD5 |
| P10-AD01-A2 | AD1, AD2, AD3, AD5 |
| P10-AD01-A3 | AD1, AD2, AD3, AD5 |
| P10-AD01-B1 | AD2, AD3 |
| P10-AD01-B2 | AD2, AD3 |
| P10-AD01-B3 | AD2, AD3 |
| P10-AD01-B4 | AD2, AD3 |
| P10-AD01-B5 | AD2, AD3, AD4, AD5 |
| P10-AD01-C1 | AD4 |
| P10-AD01-C2 | AD5, existing #200 |
| P10-AD01-C3 | Existing #200 |
| P10-AD01-C4 | AD5, existing #200 |

Every approved criterion is mapped. No new task exists without an approved criterion or required delivery dependency.

## 12. Granularity Review

| Task | One bounded objective | Independent pass/fail gate | Natural risk boundary | One coherent session |
| --- | --- | --- | --- | --- |
| AD1 | Lock input and forecast | Yes | Read-only before mutation | Yes |
| AD2 | Merge and resolve coexistence | Yes | Foundational source integration | Yes |
| AD3 | Prove semantic preservation | Yes | Evidence before broad QA | Yes |
| AD4 | Prove complete workbench/package quality | Yes | Immutable workbench acceptance | Yes |
| AD5 | Construct and verify local delivery | Yes | Reversible delivery before publication | Yes |

The three conflict resolutions, companion type adaptation, and focused tests remain together in AD2 because they form one inseparable compilable merge result. Broad QA and package proof are isolated in AD4 so a preservation audit can reject the merge before expensive verification. Remote publication remains isolated in existing issue #200.

## 13. GitHub Issue Generation Rules

After Roadmap approval:

1. create exactly five new issues, one each for AD1 through AD5;
2. preserve each task ID and title verbatim;
3. copy its objective, criteria, dependencies, locked decisions, expected work, affected areas, exclusions, automated gate, deliverable, and closing-evidence requirements;
4. link each issue to the approved AD01 planning trio and preflight evidence;
5. add only existing appropriate labels;
6. add no wrapper, umbrella, duplicate-publication, or speculative issue;
7. audit both directions so every AD01 task has exactly one issue and every new AD01 issue maps to exactly one task;
8. update this Roadmap's issue placeholders with links in a separate post-creation documentation commit;
9. add an explicit dependency note to issue #200 that it resumes after AD5; and
10. begin AD1 only after issue creation, mapping audit, Roadmap-link commit, and successful workbench QA.

## 14. Approval Record

The project owner approved this Roadmap Addendum on August 28, 2026. Version 1.0 is the authoritative AD01 execution sequence and authorizes creation of exactly five new GitHub issues corresponding to AD1 through AD5, the issue-link documentation commit, and the dependency note on existing issue #200.

Approval does not authorize source integration, conflict resolution, delivery-branch modification, force-pushing, or PR updates outside the dependency-ready issue governing that action.
