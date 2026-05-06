"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Download, Globe2, Instagram, Lock, MessageCircle, Plus, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ModalShell } from "@/components/common/ModalShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { getTeam, teams } from "@/lib/constants/teams";
import { scheduleGames } from "@/lib/mock/app";
import { useAppState } from "@/lib/state/AppState";

export type ModalKind = "attendance" | "review" | "share" | null;

type AppModalsProps = {
  open: ModalKind;
  setOpen: (open: ModalKind) => void;
  initialGameId?: string;
  initialDate?: string;
  initialAttendanceId?: string;
};

const templates = [
  { id: "red", label: "불꽃 레드", src: "/assets/share-bg-navy-red.png" },
  { id: "field", label: "그라운드", src: "/assets/share-bg-field.png" },
  { id: "white", label: "미니멀", src: "/assets/share-bg-white.png" }
];

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

function getAttendanceResult(game: typeof scheduleGames[number], supportTeamId: string) {
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

export function AppModals({ open, setOpen, initialGameId, initialDate, initialAttendanceId }: AppModalsProps) {
  const { addAttendance, addReview, attendances, profile, showToast } = useAppState();
  const [selectedDate, setSelectedDate] = useState("2025-05-10");
  const [selectedGameId, setSelectedGameId] = useState(scheduleGames[0]?.id ?? "");
  const [supportTeamId, setSupportTeamId] = useState("lg");
  const [attendanceMemo, setAttendanceMemo] = useState("");
  const [ticketFileName, setTicketFileName] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [privacy, setPrivacy] = useState("전체 공개");
  const [reviewPhotos, setReviewPhotos] = useState<string[]>(["/assets/stadium-review-sunset.png"]);
  const [selectedReviewAttendanceId, setSelectedReviewAttendanceId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [shareStatus, setShareStatus] = useState("");
  const attendanceDrag = useDragScroll<HTMLDivElement>();
  const selectedGame = useMemo(
    () => scheduleGames.find((game) => game.id === selectedGameId) ?? scheduleGames[0],
    [selectedGameId]
  );
  const reviewableAttendances = useMemo(
    () => attendances.filter((attendance) => Boolean(attendance.result)),
    [attendances]
  );
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

    const matchedGame = scheduleGames.find((game) => (
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
    if (initialGameId && scheduleGames.some((game) => game.id === initialGameId)) {
      setSelectedGameId(initialGameId);
    }
    if (initialDate) {
      setSelectedDate(initialDate.replaceAll(".", "-"));
    }
  }, [initialDate, initialGameId, open]);

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

  const submitAttendance = () => {
    if (!selectedGame) {
      showToast("경기를 먼저 선택해주세요.");
      return;
    }
    addAttendance({
      date: selectedDate.replaceAll("-", "."),
      stadium: selectedGame.stadium,
      homeTeamId: selectedGame.homeTeamId,
      awayTeamId: selectedGame.awayTeamId,
      supportTeamId,
      score: selectedGame.status === "finished" ? `${selectedGame.homeScore ?? 0} : ${selectedGame.awayScore ?? 0}` : "경기전",
      result: getAttendanceResult(selectedGame, supportTeamId),
      verified: Boolean(ticketFileName),
      memo: attendanceMemo
    });
    setAttendanceMemo("");
    setTicketFileName("");
    setOpen("share");
  };

  const submitReview = () => {
    if (!selectedReviewAttendance) {
      showToast("후기를 작성할 직관 경기를 선택해주세요.");
      return;
    }
    if (reviewBody.trim().length < 5) {
      showToast("후기를 5자 이상 입력해주세요.");
      return;
    }
    const reviewTeamId = selectedReviewAttendance.supportTeamId ?? profile.mainTeamId;
    addReview({
      author: profile.nickname,
      teamId: reviewTeamId,
      title: "오늘도 승요! 직관 후기",
      body: reviewBody.trim(),
      gameLabel: `${selectedReviewAttendance.date} · ${getTeam(selectedReviewAttendance.homeTeamId).shortName} ${selectedReviewAttendance.score} ${getTeam(selectedReviewAttendance.awayTeamId).shortName}`,
      image: reviewPhotos[0] ?? "/assets/stadium-review-day.png",
      tags: ["#직관후기", `#${privacy.replaceAll(" ", "")}`],
      attendanceId: selectedReviewAttendance.id
    });
    setReviewBody("");
    setOpen(null);
  };

  return (
    <>
      <ModalShell open={open === "attendance"} title="직관 등록" onClose={onClose}>
        <div className="form-stack">
          <label className="upload-box">
            <Camera size={24} />
            <strong>{ticketFileName || "티켓 사진 추가"}</strong>
            <span>티켓을 촬영하거나 사진을 등록하면 날짜와 경기 정보를 자동으로 맞출 수 있어요.</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const fileName = event.target.files?.[0]?.name ?? "";
                setTicketFileName(fileName);
                if (fileName) {
                  showToast("티켓 인식은 다음 단계에서 자동 선택으로 연결할게요.");
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
            {scheduleGames.map((game) => {
              const home = getTeam(game.homeTeamId);
              const away = getTeam(game.awayTeamId);
              const homeSelected = game.id === selectedGameId && supportTeamId === game.homeTeamId;
              const awaySelected = game.id === selectedGameId && supportTeamId === game.awayTeamId;

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
                  <em>vs</em>
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
          <Button onClick={submitAttendance}>등록하기</Button>
        </div>
      </ModalShell>

      <ModalShell open={open === "review"} title="후기 작성" onClose={onClose} panelClassName="review-modal-panel">
        <div className="form-stack">
          <div className="photo-strip">
            {reviewPhotos.map((photo) => (
              <button className="photo-preview-button" key={photo} type="button" onClick={() => setReviewPhotos((current) => current.filter((item) => item !== photo))}>
                <Image alt="후기 사진" height={126} src={photo} width={92} />
              </button>
            ))}
            {reviewPhotos.length < 3 ? <button
              type="button"
              onClick={() => {
                const candidates = ["/assets/stadium-review-day.png", "/assets/stadium-review-night.png"];
                const next = candidates.find((item) => !reviewPhotos.includes(item));
                if (next && reviewPhotos.length < 3) {
                  setReviewPhotos((current) => [...current, next]);
                } else {
                  showToast("사진은 최대 3장까지 추가할 수 있어요.");
                }
              }}
            >
              <Plus size={24} />추가
            </button> : null}
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
          <Button onClick={submitReview}>등록하기</Button>
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
