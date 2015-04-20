/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    window.isTesting = true;

    angular.module('app')
        .constant('appConfig', {
            api: {
                endpoint: 'http://akveo.com/pinder/'
            }
        });


})(angular);