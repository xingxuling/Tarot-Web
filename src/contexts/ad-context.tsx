import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import * as ExpoAdMob from 'expo-ads-admob';
import { useCurrency } from './currency-context';
import { AD_CONFIG } from 'ads-config';

interface AdContextType {
  showRewardedAd: () => Promise<void>;
  isAdVisible: boolean;
  lastAdShow: Date | null;
  BannerAd: React.FC<{ position?: 'top' | 'bottom' }>;
}

const AdContext = createContext<AdContextType>({
  showRewardedAd: async () => {},
  isAdVisible: false,
  lastAdShow: null,
  BannerAd: () => null,
});

export const useAd = () => useContext(AdContext);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [lastAdShow, setLastAdShow] = useState<Date | null>(null);
  const { addBalance } = useCurrency();

  // Initialize AdMob
  useEffect(() => {
    const initializeAdMob = async () => {
      try {
        // Request permissions on Android
        if (Platform.OS === 'android') {
          await ExpoAdMob.requestPermissionsAsync();
        }
        
        // Set test device IDs if in development
        if (__DEV__) {
          await ExpoAdMob.setTestDeviceIDAsync('EMULATOR');
        }

        // Load the first rewarded ad
        await ExpoAdMob.AdMobRewarded.setAdUnitID(AD_CONFIG.REWARDED_ID);
        await ExpoAdMob.AdMobRewarded.requestAdAsync();
      } catch (error) {
        console.error('Failed to initialize AdMob:', error);
      }
    };

    initializeAdMob();

    // Add reward listener
    ExpoAdMob.AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
      addBalance(AD_CONFIG.REWARDED_AD_COINS);
    });

    return () => {
      ExpoAdMob.AdMobRewarded.removeAllListeners();
    };
  }, [addBalance]);

  const showRewardedAd = useCallback(async () => {
    try {
      // Check cooldown
      if (lastAdShow && Date.now() - lastAdShow.getTime() < AD_CONFIG.REWARDED_COOLDOWN) {
        throw new Error('Please wait before watching another ad');
      }

      setIsAdVisible(true);
      await ExpoAdMob.AdMobRewarded.showAdAsync();
      setLastAdShow(new Date());
      
      // Preload next ad
      await ExpoAdMob.AdMobRewarded.requestAdAsync();
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      throw error;
    } finally {
      setIsAdVisible(false);
    }
  }, [lastAdShow]);

  const BannerAd: React.FC<{ position?: 'top' | 'bottom' }> = useCallback(
    ({ position = 'bottom' }) => (
      <ExpoAdMob.AdMobBanner
        bannerSize="smartBannerPortrait"
        adUnitID={AD_CONFIG.BANNER_ID}
        servePersonalizedAds={true}
        onDidFailToReceiveAdWithError={(error: string) => console.error(error)}
        style={[styles.bannerContainer, position === 'top' ? styles.topBanner : styles.bottomBanner]}
      />
    ),
    []
  );

  return (
    <AdContext.Provider value={{ showRewardedAd, isAdVisible, lastAdShow, BannerAd }}>
      {children}
    </AdContext.Provider>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    left: 0,
    position: 'absolute',
    right: 0,
  },
  bottomBanner: {
    bottom: 0,
  },
  topBanner: {
    top: 0,
  },
});
