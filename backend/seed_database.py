"""
Database seeding script to populate the database with sample data.
Run with: python seed_database.py
"""

from app.database.database import SessionLocal, engine
from app.models.models import User, Category, Product, Coupon, Base
from datetime import datetime, timedelta
from decimal import Decimal
import random
from passlib.context import CryptContext

# Create password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def seed_database():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("📦 Database tables created successfully!")
    
    db = SessionLocal()
    
    try:
        # Clear existing data (optional)
        print("Seeding database...")
        
        # Create sample categories
        categories = [
            Category(
                name="Electronics",
                description="Electronic devices and gadgets",
                image_url="/uploads/categories/electronics.jpg"
            ),
            Category(
                name="Mobiles",
                description="Smartphones and related accessories",
                image_url="/uploads/categories/mobiles.jpg"
            ),
            Category(
                name="Laptops",
                description="Laptops and computing devices",
                image_url="/uploads/categories/laptops.jpg"
            ),
            Category(
                name="Fashion",
                description="Clothing and fashion accessories",
                image_url="/uploads/categories/fashion.jpg"
            ),
            Category(
                name="Home Appliances",
                description="Kitchen and home appliances",
                image_url="/uploads/categories/appliances.jpg"
            ),
            Category(
                name="Books",
                description="Physical and digital books",
                image_url="/uploads/categories/books.jpg"
            ),
            Category(
                name="Beauty",
                description="Beauty and personal care products",
                image_url="/uploads/categories/beauty.jpg"
            ),
            Category(
                name="Sports",
                description="Sports equipment and gear",
                image_url="/uploads/categories/sports.jpg"
            ),
            Category(
                name="Furniture",
                description="Home furniture and decor",
                image_url="/uploads/categories/furniture.jpg"
            ),
            Category(
                name="Groceries",
                description="Food and grocery items",
                image_url="/uploads/categories/groceries.jpg"
            ),
        ]
        
        for cat in categories:
            existing = db.query(Category).filter(Category.name == cat.name).first()
            if not existing:
                db.add(cat)
        
        db.commit()
        print("✓ Categories created")
        
        # Create sample products
        products_data = [
            # Electronics (4 products)
            {
                "category_name": "Electronics",
                "name": "Wireless Headphones Pro",
                "description": "Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality",
                "price": Decimal("16599.00"),
                "discount_percentage": 15,
                "stock": 100,
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Electronics",
                "name": "4K Webcam Pro",
                "description": "Professional 4K webcam with autofocus, ideal for streaming, video calls, and content creation",
                "price": Decimal("7469.00"),
                "discount_percentage": 10,
                "stock": 50,
                "image_url": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            {
                "category_name": "Electronics",
                "name": "Smart Watch Ultra",
                "description": "Advanced smartwatch with fitness tracking, heart rate monitor, GPS, and 7-day battery life",
                "price": Decimal("24999.00"),
                "discount_percentage": 12,
                "stock": 75,
                "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Electronics",
                "name": "Bluetooth Speaker",
                "description": "Portable waterproof speaker with 360° surround sound and 20-hour playtime",
                "price": Decimal("5499.00"),
                "discount_percentage": 18,
                "stock": 120,
                "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            
            # Mobiles (4 products)
            {
                "category_name": "Mobiles",
                "name": "Smartphone X Pro",
                "description": "Flagship smartphone with 5G support, 108MP camera, 8GB RAM, 256GB storage, and all-day battery",
                "price": Decimal("82999.00"),
                "discount_percentage": 5,
                "stock": 30,
                "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
                "rating": 4.7
            },
            {
                "category_name": "Mobiles",
                "name": "Budget Smartphone",
                "description": "Affordable smartphone with great performance, dual camera, 4GB RAM, 64GB storage",
                "price": Decimal("12999.00"),
                "discount_percentage": 10,
                "stock": 150,
                "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=500&fit=crop",
                "rating": 4.2
            },
            {
                "category_name": "Mobiles",
                "name": "Premium Phone Case",
                "description": "Durable premium phone case with military-grade protection and stylish design",
                "price": Decimal("2489.00"),
                "discount_percentage": 20,
                "stock": 200,
                "image_url": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop",
                "rating": 4.2
            },
            {
                "category_name": "Mobiles",
                "name": "Wireless Earbuds",
                "description": "True wireless earbuds with noise cancellation, touch controls, and 24-hour battery with case",
                "price": Decimal("7999.00"),
                "discount_percentage": 15,
                "stock": 90,
                "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            
            # Laptops (3 products)
            {
                "category_name": "Laptops",
                "name": "UltraBook Pro 15",
                "description": "Premium ultra-thin laptop with Intel i7, 16GB RAM, 512GB SSD, and stunning 4K display",
                "price": Decimal("107899.00"),
                "discount_percentage": 8,
                "stock": 20,
                "image_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Laptops",
                "name": "Gaming Laptop Beast",
                "description": "Powerful gaming laptop with RTX 4070, 32GB RAM, 1TB SSD, and 165Hz display",
                "price": Decimal("149999.00"),
                "discount_percentage": 5,
                "stock": 15,
                "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&h=500&fit=crop",
                "rating": 4.8
            },
            {
                "category_name": "Laptops",
                "name": "Student Laptop",
                "description": "Lightweight and affordable laptop perfect for students, with 8GB RAM and 256GB SSD",
                "price": Decimal("42999.00"),
                "discount_percentage": 12,
                "stock": 50,
                "image_url": "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            
            # Fashion (4 products)
            {
                "category_name": "Fashion",
                "name": "Premium Cotton T-Shirt",
                "description": "Comfortable 100% premium cotton t-shirt, available in multiple colors and sizes",
                "price": Decimal("1659.00"),
                "discount_percentage": 25,
                "stock": 150,
                "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
                "rating": 4.0
            },
            {
                "category_name": "Fashion",
                "name": "Denim Jeans Classic",
                "description": "Classic fit denim jeans with stretch fabric for ultimate comfort and style",
                "price": Decimal("3299.00"),
                "discount_percentage": 20,
                "stock": 100,
                "image_url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            {
                "category_name": "Fashion",
                "name": "Leather Jacket",
                "description": "Genuine leather jacket with modern design, perfect for all seasons",
                "price": Decimal("12999.00"),
                "discount_percentage": 15,
                "stock": 40,
                "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
                "rating": 4.7
            },
            {
                "category_name": "Fashion",
                "name": "Sneakers Sport",
                "description": "Comfortable sports sneakers with cushioned sole, perfect for running and casual wear",
                "price": Decimal("4999.00"),
                "discount_percentage": 30,
                "stock": 80,
                "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            
            # Home Appliances (4 products)
            {
                "category_name": "Home Appliances",
                "name": "Coffee Maker Deluxe",
                "description": "Premium programmable coffee maker with thermal carafe and auto-brew timer",
                "price": Decimal("6639.00"),
                "discount_percentage": 12,
                "stock": 40,
                "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Home Appliances",
                "name": "Air Purifier Smart",
                "description": "Smart air purifier with HEPA filter, removes 99.97% of allergens and pollutants",
                "price": Decimal("14999.00"),
                "discount_percentage": 10,
                "stock": 35,
                "image_url": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Home Appliances",
                "name": "Vacuum Cleaner Robot",
                "description": "Automatic robot vacuum cleaner with smart navigation and app control",
                "price": Decimal("24999.00"),
                "discount_percentage": 20,
                "stock": 25,
                "image_url": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            {
                "category_name": "Home Appliances",
                "name": "Microwave Oven",
                "description": "25L convection microwave oven with multiple cooking modes and auto-cook menus",
                "price": Decimal("8999.00"),
                "discount_percentage": 15,
                "stock": 45,
                "image_url": "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            
            # Books (4 products)
            {
                "category_name": "Books",
                "name": "Python Programming Guide",
                "description": "Comprehensive guide to learning Python programming from basics to advanced concepts",
                "price": Decimal("3319.00"),
                "discount_percentage": 15,
                "stock": 100,
                "image_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Books",
                "name": "Web Development Bible",
                "description": "Complete guide to modern web development with HTML, CSS, JavaScript, and React",
                "price": Decimal("2999.00"),
                "discount_percentage": 20,
                "stock": 80,
                "image_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Books",
                "name": "Data Science Handbook",
                "description": "Master data science with practical examples in machine learning and AI",
                "price": Decimal("3499.00"),
                "discount_percentage": 10,
                "stock": 60,
                "image_url": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&h=500&fit=crop",
                "rating": 4.7
            },
            {
                "category_name": "Books",
                "name": "Business Strategy",
                "description": "Learn proven business strategies and entrepreneurship principles for success",
                "price": Decimal("2499.00"),
                "discount_percentage": 25,
                "stock": 90,
                "image_url": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            
            # Beauty (4 products)
            {
                "category_name": "Beauty",
                "name": "Skincare Routine Set",
                "description": "Complete skincare routine with cleanser, toner, serum, and moisturizer for glowing skin",
                "price": Decimal("4149.00"),
                "discount_percentage": 30,
                "stock": 80,
                "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            {
                "category_name": "Beauty",
                "name": "Makeup Kit Professional",
                "description": "Professional makeup kit with eyeshadow palette, lipsticks, and brushes",
                "price": Decimal("5999.00"),
                "discount_percentage": 25,
                "stock": 50,
                "image_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Beauty",
                "name": "Hair Care Bundle",
                "description": "Complete hair care bundle with shampoo, conditioner, and hair serum for healthy hair",
                "price": Decimal("2999.00"),
                "discount_percentage": 20,
                "stock": 100,
                "image_url": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            {
                "category_name": "Beauty",
                "name": "Perfume Luxury",
                "description": "Luxury long-lasting perfume with elegant fragrance, perfect for any occasion",
                "price": Decimal("7499.00"),
                "discount_percentage": 15,
                "stock": 60,
                "image_url": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop",
                "rating": 4.7
            },
            
            # Sports (4 products)
            {
                "category_name": "Sports",
                "name": "Yoga Mat Premium",
                "description": "High-quality non-slip yoga mat with carrying strap, perfect for all yoga styles",
                "price": Decimal("3734.00"),
                "discount_percentage": 20,
                "stock": 60,
                "image_url": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            {
                "category_name": "Sports",
                "name": "Dumbbell Set",
                "description": "Adjustable dumbbell set 5-25kg, perfect for home workout and strength training",
                "price": Decimal("8999.00"),
                "discount_percentage": 15,
                "stock": 40,
                "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Sports",
                "name": "Running Shoes Pro",
                "description": "Professional running shoes with advanced cushioning and breathable mesh",
                "price": Decimal("6499.00"),
                "discount_percentage": 25,
                "stock": 70,
                "image_url": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Sports",
                "name": "Fitness Tracker Band",
                "description": "Smart fitness tracker with heart rate monitor, sleep tracking, and waterproof design",
                "price": Decimal("4999.00"),
                "discount_percentage": 18,
                "stock": 85,
                "image_url": "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            
            # Furniture (4 products)
            {
                "category_name": "Furniture",
                "name": "Office Chair Ergonomic",
                "description": "Ergonomic office chair with lumbar support, adjustable height, and breathable mesh",
                "price": Decimal("14999.00"),
                "discount_percentage": 10,
                "stock": 30,
                "image_url": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Furniture",
                "name": "Study Desk Modern",
                "description": "Modern study desk with storage drawers and cable management system",
                "price": Decimal("12999.00"),
                "discount_percentage": 15,
                "stock": 25,
                "image_url": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            {
                "category_name": "Furniture",
                "name": "Sofa Set Premium",
                "description": "Premium 3-seater sofa set with comfortable cushions and elegant design",
                "price": Decimal("49999.00"),
                "discount_percentage": 12,
                "stock": 15,
                "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Furniture",
                "name": "Bookshelf Wooden",
                "description": "Solid wood bookshelf with 5 tiers, perfect for books and decorative items",
                "price": Decimal("9999.00"),
                "discount_percentage": 20,
                "stock": 35,
                "image_url": "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            
            # Groceries (4 products)
            {
                "category_name": "Groceries",
                "name": "Organic Tea Collection",
                "description": "Premium organic tea collection with green tea, black tea, and herbal varieties",
                "price": Decimal("1499.00"),
                "discount_percentage": 10,
                "stock": 200,
                "image_url": "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Groceries",
                "name": "Dry Fruits Premium Mix",
                "description": "Premium quality mixed dry fruits including almonds, cashews, and raisins - 1kg pack",
                "price": Decimal("2499.00"),
                "discount_percentage": 15,
                "stock": 150,
                "image_url": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Groceries",
                "name": "Honey Pure Raw",
                "description": "100% pure raw honey, naturally sourced and unprocessed - 500g bottle",
                "price": Decimal("899.00"),
                "discount_percentage": 5,
                "stock": 180,
                "image_url": "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=500&h=500&fit=crop",
                "rating": 4.7
            },
            {
                "category_name": "Groceries",
                "name": "Olive Oil Extra Virgin",
                "description": "Premium extra virgin olive oil, cold-pressed for cooking and salads - 1L",
                "price": Decimal("1899.00"),
                "discount_percentage": 12,
                "stock": 100,
                "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            
            # Additional Electronics Products
            {
                "category_name": "Electronics",
                "name": "Mechanical Keyboard RGB",
                "description": "Professional mechanical gaming keyboard with RGB backlight and customizable keys",
                "price": Decimal("6999.00"),
                "discount_percentage": 15,
                "stock": 60,
                "image_url": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Electronics",
                "name": "Wireless Mouse Pro",
                "description": "Ergonomic wireless mouse with precision sensor and long battery life",
                "price": Decimal("2999.00"),
                "discount_percentage": 20,
                "stock": 100,
                "image_url": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            {
                "category_name": "Electronics",
                "name": "USB-C Hub Multi-Port",
                "description": "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery",
                "price": Decimal("3499.00"),
                "discount_percentage": 10,
                "stock": 80,
                "image_url": "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            
            # Additional Mobiles Products
            {
                "category_name": "Mobiles",
                "name": "Fast Wireless Charger",
                "description": "15W fast wireless charging pad compatible with all Qi-enabled devices",
                "price": Decimal("1999.00"),
                "discount_percentage": 25,
                "stock": 120,
                "image_url": "https://images.unsplash.com/photo-1591290619762-d00bcaf2f0a1?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            {
                "category_name": "Mobiles",
                "name": "Power Bank 20000mAh",
                "description": "High-capacity portable charger with fast charging and LED display",
                "price": Decimal("3499.00"),
                "discount_percentage": 15,
                "stock": 90,
                "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Mobiles",
                "name": "Tempered Glass Screen Protector",
                "description": "Anti-scratch 9H hardness tempered glass with oil-resistant coating",
                "price": Decimal("599.00"),
                "discount_percentage": 30,
                "stock": 200,
                "image_url": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500&h=500&fit=crop",
                "rating": 4.2
            },
            
            # Additional Laptops Products
            {
                "category_name": "Laptops",
                "name": "2-in-1 Convertible Laptop",
                "description": "Versatile touchscreen laptop that converts to tablet mode, Intel i5, 8GB RAM",
                "price": Decimal("54999.00"),
                "discount_percentage": 10,
                "stock": 35,
                "image_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            {
                "category_name": "Laptops",
                "name": "MacBook Alternative Pro",
                "description": "Premium aluminum laptop with M2 chip competitor, 16GB RAM, 512GB SSD",
                "price": Decimal("95999.00"),
                "discount_percentage": 7,
                "stock": 25,
                "image_url": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&h=500&fit=crop",
                "rating": 4.7
            },
            {
                "category_name": "Laptops",
                "name": "Business Laptop Elite",
                "description": "Professional laptop with fingerprint scanner, 14-inch display, Intel i7, 16GB RAM",
                "price": Decimal("75999.00"),
                "discount_percentage": 8,
                "stock": 30,
                "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            
            # Additional Fashion Products
            {
                "category_name": "Fashion",
                "name": "Men's Casual Shirt",
                "description": "Premium cotton casual shirt perfect for everyday wear, multiple colors available",
                "price": Decimal("2499.00"),
                "discount_percentage": 20,
                "stock": 120,
                "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            {
                "category_name": "Fashion",
                "name": "Women's Formal Blazer",
                "description": "Elegant formal blazer for professional look, tailored fit",
                "price": Decimal("5999.00"),
                "discount_percentage": 25,
                "stock": 60,
                "image_url": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Fashion",
                "name": "Sports Cap Premium",
                "description": "Breathable sports cap with UV protection and adjustable strap",
                "price": Decimal("899.00"),
                "discount_percentage": 15,
                "stock": 150,
                "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop",
                "rating": 4.1
            },
            
            # Additional Home Appliances Products
            {
                "category_name": "Home Appliances",
                "name": "Electric Kettle Steel",
                "description": "Fast-boiling stainless steel electric kettle with auto shut-off, 1.8L capacity",
                "price": Decimal("2999.00"),
                "discount_percentage": 18,
                "stock": 70,
                "image_url": "https://images.unsplash.com/photo-1563297007-0686b7003af7?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            {
                "category_name": "Home Appliances",
                "name": "Blender Multi-Function",
                "description": "Powerful 750W blender with multiple jars and grinding attachments",
                "price": Decimal("4999.00"),
                "discount_percentage": 22,
                "stock": 50,
                "image_url": "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Home Appliances",
                "name": "Electric Iron Steam",
                "description": "Ceramic soleplate steam iron with vertical steam and anti-drip system",
                "price": Decimal("1999.00"),
                "discount_percentage": 15,
                "stock": 80,
                "image_url": "https://images.unsplash.com/photo-1560794897-52d5e64c6346?w=500&h=500&fit=crop",
                "rating": 4.2
            },
            
            # Additional Books Products
            {
                "category_name": "Books",
                "name": "JavaScript Complete Course",
                "description": "Master JavaScript from fundamentals to advanced ES6+ features with practical projects",
                "price": Decimal("2799.00"),
                "discount_percentage": 18,
                "stock": 70,
                "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Books",
                "name": "Digital Marketing Guide",
                "description": "Complete guide to digital marketing strategies, SEO, and social media",
                "price": Decimal("2299.00"),
                "discount_percentage": 20,
                "stock": 85,
                "image_url": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            {
                "category_name": "Books",
                "name": "Personal Finance Mastery",
                "description": "Learn wealth building, investing, and financial planning strategies",
                "price": Decimal("1999.00"),
                "discount_percentage": 25,
                "stock": 95,
                "image_url": "https://images.unsplash.com/photo-1554224311-beee460201e9?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            
            # Additional Beauty Products
            {
                "category_name": "Beauty",
                "name": "Face Serum Vitamin C",
                "description": "Brightening vitamin C serum with hyaluronic acid for glowing skin",
                "price": Decimal("2499.00"),
                "discount_percentage": 28,
                "stock": 90,
                "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Beauty",
                "name": "Nail Polish Set",
                "description": "Collection of 12 vibrant long-lasting nail polishes in trendy colors",
                "price": Decimal("1499.00"),
                "discount_percentage": 20,
                "stock": 100,
                "image_url": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            {
                "category_name": "Beauty",
                "name": "Body Lotion Moisturizing",
                "description": "Nourishing body lotion with shea butter and vitamin E for soft skin",
                "price": Decimal("1799.00"),
                "discount_percentage": 15,
                "stock": 110,
                "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            
            # Additional Sports Products
            {
                "category_name": "Sports",
                "name": "Resistance Bands Set",
                "description": "5-piece resistance bands kit for strength training and stretching",
                "price": Decimal("1999.00"),
                "discount_percentage": 22,
                "stock": 100,
                "image_url": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Sports",
                "name": "Cricket Bat Professional",
                "description": "English willow cricket bat with comfortable grip, ideal for professionals",
                "price": Decimal("8999.00"),
                "discount_percentage": 15,
                "stock": 30,
                "image_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&h=500&fit=crop",
                "rating": 4.7
            },
            {
                "category_name": "Sports",
                "name": "Gym Bag Duffel",
                "description": "Spacious gym bag with shoe compartment and water bottle holder",
                "price": Decimal("2499.00"),
                "discount_percentage": 20,
                "stock": 70,
                "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
                "rating": 4.3
            },
            
            # Additional Furniture Products
            {
                "category_name": "Furniture",
                "name": "Dining Table Set",
                "description": "Wooden dining table set for 6 people with comfortable chairs",
                "price": Decimal("35999.00"),
                "discount_percentage": 12,
                "stock": 15,
                "image_url": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Furniture",
                "name": "Wardrobe 3-Door",
                "description": "Spacious 3-door wardrobe with mirror and multiple compartments",
                "price": Decimal("28999.00"),
                "discount_percentage": 14,
                "stock": 20,
                "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Furniture",
                "name": "TV Unit Modern",
                "description": "Contemporary TV unit with storage drawers for up to 55-inch TVs",
                "price": Decimal("15999.00"),
                "discount_percentage": 18,
                "stock": 25,
                "image_url": "https://images.unsplash.com/photo-1588854337115-1c67d9247e4d?w=500&h=500&fit=crop",
                "rating": 4.4
            },
            
            # Additional Groceries Products
            {
                "category_name": "Groceries",
                "name": "Organic Quinoa",
                "description": "Premium organic quinoa rich in protein and fiber - 1kg pack",
                "price": Decimal("899.00"),
                "discount_percentage": 8,
                "stock": 150,
                "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&h=500&fit=crop",
                "rating": 4.5
            },
            {
                "category_name": "Groceries",
                "name": "Peanut Butter Creamy",
                "description": "All-natural creamy peanut butter with no added sugar - 500g jar",
                "price": Decimal("649.00"),
                "discount_percentage": 10,
                "stock": 180,
                "image_url": "https://images.unsplash.com/photo-1593457377795-b0b05c2b4bfd?w=500&h=500&fit=crop",
                "rating": 4.6
            },
            {
                "category_name": "Groceries",
                "name": "Himalayan Pink Salt",
                "description": "Pure Himalayan pink salt with 84 trace minerals - 500g pack",
                "price": Decimal("399.00"),
                "discount_percentage": 5,
                "stock": 200,
                "image_url": "https://images.unsplash.com/photo-1579130781921-76e18892b57b?w=500&h=500&fit=crop",
                "rating": 4.4
            },
        ]
        
        for product_data in products_data:
            category = db.query(Category).filter(
                Category.name == product_data["category_name"]
            ).first()
            
            if category:
                existing = db.query(Product).filter(
                    Product.name == product_data["name"]
                ).first()
                
                if not existing:
                    discount_price = None
                    if product_data["discount_percentage"] > 0:
                        discount_price = product_data["price"] * (
                            1 - Decimal(product_data["discount_percentage"]) / 100
                        )
                    
                    product = Product(
                        category_id=category.id,
                        name=product_data["name"],
                        description=product_data["description"],
                        price=product_data["price"],
                        discount_percentage=product_data["discount_percentage"],
                        discount_price=discount_price,
                        stock=product_data["stock"],
                        image_url=product_data["image_url"],
                        rating=product_data["rating"]
                    )
                    db.add(product)
        
        db.commit()
        print("✓ Products created")
        
        # Create test users
        users_data = [
            {
                "username": "admin",
                "email": "admin@ecommerce.com",
                "password": "Admin123456",
                "is_admin": True,
                "is_active": True
            },
            {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "John123456",
                "is_admin": False,
                "is_active": True
            },
            {
                "username": "jane_smith",
                "email": "jane@example.com",
                "password": "Jane123456",
                "is_admin": False,
                "is_active": True
            }
        ]
        
        for user_data in users_data:
            existing = db.query(User).filter(
                (User.username == user_data["username"]) | (User.email == user_data["email"])
            ).first()
            
            if not existing:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    password_hash=hash_password(user_data["password"]),
                    is_admin=user_data.get("is_admin", False),
                    is_active=user_data.get("is_active", True)
                )
                db.add(user)
        
        db.commit()
        print("✓ Test users created")
        
        # Create sample coupons
        coupons_data = [
            {
                "code": "SAVE10",
                "description": "Save 10% on all products",
                "discount_percentage": 10,
                "min_purchase_amount": Decimal("50"),
                "usage_limit": 100,
                "valid_from": datetime.utcnow(),
                "valid_until": datetime.utcnow() + timedelta(days=30),
                "is_active": True
            },
            {
                "code": "WELCOME20",
                "description": "20% off for new customers",
                "discount_percentage": 20,
                "min_purchase_amount": Decimal("100"),
                "usage_limit": 50,
                "valid_from": datetime.utcnow(),
                "valid_until": datetime.utcnow() + timedelta(days=7),
                "is_active": True
            },
            {
                "code": "FLASH50",
                "description": "50% off selected items",
                "discount_amount": Decimal("50"),
                "min_purchase_amount": Decimal("0"),
                "max_discount_amount": Decimal("100"),
                "usage_limit": 200,
                "valid_from": datetime.utcnow(),
                "valid_until": datetime.utcnow() + timedelta(days=1),
                "is_active": True
            },
        ]
        
        for coupon_data in coupons_data:
            existing = db.query(Coupon).filter(
                Coupon.code == coupon_data["code"]
            ).first()
            
            if not existing:
                coupon = Coupon(**coupon_data)
                db.add(coupon)
        
        db.commit()
        print("✓ Coupons created")
        
        print("\n✅ Database seeded successfully!")
        print("\n📝 Note: Create user accounts via the registration page")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
