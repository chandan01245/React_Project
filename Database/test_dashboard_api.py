#!/usr/bin/env python3
"""
Test script to verify dashboard API endpoints
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

# Add the backend directory to the path so we can import the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Backend'))

load_dotenv()

# API base URL
API_BASE = "http://localhost:5000"

def test_dashboard_api():
    """Test the dashboard API endpoints"""
    print("Testing Dashboard API Endpoints...")
    
    # Test data
    test_user_data = {
        "email": "api_test@example.com",
        "password": "testpassword123",
        "username": "api_tester",
        "user_group": "viewer"
    }
    
    test_panels = [
        {
            "id": "api-panel-1",
            "title": "API Test Panel 1",
            "src": "http://example.com/api-panel1",
            "layout": {"x": 0, "y": 0, "w": 6, "h": 3, "minW": 3, "minH": 3}
        },
        {
            "id": "api-panel-2",
            "title": "API Test Panel 2", 
            "src": "http://example.com/api-panel2",
            "layout": {"x": 6, "y": 0, "w": 6, "h": 3, "minW": 3, "minH": 3}
        }
    ]
    
    try:
        # 1. Create a test user
        print("\n1. Creating test user...")
        create_response = requests.post(f"{API_BASE}/api/users", json=test_user_data)
        if create_response.status_code == 201:
            print("✅ User created successfully")
        else:
            print(f"❌ Failed to create user: {create_response.status_code} - {create_response.text}")
            return False
        
        # 2. Login to get JWT token
        print("\n2. Logging in to get JWT token...")
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        login_response = requests.post(f"{API_BASE}/app/login", json=login_data)
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            if token:
                print("✅ Login successful, got JWT token")
            else:
                print("❌ No token in login response")
                return False
        else:
            print(f"❌ Login failed: {login_response.status_code} - {login_response.text}")
            return False
        
        # 3. Test saving dashboard
        print("\n3. Testing dashboard save...")
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        save_response = requests.post(f"{API_BASE}/app/dashboard", 
                                   json={"panels": test_panels}, 
                                   headers=headers)
        if save_response.status_code == 200:
            print("✅ Dashboard saved successfully")
        else:
            print(f"❌ Failed to save dashboard: {save_response.status_code} - {save_response.text}")
            return False
        
        # 4. Test loading dashboard
        print("\n4. Testing dashboard load...")
        load_response = requests.get(f"{API_BASE}/app/dashboard", headers=headers)
        if load_response.status_code == 200:
            loaded_data = load_response.json()
            if 'panels' in loaded_data:
                panels = loaded_data['panels']
                print(f"✅ Dashboard loaded successfully with {len(panels)} panels")
                print(f"   - First panel title: {panels[0]['title']}")
                print(f"   - Second panel title: {panels[1]['title']}")
            else:
                print("❌ No panels in loaded dashboard")
                return False
        else:
            print(f"❌ Failed to load dashboard: {load_response.status_code} - {load_response.text}")
            return False
        
        # 5. Test updating dashboard
        print("\n5. Testing dashboard update...")
        updated_panels = [
            {
                "id": "api-panel-1",
                "title": "Updated API Test Panel",
                "src": "http://example.com/updated-api-panel",
                "layout": {"x": 0, "y": 0, "w": 8, "h": 4, "minW": 3, "minH": 3}
            }
        ]
        
        update_response = requests.post(f"{API_BASE}/app/dashboard", 
                                     json={"panels": updated_panels}, 
                                     headers=headers)
        if update_response.status_code == 200:
            print("✅ Dashboard updated successfully")
        else:
            print(f"❌ Failed to update dashboard: {update_response.status_code} - {update_response.text}")
            return False
        
        # 6. Verify update
        print("\n6. Verifying dashboard update...")
        verify_response = requests.get(f"{API_BASE}/app/dashboard", headers=headers)
        if verify_response.status_code == 200:
            verify_data = verify_response.json()
            if 'panels' in verify_data:
                panels = verify_data['panels']
                if len(panels) == 1 and panels[0]['title'] == "Updated API Test Panel":
                    print("✅ Dashboard update verified successfully")
                else:
                    print("❌ Dashboard update verification failed")
                    return False
            else:
                print("❌ No panels in updated dashboard")
                return False
        else:
            print(f"❌ Failed to verify dashboard update: {verify_response.status_code}")
            return False
        
        # 7. Clean up test user
        print("\n7. Cleaning up test user...")
        cleanup_response = requests.delete(f"{API_BASE}/api/users/{test_user_data['email']}")
        if cleanup_response.status_code == 200:
            print("✅ Test user cleaned up successfully")
        else:
            print(f"⚠️  Failed to clean up test user: {cleanup_response.status_code}")
        
        print("\n🎉 All dashboard API tests passed!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure the backend is running on localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Starting Dashboard API Tests...")
    print(f"API Base URL: {API_BASE}")
    print("Make sure the backend is running and accessible!")
    
    success = test_dashboard_api()
    if success:
        print("\n✅ All dashboard API tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some dashboard API tests failed!")
        sys.exit(1)
