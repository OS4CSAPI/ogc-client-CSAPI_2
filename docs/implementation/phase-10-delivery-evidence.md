# Phase 10 Delivery Manifest Evidence

- **Task:** Phase 10 F1 — Generate the Reviewed Delivery Manifest and Patch
- **Status:** Reviewed
- **Workbench upstream-sync commit:** `992f2d42dd2657c656cdcb6d1e45e88a968db430`
- **Canonical upstream parent:** `305e3da2cf86cfda5c3254a0be419db70cce54b0`
- **Accepted Phase 10 tip:** `3c07baf615519cfcfa454d522209cf944c0f690b`
- **Manifest:** `docs/implementation/phase-10-delivery-manifest.txt`
- **Disposable patch:** `.tmp/phase-10-delivery.patch`

## Classification Summary

The exact population from the workbench upstream-sync commit through the accepted Phase 10 tip contains 63 changed paths. Every path has exactly one classification.

| Classification        | Count | Delivery treatment                                      |
| --------------------- | ----: | ------------------------------------------------------- |
| Contribution-bearing  |    57 | Included in the machine-readable manifest and patch     |
| Workbench-only        |     6 | Excluded from delivery                                  |
| Upstream synchronization |  0 | Already contained in the recorded sync commit           |
| Generated             |     0 | Not present in the tracked post-sync population         |
| Unexpected            |     0 | None; this task would stop if any were found             |
| **Total**             | **63** | Every post-sync path is classified exactly once         |

The 57 contribution-bearing paths are listed exactly once in `phase-10-delivery-manifest.txt`. They consist of the approved Prettier 3 migration for CSAPI source/tests, current public CSAPI documentation, and the TypeDoc/VitePress integration.

## Workbench-Only Exclusions

These six paths are classified as workbench-only and must not enter `clean-pr`:

1. `.github/workflows/qa.yml` — Phase 10 branch trigger and workbench verification gates.
2. `.prettierignore` — workbench history and temporary-artifact ignore coverage.
3. `docs/research/phase-10/03-task-a3-csapi-exports-after.txt` — preservation evidence.
4. `docs/research/phase-10/03-task-a3-csapi-exports-before.txt` — preservation evidence.
5. `docs/research/phase-10/03-task-a3-preservation-audit.md` — preservation evidence.
6. `docs/research/phase-10/04-task-b2-prettier3-file-inventory.txt` — formatter evidence.

Planning, research, governance, issue-template, workflow-only, ignore-only, generated, and temporary paths are prohibited from the delivery manifest.

## Reproduction

Generate the binary-safe patch from the recorded sync commit to the accepted tip, limited to the manifest:

```bash
mapfile -t manifest < docs/implementation/phase-10-delivery-manifest.txt
git diff --binary \
  --output=.tmp/phase-10-delivery.patch \
  992f2d42dd2657c656cdcb6d1e45e88a968db430..3c07baf615519cfcfa454d522209cf944c0f690b \
  -- "${manifest[@]}"
```

The patch is intentionally ignored and is not committed. F2 consumes this reviewed artifact locally when preparing `clean-pr`.

## Patch Identity

- **Files changed:** 57
- **Insertions:** 1,142
- **Deletions:** 1,128
- **Byte size:** 322,810
- **SHA-256:** `75a85b4360dffe6e91a92b0f0409b09bfaa7bb1579df20bf58c8def0bfa08b0b`
- **Binary patch sections:** 0 (the patch was still generated with `--binary`)

## Verification Results

All F1 delivery gates passed:

- the 63-path population is partitioned into 57 contribution-bearing and 6 workbench-only paths, with no duplicates or unclassified, generated, upstream-synchronization, or unexpected paths;
- all 57 manifest paths exist at both the recorded sync commit and accepted tip;
- patch headers equal the 57-path manifest exactly;
- prohibited workbench-only path matches: zero;
- `git apply --check` succeeded in a disposable worktree at the recorded sync commit;
- applying the patch changed exactly the 57 manifest paths;
- `git diff --check` succeeded after application;
- `git apply --reverse --check` succeeded after application;
- reversing the patch restored a clean disposable worktree; and
- the disposable worktree was removed after verification.

No delivery checkout, remote delivery branch, or PR metadata is modified by F1.
