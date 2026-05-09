import type { ProfileStats, UserProfileRecord } from "@/lib/types/api-contracts";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentProfileFromDb(): Promise<UserProfileRecord | null> {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,nickname,main_team_id,main_team_changed_at,interest_team_ids,notifications_enabled,default_public_scope,avatar_image_url,created_at,updated_at")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    nickname: data.nickname,
    mainTeamId: data.main_team_id,
    mainTeamChangedAt: data.main_team_changed_at,
    interestTeamIds: data.interest_team_ids,
    notificationsEnabled: data.notifications_enabled,
    defaultPublicScope: data.default_public_scope,
    avatarImageUrl: data.avatar_image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function getCurrentProfileStatsFromDb(): Promise<ProfileStats | null> {
  const ssr = createSupabaseServerClient();
  const { data: authData, error: authError } = await ssr.auth.getUser();

  if (authError || !authData.user) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profile_stats")
    .select("attendance_count,wins,losses,draws,win_rate")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile stats: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    attendanceCount: data.attendance_count,
    wins: data.wins,
    losses: data.losses,
    draws: data.draws,
    winRate: data.win_rate > 0 ? `.${Math.round(data.win_rate * 1000).toString().padStart(3, "0")}` : ".000"
  };
}

