"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { AppModals, type ModalKind } from "@/components/domain/AppModals";
import { GameCard } from "@/components/domain/GameCard";
import { getTeam } from "@/lib/constants/teams";
import { useAppState } from "@/lib/state/AppState";
import type { Game } from "@/lib/types/domain";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type CalendarDate = {
  date: Date;
  inMonth: boolean;
};

const toDateKey = (date: Date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

function parseDotDate(date: string) {
  const [year, month, day] = date.split(".").map(Number);
  return new Date(year, month - 1, day);
}

const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const getMonthDates = (visibleMonth: Date): CalendarDate[] => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, inMonth: date.getMonth() === month };
  });
};

const getMainTeamResult = (game: Game, mainTeamId: string) => {
  if (game.status !== "finished" || game.homeScore === undefined || game.awayScore === undefined) {
    return undefined;
  }

  if (game.homeScore === game.awayScore) {
    return "draw";
  }

  const mainTeamIsHome = game.homeTeamId === mainTeamId;
  const mainTeamIsAway = game.awayTeamId === mainTeamId;

  if (!mainTeamIsHome && !mainTeamIsAway) {
    return undefined;
  }

  const mainTeamWon = mainTeamIsHome ? game.homeScore > game.awayScore : game.awayScore > game.homeScore;
  return mainTeamWon ? "win" : "lose";
};

const getResultText = (result?: Game["result"]) => {
  if (result === "win") {
    return "승";
  }

  if (result === "lose") {
    return "패";
  }

  if (result === "draw") {
    return "무";
  }

  return "";
};

const getDateBadge = (games: Game[], mainTeamId: string): { label: string; result?: "win" | "lose" | "draw" } | null => {
  const attendedGame = games.find((game) => game.attended);

  if (attendedGame) {
    if (attendedGame.status !== "finished") {
      return { label: "직" };
    }
    const result = attendedGame.result ?? getMainTeamResult(attendedGame, mainTeamId);
    return { label: `직${getResultText(result)}`, result };
  }

  const mainTeamGame = games.find((game) => game.homeTeamId === mainTeamId || game.awayTeamId === mainTeamId);
  if (!mainTeamGame) return null;
  const result = getMainTeamResult(mainTeamGame, mainTeamId);
  if (!result) return null;
  return { label: getResultText(result), result };
};

type ScheduleScreenProps = {
  games?: Game[];
};

export function ScheduleScreen({ games = [] }: ScheduleScreenProps) {
  const { profile } = useAppState();
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [modal, setModal] = useState<ModalKind>(null);

  const calendarDates = useMemo(() => getMonthDates(visibleMonth), [visibleMonth]);
  const calendarWeeks = useMemo(
    () => Array.from({ length: Math.ceil(calendarDates.length / 7) }, (_, index) => calendarDates.slice(index * 7, index * 7 + 7)),
    [calendarDates]
  );
  const getGamesForDate = useMemo(() => {
    const dbGamesByDate = new Map<string, Game[]>();
    games.forEach((game) => {
      const current = dbGamesByDate.get(game.date) ?? [];
      current.push(game);
      dbGamesByDate.set(game.date, current);
    });

    return (date: Date) => {
      const dateKey = toDateKey(date);
      return dbGamesByDate.get(dateKey) ?? [];
    };
  }, [games]);

  // 우리 팀이 출전한 경기를 연속 날짜 + 같은 상대 + 같은 홈/원정으로 묶어 시리즈 산출
  const teamSeries = useMemo(() => {
    type Series = { startDate: Date; endDate: Date; opponentTeamId: string; venue: "홈" | "원정" };
    const myGames = games
      .filter((g) => g.homeTeamId === profile.mainTeamId || g.awayTeamId === profile.mainTeamId)
      .map((g) => ({
        date: parseDotDate(g.date),
        isHome: g.homeTeamId === profile.mainTeamId,
        opponentTeamId: g.homeTeamId === profile.mainTeamId ? g.awayTeamId : g.homeTeamId
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const series: Series[] = [];
    for (const g of myGames) {
      const prev = series[series.length - 1];
      const isContiguous = prev
        && prev.opponentTeamId === g.opponentTeamId
        && (prev.venue === "홈") === g.isHome
        && (g.date.getTime() - prev.endDate.getTime()) <= 86400000;
      if (isContiguous) {
        prev.endDate = g.date;
      } else {
        series.push({
          startDate: g.date,
          endDate: g.date,
          opponentTeamId: g.opponentTeamId,
          venue: g.isHome ? "홈" : "원정"
        });
      }
    }
    return series;
  }, [games, profile.mainTeamId]);

  const getSeriesSegmentsForWeek = (week: CalendarDate[]) => {
    const weekStart = week[0].date.getTime();
    const weekEnd = week[6].date.getTime();
    return teamSeries
      .map((s) => {
        const segStart = Math.max(s.startDate.getTime(), weekStart);
        const segEnd = Math.min(s.endDate.getTime(), weekEnd);
        if (segStart > segEnd) return null;
        const startDay = new Date(segStart).getDay() + 1;
        const span = Math.round((segEnd - segStart) / 86400000) + 1;
        return {
          opponentTeamId: s.opponentTeamId,
          venue: s.venue,
          startDay,
          span,
          continuesFromPreviousWeek: s.startDate.getTime() < weekStart,
          continuesToNextWeek: s.endDate.getTime() > weekEnd
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  };
  const selectedGames = useMemo(() => {
    return [...getGamesForDate(selectedDate)].sort((a, b) => {
      const aHasMainTeam = a.homeTeamId === profile.mainTeamId || a.awayTeamId === profile.mainTeamId;
      const bHasMainTeam = b.homeTeamId === profile.mainTeamId || b.awayTeamId === profile.mainTeamId;

      if (aHasMainTeam === bHasMainTeam) {
        return 0;
      }

      return aHasMainTeam ? -1 : 1;
    });
  }, [getGamesForDate, profile.mainTeamId, selectedDate]);
  const attendedCount = selectedGames.filter((game) => game.attended).length;
  const verifiedCount = selectedGames.filter((game) => game.verified).length;

  const moveMonth = (direction: -1 | 1) => {
    setVisibleMonth((current) => {
      const nextMonth = new Date(current.getFullYear(), current.getMonth() + direction, 1);
      setSelectedDate(new Date(nextMonth));
      return nextMonth;
    });
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);

    if (date.getMonth() !== visibleMonth.getMonth() || date.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const selectedTitle = `${selectedDate.getMonth() + 1}.${selectedDate.getDate()} (${WEEKDAYS[selectedDate.getDay()]})`;
  const selectedSummary =
    selectedGames.length > 0
      ? `경기 ${selectedGames.length}개 · 직관 ${attendedCount}개 · 인증 ${verifiedCount}개`
      : "예정된 경기가 없는 날이에요";

  return (
    <AppShell activeTab="schedule" title="일정">
      <section className="calendar-card">
        <div className="calendar-header">
          <button aria-label="이전 월" type="button" onClick={() => moveMonth(-1)}>
            <ChevronLeft size={18} />
          </button>
          <strong>
            {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
          </strong>
          <button aria-label="다음 월" type="button" onClick={() => moveMonth(1)}>
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="calendar-weeknames">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="month-grid">
          {calendarWeeks.map((week, weekIndex) => (
            <div className="month-week" key={`${visibleMonth.toISOString()}-${weekIndex}`}>
              <div className="month-week-days">
                {week.map(({ date, inMonth }) => {
                  const dateKey = toDateKey(date);
                  const isSelected = isSameDate(date, selectedDate);
                  const games = getGamesForDate(date);
                  const dateBadge = getDateBadge(games, profile.mainTeamId);

                  return (
                    <button
                      className={`month-cell ${isSelected ? "month-cell-selected" : ""}`}
                      key={dateKey}
                      style={{
                        color: !inMonth && !isSelected ? "#b5bbc4" : undefined,
                        cursor: "pointer"
                      }}
                      type="button"
                      onClick={() => selectDate(date)}
                    >
                      <span className="month-date-line">
                        <span>{date.getDate()}</span>
                        {dateBadge ? (
                          <b className={dateBadge.result ? `month-cell-badge month-cell-badge-${dateBadge.result}` : "month-cell-badge"}>
                            {dateBadge.label}
                          </b>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="month-series-row">
                {getSeriesSegmentsForWeek(week).map((series, index) => {
                  const opponent = getTeam(series.opponentTeamId);
                  return (
                    <span
                      className={`month-series-bar month-series-${series.venue === "홈" ? "home" : "away"} ${series.continuesFromPreviousWeek ? "month-series-continued-start" : ""} ${series.continuesToNextWeek ? "month-series-continued-end" : ""}`}
                      key={`${weekIndex}-${series.opponentTeamId}-${series.venue}-${series.startDay}-${index}`}
                      style={{
                        "--series-color": opponent.color,
                        "--series-accent": opponent.accent ?? opponent.color,
                        gridColumn: `${series.startDay} / span ${series.span}`
                      } as CSSProperties}
                    >
                      {series.span > 1 ? <small>{series.venue}</small> : null}
                      <span>{opponent.shortName}{series.span > 1 ? "전" : ""}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="day-panel">
        <div className="day-panel-title">
          <div className="day-panel-heading">
            <CalendarDays size={18} />
            <div>
              <strong>{selectedTitle}</strong>
              <span>{selectedSummary}</span>
            </div>
          </div>
          <button className="day-attendance-button" type="button" onClick={() => setModal("attendance")}>
            직관 등록
          </button>
        </div>
        <div className="game-list">
          {selectedGames.length > 0 ? (
            selectedGames.map((game) => (
              <GameCard
                game={game}
                highlighted={game.homeTeamId === profile.mainTeamId || game.awayTeamId === profile.mainTeamId}
                key={game.id}
              />
            ))
          ) : (
            <p style={{ color: "#7b8290", fontSize: 13, fontWeight: 700, margin: "14px 0" }}>
              선택한 날짜에는 경기 일정이 없습니다.
            </p>
          )}
        </div>
      </section>
      <AppModals open={modal} setOpen={setModal} games={games} initialDate={toDateKey(selectedDate)} />
    </AppShell>
  );
}
