"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthMode = "sign-in" | "sign-up";

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

