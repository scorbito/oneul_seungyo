"use client";

import { useState } from "react";
import { ArrowLeft, Bell, ChevronRight, LogOut, Palette, Shield, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/common/Button";
import { ModalShell } from "@/components/common/ModalShell";
import { signOutAction } from "@/lib/actions/auth";
import { useAppState } from "@/lib/state/AppState";

export default function SettingsPage() {
  const { notificationsEnabled, setNotificationsEnabled, publicScope, setPublicScope, showToast } = useAppState();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  return (
    <AppShell activeTab="my" title="설정" theme="dark">
      <a className="back-link" href="/my"><ArrowLeft size={18} /> 돌아가기</a>
      <section className="menu-list settings-list">
        <button className="settings-row" type="button" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
          <Bell size={18} />
          <strong>알림 설정</strong>
          <span className="settings-value">{notificationsEnabled ? "켜짐" : "꺼짐"}</span>
          <ChevronRight size={18} />
        </button>
        <button className="settings-row" type="button" onClick={() => showToast("팀 변경은 다음 단계에서 저장 API와 연결해요.")}>
          <Palette size={18} />
          <strong>내 팀 변경</strong>
          <span className="settings-value">한화 이글스</span>
          <ChevronRight size={18} />
        </button>
        <button className="settings-row" type="button" onClick={() => showToast("개인정보 설정 mock 확인 완료")}>
          <UserRound size={18} />
          <strong>개인정보 설정</strong>
          <span className="settings-value" />
          <ChevronRight size={18} />
        </button>
        <button className="settings-row" type="button" onClick={() => setPublicScope(publicScope === "전체 공개" ? "나만 보기" : "전체 공개")}>
          <Shield size={18} />
          <strong>공개 범위</strong>
          <span className="settings-value">{publicScope}</span>
          <ChevronRight size={18} />
        </button>
      </section>
      <button className="logout-button" type="button" onClick={() => setLogoutConfirmOpen(true)}>
        <LogOut size={17} /> 로그아웃
      </button>

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
