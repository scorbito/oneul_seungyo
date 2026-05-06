"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, PenSquare, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/common/Button";
import { ModalShell } from "@/components/common/ModalShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { AppModals, type ModalKind } from "@/components/domain/AppModals";
import { getTeam } from "@/lib/constants/teams";
import { useAppState } from "@/lib/state/AppState";

export function MyAttendancesScreen() {
  const { attendances, reviews, deleteAttendance } = useAppState();
  const [filter, setFilter] = useState("전체");
  const [modal, setModal] = useState<ModalKind>(null);
  const [reviewTargetId, setReviewTargetId] = useState<string | undefined>();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const deleteTarget = deleteTargetId ? attendances.find((item) => item.id === deleteTargetId) : null;
  const filtered = attendances.filter((item) => {
    if (filter === "인증") return item.verified;
    if (filter === "미인증") return !item.verified;
    return true;
  });
  const reviewByAttendanceId = new Map(
    reviews.filter((review) => review.attendanceId).map((review) => [review.attendanceId as string, review])
  );

  const openReviewModal = (attendanceId: string) => {
    setReviewTargetId(attendanceId);
    setModal("review");
  };

  return (
    <AppShell activeTab="my" title="내 직관 리스트">
      <a className="back-link" href="/my"><ArrowLeft size={18} /> 마이로 돌아가기</a>
      <div className="segmented-control">
        {["전체", "인증", "미인증"].map((item) => (
          <button className={filter === item ? "segment segment-active" : "segment"} key={item} type="button" onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>
      <section className="attendance-list">
        {filtered.map((item) => {
          const home = getTeam(item.homeTeamId);
          const away = getTeam(item.awayTeamId);
          const hasReview = reviewByAttendanceId.has(item.id);
          const isReviewable = Boolean(item.result);
          return (
            <article className="attendance-item" key={item.id}>
              <span>
                {item.date} ({item.stadium})
                <em className={item.verified ? "status-verified" : "status-muted"}>{item.verified ? "인증" : "미인증"}</em>
              </span>
              <div>
                <TeamBadge teamId={item.homeTeamId} size="sm" />
                <strong>{home.shortName}</strong>
                <b>{item.score}</b>
                <strong>{away.shortName}</strong>
                <TeamBadge teamId={item.awayTeamId} size="sm" />
              </div>
              {isReviewable ? (
                <div className="attendance-actions">
                  {hasReview ? (
                    <a className="review-action review-action-done" href="/my/reviews">
                      <CheckCircle2 size={14} />작성 완료
                    </a>
                  ) : (
                    <button className="review-action review-action-write" type="button" onClick={() => openReviewModal(item.id)}>
                      <PenSquare size={14} />후기 작성
                    </button>
                  )}
                </div>
              ) : null}
              <button className="inline-delete" type="button" aria-label="삭제" onClick={() => setDeleteTargetId(item.id)}>
                <Trash2 size={15} />
              </button>
            </article>
          );
        })}
        {filtered.length === 0 ? <p className="empty-inline">표시할 직관 기록이 없어요.</p> : null}
      </section>
      <AppModals open={modal} setOpen={setModal} initialAttendanceId={reviewTargetId} />
      <ModalShell open={Boolean(deleteTarget)} title="직관 기록 삭제" onClose={() => setDeleteTargetId(null)}>
        <div className="confirm-stack">
          <p>
            {deleteTarget ? `${deleteTarget.date} ${getTeam(deleteTarget.homeTeamId).shortName} vs ${getTeam(deleteTarget.awayTeamId).shortName}` : ""}
            <br />이 직관 기록을 삭제할까요?
          </p>
          <span className="confirm-hint">연결된 후기가 있다면 함께 정리해주세요.</span>
          <div className="confirm-actions">
            <button type="button" className="confirm-cancel" onClick={() => setDeleteTargetId(null)}>취소</button>
            <Button onClick={() => {
              if (deleteTargetId) {
                deleteAttendance(deleteTargetId);
              }
              setDeleteTargetId(null);
            }}>삭제하기</Button>
          </div>
        </div>
      </ModalShell>
    </AppShell>
  );
}
