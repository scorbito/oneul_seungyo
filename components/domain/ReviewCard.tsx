"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { TeamBadge } from "@/components/common/TeamBadge";
import { getTeam } from "@/lib/constants/teams";
import type { Review } from "@/lib/types/domain";

type ReviewCardProps = {
  review: Review;
  liked?: boolean;
  saved?: boolean;
  onToggleLike?: () => void;
  onToggleSave?: () => void;
  actionSlot?: ReactNode;
};

export function ReviewCard({ review, liked = false, saved = false, onToggleLike, onToggleSave, actionSlot }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    setIsClamped(el.scrollHeight > el.clientHeight + 1);
  }, [review.body]);

  const likeCount = review.likes + (liked ? 1 : 0);
  const showToggle = isClamped || expanded;

  return (
    <article className="review-card">
      <div className="review-author">
        {review.authorAvatarUrl ? (
          <span className="review-avatar review-avatar-image" aria-hidden="true">
            <Image alt="" src={review.authorAvatarUrl} fill sizes="32px" style={{ objectFit: "cover" }} />
          </span>
        ) : (
          <span className="review-avatar review-avatar-initial" aria-hidden="true">
            {(review.author || "?").slice(0, 1)}
          </span>
        )}
        <div>
          <strong>{review.author}</strong>
          <span>{review.timeAgo}</span>
        </div>
        {actionSlot ? <div className="review-author-action">{actionSlot}</div> : null}
        <TeamBadge teamId={review.teamId} size="sm" />
      </div>
      <a className="review-image-link" href={`/reviews/${review.id}`}>
        <Image alt={review.title || "후기 사진"} className="review-image" height={220} src={review.image} width={330} />
        {review.images && review.images.length > 1 ? <span>1/{review.images.length}</span> : null}
      </a>
      {review.game ? (() => {
        const home = getTeam(review.game.homeTeamId);
        const away = getTeam(review.game.awayTeamId);
        const score = review.game.homeScore !== null && review.game.awayScore !== null
          ? `${review.game.homeScore} : ${review.game.awayScore}`
          : "경기전";
        const result = review.game.result;
        const resultLabel = result === "win" ? "승" : result === "lose" ? "패" : result === "draw" ? "무" : null;
        return (
          <div className="review-game-meta">
            <span className="review-game-meta-date">{review.game.date}</span>
            <div className="review-game-meta-match">
              <TeamBadge teamId={review.game.homeTeamId} size="sm" />
              <strong>{home.shortName}</strong>
              <b>{score}</b>
              <strong>{away.shortName}</strong>
              <TeamBadge teamId={review.game.awayTeamId} size="sm" />
            </div>
            {resultLabel ? (
              <span className={`review-game-meta-result review-game-meta-result-${result}`}>{resultLabel}</span>
            ) : null}
          </div>
        );
      })() : null}
      {review.title ? <a className="review-title" href={`/reviews/${review.id}`}>{review.title}</a> : null}
      <p ref={bodyRef} className={expanded ? "review-body" : "review-body review-body-clamped"}>
        {review.body}
      </p>
      {showToggle ? (
        <button
          type="button"
          className="review-body-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "접기" : "더보기"}
        </button>
      ) : null}
      {/* 해시태그 칩은 MVP에서 숨김 — 본문 안 #태그 텍스트는 그대로 표시 */}
      <div className="review-actions">
        <button
          aria-label={liked ? "좋아요 취소" : "좋아요"}
          aria-pressed={liked}
          onClick={onToggleLike}
          style={liked ? { color: "#e11d48" } : undefined}
          type="button"
        >
          <Heart fill={liked ? "currentColor" : "none"} size={18} />
          {likeCount}
        </button>
        <span><MessageCircle size={18} />{review.comments}</span>
        <span><Send size={18} /></span>
        <button
          aria-label={saved ? "저장 취소" : "저장"}
          aria-pressed={saved}
          onClick={onToggleSave}
          style={saved ? { color: "#2563eb" } : undefined}
          type="button"
        >
          <Bookmark fill={saved ? "currentColor" : "none"} size={18} />
        </button>
      </div>
    </article>
  );
}
