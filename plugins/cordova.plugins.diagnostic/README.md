Cordova diagnostic plugin
=========================

* [Overview](#overview)
* [Installation](#installation)
* [Usage](#usage)
    * [Android and iOS](#android-and-ios)
    * [Android only](#android-only)
    * [iOS only](#ios-only)
* [Example project](#example-project)
* [Credits](#credits)

# Overview

This Cordova/Phonegap plugin for iOS and Android is used to check the state of the following device settings:

- Location/GPS
- WiFi
- Camera
- Bluetooth

On Android, the plugin also enables an app to show the relevant settings screen, to allow users to enable the above device settings.

The plugin is registered in the [the Cordova Registry](http://plugins.cordova.io)(Cordova 3/4) and [npmjs.com](https://npmjs.com/) (Cordova 5+) as `cordova.plugins.diagnostic`

# Installation

## Using the Cordova/Phonegap [CLI](http://docs.phonegap.com/en/edge/guide_cli_index.md.html)

    $ cordova plugin add cordova.plugins.diagnostic
    $ phonegap plugin add cordova.plugins.diagnostic

## Using [Cordova Plugman](https://github.com/apache/cordova-plugman)

    $ plugman install --plugin=cordova.plugins.diagnostic --platform=<platform> --project=<project_path> --plugins_dir=plugins

For example, to install for the Android platform

    $ plugman install --plugin=cordova.plugins.diagnostic --platform=android --project=platforms/android --plugins_dir=plugins

## PhoneGap Build
Add the following xml to your config.xml to use the latest version of this plugin from [the Cordova Registry](http://plugins.cordova.io):

    <gap:plugin name="cordova.plugins.diagnostic" source="plugins.cordova.io" />

or from [npmjs.com](https://npmjs.com/):

    <gap:plugin name="cordova.plugins.diagnostic" source="npm" />

# Usage

The plugin is exposed via the `cordova.plugins.diagnostic` object and provides the following functions:

## Android and iOS

- [isLocationEnabled()](#islocationenabled)
- [isWifiEnabled()](#iswifienabled)
- [isCameraEnabled()](#iscameraenabled)
- [isBluetoothEnabled()](#isbluetoothenabled)

### isLocationEnabled()

Checks if app is able to access location.
On iOS this returns true if both the device setting for location is on AND the application is authorized to use location.
On Android this returns true if Location setting is ON AND Location mode is set to "High Accuracy" (GPS).

    cordova.plugins.diagnostic.isLocationEnabled(successCallback, errorCallback);

#### Parameters

- {function} successCallback - The callback which will be called when diagnostic of location is successful. This callback function have a boolean param with the diagnostic result.
- {function} errorCallback - The callback which will be called when diagnostic of location encounters an error. This callback function have a string param with the error.


#### Example usage

    cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
        console.log("Location is " + (enabled ? "enabled" : "disabled"));
    }, function(error){
        console.error("The following error occurred: "+error);
    });

### isWifiEnabled()

Checks if Wifi is connected/enabled.
On iOS this returns true if the device is connected to a network by WiFi.
On Android this returns true if the WiFi setting is set to enabled.

    cordova.plugins.diagnostic.isWifiEnabled(successCallback, errorCallback);

#### Parameters

- {function} successCallback - The callback which will be called when diagnostic of Wi-Fi is successful. This callback function have a boolean param with the diagnostic result.
- {function} errorCallback - The callback which will be called when diagnostic of Wi-Fi encounters an error. This callback function have a string param with the error.


#### Example usage

    cordova.plugins.diagnostic.isWifiEnabled(function(enabled){
        console.log("WiFi is " + (enabled ? "enabled" : "disabled"));
    }, function(error){
        console.error("The following error occurred: "+error);
    });


### isCameraEnabled()

Checks if the device has a camera (same on Android and iOS)

    cordova.plugins.diagnostic.isCameraEnabled(successCallback, errorCallback);

#### Parameters

- {function} successCallback - The callback which will be called when diagnostic of camera is successful. This callback function have a boolean param with the diagnostic result.
- {function} errorCallback - The callback which will be called when diagnostic of camera encounters an error. This callback function have a string param with the error.


#### Example usage

    cordova.plugins.diagnostic.isCameraEnabled(function(exists){
        console.log("Device " + (exists ? "does" : "does not") + " have a camera");
    }, function(error){
        console.error("The following error occurred: "+error);
    });

### isBluetoothEnabled()

Checks if the device has Bluetooth capabilities and if so that Bluetooth is switched on (same on Android and iOS)

    cordova.plugins.diagnostic.isBluetoothEnabled(successCallback, errorCallback);

#### Parameters

- {function} successCallback - The callback which will be called when diagnostic of Bluetooth is successful. This callback function have a boolean param with the diagnostic result.
- {function} errorCallback - The callback which will be called when diagnostic of Bluetooth encounters an error. This callback function have a string param with the error.


#### Example usage

    cordova.plugins.diagnostic.isBluetoothEnabled(function(enabled){
        console.log("Bluetooth is " + (enabled ? "enabled" : "disabled"));
    }, function(error){
        console.error("The following error occurred: "+error);
    });

## Android only

- [switchToLocationSettings()](#switchtolocationsettings)
- [switchToMobileDataSettings()](#switchtomobiledatasettings)
- [switchToBluetoothSettings()](#switchtobluetoothsettings)
- [switchToWifiSettings()](#switchtowifisettings)

### switchToLocationSettings()

Displays the device location settings to allow user to enable location services/change location mode.

    cordova.plugins.diagnostic.switchToLocationSettings();

### switchToMobileDataSettings()

Displays mobile settings to allow user to enable mobile data.

    cordova.plugins.diagnostic.switchToMobileDataSettings();

### switchToBluetoothSettings()

Displays Bluetooth settings to allow user to enable Bluetooth.

    cordova.plugins.diagnostic.switchToBluetoothSettings();


### switchToWifiSettings()

Displays WiFi settings to allow user to enable WiFi.

    cordova.plugins.diagnostic.switchToWifiSettings();

## iOS only

- [isLocationEnabledSetting()](#isLocationEnabledSetting)
- [isLocationAuthorized()](#islocationauthorized)


### isLocationEnabledSetting()

Returns true if the device setting for location is on.

    cordova.plugins.diagnostic.isLocationEnabledSetting(successCallback, errorCallback);

#### Parameters

- {function} successCallback - The callback which will be called when diagnostic of location setting is successful. This callback function have a boolean param with the diagnostic result.
- {function} errorCallback - The callback which will be called when diagnostic of location setting encounters an error. This callback function have a string param with the error.


#### Example usage

    cordova.plugins.diagnostic.isLocationEnabledSetting(function(enabled){
        console.log("Location setting is " + (enabled ? "enabled" : "disabled"));
    }, function(error){
        console.error("The following error occurred: "+error);
    });


### isLocationAuthorized()

Returns true if the application is authorized to use location AND the device setting for location is on.

    cordova.plugins.diagnostic.isLocationAuthorized(successCallback, errorCallback);

#### Parameters

- {function} successCallback - The callback which will be called when diagnostic of location authorization is successful. This callback function have a boolean param with the diagnostic result.
- {function} errorCallback - The callback which will be called when diagnostic of location authorization encounters an error. This callback function have a string param with the error.


#### Example usage

    cordova.plugins.diagnostic.isLocationAuthorized(function(enabled){
        console.log("Location authorization is " + (enabled ? "enabled" : "disabled"));
    }, function(error){
        console.error("The following error occurred: "+error);
    });

# Example project

An example project illustrating use of this plugin can be found here: [https://github.com/dpa99c/cordova-diagnostic-plugin-example](https://github.com/dpa99c/cordova-diagnostic-plugin-example)


# Credits

Forked from: [https://github.com/mablack/cordova-diagnostic-plugin](https://github.com/mablack/cordova-diagnostic-plugin)

Orignal Cordova 2 implementation by: AVANTIC ESTUDIO DE INGENIEROS ([www.avantic.net](http://www.avantic.net/))