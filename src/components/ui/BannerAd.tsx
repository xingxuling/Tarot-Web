import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAd } from '../../contexts/ad-context';
import { useLanguage } from '../../contexts/language-context';

interface BannerAdProps {
  position?: 'top' | 'bottom';
}

export const BannerAd: React.FC<BannerAdProps> = ({ 
  position = 'bottom'
}) => {
  const { showAd } = useAd();
  const { t } = useLanguage();

  return (
    <View style={[
      styles.container,
      position === 'top' ? styles.topPosition : styles.bottomPosition
    ]}>
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.content}
          onPress={async () => {
            try {
              await showAd();
            } catch (error) {
              console.error('Failed to show ad:', error);
            }
          }}
        >
          <Text style={styles.text}>{t('ad.watch_for_coins')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(8px)',
  },
  topPosition: {
    top: 0,
  },
  bottomPosition: {
    bottom: 0,
  },
  card: {
    backgroundColor: 'rgba(147, 51, 234, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.6)',
  },
  content: {
    padding: 8,
    alignItems: 'center',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
});
