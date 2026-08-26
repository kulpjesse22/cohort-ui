import { NextRequest, NextResponse } from "next/server";
import { AGENTS, getChannel, type AgentId } from "@/lib/agents";
import { setStatus } from "@/lib/realtime/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Where the harness tells Cohort what an agent is doing.
 *
 * This is the ingest that makes the status line true instead of decorative.
 * Locally a file watcher on `Agents/` can post here; on a deploy the agent
 * runner does. Either way the browser is downstream of the work, which is the
 * only arrangement that can be honest — a UI cannot observe a process it has
 * no channel to.
 *
 * Shared-secret auth, because this writes something every viewer sees. With no
 * secret configured the route refuses rather than defaulting to open: a status
 * feed anyone can post to is a worse failure than one that is switched off.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.COHORT_EVENTS_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Event ingest is not configured" }, { status: 503 });
  }
  if (req.headers.get("x-cohort-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const channelId = typeof body?.channelId === "string" ? body.channelId : "";
  const agentId = body?.agentId as AgentId;
  const label = typeof body?.label === "string" ? body.label.trim().slice(0, 80) : "";

  if (!getChannel(channelId)) {
    return NextResponse.json({ error: "Unknown channel" }, { status: 400 });
  }
  if (!agentId || !(agentId in AGENTS)) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
  }
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }

  await setStatus(channelId, {
    agentId,
    label,
    detail: typeof body?.detail === "string" ? body.detail.slice(0, 240) : undefined,
    ts: Date.now(),
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
