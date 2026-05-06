"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Share2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { AppModals, type ModalKind } from "@/components/domain/AppModals";
import { getTeam } from "@/lib/constants/teams";
import { scheduleGames } from "@/lib/mock/app";

type GameDetailScreenProps = {
  id: string;
};

export function GameDetailScreen({ id }: GameDetailScreenProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const game = scheduleGames.find((item) => item.id === id);

  if (!game) {
    return (
      <AppShell activeTab="schedule" title="경기 상세">
        <div className="detail-topbar">
          <a href="/schedule" aria-label="뒤로가기"><ArrowLeft size={20} /></a>
          <span>경기 상세</span>
          <span />
        </div>
        <section className="not-found-panel">
          <h1>경기를 찾을 수 없어요</h1>
          <p>일정 화면에서 다시 경기 카드를 선택해주세요.</p>
          <a href="/schedule">일정으로 돌아가기</a>
        </section>
      </AppShell>
    );
  }

  const home = getTeam(game.homeTeamId);
  const away = getTeam(game.awayTeamId);

  return (
    <AppShell activeTab="schedule" title="경기 상세">
      <div className="detail-topbar">
        <a href="/schedule" aria-label="뒤로가기"><ArrowLeft size={20} /></a>
        <span>{game.date} ({game.time})</span>
        <button className="icon-button" aria-label="공유"><Share2 size={17} /></button>
      </div>
      <section className="score-board">
        <div>
          <TeamBadge teamId={game.homeTeamId} size="lg" />
          <strong>{home.shortName}</strong>
          <span className="pill-win">승</span>
        </div>
        <b>{game.homeScore ?? 5} : {game.awayScore ?? 3}</b>
        <div>
          <TeamBadge teamId={game.awayTeamId} size="lg" />
          <strong>{away.shortName}</strong>
          <span className="pill-lose">패</span>
        </div>
      </section>
      <Card className="inning-card">
        <div className="inning-row inning-head">
          {["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "R", "H", "E"].map((cell) => <span key={cell}>{cell}</span>)}
        </div>
        <div className="inning-row">
          {["LG", "0", "0", "2", "0", "2", "0", "0", "1", "0", "5", "10", "1"].map((cell) => <span key={`lg-${cell}`}>{cell}</span>)}
        </div>
        <div className="inning-row">
          {["두산", "0", "1", "0", "1", "0", "1", "0", "0", "0", "3", "7", "0"].map((cell) => <span key={`doosan-${cell}`}>{cell}</span>)}
        </div>
      </Card>
      <Card className="info-list">
        <div><span>승리 투수</span><strong>손주영 (4-1)</strong></div>
        <div><span>패전 투수</span><strong>최승용 (2-3)</strong></div>
        <div><span>관중</span><strong>24,512명</strong></div>
        <div><span>경기 시간</span><strong>3시간 12분</strong></div>
      </Card>
      <Card className="summary-card">
        <h2>내 직관 결과 요약</h2>
        <div className="summary-grid">
          <span>직관<br /><b>12경기</b></span>
          <span>승리<br /><b>8경기</b></span>
          <span>최대 연승<br /><b>3연승</b></span>
          <span>이번 시즌<br /><b>4승 2패</b></span>
        </div>
      </Card>
      <div className="sticky-action-row">
        <Button onClick={() => setModal("attendance")}>
          <Plus size={17} />
          이 경기 직관 등록
        </Button>
      </div>
      <AppModals open={modal} setOpen={setModal} initialGameId={game.id} initialDate={game.date} />
    </AppShell>
  );
}
