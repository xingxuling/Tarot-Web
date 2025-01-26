import * as React from 'react'
import { Button } from "./button"
import { Card, CardContent } from "./card"
// Removed unused import
import { useLanguage } from "../../contexts/language-context"
import { useAd } from "../../contexts/ad-context"

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { showAd } = useAd();
  
  const watchAd = async () => {
    try {
      await showAd();
      onClose();
    } catch (error) {
      console.error('Failed to show ad:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <Card className="w-80 bg-purple-800/50 border-purple-600">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">{t('store.get_coins')}</h2>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={watchAd}
            >
              {t('store.watch_ad')}
            </Button>
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                // TODO: Implement payment
                console.log("Opening payment...");
              }}
            >
              {t('store.buy_coins')}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={onClose}
            >
              {t('store.close')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
