import { MyScreen } from "@/components/domain/MyScreen";
import { getCurrentAuthAccountInfo, listAcceptedFriendsFromDb } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const [friends, accountInfo] = await Promise.all([
    listAcceptedFriendsFromDb().catch(() => []),
    getCurrentAuthAccountInfo().catch(() => null)
  ]);
  return <MyScreen friendsCount={friends.length} accountInfo={accountInfo} />;
}
