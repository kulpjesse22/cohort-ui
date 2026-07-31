import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { VOICES } from "@/lib/roster";

/**
 * Synthesizes a short line in the chosen voice so you can hear an agent before
 * committing to it. The key is read from .env.local at request time and never
 * reaches the client — the browser only ever receives audio bytes.
 */

async function readKey(): Promise<string | null> {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  try {
    const raw = await fs.readFile(path.join(process.cwd(), ".env.local"), "utf8");
    const line = raw.split("\n").find((l) => l.startsWith("ELEVENLABS_API_KEY="));
    return line ? line.slice("ELEVENLABS_API_KEY=".length).trim() : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const voiceId = typeof body?.voiceId === "string" ? body.voiceId : "";
  const voice = VOICES.find((v) => v.id === voiceId);
  if (!voice) {
    return NextResponse.json({ error: "Unknown voice" }, { status: 400 });
  }

  const line =
    typeof body?.text === "string" && body.text.trim()
      ? body.text.trim().slice(0, 220)
      : "Reviewed the shell. Structurally sound — three fixes assigned back.";

  const key = await readKey();
  if (!key) {
    return NextResponse.json(
      { error: "No ElevenLabs key configured. Add ELEVENLABS_API_KEY to .env.local." },
      { status: 503 }
    );
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ text: line, model_id: "eleven_multilingual_v2" }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `ElevenLabs returned ${res.status}`, detail: detail.slice(0, 300) },
      { status: res.status === 401 || res.status === 402 ? res.status : 502 }
    );
  }

  return new NextResponse(await res.arrayBuffer(), {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
