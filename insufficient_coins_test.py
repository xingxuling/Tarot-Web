#!/usr/bin/env python3
"""
Test insufficient coins logic
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://fortuneseeker.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

def test_insufficient_coins():
    print("=== 测试金币不足逻辑 ===")
    
    # Register a test user
    user_data = {
        "phone": "13800138888",
        "nickname": "穷人测试用户",
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
    
    # Try to create an order with more coins than available
    order_data = {
        "question": "测试余额不足",
        "payment": initial_coins + 10  # More than available
    }
    
    response = requests.post(f"{API_BASE}/divination/create?seeker_id={user_id}", json=order_data)
    print(f"尝试支付 {order_data['payment']} 金币（余额: {initial_coins}）")
    print(f"响应状态码: {response.status_code}")
    print(f"响应内容: {response.text}")
    
    if response.status_code == 400 and "余额不足" in response.text:
        print("✅ 金币不足检查正常工作")
    else:
        print("❌ 金币不足检查有问题")

if __name__ == "__main__":
    test_insufficient_coins()