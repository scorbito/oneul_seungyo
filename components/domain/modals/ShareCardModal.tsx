"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

  // 상태 메시지는 3.5초 후 자동 사라짐
  useEffect(() => {
    if (!shareStatus) return;
    const t = window.setTimeout(() => setShareStatus(""), 3500);
    return () => window.clearTimeout(t);
  }, [shareStatus]);

  // 모달이 닫히면 상태 메시지 초기화 — 다음 진입 시 깔끔하게 시작
  useEffect(() => {
    if (!open) setShareStatus("");
  }, [open]);

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

      // 1) 배경 이미지를 JS Image 객체로 로드 후 canvas로 data URL 변환.
      //    fetch + crossOrigin 의존도 없이 same-origin 이미지를 안전하게 가져옴.
      //    모바일 사파리/PWA에서 html-to-image가 빈 이미지로 캡처하는 문제 회피.
      const bgDataUrl = await new Promise<string>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              reject(new Error("canvas context 생성 실패"));
              return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject(new Error("배경 이미지 로드 실패"));
        img.src = selectedTemplate.src;
      });

      // 2) html-to-image로 카드 캡처. 카드를 화면 밖에 복제하되 부모 클래스 체인
      //    (.phone-frame-dark > .share-modal-panel)을 재현해 CSS 셀렉터가 매칭되도록 함.
      const { toPng } = await import("html-to-image");
      const original = shareCardRef.current;
      const clone = original.cloneNode(true) as HTMLDivElement;

      // 복제본 안의 배경 <img> src를 data URL로 교체
      const cloneImg = clone.querySelector("img");
      if (cloneImg) {
        cloneImg.removeAttribute("crossorigin");
        cloneImg.src = bgDataUrl;
      }

      const frameWrap = document.createElement("div");
      frameWrap.className = "phone-frame-dark";
      frameWrap.style.cssText = "position: fixed; left: -10000px; top: 0; z-index: -1; pointer-events: none;";

      const panelWrap = document.createElement("div");
      panelWrap.className = "share-modal-panel";
      panelWrap.appendChild(clone);
      frameWrap.appendChild(panelWrap);
      document.body.appendChild(frameWrap);

      // 복제된 <img>가 새 src(data URL)로 디코드 완료될 때까지 대기
      if (cloneImg && !cloneImg.complete) {
        await new Promise<void>((resolve) => {
          cloneImg.onload = () => resolve();
          cloneImg.onerror = () => resolve();
        });
      }

      let dataUrl: string;
      try {
        dataUrl = await toPng(clone, {
          pixelRatio: 2,
          width: 270,
          height: 480,
          cacheBust: false,
          backgroundColor: "#06101e"
        });
      } finally {
        document.body.removeChild(frameWrap);
      }

      if (!dataUrl || dataUrl === "data:,") throw new Error("이미지 변환 실패");

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
          {/* html-to-image 호환을 위해 일반 <img> 사용 (next/image의 wrapper가 캡처를 방해함) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="공유 카드 배경" src={selectedTemplate.src} crossOrigin="anonymous" />
          <div className="share-card-overlay">
            <p className="share-card-label">내 직관 승률</p>
            <strong className="share-card-rate">{profile.winRate}</strong>
            <span className="share-card-stats">{profile.wins}승 {profile.losses}패 {profile.draws}무</span>
            <div className="share-card-team-row">
              <b className="share-card-team-pill"><TeamBadge teamId={profile.mainTeamId} size="md" /> {getTeam(profile.mainTeamId).name}</b>
            </div>
            <em className="share-card-brand">
              오늘은 승요
              <svg className="share-card-ball" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#ffffff" stroke="#1a2640" strokeWidth="0.5" />
                <path d="M5 6 Q9 9 9.5 12 Q10 15 5.5 18" stroke="#ff2a2a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                <path d="M19 6 Q15 9 14.5 12 Q14 15 18.5 18" stroke="#ff2a2a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
            </em>
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
