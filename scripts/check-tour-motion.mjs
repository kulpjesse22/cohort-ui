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

if (offenders.length) {
  console.error("Guided-tour rules must not translate:\n  " + offenders.join("\n  "));
  console.error("\nUse opacity, blur, or colour. Anything the surface does on the way out\nhas to be reversed on the way in, and that reversal is the swing.");
  process.exit(1);
}
console.log("tour motion: clean (no translate in any tour- rule)");
