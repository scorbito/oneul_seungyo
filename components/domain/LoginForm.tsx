"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { emailAuthAction } from "@/lib/actions/auth";

type LoginFormProps = {
  error?: string;
  notice?: string;
};

const errorMessages: Record<string, string> = {
  missing: "이메일과 비밀번호를 입력해주세요.",
  "short-password": "비밀번호는 6자 이상이어야 합니다.",
  "auth-required": "로그인이 필요합니다."
};

const noticeMessages: Record<string, string> = {
  "check-email": "이메일 인증 링크를 확인한 뒤 다시 로그인해주세요."
};

export function LoginForm({ error, notice }: LoginFormProps) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  const message = error ? errorMessages[error] ?? error : notice ? noticeMessages[notice] ?? notice : "";

  return (
    <form action={emailAuthAction} className="email-login-form">
      <input name="mode" type="hidden" value={mode} />
      <div className="login-mode-tabs">
        <button className={mode === "sign-in" ? "login-mode-active" : ""} type="button" onClick={() => setMode("sign-in")}>
          로그인
        </button>
        <button className={mode === "sign-up" ? "login-mode-active" : ""} type="button" onClick={() => setMode("sign-up")}>
          가입
        </button>
      </div>
      <label>
        <span>이메일</span>
        <input autoComplete="email" name="email" placeholder="you@example.com" type="email" />
      </label>
      <label>
        <span>비밀번호</span>
        <input autoComplete={mode === "sign-in" ? "current-password" : "new-password"} name="password" placeholder="6자 이상" type="password" />
      </label>
      {message ? <p className={error ? "auth-message auth-message-error" : "auth-message"}>{message}</p> : null}
      <button className="login-button email" type="submit">
        <Mail size={16} />
        {mode === "sign-in" ? "이메일로 로그인" : "이메일로 가입"}
      </button>
    </form>
  );
}

