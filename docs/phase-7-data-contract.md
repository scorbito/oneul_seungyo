# Phase 7 Data Model And API Contract

Phase 7 locks the contract between the Phase 1-6.8 mock UI and the real Supabase service. The UI should keep using mock state until Phase 8, but every mock action now has a target table, constraint, and server action.

## Supabase Environment

`.env.local` already contains these keys. Values must stay local and must not be committed.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ANTHROPIC_API_KEY`
- `KAKAO_CLIENT_ID`
- `KAKAO_CLIENT_SECRET`
- `NEXT_PUBLIC_KAKAO_JS_KEY`
- `CRON_SECRET`

## Model Decisions

- Auth source: Supabase Auth `auth.users`; app user data lives in `public.profiles`.
- Friend model: mutual `friends` relationship, not follow. Requests live separately in `friend_requests`.
- Attendance verification: ticket image upload plus Vision verification. Until the Vision stage, mock behavior can map `ticketImageUrl` presence to `verified`.
- Review relationship: `reviews.attendance_id` is `unique`, so one attendance can have at most one review.
- Review visibility: `public | friends | private`.
- Team preference: one `main_team_id`, up to five `interest_team_ids`, and main-team changes are limited to once per day at the server-action layer.
- Stats and badges: only verified attendances are counted.
- Share card templates: fixed in code, not a DB table.

## Tables

| Table | Purpose | Key Constraints |
| --- | --- | --- |
| `teams` | KBO team metadata used by badges and standings | `id` text primary key |
| `profiles` | User profile and settings | `id -> auth.users`, max 5 interest teams |
| `games` | KBO schedule and results | home/away teams differ, finished games require scores |
| `team_standings` | Cached standings and recent form | unique `(team_id, season)` |
| `attendances` | User attendance records | unique `(user_id, game_id)`, unique ticket image hash |
| `reviews` | Community posts tied to attendances | unique `attendance_id`, body min 5 chars, 1-3 photos |
| `review_likes` | Review likes | composite PK `(user_id, review_id)` |
| `review_saves` | Saved reviews | composite PK `(user_id, review_id)` |
| `friends` | Accepted mutual friendships | sorted pair `(user_a_id, user_b_id)` |
| `friend_requests` | Request/accept/reject flow | one pending request per pair direction |
| `notifications` | In-app notification history | recipient-scoped |

The SQL draft is in `supabase/schema.sql`.

## Mock To Schema Mapping

| Mock/UI Field | Target |
| --- | --- |
| `UserProfile.nickname` | `profiles.nickname` |
| `UserProfile.mainTeamId` | `profiles.main_team_id` |
| `UserProfile.interestTeamIds` | `profiles.interest_team_ids` |
| `UserProfile.attendanceCount/wins/losses/draws/winRate` | `profile_stats` view |
| `Game.date/time/stadium/homeTeamId/awayTeamId/score/status` | `games` |
| `AttendanceRecord.supportTeamId` | `attendances.support_team_id` |
| `AttendanceRecord.verified` | `attendances.verified` |
| `AttendanceRecord.result` | `verified_attendance_results` view |
| `Review.attendanceId` | `reviews.attendance_id` |
| `Review.body` | `reviews.body` |
| `Review.image` and future gallery | `reviews.photos` |
| `likedReviewIds` | `review_likes` |
| `savedReviewIds` | `review_saves` |
| `notificationsEnabled` | `profiles.notifications_enabled` |
| `publicScope` | `profiles.default_public_scope` and `reviews.public_scope` |

## Server Actions / API Surface

Use Server Actions for authenticated mutations and route handlers for cron/webhook style jobs.

### Bootstrap

- `getBootstrap()`
  - Returns current profile, profile stats, teams, standings, and upcoming games.
  - Replaces the current imports from `lib/mock/home`.

### Games And Schedule

- `listGames({ from, to, teamId? })`
  - Reads `games`, joins team metadata, and powers `/schedule` and game pickers.
- `syncKboSchedule()`
  - Route handler protected by `CRON_SECRET`.
  - Upserts `games` and `team_standings`.

### Attendances

- `listAttendances({ verified? })`
  - Reads only the current user's attendances.
- `createAttendance({ gameId, supportTeamId, ticketImageFile?, memo? })`
  - Uploads ticket image to Supabase Storage.
  - Stores image hash to block duplicate ticket verification.
  - For Phase 8, `verified = Boolean(ticketImageUrl)`.
  - For Vision stage, runs ticket parsing before setting `verified`.
- `updateAttendance({ id, supportTeamId?, memo? })`
  - Current user only.
- `deleteAttendance(id)`
  - Deletes current user's attendance. Cascades review through FK if needed.

### Reviews

- `listReviews({ filter })`
  - `all`: public plus own visible rows according to RLS.
  - `myTeam`: reviews where author/support team matches current user's main team.
  - `friends`: friends-only query using `friends`.
- `createReview({ attendanceId, body, photos, publicScope })`
  - Requires attendance to belong to current user.
  - Relies on `reviews.attendance_id unique` for one review per attendance.
- `updateReview({ id, body?, photos?, publicScope? })`
  - Current author only.
- `deleteReview(id)`
  - Current author only.
- `toggleReviewLike(reviewId)`
  - Inserts/deletes `review_likes`.
- `toggleReviewSave(reviewId)`
  - Inserts/deletes `review_saves`.

### Friends

- `searchUsers(query)`
  - Searches profiles by nickname.
- `sendFriendRequest(toUserId)`
  - Creates pending `friend_requests`.
- `respondFriendRequest(requestId, "accepted" | "rejected")`
  - On accepted, inserts a sorted row into `friends`.
- `listFriends()`
  - Reads accepted friends plus pending requests.

### Profile And Settings

- `updateProfile({ nickname?, mainTeamId?, interestTeamIds?, notificationsEnabled?, defaultPublicScope?, avatarImageFile? })`
  - Enforces max 5 interest teams.
  - Enforces main-team change at most once per day.
  - Uploads profile image when provided.

## Storage Buckets

| Bucket | Files | Access |
| --- | --- | --- |
| `ticket-images` | One ticket image per attendance verification attempt | Private |
| `review-photos` | 1-3 review photos | Public read or signed read |
| `profile-images` | Profile avatars | Public read |

Ticket image paths should include user id and attendance id. Review photo paths should include user id and review id.

## Verification Rules

- Server computes attendance result with `game_result_for_support_team`.
- Win rate is `wins / (wins + losses)`, excluding draws from denominator.
- Stats only use `attendances.verified = true` and `games.status = 'finished'`.
- Ticket verification must reject future game dates and duplicate `ticket_image_hash`.
- Vision payload should store parsed date, teams, stadium, confidence, and raw model response in `attendances.vision_payload`.

## Phase 8 Handoff

- Install Supabase client package.
- Add browser/server Supabase clients.
- Apply `supabase/schema.sql`.
- Seed `teams`, sample `games`, and standings.
- Replace `AppStateProvider` actions one by one with the contracts in `lib/types/api-contracts.ts`.
- Keep mock fallback until auth and storage are fully wired.

