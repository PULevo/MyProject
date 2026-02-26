from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud.organization import (
    add_member,
    create_organization,
    get_membership,
    get_org_members,
    get_user_organizations,
    remove_member,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.organization import (
    MemberAddRequest,
    MemberResponse,
    MembershipResponse,
    OrganizationCreate,
    OrganizationResponse,
)

router = APIRouter(prefix="/orgs", tags=["organizations"])


def _require_admin(db: Session, user_id: int, org_id: int):
    membership = get_membership(db, user_id, org_id)
    if not membership or membership.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vaatii admin-oikeudet")
    return membership


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


@router.get("/{org_id}/members", response_model=list[MemberResponse])
def list_members(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not get_membership(db, current_user.id, org_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ei pääsyä organisaatioon")
    return get_org_members(db, org_id)


@router.post("/{org_id}/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def add_org_member(
    org_id: int,
    body: MemberAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(db, current_user.id, org_id)
    if get_membership(db, body.user_id, org_id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Käyttäjä on jo jäsen")
    return add_member(db, org_id, body.user_id, body.role)


@router.delete("/{org_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_org_member(
    org_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_admin(db, current_user.id, org_id)
    membership = get_membership(db, user_id, org_id)
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Jäsenyyttä ei löydy")
    remove_member(db, membership)
