from fastapi import APIRouter, Depends, UploadFile, File, status, HTTPException
from sqlalchemy.orm import Session
import os
from app.database.database import get_db
from app.schemas.schemas import Product
from app.services.product_service import ProductService
from app.core.security import get_current_admin_user
from app.models.models import User

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Temporary upload directory (in production, use AWS S3 or Cloudinary)
UPLOAD_DIR = "uploads/products"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)


@router.post("/upload/image", response_model=dict)
async def upload_product_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin_user)
):
    """Upload product image. In production, use AWS S3 or Cloudinary."""
    try:
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be JPEG, PNG, or WEBP"
            )
        
        # Create filename
        filename = f"{file.filename}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)
        
        # Return image URL
        image_url = f"/uploads/products/{filename}"
        
        return {
            "filename": filename,
            "url": image_url,
            "size": len(contents)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File upload failed: {str(e)}"
        )


@router.post("/products/{product_id}/image", response_model=Product)
async def update_product_image(
    product_id: int,
    image_url: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update product image URL."""
    product = ProductService.update_product_image(product_id, image_url, db)
    return product


@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics."""
    from app.models.models import Product, Order, User as UserModel, Payment
    
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_users = db.query(UserModel).count()
    total_revenue = db.query(Payment).filter(Payment.status == "completed").count()
    
    # Recent orders
    from sqlalchemy import desc
    recent_orders = db.query(Order).order_by(desc(Order.created_at)).limit(5).all()
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_revenue": total_revenue,
        "recent_orders": recent_orders
    }
