"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, MoreHorizontal, Trash2, Check } from "lucide-react";
import { TeamBadge } from "@/components/common/TeamBadge";
import { ModalShell } from "@/components/common/ModalShell";
import { Button } from "@/components/common/Button";
import { getTeam } from "@/lib/constants/teams";
import { deleteMatchPostAction } from "@/lib/actions/matchTalk";
import { useAppState } from "@/lib/state/AppState";
import type { MatchPost, MatchPostEmotionTag } from "@/lib/types/domain";
import { useRouter } from "next/navigation";

const EMOTION_META: Record<MatchPostEmotionTag, { emoji: string; label: string }> = {
  cheer: { emoji: "🎉", label: "환호" },
  support: { emoji: "📣", label: "응원" },
  anger: { emoji: "😡", label: "분노" },
  anxiety: { emoji: "😰", label: "불안" }
};

type MatchPostCardProps = {
  post: MatchPost;
  currentUserId: string | null;
  onToggleLike: () => void;
  onClickGameFilter?: () => void;
};

export function MatchPostCard({ post, currentUserId, onToggleLike, onClickGameFilter }: MatchPostCardProps) {
  const { showToast } = useAppState();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = Boolean(currentUserId && post.userId === currentUserId);
  const emotion = EMOTION_META[post.emotionTag];

  const homeTeam = post.game.homeTeamId ? getTeam(post.game.homeTeamId) : null;
  const awayTeam = post.game.awayTeamId ? getTeam(post.game.awayTeamId) : null;

  const scoreLabel = (() => {
    if (post.statusAtPost === "scheduled") return "경기 전";
    const home = homeTeam?.shortName ?? post.game.homeTeamId;
    const away = awayTeam?.shortName ?? post.game.awayTeamId;
    const h = post.scoreHomeAtPost ?? "-";
    const a = post.scoreAwayAtPost ?? "-";
    const statusSuffix =
      post.statusAtPost === "in_progress" ? " · 진행 중"
      : post.statusAtPost === "finished" ? " (최종)"
      : "";
    return `${home} ${h} : ${a} ${away}${statusSuffix}`;
  })();

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteMatchPostAction(post.id);
      setConfirmOpen(false);
      showToast("삭제되었어요.");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "삭제 실패");
      setDeleting(false);
    }
  };

  return (
    <article className="match-post-card">
      <header className="match-post-header">
        <div className="match-post-author">
          {post.authorAvatarUrl ? (
            <span className="match-post-avatar">
              <Image alt="" src={post.authorAvatarUrl} fill sizes="32px" style={{ objectFit: "cover" }} />
            </span>
          ) : (
            <span className="match-post-avatar match-post-avatar-initial">
              {(post.authorNickname || "?").slice(0, 1)}
            </span>
          )}
          <div className="match-post-author-meta">
            <div className="match-post-author-name">
              <strong>{post.authorNickname}</strong>
              {post.authorTeamId ? <TeamBadge teamId={post.authorTeamId} size="sm" /> : null}
              {post.authorAttended ? (
                <span className="match-post-attended-badge" title="직관 인증">
                  <Check size={11} strokeWidth={3} /> 직관
                </span>
              ) : null}
            </div>
            <span className="match-post-time">{post.timeAgo}</span>
          </div>
        </div>

        {isOwner ? (
          <div className="match-post-more">
            <button
              type="button"
              className="icon-button"
              aria-label="더보기"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen ? (
              <div className="match-post-more-menu" role="menu" onMouseLeave={() => setMenuOpen(false)}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                >
                  <Trash2 size={14} /> 삭제
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </header>

      <button
        type="button"
        className="match-post-game-context"
        onClick={onClickGameFilter}
        aria-label="이 경기 글만 보기"
      >
        <span className="match-post-score">{scoreLabel}</span>
        {post.game.currentStatus === "canceled" ? (
          <span className="match-post-canceled-badge">경기 취소됨</span>
        ) : null}
      </button>

      <p className="match-post-body">{post.body}</p>

      {post.photoUrl ? (
        <div className="match-post-photo">
          <Image
            src={post.photoUrl}
            alt=""
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : null}

      <div className="match-post-emotion-row">
        <span className="match-post-emotion">
          {emotion.emoji} {emotion.label}
        </span>
      </div>

      <div className="match-post-actions">
        <button
          type="button"
          onClick={onToggleLike}
          className="match-post-action"
          style={post.likedByMe ? { color: "#ff6a2b" } : undefined}
          aria-pressed={post.likedByMe}
        >
          <Heart fill={post.likedByMe ? "currentColor" : "none"} size={18} />
          <span>{post.likeCount}</span>
        </button>
        <span className="match-post-action match-post-action-static">
          <MessageCircle size={18} />
          <span>{post.commentCount}</span>
        </span>
      </div>

      <ModalShell
        open={confirmOpen}
        title="경기톡 삭제"
        onClose={() => !deleting && setConfirmOpen(false)}
        panelClassName="dark-confirm-panel"
      >
        <div className="confirm-stack">
          <p>이 글을 삭제할까요?</p>
          <span className="confirm-hint">삭제 후엔 되돌릴 수 없어요.</span>
          <div className="confirm-actions">
            <button
              type="button"
              className="confirm-cancel"
              disabled={deleting}
              onClick={() => setConfirmOpen(false)}
            >
              취소
            </button>
            <Button disabled={deleting} onClick={confirmDelete}>
              {deleting ? "삭제 중" : "삭제하기"}
            </Button>
          </div>
        </div>
      </ModalShell>
    </article>
  );
}
