# Discussion Feature (Overview for AI/FE)

## Overview
Chức năng kiểm duyệt bình luận (Discussion Moderation) tự động phát hiện và gắn cờ các bình luận vi phạm hoặc không phù hợp trong hệ thống thảo luận.

## Modules & Files
- Controllers: `DiscussionController`, `DiscussionModerationController`, `FavoriteController`
- Entities: `Discussion`, `Favorite`, `DiscussionModerationFlag`
- DTOs: `DiscussionDto`, `DiscussionSummaryDto`, `FavoriteDto`, moderation DTOs
- Repository: `DiscussionRepository`, `DiscussionRepositoryImpl` (custom JPQL), `FavoriteRepository`, `DiscussionModerationFlagRepository`
- Services: `DiscussionService`, `DiscussionServiceImpl`, `FavoriteServiceImpl`, `DiscussionModerationService`

## Core Behaviors
- Create discussion (root or reply) and notify relevant users unless flagged.
- List root comments and replies with prioritization and sorting.
- Favorite/like discussions per user; show counts and current-user liked state.
- Auto moderation via LangAI; flagged content excluded from lists until resolved.

## Endpoints

### DiscussionController
- `POST /api/v1/discussions`
  - Body: `DiscussionRequest { lessonId, courseId, comment, parentCommentId? }`
  - Returns `DiscussionDto` with possible moderation fields.
- `GET /api/v1/discussions/lesson/{lessonId}/root`
  - Query: `page`, `size`, `sort`
  - Returns `Page<DiscussionDto>` (summaries), excludes `PENDING` negative flags.
- `GET /api/v1/discussions/{parentId}/replies`
  - Query: `page`, `size`, `sort`
  - Returns `Page<DiscussionDto>` (summaries), excludes `PENDING` negative flags.
- `DELETE /api/v1/discussions/{id}` (owner only)

### FavoriteController
- `POST /api/v1/discussions/favorites`
  - Body: `FavoriteRequest { discussionId }` → like/unlike toggle per implementation.
- `GET /api/v1/discussions/{id}/favorites` → count or detail per implementation.

### ModerationController
- `GET /api/v1/discussions/moderation/flagged` — list `PENDING` flags.
- `GET /api/v1/discussions/moderation/flagged/history` — processed flags.
- `POST /api/v1/discussions/moderation/flags/{flagId}/moderate` — approve/reject.
- `GET /api/v1/discussions/moderation/statistics` — statistics.

## DTOs

### DiscussionDto
- `id`, `comment`, `lessonId`, `userId`, `createdDate`
- `replyCount`, `favoriteCount`, `likedByCurrentUser`
- `userFullName`, `avatarUrl`
- Moderation fields:
  - `flagType`: `TOXIC | EXTREME_NEGATIVE | SPAM | null`
  - `moderationStatus`: `PENDING | APPROVED | REJECTED | null`
  - `flagSeverity`: integer or `null`

### DiscussionSummaryDto
- Projection used in list queries with counts and liked state.

### FavoriteDto / FavoriteRequest
- Minimal for toggle and displaying count/state.

### Moderation DTOs
- `FlaggedDiscussionDto`, `DiscussionModerationActionRequest`, `DiscussionModerationStatisticsDto`.

## Creation Flow & Notifications
1. `DiscussionServiceImpl.createDiscussion()` saves the discussion.
2. Calls `DiscussionModerationService.checkAndFlagDiscussion()`.
3. Receives `ModerationResult { hasNegativeFlag, flag }`.
4. If `hasNegativeFlag` is true → suppress notifications.
5. Else → send notification:
   - If reply: notify parent comment owner.
   - If root: notify lesson `author` (instructor).
6. `DiscussionDto` includes moderation fields when `flag` exists.

## Listing & Prioritization
- Queries exclude discussions with `PENDING` negative flags (`TOXIC`, `EXTREME_NEGATIVE`, `SPAM`).
- Prioritize current user's discussions: `ORDER BY CASE WHEN d.user.id = :currentUserId THEN 0 ELSE 1 END` then sort keys.
- Sort keys supported: `createdDate`, `replyCount`, `favoriteCount`, `userFullName`.

## Favorites
- Count favorites per discussion.
- `likedByCurrentUser` computed via subquery.
- Toggle like via `FavoriteController`.

## Moderation (LangAI)
- Flag Types: `TOXIC` (severity 5), `EXTREME_NEGATIVE` (severity 3), `SPAM` (severity 2).
- Status: `PENDING`, `APPROVED`, `REJECTED`.
- Thresholds: `TOXIC_THRESHOLD = 0.85`, `HIGH_NEGATIVE_THRESHOLD = 0.90` (Vietnamese).
- On create, most severe flag attached to `DiscussionDto` without extra DB query.

## Repository Filtering
All list and count queries apply:
```
AND NOT EXISTS (
  SELECT 1 FROM DiscussionModerationFlag dmf
  WHERE dmf.discussion.id = d.id
  AND dmf.status = 'PENDING'
  AND dmf.flagType IN ('TOXIC', 'EXTREME_NEGATIVE', 'SPAM')
)
```

## Security
- Requires authenticated user (`SecurityHelper.getCurrentUser()`).
- Delete discussion allowed for the owner only.

## Error Handling
- `NotFoundException` for missing lesson/parent discussion.
- `BadRequestException` for unauthorized delete.
- If LangAI unavailable, moderation is skipped (no flags).

## FE Integration Guidance
- Create: render immediately; if moderation fields present with `PENDING`, show badge and avoid promoting.
- Lists: BE already excludes pending negative flags; pagination/counts match.
- Badges: TOXIC (red), EXTREME_NEGATIVE (orange), SPAM (gray).
- Show `likedByCurrentUser`, counts, and reply count.

## Notes
- Mirrors Review feature patterns; uses LangAI; no `reviewedBy` tracking in flags.
- Most severe flag is attached in create response (no extra DB call).
