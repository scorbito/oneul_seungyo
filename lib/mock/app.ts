import type { Game, TeamStanding } from "@/lib/types/domain";
import { standings as homeStandings } from "@/lib/mock/home";

export const scheduleGames: Game[] = [
  {
    id: "game-lg-doosan",
    date: "2025.05.10",
    time: "14:00",
    stadium: "잠실",
    homeTeamId: "lg",
    awayTeamId: "doosan",
    homeScore: 5,
    awayScore: 3,
    status: "finished",
    attended: true,
    verified: true,
    result: "win"
  },
  {
    id: "game-kia-lotte",
    date: "2025.05.10",
    time: "17:00",
    stadium: "사직",
    homeTeamId: "kia",
    awayTeamId: "lotte",
    status: "scheduled"
  },
  {
    id: "game-ssg-samsung",
    date: "2025.05.10",
    time: "17:00",
    stadium: "대구",
    homeTeamId: "ssg",
    awayTeamId: "samsung",
    status: "scheduled"
  },
  {
    id: "game-kt-hanwha",
    date: "2025.05.10",
    time: "17:00",
    stadium: "수원",
    homeTeamId: "kt",
    awayTeamId: "hanwha",
    status: "scheduled"
  }
];

export const allStandings: TeamStanding[] = [
  ...homeStandings,
  { teamId: "kt", rank: 6, wins: 34, draws: 2, losses: 32, winRate: ".515", gamesBehind: "6.0", form: ["L", "W", "L", "W", "D", "W", "L", "W", "L", "W"] },
  { teamId: "nc", rank: 7, wins: 32, draws: 3, losses: 31, winRate: ".492", gamesBehind: "8.5", form: ["W", "D", "L", "L", "W", "W", "L", "D", "W", "L"] },
  { teamId: "doosan", rank: 8, wins: 29, draws: 6, losses: 32, winRate: ".446", gamesBehind: "12.0", form: ["L", "L", "W", "D", "L", "W", "D", "L", "W", "L"] },
  { teamId: "lotte", rank: 9, wins: 28, draws: 7, losses: 31, winRate: ".431", gamesBehind: "13.0", form: ["W", "L", "D", "L", "L", "W", "L", "D", "L", "W"] },
  { teamId: "kiwoom", rank: 10, wins: 24, draws: 1, losses: 41, winRate: ".369", gamesBehind: "20.5", form: ["L", "L", "L", "W", "L", "D", "L", "L", "W", "L"] }
];

export type Review = {
  id: string;
  author: string;
  teamId: string;
  timeAgo: string;
  title: string;
  body: string;
  gameLabel: string;
  image: string;
  likes: number;
  comments: number;
  tags: string[];
  attendanceId?: string;
};

export const reviews: Review[] = [
  {
    id: "review-1",
    author: "야구광이123",
    teamId: "lg",
    timeAgo: "1시간 전",
    title: "오늘도 승요! 짜릿 역전승!",
    body: "7회말 오스틴의 2타점 2루타로 경기 분위기가 확 바뀌었어요. 직관 오길 잘했습니다.",
    gameLabel: "2025.05.10 · LG 5 : 3 두산",
    image: "/assets/stadium-review-sunset.png",
    likes: 128,
    comments: 24,
    tags: ["#짜릿한역전", "#잠실직관", "#LG트윈스"],
    attendanceId: "att-1"
  },
  {
    id: "review-2",
    author: "승요팬",
    teamId: "doosan",
    timeAgo: "3시간 전",
    title: "수비가 빛난 경기",
    body: "졌지만 외야 호수비는 정말 오래 기억날 것 같아요. 다음 직관은 꼭 이기길!",
    gameLabel: "2025.05.10 · LG 5 : 3 두산",
    image: "/assets/stadium-review-day.png",
    likes: 96,
    comments: 18,
    tags: ["#두산베어스", "#잠실야구장"]
  },
  {
    id: "review-3",
    author: "불꽃직관",
    teamId: "hanwha",
    timeAgo: "어제",
    title: "응원석 분위기 최고",
    body: "야간 경기 조명 아래에서 응원가 부르는 맛이 확실히 있네요.",
    gameLabel: "2025.05.09 · 한화 4 : 2 KT",
    image: "/assets/stadium-review-night.png",
    likes: 74,
    comments: 12,
    tags: ["#한화이글스", "#야간경기"]
  }
];

export const myAttendances = [
  { id: "att-upcoming-1", date: "2025.05.17", time: "14:00", stadium: "잠실", homeTeamId: "lg", awayTeamId: "hanwha", supportTeamId: "lg", score: "-", verified: false },
  { id: "att-upcoming-2", date: "2025.05.24", time: "18:00", stadium: "대전", homeTeamId: "hanwha", awayTeamId: "kia", supportTeamId: "hanwha", score: "-", verified: false },
  { id: "att-1", date: "2025.05.10", stadium: "잠실", homeTeamId: "doosan", awayTeamId: "lg", supportTeamId: "lg", score: "5 : 3", result: "lose", verified: true },
  { id: "att-2", date: "2025.05.08", stadium: "수원", homeTeamId: "kt", awayTeamId: "lg", supportTeamId: "lg", score: "2 : 6", result: "win", verified: true },
  { id: "att-3", date: "2025.05.06", stadium: "사직", homeTeamId: "lotte", awayTeamId: "lg", supportTeamId: "lg", score: "1 : 4", result: "win", verified: true },
  { id: "att-4", date: "2025.05.02", stadium: "문학", homeTeamId: "ssg", awayTeamId: "nc", supportTeamId: "ssg", score: "3 : 2", result: "win", verified: false },
  { id: "att-5", date: "2025.04.30", stadium: "대전", homeTeamId: "hanwha", awayTeamId: "kia", supportTeamId: "hanwha", score: "7 : 12", result: "lose", verified: true }
];
