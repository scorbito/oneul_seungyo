"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2 } from "lucide-react";
import { ModalShell } from "@/components/common/ModalShell";
import { Button } from "@/components/common/Button";
import { TeamBadge } from "@/components/common/TeamBadge";
import {
  createMatchPostAction,
  listWriteableGamesAction,
  type WriteableGameOption
} from "@/lib/actions/matchTalk";
import { uploadUserFile } from "@/lib/supabase/storage-client";
import { useAppState } from "@/lib/state/AppState";
import { getThisWeekRangeKst } from "@/lib/utils/matchTalkWeek";
import { getTeam } from "@/lib/constants/teams";
import type { MatchPostEmotionTag } from "@/lib/types/domain";

const EMOTION_OPTIONS: { id: MatchPostEmotionTag; emoji: string; label: string; hint: string }[] = [
  { id: "cheer", emoji: "🎉", label: "환호", hint: "홈런·승리·좋은 플레이" },
  { id: "support", emoji: "📣", label: "응원", hint: "경기 전/중 응원, 화이팅" },
  { id: "anger", emoji: "😡", label: "분노", hint: "오심·부진·패배" },
  { id: "anxiety", emoji: "😰", label: "불안", hint: "동점·마무리 위기" }
];

const MAX_BODY = 300;

type MatchTalkComposerModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  /** 진입 시 미리 선택할 경기 ID. 예: 일정 → 경기톡 보기에서 진입할 때 */
  initialGameId?: string;
};

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  return `${m}/${d} (${weekdays[date.getDay()]})`;
}

export function MatchTalkComposerModal({ open, onClose, onCreated, initialGameId }: MatchTalkComposerModalProps) {
  const { showToast } = useAppState();
  const [games, setGames] = useState<WriteableGameOption[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedGameId, setSelectedGameId] = useState<string>(initialGameId ?? "");
  const [body, setBody] = useState("");
  const [emotionTag, setEmotionTag] = useState<MatchPostEmotionTag | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 모달 열릴 때 경기 목록 lazy fetch
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setGamesLoading(true);
    listWriteableGamesAction()
      .then((list) => {
        if (cancelled) return;
        setGames(list);

        // 초기 날짜/경기 선택
        if (initialGameId && list.some((g) => g.id === initialGameId)) {
          const target = list.find((g) => g.id === initialGameId);
          if (target) {
            setSelectedDate(target.date);
            setSelectedGameId(initialGameId);
            return;
          }
        }
        // 기본값: 오늘. 오늘 경기 없으면 가장 가까운 날짜.
        const todayKst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
        const todayStr = `${todayKst.getFullYear()}-${String(todayKst.getMonth() + 1).padStart(2, "0")}-${String(todayKst.getDate()).padStart(2, "0")}`;
        const datesWithGames = Array.from(new Set(list.map((g) => g.date))).sort();
        const fallback = datesWithGames.find((d) => d >= todayStr) ?? datesWithGames[0] ?? "";
        const initialDate = list.some((g) => g.date === todayStr) ? todayStr : fallback;
        setSelectedDate(initialDate);
        const firstGameOnDate = list.find((g) => g.date === initialDate);
        setSelectedGameId(firstGameOnDate?.id ?? "");
      })
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "경기 목록을 불러오지 못했어요.");
      })
      .finally(() => {
        if (!cancelled) setGamesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, initialGameId, showToast]);

  // 모달 닫힐 때 폼 초기화
  useEffect(() => {
    if (open) return;
    setBody("");
    setEmotionTag(null);
    setPhotoUrl(null);
    setSelectedGameId("");
  }, [open]);

  const week = useMemo(() => getThisWeekRangeKst(), []);
  const datesThisWeek = useMemo(() => {
    const result: string[] = [];
    const [y, m, d] = week.from.split("-").map(Number);
    const cursor = new Date(y, m - 1, d);
    for (let i = 0; i < 7; i++) {
      const ds = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      result.push(ds);
      cursor.setDate(cursor.getDate() + 1);
    }
    return result;
  }, [week]);

  const gamesOnSelectedDate = useMemo(
    () => games.filter((g) => g.date === selectedDate),
    [games, selectedDate]
  );
  const hasGamesByDate = useMemo(() => {
    const set = new Set(games.map((g) => g.date));
    return (date: string) => set.has(date);
  }, [games]);

  const selectedGame = games.find((g) => g.id === selectedGameId);

  const handleSelectDate = (date: string) => {
    if (!hasGamesByDate(date)) return;
    setSelectedDate(date);
    const first = games.find((g) => g.date === date);
    setSelectedGameId(first?.id ?? "");
  };

  const handlePickPhoto = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadUserFile("review-photos", file, "match-talk");
      setPhotoUrl(url);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "사진 업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  const canSubmit =
    !submitting &&
    !uploading &&
    Boolean(selectedGameId) &&
    body.trim().length > 0 &&
    body.length <= MAX_BODY &&
    Boolean(emotionTag);

  const handleSubmit = async () => {
    if (!canSubmit || !emotionTag) return;
    setSubmitting(true);
    try {
      await createMatchPostAction({
        gameId: selectedGameId,
        body,
        emotionTag,
        photoUrl
      });
      showToast("경기톡에 글을 올렸어요.");
      onCreated?.();
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "글 작성 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell open={open} title="경기톡 글쓰기" onClose={() => !submitting && onClose()}>
      <div className="match-talk-composer">
        {/* 1. 날짜 */}
        <div className="composer-section">
          <label className="composer-label">날짜</label>
          <div className="composer-date-row">
            {datesThisWeek.map((date) => {
              const has = hasGamesByDate(date);
              const isSelected = date === selectedDate;
              return (
                <button
                  key={date}
                  type="button"
                  className={
                    isSelected
                      ? "composer-date-chip composer-date-chip-active"
                      : has
                        ? "composer-date-chip"
                        : "composer-date-chip composer-date-chip-disabled"
                  }
                  disabled={!has}
                  onClick={() => handleSelectDate(date)}
                >
                  {formatDateLabel(date)}
                </button>
              );
            })}
          </div>
          {gamesLoading ? <span className="composer-loading">경기 목록 불러오는 중…</span> : null}
        </div>

        {/* 2. 경기 */}
        <div className="composer-section">
          <label className="composer-label">경기</label>
          {gamesOnSelectedDate.length === 0 ? (
            <p className="composer-empty">
              {gamesLoading ? "" : "이 날짜에는 작성 가능한 경기가 없어요."}
            </p>
          ) : (
            <div className="composer-game-list">
              {gamesOnSelectedDate.map((g) => {
                const home = getTeam(g.homeTeamId);
                const away = getTeam(g.awayTeamId);
                const isSelected = g.id === selectedGameId;
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={isSelected ? "composer-game-row composer-game-row-active" : "composer-game-row"}
                    onClick={() => setSelectedGameId(g.id)}
                  >
                    <span className="composer-game-time">{g.time?.slice(0, 5) ?? "-"}</span>
                    <span className="composer-game-teams">
                      <TeamBadge teamId={g.awayTeamId} size="sm" />
                      <span>{away.shortName}</span>
                      <span className="composer-game-vs">vs</span>
                      <TeamBadge teamId={g.homeTeamId} size="sm" />
                      <span>{home.shortName}</span>
                    </span>
                    <span className="composer-game-stadium">{g.stadium}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. 본문 */}
        <div className="composer-section">
          <label className="composer-label" htmlFor="match-talk-body">내용</label>
          <textarea
            id="match-talk-body"
            className="composer-textarea"
            placeholder="한두 줄로 가볍게 — 무슨 얘기를 하고 싶으신가요?"
            maxLength={MAX_BODY}
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={submitting}
          />
          <div className="composer-counter">
            <span>{body.length} / {MAX_BODY}</span>
          </div>
        </div>

        {/* 4. 감정 태그 */}
        <div className="composer-section">
          <label className="composer-label">감정 태그 (필수)</label>
          <div className="composer-emotion-row">
            {EMOTION_OPTIONS.map((opt) => {
              const active = emotionTag === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={active ? "composer-emotion-chip composer-emotion-chip-active" : "composer-emotion-chip"}
                  onClick={() => setEmotionTag(opt.id)}
                  aria-pressed={active}
                  title={opt.hint}
                >
                  <span>{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. 사진 */}
        <div className="composer-section">
          <label className="composer-label">사진 (선택, 1장)</label>
          {photoUrl ? (
            <div className="composer-photo-preview">
              <div className="composer-photo-frame">
                <Image src={photoUrl} alt="" fill sizes="320px" style={{ objectFit: "cover" }} />
              </div>
              <button
                type="button"
                className="composer-photo-remove"
                onClick={() => setPhotoUrl(null)}
                aria-label="사진 제거"
              >
                <Trash2 size={14} /> 제거
              </button>
            </div>
          ) : (
            <label className="composer-photo-pick">
              <ImagePlus size={16} />
              <span>{uploading ? "업로드 중…" : "사진 추가"}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={uploading || submitting}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handlePickPhoto(file);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>

        {/* 6. 등록 */}
        <div className="composer-actions">
          <button
            type="button"
            className="composer-cancel"
            disabled={submitting}
            onClick={onClose}
          >
            취소
          </button>
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? "올리는 중…" : "올리기"}
          </Button>
        </div>

        {selectedGame ? (
          <p className="composer-hint">
            등록 시점의 라이브 스코어가 자동으로 박제돼요. (현재 상태:{" "}
            {selectedGame.status === "in_progress" ? "진행 중" : selectedGame.status === "finished" ? "종료" : "경기 전"})
          </p>
        ) : null}
      </div>
    </ModalShell>
  );
}
