import Link from "next/link";
import { CHANNELS } from "@/lib/agents";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-canvas text-ink-2">
      <p className="text-sm text-ink-3">That page doesn&apos;t exist.</p>
      <Link
        href={`/c/${CHANNELS[0].id}`}
        className="rounded-md bg-control px-3 py-1.5 text-xs font-medium text-control-ink"
      >
        Back to #{CHANNELS[0].id}
      </Link>
    </div>
  );
}
