declare module 'ironsource-mediation' {
  export interface IronSourceError {
    errorCode: number;
    message: string;
  }

  export interface RewardedVideoListener {
    onRewardedVideoAdOpened?: () => void;
    onRewardedVideoAdClosed?: () => void;
    onRewardedVideoAvailabilityChanged?: (available: boolean) => void;
    onRewardedVideoAdStarted?: () => void;
    onRewardedVideoAdEnded?: () => void;
    onRewardedVideoAdRewarded?: () => void;
    onRewardedVideoAdShowFailed?: (error: IronSourceError) => void;
  }

  export interface BannerListener {
    onBannerAdLoaded?: () => void;
    onBannerAdLoadFailed?: (error: IronSourceError) => void;
    onBannerAdClicked?: () => void;
    onBannerAdScreenPresented?: () => void;
    onBannerAdScreenDismissed?: () => void;
    onBannerAdLeftApplication?: () => void;
  }

  export interface IronSource {
    initialize(appKey: string): Promise<void>;
    addRewardedVideoListener(listener: RewardedVideoListener): void;
    removeRewardedVideoListener(): void;
    isRewardedVideoAvailable(): Promise<boolean>;
    showRewardedVideo(): Promise<void>;
    
    // Banner methods
    loadBanner(placementName?: string): Promise<void>;
    destroyBanner(): Promise<void>;
    showBanner(): Promise<void>;
    hideBanner(): Promise<void>;
    setBannerListener(listener: BannerListener): void;
  }

  const IronSource: IronSource;
  export default IronSource;
}
