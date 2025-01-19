import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { TarotCard } from './TarotCard';
import { theme, colors } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SpreadPositionProps {
  x: number;
  y: number;
  name: string;
  description: string;
  card?: any;
  onPress?: () => void;
  isLoading?: boolean;
}

export const SpreadPosition: React.FC<SpreadPositionProps> = ({
  x,
  y,
  name,
  description,
  card,
  onPress,
  isLoading
}) => {
  // Convert percentage to actual position based on container size
  const position = {
    left: (SCREEN_WIDTH * 0.9 * x) / 100, // Use 90% of screen width as spread area
    top: (SCREEN_WIDTH * 0.9 * y) / 100, // Use same width for height to maintain aspect ratio
  };

  return (
    <View style={[styles.container, { left: position.left, top: position.top }]}>
      {card ? (
        <TarotCard
          name={card.name}
          nameEn={card.nameEn}
          image={card.image}
          isReversed={card.isReversed}
          onPress={onPress}
          size="medium"
        />
      ) : (
        <TouchableOpacity
          onPress={onPress}
          style={styles.emptyPosition}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <Text style={styles.plusText}>+</Text>
          )}
        </TouchableOpacity>
      )}
      <Text style={styles.positionName}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'absolute',
    transform: [
      { translateX: -50 },
      { translateY: -75 }
    ],
  },
  emptyPosition: {
    alignItems: 'center',
    backgroundColor: colors.whiteAlpha10,
    borderColor: colors.whiteAlpha20,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    height: 150,
    justifyContent: 'center',
    width: 100,
  },
  loadingText: {
    color: colors.whiteAlpha50,
    fontSize: 14,
  },
  plusText: {
    color: colors.whiteAlpha50,
    fontSize: 32,
  },
  positionName: {
    backgroundColor: colors.blackAlpha50,
    borderRadius: theme.borderRadius.sm,
    color: colors.white,
    fontSize: 12,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    textAlign: 'center',
  },
});
