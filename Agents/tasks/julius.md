# Julius Tasks

Planner owns this execution contract. Julius uses it as the current queue. Historical queues belong under `Agents/_archive/tasks/`.

Keep this file execution-only. Do not copy product rationale, option analysis, or planner strategy here.

## Assigned Queue

- Status: complete
- Task / outcome: Cohort UI shell, agent profile timeline, and guided tour
- Read first: `../onboarding.md` → `../project_context.md` → `../julius.md` → this file → `../design.md` + `../UX.md`
- Active now: none
- Next in sequence: awaiting assignment (T-1 blocked on a user decision)
- Files / write scope: `app/`, `components/`
- Read-only / preserve: `lib/` (Augustus owns the data layer), `Agents/`, `Human/`
- Current handoff: none open
- Dependencies: consumed the shapes in `lib/agents.ts`, `lib/messages.ts`, `lib/timeline.ts` from Augustus. Not independent — this queue was sequenced after his.
- Verification: typecheck, dev server, click through every channel and profile at 375px and 1440px
- User-approved to execute: yes
- High-cost approval: not required
- Outward acts authorized: none
- Report back if blocked by assumption: yes

## Execution Notes

Delivered in this order:

1. App shell — sidebar with channels and registry, thread, composer.
2. Context rail rendering harness markdown, with distinct empty and missing states.
3. URL routing per channel so reload preserves position.
4. Responsive drawers below `lg`, with backdrop dismissal.
5. Agent profile timeline — stat strip, verdicts with their fixes, promotion cards.
6. `AppShell` extraction so the profile and channel views share one shell.
7. Guided tour at `/demo` with spotlight dimming and keyboard control.

## Stop Conditions

- Stop before writing outside `app/` and `components/`.
- Stop for a broken assumption, conflicting design direction, missing approval, or scope expansion.
- Preserve unrelated user changes; never reset, clean, or bulk-replace them.
