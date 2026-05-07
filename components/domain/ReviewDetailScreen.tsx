"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, ChevronLeft, ChevronRight, Heart, MoreHorizontal, PenSquare, Send, Trash2 } from "lucide-react";
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

  if (!review) {
    return (
      <AppShell activeTab="community" title="후기 상세" theme="dark">
        <div className="detail-topbar">
          <a href="/community" aria-label="뒤로가기"><ArrowLeft size={20} /></a>
          <span>후기 상세</span>
          <span />
        </div>
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
    <AppShell activeTab="community" title="후기 상세" theme="dark">
      <div className="detail-topbar">
        <a href="/community" aria-label="뒤로가기"><ArrowLeft size={20} /></a>
        <div className="detail-topbar-author">
          {review.authorAvatarUrl ? (
            <span className="detail-topbar-avatar">
              <Image alt="" src={review.authorAvatarUrl} fill sizes="26px" style={{ objectFit: "cover" }} />
            </span>
          ) : (
            <span className="detail-topbar-avatar detail-topbar-avatar-initial">
              {(review.author || "?").slice(0, 1)}
            </span>
          )}
          <strong>{review.author}</strong>
        </div>
        {isReviewOwner ? (
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
        ) : (
          <span />
        )}
      </div>
      <article className="review-detail">
        {(() => {
          const imgs = review.images && review.images.length > 0 ? review.images : [review.image];
          const safeIdx = Math.min(imageIndex, imgs.length - 1);
          const hasPrev = safeIdx > 0;
          const hasNext = safeIdx < imgs.length - 1;
          return (
            <div className="review-detail-carousel">
              <Image alt={review.title || "후기 사진"} className="review-detail-image" height={260} priority src={imgs[safeIdx]} width={360} />
              {imgs.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="이전 사진"
                    className="review-detail-arrow review-detail-arrow-left"
                    disabled={!hasPrev}
                    onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="다음 사진"
                    className="review-detail-arrow review-detail-arrow-right"
                    disabled={!hasNext}
                    onClick={() => setImageIndex((i) => Math.min(imgs.length - 1, i + 1))}
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
        {review.title ? <h1>{review.title}</h1> : null}
        <p>{review.body}</p>
        {/* 해시태그 칩은 MVP에서 숨김 */}
        <div className="review-detail-actions">
          <button type="button" onClick={() => toggleLike(review.id)} style={liked ? { color: "#e11d48" } : undefined}>
            <Heart fill={liked ? "currentColor" : "none"} size={18} /> {review.likes + (liked ? 1 : 0)}
          </button>
          <button type="button" onClick={() => showToast("공유 준비가 완료됐어요.")}><Send size={18} /> 공유</button>
          <button type="button" onClick={() => toggleSave(review.id)} style={saved ? { color: "#2563eb" } : undefined}>
            <Bookmark fill={saved ? "currentColor" : "none"} size={18} /> 저장
          </button>
        </div>
      </article>

      <section className="comments-section">
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
