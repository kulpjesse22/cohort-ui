# Lesson — Harness field-instance drift

Last updated: 2026-08-13
Source: lessons-panel

## Trigger

- Starting work that reads, renders, or reasons about this project's `Agents/` docs.

## Rule

- Diff the locally installed harness against upstream HAI-Harness before treating the installed copy as current, and promote changes path-by-path rather than bulk-copying either direction.

## Why

- This project's `Agents/` tree ran three weeks behind upstream without anyone noticing: it was missing `lessons/INDEX.md`, `traffic-control`, and `lesson-logger`, and still carried `patterns.md`, `graveyard.md`, and `retrospective` after upstream retired them.
- The UI reads these files live, so a stale field instance silently renders a retired model as if it were current.

## Verify

- `hai-harness doctor` passes, and the promoted paths match upstream at the commit they came from.
