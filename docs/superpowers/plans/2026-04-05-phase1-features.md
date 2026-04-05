# Phase 1 Feature Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add task priorities, due dates, comments, calendar view, my-tasks dashboard, search, and profile management to produce a convincing full-featured SaaS demo.

**Architecture:** Backend additions are isolated to new files (comment model/crud/router) with minimal changes to existing files (add columns to Task, extend schemas/CRUD). Frontend adds new components following existing patterns; `lib/api.ts` is the single source of truth for all types and API calls.

**Tech Stack:** FastAPI + SQLAlchemy + Alembic + pytest (backend), Next.js 15 + TypeScript + Tailwind v4 + Lucide (frontend), SQLite for tests.

---

## File Map

### New files
| File | Purpose |
|------|---------|
| `backend/alembic/versions/d1a2b3c4e5f6_add_task_fields_and_comments.py` | Migration: due_date, priority, task_comments table |
| `backend/app/schemas/comment.py` | Pydantic schemas for comments |
| `backend/app/crud/comment.py` | Comment CRUD functions |
| `backend/app/api/comments.py` | Comments API router |
| `backend/tests/test_comments.py` | Tests for comments, profile, my-tasks, search |
| `frontend/components/ui/PriorityBadge.tsx` | Priority badge (low/medium/high) |
| `frontend/components/CommentThread.tsx` | Comment list + input |
| `frontend/app/orgs/[orgId]/calendar/page.tsx` | Calendar page |

### Modified files
| File | Change |
|------|--------|
| `backend/app/models/project.py` | Add `due_date`, `priority` to Task; add `TaskComment` class |
| `backend/app/schemas/project.py` | Add `due_date`, `priority` to TaskCreate/Update/Response |
| `backend/app/schemas/user.py` | Add `UserUpdate` schema |
| `backend/app/crud/project.py` | Update `create_task`/`update_task`; add `search_tasks` |
| `backend/app/crud/user.py` | Add `update_user` function |
| `backend/app/api/users.py` | Add `PATCH /users/me`, `GET /users/me/tasks` |
| `backend/app/api/organizations.py` | Add `GET /orgs/{id}/tasks/search` |
| `backend/app/main.py` | Register comments router |
| `frontend/lib/api.ts` | New types + functions for all new endpoints |
| `frontend/components/TaskDetailModal.tsx` | Add priority, due_date, comments (CommentThread) |
| `frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx` | Cards show priority/due date; task form has new fields |
| `frontend/app/orgs/[orgId]/page.tsx` | Add "Calendar" tab |
| `frontend/app/dashboard/page.tsx` | Add "My Tasks" section |

---

## Task 1: Database migration

**Files:**
- Create: `backend/alembic/versions/d1a2b3c4e5f6_add_task_fields_and_comments.py`

- [ ] **Step 1: Create the migration file**

```python
# backend/alembic/versions/d1a2b3c4e5f6_add_task_fields_and_comments.py
"""Add task fields and comments

Revision ID: d1a2b3c4e5f6
Revises: c9f3e2d1b0a7
Create Date: 2026-04-05 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d1a2b3c4e5f6"
down_revision: Union[str, Sequence[str], None] = "c9f3e2d1b0a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("due_date", sa.Date(), nullable=True))
    op.add_column(
        "tasks",
        sa.Column("priority", sa.String(length=10), nullable=False, server_default="medium"),
    )
    op.create_table(
        "task_comments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("task_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["task_id"], ["tasks.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_task_comments_id"), "task_comments", ["id"], unique=False)
    op.create_index(op.f("ix_task_comments_task_id"), "task_comments", ["task_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_task_comments_task_id"), table_name="task_comments")
    op.drop_index(op.f("ix_task_comments_id"), table_name="task_comments")
    op.drop_table("task_comments")
    op.drop_column("tasks", "priority")
    op.drop_column("tasks", "due_date")
```

- [ ] **Step 2: Apply migration**

Run in `backend/` directory:
```bash
alembic upgrade head
```
Expected: `Running upgrade c9f3e2d1b0a7 -> d1a2b3c4e5f6, Add task fields and comments`

- [ ] **Step 3: Commit**

```bash
git add backend/alembic/versions/d1a2b3c4e5f6_add_task_fields_and_comments.py
git commit -m "feat: add migration for task due_date, priority, and task_comments"
```

---

## Task 2: Update Task model and add TaskComment model

**Files:**
- Modify: `backend/app/models/project.py`

- [ ] **Step 1: Update the file**

Replace the entire `backend/app/models/project.py`:

```python
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="todo")
    priority: Mapped[str] = mapped_column(String(10), nullable=False, default="medium")
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False, index=True)
    assigned_to: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class TaskComment(Base):
    __tablename__ = "task_comments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User")  # type: ignore[name-defined]
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/models/project.py
git commit -m "feat: add priority, due_date to Task and TaskComment model"
```

---

## Task 3: Update schemas

**Files:**
- Modify: `backend/app/schemas/project.py`
- Modify: `backend/app/schemas/user.py`
- Create: `backend/app/schemas/comment.py`

- [ ] **Step 1: Update `backend/app/schemas/project.py`**

Replace the entire file:

```python
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: str | None
    organization_id: int
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    assigned_to: int | None = None
    due_date: date | None = None
    priority: Literal["low", "medium", "high"] = "medium"


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: Literal["todo", "in_progress", "done"] | None = None
    assigned_to: int | None = None
    due_date: date | None = None
    priority: Literal["low", "medium", "high"] | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None
    status: str
    priority: str
    due_date: date | None
    project_id: int
    assigned_to: int | None
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
```

- [ ] **Step 2: Add `UserUpdate` to `backend/app/schemas/user.py`**

Append to the end of the file:

```python
class UserUpdate(BaseModel):
    name: str | None = None
    current_password: str | None = None
    new_password: str | None = None
```

- [ ] **Step 3: Create `backend/app/schemas/comment.py`**

```python
from datetime import datetime

from pydantic import BaseModel


class CommentCreate(BaseModel):
    body: str


class CommentAuthor(BaseModel):
    id: int
    name: str | None
    email: str

    model_config = {"from_attributes": True}


class CommentResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    body: str
    created_at: datetime
    user: CommentAuthor

    model_config = {"from_attributes": True}
```

- [ ] **Step 4: Commit**

```bash
git add backend/app/schemas/project.py backend/app/schemas/user.py backend/app/schemas/comment.py
git commit -m "feat: update task schemas with priority/due_date, add comment schemas, add UserUpdate"
```

---

## Task 4: Update CRUD functions

**Files:**
- Modify: `backend/app/crud/project.py`
- Modify: `backend/app/crud/user.py`
- Create: `backend/app/crud/comment.py`

- [ ] **Step 1: Update `create_task` in `backend/app/crud/project.py`**

Replace the `create_task` function:

```python
def create_task(db: Session, task_in: TaskCreate, project_id: int, user_id: int) -> Task:
    task = Task(
        title=task_in.title,
        description=task_in.description,
        project_id=project_id,
        assigned_to=task_in.assigned_to,
        created_by=user_id,
        due_date=task_in.due_date,
        priority=task_in.priority,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
```

- [ ] **Step 2: Add `search_tasks` to `backend/app/crud/project.py`**

Add this import at the top of the file if not present:
```python
from datetime import date
```

Append to the end of `backend/app/crud/project.py`:

```python
def search_tasks(
    db: Session,
    org_id: int,
    q: str | None = None,
    priority: str | None = None,
    assigned_to: int | None = None,
    due_before: date | None = None,
    due_after: date | None = None,
) -> list[Task]:
    query = (
        db.query(Task)
        .join(Project, Task.project_id == Project.id)
        .filter(Project.organization_id == org_id)
    )
    if q:
        query = query.filter(Task.title.ilike(f"%{q}%"))
    if priority:
        query = query.filter(Task.priority == priority)
    if assigned_to is not None:
        query = query.filter(Task.assigned_to == assigned_to)
    if due_before:
        query = query.filter(Task.due_date <= due_before)
    if due_after:
        query = query.filter(Task.due_date >= due_after)
    return query.order_by(Task.due_date.asc().nulls_last()).all()
```

- [ ] **Step 3: Add `update_user` to `backend/app/crud/user.py`**

Add this import at the top:
```python
from app.schemas.user import UserCreate, UserUpdate
```

Append to the end of `backend/app/crud/user.py`:

```python
def update_user(db: Session, user: User, update: UserUpdate) -> User:
    if update.name is not None:
        user.name = update.name
    if update.new_password:
        user.password_hash = hash_password(update.new_password)
    db.commit()
    db.refresh(user)
    return user
```

- [ ] **Step 4: Create `backend/app/crud/comment.py`**

```python
from sqlalchemy.orm import Session

from app.models.project import TaskComment
from app.schemas.comment import CommentCreate


def get_comments_by_task(db: Session, task_id: int) -> list[TaskComment]:
    return (
        db.query(TaskComment)
        .filter(TaskComment.task_id == task_id)
        .order_by(TaskComment.created_at.asc())
        .all()
    )


def create_comment(db: Session, comment_in: CommentCreate, task_id: int, user_id: int) -> TaskComment:
    comment = TaskComment(
        task_id=task_id,
        user_id=user_id,
        body=comment_in.body,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_comment(db: Session, comment_id: int) -> TaskComment | None:
    return db.query(TaskComment).filter(TaskComment.id == comment_id).first()


def delete_comment(db: Session, comment: TaskComment) -> None:
    db.delete(comment)
    db.commit()
```

- [ ] **Step 5: Commit**

```bash
git add backend/app/crud/project.py backend/app/crud/user.py backend/app/crud/comment.py
git commit -m "feat: update task CRUD for priority/due_date, add search_tasks, comment CRUD, update_user"
```

---

## Task 5: Comments API router

**Files:**
- Create: `backend/app/api/comments.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Create `backend/app/api/comments.py`**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud.comment import create_comment, delete_comment, get_comment, get_comments_by_task
from app.crud.project import get_project, get_task
from app.crud.organization import get_membership
from app.db.session import get_db
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse

router = APIRouter(tags=["comments"])


def _require_membership(db: Session, user_id: int, org_id: int):
    membership = get_membership(db, user_id, org_id)
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ei pääsyä organisaatioon")
    return membership


@router.get("/tasks/{task_id}/comments", response_model=list[CommentResponse])
def list_comments(
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
    return get_comments_by_task(db, task_id)


@router.post("/tasks/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    task_id: int,
    comment_in: CommentCreate,
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
    return create_comment(db, comment_in, task_id, current_user.id)


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = get_comment(db, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kommenttia ei löydy")
    task = get_task(db, comment.task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tehtävää ei löydy")
    project = get_project(db, task.project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projektia ei löydy")
    membership = _require_membership(db, current_user.id, project.organization_id)
    if comment.user_id != current_user.id and membership.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Voit poistaa vain omat kommenttisi")
    delete_comment(db, comment)
```

- [ ] **Step 2: Register the router in `backend/app/main.py`**

Change the import line from:
```python
from app.api import auth, organizations, users, projects
```
to:
```python
from app.api import auth, comments, organizations, users, projects
```

Add after `app.include_router(projects.router)`:
```python
app.include_router(comments.router)
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/comments.py backend/app/main.py
git commit -m "feat: add comments API router and register it"
```

---

## Task 6: Profile PATCH and My Tasks endpoints

**Files:**
- Modify: `backend/app/api/users.py`

- [ ] **Step 1: Update `backend/app/api/users.py`**

Replace the entire file:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import verify_password
from app.crud.project import get_tasks_assigned_to_user
from app.crud.user import create_user, get_user_by_email, update_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.project import TaskResponse
from app.schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email on jo käytössä",
        )
    return create_user(db, user_in)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse)
def update_me(
    update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if update.new_password:
        if not update.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nykyinen salasana vaaditaan salasanan vaihtamiseen",
            )
        if not verify_password(update.current_password, current_user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nykyinen salasana on väärä",
            )
    return update_user(db, current_user, update)


@router.get("/me/tasks", response_model=list[TaskResponse])
def my_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_tasks_assigned_to_user(db, current_user.id)
```

- [ ] **Step 2: Add `get_tasks_assigned_to_user` to `backend/app/crud/project.py`**

Append to the end of `backend/app/crud/project.py`:

```python
def get_tasks_assigned_to_user(db: Session, user_id: int) -> list[Task]:
    return (
        db.query(Task)
        .filter(Task.assigned_to == user_id)
        .order_by(Task.due_date.asc().nulls_last(), Task.created_at.desc())
        .all()
    )
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/users.py backend/app/crud/project.py
git commit -m "feat: add PATCH /users/me profile update and GET /users/me/tasks"
```

---

## Task 7: Search endpoint

**Files:**
- Modify: `backend/app/api/organizations.py`

- [ ] **Step 1: Add search endpoint**

Read `backend/app/api/organizations.py` first, then append this route at the end of the file (before any existing closing code):

```python
from datetime import date as date_type

from app.crud.project import search_tasks
from app.schemas.project import TaskResponse


@router.get("/orgs/{org_id}/tasks/search", response_model=list[TaskResponse])
def search_org_tasks(
    org_id: int,
    q: str | None = None,
    priority: str | None = None,
    assigned_to: int | None = None,
    due_before: date_type | None = None,
    due_after: date_type | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = get_membership(db, current_user.id, org_id)
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ei pääsyä organisaatioon")
    return search_tasks(db, org_id, q=q, priority=priority, assigned_to=assigned_to,
                        due_before=due_before, due_after=due_after)
```

Note: `get_membership`, `Session`, `Depends`, `get_db`, `User`, `get_current_user`, `HTTPException`, `status` are already imported in `organizations.py` — only import `date_type`, `search_tasks`, and `TaskResponse` additionally at the top of the file.

- [ ] **Step 2: Commit**

```bash
git add backend/app/api/organizations.py
git commit -m "feat: add GET /orgs/{id}/tasks/search endpoint"
```

---

## Task 8: Backend tests

**Files:**
- Create: `backend/tests/test_comments.py`

- [ ] **Step 1: Write the failing tests**

```python
# backend/tests/test_comments.py
from tests.conftest import register_and_login, auth_headers


def _setup(client):
    """Returns (admin_headers, member_headers, org_id, project_id, task_id)"""
    admin_token = register_and_login(client, "admin@x.fi", "salasana")
    member_token = register_and_login(client, "member@x.fi", "salasana")
    ah = auth_headers(admin_token)
    mh = auth_headers(member_token)
    member_id = client.get("/users/me", headers=mh).json()["id"]
    org_id = client.post("/orgs", json={"name": "Org"}, headers=ah).json()["id"]
    client.post(f"/orgs/{org_id}/members", json={"user_id": member_id, "role": "member"}, headers=ah)
    project_id = client.post(f"/orgs/{org_id}/projects", json={"name": "P"}, headers=ah).json()["id"]
    task_id = client.post(
        f"/projects/{project_id}/tasks",
        json={"title": "T", "priority": "high", "due_date": "2026-06-01"},
        headers=ah,
    ).json()["id"]
    return ah, mh, org_id, project_id, task_id


# ── Task fields ───────────────────────────────────────────────────────────────

def test_task_created_with_priority_and_due_date(client):
    ah, _, org_id, project_id, task_id = _setup(client)
    resp = client.get(f"/tasks/{task_id}", headers=ah)
    assert resp.status_code == 200
    data = resp.json()
    assert data["priority"] == "high"
    assert data["due_date"] == "2026-06-01"


def test_task_priority_defaults_to_medium(client):
    ah, _, org_id, project_id, _ = _setup(client)
    task_id = client.post(
        f"/projects/{project_id}/tasks", json={"title": "No priority"}, headers=ah
    ).json()["id"]
    resp = client.get(f"/tasks/{task_id}", headers=ah)
    assert resp.json()["priority"] == "medium"


def test_update_task_due_date_and_priority(client):
    ah, _, org_id, project_id, task_id = _setup(client)
    resp = client.patch(
        f"/tasks/{task_id}",
        json={"priority": "low", "due_date": "2026-12-31"},
        headers=ah,
    )
    assert resp.status_code == 200
    assert resp.json()["priority"] == "low"
    assert resp.json()["due_date"] == "2026-12-31"


# ── Comments ──────────────────────────────────────────────────────────────────

def test_member_can_add_comment(client):
    ah, mh, org_id, project_id, task_id = _setup(client)
    resp = client.post(f"/tasks/{task_id}/comments", json={"body": "Hei!"}, headers=mh)
    assert resp.status_code == 201
    assert resp.json()["body"] == "Hei!"


def test_list_comments(client):
    ah, mh, _, _, task_id = _setup(client)
    client.post(f"/tasks/{task_id}/comments", json={"body": "Eka"}, headers=ah)
    client.post(f"/tasks/{task_id}/comments", json={"body": "Toka"}, headers=mh)
    resp = client.get(f"/tasks/{task_id}/comments", headers=ah)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_user_can_delete_own_comment(client):
    ah, mh, _, _, task_id = _setup(client)
    comment_id = client.post(f"/tasks/{task_id}/comments", json={"body": "Poista"}, headers=mh).json()["id"]
    resp = client.delete(f"/comments/{comment_id}", headers=mh)
    assert resp.status_code == 204


def test_user_cannot_delete_others_comment(client):
    ah, mh, _, _, task_id = _setup(client)
    comment_id = client.post(f"/tasks/{task_id}/comments", json={"body": "Admin kirjoitti"}, headers=ah).json()["id"]
    resp = client.delete(f"/comments/{comment_id}", headers=mh)
    assert resp.status_code == 403


def test_admin_can_delete_any_comment(client):
    ah, mh, _, _, task_id = _setup(client)
    comment_id = client.post(f"/tasks/{task_id}/comments", json={"body": "Member kirjoitti"}, headers=mh).json()["id"]
    resp = client.delete(f"/comments/{comment_id}", headers=ah)
    assert resp.status_code == 204


# ── Profile update ────────────────────────────────────────────────────────────

def test_update_profile_name(client):
    token = register_and_login(client, "user@x.fi", "salasana")
    resp = client.patch("/users/me", json={"name": "Uusi Nimi"}, headers=auth_headers(token))
    assert resp.status_code == 200
    assert resp.json()["name"] == "Uusi Nimi"


def test_change_password_requires_current_password(client):
    token = register_and_login(client, "user2@x.fi", "salasana")
    resp = client.patch(
        "/users/me",
        json={"new_password": "uusisalasana"},
        headers=auth_headers(token),
    )
    assert resp.status_code == 400


def test_change_password_wrong_current(client):
    token = register_and_login(client, "user3@x.fi", "salasana")
    resp = client.patch(
        "/users/me",
        json={"current_password": "väärä", "new_password": "uusisalasana"},
        headers=auth_headers(token),
    )
    assert resp.status_code == 400


def test_change_password_success(client):
    token = register_and_login(client, "user4@x.fi", "salasana")
    resp = client.patch(
        "/users/me",
        json={"current_password": "salasana", "new_password": "uusisalasana"},
        headers=auth_headers(token),
    )
    assert resp.status_code == 200
    # Login with new password works
    login_resp = client.post(
        "/auth/login", data={"username": "user4@x.fi", "password": "uusisalasana"}
    )
    assert login_resp.status_code == 200


# ── My Tasks ──────────────────────────────────────────────────────────────────

def test_my_tasks_returns_assigned_tasks(client):
    ah, mh, org_id, project_id, task_id = _setup(client)
    member_id = client.get("/users/me", headers=mh).json()["id"]
    client.patch(f"/tasks/{task_id}", json={"assigned_to": member_id}, headers=ah)
    resp = client.get("/users/me/tasks", headers=mh)
    assert resp.status_code == 200
    assert any(t["id"] == task_id for t in resp.json())


# ── Search ────────────────────────────────────────────────────────────────────

def test_search_by_title(client):
    ah, _, org_id, project_id, task_id = _setup(client)
    resp = client.get(f"/orgs/{org_id}/tasks/search?q=T", headers=ah)
    assert resp.status_code == 200
    assert any(t["id"] == task_id for t in resp.json())


def test_search_by_priority(client):
    ah, _, org_id, project_id, task_id = _setup(client)
    resp = client.get(f"/orgs/{org_id}/tasks/search?priority=high", headers=ah)
    assert resp.status_code == 200
    assert any(t["id"] == task_id for t in resp.json())


def test_search_outsider_forbidden(client):
    ah, _, org_id, _, _ = _setup(client)
    outsider = auth_headers(register_and_login(client, "out@x.fi", "salasana"))
    resp = client.get(f"/orgs/{org_id}/tasks/search?q=T", headers=outsider)
    assert resp.status_code == 403
```

- [ ] **Step 2: Run tests to verify they fail (before implementation is complete)**

Run from `backend/` directory:
```bash
pytest tests/test_comments.py -v
```
Expected: Several FAILs — this confirms the tests are real and not false-positives.

- [ ] **Step 3: Run full test suite to confirm nothing is broken**

```bash
pytest -v
```
Expected: All pre-existing tests PASS. New tests may still FAIL if backend is not fully wired.

- [ ] **Step 4: Fix any failures, then run again until all pass**

```bash
pytest -v
```
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/tests/test_comments.py
git commit -m "test: add tests for comments, profile update, my-tasks, search"
```

---

## Task 9: Update frontend API client

**Files:**
- Modify: `frontend/lib/api.ts`

- [ ] **Step 1: Update the `Task` interface and `TaskStatus` type**

In `frontend/lib/api.ts`, replace the Tasks section (from `export type TaskStatus` to end of file) with:

```typescript
// ── Tasks ─────────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null   // ISO date string "YYYY-MM-DD"
  project_id: number
  assigned_to: number | null
  created_by: number
  created_at: string
  updated_at: string
}

export async function getTasks(projectId: number): Promise<Task[]> {
  return request<Task[]>(`/projects/${projectId}/tasks`)
}

export async function createTask(
  projectId: number,
  fields: { title: string; description?: string; priority?: TaskPriority; due_date?: string; assigned_to?: number }
): Promise<Task> {
  return request<Task>(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ description: null, priority: "medium", due_date: null, ...fields }),
  })
}

export async function updateTask(
  taskId: number,
  fields: Partial<{ title: string; description: string | null; status: TaskStatus; priority: TaskPriority; due_date: string | null; assigned_to: number | null }>
): Promise<Task> {
  return request<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  })
}

export async function deleteTask(taskId: number): Promise<void> {
  return request<void>(`/tasks/${taskId}`, { method: "DELETE" })
}

// ── Comments ──────────────────────────────────────────────────────────────────

export interface Comment {
  id: number
  task_id: number
  user_id: number
  body: string
  created_at: string
  user: { id: number; name: string | null; email: string }
}

export async function getComments(taskId: number): Promise<Comment[]> {
  return request<Comment[]>(`/tasks/${taskId}/comments`)
}

export async function addComment(taskId: number, body: string): Promise<Comment> {
  return request<Comment>(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
  })
}

export async function deleteComment(commentId: number): Promise<void> {
  return request<void>(`/comments/${commentId}`, { method: "DELETE" })
}

// ── My Tasks ──────────────────────────────────────────────────────────────────

export async function getMyTasks(): Promise<Task[]> {
  return request<Task[]>("/users/me/tasks")
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchParams {
  q?: string
  priority?: TaskPriority
  assigned_to?: number
  due_before?: string
  due_after?: string
}

export async function searchTasks(orgId: number, params: SearchParams): Promise<Task[]> {
  const qs = new URLSearchParams()
  if (params.q) qs.set("q", params.q)
  if (params.priority) qs.set("priority", params.priority)
  if (params.assigned_to !== undefined) qs.set("assigned_to", String(params.assigned_to))
  if (params.due_before) qs.set("due_before", params.due_before)
  if (params.due_after) qs.set("due_after", params.due_after)
  return request<Task[]>(`/orgs/${orgId}/tasks/search?${qs.toString()}`)
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function updateProfile(fields: {
  name?: string
  current_password?: string
  new_password?: string
}): Promise<User> {
  return request<User>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(fields),
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/lib/api.ts
git commit -m "feat: update api.ts with priority/due_date, comments, my-tasks, search, profile"
```

---

## Task 10: PriorityBadge component

**Files:**
- Create: `frontend/components/ui/PriorityBadge.tsx`

- [ ] **Step 1: Create the component**

```typescript
// frontend/components/ui/PriorityBadge.tsx
import { cn } from "@/lib/utils"
import type { TaskPriority } from "@/lib/api"

const CONFIG: Record<TaskPriority, { label: string; classes: string }> = {
  high: {
    label: "High",
    classes: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/25",
  },
  medium: {
    label: "Medium",
    classes: "bg-accent/10 text-accent border-accent/25",
  },
  low: {
    label: "Low",
    classes: "bg-[#fde047]/10 text-[#fde047] border-[#fde047]/25",
  },
}

interface PriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const { label, classes } = CONFIG[priority]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide font-[family-name:var(--font-syne)]",
        classes,
        className,
      )}
    >
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/ui/PriorityBadge.tsx
git commit -m "feat: add PriorityBadge component"
```

---

## Task 11: CommentThread component

**Files:**
- Create: `frontend/components/CommentThread.tsx`

- [ ] **Step 1: Create the component**

```typescript
// frontend/components/CommentThread.tsx
"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getComments, addComment, deleteComment, type Comment } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommentThreadProps {
  taskId: number
  currentUserId: number
  isAdmin: boolean
}

export function CommentThread({ taskId, currentUserId, isAdmin }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getComments(taskId).then(setComments).catch(() => {})
  }, [taskId])

  async function handleSubmit() {
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const comment = await addComment(taskId, body.trim())
      setComments((prev) => [...prev, comment])
      setBody("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(commentId: number) {
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete comment")
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted font-[family-name:var(--font-syne)]">
        Comments
      </h3>

      {comments.length === 0 ? (
        <p className="text-xs text-muted">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="group flex gap-2">
              <div className="flex-1 rounded-lg bg-surface-2 border border-border px-3 py-2 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text font-[family-name:var(--font-syne)]">
                    {c.user.name ?? c.user.email}
                  </span>
                  <span className="text-[10px] text-muted">
                    {new Date(c.created_at).toLocaleDateString("fi-FI")}
                  </span>
                </div>
                <p className="text-xs text-text/80 whitespace-pre-wrap">{c.body}</p>
              </div>
              {(c.user_id === currentUserId || isAdmin) && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    "text-muted hover:text-destructive p-1 rounded",
                  )}
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          className="min-h-[72px] text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit()
          }}
        />
        <Button size="sm" onClick={handleSubmit} disabled={submitting || !body.trim()}>
          {submitting ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/CommentThread.tsx
git commit -m "feat: add CommentThread component"
```

---

## Task 12: Extend TaskDetailModal with priority, due date, and comments

**Files:**
- Modify: `frontend/components/TaskDetailModal.tsx`

- [ ] **Step 1: Replace the entire file**

```typescript
// frontend/components/TaskDetailModal.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updateTask, deleteTask, type Task, type TaskStatus, type TaskPriority } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import { CommentThread } from "@/components/CommentThread"
import { Trash2, Save } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: {
  id: TaskStatus
  label: string
  dot: string
  activeClass: string
}[] = [
  {
    id: "todo",
    label: "To Do",
    dot: "bg-muted",
    activeClass: "bg-surface-2 border-border-strong text-text",
  },
  {
    id: "in_progress",
    label: "In Progress",
    dot: "bg-accent",
    activeClass: "bg-accent/10 border-accent/35 text-accent",
  },
  {
    id: "done",
    label: "Done",
    dot: "bg-success",
    activeClass: "bg-success/10 border-success/35 text-success",
  },
]

const PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high"]

interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  canDelete: boolean
  currentUserId: number
  isAdmin: boolean
  onClose: () => void
  onUpdate: (updated: Task) => void
  onDelete: (taskId: number) => void
}

export function TaskDetailModal({
  task,
  open,
  canDelete,
  currentUserId,
  isAdmin,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "todo")
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium")
  const [dueDate, setDueDate] = useState(task?.due_date ?? "")
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Sync local state when task changes
  if (task && !saving && !deleting) {
    if (title !== task.title) setTitle(task.title)
    if (description !== (task.description ?? "")) setDescription(task.description ?? "")
    if (status !== task.status) setStatus(task.status)
    if (priority !== task.priority) setPriority(task.priority)
    if (dueDate !== (task.due_date ?? "")) setDueDate(task.due_date ?? "")
  }

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
      toast.success("Task updated")
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    setDeleting(true)
    try {
      await deleteTask(task.id)
      onDelete(task.id)
      toast.success("Task deleted")
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task")
      setDeleting(false)
    }
  }

  const isDirty =
    task &&
    (title.trim() !== task.title ||
      (description.trim() || null) !== task.description ||
      status !== task.status ||
      priority !== task.priority ||
      (dueDate || null) !== task.due_date)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setConfirmDelete(false)
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="detail-title">Title</Label>
            <Input
              id="detail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="detail-desc">Description</Label>
            <Textarea
              id="detail-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              className="min-h-[80px]"
            />
          </div>

          {/* Priority + Due date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <div className="flex gap-1.5">
                {PRIORITY_OPTIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "flex-1 rounded-lg border px-2 py-1.5 transition-all duration-150",
                      priority === p
                        ? "ring-2 ring-offset-1 ring-offset-surface ring-current opacity-100"
                        : "opacity-50 hover:opacity-75",
                    )}
                  >
                    <PriorityBadge priority={p} className="w-full justify-center" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="detail-due">Due date</Label>
              <Input
                id="detail-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status</Label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStatus(opt.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all duration-150",
                    "font-[family-name:var(--font-syne)]",
                    status === opt.id
                      ? opt.activeClass
                      : "border-border bg-transparent text-muted hover:border-border-strong hover:text-text",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      status === opt.id ? opt.dot : "bg-faint",
                    )}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex items-center justify-between">
          {canDelete ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Delete this task?</span>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting…" : "Yes, delete"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-muted hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            )
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !isDirty || !title.trim()}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        {/* Comments */}
        {task && (
          <div className="mt-6 pt-6 border-t border-border">
            <CommentThread taskId={task.id} currentUserId={currentUserId} isAdmin={isAdmin} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/TaskDetailModal.tsx
git commit -m "feat: extend TaskDetailModal with priority, due date, and comments"
```

---

## Task 13: Update Kanban board

**Files:**
- Modify: `frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx`

- [ ] **Step 1: Add PriorityBadge import**

At the top of the file, add:
```typescript
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import type { TaskPriority } from "@/lib/api"
```

- [ ] **Step 2: Update the task card JSX to show priority and due date**

Find the task card rendering section (the inner card div inside the column map). Locate where the task title is rendered and add below it:

```tsx
{/* Priority + due date row on card */}
<div className="flex items-center gap-2 mt-2 flex-wrap">
  <PriorityBadge priority={task.priority} />
  {task.due_date && (
    <span
      className={cn(
        "text-[10px] font-medium",
        new Date(task.due_date) < new Date() && task.status !== "done"
          ? "text-[#ef4444]"
          : "text-muted",
      )}
    >
      {new Date(task.due_date).toLocaleDateString("fi-FI")}
    </span>
  )}
</div>
```

- [ ] **Step 3: Update the createTask call in the create-task form**

Find `createTask(projectId, newTaskTitle.trim(), ...)` and update to use the new signature:

```typescript
const task = await createTask(projectId, {
  title: newTaskTitle.trim(),
  description: newTaskDesc.trim() || undefined,
  priority: newTaskPriority,
  due_date: newTaskDueDate || undefined,
})
```

- [ ] **Step 4: Add priority and due date fields to the create-task form state**

Add state variables near the other form state:
```typescript
const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium")
const [newTaskDueDate, setNewTaskDueDate] = useState("")
```

- [ ] **Step 5: Add priority selector and due date input to the create-task form JSX**

Inside the create-task Dialog form, after the description Textarea, add:

```tsx
<div className="space-y-1.5">
  <Label>Priority</Label>
  <div className="flex gap-2">
    {(["low", "medium", "high"] as TaskPriority[]).map((p) => (
      <button
        key={p}
        type="button"
        onClick={() => setNewTaskPriority(p)}
        className={cn(
          "flex-1 rounded-lg border px-2 py-1.5 transition-all duration-150",
          newTaskPriority === p ? "ring-2 ring-offset-1 ring-offset-surface ring-accent" : "opacity-50 hover:opacity-75",
        )}
      >
        <PriorityBadge priority={p} className="w-full justify-center" />
      </button>
    ))}
  </div>
</div>

<div className="space-y-1.5">
  <Label htmlFor="new-task-due">Due date (optional)</Label>
  <Input
    id="new-task-due"
    type="date"
    value={newTaskDueDate}
    onChange={(e) => setNewTaskDueDate(e.target.value)}
  />
</div>
```

- [ ] **Step 6: Pass `currentUserId` and `isAdmin` to TaskDetailModal**

Find the `<TaskDetailModal .../>` usage and add the two new required props:
```tsx
currentUserId={user?.id ?? 0}
isAdmin={membership?.role === "admin"}
```

- [ ] **Step 7: Reset new form state on dialog close**

In the dialog close/submit handler, reset:
```typescript
setNewTaskPriority("medium")
setNewTaskDueDate("")
```

- [ ] **Step 8: Verify in browser**

Start frontend (`npm run dev`). Open a project. Confirm:
- New task form has priority buttons and date picker
- Task cards show PriorityBadge and due date
- Clicking a card opens the modal with comments section

- [ ] **Step 9: Commit**

```bash
git add frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx
git commit -m "feat: update kanban board with priority, due date fields and comments in modal"
```

---

## Task 14: My Tasks section on dashboard

**Files:**
- Modify: `frontend/app/dashboard/page.tsx`

- [ ] **Step 1: Add getMyTasks import**

Add `getMyTasks` to the imports from `@/lib/api`.

- [ ] **Step 2: Add state and fetch**

Add state near other state:
```typescript
const [myTasks, setMyTasks] = useState<Task[]>([])
```

Inside the existing `useEffect` that fetches data (or in a separate one), add:
```typescript
getMyTasks().then(setMyTasks).catch(() => {})
```

- [ ] **Step 3: Add My Tasks section to the JSX**

After the organizations section, add:

```tsx
{/* My Tasks */}
{myTasks.length > 0 && (
  <section className="mt-10">
    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4 font-[family-name:var(--font-syne)]">
      My Tasks
    </h2>
    <div className="space-y-2">
      {myTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
        >
          <PriorityBadge priority={task.priority} />
          <span className="flex-1 text-sm text-text truncate">{task.title}</span>
          {task.due_date && (
            <span
              className={cn(
                "text-xs shrink-0",
                new Date(task.due_date) < new Date() && task.status !== "done"
                  ? "text-[#ef4444]"
                  : "text-muted",
              )}
            >
              {new Date(task.due_date).toLocaleDateString("fi-FI")}
            </span>
          )}
        </div>
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 4: Add missing imports at top of file**

```typescript
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/api"
```

- [ ] **Step 5: Verify in browser**

Assign a task to yourself in a project. Go to dashboard. Confirm "My Tasks" section appears.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/dashboard/page.tsx
git commit -m "feat: add My Tasks section to dashboard"
```

---

## Task 15: Calendar view

**Files:**
- Create: `frontend/app/orgs/[orgId]/calendar/page.tsx`
- Modify: `frontend/app/orgs/[orgId]/page.tsx`

- [ ] **Step 1: Create the calendar page**

```typescript
// frontend/app/orgs/[orgId]/calendar/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { getOrgs, getProjects, getTasks, type Membership, type Task } from "@/lib/api"
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  // Monday = 0, Sunday = 6
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export default function CalendarPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orgId = Number(params.orgId)

  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [membership, setMembership] = useState<Membership | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.replace("/")
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    async function load() {
      setFetching(true)
      try {
        const [orgs, projects] = await Promise.all([getOrgs(), getProjects(orgId)])
        const m = orgs.find((o) => o.organization.id === orgId) ?? null
        setMembership(m)
        if (!m) { router.replace("/dashboard"); return }
        const taskArrays = await Promise.all(projects.map((p) => getTasks(p.id)))
        setAllTasks(taskArrays.flat().filter((t) => t.due_date !== null))
      } catch {
        toast.error("Failed to load calendar data")
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [user, orgId])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  function tasksForDay(day: number): Task[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return allTasks.filter((t) => t.due_date === dateStr)
  }

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/orgs/${orgId}`}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <span className="text-text font-semibold font-[family-name:var(--font-syne)]">
            {membership?.organization.name} — Calendar
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-muted">
          <LogOut className="h-4 w-4 mr-1.5" />
          Sign out
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-text">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-text font-[family-name:var(--font-syne)]">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface transition-colors text-muted hover:text-text">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted py-2 font-[family-name:var(--font-syne)]">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
          {cells.map((day, idx) => {
            const isToday =
              day !== null &&
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear()
            const dayTasks = day ? tasksForDay(day) : []

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[100px] bg-surface p-2 flex flex-col gap-1",
                  day === null && "bg-surface/40",
                )}
              >
                {day !== null && (
                  <>
                    <span
                      className={cn(
                        "text-xs font-semibold self-start leading-none font-[family-name:var(--font-syne)]",
                        isToday
                          ? "bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center"
                          : "text-muted",
                      )}
                    >
                      {day}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-medium truncate leading-tight",
                            task.priority === "high" && "bg-[#ef4444]/15 text-[#ef4444]",
                            task.priority === "medium" && "bg-accent/15 text-accent",
                            task.priority === "low" && "bg-[#fde047]/15 text-[#fde047]",
                          )}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-xs text-muted font-[family-name:var(--font-syne)]">Priority:</span>
          {(["high", "medium", "low"] as const).map((p) => (
            <PriorityBadge key={p} priority={p} />
          ))}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Add Calendar tab to `frontend/app/orgs/[orgId]/page.tsx`**

Find the `activeTab` state definition:
```typescript
const [activeTab, setActiveTab] = useState<"projects" | "members">("projects")
```
Change to:
```typescript
const [activeTab, setActiveTab] = useState<"projects" | "members" | "calendar">("projects")
```

Find the tab buttons section (where "projects" and "members" tabs are rendered) and add a third tab:
```tsx
<button
  onClick={() => setActiveTab("calendar")}
  className={cn(
    "px-4 py-2 text-sm font-semibold rounded-lg transition-colors font-[family-name:var(--font-syne)]",
    activeTab === "calendar"
      ? "bg-accent/10 text-accent"
      : "text-muted hover:text-text",
  )}
>
  Calendar
</button>
```

Find the tab content section and add:
```tsx
{activeTab === "calendar" && (
  <div className="flex flex-col items-center gap-4 py-8">
    <p className="text-muted text-sm">View all tasks with due dates on the calendar.</p>
    <Link href={`/orgs/${orgId}/calendar`}>
      <Button>Open Calendar</Button>
    </Link>
  </div>
)}
```

Add `Link` to imports if not already there: `import Link from "next/link"`

- [ ] **Step 3: Verify in browser**

Go to an org page. Click "Calendar" tab. Click "Open Calendar". Confirm monthly grid renders with tasks on their due dates.

- [ ] **Step 4: Commit**

```bash
git add frontend/app/orgs/[orgId]/calendar/page.tsx frontend/app/orgs/[orgId]/page.tsx
git commit -m "feat: add calendar page and calendar tab to org page"
```

---

## Task 16: Search modal

**Files:**
- Create: `frontend/components/SearchModal.tsx`

- [ ] **Step 1: Create the component**

```typescript
// frontend/components/SearchModal.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { searchTasks, type Task, type TaskPriority } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PriorityBadge } from "@/components/ui/PriorityBadge"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchModalProps {
  open: boolean
  orgId: number
  onClose: () => void
}

export function SearchModal({ open, orgId, onClose }: SearchModalProps) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) { setQ(""); setResults([]) }
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchTasks(orgId, { q: q.trim() })
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [q, orgId])

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">Search tasks</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks…"
            className="pl-9"
          />
        </div>

        {loading && <p className="text-xs text-muted py-4 text-center">Searching…</p>}

        {!loading && q && results.length === 0 && (
          <p className="text-xs text-muted py-4 text-center">No tasks found for "{q}"</p>
        )}

        {results.length > 0 && (
          <div className="mt-2 space-y-1 max-h-72 overflow-y-auto">
            {results.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2 transition-colors"
              >
                <PriorityBadge priority={task.priority} />
                <span className="flex-1 text-sm text-text truncate">{task.title}</span>
                {task.due_date && (
                  <span className="text-[10px] text-muted shrink-0">
                    {new Date(task.due_date).toLocaleDateString("fi-FI")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Add search trigger to the kanban page header**

In `frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx`, add state and import:
```typescript
import { SearchModal } from "@/components/SearchModal"
// ...
const [searchOpen, setSearchOpen] = useState(false)
```

In the page header, add a search button next to existing buttons:
```tsx
<Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)} className="text-muted">
  <Search className="h-4 w-4 mr-1.5" />
  Search
</Button>
```

And render the modal at the bottom of the return:
```tsx
<SearchModal open={searchOpen} orgId={orgId} onClose={() => setSearchOpen(false)} />
```

Import `Search` from lucide-react (it may already be imported).

- [ ] **Step 3: Verify in browser**

Click the Search button on a project page. Type a query. Confirm results appear with debounce.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/SearchModal.tsx frontend/app/orgs/[orgId]/projects/[projectId]/page.tsx
git commit -m "feat: add SearchModal and search trigger on kanban page"
```

---

## Task 17: Profile settings modal

**Files:**
- Create: `frontend/components/ProfileSettings.tsx`

- [ ] **Step 1: Create the component**

```typescript
// frontend/components/ProfileSettings.tsx
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { updateProfile } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

interface ProfileSettingsProps {
  open: boolean
  onClose: () => void
}

export function ProfileSettings({ open, onClose }: ProfileSettingsProps) {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const fields: { name?: string; current_password?: string; new_password?: string } = {}
      if (name.trim() !== (user?.name ?? "")) fields.name = name.trim()
      if (newPassword) {
        fields.current_password = currentPassword
        fields.new_password = newPassword
      }
      if (Object.keys(fields).length === 0) { onClose(); return }
      await updateProfile(fields)
      toast.success("Profile updated")
      setCurrentPassword("")
      setNewPassword("")
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Profile settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Display name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <hr className="border-border" />

          <p className="text-xs text-muted font-[family-name:var(--font-syne)] uppercase tracking-widest">
            Change password
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="profile-current-pw">Current password</Label>
            <Input
              id="profile-current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-new-pw">New password</Label>
            <Input
              id="profile-new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Add profile settings trigger to the dashboard page**

In `frontend/app/dashboard/page.tsx`, add state and import:
```typescript
import { ProfileSettings } from "@/components/ProfileSettings"
// ...
const [profileOpen, setProfileOpen] = useState(false)
```

In the page header (near the logout button), add a settings button:
```tsx
<Button variant="ghost" size="sm" onClick={() => setProfileOpen(true)} className="text-muted">
  <Settings className="h-4 w-4 mr-1.5" />
  Settings
</Button>
```

Import `Settings` from lucide-react. Render modal at bottom of return:
```tsx
<ProfileSettings open={profileOpen} onClose={() => setProfileOpen(false)} />
```

- [ ] **Step 3: Verify in browser**

Open dashboard. Click Settings. Change name. Confirm toast appears.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/ProfileSettings.tsx frontend/app/dashboard/page.tsx
git commit -m "feat: add ProfileSettings modal and trigger on dashboard"
```

---

## Final verification

- [ ] Run full backend test suite: `cd backend && pytest -v` — all tests PASS
- [ ] Start both servers and manually test the full flow:
  1. Register two users
  2. Create org, add second user as member
  3. Create project, create tasks with priority + due date
  4. Move tasks across kanban columns
  5. Open a task, add a comment, delete it
  6. Check dashboard My Tasks section
  7. Open calendar, navigate months
  8. Use search
  9. Update profile name
- [ ] Commit any final fixes
