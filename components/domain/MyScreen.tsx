"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CalendarDays, Camera, Check, ChevronRight, ListChecks, MessageSquareText, Settings, Ticket, TrendingUp, Trophy, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { Card } from "@/components/common/Card";
import { ModalShell } from "@/components/common/ModalShell";
import { Button } from "@/components/common/Button";
import { getTeam, teams } from "@/lib/constants/teams";
import { useAppState } from "@/lib/state/AppState";
import { updateAvatarAction, updateProfileAction } from "@/lib/actions/profile";
import { uploadUserFile } from "@/lib/supabase/storage-client";

const menuItems = [
  { label: "내 직관 리스트", href: "/my/attendances", icon: ListChecks },
  { label: "내 티켓 컬렉션", href: "/my/tickets", icon: Ticket },
  { label: "내 후기 모음", href: "/my/reviews", icon: MessageSquareText },
  { label: "친구 관리", href: "/my/friends", icon: UserPlus },
  { label: "설정", href: "/my/settings", icon: Settings }
];

export function MyScreen() {
  const { profile, attendances, reviews, isAnonymous, updateProfile, showToast } = useAppState();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(profile.nickname);
  const [selectedTeamId, setSelectedTeamId] = useState(profile.mainTeamId);
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(profile.avatarUrl);
  const [uploading, startUpload] = useTransition();
  const [savingProfile, startSaveProfile] = useTransition();
  const profileTeam = getTeam(profile.mainTeamId);

  useEffect(() => {
    if (!editing) {
      return;
    }
    setNickname(profile.nickname);
    setSelectedTeamId(profile.mainTeamId);
    setAvatarUrl(profile.avatarUrl);
  }, [editing, profile.mainTeamId, profile.nickname, profile.avatarUrl]);

  const handleAvatarPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }
    startUpload(async () => {
      try {
        const url = await uploadUserFile("profile-images", file, `avatar-${Date.now()}`);
        const result = await updateAvatarAction(url);
        setAvatarUrl(result.avatarUrl);
        updateProfile({ avatarUrl: result.avatarUrl });
        showToast("프로필 사진을 변경했어요.");
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "사진 업로드에 실패했어요.");
      }
    });
  };

  return (
    <AppShell activeTab="my" title="마이" theme="dark">
      <Card className="profile-card">
        <div className="profile-card-bg" aria-hidden="true" />
        <div className="profile-hero">
          {profile.avatarUrl ? (
            <span className="profile-hero-avatar">
              <Image alt="프로필 사진" src={profile.avatarUrl} fill sizes="48px" style={{ objectFit: "cover" }} />
            </span>
          ) : (
            <TeamBadge teamId={profile.mainTeamId} size="lg" />
          )}
          <div>
            <h1>{profile.nickname}</h1>
            <p>내 팀 {profileTeam.name}</p>
          </div>
        </div>
        <strong className="profile-rate">{profile.winRate}</strong>
        <span className="profile-record">{profile.wins}승 {profile.losses}패 {profile.draws}무</span>
        {isAnonymous ? (
          <a className="profile-anon-cta" href="/login">
            정식 계정으로 전환하면 다른 기기에서도 볼 수 있어요 →
          </a>
        ) : null}
        <button type="button" className="profile-edit-btn" onClick={() => setEditing(true)}>프로필 편집</button>
      </Card>
      <Card className="stats-card">
        <h2>내 직관 통계</h2>
        <div className="stat-grid">
          <span>
            <em><CalendarDays size={14} />직관 경기</em>
            <b>{attendances.length}경기</b>
            <i>(인증 {attendances.filter((item) => item.verified).length})</i>
          </span>
          <span>
            <em><Trophy size={14} />승리</em>
            <b>{profile.wins}경기</b>
          </span>
          <span>
            <em><TrendingUp size={14} />승률</em>
            <b>{profile.winRate}</b>
          </span>
        </div>
      </Card>
      <section className="menu-list">
        {menuItems.map((item) => {
          const Icon = item.icon;
          let count: number | null = null;
          if (item.label === "내 직관 리스트") count = attendances.length;
          else if (item.label === "내 티켓 컬렉션") count = attendances.filter((a) => a.verified).length;
          else if (item.label === "내 후기 모음") count = reviews.length;

          return (
            <a href={item.href} key={item.label}>
              <Icon size={18} />
              <strong>{item.label}</strong>
              {count !== null ? <span className="menu-count">({count})</span> : <span className="menu-count" />}
              <ChevronRight size={18} />
            </a>
          );
        })}
      </section>
      <ModalShell open={editing} title="프로필 편집" onClose={() => setEditing(false)} panelClassName="profile-modal-panel">
        <div className="form-stack">
          <div className="profile-avatar-edit">
            <div className="profile-avatar-preview">
              {avatarUrl ? (
                <Image alt="프로필 사진" src={avatarUrl} fill sizes="96px" style={{ objectFit: "cover" }} />
              ) : (
                <span className="profile-avatar-placeholder">{(nickname || "?").slice(0, 1)}</span>
              )}
            </div>
            <label className={`profile-avatar-button ${uploading ? "is-uploading" : ""}`}>
              <Camera size={14} />
              {uploading ? "업로드 중..." : "사진 변경"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarPick} disabled={uploading} />
            </label>
          </div>
          <label className="field-row">
            <span>닉네임</span>
            <input className="plain-input" value={nickname} maxLength={10} onChange={(event) => setNickname(event.target.value)} />
          </label>
          <div className="field-group">
            <span>내 팀</span>
            <div className="profile-team-grid">
              {teams.map((team) => {
                const active = selectedTeamId === team.id;
                return (
                  <button
                    className={active ? "profile-team-choice profile-team-choice-active" : "profile-team-choice"}
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedTeamId(team.id)}
                  >
                    <TeamBadge teamId={team.id} size="sm" />
                    <strong>{team.shortName}</strong>
                    {active ? <Check size={14} className="profile-team-check" strokeWidth={3} /> : null}
                  </button>
                );
              })}
            </div>
            <p className="field-hint">실서비스에서는 팀 변경을 하루 1회로 제한할 예정이에요. 지금은 테스트라 자유롭게 바꿀 수 있습니다.</p>
          </div>
          <Button disabled={savingProfile} onClick={() => {
            const nextNickname = nickname.trim() || profile.nickname;
            startSaveProfile(async () => {
              try {
                await updateProfileAction({ nickname: nextNickname, mainTeamId: selectedTeamId });
                updateProfile({ nickname: nextNickname, mainTeamId: selectedTeamId });
                setEditing(false);
                router.refresh();
              } catch (err) {
                showToast(err instanceof Error ? err.message : "프로필 저장에 실패했어요.");
              }
            });
          }}>
            {savingProfile ? "저장 중" : "저장하기"}
          </Button>
        </div>
      </ModalShell>
    </AppShell>
  );
}
