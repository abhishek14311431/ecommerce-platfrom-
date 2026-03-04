from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserRegister(UserBase):
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    username_or_email: str
    password: str


class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    postal_code: Optional[str]
    country: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile


# Category Schemas
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    discount_percentage: float = 0
    stock: int


class ProductCreate(ProductBase):
    category_id: int


class ProductUpdate(ProductBase):
    category_id: Optional[int] = None


class Product(ProductBase):
    id: int
    category_id: int
    discount_price: Optional[Decimal]
    image_url: Optional[str]
    rating: float
    review_count: int
    created_at: datetime

    class Config:
        from_attributes = True


# Cart Schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemCreate(CartItemBase):
    pass


class CartItem(CartItemBase):
    id: int
    product: Product

    class Config:
        from_attributes = True


class Cart(BaseModel):
    id: int
    items: List[CartItem]
    created_at: datetime

    class Config:
        from_attributes = True


# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: Decimal
    product: Product

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    shipping_address: str
    items: List[OrderItemCreate]


class Order(BaseModel):
    id: int
    order_number: str
    user_id: int
    shipping_address: str
    subtotal: Decimal
    shipping_cost: Decimal
    tax: Decimal
    total: Decimal
    status: str
    payment_status: str
    items: List[OrderItemResponse]
    created_at: datetime

    class Config:
        from_attributes = True


# Payment Schemas
class PaymentCreate(BaseModel):
    order_id: int
    payment_method: str


class Payment(BaseModel):
    id: int
    order_id: int
    amount: Decimal
    currency: str
    status: str
    payment_method: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class StripeCheckoutSession(BaseModel):
    session_id: str


# Review Schemas
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    product_id: int


class Review(ReviewBase):
    id: int
    product_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Wishlist Schemas
class WishlistItemCreate(BaseModel):
    product_id: int


class WishlistItem(BaseModel):
    id: int
    product_id: int
    product: Product
    created_at: datetime

    class Config:
        from_attributes = True

# Coupon Schemas
class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_percentage: Optional[float] = None
    discount_amount: Optional[Decimal] = None
    min_purchase_amount: Decimal = 0
    max_discount_amount: Optional[Decimal] = None
    usage_limit: Optional[int] = None
    valid_from: datetime
    valid_until: datetime


class Coupon(BaseModel):
    id: int
    code: str
    discount_percentage: Optional[float]
    discount_amount: Optional[Decimal]
    min_purchase_amount: Decimal
    usage_count: int
    is_active: bool
    valid_from: datetime
    valid_until: datetime

    class Config:
        from_attributes = True


class CouponValidate(BaseModel):
    code: str
    subtotal: Decimal


class CouponResponse(BaseModel):
    valid: bool
    discount_amount: Decimal
    discount_percentage: Optional[float]
    message: str


# FlashSale Schemas
class FlashSaleCreate(BaseModel):
    product_id: int
    discount_percentage: float
    sale_price: Decimal
    start_time: datetime
    end_time: datetime
    quantity_available: int


class FlashSale(BaseModel):
    id: int
    product_id: int
    discount_percentage: float
    sale_price: Decimal
    start_time: datetime
    end_time: datetime
    quantity_available: int
    quantity_sold: int
    is_active: bool

    class Config:
        from_attributes = True


# Password Reset Schemas
class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class PasswordResetSuccess(BaseModel):
    message: str

# Search/Filter Schemas
class ProductFilter(BaseModel):
    category_id: Optional[int] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    min_rating: Optional[float] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "created_at"  # created_at, price, rating, popularity
    sort_order: Optional[str] = "desc"  # asc, desc
    skip: int = 0
    limit: int = 20

# Return/Exchange Schemas
class ReturnExchangeCreate(BaseModel):
    request_type: str  # 'return' or 'exchange'
    reason: str
    order_item_id: int


class ReturnExchangeResponse(BaseModel):
    id: int
    order_id: int
    request_type: str
    reason: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True