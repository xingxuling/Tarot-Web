import * as React from 'react'
import { Card } from "./card"
import { useAd } from "../../contexts/ad-context"

interface BannerAdProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export const BannerAd: React.FC<BannerAdProps> = ({ 
  position = 'bottom',
  className = '' 
}) => {
  const { showAd } = useAd();

  return (
    <div 
      className={`fixed ${position}-0 left-0 right-0 p-2 bg-black/20 backdrop-blur-sm ${className}`}
      style={{ zIndex: 50 }}
    >
      <Card className="bg-purple-800/50 border-purple-600">
        <div className="p-2 text-center text-sm flex items-center justify-center gap-2">
          <span className="text-purple-300">广告</span>
          <button 
            className="text-xs text-purple-400 hover:text-purple-300"
            onClick={async () => {
              try {
                await showAd();
              } catch (error) {
                console.error('Failed to show ad:', error);
              }
            }}
          >
            了解更多
          </button>
        </div>
      </Card>
    </div>
  );
};
