import { NextRequest, NextResponse } from "next/server";
import { getChannelContext } from "@/lib/harness";
import { getChannel } from "@/lib/agents";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const { channelId } = await params;
  if (!getChannel(channelId)) {
    return NextResponse.json({ error: "Unknown channel" }, { status: 404 });
  }
  const docs = await getChannelContext(channelId);
  return NextResponse.json({ docs });
}
