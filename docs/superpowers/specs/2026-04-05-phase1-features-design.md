
# Phase 1 Feature Expansion — Design Spec
**Date:** 2026-04-05
**Project:** MyProject — Full-stack SaaS Task Management

---

## Goal

Expand the application from a minimal task manager into a convincing, full-featured SaaS demo suitable for portfolio presentation. The focus is on team collaboration and project management, with a calendar view as the key differentiating feature.

---

## Scope

### Core features (Phase 1)
1. Task enrichment — due dates and priorities
2. Comments on tasks
3. My Tasks dashboard
4. Search and filtering
5. User profile management
6. Calendar view (custom monthly grid)

### Out of scope (Phase 2)
- Gantt/timeline view
- Sprint planning
- Time tracking
- Team workload view
- Task dependencies
- Goals / OKR tracking
- In-app notifications

---

## Data Model Changes

### Task — new fields
| Field | Type | Notes |
|-------|------|-------|
| `due_date` | `Date`, nullable | Task deadline |
| `priority` | `String(10)` | `low` \| `medium` \| `high`, default: `medium` |

### New table: `task_comments`
| Field | Type | Notes |
|-------|------|-------|
| `id` | int, PK | |
| `task_id` | FK → tasks.id | |
| `user_id` | FK → users.id | |
| `body` | Text | Comment content |
| `created_at` | DateTime | |

### User — no schema changes
The `name` field already exists. A new PATCH endpoint exposes it for editing.

---

## Backend API

### Modified endpoints
- `POST /projects/{id}/tasks` — now accepts `due_date` (optional) and `priority` (optional, default `medium`)
- `PATCH /tasks/{id}` — now accepts `due_date` and `priority` in addition to existing fields

### New endpoints

**Comments**
- `GET /tasks/{task_id}/comments` — list comments for a task (membership required)
- `POST /tasks/{task_id}/comments` — add a comment (membership required)
- `DELETE /comments/{comment_id}` — delete own comment, or any comment if admin

**Profile**
- `PATCH /users/me` — update own name and/or password (authenticated)

**My Tasks**
- `GET /users/me/tasks` — all tasks assigned to the current user across all projects/orgs

**Search**
- `GET /orgs/{org_id}/tasks/search` — search tasks within an org
  - Query params: `q` (text), `priority` (low/medium/high), `assigned_to` (user_id), `due_before` (date), `due_after` (date)

---

## Frontend

### New pages

**`/dashboard` (modified)**
- Keeps the existing org list
- Adds a "My Tasks" section below: all tasks assigned to current user, sorted by priority then due date
- Shows task title, project name, org name, priority badge, due date

**`/orgs/[orgId]/calendar` (new)**
- Monthly calendar grid
- Each day cell shows tasks with `due_date` on that day as colored chips
- Chips are color-coded by priority (see Priority Colors below)
- Clicking a chip opens `TaskSlideOver`
- Month navigation (prev/next arrows)

### Modified pages

**`/orgs/[orgId]` (org page)**
- Adds "Calendar" tab alongside existing "Projects" and "Members" tabs

**`/orgs/[orgId]/projects/[projectId]` (Kanban board)**
- Task cards now display priority badge and due date
- Clicking a card opens `TaskSlideOver` instead of inline editing
- Create task form adds due date picker and priority selector

### New components

| Component | Purpose |
|-----------|---------|
| `TaskSlideOver` | Slide-in side panel showing full task details, comments, and edit controls |
| `CalendarView` | Custom monthly grid calendar |
| `PriorityBadge` | Visual label for low/medium/high priority |
| `ProfileSettings` | Modal for editing name and password |
| `SearchModal` | Global search modal triggered from nav |
| `CommentThread` | Comment list + input within TaskSlideOver |

### Navigation changes
- Search icon in top navbar opens `SearchModal`
- Profile menu gains "Settings" option opening `ProfileSettings`

---

## Priority Colors

| Priority | Color | Hex |
|----------|-------|-----|
| `high` | Red | `#ef4444` |
| `medium` | Orange (theme accent) | `#f97316` |
| `low` | Light yellow | `#fde047` |

Rationale: Forms a clear visual scale (yellow → orange → red) consistent with the Meridian design theme.

---

## Error Handling

- Due date in the past: allowed (tasks can be overdue), but overdue tasks show due date in red
- Comment deletion: only own comments or admin — 403 otherwise
- Search with no results: empty state with illustration, not an error
- Profile password change: requires current password confirmation

---

## Testing

- Backend: unit tests for new CRUD functions (comments, search filter logic, profile update)
- Backend: API tests for all new endpoints covering auth, permissions, and edge cases
- Frontend: manual smoke test for calendar rendering at month boundaries (week wrapping, first/last day of month)
