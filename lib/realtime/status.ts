import { redis, redisEnabled } from "./redis";
import type { AgentId } from "../agents";
import { poke } from "./bus";

/**
 * Live agent status — the half of "real time" that no socket to a browser can
 * solve, because the browser is not where the work happens.
 *
 * The harness pushes here (`POST /api/events`) when an agent starts, finishes,
 * or hands off. Statuses are stored per channel and read by the SSE tail, so
 * one write reaches every viewer of that channel.
 *
 * A status goes stale rather than being cleared: an agent that dies mid-task
 * never sends a "done", and a status line that says "Building..." forever is a
 * lie with a timestamp on it. Anything older than the window is dropped.
 */
const STALE_AFTER_MS = 90_000;

export interface AgentStatus {
  agentId: AgentId;
  label: string;
  /** Optional one-line why, shown when the indicator is opened. */
  detail?: string;
  ts: number;
}

const memory = ((globalThis as unknown as { __cohortStatus?: Map<string, Map<string, AgentStatus>> })
  .__cohortStatus ??= new Map<string, Map<string, AgentStatus>>());

const statusKey = (c: string) => `cohort:status:${c}`;

export async function setStatus(channelId: string, status: AgentStatus): Promise<void> {
  if (redisEnabled) {
    await redis("HSET", statusKey(channelId), status.agentId, JSON.stringify(status));
    await redis("EXPIRE", statusKey(channelId), 600);
  } else {
    const room = memory.get(channelId) ?? new Map<string, AgentStatus>();
    room.set(status.agentId, status);
    memory.set(channelId, room);
  }
  poke(channelId);
}

export async function getStatuses(channelId: string): Promise<AgentStatus[]> {
  const cutoff = Date.now() - STALE_AFTER_MS;
  let all: AgentStatus[];

  if (redisEnabled) {
    // HGETALL over REST comes back as a flat [field, value, field, value] array.
    const flat = (await redis<string[]>("HGETALL", statusKey(channelId))) ?? [];
    all = [];
    for (let i = 1; i < flat.length; i += 2) {
      try {
        all.push(JSON.parse(flat[i]) as AgentStatus);
      } catch {
        // A malformed entry is not worth failing a whole stream tick over.
      }
    }
  } else {
    all = [...(memory.get(channelId)?.values() ?? [])];
  }

  return all.filter((s) => s.ts >= cutoff).sort((a, b) => b.ts - a.ts);
}
