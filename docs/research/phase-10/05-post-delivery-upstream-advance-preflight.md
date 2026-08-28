# Phase 10 Post-Delivery Upstream Advance Preflight

## 1. Purpose and Status

This note records the factual trigger for a proposed Phase 10 upstream-advance addendum. It is research evidence, not implementation authority. It does not modify the approved Phase 10 scope, authorize conflict resolution, or replace any approved planning document.

The original Phase 10 synchronization was correctly completed against the then-current recorded upstream commit. Canonical upstream advanced after the verified delivery was pushed, leaving PR #136 behind and non-mergeable.

## 2. Event Timeline

| Event | UTC time | Evidence |
| --- | --- | --- |
| Phase 10 delivery pushed | 2026-08-28 01:27 | `OS4CSAPI/ogc-client:clean-pr` advanced to `5f7cbd166143be76b60ea54593d6f313c75c3624` |
| PR #136 description refreshed | 2026-08-28 01:29 | PR head `5f7cbd166143be76b60ea54593d6f313c75c3624`, base `camptocamp:main` |
| Maintainer notification posted | 2026-08-28 01:31 | [PR #136 comment](https://github.com/camptocamp/ogc-client/pull/136#issuecomment-5447267397) |
| Upstream PR #171 merged | 2026-08-28 10:48:59 | [PR #171](https://github.com/camptocamp/ogc-client/pull/171), merge commit `00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d` |

PR #171 merged approximately nine hours after the Phase 10 delivery push. The resulting eight-commit distance is subsequent upstream activity, not a missed commit in the completed Phase 10 synchronization.

## 3. Recorded Repository State

State revalidated on August 28, 2026:

| Ref or relationship | Value |
| --- | --- |
| Completed workbench branch | `OS4CSAPI/ogc-client-CSAPI_2:phase-10` at `e61fa7a3489ab192ffa6a9b3968365e37acb9f50` |
| Delivered PR head | `OS4CSAPI/ogc-client:clean-pr` at `5f7cbd166143be76b60ea54593d6f313c75c3624` |
| Prior approved upstream baseline | `305e3da2cf86cfda5c3254a0be419db70cce54b0` |
| Current canonical upstream | `00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d` |
| Current merge base | `305e3da2cf86cfda5c3254a0be419db70cce54b0` |
| Upstream-only commits | 8 |
| Delivery-only commits | 20 |
| Upstream PR #171 paths | 29 |
| Upstream/CSAPI contribution path overlaps | 4 |
| Forecast textual conflicts | 3 |

## 4. New Upstream Commit Population

The eight upstream commits absent from `clean-pr` are:

| Commit | Subject |
| --- | --- |
| `1bcac2c` | add WMS fixtures with dimensions |
| `c7fc436` | Update WMS dimension model |
| `de8dc82` | Refactor dimensions parsing to handle native date & number values |
| `891667f` | Handle dimension values in WMS GetMap url util |
| `7cd9e40` | Update index file to adapt to new APIs for WMS |
| `d38ab8c` | General API doc improvements |
| `de1e0d3` | Adapt ncwms code to handle dimensions like WMS |
| `00a8931` | Merge pull request #171 from camptocamp/improve-api-for-v2 |

The seven content commits and their merge commit explain GitHub's eight-commit-behind report.

## 5. Upstream Changed-Path Population

PR #171 changes 29 paths: 23 modified, 3 added, and 3 deleted.

```text
M  app/.vitepress/theme/custom.css
M  app/api-utils.js
M  app/api.data.js
M  app/src/components/apidoc/ClassCard.vue
M  app/src/components/apidoc/FunctionCard.vue
M  examples/ncwms.js
D  fixtures/wms/capabilities-dimensions-1-1-1.xml
D  fixtures/wms/capabilities-dimensions-1-3-0.xml
A  fixtures/wms/capabilities-ifremer-1-1-0.xml
A  fixtures/wms/capabilities-ifremer-1-1-1.xml
A  fixtures/wms/capabilities-ifremer-1-3-0.xml
M  src/index.ts
M  src/ogc-api/endpoint.ts
M  src/ogc-api/info.ts
M  src/ogc-api/model.ts
M  src/shared/errors.ts
M  src/shared/models.ts
A  src/shared/time.spec.ts
A  src/shared/time.ts
M  src/wms/capabilities.spec.ts
M  src/wms/capabilities.ts
D  src/wms/dimension.spec.ts
D  src/wms/dimension.ts
M  src/wms/endpoint.ts
M  src/wms/model.ts
M  src/wms/ncwms/endpoint.spec.ts
M  src/wms/ncwms/endpoint.ts
M  src/wms/url.spec.ts
M  src/wms/url.ts
```

These changes belong to upstream's WMS, ncWMS, shared-time, API-documentation, and v2 preparation work. They are not new CSAPI scope.

## 6. Contribution Overlap and Merge Forecast

Four upstream paths also differ in the delivered CSAPI contribution relative to the prior baseline:

| Path | Forecast result | Required future treatment |
| --- | --- | --- |
| `app/api.data.js` | Content conflict | Preserve upstream API-documentation changes and the approved per-entry-point CSAPI import-path mapping |
| `src/index.ts` | Automatic merge | Inspect explicitly for both upstream WMS/shared-time exports and the existing root/CSAPI boundary |
| `src/ogc-api/endpoint.ts` | Content conflict | Preserve upstream endpoint documentation/API changes and the established dynamically loaded `endpoint.csapi(collectionId)` facade |
| `src/ogc-api/info.ts` | Content conflict | Preserve upstream information-model changes and the existing CSAPI conformance/discovery additions |

The read-only forecast command was:

```bash
git merge-tree --write-tree \
  5f7cbd166143be76b60ea54593d6f313c75c3624 \
  00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d
```

The command exited `1` and reported content conflicts in `app/api.data.js`, `src/ogc-api/endpoint.ts`, and `src/ogc-api/info.ts`. `src/index.ts` merged automatically but remains a mandatory inspection point. No working tree or remote branch was modified by the forecast.

## 7. PR and Check State

At revalidation:

- [PR #136](https://github.com/camptocamp/ogc-client/pull/136) is open at head `5f7cbd166143be76b60ea54593d6f313c75c3624` and targets `camptocamp:main`;
- GitHub reports the PR as non-mergeable against the advanced upstream branch;
- the upstream QA [run 33132909335](https://github.com/camptocamp/ogc-client/actions/runs/33132909335) remains `action_required` with zero jobs because maintainer approval is required for the fork-originated workflow; and
- Phase 10 issue [#200](https://github.com/OS4CSAPI/ogc-client-CSAPI_2/issues/200) remains open.

Workflow approval alone cannot restore mergeability. The new upstream history must be integrated and the forecast conflicts must be resolved and verified first.

## 8. Planning Interpretation

The approved Phase 10 documents remain an accurate record of the work performed against `305e3da2cf86cfda5c3254a0be419db70cce54b0`. They should not be rewritten retrospectively.

A bounded Phase 10 addendum is the appropriate control mechanism because:

1. the original contribution goal and feature scope remain unchanged;
2. only the approved upstream baseline and delivery sequence need to advance;
3. three real conflicts require reviewed implementation guidance;
4. the existing two-repository workbench/delivery discipline remains applicable; and
5. the still-open F3 issue must not absorb unplanned source reconciliation directly.

The recommended staged planning sequence is:

1. approve a Contribution Goal and Definition Addendum;
2. derive and approve an Implementation Guide Addendum;
3. derive and approve a Roadmap Addendum;
4. generate one-prompt/one-iteration GitHub issues from the settled roadmap; and
5. resume issue #200 only after the new local delivery is verified.

The proposed planning location is:

```text
docs/planning/phase-10/addenda/AD01-upstream-advance/
```

The existing `phase-10` branch should remain the workbench branch. Commit `e61fa7a3489ab192ffa6a9b3968365e37acb9f50` already preserves the previously accepted Phase 10 state immutably.

## 9. Preflight Stop Conditions

No implementation should begin until the addendum trio and its issue set are approved. Planning or execution must stop if:

- canonical upstream advances again before the addendum baseline is locked;
- the actual workbench merge conflicts differ from this forecast;
- preserving CSAPI would require reversing unrelated PR #171 behavior;
- resolution appears to redesign the dynamic-import facade or add CSAPI features;
- workbench-only records would enter `clean-pr`; or
- delivery would require a force-push.

## 10. Preflight Conclusion

The upstream advance is bounded but material. It does not invalidate the completed Phase 10 work, but it prevents final delivery closure at the current PR head. A Phase 10 addendum should advance the baseline to `00a8931c679fb9c5cd7c5e0f0f04a4b87a307b2d`, govern the three forecast conflict resolutions, require full preservation and QA evidence, and return the verified result to the existing F3 issue for final publication and check monitoring.
