import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock用户数据（实际应该从用户上下文获取）
const mockUser = {
  id: 'mock-user-id',
  nickname: '神秘占卜师',
  role: 'reader', // 'seeker' | 'reader'
  coins: 150,
  reputation: 4.8,
};

export default function Home() {
  const router = useRouter();
  const [dailyCards, setDailyCards] = useState<any[]>([]);

  const handleDailyCard = () => {
    // 每日一卡功能
    const cards = ['愚者', '魔术师', '女祭司', '皇后', '皇帝'];
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    
    Alert.alert(
      '每日塔罗',
      `今日为您抽取：${randomCard}\n\n这张牌提醒您保持开放的心态，接受新的可能性。`,
      [{ text: '知道了' }]
    );
  };

  const quickActions = [
    {
      id: 'divination',
      title: '发起占卜',
      icon: 'crystal-ball',
      color: '#DAA520',
      onPress: () => router.push('/divination/create'),
      description: '寻找答案',
    },
    {
      id: 'hall',
      title: '接单大厅',
      icon: 'eye',
      color: '#8A2BE2',
      onPress: () => router.push('/divination/hall'),
      description: '为他人解读',
    },
    {
      id: 'friends',
      title: '好友',
      icon: 'people',
      color: '#FF6B6B',
      onPress: () => router.push('/(tabs)/social'),
      description: '社交互动',
    },
    {
      id: 'history',
      title: '历史记录',
      icon: 'time',
      color: '#4ECDC4',
      onPress: () => router.push('/(tabs)/orders'),
      description: '查看记录',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1607773709367-06b7a91f7e4a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          }}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <View style={styles.headerOverlay} />
          <View style={styles.header}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>欢迎回来</Text>
              <Text style={styles.userName}>{mockUser.nickname}</Text>
              <View style={styles.roleContainer}>
                <Ionicons 
                  name={mockUser.role === 'seeker' ? 'search' : 'eye'} 
                  size={16} 
                  color="#DAA520" 
                />
                <Text style={styles.roleText}>
                  {mockUser.role === 'seeker' ? '求测者' : '塔罗师'}
                </Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="diamond" size={20} color="#DAA520" />
                <Text style={styles.statValue}>{mockUser.coins}</Text>
                <Text style={styles.statLabel}>金币</Text>
              </View>
              {mockUser.role === 'reader' && (
                <View style={styles.statItem}>
                  <Ionicons name="star" size={20} color="#DAA520" />
                  <Text style={styles.statValue}>{mockUser.reputation}</Text>
                  <Text style={styles.statLabel}>信誉</Text>
                </View>
              )}
            </View>
          </View>
        </ImageBackground>

        {/* Daily Card */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dailyCard} onPress={handleDailyCard}>
            <View style={styles.dailyCardContent}>
              <View style={styles.dailyCardLeft}>
                <Ionicons name="calendar" size={24} color="#DAA520" />
                <View style={styles.dailyCardText}>
                  <Text style={styles.dailyCardTitle}>每日塔罗</Text>
                  <Text style={styles.dailyCardDesc}>今日运势抽卡</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速操作</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDesc}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近活动</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/orders')}>
              <Text style={styles.sectionLink}>查看全部</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>完成占卜解读</Text>
                <Text style={styles.activityDesc}>为"近期爱情运势"提供了专业解读</Text>
                <Text style={styles.activityTime}>2小时前</Text>
              </View>
              <Text style={styles.activityReward}>+18金币</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="star" size={20} color="#DAA520" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>获得5星好评</Text>
                <Text style={styles.activityDesc}>求测者对您的解读非常满意</Text>
                <Text style={styles.activityTime}>5小时前</Text>
              </View>
              <Text style={styles.activityReward}>+0.2信誉</Text>
            </View>
          </div>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color="#FFD700" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>占卜小贴士</Text>
              <Text style={styles.tipText}>
                保持内心平静，专注于问题本质，塔罗牌会为您指引方向。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerBackground: {
    height: 200,
    marginBottom: 20,
  },
  headerBackgroundImage: {
    opacity: 0.3,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  header: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    color: '#DAA520',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  sectionLink: {
    color: '#DAA520',
    fontSize: 14,
    fontWeight: '500',
  },
  dailyCard: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.3)',
    borderRadius: 16,
    padding: 20,
  },
  dailyCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dailyCardText: {
    marginLeft: 16,
  },
  dailyCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dailyCardDesc: {
    color: '#888',
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDesc: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  activityContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDesc: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
  activityTime: {
    color: '#666',
    fontSize: 10,
  },
  activityReward: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    color: '#E6E6E6',
    fontSize: 14,
    lineHeight: 20,
  },
});