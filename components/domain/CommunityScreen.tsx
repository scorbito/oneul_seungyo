"use client";

import { useMemo, useState } from "react";
import { PenLine } from "lucide-react";
import { AppModals, type ModalKind } from "@/components/domain/AppModals";
import { AppShell } from "@/components/layout/AppShell";
import { ReviewCard } from "@/components/domain/ReviewCard";
import { userProfile } from "@/lib/mock/home";
import { useAppState } from "@/lib/state/AppState";

type FeedFilter = "all" | "myTeam" | "friends";

const filters: { id: FeedFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "myTeam", label: "내팀" },
  { id: "friends", label: "친구" }
];

const friendAuthorNames = ["야구광이123", "승요팬", "불꽃직관"];

export function CommunityScreen() {
  const { reviews, likedReviewIds, savedReviewIds, toggleLike, toggleSave } = useAppState();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all");
  const [modal, setModal] = useState<ModalKind>(null);
  const filteredReviews = useMemo(() => {
    if (activeFilter === "myTeam") {
      return reviews.filter((review) => review.teamId === userProfile.mainTeamId);
    }

    if (activeFilter === "friends") {
      return reviews.filter((review) => friendAuthorNames.includes(review.author));
    }

    return reviews;
  }, [activeFilter, reviews]);

  return (
    <AppShell activeTab="community" title="커뮤니티">
      <div className="community-head">
        <div className="filter-chips">
          {filters.map((filter) => (
            <button
              aria-pressed={activeFilter === filter.id}
              className={activeFilter === filter.id ? "chip chip-active" : "chip"}
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <button className="community-write-button" type="button" onClick={() => setModal("review")}>
          <PenLine size={16} />
          후기 작성
        </button>
      </div>
      <div className="review-feed">
        {filteredReviews.map((review) => (
          <ReviewCard
            key={review.id}
            liked={likedReviewIds.includes(review.id)}
            review={review}
            saved={savedReviewIds.includes(review.id)}
            onToggleLike={() => toggleLike(review.id)}
            onToggleSave={() => toggleSave(review.id)}
          />
        ))}
        {filteredReviews.length === 0 ? (
          <p className="empty-inline">
            {activeFilter === "friends" ? "친구가 작성한 후기가 아직 없어요." : "표시할 후기가 없어요."}
          </p>
        ) : null}
      </div>
      <AppModals open={modal} setOpen={setModal} />
    </AppShell>
  );
}
