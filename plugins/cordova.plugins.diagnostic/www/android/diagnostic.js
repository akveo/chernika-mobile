/**
 *  Plugin diagnostic
 *
 *  Copyright (c) 2012 AVANTIC ESTUDIO DE INGENIEROS
 *  
**/


var Diagnostic = function() {
};

/**
 * Checks if location is enabled (Device setting for location and authorization).
 *
 * @param successCallback	The callback which will be called when diagnostic of location is successful.
 * 							This callback function have a boolean param with the diagnostic result.
 * @param errorCallback		The callback which will be called when diagnostic of location encounters an error.
 * 							This callback function have a string param with the error.
 */

Diagnostic.prototype.isLocationEnabled = function(successCallback, errorCallback) {
	return cordova.exec(successCallback,
						errorCallback,
						'Diagnostic',
						'isLocationEnabled',
						[]);
};

/**
 * Checks if exists Wi-Fi connection.
 *
 * @param successCallback	The callback which will be called when diagnostic of Wi-Fi is successful.
 * 							This callback function have a boolean param with the diagnostic result.
 * @param errorCallback		The callback which will be called when diagnostic of Wi-Fi encounters an error.
 * 							This callback function have a string param with the error.
 */

Diagnostic.prototype.isWifiEnabled = function(successCallback, errorCallback) {
	return cordova.exec(successCallback,
						errorCallback,
						'Diagnostic',
						'isWifiEnabled',
						[]);
};

/**
 * Checks if exists camera.
 *
 * @param successCallback	The callback which will be called when diagnostic of camera is successful.
 * 							This callback function have a boolean param with the diagnostic result.
 * @param errorCallback		The callback which will be called when diagnostic of camera encounters an error.
 * 							This callback function have a string param with the error.
 */


Diagnostic.prototype.isCameraEnabled = function(successCallback, errorCallback) {
	return cordova.exec(successCallback,
						errorCallback,
						'Diagnostic',
						'isCameraEnabled',
						[]);
};

/**
 * Checks if Bluetooth is enabled
 *
 * @param successCallback	The callback which will be called when diagnostic of Bluetooth is successful.
 * 							This callback function have a boolean param with the diagnostic result.
 * @param errorCallback		The callback which will be called when diagnostic of Bluetooth encounters an error.
 * 							This callback function have a string param with the error.
 */


Diagnostic.prototype.isBluetoothEnabled = function(successCallback, errorCallback) {
	return cordova.exec(successCallback,
		errorCallback,
		'Diagnostic',
		'isBluetoothEnabled',
		[]);
};


Diagnostic.prototype.switchToLocationSettings = function() {
	return cordova.exec(null,
		null,
		'Diagnostic',
		'switchToLocationSettings',
		[]);
};

Diagnostic.prototype.switchToMobileDataSettings = function() {
	return cordova.exec(null,
		null,
		'Diagnostic',
		'switchToMobileDataSettings',
		[]);
};

Diagnostic.prototype.switchToBluetoothSettings = function() {
	return cordova.exec(null,
		null,
		'Diagnostic',
		'switchToBluetoothSettings',
		[]);
};

Diagnostic.prototype.switchToWifiSettings = function() {
	return cordova.exec(null,
		null,
		'Diagnostic',
		'switchToWifiSettings',
		[]);
};

module.exports = new Diagnostic();

