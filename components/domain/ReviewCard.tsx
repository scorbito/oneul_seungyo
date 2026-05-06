"use client";

import { useState } from "react";
import Image from "next/image";
import { Bookmark, Heart, MessageCircle, Send } from "lucide-react";
import { TeamBadge } from "@/components/common/TeamBadge";
import type { Review } from "@/lib/types/domain";

type ReviewCardProps = {
  review: Review;
  liked?: boolean;
  saved?: boolean;
  onToggleLike?: () => void;
  onToggleSave?: () => void;
};

const BODY_PREVIEW_LENGTH = 90;

export function ReviewCard({ review, liked = false, saved = false, onToggleLike, onToggleSave }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const canToggleBody = review.body.length > BODY_PREVIEW_LENGTH;
  const body = canToggleBody && !expanded ? `${review.body.slice(0, BODY_PREVIEW_LENGTH)}...` : review.body;
  const likeCount = review.likes + (liked ? 1 : 0);

  return (
    <article className="review-card">
      <div className="review-author">
        <span className="review-avatar" aria-hidden="true" />
        <div>
          <strong>{review.author}</strong>
          <span>{review.timeAgo}</span>
        </div>
        <TeamBadge teamId={review.teamId} size="sm" />
      </div>
      <a className="review-image-link" href={`/reviews/${review.id}`}>
        <Image alt={review.title || "후기 사진"} className="review-image" height={220} src={review.image} width={330} />
        <span>1/3</span>
      </a>
      {review.title ? <a className="review-title" href={`/reviews/${review.id}`}>{review.title}</a> : null}
      <p>
        {body}
        {canToggleBody ? (
          <button
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
            style={{
              background: "transparent",
              border: 0,
              color: "#4371b7",
              cursor: "pointer",
              font: "inherit",
              fontWeight: 900,
              marginLeft: 6,
              padding: 0
            }}
            type="button"
          >
            {expanded ? "접기" : "더보기"}
          </button>
        ) : null}
      </p>
      {review.tags.length > 0 && (
        <div className="review-tags">
          {review.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      )}
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
