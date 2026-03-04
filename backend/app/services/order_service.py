from sqlalchemy.orm import Session
from app.models.models import Order, OrderItem, Cart, CartItem, Product, User, OrderStatus
from app.schemas.schemas import Order as OrderSchema
from app.services.cart_service import CartService
from fastapi import HTTPException, status
from datetime import datetime
from decimal import Decimal
import random
import string


class OrderService:
    @staticmethod
    def generate_order_number() -> str:
        """Generate unique order number."""
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        return f"ORD-{timestamp}-{random_suffix}"
    
    @staticmethod
    def create_order(user_id: int, shipping_address: str, db: Session) -> Order:
        """Create order from cart."""
        # Get user's cart
        cart = CartService.get_or_create_cart(user_id, db)
        
        if not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )
        
        # Calculate totals
        subtotal = Decimal(0)
        order_items_data = []
        
        for item in cart.items:
            product = item.product
            price = product.discount_price or product.price
            item_total = price * item.quantity
            subtotal += item_total
            
            order_items_data.append({
                "product_id": product.id,
                "quantity": item.quantity,
                "price": price
            })
            
            # Reduce stock
            product.stock -= item.quantity
        
        # Calculate shipping and tax
        shipping_cost = Decimal(0) if subtotal >= Decimal(100) else Decimal(9.99)
        tax = (subtotal + shipping_cost) * Decimal(0.1)
        total = subtotal + shipping_cost + tax
        
        # Create order
        order = Order(
            user_id=user_id,
            order_number=OrderService.generate_order_number(),
            shipping_address=shipping_address,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total=total,
            status=OrderStatus.PENDING
        )
        
        db.add(order)
        db.flush()
        
        # Add order items
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data["product_id"],
                quantity=item_data["quantity"],
                price=item_data["price"]
            )
            db.add(order_item)
        
        db.commit()
        db.refresh(order)
        
        # Clear cart
        CartService.clear_cart(user_id, db)
        
        return order
    
    @staticmethod
    def get_order_by_id(order_id: int, db: Session) -> Order:
        """Get order by ID."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        return order
    
    @staticmethod
    def get_order_by_number(order_number: str, db: Session) -> Order:
        """Get order by order number."""
        order = db.query(Order).filter(Order.order_number == order_number).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        return order
    
    @staticmethod
    def get_user_orders(user_id: int, db: Session, skip: int = 0, limit: int = 10) -> tuple[list[Order], int]:
        """Get all orders for a user."""
        query = db.query(Order).filter(Order.user_id == user_id)
        total = query.count()
        
        orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
        return orders, total
    
    @staticmethod
    def update_order_status(order_id: int, status: OrderStatus, db: Session) -> Order:
        """Update order status."""
        order = OrderService.get_order_by_id(order_id, db)
        order.status = status
        db.commit()
        db.refresh(order)
        return order
    
    @staticmethod
    def update_payment_status(order_id: int, status: str, db: Session) -> Order:
        """Update payment status."""
        order = OrderService.get_order_by_id(order_id, db)
        order.payment_status = status
        
        # Update order status based on payment
        if status == "completed":
            order.status = OrderStatus.CONFIRMED
        
        db.commit()
        db.refresh(order)
        return order
    
    @staticmethod
    def cancel_order(order_id: int, db: Session) -> Order:
        """Cancel an order."""
        order = OrderService.get_order_by_id(order_id, db)
        
        if order.status in [OrderStatus.SHIPPED, OrderStatus.DELIVERED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel shipped or delivered orders"
            )
        
        # Return items to stock
        for item in order.items:
            item.product.stock += item.quantity
        
        order.status = OrderStatus.CANCELLED
        db.commit()
        db.refresh(order)
        return order
    
    @staticmethod
    def get_all_orders(db: Session, skip: int = 0, limit: int = 10) -> tuple[list[Order], int]:
        """Get all orders (admin)."""
        query = db.query(Order)
        total = query.count()
        
        orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
        return orders, total
