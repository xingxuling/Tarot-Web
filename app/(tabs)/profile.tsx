import React from 'react';
import { View } from 'react-native';
import { Profile } from '../../src/components/ui/Profile';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#1e1b4b' }}>
      <Profile />
    </View>
  );
}
