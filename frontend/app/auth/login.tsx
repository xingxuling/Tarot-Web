import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleGoToRegister = () => {
    console.log('导航到注册页面');
    router.push('/auth/register');
  };

  const sendVerificationCode = async () => {
    if (!phone || phone.length !== 11) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    setIsLoading(true);
    // 模拟发送验证码
    setTimeout(() => {
      setCodeSent(true);
      setIsLoading(false);
      Alert.alert('验证码已发送', '请查收短信验证码（测试环境请输入：123456）');
    }, 1000);
  };

  const handleLogin = async () => {
    if (!phone || !verificationCode) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          verification_code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          '登录成功',
          `欢迎回来，${data.nickname}！`,
          [
            {
              text: '继续',
              onPress: () => {
                // TODO: 保存用户信息并导航到主页
              },
            },
          ]
        );
      } else {
        Alert.alert('登录失败', data.detail || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="diamond" size={48} color="#DAA520" />
          <Text style={styles.title}>玄机妙算世界</Text>
          <Text style={styles.subtitle}>欢迎回来</Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>手机号</Text>
            <View style={styles.phoneInputContainer}>
              <TextInput
                style={[styles.textInput, styles.phoneInput]}
                placeholder="请输入手机号"
                placeholderTextColor="#666"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={11}
              />
              <TouchableOpacity
                style={[
                  styles.codeButton,
                  (!phone || phone.length !== 11) && styles.codeButtonDisabled,
                ]}
                onPress={sendVerificationCode}
                disabled={!phone || phone.length !== 11 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.codeButtonText}>
                    {codeSent ? '重新发送' : '获取验证码'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Verification Code */}
          {codeSent && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>验证码</Text>
              <TextInput
                style={styles.textInput}
                placeholder="请输入6位验证码"
                placeholderTextColor="#666"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (!phone || !verificationCode) && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!phone || !verificationCode || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.loginButtonText}>立即登录</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity style={styles.registerLink}>
            <Text style={styles.registerLinkText}>
              还没有账号？
              <Text style={styles.registerLinkHighlight}> 立即注册</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            登录即表示您同意我们的服务条款和隐私政策
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DAA520',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E6E6E6',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    marginRight: 12,
  },
  codeButton: {
    backgroundColor: '#DAA520',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  codeButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  codeButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#DAA520',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  registerLinkText: {
    color: '#888',
    fontSize: 14,
  },
  registerLinkHighlight: {
    color: '#DAA520',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    marginTop: 'auto',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});