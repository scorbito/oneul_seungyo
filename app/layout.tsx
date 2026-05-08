import type { Metadata, Viewport } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { AppStateProvider } from "@/lib/state/AppState";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06101e"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  noStore();

  const ssr = createSupabaseServerClient();
  const { data: authData } = await ssr.auth.getUser();
  const isAnonymous = Boolean(authData?.user?.is_anonymous);

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
          initialIsAnonymous={isAnonymous}
        >
          {children}
        </AppStateProvider>
      </body>
    </html>
  );
}
