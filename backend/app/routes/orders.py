from fastapi import APIRouter, Depends, status, Query, Body, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import Order, ReturnExchangeCreate, ReturnExchangeResponse
from app.services.order_service import OrderService
from app.services.payment_service import PaymentService
from app.core.security import get_current_user, get_current_admin_user
from app.models.models import User, OrderStatus, ReturnExchange
from typing import List

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create order from cart."""
    shipping_address = payload.get("shipping_address")
    if not shipping_address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="shipping_address is required"
        )
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
    print(f"📦 [API] Fetching orders for user: {current_user.username} (ID: {current_user.id})")
    orders, total = OrderService.get_user_orders(current_user.id, db, skip, limit)
    print(f"📦 [API] Found {total} orders for user {current_user.id}")
    print(f"📦 [API] Returning {len(orders)} orders in this batch")
    # Convert SQLAlchemy models to Pydantic schemas
    orders_list = [Order.model_validate(order) for order in orders]
    
    return {
        "items": orders_list
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

# Return and Exchange Routes
@router.post("/{order_id}/return-exchange", response_model=ReturnExchangeResponse, status_code=status.HTTP_201_CREATED)
async def create_return_exchange(
    order_id: int,
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a return or exchange request."""
    order = OrderService.get_order_by_id(order_id, db)
    
    # Check if user owns the order
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Check if order is delivered
    if order.status.value != "delivered":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only return/exchange delivered orders")
    
    request_type = payload.get("request_type")
    reason = payload.get("reason")
    order_item_id = payload.get("order_item_id")
    
    if not request_type or not reason or not order_item_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing required fields")
    
    if request_type not in ["return", "exchange"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request type")
    
    return_exchange = ReturnExchange(
        order_id=order_id,
        user_id=current_user.id,
        order_item_id=order_item_id,
        request_type=request_type,
        reason=reason,
        status="pending"
    )
    
    db.add(return_exchange)
    db.commit()
    db.refresh(return_exchange)
    
    return return_exchange


@router.get("/{order_id}/return-exchange", response_model=list[ReturnExchangeResponse])
async def get_order_returns_exchanges(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all return/exchange requests for an order."""
    order = OrderService.get_order_by_id(order_id, db)
    
    # Check if user owns the order
    if order.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return_exchanges = db.query(ReturnExchange).filter(ReturnExchange.order_id == order_id).all()
    return return_exchanges