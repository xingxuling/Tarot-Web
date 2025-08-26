import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Index() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const handleRoleSelection = (role: 'seeker' | 'reader') => {
    const roleName = role === 'seeker' ? '求测者' : '塔罗师';
    setSelectedRole(roleName);
    setShowFeedback(true);
    
    console.log(`用户选择了${roleName}身份`);
    
    // 显示反馈3秒后隐藏
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedRole('');
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      
      {/* 背景图片 */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1607773709367-06b7a91f7e4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        {/* 半透明遮罩 */}
        <View style={styles.overlay} />
        
        {/* 主要内容 */}
        <View style={styles.content}>
          {/* 标题区域 */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>玄机妙算世界</Text>
            <Text style={styles.subtitle}>探索命运的奥秘</Text>
            
            {/* 装饰性图标 */}
            <View style={styles.iconContainer}>
              <Ionicons name="star" size={20} color="#DAA520" />
              <Ionicons name="diamond" size={24} color="#DAA520" style={styles.centerIcon} />
              <Ionicons name="star" size={20} color="#DAA520" />
            </View>
          </View>
          
          {/* 角色选择区域 */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleTitle}>选择您的身份</Text>
            
            {/* 反馈显示区域 */}
            {showFeedback && (
              <View style={styles.feedbackContainer}>
                <Ionicons name="checkmark-circle" size={32} color="#DAA520" />
                <Text style={styles.feedbackText}>
                  您选择了：{selectedRole}
                </Text>
                <Text style={styles.feedbackSubtext}>
                  《玄机妙算世界》MVP版本
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[
                styles.roleButton,
                selectedRole === '求测者' && styles.roleButtonSelected,
              ]}
              onPress={() => handleRoleSelection('seeker')}
              activeOpacity={0.8}
            >
              <View style={styles.roleIconContainer}>
                <Ionicons name="search" size={32} color="#DAA520" />
              </View>
              <Text style={styles.roleButtonText}>我要求测</Text>
              <Text style={styles.roleDescription}>寻找生活中的答案</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.roleButton,
                selectedRole === '塔罗师' && styles.roleButtonSelected,
              ]}
              onPress={() => handleRoleSelection('reader')}
              activeOpacity={0.8}
            >
              <View style={styles.roleIconContainer}>
                <Ionicons name="eye" size={32} color="#DAA520" />
              </View>
              <Text style={styles.roleButtonText}>我是塔罗师</Text>
              <Text style={styles.roleDescription}>为他人解读命运</Text>
            </TouchableOpacity>
          </View>
          
          {/* 底部信息 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              体验神秘的塔罗占卜文化
            </Text>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    opacity: 0.7,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#DAA520',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E6E6E6',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerIcon: {
    marginHorizontal: 16,
  },
  roleContainer: {
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
  },
  roleButton: {
    backgroundColor: 'rgba(218, 165, 32, 0.15)',
    borderWidth: 1,
    borderColor: '#DAA520',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginBottom: 20,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  roleButtonSelected: {
    backgroundColor: 'rgba(218, 165, 32, 0.3)',
    borderWidth: 2,
    borderColor: '#DAA520',
    transform: [{ scale: 1.02 }],
  },
  feedbackContainer: {
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
    borderWidth: 1,
    borderColor: '#DAA520',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    minWidth: 280,
  },
  feedbackText: {
    fontSize: 18,
    color: '#DAA520',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  feedbackSubtext: {
    fontSize: 14,
    color: '#E6E6E6',
    textAlign: 'center',
    opacity: 0.8,
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DAA520',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#B8B8B8',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: '#DAA520',
    fontSize: 16,
    marginTop: 16,
  },
});