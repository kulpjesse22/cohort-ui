import fs from "node:fs/promises";
import path from "node:path";
import { HARNESS_ROOT, stripTemplateComments } from "./harness";

// The harness caps its always-loaded memory on purpose: small enough that every
// agent can carry it on every turn. The caps live in prose in
// Agents/skills/lesson-logger/SKILL.md; mirrored here so the UI can show how
// close the team is to having to merge, promote, or retire something. They ship
// in the payload rather than as exported constants, because this module reaches
// for node:fs and must never be imported by a client component.
const MAX_ENTRIES = 25;
const MAX_GATES = 7;

const INDEX_PATH = "Agents/lessons/INDEX.md";
const CONTEXT_PATH = "Agents/project_context.md";

/** Tier 2. A judgment call that only applies under a named trigger. */
export interface LessonEntry {
  kind: "do" | "never";
  trigger: string;
  imperative: string;
  /** Filename as written in the index, e.g. "elevenlabs-api-preconditions.md". */
  file: string;
  /** Repo-relative path, for display and for the doc viewer. */
  path: string;
  /** The task that produced the lesson. */
  source: string | null;
  /** How many times the trigger has since matched. Promotion pressure. */
  fired: number;
  /** The index links a lesson file that is not on disk. */
  broken: boolean;
}

/** Tier 1. An unconditional rule, always loaded with project context. */
export interface StandingGate {
  text: string;
  source: string | null;
}

/** Tier 0. A rule waiting to become a deterministic check and stop being memory. */
export interface PendingCheck {
  text: string;
  source: string | null;
}

export interface LessonMemory {
  /** False when this project's harness predates the lessons index. */
  installed: boolean;
  indexPath: string;
  contextPath: string;
  /** Null while the index has never been swept. */
  lastSwept: string | null;
  entries: LessonEntry[];
  gates: StandingGate[];
  pending: PendingCheck[];
  /** Index lines that did not match the entry grammar. Surfaced, not dropped. */
  malformed: string[];
  /** The harness's own caps, so the UI can show how close each tier is to one. */
  limits: { entries: number; gates: number };
}

/** Pull `(file.md · src task · fired 3)` apart without caring about field order. */
function parseMeta(meta: string): { file: string | null; source: string | null; fired: number } {
  let file: string | null = null;
  let source: string | null = null;
  let fired = 0;

  for (const raw of meta.split("·")) {
    const part = raw.trim();
    if (part.endsWith(".md")) file = part;
    else if (part.startsWith("src ")) source = part.slice(4).trim();
    else if (part.startsWith("fired ")) fired = Number.parseInt(part.slice(6), 10) || 0;
  }
  return { file, source, fired };
}

// - [do|never] when {trigger} → {imperative}. ({file}.md · src {task} · fired {n})
const ENTRY = /^-\s*\[(do|never)\]\s+when\s+(.+?)\s*→\s*(.+?)\s*\(([^()]*)\)\s*$/;

/** Take the bullet lines under a `## Heading`, treating "None." as empty. */
function sectionBullets(md: string, heading: string): string[] {
  const lines = md.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return [];

  const bullets: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ")) break;
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) bullets.push(trimmed);
  }
  return bullets;
}

/** Strip a trailing `(src task)` off a gate or check, returning both halves. */
function splitSource(text: string): { text: string; source: string | null } {
  const match = text.match(/^(.*?)\s*\(src\s+([^()]+)\)\s*$/);
  if (!match) return { text: text.trim(), source: null };
  return { text: match[1].trim(), source: match[2].trim() };
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readStandingGates(): Promise<StandingGate[]> {
  let raw: string;
  try {
    raw = await fs.readFile(path.join(HARNESS_ROOT, CONTEXT_PATH), "utf8");
  } catch {
    return [];
  }

  // The markers are the contract: lesson-logger writes only between them, so
  // the UI reads only between them too.
  const block = raw.match(/<!--\s*standing-gates:start\s*-->([\s\S]*?)<!--\s*standing-gates:end\s*-->/);
  if (!block) return [];

  return block[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => splitSource(line.slice(2)));
}

export async function getLessonMemory(): Promise<LessonMemory> {
  const base: LessonMemory = {
    installed: false,
    indexPath: INDEX_PATH,
    contextPath: CONTEXT_PATH,
    lastSwept: null,
    entries: [],
    gates: [],
    pending: [],
    malformed: [],
    limits: { entries: MAX_ENTRIES, gates: MAX_GATES },
  };

  let raw: string;
  try {
    raw = await fs.readFile(path.join(HARNESS_ROOT, INDEX_PATH), "utf8");
  } catch {
    return base;
  }

  const md = stripTemplateComments(raw);

  const sweptLine = md.split("\n").find((line) => line.startsWith("Last swept:"));
  const swept = sweptLine?.slice("Last swept:".length).trim() ?? "";
  // The shipped index says "not yet — ..."; treat anything without a date as unswept.
  const lastSwept = /\d/.test(swept) ? swept : null;

  const entries: LessonEntry[] = [];
  const malformed: string[] = [];

  for (const bullet of sectionBullets(md, "Entries")) {
    if (bullet.toLowerCase() === "- none.") continue;
    const match = bullet.match(ENTRY);
    if (!match) {
      malformed.push(bullet.slice(2));
      continue;
    }
    const [, kind, trigger, imperative, meta] = match;
    const { file, source, fired } = parseMeta(meta);
    if (!file) {
      malformed.push(bullet.slice(2));
      continue;
    }
    const relPath = `Agents/lessons/${file}`;
    entries.push({
      kind: kind as "do" | "never",
      trigger: trigger.trim(),
      imperative: imperative.trim().replace(/\.$/, ""),
      file,
      path: relPath,
      source,
      fired,
      broken: !(await exists(path.join(HARNESS_ROOT, relPath))),
    });
  }

  const pending = sectionBullets(md, "Pending Tier 0 specs")
    .filter((bullet) => bullet.toLowerCase() !== "- none.")
    .map((bullet) => splitSource(bullet.slice(2)));

  return { ...base, installed: true, lastSwept, entries, pending, malformed, gates: await readStandingGates() };
}
