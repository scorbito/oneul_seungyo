"use client";

import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { WeekCalendar } from "@/components/domain/WeekCalendar";
import { WinRateHeroCard } from "@/components/domain/WinRateHeroCard";
import { getTeam } from "@/lib/constants/teams";
import { allStandings } from "@/lib/mock/app";
import { useAppState } from "@/lib/state/AppState";

const mockToday = new Date(2025, 4, 7);

function parseDotDate(date: string) {
  const [year, month, day] = date.split(".").map(Number);

  return new Date(year, month - 1, day);
}

function getDday(date: string) {
  const targetDate = parseDotDate(date);
  const diffDays = Math.ceil((targetDate.getTime() - mockToday.getTime()) / 86400000);

  if (diffDays === 0) {
    return "D-Day";
  }

  return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
}

export function HomeScreen() {
  const { attendances, profile } = useAppState();

  const upcomingAttendances = attendances
    .filter((a) => !a.result)
    .sort((a, b) => a.date.localeCompare(b.date));

  const recentAttendances = attendances
    .filter((a) => !!a.result)
    .slice(0, 5)
    .reverse();

  const recentWins = recentAttendances.filter((a) => a.result === "win").length;
  const recentLosses = recentAttendances.filter((a) => a.result === "lose").length;
  const recentDraws = recentAttendances.filter((a) => a.result === "draw").length;

  return (
    <AppShell activeTab="home">
      <WinRateHeroCard profile={profile} />

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

      <WeekCalendar />

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
            {allStandings.map((standing) => {
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
