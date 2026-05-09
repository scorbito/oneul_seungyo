"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ModalShell } from "@/components/common/ModalShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { getTeam, teams } from "@/lib/constants/teams";
import type { Game } from "@/lib/types/domain";

type TicketPreview = {
  imageBase64: string;
  mimeType: string;
  hash: string;
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
} | null;

type AttendanceModalProps = {
  open: boolean;
  onClose: () => void;
  processingTicket: boolean;
  ticketPreview: TicketPreview;
  ticketFileName: string;
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  gamesOnSelectedDate: Game[];
  selectedGameId: string;
  supportTeamId: string;
  setSupportTeamId: (value: string) => void;
  attendanceMemo: string;
  setAttendanceMemo: (value: string) => void;
  savingAttendance: boolean;
  onTicketFileChange: (file: File | null) => void;
  onSelectGameAndTeam: (gameId: string, teamId: string) => void;
  onSubmit: () => void;
};

export function AttendanceModal({
  open,
  onClose,
  processingTicket,
  ticketPreview,
  ticketFileName,
  selectedDate,
  setSelectedDate,
  gamesOnSelectedDate,
  selectedGameId,
  supportTeamId,
  setSupportTeamId,
  attendanceMemo,
  setAttendanceMemo,
  savingAttendance,
  onTicketFileChange,
  onSelectGameAndTeam,
  onSubmit
}: AttendanceModalProps) {
  return (
    <ModalShell open={open} title="직관 등록" onClose={onClose} panelClassName="attendance-modal-panel">
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
          <span>티켓 사진을 올리면 경기와 응원팀이 자동으로 채워져요.<br />확인 후 등록 버튼을 누르세요.</span>
          <input
            type="file"
            accept="image/*"
            disabled={processingTicket}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              event.target.value = "";
              onTicketFileChange(file);
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
                  onClick={() => onSelectGameAndTeam(game.id, game.homeTeamId)}
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
                  onClick={() => onSelectGameAndTeam(game.id, game.awayTeamId)}
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
        <Button disabled={savingAttendance} onClick={onSubmit}>{savingAttendance ? "저장 중" : "등록하기"}</Button>
      </div>
    </ModalShell>
  );
}
