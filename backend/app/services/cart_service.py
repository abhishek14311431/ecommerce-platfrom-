from sqlalchemy.orm import Session
from app.models.models import Cart, CartItem, Product, User
from app.schemas.schemas import CartItemCreate
from fastapi import HTTPException, status
from decimal import Decimal


class CartService:
    @staticmethod
    def get_or_create_cart(user_id: int, db: Session) -> Cart:
        """Get or create cart for user."""
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        
        if not cart:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        
        return cart
    
    @staticmethod
    def add_to_cart(user_id: int, item_data: CartItemCreate, db: Session) -> CartItem:
        """Add item to cart."""
        # Get cart
        cart = CartService.get_or_create_cart(user_id, db)
        
        # Check if product exists
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Check stock
        if item_data.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} items available"
            )
        
        # Check if item already in cart
        existing_item = db.query(CartItem).filter(
            (CartItem.cart_id == cart.id) & 
            (CartItem.product_id == item_data.product_id)
        ).first()
        
        if existing_item:
            existing_item.quantity += item_data.quantity
            if existing_item.quantity > product.stock:
                existing_item.quantity = product.stock
            db.commit()
            db.refresh(existing_item)
            return existing_item
        
        # Create new cart item
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)
        
        return cart_item
    
    @staticmethod
    def update_cart_item(cart_item_id: int, quantity: int, db: Session) -> CartItem:
        """Update cart item quantity."""
        cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        # Check stock
        product = cart_item.product
        if quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {product.stock} items available"
            )
        
        if quantity <= 0:
            db.delete(cart_item)
            db.commit()
            return None
        
        cart_item.quantity = quantity
        db.commit()
        db.refresh(cart_item)
        
        return cart_item
    
    @staticmethod
    def remove_from_cart(cart_item_id: int, db: Session) -> None:
        """Remove item from cart."""
        cart_item = db.query(CartItem).filter(CartItem.id == cart_item_id).first()
        
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found"
            )
        
        db.delete(cart_item)
        db.commit()
    
    @staticmethod
    def get_cart(user_id: int, db: Session) -> Cart:
        """Get user's cart."""
        cart = CartService.get_or_create_cart(user_id, db)
        return cart
    
    @staticmethod
    def clear_cart(user_id: int, db: Session) -> None:
        """Clear user's cart."""
        cart = CartService.get_or_create_cart(user_id, db)
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
    
    @staticmethod
    def get_cart_totals(user_id: int, db: Session) -> dict:
        """Calculate cart totals."""
        cart = CartService.get_or_create_cart(user_id, db)
        
        items = cart.items
        subtotal = Decimal(0)
        
        for item in items:
            price = item.product.discount_price or item.product.price
            subtotal += price * item.quantity
        
        # Shipping cost (free for orders over $100)
        shipping_cost = Decimal(0) if subtotal >= Decimal(100) else Decimal(9.99)
        
        # Tax (10%)
        tax = (subtotal + shipping_cost) * Decimal(0.1)
        
        total = subtotal + shipping_cost + tax
        
        return {
            "subtotal": subtotal,
            "shipping_cost": shipping_cost,
            "tax": tax,
            "total": total
        }
