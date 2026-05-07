import Image from "next/image";
import { Trophy } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <Image
        alt="해질녘 야구장"
        className="landing-bg"
        fill
        priority
        src="/assets/stadium-hero-vertical.png"
      />
      <div className="landing-shade" />
      <section className="landing-copy">
        <div className="landing-mark">
          <Trophy size={18} />
          오늘은 승요
        </div>
        <h1>내 직관 승률을 기록하고 공유하세요!</h1>
        <p>야구팬을 위한 직관 기록 & 커뮤니티</p>
        <div className="landing-actions">
          <a href="/login">
            <Button>시작하기</Button>
          </a>
          <a href="/login">
            <Button variant="ghost">로그인하기</Button>
          </a>
        </div>
      </section>
    </main>
  );
}
