"""Test file to verify all required dependencies are properly installed."""
import pytest
from datetime import datetime
import pytz
from fastapi.testclient import TestClient
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos
from flatlib.chart import Chart

from app.main import app, db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    """Setup test database before each test."""
    # Initialize collections
    db["users"] = {}
    db["products"] = {}
    db["transactions"] = []
    db["revenue"] = []
    db["charts"] = {}
    
    yield
    
    # Cleanup after test
    db["users"].clear()
    db["products"].clear()
    db["transactions"].clear()
    db["revenue"].clear()
    db["charts"].clear()

def test_imports():
    """Verify that all required dependencies can be imported."""
    print('Successfully imported Flatlib dependencies')

def test_insufficient_balance():
    """Test premium unlock with insufficient balance."""
    # Create user with insufficient balance
    user_response = client.post(
        "/users",
        json={"username": "poor_user"}
    )
    assert user_response.status_code == 200
    user_data = user_response.json()
    
    # Add insufficient balance
    balance_response = client.post(
        f"/users/{user_data['id']}/balance/add",
        params={"amount": 1000, "source": "test"}  # Less than required 2000
    )
    assert balance_response.status_code == 200
    
    # Create chart
    chart_id = test_create_chart()
    
    # Try to unlock premium
    response = client.post(
        f"/charts/{chart_id}/unlock-premium",
        json={"user_id": user_data['id']}
    )
    assert response.status_code == 402  # Payment Required
    assert "insufficient balance" in response.json()["detail"].lower()

def test_product_purchase():
    """Test product purchase functionality."""
    # Create user with sufficient balance
    user_response = client.post(
        "/users",
        json={"username": "rich_user"}
    )
    assert user_response.status_code == 200
    user_data = user_response.json()
    
    # Add sufficient balance
    balance_response = client.post(
        f"/users/{user_data['id']}/balance/add",
        params={"amount": 5000, "source": "test"}
    )
    assert balance_response.status_code == 200
    
    # Attempt to purchase non-existent product
    response = client.post(
        "/products/invalid-product/purchase",
        json={"user_id": user_data['id'], "product_id": "invalid-product"}
    )
    assert response.status_code == 404
    assert "product not found" in response.json()["detail"].lower()
    
    # Create test product
    product_id = "test-spread"
    db["products"][product_id] = {
        "id": product_id,
        "name": "Test Spread",
        "price": 1000,
        "type": "spread"
    }
    
    # Purchase product
    response = client.post(
        f"/products/{product_id}/purchase",
        json={"user_id": user_data['id'], "product_id": product_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["balance"] == 4000  # 5000 - 1000
    assert product_id in data["purchased_products"]
    assert data["experience"] >= 50  # Should get XP for purchase
    
    # Try to purchase same product again
    response = client.post(
        f"/products/{product_id}/purchase",
        json={"user_id": user_data['id'], "product_id": product_id}
    )
    assert response.status_code == 400
    assert "already owns" in response.json()["detail"].lower()
    
    # Verify transaction recorded
    transactions = db["transactions"]
    assert any(
        t["user_id"] == user_data['id'] and 
        t["amount"] == -1000 and
        t["type"] == "purchase"
        for t in transactions
    )
    
    # Verify revenue recorded
    revenue = db["revenue"]
    assert any(
        r["source"] == "purchase" and
        r["amount"] == 10.0  # 1000 coins = $10
        for r in revenue
    )

def test_network_errors():
    """Test handling of network and server errors."""
    # Test invalid chart ID
    response = client.post(
        "/charts/invalid-id/unlock-premium",
        json={"user_id": "test_user_123"}
    )
    assert response.status_code == 404
    assert "chart not found" in response.json()["detail"].lower()
    
    # Test invalid user ID
    response = client.post(
        f"/charts/{test_create_chart()}/unlock-premium",
        json={"user_id": "invalid-user"}
    )
    assert response.status_code == 404
    assert "user not found" in response.json()["detail"].lower()
    
    # Test malformed JSON
    response = client.post(
        "/charts/create",
        data="invalid json",
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 422

def test_missing_required_fields():
    """Test chart creation with missing required fields."""
    # Test missing birth_date
    response = client.post(
        "/charts/create",
        json={
            "birth_time": "12:00",
            "latitude": 0,
            "longitude": 0,
            "timezone": "UTC"
        }
    )
    assert response.status_code == 422
    
    # Test missing birth_time
    response = client.post(
        "/charts/create",
        json={
            "birth_date": "1990-01-01",
            "latitude": 0,
            "longitude": 0,
            "timezone": "UTC"
        }
    )
    assert response.status_code == 422
    
    # Test missing latitude
    response = client.post(
        "/charts/create",
        json={
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "longitude": 0,
            "timezone": "UTC"
        }
    )
    assert response.status_code == 422
    
    # Test missing longitude
    response = client.post(
        "/charts/create",
        json={
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "latitude": 0,
            "timezone": "UTC"
        }
    )
    assert response.status_code == 422
    
    # Test missing timezone
    response = client.post(
        "/charts/create",
        json={
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "latitude": 0,
            "longitude": 0
        }
    )
    assert response.status_code == 422

def test_invalid_input_values():
    """Test chart creation with invalid input values."""
    # Test invalid latitude (out of range)
    response = client.post(
        "/charts/create",
        json={
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "latitude": 91,  # Invalid: > 90
            "longitude": 0,
            "timezone": "UTC"
        }
    )
    assert response.status_code == 422
    
    # Test invalid longitude (out of range)
    response = client.post(
        "/charts/create",
        json={
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "latitude": 0,
            "longitude": 181,  # Invalid: > 180
            "timezone": "UTC"
        }
    )
    assert response.status_code == 422
    
    # Test invalid timezone
    response = client.post(
        "/charts/create",
        json={
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "latitude": 0,
            "longitude": 0,
            "timezone": "Invalid/Timezone"
        }
    )
    assert response.status_code == 422
    
    # Test invalid date format
    response = client.post(
        "/charts/create",
        json={
            "birth_date": "1990/01/01",  # Wrong format
            "birth_time": "12:00",
            "latitude": 0,
            "longitude": 0,
            "timezone": "UTC"
        }
    )
    assert response.status_code == 422
    
    # Test invalid time format
    response = client.post(
        "/charts/create",
        json={
            "birth_date": "1990-01-01",
            "birth_time": "25:00",  # Invalid hour
            "latitude": 0,
            "longitude": 0,
            "timezone": "UTC"
        }
    )
    assert response.status_code == 422

def test_create_chart():
    """Test chart creation endpoint."""
    response = client.post(
        "/charts/create",
        json={
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "timezone": "America/New_York"
        }
    )
    assert response.status_code == 200
    data = response.json()
    
    # Verify basic fields
    assert "id" in data
    assert "basic_interpretation" in data
    assert not data["is_premium_unlocked"]
    assert data["premium_interpretation"] is None
    
    # Verify time calculations
    assert "standard_time" in data
    assert "solar_time" in data
    assert "solar_interpretation" in data
    
    # Verify planets data structure
    assert "planets" in data
    planets = data["planets"]
    # Only check for classical planets supported by Flatlib
    required_planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", 
                       "Jupiter", "Saturn"]
    for planet in required_planets:
        assert planet in planets
        planet_data = planets[planet]
        assert "sign" in planet_data
        assert "position" in planet_data
        assert "house" in planet_data
        assert isinstance(planet_data["position"], (int, float))
        assert 1 <= planet_data["house"] <= 12
    
    # Verify houses data structure
    assert "houses" in data
    houses = data["houses"]
    for i in range(1, 13):
        house = houses[str(i)]
        assert "sign" in house
        assert "position" in house
        assert isinstance(house["position"], (int, float))
        assert 0 <= house["position"] < 360
    
    return data["id"]

def test_unlock_premium():
    """Test premium chart interpretation unlock."""
    # First create a user with enough balance
    user_response = client.post(
        "/users",
        json={"username": "test_user"}
    )
    assert user_response.status_code == 200
    user_data = user_response.json()
    
    # Add balance to user
    balance_response = client.post(
        f"/users/{user_data['id']}/balance/add",
        params={"amount": 2000, "source": "test"}
    )
    assert balance_response.status_code == 200
    
    # Create a chart
    chart_id = test_create_chart()
    
    # Unlock premium interpretation
    response = client.post(
        f"/charts/{chart_id}/unlock-premium",
        json={"user_id": user_data['id']}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_premium_unlocked"]
    assert data["premium_interpretation"] is not None

if __name__ == '__main__':
    test_imports()
