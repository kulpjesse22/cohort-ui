/**
 * Upstash Redis over REST, or nothing.
 *
 * REST rather than a TCP client because the API routes are serverless: a
 * connection pool that outlives a single invocation is a fiction there, and a
 * fresh TCP handshake per request costs more than an HTTP round trip.
 *
 * When the env vars are absent every caller falls back to a process-local
 * store. That is not multiplayer — it is single-instance, and `npm run dev`
 * happens to be a single instance. The fallback exists so the app runs with no
 * setup, not so it can pretend to be shared.
 */
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redisEnabled = Boolean(url && token);

type Cmd = (string | number)[];

async function post(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${url}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Redis ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/** One command. Returns the raw `result`, which is a string, number, or array. */
export async function redis<T = unknown>(...cmd: Cmd): Promise<T> {
  const json = (await post("", cmd)) as { result: T };
  return json.result;
}

/** Several commands in one round trip. Order in, order out. */
export async function redisPipeline<T = unknown>(cmds: Cmd[]): Promise<T[]> {
  if (cmds.length === 0) return [];
  const json = (await post("/pipeline", cmds)) as { result: T }[];
  return json.map((r) => r.result);
}
