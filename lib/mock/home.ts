import type { Game, TeamStanding, UserProfile } from "@/lib/types/domain";

export const userProfile: UserProfile = {
  nickname: "승요맨",
  mainTeamId: "hanwha",
  interestTeamIds: ["lg", "doosan", "ssg"],
  attendanceCount: 62,
  wins: 37,
  losses: 23,
  draws: 2,
  winRate: ".617"
};

export const todayGame: Game = {
  id: "game-20250510-doosan-lg",
  date: "2025.05.10",
  time: "19:30",
  stadium: "잠실야구장",
  homeTeamId: "doosan",
  awayTeamId: "lg",
  status: "scheduled"
};

export const weekDays = [
  { label: "월", date: "4" },
  { label: "화", date: "5" },
  { label: "수", date: "6" },
  { label: "목", date: "7", badge: "승" },
  { label: "금", date: "8" },
  { label: "토", date: "9" },
  { label: "일", date: "10", active: true, badge: "직승" }
];

export const weekSeries = [
  { teamId: "hanwha", label: "한화전", startDay: 2, span: 3 },
  { teamId: "samsung", label: "삼성전", startDay: 5, span: 3 }
];

export const standings: TeamStanding[] = [
  { teamId: "samsung", rank: 1, wins: 45, draws: 2, losses: 30, winRate: ".600", gamesBehind: "-", form: ["W", "W", "L", "W", "W", "D", "W", "L", "W", "W"] },
  { teamId: "kia", rank: 2, wins: 44, draws: 1, losses: 31, winRate: ".587", gamesBehind: "1.0", form: ["W", "L", "W", "W", "W", "L", "W", "D", "W", "L"] },
  { teamId: "hanwha", rank: 3, wins: 42, draws: 2, losses: 32, winRate: ".568", gamesBehind: "2.5", form: ["W", "W", "W", "L", "D", "W", "L", "W", "W", "L"] },
  { teamId: "lg", rank: 4, wins: 42, draws: 4, losses: 31, winRate: ".554", gamesBehind: "3.0", form: ["L", "W", "W", "L", "W", "D", "L", "W", "W", "D"] },
  { teamId: "ssg", rank: 5, wins: 37, draws: 3, losses: 30, winRate: ".552", gamesBehind: "3.5", form: ["W", "L", "W", "D", "W", "L", "W", "W", "L", "W"] }
];
