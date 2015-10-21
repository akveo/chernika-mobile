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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

import org.apache.cordova.CallbackContext;

import android.location.Location;
import android.util.Log;

import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.LocationListener;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;

public class CordovaLocationListener implements LocationListener {
	public static int PERMISSION_DENIED = 1;
	public static int POSITION_UNAVAILABLE = 2;
	public static int TIMEOUT = 3;

	public HashMap<String, CallbackContext> watches = new HashMap<String, CallbackContext>();

	protected boolean mIsRunning = false;

	private GoogleApiClient mGApiClient;
	private LocationRequest mLocationRequest;
	private CordovaLocationServices mOwner;
	private List<CallbackContext> mCallbacks = new ArrayList<CallbackContext>();
	private Timer mTimer = null;
	private String TAG;

	public CordovaLocationListener(GoogleApiClient client,
			CordovaLocationServices broker, String tag) {
		// Create a new global location parameters object
		mLocationRequest = LocationRequest.create();
		// Set the average interval to 6 seconds
		mLocationRequest
				.setInterval(LocationUtils.UPDATE_INTERVAL_IN_MILLISECONDS);
		// Use high accuracy
		mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
		// Set the interval ceiling to 1 second
		mLocationRequest
				.setFastestInterval(LocationUtils.FAST_INTERVAL_CEILING_IN_MILLISECONDS);

		mGApiClient = client;
		mOwner = broker;
		TAG = tag;
	}

	/**
	 * Called when the location has changed.
	 *
	 * @param location
	 */
	@Override
	public void onLocationChanged(Location location) {
		Log.d(TAG, "The location has been updated!");
		win(location);
	}

	public void setLocationRequestParams(int priority, long interval,
			long fastInterval) {
		mLocationRequest.setPriority(priority);
		mLocationRequest.setInterval(interval);
		mLocationRequest.setFastestInterval(fastInterval);

	}

	public int size() {
		return watches.size() + mCallbacks.size();
	}

	public void addWatch(String timerId, CallbackContext callbackContext) {
		watches.put(timerId, callbackContext);

		if (size() == 1) {
			start();
		}
	}

	public void addCallback(CallbackContext callbackContext, int timeout) {
		if (mTimer == null) {
			mTimer = new Timer();
		}

		mTimer.schedule(new LocationTimeoutTask(callbackContext, this), timeout);
		mCallbacks.add(callbackContext);

		if (size() == 1) {
			start();
		}
	}

	public void clearWatch(String timerId) {
		if (watches.containsKey(timerId)) {
			watches.remove(timerId);
		}
		if (size() == 0) {
			stop();
		}
	}

	public void destroy() {
		stop();
	}

	protected void fail(int code, String message) {
		cancelTimer();

		for (CallbackContext callbackContext : mCallbacks) {
			mOwner.fail(code, message, callbackContext, false);
		}

		if (watches.size() == 0) {
			stop();
		}

		mCallbacks.clear();

		for (CallbackContext callbackContext : watches.values()) {
			mOwner.fail(code, message, callbackContext, true);
		}
	}

	protected void win(Location loc) {
		cancelTimer();

		for (CallbackContext callbackContext : mCallbacks) {
			mOwner.win(loc, callbackContext, false);
		}

		if (watches.size() == 0) {
			stop();
		}

		mCallbacks.clear();

		for (CallbackContext callbackContext : watches.values()) {
			mOwner.win(loc, callbackContext, true);
		}
	}

	protected void start() {
		if (mGApiClient != null && mGApiClient.isConnected()) {
			if (!mIsRunning) {
				mIsRunning = true;
				LocationServices.FusedLocationApi.requestLocationUpdates(
						mGApiClient, mLocationRequest, this);
			}
		}
	}

	/**
	 * Stop receiving location updates.
	 */
	private void stop() {
		cancelTimer();

		if (mIsRunning) {
			if (mGApiClient != null && mGApiClient.isConnected()) {
				LocationServices.FusedLocationApi.removeLocationUpdates(
						mGApiClient, this);
			}
			mIsRunning = false;
		}
	}

	private void cancelTimer() {
		if (mTimer != null) {
			mTimer.cancel();
			mTimer.purge();
			mTimer = null;
		}
	}

	private class LocationTimeoutTask extends TimerTask {

		private CallbackContext mCallbackContext = null;
		private CordovaLocationListener mListener = null;

		public LocationTimeoutTask(CallbackContext callbackContext,
				CordovaLocationListener listener) {
			mCallbackContext = callbackContext;
			mListener = listener;
		}

		@Override
		public void run() {
			// mListener.fail(TIMEOUT, "Unable to retrieve position");

			for (CallbackContext callbackContext : mListener.mCallbacks) {
				if (mCallbackContext == callbackContext) {
					mListener.mCallbacks.remove(callbackContext);
					break;
				}
			}

			if (mListener.size() == 0) {
				mListener.stop();
			}
		}
	}
}
