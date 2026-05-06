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

저장소가 현재 비어 있으므로 다음 스택을 기본으로 한다.

- Next.js App Router
- TypeScript
- Tailwind CSS
- lucide-react 아이콘
- Mock data 기반 UI 목업
- 이후 인증: NextAuth/Auth.js 또는 Supabase Auth
- 이후 DB: PostgreSQL + Prisma 또는 Supabase
- 이후 이미지 저장소: Supabase Storage 또는 S3 계열
- 배포: Vercel 우선

네트워크 제한이 있을 수 있으므로 패키지 설치가 막히면 사용자 승인 후 진행한다. 설치가 어려운 경우에도 최종 목표 스택은 Next.js로 유지하고, 의존성 설치 가능 시점에 이어서 진행한다.

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

- [ ] 리뷰어 에이전트가 `data/design_brief.md`와 이 문서를 기준으로 구조/명령/어셋 정리를 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Implemented / Reviewer Pending

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

- [ ] 리뷰어 에이전트가 KBO 로고 미사용, 디자인 토큰 일관성, 컴포넌트 재사용성을 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Implemented / Reviewer Pending

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

- [ ] 리뷰어 에이전트가 이미지 시안 1번과 비교해 홈/진입 화면 유사도와 사용성을 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Implemented / Reviewer Pending

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

- [ ] 리뷰어 에이전트가 이미지 시안 2번과 비교해 일정/순위 UI 유사도와 정보 밀도를 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Implemented / Reviewer Pending

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

- [ ] 리뷰어 에이전트가 이미지 시안 3번과 비교해 피드/마이 화면 유사도와 목록 사용성을 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Implemented / Reviewer Pending

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

- [ ] 리뷰어 에이전트가 이미지 시안 4번과 비교해 모달/공유 카드/디자인 시스템 준수 여부를 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Implemented / Reviewer Pending

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
- [x] 마이그레이션 또는 Supabase schema 적용 — SQL/스토리지/시드/RLS 파일과 적용 순서는 [docs/phase-8-supabase-setup.md](docs/phase-8-supabase-setup.md#apply-checklist-사용자-작업)에 정리됨. 부분 적용된 schema 누락분(reviews/review_likes/review_saves/friends/friend_requests/notifications)을 [supabase/fix-reviews.sql](supabase/fix-reviews.sql)로 일괄 복구. profile_stats / verified_attendance_results view 누락분은 [supabase/fix-views.sql](supabase/fix-views.sql)로 복구
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
- [x] 게임 상세 페이지 `app/games/[id]/page.tsx`를 server component로 전환, DB에서 game 조회
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
- [ ] 티켓 Vision 인증 파이프라인
  - [ ] `lib/server/vision/parseTicket.ts` — Claude Vision 호출 wrapper
  - [ ] 추출 항목: 경기일자, 홈팀, 원정팀, 구장, 좌석/블록(보조)
  - [ ] `createAttendance` server action에서 업로드 후 Vision 호출 → 선택한 경기와 매칭 검증
  - [ ] 매칭 성공: `verified=true`, `verifiedAt`, `verifiedMethod='vision'`, `visionPayload` 저장
  - [ ] 매칭 실패: `verified=false` 저장, 실패 사유 응답
- [ ] 부정 방지
  - [ ] 티켓 이미지 SHA-256 hash 저장, 동일 hash 중복 인증 차단
  - [ ] 미래 일자 티켓 차단 (Vision 결과 일자가 오늘 이후면 거절)
  - [ ] 동일 사용자 + 동일 경기 중복 인증 차단
- [x] 환경변수 및 시크릿 (Vision 분량 빼고)
  - [x] `CRON_SECRET` `.env.example` 등록
  - [ ] `ANTHROPIC_API_KEY` (Vision 단계에서 추가)
  - [ ] Vercel 환경변수 등록 안내 문서 업데이트
- [ ] 관측성
  - [ ] 동기화 실패/Vision 실패 로그 수집 경로 결정 (Supabase log table 또는 외부)
  - [ ] 마지막 동기화 시각/상태를 admin에서 확인할 수 있는 최소 화면 또는 endpoint

테스트:

- [x] bulk load 스크립트로 `games` upsert 동작 확인 (2026 시즌 675경기)
- [x] 동일 bulk load 2회 실행해도 중복 행 없음 (external_id unique + insert/update 분리)
- [x] 순위 sync 스크립트로 10팀 standings + form 적재 확인
- [ ] cron route handler를 Vercel 배포 후 호출로 검증 (CRON_SECRET 인증 흐름)
- [ ] 외부 소스 응답 일부 누락 시 기존 row가 살아있는지 확인
- [ ] 정상 티켓 업로드 시 `verified=true` 전환 확인
- [ ] 다른 경기 티켓 업로드 시 `verified=false` 및 사유 노출 확인
- [ ] 동일 hash 재업로드 차단 확인
- [ ] 미래 일자 티켓 차단 확인
- [ ] 인증 직관만 홈 승률/팀 랭킹에 반영되는지 확인

리뷰어 검수:

- [ ] 리뷰어 에이전트가 외부 호출 경계, 시크릿 노출 위험, idempotency, Vision 실패 UX를 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: KBO 동기화 완료 / Vision 인증 미시작

### Phase 9. 반응형/접근성/시각 QA

목표: 화면을 실제 앱처럼 다듬고 깨짐을 제거한다.

작업:

- [ ] 360px, 414px, 768px, 1024px 이상 레이아웃 점검
- [ ] 색 대비 점검
- [ ] 버튼/탭/칩 focus state 점검
- [ ] 이미지 lazy loading 및 alt text 점검
- [ ] 스크롤 영역과 fixed tab bar 겹침 제거
- [ ] 불필요한 장식/과한 색 사용 줄이기
- [ ] Next.js 이미지 최적화 적용 여부 점검

테스트:

- [ ] `npm run build`
- [ ] `npm run lint`
- [ ] 브라우저 수동 QA
- [ ] 가능하면 Playwright 또는 브라우저 스크린샷 QA

리뷰어 검수:

- [ ] 리뷰어 에이전트가 전체 화면과 `data/design_brief.md`의 원칙을 대조해 최종 UI 리스크를 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Not Started

### Phase 10. 배포 준비

목표: Vercel 기준 실제 서비스 배포가 가능한 상태를 만든다.

작업:

- [ ] 환경변수 목록 정리
- [ ] production build 확인
- [ ] Vercel 배포 설정
- [ ] DB migration/seed 절차 문서화
- [ ] 스토리지 CORS/권한 정책 점검
- [ ] Open Graph / 공유 메타데이터 설정
- [ ] 에러/로딩/빈 상태 최종 점검

테스트:

- [ ] 배포 환경 build 성공
- [ ] 배포 URL에서 주요 플로우 확인
- [ ] 모바일 실기기 또는 모바일 브라우저 viewport 확인

리뷰어 검수:

- [ ] 리뷰어 에이전트가 배포 설정, 환경변수 누락, 공개 권한 리스크를 검토
- [ ] 리뷰 결과를 "리뷰 로그"에 기록

진행 상태: Not Started

### Phase 11. 인수 문서와 마무리

목표: 다음 작업자가 상태를 정확히 이어받게 한다.

작업:

- [ ] README 업데이트: 실행, 빌드, 주요 폴더, 디자인 기준
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

진행 상태: Not Started

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
| Phase 1. 프로젝트 스캐폴딩 | Implemented / Reviewer Pending | Codex | 2026-05-05 |
| Phase 2. 디자인 토큰/공통 컴포넌트 | Implemented / Reviewer Pending | Codex | 2026-05-05 |
| Phase 3. 홈/랜딩/온보딩 | Implemented / Reviewer Pending | Codex | 2026-05-05 |
| Phase 4. 일정/경기 상세/팀 순위 | Implemented / Reviewer Pending | Codex | 2026-05-05 |
| Phase 5. 커뮤니티/마이/설정 | Implemented / Reviewer Pending | Codex | 2026-05-05 |
| Phase 6. 모달/공유 카드 | Implemented / Reviewer Pending | Codex | 2026-05-05 |
| Phase 6.5. 프론트 인터랙션 완성 | Completed / QA Passed | Codex + Subagents | 2026-05-06 |
| Phase 6.8. 추가 수정사항 | Completed / QA Passed | Codex | 2026-05-06 |
| Phase 7. 서비스 데이터 모델/API 설계 | Implemented / Reviewer Pending | Codex | 2026-05-06 |
| Phase 8. 인증/DB/스토리지 연동 | Implemented / Reviewer Pending | Codex | 2026-05-07 |
| Phase 8.5. 외부 데이터 연동 | KBO 동기화 완료 / Vision 미시작 | Codex | 2026-05-07 |
| Phase 9. 반응형/접근성/시각 QA | Not Started | TBD | 2026-05-06 |
| Phase 10. 배포 준비 | Not Started | TBD | 2026-05-06 |
| Phase 11. 인수 문서/마무리 | Not Started | TBD | 2026-05-06 |

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

## 10. 의사결정 로그

- 2026-05-05: KBO 구단 로고는 사용하지 않는다. 팀명/팀 컬러/이니셜 기반의 추상 배지를 사용한다.
- 2026-05-05: GPT 생성 이미지는 앱 어셋으로 사용하되, UI 텍스트와 주요 컴포넌트는 HTML/CSS로 구현한다.
- 2026-05-05: 단계 종료마다 리뷰어 에이전트 검수를 진행하고 이 문서에 결과를 기록한다.
- 2026-05-05: 실제 서비스/배포까지 이어갈 수 있도록 Vite SPA가 아니라 Next.js App Router 기반으로 시작한다.
- 2026-05-05: Phase 1-3 범위의 홈 확인용 Next.js 목업을 구현했다. 현재 URL은 로컬 개발 서버 `http://127.0.0.1:3000`이다.
- 2026-05-05: Phase 4-6 범위의 일정/경기상세/팀순위/커뮤니티/마이/설정/모달 목업을 구현했다. 실제 API 연결은 Phase 7 이후로 보류한다.
- 2026-05-06: 실제 API 연결 전에 mock data/client state 기반 프론트 인터랙션을 완성하는 Phase 6.5를 추가한다.
- 2026-05-06: 앱의 최우선 개인화 기준은 사용자가 선택한 `내 팀`으로 둔다. 홈 승률 카드, 마이 프로필, 일정 우선 노출, 프로필 편집의 팀 변경 흐름에 반영하며, 실제 서비스에서는 팀 변경을 하루 1회로 제한한다.
- 2026-05-06: Phase 7은 Supabase 기준으로 진행한다. 산출물은 `supabase/schema.sql`, `lib/types/api-contracts.ts`, `docs/phase-7-data-contract.md`에 분리해 기록한다.
- 2026-05-06: Phase 8을 시작했다. Supabase SDK, client/server/middleware, seed/storage SQL, read query와 일부 서버 액션 경계를 추가했다. 원격 Supabase SQL 적용은 사용자가 대시보드에서 진행해야 한다.
- 2026-05-06: Phase 7에서 전략만 정의되어 있던 KBO 일정/순위 자동 동기화와 티켓 Vision 인증을 별도 단계로 분리해 Phase 8.5(외부 데이터 연동)를 신설한다. 외부 API 연동, cron 스케줄링, 부정 방지 정책을 한 곳에서 관리한다.
- 2026-05-06: Phase 8 코드 작업을 마무리했다. Supabase 이메일 확인 redirect를 처리하는 `/auth/callback` route handler를 추가하고, `docs/phase-8-supabase-setup.md`에 사용자 적용 체크리스트(SQL 4종 실행 순서, Auth URL 등록, env, 1회 회원가입 검증)를 정리했다. `npm run lint`/`npm run build` 모두 통과. 남은 항목은 사용자가 Supabase 대시보드에서 SQL을 적용하고 회원가입~후기 작성 4종 플로우를 실측 확인하는 것뿐이다.
- 2026-05-07: Phase 8 실측 라운드를 마쳤다. 발견된 이슈들과 해결:
  - `auth.users.on_auth_user_created` 트리거가 회원가입을 막는 원인이라 제거.
  - schema.sql이 attendances 이후로만 적용되어 있어서 `reviews`/`review_likes`/`review_saves`/`friends`/`friend_requests`/`notifications` 6개 테이블 + `profile_stats`/`verified_attendance_results` view 누락. `supabase/fix-reviews.sql` + `supabase/fix-views.sql`로 일괄 복구.
  - `@supabase/ssr` 0.10이 PostgREST에 JWT를 일관되게 못 넘겨 RLS-protected SELECT가 빈 결과를 주는 이슈를 회피하기 위해, 모든 사용자 데이터 read/write를 `auth.getUser()` 확인 후 admin client(service role)로 수행하는 패턴으로 통일 (`profiles SELECT`는 public-readable 정책 추가로 우회).
  - mock data를 코드에서 완전 제거(`lib/mock/`, `WeekCalendar.tsx` 삭제).
  - `process.env[key]`(동적) → `process.env.NEXT_PUBLIC_X`(정적)으로 변경. Next.js 빌드 시 동적 접근은 치환 안 돼 브라우저에서 undefined가 되는 함정.
  - 직관/후기 삭제 server action(`deleteAttendanceAction`/`deleteReviewAction`)이 DB 행 삭제뿐 아니라 review-photos/ticket-images 버킷의 Storage 객체도 같이 정리하도록 함.
  - 후기 본문 hashtag 자동 추출, 줄바꿈 보존, 자동 부착 텍스트(제목/태그/추가 문장) 제거.
- 2026-05-07: Phase 8.5 KBO 동기화 부분을 완성했다. 데이터 소스는 KBO 공식 API(`koreabaseball.com/ws/Main.asmx/GetKboGameList`) 1순위 + 네이버 스포츠 HTML/JSON 폴백을 채택했다(이전 BET 프로젝트 참고). 클라이언트(`lib/server/kbo/*`), upsert 로직(`syncGames`/`syncStandings`), CRON_SECRET 인증 cron route 2종, Vercel cron 스케줄(03:00 주간/14-23시 30분 스코어/02:30 순위), 2026 시즌 bulk load 스크립트(675경기 적재 완료), standings 동기화 스크립트(form 자동 계산)까지. Vision 인증과 부정 방지는 후속 라운드.
