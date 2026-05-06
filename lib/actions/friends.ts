"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function sortFriendPair(userAId: string, userBId: string) {
  return userAId < userBId
    ? { user_a_id: userAId, user_b_id: userBId }
    : { user_a_id: userBId, user_b_id: userAId };
}

export async function sendFriendRequestAction(toUserId: string) {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { error } = await supabase.from("friend_requests").insert({
    from_user_id: authData.user.id,
    to_user_id: toUserId
  });

  if (error) {
    throw new Error(`친구 요청에 실패했습니다: ${error.message}`);
  }

  revalidatePath("/my/friends");
}

export async function respondFriendRequestAction(requestId: string, status: "accepted" | "rejected") {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data: request, error: requestError } = await supabase
    .from("friend_requests")
    .select("from_user_id,to_user_id,status")
    .eq("id", requestId)
    .eq("to_user_id", authData.user.id)
    .single();

  if (requestError) {
    throw new Error(`친구 요청을 찾을 수 없습니다: ${requestError.message}`);
  }

  if (request.status !== "pending") {
    throw new Error("이미 처리된 친구 요청입니다.");
  }

  const { error: updateError } = await supabase
    .from("friend_requests")
    .update({ status, responded_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) {
    throw new Error(`친구 요청 처리에 실패했습니다: ${updateError.message}`);
  }

  if (status === "accepted") {
    const { error: friendError } = await supabase
      .from("friends")
      .upsert(sortFriendPair(request.from_user_id, request.to_user_id));

    if (friendError) {
      throw new Error(`친구 추가에 실패했습니다: ${friendError.message}`);
    }
  }

  revalidatePath("/my/friends");
  revalidatePath("/community");
}

