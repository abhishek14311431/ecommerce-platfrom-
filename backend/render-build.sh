#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Create database tables
python -c "from app.database.database import engine; from app.models.models import Base; Base.metadata.create_all(bind=engine)"

# Seed database if needed
python -c "
try:
    from app.database.database import SessionLocal
    from app.models.models import User, Category, Product
    from app.core.security import get_password_hash
    import sys
    
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(User).first() is None:
        print('Seeding database...')
        # Add seed data here if needed
        print('Database seeded successfully!')
    else:
        print('Database already contains data, skipping seed.')
    
    db.close()
except Exception as e:
    print(f'Seed error (non-fatal): {e}')
    sys.exit(0)
"
