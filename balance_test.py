#!/usr/bin/env python3
"""
Test balance check with valid payment range
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv('/app/frontend/.env')
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://fortuneseeker.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

def test_balance_check():
    print("=== 测试余额检查逻辑 ===")
    
    # Register a test user
    user_data = {
        "phone": "13800138777",
        "nickname": "余额测试用户",
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
    
    # Create multiple orders to drain coins
    orders_created = 0
    while initial_coins >= 10:
        order_data = {
            "question": f"测试订单{orders_created + 1}",
            "payment": min(50, initial_coins)  # Use all remaining coins or max 50
        }
        
        response = requests.post(f"{API_BASE}/divination/create?seeker_id={user_id}", json=order_data)
        if response.status_code == 200:
            orders_created += 1
            initial_coins -= order_data['payment']
            print(f"创建订单 {orders_created}，支付 {order_data['payment']} 金币，剩余 {initial_coins} 金币")
        else:
            print(f"创建订单失败: {response.text}")
            break
    
    # Now try to create another order when balance is insufficient
    if initial_coins < 10:
        order_data = {
            "question": "余额不足测试",
            "payment": 10
        }
        
        response = requests.post(f"{API_BASE}/divination/create?seeker_id={user_id}", json=order_data)
        print(f"尝试支付 10 金币（余额: {initial_coins}）")
        print(f"响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 400 and "余额不足" in response.text:
            print("✅ 余额不足检查正常工作")
        else:
            print("❌ 余额不足检查有问题")

if __name__ == "__main__":
    test_balance_check()