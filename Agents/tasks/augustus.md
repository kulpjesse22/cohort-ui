# Augustus Tasks

Planner owns this execution contract. Augustus uses it as the current queue. Historical queues belong under `Agents/_archive/tasks/`.

Keep this file execution-only. Do not copy product rationale, option analysis, or planner strategy here.

## Assigned Queue

- Status: complete
- Task / outcome: Cohort data layer — roster config, harness reader, message store, API routes
- Read first: `../onboarding.md` → `../project_context.md` → `../augustus.md` → this file
- Active now: none
- Next in sequence: awaiting assignment (T-2, timeline from real handoffs/lessons)
- Files / write scope: `lib/`, `app/api/`
- Read-only / preserve: `components/`, `app/` pages (Julius owns the UI), `Agents/`, `Human/`
- Current handoff: none open
- Dependencies: independent. This queue landed first; Julius consumed its shapes.
- Verification: typecheck, API routes return expected shapes, context rail resolves real files
- User-approved to execute: yes
- High-cost approval: not required
- Outward acts authorized: none
- Report back if blocked by assumption: yes

## Execution Notes

Delivered in this order:

1. `lib/agents.ts` — roster and channel config mirroring the five real roles.
2. `lib/harness.ts` — reads harness markdown from disk, strips template comments, distinguishes missing from empty.
3. `lib/messages.ts` — seeded conversation plus a JSON-backed store for composed messages.
4. `app/api/messages/[channelId]` and `app/api/context/[channelId]` — GET and POST with channel validation.
5. `lib/timeline.ts` — timeline entries and summary counts.

## Stop Conditions

- Stop before writing outside `lib/` and `app/api/`.
- Stop for a broken assumption, conflicting design direction, missing approval, or scope expansion.
- Preserve unrelated user changes; never reset, clean, or bulk-replace them.
