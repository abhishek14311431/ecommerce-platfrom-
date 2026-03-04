# Quick Start Guide - E-Commerce Platform

Get your Amazon-like e-commerce platform up and running in minutes!

## 📋 Prerequisites

Before you start, ensure you have installed:

- **Python 3.9+** - Download from https://www.python.org/
- **Node.js 16+** - Download from https://nodejs.org/
- **PostgreSQL 12+** - Download from https://www.postgresql.org/
- **Git** - Download from https://git-scm.com/

Verify installations:
```bash
python --version
node --version
npm --version
psql --version
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Clone & Setup Backend (2 minutes)

```bash
# Navigate to project
cd /workspaces/ecommerce-platfrom-

# Create Python virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure Database (1 minute)

```bash
# Create .env file with essentials
cat > .env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce_db
SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
STRIPE_SECRET_KEY=sk_test_dummy_key_for_testing
STRIPE_PUBLISHABLE_KEY=pk_test_dummy_key_for_testing
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
EOF

# Create PostgreSQL database
createdb ecommerce_db
```

### Step 3: Seed Data & Start Backend (1 minute)

```bash
# Seed sample data
python seed_database.py

# Start backend
uvicorn app.main:app --reload
```

Backend ready at: http://localhost:8000

### Step 4: Setup & Start Frontend (1 minute)

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env.local
echo 'VITE_API_URL=http://localhost:8000/api' > .env.local

# Start development server
npm run dev
```

Frontend ready at: http://localhost:5173

---

## 🎯 Test the Application

### Create Account & Login

1. **Go to Frontend**: http://localhost:5173
2. **Click "Sign up"** and create a test account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123`
3. **Explore Products**: Browse the product listings
4. **Add to Cart**: Click "Add to Cart" on any product
5. **View Cart**: Click the cart icon to review items

### Using Admin Account

Already seeded credentials:
- **Username**: `admin`
- **Password**: `Admin123456`

Admin dashboard will be available at: `/admin` (once fully built)

### API Testing

**Swagger UI**: http://localhost:8000/docs

Test endpoints directly:
1. Go to http://localhost:8000/docs
2. Authorize with JWT token from login response
3. Try out endpoints

---

## 📁 Project Structure

```
ecommerce-platform/
├── backend/
│   ├── app/
│   │   ├── main.py (FastAPI app)
│   │   ├── routes/ (API endpoints)
│   │   ├── models/ (Database models)
│   │   ├── services/ (Business logic)
│   │   ├── schemas/ (Request/response schemas)
│   │   └── core/ (Config, security)
│   ├── requirements.txt
│   ├── seed_database.py (Sample data)
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/ (Page components)
│   │   ├── components/ (Reusable components)
│   │   ├── redux/ (State management)
│   │   └── services/ (API calls)
│   ├── package.json
│   └── vite.config.ts
│
├── COMPLETE_README.md (Full documentation)
├── DEPLOYMENT_GUIDE.md (Production setup)
├── API_DOCUMENTATION.md (API reference)
└── this file
```

---

## 🔑 Key Features Implemented

### Authentication ✅
- User registration with email validation
- Login with email or username
- JWT token authentication
- Password hashing with bcrypt
- Profile management

### Products ✅
- Product listing with pagination
- Search and filtering
- Product ratings and reviews
- Related products
- Discount support

### Shopping ✅
- Add/remove from cart
- Update quantities
- Cart totals calculation
- Wishlist functionality
- Coupon support

### Orders ✅
- Create orders from cart
- Order tracking
- Order status management
- Order cancellation

### Payments ✅
- Stripe integration
- Checkout session creation
- Payment verification
- Refund support

### Admin ✅
- Product CRUD operations
- Category management
- Order management
- Dashboard statistics
- Image uploads

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pip install pytest pytest-asyncio
pytest
```

### Frontend Tests

```bash
cd frontend
npm install --save-dev vitest @testing-library/react
npm run test
```

---

## 🔧 Common Commands

### Backend

```bash
# Start server
uvicorn app.main:app --reload

# Seed database
python seed_database.py

# Install new package
pip install package_name

# Create requirements file
pip freeze > requirements.txt

# Run migrations (if using Alembic)
alembic upgrade head
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview

# Run linting
npm run lint

# Install package
npm install package_name
```

### Database

```bash
# Connect to database
psql ecommerce_db

# Create database
createdb ecommerce_db

# Drop database
dropdb ecommerce_db

# Backup database
pg_dump ecommerce_db > backup.sql

# Restore database
psql ecommerce_db < backup.sql
```

---

## 🌐 API Endpoints Summary

**Base URL**: `http://localhost:8000/api`

### Essential Endpoints

```
POST   /auth/register              # Create account
POST   /auth/login                 # Login
GET    /auth/me                    # Get profile
PUT    /auth/me                    # Update profile

GET    /products                   # List products
GET    /products/{id}              # Product details
GET    /categories                 # List categories

GET    /cart                       # Get cart
POST   /cart/add                   # Add to cart
DELETE /cart/items/{id}            # Remove item
GET    /cart/totals                # Get totals

POST   /orders                     # Create order
GET    /orders                     # My orders
GET    /orders/{id}                # Order details

POST   /payments/stripe/checkout   # Stripe payment
POST   /payments/stripe/verify     # Verify payment

POST   /reviews                    # Create review
GET    /products/{id}/reviews      # Product reviews

GET    /wishlist                   # My wishlist
POST   /wishlist/{id}              # Add to wishlist
DELETE /wishlist/{id}              # Remove from wishlist
```

Full documentation: See `API_DOCUMENTATION.md`

---

## 📝 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce_db

# Security
SECRET_KEY=<your-32-character-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Frontend
FRONTEND_URL=http://localhost:5173

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional: AWS S3, Email, etc.
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_KEY=pk_test_xxxxx
```

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>

# Check Python version
python --version  # Should be 3.9+

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Database connection error

```bash
# Check PostgreSQL is running
psql --version

# Verify DATABASE_URL in .env
cat backend/.env | grep DATABASE_URL

# Test connection
psql postgresql://user:password@localhost:5432/ecommerce_db
```

### Frontend won't start

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 16+

# Try different port
npm run dev -- --port 3000
```

### API connection error

```bash
# Check backend is running
curl http://localhost:8000/docs

# Check CORS settings in backend .env
# Add frontend URL to CORS_ORIGINS

# Check VITE_API_URL in frontend .env.local
```

---

## 📚 Documentation

- **Full README**: `COMPLETE_README.md` - Complete feature documentation
- **Deployment**: `DEPLOYMENT_GUIDE.md` - Production deployment guide
- **API Reference**: `API_DOCUMENTATION.md` - Detailed API documentation
- **FastAPI Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🎓 Next Steps

1. ✅ Start the application (completed above)
2. 📖 Read `COMPLETE_README.md` for full documentation
3. 🔌 Integrate with real Stripe account
4. 🖼️ Configure S3/Cloudinary for images
5. 📧 Setup email notifications
6. 🚀 Deploy to cloud (see `DEPLOYMENT_GUIDE.md`)

---

## 💡 Tips for Development

### Hot Reload

**Backend**: Already enabled with `--reload` flag

**Frontend**: Hot reload enabled by default in Vite

### Browser DevTools

Highly recommended extensions:
- **Redux DevTools** - Monitor state changes
- **React DevTools** - Debug components

### API Testing Tools

- **Postman**: Test APIs with GUI
- **Insomnia**: Alternative to Postman
- **curl**: Command-line API testing

### Database Management

- **pgAdmin**: GUI for PostgreSQL
- **DBeaver**: Universal database tool
- **Adminer**: Web-based management

---

## 📊 Performance Tips

### Backend

- Enable caching with Redis
- Use database indexes
- Implement pagination
- Optimize queries with .select_from()

### Frontend

- Code splitting with lazy loading
- Image optimization
- Bundle size analysis
- CSS-in-JS optimization

---

## 🔐 Security Checklist

Before production:

- [ ] Change SECRET_KEY to random 32+ character string
- [ ] Update CORS_ORIGINS to your domain
- [ ] Enable HTTPS
- [ ] Use environment variables for all secrets
- [ ] Set up rate limiting
- [ ] Enable CSRF protection
- [ ] Validate all user inputs
- [ ] Use secure password hashing (bcrypt)
- [ ] Setup firewall rules
- [ ] Monitor logs regularly

---

## 📞 Support

- **Issues**: Check existing GitHub issues
- **Docs**: Review `COMPLETE_README.md` and API docs
- **Discussion**: Create a new issue for questions

---

**Happy Coding! 🚀**

For more details, see the complete documentation in this repository.
