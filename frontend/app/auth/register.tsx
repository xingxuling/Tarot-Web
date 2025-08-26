import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

type UserRole = 'seeker' | 'reader';

export default function Register() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('seeker');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [registerStatus, setRegisterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleGoToLogin = () => {
    console.log('导航到登录页面');
    router.push('/auth/login');
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

  const handleRegister = async () => {
    if (!phone || !nickname || !verificationCode) {
      setRegisterStatus('error');
      setStatusMessage('请填写完整信息');
      setTimeout(() => setRegisterStatus('idle'), 3000);
      return;
    }

    if (nickname.length < 2 || nickname.length > 10) {
      setRegisterStatus('error');
      setStatusMessage('昵称长度应在2-10字符之间');
      setTimeout(() => setRegisterStatus('idle'), 3000);
      return;
    }

    setIsLoading(true);
    setRegisterStatus('loading');
    setStatusMessage('正在注册...');

    try {
      console.log('开始注册请求...', { phone, nickname, selectedRole });
      
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          nickname,
          role: selectedRole,
          verification_code: verificationCode,
        }),
      });

      const data = await response.json();
      console.log('注册响应:', response.status, data);

      if (response.ok) {
        setRegisterStatus('success');
        setStatusMessage(`注册成功！欢迎${selectedRole === 'seeker' ? '求测者' : '塔罗师'} ${nickname}！`);
        
        // 3秒后重置状态
        setTimeout(() => {
          setRegisterStatus('idle');
          setStatusMessage('');
          // TODO: 导航到主页面
        }, 3000);
      } else {
        // 显示具体的错误信息
        let errorMessage = data.detail || '注册失败，请稍后重试';
        
        // 针对常见错误提供友好提示
        if (errorMessage.includes('手机号已注册')) {
          errorMessage = '该手机号已经注册过了，请直接登录或使用其他手机号';
        } else if (errorMessage.includes('验证码错误')) {
          errorMessage = '验证码错误，请输入正确的验证码（测试环境请输入：123456）';
        }
        
        setRegisterStatus('error');
        setStatusMessage(errorMessage);
        setTimeout(() => setRegisterStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('注册网络错误:', error);
      setRegisterStatus('error');
      setStatusMessage('网络连接失败，请检查网络后重试');
      setTimeout(() => setRegisterStatus('idle'), 5000);
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
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>欢迎加入</Text>
            <Text style={styles.subtitle}>玄机妙算世界</Text>
            <View style={styles.decorativeLine} />
          </View>

          {/* Role Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>选择身份</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'seeker' && styles.roleButtonSelected,
                ]}
                onPress={() => setSelectedRole('seeker')}
              >
                <Ionicons 
                  name="search" 
                  size={24} 
                  color={selectedRole === 'seeker' ? '#DAA520' : '#666'} 
                />
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === 'seeker' && styles.roleTextSelected,
                  ]}
                >
                  求测者
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'reader' && styles.roleButtonSelected,
                ]}
                onPress={() => setSelectedRole('reader')}
              >
                <Ionicons 
                  name="eye" 
                  size={24} 
                  color={selectedRole === 'reader' ? '#DAA520' : '#666'} 
                />
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === 'reader' && styles.roleTextSelected,
                  ]}
                >
                  塔罗师
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>基本信息</Text>
            
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
                      {codeSent ? '重新发送' : '发送验证码'}
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
                  placeholder="请输入验证码"
                  placeholderTextColor="#666"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            )}

            {/* Nickname */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>昵称</Text>
              <TextInput
                style={styles.textInput}
                placeholder="请输入昵称（2-10字符）"
                placeholderTextColor="#666"
                value={nickname}
                onChangeText={setNickname}
                maxLength={10}
              />
            </View>
          </View>

          {/* Status Message */}
          {registerStatus !== 'idle' && (
            <View style={[
              styles.statusContainer,
              registerStatus === 'success' && styles.statusSuccess,
              registerStatus === 'error' && styles.statusError,
              registerStatus === 'loading' && styles.statusLoading,
            ]}>
              {registerStatus === 'loading' && (
                <ActivityIndicator size="small" color={registerStatus === 'loading' ? '#DAA520' : '#FFF'} />
              )}
              <Ionicons 
                name={
                  registerStatus === 'success' ? 'checkmark-circle' :
                  registerStatus === 'error' ? 'alert-circle' :
                  'hourglass'
                } 
                size={20} 
                color={
                  registerStatus === 'success' ? '#4CAF50' :
                  registerStatus === 'error' ? '#FF3B30' :
                  '#DAA520'
                }
                style={{ marginRight: 8 }}
              />
              <Text style={[
                styles.statusText,
                registerStatus === 'success' && styles.statusTextSuccess,
                registerStatus === 'error' && styles.statusTextError,
              ]}>
                {statusMessage}
              </Text>
            </View>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              (!phone || !nickname || !verificationCode) && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!phone || !nickname || !verificationCode || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.registerButtonText}>立即注册</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity style={styles.loginLink} onPress={handleGoToLogin}>
            <Text style={styles.loginLinkText}>
              已有账号？
              <Text style={styles.loginLinkHighlight}> 立即登录</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DAA520',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E6E6E6',
    marginBottom: 16,
  },
  decorativeLine: {
    width: 60,
    height: 2,
    backgroundColor: '#DAA520',
    borderRadius: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  roleButtonSelected: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderColor: '#DAA520',
  },
  roleText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  roleTextSelected: {
    color: '#DAA520',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
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
    paddingVertical: 12,
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
    paddingVertical: 12,
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
  registerButton: {
    backgroundColor: '#DAA520',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusLoading: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.3)',
  },
  statusSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusError: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  statusTextSuccess: {
    color: '#4CAF50',
  },
  statusTextError: {
    color: '#FF3B30',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginLinkText: {
    color: '#888',
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: '#DAA520',
    fontWeight: '600',
  },
});