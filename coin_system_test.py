#!/usr/bin/env python3
"""
《玄机妙算世界》金币交易系统专项测试
Focused testing for the coin trading system bug fixes
"""

import requests
import json
import time
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://tarotmaster.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class CoinSystemTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_users = {}
        self.test_orders = {}
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }
    
    def log_result(self, test_name: str, success: bool, message: str = "", data: Any = None):
        """记录测试结果"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if message:
            print(f"   {message}")
        if data and not success:
            print(f"   Data: {data}")
        
        if success:
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1
            self.results['errors'].append(f"{test_name}: {message}")
        print()
    
    def create_test_users(self):
        """创建测试用户"""
        print("=== 创建测试用户 ===")
        
        # 创建求测者
        seeker_data = {
            "phone": "13900139001",
            "nickname": "测试求测者",
            "role": "seeker",
            "verification_code": "123456",
            "avatar": None
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=seeker_data)
            if response.status_code == 200:
                user_data = response.json()
                self.test_users['seeker'] = user_data
                self.log_result("创建求测者", True, f"用户ID: {user_data['id']}, 初始金币: {user_data['coins']}")
            else:
                self.log_result("创建求测者", False, f"状态码: {response.status_code}, 响应: {response.text}")
                return False
        except Exception as e:
            self.log_result("创建求测者", False, f"请求异常: {str(e)}")
            return False
        
        # 创建塔罗师
        reader_data = {
            "phone": "13900139002", 
            "nickname": "测试塔罗师",
            "role": "reader",
            "verification_code": "123456",
            "avatar": None
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=reader_data)
            if response.status_code == 200:
                user_data = response.json()
                self.test_users['reader'] = user_data
                self.log_result("创建塔罗师", True, f"用户ID: {user_data['id']}, 初始金币: {user_data['coins']}")
                return True
            else:
                self.log_result("创建塔罗师", False, f"状态码: {response.status_code}, 响应: {response.text}")
                return False
        except Exception as e:
            self.log_result("创建塔罗师", False, f"请求异常: {str(e)}")
            return False
    
    def get_user_coins(self, user_id: str) -> Optional[int]:
        """获取用户金币余额"""
        try:
            response = self.session.get(f"{API_BASE}/users/{user_id}")
            if response.status_code == 200:
                return response.json()['coins']
            return None
        except:
            return None
    
    def test_coin_deduction_timing(self):
        """测试金币扣费时机验证"""
        print("=== 测试金币扣费时机验证 ===")
        
        if 'seeker' not in self.test_users:
            self.log_result("金币扣费时机测试", False, "缺少测试用户")
            return
        
        seeker_id = self.test_users['seeker']['id']
        
        # 获取创建订单前的金币余额
        coins_before = self.get_user_coins(seeker_id)
        if coins_before is None:
            self.log_result("获取初始余额", False, "无法获取用户余额")
            return
        
        self.log_result("获取初始余额", True, f"创建订单前余额: {coins_before}金币")
        
        # 创建30金币的占卜订单
        order_data = {
            "question": "我的运势如何",
            "payment": 30
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/divination/create?seeker_id={seeker_id}", 
                json=order_data
            )
            
            if response.status_code == 200:
                order = response.json()
                self.test_orders['main'] = order
                self.log_result("创建占卜订单", True, f"订单ID: {order['id']}, 支付: {order['payment']}金币")
                
                # 立即检查金币是否被扣除
                coins_after = self.get_user_coins(seeker_id)
                if coins_after is None:
                    self.log_result("订单创建后余额检查", False, "无法获取用户余额")
                    return
                
                expected_coins = coins_before - 30
                if coins_after == expected_coins:
                    self.log_result("金币立即扣除验证", True, 
                        f"✅ 创建订单时立即扣除30金币，余额从{coins_before}变为{coins_after}")
                else:
                    self.log_result("金币立即扣除验证", False, 
                        f"❌ 期望余额{expected_coins}，实际余额{coins_after}，扣除金额{coins_before - coins_after}")
                
            else:
                self.log_result("创建占卜订单", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("创建占卜订单", False, f"请求异常: {str(e)}")
    
    def test_insufficient_balance(self):
        """测试用户余额不足时的处理"""
        print("=== 测试余额不足处理 ===")
        
        if 'seeker' not in self.test_users:
            self.log_result("余额不足测试", False, "缺少测试用户")
            return
        
        seeker_id = self.test_users['seeker']['id']
        
        # 获取当前余额
        current_coins = self.get_user_coins(seeker_id)
        if current_coins is None:
            self.log_result("获取当前余额", False, "无法获取用户余额")
            return
        
        self.log_result("获取当前余额", True, f"当前余额: {current_coins}金币")
        
        # 尝试创建超出余额的订单
        excessive_payment = current_coins + 10
        order_data = {
            "question": "测试余额不足",
            "payment": excessive_payment
        }
        
        try:
            response = self.session.post(
                f"{API_BASE}/divination/create?seeker_id={seeker_id}",
                json=order_data
            )
            
            if response.status_code == 400 and "余额不足" in response.text:
                self.log_result("余额不足拒绝", True, 
                    f"✅ 正确拒绝了{excessive_payment}金币的订单（余额{current_coins}金币）")
                
                # 验证余额没有变化
                coins_after_rejection = self.get_user_coins(seeker_id)
                if coins_after_rejection == current_coins:
                    self.log_result("余额不足时金币不变", True, 
                        f"✅ 订单被拒绝后余额保持不变: {coins_after_rejection}金币")
                else:
                    self.log_result("余额不足时金币不变", False, 
                        f"❌ 余额发生了变化: {current_coins} -> {coins_after_rejection}")
            else:
                self.log_result("余额不足拒绝", False, 
                    f"❌ 应该拒绝订单，实际状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("余额不足拒绝", False, f"请求异常: {str(e)}")
    
    def test_complete_divination_flow(self):
        """测试完整占卜流程"""
        print("=== 测试完整占卜流程 ===")
        
        if 'seeker' not in self.test_users or 'reader' not in self.test_users:
            self.log_result("完整流程测试", False, "缺少必要的测试用户")
            return
        
        if 'main' not in self.test_orders:
            self.log_result("完整流程测试", False, "没有可用的测试订单")
            return
        
        seeker_id = self.test_users['seeker']['id']
        reader_id = self.test_users['reader']['id']
        order_id = self.test_orders['main']['id']
        payment = self.test_orders['main']['payment']
        
        # 获取塔罗师接单前的金币
        reader_coins_before = self.get_user_coins(reader_id)
        if reader_coins_before is None:
            self.log_result("获取塔罗师初始余额", False, "无法获取塔罗师余额")
            return
        
        self.log_result("获取塔罗师初始余额", True, f"塔罗师接单前余额: {reader_coins_before}金币")
        
        # 塔罗师接单
        try:
            response = self.session.post(
                f"{API_BASE}/divination/accept/{order_id}?reader_id={reader_id}"
            )
            if response.status_code == 200:
                result = response.json()
                self.log_result("塔罗师接单", True, "接单成功，开始抽牌")
                
                # 验证接单后塔罗师金币没有变化（应该在解读完成后才获得收益）
                reader_coins_after_accept = self.get_user_coins(reader_id)
                if reader_coins_after_accept == reader_coins_before:
                    self.log_result("接单后塔罗师金币不变", True, 
                        f"✅ 接单后塔罗师金币保持不变: {reader_coins_after_accept}金币")
                else:
                    self.log_result("接单后塔罗师金币不变", False, 
                        f"❌ 接单后金币发生变化: {reader_coins_before} -> {reader_coins_after_accept}")
            else:
                self.log_result("塔罗师接单", False, f"状态码: {response.status_code}, 响应: {response.text}")
                return
        except Exception as e:
            self.log_result("塔罗师接单", False, f"请求异常: {str(e)}")
            return
        
        # 塔罗师提交解读
        interpretation_data = {
            "order_id": order_id,
            "interpretation": "根据您抽到的牌组，建议您保持积极的心态面对未来的挑战。"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/divination/interpret", json=interpretation_data)
            if response.status_code == 200:
                result = response.json()
                earning = result.get('earning', 0)
                expected_earning = payment - int(payment * 0.1)  # 扣除10%平台费
                
                self.log_result("提交塔罗解读", True, f"解读提交成功，塔罗师收益: {earning}金币")
                
                # 验证塔罗师收益计算
                if earning == expected_earning:
                    self.log_result("塔罗师收益计算", True, 
                        f"✅ 收益计算正确: {payment}金币 - {int(payment * 0.1)}平台费 = {earning}金币")
                else:
                    self.log_result("塔罗师收益计算", False, 
                        f"❌ 期望收益{expected_earning}，实际收益{earning}")
                
                # 验证塔罗师最终金币余额
                reader_coins_final = self.get_user_coins(reader_id)
                expected_final = reader_coins_before + earning
                if reader_coins_final == expected_final:
                    self.log_result("塔罗师最终余额", True, 
                        f"✅ 塔罗师最终余额正确: {reader_coins_before} + {earning} = {reader_coins_final}金币")
                else:
                    self.log_result("塔罗师最终余额", False, 
                        f"❌ 期望最终余额{expected_final}，实际{reader_coins_final}")
                
                # 验证求测者金币没有二次扣除
                seeker_coins_final = self.get_user_coins(seeker_id)
                expected_seeker_final = 100 - payment  # 初始100金币减去订单金额
                if seeker_coins_final == expected_seeker_final:
                    self.log_result("求测者金币无二次扣除", True, 
                        f"✅ 求测者金币没有二次扣除，最终余额: {seeker_coins_final}金币")
                else:
                    self.log_result("求测者金币无二次扣除", False, 
                        f"❌ 期望求测者余额{expected_seeker_final}，实际{seeker_coins_final}")
                
            else:
                self.log_result("提交塔罗解读", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("提交塔罗解读", False, f"请求异常: {str(e)}")
    
    def test_edge_cases(self):
        """测试边界情况"""
        print("=== 测试边界情况 ===")
        
        # 创建一个新用户测试边界情况
        edge_user_data = {
            "phone": "13900139003",
            "nickname": "边界测试用户",
            "role": "seeker",
            "verification_code": "123456",
            "avatar": None
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=edge_user_data)
            if response.status_code == 200:
                edge_user = response.json()
                edge_user_id = edge_user['id']
                self.log_result("创建边界测试用户", True, f"用户ID: {edge_user_id}, 初始金币: {edge_user['coins']}")
                
                # 测试金币刚好等于订单金额的情况
                exact_payment_order = {
                    "question": "刚好够付",
                    "payment": 100  # 等于初始金币
                }
                
                response = self.session.post(
                    f"{API_BASE}/divination/create?seeker_id={edge_user_id}",
                    json=exact_payment_order
                )
                
                if response.status_code == 200:
                    self.log_result("金币刚好够付", True, "✅ 成功创建金币刚好够付的订单")
                    
                    # 验证余额变为0
                    final_coins = self.get_user_coins(edge_user_id)
                    if final_coins == 0:
                        self.log_result("余额归零验证", True, "✅ 用完所有金币后余额正确归零")
                    else:
                        self.log_result("余额归零验证", False, f"❌ 期望余额0，实际{final_coins}")
                    
                    # 测试余额为0时创建新订单
                    zero_balance_order = {
                        "question": "余额为零",
                        "payment": 10
                    }
                    
                    response = self.session.post(
                        f"{API_BASE}/divination/create?seeker_id={edge_user_id}",
                        json=zero_balance_order
                    )
                    
                    if response.status_code == 400 and "余额不足" in response.text:
                        self.log_result("零余额拒绝订单", True, "✅ 正确拒绝了零余额用户的订单")
                    else:
                        self.log_result("零余额拒绝订单", False, 
                            f"❌ 应该拒绝零余额订单，状态码: {response.status_code}")
                else:
                    self.log_result("金币刚好够付", False, f"状态码: {response.status_code}, 响应: {response.text}")
            else:
                self.log_result("创建边界测试用户", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.log_result("边界情况测试", False, f"请求异常: {str(e)}")
    
    def test_multiple_orders(self):
        """测试连续创建多个订单的金币扣除"""
        print("=== 测试连续创建多个订单 ===")
        
        # 创建一个新用户用于多订单测试
        multi_user_data = {
            "phone": "13900139004",
            "nickname": "多订单测试用户",
            "role": "seeker",
            "verification_code": "123456",
            "avatar": None
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=multi_user_data)
            if response.status_code == 200:
                multi_user = response.json()
                multi_user_id = multi_user['id']
                initial_coins = multi_user['coins']
                self.log_result("创建多订单测试用户", True, f"用户ID: {multi_user_id}, 初始金币: {initial_coins}")
                
                # 连续创建3个订单
                orders = [
                    {"question": "第一个问题", "payment": 20},
                    {"question": "第二个问题", "payment": 25},
                    {"question": "第三个问题", "payment": 15}
                ]
                
                expected_coins = initial_coins
                for i, order_data in enumerate(orders, 1):
                    response = self.session.post(
                        f"{API_BASE}/divination/create?seeker_id={multi_user_id}",
                        json=order_data
                    )
                    
                    if response.status_code == 200:
                        expected_coins -= order_data['payment']
                        actual_coins = self.get_user_coins(multi_user_id)
                        
                        if actual_coins == expected_coins:
                            self.log_result(f"第{i}个订单金币扣除", True, 
                                f"✅ 扣除{order_data['payment']}金币，余额: {actual_coins}")
                        else:
                            self.log_result(f"第{i}个订单金币扣除", False, 
                                f"❌ 期望余额{expected_coins}，实际{actual_coins}")
                    else:
                        self.log_result(f"第{i}个订单创建", False, 
                            f"状态码: {response.status_code}, 响应: {response.text}")
                        break
                
                # 验证最终余额
                final_coins = self.get_user_coins(multi_user_id)
                total_spent = sum(order['payment'] for order in orders)
                expected_final = initial_coins - total_spent
                
                if final_coins == expected_final:
                    self.log_result("多订单最终余额", True, 
                        f"✅ 创建3个订单后余额正确: {initial_coins} - {total_spent} = {final_coins}")
                else:
                    self.log_result("多订单最终余额", False, 
                        f"❌ 期望最终余额{expected_final}，实际{final_coins}")
            else:
                self.log_result("创建多订单测试用户", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.log_result("多订单测试", False, f"请求异常: {str(e)}")
    
    def run_coin_system_tests(self):
        """运行金币系统专项测试"""
        print("🪙 开始《玄机妙算世界》金币交易系统专项测试")
        print(f"📡 测试服务器: {API_BASE}")
        print("=" * 60)
        
        # 创建测试用户
        if not self.create_test_users():
            print("❌ 无法创建测试用户，测试终止")
            return self.results
        
        # 按测试重点顺序执行
        self.test_coin_deduction_timing()      # 1. 金币扣费时机验证
        self.test_insufficient_balance()       # 2. 余额不足处理
        self.test_complete_divination_flow()   # 3. 完整占卜流程测试
        self.test_edge_cases()                 # 4. 边界情况测试
        self.test_multiple_orders()            # 5. 连续订单测试
        
        # 输出测试总结
        print("=" * 60)
        print("🎯 金币系统测试总结")
        print(f"✅ 通过: {self.results['passed']} 项")
        print(f"❌ 失败: {self.results['failed']} 项")
        
        if self.results['errors']:
            print("\n❌ 失败详情:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        if self.results['passed'] + self.results['failed'] > 0:
            success_rate = (self.results['passed'] / (self.results['passed'] + self.results['failed'])) * 100
            print(f"\n📊 成功率: {success_rate:.1f}%")
        
        return self.results

if __name__ == "__main__":
    tester = CoinSystemTester()
    results = tester.run_coin_system_tests()