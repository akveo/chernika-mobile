/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

var argscheck = require('cordova/argscheck'),
	utils = require('cordova/utils'),
	exec = require('cordova/exec'),
	PositionError = require('./PositionError'),
	Position = require('./Position');

var timers = {}; // list of timers in use

var PRIORITY_HIGH_ACCURACY = 100;
var PRIORITY_BALANCED_POWER_ACCURACY = 102;
var PRIORITY_LOW_POWER = 104;
var PRIORITY_NO_POWER = 105;

// Returns default params, overrides if provided with values
function parseParameters(options) {
	var opt = {
		maximumAge: 0,
		enableHighAccuracy: true,
		timeout: Infinity,
		interval: 6000,
		fastInterval: 1000,
		priority: PRIORITY_HIGH_ACCURACY
	};

	if (options) {
		if (options.maximumAge !== undefined && !isNaN(options.maximumAge) && options.maximumAge > 0) {
			opt.maximumAge = options.maximumAge;
		}
		if (options.enableHighAccuracy !== undefined) {
			opt.enableHighAccuracy = options.enableHighAccuracy;
		}
		if (options.timeout !== undefined && !isNaN(options.timeout)) {
			if (options.timeout < 0) {
				opt.timeout = 0;
			} else {
				opt.timeout = options.timeout;
			}
		}
		if (options.interval !== undefined && !isNaN(options.interval) && options.interval > 0) {
			opt.interval = options.interval;
		}
		if (options.fastInterval !== undefined && !isNaN(options.fastInterval) && options.fastInterval > 0) {
			opt.fastInterval = options.fastInterval;
		}
		if (options.priority !== undefined && !isNaN(options.priority) && options.priority >= PRIORITY_NO_POWER && options.priority <= PRIORITY_HIGH_ACCURACY) {
			if (options.priority === PRIORITY_NO_POWER) {
				opt.priority = PRIORITY_NO_POWER;
			}
			if (options.priority === PRIORITY_LOW_POWER) {
				opt.priority = PRIORITY_LOW_POWER;
			}
			if (options.priority === PRIORITY_BALANCED_POWER_ACCURACY) {
				opt.priority = PRIORITY_BALANCED_POWER_ACCURACY;
			}
			if (options.priority === PRIORITY_HIGH_ACCURACY) {
				opt.priority = PRIORITY_HIGH_ACCURACY;
			}
		}
	}

	return opt;
}

// Returns a timeout failure, closed over a specified timeout value and error callback.
function createTimeout(errorCallback, timeout) {
	var t = setTimeout(function () {
		clearTimeout(t);
		t = null;
		errorCallback({
			code: PositionError.TIMEOUT,
			message: "Position retrieval timed out."
		});
	}, timeout);
	return t;
}

var LocationServices = {
	lastPosition: null, // reference to last known (cached) position returned
	/**
	 * Asynchronously acquires the current position.
	 *
	 * @param {Function} successCallback    The function to call when the position data is available
	 * @param {Function} errorCallback      The function to call when there is an error getting the heading position. (OPTIONAL)
	 * @param {PositionOptions} options     The options for getting the position data. (OPTIONAL)
	 */
	getCurrentPosition: function (successCallback, errorCallback, options) {
		argscheck.checkArgs('fFO', 'LocationServices.getCurrentPosition', arguments);
		options = parseParameters(options);

		// Timer var that will fire an error callback if no position is retrieved from native
		// before the "timeout" param provided expires
		var timeoutTimer = {
			timer: null
		};

		var win = function (p) {
			clearTimeout(timeoutTimer.timer);
			if (!(timeoutTimer.timer)) {
				// Timeout already happened, or native fired error callback for
				// this geo request.
				// Don't continue with success callback.
				return;
			}
			var pos = new Position({
				latitude: p.latitude,
				longitude: p.longitude,
				altitude: p.altitude,
				accuracy: p.accuracy,
				heading: p.heading,
				velocity: p.velocity,
				altitudeAccuracy: p.altitudeAccuracy
			}, (p.timestamp === undefined ? new Date() : ((p.timestamp instanceof Date) ? p.timestamp : new Date(p.timestamp))));
			LocationServices.lastPosition = pos;
			successCallback(pos);
		};
		var fail = function (e) {
			clearTimeout(timeoutTimer.timer);
			timeoutTimer.timer = null;
			var err = new PositionError(e.code, e.message);
			if (errorCallback) {
				errorCallback(err);
			}
		};

		// Check our cached position, if its timestamp difference with current time is less than the maximumAge, then just
		// fire the success callback with the cached position.
		if (LocationServices.lastPosition && options.maximumAge && (((new Date()).getTime() - LocationServices.lastPosition.timestamp.getTime()) <= options.maximumAge)) {
			successCallback(LocationServices.lastPosition);
			// If the cached position check failed and the timeout was set to 0, error out with a TIMEOUT error object.
		} else if (options.timeout === 0) {
			fail({
				code: PositionError.TIMEOUT,
				message: "timeout value in PositionOptions set to 0 and no cached Position object available, or cached Position object's age exceeds provided PositionOptions' maximumAge parameter."
			});
			// Otherwise we have to call into native to retrieve a position.
		} else {
			if (options.timeout !== Infinity) {
				// If the timeout value was not set to Infinity (default), then
				// set up a timeout function that will fire the error callback
				// if no successful position was retrieved before timeout expired.
				timeoutTimer.timer = createTimeout(fail, options.timeout);
			} else {
				// This is here so the check in the win function doesn't mess stuff up
				// may seem weird but this guarantees timeoutTimer is
				// always truthy before we call into native
				timeoutTimer.timer = true;
			}
			exec(win, fail, "LocationServices", "getLocation", [options.maximumAge, options.enableHighAccuracy]);
		}
		return timeoutTimer;
	},
	/**
	 * Asynchronously watches the geolocation for changes to geolocation.  When a change occurs,
	 * the successCallback is called with the new location.
	 *
	 * @param {Function} successCallback    The function to call each time the location data is available
	 * @param {Function} errorCallback      The function to call when there is an error getting the location data. (OPTIONAL)
	 * @param {PositionOptions} options     The options for getting the location data such as frequency. (OPTIONAL)
	 * @return String                       The watch id that must be passed to #clearWatch to stop watching.
	 */
	watchPosition: function (successCallback, errorCallback, options) {
		argscheck.checkArgs('fFO', 'LocationServices.getCurrentPosition', arguments);
		options = parseParameters(options);

		var id = utils.createUUID();

		// Tell device to get a position ASAP, and also retrieve a reference to the timeout timer generated in getCurrentPosition
		timers[id] = LocationServices.getCurrentPosition(successCallback, errorCallback, options);

		var fail = function (e) {
			clearTimeout(timers[id].timer);
			var err = new PositionError(e.code, e.message);
			if (errorCallback) {
				errorCallback(err);
			}
		};

		var win = function (p) {
			clearTimeout(timers[id].timer);
			if (options.timeout !== Infinity) {
				timers[id].timer = createTimeout(fail, options.timeout);
			}
			var pos = new Position({
				latitude: p.latitude,
				longitude: p.longitude,
				altitude: p.altitude,
				accuracy: p.accuracy,
				heading: p.heading,
				velocity: p.velocity,
				altitudeAccuracy: p.altitudeAccuracy
			}, (p.timestamp === undefined ? new Date() : ((p.timestamp instanceof Date) ? p.timestamp : new Date(p.timestamp))));
			LocationServices.lastPosition = pos;
			successCallback(pos);
		};

		exec(win, fail, "LocationServices", "addWatch", [id, options.enableHighAccuracy, options.priority, options.interval, options.fastInterval]);

		return id;
	},
	/**
	 * Clears the specified heading watch.
	 *
	 * @param {String} id       The ID of the watch returned from #watchPosition
	 */
	clearWatch: function (id) {
		if (id && timers[id] !== undefined) {
			clearTimeout(timers[id].timer);
			timers[id].timer = false;
			exec(null, null, "LocationServices", "clearWatch", [id]);
		}
	}
};

LocationServices.priorities = {
	PRIORITY_HIGH_ACCURACY: PRIORITY_HIGH_ACCURACY,
	PRIORITY_BALANCED_POWER_ACCURACY: PRIORITY_BALANCED_POWER_ACCURACY,
	PRIORITY_LOW_POWER: PRIORITY_LOW_POWER,
	PRIORITY_NO_POWER: PRIORITY_NO_POWER
};

module.exports = LocationServices;
