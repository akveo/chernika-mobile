package com.akveo.cordovavk;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import com.vk.sdk.VKAccessToken;
import com.vk.sdk.VKSdk;
import com.vk.sdk.VKSdkListener;
import com.vk.sdk.VKUIHelper;
import com.vk.sdk.api.VKApi;
import com.vk.sdk.api.VKApiConst;
import com.vk.sdk.api.VKError;
import com.vk.sdk.api.VKParameters;
import com.vk.sdk.api.VKRequest;
import com.vk.sdk.api.VKResponse;
import com.vk.sdk.util.VKUtil;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;

public class VkSdkPlugin extends CordovaPlugin {
    public static final String ACTION_INIT = "initVkSdk";
    public static final String ACTION_LOGIN = "loginVkSdk";
    public static final String ACTION_GET_FINGERPRINT = "getFingerPrintVkSdk";
    public static final String ACTION_USER_GET = "getUser";

    private VKSdkListener sdkListener = null;

    private Activity getActivity() {
        return (Activity) this.webView.getContext();
    }

    @Override
    public boolean execute(String action, CordovaArgs args, CallbackContext callbackContext) throws JSONException {
        if (ACTION_INIT.equals(action)) {
            return initSocialVk(args.getString(0), callbackContext);
        } else if (ACTION_LOGIN.equals(action)) {
            return authorizeApplication(SdkUtil.jsonArrayToStringList(args.getJSONArray(0)).toArray(new String[0]));
        } else if (ACTION_GET_FINGERPRINT.equals(action)) {
            return getFingerprint(callbackContext);
        } else if (ACTION_USER_GET.equals(action)) {
            return getUser(args.getString(0), callbackContext);
        }
        return super.execute(action, args, callbackContext);
    }

    private boolean initSocialVk(String appId, CallbackContext callbackContext) throws JSONException {
        // Initial validation
        if (sdkListener != null) {
            callbackContext.sendPluginResult(SdkUtil.createErrorResult("initError", "Plugin was already initialized", true));
            return false;
        }

        this.cordova.setActivityResultCallback(this);
        sdkListener = new VkCordovaCallbackBridge(webView.getContext(), callbackContext);
        VKSdk.initialize(sdkListener, appId, VKAccessToken.tokenFromSharedPreferences(webView.getContext(), VkSdkConstants.S_TOKEN_KEY));


        Log.i(VkSdkConstants.LOG_TAG, "VK initialize");
        callbackContext.sendPluginResult(SdkUtil.createMessageEventResult("initialized", "success", true));
        return true;
    }

    private boolean authorizeApplication(final String [] scope) {
        this.cordova.setActivityResultCallback(this);
        VKSdk.authorize(scope);
        return true;
    }

    private boolean getFingerprint(final CallbackContext callbackContext) {
        Activity activity = getActivity();
        String[] fingerprints = VKUtil.getCertificateFingerprint(activity, activity.getPackageName());
        JSONArray resultArray = SdkUtil.stringArrayToJsonArray(fingerprints);
        callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, resultArray));
        return true;
    }

    private boolean getUser(String userId, final CallbackContext callbackContext) {
        if (userId != null) {
            VKApi.users().get(VKParameters.from(VKApiConst.USER_ID, userId, VKApiConst.FIELDS, "id, first_name, sex, bdate")).executeWithListener(new VKRequest.VKRequestListener() {
                @Override
                public void onComplete(VKResponse response) {
                    callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, response.json));
                }

                @Override
                public void onError(VKError error) {
                    callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR, error.errorMessage));
                }

            });
        } else {
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR, "User ids not provided or user not logged in."));
        }

        return true;
    }

    @Override
    protected void pluginInitialize() {
        VKUIHelper.onCreate(getActivity());
    }

    @Override
    public void onDestroy() {
        VKUIHelper.onDestroy(getActivity());
    }

    @Override
    public void onResume(boolean multitasking) {
        VKUIHelper.onResume(getActivity());
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent intent) {
        VKUIHelper.onActivityResult(getActivity(), requestCode, resultCode, intent);
    }
}


