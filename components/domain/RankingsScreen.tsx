"use client";

import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { getTeam } from "@/lib/constants/teams";
import { useAppState } from "@/lib/state/AppState";
import type { TeamStanding } from "@/lib/types/domain";

type RankingsScreenProps = {
  standings?: TeamStanding[];
};

export function RankingsScreen({ standings = [] }: RankingsScreenProps) {
  const { profile } = useAppState();

  return (
    <AppShell activeTab="schedule" title="팀순위" theme="dark">
      <a className="back-link" href="/schedule">
        <ArrowLeft size={18} /> 일정으로 돌아가기
      </a>

      <div className="rankings-title">
        <h1>{new Date().getFullYear()} KBO 정규시즌</h1>
      </div>

      <section className="rankings-card">
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
              const isMine = standing.teamId === profile.mainTeamId;
              return (
                <li className={isMine ? "ranking-row ranking-row-highlighted" : "ranking-row"} key={standing.teamId}>
                  <span className="ranking-rank">{standing.rank}</span>
                  <span className="ranking-team">
                    <TeamBadge teamId={standing.teamId} size="sm" />
                    <strong>{team.shortName}</strong>
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
