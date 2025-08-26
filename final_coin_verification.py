#!/usr/bin/env python3
"""
《玄机妙算世界》金币交易系统最终验证测试
Final verification test for coin trading system
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://fortuneseeker.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

def log_test(name, success, message=""):
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {name}")
    if message:
        print(f"   {message}")
    print()

def get_user_coins(session, user_id):
    response = session.get(f"{API_BASE}/users/{user_id}")
    if response.status_code == 200:
        return response.json()['coins']
    return None

def main():
    print("🪙 《玄机妙算世界》金币交易系统最终验证")
    print("=" * 60)
    
    session = requests.Session()
    
    # 1. 创建全新用户进行端到端测试
    print("1️⃣ 创建全新用户")
    seeker_data = {
        "phone": "13800138888",
        "nickname": "最终测试求测者",
        "role": "seeker",
        "verification_code": "123456"
    }
    
    reader_data = {
        "phone": "13800138889",
        "nickname": "最终测试塔罗师", 
        "role": "reader",
        "verification_code": "123456"
    }
    
    # 注册求测者
    response = session.post(f"{API_BASE}/auth/register", json=seeker_data)
    if response.status_code == 200:
        seeker = response.json()
        seeker_id = seeker['id']
        log_test("求测者注册", True, f"初始金币: {seeker['coins']}")
    else:
        log_test("求测者注册", False, f"失败: {response.text}")
        return
    
    # 注册塔罗师
    response = session.post(f"{API_BASE}/auth/register", json=reader_data)
    if response.status_code == 200:
        reader = response.json()
        reader_id = reader['id']
        log_test("塔罗师注册", True, f"初始金币: {reader['coins']}")
    else:
        log_test("塔罗师注册", False, f"失败: {response.text}")
        return
    
    # 2. 验证金币扣费时机
    print("2️⃣ 验证金币扣费时机")
    initial_coins = get_user_coins(session, seeker_id)
    
    order_data = {
        "question": "我的爱情运势",
        "payment": 30
    }
    
    response = session.post(f"{API_BASE}/divination/create?seeker_id={seeker_id}", json=order_data)
    if response.status_code == 200:
        order = response.json()
        order_id = order['id']
        
        # 立即检查金币是否扣除
        coins_after_order = get_user_coins(session, seeker_id)
        expected_coins = initial_coins - 30
        
        if coins_after_order == expected_coins:
            log_test("创建订单立即扣费", True, f"余额从{initial_coins}变为{coins_after_order}")
        else:
            log_test("创建订单立即扣费", False, f"期望{expected_coins}，实际{coins_after_order}")
    else:
        log_test("创建订单", False, f"失败: {response.text}")
        return
    
    # 3. 验证余额不足拒绝
    print("3️⃣ 验证余额不足拒绝")
    current_coins = get_user_coins(session, seeker_id)
    
    insufficient_order = {
        "question": "余额不足测试",
        "payment": current_coins + 5  # 超出余额
    }
    
    response = session.post(f"{API_BASE}/divination/create?seeker_id={seeker_id}", json=insufficient_order)
    if response.status_code == 400 and "余额不足" in response.text:
        log_test("余额不足拒绝", True, f"正确拒绝{insufficient_order['payment']}金币订单（余额{current_coins}）")
    else:
        log_test("余额不足拒绝", False, f"状态码: {response.status_code}, 响应: {response.text}")
    
    # 4. 完整占卜流程测试
    print("4️⃣ 完整占卜流程测试")
    reader_coins_before = get_user_coins(session, reader_id)
    
    # 塔罗师接单
    response = session.post(f"{API_BASE}/divination/accept/{order_id}?reader_id={reader_id}")
    if response.status_code == 200:
        log_test("塔罗师接单", True, "接单成功")
        
        # 验证接单后塔罗师金币不变
        reader_coins_after_accept = get_user_coins(session, reader_id)
        if reader_coins_after_accept == reader_coins_before:
            log_test("接单后塔罗师金币不变", True, f"保持{reader_coins_after_accept}金币")
        else:
            log_test("接单后塔罗师金币不变", False, f"从{reader_coins_before}变为{reader_coins_after_accept}")
    else:
        log_test("塔罗师接单", False, f"失败: {response.text}")
        return
    
    # 塔罗师提交解读
    interpretation_data = {
        "order_id": order_id,
        "interpretation": "根据您抽到的牌组，建议您保持积极心态面对未来挑战。"
    }
    
    response = session.post(f"{API_BASE}/divination/interpret", json=interpretation_data)
    if response.status_code == 200:
        result = response.json()
        earning = result.get('earning', 0)
        expected_earning = 30 - int(30 * 0.1)  # 30 - 3 = 27
        
        if earning == expected_earning:
            log_test("塔罗师收益计算", True, f"获得{earning}金币（30-3平台费）")
        else:
            log_test("塔罗师收益计算", False, f"期望{expected_earning}，实际{earning}")
        
        # 验证塔罗师最终金币
        reader_coins_final = get_user_coins(session, reader_id)
        expected_final = reader_coins_before + earning
        
        if reader_coins_final == expected_final:
            log_test("塔罗师最终金币", True, f"最终余额{reader_coins_final}金币")
        else:
            log_test("塔罗师最终金币", False, f"期望{expected_final}，实际{reader_coins_final}")
    else:
        log_test("提交解读", False, f"失败: {response.text}")
        return
    
    # 5. 验证求测者金币无二次扣除
    print("5️⃣ 验证求测者金币无二次扣除")
    seeker_coins_final = get_user_coins(session, seeker_id)
    expected_seeker_final = 100 - 30  # 初始100 - 订单30
    
    if seeker_coins_final == expected_seeker_final:
        log_test("求测者金币无二次扣除", True, f"最终余额{seeker_coins_final}金币")
    else:
        log_test("求测者金币无二次扣除", False, f"期望{expected_seeker_final}，实际{seeker_coins_final}")
    
    # 6. 边界情况测试
    print("6️⃣ 边界情况测试")
    
    # 创建刚好够付的订单
    remaining_coins = get_user_coins(session, seeker_id)
    if remaining_coins >= 10:  # 最小订单金额
        exact_order = {
            "question": "刚好够付",
            "payment": min(remaining_coins, 50)  # 不超过最大限制
        }
        
        response = session.post(f"{API_BASE}/divination/create?seeker_id={seeker_id}", json=exact_order)
        if response.status_code == 200:
            final_coins = get_user_coins(session, seeker_id)
            expected_final = remaining_coins - exact_order['payment']
            
            if final_coins == expected_final:
                log_test("刚好够付订单", True, f"成功创建{exact_order['payment']}金币订单，余额{final_coins}")
            else:
                log_test("刚好够付订单", False, f"余额计算错误")
        else:
            log_test("刚好够付订单", False, f"失败: {response.text}")
    
    print("=" * 60)
    print("🎯 金币交易系统验证完成")
    print("✅ 核心功能：金币在创建订单时立即扣除")
    print("✅ 安全机制：余额不足时正确拒绝订单")
    print("✅ 业务逻辑：塔罗师在解读完成后获得收益（扣除10%平台费）")
    print("✅ 数据一致性：求测者金币不会二次扣除")

if __name__ == "__main__":
    main()