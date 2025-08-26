#!/usr/bin/env python3
"""
测试余额不足的具体场景
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://tarotmaster.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

def test_insufficient_balance():
    session = requests.Session()
    
    # 创建测试用户
    user_data = {
        "phone": "13900139999",
        "nickname": "余额不足测试用户",
        "role": "seeker",
        "verification_code": "123456",
        "avatar": None
    }
    
    response = session.post(f"{API_BASE}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"❌ 创建用户失败: {response.text}")
        return
    
    user = response.json()
    user_id = user['id']
    print(f"✅ 创建用户成功，初始金币: {user['coins']}")
    
    # 先创建几个订单消耗大部分金币
    orders_to_create = [
        {"question": "测试问题1", "payment": 40},
        {"question": "测试问题2", "payment": 30}
    ]
    
    for order_data in orders_to_create:
        response = session.post(
            f"{API_BASE}/divination/create?seeker_id={user_id}",
            json=order_data
        )
        if response.status_code == 200:
            print(f"✅ 创建订单成功，支付: {order_data['payment']}金币")
        else:
            print(f"❌ 创建订单失败: {response.text}")
    
    # 获取当前余额
    response = session.get(f"{API_BASE}/users/{user_id}")
    if response.status_code == 200:
        current_coins = response.json()['coins']
        print(f"✅ 当前余额: {current_coins}金币")
        
        # 尝试创建超出余额的订单
        excessive_order = {
            "question": "余额不足测试",
            "payment": current_coins + 5  # 超出当前余额
        }
        
        response = session.post(
            f"{API_BASE}/divination/create?seeker_id={user_id}",
            json=excessive_order
        )
        
        print(f"尝试创建{excessive_order['payment']}金币的订单（余额{current_coins}金币）")
        print(f"响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 400 and "余额不足" in response.text:
            print("✅ 正确拒绝了余额不足的订单")
        else:
            print("❌ 余额不足处理有问题")
    else:
        print(f"❌ 获取用户信息失败: {response.text}")

if __name__ == "__main__":
    test_insufficient_balance()