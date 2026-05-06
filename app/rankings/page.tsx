import { unstable_noStore as noStore } from "next/cache";
import { RankingsScreen } from "@/components/domain/RankingsScreen";
import { listStandingsFromDb } from "@/lib/supabase/queries";

export default async function RankingsPage() {
  noStore();
  const standings = await listStandingsFromDb(new Date().getFullYear()).catch(() => []);

  return <RankingsScreen standings={standings} />;
}
