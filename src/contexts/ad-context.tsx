import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useCurrency } from './currency-context';
import { AD_CONFIG } from '../config/ads';
import { AdMobRewarded } from 'expo-ads-admob';

type AdMobRewardedEventType = 
  | 'rewardedVideoUserDidEarnReward'
  | 'rewardedVideoDidLoad'
  | 'rewardedVideoDidFailToLoad'
  | 'rewardedVideoDidPresent'
  | 'rewardedVideoDidFailToPresent'
  | 'rewardedVideoDidDismiss';

type AdMobEventHandlers = {
  [K in AdMobRewardedEventType]: K extends 'rewardedVideoDidFailToLoad' | 'rewardedVideoDidFailToPresent'
    ? (error: any) => void
    : () => void;
};

interface AdContextType {
  isAdReady: boolean;
  showAd: () => Promise<void>;
  lastAdShownTime: number | null;
  isBannerAdReady: boolean;
}

const AdContext = createContext<AdContextType>({
  isAdReady: false,
  showAd: async () => {},
  lastAdShownTime: null,
  isBannerAdReady: true,
});

export const useAd = () => useContext(AdContext);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdReady, setIsAdReady] = useState(false);
  const [lastAdShownTime, setLastAdShownTime] = useState<number | null>(null);
  const { addBalance } = useCurrency();

  useEffect(() => {
    const initializeAds = async () => {
      try {
        // Set up event handlers
        const handlers: AdMobEventHandlers = {
          rewardedVideoUserDidEarnReward: () => {
            addBalance(AD_CONFIG.REWARDED_AD_COINS);
            console.log('User earned reward');
          },
          rewardedVideoDidLoad: () => {
            setIsAdReady(true);
            console.log('Ad loaded');
          },
          rewardedVideoDidFailToLoad: (error: any) => {
            console.error('Failed to load rewarded ad:', error);
            setIsAdReady(false);
          },
          rewardedVideoDidPresent: () => {
            console.log('Ad presented');
          },
          rewardedVideoDidFailToPresent: (error: any) => {
            console.error('Failed to present ad:', error);
            setIsAdReady(false);
          },
          rewardedVideoDidDismiss: () => {
            setLastAdShownTime(Date.now());
            setIsAdReady(false);
            loadRewardedAd(); // Load next ad
            console.log('Ad dismissed');
          }
        };

        // Add event listeners
        Object.entries(handlers).forEach(([event, handler]) => {
          AdMobRewarded.addEventListener(event as AdMobRewardedEventType, handler);
        });

        // Set up ad unit and load initial ad
        await AdMobRewarded.setAdUnitID(AD_CONFIG.REWARDED_ID);
        await loadRewardedAd();

        // Cleanup event listeners
        return () => {
          Object.entries(handlers).forEach(([event, handler]) => {
            AdMobRewarded.removeEventListener(event as AdMobRewardedEventType, handler);
          });
        };
      } catch (error) {
        console.error('Failed to initialize ads:', error);
      }
    };

    initializeAds();
  }, [addBalance]);

  const loadRewardedAd = async () => {
    try {
      await AdMobRewarded.requestAdAsync();
    } catch (error) {
      console.error('Failed to load rewarded ad:', error);
      setIsAdReady(false);
    }
  };

  const showAd = async () => {
    if (!isAdReady) {
      throw new Error('Ad not ready');
    }

    const now = Date.now();
    if (lastAdShownTime && now - lastAdShownTime < AD_CONFIG.REWARDED_COOLDOWN) {
      throw new Error('Ad cooldown not finished');
    }

    try {
      await AdMobRewarded.showAdAsync();
    } catch (error) {
      console.error('Failed to show ad:', error);
      throw error;
    }
  };

  return (
    <AdContext.Provider value={{ isAdReady, showAd, lastAdShownTime }}>
      {children}
    </AdContext.Provider>
  );
};
