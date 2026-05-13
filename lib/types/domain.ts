export type Team = {
  id: string;
  name: string;
  shortName: string;
  initial: string;
  color: string;
  accent?: string;
};

export type TeamStanding = {
  teamId: string;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: string;
  gamesBehind: string;
  form: Array<"W" | "L" | "D">;
};

export type Game = {
  id: string;
  date: string;
  time: string;
  stadium: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "finished" | "canceled";
  attended?: boolean;
  verified?: boolean;
  result?: "win" | "lose" | "draw";
};

export type UserProfile = {
  nickname: string;
  mainTeamId: string;
  interestTeamIds: string[];
  avatarUrl?: string | null;
  attendanceCount: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: string;
};

export type Review = {
  id: string;
  ownerId?: string;     // DB 후기일 때만 채워짐. UI에서 본인 여부 체크에 사용.
  publicScope?: "public" | "friends" | "private";
  author: string;
  teamId: string;
  timeAgo: string;
  title: string;
  body: string;
  gameLabel: string;
  image: string;
  images?: string[];
  likes: number;
  comments: number;
  tags: string[];
  attendanceId?: string;
  createdAt?: string;
  authorAvatarUrl?: string | null;
  game?: {
    date: string;
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number | null;
    awayScore: number | null;
    stadium?: string;
    supportTeamId: string;
    result: "win" | "lose" | "draw" | null;
  };
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  publishedAt: string;
};

export type ReviewComment = {
  id: string;
  reviewId: string;
  userId: string;
  authorNickname: string;
  authorTeamId: string;
  authorAvatarUrl?: string | null;
  body: string;
  createdAt: string;
  timeAgo: string;
};
