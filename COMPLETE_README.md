# E-Commerce Platform - Full Stack Implementation

A complete Amazon-like e-commerce platform built with React.js, FastAPI, PostgreSQL, and Stripe integration.

## Project Structure

```
ecommerce-platform/
├── backend/               # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── core/
│   │   │   ├── config.py       # Settings and configuration
│   │   │   └── security.py     # JWT, bcrypt utilities
│   │   ├── database/
│   │   │   └── database.py     # Database connection
│   │   ├── models/
│   │   │   └── models.py       # SQLAlchemy models
│   │   ├── schemas/
│   │   │   └── schemas.py      # Pydantic schemas (serialization)
│   │   ├── routes/             # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── cart.py
│   │   │   ├── orders.py
│   │   │   ├── payments.py
│   │   │   ├── reviews.py
│   │   │   └── admin.py
│   │   └── services/           # Business logic
│   │       ├── auth_service.py
│   │       ├── product_service.py
│   │       ├── cart_service.py
│   │       ├── order_service.py
│   │       ├── payment_service.py
│   │       └── review_service.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── redux/         # Redux store
│   │   ├── services/      # API calls
│   │   ├── styles/        # Global styles
│   │   └── utils/         # Utility functions
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

## Technology Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT with bcrypt
- **Payment**: Stripe API
- **Image Storage**: AWS S3 / Cloudinary

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Payment**: Stripe React Components

### Database
- PostgreSQL with SQLAlchemy ORM

## Installation & Setup

### Backend Setup

1. **Clone the repository**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create .env file** (copy from .env.example)
```bash
cp .env.example .env
```

5. **Set up PostgreSQL database**
```bash
# Create database
createdb ecommerce_db

# Or configure DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db
```

6. **Run the server**
```bash
uvicorn app.main:app --reload
```

Server runs on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_KEY=pk_test_your_stripe_key
```

4. **Run development server**
```bash
npm run dev
```

Server runs on: `http://localhost:5173`

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage FLOAT DEFAULT 0,
  discount_price DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  image_url VARCHAR(500),
  rating FLOAT DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  shipping_address TEXT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication
```
POST   /api/auth/register          # Register user
POST   /api/auth/login             # Login user
GET    /api/auth/me                # Get current user
PUT    /api/auth/me                # Update profile
POST   /api/auth/change-password   # Change password
POST   /api/auth/forgot-password   # Request reset
POST   /api/auth/reset-password    # Reset password
```

### Products
```
GET    /api/products               # List products (with filters)
GET    /api/products/{id}          # Get product details
POST   /api/products               # Create product (admin)
PUT    /api/products/{id}          # Update product (admin)
DELETE /api/products/{id}          # Delete product (admin)
GET    /api/products/{id}/related  # Get related products
```

### Categories
```
GET    /api/categories             # List all categories
GET    /api/categories/{id}        # Get category
POST   /api/categories             # Create category (admin)
PUT    /api/categories/{id}        # Update category (admin)
DELETE /api/categories/{id}        # Delete category (admin)
```

### Cart
```
GET    /api/cart                   # Get cart
POST   /api/cart/add               # Add to cart
PUT    /api/cart/items/{id}        # Update quantity
DELETE /api/cart/items/{id}        # Remove item
DELETE /api/cart                   # Clear cart
GET    /api/cart/totals            # Get totals
```

### Orders
```
POST   /api/orders                 # Create order
GET    /api/orders                 # Get user orders
GET    /api/orders/{id}            # Get order details
POST   /api/orders/{id}/cancel     # Cancel order
GET    /api/orders/admin/all       # Get all orders (admin)
PUT    /api/orders/{id}/status     # Update status (admin)
```

### Payments
```
POST   /api/payments/stripe/checkout  # Create checkout session
POST   /api/payments/stripe/verify    # Verify payment
GET    /api/payments/{id}             # Get payment
POST   /api/payments/{id}/refund      # Refund (admin)
```

### Reviews & Wishlist
```
GET    /api/products/{id}/reviews  # Get product reviews
POST   /api/reviews                # Create review
PUT    /api/reviews/{id}           # Update review
DELETE /api/reviews/{id}           # Delete review
GET    /api/wishlist               # Get wishlist
POST   /api/wishlist/{product_id}  # Add to wishlist
DELETE /api/wishlist/{product_id}  # Remove from wishlist
GET    /api/wishlist/{product_id}/check  # Check if in wishlist
```

### Admin
```
POST   /api/admin/upload/image     # Upload product image
POST   /api/admin/products/{id}/image  # Update product image
GET    /api/admin/stats            # Get dashboard stats
```

## Features Implemented

### Authentication
- ✅ User registration with email validation
- ✅ Login with username or email
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Password reset functionality
- ✅ Profile management

### Products
- ✅ Product listing with pagination
- ✅ Search by name/description
- ✅ Filter by category, price, rating
- ✅ Sort by price, rating, popularity
- ✅ Product details page
- ✅ Related products recommendation
- ✅ Product reviews and ratings
- ✅ Discount and flash sales support

### Shopping Cart
- ✅ Add/remove items
- ✅ Update quantities
- ✅ Cart totals calculation
- ✅ Stock validation

### Ordering
- ✅ Create orders from cart
- ✅ Order tracking
- ✅ Order status management (admin)
- ✅ Order cancellation

### Payments
- ✅ Stripe checkout integration
- ✅ Payment verification
- ✅ Refund functionality

### Admin Panel
- ✅ Product CRUD operations
- ✅ Category management
- ✅ Order management
- ✅ Dashboard statistics
- ✅ User management

### Additional Features
- ✅ Wishlist functionality
- ✅ Product reviews and ratings
- ✅ Coupon/discount support
- ✅ Image uploads
- ✅ CORS protection
- ✅ Rate limiting ready

## Categories Available

1. Electronics
2. Mobiles
3. Laptops
4. Fashion
5. Home Appliances
6. Books
7. Beauty
8. Sports
9. Furniture
10. Groceries

## Deployment

### Backend Deployment (AWS/Render/Railway)

**Using Railway:**
1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Set environment variables
4. Deploy automatically

**Using AWS:**
1. Create RDS PostgreSQL instance
2. Deploy FastAPI on EC2 or Elastic Beanstalk
3. Configure security groups
4. Set up CloudFront for CDN

### Frontend Deployment (Vercel/Netlify)

**Using Vercel:**
```bash
npm i -g vercel
vercel
```

**Using Netlify:**
```bash
npm run build
# Connect to Netlify and deploy
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost/ecommerce_db
SECRET_KEY=your-super-secret-key
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET_NAME=ecommerce-bucket
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
SMTP_SERVER=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_KEY=pk_test_xxx
```

## Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Rate limiting ready (can use slowapi)
- ✅ Admin role-based access
- ✅ Secure password reset with tokens

## Performance Optimizations

- ✅ Database query optimization
- ✅ Pagination for listings
- ✅ Lazy loading for images
- ✅ Caching headers ready
- ✅ Efficient sorting and filtering

## Testing

### Backend Testing
```bash
pip install pytest pytest-asyncio
pytest
```

### Frontend Testing
```bash
npm install --save-dev vitest @testing-library/react
npm run test
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify credentials

### CORS Errors
- Update CORS_ORIGINS in .env
- Ensure frontend URL is in the list

### Stripe Integration
- Verify API keys in .env
- Check webhook secret setup
- Test with Stripe test cards

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check existing issues
2. Create new issue with details
3. Contact support@ecommerce.com

---

**Happy Coding! 🚀**
