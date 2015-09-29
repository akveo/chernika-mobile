#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either 
// the identifier, the filesystem location 
// or the URL
var pluginlist = [
    "com.ionic.keyboard",
    "fr.louisbl.cordova.locationservices",
    "cordova-plugin-whitelist",
    "cordova-plugin-network-information",
    "cordova.plugins.diagnostic",
    "com.ionic.deploy",
    "com.phonegap.plugins.PushPlugin",
    "https://github.com/apache/cordova-plugin-inappbrowser",
    "org.apache.cordova.console",
    //"org.apache.cordova.geolocation",
    'org.apache.cordova.device',
    'org.apache.cordova.dialogs',
    'com.akveo.cordova-vk --variable VK_APP_ID=vk4851553',
    'org.apache.cordova.statusbar',
    'org.apache.cordova.home'
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys');
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}

pluginlist.forEach(function(plug) {
    exec("cordova plugin add " + plug, puts);
});
