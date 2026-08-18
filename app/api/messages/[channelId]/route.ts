import { NextRequest, NextResponse } from "next/server";
import { getMessages, appendMessage, appendAgentReply } from "@/lib/messages";
import { replyTo } from "@/lib/replies";
import { getCanon } from "@/lib/canon";
import { getChannel } from "@/lib/agents";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  if (!getChannel(channelId)) {
    return NextResponse.json({ error: "Unknown channel" }, { status: 404 });
  }
  const messages = await getMessages(channelId);
  return NextResponse.json({ messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  if (!getChannel(channelId)) {
    return NextResponse.json({ error: "Unknown channel" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (text.length > 4000) {
    return NextResponse.json({ error: "text is too long" }, { status: 400 });
  }

  const message = await appendMessage(channelId, text);

  // The agent answers in character. Deterministic, not generated — see
  // lib/replies.ts for why that trade is deliberate.
  // What is already on the table, so "show them in preview" resolves.
  const priorCites = [...(await getMessages(channelId))]
    .reverse()
    .find((m) => m.cites?.length)?.cites;
  const generated = replyTo(channelId, text, await getCanon(), priorCites);
  const reply = generated
    ? await appendAgentReply(channelId, generated.agentId, generated.text, message.ts, generated.cites)
    : null;

  return NextResponse.json({ message, reply }, { status: 201 });
}
