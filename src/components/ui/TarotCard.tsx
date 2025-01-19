import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../../contexts/language-context';
import { theme, colors } from '../../theme';

interface TarotCardProps {
  name: string;
  nameEn: string;
  image: string;
  isReversed?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const TarotCard: React.FC<TarotCardProps> = ({
  name,
  nameEn,
  image,
  isReversed = false,
  onPress,
  size = 'medium'
}) => {
  const { language } = useLanguage();
  
  const cardSizes = {
    small: { width: 80, height: 120 },
    medium: { width: 100, height: 150 },
    large: { width: 120, height: 180 }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        cardSizes[size],
        isReversed && styles.reversed
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>{image}</Text>
        <Text style={styles.name}>
          {language === 'en' ? nameEn : name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.whiteAlpha10,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.whiteAlpha20,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  reversed: {
    transform: [{ rotate: '180deg' }],
  },
});
