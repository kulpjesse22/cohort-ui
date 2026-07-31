# Product Planning

<!--
## How To Use This File

- Claudia owns this file.
- Keep current product truth, backlog, active strategy, worker assignments, approvals, and user decisions here.
- Keep completed evidence concise and move bulk history to `_archive/`.
- Do not use this file as a worker journal.
-->

Planner-owned single source of truth for the current iteration.

Last updated: 2026-07-30 10:15 PDT
Last updated by: Claudia
User check-in after material clarification: not required
High-cost execution approved: no
Outward acts approved: publish to a public repo for feedback

## Governing Rule

- The latest confirmed human decision supersedes every older conflicting decision, plan, task, handoff, or historical note.
- Apply clear precedence to keep work moving, but always flag the conflict and update the stale durable source through its owning role.
- Archived material is evidence only. It is never executable unless this plan or the current worker task explicitly restates it.

## Current Product Truth

- **Product direction:** Cohort is a workspace UI over a HAI-Harness repo. It renders the harness; the markdown remains the source of truth.
- **Current scope boundary:** v1 shell over the five real roles with a seeded conversation layer. No live agent backend.
- **Non-negotiable constraint:** anything the UI presents as durable must correspond to a real file on disk.
- **Latest decision that supersedes older material:** Cohort lives in its own repository rather than inside the harness fork. The harness is installed into this repo so the app can read a real one.

## 1. Inbox (untriaged)

- **[ ]** (design) **Consumer-grade visual polish** — next up. See T-7.
- **[ ]** (feature) Derive seniority from timeline evidence instead of a static label
- **[ ]** (feature) Read timeline entries from `handoffs/` and `lessons/` instead of seed data
- **[ ]** (experiment) Wire the composer to a real agent session

## 2. Backlog

| ID | Title | Type | Priority | Status | Owner | Notes / Links |
| --- | --- | --- | --- | --- | --- | --- |
| T-1 | Derive seniority from evidence | feature | P1 | inbox | - | Blocked on the open question in `UX.md`. UI carries a placeholder caveat until resolved. |
| T-2 | Timeline reads real handoffs/lessons | feature | P1 | inbox | - | The durable version of `lib/timeline.ts`. |
| T-3 | Live agent wiring | experiment | P2 | inbox | - | Decides whether Cohort is a control surface or a viewer. |
| T-4 | Figma / SVG asset export | feature | P3 | inbox | - | From the original concept; not started. |
| T-5 | Edit-sync back from Figma | feature | P3 | inbox | - | Depends on T-4. |
| T-6 | Light mode | design | P1 | done | Julius | Shipped. Semantic token layer, three neutrals, persisted toggle. |
| T-7 | Consumer-grade visual polish | design | P1 | next | - | User request. Blocked on a design decision first — see below. |

### T-7 notes (pre-work, not yet assigned)

Goal: make the product feel distinctive and crafted rather than merely correct.

**The decision that has to come first.** `design.md` currently commits to the
opposite of consumer polish, in writing:

- Design intent: "calm, dense, and quiet… closer to a well-set changelog than a
  chat app."
- Elevation: "depth comes from background steps and borders, not shadows."
- Motion: "only three things animate… nothing animates on load."
- Don't: "add shadows, gradients, or entrance animations."

So most of what "polish" usually means is currently *forbidden by the guide*.
Hephaestus has to resolve this before any implementation, and the honest options
are not equivalent:

1. **Raise the craft inside the current stance.** Keep restraint; win on
   typography, optical alignment, spacing rhythm, better empty states, a real
   icon set, considered focus states. Nothing in the guide changes. Lower risk,
   and it suits a product whose thesis is "a record you review, not a feed."
2. **Revise the stance.** Explicitly allow depth, motion, and expressive
   moments; rewrite the Motion / Elevation / Do's sections. Higher ceiling for
   "stands out," but it puts the visual language in tension with the product's
   own argument about calm.

Do not split the difference silently. Pick one, write it into `design.md`, then
build.

**Candidate work, once the stance is settled:**

- Type: the interface is one weight and near one size. A real display scale for
  timeline moments would carry most of the perceived quality.
- The promotion card is the product's emotional peak and currently looks like
  every other row. It is the strongest candidate for an expressive treatment.
- Avatars are initials in squares. A generated identity mark per agent would do
  more for distinctiveness than any other single change.
- Empty and first-run states are plain sentences — the highest-leverage place
  for personality, and currently the blandest.
- The guided tour's dimming is functional but flat; a real spotlight/scrim
  treatment would sell it in a screen recording.
- Iconography is three hand-rolled SVGs. Inconsistent by default.

**Constraint that survives either option:** contrast and state clarity are not
negotiable. `UX.md` requires color never be the only signal, and the light theme
must keep AA. Polish must not cost legibility.

### T-6 notes (pre-work, not yet assigned)

The blocker is not CSS, it is that `design.md` commits to dark only and every
color in the app is a literal Tailwind `zinc-*` / accent class. There is no
token layer to swap.

Likely shape of the work, for whoever picks it up:

1. **Hephaestus first.** `design.md` § Colors and § Overview both assert dark
   only. Revise to define each token's light and dark value, and decide whether
   light is a peer theme or the new default. This is a design decision, not an
   implementation detail — it changes what the product's calm/quiet intent means
   when the background is bright.
2. **Introduce the token layer.** Colors are currently hardcoded at call sites
   (`bg-zinc-900`, `text-zinc-400`, `border-zinc-800`, and the verdict/agent
   hues). Map `design.md`'s token names onto CSS variables in `app/globals.css`
   under `@theme`, then replace literals with semantic classes.
3. **Re-check meaning colors.** Verdict hues (emerald/amber/rose) and the five
   agent identity hues were chosen against a dark ground; they need light-mode
   values that hold the same AA contrast. `UX.md` requires color never be the
   only signal, so the text labels already carry the meaning — but the hues
   still must not wash out.
4. **Remove the `dark` class** hardcoded on `<html>` in `app/layout.tsx`, and
   decide the switching mechanism: `prefers-color-scheme`, an explicit toggle,
   or both.
5. **Athena review** against the revised guide, with attention to the dimmed
   spotlight states in `/demo` — `opacity-25` on a light ground reads very
   differently than on a dark one.

## 3. Active Queue

### T-0 — Publish Cohort for feedback

- **Status:** done
- **Priority:** P0
- **Owner sequence:** Claudia → Augustus (data layer) → Julius (UI shell) → Athena review
- **Dependencies:** none
- **User-approved execution:** yes
- **High-cost approval:** not required
- **Outward-act approval:** approved — publish to a public repo

Required outcome:

1. Standalone repo with the harness installed at its root.
2. The app reads that harness live; no broken paths after extraction.
3. A README that explains the concept to someone who has not seen it.

Completion evidence:

- Files or surfaces changed: whole repo; `lib/harness.ts` root resolution.
- Low-cost verification passed: typecheck, dev server, context rail reads real files.
- High-cost verification run: none required.
- Remaining user-owned verification: share and collect feedback.

### 3a. Current Iteration Strategy

- **Goal:** make the concept legible to a reader who arrives cold.
- **Why now:** being shared with a dev/designer for feedback.
- **Context gathered:**
  - The harness is invisible as a folder of markdown; the UI is what makes it explainable.
  - Extraction breaks the context rail unless the harness root is resolved from cwd.
- **Decision:** install the harness into this repo rather than vendoring sample files. The demo is then honest — it shows a real harness, its own.
- **Out of scope:** live agent wiring, asset export, seniority derivation.
- **Worker split:** Parallel Split Gate failed — Julius's components consume the shapes Augustus defines. Sequenced in one queue.
- **Risks:** seeded timeline data could read as real history. Mitigated by labelling placeholders in the UI and stating it in `project_context.md`.

### 3b. Implementation Queues

Assigned queue for Augustus:

1. Complete — data layer, harness reader, API routes.

Assigned queue for Julius:

1. Complete — shell, profile timeline, guided tour.

Advancement rule:

- Continue to the next approved task after the current one is complete.
- Pause for a blocking user decision, broken assumption, write-scope collision, missing high-cost approval, or unapproved outward act.

### 3c. Decision Needed From User

- **Decision:** what evidence should drive seniority?
- **Why it blocks:** T-1 cannot start, and the UI carries a placeholder caveat until it is answered.
- **Options already ruled out:** none yet.

## 5. Feature Ideas / Roadmap

- **Idea:** Adversarial evaluator — a reviewer whose only job is to try to break a worker's output in a sandbox before it ships.
- **Why:** models mark broken work "done"; splitting execution from judgment is the harness's core bet.
- **Rough scope:** L
- **Notes:** from the original concept roadmap.

- **Idea:** Background lesson compaction.
- **Why:** lessons accumulate faster than anyone re-reads them.
- **Rough scope:** M

## 6. Archived State

- Retired handoffs: [`_archive/handoffs/`](_archive/handoffs/)
- Delivered or superseded worker queues: [`_archive/tasks/`](_archive/tasks/)
