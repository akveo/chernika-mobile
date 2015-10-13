package com.akveo.cordovavk;

import android.app.Activity;
import android.app.AlertDialog;
import com.vk.sdk.VKAccessToken;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * @author v.lugovsky
 */
public final class SdkUtil {

    public static List<String> jsonArrayToStringList(JSONArray array) throws JSONException {
        List<String> stringArray = new ArrayList<String>();
        JSONArray jsonArray = new JSONArray();
        for(int i = 0, count = jsonArray.length(); i< count; i++) {
            JSONObject jsonObject = jsonArray.getJSONObject(i);
            stringArray.add(jsonObject.toString());
        }
        return stringArray;
    }

    public static JSONArray stringListToJsonArray(List<String> stringList) {
        return new JSONArray(stringList);
    }

    public static JSONArray stringArrayToJsonArray(String [] stringArray) {
        return new JSONArray(Arrays.asList(stringArray));
    }

    public static JSONObject serializeAccessToken(VKAccessToken accessToken) throws JSONException {
        JSONObject result = new JSONObject();
        result.put("accessToken", accessToken.accessToken);
        result.put("userId", accessToken.userId);
        result.put("expiresIn", accessToken.expiresIn);
        result.put("secret", accessToken.secret);
        return result;
    }

    public static PluginResult createErrorResult(String code, String message) throws JSONException {
        return createErrorResult(code, message, false);
    }

    public static PluginResult createErrorResult(String code, String message, boolean keepCallback) throws JSONException {
        JSONObject errorDescription = new JSONObject();
        errorDescription.put("code", code);
        errorDescription.put("message", message);
        PluginResult pluginResult = new PluginResult(PluginResult.Status.ERROR, errorDescription);
        pluginResult.setKeepCallback(keepCallback);
        return pluginResult;
    }

    public static PluginResult createEventResult(String eventType, JSONObject eventData) throws JSONException {
        return createEventResult(eventType, eventData, false);
    }

    public static PluginResult createEventResult(String eventType, JSONObject eventData, boolean keepCallback) throws JSONException {
        JSONObject resultObject = new JSONObject();
        resultObject.put("eventType", eventType);
        resultObject.put("eventData", eventData);
        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, resultObject);
        pluginResult.setKeepCallback(keepCallback);
        return pluginResult;
    }

    public static PluginResult createAccessTokenEventResult(String eventType, VKAccessToken accessToken) throws JSONException {
        return createAccessTokenEventResult(eventType, accessToken, false);
    }

    public static PluginResult createAccessTokenEventResult(String eventType, VKAccessToken accessToken, boolean keepCallback) throws JSONException {
        return createEventResult(eventType, serializeAccessToken(accessToken), keepCallback);
    }

    public static PluginResult createMessageEventResult(String eventType, String message, boolean keepCallback) throws JSONException {
        JSONObject messageObject = new JSONObject();
        messageObject.put("message", message);
        return createEventResult(eventType, messageObject, keepCallback);
    }

    public static PluginResult createMessageEventResult(String eventType, String message) throws JSONException {
        return createMessageEventResult(eventType, message, false);
    }

    public static void showWebViewAlert(Activity activity, String message) {
        new AlertDialog.Builder(activity)
                .setMessage(message)
                .show();
    }
}
