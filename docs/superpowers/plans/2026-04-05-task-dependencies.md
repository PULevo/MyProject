# Task Dependencies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "blocks / blocked by" task dependency support with soft warnings, a dependency section in the task detail modal, a kanban card indicator, and a Dependencies tab on the project page.

**Architecture:** New `task_dependencies` table with a CRUD layer in `crud/dependency.py` and an API router in `api/dependencies.py`. `TaskResponse` gains `blockers` and `blocking` fields (populated lazily — only the routes that explicitly call the enrichment helper return populated data). Frontend adds a `DependencySection` component inside `TaskDetailModal` and a `DependenciesTab` component on the project page.

**Tech Stack:** FastAPI + SQLAlchemy + Alembic + pytest (backend), Next.js 15 + TypeScript + Tailwind v4 + Lucide (frontend), SQLite for tests.

---

## File Map

### New files
| File | Purpose |
|------|---------|
| `backend/alembic/versions/a1b2c3d4e5f6_add_task_dependencies.py` | Migration: task_dependencies table |
| `backend/app/crud/dependency.py` | add/remove/list/cycle-check/enrich CRUD |
| `backend/app/api/dependencies.py` | Dependency API router |
| `backend/tests/test_dependencies.py` | Tests for all dependency endpoints |
| `frontend/components/DependencySection.tsx` | Blocks/blocked-by UI for TaskDetailModal |
| `frontend/components/DependenciesTab.tsx` | Project-level dependency table |

### Modified files
| File | Change |
|------|--------|
| `backend/app/models/project.py` | Add `TaskDependency` model |
| `backend/app/schemas/project.py` | Add `TaskSummary`, `DependencyPair`; update `TaskResponse` |
| `backend/app/api/projects.py` | `list_project_tasks`, `get_single_task`, `patch_task` use enriched response |
| `backend/app/main.py` | Register dependencies router |
| `frontend/lib/api.ts` | New types + 3 new functions |
| `frontend/components/TaskDetailModal.tsx` | Add `DependencySection`, soft warning, new props |
| `frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx` | Tab switcher, blocker icon on cards, new modal props |

---

## Task 1: Database migration

**Files:**
- Create: `backend/alembic/versions/a1b2c3d4e5f6_add_task_dependencies.py`

- [ ] **Step 1: Create the migration file**

```python
# backend/alembic/versions/a1b2c3d4e5f6_add_task_dependencies.py
"""Add task_dependencies table

Revision ID: a1b2c3d4e5f6
Revises: d1a2b3c4e5f6
Create Date: 2026-04-05 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "d1a2b3c4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "task_dependencies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("blocking_task_id", sa.Integer(), nullable=False),
        sa.Column("blocked_task_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["blocking_task_id"], ["tasks.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["blocked_task_id"], ["tasks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("blocking_task_id", "blocked_task_id", name="uq_task_dependency_pair"),
        sa.CheckConstraint("blocking_task_id != blocked_task_id", name="ck_no_self_dependency"),
    )
    op.create_index(op.f("ix_task_dependencies_id"), "task_dependencies", ["id"], unique=False)
    op.create_index(op.f("ix_task_dependencies_blocking_task_id"), "task_dependencies", ["blocking_task_id"], unique=False)
    op.create_index(op.f("ix_task_dependencies_blocked_task_id"), "task_dependencies", ["blocked_task_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_task_dependencies_blocked_task_id"), table_name="task_dependencies")
    op.drop_index(op.f("ix_task_dependencies_blocking_task_id"), table_name="task_dependencies")
    op.drop_index(op.f("ix_task_dependencies_id"), table_name="task_dependencies")
    op.drop_table("task_dependencies")
```

- [ ] **Step 2: Commit**

```bash
git add backend/alembic/versions/a1b2c3d4e5f6_add_task_dependencies.py
git commit -m "feat: add task_dependencies migration"
```

---

## Task 2: Model and schemas

**Files:**
- Modify: `backend/app/models/project.py`
- Modify: `backend/app/schemas/project.py`

- [ ] **Step 1: Add `TaskDependency` model to `backend/app/models/project.py`**

Add after the `TaskComment` class:

```python
class TaskDependency(Base):
    __tablename__ = "task_dependencies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    blocking_task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    blocked_task_id: Mapped[int] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
```

- [ ] **Step 2: Add `TaskSummary`, `DependencyPair` and update `TaskResponse` in `backend/app/schemas/project.py`**

Add `TaskSummary` and `DependencyPair` before `TaskCreate`. Update `TaskResponse` to include `blockers` and `blocking`:

```python
class TaskSummary(BaseModel):
    id: int
    title: str
    status: Literal["todo", "in_progress", "done"]

    model_config = {"from_attributes": True}


class DependencyPair(BaseModel):
    blocking: TaskSummary
    blocked: TaskSummary
```

In `TaskResponse`, add two new fields with defaults (so existing routes that return plain ORM Task objects continue to work without modification):

```python
class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    status: Literal["todo", "in_progress", "done"]
    priority: Literal["low", "medium", "high"]
    due_date: date | None
    project_id: int
    assigned_to: int | None
    created_by: int
    created_at: datetime
    updated_at: datetime
    blockers: list[TaskSummary] = []
    blocking: list[TaskSummary] = []

    model_config = {"from_attributes": True}
```

- [ ] **Step 3: Verify the backend app still starts without errors**

Run: `cd backend && python -c "from app.main import app; print('OK')"`

Expected output: `OK`

- [ ] **Step 4: Commit**

```bash
git add backend/app/models/project.py backend/app/schemas/project.py
git commit -m "feat: add TaskDependency model and update TaskResponse schema"
```

---

## Task 3: Dependency CRUD

**Files:**
- Create: `backend/app/crud/dependency.py`

- [ ] **Step 1: Write the failing tests** (write tests first so CRUD is driven by what the API needs — see Task 5 for full test file; write just the happy-path add test now to get a failing baseline)

Create `backend/tests/test_dependencies.py` with just the first test:

```python
# backend/tests/test_dependencies.py
from tests.conftest import register_and_login, auth_headers


def _setup(client):
    """Returns (admin_headers, org_id, project_id, task_a_id, task_b_id)"""
    token = register_and_login(client, "admin@x.fi", "salasana")
    ah = auth_headers(token)
    org_id = client.post("/orgs", json={"name": "Org"}, headers=ah).json()["id"]
    project_id = client.post(f"/orgs/{org_id}/projects", json={"name": "P"}, headers=ah).json()["id"]
    task_a = client.post(f"/projects/{project_id}/tasks", json={"title": "A"}, headers=ah).json()
    task_b = client.post(f"/projects/{project_id}/tasks", json={"title": "B"}, headers=ah).json()
    return ah, org_id, project_id, task_a["id"], task_b["id"]


def test_add_dependency(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    # B is blocked by A
    resp = client.post(
        f"/tasks/{task_b_id}/dependencies",
        json={"blocking_task_id": task_a_id},
        headers=ah,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert any(b["id"] == task_a_id for b in data["blockers"])
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd backend && python -m pytest tests/test_dependencies.py::test_add_dependency -v`

Expected: FAIL (404 — route doesn't exist yet)

- [ ] **Step 3: Create `backend/app/crud/dependency.py`**

```python
# backend/app/crud/dependency.py
from sqlalchemy.orm import Session

from app.models.project import Task, TaskDependency


# ── Cycle detection ───────────────────────────────────────────────────────────

def has_cycle(db: Session, blocking_id: int, blocked_id: int) -> bool:
    """Return True if adding blocking_id→blocked_id would create a cycle.

    A cycle exists if blocked_id already (directly or transitively) blocks
    blocking_id — i.e. we can reach blocking_id by following the 'blocks' edges
    starting from blocked_id.
    """
    visited: set[int] = set()
    queue = [blocked_id]
    while queue:
        current = queue.pop()
        if current == blocking_id:
            return True
        if current in visited:
            continue
        visited.add(current)
        # Tasks that current blocks (current is the blocking side)
        deps = (
            db.query(TaskDependency)
            .filter(TaskDependency.blocking_task_id == current)
            .all()
        )
        queue.extend(d.blocked_task_id for d in deps)
    return False


# ── Add / remove ──────────────────────────────────────────────────────────────

def add_dependency(db: Session, blocked_task_id: int, blocking_task_id: int) -> TaskDependency:
    dep = TaskDependency(blocking_task_id=blocking_task_id, blocked_task_id=blocked_task_id)
    db.add(dep)
    db.commit()
    db.refresh(dep)
    return dep


def remove_dependency(db: Session, blocked_task_id: int, blocking_task_id: int) -> bool:
    dep = (
        db.query(TaskDependency)
        .filter(
            TaskDependency.blocked_task_id == blocked_task_id,
            TaskDependency.blocking_task_id == blocking_task_id,
        )
        .first()
    )
    if not dep:
        return False
    db.delete(dep)
    db.commit()
    return True


def get_dependency(db: Session, blocked_task_id: int, blocking_task_id: int) -> TaskDependency | None:
    return (
        db.query(TaskDependency)
        .filter(
            TaskDependency.blocked_task_id == blocked_task_id,
            TaskDependency.blocking_task_id == blocking_task_id,
        )
        .first()
    )


# ── Project-level listing ─────────────────────────────────────────────────────

def get_project_dependencies(db: Session, project_id: int) -> list[TaskDependency]:
    """All dependency pairs where at least one task belongs to the project."""
    task_ids = [
        row[0]
        for row in db.query(Task.id).filter(Task.project_id == project_id).all()
    ]
    if not task_ids:
        return []
    return (
        db.query(TaskDependency)
        .filter(TaskDependency.blocked_task_id.in_(task_ids))
        .all()
    )


# ── Response enrichment ───────────────────────────────────────────────────────

def _task_summary(task: Task) -> dict:
    return {"id": task.id, "title": task.title, "status": task.status}


def enrich_task(db: Session, task: Task) -> dict:
    """Build a dict from Task + its dependency data for use with TaskResponse.model_validate()."""
    blocker_deps = (
        db.query(TaskDependency)
        .filter(TaskDependency.blocked_task_id == task.id)
        .all()
    )
    blocking_deps = (
        db.query(TaskDependency)
        .filter(TaskDependency.blocking_task_id == task.id)
        .all()
    )

    blocker_ids = [d.blocking_task_id for d in blocker_deps]
    blocking_ids = [d.blocked_task_id for d in blocking_deps]

    blocker_tasks = (
        db.query(Task).filter(Task.id.in_(blocker_ids)).all() if blocker_ids else []
    )
    blocking_tasks = (
        db.query(Task).filter(Task.id.in_(blocking_ids)).all() if blocking_ids else []
    )

    d = {col.name: getattr(task, col.name) for col in task.__table__.columns}
    d["blockers"] = [_task_summary(t) for t in blocker_tasks]
    d["blocking"] = [_task_summary(t) for t in blocking_tasks]
    return d


def enrich_tasks(db: Session, tasks: list[Task]) -> list[dict]:
    """Batch enrich a list of tasks with dependency data (2 queries total)."""
    if not tasks:
        return []
    task_ids = [t.id for t in tasks]

    all_deps = (
        db.query(TaskDependency)
        .filter(
            TaskDependency.blocked_task_id.in_(task_ids)
            | TaskDependency.blocking_task_id.in_(task_ids)
        )
        .all()
    )

    # Collect all task IDs referenced in deps that aren't already in task_ids
    related_ids = {d.blocking_task_id for d in all_deps} | {d.blocked_task_id for d in all_deps}
    extra_ids = related_ids - set(task_ids)
    extra_tasks = db.query(Task).filter(Task.id.in_(extra_ids)).all() if extra_ids else []

    task_map = {t.id: t for t in tasks}
    task_map.update({t.id: t for t in extra_tasks})

    # Build lookup tables
    blocked_by: dict[int, list[int]] = {}  # task_id -> blocker task_ids
    blocks: dict[int, list[int]] = {}      # task_id -> blocked task_ids
    for dep in all_deps:
        blocked_by.setdefault(dep.blocked_task_id, []).append(dep.blocking_task_id)
        blocks.setdefault(dep.blocking_task_id, []).append(dep.blocked_task_id)

    result = []
    for task in tasks:
        d = {col.name: getattr(task, col.name) for col in task.__table__.columns}
        d["blockers"] = [
            _task_summary(task_map[tid])
            for tid in blocked_by.get(task.id, [])
            if tid in task_map
        ]
        d["blocking"] = [
            _task_summary(task_map[tid])
            for tid in blocks.get(task.id, [])
            if tid in task_map
        ]
        result.append(d)
    return result
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/crud/dependency.py backend/tests/test_dependencies.py
git commit -m "feat: add dependency CRUD with cycle detection and task enrichment"
```

---

## Task 4: API router and project route updates

**Files:**
- Create: `backend/app/api/dependencies.py`
- Modify: `backend/app/api/projects.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Create `backend/app/api/dependencies.py`**

```python
# backend/app/api/dependencies.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud.dependency import (
    add_dependency,
    enrich_task,
    get_dependency,
    get_project_dependencies,
    has_cycle,
    remove_dependency,
)
from app.crud.project import get_project, get_task
from app.crud.organization import get_membership
from app.db.session import get_db
from app.models.user import User
from app.schemas.project import DependencyPair, TaskResponse, TaskSummary

router = APIRouter(tags=["dependencies"])


def _require_membership(db: Session, user_id: int, org_id: int):
    membership = get_membership(db, user_id, org_id)
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ei pääsyä organisaatioon")
    return membership


class DependencyCreate(BaseModel):
    blocking_task_id: int


@router.post(
    "/tasks/{task_id}/dependencies",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_task_dependency(
    task_id: int,
    dep_in: DependencyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tehtävää ei löydy")
    blocking_task = get_task(db, dep_in.blocking_task_id)
    if not blocking_task:
        raise HTTPException(status_code=404, detail="Blokaavaa tehtävää ei löydy")

    project = get_project(db, task.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projektia ei löydy")
    _require_membership(db, current_user.id, project.organization_id)

    if blocking_task.project_id != task.project_id:
        raise HTTPException(status_code=400, detail="Riippuvuus voi olla vain saman projektin tehtävien välillä")

    if dep_in.blocking_task_id == task_id:
        raise HTTPException(status_code=400, detail="Tehtävä ei voi blokkaata itseään")

    if get_dependency(db, task_id, dep_in.blocking_task_id):
        # Already exists — return current state
        return TaskResponse.model_validate(enrich_task(db, task))

    if has_cycle(db, dep_in.blocking_task_id, task_id):
        raise HTTPException(status_code=400, detail="Tämä riippuvuus aiheuttaisi silmukan")

    add_dependency(db, task_id, dep_in.blocking_task_id)
    return TaskResponse.model_validate(enrich_task(db, task))


@router.delete("/tasks/{task_id}/dependencies/{blocking_task_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_task_dependency(
    task_id: int,
    blocking_task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tehtävää ei löydy")
    project = get_project(db, task.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projektia ei löydy")
    _require_membership(db, current_user.id, project.organization_id)

    found = remove_dependency(db, task_id, blocking_task_id)
    if not found:
        raise HTTPException(status_code=404, detail="Riippuvuutta ei löydy")


@router.get("/projects/{project_id}/dependencies", response_model=list[DependencyPair])
def list_project_deps(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Projektia ei löydy")
    _require_membership(db, current_user.id, project.organization_id)

    deps = get_project_dependencies(db, project_id)
    result = []
    for dep in deps:
        blocking = get_task(db, dep.blocking_task_id)
        blocked = get_task(db, dep.blocked_task_id)
        if blocking and blocked:
            result.append(DependencyPair(
                blocking=TaskSummary(id=blocking.id, title=blocking.title, status=blocking.status),
                blocked=TaskSummary(id=blocked.id, title=blocked.title, status=blocked.status),
            ))
    return result
```

- [ ] **Step 2: Register the router in `backend/app/main.py`**

Add the import and `app.include_router` call:

```python
from app.api import auth, comments, dependencies, organizations, users, projects
```

```python
app.include_router(dependencies.router)
```

The full updated import line and router registration (add after `app.include_router(comments.router)`):

```python
app.include_router(dependencies.router)
```

- [ ] **Step 3: Update `backend/app/api/projects.py` to return enriched task responses**

Add the import at the top of `projects.py`:

```python
from app.crud.dependency import enrich_task, enrich_tasks
```

Update `list_project_tasks` (around line 101):

```python
@router.get("/projects/{project_id}/tasks", response_model=list[TaskResponse])
def list_project_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projektia ei löydy")
    _require_membership(db, current_user.id, project.organization_id)
    tasks = get_tasks_by_project(db, project_id)
    return [TaskResponse.model_validate(d) for d in enrich_tasks(db, tasks)]
```

Update `get_single_task` (around line 114):

```python
@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_single_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tehtävää ei löydy")
    project = get_project(db, task.project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projektia ei löydy")
    _require_membership(db, current_user.id, project.organization_id)
    return TaskResponse.model_validate(enrich_task(db, task))
```

Update `patch_task` (around line 130):

```python
@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def patch_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tehtävää ei löydy")
    project = get_project(db, task.project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projektia ei löydy")
    _require_membership(db, current_user.id, project.organization_id)
    updated = update_task(db, task, task_update)
    return TaskResponse.model_validate(enrich_task(db, updated))
```

- [ ] **Step 4: Run the first failing test again to verify it now passes**

Run: `cd backend && python -m pytest tests/test_dependencies.py::test_add_dependency -v`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/dependencies.py backend/app/api/projects.py backend/app/main.py
git commit -m "feat: add dependency API router and enrich task responses with dep data"
```

---

## Task 5: Backend tests

**Files:**
- Modify: `backend/tests/test_dependencies.py`

- [ ] **Step 1: Add all remaining tests to `backend/tests/test_dependencies.py`**

Replace/extend the file with the full test suite:

```python
# backend/tests/test_dependencies.py
from tests.conftest import register_and_login, auth_headers


def _setup(client):
    """Returns (admin_headers, org_id, project_id, task_a_id, task_b_id)"""
    token = register_and_login(client, "admin@x.fi", "salasana")
    ah = auth_headers(token)
    org_id = client.post("/orgs", json={"name": "Org"}, headers=ah).json()["id"]
    project_id = client.post(f"/orgs/{org_id}/projects", json={"name": "P"}, headers=ah).json()["id"]
    task_a = client.post(f"/projects/{project_id}/tasks", json={"title": "A"}, headers=ah).json()
    task_b = client.post(f"/projects/{project_id}/tasks", json={"title": "B"}, headers=ah).json()
    return ah, org_id, project_id, task_a["id"], task_b["id"]


def test_add_dependency(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    resp = client.post(
        f"/tasks/{task_b_id}/dependencies",
        json={"blocking_task_id": task_a_id},
        headers=ah,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert any(b["id"] == task_a_id for b in data["blockers"])


def test_add_dependency_returns_blocking_side_populated(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    client.post(f"/tasks/{task_b_id}/dependencies", json={"blocking_task_id": task_a_id}, headers=ah)
    # task A should now show task B in its blocking list
    resp = client.get(f"/tasks/{task_a_id}", headers=ah)
    assert resp.status_code == 200
    assert any(b["id"] == task_b_id for b in resp.json()["blocking"])


def test_remove_dependency(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    client.post(f"/tasks/{task_b_id}/dependencies", json={"blocking_task_id": task_a_id}, headers=ah)
    resp = client.delete(f"/tasks/{task_b_id}/dependencies/{task_a_id}", headers=ah)
    assert resp.status_code == 204
    data = client.get(f"/tasks/{task_b_id}", headers=ah).json()
    assert data["blockers"] == []


def test_remove_nonexistent_dependency_returns_404(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    resp = client.delete(f"/tasks/{task_b_id}/dependencies/{task_a_id}", headers=ah)
    assert resp.status_code == 404


def test_self_dependency_rejected(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    resp = client.post(
        f"/tasks/{task_a_id}/dependencies",
        json={"blocking_task_id": task_a_id},
        headers=ah,
    )
    assert resp.status_code == 400


def test_cycle_rejected(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    # A blocks B
    client.post(f"/tasks/{task_b_id}/dependencies", json={"blocking_task_id": task_a_id}, headers=ah)
    # B blocks A — would create cycle
    resp = client.post(
        f"/tasks/{task_a_id}/dependencies",
        json={"blocking_task_id": task_b_id},
        headers=ah,
    )
    assert resp.status_code == 400


def test_transitive_cycle_rejected(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    task_c = client.post(f"/projects/{project_id}/tasks", json={"title": "C"}, headers=ah).json()
    task_c_id = task_c["id"]
    # A blocks B, B blocks C
    client.post(f"/tasks/{task_b_id}/dependencies", json={"blocking_task_id": task_a_id}, headers=ah)
    client.post(f"/tasks/{task_c_id}/dependencies", json={"blocking_task_id": task_b_id}, headers=ah)
    # C blocks A — would create transitive cycle
    resp = client.post(
        f"/tasks/{task_a_id}/dependencies",
        json={"blocking_task_id": task_c_id},
        headers=ah,
    )
    assert resp.status_code == 400


def test_cross_project_dependency_rejected(client):
    ah, org_id, project_id, task_a_id, _ = _setup(client)
    project2_id = client.post(f"/orgs/{org_id}/projects", json={"name": "P2"}, headers=ah).json()["id"]
    task_x = client.post(f"/projects/{project2_id}/tasks", json={"title": "X"}, headers=ah).json()
    resp = client.post(
        f"/tasks/{task_a_id}/dependencies",
        json={"blocking_task_id": task_x["id"]},
        headers=ah,
    )
    assert resp.status_code == 400


def test_list_project_dependencies(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    client.post(f"/tasks/{task_b_id}/dependencies", json={"blocking_task_id": task_a_id}, headers=ah)
    resp = client.get(f"/projects/{project_id}/dependencies", headers=ah)
    assert resp.status_code == 200
    pairs = resp.json()
    assert len(pairs) == 1
    assert pairs[0]["blocking"]["id"] == task_a_id
    assert pairs[0]["blocked"]["id"] == task_b_id


def test_task_list_includes_blocker_data(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    client.post(f"/tasks/{task_b_id}/dependencies", json={"blocking_task_id": task_a_id}, headers=ah)
    tasks = client.get(f"/projects/{project_id}/tasks", headers=ah).json()
    task_b_data = next(t for t in tasks if t["id"] == task_b_id)
    assert any(b["id"] == task_a_id for b in task_b_data["blockers"])


def test_non_member_cannot_add_dependency(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    outsider_token = register_and_login(client, "outsider@x.fi", "salasana")
    oh = auth_headers(outsider_token)
    resp = client.post(
        f"/tasks/{task_b_id}/dependencies",
        json={"blocking_task_id": task_a_id},
        headers=oh,
    )
    assert resp.status_code == 403


def test_duplicate_dependency_is_idempotent(client):
    ah, org_id, project_id, task_a_id, task_b_id = _setup(client)
    client.post(f"/tasks/{task_b_id}/dependencies", json={"blocking_task_id": task_a_id}, headers=ah)
    # Second add should not raise — returns 201 with same data
    resp = client.post(
        f"/tasks/{task_b_id}/dependencies",
        json={"blocking_task_id": task_a_id},
        headers=ah,
    )
    assert resp.status_code == 201
    assert len(resp.json()["blockers"]) == 1
```

- [ ] **Step 2: Run all dependency tests**

Run: `cd backend && python -m pytest tests/test_dependencies.py -v`

Expected: All 12 tests PASS

- [ ] **Step 3: Run full test suite to check for regressions**

Run: `cd backend && python -m pytest tests/ -q`

Expected: All tests pass (34 existing + 12 new = 46 total)

- [ ] **Step 4: Commit**

```bash
git add backend/tests/test_dependencies.py
git commit -m "test: add full dependency endpoint test suite"
```

---

## Task 6: Frontend api.ts

**Files:**
- Modify: `frontend/lib/api.ts`

- [ ] **Step 1: Add new types to `frontend/lib/api.ts`**

Add `TaskSummary` and `DependencyPair` types, and update the `Task` interface. Insert after the `Task` interface (around line 167):

```typescript
export interface TaskSummary {
  id: number
  title: string
  status: TaskStatus
}

export interface DependencyPair {
  blocking: TaskSummary
  blocked: TaskSummary
}
```

Update the `Task` interface to include the new fields:

```typescript
export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  project_id: number
  assigned_to: number | null
  created_by: number
  created_at: string
  updated_at: string
  blockers: TaskSummary[]
  blocking: TaskSummary[]
}
```

- [ ] **Step 2: Add three new API functions at the end of `frontend/lib/api.ts`**

```typescript
// ── Dependencies ──────────────────────────────────────────────────────────────

export async function addDependency(taskId: number, blockingTaskId: number): Promise<Task> {
  return request<Task>(`/tasks/${taskId}/dependencies`, {
    method: "POST",
    body: JSON.stringify({ blocking_task_id: blockingTaskId }),
  })
}

export async function removeDependency(taskId: number, blockingTaskId: number): Promise<void> {
  return request<void>(`/tasks/${taskId}/dependencies/${blockingTaskId}`, { method: "DELETE" })
}

export async function getProjectDependencies(projectId: number): Promise<DependencyPair[]> {
  return request<DependencyPair[]>(`/projects/${projectId}/dependencies`)
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/api.ts
git commit -m "feat: add dependency types and API functions to api.ts"
```

---

## Task 7: DependencySection component

**Files:**
- Create: `frontend/components/DependencySection.tsx`

- [ ] **Step 1: Create `frontend/components/DependencySection.tsx`**

```tsx
// frontend/components/DependencySection.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Link2, X } from "lucide-react"
import { addDependency, removeDependency, type Task, type TaskSummary } from "@/lib/api"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DependencySectionProps {
  task: Task
  projectTasks: Task[]       // all tasks in the same project (for the add dropdown)
  onTaskUpdate: (updated: Task) => void
}

export function DependencySection({ task, projectTasks, onTaskUpdate }: DependencySectionProps) {
  const [adding, setAdding] = useState(false)
  const [selectedId, setSelectedId] = useState<string>("")

  // Tasks that can be added as a blocker: same project, not self, not already a blocker
  const blockerIds = new Set(task.blockers.map((b) => b.id))
  const blockingIds = new Set(task.blocking.map((b) => b.id))
  const candidates = projectTasks.filter(
    (t) =>
      t.id !== task.id &&
      !blockerIds.has(t.id) &&
      !blockingIds.has(t.id) // prevent obvious reverse (full cycle check is on backend)
  )

  async function handleAdd() {
    if (!selectedId) return
    setAdding(true)
    try {
      const updated = await addDependency(task.id, Number(selectedId))
      onTaskUpdate(updated)
      setSelectedId("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Riippuvuuden lisääminen epäonnistui")
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(blockingId: number) {
    try {
      await removeDependency(task.id, blockingId)
      onTaskUpdate({ ...task, blockers: task.blockers.filter((b) => b.id !== blockingId) })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Riippuvuuden poistaminen epäonnistui")
    }
  }

  async function handleRemoveBlocking(blockedId: number) {
    try {
      await removeDependency(blockedId, task.id)
      onTaskUpdate({ ...task, blocking: task.blocking.filter((b) => b.id !== blockedId) })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Riippuvuuden poistaminen epäonnistui")
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-muted font-[family-name:var(--font-syne)]">
        <Link2 className="h-3.5 w-3.5" />
        Dependencies
      </div>

      {/* Blocked by */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted">Blocked by</Label>
        {task.blockers.length === 0 ? (
          <p className="text-xs text-muted/60 italic">No blockers</p>
        ) : (
          <ul className="space-y-1">
            {task.blockers.map((b) => (
              <BlockerRow
                key={b.id}
                item={b}
                onRemove={() => handleRemove(b.id)}
              />
            ))}
          </ul>
        )}

        {/* Add blocker */}
        {candidates.length > 0 && (
          <div className="flex gap-2 pt-1">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-surface text-xs text-text px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Add blocker…</option>
              {candidates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdd}
              disabled={!selectedId || adding}
            >
              {adding ? "…" : "Add"}
            </Button>
          </div>
        )}
      </div>

      {/* Blocks */}
      {task.blocking.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted">Blocks</Label>
          <ul className="space-y-1">
            {task.blocking.map((b) => (
              <BlockerRow
                key={b.id}
                item={b}
                onRemove={() => handleRemoveBlocking(b.id)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function BlockerRow({ item, onRemove }: { item: TaskSummary; onRemove: () => void }) {
  const statusColor =
    item.status === "done"
      ? "text-success"
      : item.status === "in_progress"
      ? "text-accent"
      : "text-muted"

  return (
    <li className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs">
      <span className="truncate flex-1 text-text">{item.title}</span>
      <span className={cn("ml-2 shrink-0 font-medium", statusColor)}>
        {item.status === "done" ? "Done" : item.status === "in_progress" ? "In Progress" : "To Do"}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 shrink-0 text-muted hover:text-destructive transition-colors"
        aria-label="Remove dependency"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </li>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/components/DependencySection.tsx
git commit -m "feat: add DependencySection component"
```

---

## Task 8: Update TaskDetailModal

**Files:**
- Modify: `frontend/components/TaskDetailModal.tsx`

- [ ] **Step 1: Add `projectId` and `projectTasks` props, import `DependencySection`, and add soft warning**

Update the imports at the top of `TaskDetailModal.tsx`:

```tsx
import { DependencySection } from "@/components/DependencySection"
```

Update the `TaskDetailModalProps` interface:

```typescript
interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  canDelete: boolean
  currentUserId: number
  isAdmin: boolean
  projectId: number
  projectTasks: Task[]
  onClose: () => void
  onUpdate: (updated: Task) => void
  onDelete: (taskId: number) => void
}
```

Update the destructured props in the function signature:

```typescript
export function TaskDetailModal({
  task,
  open,
  canDelete,
  currentUserId,
  isAdmin,
  projectId,
  projectTasks,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailModalProps) {
```

Add soft warning in `handleSave`. Find the line `const updated = await updateTask(task.id, {` and add the warning check before `setSaving(true)` — actually it should fire after the save. Update `handleSave` to:

```typescript
async function handleSave() {
  if (!task) return
  setSaving(true)
  try {
    const updated = await updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      due_date: dueDate || null,
    })
    onUpdate(updated)
    // Soft warning: task has open blockers but status is moving forward
    const openBlockers = task.blockers.filter((b) => b.status !== "done")
    if (openBlockers.length > 0 && (status === "in_progress" || status === "done")) {
      toast.warning(`Huom: tällä taskilla on ${openBlockers.length} avointa esivaatimusta`)
    } else {
      toast.success("Task updated")
    }
    onClose()
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Failed to update task")
  } finally {
    setSaving(false)
  }
}
```

- [ ] **Step 2: Add `DependencySection` inside the modal scrollable area**

In the JSX, insert `DependencySection` between the action buttons div and the `CommentThread` section (after the closing `</div>` of the action buttons row, before the comments `<div className="mt-6 pt-6 border-t border-border">`):

```tsx
{/* Dependencies */}
{task && (
  <div className="mt-4 pt-4 border-t border-border">
    <DependencySection
      task={task}
      projectTasks={projectTasks.filter((t) => t.id !== task.id)}
      onTaskUpdate={onUpdate}
    />
  </div>
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/components/TaskDetailModal.tsx
git commit -m "feat: add dependency section and soft warning to TaskDetailModal"
```

---

## Task 9: Kanban card blocker icon and project page modal props

**Files:**
- Modify: `frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx`

- [ ] **Step 1: Add `Link2` to the Lucide import list**

Find the existing import line:
```tsx
import { ChevronLeft, Plus, LogOut, ArrowRight, Circle, Search } from "lucide-react"
```

Update to:
```tsx
import { ChevronLeft, Plus, LogOut, ArrowRight, Circle, Search, Link2 } from "lucide-react"
```

- [ ] **Step 2: Add blocker icon to the task card JSX**

Find the kanban card rendering in the JSX. The card renders priority badge and due date. Add the blocker icon in the card's bottom area. Locate the section that renders `<PriorityBadge>` and due date, and add after them (inside the card):

```tsx
{task.blockers.some((b) => b.status !== "done") && (
  <div
    className="flex items-center gap-1 text-[10px] text-warning mt-1"
    title={`Blocked by ${task.blockers.filter((b) => b.status !== "done").length} open task(s)`}
  >
    <Link2 className="h-3 w-3" />
    <span>{task.blockers.filter((b) => b.status !== "done").length} blocker{task.blockers.filter((b) => b.status !== "done").length > 1 ? "s" : ""}</span>
  </div>
)}
```

- [ ] **Step 3: Pass `projectId` and `projectTasks` to `TaskDetailModal`**

Find the `<TaskDetailModal` JSX usage and add the two new props:

```tsx
<TaskDetailModal
  task={selectedTask}
  open={detailOpen}
  canDelete={isAdmin || selectedTask?.created_by === user?.id}
  currentUserId={user?.id ?? 0}
  isAdmin={isAdmin}
  projectId={projectId}
  projectTasks={tasks}
  onClose={() => { setDetailOpen(false); setSelectedTask(null) }}
  onUpdate={(updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setSelectedTask(updated)
  }}
  onDelete={(id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setDetailOpen(false)
    setSelectedTask(null)
  }}
/>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`

Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx"
git commit -m "feat: add blocker icon to kanban cards and pass dep props to modal"
```

---

## Task 10: DependenciesTab and project page tab switcher

**Files:**
- Create: `frontend/components/DependenciesTab.tsx`
- Modify: `frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx`

- [ ] **Step 1: Create `frontend/components/DependenciesTab.tsx`**

```tsx
// frontend/components/DependenciesTab.tsx
"use client"

import { useEffect, useState } from "react"
import { getProjectDependencies, type DependencyPair, type TaskStatus } from "@/lib/api"
import { cn } from "@/lib/utils"

type Filter = "all" | "open" | "resolved"

interface DependenciesTabProps {
  projectId: number
}

function StatusLabel({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; color: string }> = {
    todo: { label: "To Do", color: "text-muted" },
    in_progress: { label: "In Progress", color: "text-accent" },
    done: { label: "Done", color: "text-success" },
  }
  const { label, color } = map[status]
  return <span className={cn("font-medium", color)}>{label}</span>
}

export function DependenciesTab({ projectId }: DependenciesTabProps) {
  const [pairs, setPairs] = useState<DependencyPair[]>([])
  const [filter, setFilter] = useState<Filter>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjectDependencies(projectId)
      .then(setPairs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [projectId])

  const filtered = pairs.filter((p) => {
    if (filter === "open") return p.blocking.status !== "done"
    if (filter === "resolved") return p.blocking.status === "done"
    return true
  })

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "open", label: "Open blockers" },
    { id: "resolved", label: "Resolved" },
  ]

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors font-[family-name:var(--font-syne)]",
              filter === f.id
                ? "bg-surface-2 border-border-strong text-text"
                : "border-border bg-transparent text-muted hover:text-text"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted italic">
          {pairs.length === 0
            ? "No dependencies defined for this project."
            : "No dependencies match the current filter."}
        </p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-xs text-muted font-[family-name:var(--font-syne)]">
                <th className="px-4 py-2.5 text-left font-semibold">Blocker</th>
                <th className="px-2 py-2.5 text-center font-semibold">→</th>
                <th className="px-4 py-2.5 text-left font-semibold">Blocked task</th>
                <th className="px-4 py-2.5 text-left font-semibold">Blocker status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pair, i) => (
                <tr
                  key={`${pair.blocking.id}-${pair.blocked.id}`}
                  className={cn(
                    "border-b border-border last:border-0",
                    i % 2 === 0 ? "bg-surface" : "bg-surface-2/50"
                  )}
                >
                  <td className="px-4 py-3 text-text">{pair.blocking.title}</td>
                  <td className="px-2 py-3 text-center text-muted">→</td>
                  <td className="px-4 py-3 text-text">{pair.blocked.title}</td>
                  <td className="px-4 py-3">
                    <StatusLabel status={pair.blocking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add tab state and tab switcher UI to the project page**

In `frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx`:

Add `activeTab` state after the existing state declarations:

```tsx
const [activeTab, setActiveTab] = useState<"kanban" | "dependencies">("kanban")
```

Add `DependenciesTab` import at the top:

```tsx
import { DependenciesTab } from "@/components/DependenciesTab"
```

In the JSX, after the page header/nav bar and before the kanban columns, add the tab switcher:

```tsx
{/* Tab switcher */}
<div className="flex gap-1 border-b border-border mb-6">
  {(["kanban", "dependencies"] as const).map((tab) => (
    <button
      key={tab}
      type="button"
      onClick={() => setActiveTab(tab)}
      className={cn(
        "px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px font-[family-name:var(--font-syne)]",
        activeTab === tab
          ? "border-accent text-accent"
          : "border-transparent text-muted hover:text-text"
      )}
    >
      {tab === "kanban" ? "Kanban" : "Dependencies"}
    </button>
  ))}
</div>
```

Wrap the kanban columns JSX in a conditional:

```tsx
{activeTab === "kanban" ? (
  <div className="flex gap-4 overflow-x-auto pb-4">
    {/* ... existing kanban columns ... */}
  </div>
) : (
  <DependenciesTab projectId={projectId} />
)}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit`

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/components/DependenciesTab.tsx "frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx"
git commit -m "feat: add DependenciesTab and project page tab switcher"
```

---

## Self-Review Checklist

- [x] Spec coverage: migration ✓, add/remove/list dep endpoints ✓, cycle detection ✓, cross-project reject ✓, self-dep reject ✓, TaskResponse blockers/blocking ✓, DependencySection in modal ✓, soft warning ✓, kanban icon ✓, Dependencies tab ✓, filter bar ✓
- [x] No placeholders — all steps have actual code
- [x] Type consistency: `TaskSummary` defined in Task 6 (api.ts) and Task 2 (schemas), used consistently throughout. `DependencyPair` defined in both. `enrich_task` / `enrich_tasks` defined in Task 3, used in Task 4.
- [x] `DependencySection.onTaskUpdate` matches `TaskDetailModal.onUpdate` signature (`(updated: Task) => void`)
- [x] `projectTasks` prop added to modal in Task 8, wired from page in Task 9
