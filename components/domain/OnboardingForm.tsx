"use client";

import Image from "next/image";
import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { teams } from "@/lib/constants/teams";
import { completeOnboardingAction } from "@/lib/actions/onboarding";

type OnboardingFormProps = {
  error?: string;
};

const errorMessages: Record<string, string> = {
  nickname: "닉네임은 2자 이상 입력해주세요.",
  team: "응원팀을 선택해주세요."
};

export function OnboardingForm({ error }: OnboardingFormProps) {
  const [nickname, setNickname] = useState("승요맨");
  const [mainTeamId, setMainTeamId] = useState("hanwha");

  return (
    <form action={completeOnboardingAction} className="onboarding-card">
      <input name="mainTeamId" type="hidden" value={mainTeamId} />
      <h1>내 직관 프로필을<br />설정해주세요</h1>
      <label className="nickname-field">
        <span>닉네임</span>
        <input
          aria-label="닉네임"
          maxLength={10}
          name="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
        />
        <em>{nickname.length}/10</em>
      </label>
      {error ? <p className="auth-message auth-message-error">{errorMessages[error] ?? error}</p> : null}
      <p>응원하는 팀을 선택하면 일정, 순위, 직관 기록이 모두 우리 팀 중심으로 보여요.</p>
      <div className="team-grid">
        {teams.map((team) => {
          const selected = team.id === mainTeamId;
          return (
            <button className={`team-choice ${selected ? "team-choice-selected" : ""}`} key={team.id} type="button" onClick={() => setMainTeamId(team.id)}>
              <span style={{ background: team.color }}>
                {team.initial}
              </span>
              <strong>{team.shortName}</strong>
              {selected ? <Check size={14} /> : null}
            </button>
          );
        })}
      </div>
      <Image alt="응원하는 마스코트" className="onboarding-mascot" height={120} src="/assets/mascot-cheer.png" width={120} />
      <Button>다음</Button>
    </form>
  );
}
