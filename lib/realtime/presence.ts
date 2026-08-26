import { redisEnabled, redisPipeline } from "./redis";

/**
 * Who is actually looking at this channel right now.
 *
 * Presence is a claim with a short shelf life, so it is stored as one: a
 * sorted set scored by the last heartbeat, read back as "everyone seen inside
 * the window". Nothing has to log out cleanly. A closed tab stops beating and
 * falls out of the window on its own, which is the only disconnect signal a
 * browser reliably gives you.
 *
 * Typing is the same mechanism with a shorter window, because a typing
 * indicator that outlives the typing is worse than none.
 */
const LIVE_WINDOW_MS = 15_000;
const TYPING_WINDOW_MS = 5_000;

export interface Viewer {
  sessionId: string;
  name: string;
  typing: boolean;
}

type Beat = { seenAt: number; typingAt: number };
const memory = ((globalThis as unknown as { __cohortPresence?: Map<string, Map<string, Beat>> })
  .__cohortPresence ??= new Map<string, Map<string, Beat>>());

const presenceKey = (c: string) => `cohort:presence:${c}`;
const typingKey = (c: string) => `cohort:typing:${c}`;

/** `sessionId::name`, so one read returns both without a second lookup. */
const member = (sessionId: string, name: string) => `${sessionId}::${name}`;

function parse(m: string): { sessionId: string; name: string } {
  const at = m.indexOf("::");
  return at === -1
    ? { sessionId: m, name: "Someone" }
    : { sessionId: m.slice(0, at), name: m.slice(at + 2) };
}

export async function heartbeat(
  channelId: string,
  sessionId: string,
  name: string,
  typing: boolean
): Promise<void> {
  const now = Date.now();
  const m = member(sessionId, name);

  if (redisEnabled) {
    const cmds: (string | number)[][] = [
      ["ZADD", presenceKey(channelId), now, m],
      ["ZREMRANGEBYSCORE", presenceKey(channelId), 0, now - LIVE_WINDOW_MS],
      // Cheap insurance against a key outliving the room that made it.
      ["EXPIRE", presenceKey(channelId), 60],
      ["EXPIRE", typingKey(channelId), 60],
    ];
    cmds.push(
      typing
        ? ["ZADD", typingKey(channelId), now, m]
        : ["ZREM", typingKey(channelId), m]
    );
    await redisPipeline(cmds);
    return;
  }

  const room = memory.get(channelId) ?? new Map<string, Beat>();
  room.set(m, { seenAt: now, typingAt: typing ? now : 0 });
  memory.set(channelId, room);
}

export async function leave(channelId: string, sessionId: string, name: string): Promise<void> {
  const m = member(sessionId, name);
  if (redisEnabled) {
    await redisPipeline([
      ["ZREM", presenceKey(channelId), m],
      ["ZREM", typingKey(channelId), m],
    ]);
    return;
  }
  memory.get(channelId)?.delete(m);
}

export async function viewers(channelId: string): Promise<Viewer[]> {
  const now = Date.now();

  if (redisEnabled) {
    const [live, typing] = await redisPipeline<string[]>([
      ["ZRANGEBYSCORE", presenceKey(channelId), now - LIVE_WINDOW_MS, "+inf"],
      ["ZRANGEBYSCORE", typingKey(channelId), now - TYPING_WINDOW_MS, "+inf"],
    ]);
    const typingSet = new Set(typing ?? []);
    return (live ?? []).map((m) => ({ ...parse(m), typing: typingSet.has(m) }));
  }

  const room = memory.get(channelId);
  if (!room) return [];
  const out: Viewer[] = [];
  for (const [m, beat] of room) {
    if (now - beat.seenAt > LIVE_WINDOW_MS) {
      room.delete(m);
      continue;
    }
    out.push({ ...parse(m), typing: now - beat.typingAt <= TYPING_WINDOW_MS });
  }
  return out;
}
