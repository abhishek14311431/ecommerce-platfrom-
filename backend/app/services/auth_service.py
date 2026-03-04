from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from app.models.models import User, PasswordResetToken
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserProfile
from app.core.security import hash_password, verify_password, create_access_token
from fastapi import HTTPException, status
import re
import secrets


class AuthService:
    @staticmethod
    def register_user(user_data: UserRegister, db: Session) -> User:
        """Register a new user."""
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.email == user_data.email) | (User.username == user_data.username)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or username already registered"
            )
        
        # Validate email format
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Create user
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    
    @staticmethod
    def authenticate_user(login_data: UserLogin, db: Session) -> User:
        """Authenticate user and return user object."""
        # Find user by username or email
        user = db.query(User).filter(
            (User.username == login_data.username_or_email) | 
            (User.email == login_data.username_or_email)
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled"
            )
        
        return user
    
    @staticmethod
    def create_token(user: User) -> TokenResponse:
        """Create JWT token for user."""
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserProfile(
                id=user.id,
                username=user.username,
                email=user.email,
                phone=user.phone,
                address=user.address,
                city=user.city,
                state=user.state,
                postal_code=user.postal_code,
                country=user.country,
                created_at=user.created_at
            )
        )
    
    @staticmethod
    def change_password(user: User, old_password: str, new_password: str, db: Session) -> None:
        """Change user password."""
        if not verify_password(old_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password"
            )
        
        user.password_hash = hash_password(new_password)
        db.commit()
    
    @staticmethod
    def request_password_reset(email: str, db: Session) -> str:
        """Generate password reset token for user."""
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Don't reveal if email exists for security
            return "If email exists, password reset link sent to email"
        
        # Delete old tokens
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id
        ).delete()
        
        # Generate token
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=expires_at
        )
        
        db.add(reset_token)
        db.commit()
        
        # TODO: Send email with reset link
        # send_reset_email(user.email, token)
        
        return "If email exists, password reset link sent to email"
    
    @staticmethod
    def reset_password(token: str, new_password: str, db: Session) -> str:
        """Reset password using token."""
        reset_token = db.query(PasswordResetToken).filter(
            PasswordResetToken.token == token
        ).first()
        
        if not reset_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )
        
        if datetime.utcnow() > reset_token.expires_at:
            db.delete(reset_token)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired"
            )
        
        user = db.query(User).filter(User.id == reset_token.user_id).first()
        user.password_hash = hash_password(new_password)
        
        db.delete(reset_token)
        db.commit()
        
        return "Password reset successfully"
