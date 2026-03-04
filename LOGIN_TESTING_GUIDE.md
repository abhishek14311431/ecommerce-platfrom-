# Login Testing Guide

## ✅ Issue Fixed: Login Error Handling

The login page has been enhanced with:
1. **Clear Error Display** - Errors now appear on the form in a red box
2. **Test Credentials** - Display of test accounts directly on login page
3. **Input Validation** - Better handling of empty inputs
4. **Better UX** - Error clears when user starts typing

---

## 🧪 Test Credentials

Use these credentials to test the login functionality:

### Admin Account
- **Username/Email:** `admin`
- **Password:** `Admin123456`

### Regular User #1
- **Username/Email:** `john_doe`
- **Password:** `John123456`

### Regular User #2
- **Username/Email:** `jane_smith`
- **Password:** `Jane123456`

> These credentials are automatically seeded in the database when you run `python seed_database.py`

---

## 🔍 Troubleshooting Login Issues

### Issue: "Invalid username/email or password"

**Possible Causes:**

1. **User doesn't exist** - Use one of the test credentials above
2. **Wrong password** - Passwords are case-sensitive (e.g., "john123456" ≠ "John123456")
3. **Wrong username format** - Use either username OR email, not both
4. **Database not seeded** - Run: `cd backend && source venv/bin/activate && python seed_database.py`

### Issue: Login works but not redirecting

This means your authentication token is working! The issue might be:
- Frontend routing configuration
- Redux state update delay
- Browser cache issues (try clearing localStorage)

---

## 🚀 How to Register New Users

1. Go to the Register page
2. Fill in:
   - Username (min 3 characters)
   - Email (valid format)
   - Password (min 8 characters)
   - Confirm Password
   - Phone (optional)
3. Click "Create Account"
4. You'll be automatically logged in

**Password Requirements:**
- Minimum 8 characters
- Must be alphanumeric (recommended)
- Must match confirmation password

---

## 🔐 Security Notes

- Passwords are **bcrypt hashed** - never stored in plain text
- JWT tokens expire after **30 minutes**
- Login attempts are not rate-limited (consider adding in production)
- CORS is configured to allow `http://localhost:5173`

---

## 🛠️ Testing the API Directly

### Test Login via cURL:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email": "john_doe", "password": "John123456"}'
```

### Expected Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 2,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "+1987654321",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "USA",
    "created_at": "2026-03-04T09:05:53.982868"
  }
}
```

---

## 📱 Frontend Testing

### What Changed:

1. **LoginPage.tsx** now shows:
   - Test credentials on the login form
   - Clear error messages in red boxes
   - Show/hide password toggle
   - Better input validation
   - Error state clearing on typing

2. **Redux authSlice** properly handles:
   - Login success → store token + user
   - Login failure → display error
   - Error clearing on new attempt
   - Token persistence in localStorage

3. **API Service** properly:
   - Sends requests to `/api/auth/login`
   - Forwards to backend via Vite proxy
   - Handles CORS headers automatically

---

## 🐛 Debug Tips

### Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Check for any error messages
4. Redux DevTools extension helps see state changes

### Check Network Tab

1. Open DevTools → Network tab
2. Try to login
3. Look for `/api/auth/login` request
4. Check:
   - Status should be 200 (success) or 401 (invalid credentials)
   - Response body has access_token
   - Headers have Content-Type: application/json

### Check Local Storage

1. DevTools → Application tab
2. Click "Local Storage"
3. Look for:
   - `token` - JWT access token
   - `user` - User object (stringified JSON)

---

## 🎯 Quick Start

1. ✅ Database is seeded with test users
2. ✅ Backend running on `http://localhost:8000`
3. ✅ Frontend running on `http://localhost:5173`
4. ✅ Login page shows test credentials
5. 🧪 Try logging in with `john_doe` / `John123456`
6. 📊 Check localStorage for token after successful login

---

## 📧 Next Steps

After successful login:
- Browse products on homepage
- Add items to cart
- Proceed to checkout
- View your orders at `/orders` link in user menu

Enjoy your e-commerce platform! 🛍️
