import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { AppStateProvider } from "@/lib/state/AppState";
import {
  getCurrentProfileFromDb,
  getCurrentProfileStatsFromDb,
  listCurrentAttendancesFromDb,
  listReviewsFromDb
} from "@/lib/supabase/queries";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘은 승요",
  description: "KBO 직관 기록, 승률 통계, 커뮤니티 웹앱"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  noStore();

  const [profile, stats, attendances, reviews] = await Promise.all([
    getCurrentProfileFromDb().catch(() => null),
    getCurrentProfileStatsFromDb().catch(() => null),
    listCurrentAttendancesFromDb().catch(() => []),
    listReviewsFromDb({ onlyMine: true }).catch(() => [])
  ]);

  return (
    <html lang="ko">
      <body>
        <AppStateProvider
          initialProfile={profile}
          initialStats={stats}
          initialAttendances={attendances}
          initialReviews={reviews}
        >
          {children}
        </AppStateProvider>
      </body>
    </html>
  );
}
