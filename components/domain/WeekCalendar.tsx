import type { CSSProperties } from "react";

import { getTeam } from "@/lib/constants/teams";
import { weekDays, weekSeries } from "@/lib/mock/home";

export function WeekCalendar() {
  return (
    <section className="section-block">
      <div className="section-title-row">
        <h2>이번주 우리팀 일정</h2>
        <a href="/schedule">전체 보기</a>
      </div>
      <div className="series-week-grid" aria-label="이번 주 시리즈 일정">
        <div className="week-strip">
          {weekDays.map((day) => (
            <div className={`week-day ${day.active ? "week-day-active" : ""}`} key={`${day.label}-${day.date}`}>
              <span>{day.label}</span>
              <strong>{day.date}</strong>
              {day.badge ? <b>{day.badge}</b> : null}
            </div>
          ))}
        </div>
        <div className="week-series-row">
          {weekSeries.map((series) => {
            const team = getTeam(series.teamId);

            return (
              <span
                className="week-series-pill"
                key={series.label}
                style={{
                  "--series-color": team.color,
                  "--series-accent": team.accent ?? team.color,
                  gridColumn: `${series.startDay} / span ${series.span}`
                } as CSSProperties}
              >
                {series.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
