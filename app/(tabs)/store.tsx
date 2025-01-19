import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Store } from '../../src/components/ui/Store';
import { colors } from '../../src/theme';

export default function StoreScreen() {
  return (
    <View style={styles.container}>
      <Store />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryDark,
    flex: 1,
  },
});
