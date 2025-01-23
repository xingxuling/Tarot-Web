from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

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

# 数据模型
class User(BaseModel):
    id: str
    username: str
    purchased_products: List[str] = []
    experience: int = 0
    language: str = "en"  # Default language preference
    balance: int = 0  # Virtual currency balance

class Product(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image: str

class Reading(BaseModel):
    id: str
    user_id: str
    spread_type: str
    cards: List[dict]
    created_at: datetime

class Transaction(BaseModel):
    id: str
    user_id: str
    amount: int
    type: str  # "ad_reward" | "purchase" | "payment"
    description: str
    created_at: datetime = datetime.now()

class Revenue(BaseModel):
    id: str
    source: str  # "ad" | "payment"
    amount: float
    created_at: datetime = datetime.now()

# API路由
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

@app.post("/users")
async def create_user(request: CreateUserRequest):
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "username": request.username,
        "purchased_products": [],
        "experience": 0,
        "balance": 0
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

@app.post("/readings/{user_id}")
async def save_reading(user_id: str, spread_type: str, cards: List[dict]):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    reading_id = str(uuid.uuid4())
    reading = {
        "id": reading_id,
        "user_id": user_id,
        "spread_type": spread_type,
        "cards": cards,
        "created_at": datetime.now()
    }
    db["readings"][reading_id] = reading
    return reading

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
async def update_language(user_id: str, language: str):
    if user_id not in db["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    if language not in ["en", "zh"]:
        raise HTTPException(status_code=400, detail="Invalid language code")
    
    user = db["users"][user_id]
    user["language"] = language
    return {"success": True, "language": language}

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
