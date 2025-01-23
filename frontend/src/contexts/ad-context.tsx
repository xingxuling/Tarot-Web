import * as React from 'react'
import { createContext, useContext, useState, useCallback } from 'react'
import { useCurrency } from './currency-context'

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
    // 检查是否可以显示广告（距离上次显示至少1分钟）
    if (lastAdShow && Date.now() - lastAdShow.getTime() < 60000) {
      throw new Error('请稍后再试');
    }

    setIsAdVisible(true);
    setLastAdShow(new Date());

    // 模拟广告观看
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsAdVisible(false);
        addBalance(10); // 观看广告奖励
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
