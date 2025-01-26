import * as React from 'react'
import { createContext, useContext, useState } from 'react'

export interface CurrencyContextType {
  balance: number;
  addBalance: (amount: number) => void;
  deductBalance: (amount: number) => boolean;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  balance: 0,
  addBalance: () => {},
  deductBalance: () => false,
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(0);

  const addBalance = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const deductBalance = (amount: number) => {
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      return true;
    }
    return false;
  };

  return (
    <CurrencyContext.Provider value={{ balance, addBalance, deductBalance }}>
      {children}
    </CurrencyContext.Provider>
  );
};
