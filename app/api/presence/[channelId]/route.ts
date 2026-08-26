import { NextRequest, NextResponse } from "next/server";
import { getChannel } from "@/lib/agents";
import { heartbeat, leave } from "@/lib/realtime/presence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The heartbeat. Called on a timer while a tab is open and looking.
 *
 * Deliberately not part of the SSE connection: an open stream proves a socket
 * is alive, not that anyone is there. A backgrounded tab holds its connection
 * for hours. The client stops beating when the tab is hidden, so presence
 * means "watching" rather than "has the page loaded".
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  if (!getChannel(channelId)) {
    return NextResponse.json({ error: "Unknown channel" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId.slice(0, 64) : "";
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  // "::" separates the two halves of a presence member, so it cannot appear
  // inside one of them.
  const name = (typeof body?.name === "string" ? body.name : "Someone")
    .replace(/::/g, ":")
    .slice(0, 40);

  if (body?.leaving) {
    await leave(channelId, sessionId, name);
  } else {
    await heartbeat(channelId, sessionId, name, Boolean(body?.typing));
  }

  return NextResponse.json({ ok: true });
}
