import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BannerAd } from '../../src/components/ui/BannerAd';
import { useLanguage } from '../../src/contexts/language-context';
import { theme, colors } from '../../src/theme';
import { SpreadPosition } from '../../src/components/ui/SpreadPosition';
import { MAJOR_ARCANA, SPREADS } from '../../src/data/tarot-cards';
import { TarotSpread, TarotCard } from '../../src/types/tarot';

export default function TarotReadingScreen() {
  const { t, language } = useLanguage();
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCards, setDrawnCards] = useState<(TarotCard & { isReversed: boolean })[]>([]);
  
  const selectSpread = (spread: TarotSpread) => {
    setSelectedSpread(spread);
    setDrawnCards([]);
  };

  const drawCard = (position: number) => {
    if (isDrawing) return;
    setIsDrawing(true);

    // Simulate card drawing animation
    setTimeout(() => {
      const randomCard = MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
      const isReversed = Math.random() > 0.5;
      const drawnCard = { ...randomCard, isReversed };
      
      setDrawnCards(prev => {
        const newCards = [...prev];
        newCards[position] = drawnCard;
        return newCards;
      });
      
      setIsDrawing(false);
    }, 1000);
  };
  
  return (
    <View style={styles.container}>
      {!selectedSpread ? (
        <ScrollView style={styles.spreadList}>
          <Text style={styles.title}>{t('tarot.select_spread')}</Text>
          {SPREADS.map((spread) => (
            <TouchableOpacity
              key={spread.id}
              style={styles.spreadItem}
              onPress={() => selectSpread(spread)}
            >
              <Text style={styles.spreadName}>
                {language === 'en' ? spread.nameEn : spread.name}
              </Text>
              <Text style={styles.spreadDescription}>
                {spread.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.spreadContainer}>
          <Text style={styles.title}>
            {language === 'en' ? selectedSpread.nameEn : selectedSpread.name}
          </Text>
          <View style={styles.spreadArea}>
            {selectedSpread.positions.map((position, index) => (
              <SpreadPosition
                key={position.id}
                x={position.x}
                y={position.y}
                name={language === 'en' ? position.nameEn : position.name}
                description={position.description}
                card={drawnCards[index]}
                onPress={() => !drawnCards[index] && drawCard(index)}
                isLoading={isDrawing}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedSpread(null)}
          >
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      )}
      <BannerAd position="bottom" />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.whiteAlpha10,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.sm,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
  },
  container: {
    backgroundColor: colors.primaryDark,
    flex: 1,
  },
  spreadArea: {
    aspectRatio: 1,
    backgroundColor: colors.whiteAlpha05,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
    position: 'relative',
    width: '100%',
  },
  spreadContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  spreadDescription: {
    color: colors.whiteAlpha70,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  spreadItem: {
    backgroundColor: colors.whiteAlpha10,
    borderColor: colors.whiteAlpha20,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  spreadList: {
    flex: 1,
    padding: theme.spacing.md,
  },
  spreadName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
});
