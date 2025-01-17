import React from 'react';
import { useAd } from '../../contexts/ad-context';

interface BannerAdProps {
  position?: 'top' | 'bottom';
}

export const BannerAd: React.FC<BannerAdProps> = ({ position = 'bottom' }) => {
  const { BannerAd: AdComponent } = useAd();
  return <AdComponent position={position} />;
};
