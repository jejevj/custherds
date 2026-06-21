from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.deps import get_db, get_current_active_user, require_role
from app.models.order import Order
from app.models.tourist import Tourist
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("tourist")),
):
    tourist = db.query(Tourist).filter(Tourist.user_id == current_user.id).first()
    if not tourist:
        raise HTTPException(status_code=404, detail="Tourist profile not found")
    product = db.query(Product).filter(Product.id == payload.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    order = Order(
        tourist_id=tourist.id,
        product_id=product.id,
        quantity=payload.quantity,
        total_price=product.price * payload.quantity,
        notes=payload.notes,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/my", response_model=List[OrderResponse])
def my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    tourist = db.query(Tourist).filter(Tourist.user_id == current_user.id).first()
    if not tourist:
        return []
    return db.query(Order).filter(Order.tourist_id == tourist.id).all()


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("vendor", "admin")),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    return order
