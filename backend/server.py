from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum
import random
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="玄机妙算世界 API")
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    SEEKER = "seeker"  # 求测者
    READER = "reader"  # 塔罗师

class OrderStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted" 
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TarotCard(str, Enum):
    FOOL = "fool"
    MAGICIAN = "magician"
    HIGH_PRIESTESS = "high_priestess"
    EMPRESS = "empress"
    EMPEROR = "emperor"
    HIEROPHANT = "hierophant"
    LOVERS = "lovers"
    CHARIOT = "chariot"
    STRENGTH = "strength"
    HERMIT = "hermit"
    WHEEL_OF_FORTUNE = "wheel_of_fortune"
    JUSTICE = "justice"
    HANGED_MAN = "hanged_man"
    DEATH = "death"
    TEMPERANCE = "temperance"
    DEVIL = "devil"
    TOWER = "tower"
    STAR = "star"
    MOON = "moon"
    SUN = "sun"
    JUDGEMENT = "judgement"
    WORLD = "world"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone: str
    nickname: str
    avatar: Optional[str] = None  # base64 image
    role: UserRole
    reputation: float = 5.0  # 信誉分，初始5星
    coins: int = 100  # 金币，新手初始100
    created_at: datetime = Field(default_factory=datetime.utcnow)
    friends: List[str] = Field(default_factory=list)  # 好友ID列表

class UserCreate(BaseModel):
    phone: str
    nickname: str
    role: UserRole
    verification_code: str
    avatar: Optional[str] = None

class UserLogin(BaseModel):
    phone: str
    verification_code: str

class DivinationOrder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seeker_id: str
    reader_id: Optional[str] = None
    question: str  # 求测问题，最多10字
    payment: int  # 金币数量
    status: OrderStatus = OrderStatus.PENDING
    cards_drawn: Optional[List[Dict[str, Any]]] = None  # 抽到的牌
    interpretation: Optional[str] = None  # 塔罗师解读
    ai_suggestion: Optional[str] = None  # Mock AI建议
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class DivinationOrderCreate(BaseModel):
    question: str
    payment: int

class CardDrawResult(BaseModel):
    card: TarotCard
    position: int  # 1:过去, 2:现在, 3:未来
    reversed: bool  # 是否逆位
    meaning: str  # 基础牌意

class InterpretationSubmit(BaseModel):
    order_id: str
    interpretation: str

class FriendRequest(BaseModel):
    target_user_id: str

class Rating(BaseModel):
    order_id: str
    rating: int  # 1-5星

# Tarot Card Meanings Database
TAROT_MEANINGS = {
    TarotCard.FOOL: {
        "name": "愚者",
        "upright": "新开始，冒险精神，天真无邪，充满可能性",
        "reversed": "鲁莽行动，缺乏方向，不切实际的想法"
    },
    TarotCard.MAGICIAN: {
        "name": "魔术师", 
        "upright": "技能，意志力，创造力，行动力",
        "reversed": "缺乏技能，意志薄弱，滥用力量"
    },
    TarotCard.HIGH_PRIESTESS: {
        "name": "女祭司",
        "upright": "直觉，内在智慧，神秘知识，潜意识",
        "reversed": "忽视直觉，缺乏内省，表面化"
    },
    TarotCard.EMPRESS: {
        "name": "皇后",
        "upright": "丰盛，母性，创造力，自然",
        "reversed": "过度依赖，缺乏自信，创造力阻滞"
    },
    TarotCard.EMPEROR: {
        "name": "皇帝",
        "upright": "权威，稳定，控制，父权",
        "reversed": "专制，缺乏纪律，权力滥用"
    },
    # ... 其他牌意可以继续添加
}

# Mock AI interpretation generator
def generate_ai_interpretation(cards: List[CardDrawResult], question: str) -> str:
    """生成Mock AI解读建议"""
    interpretations = [
        "根据您抽到的牌组，过去的经历为现在奠定了基础，建议把握当下机遇。",
        "三张牌显示了一个完整的发展轨迹，需要耐心等待时机成熟。", 
        "牌面暗示您需要更多的内省和思考，答案在内心深处。",
        "当前的困惑是暂时的，坚持初心将会看到光明。",
        "牌组提醒您平衡理性和感性，做决定时听从内心声音。"
    ]
    return random.choice(interpretations)

# API Routes
@api_router.post("/auth/register", response_model=User)
async def register_user(user_data: UserCreate):
    """用户注册"""
    # Mock验证码验证
    if user_data.verification_code != "123456":
        raise HTTPException(status_code=400, detail="验证码错误")
    
    # 检查手机号是否已存在
    existing_user = await db.users.find_one({"phone": user_data.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="手机号已注册")
    
    user = User(
        phone=user_data.phone,
        nickname=user_data.nickname,
        role=user_data.role,
        avatar=user_data.avatar
    )
    
    await db.users.insert_one(user.dict())
    return user

@api_router.post("/auth/login", response_model=User)
async def login_user(login_data: UserLogin):
    """用户登录"""
    # Mock验证码验证
    if login_data.verification_code != "123456":
        raise HTTPException(status_code=400, detail="验证码错误")
    
    user = await db.users.find_one({"phone": login_data.phone})
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    return User(**user)

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """获取用户信息"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return User(**user)

@api_router.post("/divination/create", response_model=DivinationOrder)
async def create_divination_order(order_data: DivinationOrderCreate, seeker_id: str):
    """求测者创建占卜订单"""
    if len(order_data.question) > 10:
        raise HTTPException(status_code=400, detail="问题不能超过10个字")
    
    if order_data.payment < 10 or order_data.payment > 50:
        raise HTTPException(status_code=400, detail="支付金币必须在10-50之间")
    
    # 检查用户金币余额
    user = await db.users.find_one({"id": seeker_id})
    if not user or user["coins"] < order_data.payment:
        raise HTTPException(status_code=400, detail="金币余额不足")
    
    # 立即扣除用户金币（预付费模式）
    await db.users.update_one(
        {"id": seeker_id},
        {"$inc": {"coins": -order_data.payment}}
    )
    
    order = DivinationOrder(
        seeker_id=seeker_id,
        question=order_data.question,
        payment=order_data.payment
    )
    
    await db.divination_orders.insert_one(order.dict())
    return order

@api_router.get("/divination/pending", response_model=List[DivinationOrder])
async def get_pending_orders():
    """获取待接单的占卜订单"""
    orders = await db.divination_orders.find({"status": OrderStatus.PENDING}).to_list(100)
    return [DivinationOrder(**order) for order in orders]

@api_router.post("/divination/accept/{order_id}")
async def accept_order(order_id: str, reader_id: str):
    """塔罗师接单"""
    order = await db.divination_orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    if order["status"] != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail="订单状态不正确")
    
    # 抽牌逻辑
    cards = []
    available_cards = list(TarotCard)
    drawn_cards = random.sample(available_cards, 3)
    
    for i, card in enumerate(drawn_cards):
        reversed = random.choice([True, False])
        meaning = TAROT_MEANINGS.get(card, {"name": "未知", "upright": "待解读", "reversed": "待解读"})
        card_meaning = meaning["reversed"] if reversed else meaning["upright"]
        
        cards.append({
            "card": card,
            "name": meaning["name"],
            "position": i + 1,  # 1:过去, 2:现在, 3:未来
            "reversed": reversed,
            "meaning": card_meaning
        })
    
    # 生成AI建议
    ai_suggestion = generate_ai_interpretation(cards, order["question"])
    
    # 更新订单
    update_data = {
        "reader_id": reader_id,
        "status": OrderStatus.ACCEPTED,
        "cards_drawn": cards,
        "ai_suggestion": ai_suggestion
    }
    
    await db.divination_orders.update_one(
        {"id": order_id},
        {"$set": update_data}
    )
    
    return {"message": "接单成功", "cards": cards, "ai_suggestion": ai_suggestion}

@api_router.post("/divination/interpret")
async def submit_interpretation(interpretation_data: InterpretationSubmit):
    """塔罗师提交解读"""
    if len(interpretation_data.interpretation) > 100:
        raise HTTPException(status_code=400, detail="解读不能超过100字")
    
    order = await db.divination_orders.find_one({"id": interpretation_data.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    # 更新订单状态为完成
    await db.divination_orders.update_one(
        {"id": interpretation_data.order_id},
        {"$set": {
            "interpretation": interpretation_data.interpretation,
            "status": OrderStatus.COMPLETED,
            "completed_at": datetime.utcnow()
        }}
    )
    
    # 处理塔罗师收益（金币已在创建订单时扣除，现在只需给塔罗师加金币）
    payment = order["payment"]
    platform_fee = int(payment * 0.1)
    reader_earning = payment - platform_fee
    
    # 给塔罗师加金币
    await db.users.update_one(
        {"id": order["reader_id"]},
        {"$inc": {"coins": reader_earning}}
    )
    
    return {"message": "解读提交成功", "earning": reader_earning}

@api_router.post("/social/add_friend")
async def add_friend(friend_request: FriendRequest, user_id: str):
    """添加好友"""
    target_user = await db.users.find_one({"id": friend_request.target_user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    # 互相添加为好友
    await db.users.update_one(
        {"id": user_id},
        {"$addToSet": {"friends": friend_request.target_user_id}}
    )
    
    await db.users.update_one(
        {"id": friend_request.target_user_id},
        {"$addToSet": {"friends": user_id}}
    )
    
    return {"message": "添加好友成功"}

@api_router.post("/divination/rate")
async def rate_reader(rating_data: Rating):
    """评价塔罗师"""
    if rating_data.rating < 1 or rating_data.rating > 5:
        raise HTTPException(status_code=400, detail="评分必须在1-5之间")
    
    order = await db.divination_orders.find_one({"id": rating_data.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")
    
    reader_id = order["reader_id"]
    
    # 计算新的信誉分
    if rating_data.rating == 1:
        reputation_change = -0.5
    elif rating_data.rating == 5:
        reputation_change = 0.2
    else:
        reputation_change = 0
    
    await db.users.update_one(
        {"id": reader_id},
        {"$inc": {"reputation": reputation_change}}
    )
    
    return {"message": "评价成功"}

@api_router.get("/users/{user_id}/history", response_model=List[DivinationOrder])
async def get_user_history(user_id: str):
    """获取用户占卜历史"""
    orders = await db.divination_orders.find({
        "$or": [{"seeker_id": user_id}, {"reader_id": user_id}]
    }).sort("created_at", -1).limit(10).to_list(10)
    
    return [DivinationOrder(**order) for order in orders]

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()