"use client";

import { Trophy } from "lucide-react";
import type { SeasonLevelState } from "@/lib/season-level/types";

type SeasonLevelCardProps = {
  state: SeasonLevelState;
};

/**
 * 마이페이지에 노출되는 시즌 레벨 카드 (큰 형식).
 * - 현재 레벨 + 칭호
 * - 누적 XP / 다음 레벨 XP
 * - 진행률 바
 * - 다음 레벨까지 필요한 XP
 */
export function SeasonLevelCard({ state }: SeasonLevelCardProps) {
  const progressPercent = Math.round(state.progress * 100);

  return (
    <article className="season-level-card" aria-label={`${state.season} 시즌 레벨`}>
      <header className="season-level-head">
        <span className="season-level-head-label">
          <Trophy size={13} />
          {state.season} 시즌
        </span>
        <span className="season-level-head-xp">{state.totalXp.toLocaleString()} XP</span>
      </header>

      <div className="season-level-title-row">
        <span className="season-level-badge">Lv.{state.level}</span>
        <strong className="season-level-title">{state.title}</strong>
      </div>

      <div className="season-level-progress" aria-hidden="true">
        <div
          className="season-level-progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="season-level-progress-meta">
        {state.isMax ? (
          <span className="season-level-progress-max">최고 레벨에 도달했어요 🎉</span>
        ) : (
          <>
            <span>{state.totalXp.toLocaleString()} / {state.nextLevelXp.toLocaleString()} XP</span>
            <span>다음 레벨까지 {state.xpToNextLevel.toLocaleString()} XP</span>
          </>
        )}
      </div>
    </article>
  );
}

/**
 * 홈 카드용 짧은 레벨 칩. 간결하게 `Lv.6 응원단골`만 표시.
 * 핵심 정보(직관 승률/현재 직관)를 방해하지 않도록 작고 옅게.
 */
export function SeasonLevelMiniChip({ state }: SeasonLevelCardProps) {
  return (
    <span className="season-level-mini-chip" aria-label={`현재 시즌 레벨 Lv.${state.level} ${state.title}`}>
      <span className="season-level-mini-badge">Lv.{state.level}</span>
      <span className="season-level-mini-title">{state.title}</span>
    </span>
  );
}
