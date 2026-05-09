"use client";

import { useEffect, useRef, useState, useTransition, type PointerEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronLeft, ChevronRight, Heart, MoreHorizontal, PenSquare, Send, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/common/Button";
import { ModalShell } from "@/components/common/ModalShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { AppModals, type ModalKind } from "@/components/domain/AppModals";
import { createCommentAction, deleteCommentAction } from "@/lib/actions/comment";
import { deleteReviewAction } from "@/lib/actions/review";
import { getTeam } from "@/lib/constants/teams";
import { useAppState } from "@/lib/state/AppState";
import type { Review, ReviewComment } from "@/lib/types/domain";

type ReviewDetailScreenProps = {
  id: string;
  dbReview?: Review | null;
  initialComments?: ReviewComment[];
  currentUserId?: string | null;
};

export function ReviewDetailScreen({ id, dbReview, initialComments = [], currentUserId = null }: ReviewDetailScreenProps) {
  const { reviews, profile, likedReviewIds, savedReviewIds, toggleLike, toggleSave, showToast } = useAppState();
  const router = useRouter();
  const [comments, setComments] = useState<ReviewComment[]>(initialComments);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [imageIndex, setImageIndex] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState<ModalKind>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const carouselDragStartRef = useRef<{ x: number; y: number } | null>(null);
  const commentsSectionRef = useRef<HTMLElement | null>(null);
  const review = dbReview ?? reviews.find((item) => item.id === id);

  const isReviewOwner = Boolean(currentUserId && review?.ownerId && currentUserId === review.ownerId);

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest(".detail-more")) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  // URL 해시가 #comments 인 경우 댓글 섹션으로 스크롤.
  // .app-scroll 이 자체 스크롤 컨테이너라 브라우저 기본 해시 스크롤이 불안정하므로
  // scrollIntoView 를 직접 호출. 이미지 로딩 후 레이아웃이 변하는 경우를 대비해 두 번 호출.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#comments") return;
    const scrollToComments = () => {
      commentsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const t1 = window.setTimeout(scrollToComments, 50);
    const t2 = window.setTimeout(scrollToComments, 500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (!review) {
    return (
      <AppShell activeTab="community" title="후기 상세" theme="dark" backHref="/community">
        <section className="not-found-panel">
          <h1>후기를 찾을 수 없어요</h1>
          <p>커뮤니티 피드에서 다시 후기를 선택해주세요.</p>
          <a href="/community">커뮤니티로 돌아가기</a>
        </section>
      </AppShell>
    );
  }

  const liked = likedReviewIds.includes(review.id);
  const saved = savedReviewIds.includes(review.id);
  const detailDate = review.game?.date ?? review.gameLabel.split(" · ")[0] ?? "";
  const detailStadium = review.game?.stadium ?? "";
  const detailTeam = review.game?.supportTeamId ? getTeam(review.game.supportTeamId).shortName : "";
  const detailVenueSide = review.game?.supportTeamId && review.game?.homeTeamId
    ? review.game.supportTeamId === review.game.homeTeamId ? "홈경기" : "원정경기"
    : "";
  const detailGameType = detailTeam && detailVenueSide ? `${detailTeam} ${detailVenueSide}` : "";
  const detailMeta = `${[detailDate, detailGameType].filter(Boolean).join(" ")}${detailStadium ? `(${detailStadium})` : ""}`;

  const submitComment = () => {
    const body = input.trim();
    if (!body) {
      showToast("댓글을 입력해주세요.");
      return;
    }
    if (!currentUserId) {
      showToast("로그인이 필요합니다.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await createCommentAction({ reviewId: review.id, body });
        // 낙관적으로 추가 (refresh 시 서버 데이터로 교체됨)
        setComments((current) => [
          ...current,
          {
            id: result.id,
            reviewId: review.id,
            userId: currentUserId,
            authorNickname: profile.nickname || "나",
            authorTeamId: profile.mainTeamId,
            authorAvatarUrl: profile.avatarUrl ?? null,
            body,
            createdAt: new Date().toISOString(),
            timeAgo: "방금 전"
          }
        ]);
        setInput("");
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "댓글 등록 실패");
      }
    });
  };

  const handleDelete = (commentId: string) => {
    startTransition(async () => {
      try {
        await deleteCommentAction(commentId);
        setComments((current) => current.filter((c) => c.id !== commentId));
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "댓글 삭제 실패");
      }
    });
  };

  const confirmDeleteReview = async () => {
    if (!review) return;
    setIsDeleting(true);
    try {
      await deleteReviewAction(review.id);
      setDeleteConfirmOpen(false);
      router.push("/community");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "후기 삭제에 실패했어요.");
      setIsDeleting(false);
    }
  };

  return (
    <AppShell activeTab="community" title="후기 상세" theme="dark" backHref="/community">
      <div className="detail-topbar">
        <span className="detail-topbar-date">
          {review.game?.supportTeamId ? <TeamBadge teamId={review.game.supportTeamId} size="sm" /> : null}
          <span>{detailMeta}</span>
        </span>
        {isReviewOwner ? (
          <div className="detail-topbar-right">
            <div className="detail-more">
              <button
                type="button"
                className="icon-button"
                aria-label="더보기"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((open) => !open)}
              >
                <MoreHorizontal size={20} />
              </button>
              {moreOpen ? (
                <div className="detail-more-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setMoreOpen(false); setAppModalOpen("review"); }}
                  >
                    <PenSquare size={14} /> 수정
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="detail-more-danger"
                    onClick={() => { setMoreOpen(false); setDeleteConfirmOpen(true); }}
                  >
                    <Trash2 size={14} /> 삭제
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="detail-topbar-right" />
        )}
      </div>
      <article className="review-detail">
        {(() => {
          const imgs = review.images && review.images.length > 0 ? review.images : [review.image];
          const safeIdx = Math.min(imageIndex, imgs.length - 1);
          const hasPrev = safeIdx > 0;
          const hasNext = safeIdx < imgs.length - 1;
          const goPrev = () => setImageIndex((i) => Math.max(0, i - 1));
          const goNext = () => setImageIndex((i) => Math.min(imgs.length - 1, i + 1));
          const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
            if (imgs.length <= 1) return;
            if ((event.target as HTMLElement | null)?.closest("button")) return;
            carouselDragStartRef.current = { x: event.clientX, y: event.clientY };
          };
          const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
            const start = carouselDragStartRef.current;
            carouselDragStartRef.current = null;
            if (!start || imgs.length <= 1) return;

            const diffX = event.clientX - start.x;
            const diffY = event.clientY - start.y;
            const absX = Math.abs(diffX);
            const absY = Math.abs(diffY);

            if (absX < 45 || absX < absY * 1.2) return;
            if (diffX < 0) {
              goNext();
            } else {
              goPrev();
            }
          };

          return (
            <div
              className="review-detail-carousel"
              onPointerCancel={() => { carouselDragStartRef.current = null; }}
              onPointerDown={handlePointerDown}
              onPointerLeave={() => { carouselDragStartRef.current = null; }}
              onPointerUp={handlePointerUp}
            >
              <div
                className="review-detail-track"
                style={{ transform: `translateX(-${safeIdx * 100}%)` }}
              >
                {imgs.map((src, i) => (
                  <div className="review-detail-slide" key={`${src}-${i}`}>
                    <Image
                      alt={review.title || "후기 사진"}
                      className="review-detail-image"
                      draggable={false}
                      height={260}
                      priority={i === 0}
                      src={src}
                      width={360}
                    />
                  </div>
                ))}
              </div>
              {imgs.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="이전 사진"
                    className="review-detail-arrow review-detail-arrow-left"
                    disabled={!hasPrev}
                    onClick={goPrev}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="다음 사진"
                    className="review-detail-arrow review-detail-arrow-right"
                    disabled={!hasNext}
                    onClick={goNext}
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="review-detail-counter">{safeIdx + 1}/{imgs.length}</span>
                  <div className="review-detail-dots" aria-hidden="true">
                    {imgs.map((_, i) => (
                      <span key={i} className={i === safeIdx ? "review-detail-dot review-detail-dot-active" : "review-detail-dot"} />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          );
        })()}
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
              <div className="review-game-meta-match">
                <span className="review-game-meta-side review-game-meta-side-home">
                  <TeamBadge teamId={review.game.homeTeamId} size="sm" />
                  <strong>{home.shortName}</strong>
                </span>
                <b>{score}</b>
                <span className="review-game-meta-side review-game-meta-side-away">
                  <strong>{away.shortName}</strong>
                  <TeamBadge teamId={review.game.awayTeamId} size="sm" />
                </span>
              </div>
              {resultLabel ? (
                <span className={`review-game-meta-result review-game-meta-result-${result}`}>{resultLabel}</span>
              ) : null}
            </div>
          );
        })() : null}
        <div className="review-detail-author">
          {review.authorAvatarUrl ? (
            <span className="review-detail-author-avatar">
              <Image alt="" src={review.authorAvatarUrl} fill sizes="34px" style={{ objectFit: "cover" }} />
            </span>
          ) : (
            <span className="review-detail-author-avatar review-detail-author-avatar-initial">
              {(review.author || "?").slice(0, 1)}
            </span>
          )}
          <strong>{review.author}</strong>
        </div>
        {review.title ? <h1>{review.title}</h1> : null}
        <p>{review.body}</p>
        {/* 해시태그 칩은 MVP에서 숨김 */}
        <div className="review-detail-actions">
          <button type="button" onClick={() => toggleLike(review.id)} style={liked ? { color: "#e11d48" } : undefined}>
            <Heart fill={liked ? "currentColor" : "none"} size={18} /> {review.likes}
          </button>
          <button type="button" onClick={() => showToast("공유 준비가 완료됐어요.")}><Send size={18} /> 공유</button>
          <button type="button" onClick={() => toggleSave(review.id)} style={saved ? { color: "#2563eb" } : undefined}>
            <Bookmark fill={saved ? "currentColor" : "none"} size={18} /> 저장
          </button>
        </div>
      </article>

      <section ref={commentsSectionRef} id="comments" className="comments-section">
        <h2 className="comments-heading">댓글 ({comments.length})</h2>
        <ul className="comments-list">
          {comments.length === 0 ? (
            <li className="comments-empty">첫 댓글을 남겨보세요!</li>
          ) : (
            comments.map((c) => {
              const canDelete = currentUserId && (c.userId === currentUserId || isReviewOwner);
              return (
                <li className="comment-item" key={c.id}>
                  {c.authorAvatarUrl ? (
                    <span className="comment-avatar">
                      <Image alt="" src={c.authorAvatarUrl} fill sizes="26px" style={{ objectFit: "cover" }} />
                    </span>
                  ) : (
                    <span className="comment-avatar comment-avatar-initial">
                      {(c.authorNickname || "?").slice(0, 1)}
                    </span>
                  )}
                  <div className="comment-body">
                    <div className="comment-meta">
                      <strong>{c.authorNickname}</strong>
                      <span>{c.timeAgo}</span>
                    </div>
                    <p>{c.body}</p>
                  </div>
                  {canDelete ? (
                    <button
                      type="button"
                      className="comment-delete"
                      aria-label="댓글 삭제"
                      disabled={isPending}
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>

        {currentUserId ? (
          <div className="comment-input-row">
            <input
              type="text"
              placeholder="댓글을 입력하세요"
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
              disabled={isPending}
            />
            <button type="button" onClick={submitComment} disabled={isPending || !input.trim()}>
              등록
            </button>
          </div>
        ) : (
          <p className="comments-empty">로그인 후 댓글을 작성할 수 있어요.</p>
        )}
      </section>

      <AppModals
        open={appModalOpen}
        setOpen={setAppModalOpen}
        editReview={appModalOpen === "review" ? review : null}
      />

      <ModalShell open={deleteConfirmOpen} title="후기 삭제" onClose={() => setDeleteConfirmOpen(false)} panelClassName="dark-confirm-panel">
        <div className="confirm-stack">
          <p>
            {`"${review.body.slice(0, 30)}${review.body.length > 30 ? "..." : ""}"`}
            <br />이 후기를 삭제할까요?
          </p>
          <span className="confirm-hint">삭제 후엔 되돌릴 수 없어요. 등록한 사진도 함께 삭제됩니다.</span>
          <div className="confirm-actions">
            <button type="button" className="confirm-cancel" disabled={isDeleting} onClick={() => setDeleteConfirmOpen(false)}>취소</button>
            <Button disabled={isDeleting} onClick={confirmDeleteReview}>{isDeleting ? "삭제 중" : "삭제하기"}</Button>
          </div>
        </div>
      </ModalShell>
    </AppShell>
  );
}
