#!/usr/bin/env node

var fs = require('fs');

var projectPropsPath = 'platforms/android/project.properties';
var projectPropsPathUpd = '\nandroid.library.reference.2=vksdk_library';

var buildGradlePath = 'platforms/android/build.gradle';
var buildGradleUpd = "\nconfigurations { all*.exclude group: 'com.android.support', module: 'support-v4' }";
if (fs.existsSync(projectPropsPath))
fs.appendFileSync(projectPropsPath, projectPropsPathUpd);

if (fs.existsSync(buildGradlePath))
fs.appendFileSync(buildGradlePath, buildGradleUpd);
