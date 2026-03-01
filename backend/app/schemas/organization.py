from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserResponse


class OrganizationCreate(BaseModel):
    name: str


class OrganizationResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MembershipResponse(BaseModel):
    id: int
    role: str
    organization: OrganizationResponse

    model_config = {"from_attributes": True}

class MemberAddRequest(BaseModel):
    user_id: int
    role: str = "member"


class MemberResponse(BaseModel):
    id: int
    role: str
    user: UserResponse
    created_at: datetime

    model_config = {"from_attributes": True}
