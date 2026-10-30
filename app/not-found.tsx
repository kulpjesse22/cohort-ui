import Link from "next/link";
import { CHANNELS } from "@/lib/agents";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
      <p className="text-label font-semibold uppercase tracking-[0.06em] text-ink-3">404</p>
      <h1 className="font-display text-title font-semibold text-ink">That page doesn&apos;t exist.</h1>
      <p className="max-w-sm text-body text-ink-3">
        The address may be from an older build, or a channel that was never set up.
      </p>
      <Link
        href={`/c/${CHANNELS[0].id}`}
        className="mt-3 flex min-h-9 items-center rounded-md bg-control px-4 text-meta font-semibold text-control-ink transition-opacity hover:opacity-90"
      >
        Back to #{CHANNELS[0].id}
      </Link>
    </div>
  );
}
