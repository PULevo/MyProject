from sqlalchemy.orm import Session

from app.models.project import Project, Task
from app.schemas.project import ProjectCreate, TaskCreate, TaskUpdate


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


def create_task(db: Session, task_in: TaskCreate, project_id: int, user_id: int) -> Task:
    task = Task(
        title=task_in.title,
        description=task_in.description,
        project_id=project_id,
        assigned_to=task_in.assigned_to,
        created_by=user_id,
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
