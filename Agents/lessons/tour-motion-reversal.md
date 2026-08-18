# Lesson — Guided-tour motion reversal

Last updated: 2026-08-17
Source: demo-transitions

## Trigger

- Animating any guided-tour surface, step chip, or handoff indicator.

## Rule

- Never translate. Express state with opacity, blur, or colour — and never leave
  an animation's end-state on an element that also carries a `transition`.

## Why

- The tour slid sideways on every step for four rounds of fixes. The motion was
  never in a keyframe: `.tour-phase-out` translated the surface and
  `.tour-phase-in` undid it, and a step chip's animation ended displaced while
  `transition-all` dragged it home.
- Three rewrites of the keyframes changed nothing, because geometry applied on
  the way out has to be reversed on the way in, and the reversal is the swing.

## Verify

- `node scripts/check-tour-motion.mjs` exits zero.
