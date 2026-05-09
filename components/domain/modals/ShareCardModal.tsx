"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Link2, Share2, Sparkles } from "lucide-react";
import { ModalShell } from "@/components/common/ModalShell";
import { TeamBadge } from "@/components/common/TeamBadge";
import { getTeam } from "@/lib/constants/teams";
import type { UserProfile } from "@/lib/types/domain";
import { shareTemplates, type ShareTemplate } from "./modalHelpers";

type ShareCardModalProps = {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
};

export function ShareCardModal({ open, onClose, profile }: ShareCardModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ShareTemplate>(shareTemplates[0]);
  const [shareStatus, setShareStatus] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement | null>(null);

  const shareCard = async () => {
    if (!shareCardRef.current || isSharing) return;
    const team = getTeam(profile.mainTeamId);
    const text = `내 직관 승률 ${profile.winRate}\n${profile.wins}승 ${profile.losses}패 ${profile.draws}무 (${team.name} 응원)\n\n오늘은 승요`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const filename = `oneul-seungyo-${profile.winRate.replace(".", "")}.png`;

    setIsSharing(true);
    setShareStatus("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#06101e",
        logging: false
      });

      const dataUrl = canvas.toDataURL("image/png");
      if (!dataUrl || dataUrl === "data:,") throw new Error("canvas 변환 실패");

      const byteString = atob(dataUrl.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: "image/png" });
      const file = new File([blob], filename, { type: "image/png" });

      const isMobileShare =
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

      if (isMobileShare && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "오늘은 승요",
            text: `${text}\n${url}`
          });
          setShareStatus("공유했어요!");
          return;
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
        }
      }

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareStatus("이미지를 저장했고 텍스트는 클립보드에 복사됐어요.");
      } catch {
        setShareStatus("이미지를 저장했어요.");
      }
    } catch (err) {
      console.error("share failed:", err);
      setShareStatus("이미지 생성에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSharing(false);
    }
  };

  const copyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("링크가 복사됐어요!");
    } catch {
      setShareStatus("복사에 실패했어요.");
    }
  };

  return (
    <ModalShell open={open} title="공유하기" onClose={onClose} panelClassName="share-modal-panel">
      <div className="share-modal-content">
        <div className="share-card-preview" ref={shareCardRef}>
          {/* html2canvas 호환을 위해 일반 <img> 사용 (next/image fill은 캡처가 안정적이지 않음) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="공유 카드 배경" src={selectedTemplate.src} crossOrigin="anonymous" />
          <div className="share-card-overlay">
            <p className="share-card-label">내 직관 승률</p>
            <strong className="share-card-rate">{profile.winRate}</strong>
            <span className="share-card-stats">{profile.wins}승 {profile.losses}패 {profile.draws}무</span>
            <b className="share-card-team"><TeamBadge teamId={profile.mainTeamId} size="md" /> {getTeam(profile.mainTeamId).name}</b>
            <em className="share-card-brand">오늘은 승요 <span className="share-card-ball" aria-hidden="true">⚾</span></em>
          </div>
        </div>
        <div className="template-picker">
          {shareTemplates.map((template) => {
            const isActive = selectedTemplate.id === template.id;
            return (
              <button className={isActive ? "template-active" : ""} key={template.id} type="button" onClick={() => setSelectedTemplate(template)}>
                <span className="template-thumb">
                  <Image alt={template.label} height={76} src={template.src} width={48} />
                  {isActive ? <span className="template-check" aria-hidden="true">✓</span> : null}
                </span>
                <span>{template.label}</span>
              </button>
            );
          })}
        </div>
        <div className="share-actions">
          <button type="button" className="share-action-primary" disabled={isSharing} onClick={shareCard}>
            <Share2 size={18} />
            {isSharing ? "준비 중..." : "공유하기"}
          </button>
          <button type="button" className="share-action-secondary" onClick={copyLink}>
            <Link2 size={18} />
            링크 복사
          </button>
        </div>
        {shareStatus ? <p className="inline-success">{shareStatus}</p> : null}
        <p className="share-help">
          <span className="share-help-icon" aria-hidden="true"><Sparkles size={11} /></span>
          공유하면 더 많은 팬들과 기록을 나눌 수 있어요.
        </p>
      </div>
    </ModalShell>
  );
}
