import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { TarotCard } from './TarotCard';

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
    position: 'absolute',
    transform: [
      { translateX: -50 },
      { translateY: -75 }
    ],
    alignItems: 'center',
  },
  emptyPosition: {
    width: 100,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  plusText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 32,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  positionName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
