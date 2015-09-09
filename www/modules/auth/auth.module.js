/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    angular.module('app.auth', ['app.util', 'app.api', 'ngCookies'])
        .config(authConfig);

    authConfig.$inject = ['$stateProvider'];
    function authConfig($stateProvider) {
        $stateProvider
            .state('login', {
                url: "/login",
                templateUrl: "modules/auth/login.html",
                controller: 'DeviceLoginController',
                onEnter: onLoginEnter
            })
    }

    onLoginEnter.$inject = ['$ionicHistory']
    function onLoginEnter($ionicHistory) {
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        localStorage.clear();
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    }

})(angular);
