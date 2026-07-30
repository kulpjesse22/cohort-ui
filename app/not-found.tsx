import Link from "next/link";
import { CHANNELS } from "@/lib/agents";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-zinc-900 text-zinc-300">
      <p className="text-sm text-zinc-500">That page doesn&apos;t exist.</p>
      <Link
        href={`/c/${CHANNELS[0].id}`}
        className="rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900"
      >
        Back to #{CHANNELS[0].id}
      </Link>
    </div>
  );
}
