import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLanguage } from '../../contexts/language-context';
import { useCurrency } from '../../contexts/currency-context';
import { useExperience } from '../../contexts/experience-context';
import { useAd } from '../../contexts/ad-context';
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
  const { showAd, isAdReady, lastAdShownTime } = useAd();
  const [adLoading, setAdLoading] = useState(false);

  const canWatchAd = isAdReady && (!lastAdShownTime || Date.now() - lastAdShownTime >= 60000);

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

      <TouchableOpacity
        style={[
          styles.adButton,
          (!canWatchAd || adLoading) && styles.adButtonDisabled
        ]}
        onPress={async () => {
          try {
            setAdLoading(true);
            await showAd();
          } catch (error) {
            if (error instanceof Error) {
              Alert.alert(t('common.error'), error.message);
            }
          } finally {
            setAdLoading(false);
          }
        }}
        disabled={!canWatchAd || adLoading}
      >
        <Text style={styles.adButtonText}>
          {adLoading ? t('common.loading') : 
           !isAdReady ? t('store.no_ads_available') :
           !canWatchAd ? t('store.wait_before_next_ad') :
           t('store.watch_ad_for_coins')}
        </Text>
      </TouchableOpacity>

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
  adButton: {
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.md,
  },
  adButtonDisabled: {
    opacity: 0.5,
  },
  adButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  balance: {
    backgroundColor: colors.whiteAlpha10,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  balanceText: {
    color: colors.white,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.white,
  },
  productCard: {
    backgroundColor: colors.primaryAlpha10,
    borderColor: colors.primaryAlpha20,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  productDescription: {
    color: colors.whiteAlpha70,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  productEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  productGrid: {
    padding: theme.spacing.md,
  },
  productName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  productPrice: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  purchaseButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  purchaseButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
