import { NextResponse, type NextRequest } from "next/server";
import { syncGamesInRange } from "@/lib/server/kbo/syncGames";

// Vercel 함수 시간 제한을 60초로 (기본 10초). 30일 × 200ms = 6초라 여유 충분.
export const maxDuration = 60;

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
 * - scope=week: 어제 ~ +30일 (먼 미래 일정도 자동 백필 — 이름은 호환성 위해 유지)
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
      // 어제 ~ +30일. KBO가 미래 일정을 추가 공개해도 한 달 안에 자동 흡수.
      to.setDate(today.getDate() + 30);
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
