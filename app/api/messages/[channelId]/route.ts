import { NextRequest, NextResponse } from "next/server";
import { getMessages, appendMessage } from "@/lib/messages";
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
  return NextResponse.json({ message }, { status: 201 });
}
