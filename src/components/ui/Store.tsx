import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLanguage } from '../../contexts/language-context';
import { useCurrency } from '../../contexts/currency-context';
import { useExperience } from '../../contexts/experience-context';
import { theme, colors } from '../../theme';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export const Store: React.FC = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { balance, deductBalance } = useCurrency();
  const { addExperience } = useExperience();

  useEffect(() => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/products`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // Fallback data
          setProducts([
            {
              id: "premium-spreads",
              name: "高级牌阵套装",
              description: "解锁专业凯尔特十字牌阵和关系解析牌阵",
              price: 199,
              image: "🎴"
            },
            {
              id: "premium-cards",
              name: "高级塔罗牌",
              description: "解锁命运之轮和正义等高级牌",
              price: 99,
              image: "🎭"
            }
          ]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch products:', error);
        setLoading(false);
      });
  }, []);

  const purchaseProduct = async (product: Product) => {
    const success = await deductBalance(product.price);
    if (success) {
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/purchase/${product.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        });
        
        if (response.ok) {
          // Notify app about unlocked content
          // TODO: Implement proper event system for React Native
          await addExperience(50);
        }
      } catch (error) {
        console.error('Purchase failed:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('store.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('store.title')}</Text>
        <View style={styles.balance}>
          <Text style={styles.balanceText}>
            {balance} {t('store.currency')}
          </Text>
        </View>
      </View>

      <View style={styles.productGrid}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Text style={styles.productEmoji}>{product.image}</Text>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            <Text style={styles.productPrice}>{product.price} {t('store.currency')}</Text>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() => purchaseProduct(product)}
            >
              <Text style={styles.purchaseButtonText}>{t('store.purchase')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  balance: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  balanceText: {
    color: '#fff',
  },
  productGrid: {
    padding: 16,
  },
  productCard: {
    backgroundColor: colors.primaryAlpha10,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryAlpha20,
  },
  productEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    color: '#9333ea',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  purchaseButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
