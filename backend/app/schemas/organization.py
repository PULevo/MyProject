from datetime import datetime

from pydantic import BaseModel


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
