"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, Check, PenLine } from "lucide-react";
import { AppModals, type ModalKind } from "@/components/domain/AppModals";
import { AppShell } from "@/components/layout/AppShell";
import { ReviewCard } from "@/components/domain/ReviewCard";
import { loadMoreReviewsAction } from "@/lib/actions/review";
import { useAppState } from "@/lib/state/AppState";
import type { Review } from "@/lib/types/domain";

type FeedFilter = "all" | "myTeam" | "friends";
type SortMode = "createdAt" | "gameDate";

const filters: { id: FeedFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "myTeam", label: "내팀" },
  { id: "friends", label: "친구" }
];

const sortOptions: { id: SortMode; label: string }[] = [
  { id: "createdAt", label: "작성 날짜순" },
  { id: "gameDate", label: "경기 날짜순" }
];

const PAGE_SIZE = 20;

type CommunityScreenProps = {
  dbReviews?: Review[];
  friendIds?: string[];
};

export function CommunityScreen({ dbReviews = [], friendIds = [] }: CommunityScreenProps) {
  const { reviews: localReviews, profile, likedReviewIds, savedReviewIds, toggleLike, toggleSave } = useAppState();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("createdAt");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);

  // dbReviews가 있으면 DB 모드(무한 스크롤). 없으면 mock 모드.
  const isDbMode = dbReviews.length > 0;
  const [feed, setFeed] = useState<Review[]>(dbReviews);
  const [hasMore, setHasMore] = useState(isDbMode && dbReviews.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const sourceReviews = isDbMode ? feed : localReviews;

  const friendIdSet = useMemo(() => new Set(friendIds), [friendIds]);

  const filteredReviews = useMemo(() => {
    let list: Review[];
    if (activeFilter === "myTeam") {
      list = sourceReviews.filter((review) => review.teamId === profile.mainTeamId);
    } else if (activeFilter === "friends") {
      // 실제 친구 목록의 user_id 와 review.ownerId 를 매칭. ownerId 없는 mock 데이터는 제외.
      list = sourceReviews.filter((review) => Boolean(review.ownerId) && friendIdSet.has(review.ownerId!));
    } else {
      list = sourceReviews;
    }
    if (sortMode === "gameDate") {
      // 경기 날짜순(최신 경기부터). 경기 정보가 없으면 뒤로 보냄.
      return [...list].sort((a, b) => {
        const da = a.game?.date ?? "";
        const db = b.game?.date ?? "";
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return db.localeCompare(da);
      });
    }
    // 기본: 서버에서 작성 날짜 내림차순으로 받아오므로 그대로 사용
    return list;
  }, [activeFilter, sourceReviews, profile.mainTeamId, sortMode, friendIdSet]);

  useEffect(() => {
    if (!sortMenuOpen) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest(".community-sort")) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortMenuOpen]);

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
          <div className="community-sort">
            <button
              aria-label="정렬 방식 선택"
              aria-haspopup="menu"
              aria-expanded={sortMenuOpen}
              className="community-sort-button"
              onClick={() => setSortMenuOpen((open) => !open)}
              type="button"
            >
              <ArrowUpDown size={16} />
            </button>
            {sortMenuOpen ? (
              <div className="community-sort-menu" role="menu">
                {sortOptions.map((option) => {
                  const active = sortMode === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={active}
                      className={active ? "community-sort-item community-sort-item-active" : "community-sort-item"}
                      onClick={() => {
                        setSortMode(option.id);
                        setSortMenuOpen(false);
                      }}
                    >
                      <span>{option.label}</span>
                      {active ? <Check size={14} strokeWidth={3} /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
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
            {activeFilter === "friends"
              ? friendIds.length === 0
                ? "아직 친구가 없어요. 마이 → 친구 관리에서 친구를 추가해보세요."
                : "친구가 작성한 후기가 아직 없어요."
              : "표시할 후기가 없어요."}
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
