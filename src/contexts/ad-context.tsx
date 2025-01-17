import React, { createContext, useContext, useState, useCallback } from 'react';
import { useCurrency } from './currency-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdContextType {
  showAd: () => Promise<void>;
  hideAd: () => void;
  isAdVisible: boolean;
  lastAdShow: Date | null;
}

const AdContext = createContext<AdContextType>({
  showAd: async () => {},
  hideAd: () => {},
  isAdVisible: false,
  lastAdShow: null,
});

export const useAd = () => useContext(AdContext);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [lastAdShow, setLastAdShow] = useState<Date | null>(null);
  const { addBalance } = useCurrency();

  const showAd = useCallback(async () => {
    // Check if enough time has passed since last ad (1 minute)
    if (lastAdShow && Date.now() - lastAdShow.getTime() < 60000) {
      throw new Error('Please wait before watching another ad');
    }

    setIsAdVisible(true);
    setLastAdShow(new Date());

    // TODO: Implement actual AdMob integration
    // For now, simulate ad viewing
    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        setIsAdVisible(false);
        await addBalance(10); // Reward for watching ad
        resolve();
      }, 3000);
    });
  }, [lastAdShow, addBalance]);

  const hideAd = useCallback(() => {
    setIsAdVisible(false);
  }, []);

  return (
    <AdContext.Provider value={{ showAd, hideAd, isAdVisible, lastAdShow }}>
      {children}
    </AdContext.Provider>
  );
};
