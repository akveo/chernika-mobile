/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    angular.module('app.auth', [])
        .config(authConfig);

    authConfig.$inject = ['$stateProvider'];
    function authConfig($stateProvider) {
        $stateProvider
            .state('login', {
                url: "/login",
                templateUrl: "modules/auth/login.html",
                controller: 'DeviceLoginController'
            })
    }

})(angular);
