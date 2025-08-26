import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Friend {
  id: string;
  nickname: string;
  role: 'seeker' | 'reader';
  reputation: number;
  avatar?: string;
  online: boolean;
}

// Mock数据
const mockFriends: Friend[] = [
  {
    id: '1',
    nickname: '神秘塔罗师',
    role: 'reader',
    reputation: 4.8,
    online: true,
  },
  {
    id: '2',
    nickname: '求道者小明',
    role: 'seeker',
    reputation: 5.0,
    online: false,
  },
  {
    id: '3',
    nickname: '星月占卜师',
    role: 'reader',
    reputation: 4.6,
    online: true,
  },
];

export default function Social() {
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock用户ID
  const userId = 'mock-user-id';

  const handleSearchFriends = () => {
    const filtered = mockFriends.filter(friend =>
      friend.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFriends(filtered);
  };

  const handleAddFriend = async () => {
    if (!searchUserId.trim()) {
      Alert.alert('提示', '请输入用户ID');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/social/add_friend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_user_id: searchUserId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('添加成功', '好友添加成功！');
        setShowAddModal(false);
        setSearchUserId('');
        // TODO: 刷新好友列表
      } else {
        Alert.alert('添加失败', data.detail || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('网络错误', '请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (friend: Friend) => {
    Alert.alert(
      '发送消息',
      `向 ${friend.nickname} 发送消息`,
      [
        { text: '取消', style: 'cancel' },
        { text: '发送', onPress: () => {
          // TODO: 实现聊天功能
          Alert.alert('功能开发中', '聊天功能即将上线');
        }},
      ]
    );
  };

  const handleViewProfile = (friend: Friend) => {
    Alert.alert(
      '用户信息',
      `昵称：${friend.nickname}\n身份：${friend.role === 'reader' ? '塔罗师' : '求测者'}\n信誉：${friend.reputation}星`,
      [{ text: '确定' }]
    );
  };

  useEffect(() => {
    if (searchQuery) {
      handleSearchFriends();
    } else {
      setFriends(mockFriends);
    }
  }, [searchQuery]);

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: item.role === 'reader' ? '#8A2BE2' : '#FF6B6B' }]}>
            <Ionicons 
              name={item.role === 'reader' ? 'eye' : 'search'} 
              size={24} 
              color="#FFF" 
            />
          </View>
          {item.online && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.friendDetails}>
          <View style={styles.friendHeader}>
            <Text style={styles.friendName}>{item.nickname}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {item.role === 'reader' ? '塔罗师' : '求测者'}
              </Text>
            </View>
          </View>
          
          <View style={styles.friendStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#DAA520" />
              <Text style={styles.statText}>{item.reputation}</Text>
            </View>
            <Text style={[styles.statusText, { color: item.online ? '#34C759' : '#8E8E93' }]}>
              {item.online ? '在线' : '离线'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.friendActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewProfile(item)}
        >
          <Ionicons name="person" size={16} color="#DAA520" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleSendMessage(item)}
        >
          <Ionicons name="chatbubble" size={16} color="#DAA520" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索好友昵称"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="person-add" size={20} color="#DAA520" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{friends.length}</Text>
          <Text style={styles.statLabel}>好友总数</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {friends.filter(f => f.online).length}
          </Text>
          <Text style={styles.statLabel}>在线好友</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {friends.filter(f => f.role === 'reader').length}
          </Text>
          <Text style={styles.statLabel}>塔罗师</Text>
        </View>
      </View>

      {/* Friends List */}
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>
              {searchQuery ? '未找到相关好友' : '暂无好友'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? '尝试搜索其他关键词' : '添加好友开始社交吧'}
            </Text>
          </View>
        )}
      />

      {/* Add Friend Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>添加好友</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>用户ID</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="请输入对方的用户ID"
                placeholderTextColor="#666"
                value={searchUserId}
                onChangeText={setSearchUserId}
              />
              
              <Text style={styles.inputHint}>
                您可以在占卜结束后与塔罗师互加好友
              </Text>
            </div>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  !searchUserId.trim() && styles.confirmButtonDisabled,
                ]}
                onPress={handleAddFriend}
                disabled={!searchUserId.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.confirmButtonText}>添加</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DAA520',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  friendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#34C759',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  friendDetails: {
    flex: 1,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  friendName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(218, 165, 32, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    color: '#DAA520',
    fontWeight: '600',
  },
  friendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  friendActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
  },
  inputHint: {
    color: '#888',
    fontSize: 12,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#DAA520',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});