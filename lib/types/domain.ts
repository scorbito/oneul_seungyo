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
  status: "scheduled" | "finished";
  attended?: boolean;
  verified?: boolean;
  result?: "win" | "lose" | "draw";
};

export type UserProfile = {
  nickname: string;
  mainTeamId: string;
  interestTeamIds: string[];
  attendanceCount: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: string;
};
