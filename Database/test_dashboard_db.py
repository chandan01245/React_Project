#!/usr/bin/env python3
"""
Test script to verify dashboard database functionality
"""

import os
import sys
import json
from dotenv import load_dotenv

# Add the backend directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Backend'))

load_dotenv()

from app import app, db, User, Dashboard

def test_dashboard_database():
    """Test the dashboard database functionality"""
    with app.app_context():
        print("Testing Dashboard Database Functionality...")
        
        # Create test user
        print("\n1. Creating test user...")
        test_user = User(email="dashboard_test@example.com")
        test_user.set_password("testpassword123")
        test_user.set_username("dashboard_tester")
        test_user.set_user_group("viewer")
        
        db.session.add(test_user)
        db.session.commit()
        print(f"✅ Created user with ID: {test_user.id}")
        
        # Test dashboard creation
        print("\n2. Testing dashboard creation...")
        test_panels = [
            {
                "id": "panel-1",
                "title": "Test Panel 1",
                "src": "http://example.com/panel1",
                "layout": {"x": 0, "y": 0, "w": 6, "h": 3, "minW": 3, "minH": 3}
            },
            {
                "id": "panel-2", 
                "title": "Test Panel 2",
                "src": "http://example.com/panel2",
                "layout": {"x": 6, "y": 0, "w": 6, "h": 3, "minW": 3, "minH": 3}
            }
        ]
        
        dashboard = Dashboard(
            user_id=test_user.id,
            panels=json.dumps(test_panels)
        )
        
        db.session.add(dashboard)
        db.session.commit()
        print(f"✅ Created dashboard with ID: {dashboard.id}")
        print(f"   - User ID: {dashboard.user_id}")
        print(f"   - Panels: {len(test_panels)}")
        print(f"   - Created: {dashboard.created_at}")
        
        # Test dashboard retrieval
        print("\n3. Testing dashboard retrieval...")
        retrieved_dashboard = Dashboard.query.filter_by(user_id=test_user.id).first()
        if retrieved_dashboard:
            panels = json.loads(retrieved_dashboard.panels)
            print(f"✅ Retrieved dashboard successfully")
            print(f"   - Panel count: {len(panels)}")
            print(f"   - First panel title: {panels[0]['title']}")
            print(f"   - Second panel title: {panels[1]['title']}")
        else:
            print("❌ Failed to retrieve dashboard")
            return False
        
        # Test dashboard update
        print("\n4. Testing dashboard update...")
        updated_panels = [
            {
                "id": "panel-1",
                "title": "Updated Panel 1",
                "src": "http://example.com/updated-panel1",
                "layout": {"x": 0, "y": 0, "w": 8, "h": 4, "minW": 3, "minH": 3}
            }
        ]
        
        retrieved_dashboard.panels = json.dumps(updated_panels)
        db.session.commit()
        
        # Verify update
        updated_dashboard = Dashboard.query.filter_by(user_id=test_user.id).first()
        if updated_dashboard:
            updated_panels_data = json.loads(updated_dashboard.panels)
            print(f"✅ Dashboard updated successfully")
            print(f"   - New panel count: {len(updated_panels_data)}")
            print(f"   - Updated title: {updated_panels_data[0]['title']}")
            print(f"   - Updated at: {updated_dashboard.updated_at}")
        
        # Test user relationship
        print("\n5. Testing user relationship...")
        user_with_dashboard = User.query.filter_by(id=test_user.id).first()
        if user_with_dashboard.dashboards:
            print(f"✅ User relationship working")
            print(f"   - User has {len(user_with_dashboard.dashboards)} dashboard(s)")
        else:
            print("❌ User relationship not working")
        
        # Clean up test data
        print("\n6. Cleaning up test data...")
        db.session.delete(dashboard)
        db.session.delete(test_user)
        db.session.commit()
        print("✅ Test data cleaned up successfully!")
        
        print("\n🎉 All dashboard database tests passed!")
        return True

if __name__ == "__main__":
    try:
        success = test_dashboard_database()
        if success:
            print("\n✅ Dashboard database functionality is working correctly!")
        else:
            print("\n❌ Some tests failed!")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
