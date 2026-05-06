"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/common/Button";
import { ModalShell } from "@/components/common/ModalShell";
import { ReviewCard } from "@/components/domain/ReviewCard";
import { deleteReviewAction } from "@/lib/actions/review";
import { useAppState } from "@/lib/state/AppState";
import type { Review } from "@/lib/types/domain";

type MyReviewsScreenProps = {
  dbReviews?: Review[];
};

export function MyReviewsScreen({ dbReviews = [] }: MyReviewsScreenProps) {
  const { reviews, likedReviewIds, savedReviewIds, toggleLike, toggleSave, deleteReview, showToast } = useAppState();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const sourceReviews = dbReviews.length > 0 ? dbReviews : reviews;
  const myReviews = dbReviews.length > 0 ? dbReviews : sourceReviews;
  const deleteTarget = deleteTargetId ? myReviews.find((item) => item.id === deleteTargetId) : null;

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    startTransition(async () => {
      try {
        await deleteReviewAction(id);
        deleteReview(id);
        setDeleteTargetId(null);
        router.refresh();
      } catch (err) {
        showToast(err instanceof Error ? err.message : "후기 삭제에 실패했어요.");
      }
    });
  };

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
            <button className="inline-delete owned-delete" type="button" onClick={() => setDeleteTargetId(review.id)}>
              <Trash2 size={14} /> 삭제
            </button>
          </div>
        ))}
        {myReviews.length === 0 ? <p className="empty-inline">작성한 후기가 아직 없어요.</p> : null}
      </div>
      <ModalShell open={Boolean(deleteTarget)} title="후기 삭제" onClose={() => setDeleteTargetId(null)}>
        <div className="confirm-stack">
          <p>
            {deleteTarget ? `"${deleteTarget.body.slice(0, 30)}${deleteTarget.body.length > 30 ? "..." : ""}"` : ""}
            <br />이 후기를 삭제할까요?
          </p>
          <span className="confirm-hint">삭제 후엔 되돌릴 수 없어요. 등록한 사진도 함께 삭제됩니다.</span>
          <div className="confirm-actions">
            <button type="button" className="confirm-cancel" disabled={isPending} onClick={() => setDeleteTargetId(null)}>취소</button>
            <Button disabled={isPending} onClick={confirmDelete}>{isPending ? "삭제 중" : "삭제하기"}</Button>
          </div>
        </div>
      </ModalShell>
    </AppShell>
  );
}
