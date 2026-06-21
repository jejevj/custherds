from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.order import OrderStatus


class OrderCreate(BaseModel):
    product_id: int
    quantity: int = 1
    notes: Optional[str] = None


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    tourist_id: int
    product_id: int
    quantity: int
    total_price: float
    status: OrderStatus
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
