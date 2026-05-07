"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { AppModals, type ModalKind } from "@/components/domain/AppModals";
import { getTeam } from "@/lib/constants/teams";
import { useAppState } from "@/lib/state/AppState";
import type { Game } from "@/lib/types/domain";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const toDateKey = (date: Date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;

const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

type CalendarDate = { date: Date; inMonth: boolean };

const getMonthDates = (visibleMonth: Date): CalendarDate[] => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstDay.getDay());
  const totalCells = 42; // 6주 × 7일
  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, inMonth: date.getMonth() === month };
  });
};

const getMainTeamResult = (game: Game, mainTeamId: string): "win" | "lose" | "draw" | null => {
  if (game.status !== "finished" || game.homeScore == null || game.awayScore == null) return null;
  if (game.homeScore === game.awayScore) return "draw";
  const isHome = game.homeTeamId === mainTeamId;
  const isAway = game.awayTeamId === mainTeamId;
  if (!isHome && !isAway) return null;
  return (isHome ? game.homeScore > game.awayScore : game.awayScore > game.homeScore) ? "win" : "lose";
};

type DayMark = {
  opponentId: string;
  isHome: boolean;
  attended: boolean;
  result: "win" | "lose" | "draw" | null;
};

const getDayMark = (games: Game[], mainTeamId: string, attendedKeys: Set<string>): DayMark | null => {
  const myGame = games.find((g) => g.homeTeamId === mainTeamId || g.awayTeamId === mainTeamId);
  if (!myGame) return null;
  const isHome = myGame.homeTeamId === mainTeamId;
  return {
    opponentId: isHome ? myGame.awayTeamId : myGame.homeTeamId,
    isHome,
    attended: attendedKeys.has(myGame.date),
    result: getMainTeamResult(myGame, mainTeamId)
  };
};

type ScheduleScreenProps = { games?: Game[] };

export function ScheduleScreen({ games = [] }: ScheduleScreenProps) {
  const { profile, attendances } = useAppState();
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [modal, setModal] = useState<ModalKind>(null);

  const calendarDates = useMemo(() => getMonthDates(visibleMonth), [visibleMonth]);

  const gamesByDate = useMemo(() => {
    const map = new Map<string, Game[]>();
    games.forEach((game) => {
      const list = map.get(game.date) ?? [];
      list.push(game);
      map.set(game.date, list);
    });
    return map;
  }, [games]);

  const attendedKeys = useMemo(() => {
    const set = new Set<string>();
    attendances.forEach((a) => set.add(a.date));
    return set;
  }, [attendances]);

  const selectedKey = toDateKey(selectedDate);
  const selectedGames = useMemo(() => {
    const list = gamesByDate.get(selectedKey) ?? [];
    return [...list].sort((a, b) => {
      const aMine = a.homeTeamId === profile.mainTeamId || a.awayTeamId === profile.mainTeamId ? -1 : 0;
      const bMine = b.homeTeamId === profile.mainTeamId || b.awayTeamId === profile.mainTeamId ? -1 : 0;
      return aMine - bMine;
    });
  }, [gamesByDate, profile.mainTeamId, selectedKey]);

  const moveMonth = (dir: -1 | 1) => {
    setVisibleMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + dir, 1);
      setSelectedDate(new Date(next));
      return next;
    });
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== visibleMonth.getMonth() || date.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const selectedTitle = `${selectedDate.getMonth() + 1}.${selectedDate.getDate()} (${WEEKDAYS[selectedDate.getDay()]})`;

  return (
    <AppShell activeTab="schedule" title="일정" theme="dark">
      <section className="sched-card">
        <div className="sched-header">
          <button type="button" aria-label="이전 월" onClick={() => moveMonth(-1)}>
            <ChevronLeft size={20} />
          </button>
          <strong>
            {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
          </strong>
          <button type="button" aria-label="다음 월" onClick={() => moveMonth(1)}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="sched-weeknames">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="sched-grid">
          {calendarDates.map(({ date, inMonth }) => {
            const dateKey = toDateKey(date);
            const isSelected = isSameDate(date, selectedDate);
            const dayList = gamesByDate.get(dateKey) ?? [];
            const mark = getDayMark(dayList, profile.mainTeamId, attendedKeys);
            const dayOfWeek = date.getDay();
            const dayClass = dayOfWeek === 0 ? "sched-cell-sun" : dayOfWeek === 6 ? "sched-cell-sat" : "";

            return (
              <button
                key={dateKey}
                type="button"
                className={`sched-cell ${dayClass} ${isSelected ? "sched-cell-selected" : ""} ${!inMonth ? "sched-cell-out" : ""}`}
                onClick={() => selectDate(date)}
              >
                <span className="sched-date">{date.getDate()}</span>
                {mark ? <TeamBadge teamId={mark.opponentId} size="sm" /> : null}
                {mark && (mark.attended || mark.result) ? (
                  <span className="sched-marks">
                    {mark.attended ? (
                      <span className="sched-mark sched-mark-attended" aria-label="직관">
                        <Check size={11} strokeWidth={3.5} />
                      </span>
                    ) : null}
                    {mark.result ? (
                      <span
                        className={`sched-mark-dot sched-mark-${mark.result === "lose" ? "loss" : mark.result}`}
                        aria-label={mark.result}
                      />
                    ) : null}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="sched-card sched-day-card">
        <div className="sched-day-head">
          <strong className="sched-day-title">{selectedTitle}</strong>
          <button type="button" className="sched-attendance-btn" onClick={() => setModal("attendance")}>
            <Plus size={14} strokeWidth={3} /> 직관 등록
          </button>
        </div>

        <div className="sched-game-list">
          {selectedGames.length > 0 ? (
            selectedGames.map((game) => {
              const home = getTeam(game.homeTeamId);
              const away = getTeam(game.awayTeamId);
              const isMine = game.homeTeamId === profile.mainTeamId || game.awayTeamId === profile.mainTeamId;
              const center = game.status === "finished"
                ? <span className="sched-game-score">{game.homeScore} : {game.awayScore}</span>
                : <span className="sched-game-vs">VS</span>;

              const statusLabel = game.status === "finished" ? "경기종료" : "경기전";
              const statusClass = game.status === "finished" ? "sched-game-status-done" : "sched-game-status-pre";

              return (
                <div
                  className={`sched-game-row ${isMine ? "sched-game-row-mine" : ""}`}
                  key={game.id}
                >
                  <span className="sched-game-time">{game.time ? game.time.slice(0, 5) : "--:--"}</span>
                  <div className="sched-game-match">
                    <span className="sched-game-team">
                      <TeamBadge teamId={game.awayTeamId} size="sm" />
                      <strong>{away.shortName}</strong>
                    </span>
                    {center}
                    <span className="sched-game-team sched-game-team-right">
                      <strong>{home.shortName}</strong>
                      <TeamBadge teamId={game.homeTeamId} size="sm" />
                    </span>
                  </div>
                  <span className={`sched-game-status ${statusClass}`}>{statusLabel}</span>
                </div>
              );
            })
          ) : (
            <p className="sched-game-empty">선택한 날짜에는 경기 일정이 없습니다.</p>
          )}
        </div>
      </section>

      <AppModals open={modal} setOpen={setModal} games={games} initialDate={selectedKey} />
    </AppShell>
  );
}
