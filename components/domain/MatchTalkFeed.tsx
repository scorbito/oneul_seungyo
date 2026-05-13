"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PenLine } from "lucide-react";
import {
  loadMoreMatchPostsAction,
  toggleMatchPostLikeAction
} from "@/lib/actions/matchTalk";
import { useAppState } from "@/lib/state/AppState";
import type { MatchPost } from "@/lib/types/domain";
import { MatchPostCard } from "@/components/domain/MatchPostCard";

const PAGE_SIZE = 20;

type MatchTalkFeedProps = {
  initialPosts: MatchPost[];
  currentUserId: string | null;
  initialGameId?: string;
  onWriteClick: () => void;
};

export function MatchTalkFeed({ initialPosts, currentUserId, initialGameId, onWriteClick }: MatchTalkFeedProps) {
  const { showToast } = useAppState();
  const [feed, setFeed] = useState<MatchPost[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialPosts.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [gameFilter, setGameFilter] = useState<string | undefined>(initialGameId);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filteredPosts = useMemo(() => {
    if (!gameFilter) return feed;
    return feed.filter((p) => p.gameId === gameFilter);
  }, [feed, gameFilter]);

  // 선택된 경기의 컨텍스트 헤더 (스코어/상태/구장)
  const selectedGameContext = useMemo(() => {
    if (!gameFilter) return null;
    const sample = feed.find((p) => p.gameId === gameFilter);
    return sample?.game ?? null;
  }, [feed, gameFilter]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;
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
      loadMoreMatchPostsAction(last.createdAt, PAGE_SIZE)
        .then((more) => {
          setFeed((current) => {
            const seen = new Set(current.map((p) => p.id));
            const next = [...current];
            for (const p of more) if (!seen.has(p.id)) next.push(p);
            return next;
          });
          if (more.length < PAGE_SIZE) setHasMore(false);
        })
        .catch(() => setHasMore(false))
        .finally(() => setLoadingMore(false));
    }, { rootMargin: "200px 0px" });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, feed]);

  const handleToggleLike = async (postId: string) => {
    if (!currentUserId) {
      showToast("로그인 후 좋아요를 누를 수 있어요.");
      return;
    }
    // 낙관 업데이트
    setFeed((current) =>
      current.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
    try {
      const result = await toggleMatchPostLikeAction(postId);
      // 서버 카운트로 보정
      setFeed((current) =>
        current.map((p) => (p.id === postId ? { ...p, likedByMe: result.liked, likeCount: result.count } : p))
      );
    } catch (err) {
      // 롤백
      setFeed((current) =>
        current.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likedByMe ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        )
      );
      showToast(err instanceof Error ? err.message : "좋아요 실패");
    }
  };

  return (
    <>
      <div className="community-head">
        <div className="filter-chips">
          <span className="chip chip-active" aria-pressed>경기톡</span>
          {gameFilter ? (
            <button
              type="button"
              className="chip"
              onClick={() => setGameFilter(undefined)}
              aria-label="경기 필터 해제"
            >
              필터 해제
            </button>
          ) : null}
        </div>
        <button className="community-write-button" type="button" onClick={onWriteClick}>
          <PenLine size={16} />
          글쓰기
        </button>
      </div>

      {selectedGameContext ? (
        <div className="match-talk-context-header">
          <strong>{selectedGameContext.date}</strong>
          <span> · </span>
          <span>{selectedGameContext.stadium || "구장 미정"}</span>
          <span> · </span>
          <span>{selectedGameContext.homeTeamId} vs {selectedGameContext.awayTeamId}</span>
        </div>
      ) : null}

      <div className="review-feed">
        {filteredPosts.map((post) => (
          <MatchPostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onToggleLike={() => handleToggleLike(post.id)}
            onClickGameFilter={() => setGameFilter(post.gameId)}
          />
        ))}
        {filteredPosts.length === 0 ? (
          <p className="empty-inline">
            {gameFilter ? "이 경기의 글이 아직 없어요. 첫 글을 남겨보세요!" : "아직 경기톡이 없어요. 첫 글을 남겨보세요!"}
          </p>
        ) : null}
        {hasMore ? (
          <div ref={sentinelRef} className="feed-sentinel" aria-hidden="true">
            {loadingMore ? <span className="feed-loading">불러오는 중...</span> : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
