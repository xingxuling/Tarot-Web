declare const __DEV__: boolean;

export interface AdConfig {
  PUBLISHER_ID: string;
  TEST_BANNER_ID: string;
  TEST_REWARDED_ID: string;
  BANNER_ID: string;
  REWARDED_ID: string;
  BANNER_REFRESH_INTERVAL: number;
  REWARDED_COOLDOWN: number;
  REWARDED_AD_COINS: number;
}

export interface AdMobOptions {
  testDeviceIDs: string[];
}

// AdMob Configuration
export const AD_CONFIG: AdConfig = {
  PUBLISHER_ID: process.env.ADMOB_PUBLISHER_ID || '',
  TEST_BANNER_ID: 'ca-app-pub-3940256099942544/6300978111',
  TEST_REWARDED_ID: 'ca-app-pub-3940256099942544/5224354917',
  
  get BANNER_ID() {
    return __DEV__ ? this.TEST_BANNER_ID : (process.env.ADMOB_BANNER_ID || '');
  },
  get REWARDED_ID() {
    return __DEV__ ? this.TEST_REWARDED_ID : (process.env.ADMOB_REWARDED_ID || '');
  },
  
  BANNER_REFRESH_INTERVAL: 60000, // 1 minute
  REWARDED_COOLDOWN: 60000, // 1 minute between rewarded ads
  REWARDED_AD_COINS: 10, // Coins earned per rewarded ad view
};

// AdMob initialization options
export const ADMOB_OPTIONS: AdMobOptions = {
  get testDeviceIDs() {
    return __DEV__ ? ['EMULATOR'] : [];
  },
};
