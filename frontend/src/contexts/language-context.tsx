import * as React from 'react'
import { createContext, useContext, useState, useCallback } from 'react'

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

export const translations = {
  en: {
    // Navigation
    'nav.tarot': 'Tarot',
    'nav.store': 'Store',
    'nav.profile': 'Profile',
    
    // Tarot Reading
    'tarot.title': 'Tarot Reading',
    'tarot.subtitle': 'Explore the mysteries of fate',
    'tarot.select_spread': 'Select Spread',
    'tarot.start_reading': 'Start Reading',
    'tarot.draw_card': 'Draw Card',
    'tarot.view_meaning': 'View Meaning',
    'tarot.redraw': 'Redraw',
    'tarot.upright': 'Upright',
    'tarot.reversed': 'Reversed',
    'tarot.card_meaning': 'Card Meaning',
    
    // Store
    'store.title': 'Store',
    'store.cart': 'Cart',
    'store.purchase': 'Purchase',
    'store.get_coins': 'Get Coins',
    'store.watch_ad': 'Watch Ad for 10 Coins',
    'store.buy_coins': 'Buy Coins',
    'store.close': 'Close',
    
    // Profile
    'profile.purchased_items': 'Purchased Items',
    'profile.reading_history': 'Reading History',
    'profile.view_details': 'View Details',
    'profile.experience': 'Experience',
    'profile.next_level': 'Next Level',
    'profile.default_username': 'User',
    'profile.product_id': 'Product ID',
    'store.currency': 'coins',
    
    // Levels
    'level.1': 'Tarot Beginner',
    'level.2': 'Regular Tarot Reader',
    'level.3': 'Tarot Elite',
    'level.4': 'Senior Tarot Reader',
    'level.5': 'Tarot Master',
  },
  zh: {
    // 导航
    'nav.tarot': '占卜',
    'nav.store': '商城',
    'nav.profile': '个人中心',
    
    // 塔罗占卜
    'tarot.title': '塔罗占卜',
    'tarot.subtitle': '探索命运的奥秘',
    'tarot.select_spread': '选择牌阵',
    'tarot.start_reading': '开始占卜',
    'tarot.draw_card': '抽牌',
    'tarot.view_meaning': '查看解释',
    'tarot.redraw': '重新抽牌',
    'tarot.upright': '正位',
    'tarot.reversed': '逆位',
    'tarot.card_meaning': '牌义解释',
    
    // 商城
    'store.title': '商城',
    'store.cart': '购物车',
    'store.purchase': '购买',
    'store.get_coins': '获取虚拟币',
    'store.watch_ad': '观看广告获得10虚拟币',
    'store.buy_coins': '购买虚拟币',
    'store.close': '关闭',
    
    // 个人中心
    'profile.purchased_items': '已购商品',
    'profile.reading_history': '占卜历史',
    'profile.view_details': '查看详情',
    'profile.experience': '经验值',
    'profile.next_level': '下一等级',
    'profile.default_username': '用户',
    'profile.product_id': '商品 ID',
    'store.currency': '币',
    
    // 等级
    'level.1': '塔罗初学者',
    'level.2': '普通塔罗师',
    'level.3': '塔罗精英',
    'level.4': '资深塔罗师',
    'level.5': '塔罗大师',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await fetch(`http://localhost:8000/users/${userId}/language`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang })
      });

      if (response.ok) {
        setLanguageState(lang);
      }
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  }, []);

  const t = useCallback((key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
