"use server";

import { revalidatePath } from "next/cache";
import type { UpdateProfileInput } from "@/lib/types/api-contracts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function isSameKoreanDate(left: Date, right: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(left) === new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(right);
}

export async function updateProfileAction(input: UpdateProfileInput) {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: current, error: currentError } = await supabase
    .from("profiles")
    .select("main_team_id,main_team_changed_at")
    .eq("id", authData.user.id)
    .single();

  if (currentError) {
    throw new Error(`프로필을 불러오지 못했습니다: ${currentError.message}`);
  }

  const next: {
    nickname?: string;
    main_team_id?: string;
    main_team_changed_at?: string;
    interest_team_ids?: string[];
    notifications_enabled?: boolean;
    default_public_scope?: UpdateProfileInput["defaultPublicScope"];
  } = {};

  if (input.nickname !== undefined) next.nickname = input.nickname;
  if (input.interestTeamIds !== undefined) {
    if (input.interestTeamIds.length > 5) {
      throw new Error("관심팀은 최대 5개까지 선택할 수 있습니다.");
    }
    next.interest_team_ids = input.interestTeamIds;
  }
  if (input.notificationsEnabled !== undefined) next.notifications_enabled = input.notificationsEnabled;
  if (input.defaultPublicScope !== undefined) next.default_public_scope = input.defaultPublicScope;

  if (input.mainTeamId !== undefined && input.mainTeamId !== current.main_team_id) {
    if (current.main_team_changed_at && isSameKoreanDate(new Date(current.main_team_changed_at), new Date())) {
      throw new Error("내 팀은 하루에 한 번만 변경할 수 있습니다.");
    }
    next.main_team_id = input.mainTeamId;
    next.main_team_changed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("profiles")
    .update(next)
    .eq("id", authData.user.id);

  if (error) {
    throw new Error(`프로필 저장에 실패했습니다: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/my");
  revalidatePath("/my/settings");
}

