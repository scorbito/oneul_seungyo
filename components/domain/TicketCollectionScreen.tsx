"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { getTeam } from "@/lib/constants/teams";
import type { TicketCollectionItem } from "@/app/my/tickets/page";

type Props = {
  items: TicketCollectionItem[];
};

export function TicketCollectionScreen({ items }: Props) {
  const [zoomedItem, setZoomedItem] = useState<TicketCollectionItem | null>(null);

  return (
    <AppShell activeTab="my" title="내 티켓 컬렉션">
      <a className="back-link" href="/my"><ArrowLeft size={18} /> 마이로 돌아가기</a>

      {items.length === 0 ? (
        <p className="empty-inline">아직 인증된 티켓이 없어요. 직관 등록 화면에서 티켓 사진으로 인증해 보세요!</p>
      ) : (
        <div className="ticket-grid">
          {items.map((item) => {
            const home = getTeam(item.homeTeamId);
            const away = getTeam(item.awayTeamId);
            const support = getTeam(item.supportTeamId);
            const resultLabel = item.result === "win" ? "승" : item.result === "lose" ? "패" : item.result === "draw" ? "무" : null;
            const score = item.homeScore !== null && item.awayScore !== null ? `${item.homeScore} : ${item.awayScore}` : null;
            return (
              <button
                key={item.id}
                className="ticket-card"
                type="button"
                onClick={() => setZoomedItem(item)}
                aria-label={`${item.gameDate} ${home.shortName} vs ${away.shortName} 티켓 보기`}
              >
                <div className="ticket-thumb">
                  <Image alt="티켓" src={item.signedUrl} fill sizes="(max-width: 480px) 50vw, 200px" style={{ objectFit: "cover" }} />
                  {resultLabel ? <span className={`ticket-result-badge ticket-result-${item.result}`}>{resultLabel}</span> : null}
                </div>
                <div className="ticket-meta">
                  <span className="ticket-date">{item.gameDate.replaceAll("-", ".")}</span>
                  <div className="ticket-teams">
                    <TeamBadge teamId={item.homeTeamId} size="sm" />
                    <strong>{home.shortName}</strong>
                    {score ? <em>{score}</em> : <em>vs</em>}
                    <strong>{away.shortName}</strong>
                    <TeamBadge teamId={item.awayTeamId} size="sm" />
                  </div>
                  <span className="ticket-stadium">{item.stadium} · {support.shortName} 응원</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {zoomedItem ? (
        <div
          role="dialog"
          aria-modal="true"
          className="ticket-zoom-overlay"
          onClick={() => setZoomedItem(null)}
        >
          <button className="ticket-zoom-close" type="button" aria-label="닫기" onClick={() => setZoomedItem(null)}>
            <X size={24} />
          </button>
          <div className="ticket-zoom-image-wrap" onClick={(e) => e.stopPropagation()}>
            <Image
              alt="티켓 원본"
              src={zoomedItem.signedUrl}
              width={800}
              height={1200}
              style={{ width: "100%", height: "auto", objectFit: "contain", borderRadius: 12 }}
            />
            <p className="ticket-zoom-caption">
              {zoomedItem.gameDate.replaceAll("-", ".")} · {getTeam(zoomedItem.homeTeamId).shortName} vs {getTeam(zoomedItem.awayTeamId).shortName} · {zoomedItem.stadium}
            </p>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
