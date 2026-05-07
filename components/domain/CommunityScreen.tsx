"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PenLine } from "lucide-react";
import { AppModals, type ModalKind } from "@/components/domain/AppModals";
import { AppShell } from "@/components/layout/AppShell";
import { ReviewCard } from "@/components/domain/ReviewCard";
import { loadMoreReviewsAction } from "@/lib/actions/review";
import { useAppState } from "@/lib/state/AppState";
import type { Review } from "@/lib/types/domain";

type FeedFilter = "all" | "myTeam" | "friends";

const filters: { id: FeedFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "myTeam", label: "내팀" },
  { id: "friends", label: "친구" }
];

const friendAuthorNames = ["야구광이123", "승요팬", "불꽃직관"];

const PAGE_SIZE = 20;

type CommunityScreenProps = {
  dbReviews?: Review[];
};

export function CommunityScreen({ dbReviews = [] }: CommunityScreenProps) {
  const { reviews: localReviews, profile, likedReviewIds, savedReviewIds, toggleLike, toggleSave } = useAppState();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all");
  const [modal, setModal] = useState<ModalKind>(null);

  // dbReviews가 있으면 DB 모드(무한 스크롤). 없으면 mock 모드.
  const isDbMode = dbReviews.length > 0;
  const [feed, setFeed] = useState<Review[]>(dbReviews);
  const [hasMore, setHasMore] = useState(isDbMode && dbReviews.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const sourceReviews = isDbMode ? feed : localReviews;

  const filteredReviews = useMemo(() => {
    if (activeFilter === "myTeam") {
      return sourceReviews.filter((review) => review.teamId === profile.mainTeamId);
    }
    if (activeFilter === "friends") {
      return sourceReviews.filter((review) => friendAuthorNames.includes(review.author));
    }
    return sourceReviews;
  }, [activeFilter, sourceReviews, profile.mainTeamId]);

  useEffect(() => {
    if (!isDbMode || !hasMore || loadingMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      const last = feed[feed.length - 1];
      if (!last?.createdAt) {
        setHasMore(false);
        return;
      }
      setLoadingMore(true);
      loadMoreReviewsAction(last.createdAt, PAGE_SIZE)
        .then((more) => {
          setFeed((current) => {
            const seen = new Set(current.map((r) => r.id));
            const next = [...current];
            for (const r of more) if (!seen.has(r.id)) next.push(r);
            return next;
          });
          if (more.length < PAGE_SIZE) setHasMore(false);
        })
        .catch(() => setHasMore(false))
        .finally(() => setLoadingMore(false));
    }, { rootMargin: "200px 0px" });

    observer.observe(node);
    return () => observer.disconnect();
  }, [isDbMode, hasMore, loadingMore, feed]);

  return (
    <AppShell activeTab="community" title="커뮤니티" theme="dark">
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
        {isDbMode && hasMore ? (
          <div ref={sentinelRef} className="feed-sentinel" aria-hidden="true">
            {loadingMore ? <span className="feed-loading">불러오는 중...</span> : null}
          </div>
        ) : null}
      </div>
      <AppModals open={modal} setOpen={setModal} />
    </AppShell>
  );
}
