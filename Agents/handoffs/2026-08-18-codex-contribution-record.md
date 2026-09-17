# Handoff - Codex contribution record lane

Last updated: 2026-08-18 00:00 PT
From: Codex
To: next assigned worker

## Status

- Done: `components/ContributionRecord.tsx` renders the committed contribution snapshot on the project timeline.
- Done: `lib/contributions.ts` provides typed access to `data/contributions.json`.
- Done: `components/TeamTimeline.tsx` folds the contribution record into `/timeline`.
- Done: the work was committed with `Co-Authored-By: Codex <codex@openai.com>`.
- Not started: deciding whether contributions become their own view or replace the seeded project history.

## Files touched or in scope

- `components/ContributionRecord.tsx`
- `components/TeamTimeline.tsx`
- `lib/contributions.ts`
- `data/contributions.json`
- `scripts/contributions.mjs`

## Contracts / invariants

- Declare this lane before editing these files again; do not independently rebuild the same surface in parallel.
- Contribution data comes from Git history plus `Co-Authored-By` trailers. Do not hand-edit attribution except by regenerating the snapshot from real commits.
- The snapshot is allowed to trail the latest snapshot-update commit by one commit; otherwise updating the snapshot would require an endless commit loop.
- Guided-tour motion must keep the build check green: no `translate*()` inside `tour-` CSS rules.
- Do not leave an animation end state on an element that also has a transition. Animations end at base state, or the element does not transition that property.

## Verification

- Ran: `npx tsc --noEmit`
- Ran: `npm run build`
- Ran: production verification on `/timeline`

## Blockers / decisions needed

- Product decision: keep derived contributions folded into the project timeline, move them to their own view, or let them replace the seeded project history.
- Product decision: switch the timeline to real data wholesale only if losing Julius's illustrative growth arc is acceptable.

## Exact next step

- If continuing this lane, decide the placement of derived contributions before changing UI code.
