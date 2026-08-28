# Phase 10 Addendum AD01 Task AD5 — Local Delivery Preparation and Handoff

- **Issue:** [#205](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/205)
- **Status:** Acceptance and issue-#200 handoff evidence
- **Date:** August 28, 2026
- **Accepted workbench:** `49023b369fdd42e532833c1c5fb9f69138b05b2f`
- **Locked upstream:** `a623911201218bc1e814a9f83c64f3a027031990`
- **Prepared local delivery:** `b55d95aa0bd9f0cacf1e8b37953fde1ba14523f9`
- **Prepared delivery tree:** `87fc78c9524aac32c668969ce32f96c84c8b03d9`
- **Publication owner:** Existing issue [#200](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/200)

## 1. Conclusion

PASS. Local `OS4CSAPI/ogc-client:clean-pr` now contains one reviewed normal merge of the locked upstream commit, exactly matches the accepted workbench over the generated contribution-bearing manifest, contains no newly introduced workbench-only path, and passes the applicable QA, documentation, production-package, and offline clean-consumer gates.

The local delivery merge has not been pushed. Remote `origin/clean-pr` and PR #136 remain at `5f7cbd166143be76b60ea54593d6f313c75c3624`. No PR description, comment, branch targeting, or other reviewer-visible metadata changed during Task AD5.

## 2. Entry State and Remote Boundary

Task AD5 began with:

- clean local branch `clean-pr` at `5f7cbd166143be76b60ea54593d6f313c75c3624`;
- `origin/clean-pr` at the same commit;
- canonical `upstream/main` at the locked `a623911201218bc1e814a9f83c64f3a027031990`;
- accepted workbench `phase-10` fetched into `refs/remotes/workbench/phase-10` at `49023b369fdd42e532833c1c5fb9f69138b05b2f`;
- dependency issue #204 closed as completed; and
- PR #136 open from `OS4CSAPI/ogc-client:clean-pr` into `camptocamp/ogc-client:main` with remote head `5f7cbd166143be76b60ea54593d6f313c75c3624`.

After all local preparation and verification:

| State | Value |
| --- | --- |
| Local `clean-pr` | `b55d95aa0bd9f0cacf1e8b37953fde1ba14523f9` |
| Local tree | `87fc78c9524aac32c668969ce32f96c84c8b03d9` |
| Local worktree | Clean |
| Remote `origin/clean-pr` | `5f7cbd166143be76b60ea54593d6f313c75c3624` — unchanged |
| PR #136 remote head | `5f7cbd166143be76b60ea54593d6f313c75c3624` — unchanged |
| Behind/ahead of `origin/clean-pr` | 0 behind / 13 commits ahead |
| First-parent commits after `origin/clean-pr` | 1 — the prepared normal merge |
| Push or force-push | None |
| PR metadata mutation | None |

The 13 reachable commits are the 12 locked upstream commits plus the one local merge commit. No independent delivery commit was authored after the merge.

## 3. Merge Construction

The merge used:

```text
git merge --no-ff --no-commit a623911201218bc1e814a9f83c64f3a027031990
```

The merge base was the prior approved upstream baseline `305e3da2cf86cfda5c3254a0be419db70cce54b0`. The conflict population was exactly the three reviewed paths:

1. `app/api.data.js`;
2. `src/ogc-api/endpoint.ts`; and
3. `src/ogc-api/info.ts`.

Each conflict path was restored directly from the accepted workbench ref. `src/ogc-api/model.ts` was also restored from that ref as the authorized semantic companion. The automatic `src/index.ts` merge was inspected and already matched the accepted workbench blob.

The five reviewed coexistence blobs are:

| Path | Accepted blob |
| --- | --- |
| `app/api.data.js` | `03f5be92da2af3c96ba85823c54341a337bda3f2` |
| `src/index.ts` | `77aa5b6b97bcf19a164f04984500a5dcc77ef07f` |
| `src/ogc-api/endpoint.ts` | `9f4b6766c3096245f40d914a9fd106951d5503e5` |
| `src/ogc-api/info.ts` | `bb38940bf86529ab043978ed9a21650d2f57fafa` |
| `src/ogc-api/model.ts` | `85abf159a83a73fd30ae7e854bfd64f1ab03f33d` |

The resulting normal merge is `b55d95aa0bd9f0cacf1e8b37953fde1ba14523f9`, with parents:

1. prior delivered contribution `5f7cbd166143be76b60ea54593d6f313c75c3624`; and
2. locked upstream `a623911201218bc1e814a9f83c64f3a027031990`.

Its first-parent diff contains exactly the amended AD1 32-path population. The locked upstream commit is an ancestor of the prepared delivery head.

## 4. Generated AD01 Delivery Manifest

The manifest was generated from the old delivered tree to the accepted workbench tree, excluding workbench-only planning, research, governance, implementation records, issue templates, workflow/ignore differences, temporary files, and generated output. It contains exactly these 32 paths:

```text
app/.vitepress/theme/custom.css
app/api-utils.js
app/api.data.js
app/index.md
app/src/components/apidoc/ClassCard.vue
app/src/components/apidoc/FunctionCard.vue
examples/ncwms.js
fixtures/wms/capabilities-dimensions-1-1-1.xml
fixtures/wms/capabilities-dimensions-1-3-0.xml
fixtures/wms/capabilities-ifremer-1-1-0.xml
fixtures/wms/capabilities-ifremer-1-1-1.xml
fixtures/wms/capabilities-ifremer-1-3-0.xml
src/index.ts
src/ogc-api/endpoint.ts
src/ogc-api/info.ts
src/ogc-api/model.ts
src/shared/errors.ts
src/shared/models.ts
src/shared/time.spec.ts
src/shared/time.ts
src/shared/url-utils.ts
src/stac/model.ts
src/wms/capabilities.spec.ts
src/wms/capabilities.ts
src/wms/dimension.spec.ts
src/wms/dimension.ts
src/wms/endpoint.ts
src/wms/model.ts
src/wms/ncwms/endpoint.spec.ts
src/wms/ncwms/endpoint.ts
src/wms/url.spec.ts
src/wms/url.ts
```

Automated comparisons proved:

- manifest versus amended AD1 inventory: 32/32 exact, zero duplicates or differences;
- first-parent delivery-merge paths versus manifest: zero differences;
- prepared delivery blobs versus accepted workbench over all manifest paths: zero differences;
- introduced delivery paths versus manifest: zero differences;
- prohibited introduced paths: zero;
- locked-upstream comparison: 27 exact upstream blobs/approved absences plus exactly the five reviewed workbench overlays; and
- unexpected overlay paths: zero.

## 5. Complete Tree and Contamination Audit

The complete prepared-delivery/accepted-workbench comparison contains 538 differences, all excluded workbench-only records or configuration:

| Excluded category | Count |
| --- | ---: |
| `docs/**` planning, research, governance, implementation, and historical records | 534 |
| `.github/ISSUE_TEMPLATE/**` | 1 |
| Workbench-only `.github/workflows/qa.yml` | 1 |
| Workbench-only `.gitignore` difference | 1 |
| Workbench-only `.prettierignore` difference | 1 |
| Unexpected | 0 |

The merge introduced no `docs/**`, governance, issue-template, workbench workflow-trigger, workbench ignore-rule, `.tmp/**`, `dist/**`, or generated documentation path into delivery.

## 6. Delivery Verification

### 6.1 Repository and documentation gates

Local runtime: Node.js `v24.20.0`, npm `11.19.0`. The clean install added 836 packages and audited 837. npm reported the five inherited audit findings (two moderate and three high) and the existing esbuild install-script notice; none was remediated.

| Gate | Result |
| --- | --- |
| `npm ci` | PASS |
| Windows-compatible Prettier diagnostic, `--end-of-line auto` | PASS; all matched files use Prettier style |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| Focused CSAPI browser suite | PASS; 30/30 suites and 1,383/1,383 tests |
| `npm run docs:build` | PASS; TypeDoc 0 errors and 10 inherited warnings; VitePress complete in 20.02 seconds |
| `npm run build` with Git Bash lifecycle shell | PASS; worker, Node, browser, source maps, and declarations generated |
| `git diff --check` | PASS |

The accepted workbench tree's authoritative [Ubuntu/Node 24 QA run 33180743227](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/actions/runs/33180743227) passed unmodified formatting, typecheck, lint, all browser tests, all Node tests, documentation build, and `git diff --check`. Both test environments passed 68/68 suites with 1,909 passed and 4 skipped of 1,913 tests. That result applies to delivery through the zero-unexpected-difference source/tree proof above. The known Windows CRLF and worker-path harness limitations are not source differences and do not replace the locked authoritative Linux result.

### 6.2 Production package

`npm pack --dry-run --json` passed and reported 521 files and 817,891 packed bytes. The actual disposable tarball reported 4,474,881 unpacked bytes and SHA-256 `385c193b0d5417b1d941359cf6e901267344d2e9eff74b512c5b972723130d8a`.

The dry-run inventory and the installed tarball both contained:

| Required target | Packed size |
| --- | ---: |
| `dist/index.js` | 1,601 bytes |
| `dist/index.d.ts` | 2,494 bytes |
| `dist/ogc-api/csapi/index.js` | 1,481 bytes |
| `dist/ogc-api/csapi/index.d.ts` | 6,568 bytes |

Package metadata continued to route `.` and `./csapi` to those JavaScript and declaration targets.

### 6.3 Offline clean consumer

A fresh disposable consumer installed exactly the locally packed library and `@rgrove/parse-xml@4.2.3` tarballs with `--offline --ignore-scripts --no-audit --no-fund`.

Runtime verification exited 0 for:

- root `OgcApiEndpoint`;
- subpath `CSAPIQueryBuilder`;
- subpath `createCSAPIBuilder`;
- subpath `parseDatastream`; and
- a pure factory result that was an instance of `CSAPIQueryBuilder`.

Strict NodeNext TypeScript verification exited 0 with `noEmit` and the project-aligned `skipLibCheck` boundary. All four installed JavaScript/declaration targets existed. No live API request occurred.

### 6.4 Live-server and cleanup gates

The delivery package scripts and QA workflow contain zero live-network command dependencies. Jest browser and Node setups use the repository's fetch isolation, and the five CSAPI integration suites contain zero `fetch()` invocations.

After verification, the consumer, dependency tree, local tarballs, production output, and generated VitePress output were deleted. Task-specific temporary residue is zero, `git status` is clean, and `git diff --check` passes.

## 7. Exact Handoff to Issue #200

Issue #200 may resume only with this sequence:

1. confirm canonical `upstream/main` still equals `a623911201218bc1e814a9f83c64f3a027031990`;
2. confirm local `clean-pr` remains clean at `b55d95aa0bd9f0cacf1e8b37953fde1ba14523f9`, with tree `87fc78c9524aac32c668969ce32f96c84c8b03d9`;
3. confirm `origin/clean-pr` and PR #136 still remain at `5f7cbd166143be76b60ea54593d6f313c75c3624`;
4. confirm the branch remains 0 behind / 13 reachable commits ahead, with exactly one first-parent local commit;
5. push `clean-pr` normally to `origin` without force;
6. verify remote `clean-pr` and PR #136 resolve to `b55d95aa0bd9f0cacf1e8b37953fde1ba14523f9` and retain `camptocamp:main` ← `OS4CSAPI:clean-pr`;
7. verify technical mergeability and monitor all available PR checks, distinguishing maintainer workflow approval from technical failure;
8. confirm the PR description remains factually accurate, changing only a baseline statement made stale by AD01 if necessary;
9. if the existing maintainer notification needs a factual refresh, update that existing comment rather than adding another ping or design question; and
10. close #200 with the pushed SHA, PR/check state, exact remote changes, and deviations or `none`.

Task AD5 authorizes none of those remote mutations. It ends with the verified merge local-only.

## 8. Acceptance Summary

| Gate | Result |
| --- | --- |
| Locked upstream contained | PASS |
| Exact reviewed conflict population | PASS; 3 |
| Exact reviewed overlay population | PASS; 5 |
| AD01 manifest | PASS; 32 paths |
| Workbench parity over manifest | PASS; zero differences |
| Prohibited delivery paths | PASS; zero |
| Unexpected complete-tree differences | PASS; zero |
| Local QA/docs/build | PASS |
| Authoritative full Linux QA | PASS; run `33180743227` |
| Packed root and `/csapi` targets | PASS |
| Offline runtime/declaration consumer | PASS |
| Live API calls | PASS; zero |
| Generated/temporary residue | PASS; zero |
| Delivery worktree | PASS; clean |
| Remote `clean-pr` mutation | PASS; none |
| PR #136 metadata mutation | PASS; none |
| Issue #200 handoff | PASS; exact SHA/tree and procedure recorded |

Deviation from locked decision: none.
