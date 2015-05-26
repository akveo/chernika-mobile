/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    window.isTesting = true;

    var baseUrl = 'http://localhost:3300/';

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
            }
        });


})(angular);