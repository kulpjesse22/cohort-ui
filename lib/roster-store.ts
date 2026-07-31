import fs from "node:fs/promises";
import path from "node:path";
import { AGENTS, type AgentId } from "./agents";
import { defaultCustomization, type AgentCustomization } from "./roster";

// Server-only. Kept apart from lib/roster.ts so client components can import
// the voice catalog and types without pulling node:fs into the browser bundle.

const FILE = path.join(process.cwd(), "data", "roster.json");

type Store = Partial<Record<AgentId, Partial<AgentCustomization>>>;

async function readStore(): Promise<Store> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Store;
  } catch {
    return {};
  }
}

export async function getCustomization(id: AgentId): Promise<AgentCustomization> {
  const store = await readStore();
  return { ...defaultCustomization(id), ...(store[id] ?? {}) };
}

export async function getAllCustomizations(): Promise<Record<AgentId, AgentCustomization>> {
  const store = await readStore();
  const out = {} as Record<AgentId, AgentCustomization>;
  for (const id of Object.keys(AGENTS) as AgentId[]) {
    out[id] = { ...defaultCustomization(id), ...(store[id] ?? {}) };
  }
  return out;
}

export async function saveCustomization(
  id: AgentId,
  patch: Partial<AgentCustomization>
): Promise<AgentCustomization> {
  const store = await readStore();
  const next: AgentCustomization = {
    ...defaultCustomization(id),
    ...(store[id] ?? {}),
    ...patch,
  };
  store[id] = next;
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(store, null, 2));
  return next;
}

export async function resetCustomization(id: AgentId): Promise<AgentCustomization> {
  const store = await readStore();
  delete store[id];
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(store, null, 2));
  return defaultCustomization(id);
}
