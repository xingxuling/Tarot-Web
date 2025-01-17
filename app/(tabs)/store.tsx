import React from 'react';
import { View } from 'react-native';
import { Store } from '../../src/components/ui/Store';

export default function StoreScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#1e1b4b' }}>
      <Store />
    </View>
  );
}
