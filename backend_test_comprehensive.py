#!/usr/bin/env python3
"""
《玄机妙算世界》塔罗占卜应用后端API深度全面测试
Deep comprehensive backend API testing for Tarot Divination App
包含边界测试、并发测试、错误处理测试、业务逻辑验证等
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
import uuid

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://tarotmaster.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class ComprehensiveTarotAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.test_users = {}
        self.test_orders = {}
        self.results = {
            'passed': 0,
            'failed': 0,
            'errors': [],
            'critical_issues': [],
            'minor_issues': []
        }
        self.concurrent_results = []
    
    def log_result(self, test_name: str, success: bool, message: str = "", data: Any = None, critical: bool = False):
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
            error_msg = f"{test_name}: {message}"
            self.results['errors'].append(error_msg)
            if critical:
                self.results['critical_issues'].append(error_msg)
            else:
                self.results['minor_issues'].append(error_msg)
        print()
    
    def generate_unique_phone(self):
        """生成唯一手机号"""
        return f"138{random.randint(10000000, 99999999)}"
    
    def test_user_authentication_comprehensive(self):
        """全面测试用户认证系统"""
        print("=== 🔐 全面测试用户认证系统 ===")
        
        # 1. 测试正常注册流程
        unique_seeker_phone = self.generate_unique_phone()
        unique_reader_phone = self.generate_unique_phone()
        
        seeker_data = {
            "phone": unique_seeker_phone,
            "nickname": "深度测试求测者",
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
                    self.log_result("求测者注册及初始数据", True, 
                        f"用户ID: {user_data['id']}, 初始金币: {user_data['coins']}, 信誉分: {user_data['reputation']}")
                else:
                    self.log_result("求测者注册及初始数据", False, 
                        f"初始数据异常 - 金币: {user_data['coins']}, 信誉分: {user_data['reputation']}", critical=True)
            else:
                self.log_result("求测者注册", False, f"状态码: {response.status_code}, 响应: {response.text}", critical=True)
        except Exception as e:
            self.log_result("求测者注册", False, f"请求异常: {str(e)}", critical=True)
        
        # 2. 测试塔罗师注册
        reader_data = {
            "phone": unique_reader_phone,
            "nickname": "深度测试塔罗师",
            "role": "reader",
            "verification_code": "123456",
            "avatar": None
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=reader_data)
            if response.status_code == 200:
                user_data = response.json()
                self.test_users['reader'] = user_data
                self.log_result("塔罗师注册", True, f"用户ID: {user_data['id']}")
            else:
                self.log_result("塔罗师注册", False, f"状态码: {response.status_code}, 响应: {response.text}", critical=True)
        except Exception as e:
            self.log_result("塔罗师注册", False, f"请求异常: {str(e)}", critical=True)
        
        # 3. 边界测试 - 各种无效输入
        boundary_tests = [
            {
                "name": "空手机号",
                "data": {**seeker_data, "phone": "", "nickname": "测试用户1"},
                "expected_status": 400
            },
            {
                "name": "无效手机号格式",
                "data": {**seeker_data, "phone": "123", "nickname": "测试用户2"},
                "expected_status": 400
            },
            {
                "name": "空昵称",
                "data": {**seeker_data, "phone": self.generate_unique_phone(), "nickname": ""},
                "expected_status": 400
            },
            {
                "name": "超长昵称",
                "data": {**seeker_data, "phone": self.generate_unique_phone(), "nickname": "这是一个非常长的昵称" * 10},
                "expected_status": 400
            },
            {
                "name": "无效角色",
                "data": {**seeker_data, "phone": self.generate_unique_phone(), "role": "invalid_role", "nickname": "测试用户3"},
                "expected_status": 400
            },
            {
                "name": "错误验证码",
                "data": {**seeker_data, "phone": self.generate_unique_phone(), "verification_code": "000000", "nickname": "测试用户4"},
                "expected_status": 400
            }
        ]
        
        for test in boundary_tests:
            try:
                response = self.session.post(f"{API_BASE}/auth/register", json=test["data"])
                if response.status_code == test["expected_status"]:
                    self.log_result(f"边界测试-{test['name']}", True, f"正确返回{test['expected_status']}错误")
                else:
                    self.log_result(f"边界测试-{test['name']}", False, 
                        f"期望状态码{test['expected_status']}, 实际: {response.status_code}")
            except Exception as e:
                self.log_result(f"边界测试-{test['name']}", False, f"请求异常: {str(e)}")
        
        # 4. 测试登录系统
        if 'seeker' in self.test_users:
            login_data = {
                "phone": unique_seeker_phone,
                "verification_code": "123456"
            }
            
            try:
                response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
                if response.status_code == 200:
                    user_data = response.json()
                    self.log_result("用户登录", True, f"登录成功，用户: {user_data['nickname']}")
                else:
                    self.log_result("用户登录", False, f"状态码: {response.status_code}", critical=True)
            except Exception as e:
                self.log_result("用户登录", False, f"请求异常: {str(e)}", critical=True)
        
        # 5. 测试不存在用户登录
        try:
            nonexistent_login = {
                "phone": "13999999999",
                "verification_code": "123456"
            }
            response = self.session.post(f"{API_BASE}/auth/login", json=nonexistent_login)
            if response.status_code == 404:
                self.log_result("不存在用户登录处理", True, "正确返回用户不存在错误")
            else:
                self.log_result("不存在用户登录处理", False, 
                    f"应该返回404错误，实际: {response.status_code}", critical=True)
        except Exception as e:
            self.log_result("不存在用户登录处理", False, f"请求异常: {str(e)}")
    
    def test_divination_system_comprehensive(self):
        """全面测试塔罗占卜系统"""
        print("=== 🔮 全面测试塔罗占卜系统 ===")
        
        if 'seeker' not in self.test_users or 'reader' not in self.test_users:
            self.log_result("占卜系统测试", False, "缺少必要的测试用户", critical=True)
            return
        
        seeker_id = self.test_users['seeker']['id']
        reader_id = self.test_users['reader']['id']
        
        # 1. 测试创建占卜订单 - 正常情况
        order_data = {
            "question": "我的爱情运势",
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
                self.log_result("创建占卜订单", False, f"状态码: {response.status_code}, 响应: {response.text}", critical=True)
        except Exception as e:
            self.log_result("创建占卜订单", False, f"请求异常: {str(e)}", critical=True)
        
        # 2. 边界测试 - 问题字数限制
        boundary_questions = [
            {"question": "", "name": "空问题", "should_fail": True},
            {"question": "测试", "name": "正常短问题", "should_fail": False},
            {"question": "这是十个字的问题测试", "name": "10字边界问题", "should_fail": False},
            {"question": "这是一个超过十个字限制的很长问题", "name": "超长问题", "should_fail": True},
            {"question": "特殊字符@#$%^&*()", "name": "特殊字符问题", "should_fail": False}
        ]
        
        for test in boundary_questions:
            try:
                test_order = {
                    "question": test["question"],
                    "payment": 20
                }
                response = self.session.post(
                    f"{API_BASE}/divination/create?seeker_id={seeker_id}",
                    json=test_order
                )
                
                if test["should_fail"]:
                    if response.status_code == 400:
                        self.log_result(f"问题边界测试-{test['name']}", True, "正确拒绝无效问题")
                    else:
                        self.log_result(f"问题边界测试-{test['name']}", False, 
                            f"应该拒绝，实际状态码: {response.status_code}")
                else:
                    if response.status_code == 200:
                        self.log_result(f"问题边界测试-{test['name']}", True, "正确接受有效问题")
                    else:
                        self.log_result(f"问题边界测试-{test['name']}", False, 
                            f"应该接受，实际状态码: {response.status_code}")
            except Exception as e:
                self.log_result(f"问题边界测试-{test['name']}", False, f"请求异常: {str(e)}")
        
        # 3. 金币支付边界测试
        payment_tests = [
            {"payment": 0, "name": "零金币", "should_fail": True},
            {"payment": 5, "name": "低于最小值", "should_fail": True},
            {"payment": 10, "name": "最小值边界", "should_fail": False},
            {"payment": 25, "name": "中间值", "should_fail": False},
            {"payment": 50, "name": "最大值边界", "should_fail": False},
            {"payment": 51, "name": "超过最大值", "should_fail": True},
            {"payment": 1000, "name": "极大值", "should_fail": True},
            {"payment": -10, "name": "负数", "should_fail": True}
        ]
        
        for test in payment_tests:
            try:
                test_order = {
                    "question": "测试支付",
                    "payment": test["payment"]
                }
                response = self.session.post(
                    f"{API_BASE}/divination/create?seeker_id={seeker_id}",
                    json=test_order
                )
                
                if test["should_fail"]:
                    if response.status_code == 400:
                        self.log_result(f"支付边界测试-{test['name']}", True, "正确拒绝无效支付")
                    else:
                        self.log_result(f"支付边界测试-{test['name']}", False, 
                            f"应该拒绝，实际状态码: {response.status_code}")
                else:
                    if response.status_code == 200:
                        self.log_result(f"支付边界测试-{test['name']}", True, "正确接受有效支付")
                    else:
                        self.log_result(f"支付边界测试-{test['name']}", False, 
                            f"应该接受，实际状态码: {response.status_code}")
            except Exception as e:
                self.log_result(f"支付边界测试-{test['name']}", False, f"请求异常: {str(e)}")
        
        # 4. 测试获取待接单列表
        try:
            response = self.session.get(f"{API_BASE}/divination/pending")
            if response.status_code == 200:
                orders = response.json()
                self.log_result("获取待接单列表", True, f"获取到 {len(orders)} 个待接订单")
            else:
                self.log_result("获取待接单列表", False, f"状态码: {response.status_code}", critical=True)
        except Exception as e:
            self.log_result("获取待接单列表", False, f"请求异常: {str(e)}", critical=True)
        
        # 5. 测试塔罗师接单和抽牌逻辑
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
                    
                    # 验证抽牌逻辑
                    if len(cards) == 3:
                        positions = [card['position'] for card in cards]
                        if set(positions) == {1, 2, 3}:
                            self.log_result("圣三角牌阵验证", True, "正确生成过去-现在-未来三张牌")
                            
                            # 验证每张牌的数据完整性
                            for i, card in enumerate(cards):
                                required_fields = ['card', 'name', 'position', 'reversed', 'meaning']
                                if all(field in card for field in required_fields):
                                    self.log_result(f"牌{i+1}数据完整性", True, f"牌名: {card['name']}, 位置: {card['position']}")
                                else:
                                    self.log_result(f"牌{i+1}数据完整性", False, f"缺少必要字段: {card}")
                        else:
                            self.log_result("圣三角牌阵验证", False, f"牌位不正确: {positions}", critical=True)
                    else:
                        self.log_result("圣三角牌阵验证", False, f"应该抽3张牌，实际: {len(cards)}", critical=True)
                    
                    if ai_suggestion:
                        self.log_result("AI建议生成", True, f"AI建议: {ai_suggestion[:30]}...")
                    else:
                        self.log_result("AI建议生成", False, "AI建议为空")
                        
                    self.log_result("塔罗师接单", True, "接单成功")
                else:
                    self.log_result("塔罗师接单", False, f"状态码: {response.status_code}", critical=True)
            except Exception as e:
                self.log_result("塔罗师接单", False, f"请求异常: {str(e)}", critical=True)
        
        # 6. 测试解读提交
        if 'main' in self.test_orders:
            interpretation_tests = [
                {
                    "interpretation": "根据您抽到的牌组，过去的经历为现在的爱情奠定了基础，建议您保持开放的心态。",
                    "name": "正常解读",
                    "should_pass": True
                },
                {
                    "interpretation": "",
                    "name": "空解读",
                    "should_pass": False
                },
                {
                    "interpretation": "这是一个非常长的解读内容，" * 20,  # 超过100字
                    "name": "超长解读",
                    "should_pass": False
                }
            ]
            
            for test in interpretation_tests:
                try:
                    interpretation_data = {
                        "order_id": self.test_orders['main']['id'],
                        "interpretation": test["interpretation"]
                    }
                    
                    response = self.session.post(f"{API_BASE}/divination/interpret", json=interpretation_data)
                    
                    if test["should_pass"]:
                        if response.status_code == 200:
                            result = response.json()
                            earning = result.get('earning', 0)
                            self.log_result(f"解读测试-{test['name']}", True, f"解读提交成功，收益: {earning}金币")
                        else:
                            self.log_result(f"解读测试-{test['name']}", False, 
                                f"应该成功，实际状态码: {response.status_code}")
                    else:
                        if response.status_code == 400:
                            self.log_result(f"解读测试-{test['name']}", True, "正确拒绝无效解读")
                        else:
                            self.log_result(f"解读测试-{test['name']}", False, 
                                f"应该拒绝，实际状态码: {response.status_code}")
                except Exception as e:
                    self.log_result(f"解读测试-{test['name']}", False, f"请求异常: {str(e)}")
    
    def test_coin_transaction_comprehensive(self):
        """全面测试金币交易系统"""
        print("=== 💰 全面测试金币交易系统 ===")
        
        if 'seeker' not in self.test_users or 'reader' not in self.test_users:
            self.log_result("金币交易测试", False, "缺少必要的测试用户", critical=True)
            return
        
        seeker_id = self.test_users['seeker']['id']
        reader_id = self.test_users['reader']['id']
        
        # 1. 获取初始余额
        try:
            seeker_response = self.session.get(f"{API_BASE}/users/{seeker_id}")
            reader_response = self.session.get(f"{API_BASE}/users/{reader_id}")
            
            if seeker_response.status_code == 200 and reader_response.status_code == 200:
                initial_seeker_coins = seeker_response.json()['coins']
                initial_reader_coins = reader_response.json()['coins']
                
                self.log_result("获取初始余额", True, 
                    f"求测者: {initial_seeker_coins}金币, 塔罗师: {initial_reader_coins}金币")
                
                # 2. 测试金币扣除逻辑
                test_payment = 25
                order_data = {
                    "question": "金币测试",
                    "payment": test_payment
                }
                
                response = self.session.post(
                    f"{API_BASE}/divination/create?seeker_id={seeker_id}",
                    json=order_data
                )
                
                if response.status_code == 200:
                    order = response.json()
                    
                    # 验证金币立即扣除
                    seeker_response = self.session.get(f"{API_BASE}/users/{seeker_id}")
                    if seeker_response.status_code == 200:
                        current_coins = seeker_response.json()['coins']
                        expected_coins = initial_seeker_coins - test_payment
                        
                        if current_coins == expected_coins:
                            self.log_result("订单创建时金币扣除", True, 
                                f"正确扣除{test_payment}金币，余额: {current_coins}")
                        else:
                            self.log_result("订单创建时金币扣除", False, 
                                f"期望余额{expected_coins}，实际: {current_coins}", critical=True)
                    
                    # 3. 测试塔罗师接单和收益分配
                    accept_response = self.session.post(
                        f"{API_BASE}/divination/accept/{order['id']}?reader_id={reader_id}"
                    )
                    
                    if accept_response.status_code == 200:
                        # 提交解读以完成交易
                        interpretation_data = {
                            "order_id": order['id'],
                            "interpretation": "测试解读内容"
                        }
                        
                        interpret_response = self.session.post(
                            f"{API_BASE}/divination/interpret", 
                            json=interpretation_data
                        )
                        
                        if interpret_response.status_code == 200:
                            result = interpret_response.json()
                            earning = result.get('earning', 0)
                            
                            # 验证平台抽成计算
                            expected_platform_fee = int(test_payment * 0.1)
                            expected_earning = test_payment - expected_platform_fee
                            
                            if earning == expected_earning:
                                self.log_result("平台抽成计算", True, 
                                    f"正确计算收益: {earning}金币 (扣除{expected_platform_fee}平台费)")
                            else:
                                self.log_result("平台抽成计算", False, 
                                    f"期望收益{expected_earning}，实际: {earning}", critical=True)
                            
                            # 验证塔罗师余额增加
                            reader_response = self.session.get(f"{API_BASE}/users/{reader_id}")
                            if reader_response.status_code == 200:
                                final_reader_coins = reader_response.json()['coins']
                                expected_reader_coins = initial_reader_coins + earning
                                
                                if final_reader_coins == expected_reader_coins:
                                    self.log_result("塔罗师收益到账", True, 
                                        f"正确增加{earning}金币，余额: {final_reader_coins}")
                                else:
                                    self.log_result("塔罗师收益到账", False, 
                                        f"期望余额{expected_reader_coins}，实际: {final_reader_coins}", critical=True)
                
                # 4. 测试余额不足情况
                current_seeker_response = self.session.get(f"{API_BASE}/users/{seeker_id}")
                if current_seeker_response.status_code == 200:
                    current_balance = current_seeker_response.json()['coins']
                    
                    # 尝试创建超出余额的订单
                    insufficient_order = {
                        "question": "余额不足测试",
                        "payment": current_balance + 100
                    }
                    
                    response = self.session.post(
                        f"{API_BASE}/divination/create?seeker_id={seeker_id}",
                        json=insufficient_order
                    )
                    
                    if response.status_code == 400 and "余额不足" in response.text:
                        self.log_result("余额不足处理", True, "正确拒绝余额不足的订单")
                    else:
                        self.log_result("余额不足处理", False, 
                            f"应该拒绝余额不足订单，状态码: {response.status_code}", critical=True)
                
            else:
                self.log_result("获取初始余额", False, "无法获取用户余额信息", critical=True)
        except Exception as e:
            self.log_result("金币交易测试", False, f"请求异常: {str(e)}", critical=True)
    
    def test_social_system_comprehensive(self):
        """全面测试社交系统"""
        print("=== 👥 全面测试社交系统 ===")
        
        if 'seeker' not in self.test_users or 'reader' not in self.test_users:
            self.log_result("社交系统测试", False, "缺少必要的测试用户", critical=True)
            return
        
        seeker_id = self.test_users['seeker']['id']
        reader_id = self.test_users['reader']['id']
        
        # 1. 测试添加好友
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
                self.log_result("添加好友", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.log_result("添加好友", False, f"请求异常: {str(e)}")
        
        # 2. 测试评价系统边界
        if 'main' in self.test_orders:
            rating_tests = [
                {"rating": 1, "name": "最低评分", "should_pass": True},
                {"rating": 3, "name": "中等评分", "should_pass": True},
                {"rating": 5, "name": "最高评分", "should_pass": True},
                {"rating": 0, "name": "低于最小值", "should_pass": False},
                {"rating": 6, "name": "超过最大值", "should_pass": False},
                {"rating": -1, "name": "负数评分", "should_pass": False}
            ]
            
            for test in rating_tests:
                try:
                    rating_data = {
                        "order_id": self.test_orders['main']['id'],
                        "rating": test["rating"]
                    }
                    
                    response = self.session.post(f"{API_BASE}/divination/rate", json=rating_data)
                    
                    if test["should_pass"]:
                        if response.status_code == 200:
                            self.log_result(f"评分测试-{test['name']}", True, f"成功提交{test['rating']}星评价")
                        else:
                            self.log_result(f"评分测试-{test['name']}", False, 
                                f"应该成功，实际状态码: {response.status_code}")
                    else:
                        if response.status_code == 400:
                            self.log_result(f"评分测试-{test['name']}", True, "正确拒绝无效评分")
                        else:
                            self.log_result(f"评分测试-{test['name']}", False, 
                                f"应该拒绝，实际状态码: {response.status_code}")
                except Exception as e:
                    self.log_result(f"评分测试-{test['name']}", False, f"请求异常: {str(e)}")
        
        # 3. 测试用户历史记录
        try:
            response = self.session.get(f"{API_BASE}/users/{seeker_id}/history")
            if response.status_code == 200:
                history = response.json()
                self.log_result("用户历史记录", True, f"成功获取 {len(history)} 条历史记录")
            else:
                self.log_result("用户历史记录", False, f"状态码: {response.status_code}")
        except Exception as e:
            self.log_result("用户历史记录", False, f"请求异常: {str(e)}")
    
    def test_concurrent_operations(self):
        """测试并发操作"""
        print("=== ⚡ 测试并发操作 ===")
        
        # 1. 并发注册测试
        def concurrent_register(index):
            user_data = {
                "phone": f"139{random.randint(10000000, 99999999)}",
                "nickname": f"并发测试用户{index}",
                "role": "seeker",
                "verification_code": "123456"
            }
            
            try:
                response = requests.post(f"{API_BASE}/auth/register", json=user_data)
                return {
                    "index": index,
                    "status_code": response.status_code,
                    "success": response.status_code == 200,
                    "user_id": response.json().get('id') if response.status_code == 200 else None
                }
            except Exception as e:
                return {
                    "index": index,
                    "status_code": 0,
                    "success": False,
                    "error": str(e)
                }
        
        # 执行并发注册
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(concurrent_register, i) for i in range(5)]
            concurrent_results = [future.result() for future in as_completed(futures)]
        
        successful_registrations = sum(1 for result in concurrent_results if result['success'])
        self.log_result("并发用户注册", True, f"5个并发请求中 {successful_registrations} 个成功")
        
        # 2. 并发订单创建测试（如果有可用用户）
        if 'seeker' in self.test_users:
            seeker_id = self.test_users['seeker']['id']
            
            def concurrent_order_create(index):
                order_data = {
                    "question": f"并发测试{index}",
                    "payment": random.randint(10, 50)
                }
                
                try:
                    response = requests.post(
                        f"{API_BASE}/divination/create?seeker_id={seeker_id}",
                        json=order_data
                    )
                    return {
                        "index": index,
                        "status_code": response.status_code,
                        "success": response.status_code == 200
                    }
                except Exception as e:
                    return {
                        "index": index,
                        "status_code": 0,
                        "success": False,
                        "error": str(e)
                    }
            
            # 执行并发订单创建
            with ThreadPoolExecutor(max_workers=3) as executor:
                futures = [executor.submit(concurrent_order_create, i) for i in range(3)]
                order_results = [future.result() for future in as_completed(futures)]
            
            successful_orders = sum(1 for result in order_results if result['success'])
            self.log_result("并发订单创建", True, f"3个并发请求中 {successful_orders} 个成功")
    
    def test_database_operations(self):
        """测试数据库操作和数据完整性"""
        print("=== 🗄️ 测试数据库操作和数据完整性 ===")
        
        # 1. 测试数据持久性
        if 'seeker' in self.test_users:
            user_id = self.test_users['seeker']['id']
            
            # 多次获取用户信息，验证数据一致性
            responses = []
            for i in range(3):
                try:
                    response = self.session.get(f"{API_BASE}/users/{user_id}")
                    if response.status_code == 200:
                        responses.append(response.json())
                    time.sleep(0.1)
                except Exception as e:
                    self.log_result("数据持久性测试", False, f"请求异常: {str(e)}")
                    return
            
            if len(responses) == 3:
                # 验证数据一致性
                if all(resp['id'] == responses[0]['id'] and 
                      resp['nickname'] == responses[0]['nickname'] for resp in responses):
                    self.log_result("数据持久性和一致性", True, "多次查询数据保持一致")
                else:
                    self.log_result("数据持久性和一致性", False, "数据不一致", critical=True)
        
        # 2. 测试无效ID处理
        invalid_ids = ["", "invalid-id", "00000000-0000-0000-0000-000000000000", "null"]
        
        for invalid_id in invalid_ids:
            try:
                response = self.session.get(f"{API_BASE}/users/{invalid_id}")
                if response.status_code == 404:
                    self.log_result(f"无效ID处理-{invalid_id}", True, "正确返回404错误")
                else:
                    self.log_result(f"无效ID处理-{invalid_id}", False, 
                        f"应该返回404，实际: {response.status_code}")
            except Exception as e:
                self.log_result(f"无效ID处理-{invalid_id}", False, f"请求异常: {str(e)}")
    
    def test_error_handling(self):
        """测试错误处理"""
        print("=== ⚠️ 测试错误处理 ===")
        
        # 1. 测试HTTP方法错误
        try:
            response = self.session.get(f"{API_BASE}/auth/register")  # 应该是POST
            if response.status_code == 405:
                self.log_result("HTTP方法错误处理", True, "正确返回405 Method Not Allowed")
            else:
                self.log_result("HTTP方法错误处理", False, f"期望405，实际: {response.status_code}")
        except Exception as e:
            self.log_result("HTTP方法错误处理", False, f"请求异常: {str(e)}")
        
        # 2. 测试无效JSON
        try:
            response = self.session.post(
                f"{API_BASE}/auth/register",
                data="invalid json",
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code == 422:
                self.log_result("无效JSON处理", True, "正确返回422 Unprocessable Entity")
            else:
                self.log_result("无效JSON处理", False, f"期望422，实际: {response.status_code}")
        except Exception as e:
            self.log_result("无效JSON处理", False, f"请求异常: {str(e)}")
        
        # 3. 测试不存在的端点
        try:
            response = self.session.get(f"{API_BASE}/nonexistent/endpoint")
            if response.status_code == 404:
                self.log_result("不存在端点处理", True, "正确返回404 Not Found")
            else:
                self.log_result("不存在端点处理", False, f"期望404，实际: {response.status_code}")
        except Exception as e:
            self.log_result("不存在端点处理", False, f"请求异常: {str(e)}")
    
    def run_comprehensive_tests(self):
        """运行全面测试"""
        print("🔮 开始《玄机妙算世界》塔罗占卜应用后端API深度全面测试")
        print(f"📡 测试服务器: {API_BASE}")
        print("🎯 测试范围: 边界测试、并发测试、错误处理、业务逻辑验证")
        print("=" * 80)
        
        # 按优先级顺序执行测试
        self.test_user_authentication_comprehensive()
        self.test_divination_system_comprehensive()
        self.test_coin_transaction_comprehensive()
        self.test_social_system_comprehensive()
        self.test_concurrent_operations()
        self.test_database_operations()
        self.test_error_handling()
        
        # 输出详细测试总结
        print("=" * 80)
        print("🎯 深度测试总结")
        print(f"✅ 通过: {self.results['passed']} 项")
        print(f"❌ 失败: {self.results['failed']} 项")
        
        if self.results['critical_issues']:
            print(f"\n🚨 严重问题 ({len(self.results['critical_issues'])} 项):")
            for issue in self.results['critical_issues']:
                print(f"   • {issue}")
        
        if self.results['minor_issues']:
            print(f"\n⚠️ 次要问题 ({len(self.results['minor_issues'])} 项):")
            for issue in self.results['minor_issues']:
                print(f"   • {issue}")
        
        total_tests = self.results['passed'] + self.results['failed']
        success_rate = (self.results['passed'] / total_tests) * 100 if total_tests > 0 else 0
        print(f"\n📊 成功率: {success_rate:.1f}%")
        
        # 测试质量评估
        if len(self.results['critical_issues']) == 0:
            print("🎉 核心功能测试通过，无严重问题发现")
        else:
            print("⚠️ 发现严重问题，需要立即修复")
        
        return self.results

if __name__ == "__main__":
    tester = ComprehensiveTarotAPITester()
    results = tester.run_comprehensive_tests()