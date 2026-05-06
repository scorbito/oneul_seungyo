import { unstable_noStore as noStore } from "next/cache";
import { ScheduleScreen } from "@/components/domain/ScheduleScreen";
import { listGamesFromDb } from "@/lib/supabase/queries";
import type { Game } from "@/lib/types/domain";

function toDotDate(date: string) {
  return date.replaceAll("-", ".");
}

function toDomainGame(game: Awaited<ReturnType<typeof listGamesFromDb>>[number]): Game {
  return {
    id: game.id,
    date: toDotDate(game.date),
    time: game.time ?? "",
    stadium: game.stadium,
    homeTeamId: game.homeTeamId,
    awayTeamId: game.awayTeamId,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    status: game.status === "finished" ? "finished" : "scheduled"
  };
}

export default async function SchedulePage() {
  noStore();
  // 현재 월 기준 +/- 1개월 범위로 조회 (사용자가 달력 좌우 한 칸 이동까지 커버)
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const games = await listGamesFromDb({ from: fmt(start), to: fmt(end) })
    .then((items) => items.map(toDomainGame))
    .catch(() => []);

  return <ScheduleScreen games={games} />;
}
