import { RelayStage } from "@/components/RelayStage";

/** Isolated preview while the pattern is being tuned. Placement is still open. */
export default function RelayPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-canvas px-5">
      <div className="w-full max-w-5xl">
        <RelayStage />
      </div>
    </main>
  );
}
