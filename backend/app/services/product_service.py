from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from app.models.models import Product, Category, Review
from app.schemas.schemas import ProductCreate, ProductFilter
from fastapi import HTTPException, status
from decimal import Decimal


class ProductService:
    @staticmethod
    def get_products(filter_data: ProductFilter, db: Session) -> tuple[list[Product], int]:
        """Get products with filtering and sorting."""
        query = db.query(Product)
        
        # Apply filters
        if filter_data.category_id:
            query = query.filter(Product.category_id == filter_data.category_id)
        
        if filter_data.search:
            search_term = f"%{filter_data.search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.description.ilike(search_term)
                )
            )
        
        if filter_data.min_price is not None:
            query = query.filter(Product.price >= filter_data.min_price)
        
        if filter_data.max_price is not None:
            query = query.filter(Product.price <= filter_data.max_price)
        
        if filter_data.min_rating is not None:
            query = query.filter(Product.rating >= filter_data.min_rating)
        
        # Get total count before pagination
        total = query.count()
        
        # Apply sorting
        if filter_data.sort_by == "price":
            sort_column = Product.price
        elif filter_data.sort_by == "rating":
            sort_column = Product.rating
        elif filter_data.sort_by == "popularity":
            sort_column = Product.review_count
        else:
            sort_column = Product.created_at
        
        if filter_data.sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        # Apply pagination
        products = query.offset(filter_data.skip).limit(filter_data.limit).all()
        
        return products, total
    
    @staticmethod
    def get_product_by_id(product_id: int, db: Session) -> Product:
        """Get product by ID."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return product
    
    @staticmethod
    def create_product(product_data: ProductCreate, db: Session) -> Product:
        """Create a new product."""
        # Check if category exists
        category = db.query(Category).filter(Category.id == product_data.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        # Calculate discount price
        discount_price = None
        if product_data.discount_percentage > 0:
            discount_price = product_data.price * (1 - Decimal(product_data.discount_percentage) / 100)
        
        db_product = Product(
            category_id=product_data.category_id,
            name=product_data.name,
            description=product_data.description,
            price=product_data.price,
            discount_percentage=product_data.discount_percentage,
            discount_price=discount_price,
            stock=product_data.stock
        )
        
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        return db_product
    
    @staticmethod
    def update_product(product_id: int, product_data: ProductCreate, db: Session) -> Product:
        """Update an existing product."""
        product = ProductService.get_product_by_id(product_id, db)
        
        # Check if category exists
        if product_data.category_id:
            category = db.query(Category).filter(Category.id == product_data.category_id).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Category not found"
                )
            product.category_id = product_data.category_id
        
        product.name = product_data.name
        product.description = product_data.description
        product.price = product_data.price
        product.discount_percentage = product_data.discount_percentage
        product.stock = product_data.stock
        
        # Recalculate discount price
        if product_data.discount_percentage > 0:
            product.discount_price = product_data.price * (1 - Decimal(product_data.discount_percentage) / 100)
        else:
            product.discount_price = None
        
        db.commit()
        db.refresh(product)
        
        return product
    
    @staticmethod
    def delete_product(product_id: int, db: Session) -> None:
        """Delete a product."""
        product = ProductService.get_product_by_id(product_id, db)
        db.delete(product)
        db.commit()
    
    @staticmethod
    def get_related_products(product_id: int, db: Session, limit: int = 5) -> list[Product]:
        """Get related products from the same category."""
        product = ProductService.get_product_by_id(product_id, db)
        
        related_products = db.query(Product).filter(
            and_(
                Product.category_id == product.category_id,
                Product.id != product_id
            )
        ).limit(limit).all()
        
        return related_products
    
    @staticmethod
    def update_product_image(product_id: int, image_url: str, db: Session) -> Product:
        """Update product image URL."""
        product = ProductService.get_product_by_id(product_id, db)
        product.image_url = image_url
        db.commit()
        db.refresh(product)
        return product
    
    @staticmethod
    def update_product_rating(product_id: int, db: Session) -> None:
        """Update product rating based on reviews."""
        reviews = db.query(Review).filter(Review.product_id == product_id).all()
        
        if reviews:
            average_rating = sum(r.rating for r in reviews) / len(reviews)
            product = ProductService.get_product_by_id(product_id, db)
            product.rating = round(average_rating, 1)
            product.review_count = len(reviews)
            db.commit()
