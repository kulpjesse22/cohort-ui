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
- **Light / dark:** both, as peer themes. Neither is the "real" one. Light is
  the default for a first-time visitor, matching the Slack-adjacent comp;
  the choice persists once made, and `prefers-color-scheme` seeds the
  first visit.

## Colors

Colors are **semantic tokens**, not raw Tailwind classes. Every token has a
light and a dark value, defined once in `app/globals.css` and consumed as
`bg-canvas`, `text-ink`, `border-line`, and so on. Never write a raw
`zinc-*` class in a component — if a color is missing, add a token.

Neutrals:

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `canvas` | `white` | `zinc-900` | Page background, main column |
| `panel` | `#f7f7f8` | `#101014` | Context rail — a quiet step off canvas |
| `raised` | `zinc-100` | `zinc-900/60` | Code blocks, fix lists, stat tiles |
| `ink` | `zinc-900` | `zinc-100` | Primary text |
| `ink-2` | `zinc-600` | `zinc-400` | Body copy, descriptions |
| `ink-3` | `zinc-500` | `zinc-500` | Timestamps, section labels |
| `ink-4` | `zinc-400` | `zinc-600` | File paths, hints |
| `line` | `zinc-200` | `zinc-800` | Dividers, panel edges |
| `line-strong` | `zinc-300` | `zinc-700` | Inputs, buttons, badges |
| `hover` | `zinc-100` | `zinc-900` | Row hover |
| `active` | `zinc-200` | `zinc-800` | Selected row |

`ink-3` is deliberately the same value in both themes: it is the metadata floor
and holds AA against either ground.

**The third neutral — the sidebar.** The left navigation carries its own
identity and stays dark in *both* themes, the way Slack's does. It is a cool
graphite rather than an aubergine, so it sits underneath the agent hues without
competing with them. Because it never goes light, it needs its own text scale —
never use `ink-*` inside the sidebar.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `sidebar` | `#24262f` | `#131319` | Left nav background |
| `sidebar-ink` | `#f2f2f4` | `zinc-100` | Primary text |
| `sidebar-ink-2` | `#b4b8c4` | `zinc-400` | Secondary text |
| `sidebar-ink-3` | `#878c9b` | `zinc-500` | Labels, metadata |
| `sidebar-line` | `#33363f` | `zinc-800` | Dividers |
| `sidebar-line-strong` | `#454955` | `zinc-700` | Badges, buttons |
| `sidebar-hover` | `#2e313b` | `#1d1d23` | Row hover |
| `sidebar-active` | `#3b3f4b` | `#2a2a31` | Selected row |

Agent hues inside the sidebar always use the bright (300-level) tints in both
themes — the light theme's 600-level values would disappear against it. The
`.sidebar-scope` class handles this, so call sites stay identical.

Meaning colors — verdicts and status, never emphasis. Each needs a light value
that holds contrast on a bright ground, so the light theme steps *darker* rather
than reusing the dark theme's tints:

| Token | Light text | Dark text | Means |
| --- | --- | --- | --- |
| `approved` | `emerald-700` | `emerald-300` | Approved, promotion |
| `fixes` | `amber-700` | `amber-300` | Approved with fixes |
| `revise` | `rose-700` | `rose-300` | Revise, error |

Per-agent identity hues, used only for avatars and registry names. Same rule —
`600` in light, `300` in dark: Claudia `violet`, Augustus `sky`, Julius `teal`,
Athena `amber`, Hephaestus `rose`.

- **Contrast target:** WCAG AA (4.5:1) for body text, in **both** themes. A
  token that passes in dark and fails in light is a bug, not a tradeoff.
- Color is never the only signal (see `UX.md`), so hues may soften — but the
  text label carrying the same meaning must always be present.

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
