# Phase 10 Planning and Execution Workflow

- **Status:** Preflight research note; descriptive and non-normative
- **Date:** August 27, 2026
- **Branch:** `phase-10`
- **Purpose:** Preserve the recovered planning and execution method before Phase 10's normative planning documents are written.

---

## 1. Why This Note Exists

The project developed a disciplined workflow for long-running, AI-assisted contributions. That workflow is part of the project's institutional memory, but it was distributed across earlier planning documents, research notes, governance templates, issues, and closing conventions.

This note records the working formula recovered during the Phase 10 preflight. It is intentionally separate from the Phase 10 planning trio:

- It describes **how the planning process is conducted**.
- It does not define Phase 10's normative contribution scope.
- It does not authorize implementation work.
- It cannot replace or override an approved planning document or project governance.

The immediate purpose is to ensure that improvements in AI capability do not cause the project to abandon approval gates that were created to prevent scope and architectural drift.

## 2. Evidence Reviewed

The recovered workflow is based primarily on these repository artifacts:

1. [`AI_OPERATIONAL_CONSTRAINTS.md`](../../governance/AI_OPERATIONAL_CONSTRAINTS.md) — mandatory scope, precedence, evidence, and stop rules.
2. [`AI_Collaboration_Agreement.md`](../../governance/AI_Collaboration_Agreement.md) — durable human/AI authority model and drift-prevention rationale.
3. [Phase 6 Contribution Goal and Definition](../../planning/phase-6/P6-contribution-goal-and-definition.md) — outcome, acceptance, scope, verification, and success contract.
4. [Phase 6 Implementation Guide](../../planning/phase-6/P6-implementation-guide.md) — technical design, file-level actions, verification, Git runbook, delivery path, and risk register.
5. [Phase 6 Roadmap](../../planning/phase-6/P6-ROADMAP.md) and [task-granularity review](../phase-6/task-granularity-review.md) — conversion of technical work into bounded execution units and explicit risk-boundary splits.
6. [Phase 8 Contribution Goal and Definition](../../planning/phase-8/P8-contribution-goal-and-definition.md), [Implementation Guide](../../planning/phase-8/P8-implementation-guide.md), and [Roadmap](../../planning/phase-8/P8-ROADMAP.md) — the most mature planning trio and two-repository delivery model.
7. [Phase 8 issue-creation template](../../governance/issue-creation-prompt-template-phase-8.md) — one-roadmap-task-per-issue controls, locked decisions, automated gates, dependencies, and close-with-comment requirements.
8. [`docs/research/pre-implementation-alignment/`](../pre-implementation-alignment/) — forward and reverse consistency checks among research, contribution definition, implementation guidance, and roadmap.

The historical record also shows that the exact document package varied by phase. Full implementation phases used a planning trio; cleanup and research-only phases used lighter artifacts. Phase 10 is expected to contain implementation and delivery work, so the trio model is the appropriate starting formula, subject to approval through the gates below.

## 3. Preflight Repository Baseline

### 3.1 Repository roles

| Repository                    | Branch     | Role during Phase 10                                                                                          |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| `OS4CSAPI/ogc-client-CSAPI_2` | `phase-10` | Workbench: research, planning, issues, incremental implementation, validation evidence, and historical record |
| `OS4CSAPI/ogc-client`         | `clean-pr` | Delivery: curated, reviewer-facing representation of accepted work for upstream PR #136                       |
| `camptocamp/ogc-client`       | `main`     | Canonical upstream source and synchronization target                                                          |

The workbench is authoritative for Phase 10 development history. The delivery repository remains deliberately clean and must not accumulate workbench-only research, planning, or issue-management artifacts.

### 3.2 Exact branch state at preflight

- Workbench `phase-10` was created from `phase-9` commit `754411897173c2ec4debaa9bcf4ed9e0f8a9e230`.
- Workbench `phase-9` already contains the May 2026 synchronization through upstream commit `afd9c266cb124c622439677cf438904b7ef1e03f` (upstream PR #140, cache-function exports).
- The 18 commits after workbench `phase-8` are that upstream synchronization plus Phase 9 research and operational artifacts. Phase 9 did not introduce a new CSAPI implementation workstream.
- Delivery `clean-pr` is at `effaa783ed689187f8d3e3795b4946fa38175448`, the squashed Phase 8 delivery commit.
- [Upstream PR #136](https://github.com/camptocamp/ogc-client/pull/136) remains open, targets `camptocamp:main`, and uses `OS4CSAPI:clean-pr` as its head branch. GitHub currently reports 18 commits in the PR.
- At fetch time, canonical `upstream/main` is `305e3da2cf86cfda5c3254a0be419db70cce54b0`, dated August 26, 2026.
- There are 83 commits reachable from current `upstream/main` that are not reachable from the workbench `phase-9` baseline.
- No upstream merge, rebase, cherry-pick, formatter run, package installation, or source modification was performed during preflight.

These facts establish that upstream synchronization is substantial enough to require its own planned execution unit and acceptance gate. It must not be performed implicitly while preparing the planning documents.

### 3.3 Tooling observation

Git fetch and authenticated push are operational. The GitHub CLI (`gh`) is not installed in the preflight environment. This does not block branch or source work, but the issue-creation mechanism must be verified before the issue-generation stage. No issue work is authorized during preflight.

## 4. Planning Authority Chain

Phase 10 should use the following derived authority chain:

```text
Adopted standards and specifications
            ↓
Project governance
            ↓
P10 Contribution Goal and Definition
            ↓
P10 Implementation Guide
            ↓
P10 Roadmap
            ↓
Phase 10 GitHub issue
            ↓
Implementation commit and closing evidence
```

Each downstream artifact adds detail but cannot silently change an upstream decision:

- The Contribution Goal and Definition controls the outcome, acceptance conditions, locked decisions, and scope boundaries.
- The Implementation Guide explains how to achieve the approved outcome technically.
- The Roadmap sequences the approved implementation into bounded execution units.
- GitHub issues transmit individual roadmap units into execution; they do not invent work.
- Commits and closing comments demonstrate execution; they do not retroactively redefine the issue.

If a downstream stage exposes a contradiction or missing decision, work returns to the appropriate upstream document. The amendment must be explicit, reviewed, and settled before downstream work resumes.

## 5. Required Stage Gates

### Gate 0 — Preflight and branch initialization

Actions:

1. Inspect both repository roles, worktrees, remotes, branch tips, and ancestry.
2. Fetch origin and canonical upstream without integrating upstream changes.
3. Review durable governance and mature historical planning artifacts.
4. Verify the correct parent branch.
5. Create and push the Phase 10 workbench branch.
6. Record this workflow and the exact baseline.

Exit condition: the Phase 10 branch exists from a verified starting point, the preflight record is committed and pushed, and neither planning nor implementation has been started implicitly.

### Gate 1 — Contribution Goal and Definition

Only the Phase 10 Contribution Goal and Definition is drafted at this stage. It should establish:

- context and problem;
- one concise contribution goal;
- acceptance criteria;
- contribution definition, including what changes and what remains unchanged;
- locked decisions;
- in-scope and out-of-scope boundaries;
- verification strategy;
- deliverables and final success condition.

The document is reviewed with the human maintainer, revised until settled, then committed and pushed. The Implementation Guide must not begin before this gate is approved.

### Gate 2 — Implementation Guide

The guide is derived from the approved Contribution Goal and Definition. It should establish:

- current and target technical state;
- implementation principles and inherited locked decisions;
- file- or system-level implementation approach;
- verification commands and expected evidence;
- workbench Git procedure and clean-delivery procedure;
- risks, mitigations, scope guardrails, and stop conditions.

The guide is reviewed, revised until settled, then committed and pushed. If technical analysis reveals an inconsistency in the approved contribution definition, the earlier document is amended explicitly before this gate closes.

### Gate 3 — Roadmap and granularity review

The roadmap is derived from both approved documents. Each task or subtask must state:

- stable task ID and title;
- one bounded objective;
- dependencies;
- applicable locked decisions;
- expected work and affected areas;
- explicit exclusions;
- automated acceptance gate;
- required deliverable and completion evidence.

After drafting, perform both a coverage review and a granularity review:

- Every contribution acceptance criterion maps to one or more roadmap units.
- Every roadmap unit advances an approved acceptance criterion or required delivery step.
- No unit introduces out-of-scope work or an unresolved design choice.
- Dependencies form an executable order.
- Each unit is suitable for one coherent AI work session.
- Verification and remote delivery are separated where the latter crosses a higher-risk or less-reversible boundary.

The roadmap is reviewed, revised until settled, then committed and pushed. GitHub issues must not be generated before this gate is approved.

### Gate 4 — GitHub issue generation

Create exactly one GitHub issue for every settled roadmap task or subtask. Before filing:

1. Confirm the task ID exists in the approved roadmap.
2. Carry forward the relevant locked decisions and exclusions.
3. Copy the exact automated acceptance gate.
4. Record dependencies from the roadmap.
5. Check that no existing issue already represents the work.

After filing, perform a bidirectional mapping audit: every roadmap execution unit has exactly one issue, and every Phase 10 implementation issue maps to exactly one roadmap execution unit.

### Gate 5 — Issue-by-issue execution

Work proceeds one issue at a time, subject to roadmap dependencies. At issue entry, follow the acknowledgment procedure in `AI_OPERATIONAL_CONSTRAINTS.md` and restate the single issue goal.

An issue is not complete until:

1. Its acceptance criteria are satisfied and checked.
2. Its automated gate has been run and recorded.
3. Its changes are committed and pushed.
4. A closing comment records the commit SHA, modified files, gate results, and any deviation from the locked decision.
5. The issue is closed as completed.

New discoveries are recorded separately. They are not absorbed into the active issue unless the governing scope is deliberately amended.

### Gate 6 — Final verification and clean delivery

Final workbench verification must complete before modifying the reviewer-facing delivery branch. Delivery then ports only the curated, accepted contribution into `clean-pr`, verifies the delivered result, and updates PR #136 according to the approved Implementation Guide and Roadmap.

This gate preserves the historical division between detailed workbench history and a concise upstream-review history.

## 6. Execution-Unit Granularity Formula

“One prompt and one AI iteration” means one bounded objective that can be implemented and verified in one coherent work session. It does not mean one file, one command, or literally one chat message.

Task splits should follow **risk boundaries rather than volume**. Historical Phase 6 examples established useful seams:

- split research or inventory from implementation when incorrect discovery would contaminate later code;
- split work that uses materially different correction patterns;
- split independently verifiable outcomes;
- split reversible local verification from remote or reviewer-visible delivery;
- keep code and inseparable tests together when separating them would leave an invalid intermediate state;
- keep deterministic mechanical work together when an additional split would add coordination without reducing risk.

A task should be split when it contains multiple independent decisions, unrelated file populations, distinct pass/fail gates, a natural commit boundary that reduces risk, or a transition from reversible to materially less-reversible work.

A task should remain whole when its parts form one logical result, share one acceptance gate, and cannot usefully be reviewed or validated independently.

## 7. Current Inputs Awaiting Normative Definition

The following are discussion inputs for the next stage, not a substitute for the approved Contribution Goal and Definition:

- synchronize the CSAPI contribution with current canonical upstream;
- accommodate the upstream Prettier 3 transition;
- correct stale public CSAPI documentation and examples;
- integrate CSAPI into the current documentation/API-generation system;
- run current automated QA, build, documentation, and packaging verification;
- preserve the two-repository workbench/delivery workflow.

Current exclusions carried from the discussion are:

- no new CSAPI features;
- no reconsideration, redesign, or removal of the existing dynamic-import facade;
- no live third-party server retesting;
- no OpenSensorHub or other independent server repairs;
- no unrelated architectural cleanup.

These inputs become authoritative only when expressed and approved in the Phase 10 Contribution Goal and Definition.

## 8. Preflight Stop Point

After this note is validated, committed, and pushed, preflight is complete. The next authorized stage is drafting **only** `P10-contribution-goal-and-definition.md` for human review.

Preflight does not authorize:

- merging or rebasing current upstream;
- running Prettier over the source tree;
- changing source, tests, package metadata, or public documentation;
- drafting the Implementation Guide or Roadmap;
- creating or modifying GitHub issues;
- changing the delivery repository or PR #136.
