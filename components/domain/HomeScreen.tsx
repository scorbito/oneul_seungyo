"use client";

import { useState } from "react";
import { ChevronRight, Plus, Share2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { AppModals, type ModalKind } from "@/components/domain/AppModals";
import { getTeam } from "@/lib/constants/teams";
import { useAppState } from "@/lib/state/AppState";
import type { Game, TeamStanding } from "@/lib/types/domain";

const WEEK_LABELS_SUN = ["일", "월", "화", "수", "목", "금", "토"];
const WEEK_LABELS_MON = ["월", "화", "수", "목", "금", "토", "일"];

function parseDotDate(date: string) {
  const [year, month, day] = date.split(".").map(Number);
  return new Date(year, month - 1, day);
}

function getDday(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = parseDotDate(date);
  const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "D-Day";
  return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
}

function formatDateWithDay(date: string) {
  const dateObj = parseDotDate(date);
  return `${date} (${WEEK_LABELS_SUN[dateObj.getDay()]})`;
}

function formatMonthDay(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function getGameResult(game: Game, mainTeamId: string): "win" | "lose" | "draw" | null {
  if (game.status !== "finished" || game.homeScore == null || game.awayScore == null) return null;
  const myScore = game.homeTeamId === mainTeamId ? game.homeScore : game.awayScore;
  const opponentScore = game.homeTeamId === mainTeamId ? game.awayScore : game.homeScore;
  if (myScore === opponentScore) return "draw";
  return myScore > opponentScore ? "win" : "lose";
}

type HomeScreenProps = {
  standings?: TeamStanding[];
  weekGames?: Game[];
  weekStart?: string;
  modalGames?: Game[];
};

export function HomeScreen({ weekGames = [], weekStart, modalGames = [] }: HomeScreenProps) {
  const { attendances, profile } = useAppState();
  const [modal, setModal] = useState<ModalKind>(null);

  const myTeam = getTeam(profile.mainTeamId);

  const todayDateOnly = new Date();
  todayDateOnly.setHours(0, 0, 0, 0);

  // page.tsx에서 월요일을 보냄 — 월~일 순서로 표시
  const monday = weekStart ? new Date(`${weekStart}T00:00:00`) : null;

  const myWeekGames = weekGames
    .filter((g) => g.homeTeamId === profile.mainTeamId || g.awayTeamId === profile.mainTeamId)
    .map((g) => ({
      ...g,
      isHome: g.homeTeamId === profile.mainTeamId,
      opponentTeamId: g.homeTeamId === profile.mainTeamId ? g.awayTeamId : g.homeTeamId,
      dateObj: parseDotDate(g.date)
    }));

  const weekDays = monday
    ? Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
        const game = myWeekGames.find((g) => g.dateObj.getTime() === d.getTime());
        const isToday = d.getTime() === todayDateOnly.getTime();
        return { date: d, label: WEEK_LABELS_MON[i], dayNum: d.getDate(), isToday, game, dayIndex: i };
      })
    : [];

  const weekHomeCount = weekDays.filter((d) => d.game?.isHome).length;
  const weekAwayCount = weekDays.filter((d) => d.game && !d.game.isHome).length;

  const upcomingAttendances = attendances
    .filter((a) => !a.result)
    .sort((a, b) => a.date.localeCompare(b.date));

  // 최근 직관: 오래된 → 최신 (좌→우)
  const recentAttendances = attendances
    .filter((a) => !!a.result)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)
    .reverse();

  // 섹션 헤더용: 최근 5경기 승/패 집계
  const last5Attendances = attendances
    .filter((a) => !!a.result)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
  const last5Wins = last5Attendances.filter((a) => a.result === "win").length;
  const last5Losses = last5Attendances.filter((a) => a.result === "lose").length;

  const totalAttendances = attendances.length;
  const wins = attendances.filter((a) => a.result === "win").length;
  const losses = attendances.filter((a) => a.result === "lose").length;
  const draws = attendances.filter((a) => a.result === "draw").length;

  return (
    <AppShell activeTab="home" theme="dark">
      {/* HERO */}
      <section className="hd-card hd-hero" aria-label="내 직관 승률">
        <div className="hd-hero-bg" aria-hidden="true" />

        <div className="hd-hero-top">
          <div className="hd-team-pill">
            <TeamBadge teamId={profile.mainTeamId} size="md" />
            <span className="hd-team-pill-text">내 팀 {myTeam.shortName}</span>
          </div>
        </div>

        <div className="hd-hero-center">
          <p className="hd-hero-label">내 직관 승률</p>
          <p className="hd-hero-number">{profile.winRate}</p>
          <p className="hd-hero-summary">
            <span>총 {totalAttendances}경기 ·</span>
            <span className="hd-text-win">{wins}승</span>
            <span className="hd-text-loss">{losses}패</span>
            <span className="hd-text-draw">{draws}무</span>
          </p>
        </div>

        <div className="hd-hero-actions">
          <button type="button" className="hd-btn hd-btn-primary" onClick={() => setModal("attendance")}>
            <Plus size={18} /> 직관 등록
          </button>
          <button type="button" className="hd-btn hd-btn-secondary" onClick={() => setModal("review")}>
            후기 작성
          </button>
          <button type="button" className="hd-btn hd-btn-tertiary" onClick={() => setModal("share")} aria-label="공유">
            <Share2 size={16} /> 공유
          </button>
        </div>
      </section>

      {/* NEXT GAME */}
      {upcomingAttendances.length > 0 && (() => {
        const att = upcomingAttendances[0];
        const home = getTeam(att.homeTeamId);
        const away = getTeam(att.awayTeamId);
        return (
          <section className="hd-card hd-next" aria-label="다음 직관">
            <div className="hd-section-header">
              <h2 className="hd-section-title">다음 직관</h2>
              <button type="button" className="hd-icon-link" aria-label="상세 보기">
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="hd-next-meta-row">
              <span className="hd-status-chip hd-status-chip-dday">{getDday(att.date)}</span>
              <span className="hd-next-datetime">
                {formatDateWithDay(att.date)} {att.time ? att.time.slice(0, 5) : ""}
              </span>
              <span className="hd-next-location">{att.stadium}</span>
            </div>

            <div className="hd-matchup-row">
              <div className="hd-matchup-team">
                <TeamBadge teamId={att.awayTeamId} size="md" />
                <div className="hd-matchup-team-info">
                  <span className="hd-team-name">{away.shortName}</span>
                  <span className="hd-tiny-chip">원정</span>
                </div>
              </div>
              <div className="hd-matchup-vs">VS</div>
              <div className="hd-matchup-team hd-matchup-team-right">
                <div className="hd-matchup-team-info">
                  <span className="hd-team-name">{home.shortName}</span>
                  <span className="hd-tiny-chip">홈</span>
                </div>
                <TeamBadge teamId={att.homeTeamId} size="md" />
              </div>
            </div>
          </section>
        );
      })()}

      {/* RECENT GAMES */}
      {recentAttendances.length > 0 && (
        <section className="hd-card" aria-label="최근 직관 경기">
          <div className="hd-section-header">
            <div className="hd-section-title-wrap">
              <h2 className="hd-section-title">최근 직관 경기</h2>
              <p className="hd-section-substat">
                <span className="hd-text-win">{last5Wins}승</span>
                <span className="hd-text-loss">{last5Losses}패</span>
              </p>
            </div>
            <a href="/my/attendances" className="hd-text-link">더보기 <ChevronRight size={14} /></a>
          </div>

          <div className="hd-recent-list">
            {recentAttendances.map((att) => {
              const compactDate = att.date.split(".").slice(1).join(".");
              const dateObj = parseDotDate(att.date);
              const dayLabel = WEEK_LABELS_SUN[dateObj.getDay()];
              const result = att.result as "win" | "lose" | "draw";
              const resultLabel = result === "win" ? "승" : result === "lose" ? "패" : "무";

              // 점수 표기: home : away (홈팀 좌측)
              const score = att.score && att.score.includes(":")
                ? att.score.replace(/\s/g, "").split(":").join(" : ")
                : "- : -";

              return (
                <article className="hd-recent-card" key={att.id}>
                  <p className="hd-recent-date">{compactDate} ({dayLabel})</p>
                  <div className="hd-recent-score">
                    <TeamBadge teamId={att.homeTeamId} size="sm" />
                    <span className="hd-score-text">{score}</span>
                    <TeamBadge teamId={att.awayTeamId} size="sm" />
                  </div>
                  <div className="hd-result-line">
                    <span className={`hd-result-dot hd-result-${result === "lose" ? "loss" : result}`} />
                    <span className={`hd-result-text hd-text-${result === "lose" ? "loss" : result}`}>{resultLabel}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* WEEKLY SCHEDULE */}
      {weekDays.length > 0 && (
        <section className="hd-card" aria-label="우리팀 일정">
          <div className="hd-section-header">
            <h2 className="hd-section-title">우리팀 일정</h2>
            <a href="/schedule" className="hd-text-link">전체 일정 <ChevronRight size={14} /></a>
          </div>

          <div className="hd-week-list">
            {weekDays.map((d) => {
              const result = d.game ? getGameResult(d.game, profile.mainTeamId) : null;
              const dayClass = d.dayIndex === 6 ? "hd-week-day-sun" : d.dayIndex === 5 ? "hd-week-day-sat" : "";

              let statusLabel: string | null = null;
              let statusClass = "";
              if (d.isToday) {
                statusLabel = "오늘";
                statusClass = "hd-week-status-today";
              } else if (result === "win") {
                statusLabel = "승";
                statusClass = "hd-text-win";
              } else if (result === "lose") {
                statusLabel = "패";
                statusClass = "hd-text-loss";
              } else if (result === "draw") {
                statusLabel = "무";
                statusClass = "hd-text-draw";
              } else if (d.game) {
                statusLabel = "예정";
                statusClass = "hd-text-info";
              }

              return (
                <article
                  className={`hd-week-cell${d.isToday ? " hd-week-cell-today" : ""}`}
                  key={d.date.toISOString()}
                >
                  <p className={`hd-week-day ${dayClass}`}>{d.label}</p>
                  <p className="hd-week-date">{formatMonthDay(d.date)}</p>
                  {d.game ? (
                    <TeamBadge teamId={d.game.opponentTeamId} size="sm" />
                  ) : (
                    <span className="hd-week-rest" aria-label="휴식" />
                  )}
                  {statusLabel ? <p className={`hd-week-status ${statusClass}`}>{statusLabel}</p> : null}
                </article>
              );
            })}
          </div>

          <p className="hd-week-summary">
            {weekAwayCount}경기 원정 · {weekHomeCount}경기 홈
          </p>
        </section>
      )}

      <AppModals open={modal} setOpen={setModal} games={modalGames} />
    </AppShell>
  );
}
