# Phase 10 Addendum AD01 Task AD4 — Full Workbench and Package Verification

- **Issue:** [#204](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/204)
- **Status:** Acceptance evidence
- **Date:** August 28, 2026
- **Accepted workbench code:** `a36a31024293c4018d1f99a7631e98a196d56efd`
- **Locked upstream:** `a623911201218bc1e814a9f83c64f3a027031990`
- **Authoritative QA:** [run 33178755125](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/actions/runs/33178755125), job `98874182830`

## 1. Conclusion

PASS. The accepted AD01 workbench tree passes the complete original Phase 10 repository, documentation, production-build, packed-artifact, and clean-consumer gates. Both package entry points resolve at runtime and through TypeScript declarations from an offline installation of the produced tarball. No live service was contacted.

This task made no source, dependency, test, fixture, package-metadata, workflow, public-documentation, or delivery-repository change. Its only durable output is this report.

## 2. Entry State and Runtimes

Task AD4 began with:

- local `phase-10`, `origin/phase-10`, and the accepted workbench code all at `a36a31024293c4018d1f99a7631e98a196d56efd`;
- a clean worktree;
- dependency issue #203 closed as completed; and
- canonical upstream still at the locked commit `a623911201218bc1e814a9f83c64f3a027031990`.

| Environment | Operating system | Node.js | npm | Role |
| --- | --- | --- | --- | --- |
| GitHub Actions run `33178755125` | `ubuntu-latest` | `v24.19.0` | `11.17.0` | Authoritative full repository and documentation QA |
| Local disposable verification | Windows with a Git Bash POSIX lifecycle shell where required | `v24.20.0` | `11.19.0` | Production build, package inventory, and offline consumer proof |

The local clean installation added 836 packages and audited 837. npm reported five inherited findings (two moderate and three high) plus the existing esbuild install-script notice. Per the locked scope, no `npm audit fix`, dependency change, or install-script approval was performed.

## 3. Authoritative Repository and Documentation QA

The accepted code SHA's immutable Ubuntu/Node 24 Actions run completed successfully:

| Gate | Result |
| --- | --- |
| Checkout | PASS |
| `npm ci` | PASS |
| `npm run format:check` | PASS; all matched files use Prettier style |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test:browser` | PASS; 68/68 suites, 1,909 passed and 4 skipped of 1,913 tests, 0 snapshots |
| `npm run test:node` | PASS; 68/68 suites, 1,909 passed and 4 skipped of 1,913 tests, 0 snapshots |
| `npm run docs:build` | PASS; TypeDoc 0 errors and 10 inherited warnings; VitePress complete |
| `git diff --check` | PASS |

The job started at `2026-08-28T14:09:25Z`, completed at `2026-08-28T14:10:18Z`, and every required step concluded `success`.

Local verification from a detached, LF-clean checkout of the same SHA independently passed:

- `npm ci`;
- `npm run format:check`;
- `npm run typecheck`;
- `npm run lint`;
- `npm run docs:build`, with TypeDoc reporting 0 errors and the same 10 warnings and VitePress completing in 13.11 seconds;
- `npm run build`; and
- `git diff --check`.

The direct OneDrive working checkout uses Windows line-ending conversion, so its first formatter attempt reported CRLF-only differences. A first archive extraction was also converted to CRLF by the Windows archive tool. Neither attempt wrote source. The detached clone explicitly disabled `core.autocrlf`, reproduced the accepted Git blobs, and passed the formatter. The existing Jest transformer embeds an absolute worker path in a JavaScript string and therefore cannot execute the complete browser suite on Windows because backslashes are interpreted as escapes. This is a host limitation, not an acceptance exception: the locked decision makes clean Ubuntu authoritative, where both complete suites passed for the exact accepted SHA.

## 4. Production Build and Package Inventory

`npm run build` passed with the lifecycle shell pinned to Git Bash. It produced:

- the worker bundle and declarations;
- the Node bundle;
- browser ESM files and source maps; and
- the declaration tree used by both package entry points.

`npm pack --dry-run --json` passed and reported 521 packed files and 809,896 packed bytes. The required package paths were each present exactly once:

| Required path | Packed size |
| --- | ---: |
| `dist/index.js` | 1,601 bytes |
| `dist/index.d.ts` | 2,494 bytes |
| `dist/ogc-api/csapi/index.js` | 1,481 bytes |
| `dist/ogc-api/csapi/index.d.ts` | 6,568 bytes |

The actual disposable library tarball was `camptocamp-ogc-client-1.3.1-dev.tgz`, contained the same 521 files, reported 4,370,935 unpacked bytes, and had SHA-256 `5bbb1d0b5bf88c33e19f5daecb3c8f5014de74c4511be5c6a4c749e129926a2c`.

Parsed package metadata and filesystem checks confirmed:

| Consumer path | JavaScript target | Declaration target | Result |
| --- | --- | --- | --- |
| `@camptocamp/ogc-client` | `./dist/index.js` | `./dist/index.d.ts` | Present |
| `@camptocamp/ogc-client/csapi` | `./dist/ogc-api/csapi/index.js` | `./dist/ogc-api/csapi/index.d.ts` | Present |

## 5. Offline Clean-Consumer Proof

The library and its sole runtime dependency, `@rgrove/parse-xml@4.2.3`, were packed locally. A fresh disposable consumer installed exactly those two local tarballs using:

```text
npm install --offline --ignore-scripts --no-audit --no-fund <parse-xml-tarball> <ogc-client-tarball>
```

The offline installation exited 0 and added exactly two packages. It made no registry or API request.

Runtime import proof exited 0 and confirmed:

- `OgcApiEndpoint` resolves from `@camptocamp/ogc-client`;
- `CSAPIQueryBuilder` and `createCSAPIBuilder` resolve from `@camptocamp/ogc-client/csapi`; and
- the pure value-shaped factory returns a `CSAPIQueryBuilder` instance without performing network I/O.

TypeScript proof exited 0 with `strict`, `NodeNext`, `noEmit`, and the project-aligned `skipLibCheck` boundary. Representative root and CSAPI value/type assignments compiled from the installed declarations. A second installed-filesystem check found all four required JavaScript/declaration targets.

## 6. Live-Server and Scope Audit

Automated inspection found:

- zero live-network command or URL dependencies in package scripts;
- zero live-network command or URL dependencies in the workbench QA workflow;
- browser Jest setup replaces `globalThis.fetch` with `globalThis.mockFetch`;
- Node Jest setup imports the same fetch isolation before enabling worker fallback;
- zero `fetch()` invocations across the five CSAPI integration suites; and
- no fetch call in the runtime consumer proof.

URLs retained in tests are documentation, fixture, or expected URL-builder strings. They are not contacted.

No source repair, dependency upgrade, `npm audit fix`, live request, generated-artifact commit, delivery mutation, or PR mutation occurred.

## 7. Cleanup and Acceptance Summary

After recording results, the disposable clone, archive, production output, consumer, dependency trees, locally packed dependency, library tarball, and all task-specific `.tmp/ad4-*` paths were deleted. The temporary-artifact audit returned zero AD4 paths. The workbench was clean, and `git diff --check` passed.

| Acceptance gate | Result |
| --- | --- |
| Node.js 24 clean install | PASS |
| Formatting, typecheck, and lint | PASS locally and in authoritative Actions |
| Browser and Node tests | PASS in authoritative Actions; 68/68 suites in each environment |
| Documentation build | PASS locally and in authoritative Actions |
| Production build | PASS locally |
| Package dry-run and required inventory | PASS; 521 files and all four targets |
| Offline clean-consumer runtime imports | PASS for root and `/csapi` |
| Offline clean-consumer TypeScript imports | PASS for root and `/csapi` |
| Temporary-artifact audit | PASS; zero residue |
| Live-server dependency audit | PASS; zero dependencies or calls |
| Workbench Actions for accepted SHA | PASS; run `33178755125` |
| Source or delivery mutation | PASS; none |

Deviation from locked decision: none.
