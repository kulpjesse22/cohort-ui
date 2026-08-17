# Handoff - visual-density-pass

Last updated: 2026-08-16 12:20 PDT
From: Claude (UI lane)
To: Codex, and whoever picks up the rest of the density pass

## Status

- Done: nothing yet — this note claims the lane before editing.
- In progress: `components/LessonLadder.tsx` only, as the pattern-setter for a
  reduced-chrome visual pass (Notion/Linear register, without copying either).
- Not started: the same treatment on every other surface. Deliberately blocked
  until the collision below is resolved.

## Files touched or in scope

- `components/LessonLadder.tsx` — mine for this pass.
- **Not touching**, because they are yours right now: `components/Composer.tsx`,
  `components/WelcomeScreen.tsx`, `components/LeadHandoffIndicator.tsx`.
- `app/globals.css` — **shared, and we are both already in it.** I am adding no
  new rules there this pass. My existing `.relay-*` and `.agent-halo` rules are
  committed; your `.lead-handoff` / `.handoff-*` rules are uncommitted on top.

## Contracts / invariants

- The warm neutral palette is a deliberate anti-Linear choice — `#fff` plus zinc
  "reads as a spreadsheet" (see the comment in `globals.css`). Do not neutralise
  it toward a cooler grey while chasing the reference.
- Brand pink stays reserved for brand-only moments: app icon, primary landing
  CTA, tour spotlight. It is not a UI accent.
- The density pass is subtraction: prefer order, spacing, type, and contrast
  over containers, borders, badges, and shadows. This is `hephaestus.md`'s rule,
  not a new one — the UI currently violates it.
- Target three type sizes per surface, not six.
- Colour must mean something. Neutral is the default.

## Blockers / decisions needed

**Duplicate component.** We have independently built the same pattern:

- `components/LeadHandoffIndicator.tsx` (yours) — static; composition matches the
  reference sketch closely: two beads overlapping left, pill, lead bead right.
  Mounted in `WelcomeScreen.tsx` and `Composer.tsx`.
- `components/AgentRelay.tsx` (mine) — shuttle motion between two actors, a
  scenario model, and an interactive wrapper (`RelayStage.tsx`, route `/relay`).
  Mounted in `AppShell.tsx`.

Both are live, in three mount points, with near-duplicate CSS. Suggested
resolution, for Jesse to confirm: **one component — your composition, my
motion.** Neither is wrong; they answer different halves of the same request.
Until that lands, neither of us should start a cross-cutting visual pass,
because `globals.css` is the file such a pass touches most.

## Verification

- Ran: `npx tsc --noEmit`, `npm run lint` (scoped to changed files), and browser
  checks in light and dark at desktop and mobile widths.
- Not run: the full lint suite is not clean — there are 10 pre-existing
  `react-hooks/set-state-in-effect` errors in files neither of us introduced.

## Exact next step

- Confirm the merge direction on the duplicate component with Jesse.
- Then apply the vocabulary established in `LessonLadder.tsx` outward, one
  surface per pass, rather than a single sweeping change.
