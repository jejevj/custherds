from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.deps import get_db, require_role
from app.models.destination import Destination
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[dict])
def list_destinations(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Destination)
    if category:
        q = q.filter(Destination.category == category)
    return q.offset(skip).limit(limit).all()


@router.get("/{destination_id}")
def get_destination(destination_id: int, db: Session = Depends(get_db)):
    dest = db.query(Destination).filter(Destination.id == destination_id).first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return dest


@router.post("/", status_code=201, dependencies=[Depends(require_role("admin"))])
def create_destination(payload: dict, db: Session = Depends(get_db)):
    dest = Destination(**payload)
    db.add(dest)
    db.commit()
    db.refresh(dest)
    return dest
