import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { fetchStandings } from "./fetchStandings";

export type StandingsSyncResult = {
  source: "kbo" | "naver" | "none";
  upserted: number;
};

/**
 * 팀 순위 동기화. team_standings.unique(team_id, season) 기준으로 upsert.
 * 최근 5경기 form은 추후 games에서 파생할 예정 — 지금은 빈 배열로 둠.
 */
export async function syncStandings(season: number): Promise<StandingsSyncResult> {
  const { standings, source } = await fetchStandings(season);

  if (standings.length === 0) {
    return { source, upserted: 0 };
  }

  const supabase = createSupabaseAdminClient();
  const rows = standings.map((s) => ({
    team_id: s.teamId,
    season,
    rank: s.rank,
    wins: s.wins,
    losses: s.losses,
    draws: s.draws,
    games_behind: s.gamesBehind,
    form: [] as Array<"win" | "lose" | "draw">,
    synced_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from("team_standings")
    .upsert(rows, { onConflict: "team_id,season" });

  if (error) {
    throw new Error(`standings upsert failed: ${error.message}`);
  }

  return { source, upserted: rows.length };
}
