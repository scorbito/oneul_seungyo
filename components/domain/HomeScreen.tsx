"use client";

import type { CSSProperties } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { WinRateHeroCard } from "@/components/domain/WinRateHeroCard";
import { getTeam } from "@/lib/constants/teams";
import { useAppState } from "@/lib/state/AppState";
import type { Game, TeamStanding } from "@/lib/types/domain";

function parseDotDate(date: string) {
  const [year, month, day] = date.split(".").map(Number);

  return new Date(year, month - 1, day);
}

function getDday(date: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = parseDotDate(date);
  const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) {
    return "D-Day";
  }

  return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
}

type HomeScreenProps = {
  standings?: TeamStanding[];
  weekGames?: Game[];
  weekStart?: string; // YYYY-MM-DD (월요일)
  modalGames?: Game[]; // 직관 등록 모달용 넓은 범위
};

const WEEK_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

type MyWeekGame = Game & {
  isHome: boolean;
  opponentTeamId: string;
  dateObj: Date;
};

export function HomeScreen({ standings = [], weekGames = [], weekStart, modalGames = [] }: HomeScreenProps) {
  const { attendances, profile } = useAppState();

  const myTeam = getTeam(profile.mainTeamId);
  const myWeekGames: MyWeekGame[] = weekGames
    .filter((g) => g.homeTeamId === profile.mainTeamId || g.awayTeamId === profile.mainTeamId)
    .map((g) => ({
      ...g,
      isHome: g.homeTeamId === profile.mainTeamId,
      opponentTeamId: g.homeTeamId === profile.mainTeamId ? g.awayTeamId : g.homeTeamId,
      dateObj: parseDotDate(g.date)
    }))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const weekStartDate = weekStart ? new Date(`${weekStart}T00:00:00`) : null;
  const todayDateOnly = new Date();
  todayDateOnly.setHours(0, 0, 0, 0);

  // 7일 strip
  const weekDays = weekStartDate
    ? Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() + i);
        const game = myWeekGames.find((g) => g.dateObj.getTime() === d.getTime());
        const isToday = d.getTime() === todayDateOnly.getTime();
        let badge: string | undefined;
        if (game) {
          if (game.status === "finished" && game.homeScore !== undefined && game.awayScore !== undefined) {
            const won = game.isHome ? game.homeScore > game.awayScore : game.awayScore > game.homeScore;
            const drew = game.homeScore === game.awayScore;
            badge = drew ? "무" : won ? "승" : "패";
          } else {
            badge = "예정";
          }
        }
        return { date: d, label: WEEK_LABELS[i], dayNum: d.getDate(), isToday, badge };
      })
    : [];

  // 시리즈: 연속 날짜 + 같은 상대 + 같은 홈/원정으로 묶음. 이 주 범위에서 잘라냄.
  const weekSeries = (() => {
    if (!weekStartDate) return [] as Array<{ key: string; opponentTeamId: string; venue: "홈" | "원정"; startDay: number; span: number }>;
    const sorted = [...myWeekGames].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    type Group = { startIdx: number; endIdx: number; opponentTeamId: string; venue: "홈" | "원정" };
    const groups: Group[] = [];
    for (const g of sorted) {
      const dayIdx = Math.round((g.dateObj.getTime() - weekStartDate.getTime()) / 86400000);
      if (dayIdx < 0 || dayIdx > 6) continue;
      const venue = g.isHome ? "홈" : "원정";
      const prev = groups[groups.length - 1];
      const isContiguous = prev
        && prev.opponentTeamId === g.opponentTeamId
        && prev.venue === venue
        && dayIdx === prev.endIdx + 1;
      if (isContiguous) {
        prev.endIdx = dayIdx;
      } else {
        groups.push({ startIdx: dayIdx, endIdx: dayIdx, opponentTeamId: g.opponentTeamId, venue });
      }
    }
    return groups.map((g, idx) => ({
      key: `${idx}-${g.opponentTeamId}-${g.startIdx}`,
      opponentTeamId: g.opponentTeamId,
      venue: g.venue,
      startDay: g.startIdx + 1,
      span: g.endIdx - g.startIdx + 1
    }));
  })();

  const upcomingAttendances = attendances
    .filter((a) => !a.result)
    .sort((a, b) => a.date.localeCompare(b.date));

  // 최근 직관 5개: 경기 날짜 기준 정렬 (왼쪽=오래된, 오른쪽=최신)
  const recentAttendances = attendances
    .filter((a) => !!a.result)
    .sort((a, b) => b.date.localeCompare(a.date)) // 최신순으로 정렬
    .slice(0, 5)                                   // 최근 5개 추출
    .reverse();                                    // 표시는 오래된→최신

  const recentWins = recentAttendances.filter((a) => a.result === "win").length;
  const recentLosses = recentAttendances.filter((a) => a.result === "lose").length;
  const recentDraws = recentAttendances.filter((a) => a.result === "draw").length;

  return (
    <AppShell activeTab="home">
      <WinRateHeroCard profile={profile} games={modalGames} />

      {upcomingAttendances.length > 0 && (() => {
        const att = upcomingAttendances[0];
        const home = getTeam(att.homeTeamId);
        const away = getTeam(att.awayTeamId);

        return (
          <section className="next-game-section">
            <div className="game-banner">
              <div className="next-game-card">
                <div className="next-game-meta">
                  <p className="next-game-label">
                    <span>다음 직관</span>
                    <b>{getDday(att.date)}</b>
                  </p>
                  <time>{att.date}{att.time ? ` ${att.time}` : ""}</time>
                  <em>{att.stadium}</em>
                </div>
                <div className="game-banner-teams">
                  <TeamBadge teamId={att.homeTeamId} size="md" />
                  <strong>{home.shortName}</strong>
                  <b>VS</b>
                  <strong>{away.shortName}</strong>
                  <TeamBadge teamId={att.awayTeamId} size="md" />
                </div>
              </div>
            </div>
            {upcomingAttendances.length >= 2 && (
              <a className="next-game-view-all" href="/my/attendances">전체 보기</a>
            )}
          </section>
        );
      })()}

      <section className="recent-attendance-card">
        <div className="section-title-row">
          <div className="recent-attendance-title">
            <h2>최근 직관 경기</h2>
            <p>{recentWins}승 {recentLosses}패 {recentDraws}무</p>
          </div>
          <a href="/my/attendances">더보기</a>
        </div>
        <div className="recent-attendance-list">
          {recentAttendances.map((attendance) => {
            const home = getTeam(attendance.homeTeamId);
            const away = getTeam(attendance.awayTeamId);
            const resultLabel = attendance.result === "win" ? "승" : attendance.result === "lose" ? "패" : attendance.result === "draw" ? "무" : "예정";
            const compactDate = attendance.date.split(".").slice(1).join(".");
            const [homeScore, awayScore] = attendance.score.split(":").map((value) => value.trim());

            return (
              <article className="recent-attendance-row" key={attendance.id}>
                <span>{compactDate}</span>
                <strong>{home.shortName} <b>{homeScore}</b></strong>
                <strong>{away.shortName} <b>{awayScore}</b></strong>
                <em className={`recent-result recent-result-${attendance.result ?? "pending"}`}>{resultLabel}</em>
              </article>
            );
          })}
        </div>
      </section>

      {weekDays.length > 0 && (
        <section className="section-block">
          <div className="section-title-row">
            <h2>이번주 {myTeam.shortName} 일정</h2>
            <a href="/schedule">전체 보기</a>
          </div>
          <div className="series-week-grid" aria-label="이번 주 시리즈 일정">
            <div className="week-strip">
              {weekDays.map((day) => (
                <div className={`week-day ${day.isToday ? "week-day-active" : ""}`} key={day.date.toISOString()}>
                  <span>{day.label}</span>
                  <strong>{day.dayNum}</strong>
                  {day.badge ? <b>{day.badge}</b> : null}
                </div>
              ))}
            </div>
            <div className="week-series-row">
              {weekSeries.map((series) => {
                const opponent = getTeam(series.opponentTeamId);
                const label = series.span > 1
                  ? `${opponent.shortName}전 ${series.venue}`
                  : `${opponent.shortName} ${series.venue}`;
                return (
                  <span
                    className="week-series-pill"
                    key={series.key}
                    style={{
                      "--series-color": opponent.color,
                      "--series-accent": opponent.accent ?? opponent.color,
                      gridColumn: `${series.startDay} / span ${series.span}`
                    } as CSSProperties}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="section-block rank-section">
        <div className="section-title-row">
          <h2>팀 순위</h2>
        </div>
        <div className="ranking-table">
          <div className="ranking-table-head">
            <span>순위</span>
            <span>팀</span>
            <span>승률</span>
            <span>차</span>
            <span>승-무-패</span>
            <span>최근5</span>
          </div>
          <ol className="ranking-table-body">
            {standings.map((standing) => {
              const team = getTeam(standing.teamId);
              return (
                <li className={standing.teamId === profile.mainTeamId ? "ranking-row ranking-row-highlighted" : "ranking-row"} key={standing.teamId}>
                  <span className="ranking-rank">{standing.rank}</span>
                  <span className="ranking-team">
                    <TeamBadge teamId={standing.teamId} size="sm" />
                    <strong style={{ color: team.color }}>{team.shortName}</strong>
                  </span>
                  <span className="ranking-rate">{standing.winRate}</span>
                  <span className="ranking-gap">{standing.gamesBehind === "-" ? "-" : standing.gamesBehind}</span>
                  <span className="ranking-record">{standing.wins}-{standing.draws}-{standing.losses}</span>
                  <span className="ranking-form">
                    {standing.form.slice(-5).map((result, index) => (
                      <i className={`ranking-dot ranking-dot-${result.toLowerCase()}`} key={`${standing.teamId}-${index}`} />
                    ))}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </AppShell>
  );
}
