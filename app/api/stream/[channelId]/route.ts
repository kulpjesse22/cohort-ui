import { NextRequest } from "next/server";
import { getChannel } from "@/lib/agents";
import { readLogSince } from "@/lib/realtime/log";
import { onPoke } from "@/lib/realtime/bus";
import { viewers } from "@/lib/realtime/presence";
import { getStatuses } from "@/lib/realtime/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One channel, streamed.
 *
 * Server-Sent Events rather than a WebSocket because nothing here needs to go
 * up this pipe. Messages, heartbeats, and agent events are all ordinary POSTs;
 * only the fan-out has to be live. SSE gets that with no upgrade handshake, no
 * socket server to run beside Next, and automatic reconnection in the browser.
 *
 * Fan-out works by tailing the log on a timer. That is the part people expect
 * to be push, and it is worth being plain about: Upstash speaks REST, REST has
 * no SUBSCRIBE, so the *server* polls once a second and the *client* gets a
 * stream. One poller per connected viewer, not per keystroke, and a same-
 * instance write short-circuits the wait entirely.
 */
const POLL_MS = 1_000;
const PRESENCE_EVERY = 2; // ticks
const KEEPALIVE_MS = 15_000;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  if (!getChannel(channelId)) {
    return new Response("Unknown channel", { status: 404 });
  }

  // Default 0, so a fresh connection replays the whole appended log and the
  // client reconciles by id. That closes the gap between "history loaded" and
  // "stream opened" without the client having to reason about it, and makes a
  // reconnect self-healing. Worth revisiting if a channel's log gets long.
  const startAt = Number(req.nextUrl.searchParams.get("cursor") ?? 0);
  let cursor = Number.isFinite(startAt) && startAt >= 0 ? startAt : 0;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let ticking = false;
      let ticks = 0;
      let lastPresence = "";
      let lastStatus = "";

      function send(event: string, data: unknown) {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // The client vanished between the abort signal and this write.
          closed = true;
        }
      }

      async function tick() {
        if (closed || ticking) return;
        ticking = true;
        try {
          const next = await readLogSince(channelId, cursor);
          if (next.messages.length > 0) {
            cursor = next.cursor;
            send("sync", { cursor, messages: next.messages });
          }

          if (ticks % PRESENCE_EVERY === 0) {
            const [live, statuses] = await Promise.all([
              viewers(channelId),
              getStatuses(channelId),
            ]);
            // Only when something moved. A presence event every two seconds
            // forever would re-render the header for no reason.
            const livePayload = JSON.stringify(live);
            if (livePayload !== lastPresence) {
              lastPresence = livePayload;
              send("presence", { viewers: live });
            }
            const statusPayload = JSON.stringify(statuses);
            if (statusPayload !== lastStatus) {
              lastStatus = statusPayload;
              send("status", { statuses });
            }
          }
          ticks += 1;
        } catch (err) {
          // A backend blip should degrade to "stale", not to a closed stream —
          // the next tick retries and the client never notices.
          console.error(`stream ${channelId}: tick failed`, err);
        } finally {
          ticking = false;
        }
      }

      send("open", { channelId });
      await tick();

      const timer = setInterval(tick, POLL_MS);
      const unsubscribe = onPoke(channelId, () => void tick());

      // Comment frames, not events. Proxies and load balancers close a
      // connection that has been silent, and a comment costs the client nothing.
      const keepalive = setInterval(() => {
        if (!closed) controller.enqueue(encoder.encode(`: keepalive\n\n`));
      }, KEEPALIVE_MS);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(timer);
        clearInterval(keepalive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Already closed by the runtime.
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Nginx and some CDNs buffer a response until it completes, which would
      // hold every event until the stream ends. This turns that off.
      "X-Accel-Buffering": "no",
    },
  });
}
