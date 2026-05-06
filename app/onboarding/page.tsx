import Image from "next/image";
import { Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { teams } from "@/lib/constants/teams";

export default function OnboardingPage() {
  return (
    <main className="onboarding-page">
      <section className="onboarding-card">
        <h1>내 직관 프로필을<br />설정해주세요</h1>
        <label className="nickname-field">
          <span>닉네임</span>
          <input defaultValue="승요맨" maxLength={10} aria-label="닉네임" />
          <em>3/10</em>
        </label>
        <p>응원하는 메인팀을 선택하면 팀 컬러가 앱 전체 액센트로 적용돼요.</p>
        <div className="team-grid">
          {teams.map((team, index) => (
            <button className={`team-choice ${index === 9 ? "team-choice-selected" : ""}`} key={team.id}>
              <span style={{ background: `linear-gradient(135deg, ${team.color}, ${team.accent ?? team.color})` }}>
                {team.initial}
              </span>
              <strong>{team.shortName}</strong>
              {index === 9 ? <Check size={14} /> : null}
            </button>
          ))}
        </div>
        <div className="interest-panel">
          <div>
            <strong>관심팀 선택</strong>
            <span>최대 5개</span>
          </div>
          <div className="interest-chips">
            <b>LG</b>
            <b>두산</b>
            <b>SSG</b>
            <em>3/5</em>
          </div>
        </div>
        <Image alt="응원하는 마스코트" className="onboarding-mascot" height={120} src="/assets/mascot-cheer.png" width={120} />
        <Button>다음</Button>
      </section>
    </main>
  );
}
