#!/usr/bin/env python3
"""
Database migration script to create the dashboard table
"""

import os
import sys
from dotenv import load_dotenv

# Add the backend directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Backend'))

load_dotenv()

from app import app, db

def create_dashboard_table():
    """Create the dashboard table"""
    with app.app_context():
        # Create all tables
        db.create_all()
        print("Database tables created successfully!")
        print("Dashboard table should now be available.")

if __name__ == "__main__":
    create_dashboard_table() 