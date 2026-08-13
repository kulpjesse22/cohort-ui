import { NextResponse } from "next/server";
import { getLessonMemory } from "@/lib/lessons";

export async function GET() {
  const memory = await getLessonMemory();
  return NextResponse.json(memory);
}
