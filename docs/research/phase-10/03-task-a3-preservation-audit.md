# Phase 10 Task A3 — Upstream and CSAPI Preservation Audit

- **Issue:** [#191](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/191)
- **Status:** Acceptance evidence
- **Date:** August 27, 2026
- **Audited merge:** `992f2d42dd2657c656cdcb6d1e45e88a968db430`
- **Pre-merge workbench:** `c18aa4a3084d0ddad60145aa6e4e698d320af7bd`
- **Locked upstream:** `305e3da2cf86cfda5c3254a0be419db70cce54b0`

## 1. Conclusion

PASS. The Task A2 merge preserved the existing Phase 8 CSAPI subtree, public CSAPI exports, endpoint facade, package subpath, and tested behavior while integrating the locked upstream tree. The automated comparisons found no unexplained upstream reversion, no public CSAPI export removal, and no unrelated authored source change.

No merge-preservation correction was required.

## 2. CSAPI Tree and Public-Export Preservation

The complete `src/ogc-api/csapi` Git tree is identical before and after the merge:

| Object                    | Before                                                             | After                                                              | Result                          |
| ------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------- |
| CSAPI subtree             | `3e4f432b0b0d91df339b2d2e66cff917bd7d1304`                         | `3e4f432b0b0d91df339b2d2e66cff917bd7d1304`                         | Identical                       |
| CSAPI entry-point blob    | `cb0d00991aa4ff9392d18f815a55304c69fa1f23`                         | `cb0d00991aa4ff9392d18f815a55304c69fa1f23`                         | Identical                       |
| Entry-point SHA-256       | `14220002199a1d6a41b9ea1ed65992601d19daf12a1fce5971e112ccf0f7b825` | `14220002199a1d6a41b9ea1ed65992601d19daf12a1fce5971e112ccf0f7b825` | Identical                       |
| Normalized public exports | 173                                                                | 173                                                                | Zero additions/removals/changes |

Machine-generated normalized inventories:

- [Before merge](./03-task-a3-csapi-exports-before.txt)
- [After merge](./03-task-a3-csapi-exports-after.txt)

The inventories were generated with the TypeScript compiler API under Node.js 24.20.0. Each row records whether the export is a type or runtime value, its exported name, source module, and local/imported name. An exact array comparison returned true.

The endpoint facade also remains present and tested:

- `OgcApiEndpoint.csapi(collectionId)`;
- dynamic import of `./csapi/factory.js`;
- dynamic import of `./csapi/helpers.js`;
- no bulk CSAPI export from `src/index.ts`.

## 3. Package-Entry Preservation

Root `package.json` and `package-lock.json` parse successfully. The merged package retains:

| Package path | JavaScript import target        | Declaration target                |
| ------------ | ------------------------------- | --------------------------------- |
| `.`          | `./dist/index.js`               | `./dist/index.d.ts`               |
| `./csapi`    | `./dist/ogc-api/csapi/index.js` | `./dist/ogc-api/csapi/index.d.ts` |

The `./csapi` export object is unchanged from the pre-merge workbench. `sideEffects: false` is also preserved. The root import target reflects current upstream architecture.

This task verifies metadata targets; production-file existence in the packed artifact remains assigned to Task E2.

## 4. Upstream-Change Preservation

The A1 inventory contains 172 status rows representing 174 unique old/new paths after expanding two renames.

An automated comparison of every inventory path between locked upstream and the merged workbench found exactly eight differences:

1. `.github/workflows/qa.yml`
2. `.prettierignore`
3. `README.md`
4. `package.json`
5. `src/index.ts`
6. `src/ogc-api/endpoint.spec.ts`
7. `src/ogc-api/endpoint.ts`
8. `src/ogc-api/info.ts`

This set exactly equals the eight automatic semantic overlaps forecast in A1 and inspected during A2. The other 166 unique upstream paths match the locked upstream tree. The obsolete `app/package-lock.json` matches upstream by being absent.

Automated content assertions on the eight overlays confirm that the combined tree retains:

- current upstream Node.js 24 QA and repository commands;
- upstream VitePress/build ignore paths;
- upstream README WPS and NcWMS content;
- upstream Prettier 3, TypeDoc, VitePress, root import path, and dependencies;
- upstream root WPS and NcWMS exports;
- the existing CSAPI README content pending Task C1 correction;
- the `./csapi` export and `sideEffects: false`;
- the endpoint CSAPI method, both dynamic imports, its tests, and Connected Systems information helpers.

No additional upstream-inventory path differs from upstream.

## 5. First-Parent Changed-File Audit

The merge diff from its first parent contains exactly 172 status rows. An exact comparison against the A1 machine-generated inventory reports zero differences.

Therefore, the Task A2 merge introduced:

- the complete locked-upstream changed-file population;
- the one approved lockfile-deletion resolution;
- no extra authored path.

At Task A3 start, `HEAD` equaled `origin/phase-10` and the worktree was clean. During this task, no source, package, workflow, formatter, public documentation, test, or delivery-repository file was edited.

## 6. Approved-Runtime Verification

The workstation default is an unsupported Node.js 26 alpha and was not used as acceptance evidence. A disposable Node.js **24.20.0** executable ran the verification commands.

Dependency installation used the merged root lockfile and completed successfully with 836 packages. npm reported five inherited audit findings and a blocked esbuild install-script notice. This audit did not run `npm audit fix`, approve install scripts, build, or otherwise remediate those unrelated findings.

Results:

| Gate                                                                                        | Result                     |
| ------------------------------------------------------------------------------------------- | -------------------------- |
| TypeScript: `node@24 node_modules/typescript/bin/tsc --noEmit`                              | PASS; exit 0               |
| Existing CSAPI tests: `node@24 node_modules/jest/bin/jest.js --runInBand src/ogc-api/csapi` | PASS; exit 0               |
| Test suites                                                                                 | 30 passed / 30 total       |
| Tests                                                                                       | 1,383 passed / 1,383 total |
| Snapshots                                                                                   | 0                          |
| Test duration                                                                               | 52.887 seconds             |

All tests are fixture/repository-local. No live server was contacted.

## 7. Automated Acceptance-Gate Summary

| Requirement                        | Result                                                   |
| ---------------------------------- | -------------------------------------------------------- |
| Public-export comparison           | PASS; 173 before, 173 after, exact equality              |
| CSAPI subtree preservation         | PASS; identical Git tree object                          |
| Package target checks              | PASS; root and `./csapi` JS/declaration metadata coexist |
| TypeScript under Node 24           | PASS; exit 0                                             |
| Existing CSAPI tests under Node 24 | PASS; 1,383 tests                                        |
| Upstream-change comparison         | PASS; only the eight reviewed overlays differ            |
| First-parent changed-file audit    | PASS; exact 172-row match to A1 inventory                |
| Unrelated authored source change   | None                                                     |
| Merge-preservation correction      | None required                                            |

Deviation from locked decision: none.
