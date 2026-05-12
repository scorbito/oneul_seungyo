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
      // 1) 웹 폰트 로딩 완료까지 대기 — 캡처 시 폰트가 빠진 채로 그려지는 것 방지
      if (typeof document !== "undefined" && "fonts" in document) {
        try {
          await (document as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready;
        } catch {
          // 폰트 API 미지원이면 무시
        }
      }

      // 2) 브라우저가 화면을 페인팅할 물리적 시간 확보 — 모바일에서 이게 중요
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 3) html-to-image로 원본 카드를 그대로 캡처. 복제/wrapper 없이 직접.
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        backgroundColor: "#06101e",
        width: 270,
        height: 480,
        canvasWidth: 270,
        canvasHeight: 480,
        style: {
          opacity: "1",
          visibility: "visible",
          transform: "scale(1)",
          transformOrigin: "top left",
          margin: "0",
          width: "270px",
          height: "480px"
        }
      });

      if (!dataUrl || dataUrl === "data:,") throw new Error("이미지 변환 실패");

      // 4) Data URL을 File로 변환
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/png" });

      const isMobileShare =
        typeof navigator !== "undefined" &&
        "share" in navigator &&
        (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

      // 5) 1순위: 이미지 포함 Web Share
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
          if ((err as Error)?.name === "AbortError") {
            setIsSharing(false);
            return;
          }
          // share 실패 시 다운로드 폴백으로 흘러감
        }
      }

      // 6) 2순위: 다운로드 + 텍스트 클립보드
      const objUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objUrl);

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
        {/* 공유 카드 — 모든 스타일을 인라인으로. 부모 CSS 컨텍스트 의존성 0.
            html-to-image가 원본을 그대로 캡처해도 미리보기와 1:1 일치 보장. */}
        <div
          ref={shareCardRef}
          style={{
            position: "relative",
            width: 270,
            height: 480,
            margin: "0 auto",
            borderRadius: 16,
            overflow: "hidden",
            background: "#1a2640",
            flexShrink: 0,
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)"
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="공유 카드 배경"
            src={selectedTemplate.src}
            crossOrigin="anonymous"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              textAlign: "center",
              padding: "26px 18px",
              boxSizing: "border-box",
              background: "linear-gradient(180deg, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.55) 100%)"
            }}
          >
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "rgba(255, 255, 255, 0.85)", letterSpacing: "0.2px" }}>
              내 직관 승률
            </p>
            <strong style={{ margin: 0, fontSize: 52, fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.05em", textShadow: "0 4px 18px rgba(0, 0, 0, 0.5)" }}>
              {profile.winRate}
            </strong>
            <span style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "rgba(255, 255, 255, 0.82)" }}>
              {profile.wins}승 {profile.losses}패 {profile.draws}무
            </span>
            <div style={{ margin: "4px 0 0" }}>
              <b
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px 4px 4px",
                  background: "rgba(0, 0, 0, 0.45)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#ffffff",
                  fontStyle: "normal",
                  whiteSpace: "nowrap",
                  lineHeight: 1
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    overflow: "hidden",
                    borderRadius: "50%"
                  }}
                >
                  <span style={{ transform: "scale(0.72)", transformOrigin: "center", display: "inline-flex" }}>
                    <TeamBadge teamId={profile.mainTeamId} size="sm" />
                  </span>
                </span>
                {getTeam(profile.mainTeamId).name}
              </b>
            </div>
          </div>
          {/* "오늘은 승요" 브랜드 — 카드 하단 고정 */}
          <em
            style={{
              position: "absolute",
              bottom: 48,
              left: 0,
              right: 0,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              fontStyle: "normal",
              fontSize: 17,
              fontWeight: 800,
              color: "#ff6a2b",
              letterSpacing: "-0.2px",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.4)"
            }}
          >
            오늘은 승요
            <svg aria-hidden="true" viewBox="0 0 24 24" width="19" height="19" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block" }}>
              <circle cx="12" cy="12" r="10" fill="#ffffff" stroke="#1a2640" strokeWidth="0.5" />
              <path d="M5 6 Q9 9 9.5 12 Q10 15 5.5 18" stroke="#ff2a2a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M19 6 Q15 9 14.5 12 Q14 15 18.5 18" stroke="#ff2a2a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
          </em>
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
