# Phase 8 Supabase Setup

This project now has the first Supabase integration layer, but the SQL has not been applied to the remote Supabase project from this workspace.

## Apply SQL

Open the Supabase project SQL editor and run these files in order.

1. `supabase/schema.sql`
2. `supabase/storage.sql`
3. `supabase/seed.sql`

`schema.sql` creates tables, enums, views, RLS policies, and the attendance result function. `storage.sql` creates buckets and object policies. `seed.sql` inserts KBO teams, mock games, and mock standings for the current UI.

## Environment

`.env.local` must contain:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Values are local-only and must not be committed.

## Added App Files

- `lib/supabase/client.ts`: browser client factory
- `lib/supabase/server.ts`: server and service-role client factories
- `lib/supabase/middleware.ts`: auth session refresh helper
- `middleware.ts`: Next.js middleware entry point
- `lib/supabase/queries.ts`: typed read-query boundary for teams, games, standings, profile, and stats
- `lib/actions/profile.ts`: profile/settings mutation action with one-team-change-per-day validation
- `lib/actions/friends.ts`: friend request and accept/reject action boundary
- `lib/supabase/database.types.ts`: provisional database type contract until generated Supabase types are produced

## Auth Callback

Supabase 이메일 확인/매직 링크는 `/auth/callback?code=...`로 redirect 된다. 이 경로는 `app/auth/callback/route.ts`가 처리하며, 코드를 세션으로 교환한 뒤 프로필 유무에 따라 `/onboarding` 또는 `/`로 보낸다.

Supabase 대시보드 설정:

- Authentication → URL Configuration → Site URL: `NEXT_PUBLIC_SITE_URL`과 동일하게 등록
- Redirect URLs에 `${SITE_URL}/auth/callback` 추가 (로컬: `http://localhost:3000/auth/callback`, 프로덕션 도메인 모두)

## Apply Checklist (사용자 작업)

원격 Supabase에 적용할 때 순서대로 실행한다.

1. Supabase 대시보드 → SQL Editor에서 `supabase/schema.sql` 전체 실행
2. `supabase/storage.sql` 실행 (`ticket-images`, `review-photos` 버킷 + 정책)
3. `supabase/seed.sql` 실행 (KBO 팀, 샘플 경기, 샘플 순위)
4. `supabase/public-read-policies.sql` 실행 (anon read 권한)
5. Authentication → Providers → Email 활성화 (이메일 확인 사용 여부 결정)
6. Authentication → URL Configuration에 Site URL 및 `/auth/callback` 등록
7. `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` 채우기
8. `npm run dev`로 로컬에서 회원가입 → 온보딩 → 직관 등록 → 후기 작성 플로우를 1회 검증

## Next Phase 8 Steps

- Generate official database types after schema application.
- Replace the provisional `database.types.ts` with generated output.
- Keep the local mock provider as fallback until each screen has DB parity.

