# Task Dependencies — Design Spec
**Date:** 2026-04-05
**Project:** MyProject — Full-stack SaaS Task Management

---

## Goal

Add task dependency support so team members can express "Task B cannot start until Task A is done." Dependencies are informational with soft warnings — the system never hard-blocks users, because teams may choose to proceed regardless of open prerequisites.

---

## Scope

### In scope
- Create and remove "blocks / blocked by" relationships between tasks in the same project
- Soft warning when moving a task to `in_progress` or `done` while it has unresolved blockers
- Chain icon on kanban cards for tasks with blockers
- Dependencies tab on the project page listing all dependency pairs

### Out of scope
- Cross-project dependencies
- Hard locks (status changes are never prevented)
- Dependency graph visualisation (kept simple intentionally)
- Bulk dependency import

---

## Data Model

### New table: `task_dependencies`

| Field | Type | Notes |
|-------|------|-------|
| `id` | int, PK | |
| `blocking_task_id` | FK → tasks.id | The prerequisite task |
| `blocked_task_id` | FK → tasks.id | The task that depends on it |

**Constraints:**
- `blocking_task_id != blocked_task_id` (no self-dependency)
- Unique pair `(blocking_task_id, blocked_task_id)`
- Backend rejects cycles: if A already blocks B (directly or transitively), B cannot block A

Both tasks must belong to the same project — validated on write.

### Modified: `TaskResponse`

Two new fields added to the task response schema:

```python
blockers: list[TaskSummary]   # tasks that must be done before this one
blocking: list[TaskSummary]   # tasks this task is blocking
```

`TaskSummary` contains `id`, `title`, `status`.

---

## Backend API

### New endpoints

**Add dependency**
```
POST /tasks/{task_id}/dependencies
Body: { "blocking_task_id": int }
Response: updated TaskResponse (with blockers/blocking populated)
Errors: 400 if same-project constraint fails, 400 if cycle detected, 404 if task not found
Auth: project membership required
```

**Remove dependency**
```
DELETE /tasks/{task_id}/dependencies/{blocking_task_id}
Response: 204 No Content
Auth: project membership required
```

**List project dependencies**
```
GET /projects/{project_id}/dependencies
Response: list of DependencyPair { blocking: TaskSummary, blocked: TaskSummary }
Auth: project membership required
```

### Modified endpoints
- `GET /projects/{id}/tasks` — each task now includes `blockers` and `blocking` fields
- `GET /tasks/{id}` — same

---

## Frontend

### TaskDetailModal — Dependencies section

Inserted between the status selector and the comments thread.

**Layout:**
- "Blocked by" subsection — list of blocker tasks with title, status badge, and remove (×) button
- "Blocks" subsection — list of tasks this task is blocking, each with a remove (×) button
- Search input below "Blocked by": type to filter tasks in the same project, select to add as blocker

**Soft warning:**
When the user saves with `status = "in_progress"` or `status = "done"` and any entry in `blockers` has `status !== "done"`, show a Sonner toast:
> "Huom: tällä taskilla on N avointa esivaatimusta"
The save proceeds regardless.

### Kanban board card

- If `task.blockers.length > 0`: render a `Link2` icon (Lucide) in the card's bottom-right area
- Tooltip on hover: "Blocked by N task(s)"
- Icon is muted colour when all blockers are done, accent/warning colour when any blocker is open

### Project page — Dependencies tab

New tab added to the project page (`/orgs/[orgId]/projects/[projectId]`) alongside the kanban board view: **Dependencies**.

**Table columns:**
| Blokkaa | → | Blokattava | Blokaajan tila |
|---------|---|------------|----------------|

**Filter bar above table:** All / Open blockers / Resolved
- "Open blockers" = pairs where the blocking task is not `done`
- "Resolved" = pairs where the blocking task is `done`

Empty state: "No dependencies defined for this project."

### api.ts additions

New types:
```ts
interface TaskSummary { id: number; title: string; status: TaskStatus }
interface DependencyPair { blocking: TaskSummary; blocked: TaskSummary }
```

New functions:
```ts
addDependency(taskId: number, blockingTaskId: number): Promise<Task>
removeDependency(taskId: number, blockingTaskId: number): Promise<void>
getProjectDependencies(projectId: number): Promise<DependencyPair[]>
```

`Task` type gains `blockers: TaskSummary[]` and `blocking: TaskSummary[]`.

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Adding dependency between tasks in different projects | 400 from backend, toast error in UI |
| Cycle detected | 400 from backend, toast "This would create a circular dependency" |
| Self-dependency | 400 from backend, toast error |
| Duplicate dependency | 400 from backend, UI ignores silently (already exists) |
| Remove non-existent dependency | 404 from backend, toast error |

---

## Testing

**Backend (pytest):**
- Add dependency happy path
- Reject self-dependency
- Reject cross-project dependency
- Reject cycle (direct and transitive)
- Remove dependency
- List project dependencies
- Membership guard (non-member cannot add/remove)

**Manual verification:**
- Soft warning toast appears when moving blocked task forward
- Warning does not block the save
- Kanban icon appears and disappears correctly
- Dependencies tab filters work
