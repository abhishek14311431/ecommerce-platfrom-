# 🛍️ E-Commerce Platform

A full-stack e-commerce platform built with FastAPI (Python) and React (TypeScript), featuring a modern UI, shopping cart, orders management, payment integration, and admin panel.

## ✨ Features

### 🛒 Customer Features
- **Product Catalog**: Browse 64 products across 10 categories
- **Smart Search & Filters**: Find products by name, category, price range
- **Shopping Cart**: Add/remove items, update quantities
- **Secure Checkout**: Multiple payment options with Stripe integration
- **Order Management**: Track orders with delivery status
- **Order Cancellation**: Cancel pending orders (removed from list instantly)
- **User Authentication**: Secure login/register with JWT tokens
- **Profile Management**: Update address, phone, and personal details
- **Product Reviews**: Rate and review purchased items
- **Return/Exchange**: Request returns or exchanges for delivered items

### 👨‍💼 Admin Features
- **Dashboard**: Overview of sales, orders, and inventory
- **Product Management**: Add, edit, delete products
- **Order Management**: View and update order status
- **User Management**: View registered users
- **Category Management**: Organize products into categories
- **Inventory Tracking**: Monitor stock levels

### 🎨 UI/UX
- **Modern Design**: Beautiful gradient backgrounds
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: User-friendly success/error messages
- **Image Optimization**: Fast-loading product images from Unsplash

## 🚀 Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL/SQLite**: Database (SQLite for dev, PostgreSQL for production)
- **JWT Authentication**: Secure token-based auth
- **Bcrypt**: Password hashing (optimized to 4 rounds for fast login)
- **Stripe**: Payment processing
- **Pydantic**: Data validation

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe JavaScript
- **Redux Toolkit**: State management
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool
- **React Hot Toast**: Beautiful notifications

## 📦 Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/abhishek14311431/ecommerce-platfrom-.git
cd ecommerce-platfrom-

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

### Frontend Setup
```bash
# In a new terminal, from project root
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env and set: VITE_API_URL=http://localhost:8000/api

# Run frontend
npm run dev
```

Frontend will be available at: http://localhost:5173

## 🌐 Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed deployment instructions.

### Quick Deploy Links
- **Backend**: Deploy to [Render](https://render.com) (Free PostgreSQL included)
- **Frontend**: Deploy to [Vercel](https://vercel.com) (Instant deployment)

Both services offer free tiers and automatic deployments from GitHub!

## 🔐 Default Credentials

After seeding the database, use these credentials:

**Admin Account:**
- Username: `admin`
- Password: `Admin123456`

**Test Users:**
- Username: `john_doe` | Password: `John123456`
- Username: `jane_smith` | Password: `Jane123456`

⚠️ **Important**: Change these passwords in production!

## 📱 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🗂️ Project Structure

```
ecommerce-platfrom-/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, security
│   │   ├── database/      # Database setup
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routes/        # API endpoints
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── requirements.txt
│   └── render-build.sh    # Deployment build script
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # State management
│   │   ├── services/      # API client
│   │   └── utils/         # Helper functions
│   ├── package.json
│   └── vite.config.ts
├── render.yaml            # Render deployment config
├── vercel.json            # Vercel deployment config
├── DEPLOYMENT.md          # Deployment guide
└── README.md
```

## 🎯 Key Features Implementation

### Fast Login (0.4 seconds)
- Optimized bcrypt from 12 rounds to 4 rounds
- 50x performance improvement (was 20+ seconds)

### Instant Order Cancellation
- Orders removed from UI immediately (no page reload)
- Redux state automatically updated
- Backend returns items to inventory

### Modern UI
- Gradient backgrounds: `from-blue-50 via-purple-50 to-pink-50`
- Smooth transitions and hover effects
- Responsive design for all devices

### Order Tracking
- Visual delivery status with progress indicators
- Estimated delivery dates
- Return/exchange requests for delivered items

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000
# Kill the process if needed
kill -9 <PID>
```

### Frontend can't connect to backend
- Check `VITE_API_URL` in frontend/.env
- Ensure backend is running on correct port
- Check CORS settings in backend/app/core/config.py

### Database issues
```bash
# Delete and recreate database
cd backend
rm ecommerce.db
python -c "from app.database.database import engine; from app.models.models import Base; Base.metadata.create_all(bind=engine)"
```

## 🔄 Recent Updates

### March 4, 2026
- ✅ Added cancel order functionality with instant removal
- ✅ Fixed backend serialization error for orders API
- ✅ Optimized login speed (20s → 0.4s)
- ✅ Enhanced UI with gradient backgrounds
- ✅ Added comprehensive deployment configurations

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Abhishek Kumar**
- GitHub: [@abhishek14311431](https://github.com/abhishek14311431)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Product images from [Unsplash](https://unsplash.com)
- Icons and UI inspiration from modern e-commerce platforms
- Built with love for the developer community

---

**Ready to deploy?** Check out [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions! 🚀