/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    window.isTesting = true;

//    var baseUrl = 'http://localhost:3300/';
    var baseUrl = 'http://46.183.165.188/';

    angular.module('app')
        .constant('appConfig', {
            api: {
                baseUrl: baseUrl,
                endpoint: baseUrl,
                socketPath: '/socket.io',
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
                gcmId: '165099633205',
                devPush: false
            },
            ga: {
                trackingId: 'UA-66152232-1'
            }
        });



})(angular);