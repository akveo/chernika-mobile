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
                //endpoint: '/pinder/',
                accessHeader: 'Access-Token',
                tokenLocalStorageKey: 'pinderSession'
            },
            cropFactor: {
                width: 298,
                height: 261
            },
            settings: {
                agesMinDistance: 4
            }
        });


})(angular);