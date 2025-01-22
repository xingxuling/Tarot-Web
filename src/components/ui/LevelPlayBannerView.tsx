import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import IronSource, { BannerListener } from 'ironsource-mediation';

interface BannerAdProps {
  position?: 'top' | 'bottom';
}

export const LevelPlayBannerView: React.FC<BannerAdProps> = ({ position = 'bottom' }) => {
  useEffect(() => {
    const bannerListener: BannerListener = {
      onBannerAdLoaded: () => {
        console.log('Banner ad loaded');
      },
      onBannerAdLoadFailed: (error) => {
        console.error('Banner ad failed to load:', error);
      },
      onBannerAdClicked: () => {
        console.log('Banner ad clicked');
      },
      onBannerAdScreenPresented: () => {
        console.log('Banner ad screen presented');
      },
      onBannerAdScreenDismissed: () => {
        console.log('Banner ad screen dismissed');
      },
      onBannerAdLeftApplication: () => {
        console.log('Banner ad left application');
      }
    };

    const initBanner = async () => {
      try {
        IronSource.setBannerListener(bannerListener);
        await IronSource.loadBanner();
        await IronSource.showBanner();
      } catch (error) {
        console.error('Failed to initialize banner:', error);
      }
    };

    initBanner();

    return () => {
      IronSource.destroyBanner();
    };
  }, []);

  return (
    <View style={[styles.container, position === 'top' ? styles.topBanner : styles.bottomBanner]} />
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'transparent',
  },
  topBanner: {
    top: 0,
  },
  bottomBanner: {
    bottom: 0,
  },
});
