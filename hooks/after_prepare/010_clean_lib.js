#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var $ = require('cheerio');
var glob = require("glob")

var fontsNames = [
    'www/lib/ionic/fonts/ionicons.eot',
    'www/lib/ionic/fonts/ionicons.svg',
    'www/lib/ionic/fonts/ionicons.ttf',
    'www/lib/ionic/fonts/ionicons.woff'
];

var index = fs.readFileSync('www/index.html').toString();
$ = $.load(index);
var scripts = ($('script[src]'));
var styleLinks = ($('link[href]'));

var fileNamesToSave = _.union(getIndexFileNames(scripts, 'src'), getIndexFileNames(styleLinks, 'href'), fontsNames);
var platforms = (process.env.CORDOVA_PLATFORMS ? process.env.CORDOVA_PLATFORMS.split(',') : []);

platforms.forEach(cleanPlatformLib);

function cleanPlatformLib(platform) {
    var platformAssetsPath = 'platforms/' + platform + '/assets/';
    var libPath = platformAssetsPath + 'www/lib/';

    var toSave = _.map(fileNamesToSave, function (fname) {
        return platformAssetsPath + fname;
    });


    glob(libPath + '**', function (er, libFiles) {
        var toDelete = _.difference(libFiles, toSave);
        toDelete.forEach(deleteFile);
    });

}

function deleteFile(file) {
    fs.stat(file, function(err, stat) {
        if(!stat.isDirectory()) {
            fs.unlink(file, function(error) {
                error && console.log('Error deleting lib file!', err)
            });
        }
    });
}

function getIndexFileNames(els, nameAttr) {
    return _.chain(els)
        .map(function (el) {
            var name = el.attribs[nameAttr];
            return name && name.indexOf('lib/') !== -1 ? 'www/' + name : undefined;
        })
        .without(undefined)
        .value();
}
