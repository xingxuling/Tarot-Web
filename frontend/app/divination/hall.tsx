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
  question: string;
  payment: number;
  created_at: string;
}

export default function DivinationHall() {
  const [orders, setOrders] = useState<DivinationOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [acceptingOrder, setAcceptingOrder] = useState<string | null>(null);
  
  // Mock塔罗师ID（实际应该从用户上下文获取）
  const readerId = 'mock-reader-id';

  const fetchPendingOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/divination/pending`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data);
      } else {
        Alert.alert('获取失败', '无法加载占卜订单');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAcceptOrder = async (orderId: string, question: string, payment: number) => {
    Alert.alert(
      '确认接单',
      `问题：${question}\n报酬：${payment}金币\n\n确定接受这个占卜订单吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定接单',
          onPress: () => acceptOrder(orderId),
        },
      ]
    );
  };

  const acceptOrder = async (orderId: string) => {
    setAcceptingOrder(orderId);
    
    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/divination/accept/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reader_id: readerId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          '接单成功',
          '已为您抽取塔罗牌，请查看牌面并提供解读',
          [
            {
              text: '查看详情',
              onPress: () => {
                // TODO: 导航到占卜详情页
                console.log('Cards drawn:', data.cards);
                console.log('AI suggestion:', data.ai_suggestion);
              },
            },
          ]
        );
        
        // 刷新订单列表
        fetchPendingOrders(true);
      } else {
        Alert.alert('接单失败', data.detail || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接');
    } finally {
      setAcceptingOrder(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}小时前`;
    return `${Math.floor(diffMins / 1440)}天前`;
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const renderOrderItem = ({ item }: { item: DivinationOrder }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.questionContainer}>
          <Ionicons name="help-circle-outline" size={20} color="#DAA520" />
          <Text style={styles.question} numberOfLines={2}>
            {item.question}
          </Text>
        </View>
        <View style={styles.paymentBadge}>
          <Ionicons name="diamond" size={16} color="#DAA520" />
          <Text style={styles.payment}>{item.payment}</Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.timeText}>{formatTimeAgo(item.created_at)}</Text>
        <Text style={styles.spreadText}>圣三角牌阵</Text>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardLabel}>您将获得：</Text>
          <Text style={styles.rewardValue}>
            {item.payment - Math.floor(item.payment * 0.1)} 金币
          </Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.acceptButton,
            acceptingOrder === item.id && styles.acceptButtonDisabled,
          ]}
          onPress={() => handleAcceptOrder(item.id, item.question, item.payment)}
          disabled={acceptingOrder === item.id}
        >
          {acceptingOrder === item.id ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={16} color="#000" />
              <Text style={styles.acceptButtonText}>接单</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>接单大厅</Text>
        <Text style={styles.subtitle}>为求测者提供专业的塔罗解读</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>待接订单</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {orders.reduce((sum, order) => sum + order.payment, 0)}
          </Text>
          <Text style={styles.statLabel}>总金币池</Text>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchPendingOrders(true)}
            tintColor="#DAA520"
            colors={['#DAA520']}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="hourglass-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>暂无待接订单</Text>
            <Text style={styles.emptySubtext}>下拉刷新查看新订单</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DAA520',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E6E6E6',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DAA520',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 16,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 12,
  },
  question: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  paymentBadge: {
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  payment: {
    color: '#DAA520',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
  },
  spreadText: {
    color: '#DAA520',
    fontSize: 12,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 2,
  },
  rewardValue: {
    color: '#DAA520',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#DAA520',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonText: {
    color: '#000',
    fontSize: 14,
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
  },
});