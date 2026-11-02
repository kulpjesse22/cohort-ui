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
- **Design intent:** calm, dense, and quiet — but with character. A reference
  document you scan, not an app that demands attention, and not a sterile one
  either.

### The craft stance

Delight here comes from **craft and character, not effects.** The product should
be enjoyable to use without ever competing with the work it displays.

Permitted, and encouraged:

- **Expressive typography.** A real scale, with genuine contrast between a
  moment and a row. This is the single largest source of perceived quality.
- **Distinctive identity.** Agents carry their own marks, not generic initials.
- **Warmth in language.** Empty states and microcopy may have a voice. Blank is
  not the same as neutral.
- **Responsive feedback.** Hover, focus, and press states should feel immediate
  and considered. A 120ms colour transition is craft, not decoration.
- **Exactly one celebratory moment:** the promotion entry. It is the emotional
  peak of the product and is allowed to look like it.

Still forbidden:

- Decorative gradients, drop shadows used for depth, glows.
- Entrance animations, parallax, scroll-triggered reveals, shimmer.
- Motion that does not aid comprehension.
- Anything that costs legibility or contrast.

If a change makes a screenshot busier without making the work easier to read,
it is out of scope.

### Principles

Every screen is checked against these. They are rules about hierarchy and
honesty, not a look.

1. **One thing leads.** Each screen has one element in the display face: the
   welcome headline, a profile's name, the timeline's sentence, memory's three
   counts against their caps, the promotion. Everything else steps down by
   size, weight or tone, never by putting it in a box.
2. **Three families, one job each.** Bricolage Grotesque leads, Lato reads and
   operates, JetBrains Mono marks the record: a file path, a SHA, a file's
   contents. If it is not in the repo, it is not mono.
3. **Shape carries state.** Entry kinds, verdicts, provenance and rank read in
   grayscale. Hue repeats what the shape says; it is never the only signal.
4. **Hue means one thing.** Agent hues are identity. Verdict hues are verdicts.
   The brand pink is the product speaking. Nothing borrows another's hue for
   emphasis or decoration.
5. **Space before lines.** Groups separate by space and a 1px hairline. Boxes
   are kept for things that really are objects: the composer, inputs, the
   welcome preview, floating panels.
6. **Say where it came from.** Every surface says whether it reads the repo or
   shows a staged example, up front rather than behind a click (see
   Provenance under States).
7. **Quiet chrome.** The header, rails and sidebar hold still and stay small,
   so the page's subject is the loudest thing on it.
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

**Brand accent.** `brand` (`#ff1493`) is fixed across both themes — it is not
a semantic or per-agent hue, so it does not get a light/dark pair. It is
reserved for a small, deliberate set of brand-only moments where the product
itself is speaking, not a conversation: the app icon, the primary CTA on the
landing screen, and the tour's progress indicator. It must not spread into
conversational UI (composer, verdict badges, agent rings) — those already
carry meaning, and a fourth unassigned color there would compete with it
rather than reinforce it.

**Code.** Inside the diff panel only, and never outside it: a muted syntax set
(`syn-keyword`, `syn-string`, `syn-type`, `syn-number`, `syn-comment`) and the
diff tints (`diff-add`, `diff-del`, with `diff-add-ink` / `diff-del-ink` for
the signs and line counts). Each holds AA on `code-bg` in both themes. The
hues are low-chroma on purpose, and the `+`/`−` sign says what the tint says.

- **Contrast target:** WCAG AA (4.5:1) for body text, in **both** themes. A
  token that passes in dark and fails in light is a bug, not a tradeoff.
- Color is never the only signal (see `UX.md`), so hues may soften — but the
  text label carrying the same meaning must always be present.

## Typography

- **UI:** Lato — the face Slack ships in its own product. Humanist rather than
  geometric: open apertures and warmer letterforms. Geist, the previous face,
  read cold and generic, which worked against a product about teammates.
- **Mono:** JetBrains Mono, for the repo record only: file paths, SHAs, file
  contents. Chosen for its tall x-height, which sits optically level with
  Lato instead of shrinking beside it.
- **Display:** Bricolage Grotesque (`font-display`), variable, set at optical
  size 60 and width 92. Only for the one element that leads a screen. A
  grotesk with ink traps and a heavy end, close to the wordmark's weight, so
  the lead sounds like the product rather than the interface. Not a serif on
  purpose: the reading voice here is Lato's.

**Lato ships 400 / 700 / 900 — there is no 500 or 600.** Browsers resolve
`font-semibold` (600) up to 700 and `font-medium` (500) down to 400. That is
fine as used here: semibold carries names and titles and correctly lands on
bold, and medium only appears on small uppercase labels where the weight was
never doing the work. Do not reach for medium to create emphasis — it will
silently render as regular.

The scale is eight named steps, defined once in `app/globals.css` (`@theme`)
with their line height and tracking. Use the names, not pixel sizes.

| Token | Size / line | Face | Use |
| --- | --- | --- | --- |
| `text-hero` | 56 / 0.98, −0.035em | Display 700 | Welcome headline only (`sm` and up) |
| `text-lead` | 40 / 1.04, −0.03em | Display 600 | A profile's name; the welcome headline on phones |
| `text-title` | 28 / 1.1, −0.025em | Display 600 | A screen's lead sentence (two-tone: ink, then `ink-3`), the promotion, the 404 |
| `text-figure` | 32 / 1, −0.03em | Display 600, tabular | Stat figures: profile summary, memory counts |
| `text-heading` | 15 / 1.35, −0.01em | Lato 700 | Channel name, entry titles, tier names |
| `text-body` | 14 / 1.62 | Lato 400 | Messages, entry detail, rules |
| `text-meta` | 12 / 1.45 | Lato 400 | Names in rows, times, provenance, captions |
| `text-label` | 11 / 1.3 (uppercase labels add 0.06em) | Lato 700 uppercase, or mono | Section labels; paths and file contents in mono |

Two rules do most of the work:

- **Negative tracking above 14px, never below it.** Large text set at default
  tracking is the most common tell of an unconsidered interface; small text
  needs its spacing left alone.
- **Section labels are the only uppercase.** `text-label`, `ink-3`, bold — so
  they recede by size and tone rather than compete.
- **Nothing under 11px, nothing in `ink-4`.** `ink-4` is for rules and
  disabled states; text that carries meaning is `ink-3` or darker.

Body sits at 14px. It was 13px under Geist, but Lato has a smaller x-height, so
the same nominal size read noticeably tighter. Metrics travel with the typeface:
when the face changes, re-check the scale rather than assuming the numbers hold.
Dense metadata stays at 10–11px.

## Spacing & Layout

- **Scale:** Tailwind default. In practice 1.5 / 2 / 3 / 4 / 5 / 6.
- **Shell:** fixed 256px sidebar, fluid main column, fixed 320px context rail.
  The header is one 56px row, matched by the rail's header. Reviews and
  Settings drop the rail: Reviews brings its own list panel (336px) beside
  the handoff. Below `lg` the list and the handoff are separate screens, with
  "All reviews" leading back. The Board drops it too; its Display panel
  (304px) opens on the right at `lg` and as a bottom sheet below it.
- **Sidebar:** top to bottom: the workspace menu (wordmark and chevron), search
  and compose; Inbox and My agents; the collapsible Workspace group (Board,
  timeline, memory, the shared channels); Your agents, each expandable to its
  Conversations and Reviews; then Try, pinned to the bottom above Settings and
  the theme toggle. Group labels are uppercase `text-label`. No row carries a
  count. Collapsed groups are remembered in the browser.
- **Board:** columns 264px wide on a horizontally scrolling canvas, 8px apart.
  Column headers stick to the top; swimlane headers stick to the left so a
  lane's name stays in view on a phone.
- **Reading width:** timeline, profile and memory cap at `max-w-2xl` with
  48px above the lead (32px on phones). Message text caps at 44rem.
- **Density:** compact rows, generous sections. 6–7 between timeline entries,
  10 between day groups, 14 between memory tiers.

## Elevation & Depth

- Depth comes from background steps and borders, not shadows.
- The only shadows are on mobile drawers (`shadow-2xl`), where a panel genuinely
  floats over content. Removed at `lg`. Two small exceptions belong to
  affordances, not depth: the faint inset of a pressed control and the hairline
  lift of a segmented toggle's chosen pill (below).

## Affordances

How a control answers the hand. The behaviour follows Linear; the colours stay
Cohort's warm ink. Classes live in `globals.css` § Affordances.

- **Hover and press indent.** A control is pressed *into* its surface: a faint
  ink tint plus a soft inset shadow on hover (`aff`), a little deeper on press,
  120ms in and 60ms on press. No outline and no border change, ever. Keyboard
  focus is the same indent with a soft inset ring.
- **Icon buttons** are borderless, use the line icons in `Icons.tsx` (16px box,
  1.4 stroke, round caps) and sit in `ink-3` until hovered or active. Each has
  an `aria-label`; the composer's and the theme toggle's also show a `data-tip`
  tooltip.
- **Segmented toggles** (`seg`): no outer border. A tinted track; the chosen
  option is a filled, slightly raised pill.
- **Chips and filters** (`chip`): plain text when off, a filled tint when on.
  No outlined pills. Colour swatches follow the same rule.
- **Secondary buttons** (`aff-fill`): a quiet tint at rest instead of a border.
- **Theme toggle:** sun and moon only, no words; "Light theme" / "Dark theme"
  as label and tooltip.
- **Switches** (`switch`, on Settings): 28×16 and flat; a filled `control`
  track when on, plain grey when off, no outline. The knob slides 120ms and
  not at all under reduced motion. `role="switch"`, labelled by its row.
- **Dropdowns** in settings rows are native `select`s with `aff-fill`: a quiet
  tint, a line chevron, `text-meta`. Native so phones get their own picker.
- **Menus** (the share menu on a handoff): a floating panel on `canvas` with a
  `line-strong` border and no shadow. Rows are `aff`, a line icon then the
  label, with a `text-meta` hint on the right. Groups split by a hairline and
  an uppercase label ("Open in"). Arrow keys, Home and End move; Escape closes
  and hands focus back. A copy is confirmed on the row itself ("Copied"),
  never by a toast.
- **Tabs** are chips with `role="tab"`; the chosen one is filled via
  `aria-selected`. Arrow keys move between them.
- **Board cards** (`board-card`): `raised` on the column's wash, `rounded-lg`,
  no border. Hover is the same tint and inset as `aff`, laid over the raised
  fill; focus adds the inset ring.
- **Column wash** (`board-col`, `board-col-head`): a 2% ink tint, 4% on Needs
  you. Neutral on purpose: hue belongs to verdicts, and a column is not one.
- **"+ New"** is a bare `aff` row in `ink-3`: in each lane's Queued cell, or in
  the lane header when columns are by priority. It opens the channel where a
  task is briefed; it never creates anything by itself.
- **Display properties** are chips with `aria-pressed`: filled when shown.

## Motion

- **Durations:** 200ms for drawers, 300ms for progress fills, 500ms for
  spotlight dimming.
- Only these animate: drawer transforms, opacity for tour focus, skeleton
  pulse, and a switch's knob (120ms). Nothing animates on load, and under
  reduced motion the drawers and the knob jump.
- Layout never animates. No entrance transitions on threads or timelines.

## Shape & Radius

- `rounded-md` for controls and rows, `rounded-lg` for cards and panels,
  `rounded-xl` for the tour caption bar. `rounded-full` for dots and progress.
- Borders are 1px. The only 2px stroke is the tour's highlight ring.

## Components

| Component | Variants | Notes |
| --- | --- | --- |
| Avatar | agent (crew bust), human (initials); `sm` / `md` / `lg` | Agents carry a corner dot. |
| Marks (`Marks.tsx`) | kind, verdict, provenance, rank | The only way state is drawn. See States. |
| Channel row | default / active | Active is a filled ink tint (`aria-current`). |
| Registry row | — | Avatar, name, title, then the seniority word and its rungs. No badge box. |
| Message | agent / user, optional pinned | Avatar left, stacked meta and body right. Pinned is a pin glyph and the word. |
| Timeline entry | task / review / lesson / decision / brief / promotion | A kind mark on a hairline rail. Promotion is set in `text-title` between two `approved-line` hairlines, no fill. |
| Figure row | — | Display figure over a `text-meta` label, the row between two hairlines. No tiles. |
| Context doc | content / empty / missing | Mono `pre` behind a left hairline, capped at `max-h-56`. |
| Handoff indicator | `relay` / `line` | `relay` (animated beads) where the handoff is the subject: the welcome preview. `line` in app chrome, including the guided tour, which is the app with a caption over it. |
| Tour caption | — | A `rounded-xl` panel on `panel` with a 1px border, no shadow. Step dots are grey; the current one is brand. |
| Composer | — | Auto-growing textarea, inline error below. |
| Skeleton | thread / rail | Pulsing shapes matching real content. |
| Review row | — | Title, then a handoff mark and its status in `text-meta`; the author's avatar and the age on the right. Selected is the filled ink tint. |
| Diff panel | — | A `rounded-lg` object on `code-bg` with a 1px border. File header in mono with `+n −m`. Rows carry old and new numbers, a `+`/`−` sign, the line tinted `diff-add`/`diff-del`. At `lg` an "After" column sits beside it in one quiet tone (`ink-3`, no syntax hue). Lines wrap with a two-character hang; ligatures off. |
| Settings card | — | Rows on a `raised` card, `rounded-lg`, no border, split by hairlines. Label and hint left, one control right. |
| Board column | state / priority | Header: a board-state (or priority) mark, the name, the count, on the column wash. |
| Board card | — | Task (two lines), an optional note, the last line as "Name: text", then avatar and name, priority bars and word, provenance mark, age. Each part after the task is a display property. |
| Swimlane | agent / project / none | A chevron, the avatar or folder mark, the name, the count. Collapses; remembered. |
| Display panel | side / sheet | Layout `seg`, three compact selects, three switches, property chips, then Reset and Set default. Escape closes and returns focus. |
| Workspace menu | — | The wordmark and a chevron. The one workspace there is, then Welcome and the tour. |

## States

- **Empty** — a plain sentence in `ink-3` that says what will appear there.
  Never an illustration, never a dashed box.
- **Loading** — skeletons shaped like the content. Never a spinner.
- **Error** — inline, `revise`, adjacent to the failed control, input preserved.
- **Disabled** — `opacity-40` plus `cursor-not-allowed`.
- **Missing vs. empty** — two shapes and two sentences: a struck ring for a
  file that is not in the repo, a dashed ring for one that is still an
  unfilled template. See `UX.md`.
- **Kinds** — shipped: filled square; review: ring; lesson: open diamond;
  decision: filled diamond; brief: open wedge; promotion: filled chevron.
  All `ink-3` except the promotion, which takes `approved`.
- **Verdicts** — approved: filled check; approved with fixes: half-filled
  ring; revise: a ring that turns back on itself. Each with its word, in its
  verdict hue.
- **Handoffs** — waiting: open wedge; in review: ring with a centre dot;
  verdicts use the verdict marks; filed: filled square. A stale close is the
  settings acting, not a judgment, so it stays `ink-3` whatever it is called:
  closed is a barred ring, returned a turn-back arrow, parked two bars.
- **Provenance** — filled dot: read live from the repo; half dot: a committed
  snapshot; open ring: seeded to show a shape; dashed ring: illustrative,
  nothing behind it. Shown at the top of the surface it describes.
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
