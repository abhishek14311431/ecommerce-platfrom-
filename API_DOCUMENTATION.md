# E-Commerce API Documentation

**Base URL:** `http://localhost:8000/api`

**Authentication:** All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents
1. [Authentication](#authentication)
2. [Products](#products)
3. [Categories](#categories)
4. [Cart](#cart)
5. [Orders](#orders)
6. [Payments](#payments)
7. [Reviews](#reviews)
8. [Wishlist](#wishlist)
9. [Admin](#admin)

---

## Authentication

### Register User
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": null,
    "city": null,
    "state": null,
    "postal_code": null,
    "country": null,
    "created_at": "2024-03-04T10:30:00"
  }
}
```

---

### Login User
**POST** `/auth/login`

Authenticates a user and returns JWT token.

**Request Body:**
```json
{
  "username_or_email": "john_doe",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    ...
  }
}
```

---

### Get Current User
**GET** `/auth/me`

Retrieves the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "created_at": "2024-03-04T10:30:00"
}
```

---

### Update User Profile
**PUT** `/auth/me`

Updates the current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA"
}
```

**Response (200):** Updated user object

---

### Change Password
**POST** `/auth/change-password`

Changes the user's password.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `old_password` (string, required): Current password
- `new_password` (string, required): New password (min 8 chars)

**Response (200):**
```json
{"message": "Password changed successfully"}
```

---

### Request Password Reset
**POST** `/auth/forgot-password`

Initiates password reset process.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{"message": "If email exists, password reset link sent to email"}
```

---

### Reset Password
**POST** `/auth/reset-password`

Resets password using reset token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewPassword123"
}
```

**Response (200):**
```json
{"message": "Password reset successfully"}
```

---

## Products

### Get Products List
**GET** `/products`

Retrieves paginated list of products with filtering and sorting.

**Query Parameters:**
- `category_id` (integer, optional): Filter by category
- `search` (string, optional): Search by name/description
- `min_price` (number, optional): Minimum price filter
- `max_price` (number, optional): Maximum price filter
- `min_rating` (number, optional): Minimum rating filter
- `sort_by` (string, optional): Sort field (created_at, price, rating, popularity)
- `sort_order` (string, optional): Sort direction (asc, desc) - default: desc
- `skip` (integer, optional): Pagination offset - default: 0
- `limit` (integer, optional): Items per page - default: 20

**Example:**
```
GET /products?category_id=1&min_price=10&max_price=1000&sort_by=price&limit=20
```

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones",
      "price": "79.99",
      "discount_percentage": 10,
      "discount_price": "71.99",
      "stock": 50,
      "image_url": "/uploads/products/headphones.jpg",
      "rating": 4.5,
      "review_count": 125,
      "category_id": 1,
      "created_at": "2024-01-15T08:00:00"
    },
    ...
  ],
  "total": 150,
  "skip": 0,
  "limit": 20
}
```

---

### Get Product Details
**GET** `/products/{product_id}`

Retrieves detailed information about a specific product.

**Path Parameters:**
- `product_id` (integer): Product ID

**Response (200):**
```json
{
  "id": 1,
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation...",
  "price": "79.99",
  "discount_percentage": 10,
  "discount_price": "71.99",
  "stock": 50,
  "image_url": "/uploads/products/headphones.jpg",
  "rating": 4.5,
  "review_count": 125,
  "category_id": 1,
  "created_at": "2024-01-15T08:00:00"
}
```

---

### Get Related Products
**GET** `/products/{product_id}/related`

Retrieves products from the same category.

**Query Parameters:**
- `limit` (integer, optional): Number of related products - default: 5

**Response (200):**
```json
[
  {
    "id": 2,
    "name": "Bluetooth Speaker",
    ...
  },
  ...
]
```

---

## Categories

### Get All Categories
**GET** `/categories`

Retrieves all product categories.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "image_url": "/uploads/categories/electronics.jpg",
    "created_at": "2024-01-01T00:00:00"
  },
  ...
]
```

---

### Get Category Details
**GET** `/categories/{category_id}`

Retrieves a specific category.

**Response (200):**
```json
{
  "id": 1,
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "image_url": "/uploads/categories/electronics.jpg",
  "created_at": "2024-01-01T00:00:00"
}
```

---

## Cart

### Get Cart
**GET** `/cart`

Retrieves the current user's shopping cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 5,
  "items": [
    {
      "id": 12,
      "product_id": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "name": "Wireless Headphones",
        "price": "79.99",
        "discount_price": "71.99",
        ...
      }
    }
  ],
  "created_at": "2024-03-01T10:00:00"
}
```

---

### Add to Cart
**POST** `/cart/add`

Adds a product to the user's cart.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response (201):**
```json
{
  "id": 12,
  "product_id": 1,
  "quantity": 2,
  "product": {
    ...
  }
}
```

---

### Update Cart Item
**PUT** `/cart/items/{item_id}`

Updates the quantity of a cart item.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `quantity` (integer, required): New quantity

**Response (200):** Updated cart item

---

### Remove from Cart
**DELETE** `/cart/items/{item_id}`

Removes an item from the cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):** No content

---

### Clear Cart
**DELETE** `/cart`

Removes all items from the cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):** No content

---

### Get Cart Totals
**GET** `/cart/totals`

Calculates cart totals including shipping and tax.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "subtotal": "143.98",
  "shipping_cost": "0.00",
  "tax": "14.40",
  "total": "158.38"
}
```

---

## Orders

### Create Order
**POST** `/orders`

Creates a new order from the cart.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `shipping_address` (string, required): Delivery address

**Response (201):**
```json
{
  "id": 1,
  "order_number": "ORD-20240304-ABC123",
  "user_id": 1,
  "shipping_address": "123 Main St, New York, NY 10001",
  "subtotal": "143.98",
  "shipping_cost": "0.00",
  "tax": "14.40",
  "total": "158.38",
  "status": "pending",
  "payment_status": "pending",
  "items": [...],
  "created_at": "2024-03-04T10:30:00"
}
```

---

### Get User Orders
**GET** `/orders`

Retrieves all orders for the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `skip` (integer, optional): Pagination offset - default: 0
- `limit` (integer, optional): Items per page - default: 10

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "order_number": "ORD-20240304-ABC123",
      ...
    }
  ],
  "total": 5,
  "skip": 0,
  "limit": 10
}
```

---

### Get Order Details
**GET** `/orders/{order_id}`

Retrieves details of a specific order.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):** Order details

---

### Cancel Order
**POST** `/orders/{order_id}/cancel`

Cancels a pending order.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):** Updated order with status "cancelled"

---

### Get All Orders (Admin)
**GET** `/orders/admin/all`

Retrieves all orders in the system (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `skip` (integer, optional): Pagination offset
- `limit` (integer, optional): Items per page

**Response (200):** List of all orders

---

### Update Order Status (Admin)
**PUT** `/orders/{order_id}/status`

Updates the status of an order.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` (string, required): New status (pending, confirmed, shipped, delivered, cancelled)

**Response (200):** Updated order

---

## Payments

### Create Stripe Checkout Session
**POST** `/payments/stripe/checkout`

Creates a Stripe checkout session for payment.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters:**
- `order_id` (integer, required): Order ID

**Response (200):**
```json
{
  "session_id": "cs_test_xxxxx",
  "client_secret": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxxxx"
}
```

---

### Verify Stripe Payment
**POST** `/payments/stripe/verify`

Verifies a completed Stripe payment.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `session_id` (string, required): Stripe session ID

**Response (200):**
```json
{
  "id": 1,
  "order_id": 1,
  "amount": "158.38",
  "currency": "USD",
  "status": "completed",
  "payment_method": "stripe",
  "created_at": "2024-03-04T10:35:00"
}
```

---

## Reviews

### Get Product Reviews
**GET** `/products/{product_id}/reviews`

Retrieves reviews for a product.

**Query Parameters:**
- `skip` (integer, optional): Pagination offset - default: 0
- `limit` (integer, optional): Items per page - default: 10

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "user_id": 2,
      "rating": 5,
      "title": "Excellent product!",
      "comment": "Great quality and fast delivery.",
      "created_at": "2024-02-28T15:00:00"
    }
  ],
  "total": 125,
  "skip": 0,
  "limit": 10
}
```

---

### Create Review
**POST** `/reviews`

Creates a review for a product.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_id": 1,
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Great quality and fast delivery."
}
```

**Response (201):** Created review object

---

### Update Review
**PUT** `/reviews/{review_id}`

Updates an existing review.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "product_id": 1,
  "rating": 4,
  "title": "Updated review",
  "comment": "Changed my rating after more use."
}
```

**Response (200):** Updated review

---

### Delete Review
**DELETE** `/reviews/{review_id}`

Deletes a review.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):** No content

---

## Wishlist

### Get Wishlist
**GET** `/wishlist`

Retrieves the user's wishlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `skip` (integer, optional): Pagination offset - default: 0
- `limit` (integer, optional): Items per page - default: 20

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 1,
      "product": {...},
      "created_at": "2024-02-28T10:00:00"
    }
  ],
  "total": 5,
  "skip": 0,
  "limit": 20
}
```

---

### Add to Wishlist
**POST** `/wishlist/{product_id}`

Adds a product to the wishlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (201):** Wishlist item

---

### Remove from Wishlist
**DELETE** `/wishlist/{product_id}`

Removes a product from the wishlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):** No content

---

### Check Wishlist Status
**GET** `/wishlist/{product_id}/check`

Checks if a product is in the wishlist.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{"in_wishlist": true}
```

---

## Admin Endpoints

### Upload Product Image
**POST** `/admin/upload/image`

Uploads a product image (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (file, required): Image file (JPEG, PNG, or WEBP)

**Response (200):**
```json
{
  "filename": "product-image.jpg",
  "url": "/uploads/products/product-image.jpg",
  "size": 102400
}
```

---

### Update Product Image URL
**POST** `/admin/products/{product_id}/image`

Updates a product's image URL (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `image_url` (string, required): Image URL

**Response (200):** Updated product

---

### Get Dashboard Statistics
**GET** `/admin/stats`

Retrieves admin dashboard statistics (admin only).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "total_products": 150,
  "total_orders": 500,
  "total_users": 1200,
  "total_revenue": 15000,
  "recent_orders": [...]
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

**400 Bad Request:**
```json
{"detail": "Invalid input data"}
```

**401 Unauthorized:**
```json
{"detail": "Invalid authentication credentials"}
```

**403 Forbidden:**
```json
{"detail": "Not enough permissions"}
```

**404 Not Found:**
```json
{"detail": "Resource not found"}
```

**500 Internal Server Error:**
```json
{"detail": "Internal server error"}
```

---

## Rate Limiting

API endpoints may implement rate limiting. Check response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1614902400
```

---

**Last Updated**: March 2024
