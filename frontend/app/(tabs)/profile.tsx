import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();
  const [user] = useState({
    nickname: '神秘占卜师',
    phone: '138****8888',
    role: 'reader',
    coins: 150,
    reputation: 4.8,
  });

  const handleLogout = () => {
    Alert.alert('确认退出', '确定要退出当前账号吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => Alert.alert('已退出', '您已成功退出账号') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="eye" size={32} color="#FFF" />
          </View>
          <Text style={styles.userName}>{user.nickname}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>专业塔罗师</Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.coins}</Text>
              <Text style={styles.statLabel}>金币余额</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.reputation}</Text>
              <Text style={styles.statLabel}>信誉评分</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollView: { flex: 1 },
  profileSection: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#8A2BE2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  userPhone: { fontSize: 14, color: '#888', marginBottom: 16 },
  roleBadge: { backgroundColor: 'rgba(218, 165, 32, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  roleText: { fontSize: 14, color: '#DAA520', fontWeight: '500' },
  statsSection: { paddingHorizontal: 20, marginBottom: 32 },
  statsContainer: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#DAA520', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#888', textAlign: 'center' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: 12, paddingVertical: 16 },
  logoutText: { fontSize: 16, color: '#FF3B30', fontWeight: '600', marginLeft: 8 },
});
