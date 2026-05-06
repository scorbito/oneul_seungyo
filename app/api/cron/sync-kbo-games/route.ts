import { NextResponse, type NextRequest } from "next/server";
import { syncGamesInRange } from "@/lib/server/kbo/syncGames";

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

function kstNow(): Date {
  // Convert to KST regardless of host timezone
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}

/**
 * KBO 일정/스코어 동기화 cron.
 * - scope=today (default): 어제 ~ 오늘 (자정 직후 어제 라이브 finalize 보장)
 * - scope=week: 어제 ~ +6일
 * - scope=range&from=YYYY-MM-DD&to=YYYY-MM-DD: 명시 범위
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") ?? "today";

  let from: Date;
  let to: Date;

  if (scope === "range") {
    const fromStr = url.searchParams.get("from");
    const toStr = url.searchParams.get("to");
    if (!fromStr || !toStr) {
      return NextResponse.json({ ok: false, error: "from and to required for scope=range" }, { status: 400 });
    }
    from = new Date(`${fromStr}T00:00:00+09:00`);
    to = new Date(`${toStr}T00:00:00+09:00`);
  } else {
    const today = kstNow();
    from = new Date(today);
    from.setDate(today.getDate() - 1);
    to = new Date(today);
    if (scope === "week") {
      to.setDate(today.getDate() + 6);
    }
  }

  try {
    const results = await syncGamesInRange(from, to, { delayMs: 200 });
    const totals = results.reduce(
      (acc, r) => ({ inserted: acc.inserted + r.inserted, updated: acc.updated + r.updated }),
      { inserted: 0, updated: 0 }
    );
    return NextResponse.json({ ok: true, scope, totals, results });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
