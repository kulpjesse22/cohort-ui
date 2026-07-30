# Design Guide

<!--
## How To Use This File

- This is the project's single source of truth for concrete visual style:
  tokens, components, spacing, type, motion, and voice.
- Builders (Augustus, Julius) read it before writing any UI and match it.
- Hephaestus designs within it; Athena and Hephaestus check adherence. When a
  style choice conflicts with an outside pattern, THIS FILE wins.
- Interaction behavior, terminology, and domain rules live in `UX.md`, not here.
-->

The concrete visual language for Cohort. Hephaestus designs within it, builders
match it, reviewers check adherence to it. If it is not written here, it is not
the standard.

## Overview

- **Surface:** Cohort workspace — sidebar, thread, profile timeline, context rail.
- **Design intent:** calm, dense, and quiet. A reference document you scan, not
  an app that demands attention. Closer to a well-set changelog than a chat app.
- **Platforms:** web. Single breakpoint at Tailwind `lg` (1024px); below it the
  side panels become drawers.
- **Light / dark:** dark only. There is no light theme and the app does not
  respond to `prefers-color-scheme`.

## Colors

Tailwind `zinc` is the entire neutral system. Accent hues carry meaning only —
never decoration.

| Token | Value | Use |
| --- | --- | --- |
| `color.bg` | `zinc-900` | Page background, main column |
| `color.surface` | `zinc-950` | Sidebar, context rail |
| `color.surface.raised` | `zinc-900/60` | Code blocks, fix lists |
| `color.text` | `zinc-100` | Primary text |
| `color.text.secondary` | `zinc-400` | Body copy, descriptions |
| `color.text.muted` | `zinc-500` | Timestamps, labels |
| `color.text.faint` | `zinc-600` | File paths, hints |
| `color.border` | `zinc-800` | Dividers, panel edges |
| `color.border.strong` | `zinc-700` | Inputs, buttons, badges |

Meaning colors — used for verdicts and status, never for emphasis:

| Token | Value | Means |
| --- | --- | --- |
| `color.approved` | `emerald-*` | Approved, promotion, healthy |
| `color.fixes` | `amber-*` | Approved with fixes |
| `color.revise` | `rose-*` | Revise, error |

Per-agent identity hues, used only for avatars and registry names:
Claudia `violet`, Augustus `sky`, Julius `teal`, Athena `amber`,
Hephaestus `rose`.

- **Contrast target:** WCAG AA (4.5:1) for body text. `zinc-500` on `zinc-900`
  is the floor and is reserved for non-essential metadata.

## Typography

- **UI:** Geist Sans. **Mono:** Geist Mono, for file paths, seniority
  transitions, and step counters only.

| Role | Size | Weight | Notes |
| --- | --- | --- | --- |
| Page title | `text-base` | 600 | Channel name, agent name |
| Stat value | `text-lg` | 600 | Timeline summary numbers |
| Entry title | `text-sm` | 500 | Timeline entries, message authors |
| Body | `text-[13px]` | 400 | Message text, entry detail |
| Meta | `text-[11px]` | 400 | Timestamps, titles, captions |
| Micro | `text-[10px]` | 400–500 | Badges, kind labels, file paths |

Body sits at 13px deliberately: the product is read in volume, and 14px pushed
too little content into view.

## Spacing & Layout

- **Scale:** Tailwind default. In practice 1.5 / 2 / 3 / 4 / 5 / 6.
- **Shell:** fixed 256px sidebar, fluid main column, fixed 320px context rail.
- **Reading width:** timeline content caps at `max-w-2xl`. Threads run full width.
- **Density:** compact. Vertical rhythm of 4 between messages, 5 between
  timeline entries.

## Elevation & Depth

- Depth comes from background steps and borders, not shadows.
- The only shadows are on mobile drawers (`shadow-2xl`), where a panel genuinely
  floats over content. Removed at `lg`.

## Motion

- **Durations:** 200ms for drawers, 300ms for progress fills, 500ms for
  spotlight dimming.
- Only three things animate: drawer transforms, opacity for tour focus, and
  skeleton pulse. Nothing animates on load.
- Layout never animates. No entrance transitions on threads or timelines.

## Shape & Radius

- `rounded-md` for controls and rows, `rounded-lg` for cards and panels,
  `rounded-xl` for the tour caption bar. `rounded-full` for dots and progress.
- Borders are 1px. The only 2px stroke is the tour's highlight ring.

## Components

| Component | Variants | Notes |
| --- | --- | --- |
| Avatar | agent (hued), user (neutral); `sm` / `md` | Initials only. No images. |
| Badge | seniority, verdict, kind label | Bordered, never filled except verdicts. |
| Channel row | default / active | Active is `zinc-800` fill. |
| Registry row | — | Avatar, name, title, seniority. Links to profile. |
| Message | agent / user, optional pinned | Avatar left, stacked meta and body right. |
| Timeline entry | task / review / lesson / promotion | Promotion is a full-width card; the rest are dotted rail items. |
| Stat tile | — | Value over label, bordered. |
| Context doc | content / empty / missing | Monospace `pre`, capped at `max-h-56`. |
| Composer | — | Auto-growing textarea, inline error below. |
| Skeleton | thread / rail | Pulsing shapes matching real content. |

## States

- **Empty** — plain sentence in `zinc-500`, centered. Never an illustration.
- **Loading** — skeletons shaped like the content. Never a spinner.
- **Error** — inline, `rose-400`, adjacent to the failed control, input preserved.
- **Disabled** — `opacity-40` plus `cursor-not-allowed`.
- **Missing vs. empty** — dashed border for both, but distinct copy. See `UX.md`.
- **Long content** — `pre` blocks scroll internally; titles truncate; body wraps.
- **Placeholder data** — anything not yet derived from evidence carries a visible
  caveat. See the seniority note in the sidebar footer.

## Voice & Content

- Plain and specific. Say what a thing is, not what it is like.
- Labels name the destination or result: "View profile", "Message #julius",
  never "Manage" or "View details".
- Sentence case everywhere except the uppercase section labels
  (`CHANNELS`, `REGISTRY`, `HISTORY`, `PINNED REPO CONTEXT`).
- Dates as "Jul 30, 2026". Times as "Jul 30, 7:02 AM".
- Never claim more than is true. If a value is a placeholder, the UI says so.

## Accessibility

- All actions reachable by keyboard; Enter sends, Shift+Enter newlines.
- Icon-only buttons carry `aria-label` ("Open channels", "Open pinned context").
- Color is never the only signal: verdicts pair color with their text label, and
  entry kinds pair a dot with a word.
- Decorative marks (`▶`, timeline rail, icons) are `aria-hidden`.
- Minimum target 32px on interactive rows.

## Do's and Don'ts

- **Do:** let hierarchy come from spacing, weight, and muted text.
- **Do:** show evidence next to any status.
- **Don't:** introduce a new accent hue for emphasis. Hues carry meaning.
- **Don't:** add shadows, gradients, or entrance animations.
- **Don't:** use a spinner where a skeleton fits.
