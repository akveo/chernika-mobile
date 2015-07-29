#!/usr/bin/env node
//
//var fs = require('fs');
//var path = require('path');
//var _ = require('underscore');
//var $ = require('cheerio');
//var glob = require("glob")
//
//var index = fs.readFileSync('www/index.html').toString();
//$ = $.load(index);
//
//console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
//
//var scripts = ($('script[src]'));
//var styleLinks = ($('link[href]'));
//
//var fileNamesToSave = _.union(getIndexFileNames(scripts, 'src'), getIndexFileNames(styleLinks, 'href'));
//
//glob("www/lib/**", function (er, libFiles) {
//    console.log(libFiles.length);
//    console.log(fileNamesToSave.length);
//    var toDelete = _.difference(libFiles, fileNamesToSave);
//    console.log(toDelete.length)
//    toDelete.forEach(deleteFile);
//});
//
//function getIndexFileNames(els, nameAttr) {
//    return _.chain(els)
//        .map(function (el) {
//            var name = el.attribs[nameAttr];
//            return name && name.indexOf('lib/') !== -1 ? 'www/' + name : undefined;
//        })
//        .without(undefined)
//        .value();
//}
//
//function deleteFile(file) {
//    fs.stat(file, function(err, stat) {
//        if(!stat.isDirectory()) {
//            fs.unlink(file, function(error) {
//                error && console.log('Error deleting lib file!', err)
//            });
//        }
//    });
//}
