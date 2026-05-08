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
    <main className="app-backdrop">
      <section className="phone-frame phone-frame-dark onboarding-frame" aria-label="온보딩">
        <div className="app-scroll">
          <div className="onboarding-bg-area" aria-hidden="true" />
          <OnboardingForm error={searchParams?.error} />
        </div>
      </section>
    </main>
  );
}
