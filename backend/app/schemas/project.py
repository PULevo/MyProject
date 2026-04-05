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
    status: Literal["todo", "in_progress", "done"]
    priority: Literal["low", "medium", "high"]
    due_date: date | None
    project_id: int
    assigned_to: int | None
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
