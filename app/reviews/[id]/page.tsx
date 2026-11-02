import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ReviewsView } from "@/components/ReviewsView";
import { getLiveHandoffs } from "@/lib/handoffs";
import { SEEDED_HANDOFFS } from "@/lib/reviews";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const live = await getLiveHandoffs();
  const known = decodeURIComponent(id);
  if (![...SEEDED_HANDOFFS, ...live].some((h) => h.id === known)) notFound();

  return (
    <Suspense>
      <ReviewsView live={live} />
    </Suspense>
  );
}
