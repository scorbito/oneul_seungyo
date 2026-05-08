import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneul-seungyo.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/landing",
          "/login",
          "/my/help",
          "/my/contact",
          "/legal/terms",
          "/legal/privacy"
        ],
        disallow: [
          "/",                  // 로그인 시 홈 (랜딩으로 redirect — 인덱스 가치 없음)
          "/my",                // 마이 메인 (auth 필요)
          "/my/attendances",
          "/my/reviews",
          "/my/tickets",
          "/my/friends",
          "/my/notices",
          "/my/settings",
          "/onboarding",
          "/schedule",
          "/community",
          "/rankings",
          "/reviews/",          // 후기 상세 (현재 auth 필요)
          "/api/",              // API 라우트
          "/auth/"              // OAuth callback
        ]
      },
      {
        // 네이버 크롤러도 동일하게 적용
        userAgent: "Yeti",
        allow: [
          "/landing",
          "/login",
          "/my/help",
          "/my/contact",
          "/legal/terms",
          "/legal/privacy"
        ],
        disallow: ["/", "/my/", "/api/", "/auth/", "/community", "/schedule", "/onboarding"]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
