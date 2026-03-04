from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.schemas import Payment, StripeCheckoutSession
from app.services.payment_service import PaymentService
from app.core.security import get_current_user, get_current_admin_user
from app.models.models import User

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.post("/stripe/checkout", response_model=StripeCheckoutSession)
async def create_checkout_session(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create Stripe checkout session for order."""
    checkout_session = PaymentService.create_checkout_session(
        order_id,
        db,
        success_url="http://localhost:5173/checkout/success",
        cancel_url="http://localhost:5173/checkout/cancel"
    )
    
    return {
        "session_id": checkout_session["session_id"]
    }


@router.post("/stripe/verify", response_model=Payment)
async def verify_stripe_payment(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify Stripe payment."""
    payment = PaymentService.verify_payment(session_id, db)
    return payment


@router.get("/{payment_id}", response_model=Payment)
async def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get payment details."""
    payment = PaymentService.get_payment(payment_id, db)
    
    # Check if user owns the payment
    if payment.user_id != current_user.id and not current_user.is_admin:
        return {"detail": "Not authorized"}, 403
    
    return payment


@router.post("/{payment_id}/refund", response_model=Payment)
async def refund_payment(
    payment_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Refund a payment (admin only)."""
    payment = PaymentService.refund_payment(payment_id, db)
    return payment


@router.get("", response_model=dict)
async def get_payments(
    skip: int = Query(0),
    limit: int = Query(10),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all payments (admin only)."""
    from sqlalchemy.orm import Session as SessionType
    from app.models.models import Payment as PaymentModel
    
    db_session: SessionType = db
    query = db_session.query(PaymentModel)
    total = query.count()
    
    payments = query.order_by(PaymentModel.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": payments,
        "total": total,
        "skip": skip,
        "limit": limit
    }
