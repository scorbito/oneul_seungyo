import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/domain/LoginForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfileFromDb } from "@/lib/supabase/queries";

type LoginPageProps = {
  searchParams?: {
    error?: string;
    notice?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    const profile = await getCurrentProfileFromDb().catch(() => null);
    redirect(profile ? "/" : "/onboarding");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Image alt="마스코트" height={128} src="/assets/mascot-default.png" width={128} />
        <h1>로그인하고<br />내 기록을 시작하세요</h1>
        <button className="login-button kakao" disabled>카카오로 계속하기</button>
        <button className="login-button google" disabled>Google로 계속하기</button>
        <LoginForm error={searchParams?.error} notice={searchParams?.notice} />
        <p>로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.</p>
      </section>
    </main>
  );
}
