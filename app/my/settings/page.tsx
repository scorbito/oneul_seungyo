"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, FileText, HelpCircle, LogOut, Mail, Shield, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/common/Button";
import { ModalShell } from "@/components/common/ModalShell";
import { signOutAction } from "@/lib/actions/auth";
import { updateProfileAction } from "@/lib/actions/profile";
import { useAppState } from "@/lib/state/AppState";

const SCOPE_OPTIONS = [
  { value: "전체 공개", db: "public", desc: "모든 사용자에게 보여요" },
  { value: "친구 공개", db: "friends", desc: "친구에게만 보여요" },
  { value: "나만 보기", db: "private", desc: "본인만 볼 수 있어요" }
] as const;

type ScopeUi = (typeof SCOPE_OPTIONS)[number]["value"];
type ScopeDb = (typeof SCOPE_OPTIONS)[number]["db"];

function uiToDb(ui: string): ScopeDb {
  return SCOPE_OPTIONS.find((opt) => opt.value === ui)?.db ?? "public";
}

export default function SettingsPage() {
  const { notificationsEnabled, setNotificationsEnabled, publicScope, setPublicScope, isAnonymous, showToast } = useAppState();
  const router = useRouter();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [savingScope, startSaveScope] = useTransition();

  const handleScopeSelect = (next: ScopeUi) => {
    if (next === publicScope) {
      setScopeOpen(false);
      return;
    }
    startSaveScope(async () => {
      try {
        await updateProfileAction({ defaultPublicScope: uiToDb(next) });
        setPublicScope(next);
        setScopeOpen(false);
        showToast("공개 범위 기본값을 변경했어요.");
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "변경에 실패했어요.");
      }
    });
  };

  return (
    <AppShell activeTab="my" title="설정" theme="dark" backHref="/my">
      <section className="menu-list settings-list">
        <button className="settings-row" type="button" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
          <Bell size={18} />
          <strong>알림 설정</strong>
          <span className="settings-value">{notificationsEnabled ? "켜짐" : "꺼짐"}</span>
          <ChevronRight size={18} />
        </button>
        <button className="settings-row" type="button" onClick={() => setScopeOpen(true)} disabled={isAnonymous}>
          <Shield size={18} />
          <strong>후기 공개 범위 기본값</strong>
          <span className="settings-value">{isAnonymous ? "전체 공개" : publicScope}</span>
          <ChevronRight size={18} />
        </button>
      </section>

      <section className="menu-list settings-list settings-list-secondary">
        <a className="settings-row" href="/my/help">
          <HelpCircle size={18} />
          <strong>이용안내 / 자주 묻는 질문</strong>
          <span className="settings-value" />
          <ChevronRight size={18} />
        </a>
        <a className="settings-row" href="/my/contact">
          <Mail size={18} />
          <strong>문의하기</strong>
          <span className="settings-value" />
          <ChevronRight size={18} />
        </a>
      </section>

      <section className="menu-list settings-list settings-list-secondary">
        <a className="settings-row" href="/legal/terms">
          <FileText size={18} />
          <strong>이용약관</strong>
          <span className="settings-value" />
          <ChevronRight size={18} />
        </a>
        <a className="settings-row" href="/legal/privacy">
          <ShieldCheck size={18} />
          <strong>개인정보처리방침</strong>
          <span className="settings-value" />
          <ChevronRight size={18} />
        </a>
      </section>

      <button className="logout-button" type="button" onClick={() => setLogoutConfirmOpen(true)}>
        <LogOut size={17} /> 로그아웃
      </button>

      <ModalShell open={scopeOpen} title="후기 공개 범위 기본값" onClose={() => setScopeOpen(false)} panelClassName="dark-confirm-panel">
        <div className="confirm-stack scope-options">
          <p className="confirm-hint">후기를 새로 작성할 때 기본으로 선택될 공개 범위예요. 작성할 때 매번 바꿀 수도 있어요.</p>
          {SCOPE_OPTIONS.map((opt) => {
            const active = opt.value === publicScope;
            return (
              <button
                key={opt.value}
                type="button"
                className={`scope-option${active ? " scope-option-active" : ""}`}
                onClick={() => handleScopeSelect(opt.value)}
                disabled={savingScope}
              >
                <strong>{opt.value}</strong>
                <span>{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </ModalShell>

      <ModalShell open={logoutConfirmOpen} title="로그아웃" onClose={() => setLogoutConfirmOpen(false)} panelClassName="dark-confirm-panel">
        <form action={signOutAction}>
          <div className="confirm-stack">
            <p>로그아웃 할까요?</p>
            <span className="confirm-hint">다시 로그인하려면 이메일·비밀번호가 필요해요.</span>
            <div className="confirm-actions">
              <button type="button" className="confirm-cancel" onClick={() => setLogoutConfirmOpen(false)}>취소</button>
              <Button type="submit">로그아웃</Button>
            </div>
          </div>
        </form>
      </ModalShell>
    </AppShell>
  );
}
