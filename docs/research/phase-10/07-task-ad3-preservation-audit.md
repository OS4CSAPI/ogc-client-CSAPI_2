# Phase 10 Addendum AD01 Task AD3 — Upstream and CSAPI Preservation Audit

- **Issue:** [#203](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/203)
- **Status:** Acceptance evidence
- **Date:** August 28, 2026
- **Audited merge:** `4acedf4cb5a3e38fd3cb45195cbba0ec5fe40406`
- **Pre-AD01 workbench:** `28ef8846c87c084a51be13c6e733997855765c06`
- **Locked upstream:** `a623911201218bc1e814a9f83c64f3a027031990`

## 1. Conclusion

PASS. The AD2 merge preserved the complete 32-path approved upstream range and the completed Phase 10 CSAPI public surface. Every difference from locked upstream is one of the five reviewed coexistence paths. There is no unexplained upstream reversion, CSAPI export removal, root/subpath boundary change, or unrelated authored path.

No source correction was required or made in this task.

## 2. Approved-Upstream Path Audit

The complete blob-level comparison is stored in [`07-task-ad3-upstream-comparison.txt`](./07-task-ad3-upstream-comparison.txt). Its population exactly matches the 32-row amended AD1 inventory.

| Classification | Count | Paths |
| --- | ---: | --- |
| Exact upstream blob or approved absence | 27 | All rows marked `MATCH_UPSTREAM` |
| Reviewed documentation-loader conflict | 1 | `app/api.data.js` |
| Reviewed automatic coexistence | 1 | `src/index.ts` |
| Reviewed endpoint conflict | 1 | `src/ogc-api/endpoint.ts` |
| Reviewed information conflict | 1 | `src/ogc-api/info.ts` |
| Authorized capability companion | 1 | `src/ogc-api/model.ts` |
| Unexplained | 0 | None |

The five non-identical paths are exactly the AD2 overlay population already identified by the merge-parent audit. They preserve:

- upstream's property, static-method, and no-constructor API-documentation behavior with Phase 10's root/CSAPI entry-point import mapping;
- upstream's root WMS, WMTS, shared-time, and query-utility exports with the existing `DateTimeParameter` export and no CSAPI bulk root export;
- upstream's endpoint capability/options types with the CSAPI facade, getters, errors, and dynamic imports;
- upstream's `OgcApiCollectionCapabilities` return model with CSAPI conformance and collection-link detection; and
- the single optional `hasConnectedSystems` field authorized for upstream's consolidated capability interface.

All other approved upstream files and deletions match the locked upstream tree exactly.

## 3. CSAPI Public-Export Preservation

The TypeScript compiler API generated normalized public-export arrays from `src/ogc-api/csapi/index.ts` at the pre-AD01 parent and merged result. Each row records value/type kind, exported name, source module, and local/imported name using the canonical format in [`03-task-a3-csapi-exports-after.txt`](./03-task-a3-csapi-exports-after.txt).

The machine-generated comparison is stored in [`07-task-ad3-csapi-export-comparison.txt`](./07-task-ad3-csapi-export-comparison.txt).

| Measure | Before AD01 | After AD01 | Result |
| --- | ---: | ---: | --- |
| Entry-point source SHA-256 | `6675f2fea741339ccb88160cb00442b6d9e5c261a89e87f4962890518442f86e` | `6675f2fea741339ccb88160cb00442b6d9e5c261a89e87f4962890518442f86e` | Exact |
| Normalized export rows | 173 | 173 | Exact |
| Additions | 0 | 0 | None |
| Removals | 0 | 0 | None |

The normalized inventory SHA-256 is `9fc18bdd4abea333393bd5be73c135ca3a243c0a81389c46c0f4218b0ade2e3c` and exactly matches the canonical Phase 10 inventory. AD01 did not change any file under `src/ogc-api/csapi/`.

## 4. Package and Root/Subpath Boundary

Root `package.json` parses successfully and retains:

| Consumer path | JavaScript import target | Declaration target |
| --- | --- | --- |
| `@camptocamp/ogc-client` | `./dist/index.js` | `./dist/index.d.ts` |
| `@camptocamp/ogc-client/csapi` | `./dist/ogc-api/csapi/index.js` | `./dist/ogc-api/csapi/index.d.ts` |

`src/index.ts` contains no export from `./ogc-api/csapi/index.js`. The merged root retains the reviewed upstream exports and Phase 10's `DateTimeParameter` type export. The CSAPI surface therefore remains available through `./csapi` without being bulk-exported from the root.

Production-file and packed-consumer existence remain assigned to Task AD4.

## 5. Endpoint, Information, and Documentation Preservation

Automated source assertions and the successful immutable-merge CI run confirm that the merged result retains:

- `OgcApiEndpoint.hasConnectedSystems`;
- `OgcApiEndpoint.csapiCollections`;
- `OgcApiEndpoint.csapi(collectionId)`;
- dynamic runtime imports of `./csapi/factory.js` and `./csapi/helpers.js`;
- no static runtime import of either CSAPI module;
- both CSAPI conformance prefixes and `checkHasConnectedSystems()`;
- `ogc-cs:*` collection-link detection and the optional capability field;
- root and CSAPI TypeDoc module mapping;
- upstream static-method documentation handling; and
- representative endpoint/info/CSAPI test coverage.

[Quality Assurance run 33175454920](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/actions/runs/33175454920) passed under Node.js 24 on Ubuntu for dependency installation, formatting, typecheck, lint, browser tests, Node tests, documentation build, and `git diff --check`.

## 6. Merge-Parent and Changed-File Audit

The merge has exactly two parents:

1. workbench `28ef8846c87c084a51be13c6e733997855765c06`; and
2. locked upstream `a623911201218bc1e814a9f83c64f3a027031990`.

The first-parent merge diff contains exactly the amended AD1 32-path inventory. The upstream-parent comparison over those 32 paths contains exactly the five reviewed overlays classified above. `src/ogc-api/model.ts` differs from upstream only by the authorized optional capability field. No sixth overlay or unrelated authored path exists.

At Task AD3 entry, `HEAD` equaled `origin/phase-10`, the worktree was clean, canonical upstream still equaled the locked commit, and AD2 was closed as completed. This task changes only its evidence files and the one clerical `29`-to-`32` Roadmap/issue correction.

## 7. Acceptance-Gate Summary

| Gate | Result |
| --- | --- |
| 32 upstream paths classified once | PASS; 27 exact plus 5 reviewed overlays |
| Unexplained upstream omission/reversion | PASS; zero |
| Normalized CSAPI exports | PASS; 173 before and after, exact equality |
| CSAPI export additions/removals | PASS; zero / zero |
| Package root and `./csapi` metadata | PASS; both parse with approved targets |
| Root/subpath source boundary | PASS; no root bulk export |
| Endpoint facade and dynamic imports | PASS |
| Conformance and collection detection | PASS |
| Documentation import mapping/static methods | PASS |
| Representative immutable-merge CI | PASS; run 33175454920 |
| Merge-parent changed-file audit | PASS; exact 32-path first-parent population and five reviewed overlays |
| Unrelated authored source path | PASS; none |

Deviation from locked decision: none. Clerical correction: the leftover `29` in the AD3 Roadmap/issue gate was changed to the already-approved amended count of `32`.
