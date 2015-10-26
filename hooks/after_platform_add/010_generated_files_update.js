#!/usr/bin/env node

var fs = require('fs');

var projectPropsPath = 'platforms/android/project.properties';
var projectPropsPathUpd = '\nandroid.library.reference.2=vksdk_library';

var buildGradlePath = 'platforms/android/build.gradle';
var buildGradleUpd = "\nconfigurations { all*.exclude group: 'com.android.support', module: 'support-v4' }";

fs.appendFileSync(projectPropsPath, projectPropsPathUpd);

fs.appendFileSync(buildGradlePath, buildGradleUpd);