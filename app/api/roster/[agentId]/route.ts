import { NextRequest, NextResponse } from "next/server";
import { getAgent, type AgentId } from "@/lib/agents";
import {
  COLOR_OPTIONS,
  MARK_OPTIONS,
  VOICES,
  type AgentCustomization,
} from "@/lib/roster";
import {
  getCustomization,
  saveCustomization,
  resetCustomization,
} from "@/lib/roster-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  if (!getAgent(agentId)) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 404 });
  }
  return NextResponse.json({ customization: await getCustomization(agentId as AgentId) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  if (!getAgent(agentId)) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch: Partial<AgentCustomization> = {};

  if (body.displayName !== undefined) {
    const v = String(body.displayName).trim();
    if (!v || v.length > 40) {
      return NextResponse.json({ error: "Name must be 1–40 characters" }, { status: 400 });
    }
    patch.displayName = v;
  }
  if (body.title !== undefined) {
    const v = String(body.title).trim();
    if (!v || v.length > 60) {
      return NextResponse.json({ error: "Title must be 1–60 characters" }, { status: 400 });
    }
    patch.title = v;
  }
  if (body.workingStyle !== undefined) {
    const v = String(body.workingStyle).trim();
    if (v.length > 200) {
      return NextResponse.json({ error: "Working style is too long" }, { status: 400 });
    }
    patch.workingStyle = v;
  }
  if (body.mark !== undefined) {
    if (!MARK_OPTIONS.includes(body.mark)) {
      return NextResponse.json({ error: "Unknown mark" }, { status: 400 });
    }
    patch.mark = body.mark;
  }
  if (body.color !== undefined) {
    if (!COLOR_OPTIONS.includes(body.color)) {
      return NextResponse.json({ error: "Unknown colour" }, { status: 400 });
    }
    patch.color = body.color;
  }
  if (body.voiceId !== undefined) {
    if (!VOICES.some((v) => v.id === body.voiceId)) {
      return NextResponse.json({ error: "Unknown voice" }, { status: 400 });
    }
    patch.voiceId = body.voiceId;
  }

  return NextResponse.json({ customization: await saveCustomization(agentId as AgentId, patch) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  if (!getAgent(agentId)) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 404 });
  }
  return NextResponse.json({ customization: await resetCustomization(agentId as AgentId) });
}
