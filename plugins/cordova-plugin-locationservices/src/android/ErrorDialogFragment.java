/*
 * Copyright (C) 2015 louisbl
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

import android.app.Dialog;
import android.app.DialogFragment;
import android.os.Bundle;

/**
 * Define a DialogFragment to display the error dialog generated in
 * showErrorDialog.
 */
public class ErrorDialogFragment extends DialogFragment {

	// Global field to contain the error dialog
	private Dialog mDialog;

	/**
	 * Default constructor. Sets the dialog field to null
	 */
	public ErrorDialogFragment() {
		super();
		mDialog = null;
	}

	/**
	 * Set the dialog to display
	 *
	 * @param dialog
	 *            An error dialog
	 */
	public void setDialog(Dialog dialog) {
		mDialog = dialog;
	}

	/*
	 * This method must return a Dialog to the DialogFragment.
	 */
	@Override
	public Dialog onCreateDialog(Bundle savedInstanceState) {
		return mDialog;
	}
}
