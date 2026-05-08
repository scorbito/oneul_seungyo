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
  description: "KBO 직관 기록, 승률 통계, 커뮤니티 웹앱",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "오늘은 승요",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: "/assets/mascot-default.png",
    apple: { url: "/assets/mascot-default.png", sizes: "180x180", type: "image/png" }
  }
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <html lang="ko">
      <head>
        {supabaseUrl ? (
          <>
            <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={supabaseUrl} />
          </>
        ) : null}
        <link rel="preload" as="image" href="/assets/stadium-hero-vertical.png" fetchPriority="high" />
      </head>
      <body>
        <div className="initial-loader" aria-hidden="true">
          <div className="initial-loader-spinner" />
          <span className="initial-loader-text">오늘은 승요</span>
          <span className="initial-loader-sub">시작 중...</span>
        </div>
        <script
          // DOM 준비되는 순간 loader 숨김. JS 실행 전엔 CSS fallback이 1.5초 후 자동 숨김.
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;function r(){d.setAttribute('data-loaded','true');}if(document.readyState==='complete'||document.readyState==='interactive'){requestAnimationFrame(r);}else{document.addEventListener('DOMContentLoaded',r);}})();`
          }}
        />
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
