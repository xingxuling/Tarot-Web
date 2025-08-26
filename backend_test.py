#!/usr/bin/env python3
"""
《玄机妙算世界》塔罗占卜应用后端API深度测试
Deep comprehensive backend API testing for Tarot Divination App
包含边界测试、并发测试、错误处理测试等
"""

import requests
import json
import time
import threading
import random
from typing import Dict, Any, Optional, List
import os
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://tarotmaster.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class TarotAPITester:
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
    
    def test_user_registration(self):
        """测试用户注册API"""
        print("=== 测试用户注册系统 ===")
        
        # 测试求测者注册
        seeker_data = {
            "phone": "13800138001",
            "nickname": "占卜爱好者小王",
            "role": "seeker",
            "verification_code": "123456",
            "avatar": None
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=seeker_data)
            if response.status_code == 200:
                user_data = response.json()
                self.test_users['seeker'] = user_data
                self.log_result("求测者注册", True, f"用户ID: {user_data['id']}, 初始金币: {user_data['coins']}")
            else:
                self.log_result("求测者注册", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("求测者注册", False, f"请求异常: {str(e)}")
        
        # 测试塔罗师注册
        reader_data = {
            "phone": "13800138002", 
            "nickname": "资深塔罗师李老师",
            "role": "reader",
            "verification_code": "123456",
            "avatar": None
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=reader_data)
            if response.status_code == 200:
                user_data = response.json()
                self.test_users['reader'] = user_data
                self.log_result("塔罗师注册", True, f"用户ID: {user_data['id']}, 信誉分: {user_data['reputation']}")
            else:
                self.log_result("塔罗师注册", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("塔罗师注册", False, f"请求异常: {str(e)}")
        
        # 测试错误验证码
        try:
            wrong_code_data = seeker_data.copy()
            wrong_code_data["phone"] = "13800138003"
            wrong_code_data["verification_code"] = "000000"
            
            response = self.session.post(f"{API_BASE}/auth/register", json=wrong_code_data)
            if response.status_code == 400:
                self.log_result("错误验证码处理", True, "正确拒绝了错误验证码")
            else:
                self.log_result("错误验证码处理", False, f"应该返回400错误，实际: {response.status_code}")
        except Exception as e:
            self.log_result("错误验证码处理", False, f"请求异常: {str(e)}")
        
        # 测试重复手机号注册
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=seeker_data)
            if response.status_code == 400:
                self.log_result("重复手机号处理", True, "正确拒绝了重复手机号")
            else:
                self.log_result("重复手机号处理", False, f"应该返回400错误，实际: {response.status_code}")
        except Exception as e:
            self.log_result("重复手机号处理", False, f"请求异常: {str(e)}")
    
    def test_user_login(self):
        """测试用户登录API"""
        print("=== 测试用户登录系统 ===")
        
        # 测试正常登录
        login_data = {
            "phone": "13800138001",
            "verification_code": "123456"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            if response.status_code == 200:
                user_data = response.json()
                self.log_result("用户登录", True, f"登录成功，用户: {user_data['nickname']}")
            else:
                self.log_result("用户登录", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("用户登录", False, f"请求异常: {str(e)}")
        
        # 测试不存在用户登录
        try:
            nonexistent_login = {
                "phone": "13800138999",
                "verification_code": "123456"
            }
            response = self.session.post(f"{API_BASE}/auth/login", json=nonexistent_login)
            if response.status_code == 404:
                self.log_result("不存在用户登录", True, "正确返回用户不存在错误")
            else:
                self.log_result("不存在用户登录", False, f"应该返回404错误，实际: {response.status_code}")
        except Exception as e:
            self.log_result("不存在用户登录", False, f"请求异常: {str(e)}")
    
    def test_user_info(self):
        """测试获取用户信息API"""
        print("=== 测试用户信息获取 ===")
        
        if 'seeker' not in self.test_users:
            self.log_result("获取用户信息", False, "没有可用的测试用户")
            return
        
        user_id = self.test_users['seeker']['id']
        
        try:
            response = self.session.get(f"{API_BASE}/users/{user_id}")
            if response.status_code == 200:
                user_data = response.json()
                self.log_result("获取用户信息", True, f"成功获取用户信息: {user_data['nickname']}")
            else:
                self.log_result("获取用户信息", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("获取用户信息", False, f"请求异常: {str(e)}")
    
    def test_divination_system(self):
        """测试塔罗占卜系统API"""
        print("=== 测试塔罗占卜系统 ===")
        
        if 'seeker' not in self.test_users or 'reader' not in self.test_users:
            self.log_result("占卜系统测试", False, "缺少必要的测试用户")
            return
        
        seeker_id = self.test_users['seeker']['id']
        reader_id = self.test_users['reader']['id']
        
        # 测试创建占卜订单
        order_data = {
            "question": "我的爱情运势如何",
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
            else:
                self.log_result("创建占卜订单", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("创建占卜订单", False, f"请求异常: {str(e)}")
        
        # 测试问题字数限制
        try:
            long_question_data = {
                "question": "我想知道我的爱情运势和事业发展以及财运状况如何发展",  # 超过10字
                "payment": 25
            }
            response = self.session.post(
                f"{API_BASE}/divination/create?seeker_id={seeker_id}",
                json=long_question_data
            )
            if response.status_code == 400:
                self.log_result("问题字数限制", True, "正确限制了超长问题")
            else:
                self.log_result("问题字数限制", False, f"应该返回400错误，实际: {response.status_code}")
        except Exception as e:
            self.log_result("问题字数限制", False, f"请求异常: {str(e)}")
        
        # 测试金币支付范围限制
        try:
            invalid_payment_data = {
                "question": "测试问题",
                "payment": 5  # 低于最小值10
            }
            response = self.session.post(
                f"{API_BASE}/divination/create?seeker_id={seeker_id}",
                json=invalid_payment_data
            )
            if response.status_code == 400:
                self.log_result("金币支付范围限制", True, "正确限制了无效支付金额")
            else:
                self.log_result("金币支付范围限制", False, f"应该返回400错误，实际: {response.status_code}")
        except Exception as e:
            self.log_result("金币支付范围限制", False, f"请求异常: {str(e)}")
        
        # 测试获取待接单列表
        try:
            response = self.session.get(f"{API_BASE}/divination/pending")
            if response.status_code == 200:
                orders = response.json()
                self.log_result("获取待接单列表", True, f"获取到 {len(orders)} 个待接订单")
            else:
                self.log_result("获取待接单列表", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("获取待接单列表", False, f"请求异常: {str(e)}")
        
        # 测试塔罗师接单
        if 'main' in self.test_orders:
            order_id = self.test_orders['main']['id']
            try:
                response = self.session.post(
                    f"{API_BASE}/divination/accept/{order_id}?reader_id={reader_id}"
                )
                if response.status_code == 200:
                    result = response.json()
                    cards = result.get('cards', [])
                    ai_suggestion = result.get('ai_suggestion', '')
                    self.log_result("塔罗师接单", True, f"接单成功，抽到 {len(cards)} 张牌，AI建议: {ai_suggestion[:20]}...")
                    
                    # 验证圣三角牌阵
                    if len(cards) == 3:
                        positions = [card['position'] for card in cards]
                        if set(positions) == {1, 2, 3}:
                            self.log_result("圣三角牌阵验证", True, "正确生成了过去-现在-未来三张牌")
                        else:
                            self.log_result("圣三角牌阵验证", False, f"牌位不正确: {positions}")
                    else:
                        self.log_result("圣三角牌阵验证", False, f"应该抽3张牌，实际: {len(cards)}")
                        
                else:
                    self.log_result("塔罗师接单", False, f"状态码: {response.status_code}, 响应: {response.text}")
            except Exception as e:
                self.log_result("塔罗师接单", False, f"请求异常: {str(e)}")
        
        # 测试塔罗师提交解读
        if 'main' in self.test_orders:
            interpretation_data = {
                "order_id": self.test_orders['main']['id'],
                "interpretation": "根据您抽到的牌组，过去的经历为现在的爱情奠定了基础，建议您保持开放的心态迎接新的感情机遇。"
            }
            
            try:
                response = self.session.post(f"{API_BASE}/divination/interpret", json=interpretation_data)
                if response.status_code == 200:
                    result = response.json()
                    earning = result.get('earning', 0)
                    self.log_result("提交塔罗解读", True, f"解读提交成功，塔罗师收益: {earning}金币")
                else:
                    self.log_result("提交塔罗解读", False, f"状态码: {response.status_code}, 响应: {response.text}")
            except Exception as e:
                self.log_result("提交塔罗解读", False, f"请求异常: {str(e)}")
            
            # 测试解读字数限制
            try:
                long_interpretation = {
                    "order_id": self.test_orders['main']['id'],
                    "interpretation": "这是一个非常长的解读内容，" * 10  # 超过100字
                }
                response = self.session.post(f"{API_BASE}/divination/interpret", json=long_interpretation)
                if response.status_code == 400:
                    self.log_result("解读字数限制", True, "正确限制了超长解读")
                else:
                    self.log_result("解读字数限制", False, f"应该返回400错误，实际: {response.status_code}")
            except Exception as e:
                self.log_result("解读字数限制", False, f"请求异常: {str(e)}")
    
    def test_coin_transaction_system(self):
        """测试金币交易系统"""
        print("=== 测试金币交易系统 ===")
        
        if 'seeker' not in self.test_users or 'reader' not in self.test_users:
            self.log_result("金币交易测试", False, "缺少必要的测试用户")
            return
        
        seeker_id = self.test_users['seeker']['id']
        reader_id = self.test_users['reader']['id']
        
        # 获取交易前的金币余额
        try:
            seeker_response = self.session.get(f"{API_BASE}/users/{seeker_id}")
            reader_response = self.session.get(f"{API_BASE}/users/{reader_id}")
            
            if seeker_response.status_code == 200 and reader_response.status_code == 200:
                seeker_coins_before = seeker_response.json()['coins']
                reader_coins_before = reader_response.json()['coins']
                
                self.log_result("获取交易前余额", True, 
                    f"求测者: {seeker_coins_before}金币, 塔罗师: {reader_coins_before}金币")
                
                # 验证金币交易逻辑（如果有完成的订单）
                if 'main' in self.test_orders:
                    payment = self.test_orders['main']['payment']
                    expected_platform_fee = int(payment * 0.1)
                    expected_reader_earning = payment - expected_platform_fee
                    
                    # 再次获取余额验证交易
                    time.sleep(1)  # 等待交易完成
                    seeker_response = self.session.get(f"{API_BASE}/users/{seeker_id}")
                    reader_response = self.session.get(f"{API_BASE}/users/{reader_id}")
                    
                    if seeker_response.status_code == 200 and reader_response.status_code == 200:
                        seeker_coins_after = seeker_response.json()['coins']
                        reader_coins_after = reader_response.json()['coins']
                        
                        # 验证求测者金币扣除
                        if seeker_coins_after == seeker_coins_before - payment:
                            self.log_result("求测者金币扣除", True, 
                                f"正确扣除 {payment} 金币，余额: {seeker_coins_after}")
                        else:
                            self.log_result("求测者金币扣除", False, 
                                f"期望扣除 {payment}，实际变化: {seeker_coins_before - seeker_coins_after}")
                        
                        # 验证塔罗师收益（扣除10%平台费）
                        actual_earning = reader_coins_after - reader_coins_before
                        if actual_earning == expected_reader_earning:
                            self.log_result("塔罗师收益分配", True, 
                                f"正确获得 {actual_earning} 金币（扣除 {expected_platform_fee} 平台费）")
                        else:
                            self.log_result("塔罗师收益分配", False, 
                                f"期望收益 {expected_reader_earning}，实际收益: {actual_earning}")
            else:
                self.log_result("获取交易前余额", False, "无法获取用户余额信息")
        except Exception as e:
            self.log_result("金币交易测试", False, f"请求异常: {str(e)}")
        
        # 测试金币不足情况
        try:
            # 创建一个高金额订单测试余额不足
            high_payment_order = {
                "question": "测试余额不足",
                "payment": 1000  # 远超初始金币
            }
            response = self.session.post(
                f"{API_BASE}/divination/create?seeker_id={seeker_id}",
                json=high_payment_order
            )
            if response.status_code == 400 and "余额不足" in response.text:
                self.log_result("金币不足处理", True, "正确处理了余额不足情况")
            else:
                self.log_result("金币不足处理", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("金币不足处理", False, f"请求异常: {str(e)}")
    
    def test_social_system(self):
        """测试社交系统API"""
        print("=== 测试社交系统 ===")
        
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
            response = self.session.post(
                f"{API_BASE}/social/add_friend?user_id={seeker_id}",
                json=friend_request
            )
            if response.status_code == 200:
                self.log_result("添加好友", True, "成功添加好友关系")
            else:
                self.log_result("添加好友", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("添加好友", False, f"请求异常: {str(e)}")
        
        # 测试订单评价
        if 'main' in self.test_orders:
            rating_data = {
                "order_id": self.test_orders['main']['id'],
                "rating": 5
            }
            
            try:
                response = self.session.post(f"{API_BASE}/divination/rate", json=rating_data)
                if response.status_code == 200:
                    self.log_result("订单评价", True, "成功提交5星评价")
                else:
                    self.log_result("订单评价", False, f"状态码: {response.status_code}, 响应: {response.text}")
            except Exception as e:
                self.log_result("订单评价", False, f"请求异常: {str(e)}")
            
            # 测试评分范围限制
            try:
                invalid_rating = {
                    "order_id": self.test_orders['main']['id'],
                    "rating": 6  # 超出1-5范围
                }
                response = self.session.post(f"{API_BASE}/divination/rate", json=invalid_rating)
                if response.status_code == 400:
                    self.log_result("评分范围限制", True, "正确限制了无效评分")
                else:
                    self.log_result("评分范围限制", False, f"应该返回400错误，实际: {response.status_code}")
            except Exception as e:
                self.log_result("评分范围限制", False, f"请求异常: {str(e)}")
        
        # 测试用户历史记录
        try:
            response = self.session.get(f"{API_BASE}/users/{seeker_id}/history")
            if response.status_code == 200:
                history = response.json()
                self.log_result("用户历史记录", True, f"成功获取 {len(history)} 条历史记录")
            else:
                self.log_result("用户历史记录", False, f"状态码: {response.status_code}, 响应: {response.text}")
        except Exception as e:
            self.log_result("用户历史记录", False, f"请求异常: {str(e)}")
    
    def test_tarot_data_integrity(self):
        """测试塔罗牌数据完整性"""
        print("=== 测试塔罗牌数据完整性 ===")
        
        # 验证22张大阿卡纳牌是否完整定义
        from backend.server import TarotCard, TAROT_MEANINGS
        
        all_cards = list(TarotCard)
        if len(all_cards) == 22:
            self.log_result("大阿卡纳牌数量", True, f"正确定义了 {len(all_cards)} 张大阿卡纳牌")
        else:
            self.log_result("大阿卡纳牌数量", False, f"应该有22张牌，实际: {len(all_cards)}")
        
        # 检查牌意数据
        cards_with_meanings = len(TAROT_MEANINGS)
        self.log_result("塔罗牌意数据", True, f"已定义 {cards_with_meanings} 张牌的牌意")
        
        # 验证牌意结构
        sample_card = TarotCard.FOOL
        if sample_card in TAROT_MEANINGS:
            meaning = TAROT_MEANINGS[sample_card]
            if all(key in meaning for key in ['name', 'upright', 'reversed']):
                self.log_result("牌意数据结构", True, "牌意数据结构正确")
            else:
                self.log_result("牌意数据结构", False, f"牌意数据缺少必要字段: {meaning}")
        else:
            self.log_result("牌意数据结构", False, "无法找到示例牌意数据")
    
    def run_all_tests(self):
        """运行所有测试"""
        print("🔮 开始《玄机妙算世界》塔罗占卜应用后端API测试")
        print(f"📡 测试服务器: {API_BASE}")
        print("=" * 60)
        
        # 按优先级顺序执行测试
        self.test_user_registration()
        self.test_user_login()
        self.test_user_info()
        self.test_divination_system()
        self.test_coin_transaction_system()
        self.test_social_system()
        self.test_tarot_data_integrity()
        
        # 输出测试总结
        print("=" * 60)
        print("🎯 测试总结")
        print(f"✅ 通过: {self.results['passed']} 项")
        print(f"❌ 失败: {self.results['failed']} 项")
        
        if self.results['errors']:
            print("\n❌ 失败详情:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.results['passed'] / (self.results['passed'] + self.results['failed'])) * 100
        print(f"\n📊 成功率: {success_rate:.1f}%")
        
        return self.results

if __name__ == "__main__":
    tester = TarotAPITester()
    results = tester.run_all_tests()