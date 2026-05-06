import { unstable_noStore as noStore } from "next/cache";
import { CommunityScreen } from "@/components/domain/CommunityScreen";
import { listReviewsFromDb } from "@/lib/supabase/queries";

export default async function CommunityPage() {
  noStore();
  const dbReviews = await listReviewsFromDb().catch(() => []);

  return <CommunityScreen dbReviews={dbReviews} />;
}
