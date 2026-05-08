"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { listReviewsFromDb } from "@/lib/supabase/queries";
import type { Review } from "@/lib/types/domain";

export type CreateReviewActionInput = {
  attendanceId: string;
  body: string;
  photos: string[];
  publicScope: "public" | "friends" | "private";
};

/** review-photos 공개 URL에서 storage 내부 경로 추출 */
function extractReviewPhotoPath(url: string): string | null {
  const marker = "/storage/v1/object/public/review-photos/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function deleteReviewAction(reviewId: string) {
  const ssr = createSupabaseServerClient();
  const { data: authData, error: authError } = await ssr.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("로그인이 필요합니다.");
  }

  const admin = createSupabaseAdminClient();

  // 1) 사진 경로 미리 조회 (DB 삭제 후엔 못 봄)
  const { data: review, error: fetchError } = await admin
    .from("reviews")
    .select("photos")
    .eq("id", reviewId)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`후기 조회에 실패했습니다: ${fetchError.message}`);
  }
  if (!review) {
    throw new Error("후기를 찾을 수 없습니다.");
  }

  // 2) DB 행 삭제
  const { error: deleteError } = await admin
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", authData.user.id);

  if (deleteError) {
    throw new Error(`후기 삭제에 실패했습니다: ${deleteError.message}`);
  }

  // 3) Storage 파일 정리 (실패해도 본 트랜잭션은 성공으로 간주, 로그만 남김)
  const paths = ((review.photos ?? []) as string[])
    .map(extractReviewPhotoPath)
    .filter((p): p is string => Boolean(p));
  if (paths.length > 0) {
    const { error: storageError } = await admin.storage.from("review-photos").remove(paths);
    if (storageError) {
      console.warn(`[deleteReviewAction] storage cleanup failed for ${reviewId}:`, storageError.message);
    }
  }

  revalidatePath("/community");
  revalidatePath("/my");
  revalidatePath("/my/reviews");
  revalidatePath("/my/attendances");
}

export async function createReviewAction(input: CreateReviewActionInput) {
  const ssr = createSupabaseServerClient();
  const { data: authData, error: authError } = await ssr.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("로그인이 필요합니다.");
  }

  const body = input.body.trim();
  if (body.length < 5) {
    throw new Error("후기를 5자 이상 입력해주세요.");
  }

  const admin = createSupabaseAdminClient();
  const { data: attendance, error: attendanceError } = await admin
    .from("attendances")
    .select("id")
    .eq("id", input.attendanceId)
    .eq("user_id", authData.user.id)
    .single();

  if (attendanceError || !attendance) {
    throw new Error("후기를 작성할 직관 기록을 찾지 못했습니다.");
  }

  const { error } = await admin.from("reviews").insert({
    user_id: authData.user.id,
    attendance_id: attendance.id,
    body,
    photos: input.photos.length > 0 ? input.photos.slice(0, 3) : ["/assets/mainherobg.png"],
    public_scope: input.publicScope
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 이 직관에 작성한 후기가 있습니다.");
    }
    throw new Error(`후기 저장에 실패했습니다: ${error.message}`);
  }

  revalidatePath("/community");
  revalidatePath("/my/reviews");
  revalidatePath("/my/attendances");
}

/** 무한 스크롤용: 주어진 cursor(created_at) 이전 후기를 limit개 반환 */
export async function loadMoreReviewsAction(cursor: string, limit = 20): Promise<Review[]> {
  return listReviewsFromDb({ cursor, limit });
}

export type UpdateReviewActionInput = {
  reviewId: string;
  body: string;
  photos: string[];
  publicScope: "public" | "friends" | "private";
};

/** 본인 후기 수정 — 본문/사진/공개범위만 변경. 직관 매핑은 잠금. */
export async function updateReviewAction(input: UpdateReviewActionInput) {
  const ssr = createSupabaseServerClient();
  const { data: authData, error: authError } = await ssr.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("로그인이 필요합니다.");
  }

  const body = input.body.trim();
  if (body.length < 5) {
    throw new Error("후기를 5자 이상 입력해주세요.");
  }

  const admin = createSupabaseAdminClient();

  // 기존 행 + 사진 경로 조회 (소유자 확인 + 삭제될 사진 추출)
  const { data: existing, error: fetchError } = await admin
    .from("reviews")
    .select("photos,user_id")
    .eq("id", input.reviewId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`후기 조회에 실패했습니다: ${fetchError.message}`);
  }
  if (!existing) {
    throw new Error("후기를 찾을 수 없습니다.");
  }
  if (existing.user_id !== authData.user.id) {
    throw new Error("본인 후기만 수정할 수 있습니다.");
  }

  const nextPhotos = input.photos.length > 0 ? input.photos.slice(0, 3) : ["/assets/mainherobg.png"];

  const { error: updateError } = await admin
    .from("reviews")
    .update({
      body,
      photos: nextPhotos,
      public_scope: input.publicScope
    })
    .eq("id", input.reviewId)
    .eq("user_id", authData.user.id);

  if (updateError) {
    throw new Error(`후기 수정에 실패했습니다: ${updateError.message}`);
  }

  // 더 이상 사용되지 않는 이전 사진은 storage에서 정리
  const previousPhotos = (existing.photos ?? []) as string[];
  const stillUsed = new Set(nextPhotos);
  const toDelete = previousPhotos
    .filter((url) => !stillUsed.has(url))
    .map(extractReviewPhotoPath)
    .filter((p): p is string => Boolean(p));
  if (toDelete.length > 0) {
    const { error: storageError } = await admin.storage.from("review-photos").remove(toDelete);
    if (storageError) {
      console.warn(`[updateReviewAction] storage cleanup failed for ${input.reviewId}:`, storageError.message);
    }
  }

  revalidatePath("/community");
  revalidatePath("/my");
  revalidatePath("/my/reviews");
  revalidatePath(`/reviews/${input.reviewId}`);
}

