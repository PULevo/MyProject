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
