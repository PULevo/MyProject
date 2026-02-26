from sqlalchemy.orm import Session, joinedload

from app.models.organization import Membership, Organization
from app.schemas.organization import OrganizationCreate


def create_organization(db: Session, org_in: OrganizationCreate, user_id: int) -> Organization:
    org = Organization(name=org_in.name)
    db.add(org)
    db.flush()  # saadaan org.id ennen commitia

    membership = Membership(user_id=user_id, organization_id=org.id, role="admin")
    db.add(membership)
    db.commit()
    db.refresh(org)
    return org


def get_user_organizations(db: Session, user_id: int) -> list[Membership]:
    return (
        db.query(Membership)
        .filter(Membership.user_id == user_id)
        .options(joinedload(Membership.organization))
        .all()
    )

def get_org_members(db: Session, org_id: int) -> list[Membership]:
    return db.query(Membership).filter(Membership.organization_id == org_id).all()


def add_member(db: Session, org_id: int, user_id: int, role: str) -> Membership:
    membership = Membership(user_id=user_id, organization_id=org_id, role=role)
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


def remove_member(db: Session, membership: Membership) -> None:
    db.delete(membership)
    db.commit()
