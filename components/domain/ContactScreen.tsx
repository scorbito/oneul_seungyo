import { HelpCircle, Mail } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

const SUPPORT_EMAIL = "support@oneul-seungyo.com";

export function ContactScreen() {
  const subject = encodeURIComponent("[오늘은 승요] 문의드립니다");
  const body = encodeURIComponent(
    "안녕하세요, 오늘은 승요 운영팀입니다. 아래 양식으로 작성해 주시면 빠르게 답변드릴게요.\n\n" +
      "■ 사용 기기 / 브라우저:\n■ 닉네임:\n■ 발생한 상황:\n■ 기대했던 동작:\n■ 스크린샷 (있다면 첨부):\n\n--- 위 안내 문구는 자유롭게 지우고 작성해 주세요 ---"
  );
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

  return (
    <AppShell activeTab="my" title="문의하기" theme="dark" backHref="/my/settings">
      <section className="contact-intro">
        <Mail size={32} className="contact-icon" />
        <h2>문의 전, 자주 묻는 질문부터 확인해 보세요</h2>
        <p>비슷한 문제가 이미 안내되어 있을 수 있어요. 그래도 해결되지 않으면 언제든 메일로 알려주세요.</p>
        <a className="contact-faq-link" href="/my/help">
          <HelpCircle size={15} />
          <span>이용안내 / 자주 묻는 질문 보기</span>
        </a>
      </section>

      <section className="contact-section">
        <h3>이메일로 문의</h3>
        <p className="contact-help">
          아래 버튼을 누르면 사용 중인 메일 앱이 열려요. 답변은 보통 1~3일 내에 드립니다.
        </p>
        <a className="contact-mail-button" href={mailto}>
          <Mail size={16} />
          <span>{SUPPORT_EMAIL} 으로 메일 보내기</span>
        </a>
        <p className="contact-fineprint">메일 앱이 열리지 않으면 위 주소로 직접 보내주세요.</p>
      </section>
    </AppShell>
  );
}
