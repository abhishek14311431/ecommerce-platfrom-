# 🚀 Deployment Guide

This guide will help you deploy the e-commerce platform to production using free hosting services.

## 📋 Prerequisites

- GitHub account
- Render account (for backend): https://render.com
- Vercel account (for frontend): https://vercel.com

---

## 🔧 Backend Deployment (Render)

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account

### Step 3: Deploy Backend

#### Option A: Using render.yaml (Recommended)
1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository: `abhishek14311431/ecommerce-platfrom-`
3. Render will automatically detect `render.yaml`
4. Click **"Apply"**
5. Wait for deployment to complete (~5-10 minutes)

#### Option B: Manual Setup
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ecommerce-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && chmod +x render-build.sh && ./render-build.sh`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`

4. Add Environment Variables:
   - `SECRET_KEY`: (Generate a secure random string, e.g., use: `openssl rand -hex 32`)
   - `FRONTEND_URL`: (Will add after frontend deployment)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (optional)
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe public key (optional)

5. Create PostgreSQL Database:
   - Click **"New +"** → **"PostgreSQL"**
   - Name: `ecommerce-db`
   - Plan: `Free`
   - After creation, copy the **Internal Database URL**
   - Add to backend environment variables as `DATABASE_URL`

6. Click **"Create Web Service"**

### Step 4: Get Backend URL
After deployment completes, you'll get a URL like:
```
https://ecommerce-backend-xxxx.onrender.com
```
**Save this URL - you'll need it for frontend configuration!**

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with your GitHub account

### Step 2: Deploy Frontend
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository: `abhishek14311431/ecommerce-platfrom-`
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
   - (Replace with your actual Render backend URL from Step 4 above)

5. Click **"Deploy"**

### Step 3: Get Frontend URL
After deployment, you'll get a URL like:
```
https://ecommerce-platfrom-xxxx.vercel.app
```

### Step 4: Update Backend CORS
1. Go back to Render Dashboard
2. Open your backend service
3. Add/Update Environment Variable:
   - `FRONTEND_URL` = `https://your-frontend-url.vercel.app`
4. Save changes (this will redeploy the backend)

---

## ✅ Verify Deployment

### Test Backend
Visit: `https://your-backend-url.onrender.com/docs`
- You should see the Swagger API documentation

### Test Frontend
Visit: `https://your-frontend-url.vercel.app`
- You should see the e-commerce homepage
- Try logging in with test credentials:
  - Username: `admin`
  - Password: `Admin123456`

---

## 🔐 Important Security Notes

### 1. Change Default Passwords
After deployment, immediately change default user passwords:
- Admin: `Admin123456` → Change this!
- Test users: Update all default passwords

### 2. Environment Variables
Never commit these to GitHub:
- `SECRET_KEY` - Generate a strong random key
- `DATABASE_URL` - Provided by Render
- `STRIPE_SECRET_KEY` - Your Stripe credentials

### 3. CORS Configuration
The backend is configured to accept requests from your frontend URL.
Update `FRONTEND_URL` environment variable if you change domains.

---

## 🐛 Troubleshooting

### Backend Issues

**500 Internal Server Error**
- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set
- Ensure database connection is working

**Database Connection Failed**
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL instance is running
- Internal Database URL format: `postgresql://user:pass@host:5432/dbname`

**CORS Errors**
- Verify `FRONTEND_URL` matches your Vercel domain exactly
- No trailing slash in the URL
- Protocol must be `https://` for production

### Frontend Issues

**API Calls Failing**
- Check `VITE_API_URL` in Vercel environment variables
- Should be: `https://your-backend-url.onrender.com/api`
- Note: Must include `/api` at the end
- Include `https://`

**Build Failing**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- TypeScript errors will fail the build - fix them first

**Blank Page After Deploy**
- Check browser console for errors
- Verify API URL is correct
- Try hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

---

## 📊 Free Tier Limits

### Render (Backend)
- ✅ 750 hours/month (enough for 1 service running 24/7)
- ✅ 512 MB RAM
- ✅ Free PostgreSQL with 1GB storage
- ⚠️ Spins down after 15 minutes of inactivity (cold starts ~30-60s)
- ⚠️ Limited to 100GB bandwidth/month

### Vercel (Frontend)
- ✅ Unlimited websites
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Instant cache invalidation
- ✅ Always online (no cold starts)

---

## 🔄 Continuous Deployment

Both Render and Vercel are configured for automatic deployment:
- **Push to main branch** → Automatically deploys
- **Pull request** → Creates preview deployment (Vercel only)

To disable automatic deployments:
- **Render**: Service Settings → Build & Deploy → Disable "Auto-Deploy"
- **Vercel**: Project Settings → Git → Disable "Auto-Deployments"

---

## 🎯 Production Checklist

Before going live:
- [ ] Change all default passwords
- [ ] Set secure `SECRET_KEY` (32+ random characters)
- [ ] Configure Stripe with production keys
- [ ] Set up proper email SMTP (for password resets)
- [ ] Test all critical user flows
- [ ] Verify payment processing works
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure custom domain (optional)
- [ ] Enable analytics (Google Analytics, Vercel Analytics)
- [ ] Test on mobile devices
- [ ] Run security audit

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Vite Docs**: https://vitejs.dev

---

## 🎉 You're Live!

Your e-commerce platform is now hosted and accessible worldwide!

**Frontend**: https://your-app.vercel.app
**Backend API**: https://your-api.onrender.com
**API Docs**: https://your-api.onrender.com/docs

Share your live URLs and start selling! 🛍️
