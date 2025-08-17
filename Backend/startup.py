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
                
                # Check if pinned_panels column exists, add it if it doesn't
                try:
                    result = db.session.execute("""
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = 'dashboard' AND column_name = 'pinned_panels'
                    """)
                    
                    if not result.fetchone():
                        print("Adding 'pinned_panels' column to dashboard table...")
                        db.session.execute("""
                            ALTER TABLE dashboard 
                            ADD COLUMN pinned_panels TEXT
                        """)
                        db.session.commit()
                        print("✅ Successfully added 'pinned_panels' column")
                    else:
                        print("✅ 'pinned_panels' column already exists")
                        
                except Exception as e:
                    print(f"⚠️  Could not verify pinned_panels column: {e}")
                    # Continue anyway as this is not critical for startup
                
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
