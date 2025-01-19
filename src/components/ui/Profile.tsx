import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '../../contexts/language-context';
import { useExperience } from '../../contexts/experience-context';
import { theme, colors } from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Reading {
  id: string;
  spread_type: string;
  cards: string[];
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  purchased_products: string[];
}

const LevelDisplay: React.FC = () => {
  const { experience, level } = useExperience();
  const { language } = useLanguage();
  
  return (
    <View style={styles.levelContainer}>
      <Text style={styles.levelTitle}>
        {language === 'en' ? level.title_en : level.title}
      </Text>
      <View style={styles.experienceBar}>
        <View 
          style={[
            styles.experienceProgress, 
            { width: `${(experience / level.next_level) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.experienceText}>
        {experience} / {level.next_level} XP
      </Text>
    </View>
  );
};

export const Profile: React.FC = () => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.error('No user ID found');
          return;
        }

        // Fetch user profile
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`);
        const data = await response.json();
        setProfile(data);

        // Mock readings data for now
        const mockReadings = [
          {
            id: "1",
            spread_type: "单张牌阵",
            cards: ["The Fool"],
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            spread_type: "三张牌阵",
            cards: ["The Magician", "The High Priestess", "The Empress"],
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        setReadings(mockReadings);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('profile.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{profile?.username || t('profile.default_username')}</Text>
          <Text style={styles.userId}>ID: {profile?.id || '-'}</Text>
          <LevelDisplay />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.purchased_items')}</Text>
        {profile?.purchased_products.map((productId) => (
          <View key={productId} style={styles.productItem}>
            <Text style={styles.productId}>{t('profile.product_id')}: {productId}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.reading_history')}</Text>
        {readings.map((reading) => (
          <View key={reading.id} style={styles.readingItem}>
            <View>
              <Text style={styles.readingType}>{reading.spread_type}</Text>
              <Text style={styles.readingDate}>
                {new Date(reading.created_at).toLocaleString()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.whiteAlpha10,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    width: 64,
  },
  avatarText: {
    fontSize: 32,
  },
  container: {
    flex: 1,
  },
  experienceBar: {
    backgroundColor: colors.whiteAlpha10,
    borderRadius: theme.borderRadius.sm,
    height: 4,
    marginBottom: theme.spacing.xs,
    overflow: 'hidden',
  },
  experienceProgress: {
    backgroundColor: colors.gold,
    height: '100%',
  },
  experienceText: {
    color: colors.whiteAlpha70,
    fontSize: 12,
  },
  header: {
    backgroundColor: colors.primaryAlpha10,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  levelContainer: {
    marginTop: theme.spacing.sm,
  },
  levelTitle: {
    color: colors.gold,
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.white,
  },
  productId: {
    color: colors.white,
  },
  productItem: {
    backgroundColor: colors.primaryAlpha20,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  readingDate: {
    color: colors.whiteAlpha70,
    fontSize: 12,
  },
  readingItem: {
    backgroundColor: colors.primaryAlpha20,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  readingType: {
    color: colors.white,
    fontSize: 16,
    marginBottom: theme.spacing.xs,
  },
  section: {
    backgroundColor: colors.primaryAlpha10,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  userId: {
    color: colors.whiteAlpha70,
    fontSize: 12,
    marginBottom: theme.spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
});
