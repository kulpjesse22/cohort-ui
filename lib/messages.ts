import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AgentId } from "./agents";

export interface Message {
  id: string;
  channelId: string;
  authorId: AgentId | "user";
  authorName: string;
  text: string;
  ts: string;
  pinned?: boolean;
}

const DATA_DIR = path.join(process.cwd(), "data", "messages");

// Seed conversation dogfoods the harness on the exact work of building this UI —
// it isn't generic filler, it's what actually happened in this session.
const SEED_MESSAGES: Record<string, Omit<Message, "channelId">[]> = {
  claudia: [
    {
      id: "seed-claudia-1",
      authorId: "user",
      authorName: "Jesse",
      text: "Recreate the Cohort UI from the hackathon post and let's keep building on the real harness.",
      ts: "2026-07-30T14:00:00Z",
    },
    {
      id: "seed-claudia-2",
      authorId: "claudia",
      authorName: "Claudia",
      text: "Scope is clear enough to assign. Splitting into: Augustus takes the data layer (agent roster config, harness reader, seed store, API routes). Julius takes the UI shell (sidebar, channel thread, composer, context rail). Dependency: Julius's components consume the shapes Augustus defines, so this is sequenced, not parallel — Parallel Split Gate fails on producer/consumer.",
      ts: "2026-07-30T14:01:00Z",
      pinned: true,
    },
    {
      id: "seed-claudia-3",
      authorId: "claudia",
      authorName: "Claudia",
      text: "Recording in planning.md: current product truth is \"Cohort UI, v1 shell over real HAI-Harness roles, mock conversation layer.\" Non-negotiable constraint: no Figma/export/agent-wiring in this pass — that's roadmap.",
      ts: "2026-07-30T14:02:00Z",
    },
  ],
  augustus: [
    {
      id: "seed-augustus-1",
      authorId: "claudia",
      authorName: "Claudia",
      text: "Queue: 1) agents.ts roster + channel config  2) harness.ts markdown reader for the context rail  3) messages.ts + API routes for GET/POST per channel. Read-only on Agents/ and Human/ — do not write into the harness docs from here.",
      ts: "2026-07-30T14:03:00Z",
      pinned: true,
    },
    {
      id: "seed-augustus-2",
      authorId: "augustus",
      authorName: "Augustus",
      text: "On it. Roster config done — 5 real roles, no invented hackathon names, but kept relabeling a one-file change. Wiring the context reader next so each channel can pull its live doc instead of static copy.",
      ts: "2026-07-30T14:05:00Z",
    },
  ],
  julius: [
    {
      id: "seed-julius-1",
      authorId: "claudia",
      authorName: "Claudia",
      text: "Once Augustus lands the data shapes, build the shell: sidebar (registry + channel list), thread view, composer, collapsible context rail. Dark, dense, Slack-adjacent — nothing in design.md to match yet since it's still a template.",
      ts: "2026-07-30T14:06:00Z",
      pinned: true,
    },
    {
      id: "seed-julius-2",
      authorId: "julius",
      authorName: "Julius",
      text: "Got it — will flag to Hephaestus once there's a real surface for him to look at instead of guessing at tokens ahead of time.",
      ts: "2026-07-30T14:07:00Z",
    },
  ],
  athena: [
    {
      id: "seed-athena-1",
      authorId: "athena",
      authorName: "Athena",
      text: "Waiting on a built surface to review. For v1: flag that empty/loading states matter here more than most demos, since every context-rail doc is currently a template placeholder — that's the real empty state, not a hypothetical one.",
      ts: "2026-07-30T14:08:00Z",
      pinned: true,
    },
  ],
  hephaestus: [
    {
      id: "seed-hephaestus-1",
      authorId: "hephaestus",
      authorName: "Hephaestus",
      text: "Design direction for v1: one visual climax per screen (the active thread), registry seniority as a quiet badge not a headline, and the context rail collapsible by default so it reads as reference material, not the main event.",
      ts: "2026-07-30T14:09:00Z",
      pinned: true,
    },
  ],
  "design-crit": [
    {
      id: "seed-crit-1",
      authorId: "hephaestus",
      authorName: "Hephaestus",
      text: "First pass on the shell is up for crit. Thesis: this should feel like reading a durable log, not a live chat you have to keep up with.",
      ts: "2026-07-30T14:10:00Z",
    },
    {
      id: "seed-crit-2",
      authorId: "athena",
      authorName: "Athena",
      text: "Agree with the thesis. Only flag: make sure seniority badges don't read as a leaderboard — they're a placeholder today, not an evaluated rank, and the UI shouldn't overclaim that.",
      ts: "2026-07-30T14:11:00Z",
    },
    {
      id: "seed-crit-3",
      authorId: "claudia",
      authorName: "Claudia",
      text: "Noted, and matches the plan's own caveat. Not a blocking issue for v1 — logging as a lesson if it comes up again once seniority is actually derived from something.",
      ts: "2026-07-30T14:12:00Z",
    },
  ],
};

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePathFor(channelId: string): string {
  return path.join(DATA_DIR, `${channelId}.json`);
}

async function readPersisted(channelId: string): Promise<Message[]> {
  try {
    const raw = await fs.readFile(filePathFor(channelId), "utf8");
    return JSON.parse(raw) as Message[];
  } catch {
    return [];
  }
}

export async function getMessages(channelId: string): Promise<Message[]> {
  const seed = (SEED_MESSAGES[channelId] ?? []).map((m) => ({ ...m, channelId }));
  const persisted = await readPersisted(channelId);
  return [...seed, ...persisted].sort((a, b) => a.ts.localeCompare(b.ts));
}

export async function appendMessage(
  channelId: string,
  text: string
): Promise<Message> {
  await ensureDir();
  const persisted = await readPersisted(channelId);
  const message: Message = {
    id: randomUUID(),
    channelId,
    authorId: "user",
    authorName: "You",
    text,
    ts: new Date().toISOString(),
  };
  persisted.push(message);
  await fs.writeFile(filePathFor(channelId), JSON.stringify(persisted, null, 2));
  return message;
}
