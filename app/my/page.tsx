import { MyScreen } from "@/components/domain/MyScreen";
import { listAcceptedFriendsFromDb } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const friends = await listAcceptedFriendsFromDb().catch(() => []);
  return <MyScreen friendsCount={friends.length} />;
}
