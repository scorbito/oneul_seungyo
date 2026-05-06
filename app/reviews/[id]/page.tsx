import { unstable_noStore as noStore } from "next/cache";
import { ReviewDetailScreen } from "@/components/domain/ReviewDetailScreen";
import { getReviewByIdFromDb } from "@/lib/supabase/queries";

export default async function ReviewDetailPage({ params }: { params: { id: string } }) {
  noStore();
  const review = await getReviewByIdFromDb(params.id).catch(() => null);
  return <ReviewDetailScreen id={params.id} dbReview={review} />;
}
