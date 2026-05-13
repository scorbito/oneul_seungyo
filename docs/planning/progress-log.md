# 진행 로그 (Progress Log)

> 개발 프로세스(병렬 작업 전략·단계 완료 기준)와 리뷰어 검수 결과를 모은 문서.
> 현재 기능은 [feature-overview.md](./feature-overview.md), Phase별 구현 히스토리는 [phase-history.md](./phase-history.md), 의사결정 흐름은 [decision-log.md](./decision-log.md) 참조.

관련 문서:
- 기능 명세: [feature-overview.md](./feature-overview.md)
- Phase 구현 히스토리: [phase-history.md](./phase-history.md)
- 진행 현황 + 운영 백로그: [qa-checklist.md](./qa-checklist.md)
- 의사결정 히스토리: [decision-log.md](./decision-log.md)
- 상위 인덱스: [../WORKPLAN.md](../WORKPLAN.md)

## 1. 병렬 작업 전략

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

## 2. 단계 완료 기준

한 Phase는 아래 조건을 모두 만족해야 완료로 표시한다.

- [ ] 해당 Phase 작업 체크박스 완료
- [ ] 테스트 체크박스 완료 또는 불가 사유 기록
- [ ] 리뷰어 에이전트 검수 완료
- [ ] 리뷰 findings 처리 또는 보류 사유 기록
- [ ] 이 문서의 진행 상태 갱신


## 3. 리뷰 로그

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
