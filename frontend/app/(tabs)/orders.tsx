import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface DivinationOrder {
  id: string;
  seeker_id: string;
  reader_id?: string;
  question: string;
  payment: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  cards_drawn?: any[];
  interpretation?: string;
  ai_suggestion?: string;
  created_at: string;
  completed_at?: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<DivinationOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Mock用户ID（实际应该从用户上下文获取）
  const userId = 'mock-user-id';

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}/history`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data);
      } else {
        Alert.alert('获取失败', '无法加载订单历史');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'pending':
        return orders.filter(order => order.status === 'pending' || order.status === 'accepted');
      case 'completed':
        return orders.filter(order => order.status === 'completed');
      default:
        return orders;
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '等待接单', color: '#FF9500', icon: 'time' };
      case 'accepted':
        return { text: '正在占卜', color: '#007AFF', icon: 'hourglass' };
      case 'completed':
        return { text: '已完成', color: '#34C759', icon: 'checkmark-circle' };
      case 'cancelled':
        return { text: '已取消', color: '#FF3B30', icon: 'close-circle' };
      default:
        return { text: '未知', color: '#8E8E93', icon: 'help-circle' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOrderPress = (order: DivinationOrder) => {
    // TODO: 导航到订单详情页
    Alert.alert(
      '订单详情',
      `问题：${order.question}\n状态：${getStatusInfo(order.status).text}\n金币：${order.payment}`,
      [{ text: '确定' }]
    );
  };

  const handleRateOrder = (orderId: string) => {
    Alert.alert(
      '评价塔罗师',
      '请为这次占卜服务评分',
      [
        { text: '取消', style: 'cancel' },
        { text: '1星', onPress: () => submitRating(orderId, 1) },
        { text: '3星', onPress: () => submitRating(orderId, 3) },
        { text: '5星', onPress: () => submitRating(orderId, 5) },
      ]
    );
  };

  const submitRating = async (orderId: string, rating: number) => {
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/divination/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          rating,
        }),
      });

      if (response.ok) {
        Alert.alert('评价成功', '感谢您的评价！');
      } else {
        Alert.alert('评价失败', '请稍后重试');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderOrderItem = ({ item }: { item: DivinationOrder }) => {
    const statusInfo = getStatusInfo(item.status);
    const isCompleted = item.status === 'completed';

    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => handleOrderPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.orderHeader}>
          <View style={styles.questionContainer}>
            <Text style={styles.question} numberOfLines={2}>
              {item.question}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="diamond" size={16} color="#DAA520" />
              <Text style={styles.infoText}>{item.payment} 金币</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.infoText}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
          
          {item.cards_drawn && (
            <View style={styles.cardsContainer}>
              <Text style={styles.cardsTitle}>抽取的牌：</Text>
              <View style={styles.cardsRow}>
                {item.cards_drawn.map((card, index) => (
                  <View key={index} style={styles.cardItem}>
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardPosition}>
                      {card.position === 1 ? '过去' : card.position === 2 ? '现在' : '未来'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {item.interpretation && (
            <View style={styles.interpretationContainer}>
              <Text style={styles.interpretationTitle}>塔罗师解读：</Text>
              <Text style={styles.interpretationText} numberOfLines={3}>
                {item.interpretation}
              </Text>
            </View>
          )}
        </View>

        {isCompleted && !item.interpretation && (
          <View style={styles.orderActions}>
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => handleRateOrder(item.id)}
            >
              <Ionicons name="star" size={16} color="#DAA520" />
              <Text style={styles.rateButtonText}>评价</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DAA520" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Filter */}
      <View style={styles.tabContainer}>
        {['all', 'pending', 'completed'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab === 'all' ? '全部' : tab === 'pending' ? '进行中' : '已完成'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchOrders(true)}
            tintColor="#DAA520"
            colors={['#DAA520']}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>暂无订单记录</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'all' ? '开始您的第一次占卜吧' : 
               activeTab === 'pending' ? '暂无进行中的订单' : '暂无已完成的订单'}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#DAA520',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#000',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    marginBottom: 12,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  question: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#888',
    fontSize: 14,
    marginLeft: 6,
  },
  cardsContainer: {
    marginBottom: 12,
  },
  cardsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardItem: {
    flex: 1,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  cardName: {
    color: '#DAA520',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardPosition: {
    color: '#888',
    fontSize: 10,
  },
  interpretationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  interpretationTitle: {
    color: '#DAA520',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  interpretationText: {
    color: '#E6E6E6',
    fontSize: 14,
    lineHeight: 20,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rateButtonText: {
    color: '#DAA520',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#DAA520',
    fontSize: 16,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#444',
    fontSize: 14,
    textAlign: 'center',
  },
});