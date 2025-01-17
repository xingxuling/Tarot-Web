import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CurrencyContextType {
  balance: number;
  addBalance: (amount: number) => Promise<void>;
  deductBalance: (amount: number) => Promise<boolean>;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  balance: 0,
  addBalance: async () => {},
  deductBalance: async () => false,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(0);

  // Load saved balance
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const savedBalance = await AsyncStorage.getItem('currency_balance');
        if (savedBalance) {
          setBalance(parseInt(savedBalance, 10));
        }
      } catch (error) {
        console.error('Failed to load balance:', error);
      }
    };
    loadBalance();
  }, []);

  const addBalance = async (amount: number) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await fetch(`http://localhost:8000/users/${userId}/balance/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, source: 'ad' })
      });

      if (response.ok) {
        const newBalance = balance + amount;
        await AsyncStorage.setItem('currency_balance', newBalance.toString());
        setBalance(newBalance);
      }
    } catch (error) {
      console.error('Failed to add balance:', error);
    }
  };

  const deductBalance = async (amount: number): Promise<boolean> => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID found');
        return false;
      }

      if (balance < amount) {
        return false;
      }

      const response = await fetch(`http://localhost:8000/users/${userId}/balance/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description: 'Purchase' })
      });

      if (response.ok) {
        const newBalance = balance - amount;
        await AsyncStorage.setItem('currency_balance', newBalance.toString());
        setBalance(newBalance);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to deduct balance:', error);
      return false;
    }
  };

  return (
    <CurrencyContext.Provider value={{ balance, addBalance, deductBalance }}>
      {children}
    </CurrencyContext.Provider>
  );
};
