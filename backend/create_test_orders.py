import sys
sys.path.insert(0, '/workspaces/ecommerce-platfrom-/backend')

from app.database.database import SessionLocal
from app.models.models import Order, OrderItem, OrderStatus, Product
from decimal import Decimal
import random
import string

def generate_order_number():
    import datetime
    date_str = datetime.datetime.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{date_str}-{random_str}"

db = SessionLocal()

try:
    # Get all users
    from app.models.models import User
    users = db.query(User).all()
    print(f"Found {len(users)} users")
    
    # Get some products
    products = db.query(Product).limit(10).all()
    print(f"Found {len(products)} products")
    
    # Create orders for user 1 (admin) and user 2 (john_doe) if they don't have orders yet
    for user_id in [1, 2]:
        existing = db.query(Order).filter(Order.user_id == user_id).first()
        if existing:
            print(f"User {user_id} already has orders, skipping")
            continue
            
        # Create 2 orders per user
        for i in range(2):
            # Pick random products
            selected_products = random.sample(products, 3)
            
            subtotal = Decimal('0')
            order_items_data = []
            
            for product in selected_products:
                quantity = random.randint(1, 3)
                price = Decimal(str(product.discount_price or product.price))
                subtotal += price * quantity
                order_items_data.append({
                    'product_id': product.id,
                    'quantity': quantity,
                    'price': float(price)
                })
            
            shipping_cost = Decimal('50.00')
            tax = subtotal * Decimal('0.18')
            total = subtotal + shipping_cost + tax
            
            # Create order
            order = Order(
                user_id=user_id,
                order_number=generate_order_number(),
                shipping_address=f"123 Test Street, Test City, Test State - 123456",
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                tax=tax,
                total=total,
                status=OrderStatus.PENDING,
                payment_status='pending'
            )
            db.add(order)
            db.flush()
            
            # Add order items
            for item_data in order_items_data:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=item_data['product_id'],
                    quantity=item_data['quantity'],
                    price=item_data['price']
                )
                db.add(order_item)
            
            print(f"Created order {order.order_number} for user {user_id} with {len(order_items_data)} items, total: ₹{total}")
    
    db.commit()
    print("✅ Test orders created successfully!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
finally:
    db.close()
