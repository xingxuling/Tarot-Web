#!/usr/bin/env python3
"""
《玄机妙算世界》后端API稳定性检查
Backend API Stability Check for Tarot Divination App
专注于核心业务流程测试和数据持久性验证
"""

import requests
import json
import time
import random
from typing import Dict, Any, Optional, List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://tarotmaster.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class StabilityTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_users = {}
        self.test_orders = {}
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': [],
            'critical_issues': []
        }
    
    def log_result(self, test_name: str, success: bool, message: str = "", critical: bool = False):
        """记录测试结果"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if message:
            print(f"   {message}")
        
        if success:
            self.results['passed'] += 1
        else:
            self.results['failed'] += 1
            self.results['errors'].append(f"{test_name}: {message}")
            if critical:
                self.results['critical_issues'].append(f"{test_name}: {message}")
        print()
    
    def test_core_authentication_flow(self):
        """测试核心认证流程"""
        print("=== 核心认证系统稳定性测试 ===")
        
        # 使用新的测试手机号
        timestamp = str(int(time.time()))[-4:]  # 使用时间戳确保唯一性
        seeker_phone = f"1380013{timestamp}"
        reader_phone = f"1380014{timestamp}"
        
        # 测试求测者注册
        seeker_data = {
            "phone": seeker_phone,
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
                # 验证初始数据
                if user_data['coins'] == 100 and user_data['reputation'] == 5.0:
                    self.log_result("求测者注册", True, f"用户ID: {user_data['id']}, 初始金币: {user_data['coins']}, 信誉分: {user_data['reputation']}")
                else:
                    self.log_result("求测者注册", False, f"初始数据异常 - 金币: {user_data['coins']}, 信誉分: {user_data['reputation']}", critical=True)
            else:
                self.log_result("求测者注册", False, f"状态码: {response.status_code}, 响应: {response.text}", critical=True)
        except Exception as e:
            self.log_result("求测者注册", False, f"请求异常: {str(e)}", critical=True)
        
        # 测试塔罗师注册
        reader_data = {
            "phone": reader_phone,
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
                self.log_result("塔罗师注册", True, f"用户ID: {user_data['id']}, 角色: {user_data['role']}")
            else:
                self.log_result("塔罗师注册", False, f"状态码: {response.status_code}, 响应: {response.text}", critical=True)
        except Exception as e:
            self.log_result("塔罗师注册", False, f"请求异常: {str(e)}", critical=True)
        
        # 测试登录功能
        login_data = {
            "phone": seeker_phone,
            "verification_code": "123456"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                user_data = response.json()
                self.log_result("用户登录验证", True, f"登录成功，用户: {user_data['nickname']}")
            else:
                self.log_result("用户登录验证", False, f"状态码: {response.status_code}, 响应: {response.text}", critical=True)
        except Exception as e:
            self.log_result("用户登录验证", False, f"请求异常: {str(e)}", critical=True)
    
    def test_core_divination_flow(self):
        """测试核心塔罗占卜流程"""
        print("=== 核心塔罗占卜系统稳定性测试 ===")
        
        if 'seeker' not in self.test_users or 'reader' not in self.test_users:
            self.log_result("占卜流程测试", False, "缺少必要的测试用户", critical=True)
            return
        
        seeker_id = self.test_users['seeker']['id']
        reader_id = self.test_users['reader']['id']
        
        # 获取创建订单前的金币余额
        try:
            response = self.session.get(f"{API_BASE}/users/{seeker_id}")
            if response.status_code == 200:
                coins_before = response.json()['coins']
                self.log_result("获取用户余额", True, f"创建订单前余额: {coins_before}金币")
            else:
                self.log_result("获取用户余额", False, f"无法获取用户余额: {response.status_code}")
                coins_before = 100  # 默认值
        except Exception as e:
            self.log_result("获取用户余额", False, f"请求异常: {str(e)}")
            coins_before = 100
        
        # 测试创建占卜订单（重点验证金币扣费）
        order_data = {
            "seeker_id": seeker_id,
            "question": "近期爱情运势",
            "payment": 30
        }
        
        try:
            response = self.session.post(f"{API_BASE}/divination/create", json=order_data)
            if response.status_code == 200:
                order = response.json()
                self.test_orders['main'] = order
                self.log_result("创建占卜订单", True, f"订单ID: {order['id']}, 支付: {order['payment']}金币")
                
                # 立即验证金币是否被扣除（这是之前的Bug重点）
                time.sleep(0.5)  # 短暂等待
                response = self.session.get(f"{API_BASE}/users/{seeker_id}")
                if response.status_code == 200:
                    coins_after = response.json()['coins']
                    expected_coins = coins_before - order['payment']
                    if coins_after == expected_coins:
                        self.log_result("订单创建金币扣费", True, f"正确扣费: {coins_before} → {coins_after} (扣除{order['payment']})")
                    else:
                        self.log_result("订单创建金币扣费", False, f"扣费异常: 期望{expected_coins}, 实际{coins_after}", critical=True)
                else:
                    self.log_result("订单创建金币扣费", False, "无法验证扣费结果", critical=True)
            else:
                self.log_result("创建占卜订单", False, f"状态码: {response.status_code}, 响应: {response.text}", critical=True)
        except Exception as e:
            self.log_result("创建占卜订单", False, f"请求异常: {str(e)}", critical=True)
        
        # 测试获取待接单列表
        try:
            response = self.session.get(f"{API_BASE}/divination/pending")
            if response.status_code == 200:
                orders = response.json()
                pending_count = len([o for o in orders if o['status'] == 'pending'])
                self.log_result("获取待接单列表", True, f"获取到 {len(orders)} 个订单，其中 {pending_count} 个待接单")
            else:
                self.log_result("获取待接单列表", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("获取待接单列表", False, f"请求异常: {str(e)}")
        
        # 测试塔罗师接单（验证圣三角牌阵）
        if 'main' in self.test_orders:
            order_id = self.test_orders['main']['id']
            try:
                response = self.session.post(f"{API_BASE}/divination/accept/{order_id}?reader_id={reader_id}")
                if response.status_code == 200:
                    result = response.json()
                    cards = result.get('cards', [])
                    ai_suggestion = result.get('ai_suggestion', '')
                    
                    # 验证圣三角牌阵
                    if len(cards) == 3:
                        positions = [card['position'] for card in cards]
                        if set(positions) == {1, 2, 3}:
                            self.log_result("塔罗师接单抽牌", True, f"成功抽取圣三角牌阵(过去-现在-未来)，AI建议: {ai_suggestion[:30]}...")
                        else:
                            self.log_result("塔罗师接单抽牌", False, f"牌阵位置错误: {positions}", critical=True)
                    else:
                        self.log_result("塔罗师接单抽牌", False, f"应该抽3张牌，实际: {len(cards)}", critical=True)
                else:
                    self.log_result("塔罗师接单抽牌", False, f"状态码: {response.status_code}, 响应: {response.text}", critical=True)
            except Exception as e:
                self.log_result("塔罗师接单抽牌", False, f"请求异常: {str(e)}", critical=True)
        
        # 测试塔罗师提交解读（验证收益分配）
        if 'main' in self.test_orders:
            # 获取塔罗师解读前的金币
            try:
                response = self.session.get(f"{API_BASE}/users/{reader_id}")
                reader_coins_before = response.json()['coins'] if response.status_code == 200 else 100
            except:
                reader_coins_before = 100
            
            interpretation_data = {
                "order_id": self.test_orders['main']['id'],
                "interpretation": "根据您抽到的牌组，过去的经历为现在奠定了基础，建议把握当下机遇，未来充满希望。"
            }
            
            try:
                response = self.session.post(f"{API_BASE}/divination/interpret", json=interpretation_data)
                if response.status_code == 200:
                    result = response.json()
                    earning = result.get('earning', 0)
                    
                    # 验证收益计算（30金币 - 10%平台费 = 27金币）
                    expected_earning = 30 - int(30 * 0.1)  # 27金币
                    if earning == expected_earning:
                        self.log_result("解读提交收益分配", True, f"正确计算收益: {earning}金币 (扣除10%平台费)")
                        
                        # 验证塔罗师实际收到金币
                        time.sleep(0.5)
                        response = self.session.get(f"{API_BASE}/users/{reader_id}")
                        if response.status_code == 200:
                            reader_coins_after = response.json()['coins']
                            if reader_coins_after == reader_coins_before + earning:
                                self.log_result("塔罗师金币到账", True, f"金币正确到账: {reader_coins_before} → {reader_coins_after}")
                            else:
                                self.log_result("塔罗师金币到账", False, f"金币到账异常: 期望{reader_coins_before + earning}, 实际{reader_coins_after}", critical=True)
                    else:
                        self.log_result("解读提交收益分配", False, f"收益计算错误: 期望{expected_earning}, 实际{earning}", critical=True)
                else:
                    self.log_result("解读提交收益分配", False, f"状态码: {response.status_code}, 响应: {response.text}", critical=True)
            except Exception as e:
                self.log_result("解读提交收益分配", False, f"请求异常: {str(e)}", critical=True)
    
    def test_coin_transaction_edge_cases(self):
        """测试金币交易边界情况"""
        print("=== 金币交易系统边界测试 ===")
        
        if 'seeker' not in self.test_users:
            self.log_result("金币交易边界测试", False, "缺少测试用户")
            return
        
        seeker_id = self.test_users['seeker']['id']
        
        # 获取当前余额
        try:
            response = self.session.get(f"{API_BASE}/users/{seeker_id}")
            current_coins = response.json()['coins'] if response.status_code == 200 else 0
        except:
            current_coins = 0
        
        # 测试余额不足情况
        try:
            insufficient_order = {
                "seeker_id": seeker_id,
                "question": "测试余额不足",
                "payment": current_coins + 100  # 超出余额
            }
            response = self.session.post(f"{API_BASE}/divination/create", json=insufficient_order)
            if response.status_code == 400 and "余额不足" in response.text:
                self.log_result("余额不足处理", True, "正确拒绝了余额不足的订单")
            else:
                self.log_result("余额不足处理", False, f"状态码: {response.status_code}, 响应: {response.text}", critical=True)
        except Exception as e:
            self.log_result("余额不足处理", False, f"请求异常: {str(e)}")
        
        # 测试边界支付金额
        if current_coins >= 10:
            try:
                boundary_order = {
                    "seeker_id": seeker_id,
                    "question": "边界测试",
                    "payment": 10  # 最小支付金额
                }
                response = self.session.post(f"{API_BASE}/divination/create", json=boundary_order)
                if response.status_code == 200:
                    self.log_result("最小支付金额", True, "正确接受了10金币的最小支付")
                else:
                    self.log_result("最小支付金额", False, f"状态码: {response.status_code}, 响应: {response.text}")
            except Exception as e:
                self.log_result("最小支付金额", False, f"请求异常: {str(e)}")
    
    def test_social_system_stability(self):
        """测试社交系统稳定性"""
        print("=== 社交系统稳定性测试 ===")
        
        if 'seeker' not in self.test_users or 'reader' not in self.test_users:
            self.log_result("社交系统测试", False, "缺少必要的测试用户")
            return
        
        seeker_id = self.test_users['seeker']['id']
        reader_id = self.test_users['reader']['id']
        
        # 测试添加好友
        friend_request = {
            "target_user_id": reader_id
        }
        
        try:
            response = self.session.post(f"{API_BASE}/social/add_friend?user_id={seeker_id}", json=friend_request)
            if response.status_code == 200:
                self.log_result("添加好友功能", True, "成功建立好友关系")
            else:
                self.log_result("添加好友功能", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("添加好友功能", False, f"请求异常: {str(e)}")
        
        # 测试评价系统
        if 'main' in self.test_orders:
            rating_data = {
                "order_id": self.test_orders['main']['id'],
                "rating": 5
            }
            
            try:
                response = self.session.post(f"{API_BASE}/divination/rate", json=rating_data)
                if response.status_code == 200:
                    self.log_result("订单评价功能", True, "成功提交5星评价")
                    
                    # 验证信誉分变化
                    time.sleep(0.5)
                    response = self.session.get(f"{API_BASE}/users/{reader_id}")
                    if response.status_code == 200:
                        reputation = response.json()['reputation']
                        if reputation > 5.0:  # 5星评价应该增加信誉分
                            self.log_result("信誉分计算", True, f"信誉分正确增加到: {reputation}")
                        else:
                            self.log_result("信誉分计算", False, f"信誉分未正确更新: {reputation}")
                else:
                    self.log_result("订单评价功能", False, f"状态码: {response.status_code}, 响应: {response.text}")
            except Exception as e:
                self.log_result("订单评价功能", False, f"请求异常: {str(e)}")
        
        # 测试历史记录
        try:
            response = self.session.get(f"{API_BASE}/users/{seeker_id}/history")
            if response.status_code == 200:
                history = response.json()
                self.log_result("历史记录查询", True, f"成功获取 {len(history)} 条历史记录")
            else:
                self.log_result("历史记录查询", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("历史记录查询", False, f"请求异常: {str(e)}")
    
    def test_data_persistence(self):
        """测试数据持久性"""
        print("=== 数据持久性验证 ===")
        
        if 'seeker' not in self.test_users:
            self.log_result("数据持久性测试", False, "缺少测试用户")
            return
        
        seeker_id = self.test_users['seeker']['id']
        
        # 多次获取用户信息，验证数据一致性
        user_data_samples = []
        for i in range(3):
            try:
                response = self.session.get(f"{API_BASE}/users/{seeker_id}")
                if response.status_code == 200:
                    user_data_samples.append(response.json())
                time.sleep(0.2)
            except:
                pass
        
        if len(user_data_samples) >= 2:
            # 检查数据一致性
            first_sample = user_data_samples[0]
            consistent = all(
                sample['id'] == first_sample['id'] and
                sample['phone'] == first_sample['phone'] and
                sample['nickname'] == first_sample['nickname']
                for sample in user_data_samples
            )
            
            if consistent:
                self.log_result("数据一致性", True, "多次查询数据保持一致")
            else:
                self.log_result("数据一致性", False, "数据一致性检查失败", critical=True)
        else:
            self.log_result("数据一致性", False, "无法获取足够的数据样本")
    
    def run_stability_check(self):
        """运行稳定性检查"""
        print("🔮 《玄机妙算世界》后端API稳定性检查")
        print(f"📡 测试服务器: {API_BASE}")
        print("🎯 重点验证: 用户认证、塔罗占卜、金币交易、社交系统")
        print("=" * 60)
        
        # 按优先级执行核心功能测试
        self.test_core_authentication_flow()
        self.test_core_divination_flow()
        self.test_coin_transaction_edge_cases()
        self.test_social_system_stability()
        self.test_data_persistence()
        
        # 输出测试总结
        print("=" * 60)
        print("🎯 稳定性检查总结")
        print(f"✅ 通过: {self.results['passed']} 项")
        print(f"❌ 失败: {self.results['failed']} 项")
        
        total_tests = self.results['passed'] + self.results['failed']
        success_rate = (self.results['passed'] / total_tests * 100) if total_tests > 0 else 0
        print(f"📊 成功率: {success_rate:.1f}%")
        
        if self.results['critical_issues']:
            print(f"\n🚨 严重问题 ({len(self.results['critical_issues'])} 项):")
            for issue in self.results['critical_issues']:
                print(f"   • {issue}")
        
        if self.results['errors'] and not self.results['critical_issues']:
            print(f"\n⚠️ 次要问题 ({len(self.results['errors'])} 项):")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        return self.results

if __name__ == "__main__":
    tester = StabilityTester()
    results = tester.run_stability_check()