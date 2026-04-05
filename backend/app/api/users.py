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
