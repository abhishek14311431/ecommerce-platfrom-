from app.core.config import settings
from app.models.models import Payment, Order
from app.services.order_service import OrderService
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentService:
    @staticmethod
    def create_checkout_session(order_id: int, db: Session, success_url: str, cancel_url: str) -> dict:
        """Create Stripe checkout session."""
        order = OrderService.get_order_by_id(order_id, db)
        
        # Check if order already has a payment
        existing_payment = db.query(Payment).filter(Payment.order_id == order_id).first()
        if existing_payment and existing_payment.status == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order already paid"
            )
        
        try:
            # Prepare line items for Stripe
            line_items = []
            for item in order.items:
                line_items.append({
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": item.product.name,
                            "description": item.product.description,
                        },
                        "unit_amount": int(item.price * 100),  # Convert to cents
                    },
                    "quantity": item.quantity,
                })
            
            # Add shipping and tax as separate line items
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Shipping",
                    },
                    "unit_amount": int(order.shipping_cost * 100),
                },
                "quantity": 1,
            })
            
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Tax",
                    },
                    "unit_amount": int(order.tax * 100),
                },
                "quantity": 1,
            })
            
            # Create Stripe session
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=line_items,
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "order_id": order_id,
                }
            )
            
            # Create payment record
            payment = Payment(
                order_id=order_id,
                user_id=order.user_id,
                amount=order.total,
                currency="USD",
                status="pending",
                payment_method="stripe"
            )
            
            db.add(payment)
            db.commit()
            db.refresh(payment)
            
            return {
                "session_id": session.id,
                "client_secret": session.client_secret if hasattr(session, 'client_secret') else None,
                "url": session.url
            }
        
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(e)}"
            )
    
    @staticmethod
    def verify_payment(stripe_payment_id: str, db: Session) -> Payment:
        """Verify payment from Stripe."""
        try:
            session = stripe.checkout.Session.retrieve(stripe_payment_id)
            
            if session.payment_status != "paid":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Payment not completed"
                )
            
            order_id = session.metadata.get("order_id")
            payment = db.query(Payment).filter(
                (Payment.order_id == order_id)
            ).first()
            
            if not payment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Payment not found"
                )
            
            # Update payment status
            payment.status = "completed"
            payment.stripe_payment_id = stripe_payment_id
            
            # Update order status
            order = OrderService.get_order_by_id(order_id, db)
            order.payment_status = "completed"
            
            db.commit()
            db.refresh(payment)
            
            return payment
        
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe error: {str(e)}"
            )
    
    @staticmethod
    def get_payment(payment_id: int, db: Session) -> Payment:
        """Get payment by ID."""
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        return payment
    
    @staticmethod
    def refund_payment(payment_id: int, db: Session) -> Payment:
        """Refund a payment."""
        payment = PaymentService.get_payment(payment_id, db)
        
        if payment.status != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only completed payments can be refunded"
            )
        
        try:
            if payment.stripe_payment_id:
                # Find charge from session
                session = stripe.checkout.Session.retrieve(payment.stripe_payment_id)
                if session.payment_intent:
                    charge_id = session.payment_intent
                    # Refund the charge
                    stripe.Refund.create(payment_intent=charge_id)
            
            # Update payment status
            payment.status = "refunded"
            db.commit()
            db.refresh(payment)
            
            return payment
        
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Refund error: {str(e)}"
            )
