import { Suspense } from "react";
import { ReviewsView } from "@/components/ReviewsView";
import { getLiveHandoffs } from "@/lib/handoffs";

export default async function ReviewsPage() {
  const live = await getLiveHandoffs();
  return (
    <Suspense>
      <ReviewsView live={live} />
    </Suspense>
  );
}
