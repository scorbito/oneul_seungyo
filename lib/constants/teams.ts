import type { Team } from "@/lib/types/domain";

export const teams: Team[] = [
  { id: "doosan", name: "두산 베어스", shortName: "두산", initial: "D", color: "#131230", accent: "#ED1C24" },
  { id: "lg", name: "LG 트윈스", shortName: "LG", initial: "L", color: "#C30452", accent: "#000000" },
  { id: "kt", name: "KT 위즈", shortName: "KT", initial: "K", color: "#000000", accent: "#EB1C24" },
  { id: "ssg", name: "SSG 랜더스", shortName: "SSG", initial: "S", color: "#CE0E2D", accent: "#FFB81C" },
  { id: "nc", name: "NC 다이노스", shortName: "NC", initial: "N", color: "#315288", accent: "#A77C40" },
  { id: "kiwoom", name: "키움 히어로즈", shortName: "키움", initial: "K", color: "#570514" },
  { id: "samsung", name: "삼성 라이온즈", shortName: "삼성", initial: "S", color: "#074CA1" },
  { id: "lotte", name: "롯데 자이언츠", shortName: "롯데", initial: "L", color: "#041E42", accent: "#ED1C24" },
  { id: "kia", name: "KIA 타이거즈", shortName: "KIA", initial: "K", color: "#EA0029", accent: "#06141F" },
  { id: "hanwha", name: "한화 이글스", shortName: "한화", initial: "H", color: "#FF6600", accent: "#07274C" }
];

export function getTeam(teamId: string): Team {
  const team = teams.find((item) => item.id === teamId);
  if (!team) {
    throw new Error(`Unknown team id: ${teamId}`);
  }
  return team;
}
