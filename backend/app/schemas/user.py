from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserUpdate(BaseModel):
    name: str | None = None
    current_password: str | None = None
    new_password: str | None = None

    @field_validator("name", "current_password", "new_password")
    @classmethod
    def not_empty(cls, v: str | None) -> str | None:
        if v is not None and v.strip() == "":
            raise ValueError("must not be empty")
        return v
