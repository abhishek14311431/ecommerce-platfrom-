from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import (
    UserRegister, UserLogin, TokenResponse, UserUpdate, UserProfile,
    ForgotPasswordRequest, ResetPasswordRequest, PasswordResetSuccess
)
from app.services.auth_service import AuthService
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    user = AuthService.register_user(user_data, db)
    token_response = AuthService.create_token(user)
    return token_response


@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user with email or username."""
    user = AuthService.authenticate_user(login_data, db)
    token_response = AuthService.create_token(user)
    return token_response


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@router.put("/me", response_model=UserProfile)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    if user_update.phone:
        current_user.phone = user_update.phone
    if user_update.address:
        current_user.address = user_update.address
    if user_update.city:
        current_user.city = user_update.city
    if user_update.state:
        current_user.state = user_update.state
    if user_update.postal_code:
        current_user.postal_code = user_update.postal_code
    if user_update.country:
        current_user.country = user_update.country
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.post("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password."""
    AuthService.change_password(current_user, old_password, new_password, db)
    return {"message": "Password changed successfully"}


@router.post("/forgot-password", response_model=PasswordResetSuccess)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """Request password reset token."""
    message = AuthService.request_password_reset(request.email, db)
    return {"message": message}


@router.post("/reset-password", response_model=PasswordResetSuccess)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password using token."""
    message = AuthService.reset_password(request.token, request.new_password, db)
    return {"message": message}
