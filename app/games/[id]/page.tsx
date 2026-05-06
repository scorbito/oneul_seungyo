import { unstable_noStore as noStore } from "next/cache";
import { GameDetailScreen } from "@/components/domain/GameDetailScreen";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Game } from "@/lib/types/domain";

async function getGameById(id: string): Promise<Game | undefined> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("games")
    .select("id,game_date,game_time,stadium,home_team_id,away_team_id,home_score,away_score,status")
    .eq("id", id)
    .maybeSingle();

  if (!data) return undefined;

  return {
    id: data.id,
    date: data.game_date.replaceAll("-", "."),
    time: data.game_time ?? "",
    stadium: data.stadium,
    homeTeamId: data.home_team_id,
    awayTeamId: data.away_team_id,
    homeScore: data.home_score ?? undefined,
    awayScore: data.away_score ?? undefined,
    status: data.status === "finished" ? "finished" : "scheduled"
  };
}

export default async function GameDetailPage({ params }: { params: { id: string } }) {
  noStore();
  const game = await getGameById(params.id).catch(() => undefined);

  return <GameDetailScreen game={game} />;
}
