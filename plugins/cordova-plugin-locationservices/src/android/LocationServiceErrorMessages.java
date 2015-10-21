/*
 * Copyright (C) 2015 louisbl
 * Copyright (C) 2013 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package fr.louisbl.cordova.locationservices;

import android.content.Context;

import com.google.android.gms.common.ConnectionResult;

/**
 * Map error codes to error messages.
 */
public class LocationServiceErrorMessages {

	// Don't allow instantiation
	private LocationServiceErrorMessages() {
	}

	public static String getErrorString(Context context, int errorCode) {

		// Define a string to contain the error message
		String errorString;

		// Decide which error message to get, based on the error code.
		switch (errorCode) {
		case ConnectionResult.DEVELOPER_ERROR:
			errorString = "The application is misconfigured";
			break;

		case ConnectionResult.INTERNAL_ERROR:
			errorString = "An internal error occurred";
			break;

		case ConnectionResult.INVALID_ACCOUNT:
			errorString = "The specified account name is invalid";
			break;

		case ConnectionResult.LICENSE_CHECK_FAILED:
			errorString = "The app is not licensed to the user";
			break;

		case ConnectionResult.NETWORK_ERROR:
			errorString = "A network error occurred";
			break;

		case ConnectionResult.RESOLUTION_REQUIRED:
			errorString = "Additional resolution is required";
			break;

		case ConnectionResult.SERVICE_DISABLED:
			errorString = "Google Play services is disabled";
			break;

		case ConnectionResult.SERVICE_INVALID:
			errorString = "The version of Google Play services on this device is not authentic";
			break;

		case ConnectionResult.SERVICE_MISSING:
			errorString = "Google Play services is missing";
			break;

		case ConnectionResult.SERVICE_VERSION_UPDATE_REQUIRED:
			errorString = "Google Play services is out of date";
			break;

		case ConnectionResult.SIGN_IN_REQUIRED:
			errorString = "The user is not signed in";
			break;

		default:
			errorString = "An unknown error occurred";
			break;
		}

		// Return the error message
		return errorString;
	}
}
