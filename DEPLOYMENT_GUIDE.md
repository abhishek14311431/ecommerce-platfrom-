# E-Commerce Platform - Complete Setup & Deployment Guide

## Table of Contents
1. [Backend Setup](#backend-setup)
2. [Frontend Setup](#frontend-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Configuration](#environment-configuration)
5. [Local Development](#local-development)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Backend Setup

### Prerequisites
- Python 3.9+
- PostgreSQL 12+
- pip package manager

### Step-by-Step Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create Python virtual environment**
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create .env file**
```bash
cp .env.example .env
```

5. **Edit .env with your configuration**
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce_db

# JWT
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET_NAME=ecommerce-bucket
AWS_REGION=us-east-1

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@ecommerce.com

# Frontend
FRONTEND_URL=http://localhost:5173

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

6. **Create PostgreSQL database**
```bash
# Using psql
createdb ecommerce_db

# Or using PostgreSQL GUI
# Create a new database named "ecommerce_db"
```

7. **Run the server**
```bash
uvicorn app.main:app --reload
```

Server will run on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

---

## Frontend Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Step-by-Step Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Create .env file**
```bash
echo 'VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_KEY=pk_test_xxxxx' > .env.local
```

4. **Run development server**
```bash
npm run dev
# or
yarn dev
```

Server will run on: `http://localhost:5173`

5. **Build for production**
```bash
npm run build
# or
yarn build
```

---

## Database Configuration

### Database Setup Script

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ecommerce_db;

# Create user (optional)
CREATE USER ecommerce_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;

# Exit psql
\q
```

### Database URL Formats

**Local PostgreSQL:**
```
postgresql://username:password@localhost:5432/ecommerce_db
```

**Remote PostgreSQL (AWS RDS):**
```
postgresql://username:password@your-instance.us-east-1.rds.amazonaws.com:5432/ecommerce_db
```

---

## Environment Configuration

### Backend Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/db` |
| `SECRET_KEY` | JWT secret key (min 32 chars) | Random secure string |
| `STRIPE_SECRET_KEY` | Stripe API secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` |
| `AWS_ACCESS_KEY_ID` | AWS access key | From AWS Console |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | From AWS Console |
| `SMTP_USERNAME` | Email for sending | `your-email@gmail.com` |
| `SMTP_PASSWORD` | Email app password | App-specific password |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:5173` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_STRIPE_KEY` | Stripe publishable key | `pk_test_...` |

---

## Local Development

### Starting Everything

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Accessing Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Testing with Sample Data

```bash
# Login to API docs
# POST /auth/register with sample data:
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePassword123",
  "phone": "+1234567890"
}

# Use returned token for subsequent requests
```

---

## Production Deployment

### Backend Deployment (AWS EC2 + RDS)

#### 1. **Prepare AWS Infrastructure**

```bash
# Create EC2 instance
# - OS: Ubuntu 22.04
# - Type: t3.small or larger
# - Security group: Allow ports 22, 80, 443

# Create RDS PostgreSQL database
# - Engine: PostgreSQL 14
# - Instance class: db.t3.micro or larger
```

#### 2. **Deploy Backend**

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.10 python3-pip python3-venv postgresql-client nginx supervisor

# Clone repository
git clone your-repo-url
cd ecommerce-platform/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
pip install gunicorn

# Create .env file with production values
nano .env
```

#### 3. **Configure Gunicorn**

Create `/home/ubuntu/ecommerce-platform/backend/wsgi.py`:
```python
from app.main import app

if __name__ == "__main__":
    app.run()
```

#### 4. **Configure Supervisor**

Create `/etc/supervisor/conf.d/ecommerce.conf`:
```ini
[program:ecommerce]
directory=/home/ubuntu/ecommerce-platform/backend
command=/home/ubuntu/ecommerce-platform/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:8000 app.main:app
autostart=true
autorestart=true
stderr_logfile=/var/log/ecommerce.err.log
stdout_logfile=/var/log/ecommerce.out.log
```

#### 5. **Configure Nginx**

Create `/etc/nginx/sites-available/ecommerce`:
```nginx
upstream ecommerce {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://ecommerce;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /uploads {
        alias /home/ubuntu/ecommerce-platform/backend/uploads;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. **Start Services**

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ecommerce
```

#### 7. **Setup SSL (Let's Encrypt)**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

### Frontend Deployment (Vercel)

#### 1. **Deploy to Vercel**

```bash
npm install -g vercel
cd frontend
vercel
```

#### 2. **Configure Environment Variables in Vercel Dashboard**

```
VITE_API_URL=https://api.your-domain.com
VITE_STRIPE_KEY=pk_live_xxxxx
```

#### 3. **Custom Domain**

In Vercel Dashboard:
- Go to Settings → Domains
- Add your domain
- Update DNS records as instructed

### Backend Deployment (Using Render.com)

#### 1. **Connect to Render**

- Create Render account
- Connect GitHub repository
- Create new Web Service

#### 2. **Configure Build & Start Commands**

Build Command:
```bash
pip install -r requirements.txt
```

Start Command:
```bash
gunicorn app.main:app --workers 4
```

#### 3. **Set Environment Variables**

In Render Dashboard → Environment:
```
DATABASE_URL=<postgres_connection_string>
SECRET_KEY=<your_secret>
STRIPE_SECRET_KEY=<your_stripe_key>
# ... other variables
```

#### 4. **Database**

- Create PostgreSQL database on Render
- Copy connection string
- Add to environment variables

### Database Deployment (AWS RDS)

#### 1. **Create RDS Instance**

```bash
# Via AWS Console:
# - Engine: PostgreSQL
# - Version: 14.x
# - Instance: db.t3.micro
# - Storage: 20 GB
# - Public accessibility: No (for security)
```

#### 2. **Configure Security Groups**

Allow inbound traffic on port 5432 from:
- EC2 security group (if using EC2)
- Specific IP addresses

#### 3. **Get Connection String**

Find in RDS Console → Connectivity & security:
```
postgresql://username:password@your-db.us-east-1.rds.amazonaws.com:5432/ecommerce_db
```

### CloudFront CDN Setup

```bash
# Via AWS Console:
# 1. Create CloudFront distribution
# 2. Origin: Your Vercel/S3 URL
# 3. Default root object: index.html
# 4. Redirect HTTP to HTTPS
# 5. Add custom domain
```

---

## API Integration with Stripe

### Setup Stripe Account

1. **Create Stripe Account** at https://stripe.com
2. **Get API Keys**:
   - Secret Key: Settings → API Keys → Secret Key
   - Publishable Key: Settings → API Keys → Publishable Key

### Configure Webhook

```bash
# In Stripe Dashboard:
# 1. Developers → Webhooks
# 2. Add endpoint: https://your-api.com/api/webhooks/stripe
# 3. Select events: charge.succeeded, charge.failed
# 4. Copy signing secret → STRIPE_WEBHOOK_SECRET
```

### Test Stripe Payments

**Test Cards:**
```
Visa: 4242 4242 4242 4242
MasterCard: 5555 5555 5555 4444
Amex: 3782 822463 10005
```

Expiry: Any future date
CVC: Any 3 digits

---

## Troubleshooting

### Backend Issues

#### Database Connection Error
```
Error: could not translate host name "localhost" to address
```
**Solution:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database credentials

#### Port Already in Use
```
OSError: [Errno 48] Address already in use
```
**Solution:**
```bash
# Find process using port 8000
lsof -i :8000
# Kill it
kill -9 <PID>
```

#### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Add frontend URL to CORS_ORIGINS in .env
- Restart backend server

### Frontend Issues

#### API Connection Error
```
Failed to fetch from http://localhost:8000/api
```
**Solution:**
- Check VITE_API_URL in .env
- Ensure backend is running
- Check CORS configuration

#### Package Installation Error
**Solution:**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Database Issues

#### Tables Not Created
**Solution:**
```bash
# Alembic migrations (if using)
alembic upgrade head

# Or manually execute DDL
psql ecommerce_db < schema.sql
```

#### Connection Timeout
**Solution:**
- Check firewall rules
- Verify database credentials
- Check network connectivity

---

## Performance Optimization

### Backend

1. **Enable Caching**:
```python
from fastapi_cache2 import FastAPICache2
from fastapi_cache2.backends.redis import RedisBackend

# Configure Redis caching
```

2. **Add Rate Limiting**:
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
```

3. **Database Optimization**:
- Add indexes on frequently queried columns
- Use query pagination
- Enable connection pooling

### Frontend

1. **Code Splitting**:
```typescript
const HomePage = lazy(() => import('./pages/HomePage'));
```

2. **Image Optimization**:
- Use WebP format
- Implement lazy loading
- Use CDN for static assets

3. **Bundle Optimization**:
```bash
npm run build
# Check bundle size
npm install -g webpack-bundle-analyzer
```

---

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong SECRET_KEY
- [ ] Enable CORS only for trusted origins
- [ ] Use environment variables for secrets
- [ ] Validate all user inputs
- [ ] Implement rate limiting
- [ ] Use secure password hashing (bcrypt)
- [ ] Enable CSRF protection
- [ ] Setup firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

---

## Monitoring & Logging

### Backend Logging

```python
import logging

logger = logging.getLogger(__name__)
logger.info("Order created successfully")
logger.error("Database connection failed")
```

### Application Monitoring

Set up with:
- **Sentry** for error tracking
- **DataDog** for performance monitoring
- **CloudWatch** for AWS logs

---

## Support & Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com
- **React Documentation**: https://react.dev
- **PostgreSQL Documentation**: https://www.postgresql.org/docs
- **Stripe API Docs**: https://stripe.com/docs/api
- **AWS Documentation**: https://docs.aws.amazon.com

---

**Last Updated**: March 2026
