import { ReviewDetailScreen } from "@/components/domain/ReviewDetailScreen";

export default function ReviewDetailPage({ params }: { params: { id: string } }) {
  return <ReviewDetailScreen id={params.id} />;
}
