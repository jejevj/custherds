from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.vendor_category import VendorCategory
from app.schemas.vendor_category import (
    VendorCategoryCreate,
    VendorCategoryUpdate,
    VendorCategoryOut,
)
from app.core.deps import get_current_superadmin

router = APIRouter()


# ---------------------------------------------------------------------------
# PUBLIC — siapapun bisa baca daftar kategori (dipakai form registrasi vendor)
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[VendorCategoryOut], summary="List semua kategori vendor")
def list_vendor_categories(
    group_name: Optional[str] = Query(None, description="Filter berdasarkan grup"),
    is_active:  Optional[bool] = Query(None, description="Filter berdasarkan status aktif"),
    db: Session = Depends(get_db),
):
    """Kembalikan semua kategori vendor, diurutkan berdasarkan sort_order."""
    q = db.query(VendorCategory)
    if group_name is not None:
        q = q.filter(VendorCategory.group_name == group_name)
    if is_active is not None:
        q = q.filter(VendorCategory.is_active == is_active)
    return q.order_by(VendorCategory.sort_order, VendorCategory.id).all()


@router.get("/{category_id}", response_model=VendorCategoryOut, summary="Detail satu kategori")
def get_vendor_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    cat = db.query(VendorCategory).filter(VendorCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kategori tidak ditemukan")
    return cat


# ---------------------------------------------------------------------------
# ADMIN ONLY — create / update / delete
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=VendorCategoryOut,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Tambah kategori baru",
)
def create_vendor_category(
    payload: VendorCategoryCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    existing = db.query(VendorCategory).filter(VendorCategory.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nama kategori sudah ada")
    cat = VendorCategory(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.patch(
    "/{category_id}",
    response_model=VendorCategoryOut,
    summary="[Admin] Update kategori",
)
def update_vendor_category(
    category_id: int,
    payload: VendorCategoryUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    cat = db.query(VendorCategory).filter(VendorCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kategori tidak ditemukan")

    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        conflict = (
            db.query(VendorCategory)
            .filter(VendorCategory.name == data["name"], VendorCategory.id != category_id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nama kategori sudah dipakai")

    for key, val in data.items():
        setattr(cat, key, val)

    db.commit()
    db.refresh(cat)
    return cat


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Hapus kategori",
)
def delete_vendor_category(
    category_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    cat = db.query(VendorCategory).filter(VendorCategory.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kategori tidak ditemukan")
    db.delete(cat)
    db.commit()
