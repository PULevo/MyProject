from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud.organization import create_organization, get_user_organizations
from app.db.session import get_db
from app.models.user import User
from app.schemas.organization import MembershipResponse, OrganizationCreate, OrganizationResponse

router = APIRouter(prefix="/orgs", tags=["organizations"])


@router.post("", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_org(
    org_in: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_organization(db, org_in, current_user.id)


@router.get("", response_model=list[MembershipResponse])
def list_orgs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_organizations(db, current_user.id)
