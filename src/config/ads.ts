declare const __DEV__: boolean;

// Type definitions
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
  // Use environment variables for all ad IDs
  PUBLISHER_ID: process.env.ADMOB_PUBLISHER_ID || '',
  
  // Test Ad Unit IDs will be configured via environment variables
  TEST_BANNER_ID: process.env.TEST_BANNER_ID || '',
  TEST_REWARDED_ID: process.env.TEST_REWARDED_ID || '',
  
  // Production Ad Unit IDs
  // Using test IDs in development, production IDs will be created in AdMob console
  get BANNER_ID() {
    return __DEV__ ? this.TEST_BANNER_ID : (process.env.ADMOB_BANNER_ID || 'YOUR_BANNER_ID');
  },
  get REWARDED_ID() {
    return __DEV__ ? this.TEST_REWARDED_ID : (process.env.ADMOB_REWARDED_ID || 'YOUR_REWARDED_ID');
  },
  
  // Ad refresh intervals
  BANNER_REFRESH_INTERVAL: 60000, // 1 minute
  REWARDED_COOLDOWN: 60000, // 1 minute between rewarded ads
  
  // Virtual currency rewards
  REWARDED_AD_COINS: 10, // Coins earned per rewarded ad view
};

// AdMob initialization options
export const ADMOB_OPTIONS = {
  // Optional: Add any additional initialization options here
  get testDeviceIDs() {
    return __DEV__ ? ['EMULATOR'] : [];
  },
};
