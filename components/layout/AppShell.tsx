import { ArrowLeft, CalendarDays, Home, MessageCircle, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  activeTab?: "home" | "schedule" | "community" | "my";
  title?: string;
  theme?: "default" | "dark";
  headerAction?: ReactNode;
  backHref?: string;
  children: ReactNode;
};

const tabs = [
  { id: "home", label: "홈", icon: Home, href: "/" },
  { id: "schedule", label: "일정", icon: CalendarDays, href: "/schedule" },
  { id: "community", label: "커뮤니티", icon: MessageCircle, href: "/community" },
  { id: "my", label: "마이", icon: UserRound, href: "/my" }
] as const;

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
        <nav className="bottom-tab" aria-label="하단 메뉴">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link className={`tab-item ${isActive ? "tab-item-active" : ""}`} href={tab.href} key={tab.id} prefetch>
                <Icon size={19} strokeWidth={isActive ? 2.8 : 2} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </section>
    </main>
  );
}
