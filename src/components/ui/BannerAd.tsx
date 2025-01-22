import React from 'react';
import { View } from 'react-native';
import { AdMobBanner } from 'expo-ads-admob';
import { AD_CONFIG } from '../../config/ads';

interface BannerAdProps {
  position?: 'top' | 'bottom';
}

export const BannerAd: React.FC<BannerAdProps> = ({ position = 'bottom' }) => {
  return (
    <View style={{ 
      position: 'absolute',
      [position]: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      backgroundColor: 'transparent'
    }}>
      <AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID={AD_CONFIG.BANNER_ID}
        servePersonalizedAds={true}
        onDidFailToReceiveAdWithError={(error) => console.error(error)}
      />
    </View>
  );
};
