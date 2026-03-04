from sqlalchemy.orm import Session
from app.models.models import Review, WishlistItem, Product
from app.schemas.schemas import ReviewCreate
from app.services.product_service import ProductService
from fastapi import HTTPException, status


class ReviewService:
    @staticmethod
    def create_review(user_id: int, review_data: ReviewCreate, db: Session) -> Review:
        """Create a review for a product."""
        # Check if product exists
        product = ProductService.get_product_by_id(review_data.product_id, db)
        
        # Check if user already reviewed this product
        existing_review = db.query(Review).filter(
            (Review.user_id == user_id) &
            (Review.product_id == review_data.product_id)
        ).first()
        
        if existing_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reviewed this product"
            )
        
        review = Review(
            product_id=review_data.product_id,
            user_id=user_id,
            rating=review_data.rating,
            title=review_data.title,
            comment=review_data.comment
        )
        
        db.add(review)
        db.commit()
        db.refresh(review)
        
        # Update product rating
        ProductService.update_product_rating(review_data.product_id, db)
        
        return review
    
    @staticmethod
    def get_product_reviews(product_id: int, db: Session, skip: int = 0, limit: int = 10) -> tuple[list[Review], int]:
        """Get reviews for a product."""
        # Check if product exists
        ProductService.get_product_by_id(product_id, db)
        
        query = db.query(Review).filter(Review.product_id == product_id)
        total = query.count()
        
        reviews = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
        return reviews, total
    
    @staticmethod
    def update_review(review_id: int, review_data: ReviewCreate, user_id: int, db: Session) -> Review:
        """Update a review."""
        review = db.query(Review).filter(Review.id == review_id).first()
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        if review.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update your own reviews"
            )
        
        review.rating = review_data.rating
        review.title = review_data.title
        review.comment = review_data.comment
        
        db.commit()
        db.refresh(review)
        
        # Update product rating
        ProductService.update_product_rating(review.product_id, db)
        
        return review
    
    @staticmethod
    def delete_review(review_id: int, user_id: int, db: Session) -> None:
        """Delete a review."""
        review = db.query(Review).filter(Review.id == review_id).first()
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )
        
        if review.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own reviews"
            )
        
        product_id = review.product_id
        db.delete(review)
        db.commit()
        
        # Update product rating
        ProductService.update_product_rating(product_id, db)


class WishlistService:
    @staticmethod
    def add_to_wishlist(user_id: int, product_id: int, db: Session) -> WishlistItem:
        """Add product to wishlist."""
        # Check if product exists
        ProductService.get_product_by_id(product_id, db)
        
        # Check if already in wishlist
        existing = db.query(WishlistItem).filter(
            (WishlistItem.user_id == user_id) &
            (WishlistItem.product_id == product_id)
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product already in wishlist"
            )
        
        wishlist_item = WishlistItem(
            user_id=user_id,
            product_id=product_id
        )
        
        db.add(wishlist_item)
        db.commit()
        db.refresh(wishlist_item)
        
        return wishlist_item
    
    @staticmethod
    def remove_from_wishlist(user_id: int, product_id: int, db: Session) -> None:
        """Remove product from wishlist."""
        wishlist_item = db.query(WishlistItem).filter(
            (WishlistItem.user_id == user_id) &
            (WishlistItem.product_id == product_id)
        ).first()
        
        if not wishlist_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not in wishlist"
            )
        
        db.delete(wishlist_item)
        db.commit()
    
    @staticmethod
    def get_wishlist(user_id: int, db: Session, skip: int = 0, limit: int = 20) -> tuple[list[WishlistItem], int]:
        """Get user's wishlist."""
        query = db.query(WishlistItem).filter(WishlistItem.user_id == user_id)
        total = query.count()
        
        items = query.order_by(WishlistItem.created_at.desc()).offset(skip).limit(limit).all()
        return items, total
    
    @staticmethod
    def is_in_wishlist(user_id: int, product_id: int, db: Session) -> bool:
        """Check if product is in wishlist."""
        item = db.query(WishlistItem).filter(
            (WishlistItem.user_id == user_id) &
            (WishlistItem.product_id == product_id)
        ).first()
        
        return item is not None
