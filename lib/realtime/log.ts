import fs from "node:fs/promises";
import path from "node:path";
import type { Message } from "../messages";
import { redis, redisEnabled, redisPipeline } from "./redis";
import { poke } from "./bus";

/**
 * The append-only message log, behind one interface with two backends.
 *
 * Both are ordered lists, so a cursor is just an index: "I have seen the first
 * N entries, give me the rest." That is the whole contract the SSE stream
 * needs, and it is why swapping the backend does not change the client.
 *
 * Redis (a LIST per channel) is the shared one. The filesystem backend is the
 * original behaviour, kept because it is honest about what it is: on Vercel
 * the disk is read-only, the write is dropped, and the thread lives only in
 * the browser that typed it.
 */
const DATA_DIR = path.join(process.cwd(), "data", "messages");

const memoryLog = (globalThis as unknown as { __cohortLog?: Map<string, Message[]> })
  .__cohortLog ?? new Map<string, Message[]>();
(globalThis as unknown as { __cohortLog?: Map<string, Message[]> }).__cohortLog = memoryLog;

function key(channelId: string): string {
  return `cohort:log:${channelId}`;
}

function filePathFor(channelId: string): string {
  return path.join(DATA_DIR, `${channelId}.json`);
}

async function readFile(channelId: string): Promise<Message[]> {
  try {
    const raw = await fs.readFile(filePathFor(channelId), "utf8");
    return JSON.parse(raw) as Message[];
  } catch {
    // No file yet, or a read-only target. Neither is a failure state.
    return memoryLog.get(channelId) ?? [];
  }
}

async function writeFileLog(channelId: string, messages: Message[]): Promise<void> {
  // Held in memory too, so a read-only deploy still fans a message out to the
  // other viewers on this instance for as long as it lives.
  memoryLog.set(channelId, messages);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePathFor(channelId), JSON.stringify(messages, null, 2));
  } catch {
    // Read-only deploy target. Losing the write costs persistence, not the
    // interaction — the caller already has the message.
  }
}

/** Everything appended to this channel, oldest first. Excludes seed messages. */
export async function readLog(channelId: string): Promise<Message[]> {
  if (!redisEnabled) return readFile(channelId);
  const raw = await redis<string[]>("LRANGE", key(channelId), 0, -1);
  return (raw ?? []).map((s) => JSON.parse(s) as Message);
}

/**
 * Everything after `cursor`, plus the cursor to pass next time.
 *
 * A cursor past the end returns nothing and hands the same cursor back, so a
 * caller that reconnects with a stale-but-valid cursor simply catches up.
 */
export async function readLogSince(
  channelId: string,
  cursor: number
): Promise<{ cursor: number; messages: Message[] }> {
  if (!redisEnabled) {
    const all = await readFile(channelId);
    return { cursor: all.length, messages: all.slice(cursor) };
  }
  const [raw, len] = await redisPipeline<never>([
    ["LRANGE", key(channelId), cursor, -1],
    ["LLEN", key(channelId)],
  ]);
  const messages = ((raw as unknown as string[]) ?? []).map((s) => JSON.parse(s) as Message);
  return { cursor: (len as unknown as number) ?? cursor + messages.length, messages };
}

/** How many entries exist, so a fresh stream can start from "now". */
export async function logLength(channelId: string): Promise<number> {
  if (!redisEnabled) return (await readFile(channelId)).length;
  return (await redis<number>("LLEN", key(channelId))) ?? 0;
}

export async function appendLog(channelId: string, message: Message): Promise<void> {
  if (redisEnabled) {
    await redis("RPUSH", key(channelId), JSON.stringify(message));
  } else {
    const all = await readFile(channelId);
    all.push(message);
    await writeFileLog(channelId, all);
  }
  poke(channelId);
}
