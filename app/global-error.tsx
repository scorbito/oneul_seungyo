"use client";

import { useEffect } from "react";

/** Next.js global error boundary — 루트 레이아웃 포함 어디에서 에러가 나도 catch.
 *  현재는 디버깅 목적으로 에러 메시지 + digest를 화면에 노출 (자동 reload 안 함). */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 콘솔에 비-minified 에러 정보 덤프 (브라우저 콘솔에서 확인 가능)
    console.error("[GlobalError]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      name: error.name
    });
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#06101e",
          color: "#f7f9fc",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24
        }}
      >
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>오류가 발생했어요</p>
          <p style={{ fontSize: 13, color: "rgba(247,249,252,0.65)", marginBottom: 18 }}>
            화면을 그리는 도중 문제가 생겼어요. 다시 시도해 보세요.
          </p>

          {/* 디버깅 정보 — 출시 후엔 숨기거나 ErrorBoundary 자동 reload로 전환 */}
          <details
            style={{
              textAlign: "left",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: 12,
              fontSize: 11,
              marginBottom: 18,
              color: "rgba(247,249,252,0.85)"
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: 700, marginBottom: 8 }}>
              개발자용 에러 정보
            </summary>
            <p style={{ margin: "4px 0", wordBreak: "break-all" }}>
              <strong>message:</strong> {error.message || "(no message)"}
            </p>
            {error.digest ? (
              <p style={{ margin: "4px 0" }}>
                <strong>digest:</strong> {error.digest}
              </p>
            ) : null}
            {error.name ? (
              <p style={{ margin: "4px 0" }}>
                <strong>name:</strong> {error.name}
              </p>
            ) : null}
            {error.stack ? (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  fontSize: 10,
                  margin: "8px 0 0",
                  maxHeight: 200,
                  overflowY: "auto",
                  color: "rgba(247,249,252,0.7)"
                }}
              >
                {error.stack}
              </pre>
            ) : null}
          </details>

          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "12px 28px",
              borderRadius: 12,
              border: 0,
              background: "#ff6a2b",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(255,106,43,0.32)"
            }}
          >
            다시 시도하기
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/landing";
              }
            }}
            style={{
              marginLeft: 8,
              padding: "12px 20px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "transparent",
              color: "rgba(247,249,252,0.85)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            홈으로
          </button>
        </div>
      </body>
    </html>
  );
}
