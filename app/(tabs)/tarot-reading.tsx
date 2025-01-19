import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BannerAd } from '../../src/components/ui/BannerAd';
import { useLanguage } from '../../src/contexts/language-context';
import { theme, colors } from '../../src/theme';

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
  cardPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.whiteAlpha10,
    borderColor: colors.whiteAlpha20,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    height: 150,
    justifyContent: 'center',
    width: 100,
  },
  container: {
    backgroundColor: colors.primaryDark,
    flex: 1,
  },
  placeholderText: {
    color: colors.whiteAlpha50,
    fontSize: 14,
    padding: theme.spacing.sm,
    textAlign: 'center',
  },
  spreadContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
});
