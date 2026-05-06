import Image from "next/image";
import { Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Image alt="마스코트" height={128} src="/assets/mascot-default.png" width={128} />
        <h1>로그인하고<br />내 기록을 시작하세요</h1>
        <button className="login-button kakao">카카오로 계속하기</button>
        <button className="login-button google">Google로 계속하기</button>
        <button className="login-button email">
          <Mail size={16} />
          이메일로 계속하기
        </button>
        <p>로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.</p>
      </section>
    </main>
  );
}
