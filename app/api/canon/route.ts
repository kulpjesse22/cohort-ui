import { NextRequest, NextResponse } from "next/server";
import { clearCanon, getCanon, setCanon } from "@/lib/canon";
import { appendAgentReply, getMessages } from "@/lib/messages";

export async function GET() {
  return NextResponse.json({ path: await getCanon() });
}

export async function DELETE() {
  await clearCanon();
  return NextResponse.json({ path: null });
}

export async function POST(req: NextRequest) {
  const { path: docPath, channelId } = await req.json().catch(() => ({}));
  if (typeof docPath !== "string" || !docPath.endsWith(".md")) {
    return NextResponse.json({ error: "Markdown paths only" }, { status: 400 });
  }

  await setCanon(docPath);

  // The acknowledgement names what changed and where it is recorded. An agent
  // that agrees in chat and leaves nothing behind is the failure this product
  // exists to fix.
  const channel = typeof channelId === "string" ? channelId : "cohort";
  const existing = await getMessages(channel);
  const afterTs = existing.at(-1)?.ts ?? new Date().toISOString();

  const reply = await appendAgentReply(
    channel,
    "claudia",
    `Understood — I'll treat ${docPath} as the source of truth from here, and lead with it when this comes up again rather than making you repeat yourself. Logging it to Human/decisions.md so it outlives this thread; if it stops being authoritative, say so and I'll retire it.`,
    afterTs,
    [docPath]
  );

  return NextResponse.json({ canon: docPath, reply }, { status: 201 });
}
