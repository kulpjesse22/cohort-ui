#!/usr/bin/env node
/**
 * Fails if a guided-tour rule translates.
 *
 * The tour slid sideways on every step change for four rounds of fixes,
 * because the motion did not live in a keyframe: .tour-phase-out translated
 * the surface and .tour-phase-in put it back, and a step chip's animation
 * ended displaced while a transition dragged it home. Both are the same
 * mistake — geometry applied on the way out has to be undone on the way in,
 * and the undoing is the swing.
 *
 * This is that lesson as a check, so it stops being something to remember.
 */
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const offenders = [];
let i = 0;

while (i < css.length) {
  const open = css.indexOf("{", i);
  if (open === -1) break;
  const header = css.slice(Math.max(0, css.lastIndexOf("}", open)), open);
  let depth = 0;
  let end = open;
  while (end < css.length) {
    if (css[end] === "{") depth += 1;
    else if (css[end] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
    end += 1;
  }
  if (/tour-/.test(header)) {
    const body = css.slice(open, end);
    const hit = body.match(/translate[XY3][dD]?\([^)]*\)/);
    if (hit) offenders.push(`${header.replace(/[\n{}]/g, " ").trim().slice(0, 70)} -> ${hit[0]}`);
  }
  i = end + 1;
}

// Second class of the same bug, and the one that survived four rounds: motion
// produced by layout rather than transform. A slot that grows pushes every
// sibling after it sideways and pulls them back on the next step. No transform
// is involved, so the scan above cannot see it.
//
// Deliberately blunt. The classNames here are template literals with nested
// interpolation, so parsing them precisely is fragile; a flat scan for the
// dangerous patterns is harder to fool and easier to trust.
const tsx = readFileSync(new URL("../components/DemoTour.tsx", import.meta.url), "utf8");

if (/transition-\[width\]/.test(tsx)) {
  offenders.push("DemoTour: transition-[width] — animating width reflows every sibling after it");
}
for (const m of tsx.matchAll(/tour-step-slot-active[^}]{0,80}/g)) {
  if (/\bw-\[|\bsm:w-|\bmin-w-\[/.test(m[0])) {
    offenders.push(`DemoTour: the active step slot changes width -> ${m[0].slice(0, 60)}`);
  }
}

if (offenders.length) {
  console.error("Guided-tour rules must not translate:\n  " + offenders.join("\n  "));
  console.error("\nUse opacity, blur, or colour — and never animate width on a row of\nsiblings. Anything that changes geometry on the way out has to be undone\non the way in, and that undoing is the swing.");
  process.exit(1);
}
console.log("tour motion: clean (no translate in any tour- rule)");
