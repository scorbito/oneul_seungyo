import { notFound } from "next/navigation";
import { MatchPostDetailScreen } from "@/components/domain/MatchPostDetailScreen";
import {
  getMatchPostByIdFromDb,
  listMatchPostCommentsFromDb
} from "@/lib/supabase/query-parts/matchPosts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MatchPostDetailPageProps = {
  params: { id: string };
};

export default async function MatchPostDetailPage({ params }: MatchPostDetailPageProps) {
  const [post, comments, auth] = await Promise.all([
    getMatchPostByIdFromDb(params.id),
    listMatchPostCommentsFromDb(params.id),
    createSupabaseServerClient().auth.getUser()
  ]);

  if (!post) notFound();

  const currentUserId = auth.data.user?.id ?? null;

  return (
    <MatchPostDetailScreen
      post={post}
      initialComments={comments}
      currentUserId={currentUserId}
    />
  );
}
