"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ReviewCard } from "@/components/domain/ReviewCard";
import { useAppState } from "@/lib/state/AppState";

export function MyReviewsScreen() {
  const { reviews, likedReviewIds, savedReviewIds, toggleLike, toggleSave, deleteReview } = useAppState();
  const myReviews = reviews.filter((review) => review.author === "승요맨" || review.timeAgo === "방금 전");

  return (
    <AppShell activeTab="my" title="내 후기 모음">
      <a className="back-link" href="/my"><ArrowLeft size={18} /> 마이로 돌아가기</a>
      <div className="review-feed">
        {myReviews.map((review) => (
          <div key={review.id} className="owned-review-wrap">
            <ReviewCard
              liked={likedReviewIds.includes(review.id)}
              review={review}
              saved={savedReviewIds.includes(review.id)}
              onToggleLike={() => toggleLike(review.id)}
              onToggleSave={() => toggleSave(review.id)}
            />
            <button className="inline-delete owned-delete" type="button" onClick={() => deleteReview(review.id)}>
              <Trash2 size={14} /> 삭제
            </button>
          </div>
        ))}
        {myReviews.length === 0 ? <p className="empty-inline">작성한 후기가 아직 없어요.</p> : null}
      </div>
    </AppShell>
  );
}
