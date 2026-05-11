import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BottomTabs } from "@/components/layout/BottomTabs";
import { PullToRefresh } from "@/components/common/PullToRefresh";

type AppShellProps = {
  activeTab?: "home" | "schedule" | "community" | "my";
  title?: string;
  showBeta?: boolean;
  theme?: "default" | "dark";
  headerAction?: ReactNode;
  backHref?: string;
  children: ReactNode;
};

export function AppShell({ activeTab = "home", title = "오늘은 승요", showBeta = false, theme = "default", headerAction, backHref, children }: AppShellProps) {
  return (
    <main className="app-backdrop">
      <section className={`phone-frame${theme === "dark" ? " phone-frame-dark" : ""}`} aria-label="오늘은 승요 앱 화면">
        <div className="app-scroll">
          <header className="app-header">
            {backHref ? (
              <Link className="header-back" href={backHref} aria-label="뒤로" prefetch>
                <ArrowLeft size={18} />
              </Link>
            ) : null}
            <Link className="brand" href="/" prefetch>
              <span>{title}</span>
              {showBeta ? <span className="brand-beta">BETA</span> : null}
            </Link>
            {headerAction}
          </header>
          <div className="app-content">
            <PullToRefresh>{children}</PullToRefresh>
          </div>
        </div>
        <BottomTabs activeTab={activeTab} />
      </section>
    </main>
  );
}
