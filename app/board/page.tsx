import { Suspense } from "react";
import { BoardView } from "@/components/BoardView";
import { getLiveHandoffs } from "@/lib/handoffs";

export default async function BoardPage() {
  const live = await getLiveHandoffs();
  return (
    <Suspense>
      <BoardView live={live} />
    </Suspense>
  );
}
