import * as React from 'react'
import { Coins } from "lucide-react"
import { useCurrency } from "../../contexts/currency-context"

export const CurrencyDisplay: React.FC = () => {
  const { balance } = useCurrency();

  return (
    <div className="flex items-center gap-2 text-purple-300">
      <Coins className="w-4 h-4" />
      <span>{balance}</span>
    </div>
  );
};
