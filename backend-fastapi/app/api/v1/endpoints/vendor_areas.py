from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.db.session import get_db
from app.models.vendor_area import (
    VendorAreaKabupaten,
    VendorAreaKecamatan,
    VendorAreaKelurahan,
)
from app.schemas.vendor_area import (
    VendorAreaKabupatenCreate,
    VendorAreaKabupatenUpdate,
    VendorAreaKabupatenOut,
    VendorAreaKabupatenWithKecamatanOut,
    VendorAreaKecamatanCreate,
    VendorAreaKecamatanUpdate,
    VendorAreaKecamatanOut,
    VendorAreaKecamatanOutFlat,
    VendorAreaKelurahanCreate,
    VendorAreaKelurahanUpdate,
    VendorAreaKelurahanOut,
)
from app.core.deps import get_current_superadmin

router = APIRouter()


# ===========================================================================
# KABUPATEN / KOTA
# ===========================================================================

@router.get(
    "/kabupaten",
    response_model=List[VendorAreaKabupatenOut],
    summary="List semua kabupaten/kota",
)
def list_kabupaten(
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(VendorAreaKabupaten)
    if is_active is not None:
        q = q.filter(VendorAreaKabupaten.is_active == is_active)
    return q.order_by(VendorAreaKabupaten.sort_order, VendorAreaKabupaten.id).all()


@router.get(
    "/kabupaten/{kabupaten_id}",
    response_model=VendorAreaKabupatenWithKecamatanOut,
    summary="Detail kabupaten beserta kecamatan & kelurahan",
)
def get_kabupaten(
    kabupaten_id: int,
    db: Session = Depends(get_db),
):
    kab = (
        db.query(VendorAreaKabupaten)
        .options(
            joinedload(VendorAreaKabupaten.kecamatans)
            .joinedload(VendorAreaKecamatan.kelurahans)
        )
        .filter(VendorAreaKabupaten.id == kabupaten_id)
        .first()
    )
    if not kab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kabupaten tidak ditemukan")
    return kab


@router.post(
    "/kabupaten",
    response_model=VendorAreaKabupatenOut,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Tambah kabupaten/kota baru",
)
def create_kabupaten(
    payload: VendorAreaKabupatenCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    existing = db.query(VendorAreaKabupaten).filter(VendorAreaKabupaten.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nama kabupaten/kota sudah ada")
    kab = VendorAreaKabupaten(**payload.model_dump())
    db.add(kab)
    db.commit()
    db.refresh(kab)
    return kab


@router.patch(
    "/kabupaten/{kabupaten_id}",
    response_model=VendorAreaKabupatenOut,
    summary="[Admin] Update kabupaten/kota",
)
def update_kabupaten(
    kabupaten_id: int,
    payload: VendorAreaKabupatenUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    kab = db.query(VendorAreaKabupaten).filter(VendorAreaKabupaten.id == kabupaten_id).first()
    if not kab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kabupaten tidak ditemukan")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        conflict = (
            db.query(VendorAreaKabupaten)
            .filter(VendorAreaKabupaten.name == data["name"], VendorAreaKabupaten.id != kabupaten_id)
            .first()
        )
        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nama kabupaten/kota sudah dipakai")
    for key, val in data.items():
        setattr(kab, key, val)
    db.commit()
    db.refresh(kab)
    return kab


@router.delete(
    "/kabupaten/{kabupaten_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Hapus kabupaten/kota (cascade ke kecamatan & kelurahan)",
)
def delete_kabupaten(
    kabupaten_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    kab = db.query(VendorAreaKabupaten).filter(VendorAreaKabupaten.id == kabupaten_id).first()
    if not kab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kabupaten tidak ditemukan")
    db.delete(kab)
    db.commit()


# ===========================================================================
# KECAMATAN
# ===========================================================================

@router.get(
    "/kecamatan",
    response_model=List[VendorAreaKecamatanOutFlat],
    summary="List kecamatan (opsional filter by kabupaten_id)",
)
def list_kecamatan(
    kabupaten_id: Optional[int]  = Query(None),
    is_active:    Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(VendorAreaKecamatan)
    if kabupaten_id is not None:
        q = q.filter(VendorAreaKecamatan.kabupaten_id == kabupaten_id)
    if is_active is not None:
        q = q.filter(VendorAreaKecamatan.is_active == is_active)
    return q.order_by(VendorAreaKecamatan.sort_order, VendorAreaKecamatan.id).all()


@router.get(
    "/kecamatan/{kecamatan_id}",
    response_model=VendorAreaKecamatanOut,
    summary="Detail kecamatan beserta kelurahan",
)
def get_kecamatan(
    kecamatan_id: int,
    db: Session = Depends(get_db),
):
    kec = (
        db.query(VendorAreaKecamatan)
        .options(joinedload(VendorAreaKecamatan.kelurahans))
        .filter(VendorAreaKecamatan.id == kecamatan_id)
        .first()
    )
    if not kec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kecamatan tidak ditemukan")
    return kec


@router.post(
    "/kecamatan",
    response_model=VendorAreaKecamatanOutFlat,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Tambah kecamatan baru",
)
def create_kecamatan(
    payload: VendorAreaKecamatanCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    # validasi kabupaten_id ada
    kab = db.query(VendorAreaKabupaten).filter(VendorAreaKabupaten.id == payload.kabupaten_id).first()
    if not kab:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kabupaten tidak ditemukan")
    # nama unik per kabupaten
    existing = (
        db.query(VendorAreaKecamatan)
        .filter(
            VendorAreaKecamatan.kabupaten_id == payload.kabupaten_id,
            VendorAreaKecamatan.name == payload.name,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nama kecamatan sudah ada di kabupaten ini")
    kec = VendorAreaKecamatan(**payload.model_dump())
    db.add(kec)
    db.commit()
    db.refresh(kec)
    return kec


@router.patch(
    "/kecamatan/{kecamatan_id}",
    response_model=VendorAreaKecamatanOutFlat,
    summary="[Admin] Update kecamatan",
)
def update_kecamatan(
    kecamatan_id: int,
    payload: VendorAreaKecamatanUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    kec = db.query(VendorAreaKecamatan).filter(VendorAreaKecamatan.id == kecamatan_id).first()
    if not kec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kecamatan tidak ditemukan")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        conflict = (
            db.query(VendorAreaKecamatan)
            .filter(
                VendorAreaKecamatan.kabupaten_id == kec.kabupaten_id,
                VendorAreaKecamatan.name == data["name"],
                VendorAreaKecamatan.id != kecamatan_id,
            )
            .first()
        )
        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nama kecamatan sudah dipakai di kabupaten ini")
    for key, val in data.items():
        setattr(kec, key, val)
    db.commit()
    db.refresh(kec)
    return kec


@router.delete(
    "/kecamatan/{kecamatan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Hapus kecamatan (cascade ke kelurahan)",
)
def delete_kecamatan(
    kecamatan_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    kec = db.query(VendorAreaKecamatan).filter(VendorAreaKecamatan.id == kecamatan_id).first()
    if not kec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kecamatan tidak ditemukan")
    db.delete(kec)
    db.commit()


# ===========================================================================
# KELURAHAN / DESA
# ===========================================================================

@router.get(
    "/kelurahan",
    response_model=List[VendorAreaKelurahanOut],
    summary="List kelurahan (opsional filter by kecamatan_id)",
)
def list_kelurahan(
    kecamatan_id: Optional[int]  = Query(None),
    is_active:    Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(VendorAreaKelurahan)
    if kecamatan_id is not None:
        q = q.filter(VendorAreaKelurahan.kecamatan_id == kecamatan_id)
    if is_active is not None:
        q = q.filter(VendorAreaKelurahan.is_active == is_active)
    return q.order_by(VendorAreaKelurahan.sort_order, VendorAreaKelurahan.id).all()


@router.get(
    "/kelurahan/{kelurahan_id}",
    response_model=VendorAreaKelurahanOut,
    summary="Detail satu kelurahan",
)
def get_kelurahan(
    kelurahan_id: int,
    db: Session = Depends(get_db),
):
    kel = db.query(VendorAreaKelurahan).filter(VendorAreaKelurahan.id == kelurahan_id).first()
    if not kel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kelurahan tidak ditemukan")
    return kel


@router.post(
    "/kelurahan",
    response_model=VendorAreaKelurahanOut,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Tambah kelurahan baru",
)
def create_kelurahan(
    payload: VendorAreaKelurahanCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    kec = db.query(VendorAreaKecamatan).filter(VendorAreaKecamatan.id == payload.kecamatan_id).first()
    if not kec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kecamatan tidak ditemukan")
    existing = (
        db.query(VendorAreaKelurahan)
        .filter(
            VendorAreaKelurahan.kecamatan_id == payload.kecamatan_id,
            VendorAreaKelurahan.name == payload.name,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nama kelurahan sudah ada di kecamatan ini")
    kel = VendorAreaKelurahan(**payload.model_dump())
    db.add(kel)
    db.commit()
    db.refresh(kel)
    return kel


@router.patch(
    "/kelurahan/{kelurahan_id}",
    response_model=VendorAreaKelurahanOut,
    summary="[Admin] Update kelurahan",
)
def update_kelurahan(
    kelurahan_id: int,
    payload: VendorAreaKelurahanUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    kel = db.query(VendorAreaKelurahan).filter(VendorAreaKelurahan.id == kelurahan_id).first()
    if not kel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kelurahan tidak ditemukan")
    data = payload.model_dump(exclude_unset=True)
    if "name" in data:
        conflict = (
            db.query(VendorAreaKelurahan)
            .filter(
                VendorAreaKelurahan.kecamatan_id == kel.kecamatan_id,
                VendorAreaKelurahan.name == data["name"],
                VendorAreaKelurahan.id != kelurahan_id,
            )
            .first()
        )
        if conflict:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Nama kelurahan sudah dipakai di kecamatan ini")
    for key, val in data.items():
        setattr(kel, key, val)
    db.commit()
    db.refresh(kel)
    return kel


@router.delete(
    "/kelurahan/{kelurahan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Hapus kelurahan",
)
def delete_kelurahan(
    kelurahan_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_superadmin),
):
    kel = db.query(VendorAreaKelurahan).filter(VendorAreaKelurahan.id == kelurahan_id).first()
    if not kel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kelurahan tidak ditemukan")
    db.delete(kel)
    db.commit()
