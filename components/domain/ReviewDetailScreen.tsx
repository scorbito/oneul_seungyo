"use client";

import Image from "next/image";
import { ArrowLeft, Bookmark, Heart, Send } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { useAppState } from "@/lib/state/AppState";

type ReviewDetailScreenProps = {
  id: string;
};

export function ReviewDetailScreen({ id }: ReviewDetailScreenProps) {
  const { reviews, likedReviewIds, savedReviewIds, toggleLike, toggleSave, showToast } = useAppState();
  const review = reviews.find((item) => item.id === id);

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

  return (
    <AppShell activeTab="community" title="후기 상세">
      <div className="detail-topbar">
        <a href="/community" aria-label="뒤로가기"><ArrowLeft size={20} /></a>
        <span>{review.author}</span>
        <button className="icon-button" aria-label="공유"><Send size={17} /></button>
      </div>
      <article className="review-detail">
        <Image alt={review.title} className="review-detail-image" height={260} priority src={review.image} width={360} />
        <div className="review-detail-meta">
          <TeamBadge teamId={review.teamId} size="md" />
          <span>{review.gameLabel}</span>
        </div>
        <h1>{review.title}</h1>
        <p>{review.body} 응원석의 열기와 경기장 분위기까지 오래 남을 직관이었습니다.</p>
        <div className="review-tags">
          {review.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
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
    </AppShell>
  );
}
