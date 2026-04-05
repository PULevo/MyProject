from sqlalchemy.orm import Session, joinedload

from app.models.project import TaskComment
from app.schemas.comment import CommentCreate


def get_comments_by_task(db: Session, task_id: int) -> list[TaskComment]:
    return (
        db.query(TaskComment)
        .options(joinedload(TaskComment.user))
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
    return (
        db.query(TaskComment)
        .options(joinedload(TaskComment.user))
        .filter(TaskComment.id == comment.id)
        .first()
    )


def get_comment(db: Session, comment_id: int) -> TaskComment | None:
    return db.query(TaskComment).filter(TaskComment.id == comment_id).first()


def delete_comment(db: Session, comment: TaskComment) -> None:
    db.delete(comment)
    db.commit()
