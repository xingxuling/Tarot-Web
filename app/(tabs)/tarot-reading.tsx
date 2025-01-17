import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TarotCard } from '../../src/components/ui/TarotCard';
import { SpreadPosition } from '../../src/components/ui/SpreadPosition';
import { BannerAd } from '../../src/components/ui/BannerAd';
import { useLanguage } from '../../src/contexts/language-context';

export default function TarotReadingScreen() {
  const { t } = useLanguage();
  
  return (
    <View style={styles.container}>
      <View style={styles.spreadContainer}>
        <View style={styles.cardPlaceholder}>
          <Text style={styles.placeholderText}>{t('tarot.draw_card')}</Text>
        </View>
      </View>
      <BannerAd position="bottom" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  spreadContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPlaceholder: {
    width: 100,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
    padding: 8,
  },
});
