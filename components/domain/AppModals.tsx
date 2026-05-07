"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Download, Globe2, Instagram, Lock, MessageCircle, Plus, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ModalShell } from "@/components/common/ModalShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { getTeam, teams } from "@/lib/constants/teams";
import { createAttendanceAction, findCurrentUserAttendanceId } from "@/lib/actions/attendance";
import { createReviewAction } from "@/lib/actions/review";
import { previewTicket, registerAttendanceFromTicket } from "@/lib/actions/ticket";
import { useAppState } from "@/lib/state/AppState";
import { uploadUserFile } from "@/lib/supabase/storage-client";
import type { Game } from "@/lib/types/domain";

export type ModalKind = "attendance" | "review" | "share" | null;

type AppModalsProps = {
  open: ModalKind;
  setOpen: (open: ModalKind) => void;
  games?: Game[];
  initialGameId?: string;
  initialDate?: string;
  initialAttendanceId?: string;
};

const templates = [
  { id: "red", label: "불꽃 레드", src: "/assets/share-bg-navy-red.png" },
  { id: "field", label: "그라운드", src: "/assets/share-bg-field.png" },
  { id: "white", label: "미니멀", src: "/assets/share-bg-white.png" }
];

const publicScopeMap = {
  "전체 공개": "public",
  "친구 공개": "friends",
  "나만 보기": "private"
} as const;

function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const stateRef = useRef({ down: false, startX: 0, startScroll: 0, dragged: false, pointerId: 0 });

  const onPointerDown = (event: React.PointerEvent<T>) => {
    if (event.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    stateRef.current = {
      down: true,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      dragged: false,
      pointerId: event.pointerId
    };
  };
  const onPointerMove = (event: React.PointerEvent<T>) => {
    const state = stateRef.current;
    const el = ref.current;
    if (!state.down || !el) return;
    const dx = event.clientX - state.startX;
    if (!state.dragged && Math.abs(dx) > 4) {
      state.dragged = true;
      el.style.cursor = "grabbing";
      try {
        el.setPointerCapture(state.pointerId);
      } catch {}
    }
    if (state.dragged) {
      el.scrollLeft = state.startScroll - dx;
    }
  };
  const endDrag = () => {
    const state = stateRef.current;
    const el = ref.current;
    if (el && state.dragged) {
      el.style.cursor = "";
      try {
        el.releasePointerCapture(state.pointerId);
      } catch {}
    }
    state.down = false;
  };
  const onClickCapture = (event: React.MouseEvent<T>) => {
    if (stateRef.current.dragged) {
      event.preventDefault();
      event.stopPropagation();
      stateRef.current.dragged = false;
    }
  };

  return { ref, onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerLeave: endDrag, onPointerCancel: endDrag, onClickCapture };
}

/** 본문에서 #태그 추출 (한글/영문/숫자/_, 최대 20개, 중복 제거) */
function extractHashtags(body: string): string[] {
  const matches = body.match(/#[가-힣ㄱ-ㆎa-zA-Z0-9_]+/g) ?? [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of matches) {
    if (!seen.has(tag)) {
      seen.add(tag);
      result.push(tag);
      if (result.length >= 20) break;
    }
  }
  return result;
}

function getAttendanceResult(game: Game, supportTeamId: string): "win" | "lose" | "draw" | undefined {
  if (game.status !== "finished" || game.homeScore === undefined || game.awayScore === undefined) {
    return undefined;
  }

  if (game.homeScore === game.awayScore) {
    return "draw";
  }

  if (supportTeamId === game.homeTeamId) {
    return game.homeScore > game.awayScore ? "win" : "lose";
  }

  if (supportTeamId === game.awayTeamId) {
    return game.awayScore > game.homeScore ? "win" : "lose";
  }

  return undefined;
}

export function AppModals({ open, setOpen, games = [], initialGameId, initialDate, initialAttendanceId }: AppModalsProps) {
  const { addAttendance, addReview, attendances, reviews, profile, showToast } = useAppState();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedGameId, setSelectedGameId] = useState(games[0]?.id ?? "");
  const [supportTeamId, setSupportTeamId] = useState("lg");
  const [attendanceMemo, setAttendanceMemo] = useState("");
  const [ticketFileName, setTicketFileName] = useState("");
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [processingTicket, setProcessingTicket] = useState(false);
  // Vision으로 미리 분석된 티켓 정보. 등록 시 hash dedup + ticket 인증 흐름에 사용.
  const [ticketPreview, setTicketPreview] = useState<{
    imageBase64: string;
    mimeType: string;
    hash: string;
    gameId: string;
    homeTeamId: string;
    awayTeamId: string;
  } | null>(null);
  const [reviewBody, setReviewBody] = useState("");
  const [privacy, setPrivacy] = useState("전체 공개");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>(["/assets/stadium-review-sunset.png"]);
  const [reviewPhotoFiles, setReviewPhotoFiles] = useState<Array<{ src: string; file: File }>>([]);
  const [selectedReviewAttendanceId, setSelectedReviewAttendanceId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [shareStatus, setShareStatus] = useState("");
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const attendanceDrag = useDragScroll<HTMLDivElement>();
  const gamesOnSelectedDate = useMemo(() => {
    const dotDate = selectedDate.replaceAll("-", ".");
    const filtered = games.filter((game) => game.date === dotDate);
    return [...filtered].sort((a, b) => {
      const aIsMine = a.homeTeamId === profile.mainTeamId || a.awayTeamId === profile.mainTeamId;
      const bIsMine = b.homeTeamId === profile.mainTeamId || b.awayTeamId === profile.mainTeamId;
      if (aIsMine === bIsMine) return 0;
      return aIsMine ? -1 : 1;
    });
  }, [games, profile.mainTeamId, selectedDate]);
  const selectedGame = useMemo(
    () => gamesOnSelectedDate.find((game) => game.id === selectedGameId) ?? gamesOnSelectedDate[0],
    [gamesOnSelectedDate, selectedGameId]
  );
  const reviewableAttendances = useMemo(() => {
    const reviewedIds = new Set(reviews.map((r) => r.attendanceId).filter(Boolean));
    return attendances
      .filter((attendance) => Boolean(attendance.result) && !reviewedIds.has(attendance.id))
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date)); // 왼쪽=오래된, 오른쪽=최신
  }, [attendances, reviews]);
  const selectedReviewAttendance = useMemo(
    () => reviewableAttendances.find((attendance) => attendance.id === selectedReviewAttendanceId) ?? reviewableAttendances[0],
    [reviewableAttendances, selectedReviewAttendanceId]
  );
  const onClose = () => setOpen(null);
  const selectGameAndTeam = (gameId: string, teamId: string) => {
    setSelectedGameId(gameId);
    setSupportTeamId(teamId);
  };
  const selectReviewAttendance = useCallback((attendance: typeof reviewableAttendances[number]) => {
    setSelectedReviewAttendanceId(attendance.id);
    setSelectedDate(attendance.date.replaceAll(".", "-"));
    setSupportTeamId(attendance.supportTeamId ?? profile.mainTeamId);

    const matchedGame = games.find((game) => (
      game.date === attendance.date
      && (
        (game.homeTeamId === attendance.homeTeamId && game.awayTeamId === attendance.awayTeamId)
        || (game.homeTeamId === attendance.awayTeamId && game.awayTeamId === attendance.homeTeamId)
      )
    ));
    if (matchedGame) {
      setSelectedGameId(matchedGame.id);
    }
  }, [profile.mainTeamId]);

  useEffect(() => {
    if (open !== "attendance") {
      return;
    }
    if (initialGameId && games.some((game) => game.id === initialGameId)) {
      setSelectedGameId(initialGameId);
    }
    if (initialDate) {
      setSelectedDate(initialDate.replaceAll(".", "-"));
    }
  }, [games, initialDate, initialGameId, open]);

  // 날짜 변경 시 해당 날짜의 첫 경기를 자동 선택
  useEffect(() => {
    if (open !== "attendance") return;
    if (gamesOnSelectedDate.length === 0) {
      setSelectedGameId("");
      return;
    }
    if (!gamesOnSelectedDate.some((g) => g.id === selectedGameId)) {
      const first = gamesOnSelectedDate[0];
      setSelectedGameId(first.id);
      // 우리 팀 경기면 우리 팀을 응원팀 기본값으로
      const myTeamIsHome = first.homeTeamId === profile.mainTeamId;
      const myTeamIsAway = first.awayTeamId === profile.mainTeamId;
      setSupportTeamId(myTeamIsHome || myTeamIsAway ? profile.mainTeamId : first.homeTeamId);
    }
  }, [gamesOnSelectedDate, open, selectedGameId]);

  useEffect(() => {
    if (open !== "review" || reviewableAttendances.length === 0) {
      return;
    }
    if (initialAttendanceId) {
      const target = reviewableAttendances.find((attendance) => attendance.id === initialAttendanceId);
      if (target) {
        selectReviewAttendance(target);
        return;
      }
    }
    if (!reviewableAttendances.some((attendance) => attendance.id === selectedReviewAttendanceId)) {
      selectReviewAttendance(reviewableAttendances[0]);
    }
  }, [initialAttendanceId, open, reviewableAttendances, selectReviewAttendance, selectedReviewAttendanceId]);

  const submitAttendance = async () => {
    if (!selectedGame) {
      showToast("경기를 먼저 선택해주세요.");
      return;
    }
    const attendance = {
      date: selectedDate.replaceAll("-", "."),
      stadium: selectedGame.stadium,
      homeTeamId: selectedGame.homeTeamId,
      awayTeamId: selectedGame.awayTeamId,
      supportTeamId,
      score: selectedGame.status === "finished" ? `${selectedGame.homeScore ?? 0} : ${selectedGame.awayScore ?? 0}` : "경기전",
      result: getAttendanceResult(selectedGame, supportTeamId),
      verified: Boolean(ticketFileName),
      memo: attendanceMemo
    };

    setSavingAttendance(true);
    try {
      if (ticketPreview) {
        // 티켓 흐름: Vision 인증 + Storage 업로드 + DB insert를 server action 한 번에
        const result = await registerAttendanceFromTicket({
          imageBase64: ticketPreview.imageBase64,
          mimeType: ticketPreview.mimeType,
          supportTeamId,
          memo: attendanceMemo
        });
        if (!result.ok) {
          showToast(result.reason);
          setSavingAttendance(false);
          return;
        }
        addAttendance({ ...attendance, verified: true });
        showToast("티켓 인증 직관 등록 완료!");
      } else {
        // 수동 흐름
        await createAttendanceAction({
          date: attendance.date,
          homeTeamId: attendance.homeTeamId,
          awayTeamId: attendance.awayTeamId,
          supportTeamId,
          memo: attendanceMemo
        });
        addAttendance(attendance);
        showToast("직관을 DB에 저장했어요.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "직관 저장에 실패했습니다.";
      if (message.includes("로그인")) {
        addAttendance(attendance);
        showToast("로그인 전이라 mock 기록으로 저장했어요.");
      } else {
        showToast(message);
        setSavingAttendance(false);
        return;
      }
    }
    setSavingAttendance(false);
    setAttendanceMemo("");
    setTicketFileName("");
    setTicketFile(null);
    setTicketPreview(null);
    setOpen(null);
  };

  const submitReview = async () => {
    if (!selectedReviewAttendance) {
      showToast("후기를 작성할 직관 경기를 선택해주세요.");
      return;
    }
    if (reviewBody.trim().length < 5) {
      showToast("후기를 5자 이상 입력해주세요.");
      return;
    }
    const reviewTeamId = selectedReviewAttendance.supportTeamId ?? profile.mainTeamId;
    const trimmedBody = reviewBody.trim();
    const review = {
      author: profile.nickname,
      teamId: reviewTeamId,
      title: "",
      body: trimmedBody,
      gameLabel: `${selectedReviewAttendance.date} · ${getTeam(selectedReviewAttendance.homeTeamId).shortName} ${selectedReviewAttendance.score} ${getTeam(selectedReviewAttendance.awayTeamId).shortName}`,
      image: reviewPhotos[0] ?? "/assets/stadium-review-day.png",
      tags: extractHashtags(trimmedBody),
      attendanceId: selectedReviewAttendance.id
    };

    setSavingReview(true);
    try {
      const attendanceId = await findCurrentUserAttendanceId({
        date: selectedReviewAttendance.date,
        homeTeamId: selectedReviewAttendance.homeTeamId,
        awayTeamId: selectedReviewAttendance.awayTeamId
      });

      if (!attendanceId) {
        throw new Error("DB에 저장된 직관 기록을 찾지 못했습니다.");
      }

      const uploadedPhotos = await Promise.all(
        reviewPhotoFiles.map((item, index) => uploadUserFile("review-photos", item.file, `review-${Date.now()}-${index}`))
      );
      const persistedPhotos = uploadedPhotos.length > 0 ? uploadedPhotos : reviewPhotos;

      await createReviewAction({
        attendanceId,
        body: reviewBody.trim(),
        photos: persistedPhotos,
        publicScope: publicScopeMap[privacy as keyof typeof publicScopeMap] ?? "public"
      });
      addReview({ ...review, attendanceId, image: persistedPhotos[0] ?? review.image });
      showToast("후기를 DB에 저장했어요.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "후기 저장에 실패했습니다.";
      if (message.includes("로그인") || message.includes("DB에 저장된 직관")) {
        addReview(review);
        showToast("DB 연결 전이라 mock 후기로 저장했어요.");
      } else {
        showToast(message);
        setSavingReview(false);
        return;
      }
    }
    setSavingReview(false);
    setReviewBody("");
    setReviewPhotoFiles([]);
    setOpen(null);
  };

  return (
    <>
      <ModalShell open={open === "attendance"} title="직관 등록" onClose={onClose}>
        <div className="form-stack">
          <label className="upload-box">
            <Camera size={24} />
            <strong>
              {processingTicket
                ? "티켓 인식 중..."
                : ticketPreview
                  ? "티켓 인식 완료 — 아래에서 확인 후 등록"
                  : (ticketFileName || "티켓 사진으로 빠른 등록")}
            </strong>
            <span>티켓 사진을 올리면 경기와 응원팀이 자동으로 채워져요. 확인 후 등록 버튼을 누르세요.</span>
            <input
              type="file"
              accept="image/*"
              disabled={processingTicket}
              onChange={async (event) => {
                const file = event.target.files?.[0] ?? null;
                event.target.value = "";
                if (!file) return;
                setTicketFile(file);
                setTicketFileName(file.name);
                setTicketPreview(null);
                setProcessingTicket(true);
                try {
                  const arrayBuffer = await file.arrayBuffer();
                  const bytes = new Uint8Array(arrayBuffer);
                  let binary = "";
                  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                  const imageBase64 = btoa(binary);
                  const mimeType = file.type || "image/jpeg";

                  const result = await previewTicket({ imageBase64, mimeType });
                  if (!result.ok) {
                    showToast(result.reason);
                    setTicketFile(null);
                    setTicketFileName("");
                    return;
                  }

                  // 폼 자동 채우기
                  setSelectedDate(result.gameDate);
                  setSelectedGameId(result.gameId);
                  if (result.suggestedSupportTeamId) {
                    setSupportTeamId(result.suggestedSupportTeamId);
                  } else {
                    // mainTeamId가 경기에 없으면 일단 홈팀을 기본 선택, 사용자가 응원팀 드롭다운에서 변경
                    setSupportTeamId(result.homeTeamId);
                    showToast("응원팀을 직접 선택해 주세요.");
                  }
                  setTicketPreview({
                    imageBase64,
                    mimeType,
                    hash: result.hash,
                    gameId: result.gameId,
                    homeTeamId: result.homeTeamId,
                    awayTeamId: result.awayTeamId
                  });
                } catch (err) {
                  showToast(err instanceof Error ? err.message : "티켓 인식 실패");
                  setTicketFile(null);
                  setTicketFileName("");
                } finally {
                  setProcessingTicket(false);
                }
              }}
            />
          </label>
          <label className="field-row">
            <span>1. 직관 날짜 선택</span>
            <input className="plain-input" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </label>
          <div className="field-group">
            <span>2. 경기와 응원팀 선택</span>
            {gamesOnSelectedDate.length === 0 && <p style={{ color: "#7b8290", fontSize: 13 }}>이 날짜에 등록 가능한 경기가 없어요.</p>}
            {gamesOnSelectedDate.map((game) => {
              const home = getTeam(game.homeTeamId);
              const away = getTeam(game.awayTeamId);
              const homeSelected = game.id === selectedGameId && supportTeamId === game.homeTeamId;
              const awaySelected = game.id === selectedGameId && supportTeamId === game.awayTeamId;

              const isFinished = game.status === "finished" && game.homeScore !== undefined && game.awayScore !== undefined;
              const scoreLabel = isFinished ? `${game.homeScore} : ${game.awayScore}` : "vs";
              return (
                <div className={game.id === selectedGameId ? "radio-game radio-game-active" : "radio-game"} key={game.id}>
                  <button
                    className={homeSelected ? "team-choice team-choice-active" : "team-choice"}
                    type="button"
                    aria-label={`${home.shortName} 응원으로 ${home.shortName} 대 ${away.shortName} 경기 선택`}
                    onClick={() => selectGameAndTeam(game.id, game.homeTeamId)}
                  >
                    <i />
                    <TeamBadge teamId={game.homeTeamId} size="sm" />
                    <strong>{home.shortName}</strong>
                  </button>
                  <em>{scoreLabel}</em>
                  <button
                    className={awaySelected ? "team-choice team-choice-active" : "team-choice"}
                    type="button"
                    aria-label={`${away.shortName} 응원으로 ${home.shortName} 대 ${away.shortName} 경기 선택`}
                    onClick={() => selectGameAndTeam(game.id, game.awayTeamId)}
                  >
                    <strong>{away.shortName}</strong>
                    <TeamBadge teamId={game.awayTeamId} size="sm" />
                    <i />
                  </button>
                </div>
              );
            })}
          </div>
          <label className="field-row">
            <span>3. 응원 팀 확인</span>
            <select className="plain-input" value={supportTeamId} onChange={(event) => setSupportTeamId(event.target.value)}>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </label>
          <label className="textarea-field">
            <span>4. 메모 (선택)</span>
            <textarea value={attendanceMemo} placeholder="직관에 대한 간단한 메모를 남겨보세요." onChange={(event) => setAttendanceMemo(event.target.value)} />
          </label>
          <Button disabled={savingAttendance} onClick={submitAttendance}>{savingAttendance ? "저장 중" : "등록하기"}</Button>
        </div>
      </ModalShell>

      <ModalShell open={open === "review"} title="후기 작성" onClose={onClose} panelClassName="review-modal-panel">
        <div className="form-stack">
          <div className="photo-strip">
            {reviewPhotos.map((photo) => (
              <button
                className="photo-preview-button"
                key={photo}
                type="button"
                onClick={() => {
                  setReviewPhotos((current) => current.filter((item) => item !== photo));
                  setReviewPhotoFiles((current) => current.filter((item) => item.src !== photo));
                }}
              >
                <Image alt="후기 사진" height={126} src={photo} unoptimized={photo.startsWith("blob:")} width={92} />
              </button>
            ))}
            {reviewPhotos.length < 3 ? (
              <label className="photo-add-button">
                <Plus size={24} />추가
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []).slice(0, 3 - reviewPhotos.length);
                    if (files.length === 0) {
                      return;
                    }
                    const previews = files.map((file) => ({ src: URL.createObjectURL(file), file }));
                    setReviewPhotoFiles((current) => [...current, ...previews].slice(0, 3));
                    setReviewPhotos((current) => [
                      ...current,
                      ...previews.map((item) => item.src)
                    ].slice(0, 3));
                    event.target.value = "";
                  }}
                />
              </label>
            ) : null}
          </div>
          <div className="review-attendance-picker">
            <span>1. 직관 경기 선택</span>
            <div className="review-attendance-list" ref={attendanceDrag.ref} onPointerDown={attendanceDrag.onPointerDown} onPointerMove={attendanceDrag.onPointerMove} onPointerUp={attendanceDrag.onPointerUp} onPointerLeave={attendanceDrag.onPointerLeave} onPointerCancel={attendanceDrag.onPointerCancel} onClickCapture={attendanceDrag.onClickCapture}>
              {reviewableAttendances.map((attendance) => (
                <button
                  className={selectedReviewAttendance?.id === attendance.id ? "review-attendance-option review-attendance-option-active" : "review-attendance-option"}
                  key={attendance.id}
                  type="button"
                  onClick={() => selectReviewAttendance(attendance)}
                >
                  <span>{attendance.date}</span>
                  <div className="review-attendance-teams">
                    <span>
                      <TeamBadge teamId={attendance.homeTeamId} size="sm" />
                      <b>{getTeam(attendance.homeTeamId).shortName}</b>
                      <em>{attendance.score.split(":")[0]?.trim() ?? "-"}</em>
                    </span>
                    <span>
                      <TeamBadge teamId={attendance.awayTeamId} size="sm" />
                      <b>{getTeam(attendance.awayTeamId).shortName}</b>
                      <em>{attendance.score.split(":")[1]?.trim() ?? "-"}</em>
                    </span>
                  </div>
                </button>
              ))}
              {reviewableAttendances.length === 0 ? <p>후기를 작성할 수 있는 종료된 직관 경기가 없어요.</p> : null}
            </div>
          </div>
          <div className="auto-meta">
            <span>2025.05.10 (토) 14:00</span>
            <strong>잠실야구장 · 두산 베어스 vs LG 트윈스</strong>
          </div>
          <label className="textarea-field review-body-field">
            <span className="review-body-label">2. 후기 내용</span>
            <span>3. 후기 내용</span>
            <textarea value={reviewBody} placeholder="오늘 경기 어땠나요? 생생한 후기를 남겨주세요!" onChange={(event) => setReviewBody(event.target.value)} />
          </label>
          <div className="privacy-row">
            {[
              { label: "전체 공개", icon: Globe2 },
              { label: "친구 공개", icon: Users },
              { label: "나만 보기", icon: Lock }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button className={privacy === item.label ? "privacy-active" : ""} key={item.label} type="button" onClick={() => setPrivacy(item.label)}>
                  <Icon size={16} />{item.label}
                </button>
              );
            })}
          </div>
          <Button disabled={savingReview} onClick={submitReview}>{savingReview ? "저장 중" : "등록하기"}</Button>
        </div>
      </ModalShell>

      <ModalShell open={open === "share"} title="공유하기" onClose={onClose}>
        <div className="share-modal-content">
          <div className="share-card-preview">
            <Image alt="공유 카드 배경" fill src={selectedTemplate.src} />
            <div>
              <p>내 직관 승률</p>
              <strong>{profile.winRate}</strong>
              <span>{profile.wins}승 {profile.losses}패 {profile.draws}무</span>
              <b><TeamBadge teamId={profile.mainTeamId} size="md" /> {getTeam(profile.mainTeamId).name}</b>
              <em>오늘은 승요</em>
            </div>
          </div>
          <div className="template-picker">
            {templates.map((template) => (
              <button className={selectedTemplate.id === template.id ? "template-active" : ""} key={template.id} type="button" onClick={() => setSelectedTemplate(template)}>
                <Image alt={template.label} height={76} src={template.src} width={48} /><span>{template.label}</span>
              </button>
            ))}
          </div>
          <div className="share-actions">
            <button type="button" onClick={() => setShareStatus("카카오톡 공유 준비 완료")}><MessageCircle size={24} />카카오톡</button>
            <button type="button" onClick={() => setShareStatus("인스타그램 공유 준비 완료")}><Instagram size={24} />인스타그램</button>
            <button type="button" onClick={() => setShareStatus("이미지를 저장했어요")}><Download size={24} />저장하기</button>
          </div>
          {shareStatus ? <p className="inline-success">{shareStatus}</p> : null}
          <p className="share-help"><ShieldCheck size={14} /> 공유하면 더 많은 팬들과 기록을 나눌 수 있어요.</p>
        </div>
      </ModalShell>

    </>
  );
}
