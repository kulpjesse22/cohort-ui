import fs from "node:fs/promises";
import path from "node:path";
import { HARNESS_ROOT, stripTemplateComments } from "./harness";
import { getParticipant } from "./agents";
import { YOU, type ReviewHandoff, type ReviewStep } from "./reviews";

/**
 * The real handoff notes in Agents/handoffs/, read off disk per request. Server
 * only: this module reaches for node:fs.
 *
 * A note records the baton pass, not the patch, so these carry no diff. A note
 * whose blockers name a decision is waiting on a person, because in this
 * harness key decisions always go to a human.
 */

const DIR = "Agents/handoffs";
const SKIP = new Set(["README.md", "TEMPLATE.md"]);

const ZONES: Record<string, string> = { PDT: "-07:00", PT: "-07:00", PST: "-08:00", UTC: "Z", Z: "Z" };

function parseUpdated(raw: string | undefined, fallbackDay: string): number {
  const m = raw?.match(/(\d{4}-\d{2}-\d{2})(?:\s+(\d{1,2}:\d{2}))?\s*([A-Z]{1,3})?/);
  const day = m?.[1] ?? fallbackDay;
  const time = m?.[2] ?? "12:00";
  const zone = ZONES[m?.[3] ?? "UTC"] ?? "Z";
  const ts = Date.parse(`${day}T${time.padStart(5, "0")}:00${zone}`);
  return Number.isNaN(ts) ? Date.parse(`${fallbackDay}T12:00:00Z`) : ts;
}

function humanize(title: string): string {
  const bare = title.replace(/^handoff\s*[-–—:]\s*/i, "").trim();
  const words = bare.includes(" ") ? bare : bare.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function sections(md: string): { heading: string; items: string[] }[] {
  const out: { heading: string; items: string[] }[] = [];
  let current: { heading: string; items: string[] } | null = null;
  for (const line of md.split("\n")) {
    const h = line.match(/^##\s+(.+)/);
    if (h) {
      current = { heading: h[1].trim(), items: [] };
      out.push(current);
      continue;
    }
    if (!current) continue;
    const bullet = line.match(/^\s*-\s+(.*)/);
    if (bullet) current.items.push(bullet[1].trim());
    else if (line.trim() && current.items.length > 0 && /^\s{2,}/.test(line)) {
      current.items[current.items.length - 1] += ` ${line.trim()}`;
    } else if (line.trim()) current.items.push(line.trim());
  }
  return out.filter((s) => s.items.length > 0);
}

/** Drops the markdown that reads as noise in a plain sentence. */
export function plain(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`([^`]+)`/g, "$1");
}

function find(all: { heading: string; items: string[] }[], name: RegExp) {
  return all.find((s) => name.test(s.heading));
}

async function readNote(file: string, now: number): Promise<ReviewHandoff | null> {
  const rel = `${DIR}/${file}`;
  let raw: string;
  try {
    raw = stripTemplateComments(await fs.readFile(path.join(HARNESS_ROOT, rel), "utf8"));
  } catch {
    return null;
  }

  const title = raw.match(/^#\s+(.+)$/m)?.[1] ?? file.replace(/\.md$/, "");
  const from = raw.match(/^From:\s*(.+)$/m)?.[1]?.trim() ?? "Unknown";
  const updated = raw.match(/^Last updated:\s*(.+)$/m)?.[1];
  const day = file.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? "2026-01-01";
  const ts = parseUpdated(updated, day);
  const ageMinutes = Math.max(1, Math.round((now - ts) / 60_000));

  const authorName = from.replace(/\s*\(.*\)\s*$/, "").trim();
  const known = getParticipant(authorName.toLowerCase());
  const author = known ? known.id : authorName.toLowerCase();

  const all = sections(raw);
  const status = find(all, /^status/i)?.items ?? [];
  const blockers = find(all, /blocker|decision/i)?.items ?? [];
  const next = find(all, /next step/i)?.items ?? [];
  const filesSection = find(all, /files/i)?.items ?? [];
  const namedFiles = [
    ...new Set(filesSection.flatMap((l) => [...l.matchAll(/`([^`]+\.[a-z]+)`/g)].map((m) => m[1]))),
  ];

  const done = status.filter((s) => /^done/i.test(s)).map((s) => plain(s.replace(/^done:\s*/i, "")));
  const open = status.filter((s) => !/^done/i.test(s)).map(plain);
  const waiting = blockers.length > 0;

  const activity: ReviewStep[] = [
    ...done.map((text): ReviewStep => ({
      minutesAgo: ageMinutes + 1,
      actor: author,
      actorName: authorName,
      kind: "change",
      text,
    })),
    ...open.map((text): ReviewStep => ({
      minutesAgo: ageMinutes + 1,
      actor: author,
      actorName: authorName,
      kind: "read",
      text,
    })),
    {
      minutesAgo: ageMinutes,
      actor: author,
      actorName: authorName,
      kind: "handoff",
      text: waiting ? "Filed the note with a decision for a person." : "Filed the note.",
      path: rel,
    },
  ];

  return {
    id: `note-${file.replace(/\.md$/, "")}`,
    title: humanize(title),
    author,
    authorName: known ? undefined : authorName,
    reviewer: waiting ? YOU : null,
    state: waiting ? "waiting" : "filed",
    ageMinutes,
    branch: null,
    files: [],
    provenance: "live",
    source: rel,
    namedFiles,
    sections: all,
    guide: {
      summary: waiting
        ? `${authorName} filed this note with a blocker only a person can clear. It is read from the file as written; nothing below is paraphrased.`
        : `${authorName} filed this note. Nothing in it is waiting on a person.`,
      changed: done,
      check: next.map(plain),
    },
    activity,
  };
}

export async function getLiveHandoffs(now: number = Date.now()): Promise<ReviewHandoff[]> {
  let files: string[];
  try {
    files = (await fs.readdir(path.join(HARNESS_ROOT, DIR))).filter((f) => f.endsWith(".md") && !SKIP.has(f));
  } catch {
    return [];
  }
  const notes = await Promise.all(files.sort().reverse().map((f) => readNote(f, now)));
  return notes.filter((n): n is ReviewHandoff => n !== null);
}
