#!/usr/bin/env python3
"""
Startup script to ensure database tables are created
"""

import os
import time
import sys
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

load_dotenv()

def wait_for_database():
    """Wait for database to be ready"""
    print("Waiting for database to be ready...")
    
    # Try to import and connect to database
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            from app import app, db
            with app.app_context():
                # Try to create tables
                db.create_all()
                print("✅ Database tables created successfully!")
                return True
        except Exception as e:
            retry_count += 1
            print(f"Attempt {retry_count}/{max_retries}: Database not ready yet... ({e})")
            time.sleep(2)
    
    print("❌ Failed to connect to database after maximum retries")
    return False

if __name__ == "__main__":
    if wait_for_database():
        print("🚀 Database is ready! Starting application...")
        sys.exit(0)
    else:
        print("💥 Failed to initialize database")
        sys.exit(1) 
