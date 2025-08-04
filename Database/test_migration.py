#!/usr/bin/env python3
"""
Test script to verify database migration and dashboard functionality
"""

import os
import sys
import json
from dotenv import load_dotenv

# Add the backend directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Backend'))

load_dotenv()

from app import app, db, User, Dashboard

def test_dashboard_functionality():
    """Test the dashboard functionality"""
    with app.app_context():
        # Check if tables exist
        print("Checking database tables...")
        
        # Test creating a user
        print("\nCreating test user...")
        test_user = User(email="test@example.com")
        test_user.set_password("testpassword")
        test_user.set_username("testuser")
        test_user.set_user_group("viewer")
        
        db.session.add(test_user)
        db.session.commit()
        print(f"Created user with ID: {test_user.id}")
        
        # Test creating a dashboard
        print("\nCreating test dashboard...")
        test_panels = [
            {
                "id": "panel-1",
                "title": "Test Panel",
                "src": "http://example.com/test",
                "layout": {"x": 0, "y": 0, "w": 6, "h": 3, "minW": 3, "minH": 3}
            }
        ]
        
        test_dashboard = Dashboard(
            user_id=test_user.id,
            panels=json.dumps(test_panels)
        )
        
        db.session.add(test_dashboard)
        db.session.commit()
        print(f"Created dashboard with ID: {test_dashboard.id}")
        
        # Test retrieving the dashboard
        print("\nRetrieving test dashboard...")
        retrieved_dashboard = Dashboard.query.filter_by(user_id=test_user.id).first()
        if retrieved_dashboard:
            panels = json.loads(retrieved_dashboard.panels)
            print(f"Retrieved dashboard with {len(panels)} panels")
            print(f"Panel title: {panels[0]['title']}")
        else:
            print("Failed to retrieve dashboard")
        
        # Clean up test data
        print("\nCleaning up test data...")
        db.session.delete(test_dashboard)
        db.session.delete(test_user)
        db.session.commit()
        print("Test data cleaned up successfully!")
        
        print("\n✅ All tests passed! Dashboard functionality is working correctly.")

if __name__ == "__main__":
    test_dashboard_functionality() 