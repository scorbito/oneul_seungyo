"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ListChecks, MessageSquareText, Settings, Ticket, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { Card } from "@/components/common/Card";
import { ModalShell } from "@/components/common/ModalShell";
import { Button } from "@/components/common/Button";
import { getTeam, teams } from "@/lib/constants/teams";
import { useAppState } from "@/lib/state/AppState";

const menuItems = [
  { label: "내 직관 리스트", href: "/my/attendances", icon: ListChecks },
  { label: "내 티켓 컬렉션", href: "/my/tickets", icon: Ticket },
  { label: "내 후기 모음", href: "/my/reviews", icon: MessageSquareText },
  { label: "친구 관리", href: "/my/friends", icon: UserPlus },
  { label: "설정", href: "/my/settings", icon: Settings }
];

export function MyScreen() {
  const { profile, attendances, reviews, updateProfile } = useAppState();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(profile.nickname);
  const [selectedTeamId, setSelectedTeamId] = useState(profile.mainTeamId);
  const profileTeam = getTeam(profile.mainTeamId);

  useEffect(() => {
    if (!editing) {
      return;
    }
    setNickname(profile.nickname);
    setSelectedTeamId(profile.mainTeamId);
  }, [editing, profile.mainTeamId, profile.nickname]);

  return (
    <AppShell activeTab="my" title="마이">
      <Card className="profile-card">
        <div className="profile-hero">
          <TeamBadge teamId={profile.mainTeamId} size="lg" />
          <div>
            <h1>{profile.nickname}</h1>
            <p>내 팀 {profileTeam.name}</p>
          </div>
        </div>
        <strong className="profile-rate">{profile.winRate}</strong>
        <span>{profile.wins}승 {profile.losses}패 {profile.draws}무</span>
        <button type="button" onClick={() => setEditing(true)}>프로필 편집</button>
      </Card>
      <Card className="stats-card">
        <h2>내 직관 통계</h2>
        <div className="stat-grid">
          <span>직관 경기<b>{attendances.length}경기 <em>(인증 {attendances.filter((item) => item.verified).length})</em></b></span>
          <span>승리<b>{profile.wins}경기</b></span>
          <span>승률<b>{profile.winRate}</b></span>
        </div>
      </Card>
      <section className="menu-list">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <a href={item.href} key={item.label}>
              <Icon size={18} />
              <strong>{item.label}</strong>
              {item.label === "내 직관 리스트" ? <span>({attendances.length})</span> : null}
              {item.label === "내 티켓 컬렉션" ? <span>({attendances.filter((a) => a.verified).length})</span> : null}
              {item.label === "내 후기 모음" ? <span>({reviews.length})</span> : null}
              <ChevronRight size={17} />
            </a>
          );
        })}
      </section>
      <ModalShell open={editing} title="프로필 편집" onClose={() => setEditing(false)}>
        <div className="form-stack">
          <label className="field-row">
            <span>닉네임</span>
            <input className="plain-input" value={nickname} maxLength={10} onChange={(event) => setNickname(event.target.value)} />
          </label>
          <div className="field-group">
            <span>내 팀</span>
            <div className="profile-team-grid">
              {teams.map((team) => (
                <button
                  className={selectedTeamId === team.id ? "profile-team-choice profile-team-choice-active" : "profile-team-choice"}
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamId(team.id)}
                >
                  <TeamBadge teamId={team.id} size="sm" />
                  <strong>{team.shortName}</strong>
                </button>
              ))}
            </div>
            <p className="field-hint">실서비스에서는 팀 변경을 하루 1회로 제한할 예정이에요. 지금은 테스트라 자유롭게 바꿀 수 있습니다.</p>
          </div>
          <Button onClick={() => {
            updateProfile({ nickname: nickname.trim() || profile.nickname, mainTeamId: selectedTeamId });
            setEditing(false);
          }}>
            저장하기
          </Button>
        </div>
      </ModalShell>
    </AppShell>
  );
}
