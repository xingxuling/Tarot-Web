import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Profile } from '../../src/components/ui/Profile';
import { colors } from '../../src/theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Profile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryDark,
    flex: 1,
  },
});
