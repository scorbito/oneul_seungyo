import { unstable_noStore as noStore } from "next/cache";
import { HomeScreen } from "@/components/domain/HomeScreen";
import { listGamesFromDb, listStandingsFromDb } from "@/lib/supabase/queries";
import type { Game } from "@/lib/types/domain";

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function toDomainGame(game: Awaited<ReturnType<typeof listGamesFromDb>>[number]): Game {
  return {
    id: game.id,
    date: game.date.replaceAll("-", "."),
    time: game.time ?? "",
    stadium: game.stadium,
    homeTeamId: game.homeTeamId,
    awayTeamId: game.awayTeamId,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    status: game.status === "finished" ? "finished" : "scheduled"
  };
}

export default async function HomePage() {
  noStore();

  // 이번주 (월요일 시작 ~ 일요일 끝) 범위
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offsetToMonday);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

  // 직관 등록 모달용: 이번 시즌 시작(3월 1일) ~ 오늘 +14일
  const modalRangeStart = new Date(today.getFullYear(), 2, 1); // 3월 1일
  const modalRangeEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

  const [standings, recentGames] = await Promise.all([
    listStandingsFromDb(today.getFullYear()).catch(() => []),
    listGamesFromDb({ from: fmt(modalRangeStart), to: fmt(modalRangeEnd) })
      .then((items) => items.map(toDomainGame))
      .catch(() => [])
  ]);

  // 이번주 게임은 recentGames에서 필터
  const weekGames = recentGames.filter((g) => {
    const dot = g.date.replaceAll("-", ".");
    const [y, m, d] = dot.split(".").map(Number);
    const gameTime = new Date(y, m - 1, d).getTime();
    return gameTime >= monday.getTime() && gameTime <= sunday.getTime();
  });

  return (
    <HomeScreen
      standings={standings}
      weekGames={weekGames}
      weekStart={fmt(monday)}
      modalGames={recentGames}
    />
  );
}
