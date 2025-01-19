import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, styles.mono]} />;
}

const styles = StyleSheet.create({
  mono: {
    fontFamily: 'SpaceMono'
  }
});
