/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */
package fr.louisbl.cordova.locationservices;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;

/*
 * This class is the interface to the Geolocation.  It's bound to the geo object.
 *
 * This class only starts and stops various GeoListeners, which consist of a GPS and a Network Listener
 */

public class CordovaLocationServices extends CordovaPlugin implements
		GoogleApiClient.ConnectionCallbacks {

	private CordovaLocationListener mListener;
	private boolean mWantLastLocation = false;
	private boolean mWantUpdates = false;
	private JSONArray mPrevArgs;
	private CallbackContext mCbContext;
	private GApiUtils mGApiUtils;
	private GoogleApiClient mGApiClient;

	@Override
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
		mGApiClient = new GoogleApiClient.Builder(cordova.getActivity())
				.addApi(LocationServices.API).addConnectionCallbacks(this)
				.addOnConnectionFailedListener(getGApiUtils()).build();
	}

	@Override
	public void onConnected(Bundle bundle) {
		Log.d(LocationUtils.APPTAG, "Location Services connected");
		if (mWantLastLocation) {
			mWantLastLocation = false;
			getLastLocation();
		}
		if (mListener != null && mWantUpdates) {
			mWantUpdates = false;
			mListener.start();
		}
	}

	@Override
	public void onConnectionSuspended(int i) {
		Log.i(LocationUtils.APPTAG,
				"GoogleApiClient connection has been suspend");
	}

	/**
	 * Executes the request and returns PluginResult.
	 *
	 * @param action
	 *            The action to execute.
	 * @param args
	 *            JSONArry of arguments for the plugin.
	 * @param callbackContext
	 *            The callback id used when calling back into JavaScript.
	 * @return True if the action was valid, or false if not.
	 * @throws JSONException
	 */
	public boolean execute(final String action, final JSONArray args,
			final CallbackContext callbackContext) {

		if (action == null || !action.matches("getLocation|addWatch|clearWatch")) {
			return false;
		}

		final String id = args.optString(0, "");
		final boolean highAccuracy = args.optBoolean(1, false);
		final int priority = args.optInt(2, LocationRequest.PRIORITY_HIGH_ACCURACY);
		final long interval = args.optLong(3, LocationUtils.UPDATE_INTERVAL_IN_MILLISECONDS);
		final long fastInterval = args.optLong(4, LocationUtils.FAST_INTERVAL_CEILING_IN_MILLISECONDS);

		if (action.equals("clearWatch")) {
			clearWatch(id);
			return true;
		}

		if (highAccuracy && isGPSdisabled()) {
			fail(CordovaLocationListener.POSITION_UNAVAILABLE,
					"GPS is disabled on this device.", callbackContext,
					false);
		}

		if (getGApiUtils().servicesConnected()) {
			if (!mGApiClient.isConnected()
					&& !mGApiClient.isConnecting()) {
				mGApiClient.connect();
			}
			if (action.equals("getLocation")) {
				if (mGApiClient.isConnected()) {
					getLastLocation(args, callbackContext);
				} else {
					setWantLastLocation(args, callbackContext);
				}
			} else if (action.equals("addWatch")) {
				getListener().setLocationRequestParams(priority,
						interval, fastInterval);
				mWantUpdates = true;
				addWatch(id, callbackContext);
			}
		} else {
			fail(CordovaLocationListener.POSITION_UNAVAILABLE,
					"Google Play Services is not available on this device.",
					callbackContext, false);
		}
		
		return true;
	}

	/**
	 * Called when the activity is to be shut down. Stop listener.
	 */
	public void onDestroy() {
		if (mListener != null) {
			mListener.destroy();
		}
		if (mGApiClient.isConnected() || mGApiClient.isConnecting()) {
			// After disconnect() is called, the client is considered "dead".
			mGApiClient.disconnect();
		}
	}

	/**
	 * Called when the view navigates. Stop the listeners.
	 */
	public void onReset() {
		this.onDestroy();
	}

	public JSONObject returnLocationJSON(Location loc) {
		JSONObject o = new JSONObject();

		try {
			o.put("latitude", loc.getLatitude());
			o.put("longitude", loc.getLongitude());
			o.put("altitude", (loc.hasAltitude() ? loc.getAltitude() : null));
			o.put("accuracy", loc.getAccuracy());
			o.put("heading",
					(loc.hasBearing() ? (loc.hasSpeed() ? loc.getBearing()
							: null) : null));
			o.put("velocity", loc.getSpeed());
			o.put("timestamp", loc.getTime());
		} catch (JSONException e) {
			e.printStackTrace();
		}

		return o;
	}

	public void win(Location loc, CallbackContext callbackContext,
			boolean keepCallback) {
		PluginResult result = new PluginResult(PluginResult.Status.OK,
				this.returnLocationJSON(loc));
		result.setKeepCallback(keepCallback);
		callbackContext.sendPluginResult(result);
	}

	/**
	 * Location failed. Send error back to JavaScript.
	 *
	 * @param code
	 *            The error code
	 * @param msg
	 *            The error message
	 * @throws JSONException
	 */
	public void fail(int code, String msg, CallbackContext callbackContext,
			boolean keepCallback) {
		JSONObject obj = new JSONObject();
		String backup = null;
		try {
			obj.put("code", code);
			obj.put("message", msg);
		} catch (JSONException e) {
			obj = null;
			backup = "{'code':" + code + ",'message':'"
					+ msg.replaceAll("'", "\'") + "'}";
		}
		PluginResult result;
		if (obj != null) {
			result = new PluginResult(PluginResult.Status.ERROR, obj);
		} else {
			result = new PluginResult(PluginResult.Status.ERROR, backup);
		}

		result.setKeepCallback(keepCallback);
		callbackContext.sendPluginResult(result);
	}

	private boolean isGPSdisabled() {
		LocationManager lm = null;
		boolean gps_enabled;
		if (lm == null)
			lm = (LocationManager) this.cordova.getActivity().getSystemService(
					Context.LOCATION_SERVICE);
		try {
			gps_enabled = lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
		} catch (Exception ex) {
			ex.printStackTrace();
			gps_enabled = false;
		}

		return !gps_enabled;
	}

	private void getLastLocation() {
		getLastLocation(mPrevArgs, mCbContext);
		mCbContext = null;
		mPrevArgs = null;
	}

	private void getLastLocation(JSONArray args, CallbackContext callbackContext) {
		int maximumAge;
		try {
			maximumAge = args.getInt(0);
		} catch (JSONException e) {
			e.printStackTrace();
			maximumAge = 0;
		}
		Location last = LocationServices.FusedLocationApi
				.getLastLocation(mGApiClient);
		// Check if we can use lastKnownLocation to get a quick reading and use
		// less battery
		if (last != null
				&& (System.currentTimeMillis() - last.getTime()) <= maximumAge) {
			PluginResult result = new PluginResult(PluginResult.Status.OK,
					returnLocationJSON(last));
			callbackContext.sendPluginResult(result);
		} else {
			getCurrentLocation(callbackContext, Integer.MAX_VALUE);
		}
	}

	private void setWantLastLocation(JSONArray args,
			CallbackContext callbackContext) {
		mPrevArgs = args;
		mCbContext = callbackContext;
		mWantLastLocation = true;
	}

	private void clearWatch(String id) {
		getListener().clearWatch(id);
	}

	private void getCurrentLocation(CallbackContext callbackContext, int timeout) {
		getListener().addCallback(callbackContext, timeout);
	}

	private void addWatch(String timerId, CallbackContext callbackContext) {
		getListener().addWatch(timerId, callbackContext);
	}

	private CordovaLocationListener getListener() {
		if (mListener == null) {
			mListener = new CordovaLocationListener(mGApiClient, this,
					LocationUtils.APPTAG);
		}
		return mListener;
	}

	private GApiUtils getGApiUtils() {
		if (mGApiUtils == null) {
			mGApiUtils = new GApiUtils(cordova);
		}
		return mGApiUtils;
	}
}
