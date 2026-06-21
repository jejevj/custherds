"""
Endpoint Template — copy file ini saat membuat endpoint baru.

Cara pakai:
1. Copy file ini ke endpoints/<resource>.py
2. Ganti semua `Item` dengan nama resource kamu
3. Uncomment router di app/api/v1/router.py
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.core.response import (
    resp_ok,
    resp_created,
    resp_no_content,
    resp_not_found,
    resp_conflict,
    resp_bad_request,
    resp_unauthorized,
    resp_forbidden,
    resp_server_error,
)

router = APIRouter()


# -----------------------------------------------------------------------
# GET /items — List all
# -----------------------------------------------------------------------
@router.get("/")
def list_items(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    # items = db.query(Item).offset(skip).limit(limit).all()
    items = []  # replace with actual query
    return resp_ok(
        data=[],          # replace with serialized items
        message="Items retrieved successfully",
        meta={"skip": skip, "limit": limit, "total": len(items)},
    )


# -----------------------------------------------------------------------
# GET /items/{id} — Get single
# -----------------------------------------------------------------------
@router.get("/{item_id}")
def get_item(item_id: int, db: Session = Depends(get_db)):
    # item = db.query(Item).filter(Item.id == item_id).first()
    item = None  # replace with actual query
    if not item:
        return resp_not_found(f"Item {item_id} not found")
    return resp_ok(data=item, message="Item retrieved successfully")


# -----------------------------------------------------------------------
# POST /items — Create
# -----------------------------------------------------------------------
@router.post("/", status_code=201)
def create_item(db: Session = Depends(get_db)):
    # Check duplicate
    # existing = db.query(Item).filter(Item.name == payload.name).first()
    # if existing:
    #     return resp_conflict("Item already exists")

    # item = Item(**payload.model_dump())
    # db.add(item)
    # db.commit()
    # db.refresh(item)
    return resp_created(data={}, message="Item created successfully")


# -----------------------------------------------------------------------
# PUT /items/{id} — Update
# -----------------------------------------------------------------------
@router.put("/{item_id}")
def update_item(item_id: int, db: Session = Depends(get_db)):
    # item = db.query(Item).filter(Item.id == item_id).first()
    item = None  # replace
    if not item:
        return resp_not_found(f"Item {item_id} not found")

    # for field, value in payload.model_dump(exclude_unset=True).items():
    #     setattr(item, field, value)
    # db.commit()
    # db.refresh(item)
    return resp_ok(data=item, message="Item updated successfully")


# -----------------------------------------------------------------------
# DELETE /items/{id} — Delete
# -----------------------------------------------------------------------
@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    # item = db.query(Item).filter(Item.id == item_id).first()
    item = None  # replace
    if not item:
        return resp_not_found(f"Item {item_id} not found")

    # db.delete(item)
    # db.commit()
    return resp_no_content()


# -----------------------------------------------------------------------
# Status Code Reference — gunakan helper di bawah sesuai kebutuhan
# -----------------------------------------------------------------------
# resp_ok(data, message, meta)          → 200
# resp_created(data, message)           → 201
# resp_no_content()                     → 204
# resp_bad_request(message, errors)     → 400
# resp_unauthorized(message)            → 401
# resp_forbidden(message)               → 403
# resp_not_found(message)               → 404
# resp_conflict(message, errors)        → 409
# resp_unprocessable(message, errors)   → 422
# resp_server_error(message)            → 500
