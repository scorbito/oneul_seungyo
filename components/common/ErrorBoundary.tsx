"use client";

import React from "react";

const RELOAD_KEY = "error-boundary.reloadAt";
const RELOAD_COOLDOWN_MS = 5_000; // 5초 안에 다시 에러 → 더 reload 안 함 (무한루프 방지)

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  willReload: boolean;
};

/** 클라이언트 사이드 에러(React #310 등)를 catch.
 *  - 첫 발생: 자동 새로고침 (대부분의 hydration mismatch / 캐시 충돌은 reload로 해소)
 *  - 짧은 시간 안에 반복 발생: reload 중단 + 사용자에게 안내 (무한루프 방지)
 *  - YouTube 등 외부 referrer 경유 진입 시 가끔 발생하는 hydration 충돌 대응. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, willReload: false };

  static getDerivedStateFromError(): State {
    return { hasError: true, willReload: false };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // 비-minified 에러 정보 콘솔에 덤프 (사용자가 캡처할 수 있도록)
    console.error("[ErrorBoundary]", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: info.componentStack
    });

    // 디버깅 중에는 auto-reload 비활성화 — 에러 페이지가 충분히 머물러야 콘솔 캡처 가능.
    // 원인 파악 후 다시 활성화 예정.
    this.setState({ willReload: false });
  }

  render() {
    if (this.state.hasError) {
      // reload 예정이면 스플래시 같은 다크 화면 (이미 보던 initial-loader와 비슷)
      // reload 중단되면 사용자에게 새로고침 권유.
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "#06101e",
            color: "#f7f9fc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: 24,
            textAlign: "center"
          }}
        >
          {this.state.willReload ? (
            <>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>잠시만요...</p>
              <p style={{ fontSize: 12, color: "rgba(247,249,252,0.55)", margin: 0 }}>
                화면을 다시 그리고 있어요.
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>일시적인 오류가 발생했어요</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  marginTop: 8,
                  padding: "10px 20px",
                  borderRadius: 12,
                  border: 0,
                  background: "#ff6a2b",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer"
                }}
              >
                다시 시도하기
              </button>
            </>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
