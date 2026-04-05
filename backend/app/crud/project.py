from datetime import date

from sqlalchemy.orm import Session

from app.models.project import Project, Task
from app.schemas.project import ProjectCreate, ProjectUpdate, TaskCreate, TaskUpdate


def create_project(db: Session, project_in: ProjectCreate, org_id: int, user_id: int) -> Project:
    project = Project(
        name=project_in.name,
        description=project_in.description,
        organization_id=org_id,
        created_by=user_id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def get_projects_by_org(db: Session, org_id: int) -> list[Project]:
    return db.query(Project).filter(Project.organization_id == org_id).all()


def get_project(db: Session, project_id: int) -> Project | None:
    return db.query(Project).filter(Project.id == project_id).first()


def update_project(db: Session, project: Project, project_update: ProjectUpdate) -> Project:
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    db.delete(project)
    db.commit()


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


def get_tasks_by_project(db: Session, project_id: int) -> list[Task]:
    return db.query(Task).filter(Task.project_id == project_id).all()


def get_task(db: Session, task_id: int) -> Task | None:
    return db.query(Task).filter(Task.id == task_id).first()


def update_task(db: Session, task: Task, task_update: TaskUpdate) -> Task:
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()


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


def get_tasks_assigned_to_user(db: Session, user_id: int) -> list[Task]:
    return (
        db.query(Task)
        .filter(Task.assigned_to == user_id)
        .order_by(Task.due_date.asc().nulls_last(), Task.created_at.desc())
        .all()
    )
