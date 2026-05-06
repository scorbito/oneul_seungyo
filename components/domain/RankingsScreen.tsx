import { ArrowLeft, Info } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { TeamBadge } from "@/components/common/TeamBadge";
import { getTeam } from "@/lib/constants/teams";
import type { TeamStanding } from "@/lib/types/domain";

type RankingsScreenProps = {
  standings?: TeamStanding[];
};

export function RankingsScreen({ standings = [] }: RankingsScreenProps) {
  return (
    <AppShell activeTab="home" title="팀순위">
      <a className="back-link" href="/">
        <ArrowLeft size={18} />
        홈으로 돌아가기
      </a>
      <section className="rankings-header">
        <h1>2025 KBO 정규시즌 <Info size={16} /></h1>
        <SegmentedControl items={["전체", "홈", "원정"]} active="전체" />
      </section>
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
              <li className={standing.teamId === "hanwha" ? "ranking-row ranking-row-highlighted" : "ranking-row"} key={standing.teamId}>
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
    </AppShell>
  );
}
