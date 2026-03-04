from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import Order
from app.services.order_service import OrderService
from app.services.payment_service import PaymentService
from app.core.security import get_current_user, get_current_admin_user
from app.models.models import User, OrderStatus

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    shipping_address: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create order from cart."""
    order = OrderService.create_order(current_user.id, shipping_address, db)
    return order


@router.get("", response_model=dict)
async def get_user_orders(
    skip: int = Query(0),
    limit: int = Query(10),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all orders for the current user."""
    orders, total = OrderService.get_user_orders(current_user.id, db, skip, limit)
    
    return {
        "items": orders,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get order by ID."""
    order = OrderService.get_order_by_id(order_id, db)
    
    # Check if user owns the order
    if order.user_id != current_user.id and not current_user.is_admin:
        return {"detail": "Not authorized"}, 403
    
    return order


@router.post("/{order_id}/cancel", response_model=Order)
async def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel an order."""
    order = OrderService.get_order_by_id(order_id, db)
    
    # Check if user owns the order
    if order.user_id != current_user.id and not current_user.is_admin:
        return {"detail": "Not authorized"}, 403
    
    order = OrderService.cancel_order(order_id, db)
    return order


# Admin Routes
@router.get("/admin/all", response_model=dict)
async def get_all_orders(
    skip: int = Query(0),
    limit: int = Query(10),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all orders (admin only)."""
    orders, total = OrderService.get_all_orders(db, skip, limit)
    
    return {
        "items": orders,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.put("/{order_id}/status", response_model=Order)
async def update_order_status(
    order_id: int,
    status: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update order status (admin only)."""
    # Validate status
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        return {"detail": f"Invalid status. Must be one of {valid_statuses}"}, 400
    
    order_status = OrderStatus(status)
    order = OrderService.update_order_status(order_id, order_status, db)
    return order
