import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/domain/OnboardingForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OnboardingPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?error=auth-required");
  }

  return (
    <main className="onboarding-page">
      <OnboardingForm error={searchParams?.error} />
    </main>
  );
}
