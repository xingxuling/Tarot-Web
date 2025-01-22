import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '../../contexts/language-context';
import { useExperience } from '../../contexts/experience-context';
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
        const response = await fetch(`http://localhost:8000/users/${userId}`);
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  levelContainer: {
    marginTop: 8,
  },
  levelTitle: {
    fontSize: 16,
    color: '#ffd700',
    marginBottom: 4,
  },
  experienceBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  experienceProgress: {
    height: '100%',
    backgroundColor: '#ffd700',
  },
  experienceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  productItem: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  productId: {
    color: '#fff',
  },
  readingItem: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  readingType: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  readingDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
