from fastapi import APIRouter, Depends, status, Query, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal
from app.database.database import get_db
from app.schemas.schemas import Product, ProductCreate, ProductFilter, Category, CategoryCreate, CategoryBase
from app.services.product_service import ProductService
from app.core.security import get_current_admin_user
from app.models.models import User, Category as CategoryModel

router = APIRouter(prefix="/api", tags=["products"])


# Category Routes
@router.get("/categories", response_model=list[Category])
async def get_categories(db: Session = Depends(get_db)):
    """Get all categories."""
    categories = db.query(CategoryModel).all()
    return categories


@router.get("/categories/{category_id}", response_model=Category)
async def get_category(category_id: int, db: Session = Depends(get_db)):
    """Get category by ID."""
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        return {"detail": "Category not found"}, 404
    return category


@router.post("/categories", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new category (admin only)."""
    db_category = CategoryModel(
        name=category_data.name,
        description=category_data.description,
        image_url=category_data.image_url
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/categories/{category_id}", response_model=Category)
async def update_category(
    category_id: int,
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a category (admin only)."""
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        return {"detail": "Category not found"}, 404
    
    category.name = category_data.name
    category.description = category_data.description
    category.image_url = category_data.image_url
    
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a category (admin only)."""
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        return {"detail": "Category not found"}, 404
    
    db.delete(category)
    db.commit()


# Product Routes
@router.get("/products")
async def get_products(
    category_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[Decimal] = Query(None),
    max_price: Optional[Decimal] = Query(None),
    min_rating: Optional[float] = Query(None),
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc"),
    skip: int = Query(0),
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    """Get all products with filtering and sorting."""
    # If category name is provided, convert it to category_id
    if category and not category_id:
        cat = db.query(CategoryModel).filter(CategoryModel.name == category).first()
        if cat:
            category_id = cat.id
    
    filter_data = ProductFilter(
        category_id=category_id,
        search=search,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit
    )
    
    products, total = ProductService.get_products(filter_data, db)
    
    # Convert ORM objects to dictionaries for JSON response
    products_data = [
        {
            "id": p.id,
            "category_id": p.category_id,
            "category_name": p.category.name if p.category else None,
            "name": p.name,
            "description": p.description,
            "price": str(p.price),
            "discount_percentage": p.discount_percentage,
            "discount_price": str(p.discount_price) if p.discount_price else None,
            "image_url": p.image_url,
            "stock": p.stock,
            "rating": p.rating,
            "review_count": p.review_count,
            "created_at": p.created_at.isoformat() if hasattr(p.created_at, 'isoformat') else str(p.created_at)
        }
        for p in products
    ]
    
    return {
        "items": products_data,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/products/{product_id}")
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get product by ID."""
    product = ProductService.get_product_by_id(product_id, db)
    
    # Convert ORM object to dictionary for JSON response
    product_data = {
        "id": product.id,
        "category_id": product.category_id,
        "category_name": product.category.name if product.category else None,
        "name": product.name,
        "description": product.description,
        "price": str(product.price),
        "discount_percentage": product.discount_percentage,
        "discount_price": str(product.discount_price) if product.discount_price else None,
        "image_url": product.image_url,
        "stock": product.stock,
        "rating": product.rating,
        "review_count": product.review_count,
        "created_at": product.created_at.isoformat() if hasattr(product.created_at, 'isoformat') else str(product.created_at)
    }
    
    return product_data


@router.post("/products", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new product (admin only)."""
    product = ProductService.create_product(product_data, db)
    return product


@router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    product_data: ProductCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a product (admin only)."""
    product = ProductService.update_product(product_id, product_data, db)
    return product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a product (admin only)."""
    ProductService.delete_product(product_id, db)


@router.get("/products/{product_id}/related", response_model=list[Product])
async def get_related_products(
    product_id: int,
    limit: int = Query(5),
    db: Session = Depends(get_db)
):
    """Get related products from the same category."""
    products = ProductService.get_related_products(product_id, db, limit)
    return products
