# Phase 10 Task A1 — Upstream Implementation Baseline

- **Issue:** [#189](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/189)
- **Status:** Acceptance evidence
- **Date:** August 27, 2026
- **Purpose:** Lock the exact upstream commit and merge forecast authorized for Phase 10 Task A2.

## 1. Locked Git Baseline

| Fact                       | Recorded value                                                                    |
| -------------------------- | --------------------------------------------------------------------------------- |
| Workbench branch           | `phase-10`                                                                        |
| Workbench starting SHA     | `9535197322b7e3afaee33a2c113af6bad78c37e5`                                        |
| Remote workbench SHA       | `9535197322b7e3afaee33a2c113af6bad78c37e5`                                        |
| Canonical upstream branch  | `camptocamp/ogc-client:main` via `upstream/main`                                  |
| Authorized upstream SHA    | `305e3da2cf86cfda5c3254a0be419db70cce54b0`                                        |
| Upstream commit            | August 26, 2026; “Merge pull request #170 from camptocamp/fix-buttons-on-website” |
| Merge base                 | `afd9c266cb124c622439677cf438904b7ef1e03f`                                        |
| Merge-base commit          | May 6, 2026; upstream PR #140 cache-function exports                              |
| Upstream-only commits      | 83                                                                                |
| Workbench-only commits     | 914                                                                               |
| Upstream changed-path rows | 172: 52 added, 21 deleted, 97 modified, and 2 renamed                             |

Both `origin` and `upstream` fetched successfully. The workbench starting SHA equaled `origin/phase-10`, and the checkout was clean. Both branches contain the recorded merge base.

The fetches emitted a non-fatal warning that Git could not delete stale metadata for the already-removed temporary worktree `.git/worktrees/phase10-guide-merge`. Both fetch commands exited 0, all requested remote refs updated successfully, and the warning did not affect the branch, worktree, inventory, or merge forecast. Repair of unrelated local Git metadata is outside issue #189.

## 2. Machine-Generated Upstream Inventory

The complete inventory is stored in [`02-task-a1-upstream-changed-files.txt`](./02-task-a1-upstream-changed-files.txt).

It was produced by:

```bash
git diff --name-status --find-renames \
  afd9c266cb124c622439677cf438904b7ef1e03f \
  305e3da2cf86cfda5c3254a0be419db70cce54b0
```

The 172-row summary was derived mechanically from the status column. No file was edited from this inventory.

## 3. Merge Forecast

The forecast command was:

```bash
git merge-tree --write-tree --messages phase-10 upstream/main
```

The command produced forecast tree `dc75e1689e89f1efd193da54133e13467cae41ff`.

It reported exactly one conflict:

```text
CONFLICT (modify/delete): app/package-lock.json deleted in upstream/main and
modified in phase-10. Version phase-10 of app/package-lock.json left in tree.
```

This matches the approved Implementation Guide. Task A2 must accept current upstream’s deletion with `git rm app/package-lock.json`; it must not restore the obsolete application-level lockfile.

Because `git merge-tree --write-tree` returns status 1 when it successfully forecasts a conflicted merge, the acceptance wrapper treated only the exact reviewed modify/delete result as success. The raw merge-tree status was 1 and the validating inspection command exited 0. Any additional or different conflict would have made the validation fail.

## 4. Semantic Overlaps for Task A2 Inspection

Git forecast eight paths that both histories can merge automatically. Automatic merging is not semantic proof, so Task A2 must inspect each result:

| Path                           | Required Task A2 inspection                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/qa.yml`     | Preserve current upstream Node.js 24 QA and use only the approved workbench branch-trigger difference.         |
| `.prettierignore`              | Preserve current upstream VitePress/build ignores and the approved workbench-only history boundaries.          |
| `README.md`                    | Preserve all current upstream standards/features while retaining CSAPI content for later Task C1 correction.   |
| `package.json`                 | Preserve current upstream tooling/import targets and the existing `./csapi` export and `sideEffects` metadata. |
| `src/index.ts`                 | Preserve current upstream root exports without bulk-exporting CSAPI.                                           |
| `src/ogc-api/endpoint.spec.ts` | Preserve current upstream tests and existing CSAPI facade coverage.                                            |
| `src/ogc-api/endpoint.ts`      | Preserve upstream endpoint behavior and the Phase 8 dynamic-import CSAPI facade.                               |
| `src/ogc-api/info.ts`          | Preserve both upstream information changes and existing CSAPI-related information behavior.                    |

No other conflict or automatic-merge overlap was reported.

## 5. Automated Gate Results

| Gate                                            | Result                                                                                                                                          |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Fetch `origin`                                  | PASS; exit 0                                                                                                                                    |
| Fetch `upstream`                                | PASS; exit 0                                                                                                                                    |
| Clean branch and origin equality                | PASS                                                                                                                                            |
| Resolve starting, upstream, and merge-base SHAs | PASS                                                                                                                                            |
| Merge-base ancestry checks                      | PASS; both exit 0                                                                                                                               |
| Left/right commit counts                        | PASS; 914 workbench-only and 83 upstream-only                                                                                                   |
| Generate changed-file inventory                 | PASS; exit 0; 172 rows                                                                                                                          |
| Summarize inventory statuses                    | PASS; 52 A, 21 D, 97 M, 2 R                                                                                                                     |
| Forecast merge                                  | PASS; exact expected conflict validated                                                                                                         |
| Forecast conflict count                         | PASS; exactly 1                                                                                                                                 |
| Forecast automatic-overlap count                | PASS; exactly 8                                                                                                                                 |
| Working-tree mutation audit                     | PASS; no merge, rebase, cherry-pick, conflict resolution, formatter write, package install, source edit, or delivery-repository change occurred |

## 6. Task A2 Authorization

Task A2 is authorized to merge **only** upstream commit `305e3da2cf86cfda5c3254a0be419db70cce54b0` into workbench `phase-10`, subject to its own issue-entry and clean-state checks.

If `upstream/main` advances before Task A2, Task A2 must still merge this locked SHA unless the Roadmap is explicitly amended through another baseline-validation decision. It must stop if the actual conflict set differs from the one conflict recorded here.

Deviation from locked decision: none.
