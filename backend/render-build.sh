#!/usr/bin/env bash
# exit on error
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Create database tables
python -c "from app.database.database import engine; from app.models.models import Base; Base.metadata.create_all(bind=engine)"

# Seed database (idempotent script: creates missing rows and keeps test users in sync)
python seed_database.py
