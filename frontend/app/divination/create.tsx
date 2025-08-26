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

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function CreateDivination() {
  const [question, setQuestion] = useState('');
  const [payment, setPayment] = useState(20); // 默认20金币
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock用户ID（实际应该从用户上下文获取）
  const userId = 'mock-user-id';

  const paymentOptions = [10, 20, 30, 50];

  const handleCreateOrder = async () => {
    if (!question.trim()) {
      Alert.alert('提示', '请输入您的占卜问题');
      return;
    }

    if (question.length > 10) {
      Alert.alert('提示', '问题不能超过10个字');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${EXPO_PUBLIC_BACKEND_URL}/api/divination/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          payment,
        }),
        // TODO: 添加用户认证
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          '发布成功',
          `您的占卜请求已发布，支付${payment}金币。等待塔罗师接单...`,
          [
            {
              text: '查看订单',
              onPress: () => {
                // TODO: 导航到订单详情页
              },
            },
          ]
        );
        setQuestion('');
      } else {
        Alert.alert('发布失败', data.detail || '请稍后重试');
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
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="crystal-ball" size={48} color="#DAA520" />
            <Text style={styles.title}>塔罗占卜</Text>
            <Text style={styles.subtitle}>圣三角牌阵 - 探寻过去现在未来</Text>
          </View>

          {/* Question Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>您的问题</Text>
            <Text style={styles.hint}>请简洁明了地描述您想了解的问题（最多10字）</Text>
            
            <View style={styles.questionContainer}>
              <TextInput
                style={styles.questionInput}
                placeholder="例如：近期事业走势"
                placeholderTextColor="#666"
                value={question}
                onChangeText={setQuestion}
                maxLength={10}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{question.length}/10</Text>
            </View>

            {/* Quick Questions */}
            <View style={styles.quickQuestions}>
              <Text style={styles.quickTitle}>常见问题：</Text>
              <View style={styles.quickButtonsContainer}>
                {['近期爱情运势', '事业发展方向', '财运状况', '学业进展'].map((q) => (
                  <TouchableOpacity
                    key={q}
                    style={styles.quickButton}
                    onPress={() => setQuestion(q)}
                  >
                    <Text style={styles.quickButtonText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Payment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>支付金币</Text>
            <Text style={styles.hint}>选择您愿意支付的金币数量</Text>
            
            <View style={styles.paymentContainer}>
              {paymentOptions.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.paymentOption,
                    payment === amount && styles.paymentOptionSelected,
                  ]}
                  onPress={() => setPayment(amount)}
                >
                  <Ionicons
                    name="diamond"
                    size={20}
                    color={payment === amount ? '#DAA520' : '#666'}
                  />
                  <Text
                    style={[
                      styles.paymentText,
                      payment === amount && styles.paymentTextSelected,
                    ]}
                  >
                    {amount}金币
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.paymentInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>支付金币：</Text>
                <Text style={styles.infoValue}>{payment}枚</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>平台手续费：</Text>
                <Text style={styles.infoValue}>{Math.floor(payment * 0.1)}枚</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>塔罗师获得：</Text>
                <Text style={[styles.infoValue, styles.infoHighlight]}>
                  {payment - Math.floor(payment * 0.1)}枚
                </Text>
              </View>
            </View>
          </View>

          {/* Spread Introduction */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>圣三角牌阵说明</Text>
            <View style={styles.spreadContainer}>
              <View style={styles.spreadCard}>
                <Ionicons name="time-outline" size={24} color="#DAA520" />
                <Text style={styles.spreadTitle}>第一张牌</Text>
                <Text style={styles.spreadDesc}>过去的影响</Text>
              </View>
              <View style={styles.spreadCard}>
                <Ionicons name="present" size={24} color="#DAA520" />
                <Text style={styles.spreadTitle}>第二张牌</Text>
                <Text style={styles.spreadDesc}>现在的状况</Text>
              </View>
              <View style={styles.spreadCard}>
                <Ionicons name="eye-outline" size={24} color="#DAA520" />
                <Text style={styles.spreadTitle}>第三张牌</Text>
                <Text style={styles.spreadDesc}>未来的指引</Text>
              </View>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              !question.trim() && styles.createButtonDisabled,
            ]}
            onPress={handleCreateOrder}
            disabled={!question.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#000" style={styles.buttonIcon} />
                <Text style={styles.createButtonText}>发布占卜请求</Text>
              </>
            )}
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
    paddingHorizontal: 20,
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
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E6E6E6',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    lineHeight: 20,
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questionInput: {
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  quickQuestions: {
    marginTop: 8,
  },
  quickTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderWidth: 1,
    borderColor: '#DAA520',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  quickButtonText: {
    color: '#DAA520',
    fontSize: 12,
  },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  paymentOptionSelected: {
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    borderColor: '#DAA520',
  },
  paymentText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  paymentTextSelected: {
    color: '#DAA520',
    fontWeight: '600',
  },
  paymentInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  infoHighlight: {
    color: '#DAA520',
  },
  spreadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spreadCard: {
    flex: 1,
    backgroundColor: 'rgba(218, 165, 32, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(218, 165, 32, 0.3)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  spreadTitle: {
    color: '#DAA520',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  spreadDesc: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#DAA520',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  createButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
});