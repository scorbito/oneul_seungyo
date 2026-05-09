import { CommunityScreen } from "@/components/domain/CommunityScreen";
import { listReviewsFromDb } from "@/lib/supabase/queries";

export const revalidate = 60;

export default async function CommunityPage() {
  const dbReviews = await listReviewsFromDb({ limit: 20 }).catch(() => []);

  return <CommunityScreen dbReviews={dbReviews} />;
}
