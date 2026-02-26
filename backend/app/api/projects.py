from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud.organization import get_membership
from app.crud.project import (
    create_project,
    create_task,
    delete_task,
    delete_project,
    get_project,
    get_projects_by_org,
    get_task,
    get_tasks_by_project,
    update_task,
)

from app.db.session import get_db
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectResponse, TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(tags=["projects"])


def _require_membership(db: Session, user_id: int, org_id: int):
    membership = get_membership(db, user_id, org_id)
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ei pääsyä organisaatioon")
    return membership


@router.post("/orgs/{org_id}/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_org_project(
    org_id: int,
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(db, current_user.id, org_id)
    return create_project(db, project_in, org_id, current_user.id)


@router.get("/orgs/{org_id}/projects", response_model=list[ProjectResponse])
def list_org_projects(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(db, current_user.id, org_id)
    return get_projects_by_org(db, org_id)


@router.post("/projects/{project_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_project_task(
    project_id: int,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projektia ei löydy")
    _require_membership(db, current_user.id, project.organization_id)
    return create_task(db, task_in, project_id, current_user.id)


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
    return get_tasks_by_project(db, project_id)


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
    _require_membership(db, current_user.id, project.organization_id)
    return update_task(db, task, task_update)

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tehtävää ei löydy")
    project = get_project(db, task.project_id)
    _require_membership(db, current_user.id, project.organization_id)
    delete_task(db, task)
    
@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_org_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projektia ei löydy")
    _require_membership(db, current_user.id, project.organization_id)
    if get_tasks_by_project(db, project_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Projektilla on tehtäviä — poista tehtävät ensin",
        )
    delete_project(db, project)


