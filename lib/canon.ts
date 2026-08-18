import fs from "node:fs/promises";
import path from "node:path";

/**
 * The document the human has named authoritative.
 *
 * The point of this is not the acknowledgement — it is that the choice changes
 * what the planner does afterwards. Remembering is passive; this is the smallest
 * honest version of learning, where a preference stated once alters later
 * behaviour without being restated.
 *
 * Held in module state and mirrored to disk best-effort. Vercel's filesystem is
 * read-only, so the write is allowed to fail: the choice still holds for the
 * session, which is what a demo needs. On a writable checkout it survives a
 * restart.
 */
const STORE = path.join(process.cwd(), "data", "canon.json");

let canonical: string | null = null;
let loaded = false;

async function load(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await fs.readFile(STORE, "utf8");
    canonical = JSON.parse(raw).path ?? null;
  } catch {
    canonical = null;
  }
}

export async function getCanon(): Promise<string | null> {
  await load();
  return canonical;
}

/** Demo reset: clears the choice so a run can start from unpinned. */
export async function clearCanon(): Promise<void> {
  await load();
  canonical = null;
  try {
    await fs.unlink(STORE);
  } catch {
    // Never written, or read-only target. Module state is already cleared.
  }
}

export async function setCanon(docPath: string): Promise<void> {
  await load();
  canonical = docPath;
  try {
    await fs.mkdir(path.dirname(STORE), { recursive: true });
    await fs.writeFile(STORE, JSON.stringify({ path: docPath }, null, 2));
  } catch {
    // Read-only target. The choice still holds for this session.
  }
}
