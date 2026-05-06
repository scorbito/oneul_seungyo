import { GameDetailScreen } from "@/components/domain/GameDetailScreen";

export default function GameDetailPage({ params }: { params: { id: string } }) {
  return <GameDetailScreen id={params.id} />;
}
