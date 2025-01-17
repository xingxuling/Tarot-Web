declare module '../config/ads' {
  export const AD_CONFIG: {
    PUBLISHER_ID: string;
    TEST_BANNER_ID: string;
    TEST_REWARDED_ID: string;
    BANNER_ID: string;
    REWARDED_ID: string;
    BANNER_REFRESH_INTERVAL: number;
    REWARDED_COOLDOWN: number;
    REWARDED_AD_COINS: number;
  };

  export const ADMOB_OPTIONS: {
    testDeviceIDs: string[];
  };
}
