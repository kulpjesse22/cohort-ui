---
name: lesson-logger
description: Turn a confirmed process failure into a structural fix: a deterministic check, a standing gate, or a capped conditional lesson. Claudia uses it on qualifying feedback and at new-task intake when unswept evidence exists.
---

# Lesson Logger

Push confirmed lessons as far down the promotion ladder as possible while keeping always-loaded memory small. This is Claudia-owned. Workers and reviewers put evidence in their reports or handoffs; they do not write lesson state.

## Trigger filter

Ask: **Should the harness realistically have prevented this feedback?**

Run on a false-complete report, repeated correction, violated written rule, approach-invalidating rework, or process surprise. Do not run on ordinary aesthetic steering, first-time preferences, new requirements, or a legitimate choice between options. At most one invocation per failure class per session.

At each new Claudia task, compare the normal intake docs with the `Last swept:` marker in `Agents/lessons/INDEX.md`. Load this skill only when a new handoff, status change, correction, or current-message trigger exists. Advance the marker after processing the hit.

## Read scope

1. `Agents/lessons/INDEX.md` for deduplication and the sweep cursor.
2. The current failure evidence or unswept planning/handoff events.
3. Only lesson files surfaced by deduplication.

## Disposition ladder

- **Tier 0 — Mechanize.** A deterministic check can catch the class. Put a compact check specification under `Pending Tier 0 specs` in the index for Claudia to queue. Delete the entry when the check lands; the check becomes the memory.
- **Tier 1 — Institutionalize.** An unconditional category-wide rule. Add one imperative sentence between the `standing-gates` markers in `Agents/project_context.md`. Maximum 7 gates.
- **Tier 2 — Conditional lesson.** Judgment applies only under a specific trigger. Write one lesson of at most 30 lines from `TEMPLATE.md` and one routing entry. Maximum 25 index entries.
- **Discard.** The incident is not reusable. Leave its story in the existing handoff/report.

When a budget is full, merge, promote, or retire an entry in the same edit. A Tier 2 recurrence should promote toward Tier 1 or 0. A violated Tier 1 gate should mechanize if possible or be rewritten so it bites. A Tier 2 item that has not fired across ten subsequent completed tasks is a retirement candidate.

## Formats

Index entry:

`- [do|never] when {trigger} → {imperative}. ({file}.md · src {task} · fired {n})`

Standing gate:

`- {imperative sentence}. (src {task})`

Tier 2 lesson: Trigger, Rule, Why (at most three evidence lines), Verify.

## Completion

- Every index entry links one lesson file and every active lesson file has one entry.
- Budgets and the sweep cursor are current.
- Report each disposition in one line. Ask only when a proposed Tier 0 check adds high-cost behavior; all existing approval gates still apply.
