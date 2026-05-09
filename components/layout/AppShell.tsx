import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BottomTabs } from "@/components/layout/BottomTabs";

type AppShellProps = {
  activeTab?: "home" | "schedule" | "community" | "my";
  title?: string;
  theme?: "default" | "dark";
  headerAction?: ReactNode;
  backHref?: string;
  children: ReactNode;
};

export function AppShell({ activeTab = "home", title = "오늘은 승요", theme = "default", headerAction, backHref, children }: AppShellProps) {
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
              {title}
            </Link>
            {headerAction}
          </header>
          <div className="app-content">{children}</div>
        </div>
        <BottomTabs activeTab={activeTab} />
      </section>
    </main>
  );
}
