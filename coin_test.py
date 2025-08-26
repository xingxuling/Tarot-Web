#!/usr/bin/env python3
"""
Quick test to verify coin transaction timing issue
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://fortuneseeker.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

def test_coin_timing():
    print("=== 测试金币扣除时机 ===")
    
    # Register a test user
    user_data = {
        "phone": "13800138999",
        "nickname": "金币测试用户",
        "role": "seeker",
        "verification_code": "123456"
    }
    
    response = requests.post(f"{API_BASE}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"注册失败: {response.text}")
        return
    
    user = response.json()
    user_id = user['id']
    initial_coins = user['coins']
    print(f"用户注册成功，初始金币: {initial_coins}")
    
    # Create an order
    order_data = {
        "question": "测试金币扣除",
        "payment": 20
    }
    
    response = requests.post(f"{API_BASE}/divination/create?seeker_id={user_id}", json=order_data)
    if response.status_code != 200:
        print(f"创建订单失败: {response.text}")
        return
    
    order = response.json()
    print(f"订单创建成功，订单ID: {order['id']}")
    
    # Check coins after order creation
    response = requests.get(f"{API_BASE}/users/{user_id}")
    if response.status_code == 200:
        user_after_order = response.json()
        coins_after_order = user_after_order['coins']
        print(f"创建订单后金币: {coins_after_order}")
        
        if coins_after_order == initial_coins:
            print("❌ 问题确认：创建订单时没有扣除金币")
        else:
            print("✅ 创建订单时正确扣除了金币")
    
if __name__ == "__main__":
    test_coin_timing()