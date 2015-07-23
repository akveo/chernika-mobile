/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    window.isTesting = true;

    var baseUrl = 'http://localhost:3300/';
//    var baseUrl = 'http://akveo.com/';

    angular.module('app')
        .constant('appConfig', {
            api: {
                baseUrl: baseUrl,
//                endpoint: baseUrl + 'pinder/',
                endpoint: baseUrl,
                socketPath: '/socket.io',
//                socketPath: '/pinder/socket.io',
                accessHeader: 'Access-Token',
                tokenLocalStorageKey: 'pinderSession'
            },
            cropFactor: {
                width: 300,
                height: 300
            },
            swiper: {
                cardFooterHeight: 37,
                cardVerticalOffset: 12
            },
            settings: {
                agesMinDistance: 4
            },
            ionic: {
                appId: '52e42ca3',
                apiKey: '7ab0ed289078bababcf259dbb7e01645e2ecada5bd9ac14d',
                devPush: true
            }
        });



})(angular);