import { Suspense } from "react";
import { AgentsView } from "@/components/AgentsView";
import { getLiveHandoffs } from "@/lib/handoffs";

export default async function AgentsPage() {
  const live = await getLiveHandoffs();
  return (
    <Suspense>
      <AgentsView live={live} />
    </Suspense>
  );
}
