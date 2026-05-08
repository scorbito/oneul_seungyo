"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthMode = "sign-in" | "sign-up";
type OAuthProvider = "google" | "kakao";

async function hasProfile(userId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`프로필 확인에 실패했습니다: ${error.message}`);
  }

  return Boolean(data);
}

export async function emailAuthAction(formData: FormData) {
  const mode = formData.get("mode")?.toString() as AuthMode | undefined;
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    redirect("/login?error=missing");
  }

  if (password.length < 6) {
    redirect("/login?error=short-password");
  }

  const supabase = createSupabaseServerClient();

  if (mode === "sign-up") {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }

    if (!data.session) {
      redirect("/login?notice=check-email");
    }

    redirect("/onboarding");
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "로그인에 실패했습니다.")}`);
  }

  redirect(await hasProfile(data.user.id) ? "/" : "/onboarding");
}

export async function signOutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/landing");
}

/** Google/카카오 OAuth 로그인 시작 — Supabase가 발급한 provider URL로 redirect */
export async function signInWithOAuthAction(provider: OAuthProvider) {
  const supabase = createSupabaseServerClient();
  const headerList = headers();
  const origin = headerList.get("origin")
    ?? (headerList.get("host") ? `https://${headerList.get("host")}` : null)
    ?? process.env.NEXT_PUBLIC_SITE_URL
    ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`
    }
  });

  if (error || !data?.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "OAuth 로그인 시작에 실패했습니다.")}`);
  }

  redirect(data.url);
}

