import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfileFromDb } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description");
  const next = searchParams.get("next");

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing-code`);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  if (next && next.startsWith("/")) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const profile = await getCurrentProfileFromDb().catch(() => null);
  return NextResponse.redirect(`${origin}${profile ? "/" : "/onboarding"}`);
}
