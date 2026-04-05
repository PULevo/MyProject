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
