import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

/**
 * Reads a harness document so cited artifacts are openable rather than dead
 * text. The path comes from the client, so it is constrained hard: markdown
 * only, and the resolved path must stay inside the harness root.
 */

const ROOT = process.env.HARNESS_ROOT
  ? path.resolve(process.env.HARNESS_ROOT)
  : process.cwd();

export async function GET(req: NextRequest) {
  const rel = req.nextUrl.searchParams.get("path") ?? "";

  if (!rel || rel.length > 200 || !rel.endsWith(".md")) {
    return NextResponse.json({ error: "Markdown paths only" }, { status: 400 });
  }

  // Reject absolute paths and anything that escapes the root once resolved.
  const resolved = path.resolve(ROOT, rel);
  const inside = resolved === ROOT || resolved.startsWith(ROOT + path.sep);
  if (path.isAbsolute(rel) || !inside) {
    return NextResponse.json({ error: "Path outside the harness" }, { status: 403 });
  }

  try {
    const content = await fs.readFile(resolved, "utf8");
    return NextResponse.json({ path: rel, content, exists: true });
  } catch {
    // Seeded history cites artifacts that were never written. Saying so is more
    // honest than pretending the file is there.
    return NextResponse.json({ path: rel, content: null, exists: false });
  }
}
