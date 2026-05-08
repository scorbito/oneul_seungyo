"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

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

  // 익명 user인 경우 → 정식 전환(link)으로 분기
  const { data: existing } = await supabase.auth.getUser();
  if (existing?.user?.is_anonymous) {
    return linkAnonymousToEmailAction(formData);
  }

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

/**
 * 익명 로그인 시작 — Supabase 익명 user 생성 + 기본 프로필 row 생성.
 * 첫 진입 사용자의 가입 마찰을 0으로 만들어 "체험 → 가입" 흐름을 가능하게 함.
 * 성공 시 /onboarding으로 redirect (닉네임/팀 선택).
 */
export async function signInAnonymouslyAction() {
  const supabase = createSupabaseServerClient();

  // 이미 세션이 있으면 그대로 진행 (중복 익명 user 방지)
  const { data: existing } = await supabase.auth.getUser();
  if (existing?.user) {
    const profile = await hasProfile(existing.user.id);
    redirect(profile ? "/" : "/onboarding");
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data?.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "체험하기 시작에 실패했습니다.")}`);
  }

  // profiles 행 자동 생성 (admin client로 RLS 우회) — 닉네임/팀은 온보딩에서 채움
  const admin = createSupabaseAdminClient();
  await admin.from("profiles").upsert({
    id: data!.user!.id,
    nickname: `야구팬${data!.user!.id.slice(0, 5)}`,
    main_team_id: "doosan",
    interest_team_ids: [],
    notifications_enabled: true,
    default_public_scope: "public"
  }, { onConflict: "id" });

  redirect("/onboarding");
}

/** Google/카카오 OAuth 로그인 시작 — Supabase가 발급한 provider URL로 redirect.
 *  익명 user인 경우 자동으로 linkIdentity 흐름 사용 → user.id 유지하며 정식 전환. */
export async function signInWithOAuthAction(provider: OAuthProvider) {
  const supabase = createSupabaseServerClient();
  const headerList = headers();
  const origin = headerList.get("origin")
    ?? (headerList.get("host") ? `https://${headerList.get("host")}` : null)
    ?? process.env.NEXT_PUBLIC_SITE_URL
    ?? "http://localhost:3000";

  // 현재 익명 세션이 있으면 link 흐름, 아니면 일반 sign in
  const { data: authData } = await supabase.auth.getUser();
  const isAnonymous = Boolean(authData?.user?.is_anonymous);

  if (isAnonymous) {
    const { data, error } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: `${origin}/auth/callback?upgrade=1` }
    });
    if (error || !data?.url) {
      redirect(`/login?error=${encodeURIComponent(error?.message ?? "계정 연동에 실패했습니다.")}`);
    }
    redirect(data.url);
  }

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

/** 익명 user를 이메일/비번으로 정식 전환. user.id 유지. */
export async function linkAnonymousToEmailAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    redirect("/login?error=missing");
  }
  if (password.length < 6) {
    redirect("/login?error=short-password");
  }

  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    redirect("/login?error=auth-required");
  }
  if (!authData.user.is_anonymous) {
    // 이미 정식 user — 일반 흐름으로
    redirect("/");
  }

  // 1) 이메일·비번 부착 (Supabase가 verification 메일 발송)
  const { error } = await supabase.auth.updateUser({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // 익명 → 정식 전환 후엔 그대로 사용 가능 (메일 인증은 추후 회복용)
  redirect(await hasProfile(authData.user.id) ? "/?notice=upgraded" : "/onboarding");
}

