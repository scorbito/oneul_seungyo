import type { Team, TeamStanding } from "@/lib/types/domain";
import type { GameRecord, ProfileStats, UserProfileRecord } from "@/lib/types/api-contracts";
import type { AttendanceRecord } from "@/lib/state/AppState";
import type { Notice, Review, ReviewComment } from "@/lib/types/domain";
import { getTeam } from "@/lib/constants/teams";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

function toTeam(row: {
  id: string;
  name: string;
  short_name: string;
  initial: string;
  color: string;
  accent: string | null;
}): Team {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    initial: row.initial,
    color: row.color,
    accent: row.accent ?? undefined
  };
}

function toGame(row: {
  id: string;
  game_date: string;
  game_time: string | null;
  stadium: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: GameRecord["status"];
  innings: number | null;
}): GameRecord {
  return {
    id: row.id,
    date: row.game_date,
    time: row.game_time,
    stadium: row.stadium,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    homeScore: row.home_score ?? undefined,
    awayScore: row.away_score ?? undefined,
    status: row.status,
    innings: row.innings
  };
}

function toStanding(row: {
  team_id: string;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  games_behind: string;
  form: Array<"win" | "lose" | "draw">;
}): TeamStanding {
  const resultMap = {
    win: "W",
    lose: "L",
    draw: "D"
  } as const;
  const decisions = row.wins + row.losses;

  return {
    teamId: row.team_id,
    rank: row.rank,
    wins: row.wins,
    losses: row.losses,
    draws: row.draws,
    winRate: decisions > 0 ? `.${Math.round((row.wins / decisions) * 1000).toString().padStart(3, "0")}` : ".000",
    gamesBehind: row.games_behind,
    form: row.form.map((item) => resultMap[item])
  };
}

function getAttendanceResult(game: {
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
}, supportTeamId: string): AttendanceRecord["result"] {
  if (game.status !== "finished" || game.homeScore === undefined || game.awayScore === undefined) {
    return undefined;
  }

  if (game.homeScore === game.awayScore) {
    return "draw";
  }

  if (supportTeamId === game.homeTeamId) {
    return game.homeScore > game.awayScore ? "win" : "lose";
  }

  if (supportTeamId === game.awayTeamId) {
    return game.awayScore > game.homeScore ? "win" : "lose";
  }

  return undefined;
}

export async function listTeamsFromDb(): Promise<Team[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id,name,short_name,initial,color,accent")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load teams: ${error.message}`);
  }

  return data.map(toTeam);
}

export async function listGamesFromDb(params: { from: string; to: string; teamId?: string }): Promise<GameRecord[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("games")
    .select("id,game_date,game_time,stadium,home_team_id,away_team_id,home_score,away_score,status,innings")
    .gte("game_date", params.from)
    .lte("game_date", params.to)
    .order("game_date", { ascending: true })
    .order("game_time", { ascending: true });

  if (params.teamId) {
    query = query.or(`home_team_id.eq.${params.teamId},away_team_id.eq.${params.teamId}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load games: ${error.message}`);
  }

  return data.map(toGame);
}

export async function listStandingsFromDb(season: number): Promise<TeamStanding[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("team_standings")
    .select("team_id,rank,wins,losses,draws,games_behind,form")
    .eq("season", season)
    .order("rank", { ascending: true });

  if (error) {
    throw new Error(`Failed to load standings: ${error.message}`);
  }

  return data.map(toStanding);
}

export async function getCurrentProfileFromDb(): Promise<UserProfileRecord | null> {
  const supabase = createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,nickname,main_team_id,main_team_changed_at,interest_team_ids,notifications_enabled,default_public_scope,avatar_image_url,created_at,updated_at")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    nickname: data.nickname,
    mainTeamId: data.main_team_id,
    mainTeamChangedAt: data.main_team_changed_at,
    interestTeamIds: data.interest_team_ids,
    notificationsEnabled: data.notifications_enabled,
    defaultPublicScope: data.default_public_scope,
    avatarImageUrl: data.avatar_image_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function getCurrentProfileStatsFromDb(): Promise<ProfileStats | null> {
  const ssr = createSupabaseServerClient();
  const { data: authData, error: authError } = await ssr.auth.getUser();

  if (authError || !authData.user) {
    return null;
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("profile_stats")
    .select("attendance_count,wins,losses,draws,win_rate")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile stats: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    attendanceCount: data.attendance_count,
    wins: data.wins,
    losses: data.losses,
    draws: data.draws,
    winRate: data.win_rate > 0 ? `.${Math.round(data.win_rate * 1000).toString().padStart(3, "0")}` : ".000"
  };
}

export async function listCurrentAttendancesFromDb(): Promise<AttendanceRecord[]> {
  // 인증은 SSR 클라이언트로, DB 조회는 admin 클라이언트로 분리.
  // (@supabase/ssr가 PostgREST에 JWT를 일관되게 못 넘겨 RLS-protected SELECT가 빈 배열로 돌아오는 이슈 회피)
  const ssr = createSupabaseServerClient();
  const { data: authData, error: authError } = await ssr.auth.getUser();

  if (authError || !authData.user) {
    return [];
  }

  const admin = createSupabaseAdminClient();
  const { data: attendances, error: attendanceError } = await admin
    .from("attendances")
    .select("id,game_id,support_team_id,verified,memo,created_at")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (attendanceError) {
    throw new Error(`Failed to load attendances: ${attendanceError.message}`);
  }

  const gameIds = attendances.map((attendance) => attendance.game_id);
  if (gameIds.length === 0) {
    return [];
  }

  const { data: games, error: gameError } = await admin
    .from("games")
    .select("id,game_date,game_time,stadium,home_team_id,away_team_id,home_score,away_score,status")
    .in("id", gameIds);

  if (gameError) {
    throw new Error(`Failed to load attendance games: ${gameError.message}`);
  }

  const gamesById = new Map(games.map((game) => [game.id, game]));

  return attendances.flatMap((attendance) => {
    const game = gamesById.get(attendance.game_id);
    if (!game) {
      return [];
    }

    const homeScore = game.home_score;
    const awayScore = game.away_score;
    const status = game.status;
    const score = status === "finished" && homeScore !== null && awayScore !== null
      ? `${homeScore} : ${awayScore}`
      : "경기전";
    const mappedGame = {
      homeTeamId: game.home_team_id,
      awayTeamId: game.away_team_id,
      homeScore: homeScore ?? undefined,
      awayScore: awayScore ?? undefined,
      status
    };

    return [{
      id: attendance.id,
      date: game.game_date.replaceAll("-", "."),
      time: game.game_time ?? undefined,
      stadium: game.stadium,
      homeTeamId: game.home_team_id,
      awayTeamId: game.away_team_id,
      supportTeamId: attendance.support_team_id,
      score,
      result: getAttendanceResult(mappedGame, attendance.support_team_id),
      verified: attendance.verified,
      memo: attendance.memo ?? undefined
    }];
  });
}

type ReviewRow = {
  id: string;
  user_id: string;
  attendance_id: string;
  body: string;
  photos: string[];
  public_scope: "public" | "friends" | "private";
  created_at: string;
};

type ReviewProfileRow = {
  id: string;
  nickname: string;
  main_team_id: string;
  avatar_image_url?: string | null;
};

type ReviewAttendanceRow = {
  id: string;
  support_team_id: string;
  game_id: string;
};

function getTimeAgo(createdAt: string) {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function extractHashtags(body: string): string[] {
  const matches = body.match(/#[가-힣ㄱ-ㆎa-zA-Z0-9_]+/g) ?? [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const tag of matches) {
    if (!seen.has(tag)) {
      seen.add(tag);
      result.push(tag);
      if (result.length >= 20) break;
    }
  }
  return result;
}

function deriveGameResult(homeScore: number | null, awayScore: number | null, supportTeamId: string, homeTeamId: string, awayTeamId: string): "win" | "lose" | "draw" | null {
  if (homeScore === null || awayScore === null) return null;
  if (homeScore === awayScore) return "draw";
  if (supportTeamId === homeTeamId) return homeScore > awayScore ? "win" : "lose";
  if (supportTeamId === awayTeamId) return awayScore > homeScore ? "win" : "lose";
  return null;
}

function toReview(row: ReviewRow, profile: ReviewProfileRow | undefined, attendance: ReviewAttendanceRow | undefined, game: {
  game_date: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
} | undefined, commentCount = 0): Review {
  const homeName = game?.home_team_id ? getTeam(game.home_team_id).shortName : "";
  const awayName = game?.away_team_id ? getTeam(game.away_team_id).shortName : "";
  const score = game?.home_score !== null && game?.away_score !== null && game
    ? `${game.home_score} : ${game.away_score}`
    : "경기전";
  const date = game?.game_date ? game.game_date.replaceAll("-", ".") : "";
  const supportTeamId = attendance?.support_team_id ?? profile?.main_team_id ?? "lg";

  return {
    id: row.id,
    ownerId: row.user_id,
    author: profile?.nickname ?? "승요팬",
    teamId: supportTeamId,
    timeAgo: getTimeAgo(row.created_at),
    title: "",
    body: row.body,
    gameLabel: date && homeName && awayName ? `${date} · ${homeName} ${score} ${awayName}` : "",
    image: row.photos[0] ?? "/assets/mainherobg.png",
    images: row.photos.length > 0 ? row.photos : ["/assets/mainherobg.png"],
    likes: 0,
    comments: commentCount,
    tags: extractHashtags(row.body),
    attendanceId: row.attendance_id,
    createdAt: row.created_at,
    authorAvatarUrl: profile?.avatar_image_url ?? null,
    game: game ? {
      date,
      homeTeamId: game.home_team_id,
      awayTeamId: game.away_team_id,
      homeScore: game.home_score,
      awayScore: game.away_score,
      supportTeamId,
      result: deriveGameResult(game.home_score, game.away_score, supportTeamId, game.home_team_id, game.away_team_id)
    } : undefined
  };
}

export async function listReviewsFromDb(params: { onlyMine?: boolean; cursor?: string; limit?: number } = {}): Promise<Review[]> {
  const ssr = createSupabaseServerClient();
  const { data: authData } = await ssr.auth.getUser();
  const admin = createSupabaseAdminClient();

  let reviewQuery = admin
    .from("reviews")
    .select("id,user_id,attendance_id,body,photos,public_scope,created_at")
    .order("created_at", { ascending: false })
    .limit(params.limit ?? 20);

  if (params.cursor) {
    reviewQuery = reviewQuery.lt("created_at", params.cursor);
  }

  if (params.onlyMine) {
    if (!authData.user) {
      return [];
    }
    reviewQuery = reviewQuery.eq("user_id", authData.user.id);
  }

  const { data: reviews, error: reviewError } = await reviewQuery;

  if (reviewError) {
    throw new Error(`Failed to load reviews: ${reviewError.message}`);
  }

  if (reviews.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(reviews.map((review) => review.user_id)));
  const attendanceIds = Array.from(new Set(reviews.map((review) => review.attendance_id)));

  const [{ data: profiles, error: profileError }, { data: attendances, error: attendanceError }] = await Promise.all([
    admin.from("profiles").select("id,nickname,main_team_id,avatar_image_url").in("id", userIds),
    admin.from("attendances").select("id,support_team_id,game_id").in("id", attendanceIds)
  ]);

  if (profileError) {
    throw new Error(`Failed to load review profiles: ${profileError.message}`);
  }
  if (attendanceError) {
    throw new Error(`Failed to load review attendances: ${attendanceError.message}`);
  }

  const gameIds = Array.from(new Set(attendances.map((attendance) => attendance.game_id)));
  const { data: games, error: gameError } = await admin
    .from("games")
    .select("id,game_date,home_team_id,away_team_id,home_score,away_score")
    .in("id", gameIds);

  if (gameError) {
    throw new Error(`Failed to load review games: ${gameError.message}`);
  }

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const attendancesById = new Map(attendances.map((attendance) => [attendance.id, attendance]));
  const gamesById = new Map(games.map((game) => [game.id, game]));

  // 댓글 카운트
  const commentCounts = new Map<string, number>();
  const reviewIds = reviews.map((r) => r.id);
  if (reviewIds.length > 0) {
    const { data: commentRows } = await admin
      .from("review_comments")
      .select("review_id")
      .in("review_id", reviewIds);
    for (const c of commentRows ?? []) {
      commentCounts.set(c.review_id, (commentCounts.get(c.review_id) ?? 0) + 1);
    }
  }

  return reviews.map((review) => {
    const attendance = attendancesById.get(review.attendance_id);
    return toReview(
      review,
      profilesById.get(review.user_id),
      attendance,
      attendance ? gamesById.get(attendance.game_id) : undefined,
      commentCounts.get(review.id) ?? 0
    );
  });
}

export async function getReviewByIdFromDb(id: string): Promise<Review | null> {
  const admin = createSupabaseAdminClient();
  const { data: review, error } = await admin
    .from("reviews")
    .select("id,user_id,attendance_id,body,photos,public_scope,created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load review: ${error.message}`);
  if (!review) return null;

  const [{ data: profile }, { data: attendance }, { count: commentCount }] = await Promise.all([
    admin.from("profiles").select("id,nickname,main_team_id,avatar_image_url").eq("id", review.user_id).maybeSingle(),
    admin.from("attendances").select("id,support_team_id,game_id").eq("id", review.attendance_id).maybeSingle(),
    admin.from("review_comments").select("id", { count: "exact", head: true }).eq("review_id", id)
  ]);

  let game: { game_date: string; home_team_id: string; away_team_id: string; home_score: number | null; away_score: number | null } | undefined;
  if (attendance) {
    const { data: g } = await admin
      .from("games")
      .select("game_date,home_team_id,away_team_id,home_score,away_score")
      .eq("id", attendance.game_id)
      .maybeSingle();
    if (g) game = g;
  }

  return toReview(review, profile ?? undefined, attendance ?? undefined, game, commentCount ?? 0);
}

export async function listCommentsByReviewId(reviewId: string): Promise<ReviewComment[]> {
  const admin = createSupabaseAdminClient();
  const { data: rows, error } = await admin
    .from("review_comments")
    .select("id, review_id, user_id, body, created_at")
    .eq("review_id", reviewId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to load comments: ${error.message}`);
  if (!rows || rows.length === 0) return [];

  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, nickname, main_team_id, avatar_image_url")
    .in("id", userIds);
  const profilesById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return rows.map((row) => {
    const profile = profilesById.get(row.user_id);
    return {
      id: row.id,
      reviewId: row.review_id,
      userId: row.user_id,
      authorNickname: profile?.nickname ?? "승요팬",
      authorTeamId: profile?.main_team_id ?? "lg",
      authorAvatarUrl: profile?.avatar_image_url ?? null,
      body: row.body,
      createdAt: row.created_at,
      timeAgo: getTimeAgo(row.created_at)
    };
  });
}

function toNotice(row: {
  id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  published_at: string;
}): Notice {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    isPinned: row.is_pinned,
    publishedAt: row.published_at
  };
}

export async function listNoticesFromDb(): Promise<Notice[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .select("id, title, body, is_pinned, published_at")
    .lte("published_at", new Date().toISOString())
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) throw new Error(`공지 조회 실패: ${error.message}`);
  return (data ?? []).map(toNotice);
}

export async function getNoticeByIdFromDb(id: string): Promise<Notice | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .select("id, title, body, is_pinned, published_at")
    .eq("id", id)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw new Error(`공지 조회 실패: ${error.message}`);
  return data ? toNotice(data) : null;
}
