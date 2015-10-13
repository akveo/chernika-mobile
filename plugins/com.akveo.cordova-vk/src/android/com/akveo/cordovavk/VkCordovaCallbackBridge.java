package com.akveo.cordovavk;

import android.content.Context;
import android.util.Log;
import com.vk.sdk.VKAccessToken;
import com.vk.sdk.VKSdkListener;
import com.vk.sdk.api.VKError;
import com.vk.sdk.dialogs.VKCaptchaDialog;
import org.apache.cordova.CallbackContext;
import org.json.JSONException;

/**
 * @author v.lugovsky
 */
public class VkCordovaCallbackBridge extends VKSdkListener {

    private static final String TAG = VkSdkConstants.LOG_TAG;

    private Context webViewContext;

    private CallbackContext callbackContext;

    public VkCordovaCallbackBridge(Context webViewContext, CallbackContext callbackContext) {
        this.webViewContext = webViewContext;
        this.callbackContext = callbackContext;
    }

    private void tokenResult(String eventName, VKAccessToken accessToken) {
        try {
            callbackContext.sendPluginResult(SdkUtil.createAccessTokenEventResult(eventName, accessToken, true));
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onCaptchaError(VKError captchaError) {
        new VKCaptchaDialog(captchaError).show();
    }

    @Override
    public void onTokenExpired(VKAccessToken expiredToken) {
        //VKSdk.authorize(scope);
        Log.w(TAG, "VK token expired");
        tokenResult("tokenExpired", expiredToken);
    }

    @Override
    public void onAccessDenied(VKError authorizationError) {
        Log.w(TAG, "VK Access denied!");
        try {
            callbackContext.sendPluginResult(SdkUtil.createErrorResult("accessDenied", "Access to the VK services was denied."));
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void onReceiveNewToken(VKAccessToken newToken) {
        Log.i(TAG, "VK new token: " + newToken.accessToken);
        newToken.saveTokenToSharedPreferences(webViewContext, VkSdkConstants.S_TOKEN_KEY);
        tokenResult("newToken", newToken);
    }

    @Override
    public void onAcceptUserToken(VKAccessToken token) {
        Log.i(TAG, "VK accept token: " + token.accessToken);
        tokenResult("acceptUserToken", token);
    }

}
