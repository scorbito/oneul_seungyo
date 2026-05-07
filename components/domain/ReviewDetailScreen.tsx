"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Heart, Send, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { createCommentAction, deleteCommentAction } from "@/lib/actions/comment";
import { useAppState } from "@/lib/state/AppState";
import type { Review, ReviewComment } from "@/lib/types/domain";

type ReviewDetailScreenProps = {
  id: string;
  dbReview?: Review | null;
  initialComments?: ReviewComment[];
  currentUserId?: string | null;
};

export function ReviewDetailScreen({ id, dbReview, initialComments = [], currentUserId = null }: ReviewDetailScreenProps) {
  const { reviews, likedReviewIds, savedReviewIds, toggleLike, toggleSave, showToast } = useAppState();
  const router = useRouter();
  const [comments, setComments] = useState<ReviewComment[]>(initialComments);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const review = dbReview ?? reviews.find((item) => item.id === id);

  const isReviewOwner = Boolean(currentUserId && review?.ownerId && currentUserId === review.ownerId);

  if (!review) {
    return (
      <AppShell activeTab="community" title="후기 상세">
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
            authorNickname: "나",
            authorTeamId: review.teamId,
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

  return (
    <AppShell activeTab="community" title="후기 상세">
      <div className="detail-topbar">
        <a href="/community" aria-label="뒤로가기"><ArrowLeft size={20} /></a>
        <span>{review.author}</span>
        <button className="icon-button" aria-label="공유"><Send size={17} /></button>
      </div>
      <article className="review-detail">
        <Image alt={review.title || "후기 사진"} className="review-detail-image" height={260} priority src={review.image} width={360} />
        <div className="review-detail-meta">
          <TeamBadge teamId={review.teamId} size="md" />
          <span>{review.gameLabel}</span>
        </div>
        {review.title ? <h1>{review.title}</h1> : null}
        <p>{review.body}</p>
        {review.tags.length > 0 && (
          <div className="review-tags">
            {review.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        )}
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
                  <TeamBadge teamId={c.authorTeamId} size="sm" />
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
    </AppShell>
  );
}
