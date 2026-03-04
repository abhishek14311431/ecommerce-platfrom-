from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import Review, ReviewCreate, WishlistItem
from app.services.review_service import ReviewService, WishlistService
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api", tags=["reviews", "wishlist"])


# Review Routes
@router.get("/products/{product_id}/reviews", response_model=dict)
async def get_product_reviews(
    product_id: int,
    skip: int = Query(0),
    limit: int = Query(10),
    db: Session = Depends(get_db)
):
    """Get reviews for a product."""
    reviews, total = ReviewService.get_product_reviews(product_id, db, skip, limit)
    
    return {
        "items": reviews,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/reviews", response_model=Review, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a review for a product."""
    review = ReviewService.create_review(current_user.id, review_data, db)
    return review


@router.put("/reviews/{review_id}", response_model=Review)
async def update_review(
    review_id: int,
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a review."""
    review = ReviewService.update_review(review_id, review_data, current_user.id, db)
    return review


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a review."""
    ReviewService.delete_review(review_id, current_user.id, db)


# Wishlist Routes
@router.get("/wishlist", response_model=dict)
async def get_wishlist(
    skip: int = Query(0),
    limit: int = Query(20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's wishlist."""
    items, total = WishlistService.get_wishlist(current_user.id, db, skip, limit)
    
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/wishlist/{product_id}", response_model=WishlistItem, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add product to wishlist."""
    item = WishlistService.add_to_wishlist(current_user.id, product_id, db)
    return item


@router.delete("/wishlist/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove product from wishlist."""
    WishlistService.remove_from_wishlist(current_user.id, product_id, db)


@router.get("/wishlist/{product_id}/check")
async def check_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if product is in wishlist."""
    is_in_wishlist = WishlistService.is_in_wishlist(current_user.id, product_id, db)
    return {"in_wishlist": is_in_wishlist}
