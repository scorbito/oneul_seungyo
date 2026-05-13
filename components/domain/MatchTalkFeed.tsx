"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PenLine } from "lucide-react";
import {
  getGameContextAction,
  getMatchPostByIdAction,
  listMatchPostsAction,
  loadMoreMatchPostsAction,
  toggleMatchPostLikeAction,
  type GameContextInfo
} from "@/lib/actions/matchTalk";
import { useAppState } from "@/lib/state/AppState";
import { getTeam } from "@/lib/constants/teams";
import { getThisWeekRangeKst } from "@/lib/utils/matchTalkWeek";
import type { MatchPost } from "@/lib/types/domain";
import { MatchPostCard } from "@/components/domain/MatchPostCard";
import { MatchTalkComposerModal } from "@/components/domain/modals/MatchTalkComposerModal";

const PAGE_SIZE = 20;

type MatchTalkFeedProps = {
  initialPosts: MatchPost[];
  currentUserId: string | null;
  initialGameId?: string;
};

export function MatchTalkFeed({ initialPosts, currentUserId, initialGameId }: MatchTalkFeedProps) {
  const { showToast } = useAppState();
  const [feed, setFeed] = useState<MatchPost[]>(initialPosts);
  const [hasMore, setHasMore] = useState(initialPosts.length === PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [gameFilter, setGameFilter] = useState<string | undefined>(initialGameId);
  const [composerOpen, setComposerOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // 초기 렌더 시 SSR이 이미 initialGameId에 맞춰 가져온 결과를 쓰므로
  // gameFilter 변경 효과는 두 번째 변화부터 fetch한다.
  const skipFirstFilterFetchRef = useRef(true);

  // feed 자체가 이미 현재 필터(gameFilter)에 맞춰 서버에서 조회한 결과이므로
  // 별도 클라이언트 필터링은 하지 않는다.
  const filteredPosts = feed;

  // 1차: 필터된 경기에 글이 있다면 첫 글의 game 정보를 컨텍스트로 사용
  const contextFromFeed = useMemo(() => {
    if (!gameFilter) return null;
    const sample = feed.find((p) => p.gameId === gameFilter);
    return sample?.game ?? null;
  }, [feed, gameFilter]);

  // 2차: 글이 한 건도 없을 때를 위한 보조 fetch
  const [fallbackContext, setFallbackContext] = useState<GameContextInfo | null>(null);
  useEffect(() => {
    // 필터 없거나 feed에 이미 글이 있으면 별도 조회 불필요
    if (!gameFilter || contextFromFeed) {
      setFallbackContext(null);
      return;
    }
    let cancelled = false;
    getGameContextAction(gameFilter)
      .then((info) => {
        if (cancelled) return;
        setFallbackContext(info);
      })
      .catch(() => {
        if (cancelled) return;
        setFallbackContext(null);
      });
    return () => {
      cancelled = true;
    };
  }, [gameFilter, contextFromFeed]);

  // 표시용 컨텍스트 — feed에 있는 정보가 우선, 없으면 fallback
  const selectedGameContext = useMemo(() => {
    if (contextFromFeed) return contextFromFeed;
    if (!fallbackContext) return null;
    return {
      date: fallbackContext.date,
      homeTeamId: fallbackContext.homeTeamId,
      awayTeamId: fallbackContext.awayTeamId,
      stadium: fallbackContext.stadium,
      currentStatus: fallbackContext.status
    };
  }, [contextFromFeed, fallbackContext]);

  // 필터된 경기가 이번 주(작성 가능 기간) 안에 있는지 판단
  const filteredGameDate = contextFromFeed?.date ?? fallbackContext?.date ?? null;
  const isFilteredGameWritable = useMemo(() => {
    if (!filteredGameDate) return true; // 정보 모를 땐 보수적으로 작성 가능하다고 두고 모달에서 검증
    const { from, to } = getThisWeekRangeKst();
    return filteredGameDate >= from && filteredGameDate <= to;
  }, [filteredGameDate]);

  // gameFilter 변경 시 서버에서 그 필터에 맞는 첫 페이지를 새로 받는다.
  // 첫 렌더는 SSR 결과(initialPosts)를 그대로 쓰므로 skip.
  useEffect(() => {
    if (skipFirstFilterFetchRef.current) {
      skipFirstFilterFetchRef.current = false;
      return;
    }
    let cancelled = false;
    listMatchPostsAction({ limit: PAGE_SIZE, gameId: gameFilter })
      .then((list) => {
        if (cancelled) return;
        setFeed(list);
        setHasMore(list.length === PAGE_SIZE);
      })
      .catch(() => {
        if (cancelled) return;
        // 실패 시 기존 feed 유지
      });
    return () => {
      cancelled = true;
    };
  }, [gameFilter]);

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
      // 무한 스크롤 추가 fetch도 현재 필터를 동일하게 적용해 일관성을 유지한다.
      loadMoreMatchPostsAction(last.createdAt, PAGE_SIZE, gameFilter)
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
  }, [hasMore, loadingMore, feed, gameFilter]);

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

  const handlePostCreated = async (newPostId: string) => {
    // 작성된 글의 풀 정보(박제값·작성자·집계 포함)를 한 번만 더 조회해 상단에 prepend.
    // router.refresh()를 쓰지 않는 이유: 무한스크롤로 누적된 feed가 SSR 첫 페이지로 잘릴 수 있음.
    try {
      const fresh = await getMatchPostByIdAction(newPostId);
      if (!fresh) return;
      // 현재 필터와 다른 경기에 글을 썼다면 화면(feed)에는 추가하지 않는다.
      // feed는 현재 필터 상태의 결과 집합이므로 일관성 유지.
      if (gameFilter && fresh.gameId !== gameFilter) return;
      setFeed((current) => {
        if (current.some((p) => p.id === fresh.id)) return current;
        return [fresh, ...current];
      });
    } catch {
      // 조회 실패는 조용히 무시 — 사용자가 새로고침하면 자연스럽게 보인다.
    }
  };

  const handlePostDeleted = (postId: string) => {
    setFeed((current) => current.filter((p) => p.id !== postId));
  };

  const handleWriteClick = () => {
    if (!currentUserId) {
      showToast("로그인 후 글을 작성할 수 있어요.");
      return;
    }
    setComposerOpen(true);
  };

  return (
    <>
      <div className="community-head">
        <div className="filter-chips">
          {gameFilter ? (
            <button
              type="button"
              className="chip"
              onClick={() => setGameFilter(undefined)}
              aria-label="경기 필터 해제"
            >
              필터 해제
            </button>
          ) : (
            <div className="match-talk-intro">
              <p className="match-talk-intro-title">경기에 대해 자유롭게 글을 작성하세요</p>
              <p className="match-talk-filter-hint">날짜·경기를 누르면 모아볼 수 있어요</p>
            </div>
          )}
        </div>
        <button className="community-write-button" type="button" onClick={handleWriteClick}>
          <PenLine size={16} />
          글쓰기
        </button>
      </div>

      {selectedGameContext ? (() => {
        const homeName = selectedGameContext.homeTeamId
          ? getTeam(selectedGameContext.homeTeamId).shortName
          : selectedGameContext.homeTeamId;
        const awayName = selectedGameContext.awayTeamId
          ? getTeam(selectedGameContext.awayTeamId).shortName
          : selectedGameContext.awayTeamId;
        return (
          <div className="match-talk-context-header">
            <strong>{selectedGameContext.date}</strong>
            <span> · </span>
            <span>{selectedGameContext.stadium || "구장 미정"}</span>
            <span> · </span>
            <span>{awayName} vs {homeName}</span>
          </div>
        );
      })() : null}

      <div className="review-feed">
        {filteredPosts.map((post) => (
          <MatchPostCard
            key={post.id}
            post={post}
            currentUserId={currentUserId}
            onToggleLike={() => handleToggleLike(post.id)}
            onClickGameFilter={() => setGameFilter(post.gameId)}
            onDeleted={handlePostDeleted}
          />
        ))}
        {filteredPosts.length === 0 ? (
          <p className="empty-inline">
            {gameFilter
              ? isFilteredGameWritable
                ? "이 경기의 글이 아직 없어요. 첫 글을 남겨보세요!"
                : "지난 경기는 새 글을 받지 못해요. 글 작성은 이번 주 경기만 가능합니다."
              : "아직 경기톡이 없어요. 첫 글을 남겨보세요!"}
          </p>
        ) : null}
        {hasMore ? (
          <div ref={sentinelRef} className="feed-sentinel" aria-hidden="true">
            {loadingMore ? <span className="feed-loading">불러오는 중...</span> : null}
          </div>
        ) : null}
      </div>

      <MatchTalkComposerModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreated={handlePostCreated}
        initialGameId={gameFilter}
      />
    </>
  );
}
