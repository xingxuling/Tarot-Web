package expo.modules.ads.admob;

import android.content.Context;

import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;

import expo.modules.core.ExportedModule;
import expo.modules.core.ModuleRegistry;
import expo.modules.core.Promise;
import expo.modules.core.interfaces.ExpoMethod;

import java.util.Arrays;
import java.util.List;

public class AdMobModule extends ExportedModule {
    private static String testDeviceID = "EMULATOR";

    public AdMobModule(Context context) {
        super(context);
    }

    @Override
    public String getName() {
        return "ExpoAdsAdMob";
    }

    @ExpoMethod
    public void setTestDeviceIDAsync(String testDeviceID, Promise promise) {
        this.testDeviceID = testDeviceID;
        RequestConfiguration configuration = new RequestConfiguration.Builder()
            .setTestDeviceIds(Arrays.asList(testDeviceID))
            .build();
        MobileAds.setRequestConfiguration(configuration);
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
