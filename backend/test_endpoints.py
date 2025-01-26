import requests
import json
import uuid
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, expected_status=200):
    url = f"{BASE_URL}{endpoint}"
    print(f"\nTesting {method} {endpoint}")
    try:
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        assert response.status_code == expected_status
        return response.json()
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def run_tests():
    # Test health check
    test_endpoint("GET", "/healthz")

    # Create user
    user = test_endpoint("POST", "/users", {"username": "test_user"})
    if not user:
        print("Failed to create user, stopping tests")
        return
    
    user_id = user["id"]

    # Test user endpoints
    test_endpoint("GET", f"/users/{user_id}")
    test_endpoint("PUT", f"/users/{user_id}/language?language=zh")
    
    # Test balance endpoints
    test_endpoint("POST", f"/users/{user_id}/balance/add?amount=100&source=ad")
    test_endpoint("POST", f"/users/{user_id}/balance/deduct?amount=50&description=test")
    
    # Test experience endpoints
    test_endpoint("POST", f"/users/{user_id}/experience?xp_amount=100")
    test_endpoint("GET", f"/users/{user_id}/level")
    
    # Test products
    test_endpoint("GET", "/products")
    
    # Test readings
    reading_data = {
        "spread_type": "single",
        "cards": [{"name": "The Fool", "position": "present"}]
    }
    test_endpoint("POST", f"/readings/{user_id}", reading_data)
    test_endpoint("GET", f"/readings/{user_id}")
    
    # Test revenue
    test_endpoint("GET", "/revenue/summary")

if __name__ == "__main__":
    run_tests()
