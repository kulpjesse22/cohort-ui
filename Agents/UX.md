# UX Guide

<!--
## How To Use This File

- This is the project's single source of truth for interaction and domain
  knowledge: research findings, interaction conventions, terminology, and the
  business rules that shape behavior. It is the counterpart to `design.md`:
  that file is what the product LOOKS like, this file is how it BEHAVES and
  what its words MEAN.
- Written for agentic consumption. Keep entries terse, structured, and
  scannable — tables and short bullets over prose.
- Hephaestus owns and shepherds this file. He may create, edit, restructure,
  and extend it as the product's understanding deepens.
- Research findings, glossary definitions, and domain rules are human-sourced.
  Hephaestus does not invent them. When a finding conflicts with what he
  observes, he flags the conflict to the human — he never silently overwrites
  it.
- `Observed Patterns` is where Hephaestus records intuition he has genuinely
  earned across multiple artifacts on this product. Every entry carries the
  evidence that grounds it.
- Builders (Augustus, Julius) read this before writing any UI and follow it.
  Athena and Hephaestus review the artifact against it.
-->

The interaction and domain language for Cohort. Hephaestus shepherds it,
builders follow it, and reviewers check adherence to it. If it is not written
here, it is not the standard.

## Overview

- **Surface:** Cohort — the workspace UI over a HAI-Harness repository.
- **Primary users:** someone directing a set of agents on real work, and anyone
  auditing later what those agents did and why.
- **The behavioral bar:** this is a record you review, not a feed you keep up
  with. Nothing should create urgency. A user who steps away for a day loses
  nothing by scrolling back.
- **Relationship to `design.md`:** that file owns tokens, type, spacing, color.
  Where the two touch — verdict colors, the promotion treatment — the *meaning*
  is defined here and the *values* are defined there.

## Research Synthesis

| Finding | Evidence / source | Date | Implication |
| --- | --- | --- | --- |
| Chat transcripts lose decisions. Users cannot answer "why is it built this way" from a session log. | The original problem the repo-as-truth model exists to solve. | 2026-07 | Durable state must be a file, and must be visible beside the conversation rather than one click away. |
| A seniority label alone reads as an unearned claim. | Athena's review of the first shell: badges "risk reading as an evaluated rank." | 2026-07-30 | Never show a status without access to the evidence behind it. |
| Vague review findings cause rework loops. | Julius's settings-panel arc: the Revise listing three specific fixes was actionable; general "improve states" notes were not. | 2026-05 | Review outcomes in the UI always show the specific fixes, never a bare verdict. |

- **Segments:** the *director* (briefs work, wants current state fast) and the
  *auditor* (reconstructs history, wants evidence and dates). Both read far more
  than they write.
- **Assumed, not validated:** that users want to message agents from this UI at
  all, rather than only observing. The composer is a bet, not a finding.

## Interaction Standards

| Situation | Cohort's convention | Rationale |
| --- | --- | --- |
| Destructive action | None exist yet. When one lands: confirm only if irreversible, otherwise offer undo. | Confirmation on reversible acts trains dismissal. |
| Undo / reversibility | Prefer undo over confirmation. | The product is a record; recovery matters more than prevention. |
| Error recovery | Errors appear inline next to the control that failed, and preserve the user's input. | A failed send must never cost the message. |
| Data entry | Explicit send. No autosaved drafts. | Posting to a durable record should be deliberate. |
| Navigation | Every view is a URL — `/c/[id]`, `/agent/[id]`. Reload lands where you were. | State a user cannot link to is state they cannot cite. |
| Notifications | None. No badges, unread counts, or toasts. | Urgency contradicts the durable-log thesis. |
| Long-running work | Skeletons shaped like the incoming content, never spinners. | Preserves layout and signals what is arriving. |
| Empty vs. missing | Distinguish explicitly: "not found in the repo" and "empty — still an unfilled template" are different messages. | An unfilled template is an expected state in a fresh harness, not an error. |
| Permissions | Not modeled. | No auth layer exists yet. |

- **Keyboard:** Enter sends, Shift+Enter newlines. The guided tour takes arrow
  keys and space.
- **Never interrupt:** no modal may cover the thread while a user is reading.

## Glossary

| Term | Means | Do NOT call it |
| --- | --- | --- |
| Agent | One of the five named roles defined in `Agents/*.md`. | bot, assistant, AI, model |
| Role | An agent's durable scope and boundaries. Stable across tasks. | persona, character |
| Channel | A scoped conversation with one agent, or `#design-crit`. | room, DM, chat |
| Registry | The sidebar list of agents and their standing. | roster, team list |
| Timeline | An agent's chronological record on its profile. | feed, activity log |
| Verdict | A review outcome: Approved / Approved with fixes / Revise. | score, rating, grade |
| Handoff | A written baton pass between roles, stored in `handoffs/`. | ticket, assignment |
| Lesson | A durable learning written to `lessons/`. | note, memory |
| Seniority | An agent's current standing. Currently a placeholder. | rank, level, XP |
| Harness | The underlying HAI-Harness markdown layer. | backend, framework |

- **Deliberately overloaded:** "review" is both the act Athena performs and the
  performance-review framing of a profile. Disambiguate by context; never add a
  third meaning.
- **Verbatim in UI:** role names are capitalized (Claudia, not claudia) except
  as channel slugs, where `#claudia` is correct.

## Domain Context

- The five roles and their boundaries are defined by the harness, not this app.
  Cohort must not invent a role, or grant one a capability its role doc denies.
- Claudia, Athena, and Hephaestus never write product code. The UI must not
  imply otherwise.
- A verdict belongs to the reviewer who issued it; fixes are assigned back to
  the producing worker. Never show a fix as self-assigned.
- Seniority is not yet derived from anything. Until it is, the UI says so
  wherever it appears.
- Anything the app presents as durable must correspond to a real file. A surface
  showing durable state with no file behind it is a bug.

## Observed Patterns

| Pattern | Evidence | Last confirmed |
| --- | --- | --- |
| One visual climax per view. The thread or timeline dominates; sidebar and rail stay quiet. | Held across the shell, profile, and tour without a competing focal point emerging. | 2026-07-30 |
| Status is shown next to its evidence, never alone. Verdicts carry their fixes; promotions carry the reason. | Athena's badge finding, then applied to promotion cards. | 2026-07-30 |
| Reference material collapses; the record does not. The context rail hides, the timeline has never needed to. | Rail collapse used without loss of comprehension. | 2026-07-30 |

## Open Questions

- **Should the composer send to a live agent, or is Cohort observation-only?**
  - Why it blocks: determines whether this is a control surface or a viewer, and
    changes what the composer implies today.
  - Who can answer: product owner.
- **What evidence should drive seniority?**
  - Why it blocks: the label is a placeholder until settled, and the UI carries a
    caveat in the meantime.
  - Who can answer: product owner, with input from the reviewers.
