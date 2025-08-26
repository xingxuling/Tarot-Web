import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0a0a0a',
        },
        headerTintColor: '#DAA520',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen 
        name="auth/register" 
        options={{ 
          title: '注册',
          headerBackTitle: '返回',
        }} 
      />
      <Stack.Screen 
        name="auth/login" 
        options={{ 
          title: '登录',
          headerBackTitle: '返回',
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="divination/create" 
        options={{ 
          title: '发起占卜',
          headerBackTitle: '返回',
        }} 
      />
      <Stack.Screen 
        name="divination/hall" 
        options={{ 
          title: '接单大厅',
          headerBackTitle: '返回',
        }} 
      />
    </Stack>
  );
}