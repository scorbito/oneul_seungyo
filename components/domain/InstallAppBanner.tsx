"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { InstallAppModal } from "@/components/domain/InstallAppModal";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";

const DISMISS_KEY = "install-banner.dismissedAt";
const COOLDOWN_DAYS = 30;
const SHOW_AFTER_MS = 30_000; // 첫 진입 30초 뒤

/** 하단 플로팅 설치 안내 바.
 *  - 이미 설치(standalone) → 표시 X
 *  - 30일 이내 닫은 적 있음 → 표시 X
 *  - 첫 진입 30초 뒤 슬라이드 업 등장
 *  - "설치방법" 클릭 → InstallAppModal 노출 (디바이스별 안내)
 *  - x 닫기 → localStorage에 dismissedAt 기록, 30일 안 보임 */
export function InstallAppBanner() {
  const { isStandalone, isIOS, isAndroid } = useInstallPrompt();
  const [visible, setVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // PWA 설치 후엔 절대 노출 X
    if (isStandalone) return;

    // 모바일 디바이스가 아니면 권유 의미 없음 (PC에선 설치 흐름이 다르고 효용도 작음)
    if (!isIOS && !isAndroid) return;

    // 최근 30일 안에 닫았으면 노출 X
    try {
      const dismissedAt = window.localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const elapsedMs = Date.now() - Number(dismissedAt);
        if (elapsedMs < COOLDOWN_DAYS * 24 * 60 * 60 * 1000) return;
      }
    } catch {
      // localStorage 차단 환경에선 그냥 노출.
    }

    const timer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [isStandalone, isIOS, isAndroid]);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  if (!visible) {
    return modalOpen ? <InstallAppModal open={modalOpen} onClose={() => setModalOpen(false)} /> : null;
  }

  return (
    <>
      <div className="install-banner" role="region" aria-label="앱으로 설치 안내">
        <div className="install-banner-icon" aria-hidden="true">
          <Download size={16} />
        </div>
        <div className="install-banner-text">
          <strong>홈 화면에 추가하면 더 편해요!</strong>
          <span>URL 바 없이 풀스크린으로 사용</span>
        </div>
        <button type="button" className="install-banner-cta" onClick={() => setModalOpen(true)}>
          설치방법
        </button>
        <button type="button" className="install-banner-dismiss" onClick={dismiss} aria-label="닫기">
          <X size={16} />
        </button>
      </div>
      <InstallAppModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
