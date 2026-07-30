import fs from "node:fs/promises";
import path from "node:path";
import type { AgentId } from "./agents";

// Where the harness docs live. This repo has the harness installed at its own
// root (Agents/ and Human/ next to the app), so cwd is the default. Point
// HARNESS_ROOT at any other harness-managed project to read that one instead.
const HARNESS_ROOT = process.env.HARNESS_ROOT
  ? path.resolve(process.env.HARNESS_ROOT)
  : process.cwd();

export interface ContextDoc {
  label: string;
  path: string;
  content: string | null;
}

function stripTemplateComments(md: string): string {
  return md.replace(/<!--[\s\S]*?-->/g, "").trim();
}

function excerpt(md: string, maxLines = 24): string {
  const lines = md.split("\n");
  return lines.slice(0, maxLines).join("\n");
}

async function readDoc(label: string, relPath: string): Promise<ContextDoc> {
  try {
    const raw = await fs.readFile(path.join(HARNESS_ROOT, relPath), "utf8");
    return { label, path: relPath, content: excerpt(stripTemplateComments(raw)) };
  } catch {
    return { label, path: relPath, content: null };
  }
}

const CHANNEL_DOCS: Record<string, [label: string, relPath: string][]> = {
  claudia: [
    ["Project context", "Agents/project_context.md"],
    ["Active queue (planning.md)", "Agents/planning.md"],
  ],
  augustus: [["Assigned queue", "Agents/tasks/augustus.md"]],
  julius: [["Assigned queue", "Agents/tasks/julius.md"]],
  athena: [
    ["Design guide", "Agents/design.md"],
    ["UX guide", "Agents/UX.md"],
  ],
  hephaestus: [
    ["UX guide", "Agents/UX.md"],
    ["Design guide", "Agents/design.md"],
  ],
  "design-crit": [
    ["Design artifacts", "Agents/designs/README.md"],
    ["Handoffs", "Agents/handoffs/README.md"],
  ],
};

export async function getChannelContext(channelId: string): Promise<ContextDoc[]> {
  const docs = CHANNEL_DOCS[channelId] ?? [];
  return Promise.all(docs.map(([label, relPath]) => readDoc(label, relPath)));
}

export type { AgentId };
