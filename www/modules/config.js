/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    window.isTesting = true;

    angular.module('app')
        .constant('appConfig', {
            api: {
                endpoint: 'http://akveo.com/pinder/',
                socketPath: '/pinder/socket.io',
//                endpoint: '/pinder/',
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