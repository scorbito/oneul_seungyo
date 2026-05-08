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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneul-seungyo.vercel.app";
const SITE_TITLE = "오늘은 승요";
const SITE_DESCRIPTION = "KBO 직관 승률을 기록하고 친구와 후기를 공유하세요. 두산·LG·기아·삼성 등 10팀 일정 자동 연동, 티켓 사진으로 직관 자동 인증.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_TITLE} - KBO 직관 기록 앱`,
    template: `%s | ${SITE_TITLE}`
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "오늘은 승요",
    "KBO 직관",
    "야구 직관 기록",
    "야구 직관 앱",
    "KBO 승률",
    "프로야구 후기",
    "티켓 인증",
    "야구팬 커뮤니티"
  ],
  authors: [{ name: "오늘은 승요" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: SITE_TITLE,
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: "/assets/mascot-default.png",
    apple: { url: "/assets/mascot-default.png", sizes: "180x180", type: "image/png" }
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_TITLE,
    title: `${SITE_TITLE} - KBO 직관 기록 앱`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/assets/mainherobg.png",
        width: 1448,
        height: 1086,
        alt: "오늘은 승요 - 직관 승률을 기록하는 야구팬 앱"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_TITLE} - KBO 직관 기록 앱`,
    description: SITE_DESCRIPTION,
    images: ["/assets/mainherobg.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
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
