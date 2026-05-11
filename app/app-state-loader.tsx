import { AppStateProvider } from "@/lib/state/AppState";
import {
  getCurrentProfileFromDb,
  getCurrentProfileStatsFromDb,
  getCurrentUserReviewReactionsFromDb,
  listCurrentAttendancesFromDb,
  listReviewsFromDb
} from "@/lib/supabase/queries";

type Props = {
  isAnonymous: boolean;
  children: React.ReactNode;
};

/** AppState 초기 데이터를 서버에서 페치하는 컴포넌트.
 *  layout.tsx에서 Suspense로 감싸 사용 → 데이터 페치 중에도 초기 셸(initial-loader)이 즉시 노출됨. */
export async function AppStateLoader({ isAnonymous, children }: Props) {
  const [profile, stats, attendances, reviews, reactions] = await Promise.all([
    getCurrentProfileFromDb().catch(() => null),
    getCurrentProfileStatsFromDb().catch(() => null),
    listCurrentAttendancesFromDb().catch(() => []),
    listReviewsFromDb({ onlyMine: true }).catch(() => []),
    getCurrentUserReviewReactionsFromDb().catch(() => ({ likedReviewIds: [], savedReviewIds: [] }))
  ]);

  return (
    <AppStateProvider
      initialProfile={profile}
      initialStats={stats}
      initialAttendances={attendances}
      initialReviews={reviews}
      initialIsAnonymous={isAnonymous}
      initialLikedReviewIds={reactions.likedReviewIds}
      initialSavedReviewIds={reactions.savedReviewIds}
    >
      {children}
    </AppStateProvider>
  );
}
