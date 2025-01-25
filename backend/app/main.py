from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import math
import pytz
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos
from flatlib.chart import Chart
from flatlib import const

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Constants
PREMIUM_UNLOCK_COST = 2000  # Virtual currency cost to unlock premium interpretation

# Initialize in-memory database
db = {
    "users": {
        "test_user_123": {  # Test user for development
            "id": "test_user_123",
            "username": "Test User",
            "balance": 5000,  # Give test user enough balance for premium features
            "experience": 0,
            "purchased_products": [],
            "language": "en"
        }
    },
    "transactions": [],
    "revenue": [],
    "products": {
        "1": {
            "id": "1",
            "name": "完整韦特牌组",
            "description": "包含所有78张韦特牌的完整牌组",
            "price": 99,
            "image": "🎴"
        },
        "2": {
            "id": "2",
            "name": "专业牌阵解读",
            "description": "解锁更多专业牌阵和详细解读",
            "price": 49,
            "image": "📚"
        }
    },
    "charts": {},  # Store chart data with chart_id as key
    "readings": {}
}

# Chart-related models
from pydantic import validator

class ChartRequest(BaseModel):
    birth_date: str = Field(..., description="Birth date in YYYY-MM-DD format")
    birth_time: str = Field(..., description="Birth time in HH:MM format (24-hour)")
    latitude: float = Field(..., ge=-90, le=90, description="Birth place latitude (-90 to 90)")
    longitude: float = Field(..., ge=-180, le=180, description="Birth place longitude (-180 to 180)")
    timezone: str = Field(..., description="Timezone name (e.g., 'America/New_York')")

    @validator('timezone')
    def validate_timezone(cls, v):
        try:
            pytz.timezone(v)
            return v
        except pytz.exceptions.UnknownTimeZoneError:
            raise ValueError(f"Invalid timezone: {v}")

    @validator('birth_date')
    def validate_birth_date(cls, v):
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Invalid date format. Use YYYY-MM-DD")

    @validator('birth_time')
    def validate_birth_time(cls, v):
        try:
            datetime.strptime(v, "%H:%M")
            return v
        except ValueError:
            raise ValueError("Invalid time format. Use HH:MM (24-hour)")

class ChartResponse(BaseModel):
    id: str
    date: str
    time: str
    latitude: float
    longitude: float
    planets: Dict[str, Dict[str, Any]]
    houses: Dict[str, Dict[str, Any]]
    basic_interpretation: str
    is_premium_unlocked: bool = False
    premium_interpretation: Optional[str] = None
    standard_time: str
    solar_time: str
    solar_interpretation: str

class ChartUnlockRequest(BaseModel):
    user_id: str = Field(..., description="User ID to charge for premium unlock")

def calculate_true_solar_time(dt: datetime, longitude: float, chart: Chart) -> tuple[datetime, str]:
    """Calculate true solar time using Flatlib's sun position."""
    try:
        # Get sun position from chart
        sun = chart.get(const.SUN)
        
        # Calculate mean solar time offset based on longitude
        # Each degree of longitude equals 4 minutes of time
        longitude_offset = longitude * 4 * 60  # Convert to seconds
        
        # Get equation of time from sun's position
        # This accounts for the eccentricity of Earth's orbit
        sun_lon = float(sun.lon)  # Get sun's ecliptic longitude
        
        # Calculate equation of time using a simplified formula
        # This approximation is based on astronomical algorithms
        eot_minutes = -7.658 * math.sin(math.radians(sun_lon)) \
                     + 9.863 * math.sin(2 * math.radians(sun_lon + 3.58))
        
        # Convert to seconds
        eot_seconds = eot_minutes * 60
        
        # Total time offset
        total_offset = longitude_offset + eot_seconds
        solar_time = dt + timedelta(seconds=total_offset)
        
        # Format interpretation
        interpretation = (
            f"True Solar Time is {solar_time.strftime('%H:%M:%S')} "
            f"({abs(total_offset / 60):.1f} minutes "
            f"{'ahead of' if total_offset > 0 else 'behind'} standard time). "
            f"Equation of time correction: {eot_minutes:.1f} minutes."
        )
        
        return solar_time, interpretation
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to calculate true solar time: {str(e)}"
        )

def interpret_chart(chart: Chart, is_premium: bool = False) -> Dict[str, Optional[str]]:
    """Generate chart interpretation."""
    basic = []
    premium = []
    
    # Basic interpretation - Sun, Moon, Ascendant
    sun = chart.get('Sun')
    moon = chart.get('Moon')
    asc = chart.get('Asc')
    
    basic.append(f"Sun in {sun.sign} ({sun.signlon:.1f}°)")
    basic.append(f"Moon in {moon.sign} ({moon.signlon:.1f}°)")
    basic.append(f"Ascendant in {asc.sign} ({asc.signlon:.1f}°)")
    
    if is_premium:
        # Premium interpretation - Classical planets only
        classical_planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
        
        # Get positions for classical planets
        for planet in classical_planets:
            obj = chart.get(planet)
            premium.append(f"{planet} in {obj.sign} ({obj.signlon:.1f}°)")
        
        # Define major aspects and their angles
        major_aspects = {
            0: 'Conjunction',   # 0°
            60: 'Sextile',     # 60°
            90: 'Square',      # 90°
            120: 'Trine',      # 120°
            180: 'Opposition'  # 180°
        }
        
        # Calculate aspects between classical planets using direct longitude comparison
        for i, p1 in enumerate(classical_planets):
            obj1 = chart.get(p1)
            for p2 in classical_planets[i+1:]:
                obj2 = chart.get(p2)
                # Calculate angular distance between planets
                lon1 = float(obj1.signlon)  # Convert to float
                lon2 = float(obj2.signlon)  # Convert to float
                
                # Calculate smallest angle between the two positions
                diff = abs(lon1 - lon2)
                if diff > 180:
                    diff = 360 - diff
                
                # Check for aspects within orb
                for angle, aspect_name in major_aspects.items():
                    orb = abs(diff - angle)
                    if orb <= 6:  # 6° orb
                        premium.append(
                            f"{p1}-{p2}: {aspect_name} ({orb:.1f}°)"
                        )
    
    return {
        "basic": "\n".join(basic),
        "premium": "\n".join(premium) if is_premium else None
    }

@app.post("/charts/create", response_model=ChartResponse)
async def create_chart(request: ChartRequest):
    # Parse date and time
    dt = datetime.strptime(
        f"{request.birth_date} {request.birth_time}",
        "%Y-%m-%d %H:%M"
    )
    
    # Validate and convert timezone
    try:
        local_tz = pytz.timezone(request.timezone)
    except pytz.exceptions.UnknownTimeZoneError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid timezone: {request.timezone}"
        )
    
    try:
        # Convert to UTC with proper error handling
        local_dt = local_tz.localize(dt)
        utc_dt = local_dt.astimezone(pytz.UTC)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error converting timezone: {str(e)}"
        )
    
    # Create Flatlib date and location for initial chart
    date = Datetime(
        f"{utc_dt.year}/{utc_dt.month:02d}/{utc_dt.day:02d}",
        f"{utc_dt.hour:02d}:{utc_dt.minute:02d}"
    )
    pos = GeoPos(request.latitude, request.longitude)
    
    # Calculate initial chart
    chart = Chart(date, pos)
    
    # Calculate true solar time using chart data
    true_solar_dt, solar_interpretation = calculate_true_solar_time(utc_dt, request.longitude, chart)
    
    # Create new chart with solar time
    solar_date = Datetime(
        f"{true_solar_dt.year}/{true_solar_dt.month:02d}/{true_solar_dt.day:02d}",
        f"{true_solar_dt.hour:02d}:{true_solar_dt.minute:02d}"
    )
    pos = GeoPos(request.latitude, request.longitude)
    
    # Calculate chart
    chart = Chart(date, pos)
    
    # Generate interpretation
    interpretation = interpret_chart(chart)
    
    # Extract positions for classical planets only
    planets = {}
    classical_planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']  # Classical planets supported by Flatlib
    houses = chart.houses  # Get houses as property
    
    for planet in classical_planets:
        obj = chart.get(planet)
        # Use Flatlib's native method to find house
        house_num = 1  # Default to house 1
        for i, house in enumerate(houses, 1):
            if house.hasObject(obj):  # Use Flatlib's built-in method
                house_num = i
                break
        planets[planet] = {
            "sign": obj.sign,
            "position": obj.signlon,
            "house": house_num
        }
    
    house_data = {}
    for i, house in enumerate(chart.houses, 1):
        house_data[str(i)] = {
            "sign": house.sign,
            "position": house.lon
        }
    
    # Update houses in chart data
    houses = house_data
    
    # Create chart record
    chart_id = str(uuid.uuid4())
    chart_data = {
        "id": chart_id,
        "date": request.birth_date,
        "time": request.birth_time,
        "latitude": request.latitude,
        "longitude": request.longitude,
        "planets": planets,
        "houses": houses,
        "basic_interpretation": interpretation["basic"],
        "is_premium_unlocked": False,
        "premium_interpretation": None,
        "_chart": chart  # Store chart object for premium interpretation
    }
    
    # Add solar time information
    chart_data["standard_time"] = utc_dt.strftime("%H:%M:%S")
    chart_data["solar_time"] = true_solar_dt.strftime("%H:%M:%S")
    chart_data["solar_interpretation"] = solar_interpretation
    
    # Save to in-memory database
    db["charts"][chart_id] = chart_data
    
    # Remove chart object from response
    response_data = dict(chart_data)
    del response_data["_chart"]
    return response_data

@app.post("/charts/{chart_id}/unlock-premium", response_model=ChartResponse)
async def unlock_premium_interpretation(
    chart_id: str,
    request: ChartUnlockRequest
):
    """Unlock premium interpretation for a chart."""
    # Verify chart exists
    if chart_id not in db["charts"]:
        raise HTTPException(status_code=404, detail="Chart not found")
    
    # Verify user exists
    if request.user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify user has enough balance (20 USD = 2000 coins)
    user = db["users"][request.user_id]
    if user.get("balance", 0) < 2000:
        raise HTTPException(
            status_code=402,
            detail="Insufficient balance. Premium interpretation costs 2000 coins."
        )
    
    # Deduct balance
    user["balance"] -= 2000
    
    # Record transaction
    transaction_id = str(uuid.uuid4())
    db["transactions"].append({
        "id": transaction_id,
        "user_id": request.user_id,
        "amount": -2000,
        "type": "premium_unlock",
        "description": f"Premium chart interpretation unlock for chart {chart_id}",
        "created_at": datetime.now()
    })
    
    # Record revenue
    db["revenue"].append({
        "id": str(uuid.uuid4()),
        "source": "premium_unlock",
        "amount": 20.0,  # 20 USD
        "created_at": datetime.now()
    })
    
    # Generate premium interpretation
    chart_data = db["charts"][chart_id]
    chart = chart_data["_chart"]
    interpretation = interpret_chart(chart, is_premium=True)
    
    # Update chart data
    chart_data["is_premium_unlocked"] = True
    chart_data["premium_interpretation"] = interpretation["premium"]
    
    # Remove chart object from response
    response_data = dict(chart_data)
    del response_data["_chart"]
    return response_data

def calculate_level(experience: int) -> Dict[str, Any]:
    """计算用户等级和称号"""
    if experience < 500:
        return {
            "level": 1,
            "title": "塔罗初学者",
            "title_en": "Tarot Beginner",
            "next_level": 500
        }
    elif experience < 1000:
        return {
            "level": 2,
            "title": "普通塔罗师",
            "title_en": "Regular Tarot Reader",
            "next_level": 1000
        }
    elif experience == 1000:
        return {
            "level": 2,
            "title": "普通塔罗师",
            "title_en": "Regular Tarot Reader",
            "next_level": 2000
        }
    elif experience < 2000:
        return {
            "level": 3,
            "title": "塔罗精英",
            "title_en": "Tarot Elite",
            "next_level": 2000
        }
    elif experience < 5000:
        return {
            "level": 4,
            "title": "资深塔罗师",
            "title_en": "Senior Tarot Reader",
            "next_level": 5000
        }
    else:
        return {
            "level": 5,
            "title": "塔罗大师",
            "title_en": "Tarot Master",
            "next_level": 10000
        }

# 内存数据库
db = {
    "users": {},
    "transactions": [],
    "revenue": [],
    "products": {
        "1": {
            "id": "1",
            "name": "完整韦特牌组",
            "description": "包含所有78张韦特牌的完整牌组",
            "price": 99,
            "image": "🎴"
        },
        "2": {
            "id": "2",
            "name": "专业牌阵解读",
            "description": "解锁更多专业牌阵和详细解读",
            "price": 49,
            "image": "📚"
        }
    },
    "readings": {}
}

# Other data models
class User(BaseModel):
    id: str = Field(..., description="Unique user identifier")
    username: str = Field(..., description="User's display name")
    purchased_products: List[str] = Field(default_factory=list, description="List of purchased product IDs")
    experience: int = Field(default=0, description="User's experience points")
    language: str = Field(default="en", description="User's preferred language (en/zh)")
    balance: int = Field(default=0, description="Virtual currency balance")

class Product(BaseModel):
    id: str = Field(..., description="Unique product identifier")
    name: str = Field(..., description="Product name")
    description: str = Field(..., description="Product description")
    price: float = Field(..., description="Product price in virtual currency")
    image: str = Field(..., description="Product image emoji")

class Reading(BaseModel):
    id: str = Field(..., description="Unique reading identifier")
    user_id: str = Field(..., description="User who performed the reading")
    spread_type: str = Field(..., description="Type of tarot spread used")
    cards: List[dict] = Field(..., description="Cards drawn in the reading")
    created_at: datetime = Field(default_factory=datetime.now, description="Reading timestamp")

class Transaction(BaseModel):
    id: str = Field(..., description="Unique transaction identifier")
    user_id: str = Field(..., description="User involved in the transaction")
    amount: int = Field(..., description="Transaction amount (positive for credit, negative for debit)")
    type: str = Field(..., description="Transaction type (ad_reward/purchase/payment)")
    description: str = Field(..., description="Transaction description")
    created_at: datetime = Field(default_factory=datetime.now, description="Transaction timestamp")

class Revenue(BaseModel):
    id: str = Field(..., description="Unique revenue record identifier")
    source: str = Field(..., description="Revenue source (ad/payment)")
    amount: float = Field(..., description="Revenue amount in USD")
    created_at: datetime = Field(default_factory=datetime.now, description="Revenue timestamp")

class PurchaseRequest(BaseModel):
    user_id: str = Field(..., description="User ID making the purchase")
    product_id: str = Field(..., description="Product ID to purchase")

@app.post("/products/{product_id}/purchase")
async def purchase_product(product_id: str, request: PurchaseRequest):
    """Purchase a product using virtual currency."""
    # Verify product exists
    if product_id not in db["products"]:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Verify user exists
    if request.user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    product = db["products"][product_id]
    user = db["users"][request.user_id]
    
    # Check if user already owns product
    if product_id in user.get("purchased_products", []):
        raise HTTPException(
            status_code=400,
            detail="User already owns this product"
        )
    
    # Check user balance
    if user.get("balance", 0) < product["price"]:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient balance. Product costs {product['price']} coins."
        )
    
    # Process purchase
    user["balance"] -= product["price"]
    if "purchased_products" not in user:
        user["purchased_products"] = []
    user["purchased_products"].append(product_id)
    
    # Record transaction
    transaction_id = str(uuid.uuid4())
    db["transactions"].append({
        "id": transaction_id,
        "user_id": request.user_id,
        "amount": -product["price"],
        "type": "purchase",
        "description": f"Purchase of {product['name']}",
        "created_at": datetime.now()
    })
    
    # Record revenue
    db["revenue"].append({
        "id": str(uuid.uuid4()),
        "source": "purchase",
        "amount": product["price"] / 100,  # Convert to USD (100 coins = $1)
        "created_at": datetime.now()
    })
    
    # Add experience points for purchase
    user["experience"] = user.get("experience", 0) + 50
    
    return {
        "success": True,
        "balance": user["balance"],
        "experience": user["experience"],
        "purchased_products": user["purchased_products"]
    }

# Chart-related models and functions
# Removed duplicate endpoint - using version from top of file

# Removed duplicate endpoint - using version from top of file

# Removed duplicate endpoint - using version from top of file

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/products", response_model=List[Product])
async def get_products():
    return list(db["products"].values())

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    return db["users"][user_id]

@app.get("/users/{user_id}/level")
async def get_user_level(user_id: str):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = db["users"][user_id]
    level_info = calculate_level(user.get("experience", 0))
    
    return {
        "experience": user.get("experience", 0),
        "level_info": level_info
    }

@app.post("/users/{user_id}/experience")
async def add_experience(user_id: str, xp_amount: int):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = db["users"][user_id]
    current_xp = user.get("experience", 0)
    new_xp = current_xp + xp_amount
    user["experience"] = new_xp
    
    level_info = calculate_level(new_xp)
    
    return {
        "experience": new_xp,
        "level_info": level_info
    }

class CreateUserRequest(BaseModel):
    username: str

@app.get("/users/by-username/{username}")
async def get_user_by_username(username: str):
    for user_id, user in db["users"].items():
        if user["username"] == username:
            return user
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/users")
async def create_user(request: CreateUserRequest):
    # Check if username already exists
    for user in db["users"].values():
        if user["username"] == request.username:
            return user  # Return existing user if found
            
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "username": request.username,
        "purchased_products": [],
        "experience": 0,
        "balance": 0,
        "language": "en"  # Default to English
    }
    db["users"][user_id] = user
    return user

@app.post("/purchase/{user_id}/{product_id}")
async def purchase_product(user_id: str, product_id: str):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    if product_id not in db["products"]:
        raise HTTPException(status_code=404, detail="Product not found")
    
    user = db["users"][user_id]
    if product_id not in user["purchased_products"]:
        user["purchased_products"].append(product_id)
    return user

class ReadingCreate(BaseModel):
    spread_type: str
    cards: List[dict]

@app.post("/readings/{user_id}")
async def save_reading(user_id: str, reading: ReadingCreate):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    reading_id = str(uuid.uuid4())
    reading_data = {
        "id": reading_id,
        "user_id": user_id,
        "spread_type": reading.spread_type,
        "cards": reading.cards,
        "created_at": datetime.now()
    }
    db["readings"][reading_id] = reading_data
    return reading_data

@app.get("/readings/{user_id}", response_model=List[Reading])
async def get_user_readings(user_id: str):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_readings = [
        reading for reading in db["readings"].values()
        if reading["user_id"] == user_id
    ]
    return user_readings



@app.put("/users/{user_id}/language")
async def update_language(user_id: str, language: str = "en"):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    if language not in ["en", "zh"]:
        raise HTTPException(status_code=400, detail="Invalid language code")
    
    user = db["users"][user_id]
    user["language"] = language
    return {"success": True, "language": language, "user": user}

@app.post("/users/{user_id}/balance/add")
async def add_balance(user_id: str, amount: int, source: str):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = db["users"][user_id]
    user["balance"] = user.get("balance", 0) + amount
    
    # Record transaction
    transaction = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": amount,
        "type": source,
        "description": f"Added {amount} coins from {source}",
        "created_at": datetime.now()
    }
    db["transactions"].append(transaction)
    
    # Record revenue if applicable
    if source == "payment":
        revenue = {
            "id": str(uuid.uuid4()),
            "source": "payment",
            "amount": float(amount) * 0.1,  # 假设1个虚拟币=0.1元
            "created_at": datetime.now()
        }
        db["revenue"].append(revenue)
    elif source == "ad":
        revenue = {
            "id": str(uuid.uuid4()),
            "source": "ad",
            "amount": 0.01,  # 假设每次看广告收益0.01元
            "created_at": datetime.now()
        }
        db["revenue"].append(revenue)
    
    return user

@app.post("/users/{user_id}/balance/deduct")
async def deduct_balance(user_id: str, amount: int, description: str):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = db["users"][user_id]
    current_balance = user.get("balance", 0)
    
    if current_balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    user["balance"] = current_balance - amount
    
    # Record transaction
    transaction = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": -amount,
        "type": "purchase",
        "description": description,
        "created_at": datetime.now()
    }
    db["transactions"].append(transaction)
    
    return user

@app.get("/users/{user_id}/transactions")
async def get_transactions(user_id: str):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    return [t for t in db["transactions"] if t["user_id"] == user_id]

@app.get("/revenue/summary")
async def get_revenue_summary(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    filtered_revenue = db["revenue"]
    if start_date:
        filtered_revenue = [r for r in filtered_revenue if r["created_at"] >= start_date]
    if end_date:
        filtered_revenue = [r for r in filtered_revenue if r["created_at"] <= end_date]
    
    total_ad_revenue = sum(r["amount"] for r in filtered_revenue if r["source"] == "ad")
    total_payment_revenue = sum(r["amount"] for r in filtered_revenue if r["source"] == "payment")
    
    return {
        "total_revenue": total_ad_revenue + total_payment_revenue,
        "ad_revenue": total_ad_revenue,
        "payment_revenue": total_payment_revenue,
        "transaction_count": len(filtered_revenue)
    }
