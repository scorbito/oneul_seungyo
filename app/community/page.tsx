import { CommunityScreen } from "@/components/domain/CommunityScreen";
import { listAcceptedFriendsFromDb, listReviewsFromDb } from "@/lib/supabase/queries";

// revalidate 대신 force-dynamic — 친구 목록은 사용자별로 다르므로 캐시 공유 금지
export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const [dbReviews, friends] = await Promise.all([
    listReviewsFromDb({ limit: 20 }).catch(() => []),
    listAcceptedFriendsFromDb().catch(() => [])
  ]);
  const friendIds = friends.map((f) => f.userId);

  return <CommunityScreen dbReviews={dbReviews} friendIds={friendIds} />;
}
