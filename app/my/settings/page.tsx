"use client";

import { ArrowLeft, Bell, LogOut, Palette, Shield, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAppState } from "@/lib/state/AppState";

export default function SettingsPage() {
  const { notificationsEnabled, setNotificationsEnabled, publicScope, setPublicScope, showToast } = useAppState();

  return (
    <AppShell activeTab="my" title="설정">
      <a className="back-link" href="/my"><ArrowLeft size={18} /> 마이로 돌아가기</a>
      <section className="menu-list settings-list">
        <button className="settings-row" type="button" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
          <Bell size={18} />
          <strong>알림 설정</strong>
          <span>{notificationsEnabled ? "켜짐" : "꺼짐"}</span>
        </button>
        <button className="settings-row" type="button" onClick={() => showToast("팀 변경은 다음 단계에서 저장 API와 연결해요.")}>
          <Palette size={18} />
          <strong>내 팀 변경</strong>
          <span>한화 이글스</span>
        </button>
        <button className="settings-row" type="button" onClick={() => showToast("개인정보 설정 mock 확인 완료")}>
          <UserRound size={18} />
          <strong>개인정보 설정</strong>
        </button>
        <button className="settings-row" type="button" onClick={() => setPublicScope(publicScope === "전체 공개" ? "나만 보기" : "전체 공개")}>
          <Shield size={18} />
          <strong>공개 범위</strong>
          <span>{publicScope}</span>
        </button>
      </section>
      <button className="logout-button" type="button" onClick={() => showToast("로그아웃 mock 동작을 확인했어요.")}><LogOut size={17} /> 로그아웃</button>
    </AppShell>
  );
}
