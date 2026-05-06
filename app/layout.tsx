import type { Metadata } from "next";
import { AppStateProvider } from "@/lib/state/AppState";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘은 승요",
  description: "KBO 직관 기록, 승률 통계, 커뮤니티 웹앱"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
