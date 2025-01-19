package expo.modules.ads.admob;

import android.content.Context;
import com.google.android.gms.ads.MobileAds;
import expo.modules.core.ExportedModule;
import expo.modules.core.Promise;
import expo.modules.core.interfaces.ExpoMethod;

public class AdMobModule extends ExportedModule {
    public AdMobModule(Context context) {
        super(context);
        MobileAds.initialize(context);
    }

    @Override
    public String getName() {
        return "ExpoAdsAdMob";
    }

    @ExpoMethod
    public void setTestDeviceIDAsync(String testDeviceID, Promise promise) {
        promise.resolve(null);
    }

    @ExpoMethod
    public void requestPermissionsAsync(Promise promise) {
        promise.resolve(true);
    }

    @ExpoMethod
    public void getPermissionsAsync(Promise promise) {
        promise.resolve(true);
    }
}
