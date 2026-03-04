from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import CartItemCreate, CartItem, Cart
from app.services.cart_service import CartService
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("", response_model=dict)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's shopping cart."""
    cart = CartService.get_cart(current_user.id, db)
    
    # Convert to dict with items
    items = []
    for item in cart.items:
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "product": {
                "id": item.product.id,
                "name": item.product.name,
                "price": str(item.product.price),
                "discount_price": str(item.product.discount_price) if item.product.discount_price else None,
                "discount_percentage": item.product.discount_percentage,
                "image_url": item.product.image_url,
                "stock": item.product.stock,
                "rating": item.product.rating,
                "review_count": item.product.review_count,
            }
        })
    
    return {"items": items}


@router.post("/add", response_model=dict, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add item to cart."""
    cart_item = CartService.add_to_cart(current_user.id, item_data, db)
    
    return {
        "id": cart_item.id,
        "product_id": cart_item.product_id,
        "quantity": cart_item.quantity,
        "product": {
            "id": cart_item.product.id,
            "name": cart_item.product.name,
            "price": str(cart_item.product.price),
            "discount_price": str(cart_item.product.discount_price) if cart_item.product.discount_price else None,
            "discount_percentage": cart_item.product.discount_percentage,
            "image_url": cart_item.product.image_url,
            "stock": cart_item.product.stock,
            "rating": cart_item.product.rating,
            "review_count": cart_item.product.review_count,
        }
    }


@router.put("/items/{item_id}", response_model=dict)
async def update_cart_item(
    item_id: int,
    data: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update cart item quantity."""
    quantity = data.get("quantity", 1)
    cart_item = CartService.update_cart_item(item_id, quantity, db)
    
    if not cart_item:
        return {"success": True}
    
    return {
        "id": cart_item.id,
        "product_id": cart_item.product_id,
        "quantity": cart_item.quantity,
        "product": {
            "id": cart_item.product.id,
            "name": cart_item.product.name,
            "price": str(cart_item.product.price),
            "discount_price": str(cart_item.product.discount_price) if cart_item.product.discount_price else None,
            "discount_percentage": cart_item.product.discount_percentage,
            "image_url": cart_item.product.image_url,
            "stock": cart_item.product.stock,
            "rating": cart_item.product.rating,
            "review_count": cart_item.product.review_count,
        }
    }


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove item from cart."""
    CartService.remove_from_cart(item_id, db)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear shopping cart."""
    CartService.clear_cart(current_user.id, db)


@router.get("/totals", response_model=dict)
async def get_cart_totals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get cart totals (subtotal, shipping, tax, total)."""
    totals = CartService.get_cart_totals(current_user.id, db)
    return totals
