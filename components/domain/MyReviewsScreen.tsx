"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ReviewCard } from "@/components/domain/ReviewCard";
import { useAppState } from "@/lib/state/AppState";
import type { Review } from "@/lib/types/domain";

type MyReviewsScreenProps = {
  dbReviews?: Review[];
};

export function MyReviewsScreen({ dbReviews = [] }: MyReviewsScreenProps) {
  const { reviews, likedReviewIds, savedReviewIds, toggleLike, toggleSave } = useAppState();
  const sourceReviews = dbReviews.length > 0 ? dbReviews : reviews;
  const myReviews = sourceReviews;

  return (
    <AppShell activeTab="my" title="내 후기 모음" theme="dark" backHref="/my">
      <div className="review-feed">
        {myReviews.map((review) => (
          <ReviewCard
            key={review.id}
            liked={likedReviewIds.includes(review.id)}
            review={review}
            saved={savedReviewIds.includes(review.id)}
            onToggleLike={() => toggleLike(review.id)}
            onToggleSave={() => toggleSave(review.id)}
          />
        ))}
        {myReviews.length === 0 ? <p className="empty-inline">작성한 후기가 아직 없어요.</p> : null}
      </div>
    </AppShell>
  );
}
