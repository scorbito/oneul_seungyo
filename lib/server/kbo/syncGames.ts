import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { fetchGamesForDate, type RawGame } from "./fetchGames";

export type SyncResult = {
  date: string;
  source: "kbo" | "naver" | "none";
  inserted: number;
  updated: number;
  skipped: number;
};

function toRow(game: RawGame) {
  return {
    external_id: game.externalId,
    game_date: game.gameDate,
    game_time: game.gameTime,
    stadium: game.stadium,
    home_team_id: game.homeTeamId,
    away_team_id: game.awayTeamId,
    home_score: game.homeScore,
    away_score: game.awayScore,
    status: game.status,
    innings: game.innings
  };
}

/** 한 날짜의 경기를 동기화 (idempotent upsert by external_id) */
export async function syncGamesForDate(date: Date): Promise<SyncResult> {
  const dateStr = date.toISOString().slice(0, 10);
  const { games, source } = await fetchGamesForDate(date);

  if (games.length === 0) {
    return { date: dateStr, source, inserted: 0, updated: 0, skipped: 0 };
  }

  const supabase = createSupabaseAdminClient();
  const externalIds = games.map((g) => g.externalId);
  const { data: existing, error: existErr } = await supabase
    .from("games")
    .select("external_id")
    .in("external_id", externalIds);
  if (existErr) throw new Error(`existing fetch failed: ${existErr.message}`);

  const existingIds = new Set((existing ?? []).map((row) => row.external_id));
  const inserts = games.filter((g) => !existingIds.has(g.externalId)).map(toRow);
  const updates = games.filter((g) => existingIds.has(g.externalId)).map(toRow);

  let inserted = 0;
  let updated = 0;

  if (inserts.length > 0) {
    const { error: insertErr } = await supabase.from("games").insert(inserts);
    if (insertErr) throw new Error(`insert failed: ${insertErr.message}`);
    inserted = inserts.length;
  }

  for (const row of updates) {
    const { error: updateErr } = await supabase
      .from("games")
      .update({
        game_date: row.game_date,
        game_time: row.game_time,
        stadium: row.stadium,
        home_team_id: row.home_team_id,
        away_team_id: row.away_team_id,
        home_score: row.home_score,
        away_score: row.away_score,
        status: row.status,
        innings: row.innings
      })
      .eq("external_id", row.external_id);
    if (updateErr) {
      console.error(`update failed for ${row.external_id}:`, updateErr.message);
    } else {
      updated++;
    }
  }

  return { date: dateStr, source, inserted, updated, skipped: 0 };
}

/** 날짜 범위 동기화. KBO 시즌 외 날짜는 자연히 0건. */
export async function syncGamesInRange(fromDate: Date, toDate: Date, options?: { delayMs?: number }): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  const cursor = new Date(fromDate);
  const end = new Date(toDate);
  cursor.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  while (cursor.getTime() <= end.getTime()) {
    try {
      const result = await syncGamesForDate(new Date(cursor));
      results.push(result);
    } catch (err) {
      console.error(`[syncGames] ${cursor.toISOString().slice(0, 10)} failed:`, (err as Error).message);
      results.push({ date: cursor.toISOString().slice(0, 10), source: "none", inserted: 0, updated: 0, skipped: 0 });
    }
    cursor.setDate(cursor.getDate() + 1);
    if (options?.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }

  return results;
}
