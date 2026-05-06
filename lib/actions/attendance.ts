"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export type CreateAttendanceActionInput = {
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  supportTeamId: string;
  memo?: string;
  ticketImageUrl?: string;
};

function toIsoDate(date: string) {
  return date.includes(".") ? date.replaceAll(".", "-") : date;
}

export async function createAttendanceAction(input: CreateAttendanceActionInput) {
  // Auth check via SSR client (auth.getUser is reliable through cookies).
  const ssr = createSupabaseServerClient();
  const { data: authData, error: authError } = await ssr.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("로그인이 필요합니다.");
  }

  // Use admin client for DB ops to avoid the @supabase/ssr cookie-to-PostgREST JWT
  // propagation quirk that intermittently breaks RLS-protected writes.
  const admin = createSupabaseAdminClient();

  const gameDate = toIsoDate(input.date);
  const { data: game, error: gameError } = await admin
    .from("games")
    .select("id")
    .eq("game_date", gameDate)
    .or(
      `and(home_team_id.eq.${input.homeTeamId},away_team_id.eq.${input.awayTeamId}),and(home_team_id.eq.${input.awayTeamId},away_team_id.eq.${input.homeTeamId})`
    )
    .limit(1)
    .maybeSingle();

  if (gameError) {
    throw new Error(`경기 조회에 실패했습니다: ${gameError.message}`);
  }

  if (!game) {
    throw new Error("선택한 경기 정보를 DB에서 찾지 못했습니다.");
  }

  const verified = Boolean(input.ticketImageUrl);
  const { error } = await admin.from("attendances").insert({
    user_id: authData.user.id,
    game_id: game.id,
    support_team_id: input.supportTeamId,
    ticket_image_url: input.ticketImageUrl || null,
    verified,
    verified_at: verified ? new Date().toISOString() : null,
    verified_method: verified ? "mock" : null,
    memo: input.memo || null
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 등록한 직관 경기입니다.");
    }
    throw new Error(`직관 저장에 실패했습니다: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/my");
  revalidatePath("/my/attendances");
}

/** 인증 사진 공개 URL 또는 storage path에서 storage 경로만 추출 */
function extractTicketImagePath(value: string): string | null {
  const marker = "/storage/v1/object/public/ticket-images/";
  const idx = value.indexOf(marker);
  if (idx >= 0) return value.slice(idx + marker.length);
  // attendance.ticket_image_url에 path만 저장된 케이스 (uploadUserFile이 ticket-images면 path 그대로 반환)
  if (!value.startsWith("http")) return value;
  return null;
}

export async function deleteAttendanceAction(attendanceId: string) {
  const ssr = createSupabaseServerClient();
  const { data: authData, error: authError } = await ssr.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("로그인이 필요합니다.");
  }

  const admin = createSupabaseAdminClient();

  // 1) 연결된 후기를 먼저 정리 (사진 storage 포함). reviews FK는 cascade라 DB는 자동이지만 storage 정리는 수동.
  const { data: review } = await admin
    .from("reviews")
    .select("photos")
    .eq("attendance_id", attendanceId)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (review?.photos && review.photos.length > 0) {
    const reviewMarker = "/storage/v1/object/public/review-photos/";
    const reviewPaths = (review.photos as string[])
      .map((url) => {
        const idx = url.indexOf(reviewMarker);
        return idx >= 0 ? url.slice(idx + reviewMarker.length) : null;
      })
      .filter((p): p is string => Boolean(p));
    if (reviewPaths.length > 0) {
      const { error: revStErr } = await admin.storage.from("review-photos").remove(reviewPaths);
      if (revStErr) console.warn(`[deleteAttendanceAction] review storage cleanup failed:`, revStErr.message);
    }
  }

  // 2) 티켓 이미지 path 미리 저장
  const { data: attendance, error: fetchErr } = await admin
    .from("attendances")
    .select("ticket_image_url")
    .eq("id", attendanceId)
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (fetchErr) {
    throw new Error(`직관 조회에 실패했습니다: ${fetchErr.message}`);
  }
  if (!attendance) {
    throw new Error("직관 기록을 찾을 수 없습니다.");
  }

  // 3) DB 행 삭제 (reviews는 attendances cascade로 같이 사라짐)
  const { error: deleteErr } = await admin
    .from("attendances")
    .delete()
    .eq("id", attendanceId)
    .eq("user_id", authData.user.id);
  if (deleteErr) {
    throw new Error(`직관 삭제에 실패했습니다: ${deleteErr.message}`);
  }

  // 4) 티켓 이미지 storage 정리
  if (attendance.ticket_image_url) {
    const ticketPath = extractTicketImagePath(attendance.ticket_image_url);
    if (ticketPath) {
      const { error: tStErr } = await admin.storage.from("ticket-images").remove([ticketPath]);
      if (tStErr) console.warn(`[deleteAttendanceAction] ticket storage cleanup failed:`, tStErr.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/my");
  revalidatePath("/my/attendances");
  revalidatePath("/my/reviews");
  revalidatePath("/community");
}

export async function findCurrentUserAttendanceId(input: {
  date: string;
  homeTeamId: string;
  awayTeamId: string;
}) {
  const ssr = createSupabaseServerClient();
  const { data: authData, error: authError } = await ssr.auth.getUser();

  if (authError || !authData.user) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const gameDate = toIsoDate(input.date);
  const { data: game, error: gameError } = await admin
    .from("games")
    .select("id")
    .eq("game_date", gameDate)
    .or(
      `and(home_team_id.eq.${input.homeTeamId},away_team_id.eq.${input.awayTeamId}),and(home_team_id.eq.${input.awayTeamId},away_team_id.eq.${input.homeTeamId})`
    )
    .limit(1)
    .maybeSingle();

  if (gameError || !game) {
    return null;
  }

  const { data: attendance, error } = await admin
    .from("attendances")
    .select("id")
    .eq("user_id", authData.user.id)
    .eq("game_id", game.id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return attendance?.id ?? null;
}
