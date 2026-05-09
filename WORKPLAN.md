# 오늘은 승요 작업계획서

이 문서는 다른 Codex 세션이나 작업자가 문서만 보고 이어서 개발할 수 있도록 작성한 실행 계획이다. 작업자는 각 단계 시작/완료 시 체크박스를 갱신하고, 단계 종료마다 리뷰어 에이전트 검수를 남긴다.

## 0. 기준 자료

- 기획/디자인 브리프: `data/design_brief.md`
- 디자인 시안 PNG 4장: `data/ChatGPT Image 2026년 5월 5일 오후 06_14_00 (*.png)`
- 사용 가능 이미지 어셋: `data/assets/*.png`
- KBO 구단 로고는 저작권/상표 이슈를 피하기 위해 사용하지 않는다.
- 팀 표현은 팀명, 팀 컬러, 이니셜, 간단한 추상 배지로 대체한다.

## 1. 제품 방향

모바일 우선 반응형 웹앱 "오늘은 승요"를 구현한다. 핵심 경험은 KBO 직관 기록, 내 직관 승률 자랑, 일정 확인, 커뮤니티 피드다.

우선 구현 대상은 MVP UI 목업이지만, 이후 실제 데이터/인증/배포까지 같은 코드베이스에서 확장할 수 있도록 처음부터 Next.js 기반으로 만든다. 실제 백엔드 연동 전까지는 mock data를 사용하고, 화면/컴포넌트/API 경계를 먼저 안정화한다.

## 2. 디자인 원칙

- 모바일 기준 폭은 360-414px, 데스크톱은 가운데 모바일 프레임 또는 확장 레이아웃을 제공한다.
- 전체 톤은 밝고 경쾌한 스포츠 앱이다.
- 카드 기반, 여백 12-16px, 얇은 border, 부드러운 shadow를 사용한다.
- Primary color는 `#FF6B35`를 기준으로 한다.
- 숫자 통계는 큰 크기와 굵은 weight로 가장 먼저 보이게 한다.
- KBO 로고/구단 로고/상표 이미지는 사용하지 않는다.
- 구단 배지는 CSS 기반 원형/방패형 마크, 팀 컬러, 짧은 이니셜로 만든다.
- UI 텍스트와 컴포넌트는 이미지가 아니라 HTML/CSS로 구현한다.
- GPT 생성 이미지는 배경/마스코트/후기 이미지/공유 카드 배경에만 사용한다.

## 3. 어셋 사용 계획

현재 `data/assets`에는 10개의 이미지가 있다. 파일명은 길고 공백이 많으므로 구현 단계에서 `public/assets`로 복사하며 짧은 이름으로 정리한다.

권장 매핑:

| 용도 | 원본 후보 | 구현 파일명 예시 |
|---|---|---|
| 마스코트 기본 | `...06_37_55 (1).png` | `mascot-default.png` |
| 마스코트 환호 | `...06_37_55 (2).png` | `mascot-cheer.png` |
| 마스코트 배트 | `...06_37_55 (3).png` | `mascot-bat.png` |
| 랜딩 세로 야구장 | `...06_37_56 (4).png` | `stadium-hero-vertical.png` |
| 후기 썸네일 1 | `...06_37_56 (5).png` | `stadium-review-day.png` |
| 후기 썸네일 2 | `...06_37_56 (6).png` | `stadium-review-sunset.png` |
| 후기 썸네일 3 | `...06_37_56 (7).png` | `stadium-review-night.png` |
| 공유 배경 네이비/레드 | `...06_37_56 (8).png` | `share-bg-navy-red.png` |
| 공유 배경 그린 | `...06_37_56 (9).png` | `share-bg-field.png` |
| 공유 배경 화이트 | `...06_37_56 (10).png` | `share-bg-white.png` |

주의:

- 마스코트 3장은 투명 배경처럼 보이지만 실제 alpha 채널이 없다. 체크무늬가 보이면 배경 제거본을 생성하거나 밝은 카드 안에서 crop 처리한다.
- 추가 어셋이 필요하면 Codex 이미지 생성 도구로 만든 뒤 이 문서의 어셋 표를 갱신한다.

## 4. 권장 기술 스택

초기 스캐폴딩 당시의 권장 스택은 아래와 같았고, 현재 코드베이스도 이 방향을 유지하되 Supabase/Auth/Storage, KBO 동기화, Gemini Vision, PWA, Vercel 배포 준비까지 확장된 상태다.

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react 아이콘
- Supabase Auth/DB/Storage
- Service-role server action 패턴 (인증은 SSR client, 사용자 데이터 read/write는 admin client)
- Gemini Vision 기반 티켓 OCR/매칭
- KBO 일정/순위 동기화 route handler + cron
- PWA manifest + Vercel 배포

네트워크 제한이 있을 수 있으므로 패키지 설치가 막히면 사용자 승인 후 진행한다. 신규 의존성을 추가할 때도 최종 목표 스택은 Next.js/Supabase/Vercel 기준으로 유지한다.

## 5. 단계별 작업 계획

각 단계는 "구현", "자체 테스트", "리뷰어 검수", "문서 갱신" 순서로 끝낸다.

### Phase 1. 프로젝트 스캐폴딩

목표: 앱을 실행할 수 있는 기본 개발 환경을 만든다.

작업:

- [x] Next.js TypeScript 프로젝트 생성
- [x] App Router 구조 설정
- [x] 기본 폴더 구조 생성
- [x] lint/build/dev script 정리
- [x] Pretendard 폰트 적용 방식 결정
- [x] 이미지 어셋을 `public/assets`에 짧은 파일명으로 정리
- [x] README에 실행 방법 작성

권장 구조:

```text
app/
  page.tsx
  schedule/
  community/
  my/
  rankings/
  games/[id]/
  reviews/[id]/
components/
  common/
  layout/
  domain/
lib/
  mock/
  types/
  constants/
public/
  assets/
styles/
  globals.css
```

라우트 초안:

```text
/
/schedule
/community
/my
/rankings
/games/[id]
/reviews/[id]
/attendance/new
/reviews/new
```

초기에는 모달을 client state로 구현하되, 실제 서비스 전환 시 직접 링크가 필요한 액션은 병렬 라우트 또는 별도 페이지로 확장할 수 있게 컴포넌트를 분리한다.

테스트:

- [x] `npm run build`
- [x] `npm run lint` 또는 가능한 정적 검사
- [x] dev server 실행 확인

리뷰어 검수:

- [x] 리뷰어 에이전트가 `data/design_brief.md`와 이 문서를 기준으로 구조/명령/어셋 정리를 검토 (2026-05-06 Phase 1-6 통합 리뷰)
- [x] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Completed / Reviewed

### Phase 2. 디자인 토큰과 공통 컴포넌트

목표: 화면 구현 전에 반복 UI와 색상/타이포 체계를 고정한다.

작업:

- [x] 색상 토큰 정의: primary, background, surface, text, subtle, win, lose, draw, verified
- [x] 팀 컬러 토큰 정의
- [x] `TeamBadge` 구현: 로고 없이 팀 컬러와 이니셜로 표시
- [x] `AppShell` 구현: 모바일 프레임, header, bottom tab bar, desktop side nav
- [x] `Button`, `Card`, `SegmentedControl`, `FilterChips`, `ModalShell` 구현
- [x] `WinRateHeroCard`, `GameCard`, `TeamRankRow`, `ReviewCard`, `ShareCard` 구현
- [x] mock data 작성: 팀, 순위, 경기, 직관 기록, 후기, 사용자
- [x] `lib/types`에 실제 DB 전환을 고려한 도메인 타입 정의

테스트:

- [ ] 공통 컴포넌트가 360px/414px에서 깨지지 않는지 확인
- [ ] 텍스트 overflow 확인
- [ ] 팀 로고 대신 배지 표시가 일관적인지 확인

리뷰어 검수:

- [x] 리뷰어 에이전트가 KBO 로고 미사용, 디자인 토큰 일관성, 컴포넌트 재사용성을 검토 (2026-05-06 Phase 1-6 통합 리뷰)
- [x] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Completed / Reviewed

### Phase 3. 홈/랜딩/온보딩 화면

목표: 첫 진입부터 홈 핵심 경험까지 구현한다.

작업:

- [x] 랜딩 화면: 세로 야구장 배경, 시작/로그인 CTA
- [x] 로그인 화면: 카카오/구글/이메일 버튼 UI만 구현
- [x] 온보딩 닉네임 설정
- [x] 온보딩 메인팀 선택: 10팀 배지 카드 그리드
- [x] 온보딩 관심팀 선택: 최대 5개 선택 상태
- [x] 홈 빈 상태: 마스코트/CTA
- [x] 홈 직관 있음: 승률 히어로, 오늘 경기 배너, 미니 주간 캘린더, 팀 순위

테스트:

- [x] 360px, 414px, 768px 폭에서 레이아웃 확인
- [x] 홈 히어로 숫자가 화면 최우선 요소로 보이는지 확인
- [x] 하단 탭이 모바일에서 고정되는지 확인

리뷰어 검수:

- [x] 리뷰어 에이전트가 이미지 시안 1번과 비교해 홈/진입 화면 유사도와 사용성을 검토 (2026-05-06 Phase 1-6 통합 리뷰)
- [x] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Completed / Reviewed

### Phase 4. 일정/경기 상세/팀 순위

목표: 일정 확인부터 경기 상세, 팀 순위 페이지까지 구현한다.

작업:

- [x] 일정 메인: 월간/주간 토글
- [x] 월간 캘린더 셀 배지: 경기 있음, 내 직관, 인증, 승/패/무
- [x] 선택일 상세 패널
- [x] 경기 상세: 스코어 보드, 이닝 스코어, 경기 정보, 직관 요약
- [x] 팀 순위 페이지: 전체/홈/원정 탭, 최근 10경기 폼, 홈/원정 성적

테스트:

- [x] 캘린더 셀 내용이 겹치지 않는지 확인
- [x] 팀 순위 테이블이 모바일에서 가독성 유지되는지 확인
- [x] 뒤로가기/탭 이동 상태 확인

리뷰어 검수:

- [x] 리뷰어 에이전트가 이미지 시안 2번과 비교해 일정/순위 UI 유사도와 정보 밀도를 검토 (2026-05-06 Phase 1-6 통합 리뷰)
- [x] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Completed / Reviewed (게임 상세는 Phase 8.7에서 보류)

### Phase 5. 커뮤니티/마이/설정 계열

목표: 피드와 개인 기록 관리 화면을 구현한다.

작업:

- [x] 커뮤니티 피드: 필터 칩, 후기 카드 세로 스크롤
- [x] 후기 상세: 이미지, 경기 메타, 본문, 좋아요/공유
- [x] 마이 메인: 프로필 카드, 내 팀/관심팀, 통계, 메뉴
- [x] 내 직관 리스트: 인증/미인증 필터
- [x] 내 후기 모음
- [x] 친구 관리
- [x] 설정

테스트:

- [x] 후기 카드 이미지 비율 고정 확인
- [x] 목록 아이템 터치 영역 확인
- [x] 긴 닉네임/긴 후기 제목 overflow 확인

리뷰어 검수:

- [x] 리뷰어 에이전트가 이미지 시안 3번과 비교해 피드/마이 화면 유사도와 목록 사용성을 검토 (2026-05-06 Phase 1-6 통합 리뷰)
- [x] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Completed / Reviewed

### Phase 6. 모달과 공유 카드

목표: 핵심 액션인 직관 등록, 후기 작성, 공유 카드 생성을 구현한다.

작업:

- [x] 직관 등록 모달: 날짜, 경기 선택, 응원팀, 티켓 사진, 메모
- [x] 후기 작성 모달: 사진 1-3장, 자동 경기 메타, 본문, 공개 범위
- [x] 공유 카드 모달: 9:16 미리보기, 템플릿 3종, 카카오/인스타/저장 버튼
- [x] 공유 카드 배경 이미지 적용
- [x] 모달 desktop/mobile 동작 분기
- [x] 실제 서비스 전환을 위해 submit handler를 mock action 함수로 분리

테스트:

- [x] 모바일에서 전체 화면 모달로 보이는지 확인
- [x] 데스크톱에서 중앙 dialog로 보이는지 확인
- [x] 공유 카드 9:16 비율이 유지되는지 확인
- [x] 입력 요소 focus/scroll 동작 확인

리뷰어 검수:

- [x] 리뷰어 에이전트가 이미지 시안 4번과 비교해 모달/공유 카드/디자인 시스템 준수 여부를 검토 (2026-05-06 Phase 1-6 통합 리뷰)
- [x] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Completed / Reviewed

### Phase 6.5. 프론트 인터랙션 완성

목표: 실제 API/DB 연결 전에 mock data와 client state만으로 앱이 충분히 작동하는 상태를 만든다. 이 단계가 끝나면 Phase 7 이후에는 데이터 모델/API/저장소 연결에 집중할 수 있어야 한다.

원칙:

- 실제 서버 저장은 하지 않는다.
- mock data를 화면별 하드코딩에서 상태 기반 데이터 흐름으로 옮긴다.
- 나중에 API로 교체하기 쉽도록 타입과 submit handler 경계를 유지한다.
- 디자인 레이아웃을 해치지 않는 범위에서 클릭/선택/입력/피드백 상태를 구현한다.

작업:

- [x] 전역 또는 상위 client state 구조 정의: 직관, 후기, 좋아요, 저장, 설정, 선택 날짜
- [x] 직관 등록 모달 인터랙션: 날짜 선택, 경기 선택, 응원팀 선택, 사진 미리보기, 메모 입력
- [x] 직관 등록 완료 시 mock 직관 목록 추가, 홈 승률/직관 수 반영, 공유 카드 모달 자동 노출
- [x] 후기 작성 모달 인터랙션: 사진 1-3장 선택/삭제, 공개 범위 선택, 본문 입력
- [x] 후기 등록 완료 시 mock 커뮤니티 피드와 내 후기 목록에 반영
- [x] 공유 카드 모달 인터랙션: 템플릿 선택, 공유/저장 버튼 완료 상태 표시
- [x] 일정 화면 인터랙션: 월간/주간 전환, 이전/다음 월 이동, 날짜 선택, 선택일 경기 목록 변경
- [x] 경기 상세 화면: 선택한 경기 데이터 표시, 직관 등록 진입 동작 연결
- [x] 커뮤니티 화면 인터랙션: 전체/내팀/구장 필터, 좋아요 토글, 저장 토글, 더보기
- [x] 후기 상세 화면: 좋아요/저장/공유 mock 동작
- [x] 마이 화면 인터랙션: 프로필 편집 mock 모달, 통계/메뉴 상태 반영
- [x] 내 직관 리스트: 전체/인증/미인증 필터, 수정/삭제 mock 동작
- [x] 내 후기 모음: 내가 쓴 후기만 표시, 삭제 mock 동작
- [x] 친구 관리: 친구/요청/추천 탭, 수락/거절/추가 mock 동작
- [x] 설정: 알림 토글, 팀 변경, 공개 범위 선택, 로그아웃 mock 상태 표시
- [x] 공통 피드백: toast 또는 inline 완료 메시지, 빈 상태, 비활성 상태, 입력 validation

테스트:

- [x] `npm run build`
- [x] `npm run lint`
- [x] 홈에서 직관 등록 완료 후 공유 카드가 열리는지 확인
- [x] 등록한 직관이 내 직관 리스트와 홈 통계에 반영되는지 확인
- [x] 작성한 후기가 커뮤니티와 내 후기 모음에 반영되는지 확인
- [x] 일정 월/주 전환과 날짜 선택이 모바일에서 깨지지 않는지 확인
- [x] 커뮤니티 필터/좋아요/저장 토글이 새로고침 전까지 유지되는지 확인
- [x] 마이 설정/친구 관리 mock 동작이 화면에 반영되는지 확인

리뷰어 검수:

- [x] 리뷰어 에이전트가 mock state와 실제 API 전환 경계가 분리되어 있는지 검토
- [x] 리뷰어 에이전트가 사용자가 누를 수 있는 UI 중 무반응 요소가 과도하게 남지 않았는지 검토
- [x] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Completed / QA Passed

### Phase 6.8. 추가 수정사항

목표: 사용자의 피드백을 반영해 홈, 일정, 커뮤니티, 직관 등록/후기 작성 흐름의 실제 사용성을 개선한다. 특히 KBO 시리즈 일정 표시, 직관 경기 기반 후기 작성, 커뮤니티 피드 정리, 모바일 모달 공간 효율을 보강한다.

작업:

- [x] 홈 화면 다음 직관 카드 개선: `다음 직관` 텍스트와 D-day 표시 추가, 날짜/VS 기준 중앙 정렬 조정
- [x] 홈 화면 `이번주` 섹션을 `이번주 우리팀 일정`으로 변경하고, 화-목/금-일 3연전 시리즈 범위 바 UI 적용
- [x] 홈/일정 캘린더에 직관 상태 표시 추가: `직`, `직승`, `직패`, `직무` 표시
- [x] 홈 최근 직관 경기 영역을 한 줄 요약형으로 압축하고, `vs` 텍스트 제거 및 공간 축소
- [x] 홈 팀 순위를 5개 팀에서 10개 팀 전체 표시로 확장
- [x] 하단 네비게이션바를 앱 하단 고정 구조로 정리하고, 콘텐츠 스크롤과 분리
- [x] 일정 월간 캘린더를 표 형식으로 재구성: 일요일 시작, 주 단위 셀, 우리팀 기준 시리즈 표시, 홈/어웨이/상대팀/직관 결과 표시
- [x] 월간 캘린더 선택 표시를 날짜 숫자 중심의 캡슐 방식으로 변경하고, 토/일 선택 시 텍스트 가독성 개선
- [x] 일정 화면 상단 월간/주간/팀순위 탭 제거, 캘린더를 상단으로 이동
- [x] 일정 상세 영역에 `직관 등록` 버튼 추가, 선택 날짜를 직관 등록 모달 초기값으로 전달
- [x] 일정 상세 경기 카드의 양 끝 팀 색상 곡선 테두리 적용, 좌우 팀/배지 정렬 개선
- [x] 직관 등록 모달 사진 추가 영역을 최상단으로 이동하고, 티켓 사진 기반 자동 인식 예정 흐름에 맞게 구조 정리
- [x] 직관 등록 모달의 경기 선택과 응원팀 선택을 통합: 좌우 라디오 버튼 + 팀 배지 + 팀명으로 한 번에 선택
- [x] 직관 등록 모달 내부 경기 카드 정렬, 라디오 버튼/팀 배지 수직 중앙 정렬, 선택 배경/테두리 정리
- [x] 커뮤니티 탭에서 `구장` 필터와 기능 없는 종 아이콘 제거
- [x] 커뮤니티 게시물 좌측 상단을 프로필 이미지 영역으로 변경하고, 우측 상단 팀명 텍스트를 팀 배지로 변경
- [x] 팀 배지 공통 컴포넌트 정렬 개선: 이니셜 전용 span 추가, 흰색 고정, 커뮤니티 전용 잘못된 override 제거
- [x] 커뮤니티 상단 필터 줄 오른쪽에 `후기 작성` 버튼 추가, 기존 후기 작성 모달과 연결
- [x] 후기 작성 모달 높이를 직관 등록 모달처럼 크게 조정하고, 후기 내용 입력 영역 확대
- [x] 후기 작성 모달의 경기 선택 방식을 전체 일정 선택이 아니라 `내 직관 내역` 중 종료된 경기 선택 방식으로 변경
- [x] 후기 작성 시 선택한 직관 기록의 날짜, 홈/원정팀, 스코어, 응원팀을 후기 데이터에 반영
- [x] 후기 작성 모달의 직관 경기 선택 UI를 가로 스크롤 카드형으로 변경
- [x] 직관 경기 선택 카드를 `날짜 / 홈팀 점수 / 원정팀 점수` 3줄 구조로 정렬하고, 카드 폭 축소
- [x] 후기 사진은 최대 3장까지만 추가 가능하도록 하고, 3장 선택 시 `추가` 버튼이 렌더링되지 않도록 변경
- [x] 모달/커뮤니티 수정 후 주요 화면을 브라우저에서 확인하고 `npm.cmd run lint` 통과 확인

추가 작업 (2026-05-06 라운드 2):

- [x] 후기 작성 모달 공개 범위 텍스트 `팔로워 공개` → `친구 공개`로 변경
- [x] 후기 작성 모달 직관 경기 선택 가로 스크롤에 마우스 좌우 드래그 스크롤 지원 (`useDragScroll` 훅 추가, 모바일 터치는 기존 네이티브 스크롤 유지)
- [x] 마이 메인 메뉴에서 중복된 `알림 설정` 항목 제거, `설정` 페이지 안의 알림 토글로 통합
- [x] 마이 통계 카드의 `인증 직관 N경기` → `직관 경기 N경기 (인증 M)`로 전체 직관 수와 인증 수 동시 노출
- [x] 직관 인증 기준 정의 검토 및 보고: 현 코드는 `verified: Boolean(ticketFileName)`만 적용, Stage 6에서 Vision 매칭으로 보강 예정 (정책은 `티켓 사진 업로드 = 인증` 컨셉 유지)
- [x] 내 직관 리스트 카드 정렬 개선: 양 팀명을 점수와 함께 가운데로 모으고 점수 좌우 여백 확대
- [x] 내 직관 리스트 인증/미인증 라벨을 우측 상단 절대 배치에서 `날짜 (구장) 인증` 인라인 + 가운데 정렬로 이동
- [x] 내 직관 리스트 카드에 후기 작성 1:1 워크플로우 추가: `Review.attendanceId` 필드 도입, `후기 작성` 버튼 → 후기 모달 자동 선택, `작성 완료` 표시 → `/my/reviews` 이동
- [x] 후기 작성 모달에 `initialAttendanceId` prop 추가, 외부 진입 시 해당 직관이 자동 선택되도록 useEffect 보강
- [x] 직관 카드 삭제 버튼을 텍스트 → `Trash2` 아이콘으로 교체, 회색 톤(`#f1f3f5`)으로 변경, 우측 하단 절대 배치
- [x] 직관 삭제 시 ModalShell 기반 확인 모달(`취소` / `삭제하기`) 추가
- [x] 친구 관리 화면에 닉네임 검색 바와 검색 결과 리스트, `신청하기`/`신청됨` 상태 버튼 추가 (mock 사용자 풀 10명)
- [x] 친구 검색 바와 친구/요청/추천 탭 사이 간격 16px 확보
- [x] 친구 카드 팀 배지 이니셜 정렬 버그 수정: `.friend-row span { display: block }` 셀렉터를 `.friend-row > div > span`으로 좁혀 `.team-badge-initial` grid 중앙 정렬 보존
- [x] 커뮤니티 피드 필터에 `친구` 탭 추가, mock 친구 닉네임 목록(`friendAuthorNames`)으로 필터링
- [x] AppShell 상단 헤더에서 알림/프로필 버튼 제거하고 페이지 제목만 가운데 정렬로 유지
- [x] AppShell 헤더를 고정 → 콘텐츠와 함께 스크롤되도록 `.app-scroll` 래퍼 도입
- [x] 홈 최근 직관 경기 카드에서 팀명 옆에 점수(`attendance.score` 파싱) 표시
- [x] 팀순위 페이지 뒤로가기 링크 `일정으로 돌아가기` → `홈으로 돌아가기`로 변경 (`/schedule` → `/`)
- [x] 팀순위 페이지를 BET 스타일 테이블로 재구성: `순위 / 팀 / 승률 / 차 / 승-무-패` 컬럼 헤더, 팀명 팀 컬러로 표시
- [x] 홈 화면 팀 순위 섹션도 동일 테이블 스타일로 통일하고 `상세 보기` 링크 제거 (`TeamRankRow` import 정리)
- [x] 팀순위 테이블에 `최근5` 컬럼 추가: 마지막 5경기 점 5개 표시 (W=`#22c55e`, L=`#ef4444`, D=`#fbbf24`, 점 직경 6px)
- [x] 팀순위 컬럼 순서를 `순위 / 팀 / 승률 / 차 / 승-무-패 / 최근5`로 재배치, 순위 컬럼 18px 축소로 팀명과 가까이 정렬
- [x] 팀순위 헤더 셀에 `white-space: nowrap` 적용해 `순위`, `최근5` 줄바꿈 방지

테스트:

- [x] `npm.cmd run lint`
- [x] 브라우저에서 `/`, `/schedule`, `/community` 주요 변경 화면 확인
- [x] 후기 작성 버튼 클릭 시 모달 오픈 확인
- [x] 후기 작성 모달에서 직관 경기 선택 카드 표시 확인
- [x] 사진 3장 선택 시 추가 버튼 숨김 동작 확인
- [x] 커뮤니티 게시물 팀 배지 이니셜 중앙 정렬 확인
- [x] 추가 라운드 작업 후 `npm.cmd run lint` 매 단계 통과 확인
- [x] 내 직관 리스트에서 후기 작성 모달이 해당 경기 자동 선택되는지 확인
- [x] 직관 삭제 확인 모달에서 취소/삭제 동작 확인
- [x] 친구 검색 신청 후 `신청됨` 상태 유지 확인
- [x] 헤더가 콘텐츠와 함께 스크롤되는지 모바일 폭에서 확인

진행 상태: Completed / QA Passed

### Phase 7. 서비스 데이터 모델/API 설계

목표: Phase 1-6.8까지 mock으로 검증된 화면/인터랙션을 실제 서비스로 옮길 수 있도록 데이터 계약을 확정한다. 친구 양방향 관계, 직관-후기 1:1 관계, 티켓 사진 기반 인증, 친구 공개 범위 등 이번 라운드까지 결정된 내용을 schema-level로 명문화한다.

기준 (이번 단계 산출물에 반드시 반영):

- 친구 시스템은 **양방향 friend** (follow 아님). 신청-수락-거절 흐름 분리.
- 후기는 직관과 **1:1 종속**. 한 직관에 후기 한 건만 작성 가능.
- 인증은 **티켓 사진 업로드 = verified** (Stage 6에서 Claude Vision으로 자동 매칭 검증).
- 공개 범위는 **전체 공개 / 친구 공개 / 나만 보기** (팔로워 공개 아님).
- 내 팀(`mainTeamId`)은 1개, 관심팀(`interestTeamIds`)은 최대 5개. 내 팀 변경은 하루 1회 제한.
- 모든 통계/랭킹은 인증 직관만 집계.

작업:

- [x] 핵심 도메인 모델 정의 및 관계 명시
  - [x] `User` (id, nickname, mainTeamId, mainTeamChangedAt, interestTeamIds[], notificationsEnabled, defaultPublicScope, createdAt)
  - [x] `Team` (id, name, shortName, initial, color)
  - [x] `Game` (id, date, time, stadium, homeTeamId, awayTeamId, homeScore, awayScore, status, innings)
  - [x] `Attendance` (id, userId, gameId, supportTeamId, ticketImageUrl, verified, verifiedAt, verifiedMethod, visionPayload, memo, createdAt)
  - [x] `Review` (id, userId, **attendanceId UNIQUE**, body, photos[], publicScope, createdAt) — attendanceId에 unique constraint로 1:1 보장
  - [x] `ReviewLike` (userId, reviewId, createdAt) — 복합 PK
  - [x] `ReviewSave` (userId, reviewId, createdAt) — 복합 PK
  - [x] `Friend` (userAId, userBId, createdAt) — 수락 시 양쪽 레코드 생성 또는 정렬된 페어로 저장
  - [x] `FriendRequest` (id, fromUserId, toUserId, status: pending|accepted|rejected, createdAt, respondedAt)
  - [x] `NotificationSetting`은 `User`에 컬럼으로 인라인 (별도 테이블 분리 X)
  - [x] `Notification` (수신자, type, payload, readAt) — 실제 알림 발송 이력 저장용
  - [x] `ShareCardTemplate`은 DB 모델 X. 코드 상수로 유지 (3종 고정).
- [x] Prisma schema 또는 Supabase 테이블 초안 작성
- [x] API/Server Action 목록 작성
  - [x] 직관 등록/수정/삭제, 직관 인증(티켓 업로드 → Vision 검증)
  - [x] 후기 작성/수정/삭제, 좋아요/저장 토글
  - [x] 친구 검색(닉네임), 친구 신청/수락/거절/취소, 친구 목록
  - [x] 커뮤니티 피드 (전체/내팀/친구 필터)
  - [x] 프로필 편집(닉네임/내 팀/관심팀), 내 팀 변경 1일 제한 검증
- [x] 직관 인증 정책 정식 정의
  - [x] 인증 조건: 티켓 이미지 업로드 + Vision 파싱 결과(경기일자/홈팀/원정팀/구장)가 선택한 경기와 일치
  - [x] 부정 방지: 동일 티켓 이미지 hash 중복 인증 차단, 미래 일자 티켓 차단
  - [x] 실패 처리: Vision 파싱 실패 시 미인증 상태로 저장, 사용자에게 재업로드 안내
  - [x] Stage 6 도입 전까지는 `verified = Boolean(ticketImageUrl)` mock 정책 유지
- [x] 직관 승률 계산 규칙 정의
  - [x] `result = compareScore(game.homeScore, game.awayScore, attendance.supportTeamId)` server-side 함수
  - [x] 승률 = wins / (wins + losses), 무승부는 분모에서 제외
  - [x] 인증 직관만 통계/랭킹 집계 대상
- [x] 경기 일정 seed 전략 정의 (KBO 자동 연동 → daily cron 또는 webhook)
- [x] 팀 순위/최근 5경기 form 데이터 전략 정의 (KBO 응답 가공 vs Standing 캐시 테이블)
- [x] 이미지 업로드 정책 정의
  - [x] 티켓 사진: 1장, JPEG/PNG, max 10MB, hash 저장 (중복 인증 방지)
  - [x] 후기 사진: 1~3장, 자동 압축
  - [x] 프로필 이미지: 1장
  - [x] 저장소: Supabase Storage
- [x] 공개 범위 정책 정의
  - [x] 후기 `publicScope`: `public | friends | private`
  - [x] 커뮤니티 피드 노출 규칙: public은 전체, friends는 작성자 친구 목록에 포함된 사용자에게만, private은 본인만
  - [x] 친구 필터 탭 쿼리: `Friend(currentUser, *)` 조인

테스트:

- [x] mock data 타입(`AttendanceRecord`, `Review`, `UserProfile`)과 신규 schema가 1:1 매핑되는지 확인
- [x] 주요 화면별 필요한 필드가 schema에 모두 존재하는지 매핑표 작성
- [x] 친구 양방향 관계, 후기-직관 1:1 unique, 인증 hash unique 등 제약조건 검증
- [x] 인증 정책/승률 계산 규칙이 mock 동작과 일치하는지 시뮬레이션

리뷰어 검수:

- [ ] 리뷰어 에이전트가 데이터 모델이 Phase 1-6.8 화면 요구사항과 향후 Stage 6/7/8/9 확장(Vision 인증, 카카오 공유, 친구 랭킹, 알림)을 감당하는지 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Implemented / Reviewer Pending

### Phase 8. 인증/DB/스토리지 연동

목표: mock data를 실제 사용자 데이터로 교체할 기반을 만든다.

작업:

- [x] 인증 방식 결정: Kakao, Google, email 중 MVP 범위 확정
- [x] DB 연결 설정
- [x] 마이그레이션 또는 Supabase schema 적용 — 현재 기준은 `supabase/*.sql` 파일과 실제 원격 적용 상태를 따른다. 부분 적용된 schema 누락분(reviews/review_likes/review_saves/friends/friend_requests/notifications)을 [supabase/fix-reviews.sql](supabase/fix-reviews.sql)로 일괄 복구. profile_stats / verified_attendance_results view 누락분은 [supabase/fix-views.sql](supabase/fix-views.sql)로 복구
- [x] **mock data 완전 제거** — `lib/mock/` 폴더 삭제, AppState/HomeScreen/ScheduleScreen/CommunityScreen에서 mock import 제거, `Review` 타입을 `lib/types/domain.ts`로 이동
- [x] **RLS-JWT 우회 패턴 정착** — `@supabase/ssr` 0.10이 PostgREST에 JWT를 일관되게 못 넘기는 이슈 회피. 인증은 SSR client(`auth.getUser`)로 확인하고, DB 읽기/쓰기는 `createSupabaseAdminClient()`(service role)로 수행. `lib/actions/attendance.ts`, `lib/actions/review.ts`, `lib/actions/onboarding.ts`, `lib/supabase/queries.ts`의 모든 사용자 데이터 함수에 적용
- [x] auth.users `on_auth_user_created` 트리거 충돌 제거 (회원가입 "Database error saving new user" 원인)
- [x] profiles SELECT RLS 정책 누락 보완 ("profiles are public readable")
- [x] 직관/후기 삭제 server action 추가
  - [x] `deleteAttendanceAction` — DB 행 삭제 + 연결 후기 사진(review-photos) + 티켓 사진(ticket-images) Supabase Storage 정리
  - [x] `deleteReviewAction` — DB 행 삭제 + 후기 사진 Storage 정리
  - [x] MyAttendancesScreen / MyReviewsScreen에 삭제 확인 모달(`ModalShell`) 적용
- [x] seed data 작성: 팀, 샘플 경기, 샘플 순위
- [x] 팀 순위 read-only DB 연결: `/`, `/rankings`에서 Supabase `team_standings` 조회 후 mock fallback
- [x] 공개 seed 테이블 RLS 보강 및 anon read 확인: `teams`, `games`, `team_standings`
- [x] 일정 read-only DB 연결: `/schedule`에서 Supabase `games` 조회 후 mock fallback
- [x] 로그인/온보딩 저장
  - [x] 이메일/비밀번호 Supabase Auth 폼 추가
  - [x] 미로그인 온보딩 접근 시 로그인으로 redirect
  - [x] 온보딩 완료 시 `profiles` upsert server action 추가
  - [x] 이메일 확인/매직 링크용 `/auth/callback` route handler 추가 (`exchangeCodeForSession` → 프로필 유무에 따라 `/` 또는 `/onboarding`)
- [x] 직관 등록 저장
  - [x] `attendances` insert server action 추가
  - [x] 날짜/홈팀/원정팀으로 Supabase `games` 매칭 후 저장
  - [x] 비로그인 상태는 기존 mock 저장 fallback 유지
- [x] 내 직관 리스트 DB 조회
  - [x] 로그인 사용자는 Supabase `attendances` + `games` 조회
  - [x] 비로그인/조회 실패 상태는 기존 mock 리스트 fallback
- [x] 후기 작성/조회 저장
  - [x] `reviews` insert server action 추가
  - [x] 직관-후기 1:1 unique 제약 에러 처리
  - [x] 커뮤니티 피드 DB 조회 후 mock fallback
  - [x] 내 후기 모음 DB 조회 후 mock fallback
- [x] 이미지 업로드 연결
  - [x] 브라우저 Supabase Storage upload helper 추가
  - [x] 직관 등록 티켓 사진을 `ticket-images`에 업로드 후 `attendances.ticket_image_url` 저장
  - [x] 후기 사진을 `review-photos`에 업로드 후 `reviews.photos` 저장
  - [x] 비로그인/업로드 실패 시 기존 mock asset fallback 유지
- [x] 기본 권한/공개 범위 체크
- [x] 사용자 후기까지 layout에서 hydration (`initialReviews`로 AppState에 시드)
- [x] 후기 본문 hashtag 자동 추출 → `tags[]` (한글/영문/숫자/_, 중복 제거, 최대 20개)
- [x] 후기 본문 줄바꿈 보존 (`white-space: pre-wrap`)
- [x] 후기 자동 부착 텍스트("오늘도 승요! 직관 후기" 제목, "#직관후기/#public" 태그, "응원석의 열기..." 추가 텍스트) 모두 제거
- [x] 후기 게임 라벨 한글화 (`KIWOOM 6 : 16 DOOSAN` → `키움 6 : 16 두산`)
- [x] 후기 상세 페이지 `app/reviews/[id]/page.tsx`를 server component로 전환, `getReviewByIdFromDb`로 직접 조회
- [x] 게임 상세 페이지 상태 정리 — 한때 DB 조회 server component로 전환했으나 Phase 8.7 다크 리디자인에서 기능을 보류했고, 현재 `app/games/[id]/page.tsx`는 `/schedule`로 redirect한다
- [x] Supabase Storage 도메인 `next.config.mjs` `images.remotePatterns` 등록
- [x] 환경변수 동적 접근 버그 수정 — `process.env[key]`는 브라우저에서 undefined가 되므로 정적 `process.env.NEXT_PUBLIC_*` 참조로 변경
- [x] 홈/마이/일정/커뮤니티 화면 데이터 흐름 정리
  - [x] 홈 이번주 시리즈 캘린더를 실 KBO 게임에서 파생 (요일 strip + 시리즈 pill, 우리 팀 기준 화수목/금토일 자동 그룹핑)
  - [x] 홈 직관 등록 모달용 게임 범위: 시즌 시작(3월 1일) ~ 오늘 +14일
  - [x] 직관 모달 게임 정렬: 우리 팀 경기 항상 최상단, 종료 경기는 스코어 표시
  - [x] 직관 등록 후 자동 공유 모달 호출 제거
  - [x] 일정 캘린더 승/패/무 배지 색상 분리 + 선택일 오렌지 테두리가 배지에 영향 안 주도록 격리
  - [x] 내 직관 리스트 좌상단 승/패/무 배지 추가, 카드 정렬 = 경기 날짜 내림차순
  - [x] 마이 메뉴 하드코딩 카운트 제거(`내 직관 리스트(37)`, `내 후기(24)`, `친구 관리(12)`, `가입일 2025.04.01`), 실 데이터 카운트로 교체

테스트:

- [x] 신규 유저 온보딩 플로우 확인 (이메일/비밀번호 회원가입 → 이메일 인증 → /auth/callback → /onboarding → 두산 선택 → 프로필 저장)
- [x] 직관 등록 후 홈 승률 반영 확인 (등록 → DB 저장 → 새로고침 후 유지 → 홈 .500 표기)
- [x] 후기 작성 후 커뮤니티 피드 반영 확인 (사진 업로드 → reviews insert → /community에서 노출 → /reviews/[id] 상세 진입)
- [x] 직관/후기 삭제 후 Storage 객체까지 정리되는지 확인
- [ ] 인증되지 않은 사용자의 보호 페이지 접근 처리 확인

리뷰어 검수:

- [ ] 리뷰어 에이전트가 데이터 저장/조회 흐름, 권한 체크, 에러 상태를 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Implemented / Reviewer Pending

### Phase 8.5. 외부 데이터 연동

목표: Phase 7에서 전략만 정의된 KBO 일정/순위 자동 동기화와 티켓 Vision 인증을 실제로 구현한다. mock seed에 의존하던 `games` / `team_standings`를 외부 소스 기반으로 채우고, 직관 인증을 `Boolean(ticketImageUrl)` mock에서 Vision 매칭 기반 정식 인증으로 전환한다.

원칙:

- 외부 호출은 모두 server-side route handler 또는 server action에서만 수행한다.
- 외부 API 키와 cron secret은 환경변수로만 관리하고, anon key 경로에 노출하지 않는다.
- 동기화 작업은 idempotent하게 설계한다 (재실행해도 중복/오염이 없어야 함).
- 외부 소스 장애 시 mock fallback이 아니라 마지막 성공 데이터를 그대로 유지한다.
- Vision 인증 실패는 미인증 상태로 저장하고, 사용자에게 재업로드를 안내한다.

작업:

- [x] KBO 일정 동기화 route handler 구현
  - [x] `app/api/cron/sync-kbo-games/route.ts` 생성, `CRON_SECRET` Bearer 헤더 검증, `scope=today/week/range` 지원
  - [x] 외부 소스: KBO 공식 (`https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList`) 1순위 + 네이버 스포츠 (`sports.news.naver.com/kbaseball/schedule/index`) HTML 폴백 — 소스 결정은 의사결정 로그 참조
  - [x] 응답을 `Game` 스키마(date/time/stadium/homeTeamId/awayTeamId/score/status/innings)로 정규화 ([lib/server/kbo/fetchGames.ts](lib/server/kbo/fetchGames.ts), [lib/server/kbo/teamCode.ts](lib/server/kbo/teamCode.ts))
  - [x] `games` upsert by `external_id`(`kbo-YYYYMMDD-away-home`), insert/update 분리 ([lib/server/kbo/syncGames.ts](lib/server/kbo/syncGames.ts))
  - [x] 동기화 결과 응답에 inserted/updated 카운트와 source(`kbo`/`naver`) 포함
- [x] 팀 순위/최근 5경기 form 동기화
  - [x] `team_standings` upsert by `(team_id, season)` ([lib/server/kbo/syncStandings.ts](lib/server/kbo/syncStandings.ts), [lib/server/kbo/fetchStandings.ts](lib/server/kbo/fetchStandings.ts))
  - [x] 최근 5경기 `form` 컬럼은 `games` 테이블에서 finished 5경기 결과 파생([scripts/sync-standings.mjs](scripts/sync-standings.mjs)에서 자동 계산)
  - [x] KBO 공식 + 네이버 API(`api-gw.sports.naver.com/.../seasons/{year}/teams`) 둘 다 시도해 더 최신 소스 채택
- [x] Cron 스케줄링 설정 ([vercel.json](vercel.json))
  - [x] 일정 주간 갱신: 매일 03:00 KST (`scope=week`)
  - [x] 라이브 스코어: KST 14:00-23:00 동안 30분마다 (`scope=today`)
  - [x] 순위 갱신: 매일 02:30 KST
  - [x] 수동 트리거: `?scope=range&from=YYYY-MM-DD&to=YYYY-MM-DD`
- [x] 2026 시즌 전체 일정 1회 적재 ([scripts/bulk-load-season.mjs](scripts/bulk-load-season.mjs))
  - 결과: **675 경기 적재** (3월~9월), 0 에러
- [x] 티켓 Vision 인증 파이프라인 (Gemini 채택)
  - [x] `lib/server/vision/parseTicket.ts` — Gemini 2.5 Flash Vision 호출 wrapper (한국어 OCR + JSON 구조화 출력)
  - [x] 추출 항목: 경기일자, 홈팀명/원정팀명, 경기장 (좌석/블록은 후순위)
  - [x] `previewTicket` server action — Vision 분석만 (DB write 없음). 모달이 사진 업로드 즉시 호출해 폼 자동 채움
  - [x] `registerAttendanceFromTicket` server action — 등록 버튼 누를 때 호출. 인증된 직관 행 + Storage 업로드 + `verified_method='ticket_image_vision'` + `vision_payload` 저장
  - [x] 응원팀 자동 결정: 사용자 `mainTeamId`가 경기에 있으면 자동, 아니면 사용자가 응원팀 드롭다운으로 직접 선택
  - [x] 매칭 실패(Vision OCR 실패 / DB 게임 못 찾음): 토스트로 사유 안내 + 수동 등록 흐름 fallback 가능
- [x] 부정 방지 (정책 단순화)
  - [x] 티켓 이미지 SHA-256 hash 저장, 동일 hash 중복 인증 차단 (DB unique constraint + preview 시점 사전 체크)
  - [x] 동일 사용자 + 동일 경기 중복 인증 차단 (`attendances.unique(user_id, game_id)`)
  - 미래 일자 차단 룰은 빠짐 — 사용자가 티켓을 며칠 전에 받는 게 정상이라, 인증 정책은 "티켓 업로드 = verified=true"로 단순화 (의사결정 로그 2026-05-07 참조)
- [x] 환경변수 및 시크릿
  - [x] `CRON_SECRET` `.env.example` 등록
  - [x] `GEMINI_API_KEY` `.env.example` 등록 (Anthropic Vision 대신 Gemini 채택)
  - [ ] Vercel 환경변수 등록 안내 문서 업데이트 (배포 단계에서)
- [x] 티켓 컬렉션 페이지 (`/my/tickets`)
  - [x] 인증된 직관의 티켓 사진을 그리드로 표시
  - [x] ticket-images 버킷이 private이라 admin client로 1시간 signed URL 발급
  - [x] 카드 클릭 시 전체 화면 줌 모달
  - [x] 마이 메뉴에 "내 티켓 컬렉션 (N)" 항목 추가
- [ ] 관측성 (MVP에선 제외, 운영 단계로 이연)
  - [ ] 동기화 실패/Vision 실패 로그 수집 경로 결정 (Supabase log table 또는 외부)
  - [ ] 마지막 동기화 시각/상태를 admin에서 확인할 수 있는 최소 화면 또는 endpoint

테스트:

- [x] bulk load 스크립트로 `games` upsert 동작 확인 (2026 시즌 675경기)
- [x] 동일 bulk load 2회 실행해도 중복 행 없음 (external_id unique + insert/update 분리)
- [x] 순위 sync 스크립트로 10팀 standings + form 적재 확인
- [x] 실 KBO 티켓 사진 업로드 → Vision 인식 → DB 매칭 → 인증 직관 등록까지 동작 확인 (사용자 실측)
- [x] 동일 티켓 hash 재업로드 차단 확인 (preview 단계에서 메시지)
- [ ] cron route handler를 Vercel 배포 후 호출로 검증 (CRON_SECRET 인증 흐름)
- [ ] 외부 소스 응답 일부 누락 시 기존 row가 살아있는지 확인
- [ ] 인증 직관만 홈 승률/팀 랭킹에 반영되는지 확인 — 현 정책은 "모든 등록 직관 카운트"로 변경되어 검증 불필요해짐

리뷰어 검수:

- [ ] 리뷰어 에이전트가 외부 호출 경계, 시크릿 노출 위험, idempotency, Vision 실패 UX를 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Implemented / Reviewer Pending

### Phase 8.6. 후기 댓글 기능

목표: 원래 Phase 2(스펙)에서 후순위로 미뤄둔 후기 댓글을 추가한다. Phase 8에서 정착한 admin client 기반 server action 패턴과 Phase 8.5 후기 본문/태그/카운트 흐름을 그대로 활용한다.

원칙:

- 댓글은 flat 리스트 (대댓글 없음)
- 수정 없음 (삭제 후 재작성)
- 댓글 좋아요/멘션/알림 없음 — 추후 단계
- 가시성은 후기 `publicScope`를 따름 (public/friends/private)

작업:

- [x] DB: `review_comments` 테이블 + RLS + 인덱스 + `touch_updated_at` 트리거 ([supabase/add-comments.sql](supabase/add-comments.sql))
  - body 1~500자 check constraint
  - read 정책: 후기 가시 범위 따라 (public + 본인 + 친구)
  - insert 정책: 본인만, 단 해당 후기를 볼 수 있어야 함
  - delete 정책: 본인 댓글 또는 후기 작성자
- [x] Server actions ([lib/actions/comment.ts](lib/actions/comment.ts))
  - `createCommentAction({ reviewId, body })`
  - `deleteCommentAction(commentId)` — 권한 검증 후 삭제
- [x] Queries ([lib/supabase/queries.ts](lib/supabase/queries.ts))
  - `listCommentsByReviewId(reviewId)` — 작성자 닉네임/팀까지 조인
  - `getReviewByIdFromDb` / `listReviewsFromDb`에 댓글 카운트 조회 추가
- [x] Domain types ([lib/types/domain.ts](lib/types/domain.ts))
  - `ReviewComment` 타입 신규
  - `Review.ownerId` 추가 — UI에서 본인 후기 여부 판정
- [x] UI ([components/domain/ReviewDetailScreen.tsx](components/domain/ReviewDetailScreen.tsx))
  - 댓글 리스트 (작성자 팀 배지 + 닉네임 + 시간 + 본문)
  - 본인 댓글 또는 후기 owner면 삭제 버튼 노출
  - 입력창 + 등록 버튼 (Enter 키 등록 지원, 500자 제한)
  - 비로그인은 로그인 안내
  - 낙관적 업데이트 + `router.refresh()`로 서버 데이터 동기화
- [x] ReviewCard 댓글 카운트가 실 DB 데이터로 표시 (`review.comments`)
- [x] `ReviewDetailPage` server component에서 comments + currentUserId 같이 fetch

테스트:

- [x] 댓글 등록/표시/삭제 동작 확인 (로컬)
- [x] 다른 사용자 후기 댓글 작성/삭제 권한 분리 확인 (RLS)
- [x] 친구 공개 후기 댓글 가시성 확인

리뷰어 검수:

- [ ] 리뷰어 에이전트가 RLS 정책 + UX 흐름 검토

진행 상태: Completed

### Phase 8.7. 다크 컨셉 전면 리디자인

목표: `data/oneul-seungyo-home-spec`(홈 시안)을 기준으로 전 페이지·전 팝업을 다크 프리미엄 스포츠 대시보드 스타일로 통일한다. 시안 이미지(main.png, calender.png, community.png, mypage.png, livelist.png, ticket_collection.png, myreviews.png, review_detail.png, friends.png, setting.png, write_review..png, registration.png, profile_edit.png, share.png)를 1:1 대조하며 마크업과 CSS를 다듬고, 부족했던 인터랙션·기능을 함께 추가한다.

원칙:

- AppShell에 `theme="default" | "dark"` prop 도입 → 페이지별 진입만으로 다크 적용
- 모든 다크 스타일은 `.phone-frame-dark` 스코프 안에서만 동작 → default 테마 영향 없음
- 디자인 토큰 변수화 (`--hd-bg-card`, `--hd-accent-orange #ff6a2b`, `--hd-success #24c26a`, `--hd-danger #ff5a64`, `--hd-info #6d8cff`, `--hd-radius-pill 999px` 등)
- 모달은 panelClassName 기반 다크 override (`review-modal-panel`, `attendance-modal-panel`, `profile-modal-panel`, `share-modal-panel`, `dark-confirm-panel`)
- 카드/리스트 사이 간격은 인접 셀렉터(`+`)로 통합 룰화 — 상단 보조 요소(back-link / detail-topbar / community-head / friend-search / segmented-control) 다음 콘텐츠는 자동으로 좁혀짐

작업 — 페이지 다크 적용:

- [x] 홈 ([components/domain/HomeScreen.tsx](components/domain/HomeScreen.tsx)) — Hero(.500), 다음 직관, 최근 직관(3장), 우리팀 일정(월~일 7등분 grid)
- [x] 일정 ([components/domain/ScheduleScreen.tsx](components/domain/ScheduleScreen.tsx)) — 캘린더 그리드 라인, 셀에 [날짜·상대팀 배지·직관체크/결과점], 일=빨강/토=파랑, 시리즈 막대 제거
- [x] 커뮤니티 ([components/domain/CommunityScreen.tsx](components/domain/CommunityScreen.tsx)) — 필터 칩 + 후기 작성 버튼 + 피드
- [x] 마이 ([components/domain/MyScreen.tsx](components/domain/MyScreen.tsx)) — 야구장 배경 hero(`/assets/mypagemyinfobg.png`), 통계 3개 카드, 메뉴 리스트
- [x] 내 직관 리스트 ([components/domain/MyAttendancesScreen.tsx](components/domain/MyAttendancesScreen.tsx)) — segmented 필터, 결과 코너칩, 후기 작성 버튼 + 우측 하단 휴지통
- [x] 내 티켓 컬렉션 ([components/domain/TicketCollectionScreen.tsx](components/domain/TicketCollectionScreen.tsx)) — 2열 그리드, 3:4 썸네일, 매치 + 구장 표기
- [x] 내 후기 모음 ([components/domain/MyReviewsScreen.tsx](components/domain/MyReviewsScreen.tsx)) — 본인 후기 피드 (액션은 후기 상세로 위임)
- [x] 친구 관리 ([components/domain/FriendsScreen.tsx](components/domain/FriendsScreen.tsx)) — 검색 input + segmented + 빈 상태(둥근 회색 원 + Inbox 아이콘)
- [x] 설정 ([app/my/settings/page.tsx](app/my/settings/page.tsx)) — 메뉴 행 + 빨강 outline 로그아웃
- [x] 후기 상세 ([components/domain/ReviewDetailScreen.tsx](components/domain/ReviewDetailScreen.tsx)) — 톱바(작성자 아바타+닉네임), 이미지, 게임 메타, 본문, 액션, 댓글
- [x] 경기 상세는 추후 버전으로 보류 → `/games/[id]` redirect로 진입 차단, 일정 페이지 행도 클릭 비활성화

작업 — 팝업 다크 적용:

- [x] 후기 작성 모달 — 사진 strip, 직관 경기 picker, textarea, 공개 범위, 등록하기
- [x] 직관 등록 모달 — 티켓 업로드 박스, 날짜/매치/응원팀/메모, 등록하기
- [x] 프로필 편집 모달 — 96px 아바타 미리보기 + 사진 변경 버튼, 닉네임, 팀 grid(2열) + ✓ 마크
- [x] 공유 모달 — 9:16 비율 카드 미리보기(배경 이미지 비율과 일치), 템플릿 picker, 카카오/인스타/저장 액션
- [x] 다크 confirm 모달 (`dark-confirm-panel`) — 후기 삭제, 로그아웃 등 재사용

작업 — 인터랙션·기능 추가:

- [x] 팀 컬러 톤다운 ([lib/constants/teams.ts](lib/constants/teams.ts)) — 채도/명도 한 단계 낮춰 시안 톤에 맞춤
- [x] TeamBadge에 흰색 얇은 링(border 1px / opacity 0.55) 다크 스코프 override
- [x] 다음 직관 카드: `<` `>` 페이지네이션 + 좌/우 슬라이드 애니메이션, 사용 불가시 흐림
- [x] 이미지 캐러셀 — 후기 상세에 좌우 화살표 + `n/N` 카운터 + 도트 인디케이터
- [x] 후기 게시물에 게임 메타 행(`review-game-meta`) 추가 — `[날짜] [홈배지 홈팀명 점수 원정팀명 원정배지] [결과 칩(녹/빨/회)]`, 카드와 상세 모두 동일
- [x] ReviewCard 본문 3줄 line-clamp + 자동 더보기 토글 (글자수 휴리스틱 → CSS line-clamp + ref measure)
- [x] 무한 스크롤 ([app/community/page.tsx](app/community/page.tsx) + [components/domain/CommunityScreen.tsx](components/domain/CommunityScreen.tsx)) — 초기 20개 + IntersectionObserver, `loadMoreReviewsAction(cursor)` server action, `created_at` cursor pagination
- [x] 후기 수정/삭제 — 후기 상세 우측 상단 `...` 드롭다운 메뉴 (수정 → AppModals editReview prop, 삭제 → 다크 confirm + `/community` redirect). 직관 매핑은 잠금
  - [x] `updateReviewAction` server action — 본인 글 권한 체크 + body/photos/scope 갱신 + 미사용 사진 storage 정리
  - [x] AppModals `editReview` prop — 사진/본문 prefill, 직관 카드 잠금 표시, 등록 → "수정하기"
- [x] 프로필 사진 (option A: 즉시 삭제)
  - [x] `updateAvatarAction` — Storage 업로드한 새 URL 받아 DB 갱신 + 이전 파일 삭제
  - [x] 프로필 편집 모달에 96px 원형 + 이름 첫 글자 fallback + "사진 변경" 버튼 (5MB 제한)
  - [x] Review/ReviewComment에 `authorAvatarUrl` 필드 추가, queries에서 매핑
  - [x] ReviewCard / 후기 상세 톱바 / 댓글 모두 아바타 우선 + 이름 첫 글자 fallback
- [x] 해시태그 칩 노출 제거 (본문 안 `#태그` 텍스트는 유지) — 추후 클릭 가능 링크화 여지 남김
- [x] 로그아웃 기능 — 설정 → 다크 confirm 모달 → `signOutAction` (`/landing` redirect)
- [x] 첫 진입 흐름 — `/` 비로그인 시 `/landing` redirect, 랜딩 "시작하기"는 `/login`으로

작업 — 공통 정리:

- [x] `globals.css`에서 중복된 `home-dark-*` 1700여 줄 제거 후 단일 토큰 기반 블록으로 재작성
- [x] 상단 보조 요소 다음 콘텐츠 간격 통합 룰 (`back-link + *`, `detail-topbar + *`, `community-head + *`, `friend-search + *`, `segmented-control + *`)
- [x] 모든 모달의 스크롤바 숨김 (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`)

작업 — Phase 8.7 후속 보완 (Phase 8.8 작업 중 같이 진행):

- [x] 일정 페이지 segmented `[기본 보기 / 시리즈 보기 / 팀 순위]` 추가 — 팀 순위는 `/rankings`로 이동
- [x] **시리즈 보기 모드** 복원 — 주별 grid + 팀별 그라데이션 막대(원정은 사선 줄무늬) + **시리즈 결과 행**(스윕/위닝/루징/스윕패/무/진행중 색상 구분)
- [x] 토→일 이어지는 시리즈는 일요일 칸의 venue 표기 생략 (이전 주에서 이어진 표시)
- [x] 캘린더 가변 주(4·5·6주) — 그 달의 마지막 날 포함 주까지만 표시
- [x] 팀 순위 페이지 다크 리디자인 — 표 다크 배경, 본인 팀 오렌지 outline + 글로우, "일정으로 돌아가기"
- [x] 홈 화면 빈 상태 카드 — 다음 직관/최근 직관이 비어있을 때 안내 + `+ 직관 등록` CTA
- [x] 프로필 편집 저장 버그 수정 — `updateProfileAction`을 admin client 패턴으로 통일 (RLS 우회), AppState에 `initialProfile` 변경 감지 useEffect 추가로 SSR ↔ client 동기화
- [x] 팀 변경 하루 1회 제한 임시 해제 (실서비스 출시 전 다시 활성화 예정)
- [x] 기본 선택 팀 두산으로 변경 (개발자 응원팀)

테스트:

- [x] 각 페이지/모달 다크 시안과 1:1 대조 (모바일 뷰포트)
- [x] `npx tsc --noEmit` 통과
- [ ] 360px / 414px 스크롤 영역 점검 (Phase 9에서 일괄)

리뷰어 검수:

- [ ] 리뷰어 에이전트가 시안 vs 구현, 다크 토큰 일관성, 인터랙션 회귀 검토

진행 상태: Completed (인증/온보딩 페이지는 Phase 8.8에서 함께 다룸)

### Phase 8.8. 소셜 로그인(Google + 카카오) + 인증/온보딩 다크 리디자인

목표: 이메일/비밀번호 가입의 마찰을 줄이고 인증·온보딩 흐름을 Phase 8.7과 동일한 다크 컨셉으로 통일한다. 한국 사용자 비중을 고려해 Google과 카카오를 함께 활성화 — 둘 다 Supabase Auth Provider 공식 지원이라 절차가 거의 동일.

원칙:

- 두 OAuth 모두 Supabase Auth Provider 기능 그대로 사용 (별도 백엔드 없음)
- redirect 흐름은 기존 `emailAuthAction`과 동일하게 정렬 — 프로필 있으면 `/`, 없으면 `/onboarding`
- 다크 디자인은 Phase 8.7 토큰(`--hd-*`)과 모달/카드 패턴을 그대로 재사용
- 카카오는 **개인 앱**으로 진행 (닉네임/프로필 사진 동의항목만 사용, 이메일 불필요 → 비즈 앱 신청 회피)

작업 — Google OAuth:

- [x] **콘솔 설정** (사용자 작업)
  - Google Cloud Console: OAuth 2.0 Client ID 생성 + Authorized redirect URIs에 `https://<project>.supabase.co/auth/v1/callback` 등록
  - Supabase Dashboard → Authentication → Providers → Google 활성화 + Client ID/Secret 입력
  - Supabase Dashboard → Authentication → URL Configuration → Site URL/Redirect URL에 개발(`http://localhost:3000`)·운영 URL 등록

작업 — 카카오 OAuth:

- [x] **콘솔 설정** (사용자 작업)
  - 카카오 디벨로퍼스(developers.kakao.com) → 내 애플리케이션 → 앱 생성
  - 앱 → **플랫폼 키 → Default REST API Key** (콘솔 메뉴 개편 후 키 단위 설정으로 통합)
    - 사이트 도메인: `http://localhost:3000` (호출 허용 IP는 비워둠)
    - 카카오 로그인 Redirect URI: `https://<project>.supabase.co/auth/v1/callback`
    - **클라이언트 시크릿** 코드 생성 + 활성화 ON
  - 제품 설정 → 카카오 로그인 → 활성화 ON
  - 카카오 로그인 → 동의 항목에서 "닉네임"·"프로필 사진" 필수/선택 동의 설정 (이메일은 미사용 — 비즈 앱 신청 회피)
  - Supabase Dashboard → Authentication → Providers → Kakao 활성화 + Client ID(REST API 키)·Client Secret 입력

작업 — 코드 (Codex):

- [x] `lib/actions/auth.ts`: `signInWithOAuthAction(provider: "google" | "kakao")` server action — `supabase.auth.signInWithOAuth({ provider, options: { redirectTo: '${origin}/auth/callback' } })` 호출 후 반환된 URL로 redirect
- [x] `app/auth/callback/route.ts`: `?code=...` 받아 `supabase.auth.exchangeCodeForSession(code)` → 프로필 존재 여부에 따라 `/` 또는 `/onboarding`으로 redirect (이미 존재했음)
- [x] `LoginForm`/login 페이지: 별도 [`OAuthButtons.tsx`](components/domain/OAuthButtons.tsx) 컴포넌트로 분리 + Google/카카오 버튼 활성화 + 로딩 상태
- [x] middleware는 그대로 (세션 갱신만)

작업 — 인증/온보딩 다크 리디자인:

- [x] `/login` ([app/login/page.tsx](app/login/page.tsx) + [components/domain/LoginForm.tsx](components/domain/LoginForm.tsx))
  - phone-frame 안에서 헤더 + 상단 야구장 배경(mask fade) + 콘텐츠
  - 인라인 SVG 야구공 + S 로고 (오렌지 stitching + 외곽 글로우)
  - 카카오 버튼: `#fee500` 채움 + 말풍선 SVG / Google 버튼: 다크 배경 + 4색 G SVG
  - 로그인/가입 segmented 탭 (활성 = 오렌지 outline + 오렌지 텍스트 + 외곽 글로우)
  - 다크 input + 포커스 시 오렌지 보더, 안내문 회색
- [x] `/onboarding` ([app/onboarding/page.tsx](app/onboarding/page.tsx) + [components/domain/OnboardingForm.tsx](components/domain/OnboardingForm.tsx))
  - phone-frame 안 단일 컨테이너 (이중 카드 X) + 상단 야구장 배경 mask fade
  - 닉네임 input + `n/10` 카운터, 팀 grid 2열 5행 + ✓ 마크
  - 안내 잠금 칩 + "다음" 큰 오렌지 버튼 (닉네임 2자 미만 disabled)
  - 기본 선택 팀 두산 (개발자 응원팀)
- [x] `/landing` — 기존 디자인 유지, "시작하기"는 `/login` 으로 redirect (Phase 8.7에서 처리됨)

테스트:

- [x] 콘솔 설정 후 Google 로그인 1회 수동 검증 (신규/기존 모두)
- [x] 콘솔 설정 후 카카오 로그인 1회 수동 검증 (신규/기존 모두)
- [x] OAuth 신규 사용자는 `/onboarding`, 기존 사용자는 `/`로 진입
- [x] 카카오 로그인 시 이메일 미수신 → Supabase가 자동 생성한 임시 이메일이 profiles 행에 정상 매핑되는지 확인
- [x] 로그인 페이지 다크 + 야구공 SVG/버튼 컬러 시안 일치
- [x] 온보딩 팀 선택 ✓ 마크 + 저장 후 `/`로 이동
- [x] 로그아웃 → `/landing` 흐름이 OAuth 사용자에게도 정상 동작
- [x] `npx tsc --noEmit` 통과

리뷰어 검수:

- [ ] OAuth callback 보안 (state/PKCE), 세션 쿠키, redirect 화이트리스트
- [ ] 다크 인증 화면이 Phase 8.7 토큰/패턴과 일관

진행 상태: Implemented / Reviewer Pending

### Phase 8.9. 익명 로그인 + 정식 계정 업그레이드

목표: 가입 마찰을 0으로 줄여 "일단 써보고 마음에 들면 가입" 흐름을 만든다. 첫 진입 시 자동 익명 세션 발급으로 직관 등록·후기 작성을 즉시 가능하게 하고, 친구 관리·다른 기기 동기화가 필요해지는 시점에 자연스럽게 정식 계정으로 업그레이드 유도한다.

원칙 (정책 C — 본인 데이터는 자유 + 일부 기능만 제한):

- Supabase 공식 익명 로그인(`signInAnonymously`) 사용 — 별도 백엔드 0
- 업그레이드 시 `user.id` 그대로 유지되어 그동안 쌓은 데이터 손실 없음
  - 이메일/비번: `supabase.auth.updateUser({ email, password })`
  - OAuth: `supabase.auth.linkIdentity({ provider: 'google' | 'kakao' })`
- **본인 데이터(직관/후기/사진/댓글/좋아요)는 모두 서버에 정상 저장** — `user.id` 동일하게 유지되므로 정식 가입 후에도 그대로 사용
- 익명 user는 디바이스 의존(폰 바꾸면 데이터 못 봄)이라는 한계를 사용자에게 명시
- 30일 미사용 익명 세션은 Supabase 자동 삭제 (설정 그대로)

기능별 권한 매트릭스:

| 기능 | 익명 | 정식 |
|---|---|---|
| 직관 등록 (수동/티켓 인증) | ✅ | ✅ |
| 본인 후기 작성/수정/삭제 | ✅ (단 **public 공개만**) | ✅ |
| 후기 좋아요 / 저장 / 공유 | ✅ | ✅ |
| 후기 댓글 작성/삭제 | ✅ | ✅ |
| 공지/이용안내 보기 | ✅ | ✅ |
| 프로필 사진 / 닉네임 / 팀 변경 | ✅ | ✅ |
| **친구 관리(검색/요청/추가)** | ❌ → 전환 모달 | ✅ |
| **후기 friends/private 공개** | ❌ disabled + 안내 | ✅ |
| **다른 기기 동기화** | ❌ → 전환 모달 | ✅ |

작업 — 인프라 (사용자):

- [x] Supabase Dashboard → Authentication → Providers → Anonymous sign-ins 활성화
- [x] RLS 정책 SQL 작성 + 적용 ([supabase/anonymous-policies.sql](supabase/anonymous-policies.sql)):
  - `reviews` INSERT/UPDATE: 익명 user(`auth.jwt()->>'is_anonymous' = 'true'`)는 `public_scope = 'public'`만 허용
  - `friend_requests` INSERT/UPDATE: 익명 user는 차단
  - `friends` INSERT/UPDATE: 익명 user는 차단
  - RESTRICTIVE 정책으로 기존 PERMISSIVE 정책과 AND 조건 결합

작업 — 코드 (Codex):

- [x] `lib/actions/auth.ts`: `signInAnonymouslyAction` server action — `supabase.auth.signInAnonymously()` + admin client로 기본 프로필 자동 생성 (`야구팬{user.id 앞 5자}` / 두산 / public)
- [x] `lib/actions/auth.ts`: `signInWithOAuthAction` 내부에 익명 분기 추가 — 익명이면 `linkIdentity({ provider, redirectTo: ?upgrade=1 })` 호출
- [x] `lib/actions/auth.ts`: `linkAnonymousToEmailAction(formData)` — `updateUser({ email, password })` 호출, `emailAuthAction`이 익명 감지 시 자동 위임
- [x] AppState에 `isAnonymous` 플래그 노출 (RootLayout에서 `auth.getUser().user.is_anonymous` 읽어 prop 전달)
- [x] 친구 관리 페이지 가드 (`FriendsScreen`): 익명이면 큰 자물쇠 빈 상태 + "정식 계정으로 전환" CTA → `/login`
- [x] 후기 작성 모달 공개 범위 가드 (`AppModals`): 익명이면 `friends`/`private` 칩 disabled + 토스트 안내
- [x] 마이 페이지 profile-card에 익명 user 전용 작은 오렌지 outline 칩 ("전환하면 다른 기기에서도 볼 수 있어요 →")
- [x] OAuth 자동 link: server action에서 `is_anonymous` 체크 후 `linkIdentity` vs `signInWithOAuth` 분기. 별도 모달 불필요
- [x] OAuth callback route: `?upgrade=1` 받으면 `/?notice=upgraded`로 redirect

작업 — UX 흐름 정리:

- [x] 랜딩 ([app/landing/page.tsx](app/landing/page.tsx)): "비로그인으로 시작하기" 버튼 + 클릭 시 **확인 모달** (디바이스 의존·기능 제한 안내 + 정식 전환 시 데이터 보존 녹색 박스) → 확인하면 `signInAnonymouslyAction`
- [x] `/login` 페이지: 익명 user 진입 시 redirect 안 하고 **upgrade 모드** 표시 — 녹색 안내 배너 + "지금은 그냥 사용하기" 링크 + 헤더 좌측 ← 뒤로가기
- [x] 온보딩 완료 시 `/`로 진입 (익명/정식 동일 흐름)
- [x] 마이 hero에 익명일 때 전환 CTA 칩

테스트:

- [x] 첫 방문 → 시작하기 → 익명 세션 + 프로필 생성 → 직관 등록 → 데이터 저장 확인 (수동)
- [ ] 익명 → 이메일 가입으로 업그레이드 → user.id 유지 + 직관 데이터 그대로 (수동 검증 필요)
- [ ] 익명 → Google/카카오 연동으로 업그레이드 → 동일 검증 (수동 검증 필요)
- [ ] 다른 브라우저/시크릿창 → 별도 익명 user 발급 (데이터 분리) 확인 (수동 검증 필요)
- [ ] 익명 user의 RLS 가드 확인 (Supabase 콘솔에서 SQL 적용 후 검증):
  - 후기 friends/private 작성 시도 → 거부
  - friend_requests INSERT 시도 → 거부
- [x] `npx tsc --noEmit` 통과

리뷰어 검수:

- [ ] 익명 → 정식 업그레이드 시 데이터 손실 / 중복 / 권한 누수 케이스 점검
- [ ] 봇/스팸 익명 user 누적 위험 평가 + 30일 자동 정리 검증

진행 상태: Implemented / Manual Upgrade QA Pending (Supabase Anonymous sign-ins 활성화 + `anonymous-policies.sql` 적용 완료, 익명 로그인 흐름 수동 검증 통과. 이메일/OAuth 정식 계정 업그레이드의 user.id 유지 검증은 운영 redirect 환경에서 추가 확인 필요)

### Phase 9. 반응형/접근성/시각 QA

목표: 화면을 실제 앱처럼 다듬고 깨짐을 제거한다.

작업:

- [x] **반응형 break point 적용** — 모바일(≤480px) phone-frame 풀스크린 + safe-area-inset, 태블릿(481~1024px) phone-frame 비율 유지(`aspect-ratio: 414/896`) + 화면 높이 100dvh, 데스크톱(>1024px) 기존 414×896 폰 프레임
- [ ] 360px, 414px, 768px, 1024px 이상 레이아웃 1:1 점검 (수동 QA — 실제 디바이스/실기 빌드 후)
- [ ] 색 대비 점검 (WCAG AA — 다크 배경 위 회색 텍스트 일부 alpha 0.45~0.55 점검)
- [ ] 버튼/탭/칩 focus state 점검 (키보드 탐색)
- [ ] 이미지 lazy loading 및 alt text 점검
- [ ] 스크롤 영역과 fixed tab bar 겹침 제거 (이미 phone-frame-dark에서 padding-bottom 92px 처리됨)
- [ ] 불필요한 장식/과한 색 사용 줄이기
- [ ] Next.js 이미지 최적화 적용 여부 점검

테스트:

- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] 브라우저 수동 QA (DevTools 디바이스 모드 + 실제 폰)
- [ ] 가능하면 Playwright 또는 브라우저 스크린샷 QA

리뷰어 검수:

- [ ] 리뷰어 에이전트가 전체 화면과 `data/design_brief.md`의 원칙을 대조해 최종 UI 리스크를 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Partial — 반응형 break point만 적용. 접근성/색대비/lint/build/수동 QA는 출시 직전 일괄 진행 예정

### Phase 9.5. 운영 페이지 (공지·이용안내·문의·약관)

목표: 서비스 운영에 필요한 정적/준정적 페이지를 갖춰 출시 자격을 만든다. 앱스토어 정책·개인정보보호법상 약관/개인정보처리방침은 출시 전 반드시 필요하고, 사용자 입장에서는 공지·이용안내·문의 채널이 있어야 신뢰감이 생긴다. 모든 페이지는 Phase 8.7 다크 토큰을 그대로 재사용.

원칙:

- 진입은 **마이 → 설정** 메뉴에 통합 (공지만 마이 헤더 우측 🔔 아이콘으로 1단계 노출)
- 공지는 운영자가 자주 바꾸므로 DB 기반, 나머지는 정적 페이지
- 문의하기는 MVP에선 mailto 링크로 시작 (운영 부담 0)
- 약관/개인정보처리방침은 변호사 검토 후 게시, 초안은 표준 템플릿 사용

작업 — 공지 (`/my/notices`):

- [x] DB: `notices` 테이블 신설 — id, title, body, is_pinned, published_at, created_at, updated_at — `supabase/notices.sql`
- [x] RLS: 모두 read 가능(published_at <= now()), write는 service role(운영자)만 — INSERT/UPDATE/DELETE 정책 미생성으로 차단
- [x] `lib/supabase/queries.ts`: `listNoticesFromDb()` (고정글 우선 + 최신순), `getNoticeByIdFromDb(id)`
- [x] `/my/notices` 리스트 페이지: 다크 카드 + 고정 핀 배지 + 작성일 + 본문 발췌
- [x] `/my/notices/[id]` 상세 페이지: 단순 줄바꿈 변환 (마크다운 라이브러리 미도입 — MVP에선 plain text + 줄바꿈으로 충분)
- [x] 새 공지 시 마이 헤더 공지 아이콘에 빨간 점(unread badge) — localStorage `notices.lastSeenAt` 비교
- [x] 운영자 입력 도구: Supabase Studio에서 직접 row 추가 (어드민 화면은 Phase 11 이후)

작업 — 이용안내 (`/my/help`):

- [x] 정적 페이지 — 직관 등록/티켓 인증/후기 작성/친구 관리/공유 5가지 핵심 흐름 + 짧은 설명
- [x] FAQ 아코디언 6문항 — 티켓 인증, 다른 기기, 응원팀 변경, 공개 범위, 직관 삭제, 친구 요청
- [x] 하단에 「더 궁금한 게 있으면 문의하기」 링크 → `/my/contact`

작업 — 문의하기 (`/my/contact`):

- [x] MVP: mailto 링크 (`mailto:support@oneul-seungyo.com?subject=...&body=...`) — 양식 템플릿(기기/닉네임/상황/기대동작) 자동 채움
- [x] 자주 묻는 질문 링크(`/my/help`)로 먼저 안내
- [ ] 폼 옵션 (Phase 11 이후): Resend / Slack webhook / 구글 시트

작업 — 약관/개인정보처리방침:

- [x] `/legal/terms` (이용약관) — 10개조 표준 템플릿 + 우리 서비스 특이사항(직관 데이터, 이미지 저장, 친구 기능, 비로그인 회원 정의)
- [x] `/legal/privacy` (개인정보처리방침) — 수집 항목, 이용 목적, Supabase·Gemini·Vercel 처리 위탁, 보유 기간, 제3자 제공, 회원 권리, 보호 조치, 책임자 안내
- [x] 시행일 명시 (2026-05-08)
- [ ] 로그인/온보딩에서 동의 체크박스 + 푸터 링크 (Phase 10 배포 전 추가)
- [ ] 변호사 또는 법률 자문 검토 (출시 전 필수 — 현재는 초안)

작업 — 진입 동선 + 설정 정리:

- [x] 마이 헤더 우측 🔔 공지 아이콘 추가 (AppShell `headerAction` prop 신설) + unread 빨간 점
- [x] 설정 페이지 재구성: 알림 / 후기 공개 범위 → 이용안내 / 문의하기 → 이용약관 / 개인정보처리방침 → 로그아웃
- [x] mock 메뉴 제거 (`내 팀 변경`, `개인정보 설정` mock) — 팀 변경은 마이 → 프로필 편집에서, 개인정보는 이용약관/개인정보처리방침으로 이동
- [x] 후기 공개 범위 토글 → 모달로 3개 옵션(전체/친구/나만) 명시 + DB 저장 (`updateProfileAction({ defaultPublicScope })`)
- [x] 익명 user는 후기 공개 범위 변경 disabled (정책 C: 익명은 public 만)

테스트:

- [x] `npx tsc --noEmit` 통과
- [x] `npm run lint` 에러 0 (기존 경고 3건만 잔존)
- [ ] Supabase에 `notices.sql` 적용 → Studio에서 샘플 공지 확인
- [ ] 공지 리스트/상세 + unread 배지 dev 서버에서 실측
- [ ] mailto 링크 실제 메일 앱 열림 확인
- [ ] 약관/개인정보 페이지 다크 토큰 일관성 확인

리뷰어 검수:

- [ ] 약관/개인정보 문구 법무 검토 (Phase 10 배포 전)
- [ ] notices RLS 정책에 사용자가 임의 INSERT 못 하는지 — INSERT 정책 미생성이므로 anon/authenticated 둘 다 차단됨, service role 만 통과

진행 상태: Implemented (사용자 SQL 적용 + dev 실측 후 Completed)

### Phase 10. 배포 준비

목표: Vercel 기준 실제 서비스 배포가 가능한 상태를 만든다.

작업:

- [ ] 환경변수 목록 정리 (`.env.example`, Vercel env, cron secret 기준 최종 표 필요)
- [ ] production build 확인
- [x] Vercel 배포 설정 일부 완료 — `CRON_SECRET` 운영 환경변수 재등록, Production redeploy, cron route 인증 복구는 2026-05-09 로그 기준 완료
- [ ] DB migration/seed 절차 문서화
- [ ] 스토리지 CORS/권한 정책 점검
- [x] Open Graph / 공유 메타데이터 설정 — `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, PWA `app/manifest.ts` 기준 구현 완료
- [x] PWA/홈 화면 추가 기반 정리 — standalone manifest, apple mobile web app 메타, safe-area 보정 적용
- [x] 공유 카드 실제 이미지 공유 — `html2canvas` 기반 Web Share API + 다운로드 fallback 구현
- [ ] 에러/로딩/빈 상태 최종 점검

테스트:

- [ ] 배포 환경 build 성공
- [ ] 배포 URL에서 주요 플로우 확인 (일부 실측 로그 있음. 최종 회귀 체크 필요)
- [ ] 모바일 실기기 또는 모바일 브라우저 viewport 확인 (iOS standalone 일부 확인. 전체 라우트 QA 필요)

리뷰어 검수:

- [ ] 리뷰어 에이전트가 배포 설정, 환경변수 누락, 공개 권한 리스크를 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: In Progress / MVP Launch Prep Partial

### Phase 11. 인수 문서와 마무리

목표: 다음 작업자가 상태를 정확히 이어받게 한다.

작업:

- [ ] README 업데이트: 실행, 빌드, 주요 폴더, 디자인 기준
- [x] WORKPLAN 정합성 1차 정리 — 실제 코드 기준으로 기술 스택, 게임 상세 보류 상태, Phase 8.9 수동 QA 대기, Phase 10 진행 상태를 갱신
- [ ] 구현 화면 목록 갱신
- [ ] 남은 TODO 정리
- [ ] 알려진 제한사항 기록
- [ ] 최종 리뷰어 검수 완료

테스트:

- [ ] clean checkout 기준 실행 가능 여부 확인
- [ ] 빌드 산출 확인

리뷰어 검수:

- [ ] 리뷰어 에이전트가 문서와 실제 구현 상태가 맞는지 확인
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: In Progress / WORKPLAN 정합성 1차 정리 완료

## 6. 병렬 작업 전략

사용자가 명시적으로 서브 에이전트 병렬 작업을 허용한 경우, 구현 단계에서 다음처럼 분리할 수 있다.

### 병렬화 가능한 단위

- Agent A: 디자인 토큰, 공통 컴포넌트, AppShell
- Agent B: 홈/랜딩/온보딩 화면
- Agent C: 일정/경기 상세/팀 순위 화면
- Agent D: 커뮤니티/마이/설정 화면
- Agent E: 모달/공유 카드
- Agent F: 데이터 모델/API 설계
- Agent G: 인증/DB/스토리지 연동
- Reviewer Agent: 단계 종료마다 구현 결과와 문서를 검토

### 충돌 방지 규칙

- 각 worker는 자기 소유 파일 범위를 명확히 받고, 다른 worker의 변경을 되돌리지 않는다.
- 공통 컴포넌트와 디자인 토큰은 Phase 2에서 먼저 합의한다.
- 동시에 수정할 수 있는 공유 파일은 최소화한다.
- 공통 mock data 변경은 한 에이전트가 소유한다.
- schema/API 작업자는 UI 컴포넌트 파일을 직접 수정하지 않고 타입/서버 경계만 소유한다.
- reviewer는 직접 대규모 수정하지 않고, 발견사항을 우선 보고한다. 필요한 작은 수정만 담당자가 반영한다.

### 리뷰어 에이전트 체크 프롬프트 예시

```text
이 단계 산출물을 data/design_brief.md, WORKPLAN.md, data의 디자인 시안 PNG와 비교해 리뷰해줘.
중점 검토:
- KBO/구단 로고를 사용하지 않았는가
- 디자인 토큰과 팀 컬러 규칙을 지켰는가
- 모바일 360-414px 기준에서 레이아웃이 깨지지 않는가
- 단계 범위 밖의 불필요한 리팩터링이 없는가
- 테스트/빌드 결과가 문서에 기록되어 있는가
결과는 심각도 순서로 파일/라인 기준 findings를 먼저 적고, 마지막에 통과/보류 결론을 적어줘.
```

## 7. 단계 완료 기준

한 Phase는 아래 조건을 모두 만족해야 완료로 표시한다.

- [ ] 해당 Phase 작업 체크박스 완료
- [ ] 테스트 체크박스 완료 또는 불가 사유 기록
- [ ] 리뷰어 에이전트 검수 완료
- [ ] 리뷰 findings 처리 또는 보류 사유 기록
- [ ] 이 문서의 진행 상태 갱신

## 8. 진행 현황 요약

| Phase | 상태 | 담당 | 마지막 업데이트 |
|---|---|---|---|
| Phase 1. 프로젝트 스캐폴딩 | Completed / Reviewed | Codex | 2026-05-06 |
| Phase 2. 디자인 토큰/공통 컴포넌트 | Completed / Reviewed | Codex | 2026-05-06 |
| Phase 3. 홈/랜딩/온보딩 | Completed / Reviewed | Codex | 2026-05-06 |
| Phase 4. 일정/경기 상세/팀 순위 | Completed / Reviewed (게임 상세는 Phase 8.7에서 보류) | Codex | 2026-05-08 |
| Phase 5. 커뮤니티/마이/설정 | Completed / Reviewed | Codex | 2026-05-06 |
| Phase 6. 모달/공유 카드 | Completed / Reviewed | Codex | 2026-05-06 |
| Phase 6.5. 프론트 인터랙션 완성 | Completed / QA Passed | Codex + Subagents | 2026-05-06 |
| Phase 6.8. 추가 수정사항 | Completed / QA Passed | Codex | 2026-05-06 |
| Phase 7. 서비스 데이터 모델/API 설계 | Implemented / Reviewer Pending | Codex | 2026-05-06 |
| Phase 8. 인증/DB/스토리지 연동 | Implemented / Protected-route QA Pending | Codex | 2026-05-07 |
| Phase 8.5. 외부 데이터 연동 | Implemented / Vercel Cron QA Pending | Codex | 2026-05-09 |
| Phase 8.6. 후기 댓글 기능 | Completed | Codex | 2026-05-08 |
| Phase 8.7. 다크 컨셉 전면 리디자인 | Completed | Codex | 2026-05-08 |
| Phase 8.8. 소셜 로그인(Google + 카카오) + 인증/온보딩 다크 리디자인 | Implemented / OAuth Manual QA Passed, Reviewer Pending | Codex | 2026-05-08 |
| Phase 8.9. 익명 로그인 + 정식 계정 업그레이드 | Implemented / Manual Upgrade QA Pending | Codex | 2026-05-09 |
| Phase 9. 반응형/접근성/시각 QA | Partial (반응형/PWA 일부 완료, 접근성·색대비·최종 lint/build 대기) | Codex | 2026-05-09 |
| Phase 9.5. 운영 페이지 (공지·이용안내·문의·약관) | Implemented / Supabase Notice QA Pending | Codex | 2026-05-09 |
| Phase 10. 배포 준비 | In Progress / MVP Launch Prep Partial | Codex | 2026-05-09 |
| Phase 11. 인수 문서/마무리 | In Progress / WORKPLAN 정합성 1차 정리 완료 | Codex | 2026-05-09 |

## 9. 리뷰 로그

리뷰어 에이전트 검수 후 아래 형식으로 누적한다.

```text
### YYYY-MM-DD Phase N 리뷰
- Reviewer:
- 범위:
- 테스트:
- 결론: Pass / Pass with Notes / Blocked
- Findings:
  - P0/P1/P2/P3: 내용, 파일, 라인
- 후속 조치:
```

### 2026-05-06 Phase 1-6 리뷰
- Reviewer: Bacon
- 범위: Phase 1-6 구현물, WORKPLAN, 디자인 브리프, 주요 라우트
- 테스트: `npm.cmd run lint` 통과, `npm.cmd run build`는 샌드박스 `spawn EPERM` 후 외부 권한 재실행 통과
- 결론: Pass with Findings
- Findings:
  - P1: `components/domain/AppModals.tsx` 모달이 정적 UI로 남아 submit/state 경계가 부족함
  - P1: mock data가 화면별 정적 import로 흩어져 등록/후기 반영이 어려움
  - P1: `/my/friends`, `/my/reviews`가 전용 화면이 아니라 다른 화면을 재사용함
  - P2: 데스크톱 사이드 네비 미구현
  - P2: 상세 페이지가 잘못된 ID를 첫 번째 데이터로 대체함
- 후속 조치:
  - Phase 6.5에서 `AppStateProvider`를 추가하고 직관/후기/좋아요/저장/설정 mock state를 연결함
  - 직관 등록/후기 작성/공유 모달 submit 흐름을 mock action에 연결함
  - `/my/friends`, `/my/reviews` 전용 화면을 추가함
  - 상세 페이지 missing ID 처리는 빈 상태 패널로 보완함
  - 경기 상세에서 해당 경기 기준 직관 등록 모달이 열리도록 연결함
  - 데스크톱 전용 레이아웃은 Phase 9 반응형/접근성/시각 QA 범위로 남김

### 2026-05-06 Phase 6.5 QA
- Reviewer: Codex
- 범위: Phase 6.5 잔여 보완, 주요 라우트, 상세 missing ID 처리
- 테스트: `npm.cmd run lint` 통과, `npx.cmd tsc --noEmit` 통과, `npm.cmd run build` 통과
- 라우트 확인: `/`, `/games/game-lg-doosan`, `/games/missing`, `/reviews/review-1`, `/reviews/missing` 모두 `200 OK`
- 결론: Pass
- Findings: 없음
- 후속 조치:
  - 실제 API 연결 전 모바일 실사용 클릭 QA를 계속 진행한다.
  - 태블릿/데스크톱 확장 레이아웃은 Phase 9에서 처리한다.

### 2026-05-09 WORKPLAN 정합성 리뷰
- Reviewer: Codex
- 범위: WORKPLAN 현재 상태표, Phase 8/8.7/8.9 상충 기록, 실제 코드 상태 확인
- 테스트/확인:
  - `app/games/[id]/page.tsx`가 현재 `/schedule` redirect임을 확인
  - `lib/actions/auth.ts`에 익명 로그인/계정 연동 코드(`signInAnonymously`, `linkIdentity`, `linkAnonymousToEmailAction`)가 있음을 확인
  - `lib/actions/ticket.ts`, `lib/actions/attendance.ts`, `components/domain/AppModals.tsx`에 티켓 사후 인증, 경기 종료 확인, `html2canvas` 공유 카드 기능이 있음을 확인
  - `app/manifest.ts`, 공지 query/page, `AppShell.headerAction` 존재 확인
- 결론: Pass with Notes
- Findings:
  - P1: 진행 현황 요약이 최신 작업 로그와 어긋나 Phase 1-6, 8.5, 8.9, 9.5, 10, 11 상태를 현재 기준으로 갱신함
  - P1: 게임 상세 페이지가 DB 조회 완료와 redirect 보류로 상충되어 현재 redirect 상태로 문구를 정리함
  - P2: Phase 8.9는 익명 로그인 자체는 검증됐지만 이메일/OAuth 업그레이드 수동 검증이 남아 있어 `Manual Upgrade QA Pending`으로 조정함
  - P2: 초기 스캐폴딩 전제 문구가 남아 있어 현재 Next.js/Supabase/Vercel/Gemini/KBO 동기화 스택 설명으로 갱신함
- 후속 조치:
  - Phase 9 잔여 QA(`lint`, `build`, 색 대비, focus, 모바일 실기기)를 완료한 뒤 Phase 10 상태를 다시 갱신한다.
  - 초기 Supabase 적용 문서 2종은 현재 상태와 달라 혼란을 줄 수 있어 삭제하고, 실제 기준은 `docs/product-spec.md`, `supabase/*.sql`, `lib/actions/*`, `lib/supabase/*`로 단순화한다.

## 10. 의사결정 로그

- 2026-05-05: KBO 구단 로고는 사용하지 않는다. 팀명/팀 컬러/이니셜 기반의 추상 배지를 사용한다.
- 2026-05-05: GPT 생성 이미지는 앱 어셋으로 사용하되, UI 텍스트와 주요 컴포넌트는 HTML/CSS로 구현한다.
- 2026-05-05: 단계 종료마다 리뷰어 에이전트 검수를 진행하고 이 문서에 결과를 기록한다.
- 2026-05-05: 실제 서비스/배포까지 이어갈 수 있도록 Vite SPA가 아니라 Next.js App Router 기반으로 시작한다.
- 2026-05-05: Phase 1-3 범위의 홈 확인용 Next.js 목업을 구현했다. 현재 URL은 로컬 개발 서버 `http://127.0.0.1:3000`이다.
- 2026-05-05: Phase 4-6 범위의 일정/경기상세/팀순위/커뮤니티/마이/설정/모달 목업을 구현했다. 실제 API 연결은 Phase 7 이후로 보류한다.
- 2026-05-06: 실제 API 연결 전에 mock data/client state 기반 프론트 인터랙션을 완성하는 Phase 6.5를 추가한다.
- 2026-05-06: 앱의 최우선 개인화 기준은 사용자가 선택한 `내 팀`으로 둔다. 홈 승률 카드, 마이 프로필, 일정 우선 노출, 프로필 편집의 팀 변경 흐름에 반영하며, 실제 서비스에서는 팀 변경을 하루 1회로 제한한다.
- 2026-05-06: Phase 7은 Supabase 기준으로 진행한다. 산출물은 당시 `supabase/schema.sql`, `lib/types/api-contracts.ts`, Phase 7 데이터 계약 문서에 분리해 기록했다. 현재 Phase 7 별도 문서는 삭제했고, 실제 기준은 `supabase/*.sql`과 구현 코드다.
- 2026-05-06: Phase 8을 시작했다. Supabase SDK, client/server/middleware, seed/storage SQL, read query와 일부 서버 액션 경계를 추가했다. 원격 Supabase SQL 적용은 사용자가 대시보드에서 진행해야 한다.
- 2026-05-06: Phase 7에서 전략만 정의되어 있던 KBO 일정/순위 자동 동기화와 티켓 Vision 인증을 별도 단계로 분리해 Phase 8.5(외부 데이터 연동)를 신설한다. 외부 API 연동, cron 스케줄링, 부정 방지 정책을 한 곳에서 관리한다.
- 2026-05-06: Phase 8 코드 작업을 마무리했다. Supabase 이메일 확인 redirect를 처리하는 `/auth/callback` route handler를 추가하고, 당시 Supabase 적용 체크리스트(SQL 4종 실행 순서, Auth URL 등록, env, 1회 회원가입 검증)를 별도 문서로 정리했다. 해당 초기 문서는 2026-05-09에 삭제했고, 현재 기준은 `supabase/*.sql`, `.env.example`, 실제 구현 코드다. `npm run lint`/`npm run build` 모두 통과. 남은 항목은 사용자가 Supabase 대시보드에서 SQL을 적용하고 회원가입~후기 작성 4종 플로우를 실측 확인하는 것뿐이었다.
- 2026-05-07: Phase 8 실측 라운드를 마쳤다. 발견된 이슈들과 해결:
  - `auth.users.on_auth_user_created` 트리거가 회원가입을 막는 원인이라 제거.
  - schema.sql이 attendances 이후로만 적용되어 있어서 `reviews`/`review_likes`/`review_saves`/`friends`/`friend_requests`/`notifications` 6개 테이블 + `profile_stats`/`verified_attendance_results` view 누락. `supabase/fix-reviews.sql` + `supabase/fix-views.sql`로 일괄 복구.
  - `@supabase/ssr` 0.10이 PostgREST에 JWT를 일관되게 못 넘겨 RLS-protected SELECT가 빈 결과를 주는 이슈를 회피하기 위해, 모든 사용자 데이터 read/write를 `auth.getUser()` 확인 후 admin client(service role)로 수행하는 패턴으로 통일 (`profiles SELECT`는 public-readable 정책 추가로 우회).
  - mock data를 코드에서 완전 제거(`lib/mock/`, `WeekCalendar.tsx` 삭제).
  - `process.env[key]`(동적) → `process.env.NEXT_PUBLIC_X`(정적)으로 변경. Next.js 빌드 시 동적 접근은 치환 안 돼 브라우저에서 undefined가 되는 함정.
  - 직관/후기 삭제 server action(`deleteAttendanceAction`/`deleteReviewAction`)이 DB 행 삭제뿐 아니라 review-photos/ticket-images 버킷의 Storage 객체도 같이 정리하도록 함.
  - 후기 본문 hashtag 자동 추출, 줄바꿈 보존, 자동 부착 텍스트(제목/태그/추가 문장) 제거.
- 2026-05-07: Phase 8.5 KBO 동기화 부분을 완성했다. 데이터 소스는 KBO 공식 API(`koreabaseball.com/ws/Main.asmx/GetKboGameList`) 1순위 + 네이버 스포츠 HTML/JSON 폴백을 채택했다(이전 BET 프로젝트 참고). 클라이언트(`lib/server/kbo/*`), upsert 로직(`syncGames`/`syncStandings`), CRON_SECRET 인증 cron route 2종, Vercel cron 스케줄(03:00 주간/14-23시 30분 스코어/02:30 순위), 2026 시즌 bulk load 스크립트(675경기 적재 완료), standings 동기화 스크립트(form 자동 계산)까지. Vision 인증과 부정 방지는 후속 라운드.
- 2026-05-07: 티켓 Vision 인증 SDK는 **Anthropic Claude → Google Gemini로 변경**. Anthropic API가 결제 충전 필수인데 사용자 카드(JCB) 결제 실패 + 일정 단축 목적. Gemini 2.5 Flash는 무료 티어가 하루 1,500회로 충분하고 한국어 OCR 정확도가 높다. `@google/genai` SDK 사용, `lib/server/vision/parseTicket.ts`에서 JSON 구조화 응답으로 (날짜/홈팀/원정팀/구장) 추출.
- 2026-05-07: 티켓 인증 정책을 **단순화**. 원안의 "Vision 결과 일자가 미래면 거절" 룰은 빠짐 — 티켓을 며칠 전에 받는 것이 정상이라 사용자 경험을 해친다. 새 정책: **티켓 업로드 = `verified=true`**, 부정 방지는 (1) SHA-256 hash 중복 차단, (2) 동일 사용자+경기 unique constraint 두 가지로만. Vision은 어떤 경기 티켓인지 매칭하기 위한 OCR 용도에 집중.
- 2026-05-07: 티켓 등록 흐름은 **자동 채움 + 사용자 확인** 방식. 사진 업로드 즉시 `previewTicket` server action(DB write 없음)이 Vision 분석 + 게임 매칭 + 응원팀 추천을 수행해 모달 폼을 자동 채우고, 사용자가 등록 버튼을 누르면 그제서야 `registerAttendanceFromTicket`이 Storage 업로드 + DB insert를 실행. 자동 채움/자동 등록 모두 가능했지만 사용자 검토 단계를 두는 게 신뢰감 있음.
- 2026-05-07: 후기 댓글 기능을 **Phase 8.6으로 추가**. 원래 Phase 2 스펙에서 "댓글 Phase 2"로 미뤄둔 것이지만, Phase 8/8.5에서 admin client + RLS 정책 패턴이 안정화돼서 1시간 내 추가 가능했음. flat 리스트, 본인/후기 owner만 삭제, 가시성은 후기 publicScope를 따름. `supabase/add-comments.sql`로 테이블 + RLS + 인덱스 + 트리거를 일괄 적용.
- 2026-05-08: **Phase 8.7 다크 컨셉 전면 리디자인**. `data/oneul-seungyo-home-spec`의 design-tokens/wireframe을 기준점으로 잡고, 시안 이미지(main/calender/community/mypage/livelist/ticket_collection/myreviews/review_detail/friends/setting/write_review/registration/profile_edit/share)를 1:1 대조하며 모든 페이지·모달을 다크 프리미엄 스포츠 대시보드 스타일로 통일. AppShell `theme="dark"` prop 도입으로 페이지별 진입만으로 다크 적용, 모달은 panelClassName 기반 override. 함께 추가된 기능 — 다음 직관 페이지네이션+슬라이드 애니메이션, 후기 이미지 캐러셀, 게임 메타 행, 본문 line-clamp(3줄), 무한 스크롤(cursor pagination), 후기 수정/삭제(상세 ⋯ 메뉴), 프로필 사진(이전 사진 즉시 삭제 옵션 A), 로그아웃, 비로그인 → 랜딩 redirect. 경기 상세는 추후 버전으로 보류 → `/games/[id]` redirect로 진입 차단. 인증/온보딩 페이지(login/landing/onboarding)는 Phase 8.8 OAuth 작업과 함께 다룸.
- 2026-05-08: **Phase 9.5 운영 페이지(공지·이용안내·문의·약관)** 신설. 출시 자격을 갖추기 위한 단계 — 공지(`notices` 테이블), 이용안내/FAQ 정적 페이지, 문의하기(MVP는 mailto, 폼은 추후 옵션), 이용약관/개인정보처리방침. 모두 마이→설정 메뉴에 진입 동선 통합. 운영자 입력은 처음에 Supabase Studio에서 직접 row 추가하는 방식으로 시작해 어드민 화면 부담을 줄이고, 약관/개인정보는 변호사 검토 후 게시. Phase 8.7 다크 토큰을 그대로 재사용.
- 2026-05-08: **Phase 8.8 소셜 로그인 + 인증/온보딩 다크 리디자인 완료**. Google + 카카오 OAuth 모두 콘솔 설정(사용자) + 코드(`signInWithOAuthAction`, `OAuthButtons`, 기존 `/auth/callback` 재활용) 완료. 카카오는 디벨로퍼스 콘솔 메뉴 개편(2026 초)으로 사이트 도메인/Redirect URI/Client Secret이 모두 **플랫폼 키 → REST API 키** 단일 페이지로 통합되어 가이드도 그에 맞춰 업데이트. 로그인 페이지는 phone-frame 안에서 야구장 야간 배경(상단 mask fade) + 인라인 SVG 야구공+S 로고 + 카카오 노랑/Google 다크 OAuth 버튼 + segmented 탭. 온보딩은 phone-frame 단일 컨테이너로 정리(이중 카드 X), 닉네임/팀 grid 2열 + ✓, 기본 팀 두산. 함께 진행한 Phase 8.7 후속 보완 — 일정 segmented(기본/시리즈/팀 순위) + 시리즈 보기 모드 + 결과 행(스윕/위닝/루징/스윕패), 캘린더 가변 주, 팀 순위 다크, 홈 빈 상태 카드, 프로필 저장 admin client 패턴 통일(RLS 우회) + AppState SSR 동기화 useEffect, 팀 변경 하루 1회 제한 임시 해제.
- 2026-05-08: **Phase 8.9 익명 로그인 + 정식 계정 업그레이드** 신설. 가입 마찰을 0으로 줄여 "체험 → 가입" 흐름을 만들기 위한 단계. Supabase 공식 익명 로그인(`signInAnonymously`) + `linkIdentity`/`updateUser`로 업그레이드해 user.id를 유지한 채 데이터 손실 없이 정식 계정으로 전환. 익명 user는 디바이스 의존이라는 한계가 있으므로, 친구 관리/공유/다른 기기 동기화가 필요한 시점에 자연스럽게 전환 모달을 띄우는 흐름. 익명 user의 RLS 권한은 정식 user보다 좁게(public 공개만 허용) 잡아 봇/스팸 위험을 완화. Phase 8.8 종료 후 진행.
- 2026-05-08: **Phase 8.8 소셜 로그인 + 인증/온보딩 다크 리디자인** 신설. 이메일/비번 가입 마찰을 줄이기 위해 Google + 카카오 OAuth를 함께 추가(Supabase Auth Provider 공식 지원 + `app/auth/callback/route.ts`). 카카오는 처음에 보류했으나 Supabase가 카카오 provider를 공식 지원해 Google과 절차가 거의 동일한 점(콘솔 설정 + `provider: 'kakao'` 한 줄)을 확인하고 함께 진행하기로. 카카오는 **개인 앱**으로 진행 — 닉네임/프로필 사진만 동의항목으로 사용해 비즈 앱 신청을 회피(이메일은 Supabase가 임시 이메일을 자동 생성). 동시에 `/landing` `/login` `/onboarding` 세 화면을 Phase 8.7 토큰/패턴과 동일한 다크 컨셉으로 리디자인. 콘솔 설정(Google Cloud + 카카오 디벨로퍼스 + Supabase Dashboard)은 사용자가 직접 처리하고, 코드는 Codex가 담당.
- 2026-05-08: **Phase 8.9 익명 로그인 완료**. 정책 C(본인 데이터는 자유 + 친구 관리/일부 공개 범위만 제한)로 구현. `signInAnonymouslyAction` + admin 자동 프로필 생성 / `signInWithOAuthAction`이 `is_anonymous` 감지 시 `linkIdentity` 자동 분기 / `linkAnonymousToEmailAction` + `emailAuthAction` 위임으로 user.id 유지하며 정식 전환. 랜딩의 "비로그인으로 시작하기" 클릭 시 디바이스 의존·기능 제한을 알리는 정보 제공형 confirm 모달 + 정식 전환 시 데이터 보존 녹색 안내 박스. `/login` 페이지는 익명 user 진입 시 redirect 안 하고 "정식 계정으로 전환" upgrade 모드(녹색 배너 + 헤더 ← 뒤로 + "지금은 그냥 사용하기" 링크)로 자동 전환. 친구 관리는 익명이면 자물쇠 빈 상태 + 전환 CTA, 후기 작성 공개 범위는 friends/private 칩 disabled. RLS는 `supabase/anonymous-policies.sql`에 RESTRICTIVE 정책으로 작성(reviews는 public만, friend_requests/friends 전면 차단). Supabase Anonymous sign-ins 활성화 + SQL 적용은 사용자 작업.
- 2026-05-08: **Phase 8.9 인프라 적용 완료**. Supabase Dashboard → Anonymous sign-ins ON + `supabase/anonymous-policies.sql` 적용 완료. 랜딩 → 비로그인 시작 confirm → 익명 세션 + 프로필 자동 생성 → 온보딩 → 홈 흐름 수동 검증 통과. linkIdentity/updateUser 업그레이드 흐름은 코드 적용 완료, 실제 데이터 마이그레이션은 운영 도메인 배포 후 OAuth Redirect 활성화 시 추가 검증 예정.
- 2026-05-08: **Phase 9.5 운영 페이지 구현 완료(Implemented)**. IA 결정 — 공지만 마이 헤더 우측 🔔 아이콘으로 1단계 노출(unread 배지), 이용안내·문의·약관·개인정보는 마이 → 설정 메뉴 통합. 공지: `supabase/notices.sql`(테이블 + read RLS, write 미생성으로 service role 만 작성 가능) + `listNoticesFromDb`/`getNoticeByIdFromDb` + `/my/notices` 리스트/상세 + `notices.lastSeenAt` localStorage 기반 unread 배지. AppShell에 `headerAction` prop 신설(다른 페이지에서도 재사용 가능). 이용안내: 5가지 핵심 기능 카드 + FAQ 6문항 아코디언 + 문의 CTA. 문의: mailto 링크 + 양식 템플릿(기기/닉네임/상황/기대동작 자동 채움) + FAQ 우선 안내. 약관: 10개조 표준 템플릿 + 비로그인 회원 정의 추가. 개인정보처리방침: 수집 항목·이용 목적·처리 위탁(Supabase/Gemini/Vercel)·보유 기간·회원 권리·보호 조치 명시. 약관/개인정보의 한국어 큰따옴표는 React unescaped entities 회피 + 법률 문서 표준에 맞춰 「 」(겹낫표)로 표기. 설정 페이지 재구성 — mock 메뉴(`내 팀 변경`, `개인정보 설정`) 제거, 공개 범위 토글 → 모달로 3개 옵션 명시 + DB 저장 + 익명 disabled. ui-card margin-top 다크 테마 0 처리(마이 페이지 헤더-프로필 간격이 다른 페이지보다 14px 넓던 문제 해결). 사용자 작업 — Supabase에 `notices.sql` 적용 + dev 서버에서 실측.
- 2026-05-08: **Phase 9 반응형 break point 부분 적용**. `app-backdrop` + `phone-frame`에 미디어쿼리 추가 — 모바일(≤480px)은 phone-frame이 화면 100% 차지 + 둥근모서리/그림자 제거 + `env(safe-area-inset-*)` 처리, 태블릿(481~1024px)은 `aspect-ratio: 414/896`으로 폰 비율 유지하면서 화면 높이 100dvh 활용, 데스크톱(>1024px)은 기존 414×896 폰 프레임. 접근성/색대비/lint/build/수동 QA 등 나머지는 출시 직전 일괄 진행 예정.
- 2026-05-09: **MVP 출시 준비 마무리 라운드**. 큰 묶음으로:
  - **PWA**: manifest.ts(standalone, ko_KR, theme #06101e), `apple-touch-icon`, `apple-mobile-web-app-capable`, `viewport-fit=cover`. 마스코트 500×500 투명 PNG(TinyPNG 압축, public/assets/ 27MB → 6MB ~77% 감소). iOS는 "홈 화면에 추가" → 풀스크린 standalone 동작 확인.
  - **첫 인상 funnel 가속**: `/login`, `/onboarding`, `/`, `/community`, `/schedule`, `/my/*` 에 `loading.tsx` 스켈레톤 추가, Supabase preconnect + dns-prefetch, 랜딩 hero preload, `/landing` static 보장. 첫 페이지 진입 시 다크 풀스크린 initial-loader(`document.documentElement[data-loaded]` 토글 + 1.5s CSS fallback). `<a href>` 30+곳을 모두 `next/link prefetch`로 마이그레이션 → 풀 페이지 리로드 제거 → 체감 속도 200~500ms → 50~100ms. CSS `:active` scale(0.97) + brightness 시프트로 즉시 탭 피드백 추가.
  - **로그인/온보딩 폼 pending 피드백**: `useFormStatus`로 SubmitButton 분리, "처리 중..."/"시작하는 중..." + 스피너. ContactScreen은 client 컴포넌트로 전환하면서 PC mailto 폴백을 클립보드 + Gmail 웹 compose 링크 2단으로 제공.
  - **SEO foundation**: layout metadata에 metadataBase + title template + 한국어 키워드 + OpenGraph(ko_KR, mainherobg.png 1448×1086) + Twitter summary_large_image + robots 인덱싱 허용. `app/sitemap.ts`(공개 6개 URL) + `app/robots.ts`(`/`, `/my/*`, `/api/`, `/auth/`, `/community`, `/reviews/` 차단, 네이버 Yeti도 동일 룰).
  - **티켓 인증 사후 등록**: `verifyAttendanceWithTicket` 액션 — 미인증 직관에 티켓 사진을 추가 검증해 verified 처리. 게임 일치 검증(date + 두 팀 set 비교)이 핵심, 불일치 시 "이 티켓은 N월 M일 X vs Y" 안내. `VerifyTicketModal` 다크 picker + 분석 팁. `MyAttendancesScreen` 미인증 칩 옆에 "🎫 인증하기" 주황 칩.
  - **경기 종료(on-demand finalize) + 결과 축하 모달**: `finalizeAttendanceAction` — DB 우선(이미 finished면 즉시 결과), 아니면 `syncGamesForDate` 호출. `games.last_synced_at` 컬럼(`supabase/game-sync-throttle.sql`) + 60초 throttle로 click storm 시 KBO 호출 분당 1회 제한. HomeScreen 다음 직관 카드: 경기 시작 시간 지나면 헤더가 "다음 직관 → 🔴 현재 직관"(주황 + pulse) 으로 동적 전환, 하단에 "🏁 경기 종료" 버튼 + "확인 중..." 스피너. `AttendanceResultModal` 풀스크린 — win은 마스코트 cheer + 사전 폭죽(::before/::after) + 80개 랜덤 confetti(CSS var 기반 drift/rotate/duration), lose는 default 마스코트 + 위로, draw는 bat 마스코트 + 균형. `markAttendanceResult` 클라이언트 state 즉시 업데이트로 모달 깜빡임 fix(이전엔 router.refresh가 Suspense 경계 재트리거해 모달이 0.1초만 보이고 사라졌음). 최근 직관 카드는 `<button>`으로 전환해 클릭 시 `buildResultPayload`로 모달 재생, 결과 모달의 "후기 작성하기"는 결과 닫고 즉시 후기 작성 모달을 해당 직관으로 열기(`initialAttendanceId` 활용).
  - **KBO 시즌 데이터 정상화**: 운영 도메인의 `CRON_SECRET` 환경변수가 비어 있어 cron 인증이 모두 401로 실패하던 것을 새 secret 발급 + `.env.local` + Vercel env vars + Production redeploy로 정리. 사용자가 curl 4-batch(3-4월/5-6월/7-8월/9-11월)로 시즌 일정 수동 백필. 그 후 `scope=week` cron 윈도우를 어제+6일 → **어제+30일**로 확장 + `maxDuration: 60s` → 매일 cron 한 번으로 한 달 앞 일정까지 자동 흡수, 향후 수동 backfill 불필요. `/schedule` 페이지 SSR 조회 범위도 현재월 ±1 → **2~12월**로 늘려 캘린더가 시즌 전 구간 탐색 가능.
  - **공유 카드 실제 이미지 공유**: `html2canvas` 도입(동적 import로 번들 sizes 분리), `share-card-preview`에 ref + 일반 `<img crossOrigin="anonymous">`(next/image fill은 캡처 안정성 떨어짐). canvas → dataURL → File로 변환 후 `navigator.canShare({ files })` 검증 통과 시 `navigator.share({ files, title, text })` 호출 — 카톡·인스타·문자에 진짜 카드 PNG가 사진으로 첨부, 텍스트엔 URL 포함. iOS Safari 200ms 대기, iPadOS는 `MacIntel + maxTouchPoints > 1`로 별도 감지. PC/미지원 브라우저 fallback은 `<a download>` PNG 저장 + 클립보드 텍스트 복사. 공유 카드 비율은 배경 이미지(9:16)와 동일하게 맞춰 잘림 없음(max-width 250px), 템플릿 썸네일은 카드와 무관한 1:1 정사각형으로 독립 배치. 카드/썸네일 각각 `max-width: 280px` 영역 내 `margin: 0 auto`로 중앙 정렬, picker active 시 우상단 주황 ✓ 배지.
  - **자잘한 일관성 보강**: 하단탭 `safe-area-inset-bottom` 처리해 iOS Safari URL바와 겹침 해결, 마이 페이지 헤더 ↔ 첫 카드 간격이 다른 페이지보다 14px 넓던 문제(`.ui-card margin-top: 14px`이 다크 테마 flex gap과 중복) 해결, 후기 상세의 ← 뒤로가기를 페이지 상단 헤더로 이동(다른 페이지와 통일된 backHref 패턴), 모든 화면의 "직관 등록" 버튼 라벨을 "예정 직관 등록"/"이전 직관 등록"로 분기해 신규 사용자 마찰 감소, 마스코트 결과 모달 사이즈 140 → 210(1.5×) + drop-shadow 강화, 최근 직관 카드 점수가 두 자리(`14`)에서 줄바꿈되던 것을 `white-space: nowrap` + `letter-spacing: -0.04em` + 팀 배지 `flex-shrink: 0`으로 한 줄 유지.

진행 상태: 출시 직전 폴리시 라운드 완료. 남은 항목 — Phase 9 잔여 QA(접근성/lint/build), Phase 10 배포 점검, Phase 11 인수 문서.
